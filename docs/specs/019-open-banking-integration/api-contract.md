# API Contract — Spec 019 Open Banking Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                         |
| Spec ID         | 019                                                                                                                                                                   |
| Módulo          | Open Banking Integration                                                                                                                                              |
| Documento       | API Contract                                                                                                                                                          |
| Ruta            | `docs/specs/019-open-banking-integration/api-contract.md`                                                                                                             |
| Versión         | 0.1                                                                                                                                                                   |
| Estado          | needs-review                                                                                                                                                          |
| Fecha           | 2026-07-23                                                                                                                                                            |
| Documento base  | `docs/specs/019-open-banking-integration/spec.md`                                                                                                                     |
| Plan técnico    | `docs/specs/019-open-banking-integration/plan.md`                                                                                                                     |
| Modelo de datos | `docs/specs/019-open-banking-integration/data-model.md`                                                                                                               |
| API Style       | REST                                                                                                                                                                  |
| API Version     | `/api/v1`                                                                                                                                                             |
| Naturaleza      | Tenant-scoped / Consent-driven / Bank-connection-aware / Provider-agnostic / Sync-driven / Transaction-import-aware / Reconciliation-ready / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el contrato REST del módulo `019-open-banking-integration`.

El contrato cubre endpoints, permisos, DTOs, filtros, respuestas, errores, reglas de autenticación, autorización, multitenancy, consentimiento, sincronización, webhooks, idempotencia, reportes, auditoría, observabilidad, OpenAPI e integración con los módulos financieros de RESIDENT Core.

Regla central:

```text id="urhbm4"
Toda API de Open Banking Integration debe ser tenant-scoped, consent-driven, read-only en MVP, provider-agnostic, token-safe, idempotente, audit-heavy, reconciliation-ready, libre de credenciales bancarias, libre de tokens expuestos, sin payment initiation, sin endpoints públicos administrativos y sin acceso desde WordPress a información bancaria.
```

---

## 3. Principios generales de la API

### 3.1. Base path

```text id="qdj9yg"
/api/v1
```

---

### 3.2. Superficies de API

El módulo expone cuatro superficies:

```text id="b4b92e"
1. Platform API
2. Tenant Admin API
3. Webhook API
4. Reports API
```

---

### 3.3. Platform API

Para administración de proveedores Open Banking soportados por RESIDENT:

```text id="wc43le"
/api/v1/platform/open-banking-provider-definitions
```

Requiere permisos platform.

---

### 3.4. Tenant Admin API

Para configuración, consentimiento, conexiones, cuentas externas, sincronizaciones, movimientos y administración operativa por tenant:

```text id="kh3wgu"
/api/v1/tenant/open-banking/configs
/api/v1/tenant/open-banking/consents
/api/v1/tenant/open-banking/connections
/api/v1/tenant/open-banking/account-links
/api/v1/tenant/open-banking/sync-runs
/api/v1/tenant/open-banking/account-snapshots
/api/v1/tenant/open-banking/transactions
/api/v1/tenant/open-banking/webhook-events
```

Requiere autenticación, tenant activo, membership activa y permisos financieros.

---

### 3.5. Webhook API

Para eventos técnicos provenientes del proveedor Open Banking:

```text id="jt6xwi"
/api/v1/webhooks/open-banking/{providerKey}
```

El endpoint puede estar expuesto a internet, pero no es una API pública funcional para usuarios. Solo debe aceptar eventos verificables, firmados e idempotentes.

---

### 3.6. Reports API

Para reportes administrativos tenant-scoped:

```text id="sp426q"
/api/v1/tenant/open-banking/reports
```

Requiere permisos financieros y no debe exponer secretos, tokens, números completos de cuenta ni payloads completos.

---

### 3.7. Own API

No se define API `/me` para Open Banking MVP.

Regla:

```text id="k30fq7"
Los propietarios y residentes no consultan conexiones bancarias, saldos bancarios, movimientos bancarios, webhooks ni reportes Open Banking en MVP.
```

---

## 4. Autenticación

### 4.1. Endpoints autenticados

Todos los endpoints `platform` y `tenant` requieren:

```http id="n8er8e"
Authorization: Bearer <access_token>
```

---

### 4.2. Responsabilidad de autenticación y autorización

```text id="vkk7x1"
Keycloak autentica usuarios.
RESIDENT Core autoriza usuarios, tenants, roles, permisos, recursos y reglas financieras.
Open Banking Integration valida eventos externos firmados.
```

---

### 4.3. Webhook endpoint

El endpoint de webhook no usa sesión de usuario.

Debe validar:

```text id="t0xtfw"
- providerKey soportado;
- firma si el proveedor la soporta;
- timestamp si el proveedor lo soporta;
- raw body íntegro;
- payloadHash;
- replay protection;
- providerEventId idempotente;
- tenant/config/connection resoluble;
- evento compatible con el estado de la conexión.
```

---

## 5. Tenant efectivo

### 5.1. Tenant Admin API

El tenant efectivo se obtiene desde el contexto autenticado:

```text id="qdo457"
currentTenant.id
```

Prohibido aceptar `tenantId` desde body, query o path para operaciones tenant-scoped.

---

### 5.2. Platform API

La Platform API no usa `tenantId` para provider definitions porque estas son platform-scoped.

---

### 5.3. Webhook API

El tenant se resuelve desde el evento y la configuración del proveedor:

```text id="bfaxae"
providerKey
providerEventId
providerConnectionId
providerConsentId
externalAccountId
tenantOpenBankingConfig
bankConnection
signature verification context
```

Si el tenant no puede resolverse de forma segura:

```text id="hv2ph7"
- no crear sync;
- no crear movimientos;
- no vincular cuentas;
- no enviar nada a conciliación;
- registrar evento técnico sanitizado si aplica;
- responder sin revelar existencia de tenants.
```

---

## 6. Formato general

### 6.1. JSON

Requests y responses usan JSON `camelCase`.

La base de datos usa `snake_case`.

---

### 6.2. Fechas

Fechas en ISO 8601.

```text id="w7rodi"
2026-07-23T10:30:00-05:00
```

Internamente se normaliza a UTC.

---

### 6.3. Dinero

Montos como string decimal.

```json id="r7olfp"
{
  "amount": "125.50",
  "currency": "USD"
}
```

Prohibido usar `number`, `float` o `double` como fuente de verdad monetaria.

---

### 6.4. Paginación

Parámetros estándar:

```text id="n4jt2u"
page
pageSize
sortBy
sortOrder
```

Reglas:

```text id="wr1phb"
page >= 1
pageSize default = 20
pageSize max = 100
sortOrder = asc | desc
```

---

### 6.5. Respuesta estándar

