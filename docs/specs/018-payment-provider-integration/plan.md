# Plan — Spec 018 Payment Provider Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                           |
| Spec ID         | 018                                                                                                                                                                                                                                                     |
| Módulo          | Payment Provider Integration                                                                                                                                                                                                                            |
| Documento       | Plan técnico                                                                                                                                                                                                                                            |
| Ruta            | `docs/specs/018-payment-provider-integration/plan.md`                                                                                                                                                                                                   |
| Versión         | 0.1                                                                                                                                                                                                                                                     |
| Estado          | needs-review                                                                                                                                                                                                                                            |
| Fecha           | 2026-07-21                                                                                                                                                                                                                                              |
| Documento base  | `docs/specs/018-payment-provider-integration/spec.md`                                                                                                                                                                                                   |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `012-communications-notifications`, `016-secure-document-storage`, `017-bank-reconciliation` |
| Relacionado con | pagos en línea, proveedores externos, checkout, payment intents, webhooks, idempotencia, pagos, estados de cuenta, conciliación bancaria, auditoría                                                                                                     |
| API Style       | REST                                                                                                                                                                                                                                                    |
| Arquitectura    | Monolito modular preparado para microservicios                                                                                                                                                                                                          |
| Stack objetivo  | NestJS, TypeScript, PostgreSQL, Prisma, Decimal, OpenAPI, Keycloak/OIDC, Docker, Secure Document Storage                                                                                                                                                |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `018-payment-provider-integration`.

El módulo permitirá integrar RESIDENT Core con proveedores externos de pago sin que RESIDENT procese directamente datos sensibles de tarjeta. La integración se basará en intenciones de pago, checkout externo, webhooks firmados, validación server-side, idempotencia, creación controlada de pagos internos, auditoría financiera y preparación para conciliación bancaria.

Regla central:

```text id="xq8vj2"
Payment Provider Integration debe permitir pagos en línea mediante proveedores externos sin almacenar datos sensibles de tarjeta, sin confiar en redirects del navegador, sin duplicar pagos, sin exponer secretos, sin crear pagos sin webhook verificado, manteniendo tenant isolation, Decimal money, idempotencia, auditoría y trazabilidad financiera completa.
```

---

## 3. Decisión técnica inicial

### 3.1. Nombre técnico del módulo

```text id="k4yq1s"
payment-provider-integration
```

---

### 3.2. Ruta sugerida

```text id="brlmte"
apps/api/src/modules/payment-provider-integration/
```

---

### 3.3. Tipo de módulo

```text id="i0lp32"
Financial integration module
Tenant-scoped
Provider-agnostic
Checkout-driven
Webhook-driven
Idempotent
Payment-aware
Secret-reference-based
PCI-minimized
Audit-heavy
Report-ready
Non-public administrative surface
```

---

### 3.4. Estilo arquitectónico

El módulo seguirá el estilo general de RESIDENT Core:

```text id="zzmil2"
monolito modular
API-first
NestJS
TypeScript
PostgreSQL
Prisma
REST
OpenAPI
Keycloak/OIDC para autenticación
autorización propia dentro de RESIDENT Core
Decimal para dinero
Secure Document Storage para comprobantes o exports persistidos
webhooks firmados
idempotencia fuerte
auditoría financiera obligatoria
observabilidad segura
preparado para adapters reales futuros
```

---

## 4. Decisión MVP

Para MVP se implementará:

```text id="m9m6yi"
- arquitectura provider-agnostic;
- definición de proveedores soportados a nivel plataforma;
- configuración de proveedor por tenant;
- credenciales como referencias a secretos, no valores en texto plano;
- adapter mock/sandbox;
- PaymentProviderPort;
- creación de PaymentIntent;
- creación de PaymentIntentItems;
- creación de CheckoutSession;
- checkout externo;
- checkoutUrl temporal;
- consulta propia limitada de payment intents;
- consulta administrativa de payment intents;
- endpoint de webhook por providerKey;
- validación de firma de webhook;
- protección contra replay;
- procesamiento idempotente;
- ProviderWebhookEvent sanitizado;
- ProviderTransaction;
- ProviderPaymentMapping;
- creación de Payment interno solo con evento verificado;
- integración con Payments;
- integración con Account Statements;
- preparación para Bank Reconciliation;
- registro básico de settlement si el proveedor lo reporta;
- reportes básicos;
- auditoría;
- observabilidad segura;
- OpenAPI sin rutas públicas funcionales;
- no almacenamiento de datos de tarjeta;
- no IA con datos reales.
```

---

## 5. Fuera de alcance técnico MVP

No implementar en esta spec:

```text id="dnj1cj"
- captura directa de tarjeta en RESIDENT;
- almacenamiento de PAN;
- almacenamiento de CVV;
- tokenización propia de tarjetas;
- cumplimiento PCI completo como procesador;
- suscripciones o cobros recurrentes;
- domiciliación bancaria;
- débitos automáticos;
- refunds automáticos;
- chargebacks avanzados;
- disputas avanzadas;
- antifraude avanzado propio;
- scoring de riesgo con IA;
- pago anónimo;
- enlaces públicos permanentes de pago;
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
- conciliación automática final;
- proveedores reales múltiples en producción;
- IA externa con datos financieros reales.
```

---

## 6. Dependencias funcionales

### 6.1. `001-tenants`

Uso:

```text id="xn8leq"
- validar tenant activo;
- aplicar tenant_id a configs, intents, sessions, webhooks, transactions, mappings y settlements;
- impedir provider config cross-tenant;
- impedir payment intent cross-tenant;
- impedir webhook asignado a tenant equivocado;
- impedir reportes cross-tenant.
```

---

### 6.2. `002-users-roles`

Uso:

```text id="p8l7yp"
- validar usuario autenticado;
- validar membership activa;
- validar permisos financieros;
- validar permisos platform para provider definitions;
- validar acceso propio para /me;
- impedir acceso automático de PlatformAdmin a datos financieros tenant;
- auditar actor real.
```

---

### 6.3. `003-residents-properties`

Uso:

```text id="tirnsh"
- resolver relación UserProfile -> Person;
- resolver unidades asociadas al usuario;
- validar pagos propios;
- validar cargos de unidades propias;
- impedir PaymentIntent sobre unidad ajena;
- permitir consulta /me limitada.
```

---

### 6.4. `004-dues-fees`

Uso:

```text id="pe7th1"
- validar cargos pagables;
- obtener saldo pendiente de cargos específicos;
- impedir pago de cargos anulados, reversados o archivados;
- calcular monto desde cargos;
- no crear cargos desde proveedor.
```

---

### 6.5. `005-payments`

Dependencia crítica.

Uso:

```text id="aa2obj"
- crear Payment interno desde proveedor verificado;
- registrar paymentSource=provider;
- asociar providerPaymentMapping;
- asignar pagos a cargos;
- crear PaymentAllocation si corresponde;
- impedir pagos duplicados;
- manejar reversos o revisión futura;
- mantener Payment como fuente de verdad financiera posterior al cobro.
```

Campos recomendados para evolución de `Payment`:

```text id="q65y7a"
paymentSource
providerKey
providerPaymentMappingId
providerTransactionId
providerReference
providerVerifiedAt
```

---

### 6.6. `006-account-statements`

Uso:

```text id="ds45lf"
- reflejar pagos internos creados por proveedor;
- mantener estado de cuenta derivado desde cargos/pagos/asignaciones;
- no derivar saldo directamente desde ProviderTransaction;
- permitir vista de pagos provider-verified.
```

---

### 6.7. `007-audit`

Uso:

```text id="gal24i"
- auditar provider definitions;
- auditar provider configs;
- auditar PaymentIntent;
- auditar CheckoutSession;
- auditar webhooks;
- auditar ProviderTransaction;
- auditar creación de Payment;
- auditar mappings;
- auditar settlements;
- auditar errores, rechazos y reprocesos.
```

