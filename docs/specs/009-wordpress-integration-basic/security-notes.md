# Security Notes — Spec 009 WordPress Integration Basic

## 1. Información del documento

| Campo           | Valor                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                  |
| Spec ID         | 009                                                                                            |
| Módulo          | WordPress Integration Basic                                                                    |
| Documento       | Security Notes                                                                                 |
| Ruta            | `docs/specs/009-wordpress-integration-basic/security-notes.md`                                 |
| Versión         | 0.1                                                                                            |
| Estado          | needs-review                                                                                   |
| Fecha           | 2026-07-14                                                                                     |
| Documento base  | `docs/specs/009-wordpress-integration-basic/spec.md`                                           |
| Plan técnico    | `docs/specs/009-wordpress-integration-basic/plan.md`                                           |
| Modelo de datos | `docs/specs/009-wordpress-integration-basic/data-model.md`                                     |
| Contrato API    | `docs/specs/009-wordpress-integration-basic/api-contract.md`                                   |
| Plan de pruebas | `docs/specs/009-wordpress-integration-basic/test-plan.md`                                      |
| Tareas          | `docs/specs/009-wordpress-integration-basic/tasks.md`                                          |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `008-basic-reports` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `009-wordpress-integration-basic`.

El módulo conecta el portal WordPress multitenant con RESIDENT Core mediante endpoints públicos y endpoints administrativos protegidos.

Aunque la integración inicial es principalmente pública e informativa, tiene una superficie de riesgo importante porque conecta un CMS expuesto a internet con el sistema transaccional de RESIDENT Core.

Regla central:

```text id="y5ilyr"
WordPress puede consumir datos públicos controlados de RESIDENT Core, pero nunca debe acceder a datos financieros, datos personales privados, credenciales, configuraciones internas ni a la base de datos del Core.
```

---

## 3. Naturaleza de seguridad del módulo

`009-wordpress-integration-basic` no debe tratarse como una simple API pública. Debe tratarse como una frontera de seguridad entre:

```text id="h7hpes"
Internet público
    ↓
Portal WordPress
    ↓
RESIDENT Core Public API
    ↓
Datos publicables estrictamente controlados
```

La integración debe proteger:

* los datos transaccionales del Core;
* los datos financieros;
* los datos personales de residentes, propietarios y usuarios;
* la configuración multitenant;
* la relación WordPress-Core;
* los orígenes permitidos;
* la disponibilidad de endpoints públicos;
* la reputación del portal;
* la integridad del mapping entre CPT `conjunto` y tenant.

---

## 4. Principios de seguridad

### 4.1. API-only integration

WordPress debe integrarse exclusivamente mediante API.

Prohibido:

```text id="nflgve"
WordPress conectándose a PostgreSQL
WordPress usando credenciales de base de datos del Core
WordPress leyendo tablas internas del Core
WordPress escribiendo en tablas internas del Core
WordPress accediendo a servicios privados del Core
WordPress ejecutando scripts directos sobre infraestructura del Core
```

Permitido:

```text id="fn1rel"
WordPress consumiendo endpoints public-safe
WordPress usando fallback ACF para datos visuales
WordPress enlazando hacia portal de residentes futuro
WordPress mostrando branding público
WordPress mostrando información institucional pública
```

---

### 4.2. Datos públicos explícitos

Un dato solo puede salir por `/api/v1/public/...` si fue clasificado explícitamente como:

```text id="doj4ne"
public
publicDerived
```

Prohibido exponer:

```text id="bzf9su"
restricted
private
sensitive
```

---

### 4.3. Core como fuente de verdad transaccional

WordPress no debe convertirse en fuente de verdad para:

```text id="cry7iy"
tenants
usuarios
roles
permisos
residentes
propietarios
unidades
alícuotas
cargos
pagos
comprobantes
balances
estados de cuenta
auditoría
reportes financieros
```

WordPress puede conservar datos ACF como fallback visual, pero no puede guardar ni reconstruir datos transaccionales.

---

### 4.4. Tenant isolation por slug

Todo endpoint público debe resolver un único tenant a partir del slug.

Regla:

```text id="vqukgj"
slug -> tenant público visible -> datos public-safe del mismo tenant
```

Prohibido:

```text id="lluzaj"
mezclar datos entre tenants
resolver tenant por parámetros no validados
devolver datos de Tenant B con slug de Tenant A
inferir existencia de tenants privados
exponer tenantId interno innecesariamente
```

---

### 4.5. CORS restringido

CORS no es autorización, pero sí es un control importante para consumo desde navegador.

Prohibido en producción:

```text id="j8m7sp"
Access-Control-Allow-Origin: *
```

Permitido:

```text id="qevws2"
Access-Control-Allow-Origin: https://www.resident.gustavoguaigua.com
Vary: Origin
```

---

### 4.6. Endpoints públicos controlados

Los endpoints públicos no requieren login del visitante, pero sí deben tener controles.

Obligatorio:

```text id="xyu44j"
slug validation
tenant active check
public visibility check
field allowlist
rate limiting
CORS policy
safe cache headers
safe logging
safe errors
OpenAPI public-safe
```

