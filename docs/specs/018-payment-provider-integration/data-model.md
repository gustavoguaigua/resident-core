# Data Model — Spec 018 Payment Provider Integration

## 1. Información del documento

| Campo                  | Valor                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                                                     |
| Spec ID                | 018                                                                                                                                               |
| Módulo                 | Payment Provider Integration                                                                                                                      |
| Documento              | Data Model                                                                                                                                        |
| Ruta                   | `docs/specs/018-payment-provider-integration/data-model.md`                                                                                       |
| Versión                | 0.1                                                                                                                                               |
| Estado                 | needs-review                                                                                                                                      |
| Fecha                  | 2026-07-22                                                                                                                                        |
| Documento base         | `docs/specs/018-payment-provider-integration/spec.md`                                                                                             |
| Plan técnico           | `docs/specs/018-payment-provider-integration/plan.md`                                                                                             |
| Base de datos          | PostgreSQL                                                                                                                                        |
| ORM                    | Prisma                                                                                                                                            |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                                                                     |
| Naturaleza             | Tenant-scoped / Provider-agnostic / Webhook-driven / Idempotent / Payment-aware / Audit-heavy / PCI-minimized / Non-public administrative surface |
| API Style              | REST                                                                                                                                              |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `018-payment-provider-integration`.

El módulo permite registrar proveedores de pago soportados, configurar proveedores por tenant, crear intenciones de pago, crear sesiones de checkout externo, recibir webhooks firmados, registrar eventos del proveedor, mapear transacciones externas hacia pagos internos, registrar liquidaciones básicas y generar reportes financieros seguros.

Regla central:

```text id="afq3t7"
Toda definición de proveedor, configuración tenant, intención de pago, item, sesión de checkout, webhook, transacción, mapping, settlement y reporte debe proteger tenant isolation, secretos, datos de tarjeta, idempotencia, integridad financiera, auditoría, trazabilidad y ausencia de endpoints administrativos públicos.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán nueve tablas principales:

```text id="rf0wbs"
payment_provider_definitions
tenant_payment_provider_configs
payment_intents
payment_intent_items
payment_checkout_sessions
provider_webhook_events
provider_transactions
provider_payment_mappings
provider_settlement_records
```

Estas tablas permiten cubrir:

```text id="kh0y4k"
- catálogo platform de proveedores soportados;
- configuración segura por tenant;
- referencias a secretos, no secretos reales;
- intenciones internas de pago;
- items pagables;
- checkout externo temporal;
- recepción y trazabilidad de webhooks;
- verificación e idempotencia;
- transacciones externas del proveedor;
- vínculo entre proveedor y Payment interno;
- settlement básico;
- reportes;
- auditoría;
- integración con Payments;
- integración con Account Statements;
- integración con Bank Reconciliation;
- integración con Secure Document Storage.
```

---

## 4. Tablas nuevas MVP

```text id="qr692g"
payment_provider_definitions
tenant_payment_provider_configs
payment_intents
payment_intent_items
payment_checkout_sessions
provider_webhook_events
provider_transactions
provider_payment_mappings
provider_settlement_records
```

---

## 5. Tablas externas relacionadas

```text id="zhor88"
tenants
user_profiles
persons
property_units
charges
payments
payment_allocations
payment_receipts
account_statements
bank_accounts
bank_transactions
secure_documents
secure_document_files
audit_logs
notification_events
```

| Tabla externa           | Spec origen                        | Uso                                                                        |
| ----------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `tenants`               | `001-tenants`                      | Tenant propietario de configuraciones, intents, transactions y settlements |
| `user_profiles`         | `002-users-roles`                  | Actor que configura, inicia, cancela, reprocesa o consulta                 |
| `persons`               | `003-residents-properties`         | Persona vinculada al usuario que inicia pago propio                        |
| `property_units`        | `003-residents-properties`         | Unidad asociada al pago                                                    |
| `charges`               | `004-dues-fees`                    | Cargos pagables                                                            |
| `payments`              | `005-payments`                     | Pago interno creado desde proveedor verificado                             |
| `payment_allocations`   | `005-payments`                     | Asignación del pago a cargos                                               |
| `payment_receipts`      | `005-payments`                     | Comprobante interno si aplica                                              |
| `account_statements`    | `006-account-statements`           | Saldo y estado de cuenta derivados de pagos                                |
| `bank_accounts`         | `017-bank-reconciliation`          | Cuenta bancaria de settlement si aplica                                    |
| `bank_transactions`     | `017-bank-reconciliation`          | Movimiento bancario vinculado a settlement                                 |
| `secure_documents`      | `016-secure-document-storage`      | Comprobantes/exports persistidos                                           |
| `secure_document_files` | `016-secure-document-storage`      | Archivo de comprobante o export                                            |
| `audit_logs`            | `007-audit`                        | Auditoría transversal                                                      |
| `notification_events`   | `012-communications-notifications` | Notificaciones de pago iniciado/exitoso/fallido                            |

---

# 6. Entidad `PaymentProviderDefinition`

## 6.1. Propósito

Representa un proveedor soportado por la plataforma RESIDENT.

Ejemplos conceptuales:

```text id="e0jvyi"
Mock Provider
Sandbox Hosted Checkout
Datafast futuro
PayPhone futuro
Kushki futuro
Stripe futuro
PayPal futuro
```

Esta entidad es platform-scoped, no tenant-scoped.

---

## 6.2. Tabla

```text id="pr4etw"
payment_provider_definitions
```

---

## 6.3. Campos

```text id="dl5u9b"
PaymentProviderDefinition
├── id
├── providerKey
├── displayName
├── description
├── status
├── supportedEnvironments
├── supportedCurrencies
├── supportedPaymentMethods
├── supportsHostedCheckout
├── supportsWebhooks
├── supportsRefunds
├── supportsInstallments
├── supportsSettlements
├── createdBy
├── updatedBy
├── activatedBy
├── deprecatedBy
├── archivedBy
├── createdAt
├── updatedAt
├── activatedAt
├── deprecatedAt
├── archivedAt
├── deprecationReason
├── archiveReason
└── metadata
```

---

## 6.4. Reglas

```text id="fc8ni9"
- providerKey obligatorio y único.
- providerKey debe ser estable.
- displayName obligatorio.
- status obligatorio.
- supportedEnvironments debe incluir sandbox o production.
- supportedCurrencies MVP debe incluir USD.
- supportedPaymentMethods no debe estar vacío.
- supportsHostedCheckout debe ser true para MVP operativo.
- supportsWebhooks debe ser true para providers que confirman pagos.
- No contiene credenciales tenant.
- No contiene secretos.
- No contiene datos de tarjeta.
- No eliminar físicamente.
```

---

# 7. Entidad `TenantPaymentProviderConfig`

## 7.1. Propósito

Representa la configuración de un proveedor de pago para un tenant.

Permite que cada conjunto tenga su propio proveedor, ambiente, configuración pública, referencia a credenciales, referencia a secreto de webhook y cuenta bancaria de liquidación.

---

## 7.2. Tabla

```text id="n4rb82"
tenant_payment_provider_configs
```

---

## 7.3. Campos

```text id="zav9ji"
TenantPaymentProviderConfig
├── id
├── tenantId
├── providerDefinitionId
├── providerKey
├── environment
├── status
├── displayName
├── currency
├── credentialSecretRef
├── webhookSecretRef
├── publicConfig
├── settlementBankAccountId
├── webhookEndpointPath
├── returnUrl
├── cancelUrl
├── allowedOrigins
├── createdBy
├── updatedBy
├── enabledBy
├── disabledBy
├── testedBy
├── invalidatedBy
├── archivedBy
├── createdAt
├── updatedAt
├── enabledAt
├── disabledAt
├── testedAt
├── invalidatedAt
├── archivedAt
├── disableReason
├── invalidReason
├── archiveReason
└── metadata
```

---

## 7.4. Reglas

```text id="vekpou"
- tenantId obligatorio.
- providerDefinitionId obligatorio.
- providerKey obligatorio.
- providerKey debe coincidir con PaymentProviderDefinition.providerKey.
- environment obligatorio: sandbox o production.
- status obligatorio.
- currency obligatoria.
- MVP currency = USD.
- credentialSecretRef obligatorio para enable en proveedores reales.
- webhookSecretRef obligatorio para providers con webhooks.
- secret refs no deben exponerse a /me.
- secret values nunca se guardan en esta tabla.
- publicConfig solo contiene configuración no sensible.
- settlementBankAccountId, si existe, debe pertenecer al mismo tenant.
- enabled requiere configuración válida.
- disabled no permite crear nuevos PaymentIntent.
- archived no permite operación.
- No eliminar físicamente.
```

---

# 8. Entidad `PaymentIntent`

## 8.1. Propósito

Representa una intención interna de pago creada por RESIDENT Core.

Un PaymentIntent expresa:

```text id="ioi3w0"
quién quiere pagar,
qué quiere pagar,
cuánto debe pagar,
en qué moneda,
qué proveedor usará,
en qué estado se encuentra el flujo.
```

---

## 8.2. Tabla

```text id="u9i4ig"
payment_intents
```

---

## 8.3. Campos

```text id="idbzrc"
PaymentIntent
├── id
├── tenantId
├── tenantProviderConfigId
├── initiatedByUserId
├── personId
├── propertyUnitId
├── sourceModule
├── sourceResourceType
├── sourceResourceId
├── paymentPurpose
├── amount
├── currency
├── status
├── idempotencyKey
├── providerIntentId
├── providerSessionId
├── activeCheckoutSessionId
├── checkoutUrlExpiresAt
├── expiresAt
├── returnUrl
├── cancelUrl
├── confirmedPaymentId
├── createdAt
├── updatedAt
├── checkoutCreatedAt
├── pendingProviderConfirmationAt
├── confirmedAt
├── failedAt
├── cancelledAt
├── expiredAt
├── reversedAt
├── archivedAt
├── failReason
├── cancelReason
├── reverseReason
├── archiveReason
└── metadata
```

---

## 8.4. Reglas

```text id="exvyn6"
- tenantId obligatorio.
- tenantProviderConfigId obligatorio y del mismo tenant.
- initiatedByUserId obligatorio.
- personId requerido para flujo /me si el usuario está vinculado a persona.
- propertyUnitId requerido cuando se paga saldo/cargo de unidad.
- amount obligatorio como Decimal.
- amount > 0.
- currency obligatoria.
- MVP currency = USD.
- status obligatorio.
- idempotencyKey recomendado.
- providerIntentId opcional según proveedor.
- providerSessionId opcional según proveedor.
- activeCheckoutSessionId apunta a la sesión vigente.
- returnUrl/cancelUrl no confirman pago.
- confirmedPaymentId se setea solo cuando se crea Payment interno.
- No se acepta amount del cliente como fuente de verdad para cargos/saldos.
- No se crea Payment sin webhook verificado.
- No eliminar físicamente.
```

---

# 9. Entidad `PaymentIntentItem`

## 9.1. Propósito

Representa cada elemento que el PaymentIntent desea pagar.

Permite soportar:

```text id="g3ptrj"
- cargos específicos;
- saldo total;
- multa;
- reserva;
- item manual administrativo controlado.
```

---

## 9.2. Tabla

```text id="mb66ql"
payment_intent_items
```

---

## 9.3. Campos

```text id="qza67p"
PaymentIntentItem
├── id
├── tenantId
├── paymentIntentId
├── itemType
├── chargeId
├── fineId
├── reservationId
├── accountStatementId
├── propertyUnitId
├── description
├── amount
├── currency
├── createdAt
└── metadata
```

---

## 9.4. Reglas

```text id="ag9s4g"
- tenantId obligatorio.
- paymentIntentId obligatorio y del mismo tenant.
- itemType obligatorio.
- amount obligatorio como Decimal.
- amount > 0.
- currency obligatoria.
- MVP currency = USD.
- chargeId, si existe, debe pertenecer al tenant.
- propertyUnitId, si existe, debe pertenecer al tenant.
- Si itemType=charge, chargeId obligatorio.
- Si itemType=accountBalance, propertyUnitId obligatorio.
- Si itemType=fine, fineId obligatorio cuando el módulo esté integrado.
- Si itemType=reservation, reservationId obligatorio cuando el módulo esté integrado.
- description debe estar sanitizada.
- No usar items para crear cargos nuevos.
- No eliminar físicamente de forma ordinaria.
```

---

# 10. Entidad `PaymentCheckoutSession`

## 10.1. Propósito

Representa una sesión de checkout creada en el proveedor externo.

El usuario autorizado puede recibir temporalmente `providerCheckoutUrl` para completar el pago fuera de RESIDENT Core.

---

## 10.2. Tabla

```text id="c5rr4c"
payment_checkout_sessions
```

---

## 10.3. Campos

```text id="ct174j"
PaymentCheckoutSession
├── id
├── tenantId
├── paymentIntentId
├── tenantProviderConfigId
├── providerKey
├── providerSessionId
├── providerCheckoutUrl
├── checkoutUrlHash
├── status
├── expiresAt
├── openedAt
├── completedAt
├── failedAt
├── cancelledAt
├── archivedAt
├── createdAt
├── updatedAt
├── failReason
├── cancelReason
├── archiveReason
└── metadata
```

---

## 10.4. Reglas

```text id="kd6vhv"
- tenantId obligatorio.
- paymentIntentId obligatorio y del mismo tenant.
- tenantProviderConfigId obligatorio y del mismo tenant.
- providerKey obligatorio.
- providerSessionId recomendado.
- providerCheckoutUrl puede persistirse solo si se considera necesario y con TTL corto.
- providerCheckoutUrl no debe registrarse en logs.
- providerCheckoutUrl no debe exponerse después de expirar.
- checkoutUrlHash puede usarse para control interno.
- status obligatorio.
- expiresAt obligatorio.
- No crear sesiones para PaymentIntent succeeded, failed, cancelled, expired o archived.
- No eliminar físicamente.
```

Nota de seguridad:

```text id="cs1vfp"
Si se decide no persistir providerCheckoutUrl, guardar únicamente checkoutUrlHash, providerSessionId y expiresAt. La API puede devolver la URL únicamente en la respuesta inmediata de creación.
```

---

# 11. Entidad `ProviderWebhookEvent`

## 11.1. Propósito

Representa un webhook recibido desde el proveedor.

Debe permitir:

```text id="m0dsga"
- trazabilidad;
- verificación de firma;
- protección contra replay;
- idempotencia;
- reproceso controlado;
- auditoría;
- diagnóstico sin exponer payload completo.
```

---

## 11.2. Tabla

```text id="sq8751"
provider_webhook_events
```

---

## 11.3. Campos

```text id="n7lp54"
ProviderWebhookEvent
├── id
├── tenantId
├── providerKey
├── tenantProviderConfigId
├── providerEventId
├── eventType
├── signatureStatus
├── processingStatus
├── receivedAt
├── processedAt
├── rejectedAt
├── failedAt
├── archivedAt
├── idempotencyKey
├── payloadHash
├── payloadPreview
├── signatureHeaderHash
├── providerTimestamp
├── retryCount
├── lastRetryAt
├── errorCode
├── errorMessage
├── archiveReason
└── metadata
```

---

## 11.4. Reglas

```text id="yq6t5u"
- tenantId obligatorio cuando el tenant puede resolverse.
- providerKey obligatorio.
- tenantProviderConfigId obligatorio cuando el config puede resolverse.
- providerEventId obligatorio si el proveedor lo entrega.
- eventType obligatorio si el evento pudo parsearse.
- signatureStatus obligatorio.
- processingStatus obligatorio.
- payloadHash obligatorio.
- payloadPreview debe estar sanitizado y truncado.
- signatureHeaderHash permite trazabilidad sin guardar firma completa.
- No guardar raw signature.
- No guardar webhookSecret.
- No guardar payload completo sensible.
- No guardar datos de tarjeta.
- No eliminar físicamente.
```

Nota:

```text id="q8ss5j"
Si no se puede resolver tenant por firma/config, registrar el evento con tenantId nullable solo si el diseño de auditoría global lo permite. En ese caso, debe considerarse evento técnico platform-scoped y no debe exponer detalles.
```

---

# 12. Entidad `ProviderTransaction`

## 12.1. Propósito

Representa la transacción externa reportada por el proveedor.

No reemplaza al Payment interno. Es evidencia técnica de proveedor.

Regla:

```text id="o5hxwf"
ProviderTransaction no es fuente final del estado de cuenta; Payment interno sí lo es.
```

---

## 12.2. Tabla

```text id="om8m6d"
provider_transactions
```

---

## 12.3. Campos

```text id="rjjua4"
ProviderTransaction
├── id
├── tenantId
├── paymentIntentId
├── providerWebhookEventId
├── tenantProviderConfigId
├── providerKey
├── providerTransactionId
├── providerReference
├── providerStatus
├── internalStatus
├── amount
├── currency
├── feeAmount
├── netAmount
├── paymentMethodType
├── cardBrand
├── cardLast4
├── authorizationCodePreview
├── providerProcessedAt
├── processedAt
├── settledAt
├── createdAt
├── updatedAt
├── requiresReviewAt
├── archivedAt
├── reviewReason
├── archiveReason
└── metadata
```

---

## 12.4. Reglas

```text id="ajj8tu"
- tenantId obligatorio.
- paymentIntentId obligatorio y del mismo tenant si se relaciona a intent.
- tenantProviderConfigId obligatorio y del mismo tenant.
- providerKey obligatorio.
- providerTransactionId obligatorio cuando el proveedor lo entregue.
- providerStatus obligatorio.
- internalStatus obligatorio.
- amount obligatorio como Decimal.
- amount > 0.
- currency obligatoria.
- MVP currency = USD.
- feeAmount >= 0 si existe.
- netAmount puede ser amount - feeAmount si el proveedor lo reporta.
- cardLast4 permitido.
- cardBrand permitido.
- PAN prohibido.
- CVV prohibido.
- raw card data prohibido.
- authorizationCodePreview debe ser parcial/sanitizado.
- No eliminar físicamente.
```

---

# 13. Entidad `ProviderPaymentMapping`

## 13.1. Propósito

Representa el vínculo entre:

```text id="a8o14o"
PaymentIntent
ProviderTransaction
Payment interno
```

Permite asegurar que una transacción externa cree como máximo un Payment interno activo.

---

## 13.2. Tabla

```text id="hypm2e"
provider_payment_mappings
```

---

## 13.3. Campos

```text id="xm0r74"
ProviderPaymentMapping
├── id
├── tenantId
├── paymentIntentId
├── providerTransactionId
├── paymentId
├── mappingStatus
├── createdBy
├── reversedBy
├── archivedBy
├── createdAt
├── reversedAt
├── archivedAt
├── reverseReason
├── archiveReason
└── metadata
```

---

## 13.4. Reglas

```text id="u4vg6w"
- tenantId obligatorio.
- paymentIntentId obligatorio y del mismo tenant.
- providerTransactionId obligatorio y del mismo tenant.
- paymentId obligatorio y del mismo tenant.
- mappingStatus obligatorio.
- Una ProviderTransaction activa no puede mapear a más de un Payment activo.
- Reverso requiere reverseReason.
- No eliminar físicamente.
```

---

# 14. Entidad `ProviderSettlementRecord`

## 14.1. Propósito

Representa información básica de liquidación del proveedor hacia cuenta bancaria, si el proveedor la entrega.

No reemplaza la conciliación bancaria.

Regla:

```text id="v0wvp7"
ProviderSettlementRecord ayuda a Bank Reconciliation, pero no sustituye la verificación contra movimientos bancarios reales.
```

---

## 14.2. Tabla

```text id="zc24nc"
provider_settlement_records
```

---

## 14.3. Campos

```text id="itgy4b"
ProviderSettlementRecord
├── id
├── tenantId
├── tenantProviderConfigId
├── providerKey
├── providerSettlementId
├── settlementDate
├── grossAmount
├── feeAmount
├── netAmount
├── currency
├── status
├── bankAccountId
├── bankTransactionId
├── createdAt
├── updatedAt
├── linkedAt
├── archivedAt
├── linkReason
├── archiveReason
└── metadata
```

---

## 14.4. Reglas

```text id="vcct9n"
- tenantId obligatorio.
- tenantProviderConfigId obligatorio y del mismo tenant.
- providerKey obligatorio.
- providerSettlementId obligatorio si el proveedor lo entrega.
- settlementDate obligatoria.
- grossAmount obligatorio como Decimal.
- grossAmount >= 0.
- feeAmount >= 0 si existe.
- netAmount >= 0 si existe.
- currency obligatoria.
- MVP currency = USD.
- bankAccountId, si existe, debe pertenecer al tenant.
- bankTransactionId, si existe, debe pertenecer al tenant.
- status obligatorio.
- No marcar conciliación bancaria final desde settlement.
- No eliminar físicamente.
```

---

# 15. Enums

## 15.1. `PaymentProviderDefinitionStatus`

```text id="nzsy3c"
draft
active
inactive
deprecated
archived
```

---

## 15.2. `PaymentProviderEnvironment`

```text id="thvfa4"
sandbox
production
```

---

## 15.3. `TenantPaymentProviderConfigStatus`

```text id="txlfvu"
draft
enabled
disabled
invalid
archived
```

---

## 15.4. `PaymentMethodType`

```text id="ed5hr7"
card
bankTransfer
wallet
paymentButton
qr
cashNetwork
other
```

MVP recomendado:

```text id="trbpjr"
card
paymentButton
other
```

---

## 15.5. `PaymentIntentStatus`

```text id="ywfccj"
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

