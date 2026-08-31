# Tasks — 025 Tenant Settings and Policies

> Frontera documental Sprint 3: el contrato canónico es
> `docs/changes/GAP-S3-008-FILE-SECURITY-OPERATING-POLICY-2026-08-30.md`; no se ejecutan
> tareas de settings o exports documentales en este sprint.

> **Extensión autorizable de Sprint 3:** GAP-S3-004 habilita únicamente el seed y
> validación de cinco definitions financieras enumeradas en
> `docs/changes/GAP-S3-004-FINANCIAL-CURRENCY-SETTINGS-2026-08-29.md`; las demás tareas
> diferidas continúan fuera de alcance.

> **Slice vigente de Sprint 2:** sólo se ejecutan tareas necesarias para
> `SettingDefinition`, `TenantSettingValue`, lectura de definitions/settings, update de
> override y seed `general.locale`. Las tareas de policies, scheduling, history,
> exports y mutación de definitions quedan diferidas por GAP-S2-006.

## 1. Información del documento

| Campo           | Valor                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                 |
| Spec ID         | 025                                                                                           |
| Módulo          | Tenant Settings and Policies                                                                  |
| Documento       | Tasks                                                                                         |
| Ruta            | `docs/specs/025-tenant-settings-policies/tasks.md`                                            |
| Versión         | 0.1                                                                                           |
| Estado          | accepted                                                                                  |
| Fecha           | 2026-07-31                                                                                    |
| Documento base  | `docs/specs/025-tenant-settings-policies/spec.md`                                             |
| Plan técnico    | `docs/specs/025-tenant-settings-policies/plan.md`                                             |
| Modelo de datos | `docs/specs/025-tenant-settings-policies/data-model.md`                                       |
| Contrato API    | `docs/specs/025-tenant-settings-policies/api-contract.md`                                     |
| Plan de pruebas | `docs/specs/025-tenant-settings-policies/test-plan.md`                                        |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                |
| Naturaleza      | Tenant-scoped / Configuration-governed / Policy-driven / Versioned / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el backlog técnico ejecutable para implementar el módulo `025-tenant-settings-policies`.

El objetivo es transformar la especificación funcional, el plan técnico, el modelo de datos, el contrato API y el plan de pruebas en tareas implementables por épicas, fases y pull requests.

Regla central de implementación:

```text id="tsp-tasks-rule"
Tenant Settings and Policies debe implementarse como un módulo transversal, tenant-scoped, versionado, audit-heavy, schema-validated, cacheable y no público, capaz de administrar settings, policy definitions, policy versions, activaciones, excepciones, historial, summaries y exportaciones sin almacenar secretos, sin aceptar scripts, sin aceptar raw SQL, sin aceptar código ejecutable, sin exponer configuración sensible en /me, sin devolver storageKey, sin acceso desde WordPress público, sin endpoints públicos, sin efectos transaccionales directos, sin pagos, sin asientos contables, sin conciliaciones bancarias, sin modificación de datos operativos de otros módulos y sin IA externa con datos reales.
```

---

## 3. Convenciones de estado

```text id="tsp-task-status"
[ ] Pendiente
[x] Completado
[-] No aplica
[~] En progreso
[!] Bloqueado
```

---

## 4. Dependencias previas

Antes de iniciar implementación debe existir:

```text id="tsp-task-dependencies"
[ ] docs/specs/025-tenant-settings-policies/spec.md aprobado.
[ ] docs/specs/025-tenant-settings-policies/plan.md aprobado.
[ ] docs/specs/025-tenant-settings-policies/data-model.md aprobado.
[ ] docs/specs/025-tenant-settings-policies/api-contract.md aprobado.
[ ] docs/specs/025-tenant-settings-policies/test-plan.md aprobado.
[ ] Módulo 001-tenants disponible o mockeable.
[ ] Módulo 002-users-roles disponible o mockeable.
[ ] Módulo 007-audit disponible o mockeable.
[ ] Módulo 016-secure-document-storage disponible o mockeable.
[ ] Prisma configurado.
[ ] PostgreSQL configurado.
[ ] Redis disponible o cache in-memory definida.
[ ] OpenAPI pipeline disponible.
[ ] Keycloak/OIDC o auth mock disponible.
[ ] CI ejecutando tests unitarios, integración, API, seguridad, OpenAPI y smoke.
```

---

# 5. EPIC-025-01 — Module foundation

## Objetivo

Crear la estructura base del módulo `tenant-settings-policies`.

## Tasks

```text id="tsp-task-epic-01"
[ ] Crear directorio apps/api/src/modules/tenant-settings-policies/.
[ ] Crear tenant-settings-policies.module.ts.
[ ] Registrar TenantSettingsPoliciesModule en el módulo raíz correspondiente.
[ ] Crear tenant-settings-policies.config.ts.
[ ] Crear tenant-settings-policies.constants.ts.
[ ] Crear estructura controllers/.
[ ] Crear estructura application/services/.
[ ] Crear estructura application/use-cases/.
[ ] Crear estructura application/ports/.
[ ] Crear estructura domain/entities/.
[ ] Crear estructura domain/value-objects/.
[ ] Crear estructura domain/events/.
[ ] Crear estructura domain/policies/.
[ ] Crear estructura domain/errors/.
[ ] Crear estructura infrastructure/persistence/.
[ ] Crear estructura infrastructure/cache/.
[ ] Crear estructura infrastructure/documents/.
[ ] Crear estructura infrastructure/audit/.
[ ] Crear estructura infrastructure/tenants/.
[ ] Crear estructura infrastructure/users/.
[ ] Crear estructura infrastructure/validation/.
[ ] Crear estructura infrastructure/reports/.
[ ] Crear estructura infrastructure/observability/.
[ ] Crear estructura dto/.
[ ] Crear estructura guards/.
[ ] Crear estructura mappers/.
[ ] Crear estructura schemas/.
[ ] Crear estructura seeds/.
[ ] Crear estructura tests/.
```

## Acceptance criteria

```text id="tsp-task-epic-01-ac"
[ ] El módulo compila.
[ ] El módulo está registrado.
[ ] No expone endpoints públicos.
[ ] No depende directamente de módulos transaccionales consumidores.
[ ] No contiene adapters de pagos, ledger, conciliación, hardware o IA externa.
```

---

# 6. EPIC-025-02 — Configuration and feature flags

## Objetivo

Definir configuración y flags de seguridad del módulo.

## Tasks

```text id="tsp-task-epic-02"
[ ] Crear TENANT_SETTINGS_POLICIES_ENABLED=true.
[ ] Crear TENANT_SETTINGS_CACHE_ENABLED=true.
[ ] Crear TENANT_SETTINGS_REDIS_CACHE_ENABLED=false.
[ ] Crear TENANT_SETTINGS_EXPORT_ENABLED=true.
[ ] Crear TENANT_SETTINGS_PUBLIC_ENDPOINTS_ENABLED=false.
[ ] Crear TENANT_SETTINGS_WORDPRESS_ACCESS_ENABLED=false.
[ ] Crear TENANT_SETTINGS_EXECUTABLE_POLICIES_ENABLED=false.
[ ] Crear TENANT_SETTINGS_SECRET_STORAGE_ENABLED=false.
[ ] Crear TENANT_SETTINGS_EXTERNAL_AI_ENABLED=false.
[ ] Crear TENANT_SETTINGS_RETROACTIVE_ACTIVATION_ENABLED=false.
[ ] Crear TENANT_SETTINGS_MAX_PAGE_SIZE=100.
[ ] Crear TENANT_SETTINGS_DEFAULT_PAGE_SIZE=25.
[ ] Crear TENANT_SETTINGS_CACHE_TTL_SECONDS.
[ ] Crear validación de boot.
[ ] Crear tests de configuración.
```

## Acceptance criteria

```text id="tsp-task-epic-02-ac"
[ ] Boot falla si TENANT_SETTINGS_PUBLIC_ENDPOINTS_ENABLED=true.
[ ] Boot falla si TENANT_SETTINGS_WORDPRESS_ACCESS_ENABLED=true.
[ ] Boot falla si TENANT_SETTINGS_EXECUTABLE_POLICIES_ENABLED=true.
[ ] Boot falla si TENANT_SETTINGS_SECRET_STORAGE_ENABLED=true.
[ ] Boot falla si TENANT_SETTINGS_EXTERNAL_AI_ENABLED=true.
[ ] Retroactividad queda deshabilitada por defecto.
```

---

# 7. EPIC-025-03 — Enums and domain errors

## Objetivo

Crear enums y catálogo de errores.

## Tasks

```text id="tsp-task-epic-03"
[ ] Crear TenantSettingCategory.
[ ] Crear TenantSettingValueType.
[ ] Crear TenantSettingSensitivity.
[ ] Crear DefinitionStatus.
[ ] Crear TenantSettingValueStatus.
[ ] Crear TenantSettingSource.
[ ] Crear TenantPolicyCriticality.
[ ] Crear TenantPolicyVersionStatus.
[ ] Crear TenantPolicyActivationType.
[ ] Crear TenantPolicyActivationStatus.
[ ] Crear TenantPolicyExceptionType.
[ ] Crear TenantPolicyExceptionStatus.
[ ] Crear TenantSettingsChangeEntityType.
[ ] Crear TenantSettingsExportType.
[ ] Crear TenantSettingsExportFormat.
[ ] Crear TenantSettingsExportStatus.
[ ] Crear catálogo de errores SETTING_DEFINITION_*.
[ ] Crear catálogo de errores TENANT_SETTING_*.
[ ] Crear catálogo de errores POLICY_DEFINITION_*.
[ ] Crear catálogo de errores TENANT_POLICY_VERSION_*.
[ ] Crear catálogo de errores TENANT_POLICY_ACTIVATION_*.
[ ] Crear catálogo de errores TENANT_POLICY_EXCEPTION_*.
[ ] Crear catálogo de errores TENANT_SETTINGS_EXPORT_*.
[ ] Crear catálogo de errores TENANT_SETTINGS_SECURITY_*.
[ ] Mapear errores a HTTP status.
[ ] Crear tests de errores.
```

