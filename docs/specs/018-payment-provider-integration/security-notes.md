# Security Notes — Spec 018 Payment Provider Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                           |
| Spec ID         | 018                                                                                                                                                                                                                                                     |
| Módulo          | Payment Provider Integration                                                                                                                                                                                                                            |
| Documento       | Security Notes                                                                                                                                                                                                                                          |
| Ruta            | `docs/specs/018-payment-provider-integration/security-notes.md`                                                                                                                                                                                         |
| Versión         | 0.1                                                                                                                                                                                                                                                     |
| Estado          | Borrador inicial                                                                                                                                                                                                                                        |
| Fecha           | 2026-07-23                                                                                                                                                                                                                                              |
| Documento base  | `docs/specs/018-payment-provider-integration/spec.md`                                                                                                                                                                                                   |
| Plan técnico    | `docs/specs/018-payment-provider-integration/plan.md`                                                                                                                                                                                                   |
| Modelo de datos | `docs/specs/018-payment-provider-integration/data-model.md`                                                                                                                                                                                             |
| Contrato API    | `docs/specs/018-payment-provider-integration/api-contract.md`                                                                                                                                                                                           |
| Plan de pruebas | `docs/specs/018-payment-provider-integration/test-plan.md`                                                                                                                                                                                              |
| Tareas          | `docs/specs/018-payment-provider-integration/tasks.md`                                                                                                                                                                                                  |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `012-communications-notifications`, `016-secure-document-storage`, `017-bank-reconciliation` |
| Naturaleza      | Tenant-scoped / Provider-agnostic / Webhook-driven / Idempotent / Payment-aware / Audit-heavy / PCI-minimized / Non-public administrative surface                                                                                                       |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `018-payment-provider-integration`.

El módulo permite integrar RESIDENT Core con proveedores externos de pago mediante intenciones de pago, checkout externo, webhooks firmados, procesamiento idempotente, creación controlada de pagos internos, trazabilidad financiera y auditoría completa.

Regla central:

```text id="azqz13"
Toda definición de proveedor, configuración tenant, secreto, intención de pago, item, checkout session, webhook, transacción externa, mapping, settlement, reporte, exportación, integración y evento de auditoría debe proteger tenant isolation, credenciales, datos de tarjeta, cálculo server-side de montos, webhook signature verification, idempotencia, no duplicación de pagos, integridad financiera, logs seguros, auditoría sanitizada y ausencia total de endpoints públicos administrativos.
```

---

## 3. Resumen ejecutivo de seguridad

`Payment Provider Integration` es un módulo financiero crítico. Un error puede permitir:

```text id="kt56aq"
- creación de pagos falsos;
- duplicación de pagos por webhooks repetidos;
- conciliación de pagos de otro tenant;
- exposición de secretos del proveedor;
- almacenamiento indebido de datos de tarjeta;
- manipulación de montos desde el cliente;
- aceptación de webhooks falsos;
- replay attacks;
- exposición de checkoutUrl;
- filtración de payloads sensibles;
- reportes financieros cross-tenant;
- auditoría con datos sensibles;
- WordPress confirmando pagos indebidamente;
- uso de IA externa con datos reales de pago.
```

Por lo tanto, el módulo se asegura mediante:

```text id="x9mtek"
- checkout externo;
- no captura directa de tarjeta;
- no almacenamiento de PAN/CVV/raw card data;
- SecretRef en lugar de secretos reales;
- cálculo de montos en servidor;
- PaymentIntent tenant-scoped;
- webhook firmado como fuente técnica verificable;
- raw body hashing;
- replay protection;
- idempotencia por providerEventId y providerTransactionId;
- Payment interno solo ante evento verificado;
- ProviderTransaction no como fuente de saldo;
- Account Statements actualizados solo vía Payment;
- Bank Reconciliation como validación bancaria final;
- auditoría financiera;
- logs sanitizados;
- métricas sin identificadores sensibles;
- cero endpoints públicos administrativos.
```

---

## 4. Principio dominante de seguridad

El principio dominante del módulo es:

```text id="q07sgc"
RESIDENT Core no debe comportarse como procesador directo de tarjeta ni como fuente ciega de confianza del proveedor; debe actuar como orquestador seguro, verificable, idempotente y auditable.
```

Implicaciones:

```text id="hjvt6j"
- RESIDENT no captura tarjeta;
- RESIDENT no almacena PAN;
- RESIDENT no almacena CVV;
- RESIDENT no crea Payment desde el redirect del navegador;
- RESIDENT no crea Payment sin webhook verificado;
- RESIDENT no acepta amount del cliente como fuente de verdad;
- RESIDENT no duplica Payments por reintentos;
- RESIDENT no marca conciliación bancaria final solo por provider payment;
- RESIDENT no expone secretos;
- RESIDENT no expone payloads completos.
```

---

## 5. Alcance de seguridad

### 5.1. Incluido

Estas notas cubren:

```text id="uotgeu"
1. Autenticación de usuarios.
2. Autorización platform, tenant y own.
3. Validación de webhooks externos.
4. Tenant isolation.
5. Own-resource access.
6. Protección de secretos.
7. Protección de datos de tarjeta.
8. Protección de PaymentIntent.
9. Protección de CheckoutSession.
10. Seguridad de checkoutUrl.
11. Cálculo server-side de montos.
12. Validación de cargos, unidades y saldos.
13. Firma de webhooks.
14. Replay protection.
15. Idempotencia.
16. ProviderTransaction.
17. Creación segura de Payment interno.
18. ProviderPaymentMapping.
19. Settlements.
20. Reportes.
21. Exportaciones.
22. Integración con Payments.
23. Integración con Account Statements.
24. Integración con Bank Reconciliation.
25. Integración con Secure Document Storage.
26. Integración con Notifications.
27. Auditoría.
28. Logs.
29. Métricas.
30. OpenAPI.
31. CI/CD security gates.
32. No endpoints públicos administrativos.
33. No IA externa con datos reales.
```

---

### 5.2. Fuera de alcance del MVP

No se implementa ni se asegura como funcionalidad activa en esta spec:

```text id="e5ai9k"
- captura directa de tarjeta;
- almacenamiento de tarjeta;
- tokenización propia;
- PCI completo como procesador de tarjeta;
- recurring payments;
- domiciliación bancaria;
- débitos automáticos;
- refunds automáticos;
- chargebacks avanzados;
- disputas avanzadas;
- antifraude avanzado;
- scoring de riesgo con IA;
- pagos anónimos;
- links públicos permanentes;
- QR público sin expiración;
- marketplace;
- split payments avanzado;
- wallet interno;
- pagos a proveedores;
- facturación electrónica;
- integración SRI;
- contabilidad completa;
- asientos contables;
- Open Banking;
- conciliación bancaria automática final.
```

Todo elemento anterior debe quedar desactivado, inexistente o protegido mediante feature flags.

---

## 6. Activos protegidos

### 6.1. Definiciones de proveedor

```text id="q8v2hu"
payment_provider_definitions
```

Protegen:

```text id="b4yu1f"
providerKey
displayName
métodos soportados
estado del proveedor
capabilities
metadata no sensible
```

No contienen secretos.

---

### 6.2. Configuraciones tenant

```text id="ezpz5h"
tenant_payment_provider_configs
```

Protegen:

```text id="wpus7j"
tenantId
providerDefinitionId
providerKey
environment
status
credentialSecretRef
webhookSecretRef
publicConfig
settlementBankAccountId
returnUrl
cancelUrl
allowedOrigins
metadata
```

---

### 6.3. Secretos

Protegen:

```text id="j34m5k"
API keys
client secrets
private keys
webhook secrets
provider credentials
OAuth tokens si existieran
```

Regla:

```text id="v6zrhe"
Los valores reales de secretos nunca deben persistirse en PostgreSQL transaccional ni devolverse por API.
```

---

### 6.4. Intenciones de pago

```text id="leajvi"
payment_intents
payment_intent_items
```

Protegen:

```text id="kmxbff"
paymentIntentId
persona
unidad
cargos
monto
moneda
estado
items pagables
sourceModule
sourceResource
idempotencyKey
```

---

### 6.5. Checkout sessions

```text id="u12348"
payment_checkout_sessions
```

Protegen:

```text id="h9q1va"
providerSessionId
providerCheckoutUrl
checkoutUrlHash
expiresAt
status
metadata
```

---

### 6.6. Webhook events

```text id="psipwj"
provider_webhook_events
```

Protegen:

```text id="gvhq0p"
providerEventId
eventType
signatureStatus
processingStatus
payloadHash
payloadPreview
signatureHeaderHash
providerTimestamp
retryCount
errorCode
metadata
```

---

### 6.7. Provider transactions

```text id="f1uvgd"
provider_transactions
```

Protegen:

```text id="k4w5e5"
providerTransactionId
providerReference
providerStatus
internalStatus
amount
currency
feeAmount
netAmount
paymentMethodType
cardBrand
cardLast4
authorizationCodePreview
```

---

### 6.8. Provider payment mappings

```text id="rw56ln"
provider_payment_mappings
```

Protegen:

```text id="qnm90v"
paymentIntentId
providerTransactionId
paymentId
mappingStatus
reverseReason
metadata
```

---

### 6.9. Settlements

```text id="m6k3br"
provider_settlement_records
```

Protegen:

```text id="uf8bhn"
providerSettlementId
grossAmount
feeAmount
netAmount
settlementDate
bankAccountId
bankTransactionId
status
```

---

### 6.10. Reportes y exportaciones

Protegen:

```text id="nd3rlf"
summary reports
transactions reports
failures reports
settlements reports
exports CSV/XLSX/PDF
secureDocumentId
secureDocumentFileId
```

---

## 7. Clasificación de datos

### 7.1. Datos prohibidos

Estos datos no deben recibirse, persistirse, serializarse, auditarse ni registrarse:

```text id="qxfsog"
PAN
número completo de tarjeta
CVV
CVC
track data
PIN
raw card data
full card token sensible
full authorization payload
3DS raw payload
provider secret value
webhook secret value
credentialSecret value
API key real
private key real
raw OAuth token
refresh token
raw webhook signature
full webhook payload
checkoutUrl en logs/auditoría/listados
storageKey
signedUrl persistente
Authorization header
cookies
tokens
SQL raw
stack trace en producción
datos reales enviados a IA externa
```

---

### 7.2. Datos altamente sensibles

```text id="vmeswn"
credentialSecretRef
webhookSecretRef
providerTransactionId
providerReference
providerEventId
payloadHash
signatureHeaderHash
idempotencyKey
checkoutUrlHash
paymentIntentId
paymentId
bankTransactionId
amount
feeAmount
netAmount
```

---

### 7.3. Datos confidenciales

```text id="vm34jb"
tenantProviderConfigId
providerKey
environment
status
internalStatus
paymentMethodType
cardBrand
cardLast4
authorizationCodePreview
propertyUnitId
personId
chargeId
settlementBankAccountId
providerSettlementId
```

---

### 7.4. Datos permitidos en DTO estándar

```text id="q762k6"
id
providerKey
displayName
environment
status
currency
amount como string decimal
feeAmount como string decimal
netAmount como string decimal
paymentMethodType
cardBrand
cardLast4
authorizationCodePreview sanitizado
providerTransactionId si política admin lo permite
providerReference sanitizada
providerEventId si política admin lo permite
payloadHashPrefix
signatureStatus
processingStatus
retryCount
safe errorCode
safe errorMessage
createdAt
updatedAt
processedAt
confirmedAt
failedAt
cancelledAt
expiredAt
metadata segura
```

---

### 7.5. Datos prohibidos en DTO estándar

```text id="vudbtq"
tenantId
secret values
credentialSecret value
webhookSecret value
raw signature
raw webhook payload
full payload preview
checkoutUrl en listados
PAN
CVV
raw card data
full card token
storageKey
signedUrl
tokens
cookies
Authorization header
SQL raw
stack trace
```

---

## 8. Fronteras de confianza

### 8.1. Cliente autenticado / API

Riesgos:

```text id="ba058f"
- cliente envía tenantId falso;
- cliente envía amount manipulado;
- cliente envía chargeId de otro tenant;
- cliente envía propertyUnitId ajeno;
- cliente envía providerTransactionId manual;
- cliente envía status directo;
- cliente envía checkoutUrl manual;
- cliente intenta crear Payment sin proveedor;
- cliente intenta pagar saldo ajeno;
- cliente intenta exponer secretos.
```

Controles:

```text id="pcuvxa"
- DTO whitelist;
- forbidNonWhitelisted;
- TenantGuard;
- PermissionGuard;
- OwnResourceGuard;
- amount calculado en servidor;
- validación de charges tenant-scoped;
- validación de propertyUnit tenant-scoped;
- rechazo de tenantId en body;
- rechazo de status directo;
- rechazo de checkoutUrl manual;
- rechazo de card data.
```

---

### 8.2. API / Proveedor externo

Riesgos:

```text id="uag5xg"
- webhook falso;
- firma inválida;
- replay attack;
- payload alterado;
- providerEventId repetido;
- providerTransactionId repetido;
- amount mismatch;
- currency mismatch;
- evento de refund/chargeback inesperado;
- proveedor caído;
- timeout externo.
```

Controles:

```text id="w5l7hu"
- raw body verification;
- webhook signature;
- timestamp tolerance;
- payloadHash;
- signatureHeaderHash;
- replay protection;
- idempotencia;
- provider adapter;
- status mapping;
- amount/currency validation;
- requiresReview para casos no soportados;
- safe error handling.
```

---

### 8.3. API / Payments

Riesgos:

```text id="p70rhe"
- creación de Payment duplicado;
- Payment creado sin webhook verificado;
- Payment creado con amount mismatch;
- Payment creado con currency mismatch;
- Payment creado para charge de otro tenant;
- PaymentAllocation incorrecta;
- Account Statement inconsistente.
```

Controles:

```text id="tgnttx"
- PaymentsIntegrationPort;
- PaymentCreationFromProviderPolicy;
- providerTransactionId único;
- PaymentIntent tenant-scoped;
- items revalidados antes de crear Payment;
- transacción DB;
- idempotencia;
- PaymentAllocation controlada;
- audit financiero.
```

---

### 8.4. API / Secure Document Storage

Riesgos:

```text id="dx2259"
- export público;
- storageKey filtrado;
- comprobante visible por usuario incorrecto;
- reporte administrativo visible desde /me;
- raw payload guardado como documento sensible sin control.
```

Controles:

```text id="m2l6sh"
- sourceModule=paymentProviderIntegration;
- visibility owners para comprobantes propios;
- visibility administrative para reportes;
- sensitivity confidential/restricted;
- no storageKey;
- no signedUrl persistente;
- descarga autorizada;
- auditoría documental.
```

---

### 8.5. API / WordPress

Riesgos:

```text id="xgew5f"
- WordPress confirma pagos;
- WordPress expone payment intents públicos;
- WordPress consume reportes administrativos;
- WordPress redirige a checkout sin usuario autenticado;
- WordPress actúa como intermediario financiero.
```

Controles:

```text id="fkrmy7"
- WordPress no confirma pagos;
- WordPress no procesa tarjetas;
- WordPress no consume reportes financieros privados;
- WordPress no tiene endpoints públicos administrativos;
- Core maneja autenticación/autorización;
- checkout se crea desde API autenticada.
```

---

## 9. Threat model resumido

### 9.1. Spoofing

Amenazas:

```text id="lh5be6"
- usuario intenta actuar como FinancialManager;
- usuario intenta iniciar pago de unidad ajena;
- atacante envía webhook falso;
- atacante suplanta proveedor;
- cliente envía actor fields desde body.
```

Controles:

```text id="g2fdhy"
- Keycloak/OIDC para usuarios;
- membership activa;
- permisos Core;
- OwnResourceGuard;
- webhook signature verification;
- actor derivado del token;
- rechazo de createdBy/updatedBy/processedBy desde body.
```

---

### 9.2. Tampering

Amenazas:

```text id="fosio3"
- cliente manipula amount;
- cliente manipula currency;
- cliente cambia status;
- atacante altera payload webhook;
- cliente modifica providerTransactionId;
- cliente intenta forzar confirmedPaymentId;
- cliente manipula settlement bankTransactionId cross-tenant.
```

Controles:

```text id="uzltff"
- server-side amount calculation;
- currency whitelist;
- state machines;
- raw body signature validation;
- providerTransactionId solo desde provider adapter;
- confirmedPaymentId server-side;
- tenant-scoped validation;
- DB constraints.
```

---

### 9.3. Repudiation

Amenazas:

```text id="q6h4n8"
- usuario niega haber creado PaymentIntent;
- administrador niega habilitar proveedor;
- usuario niega haber iniciado checkout;
- proveedor reintenta webhook;
- financiero niega reprocesar evento;
- usuario niega revertir mapping.
```

Controles:

```text id="ww3n2n"
- audit events;
- actorUserId desde token;
- traceId;
- requestId;
- timestamps UTC;
- providerEventId;
- providerTransactionId;
- payloadHash;
- no eliminación física ordinaria.
```

---

### 9.4. Information Disclosure

Amenazas:

```text id="h0c0rw"
- secretos expuestos;
- checkoutUrl expuesta en logs;
- payload completo expuesto;
- raw signature expuesta;
- PAN/CVV almacenado;
- tenant B visible en reportes;
- webhook errors revelan existencia de tenants;
- provider config visible desde /me.
```

Controles:

```text id="y9rqbr"
- SecretRef;
- DTO minimization;
- log sanitization;
- audit sanitization;
- no card data storage;
- tenant isolation;
- own DTO minimizado;
- response segura para webhooks;
- no raw payload.
```

---

### 9.5. Denial of Service

Amenazas:

```text id="t2xbxe"
- payloads de webhook enormes;
- reintentos masivos;
- creación masiva de PaymentIntents;
- generación de checkout sessions masiva;
- reportes pesados;
- exports repetidos;
- provider timeout.
```

Controles:

```text id="xmpzi3"
- payload size limit;
- rate limiting;
- pageSize máximo;
- timeouts;
- idempotencia;
- queue futura;
- circuit breaker futuro;
- métricas;
- alertas.
```

---

### 9.6. Elevation of Privilege

Amenazas:

```text id="wpyklg"
- residente consulta provider configs;
- residente consulta webhook events;
- residente consulta transacciones internas;
- BoardMember accede a secretos;
- PlatformAdmin accede a datos tenant sin permiso;
- usuario sin permiso reprocesa webhook.
```

Controles:

```text id="fak5ni"
- PermissionGuard granular;
- OwnResourceGuard;
- DTOs diferenciados admin vs own;
- PlatformAdmin sin acceso automático a datos tenant;
- permisos financieros explícitos;
- auditoría reforzada.
```

---

## 10. Autenticación

### 10.1. APIs platform, tenant y own

Requieren:

```http id="q32x6w"
Authorization: Bearer <access_token>
```

Reglas:

```text id="g5jv11"
- token válido;
- usuario activo;
- tenant activo si aplica;
- membership activa si aplica;
- permisos correctos;
- actor derivado del token;
- no actor desde body.
```

---

### 10.2. Webhook API

El webhook no usa token de usuario.

Debe requerir:

```text id="mruuv2"
- providerKey soportado;
- firma válida;
- timestamp válido si provider lo soporta;
- payloadHash;
- replay protection;
- idempotencia;
- tenant/config resoluble.
```

---

## 11. Autorización

### 11.1. Platform provider definitions

```text id="mkpgcs"
paymentProviderDefinitions.create
paymentProviderDefinitions.read
paymentProviderDefinitions.update
paymentProviderDefinitions.activate
paymentProviderDefinitions.deprecate
paymentProviderDefinitions.archive
```

---

### 11.2. Tenant provider configs

```text id="x4vcyh"
tenantPaymentProviders.create
tenantPaymentProviders.read
tenantPaymentProviders.update
tenantPaymentProviders.enable
tenantPaymentProviders.disable
tenantPaymentProviders.testConnection
tenantPaymentProviders.archive
```

---

### 11.3. Payment intents

```text id="qux9aq"
paymentIntents.create
paymentIntents.read
paymentIntents.cancel
paymentIntents.expire
paymentIntents.create.own
paymentIntents.read.own
paymentIntents.cancel.own
```

---

### 11.4. Checkout sessions

```text id="toncqo"
paymentCheckoutSessions.create
paymentCheckoutSessions.read
paymentCheckoutSessions.create.own
paymentCheckoutSessions.read.own
```

---

### 11.5. Webhook events

```text id="m78wei"
paymentProviderWebhooks.read
paymentProviderWebhooks.reprocess
paymentProviderWebhooks.archive
```

---

### 11.6. Provider transactions

```text id="k6sqxn"
providerTransactions.read
providerTransactions.review
providerTransactions.archive
```

---

### 11.7. Mappings

