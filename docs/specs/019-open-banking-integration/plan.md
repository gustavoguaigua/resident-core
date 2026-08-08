# Plan — Spec 019 Open Banking Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                              |
| Spec ID         | 019                                                                                                                                                                                                        |
| Módulo          | Open Banking Integration                                                                                                                                                                                   |
| Documento       | Plan técnico                                                                                                                                                                                               |
| Ruta            | `docs/specs/019-open-banking-integration/plan.md`                                                                                                                                                          |
| Versión         | 0.1                                                                                                                                                                                                        |
| Estado          | Borrador inicial                                                                                                                                                                                           |
| Fecha           | 2026-07-23                                                                                                                                                                                                 |
| Documento base  | `docs/specs/019-open-banking-integration/spec.md`                                                                                                                                                          |
| Depende de      | `001-tenants`, `002-users-roles`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `018-payment-provider-integration` |
| Relacionado con | banca abierta, agregadores bancarios, consentimiento, conexiones bancarias, cuentas externas, saldos, movimientos, sincronización, conciliación bancaria, auditoría                                        |
| API Style       | REST                                                                                                                                                                                                       |
| Arquitectura    | Monolito modular preparado para microservicios                                                                                                                                                             |
| Stack objetivo  | NestJS, TypeScript, PostgreSQL, Prisma, Decimal, OpenAPI, Keycloak/OIDC, Docker, Secure Document Storage, SecretRef                                                                                        |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `019-open-banking-integration`.

El módulo permitirá conectar RESIDENT Core con proveedores de banca abierta, agregadores financieros o APIs bancarias autorizadas para leer cuentas, saldos y movimientos bancarios con consentimiento explícito del tenant, sin almacenar credenciales bancarias, sin iniciar pagos en MVP y sin reemplazar la conciliación bancaria.

Regla central:

```text id="qgzmz6"
Open Banking Integration debe operar como módulo financiero tenant-scoped, consent-driven, read-only en MVP, provider-agnostic, token-safe, sync-driven, idempotent, reconciliation-ready, audit-heavy y sin endpoints públicos administrativos.
```

---

## 3. Decisión técnica inicial

### 3.1. Nombre técnico del módulo

```text id="w6sclg"
open-banking-integration
```

---

### 3.2. Ruta sugerida

```text id="wgsd4l"
apps/api/src/modules/open-banking-integration/
```

---

### 3.3. Tipo de módulo

```text id="c6k9ls"
Financial integration module
Tenant-scoped
Consent-driven
Provider-agnostic
Read-only MVP
Bank-connection-aware
Sync-driven
Transaction-import-aware
Reconciliation-ready
Token-safe
Audit-heavy
Non-public administrative surface
```

---

### 3.4. Estilo arquitectónico

El módulo seguirá el estilo general de RESIDENT Core:

```text id="mpn5sa"
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
SecretRef para tokens y credenciales
Secure Document Storage para evidencias/exports
webhooks firmados si el proveedor los soporta
idempotencia fuerte
auditoría financiera obligatoria
observabilidad segura
preparado para adapters reales futuros
```

---

## 4. Decisión MVP

Para MVP se implementará una base **read-only** y **provider-agnostic**.

Incluye:

```text id="szdne1"
- arquitectura provider-agnostic;
- adapter mock/sandbox;
- catálogo platform de proveedores Open Banking;
- configuración Open Banking por tenant;
- gestión de SecretRef para credenciales/tokens;
- no almacenamiento de credenciales bancarias;
- creación de consentimiento;
- inicio de flujo de autorización;
- confirmación de autorización mediante callback/webhook simulado;
- creación de BankConnection;
- descubrimiento de cuentas externas;
- creación de BankAccountLink;
- vínculo de cuenta externa con BankAccount interno;
- sincronización manual de cuentas;
- sincronización manual de saldos;
- sincronización manual de movimientos;
- normalización de movimientos;
- fingerprint de movimientos;
- deduplicación;
- registro de OpenBankingSyncRun;
- registro de OpenBankingTransaction;
- envío manual/controlado a Bank Reconciliation;
- webhooks bancarios si el adapter lo soporta;
- reintentos controlados;
- revocación de conexión;
- reportes básicos;
- auditoría completa;
- observabilidad segura;
- OpenAPI privado;
- cero endpoints públicos administrativos;
- cero payment initiation;
- cero screen scraping;
- cero IA externa con datos reales.
```

---

## 5. Fuera de alcance técnico MVP

No implementar en esta spec:

```text id="f1wjew"
- iniciación de pagos bancarios;
- transferencias desde cuentas bancarias;
- débitos automáticos;
- domiciliación bancaria;
- órdenes de pago;
- pagos a proveedores;
- pagos masivos;
- treasury management avanzado;
- cash sweeping;
- cuentas escrow;
- créditos;
- scoring financiero;
- underwriting;
- screen scraping;
- almacenamiento de usuario bancario;
- almacenamiento de contraseña bancaria;
- almacenamiento de OTP;
- almacenamiento de MFA secret;
- bypass de MFA;
- automatización de login bancario;
- reversos bancarios;
- conciliación bancaria automática irreversible;
- reglas automáticas avanzadas;
- contabilidad completa;
- asientos contables;
- facturación electrónica;
- integración SRI;
- multi-moneda avanzada;
- lectura de cuentas personales de residentes;
- IA con datos bancarios reales;
- Open Banking payment initiation.
```

---

## 6. Dependencias funcionales

### 6.1. `001-tenants`

Uso:

```text id="wvjq7n"
- validar tenant activo;
- aplicar tenant_id a configs, consents, connections, account links, sync runs, snapshots, transactions y webhooks;
- impedir conexiones cross-tenant;
- impedir account links cross-tenant;
- impedir reportes cross-tenant;
- bloquear operaciones si tenant está suspended/archived.
```

---

### 6.2. `002-users-roles`

Uso:

```text id="eyhc2x"
- validar usuario autenticado;
- validar membership activa;
- validar permisos financieros;
- validar permisos platform para provider definitions;
- auditar actor real;
- impedir acceso automático de PlatformAdmin a datos bancarios tenant;
- controlar revocación, sync y export mediante permisos específicos.
```

---

### 6.3. `005-payments`

Uso:

```text id="jy5gbb"
- comparar movimientos sincronizados con Payments existentes;
- identificar Payments no conciliados;
- identificar Payments provider-verified desde 018;
- exponer pagos como candidatos de conciliación;
- no crear Payment automáticamente desde Open Banking.
```

Regla:

```text id="xo8pnu"
Open Banking no crea Payments en MVP.
```

---

### 6.4. `006-account-statements`

Uso:

```text id="ezodqk"
- mostrar diferencias entre saldo bancario sincronizado y saldo interno si aplica;
- mantener Account Statements derivados desde cargos/pagos internos;
- impedir que Open Banking modifique saldos internos directamente.
```

Regla:

```text id="yi3510"
Open Banking no actualiza Account Statements directamente.
```

---

### 6.5. `007-audit`

Uso:

```text id="r5h20x"
- auditar provider definitions;
- auditar tenant configs;
- auditar consentimientos;
- auditar autorizaciones;
- auditar conexiones;
- auditar sync runs;
- auditar movimientos importados;
- auditar duplicados;
- auditar envío a conciliación;
- auditar errores;
- auditar revocaciones;
- auditar exports.
```

---

### 6.6. `008-basic-reports`

Uso:

```text id="a6whqc"
- reportes de conexiones;
- reportes de sync status;
- reportes de movimientos importados;
- reportes de errores;
- reportes de movimientos enviados a conciliación;
- reportes de diferencia banco vs sistema.
```

---

### 6.7. `016-secure-document-storage`

Uso:

```text id="mzudz1"
- almacenar evidencia documental de consentimiento si aplica;
- almacenar exports de reportes;
- no almacenar tokens ni payloads completos como documentos ordinarios;
- proteger storageKey;
- clasificar documentos como confidential/restricted.
```

Recomendación técnica:

```text id="uqxqwv"
Extender SourceModule de Secure Document Storage con openBankingIntegration.
```

---

### 6.8. `017-bank-reconciliation`

Dependencia crítica.

Uso:

```text id="ffl07b"
- recibir movimientos sincronizados desde Open Banking;
- crear o vincular BankTransaction;
- aplicar deduplicación adicional;
- generar candidatos de conciliación;
- mantener confirmación manual/asistida;
- impedir conciliación final automática irreversible.
```

Regla:

```text id="g9j1m7"
Open Banking sincroniza movimientos; Bank Reconciliation confirma conciliación.
```

---

### 6.9. `018-payment-provider-integration`

Uso:

```text id="swcqby"
- cruzar movimientos bancarios con ProviderSettlementRecord;
- identificar liquidaciones netas/gross/fees;
- tratar settlements como candidatos de conciliación;
- no marcar automáticamente pagos provider como conciliados.
```

---

## 7. Estructura de carpetas propuesta

```text id="ia9lo1"
apps/api/src/modules/open-banking-integration/
├── open-banking-integration.module.ts
├── controllers/
│   ├── platform-open-banking-provider-definitions.controller.ts
│   ├── tenant-open-banking-configs.controller.ts
│   ├── bank-consents.controller.ts
│   ├── bank-connections.controller.ts
│   ├── bank-account-links.controller.ts
│   ├── open-banking-sync-runs.controller.ts
│   ├── open-banking-account-snapshots.controller.ts
│   ├── open-banking-transactions.controller.ts
│   ├── open-banking-webhooks.controller.ts
│   └── open-banking-reports.controller.ts
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
│   ├── sync/
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

```text id="qg3508"
OpenBankingIntegrationModule
```

Responsabilidades:

```text id="c0y1az"
- registrar controladores;
- registrar servicios de aplicación;
- registrar puertos;
- registrar adapters Open Banking;
- registrar repositorios Prisma;
- registrar integración con Bank Reconciliation;
- registrar integración con Payments;
- registrar integración con Secure Document Storage;
- registrar integración con Audit;
- registrar integración con Reports;
- registrar observabilidad;
- publicar OpenAPI seguro.
```

---

### 8.2. Controladores

```text id="jctyw0"
PlatformOpenBankingProviderDefinitionsController
TenantOpenBankingConfigsController
BankConsentsController
BankConnectionsController
BankAccountLinksController
OpenBankingSyncRunsController
OpenBankingAccountSnapshotsController
OpenBankingTransactionsController
OpenBankingWebhooksController
OpenBankingReportsController
```

---

### 8.3. Servicios de aplicación

```text id="g1gsq4"
OpenBankingProviderDefinitionService
TenantOpenBankingConfigService
OpenBankingSecretService
BankConsentService
BankAuthorizationService
BankConnectionService
BankAccountDiscoveryService
BankAccountLinkService
OpenBankingBalanceSyncService
OpenBankingTransactionSyncService
OpenBankingSyncRunService
OpenBankingTransactionNormalizationService
OpenBankingTransactionDedupeService
OpenBankingReconciliationBridgeService
OpenBankingWebhookService
OpenBankingWebhookVerificationService
OpenBankingReportService
OpenBankingAuditService
OpenBankingObservabilityService
```

---

### 8.4. Entidades de dominio

```text id="y9mww6"
OpenBankingProviderDefinition
TenantOpenBankingConfig
BankConsent
BankConnection
BankAccountLink
OpenBankingSyncRun
OpenBankingAccountSnapshot
OpenBankingTransaction
OpenBankingWebhookEvent
```

---

### 8.5. Value Objects

```text id="s8h1dm"
OpenBankingProviderKey
OpenBankingEnvironment
OpenBankingCapability
BankConsentScope
BankConsentExpiration
BankConnectionStatus
BankAccountNumberMasked
BankAccountNumberHash
ExternalAccountId
ExternalTransactionId
OpenBankingTransactionFingerprint
OpenBankingTransactionAmount
OpenBankingTransactionCurrency
OpenBankingAuthorizationUrl
OpenBankingCallbackCode
OpenBankingTokenSecretRef
OpenBankingRefreshTokenSecretRef
OpenBankingWebhookSignature
OpenBankingWebhookPayloadHash
ProviderInstitutionCode
SyncPeriod
SyncCursor
```

---

### 8.6. Puertos de aplicación

```text id="bq9lvv"
OpenBankingProviderDefinitionRepositoryPort
TenantOpenBankingConfigRepositoryPort
BankConsentRepositoryPort
BankConnectionRepositoryPort
BankAccountLinkRepositoryPort
OpenBankingSyncRunRepositoryPort
OpenBankingAccountSnapshotRepositoryPort
OpenBankingTransactionRepositoryPort
OpenBankingWebhookEventRepositoryPort

