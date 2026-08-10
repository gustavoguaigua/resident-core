# Tasks — Spec 019 Open Banking Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                         |
| Spec ID         | 019                                                                                                                                                                   |
| Módulo          | Open Banking Integration                                                                                                                                              |
| Documento       | Tasks                                                                                                                                                                 |
| Ruta            | `docs/specs/019-open-banking-integration/tasks.md`                                                                                                                    |
| Versión         | 0.1                                                                                                                                                                   |
| Estado          | needs-review                                                                                                                                                          |
| Fecha           | 2026-07-23                                                                                                                                                            |
| Documento base  | `docs/specs/019-open-banking-integration/spec.md`                                                                                                                     |
| Plan técnico    | `docs/specs/019-open-banking-integration/plan.md`                                                                                                                     |
| Modelo de datos | `docs/specs/019-open-banking-integration/data-model.md`                                                                                                               |
| Contrato API    | `docs/specs/019-open-banking-integration/api-contract.md`                                                                                                             |
| Plan de pruebas | `docs/specs/019-open-banking-integration/test-plan.md`                                                                                                                |
| Naturaleza      | Tenant-scoped / Consent-driven / Bank-connection-aware / Provider-agnostic / Sync-driven / Transaction-import-aware / Reconciliation-ready / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define la lista de tareas técnicas para implementar el módulo `019-open-banking-integration`.

Las tareas están organizadas para que el equipo pueda construir el módulo de forma incremental, segura, auditable y alineada con SDD.

Regla central de implementación:

```text id="kpa7bo"
Open Banking Integration debe implementarse como un módulo financiero crítico, tenant-scoped, consent-driven, read-only en MVP, sin almacenamiento de credenciales bancarias, sin tokens raw, sin payment initiation, sin creación automática de Payments, sin actualización directa de Account Statements, sin conciliación final automática, sin endpoints públicos administrativos y sin uso de IA externa con datos bancarios reales.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text id="t1rzdr"
[ ] Pendiente
[x] Completada
[-] No aplica / descartada
[~] En progreso
[!] Bloqueada
```

---

### 3.2. Criterio para marcar una tarea como completada

Una tarea solo debe marcarse `[x]` si:

```text id="i0bpk9"
- el código fue implementado;
- los tests asociados pasan;
- no rompe multitenancy;
- no expone secretos;
- no expone datos bancarios sensibles;
- no crea Payments desde Open Banking;
- no modifica Account Statements directamente;
- no confirma conciliación bancaria final;
- genera auditoría cuando corresponde;
- cumple el contrato API;
- cumple el test-plan;
- pasa lint, typecheck y CI.
```

---

## 4. Épicas de implementación

```text id="b4nhjj"
EPIC-019-01 — Module foundation
EPIC-019-02 — Domain model
EPIC-019-03 — Database and migrations
EPIC-019-04 — Repository layer
EPIC-019-05 — Provider adapter architecture
EPIC-019-06 — SecretRef and credential safety
EPIC-019-07 — Platform provider definitions
EPIC-019-08 — Tenant Open Banking configs
EPIC-019-09 — Bank consent and authorization
EPIC-019-10 — Bank connections
EPIC-019-11 — External account discovery and links
EPIC-019-12 — Sync runs
EPIC-019-13 — Balance snapshots
EPIC-019-14 — Transaction sync, normalization and dedupe
EPIC-019-15 — Reconciliation bridge
EPIC-019-16 — Webhooks
EPIC-019-17 — Reports and exports
EPIC-019-18 — Audit
EPIC-019-19 — Observability
EPIC-019-20 — OpenAPI
EPIC-019-21 — Tests
EPIC-019-22 — Security hardening
EPIC-019-23 — CI/CD gates
```

---

# 5. EPIC-019-01 — Module foundation

## 5.1. Estructura base

```text id="tw3vbv"
apps/api/src/modules/open-banking-integration/
```

### Tasks

```text id="x2gpep"
[ ] Crear carpeta del módulo open-banking-integration.
[ ] Crear open-banking-integration.module.ts.
[ ] Registrar módulo en el módulo raíz de la API.
[ ] Crear carpeta controllers.
[ ] Crear carpeta application.
[ ] Crear carpeta application/use-cases.
[ ] Crear carpeta application/services.
[ ] Crear carpeta application/ports.
[ ] Crear carpeta domain.
[ ] Crear carpeta domain/entities.
[ ] Crear carpeta domain/value-objects.
[ ] Crear carpeta domain/events.
[ ] Crear carpeta domain/errors.
[ ] Crear carpeta infrastructure.
[ ] Crear carpeta infrastructure/persistence.
[ ] Crear carpeta infrastructure/providers.
[ ] Crear carpeta infrastructure/webhooks.
[ ] Crear carpeta infrastructure/secrets.
[ ] Crear carpeta infrastructure/sync.
[ ] Crear carpeta infrastructure/integrations.
[ ] Crear carpeta infrastructure/audit.
[ ] Crear carpeta infrastructure/reports.
[ ] Crear carpeta infrastructure/observability.
[ ] Crear carpeta dto.
[ ] Crear carpeta guards.
[ ] Crear carpeta policies.
[ ] Crear carpeta mappers.
[ ] Crear carpeta tests.
[ ] Crear barrel exports si la convención del proyecto lo usa.
```

---

## 5.2. Constantes y configuración

### Tasks

```text id="cngk9p"
[ ] Definir OPEN_BANKING_INTEGRATION_ENABLED.
[ ] Definir OPEN_BANKING_DEFAULT_ENVIRONMENT.
[ ] Definir OPEN_BANKING_DEFAULT_CURRENCY.
[ ] Definir OPEN_BANKING_REQUIRE_CONSENT.
[ ] Definir OPEN_BANKING_REQUIRE_SIGNATURE.
[ ] Definir OPEN_BANKING_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS.
[ ] Definir OPEN_BANKING_WEBHOOK_REPLAY_PROTECTION_ENABLED.
[ ] Definir OPEN_BANKING_MAX_WEBHOOK_PAYLOAD_BYTES.
[ ] Definir OPEN_BANKING_MAX_SYNC_PERIOD_DAYS.
[ ] Definir OPEN_BANKING_DEFAULT_SYNC_PERIOD_DAYS.
[ ] Definir OPEN_BANKING_SYNC_PAGE_SIZE.
[ ] Definir OPEN_BANKING_REPORT_EXPORT_ENABLED.
[ ] Definir OPEN_BANKING_SCHEDULED_SYNC_ENABLED=false.
[ ] Definir OPEN_BANKING_PAYMENT_INITIATION_ENABLED=false.
[ ] Definir OPEN_BANKING_SCREEN_SCRAPING_ENABLED=false.
[ ] Definir OPEN_BANKING_EXTERNAL_AI_ENABLED=false.
[ ] Crear OpenBankingConfigService.
[ ] Validar configuración al boot.
[ ] Rechazar production si no está explícitamente habilitado.
```

---

# 6. EPIC-019-02 — Domain model

## 6.1. Enums

### Tasks

```text id="vlnx6u"
[ ] Implementar OpenBankingProviderDefinitionStatus.
[ ] Implementar OpenBankingEnvironment.
[ ] Implementar TenantOpenBankingConfigStatus.
[ ] Implementar BankConsentStatus.
[ ] Implementar BankConsentScope.
[ ] Implementar BankConnectionStatus.
[ ] Implementar BankAccountLinkStatus.
[ ] Implementar OpenBankingSyncType.
[ ] Implementar OpenBankingSyncStatus.
[ ] Implementar OpenBankingSyncTriggerType.
[ ] Implementar OpenBankingTransactionStatus.
[ ] Implementar OpenBankingTransactionDirection.
[ ] Implementar OpenBankingTransactionType.
[ ] Implementar OpenBankingWebhookSignatureStatus.
[ ] Implementar OpenBankingWebhookProcessingStatus.
[ ] Implementar OpenBankingHashAlgorithm.
[ ] Asegurar que paymentsInitiate esté deshabilitado en MVP.
```

---

## 6.2. Value Objects

### Tasks