---

### 6.8. `008-basic-reports`

Uso:

```text id="klq9pu"
- reportar intents creados;
- reportar pagos exitosos/fallidos;
- reportar transacciones por proveedor;
- reportar eventos rechazados;
- reportar settlements;
- exportar reportes si aplica.
```

---

### 6.9. `012-communications-notifications`

Uso:

```text id="zmuxvr"
- notificar pago iniciado si aplica;
- notificar pago exitoso;
- notificar pago fallido;
- notificar payment requiresReview;
- no enviar datos sensibles;
- no enviar checkoutUrl por canales inseguros salvo política explícita.
```

---

### 6.10. `016-secure-document-storage`

Uso:

```text id="kr599s"
- almacenar comprobantes del proveedor si se generan;
- almacenar exports de reportes;
- proteger storageKey;
- evitar signedUrl persistente;
- clasificar documentos financieros como confidential/restricted según el caso.
```

Recomendación técnica:

```text id="cyfjid"
Extender SourceModule de Secure Document Storage con paymentProviderIntegration.
```

---

### 6.11. `017-bank-reconciliation`

Uso:

```text id="xl4psf"
- permitir que pagos provider-verified puedan conciliarse contra movimientos bancarios;
- vincular ProviderSettlementRecord con bankTransactionId si aplica;
- mantener conciliación bancaria final separada;
- no usar proveedor como sustituto total de conciliación bancaria.
```

---

## 7. Estructura de carpetas propuesta

```text id="hdfglq"
apps/api/src/modules/payment-provider-integration/
├── payment-provider-integration.module.ts
├── controllers/
│   ├── platform-payment-provider-definitions.controller.ts
│   ├── tenant-payment-providers.controller.ts
│   ├── tenant-payment-intents.controller.ts
│   ├── my-payment-intents.controller.ts
│   ├── payment-provider-webhooks.controller.ts
│   ├── provider-transactions.controller.ts
│   ├── provider-payment-mappings.controller.ts
│   ├── provider-settlements.controller.ts
│   └── payment-provider-reports.controller.ts
│
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── providers/
│   ├── webhooks/
│   ├── secrets/
│   ├── integrations/
│   ├── audit/
│   ├── reports/
│   └── observability/
│
├── dto/
├── guards/
├── policies/
├── mappers/
└── tests/
```

---

## 8. Componentes principales

### 8.1. Módulo NestJS

```text id="ky2n4h"
PaymentProviderIntegrationModule
```

Responsabilidades:

```text id="pllw81"
- registrar controladores;
- registrar servicios de aplicación;
- registrar puertos;
- registrar adapters de proveedor;
- registrar repositorios Prisma;
- registrar integración con Payments;
- registrar integración con Account Statements;
- registrar integración con Secure Document Storage;
- registrar validadores de webhook;
- registrar auditoría;
- registrar observabilidad;
- publicar OpenAPI seguro.
```

---

### 8.2. Controladores

```text id="jqp85z"
PlatformPaymentProviderDefinitionsController
TenantPaymentProvidersController
TenantPaymentIntentsController
MyPaymentIntentsController
PaymentProviderWebhooksController
ProviderTransactionsController
ProviderPaymentMappingsController
ProviderSettlementsController
PaymentProviderReportsController
```

---

### 8.3. Servicios de aplicación

```text id="o0cmin"
PaymentProviderDefinitionService
TenantPaymentProviderConfigService
PaymentProviderSecretService
PaymentIntentService
PaymentIntentItemService
PaymentIntentAmountService
PaymentCheckoutSessionService
PaymentProviderWebhookService
PaymentProviderWebhookVerificationService
PaymentProviderWebhookProcessingService
ProviderTransactionService
ProviderPaymentMappingService
ProviderSettlementService
PaymentCreationFromProviderService
PaymentProviderReportService
PaymentProviderAuditService
PaymentProviderObservabilityService
```

---

### 8.4. Entidades de dominio

```text id="xv1ksr"
PaymentProviderDefinition
TenantPaymentProviderConfig
PaymentIntent
PaymentIntentItem
PaymentCheckoutSession
ProviderWebhookEvent
ProviderTransaction
ProviderPaymentMapping
ProviderSettlementRecord
```

---

### 8.5. Value Objects

```text id="xw0pkc"
ProviderKey
ProviderEnvironment
CredentialSecretRef
WebhookSecretRef
PaymentIntentAmount
PaymentIntentCurrency
PaymentIntentReference
PaymentIntentExpiration
CheckoutUrl
CheckoutUrlExpiration
ProviderEventId
ProviderTransactionId
ProviderReference
WebhookSignature
WebhookPayloadHash
WebhookPayloadPreview
PaymentMethodInfo
CardLast4
AuthorizationCodePreview
ProviderSettlementReference
```

---

### 8.6. Puertos de aplicación

```text id="svspkk"
PaymentProviderDefinitionRepositoryPort
TenantPaymentProviderConfigRepositoryPort
PaymentIntentRepositoryPort
PaymentIntentItemRepositoryPort
PaymentCheckoutSessionRepositoryPort
ProviderWebhookEventRepositoryPort
ProviderTransactionRepositoryPort
ProviderPaymentMappingRepositoryPort
ProviderSettlementRepositoryPort

PaymentProviderPort
PaymentProviderAdapterRegistryPort
PaymentProviderSecretPort
WebhookSignatureVerifierPort
WebhookPayloadHasherPort
PaymentIntentAmountCalculatorPort
PaymentsIntegrationPort
AccountStatementsIntegrationPort
SecureDocumentStorageIntegrationPort
BankReconciliationIntegrationPort
NotificationsIntegrationPort
AuditPort
ClockPort
IdempotencyPort
ObservabilityPort
ReportExportPort
```

---

### 8.7. Repositorios Prisma

```text id="i9f4zp"
PrismaPaymentProviderDefinitionRepository
PrismaTenantPaymentProviderConfigRepository
PrismaPaymentIntentRepository
PrismaPaymentIntentItemRepository
PrismaPaymentCheckoutSessionRepository
PrismaProviderWebhookEventRepository
PrismaProviderTransactionRepository
PrismaProviderPaymentMappingRepository
PrismaProviderSettlementRepository
```

---

## 9. Modelo de datos previsto

### 9.1. Tablas nuevas MVP

```text id="in5t83"
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

### 9.2. Tablas externas relacionadas

```text id="rql75i"
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

---

### 9.3. Regla multitenant

Todas las tablas operativas tenant-scoped deben incluir:

```text id="zxqxkh"
tenant_id
```

Excepción:

```text id="k54516"
payment_provider_definitions puede ser platform-scoped y no requiere tenant_id.
```

Regla obligatoria:

```text id="caary6"
Toda consulta tenant-scoped debe filtrar por tenant_id.
```

Patrón requerido:

```typescript id="szluue"
await prisma.paymentIntent.findFirst({
  where: {
    id: paymentIntentId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="wytl0s"
await prisma.paymentIntent.findUnique({
  where: { id: paymentIntentId }
});
```

---

## 10. Diseño de estados

### 10.1. PaymentProviderDefinition

Estados:

```text id="j8n3fy"
draft
active
inactive
deprecated
archived
```

Transiciones permitidas:

```text id="g7xnbm"
draft -> active
active -> inactive
inactive -> active
active -> deprecated
deprecated -> inactive
active -> archived
inactive -> archived
deprecated -> archived
draft -> archived
```

---

### 10.2. TenantPaymentProviderConfig

Estados:

```text id="b6o7xi"
draft
enabled
disabled
invalid
archived
```

Transiciones permitidas:

```text id="t8zxvg"
draft -> enabled
draft -> disabled
enabled -> disabled
disabled -> enabled
enabled -> invalid
invalid -> disabled
invalid -> enabled
enabled -> archived
disabled -> archived
invalid -> archived
draft -> archived
```

Reglas:

```text id="v2zy3b"
- enabled requiere configuración válida;
- invalid no permite crear PaymentIntent;
- archived no permite operación;
- disabled no permite checkout nuevo.
```

---

### 10.3. PaymentIntent

Estados:

```text id="dcauou"
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

Transiciones permitidas:

```text id="ccf4qm"
draft -> created
created -> checkoutCreated
checkoutCreated -> pendingProviderConfirmation
pendingProviderConfirmation -> succeeded
pendingProviderConfirmation -> failed
pendingProviderConfirmation -> cancelled
pendingProviderConfirmation -> expired
created -> cancelled
checkoutCreated -> cancelled
created -> expired
checkoutCreated -> expired
succeeded -> reversed futuro/controlado
failed -> archived
cancelled -> archived
expired -> archived
reversed -> archived
```

Transiciones prohibidas:

```text id="t71hae"
succeeded -> failed
failed -> succeeded sin reproceso controlado
cancelled -> succeeded
expired -> succeeded sin validación provider explícita
archived -> succeeded
```

---

### 10.4. PaymentCheckoutSession

Estados:

```text id="ispm8m"
created
opened
completed
failed
cancelled
expired
archived
```

Transiciones permitidas:

```text id="s4y9js"
created -> opened
opened -> completed
opened -> failed
opened -> cancelled
created -> expired
opened -> expired
completed -> archived
failed -> archived
cancelled -> archived
expired -> archived
```

---

### 10.5. ProviderWebhookEvent

Estados de firma:

```text id="xbcp8b"
notVerified
verified
invalid
missing
unsupported
```

Estados de procesamiento:

```text id="ypkoep"
received
ignored
processing
processed
duplicate
failed
rejected
archived
```

Transiciones permitidas:

```text id="ka2nho"
received -> processing
processing -> processed
received -> rejected
received -> duplicate
processing -> failed
failed -> processing por reproceso autorizado
processed -> archived
rejected -> archived
duplicate -> archived
```

---

### 10.6. ProviderTransaction

Estados externos normalizados:

```text id="jox1jq"
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

Estados internos:

```text id="h562g9"
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

Reglas:

```text id="bcyzjt"
- succeeded/captured puede generar Payment;
- failed/cancelled/expired no genera Payment;
- refunded/chargeback queda requiresReview en MVP;
- amount mismatch queda requiresReview o rejected;
- currency mismatch queda requiresReview o rejected.
```

---

### 10.7. ProviderPaymentMapping

Estados:

```text id="ygvbfm"
active
reversed
failed
archived
```

Transiciones permitidas:

```text id="csspcs"
active -> reversed
active -> failed
active -> archived
reversed -> archived
failed -> archived
```

---

### 10.8. ProviderSettlementRecord

Estados:

```text id="i0qngt"
pending
settled
failed
reversed
unknown
```

---

## 11. Estrategia provider-agnostic

### 11.1. Puerto principal

```typescript id="fl5xep"
interface PaymentProviderPort {
  createCheckoutSession(input: CreateProviderCheckoutSessionInput): Promise<CreateProviderCheckoutSessionResult>;
  verifyWebhook(input: VerifyProviderWebhookInput): Promise<VerifyProviderWebhookResult>;
  parseWebhookEvent(input: ParseProviderWebhookEventInput): Promise<ParsedProviderWebhookEvent>;
  retrieveTransaction(input: RetrieveProviderTransactionInput): Promise<ProviderTransactionSnapshot>;
  testConnection(input: TestProviderConnectionInput): Promise<TestProviderConnectionResult>;
}
```

---

### 11.2. Registry de adapters

```typescript id="btsc8p"
interface PaymentProviderAdapterRegistryPort {
  getAdapter(providerKey: string): PaymentProviderPort;
  listSupportedProviders(): SupportedPaymentProvider[];
}
```

---

### 11.3. Adapters MVP

```text id="mw01qu"
MockPaymentProviderAdapter
SandboxPaymentProviderAdapter
GenericHostedCheckoutProviderAdapter
```

---

### 11.4. Adapters futuros

```text id="febl9a"
DatafastAdapter
PayPhoneAdapter
KushkiAdapter
PlaceToPayAdapter
StripeAdapter
PayPalAdapter
ProviderBankTransferAdapter
ProviderQrAdapter
```

Nota:

```text id="g7i754"
La selección de proveedor real para Ecuador debe resolverse en una decisión técnica posterior cuando se evalúen costos, disponibilidad, requisitos comerciales, soporte local, settlement, documentación y cumplimiento.
```

---

## 12. Estrategia de secretos

### 12.1. Principio

No persistir secretos en texto plano en PostgreSQL.

Persistir solo referencias:

```text id="hblsgj"
credentialSecretRef
webhookSecretRef
```

---

### 12.2. Puerto de secretos

```typescript id="f7arjg"
interface PaymentProviderSecretPort {
  storeCredential(input: StoreProviderCredentialInput): Promise<SecretRef>;
  updateCredential(input: UpdateProviderCredentialInput): Promise<SecretRef>;
  getCredential(input: GetProviderCredentialInput): Promise<ResolvedSecret>;
  rotateCredential(input: RotateProviderCredentialInput): Promise<SecretRef>;
  deleteCredential(input: DeleteProviderCredentialInput): Promise<void>;
}
```

---

### 12.3. Implementación MVP

Opciones:

```text id="kac51o"
1. Secret manager real en cloud.
2. Variables de entorno por tenant solo para demo limitada.
3. Secret storage interno cifrado diferido.
```

Decisión recomendada:

```text id="uv9349"
Usar SecretRef abstracto desde el inicio, aunque el adapter local resuelva secretos desde variables de entorno o mock seguro en desarrollo.
```

---

### 12.4. Prohibido

```text id="wci34p"
- guardar providerSecret en metadata;
- devolver secretos por API;
- loggear secretos;
- auditar secretos completos;
- incluir secretos en OpenAPI examples;
- exponer webhookSecret;
- exponer credentialSecretRef a usuarios /me.
```

---

## 13. Estrategia de Payment Intent

### 13.1. Creación

Flujo:

```text id="bkc7j7"
1. Resolver tenant.
2. Resolver actor.
3. Validar provider enabled.
4. Validar source resource.
5. Validar relación propia si endpoint /me.
6. Calcular items.
7. Calcular amount total en servidor.
8. Crear PaymentIntent.
9. Crear PaymentIntentItems.
10. Auditar paymentIntent.created.
```

---

### 13.2. Sources soportados MVP

```text id="nifoup"
charges
accountBalance
fine
reservation
manualItem administrativo controlado
```

---

### 13.3. Cálculo de monto

Regla:

```text id="iw4ucp"
El cliente no define el monto final como fuente de verdad; el servidor lo calcula desde cargos, saldo o recurso interno.
```

Para cargos:

```text id="ps3d3u"
amount = suma de saldos pendientes de chargeIds pagables
```

Para saldo total:

```text id="ggv23o"
amount = saldo pendiente actual calculado por Account Statements
```

Para multa:

```text id="cntaq4"
amount = saldo pendiente de fine charge asociado
```

Para reserva:

```text id="ux2t9q"
amount = cargo asociado a reservation/rental si existe
```

---

### 13.4. Idempotencia

Usar:

```text id="a9a3fi"
Idempotency-Key
tenantId
initiatedByUserId
sourceModule
sourceResourceType
sourceResourceId
amount
currency
```

Regla:

```text id="bl15en"
Reintentar la misma creación con la misma Idempotency-Key debe devolver la misma intención si el payload lógico coincide.
```

---

## 14. Estrategia de Checkout Session

### 14.1. Creación

Flujo:

```text id="esw9pu"
1. Validar PaymentIntent.
2. Validar estado created o checkoutCreated compatible.
3. Validar provider config enabled.
4. Invocar adapter externo.
5. Recibir providerSessionId y checkoutUrl.
6. Persistir PaymentCheckoutSession.
7. Actualizar PaymentIntent.checkoutCreated.
8. Devolver checkoutUrl temporal al usuario autorizado.
9. Auditar checkoutSession.created.
```

---

### 14.2. Seguridad de checkoutUrl

Reglas:

```text id="h05fuy"
- checkoutUrl puede exponerse solo al usuario autorizado;
- checkoutUrl debe expirar;
- checkoutUrl no debe registrarse en logs;
- checkoutUrl no debe guardarse como enlace público permanente;
- checkoutUrl no debe enviarse por canales inseguros salvo política explícita;
- no debe aparecer en auditoría.
```

---

### 14.3. Retorno del navegador

Regla crítica:

```text id="i40jc2"
El returnUrl/cancelUrl no confirma pago. Solo actualiza experiencia de usuario o estado visual.
```

---

## 15. Estrategia de Webhooks

### 15.1. Endpoint

```text id="dcvdud"
POST /api/v1/webhooks/payment-providers/{providerKey}
```

---

### 15.2. Naturaleza del endpoint

```text id="pp5nvv"
Técnicamente accesible desde internet, pero no público funcional para usuarios.
```

Debe requerir:

```text id="x9f4el"
- providerKey válido;
- firma válida;
- timestamp válido si el proveedor lo soporta;
- protección contra replay;
- providerEventId idempotente;
- payloadHash;
- parsing seguro;
- respuesta controlada.
```

---

### 15.3. Flujo de recepción

```text id="i2ggsb"
1. Recibir raw body.
2. Resolver providerKey.
3. Capturar headers necesarios.
4. Calcular payloadHash.
5. Registrar ProviderWebhookEvent received con preview sanitizado.
6. Resolver tenantProviderConfig.
7. Validar firma.
8. Detectar duplicado.
9. Parsear evento.
10. Procesar evento según tipo.
11. Crear/actualizar ProviderTransaction.
12. Crear Payment interno si corresponde.
13. Marcar evento processed/failed/rejected/duplicate.
14. Auditar.
15. Responder 2xx/4xx controlado.
```

---

### 15.4. Idempotencia de webhook

Identificadores:

```text id="g918vn"
providerEventId
providerTransactionId
payloadHash
idempotencyKey
```

Regla:

```text id="vzvqwv"
Un evento ya procesado exitosamente debe responder de forma idempotente y no crear otro Payment.
```

---

### 15.5. Rechazo de webhook

Rechazar si:

```text id="uvwguz"
- falta firma;
- firma inválida;
- timestamp expirado;
- providerKey no soportado;
- provider config no existe;
- provider config disabled/archived;
- payload inválido;
- amount mismatch crítico;
- currency mismatch crítico;
- PaymentIntent no existe;
- PaymentIntent pertenece a otro tenant;
```

---

### 15.6. Respuesta segura

El endpoint no debe revelar:

```text id="ku0lbv"
- si existe tenant;
- si existe paymentIntent;
- secretos;
- reglas internas de firma;
- stack trace;
- detalles sensibles del payload;
```

---

## 16. Estrategia de creación de Payment interno

### 16.1. Condiciones obligatorias

Crear Payment interno solo si:

```text id="xry54t"
- webhook está verificado;
- evento es idempotente;
- providerStatus es succeeded/captured;
- PaymentIntent existe;
- PaymentIntent pertenece al tenant;
- PaymentIntent no está succeeded previamente;
- amount coincide;
- currency coincide;
- providerTransactionId no está usado para otro Payment;
- items siguen siendo pagables;
- PaymentsIntegrationPort acepta la operación.
```

---

### 16.2. Puerto hacia Payments

```typescript id="ajz2lt"
interface PaymentsIntegrationPort {
  createPaymentFromProvider(input: CreatePaymentFromProviderInput): Promise<CreatePaymentFromProviderResult>;
  allocateProviderPayment(input: AllocateProviderPaymentInput): Promise<AllocateProviderPaymentResult>;
  getPaymentForProviderMapping(input: GetPaymentForProviderMappingInput): Promise<ProviderLinkedPayment | null>;
  reverseProviderLinkedPayment(input: ReverseProviderLinkedPaymentInput): Promise<void>;
}
```

---

### 16.3. Datos enviados a Payments

```text id="o8dwsl"
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