OpenBankingProviderPort
OpenBankingAdapterRegistryPort
OpenBankingSecretPort
OpenBankingWebhookSignatureVerifierPort
OpenBankingPayloadHasherPort
OpenBankingTransactionFingerprintPort
BankReconciliationIntegrationPort
PaymentsIntegrationPort
PaymentProviderIntegrationPort
AccountStatementsIntegrationPort
SecureDocumentStorageIntegrationPort
AuditPort
ClockPort
IdempotencyPort
ObservabilityPort
ReportExportPort
```

---

### 8.7. Repositorios Prisma

```text id="ern49k"
PrismaOpenBankingProviderDefinitionRepository
PrismaTenantOpenBankingConfigRepository
PrismaBankConsentRepository
PrismaBankConnectionRepository
PrismaBankAccountLinkRepository
PrismaOpenBankingSyncRunRepository
PrismaOpenBankingAccountSnapshotRepository
PrismaOpenBankingTransactionRepository
PrismaOpenBankingWebhookEventRepository
```

---

## 9. Modelo de datos previsto

### 9.1. Tablas nuevas MVP

```text id="xw0taa"
open_banking_provider_definitions
tenant_open_banking_configs
bank_consents
bank_connections
bank_account_links
open_banking_sync_runs
open_banking_account_snapshots
open_banking_transactions
open_banking_webhook_events
```

---

### 9.2. Tablas externas relacionadas

```text id="mimlgc"
tenants
user_profiles
bank_accounts
bank_transactions
payments
provider_settlement_records
secure_documents
secure_document_files
audit_logs
```

---

### 9.3. Regla multitenant

Todas las tablas operativas tenant-scoped deben incluir:

```text id="xnrwan"
tenant_id
```

Excepción:

```text id="mnat6l"
open_banking_provider_definitions puede ser platform-scoped y no requiere tenant_id.
```

Regla obligatoria:

```text id="ioup0u"
Toda consulta tenant-scoped debe filtrar por tenant_id.
```

Patrón requerido:

```typescript id="b2fcne"
await prisma.bankConnection.findFirst({
  where: {
    id: connectionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="rlxou1"
await prisma.bankConnection.findUnique({
  where: { id: connectionId }
});
```

---

## 10. Diseño de estados

### 10.1. OpenBankingProviderDefinition

Estados:

```text id="pe2v0m"
draft
active
inactive
deprecated
archived
```

Transiciones permitidas:

```text id="rszcee"
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

### 10.2. TenantOpenBankingConfig

Estados:

```text id="lcdgb2"
draft
enabled
disabled
invalid
archived
```

Transiciones permitidas:

```text id="rnx644"
draft -> enabled
draft -> disabled
enabled -> disabled
disabled -> enabled
enabled -> invalid
invalid -> disabled
invalid -> enabled
draft -> archived
disabled -> archived
invalid -> archived
enabled -> archived
```

Reglas:

```text id="mhtrna"
- enabled requiere provider definition active;
- enabled requiere SecretRefs mínimos si el provider los exige;
- invalid no permite nuevas conexiones;
- disabled no permite iniciar autorización ni sync;
- archived no permite operación.
```

---

### 10.3. BankConsent

Estados:

```text id="d0vi44"
draft
pendingAuthorization
authorized
expired
revoked
failed
archived
```

Transiciones permitidas:

```text id="vsygt0"
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

Reglas:

```text id="f8yekr"
- authorized requiere authorizedBy y authorizedAt;
- authorized puede requerir expiresAt;
- revoked requiere revokedBy, revokedAt y reason;
- expired no permite sync;
- failed no crea BankConnection active.
```

---

### 10.4. BankConnection

Estados:

```text id="zfiisq"
pendingAuthorization
active
syncing
reauthorizationRequired
failed
revoked
disabled
archived
```

Transiciones permitidas:

```text id="bv5dxr"
pendingAuthorization -> active
active -> syncing
syncing -> active
syncing -> failed
active -> reauthorizationRequired
active -> failed
failed -> active
active -> revoked
active -> disabled
disabled -> active
revoked -> archived
disabled -> archived
failed -> archived
```

Reglas:

```text id="e4b6oj"
- active requiere BankConsent authorized vigente;
- revoked no permite sync;
- disabled no permite sync;
- reauthorizationRequired no permite sync hasta renovar;
- tokenSecretRef no se expone.
```

---

### 10.5. BankAccountLink

Estados:

```text id="mubf0w"
pendingLink
linked
unlinked
disabled
archived
```

Transiciones permitidas:

```text id="ejfk4i"
pendingLink -> linked
linked -> unlinked
linked -> disabled
disabled -> linked
unlinked -> linked
linked -> archived
unlinked -> archived
disabled -> archived
```

Reglas:

```text id="t7bf3p"
- linked requiere BankAccount interno tenant-scoped;
- unlinked conserva historia;
- disabled no sincroniza hacia Bank Reconciliation;
- archived no se usa para nuevos syncs.
```

---

### 10.6. OpenBankingSyncRun

Estados:

```text id="abgthv"
queued
running
completed
completedWithWarnings
failed
cancelled
archived
```

Transiciones permitidas:

```text id="ew7ybv"
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

Reglas:

```text id="j4bcn1"
- running requiere conexión activa;
- completed registra conteos;
- failed registra error sanitizado;
- retry incrementa retryCount y audita.
```

---

### 10.7. OpenBankingTransaction

Estados:

```text id="sqvm12"
imported
duplicate
sentToReconciliation
rejected
ignored
requiresReview
archived
```

Transiciones permitidas:

```text id="e8ku46"
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

Reglas:

```text id="s8jmet"
- sentToReconciliation no significa conciliado;
- duplicate no debe enviarse a conciliación;
- rejected requiere reason;
- ignored requiere reason;
- requiresReview requiere reason.
```

---

### 10.8. OpenBankingWebhookEvent

Estados de firma:

```text id="ke908o"
notVerified
verified
invalid
missing
unsupported
```

Estados de procesamiento:

```text id="h20ccd"
received
ignored
processing
processed
duplicate
failed
rejected
archived
```

Reglas:

```text id="oqj3f7"
- efectos financieros solo con verified si el provider soporta firma;
- duplicate no crea sync ni movimientos duplicados;
- failed puede reprocesarse;
- rejected por firma inválida no debe reprocesarse ordinariamente.
```

---

## 11. Estrategia provider-agnostic

### 11.1. Puerto principal

```typescript id="dwswwj"
interface OpenBankingProviderPort {
  startAuthorization(input: StartBankAuthorizationInput): Promise<StartBankAuthorizationResult>;
  exchangeAuthorizationCode(input: ExchangeAuthorizationCodeInput): Promise<ExchangeAuthorizationCodeResult>;
  refreshConnectionToken(input: RefreshConnectionTokenInput): Promise<RefreshConnectionTokenResult>;
  revokeConnection(input: RevokeBankConnectionInput): Promise<RevokeBankConnectionResult>;
  listAccounts(input: ListExternalAccountsInput): Promise<ListExternalAccountsResult>;
  getBalances(input: GetExternalBalancesInput): Promise<GetExternalBalancesResult>;
  listTransactions(input: ListExternalTransactionsInput): Promise<ListExternalTransactionsResult>;
  verifyWebhook(input: VerifyOpenBankingWebhookInput): Promise<VerifyOpenBankingWebhookResult>;
  parseWebhookEvent(input: ParseOpenBankingWebhookInput): Promise<ParsedOpenBankingWebhookEvent>;
  testConnection(input: TestOpenBankingConnectionInput): Promise<TestOpenBankingConnectionResult>;
}
```

---

### 11.2. Registry de adapters

```typescript id="o9c9wq"
interface OpenBankingAdapterRegistryPort {
  getAdapter(providerKey: string): OpenBankingProviderPort;
  listSupportedProviders(): SupportedOpenBankingProvider[];
}
```

---

### 11.3. Adapters MVP

```text id="rl0d94"
MockOpenBankingProviderAdapter
SandboxOpenBankingProviderAdapter
GenericReadOnlyOpenBankingAdapter
```

---

### 11.4. Adapters futuros

```text id="ht9voq"
RegionalOpenBankingAggregatorAdapter
BankSpecificApiAdapter
PSD2StyleAdapter
OpenFinanceAggregatorAdapter
InstitutionSandboxAdapter
```

Nota:

```text id="v9f0pr"
La selección de proveedor real debe resolverse en una decisión técnica posterior según disponibilidad legal, técnica, comercial y regulatoria del mercado objetivo.
```

---

## 12. Estrategia de secretos y tokens

### 12.1. Principio

No persistir tokens ni credenciales bancarias en texto plano en PostgreSQL.

Persistir solo referencias:

```text id="svz2z6"
credentialSecretRef
webhookSecretRef
tokenSecretRef
refreshTokenSecretRef
```

---

### 12.2. Puerto de secretos

```typescript id="uivseb"
interface OpenBankingSecretPort {
  storeCredential(input: StoreOpenBankingCredentialInput): Promise<SecretRef>;
  storeToken(input: StoreOpenBankingTokenInput): Promise<SecretRef>;
  updateToken(input: UpdateOpenBankingTokenInput): Promise<SecretRef>;
  rotateCredential(input: RotateOpenBankingCredentialInput): Promise<SecretRef>;
  revokeToken(input: RevokeOpenBankingTokenInput): Promise<void>;
  getSecret(input: GetOpenBankingSecretInput): Promise<ResolvedSecret>;
}
```

---

### 12.3. Implementación MVP

Opciones:

```text id="ja1iri"
1. Secret manager real en cloud.
2. Variables de entorno solo para adapter mock/sandbox.
3. Secret storage interno cifrado diferido.
```

Decisión recomendada:

```text id="qlmhyo"
Usar SecretRef abstracto desde el inicio, aunque el adapter local resuelva secretos desde variables de entorno o mock seguro en desarrollo.
```

---

### 12.4. Prohibido

```text id="aa2swa"
- guardar usuario bancario;
- guardar contraseña bancaria;
- guardar OTP;
- guardar MFA secret;
- guardar token raw en DB transaccional;
- guardar refresh token raw en DB transaccional;
- guardar client secret en metadata;
- devolver tokens por API;
- loggear tokens;
- auditar tokens completos;
- exponer SecretRefs en superficies no autorizadas;
- incluir secretos en OpenAPI examples.
```

---

## 13. Estrategia de consentimiento

### 13.1. Principio

Toda conexión debe tener consentimiento explícito.

```text id="x3zaqr"
Sin BankConsent authorized vigente no se permite sync.
```

---

### 13.2. Flujo de consentimiento

```text id="ww36jw"
1. FinancialManager crea BankConsent.
2. Sistema asigna scope.
3. Sistema inicia autorización con provider.
4. Provider devuelve authorizationUrl o callback flow.
5. FinancialManager completa autorización externa.
6. Provider retorna callback/webhook.
7. Sistema valida callback/webhook.
8. Sistema intercambia code por tokens si aplica.
9. Sistema almacena tokens como SecretRef.
10. Sistema marca BankConsent authorized.
11. Sistema crea BankConnection active.
12. Sistema audita.
```

---

### 13.3. Scopes MVP

```text id="hs5m2r"
accountsRead
balancesRead
transactionsRead
```

Deshabilitado:

```text id="cvsx8p"
paymentsInitiate
```

---

### 13.4. Evidencia de consentimiento

Debe registrarse:

```text id="qwa8k8"
providerConsentId
scope
authorizedBy
authorizedAt
expiresAt si aplica
termsAcceptedVersion si aplica
authorizationMethod
metadata segura
```

Si se almacena evidencia documental:

```text id="m2kt98"
usar Secure Document Storage
visibility administrative
sensitivity restricted
sourceModule openBankingIntegration
```

---

## 14. Estrategia de conexiones bancarias

### 14.1. BankConnection

`BankConnection` representa la conexión autorizada entre tenant y provider.

Reglas:

```text id="otiy82"
- requiere tenantId;
- requiere BankConsent authorized;
- requiere providerConnectionId si el provider lo entrega;
- requiere tokenSecretRef si el provider usa token;
- puede tener refreshTokenSecretRef;
- nunca expone tokens;
- estado active habilita sync;
- revoked/disabled/reauthorizationRequired bloquean sync.
```

---

### 14.2. Revocación

Flujo:

```text id="g5r061"
1. FinancialManager solicita revocación.
2. Sistema valida permiso y tenant.
3. Sistema llama revokeConnection en adapter si aplica.
4. Sistema revoca/invalida SecretRefs si aplica.
5. Sistema marca BankConnection revoked.
6. Sistema marca BankConsent revoked.
7. Sistema bloquea syncs futuros.
8. Sistema audita bankConnection.revoked.
```

---

### 14.3. Reautorización

Flujo:

```text id="qdqm2k"
1. Sistema detecta token expirado o consentimiento vencido.
2. BankConnection pasa a reauthorizationRequired.
3. FinancialManager inicia renovación.
4. Sistema crea o renueva BankConsent.
5. Provider confirma.
6. Connection vuelve a active.
```

---

## 15. Estrategia de cuentas externas

### 15.1. Descubrimiento

El sistema puede descubrir cuentas externas desde provider.

Cada cuenta externa se representa como `BankAccountLink`.

Estados iniciales:

```text id="za4i1m"
pendingLink
linked
```

---

### 15.2. Vinculación con BankAccount interno

Reglas:

```text id="btsqoy"
- bankAccountId debe pertenecer al mismo tenant;
- accountNumberMasked puede mostrarse;
- accountNumberHash se usa para sugerir match;
- externalAccountId no debe exponerse innecesariamente;
- full account number prohibido;
- un externalAccount puede vincularse a un BankAccount activo;
- no se elimina historial al desvincular.
```

---

### 15.3. Creación opcional de BankAccount interno

Decisión MVP recomendada:

```text id="ibjuxm"
No crear automáticamente BankAccount interno desde Open Banking sin confirmación humana.
```

Flujo permitido:

```text id="t008xx"
1. Se descubre cuenta externa.
2. Se crea BankAccountLink pendingLink.
3. FinancialManager vincula con BankAccount existente o crea BankAccount en 017.
4. Luego se marca linked.
```

---

## 16. Estrategia de sincronización

### 16.1. Tipos de sync

```text id="csgjm7"
accounts
balances
transactions
full
```

---

### 16.2. Trigger types

```text id="gsvcmq"
manual
scheduled
webhook
system
```

MVP recomendado:

```text id="lj3v6o"
manual
webhook si provider lo soporta
```

Programado queda preparado para jobs futuros.

---

### 16.3. Flujo de sync manual

```text id="a5zkh4"
1. Usuario autorizado solicita sync.
2. Sistema valida tenant.
3. Sistema valida BankConnection active.
4. Sistema valida BankConsent authorized vigente.
5. Sistema valida scopes.
6. Sistema crea OpenBankingSyncRun queued/running.
7. Adapter consulta provider.
8. Sistema normaliza datos.
9. Sistema persiste snapshots o transactions.
10. Sistema deduplica.
11. Sistema actualiza conteos.
12. Sistema marca completed/completedWithWarnings/failed.
13. Sistema audita.
```

---

### 16.4. Sync parcial

Si falla parte del sync:

```text id="kx2x6e"
- registrar completedWithWarnings;
- guardar conteos correctos;
- guardar error sanitizado;
- permitir retry controlado;
- no duplicar movimientos en retry.
```

---

### 16.5. Paginación/cursor del provider

El adapter debe soportar:

```text id="af1bmm"
cursor
nextPageToken
date range
provider pagination
rate limit handling
```

En dominio interno se recomienda registrar:

```text id="imudyc"
periodStart
periodEnd
syncCursor
transactionsFound
transactionsImported
transactionsDuplicated
transactionsRejected
```

---

## 17. Estrategia de normalización de movimientos

### 17.1. Campos normalizados

Todo movimiento debe normalizar:

```text id="s5onbh"
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
externalTransactionId
fingerprint
```

---

### 17.2. Dirección

```text id="vznsej"
credit
debit
neutral
```

---

### 17.3. Tipos

```text id="q4rr3d"
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

### 17.4. Money

Regla:

```text id="p8h6if"
Todos los montos deben manejarse con Decimal(12,2) y exponerse como string decimal.
```

---

## 18. Estrategia de deduplicación

### 18.1. Identificador primario

Si existe:

```text id="tipjkw"
externalTransactionId + tenantId + providerKey + bankConnectionId
```

---

### 18.2. Fingerprint alternativo

Si no existe externalTransactionId, generar fingerprint con:

```text id="ueca2d"
tenantId
providerKey
bankConnectionId
externalAccountId/accountLinkId
transactionDate
postedDate
direction
amount
currency
normalizedDescription
normalizedReference
bankReference
```

---

### 18.3. Reglas

```text id="cncokr"
- mismo externalTransactionId no crea movimiento duplicado;
- mismo fingerprint no crea movimiento duplicado;
- duplicate se registra y audita;
- duplicate no se envía a Bank Reconciliation;
- sync retry debe ser seguro.
```

---

## 19. Estrategia de integración con Bank Reconciliation

### 19.1. Reconciliation Bridge

Servicio sugerido:

```text id="xazgto"
OpenBankingReconciliationBridgeService
```

Responsabilidades:

```text id="rhb5lv"
- validar OpenBankingTransaction tenant-scoped;
- validar estado imported/requiresReview según política;
- validar BankAccountLink linked;
- crear o reutilizar BankTransaction;
- preservar fingerprint;
- marcar sentToReconciliation;
- auditar openBankingTransaction.sentToReconciliation;
- no confirmar matches;
- no marcar conciliación final.
```

---

### 19.2. Regla crítica

```text id="qbsf4a"
Enviar movimiento a Bank Reconciliation no significa pago identificado ni conciliación confirmada.
```

---

### 19.3. Mapeo hacia BankTransaction

Campos sugeridos:

```text id="yyfvxc"
tenantId
bankAccountId
source=openBanking
sourceReference=openBankingTransactionId
statementImportId=null
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
status=pending/unmatched
metadata segura
```

---

## 20. Estrategia de integración con Payment Provider Integration

### 20.1. Settlement detection

Si un movimiento bancario parece liquidación de proveedor:

```text id="zsy1cq"
transactionType = paymentProviderSettlement
```

Debe cruzarse con:

```text id="tpnbyr"
provider_settlement_records
```

---

### 20.2. Reglas

```text id="m4q4ck"
- no marcar Payment como conciliado automáticamente;
- no marcar ProviderSettlement como confirmado automáticamente sin Bank Reconciliation;
- crear candidatos o enlaces auxiliares según 017;
- registrar diferencias entre netAmount y bank amount como requiresReview.
```

---

## 21. API prevista

### 21.1. Platform — provider definitions

```text id="q9ornb"
GET    /api/v1/platform/open-banking-provider-definitions
POST   /api/v1/platform/open-banking-provider-definitions
GET    /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}
PATCH  /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}
POST   /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/activate
POST   /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/deprecate
POST   /api/v1/platform/open-banking-provider-definitions/{providerDefinitionId}/archive
```

---

### 21.2. Tenant — configs

```text id="p010oo"
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

### 21.3. Tenant — consents

```text id="yxfo2w"
GET    /api/v1/tenant/open-banking/consents
POST   /api/v1/tenant/open-banking/consents
GET    /api/v1/tenant/open-banking/consents/{consentId}
POST   /api/v1/tenant/open-banking/consents/{consentId}/start-authorization
POST   /api/v1/tenant/open-banking/consents/{consentId}/renew
POST   /api/v1/tenant/open-banking/consents/{consentId}/revoke
POST   /api/v1/tenant/open-banking/consents/{consentId}/archive
```

---

### 21.4. Tenant — connections

```text id="sxoz8r"
GET    /api/v1/tenant/open-banking/connections
GET    /api/v1/tenant/open-banking/connections/{connectionId}
PATCH  /api/v1/tenant/open-banking/connections/{connectionId}
POST   /api/v1/tenant/open-banking/connections/{connectionId}/revoke
POST   /api/v1/tenant/open-banking/connections/{connectionId}/disable
POST   /api/v1/tenant/open-banking/connections/{connectionId}/archive
```

---

### 21.5. Tenant — account links

```text id="d6q5ni"
GET    /api/v1/tenant/open-banking/account-links
POST   /api/v1/tenant/open-banking/account-links
GET    /api/v1/tenant/open-banking/account-links/{accountLinkId}
POST   /api/v1/tenant/open-banking/account-links/{accountLinkId}/link-bank-account
POST   /api/v1/tenant/open-banking/account-links/{accountLinkId}/unlink-bank-account
POST   /api/v1/tenant/open-banking/account-links/{accountLinkId}/disable
POST   /api/v1/tenant/open-banking/account-links/{accountLinkId}/archive
```

---

### 21.6. Tenant — sync

```text id="v70ml8"
GET    /api/v1/tenant/open-banking/sync-runs
POST   /api/v1/tenant/open-banking/connections/{connectionId}/sync
GET    /api/v1/tenant/open-banking/sync-runs/{syncRunId}
POST   /api/v1/tenant/open-banking/sync-runs/{syncRunId}/retry
POST   /api/v1/tenant/open-banking/sync-runs/{syncRunId}/cancel
POST   /api/v1/tenant/open-banking/sync-runs/{syncRunId}/archive
```

---

### 21.7. Tenant — snapshots and transactions

```text id="f8wyji"
GET    /api/v1/tenant/open-banking/account-snapshots
GET    /api/v1/tenant/open-banking/transactions
GET    /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}
POST   /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/send-to-reconciliation
POST   /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/ignore
POST   /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/archive
```

---

### 21.8. Tenant — webhook events

```text id="fyk5nn"
GET    /api/v1/tenant/open-banking/webhook-events
GET    /api/v1/tenant/open-banking/webhook-events/{webhookEventId}
POST   /api/v1/tenant/open-banking/webhook-events/{webhookEventId}/reprocess
POST   /api/v1/tenant/open-banking/webhook-events/{webhookEventId}/archive
```

---

### 21.9. Webhook endpoint

```text id="tj4cs9"
POST   /api/v1/webhooks/open-banking/{providerKey}
```

---

### 21.10. Reports

```text id="eddo51"
GET    /api/v1/tenant/open-banking/reports/summary
GET    /api/v1/tenant/open-banking/reports/sync-status
GET    /api/v1/tenant/open-banking/reports/imported-transactions
GET    /api/v1/tenant/open-banking/reports/errors
GET    /api/v1/tenant/open-banking/reports/export
```

---

### 21.11. Endpoints públicos prohibidos

No crear:

```text id="jh14ja"
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

## 22. DTOs previstos

### 22.1. Provider definitions

```text id="emro1i"
CreateOpenBankingProviderDefinitionDto
UpdateOpenBankingProviderDefinitionDto
ActivateOpenBankingProviderDefinitionDto
DeprecateOpenBankingProviderDefinitionDto
ArchiveOpenBankingProviderDefinitionDto
OpenBankingProviderDefinitionDto
OpenBankingProviderDefinitionListItemDto
OpenBankingProviderDefinitionFilterDto
```

---

### 22.2. Tenant configs

```text id="vdhrml"
CreateTenantOpenBankingConfigDto
UpdateTenantOpenBankingConfigDto
EnableTenantOpenBankingConfigDto
DisableTenantOpenBankingConfigDto
TestTenantOpenBankingConnectionDto
ArchiveTenantOpenBankingConfigDto
TenantOpenBankingConfigDto
TenantOpenBankingConfigListItemDto
TenantOpenBankingConfigFilterDto
```

---

### 22.3. Consents

```text id="t7syxa"
CreateBankConsentDto
StartBankAuthorizationDto
RenewBankConsentDto
RevokeBankConsentDto
ArchiveBankConsentDto
BankConsentDto
BankConsentListItemDto
BankConsentFilterDto
```

---

### 22.4. Connections

```text id="j6t5by"
BankConnectionDto
BankConnectionListItemDto
BankConnectionFilterDto
UpdateBankConnectionDto
RevokeBankConnectionDto
DisableBankConnectionDto
ArchiveBankConnectionDto
```

---

### 22.5. Account links

```text id="fzsvon"
CreateBankAccountLinkDto
LinkBankAccountDto
UnlinkBankAccountDto
DisableBankAccountLinkDto
ArchiveBankAccountLinkDto
BankAccountLinkDto
BankAccountLinkListItemDto
BankAccountLinkFilterDto
```

---

### 22.6. Sync

```text id="ywej6c"
StartOpenBankingSyncDto
RetryOpenBankingSyncDto
CancelOpenBankingSyncDto
ArchiveOpenBankingSyncDto
OpenBankingSyncRunDto
OpenBankingSyncRunListItemDto
OpenBankingSyncRunFilterDto
```

---

### 22.7. Snapshots and transactions

```text id="f3nt7x"
OpenBankingAccountSnapshotDto
OpenBankingAccountSnapshotListItemDto
OpenBankingAccountSnapshotFilterDto
OpenBankingTransactionDto
OpenBankingTransactionListItemDto
OpenBankingTransactionFilterDto
SendOpenBankingTransactionToReconciliationDto
IgnoreOpenBankingTransactionDto
ArchiveOpenBankingTransactionDto
```

---

### 22.8. Webhooks

```text id="a7ds73"
OpenBankingWebhookEventDto
OpenBankingWebhookEventListItemDto
OpenBankingWebhookEventFilterDto
ReprocessOpenBankingWebhookEventDto
ArchiveOpenBankingWebhookEventDto
```

---

### 22.9. Reports

```text id="uxk57r"
OpenBankingSummaryReportDto
OpenBankingSyncStatusReportDto
OpenBankingImportedTransactionsReportDto
OpenBankingErrorsReportDto
OpenBankingReportExportDto
```

---

## 23. Campos prohibidos en requests externos

Los DTOs externos deben rechazar:

```text id="u2iizk"
tenantId
createdBy
updatedBy
enabledBy
disabledBy
authorizedBy
revokedBy
archivedBy
startedBy
processedBy
status directo salvo transición controlada
tokenSecret value
refreshTokenSecret value
credentialSecret value
webhookSecret value
tokenSecretRef desde /me
refreshTokenSecretRef desde /me
bank username
bank password
OTP
MFA secret
full account number
external raw payload
webhook raw signature
storageKey
signedUrl
payment initiation data
transfer destination
amount for bank payment initiation
bankTransactionId cross-tenant
bankAccountId cross-tenant
```

---

## 24. Permisos

### 24.1. Provider definitions

```text id="v289ut"
openBankingProviderDefinitions.create
openBankingProviderDefinitions.read
openBankingProviderDefinitions.update
openBankingProviderDefinitions.activate
openBankingProviderDefinitions.deprecate
openBankingProviderDefinitions.archive
```

---

### 24.2. Tenant configs

```text id="xy99ll"
tenantOpenBankingConfigs.create
tenantOpenBankingConfigs.read
tenantOpenBankingConfigs.update
tenantOpenBankingConfigs.enable
tenantOpenBankingConfigs.disable
tenantOpenBankingConfigs.testConnection
tenantOpenBankingConfigs.archive
```

---

### 24.3. Consents

```text id="fz29ja"
openBankingConsents.create
openBankingConsents.read
openBankingConsents.authorize
openBankingConsents.renew
openBankingConsents.revoke
openBankingConsents.archive
```

---

### 24.4. Connections

```text id="o7s52l"
openBankingConnections.create
openBankingConnections.read
openBankingConnections.update
openBankingConnections.revoke
openBankingConnections.disable
openBankingConnections.archive
```

---

### 24.5. Account links

```text id="zhbkuq"
openBankingAccountLinks.create
openBankingAccountLinks.read
openBankingAccountLinks.link
openBankingAccountLinks.unlink
openBankingAccountLinks.disable
openBankingAccountLinks.archive
```

---

### 24.6. Sync

```text id="j3jgpy"
openBankingSync.start
openBankingSync.read
openBankingSync.retry
openBankingSync.cancel
openBankingSync.archive
```

---

### 24.7. Transactions

```text id="u23t3f"
openBankingTransactions.read
openBankingTransactions.review
openBankingTransactions.ignore
openBankingTransactions.sendToReconciliation
openBankingTransactions.archive
```

---

### 24.8. Webhooks

```text id="ir615j"
openBankingWebhooks.read
openBankingWebhooks.reprocess
openBankingWebhooks.archive
```

---

### 24.9. Reports

```text id="eaymgx"
openBankingReports.read
openBankingReports.export
```

---

### 24.10. Audit

```text id="r578xc"
openBanking.audit.read
```

---

## 25. Guards y policies

### 25.1. Guards

```text id="hi0jva"
OpenBankingPermissionGuard
PlatformOpenBankingGuard
TenantOpenBankingGuard
BankConsentTenantGuard
BankConnectionTenantGuard
BankAccountLinkTenantGuard
OpenBankingSyncTenantGuard
OpenBankingTransactionTenantGuard
OpenBankingWebhookSignatureGuard
OpenBankingWebhookReplayGuard
OpenBankingReportGuard
```

---

### 25.2. Policies

```text id="jnhmdt"
OpenBankingProviderDefinitionStatePolicy
TenantOpenBankingConfigStatePolicy
OpenBankingSecretPolicy
BankConsentPolicy
BankConsentScopePolicy
BankConsentExpirationPolicy
BankAuthorizationPolicy
BankConnectionStatePolicy
BankConnectionTokenPolicy
BankConnectionRevocationPolicy
BankAccountLinkPolicy
BankAccountLinkTenantPolicy
BankSyncPolicy
BankSyncPeriodPolicy
OpenBankingTransactionNormalizationPolicy
OpenBankingTransactionDedupePolicy
OpenBankingTransactionReconciliationPolicy
OpenBankingWebhookSignaturePolicy
OpenBankingWebhookReplayProtectionPolicy
NoBankCredentialStoragePolicy
NoPaymentInitiationPolicy
NoPublicOpenBankingEndpointPolicy
NoExternalAiBankDataPolicy
AuditSanitizationPolicy
LogSanitizationPolicy
```

---

## 26. Seguridad técnica

Reglas obligatorias:

```text id="vd9c6v"
- no aceptar tenantId desde body;
- no consultar entidades tenant-scoped solo por id;
- no almacenar usuario bancario;
- no almacenar contraseña bancaria;
- no almacenar OTP;
- no almacenar MFA secret;
- no almacenar tokens raw;
- no exponer SecretRefs en superficies no autorizadas;
- no exponer número completo de cuenta;
- no exponer payload completo del proveedor;
- no exponer raw webhook signature;
- no iniciar pagos bancarios en MVP;
- no crear Payment automáticamente desde movimiento Open Banking;
- no marcar conciliación final automáticamente;
- no permitir WordPress bank access;
- no enviar datos bancarios reales a IA externa;
- no crear endpoints públicos administrativos.
```

---

## 27. Auditoría

### 27.1. Eventos obligatorios

```text id="q0jliy"
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

### 27.2. Metadata permitida

```text id="l94bcj"
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

### 27.3. Metadata prohibida

```text id="nt56v0"
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

## 28. Observabilidad

### 28.1. Logs sugeridos

```text id="f2bguv"
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

### 28.2. Métricas sugeridas

```text id="bt93wr"
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

### 28.3. Labels permitidos

```text id="i18thr"
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

### 28.4. Labels prohibidos

```text id="xvsybx"
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

## 29. OpenAPI

### 29.1. Tags sugeridos

```text id="md0rmt"
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

### 29.2. Extensiones OpenAPI requeridas

Para endpoints platform:

```yaml id="nl3v6a"
x-platform-scope: true
x-auth-required: true
x-open-banking-integration: true
x-secrets-exposed: false
```

Para endpoints tenant:

```yaml id="klecd1"
x-tenant-scope: true
x-auth-required: true
x-open-banking-integration: true
x-bank-data: true
x-public-exposure: false
x-secrets-exposed: false
```

Para endpoints de consentimiento:

```yaml id="y3qpwk"
x-consent-required: true
x-consent-audited: true
x-bank-credential-storage: false
```

Para webhooks:

```yaml id="g0y63c"
x-webhook-endpoint: true
x-provider-signature-required: true
x-idempotent-processing: true
x-public-user-endpoint: false
x-audit-event: openBankingWebhook.received
```

Para sync:

```yaml id="ze4nkp"
x-sync-operation: true
x-idempotent-processing: true
x-reconciliation-ready: true
```

Regla:

```text id="qol7q4"
OpenAPI no debe documentar endpoints públicos administrativos de Open Banking ni campos sensibles.
```

---

## 30. Implementación por fases

### 30.1. Orden recomendado

```text id="hgshb3"
1. Crear estructura base del módulo.
2. Implementar enums y constantes.
3. Implementar value objects.
4. Implementar entidades de dominio.
5. Implementar state machines.
6. Crear Prisma schema y migración.
7. Implementar repositorios tenant-scoped.
8. Implementar ports de provider y secret management.
9. Implementar adapter mock/sandbox.
10. Implementar provider definitions platform.
11. Implementar tenant Open Banking config.
12. Implementar BankConsentService.
13. Implementar BankAuthorizationService.
14. Implementar BankConnectionService.
15. Implementar BankAccountDiscoveryService.
16. Implementar BankAccountLinkService.
17. Implementar OpenBankingSyncRunService.
18. Implementar balance sync.
19. Implementar transaction sync.
20. Implementar normalización de movimientos.
21. Implementar deduplicación.
22. Implementar Reconciliation Bridge.
23. Implementar webhooks.
24. Implementar reportes.
25. Implementar controllers REST.
26. Implementar audit.
27. Implementar observability.
28. Implementar OpenAPI.
29. Implementar tests.
30. Ejecutar hardening final.
```

---

### 30.2. PRs sugeridos

```text id="l38yc5"
PR-019-01 — Module skeleton, enums and constants.
PR-019-02 — Value objects, entities and state machines.
PR-019-03 — Prisma schema, migration, constraints and indexes.
PR-019-04 — Repository ports and Prisma repositories.
PR-019-05 — Provider ports, registry and mock/sandbox adapter.
PR-019-06 — SecretRef handling and no bank credential storage.
PR-019-07 — Platform Open Banking provider definitions.
PR-019-08 — Tenant Open Banking configuration.
PR-019-09 — Bank consents and authorization flow.
PR-019-10 — Bank connections and revocation.
PR-019-11 — Account discovery and account links.
PR-019-12 — Balance sync and account snapshots.
PR-019-13 — Transaction sync, normalization and deduplication.
PR-019-14 — Reconciliation Bridge to Bank Reconciliation.
PR-019-15 — Open Banking webhooks, signature verification and replay protection.
PR-019-16 — Reports and exports.
PR-019-17 — Audit, observability and OpenAPI.
PR-019-18 — Tests, security hardening, performance and CI gates.
```

---

## 31. Testing plan resumido

### 31.1. Unit tests

```text id="p82wvl"
OpenBankingProviderDefinition entity
TenantOpenBankingConfig entity
BankConsent entity
BankConnection entity
BankAccountLink entity
OpenBankingSyncRun entity
OpenBankingAccountSnapshot entity
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

### 31.2. Integration tests

```text id="kgvmcu"
provider adapter mock
tenant config SecretRef
consent authorization flow
connection creation
connection revocation
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

### 31.3. API tests

```text id="c0aw00"
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

### 31.4. Security tests

```text id="jvav0p"
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

## 32. Performance objetivo

### 32.1. Objetivos MVP

```text id="pgp2d4"
p95 < 800 ms para listar conexiones paginadas.
p95 < 1200 ms para iniciar autorización, excluyendo latencia del proveedor.
p95 < 2000 ms para sincronizar cuentas pequeñas, excluyendo latencia del proveedor.
p95 < 5000 ms para sincronizar movimientos mensuales típicos, excluyendo latencia del proveedor.
p95 < 1200 ms para enviar movimientos ya importados a Bank Reconciliation.
p95 < 1000 ms para reportes summary básicos.
```

---

### 32.2. Reglas técnicas

```text id="xz57nx"
- paginación obligatoria;
- pageSize máximo 100;
- índices por tenant_id;
- índices por providerKey;
- índices por status;
- índices por syncRunId;
- índices por externalTransactionId;
- índices por fingerprint;
- no N+1 evidente;
- deduplicación indexada;
- no payloads completos en logs;
- sync pesado debe poder moverse a jobs.
```

---

## 33. Feature flags

```text id="ojd6ga"
openBankingIntegration.enabled
openBankingIntegration.platformDefinitions.enabled
openBankingIntegration.tenantConfigs.enabled
openBankingIntegration.consents.enabled
openBankingIntegration.authorization.enabled
openBankingIntegration.connections.enabled
openBankingIntegration.accountDiscovery.enabled
openBankingIntegration.balanceSync.enabled
openBankingIntegration.transactionSync.enabled
openBankingIntegration.webhooks.enabled
openBankingIntegration.reconciliationBridge.enabled
openBankingIntegration.reports.enabled
openBankingIntegration.scheduledSync.enabled
openBankingIntegration.paymentInitiation.enabled
openBankingIntegration.screenScraping.enabled
openBankingIntegration.externalAi.enabled
```

Defaults MVP:

```text id="d1bprs"
openBankingIntegration.enabled = true
openBankingIntegration.platformDefinitions.enabled = true
openBankingIntegration.tenantConfigs.enabled = true
openBankingIntegration.consents.enabled = true
openBankingIntegration.authorization.enabled = true
openBankingIntegration.connections.enabled = true
openBankingIntegration.accountDiscovery.enabled = true
openBankingIntegration.balanceSync.enabled = true
openBankingIntegration.transactionSync.enabled = true
openBankingIntegration.webhooks.enabled = true
openBankingIntegration.reconciliationBridge.enabled = true
openBankingIntegration.reports.enabled = true
openBankingIntegration.scheduledSync.enabled = false
openBankingIntegration.paymentInitiation.enabled = false
openBankingIntegration.screenScraping.enabled = false
openBankingIntegration.externalAi.enabled = false
```

---

## 34. Variables de configuración sugeridas

```text id="aajmf0"
OPEN_BANKING_INTEGRATION_ENABLED=true
OPEN_BANKING_DEFAULT_ENVIRONMENT=sandbox
OPEN_BANKING_DEFAULT_CURRENCY=USD
OPEN_BANKING_REQUIRE_CONSENT=true
OPEN_BANKING_REQUIRE_SIGNATURE=true
OPEN_BANKING_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS=300
OPEN_BANKING_WEBHOOK_REPLAY_PROTECTION_ENABLED=true
OPEN_BANKING_MAX_WEBHOOK_PAYLOAD_BYTES=262144
OPEN_BANKING_MAX_SYNC_PERIOD_DAYS=90
OPEN_BANKING_DEFAULT_SYNC_PERIOD_DAYS=30
OPEN_BANKING_SYNC_PAGE_SIZE=100
OPEN_BANKING_REPORT_EXPORT_ENABLED=true
OPEN_BANKING_SCHEDULED_SYNC_ENABLED=false
OPEN_BANKING_PAYMENT_INITIATION_ENABLED=false
OPEN_BANKING_SCREEN_SCRAPING_ENABLED=false
OPEN_BANKING_EXTERNAL_AI_ENABLED=false
```

---

## 35. Errores esperados

Catálogo inicial:

```text id="x1lk26"
OPEN_BANKING_PROVIDER_DEFINITION_NOT_FOUND
OPEN_BANKING_PROVIDER_DEFINITION_FORBIDDEN
OPEN_BANKING_PROVIDER_DEFINITION_INVALID_STATUS
OPEN_BANKING_PROVIDER_DEFINITION_ARCHIVED
OPEN_BANKING_PROVIDER_UNSUPPORTED
OPEN_BANKING_PROVIDER_DEPRECATED

TENANT_OPEN_BANKING_CONFIG_NOT_FOUND
TENANT_OPEN_BANKING_CONFIG_FORBIDDEN
TENANT_OPEN_BANKING_CONFIG_INVALID_STATUS
TENANT_OPEN_BANKING_CONFIG_DISABLED
TENANT_OPEN_BANKING_CONFIG_INVALID
TENANT_OPEN_BANKING_CONFIG_ARCHIVED
TENANT_OPEN_BANKING_SECRET_INVALID
TENANT_OPEN_BANKING_CONNECTION_FAILED

BANK_CONSENT_NOT_FOUND
BANK_CONSENT_FORBIDDEN
BANK_CONSENT_INVALID_STATUS
BANK_CONSENT_EXPIRED
BANK_CONSENT_REVOKED
BANK_CONSENT_SCOPE_UNSUPPORTED
BANK_CONSENT_AUTHORIZATION_FAILED
BANK_CONSENT_RENEWAL_REQUIRED

BANK_CONNECTION_NOT_FOUND
BANK_CONNECTION_FORBIDDEN
BANK_CONNECTION_INVALID_STATUS
BANK_CONNECTION_REVOKED
BANK_CONNECTION_DISABLED
BANK_CONNECTION_REAUTHORIZATION_REQUIRED
BANK_CONNECTION_TOKEN_EXPIRED
BANK_CONNECTION_PROVIDER_ERROR

BANK_ACCOUNT_LINK_NOT_FOUND
BANK_ACCOUNT_LINK_FORBIDDEN
BANK_ACCOUNT_LINK_INVALID_STATUS
BANK_ACCOUNT_LINK_CROSS_TENANT_REFERENCE
BANK_ACCOUNT_LINK_ALREADY_LINKED
BANK_ACCOUNT_LINK_ACCOUNT_MISMATCH

OPEN_BANKING_SYNC_NOT_FOUND
OPEN_BANKING_SYNC_FORBIDDEN
OPEN_BANKING_SYNC_INVALID_STATUS
OPEN_BANKING_SYNC_ALREADY_RUNNING
OPEN_BANKING_SYNC_PERIOD_INVALID
OPEN_BANKING_SYNC_PROVIDER_TIMEOUT
OPEN_BANKING_SYNC_PROVIDER_RATE_LIMITED
OPEN_BANKING_SYNC_FAILED

OPEN_BANKING_TRANSACTION_NOT_FOUND
OPEN_BANKING_TRANSACTION_FORBIDDEN
OPEN_BANKING_TRANSACTION_DUPLICATE
OPEN_BANKING_TRANSACTION_INVALID_STATUS
OPEN_BANKING_TRANSACTION_CROSS_TENANT_REFERENCE
OPEN_BANKING_TRANSACTION_ALREADY_SENT_TO_RECONCILIATION
OPEN_BANKING_TRANSACTION_RECONCILIATION_FAILED

OPEN_BANKING_WEBHOOK_SIGNATURE_MISSING
OPEN_BANKING_WEBHOOK_SIGNATURE_INVALID
OPEN_BANKING_WEBHOOK_TIMESTAMP_EXPIRED
OPEN_BANKING_WEBHOOK_REPLAY_DETECTED
OPEN_BANKING_WEBHOOK_DUPLICATE
OPEN_BANKING_WEBHOOK_PAYLOAD_INVALID
OPEN_BANKING_WEBHOOK_PROCESSING_FAILED

BANK_CREDENTIAL_STORAGE_FORBIDDEN
RAW_TOKEN_EXPOSURE_FORBIDDEN
RAW_PROVIDER_PAYLOAD_FORBIDDEN
PAYMENT_INITIATION_FORBIDDEN
PUBLIC_OPEN_BANKING_ENDPOINT_FORBIDDEN
EXTERNAL_AI_BANK_DATA_FORBIDDEN

VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

---

## 36. Seeds y datos demo

Crear seeds ficticios para:

```text id="zy6sro"
openBankingProviderDefinitionMock
openBankingProviderDefinitionSandbox
openBankingProviderDefinitionDeprecated

tenantOpenBankingConfigEnabledA
tenantOpenBankingConfigDraftA
tenantOpenBankingConfigDisabledA
tenantOpenBankingConfigInvalidA
tenantOpenBankingConfigTenantB

bankConsentPendingA
bankConsentAuthorizedA
bankConsentExpiredA
bankConsentRevokedA
bankConsentTenantB

bankConnectionActiveA
bankConnectionSyncingA
bankConnectionFailedA
bankConnectionReauthorizationRequiredA
bankConnectionRevokedA
bankConnectionTenantB

bankAccountLinkPendingA
bankAccountLinkLinkedA
bankAccountLinkUnlinkedA
bankAccountLinkTenantB

openBankingSyncRunCompletedA
openBankingSyncRunFailedA
openBankingSyncRunWithWarningsA
openBankingSyncRunTenantB

openBankingAccountSnapshotA
openBankingAccountSnapshotTenantB

openBankingTransactionImportedA
openBankingTransactionDuplicateA
openBankingTransactionSentToReconciliationA
openBankingTransactionRequiresReviewA
openBankingTransactionTenantB

openBankingWebhookEventVerifiedA
openBankingWebhookEventInvalidSignatureA
openBankingWebhookEventDuplicateA
openBankingWebhookEventTenantB
```

Prohibido en seeds:

```text id="hwdfht"
credenciales bancarias reales
usuarios bancarios reales
contraseñas reales
OTP reales
tokens reales
refresh tokens reales
client secrets reales
webhook secrets reales
payloads reales de proveedor
números completos de cuenta
datos financieros reales
nombres reales
emails reales
teléfonos reales
cédulas reales
storageKeys reales
URLs firmadas reales
```

---

## 37. Riesgos técnicos

| Riesgo                                       | Impacto | Mitigación                          |
| -------------------------------------------- | ------: | ----------------------------------- |
| Consentimiento ausente                       | Crítico | ConsentPolicy + audit               |
| Token expuesto                               | Crítico | SecretRef + log sanitizer           |
| Credenciales bancarias almacenadas           | Crítico | NoBankCredentialStoragePolicy       |
| Movimiento duplicado                         |    Alto | externalTransactionId + fingerprint |
| Cuenta externa vinculada a tenant incorrecto | Crítico | tenant validation                   |
| Movimiento crea Payment automático           | Crítico | prohibición explícita               |
| Conciliación final automática                | Crítico | Bank Reconciliation authority       |
| Provider caído                               |   Medio | failed sync + retry                 |
| Token expirado                               |   Medio | reauthorizationRequired             |
| Rate limit provider                          |   Medio | backoff/retry controlado            |
| Payload bancario en logs                     |    Alto | payloadHash + preview               |
| Webhook falso                                |    Alto | signature verification              |
| Reporte incluye tenant B                     | Crítico | tenant-scoped queries               |
| WordPress consulta datos bancarios           | Crítico | no public endpoints                 |
| IA externa procesa datos bancarios           | Crítico | feature flag false                  |

---

## 38. Criterios de aceptación técnica

La implementación deberá cumplir:

```text id="gualr3"
- provider definitions platform funcionan;
- tenant Open Banking configs funcionan;
- SecretRef protege credenciales/tokens;
- no se almacenan credenciales bancarias;
- no se almacenan tokens raw;
- BankConsent se crea y audita;
- autorización bancaria se inicia con config enabled;
- BankConnection se crea solo con consentimiento autorizado;
- conexión revoked/disabled no permite sync;
- account discovery funciona;
- BankAccountLink valida tenant;
- balance sync funciona;
- transaction sync funciona;
- movimientos se normalizan;
- movimientos se deduplican;
- sync retry no duplica movimientos;
- OpenBankingTransaction se puede enviar a Bank Reconciliation;
- no se crea Payment automáticamente;
- no se marca conciliación final automáticamente;
- webhooks se validan por firma si aplica;
- reportes son tenant-scoped;
- exports usan Secure Document Storage si se persisten;
- audit se emite;
- logs son seguros;
- métricas son seguras;
- OpenAPI no expone endpoints públicos administrativos;
- WordPress no accede a datos bancarios;
- IA externa está deshabilitada con datos reales;
- CI pasa.
```

---

## 39. Definition of Done

El módulo se considera listo cuando:

```text id="u07k04"
1. spec.md está aprobado.
2. plan.md está aprobado.
3. data-model.md está creado.
4. api-contract.md está creado.
5. test-plan.md está creado.
6. tasks.md está creado.
7. security-notes.md está creado.
8. Prisma schema está implementado.
9. Migración está ejecutada en test.
10. Provider registry funciona.
11. Mock provider adapter funciona.
12. SecretRef abstraction funciona.
13. Platform provider definitions funcionan.
14. Tenant Open Banking configs funcionan.
15. BankConsentService funciona.
16. BankAuthorizationService funciona.
17. BankConnectionService funciona.
18. BankAccountDiscoveryService funciona.
19. BankAccountLinkService funciona.
20. Balance sync funciona.
21. Transaction sync funciona.
22. Normalización funciona.
23. Deduplicación funciona.
24. Reconciliation Bridge funciona.
25. Webhook verification funciona.
26. Reports funcionan.
27. Audit funciona.
28. Observability funciona.
29. Controllers funcionan.
30. OpenAPI está actualizado.
31. Tests unitarios pasan.
32. Tests de repositorio pasan.
33. Tests de integración pasan.
34. Tests API pasan.
35. Tests de autorización pasan.
36. Tests multitenant pasan.
37. Tests de seguridad pasan.
38. Tests de idempotencia pasan.
39. Tests de conciliación pasan.
40. Smoke tests pasan.
41. Build pasa.
42. CI pasa.
```

---

## 40. No aceptación

No se acepta implementación si:

```text id="moyosn"
- permite config cross-tenant;
- permite consent cross-tenant;
- permite connection cross-tenant;
- permite account link cross-tenant;
- permite sync run cross-tenant;
- permite transaction cross-tenant;
- permite webhook event cross-tenant;
- vincula external account con BankAccount tenant B;
- acepta tenantId desde body;
- busca entidades tenant-scoped solo por id;
- almacena usuario bancario;
- almacena contraseña bancaria;
- almacena OTP;
- almacena MFA secret;
- almacena tokens raw;
- expone SecretRefs en superficies no autorizadas;
- expone número completo de cuenta;
- expone raw provider payload;
- expone raw webhook signature;
- inicia pagos bancarios en MVP;
- crea Payment automáticamente desde movimiento Open Banking;
- marca conciliación bancaria final automáticamente;
- duplica movimientos en sync retry;
- permite duplicate como conciliable;
- permite sync sin consentimiento vigente;
- permite sync con connection revoked/disabled;
- crea endpoints públicos administrativos;
- documenta endpoints públicos administrativos en OpenAPI;
- permite WordPress consultar datos bancarios;
- envía datos bancarios reales a IA externa;
- omite auditoría financiera crítica.
```

---

## 41. Resultado esperado

Al finalizar la implementación de `019-open-banking-integration`, RESIDENT Core tendrá una base segura para conectar información bancaria autorizada al proceso de conciliación.

Resultado esperado:

```text id="ncgxmt"
- provider definitions Open Banking platform;
- tenant Open Banking configs;
- SecretRef strategy;
- no bank credential storage;
- explicit consent;
- authorization flow;
- BankConnection;
- external account discovery;
- BankAccountLink;
- balance snapshots;
- transaction sync;
- transaction normalization;
- transaction fingerprint;
- deduplication;
- idempotent sync retry;
- reconciliation bridge;
- OpenBankingTransaction sentToReconciliation;
- webhook endpoint signed/verifiable;
- reports;
- exports;
- audit trail;
- safe logs;
- safe metrics;
- safe OpenAPI;
- no payment initiation;
- no automatic Payment creation;
- no automatic final reconciliation;
- no public administrative endpoints;
- no WordPress bank access;
- no external AI with real bank data.
```

El módulo quedará preparado para futuras specs de:

```text id="tqlemo"
open-banking-payment-initiation
advanced-reconciliation
bank-rules-automation
financial-closing
accounting-ledger
treasury-management
multi-currency
bank-consent-compliance
reconciliation-ai-assistance
```
