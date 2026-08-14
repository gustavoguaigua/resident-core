# Plan — Spec 002 Users, Roles, Permissions and Tenant Memberships

## 1. Información del documento

| Campo                  | Valor                                         |
| ---------------------- | --------------------------------------------- |
| Proyecto               | RESIDENT Core                                 |
| Spec ID                | 002                                           |
| Módulo                 | Users, Roles and Access Management            |
| Documento              | Implementation Plan                           |
| Ruta                   | `docs/specs/002-users-roles/plan.md`          |
| Versión                | 0.1                                           |
| Estado                 | needs-review                                  |
| Fecha                  | 2026-07-13                                    |
| Documento base         | `docs/specs/002-users-roles/spec.md`          |
| Depende de             | `docs/specs/001-tenants/`                     |
| Arquitectura           | Monolito modular NestJS                       |
| Base de datos          | PostgreSQL + Prisma                           |
| Autenticación objetivo | Keycloak OIDC/OAuth2                          |
| Autorización           | RESIDENT Core tenant-aware RBAC + permissions |

---

## 2. Propósito

Este documento transforma la especificación funcional `002-users-roles/spec.md` en un plan técnico de implementación.

El objetivo es definir cómo implementar:

* perfiles locales de usuario;
* integración con Keycloak;
* roles globales;
* roles por tenant;
* permisos;
* asignación de permisos a roles;
* membresías usuario-tenant;
* roles por membresía;
* invitaciones;
* cálculo de permisos efectivos;
* guards de autorización;
* auditoría;
* eventos;
* pruebas;
* integración con `001-tenants`.

Este plan debe ser usado por desarrolladores humanos y agentes IA como guía obligatoria para implementar el módulo `Users, Roles and Access Management`.

---

## 3. Resumen de la implementación

El módulo `002-users-roles` será el segundo módulo funcional de RESIDENT Core.

Su función principal es habilitar la autorización funcional del sistema.

Mientras `001-tenants` define la frontera de aislamiento, `002-users-roles` define:

```text id="hjqtbs"
quién accede
a qué tenant accede
con qué rol accede
qué permisos tiene
qué operaciones puede ejecutar
```

La implementación inicial incluirá:

```text id="50xgqp"
- UserProfile.
- Role.
- Permission.
- RolePermission.
- UserTenantMembership.
- MembershipRole.
- Invitation.
- Roles globales base.
- Roles tenant base.
- Permisos base.
- Creación de roles base por tenant.
- Invitación de usuarios.
- Aceptación de invitaciones.
- Asignación/remoción de roles.
- Revocación de membresías.
- Cálculo de permisos efectivos.
- Guards de autorización.
- Auditoría.
- Eventos.
- Tests unitarios, integración, API, autorización, multitenancy y seguridad.
```

---

## 4. Decisiones técnicas aplicables

Este módulo debe respetar:

```text id="d9h4us"
ADR-001 — Architecture Style
ADR-002 — Backend Framework
ADR-003 — Database Strategy
ADR-004 — Multitenancy Strategy
ADR-005 — Authentication Strategy
ADR-006 — Identity Provider Strategy
ADR-007 — Authorization Strategy
ADR-009 — Deployment Strategy
ADR-010 — Observability Strategy
ADR-011 — Testing Strategy
ADR-012 — CI/CD Strategy
```

Reglas clave:

* Keycloak autentica.
* RESIDENT Core autoriza.
* Un token válido no equivale a permiso de negocio.
* Todo acceso tenant-scoped requiere membresía activa.
* Los roles globales y tenant-scoped deben estar separados.
* Los permisos se asignan a roles, no directamente a usuarios en MVP.
* La autorización final se evalúa en backend.
* Cambios de acceso deben auditarse.
* Los tokens de invitación no se almacenan en claro.
* No usar datos reales en seeds o pruebas.
* No exponer usuarios de otros tenants.
* No implementar módulos financieros en esta spec.

---

## 5. Alcance técnico de la primera implementación

### 5.1. Incluido

La primera implementación debe cubrir:

* modelos Prisma;
* migraciones;
* seeds de roles y permisos base;
* entidades de dominio;
* value objects;
* DTOs;
* repositorios;
* casos de uso;
* servicios de aplicación;
* controladores REST;
* guards;
* decorators de permisos;
* cálculo de permisos efectivos;
* invitaciones con token hash;
* auditoría;
* eventos;
* tests;
* OpenAPI.

---

### 5.2. Diferido

No se implementará todavía:

* frontend final;
* roles personalizados por tenant;
* editor visual de permisos;
* MFA completo;
* SCIM;
* directorio corporativo externo;
* OAuth social;
* service accounts completas para n8n;
* políticas financieras por monto;
* aprobaciones duales;
* permisos ABAC complejos;
* relación completa usuario-persona-unidad;
* residentes/propietarios como entidades funcionales completas.

---

## 6. Estructura de carpetas recomendada

