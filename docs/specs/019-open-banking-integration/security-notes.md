# Security Notes — Spec 019 Open Banking Integration

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                                              |
| Spec ID         | 019                                                                                                                                                                                                        |
| Módulo          | Open Banking Integration                                                                                                                                                                                   |
| Documento       | Security Notes                                                                                                                                                                                             |
| Ruta            | `docs/specs/019-open-banking-integration/security-notes.md`                                                                                                                                                |
| Versión         | 0.1                                                                                                                                                                                                        |
| Estado          | needs-review                                                                                                                                                                                               |
| Fecha           | 2026-07-23                                                                                                                                                                                                 |
| Documento base  | `docs/specs/019-open-banking-integration/spec.md`                                                                                                                                                          |
| Plan técnico    | `docs/specs/019-open-banking-integration/plan.md`                                                                                                                                                          |
| Modelo de datos | `docs/specs/019-open-banking-integration/data-model.md`                                                                                                                                                    |
| Contrato API    | `docs/specs/019-open-banking-integration/api-contract.md`                                                                                                                                                  |
| Plan de pruebas | `docs/specs/019-open-banking-integration/test-plan.md`                                                                                                                                                     |
| Tareas          | `docs/specs/019-open-banking-integration/tasks.md`                                                                                                                                                         |
| Depende de      | `001-tenants`, `002-users-roles`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage`, `017-bank-reconciliation`, `018-payment-provider-integration` |
| Naturaleza      | Tenant-scoped / Consent-driven / Bank-connection-aware / Provider-agnostic / Sync-driven / Transaction-import-aware / Reconciliation-ready / Audit-heavy / Non-public                                      |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `019-open-banking-integration`.

El módulo permite integrar RESIDENT Core con proveedores Open Banking, agregadores financieros o APIs bancarias autorizadas para leer información bancaria del tenant, bajo consentimiento explícito, sin almacenar credenciales bancarias, sin iniciar pagos en MVP y sin reemplazar la conciliación bancaria.

Regla central:

```text id="f2kq7r"
Toda definición de proveedor, configuración tenant, consentimiento, conexión bancaria, token, cuenta externa, snapshot, movimiento, sync run, webhook, reporte, exportación, integración y evento de auditoría de Open Banking debe proteger tenant isolation, consentimiento explícito, tokens, SecretRefs, datos bancarios, idempotencia, deduplicación, trazabilidad hacia Bank Reconciliation, auditoría sanitizada, logs seguros, ausencia de payment initiation, ausencia de credenciales bancarias almacenadas, ausencia de endpoints públicos administrativos y ausencia de uso de IA externa con datos reales.
```

---

## 3. Resumen ejecutivo de seguridad

`Open Banking Integration` es un módulo financiero de alta sensibilidad. Aunque el MVP sea read-only, el riesgo operativo y de privacidad es alto porque el módulo puede acceder a:

```text id="y1u3xm"
- cuentas bancarias del tenant;
- saldos externos;
- movimientos bancarios;
- referencias bancarias;
- identificadores de cuenta externa;
- tokens de acceso del proveedor;
- consentimientos;
- webhooks bancarios;
- información que alimenta conciliación financiera.
```

Una falla de seguridad podría permitir:

```text id="b7yvck"
- conexión bancaria sin consentimiento;
- sincronización con tokens robados o expirados;
- exposición de movimientos bancarios;
- exposición de saldos;
- vinculación de cuenta bancaria externa con tenant incorrecto;
- duplicación de movimientos;
- conciliaciones indebidas;
- creación automática errónea de pagos;
- modificación directa de estados de cuenta;
- exposición de tokens o credenciales;
- almacenamiento indebido de usuario/clave bancaria;
- acceso desde WordPress a información bancaria;
- uso de datos bancarios reales por IA externa;
- exposición de información bancaria en logs, métricas o auditoría.
```

Por lo tanto, el módulo debe aplicar controles estrictos:

```text id="d6bg84"
- consentimiento explícito y vigente;
- read-only MVP;
- provider-agnostic adapters;
- SecretRef para tokens y credenciales;
- no almacenamiento de credenciales bancarias;
- no screen scraping;
- no payment initiation;
- tenant isolation estricto;
- autorización granular;
- BankAccountLink validado por tenant;
- idempotencia de sync y webhooks;
- deduplicación por externalTransactionId/fingerprint;
- no creación automática de Payment;
- no modificación directa de Account Statements;
- no conciliación final automática;
- Bank Reconciliation como autoridad final;
- auditoría financiera;
- logs sanitizados;
- métricas sin identificadores sensibles;
- no endpoints públicos administrativos;
- no acceso bancario desde WordPress;
- no IA externa con datos bancarios reales.
```

---

## 4. Principio dominante de seguridad

El principio dominante es:

```text id="r6gqjv"
Open Banking Integration debe leer evidencia bancaria autorizada, pero nunca debe convertirse en una vía automática no controlada para crear pagos, modificar saldos internos, confirmar conciliaciones o mover dinero.
```

Implicaciones:

```text id="n9ewp6"
- sincronizar no equivale a conciliar;
- movimiento bancario no equivale a Payment;
- saldo bancario externo no equivale a saldo interno de cuenta;
- webhook bancario no equivale a confirmación financiera final;
- Bank Reconciliation mantiene autoridad operativa;
- Payments mantiene autoridad sobre pagos internos;
- Account Statements se deriva solo de movimientos internos auditables.
```

---

## 5. Alcance de seguridad

### 5.1. Incluido

Estas notas cubren:

```text id="wgdfyz"
1. Autenticación de usuarios.
2. Autorización platform y tenant.
3. Tenant isolation.
4. Gestión segura de provider definitions.
5. Configuración tenant de Open Banking.
6. Consentimiento explícito.
7. Flujo de autorización bancaria.
8. Protección de tokens y SecretRefs.
9. Prohibición de credenciales bancarias.
10. BankConnection.
11. BankAccountLink.
12. Descubrimiento de cuentas externas.
13. Sincronización de cuentas.
14. Sincronización de saldos.
15. Sincronización de movimientos.
16. Normalización de movimientos.
17. Deduplicación.
18. Fingerprint.
19. Webhooks firmados.
20. Replay protection.
21. Integración con Bank Reconciliation.
22. Integración con Payments.
23. Integración con Account Statements.
24. Integración con Payment Provider Integration.
25. Integración con Secure Document Storage.
26. Reportes y exportaciones.
27. Auditoría.
28. Logs.
29. Métricas.
30. OpenAPI.
31. CI/CD security gates.
32. Prohibición de endpoints públicos administrativos.
33. Prohibición de acceso bancario desde WordPress.
34. Prohibición de IA externa con datos reales.
```

---

### 5.2. Fuera de alcance del MVP

No se implementa como capacidad activa:

```text id="nzjtf7"
- payment initiation bancaria;
- transferencias;
- débitos automáticos;
- domiciliación bancaria;
- pagos a proveedores;
- pagos masivos;
- órdenes de pago;
- tesorería avanzada;
- cash sweeping;
- cuentas escrow;
- crédito;
- scoring financiero;
- underwriting;
- screen scraping;
- almacenamiento de usuario bancario;
- almacenamiento de contraseña bancaria;
- almacenamiento de OTP;
- almacenamiento de MFA secret;
- automatización de login bancario;
- bypass de MFA;
- reversos bancarios;
- conciliación automática irreversible;
- reglas automáticas avanzadas;
- contabilidad completa;
- asientos contables;
- facturación electrónica;
- integración SRI;
- multi-moneda avanzada;
- lectura de cuentas personales de residentes;
- IA con datos bancarios reales.
```

Todo lo anterior debe quedar deshabilitado mediante diseño, feature flags y pruebas negativas.

---

## 6. Activos protegidos

### 6.1. Provider definitions

```text id="nay9vn"
open_banking_provider_definitions
```

Protege:

```text id="o7ix07"
providerKey
displayName
capabilities
supportedEnvironments
supportedCountries
supportedCurrencies
status
metadata no sensible
```

No debe contener:

```text id="io8y63"
secretos tenant
tokens
credenciales bancarias
webhook secrets reales
client secrets reales
```

---

### 6.2. Tenant Open Banking configs

```text id="o9xhl3"
tenant_open_banking_configs
```

Protege:

```text id="v6qwrs"
tenantId
providerDefinitionId
providerKey
environment
status
credentialSecretRef
webhookSecretRef
callbackUrl
webhookEndpointPath
allowedOrigins
publicConfig
metadata
```

---

### 6.3. Bank consents

```text id="h9g1tt"
bank_consents
```

Protege:

```text id="q9c2gk"
providerConsentId
scope
status
authorizedBy
authorizedAt
expiresAt
revokedAt
revocationReason
termsAcceptedVersion
authorizationUrlHash
```

---

### 6.4. Bank connections

```text id="typ719"
bank_connections
```

Protege:

```text id="n2mta3"
providerConnectionId
institutionName
institutionCode
country
currency
tokenSecretRef
refreshTokenSecretRef
lastSuccessfulSyncAt
lastFailedSyncAt
failureReason
status
```

---

### 6.5. Bank account links

```text id="vqqtec"
bank_account_links
```

Protege:

```text id="iqz8kx"
externalAccountId
externalAccountIdHash
externalAccountName
externalAccountType
accountNumberMasked
accountNumberHash
bankAccountId
status
```

---

### 6.6. Sync runs

```text id="i7r4iy"
open_banking_sync_runs
```

Protege:

```text id="ei3tj6"
syncType
triggerType
periodStart
periodEnd
syncCursor
counts
errorCode
errorMessage
retryOfSyncRunId
```

---

### 6.7. Account snapshots

```text id="szp7il"
open_banking_account_snapshots
```

Protege:

```text id="mx25tk"
availableBalance
currentBalance
currency
snapshotAt
externalAccountId
externalAccountIdHash
bankAccountId
```

---

### 6.8. Open Banking transactions

```text id="u3otde"
open_banking_transactions
```

Protege:

```text id="hbw1br"
externalTransactionId
externalTransactionIdHash
transactionDate
postedDate
description
reference
bankReference
amount
currency
balanceAfter
transactionType
fingerprint
bankTransactionId
status
```

---

### 6.9. Webhook events

```text id="wxok7j"
open_banking_webhook_events
```

Protege:

```text id="xccz1w"
providerEventId
eventType
signatureStatus
processingStatus
payloadHash
payloadHashPrefix
payloadPreview
signatureHeaderHash
providerTimestamp
errorCode
errorMessage
retryCount
```

---

### 6.10. Reportes y exportaciones

Protege:

```text id="c2y47m"
summary reports
sync status reports
imported transactions reports
error reports
exports CSV/XLSX/PDF
secureDocumentId
secureDocumentFileId
```

---

## 7. Clasificación de datos

### 7.1. Datos prohibidos

Estos datos no deben recibirse, persistirse, serializarse, auditarse, exportarse ni registrarse:

```text id="d3kb0f"
bank username
bank password
OTP
MFA secret
security questions
security answers
raw access token
raw refresh token
raw client secret
raw webhook secret
raw bank session cookie
Authorization header
cookies
full account number
raw account number
full provider payload
full webhook payload
full webhook signature
screen scraping credentials
browser automation session
storageKey
signedUrl persistente
SQL raw
stack trace en producción
datos bancarios reales enviados a IA externa
```

---

### 7.2. Datos altamente sensibles

```text id="lwxlz7"
credentialSecretRef
webhookSecretRef
tokenSecretRef
refreshTokenSecretRef
providerConsentId
providerConnectionId
externalAccountId
externalAccountIdHash
externalTransactionId
externalTransactionIdHash
accountNumberHash
fingerprint
payloadHash
signatureHeaderHash
syncCursor
availableBalance
currentBalance
amount
balanceAfter
bankTransactionId
```

---

### 7.3. Datos confidenciales

```text id="q2k2fz"
providerKey
environment
institutionName
institutionCode
connectionName
externalAccountName
externalAccountType
accountNumberMasked
transactionDate
postedDate
description sanitizada
reference sanitizada
bankReference sanitizada
direction
transactionType
status
errorCode
errorMessage sanitizado
```

---

### 7.4. Datos permitidos en DTO estándar

```text id="mwcxz4"
id
providerKey
displayName
environment
status
scope
authorizedAt
expiresAt
revokedAt
connectionName
institutionName
institutionCode
country
currency
accountNumberMasked
transactionDate
postedDate
description sanitizada
reference sanitizada
bankReference sanitizada
direction
amount como string decimal
availableBalance como string decimal
currentBalance como string decimal
balanceAfter como string decimal
transactionType
syncType
triggerType
counts
payloadHashPrefix
signatureStatus
processingStatus
errorCode seguro
errorMessage sanitizado
createdAt
updatedAt
```

---

### 7.5. Datos prohibidos en DTO estándar

```text id="hndopt"
tenantId
credentialSecretRef
webhookSecretRef
tokenSecretRef
refreshTokenSecretRef
raw token
raw refresh token
bank username
bank password
OTP
MFA secret
full account number
accountNumberHash
externalAccountIdHash
externalTransactionIdHash
fingerprint
raw provider payload
raw webhook payload
raw webhook signature
authorizationUrl fuera de respuesta inmediata
syncCursor sensible
storageKey
signedUrl persistente
SQL raw
stack trace
```

---

## 8. Fronteras de confianza

### 8.1. Cliente autenticado / API

Riesgos:

```text id="d2ycog"
- cliente envía tenantId falso;
- cliente intenta crear consentimiento sobre config de otro tenant;
- cliente intenta vincular cuenta externa con BankAccount de otro tenant;
- cliente intenta iniciar sync sobre conexión ajena;
- cliente envía credentials bancarias;
- cliente intenta habilitar payment initiation;
- cliente intenta crear movimiento manual con estado conciliable;
- cliente intenta enviar duplicate a conciliación.
```

Controles:

```text id="hodzpp"
- DTO whitelist;
- forbidNonWhitelisted;
- TenantGuard;
- PermissionGuard;
- validación tenant-scoped de todas las referencias;
- rechazo de tenantId en body;
- rechazo de credenciales bancarias;
- rechazo de payment initiation fields;
- validación de estados;
- BankAccountLinkTenantPolicy;
- OpenBankingTransactionReconciliationPolicy.
```

---

### 8.2. API / Proveedor Open Banking

Riesgos:

```text id="vwvk6w"
- proveedor devuelve datos inesperados;
- payload alterado;
- provider timeout;
- provider rate limit;
- token expirado;
- consentimiento revocado;
- webhook falso;
- replay webhook;
- externalTransactionId inestable;
- movimientos duplicados.
```

Controles:

```text id="e5ffsd"
- adapter provider-agnostic;
- timeouts;
- error mapping sanitizado;
- token SecretRef;
- reauthorizationRequired;
- webhook signature verification;
- timestamp validation;
- payloadHash;
- replay protection;
- externalTransactionIdHash;
- fingerprint;
- deduplicación.
```

---

### 8.3. API / Secret Manager

Riesgos:

```text id="n455so"
- tokens raw expuestos;
- SecretRef visible en superficies no autorizadas;
- rotación incorrecta;
- token revocado sigue activo;
- logs de secretos.
```

Controles:

```text id="uw19qf"
- OpenBankingSecretPort;
- SecretRef abstraction;
- no token raw en DB;
- no token raw en DTO;
- no token raw en logs;
- no token raw en audit;
- revokeToken;
- rotateCredential;
- acceso interno restringido.
```

---

### 8.4. API / Bank Reconciliation

Riesgos:

```text id="zyhubp"
- movimiento Open Banking crea conciliación final;
- duplicate se vuelve conciliable;
- BankTransaction se crea para tenant incorrecto;
- ReconciliationMatch se crea automáticamente;
- Payment se marca reconciled indebidamente.
```

Controles:

```text id="s51ly0"
- BankReconciliationIntegrationPort;
- OpenBankingReconciliationBridgeService;
- validación tenant-scoped;
- BankAccountLink linked obligatorio;
- duplicate no conciliable;
- no crear ReconciliationMatch;
- no marcar BankTransaction matched;
- no cerrar ReconciliationSession;
- auditoría.
```

---

### 8.5. API / Payments

Riesgos:

```text id="fxdn6v"
- movimiento bancario crea Payment;
- depósito detectado altera Payment status;
- settlement detection altera provider mappings;
- Payments queda inconsistente con Bank Reconciliation.
```

Controles:

```text id="ctvqwm"
- Open Banking no crea Payments;
- Open Banking no crea PaymentAllocation;
- Open Banking no cambia payment.status;
- Payment Provider settlements son solo candidatos;
- Bank Reconciliation confirma match final.
```

---

### 8.6. API / Account Statements

Riesgos:

```text id="g1nrox"
- snapshot bancario altera saldo interno;
- movimiento bancario modifica estado de cuenta;
- saldo externo se mezcla con saldo interno.
```

Controles:

```text id="g0nmdz"
- Account Statements se derivan solo de Charges/Payments/Allocations/Adjustments/Reversals;
- OpenBankingAccountSnapshot es evidencia externa;
- reportes pueden comparar, no mezclar fuentes de verdad;
- tests de regresión.
```

---

### 8.7. API / WordPress

Riesgos:

```text id="x8mciu"
- WordPress consulta saldos bancarios;
- WordPress inicia autorización bancaria;
- WordPress dispara sync;
- WordPress muestra movimientos administrativos;
- WordPress expone reportes financieros.
```

Controles:

```text id="i65d94"
- no endpoints públicos administrativos;
- no API /public Open Banking;
- no API /me Open Banking MVP;
- CORS restrictivo;
- WordPress solo portal informativo;
- Core maneja operaciones financieras.
```

---

## 9. Threat model resumido

### 9.1. Spoofing

Amenazas:

```text id="j7z45n"
- usuario suplanta FinancialManager;
- usuario intenta operar como PlatformAdmin;
- atacante envía webhook falso;
- cliente envía actor fields;
- cliente intenta usar connectionId ajeno.
```

Controles:

```text id="if60ng"
- Keycloak/OIDC;
- membership activa;
- permisos Core;
- TenantGuard;
- PermissionGuard;
- webhook signature verification;
- actor derivado del token;
- rechazo de createdBy/updatedBy/authorizedBy desde body.
```

---

### 9.2. Tampering

Amenazas:

```text id="du6p0o"
- cliente manipula scope;
- cliente agrega paymentsInitiate;
- cliente manipula status;
- cliente altera bankAccountId;
- atacante altera payload webhook;
- proveedor devuelve movimiento alterado o incompleto.
```

Controles:

```text id="oo5i41"
- state machines;
- ScopePolicy;
- NoPaymentInitiationPolicy;
- tenant validation;
- raw body signature verification;
- normalization service;
- dedupe service;
- constraints DB.
```

---

### 9.3. Repudiation

Amenazas:

```text id="d6ei8i"
- usuario niega haber autorizado conexión;
- usuario niega haber revocado consentimiento;
- usuario niega haber enviado movimiento a conciliación;
- proveedor reintenta webhook;
- administrador niega haber habilitado config.
```

Controles:

```text id="nvarnu"
- audit trail;
- actorUserId desde token;
- timestamps UTC;
- traceId;
- requestId;
- providerEventId;
- payloadHash;
- providerConsentId;
- BankConsent histórico;
- no eliminación física ordinaria.
```

---

### 9.4. Information Disclosure

Amenazas:

```text id="a036pn"
- tokens expuestos;
- SecretRefs expuestos;
- número completo de cuenta expuesto;
- payload completo expuesto;
- movimientos tenant B visibles;
- saldos visibles a usuarios no autorizados;
- reportes con datos cross-tenant;
- logs con datos bancarios sensibles.
```

Controles:

```text id="s2id1d"
- SecretRef strategy;
- DTO minimization;
- tenant isolation;
- log sanitization;
- audit sanitization;
- no full account number;
- accountNumberMasked only;
- no raw payload;
- no raw signature;
- no public endpoints.
```

---

### 9.5. Denial of Service

Amenazas:

```text id="dk4zmt"
- syncs masivos;
- periodos demasiado largos;
- webhooks voluminosos;
- webhooks repetidos;
- provider rate limit;
- reportes pesados;
- exports repetidos.
```

Controles:

```text id="kp9s1f"
- rate limiting;
- periodo máximo de sync;
- pageSize máximo;
- payload size limit;
- unique running sync;
- retry/backoff;
- 202 para sync evolutivo;
- métricas y alertas.
```

---

### 9.6. Elevation of Privilege

Amenazas:

```text id="bo5bkq"
- residente accede a movimientos bancarios;
- BoardMember accede a tokens/config técnica;
- TenantAdmin sin permiso financiero inicia sync;
- PlatformAdmin accede automáticamente a datos bancarios tenant;
- usuario reprocesa webhook sin permiso.
```

Controles:

```text id="qh6l1q"
- permisos granulares;
- no /me Open Banking MVP;
- PlatformAdmin sin acceso automático a datos tenant;
- DTOs por rol;
- audit reforzada para soporte excepcional;
- PermissionGuard en reprocess/export/sync.
```

---

## 10. Autenticación

### 10.1. APIs platform y tenant

Requieren:

```http id="d0f6nl"
Authorization: Bearer <access_token>
```

Reglas:

```text id="doc0ta"
- token válido;
- usuario activo;
- membership activa en tenant para endpoints tenant;
- tenant activo;
- permisos suficientes;
- actor derivado del token;
- no actor desde body.
```

---

### 10.2. Webhook API

No usa token de usuario.

Debe validar:

```text id="lagsc6"
- providerKey soportado;
- firma válida si el proveedor lo soporta;
- timestamp dentro de tolerancia si aplica;
- raw body íntegro;
- payloadHash;
- providerEventId idempotente;
- replay protection;
- tenant/config/connection resoluble;
- evento compatible con estado de conexión.
```

---

## 11. Autorización

### 11.1. Provider definitions

```text id="b0qihs"
openBankingProviderDefinitions.create
openBankingProviderDefinitions.read
openBankingProviderDefinitions.update
openBankingProviderDefinitions.activate
openBankingProviderDefinitions.deprecate
openBankingProviderDefinitions.archive
```

---

### 11.2. Tenant configs

```text id="isx5g7"
tenantOpenBankingConfigs.create
tenantOpenBankingConfigs.read
tenantOpenBankingConfigs.update
tenantOpenBankingConfigs.enable
tenantOpenBankingConfigs.disable
tenantOpenBankingConfigs.testConnection
tenantOpenBankingConfigs.archive
```

---

### 11.3. Consents

```text id="z8uam1"
openBankingConsents.create
openBankingConsents.read
openBankingConsents.authorize
openBankingConsents.renew
openBankingConsents.revoke
openBankingConsents.archive
```

---

### 11.4. Connections

```text id="keyvsc"
openBankingConnections.create
openBankingConnections.read
openBankingConnections.update
openBankingConnections.revoke
openBankingConnections.disable
openBankingConnections.archive
```

---

### 11.5. Account links

```text id="oj7npm"
openBankingAccountLinks.create
openBankingAccountLinks.read
openBankingAccountLinks.link
openBankingAccountLinks.unlink
openBankingAccountLinks.disable
openBankingAccountLinks.archive
```

---

### 11.6. Sync

```text id="zihzp7"
openBankingSync.start
openBankingSync.read
openBankingSync.retry
openBankingSync.cancel
openBankingSync.archive
```

---

### 11.7. Transactions

```text id="rucze7"
openBankingTransactions.read
openBankingTransactions.review
openBankingTransactions.ignore
openBankingTransactions.sendToReconciliation
openBankingTransactions.archive
```

---

### 11.8. Webhooks

```text id="c0r8s4"
openBankingWebhooks.read
openBankingWebhooks.reprocess
openBankingWebhooks.archive
```

---

### 11.9. Reports

```text id="xcgxzy"
openBankingReports.read
openBankingReports.export
```

---

### 11.10. Audit

```text id="smhv3x"
openBanking.audit.read
```

---

## 12. PlatformAdmin

Regla:

```text id="tb8zjt"
PlatformAdmin puede administrar definiciones platform de proveedores Open Banking, pero no accede automáticamente a datos bancarios tenant.
```

Acceso excepcional a datos tenant requiere:

```text id="cg88qd"
- permiso explícito;
- contexto tenant;
- justificación;
- auditoría reforzada;
- DTO minimizado;
- no tokens;
- no SecretRefs no autorizados;
- no número completo de cuenta;
- no raw payload.
```

---

## 13. Tenant isolation

### 13.1. Tablas tenant-scoped

```text id="f00byz"
tenant_open_banking_configs
bank_consents
bank_connections
bank_account_links
open_banking_sync_runs
open_banking_account_snapshots
open_banking_transactions
open_banking_webhook_events
```

Excepción:

```text id="op04ns"
open_banking_provider_definitions es platform-scoped.
```

---

### 13.2. Patrón requerido

```typescript id="hvsyep"
await prisma.bankConnection.findFirst({
  where: {
    id: connectionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 13.3. Patrón prohibido

```typescript id="b2cw45"
await prisma.bankConnection.findUnique({
  where: { id: connectionId }
});
```

También prohibido en entidades tenant-scoped:

```typescript id="m7x4ws"
await prisma.tenantOpenBankingConfig.findUnique({ where: { id } });
await prisma.bankConsent.findUnique({ where: { id } });
await prisma.bankAccountLink.findUnique({ where: { id } });
await prisma.openBankingSyncRun.findUnique({ where: { id } });
await prisma.openBankingTransaction.findUnique({ where: { id } });
await prisma.openBankingWebhookEvent.findUnique({ where: { id } });
```

---

### 13.4. Referencias que deben validarse por tenant

```text id="wp5n36"
tenantOpenBankingConfigId
bankConsentId
bankConnectionId
bankAccountLinkId
syncRunId
openBankingTransactionId
webhookEventId
bankAccountId
bankTransactionId
providerSettlementRecordId
secureDocumentId
secureDocumentFileId
```

---

### 13.5. Cross-tenant response

Recomendación:

```text id="v5rn22"
Responder 404 para recursos de otro tenant, evitando revelar existencia.
```

---

## 14. Seguridad de consentimiento

### 14.1. Regla central

```text id="yip5q2"
Sin BankConsent authorized y vigente no se permite sincronización Open Banking.
```

---

### 14.2. Consentimiento debe registrar

```text id="lul7xv"
tenantId
tenantOpenBankingConfigId
providerKey
providerConsentId si existe
scope
status
authorizedBy
authorizedAt
expiresAt si aplica
termsAcceptedVersion si aplica
revokedBy
revokedAt
revocationReason
```

---

### 14.3. Scope permitido MVP

```text id="t0bzoc"
accountsRead
balancesRead
transactionsRead
```

---

### 14.4. Scope prohibido MVP

```text id="coy9g3"
paymentsInitiate
```

---

### 14.5. Authorization URL

Permitido:

```text id="ty2vlo"
Devolver authorizationUrl temporal únicamente en la respuesta inmediata autorizada de start-authorization.
```

Prohibido:

```text id="ebwyfi"
- persistir authorizationUrl completa;
- loggear authorizationUrl;
- auditar authorizationUrl;
- devolver authorizationUrl en listados;
- devolver authorizationUrl después de expirada;
- exponer authorizationUrl a usuarios no autorizados.
```

---

## 15. Seguridad de conexiones bancarias

### 15.1. Reglas

```text id="fjhwpd"
- BankConnection requiere tenantId.
- BankConnection requiere BankConsent authorized vigente.
- BankConnection active permite sync.
- BankConnection revoked bloquea sync.
- BankConnection disabled bloquea sync.
- BankConnection reauthorizationRequired bloquea sync.
- BankConnection archived bloquea toda operación.
- tokenSecretRef no se expone por API.
- refreshTokenSecretRef no se expone por API.
```

---

### 15.2. Revocación

Revocar debe:

```text id="igbcyj"
- requerir permiso;
- requerir razón;
- llamar adapter.revokeConnection si aplica;
- revocar/inutilizar tokens si aplica;
- marcar BankConnection revoked;
- marcar BankConsent revoked si corresponde;
- bloquear syncs futuros;
- conservar historial;
- auditar bankConnection.revoked y bankConsent.revoked.
```

---

### 15.3. Reautorización

Si token o consentimiento expiran:

```text id="ojax6w"
- marcar BankConnection reauthorizationRequired;
- bloquear sync;
- requerir nuevo flujo de autorización;
- no intentar usar credenciales bancarias;
- auditar bankConnection.reauthorizationRequired.
```

---

## 16. Seguridad de secretos y tokens

### 16.1. Persistencia permitida

```text id="un8lpr"
credentialSecretRef
webhookSecretRef
tokenSecretRef
refreshTokenSecretRef
```

---

### 16.2. Persistencia prohibida

```text id="fr6oi9"
raw access token
raw refresh token
raw client secret
raw webhook secret
bank username
bank password
OTP
MFA secret
security questions
session cookies
```

---

### 16.3. API

Reglas:

```text id="ijj8ta"
- no devolver tokens raw;
- no devolver refresh tokens raw;
- no devolver credentialSecretRef en DTO estándar;
- no devolver webhookSecretRef en DTO estándar;
- no devolver tokenSecretRef;
- no devolver refreshTokenSecretRef;
- mostrar solo credentialSecretConfigured=true/false;
- mostrar solo webhookSecretConfigured=true/false;
- SecretRef resolution solo para servicios internos.
```

---

## 17. No almacenamiento de credenciales bancarias

### 17.1. Prohibición absoluta

RESIDENT Core no debe almacenar ni procesar como dato persistente:

```text id="ddjqvc"
usuario bancario
contraseña bancaria
OTP
MFA secret
preguntas de seguridad
respuestas de seguridad
cookies de sesión bancaria
credenciales de login bancario
datos de screen scraping
```

---

### 17.2. Screen scraping

Regla:

```text id="wz22yl"
Screen scraping está prohibido en el MVP.
```

Feature flag obligatorio:

```text id="j39fq5"
OPEN_BANKING_SCREEN_SCRAPING_ENABLED=false
```

---

## 18. Seguridad de cuentas externas

### 18.1. Persistencia permitida

```text id="euuq23"
externalAccountId
externalAccountIdHash
externalAccountName
externalAccountType
accountNumberMasked
accountNumberHash
currency
status
```

---

### 18.2. Persistencia prohibida

```text id="n8a9ls"
número completo de cuenta
raw account number
usuario bancario
contraseña bancaria
tokens
payload completo de cuenta
```

---

### 18.3. BankAccountLink

Reglas:

```text id="r5vga7"
- BankAccountLink requiere tenantId.
- BankAccountLink linked requiere bankAccountId.
- BankAccount debe pertenecer al mismo tenant.
- BankAccount archived no puede vincularse.
- externalAccountIdHash se usa para dedupe.
- accountNumberHash no se expone.
- accountNumberMasked puede exponerse bajo permiso.
- desvincular no elimina historial.
```

---

## 19. Seguridad de sync

### 19.1. Preconditions

Todo sync requiere:

```text id="euyqut"
- tenant activo;
- usuario autorizado o trigger técnico válido;
- TenantOpenBankingConfig enabled;
- BankConsent authorized vigente;
- BankConnection active;
- scopes suficientes;
- provider adapter disponible;
- periodo válido si syncType=transactions;
- no sync running duplicado.
```

---

### 19.2. Reglas

```text id="tcbmfa"
- sync accounts no crea Payment;
- sync balances no actualiza Account Statements;
- sync transactions no crea Payment;
- sync transactions no crea ReconciliationMatch;
- sync retry no duplica movimientos;
- sync failed debe registrar error sanitizado;
- syncCursor no debe contener token;
- completed/completedWithWarnings debe registrar conteos.
```

---

### 19.3. Periodo máximo

Recomendación:

```text id="x8bogy"
OPEN_BANKING_MAX_SYNC_PERIOD_DAYS=90
```

---

## 20. Seguridad de saldos

### 20.1. Regla central

```text id="gom0id"
El saldo bancario externo no modifica el saldo financiero interno del residente, propietario, unidad o tenant.
```

---

### 20.2. Uso permitido

```text id="d8x5rq"
- reportar availableBalance;
- reportar currentBalance;
- comparar saldo bancario externo vs saldo interno del sistema;
- detectar diferencias operativas;
- alimentar revisión administrativa.
```

---

### 20.3. Prohibido

```text id="ubbuw2"
- actualizar Account Statements desde snapshot;
- crear ajustes desde snapshot;
- crear pagos desde snapshot;
- marcar conciliación final desde snapshot;
- exponer saldos a residentes/propietarios en MVP.
```

---

## 21. Seguridad de movimientos bancarios

### 21.1. Reglas

```text id="vud9tv"
- OpenBankingTransaction requiere tenantId.
- amount debe ser positivo.
- currency MVP = USD.
- direction debe ser credit/debit/neutral.
- fingerprint obligatorio.
- externalTransactionIdHash si existe externalTransactionId.
- duplicate no es conciliable.
- sentToReconciliation no equivale a matched.
- bankTransactionId debe pertenecer al mismo tenant.
```

---

### 21.2. Estados no conciliables

No enviar a Bank Reconciliation:

```text id="js7sll"
duplicate
rejected
ignored
archived
```

---

### 21.3. Estados conciliables con control

Permitido:

```text id="eaizoh"
imported
requiresReview con permiso/policy
```

---

### 21.4. Datos prohibidos

```text id="b6l5s3"
raw provider payload
full account number
tokens
credentials
fingerprint desde cliente
status directo desde cliente
bankTransactionId cross-tenant
```

---

## 22. Deduplicación e idempotencia

### 22.1. Identificadores

Usar:

```text id="sgvwvh"
externalTransactionIdHash
fingerprint
providerEventId
payloadHash
Idempotency-Key
bankConnectionId
bankAccountLinkId
tenantId
providerKey
```

---

### 22.2. Reglas

```text id="gko5s7"
- mismo externalTransactionIdHash no crea dos movimientos activos.
- mismo fingerprint no crea dos movimientos activos.
- mismo providerEventId no procesa dos veces.
- mismo payloadHash en ventana de replay se controla.
- retry de sync no duplica.
- duplicate se audita.
- duplicate no se envía a conciliación.
```

---

## 23. Seguridad de webhooks

### 23.1. Regla central

```text id="sh96wd"
El webhook Open Banking puede disparar sincronización o cambio de estado, pero no puede crear Payment ni confirmar conciliación final.
```

---

### 23.2. Validaciones obligatorias

```text id="upccpg"
- providerKey soportado;
- raw body disponible;
- payload size permitido;
- payloadHash calculado;
- signature presente si requerida;
- signature válida si requerida;
- timestamp dentro de tolerancia si aplica;
- providerEventId idempotente si existe;
- replay no detectado;
- tenant/config/connection resoluble;
- conexión active si dispara sync;
- consentimiento vigente si dispara sync;
```

---

### 23.3. Eventos inválidos

Rechazar o registrar sin efectos:

```text id="sbm19l"
firma ausente
firma inválida
timestamp expirado
payload oversized
payload inválido
providerKey no soportado
providerEventId duplicado
tenant unresolved
connection revoked
connection disabled
consent expired
```

---

### 23.4. Datos persistidos

Persistir:

```text id="mw0bcx"
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
errorMessage sanitizado
retryCount
```

No persistir:

```text id="uzlu09"
raw payload completo
raw signature
webhook secret
tokens
credenciales bancarias
full account number
Authorization header
cookies
```

---

## 24. Replay protection

### 24.1. Reglas

```text id="hwkfvy"
- providerEventId duplicado no produce efectos nuevos.
- payloadHash repetido en ventana de tolerancia puede marcar replay/duplicate.
- duplicate puede responder 200 idempotente.
- duplicate no dispara sync adicional.
- duplicate no crea movimientos.
- duplicate no envía nada a conciliación.
- duplicate se audita.
```

---

### 24.2. Configuración

```text id="r7vgdg"
OPEN_BANKING_WEBHOOK_REPLAY_PROTECTION_ENABLED=true
OPEN_BANKING_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS=300
```

---

## 25. Seguridad de integración con Bank Reconciliation

### 25.1. Regla central

```text id="rjapql"
Open Banking alimenta Bank Reconciliation; Bank Reconciliation gobierna la conciliación.
```

---

### 25.2. `send-to-reconciliation` debe validar

```text id="j9u4h3"
- OpenBankingTransaction tenant-scoped;
- status conciliable;
- isDuplicate=false;
- BankAccountLink linked;
- BankAccount tenant-scoped;
- BankAccount no archived;
- BankTransaction no duplicado por source;
- operación transaccional;
- auditoría.
```

---

### 25.3. Prohibido

```text id="s1iaj8"
- crear Payment;
- crear PaymentAllocation;
- crear ReconciliationMatch;
- marcar BankTransaction matched;
- marcar Payment reconciled;
- cerrar ReconciliationSession;
- confirmar ProviderSettlementRecord;
- ignorar difference/review policy.
```

---

## 26. Seguridad de integración con Payments

### 26.1. Regla central

```text id="t5y1zs"
Open Banking no crea Payments en MVP.
```

---

### 26.2. Prohibido

```text id="sio39i"
- crear payment;
- crear payment_receipt;
- crear payment_allocation;
- cambiar payment.status;
- cambiar payment.reconciliationStatus directamente;
- revertir payment;
- validar comprobantes;
- asignar pagos automáticamente.
```

---

### 26.3. Permitido

```text id="w8rvbu"
- comparar movimientos bancarios con Payments existentes;
- alimentar candidatos de conciliación;
- identificar depósitos pendientes;
- cruzar liquidaciones de proveedor como evidencia auxiliar.
```

---

## 27. Seguridad de integración con Account Statements

### 27.1. Regla central

```text id="ukro3k"
Account Statements no se actualiza desde Open Banking.
```

---

### 27.2. Prohibido

```text id="akm0yv"
- crear statement lines desde OpenBankingTransaction;
- modificar balance interno desde snapshot;
- modificar saldo de unidad desde movimiento bancario;
- crear cargos/ajustes desde Open Banking;
- crear reversos desde Open Banking.
```

---

### 27.3. Permitido

```text id="edm0u1"
- reportar diferencia entre saldo bancario externo y saldo interno;
- mostrar información agregada a usuarios administrativos autorizados;
- alimentar revisión financiera.
```

---

## 28. Seguridad de integración con Payment Provider Integration

### 28.1. Settlement detection

Si un movimiento parece liquidación de proveedor:

```text id="rxjykv"
transactionType = paymentProviderSettlement
```

Debe tratarse como:

```text id="iszbwr"
- evidencia bancaria externa;
- candidato de revisión;
- posible vínculo con ProviderSettlementRecord;
- insumo para Bank Reconciliation.
```

---

### 28.2. Prohibido

```text id="hgstsm"
- marcar ProviderSettlementRecord como settled automáticamente;
- marcar ProviderPaymentMapping como reconciled automáticamente;
- modificar Payment provider-linked;
- crear reverso automático por diferencia;
- resolver chargebacks/refunds automáticamente.
```

---

## 29. Seguridad de Secure Document Storage

### 29.1. Clasificación recomendada

Para evidencia de consentimiento:

```json id="rnmzx1"
{
  "category": "administrativeDocument",
  "sourceModule": "openBankingIntegration",
  "sourceResourceType": "bankConsent",
  "sensitivity": "restricted",
  "visibility": "administrative",
  "ownerType": "tenant"
}
```

Para exportaciones:

```json id="k47fv1"
{
  "category": "reportExport",
  "sourceModule": "openBankingIntegration",
  "sourceResourceType": "openBankingReportExport",
  "sensitivity": "restricted",
  "visibility": "administrative",
  "ownerType": "tenant"
}
```

---

### 29.2. Reglas

```text id="k6hf10"
- no exponer storageKey;
- no exponer signedUrl persistente;
- no almacenar tokens como documentos ordinarios;
- no almacenar raw payloads bancarios completos como documentos ordinarios;
- descargas requieren autorización;
- descargas se auditan;
- reportes administrativos no son visibles por residentes/propietarios en MVP.
```

---

## 30. Seguridad de reportes

### 30.1. Reportes permitidos

```text id="z2rw0e"
summary
syncStatus
importedTransactions
errors
export
```

---

### 30.2. Reglas

```text id="sk8ope"
- reportes siempre tenant-scoped;
- requieren openBankingReports.read/export;
- no exponen tokens;
- no exponen SecretRefs;
- no exponen número completo de cuenta;
- no exponen accountNumberHash;
- no exponen raw payload;
- no exponen raw signature;
- no incluyen tenant B;
- export persistido usa Secure Document Storage;
- no storageKey en response.
```

---

## 31. Seguridad de WordPress

Prohibido:

```text id="prpeej"
WordPress no consulta conexiones bancarias.
WordPress no consulta saldos bancarios.
WordPress no consulta movimientos bancarios.
WordPress no inicia autorización Open Banking.
WordPress no ejecuta sync.
WordPress no consulta webhooks.
WordPress no consulta reportes Open Banking.
WordPress no accede a tokens.
WordPress no actúa como intermediario bancario.
```

Permitido:

```text id="rzddhb"
WordPress puede enlazar al portal autenticado de RESIDENT Core, sin procesar ni consultar datos bancarios.
```

---

## 32. Endpoints públicos prohibidos

No crear:

```text id="m8do93"
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

```text id="fq2o8u"
404 route not found
```

---

## 33. `/me` API

No existe `/me` Open Banking en MVP.

Prohibido crear:

```text id="ss2y2c"
GET  /api/v1/me/open-banking
GET  /api/v1/me/open-banking/connections
GET  /api/v1/me/open-banking/accounts
GET  /api/v1/me/open-banking/transactions
GET  /api/v1/me/open-banking/reports
POST /api/v1/me/open-banking/sync
```

---

## 34. IA y procesamiento externo

### 34.1. Prohibición MVP

No enviar a servicios externos de IA:

```text id="t0sy56"
movimientos bancarios reales
saldos reales
números de cuenta
accountNumberHash
externalAccountId
externalTransactionId
referencias bancarias reales
descripciones bancarias reales
tokens
SecretRefs
payloads reales
webhooks reales
reportes reales
exports reales
datos personales vinculados a movimientos
```

---

### 34.2. Permitido

```text id="bcvvpy"
fixtures sintéticos
payloads mock
documentación técnica
código sin secretos
tests con datos ficticios
diagramas sin datos reales
```

---

### 34.3. Feature flag

```text id="dgbmqk"
OPEN_BANKING_EXTERNAL_AI_ENABLED=false
```

---

## 35. Auditoría

### 35.1. Eventos obligatorios

```text id="tnpx1u"
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

### 35.2. Metadata permitida

```text id="q4x0xt"
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
payloadHashPrefix
```

---

### 35.3. Metadata prohibida

```text id="g0eqcl"
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
authorizationUrl completa
syncCursor sensible
```

---

### 35.4. Auditoría reforzada

Aplicar auditoría reforzada en:

```text id="qen62d"
- creación de tenant Open Banking config;
- habilitación de config;
- actualización de SecretRefs;
- testConnection fallido;
- creación de consentimiento;
- inicio de autorización;
- autorización completada;
- revocación de consentimiento;
- revocación de conexión;
- reauthorizationRequired;
- sync failed;
- sync completedWithWarnings;
- movimientos duplicados;
- movimiento requiresReview;
- envío a Bank Reconciliation;
- webhook rejected;
- webhook duplicate;
- webhook reprocessed;
- export de reporte;
- acceso excepcional PlatformAdmin.
```

---

## 36. Logs seguros

### 36.1. Campos permitidos

```text id="bfqozu"
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

### 36.2. Campos prohibidos

```text id="z4riuc"
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
credentialSecretRef
webhookSecretRef
accountNumberHash
full account number
raw provider payload
raw webhook signature
raw token
raw refresh token
cookies
Authorization header
authorizationUrl
syncCursor sensible
storageKey
signedUrl
SQL raw
stack trace en producción
```

---

### 36.3. Ejemplo de log seguro

```json id="mj79we"
{
  "action": "openBankingSync.completed",
  "outcome": "success",
  "providerKey": "mockOpenBanking",
  "environment": "sandbox",
  "syncType": "transactions",
  "triggerType": "manual",
  "currency": "USD",
  "durationMs": 842,
  "traceId": "req_123456"
}
```

---

## 37. Métricas seguras

### 37.1. Métricas permitidas

```text id="bjte7u"
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

### 37.2. Labels permitidos

```text id="t9yic4"
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

### 37.3. Labels prohibidos

```text id="jo0dm7"
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

## 38. Seguridad de base de datos

### 38.1. Constraints críticos

```text id="rg5ii9"
amount > 0 en open_banking_transactions
balances no negativos si aplica
period_start <= period_end
conteos no negativos en open_banking_sync_runs
authorized_at requerido si BankConsent status=authorized
authorized_by requerido si BankConsent status=authorized
revocation_reason requerido si BankConsent status=revoked
revocation_reason requerido si BankConnection status=revoked
bank_account_id requerido si BankAccountLink status=linked
completed_at requerido si SyncRun status=completed/completedWithWarnings
failed_at y error_code requeridos si SyncRun status=failed
bank_transaction_id requerido si OpenBankingTransaction status=sentToReconciliation
reject_reason requerido si OpenBankingTransaction status=rejected
ignore_reason requerido si OpenBankingTransaction status=ignored
processed_at requerido si WebhookEvent processingStatus=processed
rejected_at/error_code requerido si WebhookEvent processingStatus=rejected
```

---

### 38.2. Índices únicos críticos

```text id="vrqx5n"
providerKey único en open_banking_provider_definitions
enabled config único por tenant/provider/environment
providerConsentId único por tenant/provider si existe
providerConnectionId único por tenant/provider si existe
externalAccountIdHash único por tenant/provider/connection
active BankAccountLink único por tenant/bankAccount si aplica
running sync único por tenant/connection/syncType
externalTransactionIdHash único por tenant/provider/connection/accountLink
fingerprint único por tenant/provider/connection/accountLink
providerEventId único por tenant/provider si tenant resuelto
payloadHash + receivedAt para replay detection
```

---

## 39. Seguridad transaccional

### 39.1. Operaciones transaccionales obligatorias

```text id="y5uj7q"
- crear BankConsent;
- iniciar autorización y pasar a pendingAuthorization;
- confirmar autorización, guardar SecretRefs y crear BankConnection;
- revocar consentimiento/conexión;
- descubrir cuentas y crear BankAccountLinks;
- iniciar sync run;
- sincronizar cuentas;
- sincronizar saldos;
- sincronizar movimientos;
- deduplicar movimientos;
- enviar movimiento a Bank Reconciliation;
- procesar webhook;
- reprocesar webhook;
- exportar reporte persistido.
```

---

### 39.2. Regla crítica

```text id="kq71gj"
Si send-to-reconciliation no puede crear o vincular BankTransaction, OpenBankingTransaction no debe quedar como sentToReconciliation.
```

---

## 40. Seguridad de concurrencia

### 40.1. Sync simultáneo

Riesgo:

```text id="dvmece"
Dos syncs iguales se ejecutan simultáneamente para la misma conexión.
```

Control:

```text id="scf939"
unique running sync por tenant + connection + syncType e idempotencia.
```

---

### 40.2. Webhook duplicado simultáneo

Riesgo:

```text id="y38hzx"
Dos webhooks iguales disparan dos syncs o duplican movimientos.
```

Control:

```text id="f0o6z1"
providerEventId unique, payloadHash replay protection y dedupe de movimientos.
```

---

### 40.3. Retry simultáneo

Riesgo:

```text id="ti8oop"
Dos retries duplican movimientos.
```

Control:

```text id="vihgpj"
externalTransactionIdHash/fingerprint unique y retryOfSyncRunId.
```

---

### 40.4. Revocación y sync simultáneos

Riesgo:

```text id="f0crdg"
Se revoca conexión mientras un sync está corriendo.
```

Control:

```text id="e0l9za"
Validar estado dentro de transacción, registrar orden de eventos y bloquear efectos posteriores no autorizados.
```

---

## 41. Rate limiting y abuso

Aplicar rate limit a:

```text id="yr8dka"
POST /api/v1/tenant/open-banking/configs/{configId}/test-connection
POST /api/v1/tenant/open-banking/consents/{consentId}/start-authorization
POST /api/v1/tenant/open-banking/consents/{consentId}/renew
POST /api/v1/tenant/open-banking/connections/{connectionId}/sync
POST /api/v1/tenant/open-banking/sync-runs/{syncRunId}/retry
POST /api/v1/tenant/open-banking/transactions/{openBankingTransactionId}/send-to-reconciliation
POST /api/v1/webhooks/open-banking/{providerKey}
GET  /api/v1/tenant/open-banking/reports/export
```

Estrategia:

```text id="jdvvfb"
- límites por usuario;
- límites por tenant;
- límites por providerKey;
- límites por endpoint;
- límites por IP para webhook;
- payload size limit;
- periodo máximo de sync;
- alertas por firmas inválidas repetidas;
- alertas por sync failed spike;
- alertas por duplicate spike;
- alertas por provider rate limit.
```

---

## 42. CORS, cache y headers

### 42.1. Cache

Todos los endpoints privados:

```http id="ccca11"
Cache-Control: no-store
```

---

### 42.2. CORS

Reglas:

```text id="ukxm1m"
- no wildcard con credenciales;
- permitir solo orígenes autorizados;
- no permitir operaciones bancarias desde dominio público WordPress;
- webhooks no dependen de CORS;
- callbackUrl debe estar validado por tenant config.
```

---

### 42.3. Headers recomendados

```http id="piq7q5"
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Cache-Control: no-store
```

---

## 43. Configuración segura

Variables recomendadas:

```text id="k2ptcw"
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

Reglas:

```text id="ymgu1e"
- sandbox por defecto;
- production requiere decisión explícita;
- no secretos en repositorio;
- no tokens reales en env para tests;
- no datos reales en seeds;
- payment initiation false;
- screen scraping false;
- external AI false;
```

---

## 44. Casos de abuso prioritarios

| Caso                                         |  Riesgo | Control                                 |
| -------------------------------------------- | ------: | --------------------------------------- |
| Conexión sin consentimiento                  | Crítico | ConsentPolicy + audit                   |
| Sync con consentimiento expirado             |    Alto | BankConsentExpiration                   |
| Token raw en DB                              | Crítico | SecretRef + tests                       |
| Credenciales bancarias almacenadas           | Crítico | NoBankCredentialStoragePolicy           |
| Cuenta externa vinculada a tenant incorrecto | Crítico | tenant validation                       |
| Movimiento duplicado                         |    Alto | externalTransactionIdHash + fingerprint |
| Duplicate enviado a conciliación             |    Alto | status policy                           |
| Movimiento crea Payment                      | Crítico | NoPaymentCreationPolicy                 |
| Snapshot modifica Account Statements         | Crítico | Statements isolation                    |
| Send-to-reconciliation crea Match            | Crítico | Reconciliation bridge policy            |
| Webhook falso dispara sync                   |    Alto | signature verification                  |
| Replay webhook duplica movimientos           |    Alto | replay + dedupe                         |
| Payload completo en logs                     |    Alto | log sanitizer                           |
| Número completo de cuenta expuesto           | Crítico | masked/hash only                        |
| WordPress accede a datos bancarios           | Crítico | no public endpoints + CORS              |
| IA externa procesa datos reales              | Crítico | feature flag + policy                   |

---

## 45. Pruebas de seguridad obligatorias

### 45.1. Multitenancy

```text id="hos55n"
tenant A no ve TenantOpenBankingConfig tenant B
tenant A no ve BankConsent tenant B
tenant A no ve BankConnection tenant B
tenant A no ve BankAccountLink tenant B
tenant A no ve OpenBankingSyncRun tenant B
tenant A no ve OpenBankingAccountSnapshot tenant B
tenant A no ve OpenBankingTransaction tenant B
tenant A no ve OpenBankingWebhookEvent tenant B
tenant A no vincula BankAccount tenant B
tenant A no vincula BankTransaction tenant B
tenant A no exporta reporte con datos tenant B
```

---

### 45.2. Secretos y tokens

```text id="c6rkce"
no raw access token en DB
no raw refresh token en DB
no raw client secret en DB
no raw webhook secret en DB
no token en DTO
no token en logs
no token en audit
no token en exports
no SecretRefs en superficies no autorizadas
```

---

### 45.3. Credenciales bancarias

```text id="dl1nte"
no bank username en DB
no bank password en DB
no OTP en DB
no MFA secret en DB
no security questions en DB
no bank session cookies en DB
payload con credenciales bancarias se rechaza
```

---

### 45.4. Datos bancarios

```text id="mw79tz"
no full account number en DB
no full account number en DTO
no full account number en logs
no full account number en audit
accountNumberMasked permitido
accountNumberHash no expuesto en DTO estándar
externalAccountIdHash no expuesto en DTO estándar
fingerprint no expuesto en DTO estándar
```

---

### 45.5. Integridad financiera

```text id="as73jw"
sync no crea Payment
webhook no crea Payment
send-to-reconciliation no crea Payment
balance snapshot no modifica Account Statements
transaction sync no modifica Account Statements
send-to-reconciliation no crea ReconciliationMatch
send-to-reconciliation no marca BankTransaction matched
duplicate no se envía a conciliación
```

---

### 45.6. Webhooks

```text id="ci1qxv"
webhook sin firma se rechaza si firma requerida
webhook con firma inválida se rechaza
webhook con timestamp expirado se rechaza
webhook duplicado no duplica sync
webhook duplicado no duplica movimientos
webhook unresolved tenant no produce efectos
payload oversized se rechaza
raw payload no se persiste
raw signature no se persiste
```

---

### 45.7. Endpoints públicos

```text id="jmbq1p"
rutas /public/open-banking retornan 404
rutas /me/open-banking retornan 404 en MVP
OpenAPI no documenta endpoints públicos administrativos
WordPress no accede a datos bancarios
```

---

## 46. CI/CD security gates

El pipeline debe fallar si:

```text id="urrp5y"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan value object tests;
- fallan entity tests;
- fallan repository tests;
- fallan service tests;
- fallan adapter tests;
- fallan secret tests;
- fallan consent tests;
- fallan connection tests;
- fallan sync tests;
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

## 47. Checklist de seguridad para PR

Cada PR debe validar:

```text id="vj3fox"
[ ] ¿Toda consulta tenant-scoped filtra por tenantId?
[ ] ¿Se evita findUnique por id simple?
[ ] ¿Se rechaza tenantId desde body?
[ ] ¿Se rechazan actor fields desde body?
[ ] ¿Se evita paymentInitiation en MVP?
[ ] ¿Se evita screen scraping?
[ ] ¿Se evita credenciales bancarias?
[ ] ¿Se usan SecretRefs?
[ ] ¿No se persisten tokens raw?
[ ] ¿No se expone tokenSecretRef?
[ ] ¿No se expone refreshTokenSecretRef?
[ ] ¿No se expone número completo de cuenta?
[ ] ¿Se usa accountNumberMasked?
[ ] ¿Se protege accountNumberHash?
[ ] ¿Se protege externalAccountIdHash?
[ ] ¿Se protege fingerprint?
[ ] ¿Se valida consentimiento vigente?
[ ] ¿Se valida connection active antes de sync?
[ ] ¿Se deduplican movimientos?
[ ] ¿Se impide duplicate conciliable?
[ ] ¿Se valida webhook signature?
[ ] ¿Se valida replay protection?
[ ] ¿Se evita raw payload en logs?
[ ] ¿Se evita raw signature en logs?
[ ] ¿Se evita authorizationUrl en logs?
[ ] ¿Open Banking no crea Payment?
[ ] ¿Open Banking no modifica Account Statements?
[ ] ¿send-to-reconciliation no crea Match?
[ ] ¿Bank Reconciliation conserva autoridad final?
[ ] ¿No hay endpoints públicos administrativos?
[ ] ¿No hay /me Open Banking en MVP?
[ ] ¿WordPress no accede a datos bancarios?
[ ] ¿IA externa sigue desactivada?
[ ] ¿Auditoría está sanitizada?
[ ] ¿Logs están sanitizados?
[ ] ¿Tests críticos pasan?
```

---

## 48. Definition of Done de seguridad

El módulo cumple seguridad cuando:

```text id="ka16n2"
- todas las tablas operativas tienen tenant_id;
- open_banking_provider_definitions queda platform-scoped;
- todas las consultas tenant-scoped filtran por tenantId;
- no se acepta tenantId desde body;
- no se aceptan actor fields desde body;
- no se usa findUnique por id simple en entidades tenant-scoped;
- no se almacena usuario bancario;
- no se almacena contraseña bancaria;
- no se almacena OTP;
- no se almacena MFA secret;
- no se almacenan tokens raw;
- SecretRef strategy funciona;
- SecretRefs no se exponen en superficies no autorizadas;
- no se expone número completo de cuenta;
- accountNumberMasked se usa correctamente;
- accountNumberHash no se expone;
- external IDs/hash se protegen;
- consentimiento explícito funciona;
- consentimiento expirado bloquea sync;
- conexión revoked/disabled bloquea sync;
- sync es idempotente;
- deduplicación funciona;
- webhooks se verifican;
- replay protection funciona;
- raw payload no se persiste;
- raw signature no se persiste;
- Open Banking no crea Payment;
- Open Banking no crea PaymentAllocation;
- Open Banking no modifica Account Statements;
- send-to-reconciliation no crea ReconciliationMatch;
- Bank Reconciliation conserva autoridad final;
- reportes son tenant-scoped;
- exports usan Secure Document Storage si se persisten;
- no hay endpoints públicos administrativos;
- no hay /me Open Banking en MVP;
- WordPress no accede a datos bancarios;
- IA externa no procesa datos reales;
- logs son seguros;
- audit es sanitizada;
- métricas son seguras;
- CI pasa.
```

---

## 49. No aceptación

La implementación no debe aceptarse si:

```text id="c571ju"
- permite config cross-tenant;
- permite consent cross-tenant;
- permite connection cross-tenant;
- permite account link cross-tenant;
- permite sync run cross-tenant;
- permite snapshot cross-tenant;
- permite transaction cross-tenant;
- permite webhook event cross-tenant;
- vincula BankAccount tenant B con account link tenant A;
- vincula BankTransaction tenant B con transaction tenant A;
- acepta tenantId desde body;
- busca entidades tenant-scoped solo por id;
- almacena bank username;
- almacena bank password;
- almacena OTP;
- almacena MFA secret;
- almacena raw access token;
- almacena raw refresh token;
- expone SecretRefs en DTO no autorizado;
- expone número completo de cuenta;
- expone accountNumberHash;
- expone raw provider payload;
- expone raw webhook signature;
- loggea authorizationUrl;
- permite payment initiation en MVP;
- permite screen scraping en MVP;
- permite sync sin consentimiento vigente;
- permite sync con connection revoked;
- permite sync con connection disabled;
- duplica movimientos por retry;
- permite duplicate como conciliable;
- crea Payment desde Open Banking;
- crea PaymentAllocation desde Open Banking;
- modifica Account Statements desde Open Banking;
- crea ReconciliationMatch automáticamente;
- marca conciliación bancaria final automáticamente;
- marca ProviderSettlementRecord como reconciled automáticamente;
- crea endpoint público administrativo;
- documenta endpoint público administrativo en OpenAPI;
- crea /me Open Banking en MVP;
- permite acceso bancario desde WordPress;
- envía datos bancarios reales a IA externa;
- omite auditoría financiera crítica;
- logs contienen tokens, payloads completos o número completo de cuenta.
```

---

## 50. Resultado esperado

Al aplicar estas notas, `019-open-banking-integration` quedará protegido como módulo financiero read-only de alta sensibilidad.

Debe garantizar:

```text id="wjirij"
tenant isolation
provider-agnostic security
consent-driven access
explicit BankConsent
BankConnection governance
SecretRef strategy
no bank credential storage
no raw token storage
no screen scraping
read-only MVP
no payment initiation
external account protection
accountNumberMasked strategy
accountNumberHash protection
externalAccountIdHash protection
sync idempotency
transaction normalization
transaction fingerprint
transaction deduplication
duplicate not reconcilable
webhook signature validation
webhook replay protection
no raw payload storage
no raw signature storage
Bank Reconciliation as final authority
no Payment auto-creation
no PaymentAllocation auto-creation
no Account Statements mutation
no automatic ReconciliationMatch
no automatic final reconciliation
safe reports
safe exports
Secure Document Storage integration
safe audit
safe logs
safe metrics
safe OpenAPI
no public administrative endpoints
no /me Open Banking in MVP
no WordPress bank access
no external AI with real bank data
```

---

## 51. Expediente actualizado

```text id="do7xoq"
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
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 52. Cierre del paquete documental

Con este documento queda cerrado el paquete documental de:

```text id="n9tm6q"
docs/specs/019-open-banking-integration/
```

Archivos completados:

```text id="y61qda"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

El módulo queda listo para pasar a implementación o para iniciar la siguiente especificación funcional del roadmap.
