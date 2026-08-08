# API Contract — Spec 009 WordPress Integration Basic

## 1. Información del documento

| Campo               | Valor                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Proyecto            | RESIDENT Core                                                                                  |
| Spec ID             | 009                                                                                            |
| Módulo              | WordPress Integration Basic                                                                    |
| Documento           | API Contract                                                                                   |
| Ruta                | `docs/specs/009-wordpress-integration-basic/api-contract.md`                                   |
| Versión             | 0.1                                                                                            |
| Estado              | Borrador inicial                                                                               |
| Fecha               | 2026-07-14                                                                                     |
| Documento base      | `docs/specs/009-wordpress-integration-basic/spec.md`                                           |
| Plan técnico        | `docs/specs/009-wordpress-integration-basic/plan.md`                                           |
| Modelo de datos     | `docs/specs/009-wordpress-integration-basic/data-model.md`                                     |
| API Style           | REST                                                                                           |
| API Version         | `/api/v1`                                                                                      |
| Integración externa | WordPress                                                                                      |
| Autorización        | Endpoints públicos controlados + endpoints administrativos protegidos                          |
| Depende de          | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `008-basic-reports` |

---

## 2. Propósito

Este documento define el contrato API para la integración básica entre WordPress y RESIDENT Core.

El objetivo es permitir que el portal WordPress multitenant consuma información pública, controlada y tenant-scoped desde RESIDENT Core, sin acceso directo a la base de datos, sin exponer datos financieros, sin exponer datos personales privados y sin convertir WordPress en fuente de verdad transaccional.

Regla central:

```text id="z2t1wd"
La API de integración WordPress debe exponer únicamente datos public-safe, resolver tenants por slug, aplicar controles de CORS/rate limiting/cache y mantener separada la información pública de la información transaccional privada.
```

---

## 3. Principios del contrato API

### 3.1. API-first

WordPress debe consumir RESIDENT Core mediante API REST.

Prohibido:

```text id="ggvpae"
WordPress conectándose a PostgreSQL
WordPress leyendo tablas internas
WordPress escribiendo en tablas internas
WordPress usando credenciales de base de datos
WordPress accediendo a servicios privados del Core
```

---

### 3.2. Public-safe por defecto

Los endpoints públicos solo pueden devolver datos clasificados como:

```text id="rd6cfw"
public
publicDerived
```

No deben devolver datos:

```text id="fqm4yv"
restricted
private
sensitive
```

---

### 3.3. Resolución por slug

Los endpoints públicos resuelven tenant por slug:

```text id="kn17f4"
/api/v1/public/tenants/{slug}
```

El `slug` debe ser validado estrictamente.

---

### 3.4. Sin autenticación de usuario final para endpoints públicos

Los endpoints públicos no requieren login del visitante.

Sin embargo, deben aplicar:

```text id="yteprd"
slug validation
tenant active check
public visibility check
CORS policy
rate limiting
safe DTO mapping
safe cache headers
safe logging
```

---

### 3.5. Endpoints administrativos protegidos

Los endpoints para consultar o modificar mapping WordPress-Core requieren autenticación y permisos.

Tenant scope:

```text id="hii3di"
integrations.wordpress.read
integrations.wordpress.update
```

Platform scope:

```text id="qxjqty"
integrations.wordpress.platform.read
integrations.wordpress.platform.update
```

---

### 3.6. Sin datos financieros públicos

Los endpoints `/api/v1/public/...` nunca deben exponer:

```text id="j4tlmh"
saldos
deuda
pagos
cargos
alícuotas personales
mora individual
estados de cuenta
comprobantes
asignaciones de pago
```

---

### 3.7. Sin datos personales privados

Los endpoints `/api/v1/public/...` nunca deben exponer:

```text id="orom3v"
nombres de residentes
nombres de propietarios
emails personales
teléfonos personales
identificaciones
vehículos personales
mascotas por residente
contactos de emergencia
relaciones de propiedad
relaciones de residencia privadas
```

---

### 3.8. Cache controlado

Los endpoints públicos pueden devolver cache headers.

Regla:

```text id="u4dyvn"
Solo datos public-safe pueden recibir Cache-Control public.
```

---

### 3.9. CORS restringido

No se permite CORS abierto en producción.

Prohibido:

```text id="pku419"
Access-Control-Allow-Origin: *
```

---

## 4. Rutas base

### 4.1. Endpoints públicos

```text id="a6unm4"
/api/v1/public/tenants
```

---

### 4.2. Endpoints tenant administrativos

```text id="kugnrh"
/api/v1/tenant/integrations/wordpress
```

---

### 4.3. Endpoints platform administrativos

```text id="w3a7o1"
/api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

---

## 5. Formato estándar de respuesta

### 5.1. Respuesta individual

```json id="mqsgtp"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 5.2. Respuesta paginada

```json id="f0pvmc"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "traceId": "req_123456"
  }
}
```

---

