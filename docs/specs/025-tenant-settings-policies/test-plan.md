# Test Plan — 025 Tenant Settings and Policies

> **Slice vigente de Sprint 2:** los gates aplicables cubren catálogo `general.locale`,
> default/override, validación tipada, aislamiento tenant y API autorizada. Los casos de
> policies, scheduling, history, exports y mutación de definitions quedan diferidos por
> GAP-S2-006.

## 1. Información del documento

| Campo           | Valor                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                 |
| Spec ID         | 025                                                                                           |
| Módulo          | Tenant Settings and Policies                                                                  |
| Documento       | Test Plan                                                                                     |
| Ruta            | `docs/specs/025-tenant-settings-policies/test-plan.md`                                        |
| Versión         | 0.1                                                                                           |
| Estado          | accepted                                                                                  |
| Fecha           | 2026-07-31                                                                                    |
| Documento base  | `docs/specs/025-tenant-settings-policies/spec.md`                                             |
| Plan técnico    | `docs/specs/025-tenant-settings-policies/plan.md`                                             |
| Modelo de datos | `docs/specs/025-tenant-settings-policies/data-model.md`                                       |
| Contrato API    | `docs/specs/025-tenant-settings-policies/api-contract.md`                                     |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                |
| Naturaleza      | Tenant-scoped / Configuration-governed / Policy-driven / Versioned / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `025-tenant-settings-policies`.

El objetivo es validar que Tenant Settings and Policies funcione como módulo transversal, seguro, multitenant, versionado, auditado, no público y capaz de resolver configuración efectiva para los demás módulos de RESIDENT Core sin ejecutar acciones transaccionales de esos módulos.

Regla central del plan de pruebas:

```text id="tsp-test-rule"
Tenant Settings and Policies solo puede aceptarse si todas sus pruebas demuestran tenant isolation, validación estricta de schemas, versionamiento correcto de políticas, resolución efectiva por fecha, activaciones auditadas, excepciones con vigencia, cache segura, ausencia de secretos, ausencia de scripts, ausencia de raw SQL, ausencia de código ejecutable, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de storageKey expuesto, ausencia de efectos transaccionales directos, ausencia de pagos, ausencia de asientos contables, ausencia de conciliaciones bancarias y ausencia de IA externa con datos reales.
```

---

## 3. Objetivos de prueba

```text id="tsp-test-objectives"
1. Verificar tenant isolation en todas las entidades tenant-scoped.
2. Verificar permisos administrativos, platform y sensibles.
3. Verificar que Platform API administra definitions globales sin mezclar tenant data.
4. Verificar que Tenant Admin API opera solo sobre el tenant actual.
5. Verificar que /me solo expone summaries residentVisible.
6. Verificar settings efectivos con default platform y tenant override.
7. Verificar validación de valueType y JSON Schema.
8. Verificar políticas versionadas.
9. Verificar lifecycle de policy versions.
10. Verificar activación inmediata.
11. Verificar activación futura.
12. Verificar rollback lógico sin borrar historial.
13. Verificar resolución efectiva histórica por effectiveAt.
14. Verificar excepciones de política con vigencia.
15. Verificar que excepciones expiradas/revocadas no aplican.
16. Verificar comparación sanitizada de versiones.
17. Verificar historial funcional sanitizado.
18. Verificar exportaciones vía Secure Document Storage.
19. Verificar que no se expone storageKey.
20. Verificar cache e invalidación.
21. Verificar auditoría obligatoria.
22. Verificar logs sin secretos ni payloads sensibles.
23. Verificar métricas sin labels sensibles.
24. Verificar OpenAPI sin campos prohibidos.
25. Verificar límites explícitos: no public, no WordPress, no secrets, no executable payload, no transaction side effects, no external AI.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="tsp-test-scope-in"
- Value objects.
- Schema validators.
- JSONB sanitizers.
- Domain entities.
- State machines.
- Domain policies.
- DTO validation.
- Repository ports.
- Prisma repositories.
- Application services.
- Use cases.
- Platform API.
- Tenant Admin API.
- /me policy summaries API.
- Internal effective setting/policy resolver.
- Effective dating.
- Policy versioning.
- Policy activation.
- Policy exceptions.
- Cache.
- Cache invalidation.
- Change log.
- Secure Document Storage boundary.
- Audit boundary.
- Observability.
- OpenAPI contract.
- Security tests.
- Privacy tests.
- Performance tests.
- Concurrency tests.
- Regression tests.
- Smoke tests.
- CI gates.
```

---

### 4.2. Fuera de alcance

No se probarán como funcionalidades propias del MVP:

```text id="tsp-test-scope-out"
- motor avanzado de reglas;
- DSL ejecutable;
- JavaScript configurable por tenant;
- raw SQL configurable;
- webhooks configurables;
- secrets manager;
- almacenamiento de credenciales;
- workflow multi-firma complejo;
- firma electrónica legal;
- recálculo financiero automático;
- modificación automática de datos transaccionales;
- creación de pagos;
- creación de asientos contables;
- confirmación de conciliaciones bancarias;
- apertura de portones;
- control de hardware;
- biometría;
- reconocimiento facial;
- publicación pública desde WordPress;
- IA externa con datos reales.
```

Estas capacidades sí deben probarse como **prohibiciones** mediante tests negativos.

---

## 5. Estrategia de pruebas

### 5.1. Pirámide de pruebas

```text id="tsp-test-pyramid"
1. Unit tests:
   - value objects;
   - schema validators;
   - sanitizers;
   - entities;
   - state machines;
   - domain policies;
   - cache key builder.

2. Integration tests:
   - Prisma repositories;
   - PostgreSQL constraints;
   - effective policy resolution;
   - activation scheduling;
   - cache invalidation;
   - audit adapter;
   - SDS adapter;
   - tenants/users adapters.

3. API tests:
   - Platform API;
   - Tenant Admin API;
   - /me API;
   - DTO validation;
   - permissions;
   - sensitive permissions;
   - error mapping;
   - response sanitization.

4. Security tests:
   - tenant isolation;
   - forbidden fields;
   - no secrets;
   - no executable payload;
   - no raw SQL;
   - no public endpoints;
   - no WordPress access;
   - no storageKey exposure;
   - no transaction side effects;
   - no external AI.

5. E2E / smoke tests:
   - PlatformAdmin creates definitions;
   - TenantAdmin updates setting;
   - TenantAdmin creates policy version;
   - BoardMember approves;
   - TenantAdmin activates;
   - Consumer resolves effective policy;
   - Admin exports configuration via SDS.
```

---

### 5.2. Criterio general de aceptación

```text id="tsp-test-acceptance-general"
El módulo solo pasa si todos los tests unitarios, integración, API, seguridad, multitenancy, versionamiento, effective dating, auditoría, OpenAPI y smoke flows pasan en CI.
```

---

## 6. Ambientes de prueba

### 6.1. Local

```text id="tsp-test-local-env"
- Docker Compose.
- PostgreSQL local.
- Redis local opcional.
- Keycloak local o mock OIDC.
- Prisma migrate dev/test.
- Seeds sintéticos.
- Secure Document Storage mock/local.
- Audit mock/local.
```

---

### 6.2. CI

```text id="tsp-test-ci-env"
- PostgreSQL efímero.
- Migración limpia.
- Seeds reproducibles.
- Tests unitarios.
- Tests integración.
- Tests API.
- Tests security.
- Tests OpenAPI.
- Coverage report.
```

---

### 6.3. Staging futuro

```text id="tsp-test-staging-env"
- Keycloak staging.
- SDS staging.
- Redis staging si cache distribuida.
- Audit activo.
- Metrics activo.
- Datos sintéticos.
- Sin secretos reales.
- Sin configuraciones sensibles reales de clientes.
```

---

## 7. Datos de prueba

### 7.1. Tenants

```text id="tsp-test-tenants"
tenantA = "Conjunto Demo Norte"
tenantB = "Conjunto Demo Sur"
```

Regla:

```text id="tsp-test-tenant-rule"
tenantA nunca puede leer, crear, modificar, activar, aprobar, comparar, exportar, resolver o aplicar settings, policies, versions, activations, exceptions, history o exports de tenantB.
```

---

### 7.2. Usuarios

```text id="tsp-test-users"
platformAdmin
platformSupportReadOnly

tenantAdminA
boardMemberA
financialManagerA
securityManagerA
residentA1
residentA2

tenantAdminB
boardMemberB
residentB1

anonymousUser
```

---

### 7.3. Setting definitions

```text id="tsp-test-setting-definitions"
general.locale
general.defaultPageSize

security.publicSettingsApiEnabled
security.wordpressSettingsAccessEnabled
security.externalAiRealDataAllowed
security.sensitiveExportsRequireApproval

financial.paymentValidationRequired
financial.receiptRequired
financial.autoAllocationEnabled

accessControl.defaultAccessPassTtlMinutes
accessControl.residentCanCreateVisitor
documents.downloadAuditRequired
inventory.negativeStockAllowed
```

---

### 7.4. Policy definitions