## 15.6. `PaymentIntentPurpose`

```text id="hws98h"
payCharges
payAccountBalance
payFine
payReservation
payOther
```

---

## 15.7. `PaymentIntentItemType`

```text id="e3g5wc"
charge
fine
reservation
accountBalance
manualItem
other
```

---

## 15.8. `CheckoutSessionStatus`

```text id="f14qir"
created
opened
completed
failed
cancelled
expired
archived
```

---

## 15.9. `ProviderWebhookSignatureStatus`

```text id="l3do8m"
notVerified
verified
invalid
missing
unsupported
```

---

## 15.10. `ProviderWebhookProcessingStatus`

```text id="t961vh"
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

## 15.11. `ProviderTransactionStatus`

```text id="zqafgj"
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

## 15.12. `InternalProviderPaymentStatus`

```text id="n10j2d"
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

## 15.13. `ProviderPaymentMappingStatus`

```text id="kyqa07"
active
reversed
failed
archived
```

---

## 15.14. `ProviderSettlementStatus`

```text id="o0ef74"
pending
settled
failed
reversed
unknown
```

---

## 15.15. `PaymentProviderSourceModule`

```text id="tt8qdi"
duesFees
payments
accountStatements
fines
reservations
system
other
```

---

## 15.16. `PaymentProviderHashAlgorithm`

```text id="jwq6zb"
SHA-256
```

---

# 16. Modelo Prisma preliminar

## 16.1. Enums Prisma

```prisma id="k3wspp"
enum PaymentProviderDefinitionStatus {
  DRAFT      @map("draft")
  ACTIVE     @map("active")
  INACTIVE   @map("inactive")
  DEPRECATED @map("deprecated")
  ARCHIVED   @map("archived")

  @@map("payment_provider_definition_status")
}

enum PaymentProviderEnvironment {
  SANDBOX    @map("sandbox")
  PRODUCTION @map("production")

  @@map("payment_provider_environment")
}

enum TenantPaymentProviderConfigStatus {
  DRAFT    @map("draft")
  ENABLED  @map("enabled")
  DISABLED @map("disabled")
  INVALID  @map("invalid")
  ARCHIVED @map("archived")

  @@map("tenant_payment_provider_config_status")
}

enum PaymentMethodType {
  CARD           @map("card")
  BANK_TRANSFER  @map("bankTransfer")
  WALLET         @map("wallet")
  PAYMENT_BUTTON @map("paymentButton")
  QR             @map("qr")
  CASH_NETWORK   @map("cashNetwork")
  OTHER          @map("other")

  @@map("payment_method_type")
}

enum PaymentIntentStatus {
  DRAFT                         @map("draft")
  CREATED                       @map("created")
  CHECKOUT_CREATED              @map("checkoutCreated")
  PENDING_PROVIDER_CONFIRMATION @map("pendingProviderConfirmation")
  SUCCEEDED                     @map("succeeded")
  FAILED                        @map("failed")
  CANCELLED                     @map("cancelled")
  EXPIRED                       @map("expired")
  REVERSED                      @map("reversed")
  ARCHIVED                      @map("archived")

