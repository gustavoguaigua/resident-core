# API Contract — Spec 002 Users, Roles, Permissions and Tenant Memberships

## 1. Información del documento

| Campo                  | Valor                                         |
| ---------------------- | --------------------------------------------- |
| Proyecto               | RESIDENT Core                                 |
| Spec ID                | 002                                           |
| Módulo                 | Users, Roles and Access Management            |
| Documento              | API Contract                                  |
| Ruta                   | `docs/specs/002-users-roles/api-contract.md`  |
| Versión                | 0.1                                           |
| Estado                 | accepted                                  |
| Fecha                  | 2026-07-13                                    |
| Documento base         | `docs/specs/002-users-roles/spec.md`          |
| Plan técnico           | `docs/specs/002-users-roles/plan.md`          |
| Modelo de datos        | `docs/specs/002-users-roles/data-model.md`    |
| API Style              | REST                                          |
| API Version            | `/api/v1`                                     |
| Formato                | JSON                                          |
| Autenticación objetivo | Bearer Token emitido por Keycloak             |
| Autorización           | RESIDENT Core tenant-aware RBAC + permissions |

---

## 2. Propósito

Este documento define el contrato API del módulo `002-users-roles`.

El objetivo es establecer:

* endpoints;
* métodos HTTP;
* rutas;
* permisos requeridos;
* requests;
* responses;
* errores;
* status codes;
* paginación;
* filtros;
* ordenamiento;
* contrato de invitaciones;
* contrato de usuario actual;
* contrato de permisos efectivos;
* auditoría por operación;
* eventos de dominio;
* reglas de seguridad;
* compatibilidad OpenAPI.

Este contrato será base para:

* controladores NestJS;
* DTOs;
* guards;
* OpenAPI;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas de seguridad;
* integración futura con Keycloak;
* integración futura con n8n.

---

## 3. Principios del contrato API

### 3.1. Regla central

```text id="2f7t6k"
Keycloak autentica.
RESIDENT Core autoriza.
```

Un token válido no concede automáticamente acceso de negocio.

---

### 3.2. Versionamiento

Todos los endpoints usan:

```text id="7x0af0"
/api/v1
```

---

### 3.3. Formato JSON

Los cuerpos JSON usan `camelCase`.

Ejemplo:

```json id="x6n805"
{
  "displayName": "Administrador Villa Club",
  "email": "tenant.admin@example.com"
}
```

---

### 3.4. Respuesta estándar

Respuesta exitosa individual:

```json id="j71ry8"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

Respuesta de lista:

```json id="27y4uh"
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

### 3.5. Error estándar