### 16.4. Datos prohibidos hacia Payments

```text id="m5d4x6"
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

## 17. Estrategia de ProviderTransaction

### 17.1. Propósito

`ProviderTransaction` conserva evidencia técnica de la transacción externa sin reemplazar al Payment interno.

Regla:

```text id="r4lt8d"
ProviderTransaction no es la fuente final de estado de cuenta; Payment interno sí lo es.
```

---

### 17.2. Datos permitidos

```text id="g7pz8i"
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
processedAt
settledAt
```

---

### 17.3. Datos prohibidos

```text id="pmb0qe"
PAN
CVV
raw card data
raw provider payload completo
full authorization code sensible
full card token
secretos
checkoutUrl
```

---

## 18. Estrategia de ProviderPaymentMapping

### 18.1. Propósito

Vincular:

```text id="o22jo4"
PaymentIntent
ProviderTransaction
Payment interno
```

---

### 18.2. Regla

```text id="g5fgay"
Una ProviderTransaction exitosa debe mapear como máximo a un Payment interno activo.
```

---

### 18.3. Reverso

En MVP:

```text id="nayzbg"
- refunds/chargebacks no ejecutan reversos automáticos;
- eventos de refund/chargeback quedan requiresReview;
- mapping puede marcarse reversed solo por flujo administrativo futuro/controlado.
```

---

## 19. Estrategia de Settlement

### 19.1. Propósito

Registrar liquidación del proveedor hacia cuenta bancaria, si el proveedor lo informa.

---

### 19.2. Regla principal

```text id="wvlbdh"
Settlement ayuda a conciliación, pero no reemplaza a Bank Reconciliation.
```

---

### 19.3. Integración con `017-bank-reconciliation`

Campos posibles:

```text id="lslvrt"
bankAccountId
bankTransactionId
providerSettlementId
settlementDate
grossAmount
feeAmount
netAmount
currency
status
```

---

### 19.4. MVP

```text id="u33alc"
Registrar settlement básico si el adapter lo provee. Si no lo provee, dejar entidad preparada pero no obligatoria.
```

---

## 20. API prevista

### 20.1. Platform — definiciones de proveedor

```text id="r0yhqb"
GET    /api/v1/platform/payment-provider-definitions
POST   /api/v1/platform/payment-provider-definitions
GET    /api/v1/platform/payment-provider-definitions/{providerDefinitionId}
PATCH  /api/v1/platform/payment-provider-definitions/{providerDefinitionId}
POST   /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/activate
POST   /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/deprecate
POST   /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/archive
```

---

### 20.2. Tenant — configuración de proveedores

```text id="n55sdn"
GET    /api/v1/tenant/payment-providers
POST   /api/v1/tenant/payment-providers
GET    /api/v1/tenant/payment-providers/{tenantProviderConfigId}
PATCH  /api/v1/tenant/payment-providers/{tenantProviderConfigId}
POST   /api/v1/tenant/payment-providers/{tenantProviderConfigId}/enable
POST   /api/v1/tenant/payment-providers/{tenantProviderConfigId}/disable
POST   /api/v1/tenant/payment-providers/{tenantProviderConfigId}/test-connection
POST   /api/v1/tenant/payment-providers/{tenantProviderConfigId}/archive
```

---

### 20.3. Tenant — administración de intents

```text id="gvn733"
GET    /api/v1/tenant/payment-intents
POST   /api/v1/tenant/payment-intents
GET    /api/v1/tenant/payment-intents/{paymentIntentId}
POST   /api/v1/tenant/payment-intents/{paymentIntentId}/checkout-sessions
POST   /api/v1/tenant/payment-intents/{paymentIntentId}/cancel
POST   /api/v1/tenant/payment-intents/{paymentIntentId}/expire
```

---

### 20.4. Own — intenciones propias

```text id="za8n1u"
GET    /api/v1/me/payment-intents
POST   /api/v1/me/payment-intents
GET    /api/v1/me/payment-intents/{paymentIntentId}
POST   /api/v1/me/payment-intents/{paymentIntentId}/checkout-sessions
POST   /api/v1/me/payment-intents/{paymentIntentId}/cancel
```

---

### 20.5. Webhooks

```text id="pmz7tn"
POST   /api/v1/webhooks/payment-providers/{providerKey}
```

---

### 20.6. Tenant — webhook events

```text id="m2ooiv"
GET    /api/v1/tenant/payment-provider-webhook-events
GET    /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}
POST   /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}/reprocess
POST   /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}/archive
```

---

### 20.7. Tenant — provider transactions

```text id="fslnbk"
GET    /api/v1/tenant/provider-transactions
GET    /api/v1/tenant/provider-transactions/{providerTransactionId}
POST   /api/v1/tenant/provider-transactions/{providerTransactionId}/mark-review-required
POST   /api/v1/tenant/provider-transactions/{providerTransactionId}/archive
```

---

### 20.8. Tenant — mappings

```text id="v5ym6n"
GET    /api/v1/tenant/provider-payment-mappings
GET    /api/v1/tenant/provider-payment-mappings/{mappingId}
POST   /api/v1/tenant/provider-payment-mappings/{mappingId}/reverse
```

---

### 20.9. Tenant — settlements

```text id="o0jmac"
GET    /api/v1/tenant/provider-settlements
GET    /api/v1/tenant/provider-settlements/{settlementId}
POST   /api/v1/tenant/provider-settlements/{settlementId}/link-bank-transaction
POST   /api/v1/tenant/provider-settlements/{settlementId}/archive
```

---

### 20.10. Tenant — reportes

```text id="vdp7f7"
GET    /api/v1/tenant/payment-provider-reports/summary
GET    /api/v1/tenant/payment-provider-reports/transactions
GET    /api/v1/tenant/payment-provider-reports/failures
GET    /api/v1/tenant/payment-provider-reports/settlements
GET    /api/v1/tenant/payment-provider-reports/export
```

---

### 20.11. Endpoints públicos prohibidos

No crear:

```text id="wovqaq"
GET  /api/v1/public/payment-providers
GET  /api/v1/public/payment-intents
POST /api/v1/public/payment-intents
GET  /api/v1/public/provider-transactions
GET  /api/v1/public/payment-provider-reports
GET  /api/v1/public/tenants/{slug}/payment-providers
POST /api/v1/public/tenants/{slug}/payment-intents
```

---

## 21. DTOs previstos

### 21.1. Provider definitions

```text id="i7hfxa"
CreatePaymentProviderDefinitionDto
UpdatePaymentProviderDefinitionDto
ActivatePaymentProviderDefinitionDto
DeprecatePaymentProviderDefinitionDto
ArchivePaymentProviderDefinitionDto
PaymentProviderDefinitionDto
PaymentProviderDefinitionListItemDto
PaymentProviderDefinitionFilterDto
```

---

### 21.2. Tenant provider configs

```text id="qbgoig"
CreateTenantPaymentProviderConfigDto
UpdateTenantPaymentProviderConfigDto
EnableTenantPaymentProviderConfigDto
DisableTenantPaymentProviderConfigDto
TestTenantPaymentProviderConnectionDto
ArchiveTenantPaymentProviderConfigDto
TenantPaymentProviderConfigDto
TenantPaymentProviderConfigListItemDto
TenantPaymentProviderConfigFilterDto
```

---

### 21.3. Payment intents

```text id="b9dof1"
CreatePaymentIntentDto
CreateOwnPaymentIntentDto
CancelPaymentIntentDto
ExpirePaymentIntentDto
PaymentIntentDto
PaymentIntentListItemDto
PaymentIntentItemDto
PaymentIntentFilterDto
```

---

### 21.4. Checkout sessions

```text id="repg1i"
CreatePaymentCheckoutSessionDto
PaymentCheckoutSessionDto
OwnPaymentCheckoutSessionDto
```

---

### 21.5. Webhook events

```text id="krddqy"
ProviderWebhookEventDto
ProviderWebhookEventListItemDto
ProviderWebhookEventFilterDto
ReprocessProviderWebhookEventDto
ArchiveProviderWebhookEventDto
```

---

### 21.6. Provider transactions

```text id="cl5455"
ProviderTransactionDto
ProviderTransactionListItemDto
ProviderTransactionFilterDto
MarkProviderTransactionReviewRequiredDto
ArchiveProviderTransactionDto
```

---

### 21.7. Mappings

```text id="rjgj4x"
ProviderPaymentMappingDto
ProviderPaymentMappingListItemDto
ProviderPaymentMappingFilterDto
ReverseProviderPaymentMappingDto
```

---

### 21.8. Settlements

```text id="iu2gwg"
ProviderSettlementRecordDto
ProviderSettlementRecordListItemDto
ProviderSettlementRecordFilterDto
LinkProviderSettlementToBankTransactionDto
ArchiveProviderSettlementDto
```

---

### 21.9. Reports

```text id="wcmjx4"
PaymentProviderSummaryReportDto
PaymentProviderTransactionsReportDto
PaymentProviderFailuresReportDto
PaymentProviderSettlementsReportDto
PaymentProviderReportExportDto
```

---

## 22. Campos prohibidos en requests externos

Los DTOs externos deben rechazar:

```text id="mermji"
tenantId
createdBy
updatedBy
enabledBy
disabledBy
archivedBy
initiatedByUserId
confirmedBy
failedBy
cancelledBy
expiredBy
processedBy
paymentId manual en webhook
providerPaymentMappingId manual
providerTransactionId en creación de intent
providerEventId en creación de intent
amount como fuente de verdad si se pagan cargos/saldos internos
currency no soportada
credentialSecret value
webhookSecret value
credentialSecretRef en /me
webhookSecretRef en /me
provider raw payload
webhook signature raw
checkoutUrl manual
status directo salvo transición controlada
storageKey
cardNumber
PAN
CVV
cardToken raw sensible
trackData
```

---

## 23. Permisos

### 23.1. Platform

```text id="t4kr9c"
paymentProviderDefinitions.create
paymentProviderDefinitions.read
paymentProviderDefinitions.update
paymentProviderDefinitions.activate
paymentProviderDefinitions.deprecate
paymentProviderDefinitions.archive
```

---

### 23.2. Tenant provider configs

```text id="r61qwr"
tenantPaymentProviders.create
tenantPaymentProviders.read
tenantPaymentProviders.update
tenantPaymentProviders.enable
tenantPaymentProviders.disable
tenantPaymentProviders.testConnection
tenantPaymentProviders.archive
```

---

### 23.3. Payment intents

```text id="dm78ul"
paymentIntents.create
paymentIntents.read
paymentIntents.cancel
paymentIntents.expire
paymentIntents.create.own
paymentIntents.read.own
paymentIntents.cancel.own
```

---

### 23.4. Checkout sessions

```text id="up7gwq"
paymentCheckoutSessions.create
paymentCheckoutSessions.read
paymentCheckoutSessions.create.own
paymentCheckoutSessions.read.own
```

---

### 23.5. Webhook events

```text id="a9r1jy"
paymentProviderWebhooks.read
paymentProviderWebhooks.reprocess
paymentProviderWebhooks.archive
```

---

### 23.6. Provider transactions

```text id="q4qxjn"
providerTransactions.read
providerTransactions.review
providerTransactions.archive
```

---

### 23.7. Provider mappings

```text id="toopfc"
providerPaymentMappings.read
providerPaymentMappings.reverse
```

---

### 23.8. Settlements

```text id="y8565m"
providerSettlements.read
providerSettlements.linkToBankTransaction
providerSettlements.archive
```

---

### 23.9. Reports

```text id="maasfm"
paymentProviderReports.read
paymentProviderReports.export
```

---

### 23.10. Audit

```text id="dg78az"
paymentProvider.audit.read
```

---

## 24. Guards y policies

### 24.1. Guards

```text id="h8vkuz"
PaymentProviderPermissionGuard
PlatformPaymentProviderGuard
TenantPaymentProviderGuard
PaymentIntentTenantGuard
PaymentIntentOwnResourceGuard
PaymentCheckoutSessionGuard
ProviderWebhookSignatureGuard
ProviderWebhookReplayGuard
ProviderTransactionTenantGuard
ProviderPaymentMappingTenantGuard
ProviderSettlementTenantGuard
PaymentProviderReportGuard
```

---

### 24.2. Policies

```text id="ixgrpm"
ProviderDefinitionStatePolicy
TenantProviderConfigStatePolicy
PaymentProviderSecretPolicy
PaymentIntentAmountPolicy
PaymentIntentItemPolicy
PaymentIntentStatePolicy
PaymentIntentExpirationPolicy
PaymentIntentOwnershipPolicy
CheckoutSessionPolicy
CheckoutUrlSafetyPolicy
WebhookSignaturePolicy
WebhookReplayProtectionPolicy
WebhookIdempotencyPolicy
WebhookProcessingPolicy
ProviderTransactionUniquenessPolicy
ProviderTransactionStatusPolicy
PaymentCreationFromProviderPolicy
PaymentAllocationFromProviderPolicy
ProviderPaymentMappingPolicy
ProviderSettlementPolicy
NoCardDataPolicy
NoSecretExposurePolicy
NoPublicPaymentEndpointPolicy
NoExternalAiPaymentDataPolicy
AuditSanitizationPolicy
```

---

## 25. Seguridad técnica

Reglas obligatorias:

```text id="g8lteg"
- no aceptar tenantId desde body;
- no consultar entidades tenant-scoped solo por id;
- no guardar secretos en texto plano;
- no exponer credentialSecretRef a /me;
- no exponer webhookSecretRef a /me;
- no exponer valores de secretos a ningún endpoint;
- no guardar PAN;
- no guardar CVV;
- no guardar raw card data;
- no crear Payment desde redirect del navegador;
- no crear Payment sin webhook verificado;
- no duplicar Payment por webhook repetido;
- no aceptar amount calculado por cliente como fuente de verdad;
- no exponer checkoutUrl en logs;
- no exponer payload completo de webhook;
- no exponer raw signature;
- no crear endpoints públicos administrativos;
- no enviar datos reales a IA externa.
```

---

## 26. Auditoría

### 26.1. Eventos obligatorios

```text id="od6b4h"
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

