# Test Plan — Spec 018 Payment Provider Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                           |
| Spec ID         | 018                                                                                                                                                                                                                                                     |
| Módulo          | Payment Provider Integration                                                                                                                                                                                                                            |
| Documento       | Test Plan                                                                                                                                                                                                                                               |
| Ruta            | `docs/specs/018-payment-provider-integration/test-plan.md`                                                                                                                                                                                              |
| Versión         | 0.1                                                                                                                                                                                                                                                     |
| Estado          | needs-review                                                                                                                                                                                                                                            |
| Fecha           | 2026-07-23                                                                                                                                                                                                                                              |
| Documento base  | `docs/specs/018-payment-provider-integration/spec.md`                                                                                                                                                                                                   |
| Plan técnico    | `docs/specs/018-payment-provider-integration/plan.md`                                                                                                                                                                                                   |
| Modelo de datos | `docs/specs/018-payment-provider-integration/data-model.md`                                                                                                                                                                                             |
| Contrato API    | `docs/specs/018-payment-provider-integration/api-contract.md`                                                                                                                                                                                           |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `012-communications-notifications`, `016-secure-document-storage`, `017-bank-reconciliation` |
| Naturaleza      | Tenant-scoped / Provider-agnostic / Webhook-driven / Idempotent / Payment-aware / Audit-heavy / PCI-minimized / Non-public administrative surface                                                                                                       |

---

## 2. Propósito

Este documento define la estrategia de pruebas para el módulo `018-payment-provider-integration`.

El objetivo es validar que la integración con proveedores externos de pago funcione correctamente desde el punto de vista funcional, financiero, multitenant, de seguridad, idempotencia, webhooks, auditoría, observabilidad e integración con módulos existentes.

Regla central:

```text id="x9w65m"
Payment Provider Integration debe probarse como un módulo financiero crítico: ningún test debe permitir crear pagos sin webhook verificado, duplicar pagos por eventos repetidos, aceptar montos arbitrarios del cliente, exponer secretos, almacenar datos de tarjeta, procesar recursos cross-tenant, confiar en redirects del navegador o crear endpoints públicos administrativos.
```

---

## 3. Objetivos de prueba

Las pruebas deben verificar:

```text id="nwbzl8"
- definiciones platform de proveedores;
- configuración tenant de proveedores;
- manejo seguro de SecretRef;
- no exposición de secretos;
- arquitectura provider-agnostic;
- adapter mock/sandbox;
- creación de PaymentIntent;
- creación de PaymentIntentItems;
- cálculo server-side de montos;
- creación de CheckoutSession;
- exposición temporal controlada de checkoutUrl;
- no logs de checkoutUrl;
- retorno de navegador sin efecto financiero;
- recepción de webhook;
- validación de firma de webhook;
- protección contra replay;
- procesamiento idempotente;
- ProviderWebhookEvent sanitizado;
- ProviderTransaction;
- mapeo de estados externos a internos;
- creación de Payment interno solo ante evento verificado;
- ProviderPaymentMapping;
- no duplicación de Payment;
- manejo de fallos, cancelaciones, expiraciones, refunds y chargebacks;
- settlement básico;
- integración con Payments;
- integración con Account Statements;
- preparación para Bank Reconciliation;
- integración con Secure Document Storage;
- integración con Notifications;
- auditoría financiera;
- logs y métricas seguras;
- OpenAPI seguro;
- ausencia de endpoints públicos administrativos;
- ausencia de datos reales enviados a IA externa.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="npkp99"
1. Unit tests.
2. Domain tests.
3. Value object tests.
4. State machine tests.
5. Repository tests.
6. Service tests.
7. Adapter tests.
8. SecretRef tests.
9. PaymentIntent amount calculation tests.
10. Checkout session tests.
11. Webhook signature tests.
12. Webhook replay tests.
13. Webhook idempotency tests.
14. Provider status mapping tests.
15. Payment creation from provider tests.
16. ProviderPaymentMapping tests.
17. Settlement tests.
18. Integration tests.
19. API tests.
20. Authorization tests.
21. Own-resource tests.
22. Multitenancy tests.
23. Financial integrity tests.
24. Security tests.
25. Audit tests.
26. Observability tests.
27. OpenAPI tests.
28. Performance tests.
29. Concurrency tests.
30. Regression tests.
31. Smoke tests.
32. CI/CD gates.
```

---

### 4.2. Fuera de alcance

No se probará como funcionalidad activa en MVP:

```text id="mwf24h"
- captura directa de tarjeta;
- almacenamiento de PAN;
- almacenamiento de CVV;
- tokenización propia;
- recurring payments;
- débitos automáticos;
- domiciliación bancaria;
- refunds automáticos;
- chargebacks avanzados;
- disputas avanzadas;
- antifraude avanzado;
- scoring de riesgo con IA;
- pago anónimo;
- links públicos permanentes de pago;
- QR público sin expiración;
- marketplace;
- split payments avanzado;
- wallet interno;
- pagos a proveedores;
- facturación electrónica;
- integración SRI;
- contabilidad completa;
- Open Banking;
- conciliación bancaria automática final.
```

Estos elementos se prueban únicamente como:

```text id="urxhlm"
- feature flags desactivados;
- endpoints inexistentes;
- estados requiresReview;
- flujos diferidos;
- rutas bloqueadas;
- políticas de no aceptación.
```

---

## 5. Estrategia general

### 5.1. Capas de prueba

```text id="s08vcn"
Unit tests
  ↓
Domain tests
  ↓
Repository tests
  ↓
Service tests
  ↓
Adapter tests
  ↓
Integration tests
  ↓
API tests
  ↓
Security tests
  ↓
Performance/concurrency tests
  ↓
Smoke tests
  ↓
CI/CD gates
```

---

### 5.2. Prioridad de pruebas

| Prioridad | Área                 | Motivo                                 |
| --------- | -------------------- | -------------------------------------- |
| P0        | Webhook signature    | Evitar pagos falsos                    |
| P0        | Idempotencia         | Evitar pagos duplicados                |
| P0        | Multitenancy         | Evitar exposición o cobro cross-tenant |
| P0        | No card data         | Minimizar alcance PCI                  |
| P0        | Secret exposure      | Evitar fuga de credenciales            |
| P0        | Payment creation     | Evitar pagos internos inválidos        |
| P0        | Amount calculation   | Evitar manipulación de montos          |
| P1        | Checkout             | Garantizar experiencia de pago segura  |
| P1        | Provider adapter     | Mantener arquitectura desacoplada      |
| P1        | Payments integration | Garantizar consistencia financiera     |
| P1        | Account Statements   | Garantizar saldos correctos            |
| P1        | Audit                | Garantizar trazabilidad                |
| P2        | Reports              | Garantizar visibilidad administrativa  |
| P2        | Performance          | Garantizar operación razonable         |

---

## 6. Datos de prueba

### 6.1. Tenants

```text id="ah2obk"
tenantA
tenantB
tenantSuspended
tenantArchived
tenantWithoutProvider
```

---

### 6.2. Usuarios

```text id="pyqjww"
platformAdmin
tenantAdminA
financialManagerA
accountantA
boardMemberA
ownerA
residentA
residentWithoutUnitA
unauthorizedUserA
disabledUserA
userWithoutMembership
financialManagerB
ownerB
```

---

### 6.3. Personas y unidades

```text id="zoxbnh"
personOwnerA
personResidentA
personTenantB
propertyUnitA101
propertyUnitA102
propertyUnitB201
propertyUnitArchivedA
```

---

### 6.4. Proveedores

```text id="w3q0wp"
paymentProviderDefinitionMock
paymentProviderDefinitionSandbox
paymentProviderDefinitionActive
paymentProviderDefinitionInactive
paymentProviderDefinitionDeprecated
paymentProviderDefinitionArchived
paymentProviderDefinitionWithoutWebhooks
paymentProviderDefinitionWithoutHostedCheckout
```

---

### 6.5. Configuraciones tenant

```text id="fpjals"
tenantPaymentProviderConfigEnabledA
tenantPaymentProviderConfigDraftA
tenantPaymentProviderConfigDisabledA
tenantPaymentProviderConfigInvalidA
tenantPaymentProviderConfigArchivedA
tenantPaymentProviderConfigMissingSecretsA
tenantPaymentProviderConfigProductionA
tenantPaymentProviderConfigTenantB
```

---

### 6.6. Cargos y saldos

```text id="w9b3xz"
chargePendingA
chargePartiallyPaidA
chargePaidA
chargeCancelledA
chargeReversedA
chargeArchivedA
chargeTenantB
accountBalancePendingA
accountBalanceZeroA
accountBalanceTenantB
```

---

### 6.7. Payment intents

```text id="gwfxoj"
paymentIntentCreatedA
paymentIntentCheckoutCreatedA
paymentIntentPendingProviderConfirmationA
paymentIntentSucceededA
paymentIntentFailedA
paymentIntentCancelledA
paymentIntentExpiredA
paymentIntentReversedA
paymentIntentArchivedA
paymentIntentTenantB
paymentIntentAmountMismatchA
paymentIntentCurrencyMismatchA
```

