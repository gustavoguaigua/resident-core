# API Contract — Spec 001 Tenants Management

> **Ownership vigente para Sprint 2:** GAP-S2-006 retira
> `GET/PATCH /api/v1/tenant/configuration`. `timezone` y `currency` se administran en
> la API de plataforma de `Tenant`; los settings configurables usan exclusivamente la
> API `/api/v1/tenant/settings` de Spec 025. Las rutas, permisos y eventos de
> configuración paralelos descritos después quedan supersedidos.

## 1. Información del documento

| Campo                  | Valor                                    |
| ---------------------- | ---------------------------------------- |
| Proyecto               | RESIDENT Core                            |
| Spec ID                | 001                                      |
| Módulo                 | Tenants Management                       |
| Documento              | API Contract                             |
| Ruta                   | `docs/specs/001-tenants/api-contract.md` |
| Versión                | 0.1                                      |
| Estado                 | needs-review                             |
| Fecha                  | 2026-07-12                               |
| Documento base         | `docs/specs/001-tenants/spec.md`         |
| Plan técnico           | `docs/specs/001-tenants/plan.md`         |
| Modelo de datos        | `docs/specs/001-tenants/data-model.md`   |
| API Style              | REST                                     |
| API Version            | `/api/v1`                                |
| Formato                | JSON                                     |
| Autenticación objetivo | Bearer Token emitido por Keycloak        |
| Autorización           | RESIDENT Core tenant-aware RBAC          |

---

## 2. Propósito

Este documento define el contrato API del módulo `001-tenants`.

El objetivo es establecer de forma precisa:

* endpoints;
* métodos HTTP;
* rutas;
* permisos;
* autenticación;
* autorización;
* requests;
* responses;
* errores;
* status codes;
* paginación;
* filtros;
* ordenamiento;
* contrato público para WordPress;
* reglas de seguridad;
* trazabilidad;
* compatibilidad OpenAPI.

Este contrato debe ser usado por:

* backend NestJS;
* frontend administrativo futuro;
* portal WordPress;
* n8n en integraciones futuras;
* pruebas API;
* pruebas de contrato;
* agentes IA;
* documentación OpenAPI.

---

## 3. Principios del contrato API

### 3.1. API-first

El contrato API debe quedar definido antes o junto con la implementación.

Ningún endpoint debe implementarse sin:

* ruta documentada;
* método documentado;
* request documentado;
* response documentado;
* error documentado;
* permiso documentado;
* prueba asociada.

---

### 3.2. Versionamiento

Todos los endpoints pertenecen a:

```text id="lznupw"
/api/v1
```

---

### 3.3. JSON camelCase

Los cuerpos JSON usan `camelCase`.

Ejemplo:

```json id="yq3n11"
{
  "displayName": "Villa Club",
  "primaryColor": "#1E88E5"
}
```

---

### 3.4. Base de datos snake_case

La API no expone nombres de columnas físicas.

Ejemplo:

```text id="0ecy2q"
API: displayName
DB:  display_name
```

---

### 3.5. Respuesta estándar

Toda respuesta exitosa debe usar:

```json id="021yyf"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

Para listas:

```json id="r7szli"
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

### 3.6. Error estándar

Todo error debe usar:

```json id="gaygr2"
{
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "The requested tenant was not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 4. Grupos de endpoints

El módulo define tres grupos de endpoints:

```text id="dpocfh"
1. Platform Tenants API
2. Active Tenant API
3. Public Tenants API
```

---

## 5. Platform Tenants API

Endpoints globales para administración de tenants desde la plataforma.

Ruta base:

```text id="b18fq1"
/api/v1/platform/tenants
```

Uso:

* crear tenant;
* listar tenants;
* consultar tenant por ID;
* actualizar tenant;
* activar;
* suspender;
* reactivar;
* archivar.

Requieren:

* autenticación;
* rol global o permiso global;
* auditoría para operaciones críticas.

---

## 6. Active Tenant API

Endpoints para que un usuario autorizado administre datos del tenant activo.

Ruta base:

```text id="lfez28"
/api/v1/tenant
```

Uso:

* consultar perfil del tenant activo;
* actualizar perfil;
* consultar branding;
* actualizar branding;
* consultar configuración;
* actualizar configuración;
* actualizar mapeo WordPress.

Requieren:

* autenticación;
* tenant activo;
* membresía activa;
* permiso tenant-scoped.

---

## 7. Public Tenants API

Endpoint público para consumo desde WordPress u otros clientes públicos.

Ruta base:

```text id="9fswjp"
/api/v1/public/tenants
```

Uso:

* consultar perfil público por slug.

No requiere autenticación.

Debe aplicar:

* DTO público limitado;
* rate limiting;
* CORS controlado;
* no exposición de datos sensibles.

---

## 8. Headers generales

### 8.1. Request headers

| Header             |                Requerido | Descripción                        |
| ------------------ | -----------------------: | ---------------------------------- |
| `Authorization`    | Sí en endpoints privados | Bearer token                       |
| `Content-Type`     |         Sí en POST/PATCH | `application/json`                 |
| `Accept`           |              Recomendado | `application/json`                 |
| `X-Tenant-Id`      | Sí en endpoints tenant-scoped | Selector UUID no confiable     |
| `X-Request-Id`     |                 Opcional | ID de request provisto por cliente |
| `X-Correlation-Id` |                 Opcional | ID de correlación                  |
| `Idempotency-Key`  |          Opcional/futuro | Para operaciones idempotentes      |

---

### 8.2. Response headers

| Header             | Descripción                 |
| ------------------ | --------------------------- |
| `Content-Type`     | `application/json`          |
| `X-Request-Id`     | ID de request               |
| `X-Correlation-Id` | ID de correlación si aplica |

---

## 9. Autenticación

### 9.1. Endpoints privados

Requieren:

```http id="0tslw1"
Authorization: Bearer <access_token>
```

Durante MVP, el token puede ser emitido por auth propia temporal.

Arquitectura objetivo:

```text id="d9jgkq"
Token OIDC/OAuth2 emitido por Keycloak.
```

---

### 9.2. Endpoints públicos

No requieren token:

```text id="xdhxei"
GET /api/v1/public/tenants/{slug}
```

---

## 10. Autorización

### 10.1. Permisos globales

| Permiso                       | Descripción                      |
| ----------------------------- | -------------------------------- |
| `platform.tenants.create`     | Crear tenant                     |
| `platform.tenants.read`       | Listar o consultar tenants       |
| `platform.tenants.update`     | Actualizar datos administrativos |
| `platform.tenants.activate`   | Activar tenant                   |
| `platform.tenants.suspend`    | Suspender tenant                 |
| `platform.tenants.reactivate` | Reactivar tenant                 |
| `platform.tenants.archive`    | Archivar tenant                  |

---

### 10.2. Permisos de tenant

| Permiso                        | Descripción                         |
| ------------------------------ | ----------------------------------- |
| `tenants.profile.read`         | Consultar perfil del tenant activo  |
| `tenants.profile.update`       | Actualizar perfil del tenant activo |
| `tenants.branding.read`        | Consultar branding                  |
| `tenants.branding.update`      | Actualizar branding                 |
| `tenants.configuration.read`   | Consultar configuración             |
| `tenants.configuration.update` | Actualizar configuración            |
| `tenants.wordpress.update`     | Actualizar mapeo WordPress          |

---

### 10.3. Reglas de autorización

* Token válido no autoriza por sí solo.
* RESIDENT Core valida permisos.
* Platform permissions aplican a endpoints `/platform`.
* Tenant permissions aplican al tenant activo.
* Un TenantAdmin no puede modificar otro tenant.
* Un TenantAdmin no puede suspender, reactivar ni archivar tenants.
* WordPress solo consume endpoints públicos.
* El endpoint público no debe devolver datos internos.

---

## 11. Paginación

Endpoints de lista usan:

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

Ejemplo:

```http id="thppxe"
GET /api/v1/platform/tenants?page=1&pageSize=20
```

---

## 12. Filtros

### 12.1. Listar tenants

Filtros permitidos:

| Query param | Tipo   | Descripción                             |
| ----------- | ------ | --------------------------------------- |
| `status`    | string | Filtrar por estado                      |
| `search`    | string | Buscar por `name`, `legalName` o `slug` |

Ejemplo:

```http id="51wof5"
GET /api/v1/platform/tenants?status=active&search=villa
```

---

## 13. Ordenamiento

Campos permitidos:

```text id="7ren3o"
createdAt
name
slug
status
```

Parámetros:

| Query param | Tipo   | Default     |
| ----------- | ------ | ----------- |
| `sortBy`    | string | `createdAt` |
| `sortOrder` | string | `desc`      |

Valores permitidos para `sortOrder`:

```text id="1urlmj"
asc
desc
```

Ejemplo:

```http id="1os7ge"
GET /api/v1/platform/tenants?sortBy=name&sortOrder=asc
```

---

## 14. Estados HTTP

| Código | Uso                                   |
| -----: | ------------------------------------- |
|    200 | Consulta o actualización exitosa      |
|    201 | Recurso creado                        |
|    204 | Operación exitosa sin body, si aplica |
|    400 | Request mal formado                   |
|    401 | No autenticado                        |
|    403 | Sin permiso                           |
|    404 | Recurso no encontrado                 |
|    409 | Conflicto de estado o duplicidad      |
|    422 | Validación semántica fallida          |
|    429 | Rate limit                            |
|    500 | Error interno                         |

---

# 15. Platform Tenants API

---

## 15.1. Listar tenants

### Endpoint

```http id="6hpze8"
GET /api/v1/platform/tenants
```

### Autenticación

Requerida.

### Permiso

```text id="b3v6qp"
platform.tenants.read
```

### Query params

| Nombre      | Tipo   | Requerido | Default   | Descripción                           |
| ----------- | ------ | --------: | --------- | ------------------------------------- |
| `page`      | number |        No | 1         | Página                                |
| `pageSize`  | number |        No | 20        | Tamaño de página                      |
| `status`    | string |        No | —         | Estado del tenant                     |
| `search`    | string |        No | —         | Búsqueda por nombre, legalName o slug |
| `sortBy`    | string |        No | createdAt | Campo de ordenamiento                 |
| `sortOrder` | string |        No | desc      | asc/desc                              |

### Response 200

```json id="zuecc8"
{
  "data": [
    {
      "id": "tenant_uuid",
      "name": "Villa Club",
      "legalName": "Villa Club",
      "slug": "villa-club",
      "status": "active",
      "timezone": "America/Guayaquil",
      "currency": "USD",
      "createdAt": "2026-07-12T10:00:00Z",
      "updatedAt": "2026-07-12T10:00:00Z"
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

### Errores

| Código             | HTTP | Caso           |
| ------------------ | ---: | -------------- |
| `UNAUTHORIZED`     |  401 | Sin token      |
| `FORBIDDEN`        |  403 | Sin permiso    |
| `VALIDATION_ERROR` |  422 | Query inválida |

---

## 15.2. Crear tenant

### Endpoint

```http id="4uw1vp"
POST /api/v1/platform/tenants
```

### Autenticación

Requerida.

### Permiso

```text id="ow0aba"
platform.tenants.create
```

### Request body

```json id="mp58px"
{
  "name": "Villa Club",
  "legalName": "Villa Club",
  "slug": "villa-club",
  "timezone": "America/Guayaquil",
  "currency": "USD",
  "initialAdmin": {
    "email": "tenant.admin@example.com"
  },
  "profile": {
    "displayName": "Villa Club",
    "slogan": "Comunidad residencial inteligente",
    "description": "Portal digital del conjunto residencial.",
    "contactEmail": "admin@example.com",
    "contactPhone": "+593999999999",
    "whatsapp": "+593999999999",
    "address": "Santo Domingo, Ecuador",
    "city": "Santo Domingo",
    "province": "Santo Domingo de los Tsáchilas",
    "country": "Ecuador"
  },
  "branding": {
    "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
    "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
    "primaryColor": "#1E88E5",
    "secondaryColor": "#90CAF9",
    "accentColor": "#FFC107"
  },
  "wordpressMapping": {
    "wordpressSiteUrl": "https://www.resident.gustavoguaigua.com",
    "wordpressConjuntoSlug": "villa-club",
    "wordpressConjuntoId": "123",
    "accessUrl": "https://app.resident.example.com/login?tenant=villa-club",
    "isActive": true
  }
}
```

### Campos requeridos

```text id="7c7uxr"
name
initialAdmin.email
```

`initialAdmin.email` se normaliza y se resuelve contra Keycloak. El contrato no
acepta `keycloakSubjectId`, roles, membership, estado `active` ni actor desde el
body.

Campos con default:

```text id="no82l9"
status = pendingSetup
timezone = America/Guayaquil
currency = USD
```

Si `slug` no se envía, el sistema podrá generarlo desde `name`.

### Response 201

```json id="tjs2fo"
{
  "data": {
    "id": "tenant_uuid",
    "name": "Villa Club",
    "legalName": "Villa Club",
    "slug": "villa-club",
    "status": "pendingSetup",
    "timezone": "America/Guayaquil",
    "currency": "USD",
    "initialAdmin": {
      "userProfileId": "user_profile_uuid",
      "email": "tenant.admin@example.com",
      "membershipStatus": "active",
      "role": "TenantAdmin"
    },
    "profile": {
      "displayName": "Villa Club",
      "slogan": "Comunidad residencial inteligente",
      "description": "Portal digital del conjunto residencial.",
      "contactEmail": "admin@example.com",
      "contactPhone": "+593999999999",
      "whatsapp": "+593999999999",
      "address": "Santo Domingo, Ecuador",
      "city": "Santo Domingo",
      "province": "Santo Domingo de los Tsáchilas",
      "country": "Ecuador"
    },
    "branding": {
      "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
      "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
      "primaryColor": "#1E88E5",
      "secondaryColor": "#90CAF9",
      "accentColor": "#FFC107"
    },
    "wordpressMapping": {
      "wordpressSiteUrl": "https://www.resident.gustavoguaigua.com",
      "wordpressConjuntoSlug": "villa-club",
      "wordpressConjuntoId": "123",
      "accessUrl": "https://app.resident.example.com/login?tenant=villa-club",
      "isActive": true
    },
    "createdAt": "2026-07-12T10:00:00Z",
    "updatedAt": "2026-07-12T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Errores

| Código                       | HTTP | Caso              |
| ---------------------------- | ---: | ----------------- |
| `UNAUTHORIZED`               |  401 | Sin token         |
| `FORBIDDEN`                  |  403 | Sin permiso       |
| `VALIDATION_ERROR`           |  422 | Body inválido     |
| `TENANT_INVALID_SLUG`        |  422 | Slug inválido     |
| `TENANT_SLUG_ALREADY_EXISTS` |  409 | Slug duplicado    |
| `TENANT_INVALID_TIMEZONE`    |  422 | Timezone inválida |
| `TENANT_INVALID_CURRENCY`    |  422 | Moneda inválida   |
| `TENANT_INVALID_COLOR`       |  422 | Color inválido    |
| `TENANT_INVALID_URL`         |  422 | URL inválida      |
| `IDENTITY_NOT_PROVISIONED`   |  409 | Email no existe en Keycloak |
| `IDENTITY_LINK_CONFLICT`     |  409 | Email y subject no corresponden al mismo perfil |
| `IDENTITY_NOT_ELIGIBLE`      |  409 | Identidad deshabilitada o email no verificado |
| `IDENTITY_PROVIDER_UNAVAILABLE` | 503 | No se pudo verificar la identidad |

### Auditoría

Debe registrar:

```text id="xnxj7f"
tenant.created
tenant.baseRoles.created
tenant.initialAdmin.assigned
```

### Eventos

Debe emitir:

```text id="i2m43f"
TenantCreated
TenantBaseRolesCreated
TenantInitialAdminAssigned
```

Los eventos se publican después del commit y no completan pasos obligatorios.
La respuesta `201` garantiza que tenant, perfil, roles, membership,
`TenantAdmin` y auditoría quedaron confirmados juntos.

---

## 15.3. Consultar tenant por ID

### Endpoint

```http id="a35nal"
GET /api/v1/platform/tenants/{tenantId}
```

### Autenticación

Requerida.

### Permiso

```text id="j90o37"
platform.tenants.read
```

### Path params

| Nombre     | Tipo        | Requerido |
| ---------- | ----------- | --------: |
| `tenantId` | UUID/string |        Sí |

### Response 200

```json id="j8ab3q"
{
  "data": {
    "id": "tenant_uuid",
    "name": "Villa Club",
    "legalName": "Villa Club",
    "slug": "villa-club",
    "status": "active",
    "timezone": "America/Guayaquil",
    "currency": "USD",
    "planCode": null,
    "profile": {
      "displayName": "Villa Club",
      "slogan": "Comunidad residencial inteligente",
      "description": "Portal digital del conjunto residencial.",
      "contactEmail": "admin@example.com",
      "contactPhone": "+593999999999",
      "whatsapp": "+593999999999",
      "address": "Santo Domingo, Ecuador",
      "city": "Santo Domingo",
      "province": "Santo Domingo de los Tsáchilas",
      "country": "Ecuador"
    },
    "branding": {
      "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
      "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
      "primaryColor": "#1E88E5",
      "secondaryColor": "#90CAF9",
      "accentColor": "#FFC107"
    },
    "configuration": {
      "timezone": "America/Guayaquil",
      "currency": "USD",
      "defaultLanguage": "es",
      "allowResidentSelfRegistration": false,
      "allowOnlinePayments": false,
      "enableReservations": false,
      "enableFines": false,
      "enableMeetings": false,
      "enableNotifications": false
    },
    "wordpressMapping": {
      "wordpressSiteUrl": "https://www.resident.gustavoguaigua.com",
      "wordpressConjuntoSlug": "villa-club",
      "wordpressConjuntoId": "123",
      "accessUrl": "https://app.resident.example.com/login?tenant=villa-club",
      "isActive": true
    },
    "createdAt": "2026-07-12T10:00:00Z",
    "updatedAt": "2026-07-12T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Errores

| Código             | HTTP | Caso               |
| ------------------ | ---: | ------------------ |
| `UNAUTHORIZED`     |  401 | Sin token          |
| `FORBIDDEN`        |  403 | Sin permiso        |
| `TENANT_NOT_FOUND` |  404 | Tenant inexistente |

---

## 15.4. Actualizar tenant

### Endpoint

```http id="y2imms"
PATCH /api/v1/platform/tenants/{tenantId}
```

### Autenticación

Requerida.

### Permiso

```text id="c601z2"
platform.tenants.update
```

### Request body

```json id="t4ocll"
{
  "name": "Villa Club Actualizado",
  "legalName": "Villa Club Propiedad Horizontal",
  "timezone": "America/Guayaquil",
  "currency": "USD",
  "planCode": "mvp"
}
```

### Campos no modificables por este endpoint

```text id="fb9dkr"
id
status
createdAt
updatedAt
suspendedAt
suspendedBy
suspensionReason
archivedAt
archivedBy
```

El cambio de `status` se realiza mediante endpoints específicos.

### Response 200

```json id="aif6qh"
{
  "data": {
    "id": "tenant_uuid",
    "name": "Villa Club Actualizado",
    "legalName": "Villa Club Propiedad Horizontal",
    "slug": "villa-club",
    "status": "active",
    "timezone": "America/Guayaquil",
    "currency": "USD",
    "planCode": "mvp",
    "updatedAt": "2026-07-12T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Errores

| Código                    | HTTP | Caso               |
| ------------------------- | ---: | ------------------ |
| `UNAUTHORIZED`            |  401 | Sin token          |
| `FORBIDDEN`               |  403 | Sin permiso        |
| `TENANT_NOT_FOUND`        |  404 | Tenant inexistente |
| `VALIDATION_ERROR`        |  422 | Body inválido      |
| `TENANT_INVALID_TIMEZONE` |  422 | Timezone inválida  |
| `TENANT_INVALID_CURRENCY` |  422 | Moneda inválida    |

### Auditoría

```text id="9r2yr7"
tenant.updated
```

---

## 15.5. Activar tenant

### Endpoint

```http id="f0usv8"
POST /api/v1/platform/tenants/{tenantId}/activate
```

### Autenticación

Requerida.

### Permiso

```text id="ntpvj5"
platform.tenants.activate
```

### Request body

```json id="sgfx04"
{}
```

### Response 200

```json id="175dqu"
{
  "data": {
    "id": "tenant_uuid",
    "slug": "villa-club",
    "status": "active",
    "updatedAt": "2026-07-12T11:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

Para activar, el tenant debe:

* existir;
* no estar archivado;
* tener configuración mínima;
* tener roles base;
* tener al menos una membership activa con rol TenantAdmin activo.

### Errores

| Código                             | HTTP | Caso                    |
| ---------------------------------- | ---: | ----------------------- |
| `UNAUTHORIZED`                     |  401 | Sin token               |
| `FORBIDDEN`                        |  403 | Sin permiso             |
| `TENANT_NOT_FOUND`                 |  404 | Tenant inexistente      |
| `TENANT_CANNOT_BE_ACTIVATED`       |  409 | Requisitos no cumplidos |
| `TENANT_STATUS_TRANSITION_INVALID` |  409 | Transición inválida     |
| `TENANT_ARCHIVED`                  |  409 | Tenant archivado        |

### Auditoría

```text id="3hgk67"
tenant.activated
```

### Evento

```text id="7lsrgb"
TenantActivated
```

---

## 15.6. Suspender tenant

### Endpoint

```http id="es8pui"
POST /api/v1/platform/tenants/{tenantId}/suspend
```

### Autenticación

Requerida.

### Permiso

```text id="7g8l0a"
platform.tenants.suspend
```

### Request body

```json id="27uae6"
{
  "reason": "Administrative suspension due to contract review."
}
```

### Campos requeridos

```text id="cfa4xs"
reason
```

### Response 200

```json id="dgg98m"
{
  "data": {
    "id": "tenant_uuid",
    "slug": "villa-club",
    "status": "suspended",
    "suspendedAt": "2026-07-12T11:20:00Z",
    "suspensionReason": "Administrative suspension due to contract review."
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Errores

| Código                             | HTTP | Caso                      |
| ---------------------------------- | ---: | ------------------------- |
| `UNAUTHORIZED`                     |  401 | Sin token                 |
| `FORBIDDEN`                        |  403 | Sin permiso               |
| `TENANT_NOT_FOUND`                 |  404 | Tenant inexistente        |
| `TENANT_CANNOT_BE_SUSPENDED`       |  409 | No puede suspenderse      |
| `TENANT_STATUS_TRANSITION_INVALID` |  409 | Transición inválida       |
| `VALIDATION_ERROR`                 |  422 | Motivo ausente o inválido |

### Auditoría

```text id="rd5nq8"
tenant.suspended
```

### Evento

```text id="0blrho"
TenantSuspended
```

---

## 15.7. Reactivar tenant

### Endpoint

```http id="41yz1r"
POST /api/v1/platform/tenants/{tenantId}/reactivate
```

### Autenticación

Requerida.

### Permiso

```text id="18v90m"
platform.tenants.reactivate
```

### Request body

```json id="ohkrky"
{}
```

### Response 200

```json id="4yfwk6"
{
  "data": {
    "id": "tenant_uuid",
    "slug": "villa-club",
    "status": "active",
    "updatedAt": "2026-07-12T11:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Errores

| Código                             | HTTP | Caso                  |
| ---------------------------------- | ---: | --------------------- |
| `UNAUTHORIZED`                     |  401 | Sin token             |
| `FORBIDDEN`                        |  403 | Sin permiso           |
| `TENANT_NOT_FOUND`                 |  404 | Tenant inexistente    |
| `TENANT_CANNOT_BE_REACTIVATED`     |  409 | No cumple condiciones |
| `TENANT_STATUS_TRANSITION_INVALID` |  409 | Transición inválida   |
| `TENANT_ARCHIVED`                  |  409 | Tenant archivado      |

### Auditoría

```text id="mz3grb"
tenant.reactivated
```

### Evento

```text id="blc3zi"
TenantReactivated
```

---

## 15.8. Archivar tenant

### Endpoint

```http id="fwjpeq"
POST /api/v1/platform/tenants/{tenantId}/archive
```

### Autenticación

Requerida.

### Permiso

```text id="hqpc4u"
platform.tenants.archive
```

### Request body

```json id="zzvw4i"
{
  "reason": "Tenant closed and retained for historical records."
}
```

### Response 200

```json id="afyzqw"
{
  "data": {
    "id": "tenant_uuid",
    "slug": "villa-club",
    "status": "archived",
    "archivedAt": "2026-07-12T11:40:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No elimina datos físicamente.
* Bloquea operación ordinaria.
* Debe auditarse.
* Reactivación futura requiere proceso especial.

### Errores

| Código                             | HTTP | Caso                |
| ---------------------------------- | ---: | ------------------- |
| `UNAUTHORIZED`                     |  401 | Sin token           |
| `FORBIDDEN`                        |  403 | Sin permiso         |
| `TENANT_NOT_FOUND`                 |  404 | Tenant inexistente  |
| `TENANT_CANNOT_BE_ARCHIVED`        |  409 | No puede archivarse |
| `TENANT_STATUS_TRANSITION_INVALID` |  409 | Transición inválida |

### Auditoría

```text id="z8q8b2"
tenant.archived
```

### Evento

```text id="xkxz70"
TenantArchived
```

---

# 16. Active Tenant API

Todos los endpoints de esta sección exigen `X-Tenant-Id: <tenant-uuid>`. El header
selecciona contexto para una sola solicitud y no constituye autoridad: Core valida
`UserProfile`, tenant, membership y permisos antes de acceder a datos. No se acepta
`tenantId` en query o body para sustituirlo y no existe estado server-side de tenant
activo.

---

## 16.1. Consultar perfil del tenant activo

### Endpoint

```http id="602k0a"
GET /api/v1/tenant/profile
```

### Autenticación

Requerida.

### Permiso

```text id="1qjskm"
tenants.profile.read
```

### Tenant activo

Requerido mediante un único `X-Tenant-Id` UUID válido.

### Response 200

```json id="0nwodt"
{
  "data": {
    "displayName": "Villa Club",
    "slogan": "Comunidad residencial inteligente",
    "description": "Portal digital del conjunto residencial.",
    "contactEmail": "admin@example.com",
    "contactPhone": "+593999999999",
    "whatsapp": "+593999999999",
    "address": "Santo Domingo, Ecuador",
    "city": "Santo Domingo",
    "province": "Santo Domingo de los Tsáchilas",
    "country": "Ecuador"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Errores

| Código             | HTTP | Caso                                   |
| ------------------ | ---: | -------------------------------------- |
| `UNAUTHORIZED`     |  401 | Sin token                              |
| `FORBIDDEN`        |  403 | Sin permiso o sin tenant               |
| `TENANT_NOT_FOUND` |  404 | Tenant no encontrado                   |
| `TENANT_SUSPENDED` |  403 | Tenant suspendido, si política bloquea |

---

## 16.2. Actualizar perfil del tenant activo

### Endpoint

```http id="g1qkb3"
PATCH /api/v1/tenant/profile
```

### Autenticación

Requerida.

### Permiso

```text id="s9t1oc"
tenants.profile.update
```

### Request body

```json id="h5n1fq"
{
  "displayName": "Villa Club",
  "slogan": "Comunidad residencial inteligente",
  "description": "Portal digital del conjunto residencial.",
  "contactEmail": "admin@example.com",
  "contactPhone": "+593999999999",
  "whatsapp": "+593999999999",
  "address": "Santo Domingo, Ecuador",
  "city": "Santo Domingo",
  "province": "Santo Domingo de los Tsáchilas",
  "country": "Ecuador"
}
```

### Response 200

```json id="37z5t1"
{
  "data": {
    "displayName": "Villa Club",
    "slogan": "Comunidad residencial inteligente",
    "description": "Portal digital del conjunto residencial.",
    "contactEmail": "admin@example.com",
    "contactPhone": "+593999999999",
    "whatsapp": "+593999999999",
    "address": "Santo Domingo, Ecuador",
    "city": "Santo Domingo",
    "province": "Santo Domingo de los Tsáchilas",
    "country": "Ecuador",
    "updatedAt": "2026-07-12T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="kicymm"
tenant.profile.updated
```

### Errores

| Código             | HTTP | Caso                       |
| ------------------ | ---: | -------------------------- |
| `UNAUTHORIZED`     |  401 | Sin token                  |
| `FORBIDDEN`        |  403 | Sin permiso o tenant ajeno |
| `TENANT_NOT_FOUND` |  404 | Tenant no encontrado       |
| `VALIDATION_ERROR` |  422 | Body inválido              |

---

## 16.3. Consultar branding del tenant activo

### Endpoint

```http id="8l3pfr"
GET /api/v1/tenant/branding
```

### Autenticación

Requerida.

### Permiso

```text id="9s6lq5"
tenants.branding.read
```

### Response 200

```json id="erdoev"
{
  "data": {
    "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
    "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
    "primaryColor": "#1E88E5",
    "secondaryColor": "#90CAF9",
    "accentColor": "#FFC107"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.4. Actualizar branding del tenant activo

### Endpoint

```http id="p7i6al"
PATCH /api/v1/tenant/branding
```

### Autenticación

Requerida.

### Permiso

```text id="sgr6lb"
tenants.branding.update
```

### Request body

```json id="9otq9g"
{
  "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
  "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
  "primaryColor": "#1E88E5",
  "secondaryColor": "#90CAF9",
  "accentColor": "#FFC107"
}
```

### Response 200

```json id="n3q38u"
{
  "data": {
    "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
    "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
    "primaryColor": "#1E88E5",
    "secondaryColor": "#90CAF9",
    "accentColor": "#FFC107",
    "updatedAt": "2026-07-12T12:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Validaciones

* URLs válidas.
* HTTPS en producción.
* Colores en formato `#RRGGBB`.

### Auditoría

```text id="rcgobz"
tenant.branding.updated
```

### Errores

| Código                 | HTTP | Caso           |
| ---------------------- | ---: | -------------- |
| `TENANT_INVALID_URL`   |  422 | URL inválida   |
| `TENANT_INVALID_COLOR` |  422 | Color inválido |
| `FORBIDDEN`            |  403 | Sin permiso    |

---

## 16.5. Consultar configuración del tenant activo

### Endpoint

```http id="c5ez5s"
GET /api/v1/tenant/configuration
```

### Autenticación

Requerida.

### Permiso

```text id="hd2wos"
tenants.configuration.read
```

### Response 200

```json id="4j8ncv"
{
  "data": {
    "timezone": "America/Guayaquil",
    "currency": "USD",
    "defaultLanguage": "es",
    "allowResidentSelfRegistration": false,
    "allowOnlinePayments": false,
    "enableReservations": false,
    "enableFines": false,
    "enableMeetings": false,
    "enableNotifications": false
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 16.6. Actualizar configuración del tenant activo

### Endpoint

```http id="i9kiah"
PATCH /api/v1/tenant/configuration
```

### Autenticación

Requerida.

### Permiso

```text id="2hjx8l"
tenants.configuration.update
```

### Request body

```json id="c52cxo"
{
  "timezone": "America/Guayaquil",
  "currency": "USD",
  "defaultLanguage": "es",
  "allowResidentSelfRegistration": false,
  "allowOnlinePayments": false,
  "enableReservations": true,
  "enableFines": true,
  "enableMeetings": false,
  "enableNotifications": true
}
```

### Response 200

```json id="wo7jer"
{
  "data": {
    "timezone": "America/Guayaquil",
    "currency": "USD",
    "defaultLanguage": "es",
    "allowResidentSelfRegistration": false,
    "allowOnlinePayments": false,
    "enableReservations": true,
    "enableFines": true,
    "enableMeetings": false,
    "enableNotifications": true,
    "updatedAt": "2026-07-12T12:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Validaciones

* `currency` solo `USD` en MVP.
* `timezone` válida.
* flags no deben activar módulos no disponibles en producción sin control.

### Auditoría

```text id="jg8q9c"
tenant.configuration.updated
```

---

## 16.7. Actualizar mapeo WordPress del tenant activo

### Endpoint

```http id="k0pkih"
PATCH /api/v1/tenant/wordpress-mapping
```

### Autenticación

Requerida.

### Permiso

```text id="pbk270"
tenants.wordpress.update
```

### Request body

```json id="702ua3"
{
  "wordpressSiteUrl": "https://www.resident.gustavoguaigua.com",
  "wordpressConjuntoSlug": "villa-club",
  "wordpressConjuntoId": "123",
  "accessUrl": "https://app.resident.example.com/login?tenant=villa-club",
  "isActive": true
}
```

### Response 200

```json id="xw3k02"
{
  "data": {
    "wordpressSiteUrl": "https://www.resident.gustavoguaigua.com",
    "wordpressConjuntoSlug": "villa-club",
    "wordpressConjuntoId": "123",
    "accessUrl": "https://app.resident.example.com/login?tenant=villa-club",
    "isActive": true,
    "updatedAt": "2026-07-12T12:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="oz2nqg"
tenant.wordpressMapping.updated
```

### Errores

| Código                      | HTTP | Caso             |
| --------------------------- | ---: | ---------------- |
| `WORDPRESS_MAPPING_INVALID` |  422 | Mapping inválido |
| `TENANT_INVALID_URL`        |  422 | URL inválida     |
| `FORBIDDEN`                 |  403 | Sin permiso      |

---

# 17. Public Tenants API

---

## 17.1. Consultar perfil público por slug

### Endpoint

```http id="wby5ol"
GET /api/v1/public/tenants/{slug}
```

### Autenticación

No requerida.

### Permiso

No aplica.

### Rate limiting

Requerido.

### CORS

Debe permitir el portal WordPress autorizado:

```text id="sa71ta"
https://www.resident.gustavoguaigua.com
```

Otros orígenes se definen por ambiente.

### Path params

| Nombre | Tipo   | Requerido |
| ------ | ------ | --------: |
| `slug` | string |        Sí |

### Response 200

```json id="zeozw0"
{
  "data": {
    "slug": "villa-club",
    "displayName": "Villa Club",
    "slogan": "Comunidad residencial inteligente",
    "description": "Portal digital del conjunto residencial.",
    "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
    "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
    "primaryColor": "#1E88E5",
    "secondaryColor": "#90CAF9",
    "accentColor": "#FFC107",
    "contact": {
      "email": "admin@example.com",
      "phone": "+593999999999",
      "whatsapp": "+593999999999",
      "address": "Santo Domingo, Ecuador",
      "city": "Santo Domingo",
      "province": "Santo Domingo de los Tsáchilas",
      "country": "Ecuador"
    },
    "accessUrl": "https://app.resident.example.com/login?tenant=villa-club"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Campos permitidos

```text id="ujzdso"
slug
displayName
slogan
description
logoUrl
bannerUrl
primaryColor
secondaryColor
accentColor
contact.email
contact.phone
contact.whatsapp
contact.address
contact.city
contact.province
contact.country
accessUrl
```

### Campos prohibidos

No debe devolver:

```text id="xgaiz5"
tenant internal id
planCode
status interno detallado
suspendedAt
suspendedBy
suspensionReason
archivedAt
archivedBy
configuration flags internos
wordpressConjuntoId
roles
permissions
users
memberships
audit
financial data
resident data
payment data
```

### Comportamiento por estado

| Estado tenant  | Respuesta recomendada                     |
| -------------- | ----------------------------------------- |
| `active`       | 200 con perfil público                    |
| `pendingSetup` | 404 o perfil limitado según configuración |
| `suspended`    | 404 o perfil limitado según política      |
| `inactive`     | 404                                       |
| `archived`     | 404                                       |

Decisión MVP:

```text id="jbm052"
Solo tenants active se exponen públicamente.
```

### Errores

| Código                | HTTP | Caso                          |
| --------------------- | ---: | ----------------------------- |
| `TENANT_NOT_FOUND`    |  404 | Slug inexistente o no público |
| `TENANT_INVALID_SLUG` |  422 | Slug inválido                 |
| `RATE_LIMITED`        |  429 | Demasiadas solicitudes        |

---

## 18. DTOs principales

---

## 18.1. TenantSummaryDto

```json id="nijget"
{
  "id": "tenant_uuid",
  "name": "Villa Club",
  "legalName": "Villa Club",
  "slug": "villa-club",
  "status": "active",
  "timezone": "America/Guayaquil",
  "currency": "USD",
  "createdAt": "2026-07-12T10:00:00Z",
  "updatedAt": "2026-07-12T10:00:00Z"
}
```

---

## 18.2. TenantDetailDto

```json id="r02i2b"
{
  "id": "tenant_uuid",
  "name": "Villa Club",
  "legalName": "Villa Club",
  "slug": "villa-club",
  "status": "active",
  "timezone": "America/Guayaquil",
  "currency": "USD",
  "planCode": "mvp",
  "profile": {},
  "branding": {},
  "configuration": {},
  "wordpressMapping": {},
  "createdAt": "2026-07-12T10:00:00Z",
  "updatedAt": "2026-07-12T10:00:00Z"
}
```

---

## 18.3. PublicTenantProfileDto

```json id="q4t9mc"
{
  "slug": "villa-club",
  "displayName": "Villa Club",
  "slogan": "Comunidad residencial inteligente",
  "description": "Portal digital del conjunto residencial.",
  "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
  "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
  "primaryColor": "#1E88E5",
  "secondaryColor": "#90CAF9",
  "accentColor": "#FFC107",
  "contact": {
    "email": "admin@example.com",
    "phone": "+593999999999",
    "whatsapp": "+593999999999",
    "address": "Santo Domingo, Ecuador",
    "city": "Santo Domingo",
    "province": "Santo Domingo de los Tsáchilas",
    "country": "Ecuador"
  },
  "accessUrl": "https://app.resident.example.com/login?tenant=villa-club"
}
```

---

## 19. Validaciones generales

### 19.1. Slug

Regex:

```text id="v2g3i9"
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Longitud:

```text id="lz0as3"
min: 3
max: 80
```

Slugs reservados:

```text id="xjf8e4"
admin
api
auth
login
logout
platform
system
public
resident
www
app
dashboard
core
support
help
billing
settings
```

---

### 19.2. Timezone

Default:

```text id="u2xtm7"
America/Guayaquil
```

Debe ser timezone válida.

---

### 19.3. Currency

MVP:

```text id="h5vtyr"
USD
```

---

### 19.4. Color

Regex:

```text id="k062fi"
^#[0-9A-Fa-f]{6}$
```

---

### 19.5. URL

En producción:

```text id="n15h8b"
HTTPS requerido.
```

En local/dev:

```text id="0b3yvo"
HTTP permitido solo para localhost o ambientes explícitamente permitidos.
```

---

### 19.6. Strings

Reglas generales:

* trim;
* no aceptar strings vacíos si el campo es requerido;
* longitud máxima por campo;
* sanitización contra payloads excesivos;
* no interpretar HTML en campos públicos salvo decisión posterior.

---

## 20. Catálogo de errores

| Código                             | HTTP | Descripción                               |
| ---------------------------------- | ---: | ----------------------------------------- |
| `UNAUTHORIZED`                     |  401 | No autenticado                            |
| `FORBIDDEN`                        |  403 | Sin permiso                               |
| `VALIDATION_ERROR`                 |  422 | Error de validación                       |
| `TENANT_NOT_FOUND`                 |  404 | Tenant no encontrado                      |
| `TENANT_SLUG_ALREADY_EXISTS`       |  409 | Slug duplicado                            |
| `TENANT_INVALID_SLUG`              |  422 | Slug inválido                             |
| `TENANT_INVALID_STATUS`            |  422 | Estado inválido                           |
| `TENANT_STATUS_TRANSITION_INVALID` |  409 | Transición no permitida                   |
| `TENANT_CANNOT_BE_ACTIVATED`       |  409 | Tenant no cumple requisitos de activación |
| `TENANT_CANNOT_BE_SUSPENDED`       |  409 | Tenant no puede suspenderse               |
| `TENANT_CANNOT_BE_REACTIVATED`     |  409 | Tenant no puede reactivarse               |
| `TENANT_CANNOT_BE_ARCHIVED`        |  409 | Tenant no puede archivarse                |
| `TENANT_ARCHIVED`                  |  409 | Tenant archivado                          |
| `TENANT_SUSPENDED`                 |  403 | Tenant suspendido                         |
| `TENANT_INVALID_TIMEZONE`          |  422 | Timezone inválida                         |
| `TENANT_INVALID_CURRENCY`          |  422 | Moneda inválida                           |
| `TENANT_INVALID_COLOR`             |  422 | Color inválido                            |
| `TENANT_INVALID_URL`               |  422 | URL inválida                              |
| `WORDPRESS_MAPPING_INVALID`        |  422 | Mapeo WordPress inválido                  |
| `RATE_LIMITED`                     |  429 | Límite de solicitudes excedido            |
| `INTERNAL_ERROR`                   |  500 | Error interno                             |

---

## 21. Ejemplo de error de validación

```json id="zjqxlt"
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": {
      "fields": [
        {
          "field": "slug",
          "message": "Slug must contain only lowercase letters, numbers and hyphens."
        }
      ]
    },
    "traceId": "req_123456"
  }
}
```

---

## 22. Ejemplo de error de duplicidad

```json id="71o9o8"
{
  "error": {
    "code": "TENANT_SLUG_ALREADY_EXISTS",
    "message": "A tenant with this slug already exists.",
    "details": {
      "slug": "villa-club"
    },
    "traceId": "req_123456"
  }
}
```

---

## 23. Ejemplo de error de autorización

```json id="3yf3xi"
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not allowed to perform this action.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 24. Auditoría por endpoint

| Endpoint                                       | Auditoría                                    |
| ---------------------------------------------- | -------------------------------------------- |
| `POST /platform/tenants`                       | `tenant.created`, `tenant.baseRoles.created` |
| `PATCH /platform/tenants/{tenantId}`           | `tenant.updated`                             |
| `POST /platform/tenants/{tenantId}/activate`   | `tenant.activated`                           |
| `POST /platform/tenants/{tenantId}/suspend`    | `tenant.suspended`                           |
| `POST /platform/tenants/{tenantId}/reactivate` | `tenant.reactivated`                         |
| `POST /platform/tenants/{tenantId}/archive`    | `tenant.archived`                            |
| `PATCH /tenant/profile`                        | `tenant.profile.updated`                     |
| `PATCH /tenant/branding`                       | `tenant.branding.updated`                    |
| `PATCH /tenant/configuration`                  | `tenant.configuration.updated`               |
| `PATCH /tenant/wordpress-mapping`              | `tenant.wordpressMapping.updated`            |

---

## 25. Eventos por endpoint

| Endpoint                                       | Evento                                    |
| ---------------------------------------------- | ----------------------------------------- |
| `POST /platform/tenants`                       | `TenantCreated`, `TenantBaseRolesCreated` |
| `POST /platform/tenants/{tenantId}/activate`   | `TenantActivated`                         |
| `POST /platform/tenants/{tenantId}/suspend`    | `TenantSuspended`                         |
| `POST /platform/tenants/{tenantId}/reactivate` | `TenantReactivated`                       |
| `POST /platform/tenants/{tenantId}/archive`    | `TenantArchived`                          |
| `PATCH /tenant/profile`                        | `TenantProfileUpdated`                    |
| `PATCH /tenant/branding`                       | `TenantBrandingUpdated`                   |
| `PATCH /tenant/configuration`                  | `TenantConfigurationUpdated`              |
| `PATCH /tenant/wordpress-mapping`              | `TenantWordPressMappingUpdated`           |

---

## 26. Observabilidad por endpoint

Todos los endpoints deben registrar:

```text id="qac2dw"
traceId
method
path
status
latencyMs
actorUserId si aplica
tenantId si aplica
errorCode si aplica
```

El endpoint público debe registrar métricas agregadas:

```text id="yh0aql"
tenants_public_profile_requests_total
tenants_public_profile_errors_total
```

No registrar:

```text id="zwely5"
tokens
authorization header completo
cookies completas
payloads sensibles completos
```

---

## 27. Rate limiting

### 27.1. Endpoint público

Debe tener rate limiting:

```text id="6vveeu"
GET /api/v1/public/tenants/{slug}
```

### 27.2. Endpoints privados sensibles

Recomendado:

```text id="2t9vqb"
POST /api/v1/platform/tenants
POST /api/v1/platform/tenants/{tenantId}/suspend
POST /api/v1/platform/tenants/{tenantId}/archive
```

Los valores concretos se definirán en configuración de gateway/backend.

---

## 28. CORS

### 28.1. Endpoint público

Debe permitir el origen WordPress autorizado.

Inicialmente:

```text id="cbs3au"
https://www.resident.gustavoguaigua.com
```

### 28.2. Endpoints privados

No deben aceptar CORS abierto en producción.

Prohibido:

```text id="7l74ki"
Access-Control-Allow-Origin: *
```

para endpoints autenticados.

---

## 29. Seguridad del contrato público

El endpoint:

```text id="usffuv"
GET /api/v1/public/tenants/{slug}
```

debe protegerse contra:

* enumeración abusiva;
* exposición de tenants no activos;
* exposición de IDs internos;
* exposición de configuración;
* exposición de datos financieros;
* exposición de datos personales;
* payloads de error excesivamente descriptivos.

---

## 30. Compatibilidad con WordPress

### 30.1. Uso esperado desde WordPress

WordPress podrá consultar:

```http id="x9a35p"
GET https://api.resident.example.com/api/v1/public/tenants/villa-club
```

Y usar la respuesta para mostrar:

* nombre;
* slogan;
* logo;
* banner;
* colores;
* contacto;
* botón `Acceso Residentes`.

---

### 30.2. WordPress no debe consumir

WordPress no debe consumir:

```text id="ky8jtp"
/api/v1/platform/tenants
/api/v1/tenant/profile
/api/v1/tenant/configuration
/api/v1/payments
/api/v1/account-statements
/api/v1/residents
```

salvo integración autenticada futura con permisos específicos.

---

## 31. Compatibilidad con Keycloak

Cuando Keycloak esté activo:

* el frontend obtendrá token desde Keycloak;
* la API validará el token;
* el Core mapeará `sub` con `UserProfile`;
* el Core validará membresía y permisos;
* estos endpoints no dependerán de roles finos dentro del token.

---

## 32. Compatibilidad con n8n

n8n no consume endpoints de esta spec en MVP, salvo futuras automatizaciones.

Si se habilita:

* debe usar service account;
* debe tener scopes mínimos;
* debe auditarse;
* no debe acceder a endpoints públicos para operaciones administrativas;
* no debe modificar tenants sin permiso explícito.

---

## 33. OpenAPI

Cada endpoint debe documentarse con:

* summary;
* description;
* tags;
* security;
* parameters;
* requestBody;
* responses;
* error schemas;
* examples;
* permission required;
* audit event;
* rate limit si aplica.

Tag sugerido:

```text id="s364qk"
Tenants
Platform Tenants
Public Tenants
```

---

## 34. Extensiones OpenAPI sugeridas

Para documentar permisos:

```yaml id="h1lqkw"
x-required-permission: platform.tenants.create
x-audit-event: tenant.created
x-tenant-scope: platform
```

Para endpoint público:

```yaml id="wbo13s"
x-public: true
x-rate-limit: true
```

---

## 35. Pruebas de contrato requeridas

### 35.1. Platform API

Probar:

* respuesta de lista;
* creación válida;
* error slug duplicado;
* consulta por ID;
* actualización;
* activar;
* suspender;
* reactivar;
* archivar.

---

### 35.2. Active Tenant API

Probar:

* leer perfil;
* actualizar perfil;
* leer branding;
* actualizar branding;
* leer configuración;
* actualizar configuración;
* actualizar WordPress mapping;
* usuario de otro tenant no puede modificar.

---

### 35.3. Public API

Probar:

* slug válido activo devuelve 200;
* slug inexistente devuelve 404;
* slug inválido devuelve 422;
* tenant suspendido no se expone;
* tenant archivado no se expone;
* respuesta no contiene campos prohibidos;
* contrato coincide con WordPress.

---

## 36. Matriz resumen de endpoints

| Método | Ruta                                             | Auth | Permiso                        | Auditoría                         |
| ------ | ------------------------------------------------ | ---: | ------------------------------ | --------------------------------- |
| GET    | `/api/v1/platform/tenants`                       |   Sí | `platform.tenants.read`        | No obligatoria                    |
| POST   | `/api/v1/platform/tenants`                       |   Sí | `platform.tenants.create`      | `tenant.created`                  |
| GET    | `/api/v1/platform/tenants/{tenantId}`            |   Sí | `platform.tenants.read`        | No obligatoria                    |
| PATCH  | `/api/v1/platform/tenants/{tenantId}`            |   Sí | `platform.tenants.update`      | `tenant.updated`                  |
| POST   | `/api/v1/platform/tenants/{tenantId}/activate`   |   Sí | `platform.tenants.activate`    | `tenant.activated`                |
| POST   | `/api/v1/platform/tenants/{tenantId}/suspend`    |   Sí | `platform.tenants.suspend`     | `tenant.suspended`                |
| POST   | `/api/v1/platform/tenants/{tenantId}/reactivate` |   Sí | `platform.tenants.reactivate`  | `tenant.reactivated`              |
| POST   | `/api/v1/platform/tenants/{tenantId}/archive`    |   Sí | `platform.tenants.archive`     | `tenant.archived`                 |
| GET    | `/api/v1/tenant/profile`                         |   Sí | `tenants.profile.read`         | No obligatoria                    |
| PATCH  | `/api/v1/tenant/profile`                         |   Sí | `tenants.profile.update`       | `tenant.profile.updated`          |
| GET    | `/api/v1/tenant/branding`                        |   Sí | `tenants.branding.read`        | No obligatoria                    |
| PATCH  | `/api/v1/tenant/branding`                        |   Sí | `tenants.branding.update`      | `tenant.branding.updated`         |
| GET    | `/api/v1/tenant/configuration`                   |   Sí | `tenants.configuration.read`   | No obligatoria                    |
| PATCH  | `/api/v1/tenant/configuration`                   |   Sí | `tenants.configuration.update` | `tenant.configuration.updated`    |
| PATCH  | `/api/v1/tenant/wordpress-mapping`               |   Sí | `tenants.wordpress.update`     | `tenant.wordpressMapping.updated` |
| GET    | `/api/v1/public/tenants/{slug}`                  |   No | Público                        | No obligatoria                    |

---

## 37. Casos borde del contrato

| Caso                                         | Resultado |
| -------------------------------------------- | --------- |
| Crear tenant sin `name`                      | 422       |
| Crear tenant con slug duplicado              | 409       |
| Crear tenant con slug reservado              | 422       |
| Crear tenant con color inválido              | 422       |
| Crear tenant con URL HTTP en producción      | 422       |
| Activar tenant sin requisitos mínimos        | 409       |
| Suspender tenant sin motivo                  | 422       |
| Suspender tenant ya suspendido               | 409       |
| Reactivar tenant activo                      | 409       |
| Archivar tenant activo sin permiso           | 403       |
| Consultar slug inexistente público           | 404       |
| Consultar tenant archivado público           | 404       |
| TenantAdmin modifica otro tenant             | 403/404   |
| WordPress intenta endpoint privado sin token | 401       |
| Token válido sin permiso                     | 403       |

---

## 38. Reglas de compatibilidad futura

Este contrato debe permitir en el futuro:

* dominios personalizados por tenant;
* alias de slug;
* importación desde WordPress;
* actualización pública cacheable;
* feature flags;
* planes SaaS;
* roles personalizados;
* endpoints GraphQL si se justifica;
* microservicio de tenants si se extrae.

Cualquier breaking change requiere:

* actualizar spec;
* actualizar api-contract;
* actualizar OpenAPI;
* actualizar contract tests;
* documentar en ADR o change note si afecta arquitectura.

---

## 39. Decisión final del contrato API

El módulo `001-tenants` expondrá tres grupos de endpoints:

```text id="y5i6ri"
Platform Tenants API
Active Tenant API
Public Tenants API
```

Los endpoints de plataforma serán usados por administradores globales.

Los endpoints de tenant activo serán usados por administradores autorizados dentro de un tenant.

El endpoint público será usado por WordPress para mostrar información institucional limitada.

La autorización de negocio se aplicará en RESIDENT Core.

El contrato evitará exposición de datos internos, financieros o personales.

Este API contract será base para controladores NestJS, DTOs, OpenAPI, pruebas API y pruebas de contrato.