### 26.2. Metadata permitida

```text id="ebmfcs"
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

### 26.3. Metadata prohibida

```text id="pfnyrw"
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

## 27. Observabilidad

### 27.1. Logs sugeridos

```text id="oachvh"
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

### 27.2. Métricas sugeridas

```text id="izbipy"
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

### 27.3. Labels permitidos

```text id="pzfpqx"
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

### 27.4. Labels prohibidos

```text id="pzrwiy"
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

## 28. OpenAPI

### 28.1. Tags sugeridos

```text id="nfxgsa"
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

### 28.2. Extensiones OpenAPI requeridas

Para endpoints tenant:

```yaml id="zu5s9o"
x-tenant-scope: true
x-auth-required: true
x-payment-provider-integration: true
x-public-exposure: false
```

Para endpoints own:

```yaml id="l3n9hn"
x-own-resource: true
x-auth-required: true
x-payment-provider-integration: true
x-public-exposure: false
```

Para webhooks:

```yaml id="pjpi65"
x-webhook-endpoint: true
x-provider-signature-required: true
x-idempotent-processing: true
x-public-user-endpoint: false
x-audit-event: providerWebhook.received
```

Para secretos:

```yaml id="td0lth"
x-secrets-exposed: false
x-card-data-stored: false
```

Regla:

```text id="qmuoln"
OpenAPI no debe documentar endpoints públicos funcionales de pago ni campos sensibles.
```

---

## 29. Implementación por fases

### 29.1. Orden recomendado

```text id="cmsjig"
1. Crear estructura base del módulo.
2. Implementar enums y constantes.
3. Implementar value objects.
4. Implementar entidades de dominio.
5. Implementar state machines.
6. Crear Prisma schema y migración.
7. Implementar repositorios tenant-scoped.
8. Implementar ports de proveedor y secret management.
9. Implementar adapter mock/sandbox.
10. Implementar provider definitions platform.
11. Implementar tenant provider config.
12. Implementar PaymentIntentService.
13. Implementar PaymentIntentItemService.
14. Implementar cálculo de montos desde Charges/Account Statements.
15. Implementar CheckoutSessionService.
16. Implementar webhook raw body handling.
17. Implementar firma y verificación.
18. Implementar replay/idempotency.
19. Implementar ProviderWebhookEventService.
20. Implementar ProviderTransactionService.
21. Implementar PaymentCreationFromProviderService.
22. Implementar ProviderPaymentMappingService.
23. Implementar ProviderSettlementService básico.
24. Implementar reportes.
25. Implementar controllers.
26. Implementar audit.
27. Implementar observability.
28. Implementar OpenAPI.
29. Implementar tests.
30. Ejecutar security hardening.
```

---

### 29.2. PRs sugeridos

```text id="xtkvvs"
PR-018-01 — Module skeleton, enums and constants.
PR-018-02 — Value objects, entities and state machines.
PR-018-03 — Prisma schema, migration, constraints and indexes.
PR-018-04 — Repository ports and Prisma repositories.
PR-018-05 — Provider ports, registry and mock/sandbox adapter.
PR-018-06 — Secret refs and provider config security.
PR-018-07 — Platform provider definitions.
PR-018-08 — Tenant provider configuration.
PR-018-09 — Payment intents and items.
PR-018-10 — Amount calculation from Charges and Account Statements.
PR-018-11 — Checkout session creation.
PR-018-12 — Webhook endpoint, signature verification and replay protection.
PR-018-13 — Webhook idempotency and ProviderWebhookEvent processing.
PR-018-14 — ProviderTransaction and status mapping.
PR-018-15 — Payment creation from verified provider event.
PR-018-16 — ProviderPaymentMapping and Payments integration.
PR-018-17 — Settlements and Bank Reconciliation readiness.
PR-018-18 — Reports and exports.
PR-018-19 — Audit, observability and OpenAPI.
PR-018-20 — Tests, security hardening, performance and CI gates.
```

---

## 30. Testing plan resumido

### 30.1. Unit tests

```text id="f4xm15"
PaymentProviderDefinition entity
TenantPaymentProviderConfig entity
PaymentIntent entity
PaymentIntentItem entity
PaymentCheckoutSession entity
ProviderWebhookEvent entity
ProviderTransaction entity
ProviderPaymentMapping entity
ProviderSettlementRecord entity
Money Decimal value object
WebhookSignatureVerifier
WebhookPayloadHasher
ProviderStatusMapper
PaymentIntentAmountCalculator
```

---

### 30.2. Integration tests

```text id="gldwt7"
Provider adapter mock
Provider config secret refs
PaymentIntent creation with Charges
PaymentIntent creation with Account Balance
CheckoutSession creation
Webhook verification
Webhook idempotency
ProviderTransaction creation
Payment creation from provider
Payment allocation
Secure Document Storage evidence
Account Statements update
Bank Reconciliation readiness
Audit integration
Notifications integration
```

---

### 30.3. API tests

```text id="ozdgoc"
platform provider definition CRUD/state transitions
tenant provider config CRUD/state transitions
own payment intent create/list/get/cancel
tenant payment intent admin list/get/cancel
checkout session creation
webhook receive verified
webhook reject invalid signature
webhook duplicate does not duplicate payment
provider transactions list/get
mappings list/get/reverse
settlements list/get/link
reports summary/transactions/failures/export
```

---

### 30.4. Security tests

```text id="azoh5g"
no tenantId body
no cross-tenant provider config
no cross-tenant payment intent
no cross-tenant charge
no cross-tenant payment
no secrets in DTO
no card data stored
no checkoutUrl in logs
no raw webhook payload in logs
invalid webhook signature rejected
webhook replay idempotent
amount mismatch rejected
currency mismatch rejected
no public payment-intent endpoints
WordPress cannot confirm payment
external IA disabled
```

---

## 31. Performance objetivo

### 31.1. Objetivos MVP

```text id="ntpv3h"
p95 < 800 ms para crear PaymentIntent.
p95 < 1200 ms para crear CheckoutSession, excluyendo latencia del proveedor.
p95 < 1000 ms para registrar webhook recibido.
p95 < 3000 ms para procesar webhook exitoso y crear Payment.
p95 < 800 ms para consultar intents paginados.
p95 < 1200 ms para consultar transacciones paginadas.
```

---

### 31.2. Reglas técnicas

```text id="hr88nw"
- paginación obligatoria;
- pageSize máximo 100;
- índices por tenant_id;
- índices por providerKey;
- índices por status;
- índices por providerEventId;
- índices por providerTransactionId;
- no N+1;
- procesamiento idempotente;
- no logs con payload completo;
- no base64 en JSON;
- procesamientos pesados a job futuro si aplica.
```

---

## 32. Feature flags

```text id="fsvhu6"
paymentProviderIntegration.enabled
paymentProviderIntegration.platformDefinitions.enabled
paymentProviderIntegration.tenantConfigs.enabled
paymentProviderIntegration.ownPaymentIntents.enabled
paymentProviderIntegration.hostedCheckout.enabled
paymentProviderIntegration.webhooks.enabled
paymentProviderIntegration.providerTransactions.enabled
paymentProviderIntegration.paymentCreation.enabled
paymentProviderIntegration.settlements.enabled
paymentProviderIntegration.reports.enabled
paymentProviderIntegration.refunds.enabled
paymentProviderIntegration.chargebacks.enabled
paymentProviderIntegration.recurringPayments.enabled
paymentProviderIntegration.qrPayments.enabled
paymentProviderIntegration.anonymousPaymentLinks.enabled
paymentProviderIntegration.aiRiskScoring.enabled
```

Defaults MVP:

```text id="jm9m11"
paymentProviderIntegration.enabled = true
paymentProviderIntegration.platformDefinitions.enabled = true
paymentProviderIntegration.tenantConfigs.enabled = true
paymentProviderIntegration.ownPaymentIntents.enabled = true
paymentProviderIntegration.hostedCheckout.enabled = true
paymentProviderIntegration.webhooks.enabled = true
paymentProviderIntegration.providerTransactions.enabled = true
paymentProviderIntegration.paymentCreation.enabled = true
paymentProviderIntegration.settlements.enabled = false
paymentProviderIntegration.reports.enabled = true
paymentProviderIntegration.refunds.enabled = false
paymentProviderIntegration.chargebacks.enabled = false
paymentProviderIntegration.recurringPayments.enabled = false
paymentProviderIntegration.qrPayments.enabled = false
paymentProviderIntegration.anonymousPaymentLinks.enabled = false
paymentProviderIntegration.aiRiskScoring.enabled = false
```

---

## 33. Variables de configuración sugeridas

```text id="z3j25x"
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