---

### 6.8. Checkout sessions

```text id="gpjg5v"
checkoutSessionCreatedA
checkoutSessionOpenedA
checkoutSessionCompletedA
checkoutSessionFailedA
checkoutSessionCancelledA
checkoutSessionExpiredA
checkoutSessionArchivedA
checkoutSessionTenantB
```

---

### 6.9. Webhook events

```text id="eb3e5m"
providerWebhookEventReceivedA
providerWebhookEventVerifiedA
providerWebhookEventInvalidSignatureA
providerWebhookEventMissingSignatureA
providerWebhookEventExpiredTimestampA
providerWebhookEventDuplicateA
providerWebhookEventProcessedA
providerWebhookEventFailedA
providerWebhookEventRejectedA
providerWebhookEventTenantB
```

---

### 6.10. Provider transactions

```text id="xryo28"
providerTransactionSucceededA
providerTransactionCapturedA
providerTransactionAuthorizedA
providerTransactionFailedA
providerTransactionCancelledA
providerTransactionExpiredA
providerTransactionRefundedA
providerTransactionPartiallyRefundedA
providerTransactionChargebackA
providerTransactionRequiresReviewA
providerTransactionAmountMismatchA
providerTransactionCurrencyMismatchA
providerTransactionTenantB
```

---

### 6.11. Payments y mappings

```text id="x7d5gb"
paymentCreatedFromProviderA
paymentManualA
paymentTenantB
providerPaymentMappingActiveA
providerPaymentMappingReversedA
providerPaymentMappingFailedA
providerPaymentMappingTenantB
```

---

### 6.12. Settlements

```text id="rswwog"
providerSettlementPendingA
providerSettlementSettledA
providerSettlementFailedA
providerSettlementReversedA
providerSettlementUnknownA
providerSettlementLinkedA
providerSettlementTenantB
```

---

## 7. Reglas de datos ficticios

Los tests, fixtures y seeds no deben usar:

```text id="ghx2l5"
- números reales de tarjeta;
- PAN reales;
- CVV reales;
- tokens reales de proveedor;
- secretos reales;
- webhook secrets reales;
- API keys reales;
- private keys reales;
- payloads reales de proveedor;
- checkoutUrls reales;
- datos financieros reales;
- comprobantes reales;
- nombres reales;
- emails reales;
- teléfonos reales;
- cédulas reales;
- storageKeys reales;
- signedUrls reales;
- dumps productivos.
```

Permitido:

```text id="aoxaz0"
- provider mock;
- fixtures sintéticos;
- payloads de webhook ficticios;
- cardLast4 ficticio;
- authorizationCodePreview ficticio;
- SecretRef falso;
- URLs mock no funcionales;
- datos financieros sintéticos.
```

---

# 8. Unit tests — Value Objects

## 8.1. `ProviderKey`

Debe probar:

```text id="x1rt4a"
- acepta providerKey válido;
- rechaza vacío;
- rechaza espacios;
- rechaza caracteres no permitidos;
- normaliza minúsculas si la política lo define;
- mantiene estabilidad;
- no permite providerKey no soportado.
```

---

## 8.2. `ProviderEnvironment`

Debe probar:

```text id="xor87t"
- acepta sandbox;
- acepta production;
- rechaza valores no soportados;
- sandbox es default en desarrollo;
- production requiere configuración explícita.
```

---

## 8.3. `SecretRef`

Debe probar:

```text id="ch4qme"
- acepta secretRef válido;
- rechaza valor vacío;
- rechaza secret value en lugar de ref;
- no serializa secreto real;
- no permite guardar secreto en metadata;
- expone configured=true sin exponer valor;
- trunca o enmascara referencia si policy admin lo permite.
```

---

## 8.4. `MoneyDecimal`

Debe probar:

```text id="oh8dh6"
- acepta "0.01";
- acepta "125.50";
- rechaza number;
- rechaza float;
- rechaza NaN;
- rechaza negativo;
- rechaza más de dos decimales si aplica;
- suma exacta;
- compara exacto;
- no usa JavaScript number para cálculos financieros.
```

---

## 8.5. `PaymentIntentExpiration`

Debe probar:

```text id="c3mqbd"
- crea expiración futura;
- rechaza expiración en pasado;
- usa TTL configurado;
- permite comparar expirado/no expirado;
- normaliza fecha a UTC.
```

---

## 8.6. `CheckoutUrl`

Debe probar:

```text id="ywwpli"
- acepta URL HTTPS válida;
- rechaza URL vacía;
- rechaza javascript:;
- rechaza data:;
- rechaza URL sin protocolo seguro;
- permite URL mock en test si policy lo habilita;
- calcula checkoutUrlHash;
- no se serializa en logs.
```

---

## 8.7. `WebhookSignature`

Debe probar:

```text id="uo1g95"
- acepta firma con formato válido;
- rechaza firma ausente;
- rechaza firma vacía;
- no serializa firma completa;
- calcula signatureHeaderHash;
- no registra firma en logs.
```

---

## 8.8. `WebhookPayloadHash`

Debe probar:

```text id="gxivzi"
- calcula SHA-256;
- mismo raw body genera mismo hash;
- raw body diferente genera hash diferente;
- hash no se acepta desde cliente como fuente de verdad;
- hashPrefix seguro para DTO;
- payload completo no se expone.
```

---

## 8.9. `ProviderTransactionId`

Debe probar:

```text id="not9xb"
- acepta ID válido;
- rechaza vacío si provider lo requiere;
- normaliza espacios;
- se usa para idempotencia;
- no puede mapear a dos Payments activos.
```

---

## 8.10. `CardLast4`

Debe probar:

```text id="ft9ts4"
- acepta 4 dígitos;
- rechaza más de 4 caracteres;
- rechaza PAN completo;
- rechaza letras;
- permite null;
- no se usa como label de métrica.
```

---

# 9. Unit tests — Entidades de dominio

## 9.1. `PaymentProviderDefinition`

Debe probar:

```text id="w15ky2"
- creación en estado draft;
- draft -> active;
- active -> inactive;
- inactive -> active;
- active -> deprecated;
- deprecated -> inactive;
- active -> archived;
- inactive -> archived;
- deprecated -> archived;
- draft -> archived;
- rechaza archived -> active;
- requiere providerKey;
- requiere displayName;
- requiere supportedEnvironments;
- requiere supportedCurrencies;
- requiere supportedPaymentMethods;
- no guarda secretos;
- no guarda datos de tarjeta.
```

---

## 9.2. `TenantPaymentProviderConfig`

Debe probar:

```text id="hp4ghh"
- creación en estado draft;
- draft -> enabled si configuración válida;
- draft -> disabled;
- enabled -> disabled;
- disabled -> enabled;
- enabled -> invalid;
- invalid -> disabled;
- invalid -> enabled si test exitoso;
- enabled -> archived;
- disabled -> archived;
- invalid -> archived;
- archived no permite operación;
- enabled requiere SecretRefs mínimos;
- providerDefinition debe estar active;
- settlementBankAccountId debe ser tenant-scoped;
- no serializa secret values.
```

---

## 9.3. `PaymentIntent`

Debe probar:

```text id="arq3gr"
- creación en estado created;
- created -> checkoutCreated;
- checkoutCreated -> pendingProviderConfirmation;
- pendingProviderConfirmation -> succeeded;
- pendingProviderConfirmation -> failed;
- pendingProviderConfirmation -> cancelled;
- pendingProviderConfirmation -> expired;
- created -> cancelled;
- checkoutCreated -> cancelled;
- created -> expired;
- checkoutCreated -> expired;
- succeeded -> reversed futuro/controlado;
- failed -> archived;
- cancelled -> archived;
- expired -> archived;
- rechaza succeeded -> failed;
- rechaza cancelled -> succeeded;
- rechaza expired -> succeeded sin validación excepcional;
- requiere amount > 0;
- requiere currency USD;
- requiere al menos un item;
- no crea Payment por sí solo.
```

---

## 9.4. `PaymentIntentItem`

Debe probar:

```text id="wh35tc"
- itemType charge requiere chargeId;
- itemType accountBalance requiere propertyUnitId;
- itemType fine requiere fineId si integración activa;
- itemType reservation requiere reservationId si integración activa;
- amount > 0;
- currency USD;
- description sanitizada;
- no crea cargos nuevos;
- pertenece al mismo tenant del PaymentIntent.
```

---

## 9.5. `PaymentCheckoutSession`

Debe probar:

```text id="jgsbn5"
- creación en estado created;
- created -> opened;
- opened -> completed;
- opened -> failed;
- opened -> cancelled;
- created -> expired;
- opened -> expired;
- completed -> archived;
- failed -> archived;
- cancelled -> archived;
- expired -> archived;
- expiresAt obligatorio;
- checkoutUrl no se expone si expiró;
- checkoutUrl no se registra en logs.
```

---