```text id="y6ryv7"
apps/api/src/modules/users-roles/
├── users-roles.module.ts
│
├── platform-users.controller.ts
├── platform-roles.controller.ts
├── tenant-users.controller.ts
├── current-user.controller.ts
├── invitations.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-user-profile.use-case.ts
│   │   ├── update-user-profile.use-case.ts
│   │   ├── disable-user-profile.use-case.ts
│   │   ├── enable-user-profile.use-case.ts
│   │   ├── link-user-to-keycloak.use-case.ts
│   │   ├── create-base-permissions.use-case.ts
│   │   ├── create-global-roles.use-case.ts
│   │   ├── create-tenant-base-roles.use-case.ts
│   │   ├── list-platform-users.use-case.ts
│   │   ├── get-platform-user.use-case.ts
│   │   ├── list-tenant-users.use-case.ts
│   │   ├── invite-user-to-tenant.use-case.ts
│   │   ├── accept-tenant-invitation.use-case.ts
│   │   ├── revoke-tenant-invitation.use-case.ts
│   │   ├── assign-role-to-membership.use-case.ts
│   │   ├── remove-role-from-membership.use-case.ts
│   │   ├── revoke-membership.use-case.ts
│   │   ├── get-current-user.use-case.ts
│   │   ├── get-current-user-tenants.use-case.ts
│   │   ├── resolve-tenant-context.use-case.ts
│   │   └── get-effective-permissions.use-case.ts
│   │
│   ├── services/
│   │   ├── effective-permissions.service.ts
│   │   ├── invitation-token.service.ts
│   │   ├── invitation-policy.service.ts
│   │   ├── role-assignment-policy.service.ts
│   │   ├── membership-policy.service.ts
│   │   ├── base-roles.service.ts
│   │   └── keycloak-user-linking.service.ts
│   │
│   └── ports/
│       ├── user-profile.repository.ts
│       ├── role.repository.ts
│       ├── permission.repository.ts
│       ├── membership.repository.ts
│       ├── invitation.repository.ts
│       ├── users-roles-audit.port.ts
│       ├── users-roles-events.port.ts
│       ├── passwordless-invitation-mail.port.ts
│       └── keycloak-user.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── user-profile.entity.ts
│   │   ├── role.entity.ts
│   │   ├── permission.entity.ts
│   │   ├── role-permission.entity.ts
│   │   ├── user-tenant-membership.entity.ts
│   │   ├── membership-role.entity.ts
│   │   └── invitation.entity.ts
│   │
│   ├── value-objects/
│   │   ├── user-email.vo.ts
│   │   ├── user-status.vo.ts
│   │   ├── user-type.vo.ts
│   │   ├── auth-provider.vo.ts
│   │   ├── role-code.vo.ts
│   │   ├── role-scope.vo.ts
│   │   ├── permission-code.vo.ts
│   │   ├── membership-status.vo.ts
│   │   ├── invitation-status.vo.ts
│   │   └── invitation-token.vo.ts
│   │
│   ├── events/
│   │   ├── user-profile-created.event.ts
│   │   ├── user-profile-updated.event.ts
│   │   ├── user-profile-disabled.event.ts
│   │   ├── user-profile-enabled.event.ts
│   │   ├── user-linked-to-keycloak.event.ts
│   │   ├── tenant-base-roles-created.event.ts
│   │   ├── user-invited-to-tenant.event.ts
│   │   ├── tenant-invitation-accepted.event.ts
│   │   ├── tenant-invitation-revoked.event.ts
│   │   ├── user-tenant-membership-created.event.ts
│   │   ├── user-tenant-membership-revoked.event.ts
│   │   ├── user-tenant-role-assigned.event.ts
│   │   ├── user-tenant-role-removed.event.ts
│   │   ├── role-permission-assigned.event.ts
│   │   └── role-permission-removed.event.ts
│   │
│   └── errors/
│       ├── user-profile-not-found.error.ts
│       ├── user-email-already-exists.error.ts
│       ├── keycloak-subject-already-linked.error.ts
│       ├── role-not-found.error.ts
│       ├── permission-not-found.error.ts
│       ├── membership-not-found.error.ts
│       ├── membership-not-active.error.ts
│       ├── invitation-not-found.error.ts
│       ├── invitation-expired.error.ts
│       ├── invitation-already-used.error.ts
│       ├── invitation-revoked.error.ts
│       ├── role-assignment-not-allowed.error.ts
│       ├── permission-denied.error.ts
│       └── user-disabled.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-user-profile.repository.ts
│   │   ├── prisma-role.repository.ts
│   │   ├── prisma-permission.repository.ts
│   │   ├── prisma-membership.repository.ts
│   │   ├── prisma-invitation.repository.ts
│   │   └── users-roles.mapper.ts
│   │
│   ├── audit/
│   │   └── users-roles-audit.adapter.ts
│   │
│   ├── events/
│   │   └── users-roles-events.adapter.ts
│   │
│   ├── identity/
│   │   └── keycloak-user.adapter.ts
│   │
│   └── mail/
│       └── invitation-mail.adapter.ts
│
├── guards/
│   ├── auth.guard.ts
│   ├── platform-permission.guard.ts
│   ├── tenant.guard.ts
│   ├── tenant-permission.guard.ts
│   ├── global-role.guard.ts
│   └── service-account.guard.ts
│
├── decorators/
│   ├── current-user.decorator.ts
│   ├── current-tenant.decorator.ts
│   ├── require-permission.decorator.ts
│   ├── require-platform-permission.decorator.ts
│   └── require-tenant-permission.decorator.ts
│
├── dto/
│   ├── create-user-profile.dto.ts
│   ├── update-user-profile.dto.ts
│   ├── disable-user-profile.dto.ts
│   ├── invite-user-to-tenant.dto.ts
│   ├── accept-invitation.dto.ts
│   ├── assign-role.dto.ts
│   ├── revoke-membership.dto.ts
│   ├── user-profile-response.dto.ts
│   ├── tenant-user-response.dto.ts
│   ├── membership-response.dto.ts
│   ├── role-response.dto.ts
│   ├── permission-response.dto.ts
│   ├── invitation-response.dto.ts
│   └── effective-permissions-response.dto.ts
│
└── tests/
    ├── unit/
    ├── application/
    ├── integration/
    ├── api/
    ├── authorization/
    ├── multitenancy/
    ├── security/
    └── contract/
```

---

## 7. Documentación esperada

```text id="8v1cyx"
docs/specs/002-users-roles/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="2d1i5c"
plan.md
```

---

## 8. Diseño de dominio

## 8.1. UserProfile

Responsabilidad:

* representar el usuario local en RESIDENT Core;
* vincular identidad externa;
* controlar estado operativo;
* distinguir usuario humano de cuenta técnica futura;
* no guardar contraseñas cuando Keycloak esté activo.

Campos:

```text id="w8jaz4"
id
email
displayName
firstName
lastName
status
userType
authProvider
keycloakSubjectId
createdAt
updatedAt
disabledAt
disabledBy
```

Métodos sugeridos:

```text id="qvkn7y"
activate()
disable(actorId)
enable(actorId)
archive(actorId)
linkToKeycloak(subjectId)
isActive()
isDisabled()
canAuthenticate()
```

---

## 8.2. Role

Responsabilidad:

* agrupar permisos;
* distinguir scope global o tenant;
* soportar roles base del sistema;
* preparar roles personalizados futuros.

Campos:

```text id="lxt2bg"
id
tenantId nullable
name
code
scope
description
isSystem
createdAt
updatedAt
```

Scopes:

```text id="f72qae"
global
tenant
```

Reglas:

* role global tiene `tenantId = null`;
* role tenant tiene `tenantId != null`;
* `code` debe ser único por scope y tenant;
* roles system no deben eliminarse en MVP.

---

## 8.3. Permission

Responsabilidad:

* representar capacidad funcional granular;
* ser asignable a roles;
* no depender de usuarios directamente en MVP.

Campos:

```text id="v8awp5"
id
code
module
action
description
isSystem
createdAt
updatedAt
```

Ejemplos:

```text id="n7f9f8"
users.invite
tenants.profile.update
payments.confirm
```

---

## 8.4. RolePermission

Responsabilidad:

* asignar permisos a roles.

Campos:

```text id="o88hou"
id
roleId
permissionId
createdAt
createdBy
```

Reglas:

* no duplicar permiso en el mismo rol;
* auditar cambios;
* no permitir modificar roles system críticos sin permiso global.

---

## 8.5. UserTenantMembership

Responsabilidad:

* representar pertenencia de un usuario a un tenant;
* controlar estado de acceso;
* ser base para roles tenant-scoped.

Campos:

```text id="vffrsk"
id
userProfileId
tenantId
status
joinedAt
invitedBy
revokedAt
revokedBy
revokedReason
createdAt
updatedAt
```

Reglas:

* un usuario puede tener una sola membresía activa por tenant;
* un usuario puede pertenecer a varios tenants;
* membresía `active` requerida para operar;
* no eliminar físicamente membresías críticas.

---

## 8.6. MembershipRole

Responsabilidad:

* asignar roles a una membresía.

Campos:

```text id="r7gmoi"
id
membershipId
roleId
assignedAt
assignedBy
removedAt
removedBy
```

Reglas:

* permite múltiples roles por membresía;
* no asignar role de otro tenant;
* no asignar role global como membership role;
* remoción debe ser lógica si se quiere conservar trazabilidad.

---

## 8.7. Invitation

Responsabilidad:

* permitir invitar usuarios a un tenant;
* almacenar token hasheado;
* controlar expiración;
* controlar aceptación/revocación.

Campos:

```text id="3jxa15"
id
tenantId
email
roleId
status
tokenHash
invitedBy
acceptedBy
expiresAt
acceptedAt
revokedAt
revokedBy
createdAt
updatedAt
```

Reglas:

* token no se guarda en claro;
* expiración obligatoria;
* invitación de un solo uso;
* no revelar token en logs;
* auditoría obligatoria.

---

## 9. Value Objects

## 9.1. UserEmail

Reglas:

* requerido;
* formato email válido;
* normalizado a lowercase;
* trim;
* único.

---

## 9.2. UserStatus

Valores:

```text id="wp1cos"
active
inactive
disabled
pending
archived
```

Responsabilidades:

```text id="5iqd52"
canAuthenticate()
canOperate()
canBeDisabled()
canBeEnabled()
canBeArchived()
```

---

## 9.3. UserType

Valores iniciales:

```text id="1snpvx"
human
serviceAccount
```

MVP:

```text id="gryva4"
human
```

`serviceAccount` queda preparado para integraciones futuras.

---

## 9.4. AuthProvider

Valores:

```text id="32atkp"
keycloak
```

Sprint 2 admite únicamente `keycloak`; no existe proveedor `local` temporal.

---

## 9.5. RoleCode

Reglas:

* lowercase o PascalCase normalizado según convención;
* único por scope;
* para tenant roles, único por tenant;
* no vacío;
* no modificable para roles system.

Convención recomendada:

```text id="r1km7t"
TenantAdmin
Treasurer
Resident
PlatformAdmin
```

---

## 9.6. RoleScope

Valores:

```text id="zlsw3j"
global
tenant
```

---

## 9.7. PermissionCode

Reglas:

* formato `module.action`;
* opcionalmente `module.action.qualifier`;
* lowercase;
* único global.

Ejemplos:

```text id="4ir2xe"
users.invite
payments.confirm
accountStatements.read.own
```

Regex sugerida:

```text id="f0n3hl"
^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$
```

---

## 9.8. MembershipStatus

Valores:

```text id="c7r9u4"
active
invited
suspended
revoked
left
archived
```

---

## 9.9. InvitationStatus

Valores:

```text id="x40icb"
pending
accepted
expired
revoked
cancelled
```

---

## 9.10. InvitationToken

Responsabilidades:

* generar token seguro;
* hashear token;
* comparar token recibido con hash;
* no exponerse en logs;
* no almacenarse en claro.

---

## 10. Modelo Prisma preliminar

El modelo final se documentará en `data-model.md`.

Modelo conceptual propuesto:

```prisma id="n3d314"
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

```prisma id="ht3plj"
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

  memberships       UserTenantMembership[]

  @@index([email])
  @@index([status])
  @@map("user_profiles")
}
```

```prisma id="bu5zve"
model Role {
  id          String    @id @default(uuid())
  tenantId    String?   @map("tenant_id")
  name        String
  code        String
  scope       RoleScope
  description String?
  isSystem    Boolean   @default(true) @map("is_system")

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  tenant      Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  permissions RolePermission[]
  membershipRoles MembershipRole[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([scope])
  @@map("roles")
}
```

```prisma id="g4dl1g"
model Permission {
  id          String   @id @default(uuid())
  code        String   @unique
  module      String
  action      String
  description String?
  isSystem    Boolean  @default(true) @map("is_system")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  roles       RolePermission[]

  @@index([module])
  @@index([action])
  @@map("permissions")
}
```

```prisma id="n1eiz2"
model RolePermission {
  id           String     @id @default(uuid())
  roleId       String     @map("role_id")
  permissionId String     @map("permission_id")
  createdAt    DateTime   @default(now()) @map("created_at")
  createdBy    String?    @map("created_by")

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Restrict)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Restrict)

  @@unique([roleId, permissionId])
  @@index([permissionId])
  @@map("role_permissions")
}
```

```prisma id="vplrmz"
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
  @@index([status])
  @@map("user_tenant_memberships")
}
```

```prisma id="na5uwh"
model MembershipRole {
  id           String   @id @default(uuid())
  membershipId String   @map("membership_id")
  roleId       String   @map("role_id")
  assignedAt   DateTime @default(now()) @map("assigned_at")
  assignedBy   String?  @map("assigned_by")
  removedAt    DateTime? @map("removed_at")
  removedBy    String?   @map("removed_by")

  membership   UserTenantMembership @relation(fields: [membershipId], references: [id], onDelete: Restrict)
  role         Role                 @relation(fields: [roleId], references: [id], onDelete: Restrict)

  @@unique([membershipId, roleId])
  @@index([roleId])
  @@map("membership_roles")
}
```

```prisma id="ow9ykz"
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
  @@index([status])
  @@index([expiresAt])
  @@map("invitations")
}
```

Notas:

* La relación con `Tenant` requiere agregar relaciones inversas en el modelo `Tenant`.
* La decisión final de constraints se documentará en `data-model.md`.
* `tokenHash` nunca debe exponer el token original.
* La tabla de roles globales puede usar `tenantId = null`.

---

## 11. Casos de uso principales

## 11.0. BootstrapFirstPlatformAdminUseCase

Responsabilidad:

* ejecutarse solo desde un comando operativo interno;
* resolver por email una identidad habilitada y verificada en Keycloak;
* impedir carreras mediante transacción serializable y exclusión mutua;
* crear idempotentemente permisos y roles globales base;
* crear o enlazar UserProfile por email y subject;
* asignar el primer rol global PlatformAdmin;
* auditar y confirmar todos los cambios juntos;
* rechazar un subject distinto cuando el bootstrap ya fue completado.

No expone controller HTTP ni acepta `keycloakSubjectId` sin verificar.
La interfaz prevista es
`pnpm bootstrap:platform-admin -- --email <email>`.

## 11.0.1. ProvisionInitialTenantAccessUseCase

Responsabilidad:

* recibir una identidad ya resuelta por el servidor y una unidad de trabajo;
* crear o enlazar UserProfile sin conflictos email/subject;
* crear roles y permisos base del tenant;
* crear membership activa;
* asignar TenantAdmin;
* registrar auditoría dentro de la misma transacción del tenant.

Este caso de uso implementa el contrato requerido por Spec 001 y no puede
confirmar cambios por separado.

---

## 11.1. CreateUserProfileUseCase

Responsabilidad:

* crear usuario local;
* validar email;
* validar unicidad;
* guardar `keycloakSubjectId` si existe;
* registrar auditoría;
* emitir evento.

Entrada:

```text id="6dejrp"
CreateUserProfileDto
actorUserId
traceId
```

Salida:

```text id="wb84qb"
UserProfileResponseDto
```

---

## 11.2. LinkUserToKeycloakUseCase

Responsabilidad:

* vincular UserProfile con `keycloakSubjectId`;
* validar que el subject no esté en uso;
* registrar auditoría.

Uso típico:

```text id="k781xh"
Después de login Keycloak o durante migración de usuarios.
```

---

## 11.3. CreateBasePermissionsUseCase

Responsabilidad:

* crear catálogo de permisos del sistema;
* idempotente;
* usado en bootstrap o seed.

Permisos base:

* platform permissions;
* tenant user permissions;
* tenant configuration permissions;
* permisos financieros futuros registrados pero no necesariamente activados.

---

## 11.4. CreateGlobalRolesUseCase

Responsabilidad:

* crear roles globales base;
* asignar permisos globales correspondientes;
* idempotente.

Roles:

```text id="xgq1ck"
SuperAdmin
PlatformAdmin
PlatformOperator
PlatformSupport
PlatformAuditor
```

---

## 11.5. CreateTenantBaseRolesUseCase

Responsabilidad:

* crear roles base para un tenant;
* asignar permisos base;
* participar en la unidad de trabajo de `001-tenants`;
* no persistir de forma independiente durante el onboarding.

Roles:

```text id="3pyds6"
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

## 11.6. InviteUserToTenantUseCase

Responsabilidad:

* validar actor;
* validar tenant activo;
* validar email;
* validar rol asignable;
* crear invitación;
* generar token seguro;
* almacenar hash;
* registrar auditoría;
* emitir evento;
* enviar correo o dejar integración preparada.

---

## 11.7. AcceptTenantInvitationUseCase

Responsabilidad:

* validar token;
* comparar hash;
* validar expiración;
* validar estado;
* crear o vincular UserProfile;
* crear membresía;
* asignar rol inicial;
* marcar invitación accepted;
* auditar;
* emitir evento.

---

## 11.8. RevokeTenantInvitationUseCase

Responsabilidad:

* revocar invitación pendiente;
* validar permisos;
* auditar;
* emitir evento.

---

## 11.9. AssignRoleToMembershipUseCase

Responsabilidad:

* validar actor;
* validar membership;
* validar tenant;
* validar role;
* validar que role pertenece al mismo tenant;
* validar que el actor puede asignar ese role;
* crear MembershipRole;
* auditar;
* emitir evento.

---

## 11.10. RemoveRoleFromMembershipUseCase

Responsabilidad:

* validar actor;
* validar role;
* validar reglas mínimas;
* marcar role como removido o eliminar asignación según decisión;
* auditar;
* emitir evento.

---

## 11.11. RevokeMembershipUseCase

Responsabilidad:

* revocar acceso de usuario a tenant;
* validar que no se rompa regla de administrador mínimo;
* auditar;
* emitir evento.

---

## 11.12. GetEffectivePermissionsUseCase

Responsabilidad:

* calcular permisos efectivos del usuario;
* validar UserProfile activo;
* validar tenant activo;
* validar membership activa;
* obtener roles;
* obtener permisos;
* devolver conjunto de permisos.

---

## 11.13. GetCurrentUserUseCase

Responsabilidad:

* devolver perfil del usuario actual;
* no exponer información innecesaria;
* incluir tenants disponibles si se requiere.

---

## 11.14. ResolveTenantContextUseCase

Responsabilidad:

* exigir un único `X-Tenant-Id` UUID en endpoints tenant-scoped;
* tratar el header como selector no confiable;
* validar `UserProfile`, tenant y membership activos;
* resolver roles y permisos para ese tenant;
* construir un `TenantContext` inmutable y request-scoped;
* no persistir selección ni emitir un segundo token.

---

## 12. Servicios de aplicación

## 12.1. EffectivePermissionsService

Responsabilidad:

* calcular permisos efectivos;
* cachear si se justifica;
* invalidar cache ante cambios de roles/permisos;
* no mezclar tenants.

Entrada:

```text id="ivsvai"
userProfileId
tenantId resuelto y obligatorio para scope tenant
```

Salida:

```text id="64ddh1"
permissions[]
roles[]
scope
```

---

## 12.2. InvitationTokenService

Responsabilidad:

* generar token aleatorio seguro;
* hashear token;
* comparar token;
* ocultar token de logs.

Reglas:

```text id="1wv21o"
Guardar solo tokenHash.
Mostrar token original solo una vez para envío de invitación.
```

---

## 12.3. InvitationPolicyService

Responsabilidad:

* validar invitación;
* validar expiración;
* validar estado;
* validar rol;
* validar tenant;
* evitar reutilización.

---

## 12.4. RoleAssignmentPolicyService

Responsabilidad:

* validar si un actor puede asignar o remover un rol;
* impedir TenantAdmin asignando roles globales;
* impedir role de otro tenant;
* impedir eliminación del último TenantAdmin si se activa esa regla.

---

## 12.5. MembershipPolicyService

Responsabilidad:

* validar membresía activa;
* validar revocación;
* validar suspensión;
* validar salida de tenant.

---