```text id="y0yhtv"
providerPaymentMappings.read
providerPaymentMappings.reverse
```

---

### 11.8. Settlements

```text id="bpmki7"
providerSettlements.read
providerSettlements.linkToBankTransaction
providerSettlements.archive
```

---

### 11.9. Reports

```text id="ejo2s5"
paymentProviderReports.read
paymentProviderReports.export
```

---

### 11.10. Auditoría

```text id="zyqoxt"
paymentProvider.audit.read
```

---

## 12. PlatformAdmin

Regla:

```text id="irh3zq"
PlatformAdmin puede administrar definiciones platform de proveedores, pero no accede automáticamente a PaymentIntents, ProviderTransactions, ProviderConfigs, Webhooks, Mappings, Settlements ni reportes financieros tenant.
```

Acceso excepcional requiere:

```text id="he946e"
- permiso explícito;
- contexto tenant;
- justificación;
- auditoría reforzada;
- DTO minimizado;
- no secretos;
- no raw payloads.
```

---

## 13. Tenant isolation

### 13.1. Tablas tenant-scoped

```text id="gym8fz"
tenant_payment_provider_configs
payment_intents
payment_intent_items
payment_checkout_sessions
provider_webhook_events
provider_transactions
provider_payment_mappings
provider_settlement_records
```

Excepción:

```text id="wgv16w"
payment_provider_definitions es platform-scoped.
```

---

### 13.2. Patrón requerido

```typescript id="tmj6d6"
await prisma.paymentIntent.findFirst({
  where: {
    id: paymentIntentId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 13.3. Patrón prohibido

```typescript id="qs8vgr"
await prisma.paymentIntent.findUnique({
  where: { id: paymentIntentId }
});
```

También prohibido:

```typescript id="z3ufil"
await prisma.tenantPaymentProviderConfig.findUnique({ where: { id } });
await prisma.paymentCheckoutSession.findUnique({ where: { id } });
await prisma.providerWebhookEvent.findUnique({ where: { id } });
await prisma.providerTransaction.findUnique({ where: { id } });
await prisma.providerPaymentMapping.findUnique({ where: { id } });
await prisma.providerSettlementRecord.findUnique({ where: { id } });
```

---

### 13.4. Referencias que deben validarse por tenant

```text id="kmik2e"
tenantProviderConfigId
paymentIntentId
paymentIntentItemId
checkoutSessionId
webhookEventId
providerTransactionId
mappingId
settlementId
personId
propertyUnitId
chargeId
paymentId
bankAccountId
bankTransactionId
secureDocumentId
secureDocumentFileId
```

---

### 13.5. Respuesta ante cross-tenant

Recomendación:

```text id="aoft5s"
Responder 404 para recursos de otro tenant, evitando revelar existencia.
```

---

## 14. Own-resource security

### 14.1. Regla

```text id="tq0jna"
Un usuario solo puede crear, consultar o cancelar PaymentIntents propios si tiene relación válida con la persona/unidad afectada.
```

---

### 14.2. Resolución requerida

```text id="hmwx4r"
UserProfile
  -> Person
      -> PropertyUnit
          -> Charges / AccountBalance
