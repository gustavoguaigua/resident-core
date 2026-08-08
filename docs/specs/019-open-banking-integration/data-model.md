# Data Model — Spec 019 Open Banking Integration

## 1. Información del documento

| Campo                  | Valor                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                                                                         |
| Spec ID                | 019                                                                                                                                                                   |
| Módulo                 | Open Banking Integration                                                                                                                                              |
| Documento              | Data Model                                                                                                                                                            |
| Ruta                   | `docs/specs/019-open-banking-integration/data-model.md`                                                                                                               |
| Versión                | 0.1                                                                                                                                                                   |
| Estado                 | Borrador inicial                                                                                                                                                      |
| Fecha                  | 2026-07-23                                                                                                                                                            |
| Documento base         | `docs/specs/019-open-banking-integration/spec.md`                                                                                                                     |
| Plan técnico           | `docs/specs/019-open-banking-integration/plan.md`                                                                                                                     |
| Base de datos          | PostgreSQL                                                                                                                                                            |
| ORM                    | Prisma                                                                                                                                                                |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                                                                                           |
| Naturaleza             | Tenant-scoped / Consent-driven / Bank-connection-aware / Provider-agnostic / Sync-driven / Transaction-import-aware / Reconciliation-ready / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `019-open-banking-integration`.

El objetivo es establecer las tablas, relaciones, enums, constraints, índices, reglas de persistencia, reglas de multitenancy, reglas de seguridad y lineamientos de migración necesarios para integrar RESIDENT Core con proveedores de Open Banking o agregadores bancarios de forma segura y extensible.

Regla central:

```text id="zj10fd"
Todo proveedor, configuración, consentimiento, conexión bancaria, vínculo de cuenta, ejecución de sincronización, snapshot, movimiento y webhook de Open Banking debe preservar tenant isolation, consentimiento explícito, read-only MVP, protección de secretos, no almacenamiento de credenciales bancarias, deduplicación, trazabilidad hacia Bank Reconciliation y auditoría completa.
```

---

## 3. Decisión principal del modelo

El módulo incorporará nueve tablas principales:

```text id="xv6cu5"
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

## 4. Clasificación de tablas

### 4.1. Tabla platform-scoped

```text id="wrwtqm"
open_banking_provider_definitions
```

Esta tabla define proveedores soportados por la plataforma RESIDENT.

No pertenece a un tenant específico.

---

### 4.2. Tablas tenant-scoped

```text id="apd7em"
tenant_open_banking_configs
bank_consents
bank_connections
bank_account_links
open_banking_sync_runs
open_banking_account_snapshots
open_banking_transactions
open_banking_webhook_events
```

Todas deben incluir:

```text id="xf1hwa"
tenant_id
```

---

## 5. Tablas externas relacionadas

El modelo se relaciona con tablas existentes de RESIDENT Core:

```text id="gtdulj"
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

## 6. Principios de modelado

### 6.1. Tenant isolation obligatorio

Toda tabla operativa debe tener `tenant_id`.

Toda consulta debe filtrar por `tenant_id`.

Patrón requerido:

```typescript id="yob8td"
await prisma.bankConnection.findFirst({
  where: {
    id: connectionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="cgy3hz"
await prisma.bankConnection.findUnique({
  where: { id: connectionId }
});
```

---

### 6.2. Consentimiento como entidad explícita

El consentimiento no debe quedar implícito en la conexión bancaria.

Debe existir una entidad separada:

```text id="t0gbbu"
BankConsent
```

Esto permite auditar:

```text id="nfior3"
- quién autorizó;
- cuándo autorizó;
- qué scopes concedió;
- cuándo expira;
- cuándo se revoca;
- qué proveedor emitió el consentimiento;
- qué conexión depende del consentimiento.
```

---

### 6.3. Conexión bancaria separada del consentimiento

Una `BankConnection` representa la conexión técnica con el proveedor.

Una `BankConsent` representa la autorización funcional/legal.

Relación:

```text id="grxkkq"
BankConsent 1 ── N BankConnection
```

En MVP usualmente será:

```text id="jtd558"
BankConsent 1 ── 1 BankConnection
```

Pero se deja abierto para escenarios futuros.

---

### 6.4. Cuenta externa separada de cuenta interna

La cuenta reportada por el proveedor no debe asumirse automáticamente como `BankAccount` interno.

Se modela con:

```text id="ld4mls"
BankAccountLink
```

Esto permite:

```text id="m0tbrf"
- descubrir cuentas externas;
- mantener estado pendingLink;
- vincular manualmente con bank_accounts;
- evitar errores por cuentas mal mapeadas;
- conservar trazabilidad de desvinculación.
```

---

### 6.5. Open Banking no crea Payments

El modelo no debe permitir que un movimiento Open Banking cree un `Payment` directamente.

Regla:

```text id="y2xkwu"
OpenBankingTransaction puede alimentar Bank Reconciliation, pero no crea Payment ni actualiza Account Statements directamente.
```

---

### 6.6. Open Banking alimenta Bank Reconciliation

`OpenBankingTransaction` puede vincularse con:

```text id="vb404k"
bank_transactions.id
```

Pero esa vinculación no implica conciliación final.

---

### 6.7. SecretRef obligatorio

Los tokens y credenciales deben guardarse como referencias.

Permitido:

```text id="pakye9"
credential_secret_ref
webhook_secret_ref
token_secret_ref
refresh_token_secret_ref
```

Prohibido:

```text id="wbfir2"
usuario bancario
contraseña bancaria
OTP
MFA secret
raw access token
raw refresh token
raw client secret
raw webhook secret
```

---

### 6.8. Idempotencia y deduplicación

El modelo debe impedir duplicados por:

```text id="nis8eu"
provider_event_id
external_transaction_id
fingerprint
sync_run_id
provider_key
tenant_id
bank_connection_id
bank_account_link_id
```

---

## 7. Entidades del modelo

---

# 8. Entidad `OpenBankingProviderDefinition`

## 8.1. Propósito

Representa un proveedor Open Banking soportado por la plataforma RESIDENT.

Es administrado por `PlatformAdmin`.

No contiene credenciales tenant ni tokens.

---

## 8.2. Tabla

```text id="d191ac"
open_banking_provider_definitions
```

---

## 8.3. Campos

| Campo                     |            Tipo | Requerido | Descripción                    |
| ------------------------- | --------------: | --------: | ------------------------------ |
| id                        |            UUID |        Sí | Identificador interno          |
| providerKey               |          String |        Sí | Clave estable del proveedor    |
| displayName               |          String |        Sí | Nombre visible                 |
| description               |          String |        No | Descripción del proveedor      |
| status                    |            Enum |        Sí | Estado de la definición        |
| supportedEnvironments     | String[] / Json |        Sí | Ambientes soportados           |
| supportedCapabilities     | String[] / Json |        Sí | Capacidades soportadas         |
| supportedCountries        | String[] / Json |        No | Países soportados              |
| supportedCurrencies       | String[] / Json |        Sí | Monedas soportadas             |
| supportsAccountInfo       |         Boolean |        Sí | Soporta lectura de cuentas     |
| supportsBalances          |         Boolean |        Sí | Soporta lectura de saldos      |
| supportsTransactions      |         Boolean |        Sí | Soporta lectura de movimientos |
| supportsWebhooks          |         Boolean |        Sí | Soporta webhooks               |
| supportsConsentRenewal    |         Boolean |        Sí | Soporta renovación             |
| supportsPaymentInitiation |         Boolean |        Sí | Soporta iniciación de pagos    |
| createdBy                 |            UUID |        No | Actor creador                  |
| updatedBy                 |            UUID |        No | Actor que actualizó            |
| activatedBy               |            UUID |        No | Actor que activó               |
| deprecatedBy              |            UUID |        No | Actor que deprecó              |
| archivedBy                |            UUID |        No | Actor que archivó              |
| createdAt                 |        DateTime |        Sí | Fecha de creación              |
| updatedAt                 |        DateTime |        Sí | Fecha de actualización         |
| activatedAt               |        DateTime |        No | Fecha de activación            |
| deprecatedAt              |        DateTime |        No | Fecha de deprecación           |
| archivedAt                |        DateTime |        No | Fecha de archivo               |
| archiveReason             |          String |        No | Razón de archivo               |
| metadata                  |            Json |        No | Metadata no sensible           |

---

## 8.4. Reglas

```text id="a36caf"
- providerKey debe ser único.
- providerKey no debe cambiar una vez usado.
- status inicial recomendado: draft.
- supportsPaymentInitiation debe quedar false en MVP.
- metadata no debe contener secretos.
- no debe contener credentialSecretRef tenant.
- no debe contener webhookSecretRef tenant.
```

---

# 9. Entidad `TenantOpenBankingConfig`

## 9.1. Propósito

Representa la configuración Open Banking de un proveedor para un tenant.

---

## 9.2. Tabla

```text id="dh35qw"
tenant_open_banking_configs
```

---

## 9.3. Campos

| Campo                |            Tipo | Requerido | Descripción                  |
| -------------------- | --------------: | --------: | ---------------------------- |
| id                   |            UUID |        Sí | Identificador                |
| tenantId             |            UUID |        Sí | Tenant propietario           |
| providerDefinitionId |            UUID |        Sí | Proveedor platform           |
| providerKey          |          String |        Sí | Provider key desnormalizado  |
| environment          |            Enum |        Sí | sandbox / production         |
| status               |            Enum |        Sí | Estado de configuración      |
| displayName          |          String |        No | Nombre visible tenant        |
| credentialSecretRef  |          String |        No | Referencia a credenciales    |
| webhookSecretRef     |          String |        No | Referencia a secreto webhook |
| publicConfig         |            Json |        No | Config pública no sensible   |
| callbackUrl          |          String |        No | Callback configurado         |
| webhookEndpointPath  |          String |        No | Path webhook                 |
| allowedOrigins       | String[] / Json |        No | Orígenes permitidos          |
| createdBy            |            UUID |        No | Actor creador                |
| updatedBy            |            UUID |        No | Actor actualizador           |
| enabledBy            |            UUID |        No | Actor habilitador            |
| disabledBy           |            UUID |        No | Actor deshabilitador         |
| testedBy             |            UUID |        No | Actor testConnection         |
| invalidatedBy        |            UUID |        No | Actor invalidación           |
| archivedBy           |            UUID |        No | Actor archivo                |
| createdAt            |        DateTime |        Sí | Fecha creación               |
| updatedAt            |        DateTime |        Sí | Fecha actualización          |
| enabledAt            |        DateTime |        No | Fecha habilitación           |
| disabledAt           |        DateTime |        No | Fecha deshabilitación        |
| testedAt             |        DateTime |        No | Fecha testConnection         |
| invalidatedAt        |        DateTime |        No | Fecha invalidación           |
| archivedAt           |        DateTime |        No | Fecha archivo                |
| disableReason        |          String |        No | Razón deshabilitación        |
| invalidReason        |          String |        No | Razón invalidación           |
| archiveReason        |          String |        No | Razón archivo                |
| metadata             |            Json |        No | Metadata segura              |

---

## 9.4. Reglas

```text id="bd0mrw"
- tenantId obligatorio.
- providerDefinition debe existir.
- providerDefinition debe estar active para habilitar config.
- enabled requiere credenciales mínimas si el provider las exige.
- webhookSecretRef requerido si supportsWebhooks=true y firma requerida.
- no guardar secretos reales.
- no guardar tokens raw.
- no aceptar tenantId desde body.
- una config enabled por tenant/provider/environment si así se define por índice parcial.
```

---

# 10. Entidad `BankConsent`

## 10.1. Propósito

Representa consentimiento explícito para acceder a información bancaria.

---

## 10.2. Tabla

```text id="z1tkrg"
bank_consents
```

---

## 10.3. Campos