## 12.6. BaseRolesService

Responsabilidad:

* crear permisos base;
* crear roles globales;
* crear roles base por tenant;
* asignar permisos base;
* ser idempotente.

---

## 12.7. KeycloakUserLinkingService

Responsabilidad:

* vincular usuario local con Keycloak;
* validar subject;
* facilitar migración futura;
* no contener lógica de autorización de negocio.

---

## 13. Repositorios

## 13.1. UserProfileRepository

Contrato sugerido:

```text id="l1mr6f"
create(input)
findById(userProfileId)
findByEmail(email)
findByKeycloakSubjectId(subjectId)
list(query)
update(userProfileId, input)
disable(userProfileId, actorId)
enable(userProfileId, actorId)
existsByEmail(email)
existsByKeycloakSubjectId(subjectId)
```

---

## 13.2. RoleRepository

Contrato sugerido:

```text id="ynn50q"
create(input)
findById(roleId)
findByCode(scope, tenantId, code)
listGlobalRoles()
listTenantRoles(tenantId)
assignPermission(roleId, permissionId, actorId)
removePermission(roleId, permissionId, actorId)
createBaseTenantRoles(tenantId)
createGlobalRoles()
```

---

## 13.3. PermissionRepository

Contrato sugerido:

```text id="7f89bw"
create(input)
findById(permissionId)
findByCode(code)
list(query)
createBasePermissions()
```

---

## 13.4. MembershipRepository

Contrato sugerido:

```text id="7us7ci"
create(input)
findById(membershipId)
findByUserAndTenant(userProfileId, tenantId)
listByTenant(tenantId, query)
listByUser(userProfileId)
assignRole(membershipId, roleId, actorId)
removeRole(membershipId, roleId, actorId)
revoke(membershipId, actorId, reason)
hasActiveMembership(userProfileId, tenantId)
getEffectiveRoles(userProfileId, tenantId)
```

---

## 13.5. InvitationRepository

Contrato sugerido:

```text id="febnfb"
create(input)
findById(invitationId)
findByTokenHash(tokenHash)
listByTenant(tenantId, query)
markAccepted(invitationId, userProfileId)
revoke(invitationId, actorId)
expire(invitationId)
```

---

## 14. Controladores REST

## 14.1. PlatformUsersController

Ruta base:

```text id="kz7xsd"
/api/v1/platform/users
```

Endpoints:

```text id="wfn8lk"
GET    /
POST   /
GET    /:userId
PATCH  /:userId
POST   /:userId/disable
POST   /:userId/enable
```

Responsabilidad:

* gestión global de usuarios por plataforma.

---

## 14.2. PlatformRolesController

Ruta base:

```text id="o8ntwr"
/api/v1/platform
```

Endpoints:

```text id="xbhnze"
GET    /roles
GET    /permissions
POST   /users/:userId/global-roles
DELETE /users/:userId/global-roles/:roleId
```

Responsabilidad:

* consulta de roles/permisos globales;
* asignación de roles globales.

Nota:

La asignación real de global roles puede requerir tabla adicional `user_global_roles`. Esta tabla se detallará en `data-model.md`.

---

## 14.3. TenantUsersController

Ruta base:

```text id="x121w9"
/api/v1/tenant
```

Endpoints:

```text id="onbs1d"
GET    /users
POST   /invitations
GET    /invitations
POST   /invitations/:invitationId/revoke
POST   /memberships/:membershipId/roles
DELETE /memberships/:membershipId/roles/:roleId
POST   /memberships/:membershipId/revoke
```

Responsabilidad:

* gestión de usuarios dentro del tenant activo.

---

## 14.4. CurrentUserController

Ruta base:

```text id="3e9pmu"
/api/v1/me
```

Endpoints:

```text id="g95oce"
GET  /
GET  /tenants
GET  /permissions
```

Responsabilidad:

* devolver contexto del usuario autenticado;
* tenants disponibles;
* permisos efectivos;
* exigir y resolver `X-Tenant-Id` solamente en `/permissions`;
* no mantener un tenant activo server-side.

---

## 14.5. InvitationsController

Ruta base:

```text id="blg4df"
/api/v1/invitations
```

Endpoints:

```text id="ytxswf"
GET  /:token
POST /:token/accept
```

Responsabilidad:

* validar y aceptar invitaciones.

Nota:

Estos endpoints son parcialmente públicos, pero siempre validan token seguro.

---

## 15. DTOs

## 15.1. CreateUserProfileDto

Campos:

```text id="k31msp"
email
displayName
firstName
lastName
authProvider
keycloakSubjectId
```

---

## 15.2. UpdateUserProfileDto

Campos:

```text id="vkqzl4"
displayName
firstName
lastName
```

No permitir modificar directamente:

```text id="80dkmo"
status
keycloakSubjectId
createdAt
disabledAt
disabledBy
```

---

## 15.3. DisableUserProfileDto

Campos:

```text id="01q7lb"
reason
```

---

## 15.4. InviteUserToTenantDto

Campos:

```text id="3k2n7w"
email
roleId
message optional
expiresInHours optional
```

Reglas:

* email requerido;
* roleId requerido;
* role debe pertenecer al tenant activo;
* default expiration: 72 horas.

---

## 15.5. AcceptInvitationDto

Campos:

```text id="vsf6n7"
displayName
firstName
lastName
keycloakSubjectId optional
```

Si el usuario ya está autenticado, puede no requerir datos básicos.

---

## 15.6. AssignRoleDto

Campos:

```text id="lwv5p5"
roleId
```

---

## 15.7. RevokeMembershipDto

Campos:

```text id="mcx1x5"
reason
```

---

## 15.8. EffectivePermissionsResponseDto

Campos:

```text id="fxszxq"
userId
tenantId
roles[]
permissions[]
scope
```

---

## 16. Autenticación

### 16.1. Endpoints privados

Todos requieren:

```text id="y7rq1j"
Authorization: Bearer <access_token>
```

---

### 16.2. Endpoints de invitación

Los endpoints de invitación pueden estar disponibles sin sesión previa, pero requieren token válido.

No deben revelar:

* si el email existe;
* si el usuario ya pertenece al tenant;
* detalles internos del tenant;
* token hash.

---

### 16.3. Keycloak de Sprint 2

Flujo obligatorio:

1. Frontend obtiene access token con Authorization Code + PKCE S256.
2. API valida RS256/JWKS, issuer, audience, `azp`, tipo y tiempos.
3. Obtiene `sub` y exige email verificado.
4. Busca `UserProfile.keycloakSubjectId` y valida estado activo.
5. Valida membership y permisos en Core.

