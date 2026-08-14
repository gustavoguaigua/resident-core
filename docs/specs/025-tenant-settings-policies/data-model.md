# Data Model — 025 Tenant Settings and Policies

> **Slice vigente de Sprint 2:** el Prisma autorizado por GAP-S2-006 contiene sólo los
> enums mínimos, `SettingDefinition` y `TenantSettingValue`. Los modelos de policies,
> activaciones, excepciones, change logs y exports quedan fuera. `general.timezone` y
> `general.currency` no son definitions porque sus columnas canónicas están en
> `Tenant`.

## 1. Información del documento

| Campo                  | Valor                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                 |
| Spec ID                | 025                                                                                           |
| Módulo                 | Tenant Settings and Policies                                                                  |
| Documento              | Data Model                                                                                    |
| Ruta                   | `docs/specs/025-tenant-settings-policies/data-model.md`                                       |
| Versión                | 0.1                                                                                           |
| Estado                 | needs-review                                                                                  |
| Fecha                  | 2026-07-31                                                                                    |
| Documento base         | `docs/specs/025-tenant-settings-policies/spec.md`                                             |
| Plan técnico           | `docs/specs/025-tenant-settings-policies/plan.md`                                             |
| Base de datos          | PostgreSQL                                                                                    |
| ORM                    | Prisma                                                                                        |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                   |
| Naturaleza             | Tenant-scoped / Configuration-governed / Policy-driven / Versioned / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `025-tenant-settings-policies`.

El modelo permite administrar settings, definitions, políticas versionadas, activaciones, excepciones, historial, resolución efectiva, exportaciones y trazabilidad de cambios para cada tenant.

Regla central del modelo de datos:

```text id="tsp-dm-rule"
Todo valor, versión, activación, excepción, historial y exportación de Tenant Settings and Policies debe pertenecer a un tenant, validar su schema, conservar vigencia temporal, preservar trazabilidad, impedir cambios destructivos de políticas activas, impedir secretos, impedir código ejecutable, impedir configuración pública sensible, impedir acceso desde WordPress público, impedir efectos transaccionales directos, impedir storageKey expuesto y bloquear IA externa con datos reales.
```

---

## 3. Principios del modelo

```text id="tsp-dm-principles"
1. Definitions globales; values tenant-scoped.
2. Policies críticas versionadas.
3. Vigencia explícita por effectiveFrom/effectiveUntil.
4. Una sola política efectiva por tenant + policyKey + effectiveAt.
5. Settings y policies no almacenan secretos.
6. Settings y policies no almacenan scripts ni código ejecutable.
7. Cambios críticos generan historial y auditoría.
8. Activaciones no borran historial anterior.
9. Rollback crea nueva activación, no elimina activaciones previas.
10. Exportaciones usan Secure Document Storage.
11. No se guarda storageKey.
12. No se crean pagos, asientos contables ni conciliaciones.
13. No se modifican datos transaccionales de otros módulos.
14. No existen datos públicos para WordPress.
```

---

## 4. Tablas del módulo

### 4.1. Tablas platform/global

```text id="tsp-platform-tables"
setting_definitions
policy_definitions
```

Estas tablas definen el catálogo global de settings y policies conocidos por la plataforma.

No contienen valores reales de tenant.

---

### 4.2. Tablas tenant-scoped

```text id="tsp-tenant-tables"
tenant_setting_values
tenant_policy_versions
tenant_policy_activations
tenant_policy_exceptions
tenant_settings_change_logs
tenant_settings_exports
```

Todas estas tablas deben incluir:

```text id="tsp-common-tenant-fields"
tenant_id
created_at
updated_at
archived_at
```

---

## 5. Dependencias externas

### 5.1. Referencias internas

```text id="tsp-internal-references"
tenant_id -> tenants.id
created_by -> user_profiles.id
updated_by -> user_profiles.id
reviewed_by -> user_profiles.id
approved_by -> user_profiles.id
rejected_by -> user_profiles.id
activated_by -> user_profiles.id
archived_by -> user_profiles.id
requested_by -> user_profiles.id
revoked_by -> user_profiles.id
```

---

### 5.2. Referencias por puerto

Algunas referencias se conservan como UUID sin FK física directa para evitar acoplamiento fuerte entre módulos:

```text id="tsp-port-references"
secure_document_id
target_resource_id
policy_consumer_resource_id
```

Reglas:

```text id="tsp-port-reference-rules"
- secure_document_id se valida mediante Secure Document Storage.
- target_resource_id se valida por el módulo dueño si aplica.
- No se deben usar FK directas a tablas transaccionales de módulos consumidores.
- No se deben crear efectos transaccionales desde este módulo.
```

---

## 6. Tabla `setting_definitions`

### 6.1. Propósito

Define los settings conocidos por la plataforma y sus reglas de validación.

No pertenece a un tenant específico.

---

### 6.2. Campos

| Campo                   |         Tipo | Requerido | Descripción                     |
| ----------------------- | -----------: | --------: | ------------------------------- |
| `id`                    |         UUID |        Sí | Identificador de la definición  |
| `key`                   | varchar(160) |        Sí | Clave única del setting         |
| `category`              |         enum |        Sí | Categoría funcional             |
| `value_type`            |         enum |        Sí | Tipo de valor esperado          |
| `default_value`         |        jsonb |        Sí | Valor por defecto seguro        |
| `allowed_values`        |        jsonb |        No | Lista de valores permitidos     |
| `schema`                |        jsonb |        No | JSON Schema para validación     |
| `description`           |         text |        No | Descripción funcional           |
| `sensitivity`           |         enum |        Sí | Sensibilidad del setting        |
| `is_tenant_overridable` |      boolean |        Sí | Si tenant puede modificarlo     |
| `is_runtime_critical`   |      boolean |        Sí | Si afecta operación en runtime  |
| `requires_restart`      |      boolean |        Sí | Si requiere reinicio            |
| `resident_visible`      |      boolean |        Sí | Si puede resumirse a residentes |
| `status`                |         enum |        Sí | Estado de la definición         |
| `created_by`            |         UUID |        Sí | Actor creador                   |
| `updated_by`            |         UUID |        No | Último actor modificador        |
| `archived_by`           |         UUID |        No | Actor que archivó               |
| `created_at`            |  timestamptz |        Sí | Fecha de creación               |
| `updated_at`            |  timestamptz |        Sí | Fecha de actualización          |
| `archived_at`           |  timestamptz |        No | Fecha de archivo lógico         |

---

### 6.3. Reglas

```text id="tsp-setting-def-rules"
- key debe ser único.
- key debe usar formato category.name.
- default_value debe validar contra value_type/schema.
- No se permite default_value con secretos.
- No se permite schema con campos ejecutables.
- resident_visible=false para settings sensibles.
- PlatformAdmin autorizado administra definitions.
- archived no se usa para nuevos values.
```

---

### 6.4. Ejemplos de keys

```text id="tsp-setting-keys"
general.locale
financial.paymentValidationRequired
documents.downloadAuditRequired
accessControl.defaultAccessPassTtlMinutes
security.externalAiRealDataAllowed
security.publicSettingsApiEnabled
```

---

## 7. Tabla `tenant_setting_values`

### 7.1. Propósito

Almacena valores de settings por tenant, con vigencia y trazabilidad.

---

### 7.2. Campos