### 5.3. Error estándar

```json id="nzrgxr"
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

## 6. Headers

### 6.1. Request headers públicos

| Header             |   Requerido | Descripción                       |
| ------------------ | ----------: | --------------------------------- |
| `Accept`           | Recomendado | `application/json`                |
| `Origin`           | Condicional | Requerido por navegador para CORS |
| `X-Request-Id`     |    Opcional | ID de request                     |
| `X-Correlation-Id` |    Opcional | ID de correlación                 |

---

### 6.2. Request headers administrativos

| Header             |   Requerido | Descripción        |
| ------------------ | ----------: | ------------------ |
| `Authorization`    |          Sí | Bearer token       |
| `Content-Type`     | Sí en PATCH | `application/json` |
| `Accept`           | Recomendado | `application/json` |
| `X-Request-Id`     |    Opcional | ID de request      |
| `X-Correlation-Id` |    Opcional | ID de correlación  |

---

### 6.3. Response headers públicos

| Header             | Descripción                              |
| ------------------ | ---------------------------------------- |
| `Content-Type`     | `application/json`                       |
| `Cache-Control`    | Política de caché pública cuando aplique |
| `ETag`             | Opcional                                 |
| `Last-Modified`    | Opcional                                 |
| `X-Request-Id`     | ID de request                            |
| `X-Correlation-Id` | ID de correlación si aplica              |

---

### 6.4. Response headers CORS

Ejemplo permitido:

```text id="bom4sj"
Access-Control-Allow-Origin: https://www.resident.gustavoguaigua.com
Vary: Origin
```

Prohibido en producción:

```text id="cxvjzd"
Access-Control-Allow-Origin: *
```

---

## 7. Estados HTTP

| Código | Uso                                                     |
| -----: | ------------------------------------------------------- |
|    200 | Consulta exitosa                                        |
|    204 | Actualización exitosa sin cuerpo, si se adopta          |
|    400 | Request mal formado                                     |
|    401 | No autenticado en endpoint administrativo               |
|    403 | Sin permiso, origin no autorizado o tenant no accesible |
|    404 | Recurso público no encontrado o no publicable           |
|    409 | Conflicto de mapping o duplicidad                       |
|    422 | Validación semántica fallida                            |
|    429 | Rate limit                                              |
|    500 | Error interno                                           |

---

## 8. Validaciones comunes

### 8.1. Slug

Formato permitido:

```text id="f3bv97"
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Longitud sugerida:

```text id="fla3yv"
3 <= length <= 120
```

Ejemplos válidos:

```text id="sa29di"
san-jose-la-salle-2
altos-del-norte
jardines-del-valle
portal-del-rio
```

Ejemplos inválidos:

```text id="ozv3vv"
../tenant
Tenant Admin
tenant/other
<script>
```

---

### 8.2. URL

En producción, las URLs deben usar HTTPS.

Permitido:

```text id="fbqwtp"
https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2
```

Prohibido:

```text id="tkqmyl"
javascript:
file:
data:
ftp:
http:// en producción
```

---

### 8.3. Origin

Debe ser un origin válido, no una URL completa con path.

Válido:

```text id="r1pp6g"
https://www.resident.gustavoguaigua.com
```

Inválido:

```text id="tiz3fe"
https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2
```

---

### 8.4. Colores

Formato permitido:

```text id="yj50ow"
#RGB
#RRGGBB
```

Ejemplos:

```text id="t3untn"
#0EA5E9
#F59E0B
#fff
```

---

### 8.5. Paginación

Parámetros comunes:

| Query param |   Tipo | Default |                     Máximo |
| ----------- | -----: | ------: | -------------------------: |
| `page`      | number |       1 |                          — |
| `pageSize`  | number |      20 | 50 para endpoints públicos |

Aplica a:

```text id="l2h2hk"
announcements
common-areas
```

---

## 9. Cache

### 9.1. Headers sugeridos para endpoints públicos

```text id="fszrxw"
Cache-Control: public, max-age=300
ETag: "<hash>"
Last-Modified: "<date>"
```

---

### 9.2. TTL inicial

```text id="idtyxh"
300 segundos
```

---

### 9.3. 404 cacheable

Para slugs inexistentes o recursos no publicables puede usarse TTL corto:

```text id="i26im3"
Cache-Control: public, max-age=60
```

---

### 9.4. No cachear

No cachear públicamente:

```text id="bajfd3"
respuestas administrativas
errores sensibles
datos privados
datos financieros
datos personalizados por usuario
```

---

## 10. Rate limiting

Aplicar rate limiting a todos los endpoints públicos.

Configuración sugerida:

```text id="wt9c9b"
PUBLIC_API_RATE_LIMIT_WINDOW_SECONDS=60
PUBLIC_API_RATE_LIMIT_MAX_REQUESTS=120
PUBLIC_DETAIL_RATE_LIMIT_MAX_REQUESTS=60
```