## 9.6. `ProviderWebhookEvent`

Debe probar:

```text id="s46rej"
- creación received;
- received -> processing;
- processing -> processed;
- received -> rejected;
- received -> duplicate;
- processing -> failed;
- failed -> processing por reproceso autorizado;
- processed -> archived;
- rejected -> archived;
- duplicate -> archived;
- signatureStatus verified requerido para efectos financieros;
- payloadHash obligatorio;
- payloadPreview sanitizado;
- raw payload no se guarda;
- raw signature no se guarda.
```

---

## 9.7. `ProviderTransaction`

Debe probar:

```text id="s8anuy"
- creación pending;
- authorized -> captured;
- captured -> succeeded;
- pending -> succeeded;
- pending -> failed;
- pending -> cancelled;
- pending -> expired;
- refunded -> requiresReview interno;
- chargeback -> requiresReview interno;
- amount mismatch -> requiresReview;
- currency mismatch -> requiresReview;
- amount > 0;
- currency USD;
- no PAN;
- no CVV;
- cardLast4 máximo 4 caracteres.
```

---

## 9.8. `ProviderPaymentMapping`

Debe probar:

```text id="qnkvoi"
- creación active;
- active -> reversed;
- active -> failed;
- active -> archived;
- reversed -> archived;
- failed -> archived;
- reverse requiere reason;
- una ProviderTransaction no tiene dos mappings activos;
- un Payment no tiene dos mappings activos de proveedor;
- reverso no elimina Payment;
- reverso no elimina ProviderTransaction.
```

---

## 9.9. `ProviderSettlementRecord`

Debe probar:

```text id="xj1jfo"
- creación pending;
- pending -> settled;
- pending -> failed;
- settled -> reversed si provider lo reporta;
- unknown permitido;
- grossAmount >= 0;
- feeAmount >= 0;
- netAmount >= 0;
- bankAccountId tenant-scoped;
- bankTransactionId tenant-scoped;
- settlement no marca conciliación bancaria final.
```

---

# 10. Adapter tests

## 10.1. `PaymentProviderAdapterRegistry`

Debe probar:

```text id="u41g3h"
- registra adapter mock;
- registra adapter sandbox;
- retorna adapter por providerKey;
- rechaza providerKey no soportado;
- no retorna adapter archived/deprecated si policy lo bloquea;
- lista proveedores soportados sin secretos.
```

---

## 10.2. `MockPaymentProviderAdapter`

Debe probar:

```text id="f88603"
- createCheckoutSession retorna providerSessionId;
- createCheckoutSession retorna checkoutUrl temporal;
- verifyWebhook con firma válida retorna verified;
- verifyWebhook con firma inválida retorna invalid;
- parseWebhookEvent payment.succeeded;
- parseWebhookEvent payment.failed;
- parseWebhookEvent payment.cancelled;
- retrieveTransaction retorna snapshot sintético;
- testConnection retorna ok;
- no genera datos reales de tarjeta.
```

---

## 10.3. `SandboxPaymentProviderAdapter`

Debe probar:

```text id="j1zsd7"
- usa environment sandbox;
- no ejecuta cargo real;
- no usa credenciales reales;
- respeta timeout;
- maneja provider unavailable;
- transforma errores externos a errores internos;
- no loggea payload completo.
```

---

## 10.4. `GenericHostedCheckoutProviderAdapter`

Debe probar:

```text id="jfnv26"
- requiere hosted checkout;
- crea sesión externa;
- respeta returnUrl/cancelUrl permitidas;
- no captura tarjeta en RESIDENT;
- no persiste datos sensibles;
- maneja error de proveedor;
- maneja respuesta sin checkoutUrl;
- maneja respuesta sin providerSessionId si provider lo permite.
```

---

# 11. Secret management tests

## 11.1. `PaymentProviderSecretPort`

Debe probar:

```text id="z2y6gu"
- storeCredential retorna SecretRef;
- updateCredential retorna nuevo SecretRef;
- getCredential solo en servicio interno autorizado;
- rotateCredential funciona;
- deleteCredential no expone valor;
- errores no muestran secreto;
- logs no muestran secreto;
- audit no muestra secreto.
```

---

## 11.2. Secret input

Debe probar:

```text id="g83z8v"
- mode secretRef guarda referencia;
- mode secretValue almacena valor en secret manager y guarda SecretRef;
- secretValue no se persiste en PostgreSQL;
- secretValue no aparece en DTO;
- secretValue no aparece en logs;
- secretValue no aparece en auditoría;
- secretValue no aparece en OpenAPI examples.
```

---

# 12. Amount calculation tests

## 12.1. Cargos específicos

Debe probar:

```text id="x79rqi"
- suma cargos pendientes;
- suma cargos parcialmente pagados por saldo pendiente;
- excluye cargos pagados;
- rechaza cargos cancelled;
- rechaza cargos reversed;
- rechaza cargos archived;
- rechaza cargos tenant B;
- rechaza cargos de unidad no autorizada;
- amount se calcula en servidor;
- amount del cliente se ignora o rechaza.
```

---

## 12.2. Saldo total

Debe probar:

```text id="so5elz"
- obtiene saldo desde Account Statements;
- saldo > 0 crea intent;
- saldo 0 rechaza intent;
- propertyUnit debe pertenecer al tenant;
- usuario /me debe estar autorizado sobre propertyUnit;
- amount coincide con saldo calculado;
- Account Statements no se recalcula desde ProviderTransaction.
```

---

## 12.3. Multa

Debe probar:

```text id="y6g4lj"
- fineId tenant-scoped;
- fine genera o referencia cargo pagable;
- amount se calcula desde cargo asociado;
- fine tenant B rechazada;
- fine no activa rechazada si policy aplica.
```

---

## 12.4. Reserva

Debe probar:

```text id="urq9yj"
- reservationId tenant-scoped;
- reservation genera o referencia cargo pagable;
- amount se calcula desde cargo asociado;
- reservation tenant B rechazada;
- reservation cancelada rechazada si policy aplica.
```

---

## 12.5. Manual item administrativo

Debe probar:

```text id="ij5vm9"
- solo admin autorizado puede crear manualItem;
- manualItem requiere description;
- manualItem requiere amount si policy administrativa lo permite;
- manualItem no permitido desde /me;
- manualItem audita operación reforzada.
```

---

# 13. Repository tests

## 13.1. `PaymentProviderDefinitionRepository`

```text id="kp3sj8"
- create provider definition;
- find by id;
- find by providerKey;
- list paginated;
- update;
- activate;
- deactivate/inactivate;
- deprecate;
- archive;
- providerKey unique;
- no secret fields.
```

---

## 13.2. `TenantPaymentProviderConfigRepository`

```text id="l8kpwr"
- create config;
- findByIdAndTenant;
- listByTenant;
- update;
- enable;
- disable;
- markInvalid;
- archive;
- find enabled by providerKey/environment;
- unique enabled provider per tenant/provider/environment;
- tenant A no ve config tenant B.
```

---

## 13.3. `PaymentIntentRepository`

```text id="qye5wb"
- create intent;
- create items transactionally;
- findByIdAndTenant;
- listByTenant;
- listOwn by person/propertyUnit;
- update status;
- set checkoutCreated;
- set pendingProviderConfirmation;
- set succeeded;
- set failed;
- cancel;
- expire;
- archive;
- unique idempotencyKey by tenant;
- tenant A no ve intent tenant B.
```

---

## 13.4. `PaymentIntentItemRepository`

```text id="p5y949"
- create item;
- bulk create items;
- list by paymentIntent;
- list by chargeId;
- list by propertyUnitId;
- tenant A no ve items tenant B;
- item amount > 0.
```

---

## 13.5. `PaymentCheckoutSessionRepository`

```text id="ccsfnf"
- create checkout session;
- findByIdAndTenant;
- listByPaymentIntent;
- update status;
- mark opened;
- mark completed;
- mark failed;
- mark cancelled;
- mark expired;
- archive;
- unique providerSessionId by tenant/provider;
- tenant A no ve checkout tenant B.
```

---

## 13.6. `ProviderWebhookEventRepository`

```text id="hynzxt"
- create received event;
- find by providerEventId;
- find by payloadHash;
- update signatureStatus;
- mark processing;
- mark processed;
- mark failed;
- mark rejected;
- mark duplicate;
- increment retryCount;
- archive;
- unique providerEventId by tenant/provider;
- tenant A no ve webhook tenant B.
```

---

## 13.7. `ProviderTransactionRepository`

```text id="xkr1ru"
- create provider transaction;
- findByIdAndTenant;
- find by providerTransactionId;
- listByTenant;
- update providerStatus;
- update internalStatus;
- mark succeeded;
- mark failed;
- mark requiresReview;
- archive;
- unique providerTransactionId by tenant/provider;
- tenant A no ve transaction tenant B.
```

---

## 13.8. `ProviderPaymentMappingRepository`