```

---

### 14.3. Prohibido en `/me`

```text id="i05xlw"
- ver provider config interna;
- ver SecretRefs;
- ver webhook events;
- ver raw provider data;
- ver reportes administrativos;
- ver transacciones de otros usuarios;
- pagar unidades ajenas;
- pagar cargos de otro tenant;
- crear manualItem administrativo;
- crear payment anonymous.
```

---

## 15. Seguridad de secretos

### 15.1. Persistencia permitida

```text id="ivk6vn"
credentialSecretRef
webhookSecretRef
```

---

### 15.2. Persistencia prohibida

```text id="ehl0yw"
credentialSecret value
webhookSecret value
API key real
client secret real
private key real
raw token
refresh token
passwords
secretos en metadata
secretos en audit
secretos en logs
```

---

### 15.3. API

Reglas:

```text id="fnvz1o"
- no devolver secret values;
- no devolver webhookSecret;
- no devolver credentialSecret;
- no devolver SecretRefs en /me;
- admin DTO puede devolver credentialSecretConfigured=true;
- admin DTO puede devolver webhookSecretConfigured=true;
- si se acepta secretValue, convertir inmediatamente a SecretRef;
- secretValue no se persiste en PostgreSQL;
- secretValue no se audita;
- secretValue no se loggea.
```

---

## 16. Seguridad de datos de tarjeta

### 16.1. Prohibición absoluta

No almacenar:

```text id="uf710b"
PAN
CVV
CVC
track data
PIN
raw card data
full card token sensible
full authorization payload
3DS raw payload
```

---

### 16.2. Datos permitidos

Permitido de forma minimizada:

```text id="w48429"
paymentMethodType
cardBrand
cardLast4
authorizationCodePreview
providerTransactionId
providerReference
```

---

### 16.3. Checkout externo

Regla:

```text id="n0bvhw"
El proveedor externo captura los datos sensibles de pago; RESIDENT Core crea la intención, redirige a checkout externo y espera webhook firmado.
```

---

## 17. Seguridad de PaymentIntent

### 17.1. Reglas

```text id="e5b17i"
- tenantProviderConfig debe estar enabled;
- propertyUnit debe pertenecer al tenant;
- chargeIds deben pertenecer al tenant;
- cargos deben ser pagables;
- items no pueden estar vacíos;
- amount se calcula en servidor;
- currency MVP = USD;
- expiresAt server-side;
- idempotencyKey recomendado;
- no status directo desde body;
- no confirmedPaymentId desde body;
- no providerTransactionId desde body;
```

---

### 17.2. Estados bloqueados

No crear checkout para PaymentIntent:

```text id="py25ip"
succeeded
failed
cancelled
expired
reversed
archived
```

---

### 17.3. Idempotencia

```text id="z2q18h"
Misma Idempotency-Key con payload lógico equivalente devuelve el mismo PaymentIntent.
```

Misma Idempotency-Key con payload distinto:

```text id="ltpl78"
409 PAYMENT_INTENT_IDEMPOTENCY_CONFLICT
```

---

## 18. Seguridad de cálculo de montos

### 18.1. Regla central

```text id="l3r4mu"
El cliente nunca es fuente de verdad del monto a pagar.
```

---

### 18.2. Fuentes válidas

```text id="wikbc3"
charges tenant-scoped
account statement balance tenant-scoped
fine charge asociado tenant-scoped
reservation charge asociado tenant-scoped
manualItem administrativo autorizado
```

---

### 18.3. Prohibido

```text id="u5dgrz"
amount final arbitrario desde cliente
amount negativo
amount cero
currency no soportada
float/double
JavaScript number para cálculos monetarios
```

---

## 19. Seguridad de CheckoutSession

### 19.1. Reglas

```text id="lyn98k"
- checkout session requiere PaymentIntent válido;
- provider config debe estar enabled;
- provider debe soportar hosted checkout;
- checkoutUrl temporal;
- checkoutUrl no debe aparecer en listados;
- checkoutUrl no debe aparecer en logs;
- checkoutUrl no debe aparecer en auditoría;
- checkoutUrl expirada no debe devolverse;
- returnUrl/cancelUrl no confirman pago.
```

---

### 19.2. Respuesta inmediata

Permitido:

```text id="t1og0z"
providerCheckoutUrl en respuesta inmediata autorizada de creación de checkout.
```

Prohibido:

```text id="cn42vw"
providerCheckoutUrl en listados
providerCheckoutUrl en reportes
providerCheckoutUrl en audit
providerCheckoutUrl en logs
providerCheckoutUrl en métricas
providerCheckoutUrl persistente público
```

---

## 20. Seguridad de webhooks

### 20.1. Regla central

```text id="qap1is"
El webhook firmado, no el redirect del navegador, es la fuente técnica verificable para crear Payment interno.
```

---

### 20.2. Validaciones obligatorias

```text id="lm0k75"
- providerKey soportado;
- raw body disponible;
- payload size permitido;
- payloadHash calculado;
- signature presente;
- signature válida;
- timestamp dentro de tolerancia;
- replay no detectado;
- providerEventId idempotente;
- providerTransactionId único;
- tenantProviderConfig resoluble;
- tenantProviderConfig enabled o compatible con evento tardío;
- PaymentIntent tenant-scoped;
- amount coincide;
- currency coincide.
```

---

### 20.3. Eventos inválidos

Rechazar o registrar sin efecto financiero:

```text id="p5dp76"
firma ausente
firma inválida
timestamp expirado
providerKey no soportado
payload inválido
payload oversized
tenant no resoluble
PaymentIntent no resoluble
amount mismatch
currency mismatch
providerTransactionId duplicado sospechoso
```

---

### 20.4. Datos persistidos

Persistir:

```text id="ytyksc"
payloadHash
payloadHashPrefix
payloadPreview sanitizado
signatureHeaderHash
providerTimestamp
providerEventId
eventType
signatureStatus
processingStatus
errorCode seguro
errorMessage seguro
```

No persistir:

```text id="ls7wrw"
raw payload completo
raw signature
webhook secret
PAN
CVV
raw card data
tokens
cookies
Authorization header
```

---

## 21. Replay protection

### 21.1. Identificadores

Usar:

```text id="q8asjt"
providerEventId
providerTransactionId
payloadHash
providerTimestamp
Idempotency-Key interna
```

---

### 21.2. Reglas

```text id="eqepsr"
- mismo providerEventId no se procesa dos veces;
- mismo providerTransactionId no crea dos Payments;
- payloadHash repetido dentro de ventana se marca como replay/duplicate si corresponde;
- duplicate puede responder 200 idempotente;
- duplicate no crea Payment;
- duplicate no crea Mapping adicional;
- duplicate se audita.
```

---

## 22. Seguridad de ProviderTransaction

### 22.1. Reglas

```text id="bo9mml"
- ProviderTransaction requiere tenantId;
- providerTransactionId debe ser único por tenant/provider si existe;
- amount > 0;
- currency = USD en MVP;
- cardLast4 máximo 4 dígitos;
- no PAN;
- no CVV;
- no raw provider payload;
- providerStatus se mapea a internalStatus;
- amount mismatch queda requiresReview;
- currency mismatch queda requiresReview;
```

---

### 22.2. Estados exitosos

Pueden crear Payment si cumplen todas las validaciones:

```text id="srrg98"
captured
succeeded
```

---

### 22.3. Estados no exitosos

No crean Payment:

```text id="zeadnb"
failed
cancelled
expired
unknown
```

---

### 22.4. Estados de revisión

Quedan como `requiresReview` en MVP:

```text id="d10jwm"
refunded
partiallyRefunded
chargeback
amount mismatch
currency mismatch
paymentIntent missing
tenant mismatch
```

---

## 23. Seguridad de creación de Payment interno

### 23.1. Condiciones obligatorias

Crear Payment interno solo si:

```text id="mnguzf"
- webhook está verificado;
- evento no es duplicate;
- providerStatus es captured/succeeded;
- PaymentIntent existe;
- PaymentIntent pertenece al tenant;
- PaymentIntent no está succeeded previamente;
- PaymentIntent no está cancelled/expired/archived;
- amount coincide exactamente;
- currency coincide;
- providerTransactionId no tiene Payment previo;
- items siguen pagables;
- PaymentsIntegrationPort acepta operación;
- operación es transaccional.
```

---

### 23.2. Prohibiciones

No crear Payment si:

```text id="k8d4q3"
- viene de redirect del navegador;
- webhook no tiene firma;
- webhook tiene firma inválida;
- webhook es duplicate;
- providerStatus failed/cancelled/expired/unknown;
- amount mismatch;
- currency mismatch;
- PaymentIntent tenant B;
- charge tenant B;
- unidad ajena;
- providerTransactionId ya usado;
- PaymentIntent ya succeeded;
```

---

## 24. Seguridad de ProviderPaymentMapping

### 24.1. Reglas

```text id="qleq51"
- mapping requiere PaymentIntent tenant-scoped;
- mapping requiere ProviderTransaction tenant-scoped;
- mapping requiere Payment tenant-scoped;
- una ProviderTransaction no puede tener más de un mapping activo;
- un Payment no puede tener más de un mapping activo de proveedor;
- reverse requiere razón;
- reverse no elimina Payment;
- reverse no elimina ProviderTransaction;
- refunds/chargebacks no reversan automáticamente en MVP.
```

---

## 25. Seguridad de settlements

### 25.1. Regla central

```text id="burd8w"
ProviderSettlementRecord ayuda a identificar liquidaciones, pero no reemplaza la conciliación bancaria final.
```

---

### 25.2. Reglas

```text id="k4ym0g"
- settlement requiere tenantId;
- providerSettlementId único por tenant/provider si existe;
- grossAmount >= 0;
- feeAmount >= 0;
- netAmount >= 0;
- bankAccountId debe pertenecer al tenant;
- bankTransactionId debe pertenecer al tenant;
- vincular settlement no marca conciliación bancaria final;
- Bank Reconciliation conserva validación final.
```

---

## 26. Seguridad de reportes

### 26.1. Reportes permitidos

```text id="ozwc2g"
summary
transactions
failures
settlements
export
```

---

### 26.2. Reglas

```text id="ov3ns5"
- reportes siempre tenant-scoped;
- requieren permiso paymentProviderReports.read/export;
- no exponen secretos;
- no exponen raw payload;
- no exponen raw signature;
- no exponen checkoutUrl;
- no exponen PAN/CVV/raw card data;
- no incluyen tenant B;
- export persistido usa Secure Document Storage;
- no storageKey en response.
```

---

## 27. Seguridad de Secure Document Storage

### 27.1. Clasificación recomendada

Para comprobantes propios:

```json id="mv6v0k"
{
  "sourceModule": "paymentProviderIntegration",
  "sourceResourceType": "providerTransaction",
  "visibility": "owners",
  "sensitivity": "confidential"
}
```

Para reportes internos:

```json id="wvrtec"
{
  "sourceModule": "paymentProviderIntegration",
  "sourceResourceType": "paymentProviderReportExport",
  "visibility": "administrative",
  "sensitivity": "restricted"
}
```

---

### 27.2. Reglas

```text id="m87q7h"
- no exponer storageKey;
- no exponer signedUrl persistente;
- no guardar raw provider payload sensible como documento ordinario;
- descargas requieren autorización;
- descargas se auditan;
- /me solo accede a comprobantes propios permitidos;
- reportes administrativos no son visibles por /me.
```

---

## 28. Seguridad de Notifications

Reglas:

```text id="xfvzt1"
- no enviar secretos;
- no enviar raw payload;
- no enviar raw signature;
- no enviar PAN/CVV;
- no enviar checkoutUrl por canal inseguro salvo política explícita;
- no enviar datos de otros residentes;
- notificaciones de pago exitoso deben basarse en Payment interno creado;
- notificaciones de fallo deben ser sanitizadas.
```

---

## 29. Seguridad de WordPress

Prohibido:

```text id="k9ebdb"
WordPress no captura tarjetas.
WordPress no crea Payment directo.
WordPress no confirma pagos.
WordPress no procesa webhooks.
WordPress no consulta provider configs.
WordPress no consulta webhook events.
WordPress no consulta provider transactions.
WordPress no consulta reportes financieros privados.
WordPress no accede a secretos.
```

Permitido:

```text id="vtu57c"
WordPress puede enlazar al portal autenticado de RESIDENT Core o mostrar navegación informativa sin procesar pagos.
```

---

## 30. Endpoints públicos prohibidos

No crear:

```text id="lg21bw"
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

