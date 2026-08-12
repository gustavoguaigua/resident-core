# Spec 002 — Users, Roles, Permissions and Tenant Memberships

## 1. Información del documento

| Campo           | Valor                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                  |
| Spec ID         | 002                                                                                                                                                            |
| Módulo          | Users, Roles and Access Management                                                                                                                             |
| Documento       | Functional Specification                                                                                                                                       |
| Ruta            | `docs/specs/002-users-roles/spec.md`                                                                                                                           |
| Versión         | 0.1                                                                                                                                                            |
| Estado          | needs-review                                                                                                                                                   |
| Fecha           | 2026-07-13                                                                                                                                                     |
| Prioridad       | Alta                                                                                                                                                           |
| Depende de      | `docs/specs/001-tenants/spec.md`                                                                                                                               |
| Relacionado con | `constitution.md`, `domain-map.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-004`, `ADR-005`, `ADR-006`, `ADR-007`, `ADR-011`, `ADR-012` |

---

## 2. Propósito

El módulo `002-users-roles` define cómo RESIDENT Core administrará:

* usuarios;
* perfiles de usuario;
* relación con Keycloak;
* membresías usuario-tenant;
* roles globales;
* roles por tenant;
* permisos;
* asignación de roles;
* invitaciones;
* estado de usuarios;
* autorización funcional;
* service accounts futuras;
* auditoría de cambios de acceso.

Este módulo completa una parte fundamental diferida desde `001-tenants`: la existencia real de un `TenantAdmin`, la creación de roles base, las membresías y la matriz de permisos.

Regla central:

```text id="pb7ptk"
Keycloak autentica.
RESIDENT Core autoriza.
```

---

## 3. Objetivo funcional

Permitir que RESIDENT Core gestione de forma segura quién puede acceder a la plataforma y qué puede hacer en cada tenant.

El módulo debe permitir:

* Crear o registrar perfiles de usuario.
* Asociar usuarios autenticados con Keycloak.
* Crear membresías usuario-tenant.
* Asignar roles por tenant.
* Definir permisos funcionales.
* Consultar permisos efectivos.
* Invitar usuarios a un tenant.
* Aceptar invitaciones.
* Desactivar usuarios.
* Remover membresías.
* Cambiar roles.
* Crear roles base al crear un tenant.
* Auditar cambios de acceso.
* Proteger operaciones críticas.
* Preparar service accounts para n8n e integraciones futuras.

---

## 4. Alcance

### 4.1. Incluido en esta spec

Esta spec incluye:

* `UserProfile`.
* Integración conceptual con Keycloak mediante `keycloakSubjectId`.
* Roles globales.
* Roles por tenant.
* Permisos funcionales.
* Relación role-permission.
* Membresía usuario-tenant.
* Invitaciones a tenants.
* Estados de usuario.
* Estados de membresía.
* Estados de invitación.
* Asignación y remoción de roles.
* Consulta de usuarios por tenant.
* Consulta de permisos efectivos.
* Creación de roles base para un tenant.
* Auditoría de cambios de acceso.
* Eventos de dominio.
* Endpoints REST.
* Reglas de autorización.
* Pruebas esperadas.

---

### 4.2. No incluido en esta spec

No se incluye todavía:

* Pantalla frontend final de administración de usuarios.
* MFA completo.
* Configuración avanzada de Keycloak.
* Password management propio definitivo.
* Facturación SaaS.
* Permisos financieros avanzados por monto.
* Aprobaciones duales.
* Firma electrónica.
* Directorio corporativo externo.
* SCIM.
* SSO social.
* Usuarios residentes finales con datos completos de persona/unidad.
* Gestión completa de residentes y propietarios.

La relación profunda entre usuario, persona, residente, propietario y unidad se tratará en:

```text id="xj6m85"
docs/specs/003-residents-properties/
```

---

## 5. Contexto arquitectónico

RESIDENT Core usará Keycloak como Identity Provider objetivo.

Keycloak será responsable de:

* login;
* sesiones;
* refresh tokens;
* password reset;
* MFA;
* identidad técnica;
* emisión de tokens OIDC/OAuth2.

RESIDENT Core será responsable de:

* perfil local del usuario;
* tenants;
* membresías;
* roles funcionales;
* permisos;
* autorización por recurso;
* auditoría funcional;
* restricciones por estado;
* autorización financiera futura.

Regla:

```text id="aep28p"
Un token válido de Keycloak no es suficiente para ejecutar una operación de negocio.
```

---

## 6. Actores

### 6.1. PlatformAdmin

Usuario global con capacidad de administrar la plataforma completa.

Puede:

* crear usuarios globales;
* consultar tenants;
* asignar roles globales;
* crear o corregir membresías;
* suspender usuarios;
* auditar accesos;
* crear roles base por tenant.

---

### 6.2. PlatformOperator

Usuario global operativo con permisos limitados.

Puede:

* consultar usuarios;
* apoyar onboarding;
* revisar membresías;
* gestionar invitaciones según permisos.

---

### 6.3. PlatformSupport

Usuario global de soporte.

Puede tener permisos de solo lectura o acciones limitadas.

---

### 6.4. TenantAdmin

Administrador de un tenant específico.

Puede:

* invitar usuarios a su tenant;
* asignar roles permitidos dentro de su tenant;
* desactivar membresías dentro de su tenant;
* consultar usuarios del tenant;
* administrar perfiles básicos del tenant según permisos.

No puede:

* crear tenants globales;
* suspender tenants;
* archivar tenants;
* asignar roles globales;
* operar sobre otros tenants.

---

### 6.5. Treasurer

Usuario financiero del tenant.

Puede operar módulos financieros según permisos futuros:

* cargos;
* pagos;
* reportes financieros;
* conciliaciones.

---

### 6.6. BoardMember

Miembro de directiva del tenant.

Puede consultar información administrativa o aprobar ciertos procesos según permisos.

---

### 6.7. TenantAuditor

Usuario auditor del tenant.

Puede consultar información, reportes y auditoría según permisos.

---

### 6.8. Resident

Usuario residente.

Puede consultar información propia, estados de cuenta propios, reservas propias y comunicados.

---

### 6.9. PropertyOwner

Usuario propietario.

Puede consultar información relacionada con sus unidades.

---

### 6.10. Guard

Usuario de control o guardianía.

Puede operar funciones limitadas como acceso, visitas o comunicaciones, en specs futuras.

---

### 6.11. ExternalAccountant

Contador externo asociado a un tenant.

Puede consultar o exportar información financiera según permisos.

---

### 6.12. ServiceAccount

Identidad técnica usada por integraciones futuras como n8n.

No representa una persona natural.

Debe tener permisos mínimos y auditables.

---

## 7. Definiciones

### 7.1. UserProfile

Representación local del usuario dentro de RESIDENT Core.

No reemplaza a Keycloak.

Contiene:

* ID local;
* email;
* nombre visible;
* estado;
* proveedor de identidad;
* `keycloakSubjectId`.

---

### 7.2. Keycloak Subject ID

Identificador único del usuario en Keycloak.

En tokens OIDC corresponde normalmente al claim:

```text id="e38qvy"
sub
```

---

### 7.3. Role

Agrupación de permisos.

Puede ser:

* global;
* tenant-scoped.

---

### 7.4. Permission

Capacidad funcional específica.

Ejemplo:

```text id="jhblxl"
payments.confirm
tenants.profile.update
users.invite
```

---

### 7.5. UserTenantMembership

Relación entre un usuario y un tenant.

Define si un usuario pertenece a un conjunto y en qué estado.

---

### 7.6. MembershipRole

Asignación de uno o más roles a una membresía.

---

### 7.7. Invitation

Invitación para que una persona se una a un tenant con cierto rol.

---

### 7.8. Effective Permissions

Conjunto final de permisos calculados para un usuario en un contexto determinado.

Depende de:

* usuario;
* estado del usuario;
* tenant activo;
* estado del tenant;
* membresía;
* roles;
* permisos;
* restricciones de negocio.

---

## 8. Supuestos

1. `001-tenants` ya define tenants.
2. Keycloak será el IdP objetivo.
3. Durante MVP puede existir auth propia temporal o mock auth en desarrollo.
4. RESIDENT Core mantendrá `UserProfile`.
5. RESIDENT Core mantendrá membresías y roles por tenant.
6. Los roles base se crearán por tenant.
7. Un usuario puede pertenecer a varios tenants.
8. Un usuario puede tener roles distintos en tenants distintos.
9. Un usuario puede tener roles globales y roles tenant-scoped.
10. WordPress no administra usuarios del Core.
11. n8n usará service accounts futuras.
12. La autorización final siempre se valida en RESIDENT Core.
13. Los residentes como personas/unidades se modelarán en `003-residents-properties`.
14. La primera identidad de plataforma existe y está verificada en Keycloak antes
    de crear su perfil local.

---

## 9. Reglas de negocio

### BR-001 — Usuario local requerido

Todo usuario autenticado que interactúe con endpoints privados debe tener un `UserProfile` local en RESIDENT Core.

---

### BR-002 — Keycloak subject único

`keycloakSubjectId` debe ser único cuando exista.

Un mismo subject de Keycloak no puede mapearse a múltiples usuarios locales.

---

### BR-003 — Email único

El email debe ser único en `UserProfile`, salvo decisión futura para múltiples identity providers.

---

### BR-004 — Usuario puede pertenecer a múltiples tenants

Un usuario puede tener membresías en varios tenants.

Ejemplo:

```text id="p1l52g"
Usuario A:
- Tenant Villa Club: Treasurer
- Tenant Altos del Norte: TenantAuditor
- Tenant Jardines del Valle: sin acceso
```

---

### BR-005 — Rol por tenant

Los roles tenant-scoped se asignan dentro de un tenant.

Un rol asignado en Tenant A no otorga permisos en Tenant B.

---

### BR-006 — Permisos no se asignan directamente a usuarios en MVP

En MVP, los permisos se asignan a roles.

Los usuarios reciben permisos mediante roles.

---

### BR-007 — Roles base por tenant

Cada tenant debe tener roles base.

Roles base iniciales:

```text id="acw84e"
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

---

### BR-008 — Roles globales separados

Los roles globales no son equivalentes a roles tenant.

Roles globales iniciales:

```text id="yyk459"
SuperAdmin
PlatformAdmin
PlatformOperator
PlatformSupport
PlatformAuditor
```

---

### BR-009 — TenantAdmin no asigna roles globales

Un TenantAdmin no puede asignar roles globales.

---

### BR-010 — TenantAdmin no puede crear otro TenantAdmin sin permiso explícito

La asignación de `TenantAdmin` puede requerir permiso especial:

```text id="ua2kw6"
users.assignTenantAdmin
```

o aprobación de PlatformAdmin, según política.

Para MVP, se permite que PlatformAdmin asigne el primer TenantAdmin.

La asignación ocurre dentro de la misma transacción que crea el tenant; no se
materializa mediante una invitación ni un evento posterior.

---

### BR-011 — Membresía activa requerida

Para operar dentro de un tenant, el usuario debe tener membresía activa.

---

### BR-012 — Tenant activo requerido

Para operar ordinariamente, el tenant debe estar activo.

Si el tenant está suspendido o archivado, los permisos ordinarios quedan bloqueados.

El tenant activo es contexto por solicitud. La UI envía `X-Tenant-Id` en endpoints
tenant-scoped y Core valida identidad, tenant y membership en cada solicitud. El
header no concede acceso; no existe estado persistido ni endpoint de cambio de tenant.

---

### BR-013 — Usuario activo requerido

Un usuario desactivado no puede operar, aunque tenga roles.

---

### BR-014 — Invitación expirable

Toda invitación debe tener fecha de expiración.

Default recomendado:

```text id="omtm2j"
72 horas
```

---

### BR-015 — Invitación de un solo uso

Una invitación aceptada no debe poder reutilizarse.

---

### BR-016 — Invitación auditable

Toda invitación debe registrar:

* tenant;
* email invitado;
* rol propuesto;
* usuario que invitó;
* fecha;
* estado;
* traceId.

---

### BR-017 — Cambios de roles auditables

Toda asignación o remoción de roles debe auditarse.

---

### BR-018 — Cambios de permisos auditables

Toda modificación de permisos de un rol debe auditarse.

---

### BR-019 — Service accounts separadas de usuarios humanos

Una service account no debe confundirse con una persona.

Debe tener:

* tipo específico;
* permisos limitados;
* auditoría;
* rotación de credenciales futura.

---

### BR-020 — No autorización solo por frontend

El frontend puede ocultar botones, pero el backend siempre debe validar permisos.

---

## 10. Estados

## 10.1. UserStatus

Estados permitidos:

```text id="e9s3i4"
active
inactive
disabled
pending
archived
```

| Estado     | Descripción                              |
| ---------- | ---------------------------------------- |
| `active`   | Usuario puede operar según permisos      |
| `inactive` | Usuario existe pero no opera normalmente |
| `disabled` | Usuario bloqueado administrativamente    |
| `pending`  | Usuario creado/invitado pero no activado |
| `archived` | Usuario conservado históricamente        |

---

## 10.2. MembershipStatus

Estados permitidos:

```text id="7h9wxz"
active
invited
suspended
revoked
left
archived
```

| Estado      | Descripción              |
| ----------- | ------------------------ |
| `active`    | Membresía válida         |
| `invited`   | Pendiente de aceptación  |
| `suspended` | Membresía suspendida     |
| `revoked`   | Acceso revocado          |
| `left`      | Usuario salió del tenant |
| `archived`  | Relación histórica       |

---

## 10.3. InvitationStatus

Estados permitidos:

```text id="bklqgv"
pending
accepted
expired
revoked
cancelled
```

---

## 11. Flujos funcionales

## 11.0. Bootstrap del primer PlatformAdmin

### Actor

Operador del entorno de despliegue mediante comando interno, no HTTP.

### Flujo

```text id="bootstrap-platform-admin-flow"
1. Operador proporciona email normalizado de una identidad Keycloak existente.
2. Sistema verifica identidad habilitada, email verificado y resolución unívoca.
3. Sistema abre una transacción serializable y bloquea el bootstrap concurrente.
4. Sistema confirma que no existe PlatformAdmin global activo.
5. Sistema crea idempotentemente permisos y roles globales base.
6. Sistema crea o enlaza UserProfile por email y subject.
7. Sistema asigna el rol global PlatformAdmin.
8. Sistema registra auditoría durable y confirma la transacción.
```

No existe endpoint anónimo ni bypass permanente. Los PlatformAdmin posteriores
requieren un actor ordinario autenticado y autorizado.

---

## 11.1. Crear perfil de usuario local

### Actor

PlatformAdmin o proceso de autenticación.

### Flujo

```text id="t5zajr"
1. Usuario se autentica o es invitado.
2. Sistema valida email.
3. Sistema crea UserProfile local.
4. Si existe Keycloak, se vincula keycloakSubjectId.
5. Sistema registra auditoría.
6. Sistema devuelve perfil.
```

### Resultado

Usuario local creado.

---

## 11.2. Crear roles base para tenant

### Actor

Sistema, como parte del onboarding del tenant.

### Flujo

```text id="08f52h"
1. El onboarding de Spec 001 abre una unidad de trabajo PostgreSQL.
2. Spec 002 crea roles base para el nuevo tenant.
3. Sistema asigna permisos base a cada rol.
4. Sistema crea o enlaza el UserProfile de la identidad Keycloak verificada.
5. Sistema crea membership activa y asignación TenantAdmin.
6. Sistema registra auditoría en la misma unidad de trabajo.
7. Spec 001 confirma toda la operación y luego publica notificaciones.
```

### Resultado

Tenant queda en `pendingSetup`, con acceso inicial persistido y sin estado parcial.

---

## 11.3. Invitar usuario a tenant

### Actor

TenantAdmin o PlatformAdmin.

### Flujo

```text id="zv6fi9"
1. Actor solicita invitación.
2. Sistema valida permisos.
3. Sistema valida tenant activo.
4. Sistema valida email.
5. Sistema valida rol asignable.
6. Sistema crea invitación.
7. Sistema genera token de invitación.
8. Sistema registra auditoría.
9. Sistema emite UserInvitedToTenant.
10. Sistema envía o deja pendiente envío de notificación.
```

---

## 11.4. Aceptar invitación

### Actor

Usuario invitado.

### Flujo

```text id="l8zobz"
1. Usuario accede con token de invitación.
2. Sistema valida token.
3. Sistema valida expiración.
4. Sistema valida estado pending.
5. Usuario se autentica o crea cuenta.
6. Sistema crea o vincula UserProfile.
7. Sistema crea UserTenantMembership active.
8. Sistema asigna rol inicial.
9. Sistema marca invitación accepted.
10. Sistema registra auditoría.
11. Sistema emite TenantInvitationAccepted.
```

---

## 11.5. Asignar rol a usuario en tenant

### Actor

TenantAdmin autorizado o PlatformAdmin.

### Flujo

```text id="qj52ez"
1. Actor selecciona usuario/membresía.
2. Sistema valida tenant activo.
3. Sistema valida permisos del actor.
4. Sistema valida rol asignable.
5. Sistema asigna rol.
6. Sistema registra auditoría.
7. Sistema emite UserTenantRoleAssigned.
```

---

## 11.6. Remover rol de usuario en tenant

### Actor

TenantAdmin autorizado o PlatformAdmin.

### Flujo

```text id="2wkzba"
1. Actor solicita remover rol.
2. Sistema valida permisos.
3. Sistema valida que no deje tenant sin administrador mínimo si aplica.
4. Sistema remueve rol.
5. Sistema registra auditoría.
6. Sistema emite UserTenantRoleRemoved.
```

---

## 11.7. Revocar membresía

### Actor

TenantAdmin autorizado o PlatformAdmin.

### Flujo

```text id="3r4iwa"
1. Actor solicita revocar membresía.
2. Sistema valida permisos.
3. Sistema valida reglas mínimas.
4. Sistema cambia membership a revoked.
5. Sistema registra auditoría.
6. Sistema emite UserTenantMembershipRevoked.
```

---

## 11.8. Consultar permisos efectivos

### Actor

Sistema o usuario autenticado.

### Flujo

```text id="eccpbc"
1. Sistema identifica usuario.
2. Sistema identifica tenant activo.
3. Sistema valida usuario active.
4. Sistema valida tenant active.
5. Sistema obtiene membership active.
6. Sistema obtiene roles.
7. Sistema obtiene permisos.
8. Sistema devuelve permisos efectivos.
```

---

## 12. Historias de usuario

### US-001 — Crear usuario local

Como PlatformAdmin, quiero registrar un usuario local para que pueda recibir accesos y membresías.

#### Criterios de aceptación

* Dado un email válido, se crea UserProfile.
* Dado un email duplicado, se rechaza.
* Dado un keycloakSubjectId duplicado, se rechaza.
* Toda creación se audita.

---

### US-002 — Invitar usuario a tenant

Como TenantAdmin, quiero invitar un usuario a mi tenant para que pueda operar dentro del conjunto.

#### Criterios de aceptación

* Dado un TenantAdmin autorizado, puede invitar usuarios a su tenant.
* Dado un usuario sin permiso, no puede invitar.
* Dado un rol no asignable, la invitación se rechaza.
* La invitación expira.
* La invitación se audita.

---

### US-003 — Aceptar invitación

Como usuario invitado, quiero aceptar una invitación para acceder al conjunto residencial.

#### Criterios de aceptación

* Dado un token válido, se acepta la invitación.
* Dado un token expirado, se rechaza.
* Dado un token ya usado, se rechaza.
* Se crea membresía activa.
* Se asigna rol inicial.
* Se audita la aceptación.

---

### US-004 — Asignar rol en tenant

Como TenantAdmin autorizado, quiero asignar roles a usuarios de mi tenant para controlar sus permisos.

#### Criterios de aceptación

* Puede asignar roles permitidos.
* No puede asignar roles globales.
* No puede asignar roles en otro tenant.
* La asignación se audita.

---

### US-005 — Remover rol

Como TenantAdmin autorizado, quiero remover roles de un usuario de mi tenant.

#### Criterios de aceptación

* Puede remover roles permitidos.
* No puede remover roles de otro tenant.
* No debe dejar al tenant sin administrador si esa regla está activa.
* La remoción se audita.

---

### US-006 — Consultar usuarios del tenant

Como TenantAdmin, quiero consultar usuarios de mi tenant.

#### Criterios de aceptación

* Solo devuelve usuarios del tenant activo.
* No devuelve usuarios de otros tenants.
* Soporta paginación.
* Requiere permiso.

---

### US-007 — Consultar mis permisos

Como usuario autenticado, quiero consultar mis permisos efectivos para saber qué acciones puedo ejecutar.

#### Criterios de aceptación

* Devuelve permisos del tenant activo.
* No mezcla permisos de otro tenant.
* Si el tenant está suspendido, devuelve permisos limitados o bloqueados según política.
* Si el usuario está disabled, no devuelve permisos operativos.

---

## 13. Requisitos funcionales

### FR-001 — Crear UserProfile

El sistema debe permitir crear un perfil local de usuario.

---

### FR-002 — Vincular UserProfile con Keycloak

El sistema debe permitir guardar `keycloakSubjectId`.

---

### FR-003 — Crear roles base globales

El sistema debe soportar roles globales iniciales.

---

### FR-004 — Crear roles base por tenant

El sistema debe crear roles base para cada tenant.

---

### FR-005 — Crear permisos base

El sistema debe crear catálogo inicial de permisos.

---

### FR-006 — Asignar permisos a roles

El sistema debe permitir relacionar roles con permisos.

---

### FR-007 — Crear membresía usuario-tenant

El sistema debe permitir asociar usuario a tenant.

---

### FR-008 — Asignar rol a membresía

El sistema debe permitir asignar roles dentro de una membresía.

---

### FR-009 — Invitar usuario

El sistema debe permitir crear invitaciones por email.

---

### FR-010 — Aceptar invitación

El sistema debe permitir aceptar invitaciones válidas.

---

### FR-011 — Revocar invitación

El sistema debe permitir revocar invitaciones pendientes.

---

### FR-012 — Revocar membresía

El sistema debe permitir revocar acceso de un usuario a un tenant.

---

### FR-013 — Desactivar usuario

El sistema debe permitir desactivar usuarios.

---

### FR-014 — Consultar usuarios del tenant

El sistema debe permitir listar usuarios de un tenant.

---

### FR-015 — Consultar permisos efectivos

El sistema debe calcular permisos efectivos por usuario y tenant.

---

### FR-016 — Auditar cambios de acceso

El sistema debe auditar cambios de usuarios, roles, permisos e invitaciones.

---

### FR-017 — Proteger endpoints por permisos

Cada endpoint privado debe declarar y validar permiso requerido.

---

### FR-018 — Soportar service accounts futuras

El modelo debe distinguir usuarios humanos de cuentas técnicas.

---

## 14. Requisitos no funcionales

### NFR-001 — Seguridad

La autorización debe validarse siempre en backend.

---

### NFR-002 — Multitenancy

Los roles tenant-scoped y membresías deben estar aislados por tenant.

---

### NFR-003 — Auditoría

Cambios de acceso deben auditarse.

---

### NFR-004 — Privacidad

No exponer datos personales innecesarios.

---

### NFR-005 — Observabilidad

Operaciones críticas deben tener logs, traceId y eventos.

---

### NFR-006 — Integración Keycloak

El modelo debe ser compatible con Keycloak.

---

### NFR-007 — Pruebas

Debe tener pruebas unitarias, integración, API, autorización, multitenancy y seguridad.

---

## 15. Modelo de datos preliminar

### 15.1. UserProfile

```text id="zwii33"
UserProfile
├── id
├── email
├── displayName
├── firstName
├── lastName
├── status
├── userType
├── authProvider
├── keycloakSubjectId
├── createdAt
├── updatedAt
├── disabledAt
└── disabledBy
```

---

### 15.2. Role

```text id="zfy1da"
Role
├── id
├── tenantId nullable
├── name
├── code
├── scope
├── description
├── isSystem
├── createdAt
└── updatedAt
```

`tenantId = null` para roles globales.

`tenantId != null` para roles de tenant.

---

### 15.3. Permission

```text id="qvwnhw"
Permission
├── id
├── code
├── module
├── action
├── description
├── isSystem
├── createdAt
└── updatedAt
```

---

### 15.4. RolePermission

```text id="pf4bvx"
RolePermission
├── id
├── roleId
├── permissionId
├── createdAt
└── createdBy
```

---

### 15.5. UserTenantMembership

```text id="0y3h1h"
UserTenantMembership
├── id
├── userProfileId
├── tenantId
├── status
├── joinedAt
├── invitedBy
├── revokedAt
├── revokedBy
├── revokedReason
├── createdAt
└── updatedAt
```

---

### 15.6. MembershipRole

```text id="60ieie"
MembershipRole
├── id
├── membershipId
├── roleId
├── assignedAt
├── assignedBy
└── removedAt nullable
```

---

### 15.7. Invitation

```text id="314nvx"
Invitation
├── id
├── tenantId
├── email
├── roleId
├── status
├── tokenHash
├── invitedBy
├── acceptedBy
├── expiresAt
├── acceptedAt
├── revokedAt
├── revokedBy
├── createdAt
└── updatedAt
```

---

## 16. Roles iniciales

### 16.1. Roles globales

```text id="ja7n9w"
SuperAdmin
PlatformAdmin
PlatformOperator
PlatformSupport
PlatformAuditor
```

---

### 16.2. Roles por tenant

```text id="ss99kq"
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