```text id="tsp-test-policy-definitions"
financial.billingPolicy
financial.paymentPolicy
reservations.reservationPolicy
communications.notificationPolicy
documents.documentRetentionPolicy
accessControl.visitorAccessPolicy
maintenance.workOrderPolicy
inventory.stockPolicy
privacy.dataGovernancePolicy
security.exportPolicy
```

---

### 7.5. Policy versions

```text id="tsp-test-policy-versions"
tenantA:
- visitorAccessPolicy v1 active
- visitorAccessPolicy v2 draft
- visitorAccessPolicy v3 reviewReady
- visitorAccessPolicy v4 approved
- visitorAccessPolicy v5 scheduled
- visitorAccessPolicy v6 rejected
- visitorAccessPolicy v7 archived

tenantB:
- visitorAccessPolicy v1 active
```

---

### 7.6. Exceptions

```text id="tsp-test-exceptions"
tenantA:
- active unitOverride
- pendingApproval resourceOverride
- expired temporaryOverride
- revoked manualAdministrativeOverride

tenantB:
- active unitOverride
```

---

### 7.7. External references

```text id="tsp-test-external"
secureDocumentA
secureDocumentB
propertyUnitA101
propertyUnitB201
traceIdA
traceIdB
```

---

## 8. Unit tests — Value objects

### 8.1. SettingKey

```text id="tsp-test-vo-setting-key"
[ ] Acepta general.locale.
[ ] Acepta accessControl.defaultAccessPassTtlMinutes.
[ ] Rechaza string vacío.
[ ] Rechaza espacios.
[ ] Rechaza key sin categoría.
[ ] Rechaza caracteres peligrosos.
[ ] Rechaza longitud excesiva.
```

---

### 8.2. PolicyKey

```text id="tsp-test-vo-policy-key"
[ ] Acepta accessControl.visitorAccessPolicy.
[ ] Acepta financial.billingPolicy.
[ ] Rechaza string vacío.
[ ] Rechaza key sin punto.
[ ] Rechaza script tag.
[ ] Rechaza raw SQL.
[ ] Rechaza longitud excesiva.
```

---

### 8.3. PolicyVersionNumber

```text id="tsp-test-vo-version-number"
[ ] Acepta versionNumber entero positivo.
[ ] Genera versionLabel v1.
[ ] Genera versionLabel v2.
[ ] Rechaza 0.
[ ] Rechaza negativos.
[ ] Rechaza valor enviado desde DTO externo.
```

---

### 8.4. EffectiveWindow

```text id="tsp-test-vo-effective-window"
[ ] Acepta effectiveFrom sin effectiveUntil.
[ ] Acepta effectiveFrom < effectiveUntil.
[ ] Rechaza effectiveFrom >= effectiveUntil.
[ ] Rechaza fecha inválida.
[ ] Soporta consulta effectiveAt dentro de ventana.
[ ] Rechaza ventana inválida de excepción.
```

---

### 8.5. ChangeReason

```text id="tsp-test-vo-change-reason"
[ ] Acepta razón válida.
[ ] Aplica trim.
[ ] Rechaza vacío para cambios críticos.
[ ] Rechaza longitud excesiva.
[ ] Rechaza HTML/script.
[ ] Rechaza raw SQL sospechoso.
```

---

### 8.6. PolicyPayload

```text id="tsp-test-vo-policy-payload"
[ ] Acepta objeto JSON válido.
[ ] Rechaza null si schema exige object.
[ ] Rechaza payload con secret.
[ ] Rechaza payload con token.
[ ] Rechaza payload con rawSql.
[ ] Rechaza payload con script.
[ ] Rechaza payload con functionBody.
[ ] Rechaza payload con executableCode.
[ ] Rechaza externalAiRealDataAllowed=true.
```

---

## 9. Unit tests — Schema validators

### 9.1. Setting value validator

```text id="tsp-test-setting-value-validator"
[ ] Valida string.
[ ] Valida integer.
[ ] Valida boolean.
[ ] Valida decimalString.
[ ] Valida enum.
[ ] Valida stringArray.
[ ] Valida object.
[ ] Rechaza float cuando valueType=integer.
[ ] Rechaza number cuando valueType=decimalString si se espera string.
[ ] Rechaza value fuera de allowedValues.
[ ] Rechaza value que no cumple schema.
```

---

### 9.2. Policy schema validator

```text id="tsp-test-policy-schema-validator"
[ ] Valida policyPayload contra JSON Schema.
[ ] Rechaza required faltante.
[ ] Rechaza additionalProperties no permitido.
[ ] Rechaza tipo incorrecto.
[ ] Rechaza integer fuera de minimum.
[ ] Rechaza integer fuera de maximum.
[ ] Rechaza enum inválido.
[ ] Rechaza schema sin type.
[ ] Rechaza schema ejecutable.
```

---

### 9.3. Forbidden keys validator

```text id="tsp-test-forbidden-keys-validator"
[ ] Rechaza secret.
[ ] Rechaza token.
[ ] Rechaza password.
[ ] Rechaza apiKey.
[ ] Rechaza privateKey.
[ ] Rechaza clientSecret.
[ ] Rechaza webhookSecret.
[ ] Rechaza databaseUrl.
[ ] Rechaza storageKey.
[ ] Rechaza signedUrl.
[ ] Rechaza rawSql.
[ ] Rechaza script.
[ ] Rechaza javascript.
[ ] Rechaza functionBody.
[ ] Rechaza executableCode.
[ ] Rechaza shellCommand.
[ ] Rechaza cronCommand.
[ ] Rechaza externalAiEnabled.
[ ] Rechaza externalAiRealDataAllowed.
```

---

## 10. Unit tests — Entities

### 10.1. SettingDefinition

```text id="tsp-test-entity-setting-definition"
[ ] Crea definition active.
[ ] Rechaza key inválida.
[ ] Rechaza defaultValue inválido.
[ ] Rechaza defaultValue con secretos.
[ ] Rechaza schema con scripts.
[ ] Marca residentVisible=false si sensitivity es sensible.
[ ] Actualiza description.
[ ] Archiva definition.
[ ] Archived definition no se usa para nuevos values.
```

---

### 10.2. TenantSettingValue

```text id="tsp-test-entity-tenant-setting-value"
[ ] Crea tenant override draft.
[ ] Activa setting.
[ ] Programa setting futuro.
[ ] Expira setting.
[ ] Archiva setting.
[ ] Rechaza effectiveUntil <= effectiveFrom.
[ ] Rechaza value con secreto.
[ ] Rechaza value con raw SQL.
[ ] Requiere reason si runtimeCritical.
[ ] Requiere permiso sensible si category security.
```

---

### 10.3. PolicyDefinition

```text id="tsp-test-entity-policy-definition"
[ ] Crea policy definition active.
[ ] Requiere policyKey.
[ ] Requiere ownerModule.
[ ] Requiere schema.
[ ] Requiere defaultPolicy.
[ ] Valida defaultPolicy contra schema.
[ ] Rechaza defaultPolicy con secretos.
[ ] Rechaza schema ejecutable.
[ ] Requiere versioningRequired=true para critical.
[ ] Archiva definition.
```

---

### 10.4. TenantPolicyVersion

```text id="tsp-test-entity-policy-version"
[ ] Crea version draft.
[ ] Genera versionNumber server-side.
[ ] Genera versionLabel server-side.
[ ] Requiere changeReason.
[ ] Valida policyPayload contra schema.
[ ] draft -> reviewReady.
[ ] reviewReady -> approved.
[ ] reviewReady -> rejected.
[ ] approved -> scheduled.
[ ] approved -> active.
[ ] active -> superseded.
[ ] active -> expired.
[ ] Rechaza editar active destructivamente.
[ ] Rechaza activar rejected.
[ ] Rechaza activar archived.
```

---

### 10.5. TenantPolicyActivation

```text id="tsp-test-entity-activation"
[ ] Crea activation immediate.
[ ] Crea activation scheduled.
[ ] Crea activation rollback.
[ ] Requiere effectiveFrom.
[ ] Requiere activationReason.
[ ] Rechaza policyVersion cross-tenant.
[ ] applied no se elimina.
[ ] rollback no borra activación previa.
[ ] cancelled no aplica.
```

---

### 10.6. TenantPolicyException

```text id="tsp-test-entity-exception"
[ ] Crea exception draft.
[ ] Crea exception pendingApproval si sensible.
[ ] Aprueba exception.
[ ] Activa exception vigente.
[ ] Expira exception.
[ ] Revoca exception.
[ ] Rechaza validUntil <= validFrom.
[ ] Requiere reason.
[ ] Rechaza exception sin vigencia.
[ ] Rechaza exception multi-tenant.
```

---

### 10.7. TenantSettingsChangeLog

```text id="tsp-test-entity-change-log"
[ ] Crea change log tenant-scoped.
[ ] Guarda oldValueSanitized.
[ ] Guarda newValueSanitized.
[ ] Rechaza secretos en oldValueSanitized.
[ ] Rechaza secretos en newValueSanitized.
[ ] Rechaza scripts.
[ ] Requiere traceId.
[ ] No permite actualización ordinaria.
```

---

### 10.8. TenantSettingsExport

