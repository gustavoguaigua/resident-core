# Test Plan — Spec 019 Open Banking Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                              |
| Spec ID         | 019                                                                                                                                                                                                        |
| Módulo          | Open Banking Integration                                                                                                                                                                                   |
| Documento       | Test Plan                                                                                                                                                                                                  |
| Ruta            | `docs/specs/019-open-banking-integration/test-plan.md`                                                                                                                                                     |
| Versión         | 0.1                                                                                                                                                                                                        |
| Estado          | Borrador inicial                                                                                                                                                                                           |
| Fecha           | 2026-07-23                                                                                                                                                                                                 |
| Documento base  | `docs/specs/019-open-banking-integration/spec.md`                                                                                                                                                          |
| Plan técnico    | `docs/specs/019-open-banking-integration/plan.md`                                                                                                                                                          |
| Modelo de datos | `docs/specs/019-open-banking-integration/data-model.md`                                                                                                                                                    |
| Contrato API    | `docs/specs/019-open-banking-integration/api-contract.md`                                                                                                                                                  |
| Depende de      | `001-tenants`, `002-users-roles`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `018-payment-provider-integration` |
| Naturaleza      | Tenant-scoped / Consent-driven / Bank-connection-aware / Provider-agnostic / Sync-driven / Transaction-import-aware / Reconciliation-ready / Audit-heavy / Non-public                                      |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `019-open-banking-integration`.

El objetivo es validar que la integración Open Banking funcione como una capacidad financiera segura, controlada, read-only en MVP, basada en consentimiento, sin almacenamiento de credenciales bancarias, sin iniciación de pagos, sin creación automática de Payments, sin conciliación final automática y sin exposición pública de datos bancarios.

Regla central de pruebas:

```text id="nq3l66"
Open Banking Integration debe probarse como un módulo financiero crítico: ningún test debe permitir conexión sin consentimiento, sync sin conexión activa, almacenamiento de credenciales bancarias, tokens raw, movimientos duplicados, cross-tenant access, creación automática de Payment, actualización directa de Account Statements, conciliación final automática, payloads completos en logs, endpoints públicos administrativos o uso de IA externa con datos reales.
```

---

## 3. Objetivos del plan de pruebas

El plan debe validar:

```text id="ex1pf2"
- provider definitions platform;
- tenant Open Banking configs;
- SecretRef strategy;
- no almacenamiento de credenciales bancarias;
- no almacenamiento de tokens raw;
- consentimiento explícito;
- flujo de autorización bancaria;
- creación de BankConnection;
- revocación de conexión;
- descubrimiento de cuentas externas;
- BankAccountLink con BankAccount interno;
- sincronización de cuentas;
- sincronización de saldos;
- sincronización de movimientos;
- normalización de movimientos;
- deduplicación por externalTransactionId;
- deduplicación por fingerprint;
- sync idempotente;
- webhooks firmados;
- replay protection;
- envío a Bank Reconciliation;
- no creación automática de Payment;
- no actualización directa de Account Statements;
- no conciliación final automática;
- reportes;
- exports;
- auditoría;
- observabilidad;
- OpenAPI seguro;
- multitenancy;
- autorización por permisos;
- ausencia de endpoints públicos administrativos;
- ausencia de acceso desde WordPress;
- ausencia de IA externa con datos reales.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="hnlmru"
1. Unit tests.
2. Value object tests.
3. Entity tests.
4. State machine tests.
5. Repository tests.
6. Service tests.
7. Provider adapter tests.
8. Secret management tests.
9. Consent flow tests.
10. Connection tests.
11. Account discovery tests.
12. Account link tests.
13. Sync run tests.
14. Balance sync tests.
15. Transaction sync tests.
16. Normalization tests.
17. Fingerprint tests.
18. Deduplication tests.
19. Reconciliation bridge tests.
20. Webhook signature tests.
21. Webhook idempotency tests.
22. API tests.
23. Authorization tests.
24. Multitenancy tests.
25. Financial integrity tests.
26. Security tests.
27. Audit tests.
28. Observability tests.
29. Report tests.
30. Export tests.
31. OpenAPI contract tests.
32. Performance tests.
33. Concurrency tests.
34. Regression tests.
35. Smoke tests.
36. CI/CD gates.
```

---

### 4.2. Fuera de alcance del MVP

No se prueban como funcionalidad activa:

```text id="ysom6k"
- payment initiation bancaria;
- transferencias bancarias;
- débitos automáticos;
- domiciliación bancaria;
- pagos a proveedores;
- pagos masivos;
- cash management avanzado;
- screen scraping;
- almacenamiento de usuario/contraseña bancaria;
- bypass de MFA;
- automatización de login bancario;
- refunds bancarios;
- reversos bancarios;
- conciliación automática irreversible;
- reglas automáticas avanzadas;
- contabilidad completa;
- asientos contables;
- facturación electrónica;
- multi-moneda avanzada;
- IA con datos bancarios reales.
```

Aunque no se implementen, sí se deben probar sus prohibiciones cuando aplique.

---

## 5. Estrategia general de pruebas

### 5.1. Pirámide de pruebas

```text id="ndnlf2"
Unit/value/entity/state tests
  -> Repository tests
      -> Service/integration tests
          -> API/contract tests
              -> Security/multitenancy/financial regression tests
                  -> Smoke tests
```

---

### 5.2. Principios

```text id="jz8s2s"
- probar dominio antes que controladores;
- probar tenant isolation en cada capa;
- probar autorización negativa tanto como positiva;
- probar idempotencia en sync y webhooks;
- probar no exposición de secretos;
- probar no exposición de datos bancarios completos;
- probar que Open Banking no crea Payment;
- probar que Open Banking no actualiza Account Statements;
- probar que Open Banking no confirma conciliación;
- probar que todos los errores sean sanitizados;
- probar que logs y audit no contengan payloads sensibles.
```

---

## 6. Datos base de prueba

### 6.1. Tenants

```text id="katol4"
tenantA: active
tenantB: active
tenantSuspended: suspended
tenantArchived: archived
```

---

### 6.2. Usuarios

```text id="exngfl"
platformAdmin
tenantAdminA
financialManagerA
accountantA
boardMemberA
residentA
ownerA
unauthorizedUserA
financialManagerB
disabledUserA
userWithoutMembership
```

---

### 6.3. Provider definitions

```text id="iyixbi"
providerDefinitionMockDraft
providerDefinitionMockActive
providerDefinitionSandboxActive
providerDefinitionDeprecated
providerDefinitionArchived
providerDefinitionPaymentInitiationCapableButDisabledInMvp
```

---

### 6.4. Tenant configs

```text id="x02nol"
tenantOpenBankingConfigEnabledA
tenantOpenBankingConfigDraftA
tenantOpenBankingConfigDisabledA
tenantOpenBankingConfigInvalidA
tenantOpenBankingConfigArchivedA
tenantOpenBankingConfigEnabledB
```

---

### 6.5. Consents

```text id="f2ktlo"
bankConsentDraftA
bankConsentPendingAuthorizationA
bankConsentAuthorizedA
bankConsentExpiredA
bankConsentRevokedA
bankConsentFailedA
bankConsentArchivedA
bankConsentAuthorizedB
```