| Campo                     |            Tipo | Requerido | Descripción                         |
| ------------------------- | --------------: | --------: | ----------------------------------- |
| id                        |            UUID |        Sí | Identificador                       |
| tenantId                  |            UUID |        Sí | Tenant propietario                  |
| tenantOpenBankingConfigId |            UUID |        Sí | Config tenant                       |
| providerKey               |          String |        Sí | Provider key                        |
| providerConsentId         |          String |        No | ID de consentimiento externo        |
| status                    |            Enum |        Sí | Estado del consentimiento           |
| scope                     | String[] / Json |        Sí | Scopes autorizados                  |
| consentType               |          String |        No | Tipo de consentimiento              |
| authorizationUrlHash      |          String |        No | Hash de URL temporal                |
| authorizationMethod       |          String |        No | redirect, embedded, manual, webhook |
| termsAcceptedVersion      |          String |        No | Versión de términos aceptados       |
| authorizedBy              |            UUID |        No | Usuario que autorizó                |
| authorizedAt              |        DateTime |        No | Fecha de autorización               |
| expiresAt                 |        DateTime |        No | Fecha de expiración                 |
| renewedAt                 |        DateTime |        No | Fecha renovación                    |
| renewedBy                 |            UUID |        No | Usuario que renovó                  |
| revokedAt                 |        DateTime |        No | Fecha revocación                    |
| revokedBy                 |            UUID |        No | Usuario que revocó                  |
| revocationReason          |          String |        No | Razón de revocación                 |
| failedAt                  |        DateTime |        No | Fecha de fallo                      |
| failureReason             |          String |        No | Razón sanitizada                    |
| archivedAt                |        DateTime |        No | Fecha archivo                       |
| archivedBy                |            UUID |        No | Usuario que archivó                 |
| archiveReason             |          String |        No | Razón archivo                       |
| createdAt                 |        DateTime |        Sí | Fecha creación                      |
| updatedAt                 |        DateTime |        Sí | Fecha actualización                 |
| metadata                  |            Json |        No | Metadata segura                     |

---

## 10.4. Reglas

```text id="lv2kav"
- status inicial draft.
- pendingAuthorization no permite sync.
- authorized permite crear BankConnection.
- expired no permite sync.
- revoked bloquea syncs futuros.
- scope MVP: accountsRead, balancesRead, transactionsRead.
- paymentsInitiate debe quedar deshabilitado en MVP.
- authorizationUrl no debe persistirse completa; usar hash si se requiere trazabilidad.
```

---

# 11. Entidad `BankConnection`

## 11.1. Propósito

Representa la conexión bancaria técnica autorizada entre tenant y proveedor.

---

## 11.2. Tabla

```text id="v4a9v3"
bank_connections
```

---

## 11.3. Campos

| Campo                     |     Tipo | Requerido | Descripción              |
| ------------------------- | -------: | --------: | ------------------------ |
| id                        |     UUID |        Sí | Identificador            |
| tenantId                  |     UUID |        Sí | Tenant propietario       |
| tenantOpenBankingConfigId |     UUID |        Sí | Config tenant            |
| bankConsentId             |     UUID |        Sí | Consentimiento asociado  |
| providerKey               |   String |        Sí | Provider key             |
| providerConnectionId      |   String |        No | ID externo de conexión   |
| status                    |     Enum |        Sí | Estado                   |
| connectionName            |   String |        No | Nombre visible           |
| institutionName           |   String |        No | Nombre banco/institución |
| institutionCode           |   String |        No | Código institución       |
| country                   |   String |        No | País                     |
| currency                  |     Enum |        Sí | Moneda principal         |
| tokenSecretRef            |   String |        No | SecretRef token          |
| refreshTokenSecretRef     |   String |        No | SecretRef refresh        |
| lastSuccessfulSyncAt      | DateTime |        No | Último sync exitoso      |
| lastFailedSyncAt          | DateTime |        No | Último sync fallido      |
| failureReason             |   String |        No | Motivo sanitizado        |
| authorizedBy              |     UUID |        No | Usuario autorizador      |
| authorizedAt              | DateTime |        No | Fecha autorización       |
| revokedBy                 |     UUID |        No | Usuario revocador        |
| revokedAt                 | DateTime |        No | Fecha revocación         |
| revocationReason          |   String |        No | Razón revocación         |
| disabledBy                |     UUID |        No | Usuario que deshabilitó  |
| disabledAt                | DateTime |        No | Fecha deshabilitación    |
| disableReason             |   String |        No | Razón deshabilitación    |
| archivedBy                |     UUID |        No | Usuario que archivó      |
| archivedAt                | DateTime |        No | Fecha archivo            |
| archiveReason             |   String |        No | Razón archivo            |
| createdAt                 | DateTime |        Sí | Fecha creación           |
| updatedAt                 | DateTime |        Sí | Fecha actualización      |
| metadata                  |     Json |        No | Metadata segura          |

---

## 11.4. Reglas

```text id="rtwmpb"
- active requiere BankConsent authorized vigente.
- revoked no permite sync.
- disabled no permite sync.
- reauthorizationRequired no permite sync hasta renovar consentimiento/token.
- tokenSecretRef y refreshTokenSecretRef nunca se exponen por API.
- no almacenar token raw.
- providerConnectionId debe ser único por tenant/provider si existe.
```

---

# 12. Entidad `BankAccountLink`

## 12.1. Propósito

Representa el vínculo entre una cuenta bancaria externa reportada por Open Banking y una `BankAccount` interna de `017-bank-reconciliation`.

---

## 12.2. Tabla

```text id="x64vph"
bank_account_links
```

---

## 12.3. Campos

| Campo                 |     Tipo | Requerido | Descripción              |
| --------------------- | -------: | --------: | ------------------------ |
| id                    |     UUID |        Sí | Identificador            |
| tenantId              |     UUID |        Sí | Tenant propietario       |
| bankConnectionId      |     UUID |        Sí | Conexión bancaria        |
| bankAccountId         |     UUID |        No | Cuenta interna vinculada |
| providerKey           |   String |        Sí | Provider key             |
| externalAccountId     |   String |        Sí | ID cuenta externa        |
| externalAccountIdHash |   String |        Sí | Hash del ID externo      |
| externalAccountName   |   String |        No | Nombre cuenta externa    |
| externalAccountType   |   String |        No | Tipo cuenta externa      |
| accountNumberMasked   |   String |        No | Número enmascarado       |
| accountNumberHash     |   String |        No | Hash número cuenta       |
| currency              |     Enum |        Sí | Moneda                   |
| status                |     Enum |        Sí | Estado                   |
| linkedBy              |     UUID |        No | Usuario que vinculó      |
| linkedAt              | DateTime |        No | Fecha vinculación        |
| unlinkedBy            |     UUID |        No | Usuario que desvinculó   |
| unlinkedAt            | DateTime |        No | Fecha desvinculación     |
| unlinkReason          |   String |        No | Razón desvinculación     |
| disabledBy            |     UUID |        No | Usuario que deshabilitó  |
| disabledAt            | DateTime |        No | Fecha deshabilitación    |
| disableReason         |   String |        No | Razón deshabilitación    |
| archivedBy            |     UUID |        No | Usuario que archivó      |
| archivedAt            | DateTime |        No | Fecha archivo            |
| archiveReason         |   String |        No | Razón archivo            |
| createdAt             | DateTime |        Sí | Fecha creación           |
| updatedAt             | DateTime |        Sí | Fecha actualización      |
| metadata              |     Json |        No | Metadata segura          |

---

## 12.4. Reglas

```text id="eemtlh"
- externalAccountId debe ser único por tenant/provider/bankConnection.
- externalAccountIdHash se puede usar para auditoría y lookup seguro.
- bankAccountId es opcional mientras status=pendingLink.
- linked requiere bankAccountId tenant-scoped.
- no exponer número completo de cuenta.
- accountNumberHash no debe exponerse en DTO público.
- unlinked no elimina historial.
```

---

# 13. Entidad `OpenBankingSyncRun`

## 13.1. Propósito

Representa una ejecución de sincronización de cuentas, saldos, movimientos o sync full.

---

## 13.2. Tabla

```text id="dl4n0t"
open_banking_sync_runs
```

---

## 13.3. Campos

| Campo                  |     Tipo | Requerido | Descripción                            |
| ---------------------- | -------: | --------: | -------------------------------------- |
| id                     |     UUID |        Sí | Identificador                          |
| tenantId               |     UUID |        Sí | Tenant propietario                     |
| bankConnectionId       |     UUID |        Sí | Conexión                               |
| bankAccountLinkId      |     UUID |        No | Cuenta específica                      |
| providerKey            |   String |        Sí | Provider key                           |
| syncType               |     Enum |        Sí | accounts, balances, transactions, full |
| status                 |     Enum |        Sí | Estado                                 |
| triggerType            |     Enum |        Sí | manual, scheduled, webhook, system     |
| periodStart            | DateTime |        No | Inicio periodo movimientos             |
| periodEnd              | DateTime |        No | Fin periodo movimientos                |
| syncCursor             |   String |        No | Cursor técnico                         |
| startedBy              |     UUID |        No | Actor o null si system/webhook         |
| startedAt              | DateTime |        No | Inicio                                 |
| completedAt            | DateTime |        No | Fin exitoso                            |
| failedAt               | DateTime |        No | Fin fallido                            |
| cancelledAt            | DateTime |        No | Fecha cancelación                      |
| cancelledBy            |     UUID |        No | Actor cancelación                      |
| retryOfSyncRunId       |     UUID |        No | Sync original                          |
| retryCount             |      Int |        Sí | Número de reintentos                   |
| accountsFound          |      Int |        Sí | Cuentas encontradas                    |
| balancesFound          |      Int |        Sí | Saldos encontrados                     |
| transactionsFound      |      Int |        Sí | Movimientos encontrados                |
| transactionsImported   |      Int |        Sí | Movimientos importados                 |
| transactionsDuplicated |      Int |        Sí | Duplicados                             |
| transactionsRejected   |      Int |        Sí | Rechazados                             |
| warningsCount          |      Int |        Sí | Advertencias                           |
| errorCode              |   String |        No | Código error                           |
| errorMessage           |   String |        No | Mensaje sanitizado                     |
| archivedAt             | DateTime |        No | Fecha archivo                          |
| archivedBy             |     UUID |        No | Actor archivo                          |
| archiveReason          |   String |        No | Razón archivo                          |
| createdAt              | DateTime |        Sí | Fecha creación                         |
| updatedAt              | DateTime |        Sí | Fecha actualización                    |
| metadata               |     Json |        No | Metadata segura                        |

---

## 13.4. Reglas

```text id="c8p3zm"
- sync debe validar BankConnection active.
- sync debe validar BankConsent authorized vigente.
- sync de transactions debe tener periodStart y periodEnd.
- failed debe tener errorCode y errorMessage sanitizados.
- completed debe registrar completedAt y conteos.
- retry debe referenciar syncRun original.
- syncCursor no debe contener tokens.
```

---

# 14. Entidad `OpenBankingAccountSnapshot`

## 14.1. Propósito

Representa un snapshot de saldo de una cuenta externa en un momento específico.

---

## 14.2. Tabla

```text id="kw844w"
open_banking_account_snapshots
```

---

## 14.3. Campos