---

### 4.7. Endpoints administrativos protegidos

Los endpoints de mapping WordPress-Core son administrativos.

Deben requerir:

```text id="umoboo"
AuthGuard
TenantGuard o PlatformPermissionGuard
TenantPermissionGuard cuando aplique
permisos específicos
auditoría
validación estricta
```

Permisos tenant:

```text id="fy6j3s"
integrations.wordpress.read
integrations.wordpress.update
```

Permisos platform:

```text id="uxfoep"
integrations.wordpress.platform.read
integrations.wordpress.platform.update
```

---

### 4.8. No secretos en WordPress mapping

`tenant_wordpress_mappings` no debe almacenar:

```text id="x6wqj4"
accessToken
refreshToken
idToken
apiKey completa
clientSecret
authorizationHeader
cookie
sessionId
databaseUrl
connectionString
privateKey
```

---

### 4.9. Cache seguro

Solo los datos public-safe pueden cachearse públicamente.

Regla:

```text id="ynsm8x"
Cache-Control: public solo aplica a respuestas públicas que no contienen datos privados, financieros, personales ni tokens.
```

---

### 4.10. Auditoría selectiva

No auditar cada visita pública ordinaria.

Auditar:

```text id="wirtdx"
cambios de mapping
cambios de perfil público
cambios de visibilidad pública
origin denegado relevante
validaciones fallidas relevantes
intentos administrativos denegados
```

---

## 5. Activos protegidos

### 5.1. Activos de RESIDENT Core

```text id="er0ziu"
tenants
tenant_public_profiles
tenant_wordpress_mappings
user_profiles
memberships
roles
permissions
audit_logs
financial records
resident records
property records
```

---

### 5.2. Activos de WordPress

```text id="a2h2rm"
CPT conjunto
ACF fields
single-conjunto.php
media library
LiteSpeed Cache
WordPress admin users
WordPress URLs
WordPress slugs
```

---

### 5.3. Activos de integración

```text id="mlkkl3"
wordpressSlug
publicSlug
wordpressUrl
wordpressAllowedOrigin
externalPublicId
wordpressPostId
public profile data
public branding
public contact
residentPortalUrl
cache headers
CORS configuration
```

---

### 5.4. Activos que no deben cruzar la frontera pública

```text id="usq51s"
balances
payments
charges
account statements
payment receipts
resident names
owner names
personal emails
personal phones
identification numbers
role assignments
permissions
audit metadata
tokens
secrets
database credentials
```

---

## 6. Clasificación de datos

### 6.1. Datos públicos permitidos

```text id="ah88vl"
tenantPublicId
publicSlug
publicName
slogan
publicDescription
history
mission
vision
publicRulesSummary
logoUrl
bannerUrl
primaryColor
secondaryColor
galleryUrls
websiteUrl
residentPortalUrl
publicEmail
publicPhone
publicWhatsapp
publicAddress
socialLinks
```

---

### 6.2. Datos publicDerived permitidos

```text id="ml2b4u"
hasResidentPortal
hasPublicAnnouncements
hasPublicCommonAreas
publicStatus
displayLabels
publicFeatureFlags
```

---

### 6.3. Datos restricted

No deben salir por endpoints públicos ordinarios:

```text id="fb3117"
wordpressAllowedOrigin
externalPublicId
wordpressPostId
wordpressSiteId
integrationStatus
lastSyncedAt
lastValidatedAt
internalValidationErrors
```

---

### 6.4. Datos private

```text id="qr3g2o"
tenantId interno
createdBy
updatedBy
internal notes
internal configuration
platform configuration
membership data
```

---

### 6.5. Datos sensitive

```text id="ojxmmg"
tokens
api keys
secrets
cookies
authorization headers
database credentials
payment data
account statements
receipts
resident personal data
owner personal data
audit oldValue
audit newValue
audit metadata completa
```

Regla:

```text id="eq03sw"
Los endpoints públicos solo pueden exponer datos public y publicDerived.
```

---

## 7. Superficies de ataque

### 7.1. Endpoints públicos

```text id="f85uv7"
GET /api/v1/public/tenants/{slug}
GET /api/v1/public/tenants/{slug}/branding
GET /api/v1/public/tenants/{slug}/contact
GET /api/v1/public/tenants/{slug}/links
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Riesgos:

* enumeración de tenants;
* abuso por scraping;
* CORS mal configurado;
* cache incorrecto;
* exposición accidental de campos privados;
* slug injection;
* path traversal;
* fuga de URLs internas;
* mezcla de tenants.

Controles:

```text id="i8njmj"
slug validation
public DTO allowlist
tenant status active
public profile visible/published
rate limiting
CORS allowlist
cache policy
safe errors
OpenAPI public-safe tests
```

---

### 7.2. Endpoints administrativos tenant

```text id="fnbg7c"
GET /api/v1/tenant/integrations/wordpress
PATCH /api/v1/tenant/integrations/wordpress
```

Riesgos:

* modificación no autorizada del mapping;
* activación pública indebida;
* origin malicioso;
* URL insegura;
* slug duplicado;
* inyección de secrets en metadata;
* cross-tenant update.

Controles:

```text id="agljkj"
AuthGuard
TenantGuard
TenantPermissionGuard
integrations.wordpress.read
integrations.wordpress.update
tenant context server-side
DTO strict
audit update
duplicate validation
URL validation
origin validation
secret rejection
```

---

### 7.3. Endpoints administrativos platform

```text id="o4sl0v"
GET /api/v1/platform/tenants/{tenantId}/integrations/wordpress
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

