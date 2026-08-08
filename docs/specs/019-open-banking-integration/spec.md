# Functional Specification — Spec 019 Open Banking Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                                     |
| Spec ID         | 019                                                                                                                                                                                                               |
| Módulo          | Open Banking Integration                                                                                                                                                                                          |
| Documento       | Functional Specification                                                                                                                                                                                          |
| Ruta            | `docs/specs/019-open-banking-integration/spec.md`                                                                                                                                                                 |
| Versión         | 0.1                                                                                                                                                                                                               |
| Estado          | Borrador inicial                                                                                                                                                                                                  |
| Fecha           | 2026-07-23                                                                                                                                                                                                        |
| Depende de      | `001-tenants`, `002-users-roles`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `018-payment-provider-integration`        |
| Relacionado con | banca abierta, agregadores bancarios, autorización bancaria, consentimiento, cuentas bancarias, movimientos bancarios, conciliación bancaria, webhooks bancarios, sincronización, auditoría, seguridad financiera |
| API Style       | REST                                                                                                                                                                                                              |
| Naturaleza      | Tenant-scoped / Consent-driven / Bank-connection-aware / Provider-agnostic / Sync-driven / Transaction-import-aware / Reconciliation-ready / Audit-heavy / Non-public                                             |

---

## 2. Propósito

El módulo `019-open-banking-integration` define la integración futura de RESIDENT Core con proveedores de banca abierta, agregadores financieros o APIs bancarias autorizadas para obtener información bancaria de forma segura y automatizada.

Su propósito principal es permitir que un tenant pueda conectar cuentas bancarias autorizadas y sincronizar información como:

```text id="ubkr28"
- cuentas bancarias disponibles;
- saldos bancarios;
- movimientos bancarios;
- estado de conexión;
- eventos de sincronización;
- errores de proveedor;
- información de liquidaciones;
- datos útiles para conciliación bancaria.
```

Regla central:

```text id="p7wf34"
Toda integración Open Banking debe pertenecer a un tenant, requerir consentimiento explícito, usar proveedores autorizados, proteger tokens y credenciales como secretos, evitar scraping y almacenamiento de credenciales bancarias del usuario, sincronizar información bancaria de forma idempotente, alimentar conciliación bancaria sin reemplazarla, auditar todo acceso y no exponer información financiera en endpoints públicos.
```

---

## 3. Contexto dentro de RESIDENT Core

Hasta este punto, RESIDENT Core ya contempla:

```text id="s1n3wn"
017-bank-reconciliation
  └── importación manual de estados bancarios, movimientos y conciliación

018-payment-provider-integration
  └── pagos en línea mediante proveedor externo y webhooks firmados
```

`019-open-banking-integration` extiende el ecosistema financiero permitiendo que el origen de movimientos bancarios ya no dependa únicamente de archivos CSV/XLSX cargados manualmente.

La relación conceptual es:

```text id="jjpm3n"
Open Banking Provider
  └── Bank Connection
        └── Bank Account Link
              └── Bank Transaction Sync
                    └── Bank Reconciliation
                          └── Payment Matching
                                └── Account Statements / Reports
```

Este módulo no reemplaza a `017-bank-reconciliation`; lo alimenta.

---

## 4. Problema que resuelve

Sin Open Banking, la conciliación bancaria depende de:

```text id="wbxt00"
- descarga manual de estados de cuenta;
- carga manual de CSV/XLSX;
- formatos variables por banco;
- errores humanos;
- duplicados;
- retrasos en conciliación;
- falta de actualización continua;
- dependencia de administradores financieros.
```

Con Open Banking, RESIDENT puede:

```text id="claqca"
- sincronizar movimientos bancarios autorizados;
- reducir carga manual;
- detectar nuevos depósitos;
- mejorar oportunidad de conciliación;
- automatizar candidatos de conciliación;
- identificar pagos provider-verified;
- comparar banco vs Payment interno;
- mejorar reportes financieros;
- reducir errores de transcripción;
- preparar futuras reglas automáticas de conciliación.
```

---

## 5. Objetivo funcional

El sistema debe permitir:

```text id="zl78nn"
- registrar proveedores Open Banking soportados;
- configurar proveedor Open Banking por tenant;
- iniciar flujo de autorización bancaria;
- registrar consentimiento explícito del tenant;
- conectar cuentas bancarias autorizadas;
- mapear cuentas bancarias externas con BankAccount interno;
- sincronizar saldos;
- sincronizar movimientos bancarios;
- normalizar movimientos;
- deduplicar movimientos;
- importar movimientos hacia Bank Reconciliation;
- recibir webhooks del proveedor si existen;
- consultar estado de conexión;
- renovar consentimiento si aplica;
- revocar conexión;
- manejar errores de proveedor;
- auditar accesos y sincronizaciones;
- generar reportes básicos;
- impedir exposición pública de información bancaria;
- proteger tokens, secretos y referencias de cuenta.
```

---

## 6. Alcance incluido en MVP

El MVP de esta especificación se recomienda como una integración **read-only** de información bancaria.

Incluye:

```text id="vpvw4t"
1. Arquitectura provider-agnostic.
2. Catálogo platform de proveedores Open Banking soportados.
3. Configuración tenant de proveedor Open Banking.
4. Flujo de conexión basado en consentimiento.
5. Registro de consentimiento tenant.
6. Registro de bank connections.
7. Registro de bank account links.
8. Mapeo con BankAccount de 017-bank-reconciliation.
9. Tokens y credenciales como SecretRef.
10. No almacenamiento de credenciales bancarias de usuario.
11. No screen scraping en MVP.
12. Sync manual bajo demanda.
13. Sync programado futuro mediante jobs.
14. Sincronización de cuentas.
15. Sincronización de saldos.
16. Sincronización de movimientos.
17. Normalización de movimientos.
18. Dedupe mediante fingerprint.
19. Importación hacia Bank Reconciliation.
20. Estado de sync.
21. Errores de sync.
22. Webhooks bancarios si el proveedor los soporta.
23. Reintentos controlados.
24. Revocación de conexión.
25. Renovación de consentimiento si aplica.
26. Auditoría completa.
27. Logs seguros.
28. Métricas seguras.
29. Reportes básicos.
30. API privada platform, tenant y admin.
31. Sin endpoints públicos administrativos.
32. Sin iniciación de pagos bancarios en MVP.
33. Sin movimientos de dinero desde RESIDENT.
```

---

## 7. Fuera de alcance del MVP

No implementar en esta spec:

```text id="nyed90"
- iniciación de pagos bancarios;
- transferencias desde cuentas bancarias;
- débitos automáticos;
- domiciliación bancaria;
- órdenes de pago;
- pagos a proveedores;
- pagos masivos;
- cuentas escrow;
- sweeping de cuentas;
- tesorería avanzada;
- cash management avanzado;
- crédito o scoring financiero;
- underwriting;
- screen scraping;
- almacenamiento de usuario/clave bancaria;
- almacenamiento de preguntas de seguridad bancaria;
- bypass de MFA bancario;
- automatización de login bancario;
- reversos bancarios;
- conciliación bancaria automática irreversible;
- reglas automáticas avanzadas;
- contabilidad completa;
- asientos contables;
- facturación electrónica;
- integración SRI;
- multi-moneda avanzada;
- IA con datos bancarios reales;
- lectura de cuentas personales de residentes;
- acceso bancario sin consentimiento explícito.
```

