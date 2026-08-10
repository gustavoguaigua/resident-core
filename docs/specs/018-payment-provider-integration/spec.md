# Functional Specification — Spec 018 Payment Provider Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                                                           |
| Spec ID         | 018                                                                                                                                                                                                                                                     |
| Módulo          | Payment Provider Integration                                                                                                                                                                                                                            |
| Documento       | Functional Specification                                                                                                                                                                                                                                |
| Ruta            | `docs/specs/018-payment-provider-integration/spec.md`                                                                                                                                                                                                   |
| Versión         | 0.1                                                                                                                                                                                                                                                     |
| Estado          | needs-review                                                                                                                                                                                                                                            |
| Fecha           | 2026-07-21                                                                                                                                                                                                                                              |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `012-communications-notifications`, `016-secure-document-storage`, `017-bank-reconciliation` |
| Relacionado con | pagos en línea, payment intents, checkout externo, webhooks, idempotencia, comprobantes, estado de cuenta, conciliación, auditoría, proveedores de pago, seguridad financiera                                                                           |
| API Style       | REST                                                                                                                                                                                                                                                    |
| Naturaleza      | Tenant-scoped / Provider-agnostic / Webhook-driven / Idempotent / Payment-aware / Audit-heavy / PCI-minimized / Non-public                                                                                                                              |

---

## 2. Propósito

El módulo `018-payment-provider-integration` define la integración de RESIDENT Core con proveedores externos de pago para permitir que propietarios o residentes realicen pagos en línea de alícuotas, cargos, multas, arriendos de áreas comunales u otros valores adeudados.

El módulo debe actuar como una capa segura, desacoplada y auditable entre RESIDENT Core y proveedores externos.

Su función principal es:

```text id="l1br03"
RESIDENT Core
  └── crea intención de pago
        └── proveedor externo procesa pago
              └── webhook firmado confirma resultado
                    └── RESIDENT registra pago
                          └── estado de cuenta se actualiza
                                └── conciliación bancaria puede verificar después
```

Regla central:

```text id="b3k9vm"
Toda integración con proveedor de pago debe pertenecer a un tenant, usar configuración segura, evitar almacenar datos sensibles de tarjeta, crear intenciones idempotentes, validar webhooks firmados, mapear estados del proveedor hacia estados internos, registrar pagos solo ante evidencia verificable, mantener auditoría completa y no exponer secretos, tokens, payloads sensibles ni endpoints administrativos públicos.
```

---

## 3. Contexto dentro de RESIDENT Core

Hasta este punto, RESIDENT Core contempla:

```text id="rnry5v"
004-dues-fees
  └── cargos, alícuotas, ajustes, reversos

005-payments
  └── pagos, comprobantes, asignaciones, reversos

006-account-statements
  └── estados de cuenta reconstruidos desde cargos y pagos

016-secure-document-storage
  └── almacenamiento seguro de comprobantes y documentos

017-bank-reconciliation
  └── conciliación bancaria contra movimientos reales
```

`018-payment-provider-integration` agrega una vía adicional para registrar pagos:

```text id="eucba5"
Pago reportado manualmente
Pago validado administrativamente
Pago registrado desde proveedor externo
```

Este módulo no reemplaza a `005-payments`; lo extiende mediante un flujo de pago externo verificable.

---

## 4. Problema que resuelve

Sin integración con proveedores externos, el flujo de pago depende principalmente de:

```text id="d0vger"
- transferencia bancaria;
- carga manual de comprobante;
- revisión administrativa;
- validación manual;
- conciliación posterior.
```

Esto puede generar:

```text id="oxvlqb"
- demoras en validación;
- errores al digitar valores;
- comprobantes falsos o ambiguos;
- pagos sin referencia;
- dificultad para identificar pagador;
- trabajo manual excesivo;
- diferencias entre pago reportado y banco;
- baja trazabilidad del ciclo completo.
```

La integración con proveedores externos permite:

```text id="y66re0"
- generar intención de pago exacta;
- direccionar a checkout seguro;
- recibir confirmación por webhook;
- registrar pagos con evidencia técnica;
- reducir carga manual;
- mejorar experiencia del residente;
- mejorar trazabilidad;
- preparar conciliación posterior;
- facilitar reportes financieros.
```

---

## 5. Objetivo funcional

El sistema debe permitir:

```text id="hfh381"
- configurar proveedores de pago por tenant o por plataforma;
- habilitar o deshabilitar proveedores por tenant;
- crear intenciones de pago;
- crear sesiones de checkout externo;
- asociar intención de pago a cargos, unidad, persona o estado de cuenta;
- redirigir al usuario a checkout externo seguro;
- recibir webhooks del proveedor;
- validar firma de webhooks;
- procesar eventos idempotentemente;
- mapear estados externos a estados internos;
- registrar transacciones del proveedor;
- crear o actualizar Payment en RESIDENT Core;
- asociar comprobantes o evidencia del proveedor;
- registrar fallos y cancelaciones;
- soportar reintentos seguros de webhook;
- permitir consulta administrativa de transacciones;
- permitir consulta propia de pagos iniciados;
- emitir auditoría financiera;
- alimentar estados de cuenta;
- alimentar reportes;
- preparar datos para conciliación bancaria.
```

---

## 6. Alcance incluido en MVP

El MVP incluye:

```text id="zdcvri"
1. Diseño provider-agnostic.
2. Configuración básica de proveedores por tenant.
3. Configuración segura de credenciales.
4. Estado enabled/disabled por proveedor.
5. PaymentProviderPort.
6. Adaptador mock/sandbox para desarrollo y pruebas.
7. Adaptador genérico para checkout externo.
8. Creación de Payment Intent interno.
9. Creación de Checkout Session externa.
10. Asociación de intención con tenant, unidad, persona, cargos o balance.
11. Soporte para pago de uno o varios cargos.
12. Soporte para pago de saldo total pendiente.
13. Soporte para pago de multa si integra con Fines.
14. Soporte para pago de reserva si integra con Reservations.
15. Montos exactos como Decimal.
16. Moneda USD para MVP.
17. Idempotency-Key.
18. Estado de intento de pago.
19. Estado de transacción del proveedor.
20. Registro de providerReference.
21. Registro de providerTransactionId.
22. Registro de webhook events.
23. Validación de firma de webhook.
24. Procesamiento idempotente de webhooks.
25. Mapeo de estados externos a estados internos.
26. Creación automática de Payment solo ante evento confirmado y verificado.
27. Asociación con PaymentReceipt si el proveedor entrega comprobante.
28. Integración con Secure Document Storage si se genera comprobante persistente.
29. Integración con Account Statements.
30. Integración con Bank Reconciliation.
31. Consulta administrativa.
32. Consulta propia limitada.
33. Auditoría completa.
34. Reportes básicos.
35. OpenAPI privado.
36. Endpoints públicos mínimos exclusivamente para webhook, protegidos por firma.
```

Nota importante:

```text id="taflua"
Un endpoint de webhook puede ser técnicamente accesible desde internet, pero no es un endpoint público funcional para usuarios. Debe aceptar únicamente eventos firmados por el proveedor y responder de forma segura.
```

---

## 7. Fuera de alcance del MVP

No implementar en esta spec:

```text id="pak19s"
- almacenamiento de datos de tarjeta;
- procesamiento directo de tarjeta dentro de RESIDENT Core;
- formularios propios para capturar tarjeta;
- cumplimiento PCI completo como procesador de tarjeta;
- tokenización propia de tarjetas;
- cargos recurrentes automáticos;
- domiciliación bancaria;
- débitos automáticos;
- suscripciones avanzadas;
- split payments avanzados;
- marketplace;
- wallet interno;
- pagos masivos a proveedores;
- reembolsos automáticos;
- chargebacks avanzados;
- disputas avanzadas;
- antifraude avanzado propio;
- scoring de riesgo con IA;
- integración directa con todos los proveedores reales;
- certificación bancaria;
- facturación electrónica;
- integración SRI;
- contabilidad completa;
- asientos contables;
- conciliación automática final sin módulo 017;
- pagos offline;
- QR público sin expiración;
- enlaces públicos permanentes de pago;
- pago anónimo.
```

---

## 8. Principios de diseño

### 8.1. Provider-agnostic

El dominio de RESIDENT no debe depender directamente de un proveedor específico.

```text id="s97xsi"
PaymentProviderPort
  ├── MockPaymentProviderAdapter
  ├── SandboxPaymentProviderAdapter
  ├── ProviderAAdapter futuro
  ├── ProviderBAdapter futuro
  └── ProviderCAdapter futuro
```

---

### 8.2. No almacenar datos sensibles de tarjeta

RESIDENT Core no debe almacenar:

```text id="v0zsu1"
PAN
CVV
track data
PIN
card security code
card raw token sensible
3DS payload completo
datos completos de tarjeta
```

Permitido:

```text id="qw9s6m"
brand
last4
providerTokenRef opaco si el proveedor lo permite
paymentMethodType
authorizationCode parcial o sanitizado
providerTransactionId
providerReference
```

---

### 8.3. Checkout externo preferido

MVP debe usar checkout externo o redirección segura del proveedor.

```text id="bwjo2a"
RESIDENT crea intención
Proveedor captura datos sensibles
RESIDENT recibe resultado firmado
```

---

### 8.4. Webhook como fuente técnica verificable

La confirmación final debe venir de un evento verificable:

```text id="nv37uq"
webhook firmado
consulta server-to-server verificada
evento idempotente
providerTransactionId único
```

No confiar en:

```text id="ldnes2"
query params de retorno del navegador
pantalla de éxito del frontend
callback sin firma
mensaje enviado por el usuario
screenshot del usuario
```

---

### 8.5. Idempotencia obligatoria

Un webhook repetido no debe duplicar pagos.

Regla:

```text id="qsd6md"
Mismo providerEventId o providerTransactionId no puede crear dos Payments.
```

---

### 8.6. Pagos no son cargos

El proveedor procesa cobro. RESIDENT registra pago contra cargos existentes.

```text id="a4e72p"
Provider payment ≠ Charge
Provider payment -> Payment -> PaymentAllocation -> AccountStatement
```

---

### 8.7. Auditoría financiera

Todo evento crítico debe auditarse:

```text id="v2wkwe"
paymentProvider.configured
paymentIntent.created
checkoutSession.created
providerWebhook.received
providerWebhook.verified
providerWebhook.rejected
providerTransaction.succeeded
providerTransaction.failed
payment.createdFromProvider
paymentProvider.reconciliationLinked
```

---

## 9. Actores

### 9.1. TenantAdmin

Puede habilitar o deshabilitar proveedores para el tenant si tiene permisos.

---

### 9.2. FinancialManager

Puede configurar operación financiera, consultar intenciones, revisar transacciones, reprocesar eventos seguros y resolver incidentes.

---

### 9.3. PropertyOwner

Puede iniciar pagos en línea sobre cargos o saldos propios.

---

### 9.4. Resident

Puede iniciar pagos en línea si está autorizado para la unidad o cargo correspondiente.

---

### 9.5. BoardMember

Puede consultar reportes agregados si tiene permisos financieros.

---

### 9.6. PlatformAdmin

Puede registrar proveedores soportados a nivel plataforma, pero no accede automáticamente a pagos ni transacciones de tenants.

---

### 9.7. PaymentProvider

Sistema externo que procesa pagos y emite eventos.

---

### 9.8. System

Procesa callbacks, webhooks, reintentos, mapping de estados, auditoría e integración con Payments.

---

## 10. Definiciones funcionales

### 10.1. Payment Provider

Proveedor externo de pagos.

Ejemplos conceptuales:

```text id="e2m3vl"
gateway de tarjetas
procesador de transferencias
botón de pago
checkout externo
wallet externo
agregador de pagos
```

La especificación no fija proveedor real en MVP.

---

### 10.2. Provider Configuration

Configuración técnica y operativa del proveedor para un tenant.

Incluye:

```text id="hn7rqz"
providerKey
environment
enabled
currency
supportedPaymentMethods
webhookSecretRef
credentialSecretRef
callback URLs
settlement settings
metadata segura
```

---

### 10.3. Payment Intent

Intención interna de pago creada por RESIDENT Core.

Representa:

```text id="h9a41j"
quién quiere pagar
qué quiere pagar
cuánto debe pagar
en qué moneda
qué proveedor usará
cuál es el estado del flujo
```

---

### 10.4. Checkout Session

Sesión externa creada en el proveedor para que el usuario complete el pago.

Puede incluir:

```text id="mvf0eb"
providerCheckoutUrl
expiresAt
providerSessionId
paymentMethodOptions
returnUrl
cancelUrl
```

El `providerCheckoutUrl` debe ser temporal.

---

### 10.5. Provider Transaction

Registro interno de la transacción externa reportada por el proveedor.

Incluye:

```text id="bk7mcr"
providerTransactionId
providerReference
amount
currency
status
authorizationCode parcial
paymentMethodType
cardBrand si existe
last4 si existe
event source
```

---

### 10.6. Provider Webhook Event

Evento recibido desde proveedor.

Debe registrarse de forma sanitizada e idempotente.

---

### 10.7. Settlement

Liquidación posterior del proveedor hacia cuenta bancaria.

En MVP se registra estado básico si el proveedor lo informa, pero la conciliación bancaria final pertenece a `017-bank-reconciliation`.

---

## 11. Entidades conceptuales

### 11.1. PaymentProviderDefinition

Representa un proveedor soportado por la plataforma.

Campos conceptuales:

```text id="ozdi46"
id
providerKey
displayName
status
supportedEnvironments
supportedCurrencies
supportedPaymentMethods
supportsHostedCheckout
supportsWebhooks
supportsRefunds
supportsInstallments
createdAt
updatedAt
metadata
```

---

### 11.2. TenantPaymentProviderConfig

Representa la configuración de un proveedor para un tenant.

Campos conceptuales:

```text id="wtamb2"
id
tenantId
providerDefinitionId
providerKey
environment
status
displayName
currency
credentialSecretRef
webhookSecretRef
publicConfig
settlementBankAccountId
createdBy
updatedBy
enabledBy
disabledBy
archivedBy
createdAt
updatedAt
enabledAt
disabledAt
archivedAt
metadata
```

---

### 11.3. PaymentIntent

Representa una intención interna de pago.

Campos conceptuales:

```text id="l85gdt"
id
tenantId
tenantProviderConfigId
initiatedByUserId
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
idempotencyKey
providerIntentId
providerSessionId
checkoutUrlExpiresAt
returnUrl
cancelUrl
createdAt
updatedAt
confirmedAt
failedAt
cancelledAt
expiredAt
metadata
```

---

### 11.4. PaymentIntentItem

Representa cada elemento que se desea pagar.

Campos conceptuales:

```text id="fel8tt"
id
tenantId
paymentIntentId
itemType
chargeId
fineId
reservationId
accountStatementId
propertyUnitId
description
amount
currency
createdAt
metadata
```

---

### 11.5. PaymentCheckoutSession

Representa la sesión de checkout creada en el proveedor.

Campos conceptuales:

```text id="wnyiio"
id
tenantId
paymentIntentId
providerSessionId
providerCheckoutUrl
status
expiresAt
createdAt
updatedAt
metadata
```

Nota:

```text id="a4d4ix"
providerCheckoutUrl puede exponerse temporalmente al usuario autorizado, pero no debe persistirse como URL pública permanente ni registrarse en logs.
```

---

### 11.6. ProviderWebhookEvent

Representa un evento recibido por webhook.

Campos conceptuales:

```text id="p14f5u"
id
tenantId
providerKey
tenantProviderConfigId
providerEventId
eventType
signatureStatus
processingStatus
receivedAt
processedAt
idempotencyKey
payloadHash
payloadPreview
errorCode
errorMessage
retryCount
metadata
```

---

### 11.7. ProviderTransaction

Representa una transacción externa reportada por el proveedor.

Campos conceptuales:

```text id="zfxjkm"
id
tenantId
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
processedAt
settledAt
createdAt
updatedAt
metadata
```

---

### 11.8. ProviderPaymentMapping

Representa el vínculo entre una transacción del proveedor y un Payment interno.

Campos conceptuales:

```text id="k0xgmm"
id
tenantId
paymentIntentId
providerTransactionId
paymentId
mappingStatus
createdBy
createdAt
reversedAt
reverseReason
metadata
```

---

### 11.9. ProviderSettlementRecord

Representa información básica de liquidación, si el proveedor la entrega.

Campos conceptuales:

```text id="nv2cdr"
id
tenantId
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
metadata
```

MVP puede registrar esta entidad solo si el proveedor o el adaptador mock la produce. La conciliación final se mantiene en `017-bank-reconciliation`.

---

## 12. Enums iniciales

### 12.1. PaymentProviderDefinitionStatus

```text id="d20gru"
draft
active
inactive
deprecated
archived
```

---

### 12.2. PaymentProviderEnvironment

```text id="mme127"
sandbox
production
```

---

### 12.3. TenantPaymentProviderConfigStatus

```text id="y5zlus"
draft
enabled
disabled
invalid
archived
```

---

### 12.4. PaymentMethodType

```text id="l8i6n8"
card
bankTransfer
wallet
paymentButton
qr
cashNetwork
other
```

MVP recomendado:

```text id="znb41n"
card
paymentButton
other
```

---

### 12.5. PaymentIntentStatus

```text id="obvkp9"
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

### 12.6. PaymentIntentPurpose

```text id="gcem4y"
payCharges
payAccountBalance
payFine
payReservation
payOther
```

---

### 12.7. PaymentIntentItemType

```text id="zfl0kt"
charge
fine
reservation
accountBalance
manualItem
other
```

---

### 12.8. CheckoutSessionStatus

```text id="aqsa0u"
created
opened
completed
failed
cancelled
expired
archived
```

---

### 12.9. ProviderWebhookSignatureStatus

```text id="lp24az"
notVerified
verified
invalid
missing
unsupported
```

---

### 12.10. ProviderWebhookProcessingStatus

```text id="g9ip31"
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

### 12.11. ProviderTransactionStatus

```text id="qe338t"
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

### 12.12. InternalProviderPaymentStatus

```text id="h6qoei"
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

### 12.13. ProviderPaymentMappingStatus

```text id="nqerlj"
active
reversed
failed
archived
```

---

### 12.14. ProviderSettlementStatus

```text id="yzt2jr"
pending
settled
failed
reversed
unknown
```

---

## 13. Reglas de negocio

### BR-001 — Tenant obligatorio

Toda configuración, intención, item, checkout, webhook, transacción, mapping y settlement debe tener `tenantId`.

---

### BR-002 — No `tenantId` desde body

El cliente nunca debe enviar `tenantId` para crear recursos tenant-scoped.

---

### BR-003 — Proveedor habilitado

Solo se pueden crear intenciones de pago usando un proveedor `enabled` para el tenant.

---

### BR-004 — Ambiente explícito

Toda configuración debe indicar ambiente:

```text id="ocwx6p"
sandbox
production
```

---

### BR-005 — Credenciales seguras

Las credenciales no deben persistirse en texto plano en base de datos transaccional.

Deben referenciarse mediante:

```text id="jfwjjo"
credentialSecretRef
webhookSecretRef
```

---

### BR-006 — No datos de tarjeta

RESIDENT Core no debe capturar, almacenar ni procesar datos completos de tarjeta.

---

### BR-007 — Checkout externo

MVP debe usar checkout externo o flujo equivalente donde el proveedor captura información sensible.

---

### BR-008 — Payment Intent obligatorio

Todo pago iniciado con proveedor debe partir de un PaymentIntent interno.

---

### BR-009 — Items obligatorios

Todo PaymentIntent debe tener al menos un PaymentIntentItem.

---

### BR-010 — Monto calculado en servidor

`amount` total del PaymentIntent debe calcularse desde items o fuentes internas.

El cliente no es fuente de verdad del monto.

---

### BR-011 — Moneda controlada

MVP usa:

```text id="u6idtd"
USD
```

---

### BR-012 — Idempotencia de PaymentIntent

El sistema debe evitar duplicar intenciones para la misma operación si se usa `Idempotency-Key`.

---

### BR-013 — Checkout URL temporal

La URL de checkout debe tener expiración.

---

### BR-014 — Retorno del navegador no confirma pago

El retorno del frontend solo indica resultado visual.

No debe crear Payment confirmado.

---

### BR-015 — Webhook firmado obligatorio

Todo evento que confirme pago debe tener firma válida o ser verificado server-to-server.

---

### BR-016 — Webhook idempotente

Repetir el mismo webhook no debe duplicar ProviderTransaction ni Payment.

---

### BR-017 — Provider event único

`providerEventId` debe ser único por proveedor y tenant cuando el proveedor lo entregue.

---

### BR-018 — Provider transaction única

`providerTransactionId` debe ser único por proveedor y tenant cuando el proveedor lo entregue.

---

### BR-019 — Pago interno solo ante confirmación verificable

Crear Payment desde proveedor solo si:

```text id="btstnu"
- webhook está verificado;
- providerStatus es exitoso/capturado;
- amount coincide;
- currency coincide;
- PaymentIntent pertenece al tenant;
- PaymentIntent está en estado compatible;
- no existe Payment previo para la misma transacción;
```

---

### BR-020 — Monto debe coincidir

Si el proveedor reporta monto diferente al PaymentIntent, el evento debe pasar a `requiresReview` o `rejected`.

---

### BR-021 — Moneda debe coincidir

Si la moneda reportada no coincide, el evento debe rechazarse o pasar a revisión.

---

### BR-022 — No Payment duplicado

Una transacción del proveedor no puede crear dos Payments.

---

### BR-023 — Payment generado debe integrarse con `005-payments`

El pago interno debe crearse usando el contrato del módulo Payments.

---

### BR-024 — PaymentAllocation

Si el PaymentIntent fue creado contra cargos específicos, se pueden crear asignaciones según reglas de `005-payments`.

Si fue creado contra saldo total, se aplica política de asignación definida en Payments.

---

### BR-025 — Estado de cuenta no se recalcula desde proveedor