Riesgos:

* PlatformAdmin mal configurando tenants;
* modificación de mapping de cualquier tenant;
* errores de configuración global;
* exposición de configuración restricted;
* abuso de permisos platform.

Controles:

```text id="vqy2kd"
AuthGuard
PlatformPermissionGuard
integrations.wordpress.platform.read
integrations.wordpress.platform.update
tenantId validation
audit update
least privilege
safe error handling
```

---

### 7.4. WordPress template integration

Punto típico:

```text id="g1vg84"
single-conjunto.php
```

Riesgos:

* exponer API keys en frontend;
* llamadas inseguras desde JavaScript;
* no manejar fallback;
* imprimir datos sin escape;
* confiar en datos no sanitizados;
* introducir XSS en plantillas.

Controles:

```text id="l79hp6"
solo endpoints públicos
sin secretos en navegador
escape HTML en WordPress
sanitización de output
fallback ACF controlado
no datos transaccionales
timeouts en llamadas HTTP
cache local controlado
```

---

### 7.5. Cache y CDN

Riesgos:

* cachear datos privados;
* cachear errores sensibles;
* servir respuesta de un tenant a otro;
* TTL excesivo;
* invalidación tardía.

Controles:

```text id="dnuans"
Cache-Control solo para public-safe
Vary: Origin cuando aplique
ETag por recurso público
Last-Modified por public profile
TTL corto MVP
no public cache para admin endpoints
```

---

## 8. Amenazas principales

## 8.1. Exposición financiera pública

### Descripción

Un endpoint público devuelve saldos, pagos, cargos, estados de cuenta, comprobantes o morosidad.

### Impacto

Crítico.

### Controles

```text id="m51ft7"
field allowlist
PublicFieldClassificationService
public DTOs
security tests
OpenAPI negative tests
code review
```

### Pruebas asociadas

```text id="gl400i"
SEC-WP-FIN-001 a SEC-WP-FIN-006
NEG-WP-001 a NEG-WP-004
```

---

## 8.2. Exposición de datos personales privados

### Descripción

La API pública expone nombres de residentes, propietarios, identificaciones, emails personales, teléfonos personales o relaciones privadas.

### Impacto

Crítico.

### Controles

```text id="m6tkcz"
public DTO allowlist
no residents/owners endpoints públicos
field classification
personal data tests
no private relation mapping in public response
```

### Pruebas asociadas

```text id="xg9r53"
SEC-WP-PDATA-001 a SEC-WP-PDATA-005
```

---

## 8.3. CORS abierto en producción

### Descripción

La API permite cualquier origin mediante wildcard.

### Impacto

Alto.

### Controles

```text id="qg9chu"
WordPressOrigin VO
WordPressCorsPolicyService
environment-aware CORS
no wildcard in production
CORS tests
```

### Pruebas asociadas

```text id="dle0f6"
CORS-WP-001 a CORS-WP-009
```

---

## 8.4. Tenant incorrecto por slug

### Descripción

Un slug público resuelve datos de otro tenant.

### Impacto

Crítico.

### Controles

```text id="q6ri55"
publicSlug unique
wordpressSlug unique
tenant active check
visibility/status check
repository tenant filter
multitenancy tests
```

### Pruebas asociadas

```text id="qg5l5z"
MT-WP-001 a MT-WP-011
```

---

## 8.5. Slug injection o path traversal

### Descripción

Un atacante envía slug con secuencias peligrosas.

Ejemplos:

```text id="u2c0kf"
../tenant
tenant/other
<script>
%2e%2e%2f
```

### Impacto

Alto.

### Controles

```text id="bt3fa8"
WordPressSlug VO
regex estricta
URL decoding seguro
parameterized queries
safe errors
```

---

## 8.6. Cache de información privada

### Descripción

Una respuesta con datos privados se cachea públicamente.

### Impacto

Crítico.

### Controles

```text id="dcim81"
PublicCachePolicy
no public cache on admin endpoints
no private data in public DTOs
cache tests
security tests
```

---

## 8.7. Mapping malicioso

### Descripción

Un usuario autorizado o atacante configura un origin o URL malicioso.

Ejemplos:

```text id="d797sq"
javascript:alert(1)
https://evil.example.com
file:///etc/passwd
https://www.resident.gustavoguaigua.com/path-como-origin
```

### Impacto

Alto.

### Controles

```text id="nibv5b"
WordPressUrl VO
WordPressOrigin VO
DTO strict validation
origin allowlist
admin permissions
audit event
```

