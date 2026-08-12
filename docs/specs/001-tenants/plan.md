# Plan — Spec 001 Tenants Management

## 1. Información del documento

| Campo                  | Valor                            |
| ---------------------- | -------------------------------- |
| Proyecto               | RESIDENT Core                    |
| Spec ID                | 001                              |
| Módulo                 | Tenants Management               |
| Documento              | Implementation Plan              |
| Ruta                   | `docs/specs/001-tenants/plan.md` |
| Versión                | 0.1                              |
| Estado                 | needs-review                     |
| Fecha                  | 2026-07-12                       |
| Documento base         | `docs/specs/001-tenants/spec.md` |
| Prioridad              | Alta                             |
| Arquitectura           | Monolito modular NestJS          |
| Base de datos          | PostgreSQL + Prisma              |
| Autenticación objetivo | Keycloak                         |
| Autorización           | RESIDENT Core tenant-aware RBAC  |

---

## 2. Propósito

Este documento transforma la especificación funcional `001-tenants/spec.md` en un plan técnico de implementación.

El objetivo es definir:

* estructura del módulo;
* componentes NestJS;
* entidades;
* modelos Prisma;
* casos de uso;
* repositorios;
* validaciones;
* endpoints;
* autorización;
* auditoría;
* eventos;
* pruebas;
* orden recomendado de desarrollo;
* criterios de aceptación técnica.

Este plan debe ser usado por desarrolladores humanos y agentes IA como guía obligatoria para implementar el módulo `Tenants Management`.

---

## 3. Resumen de la implementación

El módulo `Tenants Management` será el primer módulo funcional de RESIDENT Core.

Implementará la administración base de conjuntos residenciales, que en RESIDENT se representan como `tenants`.

La implementación inicial incluirá:

```text id="8b4a6u"
- Modelo Tenant.
- Modelo TenantProfile.
- Modelo TenantBranding.
- Modelo TenantConfiguration.
- Modelo TenantWordPressMapping.
- Creación de tenant.
- Actualización de tenant.
- Activación.
- Suspensión.
- Reactivación.
- Archivado lógico.
- Perfil público.
- Integración inicial con WordPress por slug.
- Creación de roles base.
- Auditoría.
- Eventos de dominio.
- Pruebas unitarias, integración, autorización y multitenancy.
```

---

## 4. Decisiones técnicas aplicables

Este módulo debe respetar las siguientes decisiones:

```text id="bn9u8g"
ADR-001 — Architecture Style
ADR-002 — Backend Framework
ADR-003 — Database Strategy
ADR-004 — Multitenancy Strategy
ADR-005 — Authentication Strategy
ADR-006 — Identity Provider Strategy
ADR-007 — Authorization Strategy
ADR-008 — API Gateway Strategy
ADR-009 — Deployment Strategy
ADR-010 — Observability Strategy
ADR-011 — Testing Strategy
ADR-012 — CI/CD Strategy
```

Reglas clave:

* NestJS + TypeScript.
* PostgreSQL.
* Prisma.
* Monolito modular.
* API REST `/api/v1`.
* Keycloak como objetivo de identidad.
* Core autoriza.
* Auditoría obligatoria.
* No eliminación física normal.
* WordPress no es fuente transaccional.
* Tenant es frontera de aislamiento.
* No exponer datos sensibles en endpoints públicos.

---

## 5. Alcance técnico de la primera implementación

### 5.1. Incluido

La primera implementación debe cubrir:

* Migraciones Prisma para tablas del módulo.
* Entidades o modelos de dominio.
* DTOs de entrada.
* DTOs de salida.
* Validadores.
* Repositorio tenant-aware.
* Use cases.
* Controladores REST.
* Guards/decorators de autorización.
* Servicio de slug.
* Servicio de estados.
* Servicio de perfil público.
* Servicio de WordPress mapping.
* Servicio de roles base.
* Servicio de auditoría.
* Eventos internos.
* Tests.
* OpenAPI.

---

### 5.2. Diferido

No se implementará todavía:

* Gestión completa de usuarios.
* Invitación real por correo.
* Flujo completo Keycloak.
* Roles personalizados por tenant.
* Planes SaaS.
* Billing SaaS.
* Dominios personalizados.
* Sincronización automática bidireccional con WordPress.
* Frontend administrativo.
* Importación automática desde WordPress.
* Eliminación física.

---

## 6. Estructura de carpetas recomendada

Estructura sugerida dentro del backend:

```text id="pjh403"
apps/api/src/modules/tenants/
├── tenants.module.ts
├── tenants.controller.ts
├── platform-tenants.controller.ts
├── public-tenants.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-tenant.use-case.ts
│   │   ├── update-tenant.use-case.ts
│   │   ├── activate-tenant.use-case.ts
│   │   ├── suspend-tenant.use-case.ts
│   │   ├── reactivate-tenant.use-case.ts
│   │   ├── archive-tenant.use-case.ts
│   │   ├── get-tenant.use-case.ts
│   │   ├── list-tenants.use-case.ts
│   │   ├── get-public-tenant-profile.use-case.ts
│   │   ├── update-tenant-profile.use-case.ts
│   │   ├── update-tenant-branding.use-case.ts
│   │   ├── update-tenant-configuration.use-case.ts
│   │   └── update-wordpress-mapping.use-case.ts
│   │
│   ├── services/
│   │   ├── tenant-onboarding.service.ts
│   │   ├── tenant-status.service.ts
│   │   ├── tenant-public-profile.service.ts
│   │   └── tenant-base-roles.service.ts
│   │
│   └── ports/
│       ├── tenant.repository.ts
│       ├── tenant-audit.port.ts
│       └── tenant-events.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── tenant.entity.ts
│   │   ├── tenant-profile.entity.ts
│   │   ├── tenant-branding.entity.ts
│   │   ├── tenant-configuration.entity.ts
│   │   └── tenant-wordpress-mapping.entity.ts
│   │
│   ├── value-objects/
│   │   ├── tenant-slug.vo.ts
│   │   ├── tenant-status.vo.ts
│   │   ├── tenant-currency.vo.ts
│   │   ├── tenant-timezone.vo.ts
│   │   └── tenant-color.vo.ts
│   │
│   ├── events/
│   │   ├── tenant-created.event.ts
│   │   ├── tenant-activated.event.ts
│   │   ├── tenant-suspended.event.ts
│   │   ├── tenant-reactivated.event.ts
│   │   ├── tenant-archived.event.ts
│   │   ├── tenant-profile-updated.event.ts
│   │   ├── tenant-branding-updated.event.ts
│   │   ├── tenant-configuration-updated.event.ts
│   │   └── tenant-wordpress-mapping-updated.event.ts
│   │
│   └── errors/
│       ├── tenant-not-found.error.ts
│       ├── tenant-slug-already-exists.error.ts
│       ├── tenant-invalid-status.error.ts
│       ├── tenant-invalid-slug.error.ts
│       ├── tenant-suspended.error.ts
│       └── tenant-archived.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-tenant.repository.ts
│   │   └── tenant.mapper.ts
│   │
│   ├── audit/
│   │   └── tenant-audit.adapter.ts
│   │
│   └── events/
│       └── tenant-events.adapter.ts
│
├── dto/
│   ├── create-tenant.dto.ts
│   ├── update-tenant.dto.ts
│   ├── suspend-tenant.dto.ts
│   ├── update-tenant-profile.dto.ts
│   ├── update-tenant-branding.dto.ts
│   ├── update-tenant-configuration.dto.ts
│   ├── update-wordpress-mapping.dto.ts
│   ├── tenant-response.dto.ts
│   ├── public-tenant-profile-response.dto.ts
│   └── list-tenants-query.dto.ts
│
└── tests/
    ├── unit/
    ├── integration/
    ├── api/
    ├── authorization/
    ├── multitenancy/
    └── security/
```

---

## 7. Estructura de documentación esperada

Dentro de la spec:

```text id="52dgu8"
docs/specs/001-tenants/
├── spec.md
├── plan.md
├── tasks.md
├── data-model.md
├── api-contract.md
├── test-plan.md
└── security-notes.md
```

Este documento corresponde a:

```text id="ezm9x7"
plan.md
```

---

## 8. Diseño de dominio

## 8.1. Entidad Tenant

Responsabilidad:

* representar el conjunto residencial;
* administrar estado;
* validar transiciones;
* mantener identidad del tenant;
* preservar datos base.

Campos principales:

```text id="f63ktw"
id
name
legalName
slug
status
timezone
currency
planCode
createdAt
updatedAt
suspendedAt
suspendedBy
suspensionReason
archivedAt
archivedBy
```

Métodos de dominio sugeridos:

```text id="bznpx8"
activate()
suspend(reason, actorId)
reactivate(actorId)
archive(actorId)
rename(name)
changeSlug(slug)
updateTimezone(timezone)
updateCurrency(currency)
isActive()
isSuspended()
isArchived()
canOperate()
```

---

## 8.2. Entidad TenantProfile

Responsabilidad:

* representar datos públicos o institucionales del tenant.

Campos:

```text id="df75uu"
id
tenantId
displayName
slogan
description
contactEmail
contactPhone
whatsapp
address
city
province
country
createdAt
updatedAt
```

---

## 8.3. Entidad TenantBranding

Responsabilidad:

* representar identidad visual del tenant.

Campos:

```text id="g5clu0"
id
tenantId
logoUrl
bannerUrl
primaryColor
secondaryColor
accentColor
createdAt
updatedAt
```

---

## 8.4. Entidad TenantConfiguration

Responsabilidad:

* representar configuración funcional base del tenant.

Campos:

```text id="wud92t"
id
tenantId
timezone
currency
defaultLanguage
allowResidentSelfRegistration
allowOnlinePayments
enableReservations
enableFines
enableMeetings
enableNotifications
createdAt
updatedAt
```

---

## 8.5. Entidad TenantWordPressMapping

Responsabilidad:

* representar la relación entre el tenant del Core y el CPT `conjunto` de WordPress.

Campos:

```text id="9x506z"
id
tenantId
wordpressSiteUrl
wordpressConjuntoSlug
wordpressConjuntoId
accessUrl
isActive
createdAt
updatedAt
```

---

## 9. Value Objects

## 9.1. TenantSlug

Reglas:

* minúsculas;
* sin tildes;
* sin espacios;
* guiones medios;
* no reservado;
* longitud mínima y máxima;
* caracteres permitidos.

Responsabilidades:

```text id="mn3b23"
normalize(input)
validate(input)
ensureNotReserved(input)
```

---

## 9.2. TenantStatus

Valores:

```text id="xt19i1"
pendingSetup
active
suspended
inactive
archived
```

Responsabilidades:

```text id="rg6sm8"
canActivate()
canSuspend()
canReactivate()
canArchive()
canOperate()
```

---

## 9.3. TenantCurrency

Inicialmente:

```text id="scs160"
USD
```

Futuro:

* soportar múltiples monedas solo mediante ADR o extensión de spec.

---

## 9.4. TenantTimezone

Default:

```text id="zxm33a"
America/Guayaquil
```

Debe validar timezones válidas.

---

## 9.5. TenantColor

Formato:

```text id="0l9ikk"
#RRGGBB
```

---

## 10. Modelo Prisma preliminar

La definición final irá en `data-model.md`, pero el plan técnico propone lo siguiente:

```prisma id="uu24pp"
model Tenant {
  id               String   @id @default(uuid())
  name             String
  legalName        String?
  slug             String   @unique
  status           String
  timezone         String   @default("America/Guayaquil")
  currency         String   @default("USD")
  planCode         String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  suspendedAt      DateTime?
  suspendedBy      String?
  suspensionReason String?
  archivedAt       DateTime?
  archivedBy       String?

  profile          TenantProfile?
  branding         TenantBranding?
  configuration    TenantConfiguration?
  wordpressMapping TenantWordPressMapping?

  @@index([slug])
  @@index([status])
  @@index([createdAt])
  @@map("tenants")
}
```

```prisma id="q6zjse"
model TenantProfile {
  id           String   @id @default(uuid())
  tenantId     String   @unique
  displayName  String
  slogan       String?
  description  String?
  contactEmail String?
  contactPhone String?
  whatsapp     String?
  address      String?
  city         String?
  province     String?
  country      String?  @default("Ecuador")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant       Tenant   @relation(fields: [tenantId], references: [id])

  @@map("tenant_profiles")
}
```

```prisma id="ypddg5"
model TenantBranding {
  id             String   @id @default(uuid())
  tenantId       String   @unique
  logoUrl        String?
  bannerUrl      String?
  primaryColor   String?
  secondaryColor String?
  accentColor    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant         Tenant   @relation(fields: [tenantId], references: [id])

  @@map("tenant_branding")
}
```

```prisma id="p3rf68"
model TenantConfiguration {
  id                            String   @id @default(uuid())
  tenantId                      String   @unique
  timezone                      String   @default("America/Guayaquil")
  currency                      String   @default("USD")
  defaultLanguage               String   @default("es")
  allowResidentSelfRegistration Boolean  @default(false)
  allowOnlinePayments           Boolean  @default(false)
  enableReservations            Boolean  @default(false)
  enableFines                   Boolean  @default(false)
  enableMeetings                Boolean  @default(false)
  enableNotifications           Boolean  @default(false)
  createdAt                     DateTime @default(now())
  updatedAt                     DateTime @updatedAt

  tenant                        Tenant   @relation(fields: [tenantId], references: [id])

  @@map("tenant_configurations")
}
```

```prisma id="wvl07s"
model TenantWordPressMapping {
  id                     String   @id @default(uuid())
  tenantId               String   @unique
  wordpressSiteUrl        String?
  wordpressConjuntoSlug   String?
  wordpressConjuntoId     String?
  accessUrl               String?
  isActive                Boolean  @default(false)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  tenant                  Tenant   @relation(fields: [tenantId], references: [id])

  @@index([wordpressConjuntoSlug])
  @@map("tenant_wordpress_mappings")
}
```

Notas:

* Los estados pueden modelarse inicialmente como `String`, pero se recomienda usar enums Prisma si no complican migraciones.
* La decisión final se documentará en `data-model.md`.
* No se debe usar cascade delete para tenant en entidades críticas futuras.

---

## 11. Casos de uso

## 11.1. CreateTenantUseCase

Responsabilidad:

* validar datos;
* normalizar slug;
* validar unicidad;
* crear tenant;
* crear profile;
* crear branding si aplica;
* crear configuration;
* crear WordPress mapping si aplica;
* resolver la identidad inicial mediante el puerto de directorio Keycloak;
* crear o enlazar UserProfile mediante `002-users-roles`;
* crear roles base, membership activa y asignación TenantAdmin;
* registrar auditoría;
* emitir evento.

Entrada:

```text id="750jbc"
CreateTenantDto
actorUserId
traceId
```

`CreateTenantDto` incluye `initialAdmin.email`, pero no acepta
`keycloakSubjectId`, roles, estado activo ni IDs internos. La resolución de
identidad ocurre antes de abrir la transacción.

Salida:

```text id="w9osr2"
TenantResponseDto
```

Errores:

```text id="jrj0ge"
TENANT_SLUG_ALREADY_EXISTS
TENANT_INVALID_SLUG
TENANT_INVALID_TIMEZONE
TENANT_INVALID_CURRENCY
TENANT_PERMISSION_DENIED
```

Transacción:

```text id="ii5e4r"
Sí. Tenant, entidades iniciales autorizadas, UserProfile, roles base,
membership, asignación TenantAdmin y auditoría se confirman o revierten juntos
en PostgreSQL.
```

---

## 11.2. UpdateTenantUseCase

Responsabilidad:

* actualizar datos administrativos;
* validar estado;
* registrar auditoría;
* emitir evento si corresponde.

---

## 11.3. ActivateTenantUseCase

Responsabilidad:

* validar estado actual;
* validar configuración mínima;
* validar existencia de roles base;
* validar existencia de membership activa con TenantAdmin activo;
* activar tenant;
* registrar auditoría;
* emitir evento.

No se permite placeholder ni invitación pendiente como prueba de administrador.

---

## 11.4. SuspendTenantUseCase

Responsabilidad:

* validar permiso global;
* validar estado actual;
* requerir motivo;
* suspender tenant;
* bloquear operaciones ordinarias posteriores;
* registrar auditoría;
* emitir evento.

---

## 11.5. ReactivateTenantUseCase

Responsabilidad:

* validar estado actual;
* validar configuración mínima;
* reactivar tenant;
* registrar auditoría;
* emitir evento.

---

## 11.6. ArchiveTenantUseCase

Responsabilidad:

* validar permiso global;
* validar estado;
* archivar tenant;
* registrar auditoría;
* emitir evento;
* impedir operación ordinaria.

No debe eliminar registros físicos.

---

## 11.7. GetPublicTenantProfileUseCase

Responsabilidad:

* buscar tenant por slug;
* validar exposición pública;
* devolver únicamente campos públicos;
* no exponer datos internos.

---

## 11.8. UpdateTenantProfileUseCase

Responsabilidad:

* actualizar datos institucionales;
* validar que actor pueda operar sobre tenant;
* registrar auditoría;
* emitir evento.

---

## 11.9. UpdateTenantBrandingUseCase

Responsabilidad:

* actualizar branding;
* validar URLs;
* validar colores;
* registrar auditoría.

---

## 11.10. UpdateTenantConfigurationUseCase

Responsabilidad:

* actualizar configuración funcional básica;
* validar permisos;
* registrar auditoría.

---

## 11.11. UpdateWordPressMappingUseCase

Responsabilidad:

* actualizar URL del portal WordPress;
* actualizar slug CPT;
* actualizar accessUrl;
* validar URLs;
* registrar auditoría.

---

## 12. Servicios de aplicación

## 12.1. TenantOnboardingService

Responsabilidad:

* orquestar creación de estructura inicial del tenant.

Operaciones:

```text id="r78x4p"
createDefaultConfiguration()
createDefaultProfile()
createDefaultBranding()
createDefaultWordPressMapping()
resolveInitialAdminIdentity()
createInitialAccessGraph()
```

`createInitialAccessGraph()` delega las escrituras de identidad, roles,
membership y asignación a `002-users-roles`, compartiendo la misma unidad de
trabajo PostgreSQL.

---

## 12.2. TenantStatusService

Responsabilidad:

* centralizar reglas de transición de estado.

Operaciones:

```text id="r7mzkj"
ensureCanActivate(tenant)
ensureCanSuspend(tenant)
ensureCanReactivate(tenant)
ensureCanArchive(tenant)
ensureTenantCanOperate(tenant)
```

---

## 12.3. TenantPublicProfileService

Responsabilidad:

* construir DTO público seguro para WordPress.

Debe excluir:

* IDs internos innecesarios;
* planCode;
* estado contractual;
* auditoría;
* configuraciones internas;
* datos financieros;
* roles;
* permisos.

---

## 12.4. TenantBaseRolesService

Responsabilidad:

* crear roles base del tenant.

Roles iniciales:

```text id="0m1vbj"
TenantAdmin
Treasurer
BoardMember
TenantAuditor
Resident
PropertyOwner
TenantStaff
Guard
ExternalAccountant
```