No existe auth propia paralela ni un mock que produzca un principal autenticado.

---

## 17. Autorización

## 17.1. Guards esperados

```text id="pv2zmk"
AuthGuard
PlatformPermissionGuard
TenantGuard
TenantPermissionGuard
GlobalRoleGuard
ServiceAccountGuard futuro
```

---

## 17.2. Decorators esperados

```text id="28eaxm"
@CurrentUser()
@CurrentTenant()
@RequirePlatformPermission()
@RequireTenantPermission()
@RequirePermission()
```

---

## 17.3. Reglas

* Endpoints `/platform/*` requieren permisos globales.
* Endpoints `/tenant/*` requieren tenant activo y permiso tenant-scoped.
* Endpoints `/me/*` requieren autenticación y validan contexto.
* Endpoints `/invitations/*` validan token de invitación.
* Un TenantAdmin no puede asignar roles globales.
* Un role de Tenant A no puede asignarse a membresía de Tenant B.
* Usuario disabled no puede operar.

### 17.4. Adaptador Keycloak de Sprint 2

Artefactos declarativos previstos:

```text
infra/keycloak/realm/resident-realm.json
infra/keycloak/fixtures/local-identities.json
tools/keycloak/bootstrap-local.mjs
tools/keycloak/verify-realm.mjs
```

El realm se importa en una base vacía mediante `--import-realm`; el verificador falla
ante drift porque Keycloak omite imports si el realm ya existe. Ningún script elimina
volúmenes automáticamente ni versiona users, passwords o secrets.

El adaptador `KeycloakIdentityResolver` implementa el puerto existente y:

* valida access tokens offline mediante issuer/JWKS configurados;
* exige RS256, audience `resident-api`, `azp` frontend y tiempos válidos;
* refresca JWKS una vez ante `kid` desconocido y falla cerrado;
* resuelve `sub` a `UserProfile` activo;
* no hace introspection por request;
* no concede memberships, roles ni permisos.

`KeycloakUserPort` usa el cliente técnico `resident-identity-admin` únicamente para
consultar identidades habilitadas y verificadas por email. El secret viene del entorno
y el service account sólo recibe `query-users`/`view-users`.

La configuración distingue issuer público, JWKS backchannel y audience. El contrato
local exacto está en GAP-S2-005; staging/producción requieren issuer HTTPS y redirects
exactos aprobados.

---

## 18. Integración con `001-tenants`

Este módulo debe implementar el puerto:

```text id="jfxv4z"
TenantBaseRolesPort
```

propuesto en `001-tenants`.

Implementación real:

```text id="xg8r8u"
ProvisionInitialTenantAccessUseCase
```

Además debe habilitar:

* validación real de TenantAdmin inicial;
* validación real de membership en TenantGuard;
* creación de roles base al crear tenant;
* activación de tenant con administrador inicial.

Secuencia obligatoria:

1. Spec 001 valida actor, request e identidad Keycloak fuera de la transacción.
2. Spec 001 abre la unidad de trabajo y crea el tenant `pendingSetup`.
3. Spec 002 crea/enlaza UserProfile, roles, permisos, membership y TenantAdmin.
4. Auditoría durable se persiste antes del commit.
5. Spec 001 confirma todo o revierte todo.

`TenantCreated` y otros eventos son notificaciones post-commit; nunca completan
roles o membresías obligatorias.

---

## 19. Auditoría

## 19.1. Puerto

Crear:

```text id="jlvu75"
UsersRolesAuditPort
```

Responsabilidad:

* registrar cambios de usuarios;
* registrar invitaciones;
* registrar roles;
* registrar permisos;
* registrar membresías.

---

## 19.2. Eventos auditables

```text id="eu2zql"
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

## 19.3. Campos mínimos

```text id="zorvhg"
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

## 20. Eventos de dominio

Eventos mínimos:

```text id="8wyug1"
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

Implementación inicial:

* evento interno;
* no broker externo obligatorio;
* compatible con outbox futuro.

---

## 21. Observabilidad

## 21.1. Logs

Registrar:

* usuario creado;
* usuario desactivado;
* invitación creada;
* invitación aceptada;
* invitación revocada;
* rol asignado;
* rol removido;
* permiso asignado;
* permiso removido;
* acceso denegado;
* error de membership;
* cálculo de permisos fallido.

No registrar:

* token de invitación;
* token hash;
* Authorization header;
* cookies;
* access token;
* refresh token;
* secrets;
* payloads completos innecesarios.

---

## 21.2. Métricas

Métricas sugeridas:

```text id="ixsm8u"
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

Labels permitidos:

```text id="sm4rky"
service
environment
result
reason
```

Evitar labels de alta cardinalidad:

```text id="mxl29r"
userId
email
invitationId
token
tenantId en métricas públicas de alta cardinalidad
```

---

## 21.3. Trace

Todos los casos de uso críticos deben recibir o generar:

```text id="pb6r8z"
traceId
```

---

## 22. Seguridad

## 22.1. Controles obligatorios

* Validar token.
* Validar usuario activo.
* Validar tenant activo.
* Validar membership activa.
* Validar permisos.
* Separar roles globales y tenant.
* Hashear tokens de invitación.
* Expirar invitaciones.
* No reutilizar invitaciones.
* No registrar tokens.
* Auditar cambios.
* Tests de autorización.
* Tests multitenant.

---

## 22.2. Riesgos críticos

| Riesgo                           | Mitigación                                   |
| -------------------------------- | -------------------------------------------- |
| Usuario opera en tenant ajeno    | TenantGuard + membership + tests multitenant |
| Token válido usado como permiso  | EffectivePermissionsService                  |
| TenantAdmin asigna rol global    | RoleAssignmentPolicyService                  |
| Invitación reutilizada           | InvitationStatus + token hash                |
| Invitación sin expiración        | `expiresAt` obligatorio                      |
| Usuario disabled opera           | AuthGuard / UserStatus validation            |
| Permisos mezclados entre tenants | Queries por tenant + tests                   |
| Token de invitación en logs      | Sanitización                                 |
| Service account excesiva         | Diferir y diseñar scope mínimo               |

---

## 23. Integración con Keycloak

### 23.1. KeycloakUserPort

Crear puerto:

```text id="5ehvrv"
KeycloakUserPort
```

Responsabilidad futura:

* consultar usuario en Keycloak;
* crear usuario si se decide;
* vincular subject;
* validar existencia;
* no autorizar operaciones de negocio.

---

### 23.2. Implementación MVP

Opciones:

#### Opción A — Keycloak activo desde el inicio