```text id="laa4ie"
- create mapping;
- findByIdAndTenant;
- find active mapping by providerTransaction;
- find active mapping by payment;
- listByTenant;
- reverse;
- archive;
- unique active mapping per providerTransaction;
- unique active mapping per Payment;
- tenant A no ve mapping tenant B.
```

---

## 13.9. `ProviderSettlementRepository`

```text id="ev7kf6"
- create settlement;
- findByIdAndTenant;
- find by providerSettlementId;
- listByTenant;
- mark settled;
- mark failed;
- link to bankTransaction;
- archive;
- tenant A no ve settlement tenant B;
- bankTransaction tenant B rechazado por servicio.
```

---

# 14. Service tests

## 14.1. `PaymentProviderDefinitionService`

```text id="t66d80"
- crea definición;
- activa definición;
- desactiva/inactiva definición;
- depreca definición;
- archiva definición;
- rechaza providerKey duplicado;
- rechaza metadata con secretos;
- audita eventos.
```

---

## 14.2. `TenantPaymentProviderConfigService`

```text id="ypenbn"
- crea config tenant;
- valida providerDefinition active;
- guarda SecretRefs;
- transforma secretValue a SecretRef;
- no devuelve secretos;
- habilita config válida;
- rechaza habilitar sin SecretRefs;
- deshabilita config;
- prueba conexión;
- marca invalid si conexión falla;
- archiva config;
- valida settlementBankAccount tenant-scoped;
- audita eventos.
```

---

## 14.3. `PaymentIntentService`

```text id="cjo20b"
- crea PaymentIntent para cargos;
- crea PaymentIntent para saldo total;
- crea PaymentIntent para multa;
- crea PaymentIntent para reserva;
- rechaza provider disabled;
- rechaza provider archived;
- rechaza charge tenant B;
- rechaza propertyUnit tenant B;
- calcula amount server-side;
- crea items;
- aplica idempotencyKey;
- cancela intent;
- expira intent;
- audita paymentIntent.created/cancelled/expired.
```

---

## 14.4. `OwnPaymentIntentService`

```text id="lxzvi8"
- resuelve UserProfile -> Person;
- resuelve unidades propias;
- permite pagar cargos propios;
- permite pagar saldo propio;
- rechaza unidad ajena;
- rechaza cargo de unidad ajena;
- rechaza usuario sin persona vinculada;
- rechaza usuario sin membership;
- no expone metadata administrativa;
- no expone secret refs;
- audita operación.
```

---

## 14.5. `PaymentCheckoutSessionService`

```text id="kkptyi"
- crea checkout para intent created;
- crea checkout para intent checkoutCreated si policy permite regenerar;
- rechaza intent succeeded;
- rechaza intent failed;
- rechaza intent cancelled;
- rechaza intent expired;
- rechaza provider disabled;
- invoca adapter correcto;
- persiste session;
- actualiza PaymentIntent;
- devuelve checkoutUrl temporal;
- no loggea checkoutUrl;
- audita checkoutSession.created.
```

---

## 14.6. `WebhookSignatureVerificationService`

```text id="ubxhvi"
- verifica firma válida;
- rechaza firma ausente;
- rechaza firma inválida;
- rechaza timestamp expirado;
- acepta timestamp dentro de tolerancia;
- calcula signatureHeaderHash;
- no loggea firma completa;
- no expone secreto.
```

---

## 14.7. `WebhookProcessingService`

```text id="exb49t"
- registra ProviderWebhookEvent received;
- marca verified;
- detecta duplicate;
- marca processing;
- parsea evento;
- crea ProviderTransaction;
- mapea estado provider;
- procesa succeeded;
- procesa failed;
- procesa cancelled;
- procesa refunded como requiresReview;
- procesa chargeback como requiresReview;
- marca processed;
- marca failed si falla;
- no crea Payment sin firma verified;
- audita eventos.
```

---

## 14.8. `PaymentCreationFromProviderService`

```text id="ffs6h3"
- crea Payment con providerStatus succeeded;
- crea Payment con providerStatus captured;
- no crea Payment con failed;
- no crea Payment con cancelled;
- no crea Payment con expired;
- no crea Payment con unknown;
- no crea Payment con amount mismatch;
- no crea Payment con currency mismatch;
- no crea Payment si PaymentIntent no existe;
- no crea Payment si PaymentIntent tenant B;
- no duplica Payment con providerTransactionId repetido;
- usa PaymentsIntegrationPort;
- crea ProviderPaymentMapping;
- actualiza PaymentIntent succeeded;
- audita payment.createdFromProvider.
```

---

## 14.9. `ProviderTransactionService`

```text id="asyk2f"
- crea transaction;
- evita providerTransactionId duplicado;
- marca succeeded;
- marca failed;
- marca requiresReview;
- archiva transaction;
- no guarda PAN;
- no guarda CVV;
- no guarda raw payload;
- audita cambios relevantes.
```

---

## 14.10. `ProviderPaymentMappingService`

```text id="kymall"
- crea mapping active;
- evita dos mappings activos para misma transaction;
- evita dos mappings activos para mismo Payment;
- reversa mapping con reason;
- no elimina Payment;
- no elimina ProviderTransaction;
- audita providerPaymentMapping.reversed.
```

---

## 14.11. `ProviderSettlementService`

```text id="a82sik"
- registra settlement pending;
- registra settlement settled;
- registra feeAmount/netAmount;
- vincula settlement con bankAccount tenant-scoped;
- vincula settlement con bankTransaction tenant-scoped;
- rechaza bankTransaction tenant B;
- no marca conciliación bancaria final;
- audita providerSettlement.linkedToBankTransaction.
```

---

## 14.12. `PaymentProviderReportService`

```text id="hf4ovj"
- genera summary report;
- genera transactions report;
- genera failures report;
- genera settlements report;
- exporta CSV;
- exporta XLSX;
- exporta PDF si está habilitado;
- persiste export en Secure Document Storage si aplica;
- no expone secretos;
- no expone raw payloads;
- no expone checkoutUrl;
- no expone datos de tarjeta.
```

---

# 15. Integration tests

## 15.1. Integración con `005-payments`

Debe probar:

```text id="yi5txu"
- createPaymentFromProvider crea Payment interno;
- paymentSource=provider;
- providerKey se guarda;
- providerTransactionId se guarda;
- providerReference se guarda;
- providerVerifiedAt se guarda;
- PaymentAllocation se crea si items son charges;
- pago de saldo total sigue reglas de Payments;
- no se crea Payment duplicado;
- Payment rejected/cancelled/reversed existente no se reutiliza indebidamente;
- reverso de mapping no elimina Payment;
- regresión de pagos manuales sigue funcionando.
```

---

## 15.2. Integración con `006-account-statements`

Debe probar:

```text id="et6r8t"
- Payment creado desde provider aparece en estado de cuenta;
- saldo se reduce por Payment interno;
- ProviderTransaction no modifica saldo directamente;
- PaymentIntent failed no modifica estado de cuenta;
- webhook duplicado no duplica saldo;
- payment allocation impacta statement correctamente.
```

---

## 15.3. Integración con `004-dues-fees`

Debe probar:

```text id="ny5f8d"
- charge pending es pagable;
- charge partiallyPaid calcula saldo pendiente;
- charge paid no pagable;
- charge cancelled no pagable;
- charge reversed no pagable;
- charge archived no pagable;
- charge tenant B no accesible;
- amount calculado coincide con cargos.
```

---

## 15.4. Integración con `003-residents-properties`

Debe probar:

```text id="tkw40u"
- /me resuelve persona vinculada;
- /me resuelve unidades propias;
- propietario puede pagar su unidad;
- residente autorizado puede pagar si policy lo permite;
- usuario sin relación no puede pagar;
- usuario no puede pagar unidad ajena;
- usuario no puede ver PaymentIntents ajenos.
```

---

## 15.5. Integración con `016-secure-document-storage`

Debe probar:

```text id="l8fo42"
- comprobante provider se almacena si aplica;
- export report se almacena si aplica;
- sourceModule=paymentProviderIntegration;
- visibility owners para comprobante propio si aplica;
- visibility administrative para reporte;
- sensitivity confidential/restricted;
- no storageKey en response;
- descarga requiere permiso;
- /me solo ve documentos propios permitidos.
```

---

## 15.6. Integración con `017-bank-reconciliation`

Debe probar:

```text id="y9knpb"
- Payment provider-verified queda disponible para conciliación;
- ProviderSettlementRecord puede vincular BankTransaction;
- bankTransaction tenant B rechazado;
- settlement no marca Payment como bank-reconciled;
- Bank Reconciliation conserva validación final;
- reportes no mezclan provider settlement con conciliación final.
```

---

## 15.7. Integración con `012-communications-notifications`

Debe probar:

```text id="l4ypob"
- notifica payment succeeded si policy activa;
- notifica payment failed si policy activa;
- notifica requiresReview a administradores si policy activa;
- no envía secretos;
- no envía raw payload;
- no envía PAN/CVV;
- no envía checkoutUrl por canal inseguro salvo política explícita.
```

---

