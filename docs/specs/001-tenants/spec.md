# Spec 001 — Tenants Management

> **Ownership vigente para Sprint 2:**
> `docs/changes/GAP-S2-006-CONFIGURATION-PRISMA-OWNERSHIP-2026-08-13.md` retira
> `TenantConfiguration` y su API. Spec 001 conserva `timezone` y `currency` en
> `Tenant`; todos los demás settings pertenecen exclusivamente a Spec 025. Las
> referencias posteriores al modelo o endpoints retirados quedan supersedidas.

## 1. Información del documento

| Campo        | Valor                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto     | RESIDENT Core                                                                                                                                                                                           |
| Spec ID      | 001                                                                                                                                                                                                     |
| Módulo       | Tenants Management                                                                                                                                                                                      |
| Documento    | Functional Specification                                                                                                                                                                                |
| Ruta         | `docs/specs/001-tenants/spec.md`                                                                                                                                                                        |
| Versión      | 0.1                                                                                                                                                                                                     |
| Estado       | needs-review                                                                                                                                                                                            |
| Fecha        | 2026-07-12                                                                                                                                                                                              |
| Prioridad    | Alta                                                                                                                                                                                                    |
| Dependencias | `constitution.md`, `domain-map.md`, `architecture.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-004`, `ADR-006`, `ADR-007`, `ADR-008`, `ADR-009`, `ADR-010`, `ADR-011`, `ADR-012` |

---

## 2. Propósito

El módulo `Tenants Management` permite crear, configurar, consultar, suspender, reactivar y administrar los conjuntos residenciales registrados en RESIDENT Core.

En RESIDENT, un tenant representa un conjunto residencial, urbanización, condominio, edificio o comunidad habitacional administrada dentro de la plataforma.

Este módulo es crítico porque define la frontera primaria de aislamiento de datos.

Regla central:

```text id="dghdvz"
Todo dato operativo de RESIDENT Core debe pertenecer a un tenant.
```

---

## 3. Objetivo funcional

Permitir que un usuario autorizado de plataforma pueda:

* Crear un tenant.
* Definir su nombre, slug y datos básicos.
* Definir configuración inicial.
* Definir estado operativo.
* Vincularlo con el portal WordPress.
* Crear roles base iniciales.
* Asignar transaccionalmente un administrador inicial del tenant.
* Consultar tenants existentes.
* Suspender o reactivar tenants.
* Actualizar datos administrativos.
* Exponer perfil público controlado para WordPress.
* Registrar auditoría de todas las operaciones críticas.

---

## 4. Alcance

### 4.1. Incluido en esta spec

Esta spec incluye:

* Creación de tenant.
* Consulta de tenant.
* Actualización de tenant.
* Suspensión de tenant.
* Reactivación de tenant.
* Archivado lógico.
* Configuración inicial.
* Perfil público.
* Slug público.
* Relación con WordPress.
* Estado del tenant.
* Timezone.
* Moneda.
* Datos de contacto.
* Branding básico.
* Creación de roles base.
* Asignación transaccional de administrador inicial.
* Auditoría.
* Validaciones multitenant.
* Endpoints REST.
* Reglas de autorización.
* Eventos de dominio.
* Pruebas esperadas.

---

### 4.2. No incluido en esta spec

No se incluye:

* Gestión completa de usuarios y roles.
* Matriz completa de permisos.
* Autenticación con Keycloak.
* Gestión de residentes.
* Gestión de propiedades.
* Alícuotas.
* Pagos.
* Estados de cuenta.
* Reservas.
* Multas.
* Reportes financieros.
* Configuración avanzada de planes comerciales.
* Facturación SaaS de tenants.
* Portal frontend administrativo.
* Gestión avanzada de dominios personalizados.

Estos temas se tratarán en specs posteriores.

---

## 5. Actores

### 5.1. PlatformAdmin

Usuario global con privilegios para crear, actualizar, suspender y administrar tenants.

### 5.2. PlatformOperator

Usuario global con permisos operativos limitados para gestionar tenants según política.

### 5.3. PlatformSupport

Usuario global con permisos de consulta o soporte limitado.

### 5.4. TenantAdmin

Usuario administrador de un tenant específico.

No crea tenants globales, pero puede completar o actualizar ciertos datos del tenant donde tiene permiso.

### 5.5. WordPress Portal

Consumidor externo que puede consultar información pública del tenant mediante endpoints públicos controlados.

### 5.6. n8n

Automatizador externo que puede recibir eventos o ejecutar acciones limitadas según permisos técnicos futuros.

---

## 6. Definiciones

### 6.1. Tenant

Entidad que representa un conjunto residencial administrado en RESIDENT Core.

### 6.2. Slug

Identificador público legible usado para URLs, integración con WordPress y acceso público.

Ejemplo:

```text id="foyyya"
villa-club
altos-del-norte
jardines-del-valle
portal-del-rio
```

### 6.3. Tenant status

Estado operativo del tenant.

Estados iniciales:

```text id="ggs761"
pendingSetup
active
suspended
inactive
archived
```