| Campo                 |     Tipo | Requerido | Descripción              |
| --------------------- | -------: | --------: | ------------------------ |
| id                    |     UUID |        Sí | Identificador            |
| tenantId              |     UUID |        Sí | Tenant propietario       |
| bankConnectionId      |     UUID |        Sí | Conexión                 |
| bankAccountLinkId     |     UUID |        Sí | Cuenta externa           |
| bankAccountId         |     UUID |        No | Cuenta interna vinculada |
| syncRunId             |     UUID |        Sí | Sync que generó snapshot |
| providerKey           |   String |        Sí | Provider key             |
| externalAccountId     |   String |        Sí | ID cuenta externa        |
| externalAccountIdHash |   String |        Sí | Hash seguro              |
| availableBalance      |  Decimal |        No | Saldo disponible         |
| currentBalance        |  Decimal |        No | Saldo actual             |
| currency              |     Enum |        Sí | Moneda                   |
| snapshotAt            | DateTime |        Sí | Momento del snapshot     |
| createdAt             | DateTime |        Sí | Fecha creación           |
| metadata              |     Json |        No | Metadata segura          |

---

## 14.4. Reglas

```text id="c6akcu"
- snapshot no modifica Account Statements.
- snapshot no reemplaza saldo interno financiero.
- snapshot es evidencia bancaria externa.
- snapshot debe ser tenant-scoped.
- externalAccountId no debe exponerse innecesariamente.
```

---

# 15. Entidad `OpenBankingTransaction`

## 15.1. Propósito

Representa un movimiento bancario obtenido desde proveedor Open Banking.

Puede ser enviado a `017-bank-reconciliation`.

---

## 15.2. Tabla

```text id="xp53nv"
open_banking_transactions
```

---

## 15.3. Campos

| Campo                     |     Tipo | Requerido | Descripción                      |
| ------------------------- | -------: | --------: | -------------------------------- |
| id                        |     UUID |        Sí | Identificador                    |
| tenantId                  |     UUID |        Sí | Tenant propietario               |
| bankConnectionId          |     UUID |        Sí | Conexión                         |
| bankAccountLinkId         |     UUID |        Sí | Cuenta externa                   |
| bankAccountId             |     UUID |        No | Cuenta interna                   |
| syncRunId                 |     UUID |        Sí | Sync que importó                 |
| providerKey               |   String |        Sí | Provider key                     |
| externalTransactionId     |   String |        No | ID movimiento externo            |
| externalTransactionIdHash |   String |        No | Hash ID externo                  |
| transactionDate           | DateTime |        Sí | Fecha transacción                |
| postedDate                | DateTime |        No | Fecha contabilización            |
| description               |   String |        No | Descripción original sanitizada  |
| normalizedDescription     |   String |        No | Descripción normalizada          |
| reference                 |   String |        No | Referencia original sanitizada   |
| normalizedReference       |   String |        No | Referencia normalizada           |
| bankReference             |   String |        No | Referencia bancaria              |
| normalizedBankReference   |   String |        No | Referencia bancaria normalizada  |
| direction                 |     Enum |        Sí | credit/debit/neutral             |
| amount                    |  Decimal |        Sí | Monto positivo                   |
| currency                  |     Enum |        Sí | Moneda                           |
| balanceAfter              |  Decimal |        No | Saldo posterior                  |
| transactionType           |     Enum |        Sí | Tipo clasificado                 |
| status                    |     Enum |        Sí | Estado del movimiento            |
| fingerprint               |   String |        Sí | Fingerprint determinístico       |
| isDuplicate               |  Boolean |        Sí | Es duplicado                     |
| duplicateOfTransactionId  |     UUID |        No | Movimiento original              |
| sentToReconciliationAt    | DateTime |        No | Fecha envío a conciliación       |
| sentToReconciliationBy    |     UUID |        No | Actor                            |
| bankTransactionId         |     UUID |        No | BankTransaction creado/vinculado |
| rejectedAt                | DateTime |        No | Fecha rechazo                    |
| rejectedBy                |     UUID |        No | Actor rechazo                    |
| rejectReason              |   String |        No | Razón rechazo                    |
| ignoredAt                 | DateTime |        No | Fecha ignorado                   |
| ignoredBy                 |     UUID |        No | Actor ignorado                   |
| ignoreReason              |   String |        No | Razón ignorado                   |
| archivedAt                | DateTime |        No | Fecha archivo                    |
| archivedBy                |     UUID |        No | Actor archivo                    |
| archiveReason             |   String |        No | Razón archivo                    |
| createdAt                 | DateTime |        Sí | Fecha creación                   |
| updatedAt                 | DateTime |        Sí | Fecha actualización              |
| metadata                  |     Json |        No | Metadata segura                  |

---

## 15.4. Reglas

```text id="n7xerc"
- amount debe ser positivo.
- direction expresa si fue crédito/débito.
- currency MVP = USD.
- fingerprint obligatorio.
- mismo externalTransactionId no debe duplicar movimiento.
- mismo fingerprint no debe duplicar movimiento.
- duplicate no se envía a Bank Reconciliation.
- sentToReconciliation no significa conciliado.
- bankTransactionId debe pertenecer al mismo tenant.
- OpenBankingTransaction no crea Payment.
- OpenBankingTransaction no modifica Account Statements.
```

---

# 16. Entidad `OpenBankingWebhookEvent`

## 16.1. Propósito

Representa un webhook recibido desde proveedor Open Banking.

---

## 16.2. Tabla

```text id="ehsds8"
open_banking_webhook_events
```

---

## 16.3. Campos

| Campo                     |     Tipo | Requerido | Descripción                |
| ------------------------- | -------: | --------: | -------------------------- |
| id                        |     UUID |        Sí | Identificador              |
| tenantId                  |     UUID |        No | Tenant resuelto, si aplica |
| tenantOpenBankingConfigId |     UUID |        No | Config resuelta            |
| bankConnectionId          |     UUID |        No | Conexión relacionada       |
| providerKey               |   String |        Sí | Provider key               |
| providerEventId           |   String |        No | ID externo evento          |
| eventType                 |   String |        No | Tipo evento                |
| signatureStatus           |     Enum |        Sí | Estado firma               |
| processingStatus          |     Enum |        Sí | Estado procesamiento       |
| receivedAt                | DateTime |        Sí | Fecha recepción            |
| processedAt               | DateTime |        No | Fecha procesado            |
| rejectedAt                | DateTime |        No | Fecha rechazo              |
| failedAt                  | DateTime |        No | Fecha fallo                |
| payloadHash               |   String |        Sí | Hash raw body              |
| payloadHashPrefix         |   String |        Sí | Prefijo seguro             |
| payloadPreview            |     Json |        No | Preview sanitizado         |
| signatureHeaderHash       |   String |        No | Hash firma                 |
| providerTimestamp         | DateTime |        No | Timestamp provider         |
| errorCode                 |   String |        No | Código error               |
| errorMessage              |   String |        No | Mensaje sanitizado         |
| retryCount                |      Int |        Sí | Reintentos                 |
| lastRetryAt               | DateTime |        No | Último reintento           |
| archivedAt                | DateTime |        No | Fecha archivo              |
| archivedBy                |     UUID |        No | Actor archivo              |
| archiveReason             |   String |        No | Razón archivo              |
| createdAt                 | DateTime |        Sí | Fecha creación             |
| updatedAt                 | DateTime |        Sí | Fecha actualización        |
| metadata                  |     Json |        No | Metadata segura            |

---

## 16.4. Reglas

```text id="wfm8z9"
- webhook debe preservar raw body solo en memoria para verificación.
- payloadHash se persiste; raw payload completo no.
- signatureHeaderHash se persiste; raw signature completa no.
- providerEventId debe ser idempotente si existe.
- duplicate no debe crear sync duplicado ni movimientos duplicados.
- tenantId puede ser null si evento no se pudo resolver de forma segura.
- eventos no resueltos no deben producir efectos financieros.
```

---

# 17. Enums del modelo

## 17.1. `OpenBankingProviderDefinitionStatus`

```text id="av74yw"
draft
active
inactive
deprecated
archived
```

---

## 17.2. `OpenBankingEnvironment`

```text id="ft0i58"
sandbox
production
```

---

## 17.3. `TenantOpenBankingConfigStatus`

```text id="e4keid"
draft
enabled
disabled
invalid
archived
```

---

## 17.4. `BankConsentStatus`

```text id="cst2f9"
draft
pendingAuthorization
authorized
expired
revoked
failed
archived
```

---

## 17.5. `BankConsentScope`

```text id="s2eogo"
accountsRead
balancesRead
transactionsRead
identityRead
paymentsInitiate
```

MVP activo:

```text id="umdcqp"
accountsRead
balancesRead
transactionsRead
```

MVP deshabilitado:

```text id="pokt9k"
paymentsInitiate
```

---

## 17.6. `BankConnectionStatus`

```text id="b8qse4"
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

## 17.7. `BankAccountLinkStatus`

```text id="rv9i18"
pendingLink
linked
unlinked
disabled
archived
```

---

## 17.8. `OpenBankingSyncType`

```text id="b756gf"
accounts
balances
transactions
full
```

---

## 17.9. `OpenBankingSyncStatus`

```text id="m3kag8"
queued
running
completed
completedWithWarnings
failed
cancelled
archived
```

---

## 17.10. `OpenBankingSyncTriggerType`

```text id="qqaq1n"
manual
scheduled
webhook
system
```

---

## 17.11. `OpenBankingTransactionStatus`

```text id="lej96x"
imported
duplicate
sentToReconciliation
rejected
ignored
requiresReview
archived
```

---

## 17.12. `OpenBankingTransactionDirection`

```text id="a2hus9"
credit
debit
neutral
```

---

## 17.13. `OpenBankingTransactionType`

```text id="bqigdc"
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

## 17.14. `OpenBankingWebhookSignatureStatus`

```text id="m5ogld"
notVerified
verified
invalid
missing
unsupported
```

---

## 17.15. `OpenBankingWebhookProcessingStatus`

```text id="jq5tey"
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

## 17.16. `OpenBankingHashAlgorithm`

```text id="tfmqrc"
SHA-256
```

---

## 18. Prisma schema preliminar

> Nota: este esquema es preliminar. Debe ajustarse a las convenciones exactas del repositorio RESIDENT Core, nombres existentes de modelos, enums globales, relaciones ya creadas y estructura real de `Tenant`, `UserProfile`, `BankAccount`, `BankTransaction`, `Payment`, `SecureDocument` y `AuditLog`.

```prisma id="ptcm9a"
enum OpenBankingProviderDefinitionStatus {
  DRAFT       @map("draft")
  ACTIVE      @map("active")
  INACTIVE    @map("inactive")
  DEPRECATED  @map("deprecated")
  ARCHIVED    @map("archived")

  @@map("open_banking_provider_definition_status")
}

enum OpenBankingEnvironment {
  SANDBOX     @map("sandbox")
  PRODUCTION  @map("production")

  @@map("open_banking_environment")
}

enum TenantOpenBankingConfigStatus {
  DRAFT     @map("draft")
  ENABLED   @map("enabled")
  DISABLED  @map("disabled")
  INVALID   @map("invalid")
  ARCHIVED  @map("archived")

  @@map("tenant_open_banking_config_status")
}

enum BankConsentStatus {
  DRAFT                  @map("draft")
  PENDING_AUTHORIZATION  @map("pendingAuthorization")
  AUTHORIZED             @map("authorized")
  EXPIRED                @map("expired")
  REVOKED                @map("revoked")
  FAILED                 @map("failed")
  ARCHIVED               @map("archived")

  @@map("bank_consent_status")
}

enum BankConnectionStatus {
  PENDING_AUTHORIZATION     @map("pendingAuthorization")
  ACTIVE                    @map("active")
  SYNCING                   @map("syncing")
  REAUTHORIZATION_REQUIRED  @map("reauthorizationRequired")
  FAILED                    @map("failed")
  REVOKED                   @map("revoked")
  DISABLED                  @map("disabled")
  ARCHIVED                  @map("archived")

  @@map("bank_connection_status")
}

enum BankAccountLinkStatus {
  PENDING_LINK  @map("pendingLink")
  LINKED        @map("linked")
  UNLINKED      @map("unlinked")
  DISABLED      @map("disabled")
  ARCHIVED      @map("archived")