## 15.8. Integración con `007-audit`

Debe probar:

```text id="pydv4c"
- audita provider definition;
- audita tenant provider config;
- audita PaymentIntent;
- audita CheckoutSession;
- audita Webhook received/verified/rejected/processed;
- audita ProviderTransaction;
- audita Payment createdFromProvider;
- audita ProviderPaymentMapping;
- audita Settlement;
- audit no contiene secretos;
- audit no contiene raw payload;
- audit no contiene checkoutUrl;
- audit no contiene datos de tarjeta.
```

---

# 16. API tests

## 16.1. Platform provider definitions

```text id="yohlyx"
GET /platform/payment-provider-definitions lista definitions;
POST crea definition;
POST rechaza providerKey duplicado;
POST rechaza secretos;
GET /platform/payment-provider-definitions/{id} obtiene definition;
PATCH actualiza definition;
POST /activate activa definition;
POST /deprecate depreca definition;
POST /archive archiva definition;
sin permiso retorna 403.
```

---

## 16.2. Tenant payment providers

```text id="g31xbx"
GET /tenant/payment-providers lista configs tenant;
POST crea config;
POST rechaza tenantId;
POST rechaza bankAccount tenant B;
POST transforma secretValue en SecretRef;
POST no devuelve secret values;
GET /tenant/payment-providers/{id} obtiene config;
PATCH actualiza config;
POST /enable habilita config válida;
POST /enable rechaza config sin secretos;
POST /disable deshabilita config;
POST /test-connection prueba conexión;
POST /archive archiva config;
tenant A no accede config tenant B.
```

---

## 16.3. Tenant payment intents

```text id="s8wy9t"
GET /tenant/payment-intents lista intents;
POST crea intent para cargos;
POST crea intent para saldo total;
POST rechaza provider disabled;
POST rechaza charge tenant B;
POST rechaza propertyUnit tenant B;
POST rechaza items vacíos;
POST rechaza amount arbitrario;
GET /tenant/payment-intents/{id} obtiene intent;
POST /checkout-sessions crea checkout;
POST /checkout-sessions devuelve checkoutUrl temporal;
POST /checkout-sessions rechaza intent expired;
POST /cancel cancela intent;
POST /expire expira intent;
tenant A no accede intent tenant B.
```

---

## 16.4. Own payment intents

```text id="i5qrz2"
GET /me/payment-intents lista propios;
POST /me/payment-intents crea intent propio;
POST rechaza unidad ajena;
POST rechaza charge de unidad ajena;
POST rechaza usuario sin persona vinculada;
GET /me/payment-intents/{id} obtiene propio;
GET rechaza intent ajeno;
POST /checkout-sessions crea checkout propio;
POST /cancel cancela propio;
response own no expone admin metadata;
response own no expone secret refs;
response own no expone webhook data.
```

---

## 16.5. Webhook endpoint

```text id="gydnf2"
POST /webhooks/payment-providers/{providerKey} acepta firma válida;
POST rechaza firma ausente;
POST rechaza firma inválida;
POST rechaza timestamp expirado;
POST rechaza providerKey no soportado;
POST detecta duplicate providerEventId;
POST detecta duplicate providerTransactionId;
POST succeeded crea ProviderTransaction;
POST succeeded crea Payment;
POST failed no crea Payment;
POST amount mismatch no crea Payment;
POST currency mismatch no crea Payment;
POST refund queda requiresReview;
POST chargeback queda requiresReview;
response no revela detalles internos.
```

---

## 16.6. Webhook events admin

```text id="e2mu7c"
GET /tenant/payment-provider-webhook-events lista eventos;
GET filtros funcionan;
GET /{id} obtiene evento sanitizado;
GET no expone raw payload;
GET no expone raw signature;
POST /reprocess reprocesa failed;
POST /reprocess rechaza rejected invalid signature;
POST /reprocess rechaza duplicate;
POST /archive archiva evento;
tenant A no accede evento tenant B.
```

---

## 16.7. Provider transactions

```text id="qhr6wz"
GET /tenant/provider-transactions lista transactions;
GET filtros funcionan;
GET /{id} obtiene transaction;
GET no expone PAN/CVV;
POST /mark-review-required marca requiresReview;
POST /archive archiva transaction;
tenant A no accede transaction tenant B.
```

---

## 16.8. Provider payment mappings

```text id="fe0wy1"
GET /tenant/provider-payment-mappings lista mappings;
GET /{id} obtiene mapping;
POST /reverse reversa mapping con reason;
POST /reverse rechaza sin reason;
POST /reverse no elimina Payment;
tenant A no accede mapping tenant B.
```

---

## 16.9. Provider settlements

```text id="l8ja33"
GET /tenant/provider-settlements lista settlements;
GET /{id} obtiene settlement;
POST /link-bank-transaction vincula movimiento;
POST rechaza bankTransaction tenant B;
POST no marca conciliación bancaria final;
POST /archive archiva settlement;
tenant A no accede settlement tenant B.
```

---

## 16.10. Reports

```text id="i4k54x"
GET /payment-provider-reports/summary retorna resumen;
GET /transactions retorna transacciones;
GET /failures retorna fallos;
GET /settlements retorna settlements;
GET /export genera export;
export usa Secure Document Storage si persiste;
reportes no exponen secretos;
reportes no exponen raw payload;
reportes no exponen checkoutUrl;
reportes no exponen datos de tarjeta.
```

---

# 17. Authorization tests

## 17.1. Autenticación

```text id="lywrmg"
- sin token en platform/tenant/me retorna 401;
- token inválido retorna 401;
- usuario disabled retorna 403;
- sin membership retorna 403;
- tenant suspended retorna 403;
- tenant archived retorna 403;
- webhook no requiere Bearer token pero sí firma.
```

---

## 17.2. Platform permissions

```text id="dc78zq"
- sin paymentProviderDefinitions.read no lista;
- sin paymentProviderDefinitions.create no crea;
- sin paymentProviderDefinitions.update no actualiza;
- sin paymentProviderDefinitions.activate no activa;
- sin paymentProviderDefinitions.deprecate no depreca;
- sin paymentProviderDefinitions.archive no archiva.
```

---

## 17.3. Tenant provider permissions

```text id="rtxxxy"
- sin tenantPaymentProviders.read no lista;
- sin tenantPaymentProviders.create no crea;
- sin tenantPaymentProviders.update no actualiza;
- sin tenantPaymentProviders.enable no habilita;
- sin tenantPaymentProviders.disable no deshabilita;
- sin tenantPaymentProviders.testConnection no prueba conexión;
- sin tenantPaymentProviders.archive no archiva.
```

---

## 17.4. PaymentIntent permissions

```text id="njcp6b"
- sin paymentIntents.read no lista admin;
- sin paymentIntents.create no crea admin;
- sin paymentIntents.cancel no cancela admin;
- sin paymentIntents.expire no expira;
- sin paymentIntents.read.own no lista propios;
- sin paymentIntents.create.own no crea propio;
- sin paymentIntents.cancel.own no cancela propio.
```

---

## 17.5. Checkout permissions

```text id="kx039x"
- sin paymentCheckoutSessions.create no crea checkout admin;
- sin paymentCheckoutSessions.create.own no crea checkout propio;
- sin ownership no crea checkout propio;
- checkoutUrl se devuelve solo si autorizado.
```

---

## 17.6. Webhook admin permissions

```text id="uy4473"
- sin paymentProviderWebhooks.read no consulta eventos;
- sin paymentProviderWebhooks.reprocess no reprocesa;
- sin paymentProviderWebhooks.archive no archiva.
```

---

## 17.7. Provider transactions permissions

```text id="d4qjs4"
- sin providerTransactions.read no consulta;
- sin providerTransactions.review no marca revisión;
- sin providerTransactions.archive no archiva.
```

---

## 17.8. Mappings and settlements permissions

```text id="ka8itc"
- sin providerPaymentMappings.read no consulta mappings;
- sin providerPaymentMappings.reverse no reversa mapping;
- sin providerSettlements.read no consulta settlements;
- sin providerSettlements.linkToBankTransaction no vincula bank transaction;
- sin providerSettlements.archive no archiva settlement.
```

---

## 17.9. PlatformAdmin

Debe probar:

```text id="e5w45r"
- PlatformAdmin administra provider definitions;
- PlatformAdmin no accede automáticamente a intents tenant;
- PlatformAdmin no accede automáticamente a transactions tenant;
- PlatformAdmin no accede automáticamente a provider configs tenant;
- acceso excepcional requiere permiso explícito y auditoría.
```

---

# 18. Multitenancy tests

## 18.1. Entidades tenant-scoped

```text id="rf0jhu"
tenant A no ve tenantPaymentProviderConfig tenant B;
tenant A no ve paymentIntent tenant B;
tenant A no ve paymentIntentItem tenant B;
tenant A no ve checkoutSession tenant B;
tenant A no ve providerWebhookEvent tenant B;
tenant A no ve providerTransaction tenant B;
tenant A no ve providerPaymentMapping tenant B;
tenant A no ve providerSettlementRecord tenant B.
```