---

## 34. Errores esperados

Catálogo inicial:

```text id="i0j8uv"
PAYMENT_PROVIDER_DEFINITION_NOT_FOUND
PAYMENT_PROVIDER_DEFINITION_FORBIDDEN
PAYMENT_PROVIDER_DEFINITION_INVALID_STATUS
PAYMENT_PROVIDER_DEFINITION_ARCHIVED
PAYMENT_PROVIDER_UNSUPPORTED
PAYMENT_PROVIDER_DEPRECATED

TENANT_PAYMENT_PROVIDER_CONFIG_NOT_FOUND
TENANT_PAYMENT_PROVIDER_CONFIG_FORBIDDEN
TENANT_PAYMENT_PROVIDER_CONFIG_INVALID_STATUS
TENANT_PAYMENT_PROVIDER_CONFIG_DISABLED
TENANT_PAYMENT_PROVIDER_CONFIG_INVALID
TENANT_PAYMENT_PROVIDER_CONFIG_ARCHIVED
TENANT_PAYMENT_PROVIDER_CONFIG_CROSS_TENANT_REFERENCE
TENANT_PAYMENT_PROVIDER_SECRET_INVALID
TENANT_PAYMENT_PROVIDER_CONNECTION_FAILED

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

CHECKOUT_SESSION_NOT_FOUND
CHECKOUT_SESSION_FORBIDDEN
CHECKOUT_SESSION_INVALID_STATUS
CHECKOUT_SESSION_CREATION_FAILED
CHECKOUT_SESSION_EXPIRED
CHECKOUT_URL_EXPOSURE_FORBIDDEN

PROVIDER_WEBHOOK_SIGNATURE_MISSING
PROVIDER_WEBHOOK_SIGNATURE_INVALID
PROVIDER_WEBHOOK_TIMESTAMP_EXPIRED
PROVIDER_WEBHOOK_REPLAY_DETECTED
PROVIDER_WEBHOOK_DUPLICATE
PROVIDER_WEBHOOK_PAYLOAD_INVALID
PROVIDER_WEBHOOK_PROCESSING_FAILED
PROVIDER_WEBHOOK_REPROCESS_FORBIDDEN
PROVIDER_WEBHOOK_EVENT_NOT_FOUND

PROVIDER_TRANSACTION_NOT_FOUND
PROVIDER_TRANSACTION_FORBIDDEN
PROVIDER_TRANSACTION_DUPLICATE
PROVIDER_TRANSACTION_AMOUNT_MISMATCH
PROVIDER_TRANSACTION_CURRENCY_MISMATCH
PROVIDER_TRANSACTION_REQUIRES_REVIEW
PROVIDER_TRANSACTION_NOT_PAYABLE
PROVIDER_TRANSACTION_CROSS_TENANT_REFERENCE

PROVIDER_PAYMENT_MAPPING_NOT_FOUND
PROVIDER_PAYMENT_MAPPING_FORBIDDEN
PROVIDER_PAYMENT_MAPPING_DUPLICATE
PROVIDER_PAYMENT_MAPPING_INVALID_STATUS
PROVIDER_PAYMENT_MAPPING_REVERSE_REASON_REQUIRED

PROVIDER_SETTLEMENT_NOT_FOUND
PROVIDER_SETTLEMENT_FORBIDDEN
PROVIDER_SETTLEMENT_CROSS_TENANT_REFERENCE
PROVIDER_SETTLEMENT_BANK_TRANSACTION_INVALID

PAYMENT_CREATION_FROM_PROVIDER_FAILED
PAYMENT_ALREADY_CREATED_FROM_PROVIDER
PAYMENT_ALLOCATION_FROM_PROVIDER_FAILED

CARD_DATA_FORBIDDEN
SECRET_EXPOSURE_FORBIDDEN
RAW_PROVIDER_PAYLOAD_FORBIDDEN
PUBLIC_PAYMENT_ENDPOINT_FORBIDDEN

VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
RATE_LIMITED
INTERNAL_ERROR
```

