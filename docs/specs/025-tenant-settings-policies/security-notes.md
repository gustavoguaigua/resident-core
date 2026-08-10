# Security Notes — 025 Tenant Settings and Policies

## 1. Información del documento

| Campo           | Valor                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                 |
| Spec ID         | 025                                                                                           |
| Módulo          | Tenant Settings and Policies                                                                  |
| Documento       | Security Notes                                                                                |
| Ruta            | `docs/specs/025-tenant-settings-policies/security-notes.md`                                   |
| Versión         | 0.1                                                                                           |
| Estado          | needs-review                                                                                  |
| Fecha           | 2026-07-31                                                                                    |
| Documento base  | `docs/specs/025-tenant-settings-policies/spec.md`                                             |
| Plan técnico    | `docs/specs/025-tenant-settings-policies/plan.md`                                             |
| Modelo de datos | `docs/specs/025-tenant-settings-policies/data-model.md`                                       |
| Contrato API    | `docs/specs/025-tenant-settings-policies/api-contract.md`                                     |
| Plan de pruebas | `docs/specs/025-tenant-settings-policies/test-plan.md`                                        |
| Backlog técnico | `docs/specs/025-tenant-settings-policies/tasks.md`                                            |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                |
| Naturaleza      | Tenant-scoped / Configuration-governed / Policy-driven / Versioned / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `025-tenant-settings-policies`.

El módulo centraliza configuraciones, políticas, reglas operativas, versiones, activaciones, excepciones, historial, summaries visibles y exportaciones administrativas de cada tenant. Por su naturaleza transversal, un error en este módulo puede afectar múltiples áreas de RESIDENT Core: finanzas, pagos, reservas, multas, reuniones, documentos, visitantes, mantenimiento, inventario, proveedores, privacidad, reportes y seguridad.

Regla central de seguridad:

```text id="tsp-sec-rule"
Toda configuración, policy definition, setting value, policy version, activación, excepción, historial, summary, lectura efectiva, cache, exportación, log y evento de auditoría de Tenant Settings and Policies debe proteger tenant isolation, autorización explícita, validación estricta de schema, versionamiento, vigencia temporal, no retroactividad silenciosa, sanitización de payloads, ausencia de secretos, ausencia de scripts, ausencia de raw SQL, ausencia de código ejecutable, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de storageKey expuesto, ausencia de configuración sensible en /me, ausencia de efectos transaccionales directos, ausencia de pagos, ausencia de asientos contables, ausencia de conciliaciones bancarias, ausencia de modificación de módulos consumidores y ausencia de IA externa con datos reales.
```

---

## 3. Clasificación de seguridad

### 3.1. Clasificación del módulo

```text id="tsp-sec-classification"
Security-sensitive
Privacy-sensitive
Configuration-sensitive
Tenant-scoped
Policy-driven
Versioned
Audit-heavy
Non-public
Cross-cutting
No secrets storage
No executable policies
No transaction executor
Not WordPress-accessible
```

---

### 3.2. Nivel de sensibilidad por componente

| Componente              | Sensibilidad | Justificación                                                     |
| ----------------------- | -----------: | ----------------------------------------------------------------- |
| SettingDefinition       |   Media/Alta | Define qué puede configurar la plataforma                         |
| TenantSettingValue      |         Alta | Puede alterar reglas operativas del tenant                        |
| PolicyDefinition        |         Alta | Define estructura de políticas consumidas por módulos             |
| TenantPolicyVersion     |         Alta | Puede cambiar comportamiento financiero, operativo o de seguridad |
| TenantPolicyActivation  |         Alta | Determina qué política entra en vigencia                          |
| TenantPolicyException   |         Alta | Puede saltarse una política bajo condiciones específicas          |
| TenantSettingsChangeLog |         Alta | Contiene historial de cambios funcionales                         |
| TenantSettingsExport    |         Alta | Puede consolidar configuración sensible                           |
| EffectivePolicyResolver |      Crítica | Fuente de verdad runtime para módulos consumidores                |
| Cache de políticas      |         Alta | Puede aplicar reglas obsoletas o cross-tenant si falla            |

---

## 4. Principios de seguridad

```text id="tsp-sec-principles"
1. Keycloak autentica; RESIDENT Core autoriza.
2. Tenant isolation es obligatorio.
3. Platform definitions no contienen datos reales de tenants.
4. Tenant values y tenant policy versions siempre son tenant-scoped.
5. Los settings no almacenan secretos.
6. Las policies no almacenan secretos.
7. Los payloads configurables no son ejecutables.
8. No se permite JavaScript configurable por tenant.
9. No se permite raw SQL configurable por tenant.
10. No se permite código dinámico, shell commands ni cron commands desde payload.
11. No existen endpoints públicos.
12. WordPress público no accede a settings ni policies.
13. /me solo expone summaries explícitamente residentVisible.
14. Cambios críticos requieren reason.
15. Políticas críticas se versionan.
16. Políticas activas no se editan destructivamente.
17. Activaciones se auditan.
18. Excepciones tienen vigencia.
19. No existe retroactividad silenciosa.
20. Cache debe ser tenant-scoped e invalidable.
21. Exportaciones usan Secure Document Storage.
22. No se expone storageKey.
23. No se crean pagos desde este módulo.
24. No se crean asientos contables desde este módulo.
25. No se confirma conciliación bancaria desde este módulo.
26. No se modifican datos transaccionales de módulos consumidores.
27. No se envían datos reales a IA externa.
```

---

## 5. Modelo de amenazas

### 5.1. Activos protegidos

```text id="tsp-assets"
- Configuración operativa del tenant.
- Policies financieras.
- Policies de pagos.
- Policies de reservas.
- Policies de multas.
- Policies de reuniones y votación.
- Policies de comunicaciones.
- Policies documentales.
- Policies de visitantes y control de acceso.
- Policies de mantenimiento.
- Policies de inventario.
- Policies de proveedores.
- Policies de privacidad.
- Policies de seguridad.
- Versiones históricas.
- Activaciones actuales y futuras.
- Excepciones activas.
- Summaries visibles para residentes.
- Historial de cambios.
- Exportaciones administrativas.
- Cache de settings/policies efectivos.
- Metadata de auditoría.
```

---

### 5.2. Actores potencialmente maliciosos