## Acceptance criteria

```text id="tsp-task-epic-03-ac"
[ ] Los enums coinciden con api-contract.md.
[ ] Errores cross-tenant se mapean a 404.
[ ] Errores de estado inválido se mapean a 409.
[ ] Errores de campos prohibidos se mapean a 422.
[ ] Retroactividad no autorizada se mapea a 403.
```

---

# 8. EPIC-025-04 — Value objects

## Objetivo

Implementar objetos de valor del dominio.

## Tasks

```text id="tsp-task-epic-04"
[ ] Crear SettingKey.
[ ] Crear PolicyKey.
[ ] Crear PolicyCategory.
[ ] Crear OwnerModule.
[ ] Crear SettingValue.
[ ] Crear PolicyPayload.
[ ] Crear PolicyVersionNumber.
[ ] Crear PolicyVersionLabel.
[ ] Crear EffectiveWindow.
[ ] Crear ChangeReason.
[ ] Crear ApprovalReason.
[ ] Crear RejectionReason.
[ ] Crear ActivationReason.
[ ] Crear RollbackReason.
[ ] Crear ExceptionTarget.
[ ] Crear ExceptionPayload.
[ ] Crear ExportFilter.
[ ] Crear ExportReason.
[ ] Crear SanitizedJsonValue.
```

## Tests

```text id="tsp-task-epic-04-tests"
[ ] SettingKey acepta category.name.
[ ] SettingKey rechaza strings peligrosos.
[ ] PolicyKey acepta category.namePolicy.
[ ] PolicyKey rechaza raw SQL.
[ ] EffectiveWindow valida fechas.
[ ] ChangeReason rechaza vacío en cambios críticos.
[ ] PolicyPayload rechaza secretos.
[ ] PolicyPayload rechaza scripts.
[ ] PolicyPayload rechaza executableCode.
[ ] ExportFilter rechaza storageKey.
```

---

# 9. EPIC-025-05 — JSON schema validation and sanitization

## Objetivo

Implementar validadores de valores, schemas y payloads.

## Tasks

```text id="tsp-task-epic-05"
[ ] Crear SettingValueValidator.
[ ] Crear JsonSchemaPolicyValidator.
[ ] Crear ForbiddenKeysValidator.
[ ] Crear SensitivePayloadSanitizer.
[ ] Crear ChangeLogSanitizer.
[ ] Crear ExportPayloadSanitizer.
[ ] Crear TextReasonSanitizer.
[ ] Validar valueType string.
[ ] Validar valueType number.
[ ] Validar valueType integer.
[ ] Validar valueType boolean.
[ ] Validar valueType decimalString.
[ ] Validar valueType date.
[ ] Validar valueType time.
[ ] Validar valueType duration.
[ ] Validar valueType enum.
[ ] Validar valueType stringArray.
[ ] Validar valueType object.
[ ] Validar valueType json.
[ ] Validar allowedValues.
[ ] Validar JSON Schema.
[ ] Rechazar additionalProperties cuando schema lo indique.
[ ] Rechazar claves prohibidas recursivamente.
[ ] Rechazar scripts.
[ ] Rechazar raw SQL.
[ ] Rechazar executableCode.
[ ] Rechazar externalAiRealDataAllowed.
[ ] Limitar profundidad JSON.
[ ] Limitar tamaño de payload.
[ ] Crear tests de validators.
```

## Acceptance criteria

```text id="tsp-task-epic-05-ac"
[ ] Ningún setting value acepta secretos.
[ ] Ningún policyPayload acepta código ejecutable.
[ ] Ningún JSONB acepta storageKey.
[ ] Ningún payload acepta rawSql.
[ ] Los errores devuelven path y reason controlados.
```

---

# 10. EPIC-025-06 — Domain entities

## Objetivo

Implementar entidades de dominio.

## Tasks

```text id="tsp-task-epic-06"
[ ] Crear SettingDefinition entity.
[ ] Crear TenantSettingValue entity.
[ ] Crear PolicyDefinition entity.
[ ] Crear TenantPolicyVersion entity.
[ ] Crear TenantPolicyActivation entity.
[ ] Crear TenantPolicyException entity.
[ ] Crear TenantSettingsChangeLog entity.
[ ] Crear TenantSettingsExport entity.
```

## Tests

```text id="tsp-task-epic-06-tests"
[ ] SettingDefinition lifecycle.
[ ] TenantSettingValue lifecycle.
[ ] PolicyDefinition lifecycle.
[ ] TenantPolicyVersion lifecycle.
[ ] TenantPolicyActivation lifecycle.
[ ] TenantPolicyException lifecycle.
[ ] ChangeLog immutable behavior.
[ ] SettingsExport lifecycle.
```

## Acceptance criteria

```text id="tsp-task-epic-06-ac"
[ ] Active policy no es editable destructivamente.
[ ] VersionNumber se genera server-side.
[ ] Tenant-scoped entities requieren tenantId server-side.
[ ] Ninguna entity permite secretos.
[ ] Ninguna entity permite scripts.
```

---

# 11. EPIC-025-07 — Domain policies

## Objetivo

Implementar políticas de dominio y límites de seguridad.

## Tasks

```text id="tsp-task-epic-07"
[ ] Crear TenantSettingsIsolationPolicy.
[ ] Crear SettingDefinitionPolicy.
[ ] Crear TenantSettingValuePolicy.
[ ] Crear TenantPolicyDefinitionPolicy.
[ ] Crear TenantPolicyVersionPolicy.
[ ] Crear TenantPolicyActivationPolicy.
[ ] Crear TenantPolicyExceptionPolicy.
[ ] Crear EffectivePolicyResolutionPolicy.
[ ] Crear SensitivePolicyApprovalPolicy.
[ ] Crear NoRetroactiveChangePolicy.
[ ] Crear NoExecutablePolicyPayloadPolicy.
[ ] Crear NoSecretsInSettingsPolicy.
[ ] Crear NoPublicExposurePolicy.
[ ] Crear NoWordPressAccessPolicy.
[ ] Crear NoTransactionalSideEffectsPolicy.
[ ] Crear NoExternalAiRealDataPolicy.
[ ] Crear NoStorageKeyPolicy.
[ ] Crear ResidentVisibleSummaryPolicy.
```

## Acceptance criteria

```text id="tsp-task-epic-07-ac"
[ ] Policies bloquean cross-tenant.
[ ] Policies bloquean secretos.
[ ] Policies bloquean scripts.
[ ] Policies bloquean endpoints públicos.
[ ] Policies bloquean WordPress público.
[ ] Policies bloquean efectos transaccionales.
[ ] Policies bloquean IA externa.
```

---

# 12. EPIC-025-08 — Prisma schema and migration

## Objetivo

Implementar persistencia en Prisma/PostgreSQL.

## Tasks

```text id="tsp-task-epic-08"
[ ] Agregar Prisma enums.
[ ] Crear model SettingDefinition.
[ ] Crear model TenantSettingValue.
[ ] Crear model PolicyDefinition.
[ ] Crear model TenantPolicyVersion.
[ ] Crear model TenantPolicyActivation.
[ ] Crear model TenantPolicyException.
[ ] Crear model TenantSettingsChangeLog.
[ ] Crear model TenantSettingsExport.
[ ] Agregar relaciones en Tenant.
[ ] Crear migración 025_create_tenant_settings_policies.
[ ] Crear índices para setting_definitions.
[ ] Crear índices para tenant_setting_values.
[ ] Crear índices para policy_definitions.
[ ] Crear índices para tenant_policy_versions.
[ ] Crear índices para tenant_policy_activations.
[ ] Crear índices para tenant_policy_exceptions.
[ ] Crear índices para tenant_settings_change_logs.
[ ] Crear índices para tenant_settings_exports.
[ ] Crear partial unique indexes SQL.
[ ] Crear checks básicos SQL donde aplique.
[ ] Ejecutar prisma format.
[ ] Ejecutar migración local.
[ ] Ejecutar migración test.
```

## Acceptance criteria

```text id="tsp-task-epic-08-ac"
[ ] Todas las tablas tenant-scoped tienen tenant_id.
[ ] No existen columnas de secretos.
[ ] No existe storage_key.
[ ] No existe signed_url persistente.
[ ] No existen columnas de scripts.
[ ] No existen columnas payment_id, journal_entry_id o bank_transaction_id.
[ ] Migración corre limpia.
```

---

# 13. EPIC-025-09 — Repository ports and Prisma repositories

## Objetivo

Implementar puertos y repositorios tenant-scoped.

## Tasks