```json id="gsjjm9"
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

## 4. Grupos de endpoints

El módulo define cinco grupos principales:

```text id="41jaeg"
1. Platform Users API
2. Platform Roles and Permissions API
3. Tenant Users API
4. Current User API
5. Invitations API
```

---

## 5. Headers generales

### 5.1. Request headers

| Header             |                Requerido | Descripción                        |
| ------------------ | -----------------------: | ---------------------------------- |
| `Authorization`    | Sí en endpoints privados | Bearer token                       |
| `Content-Type`     |         Sí en POST/PATCH | `application/json`                 |
| `Accept`           |              Recomendado | `application/json`                 |
| `X-Tenant-Id`      | Sí en endpoints tenant-scoped | Selector UUID no confiable     |
| `X-Request-Id`     |                 Opcional | ID de request provisto por cliente |
| `X-Correlation-Id` |                 Opcional | ID de correlación                  |

---

### 5.2. Response headers

| Header             | Descripción                 |
| ------------------ | --------------------------- |
| `Content-Type`     | `application/json`          |
| `X-Request-Id`     | ID de request               |
| `X-Correlation-Id` | ID de correlación si aplica |

---

## 6. Autenticación

### 6.1. Endpoints privados

Requieren:

```http id="dpxajo"
Authorization: Bearer <access_token>
```

Contrato de Sprint 2:

```text id="m75tav"
Access token OIDC emitido por el realm Keycloak `resident`.
```

---

### 6.2. Endpoints de invitación

Los endpoints de invitación pueden ser parcialmente públicos, pero requieren token de invitación válido en la URL.

Ejemplo:

```text id="o33wug"
/api/v1/invitations/{token}
```

Reglas:

* el token original no se almacena en claro;
* el token no debe registrarse en logs;
* la respuesta no debe revelar información sensible;
* invitaciones expiradas, revocadas o aceptadas no pueden reutilizarse.

---

## 7. Autorización

### 7.1. Evaluación mínima

Para endpoints privados, el backend debe validar:

```text id="97gk01"
1. Token válido.
2. UserProfile local existente.
3. UserProfile activo.
4. Tenant activo si el endpoint es tenant-scoped.
5. Membership activa si el endpoint es tenant-scoped.
6. Rol asignado.
7. Permiso requerido.
8. Recurso dentro del tenant correcto.
9. Restricción de estado.
```

En el paso 4, `X-Tenant-Id` selecciona el tenant para esa solicitud pero no lo
autoriza. Está prohibido sustituirlo con `tenantId` en query/body o conservar la
selección como estado de sesión.

---

### 7.2. Permisos globales

| Permiso                     | Descripción                              |
| --------------------------- | ---------------------------------------- |
| `platform.users.create`     | Crear usuarios desde plataforma          |
| `platform.users.read`       | Consultar usuarios globalmente           |
| `platform.users.update`     | Actualizar usuarios globalmente          |
| `platform.users.disable`    | Desactivar usuarios                      |
| `platform.users.enable`     | Reactivar usuarios                       |
| `platform.roles.read`       | Consultar roles                          |
| `platform.roles.assign`     | Asignar roles globales                   |
| `platform.permissions.read` | Consultar permisos                       |
| `platform.audit.read`       | Consultar auditoría de plataforma futura |

---

### 7.3. Permisos tenant-scoped

| Permiso                   | Descripción                                    |
| ------------------------- | ---------------------------------------------- |
| `users.invite`            | Invitar usuarios al tenant                     |
| `users.read`              | Consultar usuarios del tenant                  |
| `users.update`            | Actualizar usuarios/membresías del tenant      |
| `users.disable`           | Desactivar acceso dentro del tenant, si aplica |
| `users.membership.revoke` | Revocar membresía                              |
| `users.roles.assign`      | Asignar roles dentro del tenant                |
| `users.roles.remove`      | Remover roles dentro del tenant                |
| `users.permissions.read`  | Consultar permisos efectivos del tenant        |

---

## 8. Paginación

Listados usan:

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

---

## 9. Ordenamiento

Campos permitidos:

```text id="uu6rux"
createdAt
email
displayName
status
```

Parámetros:

| Query param | Tipo   | Default     |
| ----------- | ------ | ----------- |
| `sortBy`    | string | `createdAt` |
| `sortOrder` | string | `desc`      |

Valores permitidos:

```text id="c69z91"
asc
desc
```

---

## 10. Estados HTTP

| Código | Uso                              |
| -----: | -------------------------------- |
|    200 | Consulta o actualización exitosa |
|    201 | Recurso creado                   |
|    204 | Operación exitosa sin body       |
|    400 | Request mal formado              |
|    401 | No autenticado                   |
|    403 | Sin permiso                      |
|    404 | Recurso no encontrado            |
|    409 | Conflicto de estado o duplicidad |
|    422 | Validación semántica fallida     |
|    429 | Rate limit                       |
|    500 | Error interno                    |

---

# 11. Platform Users API

Ruta base:

```text id="q4868x"
/api/v1/platform/users
```

Uso:

* administración global de usuarios;
* creación de UserProfile;
* consulta global;
* actualización;
* desactivación;
* reactivación.

Todos los endpoints requieren autenticación y permisos globales.

---

## 11.1. Listar usuarios de plataforma

### Endpoint

```http id="wvobkh"
GET /api/v1/platform/users
```

### Permiso

```text id="f783r3"
platform.users.read
```

### Query params

| Nombre      | Tipo   | Requerido | Default   | Descripción                                       |
| ----------- | ------ | --------: | --------- | ------------------------------------------------- |
| `page`      | number |        No | 1         | Página                                            |
| `pageSize`  | number |        No | 20        | Tamaño de página                                  |
| `status`    | string |        No | —         | Estado del usuario                                |
| `userType`  | string |        No | —         | `human` o `serviceAccount`                        |
| `search`    | string |        No | —         | Busca por email, displayName, firstName, lastName |
| `sortBy`    | string |        No | createdAt | Campo de ordenamiento                             |
| `sortOrder` | string |        No | desc      | asc/desc                                          |

### Response 200

```json id="6ugb1q"
{
  "data": [
    {
      "id": "user_uuid",
      "email": "platform.admin@example.com",
      "displayName": "Platform Admin",
      "firstName": "Platform",
      "lastName": "Admin",
      "status": "active",
      "userType": "human",
      "authProvider": "keycloak",
      "keycloakSubjectId": "kc_subject_uuid",
      "createdAt": "2026-07-13T10:00:00Z",
      "updatedAt": "2026-07-13T10:00:00Z"
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

---

## 11.2. Crear usuario local

### Endpoint

```http id="zq0836"
POST /api/v1/platform/users
```

### Permiso

```text id="o5d1hz"
platform.users.create
```

### Request body

```json id="7fxyx4"
{
  "email": "tenant.admin.villa@example.com",
  "displayName": "Tenant Admin Villa",
  "firstName": "Tenant",
  "lastName": "Admin",
  "authProvider": "keycloak"
}
```

Para `authProvider = keycloak`, el backend resuelve el subject canónico desde
el IdP. El request no puede imponer `keycloakSubjectId`.

### Response 201

```json id="640fxd"
{
  "data": {
    "id": "user_uuid",
    "email": "tenant.admin.villa@example.com",
    "displayName": "Tenant Admin Villa",
    "firstName": "Tenant",
    "lastName": "Admin",
    "status": "pending",
    "userType": "human",
    "authProvider": "keycloak",
    "keycloakSubjectId": "kc_subject_uuid",
    "createdAt": "2026-07-13T10:00:00Z",
    "updatedAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="q31q5f"
user.created
```

### Eventos

```text id="vqvcxp"
UserProfileCreated
```

---

## 11.3. Consultar usuario por ID

### Endpoint

```http id="s8g3pd"
GET /api/v1/platform/users/{userId}
```

### Permiso

```text id="p6kfxe"
platform.users.read
```

### Response 200

```json id="epgksl"
{
  "data": {
    "id": "user_uuid",
    "email": "tenant.admin.villa@example.com",
    "displayName": "Tenant Admin Villa",
    "firstName": "Tenant",
    "lastName": "Admin",
    "status": "active",
    "userType": "human",
    "authProvider": "keycloak",
    "keycloakSubjectId": "kc_subject_uuid",
    "globalRoles": [],
    "memberships": [
      {
        "id": "membership_uuid",
        "tenantId": "tenant_uuid",
        "tenantSlug": "villa-club",
        "tenantName": "Villa Club",
        "status": "active",
        "roles": [
          {
            "id": "role_uuid",
            "code": "TenantAdmin",
            "name": "Tenant Admin"
          }
        ]
      }
    ],
    "createdAt": "2026-07-13T10:00:00Z",
    "updatedAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 11.4. Actualizar usuario

### Endpoint

```http id="r29t4s"
PATCH /api/v1/platform/users/{userId}
```

### Permiso

```text id="75p5l2"
platform.users.update
```

### Request body

```json id="2nmy5m"
{
  "displayName": "Tenant Admin Villa Actualizado",
  "firstName": "Tenant",
  "lastName": "Admin Actualizado"
}
```

### Campos no modificables por este endpoint

```text id="kxtif8"
id
email
status
userType
authProvider
keycloakSubjectId
createdAt
updatedAt
disabledAt
disabledBy
```

### Response 200

```json id="w4ap9m"
{
  "data": {
    "id": "user_uuid",
    "email": "tenant.admin.villa@example.com",
    "displayName": "Tenant Admin Villa Actualizado",
    "firstName": "Tenant",
    "lastName": "Admin Actualizado",
    "status": "active",
    "updatedAt": "2026-07-13T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="jadwnf"
user.updated
```

---

## 11.5. Desactivar usuario

### Endpoint

```http id="nxneg8"
POST /api/v1/platform/users/{userId}/disable
```

### Permiso

```text id="4x4to4"
platform.users.disable
```

### Request body

```json id="bvev2p"
{
  "reason": "Administrative disablement."
}
```

### Response 200

```json id="4l8zvw"
{
  "data": {
    "id": "user_uuid",
    "email": "tenant.admin.villa@example.com",
    "status": "disabled",
    "disabledAt": "2026-07-13T11:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="ef75et"
user.disabled
```

### Evento

```text id="zxeb5b"
UserProfileDisabled
```

---

## 11.6. Reactivar usuario

### Endpoint

```http id="k1hq0v"
POST /api/v1/platform/users/{userId}/enable
```

### Permiso

```text id="g9ssb6"
platform.users.enable
```

### Request body

```json id="tyifni"
{}
```

### Response 200

```json id="ra9vxg"
{
  "data": {
    "id": "user_uuid",
    "email": "tenant.admin.villa@example.com",
    "status": "active",
    "updatedAt": "2026-07-13T11:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="ly80m4"
user.enabled
```

### Evento

```text id="6v66y2"
UserProfileEnabled
```

---

# 12. Platform Roles and Permissions API

Ruta base:

```text id="47mtao"
/api/v1/platform
```

---

## 12.1. Listar roles

### Endpoint

```http id="squf75"
GET /api/v1/platform/roles
```

### Permiso

```text id="cdsniq"
platform.roles.read
```

### Query params

| Nombre     | Tipo   | Descripción                |
| ---------- | ------ | -------------------------- |
| `scope`    | string | `global` o `tenant`        |
| `tenantId` | string | Opcional para roles tenant |
| `search`   | string | Busca por name/code        |

### Response 200

```json id="4a2bq8"
{
  "data": [
    {
      "id": "role_uuid",
      "tenantId": null,
      "name": "Platform Admin",
      "code": "PlatformAdmin",
      "scope": "global",
      "description": "Platform administrator",
      "isSystem": true,
      "createdAt": "2026-07-13T10:00:00Z",
      "updatedAt": "2026-07-13T10:00:00Z"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.2. Listar permisos

### Endpoint

```http id="c5llf7"
GET /api/v1/platform/permissions
```

### Permiso

```text id="etqi7e"
platform.permissions.read
```

### Query params

| Nombre   | Tipo   | Descripción                 |
| -------- | ------ | --------------------------- |
| `module` | string | Filtrar por módulo          |
| `search` | string | Buscar por code/description |

### Response 200

```json id="sldjb8"
{
  "data": [
    {
      "id": "permission_uuid",
      "code": "users.invite",
      "module": "users",
      "action": "invite",
      "description": "Invite users to tenant",
      "isSystem": true
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 12.3. Asignar rol global a usuario

### Endpoint

```http id="ghtss3"
POST /api/v1/platform/users/{userId}/global-roles
```

### Permiso

```text id="tj5ujb"
platform.roles.assign
```

### Request body

```json id="he8sac"
{
  "roleId": "role_uuid"
}
```

### Reglas

* `roleId` debe existir.
* El rol debe tener `scope = global`.
* No se puede asignar rol tenant como global.
* No se debe duplicar asignación activa.
* Debe auditarse.

### Response 201

```json id="u55rry"
{
  "data": {
    "id": "user_global_role_uuid",
    "userId": "user_uuid",
    "role": {
      "id": "role_uuid",
      "code": "PlatformAdmin",
      "name": "Platform Admin",
      "scope": "global"
    },
    "assignedAt": "2026-07-13T11:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="fbtf2d"
globalRole.assigned
```

---

## 12.4. Remover rol global de usuario

### Endpoint

```http id="pq2824"
DELETE /api/v1/platform/users/{userId}/global-roles/{roleId}
```

### Permiso

```text id="lg8zox"
platform.roles.assign
```

### Response 200

```json id="9buw4l"
{
  "data": {
    "userId": "user_uuid",
    "roleId": "role_uuid",
    "removedAt": "2026-07-13T11:40:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="7u1i6x"
globalRole.removed
```

---

# 13. Tenant Users API

Ruta base:

```text id="wctqfv"
/api/v1/tenant
```

Requiere:

* autenticación;
* tenant activo;
* membership activa;
* permiso tenant-scoped.

---

## 13.1. Listar usuarios del tenant activo

### Endpoint

```http id="le41gm"
GET /api/v1/tenant/users
```

### Permiso

```text id="q60wzr"
users.read
```

### Query params

| Nombre             | Tipo   | Descripción                  |
| ------------------ | ------ | ---------------------------- |
| `page`             | number | Página                       |
| `pageSize`         | number | Tamaño                       |
| `membershipStatus` | string | Estado de membresía          |
| `roleCode`         | string | Rol dentro del tenant        |
| `search`           | string | Buscar por email/displayName |

### Response 200

```json id="7ez943"
{
  "data": [
    {
      "userId": "user_uuid",
      "membershipId": "membership_uuid",
      "email": "tenant.admin.villa@example.com",
      "displayName": "Tenant Admin Villa",
      "userStatus": "active",
      "membershipStatus": "active",
      "roles": [
        {
          "id": "role_uuid",
          "code": "TenantAdmin",
          "name": "Tenant Admin"
        }
      ],
      "joinedAt": "2026-07-13T10:00:00Z"
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

### Regla multitenant

Debe devolver únicamente usuarios del tenant activo.

---

## 13.2. Crear invitación

### Endpoint

```http id="yb86ry"
POST /api/v1/tenant/invitations
```

### Permiso

```text id="msawsl"
users.invite
```

### Request body

```json id="8fkwly"
{
  "email": "new.user@example.com",
  "roleId": "role_uuid",
  "message": "Bienvenido a RESIDENT.",
  "expiresInHours": 72
}
```

### Reglas

* El tenant activo debe estar `active`.
* `email` debe ser válido.
* `roleId` debe pertenecer al tenant activo.
* `roleId` no puede ser global.
* El actor debe poder asignar ese rol.
* El token se devuelve solo una vez o se envía por correo.
* El token no se almacena en claro.

### Response 201

```json id="spgvkp"
{
  "data": {
    "id": "invitation_uuid",
    "tenantId": "tenant_uuid",
    "email": "new.user@example.com",
    "role": {
      "id": "role_uuid",
      "code": "Resident",
      "name": "Resident"
    },
    "status": "pending",
    "expiresAt": "2026-07-16T10:00:00Z",
    "invitationUrl": "https://app.resident.example.com/invitations/token-value-visible-once"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Seguridad

`invitationUrl` o token original solo debe exponerse en el momento de creación si no existe envío de correo.

Nunca debe exponerse en listados posteriores.

### Auditoría

```text id="xwzyao"
invitation.created
```

### Evento

```text id="w5pv1o"
UserInvitedToTenant
```

---

## 13.3. Listar invitaciones del tenant

### Endpoint

```http id="vbr66x"
GET /api/v1/tenant/invitations
```

### Permiso

```text id="xxpb4p"
users.read
```

### Query params

| Nombre     | Tipo   | Descripción                                    |
| ---------- | ------ | ---------------------------------------------- |
| `status`   | string | pending, accepted, expired, revoked, cancelled |
| `email`    | string | filtro por email                               |
| `page`     | number | página                                         |
| `pageSize` | number | tamaño                                         |

### Response 200

```json id="xlqj3j"
{
  "data": [
    {
      "id": "invitation_uuid",
      "email": "new.user@example.com",
      "role": {
        "id": "role_uuid",
        "code": "Resident",
        "name": "Resident"
      },
      "status": "pending",
      "expiresAt": "2026-07-16T10:00:00Z",
      "createdAt": "2026-07-13T10:00:00Z"
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

### Seguridad

No devolver:

```text id="gcd4en"
tokenHash
token original
invitationUrl
```

---

## 13.4. Revocar invitación

### Endpoint

```http id="vvkcnh"
POST /api/v1/tenant/invitations/{invitationId}/revoke
```

### Permiso

```text id="81pym8"
users.invite
```

### Request body

```json id="5f0hxd"
{
  "reason": "Invitation sent to wrong email."
}
```

### Response 200

```json id="cjkynr"
{
  "data": {
    "id": "invitation_uuid",
    "status": "revoked",
    "revokedAt": "2026-07-13T11:50:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="uiwxpv"
invitation.revoked
```

### Evento

```text id="hfdn0r"
TenantInvitationRevoked
```

---

## 13.5. Asignar rol a membresía

### Endpoint

```http id="i0a682"
POST /api/v1/tenant/memberships/{membershipId}/roles
```

### Permiso

```text id="x7n2lq"
users.roles.assign
```

### Request body

```json id="ylkeja"
{
  "roleId": "role_uuid"
}
```

### Reglas

* La membresía debe pertenecer al tenant activo.
* El rol debe pertenecer al tenant activo.
* El rol debe tener `scope = tenant`.
* El actor debe poder asignar ese rol.
* No se debe duplicar asignación activa.
* Debe auditarse.

### Response 201

```json id="hmgzec"
{
  "data": {
    "membershipId": "membership_uuid",
    "role": {
      "id": "role_uuid",
      "code": "Treasurer",
      "name": "Treasurer"
    },
    "assignedAt": "2026-07-13T12:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="4fkoh1"
membership.roleAssigned
```

### Evento

```text id="ztll87"
UserTenantRoleAssigned
```

---

## 13.6. Remover rol de membresía

### Endpoint

```http id="xk8ipn"
DELETE /api/v1/tenant/memberships/{membershipId}/roles/{roleId}
```

### Permiso

```text id="20b2ih"
users.roles.remove
```

### Reglas

* La membresía debe pertenecer al tenant activo.
* El rol debe pertenecer al tenant activo.
* No debe dejar al tenant sin TenantAdmin si esa regla está activa.
* Debe auditarse.

### Response 200

```json id="jhhrxe"
{
  "data": {
    "membershipId": "membership_uuid",
    "roleId": "role_uuid",
    "removedAt": "2026-07-13T12:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="iqi9s1"
membership.roleRemoved
```

### Evento

```text id="965mto"
UserTenantRoleRemoved
```

---

## 13.7. Revocar membresía

### Endpoint

```http id="4y56k3"
POST /api/v1/tenant/memberships/{membershipId}/revoke
```

### Permiso

```text id="9o76wc"
users.membership.revoke
```

### Request body

```json id="fx7pwo"
{
  "reason": "User no longer belongs to this tenant."
}
```

### Response 200

```json id="0la1s5"
{
  "data": {
    "membershipId": "membership_uuid",
    "status": "revoked",
    "revokedAt": "2026-07-13T12:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="l05rga"
membership.revoked
```

### Evento

```text id="10l4my"
UserTenantMembershipRevoked
```

---

# 14. Current User API

Ruta base:

```text id="llb5oo"
/api/v1/me
```

Requiere autenticación.

---

## 14.1. Consultar usuario actual

### Endpoint

```http id="ym0gyy"
GET /api/v1/me
```

### Response 200

```json id="g3nmpz"
{
  "data": {
    "id": "user_uuid",
    "email": "tenant.admin.villa@example.com",
    "displayName": "Tenant Admin Villa",
    "firstName": "Tenant",
    "lastName": "Admin",
    "status": "active",
    "userType": "human",
    "authProvider": "keycloak"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 14.2. Consultar mis tenants

### Endpoint

```http id="x72ppe"
GET /api/v1/me/tenants
```

### Response 200

```json id="s1458u"
{
  "data": [
    {
      "tenantId": "tenant_uuid",
      "slug": "villa-club",
      "name": "Villa Club",
      "status": "active",
      "membershipStatus": "active",
      "roles": [
        {
          "code": "TenantAdmin",
          "name": "Tenant Admin"
        }
      ]
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* No devolver tenants donde la membership esté revocada.
* Puede devolver suspended con indicador, pero no habilitar operación ordinaria.

---

## 14.3. Consultar mis permisos efectivos

### Endpoint

```http id="g9w57f"
GET /api/v1/me/permissions
```

### Header requerido

| Nombre        | Tipo | Requerido |
| --- | --- | ---: |
| `X-Tenant-Id` | UUID | Sí |

### Response 200

```json id="676b0h"
{
  "data": {
    "userId": "user_uuid",
    "tenantId": "tenant_uuid",
    "scope": "tenant",
    "roles": [
      "TenantAdmin"
    ],
    "permissions": [
      "tenants.profile.read",
      "tenants.profile.update",
      "users.invite",
      "users.read",
      "users.roles.assign",
      "users.roles.remove"
    ]
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

No devolver permisos operativos si:

* usuario está `disabled`;
* tenant está `suspended`;
* tenant está `archived`;
* membership no está `active`.

---

## 14.4. Selección local de tenant

No existe endpoint de cambio de tenant. El cliente obtiene las memberships mediante
`GET /api/v1/me/tenants`, conserva localmente la selección y envía `X-Tenant-Id` en la
siguiente solicitud tenant-scoped. Core no persiste esa selección ni emite un tenant
token; revalida tenant y membership en cada solicitud.

`X-Tenant-Id` no está permitido en query o body como fuente de contexto. Los errores
canónicos son `TENANT_CONTEXT_REQUIRED` (400), `TENANT_CONTEXT_INVALID` (400),
`TENANT_ACCESS_DENIED` (403) y `TENANT_CONTEXT_CONFLICT` (422).

---

# 15. Invitations API

Ruta base:

```text id="mr9m1p"
/api/v1/invitations
```

Estos endpoints validan token de invitación.

---

## 15.1. Consultar invitación por token

### Endpoint

```http id="0n1976"
GET /api/v1/invitations/{token}
```

### Autenticación

No requerida inicialmente.

### Response 200

```json id="kw0lsk"
{
  "data": {
    "email": "new.user@example.com",
    "tenant": {
      "slug": "villa-club",
      "displayName": "Villa Club"
    },
    "role": {
      "code": "Resident",
      "name": "Resident"
    },
    "status": "pending",
    "expiresAt": "2026-07-16T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Seguridad

No devolver:

```text id="ru59tv"
invitationId
tokenHash
tenantId interno
roleId interno
invitedBy
acceptedBy
```

---

## 15.2. Aceptar invitación

### Endpoint

```http id="z3anx2"
POST /api/v1/invitations/{token}/accept
```

### Autenticación

El token de invitación no sustituye autenticación. Cuando Keycloak está activo,
el backend obtiene el subject desde el token OIDC validado; el body nunca lo
impone. El flujo exacto de redirección y sesión se cierra en `GAP-S2-005`.

### Request body

```json id="h96y1c"
{
  "displayName": "Nuevo Usuario",
  "firstName": "Nuevo",
  "lastName": "Usuario"
}
```

### Response 200

```json id="xwyu8z"
{
  "data": {
    "userId": "user_uuid",
    "membershipId": "membership_uuid",
    "tenantId": "tenant_uuid",
    "tenantSlug": "villa-club",
    "membershipStatus": "active",
    "roles": [
      {
        "code": "Resident",
        "name": "Resident"
      }
    ],
    "acceptedAt": "2026-07-13T12:30:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="4x7j5b"
invitation.accepted
membership.created
membership.roleAssigned
```

### Eventos

```text id="9m7hzh"
TenantInvitationAccepted
UserTenantMembershipCreated
UserTenantRoleAssigned
```

---

# 16. DTOs principales

## 16.1. UserProfileResponseDto

```json id="6nokgs"
{
  "id": "user_uuid",
  "email": "user@example.com",
  "displayName": "User Name",
  "firstName": "User",
  "lastName": "Name",
  "status": "active",
  "userType": "human",
  "authProvider": "keycloak",
  "createdAt": "2026-07-13T10:00:00Z",
  "updatedAt": "2026-07-13T10:00:00Z"
}
```

---

## 16.2. TenantUserResponseDto

```json id="28jr4y"
{
  "userId": "user_uuid",
  "membershipId": "membership_uuid",
  "email": "user@example.com",
  "displayName": "User Name",
  "userStatus": "active",
  "membershipStatus": "active",
  "roles": [
    {
      "id": "role_uuid",
      "code": "TenantAdmin",
      "name": "Tenant Admin"
    }
  ],
  "joinedAt": "2026-07-13T10:00:00Z"
}
```

---

## 16.3. RoleResponseDto

```json id="l02mjn"
{
  "id": "role_uuid",
  "tenantId": "tenant_uuid",
  "name": "Tenant Admin",
  "code": "TenantAdmin",
  "scope": "tenant",
  "description": "Tenant administrator",
  "isSystem": true
}
```

---

## 16.4. PermissionResponseDto

```json id="z5gvxd"
{
  "id": "permission_uuid",
  "code": "users.invite",
  "module": "users",
  "action": "invite",
  "description": "Invite users to tenant",
  "isSystem": true
}
```

---

## 16.5. InvitationResponseDto

```json id="mrebqe"
{
  "id": "invitation_uuid",
  "email": "new.user@example.com",
  "role": {
    "id": "role_uuid",
    "code": "Resident",
    "name": "Resident"
  },
  "status": "pending",
  "expiresAt": "2026-07-16T10:00:00Z",
  "createdAt": "2026-07-13T10:00:00Z"
}
```

---

## 16.6. EffectivePermissionsResponseDto

```json id="fdhh1b"
{
  "userId": "user_uuid",
  "tenantId": "tenant_uuid",
  "scope": "tenant",
  "roles": [
    "TenantAdmin"
  ],
  "permissions": [
    "users.invite",
    "users.read",
    "users.roles.assign"
  ]
}
```

---

# 17. Validaciones generales

## 17.1. Email

Reglas:

```text id="v7mah7"
required
valid email format
lowercase
trim
unique in user_profiles
```

---

## 17.2. Permission code

Regex sugerida:

```text id="sp267r"
^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$
```

Ejemplos válidos:

```text id="79cwfr"
users.invite
payments.confirm
accountStatements.read.own
```

---

## 17.3. Invitation token

Reglas:

* requerido en endpoints de invitación;
* comparar contra hash;
* no loggear;
* no devolver en respuestas;
* no reutilizar.

---

## 17.4. Role assignment

Reglas:

* role global solo en `user_global_roles`;
* role tenant solo en `membership_roles`;
* role tenant debe pertenecer al mismo tenant de la membership;
* no duplicar asignación;
* auditar.

---

## 18. Catálogo de errores

| Código                            | HTTP | Descripción                    |
| --------------------------------- | ---: | ------------------------------ |
| `UNAUTHORIZED`                    |  401 | No autenticado                 |
| `AUTHENTICATION_REQUIRED`         |  401 | Bearer ausente                 |
| `INVALID_ACCESS_TOKEN`            |  401 | Access token inválido          |
| `IDENTITY_PROVIDER_UNAVAILABLE`   |  503 | IdP/JWKS no disponible         |
| `IDENTITY_NOT_PROVISIONED`        |  403 | Subject sin perfil local       |
| `FORBIDDEN`                       |  403 | Sin permiso                    |
| `VALIDATION_ERROR`                |  422 | Error de validación            |
| `USER_PROFILE_NOT_FOUND`          |  404 | Usuario no encontrado          |
| `USER_EMAIL_ALREADY_EXISTS`       |  409 | Email duplicado                |
| `KEYCLOAK_SUBJECT_ALREADY_LINKED` |  409 | Subject Keycloak duplicado     |
| `USER_DISABLED`                   |  403 | Usuario desactivado            |
| `ROLE_NOT_FOUND`                  |  404 | Rol no encontrado              |
| `PERMISSION_NOT_FOUND`            |  404 | Permiso no encontrado          |
| `ROLE_ASSIGNMENT_NOT_ALLOWED`     |  403 | Asignación de rol no permitida |
| `ROLE_ALREADY_ASSIGNED`           |  409 | Rol ya asignado                |
| `MEMBERSHIP_NOT_FOUND`            |  404 | Membresía no encontrada        |
| `MEMBERSHIP_NOT_ACTIVE`           |  403 | Membresía no activa            |
| `MEMBERSHIP_ALREADY_EXISTS`       |  409 | Membresía ya existe            |
| `INVITATION_NOT_FOUND`            |  404 | Invitación no encontrada       |
| `INVITATION_EXPIRED`              |  409 | Invitación expirada            |
| `INVITATION_ALREADY_USED`         |  409 | Invitación ya usada            |
| `INVITATION_REVOKED`              |  409 | Invitación revocada            |
| `TENANT_NOT_FOUND`                |  404 | Tenant no encontrado           |
| `TENANT_NOT_ACTIVE`               |  403 | Tenant no activo               |
| `RATE_LIMITED`                    |  429 | Límite excedido                |
| `INTERNAL_ERROR`                  |  500 | Error interno                  |

---

## 19. Ejemplos de errores

### 19.1. Usuario duplicado

```json id="1tgmlu"
{
  "error": {
    "code": "USER_EMAIL_ALREADY_EXISTS",
    "message": "A user with this email already exists.",
    "details": {
      "email": "user@example.com"
    },
    "traceId": "req_123456"
  }
}
```

---

### 19.2. Sin permiso

```json id="m2ws51"
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

### 19.3. Invitación expirada

```json id="cnjlm2"
{
  "error": {
    "code": "INVITATION_EXPIRED",
    "message": "The invitation is expired.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

## 20. Auditoría por endpoint

| Endpoint                                                   | Auditoría                                                              |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `POST /platform/users`                                     | `user.created`                                                         |
| `PATCH /platform/users/{userId}`                           | `user.updated`                                                         |
| `POST /platform/users/{userId}/disable`                    | `user.disabled`                                                        |
| `POST /platform/users/{userId}/enable`                     | `user.enabled`                                                         |
| `POST /platform/users/{userId}/global-roles`               | `globalRole.assigned`                                                  |
| `DELETE /platform/users/{userId}/global-roles/{roleId}`    | `globalRole.removed`                                                   |
| `POST /tenant/invitations`                                 | `invitation.created`                                                   |
| `POST /tenant/invitations/{invitationId}/revoke`           | `invitation.revoked`                                                   |
| `POST /tenant/memberships/{membershipId}/roles`            | `membership.roleAssigned`                                              |
| `DELETE /tenant/memberships/{membershipId}/roles/{roleId}` | `membership.roleRemoved`                                               |
| `POST /tenant/memberships/{membershipId}/revoke`           | `membership.revoked`                                                   |
| `POST /invitations/{token}/accept`                         | `invitation.accepted`, `membership.created`, `membership.roleAssigned` |
| `GET /me/permissions`                                      | `permissions.effectiveRead`, opcional                                  |

---

## 21. Eventos por endpoint

| Endpoint                                                   | Evento                                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `POST /platform/users`                                     | `UserProfileCreated`                                                                |
| `POST /platform/users/{userId}/disable`                    | `UserProfileDisabled`                                                               |
| `POST /platform/users/{userId}/enable`                     | `UserProfileEnabled`                                                                |
| `POST /tenant/invitations`                                 | `UserInvitedToTenant`                                                               |
| `POST /tenant/invitations/{invitationId}/revoke`           | `TenantInvitationRevoked`                                                           |
| `POST /tenant/memberships/{membershipId}/roles`            | `UserTenantRoleAssigned`                                                            |
| `DELETE /tenant/memberships/{membershipId}/roles/{roleId}` | `UserTenantRoleRemoved`                                                             |
| `POST /tenant/memberships/{membershipId}/revoke`           | `UserTenantMembershipRevoked`                                                       |
| `POST /invitations/{token}/accept`                         | `TenantInvitationAccepted`, `UserTenantMembershipCreated`, `UserTenantRoleAssigned` |

---

## 22. Observabilidad

Todos los endpoints deben registrar:

```text id="1b2it9"
traceId
method
path
status
latencyMs
actorUserId si aplica
targetUserId si aplica
tenantId si aplica
errorCode si aplica
```

No registrar:

```text id="nbxdx6"
Authorization header
access token
refresh token
invitation token
tokenHash
cookies completas
client secrets
payload completo innecesario
```

Métricas sugeridas:

```text id="s4wr13"
users_created_total
users_disabled_total
tenant_invitations_created_total
tenant_invitations_accepted_total
tenant_invitations_revoked_total
tenant_memberships_created_total
tenant_memberships_revoked_total
tenant_roles_assigned_total
tenant_roles_removed_total
authorization_denied_total
effective_permissions_requests_total
```

---

## 23. Rate limiting

Rate limiting recomendado para:

```text id="v2z33v"
POST /api/v1/tenant/invitations
GET  /api/v1/invitations/{token}
POST /api/v1/invitations/{token}/accept
```

Objetivo:

* evitar abuso de invitaciones;
* reducir ataques por token guessing;
* reducir enumeración;
* proteger operaciones de contexto.

---

## 24. CORS

### 24.1. Endpoints privados

No permitir CORS abierto en producción.

Prohibido:

```text id="ci67g0"
Access-Control-Allow-Origin: *
```

para endpoints autenticados.

Los orígenes privados autorizados deben permitir explícitamente `Authorization`,
`Content-Type` y `X-Tenant-Id`; no se habilitan headers mediante wildcard en
producción.

---

### 24.2. Endpoints de invitación

Permitir solo frontend oficial de RESIDENT Core.

Ejemplo futuro:

```text id="7c0xnh"
https://app.resident.example.com
```

---

## 25. Contrato Keycloak

El contrato autoritativo es
`docs/changes/GAP-S2-005-KEYCLOAK-OPERATING-CONTRACT-2026-08-12.md`.

Flujo de acceso protegido:

1. Admin/Resident Web autentica mediante Authorization Code + PKCE S256.
2. El frontend envía exclusivamente el access token como Bearer.
3. La API valida JWT RS256 contra el JWKS configurado.
4. Exige issuer exacto, `aud` con `resident-api`, `azp` frontend aprobado,
   `typ=Bearer`, tiempos válidos, `sub` y email verificado.
5. Busca `UserProfile.keycloakSubjectId = sub` y exige estado local activo.
6. Evalúa membership, tenant, roles, permisos y recurso en Core.

Claims obligatorios:

```text id="sw7lgd"
iss aud sub exp iat azp typ email email_verified
```

Claims informativos permitidos: `preferred_username`, `name`, `given_name` y
`family_name`. Claims de roles, email o nombres no conceden permisos ni actualizan
automáticamente el perfil local.

Errores adicionales:

| Condición | HTTP | Código |
| --- | --- | --- |
| Bearer ausente | 401 | `AUTHENTICATION_REQUIRED` |
| Token inválido o claims OIDC incorrectos | 401 | `INVALID_ACCESS_TOKEN` |
| JWKS no disponible sin cache válido | 503 | `IDENTITY_PROVIDER_UNAVAILABLE` |
| Subject válido sin perfil local | 403 | `IDENTITY_NOT_PROVISIONED` |
| Perfil local inactivo | 403 | `USER_DISABLED` |

Las respuestas no distinguen internamente firma, issuer, audience, `kid` o existencia
de identidad. Logs y auditoría nunca incluyen tokens o claims completos.

---

## 26. Compatibilidad con `001-tenants`

Este contrato exige que `001-tenants` no use placeholder para roles base.

Puntos de integración:

```text id="7o7zot"
ProvisionInitialTenantAccessUseCase
TenantBaseRolesPort
TenantGuard con memberships reales
validación de TenantAdmin inicial
```

`POST /api/v1/platform/tenants` recibe únicamente `initialAdmin.email`. El
backend resuelve la identidad Keycloak y Spec 002 crea/enlaza UserProfile, roles,
membership activa y TenantAdmin dentro de la transacción abierta por Spec 001.

El primer `PlatformAdmin` no tiene endpoint. Se crea mediante el comando
operativo one-shot definido en
`docs/changes/GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md`.

---

## 27. Compatibilidad futura con n8n

n8n podrá usar service accounts futuras.

En esta spec:

* no se implementa ciclo completo de service accounts;
* se reserva `userType = serviceAccount`;
* se prepara autorización por permisos;
* se exige auditoría futura.

---

## 28. OpenAPI

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
* tenant scope.

Tags sugeridos:

```text id="4ib1ko"
Platform Users
Platform Roles
Tenant Users
Current User
Invitations
```

---

## 29. Extensiones OpenAPI sugeridas

Para permisos:

```yaml id="djmuvs"
x-required-permission: users.invite
x-audit-event: invitation.created
x-tenant-scope: tenant
```

Para invitaciones públicas:

```yaml id="sys4c5"
x-public-token-endpoint: true
x-rate-limit: true
```

---

## 30. Pruebas de contrato requeridas

### 30.1. Platform Users API

Probar:

* listar usuarios;
* crear usuario;
* usuario duplicado;
* consultar usuario;
* actualizar usuario;
* desactivar;
* reactivar;
* permisos globales.

---

### 30.2. Platform Roles API

Probar:

* listar roles;
* listar permisos;
* asignar rol global;
* rechazar rol tenant como global;
* remover rol global.

---

### 30.3. Tenant Users API

Probar:

* listar usuarios del tenant;
* invitar usuario;
* listar invitaciones;
* revocar invitación;
* asignar rol;
* remover rol;
* revocar membership;
* impedir operar tenant ajeno.

---

### 30.4. Current User API

Probar:

* `/me`;
* `/me/tenants`;
* `/me/permissions`;
* resolución request-scoped mediante `X-Tenant-Id`;
* usuario sin membership;
* tenant suspendido;
* usuario disabled.

---

### 30.5. Invitations API

Probar:

* token válido;
* token inválido;
* token expirado;
* token revocado;
* token ya aceptado;
* aceptación exitosa;
* no exposición de tokenHash.

---

## 31. Matriz resumen de endpoints

| Método | Ruta                                                       |                 Auth | Permiso                     | Auditoría                 |
| ------ | ---------------------------------------------------------- | -------------------: | --------------------------- | ------------------------- |
| GET    | `/api/v1/platform/users`                                   |                   Sí | `platform.users.read`       | No obligatoria            |
| POST   | `/api/v1/platform/users`                                   |                   Sí | `platform.users.create`     | `user.created`            |
| GET    | `/api/v1/platform/users/{userId}`                          |                   Sí | `platform.users.read`       | No obligatoria            |
| PATCH  | `/api/v1/platform/users/{userId}`                          |                   Sí | `platform.users.update`     | `user.updated`            |
| POST   | `/api/v1/platform/users/{userId}/disable`                  |                   Sí | `platform.users.disable`    | `user.disabled`           |
| POST   | `/api/v1/platform/users/{userId}/enable`                   |                   Sí | `platform.users.enable`     | `user.enabled`            |
| GET    | `/api/v1/platform/roles`                                   |                   Sí | `platform.roles.read`       | No obligatoria            |
| GET    | `/api/v1/platform/permissions`                             |                   Sí | `platform.permissions.read` | No obligatoria            |
| POST   | `/api/v1/platform/users/{userId}/global-roles`             |                   Sí | `platform.roles.assign`     | `globalRole.assigned`     |
| DELETE | `/api/v1/platform/users/{userId}/global-roles/{roleId}`    |                   Sí | `platform.roles.assign`     | `globalRole.removed`      |
| GET    | `/api/v1/tenant/users`                                     |                   Sí | `users.read`                | No obligatoria            |
| POST   | `/api/v1/tenant/invitations`                               |                   Sí | `users.invite`              | `invitation.created`      |
| GET    | `/api/v1/tenant/invitations`                               |                   Sí | `users.read`                | No obligatoria            |
| POST   | `/api/v1/tenant/invitations/{invitationId}/revoke`         |                   Sí | `users.invite`              | `invitation.revoked`      |
| POST   | `/api/v1/tenant/memberships/{membershipId}/roles`          |                   Sí | `users.roles.assign`        | `membership.roleAssigned` |
| DELETE | `/api/v1/tenant/memberships/{membershipId}/roles/{roleId}` |                   Sí | `users.roles.remove`        | `membership.roleRemoved`  |
| POST   | `/api/v1/tenant/memberships/{membershipId}/revoke`         |                   Sí | `users.membership.revoke`   | `membership.revoked`      |
| GET    | `/api/v1/me`                                               |                   Sí | Authenticated               | No obligatoria            |
| GET    | `/api/v1/me/tenants`                                       |                   Sí | Authenticated               | No obligatoria            |
| GET    | `/api/v1/me/permissions`                                   |                   Sí | Authenticated + `X-Tenant-Id` validado | opcional       |
| GET    | `/api/v1/invitations/{token}`                              |  No/session optional | Token válido                | No obligatoria            |
| POST   | `/api/v1/invitations/{token}/accept`                       | Opcional según flujo | Token válido                | `invitation.accepted`     |

---

## 32. Casos borde del contrato

| Caso                                            | Resultado                |
| ----------------------------------------------- | ------------------------ |
| Crear usuario con email duplicado               | 409                      |
| Crear usuario con email inválido                | 422                      |
| Crear usuario con keycloakSubjectId duplicado   | 409                      |
| Usuario disabled intenta operar                 | 403                      |
| TenantAdmin intenta endpoint platform           | 403                      |
| TenantAdmin asigna rol global                   | 403                      |
| TenantAdmin asigna role de otro tenant          | 403/422                  |
| Usuario sin membership consulta `/tenant/users` | 403                      |
| Usuario de Tenant A lista usuarios de Tenant B  | 403/404                  |
| Invitación con token inválido                   | 404                      |
| Invitación expirada                             | 409                      |
| Invitación revocada                             | 409                      |
| Invitación ya aceptada                          | 409                      |
| Invitación intenta usar role global             | 422/403                  |
| Aceptación genera membership duplicada          | 409                      |
| `X-Tenant-Id` sin membership                    | 403                      |
| Consultar permisos con tenant suspendido        | 403 o permisos limitados |
| Token válido sin UserProfile local              | 403 `IDENTITY_NOT_PROVISIONED` |

---

## 33. Decisión final del contrato API

El módulo `002-users-roles` expondrá cinco grupos de endpoints:

```text id="2qxzct"
Platform Users API
Platform Roles and Permissions API
Tenant Users API
Current User API
Invitations API
```

Los endpoints de plataforma administran usuarios y roles globales.

Los endpoints de tenant administran usuarios, invitaciones, membresías y roles dentro del tenant activo.

Los endpoints de usuario actual permiten consultar contexto, tenants disponibles y permisos efectivos.

Los endpoints de invitación permiten validar y aceptar invitaciones de forma segura.

La autorización se evaluará siempre en RESIDENT Core y no dependerá únicamente de Keycloak ni del frontend.

Este contrato habilita la implementación real de guards, permisos, membresías y roles base para los módulos posteriores de RESIDENT Core.