```text id="tsp-threat-actors"
- Usuario anónimo.
- Residente intentando acceder a settings internos.
- TenantAdmin intentando modificar configuración sensible sin permiso.
- Usuario de otro tenant intentando leer políticas.
- PlatformAdmin excediendo alcance de soporte.
- Actor intentando inyectar tenantId.
- Actor intentando inyectar actor fields.
- Actor intentando manipular versionNumber.
- Actor intentando cambiar status directamente.
- Actor intentando almacenar secrets como settings.
- Actor intentando introducir scripts o raw SQL.
- Actor intentando usar policyPayload como motor ejecutable.
- Actor intentando habilitar endpoints públicos.
- Actor intentando usar WordPress como canal de acceso.
- Actor intentando exportar configuración sensible.
- Actor intentando aplicar una excepción sin vigencia.
- Actor intentando activar una política retroactiva.
- Actor intentando forzar cache cross-tenant.
- Actor intentando habilitar IA externa con datos reales.
```

---

### 5.3. Amenazas principales

| Amenaza                                  |  Riesgo | Control                                           |
| ---------------------------------------- | ------: | ------------------------------------------------- |
| Settings cross-tenant                    | Crítico | TenantGuard, tenant_id, tests 404                 |
| Policies cross-tenant                    | Crítico | tenant_id obligatorio, repositorios tenant-scoped |
| Configuración sensible expuesta en `/me` |    Alto | residentVisible allowlist                         |
| Secrets almacenados como settings        | Crítico | denylist, validators, CI gates                    |
| Scripts en policyPayload                 | Crítico | NoExecutablePolicyPayloadPolicy                   |
| Raw SQL configurable                     | Crítico | validator recursivo y tests                       |
| Activación retroactiva no autorizada     |    Alto | permiso reforzado, reason, audit                  |
| Cache mezclando tenants                  | Crítico | cache key tenant-scoped, tests                    |
| Policy activa editada destructivamente   |    Alto | state machine, immutability                       |
| Excepción sin vigencia                   |    Alto | validFrom/validUntil obligatorios                 |
| Endpoint público accidental              | Crítico | no public routes, OpenAPI tests                   |
| Acceso desde WordPress público           | Crítico | CORS restrictivo, no public API                   |
| Exportación con secrets                  | Crítico | export sanitizer, SDS, tests                      |
| storageKey expuesto                      |    Alto | SDS boundary, DTO/response denylist               |
| Módulo creando pagos o asientos          | Crítico | boundary tests, no adapters                       |
| IA externa con datos reales              |    Alto | feature flag false, no adapters, CI gate          |

---

## 6. Superficies de ataque

### 6.1. Platform API

```text id="tsp-attack-platform-api"
/api/v1/platform/setting-definitions
/api/v1/platform/policy-definitions
```

Riesgos:

```text id="tsp-platform-risks"
- PlatformAdmin crea definitions inseguras.
- PlatformAdmin crea schema permisivo.
- Definition permite secrets.
- Definition permite payload ejecutable.
- DefaultPolicy insegura.
- residentVisible=true en configuración sensible.
```

Controles:

```text id="tsp-platform-controls"
- AuthGuard.
- PlatformPermissionGuard.
- Validación de schema.
- ForbiddenKeysValidator.
- NoExecutablePolicyPayloadPolicy.
- NoSecretsInSettingsPolicy.
- Auditoría obligatoria.
- Review de definitions críticas.
```

---

### 6.2. Tenant Admin API

```text id="tsp-attack-tenant-api"
/api/v1/tenant/settings
/api/v1/tenant/policies
/api/v1/tenant/policy-exceptions
/api/v1/tenant/settings-history
/api/v1/tenant/policy-history
/api/v1/tenant/settings-policies/export
```

Riesgos:

```text id="tsp-tenant-risks"
- Cambio no autorizado de settings.
- Activación de política sensible sin aprobación.
- Excepción operativa abusiva.
- Exportación sensible.
- Consulta cross-tenant.
- Inyección de tenantId, status, actor o versionNumber.
```

Controles:

```text id="tsp-tenant-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- SensitivePermissionGuard.
- DTO whitelist.
- forbidNonWhitelisted.
- Repositories tenant-scoped.
- Schema validation.
- Change reason obligatorio.
- Audit obligatorio.
- Rate limit en cambios críticos.
```

---

### 6.3. `/me` API

```text id="tsp-attack-me-api"
/api/v1/me/tenant-policy-summaries
```

Riesgos:

```text id="tsp-me-risks"
- Residente ve settings internos.
- Residente ve políticas de seguridad.
- Residente ve políticas financieras internas.
- Residente accede a payload completo sensible.
- Residente infiere configuración operativa crítica.
```

Controles:

```text id="tsp-me-controls"
- AuthGuard.
- TenantGuard.
- OwnPolicySummaryGuard.
- residentVisible allowlist.
- Summary DTO separado.
- No full policyPayload.
- No securitySensitive.
- No privacySensitive interna.
- No financialSensitive interna.
- No export desde /me.
- No modificación desde /me.
```

---

### 6.4. Internal resolver

```text id="tsp-attack-internal-resolver"
resolveEffectiveSetting
resolveEffectivePolicy
resolvePolicyException
```

Riesgos:

```text id="tsp-internal-risks"
- Módulo consumidor solicita policy de otro tenant.
- Resolver devuelve política obsoleta.
- Cache mezcla tenants.
- Resolver aplica excepción revocada o expirada.
- Resolver devuelve datos sensibles no requeridos.
```

Controles:

```text id="tsp-internal-controls"
- InternalPolicyConsumerGuard o boundary interno.
- tenantId obligatorio.
- effectiveAt controlado.
- cache key tenant-scoped.
- invalidación post-commit.
- filtro de status.
- no drafts.
- no archived.
- no revoked/expired exceptions.
```

---

## 7. Autenticación

Todos los endpoints permitidos requieren:

```http id="tsp-auth-header"
Authorization: Bearer <access_token>
```

Reglas:

```text id="tsp-auth-rules"
- Keycloak valida identidad.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve currentTenant.
- RESIDENT Core autoriza por permiso, sensibilidad y superficie API.
```

Prohibido:

```text id="tsp-auth-forbidden"
- Acceso anónimo.
- API keys públicas.
- Tokens en query string.
- Sesión WordPress como autenticación Core.
- userId enviado por cliente como actor.
- tenantId enviado por cliente como autoridad.
- PlatformAdmin sin contexto ni permiso para tenant data.
```

No aceptación:

```text id="tsp-auth-no-acceptance"
No se acepta ningún endpoint de Tenant Settings and Policies que opere sin autenticación explícita.
```

---

## 8. Autorización

### 8.1. Capas obligatorias

```text id="tsp-authz-layers"
1. AuthGuard.
2. TenantGuard para rutas tenant.
3. PermissionGuard.
4. SensitivePermissionGuard cuando aplique.
5. PlatformPermissionGuard para definitions.
6. OwnPolicySummaryGuard para /me.
7. InternalPolicyConsumerGuard para consumo interno.
8. Domain policy.
9. DTO denylist.
10. Response sanitizer.
```

---

### 8.2. Matriz de acceso resumida

| Actor            | Platform API |          Tenant Admin API | Sensitive changes | `/me` summaries |       Exports |
| ---------------- | -----------: | ------------------------: | ----------------: | --------------: | ------------: |
| PlatformAdmin    |           Sí |               Excepcional |       Excepcional |              No |   Excepcional |
| TenantAdmin      |           No |                        Sí | Solo con permisos |    No principal |            Sí |
| BoardMember      |           No |       Revisión/aprobación |       Si asignado |    No principal | Según permiso |
| FinancialManager |           No |      Policies financieras |       Si asignado |              No | Según permiso |
| SecurityManager  |           No | Policies seguridad/acceso |       Si asignado |              No | Según permiso |
| Resident         |           No |                        No |                No |    Sí, limitado |            No |
| Anonymous        |           No |                        No |                No |              No |            No |

---

### 8.3. Permisos sensibles

```text id="tsp-sensitive-permissions"
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

```text id="tsp-sensitive-rule"
Todo cambio en configuración security, privacy, financial, accounting, bankReconciliation o sensitivity restricted/securitySensitive/privacySensitive/financialSensitive requiere permiso sensible adicional.
```

---

## 9. Tenant isolation

### 9.1. Regla obligatoria

Toda consulta tenant-scoped debe usar:

```typescript id="tsp-tenant-query-pattern"
where: {
  id: resourceId,
  tenantId: currentTenant.id,
  archivedAt: null
}
```

Prohibido:

```typescript id="tsp-tenant-query-forbidden"
where: {
  id: resourceId
}
```

---

### 9.2. Recursos tenant-scoped

```text id="tsp-tenant-resources"
tenant_setting_values
tenant_policy_versions
tenant_policy_activations
tenant_policy_exceptions
tenant_settings_change_logs
tenant_settings_exports
```

---

### 9.3. Respuesta cross-tenant

Si un recurso existe pero pertenece a otro tenant:

```http id="tsp-cross-tenant-response"
404 Not Found
```

No usar `403` cuando pueda revelar existencia del recurso.

---

## 10. Platform definitions

### 10.1. Definiciones globales

Las tablas siguientes son globales:

```text id="tsp-global-definitions"
setting_definitions
policy_definitions
```

Reglas:

```text id="tsp-global-definition-rules"
- No pertenecen a un tenant.
- No almacenan valores reales de tenants.
- No almacenan secretos.
- No almacenan tokens.
- No almacenan credenciales.
- No almacenan datos transaccionales.
- Solo PlatformAdmin autorizado puede administrarlas.
- Cambios deben auditarse.
```

---

### 10.2. Default seguro

Todo default debe ser seguro.

Ejemplos:

```text id="tsp-secure-defaults"
security.publicSettingsApiEnabled = false
security.wordpressSettingsAccessEnabled = false
security.externalAiRealDataAllowed = false
security.sensitiveExportsRequireApproval = true
documents.downloadAuditRequired = true
documents.publicDocumentPublishingAllowed = false
inventory.negativeStockAllowed = false
```

---

### 10.3. Resident visible

Regla:

```text id="tsp-resident-visible-rule"
residentVisible=true solo puede aplicarse a settings o policies cuyo contenido sea expresamente publicable, no sensible, no financiero interno, no de seguridad interna y no de privacidad interna.
```

---

## 11. No secrets storage

### 11.1. Secretos prohibidos

No almacenar en settings, policies, schemas, defaults, exceptions, history, cache ni exports:

```text id="tsp-secrets-forbidden"
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
bankCredential
providerCredential
oidcClientSecret
smtpPassword
awsSecretAccessKey
jwtSigningKey
encryptionKey
```

---

### 11.2. Regla futura

```text id="tsp-secret-future-rule"
Si una configuración futura requiere secretos, debe usarse un secrets manager externo y este módulo solo podrá guardar una referencia opaca no sensible, previa ADR, threat model y pruebas de seguridad.
```

---

### 11.3. Controles

```text id="tsp-secret-controls"
- ForbiddenKeysValidator recursivo.
- DTO denylist.
- JSONB sanitizer.
- Export sanitizer.
- Audit sanitizer.
- Log sanitizer.
- OpenAPI tests.
- CI no-secrets gate.
```

---

## 12. No executable policy payload

### 12.1. Payloads ejecutables prohibidos

Prohibido en settings, policies, schemas, exceptions y exports:

```text id="tsp-executable-forbidden"
rawSql
sql
script
javascript
functionBody
executableCode
eval
Function
cronCommand
shellCommand
bashCommand
pythonCode
nodeCode
dynamicExpressionUnsafe
templateExpressionUnsafe
webhookScript
```

---

### 12.2. Prohibición de motor de reglas ejecutable

```text id="tsp-no-rules-engine"
Tenant Settings and Policies no debe convertirse en un motor de ejecución arbitraria de reglas por tenant.
```

Permitido:

```text id="tsp-policy-payload-allowed"
- valores booleanos;
- enums;
- límites numéricos;
- strings controlados;
- arrays de strings permitidos;
- objetos JSON validados por schema;
- parámetros de vigencia;
- parámetros de visibilidad;
- parámetros de aprobación;
- parámetros de límites operativos.
```

---

### 12.3. Controles

```text id="tsp-executable-controls"
- JSON Schema estricto.
- additionalProperties=false cuando aplique.
- ForbiddenKeysValidator.
- Prohibición de eval.
- Prohibición de Function constructor.
- Prohibición de SQL dinámico desde payload.
- Tests no executable payload.
```

---

## 13. JSONB security

### 13.1. Campos JSONB permitidos

```text id="tsp-jsonb-fields"
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

### 13.2. Validaciones obligatorias

Antes de persistir JSONB:

```text id="tsp-jsonb-validation"
[ ] Validar schema.
[ ] Validar allowed values.
[ ] Rechazar forbidden keys.
[ ] Rechazar secretos.
[ ] Rechazar scripts.
[ ] Rechazar raw SQL.
[ ] Rechazar código ejecutable.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl persistente.
[ ] Limitar tamaño.
[ ] Limitar profundidad.
[ ] Sanitizar texto.
```

---

### 13.3. No usar JSONB para evadir modelo

```text id="tsp-jsonb-boundary"
JSONB no debe usarse para ocultar entidades, permisos, estados, actores, tenantId, pagos, asientos contables, movimientos bancarios, comandos de hardware, secretos o datos transaccionales de otros módulos.
```

---

## 14. Mass assignment protection

Todo DTO debe usar whitelist estricta.

Reglas:

```text id="tsp-mass-assignment-rules"
- tenantId se resuelve server-side.
- actor se resuelve server-side.
- versionNumber se genera server-side.
- versionLabel se genera server-side.
- status cambia solo mediante endpoints de transición.
- createdBy/updatedBy/approvedBy/activatedBy se resuelven server-side.
- secureDocumentId se genera mediante SDS.
- storageKey nunca se acepta.
```

Controles técnicos:

```text id="tsp-mass-assignment-controls"
- ValidationPipe whitelist=true.
- forbidNonWhitelisted=true.
- DTO denylist.
- Mapper explícito DTO -> command.
- No usar spread directo de body hacia ORM.
- No usar update(data: req.body).
```

Patrón prohibido:

```typescript id="tsp-prohibited-spread"
await prisma.tenantPolicyVersion.update({
  where: { id },
  data: req.body
});
```

Patrón recomendado:

```typescript id="tsp-safe-mapping"
const command = CreateTenantPolicyVersionCommand.fromDto(dto, {
  tenantId: currentTenant.id,
  actorUserProfileId: currentUser.id,
  traceId: requestContext.traceId
});
```

---

## 15. Campos prohibidos

### 15.1. Prohibidos en DTOs externos

```text id="tsp-forbidden-dto-fields"
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

```http id="tsp-forbidden-dto-response"
422 Unprocessable Entity
```

---

### 15.2. Prohibidos en responses

```text id="tsp-forbidden-response-fields"
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
payload sensible no sanitizado
datos cross-tenant
```

---

### 15.3. Prohibidos en logs

```text id="tsp-forbidden-log-fields"
tenantId como label de alta cardinalidad
userId como label de alta cardinalidad
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
raw policy payload sensible
raw setting value sensible
raw request body
authorization header
cookie
```

---

### 15.4. Prohibidos en auditoría

```text id="tsp-forbidden-audit-fields"
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
authorization header
cookie
```

---

## 16. Seguridad de versionamiento

### 16.1. Reglas

```text id="tsp-versioning-security-rules"
- versionNumber se genera server-side.
- versionLabel se genera server-side.
- draft puede editarse.
- reviewReady no debe editarse destructivamente.
- approved no debe alterarse silenciosamente.
- active no se edita destructivamente.
- scheduled no se edita destructivamente.
- superseded conserva historial.
- expired conserva historial.
- archived no se consume.
- rejected no se activa.
```

---

### 16.2. Estados prohibidos desde cliente

El cliente nunca puede enviar directamente:

```text id="tsp-status-forbidden-client"
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

como mecanismo de transición.

Debe usar endpoints específicos:

```text id="tsp-transition-endpoints"
submit-review
approve
reject
activate
schedule
rollback
archive
revoke
```

---

### 16.3. Inmutabilidad de políticas activas

```text id="tsp-active-immutability"
Una TenantPolicyVersion active no debe actualizar policyPayload, versionNumber, effectiveFrom, createdBy, approvedBy o activatedBy. Todo cambio funcional debe crear una nueva versión.
```

---

## 17. Seguridad de activaciones

### 17.1. Activación inmediata

Controles:

```text id="tsp-activation-immediate-controls"
[ ] Versión tenant-scoped.
[ ] Estado approved.
[ ] effectiveFrom obligatorio.
[ ] No overlap.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Transacción.
[ ] Cache invalidation post-commit.
[ ] Audit.
```

---

### 17.2. Activación futura

Controles:

```text id="tsp-activation-future-controls"
[ ] effectiveFrom futuro.
[ ] Estado scheduled.
[ ] No afecta resolución actual.
[ ] Job controlado.
[ ] Audit scheduled.
[ ] Validación antes de aplicar.
[ ] Cache invalidation al aplicar.
```

---

### 17.3. Retroactividad

Regla:

```text id="tsp-retroactive-rule"
La activación retroactiva está prohibida por defecto. Solo puede permitirse con permiso tenantPolicies.activateRetroactive, reason reforzado, auditoría, feature flag explícito y ADR aprobado.
```

---

### 17.4. Rollback

Regla:

```text id="tsp-rollback-security-rule"
Rollback no borra activaciones previas ni modifica datos transaccionales históricos. Crea una nueva activación controlada hacia una versión permitida.
```

---

## 18. Seguridad de excepciones

### 18.1. Reglas obligatorias

```text id="tsp-exception-security-rules"
- Toda excepción pertenece a un tenant.
- Toda excepción requiere policyKey.
- Toda excepción requiere reason.
- Toda excepción requiere validFrom.
- Toda excepción requiere validUntil.
- validUntil debe ser posterior a validFrom.
- Excepción sensible requiere aprobación.
- Excepción revoked no aplica.
- Excepción expired no aplica.
- Excepción archived no aplica.
- Excepción rejected no aplica.
- No hay excepciones multi-tenant.
- targetResourceId debe validarse por el módulo dueño cuando aplique.
```

---

### 18.2. Riesgos de excepción

| Riesgo                                   | Control                            |
| ---------------------------------------- | ---------------------------------- |
| Excepción permanente accidental          | validUntil obligatorio             |
| Excepción sin aprobación                 | approvalRequired según sensitivity |
| Excepción cross-tenant                   | tenantId + target validation       |
| Excepción amplia insegura                | reason + targetResource + audit    |
| Excepción aplicada después de revocación | resolver filtra status             |
| Excepción aplicada después de expiración | resolver filtra valid window       |

---

## 19. Seguridad del resolver efectivo

### 19.1. Effective setting

El resolver debe:

```text id="tsp-effective-setting-security"
[ ] Validar tenant activo.
[ ] Buscar override tenant-scoped.
[ ] Respetar effectiveAt.
[ ] Ignorar archived.
[ ] Ignorar expired fuera de ventana.
[ ] Usar default seguro si no hay override.
[ ] Devolver source.
[ ] No devolver secretos.
[ ] No modificar datos.
```

---

### 19.2. Effective policy

El resolver debe:

```text id="tsp-effective-policy-security"
[ ] Validar tenant activo.
[ ] Buscar versión vigente tenant-scoped.
[ ] Respetar effectiveAt.
[ ] Ignorar draft.
[ ] Ignorar reviewReady.
[ ] Ignorar rejected.
[ ] Ignorar archived.
[ ] Usar defaultPolicy si no hay override.
[ ] Aplicar exceptions solo si están vigentes.
[ ] No aplicar revoked.
[ ] No aplicar expired.
[ ] No devolver secretos.
[ ] No ejecutar payload.
[ ] No modificar módulos consumidores.
```

---

### 19.3. Regla de boundary

```text id="tsp-effective-boundary"
El resolver entrega configuración; no ejecuta acciones transaccionales, no crea pagos, no genera cargos, no modifica inventario, no abre portones, no confirma conciliaciones y no altera datos operativos.
```

---

## 20. Seguridad de cache

### 20.1. Cache keys

Las cache keys deben incluir tenant:

```text id="tsp-cache-keys-sec"
tenant:{tenantId}:setting:{key}:effective:{effectiveAtBucket}
tenant:{tenantId}:policy:{policyKey}:effective:{effectiveAtBucket}
tenant:{tenantId}:policy-exception:{policyKey}:{targetResourceType}:{targetResourceId}:{effectiveAtBucket}
```

---

### 20.2. Reglas

```text id="tsp-cache-security-rules"
- Cache debe ser tenant-scoped.
- Cache no debe mezclar tenants.
- Cache no debe contener secretos.
- Cache no debe exponer keys por API.
- Cache debe invalidarse post-commit.
- Cache debe tener TTL conservador.
- Cache miss no debe romper operación.
- Falla de cache debe usar DB/default seguro.
- Cache stale no debe habilitar endpoints prohibidos.
```

---

### 20.3. Eventos de invalidación

```text id="tsp-cache-invalidation-events"
tenantSetting.updated
tenantSetting.activated
tenantSetting.archived
tenantPolicyVersion.activated
tenantPolicyVersion.scheduled aplicado
tenantPolicyActivation.created
tenantPolicyException.approved
tenantPolicyException.revoked
tenantPolicyException.expired
settingDefinition.updated
policyDefinition.updated
```

---

## 21. Seguridad documental

### 21.1. Secure Document Storage

Regla:

```text id="tsp-sds-rule"
Tenant Settings and Policies nunca almacena, acepta ni devuelve storageKey. Las exportaciones administrativas solo deben referenciar secureDocumentId generado por Secure Document Storage.
```

---

### 21.2. Exportaciones permitidas

```text id="tsp-export-types-sec"
settings
policies
policyHistory
policyExceptions
fullAdministrativeSnapshot
```

---

### 21.3. Prohibido en exportaciones

```text id="tsp-export-forbidden"
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
storageKey
signedUrl persistente
rawSql
script
functionBody
executableCode
raw payload sensible no sanitizado
datos cross-tenant
```

---

### 21.4. Controles de exportación

```text id="tsp-export-controls"
- tenantSettings.export requerido.
- tenantSettings.exportSensitive requerido si includeSensitive=true.
- reason obligatorio para fullAdministrativeSnapshot.
- Sanitización de filtros.
- Sanitización de payload.
- SecureDocumentStorage adapter.
- Audit tenantSettings.exported.
- Response solo devuelve secureDocumentId.
```

---

## 22. No public endpoints

No implementar:

```text id="tsp-no-public-endpoints"
GET  /api/v1/public/tenant-settings
GET  /api/v1/public/tenant-policies
GET  /api/v1/public/settings-policies
GET  /api/v1/public/tenants/{slug}/settings
GET  /api/v1/public/tenants/{slug}/policies
POST /api/v1/public/tenants/{slug}/settings
POST /api/v1/public/tenants/{slug}/policies
```

Respuesta esperada:

```http id="tsp-no-public-response"
404 Not Found
```

No usar `403` si revela que el endpoint o recurso existe.

---

## 23. No WordPress access

WordPress es capa pública informativa y no debe consultar settings o policies transaccionales del Core.

Prohibido para WordPress público:

```text id="tsp-wordpress-forbidden"
- consultar settings internos;
- consultar policies internas;
- consultar policyPayload;
- consultar excepciones;
- consultar historial;
- consultar activaciones;
- crear settings;
- modificar settings;
- crear policies;
- activar policies;
- exportar configuración;
- leer summaries sensibles;
- almacenar tokens Core;
- actuar como sesión Core.
```

Controles:

```text id="tsp-wordpress-controls"
- No public endpoints.
- CORS sin wildcard.
- CORS no permite dominio WordPress público para rutas settings/policies.
- No cookies WordPress como auth Core.
- No shortcodes con settings privados.
- No templates WordPress consumiendo policyPayload.
```

---

## 24. No transaction side effects

Tenant Settings and Policies no debe ejecutar acciones transaccionales de módulos consumidores.

Prohibido:

```text id="tsp-transaction-forbidden"
Charge
Payment
PaymentAllocation
PaymentReversal
SupplierPayable
SupplierPaymentOrder
SupplierPaymentEvidence
JournalEntry
JournalEntryLine
BankTransaction
ReconciliationMatch
ReconciliationSession confirmation
Reservation
Fine
MeetingAttendance
VoteCast
CertifiedMinutes
AccessEvent
AccessCheckIn
AccessCheckOut
MaintenanceWorkOrder mutation
InventoryMovement
StockAdjustment
StockTransfer
```

Aplicaciones:

```text id="tsp-transaction-applications"
- Cambiar lateFeePolicy no genera recargos automáticamente desde este módulo.
- Cambiar paymentPolicy no crea pagos.
- Cambiar reservationPolicy no crea reservas.
- Cambiar visitorAccessPolicy no registra accesos.
- Cambiar stockPolicy no modifica inventario.
- Cambiar supplierApprovalPolicy no crea obligaciones.
- Cambiar accountingPolicy no crea JournalEntry.
```

Controles:

```text id="tsp-transaction-controls"
- No adapters write hacia módulos consumidores.
- Puertos solo lectura/resolución cuando aplique.
- Boundary tests.
- CI no transaction side effects.
```

---

## 25. No external AI with real data

Prohibido enviar a IA externa:

```text id="tsp-ai-forbidden"
- settings reales;
- policyPayload real;
- schema real con datos sensibles;
- historial real;
- excepciones reales;
- activaciones reales;
- exports reales;
- snapshots administrativos reales;
- configuración de privacidad real;
- configuración de seguridad real;
- configuración financiera real;
- datos de tenant reales;
- datos de usuarios reales.
```

Permitido:

```text id="tsp-ai-allowed"
- documentación técnica;
- datos ficticios;
- fixtures sintéticos;
- schemas sin datos reales;
- ejemplos anonimizados irreversiblemente si existe aprobación futura;
- análisis local sin envío externo.
```

Controles:

```text id="tsp-ai-controls"
- TENANT_SETTINGS_EXTERNAL_AI_ENABLED=false.
- TENANT_SETTINGS_EXTERNAL_AI_ENABLED=true falla en boot MVP.
- No adapters de IA externa.
- DTOs rechazan externalAiEnabled.
- DTOs rechazan externalAiRealDataAllowed.
- CI no external AI.
```

---

## 26. Rate limiting

Aplicar rate limit reforzado en:

```text id="tsp-rate-limited-routes"
PATCH /api/v1/tenant/settings/{key}
POST  /api/v1/tenant/settings/{key}/schedule
POST  /api/v1/tenant/policies/{policyKey}/versions
POST  /api/v1/tenant/policies/{policyKey}/versions/{versionId}/activate
POST  /api/v1/tenant/policies/{policyKey}/rollback
POST  /api/v1/tenant/policy-exceptions
GET   /api/v1/tenant/settings-policies/export
```

Objetivos:

```text id="tsp-rate-limit-objectives"
- Evitar cambios masivos accidentales.
- Evitar abuso de exportaciones.
- Proteger settings sensibles.
- Proteger policy activation.
- Proteger validators de schemas.
- Proteger audit y cache invalidation.
```

Respuesta:

```http id="tsp-rate-limit-response"
429 Too Many Requests
```

---

## 27. Seguridad de logs

### 27.1. Eventos loggeables

```text id="tsp-log-events"
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

### 27.2. Campos permitidos

```text id="tsp-log-allowed"
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
source
durationMs
errorCode
```

---

### 27.3. Campos prohibidos

```text id="tsp-log-forbidden"
tenantId como label de alta cardinalidad
userId como label de alta cardinalidad
secret
token
password
apiKey
privateKey
clientSecret
storageKey
signedUrl
rawSql
script
functionBody
executableCode
raw policy payload sensible
raw setting value sensible
raw request body
authorization header
cookie
```

---

## 28. Auditoría

### 28.1. Eventos obligatorios

```text id="tsp-audit-events"
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

### 28.2. Metadata permitida

```text id="tsp-audit-metadata-allowed"
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

### 28.3. Metadata prohibida

```text id="tsp-audit-metadata-forbidden"
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
authorization header
cookie
```

---

## 29. Observabilidad y métricas

### 29.1. Métricas permitidas

```text id="tsp-metrics"
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

### 29.2. Labels permitidos

```text id="tsp-metric-labels-allowed"
category
ownerModule
status
outcome
source
```

---

### 29.3. Labels prohibidos

```text id="tsp-metric-labels-forbidden"
tenantId
userId
settingValueId
policyVersionId
policyActivationId
policyExceptionId
traceId
requestId
secretKey
```

---

## 30. CORS y headers

### 30.1. CORS

```text id="tsp-cors-rules"
- No wildcard.
- No permitir WordPress público para rutas tenant-settings-policies.
- Permitir solo frontends autenticados autorizados.
- Orígenes explícitos por ambiente.
- Credentials solo si existe justificación.
- Métodos limitados por endpoint.
```

---

### 30.2. Headers obligatorios

```http id="tsp-security-headers"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Recomendados:

```http id="tsp-security-headers-recommended"
Content-Security-Policy: default-src 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

---

## 31. Seguridad de OpenAPI

OpenAPI debe incluir:

```yaml id="tsp-openapi-required"
x-auth-required: true
x-tenant-settings-policies: true
x-public-exposure: false
x-wordpress-access: false
x-secrets-storage: false
x-executable-policy-payload: false
x-transactional-side-effects: false
x-external-ai-real-data: false
```

Para rutas tenant:

```yaml id="tsp-openapi-tenant"
x-tenant-scope: true
x-permission-required: true
```

Para rutas platform:

```yaml id="tsp-openapi-platform"
x-platform-scope: true
x-platform-admin-required: true
```

Para rutas `/me`:

```yaml id="tsp-openapi-me"
x-own-resource-scope: true
x-resident-visible-summary-only: true
x-sensitive-settings-exposed: false
```

Para exportaciones:

```yaml id="tsp-openapi-export"
x-secure-document-storage: true
x-storage-key-exposed: false
```

OpenAPI no debe documentar:

```text id="tsp-openapi-forbidden"
tenantId en DTOs externos
actor fields
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

## 32. Validaciones críticas por caso de uso

### 32.1. Crear setting definition

```text id="tsp-sec-create-setting-definition"
[ ] AuthGuard.
[ ] PlatformPermissionGuard.
[ ] Validar key.
[ ] Validar category.
[ ] Validar valueType.
[ ] Validar defaultValue.
[ ] Validar allowedValues.
[ ] Validar schema.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Resolver createdBy server-side.
[ ] Auditar tenantPolicyDefinition.created o settingDefinition.created según convención final.
```

---

### 32.2. Actualizar tenant setting

```text id="tsp-sec-update-setting"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Rechazar tenantId.
[ ] Rechazar actor fields.
[ ] Validar SettingDefinition active.
[ ] Validar isTenantOverridable.
[ ] Validar valueType/schema.
[ ] Rechazar secrets.
[ ] Rechazar scripts.
[ ] Rechazar rawSql.
[ ] Requerir reason si runtimeCritical.
[ ] Crear override tenant-scoped.
[ ] Invalidar cache post-commit.
[ ] Crear change log.
[ ] Auditar tenantSetting.updated.
```

---

### 32.3. Crear policy version

```text id="tsp-sec-create-policy-version"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Rechazar tenantId.
[ ] Rechazar versionNumber.
[ ] Rechazar status.
[ ] Validar PolicyDefinition active.
[ ] Validar isTenantOverridable.
[ ] Validar policyPayload contra schema.
[ ] Rechazar secrets.
[ ] Rechazar executable payload.
[ ] Requerir changeReason.
[ ] Generar versionNumber server-side.
[ ] Crear draft.
[ ] No modificar active.
[ ] Crear change log.
[ ] Auditar tenantPolicyVersion.created.
```

---

### 32.4. Aprobar policy version

```text id="tsp-sec-approve-policy-version"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Validar version tenant-scoped.
[ ] Validar estado reviewReady.
[ ] Requerir approvalReason.
[ ] Resolver approvedBy server-side.
[ ] Resolver approvedAt server-side.
[ ] No activar automáticamente.
[ ] Auditar tenantPolicyVersion.approved.
```

---

### 32.5. Activar policy version

```text id="tsp-sec-activate-policy-version"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] SensitivePermissionGuard si aplica.
[ ] Validar version tenant-scoped.
[ ] Validar estado approved.
[ ] Validar effectiveFrom.
[ ] Validar retroactividad.
[ ] Validar no overlap.
[ ] Crear TenantPolicyActivation.
[ ] Ajustar versión anterior.
[ ] Invalidar cache post-commit.
[ ] Auditar tenantPolicyVersion.activated o scheduled.
```

---

### 32.6. Crear excepción

```text id="tsp-sec-create-exception"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Validar policyKey.
[ ] Validar policyVersionId tenant-scoped si existe.
[ ] Validar targetResourceType.
[ ] Validar targetResourceId por puerto si aplica.
[ ] Validar exceptionPayload.
[ ] Validar validFrom.
[ ] Validar validUntil.
[ ] Validar validUntil > validFrom.
[ ] Requerir reason.
[ ] Evaluar sensibilidad.
[ ] pendingApproval si aplica.
[ ] Auditar tenantPolicyException.created.
```

---

### 32.7. Exportar settings/policies

```text id="tsp-sec-export"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard tenantSettings.export.
[ ] SensitivePermissionGuard si includeSensitive=true.
[ ] Validar exportType.
[ ] Validar format.
[ ] Requerir reason si snapshot sensible.
[ ] Sanitizar filters.
[ ] Sanitizar payload exportado.
[ ] Excluir secrets.
[ ] Excluir scripts.
[ ] Excluir rawSql.
[ ] Crear TenantSettingsExport.
[ ] Crear SecureDocument.
[ ] Guardar secureDocumentId.
[ ] No devolver storageKey.
[ ] Auditar tenantSettings.exported.
```

---

## 33. Feature flags de seguridad

```text id="tsp-security-flags"
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

Regla:

```text id="tsp-security-flags-rule"
El boot debe fallar en MVP si se habilitan endpoints públicos, acceso WordPress, policies ejecutables, secret storage o IA externa sin ADR explícito, threat model, pruebas y aprobación.
```

---

## 34. CI security gates

El pipeline debe fallar si:

```text id="tsp-ci-security-gates"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta versionNumber desde cliente.
[ ] Algún DTO acepta versionLabel desde cliente.
[ ] Algún DTO acepta status directo fuera de transición.
[ ] Algún DTO acepta storageKey.
[ ] Algún DTO acepta signedUrl.
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
[ ] API permite versions cross-tenant.
[ ] API permite activations cross-tenant.
[ ] API permite exceptions cross-tenant.
[ ] API permite history cross-tenant.
[ ] API permite exports cross-tenant.
[ ] API crea endpoint público.
[ ] API permite WordPress público.
[ ] API expone settings sensibles en /me.
[ ] API expone policyPayload sensible completo en /me.
[ ] API expone storageKey.
[ ] API expone signedUrl persistente.
[ ] Logs contienen secrets.
[ ] Audit contiene secrets.
[ ] Export contiene secrets.
[ ] PolicyPayload permite rawSql.
[ ] PolicyPayload permite script.
[ ] PolicyPayload permite executableCode.
[ ] Cache mezcla tenants.
[ ] API crea Payment.
[ ] API crea SupplierPaymentOrder.
[ ] API crea JournalEntry.
[ ] API confirma Bank Reconciliation.
[ ] API modifica datos transaccionales de otros módulos.
[ ] API llama IA externa con datos reales.
```

---

## 35. Checklist de revisión de seguridad

```text id="tsp-security-review-checklist"
[ ] Todas las rutas requieren AuthGuard.
[ ] Rutas tenant requieren TenantGuard.
[ ] Rutas tenant requieren PermissionGuard.
[ ] Rutas sensibles requieren SensitivePermissionGuard.
[ ] Rutas platform requieren PlatformPermissionGuard.
[ ] Rutas /me requieren OwnPolicySummaryGuard.
[ ] Todos los repositorios tenant-scoped filtran tenantId.
[ ] Cross-tenant responde 404.
[ ] DTOs usan whitelist.
[ ] DTOs usan forbidNonWhitelisted.
[ ] No se acepta tenantId desde cliente.
[ ] No se aceptan actor fields desde cliente.
[ ] No se acepta versionNumber desde cliente.
[ ] No se acepta status directo fuera de transición.
[ ] No se acepta storageKey.
[ ] No se acepta signedUrl persistente.
[ ] No se aceptan secrets.
[ ] No se aceptan tokens.
[ ] No se aceptan passwords.
[ ] No se aceptan apiKeys.
[ ] No se acepta rawSql.
[ ] No se aceptan scripts.
[ ] No se acepta executableCode.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] /me solo expone summaries residentVisible.
[ ] No se expone configuración sensible a residentes.
[ ] No se almacena secret storage.
[ ] No se ejecuta policyPayload.
[ ] Active policy no se edita destructivamente.
[ ] Activación retroactiva está bloqueada por defecto.
[ ] Exceptions tienen vigencia.
[ ] Cache es tenant-scoped.
[ ] Cache se invalida post-commit.
[ ] Export usa SDS.
[ ] Export no devuelve storageKey.
[ ] Logs no contienen secrets.
[ ] Audit no contiene secrets.
[ ] Metrics no usan labels sensibles.
[ ] OpenAPI no documenta campos prohibidos.
[ ] No hay adapters de pagos.
[ ] No hay adapters de ledger.
[ ] No hay adapters de conciliación.
[ ] No hay modificación de módulos consumidores.
[ ] No hay IA externa con datos reales.
```