| Campo                   |         Tipo | Requerido | Descripción                             |
| ----------------------- | -----------: | --------: | --------------------------------------- |
| `id`                    |         UUID |        Sí | Identificador del valor                 |
| `tenant_id`             |         UUID |        Sí | Tenant propietario                      |
| `setting_definition_id` |         UUID |        Sí | Definition asociada                     |
| `key`                   | varchar(160) |        Sí | Copia de clave para consulta rápida     |
| `value`                 |        jsonb |        Sí | Valor configurado                       |
| `value_type`            |         enum |        Sí | Tipo validado                           |
| `effective_from`        |  timestamptz |        Sí | Inicio de vigencia                      |
| `effective_until`       |  timestamptz |        No | Fin de vigencia                         |
| `status`                |         enum |        Sí | draft/active/scheduled/expired/archived |
| `source`                |         enum |        Sí | tenantOverride/platformDefault/import   |
| `reason`                |         text |        No | Razón del cambio                        |
| `created_by`            |         UUID |        Sí | Actor creador                           |
| `updated_by`            |         UUID |        No | Último actor modificador                |
| `activated_by`          |         UUID |        No | Actor activador                         |
| `archived_by`           |         UUID |        No | Actor archivador                        |
| `created_at`            |  timestamptz |        Sí | Fecha de creación                       |
| `updated_at`            |  timestamptz |        Sí | Fecha de actualización                  |
| `activated_at`          |  timestamptz |        No | Fecha de activación                     |
| `archived_at`           |  timestamptz |        No | Fecha de archivo lógico                 |

---

### 7.3. Reglas

```text id="tsp-setting-value-rules"
- tenant_id obligatorio.
- setting_definition_id debe existir y estar active.
- key debe coincidir con setting_definition.key.
- value debe validar contra value_type/schema.
- effective_from obligatorio.
- effective_until debe ser posterior a effective_from si existe.
- Solo puede existir un active vigente por tenant_id + key + effectiveAt.
- Settings runtimeCritical requieren reason.
- Settings security/privacy/financial requieren permiso sensible.
- No se aceptan secretos.
- No se aceptan scripts.
- No se aceptan raw SQL.
```

---

## 8. Tabla `policy_definitions`

### 8.1. Propósito

Define políticas configurables conocidas por la plataforma.

No pertenece a un tenant específico.

---

### 8.2. Campos

| Campo                   |         Tipo | Requerido | Descripción                     |
| ----------------------- | -----------: | --------: | ------------------------------- |
| `id`                    |         UUID |        Sí | Identificador de la definición  |
| `policy_key`            | varchar(180) |        Sí | Clave única de la política      |
| `category`              |         enum |        Sí | Categoría funcional             |
| `owner_module`          | varchar(120) |        Sí | Módulo dueño                    |
| `schema`                |        jsonb |        Sí | JSON Schema del policyPayload   |
| `default_policy`        |        jsonb |        Sí | Política por defecto segura     |
| `description`           |         text |        No | Descripción                     |
| `criticality`           |         enum |        Sí | Nivel crítico                   |
| `sensitivity`           |         enum |        Sí | Sensibilidad                    |
| `is_tenant_overridable` |      boolean |        Sí | Si tenant puede modificarla     |
| `versioning_required`   |      boolean |        Sí | Si exige versiones              |
| `approval_required`     |      boolean |        Sí | Si exige aprobación             |
| `resident_visible`      |      boolean |        Sí | Si puede resumirse a residentes |
| `status`                |         enum |        Sí | Estado                          |
| `created_by`            |         UUID |        Sí | Actor creador                   |
| `updated_by`            |         UUID |        No | Último actor modificador        |
| `archived_by`           |         UUID |        No | Actor archivador                |
| `created_at`            |  timestamptz |        Sí | Fecha creación                  |
| `updated_at`            |  timestamptz |        Sí | Fecha actualización             |
| `archived_at`           |  timestamptz |        No | Archivo lógico                  |

---

### 8.3. Reglas

```text id="tsp-policy-def-rules"
- policy_key debe ser único.
- policy_key debe usar formato category.namePolicy.
- owner_module obligatorio.
- schema obligatorio.
- default_policy debe validar contra schema.
- default_policy debe ser seguro.
- Políticas críticas deben tener versioning_required=true.
- Políticas sensibles deben tener approval_required=true.
- resident_visible=false si contiene configuración sensible.
- No se aceptan schemas ejecutables.
```

---

### 8.4. Ejemplos de policy keys

```text id="tsp-policy-keys"
financial.billingPolicy
financial.paymentPolicy
financial.lateFeePolicy
reservations.reservationPolicy
meetings.quorumPolicy
communications.notificationPolicy
documents.documentRetentionPolicy
accessControl.visitorAccessPolicy
maintenance.workOrderPolicy
inventory.stockPolicy
privacy.dataGovernancePolicy
security.exportPolicy
```

---

## 9. Tabla `tenant_policy_versions`

### 9.1. Propósito

Almacena versiones de políticas por tenant.

La versión activa o vigente es la fuente de configuración efectiva para módulos consumidores.

---

### 9.2. Campos

| Campo                  |         Tipo | Requerido | Descripción                            |
| ---------------------- | -----------: | --------: | -------------------------------------- |
| `id`                   |         UUID |        Sí | Identificador de versión               |
| `tenant_id`            |         UUID |        Sí | Tenant propietario                     |
| `policy_definition_id` |         UUID |        Sí | Definition asociada                    |
| `policy_key`           | varchar(180) |        Sí | Clave de política                      |
| `version_number`       |      integer |        Sí | Número incremental por tenant + policy |
| `version_label`        |  varchar(40) |        Sí | Etiqueta visible, ejemplo v1           |
| `policy_payload`       |        jsonb |        Sí | Payload validado                       |
| `status`               |         enum |        Sí | Estado de versión                      |
| `effective_from`       |  timestamptz |        No | Inicio de vigencia                     |
| `effective_until`      |  timestamptz |        No | Fin de vigencia                        |
| `change_reason`        |         text |        Sí | Razón de cambio                        |
| `review_notes`         |         text |        No | Notas de revisión                      |
| `rejection_reason`     |         text |        No | Razón de rechazo                       |
| `created_by`           |         UUID |        Sí | Actor creador                          |
| `updated_by`           |         UUID |        No | Actor actualizador                     |
| `reviewed_by`          |         UUID |        No | Actor revisor                          |
| `approved_by`          |         UUID |        No | Actor aprobador                        |
| `rejected_by`          |         UUID |        No | Actor que rechazó                      |
| `activated_by`         |         UUID |        No | Actor activador                        |
| `archived_by`          |         UUID |        No | Actor archivador                       |
| `created_at`           |  timestamptz |        Sí | Fecha creación                         |
| `updated_at`           |  timestamptz |        Sí | Fecha actualización                    |
| `reviewed_at`          |  timestamptz |        No | Fecha revisión                         |
| `approved_at`          |  timestamptz |        No | Fecha aprobación                       |
| `rejected_at`          |  timestamptz |        No | Fecha rechazo                          |
| `activated_at`         |  timestamptz |        No | Fecha activación                       |
| `archived_at`          |  timestamptz |        No | Archivo lógico                         |

---

### 9.3. Reglas

```text id="tsp-policy-version-rules"
- tenant_id obligatorio.
- policy_definition_id debe existir y estar active.
- policy_key debe coincidir con policy_definition.policy_key.
- version_number se genera server-side.
- version_label se genera server-side.
- policy_payload debe validar contra schema.
- change_reason obligatorio.
- draft puede editarse.
- active no puede editarse destructivamente.
- scheduled no puede editarse destructivamente.
- rejected no puede activarse.
- archived no puede activarse.
- effective_until debe ser posterior a effective_from si ambos existen.
- No se permiten payloads con secretos.
- No se permiten payloads ejecutables.
```

---

## 10. Tabla `tenant_policy_activations`

### 10.1. Propósito

Registra activaciones, programaciones y rollbacks lógicos de políticas.