`006-account-statements` continúa derivando saldos desde cargos y pagos internos.

---

### BR-026 — Conciliación bancaria posterior

El pago por proveedor puede marcarse como provider-verified, pero la liquidación bancaria final puede verificarse posteriormente en `017-bank-reconciliation`.

---

### BR-027 — Reembolso fuera de MVP

No se ejecutan reembolsos automáticos en MVP.

Si el proveedor envía evento de refund, se registra como evento y se marca para revisión.

---

### BR-028 — Chargeback fuera de MVP operativo

Chargeback se registra como transacción `requiresReview`, pero su tratamiento financiero detallado queda diferido.

---

### BR-029 — Auditoría obligatoria

Toda operación crítica debe auditarse.

---

### BR-030 — Logs sin secretos

Logs no deben contener credenciales, secretos, firmas completas, payload completo, datos de tarjeta ni checkout URLs persistentes.

---

### BR-031 — Webhook endpoint protegido por firma

Aunque sea accesible por internet, debe rechazar eventos sin firma válida.

---

### BR-032 — Respuesta de webhook segura

El endpoint de webhook no debe revelar detalles internos.

---

### BR-033 — Reproceso controlado

Un webhook fallido puede reprocesarse solo con permiso financiero/técnico y auditoría.

---

### BR-034 — No endpoints públicos administrativos

No exponer configuración, intents, transacciones ni reportes en `/public`.

---

### BR-035 — Consulta propia limitada

Un usuario puede consultar sus propias intenciones de pago si está vinculado a la persona/unidad correspondiente.

---

### BR-036 — WordPress no procesa pagos directamente

WordPress puede enlazar al Core o mostrar botón autorizado, pero no debe capturar tarjeta ni confirmar pagos.

---

### BR-037 — Provider config no visible para residentes

Residentes no pueden ver credenciales, secretos, provider config interna ni webhook data.

---

### BR-038 — IA externa prohibida con datos reales

No enviar eventos, payloads, transacciones, pagos, tarjetas, referencias ni comprobantes reales a servicios externos de IA en MVP.

---

## 14. Historias de usuario

### US-001 — Registrar proveedor soportado

Como PlatformAdmin autorizado, quiero registrar un proveedor de pago soportado para que pueda habilitarse en tenants.

Criterios:

```text id="x43qju"
- requiere permiso platform;
- no guarda credenciales tenant;
- define providerKey;
- define métodos soportados;
- audita paymentProviderDefinition.created.
```

---

### US-002 — Configurar proveedor para tenant

Como FinancialManager, quiero configurar un proveedor para mi conjunto.

Criterios:

```text id="rhl145"
- requiere tenant activo;
- requiere permiso;
- credenciales se guardan como secret refs;
- no se exponen secretos;
- status inicia draft o disabled;
- audita tenantPaymentProviderConfig.created.
```

---

### US-003 — Habilitar proveedor

Como TenantAdmin o FinancialManager, quiero habilitar el proveedor cuando las credenciales sean válidas.

Criterios:

```text id="f0bugu"
- requiere validación de configuración;
- status pasa a enabled;
- audita tenantPaymentProviderConfig.enabled.
```

---

### US-004 — Iniciar pago propio

Como propietario o residente autorizado, quiero iniciar un pago en línea de mis valores pendientes.

Criterios:

```text id="ri5k59"
- usuario autenticado;
- relación con persona/unidad válida;
- cargos pertenecen al tenant;
- cargos son pagables;
- monto se calcula en servidor;
- crea PaymentIntent;
- crea CheckoutSession;
- devuelve checkoutUrl temporal;
- audita paymentIntent.created.
```

---

### US-005 — Pagar cargos específicos

Como propietario, quiero seleccionar cargos específicos y pagarlos en línea.

Criterios:

```text id="irzgpu"
- todos los chargeIds pertenecen al tenant;
- todos los chargeIds pertenecen a unidad autorizada;
- cargos están pendientes o parcialmente pagados;
- monto total se calcula desde cargos;
- no se acepta monto arbitrario del cliente.
```

---

### US-006 — Pagar saldo total

Como propietario, quiero pagar el saldo total pendiente de mi unidad.

Criterios:

```text id="ttnbxe"
- saldo se obtiene desde Account Statements;
- monto se calcula en servidor;
- PaymentIntentItem representa accountBalance;
- se respeta tenant y unidad.
```

---

### US-007 — Recibir webhook exitoso

Como sistema, quiero recibir evento de pago exitoso desde el proveedor.

Criterios:

```text id="cbvbg4"
- firma válida;
- providerEventId idempotente;
- providerTransactionId único;
- amount coincide;
- currency coincide;
- PaymentIntent existe;
- crea ProviderTransaction;
- crea Payment interno;
- audita providerTransaction.succeeded y payment.createdFromProvider.
```

---

### US-008 — Recibir webhook fallido

Como sistema, quiero registrar eventos fallidos sin crear pagos internos.

Criterios:

```text id="jirywv"
- firma válida;
- evento procesado idempotentemente;
- PaymentIntent pasa a failed si aplica;
- no crea Payment;
- audita providerTransaction.failed.
```

---

### US-009 — Reintentar webhook fallido

Como FinancialManager autorizado, quiero reprocesar un webhook fallido.

Criterios:

```text id="fmf0mw"
- requiere permiso;
- requiere evento existente;
- no procesa eventos con firma inválida;
- idempotencia se mantiene;
- auditoría reforzada.
```

---

### US-010 — Consultar transacciones del proveedor

Como FinancialManager, quiero consultar transacciones externas y su relación con pagos internos.

Criterios:

```text id="y291fx"
- tenant-scoped;
- requiere permiso;
- no expone payload sensible;
- permite filtrar por estado, fecha, providerKey y paymentIntent.
```

---

### US-011 — Consultar mis pagos iniciados

Como propietario o residente autorizado, quiero consultar el estado de mis intentos de pago.

Criterios:

```text id="trrhue"
- solo propios;
- no expone provider payload;
- no expone configuración del proveedor;
- no expone secretos;
- muestra estado seguro.
```

---

### US-012 — Registrar settlement básico

Como FinancialManager, quiero ver si el proveedor reportó liquidación de pagos.

Criterios:

```text id="gl1a0d"
- si provider reporta settlement;
- se registra ProviderSettlementRecord;
- no reemplaza conciliación bancaria;
- puede vincularse después con bankTransaction.
```

---

## 15. Requisitos funcionales

### FR-001 — Gestionar definiciones de proveedor

El sistema debe permitir registrar, consultar, activar, desactivar, deprecar y archivar proveedores soportados a nivel plataforma.

---

### FR-002 — Configurar proveedor por tenant

El sistema debe permitir configurar proveedor de pago para un tenant.

---

### FR-003 — Proteger credenciales

El sistema debe almacenar referencias a secretos, no secretos en texto plano.

---

### FR-004 — Habilitar proveedor

El sistema debe permitir habilitar proveedor solo cuando configuración mínima sea válida.

---

### FR-005 — Crear PaymentIntent

El sistema debe permitir crear intenciones de pago tenant-scoped.

---

### FR-006 — Crear PaymentIntentItems

El sistema debe asociar items pagables a la intención.

---

### FR-007 — Calcular monto en servidor

El monto total debe calcularse desde cargos, saldos o recursos internos.

---

### FR-008 — Crear CheckoutSession

El sistema debe crear sesión de checkout usando proveedor externo.

---

### FR-009 — Devolver checkoutUrl temporal