---

## 36. Riesgos residuales

| Riesgo residual                                       |      Nivel | Mitigación                                 |
| ----------------------------------------------------- | ---------: | ------------------------------------------ |
| TenantAdmin configura política incorrecta             | Medio/Alto | review, approval, audit, rollback          |
| PolicyPayload válido pero semánticamente riesgoso     |      Medio | ownerModule validation, tests contract     |
| Cache stale por fallo de invalidación                 | Medio/Alto | TTL, invalidación post-commit, fallback DB |
| Export legítimo se comparte fuera del sistema         |       Alto | SDS, audit, reason, clasificación          |
| PlatformAdmin crea definition demasiado permisiva     |       Alto | schema review, CI, approval                |
| Excepción amplia mal utilizada                        | Medio/Alto | validUntil, reason, approval, audit        |
| Retroactividad autorizada produce confusión histórica |       Alto | deshabilitada por defecto, ADR, reason     |
| Summary residentVisible revela más de lo esperado     |      Medio | allowlist estricta y tests privacy         |
| Módulos consumidores interpretan diferente una policy |      Medio | schemas centralizados, contract tests      |
| Configuración sensible filtrada por logs              |       Alto | log sanitizer y CI gate                    |

---

## 37. Recomendaciones futuras

Estas capacidades requieren ADR, threat modeling y controles adicionales:

```text id="tsp-future-security"
- secrets manager externo con referencias opacas;
- workflow multi-aprobador;
- firma electrónica de cambios críticos;
- policy simulation engine;
- impact analysis financiero;
- migration de policies entre tenants;
- policy templates marketplace;
- webhooks configurables;
- feature flags comerciales avanzados;
- motor de reglas no ejecutable más expresivo;
- IA para análisis de configuración con datos anonimizados;
- retención/anonymization avanzada de historial.
```

Regla:

```text id="tsp-future-rule"
Ninguna capacidad futura relacionada con secretos, scripts, automatizaciones, webhooks, IA, retroactividad avanzada o efectos transaccionales debe implementarse como extensión menor del MVP; requiere ADR, especificación, pruebas y aprobación explícita.
```

---

## 38. Criterios de aceptación de seguridad

```text id="tsp-security-acceptance"
[ ] Todas las rutas requieren autenticación.
[ ] Todas las rutas tenant requieren TenantGuard.
[ ] Todas las rutas tenant requieren PermissionGuard.
[ ] Las rutas sensibles requieren SensitivePermissionGuard.
[ ] Platform API requiere PlatformPermissionGuard.
[ ] /me API solo expone summaries residentVisible.
[ ] Cross-tenant responde 404.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan versionNumber.
[ ] DTOs rechazan status directo.
[ ] DTOs rechazan secrets.
[ ] DTOs rechazan scripts.
[ ] DTOs rechazan rawSql.
[ ] DTOs rechazan executableCode.
[ ] DTOs rechazan storageKey.
[ ] Responses no exponen storageKey.
[ ] Responses no exponen signedUrl persistente.
[ ] Settings no almacenan secretos.
[ ] Policies no almacenan secretos.
[ ] PolicyPayload no es ejecutable.
[ ] Active policy no se edita destructivamente.
[ ] Activación retroactiva está bloqueada por defecto.
[ ] Excepciones requieren vigencia.
[ ] Excepciones revoked/expired no aplican.
[ ] Cache no mezcla tenants.
[ ] Cache se invalida post-commit.
[ ] Export usa SDS.
[ ] Export no contiene secretos.
[ ] Audit está completo.
[ ] Logs están sanitizados.
[ ] Metrics no tienen labels sensibles.
[ ] OpenAPI no documenta campos prohibidos.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] No hay pagos desde este módulo.
[ ] No hay asientos contables desde este módulo.
[ ] No hay conciliación bancaria desde este módulo.
[ ] No hay modificación de datos transaccionales de otros módulos.
[ ] No hay IA externa con datos reales.
[ ] CI security gates pasan.
```

---

## 39. No aceptación de seguridad

No se acepta el módulo si:

```text id="tsp-security-no-acceptance"
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
- almacena storageKey;
- devuelve storageKey;
- devuelve signedUrl persistente;
- almacena raw SQL;
- almacena scripts;
- almacena JavaScript configurable;
- almacena functionBody;
- almacena executableCode;
- almacena shellCommand;
- almacena cronCommand;
- ejecuta policyPayload;
- usa eval;
- usa Function constructor;
- permite SQL dinámico desde policyPayload;
- expone settings sensibles en /me;
- expone policyPayload sensible completo en /me;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- permite editar active policy destructivamente;
- permite activar rejected policy;
- permite activaciones superpuestas sin control;
- permite retroactividad sin permiso reforzado;
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

## 40. Resultado esperado

Al aplicar estas notas de seguridad, el módulo `025-tenant-settings-policies` quedará protegido contra exposición pública, acceso cross-tenant, configuración maliciosa, almacenamiento accidental de secretos, ejecución de payloads configurables, activaciones indebidas, excepciones abusivas, cache insegura, exportaciones con datos sensibles, acceso desde WordPress público, efectos transaccionales no autorizados y uso de IA externa con datos reales.

Resultado esperado:

```text id="tsp-security-expected-result"
tenant isolation protegido
auth obligatorio protegido
authorization por permisos protegida
sensitive permissions protegidas
Platform API protegida
Tenant Admin API protegida
/me summaries protegidos
internal resolver protegido
settings definitions protegidas
policy definitions protegidas
tenant settings protegidos
policy versions protegidas
policy activations protegidas
policy exceptions protegidas
effective dating protegido
cache tenant-scoped protegida
history sanitizado protegido
exports vía SDS protegidos
storageKey no expuesto
secrets no almacenados
scripts no aceptados
raw SQL no aceptado
payload ejecutable no aceptado
active policies inmutables
retroactividad controlada
exceptions con vigencia
audit completo
logs sanitizados
metrics seguras
OpenAPI seguro
CORS seguro
no public endpoints
no WordPress access
no transaction side effects
no payment creation
no accounting creation
no bank reconciliation confirmation
no external AI with real data
CI security gates definidos
security review checklist definido
```

---

## 41. Expediente actualizado

```text id="tsp-security-expediente"
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
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 42. Cierre del paquete 025

Con este documento queda completo el paquete SDD del módulo:

```text id="tsp-package-complete"
docs/specs/025-tenant-settings-policies/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
