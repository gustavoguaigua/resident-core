# Test Plan — Spec 002 Users, Roles, Permissions and Tenant Memberships

## 1. Información del documento

| Campo                    | Valor                                        |
| ------------------------ | -------------------------------------------- |
| Proyecto                 | RESIDENT Core                                |
| Spec ID                  | 002                                          |
| Módulo                   | Users, Roles and Access Management           |
| Documento                | Test Plan                                    |
| Ruta                     | `docs/specs/002-users-roles/test-plan.md`    |
| Versión                  | 0.1                                          |
| Estado                   | needs-review                                 |
| Fecha                    | 2026-07-13                                   |
| Documento base           | `docs/specs/002-users-roles/spec.md`         |
| Plan técnico             | `docs/specs/002-users-roles/plan.md`         |
| Modelo de datos          | `docs/specs/002-users-roles/data-model.md`   |
| Contrato API             | `docs/specs/002-users-roles/api-contract.md` |
| Framework sugerido       | Jest + Supertest                             |
| Base de datos de pruebas | PostgreSQL test database                     |
| Prioridad                | Alta                                         |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `002-users-roles`.

El objetivo es verificar que RESIDENT Core administre correctamente:

* perfiles de usuario;
* roles globales;
* roles por tenant;
* permisos;
* asignación de permisos a roles;
* membresías usuario-tenant;
* roles por membresía;
* invitaciones;
* aceptación de invitaciones;
* cálculo de permisos efectivos;
* autorización global;
* autorización tenant-scoped;
* integración conceptual con Keycloak;
* aislamiento multitenant;
* auditoría de cambios de acceso;
* seguridad de tokens de invitación;
* bloqueo de usuarios desactivados;
* protección contra escalamiento de privilegios.

Regla central:

```text id="l4tokz"
Keycloak autentica.
RESIDENT Core autoriza.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este test plan cubre:

* pruebas unitarias;
* pruebas de dominio;
* pruebas de value objects;
* pruebas de servicios de aplicación;
* pruebas de casos de uso;
* pruebas de integración;
* pruebas de migración;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas de seguridad;
* pruebas de invitaciones;
* pruebas de permisos efectivos;
* pruebas de auditoría;
* pruebas de eventos;
* pruebas de observabilidad;
* pruebas OpenAPI;
* smoke tests.

---

### 3.2. No incluido

No cubre todavía:

* pruebas UI del frontend;
* pruebas reales completas de Keycloak en producción;
* MFA;
* SCIM;
* directorio corporativo;
* service accounts completas para n8n;
* permisos financieros por monto;
* aprobaciones duales;
* relación completa usuario-persona-unidad;
* pruebas de residentes y propietarios;
* pruebas de pagos, alícuotas o estados de cuenta.

Esos temas se cubrirán en specs posteriores.

---

## 4. Estrategia general

El módulo debe probarse en varias capas:

```text id="8qvlov"
Unit tests
Domain tests
Application tests
Integration tests
Migration tests
API tests
Authorization tests
Multitenancy tests
Security tests
Invitation tests
Effective permission tests
Audit tests
Event tests
OpenAPI tests
Smoke tests
```

Regla:

```text id="26ldm4"
Ningún endpoint privado se considera válido si no tiene pruebas de autorización.
```

Regla adicional:

```text id="55yqtd"
Ningún acceso tenant-scoped se considera seguro si no tiene prueba multitenant negativa.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este test plan si:

* UserProfile se crea y valida correctamente;
* emails duplicados se rechazan;
* `keycloakSubjectId` duplicado se rechaza;
* roles globales y tenant roles están separados;
* permisos se asignan a roles;
* roles globales no se asignan como roles de membresía;
* roles tenant no se asignan como roles globales;
* roles de Tenant A no se asignan a membresías de Tenant B;
* usuario disabled no puede operar;
* usuario sin membership activa no puede operar en tenant;
* permisos efectivos no mezclan tenants;
* invitaciones expiran;
* invitaciones aceptadas no se reutilizan;
* tokens de invitación no se almacenan en claro;
* tokens de invitación no aparecen en logs;
* cambios de acceso se auditan;
* eventos críticos se emiten;
* OpenAPI coincide con `api-contract.md`;
* CI ejecuta pruebas obligatorias.

---

## 6. Datos de prueba base

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="thbsq5"
tenantActiveA: villa-club-demo
tenantActiveB: altos-del-norte-demo
tenantSuspended: tenant-suspendido-demo
tenantArchived: tenant-archivado-demo
```

---

### 6.2. Usuarios

Usuarios de prueba:

```text id="27k4ve"
platformAdmin
platformOperator
platformSupport
platformAuditor
tenantAdminA
tenantAdminB
treasurerA
residentA
residentB
userWithoutMembership
userWithoutPermission
disabledUser
pendingUser
anonymousUser
```

---

### 6.3. Roles globales

```text id="ewdtcj"
SuperAdmin
PlatformAdmin
PlatformOperator
PlatformSupport
PlatformAuditor
```

---

### 6.4. Roles tenant

```text id="swq1tk"
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

### 6.5. Permisos base

Permisos globales:

```text id="7nawzj"
platform.users.create
platform.users.read
platform.users.update
platform.users.disable
platform.users.enable
platform.roles.read
platform.roles.assign
platform.permissions.read
```

Permisos tenant:

```text id="mzipfi"
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

### 6.6. Datos prohibidos

No usar:

* cédulas reales;
* correos personales reales;
* teléfonos reales;
* passwords reales;
* tokens reales;
* datos bancarios;
* comprobantes;
* datos de residentes reales;
* secrets;
* credenciales Keycloak reales.

Usar:

```text id="f8qrfw"
example.com
```

---

## 7. Factories recomendadas

Crear factories:

```text id="zc2w52"
createUserProfile()
createActiveUserProfile()
createDisabledUserProfile()
createGlobalRole()
createTenantRole()
createPermission()
createRolePermission()
createUserGlobalRole()
createTenantMembership()
createMembershipRole()
createInvitation()
createAcceptedInvitation()
createExpiredInvitation()
createRevokedInvitation()
createAuthContext()
createTenantContext()
```

Ejemplos:

```text id="wb1lnw"
createUserProfile({ email: "tenant.admin@example.com", status: "active" })