  @@map("bank_account_link_status")
}

enum OpenBankingSyncType {
  ACCOUNTS      @map("accounts")
  BALANCES      @map("balances")
  TRANSACTIONS  @map("transactions")
  FULL          @map("full")

  @@map("open_banking_sync_type")
}

enum OpenBankingSyncStatus {
  QUEUED                   @map("queued")
  RUNNING                  @map("running")
  COMPLETED                @map("completed")
  COMPLETED_WITH_WARNINGS  @map("completedWithWarnings")
  FAILED                   @map("failed")
  CANCELLED                @map("cancelled")
  ARCHIVED                 @map("archived")

  @@map("open_banking_sync_status")
}

enum OpenBankingSyncTriggerType {
  MANUAL     @map("manual")
  SCHEDULED  @map("scheduled")
  WEBHOOK    @map("webhook")
  SYSTEM     @map("system")

  @@map("open_banking_sync_trigger_type")
}

enum OpenBankingTransactionStatus {
  IMPORTED                @map("imported")
  DUPLICATE               @map("duplicate")
  SENT_TO_RECONCILIATION  @map("sentToReconciliation")
  REJECTED                @map("rejected")
  IGNORED                 @map("ignored")
  REQUIRES_REVIEW         @map("requiresReview")
  ARCHIVED                @map("archived")

  @@map("open_banking_transaction_status")
}

enum OpenBankingTransactionDirection {
  CREDIT   @map("credit")
  DEBIT    @map("debit")
  NEUTRAL  @map("neutral")

  @@map("open_banking_transaction_direction")
}

enum OpenBankingTransactionType {
  DEPOSIT                      @map("deposit")
  TRANSFER_IN                  @map("transferIn")
  TRANSFER_OUT                 @map("transferOut")
  WITHDRAWAL                   @map("withdrawal")
  BANK_FEE                     @map("bankFee")
  INTEREST                     @map("interest")
  REVERSAL                     @map("reversal")
  ADJUSTMENT                   @map("adjustment")
  PAYMENT_PROVIDER_SETTLEMENT  @map("paymentProviderSettlement")
  UNKNOWN                      @map("unknown")
  OTHER                        @map("other")

  @@map("open_banking_transaction_type")
}

enum OpenBankingWebhookSignatureStatus {
  NOT_VERIFIED  @map("notVerified")
  VERIFIED      @map("verified")
  INVALID       @map("invalid")
  MISSING       @map("missing")
  UNSUPPORTED   @map("unsupported")

  @@map("open_banking_webhook_signature_status")
}

enum OpenBankingWebhookProcessingStatus {
  RECEIVED    @map("received")
  IGNORED     @map("ignored")
  PROCESSING  @map("processing")
  PROCESSED   @map("processed")
  DUPLICATE   @map("duplicate")
  FAILED      @map("failed")
  REJECTED    @map("rejected")
  ARCHIVED    @map("archived")

  @@map("open_banking_webhook_processing_status")
}

model OpenBankingProviderDefinition {
  id                       String                               @id @default(uuid()) @db.Uuid
  providerKey              String                               @unique @map("provider_key") @db.VarChar(100)
  displayName              String                               @map("display_name") @db.VarChar(160)
  description              String?                              @db.Text
  status                   OpenBankingProviderDefinitionStatus  @default(DRAFT)

  supportedEnvironments    Json                                 @map("supported_environments")
  supportedCapabilities    Json                                 @map("supported_capabilities")
  supportedCountries       Json?                                @map("supported_countries")
  supportedCurrencies      Json                                 @map("supported_currencies")

  supportsAccountInfo      Boolean                              @default(true)  @map("supports_account_info")
  supportsBalances         Boolean                              @default(true)  @map("supports_balances")
  supportsTransactions     Boolean                              @default(true)  @map("supports_transactions")
  supportsWebhooks         Boolean                              @default(false) @map("supports_webhooks")
  supportsConsentRenewal   Boolean                              @default(false) @map("supports_consent_renewal")
  supportsPaymentInitiation Boolean                             @default(false) @map("supports_payment_initiation")

  createdBy                String?                              @map("created_by") @db.Uuid
  updatedBy                String?                              @map("updated_by") @db.Uuid
  activatedBy              String?                              @map("activated_by") @db.Uuid
  deprecatedBy             String?                              @map("deprecated_by") @db.Uuid
  archivedBy               String?                              @map("archived_by") @db.Uuid

  createdAt                DateTime                             @default(now()) @map("created_at")
  updatedAt                DateTime                             @updatedAt @map("updated_at")
  activatedAt              DateTime?                            @map("activated_at")
  deprecatedAt             DateTime?                            @map("deprecated_at")
  archivedAt               DateTime?                            @map("archived_at")
  archiveReason            String?                              @map("archive_reason") @db.Text

  metadata                 Json?

  tenantConfigs            TenantOpenBankingConfig[]

  @@index([status])
  @@index([createdAt])
  @@map("open_banking_provider_definitions")
}

model TenantOpenBankingConfig {
  id                    String                         @id @default(uuid()) @db.Uuid
  tenantId              String                         @map("tenant_id") @db.Uuid
  providerDefinitionId  String                         @map("provider_definition_id") @db.Uuid
  providerKey           String                         @map("provider_key") @db.VarChar(100)
  environment           OpenBankingEnvironment         @default(SANDBOX)
  status                TenantOpenBankingConfigStatus  @default(DRAFT)

  displayName           String?                        @map("display_name") @db.VarChar(160)
  credentialSecretRef   String?                        @map("credential_secret_ref") @db.VarChar(500)
  webhookSecretRef      String?                        @map("webhook_secret_ref") @db.VarChar(500)
  publicConfig          Json?                          @map("public_config")
  callbackUrl           String?                        @map("callback_url") @db.VarChar(500)
  webhookEndpointPath   String?                        @map("webhook_endpoint_path") @db.VarChar(300)
  allowedOrigins        Json?                          @map("allowed_origins")

  createdBy             String?                        @map("created_by") @db.Uuid
  updatedBy             String?                        @map("updated_by") @db.Uuid
  enabledBy             String?                        @map("enabled_by") @db.Uuid
  disabledBy            String?                        @map("disabled_by") @db.Uuid
  testedBy              String?                        @map("tested_by") @db.Uuid
  invalidatedBy         String?                        @map("invalidated_by") @db.Uuid
  archivedBy            String?                        @map("archived_by") @db.Uuid

  createdAt             DateTime                       @default(now()) @map("created_at")
  updatedAt             DateTime                       @updatedAt @map("updated_at")
  enabledAt             DateTime?                      @map("enabled_at")
  disabledAt            DateTime?                      @map("disabled_at")
  testedAt              DateTime?                      @map("tested_at")
  invalidatedAt         DateTime?                      @map("invalidated_at")
  archivedAt            DateTime?                      @map("archived_at")

  disableReason         String?                        @map("disable_reason") @db.Text
  invalidReason         String?                        @map("invalid_reason") @db.Text
  archiveReason         String?                        @map("archive_reason") @db.Text

  metadata              Json?

  tenant                Tenant                         @relation(fields: [tenantId], references: [id])
  providerDefinition    OpenBankingProviderDefinition  @relation(fields: [providerDefinitionId], references: [id])

  consents              BankConsent[]
  connections           BankConnection[]
  webhookEvents         OpenBankingWebhookEvent[]

  @@index([tenantId])
  @@index([tenantId, providerKey])
  @@index([tenantId, environment])
  @@index([tenantId, status])
  @@index([providerDefinitionId])
  @@index([createdAt])
  @@map("tenant_open_banking_configs")
}

model BankConsent {
  id                         String                         @id @default(uuid()) @db.Uuid
  tenantId                   String                         @map("tenant_id") @db.Uuid
  tenantOpenBankingConfigId  String                         @map("tenant_open_banking_config_id") @db.Uuid
  providerKey                String                         @map("provider_key") @db.VarChar(100)
  providerConsentId          String?                        @map("provider_consent_id") @db.VarChar(200)

  status                     BankConsentStatus              @default(DRAFT)
  scope                      Json
  consentType                String?                        @map("consent_type") @db.VarChar(100)
  authorizationUrlHash       String?                        @map("authorization_url_hash") @db.VarChar(128)
  authorizationMethod        String?                        @map("authorization_method") @db.VarChar(80)
  termsAcceptedVersion       String?                        @map("terms_accepted_version") @db.VarChar(80)

  authorizedBy               String?                        @map("authorized_by") @db.Uuid
  authorizedAt               DateTime?                      @map("authorized_at")
  expiresAt                  DateTime?                      @map("expires_at")
  renewedAt                  DateTime?                      @map("renewed_at")
  renewedBy                  String?                        @map("renewed_by") @db.Uuid
  revokedAt                  DateTime?                      @map("revoked_at")
  revokedBy                  String?                        @map("revoked_by") @db.Uuid
  revocationReason           String?                        @map("revocation_reason") @db.Text
  failedAt                   DateTime?                      @map("failed_at")
  failureReason              String?                        @map("failure_reason") @db.Text
  archivedAt                 DateTime?                      @map("archived_at")
  archivedBy                 String?                        @map("archived_by") @db.Uuid
  archiveReason              String?                        @map("archive_reason") @db.Text

  createdAt                  DateTime                       @default(now()) @map("created_at")
  updatedAt                  DateTime                       @updatedAt @map("updated_at")
  metadata                   Json?

  tenant                     Tenant                         @relation(fields: [tenantId], references: [id])
  tenantConfig               TenantOpenBankingConfig        @relation(fields: [tenantOpenBankingConfigId], references: [id])
  connections                BankConnection[]

  @@index([tenantId])
  @@index([tenantId, tenantOpenBankingConfigId])
  @@index([tenantId, providerKey])
  @@index([tenantId, providerConsentId])
  @@index([tenantId, status])
  @@index([tenantId, expiresAt])
  @@index([createdAt])
  @@map("bank_consents")
}

model BankConnection {
  id                         String                    @id @default(uuid()) @db.Uuid
  tenantId                   String                    @map("tenant_id") @db.Uuid
  tenantOpenBankingConfigId  String                    @map("tenant_open_banking_config_id") @db.Uuid
  bankConsentId              String                    @map("bank_consent_id") @db.Uuid
  providerKey                String                    @map("provider_key") @db.VarChar(100)
  providerConnectionId       String?                   @map("provider_connection_id") @db.VarChar(200)

  status                     BankConnectionStatus      @default(PENDING_AUTHORIZATION)
  connectionName             String?                   @map("connection_name") @db.VarChar(160)
  institutionName            String?                   @map("institution_name") @db.VarChar(160)
  institutionCode            String?                   @map("institution_code") @db.VarChar(100)
  country                    String?                   @db.VarChar(2)
  currency                   Currency                  @default(USD)

  tokenSecretRef             String?                   @map("token_secret_ref") @db.VarChar(500)
  refreshTokenSecretRef      String?                   @map("refresh_token_secret_ref") @db.VarChar(500)

  lastSuccessfulSyncAt       DateTime?                 @map("last_successful_sync_at")
  lastFailedSyncAt           DateTime?                 @map("last_failed_sync_at")
  failureReason              String?                   @map("failure_reason") @db.Text

  authorizedBy               String?                   @map("authorized_by") @db.Uuid
  authorizedAt               DateTime?                 @map("authorized_at")
  revokedBy                  String?                   @map("revoked_by") @db.Uuid
  revokedAt                  DateTime?                 @map("revoked_at")
  revocationReason           String?                   @map("revocation_reason") @db.Text
  disabledBy                 String?                   @map("disabled_by") @db.Uuid
  disabledAt                 DateTime?                 @map("disabled_at")
  disableReason              String?                   @map("disable_reason") @db.Text
  archivedBy                 String?                   @map("archived_by") @db.Uuid
  archivedAt                 DateTime?                 @map("archived_at")
  archiveReason              String?                   @map("archive_reason") @db.Text

  createdAt                  DateTime                  @default(now()) @map("created_at")
  updatedAt                  DateTime                  @updatedAt @map("updated_at")
  metadata                   Json?

  tenant                     Tenant                    @relation(fields: [tenantId], references: [id])
  tenantConfig               TenantOpenBankingConfig   @relation(fields: [tenantOpenBankingConfigId], references: [id])
  bankConsent                BankConsent               @relation(fields: [bankConsentId], references: [id])

  accountLinks               BankAccountLink[]
  syncRuns                   OpenBankingSyncRun[]
  accountSnapshots           OpenBankingAccountSnapshot[]
  transactions               OpenBankingTransaction[]
  webhookEvents              OpenBankingWebhookEvent[]

  @@index([tenantId])
  @@index([tenantId, tenantOpenBankingConfigId])
  @@index([tenantId, bankConsentId])
  @@index([tenantId, providerKey])
  @@index([tenantId, providerConnectionId])
  @@index([tenantId, status])
  @@index([tenantId, lastSuccessfulSyncAt])
  @@index([createdAt])
  @@map("bank_connections")
}