---

### 6.6. Connections

```text id="u55lug"
bankConnectionPendingAuthorizationA
bankConnectionActiveA
bankConnectionSyncingA
bankConnectionReauthorizationRequiredA
bankConnectionFailedA
bankConnectionRevokedA
bankConnectionDisabledA
bankConnectionArchivedA
bankConnectionActiveB
```

---

### 6.7. Bank accounts y links

```text id="u4pq69"
bankAccountMainA
bankAccountSecondaryA
bankAccountArchivedA
bankAccountMainB

bankAccountLinkPendingA
bankAccountLinkLinkedA
bankAccountLinkUnlinkedA
bankAccountLinkDisabledA
bankAccountLinkArchivedA
bankAccountLinkLinkedB
```

---

### 6.8. Sync runs

```text id="dfyj8f"
syncRunQueuedA
syncRunRunningA
syncRunCompletedA
syncRunCompletedWithWarningsA
syncRunFailedA
syncRunCancelledA
syncRunArchivedA
syncRunTenantB
```

---

### 6.9. Open Banking transactions

```text id="y7rj8e"
openBankingTransactionImportedA
openBankingTransactionDuplicateA
openBankingTransactionSentToReconciliationA
openBankingTransactionRejectedA
openBankingTransactionIgnoredA
openBankingTransactionRequiresReviewA
openBankingTransactionArchivedA
openBankingTransactionTenantB
openBankingTransactionWithoutExternalTransactionIdA
openBankingTransactionPaymentProviderSettlementA
```

---

### 6.10. Webhook events

```text id="yuzuxv"
openBankingWebhookVerifiedA
openBankingWebhookInvalidSignatureA
openBankingWebhookMissingSignatureA
openBankingWebhookDuplicateA
openBankingWebhookFailedA
openBankingWebhookRejectedA
openBankingWebhookProcessedA
openBankingWebhookUnresolvedTenant
openBankingWebhookTenantB
```

---

### 6.11. Datos prohibidos en fixtures

Los fixtures no deben contener:

```text id="jh636a"
usuarios bancarios reales
contraseñas bancarias reales
OTP reales
MFA secret real
tokens reales
refresh tokens reales
client secrets reales
webhook secrets reales
payloads reales de proveedor
números completos de cuenta reales
datos financieros reales
nombres reales
emails reales
teléfonos reales
cédulas reales
storageKeys reales
URLs firmadas reales
datos productivos
```

---

## 7. Unit tests — Value Objects

### 7.1. `OpenBankingProviderKey`

Debe probar:

```text id="aos337"
- acepta providerKey válido;
- normaliza espacios;
- rechaza vacío;
- rechaza caracteres inseguros;
- rechaza providerKey no soportado si registry lo exige;
- mantiene estabilidad;
- no contiene secretos.
```

---

### 7.2. `OpenBankingEnvironment`

Debe probar:

```text id="k0c06s"
- acepta sandbox;
- acepta production;
- rechaza valores desconocidos;
- sandbox como default MVP;
- production requiere configuración explícita;
- production no se habilita accidentalmente en tests.
```

---

### 7.3. `SecretRef`

Debe probar:

```text id="n2nr8h"
- acepta SecretRef válido;
- rechaza valor secreto como si fuera ref;
- rechaza vacío;
- rechaza formato inseguro;
- no serializa secreto;
- expone solo configured boolean;
- no aparece en DTO no autorizado;
- no aparece en logs;
- no aparece en audit metadata.
```

---

### 7.4. `BankConsentScope`

Debe probar:

```text id="jmqzl3"
- acepta accountsRead;
- acepta balancesRead;
- acepta transactionsRead;
- rechaza paymentsInitiate en MVP;
- rechaza scopes desconocidos;
- rechaza scope vacío;
- rechaza scopes duplicados;
- normaliza orden si aplica.
```

---

### 7.5. `BankConsentExpiration`

Debe probar:

```text id="cg7nx2"
- detecta consentimiento vigente;
- detecta consentimiento expirado;
- detecta próximo a expirar;
- rechaza fecha inválida;
- normaliza UTC;
- impide sync si expired.
```

---

### 7.6. `BankAccountNumberMasked`

Debe probar:

```text id="bmbjc7"
- acepta formato enmascarado;
- rechaza número completo;
- rechaza valores demasiado largos;
- rechaza caracteres inseguros;
- permite null cuando proveedor no entrega cuenta;
- no expone full account number.
```

---

### 7.7. `BankAccountNumberHash`

Debe probar:

```text id="o4mpfz"
- genera SHA-256 estable;
- usa tenant-scoped pepper;
- cambia entre tenants;
- no acepta hash desde cliente como fuente de verdad;
- no se expone en DTO;
- no se usa como métrica label.
```

---

### 7.8. `ExternalAccountId`

Debe probar:

```text id="k2gw8w"
- acepta ID externo válido;
- genera externalAccountIdHash;
- rechaza vacío;
- rechaza caracteres de control;
- no se expone innecesariamente;
- se usa para dedupe de account links.
```

---

### 7.9. `ExternalTransactionId`

Debe probar:

```text id="ui1279"
- acepta ID externo válido;
- permite null cuando provider no entrega ID;
- genera externalTransactionIdHash;
- rechaza valores inseguros;
- participa en deduplicación.
```

---

### 7.10. `OpenBankingTransactionFingerprint`

Debe probar:

```text id="tzvykw"
- genera fingerprint determinístico;
- incluye tenantId;
- incluye providerKey;
- incluye bankConnectionId;
- incluye bankAccountLinkId;
- incluye transactionDate;
- incluye direction;
- incluye amount;
- incluye currency;
- incluye referencias normalizadas;
- produce mismo resultado en retry;
- produce distinto resultado entre tenants;
- no acepta fingerprint desde cliente.
```

---

### 7.11. `OpenBankingTransactionAmount`

Debe probar:

```text id="cewjmz"
- acepta string decimal;
- rechaza number;
- rechaza float;
- rechaza NaN;
- rechaza amount <= 0 para movimientos;
- permite Decimal(12,2);
- conserva precisión;
- 0.10 + 0.20 = 0.30 usando Decimal.
```

---

### 7.12. `OpenBankingAuthorizationUrl`

Debe probar:

```text id="jrxjyx"
- acepta HTTPS;
- rechaza javascript:;
- rechaza data:;
- rechaza URL vacía;
- calcula authorizationUrlHash;
- no serializa URL fuera de respuesta inmediata;
- no aparece en logs;
- no aparece en auditoría.
```

---

### 7.13. `OpenBankingWebhookSignature`

Debe probar:

```text id="zhlevn"
- acepta firma válida según adapter;
- rechaza firma ausente si requerida;
- rechaza firma inválida;
- calcula signatureHeaderHash;
- no loggea firma completa;
- no persiste raw signature.
```

---

### 7.14. `OpenBankingWebhookPayloadHash`

Debe probar:

```text id="mvr3lu"
- calcula hash SHA-256 sobre raw body;
- genera payloadHashPrefix;
- mismo raw body produce mismo hash;
- body alterado cambia hash;
- no persiste raw payload;
- no usa JSON reserializado para firma.
```

---

## 8. Unit tests — Entidades de dominio