createTenantMembership({
  userProfileId,
  tenantId,
  status: "active"
})
```

---

## 8. Pruebas unitarias de value objects

## 8.1. UserEmail

Archivo sugerido:

```text id="l2ao7h"
user-email.vo.spec.ts
```

| ID           | Caso                  | Resultado esperado  |
| ------------ | --------------------- | ------------------- |
| UT-EMAIL-001 | Email válido          | válido              |
| UT-EMAIL-002 | Email con mayúsculas  | normaliza lowercase |
| UT-EMAIL-003 | Email con espacios    | trim                |
| UT-EMAIL-004 | Email inválido        | error               |
| UT-EMAIL-005 | Email vacío           | error               |
| UT-EMAIL-006 | Email demasiado largo | error               |

---

## 8.2. UserStatus

Archivo sugerido:

```text id="xsot4o"
user-status.vo.spec.ts
```

| ID             | Caso                                 | Resultado esperado |
| -------------- | ------------------------------------ | ------------------ |
| UT-USTATUS-001 | `active` puede operar                | true               |
| UT-USTATUS-002 | `pending` no opera normalmente       | false              |
| UT-USTATUS-003 | `disabled` no opera                  | false              |
| UT-USTATUS-004 | `archived` no opera                  | false              |
| UT-USTATUS-005 | disabled puede enable                | permitido          |
| UT-USTATUS-006 | archived no puede enable por defecto | rechazado          |

---

## 8.3. UserType

Archivo sugerido:

```text id="n3zz3o"
user-type.vo.spec.ts
```

| ID           | Caso                       | Resultado esperado              |
| ------------ | -------------------------- | ------------------------------- |
| UT-UTYPE-001 | `human` válido             | válido                          |
| UT-UTYPE-002 | `serviceAccount` reservado | válido pero no operativo en MVP |
| UT-UTYPE-003 | valor inválido             | error                           |

---

## 8.4. AuthProvider

Archivo sugerido:

```text id="xy1l62"
auth-provider.vo.spec.ts
```

| ID            | Caso                    | Resultado esperado |
| ------------- | ----------------------- | ------------------ |
| UT-AUTHPR-001 | `keycloak` válido       | válido             |
| UT-AUTHPR-002 | `local` válido temporal | válido             |
| UT-AUTHPR-003 | valor inválido          | error              |

---

## 8.5. RoleScope

Archivo sugerido:

```text id="rb268m"
role-scope.vo.spec.ts
```

| ID            | Caso                | Resultado esperado |
| ------------- | ------------------- | ------------------ |
| UT-RSCOPE-001 | global sin tenant   | válido             |
| UT-RSCOPE-002 | tenant con tenantId | válido             |
| UT-RSCOPE-003 | global con tenantId | error              |
| UT-RSCOPE-004 | tenant sin tenantId | error              |

---

## 8.6. PermissionCode

Archivo sugerido:

```text id="5r6y2j"
permission-code.vo.spec.ts
```

| ID          | Caso                         | Resultado esperado                   |
| ----------- | ---------------------------- | ------------------------------------ |
| UT-PERM-001 | `users.invite`               | válido                               |
| UT-PERM-002 | `accountStatements.read.own` | válido                               |
| UT-PERM-003 | `Users.Invite`               | normalizar o rechazar según decisión |
| UT-PERM-004 | `users`                      | error                                |
| UT-PERM-005 | vacío                        | error                                |
| UT-PERM-006 | caracteres inválidos         | error                                |

---

## 8.7. MembershipStatus

Archivo sugerido:

```text id="dlww8n"
membership-status.vo.spec.ts
```

| ID             | Caso                | Resultado esperado |
| -------------- | ------------------- | ------------------ |
| UT-MSTATUS-001 | active puede operar | true               |
| UT-MSTATUS-002 | invited no opera    | false              |
| UT-MSTATUS-003 | suspended no opera  | false              |
| UT-MSTATUS-004 | revoked no opera    | false              |
| UT-MSTATUS-005 | left no opera       | false              |
| UT-MSTATUS-006 | archived no opera   | false              |

---

## 8.8. InvitationStatus

Archivo sugerido:

```text id="vrb7wl"
invitation-status.vo.spec.ts
```

| ID               | Caso                         | Resultado esperado |
| ---------------- | ---------------------------- | ------------------ |
| UT-INVSTATUS-001 | pending puede aceptarse      | true               |
| UT-INVSTATUS-002 | accepted no puede aceptarse  | false              |
| UT-INVSTATUS-003 | expired no puede aceptarse   | false              |
| UT-INVSTATUS-004 | revoked no puede aceptarse   | false              |
| UT-INVSTATUS-005 | cancelled no puede aceptarse | false              |

---

## 8.9. InvitationToken

Archivo sugerido:

```text id="zcv8dl"
invitation-token.vo.spec.ts
```

| ID              | Caso                          | Resultado esperado |
| --------------- | ----------------------------- | ------------------ |
| UT-INVTOKEN-001 | genera token seguro           | token no vacío     |
| UT-INVTOKEN-002 | hash no igual al token        | pasa               |
| UT-INVTOKEN-003 | compara token correcto        | true               |
| UT-INVTOKEN-004 | compara token incorrecto      | false              |
| UT-INVTOKEN-005 | token no se serializa en logs | pasa               |
| UT-INVTOKEN-006 | token corto inválido          | error              |

---

## 9. Pruebas unitarias de entidades

## 9.1. UserProfile entity

Archivo sugerido:

```text id="ws39tv"
user-profile.entity.spec.ts
```

| ID          | Caso                           | Resultado esperado            |
| ----------- | ------------------------------ | ----------------------------- |
| UT-USER-001 | Crear usuario válido           | entidad válida                |
| UT-USER-002 | Desactivar usuario activo      | status disabled               |
| UT-USER-003 | Desactivar usuario ya disabled | conflicto o no-op documentado |
| UT-USER-004 | Reactivar disabled             | status active                 |
| UT-USER-005 | Link Keycloak subject          | subject asignado              |
| UT-USER-006 | Archived no opera              | bloqueado                     |

---

## 9.2. Role entity

Archivo sugerido:

```text id="0n7dw8"
role.entity.spec.ts
```

| ID          | Caso                     | Resultado esperado |
| ----------- | ------------------------ | ------------------ |
| UT-ROLE-001 | Crear rol global válido  | válido             |
| UT-ROLE-002 | Crear rol tenant válido  | válido             |
| UT-ROLE-003 | Rol tenant sin tenantId  | error              |
| UT-ROLE-004 | Rol global con tenantId  | error              |
| UT-ROLE-005 | Rol system no eliminable | bloqueado          |

---

## 9.3. UserTenantMembership entity

Archivo sugerido:

```text id="b5u40u"
user-tenant-membership.entity.spec.ts
```

| ID         | Caso                           | Resultado esperado |
| ---------- | ------------------------------ | ------------------ |
| UT-MEM-001 | Crear membership invited       | válido             |
| UT-MEM-002 | Activar membership             | status active      |
| UT-MEM-003 | Revocar membership             | status revoked     |
| UT-MEM-004 | Revocar sin razón si requerida | error              |
| UT-MEM-005 | Membership revoked no opera    | bloqueado          |

---

## 9.4. Invitation entity

Archivo sugerido:

```text id="sjx2op"
invitation.entity.spec.ts
```

| ID         | Caso                        | Resultado esperado |
| ---------- | --------------------------- | ------------------ |
| UT-INV-001 | Crear invitación pending    | válido             |
| UT-INV-002 | Aceptar pending no expirada | accepted           |
| UT-INV-003 | Aceptar expirada            | error              |
| UT-INV-004 | Aceptar revocada            | error              |
| UT-INV-005 | Aceptar ya aceptada         | error              |
| UT-INV-006 | Revocar pending             | revoked            |

---

## 10. Pruebas de servicios de aplicación

## 10.1. EffectivePermissionsService

Archivo sugerido:

```text id="hqqaal"
effective-permissions.service.spec.ts
```

| ID           | Caso                                                    | Resultado esperado          |
| ------------ | ------------------------------------------------------- | --------------------------- |
| SRV-PERM-001 | Usuario active con role tenant                          | devuelve permisos           |
| SRV-PERM-002 | Usuario disabled                                        | error o permisos vacíos     |
| SRV-PERM-003 | Tenant suspended                                        | error o permisos bloqueados |
| SRV-PERM-004 | Membership revoked                                      | error                       |
| SRV-PERM-005 | Role removed                                            | no incluye permisos         |
| SRV-PERM-006 | User con rol en Tenant A no recibe permisos en Tenant B | pasa                        |
| SRV-PERM-007 | Permisos globales separados de tenant                   | pasa                        |
| SRV-PERM-008 | Duplicados se deduplican                                | lista única                 |

---

## 10.2. InvitationTokenService

Archivo sugerido:

```text id="bnk8ws"
invitation-token.service.spec.ts
```

| ID            | Caso                    | Resultado esperado |
| ------------- | ----------------------- | ------------------ |
| SRV-TOKEN-001 | Generar token           | token seguro       |
| SRV-TOKEN-002 | Hash token              | hash generado      |
| SRV-TOKEN-003 | Comparar token válido   | true               |
| SRV-TOKEN-004 | Comparar token inválido | false              |
| SRV-TOKEN-005 | No loggear token        | pasa               |

---

## 10.3. RoleAssignmentPolicyService

Archivo sugerido:

```text id="5i0czz"
role-assignment-policy.service.spec.ts
```

| ID              | Caso                                    | Resultado esperado        |
| --------------- | --------------------------------------- | ------------------------- |
| SRV-ROLEPOL-001 | PlatformAdmin asigna rol global         | permitido                 |
| SRV-ROLEPOL-002 | TenantAdmin intenta rol global          | rechazado                 |
| SRV-ROLEPOL-003 | TenantAdmin asigna rol tenant permitido | permitido                 |
| SRV-ROLEPOL-004 | Actor asigna role de otro tenant        | rechazado                 |
| SRV-ROLEPOL-005 | Asignar último TenantAdmin removido     | rechazado si regla activa |
| SRV-ROLEPOL-006 | Asignar role ya asignado                | conflicto                 |

---

## 10.4. InvitationPolicyService

Archivo sugerido:

```text id="gu3m48"
invitation-policy.service.spec.ts
```

| ID             | Caso                        | Resultado esperado |
| -------------- | --------------------------- | ------------------ |
| SRV-INVPOL-001 | Pending vigente             | aceptable          |
| SRV-INVPOL-002 | Expirada                    | rechazada          |
| SRV-INVPOL-003 | Revocada                    | rechazada          |
| SRV-INVPOL-004 | Accepted                    | rechazada          |
| SRV-INVPOL-005 | Role no pertenece al tenant | rechazada          |
| SRV-INVPOL-006 | Tenant no active            | rechazada          |

---

## 11. Pruebas de casos de uso

## 11.1. CreateUserProfileUseCase

| ID                  | Caso                       | Resultado esperado                |
| ------------------- | -------------------------- | --------------------------------- |
| APP-USER-CREATE-001 | Crear usuario válido       | 201/use case success              |
| APP-USER-CREATE-002 | Email duplicado            | `USER_EMAIL_ALREADY_EXISTS`       |
| APP-USER-CREATE-003 | Email inválido             | validation error                  |
| APP-USER-CREATE-004 | Keycloak subject duplicado | `KEYCLOAK_SUBJECT_ALREADY_LINKED` |
| APP-USER-CREATE-005 | Auditoría generada         | `user.created`                    |
| APP-USER-CREATE-006 | Evento emitido             | `UserProfileCreated`              |

---

## 11.2. DisableUserProfileUseCase

| ID               | Caso                        | Resultado esperado       |
| ---------------- | --------------------------- | ------------------------ |
| APP-USER-DIS-001 | Disable usuario active      | status disabled          |
| APP-USER-DIS-002 | Disable usuario inexistente | `USER_PROFILE_NOT_FOUND` |
| APP-USER-DIS-003 | Disable sin permiso         | 403 en API               |
| APP-USER-DIS-004 | Auditoría generada          | `user.disabled`          |
| APP-USER-DIS-005 | Evento emitido              | `UserProfileDisabled`    |

---

## 11.3. CreateBasePermissionsUseCase

| ID                | Caso                         | Resultado esperado |
| ----------------- | ---------------------------- | ------------------ |
| APP-PERM-SEED-001 | Crear catálogo base          | permisos creados   |
| APP-PERM-SEED-002 | Ejecutar dos veces           | idempotente        |
| APP-PERM-SEED-003 | Permission code duplicado    | no duplica         |
| APP-PERM-SEED-004 | Permisos futuros registrados | existen            |

---

## 11.4. CreateGlobalRolesUseCase

| ID            | Caso                               | Resultado esperado |
| ------------- | ---------------------------------- | ------------------ |
| APP-GROLE-001 | Crear roles globales               | roles creados      |
| APP-GROLE-002 | Ejecutar dos veces                 | idempotente        |
| APP-GROLE-003 | Asignar permisos globales          | relaciones creadas |
| APP-GROLE-004 | No crea tenantId en roles globales | pasa               |

---

## 11.5. CreateTenantBaseRolesUseCase

| ID            | Caso                                 | Resultado esperado       |
| ------------- | ------------------------------------ | ------------------------ |
| APP-TROLE-001 | Crear roles base para tenant         | roles creados            |
| APP-TROLE-002 | Ejecutar dos veces                   | idempotente              |
| APP-TROLE-003 | Roles tienen tenantId                | pasa                     |
| APP-TROLE-004 | Permisos asignados por rol           | pasa                     |
| APP-TROLE-005 | Evento emitido                       | `TenantBaseRolesCreated` |
| APP-TROLE-006 | Integra `TenantBaseRolesPort` de 001 | pasa                     |

---

## 11.6. InviteUserToTenantUseCase

| ID             | Caso                                | Resultado esperado    |
| -------------- | ----------------------------------- | --------------------- |
| APP-INVITE-001 | Invitar email válido con rol tenant | invitación pending    |
| APP-INVITE-002 | Email inválido                      | validation error      |
| APP-INVITE-003 | Role global                         | rechazado             |
| APP-INVITE-004 | Role de otro tenant                 | rechazado             |
| APP-INVITE-005 | Tenant suspended                    | rechazado             |
| APP-INVITE-006 | Usuario sin permiso                 | 403                   |
| APP-INVITE-007 | Token hash almacenado               | pasa                  |
| APP-INVITE-008 | Token original no almacenado        | pasa                  |
| APP-INVITE-009 | Auditoría generada                  | `invitation.created`  |
| APP-INVITE-010 | Evento emitido                      | `UserInvitedToTenant` |

---

## 11.7. AcceptTenantInvitationUseCase

| ID             | Caso                          | Resultado esperado           |
| -------------- | ----------------------------- | ---------------------------- |
| APP-ACCEPT-001 | Aceptar token válido          | membership active            |
| APP-ACCEPT-002 | Token inválido                | `INVITATION_NOT_FOUND`       |
| APP-ACCEPT-003 | Token expirado                | `INVITATION_EXPIRED`         |
| APP-ACCEPT-004 | Token revocado                | `INVITATION_REVOKED`         |
| APP-ACCEPT-005 | Token ya aceptado             | `INVITATION_ALREADY_USED`    |
| APP-ACCEPT-006 | Crea UserProfile si no existe | usuario creado               |
| APP-ACCEPT-007 | Vincula UserProfile existente | membership creada            |
| APP-ACCEPT-008 | Asigna rol inicial            | membershipRole creado        |
| APP-ACCEPT-009 | Membership duplicada          | conflicto                    |
| APP-ACCEPT-010 | Auditoría generada            | 3 eventos auditables         |
| APP-ACCEPT-011 | Eventos emitidos              | accepted + membership + role |

---

## 11.8. AssignRoleToMembershipUseCase

| ID                  | Caso                      | Resultado esperado        |
| ------------------- | ------------------------- | ------------------------- |
| APP-ROLE-ASSIGN-001 | Asignar rol tenant válido | éxito                     |
| APP-ROLE-ASSIGN-002 | Role global               | rechazado                 |
| APP-ROLE-ASSIGN-003 | Role de otro tenant       | rechazado                 |
| APP-ROLE-ASSIGN-004 | Membership de otro tenant | rechazado                 |
| APP-ROLE-ASSIGN-005 | Role ya asignado          | conflicto                 |
| APP-ROLE-ASSIGN-006 | Usuario sin permiso       | 403                       |
| APP-ROLE-ASSIGN-007 | Auditoría generada        | `membership.roleAssigned` |
| APP-ROLE-ASSIGN-008 | Evento emitido            | `UserTenantRoleAssigned`  |

---

## 11.9. RemoveRoleFromMembershipUseCase

| ID                  | Caso                       | Resultado esperado        |
| ------------------- | -------------------------- | ------------------------- |
| APP-ROLE-REMOVE-001 | Remover rol asignado       | removedAt set             |
| APP-ROLE-REMOVE-002 | Role no asignado           | 404/409                   |
| APP-ROLE-REMOVE-003 | Role de otro tenant        | rechazado                 |
| APP-ROLE-REMOVE-004 | Remover último TenantAdmin | rechazado si regla activa |
| APP-ROLE-REMOVE-005 | Auditoría generada         | `membership.roleRemoved`  |
| APP-ROLE-REMOVE-006 | Evento emitido             | `UserTenantRoleRemoved`   |

---

## 11.10. RevokeMembershipUseCase

| ID              | Caso                       | Resultado esperado            |
| --------------- | -------------------------- | ----------------------------- |
| APP-MEM-REV-001 | Revocar membership active  | status revoked                |
| APP-MEM-REV-002 | Membership inexistente     | `MEMBERSHIP_NOT_FOUND`        |
| APP-MEM-REV-003 | Membership de otro tenant  | rechazado                     |
| APP-MEM-REV-004 | Revocar último TenantAdmin | rechazado si regla activa     |
| APP-MEM-REV-005 | Auditoría generada         | `membership.revoked`          |
| APP-MEM-REV-006 | Evento emitido             | `UserTenantMembershipRevoked` |

---

## 12. Pruebas de integración

## 12.1. Migración y persistencia

Archivo sugerido:

```text id="r6y1ya"
users-roles.persistence.integration.spec.ts
```

| ID         | Caso                           | Resultado esperado           |
| ---------- | ------------------------------ | ---------------------------- |
| INT-DB-001 | Crea `user_profiles`           | tabla existe                 |
| INT-DB-002 | Crea `roles`                   | tabla existe                 |
| INT-DB-003 | Crea `permissions`             | tabla existe                 |
| INT-DB-004 | Crea `role_permissions`        | tabla existe                 |
| INT-DB-005 | Crea `user_global_roles`       | tabla existe                 |
| INT-DB-006 | Crea `user_tenant_memberships` | tabla existe                 |
| INT-DB-007 | Crea `membership_roles`        | tabla existe                 |
| INT-DB-008 | Crea `invitations`             | tabla existe                 |
| INT-DB-009 | Email unique                   | duplicado falla              |
| INT-DB-010 | Keycloak subject unique        | duplicado falla              |
| INT-DB-011 | Permission code unique         | duplicado falla              |
| INT-DB-012 | RolePermission unique          | duplicado falla              |
| INT-DB-013 | Membership user+tenant unique  | duplicado falla              |
| INT-DB-014 | MembershipRole unique          | duplicado falla              |
| INT-DB-015 | onDelete Restrict              | delete peligroso falla       |
| INT-DB-016 | Defaults correctos             | status/userType/authProvider |

---

## 12.2. Repositorios Prisma

Archivos sugeridos:

```text id="f3jhlh"
prisma-user-profile.repository.integration.spec.ts
prisma-role.repository.integration.spec.ts
prisma-permission.repository.integration.spec.ts
prisma-membership.repository.integration.spec.ts
prisma-invitation.repository.integration.spec.ts
```

Casos mínimos:

| ID           | Caso                            | Resultado esperado |
| ------------ | ------------------------------- | ------------------ |
| INT-REPO-001 | Crear UserProfile               | éxito              |
| INT-REPO-002 | Buscar por email                | éxito              |
| INT-REPO-003 | Buscar por keycloakSubjectId    | éxito              |
| INT-REPO-004 | Crear Role global               | éxito              |
| INT-REPO-005 | Crear Role tenant               | éxito              |
| INT-REPO-006 | Crear Permission                | éxito              |
| INT-REPO-007 | Asignar Permission a Role       | éxito              |
| INT-REPO-008 | Crear Membership                | éxito              |
| INT-REPO-009 | Asignar Role a Membership       | éxito              |
| INT-REPO-010 | Crear Invitation                | éxito              |
| INT-REPO-011 | Buscar Invitation por tokenHash | éxito              |
| INT-REPO-012 | Revocar Invitation              | éxito              |

---

## 12.3. Seeds

| ID           | Caso                      | Resultado esperado |
| ------------ | ------------------------- | ------------------ |
| INT-SEED-001 | Crear permisos base       | éxito              |
| INT-SEED-002 | Reejecutar permisos base  | idempotente        |
| INT-SEED-003 | Crear roles globales      | éxito              |
| INT-SEED-004 | Reejecutar roles globales | idempotente        |
| INT-SEED-005 | Crear roles tenant demo   | éxito              |
| INT-SEED-006 | Reejecutar roles tenant   | idempotente        |
| INT-SEED-007 | No usa datos reales       | pasa               |

---

## 13. Pruebas API — Platform Users

## 13.1. Listar usuarios

Endpoint:

```text id="sxdxh4"
GET /api/v1/platform/users
```

| ID                 | Caso                         | Resultado esperado |
| ------------------ | ---------------------------- | ------------------ |
| API-PUSER-LIST-001 | PlatformAdmin lista usuarios | 200                |
| API-PUSER-LIST-002 | Sin token                    | 401                |
| API-PUSER-LIST-003 | Sin permiso                  | 403                |
| API-PUSER-LIST-004 | Filtrar por status           | correcto           |
| API-PUSER-LIST-005 | Buscar por email             | correcto           |
| API-PUSER-LIST-006 | Paginación                   | meta correcto      |

---

## 13.2. Crear usuario

Endpoint:

```text id="lzo1qz"
POST /api/v1/platform/users
```

| ID                   | Caso                       | Resultado esperado |
| -------------------- | -------------------------- | ------------------ |
| API-PUSER-CREATE-001 | Crear usuario válido       | 201                |
| API-PUSER-CREATE-002 | Email inválido             | 422                |
| API-PUSER-CREATE-003 | Email duplicado            | 409                |
| API-PUSER-CREATE-004 | Keycloak subject duplicado | 409                |
| API-PUSER-CREATE-005 | Sin token                  | 401                |
| API-PUSER-CREATE-006 | Sin permiso                | 403                |
| API-PUSER-CREATE-007 | Auditoría generada         | pasa               |

---

## 13.3. Actualizar usuario

Endpoint:

```text id="fboyr0"
PATCH /api/v1/platform/users/{userId}
```

| ID                | Caso                               | Resultado esperado   |
| ----------------- | ---------------------------------- | -------------------- |
| API-PUSER-UPD-001 | Actualizar displayName             | 200                  |
| API-PUSER-UPD-002 | Intentar cambiar status            | rechazado o ignorado |
| API-PUSER-UPD-003 | Intentar cambiar keycloakSubjectId | rechazado            |
| API-PUSER-UPD-004 | Usuario inexistente                | 404                  |
| API-PUSER-UPD-005 | Sin permiso                        | 403                  |
| API-PUSER-UPD-006 | Auditoría generada                 | pasa                 |

---

## 13.4. Desactivar/reactivar usuario

Endpoints:

```text id="2ve3yo"
POST /api/v1/platform/users/{userId}/disable
POST /api/v1/platform/users/{userId}/enable
```

| ID                | Caso                      | Resultado esperado        |
| ----------------- | ------------------------- | ------------------------- |
| API-PUSER-DIS-001 | Desactivar active         | 200                       |
| API-PUSER-DIS-002 | Desactivar inexistente    | 404                       |
| API-PUSER-DIS-003 | Desactivar sin permiso    | 403                       |
| API-PUSER-DIS-004 | Usuario disabled no opera | 403 en endpoint protegido |
| API-PUSER-ENA-001 | Reactivar disabled        | 200                       |
| API-PUSER-ENA-002 | Reactivar archived        | 409                       |
| API-PUSER-ENA-003 | Auditoría generada        | pasa                      |

---

## 14. Pruebas API — Platform Roles

## 14.1. Listar roles y permisos

| ID           | Endpoint                    | Caso           | Resultado esperado |
| ------------ | --------------------------- | -------------- | ------------------ |
| API-ROLE-001 | GET `/platform/roles`       | PlatformAdmin  | 200                |
| API-ROLE-002 | GET `/platform/roles`       | Sin permiso    | 403                |
| API-ROLE-003 | GET `/platform/permissions` | PlatformAdmin  | 200                |
| API-ROLE-004 | GET `/platform/permissions` | Filtrar módulo | correcto           |

---

## 14.2. Asignar rol global

Endpoint:

```text id="hdp65n"
POST /api/v1/platform/users/{userId}/global-roles
```

| ID                   | Caso                            | Resultado esperado |
| -------------------- | ------------------------------- | ------------------ |
| API-GROLE-ASSIGN-001 | Asignar rol global válido       | 201                |
| API-GROLE-ASSIGN-002 | Asignar role tenant como global | 422/403            |
| API-GROLE-ASSIGN-003 | Role inexistente                | 404                |
| API-GROLE-ASSIGN-004 | Usuario inexistente             | 404                |
| API-GROLE-ASSIGN-005 | Duplicado                       | 409                |
| API-GROLE-ASSIGN-006 | Sin permiso                     | 403                |
| API-GROLE-ASSIGN-007 | Auditoría generada              | pasa               |

---

## 14.3. Remover rol global

Endpoint:

```text id="znmd1w"
DELETE /api/v1/platform/users/{userId}/global-roles/{roleId}
```

| ID                | Caso               | Resultado esperado |
| ----------------- | ------------------ | ------------------ |
| API-GROLE-REM-001 | Remover rol global | 200                |
| API-GROLE-REM-002 | Role no asignado   | 404/409            |
| API-GROLE-REM-003 | Sin permiso        | 403                |
| API-GROLE-REM-004 | Auditoría generada | pasa               |

---

## 15. Pruebas API — Tenant Users

## 15.1. Listar usuarios del tenant

Endpoint:

```text id="4zj2o4"
GET /api/v1/tenant/users
```

| ID                 | Caso                           | Resultado esperado |
| ------------------ | ------------------------------ | ------------------ |
| API-TUSER-LIST-001 | TenantAdmin A lista usuarios A | 200                |
| API-TUSER-LIST-002 | Sin token                      | 401                |
| API-TUSER-LIST-003 | Sin membership                 | 403                |
| API-TUSER-LIST-004 | Sin permiso `users.read`       | 403                |
| API-TUSER-LIST-005 | No incluye usuarios Tenant B   | pasa               |
| API-TUSER-LIST-006 | Filtrar por roleCode           | correcto           |
| API-TUSER-LIST-007 | Tenant suspended               | 403 o limitado     |

---

## 15.2. Crear invitación

Endpoint:

```text id="8d1c6k"
POST /api/v1/tenant/invitations
```

| ID             | Caso                                               | Resultado esperado |
| -------------- | -------------------------------------------------- | ------------------ |
| API-INVITE-001 | TenantAdmin invita usuario                         | 201                |
| API-INVITE-002 | Email inválido                                     | 422                |
| API-INVITE-003 | Role global                                        | 422/403            |
| API-INVITE-004 | Role de otro tenant                                | 422/403            |
| API-INVITE-005 | Tenant suspended                                   | 403                |
| API-INVITE-006 | Sin permiso                                        | 403                |
| API-INVITE-007 | Respuesta puede incluir invitationUrl solo una vez | pasa               |
| API-INVITE-008 | tokenHash nunca se devuelve                        | pasa               |
| API-INVITE-009 | Auditoría generada                                 | pasa               |

---

## 15.3. Listar invitaciones

Endpoint:

```text id="7d76nv"
GET /api/v1/tenant/invitations
```

| ID             | Caso                         | Resultado esperado |
| -------------- | ---------------------------- | ------------------ |
| API-INVLST-001 | Listar invitaciones Tenant A | 200                |
| API-INVLST-002 | No incluye Tenant B          | pasa               |
| API-INVLST-003 | No devuelve tokenHash        | pasa               |
| API-INVLST-004 | Filtrar por status           | correcto           |
| API-INVLST-005 | Sin permiso                  | 403                |

---

## 15.4. Revocar invitación

Endpoint:

```text id="37ph5w"
POST /api/v1/tenant/invitations/{invitationId}/revoke
```

| ID             | Caso                   | Resultado esperado |
| -------------- | ---------------------- | ------------------ |
| API-INVREV-001 | Revocar pending        | 200                |
| API-INVREV-002 | Revocar accepted       | 409                |
| API-INVREV-003 | Revocar de otro tenant | 403/404            |
| API-INVREV-004 | Sin permiso            | 403                |
| API-INVREV-005 | Auditoría generada     | pasa               |

---

## 15.5. Asignar/remover roles de membresía

Endpoints:

```text id="j1zcu8"
POST   /api/v1/tenant/memberships/{membershipId}/roles
DELETE /api/v1/tenant/memberships/{membershipId}/roles/{roleId}
```

| ID            | Caso                        | Resultado esperado  |
| ------------- | --------------------------- | ------------------- |
| API-MROLE-001 | Asignar role tenant válido  | 201                 |
| API-MROLE-002 | Asignar role global         | 422/403             |
| API-MROLE-003 | Asignar role de otro tenant | 422/403             |
| API-MROLE-004 | Membership de otro tenant   | 403/404             |
| API-MROLE-005 | Duplicado                   | 409                 |
| API-MROLE-006 | Remover role válido         | 200                 |
| API-MROLE-007 | Remover último TenantAdmin  | 409 si regla activa |
| API-MROLE-008 | Auditoría generada          | pasa                |

---

## 15.6. Revocar membresía

Endpoint:

```text id="zgbp37"
POST /api/v1/tenant/memberships/{membershipId}/revoke
```

| ID             | Caso                         | Resultado esperado  |
| -------------- | ---------------------------- | ------------------- |
| API-MEMREV-001 | Revocar membership active    | 200                 |
| API-MEMREV-002 | Membership inexistente       | 404                 |
| API-MEMREV-003 | Membership de otro tenant    | 403/404             |
| API-MEMREV-004 | Revocar último TenantAdmin   | 409 si regla activa |
| API-MEMREV-005 | Usuario revocado ya no opera | 403                 |
| API-MEMREV-006 | Auditoría generada           | pasa                |

---

## 16. Pruebas API — Current User

## 16.1. `/me`

| ID         | Caso                         | Resultado esperado |
| ---------- | ---------------------------- | ------------------ |
| API-ME-001 | Usuario autenticado          | 200                |
| API-ME-002 | Sin token                    | 401                |
| API-ME-003 | Token válido sin UserProfile | 403/404            |
| API-ME-004 | Usuario disabled             | 403                |

---

## 16.2. `/me/tenants`

| ID            | Caso                     | Resultado esperado |
| ------------- | ------------------------ | ------------------ |
| API-METEN-001 | Usuario con tenants      | 200                |
| API-METEN-002 | No devuelve revoked      | pasa               |
| API-METEN-003 | Incluye roles por tenant | pasa               |
| API-METEN-004 | Usuario sin tenants      | lista vacía o 200  |
| API-METEN-005 | Usuario disabled         | 403                |

---

## 16.3. `/me/permissions`

| ID             | Caso                              | Resultado esperado        |
| -------------- | --------------------------------- | ------------------------- |
| API-MEPERM-001 | Tenant activo con membership      | permisos                  |
| API-MEPERM-002 | Tenant sin membership             | 403                       |
| API-MEPERM-003 | Tenant suspended                  | 403 o permisos bloqueados |
| API-MEPERM-004 | Membership revoked                | 403                       |
| API-MEPERM-005 | No mezcla permisos de otro tenant | pasa                      |
| API-MEPERM-006 | Permisos deduplicados             | pasa                      |

---

## 16.4. `/me/switch-tenant`

| ID             | Caso                                   | Resultado esperado |
| -------------- | -------------------------------------- | ------------------ |
| API-SWITCH-001 | Cambiar a tenant con membership active | 200                |
| API-SWITCH-002 | Cambiar a tenant sin membership        | 403                |
| API-SWITCH-003 | Cambiar a tenant suspended             | 403                |
| API-SWITCH-004 | Cambiar a tenant archived              | 403                |
| API-SWITCH-005 | Usuario disabled                       | 403                |

---

## 17. Pruebas API — Invitations Public API

## 17.1. Consultar invitación por token

Endpoint:

```text id="7yj77q"
GET /api/v1/invitations/{token}
```

| ID               | Caso                     | Resultado esperado       |
| ---------------- | ------------------------ | ------------------------ |
| API-PINV-GET-001 | Token válido pending     | 200                      |
| API-PINV-GET-002 | Token inválido           | 404                      |
| API-PINV-GET-003 | Token expirado           | 409 o 404 según política |
| API-PINV-GET-004 | Token revocado           | 409 o 404                |
| API-PINV-GET-005 | No devuelve tokenHash    | pasa                     |
| API-PINV-GET-006 | No devuelve IDs internos | pasa                     |
| API-PINV-GET-007 | Rate limit aplica        | 429 al exceder           |

---

## 17.2. Aceptar invitación

Endpoint:

```text id="e49zjb"
POST /api/v1/invitations/{token}/accept
```

| ID               | Caso                     | Resultado esperado |
| ---------------- | ------------------------ | ------------------ |
| API-PINV-ACC-001 | Aceptar válida           | 200                |
| API-PINV-ACC-002 | Token inválido           | 404                |
| API-PINV-ACC-003 | Token expirado           | 409                |
| API-PINV-ACC-004 | Token revocado           | 409                |
| API-PINV-ACC-005 | Token ya aceptado        | 409                |
| API-PINV-ACC-006 | Crea membership          | pasa               |
| API-PINV-ACC-007 | Asigna rol inicial       | pasa               |
| API-PINV-ACC-008 | No permite reutilización | pasa               |
| API-PINV-ACC-009 | Auditoría generada       | pasa               |

---

## 18. Pruebas de autorización

## 18.1. Platform authorization

| ID            | Usuario         | Endpoint                    | Resultado |
| ------------- | --------------- | --------------------------- | --------- |
| AUTH-PLAT-001 | PlatformAdmin   | POST `/platform/users`      | 201       |
| AUTH-PLAT-002 | PlatformSupport | POST `/platform/users`      | 403       |
| AUTH-PLAT-003 | TenantAdmin     | GET `/platform/users`       | 403       |
| AUTH-PLAT-004 | Anonymous       | GET `/platform/users`       | 401       |
| AUTH-PLAT-005 | PlatformAuditor | GET `/platform/permissions` | 200       |
| AUTH-PLAT-006 | PlatformAuditor | POST global role            | 403       |

---

## 18.2. Tenant authorization

| ID           | Usuario                     | Endpoint                   | Resultado |
| ------------ | --------------------------- | -------------------------- | --------- |
| AUTH-TEN-001 | TenantAdmin A               | GET `/tenant/users` A      | 200       |
| AUTH-TEN-002 | Resident A                  | GET `/tenant/users` A      | 403       |
| AUTH-TEN-003 | TenantAdmin A               | Invitar a A                | 201       |
| AUTH-TEN-004 | TenantAdmin A               | Operar Tenant B            | 403/404   |
| AUTH-TEN-005 | User sin membership         | `/tenant/users`            | 403       |
| AUTH-TEN-006 | User con membership revoked | `/tenant/users`            | 403       |
| AUTH-TEN-007 | Disabled user               | cualquier endpoint privado | 403       |

---

## 19. Pruebas multitenant

| ID     | Caso                                                             | Resultado esperado |
| ------ | ---------------------------------------------------------------- | ------------------ |
| MT-001 | Usuario con TenantAdmin en A no tiene TenantAdmin en B           | pasa               |
| MT-002 | Permisos de A no aparecen en B                                   | pasa               |
| MT-003 | Listar usuarios A no incluye B                                   | pasa               |
| MT-004 | Invitación A no crea membership B                                | pasa               |
| MT-005 | Role A no asignable a membership B                               | rechazado          |
| MT-006 | Role global no asignable como membershipRole                     | rechazado          |
| MT-007 | Auditoría de acción A registra tenantId A                        | pasa               |
| MT-008 | Switch tenant requiere membership activa                         | pasa               |
| MT-009 | Tenant suspended bloquea operación ordinaria                     | pasa               |
| MT-010 | Usuario con roles distintos por tenant recibe permisos distintos | pasa               |

---

## 20. Pruebas de seguridad

## 20.1. Token de invitación

| ID            | Caso                              | Resultado esperado |
| ------------- | --------------------------------- | ------------------ |
| SEC-TOKEN-001 | token original no se almacena     | pasa               |
| SEC-TOKEN-002 | tokenHash no se devuelve          | pasa               |
| SEC-TOKEN-003 | token no aparece en logs          | pasa               |
| SEC-TOKEN-004 | token inválido no revela detalles | 404                |
| SEC-TOKEN-005 | token expirado no reutilizable    | 409                |
| SEC-TOKEN-006 | token accepted no reutilizable    | 409                |

---

## 20.2. Escalamiento de privilegios

| ID           | Caso                                              | Resultado esperado |
| ------------ | ------------------------------------------------- | ------------------ |
| SEC-PRIV-001 | TenantAdmin asigna PlatformAdmin                  | 403                |
| SEC-PRIV-002 | TenantAdmin asigna role de otro tenant            | 403/422            |
| SEC-PRIV-003 | Usuario sin `users.roles.assign` asigna rol       | 403                |
| SEC-PRIV-004 | Usuario modifica role system                      | 403                |
| SEC-PRIV-005 | Usuario disabled conserva token válido pero opera | 403                |

---

## 20.3. Payload y validación

| ID              | Caso                      | Resultado esperado                  |
| --------------- | ------------------------- | ----------------------------------- |
| SEC-PAYLOAD-001 | Email con script          | 422                                 |
| SEC-PAYLOAD-002 | String muy largo          | 422                                 |
| SEC-PAYLOAD-003 | Campos desconocidos       | ignorado o rechazado según política |
| SEC-PAYLOAD-004 | roleId malformado         | 422                                 |
| SEC-PAYLOAD-005 | membershipId malformado   | 422                                 |
| SEC-PAYLOAD-006 | search con SQL-like input | no inyección                        |

---

## 20.4. Logs

| ID          | Caso                                 | Resultado esperado |
| ----------- | ------------------------------------ | ------------------ |
| SEC-LOG-001 | Authorization header no aparece      | pasa               |
| SEC-LOG-002 | access token no aparece              | pasa               |
| SEC-LOG-003 | invitation token no aparece          | pasa               |
| SEC-LOG-004 | tokenHash no aparece                 | pasa               |
| SEC-LOG-005 | stack trace no aparece en producción | pasa               |

---

## 21. Pruebas de auditoría

| ID      | Operación               | Evento auditable esperado |
| ------- | ----------------------- | ------------------------- |
| AUD-001 | Crear usuario           | `user.created`            |
| AUD-002 | Actualizar usuario      | `user.updated`            |
| AUD-003 | Desactivar usuario      | `user.disabled`           |
| AUD-004 | Reactivar usuario       | `user.enabled`            |
| AUD-005 | Asignar rol global      | `globalRole.assigned`     |
| AUD-006 | Remover rol global      | `globalRole.removed`      |
| AUD-007 | Crear invitación        | `invitation.created`      |
| AUD-008 | Aceptar invitación      | `invitation.accepted`     |
| AUD-009 | Revocar invitación      | `invitation.revoked`      |
| AUD-010 | Crear membership        | `membership.created`      |
| AUD-011 | Revocar membership      | `membership.revoked`      |
| AUD-012 | Asignar role membership | `membership.roleAssigned` |
| AUD-013 | Remover role membership | `membership.roleRemoved`  |

Campos mínimos:

```text id="h42dp8"
tenantId nullable
actorUserId
targetUserId
action
resourceType
resourceId
result
traceId
occurredAt
```

---

## 22. Pruebas de eventos

| ID      | Operación               | Evento esperado               |
| ------- | ----------------------- | ----------------------------- |
| EVT-001 | Crear usuario           | `UserProfileCreated`          |
| EVT-002 | Desactivar usuario      | `UserProfileDisabled`         |
| EVT-003 | Reactivar usuario       | `UserProfileEnabled`          |
| EVT-004 | Crear roles base tenant | `TenantBaseRolesCreated`      |
| EVT-005 | Invitar usuario         | `UserInvitedToTenant`         |
| EVT-006 | Aceptar invitación      | `TenantInvitationAccepted`    |
| EVT-007 | Crear membership        | `UserTenantMembershipCreated` |
| EVT-008 | Revocar membership      | `UserTenantMembershipRevoked` |
| EVT-009 | Asignar rol             | `UserTenantRoleAssigned`      |
| EVT-010 | Remover rol             | `UserTenantRoleRemoved`       |

---

## 23. Pruebas de observabilidad

| ID      | Caso                       | Resultado esperado           |
| ------- | -------------------------- | ---------------------------- |
| OBS-001 | Request privado exitoso    | log con traceId              |
| OBS-002 | Request privado denegado   | log con errorCode            |
| OBS-003 | Invitación creada          | métrica incrementa           |
| OBS-004 | Invitación aceptada        | métrica incrementa           |
| OBS-005 | Autorización denegada      | `authorization_denied_total` |
| OBS-006 | Error devuelve traceId     | pasa                         |
| OBS-007 | Auditoría contiene traceId | pasa                         |
| OBS-008 | Logs no contienen token    | pasa                         |

Métricas esperadas:

```text id="4f16mg"
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

