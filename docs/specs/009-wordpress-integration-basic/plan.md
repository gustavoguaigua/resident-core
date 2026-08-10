# Plan — Spec 009 WordPress Integration Basic

## 1. Información del documento

| Campo                 | Valor                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                  |
| Spec ID               | 009                                                                                            |
| Módulo                | WordPress Integration Basic                                                                    |
| Documento             | Implementation Plan                                                                            |
| Ruta                  | `docs/specs/009-wordpress-integration-basic/plan.md`                                           |
| Versión               | 0.1                                                                                            |
| Estado                | needs-review                                                                                   |
| Fecha                 | 2026-07-14                                                                                     |
| Documento base        | `docs/specs/009-wordpress-integration-basic/spec.md`                                           |
| Depende de            | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `008-basic-reports` |
| Arquitectura          | Monolito modular NestJS                                                                        |
| Base de datos         | PostgreSQL + Prisma                                                                            |
| API Style             | REST                                                                                           |
| Integración externa   | WordPress                                                                                      |
| Naturaleza del módulo | Public-safe / Read-only para WordPress                                                         |
| Prioridad             | Alta                                                                                           |

---

## 2. Propósito

Este documento transforma la especificación funcional `009-wordpress-integration-basic/spec.md` en un plan técnico de implementación.

El módulo `009-wordpress-integration-basic` debe habilitar la integración inicial entre:

```text id="lqsnh2"
Portal WordPress multitenant
    ↔
RESIDENT Core
```

El objetivo es permitir que WordPress consuma datos públicos y controlados de RESIDENT Core mediante API REST, sin acceder directamente a la base de datos, sin exponer datos financieros, sin exponer datos personales privados y sin convertir WordPress en fuente transaccional.

Regla central:

```text id="f3u42k"
WordPress es la capa pública e informativa; RESIDENT Core es la fuente de verdad transaccional, operativa, financiera y de seguridad.
```

---

## 3. Resumen de implementación

El módulo se implementará como una extensión del bounded context:

```text id="yqrczg"
External Integrations
```

Nombre técnico recomendado:

```text id="ck5mmb"
wordpress-integration
```

Ruta recomendada:

```text id="f0mmb3"
apps/api/src/modules/integrations/wordpress/
```

Componentes principales:

```text id="ybn9ao"
WordPressIntegrationModule
PublicWordPressController
TenantWordPressIntegrationController
PlatformWordPressIntegrationController
WordPressPublicTenantService
WordPressPublicProfileService
WordPressMappingService
WordPressCorsPolicyService
WordPressCachePolicyService
WordPressRateLimitPolicyService
WordPressPublicDtoMapper
WordPressIntegrationAuditService
```

Naturaleza del módulo:

```text id="scv4l5"
public-safe
tenant-resolved-by-slug
read-only for public endpoints
permissioned for mapping configuration
CORS-restricted
rate-limited
cacheable
auditable for configuration changes
no financial data
no private personal data
```

Relación conceptual:

```text id="y6brrg"
WordPress CPT conjunto
    ↓ slug
RESIDENT Core Public API
    ↓ tenant resolver
Tenant public profile / branding / contact / public content
```

---

## 4. Decisiones técnicas aplicables

El módulo debe cumplir con:

```text id="y8q2m4"
ADR-001 — Architecture Style
ADR-002 — Backend Framework
ADR-003 — Database Strategy
ADR-004 — Multitenancy Strategy
ADR-007 — Authorization Strategy
ADR-010 — Observability Strategy
ADR-011 — Testing Strategy
ADR-012 — CI/CD Strategy
```

Reglas clave:

* usar REST;
* no usar GraphQL en MVP;
* resolver tenant público por `slug`;
* no exponer datos financieros;
* no exponer datos personales privados;
* no permitir escritura pública;
* no permitir acceso directo a PostgreSQL desde WordPress;
* no requerir token de usuario final para endpoints públicos;
* aplicar rate limiting en endpoints públicos;
* restringir CORS;
* permitir cache controlado;
* auditar cambios de mapping;
* preparar extensión futura hacia Keycloak/SSO;
* permitir fallback local ACF en WordPress si Core no responde.

---

## 5. Alcance técnico

### 5.1. Incluido

La implementación inicial cubre:

```text id="o6lxcr"
Public tenant resolver by slug
Public tenant profile endpoint
Public branding endpoint
Public contact endpoint
Public announcements endpoint
Public announcement detail endpoint
Public common areas endpoint
Public common area detail endpoint
Public links endpoint
Tenant WordPress mapping read/update
Platform WordPress mapping read/update
CORS origin policy
Public endpoint rate limiting
Public endpoint cache headers
Safe DTO mapping
Audit mapping changes
OpenAPI public-safe documentation
Unit tests
Integration tests
API tests
CORS tests
Security tests
Multitenancy tests
```

---

### 5.2. Diferido

No se implementará todavía:

```text id="zunqyp"
SSO completo con Keycloak
login de residentes desde WordPress
portal transaccional embebido
pagos desde WordPress
reservas desde WordPress
consulta de saldos desde WordPress
consulta de estados de cuenta desde WordPress
consulta de comprobantes desde WordPress
plugin WordPress avanzado
bloques Gutenberg propios
shortcodes avanzados
GraphQL
webhooks bidireccionales avanzados
sincronización automática completa
cache invalidation con LiteSpeed purge
administración de tenants desde WordPress
```