```text id="tg33bu"
[ ] Implementar OpenBankingProviderKey.
[ ] Implementar OpenBankingEnvironmentValue.
[ ] Implementar OpenBankingCapability.
[ ] Implementar BankConsentScopeValue.
[ ] Implementar BankConsentExpiration.
[ ] Implementar BankConnectionStatusValue.
[ ] Implementar BankAccountNumberMasked.
[ ] Implementar BankAccountNumberHash.
[ ] Implementar ExternalAccountId.
[ ] Implementar ExternalAccountIdHash.
[ ] Implementar ExternalTransactionId.
[ ] Implementar ExternalTransactionIdHash.
[ ] Implementar OpenBankingTransactionFingerprint.
[ ] Implementar OpenBankingTransactionAmount.
[ ] Implementar OpenBankingTransactionCurrency.
[ ] Implementar OpenBankingAuthorizationUrl.
[ ] Implementar OpenBankingCallbackCode.
[ ] Implementar OpenBankingTokenSecretRef.
[ ] Implementar OpenBankingRefreshTokenSecretRef.
[ ] Implementar OpenBankingCredentialSecretRef.
[ ] Implementar OpenBankingWebhookSecretRef.
[ ] Implementar OpenBankingWebhookSignature.
[ ] Implementar OpenBankingWebhookPayloadHash.
[ ] Implementar ProviderInstitutionCode.
[ ] Implementar SyncPeriod.
[ ] Implementar SyncCursor.
```

---

## 6.3. Entidades

### Tasks

```text id="xo0d7j"
[ ] Implementar OpenBankingProviderDefinition.
[ ] Implementar TenantOpenBankingConfig.
[ ] Implementar BankConsent.
[ ] Implementar BankConnection.
[ ] Implementar BankAccountLink.
[ ] Implementar OpenBankingSyncRun.
[ ] Implementar OpenBankingAccountSnapshot.
[ ] Implementar OpenBankingTransaction.
[ ] Implementar OpenBankingWebhookEvent.
[ ] Implementar invariantes de cada entidad.
[ ] Implementar métodos de transición de estado.
[ ] Implementar validaciones de metadata segura.
[ ] Implementar eventos de dominio.
```

---

## 6.4. Domain events

### Tasks

```text id="o2b73o"
[ ] Implementar OpenBankingProviderDefinitionCreatedEvent.
[ ] Implementar OpenBankingProviderDefinitionActivatedEvent.
[ ] Implementar OpenBankingProviderDefinitionDeprecatedEvent.
[ ] Implementar OpenBankingProviderDefinitionArchivedEvent.
[ ] Implementar TenantOpenBankingConfigCreatedEvent.
[ ] Implementar TenantOpenBankingConfigEnabledEvent.
[ ] Implementar TenantOpenBankingConfigDisabledEvent.
[ ] Implementar TenantOpenBankingConfigTestedEvent.
[ ] Implementar BankConsentCreatedEvent.
[ ] Implementar BankConsentAuthorizationStartedEvent.
[ ] Implementar BankConsentAuthorizedEvent.
[ ] Implementar BankConsentRevokedEvent.
[ ] Implementar BankConnectionCreatedEvent.
[ ] Implementar BankConnectionAuthorizedEvent.
[ ] Implementar BankConnectionRevokedEvent.
[ ] Implementar BankConnectionReauthorizationRequiredEvent.
[ ] Implementar BankAccountLinkDiscoveredEvent.
[ ] Implementar BankAccountLinkLinkedEvent.
[ ] Implementar BankAccountLinkUnlinkedEvent.
[ ] Implementar OpenBankingSyncStartedEvent.
[ ] Implementar OpenBankingSyncCompletedEvent.
[ ] Implementar OpenBankingSyncFailedEvent.
[ ] Implementar OpenBankingTransactionImportedEvent.
[ ] Implementar OpenBankingTransactionDuplicateDetectedEvent.
[ ] Implementar OpenBankingTransactionSentToReconciliationEvent.
[ ] Implementar OpenBankingWebhookReceivedEvent.
[ ] Implementar OpenBankingWebhookProcessedEvent.
[ ] Implementar OpenBankingWebhookRejectedEvent.
[ ] Implementar OpenBankingReportExportedEvent.
```

---

## 6.5. Domain errors

### Tasks

```text id="aq4j3l"
[ ] Implementar OPEN_BANKING_PROVIDER_DEFINITION_NOT_FOUND.
[ ] Implementar OPEN_BANKING_PROVIDER_DEFINITION_INVALID_STATUS.
[ ] Implementar OPEN_BANKING_PROVIDER_UNSUPPORTED.
[ ] Implementar TENANT_OPEN_BANKING_CONFIG_NOT_FOUND.
[ ] Implementar TENANT_OPEN_BANKING_CONFIG_INVALID_STATUS.
[ ] Implementar TENANT_OPEN_BANKING_CONFIG_DISABLED.
[ ] Implementar TENANT_OPEN_BANKING_SECRET_INVALID.
[ ] Implementar BANK_CONSENT_NOT_FOUND.
[ ] Implementar BANK_CONSENT_INVALID_STATUS.
[ ] Implementar BANK_CONSENT_EXPIRED.
[ ] Implementar BANK_CONSENT_REVOKED.
[ ] Implementar BANK_CONSENT_SCOPE_UNSUPPORTED.
[ ] Implementar BANK_CONNECTION_NOT_FOUND.
[ ] Implementar BANK_CONNECTION_INVALID_STATUS.
[ ] Implementar BANK_CONNECTION_REVOKED.
[ ] Implementar BANK_CONNECTION_DISABLED.
[ ] Implementar BANK_CONNECTION_REAUTHORIZATION_REQUIRED.
[ ] Implementar BANK_ACCOUNT_LINK_NOT_FOUND.
[ ] Implementar BANK_ACCOUNT_LINK_CROSS_TENANT_REFERENCE.
[ ] Implementar OPEN_BANKING_SYNC_ALREADY_RUNNING.
[ ] Implementar OPEN_BANKING_SYNC_PERIOD_INVALID.
[ ] Implementar OPEN_BANKING_TRANSACTION_DUPLICATE.
[ ] Implementar OPEN_BANKING_TRANSACTION_INVALID_STATUS.
[ ] Implementar OPEN_BANKING_WEBHOOK_SIGNATURE_INVALID.
[ ] Implementar OPEN_BANKING_WEBHOOK_DUPLICATE.
[ ] Implementar BANK_CREDENTIAL_STORAGE_FORBIDDEN.
[ ] Implementar RAW_TOKEN_EXPOSURE_FORBIDDEN.
[ ] Implementar PAYMENT_INITIATION_FORBIDDEN.
[ ] Implementar PUBLIC_OPEN_BANKING_ENDPOINT_FORBIDDEN.
[ ] Implementar EXTERNAL_AI_BANK_DATA_FORBIDDEN.
```

---

# 7. EPIC-019-03 — Database and migrations

## 7.1. Prisma schema

### Tasks

```text id="giq6qc"
[ ] Agregar enums Prisma Open Banking.
[ ] Crear modelo OpenBankingProviderDefinition.
[ ] Crear modelo TenantOpenBankingConfig.
[ ] Crear modelo BankConsent.
[ ] Crear modelo BankConnection.
[ ] Crear modelo BankAccountLink.
[ ] Crear modelo OpenBankingSyncRun.
[ ] Crear modelo OpenBankingAccountSnapshot.
[ ] Crear modelo OpenBankingTransaction.
[ ] Crear modelo OpenBankingWebhookEvent.
[ ] Agregar relaciones con Tenant.
[ ] Agregar relaciones con BankAccount.
[ ] Agregar relaciones con BankTransaction.
[ ] Extender SourceModule con openBankingIntegration.
[ ] Validar que ninguna tabla operativa omita tenantId.
[ ] Validar que provider definitions sean platform-scoped.
```

---

## 7.2. Migración

### Tasks