  @@map("payment_intent_status")
}

enum PaymentIntentPurpose {
  PAY_CHARGES         @map("payCharges")
  PAY_ACCOUNT_BALANCE @map("payAccountBalance")
  PAY_FINE            @map("payFine")
  PAY_RESERVATION     @map("payReservation")
  PAY_OTHER           @map("payOther")

  @@map("payment_intent_purpose")
}

enum PaymentIntentItemType {
  CHARGE          @map("charge")
  FINE            @map("fine")
  RESERVATION     @map("reservation")
  ACCOUNT_BALANCE @map("accountBalance")
  MANUAL_ITEM     @map("manualItem")
  OTHER           @map("other")

  @@map("payment_intent_item_type")
}

enum CheckoutSessionStatus {
  CREATED   @map("created")
  OPENED    @map("opened")
  COMPLETED @map("completed")
  FAILED    @map("failed")
  CANCELLED @map("cancelled")
  EXPIRED   @map("expired")
  ARCHIVED  @map("archived")

  @@map("checkout_session_status")
}

enum ProviderWebhookSignatureStatus {
  NOT_VERIFIED @map("notVerified")
  VERIFIED     @map("verified")
  INVALID      @map("invalid")
  MISSING      @map("missing")
  UNSUPPORTED  @map("unsupported")

  @@map("provider_webhook_signature_status")
}

enum ProviderWebhookProcessingStatus {
  RECEIVED   @map("received")
  IGNORED    @map("ignored")
  PROCESSING @map("processing")
  PROCESSED  @map("processed")
  DUPLICATE  @map("duplicate")
  FAILED     @map("failed")
  REJECTED   @map("rejected")
  ARCHIVED   @map("archived")

  @@map("provider_webhook_processing_status")
}

enum ProviderTransactionStatus {
  PENDING            @map("pending")
  AUTHORIZED         @map("authorized")
  CAPTURED           @map("captured")
  SUCCEEDED          @map("succeeded")
  FAILED             @map("failed")
  CANCELLED          @map("cancelled")
  EXPIRED            @map("expired")
  REFUNDED           @map("refunded")
  PARTIALLY_REFUNDED @map("partiallyRefunded")
  CHARGEBACK         @map("chargeback")
  UNKNOWN            @map("unknown")

  @@map("provider_transaction_status")
}

enum InternalProviderPaymentStatus {
  PENDING          @map("pending")
  VERIFIED         @map("verified")
  PAYMENT_CREATED  @map("paymentCreated")
  PAYMENT_LINKED   @map("paymentLinked")
  FAILED           @map("failed")
  CANCELLED        @map("cancelled")
  REVERSED         @map("reversed")
  REQUIRES_REVIEW  @map("requiresReview")
  IGNORED          @map("ignored")

  @@map("internal_provider_payment_status")
}

enum ProviderPaymentMappingStatus {
  ACTIVE   @map("active")
  REVERSED @map("reversed")
  FAILED   @map("failed")
  ARCHIVED @map("archived")

  @@map("provider_payment_mapping_status")
}

enum ProviderSettlementStatus {
  PENDING  @map("pending")
  SETTLED  @map("settled")
  FAILED   @map("failed")
  REVERSED @map("reversed")
  UNKNOWN  @map("unknown")

  @@map("provider_settlement_status")
}

enum PaymentProviderSourceModule {
  DUES_FEES          @map("duesFees")
  PAYMENTS           @map("payments")
  ACCOUNT_STATEMENTS @map("accountStatements")
  FINES              @map("fines")
  RESERVATIONS       @map("reservations")
  SYSTEM             @map("system")
  OTHER              @map("other")

  @@map("payment_provider_source_module")
}

enum PaymentProviderHashAlgorithm {
  SHA_256 @map("SHA-256")

