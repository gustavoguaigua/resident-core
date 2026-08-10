# Technical Plan — 025 Tenant Settings and Policies

## 1. Información del documento

| Campo                 | Valor                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                 |
| Spec ID               | 025                                                                                           |
| Módulo                | Tenant Settings and Policies                                                                  |
| Documento             | Technical Plan                                                                                |
| Ruta                  | `docs/specs/025-tenant-settings-policies/plan.md`                                             |
| Versión               | 0.1                                                                                           |
| Estado                | needs-review                                                                                  |
| Fecha                 | 2026-07-31                                                                                    |
| Documento base        | `docs/specs/025-tenant-settings-policies/spec.md`                                             |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                |
| Naturaleza            | Tenant-scoped / Configuration-governed / Policy-driven / Versioned / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el plan técnico de implementación del módulo `025-tenant-settings-policies`.

El módulo será la fuente interna de configuración y políticas operativas por tenant. Permitirá definir settings, policy definitions, versiones de políticas, activaciones, excepciones, historial, lectura efectiva, exportaciones y summaries visibles para residentes.

Regla central técnica:

```text id="tsp-plan-rule"
Tenant Settings and Policies debe implementarse como un módulo transversal, tenant-scoped, versionado, audit-heavy y no público, capaz de resolver configuración efectiva para otros módulos sin ejecutar sus acciones transaccionales, sin almacenar secretos, sin aceptar scripts o código ejecutable, sin exponer configuración sensible en /me, sin acceso desde WordPress público, sin crear pagos, sin crear asientos contables, sin confirmar conciliaciones, sin modificar datos operativos de otros módulos y sin enviar datos reales a IA externa.
```

---

## 3. Decisión técnica principal

```text id="tsp-main-decision"
Implementar Tenant Settings and Policies como un módulo NestJS independiente dentro del monolito modular, con definitions globales controladas por PlatformAdmin, values y policy versions tenant-scoped, validación por schema, lectura efectiva cacheable, versionamiento de políticas críticas, activaciones auditadas, excepciones con vigencia, puertos internos para módulos consumidores y API REST privada.
```

---

## 4. Nombre técnico del módulo

```text id="tsp-module-name"
tenant-settings-policies
```

Ruta sugerida:

```text id="tsp-module-path"
apps/api/src/modules/tenant-settings-policies/
```

Clase principal:

```typescript id="tsp-module-class"
export class TenantSettingsPoliciesModule {}
```

---

## 5. Clasificación arquitectónica

```text id="tsp-architecture-classification"
Tipo: Core supporting module
Nivel: Cross-cutting domain module
Persistencia: Propia
Exposición externa: API privada autenticada
Exposición pública: No
Exposición WordPress pública: No
Consumo interno: Sí, mediante puertos/application services
Preparación microservicios: Sí
```

Este módulo debe considerarse transversal porque varios módulos de RESIDENT Core consultarán settings y policies efectivas para aplicar reglas de negocio propias.

---

## 6. Alcance técnico MVP

### 6.1. Incluido

```text id="tsp-plan-scope-in"
- Módulo NestJS dedicado.
- Catálogo de setting definitions.
- Catálogo de policy definitions.
- Tenant setting values.
- Tenant policy versions.
- Tenant policy activations.
- Tenant policy exceptions.
- Tenant settings change log.
- Tenant settings exports.
- Validación por schema.
- Versionamiento de políticas.
- Activación inmediata o programada.
- Resolución de settings efectivos.
- Resolución de policies efectivas.
- Consulta histórica por effectiveAt.
- Cache de lectura efectiva.
- Invalidación de cache tras cambios.
- Summaries /me residentVisible.
- Exportaciones vía Secure Document Storage.
- Auditoría obligatoria.
- Observabilidad segura.
- API REST privada.
- OpenAPI con extensiones de seguridad.
```

---

### 6.2. Fuera de alcance técnico MVP

```text id="tsp-plan-scope-out"
- Motor de reglas avanzado.
- DSL ejecutable.
- Scripting configurable.
- JavaScript por tenant.
- SQL configurable.
- Webhooks configurables.
- Automatizaciones destructivas.
- Secrets manager.
- Almacenamiento de credenciales.
- Feature flags comerciales avanzados.
- Workflow multi-firma complejo.
- Firma electrónica legal.
- Simulador avanzado de impacto.
- Recalculo transaccional automático.
- Publicación pública en WordPress.
- IA externa con datos reales.
```

---

## 7. Dependencias del módulo

### 7.1. Dependencias internas obligatorias

| Módulo                        | Uso                                                  |
| ----------------------------- | ---------------------------------------------------- |
| `001-tenants`                 | Validar tenant, estado y tenant isolation            |
| `002-users-roles`             | Resolver actor, permisos y aprobadores               |
| `007-audit`                   | Registrar cambios críticos y lecturas sensibles      |
| `016-secure-document-storage` | Almacenar exportaciones                              |
| `008-basic-reports`           | Integración conceptual para reportes administrativos |

---

### 7.2. Módulos consumidores

```text id="tsp-consumer-modules-plan"
004-dues-fees
005-payments
006-account-statements
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
016-secure-document-storage
017-bank-reconciliation
020-accounting-ledger
021-supplier-payments
022-maintenance-work-orders
023-inventory-basic
024-access-control-visitors
```

Regla:

```text id="tsp-consumer-plan-rule"
Los módulos consumidores consultan settings y policies efectivas, pero ejecutan sus propias reglas, validaciones, transacciones, auditoría específica y estados de dominio.
```

---

## 8. Estructura técnica propuesta