### 8.1. `OpenBankingProviderDefinition`

Debe probar:

```text id="lij9fb"
- crear draft;
- activar draft;
- pasar active a inactive;
- pasar inactive a active;
- deprecar active;
- archivar draft;
- archivar inactive;
- archivar deprecated;
- impedir archived -> active;
- impedir providerKey mutable si ya existe;
- impedir metadata con secretos;
- mantener supportsPaymentInitiation=false en MVP;
- emitir eventos de dominio.
```

---

### 8.2. `TenantOpenBankingConfig`

Debe probar:

```text id="z9w3e5"
- crear draft;
- habilitar con provider active;
- impedir habilitar con provider archived;
- impedir habilitar sin SecretRefs requeridos;
- deshabilitar enabled;
- marcar invalid;
- recuperar invalid con test exitoso;
- archivar;
- impedir archived -> enabled;
- impedir payment initiation;
- impedir bank credentials;
- impedir secretos en metadata;
- emitir eventos de dominio.
```

---

### 8.3. `BankConsent`

Debe probar:

```text id="cq5o6a"
- crear draft;
- pasar a pendingAuthorization;
- pasar a authorized;
- fallar autorización;
- expirar consentimiento;
- renovar consentimiento;
- revocar consentimiento;
- archivar revoked;
- impedir sync si expired;
- impedir sync si revoked;
- exigir authorizedBy y authorizedAt;
- exigir revocationReason al revocar;
- impedir paymentsInitiate en MVP;
- emitir eventos de dominio.
```

---

### 8.4. `BankConnection`

Debe probar:

```text id="vwo84s"
- crear pendingAuthorization;
- activar con consentimiento authorized;
- pasar active -> syncing;
- volver syncing -> active;
- pasar syncing -> failed;
- pasar active -> reauthorizationRequired;
- pasar active -> revoked;
- pasar active -> disabled;
- pasar disabled -> active;
- impedir sync en revoked;
- impedir sync en disabled;
- impedir sync en reauthorizationRequired;
- impedir token raw;
- emitir eventos de dominio.
```

---

### 8.5. `BankAccountLink`

Debe probar:

```text id="h3vndm"
- crear pendingLink;
- vincular con BankAccount;
- desvincular;
- deshabilitar;
- reactivar disabled -> linked;
- archivar;
- impedir linked sin bankAccountId;
- impedir cuenta interna cross-tenant en servicio;
- no exponer full account number;
- preservar historial.
```

---

### 8.6. `OpenBankingSyncRun`

Debe probar:

```text id="ndjhpn"
- crear queued;
- pasar queued -> running;
- pasar running -> completed;
- pasar running -> completedWithWarnings;
- pasar running -> failed;
- pasar queued -> cancelled;
- pasar failed -> queued por retry;
- archivar completed;
- exigir periodo para transactions;
- exigir completedAt si completed;
- exigir errorCode si failed;
- conteos no negativos;
- retryCount no negativo.
```

---

### 8.7. `OpenBankingAccountSnapshot`

Debe probar:

```text id="u5apdc"
- crear snapshot válido;
- permitir availableBalance null;
- permitir currentBalance null;
- rechazar saldos negativos si política lo exige;
- usar Decimal;
- mantener tenantId;
- no modificar Account Statements.
```

---

### 8.8. `OpenBankingTransaction`

Debe probar:

```text id="pv8hmn"
- crear imported;
- marcar duplicate;
- marcar sentToReconciliation;
- marcar rejected;
- marcar ignored;
- marcar requiresReview;
- archivar;
- impedir sentToReconciliation sin bankTransactionId;
- impedir duplicate enviado a reconciliación;
- exigir rejectReason;
- exigir ignoreReason;
- mantener amount positivo;
- mantener fingerprint obligatorio;
- no crear Payment;
- no actualizar Account Statements.
```

---

### 8.9. `OpenBankingWebhookEvent`

Debe probar:

```text id="ll0ago"
- crear received;
- marcar verified;
- marcar invalid signature;
- marcar missing signature;
- marcar processing;
- marcar processed;
- marcar failed;
- marcar rejected;
- marcar duplicate;
- reprocesar failed;
- impedir reprocesar invalid signature ordinariamente;
- no persistir raw payload;
- no persistir raw signature;
- mantener payloadHash.
```

---

## 9. Repository tests

### 9.1. Reglas generales

Todo repositorio tenant-scoped debe probar:

```text id="t0qirj"
- create;
- findByIdAndTenant;
- listByTenant;
- update tenant-scoped;
- archive tenant-scoped;
- no findUnique por id simple;
- tenant A no ve tenant B;
- tenant B no modifica tenant A;
- archived no aparece por defecto;
- filtros funcionan;
- paginación funciona;
- índices únicos previenen duplicados.
```

---

### 9.2. `OpenBankingProviderDefinitionRepository`

Debe probar:

```text id="nf4ta9"
- create provider definition;
- providerKey unique;
- findByProviderKey;
- list por status;
- activate;
- deprecate;
- archive;
- no secretos en metadata.
```

---

### 9.3. `TenantOpenBankingConfigRepository`

Debe probar:

```text id="yqfc7e"
- create config tenant A;
- list tenant A;
- tenant A no ve config tenant B;
- find enabled by provider/environment;
- unique enabled por tenant/provider/environment;
- disable;
- invalid;
- archive;
- no secret values persistidos.
```

---

### 9.4. `BankConsentRepository`

Debe probar:

```text id="pw0oez"
- create consent;
- list by tenant;
- list by status;
- find authorized vigente;
- providerConsentId unique si existe;
- revoke;
- expire;
- archive;
- tenant A no ve consent tenant B.
```

---

### 9.5. `BankConnectionRepository`

Debe probar:

```text id="ismaru"
- create connection;
- find active;
- providerConnectionId unique si existe;
- update lastSuccessfulSyncAt;
- update lastFailedSyncAt;
- mark reauthorizationRequired;
- revoke;
- disable;
- archive;
- tenant isolation.
```

---

### 9.6. `BankAccountLinkRepository`

Debe probar:

```text id="eybopf"
- create pendingLink;
- unique externalAccountIdHash por tenant/provider/connection;
- link bankAccount;
- unique active linked bankAccount si aplica;
- unlink;
- disable;
- archive;
- tenant A no vincula BankAccount tenant B.
```

---

### 9.7. `OpenBankingSyncRunRepository`

Debe probar:

```text id="ouy82w"
- create queued;
- mark running;
- mark completed;
- mark failed;
- retryOfSyncRunId;
- no sync running duplicado por connection/syncType;
- filtros por periodo;
- filtros por status;
- conteos persistidos.
```

---

### 9.8. `OpenBankingAccountSnapshotRepository`

Debe probar:

```text id="erlxky"
- create snapshot;
- list by bankAccountLink;
- list by bankAccount;
- list by syncRun;
- filtros por fecha;
- Decimal persistido correctamente;
- tenant isolation.
```

---

### 9.9. `OpenBankingTransactionRepository`

Debe probar:

```text id="mf1vkm"
- create imported;
- dedupe por externalTransactionIdHash;
- dedupe por fingerprint;
- mark duplicate;
- mark sentToReconciliation;
- mark rejected;
- mark ignored;
- mark requiresReview;
- archive;
- filtros por status/date/direction/type;
- tenant isolation.
```