```text id="tsp-test-entity-export"
[ ] Crea export requested.
[ ] Cambia a processing.
[ ] Cambia a completed con secureDocumentId.
[ ] Cambia a failed con failureReason.
[ ] Rechaza completed sin secureDocumentId.
[ ] Rechaza failed sin failureReason.
[ ] Rechaza storageKey.
[ ] Archiva export.
```

---

## 11. Unit tests — State machines

### 11.1. TenantSettingValueStatus

```text id="tsp-test-sm-setting-status"
[ ] draft -> active permitido.
[ ] draft -> scheduled permitido.
[ ] scheduled -> active permitido.
[ ] active -> expired permitido.
[ ] active -> archived permitido.
[ ] scheduled -> archived permitido.
[ ] expired -> archived permitido.
[ ] archived -> active prohibido.
[ ] expired -> active prohibido.
[ ] active -> draft prohibido.
```

---

### 11.2. TenantPolicyVersionStatus

```text id="tsp-test-sm-policy-version-status"
[ ] draft -> reviewReady permitido.
[ ] reviewReady -> approved permitido.
[ ] reviewReady -> rejected permitido.
[ ] approved -> scheduled permitido.
[ ] approved -> active permitido.
[ ] scheduled -> active permitido.
[ ] active -> superseded permitido.
[ ] active -> expired permitido.
[ ] superseded -> archived permitido.
[ ] expired -> archived permitido.
[ ] rejected -> archived permitido.
[ ] active -> draft prohibido.
[ ] rejected -> active prohibido.
[ ] archived -> active prohibido.
```

---

### 11.3. TenantPolicyExceptionStatus

```text id="tsp-test-sm-exception-status"
[ ] draft -> pendingApproval permitido.
[ ] draft -> active permitido si no sensible.
[ ] pendingApproval -> approved permitido.
[ ] pendingApproval -> rejected permitido.
[ ] approved -> active permitido.
[ ] active -> expired permitido.
[ ] active -> revoked permitido.
[ ] revoked -> archived permitido.
[ ] expired -> archived permitido.
[ ] rejected -> archived permitido.
[ ] revoked -> active prohibido.
[ ] expired -> active prohibido.
[ ] archived -> active prohibido.
```

---

## 12. Unit tests — Domain policies

### 12.1. TenantSettingsIsolationPolicy

```text id="tsp-test-policy-isolation"
[ ] Permite recurso del mismo tenant.
[ ] Rechaza recurso de tenant distinto.
[ ] Cross-tenant se mapea a 404.
```

---

### 12.2. NoSecretsInSettingsPolicy

```text id="tsp-test-policy-no-secrets"
[ ] Rechaza secret.
[ ] Rechaza token.
[ ] Rechaza password.
[ ] Rechaza apiKey.
[ ] Rechaza clientSecret.
[ ] Rechaza privateKey.
[ ] Rechaza databaseUrl.
[ ] Rechaza storageKey.
```

---

### 12.3. NoExecutablePolicyPayloadPolicy

```text id="tsp-test-policy-no-executable"
[ ] Rechaza rawSql.
[ ] Rechaza script.
[ ] Rechaza javascript.
[ ] Rechaza functionBody.
[ ] Rechaza executableCode.
[ ] Rechaza shellCommand.
[ ] Rechaza cronCommand.
```

---

### 12.4. NoRetroactiveChangePolicy

```text id="tsp-test-policy-no-retroactive"
[ ] Permite effectiveFrom futuro.
[ ] Permite effectiveFrom actual.
[ ] Rechaza effectiveFrom pasado sin permiso.
[ ] Permite effectiveFrom pasado con tenantPolicies.activateRetroactive.
[ ] Requiere reason reforzado.
```

---

### 12.5. NoTransactionalSideEffectsPolicy

```text id="tsp-test-policy-no-transaction-side-effects"
[ ] Bloquea create Charge.
[ ] Bloquea create Payment.
[ ] Bloquea create SupplierPaymentOrder.
[ ] Bloquea create JournalEntry.
[ ] Bloquea confirm Bank Reconciliation.
[ ] Bloquea modify AccessEvent.
[ ] Bloquea modify WorkOrder.
[ ] Bloquea modify Stock.
```

---

### 12.6. NoPublicExposurePolicy

```text id="tsp-test-policy-no-public"
[ ] Bloquea publicSettingsApiEnabled=true.
[ ] Bloquea public policies API.
[ ] Bloquea public summaries sensibles.
[ ] Bloquea exposición de settings sensibles en /public.
```

---

### 12.7. NoWordPressAccessPolicy

```text id="tsp-test-policy-no-wordpress"
[ ] Bloquea origen WordPress público.
[ ] Bloquea sesión WordPress como auth Core.
[ ] Bloquea rutas private settings desde dominio público WordPress.
[ ] Bloquea shortcodes con settings sensibles.
```

---

## 13. Integration tests — Repositories

### 13.1. SettingDefinitionRepository

```text id="tsp-test-repo-setting-definition"
[ ] create guarda definition.
[ ] key único.
[ ] list filtra por status.
[ ] list filtra por category.
[ ] get by id.
[ ] get by key.
[ ] archive no borra físicamente.
[ ] archived no aparece en list active.
```

---

### 13.2. TenantSettingValueRepository

```text id="tsp-test-repo-setting-value"
[ ] create tenant setting.
[ ] list filtra por tenantId.
[ ] get usa id + tenantId.
[ ] get by key filtra tenantId.
[ ] update usa id + tenantId.
[ ] archive usa id + tenantId.
[ ] tenantA no lee setting tenantB.
[ ] tenantA no actualiza setting tenantB.
[ ] effective query respeta effectiveFrom/effectiveUntil.
```

---

### 13.3. PolicyDefinitionRepository

```text id="tsp-test-repo-policy-definition"
[ ] create guarda policy definition.
[ ] policyKey único.
[ ] list filtra por category.
[ ] list filtra por ownerModule.
[ ] get by id.
[ ] get by policyKey.
[ ] archive no borra físicamente.
[ ] archived no se usa para nuevas versions.
```

---

### 13.4. TenantPolicyVersionRepository

```text id="tsp-test-repo-policy-version"
[ ] create version tenant-scoped.
[ ] versionNumber único por tenant + policyKey.
[ ] mismo versionNumber permitido en tenant distinto.
[ ] list versions filtra tenantId.
[ ] get version usa id + tenantId.
[ ] update draft usa id + tenantId.
[ ] tenantA no lee version tenantB.
[ ] effective query devuelve versión vigente.
[ ] historical query devuelve versión vigente para effectiveAt pasado.
```

---

### 13.5. TenantPolicyActivationRepository

```text id="tsp-test-repo-activation"
[ ] create activation tenant-scoped.
[ ] list activations filtra tenantId.
[ ] get activation usa id + tenantId.
[ ] scheduled query devuelve activaciones pendientes.
[ ] rollback guarda rollbackOfActivationId.
[ ] tenantA no lee activation tenantB.
```

---

### 13.6. TenantPolicyExceptionRepository

```text id="tsp-test-repo-exception"
[ ] create exception tenant-scoped.
[ ] list exceptions filtra tenantId.
[ ] get exception usa id + tenantId.
[ ] query active by effectiveAt funciona.
[ ] query targetResource filtra correctamente.
[ ] revoked no aparece como aplicable.
[ ] expired no aparece como aplicable.
[ ] tenantA no lee exception tenantB.
```

---

### 13.7. ChangeLogRepository

```text id="tsp-test-repo-change-log"
[ ] create change log tenant-scoped.
[ ] list by tenant.
[ ] list by key.
[ ] list by entityType.
[ ] list by date range.
[ ] tenantA no lee changelog tenantB.
[ ] oldValueSanitized no contiene secretos.
[ ] newValueSanitized no contiene secretos.
```

---

### 13.8. TenantSettingsExportRepository

```text id="tsp-test-repo-export"
[ ] create export tenant-scoped.
[ ] mark processing.
[ ] mark completed con secureDocumentId.
[ ] mark failed con failureReason.
[ ] list exports filtra tenantId.
[ ] tenantA no lee export tenantB.
[ ] secureDocumentId no se confunde con storageKey.
```

---

## 14. Integration tests — Effective resolution

### 14.1. Effective setting

```text id="tsp-test-effective-setting"
[ ] Devuelve platform default si no hay override.
[ ] Devuelve tenant override active si existe.
[ ] Devuelve override vigente para effectiveAt.
[ ] No devuelve scheduled antes de effectiveFrom.
[ ] Devuelve scheduled cuando ya está active por job.
[ ] No devuelve archived.
[ ] No devuelve expired para now.
[ ] Devuelve expired si effectiveAt cae en su ventana histórica.
[ ] Incluye source.
[ ] Incluye settingValueId si aplica.
```

---

### 14.2. Effective policy

```text id="tsp-test-effective-policy"
[ ] Devuelve defaultPolicy si no hay tenant version active.
[ ] Devuelve policyPayload de active version.
[ ] No devuelve draft.
[ ] No devuelve reviewReady.
[ ] No devuelve rejected.
[ ] No devuelve archived.
[ ] Devuelve versión histórica por effectiveAt.
[ ] Incluye policyVersionId.
[ ] Incluye versionLabel.
[ ] Incluye source.
[ ] No devuelve secretos.
```