```text id="tsp-folder-structure"
apps/api/src/modules/tenant-settings-policies/
├── tenant-settings-policies.module.ts
├── tenant-settings-policies.config.ts
├── tenant-settings-policies.constants.ts
├── controllers/
│   ├── tenant-settings.controller.ts
│   ├── tenant-policies.controller.ts
│   ├── tenant-policy-exceptions.controller.ts
│   ├── tenant-settings-history.controller.ts
│   ├── tenant-settings-exports.controller.ts
│   ├── me-tenant-policy-summaries.controller.ts
│   ├── platform-setting-definitions.controller.ts
│   └── platform-policy-definitions.controller.ts
├── application/
│   ├── services/
│   │   ├── tenant-settings.service.ts
│   │   ├── tenant-policies.service.ts
│   │   ├── effective-policy.service.ts
│   │   ├── policy-activation.service.ts
│   │   ├── policy-exception.service.ts
│   │   ├── policy-comparison.service.ts
│   │   ├── tenant-settings-export.service.ts
│   │   └── tenant-settings-cache.service.ts
│   ├── use-cases/
│   │   ├── update-tenant-setting.use-case.ts
│   │   ├── schedule-tenant-setting.use-case.ts
│   │   ├── create-policy-version.use-case.ts
│   │   ├── submit-policy-version-review.use-case.ts
│   │   ├── approve-policy-version.use-case.ts
│   │   ├── reject-policy-version.use-case.ts
│   │   ├── activate-policy-version.use-case.ts
│   │   ├── schedule-policy-activation.use-case.ts
│   │   ├── rollback-policy-activation.use-case.ts
│   │   ├── create-policy-exception.use-case.ts
│   │   ├── approve-policy-exception.use-case.ts
│   │   ├── revoke-policy-exception.use-case.ts
│   │   ├── resolve-effective-setting.use-case.ts
│   │   ├── resolve-effective-policy.use-case.ts
│   │   └── export-settings-policies.use-case.ts
│   └── ports/
│       ├── tenant-settings-audit.port.ts
│       ├── tenant-settings-document-storage.port.ts
│       ├── tenant-settings-tenants.port.ts
│       ├── tenant-settings-users.port.ts
│       └── tenant-settings-policy-consumer.port.ts
├── domain/
│   ├── entities/
│   │   ├── setting-definition.entity.ts
│   │   ├── tenant-setting-value.entity.ts
│   │   ├── policy-definition.entity.ts
│   │   ├── tenant-policy-version.entity.ts
│   │   ├── tenant-policy-activation.entity.ts
│   │   ├── tenant-policy-exception.entity.ts
│   │   ├── tenant-settings-change-log.entity.ts
│   │   └── tenant-settings-export.entity.ts
│   ├── value-objects/
│   │   ├── setting-key.vo.ts
│   │   ├── policy-key.vo.ts
│   │   ├── policy-version-number.vo.ts
│   │   ├── policy-payload.vo.ts
│   │   ├── setting-value.vo.ts
│   │   ├── effective-window.vo.ts
│   │   ├── change-reason.vo.ts
│   │   └── policy-category.vo.ts
│   ├── events/
│   ├── policies/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-setting-definition.repository.ts
│   │   ├── prisma-tenant-setting-value.repository.ts
│   │   ├── prisma-policy-definition.repository.ts
│   │   ├── prisma-tenant-policy-version.repository.ts
│   │   ├── prisma-policy-activation.repository.ts
│   │   ├── prisma-policy-exception.repository.ts
│   │   ├── prisma-change-log.repository.ts
│   │   └── prisma-settings-export.repository.ts
│   ├── cache/
│   │   └── redis-effective-policy-cache.adapter.ts
│   ├── documents/
│   │   └── secure-document-storage-settings.adapter.ts
│   ├── audit/
│   │   └── audit-tenant-settings.adapter.ts
│   ├── tenants/
│   │   └── tenants-settings.adapter.ts
│   ├── users/
│   │   └── users-settings.adapter.ts
│   ├── validation/
│   │   ├── json-schema-policy-validator.ts
│   │   └── setting-value-validator.ts
│   ├── reports/
│   └── observability/
├── dto/
├── guards/
├── mappers/
├── schemas/
├── seeds/
└── tests/
```

---

## 9. Componentes principales

### 9.1. Controllers

| Controller                             | Responsabilidad                                                           |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `TenantSettingsController`             | Consultar, actualizar, programar y archivar settings de tenant            |
| `TenantPoliciesController`             | Gestionar policy versions, revisión, aprobación, activación y comparación |
| `TenantPolicyExceptionsController`     | Gestionar excepciones con vigencia                                        |
| `TenantSettingsHistoryController`      | Consultar historial y change log                                          |
| `TenantSettingsExportsController`      | Exportar settings/policies vía SDS                                        |
| `MeTenantPolicySummariesController`    | Exponer summaries visibles a residentes                                   |
| `PlatformSettingDefinitionsController` | Gestionar definitions globales de settings                                |
| `PlatformPolicyDefinitionsController`  | Gestionar definitions globales de policies                                |

---

### 9.2. Application services

```text id="tsp-application-services"
TenantSettingsService:
  - lectura y actualización de setting values.

TenantPoliciesService:
  - gestión de versiones de políticas.

EffectivePolicyService:
  - resolución de setting/policy vigente por tenant, key y effectiveAt.

PolicyActivationService:
  - activación, programación y rollback lógico.

PolicyExceptionService:
  - creación, aprobación, revocación y evaluación de excepciones.

PolicyComparisonService:
  - comparación sanitizada entre versiones.

TenantSettingsExportService:
  - exportaciones administrativas vía SDS.

TenantSettingsCacheService:
  - cache e invalidación de settings/policies efectivos.
```

---

### 9.3. Domain entities

```text id="tsp-domain-entities"
SettingDefinition
TenantSettingValue
PolicyDefinition
TenantPolicyVersion
TenantPolicyActivation
TenantPolicyException
TenantSettingsChangeLog
TenantSettingsExport
```

---

### 9.4. Value objects

```text id="tsp-value-objects"
SettingKey
PolicyKey
PolicyCategory
OwnerModule
SettingValue
PolicyPayload
PolicyVersionNumber
EffectiveWindow
ChangeReason
ApprovalReason
ExceptionTarget
ExportFilter
```

---

### 9.5. Domain policies

```text id="tsp-domain-policies"
TenantSettingsIsolationPolicy
SettingDefinitionPolicy
TenantSettingValuePolicy
TenantPolicyDefinitionPolicy
TenantPolicyVersionPolicy
TenantPolicyActivationPolicy
TenantPolicyExceptionPolicy
EffectivePolicyResolutionPolicy
SensitivePolicyApprovalPolicy
NoRetroactiveChangePolicy
NoExecutablePolicyPayloadPolicy
NoSecretsInSettingsPolicy
NoPublicExposurePolicy
NoWordPressAccessPolicy
NoTransactionalSideEffectsPolicy
NoExternalAiRealDataPolicy
```

