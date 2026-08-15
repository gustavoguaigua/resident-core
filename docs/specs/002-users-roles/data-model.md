# Data Model — Spec 002 Users, Roles, Permissions and Tenant Memberships

## 1. Información del documento

| Campo                  | Valor                                         |
| ---------------------- | --------------------------------------------- |
| Proyecto               | RESIDENT Core                                 |
| Spec ID                | 002                                           |
| Módulo                 | Users, Roles and Access Management            |
| Documento              | Data Model                                    |
| Ruta                   | `docs/specs/002-users-roles/data-model.md`    |
| Versión                | 0.1                                           |
| Estado                 | accepted                                  |
| Fecha                  | 2026-07-13                                    |
| Documento base         | `docs/specs/002-users-roles/spec.md`          |
| Plan técnico           | `docs/specs/002-users-roles/plan.md`          |
| Depende de             | `docs/specs/001-tenants/data-model.md`        |
| Base de datos          | PostgreSQL                                    |
| ORM                    | Prisma                                        |
| Estrategia multitenant | Shared database + shared schema + `tenant_id` |
| Identidad objetivo     | Keycloak                                      |
| Autorización           | RESIDENT Core                                 |

---

## 2. Propósito

Este documento define el modelo de datos para la spec `002-users-roles`.

El objetivo es establecer:

* tablas;
* columnas;
* enums;
* relaciones;
* constraints;
* índices;
* modelo Prisma preliminar;
* reglas de integridad;
* seeds iniciales;
* compatibilidad con Keycloak;
* compatibilidad con `001-tenants`;
* reglas de seguridad;
* reglas de migración.

El tenant seleccionado por la interfaz no se persiste como atributo de
`UserProfile`, membership, sesión o token. `tenantId` en este modelo representa
propiedad o alcance de datos; el tenant activo se resuelve por solicitud conforme a
ADR-004 y no requiere una tabla o columna adicional.

Este modelo implementa la base real de autorización de RESIDENT Core.

Keycloak conserva credenciales, sesiones y tokens. El modelo Core no añade tablas o
columnas para passwords, access/refresh tokens, authorization codes, JWKS o client
secrets. `keycloakSubjectId` es el vínculo estable y único; email/nombres del token son
informativos y no reemplazan ese subject ni se sincronizan implícitamente.

---

## 3. Principios del modelo

### 3.1. Keycloak autentica, Core autoriza

Keycloak será responsable de identidad técnica.

RESIDENT Core mantendrá:

* usuarios locales;
* membresías;
* roles;
* permisos;
* invitaciones;
* autorización funcional.

Regla:

```text id="kpg3wz"
Un token válido no significa que el usuario pueda ejecutar una operación de negocio.
```

---

### 3.2. Roles globales separados de roles tenant

Los roles globales aplican a la plataforma.

Los roles tenant aplican únicamente dentro de un tenant.

Regla:

```text id="vwlswz"
Un rol de Tenant A nunca otorga permisos en Tenant B.
```

---

### 3.3. Permisos asignados a roles

En MVP, los permisos no se asignan directamente a usuarios.

Flujo:

```text id="zmwmk5"
UserProfile
  ↓
UserTenantMembership
  ↓
MembershipRole
  ↓
Role
  ↓
RolePermission
  ↓
Permission
```

Para roles globales:

```text id="uwd3oc"
UserProfile
  ↓
UserGlobalRole
  ↓
Role global
  ↓
RolePermission
  ↓
Permission
```

---

### 3.4. Membresía como frontera de autorización tenant

Para operar dentro de un tenant, un usuario debe tener:

* UserProfile activo;
* Tenant activo;
* UserTenantMembership activa;
* Role asignado;
* Permission requerido.

---

### 3.5. Invitaciones seguras

Las invitaciones deben:

* expirar;
* ser de un solo uso;
* almacenar token hasheado;
* auditarse;
* no exponerse en logs.

---

### 3.6. No eliminación física normal

No se debe eliminar físicamente:

* usuarios con actividad;
* membresías;
* asignaciones históricas;
* invitaciones;
* roles del sistema;
* permisos del sistema.

Se usarán estados o eliminación lógica cuando aplique.

---

## 4. Entidades del módulo

El módulo define las siguientes entidades persistentes principales:

```text id="v66l49"
UserProfile
Role
Permission
RolePermission
UserGlobalRole
UserTenantMembership
MembershipRole
Invitation
```

Relación general:

```text id="pkyyqq"
UserProfile
├── UserGlobalRole
│   └── Role global
│       └── RolePermission
│           └── Permission
│
└── UserTenantMembership
    ├── Tenant
    └── MembershipRole
        └── Role tenant
            └── RolePermission
                └── Permission
```

---

## 5. Tabla `user_profiles`

### 5.1. Propósito

Representa el perfil local del usuario dentro de RESIDENT Core.

No reemplaza a Keycloak.

Sirve para:

* vincular identidad externa;
* asociar usuario a tenants;
* mantener estado local;
* auditar operaciones;
* calcular permisos efectivos.

---

### 5.2. Nombre físico

```text id="vr44xg"
user_profiles
```

---

### 5.3. Columnas

| Columna               | Tipo lógico | Requerido |  Default | Descripción             |
| --------------------- | ----------: | --------: | -------: | ----------------------- |
| `id`                  | UUID/string |        Sí |     uuid | Identificador interno   |
| `email`               |      string |        Sí |        — | Email normalizado       |
| `display_name`        |      string |        Sí |        — | Nombre visible          |
| `first_name`          |      string |        No |     null | Nombres                 |
| `last_name`           |      string |        No |     null | Apellidos               |
| `status`              |        enum |        Sí |  pending | Estado del usuario      |
| `user_type`           |        enum |        Sí |    human | Humano o cuenta técnica |
| `auth_provider`       |        enum |        Sí | keycloak | Proveedor de identidad  |
| `keycloak_subject_id` |      string |        No |     null | `sub` de Keycloak       |
| `created_at`          |   timestamp |        Sí |      now | Fecha de creación       |
| `updated_at`          |   timestamp |        Sí |     auto | Fecha de actualización  |
| `disabled_at`         |   timestamp |        No |     null | Fecha de desactivación  |
| `disabled_by`         | UUID/string |        No |     null | Usuario que desactivó   |
| `disabled_reason`     |        text |        No |     null | Motivo de desactivación |