---

## 8. Principios de diseño

### 8.1. Consent-driven

Toda conexión bancaria debe estar respaldada por consentimiento explícito.

```text id="kzfkc6"
Sin consentimiento vigente no hay sincronización bancaria.
```

---

### 8.2. Read-only MVP

El MVP solo debe leer información bancaria autorizada.

```text id="vdrom7"
RESIDENT Core no mueve dinero en Open Banking MVP.
```

---

### 8.3. Provider-agnostic

El dominio no debe depender de un proveedor específico.

```text id="m7oj8a"
OpenBankingProviderPort
  ├── MockOpenBankingProviderAdapter
  ├── SandboxOpenBankingProviderAdapter
  ├── AggregatorAdapter futuro
  ├── BankApiAdapter futuro
  └── RegionalProviderAdapter futuro
```

---

### 8.4. No bank credentials storage

RESIDENT no debe almacenar credenciales bancarias de usuario.

Prohibido:

```text id="v4yag2"
usuario bancario
contraseña bancaria
preguntas de seguridad
OTP
MFA secret
token de sesión bancario raw
credenciales de acceso directo del usuario
```

Permitido:

```text id="m2a8vx"
consentId
providerConnectionId
tokenSecretRef
refreshTokenSecretRef si aplica
externalAccountId
externalTransactionId
accountNumberMasked
accountNumberHash
```

---

### 8.5. Bank Reconciliation sigue siendo autoridad operativa

Open Banking provee datos bancarios, pero la conciliación se gobierna en `017-bank-reconciliation`.

```text id="wzaaz2"
Open Banking sincroniza.
Bank Reconciliation concilia.
Payments registra pagos.
Account Statements refleja saldos internos.
```

---

### 8.6. Idempotencia obligatoria

Sincronizar dos veces el mismo movimiento no debe duplicarlo.

Regla:

```text id="axlafj"
Mismo tenant + providerKey + bankConnectionId + externalTransactionId o fingerprint no puede crear dos movimientos conciliables.
```

---

### 8.7. Seguridad financiera reforzada

Toda operación debe auditarse:

```text id="j1fapa"
openBankingProviderDefinition.created
openBankingTenantConfig.created
openBankingConsent.created
openBankingConnection.authorized
openBankingConnection.revoked
openBankingSync.started
openBankingSync.completed
openBankingSync.failed
openBankingTransaction.imported
openBankingTransaction.duplicateDetected
openBankingTransaction.sentToReconciliation
```

---

## 9. Actores

### 9.1. PlatformAdmin

Puede registrar proveedores Open Banking soportados a nivel plataforma.

No accede automáticamente a datos bancarios de tenants.

---

### 9.2. TenantAdmin

Puede habilitar o deshabilitar la integración Open Banking para su tenant si tiene permisos.

---

### 9.3. FinancialManager

Puede configurar conexión bancaria, iniciar autorización, sincronizar movimientos, revisar errores y enviar movimientos a conciliación.

---

### 9.4. Accountant

Puede consultar sincronizaciones, movimientos importados y reportes financieros si tiene permisos.

---

### 9.5. BoardMember

Puede consultar reportes agregados, sin acceso a tokens ni información técnica sensible.

---

### 9.6. PropertyOwner / Resident

No participa directamente en Open Banking MVP.

No puede conectar cuentas bancarias del conjunto ni consultar movimientos bancarios administrativos.

---

### 9.7. OpenBankingProvider

Proveedor externo o agregador autorizado que entrega cuentas, saldos, movimientos y eventos.

---

### 9.8. System

Ejecuta sincronización, normalización, deduplicación, auditoría e integración con Bank Reconciliation.

---

## 10. Definiciones funcionales

### 10.1. Open Banking Provider

Proveedor externo, banco o agregador que permite acceso autorizado a información bancaria.

---

### 10.2. Provider Definition

Proveedor soportado por la plataforma RESIDENT.

---

### 10.3. Tenant Open Banking Config

Configuración de un proveedor Open Banking para un tenant.

---

### 10.4. Bank Consent

Registro del consentimiento otorgado para conectar y leer información bancaria.

---

### 10.5. Bank Connection

Conexión activa o histórica entre un tenant y un proveedor Open Banking.

---

### 10.6. Bank Account Link

Vínculo entre una cuenta externa reportada por el proveedor y una cuenta bancaria interna de RESIDENT.

---

### 10.7. Bank Sync Run

Ejecución de sincronización de cuentas, saldos o movimientos.

---

### 10.8. Open Banking Transaction

Movimiento bancario externo obtenido desde proveedor Open Banking antes o durante su importación hacia Bank Reconciliation.

---

### 10.9. Reconciliation Import Bridge

Proceso que transforma movimientos de Open Banking en movimientos compatibles con `017-bank-reconciliation`.

---

## 11. Entidades conceptuales

### 11.1. OpenBankingProviderDefinition

Representa un proveedor Open Banking soportado.

Campos conceptuales:

```text id="qsvx5l"
id
providerKey
displayName
status
supportedEnvironments
supportedCapabilities
supportedCountries
supportedCurrencies
supportsAccountInfo
supportsBalances
supportsTransactions
supportsWebhooks
supportsConsentRenewal
supportsPaymentInitiation
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
metadata
```

---

### 11.2. TenantOpenBankingConfig

Representa configuración Open Banking para un tenant.

Campos conceptuales:

```text id="l8knxz"
id
tenantId
providerDefinitionId
providerKey
environment
status
displayName
credentialSecretRef
webhookSecretRef
publicConfig
callbackUrl
webhookEndpointPath
allowedOrigins
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

### 11.3. BankConsent

Representa consentimiento para acceso bancario.

Campos conceptuales:

```text id="ntw9mg"
id
tenantId
tenantOpenBankingConfigId
providerKey
providerConsentId
status
scope
consentType
authorizedBy
authorizedAt
expiresAt
renewedAt
revokedAt
revokedBy
revocationReason
termsAcceptedVersion
metadata
createdAt
updatedAt
```

---

### 11.4. BankConnection

Representa una conexión bancaria autorizada.

Campos conceptuales:

```text id="dfcbqi"
id
tenantId
tenantOpenBankingConfigId
bankConsentId
providerKey
providerConnectionId
status
connectionName
institutionName
institutionCode
country
currency
tokenSecretRef
refreshTokenSecretRef
lastSuccessfulSyncAt
lastFailedSyncAt
failureReason
authorizedBy
revokedBy
createdAt
updatedAt
authorizedAt
revokedAt
archivedAt
metadata
```

---

### 11.5. BankAccountLink

Representa una cuenta bancaria externa vinculada a una cuenta interna.

Campos conceptuales:

```text id="gqsvig"
id
tenantId
bankConnectionId
bankAccountId
providerKey
externalAccountId
externalAccountName
externalAccountType
accountNumberMasked
accountNumberHash
currency
status
linkedBy
unlinkedBy
createdAt
updatedAt
linkedAt
unlinkedAt
archivedAt
metadata
```

---

### 11.6. OpenBankingSyncRun

Representa una ejecución de sincronización.

Campos conceptuales:

```text id="r4kql9"
id
tenantId
bankConnectionId
bankAccountLinkId
providerKey
syncType
status
triggerType
periodStart
periodEnd
startedBy
startedAt
completedAt
failedAt
accountsFound
balancesFound
transactionsFound
transactionsImported
transactionsDuplicated
transactionsRejected
errorCode
errorMessage
metadata
```

---

### 11.7. OpenBankingAccountSnapshot

Representa snapshot de cuenta externa.

Campos conceptuales:

```text id="c4nw1p"
id
tenantId
bankConnectionId
bankAccountLinkId
providerKey
externalAccountId
availableBalance
currentBalance
currency
snapshotAt
syncRunId
metadata
```

---

### 11.8. OpenBankingTransaction

Representa movimiento obtenido del proveedor.

Campos conceptuales:

```text id="uye8ss"
id
tenantId
bankConnectionId
bankAccountLinkId
bankAccountId
syncRunId
providerKey
externalTransactionId
transactionDate
postedDate
description
reference
bankReference
direction
amount
currency
balanceAfter
transactionType
status
fingerprint
isDuplicate
duplicateOfTransactionId
sentToReconciliationAt
bankTransactionId
createdAt
updatedAt
metadata
```

---

### 11.9. OpenBankingWebhookEvent

Representa webhook recibido desde proveedor Open Banking.

Campos conceptuales:

```text id="exzkqm"
id
tenantId
tenantOpenBankingConfigId
bankConnectionId
providerKey
providerEventId
eventType
signatureStatus
processingStatus
receivedAt
processedAt
payloadHash
payloadPreview
signatureHeaderHash
errorCode
errorMessage
retryCount
metadata
```

---

## 12. Enums iniciales

### 12.1. OpenBankingProviderDefinitionStatus

```text id="h9ggcv"
draft
active
inactive
deprecated
archived
```

---

### 12.2. OpenBankingEnvironment

```text id="iwmrgw"
sandbox
production
```

---

### 12.3. TenantOpenBankingConfigStatus

```text id="zzfcph"
draft
enabled
disabled
invalid
archived
```

---

### 12.4. BankConsentStatus

```text id="npknsl"
draft
pendingAuthorization
authorized
expired
revoked
failed
archived
```

---

### 12.5. BankConsentScope

```text id="hak2um"
accountsRead
balancesRead
transactionsRead
identityRead
paymentsInitiate
```

MVP recomendado:

```text id="ltmhmm"
accountsRead
balancesRead
transactionsRead
```

---

### 12.6. BankConnectionStatus

```text id="cfc93s"
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

### 12.7. BankAccountLinkStatus

```text id="ri8vua"
pendingLink
linked
unlinked
disabled
archived
```

---

### 12.8. OpenBankingSyncType

```text id="rj5ood"
accounts
balances
transactions
full
```

---

### 12.9. OpenBankingSyncStatus

```text id="k1f9gb"
queued
running
completed
completedWithWarnings
failed
cancelled
archived
```

---

### 12.10. OpenBankingSyncTriggerType

```text id="jh9k4x"
manual
scheduled
webhook
system
```

---

### 12.11. OpenBankingTransactionStatus

```text id="sadgjl"
imported
duplicate
sentToReconciliation
rejected
ignored
requiresReview
archived
```

---

### 12.12. OpenBankingTransactionDirection

```text id="pt3tj4"
credit
debit
neutral
```

---

### 12.13. OpenBankingTransactionType

```text id="k7ln89"
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

### 12.14. OpenBankingWebhookSignatureStatus

```text id="ud3acz"
notVerified
verified
invalid
missing
unsupported
```

---

### 12.15. OpenBankingWebhookProcessingStatus

```text id="os51sl"
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

## 13. Reglas de negocio

### BR-001 — Tenant obligatorio

Toda configuración, consentimiento, conexión, vínculo de cuenta, sync run, snapshot, movimiento y webhook debe pertenecer a un tenant.

---

### BR-002 — No `tenantId` desde body

El cliente nunca debe enviar `tenantId` para crear recursos tenant-scoped.

---

### BR-003 — Provider definition activo

Solo se pueden crear configuraciones tenant sobre proveedores activos.

---

### BR-004 — Configuración habilitada

Solo se pueden iniciar conexiones si `TenantOpenBankingConfig.status = enabled`.

---

### BR-005 — Consentimiento explícito

No se puede sincronizar información bancaria sin consentimiento autorizado y vigente.

---

### BR-006 — Consentimiento trazable

Todo consentimiento debe registrar:

```text id="nyei6j"
authorizedBy
authorizedAt
scope
providerConsentId
expiresAt si aplica
termsAcceptedVersion si aplica
```

---

### BR-007 — Revocación obligatoria

El tenant debe poder revocar una conexión.

---

### BR-008 — No credenciales bancarias

RESIDENT no debe almacenar usuario, contraseña, OTP ni credenciales bancarias de acceso directo.

---

### BR-009 — SecretRef obligatorio para tokens

Tokens de proveedor, refresh tokens o client secrets deben manejarse como SecretRef.

---

### BR-010 — Read-only MVP

MVP solo permite lectura de cuentas, saldos y movimientos.

---

### BR-011 — Payment initiation deshabilitado

El scope `paymentsInitiate` debe estar deshabilitado por defecto.

---

### BR-012 — Cuenta externa debe mapearse

Un movimiento sincronizado debe asociarse a un `BankAccountLink`.

---

### BR-013 — Cuenta interna opcional al inicio

Una cuenta externa puede descubrirse primero y vincularse después a `bank_accounts`.

---

### BR-014 — Vinculación cross-tenant prohibida

`BankAccountLink.bankAccountId` debe pertenecer al mismo tenant.

---

### BR-015 — Movimientos idempotentes

Una sincronización repetida no debe duplicar movimientos.

---

### BR-016 — Fingerprint obligatorio

Todo movimiento debe tener fingerprint determinístico si no existe `externalTransactionId`.

---

### BR-017 — Normalización obligatoria

Movimientos deben normalizar descripción, referencia, fecha, moneda, dirección y monto.

---

### BR-018 — Decimal obligatorio

Montos deben manejarse con Decimal, no float/double.

---

### BR-019 — Moneda MVP

MVP usa `USD`.

---

### BR-020 — Open Banking no crea Payments

Un movimiento bancario sincronizado no crea Payment automáticamente.

---

### BR-021 — Open Banking alimenta Bank Reconciliation

Los movimientos sincronizados deben enviarse o quedar disponibles para `017-bank-reconciliation`.

---

### BR-022 — Conciliación final separada

Sincronizar movimiento no implica conciliación bancaria final.

---

### BR-023 — Payment Provider Settlement

Si el movimiento parece liquidación de proveedor de pago, debe marcarse como candidato o tipo `paymentProviderSettlement`, no conciliarse automáticamente.

---

### BR-024 — Webhooks firmados

Webhooks de Open Banking deben validarse por firma si el proveedor lo soporta.

---

### BR-025 — Replay protection

Eventos repetidos no deben duplicar sync runs ni movimientos.

---

### BR-026 — Logs sanitizados

No registrar tokens, secretos, payloads completos ni números completos de cuenta.

---

### BR-027 — Auditoría obligatoria

Toda conexión, consentimiento, sync, importación, error y revocación debe auditarse.

---

### BR-028 — No endpoints públicos administrativos

No exponer conexiones, cuentas, movimientos ni reportes Open Banking en `/public`.

---