---

### 9.10. `OpenBankingWebhookEventRepository`

Debe probar:

```text id="f3yr17"
- create received;
- find by providerEventId;
- find by payloadHash;
- mark verified;
- mark duplicate;
- mark rejected;
- mark processed;
- mark failed;
- increment retry;
- tenant nullable si unresolved;
- no raw payload persistido.
```

---

## 10. Service tests

### 10.1. `OpenBankingProviderDefinitionService`

Debe probar:

```text id="v2ru7z"
- crear provider definition;
- impedir providerKey duplicado;
- activar provider válido;
- deprecar provider;
- archivar provider;
- impedir secretos en metadata;
- auditar eventos platform;
- validar permisos platform.
```

---

### 10.2. `TenantOpenBankingConfigService`

Debe probar:

```text id="i3ctl1"
- crear config tenant;
- convertir secretValue a SecretRef;
- no persistir secretValue;
- habilitar config con provider active;
- impedir habilitar config sin SecretRef requerido;
- impedir habilitar provider archived;
- deshabilitar config;
- testConnection seguro;
- archivar config;
- auditar eventos.
```

---

### 10.3. `OpenBankingSecretService`

Debe probar:

```text id="ll6z54"
- storeCredential retorna SecretRef;
- storeToken retorna SecretRef;
- updateToken rota SecretRef;
- revokeToken invalida acceso;
- getSecret solo interno;
- no retorna secret por API;
- no loggea secret;
- no audita secret value;
- rechaza bank username/password.
```

---

### 10.4. `BankConsentService`

Debe probar:

```text id="vyba1w"
- crear consentimiento draft;
- rechazar config disabled;
- rechazar paymentsInitiate en MVP;
- iniciar autorización;
- renovar consentimiento;
- revocar consentimiento;
- expirar consentimiento;
- impedir sync sin authorized vigente;
- auditar bankConsent events.
```

---

### 10.5. `BankAuthorizationService`

Debe probar:

```text id="co3k24"
- startAuthorization invoca adapter;
- devuelve authorizationUrl temporal;
- no persiste authorizationUrl completa;
- no loggea authorizationUrl;
- exchangeAuthorizationCode crea SecretRefs;
- marca consentimiento authorized;
- crea BankConnection active;
- maneja error del provider;
- maneja callback inválido;
- audita.
```

---

### 10.6. `BankConnectionService`

Debe probar:

```text id="kl3hb3"
- listar conexiones por tenant;
- obtener conexión;
- actualizar connectionName;
- revocar conexión;
- deshabilitar conexión;
- marcar reauthorizationRequired por token expirado;
- impedir sync en revoked;
- impedir sync en disabled;
- impedir sync en reauthorizationRequired;
- no exponer tokenSecretRef.
```

---

### 10.7. `BankAccountDiscoveryService`

Debe probar:

```text id="qrzlzi"
- descubrir cuentas desde adapter;
- crear BankAccountLink pendingLink;
- no duplicar externalAccount;
- guardar accountNumberMasked;
- calcular accountNumberHash;
- no guardar número completo;
- manejar cuenta sin accountNumber;
- auditar discovered.
```

---

### 10.8. `BankAccountLinkService`

Debe probar:

```text id="fq13qq"
- vincular cuenta externa con BankAccount tenant A;
- rechazar BankAccount tenant B;
- rechazar BankAccount archived;
- desvincular;
- deshabilitar;
- archivar;
- impedir linked sin bankAccountId;
- auditar link/unlink/disable/archive.
```

---

### 10.9. `OpenBankingSyncRunService`

Debe probar:

```text id="fpvqeb"
- iniciar sync accounts;
- iniciar sync balances;
- iniciar sync transactions;
- rechazar sync sin periodo en transactions;
- rechazar periodo inválido;
- rechazar periodo > máximo;
- rechazar connection revoked;
- rechazar connection disabled;
- rechazar consent expired;
- impedir sync running duplicado;
- crear syncRun;
- actualizar conteos;
- marcar failed con error sanitizado.
```

---

### 10.10. `OpenBankingBalanceSyncService`

Debe probar:

```text id="z4k7cw"
- obtener balances desde adapter;
- crear snapshots;
- usar Decimal;
- no actualizar Account Statements;
- manejar balance faltante;
- manejar currency no soportada;
- auditar sync.
```

---

### 10.11. `OpenBankingTransactionSyncService`

Debe probar:

```text id="yqimyp"
- obtener movimientos desde adapter;
- normalizar movimientos;
- calcular fingerprint;
- deduplicar por externalTransactionId;
- deduplicar por fingerprint;
- crear OpenBankingTransaction imported;
- marcar duplicate;
- registrar rejected si movimiento inválido;
- actualizar conteos;
- no crear Payment;
- no enviar automáticamente a reconciliación salvo política explícita futura.
```

---

### 10.12. `OpenBankingTransactionNormalizationService`

Debe probar:

```text id="lc4hly"
- normaliza fechas;
- normaliza descripción;
- normaliza referencia;
- normaliza bankReference;
- clasifica direction;
- clasifica transactionType;
- reconoce paymentProviderSettlement como tipo candidato;
- rechaza amount inválido;
- rechaza currency no soportada;
- sanitiza texto.
```

---

### 10.13. `OpenBankingTransactionDedupeService`

Debe probar:

```text id="be1483"
- dedupe por externalTransactionIdHash;
- dedupe por fingerprint;
- mantiene original y marca duplicate;
- duplicate no se vuelve conciliable;
- retry de sync no duplica;
- dedupe no cruza tenants;
- dedupe no cruza cuentas incorrectamente.
```

---

### 10.14. `OpenBankingReconciliationBridgeService`

Debe probar:

```text id="vfo1gq"
- enviar imported a Bank Reconciliation;
- enviar requiresReview autorizado;
- rechazar duplicate;
- rechazar ignored;
- rechazar rejected;
- rechazar archived;
- validar BankAccountLink linked;
- validar BankAccount tenant-scoped;
- crear BankTransaction;
- vincular bankTransactionId;
- marcar sentToReconciliation;
- no crear Payment;
- no crear ReconciliationMatch;
- no marcar conciliación final.
```

---

### 10.15. `OpenBankingWebhookService`

Debe probar:

```text id="om9ogq"
- recibir webhook válido;
- calcular payloadHash;
- validar firma;
- validar timestamp;
- detectar duplicate;
- resolver tenant/config/connection;
- no ejecutar efectos si unresolved;
- disparar sync si evento transactions.available;
- procesar consent.expired;
- procesar connection.revoked;
- no crear movimientos duplicados;
- no guardar raw payload;
- auditar eventos.
```

---

### 10.16. `OpenBankingReportService`

Debe probar:

```text id="s02lgw"
- summary report tenant-scoped;
- sync status report;
- imported transactions report;
- errors report;
- export report;
- no incluir tenant B;
- no incluir tokens;
- no incluir full account number;
- no incluir raw payload;
- no exponer storageKey;
- auditar export.
```

---

## 11. Provider adapter tests