```text id="tsp-task-epic-09"
[ ] Crear SettingDefinitionRepositoryPort.
[ ] Crear PrismaSettingDefinitionRepository.
[ ] Crear TenantSettingValueRepositoryPort.
[ ] Crear PrismaTenantSettingValueRepository.
[ ] Crear PolicyDefinitionRepositoryPort.
[ ] Crear PrismaPolicyDefinitionRepository.
[ ] Crear TenantPolicyVersionRepositoryPort.
[ ] Crear PrismaTenantPolicyVersionRepository.
[ ] Crear TenantPolicyActivationRepositoryPort.
[ ] Crear PrismaTenantPolicyActivationRepository.
[ ] Crear TenantPolicyExceptionRepositoryPort.
[ ] Crear PrismaTenantPolicyExceptionRepository.
[ ] Crear TenantSettingsChangeLogRepositoryPort.
[ ] Crear PrismaTenantSettingsChangeLogRepository.
[ ] Crear TenantSettingsExportRepositoryPort.
[ ] Crear PrismaTenantSettingsExportRepository.
```

## Required query pattern

```text id="tsp-task-repo-pattern"
[ ] Toda consulta tenant-scoped usa id + tenantId.
[ ] Toda lista tenant-scoped filtra tenantId.
[ ] Todo update tenant-scoped filtra id + tenantId.
[ ] Todo archive tenant-scoped filtra id + tenantId.
[ ] Effective query filtra tenantId + key/policyKey + effective window.
[ ] Cross-tenant retorna null.
```

## Tests

```text id="tsp-task-repo-tests"
[ ] tenantA no lee tenantB.
[ ] tenantA no actualiza tenantB.
[ ] tenantA no archiva tenantB.
[ ] versionNumber único por tenant + policyKey.
[ ] mismo versionNumber permitido en tenant distinto.
[ ] effective query histórica funciona.
[ ] exceptions vigentes se filtran correctamente.
```

---

# 14. EPIC-025-10 — DTOs and validation

## Objetivo

Implementar DTOs seguros.

## Tasks

```text id="tsp-task-epic-10"
[ ] Crear CreateSettingDefinitionDto.
[ ] Crear UpdateSettingDefinitionDto.
[ ] Crear ArchiveSettingDefinitionDto.
[ ] Crear UpdateTenantSettingDto.
[ ] Crear ScheduleTenantSettingDto.
[ ] Crear ArchiveTenantSettingDto.
[ ] Crear CreatePolicyDefinitionDto.
[ ] Crear UpdatePolicyDefinitionDto.
[ ] Crear ArchivePolicyDefinitionDto.
[ ] Crear CreateTenantPolicyVersionDto.
[ ] Crear UpdateTenantPolicyVersionDto.
[ ] Crear SubmitPolicyVersionReviewDto.
[ ] Crear ApprovePolicyVersionDto.
[ ] Crear RejectPolicyVersionDto.
[ ] Crear ActivatePolicyVersionDto.
[ ] Crear SchedulePolicyVersionDto.
[ ] Crear RollbackPolicyDto.
[ ] Crear ArchivePolicyVersionDto.
[ ] Crear CreatePolicyExceptionDto.
[ ] Crear ApprovePolicyExceptionDto.
[ ] Crear RejectPolicyExceptionDto.
[ ] Crear RevokePolicyExceptionDto.
[ ] Crear ArchivePolicyExceptionDto.
[ ] Crear ComparePolicyVersionsQueryDto.
[ ] Crear ResolveEffectivePolicyQueryDto.
[ ] Crear TenantSettingsExportDto.
[ ] Crear pagination/filter DTOs.
```

## Forbidden fields tests

```text id="tsp-task-dto-forbidden-tests"
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo.
[ ] DTOs rechazan versionNumber.
[ ] DTOs rechazan versionLabel.
[ ] DTOs rechazan storageKey.
[ ] DTOs rechazan signedUrl.
[ ] DTOs rechazan secret.
[ ] DTOs rechazan token.
[ ] DTOs rechazan password.
[ ] DTOs rechazan apiKey.
[ ] DTOs rechazan privateKey.
[ ] DTOs rechazan clientSecret.
[ ] DTOs rechazan databaseUrl.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan script.
[ ] DTOs rechazan executableCode.
[ ] DTOs rechazan paymentId.
[ ] DTOs rechazan journalEntryId.
[ ] DTOs rechazan bankTransactionId.
[ ] DTOs rechazan externalAiEnabled.
[ ] DTOs rechazan externalAiRealDataAllowed.
```

---

# 15. EPIC-025-11 — Guards and authorization

## Objetivo

Implementar autorización por superficie, permiso y sensibilidad.

## Tasks

```text id="tsp-task-epic-11"
[ ] Aplicar AuthGuard a todas las rutas.
[ ] Aplicar TenantGuard a rutas tenant.
[ ] Aplicar PermissionGuard a rutas tenant.
[ ] Crear SensitivePermissionGuard.
[ ] Crear PlatformPermissionGuard.
[ ] Crear OwnPolicySummaryGuard.
[ ] Crear InternalPolicyConsumerGuard.
[ ] Mapear permisos Platform API.
[ ] Mapear permisos Tenant Admin API.
[ ] Mapear permisos /me summaries.
[ ] Mapear permisos sensibles por category.
[ ] Mapear permisos sensibles por sensitivity.
[ ] Validar PlatformAdmin sin acceso automático a tenant data.
[ ] Validar Resident sin acceso a Tenant Admin API.
[ ] Validar BoardMember según permisos de aprobación.
```

## Acceptance criteria

```text id="tsp-task-epic-11-ac"
[ ] Sin token retorna 401.
[ ] Sin permiso retorna 403.
[ ] Cross-tenant retorna 404.
[ ] Setting sensible requiere permiso sensible.
[ ] Policy sensible requiere permiso sensible.
[ ] /me solo permite summaries.
```

---

# 16. EPIC-025-12 — Platform Setting Definitions API

## Objetivo

Implementar gestión platform de setting definitions.

## Tasks

```text id="tsp-task-epic-12"
[ ] Crear PlatformSettingDefinitionsController.
[ ] Crear SettingDefinitionService.
[ ] Implementar list setting definitions.
[ ] Implementar create setting definition.
[ ] Implementar get setting definition.
[ ] Implementar update setting definition.
[ ] Implementar archive setting definition.
[ ] Validar key único.
[ ] Validar key format category.name.
[ ] Validar valueType.
[ ] Validar defaultValue contra schema.
[ ] Validar allowedValues.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Resolver createdBy server-side.
[ ] Resolver updatedBy server-side.
[ ] Resolver archivedBy server-side.
[ ] Crear audit tenantSettingDefinition.created.
[ ] Crear audit tenantSettingDefinition.updated.
[ ] Crear audit tenantSettingDefinition.archived.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="tsp-task-epic-12-ac"
[ ] Solo PlatformAdmin autorizado administra definitions.
[ ] Definition no almacena secretos.
[ ] Definition no almacena scripts.
[ ] Definition archivada no se usa para nuevos values.
```

---

# 17. EPIC-025-13 — Platform Policy Definitions API

## Objetivo

Implementar gestión platform de policy definitions.

## Tasks

```text id="tsp-task-epic-13"
[ ] Crear PlatformPolicyDefinitionsController.
[ ] Crear PolicyDefinitionService.
[ ] Implementar list policy definitions.
[ ] Implementar create policy definition.
[ ] Implementar get policy definition.
[ ] Implementar update policy definition.
[ ] Implementar archive policy definition.
[ ] Validar policyKey único.
[ ] Validar ownerModule.
[ ] Validar schema.
[ ] Validar defaultPolicy contra schema.
[ ] Validar criticality.
[ ] Validar sensitivity.
[ ] Validar versioningRequired para critical.
[ ] Validar approvalRequired para sensitive.
[ ] Rechazar defaultPolicy con secrets.
[ ] Rechazar schema ejecutable.
[ ] Resolver actor fields server-side.
[ ] Crear audit tenantPolicyDefinition.created.
[ ] Crear audit tenantPolicyDefinition.updated.
[ ] Crear audit tenantPolicyDefinition.archived.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="tsp-task-epic-13-ac"
[ ] PolicyDefinition tiene ownerModule.
[ ] defaultPolicy valida contra schema.
[ ] No permite payload ejecutable.
[ ] No almacena secretos.
```

---

# 18. EPIC-025-14 — Tenant Settings API

## Objetivo

Implementar lectura y actualización de settings por tenant.

## Tasks

```text id="tsp-task-epic-14"
[ ] Crear TenantSettingsController.
[ ] Crear TenantSettingsService.
[ ] Crear UpdateTenantSettingUseCase.
[ ] Crear ScheduleTenantSettingUseCase.
[ ] Implementar list effective tenant settings.
[ ] Implementar get effective setting by key.
[ ] Implementar update tenant setting.
[ ] Implementar schedule tenant setting.
[ ] Implementar archive tenant setting override.
[ ] Validar SettingDefinition active.
[ ] Validar isTenantOverridable.
[ ] Validar value contra valueType/schema.
[ ] Validar effectiveFrom.
[ ] Validar reason si runtimeCritical.
[ ] Validar permiso sensible si category/sensitivity aplica.
[ ] Crear tenant override active.
[ ] Crear tenant override scheduled.
[ ] Archivar override.
[ ] Revertir a platformDefault si no hay override.
[ ] Invalidar cache.
[ ] Crear change log.
[ ] Auditar tenantSetting.updated.
[ ] Auditar tenantSetting.scheduled.
[ ] Auditar tenantSetting.archived.
[ ] Crear tests unitarios.
[ ] Crear tests API.
[ ] Crear tests multitenancy.
```