### BR-029 — WordPress sin acceso bancario

WordPress no debe consultar información bancaria ni iniciar sincronizaciones.

---

### BR-030 — IA externa prohibida con datos reales

No enviar movimientos bancarios, tokens, saldos, referencias ni payloads reales a servicios externos de IA en MVP.

---

## 14. Historias de usuario

### US-001 — Registrar proveedor Open Banking

Como PlatformAdmin, quiero registrar un proveedor Open Banking soportado para poder habilitarlo en tenants.

Criterios:

```text id="i36v6v"
- requiere permiso platform;
- providerKey único;
- define capabilities;
- no contiene secretos tenant;
- audita openBankingProviderDefinition.created.
```

---

### US-002 — Configurar proveedor para tenant

Como FinancialManager, quiero configurar un proveedor Open Banking para el conjunto.

Criterios:

```text id="ook87h"
- requiere tenant activo;
- requiere permiso;
- guarda SecretRefs, no secretos;
- status inicial draft o disabled;
- audita tenantOpenBankingConfig.created.
```

---

### US-003 — Iniciar autorización bancaria

Como FinancialManager, quiero iniciar un flujo de autorización bancaria para conectar la cuenta del conjunto.

Criterios:

```text id="smonj6"
- provider config enabled;
- se crea BankConsent pendingAuthorization;
- se genera authorizationUrl temporal si el proveedor lo requiere;
- authorizationUrl no aparece en logs;
- audita bankConsent.authorizationStarted.
```

---

### US-004 — Confirmar conexión bancaria

Como sistema, quiero procesar callback o webhook de autorización exitosa.

Criterios:

```text id="pxpcbc"
- firma o código validado;
- consentimiento pasa a authorized;
- se crea BankConnection active;
- tokens se guardan como SecretRef;
- no se guardan credenciales bancarias;
- audita bankConnection.authorized.
```

---

### US-005 — Sincronizar cuentas

Como FinancialManager, quiero sincronizar cuentas autorizadas.

Criterios:

```text id="vgnpn5"
- consentimiento vigente;
- conexión activa;
- crea SyncRun accounts;
- registra cuentas externas;
- no duplica cuentas;
- audita openBankingSync.completed.
```

---

### US-006 — Vincular cuenta externa con cuenta interna

Como FinancialManager, quiero mapear una cuenta bancaria externa con `BankAccount` interno.

Criterios:

```text id="cmjgmg"
- ambas pertenecen al mismo tenant;
- accountNumberMasked visible;
- accountNumberHash usado para comparación;
- no se expone número completo;
- audita bankAccountLink.linked.
```

---

### US-007 — Sincronizar movimientos

Como FinancialManager, quiero sincronizar movimientos bancarios para conciliarlos.

Criterios:

```text id="pspp6j"
- conexión activa;
- cuenta vinculada;
- periodo válido;
- movimientos normalizados;
- deduplicación por externalTransactionId/fingerprint;
- crea OpenBankingTransaction;
- puede enviar a Bank Reconciliation;
- audita openBankingTransaction.imported.
```

---

### US-008 — Enviar movimientos a conciliación

Como FinancialManager, quiero enviar movimientos sincronizados a Bank Reconciliation.

Criterios:

```text id="y6zcjx"
- movimientos tenant-scoped;
- no duplicados;
- crea o vincula BankTransaction;
- no confirma match automáticamente;
- audita openBankingTransaction.sentToReconciliation.
```

---

### US-009 — Revocar conexión

Como FinancialManager, quiero revocar una conexión bancaria.

Criterios:

```text id="d0f6j9"
- requiere permiso;
- revoca token en proveedor si aplica;
- marca BankConnection revoked;
- marca BankConsent revoked;
- detiene syncs futuros;
- audita bankConnection.revoked.
```

---

### US-010 — Consultar errores de sincronización

Como Accountant, quiero revisar errores de sync.

Criterios:

```text id="joruei"
- tenant-scoped;
- requiere permiso;
- errorMessage sanitizado;
- no expone tokens ni raw payloads;
- permite reintento controlado.
```

---

## 15. Requisitos funcionales

### FR-001 — Gestionar provider definitions

El sistema debe permitir registrar, activar, desactivar, deprecar y archivar proveedores Open Banking a nivel plataforma.

---

### FR-002 — Configurar proveedor por tenant

El sistema debe permitir configurar proveedores Open Banking por tenant.

---

### FR-003 — Manejar SecretRefs

El sistema debe almacenar solo referencias a secretos, no valores sensibles.

---

### FR-004 — Iniciar autorización

El sistema debe permitir iniciar autorización bancaria con proveedor.

---

### FR-005 — Registrar consentimiento

El sistema debe registrar consentimiento explícito, scope, estado y expiración.

---

### FR-006 — Confirmar autorización

El sistema debe confirmar autorización mediante callback/webhook verificable.

---

### FR-007 — Crear conexión bancaria

El sistema debe crear BankConnection al autorizarse.

---

### FR-008 — Revocar conexión

El sistema debe permitir revocar conexión y detener sincronizaciones futuras.

---

### FR-009 — Sincronizar cuentas

El sistema debe sincronizar cuentas externas autorizadas.

---

### FR-010 — Vincular cuenta externa

El sistema debe permitir vincular cuenta externa con `BankAccount` interno.

---

### FR-011 — Sincronizar saldos

El sistema debe sincronizar saldos y registrar snapshots.

---

### FR-012 — Sincronizar movimientos

El sistema debe sincronizar movimientos por periodo.

---

### FR-013 — Normalizar movimientos

El sistema debe normalizar montos, fechas, referencias, descripción y dirección.

---

### FR-014 — Deduplicar movimientos

El sistema debe impedir duplicados mediante externalTransactionId y fingerprint.

---

### FR-015 — Enviar a conciliación

El sistema debe enviar movimientos elegibles a Bank Reconciliation.

---

### FR-016 — Procesar webhooks

El sistema debe recibir y procesar webhooks de proveedor si existen.

---

### FR-017 — Validar webhooks

El sistema debe validar firma/timestamp/idempotencia de webhooks.

---

### FR-018 — Registrar sync runs

Toda sincronización debe registrar inicio, finalización, conteos y errores.

---

### FR-019 — Reintentar sync fallido

El sistema debe permitir reintento controlado de sincronizaciones fallidas.

---

### FR-020 — Reportes

El sistema debe producir reportes básicos de conexiones, syncs, movimientos y errores.

---

### FR-021 — Auditoría

El sistema debe auditar operaciones críticas.

---

### FR-022 — No endpoints públicos

No deben existir endpoints públicos administrativos Open Banking.

---

### FR-023 — No iniciación de pagos

MVP no debe iniciar pagos bancarios ni transferencias.

---

## 16. Requisitos no funcionales

### NFR-001 — Seguridad

Debe cumplir `docs/sdd/security.md`.

---

### NFR-002 — Multitenancy

Toda entidad operativa debe filtrar por `tenantId`.

---

### NFR-003 — Privacidad bancaria

No almacenar credenciales bancarias ni datos innecesarios.

---

### NFR-004 — Idempotencia

Syncs, webhooks e importaciones deben ser idempotentes.

---

### NFR-005 — Integridad financiera

Open Banking no debe crear Payments ni conciliaciones finales automáticas.

---

### NFR-006 — Precisión monetaria

