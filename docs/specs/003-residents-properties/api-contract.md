# API Contract — Spec 003 Residents, Owners, Tenants and Property Units

## 1. Información del documento

| Campo           | Valor                                                 |
| --------------- | ----------------------------------------------------- |
| Proyecto        | RESIDENT Core                                         |
| Spec ID         | 003                                                   |
| Módulo          | Residents and Properties                              |
| Documento       | API Contract                                          |
| Ruta            | `docs/specs/003-residents-properties/api-contract.md` |
| Versión         | 0.1                                                   |
| Estado          | Borrador inicial                                      |
| Fecha           | 2026-07-13                                            |
| Documento base  | `docs/specs/003-residents-properties/spec.md`         |
| Plan técnico    | `docs/specs/003-residents-properties/plan.md`         |
| Modelo de datos | `docs/specs/003-residents-properties/data-model.md`   |
| API Style       | REST                                                  |
| API Version     | `/api/v1`                                             |
| Formato         | JSON                                                  |
| Autorización    | Tenant-aware RBAC + permissions + `.own` policies     |
| Depende de      | `001-tenants`, `002-users-roles`                      |

---

## 2. Propósito

Este documento define el contrato API del módulo `003-residents-properties`.

El objetivo es establecer:

* endpoints;
* métodos HTTP;
* permisos requeridos;
* requests;
* responses;
* errores;
* status codes;
* paginación;
* filtros;
* ordenamiento;
* reglas de acceso administrativo;
* reglas de acceso `.own`;
* auditoría;
* eventos;
* observabilidad;
* seguridad;
* compatibilidad OpenAPI.

Este contrato será base para:

* controladores NestJS;
* DTOs;
* guards;
* policies;
* OpenAPI;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas de seguridad;
* módulos financieros posteriores.

---

## 3. Principios del contrato API

### 3.1. Tenant como frontera

Todo endpoint administrativo opera dentro del tenant activo.

Regla:

```text id="i0q1r9"
Un endpoint /api/v1/tenant/* nunca debe devolver ni modificar recursos de otro tenant.
```

---

### 3.2. Acceso administrativo y acceso propio

El módulo expone dos tipos de acceso:

```text id="9s8xwb"
1. Acceso administrativo tenant-scoped: /api/v1/tenant/*
2. Acceso propio del usuario actual: /api/v1/me/*
```

El acceso administrativo requiere permisos como:

```text id="6ohzoy"
propertyUnits.read
persons.create
residencies.update
```

El acceso propio requiere permisos `.own` como:

```text id="h1ga0n"
propertyUnits.read.own
persons.read.own
vehicles.read.own
```

---

### 3.3. Autorización backend obligatoria

El frontend puede ocultar o mostrar opciones, pero el backend siempre debe validar:

```text id="tw42j0"
1. Token válido.
2. UserProfile activo.
3. Tenant activo.
4. Membership activa.
5. Permiso requerido.
6. Recurso pertenece al tenant.
7. Relación .own cuando aplique.
```

---

### 3.4. Formato JSON

Los requests y responses usan `camelCase`.

Ejemplo:

```json id="hbr28q"
{
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "startDate": "2026-07-13"
}
```

---

## 4. Respuesta estándar

### 4.1. Respuesta individual

```json id="sx3q67"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 4.2. Respuesta paginada

```json id="6gx76t"
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

### 4.3. Error estándar

```json id="81vjc6"
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

## 5. Headers generales

### 5.1. Request headers

| Header             |        Requerido | Descripción        |
| ------------------ | ---------------: | ------------------ |
| `Authorization`    |               Sí | Bearer token       |
| `Content-Type`     | Sí en POST/PATCH | `application/json` |
| `Accept`           |      Recomendado | `application/json` |
| `X-Request-Id`     |         Opcional | ID de request      |
| `X-Correlation-Id` |         Opcional | ID de correlación  |

---

### 5.2. Response headers

| Header             | Descripción                 |
| ------------------ | --------------------------- |
| `Content-Type`     | `application/json`          |
| `X-Request-Id`     | ID de request               |
| `X-Correlation-Id` | ID de correlación si aplica |

---

## 6. Estados HTTP

| Código | Uso                              |
| -----: | -------------------------------- |
|    200 | Consulta o actualización exitosa |
|    201 | Recurso creado                   |
|    204 | Operación exitosa sin body       |
|    400 | Request mal formado              |
|    401 | No autenticado                   |
|    403 | Sin permiso o acceso prohibido   |
|    404 | Recurso no encontrado            |
|    409 | Conflicto de estado o duplicidad |
|    422 | Validación semántica fallida     |
|    429 | Rate limit                       |
|    500 | Error interno                    |

---

## 7. Paginación

Listados usan:

| Query param |   Tipo | Default | Máximo |
| ----------- | -----: | ------: | -----: |
| `page`      | number |       1 |      — |
| `pageSize`  | number |      20 |    100 |

Ejemplo:

```text id="l4nk0a"
GET /api/v1/tenant/property-units?page=1&pageSize=20
```

---

## 8. Ordenamiento

Parámetros:

| Query param | Tipo   | Default     |
| ----------- | ------ | ----------- |
| `sortBy`    | string | `createdAt` |
| `sortOrder` | string | `desc`      |

Valores permitidos para `sortOrder`:

```text id="2dzlym"
asc
desc
```

Campos permitidos según recurso:

```text id="ltqc64"
createdAt
updatedAt
displayName
code
name
status
startDate
```

No permitir ordenamiento por campos arbitrarios.

---

# 9. Property Units API

Ruta base:

```text id="dfi388"
/api/v1/tenant/property-units
```

Requiere:

```text id="4rbbdr"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 9.1. Listar unidades

### Endpoint

```http id="m7w9kx"
GET /api/v1/tenant/property-units
```

### Permiso

```text id="k5yqx5"
propertyUnits.read
```

### Query params

| Nombre      | Tipo   | Descripción                                                              |
| ----------- | ------ | ------------------------------------------------------------------------ |
| `page`      | number | Página                                                                   |
| `pageSize`  | number | Tamaño                                                                   |
| `status`    | string | active, inactive, underMaintenance, blocked, archived                    |
| `type`      | string | house, apartment, suite, lot, parking, storage, commercial, mixed, other |
| `block`     | string | Bloque/manzana/torre                                                     |
| `search`    | string | Busca por code, name, addressReference                                   |
| `sortBy`    | string | Campo permitido                                                          |
| `sortOrder` | string | asc/desc                                                                 |

### Response 200