## 24. Pruebas de migración

Archivo sugerido:

```text id="nkja4o"
002_create_users_roles_permissions.migration.spec.ts
```

| ID      | Caso                          | Resultado esperado |
| ------- | ----------------------------- | ------------------ |
| MIG-001 | Migración aplica en DB limpia | éxito              |
| MIG-002 | Enums creados                 | éxito              |
| MIG-003 | Tablas creadas                | éxito              |
| MIG-004 | Email unique                  | éxito              |
| MIG-005 | Keycloak subject unique       | éxito              |
| MIG-006 | Permission code unique        | éxito              |
| MIG-007 | RolePermission unique         | éxito              |
| MIG-008 | Membership unique             | éxito              |
| MIG-009 | MembershipRole unique         | éxito              |
| MIG-010 | onDelete Restrict             | éxito              |
| MIG-011 | No cascade delete peligroso   | éxito              |
| MIG-012 | Prisma Client genera          | éxito              |

---

## 25. Pruebas OpenAPI

Validar que OpenAPI incluya:

* Platform Users API;
* Platform Roles API;
* Tenant Users API;
* Current User API;
* Invitations API;
* schemas;
* errores;
* permisos;
* seguridad;
* auditoría;
* ejemplos;
* endpoints públicos de invitación con rate limit.