El sistema debe devolver URL temporal solo al usuario autorizado.

---

### FR-010 — Expirar PaymentIntent

El sistema debe expirar intenciones no completadas.

---

### FR-011 — Recibir webhooks

El sistema debe recibir eventos del proveedor en endpoint específico.

---

### FR-012 — Validar firma

El sistema debe validar firma, timestamp y origen del webhook según proveedor.

---

### FR-013 — Procesar webhooks idempotentemente

El mismo evento no debe producir efectos duplicados.

---

### FR-014 — Registrar ProviderWebhookEvent

Todo webhook recibido debe registrarse de forma sanitizada.

---

### FR-015 — Registrar ProviderTransaction

Eventos relevantes deben crear o actualizar transacción del proveedor.

---

### FR-016 — Mapear estados

El sistema debe mapear estados externos a estados internos.

---

### FR-017 — Crear Payment desde proveedor

El sistema debe crear Payment interno solo ante confirmación verificable.

---

### FR-018 — Vincular Payment con ProviderTransaction

Todo pago creado desde proveedor debe quedar vinculado con la transacción externa.

---

### FR-019 — Crear comprobante o evidencia

Si el proveedor entrega comprobante o recibo, debe registrarse como metadata segura o documento en Secure Document Storage.

---

### FR-020 — Actualizar Account Statement

Estados de cuenta deben reflejar el pago interno creado.

---

### FR-021 — Integrar con Bank Reconciliation

Los pagos de proveedor deben poder conciliarse contra movimientos bancarios o liquidaciones del proveedor.

---

### FR-022 — Consultar intents y transacciones

El sistema debe permitir consulta administrativa tenant-scoped.

---

### FR-023 — Consulta propia limitada

Usuarios vinculados a persona/unidad pueden consultar sus propias intenciones.

---

### FR-024 — Reproceso controlado

El sistema debe permitir reprocesar eventos fallidos bajo permiso.

---

### FR-025 — Reportes

El sistema debe alimentar reportes de pagos por proveedor, transacciones exitosas, fallidas y pendientes.

---

### FR-026 — Auditoría

El sistema debe auditar operaciones críticas.

---

### FR-027 — No datos de tarjeta

El sistema no debe capturar ni almacenar datos completos de tarjeta.

---

### FR-028 — No endpoints públicos administrativos

El sistema no debe exponer configuración, transacciones ni reportes en rutas públicas.

---

## 16. Requisitos no funcionales

### NFR-001 — Seguridad

Debe cumplir `docs/sdd/security.md`.

---

### NFR-002 — Multitenancy

Toda consulta debe filtrar por `tenantId`.

---

### NFR-003 — Idempotencia

Payment intents, checkout sessions, webhooks y creación de Payments deben ser idempotentes.

---

### NFR-004 — Integridad financiera

No debe crear pagos sin evidencia verificable del proveedor.

---

### NFR-005 — Privacidad

No debe almacenar datos de tarjeta ni secretos.

---

### NFR-006 — Precisión monetaria

Todos los montos deben usar Decimal.

---

### NFR-007 — Disponibilidad

Webhook endpoint debe tolerar reintentos del proveedor.

---

### NFR-008 — Observabilidad segura

Logs, métricas y trazas no deben contener secretos ni datos sensibles de pago.

---

### NFR-009 — Performance

Objetivos iniciales:

```text id="bbfx22"
p95 < 800 ms para crear PaymentIntent.
p95 < 1200 ms para crear CheckoutSession, excluyendo latencia del proveedor.
p95 < 1000 ms para registrar webhook recibido.
p95 < 3000 ms para procesar webhook exitoso y crear Payment.
p95 < 800 ms para consultar intents paginados.
```

---

### NFR-010 — Resiliencia

Si el proveedor falla, el sistema debe dejar el intento en estado controlado y auditable.

---

### NFR-011 — API-first

Todas las capacidades deben exponerse mediante REST o puertos internos.

---

## 17. Permisos iniciales

### 17.1. Definiciones de proveedor

```text id="gfj2u5"
paymentProviderDefinitions.create
paymentProviderDefinitions.read
paymentProviderDefinitions.update
paymentProviderDefinitions.activate
paymentProviderDefinitions.deprecate
paymentProviderDefinitions.archive
```

---

### 17.2. Configuración tenant

```text id="x9f8zy"
tenantPaymentProviders.create
tenantPaymentProviders.read
tenantPaymentProviders.update
tenantPaymentProviders.enable
tenantPaymentProviders.disable
tenantPaymentProviders.testConnection
tenantPaymentProviders.archive
```

---

### 17.3. Intenciones de pago

```text id="nwkaen"
paymentIntents.create
paymentIntents.read
paymentIntents.cancel
paymentIntents.expire
paymentIntents.read.own
paymentIntents.create.own
```

---

### 17.4. Checkout sessions

```text id="bm1k9r"
paymentCheckoutSessions.create
paymentCheckoutSessions.read
paymentCheckoutSessions.read.own
```

---

### 17.5. Webhooks

```text id="lrk9h1"
paymentProviderWebhooks.read
paymentProviderWebhooks.reprocess
paymentProviderWebhooks.archive
```

---

### 17.6. Provider transactions

```text id="sbwp73"
providerTransactions.read
providerTransactions.review
providerTransactions.archive
```

---

### 17.7. Provider mappings

```text id="prgiy1"
providerPaymentMappings.read
providerPaymentMappings.reverse
```

---

### 17.8. Settlements

```text id="n51jqe"
providerSettlements.read
providerSettlements.linkToBankTransaction
providerSettlements.archive
```

---

### 17.9. Reportes

```text id="zl66d9"
paymentProviderReports.read
paymentProviderReports.export
```

---

### 17.10. Auditoría

```text id="dtix0s"
paymentProvider.audit.read
```

---

## 18. API preliminar

### 18.1. Platform — definiciones de proveedor

```text id="u36acf"
GET    /api/v1/platform/payment-provider-definitions
POST   /api/v1/platform/payment-provider-definitions
GET    /api/v1/platform/payment-provider-definitions/{providerDefinitionId}
PATCH  /api/v1/platform/payment-provider-definitions/{providerDefinitionId}
POST   /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/activate
POST   /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/deprecate
POST   /api/v1/platform/payment-provider-definitions/{providerDefinitionId}/archive
```

---

### 18.2. Tenant — configuración de proveedores