---

### 14.3. Effective exceptions

```text id="tsp-test-effective-exceptions"
[ ] Aplica exception active vigente.
[ ] No aplica exception pendingApproval.
[ ] No aplica exception rejected.
[ ] No aplica exception revoked.
[ ] No aplica exception expired.
[ ] No aplica exception archived.
[ ] Filtra por targetResourceType.
[ ] Filtra por targetResourceId.
[ ] No aplica exception tenantB en tenantA.
```

---

## 15. Integration tests — Cache

### 15.1. Cache keys

```text id="tsp-test-cache-keys"
[ ] Cache key incluye tenantId.
[ ] Cache key incluye setting key.
[ ] Cache key incluye policyKey.
[ ] Cache key incluye effectiveAt bucket.
[ ] Cache key no se expone por API.
[ ] Cache key no contiene secretos.
```

---

### 15.2. Cache hit/miss

```text id="tsp-test-cache-hit-miss"
[ ] Primer resolve genera cache miss.
[ ] Segundo resolve genera cache hit.
[ ] Cache devuelve setting correcto.
[ ] Cache devuelve policy correcta.
[ ] Cache no mezcla tenants.
```

---

### 15.3. Cache invalidation

```text id="tsp-test-cache-invalidation"
[ ] Update tenant setting invalida setting cache.
[ ] Activate policy invalida policy cache.
[ ] Approve active exception invalida exception cache.
[ ] Revoke exception invalida exception cache.
[ ] Update definition invalida cache asociada si aplica.
[ ] Invalidación ocurre post-commit.
[ ] Si cache falla, DB/default seguro responde.
```

---

## 16. Integration tests — External adapters

### 16.1. Tenants adapter

```text id="tsp-test-adapter-tenants"
[ ] validateTenantIsActive acepta tenantA active.
[ ] validateTenantIsActive rechaza tenant suspended.
[ ] getTenantOperationalSummary devuelve tenant actual.
[ ] No permite tenantB en contexto tenantA.
```

---

### 16.2. Users adapter

```text id="tsp-test-adapter-users"
[ ] getActorProfile resuelve actor.
[ ] validateApprover acepta boardMemberA con permiso.
[ ] validateApprover rechaza residentA1.
[ ] validateApprover rechaza boardMemberB para tenantA.
```

---

### 16.3. Secure Document Storage adapter

```text id="tsp-test-adapter-sds"
[ ] createExportDocument devuelve secureDocumentId.
[ ] secureDocumentId pertenece al tenant.
[ ] Response no incluye storageKey.
[ ] Response no incluye signedUrl persistente.
[ ] Falla SDS marca export failed.
[ ] failureReason se sanitiza.
```

---

### 16.4. Audit adapter

```text id="tsp-test-adapter-audit"
[ ] audit incluye tenantId.
[ ] audit incluye actor.
[ ] audit incluye action.
[ ] audit incluye resourceType.
[ ] audit incluye resourceId.
[ ] audit incluye traceId.
[ ] audit no incluye secretos.
[ ] audit no incluye storageKey.
[ ] audit no incluye raw payload sensible.
[ ] audit no incluye datos cross-tenant.
```

---

## 17. API tests — Platform Setting Definitions

```text id="tsp-test-api-platform-setting-definitions"
[ ] GET /platform/setting-definitions requiere auth.
[ ] GET requiere platformSettingDefinitions.read.
[ ] POST requiere platformSettingDefinitions.create.
[ ] POST crea definition.
[ ] POST rechaza key duplicada.
[ ] POST rechaza key inválida.
[ ] POST rechaza defaultValue inválido.
[ ] POST rechaza defaultValue con secret.
[ ] POST rechaza schema con script.
[ ] PATCH requiere platformSettingDefinitions.update.
[ ] PATCH rechaza status directo.
[ ] PATCH rechaza actor fields.
[ ] Archive requiere platformSettingDefinitions.archive.
[ ] Archive no borra físicamente.
```

---

## 18. API tests — Platform Policy Definitions

```text id="tsp-test-api-platform-policy-definitions"
[ ] GET /platform/policy-definitions requiere auth.
[ ] GET requiere platformPolicyDefinitions.read.
[ ] POST requiere platformPolicyDefinitions.create.
[ ] POST crea policy definition.
[ ] POST rechaza policyKey duplicado.
[ ] POST rechaza ownerModule vacío.
[ ] POST rechaza schema inválido.
[ ] POST rechaza defaultPolicy inválido.
[ ] POST rechaza defaultPolicy con secret.
[ ] POST rechaza defaultPolicy con rawSql.
[ ] POST rechaza defaultPolicy con executableCode.
[ ] PATCH requiere platformPolicyDefinitions.update.
[ ] PATCH rechaza status directo.
[ ] Archive requiere platformPolicyDefinitions.archive.
```

---

## 19. API tests — Tenant Settings

```text id="tsp-test-api-tenant-settings"
[ ] GET /tenant/settings requiere auth.
[ ] GET requiere TenantGuard.
[ ] GET requiere tenantSettings.read.
[ ] GET lista solo settings del tenant actual.
[ ] GET usa default platform si no hay override.
[ ] GET no devuelve secretos.
[ ] GET no devuelve cross-tenant.

[ ] GET /tenant/settings/{key} devuelve setting efectivo.
[ ] GET con effectiveAt devuelve valor histórico correcto.
[ ] GET key inexistente retorna 404.

[ ] PATCH /tenant/settings/{key} requiere tenantSettings.update.
[ ] PATCH actualiza setting tenant-overridable.
[ ] PATCH valida valueType.
[ ] PATCH valida schema.
[ ] PATCH rechaza tenantId.
[ ] PATCH rechaza actor fields.
[ ] PATCH rechaza secret.
[ ] PATCH rechaza token.
[ ] PATCH rechaza rawSql.
[ ] PATCH rechaza script.
[ ] PATCH setting security requiere tenantSettings.updateSecurity.
[ ] PATCH setting privacy requiere tenantSettings.updatePrivacy.
[ ] PATCH setting financial requiere tenantSettings.updateFinancial.
[ ] PATCH runtimeCritical requiere reason.
[ ] PATCH invalida cache.
[ ] PATCH audita tenantSetting.updated.

[ ] POST /tenant/settings/{key}/schedule requiere tenantSettings.schedule.
[ ] schedule requiere effectiveFrom futuro.
[ ] schedule no altera lectura efectiva actual.
[ ] schedule audita tenantSetting.scheduled.

[ ] POST /tenant/settings/{key}/archive requiere tenantSettings.archive.
[ ] archive archiva override.
[ ] archive vuelve a platform default si no hay otro override.
[ ] archive invalida cache.
[ ] archive audita tenantSetting.archived.
```

---

## 20. API tests — Tenant Policies

```text id="tsp-test-api-tenant-policies"
[ ] GET /tenant/policies requiere tenantPolicies.read.
[ ] Lista policies tenant-scoped.
[ ] Usa platform default si no hay override.
[ ] No devuelve payload sensible sin permiso.

[ ] GET /tenant/policies/{policyKey} devuelve policy summary.
[ ] GET con includeVersions incluye versions si permiso.
[ ] GET policy tenantB desde tenantA retorna 404 o default tenantA según key.

[ ] GET /tenant/policies/{policyKey}/versions lista versions del tenant.
[ ] No lista versions tenantB.

[ ] POST /tenant/policies/{policyKey}/versions requiere tenantPolicies.createVersion.
[ ] POST crea draft.
[ ] POST genera versionNumber server-side.
[ ] POST genera versionLabel server-side.
[ ] POST valida policyPayload.
[ ] POST rechaza tenantId.
[ ] POST rechaza versionNumber.
[ ] POST rechaza status.
[ ] POST rechaza secret.
[ ] POST rechaza rawSql.
[ ] POST rechaza script.
[ ] POST rechaza executableCode.
[ ] POST no modifica active.
[ ] POST audita tenantPolicyVersion.created.

[ ] PATCH version requiere tenantPolicies.updateDraft.
[ ] PATCH solo edita draft.
[ ] PATCH active retorna 409.
[ ] PATCH scheduled retorna 409.
[ ] PATCH archived retorna 409.
```

---

## 21. API tests — Policy review and approval

```text id="tsp-test-api-policy-review"
[ ] submit-review requiere tenantPolicies.submitReview.
[ ] submit-review draft -> reviewReady.
[ ] submit-review valida schema nuevamente.
[ ] submit-review audita tenantPolicyVersion.submittedForReview.

[ ] approve requiere tenantPolicies.approve.
[ ] approve sensitive requiere tenantPolicies.approveSensitive.
[ ] approve reviewReady -> approved.
[ ] approve rejected retorna 409.
[ ] approve archived retorna 409.
[ ] approve registra approvedBy server-side.
[ ] approve registra approvedAt server-side.
[ ] approve no activa automáticamente.
[ ] approve audita tenantPolicyVersion.approved.

[ ] reject requiere tenantPolicies.reject.
[ ] reject reviewReady -> rejected.
[ ] reject requiere rejectionReason.
[ ] rejected no puede activarse.
[ ] reject audita tenantPolicyVersion.rejected.
```