Nota:

La implementación pertenece a `002-users-roles`. Este servicio no tiene una
implementación placeholder y debe participar en la transacción de onboarding.

---

## 13. Repositorios

## 13.1. TenantRepository

Contrato sugerido:

```text id="s33k4t"
create(input)
findById(id)
findBySlug(slug)
findBySlugForPublicProfile(slug)
list(query)
update(id, input)
existsBySlug(slug)
activate(id, actorId)
suspend(id, reason, actorId)
reactivate(id, actorId)
archive(id, actorId)
```

---

## 13.2. Reglas de repositorio

* No retornar datos sensibles innecesarios.
* No eliminar tenants físicamente.
* Validar constraints mediante DB y aplicación.
* Manejar errores de unique constraint.
* Usar transacciones en creación/onboarding.
* No llamar Prisma directamente desde controladores.
* No saltarse casos de uso.

---

## 14. Controladores REST

## 14.1. PlatformTenantsController

Ruta base:

```text id="aenjux"
/api/v1/platform/tenants
```

Endpoints:

```text id="mkg6eh"
GET    /
POST   /
GET    /:tenantId
PATCH  /:tenantId
POST   /:tenantId/activate
POST   /:tenantId/suspend
POST   /:tenantId/reactivate
POST   /:tenantId/archive
```

Responsabilidad:

* operaciones globales de plataforma.

---

## 14.2. TenantsController

Ruta base:

```text id="kki78b"
/api/v1/tenant
```

Endpoints:

```text id="rdkpgb"
GET    /profile
PATCH  /profile
GET    /branding
PATCH  /branding
GET    /configuration
PATCH  /configuration
PATCH  /wordpress-mapping
```

Responsabilidad:

* operaciones del tenant activo.

---

## 14.3. PublicTenantsController

Ruta base:

```text id="aquda6"
/api/v1/public/tenants
```

Endpoint:

```text id="dwn1io"
GET /:slug
```

Responsabilidad:

* perfil público del tenant para WordPress u otros consumidores públicos.

---

## 15. DTOs

## 15.1. CreateTenantDto

Campos:

```text id="81zw8o"
name
legalName
slug
timezone
currency
profile
branding
wordpressMapping
```

Validaciones:

* `name` requerido.
* `slug` opcional, si no viene se genera.
* `timezone` default `America/Guayaquil`.
* `currency` default `USD`.

---

## 15.2. UpdateTenantDto

Campos permitidos:

```text id="h9td3c"
name
legalName
timezone
currency
planCode
```

No permitir modificar:

```text id="assmfl"
id
createdAt
archivedAt
suspendedBy
archivedBy
```

---

## 15.3. SuspendTenantDto

Campos:

```text id="wztbzv"
reason
```

Regla:

* `reason` requerido.

---

## 15.4. UpdateTenantProfileDto

Campos:

```text id="7ys80o"
displayName
slogan
description
contactEmail
contactPhone
whatsapp
address
city
province
country
```

---

## 15.5. UpdateTenantBrandingDto

Campos:

```text id="kvn09p"
logoUrl
bannerUrl
primaryColor
secondaryColor
accentColor
```

---

## 15.6. UpdateTenantConfigurationDto

Campos:

```text id="37nmgu"
timezone
currency
defaultLanguage
allowResidentSelfRegistration
allowOnlinePayments
enableReservations
enableFines
enableMeetings
enableNotifications
```

---

## 15.7. UpdateWordPressMappingDto

Campos:

```text id="the8g6"
wordpressSiteUrl
wordpressConjuntoSlug
wordpressConjuntoId
accessUrl
isActive
```

---

## 16. Autenticación

### 16.1. Endpoints privados

Requieren autenticación.

MVP:

```text id="dp1ndt"
Auth propia temporal o mock auth en tests.
```

Objetivo:

```text id="kaaj1f"
Bearer token emitido por Keycloak.
```

---

### 16.2. Endpoint público

No requiere autenticación:

```text id="vwzrs0"
GET /api/v1/public/tenants/{slug}
```

Debe tener:

* rate limiting;
* respuesta limitada;
* CORS controlado;
* logs sanitizados.

---

## 17. Autorización

## 17.1. Permisos globales

```text id="hc50qp"
platform.tenants.create
platform.tenants.read
platform.tenants.update
platform.tenants.activate
platform.tenants.suspend
platform.tenants.reactivate
platform.tenants.archive
```

---

## 17.2. Permisos tenant-scoped

```text id="ht45vp"
tenants.profile.read
tenants.profile.update
tenants.branding.read
tenants.branding.update
tenants.configuration.read
tenants.configuration.update
tenants.wordpress.update
```

---

## 17.3. Guards esperados

```text id="4tj6xh"
AuthGuard
PlatformPermissionGuard
TenantGuard
TenantPermissionGuard
```

---

## 17.4. Reglas