model BankAccountLink {
  id                    String                 @id @default(uuid()) @db.Uuid
  tenantId              String                 @map("tenant_id") @db.Uuid
  bankConnectionId      String                 @map("bank_connection_id") @db.Uuid
  bankAccountId         String?                @map("bank_account_id") @db.Uuid
  providerKey           String                 @map("provider_key") @db.VarChar(100)

  externalAccountId     String                 @map("external_account_id") @db.VarChar(250)
  externalAccountIdHash String                 @map("external_account_id_hash") @db.VarChar(128)
  externalAccountName   String?                @map("external_account_name") @db.VarChar(200)
  externalAccountType   String?                @map("external_account_type") @db.VarChar(100)

  accountNumberMasked   String?                @map("account_number_masked") @db.VarChar(80)
  accountNumberHash     String?                @map("account_number_hash") @db.VarChar(128)
  currency              Currency               @default(USD)
  status                BankAccountLinkStatus  @default(PENDING_LINK)

  linkedBy              String?                @map("linked_by") @db.Uuid
  linkedAt              DateTime?              @map("linked_at")
  unlinkedBy            String?                @map("unlinked_by") @db.Uuid
  unlinkedAt            DateTime?              @map("unlinked_at")
  unlinkReason          String?                @map("unlink_reason") @db.Text
  disabledBy            String?                @map("disabled_by") @db.Uuid
  disabledAt            DateTime?              @map("disabled_at")
  disableReason         String?                @map("disable_reason") @db.Text
  archivedBy            String?                @map("archived_by") @db.Uuid
  archivedAt            DateTime?              @map("archived_at")
  archiveReason         String?                @map("archive_reason") @db.Text

  createdAt             DateTime               @default(now()) @map("created_at")
  updatedAt             DateTime               @updatedAt @map("updated_at")
  metadata              Json?

  tenant                Tenant                 @relation(fields: [tenantId], references: [id])
  bankConnection        BankConnection         @relation(fields: [bankConnectionId], references: [id])
  bankAccount           BankAccount?           @relation(fields: [bankAccountId], references: [id])

  syncRuns              OpenBankingSyncRun[]
  accountSnapshots      OpenBankingAccountSnapshot[]
  transactions          OpenBankingTransaction[]

  @@index([tenantId])
  @@index([tenantId, bankConnectionId])
  @@index([tenantId, bankAccountId])
  @@index([tenantId, providerKey])
  @@index([tenantId, externalAccountIdHash])
  @@index([tenantId, accountNumberHash])
  @@index([tenantId, status])
  @@index([createdAt])
  @@map("bank_account_links")
}

model OpenBankingSyncRun {
  id                      String                       @id @default(uuid()) @db.Uuid
  tenantId                String                       @map("tenant_id") @db.Uuid
  bankConnectionId        String                       @map("bank_connection_id") @db.Uuid
  bankAccountLinkId       String?                      @map("bank_account_link_id") @db.Uuid
  providerKey             String                       @map("provider_key") @db.VarChar(100)

  syncType                OpenBankingSyncType          @map("sync_type")
  status                  OpenBankingSyncStatus        @default(QUEUED)
  triggerType             OpenBankingSyncTriggerType   @map("trigger_type")
  periodStart             DateTime?                    @map("period_start")
  periodEnd               DateTime?                    @map("period_end")
  syncCursor              String?                      @map("sync_cursor") @db.VarChar(500)

  startedBy               String?                      @map("started_by") @db.Uuid
  startedAt               DateTime?                    @map("started_at")
  completedAt             DateTime?                    @map("completed_at")
  failedAt                DateTime?                    @map("failed_at")
  cancelledAt             DateTime?                    @map("cancelled_at")
  cancelledBy             String?                      @map("cancelled_by") @db.Uuid

  retryOfSyncRunId        String?                      @map("retry_of_sync_run_id") @db.Uuid
  retryCount              Int                          @default(0) @map("retry_count")

  accountsFound           Int                          @default(0) @map("accounts_found")
  balancesFound           Int                          @default(0) @map("balances_found")
  transactionsFound       Int                          @default(0) @map("transactions_found")
  transactionsImported    Int                          @default(0) @map("transactions_imported")
  transactionsDuplicated  Int                          @default(0) @map("transactions_duplicated")
  transactionsRejected    Int                          @default(0) @map("transactions_rejected")
  warningsCount           Int                          @default(0) @map("warnings_count")

  errorCode               String?                      @map("error_code") @db.VarChar(120)
  errorMessage            String?                      @map("error_message") @db.Text

  archivedAt              DateTime?                    @map("archived_at")
  archivedBy              String?                      @map("archived_by") @db.Uuid
  archiveReason           String?                      @map("archive_reason") @db.Text

  createdAt               DateTime                     @default(now()) @map("created_at")
  updatedAt               DateTime                     @updatedAt @map("updated_at")
  metadata                Json?

  tenant                  Tenant                       @relation(fields: [tenantId], references: [id])
  bankConnection          BankConnection               @relation(fields: [bankConnectionId], references: [id])
  bankAccountLink         BankAccountLink?             @relation(fields: [bankAccountLinkId], references: [id])
  retryOfSyncRun          OpenBankingSyncRun?          @relation("OpenBankingSyncRetry", fields: [retryOfSyncRunId], references: [id])
  retryRuns               OpenBankingSyncRun[]         @relation("OpenBankingSyncRetry")

  accountSnapshots        OpenBankingAccountSnapshot[]
  transactions            OpenBankingTransaction[]

  @@index([tenantId])
  @@index([tenantId, bankConnectionId])
  @@index([tenantId, bankAccountLinkId])
  @@index([tenantId, providerKey])
  @@index([tenantId, syncType])
  @@index([tenantId, status])
  @@index([tenantId, triggerType])
  @@index([tenantId, periodStart, periodEnd])
  @@index([tenantId, startedAt])
  @@index([createdAt])
  @@map("open_banking_sync_runs")
}

model OpenBankingAccountSnapshot {
  id                    String           @id @default(uuid()) @db.Uuid
  tenantId              String           @map("tenant_id") @db.Uuid
  bankConnectionId      String           @map("bank_connection_id") @db.Uuid
  bankAccountLinkId     String           @map("bank_account_link_id") @db.Uuid
  bankAccountId         String?          @map("bank_account_id") @db.Uuid
  syncRunId             String           @map("sync_run_id") @db.Uuid
  providerKey           String           @map("provider_key") @db.VarChar(100)

  externalAccountId     String           @map("external_account_id") @db.VarChar(250)
  externalAccountIdHash String           @map("external_account_id_hash") @db.VarChar(128)

  availableBalance      Decimal?         @map("available_balance") @db.Decimal(12, 2)
  currentBalance        Decimal?         @map("current_balance") @db.Decimal(12, 2)
  currency              Currency         @default(USD)
  snapshotAt            DateTime         @map("snapshot_at")

  createdAt             DateTime         @default(now()) @map("created_at")
  metadata              Json?

  tenant                Tenant           @relation(fields: [tenantId], references: [id])
  bankConnection        BankConnection   @relation(fields: [bankConnectionId], references: [id])
  bankAccountLink       BankAccountLink  @relation(fields: [bankAccountLinkId], references: [id])
  bankAccount           BankAccount?     @relation(fields: [bankAccountId], references: [id])
  syncRun               OpenBankingSyncRun @relation(fields: [syncRunId], references: [id])

  @@index([tenantId])
  @@index([tenantId, bankConnectionId])
  @@index([tenantId, bankAccountLinkId])
  @@index([tenantId, bankAccountId])
  @@index([tenantId, syncRunId])
  @@index([tenantId, snapshotAt])
  @@index([tenantId, providerKey])
  @@map("open_banking_account_snapshots")
}

model OpenBankingTransaction {
  id                         String                            @id @default(uuid()) @db.Uuid
  tenantId                   String                            @map("tenant_id") @db.Uuid
  bankConnectionId           String                            @map("bank_connection_id") @db.Uuid
  bankAccountLinkId          String                            @map("bank_account_link_id") @db.Uuid
  bankAccountId              String?                           @map("bank_account_id") @db.Uuid
  syncRunId                  String                            @map("sync_run_id") @db.Uuid
  providerKey                String                            @map("provider_key") @db.VarChar(100)

  externalTransactionId      String?                           @map("external_transaction_id") @db.VarChar(250)
  externalTransactionIdHash  String?                           @map("external_transaction_id_hash") @db.VarChar(128)

  transactionDate            DateTime                          @map("transaction_date")
  postedDate                 DateTime?                         @map("posted_date")
  description                String?                           @db.Text
  normalizedDescription      String?                           @map("normalized_description") @db.Text
  reference                  String?                           @db.Text
  normalizedReference        String?                           @map("normalized_reference") @db.Text
  bankReference              String?                           @map("bank_reference") @db.Text
  normalizedBankReference    String?                           @map("normalized_bank_reference") @db.Text

  direction                  OpenBankingTransactionDirection
  amount                     Decimal                           @db.Decimal(12, 2)
  currency                   Currency                          @default(USD)
  balanceAfter               Decimal?                          @map("balance_after") @db.Decimal(12, 2)
  transactionType            OpenBankingTransactionType        @default(UNKNOWN) @map("transaction_type")
  status                     OpenBankingTransactionStatus      @default(IMPORTED)

  fingerprint                String                            @db.VarChar(128)
  isDuplicate                Boolean                           @default(false) @map("is_duplicate")
  duplicateOfTransactionId   String?                           @map("duplicate_of_transaction_id") @db.Uuid

  sentToReconciliationAt     DateTime?                         @map("sent_to_reconciliation_at")
  sentToReconciliationBy     String?                           @map("sent_to_reconciliation_by") @db.Uuid
  bankTransactionId          String?                           @map("bank_transaction_id") @db.Uuid

  rejectedAt                 DateTime?                         @map("rejected_at")
  rejectedBy                 String?                           @map("rejected_by") @db.Uuid
  rejectReason               String?                           @map("reject_reason") @db.Text
  ignoredAt                  DateTime?                         @map("ignored_at")
  ignoredBy                  String?                           @map("ignored_by") @db.Uuid
  ignoreReason               String?                           @map("ignore_reason") @db.Text
  archivedAt                 DateTime?                         @map("archived_at")
  archivedBy                 String?                           @map("archived_by") @db.Uuid
  archiveReason              String?                           @map("archive_reason") @db.Text

  createdAt                  DateTime                          @default(now()) @map("created_at")
  updatedAt                  DateTime                          @updatedAt @map("updated_at")
  metadata                   Json?

  tenant                     Tenant                            @relation(fields: [tenantId], references: [id])
  bankConnection             BankConnection                    @relation(fields: [bankConnectionId], references: [id])
  bankAccountLink            BankAccountLink                   @relation(fields: [bankAccountLinkId], references: [id])
  bankAccount                BankAccount?                      @relation(fields: [bankAccountId], references: [id])
  syncRun                    OpenBankingSyncRun                @relation(fields: [syncRunId], references: [id])
  duplicateOfTransaction     OpenBankingTransaction?           @relation("OpenBankingTransactionDuplicate", fields: [duplicateOfTransactionId], references: [id])
  duplicateTransactions      OpenBankingTransaction[]          @relation("OpenBankingTransactionDuplicate")
  bankTransaction            BankTransaction?                  @relation(fields: [bankTransactionId], references: [id])

  @@index([tenantId])
  @@index([tenantId, bankConnectionId])
  @@index([tenantId, bankAccountLinkId])
  @@index([tenantId, bankAccountId])
  @@index([tenantId, syncRunId])
  @@index([tenantId, providerKey])
  @@index([tenantId, externalTransactionIdHash])
  @@index([tenantId, fingerprint])
  @@index([tenantId, status])
  @@index([tenantId, transactionDate])
  @@index([tenantId, postedDate])
  @@index([tenantId, bankTransactionId])
  @@index([tenantId, isDuplicate])
  @@index([createdAt])
  @@map("open_banking_transactions")
}