---

## 8.8. Secretos guardados en mapping

### Descripción

El mapping guarda tokens, cookies, client secrets o credenciales.

### Impacto

Crítico.

### Controles

```text id="ussgds"
DTO denylist
schema sin campos de secret
validation de claves prohibidas
security tests
audit sanitization
```

---

## 8.9. WordPress como fuente transaccional

### Descripción

WordPress almacena pagos, saldos, estados de cuenta o datos de residentes.

### Impacto

Crítico.

### Controles

```text id="mfiq3k"
arquitectura API-only
no endpoints públicos financieros
no fallback financiero ACF
compatibility tests
PR checklist
```

---

## 8.10. XSS por contenido público

### Descripción

Contenido público como historia, misión, visión, comunicados o descripciones se imprime en WordPress sin escape.

### Impacto

Alto.

### Controles

```text id="okzug5"
sanitización en Core si aplica
escape en WordPress
content security policy futura
no scripts en campos públicos
validación de HTML permitido si se habilita rich text
```

---

## 9. Controles por endpoint

## 9.1. Public Tenant

Endpoint:

```text id="xsgeaz"
GET /api/v1/public/tenants/{slug}
```

Controles:

```text id="o0txul"
slug validation
tenant active check
public profile visible/published
field allowlist
rate limiting
cache public-safe
safe error 404
```

No debe exponer:

```text id="wouy10"
tenantId interno
integrationStatus
wordpressAllowedOrigin
residentes
propietarios
pagos
saldos
roles
permisos
```

---

## 9.2. Branding

Endpoint:

```text id="qkudlt"
GET /api/v1/public/tenants/{slug}/branding
```

Controles:

```text id="davb3x"
slug validation
public profile visible/published
URL validation
color validation
no internal storage paths
cache public-safe
```

---

## 9.3. Contact

Endpoint:

```text id="j51rrr"
GET /api/v1/public/tenants/{slug}/contact
```

Controles:

```text id="hd0fz4"
institutional contact only
no personal contacts
social links validation
public-safe DTO
cache public-safe
```

---

## 9.4. Links

Endpoint:

```text id="n6vbyw"
GET /api/v1/public/tenants/{slug}/links
```

Controles:

```text id="jpqepr"
HTTPS URL validation
no tokens
no session IDs
no internal admin URLs
no private service URLs
```

---

## 9.5. Announcements

Endpoints:

```text id="tkkvtr"
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
```

Controles:

```text id="sdb991"
visibility = public
status = published
tenant filter
no private attachments
pagination
rate limiting
safe content rendering
```

---

## 9.6. Common Areas

Endpoints:

```text id="wbv4f6"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Controles:

```text id="zmooon"
status = active
isPublicVisible = true
tenant filter
no booking calendar
no reservation data
no personal data
no payment data
```

---

## 9.7. Tenant Mapping

Endpoints:

```text id="tqudfa"
GET /api/v1/tenant/integrations/wordpress
PATCH /api/v1/tenant/integrations/wordpress
```

Controles:

```text id="ysujlx"
AuthGuard
TenantGuard
TenantPermissionGuard
integrations.wordpress.read/update
tenant from context
no tenantId from body
strict DTO validation
audit update
```

---

## 9.8. Platform Mapping

Endpoints:

```text id="jyiov3"
GET /api/v1/platform/tenants/{tenantId}/integrations/wordpress
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

Controles:

```text id="j5w9yo"
AuthGuard
PlatformPermissionGuard
integrations.wordpress.platform.read/update
tenantId validation
strict DTO validation
audit update
```

---

## 10. Reglas de CORS

### 10.1. Producción

Prohibido:

```text id="engfgj"
Access-Control-Allow-Origin: *
```

Permitido:

```text id="g4gww4"
Access-Control-Allow-Origin: https://www.resident.gustavoguaigua.com
Vary: Origin
```

---

### 10.2. Validación de origin

Un origin válido debe tener:

```text id="nnh3q9"
scheme
host
optional port
sin path
sin query
sin fragment
```

Ejemplo válido:

```text id="lhmf7t"
https://www.resident.gustavoguaigua.com
```

Ejemplo inválido:

```text id="nyykwh"
https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2
```

---

### 10.3. Localhost

Permitido solo en desarrollo explícito:

```text id="j5xahv"
http://localhost:3000
http://localhost:8080
```

---

### 10.4. Null origin

Debe rechazarse:

```text id="qq2vfm"
Origin: null
```

---

## 11. Reglas de cache

### 11.1. Cache permitido

Permitido en endpoints públicos que devuelven solo datos public-safe:

```text id="xhr15h"
Cache-Control: public, max-age=300
ETag
Last-Modified
```

---

### 11.2. Cache no permitido

No aplicar public cache a:

```text id="c0bubk"
endpoints administrativos
respuestas con datos privados
respuestas con errores sensibles
respuestas con tokens
respuestas con cookies
datos financieros
datos personalizados por usuario
```

---

### 11.3. 404 público