---

## 22. API tests — Policy activation and rollback

```text id="tsp-test-api-policy-activation"
[ ] activate requiere tenantPolicies.activate.
[ ] activate sensitive requiere tenantPolicies.activateSensitive.
[ ] activate approved con effectiveFrom <= now marca active.
[ ] activate approved con effectiveFrom futuro marca scheduled.
[ ] activate crea TenantPolicyActivation.
[ ] activate ajusta effectiveUntil de versión anterior.
[ ] activate invalida cache.
[ ] activate audita tenantPolicyVersion.activated.
[ ] activate rejected retorna 409.
[ ] activate archived retorna 409.
[ ] activate cross-tenant retorna 404.
[ ] activate con effectiveFrom pasado requiere tenantPolicies.activateRetroactive.
[ ] activate con overlap retorna 409.

[ ] schedule requiere tenantPolicies.scheduleActivation.
[ ] schedule requiere effectiveFrom futuro.
[ ] schedule no cambia política efectiva actual.
[ ] schedule audita tenantPolicyVersion.scheduled.

[ ] rollback requiere tenantPolicies.rollback.
[ ] rollback target version debe ser tenant-scoped.
[ ] rollback crea activationType=rollback.
[ ] rollback no borra activaciones previas.
[ ] rollback invalida cache.
[ ] rollback audita tenantPolicyActivation.rollbackCreated.
```

---

## 23. API tests — Effective Policy

```text id="tsp-test-api-effective-policy"
[ ] GET /tenant/policies/{policyKey}/effective requiere tenantPolicyEffective.read.
[ ] Devuelve active override si existe.
[ ] Devuelve platform default si no existe override.
[ ] effectiveAt histórico devuelve versión histórica.
[ ] includeExceptions=true aplica exceptions vigentes.
[ ] includeExceptions=false no incluye appliedExceptionIds.
[ ] targetResourceType filtra exceptions.
[ ] targetResourceId filtra exceptions.
[ ] No devuelve drafts.
[ ] No devuelve archived.
[ ] No devuelve secrets.
[ ] Sensitive effective read audita tenantPolicyEffective.readSensitive si aplica.
```

---

## 24. API tests — Policy comparison

```text id="tsp-test-api-policy-compare"
[ ] GET compare requiere tenantPolicies.read.
[ ] Compara dos versions del mismo tenant.
[ ] Rechaza fromVersionId tenantB.
[ ] Rechaza toVersionId tenantB.
[ ] Diff identifica added.
[ ] Diff identifica updated.
[ ] Diff identifica removed.
[ ] Diff sanitiza secrets.
[ ] Diff sanitiza scripts.
[ ] Diff no devuelve raw payload sensible si policy sensible sin permiso.
```

---

## 25. API tests — Policy exceptions

```text id="tsp-test-api-exceptions"
[ ] GET /tenant/policy-exceptions requiere tenantPolicyExceptions.read.
[ ] Lista exceptions tenant-scoped.
[ ] No lista exceptions tenantB.

[ ] POST requiere tenantPolicyExceptions.create.
[ ] POST crea exception.
[ ] POST requiere policyKey.
[ ] POST requiere reason.
[ ] POST requiere validFrom.
[ ] POST requiere validUntil.
[ ] POST rechaza validUntil <= validFrom.
[ ] POST valida exceptionPayload.
[ ] POST valida targetResource tenant-scoped si aplica.
[ ] POST sensitive queda pendingApproval.
[ ] POST no sensitive puede quedar active si policy lo permite.
[ ] POST rechaza tenantId.
[ ] POST rechaza actor fields.
[ ] POST rechaza secret.
[ ] POST rechaza script.
[ ] POST audita tenantPolicyException.created.

[ ] approve requiere tenantPolicyExceptions.approve.
[ ] approve sensitive requiere tenantPolicyExceptions.approveSensitive.
[ ] approve pendingApproval -> approved/active según vigencia.
[ ] approve invalida cache.
[ ] approve audita tenantPolicyException.approved.

[ ] reject requiere tenantPolicyExceptions.reject.
[ ] reject requiere rejectionReason.
[ ] reject audita tenantPolicyException.rejected.

[ ] revoke requiere tenantPolicyExceptions.revoke.
[ ] revoke requiere revokeReason.
[ ] revoked no aplica en resolution.
[ ] revoke invalida cache.
[ ] revoke audita tenantPolicyException.revoked.

[ ] archive requiere tenantPolicyExceptions.archive.
[ ] archive no borra físicamente.
```

---

## 26. API tests — History

```text id="tsp-test-api-history"
[ ] GET /tenant/settings-history requiere tenantPolicyHistory.read.
[ ] settings-history filtra por tenant.
[ ] settings-history filtra por key.
[ ] settings-history filtra por actor.
[ ] settings-history filtra por date range.
[ ] settings-history no devuelve secretos.
[ ] settings-history no devuelve rawSql.
[ ] settings-history no devuelve scripts.

[ ] GET /tenant/policy-history requiere tenantPolicyHistory.read.
[ ] policy-history filtra por tenant.
[ ] policy-history filtra por policyKey.
[ ] policy-history filtra por ownerModule.
[ ] policy-history filtra por action.
[ ] policy-history no devuelve payload sensible no sanitizado.
```

---

## 27. API tests — Exports

```text id="tsp-test-api-exports"
[ ] GET /tenant/settings-policies/export requiere tenantSettings.export.
[ ] includeSensitive=true requiere tenantSettings.exportSensitive.
[ ] fullAdministrativeSnapshot requiere reason.
[ ] Export policies genera TenantSettingsExport.
[ ] Export settings genera SecureDocument.
[ ] Response devuelve secureDocumentId.
[ ] Response no devuelve storageKey.
[ ] Response no devuelve signedUrl persistente.
[ ] Export no contiene secrets.
[ ] Export no contiene tokens.
[ ] Export no contiene rawSql.
[ ] Export no contiene scripts.
[ ] Export no contiene executableCode.
[ ] Export failure marca status failed.
[ ] Export failureReason está sanitizado.
[ ] Export audita tenantSettings.exported.
```

---

## 28. API tests — `/me` policy summaries

```text id="tsp-test-api-me-summaries"
[ ] GET /me/tenant-policy-summaries requiere auth.
[ ] GET requiere TenantGuard.
[ ] GET requiere tenantPolicySummaries.own.read.
[ ] Devuelve solo residentVisible=true.
[ ] No devuelve settings securitySensitive.
[ ] No devuelve privacySensitive interna.
[ ] No devuelve financialSensitive interna.
[ ] No devuelve payload completo si no es publicable.
[ ] No permite modificar settings.
[ ] No permite modificar policies.
[ ] No permite exportar.
[ ] ResidentA no ve summaries tenantB.
[ ] Category inválida retorna 422.
[ ] Category sin contenido visible retorna lista vacía.
```

---

## 29. Security tests — Auth and permissions

```text id="tsp-test-security-auth"
[ ] Toda ruta tenant requiere Bearer token.
[ ] Toda ruta platform requiere Bearer token.
[ ] Usuario anónimo recibe 401.
[ ] Usuario autenticado sin permiso recibe 403.
[ ] TenantAdmin sin permiso sensible no modifica security setting.
[ ] TenantAdmin sin permiso sensible no aprueba policy sensible.
[ ] Resident no accede Tenant Admin API.
[ ] Resident no accede Platform API.
[ ] PlatformSupportReadOnly no modifica definitions.
[ ] PlatformAdmin no accede automáticamente a tenant data sin contexto y permiso.
```

---

## 30. Security tests — Forbidden fields

Todos los endpoints deben rechazar:

```text id="tsp-test-security-forbidden-fields"
[ ] tenantId.
[ ] createdBy.
[ ] updatedBy.
[ ] activatedBy.
[ ] approvedBy.
[ ] reviewedBy.
[ ] rejectedBy.
[ ] archivedBy.
[ ] requestedBy.
[ ] revokedBy.
[ ] cancelledBy.
[ ] actorUserProfileId.
[ ] status directo fuera de endpoint de transición.
[ ] versionNumber.
[ ] versionLabel.
[ ] storageKey.
[ ] signedUrl.
[ ] secret.
[ ] token.
[ ] password.
[ ] apiKey.
[ ] privateKey.
[ ] clientSecret.
[ ] webhookSecret.
[ ] databaseUrl.
[ ] rawSql.
[ ] script.
[ ] javascript.
[ ] functionBody.
[ ] executableCode.
[ ] cronCommand.
[ ] shellCommand.
[ ] paymentId.
[ ] paymentOrderId.
[ ] supplierPaymentOrderId.
[ ] journalEntryId.
[ ] bankTransactionId.
[ ] reconciliationMatchId.
[ ] gateOpenCommand.
[ ] hardwareDeviceCommand.
[ ] biometricTemplate.
[ ] faceEmbedding.
[ ] externalAiEnabled.
[ ] externalAiRealDataAllowed.
```