---

## 17. Permisos iniciales

### 17.1. Platform permissions

```text id="2lx3kl"
platform.tenants.create
platform.tenants.read
platform.tenants.update
platform.tenants.activate
platform.tenants.suspend
platform.tenants.reactivate
platform.tenants.archive
platform.users.create
platform.users.read
platform.users.update
platform.users.disable
platform.roles.read
platform.roles.assign
platform.audit.read
```

---

### 17.2. Tenant user permissions

```text id="zub48m"
users.invite
users.read
users.update
users.disable
users.membership.revoke
users.roles.assign
users.roles.remove
users.permissions.read
```

---

### 17.3. Tenant configuration permissions

```text id="0wcfqt"
tenants.profile.read
tenants.profile.update
tenants.branding.read
tenants.branding.update
tenants.configuration.read
tenants.configuration.update
tenants.wordpress.update
```

---

### 17.4. Future financial permissions

Se registran desde ahora para preparar módulos futuros, pero podrán activarse gradualmente:

```text id="z85476"
charges.create
charges.read
charges.cancel
fees.generate
payments.register
payments.read
payments.confirm
payments.reject
payments.reverse
payments.allocate
accountStatements.read
accountStatements.export
reports.financial.read
reports.financial.export
audit.read
```

---

## 18. Matriz inicial de roles y permisos