| ID       | Caso                                | Resultado esperado |
| -------- | ----------------------------------- | ------------------ |
| OAPI-001 | Endpoints platform documentados     | pasa               |
| OAPI-002 | Endpoints tenant documentados       | pasa               |
| OAPI-003 | Endpoints `/me` documentados        | pasa               |
| OAPI-004 | Endpoints invitations documentados  | pasa               |
| OAPI-005 | Endpoints privados tienen security  | pasa               |
| OAPI-006 | Permisos documentados               | pasa               |
| OAPI-007 | Errores estándar documentados       | pasa               |
| OAPI-008 | Token endpoints marcados rate limit | pasa               |

---

## 26. Smoke tests

Smoke tests post-deploy:

| ID        | Caso                                    | Resultado esperado |
| --------- | --------------------------------------- | ------------------ |
| SMOKE-001 | `GET /api/v1/health`                    | 200                |
| SMOKE-002 | `GET /api/v1/me` sin token              | 401                |
| SMOKE-003 | `GET /api/v1/platform/users` sin token  | 401                |
| SMOKE-004 | `GET /api/v1/invitations/invalid-token` | 404                |
| SMOKE-005 | DB responde                             | health OK          |
| SMOKE-006 | API devuelve traceId en error           | pasa               |

No ejecutar operaciones destructivas en producción.