## Acceptance criteria

```text id="tsp-task-epic-14-ac"
[ ] Settings efectivos funcionan con default y override.
[ ] Settings scheduled no afectan lectura actual.
[ ] Settings archivados no aplican.
[ ] Security/privacy/financial requiere permiso sensible.
[ ] No se aceptan secretos.
```

---

# 19. EPIC-025-15 — Tenant policy versions

## Objetivo

Implementar creación, edición, revisión y aprobación de versiones.

## Tasks

```text id="tsp-task-epic-15"
[ ] Crear TenantPoliciesController.
[ ] Crear TenantPoliciesService.
[ ] Crear CreatePolicyVersionUseCase.
[ ] Crear UpdatePolicyVersionUseCase.
[ ] Crear SubmitPolicyVersionReviewUseCase.
[ ] Crear ApprovePolicyVersionUseCase.
[ ] Crear RejectPolicyVersionUseCase.
[ ] Implementar list tenant policies.
[ ] Implementar get tenant policy.
[ ] Implementar list policy versions.
[ ] Implementar create policy version.
[ ] Implementar get policy version.
[ ] Implementar update draft policy version.
[ ] Implementar submit review.
[ ] Implementar approve policy version.
[ ] Implementar reject policy version.
[ ] Generar versionNumber server-side.
[ ] Generar versionLabel server-side.
[ ] Validar policyPayload contra schema.
[ ] Validar changeReason.
[ ] Validar approval sensitive.
[ ] Impedir edición destructiva de active/scheduled.
[ ] Impedir activación de rejected/archived.
[ ] Crear change log.
[ ] Auditar lifecycle.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="tsp-task-epic-15-ac"
[ ] Nueva versión inicia draft.
[ ] Active no se edita.
[ ] Review/approve/reject funciona.
[ ] versionNumber no se acepta desde cliente.
[ ] policyPayload no acepta secrets/scripts/rawSql.
```

---

# 20. EPIC-025-16 — Policy activation, scheduling and rollback

## Objetivo

Implementar activación inmediata, futura y rollback lógico.

## Tasks

```text id="tsp-task-epic-16"
[ ] Crear PolicyActivationService.
[ ] Crear ActivatePolicyVersionUseCase.
[ ] Crear SchedulePolicyActivationUseCase.
[ ] Crear RollbackPolicyActivationUseCase.
[ ] Implementar activate version.
[ ] Implementar schedule version.
[ ] Implementar rollback policy.
[ ] Validar versión tenant-scoped.
[ ] Validar status approved.
[ ] Validar effectiveFrom obligatorio.
[ ] Validar retroactividad.
[ ] Validar permiso tenantPolicies.activateRetroactive.
[ ] Validar no overlap.
[ ] Crear TenantPolicyActivation.
[ ] Marcar versión active o scheduled.
[ ] Ajustar effectiveUntil de versión anterior.
[ ] Marcar versión anterior superseded/expired.
[ ] Invalidar cache post-commit.
[ ] Auditar tenantPolicyVersion.activated.
[ ] Auditar tenantPolicyVersion.scheduled.
[ ] Auditar tenantPolicyActivation.rollbackCreated.
[ ] Crear tests de concurrencia.
```

## Acceptance criteria

```text id="tsp-task-epic-16-ac"
[ ] Solo una policy efectiva por tenant + policyKey + effectiveAt.
[ ] Scheduled no aplica antes de effectiveFrom.
[ ] Rollback no borra historial.
[ ] Retroactividad requiere permiso reforzado.
[ ] Cache se invalida luego de commit.
```

---

# 21. EPIC-025-17 — Effective settings and policies resolver

## Objetivo

Implementar resolución efectiva para módulos consumidores.

## Tasks

```text id="tsp-task-epic-17"
[ ] Crear EffectivePolicyService.
[ ] Crear ResolveEffectiveSettingUseCase.
[ ] Crear ResolveEffectivePolicyUseCase.
[ ] Crear TenantPolicyResolverPort.
[ ] Implementar resolveEffectiveSetting.
[ ] Implementar resolveEffectivePolicy.
[ ] Implementar resolvePolicyException.
[ ] Resolver default platform si no hay override.
[ ] Resolver tenant override vigente.
[ ] Resolver effectiveAt histórico.
[ ] Excluir draft/reviewReady/rejected/archived.
[ ] Aplicar exceptions vigentes si context aplica.
[ ] Incluir source.
[ ] Incluir versionId/settingValueId.
[ ] No devolver secrets.
[ ] No devolver scripts.
[ ] No modificar módulos consumidores.
[ ] Crear tests de integración.
```

## Acceptance criteria

```text id="tsp-task-epic-17-ac"
[ ] Effective setting devuelve default u override correcto.
[ ] Effective policy devuelve default o versión vigente.
[ ] Effective historical funciona.
[ ] Exceptions revoked/expired no aplican.
[ ] No hay efectos transaccionales.
```

---

# 22. EPIC-025-18 — Policy exceptions

## Objetivo

Implementar excepciones temporales o por recurso.

## Tasks

```text id="tsp-task-epic-18"
[ ] Crear TenantPolicyExceptionsController.
[ ] Crear PolicyExceptionService.
[ ] Crear CreatePolicyExceptionUseCase.
[ ] Crear ApprovePolicyExceptionUseCase.
[ ] Crear RejectPolicyExceptionUseCase.
[ ] Crear RevokePolicyExceptionUseCase.
[ ] Implementar list exceptions.
[ ] Implementar create exception.
[ ] Implementar get exception.
[ ] Implementar approve exception.
[ ] Implementar reject exception.
[ ] Implementar revoke exception.
[ ] Implementar archive exception.
[ ] Validar policyKey.
[ ] Validar policyVersionId tenant-scoped si existe.
[ ] Validar targetResourceType.
[ ] Validar targetResourceId mediante puerto si aplica.
[ ] Validar exceptionPayload.
[ ] Validar validUntil > validFrom.
[ ] Validar reason.
[ ] Validar sensitive approval.
[ ] Invalidar cache si cambia aplicabilidad.
[ ] Crear change log.
[ ] Auditar exception lifecycle.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="tsp-task-epic-18-ac"
[ ] Excepción requiere vigencia.
[ ] Excepción sensible requiere aprobación.
[ ] Excepción cross-tenant retorna 404.
[ ] Revoked/expired no aplica.
[ ] Excepción no crea datos transaccionales.
```

---

# 23. EPIC-025-19 — Cache and invalidation

## Objetivo

Implementar cache segura de lectura efectiva.

## Tasks

```text id="tsp-task-epic-19"
[ ] Crear TenantSettingsCacheService.
[ ] Crear EffectivePolicyCachePort.
[ ] Crear InMemoryEffectivePolicyCacheAdapter.
[ ] Crear RedisEffectivePolicyCacheAdapter opcional.
[ ] Implementar cache keys tenant-scoped.
[ ] Implementar get/set/delete.
[ ] Implementar cache TTL.
[ ] Implementar cache hit/miss metrics.
[ ] Implementar invalidación por setting update.
[ ] Implementar invalidación por setting archive.
[ ] Implementar invalidación por policy activation.
[ ] Implementar invalidación por exception approval.
[ ] Implementar invalidación por exception revoke.
[ ] Implementar fallback a DB/default si cache falla.
[ ] Impedir exposición de cache key por API.
[ ] Crear tests de cache.
```

## Acceptance criteria

```text id="tsp-task-epic-19-ac"
[ ] Cache no mezcla tenants.
[ ] Cache no contiene secretos.
[ ] Cache se invalida post-commit.
[ ] Falla de cache no rompe resolución efectiva.
```

---

# 24. EPIC-025-20 — History and comparison

## Objetivo

Implementar historial funcional y comparación de versiones.

## Tasks

```text id="tsp-task-epic-20"
[ ] Crear TenantSettingsHistoryController.
[ ] Crear TenantSettingsChangeLogService.
[ ] Crear PolicyComparisonService.
[ ] Implementar list settings history.
[ ] Implementar list policy history.
[ ] Implementar compare policy versions.
[ ] Crear change logs en cambios críticos.
[ ] Sanitizar oldValue.
[ ] Sanitizar newValue.
[ ] Sanitizar diff.
[ ] Filtrar historial por tenant.
[ ] Filtrar historial por key.
[ ] Filtrar historial por actor.
[ ] Filtrar historial por date range.
[ ] Rechazar secrets en history.
[ ] Rechazar scripts en history.
[ ] Crear tests API.
```

## Acceptance criteria

```text id="tsp-task-epic-20-ac"
[ ] History es tenant-scoped.
[ ] Diff no expone secretos.
[ ] Diff no expone scripts.
[ ] ChangeLog complementa Audit, no lo reemplaza.
```

---

# 25. EPIC-025-21 — `/me` resident policy summaries

## Objetivo

Implementar summaries visibles para residentes.

## Tasks

```text id="tsp-task-epic-21"
[ ] Crear MeTenantPolicySummariesController.
[ ] Crear TenantPolicySummaryService.
[ ] Implementar GET /me/tenant-policy-summaries.
[ ] Implementar GET /me/tenant-policy-summaries/{category}.
[ ] Aplicar OwnPolicySummaryGuard.
[ ] Filtrar residentVisible=true.
[ ] Filtrar categorías permitidas.
[ ] Ocultar settings sensibles.
[ ] Ocultar payload interno.
[ ] Crear summary DTO.
[ ] Impedir modificación desde /me.
[ ] Impedir exportación desde /me.
[ ] Crear tests /me.
[ ] Crear tests privacy.
```