  @@map("payment_provider_hash_algorithm")
}
```

---

## 16.2. Modelo `PaymentProviderDefinition`

```prisma id="zjo9w2"
model PaymentProviderDefinition {
  id                       String                          @id @default(uuid())

  providerKey              String                          @unique @map("provider_key")
  displayName              String                          @map("display_name")
  description              String?
  status                   PaymentProviderDefinitionStatus @default(DRAFT)

  supportedEnvironments    Json                            @map("supported_environments")
  supportedCurrencies      Json                            @map("supported_currencies")
  supportedPaymentMethods  Json                            @map("supported_payment_methods")

  supportsHostedCheckout   Boolean                         @default(true) @map("supports_hosted_checkout")
  supportsWebhooks         Boolean                         @default(true) @map("supports_webhooks")
  supportsRefunds          Boolean                         @default(false) @map("supports_refunds")
  supportsInstallments     Boolean                         @default(false) @map("supports_installments")
  supportsSettlements      Boolean                         @default(false) @map("supports_settlements")

  createdBy                String?                         @map("created_by")
  updatedBy                String?                         @map("updated_by")
  activatedBy              String?                         @map("activated_by")
  deprecatedBy             String?                         @map("deprecated_by")
  archivedBy               String?                         @map("archived_by")

  createdAt                DateTime                        @default(now()) @map("created_at")
  updatedAt                DateTime                        @updatedAt @map("updated_at")
  activatedAt              DateTime?                       @map("activated_at")
  deprecatedAt             DateTime?                       @map("deprecated_at")
  archivedAt               DateTime?                       @map("archived_at")

  deprecationReason        String?                         @map("deprecation_reason")
  archiveReason            String?                         @map("archive_reason")
  metadata                 Json?

  createdByUser            UserProfile?                    @relation("PaymentProviderDefinitionCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser            UserProfile?                    @relation("PaymentProviderDefinitionUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  activatedByUser          UserProfile?                    @relation("PaymentProviderDefinitionActivatedBy", fields: [activatedBy], references: [id], onDelete: Restrict)
  deprecatedByUser         UserProfile?                    @relation("PaymentProviderDefinitionDeprecatedBy", fields: [deprecatedBy], references: [id], onDelete: Restrict)
  archivedByUser           UserProfile?                    @relation("PaymentProviderDefinitionArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  tenantConfigs            TenantPaymentProviderConfig[]

  @@index([status])
  @@index([providerKey])
  @@index([createdAt])
  @@index([archivedAt])
  @@map("payment_provider_definitions")
}
```

---

## 16.3. Modelo `TenantPaymentProviderConfig`

```prisma id="n1le2a"
model TenantPaymentProviderConfig {
  id                    String                            @id @default(uuid())
  tenantId              String                            @map("tenant_id")
  providerDefinitionId  String                            @map("provider_definition_id")

  providerKey           String                            @map("provider_key")
  environment           PaymentProviderEnvironment
  status                TenantPaymentProviderConfigStatus @default(DRAFT)
  displayName           String?                           @map("display_name")
  currency              Currency                          @default(USD)

  credentialSecretRef   String?                           @map("credential_secret_ref")
  webhookSecretRef      String?                           @map("webhook_secret_ref")
  publicConfig          Json?                             @map("public_config")

  settlementBankAccountId String?                         @map("settlement_bank_account_id")

  webhookEndpointPath   String?                           @map("webhook_endpoint_path")
  returnUrl             String?                           @map("return_url")
  cancelUrl             String?                           @map("cancel_url")
  allowedOrigins        Json?                             @map("allowed_origins")

  createdBy             String?                           @map("created_by")
  updatedBy             String?                           @map("updated_by")
  enabledBy             String?                           @map("enabled_by")
  disabledBy            String?                           @map("disabled_by")
  testedBy              String?                           @map("tested_by")
  invalidatedBy         String?                           @map("invalidated_by")
  archivedBy            String?                           @map("archived_by")

  createdAt             DateTime                          @default(now()) @map("created_at")
  updatedAt             DateTime                          @updatedAt @map("updated_at")
  enabledAt             DateTime?                         @map("enabled_at")
  disabledAt            DateTime?                         @map("disabled_at")
  testedAt              DateTime?                         @map("tested_at")
  invalidatedAt         DateTime?                         @map("invalidated_at")
  archivedAt            DateTime?                         @map("archived_at")

  disableReason         String?                           @map("disable_reason")
  invalidReason         String?                           @map("invalid_reason")
  archiveReason         String?                           @map("archive_reason")
  metadata              Json?

  tenant                Tenant                            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  providerDefinition    PaymentProviderDefinition         @relation(fields: [providerDefinitionId], references: [id], onDelete: Restrict)
  settlementBankAccount BankAccount?                      @relation(fields: [settlementBankAccountId], references: [id], onDelete: Restrict)

  createdByUser         UserProfile?                      @relation("TenantPaymentProviderConfigCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser         UserProfile?                      @relation("TenantPaymentProviderConfigUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  enabledByUser         UserProfile?                      @relation("TenantPaymentProviderConfigEnabledBy", fields: [enabledBy], references: [id], onDelete: Restrict)
  disabledByUser        UserProfile?                      @relation("TenantPaymentProviderConfigDisabledBy", fields: [disabledBy], references: [id], onDelete: Restrict)
  testedByUser          UserProfile?                      @relation("TenantPaymentProviderConfigTestedBy", fields: [testedBy], references: [id], onDelete: Restrict)
  invalidatedByUser     UserProfile?                      @relation("TenantPaymentProviderConfigInvalidatedBy", fields: [invalidatedBy], references: [id], onDelete: Restrict)
  archivedByUser        UserProfile?                      @relation("TenantPaymentProviderConfigArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  paymentIntents        PaymentIntent[]
  checkoutSessions      PaymentCheckoutSession[]
  webhookEvents         ProviderWebhookEvent[]
  providerTransactions  ProviderTransaction[]
  settlements           ProviderSettlementRecord[]

  @@index([tenantId])
  @@index([tenantId, providerDefinitionId])
  @@index([tenantId, providerKey])
  @@index([tenantId, environment])
  @@index([tenantId, status])
  @@index([tenantId, currency])
  @@index([tenantId, settlementBankAccountId])
  @@index([tenantId, createdAt])
  @@index([tenantId, archivedAt])
  @@map("tenant_payment_provider_configs")
}
```

---

## 16.4. Modelo `PaymentIntent`

```prisma id="jvspci"
model PaymentIntent {
  id                            String                 @id @default(uuid())
  tenantId                      String                 @map("tenant_id")
  tenantProviderConfigId        String                 @map("tenant_provider_config_id")

  initiatedByUserId             String                 @map("initiated_by_user_id")
  personId                      String?                @map("person_id")
  propertyUnitId                String?                @map("property_unit_id")

  sourceModule                  PaymentProviderSourceModule @map("source_module")
  sourceResourceType            String?                @map("source_resource_type")
  sourceResourceId              String?                @map("source_resource_id")
  paymentPurpose                PaymentIntentPurpose   @map("payment_purpose")

  amount                        Decimal                @db.Decimal(12, 2)
  currency                      Currency               @default(USD)
  status                        PaymentIntentStatus    @default(CREATED)

  idempotencyKey                String?                @map("idempotency_key")
  providerIntentId              String?                @map("provider_intent_id")
  providerSessionId             String?                @map("provider_session_id")
  activeCheckoutSessionId       String?                @map("active_checkout_session_id")
  checkoutUrlExpiresAt          DateTime?              @map("checkout_url_expires_at")
  expiresAt                     DateTime               @map("expires_at")

  returnUrl                     String?                @map("return_url")
  cancelUrl                     String?                @map("cancel_url")

  confirmedPaymentId            String?                @map("confirmed_payment_id")

  createdAt                     DateTime               @default(now()) @map("created_at")
  updatedAt                     DateTime               @updatedAt @map("updated_at")
  checkoutCreatedAt             DateTime?              @map("checkout_created_at")
  pendingProviderConfirmationAt DateTime?              @map("pending_provider_confirmation_at")
  confirmedAt                   DateTime?              @map("confirmed_at")
  failedAt                      DateTime?              @map("failed_at")
  cancelledAt                   DateTime?              @map("cancelled_at")
  expiredAt                     DateTime?              @map("expired_at")
  reversedAt                    DateTime?              @map("reversed_at")
  archivedAt                    DateTime?              @map("archived_at")

  failReason                    String?                @map("fail_reason")
  cancelReason                  String?                @map("cancel_reason")
  reverseReason                 String?                @map("reverse_reason")
  archiveReason                 String?                @map("archive_reason")
  metadata                      Json?

  tenant                        Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  tenantProviderConfig          TenantPaymentProviderConfig @relation(fields: [tenantProviderConfigId], references: [id], onDelete: Restrict)
  initiatedByUser               UserProfile            @relation("PaymentIntentInitiatedBy", fields: [initiatedByUserId], references: [id], onDelete: Restrict)
  person                        Person?                @relation(fields: [personId], references: [id], onDelete: Restrict)
  propertyUnit                  PropertyUnit?          @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  confirmedPayment              Payment?               @relation("PaymentIntentConfirmedPayment", fields: [confirmedPaymentId], references: [id], onDelete: Restrict)

  items                         PaymentIntentItem[]
  checkoutSessions              PaymentCheckoutSession[]
  webhookEvents                 ProviderWebhookEvent[]
  providerTransactions          ProviderTransaction[]
  paymentMappings               ProviderPaymentMapping[]

  @@index([tenantId])
  @@index([tenantId, tenantProviderConfigId])
  @@index([tenantId, initiatedByUserId])
  @@index([tenantId, personId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, sourceModule])
  @@index([tenantId, sourceResourceType, sourceResourceId])
  @@index([tenantId, paymentPurpose])
  @@index([tenantId, status])
  @@index([tenantId, idempotencyKey])
  @@index([tenantId, providerIntentId])
  @@index([tenantId, providerSessionId])
  @@index([tenantId, confirmedPaymentId])
  @@index([tenantId, expiresAt])
  @@index([tenantId, createdAt])
  @@index([tenantId, archivedAt])
  @@map("payment_intents")
}
```

---

## 16.5. Modelo `PaymentIntentItem`

```prisma id="ajel0s"
model PaymentIntentItem {
  id                 String                @id @default(uuid())
  tenantId           String                @map("tenant_id")
  paymentIntentId    String                @map("payment_intent_id")

  itemType           PaymentIntentItemType @map("item_type")
  chargeId           String?               @map("charge_id")
  fineId             String?               @map("fine_id")
  reservationId      String?               @map("reservation_id")
  accountStatementId String?               @map("account_statement_id")
  propertyUnitId     String?               @map("property_unit_id")

  description        String?
  amount             Decimal               @db.Decimal(12, 2)
  currency           Currency              @default(USD)

  createdAt          DateTime              @default(now()) @map("created_at")
  metadata           Json?

  tenant             Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  paymentIntent      PaymentIntent         @relation(fields: [paymentIntentId], references: [id], onDelete: Restrict)
  charge             Charge?               @relation(fields: [chargeId], references: [id], onDelete: Restrict)
  propertyUnit       PropertyUnit?         @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  accountStatement   AccountStatement?     @relation(fields: [accountStatementId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, paymentIntentId])
  @@index([tenantId, itemType])
  @@index([tenantId, chargeId])
  @@index([tenantId, fineId])
  @@index([tenantId, reservationId])
  @@index([tenantId, accountStatementId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, createdAt])
  @@map("payment_intent_items")
}
```

Nota:

```text id="o5yyji"
Las relaciones `fineId` y `reservationId` pueden quedar como campos sin relation Prisma directa hasta que los modelos de Fines y Reservations estén totalmente estabilizados o importados en el mismo Prisma schema.
```

---

## 16.6. Modelo `PaymentCheckoutSession`

```prisma id="cxo9tv"
model PaymentCheckoutSession {
  id                     String                @id @default(uuid())
  tenantId               String                @map("tenant_id")
  paymentIntentId        String                @map("payment_intent_id")
  tenantProviderConfigId String                @map("tenant_provider_config_id")

  providerKey            String                @map("provider_key")
  providerSessionId      String?               @map("provider_session_id")
  providerCheckoutUrl    String?               @map("provider_checkout_url")
  checkoutUrlHash        String?               @map("checkout_url_hash")

  status                 CheckoutSessionStatus @default(CREATED)
  expiresAt              DateTime              @map("expires_at")

  openedAt               DateTime?             @map("opened_at")
  completedAt            DateTime?             @map("completed_at")
  failedAt               DateTime?             @map("failed_at")
  cancelledAt            DateTime?             @map("cancelled_at")
  archivedAt             DateTime?             @map("archived_at")

  createdAt              DateTime              @default(now()) @map("created_at")
  updatedAt              DateTime              @updatedAt @map("updated_at")

  failReason             String?               @map("fail_reason")
  cancelReason           String?               @map("cancel_reason")
  archiveReason          String?               @map("archive_reason")
  metadata               Json?

  tenant                 Tenant                @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  paymentIntent          PaymentIntent         @relation(fields: [paymentIntentId], references: [id], onDelete: Restrict)
  tenantProviderConfig   TenantPaymentProviderConfig @relation(fields: [tenantProviderConfigId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, paymentIntentId])
  @@index([tenantId, tenantProviderConfigId])
  @@index([tenantId, providerKey])
  @@index([tenantId, providerSessionId])
  @@index([tenantId, status])
  @@index([tenantId, expiresAt])
  @@index([tenantId, createdAt])
  @@index([tenantId, archivedAt])
  @@map("payment_checkout_sessions")
}
```

---

## 16.7. Modelo `ProviderWebhookEvent`

```prisma id="v1u2h7"
model ProviderWebhookEvent {
  id                     String                           @id @default(uuid())
  tenantId               String?                          @map("tenant_id")
  providerKey            String                           @map("provider_key")
  tenantProviderConfigId String?                          @map("tenant_provider_config_id")
  paymentIntentId        String?                          @map("payment_intent_id")

  providerEventId        String?                          @map("provider_event_id")
  eventType              String?                          @map("event_type")

  signatureStatus        ProviderWebhookSignatureStatus   @default(NOT_VERIFIED) @map("signature_status")
  processingStatus       ProviderWebhookProcessingStatus  @default(RECEIVED) @map("processing_status")

  receivedAt             DateTime                         @default(now()) @map("received_at")
  processedAt            DateTime?                        @map("processed_at")
  rejectedAt             DateTime?                        @map("rejected_at")
  failedAt               DateTime?                        @map("failed_at")
  archivedAt             DateTime?                        @map("archived_at")

  idempotencyKey         String?                          @map("idempotency_key")
  payloadHash            String                           @map("payload_hash")
  payloadHashAlgorithm   PaymentProviderHashAlgorithm     @default(SHA_256) @map("payload_hash_algorithm")
  payloadPreview         Json?                            @map("payload_preview")
  signatureHeaderHash    String?                          @map("signature_header_hash")
  providerTimestamp      DateTime?                        @map("provider_timestamp")

  retryCount             Int                              @default(0) @map("retry_count")
  lastRetryAt            DateTime?                        @map("last_retry_at")

  errorCode              String?                          @map("error_code")
  errorMessage           String?                          @map("error_message")
  archiveReason          String?                          @map("archive_reason")
  metadata               Json?

  tenant                 Tenant?                          @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  tenantProviderConfig   TenantPaymentProviderConfig?     @relation(fields: [tenantProviderConfigId], references: [id], onDelete: Restrict)
  paymentIntent          PaymentIntent?                   @relation(fields: [paymentIntentId], references: [id], onDelete: Restrict)

  providerTransactions   ProviderTransaction[]

  @@index([tenantId])
  @@index([tenantId, providerKey])
  @@index([tenantId, tenantProviderConfigId])
  @@index([tenantId, paymentIntentId])
  @@index([tenantId, providerEventId])
  @@index([tenantId, eventType])
  @@index([tenantId, signatureStatus])
  @@index([tenantId, processingStatus])
  @@index([tenantId, payloadHash])
  @@index([tenantId, receivedAt])
  @@index([tenantId, processedAt])
  @@index([tenantId, archivedAt])
  @@map("provider_webhook_events")
}
```

---

## 16.8. Modelo `ProviderTransaction`

```prisma id="mt1cyv"
model ProviderTransaction {
  id                     String                        @id @default(uuid())
  tenantId               String                        @map("tenant_id")
  paymentIntentId        String?                       @map("payment_intent_id")
  providerWebhookEventId String?                       @map("provider_webhook_event_id")
  tenantProviderConfigId String                        @map("tenant_provider_config_id")

  providerKey            String                        @map("provider_key")
  providerTransactionId  String?                       @map("provider_transaction_id")
  providerReference      String?                       @map("provider_reference")
  providerStatus         ProviderTransactionStatus     @map("provider_status")
  internalStatus         InternalProviderPaymentStatus @default(PENDING) @map("internal_status")

  amount                 Decimal                       @db.Decimal(12, 2)
  currency               Currency                      @default(USD)
  feeAmount              Decimal?                      @map("fee_amount") @db.Decimal(12, 2)
  netAmount              Decimal?                      @map("net_amount") @db.Decimal(12, 2)

  paymentMethodType      PaymentMethodType?            @map("payment_method_type")
  cardBrand              String?                       @map("card_brand")
  cardLast4              String?                       @map("card_last4")
  authorizationCodePreview String?                     @map("authorization_code_preview")

  providerProcessedAt    DateTime?                     @map("provider_processed_at")
  processedAt            DateTime?                     @map("processed_at")
  settledAt              DateTime?                     @map("settled_at")
  createdAt              DateTime                      @default(now()) @map("created_at")
  updatedAt              DateTime                      @updatedAt @map("updated_at")
  requiresReviewAt       DateTime?                     @map("requires_review_at")
  archivedAt             DateTime?                     @map("archived_at")

  reviewReason           String?                       @map("review_reason")
  archiveReason          String?                       @map("archive_reason")
  metadata               Json?

  tenant                 Tenant                        @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  paymentIntent          PaymentIntent?                @relation(fields: [paymentIntentId], references: [id], onDelete: Restrict)
  providerWebhookEvent   ProviderWebhookEvent?         @relation(fields: [providerWebhookEventId], references: [id], onDelete: Restrict)
  tenantProviderConfig   TenantPaymentProviderConfig   @relation(fields: [tenantProviderConfigId], references: [id], onDelete: Restrict)

  paymentMappings        ProviderPaymentMapping[]

  @@index([tenantId])
  @@index([tenantId, paymentIntentId])
  @@index([tenantId, providerWebhookEventId])
  @@index([tenantId, tenantProviderConfigId])
  @@index([tenantId, providerKey])
  @@index([tenantId, providerTransactionId])
  @@index([tenantId, providerReference])
  @@index([tenantId, providerStatus])
  @@index([tenantId, internalStatus])
  @@index([tenantId, paymentMethodType])
  @@index([tenantId, createdAt])
  @@index([tenantId, processedAt])
  @@index([tenantId, settledAt])
  @@index([tenantId, archivedAt])
  @@map("provider_transactions")
}
```

---

## 16.9. Modelo `ProviderPaymentMapping`

```prisma id="yr7u8d"
model ProviderPaymentMapping {
  id                    String                       @id @default(uuid())
  tenantId              String                       @map("tenant_id")
  paymentIntentId       String                       @map("payment_intent_id")
  providerTransactionId String                       @map("provider_transaction_id")
  paymentId             String                       @map("payment_id")

  mappingStatus         ProviderPaymentMappingStatus @default(ACTIVE) @map("mapping_status")

  createdBy             String?                      @map("created_by")
  reversedBy            String?                      @map("reversed_by")
  archivedBy            String?                      @map("archived_by")

  createdAt             DateTime                     @default(now()) @map("created_at")
  reversedAt            DateTime?                    @map("reversed_at")
  archivedAt            DateTime?                    @map("archived_at")

  reverseReason         String?                      @map("reverse_reason")
  archiveReason         String?                      @map("archive_reason")
  metadata              Json?

  tenant                Tenant                       @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  paymentIntent         PaymentIntent                @relation(fields: [paymentIntentId], references: [id], onDelete: Restrict)
  providerTransaction   ProviderTransaction          @relation(fields: [providerTransactionId], references: [id], onDelete: Restrict)
  payment               Payment                      @relation(fields: [paymentId], references: [id], onDelete: Restrict)

  createdByUser         UserProfile?                 @relation("ProviderPaymentMappingCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  reversedByUser        UserProfile?                 @relation("ProviderPaymentMappingReversedBy", fields: [reversedBy], references: [id], onDelete: Restrict)
  archivedByUser        UserProfile?                 @relation("ProviderPaymentMappingArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, paymentIntentId])
  @@index([tenantId, providerTransactionId])
  @@index([tenantId, paymentId])
  @@index([tenantId, mappingStatus])
  @@index([tenantId, createdAt])
  @@index([tenantId, reversedAt])
  @@index([tenantId, archivedAt])
  @@map("provider_payment_mappings")
}
```

---

## 16.10. Modelo `ProviderSettlementRecord`

```prisma id="wtdxbp"
model ProviderSettlementRecord {
  id                     String                   @id @default(uuid())
  tenantId               String                   @map("tenant_id")
  tenantProviderConfigId String                   @map("tenant_provider_config_id")

  providerKey            String                   @map("provider_key")
  providerSettlementId   String?                  @map("provider_settlement_id")
  settlementDate         DateTime                 @map("settlement_date")

  grossAmount            Decimal                  @map("gross_amount") @db.Decimal(12, 2)
  feeAmount              Decimal?                 @map("fee_amount") @db.Decimal(12, 2)
  netAmount              Decimal?                 @map("net_amount") @db.Decimal(12, 2)
  currency               Currency                 @default(USD)

  status                 ProviderSettlementStatus @default(PENDING)

  bankAccountId          String?                  @map("bank_account_id")
  bankTransactionId      String?                  @map("bank_transaction_id")

  createdAt              DateTime                 @default(now()) @map("created_at")
  updatedAt              DateTime                 @updatedAt @map("updated_at")
  linkedAt               DateTime?                @map("linked_at")
  archivedAt             DateTime?                @map("archived_at")

  linkReason             String?                  @map("link_reason")
  archiveReason          String?                  @map("archive_reason")
  metadata               Json?

  tenant                 Tenant                   @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  tenantProviderConfig   TenantPaymentProviderConfig @relation(fields: [tenantProviderConfigId], references: [id], onDelete: Restrict)
  bankAccount            BankAccount?             @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)
  bankTransaction        BankTransaction?         @relation(fields: [bankTransactionId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, tenantProviderConfigId])
  @@index([tenantId, providerKey])
  @@index([tenantId, providerSettlementId])
  @@index([tenantId, settlementDate])
  @@index([tenantId, status])
  @@index([tenantId, bankAccountId])
  @@index([tenantId, bankTransactionId])
  @@index([tenantId, createdAt])
  @@index([tenantId, archivedAt])
  @@map("provider_settlement_records")
}
```

---

# 17. Relaciones requeridas en modelos existentes

## 17.1. `Tenant`

```prisma id="kmj2cb"
model Tenant {
  // campos existentes...

  tenantPaymentProviderConfigs TenantPaymentProviderConfig[]
  paymentIntents               PaymentIntent[]
  paymentIntentItems            PaymentIntentItem[]
  paymentCheckoutSessions       PaymentCheckoutSession[]
  providerWebhookEvents         ProviderWebhookEvent[]
  providerTransactions          ProviderTransaction[]
  providerPaymentMappings       ProviderPaymentMapping[]
  providerSettlementRecords     ProviderSettlementRecord[]
}
```

---

## 17.2. `UserProfile`

```prisma id="ia4d8q"
model UserProfile {
  // campos existentes...

  paymentProviderDefinitionsCreated    PaymentProviderDefinition[] @relation("PaymentProviderDefinitionCreatedBy")
  paymentProviderDefinitionsUpdated    PaymentProviderDefinition[] @relation("PaymentProviderDefinitionUpdatedBy")
  paymentProviderDefinitionsActivated  PaymentProviderDefinition[] @relation("PaymentProviderDefinitionActivatedBy")
  paymentProviderDefinitionsDeprecated PaymentProviderDefinition[] @relation("PaymentProviderDefinitionDeprecatedBy")
  paymentProviderDefinitionsArchived   PaymentProviderDefinition[] @relation("PaymentProviderDefinitionArchivedBy")

  tenantPaymentProviderConfigsCreated      TenantPaymentProviderConfig[] @relation("TenantPaymentProviderConfigCreatedBy")
  tenantPaymentProviderConfigsUpdated      TenantPaymentProviderConfig[] @relation("TenantPaymentProviderConfigUpdatedBy")
  tenantPaymentProviderConfigsEnabled      TenantPaymentProviderConfig[] @relation("TenantPaymentProviderConfigEnabledBy")
  tenantPaymentProviderConfigsDisabled     TenantPaymentProviderConfig[] @relation("TenantPaymentProviderConfigDisabledBy")
  tenantPaymentProviderConfigsTested       TenantPaymentProviderConfig[] @relation("TenantPaymentProviderConfigTestedBy")
  tenantPaymentProviderConfigsInvalidated  TenantPaymentProviderConfig[] @relation("TenantPaymentProviderConfigInvalidatedBy")
  tenantPaymentProviderConfigsArchived     TenantPaymentProviderConfig[] @relation("TenantPaymentProviderConfigArchivedBy")

  paymentIntentsInitiated PaymentIntent[] @relation("PaymentIntentInitiatedBy")

  providerPaymentMappingsCreated   ProviderPaymentMapping[] @relation("ProviderPaymentMappingCreatedBy")
  providerPaymentMappingsReversed  ProviderPaymentMapping[] @relation("ProviderPaymentMappingReversedBy")
  providerPaymentMappingsArchived  ProviderPaymentMapping[] @relation("ProviderPaymentMappingArchivedBy")
}
```

---

## 17.3. `Person`

```prisma id="o46agm"
model Person {
  // campos existentes...

  paymentIntents PaymentIntent[]
}
```

---

## 17.4. `PropertyUnit`

```prisma id="xw5i1r"
model PropertyUnit {
  // campos existentes...

  paymentIntents     PaymentIntent[]
  paymentIntentItems PaymentIntentItem[]
}
```

---

## 17.5. `Charge`

```prisma id="bp2kw1"
model Charge {
  // campos existentes...

  paymentIntentItems PaymentIntentItem[]
}
```

---

## 17.6. `Payment`

Se recomienda agregar relaciones y campos mínimos para trazabilidad con proveedor.

```prisma id="stxc66"
model Payment {
  // campos existentes...

  paymentSource              PaymentSource? @map("payment_source")
  providerKey                String?        @map("provider_key")
  providerPaymentMappingId   String?        @map("provider_payment_mapping_id")
  providerTransactionExternalId String?     @map("provider_transaction_external_id")
  providerReference          String?        @map("provider_reference")
  providerVerifiedAt         DateTime?      @map("provider_verified_at")

  paymentProviderMappings    ProviderPaymentMapping[]
  confirmedPaymentIntents    PaymentIntent[] @relation("PaymentIntentConfirmedPayment")
}
```

Enum recomendado:

```prisma id="e970wr"
enum PaymentSource {
  MANUAL_TRANSFER @map("manualTransfer")
  PROVIDER        @map("provider")
  CASH            @map("cash")
  ADJUSTMENT      @map("adjustment")
  OTHER           @map("other")

  @@map("payment_source")
}
```

Nota:

```text id="f3ty70"
Si el módulo 005-payments ya tiene un enum equivalente para origen de pago, debe extenderse ese enum en lugar de crear uno duplicado.
```

---

## 17.7. `BankAccount`

```prisma id="qm8c7i"
model BankAccount {
  // campos existentes...

  tenantPaymentProviderConfigs TenantPaymentProviderConfig[]
  providerSettlementRecords    ProviderSettlementRecord[]
}
```

---

## 17.8. `BankTransaction`

```prisma id="drpubh"
model BankTransaction {
  // campos existentes...

  providerSettlementRecords ProviderSettlementRecord[]
}
```

---

## 17.9. `SecureDocument` y `SecureDocumentFile`

Si se almacenan comprobantes o exports generados por este módulo, debe extenderse `SourceModule` de Secure Document Storage:

```prisma id="tcspsl"
enum SourceModule {
  // valores existentes...
  PAYMENT_PROVIDER_INTEGRATION @map("paymentProviderIntegration")
}
```

Clasificación recomendada para recibos o evidencia:

```text id="biz1jk"
sourceModule = paymentProviderIntegration
sourceResourceType = providerTransaction | paymentIntent | paymentProviderReportExport
visibility = owners o administrative según caso
sensitivity = confidential o restricted según contenido
```

---

# 18. Constraints recomendadas

## 18.1. `payment_provider_definitions`

```text id="eejuhp"
provider_key NOT NULL
provider_key UNIQUE
display_name NOT NULL
status NOT NULL
supported_environments NOT NULL
supported_currencies NOT NULL
supported_payment_methods NOT NULL
archived_at requerido si status = archived
deprecated_at requerido si status = deprecated
metadata sanitizada
```

---

## 18.2. `tenant_payment_provider_configs`

```text id="d5oear"
tenant_id NOT NULL
provider_definition_id NOT NULL
provider_key NOT NULL
environment NOT NULL
status NOT NULL
currency NOT NULL
credential_secret_ref requerido si status = enabled para provider real
webhook_secret_ref requerido si status = enabled y provider soporta webhooks
enabled_at requerido si status = enabled
disabled_at requerido si status = disabled y antes estuvo enabled
invalid_reason requerido si status = invalid
archived_at requerido si status = archived
settlement_bank_account_id debe pertenecer al mismo tenant
metadata sanitizada
```

---

## 18.3. `payment_intents`

```text id="tazka0"
tenant_id NOT NULL
tenant_provider_config_id NOT NULL
initiated_by_user_id NOT NULL
payment_purpose NOT NULL
amount NOT NULL
amount > 0
currency NOT NULL
status NOT NULL
expires_at NOT NULL
confirmed_payment_id único si se usa
cancel_reason requerido si status = cancelled
fail_reason recomendado si status = failed
expired_at requerido si status = expired
confirmed_at requerido si status = succeeded
archived_at requerido si status = archived
metadata sanitizada
```

---

## 18.4. `payment_intent_items`

```text id="ovyfpj"
tenant_id NOT NULL
payment_intent_id NOT NULL
item_type NOT NULL
amount NOT NULL
amount > 0
currency NOT NULL
charge_id requerido si item_type = charge
property_unit_id requerido si item_type = accountBalance
fine_id requerido si item_type = fine cuando fines está integrado
reservation_id requerido si item_type = reservation cuando reservations está integrado
metadata sanitizada
```

---

## 18.5. `payment_checkout_sessions`

```text id="mw9djg"
tenant_id NOT NULL
payment_intent_id NOT NULL
tenant_provider_config_id NOT NULL
provider_key NOT NULL
status NOT NULL
expires_at NOT NULL
provider_checkout_url no obligatorio si no se persiste
checkout_url_hash recomendado si se persiste o se emite URL
completed_at requerido si status = completed
failed_at requerido si status = failed
cancelled_at requerido si status = cancelled
archived_at requerido si status = archived
metadata sanitizada
```

---

## 18.6. `provider_webhook_events`

```text id="ntr5vp"
provider_key NOT NULL
signature_status NOT NULL
processing_status NOT NULL
received_at NOT NULL
payload_hash NOT NULL
payload_hash_algorithm NOT NULL
provider_event_id recomendado si el provider lo entrega
tenant_provider_config_id requerido si tenant resuelto
processed_at requerido si processing_status = processed
rejected_at requerido si processing_status = rejected
failed_at requerido si processing_status = failed
archived_at requerido si processing_status = archived
payload_preview sanitizado
signature_header_hash no debe permitir reconstruir firma
metadata sanitizada
```

---

## 18.7. `provider_transactions`

```text id="sopxba"
tenant_id NOT NULL
tenant_provider_config_id NOT NULL
provider_key NOT NULL
provider_status NOT NULL
internal_status NOT NULL
amount NOT NULL
amount > 0
currency NOT NULL
fee_amount >= 0 si existe
net_amount >= 0 si existe
card_last4 máximo 4 caracteres
PAN prohibido
CVV prohibido
requires_review_at requerido si internal_status = requiresReview
archived_at requerido si internal_status = ignored/archived según política
metadata sanitizada
```

---

## 18.8. `provider_payment_mappings`

```text id="ybbrok"
tenant_id NOT NULL
payment_intent_id NOT NULL
provider_transaction_id NOT NULL
payment_id NOT NULL
mapping_status NOT NULL
reverse_reason requerido si mapping_status = reversed
reversed_at requerido si mapping_status = reversed
archived_at requerido si mapping_status = archived
metadata sanitizada
```

---

## 18.9. `provider_settlement_records`

```text id="kjzeab"
tenant_id NOT NULL
tenant_provider_config_id NOT NULL
provider_key NOT NULL
settlement_date NOT NULL
gross_amount NOT NULL
gross_amount >= 0
fee_amount >= 0 si existe
net_amount >= 0 si existe
currency NOT NULL
status NOT NULL
bank_account_id, si existe, debe pertenecer al tenant
bank_transaction_id, si existe, debe pertenecer al tenant
linked_at requerido si bank_transaction_id existe
metadata sanitizada
```

---

# 19. Índices recomendados

## 19.1. `payment_provider_definitions`

```text id="pnwk9a"
provider_key
status
created_at
archived_at
```

---

## 19.2. `tenant_payment_provider_configs`

```text id="oludg2"
tenant_id
tenant_id + provider_definition_id
tenant_id + provider_key
tenant_id + environment
tenant_id + status
tenant_id + currency
tenant_id + settlement_bank_account_id
tenant_id + created_at
tenant_id + archived_at
```

---

## 19.3. `payment_intents`

```text id="zv9xe5"
tenant_id
tenant_id + tenant_provider_config_id
tenant_id + initiated_by_user_id
tenant_id + person_id
tenant_id + property_unit_id
tenant_id + source_module
tenant_id + source_resource_type + source_resource_id
tenant_id + payment_purpose
tenant_id + status
tenant_id + idempotency_key
tenant_id + provider_intent_id
tenant_id + provider_session_id
tenant_id + confirmed_payment_id
tenant_id + expires_at
tenant_id + created_at
tenant_id + archived_at
```

---

## 19.4. `payment_intent_items`

```text id="puit1x"
tenant_id
tenant_id + payment_intent_id
tenant_id + item_type
tenant_id + charge_id
tenant_id + fine_id
tenant_id + reservation_id
tenant_id + account_statement_id
tenant_id + property_unit_id
tenant_id + created_at
```

---

## 19.5. `payment_checkout_sessions`

```text id="s8nko5"
tenant_id
tenant_id + payment_intent_id
tenant_id + tenant_provider_config_id
tenant_id + provider_key
tenant_id + provider_session_id
tenant_id + status
tenant_id + expires_at
tenant_id + created_at
tenant_id + archived_at
```

---

## 19.6. `provider_webhook_events`

```text id="a52mnd"
tenant_id
tenant_id + provider_key
tenant_id + tenant_provider_config_id
tenant_id + payment_intent_id
tenant_id + provider_event_id
tenant_id + event_type
tenant_id + signature_status
tenant_id + processing_status
tenant_id + payload_hash
tenant_id + received_at
tenant_id + processed_at
tenant_id + archived_at
```

---

## 19.7. `provider_transactions`

```text id="p1sj84"
tenant_id
tenant_id + payment_intent_id
tenant_id + provider_webhook_event_id
tenant_id + tenant_provider_config_id
tenant_id + provider_key
tenant_id + provider_transaction_id
tenant_id + provider_reference
tenant_id + provider_status
tenant_id + internal_status
tenant_id + payment_method_type
tenant_id + created_at
tenant_id + processed_at
tenant_id + settled_at
tenant_id + archived_at
```

---

## 19.8. `provider_payment_mappings`

```text id="zfweou"
tenant_id
tenant_id + payment_intent_id
tenant_id + provider_transaction_id
tenant_id + payment_id
tenant_id + mapping_status
tenant_id + created_at
tenant_id + reversed_at
tenant_id + archived_at
```

---

## 19.9. `provider_settlement_records`

```text id="idzn3e"
tenant_id
tenant_id + tenant_provider_config_id
tenant_id + provider_key
tenant_id + provider_settlement_id
tenant_id + settlement_date
tenant_id + status
tenant_id + bank_account_id
tenant_id + bank_transaction_id
tenant_id + created_at
tenant_id + archived_at
```

---

# 20. Índices parciales raw recomendados

## 20.1. Un provider enabled por tenant/provider/environment

```sql id="qskzr7"
CREATE UNIQUE INDEX tenant_payment_provider_configs_unique_enabled_provider
ON tenant_payment_provider_configs(tenant_id, provider_key, environment)
WHERE status = 'enabled'
  AND archived_at IS NULL;
```

---

## 20.2. Idempotency key única por tenant

```sql id="e7aykq"
CREATE UNIQUE INDEX payment_intents_unique_idempotency_key
ON payment_intents(tenant_id, idempotency_key)
WHERE idempotency_key IS NOT NULL
  AND archived_at IS NULL;
```

---

## 20.3. Provider intent único por tenant/provider

```sql id="ku7ef3"
CREATE UNIQUE INDEX payment_intents_unique_provider_intent
ON payment_intents(tenant_id, tenant_provider_config_id, provider_intent_id)
WHERE provider_intent_id IS NOT NULL
  AND archived_at IS NULL;
```

---

## 20.4. Provider session único por tenant/provider

```sql id="mfhrmq"
CREATE UNIQUE INDEX payment_checkout_sessions_unique_provider_session
ON payment_checkout_sessions(tenant_id, tenant_provider_config_id, provider_session_id)
WHERE provider_session_id IS NOT NULL
  AND archived_at IS NULL;
```

---

## 20.5. Provider event único por tenant/provider

```sql id="wbf291"
CREATE UNIQUE INDEX provider_webhook_events_unique_provider_event
ON provider_webhook_events(tenant_id, provider_key, provider_event_id)
WHERE provider_event_id IS NOT NULL;
```

---

## 20.6. Payload hash único para replay detection controlado

```sql id="dc3mb9"
CREATE INDEX provider_webhook_events_payload_hash_lookup
ON provider_webhook_events(provider_key, payload_hash, received_at);
```

---

## 20.7. Provider transaction única por tenant/provider

```sql id="s3wqja"
CREATE UNIQUE INDEX provider_transactions_unique_provider_transaction
ON provider_transactions(tenant_id, provider_key, provider_transaction_id)
WHERE provider_transaction_id IS NOT NULL
  AND archived_at IS NULL;
```

---

## 20.8. Una transacción externa con un mapping activo

```sql id="g54g3p"
CREATE UNIQUE INDEX provider_payment_mappings_one_active_mapping_per_transaction
ON provider_payment_mappings(tenant_id, provider_transaction_id)
WHERE mapping_status = 'active'
  AND archived_at IS NULL;
```

---

## 20.9. Un Payment con un mapping activo de proveedor

```sql id="niv2v9"
CREATE UNIQUE INDEX provider_payment_mappings_one_active_mapping_per_payment
ON provider_payment_mappings(tenant_id, payment_id)
WHERE mapping_status = 'active'
  AND archived_at IS NULL;
```

---

## 20.10. Settlement único por tenant/provider

```sql id="f8zrre"
CREATE UNIQUE INDEX provider_settlement_records_unique_provider_settlement
ON provider_settlement_records(tenant_id, provider_key, provider_settlement_id)
WHERE provider_settlement_id IS NOT NULL
  AND archived_at IS NULL;
```

---

# 21. Reglas de multitenancy

Todas las tablas operativas incluyen `tenant_id`, excepto `payment_provider_definitions`, que es platform-scoped.

Regla obligatoria:

```text id="bmid25"
Toda consulta, escritura, transición, webhook resuelto, transacción, mapping, settlement, reporte y auditoría tenant-scoped debe operar con currentTenant.id o tenantId verificado desde provider config.
```

Patrón requerido:

```typescript id="ulrt4l"
await prisma.providerTransaction.findFirst({
  where: {
    id: providerTransactionId,
    tenantId: currentTenant.id
  }
});
```

Patrón prohibido:

```typescript id="edq7lr"
await prisma.providerTransaction.findUnique({
  where: { id: providerTransactionId }
});
```

También prohibido:

```typescript id="tjtymp"
await prisma.tenantPaymentProviderConfig.findUnique({ where: { id: configId } });
await prisma.paymentIntent.findUnique({ where: { id: paymentIntentId } });
await prisma.paymentCheckoutSession.findUnique({ where: { id: checkoutSessionId } });
await prisma.providerWebhookEvent.findUnique({ where: { id: webhookEventId } });
await prisma.providerPaymentMapping.findUnique({ where: { id: mappingId } });
await prisma.providerSettlementRecord.findUnique({ where: { id: settlementId } });
```

Referencias cross-tenant que deben bloquearse:

```text id="xysmp4"
tenantProviderConfigId
paymentIntentId
paymentIntentItemId
paymentCheckoutSessionId
webhookEventId
providerTransactionId
providerPaymentMappingId
providerSettlementRecordId
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

# 22. Reglas monetarias

## 22.1. Tipo de dato

Usar siempre:

```text id="ytmqrm"
Decimal(12,2)
```

Campos monetarios:

```text id="dm41px"
payment_intents.amount
payment_intent_items.amount
provider_transactions.amount
provider_transactions.fee_amount
provider_transactions.net_amount
provider_settlement_records.gross_amount
provider_settlement_records.fee_amount
provider_settlement_records.net_amount
```

---

## 22.2. Prohibido

```text id="xwpj1b"
float
double
JavaScript number para cálculos monetarios
redondeo implícito
comparaciones aproximadas no documentadas
amount enviado por cliente como fuente de verdad para cargos/saldos
```

---

## 22.3. Reglas

```text id="jubvlo"
- amount > 0;
- currency obligatoria;
- MVP solo USD;
- feeAmount >= 0;
- netAmount >= 0;
- amount total se calcula en servidor;
- provider amount debe coincidir con PaymentIntent.amount;
- provider currency debe coincidir con PaymentIntent.currency;
- mismatch pasa a rejected/requiresReview y no crea Payment automático.
```

---

# 23. Reglas de secretos

## 23.1. Persistir

Permitido:

```text id="sc8bwb"
credentialSecretRef
webhookSecretRef
```

---

## 23.2. Prohibido persistir

```text id="b5dqmy"
credentialSecret value
webhookSecret value
API keys reales
private keys
client secret
raw OAuth token
refresh token
raw webhook signature secret
passwords
```

---

## 23.3. Reglas

```text id="k5pkvk"
- credentialSecretRef no se expone a /me.
- webhookSecretRef no se expone a /me.
- secret refs pueden exponerse parcialmente solo a administradores autorizados si la política lo permite.
- valores reales de secretos nunca salen por API.
- secretos no se guardan en metadata.
- secretos no se guardan en audit logs.
- secretos no se guardan en application logs.
```

---

# 24. Reglas de datos de tarjeta

## 24.1. Prohibido

```text id="e080cg"
PAN
CVV
track data
PIN
raw card data
full card token sensible
full authorization payload
3DS raw payload
```

---

## 24.2. Permitido

```text id="v7bolp"
paymentMethodType
cardBrand
cardLast4
authorizationCodePreview
providerTransactionId
providerReference
```

---

## 24.3. Regla PCI-minimized

```text id="w5rc9g"
RESIDENT Core debe usar checkout externo y evitar capturar, procesar o almacenar datos completos de tarjeta.
```

---

# 25. Reglas de webhook

## 25.1. Raw body

El sistema debe poder verificar la firma usando raw body.

Persistir solo:

```text id="mc8vmv"
payloadHash
payloadPreview sanitizado
signatureHeaderHash
providerTimestamp
eventType
providerEventId
processingStatus
signatureStatus
```

---

## 25.2. No persistir

```text id="px2v62"
raw payload completo
raw signature
webhook secret
datos de tarjeta
tokens
cookies
Authorization header
```

---

## 25.3. Idempotencia

```text id="l2azgd"
providerEventId + providerKey + tenantId
providerTransactionId + providerKey + tenantId
payloadHash + providerKey + ventana temporal
```

---

## 25.4. Reprocesamiento

```text id="xbzvh6"
- solo eventos failed pueden reprocesarse ordinariamente;
- rejected por firma inválida no debe reprocesarse;
- duplicate no debe reprocesarse;
- processed no debe reprocesarse salvo operación excepcional auditada;
- retryCount debe incrementarse;
- lastRetryAt debe actualizarse;
- auditoría obligatoria.
```

---

# 26. Reglas de PaymentIntent

## 26.1. Cálculo de monto

El monto debe calcularse desde:

```text id="k1rvwn"
chargeIds
accountStatement balance
fine charge asociado
reservation charge asociado
manualItem administrativo autorizado
```

---

## 26.2. Prohibido

```text id="wxzja1"
- aceptar amount arbitrario del cliente para cargos internos;
- crear PaymentIntent sin items;
- crear PaymentIntent con provider disabled;
- crear PaymentIntent con charge de otro tenant;
- crear PaymentIntent sobre unidad no autorizada;
- crear PaymentIntent en moneda no soportada;
- crear PaymentIntent anónimo en MVP.
```

---

## 26.3. Estados finales

```text id="f7f1v0"
succeeded
failed
cancelled
expired
reversed
archived
```

Una intención `succeeded` no puede volver a `failed`.

---

# 27. Reglas de ProviderTransaction

## 27.1. Estados exitosos externos

```text id="mcb3js"
captured
succeeded
```

Pueden crear Payment si todas las validaciones pasan.

---

## 27.2. Estados no exitosos

```text id="ty9n50"
failed
cancelled
expired
unknown
```

No crean Payment automático.

---

## 27.3. Estados de revisión

```text id="vihse7"
refunded
partiallyRefunded
chargeback
amount mismatch
currency mismatch
paymentIntent missing
```

Deben quedar como:

```text id="dd8kfr"
requiresReview
```

---

# 28. Reglas de ProviderPaymentMapping

```text id="to33sw"
- Una ProviderTransaction no debe tener más de un mapping activo.
- Un Payment interno no debe tener más de un mapping activo de proveedor.
- Mapping se crea solo después de Payment exitosamente creado.
- Mapping reversed no elimina Payment ni ProviderTransaction.
- Refunds/chargebacks no ejecutan reverso automático en MVP.
```

---

# 29. Reglas de settlement

```text id="dj8nua"
- Settlement es informativo para conciliación.
- Settlement no marca Payment como conciliado bancariamente.
- Settlement puede vincularse a bankTransaction.
- bankTransactionId debe pertenecer al tenant.
- bankAccountId debe pertenecer al tenant.
- Diferencias entre netAmount y bankTransaction deben resolverse en Bank Reconciliation.
```

---

# 30. DTOs derivados del modelo

## 30.1. `PaymentProviderDefinitionDto`

```text id="v94zl0"
id
providerKey
displayName
description
status
supportedEnvironments
supportedCurrencies
supportedPaymentMethods
supportsHostedCheckout
supportsWebhooks
supportsRefunds
supportsInstallments
supportsSettlements
createdAt
updatedAt
activatedAt
deprecatedAt
archivedAt
metadata
```

No incluye secretos.

---

## 30.2. `TenantPaymentProviderConfigDto`

```text id="qbxssq"
id
providerDefinitionId
providerKey
environment
status
displayName
currency
publicConfig
settlementBankAccountId
webhookEndpointPath
returnUrl
cancelUrl
allowedOrigins
createdAt
updatedAt
enabledAt
disabledAt
testedAt
invalidatedAt
archivedAt
metadata
```

No incluye:

```text id="l9li54"
credentialSecret value
webhookSecret value
webhookSecretRef en /me
credentialSecretRef en /me
```

Para admin, se puede mostrar referencia parcial:

```text id="vowfyp"
credentialSecretConfigured: true
webhookSecretConfigured: true
```

---

## 30.3. `PaymentIntentDto`

```text id="qd22yl"
id
tenantProviderConfigId
personId
propertyUnitId
sourceModule
sourceResourceType
sourceResourceId
paymentPurpose
amount
currency
status
expiresAt
checkoutUrlExpiresAt
confirmedPaymentId
createdAt
updatedAt
checkoutCreatedAt
confirmedAt
failedAt
cancelledAt
expiredAt
metadata segura
items
```

No incluye:

```text id="uwpkl6"
tenantId
provider raw payload
secret refs
checkoutUrl si no es respuesta inmediata autorizada
```

---

## 30.4. `OwnPaymentIntentDto`

```text id="h74el6"
id
paymentPurpose
amount
currency
status
expiresAt
createdAt
updatedAt
confirmedAt
failedAt
cancelledAt
expiredAt
items
safeProviderDisplayName
```

No incluye:

```text id="t6avtf"
provider config interna
secret refs
webhook data
provider raw transaction
tenant financial metadata interna
```

---

## 30.5. `PaymentCheckoutSessionDto`

```text id="v16tck"
id
paymentIntentId
providerKey
providerSessionId
status
expiresAt
createdAt
updatedAt
```

Respuesta inmediata al crear checkout puede incluir:

```text id="oelyhs"
providerCheckoutUrl
```

Regla:

```text id="rrrd33"
providerCheckoutUrl no debe incluirse en listados ni logs.
```

---

## 30.6. `ProviderWebhookEventDto`

```text id="j9tqmw"
id
providerKey
tenantProviderConfigId
providerEventId
eventType
signatureStatus
processingStatus
receivedAt
processedAt
rejectedAt
failedAt
retryCount
lastRetryAt
errorCode
errorMessage
payloadHashPrefix
metadata segura
```

No incluye:

```text id="u2z9cc"
raw payload
raw signature
webhook secret
payload completo
datos de tarjeta
```

---

## 30.7. `ProviderTransactionDto`

```text id="kf90he"
id
paymentIntentId
providerWebhookEventId
providerKey
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
providerProcessedAt
processedAt
settledAt
createdAt
updatedAt
requiresReviewAt
reviewReason
metadata segura
```

No incluye:

```text id="bfyqys"
PAN
CVV
raw card data
raw provider payload
secretos
checkoutUrl
```

---

## 30.8. `ProviderPaymentMappingDto`

```text id="sopmpt"
id
paymentIntentId
providerTransactionId
paymentId
mappingStatus
createdAt
reversedAt
reverseReason
metadata segura
```

---

## 30.9. `ProviderSettlementRecordDto`

```text id="evvsc8"
id
tenantProviderConfigId
providerKey
providerSettlementId
settlementDate
grossAmount
feeAmount
netAmount
currency
status
bankAccountId
bankTransactionId
createdAt
updatedAt
linkedAt
metadata segura
```

---

# 31. Reglas de consulta

## 31.1. Filtros de provider definitions

```text id="pcpf23"
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

---

## 31.2. Filtros de tenant provider configs

```text id="r4qqz9"
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

---

## 31.3. Filtros de payment intents

```text id="a5q5aw"
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

---

## 31.4. Filtros de checkout sessions

```text id="r20c1w"
paymentIntentId
tenantProviderConfigId
providerKey
providerSessionId
status
expiresFrom
expiresTo
createdFrom
createdTo
page
pageSize
sortBy
sortOrder
```

---

## 31.5. Filtros de webhook events

```text id="eer15c"
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

---

## 31.6. Filtros de provider transactions

```text id="sgr248"
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

---

## 31.7. Filtros de mappings

```text id="qfxj0o"
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

---

## 31.8. Filtros de settlements

```text id="uctvi6"
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

---

# 32. Queries conceptuales

## 32.1. Obtener proveedor enabled para tenant

```sql id="ie7q34"
SELECT *
FROM tenant_payment_provider_configs
WHERE tenant_id = $1
  AND provider_key = $2
  AND environment = $3
  AND status = 'enabled'
  AND archived_at IS NULL
LIMIT 1;
```

---

## 32.2. Buscar PaymentIntent tenant-scoped

```sql id="uyhgdu"
SELECT *
FROM payment_intents
WHERE tenant_id = $1
  AND id = $2
  AND archived_at IS NULL
LIMIT 1;
```

---

## 32.3. Detectar webhook duplicado

```sql id="wq0gjh"
SELECT id, processing_status
FROM provider_webhook_events
WHERE tenant_id = $1
  AND provider_key = $2
  AND provider_event_id = $3
LIMIT 1;
```

---

## 32.4. Detectar ProviderTransaction duplicada

```sql id="a3zksi"
SELECT id
FROM provider_transactions
WHERE tenant_id = $1
  AND provider_key = $2
  AND provider_transaction_id = $3
  AND archived_at IS NULL
LIMIT 1;
```

---

## 32.5. Verificar mapping activo

```sql id="bqwoy2"
SELECT id
FROM provider_payment_mappings
WHERE tenant_id = $1
  AND provider_transaction_id = $2
  AND mapping_status = 'active'
  AND archived_at IS NULL
LIMIT 1;
```

---

# 33. Soft archive y reversibilidad

## 33.1. No eliminación física

No eliminar físicamente:

```text id="kuoamx"
payment_provider_definitions
tenant_payment_provider_configs
payment_intents
payment_intent_items
payment_checkout_sessions
provider_webhook_events
provider_transactions
provider_payment_mappings
provider_settlement_records
```

---

## 33.2. Reversibilidad

El reverso operativo de un mapping:

```text id="ua56ze"
- no elimina PaymentIntent;
- no elimina ProviderTransaction;
- no elimina Payment interno;
- no elimina ProviderPaymentMapping;
- cambia mappingStatus a reversed;
- registra reversedAt;
- registra reversedBy;
- requiere reverseReason;
- deja auditoría.
```

---

## 33.3. Refunds y chargebacks

En MVP:

```text id="ta4x6m"
- no se ejecutan reversos automáticos por refund;
- no se ejecutan reversos automáticos por chargeback;
- eventos se registran;
- ProviderTransaction pasa a requiresReview;
- FinancialManager revisa en flujo futuro.
```

---

# 34. Reglas de metadata

## 34.1. Metadata permitida

```text id="a7v2ec"
safe provider flags
safe provider display hints
safe checkout options
safe payment method type
safe card brand
cardLast4
hashPrefix
traceId
correlationId
safe status details
safe processing summary
safe settlement summary
safe retry information
non-sensitive notes
```

---

## 34.2. Metadata prohibida

```text id="k1r6v8"
PAN
CVV
track data
PIN
raw card data
full card token
provider secret
webhook secret
credentialSecret value
webhookSecret value
full webhook payload
raw signature
checkoutUrl
storageKey
signedUrl
Authorization header
cookies
tokens
SQL raw
stack trace
datos personales completos innecesarios
datos bancarios completos
datos financieros reales enviados a IA
```

---

# 35. Auditoría desde modelo

## 35.1. Eventos mínimos

```text id="xgr48x"
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

## 35.2. Metadata permitida

```text id="trc1tp"
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

## 35.3. Metadata prohibida

```text id="i48057"
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

# 36. Observabilidad desde modelo

## 36.1. Logs sugeridos

```text id="nrta20"
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

---

## 36.2. Métricas sugeridas

```text id="pkqf2z"
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

## 36.3. Labels permitidos

```text id="mtv6p1"
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

## 36.4. Labels prohibidos

```text id="zqslnh"
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

# 37. Migración

Nombre sugerido:

```text id="obhn9k"
018_create_payment_provider_integration
```

Pasos:

```text id="wb1giz"
1. Crear enums del módulo.
2. Crear payment_provider_definitions.
3. Crear tenant_payment_provider_configs.
4. Crear payment_intents.
5. Crear payment_intent_items.
6. Crear payment_checkout_sessions.
7. Crear provider_webhook_events.
8. Crear provider_transactions.
9. Crear provider_payment_mappings.
10. Crear provider_settlement_records.
11. Crear índices básicos.
12. Crear constraints básicos.
13. Crear índices parciales raw.
14. Agregar relaciones en Tenant.
15. Agregar relaciones en UserProfile.
16. Agregar relaciones en Person.
17. Agregar relaciones en PropertyUnit.
18. Agregar relaciones en Charge.
19. Agregar relaciones en Payment.
20. Agregar relaciones en BankAccount.
21. Agregar relaciones en BankTransaction.
22. Extender SourceModule en Secure Document Storage si aplica.
23. Generar Prisma Client.
24. Ejecutar migración en DB test.
25. Ejecutar seeds demo.
26. Ejecutar repository tests.
```

---

# 38. Migraciones raw recomendadas

## 38.1. Montos positivos

```sql id="vypv39"
ALTER TABLE payment_intents
ADD CONSTRAINT payment_intents_amount_positive
CHECK (amount > 0);

ALTER TABLE payment_intent_items
ADD CONSTRAINT payment_intent_items_amount_positive
CHECK (amount > 0);

ALTER TABLE provider_transactions
ADD CONSTRAINT provider_transactions_amount_positive
CHECK (amount > 0);

ALTER TABLE provider_settlement_records
ADD CONSTRAINT provider_settlement_records_gross_amount_non_negative
CHECK (gross_amount >= 0);
```

---

## 38.2. Fees y net amounts no negativos

```sql id="fm3ahr"
ALTER TABLE provider_transactions
ADD CONSTRAINT provider_transactions_fee_amount_non_negative
CHECK (fee_amount IS NULL OR fee_amount >= 0);

ALTER TABLE provider_transactions
ADD CONSTRAINT provider_transactions_net_amount_non_negative
CHECK (net_amount IS NULL OR net_amount >= 0);

ALTER TABLE provider_settlement_records
ADD CONSTRAINT provider_settlement_records_fee_amount_non_negative
CHECK (fee_amount IS NULL OR fee_amount >= 0);

ALTER TABLE provider_settlement_records
ADD CONSTRAINT provider_settlement_records_net_amount_non_negative
CHECK (net_amount IS NULL OR net_amount >= 0);
```

---

## 38.3. PaymentIntent final states

```sql id="k8kd1t"
ALTER TABLE payment_intents
ADD CONSTRAINT payment_intents_confirmed_at_required
CHECK (
  status <> 'succeeded'
  OR confirmed_at IS NOT NULL
);

ALTER TABLE payment_intents
ADD CONSTRAINT payment_intents_cancel_reason_required
CHECK (
  status <> 'cancelled'
  OR cancel_reason IS NOT NULL
);

ALTER TABLE payment_intents
ADD CONSTRAINT payment_intents_expired_at_required
CHECK (
  status <> 'expired'
  OR expired_at IS NOT NULL
);
```

---

## 38.4. Checkout final states

```sql id="x1uvh6"
ALTER TABLE payment_checkout_sessions
ADD CONSTRAINT checkout_sessions_completed_at_required
CHECK (
  status <> 'completed'
  OR completed_at IS NOT NULL
);

ALTER TABLE payment_checkout_sessions
ADD CONSTRAINT checkout_sessions_failed_at_required
CHECK (
  status <> 'failed'
  OR failed_at IS NOT NULL
);

ALTER TABLE payment_checkout_sessions
ADD CONSTRAINT checkout_sessions_cancelled_at_required
CHECK (
  status <> 'cancelled'
  OR cancelled_at IS NOT NULL
);
```

---

## 38.5. Webhook processing final states

```sql id="a6nz32"
ALTER TABLE provider_webhook_events
ADD CONSTRAINT provider_webhook_events_processed_at_required
CHECK (
  processing_status <> 'processed'
  OR processed_at IS NOT NULL
);

ALTER TABLE provider_webhook_events
ADD CONSTRAINT provider_webhook_events_rejected_at_required
CHECK (
  processing_status <> 'rejected'
  OR rejected_at IS NOT NULL
);

ALTER TABLE provider_webhook_events
ADD CONSTRAINT provider_webhook_events_failed_at_required
CHECK (
  processing_status <> 'failed'
  OR failed_at IS NOT NULL
);
```

---

## 38.6. Mapping reverse reason

```sql id="r3ry43"
ALTER TABLE provider_payment_mappings
ADD CONSTRAINT provider_payment_mappings_reverse_reason_required
CHECK (
  mapping_status <> 'reversed'
  OR (reverse_reason IS NOT NULL AND reversed_at IS NOT NULL)
);
```

---

## 38.7. Card last4 length

```sql id="ij6h46"
ALTER TABLE provider_transactions
ADD CONSTRAINT provider_transactions_card_last4_length
CHECK (
  card_last4 IS NULL
  OR length(card_last4) <= 4
);
```

---

# 39. Seeds

## 39.1. Provider definitions demo

```text id="fj7814"
paymentProviderDefinitionMock
paymentProviderDefinitionSandbox
paymentProviderDefinitionDeprecated
paymentProviderDefinitionArchived
```

---

## 39.2. Tenant provider configs demo

```text id="rrmgss"
tenantPaymentProviderConfigMockA
tenantPaymentProviderConfigSandboxA
tenantPaymentProviderConfigDisabledA
tenantPaymentProviderConfigInvalidA
tenantPaymentProviderConfigArchivedA
tenantPaymentProviderConfigTenantB
```

---

## 39.3. Payment intents demo

```text id="ti5yxh"
paymentIntentChargesA
paymentIntentBalanceA
paymentIntentFineA
paymentIntentReservationA
paymentIntentCheckoutCreatedA
paymentIntentPendingA
paymentIntentSucceededA
paymentIntentFailedA
paymentIntentExpiredA
paymentIntentCancelledA
paymentIntentTenantB
```

---

## 39.4. Checkout sessions demo

```text id="smgg18"
paymentCheckoutSessionCreatedA
paymentCheckoutSessionOpenedA
paymentCheckoutSessionCompletedA
paymentCheckoutSessionFailedA
paymentCheckoutSessionExpiredA
paymentCheckoutSessionTenantB
```

---

## 39.5. Webhook events demo

```text id="x72ytv"
providerWebhookEventReceivedA
providerWebhookEventVerifiedA
providerWebhookEventInvalidSignatureA
providerWebhookEventDuplicateA
providerWebhookEventFailedA
providerWebhookEventProcessedA
providerWebhookEventTenantB
```

---

## 39.6. Provider transactions demo

```text id="gmas7e"
providerTransactionSucceededA
providerTransactionCapturedA
providerTransactionFailedA
providerTransactionRequiresReviewA
providerTransactionAmountMismatchA
providerTransactionCurrencyMismatchA
providerTransactionRefundedA
providerTransactionChargebackA
providerTransactionTenantB
```

---

## 39.7. Mappings demo

```text id="blrwj3"
providerPaymentMappingActiveA
providerPaymentMappingReversedA
providerPaymentMappingFailedA
providerPaymentMappingTenantB
```

---

## 39.8. Settlements demo

```text id="fvriyi"
providerSettlementPendingA
providerSettlementSettledA
providerSettlementFailedA
providerSettlementLinkedA
providerSettlementTenantB
```

---

## 39.9. Datos prohibidos en seeds

```text id="w2duff"
números reales de tarjeta
PAN
CVV
tokens reales
secretos reales
webhook secrets reales
payloads reales de proveedor
checkoutUrls reales
datos financieros reales
nombres reales
emails reales
teléfonos reales
cédulas reales
comprobantes reales
storageKeys reales
URLs firmadas reales
```

---

# 40. Testing del modelo

## 40.1. Unit tests

```text id="k4v74j"
PaymentProviderDefinition entity
TenantPaymentProviderConfig entity
PaymentIntent entity
PaymentIntentItem entity
PaymentCheckoutSession entity
ProviderWebhookEvent entity
ProviderTransaction entity
ProviderPaymentMapping entity
ProviderSettlementRecord entity
ProviderKey value object
SecretRef value object
Money Decimal value object
WebhookPayloadHash value object
CheckoutUrlExpiration value object
```

---

## 40.2. Repository tests

```text id="gqkrnm"
create provider definition
activate provider definition
deprecate provider definition
archive provider definition
create tenant provider config
enable tenant provider config
disable tenant provider config
prevent duplicate enabled provider config
create payment intent
create payment intent items
prevent duplicate idempotency key
create checkout session
create webhook event
prevent duplicate providerEventId
create provider transaction
prevent duplicate providerTransactionId
create provider payment mapping
prevent duplicate active mapping per transaction
create settlement
tenant A no ve config tenant B
tenant A no ve intent tenant B
tenant A no ve transaction tenant B
```

---

## 40.3. Financial integrity tests

```text id="nd5002"
PaymentIntent amount uses Decimal
PaymentIntent amount calculated from items
ProviderTransaction amount matches intent
amount mismatch requiresReview
currency mismatch requiresReview
Payment created once
ProviderTransaction maps to one active Payment
Payment internal remains source of Account Statement
Settlement does not mark bank reconciliation final
```

---

## 40.4. Multitenancy tests

```text id="q3z7dv"
tenant A no ve tenantPaymentProviderConfig tenant B
tenant A no ve paymentIntent tenant B
tenant A no ve paymentIntentItem tenant B
tenant A no ve checkoutSession tenant B
tenant A no ve webhookEvent tenant B
tenant A no ve providerTransaction tenant B
tenant A no ve paymentMapping tenant B
tenant A no ve settlement tenant B
tenant A no usa chargeId tenant B
tenant A no usa paymentId tenant B
tenant A no usa bankAccountId tenant B
tenant A no usa bankTransactionId tenant B
```

---

## 40.5. Security tests

```text id="ki0h1q"
no tenantId body
no secret values in DTO
no credentialSecretRef in /me
no webhookSecretRef in /me
no raw webhook payload in logs
no raw signature in logs
no checkoutUrl in logs
no PAN stored
no CVV stored
no raw card data stored
no Payment from browser redirect
no Payment without verified webhook
no duplicate Payment from repeated webhook
no public administrative endpoints
no external AI with real payment data
```

---

# 41. Decisión final del modelo

El módulo `018-payment-provider-integration` usará las siguientes tablas:

```text id="acptjc"
payment_provider_definitions
tenant_payment_provider_configs
payment_intents
payment_intent_items
payment_checkout_sessions
provider_webhook_events
provider_transactions
provider_payment_mappings
provider_settlement_records
```

El modelo garantiza:

```text id="wygvc2"
provider-agnostic architecture
platform provider registry
tenant provider configuration
secret reference strategy
PCI-minimized data model
no card data storage
PaymentIntent lifecycle
PaymentIntentItem traceability
server-side amount calculation
hosted checkout support
temporary checkout sessions
signed webhook tracking
webhook idempotency
provider transaction tracking
Payment internal mapping
settlement readiness
Payments integration
Account Statements integration
Bank Reconciliation readiness
Secure Document Storage readiness
auditability
safe observability
tenant isolation
no public administrative exposure
```

La implementación no debe aceptarse si:

```text id="js8331"
permite provider config cross-tenant
permite payment intent cross-tenant
permite checkout session cross-tenant
permite webhook event cross-tenant
permite provider transaction cross-tenant
permite payment mapping cross-tenant
permite settlement cross-tenant
permite crear PaymentIntent con charge de otro tenant
acepta tenantId desde body
busca entidades tenant-scoped solo por id
expone secretos
expone credentialSecret value
expone webhookSecret value
expone raw signature
expone checkoutUrl en logs
expone payload completo de webhook
guarda PAN
guarda CVV
guarda raw card data
crea Payment desde redirect del navegador
crea Payment sin webhook firmado/verificado
duplica Payment por webhook repetido
usa amount enviado por cliente como fuente de verdad
permite amount mismatch sin revisión
permite currency mismatch sin revisión
omite PaymentAllocation cuando corresponde
rompe Account Statements
marca conciliado bancariamente sin Bank Reconciliation
crea endpoints públicos administrativos
documenta endpoints públicos administrativos en OpenAPI
permite WordPress confirmar pagos
envía datos reales a IA externa
omite auditoría financiera crítica
```

---

# 42. Pendientes para evolución

Quedan diferidos:

```text id="mh0q4d"
proveedor real de producción
Open Banking
conexión directa con APIs bancarias
refunds automáticos
chargebacks avanzados
disputas avanzadas
recurring payments
domiciliación bancaria
payment links públicos controlados
QR dinámico
pagos anónimos
multi-moneda avanzada
comisiones trasladadas al residente
split payments
marketplace
wallet interno
pagos a proveedores
facturación electrónica
integración SRI
contabilidad completa
asientos contables
plan de cuentas
antifraude avanzado
risk scoring con IA
settlement avanzado
reconciliación automática avanzada
```

Estos diferidos no bloquean el MVP de `018-payment-provider-integration`.

---

# 43. Expediente actualizado

```text id="c74vz8"
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
│   │       └── data-model.md
```
