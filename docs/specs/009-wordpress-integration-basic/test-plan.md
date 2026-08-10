# Test Plan — Spec 009 WordPress Integration Basic

## 1. Información del documento

| Campo                    | Valor                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| Proyecto                 | RESIDENT Core                                                                                  |
| Spec ID                  | 009                                                                                            |
| Módulo                   | WordPress Integration Basic                                                                    |
| Documento                | Test Plan                                                                                      |
| Ruta                     | `docs/specs/009-wordpress-integration-basic/test-plan.md`                                      |
| Versión                  | 0.1                                                                                            |
| Estado                   | needs-review                                                                                   |
| Fecha                    | 2026-07-14                                                                                     |
| Documento base           | `docs/specs/009-wordpress-integration-basic/spec.md`                                           |
| Plan técnico             | `docs/specs/009-wordpress-integration-basic/plan.md`                                           |
| Modelo de datos          | `docs/specs/009-wordpress-integration-basic/data-model.md`                                     |
| Contrato API             | `docs/specs/009-wordpress-integration-basic/api-contract.md`                                   |
| Depende de               | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `008-basic-reports` |
| Framework sugerido       | Jest + Supertest                                                                               |
| Base de datos de pruebas | PostgreSQL test database                                                                       |
| Prioridad                | Alta                                                                                           |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `009-wordpress-integration-basic`.

El objetivo es validar que RESIDENT Core pueda integrarse con el portal WordPress multitenant mediante endpoints públicos seguros y endpoints administrativos protegidos, garantizando:

* resolución correcta del tenant por slug;
* exposición exclusiva de datos publicables;
* aislamiento multitenant;
* CORS restringido;
* rate limiting;
* cache headers seguros;
* mapping WordPress-Core auditable;
* ausencia de datos financieros en endpoints públicos;
* ausencia de datos personales privados en endpoints públicos;
* compatibilidad con el portal WordPress existente;
* no acceso directo de WordPress a la base de datos del Core.

Regla central:

```text id="i7sr6k"
La integración WordPress-Core debe ser public-safe, API-only, tenant-scoped y no debe exponer datos financieros, datos personales privados, credenciales, roles, permisos ni información transaccional.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este plan cubre:

```text id="i88okv"
Unit tests
Domain tests
DTO validation tests
Application service tests
Repository integration tests
API tests
CORS tests
Rate limit tests
Cache header tests
Authorization tests for administrative endpoints
Multitenancy tests
Security tests
Audit integration tests
OpenAPI tests
WordPress compatibility tests
Smoke tests
```

---

### 3.2. No incluido

No cubre todavía:

```text id="pwkn8m"
SSO completo con Keycloak
login de residentes desde WordPress
pagos desde WordPress
reservas desde WordPress
consulta de estados de cuenta desde WordPress
consulta de saldos desde WordPress
consulta de comprobantes desde WordPress
plugin WordPress avanzado
shortcodes avanzados
bloques Gutenberg personalizados
sincronización bidireccional completa
webhooks avanzados
purge automático de LiteSpeed Cache
GraphQL
API keys servidor-servidor
```

Estos temas quedan diferidos para specs futuras.

---

## 4. Estrategia general

El módulo se probará por capas:

```text id="cc0jdj"
1. Value objects.
2. Entidades de dominio.
3. DTOs y validaciones.
4. Field allowlist y clasificación pública.
5. Servicios de resolución pública.
6. Servicios de mapping.
7. Repositorios Prisma.
8. Endpoints públicos.
9. Endpoints administrativos tenant.
10. Endpoints administrativos platform.
11. CORS.
12. Rate limiting.
13. Cache headers.
14. Auditoría.
15. Multitenancy.
16. Seguridad de exposición de datos.
17. OpenAPI.
18. Compatibilidad WordPress.
19. Smoke tests.
```

Reglas obligatorias:

```text id="mu9fc7"
1. Todo endpoint público debe validar slug.
2. Todo endpoint público debe exponer solo datos public-safe.
3. Todo endpoint público debe rechazar o no exponer tenants no activos/no visibles.
4. Todo endpoint público debe aplicar rate limiting.
5. Todo endpoint público debe aplicar cache headers seguros cuando corresponda.
6. CORS no debe usar wildcard en producción.
7. Ningún endpoint público debe exponer saldos, pagos, cargos, estados de cuenta o comprobantes.
8. Ningún endpoint público debe exponer residentes, propietarios, emails personales, teléfonos personales o identificaciones.
9. Ningún endpoint público debe exponer roles, permisos, auditoría interna o configuración privada.
10. Endpoints tenant administrativos requieren AuthGuard, TenantGuard y permisos.
11. Endpoints platform administrativos requieren AuthGuard y permisos platform.
12. Cambios de mapping deben auditarse.
13. WordPress no debe acceder directamente a PostgreSQL.
14. Ninguna prueba debe usar datos reales.
15. Ninguna respuesta debe incluir tokens, cookies, secretos o connection strings.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* WordPress puede consultar tenant público por slug;
* WordPress puede consultar branding público;
* WordPress puede consultar contacto institucional;
* WordPress puede consultar enlaces públicos;
* endpoints públicos devuelven 404 para tenants no publicables;
* endpoints públicos no exponen datos financieros;
* endpoints públicos no exponen datos personales privados;
* endpoints públicos no exponen roles ni permisos;
* CORS permite solo orígenes configurados;
* CORS no usa `*` en producción;
* rate limiting funciona;
* cache headers son correctos;
* mapping tenant se consulta y actualiza con permisos;
* mapping platform se consulta y actualiza con permisos;
* cambios de mapping generan auditoría;
* datos de Tenant A no aparecen en Tenant B;
* slug inválido devuelve 422;
* origin inválido o no permitido se bloquea;
* OpenAPI documenta endpoints public-safe;
* CI pasa.

---