---

## 27. Pruebas de regresión obligatorias

Cada bug futuro debe generar prueba.

Bugs críticos que siempre requieren regresión:

* usuario disabled pudo operar;
* usuario de Tenant A accedió a Tenant B;
* role global se asignó como role tenant;
* role tenant se asignó como global;
* invitación aceptada se reutilizó;
* token apareció en logs;
* permisos efectivos mezclaron tenants;
* TenantAdmin asignó PlatformAdmin;
* membership revoked siguió otorgando permisos;
* OpenAPI no documentó permiso requerido.

---

## 28. Pruebas de concurrencia básica

| ID       | Caso                                                    | Resultado esperado   |
| -------- | ------------------------------------------------------- | -------------------- |
| CONC-001 | Crear dos usuarios mismo email simultáneamente          | uno crea, otro 409   |
| CONC-002 | Aceptar misma invitación dos veces                      | una acepta, otra 409 |
| CONC-003 | Asignar mismo role dos veces                            | una asigna, otra 409 |
| CONC-004 | Revocar membership y consultar permisos simultáneamente | estado final seguro  |
| CONC-005 | Crear roles base dos veces                              | idempotente          |

---

## 29. Pruebas de idempotencia

| ID        | Caso                              | Resultado esperado      |
| --------- | --------------------------------- | ----------------------- |
| IDEMP-001 | Crear permisos base dos veces     | no duplica              |
| IDEMP-002 | Crear roles globales dos veces    | no duplica              |
| IDEMP-003 | Crear roles base tenant dos veces | no duplica              |
| IDEMP-004 | Asignar role ya asignado          | 409 o no-op documentado |
| IDEMP-005 | Revocar invitación ya revocada    | 409 o no-op documentado |