```text id="n1b5eu"
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

### 18.3. Tenant — administración de intents

```text id="hz9exf"
GET    /api/v1/tenant/payment-intents
POST   /api/v1/tenant/payment-intents
GET    /api/v1/tenant/payment-intents/{paymentIntentId}
POST   /api/v1/tenant/payment-intents/{paymentIntentId}/checkout-sessions
POST   /api/v1/tenant/payment-intents/{paymentIntentId}/cancel
POST   /api/v1/tenant/payment-intents/{paymentIntentId}/expire
```

---

### 18.4. Tenant — webhooks recibidos

```text id="bcar6v"
GET    /api/v1/tenant/payment-provider-webhook-events
GET    /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}
POST   /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}/reprocess
POST   /api/v1/tenant/payment-provider-webhook-events/{webhookEventId}/archive
```

---

### 18.5. Tenant — transacciones del proveedor

```text id="sy14cn"
GET    /api/v1/tenant/provider-transactions
GET    /api/v1/tenant/provider-transactions/{providerTransactionId}
POST   /api/v1/tenant/provider-transactions/{providerTransactionId}/mark-review-required
POST   /api/v1/tenant/provider-transactions/{providerTransactionId}/archive
```

---

### 18.6. Tenant — mappings

```text id="geyp5q"
GET    /api/v1/tenant/provider-payment-mappings
GET    /api/v1/tenant/provider-payment-mappings/{mappingId}
POST   /api/v1/tenant/provider-payment-mappings/{mappingId}/reverse
```

---

### 18.7. Tenant — settlements

```text id="pnkq30"
GET    /api/v1/tenant/provider-settlements
GET    /api/v1/tenant/provider-settlements/{settlementId}
POST   /api/v1/tenant/provider-settlements/{settlementId}/link-bank-transaction
POST   /api/v1/tenant/provider-settlements/{settlementId}/archive
```

---

### 18.8. Tenant — reportes

```text id="lidtg1"
GET    /api/v1/tenant/payment-provider-reports/summary
GET    /api/v1/tenant/payment-provider-reports/transactions
GET    /api/v1/tenant/payment-provider-reports/failures
GET    /api/v1/tenant/payment-provider-reports/settlements
GET    /api/v1/tenant/payment-provider-reports/export
```

---

### 18.9. Own endpoints

```text id="r7x1j2"
GET    /api/v1/me/payment-intents
POST   /api/v1/me/payment-intents
GET    /api/v1/me/payment-intents/{paymentIntentId}
POST   /api/v1/me/payment-intents/{paymentIntentId}/checkout-sessions
POST   /api/v1/me/payment-intents/{paymentIntentId}/cancel
```

---

### 18.10. Webhook endpoints

```text id="fwf7fh"
POST   /api/v1/webhooks/payment-providers/{providerKey}
```

Regla:

```text id="tgug45"
El endpoint de webhook no es público funcional para usuarios. Debe aceptar únicamente eventos firmados y verificados del proveedor.
```

---

### 18.11. Endpoints públicos prohibidos

No crear:

```text id="ng1hyf"
GET  /api/v1/public/payment-providers
GET  /api/v1/public/payment-intents
POST /api/v1/public/payment-intents
GET  /api/v1/public/provider-transactions
GET  /api/v1/public/payment-provider-reports
GET  /api/v1/public/tenants/{slug}/payment-providers
POST /api/v1/public/tenants/{slug}/payment-intents
```

---

## 19. Integraciones

### 19.1. `005-payments`

Uso:

```text id="f6z001"
- crear Payment interno desde proveedor verificado;
- asociar paymentMethod = provider;
- asociar providerPaymentMapping;
- asignar cargos si corresponde;
- crear receipt/evidence si aplica;
- impedir pagos duplicados;
- respetar estados de Payment.
```

Campos esperados o recomendados en `Payment`:

```text id="cwr1k4"
paymentSource = provider
providerPaymentMappingId
providerKey
providerTransactionId
providerReference
providerVerifiedAt
```

---

### 19.2. `006-account-statements`

Uso:

```text id="tzpedi"
- mostrar pagos creados desde proveedor;
- actualizar saldo cuando Payment se registra;
- no depender directamente de ProviderTransaction;
- conservar la fuente financiera en cargos/pagos/asignaciones.
```

---

### 19.3. `017-bank-reconciliation`

Uso:

```text id="cmn982"
- proveedor confirma pago;
- banco confirma liquidación;
- reconciliation puede vincular ProviderTransaction, Payment y BankTransaction;
- settlement puede ayudar a conciliación;
- no sustituye conciliación bancaria real.
```

---

### 19.4. `016-secure-document-storage`

Uso:

```text id="uvgjpd"
- almacenar recibos/comprobantes del proveedor si se generan;
- almacenar exports de reportes;
- proteger storageKey;
- evitar URLs persistentes.
```

---

### 19.5. `012-communications-notifications`

Uso:

```text id="t7jtnx"
- notificar paymentIntent created si aplica;
- notificar payment succeeded;
- notificar payment failed;
- notificar payment requiresReview;
- no enviar datos sensibles del proveedor;
- no enviar checkoutUrl por canales inseguros salvo política explícita.
```

---

### 19.6. `007-audit`

Uso:

```text id="uzmcdy"
- auditar configuración;
- auditar intentos;
- auditar checkout;
- auditar webhooks;
- auditar transacciones;
- auditar creación de pagos;
- auditar errores;
- auditar reprocesos.
```

---

## 20. Flujo funcional principal

### 20.1. Creación de pago propio

```text id="vjrh46"
1. Usuario autenticado entra a su estado de cuenta.
2. Selecciona cargos o saldo a pagar.
3. RESIDENT valida relación usuario-persona-unidad.
4. RESIDENT valida cargos pagables.
5. RESIDENT calcula monto.
6. RESIDENT crea PaymentIntent.
7. RESIDENT crea CheckoutSession con proveedor.
8. RESIDENT devuelve checkoutUrl temporal.
9. Usuario paga en proveedor.
10. Proveedor redirige al usuario a returnUrl/cancelUrl.
11. RESIDENT espera webhook firmado.
12. Webhook confirmado crea ProviderTransaction.
13. RESIDENT crea Payment interno.
14. RESIDENT asigna pago a cargos si corresponde.
15. Estado de cuenta refleja pago.
16. Auditoría queda registrada.
```

---

### 20.2. Webhook exitoso

```text id="i7bks5"
1. Proveedor envía webhook.
2. API recibe payload.
3. API identifica providerKey.
4. API resuelve tenant/config.
5. API valida firma.
6. API calcula payloadHash.
7. API verifica providerEventId idempotente.
8. API extrae providerTransactionId.
9. API valida PaymentIntent.
10. API compara amount/currency.
11. API crea ProviderWebhookEvent.
12. API crea ProviderTransaction.
13. API crea Payment interno.
14. API crea ProviderPaymentMapping.
15. API actualiza PaymentIntent=succeeded.
16. API audita.
17. API responde 2xx.
```

---

### 20.3. Webhook duplicado

```text id="vwm1dl"
1. Proveedor reintenta evento.
2. API valida firma.
3. API detecta providerEventId existente.
4. API marca evento como duplicate o responde idempotentemente.
5. No crea nuevo Payment.
6. No crea nueva ProviderTransaction conciliable.
7. Responde 2xx si ya fue procesado correctamente.
```

---

### 20.4. Webhook inválido

```text id="vi4n73"
1. API recibe evento.
2. Firma ausente o inválida.
3. API registra rechazo sanitizado.
4. No procesa transacción.
5. No crea Payment.
6. Responde error controlado.
7. Audita providerWebhook.rejected.
```

---

## 21. Estados principales

### 21.1. TenantPaymentProviderConfig

```text id="io15ih"
draft -> enabled
enabled -> disabled
disabled -> enabled
draft -> archived
disabled -> archived
enabled -> invalid
invalid -> disabled
invalid -> enabled si test exitoso
enabled -> archived
```

---

### 21.2. PaymentIntent

```text id="v8ue9z"
draft -> created
created -> checkoutCreated
checkoutCreated -> pendingProviderConfirmation
pendingProviderConfirmation -> succeeded
pendingProviderConfirmation -> failed
pendingProviderConfirmation -> cancelled
pendingProviderConfirmation -> expired
succeeded -> reversed futuro/controlado
failed -> archived
cancelled -> archived
expired -> archived
```

---

### 21.3. CheckoutSession

```text id="iz7d46"
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

### 21.4. ProviderWebhookEvent