Respuesta esperada:

```http id="tsp-test-security-forbidden-response"
422 Unprocessable Entity
```

---

## 31. Security tests — Multitenancy

```text id="tsp-test-security-multitenancy"
[ ] tenantA no lee tenantSettingValue tenantB.
[ ] tenantA no actualiza tenantSettingValue tenantB.
[ ] tenantA no archiva tenantSettingValue tenantB.
[ ] tenantA no lee policyVersion tenantB.
[ ] tenantA no actualiza draft tenantB.
[ ] tenantA no aprueba policyVersion tenantB.
[ ] tenantA no activa policyVersion tenantB.
[ ] tenantA no hace rollback hacia version tenantB.
[ ] tenantA no lee activation tenantB.
[ ] tenantA no lee exception tenantB.
[ ] tenantA no aprueba exception tenantB.
[ ] tenantA no revoca exception tenantB.
[ ] tenantA no lee history tenantB.
[ ] tenantA no exporta settings/policies tenantB.
[ ] tenantA no resuelve effective policy tenantB.
[ ] tenantA no aplica exception tenantB.
```

Respuesta esperada para recursos cross-tenant:

```http id="tsp-test-cross-tenant-response"
404 Not Found
```

---

## 32. Security tests — No public and no WordPress

### 32.1. Public endpoints

```text id="tsp-test-security-no-public"
[ ] GET /api/v1/public/tenant-settings devuelve 404.
[ ] GET /api/v1/public/tenant-policies devuelve 404.
[ ] GET /api/v1/public/settings-policies devuelve 404.
[ ] GET /api/v1/public/tenants/{slug}/settings devuelve 404.
[ ] GET /api/v1/public/tenants/{slug}/policies devuelve 404.
[ ] POST /api/v1/public/tenants/{slug}/settings devuelve 404.
[ ] POST /api/v1/public/tenants/{slug}/policies devuelve 404.
```

---

### 32.2. WordPress access

```text id="tsp-test-security-no-wordpress"
[ ] CORS no permite WordPress público para /tenant/settings.
[ ] CORS no permite WordPress público para /tenant/policies.
[ ] CORS no permite WordPress público para /tenant/policy-exceptions.
[ ] CORS no permite WordPress público para /platform/setting-definitions.
[ ] CORS no usa wildcard.
[ ] WordPress público no consulta settings sensibles.
[ ] WordPress público no consulta policyPayload.
[ ] WordPress público no exporta configuración.
```

---

## 33. Security tests — No secrets, no executable payload

### 33.1. Secrets

```text id="tsp-test-security-no-secrets"
[ ] SettingDefinition rechaza secret.
[ ] SettingDefinition rechaza token.
[ ] SettingDefinition rechaza password.
[ ] SettingDefinition rechaza apiKey.
[ ] SettingDefinition rechaza privateKey.
[ ] SettingDefinition rechaza clientSecret.
[ ] SettingDefinition rechaza webhookSecret.
[ ] SettingDefinition rechaza databaseUrl.
[ ] TenantSettingValue rechaza secretos en value.
[ ] PolicyDefinition rechaza secretos en defaultPolicy.
[ ] TenantPolicyVersion rechaza secretos en policyPayload.
[ ] TenantPolicyException rechaza secretos en exceptionPayload.
[ ] ChangeLog sanitiza secretos.
[ ] Export excluye secretos.
```

---

### 33.2. Executable payload

```text id="tsp-test-security-no-executable"
[ ] Rechaza rawSql.
[ ] Rechaza script.
[ ] Rechaza javascript.
[ ] Rechaza functionBody.
[ ] Rechaza executableCode.
[ ] Rechaza cronCommand.
[ ] Rechaza shellCommand.
[ ] Rechaza dynamicExpressionUnsafe.
[ ] No existe executor de scripts.
[ ] No existe eval.
[ ] No existe Function constructor.
[ ] No existe SQL dinámico desde policyPayload.
```

---

### 33.3. External AI

```text id="tsp-test-security-no-ai"
[ ] TENANT_SETTINGS_EXTERNAL_AI_ENABLED=false.
[ ] Boot falla si TENANT_SETTINGS_EXTERNAL_AI_ENABLED=true en MVP.
[ ] Ningún endpoint acepta externalAiEnabled.
[ ] Ningún endpoint acepta externalAiRealDataAllowed.
[ ] Ningún servicio envía settings reales a IA externa.
[ ] Ningún servicio envía policyPayload real a IA externa.
[ ] Ningún servicio envía exports reales a IA externa.
[ ] Ningún servicio envía history real a IA externa.
```

---

## 34. Boundary tests — No transaction side effects

```text id="tsp-test-boundary-no-side-effects"
[ ] Update setting no crea Charge.
[ ] Update setting no crea Payment.
[ ] Update setting no crea SupplierPaymentOrder.
[ ] Update setting no crea JournalEntry.
[ ] Update setting no confirma Bank Reconciliation.
[ ] Activate policy no crea Charge.
[ ] Activate policy no crea Payment.
[ ] Activate policy no crea SupplierPaymentOrder.
[ ] Activate policy no crea JournalEntry.
[ ] Activate policy no modifica AccessEvent.
[ ] Activate policy no modifica WorkOrder.
[ ] Activate policy no modifica Stock.
[ ] Create exception no crea datos transaccionales.
[ ] Export no modifica módulos consumidores.
```

---

## 35. Audit tests

### 35.1. Eventos mínimos

```text id="tsp-test-audit-events"
[ ] tenantSetting.created.
[ ] tenantSetting.updated.
[ ] tenantSetting.scheduled.
[ ] tenantSetting.activated.
[ ] tenantSetting.expired.
[ ] tenantSetting.archived.
[ ] tenantPolicyDefinition.created.
[ ] tenantPolicyDefinition.updated.
[ ] tenantPolicyDefinition.archived.
[ ] tenantPolicyVersion.created.
[ ] tenantPolicyVersion.updated.
[ ] tenantPolicyVersion.submittedForReview.
[ ] tenantPolicyVersion.approved.
[ ] tenantPolicyVersion.rejected.
[ ] tenantPolicyVersion.scheduled.
[ ] tenantPolicyVersion.activated.
[ ] tenantPolicyVersion.superseded.
[ ] tenantPolicyVersion.expired.
[ ] tenantPolicyVersion.archived.
[ ] tenantPolicyActivation.created.
[ ] tenantPolicyActivation.rollbackCreated.
[ ] tenantPolicyException.created.
[ ] tenantPolicyException.approved.
[ ] tenantPolicyException.rejected.
[ ] tenantPolicyException.activated.
[ ] tenantPolicyException.expired.
[ ] tenantPolicyException.revoked.
[ ] tenantPolicyException.archived.
[ ] tenantSettings.exported.
[ ] tenantPolicyEffective.readSensitive.
```

---

### 35.2. Audit metadata

```text id="tsp-test-audit-metadata"
[ ] Audit incluye tenantId cuando aplica.
[ ] Audit incluye actorUserProfileId.
[ ] Audit incluye action.
[ ] Audit incluye resourceType.
[ ] Audit incluye resourceId.
[ ] Audit incluye outcome.
[ ] Audit incluye traceId.
[ ] Audit incluye settingKey o policyKey si aplica.
[ ] Audit no incluye secret.
[ ] Audit no incluye token.
[ ] Audit no incluye password.
[ ] Audit no incluye apiKey.
[ ] Audit no incluye privateKey.
[ ] Audit no incluye clientSecret.
[ ] Audit no incluye storageKey.
[ ] Audit no incluye rawSql.
[ ] Audit no incluye script.
[ ] Audit no incluye raw payload sensible.
```

---

## 36. Observability tests

### 36.1. Logs

```text id="tsp-test-observability-logs"
[ ] tenantSetting.updated loggea action.
[ ] tenantPolicyVersion.created loggea policyKey.
[ ] tenantPolicyVersion.approved loggea outcome.
[ ] tenantPolicyVersion.activated loggea durationMs.
[ ] tenantPolicyException.created loggea category.
[ ] tenantSettings.exported loggea exportType.
[ ] effectivePolicy.cacheHit loggea source.
[ ] effectivePolicy.cacheMiss loggea source.
[ ] Logs no contienen secrets.
[ ] Logs no contienen tokens.
[ ] Logs no contienen storageKey.
[ ] Logs no contienen raw policy payload sensible.
[ ] Logs no contienen raw request body.
[ ] Logs no contienen authorization header.
```

---

### 36.2. Metrics

```text id="tsp-test-observability-metrics"
[ ] tenant_settings_updates_total incrementa.
[ ] tenant_policy_versions_created_total incrementa.
[ ] tenant_policy_activations_total incrementa.
[ ] tenant_policy_exceptions_total incrementa.
[ ] tenant_settings_exports_total incrementa.
[ ] tenant_policy_cache_hits_total incrementa.
[ ] tenant_policy_cache_misses_total incrementa.
[ ] tenant_policy_cache_invalidations_total incrementa.
[ ] Metrics usan labels permitidos.
[ ] Metrics no usan tenantId.
[ ] Metrics no usan userId.
[ ] Metrics no usan policyVersionId.
[ ] Metrics no usan traceId.
[ ] Metrics no usan secretKey.
```