* PlatformAdmin puede operar sobre tenants globalmente.
* TenantAdmin solo puede operar sobre su tenant activo.
* TenantAdmin no puede suspender, reactivar ni archivar tenants.
* WordPress no autoriza.
* Token válido no implica permiso.
* Permiso de un tenant no aplica a otro tenant.

---

## 18. Auditoría

## 18.1. Adaptador

Crear adapter:

```text id="dugnwn"
TenantAuditAdapter
```

Inicialmente puede delegar a un servicio genérico de auditoría si ya existe o usar puerto temporal.

---

## 18.2. Eventos auditables

```text id="t0pt4l"
tenant.created
tenant.updated
tenant.activated
tenant.suspended
tenant.reactivated
tenant.archived
tenant.profile.updated
tenant.branding.updated
tenant.configuration.updated
tenant.wordpressMapping.updated
tenant.baseRoles.created
```

---

## 18.3. Campos mínimos

```text id="vuvl53"
tenantId
actorUserId
action
resourceType
resourceId
oldValue
newValue
result
reason
traceId
occurredAt
```

---

## 19. Eventos de dominio

## 19.1. Eventos iniciales

```text id="k1fwnc"
TenantCreated
TenantActivated
TenantSuspended
TenantReactivated
TenantArchived
TenantProfileUpdated
TenantBrandingUpdated
TenantConfigurationUpdated
TenantWordPressMappingUpdated
TenantBaseRolesCreated
```

---

## 19.2. Implementación inicial

En el MVP, los eventos pueden ser internos y síncronos/asíncronos simples.

No es obligatorio implementar broker externo.

Debe evitarse acoplar directamente:

```text id="n9bg0q"
TenantCreated → n8n directo
```

Preferir puerto:

```text id="wvjlu2"
TenantEventsPort
```

---

## 20. Observabilidad

## 20.1. Logs

Registrar:

* creación;
* activación;
* suspensión;
* reactivación;
* archivado;
* errores;
* intentos no autorizados;
* acceso a perfil público;
* cambios de WordPress mapping.

No registrar:

* tokens;
* secrets;
* payloads sensibles completos.

---

## 20.2. Métricas

Métricas sugeridas:

```text id="9w19i2"
tenants_created_total
tenants_activated_total
tenants_suspended_total
tenants_reactivated_total
tenants_archived_total
tenants_public_profile_requests_total
tenants_public_profile_errors_total
```

---

## 20.3. Trace

Todos los casos de uso deben recibir o generar:

```text id="9ofays"
traceId
```

---

## 21. Seguridad

## 21.1. Controles

* Validación estricta de DTO.
* Rate limiting endpoint público.
* Slugs reservados.
* URLs HTTPS en producción.
* Sanitización de logs.
* Autorización por permiso.
* Validación de tenant activo.
* Auditoría.
* Pruebas negativas.
* No eliminación física.

---

## 21.2. Riesgos críticos

| Riesgo                                              | Mitigación                          |
| --------------------------------------------------- | ----------------------------------- |
| TenantAdmin modifica tenant ajeno                   | TenantGuard + tests multitenant     |
| Endpoint público expone datos internos              | DTO público específico              |
| Slug duplicado                                      | Constraint DB + validación          |
| Suspensión accidental                               | Permiso global + auditoría + motivo |
| Datos de WordPress usados como fuente transaccional | Solo mapping público                |
| Logs con datos sensibles                            | Sanitización                        |

---

## 22. Integración con WordPress

## 22.1. Objetivo inicial

Permitir que WordPress consulte perfil público:

```text id="z9q6pl"
GET /api/v1/public/tenants/{slug}
```

---

## 22.2. Mapeo

El vínculo recomendado es:

```text id="2exd0g"
WordPress CPT conjunto.slug = Tenant.slug
```

---

## 22.3. Access URL

El Core puede devolver:

```text id="oxxh0m"
https://app.resident.example.com/login?tenant={slug}
```

o valor configurado en `TenantWordPressMapping.accessUrl`.

---

## 22.4. Regla

WordPress no puede:

* autenticar usuarios del Core;
* autorizar pagos;
* consultar saldos;
* consultar residentes;
* consultar comprobantes;
* acceder a PostgreSQL;
* modificar tenant sin API autorizada.

---

## 23. Integración con Keycloak

La spec no requiere crear realm ni clients.

Debe prepararse para:

* recibir `sub` de Keycloak;
* validar actor;
* mapear usuario local futuro;
* no guardar contraseñas en tenants;
* no depender de auth propia para reglas de negocio.

---

## 24. Integración transaccional con identidad y acceso

La creación de roles, perfiles y membresías pertenece a:

```text id="8yd1rm"
002-users-roles
```

Spec 001 conserva un puerto de orquestación:

```text id="f4x5ht"
TenantBaseRolesPort
```

Su implementación real por Spec 002 debe crear, dentro de la unidad de trabajo
recibida:

```text id="6lz594"
UserProfile creado o enlazado
roles y permisos base del tenant
UserTenantMembership activa
MembershipRole TenantAdmin activa
```

El contrato completo, preflight y recuperación se define en
`docs/changes/GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md`. No existe una opción
de persistencia parcial ni un evento que complete pasos obligatorios después del
commit.

---

## 25. Migraciones

## 25.1. Migración inicial

Crear migración:

```text id="s59i7h"
001_create_tenants
```

Tablas:

```text id="wpgcl4"
tenants
tenant_profiles
tenant_branding
tenant_configurations
tenant_wordpress_mappings
```

---

## 25.2. Constraints

```text id="sqg6tx"
unique(tenants.slug)
unique(tenant_profiles.tenant_id)
unique(tenant_branding.tenant_id)
unique(tenant_configurations.tenant_id)
unique(tenant_wordpress_mappings.tenant_id)
```

---

## 25.3. Índices

```text id="jrjfnh"
tenants.slug
tenants.status
tenants.created_at
tenant_wordpress_mappings.wordpress_conjunto_slug
```

---

## 25.4. Reglas

* Revisar SQL generado.
* Ejecutar migración en local.
* Ejecutar migration test.
* No usar cascade delete peligroso.
* No eliminar tenant físicamente.

---

## 26. Seeds

Crear datos ficticios para desarrollo:

```text id="3wil5l"
Villa Club Demo
Altos del Norte Demo
Jardines del Valle Demo
Portal del Río Demo
Tenant Suspendido Demo
```

No usar datos reales.

---

## 27. Testing plan resumido

El documento completo estará en:

```text id="hvfkkh"
docs/specs/001-tenants/test-plan.md
```

### 27.1. Unit tests

* slug normalization;
* slug reserved;
* tenant status transitions;
* timezone validation;
* currency validation;
* color validation;
* URL validation;
* public profile mapping.

### 27.2. Integration tests

* create tenant transaction;
* create profile/config/branding/mapping;
* slug unique;
* audit events;
* domain events.

### 27.3. API tests

* platform CRUD;
* state transitions;
* public endpoint.

### 27.4. Authorization tests

* platform permissions;
* tenant permissions;
* no token;
* wrong permission;
* wrong tenant.

### 27.5. Multitenancy tests

* TenantAdmin A cannot update Tenant B.
* Public profile A does not expose B.
* Mapping A does not affect B.

### 27.6. Security tests

* malicious slug;
* invalid URLs;
* public endpoint data exposure;
* large payload;
* rate limiting.

---

## 28. Orden recomendado de desarrollo

### Fase 1 — Preparación

```text id="14bs6c"
1. Crear carpeta docs/specs/001-tenants.
2. Crear spec.md.
3. Crear plan.md.
4. Crear data-model.md.
5. Crear api-contract.md.
6. Crear test-plan.md.
7. Crear tasks.md.
```

---

### Fase 2 — Base técnica

```text id="d5n3qh"
1. Crear módulo NestJS tenants.
2. Crear estructura de carpetas.
3. Crear DTOs.
4. Crear value objects.
5. Crear errores de dominio.
6. Crear interfaces de repositorio/puertos.
```

---

### Fase 3 — Persistencia

```text id="fj5fl0"
1. Crear modelos Prisma.
2. Crear migración.
3. Crear PrismaTenantRepository.
4. Crear mappers.
5. Crear seeds ficticios.
6. Crear migration tests.
```

---

### Fase 4 — Casos de uso

```text id="7s2ezr"
1. Implementar CreateTenantUseCase.
2. Implementar ListTenantsUseCase.
3. Implementar GetTenantUseCase.
4. Implementar UpdateTenantUseCase.
5. Implementar ActivateTenantUseCase.
6. Implementar SuspendTenantUseCase.
7. Implementar ReactivateTenantUseCase.
8. Implementar ArchiveTenantUseCase.
9. Implementar GetPublicTenantProfileUseCase.
10. Implementar update profile/branding/config/mapping.
```

---

### Fase 5 — API

```text id="y8toqt"
1. Crear PlatformTenantsController.
2. Crear TenantsController.
3. Crear PublicTenantsController.
4. Agregar guards.
5. Agregar decorators.
6. Agregar OpenAPI.
7. Validar errores estándar.
```

---

### Fase 6 — Auditoría y eventos

```text id="2bilci"
1. Crear TenantAuditPort.
2. Crear adapter temporal.
3. Registrar eventos auditables.
4. Crear TenantEventsPort.
5. Emitir eventos internos.
```

---

### Fase 7 — Pruebas

```text id="af8iuo"
1. Unit tests.
2. Integration tests.
3. API tests.
4. Authorization tests.
5. Multitenancy tests.
6. Security tests.
7. Contract test del endpoint público.
```

---

### Fase 8 — CI/CD