---

### 10.2. Campos

| Campo                        |         Tipo | Requerido | Descripción                                 |
| ---------------------------- | -----------: | --------: | ------------------------------------------- |
| `id`                         |         UUID |        Sí | Identificador de activación                 |
| `tenant_id`                  |         UUID |        Sí | Tenant propietario                          |
| `policy_version_id`          |         UUID |        Sí | Versión activada                            |
| `policy_key`                 | varchar(180) |        Sí | Clave de política                           |
| `activation_type`            |         enum |        Sí | immediate/scheduled/rollback                |
| `status`                     |         enum |        Sí | scheduled/applied/cancelled/failed/archived |
| `activated_at`               |  timestamptz |        No | Fecha de ejecución real                     |
| `effective_from`             |  timestamptz |        Sí | Vigencia desde                              |
| `activation_reason`          |         text |        Sí | Razón de activación                         |
| `previous_policy_version_id` |         UUID |        No | Versión anterior                            |
| `rollback_of_activation_id`  |         UUID |        No | Activación revertida lógicamente            |
| `created_by`                 |         UUID |        Sí | Actor creador                               |
| `activated_by`               |         UUID |        No | Actor activador                             |
| `cancelled_by`               |         UUID |        No | Actor cancelador                            |
| `archived_by`                |         UUID |        No | Actor archivador                            |
| `created_at`                 |  timestamptz |        Sí | Fecha creación                              |
| `updated_at`                 |  timestamptz |        Sí | Fecha actualización                         |
| `cancelled_at`               |  timestamptz |        No | Fecha cancelación                           |
| `archived_at`                |  timestamptz |        No | Archivo lógico                              |

---

### 10.3. Reglas

```text id="tsp-policy-activation-rules"
- Activación siempre tenant-scoped.
- policy_version_id debe pertenecer al mismo tenant.
- activation_reason obligatorio.
- effective_from obligatorio.
- scheduled no aplica antes de effective_from.
- applied no se elimina.
- rollback no borra activaciones previas.
- Sólo una activación aplicada puede ser efectiva para tenant + policyKey + effectiveAt.
```

---

## 11. Tabla `tenant_policy_exceptions`

### 11.1. Propósito

Representa excepciones temporales o por recurso a una política.

---

### 11.2. Campos

| Campo                  |         Tipo | Requerido | Descripción                |
| ---------------------- | -----------: | --------: | -------------------------- |
| `id`                   |         UUID |        Sí | Identificador de excepción |
| `tenant_id`            |         UUID |        Sí | Tenant propietario         |
| `policy_definition_id` |         UUID |        Sí | Definition asociada        |
| `policy_version_id`    |         UUID |        No | Versión asociada           |
| `policy_key`           | varchar(180) |        Sí | Política afectada          |
| `exception_type`       |         enum |        Sí | Tipo de excepción          |
| `target_resource_type` | varchar(100) |        No | Tipo de recurso objetivo   |
| `target_resource_id`   |         UUID |        No | Recurso objetivo           |
| `exception_payload`    |        jsonb |        Sí | Payload validado           |
| `reason`               |         text |        Sí | Razón                      |
| `status`               |         enum |        Sí | Estado                     |
| `valid_from`           |  timestamptz |        Sí | Inicio vigencia            |
| `valid_until`          |  timestamptz |        Sí | Fin vigencia               |
| `requested_by`         |         UUID |        Sí | Actor solicitante          |
| `approved_by`          |         UUID |        No | Actor aprobador            |
| `rejected_by`          |         UUID |        No | Actor que rechazó          |
| `revoked_by`           |         UUID |        No | Actor que revocó           |
| `archived_by`          |         UUID |        No | Actor archivador           |
| `created_at`           |  timestamptz |        Sí | Fecha creación             |
| `updated_at`           |  timestamptz |        Sí | Fecha actualización        |
| `approved_at`          |  timestamptz |        No | Fecha aprobación           |
| `rejected_at`          |  timestamptz |        No | Fecha rechazo              |
| `revoked_at`           |  timestamptz |        No | Fecha revocación           |
| `archived_at`          |  timestamptz |        No | Archivo lógico             |

---

### 11.3. Reglas

```text id="tsp-policy-exception-rules"
- tenant_id obligatorio.
- policy_key obligatorio.
- reason obligatorio.
- valid_from obligatorio.
- valid_until obligatorio.
- valid_until > valid_from.
- Excepción sensible requiere aprobación.
- revoked no aplica.
- expired no aplica.
- archived no aplica.
- target_resource_id debe validarse mediante el módulo dueño si aplica.
- No se permiten excepciones multi-tenant.
- No se permiten excepciones sin vigencia.
```

---

## 12. Tabla `tenant_settings_change_logs`

### 12.1. Propósito

Registra historial funcional de cambios sanitizados.

Complementa al módulo Audit, pero no lo reemplaza.

---

### 12.2. Campos

| Campo                   |         Tipo | Requerido | Descripción                |
| ----------------------- | -----------: | --------: | -------------------------- |
| `id`                    |         UUID |        Sí | Identificador              |
| `tenant_id`             |         UUID |        Sí | Tenant propietario         |
| `entity_type`           |         enum |        Sí | Tipo de entidad modificada |
| `entity_id`             |         UUID |        Sí | Recurso modificado         |
| `action`                | varchar(120) |        Sí | Acción                     |
| `key`                   | varchar(180) |        No | Setting key o policy key   |
| `old_value_sanitized`   |        jsonb |        No | Valor anterior sanitizado  |
| `new_value_sanitized`   |        jsonb |        No | Valor nuevo sanitizado     |
| `reason`                |         text |        No | Razón                      |
| `actor_user_profile_id` |         UUID |        Sí | Actor                      |
| `trace_id`              | varchar(120) |        Sí | Trace                      |
| `created_at`            |  timestamptz |        Sí | Fecha creación             |

---

### 12.3. Reglas

```text id="tsp-change-log-rules"
- tenant_id obligatorio.
- old_value_sanitized no debe contener secretos.
- new_value_sanitized no debe contener secretos.
- No se guardan tokens.
- No se guarda rawSql.
- No se guardan scripts.
- No se guardan payloads sensibles completos si la política lo prohíbe.
- No se actualiza ni elimina ordinariamente.
```

---

## 13. Tabla `tenant_settings_exports`

### 13.1. Propósito

Registra exportaciones administrativas de settings y policies.

---

### 13.2. Campos

| Campo                |        Tipo | Requerido | Descripción                                    |
| -------------------- | ----------: | --------: | ---------------------------------------------- |
| `id`                 |        UUID |        Sí | Identificador                                  |
| `tenant_id`          |        UUID |        Sí | Tenant propietario                             |
| `export_type`        |        enum |        Sí | Tipo de exportación                            |
| `format`             |        enum |        Sí | json/xlsx/pdf                                  |
| `filters`            |       jsonb |        No | Filtros sanitizados                            |
| `status`             |        enum |        Sí | requested/processing/completed/failed/archived |
| `secure_document_id` |        UUID |        No | Documento seguro generado                      |
| `requested_by`       |        UUID |        Sí | Actor solicitante                              |
| `completed_at`       | timestamptz |        No | Fecha completado                               |
| `failed_at`          | timestamptz |        No | Fecha fallido                                  |
| `failure_reason`     |        text |        No | Razón sanitizada                               |
| `created_at`         | timestamptz |        Sí | Fecha creación                                 |
| `updated_at`         | timestamptz |        Sí | Fecha actualización                            |
| `archived_at`        | timestamptz |        No | Archivo lógico                                 |

---

### 13.3. Reglas