---

## 30. Organización de archivos de prueba

```text id="u97go2"
apps/api/src/modules/users-roles/tests/
├── unit/
│   ├── user-email.vo.spec.ts
│   ├── user-status.vo.spec.ts
│   ├── user-type.vo.spec.ts
│   ├── auth-provider.vo.spec.ts
│   ├── role-scope.vo.spec.ts
│   ├── permission-code.vo.spec.ts
│   ├── membership-status.vo.spec.ts
│   ├── invitation-status.vo.spec.ts
│   ├── invitation-token.vo.spec.ts
│   ├── user-profile.entity.spec.ts
│   ├── role.entity.spec.ts
│   ├── user-tenant-membership.entity.spec.ts
│   └── invitation.entity.spec.ts
│
├── application/
│   ├── effective-permissions.service.spec.ts
│   ├── invitation-token.service.spec.ts
│   ├── role-assignment-policy.service.spec.ts
│   ├── invitation-policy.service.spec.ts
│   ├── create-user-profile.use-case.spec.ts
│   ├── create-base-permissions.use-case.spec.ts
│   ├── create-global-roles.use-case.spec.ts
│   ├── create-tenant-base-roles.use-case.spec.ts
│   ├── invite-user-to-tenant.use-case.spec.ts
│   ├── accept-tenant-invitation.use-case.spec.ts
│   ├── assign-role-to-membership.use-case.spec.ts
│   └── revoke-membership.use-case.spec.ts
│
├── integration/
│   ├── users-roles.persistence.integration.spec.ts
│   ├── prisma-user-profile.repository.integration.spec.ts
│   ├── prisma-role.repository.integration.spec.ts
│   ├── prisma-permission.repository.integration.spec.ts
│   ├── prisma-membership.repository.integration.spec.ts
│   ├── prisma-invitation.repository.integration.spec.ts
│   ├── users-roles.seeds.integration.spec.ts
│   └── 002-create-users-roles-permissions.migration.spec.ts
│
├── api/
│   ├── platform-users.api.spec.ts
│   ├── platform-roles.api.spec.ts
│   ├── tenant-users.api.spec.ts
│   ├── current-user.api.spec.ts
│   └── invitations.api.spec.ts
│
├── authorization/
│   ├── platform-users.authorization.spec.ts
│   ├── tenant-users.authorization.spec.ts
│   └── current-user.authorization.spec.ts
│
├── multitenancy/
│   └── users-roles.multitenancy.spec.ts
│
├── security/
│   ├── invitations.security.spec.ts
│   ├── privilege-escalation.security.spec.ts
│   ├── users-roles-payload.security.spec.ts
│   └── users-roles-logging.security.spec.ts
│
└── openapi/
    └── users-roles.openapi.spec.ts
```