## Acceptance criteria

```text id="tsp-task-epic-21-ac"
[ ] Resident ve solo summaries publicables.
[ ] Resident no ve configuration securitySensitive.
[ ] Resident no ve payload completo interno.
[ ] Resident no modifica settings/policies.
[ ] ResidentA no ve tenantB.
```

---

# 26. EPIC-025-22 — Secure Document Storage exports

## Objetivo

Implementar exportaciones mediante Secure Document Storage.

## Tasks

```text id="tsp-task-epic-22"
[ ] Crear TenantSettingsExportsController.
[ ] Crear TenantSettingsExportService.
[ ] Crear TenantSettingsDocumentStoragePort.
[ ] Crear SecureDocumentStorageSettingsAdapter.
[ ] Implementar export settings.
[ ] Implementar export policies.
[ ] Implementar export policyHistory.
[ ] Implementar export policyExceptions.
[ ] Implementar export fullAdministrativeSnapshot.
[ ] Validar exportType.
[ ] Validar format json.
[ ] Validar format xlsx.
[ ] Validar format pdf si engine existe.
[ ] Validar includeSensitive.
[ ] Requerir reason si sensitive.
[ ] Sanitizar filters.
[ ] Sanitizar export payload.
[ ] Excluir secrets.
[ ] Excluir scripts.
[ ] Excluir rawSql.
[ ] Crear SecureDocument.
[ ] Guardar secureDocumentId.
[ ] No devolver storageKey.
[ ] No devolver signedUrl persistente.
[ ] Marcar completed.
[ ] Marcar failed con failureReason sanitizado.
[ ] Auditar tenantSettings.exported.
[ ] Crear tests SDS.
```

## Acceptance criteria

```text id="tsp-task-epic-22-ac"
[ ] Export usa SDS.
[ ] Export devuelve secureDocumentId.
[ ] Export no devuelve storageKey.
[ ] Export no contiene secretos.
[ ] Export sensible requiere permiso reforzado.
```

---

# 27. EPIC-025-23 — Internal integrations

## Objetivo

Implementar puertos hacia dependencias internas.

## Tasks

```text id="tsp-task-epic-23"
[ ] Crear TenantSettingsTenantsPort.
[ ] Crear TenantsSettingsAdapter.
[ ] Implementar validateTenantIsActive.
[ ] Implementar getTenantOperationalSummary.
[ ] Crear TenantSettingsUsersPort.
[ ] Crear UsersSettingsAdapter.
[ ] Implementar getActorProfile.
[ ] Implementar validateApprover.
[ ] Crear TenantSettingsAuditPort.
[ ] Crear AuditTenantSettingsAdapter.
[ ] Implementar record audit event.
[ ] Crear PolicyConsumerResourceValidationPort opcional.
[ ] Validar targetResourceId mediante ownerModule cuando aplique.
[ ] Crear tests de adapters.
```

## Acceptance criteria

```text id="tsp-task-epic-23-ac"
[ ] Tenant suspended se rechaza.
[ ] Approver cross-tenant se rechaza.
[ ] Audit no recibe secrets.
[ ] Target resources se validan por puerto, no por FK directa.
```

---

# 28. EPIC-025-24 — Audit implementation

## Objetivo

Registrar auditoría obligatoria.

## Tasks

```text id="tsp-task-epic-24"
[ ] Crear TenantSettingsAuditService.
[ ] Integrar con módulo 007-audit.
[ ] Auditar tenantSetting.created.
[ ] Auditar tenantSetting.updated.
[ ] Auditar tenantSetting.scheduled.
[ ] Auditar tenantSetting.activated.
[ ] Auditar tenantSetting.expired.
[ ] Auditar tenantSetting.archived.
[ ] Auditar tenantPolicyDefinition.created.
[ ] Auditar tenantPolicyDefinition.updated.
[ ] Auditar tenantPolicyDefinition.archived.
[ ] Auditar tenantPolicyVersion.created.
[ ] Auditar tenantPolicyVersion.updated.
[ ] Auditar tenantPolicyVersion.submittedForReview.
[ ] Auditar tenantPolicyVersion.approved.
[ ] Auditar tenantPolicyVersion.rejected.
[ ] Auditar tenantPolicyVersion.scheduled.
[ ] Auditar tenantPolicyVersion.activated.
[ ] Auditar tenantPolicyVersion.superseded.
[ ] Auditar tenantPolicyVersion.expired.
[ ] Auditar tenantPolicyVersion.archived.
[ ] Auditar tenantPolicyActivation.created.
[ ] Auditar tenantPolicyActivation.rollbackCreated.
[ ] Auditar tenantPolicyException.created.
[ ] Auditar tenantPolicyException.approved.
[ ] Auditar tenantPolicyException.rejected.
[ ] Auditar tenantPolicyException.activated.
[ ] Auditar tenantPolicyException.expired.
[ ] Auditar tenantPolicyException.revoked.
[ ] Auditar tenantPolicyException.archived.
[ ] Auditar tenantSettings.exported.
[ ] Auditar tenantPolicyEffective.readSensitive.
[ ] Sanitizar metadata.
[ ] Excluir secrets.
[ ] Excluir storageKey.
[ ] Excluir rawSql.
[ ] Excluir scripts.
[ ] Crear audit tests.
```

## Acceptance criteria

```text id="tsp-task-epic-24-ac"
[ ] Todo cambio crítico tiene audit.
[ ] Audit incluye tenantId, actor, action, resource y traceId.
[ ] Audit no incluye secretos.
[ ] Audit no incluye payload sensible no sanitizado.
```

---

# 29. EPIC-025-25 — Observability

## Objetivo

Implementar logs, métricas y trazabilidad segura.

## Tasks

```text id="tsp-task-epic-25"
[ ] Crear TenantSettingsObservabilityService.
[ ] Loggear tenantSetting.updated.
[ ] Loggear tenantPolicyVersion.created.
[ ] Loggear tenantPolicyVersion.approved.
[ ] Loggear tenantPolicyVersion.activated.
[ ] Loggear tenantPolicyException.created.
[ ] Loggear tenantPolicyException.revoked.
[ ] Loggear tenantSettings.exported.
[ ] Loggear effectivePolicy.cacheHit.
[ ] Loggear effectivePolicy.cacheMiss.
[ ] Loggear effectivePolicy.cacheInvalidated.
[ ] Crear metric tenant_settings_updates_total.
[ ] Crear metric tenant_policy_versions_created_total.
[ ] Crear metric tenant_policy_activations_total.
[ ] Crear metric tenant_policy_exceptions_total.
[ ] Crear metric tenant_settings_exports_total.
[ ] Crear metric tenant_policy_cache_hits_total.
[ ] Crear metric tenant_policy_cache_misses_total.
[ ] Crear metric tenant_policy_cache_invalidations_total.
[ ] Bloquear labels prohibidos.
[ ] Crear tests de logs.
[ ] Crear tests de metrics.
```

## Acceptance criteria

```text id="tsp-task-epic-25-ac"
[ ] Logs no contienen secrets.
[ ] Logs no contienen raw payload sensible.
[ ] Metrics no usan tenantId.
[ ] Metrics no usan userId ni traceId.
```

---

# 30. EPIC-025-26 — OpenAPI

## Objetivo

Documentar contrato API y extensiones de seguridad.

## Tasks

```text id="tsp-task-epic-26"
[ ] Agregar tag Tenant Settings.
[ ] Agregar tag Tenant Policies.
[ ] Agregar tag Tenant Policy Exceptions.
[ ] Agregar tag Tenant Settings History.
[ ] Agregar tag Tenant Settings Exports.
[ ] Agregar tag Me Tenant Policy Summaries.
[ ] Agregar tag Platform Setting Definitions.
[ ] Agregar tag Platform Policy Definitions.
[ ] Documentar rutas /api/v1/tenant/settings.
[ ] Documentar rutas /api/v1/tenant/policies.
[ ] Documentar rutas /api/v1/tenant/policy-exceptions.
[ ] Documentar rutas /api/v1/tenant/settings-history.
[ ] Documentar rutas /api/v1/tenant/policy-history.
[ ] Documentar ruta /api/v1/tenant/settings-policies/export.
[ ] Documentar rutas /api/v1/platform/setting-definitions.
[ ] Documentar rutas /api/v1/platform/policy-definitions.
[ ] Documentar rutas /api/v1/me/tenant-policy-summaries.
[ ] Agregar x-auth-required=true.
[ ] Agregar x-tenant-settings-policies=true.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-wordpress-access=false.
[ ] Agregar x-secrets-storage=false.
[ ] Agregar x-executable-policy-payload=false.
[ ] Agregar x-transactional-side-effects=false.
[ ] Agregar x-external-ai-real-data=false.
[ ] Agregar x-tenant-scope=true en rutas tenant.
[ ] Agregar x-platform-scope=true en rutas platform.
[ ] Agregar x-resident-visible-summary-only=true en rutas /me.
[ ] Agregar x-secure-document-storage=true en export.
[ ] Agregar x-storage-key-exposed=false en export.
[ ] Crear OpenAPI tests.
```

## No documentar