---

### 5.4. Reglas

* `email` debe ser único.
* `email` debe almacenarse normalizado en lowercase.
* `keycloak_subject_id` debe ser único cuando exista.
* Un usuario `disabled` no puede operar.
* Un usuario `archived` no puede operar.
* No se guardan contraseñas en esta tabla.
* No se guardan tokens.
* No se guardan refresh tokens.

---

### 5.5. Índices

```text id="kjxi4h"
unique index user_profiles_email_unique on user_profiles(email)
unique index user_profiles_keycloak_subject_id_unique on user_profiles(keycloak_subject_id)
index user_profiles_status_idx on user_profiles(status)
index user_profiles_user_type_idx on user_profiles(user_type)
```

---

## 6. Tabla `roles`

### 6.1. Propósito

Representa roles globales o roles por tenant.

Un role agrupa permisos.

---

### 6.2. Nombre físico

```text id="wbx1d1"
roles
```

---

### 6.3. Columnas

| Columna       | Tipo lógico | Requerido | Default | Descripción                          |
| ------------- | ----------: | --------: | ------: | ------------------------------------ |
| `id`          | UUID/string |        Sí |    uuid | Identificador interno                |
| `tenant_id`   | UUID/string |        No |    null | Tenant propietario para roles tenant |
| `name`        |      string |        Sí |       — | Nombre visible                       |
| `code`        |      string |        Sí |       — | Código estable                       |
| `scope`       |        enum |        Sí |       — | `global` o `tenant`                  |
| `description` |        text |        No |    null | Descripción                          |
| `is_system`   |     boolean |        Sí |    true | Rol del sistema                      |
| `created_at`  |   timestamp |        Sí |     now | Fecha de creación                    |
| `updated_at`  |   timestamp |        Sí |    auto | Fecha de actualización               |

---

### 6.4. Reglas

* Un rol global debe tener `tenant_id = null`.
* Un rol tenant debe tener `tenant_id != null`.
* El código de rol global debe ser único globalmente.
* El código de rol tenant debe ser único por tenant.
* Los roles system no deben eliminarse físicamente.
* TenantAdmin no puede asignar roles globales.
* Un role de Tenant A no puede asignarse a una membresía de Tenant B.

---

### 6.5. Índices y unicidad

Debido a que PostgreSQL permite múltiples `NULL` en unique constraints, se recomienda manejar la unicidad de roles globales y tenant con índices parciales en SQL o validación de aplicación.

Reglas deseadas:

```text id="vkn0t3"
unique global role code where tenant_id is null
unique tenant role code per tenant where tenant_id is not null
```

Implementación conceptual:

```text id="k9ecz7"
unique(scope, code) para roles globales
unique(tenant_id, code) para roles tenant
```

Índices:

```text id="p2mn1r"
index roles_tenant_id_idx on roles(tenant_id)
index roles_scope_idx on roles(scope)
index roles_code_idx on roles(code)
```

---

## 7. Tabla `permissions`

### 7.1. Propósito

Representa permisos funcionales granulares.

Un permiso describe una capacidad concreta.

Ejemplos:

```text id="53llup"
users.invite
tenants.profile.update
payments.confirm
accountStatements.read.own
```

---

### 7.2. Nombre físico

```text id="kvy5us"
permissions
```

---

### 7.3. Columnas