Todos los montos deben usar Decimal.

---

### NFR-007 — Observabilidad segura

Logs y métricas no deben contener tokens, números completos de cuenta ni payloads completos.

---

### NFR-008 — Resiliencia

El sistema debe manejar proveedor caído, token expirado, rate limits y sync parcial.

---

### NFR-009 — Performance

Objetivos iniciales:

```text id="zhp3ha"
p95 < 800 ms para listar conexiones paginadas.
p95 < 1200 ms para iniciar autorización, excluyendo latencia del proveedor.
p95 < 2000 ms para sincronizar cuentas pequeñas, excluyendo latencia del proveedor.
p95 < 5000 ms para sincronizar movimientos mensuales típicos, excluyendo latencia del proveedor.
p95 < 1200 ms para enviar movimientos ya importados a Bank Reconciliation.
```

---

### NFR-010 — API-first

Todas las capacidades deben exponerse mediante REST o puertos internos.

---

## 17. Permisos iniciales

### 17.1. Provider definitions

```text id="wmgasp"
openBankingProviderDefinitions.create
openBankingProviderDefinitions.read
openBankingProviderDefinitions.update
openBankingProviderDefinitions.activate
openBankingProviderDefinitions.deprecate
openBankingProviderDefinitions.archive
```

---

### 17.2. Tenant config

```text id="jsfhum"
tenantOpenBankingConfigs.create
tenantOpenBankingConfigs.read
tenantOpenBankingConfigs.update
tenantOpenBankingConfigs.enable
tenantOpenBankingConfigs.disable
tenantOpenBankingConfigs.testConnection
tenantOpenBankingConfigs.archive
```

---

### 17.3. Consents

```text id="j288ux"
openBankingConsents.create
openBankingConsents.read
openBankingConsents.authorize
openBankingConsents.renew
openBankingConsents.revoke
openBankingConsents.archive
```

---

### 17.4. Connections

```text id="a8n5xr"
openBankingConnections.create
openBankingConnections.read
openBankingConnections.update
openBankingConnections.revoke
openBankingConnections.disable
openBankingConnections.archive
```

---

### 17.5. Account links

```text id="j3cw3e"
openBankingAccountLinks.create
openBankingAccountLinks.read
openBankingAccountLinks.link
openBankingAccountLinks.unlink
openBankingAccountLinks.disable
openBankingAccountLinks.archive
```

---

### 17.6. Sync

```text id="ui4r5e"
openBankingSync.start
openBankingSync.read
openBankingSync.retry
openBankingSync.cancel
openBankingSync.archive
```

---

### 17.7. Transactions

```text id="id4ln0"
openBankingTransactions.read
openBankingTransactions.review
openBankingTransactions.ignore
openBankingTransactions.sendToReconciliation
openBankingTransactions.archive
```

---

### 17.8. Webhooks

```text id="sg3ua2"
openBankingWebhooks.read
openBankingWebhooks.reprocess
openBankingWebhooks.archive
```

---

### 17.9. Reports

```text id="twsdhv"
openBankingReports.read
openBankingReports.export
```

---

### 17.10. Audit

```text id="ljtewn"
openBanking.audit.read
```

---

## 18. API preliminar

### 18.1. Platform — provider definitions

```text id="v09fud"
GET    /api/v1/platform/open-banking-provider-definitions
POST   /api/v1/platform/open-banking-provider-definitions
GET    /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}
PATCH  /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}
POST   /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/activate
POST   /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/deprecate
POST   /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/archive
```

---

### 18.2. Tenant — configs

```text id="dh1z61"
GET    /api/v1/tenant/open-banking/configs
POST   /api/v1/tenant/open-banking/configs
GET    /api/v1/tenant/open-banking/configs/{configId}
PATCH  /api/v1/tenant/open-banking/configs/{configId}
POST   /api/v1/tenant/open-banking/configs/{configId}/enable
POST   /api/v1/tenant/open-banking/configs/{configId}/disable
POST   /api/v1/tenant/open-banking/configs/{configId}/test-connection
POST   /api/v1/tenant/open-banking/configs/{configId}/archive
```

---

### 18.3. Tenant — consents

```text id="j2yqxm"
GET    /api/v1/tenant/open-banking/consents
POST   /api/v1/tenant/open-banking/consents
GET    /api/v1/tenant/open-banking/consents/{consentId}
POST   /api/v1/tenant/open-banking/consents/{consentId}/start-authorization
POST   /api/v1/tenant/open-banking/consents/{consentId}/renew
POST   /api/v1/tenant/open-banking/consents/{consentId}/revoke
POST   /api/v1/tenant/open-banking/consents/{consentId}/archive
```

---

### 18.4. Tenant — connections

```text id="z7q6a9"
GET    /api/v1/tenant/open-banking/connections
GET    /api/v1/tenant/open-banking/connections/{connectionId}
PATCH  /api/v1/tenant/open-banking/connections/{connectionId}
POST   /api/v1/tenant/open-banking/connections/{connectionId}/revoke
POST   /api/v1/tenant/open-banking/connections/{connectionId}/disable
POST   /api/v1/tenant/open-banking/connections/{connectionId}/archive
```

---

### 18.5. Tenant — account links

```text id="chq6cy"
GET    /api/v1/tenant/open-banking/account-links
POST   /api/v1/tenant/open-banking/account-links
GET    /api/v1/tenant/open-banking/account-links/{accountLinkId}
POST   /api/v1/tenant/open-banking/account-links/{accountLinkId}/link-bank-account
POST   /api/v1/tenant/open-banking/account-links/{accountLinkId}/unlink-bank-account
POST   /api/v1/tenant/open-banking/account-links/{accountLinkId}/disable
POST   /api/v1/tenant/open-banking/account-links/{accountLinkId}/archive
```

---

### 18.6. Tenant — sync

```text id="qjxnoi"
GET    /api/v1/tenant/open-banking/sync-runs
POST   /api/v1/tenant/open-banking/connections/{connectionId}/sync
GET    /api/v1/tenant/open-banking/sync-runs/{syncRunId}
POST   /api/v1/tenant/open-banking/sync-runs/{syncRunId}/retry
POST   /api/v1/tenant/open-banking/sync-runs/{syncRunId}/cancel
POST   /api/v1/tenant/open-banking/sync-runs/{syncRunId}/archive
```

---

### 18.7. Tenant — snapshots and transactions

```text id="lhvvul"
GET    /api/v1/tenant/open-banking/account-snapshots
GET    /api/v1/tenant/open-banking/transactions
GET    /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}
POST   /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/send-to-reconciliation
POST   /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/ignore
POST   /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/archive
```

---

### 18.8. Tenant — webhooks

```text id="z2bgnd"
GET    /api/v1/tenant/open-banking/webhook-events
GET    /api/v1/tenant/open-banking/webhook-events/{webhookEventId}
POST   /api/v1/tenant/open-banking/webhook-events/{webhookEventId}/reprocess
POST   /api/v1/tenant/open-banking/webhook-events/{webhookEventId}/archive
```

---

### 18.9. Webhook endpoint

```text id="gh695q"
POST   /api/v1/webhooks/open-banking/{providerKey}
```

Regla:

```text id="wjcsph"
El endpoint de webhook no es público funcional para usuarios. Debe aceptar únicamente eventos firmados y verificables del proveedor.
```