### 18.1. TenantAdmin

Permisos iniciales:

```text id="s27bbl"
tenants.profile.read
tenants.profile.update
tenants.branding.read
tenants.branding.update
tenants.configuration.read
tenants.configuration.update
tenants.wordpress.update
users.invite
users.read
users.update
users.membership.revoke
users.roles.assign
users.roles.remove
users.permissions.read
audit.read
```

---

### 18.2. Treasurer

Permisos iniciales:

```text id="3t87cq"
users.read
charges.read
charges.create
fees.generate
payments.register
payments.read
payments.confirm
payments.reject
payments.allocate
accountStatements.read
accountStatements.export
reports.financial.read
reports.financial.export
```

---

### 18.3. BoardMember

Permisos iniciales:

```text id="2qt1db"
users.read
accountStatements.read
reports.financial.read
audit.read
```

---

### 18.4. TenantAuditor

Permisos iniciales:

```text id="7fu07s"
users.read
accountStatements.read
reports.financial.read
audit.read
```

---

### 18.5. Resident

Permisos iniciales:

```text id="p5q2u2"
accountStatements.read.own
payments.read.own
reservations.create.own
reservations.read.own
announcements.read
```

---

### 18.6. PropertyOwner

Permisos iniciales:

```text id="23v3us"
accountStatements.read.own
payments.read.own
propertyUnits.read.own
announcements.read
```