```text id="2eo477"
1. Agregar comandos de test.
2. Agregar validación OpenAPI.
3. Agregar migración en CI.
4. Validar build.
```

---

## 29. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* módulo NestJS creado;
* modelos Prisma creados;
* migración aplicada;
* repositorio implementado;
* use cases implementados;
* endpoints privados implementados;
* endpoint público implementado;
* autorización aplicada;
* auditoría aplicada;
* eventos emitidos;
* DTOs validados;
* errores normalizados;
* OpenAPI actualizado;
* tests unitarios pasan;
* tests integración pasan;
* tests autorización pasan;
* tests multitenancy pasan;
* tests seguridad básicos pasan;
* CI pasa.

---

## 30. Comandos esperados

Los nombres finales pueden variar, pero se esperan comandos equivalentes:

```bash id="2xt4dp"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run openapi:validate
npm run prisma:migrate:dev
npm run build
```

---

## 31. Riesgos de implementación

| Riesgo                                   | Impacto | Mitigación             |
| ---------------------------------------- | ------- | ---------------------- |
| Crear tenants sin slug único             | Medio   | Constraint DB + test   |
| Mezclar plataforma y tenant endpoints    | Alto    | Controllers separados  |
| TenantAdmin actualiza tenant ajeno       | Crítico | TenantGuard + tests    |
| Endpoint público expone datos internos   | Alto    | DTO público específico |
| Implementar roles base antes de spec 002 | Medio   | Puerto temporal        |
| No auditar suspensión/reactivación       | Alto    | AuditPort obligatorio  |
| Eliminar tenant físicamente              | Crítico | Solo archivado         |
| WordPress tratado como fuente de verdad  | Alto    | Mapping limitado       |
| Código IA omite autorización             | Alto    | Tests + CI + ADR-007   |
| Activar tenant incompleto                | Medio   | Validation service     |

---

## 32. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="gu5g4y"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/specs/001-tenants/spec.md
docs/specs/001-tenants/plan.md
```

El agente no debe:

* crear endpoints sin autorización;
* usar WordPress como fuente de verdad;
* eliminar tenants físicamente;
* exponer datos internos en perfil público;
* omitir tests;
* omitir auditoría;
* acoplar Keycloak directamente al dominio;
* implementar billing SaaS no solicitado;
* crear microservicio separado;
* crear roles completos sin spec 002;
* cambiar ADRs sin justificación.

---

## 33. Dependencias internas futuras

Este módulo será consumido por:

```text id="xspug9"
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-wordpress-integration
```

---

## 34. Dependencias externas

Dependencias externas directas:

```text id="6ptktj"
PostgreSQL
Prisma
Redis futuro para cache/rate limit
WordPress portal como consumidor público
Keycloak futuro para identidad
n8n futuro para automatizaciones
```

---

## 35. Estrategia de entrega

La entrega del módulo se puede dividir en incrementos:

### Incremento 1 — Modelo y creación básica

* Tenant.
* Profile.
* Branding.
* Configuration.
* WordPress mapping.
* Create tenant.
* List/get tenant.
* Public profile.

### Incremento 2 — Estados

* Activate.
* Suspend.
* Reactivate.
* Archive.
* Status rules.
* Audit.

### Incremento 3 — Configuración tenant

* Update profile.
* Update branding.
* Update configuration.
* Update WordPress mapping.
* TenantAdmin scoped access.

### Incremento 4 — Pruebas y hardening

* Authorization tests.
* Multitenancy tests.
* Security tests.
* Contract tests.
* OpenAPI validation.

---

## 36. Pendientes para documentos derivados

### 36.1. `data-model.md`

Debe detallar:

* modelo conceptual;
* tablas;
* constraints;
* índices;
* enums;
* relaciones;
* migraciones;
* seeds.

### 36.2. `api-contract.md`

Debe detallar:

* endpoints;
* requests;
* responses;
* errores;
* status codes;
* permisos;
* OpenAPI.

### 36.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* multitenancy tests;
* security tests;
* contract tests.

### 36.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

### 36.5. `security-notes.md`

Debe detallar amenazas específicas y controles.

---

## 37. Decisión final de implementación

El módulo `001-tenants` se implementará como módulo interno de NestJS dentro del monolito modular de RESIDENT Core.

Tendrá controladores separados para:

* plataforma;
* tenant activo;
* endpoint público.

Usará PostgreSQL y Prisma para persistencia, con tablas separadas para tenant, perfil, branding, configuración y mapeo WordPress.

La autorización seguirá el principio:

```text id="18jhft"
Keycloak autentica.
RESIDENT Core autoriza.
```

La primera versión delegará a `002-users-roles` la propiedad de roles,
permisos y membresías mediante un puerto real que participa en la misma
transacción de onboarding; no se admite implementación temporal.

El módulo no permitirá eliminación física de tenants y deberá auditar todos los cambios críticos.

Esta implementación habilitará el resto de módulos funcionales del sistema RESIDENT Core.