---

## 6. Estructura de carpetas recomendada

```text id="hbbg42"
apps/api/src/modules/integrations/wordpress/
├── wordpress-integration.module.ts
│
├── public-wordpress.controller.ts
├── tenant-wordpress-integration.controller.ts
├── platform-wordpress-integration.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── get-public-tenant.use-case.ts
│   │   ├── get-public-tenant-branding.use-case.ts
│   │   ├── get-public-tenant-contact.use-case.ts
│   │   ├── list-public-announcements.use-case.ts
│   │   ├── get-public-announcement.use-case.ts
│   │   ├── list-public-common-areas.use-case.ts
│   │   ├── get-public-common-area.use-case.ts
│   │   ├── get-public-tenant-links.use-case.ts
│   │   ├── get-tenant-wordpress-mapping.use-case.ts
│   │   ├── update-tenant-wordpress-mapping.use-case.ts
│   │   ├── get-platform-wordpress-mapping.use-case.ts
│   │   └── update-platform-wordpress-mapping.use-case.ts
│   │
│   ├── services/
│   │   ├── wordpress-public-tenant.service.ts
│   │   ├── wordpress-public-profile.service.ts
│   │   ├── wordpress-mapping.service.ts
│   │   ├── wordpress-cors-policy.service.ts
│   │   ├── wordpress-cache-policy.service.ts
│   │   ├── wordpress-rate-limit-policy.service.ts
│   │   ├── wordpress-public-dto-mapper.service.ts
│   │   ├── wordpress-field-classification.service.ts
│   │   └── wordpress-integration-audit.service.ts
│   │
│   └── ports/
│       ├── wordpress-public-reader.port.ts
│       ├── wordpress-mapping-reader.port.ts
│       ├── wordpress-mapping-writer.port.ts
│       ├── wordpress-origin-policy.port.ts
│       ├── wordpress-cache-policy.port.ts
│       └── wordpress-audit.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── wordpress-public-tenant.entity.ts
│   │   ├── wordpress-public-profile.entity.ts
│   │   ├── wordpress-branding.entity.ts
│   │   ├── wordpress-contact.entity.ts
│   │   ├── wordpress-mapping.entity.ts
│   │   ├── wordpress-public-announcement.entity.ts
│   │   └── wordpress-public-common-area.entity.ts
│   │
│   ├── value-objects/
│   │   ├── wordpress-slug.vo.ts
│   │   ├── wordpress-url.vo.ts
│   │   ├── wordpress-origin.vo.ts
│   │   ├── public-visibility.vo.ts
│   │   ├── public-field-classification.vo.ts
│   │   ├── public-cache-policy.vo.ts
│   │   └── public-link.vo.ts
│   │
│   ├── events/
│   │   ├── wordpress-mapping-updated.event.ts
│   │   ├── tenant-public-profile-updated.event.ts
│   │   ├── wordpress-origin-denied.event.ts
│   │   └── wordpress-public-endpoint-access-denied.event.ts
│   │
│   └── errors/
│       ├── public-tenant-not-found.error.ts
│       ├── public-tenant-not-visible.error.ts
│       ├── wordpress-slug-invalid.error.ts
│       ├── wordpress-origin-denied.error.ts
│       ├── wordpress-mapping-not-found.error.ts
│       ├── wordpress-mapping-duplicate.error.ts
│       ├── wordpress-mapping-forbidden.error.ts
│       └── public-resource-not-found.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-wordpress-public.repository.ts
│   │   ├── prisma-wordpress-mapping.repository.ts
│   │   └── wordpress.mapper.ts
│   │
│   ├── cache/
│   │   └── wordpress-cache-header.adapter.ts
│   │
│   └── audit/
│       └── wordpress-audit.adapter.ts
│
├── policies/
│   ├── wordpress-cors.guard.ts
│   ├── wordpress-public-rate-limit.guard.ts
│   ├── wordpress-mapping-permission.guard.ts
│   └── platform-wordpress-mapping-permission.guard.ts
│
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="x0gn0u"
docs/specs/009-wordpress-integration-basic/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="p0rrbx"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. WordPressPublicTenant

Vista pública de un tenant.

Campos conceptuales:

```text id="j7k35w"
tenantPublicId
slug
publicName
publicStatus
slogan
publicDescription
websiteUrl
residentPortalUrl
isPublicVisible
```

Reglas:

* No exponer identificadores internos innecesarios.
* No exponer estado operacional interno completo.
* Solo tenants activos y visibles pueden publicarse.
* No incluir datos financieros.
* No incluir datos personales privados.

---

## 8.2. WordPressPublicProfile

Perfil público ampliado.

Campos:

```text id="v5e67u"
tenantPublicId
slug
publicName
slogan
publicDescription
history
mission
vision
publicRulesSummary
branding
contact
links
```

---

## 8.3. WordPressBranding

Campos:

```text id="ohzvvz"
logoUrl
bannerUrl
primaryColor
secondaryColor
galleryUrls
```

Reglas:

* URLs públicas o firmadas según política.
* No exponer rutas internas de storage.
* Validar formato de colores.
* Validar URLs.

---

## 8.4. WordPressContact

Campos:

```text id="aec78j"
publicEmail
publicPhone
publicWhatsapp
publicAddress
socialLinks
```

Reglas:

* Solo contactos institucionales.
* No contactos personales de residentes o administradores.
* URLs de redes deben validarse.

---

## 8.5. WordPressMapping

Campos conceptuales:

```text id="r1iwns"
tenantId
wordpressSlug
wordpressUrl
wordpressAllowedOrigin
externalPublicId
isPublicVisible
lastSyncedAt nullable
createdAt
updatedAt
```

Reglas:

* `wordpressSlug` único cuando aplique.
* `wordpressAllowedOrigin` debe ser HTTPS en producción.
* Cambios deben auditarse.
* Solo usuarios autorizados pueden modificar.

---

## 8.6. WordPressPublicAnnouncement

Campos:

```text id="jbtmzz"
id
slug
title
summary
content
publishedAt
coverImageUrl
category
```

Reglas:

* Solo `visibility = public`.
* Solo `status = published`.
* Debe pertenecer al tenant resuelto.
* No debe incluir adjuntos privados.

---

## 8.7. WordPressPublicCommonArea

Campos:

```text id="j20x7e"
id
slug
name
description
coverImageUrl
galleryUrls
publicRulesSummary
isPublicVisible
```

Reglas:

* Solo áreas activas.
* Solo áreas con `isPublicVisible = true`.
* No exponer disponibilidad interna sensible.
* No permitir reservas desde esta spec.

---

# 9. Value Objects

## 9.1. WordPressSlug

Responsabilidad:

* validar formato de slug;
* normalizar minúsculas;
* impedir caracteres peligrosos;
* impedir path traversal;
* impedir slashes.

Reglas:

```text id="a2f8pi"
lowercase
letters
numbers
hyphen
max length configurable
```

Ejemplo válido:

```text id="gy00h6"
san-jose-la-salle-2
```

Ejemplos inválidos:

```text id="y5x03w"
../tenant
Tenant Admin
<script>
tenant/other
```

---

## 9.2. WordPressUrl

Responsabilidad:

* validar URL;
* exigir HTTPS en producción;
* impedir esquemas peligrosos.

Permitido:

```text id="p3c45z"
https://www.resident.gustavoguaigua.com
```

Prohibido:

```text id="qyq4rb"
javascript:
file:
ftp:
http en producción
```

---

## 9.3. WordPressOrigin

Responsabilidad:

* validar origin CORS;
* comparar contra allowlist;
* normalizar host;
* impedir wildcard en producción.

Prohibido:

```text id="jzdlij"
*
null
file://
```

---

## 9.4. PublicVisibility

Valores:

```text id="r4xu8b"
visible
hidden
restricted
```

Reglas:

* solo `visible` puede salir en endpoints públicos ordinarios;
* `restricted` queda para integraciones futuras;
* `hidden` no se expone.

---

## 9.5. PublicFieldClassification

Valores:

```text id="lonxti"
public
publicDerived
restricted
private
sensitive
```

Regla:

```text id="zfzwjw"
Solo public y publicDerived pueden exponerse en endpoints públicos.
```

---

## 9.6. PublicCachePolicy

Campos:

```text id="bmm59l"
cacheable
maxAgeSeconds
etagEnabled
lastModifiedEnabled
```

Reglas:

* no cachear datos privados;
* TTL corto en MVP;
* permitir invalidación futura.

---

## 9.7. PublicLink

Campos:

```text id="m2jjfj"
label
url
type
isExternal
```

Reglas:

* no incluir tokens;
* no incluir URLs internas;
* validar esquema HTTPS;
* permitir enlace futuro a portal de residentes.

---

# 10. Modelo de datos y persistencia

## 10.1. Decisión preliminar

Para MVP se recomienda extender el modelo `Tenant` con campos públicos e integración WordPress.

Campos candidatos:

```text id="gid81t"
publicName
publicDescription
publicEmail
publicPhone
publicWhatsapp
publicAddress
websiteUrl
residentPortalUrl
wordpressSlug
wordpressUrl
wordpressAllowedOrigin
isPublicVisible
publicMetadata
branding
```

---

## 10.2. Alternativa futura

Separar en tablas:

```text id="oczshn"
tenant_public_profiles
tenant_wordpress_mappings
```

Esta alternativa mejora separación, pero agrega migración y modelos adicionales.

---

## 10.3. Decisión MVP recomendada

Usar tabla separada si se quiere limpieza de dominio desde el inicio:

```text id="ifqg6o"
tenant_public_profiles
tenant_wordpress_mappings
```

Motivo:

* evita inflar `tenants`;
* permite versionar visibilidad pública;
* permite auditar mapping;
* permite futura publicación/despublicación;
* separa datos platform de datos públicos;
* prepara integración WordPress y otros canales públicos.

La decisión final se detallará en `data-model.md`.

---

# 11. Puertos de aplicación

## 11.1. WordPressPublicReaderPort

Contrato conceptual:

```text id="cwr57l"
findPublicTenantBySlug(slug)
getPublicBrandingBySlug(slug)
getPublicContactBySlug(slug)
listPublicAnnouncements(slug, query)
getPublicAnnouncement(slug, announcementSlug)
listPublicCommonAreas(slug, query)
getPublicCommonArea(slug, commonAreaSlug)
getPublicLinks(slug)
```

Reglas:

* solo datos públicos;
* filtrar por tenant resuelto;
* no devolver datos sensibles;
* no depender de WordPress.

---

## 11.2. WordPressMappingReaderPort

Contrato:

```text id="n8bdpc"
getTenantWordPressMapping(tenantId)
getPlatformWordPressMapping(tenantId)
findMappingBySlug(slug)
findMappingByOrigin(origin)
```

---

## 11.3. WordPressMappingWriterPort

Contrato:

```text id="m8vk85"
updateTenantWordPressMapping(tenantId, input, actor)
updatePlatformWordPressMapping(tenantId, input, actor)
```

Reglas:

* validar permisos;
* validar duplicidad;
* auditar cambios;
* no aceptar URLs inseguras.

---

## 11.4. WordPressOriginPolicyPort

Contrato:

```text id="sux21r"
isOriginAllowed(origin, slug)
resolveAllowedOrigins(slug)
```

---

## 11.5. WordPressCachePolicyPort

Contrato:

```text id="yfl4gh"
getCachePolicy(endpoint, slug)
buildCacheHeaders(publicResource)
```

---

## 11.6. WordPressAuditPort

Contrato:

```text id="goyp2e"
auditMappingUpdated(...)
auditPublicProfileUpdated(...)
auditOriginDenied(...)
auditPublicAccessDenied(...)
```

---

# 12. Servicios de aplicación

## 12.1. WordPressPublicTenantService

Responsabilidad:

* resolver tenant por slug;
* validar estado activo;
* validar `isPublicVisible`;
* construir vista pública;
* devolver 404 seguro si no aplica.

---

## 12.2. WordPressPublicProfileService

Responsabilidad:

* construir perfil público;
* mapear branding;
* mapear contacto;
* mapear información institucional;
* aplicar allowlist de campos públicos.

---

## 12.3. WordPressMappingService

Responsabilidad:

* leer mapping del tenant;
* actualizar mapping del tenant;
* actualizar mapping desde platform;
* validar duplicidad;
* validar slug;
* validar URL;
* validar origin;
* auditar cambios.

---

## 12.4. WordPressCorsPolicyService

Responsabilidad:

* validar `Origin`;
* comparar contra orígenes permitidos;
* bloquear wildcard;
* devolver política CORS segura;
* registrar evento recomendado si origin es denegado.

---

## 12.5. WordPressCachePolicyService

Responsabilidad:

* definir headers por endpoint;
* generar `Cache-Control`;
* soportar `ETag` y `Last-Modified` si se implementa;
* evitar caché de errores sensibles.

---

## 12.6. WordPressRateLimitPolicyService

Responsabilidad:

* definir límites para endpoints públicos;
* definir límites reforzados para endpoints de detalle;
* evitar scraping;
* integrarse con rate limiting global.

---

## 12.7. WordPressPublicDtoMapperService

Responsabilidad:

* mapear entidades Core a DTOs públicos;
* aplicar field allowlist;
* remover datos privados;
* evitar IDs internos no necesarios;
* normalizar URLs.

---

## 12.8. WordPressFieldClassificationService

Responsabilidad:

* clasificar campos como public/publicDerived/restricted/private/sensitive;
* impedir exposición accidental;
* centralizar allowlist.

---

## 12.9. WordPressIntegrationAuditService

Responsabilidad:

* auditar cambios de mapping;
* auditar cambios de perfil público;
* auditar origin denied si aplica;
* no auditar cada visita pública ordinaria.

---

# 13. Casos de uso

## 13.1. GetPublicTenantUseCase

Endpoint:

```text id="d3tm3p"
GET /api/v1/public/tenants/{slug}
```

Responsabilidades:

* validar slug;
* resolver tenant;
* verificar estado activo;
* verificar visibilidad pública;
* devolver DTO público;
* aplicar cache headers;
* aplicar rate limiting.

---

## 13.2. GetPublicTenantBrandingUseCase

Endpoint:

```text id="gxncrr"
GET /api/v1/public/tenants/{slug}/branding
```

Responsabilidades:

* validar slug;
* resolver tenant;
* devolver logo/banner/colores/galería;
* no exponer storage interno;
* aplicar cache.

---

## 13.3. GetPublicTenantContactUseCase

Endpoint:

```text id="jze3jb"
GET /api/v1/public/tenants/{slug}/contact
```

Responsabilidades:

* devolver contactos institucionales;
* no devolver contactos personales;
* validar redes sociales;
* aplicar cache.

---

## 13.4. ListPublicAnnouncementsUseCase

Endpoint:

```text id="vlalmy"
GET /api/v1/public/tenants/{slug}/announcements
```

Responsabilidades:

* listar comunicados públicos;
* filtrar `visibility = public`;
* filtrar `status = published`;
* paginar;
* aplicar cache.

---

## 13.5. GetPublicAnnouncementUseCase

Endpoint:

```text id="x8kh2f"
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
```

Responsabilidades:

* validar tenant por slug;
* validar announcementSlug;
* devolver solo si es público y publicado;
* no devolver privados/draft.

---

## 13.6. ListPublicCommonAreasUseCase

Endpoint:

```text id="owz472"
GET /api/v1/public/tenants/{slug}/common-areas
```

Responsabilidades:

* listar áreas comunales públicas;
* filtrar `isPublicVisible = true`;
* filtrar `status = active`;
* no exponer disponibilidad privada;
* paginar si aplica.

---

## 13.7. GetPublicCommonAreaUseCase

Endpoint:

```text id="p9a805"
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Responsabilidades:

* validar tenant;
* validar área;
* devolver detalle público;
* no permitir reserva.

---

## 13.8. GetPublicTenantLinksUseCase

Endpoint:

```text id="dpt4x3"
GET /api/v1/public/tenants/{slug}/links
```

Responsabilidades:

* devolver enlaces públicos permitidos;
* incluir `residentPortalUrl` si existe;
* no incluir tokens;
* no incluir enlaces internos.

---

## 13.9. GetTenantWordPressMappingUseCase

Endpoint:

```text id="rko7aa"
GET /api/v1/tenant/integrations/wordpress
```

Responsabilidades:

* validar usuario autenticado;
* validar tenant activo;
* validar permiso `integrations.wordpress.read`;
* devolver mapping del tenant.

---

## 13.10. UpdateTenantWordPressMappingUseCase

Endpoint:

```text id="qo900m"
PATCH /api/v1/tenant/integrations/wordpress
```

Responsabilidades:

* validar permiso `integrations.wordpress.update`;
* validar slug;
* validar WordPress URL;
* validar allowed origin;
* validar duplicidad;
* actualizar mapping;
* auditar cambio.

---

## 13.11. GetPlatformWordPressMappingUseCase

Endpoint:

```text id="x125yb"
GET /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

Responsabilidades:

* validar permiso platform;
* consultar mapping por tenant;
* devolver configuración.

---

## 13.12. UpdatePlatformWordPressMappingUseCase

Endpoint:

```text id="ua3cmw"
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