```text id="tsp-export-rules"
- Export siempre tenant-scoped.
- Export sensible requiere permiso reforzado.
- filters se sanitiza antes de persistir.
- secure_document_id se valida por SDS.
- completed requiere secure_document_id.
- failed requiere failure_reason sanitizado.
- No se guarda storageKey.
- No se guarda signedUrl persistente.
- No se guarda archivo raw.
```

---

## 14. Enums

### 14.1. `TenantSettingCategory`

```text id="tsp-enum-category"
general
financial
billing
payments
accountStatements
reservations
fines
meetings
voting
communications
documents
accessControl
maintenance
inventory
suppliers
accounting
bankReconciliation
reports
privacy
security
modules
```

---

### 14.2. `TenantSettingValueType`

```text id="tsp-enum-value-type"
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

### 14.3. `TenantSettingSensitivity`

```text id="tsp-enum-sensitivity"
publicSummary
internal
restricted
securitySensitive
privacySensitive
financialSensitive
```

---

### 14.4. `DefinitionStatus`

```text id="tsp-enum-definition-status"
active
deprecated
archived
```

---

### 14.5. `TenantSettingValueStatus`

```text id="tsp-enum-setting-status"
draft
active
scheduled
expired
archived
```

---

### 14.6. `TenantSettingSource`

```text id="tsp-enum-setting-source"
platformDefault
tenantOverride
import
migration
system
```

---

### 14.7. `TenantPolicyCriticality`

```text id="tsp-enum-policy-criticality"
low
medium
high
critical
```

---

### 14.8. `TenantPolicyVersionStatus`

```text id="tsp-enum-policy-version-status"
draft
reviewReady
approved
rejected
scheduled
active
superseded
expired
archived
```

---

### 14.9. `TenantPolicyActivationType`

```text id="tsp-enum-activation-type"
immediate
scheduled
rollback
systemExpiration
```

---

### 14.10. `TenantPolicyActivationStatus`

```text id="tsp-enum-activation-status"
scheduled
applied
cancelled
failed
archived
```

---

### 14.11. `TenantPolicyExceptionType`

```text id="tsp-enum-exception-type"
temporaryOverride
resourceOverride
userRoleOverride
unitOverride
manualAdministrativeOverride
```

---

### 14.12. `TenantPolicyExceptionStatus`

```text id="tsp-enum-exception-status"
draft
pendingApproval
approved
active
expired
revoked
rejected
archived
```

---

### 14.13. `TenantSettingsChangeEntityType`

```text id="tsp-enum-change-entity-type"
settingDefinition
tenantSettingValue
policyDefinition
tenantPolicyVersion
tenantPolicyActivation
tenantPolicyException
tenantSettingsExport
```

---

### 14.14. `TenantSettingsExportType`

```text id="tsp-enum-export-type"
settings
policies
policyHistory
policyExceptions
fullAdministrativeSnapshot
```

---

### 14.15. `TenantSettingsExportFormat`

```text id="tsp-enum-export-format"
json
xlsx
pdf
```

---

### 14.16. `TenantSettingsExportStatus`

```text id="tsp-enum-export-status"
requested
processing
completed
failed
archived
```

---

## 15. Prisma schema preliminar

> Este bloque es una propuesta inicial. El schema final puede ajustarse durante implementación, pero debe respetar las reglas de seguridad, multitenancy y versionamiento definidas en este documento.

```prisma id="tsp-prisma-schema"
enum TenantSettingCategory {
  general
  financial
  billing
  payments
  accountStatements
  reservations
  fines
  meetings
  voting
  communications
  documents
  accessControl
  maintenance
  inventory
  suppliers
  accounting
  bankReconciliation
  reports
  privacy
  security
  modules
}

enum TenantSettingValueType {
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
}

enum TenantSettingSensitivity {
  publicSummary
  internal
  restricted
  securitySensitive
  privacySensitive
  financialSensitive
}

enum DefinitionStatus {
  active
  deprecated
  archived
}

enum TenantSettingValueStatus {
  draft
  active
  scheduled
  expired
  archived
}

enum TenantSettingSource {
  platformDefault
  tenantOverride
  import
  migration
  system
}

enum TenantPolicyCriticality {
  low
  medium
  high
  critical
}

enum TenantPolicyVersionStatus {
  draft
  reviewReady
  approved
  rejected
  scheduled
  active
  superseded
  expired
  archived
}

enum TenantPolicyActivationType {
  immediate
  scheduled
  rollback
  systemExpiration
}

enum TenantPolicyActivationStatus {
  scheduled
  applied
  cancelled
  failed
  archived
}

enum TenantPolicyExceptionType {
  temporaryOverride
  resourceOverride
  userRoleOverride
  unitOverride
  manualAdministrativeOverride
}

enum TenantPolicyExceptionStatus {
  draft
  pendingApproval
  approved
  active
  expired
  revoked
  rejected
  archived
}

enum TenantSettingsChangeEntityType {
  settingDefinition
  tenantSettingValue
  policyDefinition
  tenantPolicyVersion
  tenantPolicyActivation
  tenantPolicyException
  tenantSettingsExport
}

enum TenantSettingsExportType {
  settings
  policies
  policyHistory
  policyExceptions
  fullAdministrativeSnapshot
}

enum TenantSettingsExportFormat {
  json
  xlsx
  pdf
}

enum TenantSettingsExportStatus {
  requested
  processing
  completed
  failed
  archived
}

model SettingDefinition {
  id                    String                   @id @default(uuid()) @db.Uuid
  key                   String                   @unique @db.VarChar(160)
  category              TenantSettingCategory
  valueType             TenantSettingValueType   @map("value_type")
  defaultValue          Json                     @map("default_value")
  allowedValues         Json?                    @map("allowed_values")
  schema                Json?
  description           String?
  sensitivity           TenantSettingSensitivity @default(internal)
  isTenantOverridable   Boolean                  @default(true) @map("is_tenant_overridable")
  isRuntimeCritical     Boolean                  @default(false) @map("is_runtime_critical")
  requiresRestart       Boolean                  @default(false) @map("requires_restart")
  residentVisible       Boolean                  @default(false) @map("resident_visible")
  status                DefinitionStatus         @default(active)

  createdBy             String                   @map("created_by") @db.Uuid
  updatedBy             String?                  @map("updated_by") @db.Uuid
  archivedBy            String?                  @map("archived_by") @db.Uuid

  createdAt             DateTime                 @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                 @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt            DateTime?                @map("archived_at") @db.Timestamptz

  tenantValues          TenantSettingValue[]

  @@index([category, status])
  @@index([sensitivity])
  @@map("setting_definitions")
}

model TenantSettingValue {
  id                    String                   @id @default(uuid()) @db.Uuid
  tenantId              String                   @map("tenant_id") @db.Uuid
  settingDefinitionId   String                   @map("setting_definition_id") @db.Uuid
  key                   String                   @db.VarChar(160)
  value                 Json
  valueType             TenantSettingValueType   @map("value_type")
  effectiveFrom         DateTime                 @map("effective_from") @db.Timestamptz
  effectiveUntil        DateTime?                @map("effective_until") @db.Timestamptz
  status                TenantSettingValueStatus @default(draft)
  source                TenantSettingSource      @default(tenantOverride)
  reason                String?

  createdBy             String                   @map("created_by") @db.Uuid
  updatedBy             String?                  @map("updated_by") @db.Uuid
  activatedBy           String?                  @map("activated_by") @db.Uuid
  archivedBy            String?                  @map("archived_by") @db.Uuid

  createdAt             DateTime                 @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                 @updatedAt @map("updated_at") @db.Timestamptz
  activatedAt           DateTime?                @map("activated_at") @db.Timestamptz
  archivedAt            DateTime?                @map("archived_at") @db.Timestamptz

  tenant                Tenant                   @relation(fields: [tenantId], references: [id])
  definition            SettingDefinition        @relation(fields: [settingDefinitionId], references: [id])

  @@index([tenantId, key, status])
  @@index([tenantId, key, effectiveFrom, effectiveUntil])
  @@index([tenantId, settingDefinitionId])
  @@map("tenant_setting_values")
}