---

## 37. OpenAPI contract tests

```text id="tsp-test-openapi"
[ ] OpenAPI documenta Tenant Settings.
[ ] OpenAPI documenta Tenant Policies.
[ ] OpenAPI documenta Tenant Policy Exceptions.
[ ] OpenAPI documenta Tenant Settings History.
[ ] OpenAPI documenta Tenant Settings Exports.
[ ] OpenAPI documenta Me Tenant Policy Summaries.
[ ] OpenAPI documenta Platform Setting Definitions.
[ ] OpenAPI documenta Platform Policy Definitions.
[ ] OpenAPI no documenta /api/v1/public/tenant-settings.
[ ] OpenAPI no documenta /api/v1/public/tenant-policies.
[ ] OpenAPI incluye x-auth-required=true.
[ ] OpenAPI incluye x-tenant-settings-policies=true.
[ ] Rutas tenant incluyen x-tenant-scope=true.
[ ] Rutas platform incluyen x-platform-scope=true.
[ ] Rutas /me incluyen x-resident-visible-summary-only=true.
[ ] Rutas export incluyen x-secure-document-storage=true.
[ ] Rutas export incluyen x-storage-key-exposed=false.
[ ] OpenAPI incluye x-public-exposure=false.
[ ] OpenAPI incluye x-wordpress-access=false.
[ ] OpenAPI incluye x-secrets-storage=false.
[ ] OpenAPI incluye x-executable-policy-payload=false.
[ ] OpenAPI incluye x-transactional-side-effects=false.
[ ] OpenAPI incluye x-external-ai-real-data=false.
[ ] OpenAPI no documenta tenantId en DTOs externos.
[ ] OpenAPI no documenta actor fields.
[ ] OpenAPI no documenta versionNumber desde cliente.
[ ] OpenAPI no documenta storageKey.
[ ] OpenAPI no documenta secrets.
[ ] OpenAPI no documenta rawSql.
[ ] OpenAPI no documenta scripts.
[ ] OpenAPI no documenta executableCode.
[ ] OpenAPI no documenta externalAiEnabled.
```

---

## 38. Performance tests

### 38.1. Dataset mínimo

```text id="tsp-test-performance-dataset"
Global:
- 100 setting definitions.
- 100 policy definitions.

tenantA:
- 50 setting values.
- 30 active policies.
- 100 policy versions históricas.
- 50 activations.
- 100 policy exceptions.
- 1,000 change logs.
- 100 exports.

tenantB:
- dataset parcial para aislamiento.
```

---

### 38.2. Objetivos

```text id="tsp-test-performance-objectives"
[ ] resolveEffectiveSetting p95 < 100 ms con cache.
[ ] resolveEffectivePolicy p95 < 150 ms con cache.
[ ] resolveEffectiveSetting p95 < 500 ms sin cache.
[ ] resolveEffectivePolicy p95 < 700 ms sin cache.
[ ] list settings p95 < 800 ms.
[ ] list policies p95 < 800 ms.
[ ] list policy versions p95 < 800 ms.
[ ] compare policy versions p95 < 1000 ms.
[ ] list history p95 < 1200 ms.
[ ] export pequeño p95 < 3000 ms.
[ ] pageSize máximo 100.
[ ] No existe N+1 evidente.
```

---

## 39. Concurrency tests

```text id="tsp-test-concurrency"
[ ] Dos usuarios crean versionNumber para misma policy simultáneamente: no duplica.
[ ] Dos usuarios activan versiones distintas de la misma policy: solo una queda efectiva para same effectiveAt.
[ ] Dos usuarios aprueban y rechazan la misma version simultáneamente: solo una transición válida.
[ ] Un usuario archiva mientras otro activa: consistencia por status.
[ ] Update setting y effective read simultáneos no devuelven datos parciales.
[ ] Activate policy e effective read simultáneos respetan commit boundary.
[ ] Approve exception y effective resolve simultáneos no aplican exception antes de commit.
[ ] Revoke exception y effective resolve simultáneos respetan status final.
[ ] Cache invalidation ocurre después del commit exitoso.
[ ] Falla post-commit de cache no revierte activación válida.
```

---

## 40. Regression tests

```text id="tsp-test-regression"
[ ] Cambio en 001-tenants no rompe tenant validation.
[ ] Cambio en 002-users-roles no rompe permissions.
[ ] Cambio en 007-audit no filtra secrets.
[ ] Cambio en 016-secure-document-storage no expone storageKey.
[ ] Cambio en 024-access-control-visitors no rompe visitorAccessPolicy.
[ ] Cambio en 023-inventory-basic no rompe inventory.stockPolicy.
[ ] Cambio en DTO validation no permite tenantId.
[ ] Cambio en OpenAPI no documenta public endpoints.
[ ] Cambio en CORS no permite WordPress público.
[ ] Cambio en cache no mezcla tenants.
```

---

## 41. Smoke flows

### 41.1. Smoke flow — definitions iniciales

```text id="tsp-smoke-definitions"
[ ] PlatformAdmin consulta settingDefinition general.locale.
[ ] PlatformAdmin crea policyDefinition accessControl.visitorAccessPolicy.
[ ] Sistema valida schema.
[ ] Sistema rechaza secrets.
[ ] Sistema audita definitions.
```

---

### 41.2. Smoke flow — actualizar setting

```text id="tsp-smoke-update-setting"
[ ] TenantAdminA inicia sesión.
[ ] TenantAdminA consulta settings efectivos.
[ ] Sistema devuelve platform default general.locale.
[ ] TenantAdminA actualiza accessControl.defaultAccessPassTtlMinutes.
[ ] Sistema valida valueType integer.
[ ] Sistema crea tenant override.
[ ] Sistema invalida cache.
[ ] Sistema audita tenantSetting.updated.
[ ] ResolveEffectiveSetting devuelve nuevo valor.
```

---

### 41.3. Smoke flow — crear y activar policy version

```text id="tsp-smoke-policy-version"
[ ] TenantAdminA crea policy version draft.
[ ] Sistema genera versionNumber.
[ ] Sistema valida policyPayload.
[ ] TenantAdminA envía a review.
[ ] BoardMemberA aprueba policy.
[ ] TenantAdminA activa policy con effectiveFrom futuro.
[ ] Sistema crea activation scheduled.
[ ] Antes de effectiveFrom, effective policy sigue usando versión anterior.
[ ] Al llegar effectiveFrom, job activa versión.
[ ] EffectivePolicy devuelve nueva versión.
[ ] Sistema audita eventos críticos.
```

---

### 41.4. Smoke flow — excepción

```text id="tsp-smoke-exception"
[ ] SecurityManagerA crea excepción unitOverride.
[ ] Sistema valida targetResource tenant-scoped.
[ ] Sistema deja pendingApproval si sensible.
[ ] BoardMemberA aprueba excepción.
[ ] ResolveEffectivePolicy con targetResource aplica excepción.
[ ] ResolveEffectivePolicy sin targetResource no aplica excepción.
[ ] SecurityManagerA revoca excepción.
[ ] ResolveEffectivePolicy ya no aplica excepción.
```

---

### 41.5. Smoke flow — exportación

```text id="tsp-smoke-export"
[ ] TenantAdminA solicita export policies.
[ ] Sistema valida permiso.
[ ] Sistema sanitiza filtros.
[ ] Sistema crea TenantSettingsExport.
[ ] Sistema genera SecureDocument.
[ ] Response devuelve secureDocumentId.
[ ] Response no devuelve storageKey.
[ ] Sistema audita tenantSettings.exported.
```

---

### 41.6. Smoke flow — `/me` summaries

```text id="tsp-smoke-me"
[ ] ResidentA1 inicia sesión.
[ ] ResidentA1 consulta /me/tenant-policy-summaries.
[ ] Sistema devuelve solo residentVisible.
[ ] Sistema no devuelve settings sensibles.
[ ] Sistema no devuelve policyPayload interno.
[ ] ResidentA1 no puede modificar policies.
```

---

## 42. CI gates

El pipeline debe ejecutar:

```text id="tsp-test-ci-gates"
[ ] unit tests.
[ ] schema validator tests.
[ ] sanitizer tests.
[ ] entity tests.
[ ] state machine tests.
[ ] domain policy tests.
[ ] repository tests.
[ ] integration tests.
[ ] Platform API tests.
[ ] Tenant Admin API tests.
[ ] /me API tests.
[ ] internal resolver tests.
[ ] authz tests.
[ ] sensitive permission tests.
[ ] multitenancy tests.
[ ] no secrets tests.
[ ] no executable payload tests.
[ ] no raw SQL tests.
[ ] no public tests.
[ ] no WordPress tests.
[ ] no storageKey tests.
[ ] no transaction side effects tests.
[ ] no external AI tests.
[ ] audit tests.
[ ] observability tests.
[ ] OpenAPI contract tests.
[ ] smoke tests.
```