---

## 35. Seeds y datos demo

Crear seeds ficticios para:

```text id="hdavpk"
paymentProviderDefinitionMock
paymentProviderDefinitionSandbox
paymentProviderDefinitionDeprecated

tenantPaymentProviderConfigMockA
tenantPaymentProviderConfigSandboxA
tenantPaymentProviderConfigDisabledA
tenantPaymentProviderConfigInvalidA
tenantPaymentProviderConfigTenantB

paymentIntentChargesA
paymentIntentBalanceA
paymentIntentFineA
paymentIntentReservationA
paymentIntentSucceededA
paymentIntentFailedA
paymentIntentExpiredA
paymentIntentCancelledA
paymentIntentTenantB

paymentCheckoutSessionCreatedA
paymentCheckoutSessionCompletedA
paymentCheckoutSessionExpiredA
paymentCheckoutSessionTenantB

providerWebhookEventVerifiedA
providerWebhookEventInvalidSignatureA
providerWebhookEventDuplicateA
providerWebhookEventFailedA
providerWebhookEventTenantB

providerTransactionSucceededA
providerTransactionFailedA
providerTransactionRequiresReviewA
providerTransactionAmountMismatchA
providerTransactionTenantB

providerPaymentMappingActiveA
providerPaymentMappingReversedA
providerPaymentMappingTenantB

providerSettlementPendingA
providerSettlementSettledA
providerSettlementTenantB
```