---

## 18.2. Referencias cruzadas

```text id="lfsggz"
tenant A no usa tenantProviderConfigId tenant B;
tenant A no usa paymentIntentId tenant B;
tenant A no usa checkoutSessionId tenant B;
tenant A no usa webhookEventId tenant B;
tenant A no usa providerTransactionId tenant B;
tenant A no usa mappingId tenant B;
tenant A no usa settlementId tenant B;
tenant A no usa personId tenant B;
tenant A no usa propertyUnitId tenant B;
tenant A no usa chargeId tenant B;
tenant A no usa paymentId tenant B;
tenant A no usa bankAccountId tenant B;
tenant A no usa bankTransactionId tenant B;
tenant A no usa secureDocumentId tenant B.
```

---

## 18.3. Webhook tenant resolution

```text id="zezi3a"
- webhook providerKey tenant A no procesa intent tenant B;
- webhook con paymentIntentId tenant B y config tenant A se rechaza;
- webhook con providerTransactionId existente tenant B no afecta tenant A;
- webhook no resuelto no crea Payment;
- evento técnico no resuelto no revela información.
```

---

## 18.4. Reports cross-tenant

```text id="dtlvv9"
- summary report solo tenant A;
- transactions report no incluye tenant B;
- failures report no incluye tenant B;
- settlements report no incluye tenant B;
- export no incluye tenant B.
```

---

# 19. Financial integrity tests

## 19.1. Decimal

```text id="nfx734"
- todos los montos se reciben/retornan como string decimal;
- services usan Decimal;
- 0.10 + 0.20 = 0.30 exacto;
- amount total coincide con suma de items;
- provider amount se compara exactamente;
- no float/double en dominio financiero.
```

---

## 19.2. PaymentIntent amount

```text id="y8yecz"
- amount calculado desde charges;
- amount calculado desde account balance;
- amount no se toma del cliente;
- amount mismatch del cliente no afecta resultado;
- amount cero rechaza intent;
- amount negativo rechaza intent.
```

---

## 19.3. Provider succeeded

```text id="ui0fjz"
- succeeded verified crea ProviderTransaction;
- succeeded verified crea Payment;
- succeeded verified crea Mapping;
- PaymentIntent pasa a succeeded;
- Account Statement refleja Payment;
- audit emitido.
```

---

## 19.4. Provider failed

```text id="v90533"
- failed verified crea/actualiza ProviderTransaction;
- failed no crea Payment;
- PaymentIntent pasa a failed si aplica;
- Account Statement no cambia;
- audit emitido.
```

---

## 19.5. Amount mismatch

```text id="mppfr5"
- provider amount menor que intent queda requiresReview;
- provider amount mayor que intent queda requiresReview;
- no crea Payment;
- no crea Mapping activo;
- audit registra mismatch sanitizado.
```

---

## 19.6. Currency mismatch

```text id="k4lhl2"
- provider currency distinta a USD queda requiresReview/rejected;
- no crea Payment;
- no crea Mapping;
- audit registra currency mismatch.
```

---

## 19.7. Duplicate event

```text id="u0bf29"
- mismo providerEventId no crea segundo Payment;
- mismo providerTransactionId no crea segundo Payment;
- mismo payloadHash en ventana de replay se detecta;
- response puede ser 200 idempotente;
- audit registra duplicate.
```

---

## 19.8. Refunds y chargebacks MVP

```text id="srpeg0"
- refund event no ejecuta refund automático;
- partial refund no ejecuta refund automático;
- chargeback no ejecuta reverso automático;
- ProviderTransaction pasa a requiresReview;
- Payment no se elimina;
- Account Statement no cambia automáticamente;
- audit reforzada.
```

---

# 20. Webhook security tests

## 20.1. Firma

```text id="ax26ys"
- firma válida aceptada;
- firma ausente rechazada;
- firma inválida rechazada;
- firma con secreto incorrecto rechazada;
- firma de tenant B no valida tenant A;
- raw body alterado invalida firma;
- firma completa no aparece en logs;
- webhookSecret no aparece en logs.
```

---

## 20.2. Timestamp

```text id="khf0cl"
- timestamp dentro de tolerancia aceptado;
- timestamp vencido rechazado;
- timestamp futuro excesivo rechazado;
- timestamp ausente rechazado si provider lo requiere;
- tolerancia configurable.
```

---

## 20.3. Replay

```text id="bmcxpk"
- mismo eventId repetido detecta duplicate;
- mismo transactionId repetido detecta duplicate;
- mismo payloadHash repetido en ventana detecta replay;
- duplicate no crea Payment;
- duplicate no crea Mapping adicional;
- duplicate responde seguro.
```

---

## 20.4. Payload

```text id="y5xqoj"
- payload válido parsea;
- payload inválido rechaza;
- payload oversized rechaza;
- payload con card data sensible se sanitiza/rechaza;
- payloadPreview truncado;
- raw payload no persiste;
- payloadHash se persiste.
```

---

# 21. Checkout tests

## 21.1. Creación

```text id="owb6qn"
- checkout creado para intent created;
- checkout actualiza intent checkoutCreated;
- checkout devuelve URL temporal;
- checkout setea expiresAt;
- checkout persiste providerSessionId;
- checkout audita.
```

---

## 21.2. Estados inválidos

```text id="vxjxmc"
- intent succeeded rechaza checkout;
- intent failed rechaza checkout;
- intent cancelled rechaza checkout;
- intent expired rechaza checkout;
- intent archived rechaza checkout;
- provider disabled rechaza checkout;
- provider invalid rechaza checkout.
```

---

## 21.3. Seguridad

```text id="yc7g1e"
- checkoutUrl no aparece en listados;
- checkoutUrl no aparece en logs;
- checkoutUrl no aparece en auditoría;
- checkoutUrl expirada no se devuelve;
- checkoutUrl solo se devuelve a actor autorizado;
- returnUrl/cancelUrl no confirman pago.
```

---

# 22. Own-resource tests

Debe probar:

```text id="lfktuw"
- ownerA ve sus PaymentIntents;
- ownerA no ve PaymentIntents de ownerB;
- residentA ve si policy lo permite;
- userWithoutPerson no puede crear own intent;
- userWithoutUnit no puede pagar saldo de unidad;
- user A no paga unit B;
- user A no paga charge B;
- response own minimiza datos;
- response own no expone provider config interna;
- response own no expone webhook data.
```

---

# 23. Reports tests

## 23.1. Summary

```text id="toptq5"
- calcula paymentIntentsCreated;
- calcula paymentIntentsSucceeded;
- calcula paymentIntentsFailed;
- calcula paymentIntentsCancelled;
- calcula grossAmount;
- calcula feeAmount;
- calcula netAmount;
- calcula paymentsCreated;
- calcula webhooksReceived;
- calcula webhooksRejected;
- calcula requiresReviewCount;
- filtra por providerKey;
- filtra por environment;
- filtra por periodo;
- solo tenant actual.
```

---

## 23.2. Transactions report

```text id="w2ppgq"
- lista succeeded;
- lista failed;
- lista requiresReview;
- filtra por providerStatus;
- filtra por internalStatus;
- filtra por paymentMethodType;
- no expone raw payload;
- no expone PAN/CVV;
- no expone checkoutUrl;
```

---

## 23.3. Failures report

```text id="fpx701"
- lista webhook failed;
- lista amount mismatch;
- lista currency mismatch;
- lista signature rejected sin detalle sensible;
- muestra retryCount;
- filtra por errorCode;
- filtra por periodo.
```

---

## 23.4. Settlements report

```text id="w02gel"
- lista pending;
- lista settled;
- lista failed;
- lista linked;
- filtra por bankAccountId;
- filtra por settlementDate;
- no marca conciliación final.
```

---

## 23.5. Export

```text id="h2bfkk"
- export summary CSV;
- export transactions XLSX;
- export failures CSV;
- export settlements XLSX;
- export PDF si habilitado;
- persiste en Secure Document Storage si aplica;
- no expone storageKey;
- no incluye secretos;
- no incluye raw payloads;
- no incluye checkoutUrl;
- audita export.
```

---

# 24. Security tests

## 24.1. Datos prohibidos en responses, logs y audit

Debe verificar ausencia de:

```text id="xfge99"
PAN
CVV
track data
PIN
rawCardData
fullCardToken
fullAuthorizationPayload
provider secret
webhook secret
credentialSecret value
webhookSecret value
raw webhook payload
raw signature
checkoutUrl en logs/audit/listados
storageKey
signedUrl persistente
tokens
cookies
Authorization header
SQL raw
stack trace en producción
```

---

## 24.2. Body prohibido

Debe rechazar:

```text id="aptb20"
tenantId
createdBy
updatedBy
enabledBy
disabledBy
processedBy
confirmedBy
paymentId manual en webhook
providerPaymentMappingId manual
providerTransactionId manual en PaymentIntent
providerEventId manual en PaymentIntent
amount como fuente de verdad para cargos/saldos
credentialSecret value en metadata
webhookSecret value en metadata
checkoutUrl manual
status directo salvo transición controlada
storageKey
cardNumber
PAN
CVV
trackData
```