Para slugs inexistentes puede usarse TTL corto:

```text id="p1v3fe"
Cache-Control: public, max-age=60
```

Siempre evitando revelar si un tenant existe internamente pero no es visible.

---

### 11.4. Vary

Cuando CORS varía por origin, incluir:

```text id="ib8pv7"
Vary: Origin
```

---

## 12. Reglas de rate limiting

Aplicar rate limiting a todos los endpoints públicos.

Configuración inicial sugerida:

```text id="xjd5ju"
PUBLIC_API_RATE_LIMIT_WINDOW_SECONDS=60
PUBLIC_API_RATE_LIMIT_MAX_REQUESTS=120
PUBLIC_DETAIL_RATE_LIMIT_MAX_REQUESTS=60
```

Objetivos:

* evitar scraping;
* reducir enumeración de tenants;
* proteger disponibilidad;
* mitigar abuso de WordPress public endpoints;
* evitar consumo excesivo del Core.

Respuesta esperada:

```json id="yz496a"
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 13. Reglas de validación

### 13.1. Slug

Patrón:

```text id="u4gro9"
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Longitud:

```text id="v7pbpd"
3 <= length <= 120
```

Rechazar:

```text id="xufk0j"
slash
backslash
path traversal
HTML
scripts
spaces
encoded traversal
query fragments
```

---

### 13.2. URL

Permitido en producción:

```text id="o793x7"
https://...
```

Rechazar:

```text id="bf69s9"
javascript:
file:
data:
ftp:
http externo en producción
```

---

### 13.3. Origin

Rechazar:

```text id="l4wx9s"
*
null
file://
origins con path
origins con query
origins con fragment
```

---

### 13.4. Colores

Permitir:

```text id="gqojj9"
#RGB
#RRGGBB
```

---

### 13.5. Body administrativo

Rechazar o ignorar de forma segura:

```text id="z1xtob"
tenantId
createdBy
updatedBy
accessToken
refreshToken
idToken
apiKey
clientSecret
authorizationHeader
cookie
databaseUrl
connectionString
privateKey
```

Recomendación:

```text id="p5a0cs"
Rechazar con 422 si se reciben campos prohibidos.
```

---

## 14. Reglas de datos públicos

### 14.1. PublicTenantDto

Permitido:

```text id="efmk3g"
tenantPublicId
slug
publicName
slogan
publicDescription
websiteUrl
residentPortalUrl
```

Prohibido:

```text id="le2u9s"
tenantId interno
status interno completo
integrationStatus
roles
permissions
financial data
personal data
```

---

### 14.2. PublicBrandingDto

Permitido:

```text id="mgp4tb"
logoUrl
bannerUrl
primaryColor
secondaryColor
galleryUrls
```

Prohibido:

```text id="ammcph"
storage internal paths
private bucket paths
signed URLs de recursos privados no publicables
file system paths
```

---

### 14.3. PublicContactDto

Permitido:

```text id="lc6tpt"
publicEmail
publicPhone
publicWhatsapp
publicAddress
socialLinks
```

Prohibido:

```text id="gxszbg"
emails personales
teléfonos personales
datos de residentes
datos de propietarios
contactos de emergencia
```

---

### 14.4. PublicLinksDto

Permitido:

```text id="v8xgze"
websiteUrl
residentPortalUrl
```

Prohibido:

```text id="cmm8xe"
tokens en URL
session IDs
URLs internas de administración
URLs privadas de servicios
URLs con credenciales embebidas
```

---

## 15. Reglas de mapping seguro

### 15.1. `wordpressSlug`

Debe ser único.

```text id="x0zlw9"
tenant_wordpress_mappings.wordpress_slug unique
```

---

### 15.2. `wordpressAllowedOrigin`

Debe ser origin, no URL completa.

Correcto:

```text id="ky5ae8"
https://www.resident.gustavoguaigua.com
```

Incorrecto:

```text id="fe4uzn"
https://www.resident.gustavoguaigua.com/conjuntos/portal-del-rio
```

---

### 15.3. `wordpressUrl`

Debe ser una URL HTTPS en producción.

Ejemplo:

```text id="d8dhqn"
https://www.resident.gustavoguaigua.com/conjuntos/portal-del-rio
```

---

### 15.4. `externalPublicId`

Puede guardar referencia externa como:

```text id="jnpfr3"
wp_post_123
```

No debe guardar secretos ni tokens.

---

### 15.5. `integrationStatus`

Valores permitidos:

```text id="lrjlx9"
pending
active
disabled
error
archived
```

Solo `active` debe permitir integración ordinaria.

---

## 16. Seguridad del modelo de datos

### 16.1. `tenant_public_profiles`

No debe contener:

```text id="p2zilj"
balance
debt
payment
charge
statement
receipt
residentName
ownerName
identificationNumber
personalEmail
personalPhone
emergencyContact
token
secret
apiKey
```

---

### 16.2. `tenant_wordpress_mappings`

No debe contener:

```text id="uy54y6"
apiKey
clientSecret
accessToken
refreshToken
cookie
authorizationHeader
databaseUrl
connectionString
privateKey
```