---

## 10. Modelo de datos técnico preliminar

El modelo formal se detallará en `data-model.md`.

Tablas esperadas:

```text id="tsp-plan-tables"
setting_definitions
tenant_setting_values
policy_definitions
tenant_policy_versions
tenant_policy_activations
tenant_policy_exceptions
tenant_settings_change_logs
tenant_settings_exports
```

---

### 10.1. Tablas platform/global

Estas tablas no son tenant-scoped, pero son controladas por PlatformAdmin:

```text id="tsp-platform-tables"
setting_definitions
policy_definitions
```

Reglas:

```text id="tsp-platform-table-rules"
- No almacenan secretos.
- No almacenan valores reales por tenant.
- Contienen defaults seguros.
- Cambios requieren permisos platform.
- Cambios se auditan.
```

---

### 10.2. Tablas tenant-scoped

Estas tablas siempre incluyen `tenant_id`:

```text id="tsp-tenant-tables"
tenant_setting_values
tenant_policy_versions
tenant_policy_activations
tenant_policy_exceptions
tenant_settings_change_logs
tenant_settings_exports
```

Regla:

```text id="tsp-tenant-table-rule"
Toda consulta, actualización, activación, excepción, historial o exportación tenant-scoped debe filtrar por tenant_id.
```

---

## 11. Estrategia de multitenancy

### 11.1. Patrón obligatorio

```typescript id="tsp-tenant-pattern"
await prisma.tenantPolicyVersion.findFirst({
  where: {
    id: policyVersionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 11.2. Patrón prohibido

```typescript id="tsp-tenant-forbidden-pattern"
await prisma.tenantPolicyVersion.findUnique({
  where: {
    id: policyVersionId
  }
});
```

---

### 11.3. Respuesta cross-tenant

```http id="tsp-cross-tenant-response"
404 Not Found
```

Regla:

```text id="tsp-cross-tenant-rule"
No usar 403 para recursos cross-tenant cuando pueda revelar existencia de configuraciones o políticas de otro tenant.
```

---

## 12. Estrategia de definitions

### 12.1. Setting definitions

Cada setting conocido debe declararse con:

```text id="tsp-setting-definition-fields"
key
category
valueType
defaultValue
allowedValues
schema
sensitivity
isTenantOverridable
isRuntimeCritical
requiresRestart
status
```

---

### 12.2. Policy definitions

Cada policy debe declararse con:

```text id="tsp-policy-definition-fields"
policyKey
category
ownerModule
schema
defaultPolicy
criticality
sensitivity
isTenantOverridable
versioningRequired
approvalRequired
residentVisible
status
```

---

### 12.3. Ubicación de schemas

Los schemas iniciales deben almacenarse en:

```text id="tsp-schema-location"
apps/api/src/modules/tenant-settings-policies/schemas/
```

Estructura sugerida:

```text id="tsp-schema-tree"
schemas/
├── general/
├── financial/
├── reservations/
├── fines/
├── meetings/
├── voting/
├── communications/
├── documents/
├── access-control/
├── maintenance/
├── inventory/
├── suppliers/
├── reports/
├── privacy/
└── security/
```

---

## 13. Estrategia de validación

### 13.1. Value validation

Usar validación explícita por tipo:

```text id="tsp-value-types"
string
number
integer
boolean
decimalString
date
time
duration
enum
stringArray
object
json
```

---

### 13.2. Schema validation

Para `policyPayload` y settings complejos se usará JSON Schema.

Reglas:

```text id="tsp-schema-validation-rules"
- Todo payload debe validar contra schema.
- Todo schema debe estar versionado.
- No se permite additionalProperties=true sin revisión.
- No se permiten campos de secretos.
- No se permiten campos ejecutables.
- No se permite rawSql.
- No se permite script/functionBody/executableCode.
```

---

### 13.3. Sanitización

Antes de persistir `value`, `policyPayload`, `oldValueSanitized`, `newValueSanitized` o `filters`, se debe aplicar:

```text id="tsp-sanitization-rules"
- eliminación de secretos;
- rechazo de claves prohibidas;
- rechazo de scripts;
- rechazo de raw SQL;
- normalización de enums;
- validación de longitud;
- validación de objetos JSON;
- sanitización de textos libres.
```

---

## 14. Estrategia de versionamiento

### 14.1. Policy version lifecycle

```text id="tsp-policy-lifecycle"
draft
  -> reviewReady
  -> approved
  -> scheduled
  -> active
  -> superseded
  -> expired
  -> archived