model PolicyDefinition {
  id                    String                   @id @default(uuid()) @db.Uuid
  policyKey             String                   @unique @map("policy_key") @db.VarChar(180)
  category              TenantSettingCategory
  ownerModule           String                   @map("owner_module") @db.VarChar(120)
  schema                Json
  defaultPolicy         Json                     @map("default_policy")
  description           String?
  criticality           TenantPolicyCriticality  @default(medium)
  sensitivity           TenantSettingSensitivity @default(internal)
  isTenantOverridable   Boolean                  @default(true) @map("is_tenant_overridable")
  versioningRequired    Boolean                  @default(true) @map("versioning_required")
  approvalRequired      Boolean                  @default(false) @map("approval_required")
  residentVisible       Boolean                  @default(false) @map("resident_visible")
  status                DefinitionStatus         @default(active)

  createdBy             String                   @map("created_by") @db.Uuid
  updatedBy             String?                  @map("updated_by") @db.Uuid
  archivedBy            String?                  @map("archived_by") @db.Uuid

  createdAt             DateTime                 @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                 @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt            DateTime?                @map("archived_at") @db.Timestamptz

  versions              TenantPolicyVersion[]
  exceptions            TenantPolicyException[]

  @@index([category, status])
  @@index([ownerModule])
  @@index([sensitivity])
  @@map("policy_definitions")
}

model TenantPolicyVersion {
  id                    String                    @id @default(uuid()) @db.Uuid
  tenantId              String                    @map("tenant_id") @db.Uuid
  policyDefinitionId    String                    @map("policy_definition_id") @db.Uuid
  policyKey             String                    @map("policy_key") @db.VarChar(180)
  versionNumber         Int                       @map("version_number")
  versionLabel          String                    @map("version_label") @db.VarChar(40)
  policyPayload         Json                      @map("policy_payload")
  status                TenantPolicyVersionStatus @default(draft)
  effectiveFrom         DateTime?                 @map("effective_from") @db.Timestamptz
  effectiveUntil        DateTime?                 @map("effective_until") @db.Timestamptz
  changeReason          String                    @map("change_reason")
  reviewNotes           String?                   @map("review_notes")
  rejectionReason       String?                   @map("rejection_reason")

  createdBy             String                    @map("created_by") @db.Uuid
  updatedBy             String?                   @map("updated_by") @db.Uuid
  reviewedBy            String?                   @map("reviewed_by") @db.Uuid
  approvedBy            String?                   @map("approved_by") @db.Uuid
  rejectedBy            String?                   @map("rejected_by") @db.Uuid
  activatedBy           String?                   @map("activated_by") @db.Uuid
  archivedBy            String?                   @map("archived_by") @db.Uuid

  createdAt             DateTime                  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                  @updatedAt @map("updated_at") @db.Timestamptz
  reviewedAt            DateTime?                 @map("reviewed_at") @db.Timestamptz
  approvedAt            DateTime?                 @map("approved_at") @db.Timestamptz
  rejectedAt            DateTime?                 @map("rejected_at") @db.Timestamptz
  activatedAt           DateTime?                 @map("activated_at") @db.Timestamptz
  archivedAt            DateTime?                 @map("archived_at") @db.Timestamptz

  tenant                Tenant                    @relation(fields: [tenantId], references: [id])
  definition            PolicyDefinition          @relation(fields: [policyDefinitionId], references: [id])
  activations           TenantPolicyActivation[]
  exceptions            TenantPolicyException[]

  @@unique([tenantId, policyKey, versionNumber])
  @@index([tenantId, policyKey, status])
  @@index([tenantId, policyKey, effectiveFrom, effectiveUntil])
  @@index([tenantId, policyDefinitionId])
  @@map("tenant_policy_versions")
}

model TenantPolicyActivation {
  id                       String                       @id @default(uuid()) @db.Uuid
  tenantId                 String                       @map("tenant_id") @db.Uuid
  policyVersionId          String                       @map("policy_version_id") @db.Uuid
  policyKey                String                       @map("policy_key") @db.VarChar(180)
  activationType           TenantPolicyActivationType   @map("activation_type")
  status                   TenantPolicyActivationStatus @default(scheduled)
  activatedAt              DateTime?                    @map("activated_at") @db.Timestamptz
  effectiveFrom            DateTime                     @map("effective_from") @db.Timestamptz
  activationReason         String                       @map("activation_reason")
  previousPolicyVersionId  String?                      @map("previous_policy_version_id") @db.Uuid
  rollbackOfActivationId   String?                      @map("rollback_of_activation_id") @db.Uuid

  createdBy                String                       @map("created_by") @db.Uuid
  activatedBy              String?                      @map("activated_by") @db.Uuid
  cancelledBy              String?                      @map("cancelled_by") @db.Uuid
  archivedBy               String?                      @map("archived_by") @db.Uuid

  createdAt                DateTime                     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                DateTime                     @updatedAt @map("updated_at") @db.Timestamptz
  cancelledAt              DateTime?                    @map("cancelled_at") @db.Timestamptz
  archivedAt               DateTime?                    @map("archived_at") @db.Timestamptz

  tenant                   Tenant                       @relation(fields: [tenantId], references: [id])
  policyVersion            TenantPolicyVersion          @relation(fields: [policyVersionId], references: [id])

  @@index([tenantId, policyKey, status])
  @@index([tenantId, policyKey, effectiveFrom])
  @@index([tenantId, policyVersionId])
  @@map("tenant_policy_activations")
}

model TenantPolicyException {
  id                    String                       @id @default(uuid()) @db.Uuid
  tenantId              String                       @map("tenant_id") @db.Uuid
  policyDefinitionId    String                       @map("policy_definition_id") @db.Uuid
  policyVersionId       String?                      @map("policy_version_id") @db.Uuid
  policyKey             String                       @map("policy_key") @db.VarChar(180)
  exceptionType         TenantPolicyExceptionType    @map("exception_type")
  targetResourceType    String?                      @map("target_resource_type") @db.VarChar(100)
  targetResourceId      String?                      @map("target_resource_id") @db.Uuid
  exceptionPayload      Json                         @map("exception_payload")
  reason                String
  status                TenantPolicyExceptionStatus  @default(draft)
  validFrom             DateTime                     @map("valid_from") @db.Timestamptz
  validUntil            DateTime                     @map("valid_until") @db.Timestamptz

  requestedBy           String                       @map("requested_by") @db.Uuid
  approvedBy            String?                      @map("approved_by") @db.Uuid
  rejectedBy            String?                      @map("rejected_by") @db.Uuid
  revokedBy             String?                      @map("revoked_by") @db.Uuid
  archivedBy            String?                      @map("archived_by") @db.Uuid

  createdAt             DateTime                     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                     @updatedAt @map("updated_at") @db.Timestamptz
  approvedAt            DateTime?                    @map("approved_at") @db.Timestamptz
  rejectedAt            DateTime?                    @map("rejected_at") @db.Timestamptz
  revokedAt             DateTime?                    @map("revoked_at") @db.Timestamptz
  archivedAt            DateTime?                    @map("archived_at") @db.Timestamptz

  tenant                Tenant                       @relation(fields: [tenantId], references: [id])
  definition            PolicyDefinition             @relation(fields: [policyDefinitionId], references: [id])
  policyVersion          TenantPolicyVersion?         @relation(fields: [policyVersionId], references: [id])

  @@index([tenantId, policyKey, status])
  @@index([tenantId, policyKey, targetResourceType, targetResourceId])
  @@index([tenantId, validFrom, validUntil])
  @@map("tenant_policy_exceptions")
}