```text id="tsp-task-openapi-forbidden"
[ ] No documentar /api/v1/public/tenant-settings.
[ ] No documentar /api/v1/public/tenant-policies.
[ ] No documentar tenantId en DTOs externos.
[ ] No documentar actor fields.
[ ] No documentar versionNumber desde cliente.
[ ] No documentar storageKey.
[ ] No documentar signedUrl persistente.
[ ] No documentar secrets.
[ ] No documentar rawSql.
[ ] No documentar scripts.
[ ] No documentar executableCode.
[ ] No documentar externalAiEnabled.
```

---

# 31. EPIC-025-27 — Seeds

## Objetivo

Crear seeds iniciales de definitions y policies.

## Tasks

```text id="tsp-task-epic-27"
[ ] Crear seed general.locale.
[ ] Crear seed general.defaultPageSize.
[ ] Crear seed general.defaultExportFormat.
[ ] Crear seed security.publicSettingsApiEnabled.
[ ] Crear seed security.wordpressSettingsAccessEnabled.
[ ] Crear seed security.externalAiRealDataAllowed.
[ ] Crear seed security.sensitiveExportsRequireApproval.
[ ] Crear seed financial.paymentValidationRequired.
[ ] Crear seed financial.receiptRequired.
[ ] Crear seed financial.partialPaymentsAllowed.
[ ] Crear seed financial.overpaymentsAllowed.
[ ] Crear seed financial.autoAllocationEnabled.
[ ] Crear seed financial.lateFeeEnabled.
[ ] Crear seed documents.defaultDocumentSensitivity.
[ ] Crear seed documents.downloadAuditRequired.
[ ] Crear seed documents.versioningRequired.
[ ] Crear seed documents.publicDocumentPublishingAllowed.
[ ] Crear seed accessControl.visitorPreAuthorizationAllowed.
[ ] Crear seed accessControl.residentCanCreateVisitor.
[ ] Crear seed accessControl.defaultAccessPassTtlMinutes.
[ ] Crear seed accessControl.oneTimePassDefault.
[ ] Crear seed accessControl.guardManualCheckInAllowed.
[ ] Crear seed accessControl.guardManualCheckOutAllowed.
[ ] Crear seed accessControl.residentCanSeeAccessEvents.
[ ] Crear seed maintenance.residentCanCreateMaintenanceRequest.
[ ] Crear seed maintenance.evidenceRequiredForRequest.
[ ] Crear seed inventory.negativeStockAllowed.
[ ] Crear seed inventory.lowStockAlertsEnabled.
[ ] Crear policy definition financial.billingPolicy.
[ ] Crear policy definition financial.paymentPolicy.
[ ] Crear policy definition reservations.reservationPolicy.
[ ] Crear policy definition communications.notificationPolicy.
[ ] Crear policy definition documents.documentRetentionPolicy.
[ ] Crear policy definition accessControl.visitorAccessPolicy.
[ ] Crear policy definition maintenance.workOrderPolicy.
[ ] Crear policy definition inventory.stockPolicy.
[ ] Crear policy definition privacy.dataGovernancePolicy.
[ ] Crear policy definition security.exportPolicy.
[ ] Validar idempotencia de seeds.
[ ] Validar no secrets.
[ ] Validar no scripts.
```

## Acceptance criteria

```text id="tsp-task-epic-27-ac"
[ ] Seeds son idempotentes.
[ ] Seeds usan defaults seguros.
[ ] Seeds no contienen datos reales.
[ ] Seeds no contienen secretos.
[ ] Seeds no contienen scripts.
```

---

# 32. EPIC-025-28 — Security hardening

## Objetivo

Ejecutar endurecimiento de seguridad antes de merge final.

## Tasks

```text id="tsp-task-epic-28"
[ ] Ejecutar forbidden fields tests.
[ ] Ejecutar no secrets tests.
[ ] Ejecutar no executable payload tests.
[ ] Ejecutar no raw SQL tests.
[ ] Ejecutar multitenancy tests.
[ ] Ejecutar sensitive permission tests.
[ ] Ejecutar no public tests.
[ ] Ejecutar no WordPress tests.
[ ] Ejecutar no storageKey tests.
[ ] Ejecutar no transaction side effects tests.
[ ] Ejecutar no external AI tests.
[ ] Verificar CORS sin wildcard.
[ ] Verificar headers de seguridad.
[ ] Verificar error sanitizer.
[ ] Verificar audit sanitizer.
[ ] Verificar log sanitizer.
[ ] Verificar export sanitizer.
[ ] Verificar OpenAPI sin campos prohibidos.
[ ] Verificar feature flags prohibidos false.
```

## Acceptance criteria

```text id="tsp-task-epic-28-ac"
[ ] Security tests críticos pasan 100%.
[ ] No hay rutas públicas.
[ ] No hay acceso WordPress público.
[ ] No hay secretos en settings/policies.
[ ] No hay scripts ni payload ejecutable.
[ ] No hay storageKey en API/logs/audit/export.
[ ] No hay efectos transaccionales directos.
```

---

# 33. EPIC-025-29 — Performance and concurrency

## Objetivo

Validar desempeño, cache y consistencia bajo concurrencia.

## Tasks

```text id="tsp-task-epic-29"
[ ] Preparar dataset global con 100 setting definitions.
[ ] Preparar dataset global con 100 policy definitions.
[ ] Preparar dataset tenantA.
[ ] Preparar dataset tenantB.
[ ] Test resolveEffectiveSetting p95 < 100 ms con cache.
[ ] Test resolveEffectivePolicy p95 < 150 ms con cache.
[ ] Test resolveEffectiveSetting p95 < 500 ms sin cache.
[ ] Test resolveEffectivePolicy p95 < 700 ms sin cache.
[ ] Test list settings p95 < 800 ms.
[ ] Test list policies p95 < 800 ms.
[ ] Test compare policy versions p95 < 1000 ms.
[ ] Test export pequeño p95 < 3000 ms.
[ ] Test pageSize máximo 100.
[ ] Test sin N+1 evidente.
[ ] Test dos usuarios crean versionNumber simultáneo.
[ ] Test dos usuarios activan versiones simultáneas.
[ ] Test approve/reject simultáneo.
[ ] Test archive/activate simultáneo.
[ ] Test update setting/read efectivo simultáneo.
[ ] Test approve exception/resolve simultáneo.
[ ] Test revoke exception/resolve simultáneo.
[ ] Test cache invalidation post-commit.
```

## Acceptance criteria

```text id="tsp-task-epic-29-ac"
[ ] No se duplican versionNumbers.
[ ] No hay doble policy active efectiva para mismo effectiveAt.
[ ] No se leen datos parciales.
[ ] Cache no mezcla tenants.
```

---

# 34. EPIC-025-30 — CI gates

## Objetivo

Configurar validaciones obligatorias del pipeline.

## Tasks

```text id="tsp-task-epic-30"
[ ] Agregar unit tests al pipeline.
[ ] Agregar schema validator tests al pipeline.
[ ] Agregar sanitizer tests al pipeline.
[ ] Agregar entity tests al pipeline.
[ ] Agregar state machine tests al pipeline.
[ ] Agregar domain policy tests al pipeline.
[ ] Agregar repository tests al pipeline.
[ ] Agregar integration tests al pipeline.
[ ] Agregar Platform API tests al pipeline.
[ ] Agregar Tenant Admin API tests al pipeline.
[ ] Agregar /me API tests al pipeline.
[ ] Agregar internal resolver tests al pipeline.
[ ] Agregar authz tests al pipeline.
[ ] Agregar sensitive permission tests al pipeline.
[ ] Agregar multitenancy tests al pipeline.
[ ] Agregar no secrets tests al pipeline.
[ ] Agregar no executable payload tests al pipeline.
[ ] Agregar no raw SQL tests al pipeline.
[ ] Agregar no public tests al pipeline.
[ ] Agregar no WordPress tests al pipeline.
[ ] Agregar no storageKey tests al pipeline.
[ ] Agregar no transaction side effects tests al pipeline.
[ ] Agregar no external AI tests al pipeline.
[ ] Agregar audit tests al pipeline.
[ ] Agregar observability tests al pipeline.
[ ] Agregar OpenAPI contract tests al pipeline.
[ ] Agregar smoke tests al pipeline.
```

## Pipeline must fail if

```text id="tsp-task-ci-fail"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta versionNumber desde cliente.
[ ] Algún DTO acepta status directo fuera de transición.
[ ] Algún DTO acepta storageKey.
[ ] Algún DTO acepta secret.
[ ] Algún DTO acepta token.
[ ] Algún DTO acepta password.
[ ] Algún DTO acepta apiKey.
[ ] Algún DTO acepta rawSql.
[ ] Algún DTO acepta script.
[ ] Algún DTO acepta executableCode.
[ ] Algún DTO acepta externalAiEnabled.
[ ] API permite settings cross-tenant.
[ ] API permite policies cross-tenant.
[ ] API permite public endpoints.
[ ] API permite WordPress público.
[ ] API expone settings sensibles en /me.
[ ] API expone storageKey.
[ ] Logs contienen secrets.
[ ] Audit contiene secrets.
[ ] Export contiene secrets.
[ ] API crea Payment.
[ ] API crea SupplierPaymentOrder.
[ ] API crea JournalEntry.
[ ] API confirma Bank Reconciliation.
[ ] API modifica datos transaccionales de otros módulos.
[ ] API llama IA externa con datos reales.
```