---

### 16.3. `publicMetadata`

Permitido:

```text id="rbu4bq"
displayPreferences
publicBadges
publicLabels
publicFeatureFlags
```

Prohibido:

```text id="dafxqn"
financialData
personalData
internalConfig
tokens
secrets
rawPayload
privateNotes
```

---

## 17. Seguridad de WordPress

### 17.1. Plantilla PHP

Al consumir API desde `single-conjunto.php`:

Obligatorio:

```text id="d9e1xg"
usar timeouts HTTP
manejar error de Core
escapar output HTML
sanitizar URLs
usar fallback ACF solo para datos públicos
no imprimir respuestas crudas
no guardar secretos en plantilla
```

---

### 17.2. JavaScript frontend

Permitido solo para endpoints públicos.

Prohibido:

```text id="jj82gy"
enviar cookies del Core
enviar tokens
guardar secretos en JS
llamar endpoints administrativos
llamar endpoints privados
```

---

### 17.3. ACF fallback

Permitido:

```text id="xz332r"
logo
banner
colores
slogan
contacto institucional
historia
misión
visión
fotos públicas
```

Prohibido:

```text id="gbcgwd"
saldos
pagos
estados de cuenta
comprobantes
datos personales privados
credenciales
```

---

### 17.4. WordPress Admin

El administrador de WordPress no debe tener por defecto permisos sobre datos del Core.

Regla:

```text id="gbscoi"
Administrar contenido en WordPress no equivale a administrar datos transaccionales en RESIDENT Core.
```

---

## 18. Auditoría

### 18.1. Eventos obligatorios

```text id="zutskq"
tenant.wordpressMapping.updated
tenant.publicProfile.updated
tenant.publicVisibility.updated
wordpress.integration.updated
```

---

### 18.2. Eventos recomendados

```text id="fznymb"
wordpress.origin.denied
wordpress.publicEndpoint.accessDenied
wordpress.tenantSlug.notFound
wordpress.publicResource.notFound
wordpress.integration.validationFailed
```

---

### 18.3. No auditar visitas ordinarias

No auditar cada request público exitoso porque generaría volumen excesivo y bajo valor.

Sí registrar métricas agregadas.

---

### 18.4. Metadata permitida

```json id="kc2nph"
{
  "tenantId": "tenant_uuid",
  "wordpressSlug": "portal-del-rio",
  "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/portal-del-rio",
  "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
  "integrationStatus": "active",
  "isPublicVisible": true,
  "changedFields": [
    "wordpressSlug",
    "wordpressAllowedOrigin"
  ],
  "traceId": "req_123456"
}
```

---

### 18.5. Metadata prohibida

```text id="n0lubq"
payload completo
headers completos
cookies
accessToken
refreshToken
apiKey
clientSecret
databaseUrl
connectionString
datos financieros
datos personales privados
```

---

## 19. Logs y métricas

### 19.1. Logs permitidos

```text id="flf3k0"
traceId
requestId
endpoint
outcome
cacheStatus
durationMs
errorCode
originAllowed true/false
```

---

### 19.2. Logs prohibidos

```text id="gnpfyp"
payload completo
headers completos
Authorization header
cookies
tokens
secrets
datos financieros
datos personales privados
connection strings
stack trace en producción
```

---

### 19.3. Métricas permitidas

```text id="jwlenz"
wordpress_public_requests_total
wordpress_public_requests_denied_total
wordpress_public_request_latency_ms
wordpress_public_cache_hit_total
wordpress_public_cache_miss_total
wordpress_mapping_updates_total
wordpress_public_rate_limited_total
wordpress_origin_denied_total
```

Labels permitidos:

```text id="vx08ip"
endpoint
outcome
cacheStatus
```

Labels prohibidos:

```text id="xk4jcs"
tenantId
slug
ipAddress
userAgent
token
actorUserId
```

---

## 20. Errores seguros

### 20.1. Error estándar