Responsabilidades:

* validar permiso `integrations.wordpress.platform.update`;
* validar tenant;
* validar datos;
* actualizar mapping;
* auditar cambio platform.

---

# 14. Controladores REST

## 14.1. PublicWordPressController

Ruta base:

```text id="rkithj"
/api/v1/public/tenants
```

Endpoints:

```text id="pu17te"
GET /:slug
GET /:slug/branding
GET /:slug/contact
GET /:slug/announcements
GET /:slug/announcements/:announcementSlug
GET /:slug/common-areas
GET /:slug/common-areas/:commonAreaSlug
GET /:slug/links
```

Guards/policies:

```text id="ud9q7v"
WordPressPublicRateLimitGuard
WordPressCorsGuard si aplica en capa HTTP
SlugValidationPipe
PublicSafeResponseInterceptor
```

---

## 14.2. TenantWordPressIntegrationController

Ruta base:

```text id="fhqmqx"
/api/v1/tenant/integrations/wordpress
```

Endpoints:

```text id="u0fwkr"
GET /
PATCH /
```

Guards:

```text id="u992xj"
AuthGuard
TenantGuard
TenantPermissionGuard
WordPressMappingPermissionGuard
```

---

## 14.3. PlatformWordPressIntegrationController

Ruta base:

```text id="gqnvp6"
/api/v1/platform/tenants/:tenantId/integrations/wordpress
```