---

# 35. EPIC-025-31 — Smoke tests

## Objetivo

Validar flujos completos del módulo.

## Tasks

```text id="tsp-task-epic-31"
[ ] Implementar smoke definitions iniciales.
[ ] Implementar smoke actualización de setting.
[ ] Implementar smoke resolución de setting efectivo.
[ ] Implementar smoke creación de policy version.
[ ] Implementar smoke submit-review.
[ ] Implementar smoke approval.
[ ] Implementar smoke activation futura.
[ ] Implementar smoke activation job.
[ ] Implementar smoke resolve effective policy.
[ ] Implementar smoke exception lifecycle.
[ ] Implementar smoke /me summaries.
[ ] Implementar smoke export vía SDS.
[ ] Implementar smoke audit.
[ ] Implementar smoke no storageKey.
[ ] Implementar smoke no secrets.
[ ] Agregar smoke tests al CI.
```

## Smoke base

```text id="tsp-task-smoke-base"
[ ] PlatformAdmin consulta settingDefinition general.locale.
[ ] PlatformAdmin crea policyDefinition accessControl.visitorAccessPolicy.
[ ] TenantAdminA consulta settings efectivos.
[ ] TenantAdminA actualiza accessControl.defaultAccessPassTtlMinutes.
[ ] Sistema invalida cache.
[ ] ResolveEffectiveSetting devuelve override.
[ ] TenantAdminA crea policy version draft.
[ ] Sistema genera versionNumber.
[ ] TenantAdminA envía versión a review.
[ ] BoardMemberA aprueba versión.
[ ] TenantAdminA activa versión con effectiveFrom futuro.
[ ] Sistema crea activation scheduled.
[ ] Job activa versión al llegar effectiveFrom.
[ ] ResolveEffectivePolicy devuelve versión nueva.
[ ] SecurityManagerA crea excepción.
[ ] BoardMemberA aprueba excepción.
[ ] ResolveEffectivePolicy aplica excepción para targetResource.
[ ] TenantAdminA exporta policies.
[ ] Sistema crea SecureDocument.
[ ] Response no contiene storageKey.
[ ] Audit contiene eventos críticos.
```

---

# 36. Plan de Pull Requests sugerido

## PR-025-01 — Module skeleton, config, flags and enums

Incluye:

```text id="tsp-pr-01"
[ ] EPIC-025-01.
[ ] EPIC-025-02.
[ ] EPIC-025-03.
```

Acceptance:

```text id="tsp-pr-01-ac"
[ ] Módulo compila.
[ ] Flags prohibidos bloquean boot.
[ ] Enums y errores definidos.
```

---

## PR-025-02 — Value objects, validators, entities and policies

Incluye:

```text id="tsp-pr-02"
[ ] EPIC-025-04.
[ ] EPIC-025-05.
[ ] EPIC-025-06.
[ ] EPIC-025-07.
```

Acceptance:

```text id="tsp-pr-02-ac"
[ ] Domain tests pasan.
[ ] Validators pasan.
[ ] No secrets/no executable payload tests pasan.
```

---

## PR-025-03 — Prisma schema, migration and indexes

Incluye:

```text id="tsp-pr-03"
[ ] EPIC-025-08.
```

Acceptance:

```text id="tsp-pr-03-ac"
[ ] Migración limpia.
[ ] Índices creados.
[ ] Tablas tenant-scoped con tenant_id.
[ ] No existen columnas prohibidas.
```

---

## PR-025-04 — Repository ports and Prisma repositories

Incluye:

```text id="tsp-pr-04"
[ ] EPIC-025-09.
```

Acceptance:

```text id="tsp-pr-04-ac"
[ ] Repositories tenant-scoped.
[ ] Cross-tenant retorna null.
[ ] Effective queries funcionan.
```

---

## PR-025-05 — DTOs, guards and authorization

Incluye:

```text id="tsp-pr-05"
[ ] EPIC-025-10.
[ ] EPIC-025-11.
```

Acceptance:

```text id="tsp-pr-05-ac"
[ ] Forbidden fields rechazados.
[ ] Authz funciona.
[ ] SensitivePermissionGuard funciona.
```

---

## PR-025-06 — Platform definitions API

Incluye:

```text id="tsp-pr-06"
[ ] EPIC-025-12.
[ ] EPIC-025-13.
```

Acceptance:

```text id="tsp-pr-06-ac"
[ ] SettingDefinitions API funciona.
[ ] PolicyDefinitions API funciona.
[ ] Definitions no aceptan secrets/scripts.
```

---

## PR-025-07 — Tenant settings API

Incluye:

```text id="tsp-pr-07"
[ ] EPIC-025-14.
```

Acceptance:

```text id="tsp-pr-07-ac"
[ ] Settings efectivos funcionan.
[ ] Overrides tenant-scoped funcionan.
[ ] Schedule/archive funcionan.
[ ] Cache invalidation funciona.
```

---

## PR-025-08 — Policy versions API

Incluye:

```text id="tsp-pr-08"
[ ] EPIC-025-15.
```

Acceptance:

```text id="tsp-pr-08-ac"
[ ] Version lifecycle funciona.
[ ] Draft/update/review/approve/reject funciona.
[ ] Active immutable.
```

---

## PR-025-09 — Policy activation and effective resolver

Incluye:

```text id="tsp-pr-09"
[ ] EPIC-025-16.
[ ] EPIC-025-17.
```

Acceptance:

```text id="tsp-pr-09-ac"
[ ] Activate/schedule/rollback funcionan.
[ ] Effective policy funciona.
[ ] Effective historical funciona.
[ ] No overlap.
```

---

## PR-025-10 — Policy exceptions and cache

Incluye:

```text id="tsp-pr-10"
[ ] EPIC-025-18.
[ ] EPIC-025-19.
```

Acceptance:

```text id="tsp-pr-10-ac"
[ ] Exceptions funcionan.
[ ] Cache funciona.
[ ] Invalidación post-commit funciona.
```

---

## PR-025-11 — History, comparison and /me summaries

Incluye:

```text id="tsp-pr-11"
[ ] EPIC-025-20.
[ ] EPIC-025-21.
```

Acceptance:

```text id="tsp-pr-11-ac"
[ ] History tenant-scoped.
[ ] Compare sanitizado.
[ ] /me solo summaries residentVisible.
```

---

## PR-025-12 — Exports via SDS and integrations

Incluye:

```text id="tsp-pr-12"
[ ] EPIC-025-22.
[ ] EPIC-025-23.
```

Acceptance:

```text id="tsp-pr-12-ac"
[ ] Exports vía SDS.
[ ] No storageKey.
[ ] Adapters internos funcionan.
```

---

## PR-025-13 — Audit, observability and OpenAPI

Incluye:

```text id="tsp-pr-13"
[ ] EPIC-025-24.
[ ] EPIC-025-25.
[ ] EPIC-025-26.
```

Acceptance:

```text id="tsp-pr-13-ac"
[ ] Audit completo.
[ ] Logs sanitizados.
[ ] Metrics seguras.
[ ] OpenAPI sin campos prohibidos.
```

---

## PR-025-14 — Seeds, hardening, performance and smoke

Incluye:

```text id="tsp-pr-14"
[ ] EPIC-025-27.
[ ] EPIC-025-28.
[ ] EPIC-025-29.
[ ] EPIC-025-30.
[ ] EPIC-025-31.
```

Acceptance:

```text id="tsp-pr-14-ac"
[ ] Seeds idempotentes.
[ ] Security hardening pasa.
[ ] Performance/concurrency básico pasa.
[ ] Smoke completo pasa.
[ ] CI completo pasa.
```

---

# 37. Checklist por endpoint

## 37.1. Platform Setting Definitions

```text id="tsp-endpoint-platform-settings"
[ ] GET    /api/v1/platform/setting-definitions.
[ ] POST   /api/v1/platform/setting-definitions.
[ ] GET    /api/v1/platform/setting-definitions/{definitionId}.
[ ] PATCH  /api/v1/platform/setting-definitions/{definitionId}.
[ ] POST   /api/v1/platform/setting-definitions/{definitionId}/archive.
```

---

## 37.2. Platform Policy Definitions

```text id="tsp-endpoint-platform-policies"
[ ] GET    /api/v1/platform/policy-definitions.
[ ] POST   /api/v1/platform/policy-definitions.
[ ] GET    /api/v1/platform/policy-definitions/{definitionId}.
[ ] PATCH  /api/v1/platform/policy-definitions/{definitionId}.
[ ] POST   /api/v1/platform/policy-definitions/{definitionId}/archive.
```

---

## 37.3. Tenant Settings

```text id="tsp-endpoint-tenant-settings"
[ ] GET    /api/v1/tenant/settings.
[ ] GET    /api/v1/tenant/settings/{key}.
[ ] PATCH  /api/v1/tenant/settings/{key}.
[ ] POST   /api/v1/tenant/settings/{key}/schedule.
[ ] POST   /api/v1/tenant/settings/{key}/archive.
```

---

## 37.4. Tenant Policies