```text id="tclupj"
[ ] Crear migración 019_create_open_banking_integration.
[ ] Crear tablas nuevas.
[ ] Crear foreign keys.
[ ] Crear índices básicos.
[ ] Crear índices por tenant_id.
[ ] Crear índices por provider_key.
[ ] Crear índices por status.
[ ] Crear índices por externalAccountIdHash.
[ ] Crear índices por externalTransactionIdHash.
[ ] Crear índices por fingerprint.
[ ] Crear índices por payloadHash.
[ ] Crear índices parciales raw SQL.
[ ] Crear constraints raw SQL.
[ ] Ejecutar prisma migrate en entorno local.
[ ] Ejecutar prisma generate.
[ ] Validar migración en entorno test.
[ ] Documentar rollback si aplica.
```

---

## 7.3. Constraints

### Tasks

```text id="rwbaj6"
[ ] Constraint amount > 0 en open_banking_transactions.
[ ] Constraint balances no negativos si aplica.
[ ] Constraint period_start <= period_end.
[ ] Constraint conteos no negativos en sync runs.
[ ] Constraint authorized fields en bank_consents.
[ ] Constraint revoked fields en bank_consents.
[ ] Constraint revoked fields en bank_connections.
[ ] Constraint linked bankAccountId en bank_account_links.
[ ] Constraint completedAt en sync completed.
[ ] Constraint failedAt/errorCode en sync failed.
[ ] Constraint bankTransactionId en sentToReconciliation.
[ ] Constraint rejected reason.
[ ] Constraint ignored reason.
[ ] Constraint processedAt en webhook processed.
[ ] Constraint rejectedAt/errorCode en webhook rejected.
```

---

## 7.4. Índices parciales críticos

### Tasks

```text id="yi5n87"
[ ] Crear unique providerKey en open_banking_provider_definitions.
[ ] Crear unique enabled config por tenant/provider/environment.
[ ] Crear unique providerConsentId por tenant/provider.
[ ] Crear unique providerConnectionId por tenant/provider.
[ ] Crear unique external account por tenant/provider/connection.
[ ] Crear unique active BankAccountLink por tenant/bankAccount si aplica.
[ ] Crear unique running sync por tenant/connection/syncType.
[ ] Crear unique externalTransactionIdHash.
[ ] Crear unique fingerprint.
[ ] Crear unique providerEventId por tenant/provider.
[ ] Crear índice payloadHash + receivedAt.
```

---

# 8. EPIC-019-04 — Repository layer

## 8.1. Repository ports

### Tasks

```text id="j0lmle"
[ ] Crear OpenBankingProviderDefinitionRepositoryPort.
[ ] Crear TenantOpenBankingConfigRepositoryPort.
[ ] Crear BankConsentRepositoryPort.
[ ] Crear BankConnectionRepositoryPort.
[ ] Crear BankAccountLinkRepositoryPort.
[ ] Crear OpenBankingSyncRunRepositoryPort.
[ ] Crear OpenBankingAccountSnapshotRepositoryPort.
[ ] Crear OpenBankingTransactionRepositoryPort.
[ ] Crear OpenBankingWebhookEventRepositoryPort.
```

---

## 8.2. Prisma repositories

### Tasks

```text id="nb9iz9"
[ ] Implementar PrismaOpenBankingProviderDefinitionRepository.
[ ] Implementar PrismaTenantOpenBankingConfigRepository.
[ ] Implementar PrismaBankConsentRepository.
[ ] Implementar PrismaBankConnectionRepository.
[ ] Implementar PrismaBankAccountLinkRepository.
[ ] Implementar PrismaOpenBankingSyncRunRepository.
[ ] Implementar PrismaOpenBankingAccountSnapshotRepository.
[ ] Implementar PrismaOpenBankingTransactionRepository.
[ ] Implementar PrismaOpenBankingWebhookEventRepository.
[ ] Asegurar findFirst con tenantId en tablas tenant-scoped.
[ ] Prohibir findUnique por id simple en tablas tenant-scoped.
[ ] Implementar paginación estándar.
[ ] Implementar filtros del API Contract.
[ ] Excluir archived por defecto.
```

---

# 9. EPIC-019-05 — Provider adapter architecture

## 9.1. Provider port

### Tasks

```text id="ovcu4h"
[ ] Crear OpenBankingProviderPort.
[ ] Definir startAuthorization.
[ ] Definir exchangeAuthorizationCode.
[ ] Definir refreshConnectionToken.
[ ] Definir revokeConnection.
[ ] Definir listAccounts.
[ ] Definir getBalances.
[ ] Definir listTransactions.
[ ] Definir verifyWebhook.
[ ] Definir parseWebhookEvent.
[ ] Definir testConnection.
[ ] Definir tipos input/output para cada método.
[ ] Asegurar que el puerto no exponga tokens raw fuera de capa interna.
```

---

## 9.2. Adapter registry

### Tasks

```text id="klh1xt"
[ ] Crear OpenBankingAdapterRegistryPort.
[ ] Implementar OpenBankingAdapterRegistry.
[ ] Registrar MockOpenBankingProviderAdapter.
[ ] Registrar SandboxOpenBankingProviderAdapter.
[ ] Registrar GenericReadOnlyOpenBankingAdapter.
[ ] Rechazar providerKey no soportado.
[ ] Exponer lista segura de providers.
[ ] Evitar exposición de credenciales o secrets.
```

---

## 9.3. Mock adapter

### Tasks

```text id="ii3az3"
[ ] Implementar MockOpenBankingProviderAdapter.
[ ] Implementar startAuthorization mock.
[ ] Implementar exchangeAuthorizationCode mock.
[ ] Implementar refreshConnectionToken mock.
[ ] Implementar revokeConnection mock.
[ ] Implementar listAccounts mock.
[ ] Implementar getBalances mock.
[ ] Implementar listTransactions mock.
[ ] Implementar verifyWebhook mock.
[ ] Implementar parseWebhookEvent mock.
[ ] Implementar testConnection mock.
[ ] Usar únicamente datos ficticios.
[ ] No usar credenciales reales.
[ ] No usar endpoints bancarios reales.
```

---

## 9.4. Sandbox adapter

### Tasks

```text id="jiiadx"
[ ] Implementar SandboxOpenBankingProviderAdapter.
[ ] Bloquear production por defecto.
[ ] Manejar timeout.
[ ] Manejar rate limit.
[ ] Manejar provider unavailable.
[ ] Sanitizar errores del proveedor.
[ ] Evitar logs con payload completo.
[ ] Evitar logs con tokens.
[ ] Preparar estructura para adapters reales futuros.
```

---

# 10. EPIC-019-06 — SecretRef and credential safety

## 10.1. Secret port

### Tasks

```text id="d6m251"
[ ] Crear OpenBankingSecretPort.
[ ] Implementar storeCredential.
[ ] Implementar storeToken.
[ ] Implementar updateToken.
[ ] Implementar rotateCredential.
[ ] Implementar revokeToken.
[ ] Implementar getSecret solo para uso interno.
[ ] Crear OpenBankingSecretService.
[ ] Devolver solo SecretRef.
[ ] Evitar secret values en responses.
```

---

## 10.2. No credential storage policy

### Tasks

```text id="a49to9"
[ ] Crear NoBankCredentialStoragePolicy.
[ ] Rechazar bank username.
[ ] Rechazar bank password.
[ ] Rechazar OTP.
[ ] Rechazar MFA secret.
[ ] Rechazar security questions.
[ ] Rechazar raw session cookie.
[ ] Rechazar raw access token en DTO.
[ ] Rechazar raw refresh token en DTO.
[ ] Rechazar secrets en metadata.
[ ] Añadir tests de payload malicioso.
```

---

# 11. EPIC-019-07 — Platform provider definitions

## 11.1. Controller

### Tasks

```text id="oyjmxo"
[ ] Crear PlatformOpenBankingProviderDefinitionsController.
[ ] Implementar GET /platform/open-banking-provider-definitions.
[ ] Implementar POST /platform/open-banking-provider-definitions.
[ ] Implementar GET /platform/open-banking-provider-definitions/{id}.
[ ] Implementar PATCH /platform/open-banking-provider-definitions/{id}.
[ ] Implementar POST /activate.
[ ] Implementar POST /deprecate.
[ ] Implementar POST /archive.
[ ] Aplicar PlatformOpenBankingGuard.
[ ] Aplicar permisos platform.
```

---

## 11.2. Service

### Tasks