---

## 43. CI security gates

El pipeline debe fallar si:

```text id="tsp-test-ci-security-gates"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta versionNumber desde cliente.
[ ] Algún DTO acepta status directo fuera de transición.
[ ] Algún DTO acepta storageKey.
[ ] Algún DTO acepta secret.
[ ] Algún DTO acepta token.
[ ] Algún DTO acepta password.
[ ] Algún DTO acepta apiKey.
[ ] Algún DTO acepta privateKey.
[ ] Algún DTO acepta clientSecret.
[ ] Algún DTO acepta rawSql.
[ ] Algún DTO acepta script.
[ ] Algún DTO acepta functionBody.
[ ] Algún DTO acepta executableCode.
[ ] Algún DTO acepta externalAiEnabled.
[ ] Algún DTO acepta externalAiRealDataAllowed.
[ ] API permite settings cross-tenant.
[ ] API permite policies cross-tenant.
[ ] API permite activations cross-tenant.
[ ] API permite exceptions cross-tenant.
[ ] API permite exports cross-tenant.
[ ] API permite public endpoints.
[ ] API permite WordPress público.
[ ] API expone settings sensibles en /me.
[ ] API expone storageKey.
[ ] API expone signedUrl persistente.
[ ] Logs contienen secrets.
[ ] Audit contiene secrets.
[ ] Export contiene secrets.
[ ] PolicyPayload permite rawSql.
[ ] PolicyPayload permite script.
[ ] PolicyPayload permite executableCode.
[ ] API crea Payment.
[ ] API crea SupplierPaymentOrder.
[ ] API crea JournalEntry.
[ ] API confirma Bank Reconciliation.
[ ] API modifica datos transaccionales de otros módulos.
[ ] API llama IA externa con datos reales.
```

---

## 44. Cobertura mínima

```text id="tsp-test-coverage"
- Value objects: >= 95%.
- Schema validators: >= 95%.
- Sanitizers: >= 95%.
- Entities: >= 90%.
- State machines: >= 95%.
- Domain policies: >= 95%.
- Effective resolution services: >= 95%.
- Cache services: >= 90%.
- Application services: >= 90%.
- Repository integration: >= 85%.
- API controllers: >= 85%.
- Security tests críticos: 100% passing.
- Multitenancy tests críticos: 100% passing.
- No secrets tests críticos: 100% passing.
- No executable payload tests críticos: 100% passing.
- OpenAPI contract tests críticos: 100% passing.
```

---

## 45. Matriz de trazabilidad

| Área                        | Spec | Plan | Data Model | API Contract | Tests                    |
| --------------------------- | ---- | ---- | ---------- | ------------ | ------------------------ |
| SettingDefinition           | Sí   | Sí   | Sí         | Sí           | Unit / API / Security    |
| TenantSettingValue          | Sí   | Sí   | Sí         | Sí           | Unit / API / MT          |
| PolicyDefinition            | Sí   | Sí   | Sí         | Sí           | Unit / API / Security    |
| TenantPolicyVersion         | Sí   | Sí   | Sí         | Sí           | Unit / API / Versioning  |
| TenantPolicyActivation      | Sí   | Sí   | Sí         | Sí           | Unit / API / Concurrency |
| TenantPolicyException       | Sí   | Sí   | Sí         | Sí           | Unit / API / Effective   |
| Effective Setting           | Sí   | Sí   | Sí         | Sí           | Integration / Cache      |
| Effective Policy            | Sí   | Sí   | Sí         | Sí           | Integration / Cache      |
| Change Log                  | Sí   | Sí   | Sí         | Sí           | Integration / Security   |
| Export vía SDS              | Sí   | Sí   | Sí         | Sí           | API / SDS / Security     |
| Platform API                | Sí   | Sí   | Sí         | Sí           | API / Authz              |
| Tenant Admin API            | Sí   | Sí   | Sí         | Sí           | API / MT                 |
| `/me` summaries             | Sí   | Sí   | Sí         | Sí           | API / Privacy            |
| No secrets                  | Sí   | Sí   | Sí         | Sí           | Security                 |
| No executable payload       | Sí   | Sí   | Sí         | Sí           | Security                 |
| No public                   | Sí   | Sí   | Sí         | Sí           | Security                 |
| No WordPress                | Sí   | Sí   | Sí         | Sí           | Security                 |
| No transaction side effects | Sí   | Sí   | Sí         | Sí           | Boundary                 |
| No external AI              | Sí   | Sí   | Sí         | Sí           | Security                 |

---

## 46. Definition of Done de pruebas

```text id="tsp-test-dod"
[ ] Tests unitarios implementados.
[ ] Tests de value objects implementados.
[ ] Tests de schema validators implementados.
[ ] Tests de sanitizers implementados.
[ ] Tests de entities implementados.
[ ] Tests de state machines implementados.
[ ] Tests de domain policies implementados.
[ ] Tests de repositories implementados.
[ ] Tests de effective resolution implementados.
[ ] Tests de cache implementados.
[ ] Tests de cache invalidation implementados.
[ ] Tests Platform API implementados.
[ ] Tests Tenant Admin API implementados.
[ ] Tests /me API implementados.
[ ] Tests internal resolver implementados.
[ ] Tests authz implementados.
[ ] Tests sensitive permissions implementados.
[ ] Tests multitenancy implementados.
[ ] Tests forbidden fields implementados.
[ ] Tests no secrets implementados.
[ ] Tests no executable payload implementados.
[ ] Tests no raw SQL implementados.
[ ] Tests no public implementados.
[ ] Tests no WordPress implementados.
[ ] Tests no storageKey implementados.
[ ] Tests no transaction side effects implementados.
[ ] Tests no external AI implementados.
[ ] Tests audit implementados.
[ ] Tests observability implementados.
[ ] Tests OpenAPI implementados.
[ ] Tests performance básicos implementados.
[ ] Tests concurrency críticos implementados.
[ ] Smoke flows implementados.
[ ] CI gates implementados.
[ ] CI completo pasa.
```

---

## 47. No aceptación del test plan

No se acepta el módulo si las pruebas permiten:

```text id="tsp-test-no-acceptance"
- settings cross-tenant;
- policies cross-tenant;
- versions cross-tenant;
- activations cross-tenant;
- exceptions cross-tenant;
- history cross-tenant;
- exports cross-tenant;
- tenantId desde cliente;
- actor fields desde cliente;
- versionNumber desde cliente;
- status directo fuera de transición;
- secrets en settings;
- secrets en policies;
- secrets en exports;
- tokens en payload;
- passwords en payload;
- apiKeys en payload;
- clientSecrets en payload;
- privateKeys en payload;
- storageKey en request;
- storageKey en response;
- signedUrl persistente;
- rawSql;
- script;
- JavaScript configurable;
- functionBody;
- executableCode;
- shellCommand;
- cronCommand;
- public endpoints;
- WordPress public access;
- settings sensibles en /me;
- policyPayload sensible completo en /me;
- active policy editada destructivamente;
- activaciones superpuestas sin control;
- excepción sin vigencia;
- exception revoked aplicada;
- exception expired aplicada;
- cache mezclando tenants;
- export sin SDS;
- audit crítica ausente;
- logs con secretos;
- audit con secretos;
- Payment creado desde este módulo;
- SupplierPaymentOrder creado desde este módulo;
- JournalEntry creado desde este módulo;
- Bank Reconciliation confirmada desde este módulo;
- datos transaccionales modificados desde este módulo;
- IA externa con datos reales.
```

---

## 48. Resultado esperado

Al completar este plan de pruebas, el módulo `025-tenant-settings-policies` tendrá cobertura suficiente para validar configuración efectiva, políticas versionadas, activaciones, excepciones, historial, exportaciones, seguridad, multitenancy, auditoría, observabilidad, cache y límites de dominio.

Resultado esperado:

```text id="tsp-test-expected-result"
unit tests definidos
schema validator tests definidos
sanitizer tests definidos
entity tests definidos
state machine tests definidos
domain policy tests definidos
repository tests definidos
effective setting tests definidos
effective policy tests definidos
cache tests definidos
cache invalidation tests definidos
Platform API tests definidos
Tenant Admin API tests definidos
/me API tests definidos
internal resolver tests definidos
authz tests definidos
sensitive permission tests definidos
multitenancy tests definidos
forbidden fields tests definidos
no secrets tests definidos
no executable payload tests definidos
no raw SQL tests definidos
no public tests definidos
no WordPress tests definidos
no storageKey tests definidos
no transaction side effects tests definidos
no external AI tests definidos
audit tests definidos
observability tests definidos
OpenAPI contract tests definidos
performance tests definidos
concurrency tests definidos
smoke flows definidos
CI gates definidos
tenant isolation verificado
schema validation verificada
versioning verificado
effective dating verificado
policy exceptions verificadas
SDS export verificado
no public endpoints verificado
no WordPress access verificado
no secrets verificado
no executable payload verificado
no transaction side effects verificado
no external AI with real data verificado
```

---

## 49. Expediente actualizado

```text id="tsp-test-expediente"
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
│   │       └── test-plan.md
```