### 11.1. `MockOpenBankingProviderAdapter`

Debe probar:

```text id="eox09t"
- startAuthorization devuelve authorizationUrl mock;
- exchangeAuthorizationCode devuelve tokens sintéticos;
- revokeConnection retorna éxito;
- listAccounts retorna cuentas ficticias;
- getBalances retorna saldos ficticios;
- listTransactions retorna movimientos ficticios;
- verifyWebhook acepta firma mock válida;
- verifyWebhook rechaza firma mock inválida;
- parseWebhookEvent retorna evento normalizado;
- no retorna credenciales reales;
- no usa datos reales.
```

---

### 11.2. `SandboxOpenBankingProviderAdapter`

Debe probar:

```text id="vfda3x"
- solo opera en sandbox;
- rechaza production si no está habilitado;
- maneja timeout;
- maneja rate limit;
- maneja provider unavailable;
- transforma errores externos en errores internos;
- no loggea respuesta completa;
- no expone tokens.
```

---

### 11.3. `OpenBankingAdapterRegistry`

Debe probar:

```text id="zlcmkd"
- registra adapter;
- obtiene adapter por providerKey;
- rechaza providerKey no soportado;
- lista providers soportados;
- no expone secretos;
- maneja adapter missing.
```

---

## 12. API tests

### 12.1. Platform provider definitions

Debe probar:

```text id="vumioh"
GET /platform/open-banking-provider-definitions
POST /platform/open-banking-provider-definitions
GET /platform/open-banking-provider-definitions/{id}
PATCH /platform/open-banking-provider-definitions/{id}
POST /platform/open-banking-provider-definitions/{id}/activate
POST /platform/open-banking-provider-definitions/{id}/deprecate
POST /platform/open-banking-provider-definitions/{id}/archive
```

Casos:

```text id="kmbjhu"
- PlatformAdmin autorizado;
- usuario tenant sin permiso recibe 403;
- providerKey duplicado 409;
- payload con secreto 422;
- paymentInitiation=true en MVP 422;
- archived no se reactiva.
```

---

### 12.2. Tenant configs

Debe probar:

```text id="s0vzdd"
GET /tenant/open-banking/configs
POST /tenant/open-banking/configs
GET /tenant/open-banking/configs/{configId}
PATCH /tenant/open-banking/configs/{configId}
POST /tenant/open-banking/configs/{configId}/enable
POST /tenant/open-banking/configs/{configId}/disable
POST /tenant/open-banking/configs/{configId}/test-connection
POST /tenant/open-banking/configs/{configId}/archive
```

Casos:

```text id="i73th5"
- tenant A lista solo configs A;
- tenant A no obtiene config B;
- tenantId en body 422;
- secretValue no aparece en response;
- SecretRef no aparece en /me porque no existe /me;
- enable sin SecretRef requerido 409;
- provider archived 409;
- testConnection no consulta datos bancarios sin consentimiento.
```

---

### 12.3. Consents

Debe probar:

```text id="osz3s8"
GET /tenant/open-banking/consents
POST /tenant/open-banking/consents
GET /tenant/open-banking/consents/{consentId}
POST /tenant/open-banking/consents/{consentId}/start-authorization
POST /tenant/open-banking/consents/{consentId}/renew
POST /tenant/open-banking/consents/{consentId}/revoke
POST /tenant/open-banking/consents/{consentId}/archive
```

Casos:

```text id="rgtsq2"
- crear consentimiento válido;
- rechazar paymentsInitiate;
- rechazar config disabled;
- authorizationUrl aparece solo en start-authorization;
- authorizationUrl no aparece en GET;
- revocar requiere reason;
- revoked bloquea sync.
```

---

### 12.4. Connections

Debe probar:

```text id="tnzbxt"
GET /tenant/open-banking/connections
GET /tenant/open-banking/connections/{connectionId}
PATCH /tenant/open-banking/connections/{connectionId}
POST /tenant/open-banking/connections/{connectionId}/revoke
POST /tenant/open-banking/connections/{connectionId}/disable
POST /tenant/open-banking/connections/{connectionId}/archive
```

Casos:

```text id="u5ghyi"
- tenant A lista solo connections A;
- no expone tokenSecretRef;
- no expone refreshTokenSecretRef;
- update no cambia providerConnectionId;
- revoke bloquea sync futuro;
- disabled bloquea sync;
- archived no se opera.
```

---

### 12.5. Account links

Debe probar:

```text id="jutts3"
GET /tenant/open-banking/account-links
POST /tenant/open-banking/account-links
GET /tenant/open-banking/account-links/{accountLinkId}
POST /tenant/open-banking/account-links/{accountLinkId}/link-bank-account
POST /tenant/open-banking/account-links/{accountLinkId}/unlink-bank-account
POST /tenant/open-banking/account-links/{accountLinkId}/disable
POST /tenant/open-banking/account-links/{accountLinkId}/archive
```

Casos:

```text id="v12z5v"
- crear pendingLink;
- vincular a BankAccount tenant A;
- rechazar BankAccount tenant B;
- rechazar full account number;
- no exponer accountNumberHash;
- no exponer externalAccountIdHash;
- unlink conserva historial.
```

---

### 12.6. Sync runs

Debe probar:

```text id="xdi48p"
GET /tenant/open-banking/sync-runs
POST /tenant/open-banking/connections/{connectionId}/sync
GET /tenant/open-banking/sync-runs/{syncRunId}
POST /tenant/open-banking/sync-runs/{syncRunId}/retry
POST /tenant/open-banking/sync-runs/{syncRunId}/cancel
POST /tenant/open-banking/sync-runs/{syncRunId}/archive
```

Casos:

```text id="hzpa1t"
- sync accounts válido;
- sync balances válido;
- sync transactions válido con periodo;
- sync transactions sin periodo 422;
- periodo inválido 422;
- periodo mayor máximo 422;
- connection revoked 409;
- consent expired 409;
- sync running duplicado 409;
- retry no duplica movimientos.
```

---

### 12.7. Account snapshots

Debe probar:

```text id="vrcwjw"
GET /tenant/open-banking/account-snapshots
```

Casos:

```text id="jx1i6h"
- lista snapshots tenant A;
- no muestra tenant B;
- montos son string;
- no modifica Account Statements;
- filtros por accountLink/bankAccount/fecha.
```

---

### 12.8. Transactions

Debe probar:

```text id="lfrkob"
GET /tenant/open-banking/transactions
GET /tenant/open-banking/transactions/{openBankingTransactionId}
POST /tenant/open-banking/transactions/{openBankingTransactionId}/send-to-reconciliation
POST /tenant/open-banking/transactions/{openBankingTransactionId}/ignore
POST /tenant/open-banking/transactions/{openBankingTransactionId}/archive
```

Casos:

```text id="l3k5ob"
- lista transactions tenant A;
- no muestra tenant B;
- duplicate no se envía a conciliación;
- imported se envía a conciliación;
- requiresReview se envía solo con permiso/policy;
- send-to-reconciliation no crea Payment;
- send-to-reconciliation no crea Match;
- ignore requiere reason;
- archive requiere reason.
```

---

### 12.9. Webhook endpoint

Debe probar:

```text id="wt8ejv"
POST /api/v1/webhooks/open-banking/{providerKey}
```