---

## 24.3. Endpoints públicos inexistentes

Debe devolver 404:

```text id="fbn8um"
GET  /api/v1/public/payment-providers
GET  /api/v1/public/payment-intents
POST /api/v1/public/payment-intents
GET  /api/v1/public/provider-transactions
GET  /api/v1/public/payment-provider-reports
GET  /api/v1/public/tenants/{slug}/payment-providers
POST /api/v1/public/tenants/{slug}/payment-intents
GET  /api/v1/public/tenants/{slug}/payment-provider-reports
```

---

## 24.4. No card data storage

Debe probar:

```text id="cj53ey"
- no hay columna PAN;
- no hay columna CVV;
- no hay metadata con PAN;
- no hay metadata con CVV;
- no hay logs con PAN;
- no hay audit con PAN;
- payload con cardNumber se rechaza o sanitiza;
- solo cardBrand/cardLast4 permitidos.
```

---

## 24.5. IA externa

Debe probar:

```text id="ew7z6b"
- paymentProviderIntegration.aiRiskScoring.enabled=false;
- no se invoca proveedor externo de IA con pagos reales;
- no se envían payloads de webhook a IA;
- no se envían transacciones reales a IA;
- tests usan fixtures sintéticos.
```

---

# 25. Audit tests

## 25.1. Eventos obligatorios

Debe validar auditoría para:

```text id="g6xrve"
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

## 25.2. Metadata permitida

```text id="fmkdj3"
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

## 25.3. Metadata prohibida

```text id="j46lwv"
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

# 26. Observability tests

## 26.1. Logs

Debe verificar:

```text id="qu9n7m"
- logs incluyen traceId;
- logs incluyen action;
- logs incluyen outcome;
- logs incluyen durationMs;
- logs incluyen errorCode cuando aplica;
- logs no incluyen checkoutUrl;
- logs no incluyen raw payload;
- logs no incluyen raw signature;
- logs no incluyen secretos;
- logs no incluyen PAN;
- logs no incluyen CVV;
- logs no incluyen stack trace en producción.
```

---

## 26.2. Métricas

Debe verificar:

```text id="jtvkkv"
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

## 26.3. Labels permitidos

```text id="aq5fqu"
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

## 26.4. Labels prohibidos

```text id="hb6pgf"
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

# 27. OpenAPI tests

Debe validar:

```text id="b2tn4r"
- OpenAPI compila;
- tags correctos;
- endpoints platform documentados;
- endpoints tenant documentados;
- endpoints own documentados;
- webhook endpoint documentado como webhook técnico;
- no endpoints públicos administrativos;
- todos los endpoints platform tienen x-platform-scope;
- todos los endpoints tenant tienen x-tenant-scope;
- todos los endpoints own tienen x-own-resource;
- webhook tiene x-provider-signature-required;
- webhook tiene x-idempotent-processing;
- checkout tiene x-hosted-checkout;
- checkout tiene x-checkout-url-temporary;
- todos los endpoints relevantes tienen x-card-data-stored=false;
- todos los endpoints relevantes tienen x-secrets-exposed=false;
- DTOs no contienen secret values;
- DTOs no contienen PAN/CVV;
- DTOs no contienen raw payload;
- DTOs no contienen raw signature;
- examples no contienen secretos reales.
```

---

# 28. Performance tests

## 28.1. Escenarios

```text id="uunitt"
- listar 10.000 paymentIntents paginados;
- listar 10.000 providerTransactions paginadas;
- listar 10.000 webhookEvents paginados;
- crear PaymentIntent con 1 cargo;
- crear PaymentIntent con 20 cargos;
- crear CheckoutSession mock;
- registrar webhook recibido;
- procesar webhook succeeded;
- procesar webhook duplicate;
- generar summary report mensual;
- exportar transactions report.
```

---

## 28.2. Objetivos

```text id="h1svhr"
p95 < 800 ms para crear PaymentIntent.
p95 < 1200 ms para crear CheckoutSession, excluyendo latencia del proveedor.
p95 < 1000 ms para registrar webhook recibido.
p95 < 3000 ms para procesar webhook exitoso y crear Payment.
p95 < 800 ms para consultar intents paginados.
p95 < 1200 ms para consultar transacciones paginadas.
```

---

## 28.3. Validaciones

```text id="e8obpx"
- paginación obligatoria;
- pageSize máximo 100;
- índices usados;
- no N+1 evidente;
- no logs con payload completo;
- no base64 en JSON;
- no procesamiento pesado sin timeout;
- posibilidad futura de mover procesamiento a jobs.
```

---

# 29. Concurrency tests

## 29.1. Crear PaymentIntent

```text id="n2jvgr"
- dos requests con misma Idempotency-Key;
- retorna mismo PaymentIntent;
- payload distinto con misma key retorna conflict;
- no duplica items;
- audit consistente.
```

---

## 29.2. Crear CheckoutSession

```text id="zrv9vm"
- dos requests simultáneos para mismo PaymentIntent;
- no crea sesiones activas inconsistentes;
- retorna misma sesión o crea nueva según policy explícita;
- no duplica providerSessionId;
- no expone checkoutUrl en logs.
```

---

## 29.3. Webhook duplicado

```text id="fqz5nl"
- dos webhooks iguales simultáneos;
- solo uno crea Payment;
- solo uno crea Mapping activo;
- providerEventId unique evita duplicado;
- providerTransactionId unique evita duplicado;
- segundo retorna idempotente o duplicate.
```

---

## 29.4. Webhook y cancelación simultánea

```text id="qohw8q"
- usuario cancela mientras llega webhook succeeded;
- si provider succeeded verificado llegó primero, Payment se crea;
- si cancelación llegó primero, webhook debe seguir policy explícita;
- no queda estado inconsistente;
- audit registra orden de eventos.
```

---

## 29.5. Payment creation partial failure

```text id="q8uujk"
- ProviderTransaction creada pero Payment falla;
- evento queda failed o requiresReview;
- no crea Mapping activo;
- reproceso puede completar operación;
- no duplica Payment al reprocesar.
```

---

## 29.6. Settlement link

```text id="a4ugtt"
- dos usuarios vinculan mismo settlement a bankTransaction;
- solo un vínculo efectivo;
- segundo retorna conflict;
- bankTransaction no queda doblemente asociado si policy lo bloquea.
```

---

# 30. Regression tests

Debe ejecutarse regresión sobre:

```text id="j7bojj"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-basic-reports
012-communications-notifications
016-secure-document-storage
017-bank-reconciliation
```

---

## 30.1. Payments regression

```text id="zlv0qn"
- pagos manuales siguen funcionando;
- validación manual sigue funcionando;
- allocations siguen funcionando;
- reversos existentes siguen funcionando;
- receipts siguen funcionando;
- nuevo paymentSource no rompe endpoints existentes;
- provider fields opcionales no rompen pagos previos.
```

---

## 30.2. Account Statements regression

```text id="c3ykwd"
- saldos se siguen derivando desde cargos/pagos;
- ProviderTransaction no altera balances;
- Payment provider sí altera balance por Payment interno;
- webhook duplicado no duplica balance.
```

---

## 30.3. Dues/Fees regression

```text id="m8jx0s"
- cargos se generan igual;
- cargos se consultan igual;
- cargos pagados no se vuelven pagables;
- cargos anulados/reversados no se pagan por provider.
```

---

## 30.4. Secure Document Storage regression

```text id="eup39j"
- documentos existentes siguen funcionando;
- sourceModule paymentProviderIntegration no rompe otros módulos;
- storageKey sigue oculto;
- downloads siguen auditados.
```

---

## 30.5. Bank Reconciliation regression

```text id="oo8lbx"
- pagos provider-verified se pueden listar como pagos conciliables;
- settlement link no marca conciliación final;
- matches bancarios existentes no se rompen;
- Payment reconciliationStatus mantiene consistencia.
```

---

# 31. Smoke tests

Flujo mínimo exitoso:

```text id="jyt0b6"
1. Crear PaymentProviderDefinition mock.
2. Activar PaymentProviderDefinition.
3. Crear TenantPaymentProviderConfig.
4. Configurar SecretRefs mock.
5. Probar conexión.
6. Habilitar provider config.
7. Crear cargos pendientes.
8. Crear PaymentIntent propio para cargos.
9. Crear CheckoutSession.
10. Recibir checkoutUrl temporal.
11. Enviar webhook mock firmado payment.succeeded.
12. Validar ProviderWebhookEvent processed.
13. Validar ProviderTransaction succeeded.
14. Validar Payment interno creado.
15. Validar ProviderPaymentMapping active.
16. Validar Account Statement actualizado.
17. Validar Payment disponible para Bank Reconciliation.
18. Consultar report summary.
19. Exportar reporte.
20. Verificar audit events.
21. Verificar logs sin secretos.
22. Verificar ausencia de endpoints públicos administrativos.
```