model OpenBankingWebhookEvent {
  id                         String                               @id @default(uuid()) @db.Uuid
  tenantId                   String?                              @map("tenant_id") @db.Uuid
  tenantOpenBankingConfigId  String?                              @map("tenant_open_banking_config_id") @db.Uuid
  bankConnectionId           String?                              @map("bank_connection_id") @db.Uuid
  providerKey                String                               @map("provider_key") @db.VarChar(100)

  providerEventId            String?                              @map("provider_event_id") @db.VarChar(250)
  eventType                  String?                              @map("event_type") @db.VarChar(120)

  signatureStatus            OpenBankingWebhookSignatureStatus    @default(NOT_VERIFIED) @map("signature_status")
  processingStatus           OpenBankingWebhookProcessingStatus   @default(RECEIVED) @map("processing_status")

  receivedAt                 DateTime                             @default(now()) @map("received_at")
  processedAt                DateTime?                            @map("processed_at")
  rejectedAt                 DateTime?                            @map("rejected_at")
  failedAt                   DateTime?                            @map("failed_at")

  payloadHash                String                               @map("payload_hash") @db.VarChar(128)
  payloadHashPrefix          String                               @map("payload_hash_prefix") @db.VarChar(20)
  payloadPreview             Json?                                @map("payload_preview")
  signatureHeaderHash        String?                              @map("signature_header_hash") @db.VarChar(128)
  providerTimestamp          DateTime?                            @map("provider_timestamp")

  errorCode                  String?                              @map("error_code") @db.VarChar(120)
  errorMessage               String?                              @map("error_message") @db.Text
  retryCount                 Int                                  @default(0) @map("retry_count")
  lastRetryAt                DateTime?                            @map("last_retry_at")

  archivedAt                 DateTime?                            @map("archived_at")
  archivedBy                 String?                              @map("archived_by") @db.Uuid
  archiveReason              String?                              @map("archive_reason") @db.Text

  createdAt                  DateTime                             @default(now()) @map("created_at")
  updatedAt                  DateTime                             @updatedAt @map("updated_at")
  metadata                   Json?

  tenant                     Tenant?                              @relation(fields: [tenantId], references: [id])
  tenantConfig               TenantOpenBankingConfig?             @relation(fields: [tenantOpenBankingConfigId], references: [id])
  bankConnection             BankConnection?                      @relation(fields: [bankConnectionId], references: [id])

  @@index([tenantId])
  @@index([tenantId, tenantOpenBankingConfigId])
  @@index([tenantId, bankConnectionId])
  @@index([providerKey])
  @@index([tenantId, providerKey])
  @@index([tenantId, providerEventId])
  @@index([payloadHash])
  @@index([signatureStatus])
  @@index([processingStatus])
  @@index([receivedAt])
  @@map("open_banking_webhook_events")
}
```

---

## 19. Relaciones requeridas en modelos existentes

### 19.1. `Tenant`

Agregar relaciones:

```prisma id="wc35no"
model Tenant {
  // campos existentes...

  tenantOpenBankingConfigs   TenantOpenBankingConfig[]
  bankConsents               BankConsent[]
  bankConnections            BankConnection[]
  bankAccountLinks           BankAccountLink[]
  openBankingSyncRuns        OpenBankingSyncRun[]
  openBankingAccountSnapshots OpenBankingAccountSnapshot[]
  openBankingTransactions    OpenBankingTransaction[]
  openBankingWebhookEvents   OpenBankingWebhookEvent[]
}
```

---

### 19.2. `BankAccount`

Agregar relaciones:

```prisma id="vyw459"
model BankAccount {
  // campos existentes...

  openBankingAccountLinks      BankAccountLink[]
  openBankingAccountSnapshots  OpenBankingAccountSnapshot[]
  openBankingTransactions      OpenBankingTransaction[]
}
```

---

### 19.3. `BankTransaction`

Agregar relación:

```prisma id="aspnty"
model BankTransaction {
  // campos existentes...

  openBankingTransactions OpenBankingTransaction[]
}
```

Opcionalmente, si se decide fortalecer trazabilidad directa en `BankTransaction`:

```prisma id="xki054"
model BankTransaction {
  // campos existentes...

  sourceModule        BankTransactionSourceModule? @map("source_module")
  sourceResourceId    String?                      @map("source_resource_id") @db.Uuid
  sourceFingerprint   String?                      @map("source_fingerprint") @db.VarChar(128)
}
```

---

### 19.4. `SecureDocument` / `SourceModule`

Extender enum de módulo fuente:

```prisma id="pmmiy5"
enum SourceModule {
  // valores existentes...

  OPEN_BANKING_INTEGRATION @map("openBankingIntegration")
}
```

Uso recomendado:

```text id="dr29v4"
sourceModule = openBankingIntegration
sourceResourceType = bankConsent | openBankingReportExport | openBankingSyncEvidence
```

---

## 20. Índices recomendados

### 20.1. `open_banking_provider_definitions`

```text id="g9wup4"
provider_key unique
status
created_at
```

---

### 20.2. `tenant_open_banking_configs`

```text id="vs76cl"
tenant_id
tenant_id + provider_key
tenant_id + environment
tenant_id + status
provider_definition_id
created_at
```

Índice parcial recomendado:

```sql id="x9vp44"
CREATE UNIQUE INDEX uq_tenant_open_banking_enabled_provider
ON tenant_open_banking_configs (tenant_id, provider_key, environment)
WHERE status = 'enabled' AND archived_at IS NULL;
```

---

### 20.3. `bank_consents`

```text id="ozf001"
tenant_id
tenant_id + tenant_open_banking_config_id
tenant_id + provider_key
tenant_id + provider_consent_id
tenant_id + status
tenant_id + expires_at
created_at
```

Índice parcial recomendado:

```sql id="t2l63k"
CREATE UNIQUE INDEX uq_bank_consents_active_provider_consent
ON bank_consents (tenant_id, provider_key, provider_consent_id)
WHERE provider_consent_id IS NOT NULL AND archived_at IS NULL;
```

---

### 20.4. `bank_connections`

```text id="p05lpx"
tenant_id
tenant_id + tenant_open_banking_config_id
tenant_id + bank_consent_id
tenant_id + provider_key
tenant_id + provider_connection_id
tenant_id + status
tenant_id + last_successful_sync_at
created_at
```

Índice parcial recomendado:

```sql id="jn23jm"
CREATE UNIQUE INDEX uq_bank_connections_provider_connection
ON bank_connections (tenant_id, provider_key, provider_connection_id)
WHERE provider_connection_id IS NOT NULL AND archived_at IS NULL;
```

---

### 20.5. `bank_account_links`

```text id="jpsqhd"
tenant_id
tenant_id + bank_connection_id
tenant_id + bank_account_id
tenant_id + provider_key
tenant_id + external_account_id_hash
tenant_id + account_number_hash
tenant_id + status
created_at
```

Índice parcial recomendado:

```sql id="vwcfrs"
CREATE UNIQUE INDEX uq_bank_account_links_external_account
ON bank_account_links (tenant_id, provider_key, bank_connection_id, external_account_id_hash)
WHERE archived_at IS NULL;
```

Índice parcial para cuenta interna vinculada:

```sql id="buxizx"
CREATE UNIQUE INDEX uq_bank_account_links_active_bank_account
ON bank_account_links (tenant_id, bank_account_id)
WHERE bank_account_id IS NOT NULL
  AND status = 'linked'
  AND archived_at IS NULL;
```

---

### 20.6. `open_banking_sync_runs`

```text id="zt1b0i"
tenant_id
tenant_id + bank_connection_id
tenant_id + bank_account_link_id
tenant_id + provider_key
tenant_id + sync_type
tenant_id + status
tenant_id + trigger_type
tenant_id + period_start + period_end
tenant_id + started_at
created_at
```

Índice parcial para evitar sync concurrente por conexión:

```sql id="bufwx3"
CREATE UNIQUE INDEX uq_open_banking_sync_running_connection
ON open_banking_sync_runs (tenant_id, bank_connection_id, sync_type)
WHERE status IN ('queued', 'running');
```

---

### 20.7. `open_banking_account_snapshots`

```text id="nknnh6"
tenant_id
tenant_id + bank_connection_id
tenant_id + bank_account_link_id
tenant_id + bank_account_id
tenant_id + sync_run_id
tenant_id + snapshot_at
tenant_id + provider_key
```

---

### 20.8. `open_banking_transactions`

```text id="cr4z5k"
tenant_id
tenant_id + bank_connection_id
tenant_id + bank_account_link_id
tenant_id + bank_account_id
tenant_id + sync_run_id
tenant_id + provider_key
tenant_id + external_transaction_id_hash
tenant_id + fingerprint
tenant_id + status
tenant_id + transaction_date
tenant_id + posted_date
tenant_id + bank_transaction_id
tenant_id + is_duplicate
created_at
```

Índice único por external transaction:

```sql id="n2a87d"
CREATE UNIQUE INDEX uq_open_banking_transactions_external_id
ON open_banking_transactions (
  tenant_id,
  provider_key,
  bank_connection_id,
  bank_account_link_id,
  external_transaction_id_hash
)
WHERE external_transaction_id_hash IS NOT NULL
  AND archived_at IS NULL;
```

Índice único por fingerprint:

```sql id="f49iv6"
CREATE UNIQUE INDEX uq_open_banking_transactions_fingerprint
ON open_banking_transactions (
  tenant_id,
  provider_key,
  bank_connection_id,
  bank_account_link_id,
  fingerprint
)
WHERE archived_at IS NULL;
```

---

### 20.9. `open_banking_webhook_events`

```text id="gg9g2k"
tenant_id
tenant_id + tenant_open_banking_config_id
tenant_id + bank_connection_id
provider_key
tenant_id + provider_key
tenant_id + provider_event_id
payload_hash
signature_status
processing_status
received_at
```

Índice único por evento:

```sql id="njlkfb"
CREATE UNIQUE INDEX uq_open_banking_webhook_events_provider_event
ON open_banking_webhook_events (tenant_id, provider_key, provider_event_id)
WHERE tenant_id IS NOT NULL
  AND provider_event_id IS NOT NULL
  AND archived_at IS NULL;