Endpoints:

```text id="xgifpv"
GET /
PATCH /
```

Guards:

```text id="e0rksx"
AuthGuard
PlatformPermissionGuard
PlatformWordPressMappingPermissionGuard
```

---

# 15. DTOs principales

## 15.1. PublicTenantDto

```json id="u57fc1"
{
  "tenantPublicId": "pub_tenant_uuid",
  "slug": "san-jose-la-salle-2",
  "publicName": "Conjunto Residencial San José La Salle 2",
  "slogan": "Comunidad residencial organizada",
  "publicDescription": "Información pública del conjunto.",
  "residentPortalUrl": "https://app.resident.example.com/login"
}
```

---

## 15.2. PublicBrandingDto

```json id="xfpyk9"
{
  "logoUrl": "https://cdn.example.com/logo.png",
  "bannerUrl": "https://cdn.example.com/banner.jpg",
  "primaryColor": "#0EA5E9",
  "secondaryColor": "#F59E0B",
  "galleryUrls": [
    "https://cdn.example.com/photo-1.jpg"
  ]
}
```

---

## 15.3. PublicContactDto

```json id="su4oej"
{
  "publicEmail": "administracion@example.com",
  "publicPhone": "+593999999999",
  "publicWhatsapp": "+593999999999",
  "publicAddress": "Dirección institucional",
  "socialLinks": {
    "facebook": "https://facebook.com/example",
    "instagram": "https://instagram.com/example",
    "youtube": "https://youtube.com/@example"
  }
}
```

---

## 15.4. PublicAnnouncementListItemDto

```json id="x4jzo0"
{
  "id": "announcement_public_id",
  "slug": "mantenimiento-programado",
  "title": "Mantenimiento programado",
  "summary": "Comunicado público de mantenimiento.",
  "publishedAt": "2026-07-14T10:00:00Z",
  "coverImageUrl": "https://cdn.example.com/announcement.jpg",
  "category": "general"
}
```

---

## 15.5. PublicAnnouncementDetailDto

```json id="d7y0pz"
{
  "id": "announcement_public_id",
  "slug": "mantenimiento-programado",
  "title": "Mantenimiento programado",
  "summary": "Comunicado público de mantenimiento.",
  "content": "Contenido público del comunicado.",
  "publishedAt": "2026-07-14T10:00:00Z",
  "coverImageUrl": "https://cdn.example.com/announcement.jpg",
  "category": "general"
}
```

---

## 15.6. PublicCommonAreaDto