| Columna       | Tipo lógico | Requerido | Default | Descripción            |
| ------------- | ----------: | --------: | ------: | ---------------------- |
| `id`          | UUID/string |        Sí |    uuid | Identificador interno  |
| `code`        |      string |        Sí |       — | Código único           |
| `module`      |      string |        Sí |       — | Módulo funcional       |
| `action`      |      string |        Sí |       — | Acción                 |
| `description` |        text |        No |    null | Descripción            |
| `is_system`   |     boolean |        Sí |    true | Permiso del sistema    |
| `created_at`  |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`  |   timestamp |        Sí |    auto | Fecha de actualización |

---

### 7.4. Reglas

* `code` debe ser único.
* `code` debe tener formato estable.
* No se deben eliminar permisos system.
* Se permite registrar permisos futuros aunque el módulo no esté activo todavía.
* La existencia de un permiso no significa que el endpoint esté implementado.

---

### 7.5. Índices

```text id="z63ijc"
unique index permissions_code_unique on permissions(code)
index permissions_module_idx on permissions(module)
index permissions_action_idx on permissions(action)
```

---

## 8. Tabla `role_permissions`

### 8.1. Propósito

Relaciona roles con permisos.

---

### 8.2. Nombre físico

```text id="6pg0al"
role_permissions
```

---

### 8.3. Columnas

| Columna         | Tipo lógico | Requerido | Default | Descripción           |
| --------------- | ----------: | --------: | ------: | --------------------- |
| `id`            | UUID/string |        Sí |    uuid | Identificador interno |
| `role_id`       | UUID/string |        Sí |       — | Rol                   |
| `permission_id` | UUID/string |        Sí |       — | Permiso               |
| `created_at`    |   timestamp |        Sí |     now | Fecha de asignación   |
| `created_by`    | UUID/string |        No |    null | Usuario que asignó    |

---

### 8.4. Reglas

* Un permiso no debe duplicarse en el mismo rol.
* Cambios deben auditarse.
* La asignación a roles system debe estar controlada.
* No se elimina permiso system sin proceso formal.

---

### 8.5. Índices

```text id="fwfvkm"
unique index role_permissions_role_permission_unique on role_permissions(role_id, permission_id)
index role_permissions_role_id_idx on role_permissions(role_id)
index role_permissions_permission_id_idx on role_permissions(permission_id)
```

---

## 9. Tabla `user_global_roles`

### 9.1. Propósito

Relaciona usuarios con roles globales.

Esta tabla separa explícitamente roles globales de membresías tenant.

---

### 9.2. Nombre físico

```text id="f22zye"
user_global_roles
```

---

### 9.3. Columnas

| Columna           | Tipo lógico | Requerido | Default | Descripción              |
| ----------------- | ----------: | --------: | ------: | ------------------------ |
| `id`              | UUID/string |        Sí |    uuid | Identificador interno    |
| `user_profile_id` | UUID/string |        Sí |       — | Usuario                  |
| `role_id`         | UUID/string |        Sí |       — | Rol global               |
| `assigned_at`     |   timestamp |        Sí |     now | Fecha de asignación      |
| `assigned_by`     | UUID/string |        No |    null | Usuario que asignó       |
| `removed_at`      |   timestamp |        No |    null | Fecha de remoción lógica |
| `removed_by`      | UUID/string |        No |    null | Usuario que removió      |

---

### 9.4. Reglas

* Solo se pueden asignar roles con `scope = global`.
* No se deben asignar roles tenant en esta tabla.
* La asignación debe auditarse.
* La remoción puede ser lógica para preservar trazabilidad.
* Para permisos efectivos globales, considerar solo asignaciones sin `removed_at`.

---

### 9.5. Índices

```text id="6ac2zp"
unique index user_global_roles_user_role_unique on user_global_roles(user_profile_id, role_id)
index user_global_roles_user_profile_id_idx on user_global_roles(user_profile_id)
index user_global_roles_role_id_idx on user_global_roles(role_id)
```

---

## 10. Tabla `user_tenant_memberships`

### 10.1. Propósito

Representa la pertenencia de un usuario a un tenant.

Es la base para autorización tenant-scoped.

---

### 10.2. Nombre físico

```text id="erflhp"
user_tenant_memberships
```

---

### 10.3. Columnas

| Columna           | Tipo lógico | Requerido | Default | Descripción            |
| ----------------- | ----------: | --------: | ------: | ---------------------- |
| `id`              | UUID/string |        Sí |    uuid | Identificador interno  |
| `user_profile_id` | UUID/string |        Sí |       — | Usuario                |
| `tenant_id`       | UUID/string |        Sí |       — | Tenant                 |
| `status`          |        enum |        Sí | invited | Estado de la membresía |
| `joined_at`       |   timestamp |        No |    null | Fecha de ingreso       |
| `invited_by`      | UUID/string |        No |    null | Usuario que invitó     |
| `revoked_at`      |   timestamp |        No |    null | Fecha de revocación    |
| `revoked_by`      | UUID/string |        No |    null | Usuario que revocó     |
| `revoked_reason`  |        text |        No |    null | Motivo de revocación   |
| `created_at`      |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`      |   timestamp |        Sí |    auto | Fecha de actualización |

---

### 10.4. Reglas

* Un usuario debe tener máximo una membresía por tenant.
* Para operar, la membresía debe estar `active`.
* Si la membresía está `revoked`, no otorga permisos.
* Si la membresía está `suspended`, no otorga permisos ordinarios.
* La membresía no debe eliminarse físicamente en operación normal.
* Toda revocación debe auditarse.

---

### 10.5. Índices

```text id="kzub1d"
unique index user_tenant_memberships_user_tenant_unique on user_tenant_memberships(user_profile_id, tenant_id)
index user_tenant_memberships_tenant_id_idx on user_tenant_memberships(tenant_id)
index user_tenant_memberships_user_profile_id_idx on user_tenant_memberships(user_profile_id)
index user_tenant_memberships_status_idx on user_tenant_memberships(status)
```

---

## 11. Tabla `membership_roles`

### 11.1. Propósito

Relaciona una membresía con roles tenant-scoped.

Permite que un usuario tenga más de un rol dentro del mismo tenant.

---

### 11.2. Nombre físico

```text id="dokmg6"
membership_roles
```

---

### 11.3. Columnas

| Columna         | Tipo lógico | Requerido | Default | Descripción           |
| --------------- | ----------: | --------: | ------: | --------------------- |
| `id`            | UUID/string |        Sí |    uuid | Identificador interno |
| `membership_id` | UUID/string |        Sí |       — | Membresía             |
| `role_id`       | UUID/string |        Sí |       — | Rol tenant            |
| `assigned_at`   |   timestamp |        Sí |     now | Fecha de asignación   |
| `assigned_by`   | UUID/string |        No |    null | Usuario que asignó    |
| `removed_at`    |   timestamp |        No |    null | Fecha de remoción     |
| `removed_by`    | UUID/string |        No |    null | Usuario que removió   |

---

### 11.4. Reglas

* Solo se pueden asignar roles con `scope = tenant`.
* El rol debe pertenecer al mismo tenant de la membresía.
* No se debe duplicar el mismo rol activo en la misma membresía.
* En MVP se puede usar unique simple sobre `(membership_id, role_id)`.
* Si se requiere historial múltiple de asignación/remoción del mismo rol, se necesitará una tabla histórica futura.
* Las remociones deben auditarse.

---

### 11.5. Índices

```text id="72bsjp"
unique index membership_roles_membership_role_unique on membership_roles(membership_id, role_id)
index membership_roles_membership_id_idx on membership_roles(membership_id)
index membership_roles_role_id_idx on membership_roles(role_id)
```

---

## 12. Tabla `invitations`

### 12.1. Propósito

Gestiona invitaciones de usuarios a tenants.

---

### 12.2. Nombre físico

```text id="4v1hz9"
invitations
```

---

### 12.3. Columnas