---

## 31. Comandos esperados

Comandos específicos sugeridos:

```bash id="s9upgb"
npm run test:users-roles
npm run test:users-roles:unit
npm run test:users-roles:application
npm run test:users-roles:integration
npm run test:users-roles:api
npm run test:users-roles:authorization
npm run test:users-roles:multitenancy
npm run test:users-roles:security
```

Comandos generales:

```bash id="yac0nt"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run openapi:validate
npm run build
```

---

## 32. Requisitos para CI

En pull request deben correr como mínimo:

```text id="661w9v"
lint
typecheck
unit tests
application tests
integration tests críticos
API tests
authorization tests
multitenancy tests
security tests críticos
OpenAPI validation
build
```

Antes de producción:

```text id="fjfil0"
full test suite
migration tests
seed tests
authorization tests completos
multitenancy tests completos
smoke tests staging
```

---

## 33. Gates de calidad

No se permite merge si falla:

* UserStatus disabled blocking;
* email unique;
* Keycloak subject unique;
* role global vs tenant separation;
* effective permissions;
* invitation token security;
* invitation expiration;
* invitation one-time use;
* tenant membership validation;
* authorization tests;
* multitenancy tests;
* OpenAPI validation.

---

## 34. Matriz de trazabilidad

| Requisito                           | Pruebas asociadas                 |
| ----------------------------------- | --------------------------------- |
| FR-001 Crear UserProfile            | APP-USER-CREATE, API-PUSER-CREATE |
| FR-002 Vincular Keycloak            | APP-USER-CREATE, INT-DB           |
| FR-003 Crear roles globales         | APP-GROLE, INT-SEED               |
| FR-004 Crear roles tenant           | APP-TROLE, INT-SEED               |
| FR-005 Crear permisos               | APP-PERM-SEED                     |
| FR-006 Asignar permisos a roles     | INT-REPO, APP-GROLE, APP-TROLE    |
| FR-007 Crear membresía              | APP-ACCEPT, API-PINV-ACC          |
| FR-008 Asignar rol a membresía      | APP-ROLE-ASSIGN, API-MROLE        |
| FR-009 Invitar usuario              | APP-INVITE, API-INVITE            |
| FR-010 Aceptar invitación           | APP-ACCEPT, API-PINV-ACC          |
| FR-011 Revocar invitación           | API-INVREV                        |
| FR-012 Revocar membresía            | APP-MEM-REV, API-MEMREV           |
| FR-013 Desactivar usuario           | APP-USER-DIS, API-PUSER-DIS       |
| FR-014 Consultar usuarios tenant    | API-TUSER-LIST, MT                |
| FR-015 Consultar permisos efectivos | SRV-PERM, API-MEPERM              |
| FR-016 Auditar cambios              | AUD                               |
| FR-017 Proteger endpoints           | AUTH                              |
| FR-018 Service accounts futuras     | UserType tests                    |