model TenantSettingsChangeLog {
  id                    String                         @id @default(uuid()) @db.Uuid
  tenantId              String                         @map("tenant_id") @db.Uuid
  entityType            TenantSettingsChangeEntityType @map("entity_type")
  entityId              String                         @map("entity_id") @db.Uuid
  action                String                         @db.VarChar(120)
  key                   String?                        @db.VarChar(180)
  oldValueSanitized     Json?                          @map("old_value_sanitized")
  newValueSanitized     Json?                          @map("new_value_sanitized")
  reason                String?
  actorUserProfileId    String                         @map("actor_user_profile_id") @db.Uuid
  traceId               String                         @map("trace_id") @db.VarChar(120)
  createdAt             DateTime                       @default(now()) @map("created_at") @db.Timestamptz

  tenant                Tenant                         @relation(fields: [tenantId], references: [id])

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, key])
  @@index([tenantId, createdAt])
  @@map("tenant_settings_change_logs")
}

model TenantSettingsExport {
  id                    String                      @id @default(uuid()) @db.Uuid
  tenantId              String                      @map("tenant_id") @db.Uuid
  exportType            TenantSettingsExportType    @map("export_type")
  format                TenantSettingsExportFormat
  filters               Json?
  status                TenantSettingsExportStatus  @default(requested)
  secureDocumentId      String?                     @map("secure_document_id") @db.Uuid
  requestedBy           String                      @map("requested_by") @db.Uuid
  completedAt           DateTime?                   @map("completed_at") @db.Timestamptz
  failedAt              DateTime?                   @map("failed_at") @db.Timestamptz
  failureReason         String?                     @map("failure_reason")
  createdAt             DateTime                    @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                    @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt            DateTime?                   @map("archived_at") @db.Timestamptz

  tenant                Tenant                      @relation(fields: [tenantId], references: [id])

  @@index([tenantId, exportType, status])
  @@index([tenantId, createdAt])
  @@index([tenantId, secureDocumentId])
  @@map("tenant_settings_exports")
}
```

---

## 16. Relaciones a agregar en `Tenant`

Agregar relaciones lógicas al modelo `Tenant` existente:

```prisma id="tsp-tenant-relations"
model Tenant {
  // existing fields...

  tenantSettingValues       TenantSettingValue[]
  tenantPolicyVersions      TenantPolicyVersion[]
  tenantPolicyActivations   TenantPolicyActivation[]
  tenantPolicyExceptions    TenantPolicyException[]
  tenantSettingsChangeLogs  TenantSettingsChangeLog[]
  tenantSettingsExports     TenantSettingsExport[]
}
```

---

## 17. Índices recomendados

### 17.1. Definitions

```text id="tsp-index-definitions"
setting_definitions:
- unique(key)
- index(category, status)
- index(sensitivity)

policy_definitions:
- unique(policy_key)
- index(category, status)
- index(owner_module)
- index(sensitivity)
```

---

### 17.2. Tenant settings

```text id="tsp-index-settings"
tenant_setting_values:
- index(tenant_id, key, status)
- index(tenant_id, key, effective_from, effective_until)
- index(tenant_id, setting_definition_id)
```

---

### 17.3. Policy versions

```text id="tsp-index-policy-versions"
tenant_policy_versions:
- unique(tenant_id, policy_key, version_number)
- index(tenant_id, policy_key, status)
- index(tenant_id, policy_key, effective_from, effective_until)
- index(tenant_id, policy_definition_id)
```

---

### 17.4. Activations

```text id="tsp-index-activations"
tenant_policy_activations:
- index(tenant_id, policy_key, status)
- index(tenant_id, policy_key, effective_from)
- index(tenant_id, policy_version_id)
```

---

### 17.5. Exceptions

```text id="tsp-index-exceptions"
tenant_policy_exceptions:
- index(tenant_id, policy_key, status)
- index(tenant_id, policy_key, target_resource_type, target_resource_id)
- index(tenant_id, valid_from, valid_until)
```

---

### 17.6. History and exports

```text id="tsp-index-history-exports"
tenant_settings_change_logs:
- index(tenant_id, entity_type, entity_id)
- index(tenant_id, key)
- index(tenant_id, created_at)

tenant_settings_exports:
- index(tenant_id, export_type, status)
- index(tenant_id, created_at)
- index(tenant_id, secure_document_id)
```

---

## 18. Constraints recomendadas

### 18.1. Effective windows

```text id="tsp-constraints-effective"
- effective_until IS NULL OR effective_until > effective_from.
- valid_until > valid_from en exceptions.
- completed export requiere secure_document_id.
- failed export requiere failure_reason.
- approved policy version requiere approved_by y approved_at.
- rejected policy version requiere rejected_by, rejected_at y rejection_reason.
- activated policy version requiere activated_by, activated_at y effective_from.
```

---

### 18.2. Partial unique indexes recomendados en PostgreSQL

Prisma puede no expresar todos los partial indexes directamente. Deben agregarse en migraciones SQL manuales si aplica.

```sql id="tsp-partial-indexes"
CREATE UNIQUE INDEX uq_tenant_setting_active_current
ON tenant_setting_values (tenant_id, key)
WHERE status = 'active' AND effective_until IS NULL AND archived_at IS NULL;

CREATE UNIQUE INDEX uq_tenant_policy_active_current
ON tenant_policy_versions (tenant_id, policy_key)
WHERE status = 'active' AND effective_until IS NULL AND archived_at IS NULL;

CREATE UNIQUE INDEX uq_tenant_policy_scheduled_same_effective
ON tenant_policy_versions (tenant_id, policy_key, effective_from)
WHERE status = 'scheduled' AND archived_at IS NULL;
```

---

### 18.3. Checks de payload prohibido

Los campos prohibidos deben validarse principalmente en aplicación, porque están dentro de JSONB.

Debe existir control para bloquear claves como:

```text id="tsp-jsonb-forbidden-keys"
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
externalAiEnabled
externalAiRealDataAllowed
storageKey
signedUrl
```

---

## 19. Estrategia de JSONB

### 19.1. Uso permitido

Campos JSONB permitidos:

```text id="tsp-jsonb-allowed"
setting_definitions.default_value
setting_definitions.allowed_values
setting_definitions.schema
tenant_setting_values.value
policy_definitions.schema
policy_definitions.default_policy
tenant_policy_versions.policy_payload
tenant_policy_exceptions.exception_payload
tenant_settings_change_logs.old_value_sanitized
tenant_settings_change_logs.new_value_sanitized
tenant_settings_exports.filters
```

---

### 19.2. Reglas

```text id="tsp-jsonb-rules"
- JSONB debe validar contra schema.
- JSONB no debe contener secretos.
- JSONB no debe contener código ejecutable.
- JSONB no debe contener raw SQL.
- JSONB no debe contener storageKey.
- JSONB no debe contener signedUrl persistente.
- JSONB no debe contener payloads transaccionales masivos.
- JSONB no debe usarse para evadir modelado de entidades críticas.
```

---

### 19.3. Sanitización previa a persistencia

Antes de persistir JSONB:

```text id="tsp-jsonb-sanitization"
[ ] Validar schema.
[ ] Validar allowed keys.
[ ] Rechazar forbidden keys.
[ ] Rechazar strings con script tags.
[ ] Rechazar raw SQL sospechoso.
[ ] Normalizar enums.
[ ] Limitar profundidad.
[ ] Limitar tamaño.
[ ] Sanitizar reason/textos libres.
```

---

## 20. Resolución de setting efectivo

### 20.1. Algoritmo

```text id="tsp-effective-setting-algorithm"
1. Recibir tenantId, key y effectiveAt.
2. Validar tenant activo.
3. Buscar TenantSettingValue active/scheduled aplicable por effectiveAt.
4. Si existe override tenant-scoped, devolver value.
5. Si no existe override, buscar SettingDefinition.
6. Devolver defaultValue.
7. Incluir source.
8. Incluir settingValueId si aplica.
9. Incluir effectiveFrom.
10. Nunca devolver secretos.
```

---

### 20.2. Shape interno recomendado

```typescript id="tsp-effective-setting-shape"
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