```text id="yvaygt"
[ ] Crear OpenBankingProviderDefinitionService.
[ ] Implementar create.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update.
[ ] Implementar activate.
[ ] Implementar deprecate.
[ ] Implementar archive.
[ ] Validar providerKey único.
[ ] Validar metadata sin secretos.
[ ] Bloquear supportsPaymentInitiation=true en MVP.
[ ] Emitir auditoría.
```

---

# 12. EPIC-019-08 — Tenant Open Banking configs

## 12.1. Controller

### Tasks

```text id="g64l67"
[ ] Crear TenantOpenBankingConfigsController.
[ ] Implementar GET /tenant/open-banking/configs.
[ ] Implementar POST /tenant/open-banking/configs.
[ ] Implementar GET /tenant/open-banking/configs/{configId}.
[ ] Implementar PATCH /tenant/open-banking/configs/{configId}.
[ ] Implementar POST /enable.
[ ] Implementar POST /disable.
[ ] Implementar POST /test-connection.
[ ] Implementar POST /archive.
[ ] Aplicar TenantOpenBankingGuard.
[ ] Aplicar PermissionGuard.
```

---

## 12.2. Service

### Tasks

```text id="d6f9kl"
[ ] Crear TenantOpenBankingConfigService.
[ ] Implementar create config.
[ ] Implementar list configs.
[ ] Implementar get config.
[ ] Implementar update config.
[ ] Implementar enable config.
[ ] Implementar disable config.
[ ] Implementar testConnection.
[ ] Implementar archive config.
[ ] Convertir secretValue a SecretRef.
[ ] No persistir secretValue.
[ ] No devolver credentialSecretRef en DTO estándar.
[ ] No devolver webhookSecretRef en DTO estándar.
[ ] Validar providerDefinition active.
[ ] Validar SecretRefs requeridos antes de enable.
[ ] Emitir auditoría.
```

---

# 13. EPIC-019-09 — Bank consent and authorization

## 13.1. Consent controller

### Tasks

```text id="hkzilx"
[ ] Crear BankConsentsController.
[ ] Implementar GET /tenant/open-banking/consents.
[ ] Implementar POST /tenant/open-banking/consents.
[ ] Implementar GET /tenant/open-banking/consents/{consentId}.
[ ] Implementar POST /start-authorization.
[ ] Implementar POST /renew.
[ ] Implementar POST /revoke.
[ ] Implementar POST /archive.
[ ] Aplicar permisos de consents.
```

---

## 13.2. Consent service

### Tasks

```text id="c2ycb1"
[ ] Crear BankConsentService.
[ ] Implementar create draft consent.
[ ] Validar config tenant-scoped.
[ ] Validar config enabled para autorización.
[ ] Validar scopes permitidos.
[ ] Rechazar paymentsInitiate en MVP.
[ ] Implementar startAuthorization.
[ ] Implementar renew.
[ ] Implementar revoke.
[ ] Implementar archive.
[ ] Bloquear sync si consentimiento expired.
[ ] Bloquear sync si consentimiento revoked.
[ ] Emitir auditoría.
```

---

## 13.3. Authorization service

### Tasks

```text id="tir4q4"
[ ] Crear BankAuthorizationService.
[ ] Invocar adapter.startAuthorization.
[ ] Generar authorizationUrl temporal.
[ ] Guardar solo authorizationUrlHash si se requiere.
[ ] Evitar authorizationUrl en logs.
[ ] Evitar authorizationUrl en audit.
[ ] Implementar callback/código de autorización en capa interna.
[ ] Invocar adapter.exchangeAuthorizationCode.
[ ] Guardar token como SecretRef.
[ ] Guardar refresh token como SecretRef si aplica.
[ ] Marcar BankConsent authorized.
[ ] Crear BankConnection active.
[ ] Manejar authorization failed.
[ ] Emitir auditoría.
```

---

# 14. EPIC-019-10 — Bank connections

## 14.1. Controller

### Tasks

```text id="xjqvb6"
[ ] Crear BankConnectionsController.
[ ] Implementar GET /tenant/open-banking/connections.
[ ] Implementar GET /tenant/open-banking/connections/{connectionId}.
[ ] Implementar PATCH /tenant/open-banking/connections/{connectionId}.
[ ] Implementar POST /revoke.
[ ] Implementar POST /disable.
[ ] Implementar POST /archive.
[ ] Aplicar permisos.
[ ] Evitar exposición de tokenSecretRef.
[ ] Evitar exposición de refreshTokenSecretRef.
```

---

## 14.2. Service

### Tasks

```text id="jrl1pn"
[ ] Crear BankConnectionService.
[ ] Implementar list.
[ ] Implementar get.
[ ] Implementar update metadata segura.
[ ] Implementar revoke.
[ ] Implementar disable.
[ ] Implementar archive.
[ ] Implementar markReauthorizationRequired.
[ ] Validar active antes de sync.
[ ] Bloquear revoked para sync.
[ ] Bloquear disabled para sync.
[ ] Bloquear reauthorizationRequired para sync.
[ ] Invocar adapter.revokeConnection si aplica.
[ ] Revocar SecretRefs si aplica.
[ ] Emitir auditoría.
```

---

# 15. EPIC-019-11 — External account discovery and links

## 15.1. Discovery service

### Tasks

```text id="z5aiv0"
[ ] Crear BankAccountDiscoveryService.
[ ] Invocar adapter.listAccounts.
[ ] Crear BankAccountLink pendingLink.
[ ] Calcular externalAccountIdHash.
[ ] Calcular accountNumberHash si aplica.
[ ] Persistir accountNumberMasked.
[ ] No persistir número completo de cuenta.
[ ] Deduplicar external accounts.
[ ] Manejar cuentas sin número.
[ ] Emitir auditoría bankAccountLink.discovered.
```

---

## 15.2. Account links controller

### Tasks

```text id="h7vyqf"
[ ] Crear BankAccountLinksController.
[ ] Implementar GET /tenant/open-banking/account-links.
[ ] Implementar POST /tenant/open-banking/account-links.
[ ] Implementar GET /tenant/open-banking/account-links/{accountLinkId}.
[ ] Implementar POST /link-bank-account.
[ ] Implementar POST /unlink-bank-account.
[ ] Implementar POST /disable.
[ ] Implementar POST /archive.
[ ] Aplicar permisos.
[ ] No exponer externalAccountIdHash.
[ ] No exponer accountNumberHash.
[ ] No exponer número completo de cuenta.
```

---

## 15.3. Account link service

### Tasks

```text id="tl5diy"
[ ] Crear BankAccountLinkService.
[ ] Implementar create pendingLink.
[ ] Implementar linkBankAccount.
[ ] Validar BankAccount tenant-scoped.
[ ] Rechazar BankAccount tenant B.
[ ] Rechazar BankAccount archived.
[ ] Implementar unlink.
[ ] Implementar disable.
[ ] Implementar archive.
[ ] Preservar historial de vínculo.
[ ] Emitir auditoría.
```

---

# 16. EPIC-019-12 — Sync runs

## 16.1. Controller

### Tasks

```text id="ttlm4o"
[ ] Crear OpenBankingSyncRunsController.
[ ] Implementar GET /tenant/open-banking/sync-runs.
[ ] Implementar POST /tenant/open-banking/connections/{connectionId}/sync.
[ ] Implementar GET /tenant/open-banking/sync-runs/{syncRunId}.
[ ] Implementar POST /retry.
[ ] Implementar POST /cancel.
[ ] Implementar POST /archive.
[ ] Aplicar permisos.
[ ] Aplicar Idempotency-Key donde corresponda.
```

---

## 16.2. Sync run service

### Tasks

```text id="dklytg"
[ ] Crear OpenBankingSyncRunService.
[ ] Implementar startSync.
[ ] Validar connection active.
[ ] Validar consent authorized vigente.
[ ] Validar config enabled.
[ ] Validar scopes requeridos.
[ ] Validar periodo para transactions.
[ ] Validar periodo máximo 90 días.
[ ] Bloquear sync concurrente por connection/syncType.
[ ] Crear syncRun queued/running.
[ ] Actualizar status completed.
[ ] Actualizar status completedWithWarnings.
[ ] Actualizar status failed.
[ ] Implementar retry.
[ ] Implementar cancel.
[ ] Implementar archive.
[ ] Persistir conteos.
[ ] Sanitizar errorMessage.
[ ] Emitir auditoría.
```