```json id="dagkog"
{
  "error": {
    "code": "PUBLIC_TENANT_NOT_FOUND",
    "message": "The requested public tenant was not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 20.2. No revelar

```text id="aj4zc6"
si el tenant existe internamente
si el tenant está suspendido
si el tenant está hidden
si el slug pertenece a otro tenant
SQL
stack trace
Prisma error raw
configuración interna
```

---

### 20.3. Recomendación para tenants no publicables

Responder:

```text id="vf0s8e"
404 PUBLIC_TENANT_NOT_FOUND
```

Aunque exista internamente, para evitar enumeración.

---

## 21. Reglas SQL / Prisma

### 21.1. Consultas públicas

Toda consulta pública debe verificar:

```text id="e4b8fa"
tenant.status = active
profile.visibility = visible
profile.status = published
profile.archivedAt IS NULL
```

---

### 21.2. Mapping público

Debe verificar:

```text id="l5mqaq"
tenant.status = active
mapping.integrationStatus = active
mapping.isPublicVisible = true
mapping.archivedAt IS NULL
```

---

### 21.3. Prohibido

```text id="n9i5xo"
SELECT *
retornar entidades completas
concatenar slug en SQL raw
concatenar origin en SQL raw
omitir tenant/status/visibility checks
consultar datos financieros desde public repository
consultar residentes/propietarios desde public repository
```

---

### 21.4. `$queryRaw`

Permitido solo si:

```text id="l3onnb"
usa parámetros bind
no concatena input
está encapsulado
tiene tests
aplica allowlist de campos
```

---

## 22. OpenAPI seguro

OpenAPI debe documentar endpoints públicos con extensiones:

```yaml id="t3qsbv"
x-public-safe: true
x-tenant-resolution: slug
x-auth-required: false
x-cors-restricted: true
x-cacheable: true
x-rate-limited: true
x-no-financial-data: true
x-no-private-personal-data: true
```

Endpoints administrativos:

```yaml id="p8vfhq"
x-required-permission: integrations.wordpress.update
x-tenant-scope: tenant
x-audit-event: tenant.wordpressMapping.updated
x-auth-required: true
```

OpenAPI no debe documentar:

```text id="ymttvq"
POST /api/v1/public/tenants/{slug}
PATCH /api/v1/public/tenants/{slug}
DELETE /api/v1/public/tenants/{slug}
endpoints públicos de pagos
endpoints públicos de saldos
endpoints públicos de estados de cuenta
endpoints públicos de comprobantes
endpoints públicos de residentes
endpoints públicos de propietarios
```

---

## 23. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="xp2ckf"
- slug inválido devuelve 422;
- tenant suspendido devuelve 404 público;
- tenant inactive devuelve 404 público;
- perfil hidden devuelve 404 público;
- perfil draft devuelve 404 público;
- endpoint público no requiere Authorization;
- endpoint público no expone tenantId interno;
- endpoint público no expone saldos;
- endpoint público no expone pagos;
- endpoint público no expone cargos;
- endpoint público no expone estados de cuenta;
- endpoint público no expone comprobantes;
- endpoint público no expone residentes;
- endpoint público no expone propietarios;
- endpoint público no expone roles;
- endpoint público no expone permisos;
- endpoint público no expone audit logs;
- CORS wildcard en producción falla;
- origin no permitido se bloquea;
- origin de Tenant B no autoriza Tenant A;
- rate limit devuelve 429;
- cache público no aplica en endpoints admin;
- mapping update requiere permiso;
- mapping update rechaza secrets;
- mapping update audita cambio;
- tenant admin A no actualiza mapping B;
- platform endpoint requiere permiso platform;
- OpenAPI no documenta endpoints públicos de escritura;
- WordPress fallback ACF no inventa datos financieros.
```

---

## 24. Checklist de seguridad para PR

Antes de aprobar un PR de `009-wordpress-integration-basic`:

```text id="l4l8v1"
[ ] WordPress no accede directamente a PostgreSQL.
[ ] No se agregan credenciales DB en WordPress.
[ ] Endpoints públicos solo usan GET.
[ ] Endpoints públicos no requieren sesión.
[ ] Endpoints públicos validan slug.
[ ] Endpoints públicos validan tenant activo.
[ ] Endpoints públicos validan perfil visible/published.
[ ] Endpoints públicos aplican DTO allowlist.
[ ] Endpoints públicos no exponen saldos.
[ ] Endpoints públicos no exponen pagos.
[ ] Endpoints públicos no exponen cargos.
[ ] Endpoints públicos no exponen estados de cuenta.
[ ] Endpoints públicos no exponen comprobantes.
[ ] Endpoints públicos no exponen residentes.
[ ] Endpoints públicos no exponen propietarios.
[ ] Endpoints públicos no exponen emails personales.
[ ] Endpoints públicos no exponen teléfonos personales.
[ ] Endpoints públicos no exponen identificaciones.
[ ] Endpoints públicos no exponen roles.
[ ] Endpoints públicos no exponen permisos.
[ ] Endpoints públicos no exponen audit_logs.
[ ] Endpoints públicos aplican rate limiting.
[ ] Endpoints públicos aplican CORS restringido.
[ ] CORS no usa wildcard en producción.
[ ] CORS incluye Vary: Origin cuando aplica.
[ ] Cache-Control public solo se usa para datos public-safe.
[ ] Admin endpoints no usan public cache.
[ ] tenant_public_profiles no contiene datos financieros.
[ ] tenant_public_profiles no contiene datos personales privados.
[ ] tenant_wordpress_mappings no contiene tokens/secrets/cookies.
[ ] publicMetadata no contiene datos privados.
[ ] Mapping tenant requiere integrations.wordpress.read/update.
[ ] Mapping platform requiere permisos platform.
[ ] Mapping update no acepta tenantId desde body tenant.
[ ] Mapping valida wordpressSlug.
[ ] Mapping valida wordpressUrl.
[ ] Mapping valida wordpressAllowedOrigin.
[ ] Mapping valida duplicidad.
[ ] Mapping audita cambios.
[ ] Logs no contienen headers completos.
[ ] Logs no contienen cookies.
[ ] Logs no contienen tokens.
[ ] Logs no contienen datos financieros.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan slug.
[ ] Métricas no usan ipAddress.
[ ] OpenAPI marca endpoints públicos como public-safe.
[ ] OpenAPI no documenta endpoints públicos financieros.
[ ] OpenAPI no documenta endpoints públicos de escritura.
[ ] Tests CORS pasan.
[ ] Tests de no exposición financiera pasan.
[ ] Tests de no exposición personal pasan.
[ ] Tests multitenant pasan.
[ ] Tests de auditoría pasan.
[ ] CI pasa.
```