```

Estados alternos:

```text id="tsp-policy-lifecycle-alt"
reviewReady -> rejected
approved -> archived
scheduled -> archived
active -> superseded
active -> expired
```

---

### 14.2. Reglas

```text id="tsp-versioning-rules"
- versionNumber se genera server-side.
- Una active no se edita destructivamente.
- Todo cambio sobre active crea nueva versión.
- Una draft puede editarse.
- Una reviewReady solo puede modificarse regresando a draft o rechazando.
- Una approved puede activarse o programarse.
- Una scheduled se activa cuando llega effectiveFrom.
- Una superseded conserva historial.
- Una archived no se consume.
```

---

### 14.3. Generación de versionNumber

Formato sugerido:

```text id="tsp-version-number"
v{major}.{minor}
```

Ejemplo:

```text id="tsp-version-example"
v1.0
v1.1
v2.0
```

Regla MVP:

```text id="tsp-version-number-mvp"
En MVP, versionNumber puede ser incremental entero por tenant + policyKey y exponerse como v1, v2, v3 para simplificar implementación.
```

---

## 15. Estrategia de activación

### 15.1. Activación inmediata

```text id="tsp-activation-now"
effectiveFrom <= now()
```

Reglas:

```text id="tsp-activation-now-rules"
- Requiere policy approved o activable.
- Crea TenantPolicyActivation.
- Marca versión como active.
- Ajusta vigencia de versión anterior.
- Invalida cache.
- Audita.
```

---

### 15.2. Activación futura

```text id="tsp-activation-future"
effectiveFrom > now()
```

Reglas:

```text id="tsp-activation-future-rules"
- Marca versión como scheduled.
- Crea TenantPolicyActivation scheduled.
- No afecta resolución efectiva actual.
- Un job interno activa cuando llegue effectiveFrom.
- Invalida cache al activar.
```

---

### 15.3. Rollback

En MVP, rollback no modifica datos históricos.

```text id="tsp-rollback-rule"
Rollback crea una nueva activación hacia una versión anterior permitida o crea una nueva versión equivalente, pero nunca borra activaciones ni altera historial.
```

---

## 16. Estrategia de effective dating

### 16.1. Consulta efectiva actual

```text id="tsp-effective-current"
resolveEffectivePolicy(tenantId, policyKey, now)
```

---

### 16.2. Consulta efectiva histórica

```text id="tsp-effective-historical"
resolveEffectivePolicy(tenantId, policyKey, effectiveAt)
```

Reglas:

```text id="tsp-effective-rules"
- Buscar versión active/superseded/expired cuya vigencia cubra effectiveAt.
- Si no existe tenant override, usar defaultPolicy.
- Devolver source = tenantOverride | platformDefault.
- Devolver policyVersionId si aplica.
- No devolver drafts.
- No devolver archived.
```

---

### 16.3. Vigencia sin superposición

Debe evitarse:

```text id="tsp-overlap-forbidden"
tenantId + policyKey + effective window superpuesta en versiones activas
```

---

## 17. Estrategia de excepciones

### 17.1. Excepciones soportadas MVP

```text id="tsp-exception-types"
temporaryOverride
resourceOverride
userRoleOverride
unitOverride
manualAdministrativeOverride
```

---

### 17.2. Target

```text id="tsp-exception-targets"
targetResourceType
targetResourceId
```

Ejemplos:

```text id="tsp-exception-examples"
propertyUnit
commonArea
visitorAuthorization
maintenanceWorkOrder
inventoryItem
supplier
```

---

### 17.3. Reglas

```text id="tsp-exception-rules"
- Excepción siempre tenant-scoped.
- Excepción requiere reason.
- Excepción requiere validFrom y validUntil.
- Excepción sensible requiere aprobación.
- Excepción no puede ser global multi-tenant.
- Excepción expired o revoked no aplica.
- Módulo consumidor decide cómo aplicar la excepción.
```

---

## 18. Estrategia de cache

### 18.1. Tecnología

```text id="tsp-cache-tech"
In-memory cache inicial + Redis opcional/progresivo
```

En el stack objetivo general existe Redis. Para MVP se puede iniciar con cache in-memory si el despliegue es monolito simple, pero la interfaz debe soportar Redis.

---

### 18.2. Cache keys

```text id="tsp-cache-keys"
tenant:{tenantId}:setting:{key}:effective:{effectiveAtBucket}
tenant:{tenantId}:policy:{policyKey}:effective:{effectiveAtBucket}
tenant:{tenantId}:policy-exception:{policyKey}:{targetResourceType}:{targetResourceId}:{effectiveAtBucket}
```

---

### 18.3. Reglas

```text id="tsp-cache-rules"
- Cache no debe incluir secretos.
- Cache debe ser tenant-scoped.
- Cache key no debe exponerse por API.
- Cache se invalida por setting update.
- Cache se invalida por policy activation.
- Cache se invalida por exception approval/revoke.
- TTL conservador.
- Ante falla de cache, fallback a DB/defaults seguros.
```

---

### 18.4. Invalidación

Eventos que invalidan cache:

```text id="tsp-cache-invalidators"
tenantSetting.updated
tenantSetting.activated
tenantPolicyVersion.activated
tenantPolicyActivation.created
tenantPolicyException.approved
tenantPolicyException.revoked
tenantPolicyDefinition.updated
settingDefinition.updated
```

---

## 19. Estrategia de API

### 19.1. Base path

```text id="tsp-base-path"
/api/v1
```

---

### 19.2. Tenant Admin API

```text id="tsp-tenant-api-plan"
/api/v1/tenant/settings
/api/v1/tenant/policies
/api/v1/tenant/policy-exceptions
/api/v1/tenant/settings-history
/api/v1/tenant/policy-history
/api/v1/tenant/settings-policies/export
```

---

### 19.3. Platform API

```text id="tsp-platform-api-plan"
/api/v1/platform/setting-definitions
/api/v1/platform/policy-definitions
```

---

### 19.4. `/me` API

```text id="tsp-me-api-plan"
/api/v1/me/tenant-policy-summaries
```

---

### 19.5. Public API prohibida

No implementar:

```text id="tsp-public-api-forbidden"
/api/v1/public/tenant-settings
/api/v1/public/tenant-policies
/api/v1/public/tenants/{slug}/settings
/api/v1/public/tenants/{slug}/policies
```

Respuesta esperada:

```http id="tsp-public-api-response"
404 Not Found
```

---

## 20. DTO strategy

### 20.1. DTOs principales

```text id="tsp-dtos"
CreateSettingDefinitionDto
UpdateSettingDefinitionDto
ArchiveSettingDefinitionDto

UpdateTenantSettingDto
ScheduleTenantSettingDto
ArchiveTenantSettingDto

CreatePolicyDefinitionDto
UpdatePolicyDefinitionDto
ArchivePolicyDefinitionDto

CreateTenantPolicyVersionDto
UpdateTenantPolicyVersionDto
SubmitPolicyVersionReviewDto
ApprovePolicyVersionDto
RejectPolicyVersionDto
ActivatePolicyVersionDto
SchedulePolicyVersionDto
ArchivePolicyVersionDto

CreatePolicyExceptionDto
ApprovePolicyExceptionDto
RevokePolicyExceptionDto
ArchivePolicyExceptionDto