---

# 17. EPIC-019-13 — Balance snapshots

## 17.1. Controller

### Tasks

```text id="v6t4nd"
[ ] Crear OpenBankingAccountSnapshotsController.
[ ] Implementar GET /tenant/open-banking/account-snapshots.
[ ] Aplicar filtros por connectionId.
[ ] Aplicar filtros por accountLinkId.
[ ] Aplicar filtros por bankAccountId.
[ ] Aplicar filtros por syncRunId.
[ ] Aplicar filtros por snapshotFrom/snapshotTo.
[ ] Exponer montos como string decimal.
```

---

## 17.2. Balance sync service

### Tasks

```text id="a4tg84"
[ ] Crear OpenBankingBalanceSyncService.
[ ] Invocar adapter.getBalances.
[ ] Validar currency USD.
[ ] Usar Decimal.
[ ] Crear OpenBankingAccountSnapshot.
[ ] Asociar snapshot con syncRun.
[ ] Asociar snapshot con bankAccountLink.
[ ] Asociar bankAccountId si existe.
[ ] No modificar Account Statements.
[ ] No crear Payment.
[ ] Emitir auditoría de sync.
```

---

# 18. EPIC-019-14 — Transaction sync, normalization and dedupe

## 18.1. Transaction controller

### Tasks

```text id="dvvu70"
[ ] Crear OpenBankingTransactionsController.
[ ] Implementar GET /tenant/open-banking/transactions.
[ ] Implementar GET /tenant/open-banking/transactions/{openBankingTransactionId}.
[ ] Implementar POST /send-to-reconciliation.
[ ] Implementar POST /ignore.
[ ] Implementar POST /archive.
[ ] Aplicar filtros del API Contract.
[ ] Exponer amount como string decimal.
[ ] No exponer fingerprint.
[ ] No exponer externalTransactionIdHash.
[ ] No exponer raw provider payload.
```

---

## 18.2. Transaction sync service

### Tasks

```text id="lptol5"
[ ] Crear OpenBankingTransactionSyncService.
[ ] Invocar adapter.listTransactions.
[ ] Validar connection active.
[ ] Validar consent vigente.
[ ] Validar accountLink si se especifica.
[ ] Normalizar movimientos.
[ ] Calcular externalTransactionIdHash.
[ ] Calcular fingerprint.
[ ] Deduplicar.
[ ] Crear OpenBankingTransaction imported.
[ ] Marcar duplicados como duplicate.
[ ] Marcar inválidos como rejected.
[ ] Actualizar conteos de syncRun.
[ ] No crear Payment.
[ ] No actualizar Account Statements.
[ ] No enviar automáticamente a conciliación en MVP.
```

---

## 18.3. Normalization service

### Tasks

```text id="smth02"
[ ] Crear OpenBankingTransactionNormalizationService.
[ ] Normalizar transactionDate.
[ ] Normalizar postedDate.
[ ] Normalizar description.
[ ] Normalizar reference.
[ ] Normalizar bankReference.
[ ] Clasificar direction.
[ ] Clasificar transactionType.
[ ] Detectar paymentProviderSettlement como tipo candidato.
[ ] Validar amount > 0.
[ ] Validar currency USD.
[ ] Rechazar datos inseguros.
[ ] Sanitizar texto.
```

---

## 18.4. Dedupe service

### Tasks

```text id="ybks90"
[ ] Crear OpenBankingTransactionDedupeService.
[ ] Deduplicar por externalTransactionIdHash.
[ ] Deduplicar por fingerprint.
[ ] Evitar duplicados en retry.
[ ] Evitar duplicados por webhook repetido.
[ ] Marcar duplicate.
[ ] Asociar duplicateOfTransactionId.
[ ] Evitar que duplicate sea conciliable.
[ ] Asegurar dedupe tenant-scoped.
[ ] Asegurar dedupe por bankConnection y bankAccountLink.
```

---

# 19. EPIC-019-15 — Reconciliation bridge

## 19.1. Port

### Tasks

```text id="u8v9hc"
[ ] Crear BankReconciliationIntegrationPort.
[ ] Definir createBankTransactionFromOpenBanking.
[ ] Definir findExistingBankTransactionBySource.
[ ] Definir validateBankAccountTenant.
[ ] Definir getBankTransactionForSource.
[ ] Asegurar que el puerto no cree matches automáticamente.
```

---

## 19.2. Bridge service

### Tasks

```text id="n5vp7n"
[ ] Crear OpenBankingReconciliationBridgeService.
[ ] Implementar sendToReconciliation.
[ ] Validar OpenBankingTransaction tenant-scoped.
[ ] Rechazar duplicate.
[ ] Rechazar ignored.
[ ] Rechazar rejected.
[ ] Rechazar archived.
[ ] Validar BankAccountLink linked.
[ ] Validar BankAccount tenant-scoped.
[ ] Crear o reutilizar BankTransaction.
[ ] Marcar OpenBankingTransaction sentToReconciliation.
[ ] Persistir bankTransactionId.
[ ] No crear Payment.
[ ] No crear ReconciliationMatch.
[ ] No marcar BankTransaction matched.
[ ] No cerrar ReconciliationSession.
[ ] Emitir auditoría openBankingTransaction.sentToReconciliation.
```

---

## 19.3. Integración con 018 Payment Provider Integration

### Tasks

```text id="whlt6o"
[ ] Detectar transactionType paymentProviderSettlement.
[ ] Consultar ProviderSettlementRecord si aplica.
[ ] Cruzar netAmount/grossAmount de forma informativa.
[ ] Marcar diferencias como requiresReview.
[ ] No marcar provider settlement como reconciled automáticamente.
[ ] No alterar ProviderPaymentMapping.
[ ] Emitir metadata segura.
```

---

# 20. EPIC-019-16 — Webhooks

## 20.1. Webhook controller

### Tasks

```text id="hys7e2"
[ ] Crear OpenBankingWebhooksController.
[ ] Implementar POST /api/v1/webhooks/open-banking/{providerKey}.
[ ] Implementar captura de raw body.
[ ] Validar payload size.
[ ] Calcular payloadHash.
[ ] Calcular payloadHashPrefix.
[ ] Calcular signatureHeaderHash.
[ ] Invocar adapter.verifyWebhook.
[ ] Crear OpenBankingWebhookEvent.
[ ] Responder seguro.
[ ] No revelar tenant.
[ ] No revelar detalles internos de firma.
```

---

## 20.2. Webhook service

### Tasks

```text id="hu077y"
[ ] Crear OpenBankingWebhookService.
[ ] Resolver providerKey.
[ ] Validar firma si corresponde.
[ ] Validar timestamp.
[ ] Detectar replay.
[ ] Detectar providerEventId duplicado.
[ ] Parsear evento con adapter.
[ ] Resolver tenant/config/connection.
[ ] Bloquear efectos si tenant unresolved.
[ ] Procesar transactions.available.
[ ] Procesar consent.expired si aplica.
[ ] Procesar connection.revoked si aplica.
[ ] Disparar sync webhook-triggered si policy lo permite.
[ ] Mantener idempotencia.
[ ] No crear Payment.
[ ] No crear conciliación final.
[ ] Emitir auditoría.
```

---

## 20.3. Webhook events admin API

### Tasks

```text id="sco7og"
[ ] Implementar GET /tenant/open-banking/webhook-events.
[ ] Implementar GET /tenant/open-banking/webhook-events/{webhookEventId}.
[ ] Implementar POST /reprocess.
[ ] Implementar POST /archive.
[ ] Reprocess solo para failed.
[ ] Bloquear reprocess de invalid signature ordinario.
[ ] Bloquear reprocess de duplicate.
[ ] Bloquear reprocess de processed salvo flujo excepcional futuro.
[ ] No exponer raw payload.
[ ] No exponer raw signature.
```

---

# 21. EPIC-019-17 — Reports and exports

## 21.1. Report service

### Tasks