---

### 18.10. Reports

```text id="fh0y6c"
GET    /api/v1/tenant/open-banking/reports/summary
GET    /api/v1/tenant/open-banking/reports/sync-status
GET    /api/v1/tenant/open-banking/reports/imported-transactions
GET    /api/v1/tenant/open-banking/reports/errors
GET    /api/v1/tenant/open-banking/reports/export
```

---

### 18.11. Endpoints públicos prohibidos

No crear:

```text id="qydtk8"
GET  /api/v1/public/open-banking
GET  /api/v1/public/open-banking/connections
GET  /api/v1/public/open-banking/accounts
GET  /api/v1/public/open-banking/transactions
GET  /api/v1/public/open-banking/reports
POST /api/v1/public/open-banking/connect
POST /api/v1/public/open-banking/sync
GET  /api/v1/public/tenants/{slug}/open-banking
```

---

## 19. Integraciones

### 19.1. `017-bank-reconciliation`

Uso principal:

```text id="d40tdy"
- recibir movimientos sincronizados;
- crear BankTransaction desde OpenBankingTransaction;
- evitar duplicados;
- mantener conciliación manual/asistida;
- generar candidatos de conciliación;
- no confirmar matches automáticamente.
```

---

### 19.2. `005-payments`

Uso:

```text id="vfqbvj"
- comparar movimientos sincronizados con Payments existentes;
- identificar pagos no conciliados;
- identificar pagos provider-verified;
- no crear Payment automáticamente desde Open Banking.
```

---

### 19.3. `018-payment-provider-integration`

Uso:

```text id="dzguln"
- identificar settlements de proveedor;
- cruzar ProviderSettlementRecord con movimientos bancarios sincronizados;
- verificar netAmount/grossAmount;
- alimentar conciliación posterior.
```

---

### 19.4. `006-account-statements`

Uso:

```text id="r4spj1"
- los saldos internos siguen derivando desde cargos/pagos;
- Open Banking no modifica Account Statements directamente;
- reportes pueden mostrar diferencia entre saldo interno y saldo bancario.
```

---

### 19.5. `016-secure-document-storage`

Uso:

```text id="dticwe"
- almacenar contratos/consent evidence si aplica;
- almacenar exports de reportes;
- no almacenar tokens ni payloads completos como documentos ordinarios;
- proteger storageKey.
```

---

### 19.6. `007-audit`

Uso:

```text id="t6iodr"
- auditar definición de proveedor;
- auditar configuración;
- auditar consentimiento;
- auditar conexión;
- auditar sync;
- auditar movimientos;
- auditar importación a conciliación;
- auditar errores;
- auditar revocaciones.
```

---

### 19.7. `008-basic-reports`

Uso:

```text id="fzw9iw"
- reportes de sync;
- reportes de movimientos importados;
- reportes de errores;
- reportes de estado de conexiones;
- reportes de diferencias banco vs sistema.
```

---

## 20. Flujo funcional principal

### 20.1. Configuración inicial

```text id="y2kovd"
1. PlatformAdmin registra OpenBankingProviderDefinition.
2. PlatformAdmin activa proveedor.
3. FinancialManager crea TenantOpenBankingConfig.
4. FinancialManager configura SecretRefs.
5. FinancialManager prueba conexión.
6. FinancialManager habilita configuración.
```

---

### 20.2. Autorización bancaria

```text id="z0chtd"
1. FinancialManager crea BankConsent.
2. Sistema inicia autorización con proveedor.
3. Proveedor devuelve authorizationUrl o flujo equivalente.
4. FinancialManager completa autorización en proveedor.
5. Proveedor retorna callback o webhook.
6. Sistema valida evento.
7. Sistema marca consentimiento authorized.
8. Sistema crea BankConnection active.
9. Sistema guarda tokens como SecretRef.
10. Sistema audita.
```

---

### 20.3. Sincronización de movimientos

```text id="oxtjm5"
1. FinancialManager inicia sync.
2. Sistema valida conexión activa.
3. Sistema valida consentimiento vigente.
4. Sistema crea OpenBankingSyncRun.
5. Adapter consulta movimientos al proveedor.
6. Sistema normaliza movimientos.
7. Sistema calcula fingerprint.
8. Sistema detecta duplicados.
9. Sistema persiste OpenBankingTransaction.
10. Sistema actualiza conteos.
11. Sistema audita resultado.
```

---

### 20.4. Envío a conciliación

```text id="bar46r"
1. FinancialManager selecciona movimientos importados.
2. Sistema valida tenant y estado.
3. Sistema crea o vincula BankTransaction en 017.
4. Sistema marca OpenBankingTransaction sentToReconciliation.
5. Bank Reconciliation genera candidatos.
6. Usuario autorizado confirma matches.
```

---

### 20.5. Revocación

```text id="lhdspd"
1. FinancialManager solicita revocación.
2. Sistema llama al proveedor si aplica.
3. Sistema invalida SecretRefs o marca conexión revoked.
4. Sistema marca consentimiento revoked.
5. Sistema bloquea syncs futuros.
6. Sistema audita.
```

---

## 21. Estados principales

### 21.1. OpenBankingProviderDefinition

```text id="zf7wy2"
draft -> active
active -> inactive
inactive -> active
active -> deprecated
deprecated -> inactive
draft -> archived
inactive -> archived
deprecated -> archived
active -> archived
```

---

### 21.2. TenantOpenBankingConfig

```text id="w0g8gl"
draft -> enabled
draft -> disabled
enabled -> disabled
disabled -> enabled
enabled -> invalid
invalid -> disabled
invalid -> enabled si test exitoso
draft -> archived
disabled -> archived
invalid -> archived
enabled -> archived
```

---

### 21.3. BankConsent

```text id="xm418t"
draft -> pendingAuthorization
pendingAuthorization -> authorized
pendingAuthorization -> failed
authorized -> expired
authorized -> revoked
expired -> pendingAuthorization por renovación
revoked -> archived
failed -> archived
expired -> archived
```

---

### 21.4. BankConnection

```text id="tr2hm5"
pendingAuthorization -> active
active -> syncing
syncing -> active
active -> reauthorizationRequired
active -> failed
failed -> active si recuperación exitosa
active -> revoked
active -> disabled
disabled -> active
revoked -> archived
disabled -> archived
failed -> archived
```

---

### 21.5. BankAccountLink

```text id="pg6y14"
pendingLink -> linked
linked -> unlinked
linked -> disabled
disabled -> linked
unlinked -> linked
linked -> archived
unlinked -> archived
disabled -> archived
```

---

### 21.6. OpenBankingSyncRun

```text id="h2qn0p"
queued -> running
running -> completed
running -> completedWithWarnings
running -> failed
queued -> cancelled
running -> cancelled
completed -> archived
completedWithWarnings -> archived
failed -> queued por retry
failed -> archived
```

---

### 21.7. OpenBankingTransaction

```text id="u8dpoe"
imported -> sentToReconciliation
imported -> duplicate
imported -> rejected
imported -> ignored
imported -> requiresReview
requiresReview -> sentToReconciliation
duplicate -> archived
ignored -> archived
rejected -> archived
sentToReconciliation -> archived
```

---

## 22. Seguridad

### 22.1. Amenazas prioritarias