---

### 18.7. Guard

Permisos iniciales:

```text id="i8vp8v"
announcements.read
visits.read
visits.register
```

---

### 18.8. ExternalAccountant

Permisos iniciales:

```text id="y13h3l"
charges.read
payments.read
accountStatements.read
reports.financial.read
reports.financial.export
```

---

## 19. API preliminar

### 19.1. Platform Users API

```text id="dojewm"
GET    /api/v1/platform/users
POST   /api/v1/platform/users
GET    /api/v1/platform/users/{userId}
PATCH  /api/v1/platform/users/{userId}
POST   /api/v1/platform/users/{userId}/disable
POST   /api/v1/platform/users/{userId}/enable
```

---

### 19.2. Platform Roles API

```text id="jwud0m"
GET    /api/v1/platform/roles
GET    /api/v1/platform/permissions
POST   /api/v1/platform/users/{userId}/global-roles
DELETE /api/v1/platform/users/{userId}/global-roles/{roleId}
```

---

### 19.3. Tenant Users API

```text id="ex6dc4"
GET    /api/v1/tenant/users
POST   /api/v1/tenant/invitations
GET    /api/v1/tenant/invitations
POST   /api/v1/tenant/invitations/{invitationId}/revoke
POST   /api/v1/tenant/memberships/{membershipId}/roles
DELETE /api/v1/tenant/memberships/{membershipId}/roles/{roleId}
POST   /api/v1/tenant/memberships/{membershipId}/revoke
```

---

### 19.4. Current User API

```text id="hwe4bg"
GET /api/v1/me
GET /api/v1/me/tenants
GET /api/v1/me/permissions
```

`GET /api/v1/me/permissions` es tenant-scoped y exige `X-Tenant-Id`. `/me` y
`/me/tenants` descubren el contexto disponible y no cambian estado en el servidor.

---

### 19.5. Invitation Public API

```text id="sk2uhg"
GET  /api/v1/invitations/{token}
POST /api/v1/invitations/{token}/accept
```

---

## 20. Autenticación

### 20.1. Endpoints privados

Requieren:

```text id="styyby"
Authorization: Bearer <access_token>
```

---

### 20.2. Endpoints de invitación

Pueden ser públicos parcialmente, pero deben validar token seguro.

No deben revelar si un email pertenece o no a la plataforma.

---

## 21. Autorización

### 21.1. Reglas

Cada endpoint debe declarar permiso requerido.

Ejemplo:

```text id="mjtd1r"
POST /api/v1/tenant/invitations
permission: users.invite
```