---

## 21. Resolución de policy efectiva

### 21.1. Algoritmo

```text id="tsp-effective-policy-algorithm"
1. Recibir tenantId, policyKey, effectiveAt y context opcional.
2. Validar tenant activo.
3. Buscar TenantPolicyVersion vigente para effectiveAt.
4. Si existe versión tenant-scoped, usar policyPayload.
5. Si no existe, usar PolicyDefinition.defaultPolicy.
6. Buscar excepciones active aprobadas y vigentes.
7. Filtrar excepciones por targetResourceType/targetResourceId si aplica.
8. Aplicar excepción según policy del módulo consumidor.
9. Devolver payload, source, versionId y exceptionIds aplicadas.
10. Nunca devolver secrets ni campos prohibidos.
```

---

### 21.2. Shape interno recomendado

```typescript id="tsp-effective-policy-shape"
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

---

## 22. Estrategia de auditoría de datos

### 22.1. Audit externo obligatorio

El módulo debe emitir eventos al módulo `007-audit` para:

```text id="tsp-dm-audit-events"
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

### 22.2. Change log interno

`tenant_settings_change_logs` guarda diferencias sanitizadas para consulta administrativa.

No debe reemplazar a Audit.

Regla:

```text id="tsp-change-log-vs-audit"
Audit es la evidencia formal de seguridad. ChangeLog es la herramienta funcional de revisión de configuración.
```

---

## 23. Campos prohibidos

### 23.1. Prohibidos como columnas

No deben existir columnas con estos nombres en tablas del módulo:

```text id="tsp-prohibited-columns"
secret
token
password
api_key
private_key
client_secret
webhook_secret
database_url
storage_key
signed_url
raw_sql
script
javascript
function_body
executable_code
cron_command
shell_command
payment_id
journal_entry_id
bank_transaction_id
reconciliation_match_id
external_ai_enabled
external_ai_real_data_allowed
```

---

### 23.2. Prohibidos en JSONB

```text id="tsp-prohibited-jsonb"
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

### 23.3. Prohibidos desde DTO externo

```text id="tsp-prohibited-external-dto"
tenantId
createdBy
updatedBy
activatedBy
approvedBy
reviewedBy
rejectedBy
archivedBy
status
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

## 24. Estados y transiciones

### 24.1. `TenantSettingValueStatus`

```text id="tsp-setting-status-transitions"
draft -> active
draft -> scheduled
scheduled -> active
active -> expired
active -> archived
scheduled -> archived
expired -> archived
```

Prohibido:

```text id="tsp-setting-status-forbidden"
archived -> active
expired -> active
active -> draft
```

---

### 24.2. `TenantPolicyVersionStatus`

```text id="tsp-policy-version-transitions"
draft -> reviewReady
reviewReady -> approved
reviewReady -> rejected
approved -> scheduled
approved -> active
scheduled -> active
active -> superseded
active -> expired
superseded -> archived
expired -> archived
rejected -> archived
```

Prohibido:

```text id="tsp-policy-version-forbidden"
active -> draft
superseded -> active directo
expired -> active directo
archived -> active
rejected -> active
```

---

### 24.3. `TenantPolicyExceptionStatus`

```text id="tsp-policy-exception-transitions"
draft -> pendingApproval
draft -> active
pendingApproval -> approved
pendingApproval -> rejected
approved -> active
active -> expired
active -> revoked
revoked -> archived
expired -> archived
rejected -> archived
```

Prohibido:

```text id="tsp-policy-exception-forbidden"
revoked -> active
expired -> active
archived -> active
rejected -> active
```

---

## 25. Estrategia de retención

### 25.1. Definitions

```text id="tsp-retention-definitions"
- No physical delete ordinario.
- Usar archived_at.
- Definitions archivadas no se usan para nuevas configuraciones.
- Definitions usadas históricamente deben conservarse para trazabilidad.
```

---

### 25.2. Policy versions and activations

```text id="tsp-retention-policies"
- No physical delete.
- Conservar versiones históricas.
- Conservar activaciones.
- Conservar rollbacks.
- Conservar effective windows.
- Archivo lógico solo para ocultar de operaciones nuevas.
```

---

### 25.3. Change logs

```text id="tsp-retention-change-logs"
- No update ordinario.
- No delete ordinario.
- Retención según política de auditoría del tenant/plataforma.
- Sanitizar antes de persistir.
```

---

### 25.4. Exports

```text id="tsp-retention-exports"
- Export record se conserva mientras exista el SecureDocument.
- Archivar export no elimina documento.
- Eliminación documental se gestiona desde Secure Document Storage.
```

---

## 26. Migración inicial

### 26.1. Nombre sugerido

```text id="tsp-migration-name"
025_create_tenant_settings_policies
```

---

### 26.2. Contenido

```text id="tsp-migration-content"
[ ] Crear enums.
[ ] Crear setting_definitions.
[ ] Crear tenant_setting_values.
[ ] Crear policy_definitions.
[ ] Crear tenant_policy_versions.
[ ] Crear tenant_policy_activations.
[ ] Crear tenant_policy_exceptions.
[ ] Crear tenant_settings_change_logs.
[ ] Crear tenant_settings_exports.
[ ] Crear índices.
[ ] Crear partial indexes SQL.
[ ] Crear checks básicos.
[ ] Agregar relaciones en Prisma.
```

---

### 26.3. Seeds posteriores

```text id="tsp-seed-process"
[ ] Ejecutar seed de setting definitions.
[ ] Ejecutar seed de policy definitions.
[ ] Ejecutar seed de defaults.
[ ] Validar idempotencia.
[ ] Validar que no existen secretos.
[ ] Validar que no existen scripts.
```

---

## 27. Seed inicial recomendado

### 27.1. Setting definitions

```text id="tsp-setting-definitions-seed"
general.locale = es-EC
general.defaultPageSize = 25
general.defaultExportFormat = xlsx

security.publicSettingsApiEnabled = false
security.wordpressSettingsAccessEnabled = false
security.externalAiRealDataAllowed = false
security.sensitiveExportsRequireApproval = true

financial.paymentValidationRequired = true
financial.receiptRequired = true
financial.partialPaymentsAllowed = true
financial.overpaymentsAllowed = true
financial.autoAllocationEnabled = false
financial.lateFeeEnabled = false

documents.defaultDocumentSensitivity = internal
documents.downloadAuditRequired = true
documents.versioningRequired = true
documents.publicDocumentPublishingAllowed = false

accessControl.visitorPreAuthorizationAllowed = true
accessControl.residentCanCreateVisitor = true
accessControl.defaultAccessPassTtlMinutes = 1440
accessControl.oneTimePassDefault = true
accessControl.guardManualCheckInAllowed = true
accessControl.guardManualCheckOutAllowed = true
accessControl.residentCanSeeAccessEvents = true

maintenance.residentCanCreateMaintenanceRequest = true
maintenance.evidenceRequiredForRequest = true

inventory.negativeStockAllowed = false
inventory.lowStockAlertsEnabled = true
```