```json id="xmj53s"
{
  "id": "common_area_public_id",
  "slug": "cancha-multiple",
  "name": "Cancha múltiple",
  "description": "Área comunal visible para visitantes.",
  "coverImageUrl": "https://cdn.example.com/common-area.jpg",
  "galleryUrls": [],
  "publicRulesSummary": "Uso sujeto a reglamento interno publicado."
}
```

---

## 15.7. PublicLinksDto

```json id="bba4cp"
{
  "residentPortalUrl": "https://app.resident.example.com/login",
  "websiteUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2"
}
```

---

## 15.8. WordPressMappingDto

```json id="d4qcvm"
{
  "tenantId": "tenant_uuid",
  "wordpressSlug": "san-jose-la-salle-2",
  "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
  "externalPublicId": "wp_post_123",
  "isPublicVisible": true,
  "updatedAt": "2026-07-14T10:00:00Z"
}
```

---

## 15.9. UpdateWordPressMappingDto

```json id="u7um4a"
{
  "wordpressSlug": "san-jose-la-salle-2",
  "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
  "externalPublicId": "wp_post_123",
  "isPublicVisible": true
}
```

---

# 16. Autenticación y autorización

## 16.1. Endpoints públicos

No requieren usuario autenticado.

Deben aplicar:

```text id="frqxt0"
rate limiting
CORS controlado
slug validation
public visibility check
safe DTO mapping
```

---

## 16.2. Endpoints tenant

Requieren:

```text id="iowhnj"
AuthGuard
TenantGuard
TenantPermissionGuard
```

Permisos:

```text id="bqqs2s"
integrations.wordpress.read
integrations.wordpress.update
```

---

## 16.3. Endpoints platform

Requieren:

```text id="fq68qy"
AuthGuard
PlatformPermissionGuard
```

Permisos:

```text id="q5jwjw"
integrations.wordpress.platform.read
integrations.wordpress.platform.update
```

---

# 17. CORS

## 17.1. Estrategia

La política CORS debe validar `Origin` contra:

```text id="ee2zpk"
tenant wordpressAllowedOrigin
platform allowed origins
environment configuration
```

---

## 17.2. Producción

Prohibido:

```text id="at3y5u"
Access-Control-Allow-Origin: *
```

Permitido:

```text id="fl8dar"
https://www.resident.gustavoguaigua.com
https://resident.gustavoguaigua.com
```

según configuración.

---

## 17.3. Desarrollo

Se pueden permitir orígenes locales explícitos:

```text id="u0hs6f"
http://localhost:3000
http://localhost:8080
```

Nunca usar wildcard sin control.

---

# 18. Cache

## 18.1. Headers sugeridos

Para endpoints públicos:

```text id="zmejb2"
Cache-Control: public, max-age=300
ETag
Last-Modified
```

---

## 18.2. TTL inicial

Valor recomendado:

```text id="y89rvk"
300 segundos
```

---

## 18.3. Errores

No cachear errores sensibles.

Para 404 de slug inexistente, se puede usar TTL corto si se decide evitar abuso:

```text id="ce82ct"
Cache-Control: public, max-age=60
```

---

## 18.4. Invalidación futura

Diferido:

```text id="r1gq0o"
LiteSpeed Cache purge
webhook cache invalidation
event-based invalidation
```

---

# 19. Rate limiting

## 19.1. Endpoints públicos

Aplicar rate limiting por:

```text id="vcj5mj"
IP
Origin
endpoint
slug opcional con cuidado de cardinalidad
```

No usar labels de alta cardinalidad en métricas.

---

## 19.2. Límites sugeridos

Valores iniciales configurables:

```text id="hugp2n"
PUBLIC_API_RATE_LIMIT_WINDOW_SECONDS=60
PUBLIC_API_RATE_LIMIT_MAX_REQUESTS=120
```

Para endpoints de detalle:

```text id="sj6kiu"
PUBLIC_DETAIL_RATE_LIMIT_MAX_REQUESTS=60
```

---

# 20. Auditoría

## 20.1. Eventos obligatorios

```text id="xzck62"
tenant.wordpressMapping.updated
tenant.publicProfile.updated
tenant.publicVisibility.updated
```

---

## 20.2. Eventos recomendados

```text id="p1v4ti"
wordpress.origin.denied
wordpress.publicEndpoint.accessDenied
wordpress.tenantSlug.notFound
wordpress.integration.updated
```

---

## 20.3. Política

No auditar cada visita pública ordinaria para evitar volumen excesivo.

Auditar:

* cambios de configuración;
* origin denegado relevante;
* abuso detectado;
* errores de integración significativos;
* acciones administrativas.

---

## 20.4. Metadata permitida

```text id="tbl6sv"
slug
origin
endpoint
result
reason
traceId
actorUserId si aplica
```

Prohibido:

```text id="bgggpl"
payload completo
headers completos
cookies
tokens
datos personales
datos financieros
```

---

# 21. Observabilidad

## 21.1. Logs técnicos

Registrar:

```text id="xhmrcv"
wordpress.publicTenant.resolved
wordpress.publicTenant.notFound
wordpress.publicEndpoint.cacheHit
wordpress.publicEndpoint.cacheMiss
wordpress.origin.denied
wordpress.integration.updated
wordpress.publicEndpoint.rateLimited
```

No registrar:

```text id="jt0gxb"
payload completo
headers completos
cookies
tokens
datos personales
datos financieros
```

---

## 21.2. Métricas

Métricas sugeridas:

```text id="x1xg1f"
wordpress_public_requests_total
wordpress_public_requests_denied_total
wordpress_public_request_latency_ms
wordpress_public_cache_hit_total
wordpress_public_cache_miss_total
wordpress_mapping_updates_total
wordpress_public_rate_limited_total
```

Labels permitidos:

```text id="a2jgvh"
endpoint
outcome
cacheStatus
```

Labels prohibidos:

```text id="qb4qls"
tenantId
slug
ipAddress
userAgent
token
```

---

# 22. Seguridad

## 22.1. Controles obligatorios

```text id="p4j8p6"
public-safe DTOs
field allowlist
slug validation
tenant active check
isPublicVisible check
CORS allowlist
rate limiting
cache-safe headers
no financial data
no private personal data
safe logging
audit mapping updates
OpenAPI public-safe
```

---

## 22.2. Riesgos principales

| Riesgo                     | Mitigación                             |
| -------------------------- | -------------------------------------- |
| Datos financieros públicos | Field allowlist + tests                |
| Datos personales públicos  | Public DTOs + tests                    |
| CORS abierto               | WordPressCorsPolicyService             |
| Tenant equivocado por slug | slug resolver + MT tests               |
| WordPress accede a DB      | API-only integration                   |
| Cache de datos privados    | cache policy                           |
| Mapping duplicado          | unique constraint + service validation |
| URL insegura               | WordPressUrl VO                        |
| Origin inseguro            | WordPressOrigin VO                     |
| Logs sensibles             | logging policy                         |

---

# 23. Migración y base de datos

## 23.1. Migración posible

Si se crean tablas separadas:

```text id="t57m2g"
009_create_tenant_public_profiles_and_wordpress_mappings
```

Tablas candidatas:

```text id="yzhjs8"
tenant_public_profiles
tenant_wordpress_mappings
```

---

## 23.2. Alternativa sin tablas nuevas

Extender `tenants`:

```text id="v6kuy4"
wordpress_slug
wordpress_url
wordpress_allowed_origin
is_public_visible
public_metadata
branding
```

---

## 23.3. Recomendación

Usar tablas separadas si el tiempo lo permite.

Ventajas:

* separación de responsabilidades;
* mejor evolución;
* auditoría más clara;
* evita contaminar `tenants`;
* soporta otros canales públicos en futuro.

La decisión definitiva queda para `data-model.md`.

---

# 24. Testing plan resumido

El documento completo será:

```text id="rtm6zq"
docs/specs/009-wordpress-integration-basic/test-plan.md
```

## 24.1. Unit tests

* WordPressSlug.
* WordPressUrl.
* WordPressOrigin.
* PublicVisibility.
* PublicFieldClassification.
* PublicCachePolicy.
* Public DTO mapper.
* CORS policy.
* Cache policy.
* Mapping service.

---

## 24.2. Integration tests

* tenant activo resuelto por slug;
* tenant suspendido no expuesto;
* tenant inactivo no expuesto;
* mapping único;
* announcements públicos;
* common areas públicas;
* cache headers.

---

## 24.3. API tests

* endpoints públicos;
* endpoints tenant mapping;
* endpoints platform mapping;
* errores;
* CORS;
* rate limiting;
* OpenAPI.

---

## 24.4. Security tests

* no saldos;
* no pagos;
* no estados de cuenta;
* no nombres de residentes;
* no emails personales;
* no permisos;
* CORS sin wildcard;
* no cache privado.

---

# 25. Orden recomendado de desarrollo

## Incremento 1 — Base del módulo

```text id="c3j40w"
WordPressIntegrationModule
estructura de carpetas
value objects
errores
DTOs públicos
```

---

## Incremento 2 — Persistencia y mapping

```text id="p8q1v1"
modelo de mapping
repositorio Prisma
migración si aplica
tenant mapping endpoints
platform mapping endpoints
auditoría de mapping
```

---

## Incremento 3 — Endpoints públicos básicos

```text id="mrl53v"
GET /public/tenants/{slug}
GET /public/tenants/{slug}/branding
GET /public/tenants/{slug}/contact
GET /public/tenants/{slug}/links
```

---

## Incremento 4 — Contenido público

```text id="r80yxr"
announcements públicos
announcement detail
common areas públicas
common area detail
```

---

## Incremento 5 — Seguridad pública

```text id="zsgwc3"
CORS policy
rate limiting
cache headers
field allowlist
safe logging
```

---

## Incremento 6 — WordPress template integration

```text id="a79o5f"
consumo REST desde single-conjunto.php
fallback ACF
manejo de error Core no disponible
cache local WordPress si aplica
```

---

## Incremento 7 — Hardening

```text id="ltq29l"
tests
OpenAPI
observability
CI gates
security review
```

---

# 26. Compatibilidad con WordPress

## 26.1. Consumo desde plantilla PHP

La integración puede iniciar desde:

```text id="sd55gq"
single-conjunto.php
```

Estrategia:

* obtener slug del CPT;
* llamar endpoint público del Core;
* si responde 200, usar datos Core;
* si falla, usar ACF local como fallback;
* no llamar endpoints privados desde navegador con secretos.

---

## 26.2. Consumo desde JavaScript

Permitido solo para endpoints públicos.

Requiere:

* CORS restringido;
* no tokens;
* no credenciales;
* rate limiting;
* DTOs públicos.

---

## 26.3. API key servidor-servidor