```text id="gehrhw"
[ ] Crear OpenBankingReportService.
[ ] Implementar summary report.
[ ] Implementar sync status report.
[ ] Implementar imported transactions report.
[ ] Implementar errors report.
[ ] Aplicar tenantId en todas las consultas.
[ ] Excluir secretos.
[ ] Excluir tokens.
[ ] Excluir número completo de cuenta.
[ ] Excluir raw payload.
[ ] Excluir raw signature.
```

---

## 21.2. Report controller

### Tasks

```text id="f8x6qa"
[ ] Crear OpenBankingReportsController.
[ ] Implementar GET /reports/summary.
[ ] Implementar GET /reports/sync-status.
[ ] Implementar GET /reports/imported-transactions.
[ ] Implementar GET /reports/errors.
[ ] Implementar GET /reports/export.
[ ] Aplicar openBankingReports.read.
[ ] Aplicar openBankingReports.export.
[ ] Aplicar paginación.
[ ] Aplicar filtros.
```

---

## 21.3. Export integration

### Tasks

```text id="fdpygz"
[ ] Crear OpenBankingReportExportService.
[ ] Soportar csv.
[ ] Soportar xlsx si la plataforma ya lo soporta.
[ ] Soportar pdf si la plataforma ya lo soporta.
[ ] Integrar Secure Document Storage.
[ ] Usar sourceModule=openBankingIntegration.
[ ] Usar visibility=administrative.
[ ] Usar sensitivity=restricted.
[ ] No exponer storageKey.
[ ] Auditar openBankingReport.exported.
```

---

# 22. EPIC-019-18 — Audit

## 22.1. Audit integration

### Tasks

```text id="blx85n"
[ ] Crear OpenBankingAuditService.
[ ] Integrar AuditPort.
[ ] Emitir providerDefinition.created.
[ ] Emitir providerDefinition.updated.
[ ] Emitir providerDefinition.activated.
[ ] Emitir providerDefinition.deprecated.
[ ] Emitir providerDefinition.archived.
[ ] Emitir tenantOpenBankingConfig.created.
[ ] Emitir tenantOpenBankingConfig.updated.
[ ] Emitir tenantOpenBankingConfig.enabled.
[ ] Emitir tenantOpenBankingConfig.disabled.
[ ] Emitir tenantOpenBankingConfig.tested.
[ ] Emitir tenantOpenBankingConfig.invalidated.
[ ] Emitir tenantOpenBankingConfig.archived.
[ ] Emitir bankConsent.created.
[ ] Emitir bankConsent.authorizationStarted.
[ ] Emitir bankConsent.authorized.
[ ] Emitir bankConsent.renewed.
[ ] Emitir bankConsent.expired.
[ ] Emitir bankConsent.revoked.
[ ] Emitir bankConsent.failed.
[ ] Emitir bankConsent.archived.
[ ] Emitir bankConnection.created.
[ ] Emitir bankConnection.authorized.
[ ] Emitir bankConnection.syncing.
[ ] Emitir bankConnection.failed.
[ ] Emitir bankConnection.reauthorizationRequired.
[ ] Emitir bankConnection.revoked.
[ ] Emitir bankConnection.disabled.
[ ] Emitir bankConnection.archived.
[ ] Emitir bankAccountLink.discovered.
[ ] Emitir bankAccountLink.linked.
[ ] Emitir bankAccountLink.unlinked.
[ ] Emitir bankAccountLink.disabled.
[ ] Emitir bankAccountLink.archived.
[ ] Emitir openBankingSync.started.
[ ] Emitir openBankingSync.completed.
[ ] Emitir openBankingSync.completedWithWarnings.
[ ] Emitir openBankingSync.failed.
[ ] Emitir openBankingSync.cancelled.
[ ] Emitir openBankingSync.retried.
[ ] Emitir openBankingSync.archived.
[ ] Emitir openBankingTransaction.imported.
[ ] Emitir openBankingTransaction.duplicateDetected.
[ ] Emitir openBankingTransaction.rejected.
[ ] Emitir openBankingTransaction.requiresReview.
[ ] Emitir openBankingTransaction.ignored.
[ ] Emitir openBankingTransaction.sentToReconciliation.
[ ] Emitir openBankingTransaction.archived.
[ ] Emitir openBankingWebhook.received.
[ ] Emitir openBankingWebhook.verified.
[ ] Emitir openBankingWebhook.rejected.
[ ] Emitir openBankingWebhook.duplicate.
[ ] Emitir openBankingWebhook.processed.
[ ] Emitir openBankingWebhook.failed.
[ ] Emitir openBankingWebhook.reprocessed.
[ ] Emitir openBankingWebhook.archived.
[ ] Emitir openBankingReport.exported.
```

---

## 22.2. Audit sanitization

### Tasks

```text id="iprqyk"
[ ] Crear OpenBankingAuditSanitizer.
[ ] Permitir metadata segura.
[ ] Remover bank username.
[ ] Remover bank password.
[ ] Remover OTP.
[ ] Remover MFA secret.
[ ] Remover raw token.
[ ] Remover raw refresh token.
[ ] Remover raw client secret.
[ ] Remover raw webhook secret.
[ ] Remover full account number.
[ ] Remover full provider payload.
[ ] Remover full webhook signature.
[ ] Remover Authorization header.
[ ] Remover cookies.
[ ] Remover storageKey.
[ ] Remover signedUrl.
[ ] Remover SQL raw.
[ ] Remover stack trace.
```

---

# 23. EPIC-019-19 — Observability

## 23.1. Logs

### Tasks

```text id="b1c4oi"
[ ] Crear OpenBankingLogger.
[ ] Loggear action.
[ ] Loggear outcome.
[ ] Loggear providerKey.
[ ] Loggear environment.
[ ] Loggear status.
[ ] Loggear syncType.
[ ] Loggear triggerType.
[ ] Loggear eventType.
[ ] Loggear signatureStatus.
[ ] Loggear processingStatus.
[ ] Loggear currency.
[ ] Loggear durationMs.
[ ] Loggear errorCode.
[ ] No loggear tokens.
[ ] No loggear SecretRefs.
[ ] No loggear full account number.
[ ] No loggear raw payload.
[ ] No loggear raw signature.
[ ] No loggear authorizationUrl.
[ ] No loggear storageKey.
```

---

## 23.2. Metrics

### Tasks

```text id="z6it3v"
[ ] Crear OpenBankingMetricsService.
[ ] Emitir open_banking_configs_total.
[ ] Emitir open_banking_connections_total.
[ ] Emitir open_banking_consents_authorized_total.
[ ] Emitir open_banking_consents_revoked_total.
[ ] Emitir open_banking_sync_runs_total.
[ ] Emitir open_banking_sync_failed_total.
[ ] Emitir open_banking_transactions_imported_total.
[ ] Emitir open_banking_transactions_duplicate_total.
[ ] Emitir open_banking_transactions_sent_to_reconciliation_total.
[ ] Emitir open_banking_webhooks_received_total.
[ ] Emitir open_banking_webhooks_rejected_total.
[ ] Emitir open_banking_provider_errors_total.
[ ] Usar labels permitidos.
[ ] Prohibir tenantId como label.
[ ] Prohibir userId como label.
[ ] Prohibir account ids como labels.
[ ] Prohibir token refs como labels.
```

---

# 24. EPIC-019-20 — OpenAPI

## 24.1. Tags

### Tasks

```text id="pvvsmg"
[ ] Crear tag Open Banking Provider Definitions.
[ ] Crear tag Tenant Open Banking Configs.
[ ] Crear tag Bank Consents.
[ ] Crear tag Bank Connections.
[ ] Crear tag Bank Account Links.
[ ] Crear tag Open Banking Sync Runs.
[ ] Crear tag Open Banking Account Snapshots.
[ ] Crear tag Open Banking Transactions.
[ ] Crear tag Open Banking Webhooks.
[ ] Crear tag Open Banking Reports.
```

---

## 24.2. Extensions

### Tasks