Respuesta esperada:

```json id="h1wfee"
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

# 11. Endpoints públicos

## 11.1. Obtener tenant público

### Endpoint

```http id="q7f5fu"
GET /api/v1/public/tenants/{slug}
```

### Autenticación

No requiere usuario autenticado.

### Controles

```text id="r0curv"
slug validation
tenant active check
public profile visible/published check
rate limiting
CORS policy
cache headers
safe DTO mapping
```

### Path params

| Nombre | Tipo   | Requerido | Descripción             |
| ------ | ------ | --------: | ----------------------- |
| `slug` | string |        Sí | Slug público del tenant |

### Response 200

```json id="dyeb7n"
{
  "data": {
    "tenantPublicId": "pub_tenant_uuid",
    "slug": "san-jose-la-salle-2",
    "publicName": "Conjunto Residencial San José La Salle 2",
    "slogan": "Comunidad residencial organizada",
    "publicDescription": "Información pública del conjunto.",
    "websiteUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
    "residentPortalUrl": "https://app.resident.example.com/login"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### No debe devolver

```text id="swjn4a"
tenantId interno
saldos
pagos
cargos
estados de cuenta
nombres de residentes
nombres de propietarios
roles
permisos
audit logs
mapping interno completo
```

---

## 11.2. Obtener branding público

### Endpoint

```http id="i21fq9"
GET /api/v1/public/tenants/{slug}/branding
```

### Autenticación

No requiere usuario autenticado.

### Response 200

```json id="m1bov1"
{
  "data": {
    "logoUrl": "https://cdn.example.com/logo.png",
    "bannerUrl": "https://cdn.example.com/banner.jpg",
    "primaryColor": "#0EA5E9",
    "secondaryColor": "#F59E0B",
    "galleryUrls": [
      "https://cdn.example.com/photo-1.jpg",
      "https://cdn.example.com/photo-2.jpg"
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No exponer rutas internas de storage.
* Validar URLs.
* Validar colores.
* Permitir cache público.

---

## 11.3. Obtener contacto público

### Endpoint

```http id="xup2m4"
GET /api/v1/public/tenants/{slug}/contact
```

### Autenticación

No requiere usuario autenticado.

### Response 200

```json id="gky6r9"
{
  "data": {
    "publicEmail": "administracion@example.com",
    "publicPhone": "+593999999999",
    "publicWhatsapp": "+593999999999",
    "publicAddress": "Dirección institucional",
    "socialLinks": {
      "facebook": "https://facebook.com/example",
      "instagram": "https://instagram.com/example",
      "youtube": "https://youtube.com/@example"
    }
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo contactos institucionales.
* No contactos personales de residentes, propietarios o administradores.
* URLs sociales deben validarse.

---

## 11.4. Obtener enlaces públicos

### Endpoint

```http id="u1c6kq"
GET /api/v1/public/tenants/{slug}/links
```

### Autenticación

No requiere usuario autenticado.

### Response 200

```json id="rwj1hn"
{
  "data": {
    "websiteUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
    "residentPortalUrl": "https://app.resident.example.com/login"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No incluir tokens.
* No incluir session IDs.
* No incluir URLs internas.
* Solo HTTPS en producción.

---

## 11.5. Listar comunicados públicos

### Endpoint

```http id="ya7n1l"
GET /api/v1/public/tenants/{slug}/announcements
```

### Autenticación

No requiere usuario autenticado.

### Query params

| Nombre     | Tipo   | Default | Descripción                    |
| ---------- | ------ | ------: | ------------------------------ |
| `page`     | number |       1 | Página                         |
| `pageSize` | number |      20 | Tamaño, máximo 50              |
| `category` | string |       — | Categoría pública              |
| `q`        | string |       — | Búsqueda básica si se habilita |

### Response 200

```json id="k4espc"
{
  "data": [
    {
      "id": "announcement_public_id",
      "slug": "mantenimiento-programado",
      "title": "Mantenimiento programado",
      "summary": "Comunicado público de mantenimiento.",
      "publishedAt": "2026-07-14T10:00:00Z",
      "coverImageUrl": "https://cdn.example.com/announcement.jpg",
      "category": "general"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo `visibility = public`.
* Solo `status = published`.
* Solo del tenant resuelto.
* No incluir comunicados internos.
* No incluir adjuntos privados.
* Si el módulo de comunicados aún no existe, endpoint puede quedar diferido pero documentado.

---

## 11.6. Obtener comunicado público

### Endpoint

```http id="cgmjwi"
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
```

### Autenticación

No requiere usuario autenticado.

### Path params

| Nombre             | Tipo   | Requerido |
| ------------------ | ------ | --------: |
| `slug`             | string |        Sí |
| `announcementSlug` | string |        Sí |

### Response 200

```json id="m8ic0v"
{
  "data": {
    "id": "announcement_public_id",
    "slug": "mantenimiento-programado",
    "title": "Mantenimiento programado",
    "summary": "Comunicado público de mantenimiento.",
    "content": "Contenido público del comunicado.",
    "publishedAt": "2026-07-14T10:00:00Z",
    "coverImageUrl": "https://cdn.example.com/announcement.jpg",
    "category": "general"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No devolver borradores.
* No devolver privados.
* No devolver comunicados de otro tenant.
* Para comunicado inexistente o no publicable, devolver 404.

---

## 11.7. Listar áreas comunales públicas

### Endpoint

```http id="bml4gs"
GET /api/v1/public/tenants/{slug}/common-areas
```

### Autenticación

No requiere usuario autenticado.

### Query params

| Nombre     | Tipo   | Default | Descripción       |
| ---------- | ------ | ------: | ----------------- |
| `page`     | number |       1 | Página            |
| `pageSize` | number |      20 | Tamaño, máximo 50 |

### Response 200

```json id="zsnuxx"
{
  "data": [
    {
      "id": "common_area_public_id",
      "slug": "cancha-multiple",
      "name": "Cancha múltiple",
      "description": "Área comunal visible para visitantes.",
      "coverImageUrl": "https://cdn.example.com/common-area.jpg",
      "galleryUrls": [],
      "publicRulesSummary": "Uso sujeto a reglamento interno publicado."
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1,
    "traceId": "req_123456"
  }
}
```

### Reglas

* Solo áreas `status = active`.
* Solo áreas `isPublicVisible = true`.
* No exponer disponibilidad privada.
* No permitir reservas desde este endpoint.
* No incluir reglas internas privadas.

---

## 11.8. Obtener área comunal pública

### Endpoint

```http id="il304v"
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

### Autenticación

No requiere usuario autenticado.

### Response 200

```json id="x1nzn0"
{
  "data": {
    "id": "common_area_public_id",
    "slug": "cancha-multiple",
    "name": "Cancha múltiple",
    "description": "Área comunal visible para visitantes.",
    "coverImageUrl": "https://cdn.example.com/common-area.jpg",
    "galleryUrls": [
      "https://cdn.example.com/common-area-1.jpg"
    ],
    "publicRulesSummary": "Uso sujeto a reglamento interno publicado."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No permite reservar.
* No expone calendario interno.
* No expone disponibilidad si no está explícitamente clasificada como pública.
* Devuelve 404 si el área no es visible públicamente.

---

# 12. Endpoints administrativos tenant

## 12.1. Obtener mapping WordPress del tenant activo

### Endpoint

```http id="wsmuod"
GET /api/v1/tenant/integrations/wordpress
```

### Autenticación

Requiere Bearer token.

### Guards

```text id="j9rk0z"
AuthGuard
TenantGuard
TenantPermissionGuard
WordPressMappingPermissionGuard
```

### Permiso

```text id="w965vd"
integrations.wordpress.read
```

### Response 200

```json id="e2hja3"
{
  "data": {
    "tenantId": "tenant_uuid",
    "wordpressSlug": "san-jose-la-salle-2",
    "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
    "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
    "externalPublicId": "wp_post_123",
    "wordpressPostId": "123",
    "wordpressPostType": "conjunto",
    "wordpressSiteId": "main",
    "integrationStatus": "active",
    "isPublicVisible": true,
    "lastSyncedAt": null,
    "lastValidatedAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.2. Actualizar mapping WordPress del tenant activo

### Endpoint

```http id="y5qyw8"
PATCH /api/v1/tenant/integrations/wordpress
```

### Autenticación

Requiere Bearer token.

### Permiso

```text id="no8rrg"
integrations.wordpress.update
```

### Request body

```json id="ts6emx"
{
  "wordpressSlug": "san-jose-la-salle-2",
  "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
  "externalPublicId": "wp_post_123",
  "wordpressPostId": "123",
  "wordpressPostType": "conjunto",
  "wordpressSiteId": "main",
  "integrationStatus": "active",
  "isPublicVisible": true
}
```

### Response 200

```json id="a8yuax"
{
  "data": {
    "tenantId": "tenant_uuid",
    "wordpressSlug": "san-jose-la-salle-2",
    "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
    "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
    "externalPublicId": "wp_post_123",
    "wordpressPostId": "123",
    "wordpressPostType": "conjunto",
    "wordpressSiteId": "main",
    "integrationStatus": "active",
    "isPublicVisible": true,
    "lastSyncedAt": null,
    "lastValidatedAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos auditables

```text id="e0q6fh"
tenant.wordpressMapping.updated
wordpress.integration.updated
```

### Reglas

* No aceptar `tenantId` desde body.
* El tenant se toma del contexto.
* Validar duplicidad de `wordpressSlug`.
* Validar URL.
* Validar origin.
* Auditar cambios.
* No guardar tokens ni secretos.

---

# 13. Endpoints administrativos platform

## 13.1. Obtener mapping WordPress de un tenant

### Endpoint

```http id="gkme0w"
GET /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

### Autenticación

Requiere Bearer token.

### Guards

```text id="nsex15"
AuthGuard
PlatformPermissionGuard
PlatformWordPressMappingPermissionGuard
```

### Permiso

```text id="mood45"
integrations.wordpress.platform.read
```

### Path params

| Nombre     | Tipo        | Requerido |
| ---------- | ----------- | --------: |
| `tenantId` | UUID/string |        Sí |

### Response 200

```json id="re090p"
{
  "data": {
    "tenantId": "tenant_uuid",
    "wordpressSlug": "san-jose-la-salle-2",
    "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
    "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
    "externalPublicId": "wp_post_123",
    "wordpressPostId": "123",
    "wordpressPostType": "conjunto",
    "wordpressSiteId": "main",
    "integrationStatus": "active",
    "isPublicVisible": true,
    "lastSyncedAt": null,
    "lastValidatedAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 13.2. Actualizar mapping WordPress de un tenant desde platform

### Endpoint

```http id="yzhjrv"
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

### Autenticación

Requiere Bearer token.

### Permiso

```text id="q1din7"
integrations.wordpress.platform.update
```

### Request body

```json id="f8zxyc"
{
  "wordpressSlug": "san-jose-la-salle-2",
  "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
  "externalPublicId": "wp_post_123",
  "wordpressPostId": "123",
  "wordpressPostType": "conjunto",
  "wordpressSiteId": "main",
  "integrationStatus": "active",
  "isPublicVisible": true
}
```

### Response 200

```json id="godbrk"
{
  "data": {
    "tenantId": "tenant_uuid",
    "wordpressSlug": "san-jose-la-salle-2",
    "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
    "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
    "externalPublicId": "wp_post_123",
    "wordpressPostId": "123",
    "wordpressPostType": "conjunto",
    "wordpressSiteId": "main",
    "integrationStatus": "active",
    "isPublicVisible": true,
    "lastSyncedAt": null,
    "lastValidatedAt": "2026-07-14T10:00:00Z",
    "updatedAt": "2026-07-14T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Eventos auditables

```text id="gdc2ge"
tenant.wordpressMapping.updated
wordpress.integration.updated
```

---

# 14. DTOs

## 14.1. PublicTenantDto

```json id="m56alp"
{
  "tenantPublicId": "pub_tenant_uuid",
  "slug": "san-jose-la-salle-2",
  "publicName": "Conjunto Residencial San José La Salle 2",
  "slogan": "Comunidad residencial organizada",
  "publicDescription": "Información pública del conjunto.",
  "websiteUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "residentPortalUrl": "https://app.resident.example.com/login"
}
```

---

## 14.2. PublicBrandingDto

```json id="cqxh95"
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

## 14.3. PublicContactDto

```json id="knbjag"
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

## 14.4. PublicLinksDto

```json id="uwd17x"
{
  "websiteUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "residentPortalUrl": "https://app.resident.example.com/login"
}
```

---

## 14.5. WordPressMappingDto

```json id="avji23"
{
  "tenantId": "tenant_uuid",
  "wordpressSlug": "san-jose-la-salle-2",
  "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
  "externalPublicId": "wp_post_123",
  "wordpressPostId": "123",
  "wordpressPostType": "conjunto",
  "wordpressSiteId": "main",
  "integrationStatus": "active",
  "isPublicVisible": true,
  "lastSyncedAt": null,
  "lastValidatedAt": "2026-07-14T10:00:00Z",
  "updatedAt": "2026-07-14T10:00:00Z"
}
```

---

## 14.6. UpdateWordPressMappingDto

```json id="zklvvq"
{
  "wordpressSlug": "san-jose-la-salle-2",
  "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
  "externalPublicId": "wp_post_123",
  "wordpressPostId": "123",
  "wordpressPostType": "conjunto",
  "wordpressSiteId": "main",
  "integrationStatus": "active",
  "isPublicVisible": true
}
```

### Campos permitidos

```text id="fo5l3s"
wordpressSlug
wordpressUrl
wordpressAllowedOrigin
externalPublicId
wordpressPostId
wordpressPostType
wordpressSiteId
integrationStatus
isPublicVisible
```

### Campos prohibidos

```text id="a2kptg"
tenantId
createdBy
updatedBy
tokens
apiKey
clientSecret
cookies
authorizationHeader
databaseUrl
```

---

# 15. Matriz de endpoints

| Método | Ruta                                                             | Scope    | Auth | Permiso                                  |
| ------ | ---------------------------------------------------------------- | -------- | ---- | ---------------------------------------- |
| GET    | `/api/v1/public/tenants/{slug}`                                  | public   | No   | —                                        |
| GET    | `/api/v1/public/tenants/{slug}/branding`                         | public   | No   | —                                        |
| GET    | `/api/v1/public/tenants/{slug}/contact`                          | public   | No   | —                                        |
| GET    | `/api/v1/public/tenants/{slug}/links`                            | public   | No   | —                                        |
| GET    | `/api/v1/public/tenants/{slug}/announcements`                    | public   | No   | —                                        |
| GET    | `/api/v1/public/tenants/{slug}/announcements/{announcementSlug}` | public   | No   | —                                        |
| GET    | `/api/v1/public/tenants/{slug}/common-areas`                     | public   | No   | —                                        |
| GET    | `/api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}`    | public   | No   | —                                        |
| GET    | `/api/v1/tenant/integrations/wordpress`                          | tenant   | Sí   | `integrations.wordpress.read`            |
| PATCH  | `/api/v1/tenant/integrations/wordpress`                          | tenant   | Sí   | `integrations.wordpress.update`          |
| GET    | `/api/v1/platform/tenants/{tenantId}/integrations/wordpress`     | platform | Sí   | `integrations.wordpress.platform.read`   |
| PATCH  | `/api/v1/platform/tenants/{tenantId}/integrations/wordpress`     | platform | Sí   | `integrations.wordpress.platform.update` |

---

# 16. CORS contract

## 16.1. Comportamiento permitido

Si el origin es permitido:

```text id="iq9pyo"
Access-Control-Allow-Origin: https://www.resident.gustavoguaigua.com
Vary: Origin
```

---

## 16.2. Comportamiento denegado

Si el origin no es permitido:

* no devolver `Access-Control-Allow-Origin`;
* bloquear según política;
* registrar métrica;
* auditar si es relevante.

Error posible:

```json id="rn0xkc"
{
  "error": {
    "code": "WORDPRESS_ORIGIN_DENIED",
    "message": "The request origin is not allowed.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 16.3. Preflight

Para `OPTIONS`, permitir solo métodos requeridos.

Endpoints públicos:

```text id="cm44ho"
GET
OPTIONS
```

Endpoints administrativos:

```text id="r7sgvv"
GET
PATCH
OPTIONS
```

---

# 17. Catálogo de errores

| Código                             | HTTP | Descripción                                   |
| ---------------------------------- | ---: | --------------------------------------------- |
| `PUBLIC_TENANT_NOT_FOUND`          |  404 | Tenant público no encontrado o no publicable  |
| `PUBLIC_TENANT_NOT_VISIBLE`        |  404 | Tenant existe pero no es visible públicamente |
| `WORDPRESS_SLUG_INVALID`           |  422 | Slug inválido                                 |
| `WORDPRESS_URL_INVALID`            |  422 | URL inválida                                  |
| `WORDPRESS_ORIGIN_INVALID`         |  422 | Origin inválido                               |
| `WORDPRESS_ORIGIN_DENIED`          |  403 | Origin no permitido                           |
| `PUBLIC_RESOURCE_NOT_FOUND`        |  404 | Recurso público no encontrado                 |
| `WORDPRESS_MAPPING_NOT_FOUND`      |  404 | Mapping no encontrado                         |
| `WORDPRESS_MAPPING_DUPLICATE`      |  409 | Mapping o slug duplicado                      |
| `WORDPRESS_MAPPING_FORBIDDEN`      |  403 | Sin permiso sobre mapping                     |
| `WORDPRESS_MAPPING_INVALID_STATUS` |  422 | Estado inválido                               |
| `PUBLIC_FIELD_NOT_ALLOWED`         |  422 | Campo no publicable                           |
| `VALIDATION_ERROR`                 |  422 | Error de validación                           |
| `UNAUTHORIZED`                     |  401 | No autenticado                                |
| `FORBIDDEN`                        |  403 | Sin permiso                                   |
| `RATE_LIMITED`                     |  429 | Rate limit                                    |
| `INTERNAL_ERROR`                   |  500 | Error interno                                 |

---

# 18. Ejemplos de errores

## 18.1. Slug inválido

```json id="ko1mdk"
{
  "error": {
    "code": "WORDPRESS_SLUG_INVALID",
    "message": "The provided slug is invalid.",
    "details": {
      "allowedPattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
    },
    "traceId": "req_123456"
  }
}
```

---

## 18.2. Tenant público no encontrado

```json id="u6whxc"
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

## 18.3. Origin denegado

```json id="dvrs0u"
{
  "error": {
    "code": "WORDPRESS_ORIGIN_DENIED",
    "message": "The request origin is not allowed.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 18.4. Mapping duplicado

```json id="wycaej"
{
  "error": {
    "code": "WORDPRESS_MAPPING_DUPLICATE",
    "message": "The WordPress slug is already assigned to another tenant.",
    "details": {
      "field": "wordpressSlug"
    },
    "traceId": "req_123456"
  }
}
```

---

## 18.5. Sin permiso para actualizar mapping

```json id="a7ur3a"
{
  "error": {
    "code": "WORDPRESS_MAPPING_FORBIDDEN",
    "message": "You are not allowed to update WordPress integration settings.",
    "details": {
      "requiredPermission": "integrations.wordpress.update"
    },
    "traceId": "req_123456"
  }
}
```

---

# 19. Auditoría

## 19.1. Eventos obligatorios

Cambios administrativos:

```text id="y87oud"
tenant.wordpressMapping.updated
tenant.publicProfile.updated
tenant.publicVisibility.updated
wordpress.integration.updated
```

---

## 19.2. Eventos recomendados

```text id="qvfgcy"
wordpress.origin.denied
wordpress.publicEndpoint.accessDenied
wordpress.tenantSlug.notFound
wordpress.publicResource.notFound
wordpress.integration.validationFailed
```

---

## 19.3. Metadata permitida

```json id="ml6sxf"
{
  "slug": "san-jose-la-salle-2",
  "origin": "https://www.resident.gustavoguaigua.com",
  "endpoint": "/api/v1/public/tenants/san-jose-la-salle-2",
  "result": "success",
  "traceId": "req_123456"
}
```

Para mapping:

```json id="u2re1o"
{
  "tenantId": "tenant_uuid",
  "wordpressSlug": "san-jose-la-salle-2",
  "wordpressUrl": "https://www.resident.gustavoguaigua.com/conjuntos/san-jose-la-salle-2",
  "wordpressAllowedOrigin": "https://www.resident.gustavoguaigua.com",
  "integrationStatus": "active",
  "isPublicVisible": true,
  "changedFields": [
    "wordpressSlug",
    "wordpressAllowedOrigin",
    "isPublicVisible"
  ],
  "traceId": "req_123456"
}
```

---

## 19.4. Metadata prohibida

```text id="yvmo16"
payload completo
headers completos
cookies
tokens
API keys
client secrets
datos financieros
datos personales privados
connection strings
```

---

# 20. Observabilidad

## 20.1. Logs técnicos

Eventos de log sugeridos:

```text id="kl8brs"
wordpress.publicTenant.resolved
wordpress.publicTenant.notFound
wordpress.publicBranding.resolved
wordpress.publicContact.resolved
wordpress.publicLinks.resolved
wordpress.publicEndpoint.cacheHit
wordpress.publicEndpoint.cacheMiss
wordpress.publicEndpoint.rateLimited
wordpress.origin.denied
wordpress.mapping.updated
wordpress.mapping.updateFailed
```

---

## 20.2. Logs prohibidos

```text id="ixyh3o"
payload completo
headers completos
cookies
tokens
datos financieros
datos personales privados
respuesta completa si contiene contenido extenso
```

---

## 20.3. Métricas

Métricas sugeridas:

```text id="bxbecr"
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

```text id="u8lr0p"
endpoint
outcome
cacheStatus
```

Labels prohibidos:

```text id="tbsece"
tenantId
slug
ipAddress
userAgent
token
```

---

# 21. OpenAPI

## 21.1. Tags sugeridos

```text id="zy4zcf"
Public WordPress Integration
Tenant WordPress Integration
Platform WordPress Integration
```

---

## 21.2. Extensiones OpenAPI sugeridas

### Endpoint público

```yaml id="fqv1si"
x-public-safe: true
x-tenant-resolution: slug
x-auth-required: false
x-cors-restricted: true
x-cacheable: true
x-rate-limited: true
x-no-financial-data: true
x-no-private-personal-data: true
```

---

### Endpoint tenant administrativo

```yaml id="fbxv1o"
x-required-permission: integrations.wordpress.update
x-tenant-scope: tenant
x-audit-event: tenant.wordpressMapping.updated
x-auth-required: true
```

---

### Endpoint platform administrativo

```yaml id="ulhzzi"
x-required-permission: integrations.wordpress.platform.update
x-platform-scope: true
x-audit-event: tenant.wordpressMapping.updated
x-auth-required: true
```

---

## 21.3. OpenAPI no debe documentar

```text id="duyeef"
endpoints públicos de pago
endpoints públicos de saldos
endpoints públicos de estados de cuenta
endpoints públicos de comprobantes
endpoints públicos de residentes
endpoints públicos de propietarios
endpoints públicos de roles/permisos
POST /api/v1/public/tenants/{slug}
PATCH /api/v1/public/tenants/{slug}
DELETE /api/v1/public/tenants/{slug}
```

---

# 22. Contrato de integración con WordPress

## 22.1. Consumo desde plantilla PHP

WordPress puede llamar:

```text id="ox7zdm"
GET /api/v1/public/tenants/{slug}
GET /api/v1/public/tenants/{slug}/branding
GET /api/v1/public/tenants/{slug}/contact
GET /api/v1/public/tenants/{slug}/links
```

Fallback permitido:

```text id="kbl6ty"
Si Core no responde, usar ACF local para datos visuales e informativos.
```

Prohibido:

```text id="hhaig7"
fallback para saldos
fallback para pagos
fallback para estados de cuenta
fallback para datos personales privados
```

---

## 22.2. Consumo desde JavaScript

Permitido solo para endpoints públicos.

Requiere:

```text id="ou023s"
CORS permitido
sin credentials
sin tokens
sin cookies
rate limiting
cache headers
```

---

## 22.3. API key servidor-servidor

Diferida para MVP.

Si se habilita en el futuro:

* no exponer en navegador;
* usar scope mínimo;
* auditar uso;
* permitir rotación;
* documentar en spec separada.

---

# 23. Casos borde

| Caso                                | Resultado esperado               |
| ----------------------------------- | -------------------------------- |
| Slug inexistente                    | 404                              |
| Slug inválido                       | 422                              |
| Tenant suspendido                   | 404                              |
| Tenant inactivo                     | 404                              |
| Tenant archivado                    | 404                              |
| Perfil público hidden               | 404                              |
| Perfil público draft                | 404                              |
| Mapping disabled                    | 404 o CORS denied según endpoint |
| Origin no permitido                 | CORS denied / 403                |
| CORS wildcard configurado           | configuración rechazada          |
| Rate limit excedido                 | 429                              |
| Comunicado draft                    | 404/no aparece                   |
| Comunicado privado                  | 404/no aparece                   |
| Área comunal privada                | 404/no aparece                   |
| Área comunal inactiva               | 404/no aparece                   |
| URL `javascript:` en mapping        | 422                              |
| Origin con path                     | 422                              |
| `wordpressSlug` duplicado           | 409                              |
| Usuario sin permiso tenant read     | 403                              |
| Usuario sin permiso tenant update   | 403                              |
| Usuario sin permiso platform read   | 403                              |
| Usuario sin permiso platform update | 403                              |
| Body incluye `tenantId`             | ignorado o 422                   |
| Body incluye token/secret           | 422                              |

---

# 24. Pruebas de contrato requeridas

## 24.1. Endpoints públicos

Probar:

```text id="povpfy"
GET /api/v1/public/tenants/{slug}
GET /api/v1/public/tenants/{slug}/branding
GET /api/v1/public/tenants/{slug}/contact
GET /api/v1/public/tenants/{slug}/links
GET /api/v1/public/tenants/{slug}/announcements
GET /api/v1/public/tenants/{slug}/announcements/{announcementSlug}
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Casos mínimos:

* 200 tenant activo y visible;
* 404 tenant no visible;
* 422 slug inválido;
* no datos financieros;
* no datos personales privados;
* headers de cache;
* CORS permitido;
* CORS denegado;
* rate limit.

---

## 24.2. Endpoints tenant administrativos

Probar:

```text id="zglt38"
GET /api/v1/tenant/integrations/wordpress
PATCH /api/v1/tenant/integrations/wordpress
```

Casos mínimos:

* 401 sin token;
* 403 sin membership;
* 403 sin permiso;
* 200 con permiso;
* 422 URL inválida;
* 422 origin inválido;
* 409 slug duplicado;
* audit event en update.

---

## 24.3. Endpoints platform administrativos

Probar:

```text id="uodse2"
GET /api/v1/platform/tenants/{tenantId}/integrations/wordpress
PATCH /api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

Casos mínimos:

* 401 sin token;
* 403 sin permiso platform;
* 404 tenant inexistente;
* 200 con permiso;
* 422 mapping inválido;
* audit event en update.

---

## 25. Decisión final del contrato API

El módulo `009-wordpress-integration-basic` expondrá tres grupos de endpoints:

```text id="jvjty1"
1. Endpoints públicos para WordPress.
2. Endpoints tenant administrativos para mapping WordPress-Core.
3. Endpoints platform administrativos para soporte y configuración.
```

Los endpoints públicos serán:

```text id="skwlld"
/api/v1/public/tenants/{slug}
/api/v1/public/tenants/{slug}/branding
/api/v1/public/tenants/{slug}/contact
/api/v1/public/tenants/{slug}/links
/api/v1/public/tenants/{slug}/announcements
/api/v1/public/tenants/{slug}/announcements/{announcementSlug}
/api/v1/public/tenants/{slug}/common-areas
/api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Los endpoints administrativos serán:

```text id="mnqvm8"
/api/v1/tenant/integrations/wordpress
/api/v1/platform/tenants/{tenantId}/integrations/wordpress
```

La API debe garantizar:

```text id="g2h5zm"
public-safe DTOs
slug-based tenant resolution
tenant isolation
no financial data exposure
no private personal data exposure
CORS restriction
rate limiting
safe cache
safe logging
mapping audit
OpenAPI consistency
WordPress compatibility
```

La implementación no debe aceptarse si permite a WordPress acceder directamente a la base de datos, si expone pagos/saldos/estados de cuenta/comprobantes, si expone datos personales privados, si permite CORS wildcard en producción, si mezcla tenants por slug, si cachea información privada o si WordPress se convierte en fuente de verdad transaccional.