Casos:

```text id="nf5zqw"
- webhook válido retorna 200;
- webhook duplicate retorna 200 idempotente;
- firma inválida 401/403;
- firma ausente 401/403 si requerida;
- timestamp expirado 401/403;
- providerKey no soportado 404/400 según policy;
- payload oversized 413;
- tenant unresolved no genera efectos;
- raw payload no se guarda;
- raw signature no se guarda.
```

---

### 12.10. Webhook events admin

Debe probar:

```text id="r1na7k"
GET /tenant/open-banking/webhook-events
GET /tenant/open-banking/webhook-events/{webhookEventId}
POST /tenant/open-banking/webhook-events/{webhookEventId}/reprocess
POST /tenant/open-banking/webhook-events/{webhookEventId}/archive
```

Casos:

```text id="a4unww"
- lista eventos tenant A;
- no lista tenant B;
- no expone raw payload;
- no expone raw signature;
- reprocess solo failed;
- rejected invalid signature no se reprocesa ordinariamente;
- duplicate no se reprocesa.
```

---

### 12.11. Reports

Debe probar:

```text id="v9kie7"
GET /tenant/open-banking/reports/summary
GET /tenant/open-banking/reports/sync-status
GET /tenant/open-banking/reports/imported-transactions
GET /tenant/open-banking/reports/errors
GET /tenant/open-banking/reports/export
```

Casos:

```text id="wk1fp4"
- reportes tenant-scoped;
- no incluyen tenant B;
- no incluyen tokens;
- no incluyen número completo de cuenta;
- no incluyen raw payload;
- export usa Secure Document Storage;
- response no expone storageKey;
- audit openBankingReport.exported.
```

---

## 13. Multitenancy tests

### 13.1. Recursos tenant-scoped

Debe probar que tenant A no puede leer, crear relación, modificar, enviar, archivar ni reportar recursos de tenant B:

```text id="dblhha"
TenantOpenBankingConfig
BankConsent
BankConnection
BankAccountLink
OpenBankingSyncRun
OpenBankingAccountSnapshot
OpenBankingTransaction
OpenBankingWebhookEvent
BankAccount
BankTransaction
SecureDocument
SecureDocumentFile
```

---

### 13.2. Casos críticos

```text id="ff8g30"
- tenant A no usa configId tenant B;
- tenant A no usa consentId tenant B;
- tenant A no usa connectionId tenant B;
- tenant A no usa accountLinkId tenant B;
- tenant A no vincula BankAccount tenant B;
- tenant A no envía transaction tenant B a reconciliación;
- tenant A no consulta webhook tenant B;
- tenant A no exporta reporte con datos tenant B.
```

---

### 13.3. Respuesta esperada

```text id="e3s9af"
404 recomendado para recursos cross-tenant.
403 permitido si la política lo define.
Nunca revelar existencia del recurso.
```

---

## 14. Authorization tests

### 14.1. PlatformAdmin

Debe probar:

```text id="flq3vb"
- puede crear provider definitions;
- puede activar/deprecar/archivar provider definitions;
- no accede automáticamente a datos bancarios tenant;
- necesita permiso explícito para soporte excepcional;
- acceso excepcional debe auditarse.
```

---

### 14.2. TenantAdmin

Debe probar:

```text id="n5abjl"
- puede configurar provider si tiene permisos;
- no puede acceder a provider definitions platform sin permiso;
- no puede ver secretos;
- no puede iniciar sync si no tiene permiso financiero.
```

---

### 14.3. FinancialManager

Debe probar:

```text id="huefgf"
- puede crear configs si tiene permiso;
- puede iniciar consentimiento;
- puede autorizar conexión;
- puede sincronizar;
- puede vincular account links;
- puede enviar movimientos a reconciliación;
- puede revocar conexión.
```

---

### 14.4. Accountant

Debe probar:

```text id="sl7nn5"
- puede leer conexiones si tiene permiso;
- puede leer sync runs;
- puede leer movimientos;
- puede leer reportes;
- no puede habilitar provider config si no tiene permiso;
- no puede revocar conexión sin permiso.
```

---

### 14.5. BoardMember

Debe probar:

```text id="o29igz"
- puede leer reportes agregados si tiene permiso;
- no puede ver tokens;
- no puede ver configs técnicas;
- no puede iniciar sync;
- no puede enviar movimientos a conciliación.
```

---

### 14.6. Resident / Owner

Debe probar:

```text id="qpe6yr"
- no existe /me Open Banking en MVP;
- no puede leer conexiones;
- no puede leer saldos bancarios;
- no puede leer movimientos bancarios;
- no puede iniciar sync;
- no puede vincular cuentas.
```

---

## 15. Financial integrity tests

### 15.1. Open Banking no crea Payment

Debe probar:

```text id="k7tpga"
- sync de movimiento crédito no crea Payment;
- webhook transactions.available no crea Payment;
- send-to-reconciliation no crea Payment;
- settlement detection no crea Payment;
- retry de sync no crea Payment;
- no cambia payment.status;
- no crea payment_allocations.
```

---

### 15.2. Open Banking no actualiza Account Statements

Debe probar:

```text id="gmbzg4"
- balance snapshot no modifica account statements;
- transaction sync no modifica account statements;
- send-to-reconciliation no modifica account statements;
- Account Statements solo cambia por Payment interno/Charge/Adjustment/Reversal.
```

---

### 15.3. Open Banking no confirma conciliación

Debe probar:

```text id="ceb9sw"
- send-to-reconciliation crea/vincula BankTransaction;
- no crea ReconciliationMatch;
- no marca BankTransaction matched;
- no marca Payment reconciled;
- no cierra ReconciliationSession;
- no confirma settlement.
```

---

### 15.4. Deduplicación financiera

Debe probar:

```text id="ezslx4"
- externalTransactionId repetido no duplica movimiento;
- fingerprint repetido no duplica movimiento;
- retry de sync no duplica;
- webhook duplicado no duplica;
- duplicate no es conciliable;
- duplicate no altera reportes de importados como movimiento nuevo conciliable.
```

---

## 16. Security tests

### 16.1. No bank credentials

Debe probar que no se aceptan ni persisten:

```text id="p9hkmp"
bank username
bank password
OTP
MFA secret
security questions
raw session cookie
```

---

### 16.2. No raw tokens

Debe probar:

```text id="fe1250"
- raw access token no aparece en DB;
- raw refresh token no aparece en DB;
- raw client secret no aparece en DB;
- raw webhook secret no aparece en DB;
- tokens no aparecen en responses;
- tokens no aparecen en logs;
- tokens no aparecen en audit;
- tokens no aparecen en fixtures.
```

---

### 16.3. No full account number

Debe probar:

```text id="zckm7a"
- full account number no aparece en DB;
- full account number no aparece en DTO;
- full account number no aparece en logs;
- full account number no aparece en audit;
- solo accountNumberMasked permitido;
- accountNumberHash no se expone en DTO estándar.
```

---

### 16.4. Webhook security

Debe probar:

```text id="gwlr13"
- firma válida procesa;
- firma inválida rechaza;
- firma ausente rechaza si requerida;
- timestamp expirado rechaza;
- payload alterado rechaza;
- replay detectado;
- providerEventId duplicado idempotente;
- payloadHash duplicado controlado;
- payload oversized rechaza;
- raw payload no persistido.
```

---

### 16.5. Public endpoints forbidden

Debe probar que retornan 404:

```text id="lz8q39"
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

---

### 16.6. WordPress isolation

Debe probar:

```text id="a31qe9"
- WordPress no puede consultar conexiones bancarias;
- WordPress no puede consultar movimientos bancarios;
- WordPress no puede iniciar autorización;
- WordPress no puede iniciar sync;
- WordPress no puede consultar reportes Open Banking;
- CORS no permite operaciones financieras desde dominio público no autorizado.
```

---

### 16.7. External AI prohibition

Debe probar:

```text id="lcxdt4"
- feature flag externalAi=false;
- no payload real se envía a IA;
- no transaction real se envía a IA;
- no token se envía a IA;
- no reporte real se envía a IA;
- solo fixtures sintéticos pueden usarse.
```

---

## 17. Audit tests

### 17.1. Eventos obligatorios

Debe probar emisión de:

```text id="u97eer"
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

### 17.2. Audit metadata permitida

Debe validar que audit puede incluir:

```text id="ouw1q9"
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

### 17.3. Audit metadata prohibida

Debe validar ausencia de:

```text id="wp782j"
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

## 18. Observability tests

### 18.1. Logs

Debe probar que logs incluyen:

```text id="nub97u"
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

---

### 18.2. Logs no deben incluir

```text id="k0of41"
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

### 18.3. Métricas

Debe probar emisión de:

```text id="m5cax5"
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

### 18.4. Labels permitidos

```text id="x9e8rd"
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

### 18.5. Labels prohibidos