```text id="sj4tls"
[ ] Agregar x-platform-scope en endpoints platform.
[ ] Agregar x-tenant-scope en endpoints tenant.
[ ] Agregar x-auth-required.
[ ] Agregar x-open-banking-integration.
[ ] Agregar x-bank-data en endpoints tenant.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-secrets-exposed=false.
[ ] Agregar x-consent-required en consent endpoints.
[ ] Agregar x-bank-credential-storage=false.
[ ] Agregar x-webhook-endpoint en webhook.
[ ] Agregar x-provider-signature-required en webhook.
[ ] Agregar x-idempotent-processing en webhook y sync.
[ ] Agregar x-reconciliation-bridge en send-to-reconciliation.
[ ] Agregar x-creates-payment=false.
[ ] Agregar x-final-reconciliation=false.
[ ] Validar que no exista /me Open Banking.
[ ] Validar que no existan endpoints públicos administrativos.
```

---

# 25. EPIC-019-21 — Tests

## 25.1. Unit tests

### Tasks

```text id="yxnpp2"
[ ] Crear tests para value objects.
[ ] Crear tests para entities.
[ ] Crear tests para state machines.
[ ] Crear tests para domain events.
[ ] Crear tests para domain errors.
[ ] Crear tests para policies.
[ ] Crear tests para mappers.
```

---

## 25.2. Repository tests

### Tasks

```text id="w83esk"
[ ] Test OpenBankingProviderDefinitionRepository.
[ ] Test TenantOpenBankingConfigRepository.
[ ] Test BankConsentRepository.
[ ] Test BankConnectionRepository.
[ ] Test BankAccountLinkRepository.
[ ] Test OpenBankingSyncRunRepository.
[ ] Test OpenBankingAccountSnapshotRepository.
[ ] Test OpenBankingTransactionRepository.
[ ] Test OpenBankingWebhookEventRepository.
[ ] Test tenant isolation en todos los repositorios tenant-scoped.
[ ] Test índices únicos.
[ ] Test constraints.
```

---

## 25.3. Service tests

### Tasks

```text id="wn73xb"
[ ] Test OpenBankingProviderDefinitionService.
[ ] Test TenantOpenBankingConfigService.
[ ] Test OpenBankingSecretService.
[ ] Test BankConsentService.
[ ] Test BankAuthorizationService.
[ ] Test BankConnectionService.
[ ] Test BankAccountDiscoveryService.
[ ] Test BankAccountLinkService.
[ ] Test OpenBankingSyncRunService.
[ ] Test OpenBankingBalanceSyncService.
[ ] Test OpenBankingTransactionSyncService.
[ ] Test OpenBankingTransactionNormalizationService.
[ ] Test OpenBankingTransactionDedupeService.
[ ] Test OpenBankingReconciliationBridgeService.
[ ] Test OpenBankingWebhookService.
[ ] Test OpenBankingReportService.
```

---

## 25.4. Adapter tests

### Tasks

```text id="gmcw7q"
[ ] Test MockOpenBankingProviderAdapter.
[ ] Test SandboxOpenBankingProviderAdapter.
[ ] Test OpenBankingAdapterRegistry.
[ ] Test timeout.
[ ] Test rate limit.
[ ] Test provider unavailable.
[ ] Test providerKey unsupported.
[ ] Test sanitized provider errors.
```

---

## 25.5. API tests

### Tasks

```text id="eqqklp"
[ ] Test Platform provider definitions endpoints.
[ ] Test Tenant configs endpoints.
[ ] Test Bank consents endpoints.
[ ] Test Bank connections endpoints.
[ ] Test Bank account links endpoints.
[ ] Test Sync runs endpoints.
[ ] Test Account snapshots endpoint.
[ ] Test Transactions endpoints.
[ ] Test Webhook endpoint.
[ ] Test Webhook events admin endpoints.
[ ] Test Reports endpoints.
[ ] Test public endpoints forbidden.
[ ] Test no /me Open Banking endpoints.
```

---

## 25.6. Security tests

### Tasks

```text id="gx9r3i"
[ ] Test no tenantId body.
[ ] Test no cross-tenant config.
[ ] Test no cross-tenant consent.
[ ] Test no cross-tenant connection.
[ ] Test no cross-tenant account link.
[ ] Test no cross-tenant sync run.
[ ] Test no cross-tenant transaction.
[ ] Test no cross-tenant webhook event.
[ ] Test no bank username persisted.
[ ] Test no bank password persisted.
[ ] Test no OTP persisted.
[ ] Test no MFA secret persisted.
[ ] Test no raw tokens persisted.
[ ] Test no full account number persisted.
[ ] Test no raw provider payload persisted.
[ ] Test no raw webhook signature persisted.
[ ] Test webhook signature validation.
[ ] Test webhook replay protection.
[ ] Test no Payment creation.
[ ] Test no Account Statements mutation.
[ ] Test no final reconciliation.
[ ] Test no WordPress bank access.
[ ] Test external AI disabled.
```

---

## 25.7. Performance and concurrency tests

### Tasks

```text id="bc0kcq"
[ ] Test listar conexiones p95 < 800 ms.
[ ] Test iniciar autorización p95 < 1200 ms sin latencia proveedor.
[ ] Test sync cuentas pequeñas p95 < 2000 ms sin latencia proveedor.
[ ] Test sync movimientos típicos p95 < 5000 ms sin latencia proveedor.
[ ] Test send-to-reconciliation p95 < 1200 ms.
[ ] Test reporte summary p95 < 1000 ms.
[ ] Test sync duplicado concurrente.
[ ] Test webhook duplicado concurrente.
[ ] Test retry concurrente.
[ ] Test send-to-reconciliation concurrente.
[ ] Test link-bank-account concurrente.
```

---

# 26. EPIC-019-22 — Security hardening

## 26.1. Hardening de DTOs

### Tasks

```text id="u4u7sn"
[ ] Activar whitelist.
[ ] Activar forbidNonWhitelisted.
[ ] Rechazar tenantId.
[ ] Rechazar createdBy.
[ ] Rechazar updatedBy.
[ ] Rechazar status directo salvo transición controlada.
[ ] Rechazar bank username.
[ ] Rechazar bank password.
[ ] Rechazar OTP.
[ ] Rechazar MFA secret.
[ ] Rechazar tokenSecretRef en superficies no autorizadas.
[ ] Rechazar raw token.
[ ] Rechazar raw refresh token.
[ ] Rechazar full account number.
[ ] Rechazar raw provider payload.
[ ] Rechazar raw webhook signature.
[ ] Rechazar payment initiation fields.
```

---

## 26.2. Endpoint hardening

### Tasks

```text id="wqr1z7"
[ ] Verificar que no existan endpoints /public Open Banking.
[ ] Verificar que no exista /me Open Banking en MVP.
[ ] Verificar CORS restrictivo.
[ ] Aplicar Cache-Control no-store.
[ ] Aplicar rate limits en sync.
[ ] Aplicar rate limits en test-connection.
[ ] Aplicar rate limits en webhook.
[ ] Aplicar payload size limit en webhook.
[ ] Sanitizar todos los errores.
[ ] Evitar stack traces en producción.
```

---

## 26.3. Financial hardening

### Tasks

```text id="cyel20"
[ ] Verificar que sync no cree Payment.
[ ] Verificar que webhook no cree Payment.
[ ] Verificar que send-to-reconciliation no cree Payment.
[ ] Verificar que balance snapshot no modifique Account Statements.
[ ] Verificar que transaction sync no modifique Account Statements.
[ ] Verificar que send-to-reconciliation no cree ReconciliationMatch.
[ ] Verificar que send-to-reconciliation no marque BankTransaction matched.
[ ] Verificar que settlement detection no marque reconciled automáticamente.
```

---

# 27. EPIC-019-23 — CI/CD gates

## 27.1. Pipeline

### Tasks

```text id="cjlf36"
[ ] Agregar lint gate.
[ ] Agregar typecheck gate.
[ ] Agregar unit test gate.
[ ] Agregar repository test gate.
[ ] Agregar service test gate.
[ ] Agregar adapter test gate.
[ ] Agregar API test gate.
[ ] Agregar authorization test gate.
[ ] Agregar multitenancy test gate.
[ ] Agregar security test gate.
[ ] Agregar financial integrity test gate.
[ ] Agregar webhook test gate.
[ ] Agregar OpenAPI test gate.
[ ] Agregar audit test gate.
[ ] Agregar observability test gate.
[ ] Agregar smoke test gate.
```