* validar token real;
* mapear `sub`;
* crear/vincular UserProfile;
* no guardar password local.

#### Opción B — Auth temporal controlada

* mock/user context en desarrollo;
* preparar campos Keycloak;
* migrar después.

Decisión recomendada:

```text id="rms8up"
Preparar modelo para Keycloak y permitir integración progresiva.
```

No acoplar reglas de negocio a Keycloak.

---

## 24. Integración con n8n

El módulo debe preparar service accounts, pero no implementarlas completamente en MVP.

Diferido:

```text id="sr144p"
service account full lifecycle
client credentials
token rotation
n8n workflow scopes
```

Reglas futuras:

* tenant explícito;
* permisos mínimos;
* auditoría;
* no DB directa;
* no credenciales humanas.

---

## 25. Migraciones

## 25.1. Migración sugerida

```text id="clbgfv"
002_create_users_roles_permissions
```

Tablas:

```text id="ps5ct7"
user_profiles
roles
permissions
role_permissions
user_tenant_memberships
membership_roles
invitations
```

Posible tabla adicional:

```text id="zv34uh"
user_global_roles
```

si se decide que los roles globales también se asignan mediante tabla explícita y no vía memberships.

---

## 25.2. Constraints mínimos

```text id="f502px"
unique(user_profiles.email)
unique(user_profiles.keycloak_subject_id)
unique(permissions.code)
unique(roles.tenant_id, roles.code)
unique(role_permissions.role_id, permission_id)
unique(user_tenant_memberships.user_profile_id, tenant_id)
unique(membership_roles.membership_id, role_id)
```

---

## 25.3. Índices mínimos

```text id="pjl88x"
user_profiles.email
user_profiles.status
roles.tenant_id
roles.scope
permissions.module
permissions.code
user_tenant_memberships.tenant_id
user_tenant_memberships.user_profile_id
user_tenant_memberships.status
invitations.tenant_id
invitations.email
invitations.status
invitations.expires_at
```

---

## 25.4. Reglas

* `onDelete: Restrict`;
* no cascade delete peligroso;
* no guardar invitation token en claro;
* revisar SQL antes de staging;
* migration tests obligatorios.

---

## 26. Seeds

Seeds iniciales:

```text id="n2ggdo"
base permissions
global roles
role-permission mapping global
tenant roles para tenants demo
role-permission mapping tenant demo
platform admin demo controlado
tenant admin demo controlado
```

No usar:

* correos personales reales;
* passwords reales;
* tokens reales;
* datos de residentes reales.

Usar dominios:

```text id="h8v9dm"
example.com
```

---

## 27. Testing plan resumido

El documento completo será:

```text id="wjg0c9"
docs/specs/002-users-roles/test-plan.md
```

### 27.1. Unit tests

* UserEmail.
* UserStatus.
* RoleScope.
* PermissionCode.
* MembershipStatus.
* InvitationStatus.
* InvitationToken.
* EffectivePermissionsService.
* RoleAssignmentPolicyService.

### 27.2. Integration tests

* crear usuario.
* vincular Keycloak subject.
* crear roles base.
* crear permisos base.
* asignar permisos a roles.
* crear membership.
* asignar roles.
* crear invitación.
* aceptar invitación.
* revocar membership.

### 27.3. API tests

* platform users.
* platform roles.
* tenant users.
* invitations.
* current user.
* permissions.

### 27.4. Authorization tests

* sin token.
* token inválido.
* usuario disabled.
* usuario sin membership.
* usuario sin permiso.
* TenantAdmin intentando rol global.
* TenantAdmin operando otro tenant.
* PlatformAdmin operando global.

### 27.5. Multitenancy tests

* roles por tenant aislados.
* permisos por tenant aislados.
* invitaciones por tenant aisladas.
* listados por tenant aislados.
* auditoría tenant correcta.

### 27.6. Security tests

* token invitación no reusable.
* token invitación expirado.
* token no aparece en logs.
* email enumeration controlado.
* disabled user bloqueado.
* role assignment incorrecto rechazado.

---

## 28. Orden recomendado de desarrollo

### Fase 1 — Documentación

```text id="g8kr1g"
1. Crear spec.md.
2. Crear plan.md.
3. Crear data-model.md.
4. Crear api-contract.md.
5. Crear test-plan.md.
6. Crear tasks.md.
7. Crear security-notes.md.
```

---

### Fase 2 — Base técnica

```text id="97q5wm"
1. Crear módulo users-roles.
2. Crear carpetas.
3. Crear value objects.
4. Crear entidades.
5. Crear errores.
6. Crear eventos.
7. Crear DTOs.
```

---

### Fase 3 — Persistencia

```text id="s2k6nr"
1. Crear modelos Prisma.
2. Crear migración.
3. Crear repositorios Prisma.
4. Crear mappers.
5. Crear seeds base.
6. Crear tests de migración.
```

---

### Fase 4 — Servicios

```text id="43prkr"
1. EffectivePermissionsService.
2. InvitationTokenService.
3. InvitationPolicyService.
4. RoleAssignmentPolicyService.
5. MembershipPolicyService.
6. BaseRolesService.
7. KeycloakUserLinkingService.
```

---

### Fase 5 — Casos de uso

```text id="kk3k59"
1. CreateUserProfileUseCase.
2. LinkUserToKeycloakUseCase.
3. CreateBasePermissionsUseCase.
4. CreateGlobalRolesUseCase.
5. CreateTenantBaseRolesUseCase.
6. InviteUserToTenantUseCase.
7. AcceptTenantInvitationUseCase.
8. AssignRoleToMembershipUseCase.
9. RemoveRoleFromMembershipUseCase.
10. RevokeMembershipUseCase.
11. GetEffectivePermissionsUseCase.
12. Current user use cases.
```

---

### Fase 6 — Guards y autorización

```text id="18w363"
1. AuthGuard.
2. PlatformPermissionGuard.
3. TenantGuard con membership real.
4. TenantPermissionGuard.
5. Decorators.
6. Permission metadata.
```

---

### Fase 7 — API

```text id="k83u1m"
1. PlatformUsersController.
2. PlatformRolesController.
3. TenantUsersController.
4. CurrentUserController.
5. InvitationsController.
6. OpenAPI.
```

---

### Fase 8 — Auditoría y eventos

```text id="tff2xq"
1. UsersRolesAuditPort.
2. UsersRolesAuditAdapter.
3. UsersRolesEventsPort.
4. UsersRolesEventsAdapter.
5. Eventos críticos.
```

---

### Fase 9 — Pruebas y CI