```text id="b4dhfv"
- conexión bancaria sin consentimiento;
- sync con token expirado o robado;
- exposición de tokens;
- almacenamiento de credenciales bancarias;
- screen scraping inseguro;
- movimientos duplicados;
- movimiento bancario tenant B importado en tenant A;
- bankAccount externo vinculado a bankAccount interno de otro tenant;
- creación automática de Payment desde movimiento bancario;
- conciliación automática irreversible;
- exposición de saldos bancarios;
- webhook falso;
- payload bancario completo en logs;
- WordPress consultando movimientos;
- IA externa procesando movimientos reales.
```

---

### 22.2. Controles obligatorios

```text id="zrdaw3"
- AuthGuard;
- TenantGuard;
- PermissionGuard;
- OpenBankingConsentPolicy;
- OpenBankingProviderConfigPolicy;
- OpenBankingTokenPolicy;
- BankConnectionTenantPolicy;
- BankAccountLinkTenantPolicy;
- BankSyncPolicy;
- OpenBankingTransactionDedupePolicy;
- OpenBankingWebhookSignaturePolicy;
- NoBankCredentialStoragePolicy;
- NoPaymentInitiationPolicy;
- NoPublicEndpointPolicy;
- AuditSanitizationPolicy;
- LogSanitizationPolicy;
- NoExternalAiBankDataPolicy;
```

---

### 22.3. Datos prohibidos

```text id="vg6c0r"
usuario bancario
contraseña bancaria
OTP
MFA secret
preguntas de seguridad
token raw
refresh token raw
client secret raw
webhook secret raw
número completo de cuenta
payload completo del proveedor
Authorization header
cookies
tokens
storageKey
signedUrl persistente
SQL raw
stack trace en producción
```

---

## 23. Auditoría

### 23.1. Eventos mínimos

```text id="tuxlc8"
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

### 23.2. Metadata permitida

```text id="fsi3xh"
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

### 23.3. Metadata prohibida

```text id="cb8uie"
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

## 24. Observabilidad

### 24.1. Logs sugeridos

```text id="md2pq1"
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

---

### 24.2. Métricas sugeridas

```text id="h2jb0v"
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

---

### 24.3. Labels permitidos

```text id="r7sxxr"
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

---

### 24.4. Labels prohibidos