---

## 27.2. Gates críticos

### Tasks

```text id="itz6wg"
[ ] Fallar CI si OpenAPI documenta endpoints públicos administrativos.
[ ] Fallar CI si OpenAPI documenta /me Open Banking.
[ ] Fallar CI si snapshots contienen tokens.
[ ] Fallar CI si snapshots contienen credenciales bancarias.
[ ] Fallar CI si snapshots contienen full account number.
[ ] Fallar CI si snapshots contienen raw provider payload.
[ ] Fallar CI si snapshots contienen raw webhook signature.
[ ] Fallar CI si logs contienen tokens.
[ ] Fallar CI si logs contienen authorizationUrl.
[ ] Fallar CI si logs contienen full account number.
[ ] Fallar CI si audit contiene tokens.
[ ] Fallar CI si audit contiene raw payload.
[ ] Fallar CI si se detecta float/double para dinero.
[ ] Fallar CI si sync crea Payment.
[ ] Fallar CI si sync actualiza Account Statements.
[ ] Fallar CI si send-to-reconciliation crea Match.
[ ] Fallar CI si duplicate se envía a conciliación.
[ ] Fallar CI si externalAi está habilitado por defecto.
[ ] Fallar CI si paymentInitiation está habilitado por defecto.
[ ] Fallar CI si screenScraping está habilitado por defecto.
```

---

# 28. PRs sugeridos

```text id="xf24hn"
[ ] PR-019-01 — Module skeleton, enums and constants.
[ ] PR-019-02 — Value objects, entities and state machines.
[ ] PR-019-03 — Prisma schema, migration, constraints and indexes.
[ ] PR-019-04 — Repository ports and Prisma repositories.
[ ] PR-019-05 — Provider ports, registry and mock/sandbox adapter.
[ ] PR-019-06 — SecretRef handling and no bank credential storage.
[ ] PR-019-07 — Platform Open Banking provider definitions.
[ ] PR-019-08 — Tenant Open Banking configuration.
[ ] PR-019-09 — Bank consents and authorization flow.
[ ] PR-019-10 — Bank connections and revocation.
[ ] PR-019-11 — Account discovery and account links.
[ ] PR-019-12 — Balance sync and account snapshots.
[ ] PR-019-13 — Transaction sync, normalization and deduplication.
[ ] PR-019-14 — Reconciliation Bridge to Bank Reconciliation.
[ ] PR-019-15 — Open Banking webhooks, signature verification and replay protection.
[ ] PR-019-16 — Reports and exports.
[ ] PR-019-17 — Audit, observability and OpenAPI.
[ ] PR-019-18 — Tests, security hardening, performance and CI gates.
```

---

# 29. Smoke flow obligatorio

```text id="pabpa8"
[ ] PlatformAdmin crea provider definition mock.
[ ] PlatformAdmin activa provider definition.
[ ] FinancialManager crea tenant config.
[ ] FinancialManager habilita tenant config.
[ ] FinancialManager crea BankConsent.
[ ] FinancialManager inicia autorización.
[ ] Adapter mock confirma autorización.
[ ] Sistema crea BankConnection active.
[ ] Sistema descubre cuenta externa.
[ ] FinancialManager vincula BankAccountLink con BankAccount interno.
[ ] FinancialManager ejecuta sync de movimientos.
[ ] Sistema importa movimientos.
[ ] Sistema detecta duplicados.
[ ] FinancialManager envía un movimiento a Bank Reconciliation.
[ ] Sistema crea/vincula BankTransaction.
[ ] Sistema no crea Payment.
[ ] Sistema no crea ReconciliationMatch.
[ ] Sistema no modifica Account Statements.
[ ] Sistema genera reporte summary.
[ ] Sistema audita eventos críticos.
```

---

# 30. Checklist de Definition of Done

```text id="s5v2cs"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado.
[ ] Módulo registrado.
[ ] Prisma schema implementado.
[ ] Migración creada.
[ ] Repositorios implementados.
[ ] Provider registry implementado.
[ ] Mock adapter implementado.
[ ] SecretRef abstraction implementada.
[ ] Provider definitions implementadas.
[ ] Tenant configs implementadas.
[ ] BankConsent implementado.
[ ] Authorization flow implementado.
[ ] BankConnection implementado.
[ ] Account discovery implementado.
[ ] BankAccountLink implementado.
[ ] Sync runs implementado.
[ ] Balance sync implementado.
[ ] Transaction sync implementado.
[ ] Normalization implementado.
[ ] Dedupe implementado.
[ ] Reconciliation bridge implementado.
[ ] Webhooks implementados.
[ ] Reports implementados.
[ ] Exports implementados.
[ ] Audit implementado.
[ ] Observability implementado.
[ ] OpenAPI implementado.
[ ] Tests unitarios pasan.
[ ] Tests de repositorio pasan.
[ ] Tests de servicios pasan.
[ ] Tests de adapters pasan.
[ ] Tests API pasan.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests de seguridad pasan.
[ ] Tests de integridad financiera pasan.
[ ] Tests de webhook pasan.
[ ] Tests de OpenAPI pasan.
[ ] Tests de performance mínimos pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
```

---

# 31. No aceptación

La implementación no debe aceptarse si queda alguna de estas condiciones:

```text id="nguv4v"
[ ] Permite config cross-tenant.
[ ] Permite consent cross-tenant.
[ ] Permite connection cross-tenant.
[ ] Permite account link cross-tenant.
[ ] Permite sync run cross-tenant.
[ ] Permite transaction cross-tenant.
[ ] Permite webhook event cross-tenant.
[ ] Vincula BankAccount tenant B con account link tenant A.
[ ] Acepta tenantId desde body.
[ ] Usa findUnique por id simple en entidades tenant-scoped.
[ ] Almacena bank username.
[ ] Almacena bank password.
[ ] Almacena OTP.
[ ] Almacena MFA secret.
[ ] Almacena raw access token.
[ ] Almacena raw refresh token.
[ ] Expone SecretRefs en DTO no autorizado.
[ ] Expone número completo de cuenta.
[ ] Expone raw provider payload.
[ ] Expone raw webhook signature.
[ ] Permite payment initiation en MVP.
[ ] Permite screen scraping en MVP.
[ ] Permite sync sin consentimiento vigente.
[ ] Permite sync con connection revoked.
[ ] Permite sync con connection disabled.
[ ] Duplica movimientos por retry.
[ ] Permite duplicate como conciliable.
[ ] Crea Payment desde Open Banking.
[ ] Modifica Account Statements desde Open Banking.
[ ] Crea ReconciliationMatch automáticamente.
[ ] Marca conciliación bancaria final automáticamente.
[ ] Crea endpoint público administrativo.
[ ] Documenta endpoint público administrativo en OpenAPI.
[ ] Permite acceso bancario desde WordPress.
[ ] Envía datos bancarios reales a IA externa.
[ ] Omite auditoría financiera crítica.
[ ] Loggea tokens, payloads completos o número completo de cuenta.
```

---

# 32. Resultado esperado

Al completar estas tareas, el módulo `019-open-banking-integration` estará listo para operar como base segura de integración bancaria read-only para RESIDENT Core.

Resultado esperado:

```text id="f5bsv4"
module foundation complete
domain model complete
database migration complete
repositories complete
provider adapters complete
SecretRef strategy complete
no bank credential storage enforced
platform provider definitions complete
tenant configs complete
bank consents complete
authorization flow complete
bank connections complete
account discovery complete
bank account links complete
sync runs complete
balance snapshots complete
transaction sync complete
transaction normalization complete
transaction deduplication complete
reconciliation bridge complete
webhooks complete
reports complete
exports complete
audit complete
observability complete
OpenAPI complete
tests complete
security hardening complete
CI/CD gates complete
no payment initiation
no Payment auto-creation
no Account Statements mutation
no automatic final reconciliation
no public administrative endpoints
no WordPress bank access
no external AI with real bank data
```

---

# 33. Expediente actualizado

```text id="j9ypw6"
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
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