| Columna       | Tipo lógico | Requerido | Default | Descripción            |
| ------------- | ----------: | --------: | ------: | ---------------------- |
| `id`          | UUID/string |        Sí |    uuid | Identificador interno  |
| `tenant_id`   | UUID/string |        Sí |       — | Tenant invitante       |
| `email`       |      string |        Sí |       — | Email invitado         |
| `role_id`     | UUID/string |        Sí |       — | Rol inicial sugerido   |
| `status`      |        enum |        Sí | pending | Estado                 |
| `token_hash`  |      string |        Sí |       — | Hash del token         |
| `invited_by`  | UUID/string |        No |    null | Usuario que invitó     |
| `accepted_by` | UUID/string |        No |    null | Usuario que aceptó     |
| `expires_at`  |   timestamp |        Sí |       — | Expiración             |
| `accepted_at` |   timestamp |        No |    null | Fecha de aceptación    |
| `revoked_at`  |   timestamp |        No |    null | Fecha de revocación    |
| `revoked_by`  | UUID/string |        No |    null | Usuario que revocó     |
| `created_at`  |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`  |   timestamp |        Sí |    auto | Fecha de actualización |

---

### 12.4. Reglas

* `token_hash` es obligatorio.
* El token original nunca se almacena.
* La invitación expira.
* La invitación es de un solo uso.
* Solo invitaciones `pending` pueden aceptarse.
* Invitaciones `accepted`, `expired`, `revoked` o `cancelled` no pueden aceptarse.
* El rol de la invitación debe pertenecer al tenant.
* La invitación debe auditarse.
* No se debe revelar si el email ya existe en respuestas públicas.

---

### 12.5. Índices

```text id="4vqkts"
index invitations_tenant_id_idx on invitations(tenant_id)
index invitations_email_idx on invitations(email)
index invitations_status_idx on invitations(status)
index invitations_expires_at_idx on invitations(expires_at)
index invitations_role_id_idx on invitations(role_id)
```

---

## 13. Enums

## 13.1. `UserStatus`

Valores funcionales:

```text id="8koe8z"
active
inactive
disabled
pending
archived
```

Prisma recomendado:

```prisma id="1ec2fr"
enum UserStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  DISABLED @map("disabled")
  PENDING  @map("pending")
  ARCHIVED @map("archived")

  @@map("user_status")
}
```

---

## 13.2. `UserType`

Valores:

```text id="zl2h2y"
human
serviceAccount
```

Prisma:

```prisma id="igk75x"
enum UserType {
  HUMAN           @map("human")
  SERVICE_ACCOUNT @map("serviceAccount")

  @@map("user_type")
}
```

---

## 13.3. `AuthProvider`

Valores:

```text id="jhtsdf"
keycloak
```

Sprint 2 admite únicamente `keycloak`. Agregar otro proveedor requiere actualizar el
contrato de identidad y la decisión arquitectónica correspondiente.

Prisma:

```prisma id="ho2mk6"
enum AuthProvider {
  KEYCLOAK @map("keycloak")

  @@map("auth_provider")
}
```

---

## 13.4. `RoleScope`

Valores:

```text id="uhd3uh"
global
tenant
```

Prisma:

```prisma id="q3sbtt"
enum RoleScope {
  GLOBAL @map("global")
  TENANT @map("tenant")

  @@map("role_scope")
}
```

---

## 13.5. `MembershipStatus`

Valores:

```text id="m526ne"
active
invited
suspended
revoked
left
archived
```

Prisma:

```prisma id="jsguxy"
enum MembershipStatus {
  ACTIVE    @map("active")
  INVITED   @map("invited")
  SUSPENDED @map("suspended")
  REVOKED   @map("revoked")
  LEFT      @map("left")
  ARCHIVED  @map("archived")

  @@map("membership_status")
}
```

---

## 13.6. `InvitationStatus`

Valores:

```text id="zgc7ql"
pending
accepted
expired
revoked
cancelled
```

Prisma:

```prisma id="fvjufk"
enum InvitationStatus {
  PENDING   @map("pending")
  ACCEPTED  @map("accepted")
  EXPIRED   @map("expired")
  REVOKED   @map("revoked")
  CANCELLED @map("cancelled")

  @@map("invitation_status")
}
```

---

## 14. Modelo Prisma completo propuesto

```prisma id="df8rs8"
enum UserStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  DISABLED @map("disabled")
  PENDING  @map("pending")
  ARCHIVED @map("archived")

  @@map("user_status")
}

enum UserType {
  HUMAN           @map("human")
  SERVICE_ACCOUNT @map("serviceAccount")

  @@map("user_type")
}

enum AuthProvider {
  KEYCLOAK @map("keycloak")

  @@map("auth_provider")
}

enum RoleScope {
  GLOBAL @map("global")
  TENANT @map("tenant")

  @@map("role_scope")
}

enum MembershipStatus {
  ACTIVE    @map("active")
  INVITED   @map("invited")
  SUSPENDED @map("suspended")
  REVOKED   @map("revoked")
  LEFT      @map("left")
  ARCHIVED  @map("archived")

  @@map("membership_status")
}

enum InvitationStatus {
  PENDING   @map("pending")
  ACCEPTED  @map("accepted")
  EXPIRED   @map("expired")
  REVOKED   @map("revoked")
  CANCELLED @map("cancelled")