ComparePolicyVersionsQueryDto
ResolveEffectivePolicyQueryDto
TenantSettingsExportDto
```

---

### 20.2. Campos prohibidos

Todo DTO externo debe rechazar:

```text id="tsp-plan-forbidden-dto"
tenantId
createdBy
updatedBy
activatedBy
approvedBy
reviewedBy
rejectedBy
archivedBy
status directo fuera de endpoint de transición
versionNumber
secureDocumentStorageKey
storageKey
signedUrl
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
rawSql
script
javascript
functionBody
executableCode
cronCommand
shellCommand
paymentId
journalEntryId
bankTransactionId
reconciliationMatchId
externalAiEnabled
externalAiRealDataAllowed
```

---

### 20.3. DTO mapping seguro

Prohibido:

```typescript id="tsp-dto-map-forbidden"
const data = { ...dto };
await prisma.tenantSettingValue.create({ data });
```

Permitido:

```typescript id="tsp-dto-map-safe"
const command = UpdateTenantSettingCommand.fromDto(dto, {
  tenantId: currentTenant.id,
  actorUserProfileId: currentUser.id,
  traceId: requestContext.traceId
});
```

---

## 21. Guards

### 21.1. Guards obligatorios

```text id="tsp-guards"
AuthGuard
TenantGuard
PermissionGuard
SensitivePermissionGuard
PlatformPermissionGuard
OwnPolicySummaryGuard
InternalPolicyConsumerGuard
```

---

### 21.2. Uso por superficie

| Superficie                  | Guards                                                            |
| --------------------------- | ----------------------------------------------------------------- |
| Tenant Admin API            | AuthGuard, TenantGuard, PermissionGuard                           |
| Sensitive tenant operations | AuthGuard, TenantGuard, PermissionGuard, SensitivePermissionGuard |
| Platform API                | AuthGuard, PlatformPermissionGuard                                |
| `/me` summaries             | AuthGuard, TenantGuard, OwnPolicySummaryGuard                     |
| Internal service port       | InternalPolicyConsumerGuard o boundary interno                    |

---

## 22. Permisos

### 22.1. Permisos tenant

```text id="tsp-plan-permissions"
tenantSettings.read
tenantSettings.update
tenantSettings.archive
tenantSettings.export

tenantPolicies.read
tenantPolicies.createVersion
tenantPolicies.updateDraft
tenantPolicies.submitReview
tenantPolicies.review
tenantPolicies.approve
tenantPolicies.reject
tenantPolicies.activate
tenantPolicies.scheduleActivation
tenantPolicies.rollback
tenantPolicies.archive

tenantPolicyExceptions.read
tenantPolicyExceptions.create
tenantPolicyExceptions.approve
tenantPolicyExceptions.reject
tenantPolicyExceptions.revoke
tenantPolicyExceptions.archive

tenantPolicyHistory.read
tenantPolicyEffective.read

tenantPolicySummaries.own.read
```

---

### 22.2. Permisos platform

```text id="tsp-platform-permissions"
platformSettingDefinitions.read
platformSettingDefinitions.create
platformSettingDefinitions.update
platformSettingDefinitions.archive

platformPolicyDefinitions.read
platformPolicyDefinitions.create
platformPolicyDefinitions.update
platformPolicyDefinitions.archive
```

---

### 22.3. Permisos sensibles

```text id="tsp-plan-sensitive-permissions"
tenantPolicies.activateSensitive
tenantPolicies.activateRetroactive
tenantPolicies.approveSensitive
tenantPolicyExceptions.approveSensitive
tenantSettings.updateSecurity
tenantSettings.updatePrivacy
tenantSettings.updateFinancial
tenantSettings.exportSensitive
```

---

## 23. Integraciones técnicas

### 23.1. Tenants port

```typescript id="tsp-tenants-port"
export interface TenantSettingsTenantsPort {
  validateTenantIsActive(tenantId: string): Promise<void>;
  getTenantOperationalSummary(tenantId: string): Promise<TenantOperationalSummary>;
}
```

---

### 23.2. Users port

```typescript id="tsp-users-port"
export interface TenantSettingsUsersPort {
  getActorProfile(userProfileId: string): Promise<ActorProfile>;
  validateApprover(tenantId: string, userProfileId: string, permission: string): Promise<void>;
}
```

---

### 23.3. Audit port

```typescript id="tsp-audit-port"
export interface TenantSettingsAuditPort {
  record(event: TenantSettingsAuditEvent): Promise<void>;
}
```

---

### 23.4. Secure Document Storage port

```typescript id="tsp-sds-port"
export interface TenantSettingsDocumentStoragePort {
  createExportDocument(input: CreateSettingsExportDocumentInput): Promise<{
    secureDocumentId: string;
  }>;
}
```

---

### 23.5. Effective policy internal port

```typescript id="tsp-effective-port"
export interface TenantPolicyResolverPort {
  resolveEffectiveSetting<T>(
    tenantId: string,
    key: string,
    effectiveAt?: Date
  ): Promise<EffectiveSetting<T>>;

  resolveEffectivePolicy<T>(
    tenantId: string,
    policyKey: string,
    effectiveAt?: Date,
    context?: PolicyResolutionContext
  ): Promise<EffectivePolicy<T>>;
}
```

---

## 24. Límites explícitos de dominio

### 24.1. No transacciones de otros módulos

Prohibido:

```text id="tsp-no-transaction-side-effects"
- crear Charges;
- crear Payments;
- crear PaymentAllocations;
- crear SupplierPayables;
- crear SupplierPaymentOrders;
- crear JournalEntries;
- confirmar Bank Reconciliation;
- crear Reservations;
- crear Fines;
- crear WorkOrders;
- modificar Stock;
- abrir accesos físicos;
- modificar AccessEvents;
```

---

### 24.2. No secretos

Prohibido almacenar:

```text id="tsp-no-secrets"
password
token
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
storageKey
signedUrl persistente
bank credentials
provider credentials
OIDC client secret
```

Regla:

```text id="tsp-secret-rule"
Si una configuración futura requiere secretos, debe usar un secrets manager externo y solo almacenar referencia opaca no sensible, previa ADR.
```

---

### 24.3. No código ejecutable

Prohibido:

```text id="tsp-no-executable"
rawSql
script
javascript
functionBody
executableCode
cronCommand
shellCommand
dynamicExpressionUnsafe
```

---

## 25. Estrategia de exportaciones

### 25.1. Export types

```text id="tsp-export-types"
settings
policies
policyHistory
policyExceptions
fullAdministrativeSnapshot
```

---

### 25.2. Formatos

```text id="tsp-export-formats"
json
xlsx
pdf
```

MVP recomendado:

```text id="tsp-export-mvp-format"
json + xlsx
```

---

### 25.3. Reglas

```text id="tsp-export-rules-plan"
- Export requiere permiso.
- Export sensible requiere permiso reforzado.
- Export requiere reason si contiene policies sensibles.
- Export usa Secure Document Storage.
- Response devuelve secureDocumentId.
- Response no devuelve storageKey.
- Export no incluye secretos.
- Export no incluye tokens.
- Export no incluye scripts.
- Export se audita.
```

---

## 26. Auditoría técnica

### 26.1. Eventos obligatorios

```text id="tsp-plan-audit-events"
tenantSetting.created
tenantSetting.updated
tenantSetting.scheduled
tenantSetting.activated
tenantSetting.expired
tenantSetting.archived