Diferida salvo necesidad.

Si se usa:

* no exponer en navegador;
* guardar en configuración segura WordPress;
* scope mínimo;
* rotación futura;
* auditabilidad.

---

# 27. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* existe módulo `wordpress-integration`;
* endpoints públicos funcionan;
* endpoints mapping funcionan;
* WordPress puede resolver tenant por slug;
* WordPress puede consultar branding;
* WordPress puede consultar contacto;
* WordPress puede consultar links;
* WordPress puede consultar comunicados públicos;
* WordPress puede consultar áreas comunales públicas;
* no se exponen datos financieros;
* no se exponen datos personales privados;
* tenants no activos no se exponen;
* CORS está restringido;
* rate limiting está activo;
* cache headers están configurados;
* mapping se audita;
* OpenAPI está actualizado;
* tests unitarios pasan;
* tests de integración pasan;
* tests API pasan;
* tests multitenant pasan;
* tests de seguridad pasan;
* CI pasa.

---

# 28. Comandos esperados

Comandos generales:

```bash id="dab80y"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run build
```

Comandos específicos sugeridos:

```bash id="l1q0bo"
npm run test:wordpress
npm run test:wordpress:unit
npm run test:wordpress:integration
npm run test:wordpress:api
npm run test:wordpress:cors
npm run test:wordpress:multitenancy
npm run test:wordpress:security
```

---

# 29. Riesgos de implementación

| Riesgo                           | Impacto    | Mitigación              |
| -------------------------------- | ---------- | ----------------------- |
| Exposición financiera pública    | Crítico    | public DTO allowlist    |
| Exposición personal pública      | Crítico    | field classification    |
| CORS wildcard en producción      | Alto       | CORS policy tests       |
| Slug resuelve tenant incorrecto  | Crítico    | unique slug + MT tests  |
| WordPress accede a DB Core       | Crítico    | API-only architecture   |
| Cache de datos privados          | Crítico    | cache policy            |
| Mapping duplicado                | Alto       | unique constraints      |
| Origin inválido                  | Alto       | WordPressOrigin VO      |
| URL insegura                     | Alto       | WordPressUrl VO         |
| Logs con headers/cookies         | Alto       | logging tests           |
| Rate limit ausente               | Medio/alto | public rate limit guard |
| Plugin avanzado fuera de alcance | Medio      | diferido                |

---

# 30. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="g31qjs"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/007-audit/
docs/specs/008-basic-reports/
docs/specs/009-wordpress-integration-basic/spec.md
docs/specs/009-wordpress-integration-basic/plan.md
```

El agente no debe:

```text id="nifxzx"
exponer saldos
exponer pagos
exponer estados de cuenta
exponer comprobantes
exponer nombres de residentes
exponer nombres de propietarios
exponer emails personales
exponer teléfonos personales
exponer permisos
exponer roles
crear endpoints públicos de escritura
permitir CORS wildcard
usar WordPress como fuente transaccional
conectar WordPress a PostgreSQL
crear plugin avanzado fuera de scope
implementar SSO fuera de scope
implementar pagos desde WordPress
implementar reservas desde WordPress
```

---

# 31. Pendientes para documentos derivados

## 31.1. `data-model.md`

Debe detallar:

* si se extiende `tenants` o se crean tablas separadas;
* `tenant_public_profiles`;
* `tenant_wordpress_mappings`;
* constraints;
* índices;
* Prisma;
* campos públicos;
* clasificación de datos;
* relación con ACF WordPress.

---

## 31.2. `api-contract.md`

Debe detallar:

* endpoints públicos;
* endpoints administrativos tenant;
* endpoints platform;
* query params;
* responses;
* errores;
* CORS;
* cache headers;
* OpenAPI.

---

## 31.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* CORS tests;
* rate limit tests;
* multitenancy tests;
* security tests;
* WordPress fallback tests.

---

## 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 31.5. `security-notes.md`

Debe detallar:

* riesgos de datos públicos;
* riesgos de CORS;
* riesgos de cache;
* riesgos de exposición financiera;
* riesgos de exposición personal;
* seguridad de WordPress;
* seguridad de mapping.

---

# 32. Decisión final de implementación

El módulo `009-wordpress-integration-basic` se implementará como integración pública y segura entre WordPress y RESIDENT Core.

Para MVP:

```text id="zekj3k"
- REST, no GraphQL.
- WordPress consume endpoints public-safe.
- Tenant se resuelve por slug.
- No hay datos financieros públicos.
- No hay datos personales privados públicos.
- No hay login/SSO desde WordPress todavía.
- No hay pagos ni reservas desde WordPress.
- CORS restringido.
- Rate limiting obligatorio.
- Cache público con TTL corto.
- Mapping WordPress-Core auditable.
- Fallback ACF permitido en WordPress.
```

El módulo debe garantizar:

```text id="qphhqw"
public-safe data exposure
tenant isolation by slug
API-only integration
CORS restriction
rate limiting
safe cache
safe logging
audit of mapping changes
WordPress compatibility
future SSO readiness
```

La implementación no debe aceptarse si WordPress accede directamente a la base de datos del Core, si se exponen pagos/saldos/estados de cuenta/comprobantes, si se exponen datos personales de residentes o propietarios, si se permite CORS abierto en producción, si se mezclan tenants por slug, si se cachea información privada o si WordPress se convierte en fuente de verdad transaccional.