```text id="tsp-endpoint-tenant-policies"
[ ] GET    /api/v1/tenant/policies.
[ ] GET    /api/v1/tenant/policies/{policyKey}.
[ ] GET    /api/v1/tenant/policies/{policyKey}/versions.
[ ] POST   /api/v1/tenant/policies/{policyKey}/versions.
[ ] GET    /api/v1/tenant/policies/{policyKey}/versions/{versionId}.
[ ] PATCH  /api/v1/tenant/policies/{policyKey}/versions/{versionId}.
[ ] POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/submit-review.
[ ] POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/approve.
[ ] POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/reject.
[ ] POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/activate.
[ ] POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/schedule.
[ ] POST   /api/v1/tenant/policies/{policyKey}/rollback.
[ ] POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/archive.
```

---

## 37.5. Effective policies

```text id="tsp-endpoint-effective"
[ ] GET    /api/v1/tenant/policies/{policyKey}/effective.
[ ] GET    /api/v1/tenant/policies/{policyKey}/compare.
```

---

## 37.6. Policy exceptions

```text id="tsp-endpoint-exceptions"
[ ] GET    /api/v1/tenant/policy-exceptions.
[ ] POST   /api/v1/tenant/policy-exceptions.
[ ] GET    /api/v1/tenant/policy-exceptions/{exceptionId}.
[ ] POST   /api/v1/tenant/policy-exceptions/{exceptionId}/approve.
[ ] POST   /api/v1/tenant/policy-exceptions/{exceptionId}/reject.
[ ] POST   /api/v1/tenant/policy-exceptions/{exceptionId}/revoke.
[ ] POST   /api/v1/tenant/policy-exceptions/{exceptionId}/archive.
```

---

## 37.7. History and exports

```text id="tsp-endpoint-history-export"
[ ] GET    /api/v1/tenant/settings-history.
[ ] GET    /api/v1/tenant/policy-history.
[ ] GET    /api/v1/tenant/settings-policies/export.
```

---

## 37.8. `/me` summaries

```text id="tsp-endpoint-me"
[ ] GET    /api/v1/me/tenant-policy-summaries.
[ ] GET    /api/v1/me/tenant-policy-summaries/{category}.
```

---

# 38. Checklist de seguridad final

```text id="tsp-final-security-checklist"
[ ] Todas las rutas requieren AuthGuard.
[ ] Rutas tenant requieren TenantGuard.
[ ] Rutas tenant requieren PermissionGuard.
[ ] Rutas sensibles requieren SensitivePermissionGuard.
[ ] Rutas platform requieren PlatformPermissionGuard.
[ ] Rutas /me requieren OwnPolicySummaryGuard.
[ ] Ningún DTO acepta tenantId.
[ ] Ningún DTO acepta actor fields.
[ ] Ningún DTO acepta status directo fuera de transición.
[ ] Ningún DTO acepta versionNumber desde cliente.
[ ] Ningún DTO acepta storageKey.
[ ] Ningún DTO acepta signedUrl.
[ ] Ningún DTO acepta secret.
[ ] Ningún DTO acepta token.
[ ] Ningún DTO acepta password.
[ ] Ningún DTO acepta apiKey.
[ ] Ningún DTO acepta privateKey.
[ ] Ningún DTO acepta clientSecret.
[ ] Ningún DTO acepta databaseUrl.
[ ] Ningún DTO acepta rawSql.
[ ] Ningún DTO acepta script.
[ ] Ningún DTO acepta executableCode.
[ ] Ninguna response expone storageKey.
[ ] Ninguna response expone signedUrl persistente.
[ ] Ninguna response expone secrets.
[ ] Ninguna response expone payload sensible no sanitizado.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] /me solo expone summaries residentVisible.
[ ] Settings sensibles no se exponen a residentes.
[ ] PolicyPayload sensible no se expone a residentes.
[ ] No hay scripts configurables.
[ ] No hay raw SQL configurable.
[ ] No hay código ejecutable configurable.
[ ] No hay secrets storage.
[ ] No hay adapters de pagos.
[ ] No hay adapters de ledger.
[ ] No hay adapters de conciliación.
[ ] No hay modificación de módulos consumidores.
[ ] No hay IA externa con datos reales.
[ ] Logs no contienen secretos.
[ ] Audit no contiene secretos.
[ ] Exports no contienen secretos.
[ ] OpenAPI no documenta campos prohibidos.
```

---

# 39. Definition of Done

```text id="tsp-task-dod"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado y aprobado.
[ ] Módulo NestJS implementado.
[ ] Configuración implementada.
[ ] Feature flags implementadas.
[ ] Boot validation implementada.
[ ] Enums implementados.
[ ] Errores implementados.
[ ] Value objects implementados.
[ ] JSON schema validators implementados.
[ ] Sanitizers implementados.
[ ] Domain entities implementadas.
[ ] Domain policies implementadas.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositories implementados.
[ ] DTOs implementados.
[ ] Guards implementados.
[ ] Platform Setting Definitions API implementada.
[ ] Platform Policy Definitions API implementada.
[ ] Tenant Settings API implementada.
[ ] Tenant Policies API implementada.
[ ] Policy Versions API implementada.
[ ] Policy Activation API implementada.
[ ] Policy Exceptions API implementada.
[ ] Effective Policy API implementada.
[ ] Internal resolver port implementado.
[ ] History API implementada.
[ ] Compare API implementada.
[ ] /me Policy Summaries API implementada.
[ ] Exports vía SDS implementado.
[ ] Cache implementada.
[ ] Cache invalidation implementada.
[ ] ChangeLog implementado.
[ ] Audit implementado.
[ ] Observability implementada.
[ ] OpenAPI implementado.
[ ] Seeds implementados.
[ ] Tests unitarios pasan.
[ ] Tests schema validators pasan.
[ ] Tests sanitizers pasan.
[ ] Tests entities pasan.
[ ] Tests state machines pasan.
[ ] Tests repositories pasan.
[ ] Tests integration pasan.
[ ] Tests Platform API pasan.
[ ] Tests Tenant Admin API pasan.
[ ] Tests /me API pasan.
[ ] Tests internal resolver pasan.
[ ] Tests authz pasan.
[ ] Tests sensitive permissions pasan.
[ ] Tests multitenancy pasan.
[ ] Tests forbidden fields pasan.
[ ] Tests no secrets pasan.
[ ] Tests no executable payload pasan.
[ ] Tests no raw SQL pasan.
[ ] Tests no public pasan.
[ ] Tests no WordPress pasan.
[ ] Tests no storageKey pasan.
[ ] Tests no transaction side effects pasan.
[ ] Tests no external AI pasan.
[ ] Tests audit pasan.
[ ] Tests observability pasan.
[ ] Tests OpenAPI pasan.
[ ] Tests performance básicos pasan.
[ ] Tests concurrency críticos pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

# 40. No aceptación

No se acepta implementación si:

```text id="tsp-task-no-acceptance"
- permite settings cross-tenant;
- permite policies cross-tenant;
- permite versions cross-tenant;
- permite activations cross-tenant;
- permite exceptions cross-tenant;
- permite history cross-tenant;
- permite exports cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta versionNumber desde cliente;
- acepta versionLabel desde cliente;
- acepta status directo fuera de transición;
- almacena secretos;
- almacena tokens;
- almacena passwords;
- almacena apiKeys;
- almacena privateKeys;
- almacena clientSecrets;
- almacena databaseUrl;
- almacena raw SQL;
- almacena scripts;
- almacena JavaScript configurable;
- almacena functionBody;
- almacena executableCode;
- almacena shellCommand;
- almacena cronCommand;
- acepta storageKey;
- devuelve storageKey;
- devuelve signedUrl persistente;
- expone settings sensibles en /me;
- expone policyPayload sensible completo en /me;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- permite editar active policy destructivamente;
- permite activaciones superpuestas sin control;
- permite excepción sin vigencia;
- aplica exception revoked;
- aplica exception expired;
- cache mezcla tenants;
- exporta sin Secure Document Storage;
- exporta secretos;
- omite auditoría de cambios críticos;
- logs contienen secretos;
- audit contiene secretos;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- modifica datos transaccionales de módulos consumidores;
- abre portones;
- controla hardware;
- habilita biometría;
- habilita reconocimiento facial;
- habilita IA externa con datos reales.
```

---

# 41. Resultado esperado

Al completar este backlog, el módulo `025-tenant-settings-policies` quedará listo para implementación controlada dentro de RESIDENT Core.

Resultado esperado:

```text id="tsp-task-expected-result"
module foundation tasks definidas
configuration tasks definidas
feature flags tasks definidas
enums tasks definidas
errors tasks definidas
value objects tasks definidas
validators tasks definidas
sanitizers tasks definidas
entities tasks definidas
domain policies tasks definidas
Prisma migration tasks definidas
repository tasks definidas
DTO tasks definidas
guards tasks definidas
Platform Setting Definitions API tasks definidas
Platform Policy Definitions API tasks definidas
Tenant Settings API tasks definidas
Tenant Policies API tasks definidas
Policy Versions tasks definidas
Policy Activation tasks definidas
Policy Exceptions tasks definidas
Effective Resolver tasks definidas
Cache tasks definidas
History tasks definidas
Comparison tasks definidas
/me summaries tasks definidas
SDS exports tasks definidas
internal integrations tasks definidas
audit tasks definidas
observability tasks definidas
OpenAPI tasks definidas
seeds tasks definidas
security hardening tasks definidas
performance tasks definidas
concurrency tasks definidas
CI gates tasks definidas
smoke tasks definidas
PR plan definido
DoD definido
no acceptance definido
```

---

# 42. Expediente actualizado

```text id="tsp-task-expediente"
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
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