### 6.4. Public profile

Información pública del tenant que puede exponerse al portal WordPress.

### 6.5. Tenant configuration

Configuración técnica y funcional básica del tenant.

### 6.6. Tenant branding

Información visual básica del tenant:

* logo;
* colores;
* banner;
* nombre público;
* slogan.

### 6.7. WordPress mapping

Relación entre un tenant de RESIDENT Core y el CPT `conjunto` en WordPress.

---

## 7. Supuestos

1. RESIDENT Core será multitenant desde el inicio.
2. La estrategia multitenant inicial será shared database + shared schema + `tenant_id`.
3. El tenant será creado por un usuario global autorizado.
4. WordPress seguirá siendo portal informativo, no transaccional.
5. La autenticación podrá ser temporalmente propia en MVP, pero la arquitectura objetivo será Keycloak.
6. La autorización de negocio será responsabilidad de RESIDENT Core.
7. El tenant inicial podrá crearse sin usuarios residentes.
8. Los roles base se crearán dentro de la misma transacción de onboarding, bajo
   propiedad de `002-users-roles`.
9. El tenant puede estar en estado `pendingSetup` antes de operar.
10. Un tenant suspendido no podrá ejecutar operaciones transaccionales normales.
11. La moneda inicial será `USD`.
12. La zona horaria inicial por defecto será `America/Guayaquil`.

---

## 8. Reglas de negocio

### BR-001 — Slug único

Cada tenant debe tener un slug único en toda la plataforma.

Ejemplo:

```text id="m7a2x0"
villa-club
```

No pueden existir dos tenants con el mismo slug.

---

### BR-002 — Slug normalizado

El slug debe estar normalizado:

* minúsculas;
* sin espacios;
* sin tildes;
* sin caracteres especiales no permitidos;
* usando guiones medios;
* longitud razonable;
* no vacío.

Ejemplo:

```text id="m7ba1l"
"Villa Club" → "villa-club"
"Altos del Norte" → "altos-del-norte"
```

---

### BR-003 — Tenant creado en estado inicial

Todo tenant nuevo debe crearse inicialmente en estado:

```text id="b6kp88"
pendingSetup
```

No se permite activación directa en la operación de creación.

---

### BR-004 — Tenant activo

Solo tenants en estado `active` pueden ejecutar operaciones transaccionales ordinarias.

En endpoints tenant-scoped, “tenant activo” también designa el contexto inmutable de
una solicitud: el cliente envía `X-Tenant-Id` como selector no confiable y Core valida
tenant, membership y permisos. La selección no se persiste ni se cambia mediante un
endpoint.

---

### BR-005 — Tenant suspendido

Un tenant en estado `suspended` conserva sus datos, pero no puede ejecutar nuevas operaciones transaccionales normales.

Permitido:

* login limitado;
* consulta histórica según política;
* exportación autorizada;
* soporte de plataforma;
* reactivación por PlatformAdmin.

No permitido:

* generar nuevas alícuotas;
* registrar pagos operativos;
* crear reservas;
* crear multas;
* invitar nuevos usuarios;
* modificar configuración financiera crítica.

---

### BR-006 — Tenant archivado

Un tenant en estado `archived` se conserva para trazabilidad histórica y retención.

No permite operación ordinaria.

---

### BR-007 — Moneda inicial

La moneda inicial del tenant será:

```text id="ej1pfh"
USD
```

Otra moneda requerirá decisión posterior.

---

### BR-008 — Timezone inicial

La zona horaria inicial será:

```text id="u2j3nk"
America/Guayaquil
```

Debe poder configurarse por tenant.

---

### BR-009 — WordPress no es fuente de verdad

WordPress puede mostrar información pública del tenant, pero no será fuente de verdad transaccional.

RESIDENT Core será fuente de verdad para tenants operativos.

---

### BR-010 — Perfil público limitado

Los endpoints públicos del tenant no deben exponer:

* residentes;
* propietarios;
* pagos;
* saldos;
* deudas;
* comprobantes;
* roles;
* permisos;
* auditoría;
* configuraciones financieras sensibles.

---

### BR-011 — Roles base

Al crear un tenant deben persistirse sus roles base en la misma transacción. La
definición y escritura de roles y permisos pertenece a `002-users-roles`; Spec
001 orquesta la unidad de trabajo y no mantiene un placeholder.

Roles sugeridos:

```text id="pv44l7"
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

La matriz definitiva se desarrollará en `002-users-roles`.

---

### BR-012 — Administrador inicial

Un tenant debe tener al menos una membresía activa con una asignación activa de
rol `TenantAdmin` antes de activarse. Una invitación pendiente no cumple esta
regla.

---

### BR-013 — Auditoría obligatoria

Toda operación crítica sobre tenant debe registrarse en auditoría.

Eventos mínimos:

* tenant creado;
* tenant actualizado;
* tenant suspendido;
* tenant reactivado;
* tenant archivado;
* slug cambiado;
* configuración cambiada;
* branding cambiado;
* WordPress mapping actualizado;
* administrador inicial asignado;
* roles base creados.

---

### BR-014 — No eliminación física normal

Un tenant no debe eliminarse físicamente como operación normal.

Debe usarse:

* suspensión;
* inactivación;
* archivado;
* eliminación lógica;
* anonimización o eliminación física solo bajo procedimiento formal.

---

### BR-015 — Tenant como frontera de datos

Toda entidad operativa posterior debe referenciar `tenant_id`.

---

## 9. Estados del tenant

### 9.1. Estados permitidos

```text id="7vavtf"
pendingSetup
active
suspended
inactive
archived
```

---

### 9.2. Descripción

| Estado         | Descripción                                      |
| -------------- | ------------------------------------------------ |
| `pendingSetup` | Tenant creado, pendiente de configuración mínima |
| `active`       | Tenant operativo                                 |
| `suspended`    | Tenant bloqueado temporalmente                   |
| `inactive`     | Tenant inactivo, sin operación ordinaria         |
| `archived`     | Tenant archivado para retención histórica        |

---

### 9.3. Transiciones permitidas

```text id="xqhp06"
pendingSetup → active
pendingSetup → inactive
active → suspended
active → inactive
suspended → active
suspended → archived
inactive → active
inactive → archived
archived → active    solo con proceso especial
```

---

### 9.4. Transiciones no permitidas por defecto

```text id="jf1gdo"
archived → active sin autorización especial
suspended → pendingSetup
active → pendingSetup
```

---

## 10. Flujos funcionales

## 10.1. Crear tenant

### Actor principal

PlatformAdmin.

### Precondiciones

* Usuario autenticado.
* Usuario con permiso `platform.tenants.create`.
* Slug disponible.
* Datos mínimos válidos.
* `initialAdmin.email` válido.
* Identidad inicial resuelta de forma unívoca, habilitada y verificada en Keycloak.

### Flujo principal

```text id="m8ntr9"
1. PlatformAdmin envía solicitud de creación.
2. Sistema valida permisos globales.
3. Sistema valida nombre, slug y datos mínimos.
4. Sistema resuelve `initialAdmin.email` en Keycloak y obtiene el subject canónico.
5. Sistema abre una única transacción PostgreSQL.
6. Sistema crea el tenant en estado pendingSetup y sus entidades iniciales autorizadas.
7. Sistema crea o enlaza el UserProfile de la identidad verificada.
8. Sistema crea roles base y permisos del tenant mediante `002-users-roles`.
9. Sistema crea membership activa y asigna el rol TenantAdmin.
10. Sistema registra auditoría durable de todos los cambios.
11. Sistema confirma la transacción.
12. Sistema emite notificaciones posteriores al commit.
13. Sistema devuelve tenant creado.
```

### Resultado

Tenant creado correctamente.

---

## 10.2. Completar configuración inicial

### Actor principal

PlatformAdmin o TenantAdmin autorizado.

### Precondiciones

* Tenant existe.
* Tenant está en `pendingSetup` o `inactive`.
* Usuario tiene permiso `tenants.update`.

### Flujo

```text id="3idblp"
1. Usuario actualiza datos básicos.
2. Sistema valida tenant.
3. Sistema valida permisos.
4. Sistema valida datos requeridos.
5. Sistema actualiza configuración.
6. Sistema registra auditoría.
7. Sistema devuelve tenant actualizado.
```

---

## 10.3. Activar tenant

### Actor principal

PlatformAdmin.

### Precondiciones

* Tenant existe.
* Tenant no está archivado.
* Datos mínimos completos.
* Existe al menos una membership activa con rol TenantAdmin activo.
* Roles base existen.

### Flujo

```text id="5g5o1g"
1. PlatformAdmin solicita activación.
2. Sistema valida permisos.
3. Sistema valida estado actual.
4. Sistema valida configuración mínima.
5. Sistema cambia estado a active.
6. Sistema registra auditoría.
7. Sistema emite TenantActivated.
8. Sistema devuelve estado actualizado.
```

---

## 10.4. Suspender tenant

### Actor principal

PlatformAdmin.

### Precondiciones

* Tenant existe.
* Tenant está activo.
* Usuario tiene permiso `platform.tenants.suspend`.
* Se informa motivo.

### Flujo

```text id="axf7iv"
1. PlatformAdmin solicita suspensión.
2. Sistema valida permisos.
3. Sistema valida estado actual.
4. Sistema requiere motivo.
5. Sistema cambia estado a suspended.
6. Sistema registra auditoría.
7. Sistema emite TenantSuspended.
8. Sistema bloquea operaciones ordinarias.
```

---

## 10.5. Reactivar tenant

### Actor principal

PlatformAdmin.

### Precondiciones

* Tenant existe.
* Tenant está suspendido o inactivo.
* Usuario tiene permiso `platform.tenants.reactivate`.

### Flujo

```text id="zceh7b"
1. PlatformAdmin solicita reactivación.
2. Sistema valida permisos.
3. Sistema valida estado actual.
4. Sistema valida configuración mínima.
5. Sistema cambia estado a active.
6. Sistema registra auditoría.
7. Sistema emite TenantReactivated.
```

---

## 10.6. Consultar perfil público

### Actor principal

WordPress Portal o visitante público.

### Endpoint público

```text id="fm28fo"
GET /api/v1/public/tenants/{slug}
```

### Flujo

```text id="7so73r"
1. Cliente solicita tenant por slug.
2. Sistema busca tenant.
3. Sistema valida que el tenant pueda exponerse públicamente.
4. Sistema devuelve solo campos públicos.
```

### Resultado

Perfil público limitado.

---

## 10.7. Actualizar mapeo WordPress

### Actor principal

PlatformAdmin o TenantAdmin autorizado.

### Precondiciones

* Tenant existe.
* Usuario tiene permiso `tenants.wordpress.update`.

### Flujo

```text id="b7ut70"
1. Usuario envía datos de WordPress.
2. Sistema valida URL.
3. Sistema valida slug o referencia CPT si aplica.
4. Sistema actualiza mapeo.
5. Sistema registra auditoría.
```

---

## 11. Historias de usuario

### US-001 — Crear tenant

Como PlatformAdmin, quiero crear un nuevo conjunto residencial para que pueda operar dentro de RESIDENT Core.

#### Criterios de aceptación

* Dado un PlatformAdmin autorizado, cuando envía datos válidos, entonces el sistema crea el tenant.
* Dado un slug ya existente, cuando se intenta crear otro tenant con el mismo slug, entonces el sistema rechaza la operación.
* Dado un usuario sin permiso, cuando intenta crear un tenant, entonces recibe `403 Forbidden`.
* Dado un tenant creado, entonces se registra auditoría.

---

### US-002 — Activar tenant

Como PlatformAdmin, quiero activar un tenant cuando haya completado su configuración mínima.

#### Criterios de aceptación

* Dado un tenant en `pendingSetup`, cuando cumple requisitos mínimos, entonces puede activarse.
* Dado un tenant sin administrador inicial, cuando se intenta activar, entonces el sistema rechaza la activación.
* Dado un tenant activo, cuando se consulta su estado, entonces aparece como `active`.
* Dada una activación exitosa, entonces se registra auditoría.

---

### US-003 — Suspender tenant

Como PlatformAdmin, quiero suspender un tenant para bloquear temporalmente operaciones ordinarias.

#### Criterios de aceptación

* Dado un tenant activo, cuando se suspende con motivo válido, entonces cambia a `suspended`.
* Dado un tenant suspendido, cuando intenta generar alícuotas, entonces el sistema debe bloquear la operación.
* Dada una suspensión exitosa, entonces se registra auditoría.
* Dado un usuario sin permiso, entonces la suspensión es rechazada.

---

### US-004 — Reactivar tenant

Como PlatformAdmin, quiero reactivar un tenant suspendido cuando pueda volver a operar.

#### Criterios de aceptación

* Dado un tenant suspendido, cuando se reactiva con permiso válido, entonces cambia a `active`.
* Dado un tenant archivado, cuando se intenta reactivar sin proceso especial, entonces se rechaza.
* Dada una reactivación exitosa, entonces se registra auditoría.

---

### US-005 — Consultar perfil público

Como portal WordPress, quiero consultar información pública del tenant para mostrarla en el portal.

#### Criterios de aceptación

* Dado un slug válido, cuando se consulta el endpoint público, entonces devuelve información pública.
* Dado un slug inexistente, entonces devuelve `404`.
* Dado un tenant archivado, entonces no debe exponer información operativa.
* La respuesta no incluye datos personales, financieros ni auditoría.

---

### US-006 — Actualizar branding

Como TenantAdmin, quiero actualizar logo, colores y datos públicos de mi conjunto para mantener la identidad visual.

#### Criterios de aceptación

* Dado un TenantAdmin autorizado, puede actualizar branding de su tenant.
* Dado un TenantAdmin de otro tenant, no puede actualizar branding ajeno.
* Dado un cambio de branding, se registra auditoría.
* Los cambios se reflejan en el perfil público si están permitidos.

---

## 12. Requisitos funcionales

### FR-001 — Crear tenant

El sistema debe permitir crear un tenant con datos mínimos.

Datos mínimos:

```text id="jzkelu"
name
slug
timezone
currency
status
```

---

### FR-002 — Generar slug

El sistema debe poder sugerir slug desde el nombre.

---

### FR-003 — Validar slug único

El sistema debe rechazar slugs duplicados.

---

### FR-004 — Consultar tenants

El sistema debe permitir listar tenants para usuarios globales autorizados.

---

### FR-005 — Consultar tenant por ID

El sistema debe permitir consultar tenant por ID para usuarios autorizados.

---

### FR-006 — Consultar tenant por slug público

El sistema debe permitir consultar perfil público por slug.

---

### FR-007 — Actualizar tenant

El sistema debe permitir actualizar datos administrativos del tenant.

---

### FR-008 — Actualizar branding

El sistema debe permitir actualizar branding público del tenant.

---

### FR-009 — Actualizar configuración

El sistema debe permitir actualizar configuración básica.

---

### FR-010 — Suspender tenant

El sistema debe permitir suspender tenant activo.

---

### FR-011 — Reactivar tenant

El sistema debe permitir reactivar tenant suspendido o inactivo.

---

### FR-012 — Archivar tenant

El sistema debe permitir archivar tenant bajo permiso global.

---

### FR-013 — Crear roles base

El sistema debe crear roles base al onboarding del tenant.

---

### FR-014 — Asignar administrador inicial

El sistema debe resolver una identidad Keycloak verificada y crear o enlazar su
UserProfile, membership activa y rol TenantAdmin dentro de la transacción de
onboarding. Las invitaciones se reservan para accesos posteriores.

---

### FR-015 — Registrar auditoría

El sistema debe registrar auditoría de operaciones críticas.

---

### FR-016 — Emitir eventos de dominio

El sistema debe emitir eventos internos para operaciones relevantes.

---

### FR-017 — Exponer perfil público

El sistema debe exponer solo información pública autorizada.

---

### FR-018 — Bloquear operaciones de tenant suspendido

El sistema debe impedir operaciones ordinarias de tenants suspendidos.

---

## 13. Requisitos no funcionales

### NFR-001 — Seguridad

Todos los endpoints privados requieren autenticación y autorización.

---

### NFR-002 — Multitenancy

El módulo tenants define la frontera de tenant para todos los demás módulos.

---

### NFR-003 — Auditoría

Todas las operaciones críticas deben auditarse.

---

### NFR-004 — Performance

Listar tenants debe soportar paginación.

---

### NFR-005 — Disponibilidad

El perfil público del tenant debe ser liviano y apto para consumo desde WordPress.

---

### NFR-006 — Privacidad

El endpoint público no debe exponer datos personales o financieros.

---

### NFR-007 — Observabilidad

Las operaciones críticas deben generar logs estructurados y traceId.

---

### NFR-008 — Compatibilidad

El módulo debe ser compatible con Keycloak como Identity Provider objetivo.

---

## 14. Modelo de datos preliminar

### 14.1. Tenant

```text id="ub7yzq"
Tenant
├── id
├── name
├── legalName
├── slug
├── status
├── timezone
├── currency
├── planCode
├── createdAt
├── updatedAt
├── suspendedAt
├── suspendedBy
├── suspensionReason
├── archivedAt
└── archivedBy
```

---

### 14.2. TenantProfile

```text id="zogjhv"
TenantProfile
├── id
├── tenantId
├── displayName
├── slogan
├── description
├── contactEmail
├── contactPhone
├── whatsapp
├── address
├── city
├── province
├── country
├── createdAt
└── updatedAt
```

---

### 14.3. TenantBranding

```text id="k2k6kb"
TenantBranding
├── id
├── tenantId
├── logoUrl
├── bannerUrl
├── primaryColor
├── secondaryColor
├── accentColor
├── createdAt
└── updatedAt
```

---

### 14.4. TenantWordPressMapping

```text id="pd14bw"
TenantWordPressMapping
├── id
├── tenantId
├── wordpressSiteUrl
├── wordpressConjuntoSlug
├── wordpressConjuntoId
├── accessUrl
├── isActive
├── createdAt
└── updatedAt
```

---

### 14.5. TenantConfiguration

```text id="hns2jx"
TenantConfiguration
├── id
├── tenantId
├── timezone
├── currency
├── defaultLanguage
├── allowResidentSelfRegistration
├── allowOnlinePayments
├── enableReservations
├── enableFines
├── enableMeetings
├── enableNotifications
├── createdAt
└── updatedAt
```

---

## 15. Constraints preliminares

```text id="7m2lot"
unique(tenants.slug)
unique(tenant_profiles.tenant_id)
unique(tenant_branding.tenant_id)
unique(tenant_configurations.tenant_id)
unique(tenant_wordpress_mappings.tenant_id)
```

---

## 16. Índices preliminares

```text id="uat7cq"
index(tenants.slug)
index(tenants.status)
index(tenants.created_at)
index(tenant_wordpress_mappings.wordpress_conjunto_slug)
```

---

## 17. API preliminar

## 17.1. Endpoints privados de plataforma

```text id="p74z6o"
GET    /api/v1/platform/tenants
POST   /api/v1/platform/tenants
GET    /api/v1/platform/tenants/{tenantId}
PATCH  /api/v1/platform/tenants/{tenantId}
POST   /api/v1/platform/tenants/{tenantId}/activate
POST   /api/v1/platform/tenants/{tenantId}/suspend
POST   /api/v1/platform/tenants/{tenantId}/reactivate
POST   /api/v1/platform/tenants/{tenantId}/archive
```

---

## 17.2. Endpoints privados de tenant

```text id="xd470k"
GET    /api/v1/tenant/profile
PATCH  /api/v1/tenant/profile
GET    /api/v1/tenant/branding
PATCH  /api/v1/tenant/branding
GET    /api/v1/tenant/configuration
PATCH  /api/v1/tenant/configuration
PATCH  /api/v1/tenant/wordpress-mapping
```

---

## 17.3. Endpoints públicos

```text id="mjl0t3"
GET /api/v1/public/tenants/{slug}
```

---

## 18. Ejemplos de request/response

### 18.1. Crear tenant

```http id="fyt4wz"
POST /api/v1/platform/tenants
Authorization: Bearer <token>
Content-Type: application/json
```

```json id="qc5c50"
{
  "name": "Villa Club",
  "slug": "villa-club",
  "timezone": "America/Guayaquil",
  "currency": "USD",
  "profile": {
    "displayName": "Villa Club",
    "slogan": "Comunidad residencial inteligente",
    "contactEmail": "admin@villaclu.example",
    "contactPhone": "+593999999999",
    "address": "Santo Domingo, Ecuador"
  }
}
```

### 18.2. Respuesta

```json id="iv922d"
{
  "data": {
    "id": "tenant_uuid",
    "name": "Villa Club",
    "slug": "villa-club",
    "status": "pendingSetup",
    "timezone": "America/Guayaquil",
    "currency": "USD",
    "createdAt": "2026-07-12T10:00:00Z"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 18.3. Suspender tenant

```http id="f4qtd3"
POST /api/v1/platform/tenants/{tenantId}/suspend
Authorization: Bearer <token>
Content-Type: application/json
```

```json id="mcayg9"
{
  "reason": "Administrative suspension due to contract review."
}
```

---

### 18.4. Perfil público

```http id="j1ed4t"
GET /api/v1/public/tenants/villa-club
```

```json id="ac6ja1"
{
  "data": {
    "slug": "villa-club",
    "displayName": "Villa Club",
    "slogan": "Comunidad residencial inteligente",
    "logoUrl": "https://cdn.example.com/tenants/villa-club/logo.png",
    "bannerUrl": "https://cdn.example.com/tenants/villa-club/banner.png",
    "primaryColor": "#1E88E5",
    "secondaryColor": "#90CAF9",
    "contact": {
      "email": "admin@villaclu.example",
      "phone": "+593999999999",
      "whatsapp": "+593999999999",
      "address": "Santo Domingo, Ecuador"
    },
    "accessUrl": "https://app.resident.example.com/login?tenant=villa-club"
  },
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

## 19. Autenticación

### 19.1. Endpoints privados

Requieren usuario autenticado.

Durante MVP:

```text id="cepzg7"
Auth propia temporal o Keycloak, según fase.
```

Arquitectura objetivo:

```text id="cjx8g5"
Token emitido por Keycloak.
```

---

### 19.2. Endpoints públicos

`GET /api/v1/public/tenants/{slug}` no requiere autenticación.

Debe limitar datos y aplicar rate limiting.

---

## 20. Autorización

### 20.1. Permisos globales

```text id="is0r9j"
platform.tenants.create
platform.tenants.read
platform.tenants.update
platform.tenants.activate
platform.tenants.suspend
platform.tenants.reactivate
platform.tenants.archive
```

---

### 20.2. Permisos de tenant

```text id="mj7mpm"
tenants.profile.read
tenants.profile.update
tenants.branding.read
tenants.branding.update
tenants.configuration.read
tenants.configuration.update
tenants.wordpress.update
```

---

### 20.3. Reglas

* PlatformAdmin puede operar sobre todos los tenants según permisos.
* TenantAdmin solo puede operar sobre su tenant.
* WordPress solo puede consultar endpoint público.
* n8n solo podrá operar mediante service account futura con permisos limitados.
* Ningún usuario de tenant puede suspender o archivar su propio tenant.

---

## 21. Validaciones

### 21.1. Nombre

* requerido;
* longitud mínima;
* longitud máxima;
* no solo espacios.

### 21.2. Slug

* requerido o generado;
* único;
* minúsculas;
* caracteres permitidos;
* no reservado.

Slugs reservados:

```text id="hn58p2"
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
```

### 21.3. Timezone

* debe ser timezone válida;
* default: `America/Guayaquil`.

### 21.4. Currency

* debe ser moneda válida;
* default: `USD`.

### 21.5. Email

* formato válido;
* opcional en MVP.

### 21.6. Colores

* formato hexadecimal válido si se usa.

### 21.7. URLs

* formato válido;
* permitir solo HTTPS en producción;
* evitar URLs internas no autorizadas.

---

## 22. Errores

Códigos sugeridos:

```text id="p53tl4"
TENANT_NOT_FOUND
TENANT_SLUG_ALREADY_EXISTS
TENANT_INVALID_STATUS
TENANT_CANNOT_BE_ACTIVATED
TENANT_CANNOT_BE_SUSPENDED
TENANT_CANNOT_BE_REACTIVATED
TENANT_ARCHIVED
TENANT_SUSPENDED
TENANT_INVALID_SLUG
TENANT_INVALID_TIMEZONE
TENANT_INVALID_CURRENCY
TENANT_PERMISSION_DENIED
TENANT_PUBLIC_PROFILE_NOT_AVAILABLE
WORDPRESS_MAPPING_INVALID
```

Ejemplo:

```json id="mmp918"
{
  "error": {
    "code": "TENANT_SLUG_ALREADY_EXISTS",
    "message": "A tenant with this slug already exists.",
    "traceId": "req_123456"
  }
}
```

---

## 23. Auditoría

### 23.1. Eventos auditables

```text id="dlqpi2"
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
tenant.initialAdmin.invited
```

---

### 23.2. Campos mínimos

```text id="o30r2t"
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

## 24. Eventos de dominio

Eventos sugeridos:

```text id="mt9v9c"
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
TenantInitialAdminInvited
```

---

## 25. Observabilidad

### 25.1. Logs

Registrar:

* creación de tenant;
* cambio de estado;
* errores de validación;
* actualización de WordPress mapping;
* acceso a perfil público;
* intento no autorizado.

No registrar:

* tokens;
* secrets;
* datos sensibles innecesarios.

---

### 25.2. Métricas

Métricas sugeridas:

```text id="ow3uor"
tenants_created_total
tenants_activated_total
tenants_suspended_total
tenants_public_profile_requests_total
tenants_public_profile_errors_total
```

---

### 25.3. Trace

Cada operación debe incluir `traceId`.

---

## 26. Seguridad

### 26.1. Riesgos

| Riesgo                                  | Impacto |
| --------------------------------------- | ------- |
| Slug duplicado                          | Medio   |
| Exposición pública de datos sensibles   | Alto    |
| Suspensión accidental de tenant         | Alto    |
| Reactivación indebida                   | Alto    |
| TenantAdmin modifica tenant ajeno       | Crítico |
| WordPress consume datos privados        | Alto    |
| Configuración incorrecta bloquea acceso | Medio   |
| Operación sin auditoría                 | Alto    |

---

### 26.2. Controles

* permisos globales;
* permisos tenant;
* validación de recurso;
* auditoría;
* endpoint público limitado;
* rate limiting;
* validación de URL;
* pruebas multitenant;
* pruebas negativas;
* logs sanitizados.

---

## 27. Privacidad y datos

### 27.1. Datos personales

Este módulo puede almacenar datos de contacto institucional.

No debe almacenar:

* residentes;
* propietarios;
* cédulas;
* estados de cuenta;
* comprobantes;
* pagos.

---

### 27.2. Datos públicos

Pueden exponerse:

* nombre público;
* slogan;
* logo;
* banner;
* colores;
* contacto institucional;
* dirección general;
* access URL.

---

### 27.3. Datos internos

No deben exponerse públicamente:

* estado contractual;
* plan;
* configuración interna;
* flags;
* auditoría;
* IDs internos innecesarios.

---

## 28. Integración con WordPress

### 28.1. FASE 1 existente

El portal WordPress ya usa CPT `conjunto`.

Campos relevantes previos:

* logo;
* banner_principal;
* color_primario;
* color_secundario;
* slogan;
* url_residentes;
* whatsapp;
* telefono;
* email;
* direccion;
* redes;
* historia;
* misión;
* visión;
* galería.

---

### 28.2. Relación recomendada

```text id="un4ise"
WordPress CPT conjunto.slug
        ↔
RESIDENT Core tenant.slug
```

---

### 28.3. Regla

WordPress puede mostrar datos públicos, pero no puede decidir acceso privado.

---

### 28.4. Access URL

El perfil público del Core puede devolver:

```text id="8b2h3z"
https://app.resident.example.com/login?tenant=villa-club
```

o una URL configurada.

---

## 29. Integración con Keycloak

Esta spec no crea usuarios en Keycloak. La identidad del administrador inicial
debe existir, estar habilitada y tener email verificado antes del onboarding.

Regla:

```text id="djajzi"
Keycloak gestiona identidad.
RESIDENT Core gestiona tenants y membresías.
```

El backend resuelve `initialAdmin.email` en Keycloak y obtiene el `sub`; el body
no puede imponer `keycloakSubjectId`. La creación o enlace de `UserProfile`, los
roles, la membership y `TenantAdmin` pertenecen a `002-users-roles` y participan
en la misma transacción PostgreSQL que crea el tenant.

---

## 30. Integración con n8n

Eventos como `TenantCreated` o `TenantActivated` podrán disparar automatizaciones futuras.

Ejemplos:

* enviar correo de bienvenida;
* crear checklist de onboarding;
* notificar a soporte;
* preparar workflow de configuración.

Reglas:

* n8n consume APIs;
* n8n no accede directo a PostgreSQL;
* n8n no modifica tenant sin service account autorizada;
* toda acción crítica se audita.

---

## 31. Testing

### 31.1. Unit tests

Probar:

* validación de slug;
* normalización de slug;
* transición de estados;
* validación de timezone;
* validación de currency;
* validación de URL;
* reglas de activación;
* reglas de suspensión.

---

### 31.2. Integration tests

Probar:

* crear tenant con perfil;
* crear configuración inicial;
* crear branding inicial;
* crear roles base;
* auditoría;
* eventos;
* constraints;
* unicidad de slug.

---

### 31.3. API tests

Probar:

* crear tenant válido;
* crear tenant con slug duplicado;
* listar tenants;
* consultar tenant;
* actualizar tenant;
* suspender;
* reactivar;
* archivar;
* consultar perfil público.

---

### 31.4. Authorization tests

Probar:

* PlatformAdmin crea tenant;
* usuario sin permiso no crea tenant;
* TenantAdmin no crea tenant global;
* TenantAdmin actualiza solo su tenant;
* TenantAdmin no actualiza tenant ajeno;
* endpoint público no requiere token;
* endpoint privado requiere token.

---

### 31.5. Multitenancy tests

Probar:

* TenantAdmin A no modifica Tenant B.
* Branding de Tenant A no afecta Tenant B.
* Configuración de Tenant A no afecta Tenant B.
* WordPress mapping de Tenant A no afecta Tenant B.

---

### 31.6. Security tests

Probar:

* slug malicioso;
* URL no HTTPS en producción;
* intento de inyección en campos;
* payload excesivo;
* CORS;
* rate limiting endpoint público;
* no exposición de datos internos.

---

### 31.7. Contract tests

Probar contrato de:

```text id="bo1pv8"
GET /api/v1/public/tenants/{slug}
```

para WordPress.

---

## 32. Criterios de aceptación globales

La spec se considera implementada si:

* se puede crear tenant;
* se valida slug único;
* se crea configuración inicial;
* se crean roles base;
* se puede activar tenant;
* se puede suspender tenant;
* se puede reactivar tenant;
* se puede archivar tenant;
* existe endpoint público limitado;
* existe auditoría;
* existen eventos de dominio;
* existen pruebas unitarias;
* existen pruebas de integración;
* existen pruebas de autorización;
* existen pruebas multitenant;
* OpenAPI está actualizado;
* CI pasa correctamente.

---

## 33. Casos borde

| Caso                                         | Resultado esperado       |
| -------------------------------------------- | ------------------------ |
| Crear tenant sin nombre                      | 422                      |
| Crear tenant con slug duplicado              | 409                      |
| Crear tenant con slug reservado              | 422                      |
| Activar tenant sin TenantAdmin               | 409                      |
| Suspender tenant ya suspendido               | 409                      |
| Reactivar tenant activo                      | 409                      |
| Consultar tenant inexistente                 | 404                      |
| Consultar perfil público de tenant archivado | 404 o respuesta limitada |
| TenantAdmin modifica tenant ajeno            | 403/404                  |
| URL WordPress inválida                       | 422                      |
| Color inválido                               | 422                      |

---

## 34. Dependencias hacia specs futuras

Esta spec habilita:

```text id="t36j4d"
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-wordpress-integration
```

---

## 35. Archivos derivados esperados

Esta spec debe complementarse con:

```text id="n5eicj"
docs/specs/001-tenants/
├── spec.md
├── plan.md
├── tasks.md
├── data-model.md
├── api-contract.md
├── test-plan.md
└── security-notes.md
```

---

## 36. Preguntas abiertas

1. Resuelta: el MVP crea tenants mediante la API autenticada de plataforma.
2. Resuelta: el tenant permanece `pendingSetup`; la activación es posterior y explícita.
3. ¿Qué campos públicos exactos deben sincronizarse desde WordPress hacia Core o desde Core hacia WordPress?
4. ¿El branding se almacena inicialmente en Core o se sigue editando solo en WordPress?
5. ¿Se permitirá dominio personalizado por tenant en fase posterior?
6. ¿Qué política comercial aplicará para tenants suspendidos?
7. ¿Se manejarán planes SaaS desde el MVP o se difiere?
8. ¿Quién aprueba archivado de tenant?
9. ¿Qué pasa si un slug cambia después de estar vinculado a WordPress?
10. ¿Debe existir importación inicial desde los CPT actuales de WordPress?

---

## 37. Decisión inicial para MVP

Para el MVP de `001-tenants` se recomienda:

```text id="c0zj18"
- Crear tenants desde API de plataforma.
- Usar estado pendingSetup al crear.
- Crear configuración inicial por defecto.
- Crear roles base, membership y TenantAdmin en una única transacción de onboarding.
- Permitir activar solo si existe un TenantAdmin activo; una invitación no basta.
- Mantener WordPress como consumidor de datos públicos.
- Usar slug como vínculo principal con WordPress.
- No implementar planes SaaS todavía.
- No implementar dominios personalizados todavía.
- No permitir eliminación física.
```

---

## 38. Conclusión

El módulo `001-tenants` establece la base de RESIDENT Core.

Sin este módulo, no existe aislamiento multitenant, no existe frontera de datos y no existe una forma segura de operar múltiples conjuntos residenciales dentro de la misma plataforma.

Esta spec debe implementarse antes de módulos como usuarios, residentes, propiedades, alícuotas, pagos, reservas, multas y reportes.