## 6. Datos base de prueba

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="of45qg"
tenantActiveA: villa-club-demo
tenantActiveB: altos-del-norte-demo
tenantPendingSetup: tenant-pending-demo
tenantSuspended: tenant-suspendido-demo
tenantInactive: tenant-inactivo-demo
tenantArchived: tenant-archivado-demo
```

---

### 6.2. Perfiles públicos

Fixtures requeridos:

```text id="qrohzq"
publicProfileAVisiblePublished
publicProfileBVisiblePublished
publicProfileHidden
publicProfileDraft
publicProfileUnpublished
publicProfileArchived
publicProfileWithInvalidDataForNegativeTests
```

Ejemplo `publicProfileAVisiblePublished`:

```text id="b7yb1i"
tenantId = tenantActiveA.id
publicSlug = villa-club-demo
publicName = Villa Club Demo
visibility = visible
status = published
publicEmail = administracion@demo.example
publicPhone = +593999999999
publicWhatsapp = +593999999999
websiteUrl = https://www.resident.gustavoguaigua.com/conjuntos/villa-club-demo
residentPortalUrl = https://app.resident.example.com/login
```

---

### 6.3. WordPress mappings

Fixtures requeridos:

```text id="f98gsz"
wordpressMappingAActiveVisible
wordpressMappingBActiveVisible
wordpressMappingPending
wordpressMappingDisabled
wordpressMappingError
wordpressMappingArchived
wordpressMappingDuplicateCandidate
```

Ejemplo `wordpressMappingAActiveVisible`:

```text id="j6y9mq"
tenantId = tenantActiveA.id
wordpressSlug = villa-club-demo
wordpressUrl = https://www.resident.gustavoguaigua.com/conjuntos/villa-club-demo
wordpressAllowedOrigin = https://www.resident.gustavoguaigua.com
externalPublicId = wp_post_101
wordpressPostId = 101
wordpressPostType = conjunto
integrationStatus = active
isPublicVisible = true
```

---

### 6.4. Usuarios

Reusar fixtures de `002-users-roles`:

```text id="bns344"
platformAdmin
tenantAdminA
tenantAdminB
tenantIntegrationAdminA
tenantIntegrationReaderA
tenantIntegrationUpdaterA
tenantIntegrationReaderB
tenantIntegrationUpdaterB
userWithoutPermission
userWithoutMembership
disabledUser
anonymousUser
```

---

### 6.5. Permisos

Permisos tenant:

```text id="n1552r"
integrations.wordpress.read
integrations.wordpress.update
```

Permisos platform:

```text id="t5l319"
integrations.wordpress.platform.read
integrations.wordpress.platform.update
```

---

### 6.6. Comunicados públicos

Si el módulo de comunicados existe o se simula para pruebas:

```text id="oh1bq4"
announcementAPublicPublished
announcementAPrivatePublished
announcementADraft
announcementBPublicPublished
announcementArchived
```

Estados esperados:

```text id="qhjq2y"
visibility = public
status = published
```

---

### 6.7. Áreas comunales públicas

Si el módulo de áreas comunales existe o se simula para pruebas:

```text id="l8vwfc"
commonAreaAPublicActive
commonAreaAPrivateActive
commonAreaAInactive
commonAreaBPublicActive
```

Estados esperados:

```text id="dikj6n"
isPublicVisible = true
status = active
```

---

### 6.8. Origins

Origins de prueba:

```text id="pmzn18"
allowedOriginMain = https://www.resident.gustavoguaigua.com
allowedOriginNoWww = https://resident.gustavoguaigua.com
disallowedOrigin = https://evil.example.com
invalidOriginWithPath = https://www.resident.gustavoguaigua.com/conjuntos/villa-club-demo
localhostDevOrigin = http://localhost:3000
wildcardOrigin = *
nullOrigin = null
```

---

### 6.9. Datos prohibidos en fixtures

No usar:

```text id="h1v29i"
datos reales de residentes
nombres reales de propietarios
emails personales reales
teléfonos personales reales
cédulas reales
placas reales
pagos reales
saldos reales
comprobantes reales
tokens reales
cookies reales
API keys reales
client secrets reales
connection strings reales
```

---

# 7. Factories recomendadas

Crear factories:

```text id="v6me6n"
createTenantPublicProfile()
createTenantWordPressMapping()
createPublicTenantDto()
createPublicBrandingDto()
createPublicContactDto()
createPublicLinksDto()
createPublicAnnouncement()
createPublicCommonArea()
createWordPressMappingDto()
createUpdateWordPressMappingDto()
createWordPressRequestContext()
createCorsRequest()
```

Ejemplo:

```text id="ma81iv"
createTenantPublicProfile({
  tenantId: tenantActiveA.id,
  publicSlug: "villa-club-demo",
  visibility: "visible",
  status: "published"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. WordPressSlug

Archivo sugerido:

```text id="l0unjl"
wordpress-slug.vo.spec.ts
```

| ID             | Caso                               | Resultado esperado                 |
| -------------- | ---------------------------------- | ---------------------------------- |
| UT-WP-SLUG-001 | `villa-club-demo` válido           | válido                             |
| UT-WP-SLUG-002 | `san-jose-la-salle-2` válido       | válido                             |
| UT-WP-SLUG-003 | slug en mayúsculas                 | normaliza o rechaza según política |
| UT-WP-SLUG-004 | slug con espacios                  | error                              |
| UT-WP-SLUG-005 | slug con slash                     | error                              |
| UT-WP-SLUG-006 | slug `../tenant`                   | error                              |
| UT-WP-SLUG-007 | slug con `<script>`                | error                              |
| UT-WP-SLUG-008 | slug vacío                         | error                              |
| UT-WP-SLUG-009 | slug muy largo                     | error                              |
| UT-WP-SLUG-010 | slug con doble guion si se prohíbe | error                              |

---

## 8.2. WordPressUrl

Archivo sugerido:

```text id="rp4m5o"
wordpress-url.vo.spec.ts
```

| ID            | Caso                             | Resultado esperado       |
| ------------- | -------------------------------- | ------------------------ |
| UT-WP-URL-001 | URL HTTPS válida                 | válido                   |
| UT-WP-URL-002 | URL HTTP en producción           | error                    |
| UT-WP-URL-003 | URL localhost en desarrollo      | válido                   |
| UT-WP-URL-004 | `javascript:`                    | error                    |
| UT-WP-URL-005 | `file:`                          | error                    |
| UT-WP-URL-006 | `data:`                          | error                    |
| UT-WP-URL-007 | URL interna privada si se valida | error                    |
| UT-WP-URL-008 | URL vacía opcional               | válido si campo opcional |

---

## 8.3. WordPressOrigin

Archivo sugerido:

```text id="ciq5hd"
wordpress-origin.vo.spec.ts
```

| ID            | Caso                                             | Resultado esperado  |
| ------------- | ------------------------------------------------ | ------------------- |
| UT-WP-ORG-001 | `https://www.resident.gustavoguaigua.com` válido | válido              |
| UT-WP-ORG-002 | origin con path                                  | error               |
| UT-WP-ORG-003 | origin wildcard `*`                              | error en producción |
| UT-WP-ORG-004 | origin `null`                                    | error               |
| UT-WP-ORG-005 | `file://`                                        | error               |
| UT-WP-ORG-006 | localhost en desarrollo                          | válido              |
| UT-WP-ORG-007 | HTTP externo en producción                       | error               |

---

## 8.4. PublicVisibility

Archivo sugerido:

```text id="ztntyk"
public-visibility.vo.spec.ts
```

| ID            | Caso                                             | Resultado esperado |
| ------------- | ------------------------------------------------ | ------------------ |
| UT-WP-VIS-001 | `visible`                                        | válido             |
| UT-WP-VIS-002 | `hidden`                                         | válido             |
| UT-WP-VIS-003 | `restricted`                                     | válido             |
| UT-WP-VIS-004 | valor inválido                                   | error              |
| UT-WP-VIS-005 | visible permite publicación                      | true               |
| UT-WP-VIS-006 | hidden no permite publicación                    | false              |
| UT-WP-VIS-007 | restricted no permite endpoint público ordinario | false              |

---

## 8.5. PublicFieldClassification

Archivo sugerido:

```text id="qljyn3"
public-field-classification.vo.spec.ts
```

| ID              | Caso                                | Resultado esperado |
| --------------- | ----------------------------------- | ------------------ |
| UT-WP-FIELD-001 | `public` sale en DTO público        | permitido          |
| UT-WP-FIELD-002 | `publicDerived` sale en DTO público | permitido          |
| UT-WP-FIELD-003 | `restricted` no sale en DTO público | bloqueado          |
| UT-WP-FIELD-004 | `private` no sale en DTO público    | bloqueado          |
| UT-WP-FIELD-005 | `sensitive` no sale en DTO público  | bloqueado          |

---

## 8.6. PublicCachePolicy

Archivo sugerido:

```text id="hb5sml"
public-cache-policy.vo.spec.ts
```

| ID              | Caso                          | Resultado esperado    |
| --------------- | ----------------------------- | --------------------- |
| UT-WP-CACHE-001 | Recurso public-safe cacheable | `public, max-age=300` |
| UT-WP-CACHE-002 | Recurso privado               | no public cache       |
| UT-WP-CACHE-003 | Error sensible                | no public cache       |
| UT-WP-CACHE-004 | 404 público con TTL corto     | `max-age=60`          |
| UT-WP-CACHE-005 | ETag habilitado               | header generado       |

---

## 8.7. PublicLink

Archivo sugerido:

```text id="gg2hl2"
public-link.vo.spec.ts
```

| ID             | Caso                               | Resultado esperado |
| -------------- | ---------------------------------- | ------------------ |
| UT-WP-LINK-001 | Link HTTPS válido                  | válido             |
| UT-WP-LINK-002 | Link con token en query            | error              |
| UT-WP-LINK-003 | Link `javascript:`                 | error              |
| UT-WP-LINK-004 | Link interno privado               | error              |
| UT-WP-LINK-005 | Link a portal residentes sin token | válido             |

---

# 9. Pruebas unitarias de entidades

## 9.1. WordPressPublicTenant

Archivo sugerido:

```text id="murpl5"
wordpress-public-tenant.entity.spec.ts
```

| ID               | Caso                                | Resultado esperado |
| ---------------- | ----------------------------------- | ------------------ |
| UT-WP-TENANT-001 | Tenant público válido               | válido             |
| UT-WP-TENANT-002 | Sin slug                            | error              |
| UT-WP-TENANT-003 | Sin publicName visible              | error              |
| UT-WP-TENANT-004 | Tenant hidden                       | no publicable      |
| UT-WP-TENANT-005 | Tenant draft                        | no publicable      |
| UT-WP-TENANT-006 | No contiene tenantId interno en DTO | correcto           |

---

## 9.2. WordPressMapping

Archivo sugerido:

```text id="fh41ps"
wordpress-mapping.entity.spec.ts
```

| ID            | Caso                       | Resultado esperado |
| ------------- | -------------------------- | ------------------ |
| UT-WP-MAP-001 | Mapping activo visible     | válido             |
| UT-WP-MAP-002 | Mapping sin tenantId       | error              |
| UT-WP-MAP-003 | Mapping sin slug           | error              |
| UT-WP-MAP-004 | Origin inválido            | error              |
| UT-WP-MAP-005 | URL inválida               | error              |
| UT-WP-MAP-006 | Guarda postType `conjunto` | válido             |
| UT-WP-MAP-007 | Rechaza tokens/secretos    | error              |

---

## 9.3. WordPressPublicAnnouncement

Archivo sugerido:

```text id="t9hf78"
wordpress-public-announcement.entity.spec.ts
```

| ID            | Caso                         | Resultado esperado |
| ------------- | ---------------------------- | ------------------ |
| UT-WP-ANN-001 | Publicado y público          | publicable         |
| UT-WP-ANN-002 | Draft                        | no publicable      |
| UT-WP-ANN-003 | Privado                      | no publicable      |
| UT-WP-ANN-004 | Archivado                    | no publicable      |
| UT-WP-ANN-005 | No incluye adjuntos privados | correcto           |

---

## 9.4. WordPressPublicCommonArea

Archivo sugerido:

```text id="exwzkv"
wordpress-public-common-area.entity.spec.ts
```

| ID             | Caso                             | Resultado esperado |
| -------------- | -------------------------------- | ------------------ |
| UT-WP-AREA-001 | Área activa visible              | publicable         |
| UT-WP-AREA-002 | Área privada                     | no publicable      |
| UT-WP-AREA-003 | Área inactiva                    | no publicable      |
| UT-WP-AREA-004 | No expone disponibilidad interna | correcto           |
| UT-WP-AREA-005 | No permite reserva               | correcto           |

---

# 10. Pruebas de DTOs y validación

## 10.1. Public DTO Mapper

Archivo sugerido:

```text id="ev919k"
wordpress-public-dto-mapper.service.spec.ts
```

| ID             | Caso                            | Resultado esperado |
| -------------- | ------------------------------- | ------------------ |
| DTO-WP-MAP-001 | Mapea PublicTenantDto           | correcto           |
| DTO-WP-MAP-002 | Mapea PublicBrandingDto         | correcto           |
| DTO-WP-MAP-003 | Mapea PublicContactDto          | correcto           |
| DTO-WP-MAP-004 | Mapea PublicLinksDto            | correcto           |
| DTO-WP-MAP-005 | Omite tenantId interno          | correcto           |
| DTO-WP-MAP-006 | Omite datos financieros         | correcto           |
| DTO-WP-MAP-007 | Omite datos personales privados | correcto           |
| DTO-WP-MAP-008 | Omite roles/permisos            | correcto           |
| DTO-WP-MAP-009 | Normaliza URLs públicas         | correcto           |

---

## 10.2. UpdateWordPressMappingDto

Archivo sugerido:

```text id="go5s6d"
update-wordpress-mapping.dto.spec.ts
```

| ID             | Caso                              | Resultado esperado    |
| -------------- | --------------------------------- | --------------------- |
| DTO-WP-UPD-001 | Body válido                       | válido                |
| DTO-WP-UPD-002 | `wordpressSlug` inválido          | 422                   |
| DTO-WP-UPD-003 | `wordpressUrl` `javascript:`      | 422                   |
| DTO-WP-UPD-004 | `wordpressAllowedOrigin` con path | 422                   |
| DTO-WP-UPD-005 | `integrationStatus` inválido      | 422                   |
| DTO-WP-UPD-006 | Body con `tenantId`               | 422 o ignorado seguro |
| DTO-WP-UPD-007 | Body con `apiKey`                 | 422                   |
| DTO-WP-UPD-008 | Body con `clientSecret`           | 422                   |
| DTO-WP-UPD-009 | Body con `authorizationHeader`    | 422                   |

---

## 10.3. Public list query DTOs

Archivo sugerido:

```text id="jccsgc"
public-list-query.dto.spec.ts
```

| ID              | Caso                  | Resultado esperado   |
| --------------- | --------------------- | -------------------- |
| DTO-WP-LIST-001 | page default 1        | válido               |
| DTO-WP-LIST-002 | pageSize default 20   | válido               |
| DTO-WP-LIST-003 | pageSize 50           | válido               |
| DTO-WP-LIST-004 | pageSize 51           | 422                  |
| DTO-WP-LIST-005 | page 0                | 422                  |
| DTO-WP-LIST-006 | category inválida     | 422 si hay whitelist |
| DTO-WP-LIST-007 | q excesivamente largo | 422                  |

---

# 11. Pruebas de servicios de aplicación

## 11.1. WordPressPublicTenantService

Archivo sugerido:

```text id="rxzkfd"
wordpress-public-tenant.service.spec.ts
```

| ID                | Caso                                    | Resultado esperado |
| ----------------- | --------------------------------------- | ------------------ |
| SRV-WP-PUBTEN-001 | Resuelve tenant activo visible por slug | éxito              |
| SRV-WP-PUBTEN-002 | Tenant suspendido                       | 404                |
| SRV-WP-PUBTEN-003 | Tenant inactivo                         | 404                |
| SRV-WP-PUBTEN-004 | Tenant archivado                        | 404                |
| SRV-WP-PUBTEN-005 | Perfil hidden                           | 404                |
| SRV-WP-PUBTEN-006 | Perfil draft                            | 404                |
| SRV-WP-PUBTEN-007 | Slug inválido                           | 422                |
| SRV-WP-PUBTEN-008 | No devuelve datos privados              | correcto           |

---

## 11.2. WordPressPublicProfileService

Archivo sugerido:

```text id="s30da5"
wordpress-public-profile.service.spec.ts
```

| ID              | Caso                             | Resultado esperado |
| --------------- | -------------------------------- | ------------------ |
| SRV-WP-PROF-001 | Construye perfil público         | correcto           |
| SRV-WP-PROF-002 | Construye branding               | correcto           |
| SRV-WP-PROF-003 | Construye contacto institucional | correcto           |
| SRV-WP-PROF-004 | Construye links públicos         | correcto           |
| SRV-WP-PROF-005 | Excluye campos `restricted`      | correcto           |
| SRV-WP-PROF-006 | Excluye campos `private`         | correcto           |
| SRV-WP-PROF-007 | Excluye campos `sensitive`       | correcto           |

---

## 11.3. WordPressMappingService

Archivo sugerido:

```text id="abxcgl"
wordpress-mapping.service.spec.ts
```

| ID             | Caso                                   | Resultado esperado |
| -------------- | -------------------------------------- | ------------------ |
| SRV-WP-MAP-001 | Lee mapping tenant                     | éxito              |
| SRV-WP-MAP-002 | Actualiza mapping tenant con permiso   | éxito              |
| SRV-WP-MAP-003 | Actualiza mapping platform con permiso | éxito              |
| SRV-WP-MAP-004 | Rechaza slug duplicado                 | 409                |
| SRV-WP-MAP-005 | Rechaza origin inválido                | 422                |
| SRV-WP-MAP-006 | Rechaza URL insegura                   | 422                |
| SRV-WP-MAP-007 | No acepta tenantId desde body          | correcto           |
| SRV-WP-MAP-008 | Audita cambio de mapping               | correcto           |
| SRV-WP-MAP-009 | No guarda secretos                     | correcto           |

---

## 11.4. WordPressCorsPolicyService

Archivo sugerido:

```text id="wbdcna"
wordpress-cors-policy.service.spec.ts
```

| ID              | Caso                           | Resultado esperado |
| --------------- | ------------------------------ | ------------------ |
| SRV-WP-CORS-001 | Origin permitido               | permitido          |
| SRV-WP-CORS-002 | Origin no permitido            | denegado           |
| SRV-WP-CORS-003 | Wildcard en producción         | error              |
| SRV-WP-CORS-004 | Origin con path                | error              |
| SRV-WP-CORS-005 | Localhost en desarrollo        | permitido          |
| SRV-WP-CORS-006 | `null` origin                  | denegado           |
| SRV-WP-CORS-007 | Origin de Tenant B para slug A | denegado           |

---

## 11.5. WordPressCachePolicyService

Archivo sugerido:

```text id="dqykpq"
wordpress-cache-policy.service.spec.ts
```

| ID               | Caso                               | Resultado esperado      |
| ---------------- | ---------------------------------- | ----------------------- |
| SRV-WP-CACHE-001 | Tenant público cacheable           | `Cache-Control: public` |
| SRV-WP-CACHE-002 | Branding cacheable                 | `Cache-Control: public` |
| SRV-WP-CACHE-003 | Contact cacheable                  | `Cache-Control: public` |
| SRV-WP-CACHE-004 | Endpoint admin no public cache     | correcto                |
| SRV-WP-CACHE-005 | Error sensible no public cache     | correcto                |
| SRV-WP-CACHE-006 | Genera ETag si habilitado          | correcto                |
| SRV-WP-CACHE-007 | Genera Last-Modified si disponible | correcto                |

---

## 11.6. WordPressFieldClassificationService

Archivo sugerido:

```text id="kltzne"
wordpress-field-classification.service.spec.ts
```

| ID               | Caso                                  | Resultado esperado |
| ---------------- | ------------------------------------- | ------------------ |
| SRV-WP-FIELD-001 | Campo public permitido                | permitido          |
| SRV-WP-FIELD-002 | Campo publicDerived permitido         | permitido          |
| SRV-WP-FIELD-003 | Campo restricted bloqueado en público | bloqueado          |
| SRV-WP-FIELD-004 | Campo private bloqueado en público    | bloqueado          |
| SRV-WP-FIELD-005 | Campo sensitive bloqueado en público  | bloqueado          |
| SRV-WP-FIELD-006 | Campo financiero bloqueado            | bloqueado          |
| SRV-WP-FIELD-007 | Campo personal privado bloqueado      | bloqueado          |

---

## 11.7. WordPressIntegrationAuditService

Archivo sugerido:

```text id="syf6ml"
wordpress-integration-audit.service.spec.ts
```

| ID             | Caso                                       | Resultado esperado |
| -------------- | ------------------------------------------ | ------------------ |
| SRV-WP-AUD-001 | Audita `tenant.wordpressMapping.updated`   | éxito              |
| SRV-WP-AUD-002 | Audita `tenant.publicProfile.updated`      | éxito              |
| SRV-WP-AUD-003 | Audita `tenant.publicVisibility.updated`   | éxito              |
| SRV-WP-AUD-004 | Audita `wordpress.origin.denied` si aplica | éxito              |
| SRV-WP-AUD-005 | Metadata no contiene payload completo      | correcto           |
| SRV-WP-AUD-006 | Metadata no contiene tokens/secrets        | correcto           |

---

# 12. Pruebas de casos de uso

## 12.1. GetPublicTenantUseCase

| ID                | Caso                             | Resultado esperado |
| ----------------- | -------------------------------- | ------------------ |
| APP-WP-PUBTEN-001 | Slug activo visible              | 200                |
| APP-WP-PUBTEN-002 | Slug inexistente                 | 404                |
| APP-WP-PUBTEN-003 | Slug inválido                    | 422                |
| APP-WP-PUBTEN-004 | Tenant suspendido                | 404                |
| APP-WP-PUBTEN-005 | Perfil hidden                    | 404                |
| APP-WP-PUBTEN-006 | Perfil draft                     | 404                |
| APP-WP-PUBTEN-007 | No expone tenantId interno       | correcto           |
| APP-WP-PUBTEN-008 | No expone información financiera | correcto           |

---

## 12.2. GetPublicTenantBrandingUseCase

| ID               | Caso                     | Resultado esperado |
| ---------------- | ------------------------ | ------------------ |
| APP-WP-BRAND-001 | Branding válido          | 200                |
| APP-WP-BRAND-002 | Slug inválido            | 422                |
| APP-WP-BRAND-003 | Tenant no visible        | 404                |
| APP-WP-BRAND-004 | URLs públicas válidas    | correcto           |
| APP-WP-BRAND-005 | No expone rutas internas | correcto           |
| APP-WP-BRAND-006 | Colores HEX válidos      | correcto           |

---

## 12.3. GetPublicTenantContactUseCase

| ID                 | Caso                        | Resultado esperado |
| ------------------ | --------------------------- | ------------------ |
| APP-WP-CONTACT-001 | Contacto institucional      | 200                |
| APP-WP-CONTACT-002 | No expone contacto personal | correcto           |
| APP-WP-CONTACT-003 | Social links válidos        | correcto           |
| APP-WP-CONTACT-004 | Tenant no visible           | 404                |
| APP-WP-CONTACT-005 | Slug inválido               | 422                |

---

## 12.4. GetPublicTenantLinksUseCase

| ID               | Caso                        | Resultado esperado |
| ---------------- | --------------------------- | ------------------ |
| APP-WP-LINKS-001 | Links públicos válidos      | 200                |
| APP-WP-LINKS-002 | residentPortalUrl sin token | correcto           |
| APP-WP-LINKS-003 | Link con token bloqueado    | error/no expuesto  |
| APP-WP-LINKS-004 | URL interna no expuesta     | correcto           |
| APP-WP-LINKS-005 | Tenant no visible           | 404                |

---

## 12.5. ListPublicAnnouncementsUseCase

| ID                  | Caso                                              | Resultado esperado |
| ------------------- | ------------------------------------------------- | ------------------ |
| APP-WP-ANN-LIST-001 | Lista solo públicos publicados                    | 200                |
| APP-WP-ANN-LIST-002 | Excluye privados                                  | correcto           |
| APP-WP-ANN-LIST-003 | Excluye draft                                     | correcto           |
| APP-WP-ANN-LIST-004 | Excluye Tenant B                                  | correcto           |
| APP-WP-ANN-LIST-005 | Pagina                                            | correcto           |
| APP-WP-ANN-LIST-006 | pageSize > 50                                     | 422                |
| APP-WP-ANN-LIST-007 | Si módulo no existe, endpoint diferido controlado | documentado        |

---

## 12.6. GetPublicAnnouncementUseCase

| ID                 | Caso                         | Resultado esperado |
| ------------------ | ---------------------------- | ------------------ |
| APP-WP-ANN-GET-001 | Comunicado público publicado | 200                |
| APP-WP-ANN-GET-002 | Comunicado privado           | 404                |
| APP-WP-ANN-GET-003 | Comunicado draft             | 404                |
| APP-WP-ANN-GET-004 | Comunicado de Tenant B       | 404                |
| APP-WP-ANN-GET-005 | announcementSlug inválido    | 422                |

---

## 12.7. ListPublicCommonAreasUseCase

| ID                   | Caso                                              | Resultado esperado |
| -------------------- | ------------------------------------------------- | ------------------ |
| APP-WP-AREA-LIST-001 | Lista áreas activas visibles                      | 200                |
| APP-WP-AREA-LIST-002 | Excluye áreas privadas                            | correcto           |
| APP-WP-AREA-LIST-003 | Excluye áreas inactivas                           | correcto           |
| APP-WP-AREA-LIST-004 | Excluye Tenant B                                  | correcto           |
| APP-WP-AREA-LIST-005 | No expone disponibilidad privada                  | correcto           |
| APP-WP-AREA-LIST-006 | No permite reserva                                | correcto           |
| APP-WP-AREA-LIST-007 | Si módulo no existe, endpoint diferido controlado | documentado        |

---

## 12.8. GetPublicCommonAreaUseCase

| ID                  | Caso                         | Resultado esperado |
| ------------------- | ---------------------------- | ------------------ |
| APP-WP-AREA-GET-001 | Área pública activa          | 200                |
| APP-WP-AREA-GET-002 | Área privada                 | 404                |
| APP-WP-AREA-GET-003 | Área inactiva                | 404                |
| APP-WP-AREA-GET-004 | Área de Tenant B             | 404                |
| APP-WP-AREA-GET-005 | No expone calendario privado | correcto           |

---

## 12.9. GetTenantWordPressMappingUseCase

| ID                  | Caso                            | Resultado esperado |
| ------------------- | ------------------------------- | ------------------ |
| APP-WP-TMAP-GET-001 | Usuario con permiso lee mapping | 200                |
| APP-WP-TMAP-GET-002 | Sin token                       | 401                |
| APP-WP-TMAP-GET-003 | Sin membership                  | 403                |
| APP-WP-TMAP-GET-004 | Sin permiso read                | 403                |
| APP-WP-TMAP-GET-005 | Tenant A no lee mapping B       | correcto           |

---

## 12.10. UpdateTenantWordPressMappingUseCase

| ID                  | Caso                          | Resultado esperado    |
| ------------------- | ----------------------------- | --------------------- |
| APP-WP-TMAP-UPD-001 | Usuario con permiso actualiza | 200                   |
| APP-WP-TMAP-UPD-002 | Sin permiso update            | 403                   |
| APP-WP-TMAP-UPD-003 | Slug duplicado                | 409                   |
| APP-WP-TMAP-UPD-004 | URL inválida                  | 422                   |
| APP-WP-TMAP-UPD-005 | Origin inválido               | 422                   |
| APP-WP-TMAP-UPD-006 | Body con tenantId             | 422 o ignorado seguro |
| APP-WP-TMAP-UPD-007 | Audita update                 | correcto              |
| APP-WP-TMAP-UPD-008 | No guarda secretos            | correcto              |

---

## 12.11. GetPlatformWordPressMappingUseCase

| ID                  | Caso                                  | Resultado esperado |
| ------------------- | ------------------------------------- | ------------------ |
| APP-WP-PMAP-GET-001 | PlatformAdmin con permiso lee mapping | 200                |
| APP-WP-PMAP-GET-002 | Sin token                             | 401                |
| APP-WP-PMAP-GET-003 | Sin permiso platform read             | 403                |
| APP-WP-PMAP-GET-004 | Tenant inexistente                    | 404                |
| APP-WP-PMAP-GET-005 | No filtra por membership tenant       | correcto           |

---

## 12.12. UpdatePlatformWordPressMappingUseCase

| ID                  | Caso                            | Resultado esperado |
| ------------------- | ------------------------------- | ------------------ |
| APP-WP-PMAP-UPD-001 | PlatformAdmin actualiza mapping | 200                |
| APP-WP-PMAP-UPD-002 | Sin permiso platform update     | 403                |
| APP-WP-PMAP-UPD-003 | Tenant inexistente              | 404                |
| APP-WP-PMAP-UPD-004 | Slug duplicado                  | 409                |
| APP-WP-PMAP-UPD-005 | Audita update platform          | correcto           |
| APP-WP-PMAP-UPD-006 | Rechaza secretos                | 422                |

---

# 13. Pruebas de integración de repositorios

## 13.1. Repositorio público

Archivo sugerido:

```text id="tmqcdx"
prisma-wordpress-public.repository.spec.ts
```

| ID             | Caso                                  | Resultado esperado |
| -------------- | ------------------------------------- | ------------------ |
| INT-WP-PUB-001 | findPublicTenantBySlug activo visible | devuelve Tenant A  |
| INT-WP-PUB-002 | Slug inexistente                      | null               |
| INT-WP-PUB-003 | Tenant suspendido                     | null               |
| INT-WP-PUB-004 | Perfil hidden                         | null               |
| INT-WP-PUB-005 | Perfil draft                          | null               |
| INT-WP-PUB-006 | Branding por slug                     | correcto           |
| INT-WP-PUB-007 | Contact por slug                      | correcto           |
| INT-WP-PUB-008 | Links por slug                        | correcto           |
| INT-WP-PUB-009 | No devuelve Tenant B                  | correcto           |

---

## 13.2. Repositorio mapping

Archivo sugerido:

```text id="kc7hn1"
prisma-wordpress-mapping.repository.spec.ts
```

| ID             | Caso                              | Resultado esperado |
| -------------- | --------------------------------- | ------------------ |
| INT-WP-MAP-001 | getTenantWordPressMapping         | correcto           |
| INT-WP-MAP-002 | updateTenantWordPressMapping      | persiste cambios   |
| INT-WP-MAP-003 | getPlatformWordPressMapping       | correcto           |
| INT-WP-MAP-004 | updatePlatformWordPressMapping    | persiste cambios   |
| INT-WP-MAP-005 | wordpressSlug único               | constraint         |
| INT-WP-MAP-006 | tenantId único                    | constraint         |
| INT-WP-MAP-007 | archived no expuesto públicamente | correcto           |
| INT-WP-MAP-008 | origin lookup correcto            | correcto           |

---

## 13.3. Repositorio comunicados públicos

Si existe módulo de comunicados:

| ID             | Caso                            | Resultado esperado |
| -------------- | ------------------------------- | ------------------ |
| INT-WP-ANN-001 | Lista public/published Tenant A | correcto           |
| INT-WP-ANN-002 | Excluye private                 | correcto           |
| INT-WP-ANN-003 | Excluye draft                   | correcto           |
| INT-WP-ANN-004 | Excluye Tenant B                | correcto           |
| INT-WP-ANN-005 | Detalle public/published        | correcto           |

---

## 13.4. Repositorio áreas comunales públicas

Si existe módulo de áreas comunales:

| ID              | Caso                         | Resultado esperado |
| --------------- | ---------------------------- | ------------------ |
| INT-WP-AREA-001 | Lista active/public Tenant A | correcto           |
| INT-WP-AREA-002 | Excluye private              | correcto           |
| INT-WP-AREA-003 | Excluye inactive             | correcto           |
| INT-WP-AREA-004 | Excluye Tenant B             | correcto           |
| INT-WP-AREA-005 | Detalle active/public        | correcto           |

---

# 14. Pruebas API de endpoints públicos

## 14.1. Public Tenant API

Endpoint:

```text id="sy45no"
GET /api/v1/public/tenants/{slug}
```

| ID                | Caso                      | Resultado esperado |
| ----------------- | ------------------------- | ------------------ |
| API-WP-PUBTEN-001 | Slug activo visible       | 200                |
| API-WP-PUBTEN-002 | Slug inexistente          | 404                |
| API-WP-PUBTEN-003 | Slug inválido             | 422                |
| API-WP-PUBTEN-004 | Tenant suspendido         | 404                |
| API-WP-PUBTEN-005 | Perfil hidden             | 404                |
| API-WP-PUBTEN-006 | Response shape correcto   | pasa               |
| API-WP-PUBTEN-007 | No tenantId interno       | pasa               |
| API-WP-PUBTEN-008 | Cache headers presentes   | pasa               |
| API-WP-PUBTEN-009 | No requiere Authorization | pasa               |

---

## 14.2. Branding API

Endpoint:

```text id="auivyn"
GET /api/v1/public/tenants/{slug}/branding
```

| ID               | Caso              | Resultado esperado |
| ---------------- | ----------------- | ------------------ |
| API-WP-BRAND-001 | Slug válido       | 200                |
| API-WP-BRAND-002 | Slug inválido     | 422                |
| API-WP-BRAND-003 | Tenant no visible | 404                |
| API-WP-BRAND-004 | No rutas internas | pasa               |
| API-WP-BRAND-005 | Colores válidos   | pasa               |
| API-WP-BRAND-006 | Cache headers     | pasa               |

---

## 14.3. Contact API

Endpoint:

```text id="s419b9"
GET /api/v1/public/tenants/{slug}/contact
```

| ID                 | Caso                 | Resultado esperado |
| ------------------ | -------------------- | ------------------ |
| API-WP-CONTACT-001 | Contacto válido      | 200                |
| API-WP-CONTACT-002 | No datos personales  | pasa               |
| API-WP-CONTACT-003 | Social links válidos | pasa               |
| API-WP-CONTACT-004 | Tenant no visible    | 404                |
| API-WP-CONTACT-005 | Cache headers        | pasa               |

---

## 14.4. Links API

Endpoint:

```text id="yhd8e0"
GET /api/v1/public/tenants/{slug}/links
```

| ID               | Caso              | Resultado esperado |
| ---------------- | ----------------- | ------------------ |
| API-WP-LINKS-001 | Links válidos     | 200                |
| API-WP-LINKS-002 | No tokens en URLs | pasa               |
| API-WP-LINKS-003 | No URLs internas  | pasa               |
| API-WP-LINKS-004 | Tenant no visible | 404                |

---

## 14.5. Announcements API

Endpoints:

```text id="cdw2bx"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
```

| ID             | Caso                                     | Resultado esperado |
| -------------- | ---------------------------------------- | ------------------ |
| API-WP-ANN-001 | Lista públicos publicados                | 200                |
| API-WP-ANN-002 | No lista privados                        | pasa               |
| API-WP-ANN-003 | No lista draft                           | pasa               |
| API-WP-ANN-004 | pageSize > 50                            | 422                |
| API-WP-ANN-005 | Detalle público                          | 200                |
| API-WP-ANN-006 | Detalle privado                          | 404                |
| API-WP-ANN-007 | Tenant B no aparece                      | pasa               |
| API-WP-ANN-008 | Si módulo diferido, contrato documentado | pasa               |

---

## 14.6. Common Areas API

Endpoints:

```text id="yvqmdt"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

| ID              | Caso                                     | Resultado esperado |
| --------------- | ---------------------------------------- | ------------------ |
| API-WP-AREA-001 | Lista áreas públicas activas             | 200                |
| API-WP-AREA-002 | No lista privadas                        | pasa               |
| API-WP-AREA-003 | No lista inactivas                       | pasa               |
| API-WP-AREA-004 | No expone disponibilidad privada         | pasa               |
| API-WP-AREA-005 | No permite reserva                       | pasa               |
| API-WP-AREA-006 | Tenant B no aparece                      | pasa               |
| API-WP-AREA-007 | Si módulo diferido, contrato documentado | pasa               |

---

# 15. Pruebas API de endpoints administrativos tenant

## 15.1. GET tenant mapping

Endpoint:

```text id="v2t61e"
GET /api/v1/tenant/integrations/wordpress
```

| ID                  | Caso                             | Resultado esperado |
| ------------------- | -------------------------------- | ------------------ |
| API-WP-TMAP-GET-001 | Usuario con permiso              | 200                |
| API-WP-TMAP-GET-002 | Sin token                        | 401                |
| API-WP-TMAP-GET-003 | Sin membership                   | 403                |
| API-WP-TMAP-GET-004 | Sin permiso                      | 403                |
| API-WP-TMAP-GET-005 | Tenant suspendido según política | 403                |
| API-WP-TMAP-GET-006 | Response shape correcto          | pasa               |

---

## 15.2. PATCH tenant mapping

Endpoint:

```text id="zd5tbc"
PATCH /api/v1/tenant/integrations/wordpress
```

| ID                  | Caso                          | Resultado esperado    |
| ------------------- | ----------------------------- | --------------------- |
| API-WP-TMAP-UPD-001 | Usuario con permiso actualiza | 200                   |
| API-WP-TMAP-UPD-002 | Sin token                     | 401                   |
| API-WP-TMAP-UPD-003 | Sin permiso update            | 403                   |
| API-WP-TMAP-UPD-004 | Slug inválido                 | 422                   |
| API-WP-TMAP-UPD-005 | URL inválida                  | 422                   |
| API-WP-TMAP-UPD-006 | Origin inválido               | 422                   |
| API-WP-TMAP-UPD-007 | Slug duplicado                | 409                   |
| API-WP-TMAP-UPD-008 | Body con tenantId             | 422 o ignorado seguro |
| API-WP-TMAP-UPD-009 | Body con secret               | 422                   |
| API-WP-TMAP-UPD-010 | Audit event generado          | pasa                  |

---

# 16. Pruebas API de endpoints platform

## 16.1. GET platform mapping

Endpoint:

```text id="oe28op"
GET /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

| ID                  | Caso                     | Resultado esperado |
| ------------------- | ------------------------ | ------------------ |
| API-WP-PMAP-GET-001 | PlatformAdmin autorizado | 200                |
| API-WP-PMAP-GET-002 | Sin token                | 401                |
| API-WP-PMAP-GET-003 | Sin permiso platform     | 403                |
| API-WP-PMAP-GET-004 | Tenant inexistente       | 404                |
| API-WP-PMAP-GET-005 | Response shape correcto  | pasa               |

---

## 16.2. PATCH platform mapping

Endpoint:

```text id="ktzil4"
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

| ID                  | Caso                               | Resultado esperado |
| ------------------- | ---------------------------------- | ------------------ |
| API-WP-PMAP-UPD-001 | PlatformAdmin autorizado actualiza | 200                |
| API-WP-PMAP-UPD-002 | Sin token                          | 401                |
| API-WP-PMAP-UPD-003 | Sin permiso platform update        | 403                |
| API-WP-PMAP-UPD-004 | Tenant inexistente                 | 404                |
| API-WP-PMAP-UPD-005 | Slug duplicado                     | 409                |
| API-WP-PMAP-UPD-006 | URL insegura                       | 422                |
| API-WP-PMAP-UPD-007 | Audit event generado               | pasa               |
| API-WP-PMAP-UPD-008 | No guarda secretos                 | pasa               |

---

# 17. Pruebas de CORS

| ID          | Caso                            | Resultado esperado                         |
| ----------- | ------------------------------- | ------------------------------------------ |
| CORS-WP-001 | Origin permitido para slug A    | `Access-Control-Allow-Origin` correcto     |
| CORS-WP-002 | Origin no permitido             | sin header CORS o 403                      |
| CORS-WP-003 | Origin de Tenant B para slug A  | denegado                                   |
| CORS-WP-004 | Wildcard configurado producción | error de configuración                     |
| CORS-WP-005 | Origin `null`                   | denegado                                   |
| CORS-WP-006 | Origin con path                 | 422/config inválida                        |
| CORS-WP-007 | Preflight GET público           | permite GET/OPTIONS                        |
| CORS-WP-008 | Preflight PATCH admin           | permite PATCH solo en rutas admin con auth |
| CORS-WP-009 | `Vary: Origin` presente         | correcto                                   |

---

# 18. Pruebas de rate limiting

| ID        | Caso                                  | Resultado esperado |
| --------- | ------------------------------------- | ------------------ |
| RL-WP-001 | Requests bajo límite                  | 200                |
| RL-WP-002 | Requests sobre límite público         | 429                |
| RL-WP-003 | Endpoint detalle con límite reforzado | 429 al exceder     |
| RL-WP-004 | Respuesta 429 tiene traceId           | pasa               |
| RL-WP-005 | Métrica rate limited incrementa       | pasa               |
| RL-WP-006 | No registra payload completo          | pasa               |

---

# 19. Pruebas de cache headers

| ID           | Caso                           | Resultado esperado                   |
| ------------ | ------------------------------ | ------------------------------------ |
| CACHE-WP-001 | Public tenant cacheable        | `Cache-Control: public, max-age=300` |
| CACHE-WP-002 | Branding cacheable             | header correcto                      |
| CACHE-WP-003 | Contact cacheable              | header correcto                      |
| CACHE-WP-004 | Links cacheable                | header correcto                      |
| CACHE-WP-005 | 404 público TTL corto          | `max-age=60` si política aplica      |
| CACHE-WP-006 | Endpoint admin no public cache | no-store/private                     |
| CACHE-WP-007 | ETag generado                  | correcto si habilitado               |
| CACHE-WP-008 | Last-Modified generado         | correcto si habilitado               |
| CACHE-WP-009 | No cache datos privados        | pasa                                 |

---

# 20. Pruebas de autorización

## 20.1. Endpoints públicos

| ID              | Caso                               | Resultado esperado                  |
| --------------- | ---------------------------------- | ----------------------------------- |
| AUTH-WP-PUB-001 | Sin Authorization                  | 200 si tenant visible               |
| AUTH-WP-PUB-002 | Token inválido en endpoint público | ignorado o no afecta según política |
| AUTH-WP-PUB-003 | No hay cookies requeridas          | correcto                            |
| AUTH-WP-PUB-004 | No hay sesión requerida            | correcto                            |

---

## 20.2. Endpoints tenant

| ID              | Usuario                   | Endpoint             | Resultado |
| --------------- | ------------------------- | -------------------- | --------- |
| AUTH-WP-TEN-001 | tenantIntegrationReaderA  | GET tenant mapping   | 200       |
| AUTH-WP-TEN-002 | tenantIntegrationUpdaterA | PATCH tenant mapping | 200       |
| AUTH-WP-TEN-003 | userWithoutPermission     | GET tenant mapping   | 403       |
| AUTH-WP-TEN-004 | tenantIntegrationReaderA  | PATCH tenant mapping | 403       |
| AUTH-WP-TEN-005 | userWithoutMembership     | GET tenant mapping   | 403       |
| AUTH-WP-TEN-006 | disabledUser              | GET tenant mapping   | 403       |

---

## 20.3. Endpoints platform

| ID               | Usuario               | Endpoint               | Resultado |
| ---------------- | --------------------- | ---------------------- | --------- |
| AUTH-WP-PLAT-001 | platformAdmin         | GET platform mapping   | 200       |
| AUTH-WP-PLAT-002 | platformAdmin         | PATCH platform mapping | 200       |
| AUTH-WP-PLAT-003 | tenantAdminA          | GET platform mapping   | 403       |
| AUTH-WP-PLAT-004 | userWithoutPermission | PATCH platform mapping | 403       |
| AUTH-WP-PLAT-005 | anonymousUser         | GET platform mapping   | 401       |

---

# 21. Pruebas multitenant

| ID        | Caso                                  | Resultado esperado |
| --------- | ------------------------------------- | ------------------ |
| MT-WP-001 | Slug A devuelve Tenant A              | correcto           |
| MT-WP-002 | Slug B devuelve Tenant B              | correcto           |
| MT-WP-003 | Slug A no devuelve datos B            | pasa               |
| MT-WP-004 | Branding A no incluye branding B      | pasa               |
| MT-WP-005 | Contact A no incluye contact B        | pasa               |
| MT-WP-006 | Announcement A no lista B             | pasa               |
| MT-WP-007 | CommonArea A no lista B               | pasa               |
| MT-WP-008 | TenantAdmin A no actualiza mapping B  | 403                |
| MT-WP-009 | Origin A no autoriza Tenant B         | denegado           |
| MT-WP-010 | wordpressSlug duplicado entre tenants | 409                |
| MT-WP-011 | publicSlug duplicado entre tenants    | constraint/error   |

---

# 22. Pruebas de seguridad de datos públicos

## 22.1. No exposición financiera

| ID             | Endpoint                 | Campos prohibidos                |
| -------------- | ------------------------ | -------------------------------- |
| SEC-WP-FIN-001 | `/public/tenants/{slug}` | balance, debt, charges, payments |
| SEC-WP-FIN-002 | `/branding`              | financial fields                 |
| SEC-WP-FIN-003 | `/contact`               | financial fields                 |
| SEC-WP-FIN-004 | `/links`                 | payment links con token          |
| SEC-WP-FIN-005 | `/announcements`         | account statements, receipts     |
| SEC-WP-FIN-006 | `/common-areas`          | paid reservations, charges       |

Resultado esperado:

```text id="y3e5ad"
Ningún campo financiero aparece en respuesta pública.
```

---

## 22.2. No exposición personal privada

| ID               | Endpoint                 | Campos prohibidos                |
| ---------------- | ------------------------ | -------------------------------- |
| SEC-WP-PDATA-001 | `/public/tenants/{slug}` | resident names, owner names      |
| SEC-WP-PDATA-002 | `/contact`               | personal emails, personal phones |
| SEC-WP-PDATA-003 | `/announcements`         | resident identifiers             |
| SEC-WP-PDATA-004 | `/common-areas`          | reservation owner names          |
| SEC-WP-PDATA-005 | `/links`                 | session/user tokens              |

Resultado esperado:

```text id="tpuxyi"
Ningún dato personal privado aparece en respuesta pública.
```

---

## 22.3. No exposición de seguridad interna

| ID | Caso | Resultado esperado |
|---|---|
| SEC-WP-INT-001 | Roles no aparecen | pasa |
| SEC-WP-INT-002 | Permisos no aparecen | pasa |
| SEC-WP-INT-003 | audit_logs no aparecen | pasa |
| SEC-WP-INT-004 | integrationStatus no aparece en DTO público | pasa |
| SEC-WP-INT-005 | wordpressAllowedOrigin no aparece en DTO público | pasa |
| SEC-WP-INT-006 | tenantId interno no aparece en DTO público | pasa |

---

## 22.4. No secretos

| ID | Caso | Resultado esperado |
|---|---|
| SEC-WP-SEC-001 | Response pública sin accessToken | pasa |
| SEC-WP-SEC-002 | Response pública sin refreshToken | pasa |
| SEC-WP-SEC-003 | Response pública sin apiKey | pasa |
| SEC-WP-SEC-004 | Response pública sin clientSecret | pasa |
| SEC-WP-SEC-005 | Response pública sin cookie | pasa |
| SEC-WP-SEC-006 | Response pública sin Authorization header | pasa |
| SEC-WP-SEC-007 | Mapping update rechaza secretos | 422 |

---

# 23. Pruebas de auditoría

| ID         | Caso                                      | Evento esperado                          |
| ---------- | ----------------------------------------- | ---------------------------------------- |
| AUD-WP-001 | Tenant mapping update                     | `tenant.wordpressMapping.updated`        |
| AUD-WP-002 | Platform mapping update                   | `tenant.wordpressMapping.updated`        |
| AUD-WP-003 | Public profile update si se implementa    | `tenant.publicProfile.updated`           |
| AUD-WP-004 | Public visibility update si se implementa | `tenant.publicVisibility.updated`        |
| AUD-WP-005 | Origin denegado relevante                 | `wordpress.origin.denied`                |
| AUD-WP-006 | Mapping update fallido relevante          | `wordpress.integration.validationFailed` |
| AUD-WP-007 | Metadata no contiene tokens               | pasa                                     |
| AUD-WP-008 | Metadata no contiene payload completo     | pasa                                     |
| AUD-WP-009 | No audita cada visita pública ordinaria   | pasa                                     |

---

# 24. Pruebas de observabilidad

| ID         | Caso                                          | Resultado esperado |
| ---------- | --------------------------------------------- | ------------------ |
| OBS-WP-001 | Public tenant resolved genera log             | pasa               |
| OBS-WP-002 | Public tenant not found genera log sanitizado | pasa               |
| OBS-WP-003 | Cache hit genera métrica                      | pasa               |
| OBS-WP-004 | Cache miss genera métrica                     | pasa               |
| OBS-WP-005 | Origin denied genera métrica                  | pasa               |
| OBS-WP-006 | Mapping update genera métrica                 | pasa               |
| OBS-WP-007 | Logs no contienen headers completos           | pasa               |
| OBS-WP-008 | Logs no contienen cookies                     | pasa               |
| OBS-WP-009 | Logs no contienen tokens                      | pasa               |
| OBS-WP-010 | Métricas no usan slug como label              | pasa               |
| OBS-WP-011 | Métricas no usan tenantId como label          | pasa               |
| OBS-WP-012 | Métricas no usan ipAddress como label         | pasa               |

---

# 25. Pruebas OpenAPI

| ID          | Caso                                            | Resultado esperado |
| ----------- | ----------------------------------------------- | ------------------ |
| OAPI-WP-001 | Endpoints públicos documentados                 | pasa               |
| OAPI-WP-002 | Endpoints tenant admin documentados             | pasa               |
| OAPI-WP-003 | Endpoints platform documentados                 | pasa               |
| OAPI-WP-004 | `x-public-safe` en públicos                     | pasa               |
| OAPI-WP-005 | `x-no-financial-data` en públicos               | pasa               |
| OAPI-WP-006 | `x-no-private-personal-data` en públicos        | pasa               |
| OAPI-WP-007 | Permisos admin documentados                     | pasa               |
| OAPI-WP-008 | CORS documentado                                | pasa               |
| OAPI-WP-009 | Cache headers documentados                      | pasa               |
| OAPI-WP-010 | Rate limiting documentado                       | pasa               |
| OAPI-WP-011 | No documenta endpoints públicos de pagos/saldos | pasa               |
| OAPI-WP-012 | No documenta POST/PATCH/DELETE públicos         | pasa               |

---

# 26. Pruebas de compatibilidad WordPress

## 26.1. Consumo desde plantilla PHP

| ID              | Caso                                   | Resultado esperado        |
| --------------- | -------------------------------------- | ------------------------- |
| WP-COMP-PHP-001 | WordPress obtiene slug CPT `conjunto`  | correcto                  |
| WP-COMP-PHP-002 | WordPress llama public tenant endpoint | 200                       |
| WP-COMP-PHP-003 | WordPress llama branding endpoint      | 200                       |
| WP-COMP-PHP-004 | WordPress llama contact endpoint       | 200                       |
| WP-COMP-PHP-005 | Core no disponible                     | fallback ACF              |
| WP-COMP-PHP-006 | Core 404                               | fallback ACF si permitido |
| WP-COMP-PHP-007 | Fallback no inventa datos financieros  | pasa                      |
| WP-COMP-PHP-008 | No se usa DB Core directa              | pasa                      |

---

## 26.2. Consumo desde JavaScript

| ID             | Caso                          | Resultado esperado |
| -------------- | ----------------------------- | ------------------ |
| WP-COMP-JS-001 | Origin permitido consume API  | permitido          |
| WP-COMP-JS-002 | Origin no permitido bloqueado | bloqueado          |
| WP-COMP-JS-003 | No se envían cookies          | correcto           |
| WP-COMP-JS-004 | No se envían tokens           | correcto           |
| WP-COMP-JS-005 | Response cacheable            | correcto           |

---

## 26.3. Mapeo ACF

| ID              | Campo ACF                    | Campo Core               | Resultado |
| --------------- | ---------------------------- | ------------------------ | --------- |
| WP-COMP-ACF-001 | `logo`                       | `logoUrl`                | mapeable  |
| WP-COMP-ACF-002 | `banner_principal`           | `bannerUrl`              | mapeable  |
| WP-COMP-ACF-003 | `color_primario`             | `primaryColor`           | mapeable  |
| WP-COMP-ACF-004 | `color_secundario`           | `secondaryColor`         | mapeable  |
| WP-COMP-ACF-005 | `slogan`                     | `slogan`                 | mapeable  |
| WP-COMP-ACF-006 | `url_residentes`             | `residentPortalUrl`      | mapeable  |
| WP-COMP-ACF-007 | `whatsapp`                   | `publicWhatsapp`         | mapeable  |
| WP-COMP-ACF-008 | `telefono`                   | `publicPhone`            | mapeable  |
| WP-COMP-ACF-009 | `email`                      | `publicEmail`            | mapeable  |
| WP-COMP-ACF-010 | `direccion`                  | `publicAddress`          | mapeable  |
| WP-COMP-ACF-011 | `facebook/instagram/youtube` | `socialLinks`            | mapeable  |
| WP-COMP-ACF-012 | `historia/mision/vision`     | `history/mission/vision` | mapeable  |
| WP-COMP-ACF-013 | `foto_1` a `foto_6`          | `galleryUrls`            | mapeable  |

---

# 27. Pruebas de comportamiento no permitido

| ID         | Caso                                                | Resultado esperado     |
| ---------- | --------------------------------------------------- | ---------------------- |
| NEG-WP-001 | WordPress intenta leer pagos públicos               | endpoint no existe     |
| NEG-WP-002 | WordPress intenta leer saldos públicos              | endpoint no existe     |
| NEG-WP-003 | WordPress intenta leer estados de cuenta públicos   | endpoint no existe     |
| NEG-WP-004 | WordPress intenta leer comprobantes públicos        | endpoint no existe     |
| NEG-WP-005 | WordPress intenta modificar tenant público sin auth | endpoint no existe/401 |
| NEG-WP-006 | WordPress intenta usar CORS wildcard                | bloqueado              |
| NEG-WP-007 | Mapping guarda token                                | 422                    |
| NEG-WP-008 | Mapping guarda cookie                               | 422                    |
| NEG-WP-009 | Mapping guarda connectionString                     | 422                    |
| NEG-WP-010 | API pública devuelve permisos                       | falla test             |

---

# 28. Smoke tests

Smoke tests post-deploy:

| ID           | Caso                     | Resultado esperado |
| ------------ | ------------------------ | ------------------ |
| SMOKE-WP-001 | `GET /api/v1/health`     | 200                |
| SMOKE-WP-002 | Public tenant visible    | 200                |
| SMOKE-WP-003 | Public branding visible  | 200                |
| SMOKE-WP-004 | Public contact visible   | 200                |
| SMOKE-WP-005 | Slug inexistente         | 404                |
| SMOKE-WP-006 | Slug inválido            | 422                |
| SMOKE-WP-007 | Admin endpoint sin token | 401                |
| SMOKE-WP-008 | CORS origin permitido    | header correcto    |
| SMOKE-WP-009 | CORS origin no permitido | bloqueado          |
| SMOKE-WP-010 | Error contiene traceId   | pasa               |

---

# 29. Organización de archivos de prueba

```text id="mf236g"
apps/api/src/modules/integrations/wordpress/tests/
├── unit/
│   ├── wordpress-slug.vo.spec.ts
│   ├── wordpress-url.vo.spec.ts
│   ├── wordpress-origin.vo.spec.ts
│   ├── public-visibility.vo.spec.ts
│   ├── public-field-classification.vo.spec.ts
│   ├── public-cache-policy.vo.spec.ts
│   ├── public-link.vo.spec.ts
│   ├── wordpress-public-tenant.entity.spec.ts
│   ├── wordpress-mapping.entity.spec.ts
│   ├── wordpress-public-announcement.entity.spec.ts
│   └── wordpress-public-common-area.entity.spec.ts
│
├── application/
│   ├── wordpress-public-tenant.service.spec.ts
│   ├── wordpress-public-profile.service.spec.ts
│   ├── wordpress-mapping.service.spec.ts
│   ├── wordpress-cors-policy.service.spec.ts
│   ├── wordpress-cache-policy.service.spec.ts
│   ├── wordpress-field-classification.service.spec.ts
│   ├── wordpress-integration-audit.service.spec.ts
│   ├── get-public-tenant.use-case.spec.ts
│   ├── get-public-tenant-branding.use-case.spec.ts
│   ├── get-public-tenant-contact.use-case.spec.ts
│   ├── get-public-tenant-links.use-case.spec.ts
│   ├── list-public-announcements.use-case.spec.ts
│   ├── get-public-announcement.use-case.spec.ts
│   ├── list-public-common-areas.use-case.spec.ts
│   ├── get-public-common-area.use-case.spec.ts
│   ├── get-tenant-wordpress-mapping.use-case.spec.ts
│   ├── update-tenant-wordpress-mapping.use-case.spec.ts
│   ├── get-platform-wordpress-mapping.use-case.spec.ts
│   └── update-platform-wordpress-mapping.use-case.spec.ts
│
├── integration/
│   ├── prisma-wordpress-public.repository.spec.ts
│   ├── prisma-wordpress-mapping.repository.spec.ts
│   ├── wordpress-public-announcements.repository.spec.ts
│   └── wordpress-public-common-areas.repository.spec.ts
│
├── api/
│   ├── public-tenant.api.spec.ts
│   ├── public-branding.api.spec.ts
│   ├── public-contact.api.spec.ts
│   ├── public-links.api.spec.ts
│   ├── public-announcements.api.spec.ts
│   ├── public-common-areas.api.spec.ts
│   ├── tenant-wordpress-mapping.api.spec.ts
│   └── platform-wordpress-mapping.api.spec.ts
│
├── cors/
│   └── wordpress-cors.spec.ts
│
├── rate-limit/
│   └── wordpress-rate-limit.spec.ts
│
├── cache/
│   └── wordpress-cache-headers.spec.ts
│
├── authorization/
│   ├── wordpress-tenant-authorization.spec.ts
│   └── wordpress-platform-authorization.spec.ts
│
├── multitenancy/
│   └── wordpress.multitenancy.spec.ts
│
├── security/
│   ├── wordpress-public-data-exposure.security.spec.ts
│   ├── wordpress-no-financial-data.security.spec.ts
│   ├── wordpress-no-private-personal-data.security.spec.ts
│   ├── wordpress-no-secrets.security.spec.ts
│   └── wordpress-negative-behavior.security.spec.ts
│
├── observability/
│   └── wordpress-observability.spec.ts
│
├── openapi/
│   └── wordpress.openapi.spec.ts
│
└── compatibility/
    ├── wordpress-template-php.compat.spec.ts
    ├── wordpress-javascript-cors.compat.spec.ts
    └── wordpress-acf-mapping.compat.spec.ts
```

---

# 30. Comandos esperados

Comandos específicos sugeridos:

```bash id="yz3yvn"
npm run test:wordpress
npm run test:wordpress:unit
npm run test:wordpress:application
npm run test:wordpress:integration
npm run test:wordpress:api
npm run test:wordpress:cors
npm run test:wordpress:rate-limit
npm run test:wordpress:cache
npm run test:wordpress:authorization
npm run test:wordpress:multitenancy
npm run test:wordpress:security
npm run test:wordpress:openapi
```

Comandos generales:

```bash id="fxl64p"
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

---

# 31. Requisitos para CI

En pull request deben correr como mínimo:

```text id="b7096o"
lint
typecheck
unit tests
DTO validation tests
application tests
repository integration tests críticos
public API tests
tenant admin API tests
platform admin API tests
CORS tests
rate limit tests
cache tests
authorization tests
multitenancy tests
security exposure tests
audit integration tests
OpenAPI validation
build
```

Antes de producción:

```text id="i4lrqf"
full wordpress integration test suite
all public API tests
all admin API tests
all CORS tests
all security tests
all multitenancy tests
smoke tests staging
WordPress template compatibility verification
```

---

# 32. Gates de calidad

No se permite merge si falla:

* slug validation;
* public-safe field allowlist;
* tenant isolation;
* no financial data exposure;
* no private personal data exposure;
* no secrets exposure;
* CORS without wildcard;
* rate limiting;
* cache header policy;
* admin authorization;
* platform authorization;
* mapping audit;
* OpenAPI validation;
* no public write endpoints;
* no direct DB access from WordPress;
* CI build.

---

# 33. Matriz de trazabilidad

| Requisito                         | Pruebas asociadas              |
| --------------------------------- | ------------------------------ |
| FR-001 Tenant público por slug    | APP-WP-PUBTEN, API-WP-PUBTEN   |
| FR-002 Branding público           | APP-WP-BRAND, API-WP-BRAND     |
| FR-003 Contacto público           | APP-WP-CONTACT, API-WP-CONTACT |
| FR-004 Comunicados públicos       | APP-WP-ANN, API-WP-ANN         |
| FR-005 Detalle comunicado público | APP-WP-ANN-GET                 |
| FR-006 Áreas comunales públicas   | APP-WP-AREA, API-WP-AREA       |
| FR-007 Enlaces públicos           | APP-WP-LINKS, API-WP-LINKS     |
| FR-008 Mapping WordPress-Core     | APP-WP-TMAP, APP-WP-PMAP       |
| FR-009 CORS                       | CORS-WP                        |
| FR-010 Rate limiting              | RL-WP                          |
| FR-011 Cache headers              | CACHE-WP                       |
| FR-012 No datos privados          | SEC-WP                         |
| FR-013 Auditar mapping            | AUD-WP                         |
| FR-014 Auditar anomalías          | AUD-WP                         |
| FR-015 OpenAPI                    | OAPI-WP                        |

---

# 34. Riesgos cubiertos

| Riesgo                                  | Pruebas                 |
| --------------------------------------- | ----------------------- |
| Exposición financiera pública           | SEC-WP-FIN              |
| Exposición de datos personales privados | SEC-WP-PDATA            |
| Exposición de roles/permisos            | SEC-WP-INT              |
| Exposición de secretos                  | SEC-WP-SEC              |
| CORS abierto                            | CORS-WP                 |
| Tenant incorrecto por slug              | MT-WP                   |
| Mapping duplicado                       | INT-WP-MAP, API-WP-TMAP |
| URL insegura                            | DTO-WP-UPD, UT-WP-URL   |
| Origin inseguro                         | UT-WP-ORG, CORS-WP      |
| Cache de datos privados                 | CACHE-WP                |
| Ausencia de rate limiting               | RL-WP                   |
| Auditoría omitida                       | AUD-WP                  |
| WordPress como fuente transaccional     | NEG-WP, WP-COMP         |
| Endpoint público de escritura           | OAPI-WP, NEG-WP         |

---

# 35. Criterios de salida

El módulo `009-wordpress-integration-basic` puede considerarse probado si:

* unit tests pasan;
* entity tests pasan;
* DTO validation tests pasan;
* application service tests pasan;
* use case tests pasan;
* repository integration tests pasan;
* public API tests pasan;
* tenant admin API tests pasan;
* platform admin API tests pasan;
* CORS tests pasan;
* rate limit tests pasan;
* cache header tests pasan;
* authorization tests pasan;
* multitenancy tests pasan;
* security exposure tests pasan;
* audit integration tests pasan;
* observability tests pasan;
* OpenAPI tests pasan;
* compatibility tests pasan;
* smoke tests pasan;
* no hay datos reales en fixtures;
* no hay exposición financiera;
* no hay exposición personal privada;
* no hay exposición de secretos;
* no hay CORS wildcard en producción;
* no hay endpoints públicos de escritura;
* CI pasa.

---

# 36. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="a8p078"
SSO completo con Keycloak diferido
login de residentes desde WordPress diferido
pagos desde WordPress diferidos
reservas desde WordPress diferidas
consulta de saldos desde WordPress diferida
consulta de estados de cuenta desde WordPress diferida
consulta de comprobantes desde WordPress diferida
plugin WordPress avanzado diferido
bloques Gutenberg diferidos
shortcodes avanzados diferidos
sincronización bidireccional diferida
webhooks avanzados diferidos
LiteSpeed Cache purge diferido
GraphQL diferido
API keys servidor-servidor diferidas
```

Estos pendientes no bloquean `009-wordpress-integration-basic`.

---

## 37. Decisión final del test plan

El módulo `009-wordpress-integration-basic` deberá probarse con unit tests, DTO validation tests, application tests, repository integration tests, API tests, CORS tests, rate limit tests, cache header tests, authorization tests, multitenancy tests, security tests, audit integration tests, observability tests, OpenAPI tests, compatibility tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="m8w2d8"
- resolución segura de tenant por slug;
- exposición exclusiva de datos public-safe;
- bloqueo de datos financieros;
- bloqueo de datos personales privados;
- bloqueo de secretos;
- CORS restringido;
- rate limiting;
- cache público seguro;
- mapping WordPress-Core con permisos;
- auditoría de cambios de mapping;
- compatibilidad con CPT conjunto y ACF;
- no uso de WordPress como fuente transaccional;
- no acceso directo a PostgreSQL desde WordPress.
```

Ninguna implementación debe aceptarse si permite a WordPress leer directamente la base de datos del Core, si expone pagos/saldos/estados de cuenta/comprobantes, si expone datos personales de residentes o propietarios, si permite CORS wildcard en producción, si mezcla tenants por slug, si cachea información privada, si guarda tokens/secretos en mapping o si WordPress se convierte en fuente de verdad transaccional.