Flujo mínimo fallido:

```text id="yw66md"
1. Crear PaymentIntent.
2. Crear CheckoutSession.
3. Enviar webhook con firma inválida.
4. Verificar rechazo.
5. Verificar que no se creó Payment.
6. Verificar audit providerWebhook.rejected.
7. Verificar logs sin payload sensible.
```

Flujo idempotente:

```text id="j39t0t"
1. Enviar webhook succeeded válido.
2. Confirmar Payment creado.
3. Reenviar mismo webhook.
4. Confirmar que no se creó segundo Payment.
5. Confirmar response duplicate/idempotent.
```

---

# 32. Comandos sugeridos

## 32.1. Comandos específicos

```bash id="s7sqgk"
npm run test:payment-provider-integration
npm run test:payment-provider-integration:unit
npm run test:payment-provider-integration:domain
npm run test:payment-provider-integration:value-objects
npm run test:payment-provider-integration:state-machines
npm run test:payment-provider-integration:repositories
npm run test:payment-provider-integration:services
npm run test:payment-provider-integration:adapters
npm run test:payment-provider-integration:secrets
npm run test:payment-provider-integration:checkout
npm run test:payment-provider-integration:webhooks
npm run test:payment-provider-integration:idempotency
npm run test:payment-provider-integration:payments
npm run test:payment-provider-integration:reports
npm run test:payment-provider-integration:api
npm run test:payment-provider-integration:authorization
npm run test:payment-provider-integration:own-resource
npm run test:payment-provider-integration:multitenancy
npm run test:payment-provider-integration:financial-integrity
npm run test:payment-provider-integration:audit
npm run test:payment-provider-integration:observability
npm run test:payment-provider-integration:openapi
npm run test:payment-provider-integration:security
npm run test:payment-provider-integration:performance
npm run test:payment-provider-integration:concurrency
npm run test:payment-provider-integration:smoke
```

---

## 32.2. Comandos generales

```bash id="d9u7lz"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run build
```

---

# 33. CI/CD gates

El pipeline debe fallar si:

```text id="c7j09e"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan domain tests;
- fallan repository tests;
- fallan service tests;
- fallan adapter tests;
- fallan secret tests;
- fallan checkout tests;
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
- falla build;
- OpenAPI documenta endpoints públicos administrativos;
- response snapshots contienen secretos;
- response snapshots contienen PAN/CVV;
- response snapshots contienen raw payload;
- response snapshots contienen raw signature;
- logs contienen checkoutUrl;
- logs contienen secretos;
- audit contiene secretos;
- se detecta uso de float/double para dinero;
- webhook inválido crea Payment;
- webhook duplicado crea Payment duplicado;
- amount mismatch crea Payment automático;
- currency mismatch crea Payment automático;
- redirect de navegador crea Payment;
- external AI se activa por defecto.
```

---

# 34. Cobertura mínima recomendada

| Área                           | Cobertura mínima |
| ------------------------------ | ---------------: |
| Value Objects                  |              95% |
| State machines                 |              95% |
| Webhook signature/idempotency  |              95% |
| Payment creation from provider |              95% |
| Secret handling                |              95% |
| Multitenancy                   |              95% |
| Financial integrity            |              95% |
| Services                       |              90% |
| Repositories                   |              90% |
| API controllers                |              85% |
| Reports                        |              80% |
| Observability                  |              75% |

Regla:

```text id="gu55ok"
La cobertura no reemplaza pruebas de seguridad financiera. Un módulo con alta cobertura pero sin pruebas de webhook firmado, idempotencia, no card data, no secretos y no cross-tenant no debe aceptarse.
```

---

# 35. Matriz de trazabilidad

| Requisito                         | Prueba mínima                         |
| --------------------------------- | ------------------------------------- |
| Registrar provider definition     | API + service + repository            |
| Configurar provider tenant        | API + service + repository + security |
| SecretRef seguro                  | unit + service + security             |
| Crear PaymentIntent               | API + service + financial             |
| Calcular amount server-side       | service + integration                 |
| Crear CheckoutSession             | adapter + service + API               |
| No log checkoutUrl                | observability + security              |
| Webhook firmado                   | webhook security                      |
| Replay protection                 | webhook + idempotency                 |
| Evento duplicado                  | concurrency + idempotency             |
| ProviderTransaction               | service + repository                  |
| Crear Payment desde provider      | integration + financial               |
| No Payment sin verificación       | security                              |
| No Payment desde redirect         | security                              |
| Mapping único                     | repository + financial                |
| Settlement básico                 | service + API                         |
| Link settlement a bankTransaction | integration + multitenancy            |
| Account Statement actualizado     | integration                           |
| Bank Reconciliation readiness     | integration                           |
| Reportes                          | report service + API                  |
| Audit                             | audit tests                           |
| OpenAPI seguro                    | OpenAPI tests                         |
| No endpoints públicos             | route + security                      |
| No card data                      | schema + security                     |
| No secretos                       | DTO + logs + audit                    |

---

# 36. Checklist de aceptación de pruebas

```text id="ysrpvb"
[ ] Unit tests pasan.
[ ] Domain tests pasan.
[ ] Value object tests pasan.
[ ] State machine tests pasan.
[ ] Repository tests pasan.
[ ] Service tests pasan.
[ ] Adapter tests pasan.
[ ] SecretRef tests pasan.
[ ] Amount calculation tests pasan.
[ ] Checkout tests pasan.
[ ] Webhook signature tests pasan.
[ ] Webhook replay tests pasan.
[ ] Webhook idempotency tests pasan.
[ ] Payment creation from provider tests pasan.
[ ] Provider mapping tests pasan.
[ ] Settlement tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own-resource tests pasan.
[ ] Multitenancy tests pasan.
[ ] Financial integrity tests pasan.
[ ] Security tests pasan.
[ ] Audit tests pasan.
[ ] Observability tests pasan.
[ ] OpenAPI tests pasan.
[ ] Performance tests cumplen objetivo.
[ ] Concurrency tests pasan.
[ ] Regression tests pasan.
[ ] Smoke tests pasan.
[ ] CI/CD gates pasan.
```

---

# 37. No aceptación

El módulo no debe aceptarse si las pruebas permiten:

```text id="rbkyew"
- provider config cross-tenant;
- payment intent cross-tenant;
- checkout session cross-tenant;
- webhook event cross-tenant;
- provider transaction cross-tenant;
- payment mapping cross-tenant;
- settlement cross-tenant;
- crear PaymentIntent con charge de otro tenant;
- crear PaymentIntent sobre unidad ajena;
- aceptar tenantId desde body;
- aceptar amount del cliente como fuente de verdad;
- exponer credentialSecret value;
- exponer webhookSecret value;
- exponer raw signature;
- exponer raw webhook payload;
- exponer checkoutUrl en logs;
- guardar PAN;
- guardar CVV;
- guardar raw card data;
- crear Payment desde redirect del navegador;
- crear Payment sin webhook firmado/verificado;
- duplicar Payment por webhook repetido;
- permitir amount mismatch sin revisión;
- permitir currency mismatch sin revisión;
- omitir PaymentAllocation cuando corresponde;
- romper Account Statements;
- marcar conciliado bancariamente sin Bank Reconciliation;
- crear endpoints públicos administrativos;
- documentar endpoints públicos administrativos en OpenAPI;
- permitir WordPress confirmar pagos;
- enviar datos reales a IA externa;
- omitir auditoría financiera crítica.
```

---

# 38. Resultado esperado

Al completar este plan de pruebas, el módulo `018-payment-provider-integration` deberá demostrar que:

```text id="rmgatw"
- administra provider definitions platform;
- configura proveedores por tenant;
- maneja secretos mediante SecretRef;
- no expone secretos;
- no almacena datos de tarjeta;
- crea PaymentIntents tenant-scoped;
- calcula montos en servidor;
- crea CheckoutSessions seguras;
- devuelve checkoutUrl temporal solo en respuesta autorizada;
- no confía en redirects del navegador;
- recibe webhooks firmados;
- valida firma y timestamp;
- protege contra replay;
- procesa eventos idempotentemente;
- registra ProviderWebhookEvent sanitizado;
- registra ProviderTransaction;
- mapea estados correctamente;
- crea Payment interno solo con evento verificado;
- no duplica Payments;
- crea ProviderPaymentMapping;
- registra settlement básico;
- integra Payments;
- actualiza Account Statements mediante Payments;
- prepara Bank Reconciliation;
- usa Secure Document Storage para comprobantes/exports;
- notifica sin datos sensibles;
- audita operaciones críticas;
- mantiene logs y métricas seguras;
- mantiene OpenAPI seguro;
- no crea endpoints públicos administrativos;
- no usa IA externa con datos reales.
```

---

# 39. Próximo documento

Después de este test plan, el siguiente documento del paquete es:

```text id="lbyhhx"
docs/specs/018-payment-provider-integration/tasks.md
```