---

## 25. Riesgos residuales aceptados en MVP

| Riesgo                                 | Estado   | Justificación                                |
| -------------------------------------- | -------- | -------------------------------------------- |
| Sin SSO Keycloak desde WordPress       | Aceptado | Diferido a spec futura                       |
| Sin login de residentes en WordPress   | Aceptado | Requiere portal autenticado                  |
| Sin plugin WordPress avanzado          | Aceptado | MVP puede usar plantilla y API pública       |
| Sin sincronización bidireccional       | Aceptado | Requiere webhooks e idempotencia             |
| Sin purge automático LiteSpeed         | Aceptado | TTL corto cubre MVP                          |
| Sin GraphQL                            | Aceptado | REST es suficiente para MVP                  |
| Sin API keys server-to-server          | Aceptado | Endpoints iniciales son públicos controlados |
| Sin disponibilidad pública de reservas | Aceptado | Requiere módulo de reservas y auth           |

---

## 26. Pendientes de seguridad para specs futuras

### 26.1. `00X-keycloak-sso`

Debe cubrir:

```text id="sgwse6"
OIDC flow
redirect URIs
PKCE
logout
session handling
token storage
WordPress login button
resident portal authentication
```

---

### 26.2. `00X-wordpress-plugin`

Debe cubrir:

```text id="yxwp1e"
plugin hardening
settings storage
nonces
capabilities
shortcodes
Gutenberg blocks
server-side API consumption
secret management si aplica
```

---

### 26.3. `00X-wordpress-sync`

Debe cubrir:

```text id="gnkfge"
webhooks
signatures
idempotency
retry
conflict resolution
sync status
audit trail
```

---

### 26.4. `00X-cache-invalidation`

Debe cubrir:

```text id="mjz40a"
LiteSpeed Cache purge
event-based invalidation
ETag refresh
stale-while-revalidate
cache poisoning protection
```

---

### 26.5. `00X-wordpress-payments`

Debe cubrir:

```text id="csqzcu"
autenticación fuerte
autorización por residente
CSRF
idempotencia
pasarela de pagos
comprobantes
auditoría financiera
no exposición pública
```

---

### 26.6. `00X-wordpress-reservations`

Debe cubrir:

```text id="vxd090"
autenticación de residente
autorización por tenant/unidad
disponibilidad
calendario
reglas de reserva
pagos si aplica
auditoría
```

---

## 27. Criterios de aceptación de seguridad

La spec `009-wordpress-integration-basic` cumple seguridad si:

* WordPress consume únicamente APIs públicas controladas;
* WordPress no accede a PostgreSQL;
* no existen endpoints públicos de escritura;
* los endpoints públicos validan slug;
* los endpoints públicos resuelven tenants activos y visibles;
* los endpoints públicos no exponen datos financieros;
* los endpoints públicos no exponen datos personales privados;
* los endpoints públicos no exponen roles ni permisos;
* los endpoints públicos no exponen auditoría;
* CORS está restringido;
* no hay wildcard CORS en producción;
* rate limiting está activo;
* cache headers son seguros;
* los endpoints administrativos requieren permisos;
* los cambios de mapping se auditan;
* mapping no guarda secretos;
* URLs y origins se validan;
* logs están sanitizados;
* métricas evitan alta cardinalidad sensible;
* OpenAPI documenta controles public-safe;
* tests de seguridad pasan;
* CI pasa.

---

## 28. Decisión final de seguridad

El módulo `009-wordpress-integration-basic` será tratado como una frontera crítica entre el portal público WordPress y RESIDENT Core.

La seguridad del módulo se basa en:

```text id="datbx5"
API-only integration
public-safe DTOs
strict field allowlist
slug-based tenant resolution
tenant active check
public visibility check
no financial exposure
no private personal data exposure
restricted CORS
rate limiting
safe public cache
secure mapping validation
admin permission separation
audit of configuration changes
safe logging
safe metrics
OpenAPI consistency
WordPress fallback controlado
```

No se aceptará una implementación si WordPress accede directamente a la base de datos del Core, si se exponen pagos, saldos, cargos, estados de cuenta, comprobantes, datos personales privados, roles, permisos, audit logs, tokens, cookies o secretos; si CORS queda abierto con wildcard en producción; si se mezclan tenants por slug; si se cachea información privada; si se crean endpoints públicos de escritura; o si WordPress se convierte en fuente de verdad transaccional.