tenantPolicyDefinition.created
tenantPolicyDefinition.updated
tenantPolicyDefinition.archived

tenantPolicyVersion.created
tenantPolicyVersion.updated
tenantPolicyVersion.submittedForReview
tenantPolicyVersion.approved
tenantPolicyVersion.rejected
tenantPolicyVersion.scheduled
tenantPolicyVersion.activated
tenantPolicyVersion.superseded
tenantPolicyVersion.expired
tenantPolicyVersion.archived

tenantPolicyActivation.created
tenantPolicyActivation.rollbackCreated

tenantPolicyException.created
tenantPolicyException.approved
tenantPolicyException.rejected
tenantPolicyException.activated
tenantPolicyException.expired
tenantPolicyException.revoked
tenantPolicyException.archived

tenantSettings.exported
tenantPolicyEffective.readSensitive
```

---

### 26.2. Metadata permitida

```text id="tsp-plan-audit-allowed"
settingKey
policyKey
category
ownerModule
versionNumber
settingValueId
policyVersionId
policyActivationId
policyExceptionId
effectiveFrom
effectiveUntil
source
reason
exportType
format
traceId
```

---

### 26.3. Metadata prohibida

```text id="tsp-plan-audit-forbidden"
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
storageKey
signedUrl
rawSql
script
functionBody
executableCode
raw payload sensible
datos cross-tenant
```

---

## 27. Observabilidad técnica

### 27.1. Logs permitidos

```text id="tsp-plan-logs"
tenantSetting.updated
tenantPolicyVersion.created
tenantPolicyVersion.approved
tenantPolicyVersion.activated
tenantPolicyException.created
tenantPolicyException.revoked
tenantSettings.exported
effectivePolicy.cacheHit
effectivePolicy.cacheMiss
effectivePolicy.cacheInvalidated
```

---

### 27.2. Métricas

```text id="tsp-plan-metrics"
tenant_settings_updates_total
tenant_policy_versions_created_total
tenant_policy_activations_total
tenant_policy_exceptions_total
tenant_settings_exports_total
tenant_policy_cache_hits_total
tenant_policy_cache_misses_total
tenant_policy_cache_invalidations_total
```

---

### 27.3. Labels permitidos

```text id="tsp-plan-metric-labels-allowed"
category
ownerModule
status
outcome
source
```

---

### 27.4. Labels prohibidos

```text id="tsp-plan-metric-labels-forbidden"
tenantId
userId
settingValueId
policyVersionId
policyExceptionId
traceId
secretKey
```

---

## 28. OpenAPI strategy

### 28.1. Tags

```text id="tsp-openapi-tags"
Tenant Settings
Tenant Policies
Tenant Policy Exceptions
Tenant Settings History
Tenant Settings Exports
Me Tenant Policy Summaries
Platform Setting Definitions
Platform Policy Definitions
```

---

### 28.2. Extensiones globales

```yaml id="tsp-openapi-extensions"
x-tenant-scope: true
x-auth-required: true
x-tenant-settings-policies: true
x-public-exposure: false
x-wordpress-access: false
x-secrets-storage: false
x-executable-policy-payload: false
x-transactional-side-effects: false
x-external-ai-real-data: false
```

---

### 28.3. Rutas platform

```yaml id="tsp-openapi-platform"
x-platform-scope: true
x-platform-admin-required: true
```

---

### 28.4. Rutas `/me`

```yaml id="tsp-openapi-me"
x-own-resource-scope: true
x-resident-visible-summary-only: true
x-sensitive-settings-exposed: false
```

---

### 28.5. Rutas de exportación

```yaml id="tsp-openapi-export"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

## 29. Configuración y feature flags

### 29.1. Variables recomendadas

```text id="tsp-env-vars"
TENANT_SETTINGS_POLICIES_ENABLED=true
TENANT_SETTINGS_CACHE_ENABLED=true
TENANT_SETTINGS_REDIS_CACHE_ENABLED=false
TENANT_SETTINGS_EXPORT_ENABLED=true
TENANT_SETTINGS_PUBLIC_ENDPOINTS_ENABLED=false
TENANT_SETTINGS_WORDPRESS_ACCESS_ENABLED=false
TENANT_SETTINGS_EXECUTABLE_POLICIES_ENABLED=false
TENANT_SETTINGS_SECRET_STORAGE_ENABLED=false
TENANT_SETTINGS_EXTERNAL_AI_ENABLED=false
TENANT_SETTINGS_RETROACTIVE_ACTIVATION_ENABLED=false
```

---

### 29.2. Boot validation

El boot debe fallar si:

```text id="tsp-boot-validation"
TENANT_SETTINGS_PUBLIC_ENDPOINTS_ENABLED=true
TENANT_SETTINGS_WORDPRESS_ACCESS_ENABLED=true
TENANT_SETTINGS_EXECUTABLE_POLICIES_ENABLED=true
TENANT_SETTINGS_SECRET_STORAGE_ENABLED=true
TENANT_SETTINGS_EXTERNAL_AI_ENABLED=true
```

Para retroactividad:

```text id="tsp-retroactive-flag"
TENANT_SETTINGS_RETROACTIVE_ACTIVATION_ENABLED=true solo se permite con ADR, permiso reforzado, test coverage y feature approval.
```

---

## 30. Seeds iniciales

### 30.1. Setting definitions iniciales