---

### 21.2. Evaluación de autorización

El sistema debe evaluar:

```text id="0hbr67"
1. Token válido.
2. UserProfile activo.
3. Tenant activo si aplica.
4. Membership activa si aplica.
5. Rol asignado.
6. Permiso requerido.
7. Recurso pertenece al tenant.
8. Restricción de estado.
9. Auditoría si aplica.
```

---

## 22. Auditoría

### 22.1. Eventos auditables

```text id="q3dfl9"
user.created
user.updated
user.disabled
user.enabled
user.keycloakLinked
role.created
role.updated
role.permissionAssigned
role.permissionRemoved
membership.created
membership.revoked
membership.suspended
membership.roleAssigned
membership.roleRemoved
invitation.created
invitation.accepted
invitation.revoked
invitation.expired
permissions.effectiveRead
```

---

### 22.2. Campos mínimos

```text id="zj1rvj"
tenantId nullable
actorUserId
targetUserId
action
resourceType
resourceId
oldValue
newValue
result
traceId
occurredAt
```

---

## 23. Eventos de dominio

Eventos sugeridos:

```text id="joet9g"
UserProfileCreated
UserProfileUpdated
UserProfileDisabled
UserProfileEnabled
UserLinkedToKeycloak
TenantBaseRolesCreated
UserInvitedToTenant
TenantInvitationAccepted
TenantInvitationRevoked
UserTenantMembershipCreated
UserTenantMembershipRevoked
UserTenantRoleAssigned
UserTenantRoleRemoved
RolePermissionAssigned
RolePermissionRemoved
```

---

## 24. Seguridad

### 24.1. Riesgos principales

| Riesgo                                     | Impacto |
| ------------------------------------------ | ------- |
| Usuario opera en tenant ajeno              | Crítico |
| Token válido usado como autorización total | Crítico |
| TenantAdmin asigna rol global              | Alto    |
| Invitación reutilizada                     | Alto    |
| Invitación no expira                       | Alto    |
| Permisos excesivos                         | Alto    |
| Usuario disabled sigue operando            | Crítico |
| Roles de un tenant aplican en otro tenant  | Crítico |
| Service account con permisos excesivos     | Alto    |
| Logs con tokens o invitaciones             | Alto    |

---

### 24.2. Controles

* Validar membership.
* Validar tenant activo.
* Validar usuario activo.
* Validar permisos.
* Separar roles globales y tenant.
* Hashear tokens de invitación.
* Expirar invitaciones.
* Auditar cambios.
* Tests multitenant.
* Tests de autorización.
* No registrar tokens.

---

## 25. Privacidad

Este módulo puede contener datos personales básicos:

* email;
* nombre;
* apellido;
* estado de usuario;
* membresía;
* roles.

Reglas:

* no exponer emails innecesariamente;
* no exponer usuarios de otros tenants;
* no registrar datos personales completos en logs;
* no usar datos reales en seeds;
* no enviar datos personales a IA externa.

---

## 26. Integración con `001-tenants`

Este módulo debe completar los diferidos de `001-tenants`:

```text id="pl7z0a"
- TenantBaseRolesPort tendrá implementación real.
- Se podrá crear TenantAdmin inicial.
- Se podrá validar activación de tenant con admin.
- Se podrán validar memberships.
- TenantGuard podrá consultar membresías reales.
```

---

## 27. Integración con Keycloak

### 27.1. Reglas

* `UserProfile.keycloakSubjectId` vincula Core con Keycloak.
* Core no guarda contraseñas si Keycloak está activo.
* Core valida token y busca UserProfile local.
* Core no confía en permisos finos dentro del token.
* Core calcula permisos efectivos.

---

### 27.2. Claims esperados

```text id="dxipnt"
sub
email
preferred_username
name
iss
aud
exp
iat
```

---

### 27.3. Claims no recomendados para autorización final

```text id="33dfxi"
tenant permissions
financial permissions
balances
sensitive tenant data
```

---

## 28. Integración con n8n

Esta spec prepara service accounts futuras.

Reglas:

* n8n usará cuenta técnica;
* permisos mínimos;
* tenant explícito;
* auditoría;
* rotación de credenciales futura;
* no acceso directo a PostgreSQL.

La implementación completa puede quedar diferida a una spec de integraciones.

---

## 29. Testing

### 29.1. Unit tests

Probar:

* estados de usuario;
* estados de membresía;
* estados de invitación;
* cálculo de permisos;
* validación de email;
* expiración de invitaciones;
* hash de token de invitación;
* roles globales vs tenant.

---

### 29.2. Integration tests

Probar:

* crear usuario;
* vincular Keycloak subject;
* crear roles base;
* asignar permisos;
* crear membresía;
* asignar rol;
* crear invitación;
* aceptar invitación;
* revocar membresía.

---

### 29.3. API tests

Probar:

* listar usuarios platform;
* crear usuario;
* invitar usuario;
* aceptar invitación;
* asignar rol;
* remover rol;
* consultar mis tenants;
* consultar mis permisos.

---

### 29.4. Authorization tests

Probar:

* sin token;
* token inválido;
* usuario disabled;
* usuario sin membership;
* usuario de otro tenant;
* usuario sin permiso;
* TenantAdmin asignando rol no permitido;
* TenantAdmin intentando rol global;
* PlatformAdmin asignando rol global.