```

Índice para replay por payload hash:

```sql id="gvn9az"
CREATE INDEX idx_open_banking_webhook_payload_hash
ON open_banking_webhook_events (payload_hash, received_at);
```

---

## 21. Constraints recomendados

### 21.1. Montos positivos o cero

```sql id="tus05t"
ALTER TABLE open_banking_transactions
ADD CONSTRAINT chk_open_banking_transactions_amount_positive
CHECK (amount > 0);
```

```sql id="j4sf2g"
ALTER TABLE open_banking_account_snapshots
ADD CONSTRAINT chk_open_banking_account_snapshots_balances_non_negative
CHECK (
  (available_balance IS NULL OR available_balance >= 0)
  AND
  (current_balance IS NULL OR current_balance >= 0)
);
```

---

### 21.2. Periodos de sync válidos

```sql id="ba75cr"
ALTER TABLE open_banking_sync_runs
ADD CONSTRAINT chk_open_banking_sync_runs_period
CHECK (
  period_start IS NULL
  OR period_end IS NULL
  OR period_start <= period_end
);
```

---

### 21.3. Conteos no negativos

```sql id="volwu0"
ALTER TABLE open_banking_sync_runs
ADD CONSTRAINT chk_open_banking_sync_runs_counts_non_negative
CHECK (
  retry_count >= 0
  AND accounts_found >= 0
  AND balances_found >= 0
  AND transactions_found >= 0
  AND transactions_imported >= 0
  AND transactions_duplicated >= 0
  AND transactions_rejected >= 0
  AND warnings_count >= 0
);
```

---

### 21.4. Consentimiento autorizado

```sql id="jp1scp"
ALTER TABLE bank_consents
ADD CONSTRAINT chk_bank_consents_authorized_fields
CHECK (
  status != 'authorized'
  OR (authorized_at IS NOT NULL AND authorized_by IS NOT NULL)
);
```

---

### 21.5. Consentimiento revocado

```sql id="eib3ce"
ALTER TABLE bank_consents
ADD CONSTRAINT chk_bank_consents_revoked_fields
CHECK (
  status != 'revoked'
  OR (revoked_at IS NOT NULL AND revoked_by IS NOT NULL AND revocation_reason IS NOT NULL)
);
```

---

### 21.6. Conexión revocada

```sql id="yrpxyi"
ALTER TABLE bank_connections
ADD CONSTRAINT chk_bank_connections_revoked_fields
CHECK (
  status != 'revoked'
  OR (revoked_at IS NOT NULL AND revoked_by IS NOT NULL AND revocation_reason IS NOT NULL)
);
```

---

### 21.7. Account link vinculado

```sql id="wsrw12"
ALTER TABLE bank_account_links
ADD CONSTRAINT chk_bank_account_links_linked_bank_account
CHECK (
  status != 'linked'
  OR bank_account_id IS NOT NULL
);
```

---

### 21.8. Sync completed

```sql id="stoqcb"
ALTER TABLE open_banking_sync_runs
ADD CONSTRAINT chk_open_banking_sync_completed_fields
CHECK (
  status NOT IN ('completed', 'completedWithWarnings')
  OR completed_at IS NOT NULL
);
```

---

### 21.9. Sync failed

```sql id="o49vs6"
ALTER TABLE open_banking_sync_runs
ADD CONSTRAINT chk_open_banking_sync_failed_fields
CHECK (
  status != 'failed'
  OR (failed_at IS NOT NULL AND error_code IS NOT NULL)
);
```

---

### 21.10. Transaction sent to reconciliation

```sql id="h657tu"
ALTER TABLE open_banking_transactions
ADD CONSTRAINT chk_open_banking_transactions_sent_to_reconciliation
CHECK (
  status != 'sentToReconciliation'
  OR (sent_to_reconciliation_at IS NOT NULL AND bank_transaction_id IS NOT NULL)
);
```

---

### 21.11. Transaction rejected

```sql id="pap30j"
ALTER TABLE open_banking_transactions
ADD CONSTRAINT chk_open_banking_transactions_rejected_reason
CHECK (
  status != 'rejected'
  OR (rejected_at IS NOT NULL AND rejected_by IS NOT NULL AND reject_reason IS NOT NULL)
);
```

---

### 21.12. Transaction ignored

```sql id="q73dke"
ALTER TABLE open_banking_transactions
ADD CONSTRAINT chk_open_banking_transactions_ignored_reason
CHECK (
  status != 'ignored'
  OR (ignored_at IS NOT NULL AND ignored_by IS NOT NULL AND ignore_reason IS NOT NULL)
);
```

---

### 21.13. Webhook processed

```sql id="tx6on0"
ALTER TABLE open_banking_webhook_events
ADD CONSTRAINT chk_open_banking_webhook_processed_fields
CHECK (
  processing_status != 'processed'
  OR processed_at IS NOT NULL
);
```

---

### 21.14. Webhook rejected

```sql id="iek2qv"
ALTER TABLE open_banking_webhook_events
ADD CONSTRAINT chk_open_banking_webhook_rejected_fields
CHECK (
  processing_status != 'rejected'
  OR (rejected_at IS NOT NULL AND error_code IS NOT NULL)
);
```

---

## 22. Reglas de multitenancy en relaciones

### 22.1. Validaciones que Prisma no garantiza por sí solo

Aunque existan foreign keys, el servicio debe validar tenant en:

```text id="j6cwsh"
tenantOpenBankingConfigId
bankConsentId
bankConnectionId
bankAccountLinkId
bankAccountId
syncRunId
openBankingTransactionId
bankTransactionId
secureDocumentId
secureDocumentFileId
```

---

### 22.2. Validación obligatoria al vincular `BankAccount`

```text id="j53wyx"
BankAccountLink.tenantId debe ser igual a BankAccount.tenantId.
```

---

### 22.3. Validación obligatoria al crear `BankTransaction`

```text id="hz1x0m"
OpenBankingTransaction.tenantId debe ser igual a BankTransaction.tenantId.
```

---

### 22.4. Validación obligatoria en reportes

Todo reporte debe usar:

```text id="f85dk1"
WHERE tenant_id = currentTenant.id
```

---

## 23. Estrategia de dinero

### 23.1. Tipo

Todos los montos usan:

```text id="jj0659"
Decimal(12,2)
```

---

### 23.2. Campos monetarios

```text id="fwten3"
open_banking_account_snapshots.available_balance
open_banking_account_snapshots.current_balance
open_banking_transactions.amount
open_banking_transactions.balance_after
```

---

### 23.3. Reglas

```text id="c03laf"
- no usar float.
- no usar double.
- no usar JavaScript number como fuente de verdad.
- exponer montos como string decimal.
- currency MVP = USD.
```

---

## 24. Estrategia de números de cuenta

### 24.1. Persistencia permitida

```text id="hx0y6q"
account_number_masked
account_number_hash
```

---

### 24.2. Persistencia prohibida

```text id="wxjc6h"
full account number
raw account number
bank login username
bank login password
```

---

### 24.3. Hash

El hash debe calcularse con:

```text id="xkpaa1"
normalizedAccountNumber + tenantScopedPepper
```

Algoritmo recomendado:

```text id="z1oxxn"
SHA-256
```

---

## 25. Estrategia de external IDs

### 25.1. External account ID

Persistir:

```text id="t7tgi4"
external_account_id
external_account_id_hash
```

Uso:

```text id="nca6j5"
external_account_id puede requerirse internamente para consultar provider.
external_account_id_hash se usa para índices, auditoría y lookup seguro.
```

No exponer innecesariamente `external_account_id` en DTO.

---

### 25.2. External transaction ID

Persistir:

```text id="dt0zth"
external_transaction_id
external_transaction_id_hash
```

Uso:

```text id="y6wtiu"
external_transaction_id ayuda a idempotencia.
external_transaction_id_hash ayuda a deduplicación segura.
```

---

## 26. Estrategia de fingerprint

### 26.1. Cuándo usar fingerprint

Usar fingerprint cuando:

```text id="nmhy74"
- provider no entrega externalTransactionId;
- externalTransactionId es inestable;
- se requiere deduplicación adicional;
- se procesa retry de sync;
- se importa hacia Bank Reconciliation.
```

---

### 26.2. Input canónico

```text id="oglr8o"
tenantId
providerKey
bankConnectionId
bankAccountLinkId
transactionDate
postedDate
direction
amount
currency
normalizedDescription
normalizedReference
normalizedBankReference
```

---

### 26.3. Algoritmo

```text id="btyp9h"
SHA-256
```

---

### 26.4. Reglas

```text id="gl2c5k"
- fingerprint se genera server-side.
- fingerprint no se acepta desde cliente.
- fingerprint no se expone por API pública.
- fingerprint debe ser estable para retries.
- fingerprint debe considerar tenant y cuenta para evitar colisiones cross-tenant.
```

---

## 27. Estrategia de webhooks

### 27.1. Raw body

El raw body debe usarse solo en memoria para verificar firma.

Persistir únicamente:

```text id="tpmddl"
payload_hash
payload_hash_prefix
payload_preview sanitizado
signature_header_hash
provider_timestamp
```

---

### 27.2. Idempotencia

Usar:

```text id="f2gxhm"
tenantId
providerKey
providerEventId
payloadHash
```

---

### 27.3. Eventos no resueltos

Si un webhook no se puede resolver a tenant:

```text id="c0kqvr"
- tenant_id puede quedar null;
- no debe ejecutar sync;
- no debe crear movimiento;
- debe registrar error sanitizado;
- debe auditar técnicamente si aplica;
- no debe revelar existencia de tenants.
```

---

## 28. Estrategia de metadata

### 28.1. Permitido en metadata

```text id="waisgw"
adapterName
providerApiVersion
safeProviderStatus
safeInstitutionCategory
safeSyncHints
safeCursorMetadata
safeErrorClassification
safeWarningCodes
safeReportFilters
```

---

### 28.2. Prohibido en metadata

```text id="cq4jna"
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
datos bancarios reales para IA
```

---

## 29. DTOs derivados del modelo

### 29.1. `OpenBankingProviderDefinitionDto`

Incluye:

```text id="e8fhm9"
id
providerKey
displayName
description
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
createdAt
updatedAt
activatedAt
deprecatedAt
archivedAt
metadata segura
```

No incluye secretos.

---

### 29.2. `TenantOpenBankingConfigDto`

Incluye:

```text id="wqdyz5"
id
providerDefinitionId
providerKey
environment
status
displayName
credentialSecretConfigured
webhookSecretConfigured
publicConfig
callbackUrl
webhookEndpointPath
allowedOrigins
createdAt
updatedAt
enabledAt
disabledAt
testedAt
invalidatedAt
archivedAt
metadata segura
```

No incluye:

```text id="pdjpjj"
tenantId
credentialSecretRef
webhookSecretRef
secret values
tokens
```

---

### 29.3. `BankConsentDto`

Incluye:

```text id="zeudfn"
id
tenantOpenBankingConfigId
providerKey
providerConsentId
status
scope
consentType
authorizationMethod
termsAcceptedVersion
authorizedAt
expiresAt
renewedAt
revokedAt
revocationReason
failedAt
failureReason sanitizado
createdAt
updatedAt
metadata segura
```

No incluye authorizationUrl completa.

---

### 29.4. `BankConnectionDto`

Incluye:

```text id="dwq7oc"
id
tenantOpenBankingConfigId
bankConsentId
providerKey
providerConnectionId si policy admin lo permite
status
connectionName
institutionName
institutionCode
country
currency
lastSuccessfulSyncAt
lastFailedSyncAt
failureReason sanitizado
authorizedAt
revokedAt
disabledAt
createdAt
updatedAt
metadata segura
```

No incluye:

```text id="ohqu6q"
tokenSecretRef
refreshTokenSecretRef
tokens raw
credenciales bancarias
```

---

### 29.5. `BankAccountLinkDto`

Incluye:

```text id="bswf0z"
id
bankConnectionId
bankAccountId
providerKey
externalAccountName
externalAccountType
accountNumberMasked
currency
status
linkedAt
unlinkedAt
disabledAt
createdAt
updatedAt
metadata segura
```

No incluye:

```text id="fzcxm6"
externalAccountId sin necesidad
externalAccountIdHash
accountNumberHash
full account number
```

---

### 29.6. `OpenBankingSyncRunDto`

Incluye:

```text id="y826hq"
id
bankConnectionId
bankAccountLinkId
providerKey
syncType
status
triggerType
periodStart
periodEnd
startedAt
completedAt
failedAt
cancelledAt
retryOfSyncRunId
retryCount
accountsFound
balancesFound
transactionsFound
transactionsImported
transactionsDuplicated
transactionsRejected
warningsCount
errorCode
errorMessage sanitizado
createdAt
updatedAt
metadata segura
```

No incluye syncCursor si contiene datos técnicos sensibles.

---

### 29.7. `OpenBankingAccountSnapshotDto`

Incluye:

```text id="b0fz2v"
id
bankConnectionId
bankAccountLinkId
bankAccountId
syncRunId
providerKey
availableBalance
currentBalance
currency
snapshotAt
createdAt
metadata segura
```

No incluye externalAccountId salvo permiso administrativo explícito.

---

### 29.8. `OpenBankingTransactionDto`

Incluye:

```text id="vzznma"
id
bankConnectionId
bankAccountLinkId
bankAccountId
syncRunId
providerKey
transactionDate
postedDate
description sanitizada
reference sanitizada
bankReference sanitizada
direction
amount
currency
balanceAfter
transactionType
status
isDuplicate
duplicateOfTransactionId
sentToReconciliationAt
bankTransactionId
createdAt
updatedAt
metadata segura
```

No incluye:

```text id="tsy8l0"
fingerprint
externalTransactionIdHash
external raw payload
full account number
tokens
```

---

### 29.9. `OpenBankingWebhookEventDto`

Incluye:

```text id="cos137"
id
providerKey
tenantOpenBankingConfigId
bankConnectionId
providerEventId
eventType
signatureStatus
processingStatus
receivedAt
processedAt
rejectedAt
failedAt
payloadHashPrefix
providerTimestamp
errorCode
errorMessage sanitizado
retryCount
lastRetryAt
createdAt
updatedAt
metadata segura
```

No incluye:

```text id="od70y1"
payloadHash completo salvo admin técnico
raw payload
raw signature
webhook secret
token
```

---

## 30. Consultas conceptuales

### 30.1. Listar conexiones activas

```sql id="c7g5pq"
SELECT *
FROM bank_connections
WHERE tenant_id = :tenant_id
  AND status = 'active'
  AND archived_at IS NULL
