# GAP-S2-006 — Ownership de configuración y frontera Prisma

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Gap | `GAP-S2-006` |
| Fecha | 2026-08-13 |
| Estado | `closed` |
| Specs afectadas | 001 — Tenants; 025 — Tenant Settings and Policies |
| Decisión de readiness | Continúa `NO_GO` |

## 2. Causa raíz

Spec 001 proponía `TenantConfiguration` con `timezone`, `currency`, idioma y flags de
módulos. `timezone` y `currency` ya existían en `Tenant`, mientras Spec 025 proponía
`SettingDefinition` y `TenantSettingValue` para esos mismos valores y otros overrides.
Esto generaba modelos, defaults, permisos, eventos y APIs paralelos sin una autoridad
única.

## 3. Ownership canónico

| Dato o capacidad | Owner | Persistencia/API canónica |
| --- | --- | --- |
| Identidad y lifecycle del tenant | Spec 001 | `Tenant` y API de plataforma de tenants |
| `timezone` y `currency` operativos | Spec 001 | Columnas requeridas de `Tenant` |
| Perfil público | Spec 001 | `TenantProfile` |
| Branding | Spec 001 | `TenantBranding` |
| Mapeo WordPress | Spec 001 | `TenantWordPressMapping` |
| Settings tipados y defaults | Spec 025 | `SettingDefinition` |
| Overrides por tenant | Spec 025 | `TenantSettingValue` y `/tenant/settings` |
| Roles, memberships y permisos | Spec 002 | Modelos y servicios de Identity and Access |
| Auditoría durable | Spec 007 | Contrato pendiente de `GAP-S2-007` |

`Tenant.timezone` y `Tenant.currency` son invariantes de lifecycle disponibles desde la
creación, antes de cualquier catálogo de settings. No se registran también como
`general.timezone` o `general.currency`.

`general.locale`, con default `es-EC`, es el único setting inicial autorizado por este
gap. Nuevas definitions requieren una necesidad funcional aprobada; Sprint 2 no
anticipa flags para módulos todavía inexistentes.

## 4. Elementos retirados de Spec 001

Quedan retirados y no deben implementarse:

```text
TenantConfiguration
tenant_configurations
GET /api/v1/tenant/configuration
PATCH /api/v1/tenant/configuration
tenants.configuration.read
tenants.configuration.update
TenantConfigurationUpdated
tenant.configuration.updated
```

También quedan fuera los campos `defaultLanguage`,
`allowResidentSelfRegistration`, `allowOnlinePayments`, `enableReservations`,
`enableFines`, `enableMeetings` y `enableNotifications` propuestos en ese modelo. El
idioma se representa mediante `general.locale`; los demás flags sólo podrán entrar en
Spec 025 cuando exista el módulo dueño y una necesidad autorizada.

La actualización de `timezone` y `currency` continúa en
`PATCH /api/v1/platform/tenants/{tenantId}` bajo autorización de plataforma. No se
expone una segunda ruta tenant-scoped para esos campos.

## 5. Prisma exacto autorizado para este ownership

### 5.1. Slice Spec 001

```text
TenantStatus
Tenant
TenantProfile
TenantBranding
TenantWordPressMapping
```

No incluye `TenantConfiguration` ni `tenant_configurations`.

### 5.2. Slice Spec 025 de Sprint 2

```text
TenantSettingCategory
TenantSettingValueType
TenantSettingSensitivity
DefinitionStatus
TenantSettingValueStatus
TenantSettingSource
SettingDefinition
TenantSettingValue
```

No incluye `PolicyDefinition`, versiones, activaciones, excepciones, scheduling,
change-log propio, historial o exportaciones. La auditoría de las mutaciones se integra
con Spec 007 y no se duplica en una tabla de Spec 025 durante Sprint 2.

## 6. Unidades de migración

Después de una decisión `GO`, la secuencia relevante es:

1. migración de tenant core: enum y cuatro modelos de Spec 001, sin configuración
   paralela;
2. migraciones de identidad/acceso de Spec 002 según su contrato;
3. migración de auditoría base una vez cerrado `GAP-S2-007`;
4. migración de settings base: enums, `setting_definitions`,
   `tenant_setting_values`, FK a `tenants`, índices y constraints;
5. seed versionado e idempotente de `general.locale = es-EC`.

Las migraciones deben ser aditivas, ejecutarse desde base vacía y no crear tablas de
policies diferidas. Este contrato no autoriza todavía crear migrations ni modificar el
schema runtime porque Sprint 2 permanece `NO_GO`.

## 7. Contrato API de settings en Sprint 2

La superficie máxima pertenece a Spec 025:

```text
GET   /api/v1/platform/setting-definitions
GET   /api/v1/platform/setting-definitions/{definitionId}
GET   /api/v1/tenant/settings
GET   /api/v1/tenant/settings/{key}
PATCH /api/v1/tenant/settings/{key}
```

No se crean, editan o archivan definitions por API. Los overrides exigen
`X-Tenant-Id`, membership y permiso `tenantSettings.update`; nunca aceptan `tenantId`
desde body o query. La lectura usa `tenantSettings.read` y siempre resuelve primero el
tenant validado.

## 8. Invariantes

- Una propiedad tiene un solo owner y una sola persistencia.
- Toda fila `TenantSettingValue` contiene `tenant_id` y FK a `Tenant`.
- La clave debe existir en un `SettingDefinition` activo y tenant-overridable.
- Valor y default validan contra tipo/schema.
- No se almacenan secretos, tokens, passwords, scripts o SQL ejecutable.
- Los cambios se auditan mediante Spec 007 y no habilitan módulos inexistentes.
- No se permite lectura o escritura cross-tenant.
- El endpoint público de tenant no expone settings.

## 9. Criterios de cierre

- ownership único entre Specs 001 y 025;
- `TenantConfiguration` retirado del slice implementable;
- `timezone` y `currency` conservados únicamente en `Tenant`;
- modelos y enums Prisma de 001/025 enumerados exactamente;
- unidades y orden de migración definidos sin ejecutarlas;
- API única de settings asignada a Spec 025;
- Sprint 2 conserva `NO_GO`.

## 10. Consecuencia para readiness

`GAP-S2-006` queda cerrado documentalmente. El schema y las migraciones continúan
ausentes deliberadamente. Permanecen abiertos `GAP-S2-001`, `GAP-S2-007` y
`GAP-S2-008`; por tanto, la compuerta de Sprint 2 no cambia a `GO`.