```text id="tsp-seed-setting-definitions"
general.timezone
general.locale
general.currency
general.defaultPageSize
general.defaultExportFormat

security.publicSettingsApiEnabled
security.wordpressSettingsAccessEnabled
security.externalAiRealDataAllowed
security.sensitiveExportsRequireApproval

financial.paymentValidationRequired
financial.receiptRequired
financial.partialPaymentsAllowed
financial.overpaymentsAllowed
financial.autoAllocationEnabled
financial.lateFeeEnabled

documents.defaultDocumentSensitivity
documents.downloadAuditRequired
documents.versioningRequired
documents.publicDocumentPublishingAllowed

accessControl.visitorPreAuthorizationAllowed
accessControl.residentCanCreateVisitor
accessControl.defaultAccessPassTtlMinutes
accessControl.oneTimePassDefault
accessControl.guardManualCheckInAllowed
accessControl.guardManualCheckOutAllowed
accessControl.residentCanSeeAccessEvents

maintenance.residentCanCreateMaintenanceRequest
maintenance.evidenceRequiredForRequest

inventory.negativeStockAllowed
inventory.lowStockAlertsEnabled
```

---

### 30.2. Policy definitions iniciales

```text id="tsp-seed-policy-definitions"
financial.billingPolicy
financial.paymentPolicy
financial.lateFeePolicy
reservations.reservationPolicy
fines.fineAppealPolicy
meetings.quorumPolicy
voting.basicVotingPolicy
communications.notificationPolicy
documents.documentRetentionPolicy
accessControl.visitorAccessPolicy
maintenance.workOrderPolicy
inventory.stockPolicy
suppliers.supplierApprovalPolicy
privacy.dataGovernancePolicy
security.exportPolicy
```

---

### 30.3. Reglas de seeds

```text id="tsp-seed-rules"
- Seeds no deben contener secretos.
- Seeds no deben contener datos reales.
- Seeds deben usar defaults seguros.
- Seeds deben ser reproducibles.
- Seeds deben ser idempotentes.
- Seeds platform definitions no deben duplicarse.
- Seeds tenant values deben ser tenant-scoped.
```

---

## 31. Testing strategy

El detalle completo se definirá en `test-plan.md`.

### 31.1. Tests unitarios

```text id="tsp-unit-tests"
- value objects;
- schema validators;
- setting validators;
- policy payload validators;
- effective window validation;
- state machines;
- domain policies;
- sanitizers;
- cache key builder.
```

---

### 31.2. Tests de integración

```text id="tsp-integration-tests"
- Prisma repositories;
- unique constraints;
- effective policy resolution;
- activation scheduling;
- cache invalidation;
- SDS export adapter;
- audit adapter;
- tenants/users adapters.
```

---

### 31.3. Tests API

```text id="tsp-api-tests"
- Tenant Admin API;
- Platform API;
- /me summaries API;
- DTO validation;
- permission checks;
- sensitive permission checks;
- cross-tenant 404;
- export endpoints.
```

---

### 31.4. Tests de seguridad

```text id="tsp-security-tests"
- no tenantId in DTO;
- no actor fields in DTO;
- no secrets;
- no executable payload;
- no scripts;
- no raw SQL;
- no public endpoints;
- no WordPress access;
- no transaction side effects;
- no external AI;
- no storageKey exposure.
```

---

## 32. Performance strategy

### 32.1. Objetivos

```text id="tsp-performance-targets"
- resolveEffectiveSetting p95 < 100 ms con cache.
- resolveEffectivePolicy p95 < 150 ms con cache.
- list settings p95 < 800 ms.
- list policies p95 < 800 ms.
- compare policy versions p95 < 1000 ms.
- export pequeño p95 < 3000 ms.
```

---

### 32.2. Optimización

```text id="tsp-performance-optimization"
- índices por tenantId + key;
- índices por tenantId + policyKey + status;
- índices por effectiveFrom/effectiveUntil;
- cache de effective policies;
- paginación obligatoria;
- payloads limitados;
- evitar N+1;
- projection select explícito.
```

---

## 33. Concurrency strategy

Casos críticos:

```text id="tsp-concurrency-cases"
- dos usuarios activan versiones distintas de la misma policy simultáneamente;
- aprobación y rechazo simultáneos;
- activación y archivo simultáneos;
- creación concurrente de versionNumber;
- update setting y lectura efectiva simultáneos;
- excepción aprobada mientras se resuelve política efectiva.
```

Controles:

```text id="tsp-concurrency-controls"
- transacciones;
- constraints por tenant + policyKey + versionNumber;
- locking lógico por policyKey;
- update condicional por status;
- invalidación cache posterior a commit;
- eventos auditables.
```

---

## 34. Plan de implementación por fases

### 34.1. Fase 1 — Base del módulo

```text id="tsp-phase-1"
- Crear módulo NestJS.
- Crear config y feature flags.
- Crear enums y errores.
- Crear value objects.
- Crear validators.
- Crear policies de seguridad.
```

---

### 34.2. Fase 2 — Persistencia

```text id="tsp-phase-2"
- Crear Prisma models.
- Crear migración.
- Crear repositories.
- Crear seeds de definitions.
- Crear tests de repositories.
```

---

### 34.3. Fase 3 — Settings

```text id="tsp-phase-3"
- Implementar setting definitions.
- Implementar tenant setting values.
- Implementar actualización y schedule.
- Implementar effective setting resolution.
- Implementar cache.
```

---

### 34.4. Fase 4 — Policies

```text id="tsp-phase-4"
- Implementar policy definitions.
- Implementar policy versions.
- Implementar review/approval/rejection.
- Implementar activation/schedule/rollback.
- Implementar effective policy resolution.
```

---

### 34.5. Fase 5 — Exceptions and summaries

```text id="tsp-phase-5"
- Implementar policy exceptions.
- Implementar exception resolution.
- Implementar /me summaries.
- Implementar comparación de versiones.
```

---

### 34.6. Fase 6 — Export, audit and observability

```text id="tsp-phase-6"
- Implementar export vía SDS.
- Implementar audit.
- Implementar logs seguros.
- Implementar métricas.
- Implementar OpenAPI.
```

---

### 34.7. Fase 7 — Hardening