```text id="r5wsjh"
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

## 25. OpenAPI extensions

Para endpoints platform:

```yaml id="n2jk37"
x-platform-scope: true
x-auth-required: true
x-open-banking-integration: true
x-secrets-exposed: false
```

Para endpoints tenant:

```yaml id="i0tj9y"
x-tenant-scope: true
x-auth-required: true
x-open-banking-integration: true
x-bank-data: true
x-public-exposure: false
x-secrets-exposed: false
```

Para endpoints de consentimiento:

```yaml id="ly3aqm"
x-consent-required: true
x-consent-audited: true
x-bank-credential-storage: false
```

Para webhooks:

```yaml id="dt5q18"
x-webhook-endpoint: true
x-provider-signature-required: true
x-idempotent-processing: true
x-public-user-endpoint: false
x-audit-event: openBankingWebhook.received
```

Para sync:

```yaml id="h8oy89"
x-sync-operation: true
x-idempotent-processing: true
x-reconciliation-ready: true
```

---

## 26. Reportes iniciales

### 26.1. Summary

Debe mostrar:

```text id="uukkk8"
providerKey
environment
activeConnections
authorizedConsents
revokedConsents
syncRuns
failedSyncRuns
transactionsImported
transactionsDuplicated
transactionsSentToReconciliation
lastSuccessfulSyncAt
lastFailedSyncAt
```

---

### 26.2. Sync status

Debe mostrar:

```text id="frqhfv"
bankConnectionId
connectionName
institutionName
status
lastSuccessfulSyncAt
lastFailedSyncAt
failureReason sanitizado
reauthorizationRequired
```

---

### 26.3. Imported transactions

Debe mostrar:

```text id="tld4v2"
openBankingTransactionId
bankAccountLinkId
bankAccountId
transactionDate
description sanitizada
reference sanitizada
direction
amount
currency
status
bankTransactionId
sentToReconciliationAt
```

---

### 26.4. Errors

Debe mostrar:

```text id="qlqw5a"
syncRunId
providerKey
syncType
errorCode
errorMessage sanitizado
failedAt
retryCount
```

---

## 27. Pruebas requeridas

### 27.1. Unit tests

```text id="l9k5o2"
OpenBankingProviderDefinition entity
TenantOpenBankingConfig entity
BankConsent entity
BankConnection entity
BankAccountLink entity
OpenBankingSyncRun entity
OpenBankingTransaction entity
OpenBankingWebhookEvent entity
SecretRef value object
BankAccountNumberMasked value object
BankAccountNumberHash value object
OpenBankingTransactionFingerprint value object
ProviderStatusMapper
SyncStatusMapper
```

---

### 27.2. Integration tests

```text id="ay2v72"
provider adapter mock
tenant config SecretRef
consent authorization flow
connection creation
account discovery
account link to BankAccount
balance snapshot sync
transaction sync
deduplication
send to Bank Reconciliation
webhook verification
webhook idempotency
audit integration
report integration
secure document export
```

---

### 27.3. API tests

```text id="zly2hr"
platform provider definition CRUD/state transitions
tenant config CRUD/state transitions
consent create/start/renew/revoke
connection list/get/revoke/disable/archive
account link list/link/unlink/archive
sync start/retry/cancel/archive
transaction list/get/send-to-reconciliation/ignore/archive
webhook receive verified
webhook reject invalid signature
reports summary/sync/errors/export
```

---

### 27.4. Security tests

```text id="t5msq4"
no tenantId body
no cross-tenant config
no cross-tenant consent
no cross-tenant connection
no cross-tenant account link
no cross-tenant transaction
no cross-tenant bankAccount link
no bank credentials stored
no raw tokens in DB
no raw tokens in DTO
no raw provider payload in logs
no full account number exposed
no Payment created from Open Banking transaction
no bank reconciliation final auto-confirmed
no public endpoints
WordPress cannot access bank data
external AI disabled
```

---

## 28. Criterios de aceptación

### 28.1. Funcionales

```text id="kbd3si"
- permite provider definitions platform;
- permite tenant Open Banking config;
- protege SecretRefs;
- permite crear consentimiento;
- permite iniciar autorización;
- permite confirmar conexión;
- registra BankConnection;
- descubre cuentas externas;
- permite vincular cuenta externa con BankAccount;
- sincroniza saldos;
- sincroniza movimientos;
- deduplica movimientos;
- envía movimientos a Bank Reconciliation;
- no crea Payments automáticamente;
- permite revocar conexión;
- permite consultar sync runs;
- permite reportes;
- audita operaciones críticas.
```

---

### 28.2. Seguridad

```text id="y189yo"
- no almacena credenciales bancarias;
- no almacena tokens raw;
- no expone SecretRefs en superficies no autorizadas;
- no expone número completo de cuenta;
- no expone payload completo;
- no acepta tenantId desde body;
- no permite cross-tenant references;
- no inicia pagos bancarios;
- no crea Payment automáticamente;
- no marca conciliación final automáticamente;
- webhook requiere firma si el proveedor la soporta;
- no endpoints públicos administrativos;
- no WordPress bank access;
- no IA externa con datos reales.
```

---

### 28.3. Integridad financiera

```text id="eh171i"
- movimientos sincronizados son solo evidencia bancaria;
- Payment interno sigue siendo fuente de pagos;
- Account Statements no se actualiza directamente desde Open Banking;
- Bank Reconciliation confirma matches;
- movimientos duplicados no se vuelven conciliables dos veces;
- settlements de proveedor se tratan como candidatos, no como verdad final automática.
```

---

### 28.4. Performance

```text id="atjqei"
- sync paginado si provider lo permite;
- pageSize máximo 100 en consultas API;
- deduplicación indexada;
- no N+1 evidente;
- no payloads completos en logs;
- sync pesado puede moverse a jobs.
```

---

## 29. Casos borde

| Caso                                               | Resultado esperado                                 |
| -------------------------------------------------- | -------------------------------------------------- |
| Crear config con `tenantId` en body                | 422                                                |
| Iniciar consentimiento sin provider enabled        | 409                                                |
| Sync sin consentimiento vigente                    | 409                                                |
| Sync con conexión revoked                          | 409                                                |
| Vincular external account con BankAccount tenant B | 404/403                                            |
| Webhook sin firma                                  | Rechaza si firma requerida                         |
| Webhook duplicado                                  | No duplica sync ni movimientos                     |
| Movimiento sin externalTransactionId               | Usa fingerprint                                    |
| Movimiento duplicado por fingerprint               | Marca duplicate                                    |
| Token expirado                                     | connection reauthorizationRequired                 |
| Provider timeout                                   | sync failed con error sanitizado                   |
| Revocar conexión                                   | Detiene sync futuro                                |
| Movimiento Open Banking similar a Payment          | No crea Payment automático                         |
| Movimiento enviado a conciliación                  | Crea/vincula BankTransaction, sin match automático |
| Reporte incluye tenant B                           | Falla crítica                                      |
| Log contiene token                                 | Falla crítica                                      |
| Log contiene número completo de cuenta             | Falla crítica                                      |
| WordPress consulta movimientos                     | Falla crítica                                      |
| IA externa procesa movimientos reales              | Falla crítica                                      |

---

## 30. Riesgos

| Riesgo                             | Impacto | Mitigación                          |
| ---------------------------------- | ------: | ----------------------------------- |
| Conexión sin consentimiento        | Crítico | Consent policy + audit              |
| Token expuesto                     | Crítico | SecretRef + log sanitization        |
| Credenciales bancarias almacenadas | Crítico | NoBankCredentialStoragePolicy       |
| Movimiento duplicado               |    Alto | externalTransactionId + fingerprint |
| Cross-tenant bank account link     | Crítico | tenant validation                   |
| Payment creado automáticamente     | Crítico | prohibición explícita               |
| Conciliación final automática      | Crítico | Bank Reconciliation authority       |
| Payload bancario en logs           |    Alto | payloadHash + preview               |
| Webhook falso                      |    Alto | signature verification              |
| Provider rate limit                |   Medio | retry/backoff                       |
| Consentimiento expirado            |   Medio | reauthorizationRequired             |
| Datos bancarios en WordPress       | Crítico | no public endpoints                 |
| IA externa con datos reales        | Crítico | feature flag false                  |

---

## 31. Dependencias futuras

Quedan como futuras specs o extensiones:

```text id="k3k7b0"
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
033-open-banking-payment-initiation
034-bank-consent-compliance
035-treasury-management
```

---

## 32. Preguntas abiertas

```text id="kh4kss"
1. ¿Existe proveedor Open Banking o agregador viable para el mercado objetivo inicial?
2. ¿La integración será directa con bancos o vía agregador?
3. ¿La conexión será por tenant o por plataforma?
4. ¿Quién otorgará consentimiento en nombre del conjunto?
5. ¿Qué documento respalda la autorización del tenant?
6. ¿Qué vigencia tendrá el consentimiento?
7. ¿Se requiere aprobación de directorio o administrador?
8. ¿Qué bancos se priorizarán?
9. ¿Se sincronizarán todas las cuentas o solo cuentas marcadas?
10. ¿Se permitirá sync programado en MVP?
11. ¿Qué frecuencia máxima de sync se permitirá?
12. ¿Cómo se manejarán rate limits?
13. ¿Se guardarán snapshots diarios de saldo?
14. ¿Cuánto tiempo se retendrán movimientos Open Banking?
15. ¿Qué ocurre si proveedor elimina o modifica un movimiento histórico?
16. ¿Se permitirá payment initiation en fase futura?
17. ¿Qué controles regulatorios específicos aplican al país objetivo?
18. ¿Qué evidencias legales de consentimiento deben almacenarse?
19. ¿Qué módulos pueden consultar saldo bancario?
20. ¿Qué reportes se compartirán con BoardMember?
```

---

## 33. Decisión MVP recomendada

Para el MVP se recomienda:

```text id="sgf9oi"
- arquitectura provider-agnostic;
- adapter mock/sandbox primero;
- read-only account information;
- no payment initiation;
- no screen scraping;
- no credenciales bancarias de usuario;
- SecretRef para tokens;
- consentimiento explícito;
- conexión bancaria tenant-scoped;
- account links con BankAccount interno;
- sync manual de cuentas/saldos/movimientos;
- deduplicación por externalTransactionId/fingerprint;
- importación hacia Bank Reconciliation;
- no creación automática de Payment;
- no conciliación automática final;
- reportes básicos;
- auditoría estricta;
- logs seguros;
- no endpoints públicos administrativos;
- no WordPress bank access;
- no IA externa con datos reales.
```

---

## 34. Archivos derivados esperados

```text id="r96b5e"
docs/specs/019-open-banking-integration/
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

Al finalizar el módulo `019-open-banking-integration`, RESIDENT Core contará con una base segura y extensible para integrar información bancaria autorizada.

Resultado esperado:

```text id="b4tdkn"
- proveedores Open Banking definidos;
- configuración por tenant;
- SecretRef strategy;
- consentimiento explícito;
- conexiones bancarias autorizadas;
- cuentas externas descubiertas;
- cuentas externas vinculadas con BankAccount interno;
- saldos sincronizados;
- movimientos sincronizados;
- movimientos normalizados;
- movimientos deduplicados;
- movimientos enviados a Bank Reconciliation;
- webhooks bancarios verificables;
- sync runs auditables;
- reportes básicos;
- revocación de conexión;
- reautorización controlada;
- no credenciales bancarias almacenadas;
- no payment initiation en MVP;
- no Payments creados automáticamente;
- no conciliación final automática;
- no endpoints públicos administrativos;
- no WordPress bank access;
- no IA externa con datos reales.
```

---

## 36. Conclusión

`019-open-banking-integration` debe implementarse como un módulo financiero de alta sensibilidad.

Su valor principal es reducir la dependencia de cargas manuales de estados bancarios y mejorar la oportunidad de conciliación.

El MVP debe concentrarse en:

```text id="pdgcii"
provider definitions
tenant config
consentimiento
conexión bancaria
sync de cuentas
sync de saldos
sync de movimientos
deduplicación
envío a conciliación
auditoría
seguridad
```

No debe concentrarse todavía en:

```text id="yavzar"
iniciación de pagos
débitos automáticos
screen scraping
almacenamiento de credenciales bancarias
conciliación automática irreversible
tesorería avanzada
contabilidad completa
IA con datos reales
```