Prohibido en seeds:

```text id="u3l75e"
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

## 36. Riesgos técnicos

| Riesgo                                | Impacto | Mitigación                                            |
| ------------------------------------- | ------: | ----------------------------------------------------- |
| Webhook falso crea pago               | Crítico | firma + verification + idempotencia                   |
| Replay duplica pago                   | Crítico | providerEventId unique + providerTransactionId unique |
| Cliente altera monto                  | Crítico | amount server-side                                    |
| PaymentIntent cross-tenant            | Crítico | tenant guards                                         |
| Charge cross-tenant                   | Crítico | source validation                                     |
| Secretos expuestos                    | Crítico | SecretRef + DTO minimization                          |
| Datos de tarjeta almacenados          | Crítico | hosted checkout + no card data                        |
| Checkout URL en logs                  |    Alto | log sanitizer                                         |
| Raw webhook payload en logs           |    Alto | payloadHash + preview                                 |
| ProviderTransaction duplicada         |    Alto | unique constraints                                    |
| Payment creado sin allocation         |    Alto | PaymentsIntegrationPort                               |
| Payment creado sin webhook verificado | Crítico | PaymentCreationFromProviderPolicy                     |
| Provider caído                        |   Medio | estado failed/pending + retry controlado              |
| Webhook llega antes que redirect      |    Bajo | webhook como fuente de verdad                         |
| Redirect llega sin webhook            |   Medio | pendingProviderConfirmation                           |
| Refund no soportado                   |   Medio | requiresReview                                        |
| Chargeback no soportado               |    Alto | requiresReview + audit                                |
| Reporte incluye tenant B              | Crítico | tenant-scoped reports                                 |

---

## 37. Criterios de aceptación técnica

La implementación deberá cumplir:

```text id="b8pnq5"
- provider definitions platform funcionan;
- provider config tenant funciona;
- secretos no se exponen;
- credenciales se manejan como SecretRef;
- PaymentIntent se crea tenant-scoped;
- PaymentIntent own valida persona/unidad;
- PaymentIntent no acepta amount arbitrario como fuente de verdad;
- PaymentIntentItems se crean;
- monto se calcula en servidor;
- currency USD validada;
- CheckoutSession se crea con adapter;
- checkoutUrl se devuelve solo al usuario autorizado;
- checkoutUrl no aparece en logs;
- webhook endpoint valida firma;
- webhook endpoint rechaza firma inválida;
- webhook duplicado no duplica Payment;
- providerTransactionId único;
- Payment interno se crea solo con evento verificado;
- Payment interno no se duplica;
- Payments se integra correctamente;
- Account Statements reflejan Payment;
- Bank Reconciliation queda preparado;
- ProviderWebhookEvent se guarda sanitizado;
- ProviderTransaction se guarda sin card data sensible;
- reportes son tenant-scoped;
- audit se emite;
- logs son seguros;
- OpenAPI no documenta endpoints públicos funcionales;
- no se almacenan datos sensibles de tarjeta;
- no se envían datos reales a IA externa;
- CI pasa.
```

---

## 38. Definition of Done

El módulo se considera listo cuando:

```text id="bnwkfu"
1. spec.md está aprobado.
2. plan.md está aprobado.
3. data-model.md está creado.
4. api-contract.md está creado.
5. test-plan.md está creado.
6. tasks.md está creado.
7. security-notes.md está creado.
8. Prisma schema está implementado.
9. Migración está ejecutada en test.
10. Repositorios funcionan.
11. Provider registry funciona.
12. Mock provider adapter funciona.
13. SecretRef abstraction funciona.
14. Platform provider definitions funcionan.
15. Tenant provider configs funcionan.
16. PaymentIntentService funciona.
17. PaymentIntentAmountService funciona.
18. CheckoutSessionService funciona.
19. WebhookSignatureVerifier funciona.
20. Webhook idempotency funciona.
21. ProviderWebhookEventService funciona.
22. ProviderTransactionService funciona.
23. PaymentCreationFromProviderService funciona.
24. ProviderPaymentMappingService funciona.
25. ProviderSettlementService básico funciona si está habilitado.
26. Payments integration funciona.
27. Account Statements integration no rompe saldos.
28. Bank Reconciliation readiness validada.
29. Secure Document Storage integration funciona si hay comprobantes/exports.
30. Notifications integration no expone datos sensibles.
31. Reports funcionan.
32. Audit funciona.
33. Observability funciona.
34. Controllers funcionan.
35. OpenAPI está actualizado.
36. Tests unitarios pasan.
37. Tests de repositorio pasan.
38. Tests API pasan.
39. Tests de autorización pasan.
40. Tests multitenant pasan.
41. Tests de webhooks pasan.
42. Tests de idempotencia pasan.
43. Tests de seguridad pasan.
44. Build pasa.
45. CI pasa.
```

---

## 39. No aceptación

No se acepta implementación si:

```text id="bg9rei"
- permite provider config cross-tenant;
- permite payment intent cross-tenant;
- permite checkout session cross-tenant;
- permite provider transaction cross-tenant;
- permite webhook event cross-tenant;
- permite payment mapping cross-tenant;
- permite settlement cross-tenant;
- permite crear PaymentIntent con charge de otro tenant;
- acepta tenantId desde body;
- busca entidades tenant-scoped solo por id;
- expone secretos;
- expone credentialSecret value;
- expone webhookSecret value;
- expone raw signature;
- expone checkoutUrl en logs;
- expone payload completo de webhook;
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

## 40. Resultado esperado

Al finalizar la implementación de `018-payment-provider-integration`, RESIDENT Core tendrá un módulo seguro para pagos en línea con proveedores externos.

Resultado esperado:

```text id="pd2iuc"
- provider definitions platform;
- provider configs por tenant;
- credenciales protegidas;
- adapter mock/sandbox;
- PaymentProviderPort;
- PaymentIntent tenant-scoped;
- PaymentIntentItems;
- cálculo server-side de montos;
- checkout externo;
- CheckoutSession temporal;
- endpoint webhook firmado;
- validación de firma;
- replay protection;
- webhook idempotente;
- ProviderWebhookEvent sanitizado;
- ProviderTransaction;
- Payment interno creado desde proveedor verificado;
- ProviderPaymentMapping;
- ProviderSettlementRecord básico;
- integración con Payments;
- integración con Account Statements;
- preparación para Bank Reconciliation;
- reportes básicos;
- auditoría financiera;
- observabilidad segura;
- OpenAPI consistente;
- cero card data storage;
- cero secretos expuestos;
- cero endpoints públicos administrativos;
- cero IA externa con datos reales.
```

El módulo quedará preparado para futuras specs de:

```text id="ey6p7r"
open-banking-integration
accounting-ledger
provider-refunds-disputes
recurring-payments
payment-links-and-qr
advanced-reconciliation
financial-closing
electronic-invoicing
multi-currency
payment-risk-scoring
```