```text id="x03k8n"
404 route not found
```

---

## 31. Auditoría

### 31.1. Eventos obligatorios

```text id="c90ybu"
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

### 31.2. Metadata permitida

```text id="m8zqq4"
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

### 31.3. Metadata prohibida

```text id="rg7nqa"
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

### 31.4. Auditoría reforzada

Aplicar auditoría reforzada en:

```text id="gupkqp"
- creación de tenant provider config;
- habilitación de provider config;
- actualización de SecretRefs;
- testConnection fallido;
- webhook rejected;
- webhook duplicate;
- webhook reprocessed;
- amount mismatch;
- currency mismatch;
- Payment creado desde provider;
- ProviderPaymentMapping reversed;
- provider refund event;
- provider chargeback event;
- settlement linked to bankTransaction;
- report export;
- acceso excepcional PlatformAdmin.
```

---

## 32. Logs seguros

### 32.1. Campos permitidos

```text id="h5kk6h"
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

---

### 32.2. Campos prohibidos

```text id="lvgzmg"
tenantId como label
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
provider secret
webhook secret
tokens
cookies
Authorization header
SQL raw
stack trace en producción
```

---

### 32.3. Ejemplo de log seguro

```json id="tzws17"
{
  "action": "providerWebhook.processed",
  "outcome": "success",
  "providerKey": "mockHostedCheckout",
  "eventType": "payment.succeeded",
  "processingStatus": "processed",
  "currency": "USD",
  "durationMs": 186,
  "traceId": "req_123456"
}
```

---

## 33. Métricas seguras

### 33.1. Métricas permitidas

```text id="jfyyic"
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

---

### 33.2. Labels permitidos

```text id="i79wgs"
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

---

### 33.3. Labels prohibidos