ORDER BY created_at DESC;
```

---

### 30.2. Buscar movimientos importados pendientes de conciliación

```sql id="j81yvd"
SELECT *
FROM open_banking_transactions
WHERE tenant_id = :tenant_id
  AND status = 'imported'
  AND is_duplicate = false
  AND bank_transaction_id IS NULL
ORDER BY transaction_date DESC;
```

---

### 30.3. Detectar duplicado por externalTransactionId

```sql id="e68xu4"
SELECT id
FROM open_banking_transactions
WHERE tenant_id = :tenant_id
  AND provider_key = :provider_key
  AND bank_connection_id = :bank_connection_id
  AND bank_account_link_id = :bank_account_link_id
  AND external_transaction_id_hash = :external_transaction_id_hash
  AND archived_at IS NULL;
```

---

### 30.4. Detectar duplicado por fingerprint

```sql id="pzh445"
SELECT id
FROM open_banking_transactions
WHERE tenant_id = :tenant_id
  AND provider_key = :provider_key
  AND bank_connection_id = :bank_connection_id
  AND bank_account_link_id = :bank_account_link_id
  AND fingerprint = :fingerprint
  AND archived_at IS NULL;
```

---

### 30.5. Reporte de sync status

```sql id="hf6ak0"
SELECT
  bc.id AS bank_connection_id,
  bc.connection_name,
  bc.institution_name,
  bc.status,
  bc.last_successful_sync_at,
  bc.last_failed_sync_at,
  bc.failure_reason
FROM bank_connections bc
WHERE bc.tenant_id = :tenant_id
  AND bc.archived_at IS NULL
ORDER BY bc.updated_at DESC;
```

---

## 31. Reglas de archivo y retención

### 31.1. Soft archive

Ninguna entidad crítica debe eliminarse físicamente en flujo ordinario.

Usar:

```text id="rfhkj9"
archivedAt
archivedBy
archiveReason
```

---

### 31.2. Entidades archivables

```text id="ttoqoh"
OpenBankingProviderDefinition
TenantOpenBankingConfig
BankConsent
BankConnection
BankAccountLink
OpenBankingSyncRun
OpenBankingTransaction
OpenBankingWebhookEvent
```

---

### 31.3. Snapshots

`OpenBankingAccountSnapshot` puede conservarse por política de retención.

No requiere archive en MVP, salvo que se defina purga regulatoria futura.

---

## 32. Integridad con Bank Reconciliation

### 32.1. Flujo de vínculo

```text id="nf8hce"
OpenBankingTransaction
  -> OpenBankingReconciliationBridgeService
      -> BankTransaction
          -> ReconciliationSession
              -> ReconciliationCandidate
                  -> ReconciliationMatch
```

---

### 32.2. Regla de autoridad

```text id="cxmzso"
BankTransaction creado desde OpenBankingTransaction sigue pendiente hasta que Bank Reconciliation lo procese.
```

---

### 32.3. Campos de trazabilidad

En `OpenBankingTransaction`:

```text id="wa9uoj"
bankTransactionId
sentToReconciliationAt
sentToReconciliationBy
```

En `BankTransaction`, si se agrega metadata:

```json id="kn0c68"
{
  "sourceModule": "openBankingIntegration",
  "sourceResourceType": "openBankingTransaction",
  "sourceResourceId": "open_banking_transaction_uuid"
}
```

---

## 33. Integridad con Payments

### 33.1. Regla

```text id="o4nvmx"
OpenBankingTransaction no crea Payment.
```

---

### 33.2. Uso permitido

Open Banking puede ayudar a:

```text id="aeticy"
- identificar posibles depósitos;
- cruzar pagos pendientes de conciliación;
- detectar pagos provider-verified pendientes de bank reconciliation;
- detectar liquidaciones de proveedor;
- alimentar candidatos en Bank Reconciliation.
```

---

## 34. Integridad con Account Statements

### 34.1. Regla

```text id="ubam8d"
Account Statements se derivan de cargos, ajustes, reversos, pagos y asignaciones internas; no de OpenBankingTransaction directamente.
```

---

### 34.2. Uso permitido

Se pueden reportar diferencias entre:

```text id="udonzt"
saldo bancario externo
vs
saldo financiero interno del sistema
```

Pero no mezclarlos como fuente única.

---

## 35. Auditoría vinculada al modelo

### 35.1. Eventos mínimos

```text id="i73edt"
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

```text id="jip0lh"
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

### 35.3. Metadata prohibida

```text id="cyoa3t"
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

## 36. Observabilidad vinculada al modelo

### 36.1. Métricas derivables

```text id="nafq3p"
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

### 36.2. Labels permitidos

```text id="zwc0st"
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

### 36.3. Labels prohibidos

```text id="sf9yt2"
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

## 37. Migración propuesta

### 37.1. Nombre de migración

```text id="vx97ns"
019_create_open_banking_integration
```

---

### 37.2. Contenido de migración

```text id="be9pi6"
1. Crear enums Open Banking.
2. Crear open_banking_provider_definitions.
3. Crear tenant_open_banking_configs.
4. Crear bank_consents.
5. Crear bank_connections.
6. Crear bank_account_links.
7. Crear open_banking_sync_runs.
8. Crear open_banking_account_snapshots.
9. Crear open_banking_transactions.
10. Crear open_banking_webhook_events.
11. Agregar relaciones a modelos existentes si aplica.
12. Extender SourceModule con openBankingIntegration.
13. Crear índices básicos.
14. Crear índices parciales raw.
15. Crear constraints raw.
16. Ejecutar prisma generate.
17. Validar migración en entorno test.
```

---

## 38. Seeds recomendados

Crear seeds ficticios:

```text id="nkrf0m"
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

---

## 39. Datos prohibidos en seeds

```text id="x82988"
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

## 40. Reglas de testing para modelo

### 40.1. Repository tests

Debe probar:

```text id="xpa6c8"
- create provider definition;
- create tenant config;
- create bank consent;
- create bank connection;
- create bank account link;
- create sync run;
- create account snapshot;
- create open banking transaction;
- create webhook event;
- tenant A no ve datos tenant B;
- findFirst con tenantId funciona;
- findUnique por id simple no se usa;
- índices únicos previenen duplicados;
- constraints monetarios funcionan;
- constraints de estado funcionan.
```

---

### 40.2. Security tests

Debe probar:

```text id="h6egv6"
- no tenantId desde body;
- no cross-tenant BankAccountLink;
- no cross-tenant BankTransaction link;
- no raw token persisted;
- no bank username persisted;
- no bank password persisted;
- no full account number persisted;
- no raw payload persisted;
- no raw signature persisted;
- no Payment creado desde OpenBankingTransaction.
```

---

## 41. No aceptación del modelo

El modelo no debe aceptarse si:

```text id="zo1guz"
- omite tenant_id en tablas operativas;
- permite config cross-tenant;
- permite consent cross-tenant;
- permite connection cross-tenant;
- permite account link cross-tenant;
- permite sync run cross-tenant;
- permite transaction cross-tenant;
- permite webhook event cross-tenant;
- vincula external account con BankAccount tenant B;
- acepta tenantId desde body;
- favorece findUnique por id simple;
- almacena usuario bancario;
- almacena contraseña bancaria;
- almacena OTP;
- almacena MFA secret;
- almacena tokens raw;
- expone SecretRefs en DTO no autorizado;
- expone número completo de cuenta;
- expone raw provider payload;
- expone raw webhook signature;
- permite iniciación de pagos en MVP;
- permite crear Payment automáticamente desde movimiento Open Banking;
- permite marcar conciliación bancaria final automáticamente;
- permite duplicar movimientos por retry;
- permite duplicate como conciliable;
- permite sync sin consentimiento vigente;
- permite sync con connection revoked/disabled;
- rompe Bank Reconciliation;
- rompe Payments;
- rompe Account Statements;
- rompe Secure Document Storage;
- omite auditoría financiera crítica.
```

---

## 42. Resultado esperado

Este modelo de datos debe permitir implementar `019-open-banking-integration` como módulo financiero seguro y extensible.

Resultado esperado:

```text id="vb6jii"
- provider definitions Open Banking platform-scoped;
- tenant Open Banking configs tenant-scoped;
- SecretRef para credenciales y tokens;
- BankConsent explícito;
- BankConnection autorizada;
- BankAccountLink entre cuenta externa e interna;
- OpenBankingSyncRun auditable;
- OpenBankingAccountSnapshot para saldos externos;
- OpenBankingTransaction normalizado y deduplicado;
- OpenBankingWebhookEvent verificable e idempotente;
- trazabilidad hacia Bank Reconciliation;
- no creación automática de Payment;
- no actualización directa de Account Statements;
- no iniciación de pagos bancarios;
- no credenciales bancarias almacenadas;
- no tokens raw;
- no endpoints públicos;
- base lista para API Contract, Test Plan, Tasks y Security Notes.
```

---

## 43. Expediente actualizado

```text id="n3m25a"
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
│   │       └── data-model.md
```