```json id="d6po5k"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 6.6. Error estándar

```json id="hit488"
{
  "error": {
    "code": "BANK_CONNECTION_NOT_FOUND",
    "message": "Bank connection not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 7. Headers

### 7.1. Headers generales

```http id="qjgcxo"
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
X-Request-Id: <request-id>
X-Correlation-Id: <correlation-id>
Idempotency-Key: <idempotency-key>
```

---

### 7.2. Headers de webhook

Los nombres exactos dependen del proveedor. El contrato interno debe abstraerlos.

Ejemplo conceptual:

```http id="zpu55h"
Content-Type: application/json
X-Open-Banking-Signature: <signature>
X-Open-Banking-Timestamp: <timestamp>
X-Open-Banking-Event-Id: <event-id>
```

Reglas:

```text id="h84hd9"
- conservar raw body solo en memoria para verificación;
- no registrar firma completa en logs;
- no registrar payload completo;
- calcular payloadHash;
- calcular payloadHashPrefix;
- calcular signatureHeaderHash si se requiere trazabilidad.
```

---

## 8. Idempotencia

### 8.1. Operaciones idempotentes

Deben soportar `Idempotency-Key` o idempotencia lógica equivalente:

```text id="nb4ni3"
- crear BankConsent;
- iniciar autorización bancaria;
- confirmar autorización;
- crear BankConnection;
- sincronizar cuentas;
- sincronizar saldos;
- sincronizar movimientos;
- reprocesar webhook;
- enviar movimiento a Bank Reconciliation;
- reintentar sync;
- revocar conexión;
- exportar reporte persistido.
```

---

### 8.2. Reglas

```text id="zx65z0"
- misma Idempotency-Key con payload lógico equivalente retorna mismo resultado;
- misma Idempotency-Key con payload distinto retorna conflicto;
- mismo providerEventId no procesa dos veces;
- mismo externalTransactionId no crea dos movimientos;
- mismo fingerprint no crea dos movimientos;
- mismo OpenBankingTransaction no se envía dos veces a Bank Reconciliation;
- mismo BankConnection no ejecuta dos syncs running del mismo tipo simultáneamente.
```

---

## 9. Seguridad transversal

### 9.1. Reglas obligatorias

```text id="vb61w7"
- no aceptar tenantId desde body;
- no aceptar actor fields desde body;
- no aceptar status directo salvo endpoints de transición;
- no almacenar usuario bancario;
- no almacenar contraseña bancaria;
- no almacenar OTP;
- no almacenar MFA secret;
- no almacenar raw access token;
- no almacenar raw refresh token;
- no exponer tokenSecretRef en DTO no autorizado;
- no exponer refreshTokenSecretRef;
- no exponer credentialSecretRef en superficies no autorizadas;
- no exponer webhookSecretRef;
- no exponer número completo de cuenta;
- no exponer raw provider payload;
- no exponer raw webhook signature;
- no iniciar pagos bancarios en MVP;
- no crear Payment desde movimiento Open Banking;
- no actualizar Account Statements directamente;
- no marcar conciliación bancaria final automáticamente;
- no permitir WordPress bank access;
- no enviar datos bancarios reales a IA externa;
- no crear endpoints públicos administrativos.
```

---

### 9.2. Datos bancarios prohibidos

Prohibido recibir, persistir, devolver, registrar o auditar:

```text id="jn5e2z"
bank username
bank password
OTP
MFA secret
security questions
raw access token
raw refresh token
raw client secret
raw webhook secret
full account number
full provider payload
full webhook signature
Authorization header
cookies
storageKey
signedUrl persistente
SQL raw
stack trace en producción
```

---

### 9.3. Respuesta ante cross-tenant

Recomendación general:

```text id="rdsy6g"
Responder 404 para recursos pertenecientes a otro tenant.
```

Puede usarse 403 si la política del módulo lo exige, pero nunca se debe revelar existencia de recursos externos.

---

## 10. Permisos

### 10.1. Provider definitions

```text id="xk9isc"
openBankingProviderDefinitions.create
openBankingProviderDefinitions.read
openBankingProviderDefinitions.update
openBankingProviderDefinitions.activate
openBankingProviderDefinitions.deprecate
openBankingProviderDefinitions.archive
```

---

### 10.2. Tenant configs

```text id="p4tosa"
tenantOpenBankingConfigs.create
tenantOpenBankingConfigs.read
tenantOpenBankingConfigs.update
tenantOpenBankingConfigs.enable
tenantOpenBankingConfigs.disable
tenantOpenBankingConfigs.testConnection
tenantOpenBankingConfigs.archive
```

---

### 10.3. Consents

```text id="ub3mry"
openBankingConsents.create
openBankingConsents.read
openBankingConsents.authorize
openBankingConsents.renew
openBankingConsents.revoke
openBankingConsents.archive
```

---

### 10.4. Connections

```text id="v02vlj"
openBankingConnections.create
openBankingConnections.read
openBankingConnections.update
openBankingConnections.revoke
openBankingConnections.disable
openBankingConnections.archive
```

---

### 10.5. Account links

```text id="s6al78"
openBankingAccountLinks.create
openBankingAccountLinks.read
openBankingAccountLinks.link
openBankingAccountLinks.unlink
openBankingAccountLinks.disable
openBankingAccountLinks.archive
```

---

### 10.6. Sync

```text id="r7m8g5"
openBankingSync.start
openBankingSync.read
openBankingSync.retry
openBankingSync.cancel
openBankingSync.archive
```

---

### 10.7. Transactions

```text id="umovjy"
openBankingTransactions.read
openBankingTransactions.review
openBankingTransactions.ignore
openBankingTransactions.sendToReconciliation
openBankingTransactions.archive
```

---

### 10.8. Webhooks

```text id="f8bl7x"
openBankingWebhooks.read
openBankingWebhooks.reprocess
openBankingWebhooks.archive
```

---

### 10.9. Reports

```text id="evgoov"
openBankingReports.read
openBankingReports.export
```

---

### 10.10. Audit

```text id="tg6kwt"
openBanking.audit.read
```

---

## 11. Enums expuestos por API

### 11.1. `OpenBankingProviderDefinitionStatus`

```text id="wk1vuz"
draft
active
inactive
deprecated
archived
```

---

### 11.2. `OpenBankingEnvironment`

```text id="vozrnu"
sandbox
production
```

---

### 11.3. `TenantOpenBankingConfigStatus`

```text id="m0n5pw"
draft
enabled
disabled
invalid
archived
```

---

### 11.4. `BankConsentStatus`

```text id="dx80uf"
draft
pendingAuthorization
authorized
expired
revoked
failed
archived
```

---

### 11.5. `BankConsentScope`

```text id="e3afky"
accountsRead
balancesRead
transactionsRead
identityRead
paymentsInitiate
```

MVP permitido:

```text id="qpt7l3"
accountsRead
balancesRead
transactionsRead
```

MVP prohibido:

```text id="oyau6w"
paymentsInitiate
```

---

### 11.6. `BankConnectionStatus`

```text id="h8gv8p"
pendingAuthorization
active
syncing
reauthorizationRequired
failed
revoked
disabled
archived
```

---

### 11.7. `BankAccountLinkStatus`

```text id="dbxz5t"
pendingLink
linked
unlinked
disabled
archived
```

---

### 11.8. `OpenBankingSyncType`

```text id="g4xl68"
accounts
balances
transactions
full
```

---

### 11.9. `OpenBankingSyncStatus`

```text id="u2p7rr"
queued
running
completed
completedWithWarnings
failed
cancelled
archived
```

---

### 11.10. `OpenBankingSyncTriggerType`

```text id="kkeg7x"
manual
scheduled
webhook
system
```

MVP recomendado:

```text id="pj9rlt"
manual
webhook
```

---

### 11.11. `OpenBankingTransactionStatus`

```text id="qp8q7h"
imported
duplicate
sentToReconciliation
rejected
ignored
requiresReview
archived
```

---

### 11.12. `OpenBankingTransactionDirection`

```text id="r7r27e"
credit
debit
neutral
```

---

### 11.13. `OpenBankingTransactionType`

```text id="cz9lwe"
deposit
transferIn
transferOut
withdrawal
bankFee
interest
reversal
adjustment
paymentProviderSettlement
unknown
other
```

---

### 11.14. `OpenBankingWebhookSignatureStatus`

```text id="mpme4s"
notVerified
verified
invalid
missing
unsupported
```

---

### 11.15. `OpenBankingWebhookProcessingStatus`

```text id="s0sdrp"
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

### 11.16. `Currency`

```text id="f6wahm"
USD
```

---

# 12. API — Platform Open Banking Provider Definitions

## 12.1. `GET /api/v1/platform/open-banking-provider-definitions`

Lista proveedores Open Banking soportados por la plataforma.

### Permiso

```text id="bqdb1m"
openBankingProviderDefinitions.read
```

### Query params

```text id="qy48xa"
providerKey
status
supportsAccountInfo
supportsBalances
supportsTransactions
supportsWebhooks
supportsConsentRenewal
supportsPaymentInitiation
country
currency
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="dcar4h"
{
  "data": [
    {
      "id": "provider_definition_uuid",
      "providerKey": "mockOpenBanking",
      "displayName": "Mock Open Banking",
      "description": "Proveedor mock para desarrollo y pruebas",
      "status": "active",
      "supportedEnvironments": ["sandbox"],
      "supportedCapabilities": ["accountsRead", "balancesRead", "transactionsRead"],
      "supportedCountries": ["EC"],
      "supportedCurrencies": ["USD"],
      "supportsAccountInfo": true,
      "supportsBalances": true,
      "supportsTransactions": true,
      "supportsWebhooks": true,
      "supportsConsentRenewal": true,
      "supportsPaymentInitiation": false,
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

## 12.2. `POST /api/v1/platform/open-banking-provider-definitions`

Crea una definición de proveedor Open Banking.

### Permiso

```text id="w8r5ca"
openBankingProviderDefinitions.create
```

### Request body

```json id="jpr7se"
{
  "providerKey": "mockOpenBanking",
  "displayName": "Mock Open Banking",
  "description": "Proveedor mock para desarrollo y pruebas",
  "supportedEnvironments": ["sandbox"],
  "supportedCapabilities": ["accountsRead", "balancesRead", "transactionsRead"],
  "supportedCountries": ["EC"],
  "supportedCurrencies": ["USD"],
  "supportsAccountInfo": true,
  "supportsBalances": true,
  "supportsTransactions": true,
  "supportsWebhooks": true,
  "supportsConsentRenewal": true,
  "supportsPaymentInitiation": false,
  "metadata": {
    "adapter": "mock"
  }
}
```

### Reglas

```text id="qhad3w"
- providerKey único;
- providerKey estable;
- no credenciales tenant;
- no secretos;
- no tokens;
- no payment initiation en MVP;
- status inicial draft salvo decisión explícita;
- audita openBankingProviderDefinition.created.
```

### Response `201`

```json id="a25joo"
{
  "data": {
    "id": "provider_definition_uuid",
    "providerKey": "mockOpenBanking",
    "displayName": "Mock Open Banking",
    "status": "draft",
    "supportedEnvironments": ["sandbox"],
    "supportedCapabilities": ["accountsRead", "balancesRead", "transactionsRead"],
    "supportedCountries": ["EC"],
    "supportedCurrencies": ["USD"],
    "supportsAccountInfo": true,
    "supportsBalances": true,
    "supportsTransactions": true,
    "supportsWebhooks": true,
    "supportsConsentRenewal": true,
    "supportsPaymentInitiation": false,
    "createdAt": "2026-07-23T10:00:00Z",
    "updatedAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="ftbrtr"
tenantId
credentialSecret
webhookSecret
tokenSecret
refreshTokenSecret
raw provider secret
status
createdBy
updatedBy
createdAt
updatedAt
```

---

## 12.3. `GET /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}`

Obtiene una definición de proveedor.

### Permiso

```text id="oknnt8"
openBankingProviderDefinitions.read
```

### Response `200`

Devuelve `OpenBankingProviderDefinitionDto`.

---

## 12.4. `PATCH /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}`

Actualiza metadata no sensible de la definición.

### Permiso

```text id="ikll06"
openBankingProviderDefinitions.update
```

### Request body

```json id="q3mpva"
{
  "displayName": "Mock Open Banking",
  "description": "Proveedor mock actualizado",
  "supportedCapabilities": ["accountsRead", "balancesRead", "transactionsRead"],
  "supportsAccountInfo": true,
  "supportsBalances": true,
  "supportsTransactions": true,
  "supportsWebhooks": true,
  "metadata": {
    "adapter": "mock"
  }
}
```

### Response `200`

Devuelve `OpenBankingProviderDefinitionDto`.

---

## 12.5. `POST /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/activate`

Activa una definición.

### Permiso

```text id="z2d8ww"
openBankingProviderDefinitions.activate
```

### Request body

```json id="ma3dt0"
{
  "reason": "Proveedor validado para sandbox"
}
```

### Response `200`

```json id="td1u2m"
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

## 12.6. `POST /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/deprecate`

Marca proveedor como deprecado.

### Permiso

```text id="ktq3yd"
openBankingProviderDefinitions.deprecate
```

### Request body

```json id="ckz57n"
{
  "reason": "Proveedor reemplazado por nueva versión"
}
```

### Response `200`

```json id="ldrb4c"
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

## 12.7. `POST /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/archive`

Archiva definición.

### Permiso

```text id="xmte10"
openBankingProviderDefinitions.archive
```

### Request body

```json id="qy42ul"
{
  "reason": "Proveedor histórico archivado"
}
```

### Response `200`

```json id="di52hw"
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

# 13. API — Tenant Open Banking Configs

## 13.1. `GET /api/v1/tenant/open-banking/configs`

Lista configuraciones Open Banking del tenant.

### Permiso

```text id="kour2w"
tenantOpenBankingConfigs.read
```

### Query params

```text id="jm3l80"
providerKey
environment
status
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

```json id="x6bs6n"
{
  "data": [
    {
      "id": "tenant_open_banking_config_uuid",
      "providerDefinitionId": "provider_definition_uuid",
      "providerKey": "mockOpenBanking",
      "environment": "sandbox",
      "status": "enabled",
      "displayName": "Conexión bancaria",
      "credentialSecretConfigured": true,
      "webhookSecretConfigured": true,
      "publicConfig": {
        "brandLabel": "Conexión segura"
      },
      "callbackUrl": "https://app.resident.example/open-banking/callback",
      "webhookEndpointPath": "/api/v1/webhooks/open-banking/mockOpenBanking",
      "allowedOrigins": ["https://app.resident.example"],
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

```text id="mcmays"
credentialSecretRef
webhookSecretRef
secret values
tokenSecretRef
refreshTokenSecretRef
tokens raw
```

---

## 13.2. `POST /api/v1/tenant/open-banking/configs`

Crea configuración Open Banking para el tenant.

### Permiso

```text id="ufgplj"
tenantOpenBankingConfigs.create
```

### Request body

```json id="zn5lza"
{
  "providerDefinitionId": "provider_definition_uuid",
  "providerKey": "mockOpenBanking",
  "environment": "sandbox",
  "displayName": "Conexión bancaria",
  "credentialSecretInput": {
    "mode": "secretRef",
    "secretRef": "secret://tenant/demo/open-banking/mock/credentials"
  },
  "webhookSecretInput": {
    "mode": "secretRef",
    "secretRef": "secret://tenant/demo/open-banking/mock/webhook"
  },
  "publicConfig": {
    "brandLabel": "Conexión segura"
  },
  "callbackUrl": "https://app.resident.example/open-banking/callback",
  "allowedOrigins": [
    "https://app.resident.example"
  ],
  "metadata": {
    "notes": "Configuración sandbox"
  }
}
```

### Reglas

```text id="vmaxga"
- providerDefinition debe existir y estar active para habilitar;
- providerKey debe coincidir con providerDefinition;
- secret values no deben persistirse en tabla;
- si se recibe secretValue, debe transformarse inmediatamente en SecretRef;
- status inicial draft o disabled;
- no habilita automáticamente salvo decisión explícita;
- no permite payment initiation en MVP;
- audita tenantOpenBankingConfig.created.
```

### Response `201`

```json id="wpgtlk"
{
  "data": {
    "id": "tenant_open_banking_config_uuid",
    "providerDefinitionId": "provider_definition_uuid",
    "providerKey": "mockOpenBanking",
    "environment": "sandbox",
    "status": "draft",
    "displayName": "Conexión bancaria",
    "credentialSecretConfigured": true,
    "webhookSecretConfigured": true,
    "publicConfig": {
      "brandLabel": "Conexión segura"
    },
    "callbackUrl": "https://app.resident.example/open-banking/callback",
    "webhookEndpointPath": "/api/v1/webhooks/open-banking/mockOpenBanking",
    "createdAt": "2026-07-23T10:00:00Z",
    "updatedAt": "2026-07-23T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="lk656b"
tenantId
credentialSecret value en metadata
webhookSecret value en metadata
tokenSecretRef
refreshTokenSecretRef
bank username
bank password
OTP
MFA secret
status
createdBy
enabledBy
archivedBy
createdAt
updatedAt
```

---

## 13.3. `GET /api/v1/tenant/open-banking/configs/{configId}`

Obtiene configuración del tenant.

### Permiso

```text id="nxznd2"
tenantOpenBankingConfigs.read
```

### Response `200`

Devuelve `TenantOpenBankingConfigDto`.

---

## 13.4. `PATCH /api/v1/tenant/open-banking/configs/{configId}`

Actualiza configuración no sensible.

### Permiso

```text id="hf9gct"
tenantOpenBankingConfigs.update
```

### Request body

```json id="np4hkc"
{
  "displayName": "Conexión bancaria actualizada",
  "publicConfig": {
    "brandLabel": "Conexión bancaria segura"
  },
  "callbackUrl": "https://app.resident.example/open-banking/callback",
  "allowedOrigins": [
    "https://app.resident.example"
  ],
  "metadata": {
    "notes": "Actualización operativa"
  }
}
```

### Reglas

```text id="yz9x49"
- no cambia providerKey;
- no cambia tenantId;
- no cambia status directo;
- no actualiza tokens;
- no acepta credenciales bancarias de usuario;
- no acepta payment initiation;
- audita tenantOpenBankingConfig.updated.
```

### Response `200`

Devuelve `TenantOpenBankingConfigDto`.

---

## 13.5. `POST /api/v1/tenant/open-banking/configs/{configId}/enable`

Habilita configuración.

### Permiso

```text id="wwalmd"
tenantOpenBankingConfigs.enable
```

### Request body

```json id="a1l9dy"
{
  "reason": "Credenciales validadas y proveedor activo"
}
```

### Reglas

```text id="yerigx"
- config debe pertenecer al tenant;
- provider definition debe estar active;
- SecretRefs requeridos deben estar configurados;
- webhookSecret debe estar configurado si provider soporta webhooks firmados;
- puede ejecutar testConnection antes de habilitar;
- no habilita payment initiation;
- audita tenantOpenBankingConfig.enabled.
```

### Response `200`

```json id="cqmmt5"
{
  "data": {
    "id": "tenant_open_banking_config_uuid",
    "status": "enabled",
    "enabledAt": "2026-07-23T10:15:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.6. `POST /api/v1/tenant/open-banking/configs/{configId}/disable`

Deshabilita configuración.

### Permiso

```text id="zke6mz"
tenantOpenBankingConfigs.disable
```

### Request body

```json id="cl3n8n"
{
  "reason": "Mantenimiento del proveedor"
}
```

### Response `200`

```json id="j68azu"
{
  "data": {
    "id": "tenant_open_banking_config_uuid",
    "status": "disabled",
    "disabledAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.7. `POST /api/v1/tenant/open-banking/configs/{configId}/test-connection`

Prueba conexión de configuración.

### Permiso

```text id="wou661"
tenantOpenBankingConfigs.testConnection
```

### Request body

```json id="nyxgfc"
{
  "mode": "safe",
  "reason": "Validación previa a habilitación"
}
```

### Reglas

```text id="ib2r1y"
- no expone secretos;
- no loggea respuestas completas del proveedor;
- no inicia pagos;
- no consulta datos reales sin consentimiento;
- usa ambiente sandbox para pruebas MVP;
- audita tenantOpenBankingConfig.tested.
```

### Response `200`

```json id="n8t7wm"
{
  "data": {
    "id": "tenant_open_banking_config_uuid",
    "providerKey": "mockOpenBanking",
    "environment": "sandbox",
    "connectionStatus": "ok",
    "testedAt": "2026-07-23T11:10:00Z",
    "details": {
      "supportsAccountInfo": true,
      "supportsBalances": true,
      "supportsTransactions": true,
      "supportsWebhooks": true
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.8. `POST /api/v1/tenant/open-banking/configs/{configId}/archive`

Archiva configuración.

### Permiso

```text id="vqx9wx"
tenantOpenBankingConfigs.archive
```

### Request body

```json id="y4f655"
{
  "reason": "Proveedor reemplazado"
}
```

### Response `200`

```json id="p1pbcd"
{
  "data": {
    "id": "tenant_open_banking_config_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 14. API — Bank Consents

## 14.1. `GET /api/v1/tenant/open-banking/consents`

Lista consentimientos del tenant.

### Permiso

```text id="jqa5vp"
openBankingConsents.read
```

### Query params

```text id="ihnxlf"
configId
providerKey
status
scope
authorizedFrom
authorizedTo
expiresFrom
expiresTo
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="ki46kp"
{
  "data": [
    {
      "id": "bank_consent_uuid",
      "tenantOpenBankingConfigId": "tenant_open_banking_config_uuid",
      "providerKey": "mockOpenBanking",
      "providerConsentId": "consent_123",
      "status": "authorized",
      "scope": ["accountsRead", "balancesRead", "transactionsRead"],
      "consentType": "tenantBankAccountAccess",
      "authorizationMethod": "redirect",
      "termsAcceptedVersion": "2026-07",
      "authorizedAt": "2026-07-23T10:20:00Z",
      "expiresAt": "2026-10-21T10:20:00Z",
      "revokedAt": null,
      "createdAt": "2026-07-23T10:10:00Z",
      "updatedAt": "2026-07-23T10:20:00Z"
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

## 14.2. `POST /api/v1/tenant/open-banking/consents`

Crea consentimiento en estado inicial.

### Permiso

```text id="di87uk"
openBankingConsents.create
```

### Request body

```json id="ehact7"
{
  "tenantOpenBankingConfigId": "tenant_open_banking_config_uuid",
  "scope": ["accountsRead", "balancesRead", "transactionsRead"],
  "consentType": "tenantBankAccountAccess",
  "termsAcceptedVersion": "2026-07",
  "metadata": {
    "authorizationContext": "Cuenta bancaria del conjunto"
  }
}
```

### Reglas

```text id="qo3zov"
- config debe pertenecer al tenant;
- config debe estar enabled para iniciar autorización posterior;
- scope MVP no debe incluir paymentsInitiate;
- no se aceptan credenciales bancarias;
- status inicial draft;
- audita bankConsent.created.
```

### Response `201`

```json id="zzig2w"
{
  "data": {
    "id": "bank_consent_uuid",
    "tenantOpenBankingConfigId": "tenant_open_banking_config_uuid",
    "providerKey": "mockOpenBanking",
    "status": "draft",
    "scope": ["accountsRead", "balancesRead", "transactionsRead"],
    "consentType": "tenantBankAccountAccess",
    "termsAcceptedVersion": "2026-07",
    "createdAt": "2026-07-23T10:10:00Z",
    "updatedAt": "2026-07-23T10:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Rechazar

```text id="yw6421"
tenantId
authorizedBy
authorizedAt
providerConsentId manual si no proviene del adapter
status
bank username
bank password
OTP
MFA secret
tokenSecretRef
refreshTokenSecretRef
paymentsInitiate en MVP
```

---

## 14.3. `GET /api/v1/tenant/open-banking/consents/{consentId}`

Obtiene consentimiento.

### Permiso

```text id="uuzqm5"
openBankingConsents.read
```

### Response `200`

Devuelve `BankConsentDto`.

---

## 14.4. `POST /api/v1/tenant/open-banking/consents/{consentId}/start-authorization`

Inicia flujo de autorización bancaria.

### Permiso

```text id="dxr218"
openBankingConsents.authorize
```

### Request body

```json id="f20faz"
{
  "returnUrl": "https://app.resident.example/open-banking/return",
  "cancelUrl": "https://app.resident.example/open-banking/cancel",
  "metadata": {
    "clientFlow": "admin"
  }
}
```

### Reglas

```text id="u3wj15"
- consentimiento debe pertenecer al tenant;
- consentimiento debe estar draft o expired renovable;
- config debe estar enabled;
- provider debe soportar autorización;
- authorizationUrl temporal solo se devuelve en respuesta inmediata;
- authorizationUrl no se guarda completa;
- authorizationUrl no aparece en logs ni auditoría;
- audita bankConsent.authorizationStarted.
```

### Response `200`

```json id="uenebn"
{
  "data": {
    "id": "bank_consent_uuid",
    "status": "pendingAuthorization",
    "providerKey": "mockOpenBanking",
    "authorizationUrl": "https://openbanking.example/authorize/session_123",
    "authorizationUrlExpiresAt": "2026-07-23T10:40:00Z",
    "createdAt": "2026-07-23T10:10:00Z",
    "updatedAt": "2026-07-23T10:15:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Nota:

```text id="dmfe7x"
authorizationUrl solo puede devolverse en esta respuesta inmediata a un usuario autorizado. No debe aparecer en listados, logs, auditoría ni reportes.
```

---

## 14.5. `POST /api/v1/tenant/open-banking/consents/{consentId}/renew`

Renueva consentimiento expirado o próximo a expirar.

### Permiso

```text id="uzxxvy"
openBankingConsents.renew
```

### Request body

```json id="ld9boh"
{
  "reason": "Renovación de consentimiento próximo a expirar"
}
```

### Response `200`

```json id="g2ezq3"
{
  "data": {
    "id": "bank_consent_uuid",
    "status": "pendingAuthorization",
    "renewedAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.6. `POST /api/v1/tenant/open-banking/consents/{consentId}/revoke`

Revoca consentimiento.

### Permiso

```text id="zdh05j"
openBankingConsents.revoke
```

### Request body

```json id="n5ihf4"
{
  "reason": "El tenant revoca acceso bancario"
}
```

### Reglas

```text id="sgqpr7"
- requiere razón;
- debe revocar conexiones dependientes si aplica;
- debe invalidar syncs futuros;
- debe revocar tokens en proveedor si el adapter lo soporta;
- no elimina historial;
- audita bankConsent.revoked y bankConnection.revoked si aplica.
```

### Response `200`

```json id="cwpcc9"
{
  "data": {
    "id": "bank_consent_uuid",
    "status": "revoked",
    "revokedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.7. `POST /api/v1/tenant/open-banking/consents/{consentId}/archive`

Archiva consentimiento histórico.

### Permiso

```text id="ykc5qr"
openBankingConsents.archive
```

### Request body

```json id="hweiyi"
{
  "reason": "Consentimiento histórico archivado"
}
```

### Response `200`

```json id="msawhg"
{
  "data": {
    "id": "bank_consent_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T13:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 15. API — Bank Connections

## 15.1. `GET /api/v1/tenant/open-banking/connections`

Lista conexiones bancarias del tenant.

### Permiso

```text id="tjilkm"
openBankingConnections.read
```

### Query params

```text id="k1jjcr"
configId
consentId
providerKey
status
institutionName
country
currency
lastSuccessfulSyncFrom
lastSuccessfulSyncTo
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="vtv43d"
{
  "data": [
    {
      "id": "bank_connection_uuid",
      "tenantOpenBankingConfigId": "tenant_open_banking_config_uuid",
      "bankConsentId": "bank_consent_uuid",
      "providerKey": "mockOpenBanking",
      "providerConnectionId": "conn_123",
      "status": "active",
      "connectionName": "Cuenta principal del conjunto",
      "institutionName": "Banco Demo",
      "institutionCode": "BANKDEMO",
      "country": "EC",
      "currency": "USD",
      "lastSuccessfulSyncAt": "2026-07-23T11:00:00Z",
      "lastFailedSyncAt": null,
      "failureReason": null,
      "authorizedAt": "2026-07-23T10:20:00Z",
      "createdAt": "2026-07-23T10:20:00Z",
      "updatedAt": "2026-07-23T11:00:00Z"
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

```text id="v584zy"
tokenSecretRef
refreshTokenSecretRef
raw access token
raw refresh token
credenciales bancarias
número completo de cuenta
```

---

## 15.2. `GET /api/v1/tenant/open-banking/connections/{connectionId}`

Obtiene conexión bancaria.

### Permiso

```text id="k4mu4e"
openBankingConnections.read
```

### Response `200`

Devuelve `BankConnectionDto`.

---

## 15.3. `PATCH /api/v1/tenant/open-banking/connections/{connectionId}`

Actualiza metadata no sensible de la conexión.

### Permiso

```text id="jyuxbr"
openBankingConnections.update
```

### Request body

```json id="a8s0g8"
{
  "connectionName": "Cuenta principal actualizada",
  "metadata": {
    "notes": "Conexión usada para ingresos del conjunto"
  }
}
```

### Reglas

```text id="sjdfmy"
- no actualiza tokens;
- no cambia tenantId;
- no cambia providerConnectionId manualmente;
- no cambia status directo;
- no acepta credenciales bancarias.
```

### Response `200`

Devuelve `BankConnectionDto`.

---

## 15.4. `POST /api/v1/tenant/open-banking/connections/{connectionId}/revoke`

Revoca conexión bancaria.

### Permiso

```text id="d7ltqc"
openBankingConnections.revoke
```

### Request body

```json id="cnpcir"
{
  "reason": "Revocación solicitada por el tenant"
}
```

### Reglas

```text id="pc71sy"
- requiere razón;
- conexión debe pertenecer al tenant;
- revoca token en proveedor si aplica;
- bloquea syncs futuros;
- conserva historial;
- audita bankConnection.revoked.
```

### Response `200`

```json id="u0fh14"
{
  "data": {
    "id": "bank_connection_uuid",
    "status": "revoked",
    "revokedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.5. `POST /api/v1/tenant/open-banking/connections/{connectionId}/disable`

Deshabilita conexión sin revocar consentimiento en proveedor.

### Permiso

```text id="jig1kq"
openBankingConnections.disable
```

### Request body

```json id="my8jl2"
{
  "reason": "Pausa administrativa de sincronizaciones"
}
```

### Response `200`

```json id="j7wqt9"
{
  "data": {
    "id": "bank_connection_uuid",
    "status": "disabled",
    "disabledAt": "2026-07-23T12:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 15.6. `POST /api/v1/tenant/open-banking/connections/{connectionId}/archive`

Archiva conexión histórica.

### Permiso

```text id="mqqk0c"
openBankingConnections.archive
```

### Request body

```json id="vge9ue"
{
  "reason": "Conexión histórica archivada"
}
```

### Response `200`

```json id="d2w9d1"
{
  "data": {
    "id": "bank_connection_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T13:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 16. API — Bank Account Links

## 16.1. `GET /api/v1/tenant/open-banking/account-links`

Lista cuentas externas descubiertas y vínculos con cuentas internas.

### Permiso

```text id="owuody"
openBankingAccountLinks.read
```

### Query params

```text id="rnazld"
connectionId
bankAccountId
providerKey
status
currency
externalAccountType
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="aad2rl"
{
  "data": [
    {
      "id": "bank_account_link_uuid",
      "bankConnectionId": "bank_connection_uuid",
      "bankAccountId": "bank_account_uuid",
      "providerKey": "mockOpenBanking",
      "externalAccountName": "Cuenta Corriente Principal",
      "externalAccountType": "checking",
      "accountNumberMasked": "****1234",
      "currency": "USD",
      "status": "linked",
      "linkedAt": "2026-07-23T10:45:00Z",
      "unlinkedAt": null,
      "createdAt": "2026-07-23T10:30:00Z",
      "updatedAt": "2026-07-23T10:45:00Z"
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

```text id="scpmds"
externalAccountId salvo permiso técnico explícito
externalAccountIdHash
accountNumberHash
número completo de cuenta
tokens
```

---

## 16.2. `POST /api/v1/tenant/open-banking/account-links`

Crea vínculo pendiente manual o registra cuenta externa descubierta.

### Permiso

```text id="pd5yrn"
openBankingAccountLinks.create
```

### Request body

```json id="nyd7no"
{
  "bankConnectionId": "bank_connection_uuid",
  "externalAccountId": "external_account_123",
  "externalAccountName": "Cuenta Corriente Principal",
  "externalAccountType": "checking",
  "accountNumberMasked": "****1234",
  "currency": "USD",
  "metadata": {
    "discoverySource": "manual"
  }
}
```

### Reglas

```text id="nepvzg"
- bankConnection debe pertenecer al tenant;
- externalAccountId se recibe solo en flujos administrativos/controlados;
- accountNumberMasked permitido;
- full account number prohibido;
- status inicial pendingLink;
- dedupe por externalAccountIdHash;
- audita bankAccountLink.discovered.
```

### Response `201`

```json id="oi5jbi"
{
  "data": {
    "id": "bank_account_link_uuid",
    "bankConnectionId": "bank_connection_uuid",
    "bankAccountId": null,
    "providerKey": "mockOpenBanking",
    "externalAccountName": "Cuenta Corriente Principal",
    "externalAccountType": "checking",
    "accountNumberMasked": "****1234",
    "currency": "USD",
    "status": "pendingLink",
    "createdAt": "2026-07-23T10:30:00Z",
    "updatedAt": "2026-07-23T10:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.3. `GET /api/v1/tenant/open-banking/account-links/{accountLinkId}`

Obtiene vínculo de cuenta externa.

### Permiso

```text id="gdcvlw"
openBankingAccountLinks.read
```

### Response `200`

Devuelve `BankAccountLinkDto`.

---

## 16.4. `POST /api/v1/tenant/open-banking/account-links/{accountLinkId}/link-bank-account`

Vincula cuenta externa con `BankAccount` interno de `017-bank-reconciliation`.

### Permiso

```text id="j9ooxl"
openBankingAccountLinks.link
```

### Request body

```json id="zg2ax3"
{
  "bankAccountId": "bank_account_uuid",
  "reason": "Cuenta externa corresponde a la cuenta bancaria principal del conjunto"
}
```

### Reglas

```text id="hws07g"
- BankAccountLink debe pertenecer al tenant;
- BankAccount debe pertenecer al tenant;
- BankAccount no debe estar archived;
- no crear BankAccount automáticamente sin confirmación humana;
- status pasa a linked;
- audita bankAccountLink.linked.
```

### Response `200`

```json id="gu3egf"
{
  "data": {
    "id": "bank_account_link_uuid",
    "bankAccountId": "bank_account_uuid",
    "status": "linked",
    "linkedAt": "2026-07-23T10:45:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.5. `POST /api/v1/tenant/open-banking/account-links/{accountLinkId}/unlink-bank-account`

Desvincula cuenta externa de cuenta interna.

### Permiso

```text id="fg3n59"
openBankingAccountLinks.unlink
```

### Request body

```json id="h50v6m"
{
  "reason": "La cuenta fue vinculada incorrectamente"
}
```

### Response `200`

```json id="cel417"
{
  "data": {
    "id": "bank_account_link_uuid",
    "bankAccountId": null,
    "status": "unlinked",
    "unlinkedAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.6. `POST /api/v1/tenant/open-banking/account-links/{accountLinkId}/disable`

Deshabilita vínculo para sincronización.

### Permiso

```text id="wo03yy"
openBankingAccountLinks.disable
```

### Request body

```json id="uqfp8h"
{
  "reason": "Cuenta no usada para conciliación"
}
```

### Response `200`

```json id="v1p5n0"
{
  "data": {
    "id": "bank_account_link_uuid",
    "status": "disabled",
    "disabledAt": "2026-07-23T11:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.7. `POST /api/v1/tenant/open-banking/account-links/{accountLinkId}/archive`

Archiva vínculo.

### Permiso

```text id="t8o8ji"
openBankingAccountLinks.archive
```

### Request body

```json id="bo12ng"
{
  "reason": "Cuenta externa histórica"
}
```

### Response `200`

```json id="zi8w8l"
{
  "data": {
    "id": "bank_account_link_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 17. API — Sync Runs

## 17.1. `GET /api/v1/tenant/open-banking/sync-runs`

Lista ejecuciones de sincronización.

### Permiso

```text id="sfanbd"
openBankingSync.read
```

### Query params

```text id="sb4gws"
connectionId
accountLinkId
providerKey
syncType
status
triggerType
periodStart
periodEnd
startedFrom
startedTo
completedFrom
completedTo
failedFrom
failedTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="x8b85r"
{
  "data": [
    {
      "id": "sync_run_uuid",
      "bankConnectionId": "bank_connection_uuid",
      "bankAccountLinkId": "bank_account_link_uuid",
      "providerKey": "mockOpenBanking",
      "syncType": "transactions",
      "status": "completed",
      "triggerType": "manual",
      "periodStart": "2026-07-01T00:00:00Z",
      "periodEnd": "2026-07-31T23:59:59Z",
      "startedAt": "2026-07-23T11:00:00Z",
      "completedAt": "2026-07-23T11:00:05Z",
      "retryCount": 0,
      "accountsFound": 0,
      "balancesFound": 0,
      "transactionsFound": 32,
      "transactionsImported": 30,
      "transactionsDuplicated": 2,
      "transactionsRejected": 0,
      "warningsCount": 0,
      "errorCode": null,
      "errorMessage": null,
      "createdAt": "2026-07-23T11:00:00Z",
      "updatedAt": "2026-07-23T11:00:05Z"
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

## 17.2. `POST /api/v1/tenant/open-banking/connections/{connectionId}/sync`

Inicia sincronización manual.

### Permiso

```text id="x9o2oq"
openBankingSync.start
```

### Request body

```json id="qcgzty"
{
  "syncType": "transactions",
  "bankAccountLinkId": "bank_account_link_uuid",
  "periodStart": "2026-07-01T00:00:00Z",
  "periodEnd": "2026-07-31T23:59:59Z",
  "forceRefresh": false,
  "metadata": {
    "reason": "Conciliación de julio 2026"
  }
}
```

### Reglas

```text id="vv7nu9"
- BankConnection debe pertenecer al tenant;
- BankConnection debe estar active;
- BankConsent debe estar authorized y vigente;
- TenantOpenBankingConfig debe estar enabled;
- sync de transactions requiere periodo;
- periodStart <= periodEnd;
- periodo máximo recomendado 90 días;
- no ejecutar dos syncs running del mismo tipo por conexión;
- sync debe ser idempotente;
- no duplica movimientos;
- audita openBankingSync.started/completed/failed.
```

### Response `202`

```json id="t2g0d6"
{
  "data": {
    "id": "sync_run_uuid",
    "bankConnectionId": "bank_connection_uuid",
    "bankAccountLinkId": "bank_account_link_uuid",
    "providerKey": "mockOpenBanking",
    "syncType": "transactions",
    "status": "running",
    "triggerType": "manual",
    "periodStart": "2026-07-01T00:00:00Z",
    "periodEnd": "2026-07-31T23:59:59Z",
    "startedAt": "2026-07-23T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

Nota:

```text id="ckqqos"
En MVP puede procesarse de forma síncrona o semisíncrona. El contrato usa 202 para permitir evolución hacia jobs.
```

---

## 17.3. `GET /api/v1/tenant/open-banking/sync-runs/{syncRunId}`

Obtiene detalle de sync run.

### Permiso

```text id="iup626"
openBankingSync.read
```

### Response `200`

Devuelve `OpenBankingSyncRunDto`.

---

## 17.4. `POST /api/v1/tenant/open-banking/sync-runs/{syncRunId}/retry`

Reintenta sincronización fallida.

### Permiso

```text id="o19eat"
openBankingSync.retry
```

### Request body

```json id="j2p036"
{
  "reason": "Error temporal del proveedor corregido"
}
```

### Reglas

```text id="i6f8l7"
- solo failed o completedWithWarnings según política;
- mantiene idempotencia;
- no duplica movimientos;
- crea nuevo SyncRun con retryOfSyncRunId;
- audita openBankingSync.retried.
```

### Response `202`

```json id="peksvj"
{
  "data": {
    "id": "new_sync_run_uuid",
    "retryOfSyncRunId": "previous_sync_run_uuid",
    "status": "queued",
    "retryCount": 1
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 17.5. `POST /api/v1/tenant/open-banking/sync-runs/{syncRunId}/cancel`

Cancela sync queued/running si la implementación lo permite.

### Permiso

```text id="xndw36"
openBankingSync.cancel
```

### Request body

```json id="kfsrf1"
{
  "reason": "Cancelado por el administrador financiero"
}
```

### Response `200`

```json id="px05ai"
{
  "data": {
    "id": "sync_run_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-07-23T11:05:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 17.6. `POST /api/v1/tenant/open-banking/sync-runs/{syncRunId}/archive`

Archiva sync run histórico.

### Permiso

```text id="qigh7e"
openBankingSync.archive
```

### Request body

```json id="hfigzr"
{
  "reason": "Sync histórico archivado"
}
```

### Response `200`

```json id="hn867t"
{
  "data": {
    "id": "sync_run_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 18. API — Account Snapshots

## 18.1. `GET /api/v1/tenant/open-banking/account-snapshots`

Lista snapshots de saldos bancarios externos.

### Permiso

```text id="z6w1d4"
openBankingSync.read
```

### Query params

```text id="zwwkkm"
connectionId
accountLinkId
bankAccountId
syncRunId
providerKey
currency
snapshotFrom
snapshotTo
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="r1ere6"
{
  "data": [
    {
      "id": "snapshot_uuid",
      "bankConnectionId": "bank_connection_uuid",
      "bankAccountLinkId": "bank_account_link_uuid",
      "bankAccountId": "bank_account_uuid",
      "syncRunId": "sync_run_uuid",
      "providerKey": "mockOpenBanking",
      "availableBalance": "1500.00",
      "currentBalance": "1500.00",
      "currency": "USD",
      "snapshotAt": "2026-07-23T11:00:05Z",
      "createdAt": "2026-07-23T11:00:05Z"
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

### Regla

```text id="s4iz6z"
Los snapshots son evidencia bancaria externa. No modifican Account Statements internos.
```

---

# 19. API — Open Banking Transactions

## 19.1. `GET /api/v1/tenant/open-banking/transactions`

Lista movimientos importados desde Open Banking.

### Permiso

```text id="k7sxcy"
openBankingTransactions.read
```

### Query params

```text id="ms049i"
connectionId
accountLinkId
bankAccountId
syncRunId
providerKey
status
transactionType
direction
amountMin
amountMax
currency
transactionDateFrom
transactionDateTo
postedDateFrom
postedDateTo
isDuplicate
sentToReconciliation
page
pageSize
sortBy
sortOrder
```

### Response `200`

```json id="f4eaa2"
{
  "data": [
    {
      "id": "open_banking_transaction_uuid",
      "bankConnectionId": "bank_connection_uuid",
      "bankAccountLinkId": "bank_account_link_uuid",
      "bankAccountId": "bank_account_uuid",
      "syncRunId": "sync_run_uuid",
      "providerKey": "mockOpenBanking",
      "transactionDate": "2026-07-15T00:00:00Z",
      "postedDate": "2026-07-15T00:00:00Z",
      "description": "Depósito transferencia",
      "reference": "REF-001",
      "bankReference": "BANK-REF-001",
      "direction": "credit",
      "amount": "125.50",
      "currency": "USD",
      "balanceAfter": "1500.00",
      "transactionType": "deposit",
      "status": "imported",
      "isDuplicate": false,
      "duplicateOfTransactionId": null,
      "sentToReconciliationAt": null,
      "bankTransactionId": null,
      "createdAt": "2026-07-23T11:00:05Z",
      "updatedAt": "2026-07-23T11:00:05Z"
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

```text id="rdsez5"
fingerprint
externalTransactionIdHash
external raw payload
número completo de cuenta
tokens
```

---

## 19.2. `GET /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}`

Obtiene movimiento Open Banking.

### Permiso

```text id="yzbf2s"
openBankingTransactions.read
```

### Response `200`

Devuelve `OpenBankingTransactionDto`.

---

## 19.3. `POST /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/send-to-reconciliation`

Envía movimiento a `017-bank-reconciliation`.

### Permiso

```text id="yu1zm1"
openBankingTransactions.sendToReconciliation
```

### Request body

```json id="gwjo24"
{
  "reason": "Movimiento listo para conciliación bancaria",
  "metadata": {
    "reconciliationSessionHint": "Julio 2026"
  }
}
```

### Reglas

```text id="sjlvgx"
- movimiento debe pertenecer al tenant;
- movimiento no debe ser duplicate;
- movimiento no debe estar archived;
- movimiento debe estar imported o requiresReview autorizado;
- BankAccountLink debe estar linked;
- BankAccount interno debe pertenecer al tenant;
- crear o vincular BankTransaction;
- no crear Payment;
- no crear ReconciliationMatch;
- no marcar conciliación final;
- audita openBankingTransaction.sentToReconciliation.
```

### Response `200`

```json id="yg9ol9"
{
  "data": {
    "id": "open_banking_transaction_uuid",
    "status": "sentToReconciliation",
    "bankTransactionId": "bank_transaction_uuid",
    "sentToReconciliationAt": "2026-07-23T11:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 19.4. `POST /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/ignore`

Marca movimiento como ignorado.

### Permiso

```text id="j5tmzy"
openBankingTransactions.ignore
```

### Request body

```json id="t52xf1"
{
  "reason": "Movimiento no relevante para conciliación"
}
```

### Response `200`

```json id="m3g5y5"
{
  "data": {
    "id": "open_banking_transaction_uuid",
    "status": "ignored",
    "ignoredAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 19.5. `POST /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/archive`

Archiva movimiento.

### Permiso

```text id="cbjjcg"
openBankingTransactions.archive
```

### Request body

```json id="vu02db"
{
  "reason": "Movimiento histórico archivado"
}
```

### Response `200`

```json id="a4ner0"
{
  "data": {
    "id": "open_banking_transaction_uuid",
    "status": "archived",
    "archivedAt": "2026-07-23T13:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 20. API — Webhook Endpoint

## 20.1. `POST /api/v1/webhooks/open-banking/{providerKey}`

Recibe webhook del proveedor Open Banking.

### Autenticación

No usa Bearer token de usuario.

### Seguridad obligatoria

```text id="s5g7gd"
provider signature required si provider lo soporta
timestamp validation si provider lo soporta
payloadHash
replay protection
providerEventId idempotency
safe error response
no raw payload in logs
no raw signature in logs
```

### Headers conceptuales

```http id="xwtyhp"
Content-Type: application/json
X-Open-Banking-Signature: <signature>
X-Open-Banking-Timestamp: <timestamp>
X-Open-Banking-Event-Id: <event-id>
```

### Request body

El body depende del proveedor. El adaptador debe parsearlo.

Ejemplo mock:

```json id="h36rm0"
{
  "eventId": "ob_evt_123",
  "eventType": "transactions.available",
  "providerKey": "mockOpenBanking",
  "providerConnectionId": "conn_123",
  "providerConsentId": "consent_123",
  "externalAccountId": "external_account_123",
  "periodStart": "2026-07-01T00:00:00Z",
  "periodEnd": "2026-07-31T23:59:59Z",
  "processedAt": "2026-07-23T11:00:00Z"
}
```

### Reglas

```text id="z2g85g"
- no confiar en IDs sin validación tenant/config/connection;
- validar firma antes de efectos;
- detectar duplicados;
- crear OpenBankingWebhookEvent;
- procesar evento según tipo;
- puede disparar sync webhook-triggered si la conexión está activa;
- no crear Payment;
- no crear conciliación final;
- no guardar raw payload completo;
- auditar.
```

### Response `200`

```json id="im0zl4"
{
  "received": true,
  "processed": true
}
```

### Response duplicado `200`

```json id="p8lh14"
{
  "received": true,
  "processed": false,
  "duplicate": true
}
```

### Response firma inválida `401` o `403`

```json id="keshlg"
{
  "error": {
    "code": "OPEN_BANKING_WEBHOOK_SIGNATURE_INVALID",
    "message": "Webhook signature is invalid.",
    "traceId": "req_123456"
  }
}
```

### No revelar

```text id="lusuv9"
si el tenant existe
si la conexión existe
si el consentimiento existe
secreto esperado
detalle interno de firma
stack trace
payload completo
```

---

# 21. API — Tenant Webhook Events

## 21.1. `GET /api/v1/tenant/open-banking/webhook-events`

Lista eventos webhook recibidos.

### Permiso

```text id="haj6d3"
openBankingWebhooks.read
```

### Query params

```text id="hn9h4a"
providerKey
configId
connectionId
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

```json id="dqrdhw"
{
  "data": [
    {
      "id": "webhook_event_uuid",
      "providerKey": "mockOpenBanking",
      "tenantOpenBankingConfigId": "tenant_open_banking_config_uuid",
      "bankConnectionId": "bank_connection_uuid",
      "providerEventId": "ob_evt_123",
      "eventType": "transactions.available",
      "signatureStatus": "verified",
      "processingStatus": "processed",
      "receivedAt": "2026-07-23T11:00:00Z",
      "processedAt": "2026-07-23T11:00:01Z",
      "payloadHashPrefix": "a1b2c3d4",
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

## 21.2. `GET /api/v1/tenant/open-banking/webhook-events/{webhookEventId}`

Obtiene evento webhook sanitizado.

### Permiso

```text id="uwjkld"
openBankingWebhooks.read
```

### Response `200`

Devuelve `OpenBankingWebhookEventDto`.

### No debe incluir

```text id="gd8f30"
raw payload
raw signature
webhook secret
tokens
credenciales bancarias
número completo de cuenta
```

---

## 21.3. `POST /api/v1/tenant/open-banking/webhook-events/{webhookEventId}/reprocess`

Reprocesa webhook fallido.

### Permiso

```text id="v5r9i7"
openBankingWebhooks.reprocess
```

### Request body

```json id="aunxb6"
{
  "reason": "Error temporal corregido"
}
```

### Reglas

```text id="nndx1x"
- evento debe pertenecer al tenant;
- solo failed puede reprocesarse ordinariamente;
- rejected por firma inválida no debe reprocesarse;
- duplicate no debe reprocesarse;
- processed no debe reprocesarse salvo flujo excepcional futuro;
- idempotencia se mantiene;
- incrementa retryCount;
- audita openBankingWebhook.reprocessed.
```

### Response `200`

```json id="y9g3vn"
{
  "data": {
    "id": "webhook_event_uuid",
    "processingStatus": "processed",
    "retryCount": 1,
    "processedAt": "2026-07-23T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 21.4. `POST /api/v1/tenant/open-banking/webhook-events/{webhookEventId}/archive`

Archiva evento webhook.

### Permiso

```text id="yl4038"
openBankingWebhooks.archive
```

### Request body

```json id="m07zpb"
{
  "reason": "Evento histórico archivado"
}
```

### Response `200`

```json id="qkuhdg"
{
  "data": {
    "id": "webhook_event_uuid",
    "processingStatus": "archived",
    "archivedAt": "2026-07-23T13:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 22. API — Reports

## 22.1. `GET /api/v1/tenant/open-banking/reports/summary`

Resumen de Open Banking del tenant.

### Permiso

```text id="yu3m50"
openBankingReports.read
```

### Query params

```text id="btjleg"
providerKey
environment
periodStart
periodEnd
currency
```

### Response `200`

```json id="riyv2g"
{
  "data": {
    "periodStart": "2026-07-01",
    "periodEnd": "2026-07-31",
    "providerKey": "mockOpenBanking",
    "environment": "sandbox",
    "activeConnections": 1,
    "authorizedConsents": 1,
    "revokedConsents": 0,
    "syncRuns": 5,
    "failedSyncRuns": 1,
    "transactionsImported": 120,
    "transactionsDuplicated": 8,
    "transactionsSentToReconciliation": 90,
    "lastSuccessfulSyncAt": "2026-07-23T11:00:00Z",
    "lastFailedSyncAt": "2026-07-22T11:00:00Z",
    "currency": "USD"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 22.2. `GET /api/v1/tenant/open-banking/reports/sync-status`

Reporte de estado de sincronización.

### Permiso

```text id="ewoycu"
openBankingReports.read
```

### Query params

```text id="xms18o"
providerKey
connectionStatus
syncStatus
periodStart
periodEnd
page
pageSize
```

### Response `200`

```json id="o1clcd"
{
  "data": [
    {
      "bankConnectionId": "bank_connection_uuid",
      "connectionName": "Cuenta principal del conjunto",
      "institutionName": "Banco Demo",
      "status": "active",
      "lastSuccessfulSyncAt": "2026-07-23T11:00:00Z",
      "lastFailedSyncAt": null,
      "failureReason": null,
      "reauthorizationRequired": false
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

## 22.3. `GET /api/v1/tenant/open-banking/reports/imported-transactions`

Reporte de movimientos importados.

### Permiso

```text id="app4tf"
openBankingReports.read
```

### Query params

```text id="qv8fpl"
providerKey
bankAccountId
status
direction
transactionType
periodStart
periodEnd
page
pageSize
```

### Response `200`

```json id="fi47rh"
{
  "data": [
    {
      "openBankingTransactionId": "open_banking_transaction_uuid",
      "bankAccountLinkId": "bank_account_link_uuid",
      "bankAccountId": "bank_account_uuid",
      "transactionDate": "2026-07-15T00:00:00Z",
      "description": "Depósito transferencia",
      "reference": "REF-001",
      "direction": "credit",
      "amount": "125.50",
      "currency": "USD",
      "status": "sentToReconciliation",
      "bankTransactionId": "bank_transaction_uuid",
      "sentToReconciliationAt": "2026-07-23T11:30:00Z"
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

## 22.4. `GET /api/v1/tenant/open-banking/reports/errors`

Reporte de errores.

### Permiso

```text id="f4cwm4"
openBankingReports.read
```

### Query params

```text id="vbpjbn"
providerKey
errorCode
syncType
periodStart
periodEnd
page
pageSize
```

### Response `200`

```json id="jw7qpx"
{
  "data": [
    {
      "syncRunId": "sync_run_uuid",
      "providerKey": "mockOpenBanking",
      "syncType": "transactions",
      "errorCode": "OPEN_BANKING_SYNC_PROVIDER_TIMEOUT",
      "errorMessage": "Provider timeout.",
      "failedAt": "2026-07-22T11:00:00Z",
      "retryCount": 1
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

## 22.5. `GET /api/v1/tenant/open-banking/reports/export`

Exporta reporte Open Banking.

### Permiso

```text id="yxo445"
openBankingReports.export
```

### Query params

```text id="ir76ha"
reportType
providerKey
periodStart
periodEnd
format
```

Valores:

```text id="h7cxq3"
reportType = summary | syncStatus | importedTransactions | errors
format = csv | xlsx | pdf
```

### Reglas

```text id="t2mxry"
- export tenant-scoped;
- si se persiste, usar Secure Document Storage;
- no exponer storageKey;
- no incluir secretos;
- no incluir tokens;
- no incluir raw payloads;
- no incluir números completos de cuenta;
- no incluir raw signatures;
- audita openBankingReport.exported.
```

### Response `200`

```json id="m1kkn0"
{
  "data": {
    "reportType": "importedTransactions",
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

# 23. Endpoints públicos prohibidos

No crear:

```text id="aysw4h"
GET  /api/v1/public/open-banking
GET  /api/v1/public/open-banking/connections
GET  /api/v1/public/open-banking/accounts
GET  /api/v1/public/open-banking/transactions
GET  /api/v1/public/open-banking/reports
POST /api/v1/public/open-banking/connect
POST /api/v1/public/open-banking/sync
GET  /api/v1/public/tenants/{slug}/open-banking
GET  /api/v1/public/tenants/{slug}/open-banking/connections
GET  /api/v1/public/tenants/{slug}/open-banking/transactions
```

Resultado esperado:

```text id="xk3y06"
404 route not found
```

Sin revelar:

```text id="x7qhcb"
si el tenant existe
si la integración está habilitada
si existen cuentas conectadas
si existen movimientos bancarios
si una cuenta tiene saldo
```

---

# 24. DTOs

## 24.1. `CreateOpenBankingProviderDefinitionDto`

```typescript id="v7kzhy"
type CreateOpenBankingProviderDefinitionDto = {
  providerKey: string;
  displayName: string;
  description?: string;
  supportedEnvironments: Array<"sandbox" | "production">;
  supportedCapabilities: Array<
    "accountsRead" | "balancesRead" | "transactionsRead" | "identityRead"
  >;
  supportedCountries?: string[];
  supportedCurrencies: Array<"USD">;
  supportsAccountInfo?: boolean;
  supportsBalances?: boolean;
  supportsTransactions?: boolean;
  supportsWebhooks?: boolean;
  supportsConsentRenewal?: boolean;
  supportsPaymentInitiation?: false;
  metadata?: Record<string, unknown>;
};
```

Regla:

```text id="q2kuvz"
supportsPaymentInitiation debe permanecer false en MVP.
```

---

## 24.2. `OpenBankingProviderDefinitionDto`

```typescript id="ezt060"
type OpenBankingProviderDefinitionDto = {
  id: string;
  providerKey: string;
  displayName: string;
  description?: string | null;
  status: string;
  supportedEnvironments: string[];
  supportedCapabilities: string[];
  supportedCountries?: string[];
  supportedCurrencies: string[];
  supportsAccountInfo: boolean;
  supportsBalances: boolean;
  supportsTransactions: boolean;
  supportsWebhooks: boolean;
  supportsConsentRenewal: boolean;
  supportsPaymentInitiation: boolean;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string | null;
  deprecatedAt?: string | null;
  archivedAt?: string | null;
  metadata?: Record<string, unknown>;
};
```

---

## 24.3. `CreateTenantOpenBankingConfigDto`

```typescript id="pe560g"
type CreateTenantOpenBankingConfigDto = {
  providerDefinitionId: string;
  providerKey: string;
  environment: "sandbox" | "production";
  displayName?: string;
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
  callbackUrl?: string;
  allowedOrigins?: string[];
  metadata?: Record<string, unknown>;
};
```

Regla:

```text id="kfjyg8"
Si secretValue se recibe, debe transformarse inmediatamente en SecretRef y nunca persistirse en PostgreSQL, logs ni auditoría.
```

---

## 24.4. `TenantOpenBankingConfigDto`

```typescript id="y8pm6a"
type TenantOpenBankingConfigDto = {
  id: string;
  providerDefinitionId: string;
  providerKey: string;
  environment: "sandbox" | "production";
  status: string;
  displayName?: string | null;
  credentialSecretConfigured: boolean;
  webhookSecretConfigured: boolean;
  publicConfig?: Record<string, unknown>;
  callbackUrl?: string | null;
  webhookEndpointPath?: string | null;
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

```text id="xbsr1g"
credentialSecretRef
webhookSecretRef
secret values
tokenSecretRef
refreshTokenSecretRef
tokens raw
```

---

## 24.5. `CreateBankConsentDto`

```typescript id="cnhcaa"
type CreateBankConsentDto = {
  tenantOpenBankingConfigId: string;
  scope: Array<"accountsRead" | "balancesRead" | "transactionsRead">;
  consentType?: "tenantBankAccountAccess" | "other";
  termsAcceptedVersion?: string;
  metadata?: Record<string, unknown>;
};
```

Prohibido:

```text id="a456gh"
paymentsInitiate
bank username
bank password
OTP
MFA secret
tokenSecretRef
refreshTokenSecretRef
status
authorizedBy
authorizedAt
```

---

## 24.6. `BankConsentDto`

```typescript id="i1n2rv"
type BankConsentDto = {
  id: string;
  tenantOpenBankingConfigId: string;
  providerKey: string;
  providerConsentId?: string | null;
  status: string;
  scope: string[];
  consentType?: string | null;
  authorizationMethod?: string | null;
  termsAcceptedVersion?: string | null;
  authorizedAt?: string | null;
  expiresAt?: string | null;
  renewedAt?: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};
```

---

## 24.7. `StartBankAuthorizationDto`

```typescript id="lhw9g4"
type StartBankAuthorizationDto = {
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
};
```

---

## 24.8. `StartBankAuthorizationResponseDto`

```typescript id="wejrlg"
type StartBankAuthorizationResponseDto = {
  id: string;
  status: "pendingAuthorization";
  providerKey: string;
  authorizationUrl?: string;
  authorizationUrlExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

Regla:

```text id="hc96yx"
authorizationUrl solo se permite en respuesta inmediata autorizada de start-authorization.
```

---

## 24.9. `BankConnectionDto`

```typescript id="a8msb2"
type BankConnectionDto = {
  id: string;
  tenantOpenBankingConfigId: string;
  bankConsentId: string;
  providerKey: string;
  providerConnectionId?: string | null;
  status: string;
  connectionName?: string | null;
  institutionName?: string | null;
  institutionCode?: string | null;
  country?: string | null;
  currency: "USD";
  lastSuccessfulSyncAt?: string | null;
  lastFailedSyncAt?: string | null;
  failureReason?: string | null;
  authorizedAt?: string | null;
  revokedAt?: string | null;
  disabledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};
```

No incluye tokens ni SecretRefs.

---

## 24.10. `BankAccountLinkDto`

```typescript id="bag9ba"
type BankAccountLinkDto = {
  id: string;
  bankConnectionId: string;
  bankAccountId?: string | null;
  providerKey: string;
  externalAccountName?: string | null;
  externalAccountType?: string | null;
  accountNumberMasked?: string | null;
  currency: "USD";
  status: string;
  linkedAt?: string | null;
  unlinkedAt?: string | null;
  disabledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};
```

---

## 24.11. `StartOpenBankingSyncDto`

```typescript id="n151jd"
type StartOpenBankingSyncDto = {
  syncType: "accounts" | "balances" | "transactions" | "full";
  bankAccountLinkId?: string;
  periodStart?: string;
  periodEnd?: string;
  forceRefresh?: boolean;
  metadata?: Record<string, unknown>;
};
```

Reglas:

```text id="pc4yty"
syncType=transactions requiere periodStart y periodEnd.
periodo máximo recomendado: 90 días.
```

---

## 24.12. `OpenBankingSyncRunDto`

```typescript id="hgoqtp"
type OpenBankingSyncRunDto = {
  id: string;
  bankConnectionId: string;
  bankAccountLinkId?: string | null;
  providerKey: string;
  syncType: string;
  status: string;
  triggerType: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  cancelledAt?: string | null;
  retryOfSyncRunId?: string | null;
  retryCount: number;
  accountsFound: number;
  balancesFound: number;
  transactionsFound: number;
  transactionsImported: number;
  transactionsDuplicated: number;
  transactionsRejected: number;
  warningsCount: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};
```

No incluye `syncCursor`.

---

## 24.13. `OpenBankingAccountSnapshotDto`

```typescript id="z17pc8"
type OpenBankingAccountSnapshotDto = {
  id: string;
  bankConnectionId: string;
  bankAccountLinkId: string;
  bankAccountId?: string | null;
  syncRunId: string;
  providerKey: string;
  availableBalance?: string | null;
  currentBalance?: string | null;
  currency: "USD";
  snapshotAt: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};
```

---

## 24.14. `OpenBankingTransactionDto`

```typescript id="f0ol70"
type OpenBankingTransactionDto = {
  id: string;
  bankConnectionId: string;
  bankAccountLinkId: string;
  bankAccountId?: string | null;
  syncRunId: string;
  providerKey: string;
  transactionDate: string;
  postedDate?: string | null;
  description?: string | null;
  reference?: string | null;
  bankReference?: string | null;
  direction: "credit" | "debit" | "neutral";
  amount: string;
  currency: "USD";
  balanceAfter?: string | null;
  transactionType: string;
  status: string;
  isDuplicate: boolean;
  duplicateOfTransactionId?: string | null;
  sentToReconciliationAt?: string | null;
  bankTransactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};
```

No incluye fingerprint, raw payload ni hash interno.

---

## 24.15. `OpenBankingWebhookEventDto`

```typescript id="ag7b6m"
type OpenBankingWebhookEventDto = {
  id: string;
  providerKey: string;
  tenantOpenBankingConfigId?: string | null;
  bankConnectionId?: string | null;
  providerEventId?: string | null;
  eventType?: string | null;
  signatureStatus: string;
  processingStatus: string;
  receivedAt: string;
  processedAt?: string | null;
  rejectedAt?: string | null;
  failedAt?: string | null;
  payloadHashPrefix: string;
  providerTimestamp?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  retryCount: number;
  lastRetryAt?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};
```

---

# 25. Matriz de endpoints

| Endpoint                                                        | Método | Permiso                                        | Audit event                                   |
| --------------------------------------------------------------- | -----: | ---------------------------------------------- | --------------------------------------------- |
| `/platform/open-banking-provider-definitions`                   |    GET | `openBankingProviderDefinitions.read`          | —                                             |
| `/platform/open-banking-provider-definitions`                   |   POST | `openBankingProviderDefinitions.create`        | `openBankingProviderDefinition.created`       |
| `/platform/open-banking-provider-definitions/{id}`              |    GET | `openBankingProviderDefinitions.read`          | —                                             |
| `/platform/open-banking-provider-definitions/{id}`              |  PATCH | `openBankingProviderDefinitions.update`        | `openBankingProviderDefinition.updated`       |
| `/platform/open-banking-provider-definitions/{id}/activate`     |   POST | `openBankingProviderDefinitions.activate`      | `openBankingProviderDefinition.activated`     |
| `/platform/open-banking-provider-definitions/{id}/deprecate`    |   POST | `openBankingProviderDefinitions.deprecate`     | `openBankingProviderDefinition.deprecated`    |
| `/platform/open-banking-provider-definitions/{id}/archive`      |   POST | `openBankingProviderDefinitions.archive`       | `openBankingProviderDefinition.archived`      |
| `/tenant/open-banking/configs`                                  |    GET | `tenantOpenBankingConfigs.read`                | —                                             |
| `/tenant/open-banking/configs`                                  |   POST | `tenantOpenBankingConfigs.create`              | `tenantOpenBankingConfig.created`             |
| `/tenant/open-banking/configs/{id}`                             |    GET | `tenantOpenBankingConfigs.read`                | —                                             |
| `/tenant/open-banking/configs/{id}`                             |  PATCH | `tenantOpenBankingConfigs.update`              | `tenantOpenBankingConfig.updated`             |
| `/tenant/open-banking/configs/{id}/enable`                      |   POST | `tenantOpenBankingConfigs.enable`              | `tenantOpenBankingConfig.enabled`             |
| `/tenant/open-banking/configs/{id}/disable`                     |   POST | `tenantOpenBankingConfigs.disable`             | `tenantOpenBankingConfig.disabled`            |
| `/tenant/open-banking/configs/{id}/test-connection`             |   POST | `tenantOpenBankingConfigs.testConnection`      | `tenantOpenBankingConfig.tested`              |
| `/tenant/open-banking/configs/{id}/archive`                     |   POST | `tenantOpenBankingConfigs.archive`             | `tenantOpenBankingConfig.archived`            |
| `/tenant/open-banking/consents`                                 |    GET | `openBankingConsents.read`                     | —                                             |
| `/tenant/open-banking/consents`                                 |   POST | `openBankingConsents.create`                   | `bankConsent.created`                         |
| `/tenant/open-banking/consents/{id}`                            |    GET | `openBankingConsents.read`                     | —                                             |
| `/tenant/open-banking/consents/{id}/start-authorization`        |   POST | `openBankingConsents.authorize`                | `bankConsent.authorizationStarted`            |
| `/tenant/open-banking/consents/{id}/renew`                      |   POST | `openBankingConsents.renew`                    | `bankConsent.renewed`                         |
| `/tenant/open-banking/consents/{id}/revoke`                     |   POST | `openBankingConsents.revoke`                   | `bankConsent.revoked`                         |
| `/tenant/open-banking/consents/{id}/archive`                    |   POST | `openBankingConsents.archive`                  | `bankConsent.archived`                        |
| `/tenant/open-banking/connections`                              |    GET | `openBankingConnections.read`                  | —                                             |
| `/tenant/open-banking/connections/{id}`                         |    GET | `openBankingConnections.read`                  | —                                             |
| `/tenant/open-banking/connections/{id}`                         |  PATCH | `openBankingConnections.update`                | `bankConnection.updated`                      |
| `/tenant/open-banking/connections/{id}/revoke`                  |   POST | `openBankingConnections.revoke`                | `bankConnection.revoked`                      |
| `/tenant/open-banking/connections/{id}/disable`                 |   POST | `openBankingConnections.disable`               | `bankConnection.disabled`                     |
| `/tenant/open-banking/connections/{id}/archive`                 |   POST | `openBankingConnections.archive`               | `bankConnection.archived`                     |
| `/tenant/open-banking/account-links`                            |    GET | `openBankingAccountLinks.read`                 | —                                             |
| `/tenant/open-banking/account-links`                            |   POST | `openBankingAccountLinks.create`               | `bankAccountLink.discovered`                  |
| `/tenant/open-banking/account-links/{id}`                       |    GET | `openBankingAccountLinks.read`                 | —                                             |
| `/tenant/open-banking/account-links/{id}/link-bank-account`     |   POST | `openBankingAccountLinks.link`                 | `bankAccountLink.linked`                      |
| `/tenant/open-banking/account-links/{id}/unlink-bank-account`   |   POST | `openBankingAccountLinks.unlink`               | `bankAccountLink.unlinked`                    |
| `/tenant/open-banking/account-links/{id}/disable`               |   POST | `openBankingAccountLinks.disable`              | `bankAccountLink.disabled`                    |
| `/tenant/open-banking/account-links/{id}/archive`               |   POST | `openBankingAccountLinks.archive`              | `bankAccountLink.archived`                    |
| `/tenant/open-banking/sync-runs`                                |    GET | `openBankingSync.read`                         | —                                             |
| `/tenant/open-banking/connections/{id}/sync`                    |   POST | `openBankingSync.start`                        | `openBankingSync.started`                     |
| `/tenant/open-banking/sync-runs/{id}`                           |    GET | `openBankingSync.read`                         | —                                             |
| `/tenant/open-banking/sync-runs/{id}/retry`                     |   POST | `openBankingSync.retry`                        | `openBankingSync.retried`                     |
| `/tenant/open-banking/sync-runs/{id}/cancel`                    |   POST | `openBankingSync.cancel`                       | `openBankingSync.cancelled`                   |
| `/tenant/open-banking/sync-runs/{id}/archive`                   |   POST | `openBankingSync.archive`                      | `openBankingSync.archived`                    |
| `/tenant/open-banking/account-snapshots`                        |    GET | `openBankingSync.read`                         | —                                             |
| `/tenant/open-banking/transactions`                             |    GET | `openBankingTransactions.read`                 | —                                             |
| `/tenant/open-banking/transactions/{id}`                        |    GET | `openBankingTransactions.read`                 | —                                             |
| `/tenant/open-banking/transactions/{id}/send-to-reconciliation` |   POST | `openBankingTransactions.sendToReconciliation` | `openBankingTransaction.sentToReconciliation` |
| `/tenant/open-banking/transactions/{id}/ignore`                 |   POST | `openBankingTransactions.ignore`               | `openBankingTransaction.ignored`              |
| `/tenant/open-banking/transactions/{id}/archive`                |   POST | `openBankingTransactions.archive`              | `openBankingTransaction.archived`             |
| `/webhooks/open-banking/{providerKey}`                          |   POST | Provider signature                             | `openBankingWebhook.received`                 |
| `/tenant/open-banking/webhook-events`                           |    GET | `openBankingWebhooks.read`                     | —                                             |
| `/tenant/open-banking/webhook-events/{id}`                      |    GET | `openBankingWebhooks.read`                     | —                                             |
| `/tenant/open-banking/webhook-events/{id}/reprocess`            |   POST | `openBankingWebhooks.reprocess`                | `openBankingWebhook.reprocessed`              |
| `/tenant/open-banking/webhook-events/{id}/archive`              |   POST | `openBankingWebhooks.archive`                  | `openBankingWebhook.archived`                 |
| `/tenant/open-banking/reports/summary`                          |    GET | `openBankingReports.read`                      | —                                             |
| `/tenant/open-banking/reports/sync-status`                      |    GET | `openBankingReports.read`                      | —                                             |
| `/tenant/open-banking/reports/imported-transactions`            |    GET | `openBankingReports.read`                      | —                                             |
| `/tenant/open-banking/reports/errors`                           |    GET | `openBankingReports.read`                      | —                                             |
| `/tenant/open-banking/reports/export`                           |    GET | `openBankingReports.export`                    | `openBankingReport.exported`                  |

---

# 26. Códigos de error

## 26.1. Generales

```text id="ps19ge"
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 26.2. Provider definitions

```text id="zlfux0"
OPEN_BANKING_PROVIDER_DEFINITION_NOT_FOUND
OPEN_BANKING_PROVIDER_DEFINITION_FORBIDDEN
OPEN_BANKING_PROVIDER_DEFINITION_INVALID_STATUS
OPEN_BANKING_PROVIDER_DEFINITION_ARCHIVED
OPEN_BANKING_PROVIDER_UNSUPPORTED
OPEN_BANKING_PROVIDER_DEPRECATED
```

---

## 26.3. Tenant configs

```text id="t4t519"
TENANT_OPEN_BANKING_CONFIG_NOT_FOUND
TENANT_OPEN_BANKING_CONFIG_FORBIDDEN
TENANT_OPEN_BANKING_CONFIG_INVALID_STATUS
TENANT_OPEN_BANKING_CONFIG_DISABLED
TENANT_OPEN_BANKING_CONFIG_INVALID
TENANT_OPEN_BANKING_CONFIG_ARCHIVED
TENANT_OPEN_BANKING_SECRET_INVALID
TENANT_OPEN_BANKING_CONNECTION_FAILED
```

---

## 26.4. Bank consents

```text id="l8gx3c"
BANK_CONSENT_NOT_FOUND
BANK_CONSENT_FORBIDDEN
BANK_CONSENT_INVALID_STATUS
BANK_CONSENT_EXPIRED
BANK_CONSENT_REVOKED
BANK_CONSENT_SCOPE_UNSUPPORTED
BANK_CONSENT_AUTHORIZATION_FAILED
BANK_CONSENT_RENEWAL_REQUIRED
```

---

## 26.5. Bank connections

```text id="pcz5o7"
BANK_CONNECTION_NOT_FOUND
BANK_CONNECTION_FORBIDDEN
BANK_CONNECTION_INVALID_STATUS
BANK_CONNECTION_REVOKED
BANK_CONNECTION_DISABLED
BANK_CONNECTION_REAUTHORIZATION_REQUIRED
BANK_CONNECTION_TOKEN_EXPIRED
BANK_CONNECTION_PROVIDER_ERROR
```

---

## 26.6. Account links

```text id="dtj90e"
BANK_ACCOUNT_LINK_NOT_FOUND
BANK_ACCOUNT_LINK_FORBIDDEN
BANK_ACCOUNT_LINK_INVALID_STATUS
BANK_ACCOUNT_LINK_CROSS_TENANT_REFERENCE
BANK_ACCOUNT_LINK_ALREADY_LINKED
BANK_ACCOUNT_LINK_ACCOUNT_MISMATCH
```

---

## 26.7. Sync

```text id="hmuwux"
OPEN_BANKING_SYNC_NOT_FOUND
OPEN_BANKING_SYNC_FORBIDDEN
OPEN_BANKING_SYNC_INVALID_STATUS
OPEN_BANKING_SYNC_ALREADY_RUNNING
OPEN_BANKING_SYNC_PERIOD_INVALID
OPEN_BANKING_SYNC_PROVIDER_TIMEOUT
OPEN_BANKING_SYNC_PROVIDER_RATE_LIMITED
OPEN_BANKING_SYNC_FAILED
```

---

## 26.8. Transactions

```text id="lpjc16"
OPEN_BANKING_TRANSACTION_NOT_FOUND
OPEN_BANKING_TRANSACTION_FORBIDDEN
OPEN_BANKING_TRANSACTION_DUPLICATE
OPEN_BANKING_TRANSACTION_INVALID_STATUS
OPEN_BANKING_TRANSACTION_CROSS_TENANT_REFERENCE
OPEN_BANKING_TRANSACTION_ALREADY_SENT_TO_RECONCILIATION
OPEN_BANKING_TRANSACTION_RECONCILIATION_FAILED
```

---

## 26.9. Webhooks

```text id="y56icl"
OPEN_BANKING_WEBHOOK_SIGNATURE_MISSING
OPEN_BANKING_WEBHOOK_SIGNATURE_INVALID
OPEN_BANKING_WEBHOOK_TIMESTAMP_EXPIRED
OPEN_BANKING_WEBHOOK_REPLAY_DETECTED
OPEN_BANKING_WEBHOOK_DUPLICATE
OPEN_BANKING_WEBHOOK_PAYLOAD_INVALID
OPEN_BANKING_WEBHOOK_PROCESSING_FAILED
```

---

## 26.10. Security

```text id="wl5ktq"
BANK_CREDENTIAL_STORAGE_FORBIDDEN
RAW_TOKEN_EXPOSURE_FORBIDDEN
RAW_PROVIDER_PAYLOAD_FORBIDDEN
PAYMENT_INITIATION_FORBIDDEN
PUBLIC_OPEN_BANKING_ENDPOINT_FORBIDDEN
EXTERNAL_AI_BANK_DATA_FORBIDDEN
```

---

# 27. Integración con `017-bank-reconciliation`

## 27.1. Regla

```text id="kpquaz"
Open Banking sincroniza movimientos bancarios; Bank Reconciliation confirma la conciliación.
```

---

## 27.2. Envío a conciliación

`send-to-reconciliation` debe:

```text id="h5j6yo"
- validar tenant;
- validar BankAccountLink linked;
- validar BankAccount tenant-scoped;
- crear o vincular BankTransaction;
- conservar sourceModule=openBankingIntegration;
- marcar OpenBankingTransaction sentToReconciliation;
- no confirmar candidatos;
- no crear matches;
- no marcar conciliación final.
```

---

## 27.3. Datos hacia Bank Reconciliation

```text id="y8q22h"
tenantId
bankAccountId
sourceModule=openBankingIntegration
sourceResourceType=openBankingTransaction
sourceResourceId
transactionDate
postedDate
description
reference
bankReference
transactionType
direction
amount
currency
balanceAfter
fingerprint
metadata segura
```

---

# 28. Integración con `005-payments`

## 28.1. Regla

```text id="h3aybx"
Open Banking no crea Payments en MVP.
```

---

## 28.2. Uso permitido

Open Banking puede permitir:

```text id="oqs7en"
- comparar movimientos sincronizados con pagos existentes;
- identificar posibles depósitos;
- identificar pagos provider-verified pendientes de conciliación bancaria;
- alimentar candidatos de Bank Reconciliation.
```

---

# 29. Integración con `018-payment-provider-integration`

## 29.1. Settlement detection

Si un movimiento Open Banking parece liquidación de proveedor:

```text id="ncayqs"
transactionType = paymentProviderSettlement
```

Debe cruzarse con `ProviderSettlementRecord` solo como apoyo de conciliación.

---

## 29.2. Regla

```text id="zst65d"
Un settlement detectado por Open Banking no confirma automáticamente conciliación ni pago.
```

---

# 30. Integración con `006-account-statements`

## 30.1. Regla

```text id="rwb5d6"
Account Statements se actualiza por Payments internos, no por OpenBankingTransaction.
```

---

## 30.2. Uso permitido

Reportar diferencias entre:

```text id="z1nt1t"
saldo bancario externo
vs
saldo financiero interno
```

Sin mezclar fuentes de verdad.

---

# 31. Integración con `016-secure-document-storage`

## 31.1. Usos

```text id="nbmtyu"
- evidencia documental de consentimiento si aplica;
- exports de reportes;
- evidencia técnica resumida.
```

---

## 31.2. Clasificación sugerida

Para consentimiento:

```json id="hul9ey"
{
  "category": "administrativeDocument",
  "sourceModule": "openBankingIntegration",
  "sourceResourceType": "bankConsent",
  "sensitivity": "restricted",
  "visibility": "administrative",
  "ownerType": "tenant"
}
```

Para export de reporte:

```json id="r9isr2"
{
  "category": "reportExport",
  "sourceModule": "openBankingIntegration",
  "sourceResourceType": "openBankingReportExport",
  "sensitivity": "restricted",
  "visibility": "administrative",
  "ownerType": "tenant"
}
```

### Reglas

```text id="tgzf97"
- no exponer storageKey;
- no guardar tokens como documentos ordinarios;
- no guardar payloads completos sensibles;
- descargas requieren autorización;
- descargas se auditan.
```

---

# 32. Auditoría

## 32.1. Eventos obligatorios

```text id="x6eg2j"
openBankingProviderDefinition.created
openBankingProviderDefinition.updated
openBankingProviderDefinition.activated
openBankingProviderDefinition.deprecated
openBankingProviderDefinition.archived

tenantOpenBankingConfig.created
tenantOpenBankingConfig.updated
tenantOpenBankingConfig.enabled
tenantOpenBankingConfig.disabled
tenantOpenBankingConfig.tested
tenantOpenBankingConfig.invalidated
tenantOpenBankingConfig.archived

bankConsent.created
bankConsent.authorizationStarted
bankConsent.authorized
bankConsent.renewed
bankConsent.expired
bankConsent.revoked
bankConsent.failed
bankConsent.archived

bankConnection.created
bankConnection.authorized
bankConnection.syncing
bankConnection.failed
bankConnection.reauthorizationRequired
bankConnection.revoked
bankConnection.disabled
bankConnection.archived

bankAccountLink.discovered
bankAccountLink.linked
bankAccountLink.unlinked
bankAccountLink.disabled
bankAccountLink.archived

openBankingSync.started
openBankingSync.completed
openBankingSync.completedWithWarnings
openBankingSync.failed
openBankingSync.cancelled
openBankingSync.retried
openBankingSync.archived

openBankingTransaction.imported
openBankingTransaction.duplicateDetected
openBankingTransaction.rejected
openBankingTransaction.requiresReview
openBankingTransaction.ignored
openBankingTransaction.sentToReconciliation
openBankingTransaction.archived

openBankingWebhook.received
openBankingWebhook.verified
openBankingWebhook.rejected
openBankingWebhook.duplicate
openBankingWebhook.processed
openBankingWebhook.failed
openBankingWebhook.reprocessed
openBankingWebhook.archived

openBankingReport.exported
```

---

## 32.2. Metadata permitida

```text id="tnstet"
providerKey
environment
tenantOpenBankingConfigId
bankConsentId
bankConnectionId
bankAccountLinkId
bankAccountId
syncRunId
openBankingTransactionId
bankTransactionId
providerEventId
externalAccountIdHash
externalTransactionId
amount
currency
status
syncType
triggerType
outcome
traceId
```

---

## 32.3. Metadata prohibida

```text id="k26it6"
bank username
bank password
OTP
MFA secret
raw access token
raw refresh token
raw client secret
raw webhook secret
full account number
full provider payload
full webhook signature
Authorization header
cookies
storageKey
signedUrl
SQL raw
stack trace
datos personales completos innecesarios
```

---

# 33. Observabilidad

## 33.1. Logs seguros

Eventos sugeridos:

```text id="vj14kj"
openBankingConfig.enabled
bankConsent.authorized
bankConnection.active
openBankingSync.started
openBankingSync.completed
openBankingSync.failed
openBankingTransaction.imported
openBankingTransaction.duplicateDetected
openBankingTransaction.sentToReconciliation
openBankingWebhook.rejected
```

Campos permitidos:

```text id="e4y2ic"
traceId
requestId
correlationId
action
outcome
providerKey
environment
status
syncType
triggerType
eventType
signatureStatus
processingStatus
currency
durationMs
errorCode
```

Campos prohibidos:

```text id="jsli41"
tenantId como label
userId como label
bankConnectionId como label
bankConsentId como label
bankAccountId como label
externalAccountId como label
externalTransactionId como label
openBankingTransactionId como label
tokenSecretRef
refreshTokenSecretRef
accountNumberHash
raw provider payload
raw webhook signature
tokens
cookies
Authorization header
SQL raw
stack trace en producción
```

---

## 33.2. Métricas

```text id="x9l1n5"
open_banking_configs_total
open_banking_connections_total
open_banking_consents_authorized_total
open_banking_consents_revoked_total
open_banking_sync_runs_total
open_banking_sync_failed_total
open_banking_transactions_imported_total
open_banking_transactions_duplicate_total
open_banking_transactions_sent_to_reconciliation_total
open_banking_webhooks_received_total
open_banking_webhooks_rejected_total
open_banking_provider_errors_total
```

Labels permitidos:

```text id="pa14hz"
providerKey
environment
status
syncType
triggerType
eventType
signatureStatus
processingStatus
currency
outcome
```

Labels prohibidos:

```text id="h6k2vr"
tenantId
userId
bankConnectionId
bankConsentId
bankAccountId
externalAccountId
externalTransactionId
openBankingTransactionId
tokenSecretRef
refreshTokenSecretRef
accountNumberHash
traceId
```

---

# 34. OpenAPI

## 34.1. Tags

```text id="x4846g"
Open Banking Provider Definitions
Tenant Open Banking Configs
Bank Consents
Bank Connections
Bank Account Links
Open Banking Sync Runs
Open Banking Account Snapshots
Open Banking Transactions
Open Banking Webhooks
Open Banking Reports
```

---

## 34.2. Extensiones requeridas

Para endpoints platform:

```yaml id="kb73pz"
x-platform-scope: true
x-auth-required: true
x-open-banking-integration: true
x-secrets-exposed: false
```

Para endpoints tenant:

```yaml id="r2khjr"
x-tenant-scope: true
x-auth-required: true
x-open-banking-integration: true
x-bank-data: true
x-public-exposure: false
x-secrets-exposed: false
```

Para endpoints de consentimiento:

```yaml id="ddqs4w"
x-consent-required: true
x-consent-audited: true
x-bank-credential-storage: false
```

Para webhooks:

```yaml id="rkhdeb"
x-webhook-endpoint: true
x-provider-signature-required: true
x-idempotent-processing: true
x-public-user-endpoint: false
x-audit-event: openBankingWebhook.received
```

Para sync:

```yaml id="loloh6"
x-sync-operation: true
x-idempotent-processing: true
x-reconciliation-ready: true
```

Para movimiento enviado a conciliación:

```yaml id="h81ghi"
x-reconciliation-bridge: true
x-creates-payment: false
x-final-reconciliation: false
```

Regla:

```text id="zmmj3s"
OpenAPI no debe documentar endpoints públicos administrativos de Open Banking ni campos sensibles.
```

---

# 35. Casos borde obligatorios

| Caso                                               | Resultado esperado          |
| -------------------------------------------------- | --------------------------- |
| Crear provider definition con secreto              | 422                         |
| Crear config con `tenantId`                        | 422                         |
| Crear config con bank username/password            | 422                         |
| Habilitar config sin SecretRefs requeridos         | 409                         |
| Iniciar consentimiento con config disabled         | 409                         |
| Crear consentimiento con `paymentsInitiate` en MVP | 422                         |
| Iniciar autorización y loggear authorizationUrl    | Falla crítica               |
| Sync sin consentimiento vigente                    | 409                         |
| Sync con connection revoked                        | 409                         |
| Sync con connection disabled                       | 409                         |
| Sync con token expirado                            | reauthorizationRequired     |
| Sync periodo inválido                              | 422                         |
| Sync duplicado running                             | 409                         |
| Vincular external account a BankAccount tenant B   | 404/403                     |
| Movimiento sin externalTransactionId               | usa fingerprint             |
| Movimiento duplicado por externalTransactionId     | marca duplicate             |
| Movimiento duplicado por fingerprint               | marca duplicate             |
| Duplicate enviado a conciliación                   | 409                         |
| Movimiento enviado dos veces a conciliación        | idempotente o 409           |
| OpenBankingTransaction crea Payment                | Falla crítica               |
| OpenBankingTransaction modifica Account Statements | Falla crítica               |
| Webhook sin firma cuando requerida                 | 401/403                     |
| Webhook firma inválida                             | 401/403                     |
| Webhook duplicado                                  | no duplica sync/movimientos |
| Payload completo en logs                           | Falla crítica               |
| Token raw en DB                                    | Falla crítica               |
| Número completo de cuenta en DTO                   | Falla crítica               |
| Endpoint público administrativo existe             | Falla crítica               |
| WordPress consulta datos bancarios                 | Falla crítica               |
| IA externa procesa datos bancarios reales          | Falla crítica               |

---

# 36. No aceptación del contrato

La API no debe aceptarse si:

```text id="y4ysqi"
- acepta tenantId desde body;
- permite config cross-tenant;
- permite consent cross-tenant;
- permite connection cross-tenant;
- permite account link cross-tenant;
- permite sync run cross-tenant;
- permite transaction cross-tenant;
- permite webhook event cross-tenant;
- vincula external account con BankAccount tenant B;
- acepta usuario bancario;
- acepta contraseña bancaria;
- acepta OTP;
- acepta MFA secret;
- almacena token raw;
- expone tokenSecretRef en DTO no autorizado;
- expone refreshTokenSecretRef;
- expone número completo de cuenta;
- expone raw provider payload;
- expone raw webhook signature;
- inicia pagos bancarios en MVP;
- crea Payment automáticamente desde movimiento Open Banking;
- modifica Account Statements directamente;
- marca conciliación bancaria final automáticamente;
- permite duplicate como conciliable;
- permite sync sin consentimiento vigente;
- permite sync con connection revoked/disabled;
- crea endpoints públicos administrativos;
- documenta endpoints públicos administrativos en OpenAPI;
- permite WordPress bank access;
- envía datos bancarios reales a IA externa;
- omite auditoría financiera crítica.
```

---

# 37. Resultado esperado

Este contrato API define una superficie REST segura para `019-open-banking-integration`.

Debe permitir:

```text id="l5kfg2"
- administrar provider definitions platform;
- configurar proveedores Open Banking por tenant;
- proteger credenciales mediante SecretRef;
- crear consentimiento explícito;
- iniciar autorización bancaria;
- devolver authorizationUrl temporal solo en respuesta inmediata;
- confirmar conexiones mediante adapter/callback/webhook;
- registrar BankConnection;
- revocar conexiones;
- descubrir cuentas externas;
- vincular cuentas externas con BankAccount interno;
- sincronizar cuentas;
- sincronizar saldos;
- registrar snapshots;
- sincronizar movimientos;
- normalizar movimientos;
- deduplicar movimientos;
- enviar movimientos a Bank Reconciliation;
- recibir webhooks firmados;
- procesar webhooks idempotentemente;
- consultar eventos sanitizados;
- reintentar syncs fallidos;
- generar reportes;
- exportar reportes;
- auditar operaciones críticas;
- observar operación con logs y métricas seguras;
- mantener OpenAPI seguro;
- impedir credenciales bancarias;
- impedir tokens expuestos;
- impedir payment initiation en MVP;
- impedir creación automática de Payment;
- impedir conciliación final automática;
- impedir endpoints públicos administrativos;
- impedir acceso bancario desde WordPress;
- impedir uso de IA externa con datos bancarios reales.
```

---

# 38. Decisión final del contrato

El módulo `019-open-banking-integration` expondrá APIs privadas platform y tenant, además de un endpoint técnico de webhook protegido por firma cuando el proveedor lo soporte.

No habrá API `/me` en MVP.

No habrá endpoints públicos administrativos.

No habrá iniciación de pagos bancarios.

No habrá creación automática de `Payment`.

No habrá conciliación final automática.

El contrato prioriza:

```text id="h7hram"
1. Tenant isolation.
2. Consentimiento explícito.
3. No almacenamiento de credenciales bancarias.
4. SecretRef strategy.
5. Read-only MVP.
6. Provider-agnostic adapters.
7. Sync idempotente.
8. Deduplicación por externalTransactionId/fingerprint.
9. Bank Reconciliation como autoridad final.
10. Payments como fuente de pagos internos.
11. Account Statements derivados solo de movimientos internos.
12. Webhook verification.
13. Auditoría financiera.
14. Logs y métricas seguras.
15. No public administrative endpoints.
16. No WordPress bank access.
17. No external AI with real bank data.
```

---

# 39. Expediente actualizado

```text id="r827wt"
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
│   │   └── 019-open-banking-integration/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