```text id="xlkajq"
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

## 19. OpenAPI contract tests

Debe validar:

```text id="v48udp"
- OpenAPI contiene tags esperados;
- endpoints platform documentados correctamente;
- endpoints tenant documentados correctamente;
- webhook endpoint documentado como webhook técnico;
- no documenta endpoints públicos administrativos;
- no documenta /me Open Banking;
- DTOs no contienen tokens;
- DTOs no contienen raw payload;
- DTOs no contienen full account number;
- DTOs no contienen SecretRefs no autorizados;
- x-platform-scope presente en platform endpoints;
- x-tenant-scope presente en tenant endpoints;
- x-consent-required presente en consent endpoints;
- x-bank-credential-storage=false;
- x-provider-signature-required en webhooks;
- x-idempotent-processing en webhooks y sync;
- x-reconciliation-bridge en send-to-reconciliation;
- x-creates-payment=false;
- x-final-reconciliation=false.
```

---

## 20. Performance tests

### 20.1. Objetivos

```text id="kaz3m8"
p95 < 800 ms para listar conexiones paginadas.
p95 < 1200 ms para iniciar autorización, excluyendo latencia del proveedor.
p95 < 2000 ms para sincronizar cuentas pequeñas, excluyendo latencia del proveedor.
p95 < 5000 ms para sincronizar movimientos mensuales típicos, excluyendo latencia del proveedor.
p95 < 1200 ms para enviar movimientos ya importados a Bank Reconciliation.
p95 < 1000 ms para reportes summary básicos.
```

---

### 20.2. Escenarios

```text id="y5ba7m"
- listar 100 conexiones;
- listar 100 account links;
- listar 1000 transactions paginadas;
- sync de 100 movimientos;
- sync de 1000 movimientos;
- dedupe de 1000 movimientos;
- reporte summary mensual;
- imported transactions report paginado;
- webhook burst de 100 eventos;
- retry de sync fallido.
```

---

### 20.3. Validaciones técnicas

```text id="of7q7h"
- no N+1 evidente;
- índices usados en filtros principales;
- pageSize máximo 100;
- sync pesado preparado para jobs;
- logs no crecen con payload completo;
- dedupe indexado;
- consultas reportes filtran por tenant.
```

---

## 21. Concurrency tests

Debe probar:

```text id="tergvl"
- dos syncs iguales simultáneos retornan uno running y otro 409/idempotente;
- dos webhooks iguales simultáneos no duplican movimientos;
- dos retries del mismo sync no duplican;
- dos requests send-to-reconciliation del mismo transaction son idempotentes o 409;
- link-bank-account simultáneo mantiene constraint único;
- webhook y revoke simultáneos resuelven estado consistente;
- token refresh simultáneo no expone token raw ni rompe SecretRef.
```

---

## 22. Regression tests

### 22.1. `017-bank-reconciliation`

Debe verificar:

```text id="k2l1bf"
- importación manual CSV/XLSX sigue funcionando;
- BankTransaction creado desde Open Banking no rompe conciliación;
- candidates funcionan;
- matches no se crean automáticamente;
- duplicate detection sigue funcionando;
- sessions no se cierran automáticamente.
```

---

### 22.2. `005-payments`

Debe verificar:

```text id="si1ax8"
- pagos manuales siguen funcionando;
- pagos provider desde 018 siguen funcionando;
- Open Banking no crea Payment;
- PaymentAllocation no se crea desde sync;
- reconciliationStatus no cambia desde Open Banking directamente.
```

---

### 22.3. `006-account-statements`

Debe verificar:

```text id="g8zgil"
- estado de cuenta sigue derivado de cargos/pagos;
- snapshot bancario no cambia balance interno;
- movimiento Open Banking no altera estado de cuenta;
- send-to-reconciliation no altera estado de cuenta.
```

---

### 22.4. `016-secure-document-storage`

Debe verificar:

```text id="zpkqth"
- sourceModule=openBankingIntegration funciona;
- exports se almacenan sin storageKey expuesto;
- permisos de descarga se respetan;
- otros módulos no se rompen.
```

---

### 22.5. `018-payment-provider-integration`

Debe verificar:

```text id="w99gu2"
- ProviderSettlementRecord sigue funcionando;
- settlement detection no marca reconciled automáticamente;
- pagos provider-verified siguen disponibles para conciliación;
- Open Banking no altera mappings de provider.
```

---

## 23. Smoke tests

Debe ejecutar flujo mínimo:

```text id="g7eu7j"
1. PlatformAdmin crea provider definition mock.
2. PlatformAdmin activa provider definition.
3. FinancialManager crea tenant config.
4. FinancialManager habilita config.
5. FinancialManager crea BankConsent.
6. FinancialManager inicia autorización.
7. Adapter mock confirma autorización.
8. Sistema crea BankConnection active.
9. Sistema descubre cuenta externa.
10. FinancialManager vincula BankAccountLink con BankAccount interno.
11. FinancialManager ejecuta sync de movimientos.
12. Sistema importa movimientos y detecta duplicados.
13. FinancialManager envía un movimiento a Bank Reconciliation.
14. Sistema crea/vincula BankTransaction.
15. Sistema no crea Payment.
16. Sistema no crea Match.
17. Sistema genera reporte summary.
18. Sistema audita eventos críticos.
```

---

## 24. CI/CD gates

El pipeline debe fallar si:

```text id="hrp3ty"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan value object tests;
- fallan entity tests;
- fallan state machine tests;
- fallan repository tests;
- fallan service tests;
- fallan adapter tests;
- fallan secret management tests;
- fallan consent tests;
- fallan connection tests;
- fallan sync tests;
- fallan transaction sync tests;
- fallan dedupe tests;
- fallan webhook tests;
- fallan reconciliation bridge tests;
- fallan API tests;
- fallan authorization tests;
- fallan multitenancy tests;
- fallan financial integrity tests;
- fallan security tests;
- fallan audit tests;
- fallan observability tests;
- fallan OpenAPI tests;
- fallan performance smoke tests;
- OpenAPI documenta endpoints públicos administrativos;
- OpenAPI documenta /me Open Banking;
- snapshots contienen tokens;
- snapshots contienen credenciales bancarias;
- snapshots contienen full account number;
- snapshots contienen raw provider payload;
- snapshots contienen raw webhook signature;
- logs contienen tokens;
- logs contienen authorizationUrl;
- logs contienen full account number;
- audit contiene tokens;
- audit contiene raw payload;
- se detecta float/double para dinero;
- sync crea Payment;
- sync actualiza Account Statements;
- send-to-reconciliation crea Match;
- duplicate se envía a conciliación;
- externalAi está habilitado por defecto;
- paymentInitiation está habilitado por defecto;
- screenScraping está habilitado por defecto.
```

---

## 25. Cobertura mínima recomendada

```text id="ofyfy3"
Value Objects: 95%
Entities / state machines: 95%
Repositories: 90%
Services: 90%
Provider adapters mock/sandbox: 85%
Consent flow: 95%
Sync and dedupe: 95%
Webhook verification/idempotency: 95%
Reconciliation bridge: 95%
Authorization: 90%
Multitenancy: 95%
Security tests: 95%
API controllers: 85%
Reports: 80%
Observability: 75%
```

---

## 26. Matriz de trazabilidad

| Requisito                      | Tests mínimos                                          |
| ------------------------------ | ------------------------------------------------------ |
| Consentimiento explícito       | BankConsent unit, API, service, sync rejection         |
| No credenciales bancarias      | DTO, service, repository, snapshot, log/audit tests    |
| SecretRef strategy             | SecretRef VO, config service, repository               |
| BankConnection active          | connection state, sync service                         |
| Revocación                     | consent revoke, connection revoke, sync rejection      |
| Account discovery              | adapter, service, repository, API                      |
| BankAccountLink                | link service, cross-tenant, API                        |
| Balance sync                   | balance service, snapshot repo, no statements mutation |
| Transaction sync               | adapter, normalization, repository, service            |
| Deduplicación                  | externalTransactionId, fingerprint, retry              |
| Webhooks                       | signature, replay, duplicate, unresolved tenant        |
| Send to Reconciliation         | bridge tests, API, financial integrity                 |
| No Payment creation            | sync tests, bridge tests, regression                   |
| No Account Statements mutation | balance/sync/bridge regression                         |
| No final reconciliation        | bridge/regression                                      |
| Reports                        | report service/API/export                              |
| Audit                          | event emission/sanitization                            |
| Observability                  | safe logs/metrics                                      |
| No public endpoints            | route tests/OpenAPI                                    |
| No WordPress bank access       | CORS/route tests                                       |
| No external AI                 | feature flag/security tests                            |

---

## 27. Checklist de aceptación de pruebas

```text id="mi38bc"
[ ] Unit tests implementados.
[ ] Value object tests implementados.
[ ] Entity tests implementados.
[ ] State machine tests implementados.
[ ] Repository tests implementados.
[ ] Service tests implementados.
[ ] Provider adapter tests implementados.
[ ] SecretRef tests implementados.
[ ] Consent flow tests implementados.
[ ] Connection tests implementados.
[ ] Account discovery tests implementados.
[ ] Account link tests implementados.
[ ] Sync run tests implementados.
[ ] Balance sync tests implementados.
[ ] Transaction sync tests implementados.
[ ] Normalization tests implementados.
[ ] Fingerprint tests implementados.
[ ] Deduplication tests implementados.
[ ] Webhook signature tests implementados.
[ ] Webhook replay tests implementados.
[ ] Reconciliation bridge tests implementados.
[ ] API tests implementados.
[ ] Authorization tests implementados.
[ ] Multitenancy tests implementados.
[ ] Financial integrity tests implementados.
[ ] Security tests implementados.
[ ] Audit tests implementados.
[ ] Observability tests implementados.
[ ] Report tests implementados.
[ ] Export tests implementados.
[ ] OpenAPI tests implementados.
[ ] Performance tests mínimos implementados.
[ ] Concurrency tests implementados.
[ ] Regression tests implementados.
[ ] Smoke tests implementados.
[ ] CI gates configurados.
```

---

## 28. No aceptación

La implementación no debe aceptarse si las pruebas permiten:

```text id="f0x3ki"
- config cross-tenant;
- consent cross-tenant;
- connection cross-tenant;
- account link cross-tenant;
- sync run cross-tenant;
- transaction cross-tenant;
- webhook event cross-tenant;
- BankAccount tenant B vinculado a account link tenant A;
- tenantId desde body;
- búsqueda por id simple en entidades tenant-scoped;
- almacenamiento de usuario bancario;
- almacenamiento de contraseña bancaria;
- almacenamiento de OTP;
- almacenamiento de MFA secret;
- almacenamiento de raw access token;
- almacenamiento de raw refresh token;
- exposición de SecretRefs en superficies no autorizadas;
- exposición de número completo de cuenta;
- exposición de raw provider payload;
- exposición de raw webhook signature;
- payment initiation en MVP;
- screen scraping en MVP;
- sync sin consentimiento vigente;
- sync con connection revoked;
- sync con connection disabled;
- duplicación de movimientos por retry;
- duplicate enviado a conciliación;
- Payment creado desde Open Banking;
- Account Statements modificado desde Open Banking;
- ReconciliationMatch creado automáticamente;
- conciliación bancaria final automática;
- endpoint público administrativo;
- OpenAPI con endpoints públicos administrativos;
- acceso bancario desde WordPress;
- datos bancarios reales enviados a IA externa;
- auditoría sin sanitización;
- logs con tokens o payloads completos.
```

---

## 29. Resultado esperado

Al ejecutar este plan, el módulo `019-open-banking-integration` debe quedar validado como una integración financiera segura, extensible y compatible con el roadmap de RESIDENT Core.

Resultado esperado:

```text id="ger1lv"
provider definitions tested
tenant configs tested
SecretRef tested
no bank credential storage tested
no raw token storage tested
consent flow tested
authorization flow tested
BankConnection tested
revocation tested
account discovery tested
BankAccountLink tested
balance sync tested
transaction sync tested
normalization tested
fingerprint tested
deduplication tested
webhook signature tested
webhook replay protection tested
sync idempotency tested
reconciliation bridge tested
no Payment creation tested
no Account Statements mutation tested
no automatic final reconciliation tested
reports tested
exports tested
audit tested
observability tested
OpenAPI tested
multitenancy tested
authorization tested
security tested
performance smoke tested
concurrency tested
regression tested
smoke flow tested
CI gates ready
```

---

## 30. Expediente actualizado

```text id="z2v2bn"
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
│   │       └── test-plan.md
```