---

### 27.2. Policy definitions

```text id="tsp-policy-definitions-seed"
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

## 28. Consultas críticas

### 28.1. Obtener setting efectivo actual

```typescript id="tsp-query-effective-setting"
const setting = await prisma.tenantSettingValue.findFirst({
  where: {
    tenantId,
    key,
    status: "active",
    archivedAt: null,
    effectiveFrom: { lte: effectiveAt },
    OR: [
      { effectiveUntil: null },
      { effectiveUntil: { gt: effectiveAt } }
    ]
  },
  orderBy: {
    effectiveFrom: "desc"
  }
});
```

---

### 28.2. Obtener política efectiva histórica

```typescript id="tsp-query-effective-policy"
const policyVersion = await prisma.tenantPolicyVersion.findFirst({
  where: {
    tenantId,
    policyKey,
    status: { in: ["active", "superseded", "expired"] },
    archivedAt: null,
    effectiveFrom: { lte: effectiveAt },
    OR: [
      { effectiveUntil: null },
      { effectiveUntil: { gt: effectiveAt } }
    ]
  },
  orderBy: {
    effectiveFrom: "desc"
  }
});
```

---

### 28.3. Obtener excepciones aplicables

```typescript id="tsp-query-effective-exceptions"
const exceptions = await prisma.tenantPolicyException.findMany({
  where: {
    tenantId,
    policyKey,
    status: "active",
    archivedAt: null,
    validFrom: { lte: effectiveAt },
    validUntil: { gt: effectiveAt },
    OR: [
      {
        targetResourceType,
        targetResourceId
      },
      {
        targetResourceType: null,
        targetResourceId: null
      }
    ]
  }
});
```

---

## 29. Performance

### 29.1. Dataset esperado MVP

```text id="tsp-performance-dataset"
Por tenant:
- 50 setting values.
- 30 policy definitions consumidas.
- 100 policy versions históricas.
- 50 activations.
- 100 exceptions.
- 1,000 change logs.
- 100 exports.

Global:
- 100 setting definitions.
- 100 policy definitions.
```

---

### 29.2. Objetivos

```text id="tsp-performance-objectives"
- resolveEffectiveSetting p95 < 100 ms con cache.
- resolveEffectivePolicy p95 < 150 ms con cache.
- list settings p95 < 800 ms.
- list policies p95 < 800 ms.
- compare policy versions p95 < 1000 ms.
- export pequeño p95 < 3000 ms.
```

---

### 29.3. Consideraciones

```text id="tsp-performance-considerations"
- Indexar tenant_id + key.
- Indexar tenant_id + policy_key.
- Indexar effective windows.
- Usar select explícito.
- Evitar N+1.
- Cachear effective settings/policies.
- Invalidar cache luego de commit.
```

---

## 30. Concurrencia

### 30.1. Casos críticos

```text id="tsp-concurrency-cases"
- Dos usuarios activan versiones distintas de la misma policy.
- Dos usuarios crean versión para la misma policy.
- Un usuario aprueba mientras otro rechaza.
- Un usuario archiva mientras otro activa.
- Una excepción se aprueba mientras se resuelve policy efectiva.
- Un setting se actualiza mientras se consulta setting efectivo.
```

---

### 30.2. Controles

```text id="tsp-concurrency-controls"
- Transacciones.
- Unique tenant_id + policy_key + version_number.
- Update condicional por status.
- Lock lógico por tenant_id + policy_key.
- Activación post-commit invalida cache.
- Tests de carrera para activación y versionNumber.
```

---

## 31. Data governance

### 31.1. Datos sensibles

```text id="tsp-sensitive-data"
- policyPayload de seguridad.
- policyPayload de privacidad.
- policyPayload financiero.
- settings de exportación sensible.
- historial de cambios de políticas críticas.
- excepciones de políticas.
```

---

### 31.2. Datos prohibidos

```text id="tsp-data-governance-prohibited"
- secretos;
- tokens;
- contraseñas;
- API keys;
- private keys;
- client secrets;
- storageKey;
- signedUrl persistente;
- credenciales bancarias;
- scripts;
- SQL raw;
- código ejecutable;
- datos personales masivos;
- documentos raw;
```

---

### 31.3. IA externa

```text id="tsp-ai-rule"
Ningún setting, policyPayload, historial, exportación, schema, excepción ni snapshot real de tenant debe enviarse a IA externa en MVP.
```

Permitido:

```text id="tsp-ai-allowed"
- documentación técnica;
- datos ficticios;
- fixtures;
- ejemplos sintéticos;
- schemas sin datos reales;
- análisis local sin envío externo.
```

---

## 32. Compatibilidad con microservicios

El modelo se prepara para extracción futura porque:

```text id="tsp-microservices-compat"
- definitions y tenant values están desacoplados;
- policies usan policyKey estable;
- ownerModule identifica consumidor;
- resolución efectiva puede exponerse por API interna;
- referencias externas se hacen por UUID y puertos;
- no hay FK directas a módulos transaccionales;
- eventos de cache/audit pueden evolucionar a mensajería.
```

---

## 33. No aceptación del modelo

No se acepta el modelo si:

```text id="tsp-dm-no-acceptance"
- tenant_setting_values no tiene tenant_id;
- tenant_policy_versions no tiene tenant_id;
- tenant_policy_activations no tiene tenant_id;
- tenant_policy_exceptions no tiene tenant_id;
- tenant_settings_change_logs no tiene tenant_id;
- tenant_settings_exports no tiene tenant_id;
- permite settings cross-tenant;
- permite policies cross-tenant;
- permite versionNumber desde cliente;
- permite status directo desde cliente;
- almacena secretos;
- almacena tokens;
- almacena passwords;
- almacena apiKeys;
- almacena privateKeys;
- almacena clientSecrets;
- almacena raw SQL;
- almacena scripts;
- almacena código ejecutable;
- guarda storageKey;
- guarda signedUrl persistente;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- modifica datos transaccionales de otros módulos;
- contiene columnas de hardware, biometría o IA externa;
- expone settings sensibles en /me;
- permite endpoints públicos;
- permite WordPress público;
- omite historial para cambios críticos;
- omite audit para activaciones;
- permite active policy destructivamente editable;
- permite activaciones superpuestas sin control;
- permite excepciones sin vigencia;
- exporta sin Secure Document Storage.
```

---

## 34. Resultado esperado

Al implementar este modelo de datos, `025-tenant-settings-policies` contará con persistencia segura y versionada para configuración y políticas tenant-scoped.

Resultado esperado:

```text id="tsp-dm-expected-result"
setting_definitions modelado
tenant_setting_values modelado
policy_definitions modelado
tenant_policy_versions modelado
tenant_policy_activations modelado
tenant_policy_exceptions modelado
tenant_settings_change_logs modelado
tenant_settings_exports modelado
enums definidos
Prisma schema preliminar definido
tenant_id obligatorio definido
definitions globales definidas
values tenant-scoped definidos
policy versions tenant-scoped definidas
activations auditables definidas
exceptions con vigencia definidas
change logs sanitizados definidos
exports vía SDS definidos
effective dating definido
cache-friendly indexes definidos
constraints definidos
partial indexes recomendados
no secrets
no executable payload
no storageKey
no public exposure
no WordPress access
no transaction side effects
no external AI with real data
```

---

## 35. Expediente actualizado

```text id="tsp-dm-expediente"
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
│   │       └── data-model.md
```