---

## 35. Riesgos cubiertos

| Riesgo                                | Pruebas             |
| ------------------------------------- | ------------------- |
| Usuario opera en tenant ajeno         | MT-001 a MT-010     |
| Token válido usado como permiso total | AUTH, SRV-PERM      |
| TenantAdmin asigna rol global         | SEC-PRIV-001        |
| Invitación reutilizada                | API-PINV-ACC-008    |
| Invitación no expira                  | APP-ACCEPT-003      |
| Usuario disabled opera                | API-PUSER-DIS-004   |
| Permisos mezclados                    | API-MEPERM-005      |
| Token en logs                         | SEC-LOG-003         |
| Membership revoked opera              | API-MEMREV-005      |
| Role de otro tenant asignado          | APP-ROLE-ASSIGN-003 |

---

## 36. Criterios de salida

El módulo `002-users-roles` puede considerarse probado si:

* todas las pruebas unitarias pasan;
* pruebas de casos de uso pasan;
* migración validada;
* seeds idempotentes;
* API tests pasan;
* authorization tests pasan;
* multitenancy tests pasan;
* security tests críticos pasan;
* OpenAPI actualizado;
* auditoría validada;
* eventos validados;
* smoke tests pasan;
* no hay exposición de token de invitación;
* no hay bypass de permisos;
* no hay acceso cross-tenant;
* usuario disabled queda bloqueado.

---

## 37. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="dy2qhd"
- MFA completo diferido.
- Service accounts completas diferidas.
- Integración n8n diferida.
- Roles personalizados por tenant diferidos.
- Políticas ABAC complejas diferidas.
- Relación completa usuario-persona-unidad diferida a 003-residents-properties.
- Tests UI diferidos.
```

Estos pendientes no bloquean `002-users-roles`.

---

## 38. Decisión final del test plan

El módulo `002-users-roles` deberá probarse con unit tests, application tests, integration tests, migration tests, API tests, authorization tests, multitenancy tests, security tests, audit tests, event tests, OpenAPI tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="73t7r7"
- separación de roles globales y tenant;
- membresía activa como requisito de acceso;
- usuario activo como requisito de operación;
- permisos efectivos por tenant;
- invitaciones seguras;
- tokens hasheados;
- no reutilización de invitaciones;
- auditoría de cambios de acceso;
- bloqueo de escalamiento de privilegios;
- no acceso cross-tenant.
```

Ninguna implementación de este módulo debe aceptarse si permite que un usuario opere en otro tenant, que un usuario disabled ejecute operaciones, que una invitación sea reutilizada, que un TenantAdmin asigne roles globales o que los permisos efectivos mezclen tenants.