```text id="9s1kg0"
1. Unit tests.
2. Application tests.
3. Integration tests.
4. API tests.
5. Authorization tests.
6. Multitenancy tests.
7. Security tests.
8. OpenAPI validation.
9. CI gates.
```

---

## 29. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* módulo NestJS creado;
* modelos Prisma creados;
* migración aplicada;
* seeds base creados;
* UserProfile implementado;
* roles globales implementados;
* roles tenant implementados;
* permisos implementados;
* role-permission implementado;
* memberships implementadas;
* membership roles implementadas;
* invitations implementadas;
* tokens de invitación hasheados;
* permisos efectivos calculados;
* TenantGuard usa membresías reales;
* TenantBaseRolesPort de `001-tenants` tiene implementación real;
* endpoints implementados;
* autorización aplicada;
* auditoría aplicada;
* eventos emitidos;
* OpenAPI actualizado;
* tests unitarios pasan;
* tests integración pasan;
* tests autorización pasan;
* tests multitenant pasan;
* tests seguridad pasan;
* CI pasa.

---

## 30. Comandos esperados

Los nombres finales pueden variar, pero se esperan comandos equivalentes:

```bash id="1l82xf"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run prisma:migrate:dev
npm run build
```

Comandos específicos sugeridos:

```bash id="7bhg4q"
npm run test:users-roles
npm run test:users-roles:unit
npm run test:users-roles:integration
npm run test:users-roles:authorization
npm run test:users-roles:multitenancy
npm run test:users-roles:security
```

---

## 31. Riesgos de implementación

| Riesgo                                   | Impacto | Mitigación                          |
| ---------------------------------------- | ------- | ----------------------------------- |
| Mezclar auth con autorización            | Crítico | Separar Keycloak y Core permissions |
| Permisos de Tenant A aplican en Tenant B | Crítico | Membership tenant-scoped + tests    |
| TenantAdmin asigna rol global            | Alto    | RoleAssignmentPolicyService         |
| Usuario disabled opera                   | Crítico | AuthGuard valida UserStatus         |
| Invitación reutilizable                  | Alto    | InvitationStatus + token hash       |
| Token de invitación en logs              | Alto    | Sanitización                        |
| Roles completos mal diseñados            | Alto    | Roles base system + tests           |
| Sin auditoría en cambios de acceso       | Alto    | AuditPort obligatorio               |
| CI sin authorization tests               | Alto    | ADR-011/012 gates                   |
| Keycloak acoplado a reglas de negocio    | Alto    | KeycloakUserPort                    |

---

## 32. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="5gckcz"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-005-authentication-strategy.md
docs/decisions/ADR-006-identity-provider-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/specs/001-tenants/spec.md
docs/specs/001-tenants/security-notes.md
docs/specs/002-users-roles/spec.md
docs/specs/002-users-roles/plan.md
```

El agente no debe:

* implementar permisos solo en frontend;
* confiar en roles de Keycloak como autorización final;
* mezclar roles globales con roles tenant;
* asignar roles sin validar tenant;
* guardar tokens de invitación en claro;
* registrar tokens en logs;
* exponer usuarios de otros tenants;
* usar datos reales en seeds;
* implementar módulos financieros;
* crear microservicio separado;
* modificar ADRs sin justificación.

---

## 33. Dependencias internas futuras

Este módulo será consumido por:

```text id="5egncm"
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

Especialmente será usado por:

* guards;
* audit;
* financial modules;
* reports;
* files;
* n8n integrations;
* WordPress authenticated integrations futuras.

---

## 34. Dependencias externas

Dependencias externas directas o futuras:

```text id="hplaxn"
PostgreSQL
Prisma
Keycloak
Redis futuro para cache de permisos
Mail provider futuro para invitaciones
n8n futuro para automatizaciones
```

---

## 35. Estrategia de entrega

La entrega puede dividirse en incrementos.

### Incremento 1 — Modelo base

* UserProfile.
* Role.
* Permission.
* RolePermission.
* UserTenantMembership.
* MembershipRole.
* Invitation.
* Migración.
* Seeds base.

### Incremento 2 — Roles y permisos base

* Crear permisos.
* Crear roles globales.
* Crear roles tenant.
* Implementar `TenantBaseRolesPort`.
* Calcular permisos efectivos.

### Incremento 3 — Invitaciones y membresías

* Invitar usuario.
* Aceptar invitación.
* Crear membership.
* Asignar rol inicial.
* Revocar invitation.
* Revocar membership.

### Incremento 4 — Guards y API

* PlatformPermissionGuard.
* TenantGuard con membership real.
* TenantPermissionGuard.
* Controllers.
* OpenAPI.

### Incremento 5 — Hardening

* Tests autorización.
* Tests multitenant.
* Tests seguridad.
* Auditoría.
* Eventos.
* Observabilidad.
* CI gates.

---

## 36. Pendientes para documentos derivados

### 36.1. `data-model.md`

Debe detallar:

* tablas;
* columnas;
* enums;
* constraints;
* índices;
* relaciones;
* seed de permisos;
* seed de roles;
* reglas de migración.

### 36.2. `api-contract.md`

Debe detallar:

* endpoints;
* requests;
* responses;
* errores;
* permisos;
* status codes;
* paginación;
* OpenAPI.

### 36.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* multitenancy tests;
* security tests;
* Keycloak tests;
* invitation tests.

### 36.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

### 36.5. `security-notes.md`

Debe detallar amenazas específicas:

* cross-tenant access;
* role escalation;
* invitation abuse;
* Keycloak misuse;
* service account risks;
* logs con tokens.

---

## 37. Decisión final de implementación

El módulo `002-users-roles` se implementará como módulo interno de NestJS dentro del monolito modular de RESIDENT Core.

Tendrá controladores separados para:

* usuarios de plataforma;
* roles de plataforma;
* usuarios del tenant activo;
* usuario actual;
* invitaciones.

Usará PostgreSQL y Prisma para persistencia.

Implementará roles, permisos, membresías e invitaciones como base real de autorización.

La autorización seguirá el principio:

```text id="jyf4f7"
Keycloak autentica.
RESIDENT Core autoriza.
```

El módulo completará el diferido de `001-tenants` implementando la creación real de roles base por tenant y permitiendo validar membresías reales en guards.

No se implementarán todavía roles personalizados avanzados, service accounts completas ni relación profunda usuario-persona-unidad.

Este módulo debe completarse antes de iniciar módulos financieros o de residentes, porque todos ellos requieren identidad, actor, tenant, rol, permiso, membresía y auditoría.