```text id="qh0f4e"
received -> processing
processing -> processed
received -> rejected
processing -> failed
received -> duplicate
failed -> processing por reproceso autorizado
processed -> archived
rejected -> archived
```

---

### 21.5. ProviderTransaction

```text id="esim1n"
pending -> authorized
authorized -> captured
captured -> succeeded
pending -> succeeded
pending -> failed
pending -> cancelled
pending -> expired
succeeded -> refunded futuro
succeeded -> chargeback futuro
unknown -> requiresReview interno
```

---

### 21.6. ProviderPaymentMapping

```text id="di1ury"
active -> reversed
active -> failed
active -> archived
reversed -> archived
failed -> archived
```

---

## 22. Seguridad

### 22.1. Amenazas prioritarias

```text id="rrxu2w"
- creación de Payment sin evento verificable;
- webhook falso;
- replay attack de webhook;
- duplicación de pagos;
- modificación de amount desde cliente;
- conciliación con cargos de otro tenant;
- filtración de credenciales del proveedor;
- filtración de payload del proveedor;
- filtración de datos de tarjeta;
- checkoutUrl persistente;
- providerTransactionId duplicado;
- uso de provider config de otro tenant;
- endpoint público de payment intent;
- WordPress confirmando pagos;
- IA externa procesando datos reales.
```

---

### 22.2. Controles obligatorios

```text id="b2nrii"
- AuthGuard;
- TenantGuard;
- PermissionGuard;
- OwnResourceGuard;
- ProviderConfigTenantPolicy;
- PaymentIntentOwnershipPolicy;
- PaymentIntentAmountPolicy;
- PaymentIntentItemPolicy;
- WebhookSignaturePolicy;
- WebhookReplayProtectionPolicy;
- WebhookIdempotencyPolicy;
- ProviderTransactionUniquenessPolicy;
- PaymentCreationFromProviderPolicy;
- PaymentProviderSecretPolicy;
- NoCardDataPolicy;
- NoPublicEndpointPolicy;
- AuditPolicy;
- DTO minimization;
- log sanitization;
```

---

### 22.3. Datos prohibidos

```text id="oz5z61"
PAN
CVV
track data
PIN
raw card data
full authorization payload
provider secret
webhook secret
credentialSecret value
webhookSecret value
full signature header in logs
checkoutUrl in logs
storageKey
signedUrl persistente
payload completo del webhook
provider raw payload con datos sensibles
tokens
cookies
Authorization header
SQL raw
stack trace en producción
```

---

## 23. Auditoría

### 23.1. Eventos mínimos

```text id="bd5b5e"
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

### 23.2. Metadata permitida

```text id="nd75du"
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

### 23.3. Metadata prohibida

```text id="t7ar3j"
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

## 24. Observabilidad

### 24.1. Logs sugeridos

```text id="wha2m2"
paymentIntent.created
checkoutSession.created
providerWebhook.received
providerWebhook.verified
providerWebhook.rejected
providerWebhook.duplicate
providerTransaction.succeeded
providerTransaction.failed
payment.createdFromProvider
paymentProviderReport.exported
```

---

### 24.2. Métricas sugeridas

```text id="p0n0xt"
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

### 24.3. Labels permitidos

```text id="dmdnf7"
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

### 24.4. Labels prohibidos

```text id="z42fgv"
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

## 25. OpenAPI extensions

Para endpoints tenant:

```yaml id="p2qxqm"
x-tenant-scope: true
x-auth-required: true
x-payment-provider-integration: true
x-public-exposure: false
```

Para own endpoints:

```yaml id="gg8cw3"
x-own-resource: true
x-auth-required: true
x-payment-provider-integration: true
x-public-exposure: false
```

Para webhooks:

```yaml id="qr2nm2"
x-webhook-endpoint: true
x-provider-signature-required: true
x-idempotent-processing: true
x-public-user-endpoint: false
x-audit-event: providerWebhook.received
```

Para secretos:

```yaml id="vkhgv4"
x-secrets-exposed: false
x-card-data-stored: false
```

OpenAPI no debe documentar rutas públicas funcionales de pago.

---

## 26. Reportes iniciales

### 26.1. Summary

Debe mostrar:

```text id="ymid33"
providerKey
environment
paymentIntentsCreated
paymentIntentsSucceeded
paymentIntentsFailed
grossAmount
feeAmount
netAmount
paymentsCreated
webhooksReceived
webhooksRejected
requiresReviewCount
currency
```

---

### 26.2. Transactions

Debe mostrar:

```text id="gx9fh1"
providerTransactionId
paymentIntentId
paymentId
providerStatus
internalStatus
amount
currency
paymentMethodType
createdAt
processedAt
```

No debe mostrar:

```text id="cmwlmj"
payload completo
secretos
checkoutUrl
datos completos de tarjeta
storageKey
```

---

### 26.3. Failures

Debe mostrar:

```text id="fxu1gz"
paymentIntentId
webhookEventId
errorCode
errorMessage sanitizado
status
createdAt
retryCount
```

---

### 26.4. Settlements

Debe mostrar:

```text id="nxw8jd"
providerSettlementId
settlementDate
grossAmount
feeAmount
netAmount
currency
status
bankAccountId
bankTransactionId
```

---

## 27. Pruebas requeridas

### 27.1. Unit tests

```text id="t7w4m0"
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

### 27.2. Integration tests

```text id="j00at7"
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
```

---

### 27.3. API tests

```text id="m5e3fm"
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

### 27.4. Security tests