```json id="0c6kpb"
{
  "data": [
    {
      "id": "property_unit_uuid",
      "tenantId": "tenant_uuid",
      "code": "Casa 01",
      "name": "Casa 01",
      "type": "house",
      "block": "A",
      "floor": null,
      "addressReference": "Ingreso principal",
      "areaM2": "120.50",
      "status": "active",
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

### Regla multitenant

Solo devuelve unidades del tenant activo.

---

## 9.2. Crear unidad

### Endpoint

```http id="2q6gol"
POST /api/v1/tenant/property-units
```

### Permiso

```text id="k2rfhj"
propertyUnits.create
```

### Request body

```json id="3e8uyd"
{
  "code": "Casa 01",
  "name": "Casa 01",
  "type": "house",
  "block": "A",
  "floor": null,
  "addressReference": "Ingreso principal",
  "areaM2": "120.50"
}
```

### Response 201

```json id="rnbe2a"
{
  "data": {
    "id": "property_unit_uuid",
    "tenantId": "tenant_uuid",
    "code": "Casa 01",
    "name": "Casa 01",
    "type": "house",
    "block": "A",
    "floor": null,
    "addressReference": "Ingreso principal",
    "areaM2": "120.50",
    "status": "active",
    "createdAt": "2026-07-13T10:00:00Z",
    "updatedAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="asrb5b"
propertyUnit.created
```

### Evento

```text id="1i6jtq"
PropertyUnitCreated
```

---

## 9.3. Consultar unidad por ID

### Endpoint

```http id="ctqbxg"
GET /api/v1/tenant/property-units/{propertyUnitId}
```

### Permiso

```text id="vzry5k"
propertyUnits.read
```

### Response 200

```json id="xxo1md"
{
  "data": {
    "id": "property_unit_uuid",
    "tenantId": "tenant_uuid",
    "code": "Casa 01",
    "name": "Casa 01",
    "type": "house",
    "block": "A",
    "floor": null,
    "addressReference": "Ingreso principal",
    "areaM2": "120.50",
    "status": "active",
    "owners": [
      {
        "ownershipId": "ownership_uuid",
        "personId": "person_uuid",
        "displayName": "Propietario Demo",
        "ownershipPercentage": "100.00",
        "isPrimary": true,
        "status": "active"
      }
    ],
    "residents": [
      {
        "residencyId": "residency_uuid",
        "personId": "person_uuid",
        "displayName": "Residente Demo",
        "residencyType": "ownerResident",
        "isPrimaryResident": true,
        "status": "active"
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

## 9.4. Actualizar unidad

### Endpoint

```http id="fcp8zh"
PATCH /api/v1/tenant/property-units/{propertyUnitId}
```

### Permiso

```text id="3xtgyr"
propertyUnits.update
```

### Request body

```json id="6ugcnq"
{
  "name": "Casa 01 Actualizada",
  "block": "A",
  "floor": null,
  "addressReference": "Frente al parque infantil",
  "areaM2": "125.00",
  "status": "active"
}
```

### Campos restringidos

No modificar por este endpoint:

```text id="5z2e5g"
id
tenantId
createdAt
archivedAt
```

### Response 200

```json id="x8bhr6"
{
  "data": {
    "id": "property_unit_uuid",
    "code": "Casa 01",
    "name": "Casa 01 Actualizada",
    "status": "active",
    "updatedAt": "2026-07-13T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="wmo8v1"
propertyUnit.updated
```

---

## 9.5. Archivar unidad

### Endpoint

```http id="8m7x3z"
POST /api/v1/tenant/property-units/{propertyUnitId}/archive
```

### Permiso

```text id="r8s2mn"
propertyUnits.archive
```

### Request body

```json id="ww74jj"
{
  "reason": "Unidad inactiva históricamente."
}
```

### Response 200

```json id="tmtjzd"
{
  "data": {
    "id": "property_unit_uuid",
    "status": "archived",
    "archivedAt": "2026-07-13T11:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

No ejecutar eliminación física.

### Auditoría

```text id="nd0ic8"
propertyUnit.archived
```

---

# 10. Persons API

Ruta base:

```text id="4ednla"
/api/v1/tenant/persons
```

---

## 10.1. Listar personas

### Endpoint

```http id="n97b7b"
GET /api/v1/tenant/persons
```

### Permiso

```text id="o2esx4"
persons.read
```

### Query params

| Nombre               | Tipo   | Descripción                                                   |
| -------------------- | ------ | ------------------------------------------------------------- |
| `page`               | number | Página                                                        |
| `pageSize`           | number | Tamaño                                                        |
| `status`             | string | active, inactive, archived                                    |
| `identificationType` | string | cedula, ruc, passport, other, none                            |
| `search`             | string | displayName, firstName, lastName, email, identificationNumber |

### Response 200

```json id="i4451s"
{
  "data": [
    {
      "id": "person_uuid",
      "tenantId": "tenant_uuid",
      "userProfileId": "user_uuid",
      "displayName": "Propietario Demo",
      "firstName": "Propietario",
      "lastName": "Demo",
      "identificationType": "cedula",
      "identificationNumber": "masked-or-partial",
      "email": "owner.villa.01@example.com",
      "phone": null,
      "whatsapp": null,
      "status": "active",
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

### Seguridad

La exposición de `identificationNumber` debe ser limitada o enmascarada según permiso.

---

## 10.2. Crear persona

### Endpoint

```http id="d6in6u"
POST /api/v1/tenant/persons
```

### Permiso

```text id="c6rpqu"
persons.create
```

### Request body

```json id="ouyzb0"
{
  "firstName": "Propietario",
  "lastName": "Demo",
  "displayName": "Propietario Demo",
  "identificationType": "cedula",
  "identificationNumber": "0000000000",
  "email": "owner.villa.01@example.com",
  "phone": "0999999999",
  "whatsapp": "0999999999"
}
```

### Response 201

```json id="3r0vxp"
{
  "data": {
    "id": "person_uuid",
    "tenantId": "tenant_uuid",
    "userProfileId": null,
    "displayName": "Propietario Demo",
    "firstName": "Propietario",
    "lastName": "Demo",
    "identificationType": "cedula",
    "identificationNumber": "masked-or-partial",
    "email": "owner.villa.01@example.com",
    "phone": "0999999999",
    "whatsapp": "0999999999",
    "status": "active",
    "createdAt": "2026-07-13T10:00:00Z",
    "updatedAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="z2dbzu"
person.created
```

### Evento

```text id="gp2jxr"
PersonCreated
```

---

## 10.3. Consultar persona por ID

### Endpoint

```http id="32ugon"
GET /api/v1/tenant/persons/{personId}
```

### Permiso

```text id="alv2e2"
persons.read
```

### Response 200

```json id="o2cb9m"
{
  "data": {
    "id": "person_uuid",
    "tenantId": "tenant_uuid",
    "userProfileId": "user_uuid",
    "displayName": "Propietario Demo",
    "firstName": "Propietario",
    "lastName": "Demo",
    "identificationType": "cedula",
    "identificationNumber": "masked-or-partial",
    "email": "owner.villa.01@example.com",
    "phone": "0999999999",
    "whatsapp": "0999999999",
    "status": "active",
    "propertyUnits": [
      {
        "propertyUnitId": "property_unit_uuid",
        "code": "Casa 01",
        "relationship": "owner"
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

## 10.4. Actualizar persona

### Endpoint

```http id="14c0gy"
PATCH /api/v1/tenant/persons/{personId}
```

### Permiso

```text id="l5mzfw"
persons.update
```

### Request body

```json id="a9zaxr"
{
  "firstName": "Propietario",
  "lastName": "Demo Actualizado",
  "displayName": "Propietario Demo Actualizado",
  "email": "owner.updated@example.com",
  "phone": "0988888888",
  "whatsapp": "0988888888"
}
```

### Response 200

```json id="l20ujp"
{
  "data": {
    "id": "person_uuid",
    "displayName": "Propietario Demo Actualizado",
    "email": "owner.updated@example.com",
    "status": "active",
    "updatedAt": "2026-07-13T11:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="tp6yi7"
person.updated
```

---

## 10.5. Archivar persona

### Endpoint

```http id="vdgdg8"
POST /api/v1/tenant/persons/{personId}/archive
```

### Permiso

```text id="1jhwc2"
persons.archive
```

### Request body

```json id="hl2ox2"
{
  "reason": "Registro histórico."
}
```

### Response 200

```json id="jz5plc"
{
  "data": {
    "id": "person_uuid",
    "status": "archived",
    "archivedAt": "2026-07-13T11:10:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

No archivar si existen relaciones activas críticas, salvo política administrativa explícita.

---

## 10.6. Vincular usuario a persona

### Endpoint

```http id="1jeypq"
POST /api/v1/tenant/persons/{personId}/link-user
```

### Permiso

```text id="9zizv4"
persons.update
```

### Request body

```json id="c9twll"
{
  "userProfileId": "user_uuid"
}
```

### Response 200

```json id="srjs52"
{
  "data": {
    "personId": "person_uuid",
    "userProfileId": "user_uuid",
    "linkedAt": "2026-07-13T11:20:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* La persona debe pertenecer al tenant activo.
* El usuario debe existir.
* El usuario debe tener membresía en el tenant o estar siendo preparado para acceso.
* La vinculación habilita permisos `.own`.

### Auditoría

```text id="cs3vbj"
person.userLinked
```

### Evento

```text id="wjm7s6"
UserLinkedToPerson
```

---

# 11. Legal Entities API

Ruta base:

```text id="07ecjn"
/api/v1/tenant/legal-entities
```

---

## 11.1. Listar entidades jurídicas

### Endpoint

```http id="4h0f9o"
GET /api/v1/tenant/legal-entities
```

### Permiso

```text id="nzm7g5"
legalEntities.read
```

### Response 200

```json id="iawaj4"
{
  "data": [
    {
      "id": "legal_entity_uuid",
      "tenantId": "tenant_uuid",
      "name": "Empresa Demo S.A.",
      "taxIdentificationType": "ruc",
      "taxIdentificationNumber": "masked-or-partial",
      "email": "empresa.demo@example.com",
      "phone": null,
      "address": null,
      "status": "active",
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

## 11.2. Crear entidad jurídica

### Endpoint

```http id="3yhj87"
POST /api/v1/tenant/legal-entities
```

### Permiso

```text id="1jr2iw"
legalEntities.create
```

### Request body

```json id="rnjdq8"
{
  "name": "Empresa Demo S.A.",
  "taxIdentificationType": "ruc",
  "taxIdentificationNumber": "0000000000001",
  "email": "empresa.demo@example.com",
  "phone": "022222222",
  "address": "Dirección demo"
}
```

### Response 201

```json id="tmfg2e"
{
  "data": {
    "id": "legal_entity_uuid",
    "tenantId": "tenant_uuid",
    "name": "Empresa Demo S.A.",
    "taxIdentificationType": "ruc",
    "taxIdentificationNumber": "masked-or-partial",
    "email": "empresa.demo@example.com",
    "status": "active",
    "createdAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="dq8cx1"
legalEntity.created
```

---

## 11.3. Consultar entidad jurídica

```http id="yp20e4"
GET /api/v1/tenant/legal-entities/{legalEntityId}
```

### Permiso

```text id="yoaimf"
legalEntities.read
```

---

## 11.4. Actualizar entidad jurídica

```http id="6fzqjx"
PATCH /api/v1/tenant/legal-entities/{legalEntityId}
```

### Permiso

```text id="rppiiv"
legalEntities.update
```

---

## 11.5. Archivar entidad jurídica

```http id="src9rv"
POST /api/v1/tenant/legal-entities/{legalEntityId}/archive
```

### Permiso

```text id="o3tixa"
legalEntities.archive
```

---

# 12. Property Ownerships API

Ruta base:

```text id="ku23zx"
/api/v1/tenant/property-ownerships
```

---

## 12.1. Listar relaciones de propiedad

### Endpoint

```http id="d9jzqr"
GET /api/v1/tenant/property-ownerships
```

### Permiso

```text id="o9b7x7"
propertyOwnerships.read
```

### Query params

| Nombre           | Tipo   | Descripción                                              |
| ---------------- | ------ | -------------------------------------------------------- |
| `propertyUnitId` | string | Filtrar por unidad                                       |
| `personId`       | string | Filtrar por persona                                      |
| `legalEntityId`  | string | Filtrar por entidad                                      |
| `status`         | string | active, ended, disputed, archived                        |
| `ownershipType`  | string | owner, coOwner, legalRepresentative, usufructuary, other |

### Response 200

```json id="u5c5q2"
{
  "data": [
    {
      "id": "ownership_uuid",
      "tenantId": "tenant_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "owner": {
        "type": "person",
        "id": "person_uuid",
        "displayName": "Propietario Demo"
      },
      "ownershipType": "owner",
      "ownershipPercentage": "100.00",
      "isPrimary": true,
      "status": "active",
      "startDate": "2026-07-13",
      "endDate": null
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

## 12.2. Crear relación de propiedad

### Endpoint

```http id="0c8uka"
POST /api/v1/tenant/property-ownerships
```

### Permiso

```text id="cjq15k"
propertyOwnerships.create
```

### Request body

```json id="q4mifj"
{
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "legalEntityId": null,
  "ownershipType": "owner",
  "ownershipPercentage": "100.00",
  "isPrimary": true,
  "startDate": "2026-07-13"
}
```

### Regla XOR

Debe enviarse exactamente uno:

```text id="g3epfh"
personId
legalEntityId
```

### Response 201

```json id="taxkey"
{
  "data": {
    "id": "ownership_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnitId": "property_unit_uuid",
    "personId": "person_uuid",
    "legalEntityId": null,
    "ownershipType": "owner",
    "ownershipPercentage": "100.00",
    "isPrimary": true,
    "status": "active",
    "startDate": "2026-07-13",
    "endDate": null,
    "createdAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="r1l941"
propertyOwnership.created
```

### Evento

```text id="hwzmjh"
PropertyOwnershipCreated
```

---

## 12.3. Consultar relación de propiedad

```http id="p1k4ex"
GET /api/v1/tenant/property-ownerships/{ownershipId}
```

### Permiso

```text id="c3v1wc"
propertyOwnerships.read
```

---

## 12.4. Actualizar relación de propiedad

```http id="6wlgc7"
PATCH /api/v1/tenant/property-ownerships/{ownershipId}
```

### Permiso

```text id="2gr19d"
propertyOwnerships.update
```

### Campos permitidos

```text id="s87r19"
ownershipType
ownershipPercentage
isPrimary
status cuando aplique
```

No modificar directamente:

```text id="z3q91c"
tenantId
propertyUnitId
personId
legalEntityId
startDate
createdAt
```

---

## 12.5. Finalizar relación de propiedad

### Endpoint

```http id="j99td3"
POST /api/v1/tenant/property-ownerships/{ownershipId}/end
```

### Permiso

```text id="3pks2m"
propertyOwnerships.end
```

### Request body

```json id="mjlje4"
{
  "endDate": "2026-12-31",
  "reason": "Transferencia de propiedad."
}
```

### Response 200

```json id="1dcxcr"
{
  "data": {
    "id": "ownership_uuid",
    "status": "ended",
    "endDate": "2026-12-31"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="b2pzkx"
propertyOwnership.ended
```

---

# 13. Residencies API

Ruta base:

```text id="463fgs"
/api/v1/tenant/residencies
```

---

## 13.1. Listar residencias

### Endpoint

```http id="kq7exq"
GET /api/v1/tenant/residencies
```

### Permiso

```text id="67iwiy"
residencies.read
```

### Query params

| Nombre           | Tipo   | Descripción                                                               |
| ---------------- | ------ | ------------------------------------------------------------------------- |
| `propertyUnitId` | string | Filtrar por unidad                                                        |
| `personId`       | string | Filtrar por persona                                                       |
| `status`         | string | active, ended, suspended, archived                                        |
| `residencyType`  | string | ownerResident, tenant, familyMember, authorizedOccupant, caretaker, other |

### Response 200

```json id="4bxpuk"
{
  "data": [
    {
      "id": "residency_uuid",
      "tenantId": "tenant_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "person": {
        "id": "person_uuid",
        "displayName": "Residente Demo"
      },
      "residencyType": "ownerResident",
      "isPrimaryResident": true,
      "status": "active",
      "startDate": "2026-07-13",
      "endDate": null
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

## 13.2. Crear residencia

### Endpoint

```http id="pcwuy7"
POST /api/v1/tenant/residencies
```

### Permiso

```text id="vpfcw9"
residencies.create
```

### Request body

```json id="pj16nv"
{
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "residencyType": "ownerResident",
  "isPrimaryResident": true,
  "startDate": "2026-07-13"
}
```

### Response 201

```json id="twjfxu"
{
  "data": {
    "id": "residency_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnitId": "property_unit_uuid",
    "personId": "person_uuid",
    "residencyType": "ownerResident",
    "isPrimaryResident": true,
    "status": "active",
    "startDate": "2026-07-13",
    "endDate": null,
    "createdAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="9mk09s"
residency.created
```

### Evento

```text id="x8yahg"
ResidencyCreated
```

---

## 13.3. Consultar residencia

```http id="snrw51"
GET /api/v1/tenant/residencies/{residencyId}
```

### Permiso

```text id="lx1eyj"
residencies.read
```

---

## 13.4. Actualizar residencia

```http id="740kq5"
PATCH /api/v1/tenant/residencies/{residencyId}
```

### Permiso

```text id="dbir8h"
residencies.update
```

---

## 13.5. Finalizar residencia

### Endpoint

```http id="j7xeex"
POST /api/v1/tenant/residencies/{residencyId}/end
```

### Permiso

```text id="0pzdvw"
residencies.end
```

### Request body

```json id="y9tdzu"
{
  "endDate": "2026-12-31",
  "reason": "Cambio de residencia."
}
```

### Response 200

```json id="2kprb0"
{
  "data": {
    "id": "residency_uuid",
    "status": "ended",
    "endDate": "2026-12-31"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Auditoría

```text id="3xhfvn"
residency.ended
```

---

# 14. Leases API

Ruta base:

```text id="jq6z19"
/api/v1/tenant/leases
```

---

## 14.1. Listar arriendos

```http id="wua5dy"
GET /api/v1/tenant/leases
```

### Permiso

```text id="eq13gz"
leases.read
```

---

## 14.2. Crear arriendo

### Endpoint

```http id="3f0l6z"
POST /api/v1/tenant/leases
```

### Permiso

```text id="i68n4k"
leases.create
```

### Request body

```json id="5w2xfb"
{
  "propertyUnitId": "property_unit_uuid",
  "ownerPersonId": "owner_person_uuid",
  "ownerLegalEntityId": null,
  "tenantPersonId": "tenant_person_uuid",
  "startDate": "2026-07-13",
  "endDate": "2027-07-12"
}
```

### Response 201

```json id="lu8ttk"
{
  "data": {
    "id": "lease_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnitId": "property_unit_uuid",
    "ownerPersonId": "owner_person_uuid",
    "ownerLegalEntityId": null,
    "tenantPersonId": "tenant_person_uuid",
    "status": "draft",
    "startDate": "2026-07-13",
    "endDate": "2027-07-12",
    "createdAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

* Exactamente uno entre `ownerPersonId` y `ownerLegalEntityId`.
* Unidad, propietario y arrendatario deben pertenecer al tenant activo.
* No se gestionan valores monetarios en MVP.

---

## 14.3. Consultar arriendo

```http id="9prpod"
GET /api/v1/tenant/leases/{leaseId}
```

### Permiso

```text id="92357o"
leases.read
```

---

## 14.4. Actualizar arriendo

```http id="w9x1ow"
PATCH /api/v1/tenant/leases/{leaseId}
```

### Permiso

```text id="r2l2ko"
leases.update
```

---

## 14.5. Finalizar arriendo

```http id="t4ltg8"
POST /api/v1/tenant/leases/{leaseId}/end
```

### Permiso

```text id="o1koaz"
leases.end
```

### Request body

```json id="fyx56o"
{
  "endDate": "2027-07-12",
  "reason": "Finalización del contrato."
}
```

### Auditoría

```text id="ydqsgy"
lease.ended
```

---

# 15. Vehicles API

Ruta base:

```text id="343db0"
/api/v1/tenant/vehicles
```

---

## 15.1. Listar vehículos

```http id="gbxwpz"
GET /api/v1/tenant/vehicles
```

### Permiso

```text id="tv12pt"
vehicles.read
```

### Query params

```text id="u945yo"
propertyUnitId
personId
status
plate
page
pageSize
```

---

## 15.2. Crear vehículo

### Endpoint

```http id="7nwu1y"
POST /api/v1/tenant/vehicles
```

### Permiso

```text id="x6d64m"
vehicles.create
```

### Request body

```json id="1dsrix"
{
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "plate": "DEMO-001",
  "type": "car",
  "brand": "Marca Demo",
  "model": "Modelo Demo",
  "color": "Azul"
}
```

### Response 201

```json id="tlr0db"
{
  "data": {
    "id": "vehicle_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnitId": "property_unit_uuid",
    "personId": "person_uuid",
    "plate": "DEMO-001",
    "type": "car",
    "brand": "Marca Demo",
    "model": "Modelo Demo",
    "color": "Azul",
    "status": "active",
    "createdAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

Debe asociarse al menos a `propertyUnitId` o `personId`.

---

## 15.3. Consultar vehículo

```http id="vz7uie"
GET /api/v1/tenant/vehicles/{vehicleId}
```

### Permiso

```text id="d26e3c"
vehicles.read
```

---

## 15.4. Actualizar vehículo

```http id="aoc4zo"
PATCH /api/v1/tenant/vehicles/{vehicleId}
```

### Permiso

```text id="oagruu"
vehicles.update
```

---

## 15.5. Archivar vehículo

```http id="cs0pcf"
POST /api/v1/tenant/vehicles/{vehicleId}/archive
```

### Permiso

```text id="15hmc5"
vehicles.archive
```

### Auditoría

```text id="nbso3e"
vehicle.archived
```

---

# 16. Pets API

Ruta base:

```text id="r6mmab"
/api/v1/tenant/pets
```

---

## 16.1. Listar mascotas

```http id="3w40ai"
GET /api/v1/tenant/pets
```

### Permiso

```text id="s6krr8"
pets.read
```

---

## 16.2. Crear mascota

### Endpoint

```http id="04430w"
POST /api/v1/tenant/pets
```

### Permiso

```text id="392a3f"
pets.create
```

### Request body

```json id="8wxth8"
{
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "name": "Mascota Demo",
  "species": "dog",
  "breed": "mixed",
  "color": "Café"
}
```

### Response 201

```json id="5ag7st"
{
  "data": {
    "id": "pet_uuid",
    "tenantId": "tenant_uuid",
    "propertyUnitId": "property_unit_uuid",
    "personId": "person_uuid",
    "name": "Mascota Demo",
    "species": "dog",
    "breed": "mixed",
    "color": "Café",
    "status": "active",
    "createdAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Regla

Debe asociarse al menos a `propertyUnitId` o `personId`.

---

## 16.3. Consultar mascota

```http id="zp4u12"
GET /api/v1/tenant/pets/{petId}
```

### Permiso

```text id="yj86xh"
pets.read
```

---

## 16.4. Actualizar mascota

```http id="g284u8"
PATCH /api/v1/tenant/pets/{petId}
```

### Permiso

```text id="h82u1y"
pets.update
```

---

## 16.5. Archivar mascota

```http id="lyqk5c"
POST /api/v1/tenant/pets/{petId}/archive
```

### Permiso

```text id="5565s7"
pets.archive
```

---

# 17. Emergency Contacts API

Ruta base:

```text id="q0e9xu"
/api/v1/tenant/emergency-contacts
```

---

## 17.1. Listar contactos de emergencia

```http id="gdeebh"
GET /api/v1/tenant/emergency-contacts
```

### Permiso

```text id="1f46kj"
emergencyContacts.read
```

### Query params

```text id="v030sv"
personId
status
page
pageSize
```

---

## 17.2. Crear contacto de emergencia

### Endpoint

```http id="th3ba1"
POST /api/v1/tenant/emergency-contacts
```

### Permiso

```text id="mcmhn2"
emergencyContacts.create
```

### Request body

```json id="gi8noy"
{
  "personId": "person_uuid",
  "name": "Contacto Demo",
  "relationship": "Familiar",
  "phone": "0999999999",
  "email": "contact.demo@example.com"
}
```

### Response 201

```json id="ummm3c"
{
  "data": {
    "id": "emergency_contact_uuid",
    "tenantId": "tenant_uuid",
    "personId": "person_uuid",
    "name": "Contacto Demo",
    "relationship": "Familiar",
    "phone": "0999999999",
    "email": "contact.demo@example.com",
    "status": "active",
    "createdAt": "2026-07-13T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 17.3. Consultar contacto

```http id="dfp844"
GET /api/v1/tenant/emergency-contacts/{emergencyContactId}
```

### Permiso

```text id="mtg970"
emergencyContacts.read
```

---

## 17.4. Actualizar contacto

```http id="zi2hsr"
PATCH /api/v1/tenant/emergency-contacts/{emergencyContactId}
```

### Permiso

```text id="xwaqax"
emergencyContacts.update
```

---

## 17.5. Archivar contacto

```http id="iicbt0"
POST /api/v1/tenant/emergency-contacts/{emergencyContactId}/archive
```

### Permiso

```text id="hwwo1d"
emergencyContacts.archive
```

---

# 18. Own Resources API

Ruta base:

```text id="q5fdog"
/api/v1/me
```

Estos endpoints devuelven información propia del usuario autenticado.

Requieren:

```text id="oh1tld"
AuthGuard
TenantGuard
TenantPermissionGuard o PolicyGuard
OwnResourcePolicyService
```

---

## 18.1. Consultar mi persona

### Endpoint

```http id="x0f6it"
GET /api/v1/me/person
```

### Permiso

```text id="ezd7cy"
persons.read.own
```

### Response 200

```json id="65m18y"
{
  "data": {
    "id": "person_uuid",
    "displayName": "Residente Demo",
    "firstName": "Residente",
    "lastName": "Demo",
    "email": "resident.demo@example.com",
    "phone": "0999999999",
    "whatsapp": "0999999999",
    "status": "active"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Errores específicos

| Código                  | HTTP | Descripción                           |
| ----------------------- | ---: | ------------------------------------- |
| `OWN_PERSON_NOT_LINKED` |  403 | El usuario no tiene persona vinculada |

---

## 18.2. Consultar mis unidades

### Endpoint

```http id="snauab"
GET /api/v1/me/property-units
```

### Permiso

```text id="sp89n2"
propertyUnits.read.own
```

### Response 200

```json id="qz9kvz"
{
  "data": [
    {
      "id": "property_unit_uuid",
      "code": "Casa 01",
      "name": "Casa 01",
      "type": "house",
      "relationship": "owner",
      "status": "active"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

### Reglas

Devuelve unidades donde la persona vinculada sea:

* propietaria activa;
* residente activa.

---

## 18.3. Consultar mis residencias

### Endpoint

```http id="izzc1f"
GET /api/v1/me/residencies
```

### Permiso

```text id="s0qrto"
residencies.read.own
```

### Response 200

```json id="8aee5s"
{
  "data": [
    {
      "id": "residency_uuid",
      "propertyUnit": {
        "id": "property_unit_uuid",
        "code": "Casa 01"
      },
      "residencyType": "ownerResident",
      "isPrimaryResident": true,
      "status": "active",
      "startDate": "2026-07-13",
      "endDate": null
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 18.4. Consultar mis vehículos

### Endpoint

```http id="ve58yb"
GET /api/v1/me/vehicles
```

### Permiso

```text id="kgwmvv"
vehicles.read.own
```

### Response 200

```json id="lrb3oc"
{
  "data": [
    {
      "id": "vehicle_uuid",
      "propertyUnitId": "property_unit_uuid",
      "plate": "DEMO-001",
      "type": "car",
      "brand": "Marca Demo",
      "model": "Modelo Demo",
      "color": "Azul",
      "status": "active"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 18.5. Consultar mis mascotas

### Endpoint

```http id="9bayd2"
GET /api/v1/me/pets
```

### Permiso

```text id="0ez3kp"
pets.read.own
```

### Response 200

```json id="25gezy"
{
  "data": [
    {
      "id": "pet_uuid",
      "propertyUnitId": "property_unit_uuid",
      "name": "Mascota Demo",
      "species": "dog",
      "breed": "mixed",
      "color": "Café",
      "status": "active"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 18.6. Consultar mis contactos de emergencia

### Endpoint

```http id="s7897l"
GET /api/v1/me/emergency-contacts
```

### Permiso

```text id="t8mp6g"
emergencyContacts.read.own
```

### Response 200

```json id="2ydwze"
{
  "data": [
    {
      "id": "emergency_contact_uuid",
      "name": "Contacto Demo",
      "relationship": "Familiar",
      "phone": "0999999999",
      "email": "contact.demo@example.com",
      "status": "active"
    }
  ],
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

# 19. DTOs principales

## 19.1. PropertyUnitResponseDto

```json id="eccfx6"
{
  "id": "property_unit_uuid",
  "tenantId": "tenant_uuid",
  "code": "Casa 01",
  "name": "Casa 01",
  "type": "house",
  "block": "A",
  "floor": null,
  "addressReference": "Ingreso principal",
  "areaM2": "120.50",
  "status": "active",
  "createdAt": "2026-07-13T10:00:00Z",
  "updatedAt": "2026-07-13T10:00:00Z"
}
```

---

## 19.2. PersonResponseDto

```json id="43n3uf"
{
  "id": "person_uuid",
  "tenantId": "tenant_uuid",
  "userProfileId": "user_uuid",
  "displayName": "Persona Demo",
  "firstName": "Persona",
  "lastName": "Demo",
  "identificationType": "cedula",
  "identificationNumber": "masked-or-partial",
  "email": "person.demo@example.com",
  "phone": "0999999999",
  "whatsapp": "0999999999",
  "status": "active"
}
```

---

## 19.3. PropertyOwnershipResponseDto

```json id="lcn3l3"
{
  "id": "ownership_uuid",
  "tenantId": "tenant_uuid",
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "legalEntityId": null,
  "ownershipType": "owner",
  "ownershipPercentage": "100.00",
  "isPrimary": true,
  "status": "active",
  "startDate": "2026-07-13",
  "endDate": null
}
```

---

## 19.4. ResidencyResponseDto

```json id="i2l5jw"
{
  "id": "residency_uuid",
  "tenantId": "tenant_uuid",
  "propertyUnitId": "property_unit_uuid",
  "personId": "person_uuid",
  "residencyType": "ownerResident",
  "isPrimaryResident": true,
  "status": "active",
  "startDate": "2026-07-13",
  "endDate": null
}
```

---

# 20. Validaciones generales

## 20.1. `tenantId`

El `tenantId` no debe recibirse desde el body en endpoints tenant-scoped.

Debe resolverse desde:

```text id="2h9bnw"
CurrentTenant
TenantGuard
Membership context
```

---

## 20.2. IDs

Validar formato de:

```text id="2icqi9"
propertyUnitId
personId
legalEntityId
ownershipId
residencyId
leaseId
vehicleId
petId
emergencyContactId
```

---

## 20.3. Fechas

Reglas:

```text id="3fll2r"
startDate requerido en relaciones
endDate >= startDate
```

---

## 20.4. Porcentaje de propiedad

Reglas:

```text id="fy5utx"
ownershipPercentage > 0
ownershipPercentage <= 100
```

Si la regla estricta está activa:

```text id="5jv4a3"
sum(active ownership percentages by propertyUnit) <= 100
```

---

## 20.5. Persona o entidad jurídica

En ownership y lease debe cumplirse exactamente una opción:

```text id="ejgf03"
personId XOR legalEntityId
```

o:

```text id="wgzzc6"
ownerPersonId XOR ownerLegalEntityId
```

---

## 20.6. Vehículo y mascota

Debe existir al menos uno:

```text id="60gd1f"
propertyUnitId
personId
```

---

# 21. Catálogo de errores

| Código                                       |    HTTP | Descripción                                |
| -------------------------------------------- | ------: | ------------------------------------------ |
| `UNAUTHORIZED`                               |     401 | No autenticado                             |
| `FORBIDDEN`                                  |     403 | Sin permiso                                |
| `TENANT_NOT_ACTIVE`                          |     403 | Tenant no activo                           |
| `MEMBERSHIP_NOT_ACTIVE`                      |     403 | Membership no activa                       |
| `PROPERTY_UNIT_NOT_FOUND`                    |     404 | Unidad no encontrada                       |
| `PROPERTY_UNIT_CODE_ALREADY_EXISTS`          |     409 | Código de unidad duplicado                 |
| `PROPERTY_UNIT_ARCHIVED`                     |     409 | Unidad archivada                           |
| `PERSON_NOT_FOUND`                           |     404 | Persona no encontrada                      |
| `PERSON_IDENTIFICATION_ALREADY_EXISTS`       |     409 | Identificación duplicada                   |
| `PERSON_ARCHIVED`                            |     409 | Persona archivada                          |
| `USER_PROFILE_NOT_FOUND`                     |     404 | Usuario no encontrado                      |
| `USER_ALREADY_LINKED_TO_PERSON`              |     409 | Usuario ya vinculado                       |
| `OWN_PERSON_NOT_LINKED`                      |     403 | Usuario sin Person vinculada               |
| `LEGAL_ENTITY_NOT_FOUND`                     |     404 | Entidad jurídica no encontrada             |
| `LEGAL_ENTITY_IDENTIFICATION_ALREADY_EXISTS` |     409 | Identificación jurídica duplicada          |
| `OWNERSHIP_NOT_FOUND`                        |     404 | Relación de propiedad no encontrada        |
| `OWNERSHIP_ALREADY_ENDED`                    |     409 | Propiedad ya finalizada                    |
| `OWNERSHIP_OWNER_REQUIRED`                   |     422 | Falta persona o entidad propietaria        |
| `OWNERSHIP_OWNER_XOR_VIOLATION`              |     422 | Persona y entidad enviadas simultáneamente |
| `OWNERSHIP_PERCENTAGE_INVALID`               |     422 | Porcentaje inválido                        |
| `RESIDENCY_NOT_FOUND`                        |     404 | Residencia no encontrada                   |
| `RESIDENCY_ALREADY_ENDED`                    |     409 | Residencia ya finalizada                   |
| `LEASE_NOT_FOUND`                            |     404 | Arriendo no encontrado                     |
| `LEASE_ALREADY_ENDED`                        |     409 | Arriendo ya finalizado                     |
| `VEHICLE_NOT_FOUND`                          |     404 | Vehículo no encontrado                     |
| `VEHICLE_PLATE_ALREADY_EXISTS`               |     409 | Placa duplicada                            |
| `PET_NOT_FOUND`                              |     404 | Mascota no encontrada                      |
| `EMERGENCY_CONTACT_NOT_FOUND`                |     404 | Contacto no encontrado                     |
| `CROSS_TENANT_REFERENCE`                     | 403/422 | Recurso pertenece a otro tenant            |
| `VALIDATION_ERROR`                           |     422 | Error de validación                        |
| `INTERNAL_ERROR`                             |     500 | Error interno                              |

---

## 22. Ejemplos de errores

### 22.1. Código de unidad duplicado

```json id="2ep947"
{
  "error": {
    "code": "PROPERTY_UNIT_CODE_ALREADY_EXISTS",
    "message": "A property unit with this code already exists in this tenant.",
    "details": {
      "code": "Casa 01"
    },
    "traceId": "req_123456"
  }
}
```

---

### 22.2. Referencia cross-tenant

```json id="1sp98m"
{
  "error": {
    "code": "CROSS_TENANT_REFERENCE",
    "message": "The referenced resource does not belong to the active tenant.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 22.3. Usuario sin persona vinculada

```json id="s7kz06"
{
  "error": {
    "code": "OWN_PERSON_NOT_LINKED",
    "message": "The current user is not linked to a person in this tenant.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

# 23. Auditoría por endpoint

| Endpoint                                       | Auditoría                   |
| ---------------------------------------------- | --------------------------- |
| `POST /tenant/property-units`                  | `propertyUnit.created`      |
| `PATCH /tenant/property-units/{id}`            | `propertyUnit.updated`      |
| `POST /tenant/property-units/{id}/archive`     | `propertyUnit.archived`     |
| `POST /tenant/persons`                         | `person.created`            |
| `PATCH /tenant/persons/{id}`                   | `person.updated`            |
| `POST /tenant/persons/{id}/archive`            | `person.archived`           |
| `POST /tenant/persons/{id}/link-user`          | `person.userLinked`         |
| `POST /tenant/legal-entities`                  | `legalEntity.created`       |
| `PATCH /tenant/legal-entities/{id}`            | `legalEntity.updated`       |
| `POST /tenant/legal-entities/{id}/archive`     | `legalEntity.archived`      |
| `POST /tenant/property-ownerships`             | `propertyOwnership.created` |
| `PATCH /tenant/property-ownerships/{id}`       | `propertyOwnership.updated` |
| `POST /tenant/property-ownerships/{id}/end`    | `propertyOwnership.ended`   |
| `POST /tenant/residencies`                     | `residency.created`         |
| `PATCH /tenant/residencies/{id}`               | `residency.updated`         |
| `POST /tenant/residencies/{id}/end`            | `residency.ended`           |
| `POST /tenant/leases`                          | `lease.created`             |
| `PATCH /tenant/leases/{id}`                    | `lease.updated`             |
| `POST /tenant/leases/{id}/end`                 | `lease.ended`               |
| `POST /tenant/vehicles`                        | `vehicle.created`           |
| `PATCH /tenant/vehicles/{id}`                  | `vehicle.updated`           |
| `POST /tenant/vehicles/{id}/archive`           | `vehicle.archived`          |
| `POST /tenant/pets`                            | `pet.created`               |
| `PATCH /tenant/pets/{id}`                      | `pet.updated`               |
| `POST /tenant/pets/{id}/archive`               | `pet.archived`              |
| `POST /tenant/emergency-contacts`              | `emergencyContact.created`  |
| `PATCH /tenant/emergency-contacts/{id}`        | `emergencyContact.updated`  |
| `POST /tenant/emergency-contacts/{id}/archive` | `emergencyContact.archived` |

---

## 24. Eventos por endpoint

| Endpoint                                    | Evento                     |
| ------------------------------------------- | -------------------------- |
| `POST /tenant/property-units`               | `PropertyUnitCreated`      |
| `PATCH /tenant/property-units/{id}`         | `PropertyUnitUpdated`      |
| `POST /tenant/property-units/{id}/archive`  | `PropertyUnitArchived`     |
| `POST /tenant/persons`                      | `PersonCreated`            |
| `PATCH /tenant/persons/{id}`                | `PersonUpdated`            |
| `POST /tenant/persons/{id}/archive`         | `PersonArchived`           |
| `POST /tenant/persons/{id}/link-user`       | `UserLinkedToPerson`       |
| `POST /tenant/legal-entities`               | `LegalEntityCreated`       |
| `PATCH /tenant/legal-entities/{id}`         | `LegalEntityUpdated`       |
| `POST /tenant/legal-entities/{id}/archive`  | `LegalEntityArchived`      |
| `POST /tenant/property-ownerships`          | `PropertyOwnershipCreated` |
| `POST /tenant/property-ownerships/{id}/end` | `PropertyOwnershipEnded`   |
| `POST /tenant/residencies`                  | `ResidencyCreated`         |
| `POST /tenant/residencies/{id}/end`         | `ResidencyEnded`           |
| `POST /tenant/leases`                       | `LeaseCreated`             |
| `POST /tenant/leases/{id}/end`              | `LeaseEnded`               |
| `POST /tenant/vehicles`                     | `VehicleRegistered`        |
| `POST /tenant/pets`                         | `PetRegistered`            |
| `POST /tenant/emergency-contacts`           | `EmergencyContactCreated`  |

---

# 25. Observabilidad

Todos los endpoints deben registrar:

```text id="vblbdu"
traceId
method
path
status
latencyMs
actorUserId
tenantId
resourceType
resourceId si aplica
errorCode si aplica
```

No registrar:

```text id="ht5vqi"
Authorization header
access token
identificationNumber completo
payload personal completo
teléfonos completos si no es necesario
emails innecesarios
stack trace en producción
```

Métricas sugeridas:

```text id="4wz6uh"
property_units_created_total
persons_created_total
user_person_links_created_total
property_ownerships_created_total
property_ownerships_ended_total
residencies_created_total
residencies_ended_total
vehicles_registered_total
pets_registered_total
own_resource_access_denied_total
cross_tenant_reference_denied_total
```

---

# 26. Rate limiting

Rate limiting recomendado para:

```text id="y7g74u"
POST /api/v1/tenant/persons
POST /api/v1/tenant/property-units
POST /api/v1/tenant/persons/{personId}/link-user
GET /api/v1/me/*
```

Objetivo:

* reducir scraping de datos personales;
* reducir abuso de creación masiva;
* proteger endpoints `.own`;
* reducir intentos de enumeración.

---

# 27. CORS

Endpoints privados no deben usar CORS abierto en producción.

Prohibido:

```text id="g3qgic"
Access-Control-Allow-Origin: *
```

para endpoints autenticados.

Permitir solo orígenes oficiales de RESIDENT Core.

---

# 28. OpenAPI

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
* required permission;
* tenant scope;
* audit event;
* own policy cuando aplique.

Tags sugeridos:

```text id="n9u8wk"
Property Units
Persons
Legal Entities
Property Ownerships
Residencies
Leases
Vehicles
Pets
Emergency Contacts
Own Resources
```

---

## 29. Extensiones OpenAPI sugeridas

Para endpoints administrativos:

```yaml id="kkw7m8"
x-required-permission: propertyUnits.create
x-audit-event: propertyUnit.created
x-tenant-scope: tenant
```

Para endpoints `.own`:

```yaml id="pywgj2"
x-required-permission: propertyUnits.read.own
x-own-resource-policy: true
x-tenant-scope: tenant
```

---

# 30. Pruebas de contrato requeridas

## 30.1. Property Units API

Probar:

* listar;
* crear;
* consultar;
* actualizar;
* archivar;
* código duplicado;
* cross-tenant;
* sin permiso.

---

## 30.2. Persons API

Probar:

* listar;
* crear;
* consultar;
* actualizar;
* archivar;
* vincular UserProfile;
* identificación duplicada;
* `.own` habilitado luego de vincular.

---

## 30.3. Ownerships API

Probar:

* crear ownership persona;
* crear ownership legal entity;
* rechazar XOR inválido;
* finalizar ownership;
* no sobrescribir historial;
* no mezclar tenants.

---

## 30.4. Residencies API

Probar:

* crear residencia;
* finalizar residencia;
* consultar por unidad;
* consultar por persona;
* no mezclar tenants.

---

## 30.5. Own Resources API

Probar:

* usuario sin Person vinculada;
* usuario con Person vinculada;
* propietario consulta sus unidades;
* residente consulta sus unidades;
* no consulta unidad ajena;
* no mezcla tenants.

---

# 31. Matriz resumen de endpoints

| Método | Ruta                                          | Auth | Permiso                      | Auditoría                   |
| ------ | --------------------------------------------- | ---: | ---------------------------- | --------------------------- |
| GET    | `/api/v1/tenant/property-units`               |   Sí | `propertyUnits.read`         | No obligatoria              |
| POST   | `/api/v1/tenant/property-units`               |   Sí | `propertyUnits.create`       | `propertyUnit.created`      |
| GET    | `/api/v1/tenant/property-units/{id}`          |   Sí | `propertyUnits.read`         | No obligatoria              |
| PATCH  | `/api/v1/tenant/property-units/{id}`          |   Sí | `propertyUnits.update`       | `propertyUnit.updated`      |
| POST   | `/api/v1/tenant/property-units/{id}/archive`  |   Sí | `propertyUnits.archive`      | `propertyUnit.archived`     |
| GET    | `/api/v1/tenant/persons`                      |   Sí | `persons.read`               | No obligatoria              |
| POST   | `/api/v1/tenant/persons`                      |   Sí | `persons.create`             | `person.created`            |
| GET    | `/api/v1/tenant/persons/{id}`                 |   Sí | `persons.read`               | No obligatoria              |
| PATCH  | `/api/v1/tenant/persons/{id}`                 |   Sí | `persons.update`             | `person.updated`            |
| POST   | `/api/v1/tenant/persons/{id}/archive`         |   Sí | `persons.archive`            | `person.archived`           |
| POST   | `/api/v1/tenant/persons/{id}/link-user`       |   Sí | `persons.update`             | `person.userLinked`         |
| GET    | `/api/v1/tenant/legal-entities`               |   Sí | `legalEntities.read`         | No obligatoria              |
| POST   | `/api/v1/tenant/legal-entities`               |   Sí | `legalEntities.create`       | `legalEntity.created`       |
| GET    | `/api/v1/tenant/property-ownerships`          |   Sí | `propertyOwnerships.read`    | No obligatoria              |
| POST   | `/api/v1/tenant/property-ownerships`          |   Sí | `propertyOwnerships.create`  | `propertyOwnership.created` |
| POST   | `/api/v1/tenant/property-ownerships/{id}/end` |   Sí | `propertyOwnerships.end`     | `propertyOwnership.ended`   |
| GET    | `/api/v1/tenant/residencies`                  |   Sí | `residencies.read`           | No obligatoria              |
| POST   | `/api/v1/tenant/residencies`                  |   Sí | `residencies.create`         | `residency.created`         |
| POST   | `/api/v1/tenant/residencies/{id}/end`         |   Sí | `residencies.end`            | `residency.ended`           |
| GET    | `/api/v1/tenant/leases`                       |   Sí | `leases.read`                | No obligatoria              |
| POST   | `/api/v1/tenant/leases`                       |   Sí | `leases.create`              | `lease.created`             |
| GET    | `/api/v1/tenant/vehicles`                     |   Sí | `vehicles.read`              | No obligatoria              |
| POST   | `/api/v1/tenant/vehicles`                     |   Sí | `vehicles.create`            | `vehicle.created`           |
| GET    | `/api/v1/tenant/pets`                         |   Sí | `pets.read`                  | No obligatoria              |
| POST   | `/api/v1/tenant/pets`                         |   Sí | `pets.create`                | `pet.created`               |
| GET    | `/api/v1/me/person`                           |   Sí | `persons.read.own`           | No obligatoria              |
| GET    | `/api/v1/me/property-units`                   |   Sí | `propertyUnits.read.own`     | No obligatoria              |
| GET    | `/api/v1/me/residencies`                      |   Sí | `residencies.read.own`       | No obligatoria              |
| GET    | `/api/v1/me/vehicles`                         |   Sí | `vehicles.read.own`          | No obligatoria              |
| GET    | `/api/v1/me/pets`                             |   Sí | `pets.read.own`              | No obligatoria              |
| GET    | `/api/v1/me/emergency-contacts`               |   Sí | `emergencyContacts.read.own` | No obligatoria              |

---

# 32. Casos borde del contrato

| Caso                                                       | Resultado esperado                     |
| ---------------------------------------------------------- | -------------------------------------- |
| Crear unidad con código duplicado en mismo tenant          | 409                                    |
| Crear unidad con código existente en otro tenant           | permitido                              |
| Crear persona con identificación duplicada en mismo tenant | 409                                    |
| Crear persona con identificación existente en otro tenant  | permitido en MVP                       |
| Crear ownership con persona y legalEntity juntos           | 422                                    |
| Crear ownership sin persona ni legalEntity                 | 422                                    |
| Crear ownership con persona de otro tenant                 | 403/422                                |
| Crear residency con unidad de otro tenant                  | 403/422                                |
| Finalizar ownership ya finalizado                          | 409                                    |
| Finalizar residency ya finalizada                          | 409                                    |
| Usuario `.own` sin Person vinculada                        | 403                                    |
| Usuario `.own` intenta unidad ajena                        | 403/404                                |
| Tenant suspendido intenta crear unidad                     | 403                                    |
| Usuario sin permiso intenta listar personas                | 403                                    |
| Archivar unidad con relaciones activas críticas            | 409 o permitido con política explícita |
| Crear vehículo sin persona ni unidad                       | 422                                    |
| Crear mascota sin persona ni unidad                        | 422                                    |

---

# 33. Decisión final del contrato API

El módulo `003-residents-properties` expondrá endpoints administrativos bajo:

```text id="evw5rz"
/api/v1/tenant/*
```

y endpoints de información propia bajo:

```text id="wqzzv2"
/api/v1/me/*
```

Los endpoints administrativos servirán para que TenantAdmin, TenantStaff u otros roles autorizados gestionen el padrón residencial del tenant.

Los endpoints `.own` permitirán que propietarios y residentes consulten solo información asociada a su propia persona y unidades.

La autorización no dependerá únicamente del rol, sino también de:

```text id="0jydst"
tenant activo
membership activa
permiso requerido
tenantId del recurso
relación UserProfile → Person
relación Person → PropertyUnit
```

Este contrato prepara a RESIDENT Core para módulos financieros posteriores, especialmente alícuotas, cargos, estados de cuenta y pagos.