---

### 29.5. Multitenancy tests

Probar:

* usuario con rol en Tenant A no tiene permiso en Tenant B;
* usuario con roles distintos por tenant recibe permisos distintos;
* TenantAdmin A no lista usuarios de Tenant B;
* invitación de Tenant A no crea membresía en Tenant B;
* auditoría registra tenant correcto.

---

### 29.6. Security tests

Probar:

* invitación expirada;
* invitación reutilizada;
* token de invitación inválido;
* token de invitación no aparece en logs;
* email enumeration controlado;
* permisos efectivos no mezclan tenants;
* usuario disabled bloqueado.

---

## 30. Criterios de aceptación globales

La spec se considera implementada si:

* existen UserProfile, Role, Permission, RolePermission, UserTenantMembership, MembershipRole e Invitation;
* se crean roles base por tenant;
* se crean permisos base;
* se puede invitar usuario a tenant;
* se puede aceptar invitación;
* se puede asignar rol a membresía;
* se puede remover rol;
* se puede revocar membresía;
* se puede consultar permisos efectivos;
* usuario activo con membership activa puede operar según permisos;
* usuario sin permiso recibe 403;
* usuario de otro tenant no puede operar;
* usuario disabled no puede operar;
* los cambios críticos se auditan;
* las pruebas unitarias pasan;
* las pruebas integración pasan;
* las pruebas autorización pasan;
* las pruebas multitenant pasan;
* OpenAPI está actualizado;
* CI pasa.

---

## 31. Casos borde

| Caso                                          | Resultado esperado     |
| --------------------------------------------- | ---------------------- |
| Crear usuario con email duplicado             | 409                    |
| Crear usuario con keycloakSubjectId duplicado | 409                    |
| Invitar email inválido                        | 422                    |
| Invitar usuario a tenant suspendido           | 403/409                |
| Aceptar invitación expirada                   | 409                    |
| Aceptar invitación revocada                   | 409                    |
| Aceptar invitación ya usada                   | 409                    |
| Asignar rol global desde TenantAdmin          | 403                    |
| Asignar rol de Tenant A en Tenant B           | 403/422                |
| Revocar última membresía TenantAdmin          | 409 si regla activa    |
| Usuario disabled consulta permisos            | 403                    |
| Usuario sin membership cambia tenant          | 403                    |
| Token Keycloak válido sin UserProfile         | 403/404 según política |
| Service account sin scope                     | 403                    |

---

## 32. Dependencias hacia specs futuras

Esta spec habilita:

```text id="dfh3ni"
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-wordpress-integration
009-notifications
```

Especialmente habilita:

* identificar quién ejecuta una operación;
* validar permisos;
* asociar usuarios con tenants;
* proteger módulos financieros futuros.

---

## 33. Archivos derivados esperados

Esta spec debe complementarse con:

```text id="ieox11"
docs/specs/002-users-roles/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 34. Preguntas abiertas

1. ¿Se implementará Keycloak desde esta spec o se permitirá mock/auth temporal hasta terminar usuarios?
2. ¿Quién puede asignar un segundo TenantAdmin?
3. ¿Debe existir aprobación dual para asignar Treasurer?
4. ¿Resident y PropertyOwner se asignan aquí o después de `003-residents-properties`?
5. ¿Las invitaciones enviarán email desde el MVP o quedarán como token generado?
6. ¿Se permitirá múltiples roles por membresía desde MVP?
7. ¿Se permitirá crear roles personalizados por tenant desde MVP?
8. ¿Se permitirá desactivar usuario globalmente desde TenantAdmin o solo revocar membresía?
9. ¿Cómo se manejará un usuario que cambia de email en Keycloak?
10. ¿Se usará service account desde esta spec o se difiere a integración n8n?

---

## 35. Decisión inicial para MVP

Para el MVP de `002-users-roles`, se recomienda:

```text id="0vc8dh"
- Crear UserProfile local.
- Preparar keycloakSubjectId.
- Crear roles base globales.
- Crear roles base por tenant.
- Crear permisos base.
- Permitir múltiples roles por membresía.
- Implementar invitaciones con token hash y expiración.
- Implementar aceptación de invitación.
- Implementar permisos efectivos.
- No implementar roles personalizados todavía.
- No implementar service accounts completas todavía.
- No implementar MFA aquí.
- No guardar contraseñas si Keycloak ya está activo.
- Mantener autorización en Core.
- Crear el primer PlatformAdmin solo mediante comando operativo one-shot.
- Resolver identities iniciales en Keycloak antes de cualquier escritura Core.
- Crear el acceso inicial del tenant en la misma transacción que el tenant.
- No aceptar invitación pendiente como TenantAdmin para activar un tenant.
```

---

## 36. Conclusión

El módulo `002-users-roles` es la base de autorización funcional de RESIDENT Core.

Mientras `001-tenants` define la frontera de aislamiento, `002-users-roles` define quién puede cruzar esa frontera y qué puede hacer dentro de ella.

Este módulo debe implementarse antes de módulos financieros o de residentes, porque todos los procesos posteriores requieren identidad, membresía, roles, permisos y auditoría de actor.