```text id="kb7t44"
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

## 28. Criterios de aceptación

### 28.1. Funcionales

```text id="pm5s7g"
- permite registrar provider definitions;
- permite configurar provider por tenant;
- protege credenciales;
- permite habilitar/deshabilitar provider;
- permite crear PaymentIntent;
- permite crear CheckoutSession;
- permite iniciar pago propio;
- permite pagar cargos específicos;
- permite pagar saldo total;
- recibe webhooks;
- valida firmas;
- procesa webhooks idempotentemente;
- registra ProviderWebhookEvent;
- registra ProviderTransaction;
- crea Payment interno ante éxito verificado;
- no crea Payment ante fallo;
- vincula Payment con ProviderTransaction;
- actualiza Account Statement mediante Payments;
- alimenta Bank Reconciliation;
- permite reportes;
- audita operaciones críticas.
```

---

### 28.2. Seguridad

```text id="r3eusv"
- no almacena datos completos de tarjeta;
- no expone secretos;
- no expone webhookSecret;
- no expone credentialSecret;
- no expone checkoutUrl en logs;
- no expone payload completo de webhook;
- no acepta tenantId desde body;
- no permite provider config cross-tenant;
- no permite payment intent cross-tenant;
- no permite charge cross-tenant;
- no crea Payment sin webhook verificado;
- no duplica Payment por webhook repetido;
- no crea endpoints públicos administrativos;
- endpoint webhook requiere firma válida;
- no envía datos reales a IA externa.
```

---

### 28.3. Integridad financiera

```text id="pqvyci"
- monto se calcula en servidor;
- moneda se valida;
- amount mismatch bloquea Payment;
- currency mismatch bloquea Payment;
- Payment se crea una sola vez;
- PaymentAllocation respeta reglas de Payments;
- Account Statements no usan ProviderTransaction como fuente directa;
- Bank Reconciliation puede verificar liquidación posterior;
- reversos/refunds quedan para revisión si aparecen.
```

---

### 28.4. Performance

```text id="fbdpjm"
- intents paginados;
- provider transactions paginadas;
- webhook responde rápido;
- procesamiento pesado puede moverse a job futuro;
- pageSize máximo 100;
- no logs con payloads grandes.
```

---

## 29. Casos borde

| Caso                                             | Resultado esperado      |
| ------------------------------------------------ | ----------------------- |
| Crear PaymentIntent con `tenantId` en body       | 422                     |
| Crear PaymentIntent con amount manual arbitrario | Rechaza o ignora amount |
| Crear PaymentIntent para charge tenant B         | 404/403                 |
| Crear PaymentIntent sin items                    | 422                     |
| Crear PaymentIntent con provider disabled        | 409                     |
| Crear checkout para intent expired               | 409                     |
| Retorno de navegador indica éxito                | No crea Payment         |
| Webhook sin firma                                | 401/403                 |
| Webhook con firma inválida                       | 401/403                 |
| Webhook duplicado                                | No duplica Payment      |
| providerTransactionId repetido                   | No duplica Payment      |
| amount mismatch                                  | requiresReview/rejected |
| currency mismatch                                | requiresReview/rejected |
| provider failed event                            | No crea Payment         |
| provider succeeded event                         | Crea Payment una vez    |
| provider refund event en MVP                     | requiresReview          |
| provider chargeback event en MVP                 | requiresReview          |
| DTO expone secret                                | Falla crítica           |
| Log contiene checkoutUrl                         | Falla crítica           |
| Log contiene raw payload                         | Falla crítica           |
| Se almacena PAN/CVV                              | Falla crítica           |
| Endpoint público de payment intent existe        | Falla crítica           |
| WordPress confirma pago                          | Falla crítica           |

---

## 30. Riesgos

| Riesgo                           |    Impacto | Mitigación                            |
| -------------------------------- | ---------: | ------------------------------------- |
| Webhook falso crea Payment       |    Crítico | firma + server verification           |
| Replay duplica Payment           |    Crítico | idempotencia + unique providerEventId |
| Monto alterado por cliente       |    Crítico | cálculo server-side                   |
| PaymentIntent cross-tenant       |    Crítico | tenant guards                         |
| Charge cross-tenant              |    Crítico | validación de cargos                  |
| Credenciales expuestas           |    Crítico | secret refs + DTO minimization        |
| Datos de tarjeta almacenados     |    Crítico | hosted checkout + no card data        |
| ProviderTransaction duplicada    |       Alto | unique providerTransactionId          |
| Checkout URL filtrada            |       Alto | TTL + no logs                         |
| Payload grande en logs           |       Alto | hash + preview sanitizado             |
| Payment creado sin allocations   | Medio/Alto | Payment service contract              |
| Provider caído                   |      Medio | estados controlados + retry           |
| Webhook llega antes que redirect |     Normal | webhook es fuente de verdad           |
| Redirect llega sin webhook       |     Normal | pendingProviderConfirmation           |
| Reembolso no soportado           |      Medio | requiresReview                        |
| Chargeback no soportado          |       Alto | requiresReview + audit                |
| Reporte incluye tenant B         |    Crítico | tenant-scoped queries                 |

---

## 31. Dependencias futuras

Quedan como futuras specs o extensiones:

```text id="kgcyeb"
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
022-bank-rules-automation
023-advanced-reconciliation
024-financial-closing
025-reconciliation-ai-assistance
026-bank-statement-ocr
027-cash-management
028-multi-currency
029-provider-refunds-disputes
030-recurring-payments
031-payment-links-and-qr
032-electronic-invoicing
```

---

## 32. Preguntas abiertas

```text id="kwqz5w"
1. ¿Qué proveedor real se seleccionará primero para producción?
2. ¿La configuración será por tenant o centralizada por plataforma?
3. ¿Cada tenant tendrá sus propias credenciales?
4. ¿El dinero llegará a cuenta del tenant o a cuenta de plataforma?
5. ¿Se permitirá comisión trasladada al residente?
6. ¿Se cobrará comisión adicional de servicio?
7. ¿Cómo se modelará la comisión del proveedor?
8. ¿Se permitirá pagar múltiples unidades en una sola intención?
9. ¿Se permitirá pago parcial de cargos?
10. ¿Se permitirá pago de saldo total solamente?
11. ¿Se enviará notificación automática por pago exitoso?
12. ¿Qué canal se usará para confirmaciones: email, WhatsApp, portal?
13. ¿Se requiere comprobante PDF generado por RESIDENT?
14. ¿Se requiere integración con facturación electrónica?
15. ¿Cómo se tratarán refunds y chargebacks en fase posterior?
16. ¿Se requiere settlement report del proveedor?
17. ¿Qué relación tendrá settlement con bank reconciliation?
18. ¿Se permitirá QR dinámico por intent?
19. ¿Se permitirá pago anónimo con link?
20. ¿Qué controles adicionales exige el proveedor seleccionado?
```

---

## 33. Decisión MVP recomendada

Para el MVP se recomienda:

```text id="czdlps"
- arquitectura provider-agnostic;
- adapter mock/sandbox primero;
- checkout externo;
- no capturar tarjeta en RESIDENT;
- no almacenar datos de tarjeta;
- credenciales por secret refs;
- PaymentIntent interno;
- PaymentIntentItems;
- CheckoutSession temporal;
- webhook firmado como fuente de verdad;
- idempotencia por providerEventId y providerTransactionId;
- amount/currency validation;
- Payment automático solo con evento succeeded/captured verificado;
- PaymentAllocation según reglas de Payments;
- Account Statement derivado desde Payments;
- Bank Reconciliation posterior para liquidación;
- refunds y chargebacks como requiresReview;
- reportes básicos;
- auditoría estricta;
- no endpoints públicos administrativos;
- no IA con datos reales.
```

---

## 34. Archivos derivados esperados

```text id="u2w8ev"
docs/specs/018-payment-provider-integration/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 35. Resultado esperado

Al finalizar el módulo `018-payment-provider-integration`, RESIDENT Core contará con una base segura para recibir pagos en línea mediante proveedores externos sin asumir procesamiento directo de tarjeta ni almacenar datos sensibles.

Resultado esperado:

```text id="mq7s9d"
- proveedores definidos;
- proveedores configurables por tenant;
- credenciales protegidas;
- payment intents tenant-scoped;
- checkout externo;
- checkoutUrl temporal;
- items de pago trazables;
- cálculo de monto server-side;
- webhooks firmados;
- procesamiento idempotente;
- provider transactions;
- payments creados desde proveedor verificado;
- mappings entre proveedor y Payments;
- estados de cuenta actualizados por Payments;
- conciliación bancaria preparada;
- reportes básicos;
- auditoría financiera;
- logs seguros;
- no card data storage;
- no endpoints públicos administrativos;
- no IA externa con datos reales.
```

---

## 36. Conclusión

`018-payment-provider-integration` debe implementarse como un módulo financiero crítico y altamente controlado.

El valor del módulo está en permitir pagos en línea sin comprometer seguridad, trazabilidad ni integridad financiera.

El MVP debe concentrarse en:

```text id="x31550"
configurar proveedor
crear intención
crear checkout
recibir webhook
validar firma
procesar idempotentemente
crear Payment
auditar
reportar
```

No debe concentrarse todavía en:

```text id="q9z5k0"
captura directa de tarjeta
recurring payments
refunds avanzados
chargebacks avanzados
contabilidad completa
facturación electrónica
Open Banking
IA
pagos anónimos
links públicos permanentes
```