```text id="idbtwh"
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

## 34. Seguridad de base de datos

### 34.1. Constraints críticos

```text id="fiwk4o"
amount > 0 en payment_intents
amount > 0 en payment_intent_items
amount > 0 en provider_transactions
gross_amount >= 0 en provider_settlement_records
fee_amount >= 0 si existe
net_amount >= 0 si existe
confirmed_at requerido si PaymentIntent status=succeeded
cancel_reason requerido si PaymentIntent status=cancelled
expired_at requerido si PaymentIntent status=expired
processed_at requerido si WebhookEvent processingStatus=processed
rejected_at requerido si WebhookEvent processingStatus=rejected
reverse_reason requerido si ProviderPaymentMapping status=reversed
card_last4 length <= 4
```

---

### 34.2. Índices únicos críticos

```text id="vu6srd"
providerKey único en payment_provider_definitions
enabled provider único por tenant/provider/environment
idempotencyKey único por tenant
providerIntentId único por tenant/provider
providerSessionId único por tenant/provider
providerEventId único por tenant/provider
providerTransactionId único por tenant/provider
active mapping único por ProviderTransaction
active mapping único por Payment
providerSettlementId único por tenant/provider
```

---

## 35. Seguridad transaccional

### 35.1. Operaciones transaccionales obligatorias

```text id="t05xlf"
- crear PaymentIntent con items;
- crear CheckoutSession y actualizar PaymentIntent;
- recibir webhook y crear ProviderWebhookEvent;
- procesar webhook y crear ProviderTransaction;
- crear Payment interno desde provider;
- crear PaymentAllocation;
- crear ProviderPaymentMapping;
- actualizar PaymentIntent=succeeded;
- reprocesar webhook fallido;
- reversar ProviderPaymentMapping;
- vincular settlement a BankTransaction;
- exportar reporte persistido.
```

---

### 35.2. Regla crítica

```text id="tmiol0"
Si no se puede crear Payment interno o ProviderPaymentMapping, el webhook no debe quedar como processed exitoso.
```

Alternativa futura:

```text id="a76p3d"
outbox pattern + estado pendingProviderProcessing
```

No aplica al MVP salvo decisión posterior.

---

## 36. Seguridad de concurrencia

### 36.1. PaymentIntent simultáneo

Riesgo:

```text id="bu6w8o"
Dos requests crean la misma intención.
```

Controles:

```text id="jg679r"
Idempotency-Key
unique index
payload logical hash
409 si payload diferente
```

---

### 36.2. CheckoutSession simultánea

Riesgo:

```text id="hhxcph"
Dos requests crean checkout para el mismo PaymentIntent.
```

Controles:

```text id="o99ids"
validación de estado
providerSessionId unique
transacción
policy explícita para regeneración
```

---

### 36.3. Webhook duplicado simultáneo

Riesgo:

```text id="y7odbv"
Dos webhooks idénticos llegan al mismo tiempo.
```

Controles:

```text id="toq69o"
providerEventId unique
providerTransactionId unique
active mapping unique
Payment creation transactional
respuesta idempotente
```

---

### 36.4. Webhook y cancelación simultánea

Riesgo:

```text id="b5lo1s"
Usuario cancela mientras llega webhook succeeded.
```

Control:

```text id="yn19te"
Validar estado dentro de transacción y registrar orden de eventos en auditoría.
```

---

## 37. Rate limiting y abuso

Aplicar rate limit a:

```text id="b8i4ku"
POST /api/v1/tenant/payment-providers
POST /api/v1/tenant/payment-providers/{id}/test-connection
POST /api/v1/tenant/payment-intents
POST /api/v1/me/payment-intents
POST /api/v1/tenant/payment-intents/{id}/checkout-sessions
POST /api/v1/me/payment-intents/{id}/checkout-sessions
POST /api/v1/webhooks/payment-providers/{providerKey}
POST /api/v1/tenant/payment-provider-webhook-events/{id}/reprocess
GET  /api/v1/tenant/payment-provider-reports/export
```

Estrategia:

```text id="qf3z1l"
- límites por usuario;
- límites por tenant;
- límites por providerKey;
- límites por endpoint;
- límites por IP para webhooks si aplica;
- payload size limit;
- alertas por firmas inválidas repetidas;
- alertas por duplicate webhook spike;
- alertas por amount mismatch;
- alertas por chargeback/refund events.
```

---

## 38. CORS, cache y headers

### 38.1. Cache

Todos los endpoints privados:

```http id="enqhql"
Cache-Control: no-store
```

---

### 38.2. CORS

Reglas:

```text id="hunpry"
- no wildcard con credenciales;
- permitir solo orígenes configurados;
- allowedOrigins tenant-scoped;
- no permitir WordPress público para operaciones financieras;
- checkoutUrl debe entregarse a cliente autorizado;
- webhooks no dependen de CORS.
```

---

### 38.3. Headers recomendados

```http id="s6d25y"
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Cache-Control: no-store
```

---

## 39. IA y procesamiento externo

### 39.1. Prohibición MVP

No enviar a servicios externos de IA:

```text id="kp0trp"
payloads reales de webhook
transacciones reales
pagos reales
comprobantes reales
provider references reales
cardLast4 real si vinculado a persona
nombres reales
emails reales
cédulas
tokens
secretos
exports reales
reportes financieros reales
```

---

### 39.2. Permitido

```text id="u4ycep"
fixtures sintéticos
payloads mock
documentación técnica
código sin secretos
tests con datos ficticios
diagramas sin datos reales
```

---

### 39.3. Feature flag

```text id="q4q8n4"
paymentProviderIntegration.aiRiskScoring.enabled = false
```

---

## 40. Backups y recuperación

Riesgos:

```text id="dzpsjx"
- ProviderTransaction existe sin Payment;
- Payment existe sin ProviderPaymentMapping;
- Webhook processed pero Payment falló;
- Settlement vinculado a BankTransaction restaurado parcialmente;
- SecretRef apunta a secreto inexistente;
- export existe sin secureDocumentFile.
```

Controles:

```text id="m6dwwv"
- transacciones DB;
- auditoría;
- job futuro de reconciliación interna;
- reproceso controlado de webhooks failed;
- verificación de SecretRefs;
- backup de DB;
- backup de storage;
- pruebas de restore;
- estados requiresReview.
```

---

## 41. Configuración segura

Variables recomendadas:

```text id="nlbr5u"
PAYMENT_PROVIDER_INTEGRATION_ENABLED=true
PAYMENT_PROVIDER_DEFAULT_ENVIRONMENT=sandbox
PAYMENT_PROVIDER_DEFAULT_CURRENCY=USD
PAYMENT_PROVIDER_PAYMENT_INTENT_TTL_MINUTES=30
PAYMENT_PROVIDER_CHECKOUT_SESSION_TTL_MINUTES=30
PAYMENT_PROVIDER_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS=300
PAYMENT_PROVIDER_WEBHOOK_REPLAY_PROTECTION_ENABLED=true
PAYMENT_PROVIDER_REQUIRE_SIGNATURE=true
PAYMENT_PROVIDER_REQUIRE_SERVER_VERIFICATION=false
PAYMENT_PROVIDER_MAX_WEBHOOK_PAYLOAD_BYTES=262144
PAYMENT_PROVIDER_REPORT_EXPORT_ENABLED=true
PAYMENT_PROVIDER_SETTLEMENTS_ENABLED=false
PAYMENT_PROVIDER_REFUNDS_ENABLED=false
PAYMENT_PROVIDER_CHARGEBACKS_ENABLED=false
PAYMENT_PROVIDER_RECURRING_PAYMENTS_ENABLED=false
PAYMENT_PROVIDER_ANONYMOUS_LINKS_ENABLED=false
PAYMENT_PROVIDER_AI_RISK_SCORING_ENABLED=false
```

Reglas:

```text id="mxpkpn"
- no secretos en repositorio;
- no secretos en logs;
- no datos reales en variables;
- sandbox por defecto;
- production explícito;
- signature required true;
- anonymous links false;
- AI false;
- refunds/chargebacks automáticos false.
```

---

## 42. Casos de abuso prioritarios

| Caso                                |  Riesgo | Control                                      |
| ----------------------------------- | ------: | -------------------------------------------- |
| Webhook falso crea Payment          | Crítico | firma + raw body + secret                    |
| Replay duplica Payment              | Crítico | providerEventId/providerTransactionId unique |
| Cliente manipula amount             | Crítico | server-side calculation                      |
| PaymentIntent con charge tenant B   | Crítico | tenant-scoped validation                     |
| Usuario paga unidad ajena           |    Alto | OwnResourceGuard                             |
| Secret value expuesto               | Crítico | SecretRef + DTO minimization                 |
| PAN/CVV almacenado                  | Crítico | hosted checkout + no card data               |
| CheckoutUrl en logs                 |    Alto | log sanitizer                                |
| Raw payload en logs                 |    Alto | payloadHash + preview                        |
| Redirect crea Payment               | Crítico | webhook-only confirmation                    |
| Refund automático no diseñado       |    Alto | requiresReview                               |
| Chargeback automático no diseñado   |    Alto | requiresReview                               |
| Settlement marca conciliación final |    Alto | Bank Reconciliation final authority          |
| Reporte incluye tenant B            | Crítico | tenant filters                               |
| WordPress confirma pago             | Crítico | no public financial endpoints                |
| IA procesa pagos reales             | Crítico | feature flag + policy                        |

---

## 43. Pruebas de seguridad obligatorias

### 43.1. Multitenancy

```text id="s6tx80"
tenant A no ve tenantPaymentProviderConfig tenant B
tenant A no ve PaymentIntent tenant B
tenant A no ve PaymentIntentItem tenant B
tenant A no ve CheckoutSession tenant B
tenant A no ve ProviderWebhookEvent tenant B
tenant A no ve ProviderTransaction tenant B
tenant A no ve ProviderPaymentMapping tenant B
tenant A no ve ProviderSettlementRecord tenant B
tenant A no usa chargeId tenant B
tenant A no usa paymentId tenant B
tenant A no usa bankAccountId tenant B
tenant A no usa bankTransactionId tenant B
```

---

### 43.2. Secretos

```text id="lxxtaf"
no credentialSecret value en DB
no webhookSecret value en DB
no secret value en responses
no secret value en logs
no secret value en audit
no SecretRef en /me
admin DTO solo muestra configured boolean
```

---

### 43.3. Datos de tarjeta

```text id="gvav0p"
no PAN en DB
no CVV en DB
no raw card data en DB
no PAN en logs
no CVV en logs
no PAN en audit
no CVV en audit
cardLast4 máximo 4 dígitos
payload con PAN se rechaza o sanitiza
```

---

### 43.4. Webhooks

```text id="bttmhq"
webhook sin firma no crea Payment
webhook con firma inválida no crea Payment
webhook con timestamp expirado no crea Payment
webhook duplicado no duplica Payment
webhook amount mismatch no crea Payment
webhook currency mismatch no crea Payment
webhook succeeded verificado crea Payment una vez
```

---

### 43.5. Endpoints públicos

```text id="qcut8b"
rutas /public de payment provider retornan 404
OpenAPI no documenta endpoints públicos administrativos
WordPress no confirma pagos
```

---

## 44. CI/CD security gates

El pipeline debe fallar si:

```text id="pqwjpx"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan domain tests;
- fallan repository tests;
- fallan service tests;
- fallan adapter tests;
- fallan secret tests;
- fallan webhook tests;
- fallan idempotency tests;
- fallan integration tests;
- fallan API tests;
- fallan authorization tests;
- fallan own-resource tests;
- fallan multitenancy tests;
- fallan financial integrity tests;
- fallan audit tests;
- fallan observability tests;
- fallan OpenAPI tests;
- fallan security tests;
- OpenAPI documenta endpoints públicos administrativos;
- snapshots contienen secretos;
- snapshots contienen PAN/CVV;
- snapshots contienen raw payload;
- snapshots contienen raw signature;
- logs contienen checkoutUrl;
- logs contienen secretos;
- audit contiene secretos;
- se detecta float/double para dinero;
- webhook inválido crea Payment;
- webhook duplicado crea Payment duplicado;
- amount mismatch crea Payment automático;
- currency mismatch crea Payment automático;
- redirect de navegador crea Payment;
- external AI está activa por defecto.
```

---

## 45. Checklist de seguridad para PR

Cada PR debe validar:

```text id="m7f4i8"
[ ] ¿Toda consulta tenant-scoped filtra por tenantId?
[ ] ¿Se evita findUnique por id simple?
[ ] ¿Se rechaza tenantId desde body?
[ ] ¿Se rechaza amount arbitrario para cargos/saldos?
[ ] ¿Se usa Decimal para dinero?
[ ] ¿Se evita float/double?
[ ] ¿Se protegen SecretRefs?
[ ] ¿No se exponen secret values?
[ ] ¿No se almacena PAN?
[ ] ¿No se almacena CVV?
[ ] ¿No se almacena raw card data?
[ ] ¿checkoutUrl no aparece en logs?
[ ] ¿raw webhook payload no aparece en logs?
[ ] ¿raw signature no aparece en logs?
[ ] ¿webhook requiere firma?
[ ] ¿webhook valida timestamp?
[ ] ¿webhook protege contra replay?
[ ] ¿webhook es idempotente?
[ ] ¿webhook duplicado no duplica Payment?
[ ] ¿Payment se crea solo con evento verificado?
[ ] ¿redirect del navegador no crea Payment?
[ ] ¿ProviderTransaction no reemplaza Payment?
[ ] ¿Account Statements se actualiza solo vía Payment?
[ ] ¿Bank Reconciliation conserva conciliación final?
[ ] ¿audit está sanitizada?
[ ] ¿logs están sanitizados?
[ ] ¿no hay endpoints públicos administrativos?
[ ] ¿OpenAPI no documenta endpoints públicos administrativos?
[ ] ¿IA externa sigue desactivada?
[ ] ¿tests críticos pasan?
```

---

## 46. Definition of Done de seguridad

El módulo cumple seguridad cuando:

```text id="chvg48"
- todas las tablas operativas tienen tenant_id;
- payment_provider_definitions queda platform-scoped;
- todas las consultas tenant-scoped filtran por tenantId;
- no se acepta tenantId desde body;
- no se acepta amount arbitrario como fuente de verdad;
- no se busca por id simple;
- SecretRefs se usan correctamente;
- secret values no se persisten;
- secret values no se exponen;
- secret values no se auditan;
- secret values no se loggean;
- no existe almacenamiento de PAN;
- no existe almacenamiento de CVV;
- no existe almacenamiento de raw card data;
- checkout externo funciona;
- checkoutUrl solo se entrega en respuesta inmediata autorizada;
- checkoutUrl no aparece en logs/audit/listados;
- PaymentIntent es idempotente;
- webhook usa raw body verification;
- webhook valida firma;
- webhook valida timestamp si aplica;
- webhook protege contra replay;
- webhook duplicado no duplica Payment;
- ProviderTransaction es única por tenant/provider;
- Payment se crea solo con webhook verificado;
- Payment no se crea desde redirect;
- amount mismatch no crea Payment automático;
- currency mismatch no crea Payment automático;
- refunds/chargebacks quedan requiresReview;
- Payment interno actualiza Account Statements;
- ProviderTransaction no actualiza saldos directamente;
- Settlement no marca conciliación bancaria final;
- reportes son tenant-scoped;
- export usa Secure Document Storage si persiste;
- no hay endpoints públicos administrativos;
- OpenAPI no documenta endpoints públicos administrativos;
- WordPress no confirma pagos;
- IA externa no procesa datos reales;
- CI pasa.
```

---

## 47. No aceptación

La implementación no debe aceptarse si:

```text id="ydso09"
- permite provider config cross-tenant;
- permite payment intent cross-tenant;
- permite checkout session cross-tenant;
- permite webhook event cross-tenant;
- permite provider transaction cross-tenant;
- permite payment mapping cross-tenant;
- permite settlement cross-tenant;
- permite crear PaymentIntent con charge de otro tenant;
- permite crear PaymentIntent sobre unidad ajena;
- acepta tenantId desde body;
- busca entidades tenant-scoped solo por id;
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
- usa amount enviado por cliente como fuente de verdad;
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