  @@map("invitation_status")
}
```

```prisma id="xkgqgo"
model UserProfile {
  id                String       @id @default(uuid())
  email             String       @unique
  displayName       String       @map("display_name")
  firstName         String?      @map("first_name")
  lastName          String?      @map("last_name")
  status            UserStatus   @default(PENDING)
  userType          UserType     @default(HUMAN) @map("user_type")
  authProvider      AuthProvider @default(KEYCLOAK) @map("auth_provider")
  keycloakSubjectId String?      @unique @map("keycloak_subject_id")

  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")
  disabledAt        DateTime?    @map("disabled_at")
  disabledBy        String?      @map("disabled_by")
  disabledReason    String?      @map("disabled_reason")

  memberships       UserTenantMembership[]
  globalRoles       UserGlobalRole[]

  @@index([email])
  @@index([status])
  @@index([userType])
  @@map("user_profiles")
}
```

```prisma id="l6obw0"
model Role {
  id              String           @id @default(uuid())
  tenantId        String?          @map("tenant_id")
  name            String
  code            String
  scope           RoleScope
  description     String?
  isSystem        Boolean          @default(true) @map("is_system")

  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  tenant          Tenant?          @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  permissions     RolePermission[]
  membershipRoles MembershipRole[]
  globalUsers     UserGlobalRole[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([scope])
  @@index([code])
  @@map("roles")
}
```

```prisma id="h49u47"
model Permission {
  id          String           @id @default(uuid())
  code        String           @unique
  module      String
  action      String
  description String?
  isSystem    Boolean          @default(true) @map("is_system")

  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  roles       RolePermission[]

  @@index([module])
  @@index([action])
  @@map("permissions")
}
```

```prisma id="poujhh"
model RolePermission {
  id           String     @id @default(uuid())
  roleId       String     @map("role_id")
  permissionId String     @map("permission_id")
  createdAt    DateTime   @default(now()) @map("created_at")
  createdBy    String?    @map("created_by")

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Restrict)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Restrict)

  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
  @@map("role_permissions")
}
```

```prisma id="m5wi73"
model UserGlobalRole {
  id            String      @id @default(uuid())
  userProfileId String      @map("user_profile_id")
  roleId        String      @map("role_id")
  assignedAt    DateTime    @default(now()) @map("assigned_at")
  assignedBy    String?     @map("assigned_by")
  removedAt     DateTime?   @map("removed_at")
  removedBy     String?     @map("removed_by")

  userProfile   UserProfile @relation(fields: [userProfileId], references: [id], onDelete: Restrict)
  role          Role        @relation(fields: [roleId], references: [id], onDelete: Restrict)

  @@unique([userProfileId, roleId])
  @@index([userProfileId])
  @@index([roleId])
  @@map("user_global_roles")
}
```

```prisma id="qu715u"
model UserTenantMembership {
  id            String           @id @default(uuid())
  userProfileId String           @map("user_profile_id")
  tenantId      String           @map("tenant_id")
  status        MembershipStatus @default(INVITED)

  joinedAt      DateTime?        @map("joined_at")
  invitedBy     String?          @map("invited_by")
  revokedAt     DateTime?        @map("revoked_at")
  revokedBy     String?          @map("revoked_by")
  revokedReason String?          @map("revoked_reason")

  createdAt     DateTime         @default(now()) @map("created_at")
  updatedAt     DateTime         @updatedAt @map("updated_at")

  userProfile   UserProfile      @relation(fields: [userProfileId], references: [id], onDelete: Restrict)
  tenant        Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  roles         MembershipRole[]

  @@unique([userProfileId, tenantId])
  @@index([tenantId])
  @@index([userProfileId])
  @@index([status])
  @@map("user_tenant_memberships")
}
```

```prisma id="czcdu2"
model MembershipRole {
  id           String               @id @default(uuid())
  membershipId String               @map("membership_id")
  roleId       String               @map("role_id")
  assignedAt   DateTime             @default(now()) @map("assigned_at")
  assignedBy   String?              @map("assigned_by")
  removedAt    DateTime?            @map("removed_at")
  removedBy    String?              @map("removed_by")

  membership   UserTenantMembership @relation(fields: [membershipId], references: [id], onDelete: Restrict)
  role         Role                 @relation(fields: [roleId], references: [id], onDelete: Restrict)

  @@unique([membershipId, roleId])
  @@index([membershipId])
  @@index([roleId])
  @@map("membership_roles")
}
```

```prisma id="g7sjiq"
model Invitation {
  id          String           @id @default(uuid())
  tenantId    String           @map("tenant_id")
  email       String
  roleId      String           @map("role_id")
  status      InvitationStatus @default(PENDING)
  tokenHash   String           @map("token_hash")

  invitedBy   String?          @map("invited_by")
  acceptedBy  String?          @map("accepted_by")
  expiresAt   DateTime         @map("expires_at")
  acceptedAt  DateTime?        @map("accepted_at")
  revokedAt   DateTime?        @map("revoked_at")
  revokedBy   String?          @map("revoked_by")

  createdAt   DateTime         @default(now()) @map("created_at")
  updatedAt   DateTime         @updatedAt @map("updated_at")

  tenant      Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  role        Role             @relation(fields: [roleId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([email])
  @@index([roleId])
  @@index([status])
  @@index([expiresAt])
  @@map("invitations")
}
```

---

## 15. Cambios requeridos en modelo `Tenant`

El modelo `Tenant` definido en `001-tenants` debe agregar relaciones inversas:

```prisma id="o5t5im"
model Tenant {
  // campos existentes...

  roles        Role[]
  memberships  UserTenantMembership[]
  invitations  Invitation[]
}
```

Esta modificación no cambia la semántica de `Tenant`, solo permite navegación Prisma.

---

## 16. Notas sobre constraints de roles globales

La constraint:

```prisma id="xf4z79"
@@unique([tenantId, code])
```

funciona bien para roles tenant, pero no garantiza por sí sola unicidad perfecta para roles globales en PostgreSQL cuando `tenantId` es `null`.

Por tanto, se recomienda una de estas opciones:

### Opción A — Validación en aplicación

Validar en `RoleRepository`:

```text id="srb01x"
scope = global + code único
```

y mantener `@@unique([tenantId, code])`.

### Opción B — Índice parcial SQL manual

Crear índice parcial en migración:

```sql id="uj4mit"
CREATE UNIQUE INDEX roles_global_code_unique
ON roles (code)
WHERE tenant_id IS NULL;
```

Y otro para tenant roles:

```sql id="m73uhe"
CREATE UNIQUE INDEX roles_tenant_code_unique
ON roles (tenant_id, code)
WHERE tenant_id IS NOT NULL;
```

### Decisión recomendada para MVP

```text id="mlbe2z"
Usar validación de aplicación + revisar migración.
```

Si se requiere mayor robustez en producción, agregar índices parciales manuales.

---

## 17. Reglas de `onDelete`

Todas las relaciones críticas deben usar:

```text id="dz4qmk"
onDelete: Restrict
```

Razón:

* evitar cascadas accidentales;
* preservar trazabilidad;
* proteger historial de acceso;
* proteger auditoría;
* evitar eliminar usuarios con membresías o roles.

---

## 18. Nombres de columnas

Convención:

```text id="74pex0"
TypeScript: camelCase
Database: snake_case
```

Ejemplo:

```text id="xgavt9"
keycloakSubjectId → keycloak_subject_id
userProfileId     → user_profile_id
tokenHash         → token_hash
```

---

## 19. Catálogo inicial de permisos

## 19.1. Platform permissions

```text id="ttqnel"
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
platform.users.enable
platform.roles.read
platform.roles.assign
platform.permissions.read
platform.audit.read
```

---

## 19.2. Tenant user permissions

```text id="hiiqis"
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

## 19.3. Tenant configuration permissions

```text id="bv5aui"
tenants.profile.read
tenants.profile.update
tenants.branding.read
tenants.branding.update
tenants.configuration.read
tenants.configuration.update
tenants.wordpress.update
```

---

## 19.4. Financial permissions reservados

Estos permisos pueden registrarse desde ahora, pero su uso real se validará en specs financieras.

```text id="9eq7ab"
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
accountStatements.read.own
accountStatements.export
reports.financial.read
reports.financial.export
audit.read
```

---

## 19.5. Reservations, fines and communications permissions reservados

```text id="7epy24"
reservations.create
reservations.create.own
reservations.read
reservations.read.own
reservations.approve
reservations.cancel
fines.create
fines.read
fines.approve
fines.reverse
announcements.create
announcements.read
announcements.update
notifications.send
```

---

## 20. Roles globales iniciales

### 20.1. SuperAdmin

Propósito:

* control total de plataforma.

Permisos:

```text id="dikyhj"
all platform.*
```

Uso:

* restringido;
* no para operación diaria.

---

### 20.2. PlatformAdmin

Permisos sugeridos:

```text id="d6q6r1"
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
platform.users.enable
platform.roles.read
platform.roles.assign
platform.permissions.read
platform.audit.read
```

---

### 20.3. PlatformOperator

Permisos sugeridos:

```text id="45mowz"
platform.tenants.read
platform.tenants.update
platform.users.read
platform.users.update
platform.roles.read
platform.permissions.read
```

---

### 20.4. PlatformSupport

Permisos sugeridos:

```text id="y6lfra"
platform.tenants.read
platform.users.read
platform.roles.read
```

---

### 20.5. PlatformAuditor

Permisos sugeridos:

```text id="jymsna"
platform.tenants.read
platform.users.read
platform.roles.read
platform.permissions.read
platform.audit.read
```

---

## 21. Roles tenant iniciales

### 21.1. TenantAdmin

Permisos sugeridos:

```text id="s4bn5n"
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
users.disable
users.membership.revoke
users.roles.assign
users.roles.remove
users.permissions.read
audit.read
```

---

### 21.2. Treasurer

Permisos sugeridos:

```text id="ou2qoh"
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

### 21.3. BoardMember

Permisos sugeridos:

```text id="z4i7h6"
users.read
accountStatements.read
reports.financial.read
audit.read
announcements.read
```

---

### 21.4. TenantAuditor

Permisos sugeridos:

```text id="lcv9aw"
users.read
accountStatements.read
reports.financial.read
audit.read
```

---

### 21.5. Resident

Permisos sugeridos:

```text id="fte31v"
accountStatements.read.own
payments.read.own
reservations.create.own
reservations.read.own
announcements.read
```

---

### 21.6. PropertyOwner

Permisos sugeridos:

```text id="x9ydkq"
accountStatements.read.own
payments.read.own
propertyUnits.read.own
announcements.read
```

Nota:

`propertyUnits.read.own` se activará realmente en `003-residents-properties`.

---

### 21.7. TenantStaff

Permisos sugeridos:

```text id="5ty6lb"
users.read
announcements.read
```

---

### 21.8. Guard

Permisos sugeridos:

```text id="fh0gu6"
announcements.read
visits.read
visits.register
```

Nota:

`visits.*` queda reservado para specs futuras.

---

### 21.9. ExternalAccountant

Permisos sugeridos:

```text id="y7d02e"
charges.read
payments.read
accountStatements.read
reports.financial.read
reports.financial.export
```

---

## 22. Seeds iniciales

### 22.1. Seeds de permisos

Crear todos los permisos del catálogo base.

Debe ser idempotente:

```text id="trr4j6"
si permission.code existe, no duplicar
```

---

### 22.2. Seeds de roles globales

Crear:

```text id="7go2wp"
SuperAdmin
PlatformAdmin
PlatformOperator
PlatformSupport
PlatformAuditor
```

Debe ser idempotente.

---

### 22.3. Seeds de roles tenant para tenants demo

Para cada tenant demo:

```text id="zw9ef1"
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

### 22.4. Seeds de usuario demo

Usuarios demo sugeridos:

```text id="1ab5ms"
platform.admin@example.com
tenant.admin.villa@example.com
treasurer.villa@example.com
resident.villa@example.com
auditor.villa@example.com
```

No usar datos reales.

---

### 22.5. Seeds prohibidos

No incluir:

* contraseñas reales;
* tokens reales;
* emails personales reales;
* cédulas;
* datos bancarios;
* datos de residentes reales;
* datos financieros reales.

---

## 23. Datos prohibidos en este modelo

Este módulo no debe almacenar:

```text id="l4xfp8"
passwords si Keycloak está activo
refresh tokens
access tokens
contraseñas en texto plano
cédulas de residentes
datos bancarios
comprobantes
pagos
saldos
datos médicos
biométricos
```

---

## 24. Datos sensibles

Datos personales básicos:

```text id="wi85bz"
email
firstName
lastName
displayName
membership
roles
invitation email
```

Reglas:

* no exponer usuarios de otros tenants;
* no registrar emails innecesariamente en logs;
* no usar emails reales en seeds;
* no enviar datos a IA externa;
* proteger endpoints de listado.

---

## 25. Cálculo de permisos efectivos

### 25.1. Permisos globales

Para permisos globales:

```text id="o4ipvs"
UserProfile active
  ↓
UserGlobalRole sin removedAt
  ↓
Role scope global
  ↓
RolePermission
  ↓
Permission
```

---

### 25.2. Permisos tenant-scoped

Para permisos tenant:

```text id="h04w16"
UserProfile active
  ↓
Tenant active
  ↓
UserTenantMembership active
  ↓
MembershipRole sin removedAt
  ↓
Role tenant del mismo tenant
  ↓
RolePermission
  ↓
Permission
```

---

### 25.3. Reglas de bloqueo

No se devuelven permisos operativos si:

* usuario está disabled;
* usuario está archived;
* tenant está suspended;
* tenant está archived;
* membership no está active;
* role está removido;
* permiso no existe;
* role no pertenece al tenant.

---

### 25.4. Cache futuro

El cálculo de permisos puede cachearse en Redis en una fase posterior.

Regla:

```text id="78o5dg"
Si se cachean permisos, deben invalidarse al cambiar roles, permisos o membresías.
```

---

## 26. Invitaciones

### 26.1. Token

El token original debe generarse con aleatoriedad segura.

Se almacena:

```text id="69g6u2"
token_hash
```

Nunca se almacena:

```text id="r6jqbk"
token original
```

---

### 26.2. Expiración

Default recomendado:

```text id="rmod5e"
72 horas
```

---

### 26.3. Estados

```text id="8et6va"
pending
accepted
expired
revoked
cancelled
```

---

### 26.4. Aceptación

Para aceptar:

* token válido;
* hash coincide;
* status pending;
* fecha no expirada;
* tenant activo;
* role válido;
* email válido;
* membership no revocada.

---

### 26.5. Reutilización

Una invitación aceptada no puede reutilizarse.

---

## 27. Reglas de actualización

### 27.1. UserProfile

Modificable:

```text id="zqm37h"
displayName
firstName
lastName
```

Restringido:

```text id="5g3ks5"
email
status
authProvider
keycloakSubjectId
disabledAt
disabledBy
```

---

### 27.2. Role

En MVP:

* roles system no se editan desde API pública;
* roles base se crean por seed/use case;
* roles personalizados diferidos.

---

### 27.3. Permission

En MVP:

* permissions system no se editan desde API pública;
* se crean por seed/use case;
* cambios requieren permiso global y auditoría.

---

### 27.4. Membership

Modificable mediante endpoints específicos:

* revocar;
* suspender futuro;
* asignar role;
* remover role.

No modificar directamente:

```text id="0t5d7a"
tenantId
userProfileId
createdAt
```

---

## 28. Consultas esperadas

### 28.1. Buscar usuario por email

```text id="949j86"
findUserByEmail(email)
```

### 28.2. Buscar usuario por Keycloak subject

```text id="fy2a4o"
findUserByKeycloakSubjectId(subjectId)
```

### 28.3. Listar usuarios de tenant

```text id="svt8b2"
listUsersByTenant(tenantId, query)
```

### 28.4. Obtener membership activa

```text id="7tbqxa"
findActiveMembership(userProfileId, tenantId)
```

### 28.5. Obtener permisos efectivos

```text id="qvqzc6"
getEffectivePermissions(userProfileId, tenantId)
```

### 28.6. Obtener roles globales

```text id="64gf7y"
getGlobalRoles(userProfileId)
```

---

## 29. Paginación

Listados deben soportar:

```text id="7osgi2"
page
pageSize
```

Defaults:

```text id="bdszol"
page = 1
pageSize = 20
max pageSize = 100
```

---

## 30. Filtros

### 30.1. Listar usuarios platform

Filtros:

```text id="fxc2uw"
status
userType
search
```

`search` busca en:

```text id="xa444s"
email
displayName
firstName
lastName
```

---

### 30.2. Listar usuarios tenant

Filtros:

```text id="6jkbu8"
membershipStatus
roleCode
search
```

---

### 30.3. Listar invitaciones

Filtros:

```text id="4ys66a"
status
email
expiresBefore
expiresAfter
```

---

## 31. Ordenamiento

Campos permitidos:

```text id="3qfeuv"
createdAt
email
displayName
status
```

No permitir ordenar por campos arbitrarios.

---

## 32. Performance esperada

El módulo puede crecer significativamente con tenants y usuarios.

Índices críticos:

```text id="o94fu8"
user_profiles.email
user_profiles.keycloak_subject_id
user_tenant_memberships.tenant_id
user_tenant_memberships.user_profile_id
roles.tenant_id
permissions.code
invitations.tenant_id
invitations.email
invitations.status
```

No se requiere particionamiento en MVP.

---

## 33. Seguridad de datos

### 33.1. Riesgo de cross-tenant access

Mitigación:

* queries siempre por tenant;
* membership activa;
* role tenant del mismo tenant;
* tests multitenant.

---

### 33.2. Riesgo de escalamiento de privilegios

Mitigación:

* roles globales separados;
* RoleAssignmentPolicyService;
* permisos específicos;
* auditoría.

---

### 33.3. Riesgo de invitaciones inseguras

Mitigación:

* token hash;
* expiración;
* un solo uso;
* no logs de token;
* revocación.

---

### 33.4. Riesgo de usuario desactivado

Mitigación:

* UserStatus validado en AuthGuard;
* permisos efectivos bloqueados;
* tests de autorización.

---

## 34. Migración inicial

### 34.1. Nombre sugerido

```text id="gp8gxq"
002_create_users_roles_permissions
```

---

### 34.2. Orden de creación

```text id="e0gy94"
1. Enums
2. user_profiles
3. roles
4. permissions
5. role_permissions
6. user_global_roles
7. user_tenant_memberships
8. membership_roles
9. invitations
10. indexes
11. constraints
```

---

### 34.3. Revisión manual

Antes de aplicar en staging o producción:

* verificar enums;
* verificar unique constraints;
* verificar `onDelete: Restrict`;
* verificar ausencia de cascade delete peligroso;
* verificar índices;
* verificar que `token_hash` no tenga unique si no es necesario;
* verificar que roles globales no se dupliquen;
* verificar que tenant roles no se dupliquen.

---

## 35. Tests de modelo requeridos

### 35.1. Unitarios

* UserEmail normaliza y valida.
* UserStatus bloquea disabled.
* RoleScope diferencia global/tenant.
* PermissionCode valida formato.
* MembershipStatus valida operación.
* InvitationStatus valida aceptación.
* InvitationToken hash/compare.

---

### 35.2. Integración

* Email unique.
* Keycloak subject unique.
* Permission code unique.
* RolePermission unique.
* Membership unique por user+tenant.
* MembershipRole unique.
* Invitation token hash existe.
* onDelete Restrict.
* Seeds idempotentes.

---

### 35.3. Multitenant

* Role tenant no se asigna a membership de otro tenant.
* User con rol en Tenant A no tiene permisos en Tenant B.
* Listar usuarios tenant no mezcla tenants.
* Invitación de Tenant A no crea membership en Tenant B.

---

## 36. Compatibilidad con specs futuras

Este modelo habilita:

```text id="sr59pc"
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-wordpress-integration
009-notifications
010-reservations
011-fines
012-meetings
```

Especialmente permite:

* actor auditado;
* permisos;
* roles;
* tenant activo;
* operaciones seguras;
* service accounts futuras;
* integración n8n futura.

---

## 37. Campos diferidos

No incluir todavía:

```text id="f05li7"
mfaEnabled
lastLoginAt
passwordHash si Keycloak activo
passwordResetToken
serviceAccountSecretHash
apiKeyHash
roleCustomRules JSONB
permissionConditions JSONB
approvalLimits
monetaryLimits
userPreferences JSONB
avatarUrl
phoneNumber
nationalId
```

Razón:

* no son necesarios para MVP;
* algunos pertenecen a residentes/personas;
* algunos requieren decisiones de seguridad adicionales;
* algunos pertenecen a Keycloak;
* algunos pertenecen a módulos futuros.

---

## 38. Uso de JSONB

No usar JSONB para roles/permisos en MVP.

Razón:

* se requiere autorización explícita;
* se requiere testabilidad;
* se requiere OpenAPI claro;
* se requiere trazabilidad;
* se evita autorización opaca.

JSONB podrá evaluarse luego para:

```text id="d9f3z1"
metadata
userPreferences
customRoleConditions
```

pero no para permisos base.

---

## 39. Reglas de retención

* Usuarios desactivados se conservan.
* Membresías revocadas se conservan.
* Invitaciones aceptadas/revocadas/expiradas se conservan por periodo definido.
* Role assignments pueden conservar historial mediante `removed_at`.
* Cambios críticos se auditan.
* No se elimina físicamente información de acceso sin procedimiento formal.

---

## 40. Checklist de migración

Antes de aceptar la migración:

```text id="vki5tz"
- [ ] Enums creados.
- [ ] Tabla user_profiles creada.
- [ ] Tabla roles creada.
- [ ] Tabla permissions creada.
- [ ] Tabla role_permissions creada.
- [ ] Tabla user_global_roles creada.
- [ ] Tabla user_tenant_memberships creada.
- [ ] Tabla membership_roles creada.
- [ ] Tabla invitations creada.
- [ ] Email unique.
- [ ] Keycloak subject unique.
- [ ] Permission code unique.
- [ ] RolePermission unique.
- [ ] Membership unique user+tenant.
- [ ] MembershipRole unique.
- [ ] onDelete Restrict.
- [ ] Índices creados.
- [ ] Seeds idempotentes.
- [ ] No cascade delete peligroso.
- [ ] Migración aplicada en local.
- [ ] Prisma Client generado.
```

---

## 41. Decisión final del modelo

El módulo `002-users-roles` usará ocho tablas principales:

```text id="d8ot05"
user_profiles
roles
permissions
role_permissions
user_global_roles
user_tenant_memberships
membership_roles
invitations
```

`user_profiles` representa el usuario local.

`roles` y `permissions` implementan autorización funcional.

`user_global_roles` separa roles de plataforma.

`user_tenant_memberships` y `membership_roles` implementan acceso por tenant.

`invitations` habilita onboarding seguro.

El modelo es compatible con Keycloak, pero mantiene la autorización en RESIDENT Core.

Para bootstrap, las ocho tablas no se amplían. Las constraints únicas de email,
`keycloakSubjectId`, roles y asignaciones respaldan la transacción serializable.
El primer PlatformAdmin y el grafo inicial de acceso del tenant deben escribirse
atómicamente; no se introduce una tabla de credenciales, un usuario implícito ni
un registro parcial de onboarding.

Este modelo completa el diferido de `001-tenants` y habilita la implementación segura de módulos posteriores como residentes, propiedades, alícuotas, pagos, estados de cuenta, auditoría, reportes y automatizaciones.
