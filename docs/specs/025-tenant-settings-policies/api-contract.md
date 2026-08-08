# API Contract — 025 Tenant Settings and Policies

## 1. Información del documento

| Campo           | Valor                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                 |
| Spec ID         | 025                                                                                           |
| Módulo          | Tenant Settings and Policies                                                                  |
| Documento       | API Contract                                                                                  |
| Ruta            | `docs/specs/025-tenant-settings-policies/api-contract.md`                                     |
| Versión         | 0.1                                                                                           |
| Estado          | Borrador inicial                                                                              |
| Fecha           | 2026-07-31                                                                                    |
| Documento base  | `docs/specs/025-tenant-settings-policies/spec.md`                                             |
| Plan técnico    | `docs/specs/025-tenant-settings-policies/plan.md`                                             |
| Modelo de datos | `docs/specs/025-tenant-settings-policies/data-model.md`                                       |
| API Style       | REST                                                                                          |
| Base path       | `/api/v1`                                                                                     |
| Formato         | JSON                                                                                          |
| Autenticación   | Bearer Token / Keycloak OIDC                                                                  |
| Autorización    | RESIDENT Core tenant-aware permissions                                                        |
| Naturaleza      | Tenant-scoped / Configuration-governed / Policy-driven / Versioned / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el contrato API del módulo `025-tenant-settings-policies`.

El contrato cubre endpoints, DTOs, responses, errores, permisos, validaciones, superficies API, resolución efectiva, versionamiento, activaciones, excepciones, historial, exportaciones, auditoría, observabilidad e integraciones internas.

Regla central del contrato:

```text id="tsp-api-rule"
Toda API de Tenant Settings and Policies debe ser autenticada, tenant-scoped, permission-based, schema-validated, audit-heavy, no pública y no accesible desde WordPress público; debe permitir administrar settings, policy definitions, policy versions, activaciones, excepciones, historial, summaries visibles y exportaciones, sin aceptar tenantId desde cliente, sin aceptar actor fields, sin almacenar secretos, sin aceptar scripts, sin aceptar raw SQL, sin aceptar código ejecutable, sin exponer configuración sensible en /me, sin devolver storageKey, sin crear pagos, sin crear asientos contables, sin confirmar conciliaciones, sin modificar datos transaccionales de otros módulos y sin enviar datos reales a IA externa.
```

---

## 3. Convenciones generales

### 3.1. Base URL

```text id="tsp-api-base-url"
/api/v1
```

---

### 3.2. Content-Type

```http id="tsp-api-content-type"
Content-Type: application/json
Accept: application/json
```

---

### 3.3. Fechas

Todas las fechas se reciben y devuelven en ISO 8601 UTC.

Ejemplo:

```json id="tsp-api-date-example"
{
  "effectiveFrom": "2026-08-01T00:00:00.000Z"
}
```

---

### 3.4. Campos JSON

API JSON:

```text id="tsp-api-json-style"
camelCase
```

Base de datos:

```text id="tsp-api-db-style"
snake_case
```

---

### 3.5. Valores monetarios o decimales

Cuando una política use montos, porcentajes o valores decimales:

```text id="tsp-api-decimal-rule"
Usar string decimal, nunca number float.
```

Ejemplo:

```json id="tsp-api-decimal-example"
{
  "lateFeeFixedAmount": "10.00",
  "lateFeePercentage": "2.50"
}
```

---

### 3.6. Response envelope

Respuesta simple:

```json id="tsp-api-envelope-single"
{
  "data": {
    "id": "uuid"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Respuesta paginada:

```json id="tsp-api-envelope-page"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "traceId": "trace-id"
  }
}
```

Error estándar:

```json id="tsp-api-error-envelope"
{
  "error": {
    "code": "TENANT_POLICY_NOT_FOUND",
    "message": "Tenant policy not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 4. Superficies API

### 4.1. Tenant Admin API

```text id="tsp-api-tenant-surface"
/api/v1/tenant/settings
/api/v1/tenant/policies
/api/v1/tenant/policy-exceptions
/api/v1/tenant/settings-history
/api/v1/tenant/policy-history
/api/v1/tenant/settings-policies/export
```

Uso:

```text id="tsp-api-tenant-surface-use"
Administración autenticada de settings, policies, versiones, activaciones, excepciones, historial y exportaciones del tenant actual.
```

---

### 4.2. Platform API

```text id="tsp-api-platform-surface"
/api/v1/platform/setting-definitions
/api/v1/platform/policy-definitions
```

Uso:

```text id="tsp-api-platform-surface-use"
Administración del catálogo global de definitions por PlatformAdmin autorizado.
```

---

### 4.3. `/me` API limitada

```text id="tsp-api-me-surface"
/api/v1/me/tenant-policy-summaries
```

Uso:

```text id="tsp-api-me-surface-use"
Consulta limitada para residentes o propietarios sobre políticas visibles y publicables del tenant.
```

---

### 4.4. Internal service port

No necesariamente expuesto como REST público. Se implementa como puerto interno del monolito modular.

```text id="tsp-api-internal-surface"
resolveEffectiveSetting(tenantId, key, effectiveAt?)
resolveEffectivePolicy(tenantId, policyKey, effectiveAt?, context?)
resolvePolicyException(tenantId, policyKey, targetResourceType?, targetResourceId?, effectiveAt?)
```

---

### 4.5. Public API prohibida

No implementar:

```text id="tsp-api-public-forbidden"
/api/v1/public/tenant-settings
/api/v1/public/tenant-policies
/api/v1/public/tenants/{slug}/settings
/api/v1/public/tenants/{slug}/policies
/api/v1/public/settings-policies
```

Respuesta esperada:

```http id="tsp-api-public-404"
404 Not Found
```

---

## 5. Autenticación

Todos los endpoints permitidos requieren:

```http id="tsp-api-auth-header"
Authorization: Bearer <access_token>
```

Reglas:

```text id="tsp-api-auth-rules"
- Keycloak autentica.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve currentTenant.
- RESIDENT Core autoriza por permisos, recurso, sensibilidad y superficie API.
```

Prohibido:

```text id="tsp-api-auth-forbidden"
- acceso anónimo;
- API key pública;
- token por query string;
- sesión WordPress como autenticación Core;
- userId enviado por cliente como actor;
- tenantId enviado por cliente como autoridad.
```

---

## 6. Tenant context

El tenant se resuelve server-side desde el contexto autenticado.

No se acepta `tenantId` en body, query o path para operaciones tenant ordinarias.

Request prohibido:

```json id="tsp-api-tenantid-forbidden"
{
  "tenantId": "uuid",
  "key": "general.timezone",
  "value": "America/Guayaquil"
}
```

Respuesta esperada:

```http id="tsp-api-tenantid-response"
422 Unprocessable Entity
```

Regla cross-tenant:

```text id="tsp-api-cross-tenant-rule"
Si un recurso existe pero pertenece a otro tenant, la API debe responder 404 Not Found.
```

---

## 7. Paginación, filtros y ordenamiento

### 7.1. Parámetros estándar

```text id="tsp-api-pagination"
page
pageSize
sortBy
sortDirection
```

Reglas:

```text id="tsp-api-pagination-rules"
- page inicia en 1.
- pageSize default = 25.
- pageSize máximo = 100.
- sortDirection = asc | desc.
- sortBy debe pertenecer a whitelist por endpoint.
```

---

### 7.2. Filtros de fecha

```text id="tsp-api-date-filters"
dateFrom
dateTo
effectiveFrom
effectiveUntil
createdFrom
createdTo
```

Regla:

```text id="tsp-api-date-filter-rule"
dateFrom <= dateTo
```

---

### 7.3. Filtros comunes

```text id="tsp-api-common-filters"
category
status
sensitivity
criticality
ownerModule
key
policyKey
source
residentVisible
```

---

## 8. Permisos

### 8.1. Tenant settings

```text id="tsp-api-permissions-settings"
tenantSettings.read
tenantSettings.update
tenantSettings.schedule
tenantSettings.archive
tenantSettings.export
```

---

### 8.2. Tenant policies

```text id="tsp-api-permissions-policies"
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
```

---

### 8.3. Tenant policy exceptions

```text id="tsp-api-permissions-exceptions"
tenantPolicyExceptions.read
tenantPolicyExceptions.create
tenantPolicyExceptions.approve
tenantPolicyExceptions.reject
tenantPolicyExceptions.revoke
tenantPolicyExceptions.archive
```

---

### 8.4. Historial y lectura efectiva

```text id="tsp-api-permissions-history"
tenantPolicyHistory.read
tenantPolicyEffective.read
tenantPolicyEffective.readSensitive
```

---

### 8.5. Platform definitions

```text id="tsp-api-permissions-platform"
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

### 8.6. Summaries `/me`

```text id="tsp-api-permissions-me"
tenantPolicySummaries.own.read
```

---

### 8.7. Permisos sensibles

```text id="tsp-api-permissions-sensitive"
tenantPolicies.activateSensitive
tenantPolicies.activateRetroactive
tenantPolicies.approveSensitive
tenantPolicyExceptions.approveSensitive
tenantSettings.updateSecurity
tenantSettings.updatePrivacy
tenantSettings.updateFinancial
tenantSettings.exportSensitive
```

Regla:

```text id="tsp-api-sensitive-permission-rule"
Todo cambio en categorías security, privacy, financial, accounting, bankReconciliation o policies con sensitivity restricted/securitySensitive/privacySensitive/financialSensitive requiere permiso sensible adicional.
```

---

# 9. Platform API — Setting Definitions

## 9.1. List setting definitions

```http id="tsp-api-list-setting-definitions"
GET /api/v1/platform/setting-definitions
```

Permiso:

```text id="tsp-api-perm-list-setting-definitions"
platformSettingDefinitions.read
```

Query params:

```text id="tsp-api-query-setting-definitions"
category
valueType
sensitivity
status
residentVisible
search
page
pageSize
sortBy
sortDirection
```

Response:

```json id="tsp-api-response-setting-definitions"
{
  "data": [
    {
      "id": "uuid",
      "key": "general.timezone",
      "category": "general",
      "valueType": "string",
      "defaultValue": "America/Guayaquil",
      "allowedValues": null,
      "description": "Zona horaria operativa del tenant.",
      "sensitivity": "internal",
      "isTenantOverridable": true,
      "isRuntimeCritical": false,
      "requiresRestart": false,
      "residentVisible": false,
      "status": "active",
      "createdAt": "2026-07-31T06:03:00.000Z",
      "updatedAt": "2026-07-31T06:03:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 9.2. Create setting definition

```http id="tsp-api-create-setting-definition"
POST /api/v1/platform/setting-definitions
```

Permiso:

```text id="tsp-api-perm-create-setting-definition"
platformSettingDefinitions.create
```

Request:

```json id="tsp-api-request-create-setting-definition"
{
  "key": "general.timezone",
  "category": "general",
  "valueType": "string",
  "defaultValue": "America/Guayaquil",
  "allowedValues": ["America/Guayaquil", "UTC"],
  "schema": {
    "type": "string",
    "enum": ["America/Guayaquil", "UTC"]
  },
  "description": "Zona horaria operativa del tenant.",
  "sensitivity": "internal",
  "isTenantOverridable": true,
  "isRuntimeCritical": false,
  "requiresRestart": false,
  "residentVisible": false
}
```

Reglas:

```text id="tsp-api-create-setting-definition-rules"
- key debe ser único.
- key debe usar formato category.name.
- defaultValue debe validar contra valueType/schema.
- No debe contener secretos.
- No debe contener scripts.
- No debe contener rawSql.
- residentVisible debe ser false para settings sensibles.
- createdBy se resuelve server-side.
```

Response:

```http id="tsp-api-created-setting-definition-http"
201 Created
```

```json id="tsp-api-created-setting-definition-response"
{
  "data": {
    "id": "uuid",
    "key": "general.timezone",
    "category": "general",
    "status": "active",
    "createdAt": "2026-07-31T06:03:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 9.3. Get setting definition

```http id="tsp-api-get-setting-definition"
GET /api/v1/platform/setting-definitions/{definitionId}
```

Permiso:

```text id="tsp-api-perm-get-setting-definition"
platformSettingDefinitions.read
```

---

## 9.4. Update setting definition

```http id="tsp-api-update-setting-definition"
PATCH /api/v1/platform/setting-definitions/{definitionId}
```

Permiso:

```text id="tsp-api-perm-update-setting-definition"
platformSettingDefinitions.update
```

Request:

```json id="tsp-api-request-update-setting-definition"
{
  "description": "Zona horaria principal usada para fechas operativas.",
  "isTenantOverridable": true,
  "residentVisible": false
}
```

Prohibido:

```json id="tsp-api-update-setting-definition-forbidden"
{
  "createdBy": "uuid",
  "status": "archived",
  "secret": "value",
  "script": "return true"
}
```

---

## 9.5. Archive setting definition

```http id="tsp-api-archive-setting-definition"
POST /api/v1/platform/setting-definitions/{definitionId}/archive
```

Permiso:

```text id="tsp-api-perm-archive-setting-definition"
platformSettingDefinitions.archive
```

Request:

```json id="tsp-api-request-archive-setting-definition"
{
  "archiveReason": "Definition reemplazada por nueva clave versionada."
}
```

Reglas:

```text id="tsp-api-archive-setting-definition-rules"
- No borra físicamente.
- Definition archivada no se usa para nuevos values.
- Historial de tenants existentes se conserva.
- Debe auditar tenantSettingDefinition.archived.
```

---

# 10. Platform API — Policy Definitions

## 10.1. List policy definitions

```http id="tsp-api-list-policy-definitions"
GET /api/v1/platform/policy-definitions
```

Permiso:

```text id="tsp-api-perm-list-policy-definitions"
platformPolicyDefinitions.read
```

Query params:

```text id="tsp-api-query-policy-definitions"
category
ownerModule
criticality
sensitivity
status
residentVisible
approvalRequired
versioningRequired
search
page
pageSize
sortBy
sortDirection
```

---

## 10.2. Create policy definition

```http id="tsp-api-create-policy-definition"
POST /api/v1/platform/policy-definitions
```

Permiso:

```text id="tsp-api-perm-create-policy-definition"
platformPolicyDefinitions.create
```

Request:

```json id="tsp-api-request-create-policy-definition"
{
  "policyKey": "accessControl.visitorAccessPolicy",
  "category": "accessControl",
  "ownerModule": "024-access-control-visitors",
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "visitorPreAuthorizationAllowed": { "type": "boolean" },
      "residentCanCreateVisitor": { "type": "boolean" },
      "defaultAccessPassTtlMinutes": { "type": "integer", "minimum": 5, "maximum": 10080 },
      "oneTimePassDefault": { "type": "boolean" }
    },
    "required": [
      "visitorPreAuthorizationAllowed",
      "residentCanCreateVisitor",
      "defaultAccessPassTtlMinutes",
      "oneTimePassDefault"
    ]
  },
  "defaultPolicy": {
    "visitorPreAuthorizationAllowed": true,
    "residentCanCreateVisitor": true,
    "defaultAccessPassTtlMinutes": 1440,
    "oneTimePassDefault": true
  },
  "description": "Política base para autorización de visitantes.",
  "criticality": "high",
  "sensitivity": "securitySensitive",
  "isTenantOverridable": true,
  "versioningRequired": true,
  "approvalRequired": true,
  "residentVisible": false
}
```

Reglas:

```text id="tsp-api-create-policy-definition-rules"
- policyKey debe ser único.
- ownerModule obligatorio.
- schema obligatorio.
- defaultPolicy debe validar contra schema.
- additionalProperties=false recomendado.
- No se permite schema ejecutable.
- No se permite defaultPolicy con secretos, scripts, rawSql o externalAiRealDataAllowed.
```

Response:

```http id="tsp-api-created-policy-definition-http"
201 Created
```

```json id="tsp-api-created-policy-definition-response"
{
  "data": {
    "id": "uuid",
    "policyKey": "accessControl.visitorAccessPolicy",
    "category": "accessControl",
    "ownerModule": "024-access-control-visitors",
    "status": "active",
    "createdAt": "2026-07-31T06:03:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 10.3. Get policy definition

```http id="tsp-api-get-policy-definition"
GET /api/v1/platform/policy-definitions/{definitionId}
```

Permiso:

```text id="tsp-api-perm-get-policy-definition"
platformPolicyDefinitions.read
```

---

## 10.4. Update policy definition

```http id="tsp-api-update-policy-definition"
PATCH /api/v1/platform/policy-definitions/{definitionId}
```

Permiso:

```text id="tsp-api-perm-update-policy-definition"
platformPolicyDefinitions.update
```

Request:

```json id="tsp-api-request-update-policy-definition"
{
  "description": "Política actualizada para control de visitantes.",
  "approvalRequired": true,
  "residentVisible": false
}
```

---

## 10.5. Archive policy definition

```http id="tsp-api-archive-policy-definition"
POST /api/v1/platform/policy-definitions/{definitionId}/archive
```

Permiso:

```text id="tsp-api-perm-archive-policy-definition"
platformPolicyDefinitions.archive
```

Request:

```json id="tsp-api-request-archive-policy-definition"
{
  "archiveReason": "Policy definition reemplazada por nueva versión conceptual."
}
```

---

# 11. Tenant Admin API — Settings

## 11.1. List effective tenant settings

```http id="tsp-api-list-tenant-settings"
GET /api/v1/tenant/settings
```

Permiso:

```text id="tsp-api-perm-list-tenant-settings"
tenantSettings.read
```

Query params:

```text id="tsp-api-query-tenant-settings"
category
sensitivity
source
status
residentVisible
effectiveAt
page
pageSize
sortBy
sortDirection
```

Response:

```json id="tsp-api-response-tenant-settings"
{
  "data": [
    {
      "key": "general.timezone",
      "category": "general",
      "valueType": "string",
      "value": "America/Guayaquil",
      "source": "platformDefault",
      "settingDefinitionId": "uuid",
      "settingValueId": null,
      "effectiveFrom": null,
      "effectiveUntil": null,
      "sensitivity": "internal",
      "isTenantOverridable": true,
      "residentVisible": false
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="tsp-api-list-tenant-settings-rules"
- Devuelve settings efectivos.
- Usa default si no existe tenant override.
- No devuelve secretos.
- No devuelve valores de otro tenant.
- Si sensitivity es sensible, requiere permiso adicional si se solicita detalle completo.
```

---

## 11.2. Get effective tenant setting by key

```http id="tsp-api-get-tenant-setting"
GET /api/v1/tenant/settings/{key}
```

Permiso:

```text id="tsp-api-perm-get-tenant-setting"
tenantSettings.read
```

Query params:

```text id="tsp-api-query-get-setting"
effectiveAt
includeHistory
```

Response:

```json id="tsp-api-response-get-setting"
{
  "data": {
    "key": "accessControl.defaultAccessPassTtlMinutes",
    "category": "accessControl",
    "valueType": "integer",
    "value": 1440,
    "source": "tenantOverride",
    "settingDefinitionId": "uuid",
    "settingValueId": "uuid",
    "effectiveFrom": "2026-08-01T00:00:00.000Z",
    "effectiveUntil": null,
    "sensitivity": "securitySensitive",
    "residentVisible": false
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 11.3. Update tenant setting

```http id="tsp-api-update-tenant-setting"
PATCH /api/v1/tenant/settings/{key}
```

Permisos:

```text id="tsp-api-perm-update-tenant-setting"
tenantSettings.update
```

Permisos adicionales posibles:

```text id="tsp-api-perm-update-sensitive-setting"
tenantSettings.updateSecurity
tenantSettings.updatePrivacy
tenantSettings.updateFinancial
```

Request:

```json id="tsp-api-request-update-tenant-setting"
{
  "value": 720,
  "effectiveFrom": "2026-08-01T00:00:00.000Z",
  "reason": "Reducir tiempo de vigencia por política de seguridad."
}
```

Reglas:

```text id="tsp-api-update-setting-rules"
- key debe existir en SettingDefinition.
- SettingDefinition debe estar active.
- isTenantOverridable debe ser true.
- value debe validar contra valueType/schema.
- effectiveFrom obligatorio si no se activa inmediatamente.
- reason obligatorio si isRuntimeCritical=true o sensitivity sensible.
- No acepta tenantId.
- No acepta actor fields.
- No acepta secrets.
- No acepta scripts.
- No acepta rawSql.
- Actualización debe invalidar cache.
- Debe auditar tenantSetting.updated o tenantSetting.activated.
```

Response:

```json id="tsp-api-response-update-setting"
{
  "data": {
    "id": "uuid",
    "key": "accessControl.defaultAccessPassTtlMinutes",
    "value": 720,
    "status": "active",
    "source": "tenantOverride",
    "effectiveFrom": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-07-31T06:03:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 11.4. Schedule tenant setting

```http id="tsp-api-schedule-tenant-setting"
POST /api/v1/tenant/settings/{key}/schedule
```

Permiso:

```text id="tsp-api-perm-schedule-tenant-setting"
tenantSettings.schedule
```

Request:

```json id="tsp-api-request-schedule-setting"
{
  "value": true,
  "effectiveFrom": "2026-09-01T00:00:00.000Z",
  "reason": "Activación programada aprobada por administración."
}
```

Reglas:

```text id="tsp-api-schedule-setting-rules"
- effectiveFrom debe ser futuro.
- value debe validar contra schema.
- scheduled no debe afectar lectura efectiva actual.
- Al llegar effectiveFrom, pasa a active mediante job interno.
- Debe auditar tenantSetting.scheduled.
```

---

## 11.5. Archive tenant setting override

```http id="tsp-api-archive-tenant-setting"
POST /api/v1/tenant/settings/{key}/archive
```

Permiso:

```text id="tsp-api-perm-archive-tenant-setting"
tenantSettings.archive
```

Request:

```json id="tsp-api-request-archive-setting"
{
  "archiveReason": "Volver al default de plataforma."
}
```

Reglas:

```text id="tsp-api-archive-setting-rules"
- Archiva el override tenant-scoped vigente o programado.
- No archiva SettingDefinition.
- Luego de archivar, la lectura efectiva debe usar default platform si no existe otro override.
- Debe invalidar cache.
- Debe auditar tenantSetting.archived.
```

---

# 12. Tenant Admin API — Policies

## 12.1. List tenant policies

```http id="tsp-api-list-tenant-policies"
GET /api/v1/tenant/policies
```

Permiso:

```text id="tsp-api-perm-list-tenant-policies"
tenantPolicies.read
```

Query params:

```text id="tsp-api-query-tenant-policies"
category
ownerModule
criticality
sensitivity
status
source
residentVisible
effectiveAt
page
pageSize
sortBy
sortDirection
```

Response:

```json id="tsp-api-response-tenant-policies"
{
  "data": [
    {
      "policyKey": "accessControl.visitorAccessPolicy",
      "category": "accessControl",
      "ownerModule": "024-access-control-visitors",
      "source": "tenantOverride",
      "policyDefinitionId": "uuid",
      "activeVersionId": "uuid",
      "versionLabel": "v1",
      "status": "active",
      "effectiveFrom": "2026-08-01T00:00:00.000Z",
      "effectiveUntil": null,
      "criticality": "high",
      "sensitivity": "securitySensitive",
      "residentVisible": false
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 12.2. Get tenant policy summary

```http id="tsp-api-get-tenant-policy"
GET /api/v1/tenant/policies/{policyKey}
```

Permiso:

```text id="tsp-api-perm-get-tenant-policy"
tenantPolicies.read
```

Query params:

```text id="tsp-api-query-get-policy"
effectiveAt
includeVersions
```

Response:

```json id="tsp-api-response-get-policy"
{
  "data": {
    "policyKey": "accessControl.visitorAccessPolicy",
    "category": "accessControl",
    "ownerModule": "024-access-control-visitors",
    "source": "tenantOverride",
    "policyDefinitionId": "uuid",
    "activeVersionId": "uuid",
    "versionLabel": "v1",
    "policyPayload": {
      "visitorPreAuthorizationAllowed": true,
      "residentCanCreateVisitor": true,
      "defaultAccessPassTtlMinutes": 1440,
      "oneTimePassDefault": true
    },
    "status": "active",
    "effectiveFrom": "2026-08-01T00:00:00.000Z",
    "effectiveUntil": null,
    "criticality": "high",
    "sensitivity": "securitySensitive"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="tsp-api-get-policy-rules"
- Si policyPayload es sensible, requiere permiso correspondiente.
- No devuelve secretos.
- No devuelve scripts.
- No devuelve payloads cross-tenant.
```

---

## 12.3. List policy versions

```http id="tsp-api-list-policy-versions"
GET /api/v1/tenant/policies/{policyKey}/versions
```

Permiso:

```text id="tsp-api-perm-list-policy-versions"
tenantPolicies.read
```

Query params:

```text id="tsp-api-query-policy-versions"
status
effectiveFrom
effectiveUntil
createdFrom
createdTo
page
pageSize
sortBy
sortDirection
```

Response:

```json id="tsp-api-response-policy-versions"
{
  "data": [
    {
      "id": "uuid",
      "policyKey": "accessControl.visitorAccessPolicy",
      "versionNumber": 1,
      "versionLabel": "v1",
      "status": "active",
      "effectiveFrom": "2026-08-01T00:00:00.000Z",
      "effectiveUntil": null,
      "changeReason": "Configuración inicial del tenant.",
      "createdAt": "2026-07-31T06:03:00.000Z",
      "approvedAt": "2026-07-31T06:10:00.000Z",
      "activatedAt": "2026-08-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 12.4. Create policy version

```http id="tsp-api-create-policy-version"
POST /api/v1/tenant/policies/{policyKey}/versions
```

Permiso:

```text id="tsp-api-perm-create-policy-version"
tenantPolicies.createVersion
```

Request:

```json id="tsp-api-request-create-policy-version"
{
  "policyPayload": {
    "visitorPreAuthorizationAllowed": true,
    "residentCanCreateVisitor": true,
    "defaultAccessPassTtlMinutes": 720,
    "oneTimePassDefault": true
  },
  "changeReason": "Reducir vigencia de pases temporales por seguridad."
}
```

Reglas:

```text id="tsp-api-create-policy-version-rules"
- policyKey debe existir en PolicyDefinition.
- PolicyDefinition debe estar active.
- isTenantOverridable debe ser true.
- policyPayload debe validar contra schema.
- changeReason obligatorio.
- versionNumber se genera server-side.
- versionLabel se genera server-side.
- Nueva versión inicia como draft.
- No altera versión activa.
- No acepta tenantId.
- No acepta versionNumber.
- No acepta status.
- No acepta secrets.
- No acepta scripts.
- No acepta rawSql.
- Debe auditar tenantPolicyVersion.created.
```

Response:

```http id="tsp-api-created-policy-version-http"
201 Created
```

```json id="tsp-api-response-create-policy-version"
{
  "data": {
    "id": "uuid",
    "policyKey": "accessControl.visitorAccessPolicy",
    "versionNumber": 2,
    "versionLabel": "v2",
    "status": "draft",
    "createdAt": "2026-07-31T06:03:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.5. Get policy version

```http id="tsp-api-get-policy-version"
GET /api/v1/tenant/policies/{policyKey}/versions/{versionId}
```

Permiso:

```text id="tsp-api-perm-get-policy-version"
tenantPolicies.read
```

Response:

```json id="tsp-api-response-get-policy-version"
{
  "data": {
    "id": "uuid",
    "policyKey": "accessControl.visitorAccessPolicy",
    "versionNumber": 2,
    "versionLabel": "v2",
    "policyPayload": {
      "visitorPreAuthorizationAllowed": true,
      "residentCanCreateVisitor": true,
      "defaultAccessPassTtlMinutes": 720,
      "oneTimePassDefault": true
    },
    "status": "draft",
    "effectiveFrom": null,
    "effectiveUntil": null,
    "changeReason": "Reducir vigencia de pases temporales por seguridad.",
    "reviewNotes": null,
    "rejectionReason": null,
    "createdAt": "2026-07-31T06:03:00.000Z",
    "updatedAt": "2026-07-31T06:03:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.6. Update draft policy version

```http id="tsp-api-update-policy-version"
PATCH /api/v1/tenant/policies/{policyKey}/versions/{versionId}
```

Permiso:

```text id="tsp-api-perm-update-policy-version"
tenantPolicies.updateDraft
```

Request:

```json id="tsp-api-request-update-policy-version"
{
  "policyPayload": {
    "visitorPreAuthorizationAllowed": true,
    "residentCanCreateVisitor": true,
    "defaultAccessPassTtlMinutes": 600,
    "oneTimePassDefault": true
  },
  "changeReason": "Ajuste previo a revisión."
}
```

Reglas:

```text id="tsp-api-update-policy-version-rules"
- Solo draft puede editarse.
- policyPayload debe validar contra schema.
- active/scheduled/superseded/expired/archived no se editan destructivamente.
- Debe auditar tenantPolicyVersion.updated.
```

---

## 12.7. Submit policy version for review

```http id="tsp-api-submit-policy-review"
POST /api/v1/tenant/policies/{policyKey}/versions/{versionId}/submit-review
```

Permiso:

```text id="tsp-api-perm-submit-policy-review"
tenantPolicies.submitReview
```

Request:

```json id="tsp-api-request-submit-review"
{
  "reviewReason": "Lista para revisión del comité."
}
```

Reglas:

```text id="tsp-api-submit-review-rules"
- Solo draft puede pasar a reviewReady.
- Debe validar schema nuevamente.
- Debe auditar tenantPolicyVersion.submittedForReview.
```

---

## 12.8. Approve policy version

```http id="tsp-api-approve-policy-version"
POST /api/v1/tenant/policies/{policyKey}/versions/{versionId}/approve
```

Permiso:

```text id="tsp-api-perm-approve-policy-version"
tenantPolicies.approve
```

Permiso adicional si es sensible:

```text id="tsp-api-perm-approve-sensitive-policy"
tenantPolicies.approveSensitive
```

Request:

```json id="tsp-api-request-approve-policy"
{
  "approvalReason": "Aprobado por comité de administración.",
  "reviewNotes": "La política cumple controles de seguridad."
}
```

Reglas:

```text id="tsp-api-approve-policy-rules"
- Solo reviewReady puede aprobarse.
- Políticas sensibles requieren approveSensitive.
- approvedBy se resuelve server-side.
- approvedAt se genera server-side.
- No activa automáticamente salvo endpoint de activación separado.
- Debe auditar tenantPolicyVersion.approved.
```

---

## 12.9. Reject policy version

```http id="tsp-api-reject-policy-version"
POST /api/v1/tenant/policies/{policyKey}/versions/{versionId}/reject
```

Permiso:

```text id="tsp-api-perm-reject-policy-version"
tenantPolicies.reject
```

Request:

```json id="tsp-api-request-reject-policy"
{
  "rejectionReason": "Debe corregirse el tiempo máximo permitido."
}
```

Reglas:

```text id="tsp-api-reject-policy-rules"
- Solo reviewReady puede rechazarse.
- rejected no puede activarse.
- Debe auditar tenantPolicyVersion.rejected.
```

---

## 12.10. Activate policy version

```http id="tsp-api-activate-policy-version"
POST /api/v1/tenant/policies/{policyKey}/versions/{versionId}/activate
```

Permiso:

```text id="tsp-api-perm-activate-policy-version"
tenantPolicies.activate
```

Permisos adicionales posibles:

```text id="tsp-api-perm-activate-sensitive"
tenantPolicies.activateSensitive
tenantPolicies.activateRetroactive
```

Request:

```json id="tsp-api-request-activate-policy"
{
  "effectiveFrom": "2026-08-01T00:00:00.000Z",
  "activationReason": "Activación aprobada para nuevo período operativo."
}
```

Reglas:

```text id="tsp-api-activate-policy-rules"
- Versión debe estar approved o ser activable según policy.
- effectiveFrom obligatorio.
- effectiveFrom en pasado requiere tenantPolicies.activateRetroactive.
- No debe existir superposición incompatible.
- Crea TenantPolicyActivation.
- Marca versión como active si effectiveFrom <= now.
- Marca versión como scheduled si effectiveFrom > now.
- Ajusta effectiveUntil de versión anterior si aplica.
- Invalida cache.
- Debe auditar tenantPolicyVersion.activated o tenantPolicyVersion.scheduled.
```

Response:

```json id="tsp-api-response-activate-policy"
{
  "data": {
    "policyVersionId": "uuid",
    "policyActivationId": "uuid",
    "policyKey": "accessControl.visitorAccessPolicy",
    "versionLabel": "v2",
    "status": "scheduled",
    "effectiveFrom": "2026-08-01T00:00:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 12.11. Schedule policy version

```http id="tsp-api-schedule-policy-version"
POST /api/v1/tenant/policies/{policyKey}/versions/{versionId}/schedule
```

Permiso:

```text id="tsp-api-perm-schedule-policy-version"
tenantPolicies.scheduleActivation
```

Request:

```json id="tsp-api-request-schedule-policy"
{
  "effectiveFrom": "2026-09-01T00:00:00.000Z",
  "activationReason": "Programación para siguiente período."
}
```

Reglas:

```text id="tsp-api-schedule-policy-rules"
- effectiveFrom debe ser futuro.
- Versión debe estar approved.
- No afecta lectura efectiva actual.
- Debe auditar tenantPolicyVersion.scheduled.
```

---

## 12.12. Rollback policy activation

```http id="tsp-api-rollback-policy"
POST /api/v1/tenant/policies/{policyKey}/rollback
```

Permiso:

```text id="tsp-api-perm-rollback-policy"
tenantPolicies.rollback
```

Request:

```json id="tsp-api-request-rollback-policy"
{
  "targetPolicyVersionId": "uuid",
  "effectiveFrom": "2026-08-15T00:00:00.000Z",
  "rollbackReason": "Reversión operativa por comportamiento no esperado."
}
```

Reglas:

```text id="tsp-api-rollback-policy-rules"
- Rollback no borra activaciones previas.
- Crea nueva TenantPolicyActivation con activationType=rollback.
- targetPolicyVersionId debe pertenecer al mismo tenant.
- effectiveFrom en pasado requiere permiso retroactive.
- Debe invalidar cache.
- Debe auditar tenantPolicyActivation.rollbackCreated.
```

---

## 12.13. Archive policy version

```http id="tsp-api-archive-policy-version"
POST /api/v1/tenant/policies/{policyKey}/versions/{versionId}/archive
```

Permiso:

```text id="tsp-api-perm-archive-policy-version"
tenantPolicies.archive
```

Request:

```json id="tsp-api-request-archive-policy-version"
{
  "archiveReason": "Versión descartada."
}
```

Reglas:

```text id="tsp-api-archive-policy-version-rules"
- No puede archivar active si no existe política sustituta aplicable.
- No borra físicamente.
- Debe auditar tenantPolicyVersion.archived.
```

---

# 13. Tenant Admin API — Effective Policies

## 13.1. Get effective policy

```http id="tsp-api-get-effective-policy"
GET /api/v1/tenant/policies/{policyKey}/effective
```

Permiso:

```text id="tsp-api-perm-effective-policy"
tenantPolicyEffective.read
```

Query params:

```text id="tsp-api-query-effective-policy"
effectiveAt
targetResourceType
targetResourceId
includeExceptions
```

Response:

```json id="tsp-api-response-effective-policy"
{
  "data": {
    "policyKey": "accessControl.visitorAccessPolicy",
    "payload": {
      "visitorPreAuthorizationAllowed": true,
      "residentCanCreateVisitor": true,
      "defaultAccessPassTtlMinutes": 1440,
      "oneTimePassDefault": true
    },
    "source": "tenantOverride",
    "policyDefinitionId": "uuid",
    "policyVersionId": "uuid",
    "versionLabel": "v1",
    "effectiveFrom": "2026-08-01T00:00:00.000Z",
    "effectiveUntil": null,
    "appliedExceptionIds": []
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="tsp-api-effective-policy-rules"
- effectiveAt default = now.
- Devuelve tenant override si existe.
- Devuelve platform default si no existe override.
- Si includeExceptions=true, aplica excepciones vigentes.
- No devuelve drafts.
- No devuelve archived.
- No devuelve secretos.
```

---

## 13.2. Compare policy versions

```http id="tsp-api-compare-policy"
GET /api/v1/tenant/policies/{policyKey}/compare
```

Permiso:

```text id="tsp-api-perm-compare-policy"
tenantPolicies.read
```

Query params:

```text id="tsp-api-query-compare-policy"
fromVersionId
toVersionId
```

Response:

```json id="tsp-api-response-compare-policy"
{
  "data": {
    "policyKey": "accessControl.visitorAccessPolicy",
    "fromVersionId": "uuid",
    "toVersionId": "uuid",
    "diff": [
      {
        "path": "defaultAccessPassTtlMinutes",
        "from": 1440,
        "to": 720,
        "changeType": "updated"
      }
    ],
    "sanitized": true
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="tsp-api-compare-policy-rules"
- Ambas versiones deben pertenecer al tenant.
- Diff debe sanitizar secretos y campos prohibidos.
- Si la política es sensible, requiere permiso correspondiente.
```

---

# 14. Tenant Admin API — Policy Exceptions

## 14.1. List policy exceptions

```http id="tsp-api-list-exceptions"
GET /api/v1/tenant/policy-exceptions
```

Permiso:

```text id="tsp-api-perm-list-exceptions"
tenantPolicyExceptions.read
```

Query params:

```text id="tsp-api-query-exceptions"
policyKey
status
exceptionType
targetResourceType
targetResourceId
validFrom
validUntil
page
pageSize
sortBy
sortDirection
```

Response:

```json id="tsp-api-response-exceptions"
{
  "data": [
    {
      "id": "uuid",
      "policyKey": "accessControl.visitorAccessPolicy",
      "exceptionType": "unitOverride",
      "targetResourceType": "propertyUnit",
      "targetResourceId": "uuid",
      "status": "active",
      "validFrom": "2026-08-01T00:00:00.000Z",
      "validUntil": "2026-08-31T23:59:59.000Z",
      "reason": "Excepción temporal aprobada por administración.",
      "createdAt": "2026-07-31T06:03:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

## 14.2. Create policy exception

```http id="tsp-api-create-exception"
POST /api/v1/tenant/policy-exceptions
```

Permiso:

```text id="tsp-api-perm-create-exception"
tenantPolicyExceptions.create
```

Request:

```json id="tsp-api-request-create-exception"
{
  "policyKey": "accessControl.visitorAccessPolicy",
  "policyVersionId": "uuid",
  "exceptionType": "unitOverride",
  "targetResourceType": "propertyUnit",
  "targetResourceId": "uuid",
  "exceptionPayload": {
    "defaultAccessPassTtlMinutes": 360
  },
  "validFrom": "2026-08-01T00:00:00.000Z",
  "validUntil": "2026-08-31T23:59:59.000Z",
  "reason": "Excepción temporal por condición especial de seguridad."
}
```

Reglas:

```text id="tsp-api-create-exception-rules"
- policyKey debe existir.
- exceptionPayload debe validar contra schema permitido.
- validUntil > validFrom.
- reason obligatorio.
- targetResourceId debe validarse mediante módulo dueño si aplica.
- Excepción sensible queda pendingApproval salvo permiso reforzado.
- No se permiten excepciones multi-tenant.
- Debe auditar tenantPolicyException.created.
```

Response:

```http id="tsp-api-created-exception-http"
201 Created
```

```json id="tsp-api-response-create-exception"
{
  "data": {
    "id": "uuid",
    "policyKey": "accessControl.visitorAccessPolicy",
    "exceptionType": "unitOverride",
    "status": "pendingApproval",
    "validFrom": "2026-08-01T00:00:00.000Z",
    "validUntil": "2026-08-31T23:59:59.000Z",
    "createdAt": "2026-07-31T06:03:00.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 14.3. Get policy exception

```http id="tsp-api-get-exception"
GET /api/v1/tenant/policy-exceptions/{exceptionId}
```

Permiso:

```text id="tsp-api-perm-get-exception"
tenantPolicyExceptions.read
```

---

## 14.4. Approve policy exception

```http id="tsp-api-approve-exception"
POST /api/v1/tenant/policy-exceptions/{exceptionId}/approve
```

Permiso:

```text id="tsp-api-perm-approve-exception"
tenantPolicyExceptions.approve
```

Permiso adicional si es sensible:

```text id="tsp-api-perm-approve-sensitive-exception"
tenantPolicyExceptions.approveSensitive
```

Request:

```json id="tsp-api-request-approve-exception"
{
  "approvalReason": "Excepción aprobada por seguridad."
}
```

Reglas:

```text id="tsp-api-approve-exception-rules"
- Solo pendingApproval puede aprobarse.
- approvedBy se resuelve server-side.
- Si validFrom <= now < validUntil, puede pasar a active.
- Debe invalidar cache.
- Debe auditar tenantPolicyException.approved.
```

---

## 14.5. Reject policy exception

```http id="tsp-api-reject-exception"
POST /api/v1/tenant/policy-exceptions/{exceptionId}/reject
```

Permiso:

```text id="tsp-api-perm-reject-exception"
tenantPolicyExceptions.reject
```

Request:

```json id="tsp-api-request-reject-exception"
{
  "rejectionReason": "La excepción no está suficientemente justificada."
}
```

---

## 14.6. Revoke policy exception

```http id="tsp-api-revoke-exception"
POST /api/v1/tenant/policy-exceptions/{exceptionId}/revoke
```

Permiso:

```text id="tsp-api-perm-revoke-exception"
tenantPolicyExceptions.revoke
```

Request:

```json id="tsp-api-request-revoke-exception"
{
  "revokeReason": "La condición especial dejó de aplicar."
}
```

Reglas:

```text id="tsp-api-revoke-exception-rules"
- Revoked no aplica en resolución efectiva.
- revokedBy se resuelve server-side.
- revokedAt se genera server-side.
- Debe invalidar cache.
- Debe auditar tenantPolicyException.revoked.
```

---

## 14.7. Archive policy exception

```http id="tsp-api-archive-exception"
POST /api/v1/tenant/policy-exceptions/{exceptionId}/archive
```

Permiso:

```text id="tsp-api-perm-archive-exception"
tenantPolicyExceptions.archive
```

Request:

```json id="tsp-api-request-archive-exception"
{
  "archiveReason": "Excepción histórica archivada."
}
```

---

# 15. Tenant Admin API — History

## 15.1. List settings history

```http id="tsp-api-list-settings-history"
GET /api/v1/tenant/settings-history
```

Permiso:

```text id="tsp-api-perm-settings-history"
tenantPolicyHistory.read
```

Query params:

```text id="tsp-api-query-settings-history"
key
category
entityType
action
actorUserProfileId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

Response:

```json id="tsp-api-response-settings-history"
{
  "data": [
    {
      "id": "uuid",
      "entityType": "tenantSettingValue",
      "entityId": "uuid",
      "action": "tenantSetting.updated",
      "key": "accessControl.defaultAccessPassTtlMinutes",
      "oldValueSanitized": 1440,
      "newValueSanitized": 720,
      "reason": "Reducir tiempo de vigencia.",
      "actorUserProfileId": "uuid",
      "createdAt": "2026-07-31T06:03:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="tsp-api-history-rules"
- Historial es tenant-scoped.
- oldValueSanitized/newValueSanitized no contienen secretos.
- No expone raw payload sensible si la política lo prohíbe.
```

---

## 15.2. List policy history

```http id="tsp-api-list-policy-history"
GET /api/v1/tenant/policy-history
```

Permiso:

```text id="tsp-api-perm-policy-history"
tenantPolicyHistory.read
```

Query params:

```text id="tsp-api-query-policy-history"
policyKey
category
ownerModule
entityType
action
actorUserProfileId
dateFrom
dateTo
page
pageSize
sortBy
sortDirection
```

---

# 16. Tenant Admin API — Exports

## 16.1. Export settings and policies

```http id="tsp-api-export-settings-policies"
GET /api/v1/tenant/settings-policies/export
```

Permiso:

```text id="tsp-api-perm-export"
tenantSettings.export
```

Permiso adicional si es sensible:

```text id="tsp-api-perm-export-sensitive"
tenantSettings.exportSensitive
```

Query params:

```text id="tsp-api-query-export"
exportType
format
category
policyKey
includeHistory
includeExceptions
includeSensitive
dateFrom
dateTo
reason
```

Valores:

```text id="tsp-api-export-values"
exportType = settings | policies | policyHistory | policyExceptions | fullAdministrativeSnapshot
format = json | xlsx | pdf
```

Reglas:

```text id="tsp-api-export-rules"
- Export requiere permiso.
- Export sensible requiere exportSensitive.
- reason obligatorio si includeSensitive=true o exportType=fullAdministrativeSnapshot.
- Export usa Secure Document Storage.
- Response devuelve secureDocumentId.
- Response no devuelve storageKey.
- Response no devuelve signedUrl persistente.
- Export no incluye secretos.
- Export no incluye tokens.
- Export no incluye scripts.
- Export se audita.
```

Response:

```json id="tsp-api-response-export"
{
  "data": {
    "exportId": "uuid",
    "exportType": "policies",
    "format": "xlsx",
    "status": "completed",
    "secureDocumentId": "uuid",
    "downloadAvailable": true,
    "createdAt": "2026-07-31T06:03:00.000Z",
    "completedAt": "2026-07-31T06:03:04.000Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

# 17. `/me` API — Resident Policy Summaries

## 17.1. List own visible policy summaries

```http id="tsp-api-me-policy-summaries"
GET /api/v1/me/tenant-policy-summaries
```

Permiso:

```text id="tsp-api-perm-me-policy-summaries"
tenantPolicySummaries.own.read
```

Query params:

```text id="tsp-api-query-me-policy-summaries"
category
```

Response:

```json id="tsp-api-response-me-policy-summaries"
{
  "data": [
    {
      "category": "accessControl",
      "policyKey": "accessControl.visitorAccessPolicy",
      "title": "Política de visitantes",
      "summary": {
        "residentCanCreateVisitor": true,
        "defaultAccessPassTtlMinutes": 1440,
        "oneTimePassDefault": true
      },
      "effectiveFrom": "2026-08-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="tsp-api-me-summary-rules"
- Solo muestra policies residentVisible=true.
- No muestra settings sensibles.
- No muestra configuración interna de seguridad.
- No muestra payload completo si no está marcado como publicable.
- No permite modificar settings.
- No permite modificar policies.
- No permite exportar.
```

---

## 17.2. Get own visible policy summaries by category

```http id="tsp-api-me-policy-summary-category"
GET /api/v1/me/tenant-policy-summaries/{category}
```

Permiso:

```text id="tsp-api-perm-me-policy-summary-category"
tenantPolicySummaries.own.read
```

Reglas:

```text id="tsp-api-me-category-rules"
- category debe estar en whitelist.
- Solo se devuelven summaries residentVisible.
- Si no hay contenido visible, devuelve lista vacía.
```

---

# 18. Internal API / Service Port

## 18.1. Resolve effective setting

```typescript id="tsp-api-internal-effective-setting"
resolveEffectiveSetting<T>(
  tenantId: string,
  key: string,
  effectiveAt?: Date
): Promise<EffectiveSetting<T>>
```

Response interno:

```typescript id="tsp-api-internal-effective-setting-response"
type EffectiveSetting<T> = {
  key: string;
  value: T;
  valueType: TenantSettingValueType;
  source: "tenantOverride" | "platformDefault";
  settingDefinitionId: string;
  settingValueId?: string;
  effectiveFrom?: string;
};
```

Reglas:

```text id="tsp-api-internal-effective-setting-rules"
- Solo módulos internos autorizados pueden consumirlo.
- Debe filtrar por tenantId.
- Si no existe override, usa defaultValue.
- No devuelve secretos.
- Usa cache segura si está habilitada.
```

---

## 18.2. Resolve effective policy

```typescript id="tsp-api-internal-effective-policy"
resolveEffectivePolicy<T>(
  tenantId: string,
  policyKey: string,
  effectiveAt?: Date,
  context?: PolicyResolutionContext
): Promise<EffectivePolicy<T>>
```

Response interno:

```typescript id="tsp-api-internal-effective-policy-response"
type EffectivePolicy<T> = {
  policyKey: string;
  payload: T;
  source: "tenantOverride" | "platformDefault";
  policyDefinitionId: string;
  policyVersionId?: string;
  versionLabel?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  appliedExceptionIds: string[];
};
```

Reglas:

```text id="tsp-api-internal-effective-policy-rules"
- No devuelve drafts.
- No devuelve archived.
- Aplica effectiveAt.
- Puede aplicar exceptions según context.
- No ejecuta acciones del módulo consumidor.
- No modifica datos transaccionales.
```

---

## 18.3. Resolve policy exception

```typescript id="tsp-api-internal-exception"
resolvePolicyException(
  tenantId: string,
  policyKey: string,
  targetResourceType?: string,
  targetResourceId?: string,
  effectiveAt?: Date
): Promise<PolicyExceptionResolution>
```

Response interno:

```typescript id="tsp-api-internal-exception-response"
type PolicyExceptionResolution = {
  policyKey: string;
  exceptions: Array<{
    exceptionId: string;
    exceptionType: string;
    exceptionPayload: Record<string, unknown>;
    validFrom: string;
    validUntil: string;
  }>;
};
```

---

# 19. DTOs principales

## 19.1. `CreateSettingDefinitionDto`

```typescript id="tsp-api-dto-create-setting-definition"
type CreateSettingDefinitionDto = {
  key: string;
  category: TenantSettingCategory;
  valueType: TenantSettingValueType;
  defaultValue: unknown;
  allowedValues?: unknown[];
  schema?: Record<string, unknown>;
  description?: string;
  sensitivity: TenantSettingSensitivity;
  isTenantOverridable: boolean;
  isRuntimeCritical: boolean;
  requiresRestart: boolean;
  residentVisible: boolean;
};
```

---

## 19.2. `UpdateSettingDefinitionDto`

```typescript id="tsp-api-dto-update-setting-definition"
type UpdateSettingDefinitionDto = {
  description?: string;
  allowedValues?: unknown[];
  schema?: Record<string, unknown>;
  sensitivity?: TenantSettingSensitivity;
  isTenantOverridable?: boolean;
  isRuntimeCritical?: boolean;
  requiresRestart?: boolean;
  residentVisible?: boolean;
};
```

---

## 19.3. `UpdateTenantSettingDto`

```typescript id="tsp-api-dto-update-tenant-setting"
type UpdateTenantSettingDto = {
  value: unknown;
  effectiveFrom?: string;
  reason?: string;
};
```

---

## 19.4. `ScheduleTenantSettingDto`

```typescript id="tsp-api-dto-schedule-tenant-setting"
type ScheduleTenantSettingDto = {
  value: unknown;
  effectiveFrom: string;
  reason: string;
};
```

---

## 19.5. `CreatePolicyDefinitionDto`

```typescript id="tsp-api-dto-create-policy-definition"
type CreatePolicyDefinitionDto = {
  policyKey: string;
  category: TenantSettingCategory;
  ownerModule: string;
  schema: Record<string, unknown>;
  defaultPolicy: Record<string, unknown>;
  description?: string;
  criticality: TenantPolicyCriticality;
  sensitivity: TenantSettingSensitivity;
  isTenantOverridable: boolean;
  versioningRequired: boolean;
  approvalRequired: boolean;
  residentVisible: boolean;
};
```

---

## 19.6. `CreateTenantPolicyVersionDto`

```typescript id="tsp-api-dto-create-policy-version"
type CreateTenantPolicyVersionDto = {
  policyPayload: Record<string, unknown>;
  changeReason: string;
};
```

---

## 19.7. `UpdateTenantPolicyVersionDto`

```typescript id="tsp-api-dto-update-policy-version"
type UpdateTenantPolicyVersionDto = {
  policyPayload?: Record<string, unknown>;
  changeReason?: string;
};
```

---

## 19.8. `ApprovePolicyVersionDto`

```typescript id="tsp-api-dto-approve-policy-version"
type ApprovePolicyVersionDto = {
  approvalReason: string;
  reviewNotes?: string;
};
```

---

## 19.9. `RejectPolicyVersionDto`

```typescript id="tsp-api-dto-reject-policy-version"
type RejectPolicyVersionDto = {
  rejectionReason: string;
};
```

---

## 19.10. `ActivatePolicyVersionDto`

```typescript id="tsp-api-dto-activate-policy-version"
type ActivatePolicyVersionDto = {
  effectiveFrom: string;
  activationReason: string;
};
```

---

## 19.11. `RollbackPolicyDto`

```typescript id="tsp-api-dto-rollback-policy"
type RollbackPolicyDto = {
  targetPolicyVersionId: string;
  effectiveFrom: string;
  rollbackReason: string;
};
```

---

## 19.12. `CreatePolicyExceptionDto`

```typescript id="tsp-api-dto-create-exception"
type CreatePolicyExceptionDto = {
  policyKey: string;
  policyVersionId?: string;
  exceptionType: TenantPolicyExceptionType;
  targetResourceType?: string;
  targetResourceId?: string;
  exceptionPayload: Record<string, unknown>;
  validFrom: string;
  validUntil: string;
  reason: string;
};
```

---

## 19.13. `ApprovePolicyExceptionDto`

```typescript id="tsp-api-dto-approve-exception"
type ApprovePolicyExceptionDto = {
  approvalReason: string;
};
```

---

## 19.14. `RevokePolicyExceptionDto`

```typescript id="tsp-api-dto-revoke-exception"
type RevokePolicyExceptionDto = {
  revokeReason: string;
};
```

---

## 19.15. `TenantSettingsExportDto`

```typescript id="tsp-api-dto-export"
type TenantSettingsExportDto = {
  exportType: TenantSettingsExportType;
  format: TenantSettingsExportFormat;
  category?: TenantSettingCategory;
  policyKey?: string;
  includeHistory?: boolean;
  includeExceptions?: boolean;
  includeSensitive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
};
```

---

# 20. Campos prohibidos en DTOs externos

Todos los DTOs externos deben rechazar:

```text id="tsp-api-forbidden-dto-fields"
tenantId
createdBy
updatedBy
activatedBy
approvedBy
reviewedBy
rejectedBy
archivedBy
requestedBy
revokedBy
cancelledBy
actorUserProfileId
status directo fuera de endpoint de transición
versionNumber
versionLabel
settingValueId arbitrario
policyVersionId cross-tenant
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
paymentOrderId
supplierPaymentOrderId
journalEntryId
journalEntryLineId
bankTransactionId
reconciliationMatchId
reconciliationSessionId
gateOpenCommand
hardwareDeviceCommand
biometricTemplate
faceEmbedding
externalAiEnabled
externalAiRealDataAllowed
```

Respuesta esperada:

```http id="tsp-api-forbidden-dto-response"
422 Unprocessable Entity
```

---

# 21. Campos prohibidos en responses

```text id="tsp-api-forbidden-response-fields"
storageKey
signedUrl persistente
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
raw stack trace
SQL raw
datos cross-tenant
payload sensible no sanitizado
```

---

# 22. Enums API

## 22.1. Categories

```text id="tsp-api-enum-category"
TenantSettingCategory:
- general
- financial
- billing
- payments
- accountStatements
- reservations
- fines
- meetings
- voting
- communications
- documents
- accessControl
- maintenance
- inventory
- suppliers
- accounting
- bankReconciliation
- reports
- privacy
- security
- modules
```

---

## 22.2. Value types

```text id="tsp-api-enum-value-type"
TenantSettingValueType:
- string
- number
- integer
- boolean
- decimalString
- date
- time
- duration
- enum
- stringArray
- object
- json
```

---

## 22.3. Sensitivity

```text id="tsp-api-enum-sensitivity"
TenantSettingSensitivity:
- publicSummary
- internal
- restricted
- securitySensitive
- privacySensitive
- financialSensitive
```

---

## 22.4. Definition status

```text id="tsp-api-enum-definition-status"
DefinitionStatus:
- active
- deprecated
- archived
```

---

## 22.5. Tenant setting value status

```text id="tsp-api-enum-setting-status"
TenantSettingValueStatus:
- draft
- active
- scheduled
- expired
- archived
```

---

## 22.6. Tenant setting source

```text id="tsp-api-enum-setting-source"
TenantSettingSource:
- platformDefault
- tenantOverride
- import
- migration
- system
```

---

## 22.7. Policy criticality

```text id="tsp-api-enum-policy-criticality"
TenantPolicyCriticality:
- low
- medium
- high
- critical
```

---

## 22.8. Policy version status

```text id="tsp-api-enum-policy-version-status"
TenantPolicyVersionStatus:
- draft
- reviewReady
- approved
- rejected
- scheduled
- active
- superseded
- expired
- archived
```

---

## 22.9. Activation

```text id="tsp-api-enum-activation"
TenantPolicyActivationType:
- immediate
- scheduled
- rollback
- systemExpiration

TenantPolicyActivationStatus:
- scheduled
- applied
- cancelled
- failed
- archived
```

---

## 22.10. Policy exceptions

```text id="tsp-api-enum-exception"
TenantPolicyExceptionType:
- temporaryOverride
- resourceOverride
- userRoleOverride
- unitOverride
- manualAdministrativeOverride

TenantPolicyExceptionStatus:
- draft
- pendingApproval
- approved
- active
- expired
- revoked
- rejected
- archived
```

---

## 22.11. Export

```text id="tsp-api-enum-export"
TenantSettingsExportType:
- settings
- policies
- policyHistory
- policyExceptions
- fullAdministrativeSnapshot

TenantSettingsExportFormat:
- json
- xlsx
- pdf

TenantSettingsExportStatus:
- requested
- processing
- completed
- failed
- archived
```

---

# 23. Errores

## 23.1. Setting definitions

```text id="tsp-api-errors-setting-definitions"
SETTING_DEFINITION_NOT_FOUND
SETTING_DEFINITION_DUPLICATE_KEY
SETTING_DEFINITION_ARCHIVED
SETTING_DEFINITION_INVALID_KEY
SETTING_DEFINITION_INVALID_DEFAULT_VALUE
SETTING_DEFINITION_SECRET_FORBIDDEN
SETTING_DEFINITION_EXECUTABLE_PAYLOAD_FORBIDDEN
SETTING_DEFINITION_NOT_TENANT_OVERRIDABLE
```

---

## 23.2. Tenant settings

```text id="tsp-api-errors-tenant-settings"
TENANT_SETTING_NOT_FOUND
TENANT_SETTING_INVALID_VALUE
TENANT_SETTING_INVALID_VALUE_TYPE
TENANT_SETTING_SCHEMA_VALIDATION_FAILED
TENANT_SETTING_INVALID_EFFECTIVE_WINDOW
TENANT_SETTING_REASON_REQUIRED
TENANT_SETTING_SENSITIVE_PERMISSION_REQUIRED
TENANT_SETTING_CROSS_TENANT_REFERENCE
TENANT_SETTING_STATUS_INVALID
TENANT_SETTING_ACTIVE_OVERLAP
```

---

## 23.3. Policy definitions

```text id="tsp-api-errors-policy-definitions"
POLICY_DEFINITION_NOT_FOUND
POLICY_DEFINITION_DUPLICATE_KEY
POLICY_DEFINITION_ARCHIVED
POLICY_DEFINITION_INVALID_KEY
POLICY_DEFINITION_INVALID_SCHEMA
POLICY_DEFINITION_INVALID_DEFAULT_POLICY
POLICY_DEFINITION_SECRET_FORBIDDEN
POLICY_DEFINITION_EXECUTABLE_PAYLOAD_FORBIDDEN
POLICY_DEFINITION_NOT_TENANT_OVERRIDABLE
```

---

## 23.4. Policy versions

```text id="tsp-api-errors-policy-versions"
TENANT_POLICY_NOT_FOUND
TENANT_POLICY_VERSION_NOT_FOUND
TENANT_POLICY_VERSION_INVALID_STATUS
TENANT_POLICY_VERSION_SCHEMA_VALIDATION_FAILED
TENANT_POLICY_VERSION_CHANGE_REASON_REQUIRED
TENANT_POLICY_VERSION_APPROVAL_REQUIRED
TENANT_POLICY_VERSION_SENSITIVE_PERMISSION_REQUIRED
TENANT_POLICY_VERSION_ACTIVE_IMMUTABLE
TENANT_POLICY_VERSION_REJECTED_CANNOT_ACTIVATE
TENANT_POLICY_VERSION_ARCHIVED_CANNOT_ACTIVATE
TENANT_POLICY_VERSION_EFFECTIVE_OVERLAP
TENANT_POLICY_VERSION_RETROACTIVE_FORBIDDEN
TENANT_POLICY_VERSION_CROSS_TENANT_REFERENCE
```

---

## 23.5. Policy activations

```text id="tsp-api-errors-activations"
TENANT_POLICY_ACTIVATION_NOT_FOUND
TENANT_POLICY_ACTIVATION_INVALID_STATUS
TENANT_POLICY_ACTIVATION_REASON_REQUIRED
TENANT_POLICY_ACTIVATION_EFFECTIVE_FROM_REQUIRED
TENANT_POLICY_ACTIVATION_OVERLAP
TENANT_POLICY_ACTIVATION_ROLLBACK_TARGET_INVALID
TENANT_POLICY_ACTIVATION_CROSS_TENANT_REFERENCE
```

---

## 23.6. Policy exceptions

```text id="tsp-api-errors-exceptions"
TENANT_POLICY_EXCEPTION_NOT_FOUND
TENANT_POLICY_EXCEPTION_INVALID_STATUS
TENANT_POLICY_EXCEPTION_INVALID_TYPE
TENANT_POLICY_EXCEPTION_REASON_REQUIRED
TENANT_POLICY_EXCEPTION_INVALID_WINDOW
TENANT_POLICY_EXCEPTION_APPROVAL_REQUIRED
TENANT_POLICY_EXCEPTION_SENSITIVE_PERMISSION_REQUIRED
TENANT_POLICY_EXCEPTION_TARGET_INVALID
TENANT_POLICY_EXCEPTION_CROSS_TENANT_REFERENCE
TENANT_POLICY_EXCEPTION_REVOKE_REASON_REQUIRED
```

---

## 23.7. Exportaciones y SDS

```text id="tsp-api-errors-exports"
TENANT_SETTINGS_EXPORT_INVALID_TYPE
TENANT_SETTINGS_EXPORT_INVALID_FORMAT
TENANT_SETTINGS_EXPORT_REASON_REQUIRED
TENANT_SETTINGS_EXPORT_SENSITIVE_PERMISSION_REQUIRED
TENANT_SETTINGS_EXPORT_FAILED
TENANT_SETTINGS_EXPORT_DOCUMENT_FAILED
TENANT_SETTINGS_EXPORT_STORAGE_KEY_FORBIDDEN
```

---

## 23.8. Seguridad y límites

```text id="tsp-api-errors-security"
TENANT_SETTINGS_PUBLIC_ENDPOINT_FORBIDDEN
TENANT_SETTINGS_WORDPRESS_ACCESS_FORBIDDEN
TENANT_SETTINGS_SECRET_FORBIDDEN
TENANT_SETTINGS_EXECUTABLE_PAYLOAD_FORBIDDEN
TENANT_SETTINGS_RAW_SQL_FORBIDDEN
TENANT_SETTINGS_TRANSACTION_SIDE_EFFECT_FORBIDDEN
TENANT_SETTINGS_EXTERNAL_AI_FORBIDDEN
TENANT_SETTINGS_STORAGE_KEY_FORBIDDEN
```

---

# 24. Códigos HTTP

| Caso                         |                      Código |
| ---------------------------- | --------------------------: |
| Creación exitosa             |               `201 Created` |
| Lectura exitosa              |                    `200 OK` |
| Actualización exitosa        |                    `200 OK` |
| Transición exitosa           |                    `200 OK` |
| Validación fallida           |               `400` o `422` |
| No autenticado               |          `401 Unauthorized` |
| Sin permiso                  |             `403 Forbidden` |
| Recurso no encontrado        |             `404 Not Found` |
| Recurso cross-tenant         |             `404 Not Found` |
| Estado inválido              |              `409 Conflict` |
| Superposición de vigencia    |              `409 Conflict` |
| Retroactividad no autorizada |             `403 Forbidden` |
| Rate limit                   |     `429 Too Many Requests` |
| Error interno                | `500 Internal Server Error` |

---

# 25. Integración con Secure Document Storage

## 25.1. Uso permitido

```text id="tsp-api-sds-use"
tenant_settings_exports.secureDocumentId
exports administrativos de settings
exports administrativos de policies
exports de historial
exports de excepciones
snapshots administrativos completos
```

---

## 25.2. Validaciones

```text id="tsp-api-sds-validations"
- secureDocumentId pertenece al tenant.
- secureDocumentId está activo.
- sourceModule compatible = tenantSettingsPolicies.
- visibility administrativa.
- sensitivity internal/restricted según export.
- usuario tiene permiso de exportación.
```

---

## 25.3. Prohibido

```text id="tsp-api-sds-forbidden"
storageKey
signedUrl persistente
base64
rawFilePayload
binary payload en JSON
```

---

# 26. Integración con módulos consumidores

## 26.1. Regla general

```text id="tsp-api-consumer-rule"
Tenant Settings and Policies entrega configuración efectiva; el módulo consumidor ejecuta su propia validación, transacción, autorización y auditoría.
```

---

## 26.2. Prohibido

```text id="tsp-api-consumer-forbidden"
- crear Charge;
- crear Payment;
- crear SupplierPayable;
- crear SupplierPaymentOrder;
- crear JournalEntry;
- confirmar Bank Reconciliation;
- crear Reservation;
- crear Fine;
- modificar WorkOrder;
- modificar Stock;
- modificar AccessEvent;
- abrir portones;
- controlar hardware.
```

---

# 27. Auditoría

Eventos mínimos:

```text id="tsp-api-audit-events"
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

Metadata permitida:

```text id="tsp-api-audit-allowed"
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

Metadata prohibida:

```text id="tsp-api-audit-forbidden"
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

# 28. Observabilidad

## 28.1. Logs seguros

Eventos loggeables:

```text id="tsp-api-logs"
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

Campos permitidos:

```text id="tsp-api-log-fields-allowed"
traceId
requestId
correlationId
action
outcome
category
ownerModule
policyKey
settingKey
status
durationMs
errorCode
```

Campos prohibidos:

```text id="tsp-api-log-fields-forbidden"
tenantId como label de alta cardinalidad
secret
token
password
apiKey
privateKey
clientSecret
storageKey
signedUrl
raw policy payload sensible
raw setting value sensible
raw request body
authorization header
cookie
```

---

## 28.2. Métricas

```text id="tsp-api-metrics"
tenant_settings_updates_total
tenant_policy_versions_created_total
tenant_policy_activations_total
tenant_policy_exceptions_total
tenant_settings_exports_total
tenant_policy_cache_hits_total
tenant_policy_cache_misses_total
tenant_policy_cache_invalidations_total
```

Labels permitidos:

```text id="tsp-api-metric-labels-allowed"
category
ownerModule
status
outcome
source
```

Labels prohibidos:

```text id="tsp-api-metric-labels-forbidden"
tenantId
userId
settingValueId
policyVersionId
policyExceptionId
traceId
secretKey
```

---

# 29. Rate limiting

Aplicar rate limit reforzado en:

```text id="tsp-api-rate-limited"
PATCH /api/v1/tenant/settings/{key}
POST  /api/v1/tenant/settings/{key}/schedule
POST  /api/v1/tenant/policies/{policyKey}/versions
POST  /api/v1/tenant/policies/{policyKey}/versions/{versionId}/activate
POST  /api/v1/tenant/policies/{policyKey}/rollback
POST  /api/v1/tenant/policy-exceptions
GET   /api/v1/tenant/settings-policies/export
```

Objetivo:

```text id="tsp-api-rate-limit-objectives"
- evitar cambios masivos accidentales;
- evitar abuso de exportaciones;
- proteger configuración sensible;
- evitar presión sobre validación de schemas;
- proteger auditoría y cache invalidation.
```

---

# 30. Headers de seguridad

Todas las respuestas privadas deben incluir:

```http id="tsp-api-security-headers"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Recomendados:

```http id="tsp-api-security-headers-recommended"
Content-Security-Policy: default-src 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

CORS:

```text id="tsp-api-cors"
- no wildcard;
- no WordPress público;
- solo frontends autenticados permitidos;
- orígenes explícitos por ambiente;
- credentials solo si están justificados y configurados de forma segura.
```

---

# 31. OpenAPI

## 31.1. Tags

```text id="tsp-api-openapi-tags"
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

## 31.2. Extensiones globales

```yaml id="tsp-api-openapi-global"
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

## 31.3. Rutas tenant

```yaml id="tsp-api-openapi-tenant"
x-tenant-scope: true
x-permission-required: true
```

---

## 31.4. Rutas platform

```yaml id="tsp-api-openapi-platform"
x-platform-scope: true
x-platform-admin-required: true
```

---

## 31.5. Rutas `/me`

```yaml id="tsp-api-openapi-me"
x-own-resource-scope: true
x-resident-visible-summary-only: true
x-sensitive-settings-exposed: false
```

---

## 31.6. Rutas de exportación

```yaml id="tsp-api-openapi-export"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

## 31.7. OpenAPI no debe documentar

```text id="tsp-api-openapi-forbidden"
tenantId en DTOs externos
actor fields en DTOs externos
versionNumber desde cliente
status directo fuera de transición
storageKey
signedUrl persistente
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
/api/v1/public/tenant-settings
/api/v1/public/tenant-policies
```

---

# 32. Endpoints públicos prohibidos

No implementar:

```text id="tsp-api-forbidden-public-endpoints"
GET  /api/v1/public/tenant-settings
GET  /api/v1/public/tenant-policies
GET  /api/v1/public/settings-policies
GET  /api/v1/public/tenants/{slug}/settings
GET  /api/v1/public/tenants/{slug}/policies
POST /api/v1/public/tenants/{slug}/settings
POST /api/v1/public/tenants/{slug}/policies
```

Respuesta esperada:

```http id="tsp-api-public-endpoints-response"
404 Not Found
```

---

# 33. Casos de borde

## 33.1. Setting no tenant-overridable

Respuesta:

```http id="tsp-api-edge-not-overridable-http"
403 Forbidden
```

Error:

```json id="tsp-api-edge-not-overridable"
{
  "error": {
    "code": "SETTING_DEFINITION_NOT_TENANT_OVERRIDABLE",
    "message": "This setting cannot be overridden by tenant.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 33.2. Payload con secret

Respuesta:

```http id="tsp-api-edge-secret-http"
422 Unprocessable Entity
```

Error:

```json id="tsp-api-edge-secret"
{
  "error": {
    "code": "TENANT_SETTINGS_SECRET_FORBIDDEN",
    "message": "Secrets are not allowed in tenant settings or policies.",
    "details": {
      "field": "clientSecret"
    },
    "traceId": "trace-id"
  }
}
```

---

## 33.3. Payload ejecutable

Respuesta:

```http id="tsp-api-edge-executable-http"
422 Unprocessable Entity
```

Error:

```json id="tsp-api-edge-executable"
{
  "error": {
    "code": "TENANT_SETTINGS_EXECUTABLE_PAYLOAD_FORBIDDEN",
    "message": "Executable policy payloads are not allowed.",
    "details": {
      "field": "script"
    },
    "traceId": "trace-id"
  }
}
```

---

## 33.4. Schema validation failed

Respuesta:

```http id="tsp-api-edge-schema-http"
422 Unprocessable Entity
```

Error:

```json id="tsp-api-edge-schema"
{
  "error": {
    "code": "TENANT_POLICY_VERSION_SCHEMA_VALIDATION_FAILED",
    "message": "Policy payload does not match policy schema.",
    "details": {
      "path": "defaultAccessPassTtlMinutes",
      "reason": "Value must be greater than or equal to 5."
    },
    "traceId": "trace-id"
  }
}
```

---

## 33.5. Activación retroactiva sin permiso

Respuesta:

```http id="tsp-api-edge-retroactive-http"
403 Forbidden
```

Error:

```json id="tsp-api-edge-retroactive"
{
  "error": {
    "code": "TENANT_POLICY_VERSION_RETROACTIVE_FORBIDDEN",
    "message": "Retroactive policy activation requires explicit permission.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 33.6. Superposición de vigencia

Respuesta:

```http id="tsp-api-edge-overlap-http"
409 Conflict
```

Error:

```json id="tsp-api-edge-overlap"
{
  "error": {
    "code": "TENANT_POLICY_VERSION_EFFECTIVE_OVERLAP",
    "message": "Policy version effective window overlaps with another active policy version.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 33.7. StorageKey enviado

Respuesta:

```http id="tsp-api-edge-storagekey-http"
422 Unprocessable Entity
```

Error:

```json id="tsp-api-edge-storagekey"
{
  "error": {
    "code": "TENANT_SETTINGS_STORAGE_KEY_FORBIDDEN",
    "message": "Storage keys are not accepted by Tenant Settings and Policies API.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 33.8. Recurso cross-tenant

Respuesta:

```http id="tsp-api-edge-cross-tenant-http"
404 Not Found
```

Error:

```json id="tsp-api-edge-cross-tenant"
{
  "error": {
    "code": "TENANT_POLICY_VERSION_NOT_FOUND",
    "message": "Policy version not found.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

# 34. Validaciones críticas por endpoint

## 34.1. Update tenant setting

```text id="tsp-api-validate-update-setting"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Rechaza tenantId.
[ ] Rechaza actor fields.
[ ] Rechaza secrets.
[ ] Rechaza scripts.
[ ] Rechaza rawSql.
[ ] Valida SettingDefinition.
[ ] Valida isTenantOverridable.
[ ] Valida valueType/schema.
[ ] Requiere reason si crítico.
[ ] Persiste tenant-scoped.
[ ] Invalida cache.
[ ] Audita tenantSetting.updated.
```

---

## 34.2. Create policy version

```text id="tsp-api-validate-create-policy-version"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Rechaza tenantId.
[ ] Rechaza versionNumber.
[ ] Rechaza status.
[ ] Rechaza secrets.
[ ] Rechaza executable payload.
[ ] Valida PolicyDefinition.
[ ] Valida policyPayload contra schema.
[ ] Genera versionNumber server-side.
[ ] Crea draft.
[ ] No modifica active.
[ ] Audita tenantPolicyVersion.created.
```

---

## 34.3. Activate policy version

```text id="tsp-api-validate-activate-policy"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Valida version tenant-scoped.
[ ] Valida estado approved.
[ ] Valida effectiveFrom.
[ ] Valida retroactividad.
[ ] Valida no overlap.
[ ] Crea TenantPolicyActivation.
[ ] Cambia status active/scheduled.
[ ] Ajusta versión anterior si aplica.
[ ] Invalida cache post-commit.
[ ] Audita tenantPolicyVersion.activated.
```

---

## 34.4. Create exception

```text id="tsp-api-validate-create-exception"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Valida policyKey.
[ ] Valida targetResource si aplica.
[ ] Valida validUntil > validFrom.
[ ] Valida exceptionPayload.
[ ] Requiere reason.
[ ] Evalúa sensibilidad.
[ ] pendingApproval si requiere aprobación.
[ ] Invalida cache si queda active.
[ ] Audita tenantPolicyException.created.
```

---

## 34.5. Export settings/policies

```text id="tsp-api-validate-export"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantSettings.export.
[ ] SensitivePermissionGuard si includeSensitive=true.
[ ] Valida exportType.
[ ] Valida format.
[ ] Requiere reason si sensible.
[ ] Sanitiza filtros.
[ ] Excluye secrets.
[ ] Excluye scripts.
[ ] Crea export record.
[ ] Crea SecureDocument.
[ ] Devuelve secureDocumentId.
[ ] No devuelve storageKey.
[ ] Audita tenantSettings.exported.
```

---

# 35. Criterios de aceptación API

```text id="tsp-api-acceptance"
[ ] Tenant Admin API requiere autenticación.
[ ] Tenant Admin API requiere TenantGuard.
[ ] Tenant Admin API requiere permisos.
[ ] Platform API requiere PlatformPermissionGuard.
[ ] /me API solo expone summaries residentVisible.
[ ] Public API no existe.
[ ] WordPress público no accede.
[ ] Settings efectivos se resuelven correctamente.
[ ] Settings default se usan si no hay override.
[ ] Settings actualizados validan schema.
[ ] Policy versions se crean como draft.
[ ] versionNumber se genera server-side.
[ ] Active policy no se edita destructivamente.
[ ] Review/approve/reject funcionan.
[ ] Activate/schedule funcionan.
[ ] Retroactividad requiere permiso reforzado.
[ ] Effective policy resuelve por effectiveAt.
[ ] Exceptions con vigencia funcionan.
[ ] Exceptions revoked/expired no aplican.
[ ] History es tenant-scoped.
[ ] Exports usan SDS.
[ ] Response no devuelve storageKey.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan secrets.
[ ] DTOs rechazan scripts.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan executableCode.
[ ] API no crea pagos.
[ ] API no crea JournalEntry.
[ ] API no confirma Bank Reconciliation.
[ ] API no modifica módulos consumidores.
[ ] API no envía datos reales a IA externa.
[ ] Audit se emite en cambios críticos.
[ ] OpenAPI no documenta campos prohibidos.
```

---

# 36. No aceptación

No se acepta el contrato si:

```text id="tsp-api-no-acceptance"
- define endpoints públicos de settings/policies;
- permite acceso desde WordPress público;
- permite tenantId en body;
- permite actor fields en body;
- permite versionNumber desde cliente;
- permite status directo fuera de endpoint de transición;
- permite secrets;
- permite tokens;
- permite passwords;
- permite apiKeys;
- permite privateKeys;
- permite clientSecrets;
- permite rawSql;
- permite scripts;
- permite JavaScript configurable;
- permite functionBody;
- permite executableCode;
- permite shellCommand;
- permite cronCommand;
- permite storageKey;
- devuelve storageKey;
- devuelve signedUrl persistente;
- expone settings sensibles en /me;
- permite policyPayload ejecutable;
- permite settings cross-tenant;
- permite policies cross-tenant;
- permite activaciones superpuestas sin control;
- permite editar active policy destructivamente;
- permite excepción sin vigencia;
- permite export sin SDS;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- modifica datos transaccionales de módulos consumidores;
- abre portones;
- controla hardware;
- habilita biometría;
- habilita reconocimiento facial;
- habilita IA externa con datos reales;
- omite auditoría de cambios críticos.
```

---

# 37. Resultado esperado

Al implementar este contrato, `025-tenant-settings-policies` tendrá una API REST privada, segura, tenant-scoped, versionada, auditada y preparada para resolver configuración efectiva de RESIDENT Core.

Resultado esperado:

```text id="tsp-api-expected-result"
Platform Setting Definitions API definida
Platform Policy Definitions API definida
Tenant Settings API definida
Tenant Policies API definida
Policy Versions API definida
Policy Activation API definida
Policy Rollback API definida
Policy Exceptions API definida
Effective Policy API definida
Settings History API definida
Policy History API definida
Settings Policies Export API definida
/me Policy Summaries API definida
Internal Effective Setting Port definido
Internal Effective Policy Port definido
permissions definidos
sensitive permissions definidos
DTOs definidos
forbidden fields definidos
errors definidos
OpenAPI extensions definidas
tenant isolation definido
schema validation definido
versioning definido
effective dating definido
policy exceptions definido
SDS export definido
audit definido
observability definida
no public endpoints
no WordPress access
no secrets
no executable payload
no raw SQL
no storageKey exposure
no transaction side effects
no external AI with real data
```

---

# 38. Expediente actualizado

```text id="tsp-api-expediente"
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
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