## 48. Resultado esperado

Al aplicar estas notas, `018-payment-provider-integration` quedará protegido como módulo financiero crítico de RESIDENT Core.

Debe garantizar:

```text id="vfz0pu"
tenant isolation
own-resource protection
provider-agnostic security
SecretRef strategy
no secret exposure
PCI-minimized design
no card data storage
hosted checkout
temporary checkoutUrl
server-side amount calculation
PaymentIntent idempotency
raw body webhook verification
webhook signature validation
webhook timestamp validation
replay protection
providerEventId idempotency
providerTransactionId uniqueness
Payment creation only from verified provider event
no Payment from browser redirect
no duplicate Payment
ProviderTransaction traceability
ProviderPaymentMapping uniqueness
refund/chargeback requiresReview
Account Statements updated only through Payment
Bank Reconciliation as final bank verification
Secure Document Storage safe exports
Notifications without sensitive data
safe audit
safe logs
safe metrics
safe OpenAPI
no public administrative endpoints
no WordPress payment confirmation
no external AI with real payment data
```

---

## 49. Expediente actualizado

```text id="kpr27l"
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
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 50. Cierre del paquete documental

Con este documento queda cerrado el paquete documental de:

```text id="gs68hj"
docs/specs/018-payment-provider-integration/
```

Archivos completados:

```text id="njrdqs"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

El módulo queda listo para pasar a implementación o para iniciar la siguiente especificación funcional del roadmap.