```text id="tsp-phase-7"
- Security tests.
- Performance tests.
- Concurrency tests.
- Smoke tests.
- CI gates.
```

---

## 35. Riesgos técnicos y mitigaciones

| Riesgo                                               |   Nivel | Mitigación                                     |
| ---------------------------------------------------- | ------: | ---------------------------------------------- |
| PolicyPayload se vuelve demasiado flexible           |    Alto | JSON Schema estricto, no executable payload    |
| Settings almacenan secretos accidentalmente          | Crítico | denylist, tests, boot validation, review       |
| Módulos consumidores interpretan distinto una policy |    Alto | schemas centralizados, contrato interno, tests |
| Cache obsoleta aplica política incorrecta            |    Alto | invalidación post-commit, TTL, versionId       |
| Activaciones simultáneas generan solapamiento        |    Alto | transacciones, constraints, locking lógico     |
| Retroactividad altera historia                       |    Alto | deshabilitada por default, permiso reforzado   |
| Exposición en `/me` de configuración sensible        |    Alto | residentVisible allowlist                      |
| Export incluye datos prohibidos                      |    Alto | sanitizer + SDS + tests                        |
| PlatformAdmin modifica tenant sin trazabilidad       |    Alto | permisos explícitos + audit                    |
| Migración a microservicios rompe lectura efectiva    |   Medio | puertos internos y API interna preparada       |

---

## 36. Decisiones técnicas MVP

```text id="tsp-technical-decisions"
1. Usar monolito modular.
2. Usar Prisma + PostgreSQL.
3. Usar JSONB para values y policyPayload.
4. Usar JSON Schema para validación.
5. Usar definitions globales controladas por PlatformAdmin.
6. Usar values y versions tenant-scoped.
7. Usar effective dating para policies.
8. Usar cache para lectura efectiva.
9. Usar Secure Document Storage para exportaciones.
10. Usar auditoría obligatoria en cambios críticos.
11. No permitir payloads ejecutables.
12. No permitir secretos.
13. No permitir endpoints públicos.
14. No permitir WordPress público.
15. No ejecutar efectos transaccionales.
```

---

## 37. Definition of Done técnico

```text id="tsp-plan-dod"
[ ] Módulo NestJS creado.
[ ] Configuración creada.
[ ] Feature flags implementadas.
[ ] Boot validation implementada.
[ ] Enums y errores definidos.
[ ] Value objects implementados.
[ ] Domain entities implementadas.
[ ] Domain policies implementadas.
[ ] Validators implementados.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositories implementados.
[ ] DTOs implementados.
[ ] Guards implementados.
[ ] Tenant Admin API implementada.
[ ] Platform API implementada.
[ ] /me summaries API implementada.
[ ] Internal resolver port implementado.
[ ] Settings definitions implementadas.
[ ] Tenant settings implementados.
[ ] Policy definitions implementadas.
[ ] Policy versions implementadas.
[ ] Policy activations implementadas.
[ ] Policy exceptions implementadas.
[ ] Effective settings implementados.
[ ] Effective policies implementadas.
[ ] Cache implementada.
[ ] Cache invalidation implementada.
[ ] Policy comparison implementada.
[ ] Export vía SDS implementado.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Seeds implementados.
[ ] Tests unitarios pasan.
[ ] Tests integración pasan.
[ ] Tests API pasan.
[ ] Tests security pasan.
[ ] Tests no secrets pasan.
[ ] Tests no executable payload pasan.
[ ] Tests no public pasan.
[ ] Tests no WordPress pasan.
[ ] Tests no transaction side effects pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

## 38. No aceptación técnica

No se acepta la implementación si:

```text id="tsp-plan-no-acceptance"
- permite settings cross-tenant;
- permite policies cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta versionNumber desde cliente;
- acepta status directo fuera de transición;
- almacena secretos;
- almacena tokens;
- almacena passwords;
- almacena apiKeys;
- almacena clientSecrets;
- almacena privateKeys;
- almacena raw SQL;
- almacena scripts;
- almacena código ejecutable;
- permite policyPayload ejecutable;
- permite JavaScript configurable por tenant;
- modifica cargos desde este módulo;
- modifica pagos desde este módulo;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- modifica AccessEvent;
- abre portones;
- controla hardware;
- habilita biometría;
- habilita reconocimiento facial;
- expone endpoints públicos;
- permite acceso desde WordPress público;
- expone configuración sensible en /me;
- exporta sin Secure Document Storage;
- devuelve storageKey;
- omite auditoría de cambios críticos;
- permite cambios retroactivos sin permiso reforzado;
- no conserva historial de versiones;
- usa IA externa con datos reales.
```

---

## 39. Resultado esperado

Al implementar este plan, `025-tenant-settings-policies` quedará preparado como módulo transversal de configuración y políticas para RESIDENT Core, con soporte de settings efectivos, policies versionadas, activaciones, excepciones, summaries visibles, exportaciones, auditoría, observabilidad y límites estrictos de seguridad.

Resultado esperado:

```text id="tsp-plan-expected-result"
module structure definida
technical boundaries definidos
dependencies definidas
settings definitions planificadas
tenant settings planificados
policy definitions planificadas
policy versions planificadas
policy activations planificadas
policy exceptions planificadas
effective settings planificados
effective policies planificadas
cache strategy definida
schema validation definida
versioning strategy definida
activation strategy definida
exception strategy definida
API strategy definida
DTO strategy definida
guards definidos
permissions definidos
integration ports definidos
SDS export definido
audit definido
observability definida
OpenAPI strategy definida
feature flags definidos
seeds definidos
testing strategy definida
performance strategy definida
concurrency strategy definida
implementation phases definidas
no public endpoints
no WordPress access
no secrets
no executable policy payload
no transaction side effects
no external AI with real data
```

---

## 40. Expediente actualizado

```text id="tsp-plan-expediente"
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
│   │   ├── 019-open-banking-integration/
│   │   ├── 020-accounting-ledger/
│   │   ├── 021-supplier-payments/
│   │   ├── 022-maintenance-work-orders/
│   │   ├── 023-inventory-basic/
│   │   ├── 024-access-control-visitors/
│   │   └── 025-tenant-settings-policies/
│   │       ├── spec.md
│   │       └── plan.md
```
