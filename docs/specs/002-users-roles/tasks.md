# Tasks — Spec 002 Users, Roles, Permissions and Tenant Memberships

## 1. Información del documento

| Campo           | Valor                                        |
| --------------- | -------------------------------------------- |
| Proyecto        | RESIDENT Core                                |
| Spec ID         | 002                                          |
| Módulo          | Users, Roles and Access Management           |
| Documento       | Implementation Tasks                         |
| Ruta            | `docs/specs/002-users-roles/tasks.md`        |
| Versión         | 0.1                                          |
| Estado          | Borrador inicial                             |
| Fecha           | 2026-07-13                                   |
| Documento base  | `docs/specs/002-users-roles/spec.md`         |
| Plan técnico    | `docs/specs/002-users-roles/plan.md`         |
| Modelo de datos | `docs/specs/002-users-roles/data-model.md`   |
| Contrato API    | `docs/specs/002-users-roles/api-contract.md` |
| Plan de pruebas | `docs/specs/002-users-roles/test-plan.md`    |
| Depende de      | `docs/specs/001-tenants/`                    |

---

## 2. Propósito

Este documento convierte la spec `002-users-roles` en una lista ejecutable de tareas.

Debe ser usado para implementar el módulo `Users, Roles and Access Management` siguiendo SDD.

Cada tarea debe tener:

* identificador;
* descripción;
* archivos esperados;
* dependencias;
* criterios de aceptación;
* pruebas asociadas;
* estado.

---

## 3. Convenciones de estado

Usar los siguientes estados:

```text id="a8qyj9"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="1tbdyy"
No marcar como [x] una tarea solo por estar planificada.
Marcar [x] únicamente cuando exista evidencia de implementación, prueba o registro en repositorio.
```

---

## 4. Reglas de ejecución

Antes de implementar código, se deben cumplir estas reglas:

```text id="b94yen"
1. Leer docs/specs/002-users-roles/spec.md.
2. Leer docs/specs/002-users-roles/plan.md.
3. Leer docs/specs/002-users-roles/data-model.md.
4. Leer docs/specs/002-users-roles/api-contract.md.
5. Leer docs/specs/002-users-roles/test-plan.md.
6. Revisar docs/specs/001-tenants/.
7. No modificar ADRs sin crear o actualizar un ADR.
8. No implementar frontend final.
9. No implementar pagos, alícuotas, residentes ni propiedades.
10. No implementar roles personalizados avanzados en MVP.
11. No implementar service accounts completas todavía.
12. No guardar tokens de invitación en claro.
13. No guardar contraseñas si Keycloak está activo.
14. No mezclar roles globales con roles tenant.
15. No permitir autorización solo por token Keycloak.
16. No permitir acceso cross-tenant.
17. No omitir auditoría en cambios de acceso.
18. No omitir pruebas de autorización y multitenancy.
```

---

## 5. Resumen de entregables

Al finalizar esta spec deben existir:

```text id="6f9iss"
docs/specs/002-users-roles/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Y en backend:

```text id="zbyde8"
apps/api/src/modules/users-roles/
├── users-roles.module.ts
├── platform-users.controller.ts
├── platform-roles.controller.ts
├── tenant-users.controller.ts
├── current-user.controller.ts
├── invitations.controller.ts
├── application/
├── domain/
├── infrastructure/
├── guards/
├── decorators/
├── dto/
└── tests/
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Archivo/carpeta

```text id="g0o3wv"
docs/specs/002-users-roles/
```

### Criterios de aceptación

* La carpeta existe.
* La carpeta contiene los documentos de la spec.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="pi1qib"
docs/specs/002-users-roles/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define actores.
* Define alcance.
* Define reglas de negocio.
* Define historias.
* Define requisitos funcionales y no funcionales.
* Define modelo preliminar.
* Define criterios globales.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="h3uxkf"
docs/specs/002-users-roles/plan.md
```

### Criterios de aceptación

* Define estructura de carpetas.
* Define entidades.
* Define value objects.
* Define repositorios.
* Define casos de uso.
* Define controladores.
* Define guards.
* Define auditoría.
* Define eventos.
* Define orden de implementación.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="knxtnn"
docs/specs/002-users-roles/data-model.md
```

### Criterios de aceptación

* Define tablas.
* Define enums.
* Define columnas.
* Define relaciones.
* Define constraints.
* Define índices.
* Define modelo Prisma.
* Define seeds.
* Define reglas de seguridad.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="27o1pa"
docs/specs/002-users-roles/api-contract.md
```

### Criterios de aceptación

* Define endpoints.
* Define requests.
* Define responses.
* Define permisos.
* Define errores.
* Define auditoría.
* Define eventos.
* Define contrato de invitaciones.
* Define contrato de usuario actual.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="kf6aeg"
docs/specs/002-users-roles/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define application tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define multitenancy tests.
* Define security tests.
* Define OpenAPI tests.
* Define smoke tests.

---

## TASK-007 — Registrar tareas de implementación

**Estado:** `[ ] Pending`

### Archivo

```text id="h5w882"
docs/specs/002-users-roles/tasks.md
```

### Criterios de aceptación

* Las tareas están ordenadas por fases.
* Las tareas son ejecutables.
* Cada tarea tiene criterios de aceptación.
* Los diferidos están identificados.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="yx6m50"
docs/specs/002-users-roles/security-notes.md
```

### Criterios de aceptación

* Identifica amenazas.
* Define controles.
* Define riesgos de Keycloak.
* Define riesgos de invitaciones.
* Define riesgos de escalamiento de privilegios.
* Define pruebas de seguridad mínimas.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `users-roles`

**Estado:** `[ ] Pending`

### Archivo

```text id="t2i7v1"
apps/api/src/modules/users-roles/users-roles.module.ts
```

### Criterios de aceptación

* El módulo compila.
* Puede importarse desde `AppModule`.
* No depende de módulos futuros no implementados.
* Expone providers necesarios.

---

## TASK-010 — Crear estructura de carpetas del módulo

**Estado:** `[ ] Pending`

### Estructura esperada

```text id="6e3ozh"
apps/api/src/modules/users-roles/
├── application/
├── domain/
├── infrastructure/
├── guards/
├── decorators/
├── dto/
└── tests/
```

### Criterios de aceptación

* La estructura respeta `plan.md`.
* Controladores no contienen lógica de dominio.
* Prisma no se usa directamente desde controladores.

---

## TASK-011 — Crear controladores base vacíos

**Estado:** `[ ] Pending`

### Archivos

```text id="lb757j"
platform-users.controller.ts
platform-roles.controller.ts
tenant-users.controller.ts
current-user.controller.ts
invitations.controller.ts
```

### Criterios de aceptación

* Compilan.
* Tienen rutas base correctas.
* Están registrados en `UsersRolesModule`.
* No contienen lógica de negocio.

### Rutas base

```text id="jrm653"
/api/v1/platform/users
/api/v1/platform
/api/v1/tenant
/api/v1/me
/api/v1/invitations
```

---

# 8. Fase 2 — Dominio y value objects

## TASK-012 — Crear value object `UserEmail`

**Estado:** `[ ] Pending`

### Archivo

```text id="m1o1ka"
domain/value-objects/user-email.vo.ts
```

### Criterios de aceptación

* Valida formato email.
* Normaliza lowercase.
* Aplica trim.
* Rechaza vacío.
* Tiene unit tests.

### Pruebas

```text id="ofay1x"
UT-EMAIL-001 a UT-EMAIL-006
```

---

## TASK-013 — Crear value object `UserStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="ajuzqf"
domain/value-objects/user-status.vo.ts
```

### Estados

```text id="0kv1kb"
active
inactive
disabled
pending
archived
```

### Criterios de aceptación

* Define `canOperate()`.
* Define `canAuthenticate()`.
* Bloquea `disabled` y `archived`.
* Tiene unit tests.

---

## TASK-014 — Crear value object `UserType`

**Estado:** `[ ] Pending`

### Archivo

```text id="el0gjv"
domain/value-objects/user-type.vo.ts
```

### Valores

```text id="418bks"
human
serviceAccount
```

### Criterios de aceptación

* Acepta `human`.
* Reserva `serviceAccount` para futuro.
* Rechaza valores inválidos.
* Tiene unit tests.

---

## TASK-015 — Crear value object `AuthProvider`

**Estado:** `[ ] Pending`

### Archivo

```text id="wq8c6r"
domain/value-objects/auth-provider.vo.ts
```

### Valores

```text id="4t7w84"
local
keycloak
```

### Criterios de aceptación

* Acepta `keycloak`.
* Permite `local` temporal.
* Rechaza valores inválidos.

---

## TASK-016 — Crear value object `RoleScope`

**Estado:** `[ ] Pending`

### Archivo

```text id="nd6k4j"
domain/value-objects/role-scope.vo.ts
```

### Valores

```text id="fk1neo"
global
tenant
```

### Criterios de aceptación

* Global exige `tenantId = null`.
* Tenant exige `tenantId != null`.
* Tiene unit tests.

---

## TASK-017 — Crear value object `PermissionCode`

**Estado:** `[ ] Pending`

### Archivo

```text id="uue53g"
domain/value-objects/permission-code.vo.ts
```

### Regex sugerida

```text id="njjsou"
^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$
```

### Criterios de aceptación

* Acepta `users.invite`.
* Acepta `accountStatements.read.own`.
* Rechaza formato inválido.
* Tiene unit tests.

---

## TASK-018 — Crear value object `MembershipStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="3qdj2w"
domain/value-objects/membership-status.vo.ts
```

### Estados

```text id="0phnjk"
active
invited
suspended
revoked
left
archived
```

### Criterios de aceptación

* Solo `active` puede operar.
* Rechaza estados inválidos.
* Tiene unit tests.

---

## TASK-019 — Crear value object `InvitationStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="dck10b"
domain/value-objects/invitation-status.vo.ts
```

### Estados

```text id="ml69zd"
pending
accepted
expired
revoked
cancelled
```

### Criterios de aceptación

* Solo `pending` puede aceptarse.
* Rechaza reutilización.
* Tiene unit tests.

---

## TASK-020 — Crear value object `InvitationToken`

**Estado:** `[ ] Pending`

### Archivo

```text id="13u2bu"
domain/value-objects/invitation-token.vo.ts
```

### Criterios de aceptación

* Genera token seguro.
* Hashea token.
* Compara token contra hash.
* No serializa token en logs.
* Tiene unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-021 — Crear entidad `UserProfile`

**Estado:** `[ ] Pending`

### Archivo

```text id="97lddh"
domain/entities/user-profile.entity.ts
```

### Métodos esperados

```text id="kdugy4"
disable(actorId, reason)
enable(actorId)
archive(actorId)
linkToKeycloak(subjectId)
isActive()
isDisabled()
canOperate()
```

### Criterios de aceptación

* Controla estado.
* Bloquea usuario disabled.
* No guarda contraseñas.
* Tiene unit tests.

---

## TASK-022 — Crear entidad `Role`

**Estado:** `[ ] Pending`

### Archivo

```text id="smf978"
domain/entities/role.entity.ts
```

### Criterios de aceptación

* Distingue `global` y `tenant`.
* Valida relación con `tenantId`.
* Protege roles system.
* Tiene unit tests.

---

## TASK-023 — Crear entidad `Permission`

**Estado:** `[ ] Pending`

### Archivo

```text id="pyt9op"
domain/entities/permission.entity.ts
```

### Criterios de aceptación

* Valida `code`.
* Define módulo y acción.
* No permite permisos vacíos.
* Soporta permisos system.

---

## TASK-024 — Crear entidad `RolePermission`

**Estado:** `[ ] Pending`

### Archivo

```text id="bctwvy"
domain/entities/role-permission.entity.ts
```

### Criterios de aceptación

* Relaciona role y permission.
* Evita duplicidad a nivel dominio.
* Es auditable.

---

## TASK-025 — Crear entidad `UserGlobalRole`

**Estado:** `[ ] Pending`

### Archivo

```text id="gv8uwq"
domain/entities/user-global-role.entity.ts
```

### Criterios de aceptación

* Solo permite role global.
* Soporta remoción lógica.
* Es auditable.

---

## TASK-026 — Crear entidad `UserTenantMembership`

**Estado:** `[ ] Pending`

### Archivo

```text id="40zvxb"
domain/entities/user-tenant-membership.entity.ts
```

### Métodos esperados

```text id="t5u55t"
activate()
suspend()
revoke(actorId, reason)
leave()
isActive()
canOperate()
```

### Criterios de aceptación

* Solo `active` opera.
* Revocación registra motivo.
* No elimina físicamente.
* Tiene unit tests.

---

## TASK-027 — Crear entidad `MembershipRole`

**Estado:** `[ ] Pending`

### Archivo

```text id="uu8lq7"
domain/entities/membership-role.entity.ts
```

### Criterios de aceptación

* Solo permite role tenant.
* Soporta `removedAt`.
* Es auditable.

---

## TASK-028 — Crear entidad `Invitation`

**Estado:** `[ ] Pending`

### Archivo

```text id="mhlj6l"
domain/entities/invitation.entity.ts
```

### Métodos esperados

```text id="w9srev"
accept(userId)
revoke(actorId)
expire()
canBeAccepted()
isExpired()
```

### Criterios de aceptación

* Solo `pending` acepta.
* Rechaza expirada.
* Rechaza revocada.
* Rechaza aceptada.
* Tiene unit tests.

---

## TASK-029 — Crear errores de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="1g4e9h"
user-profile-not-found.error.ts
user-email-already-exists.error.ts
keycloak-subject-already-linked.error.ts
user-disabled.error.ts
role-not-found.error.ts
permission-not-found.error.ts
membership-not-found.error.ts
membership-not-active.error.ts
membership-already-exists.error.ts
invitation-not-found.error.ts
invitation-expired.error.ts
invitation-already-used.error.ts
invitation-revoked.error.ts
role-assignment-not-allowed.error.ts
role-already-assigned.error.ts
permission-denied.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error puede mapearse a HTTP status.
* No expone detalles internos.

---

## TASK-030 — Crear eventos de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="hsebez"
user-profile-created.event.ts
user-profile-updated.event.ts
user-profile-disabled.event.ts
user-profile-enabled.event.ts
user-linked-to-keycloak.event.ts
tenant-base-roles-created.event.ts
user-invited-to-tenant.event.ts
tenant-invitation-accepted.event.ts
tenant-invitation-revoked.event.ts
user-tenant-membership-created.event.ts
user-tenant-membership-revoked.event.ts
user-tenant-role-assigned.event.ts
user-tenant-role-removed.event.ts
role-permission-assigned.event.ts
role-permission-removed.event.ts
```

### Criterios de aceptación

* Incluyen `traceId`.
* Incluyen `tenantId` cuando aplique.
* Incluyen `actorUserId` cuando aplique.
* No incluyen tokens ni datos sensibles innecesarios.

---

# 10. Fase 4 — DTOs y validación

## TASK-031 — Crear DTOs de Platform Users

**Estado:** `[ ] Pending`

### Archivos

```text id="2v4i2g"
create-user-profile.dto.ts
update-user-profile.dto.ts
disable-user-profile.dto.ts
user-profile-response.dto.ts
list-platform-users-query.dto.ts
```

### Criterios de aceptación

* Valida email.
* Valida nombre visible.
* No permite modificar status por PATCH genérico.
* No permite modificar `keycloakSubjectId` por endpoint incorrecto.
* No expone datos sensibles.

---

## TASK-032 — Crear DTOs de Platform Roles

**Estado:** `[ ] Pending`

### Archivos

```text id="e4epwy"
role-response.dto.ts
permission-response.dto.ts
assign-global-role.dto.ts
list-roles-query.dto.ts
list-permissions-query.dto.ts
```

### Criterios de aceptación

* Valida `roleId`.
* Valida filtros.
* Separa roles globales y tenant.
* No permite role tenant como global.

---

## TASK-033 — Crear DTOs de Tenant Users

**Estado:** `[ ] Pending`

### Archivos

```text id="7rj3o9"
tenant-user-response.dto.ts
invite-user-to-tenant.dto.ts
invitation-response.dto.ts
revoke-invitation.dto.ts
assign-role.dto.ts
revoke-membership.dto.ts
membership-response.dto.ts
list-tenant-users-query.dto.ts
list-invitations-query.dto.ts
```

### Criterios de aceptación

* Valida email.
* Valida `roleId`.
* Valida motivo de revocación.
* No devuelve `tokenHash`.
* No devuelve token original en listados.

---

## TASK-034 — Crear DTOs de Current User

**Estado:** `[ ] Pending`

### Archivos

```text id="wefls4"
current-user-response.dto.ts
current-user-tenant-response.dto.ts
effective-permissions-response.dto.ts
switch-tenant.dto.ts
```

### Criterios de aceptación

* Devuelve usuario actual sin datos innecesarios.
* Devuelve tenants disponibles.
* Devuelve permisos efectivos.
* Valida `tenantId`.

---

## TASK-035 — Crear DTOs de Invitations API

**Estado:** `[ ] Pending`

### Archivos

```text id="acyger"
public-invitation-response.dto.ts
accept-invitation.dto.ts
accept-invitation-response.dto.ts
```

### Criterios de aceptación

* No devuelve IDs internos innecesarios.
* No devuelve `tokenHash`.
* No devuelve token.
* Valida datos básicos del usuario invitado.

---

# 11. Fase 5 — Prisma y migración

## TASK-036 — Agregar enums a Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="8g3956"
UserStatus
UserType
AuthProvider
RoleScope
MembershipStatus
InvitationStatus
```

### Criterios de aceptación

* Enums creados.
* Mapeados según `data-model.md`.
* Prisma Client genera sin errores.

---

## TASK-037 — Agregar modelo Prisma `UserProfile`

**Estado:** `[ ] Pending`

### Archivo

```text id="io3s1o"
apps/api/prisma/schema.prisma
```

### Criterios de aceptación

* Modelo creado.
* `email` unique.
* `keycloakSubjectId` unique.
* Índices definidos.
* No contiene password ni tokens.

---

## TASK-038 — Agregar modelos Prisma de roles y permisos

**Estado:** `[ ] Pending`

### Modelos

```text id="fkqnw1"
Role
Permission
RolePermission
UserGlobalRole
```

### Criterios de aceptación

* Roles globales y tenant están separados por scope.
* Permisos tienen `code` unique.
* RolePermission unique.
* UserGlobalRole unique.
* `onDelete: Restrict`.

---

## TASK-039 — Agregar modelos Prisma de memberships e invitaciones

**Estado:** `[ ] Pending`

### Modelos

```text id="lp8rhs"
UserTenantMembership
MembershipRole
Invitation
```

### Criterios de aceptación

* Membership unique por user+tenant.
* MembershipRole unique.
* Invitation almacena `tokenHash`.
* No almacena token original.
* Índices definidos.
* `onDelete: Restrict`.

---

## TASK-040 — Agregar relaciones inversas en `Tenant`

**Estado:** `[ ] Pending`

### Modelo afectado

```text id="tctws9"
Tenant
```

### Relaciones

```text id="4epky3"
roles
memberships
invitations
```

### Criterios de aceptación

* Prisma Client genera sin errores.
* No cambia comportamiento de `001-tenants`.
* No rompe tests de tenants.

---

## TASK-041 — Crear migración `002_create_users_roles_permissions`

**Estado:** `[ ] Pending`

### Comando esperado

```bash id="9jneqk"
npm run prisma:migrate:dev -- --name 002_create_users_roles_permissions
```

### Criterios de aceptación

* Migración generada.
* SQL revisado.
* No hay cascade delete peligroso.
* Crea tablas, enums, constraints e índices.
* Aplica correctamente en local.

---

## TASK-042 — Crear mappers Prisma ↔ dominio

**Estado:** `[ ] Pending`

### Archivo

```text id="20bp0l"
infrastructure/persistence/users-roles.mapper.ts
```

### Criterios de aceptación

* Convierte Prisma a entidades/dtos.
* No expone `tokenHash`.
* No expone datos internos en DTOs públicos.
* Maneja relaciones opcionales.

---

## TASK-043 — Crear repositorios Prisma

**Estado:** `[ ] Pending`

### Archivos

```text id="hbh4h9"
prisma-user-profile.repository.ts
prisma-role.repository.ts
prisma-permission.repository.ts
prisma-membership.repository.ts
prisma-invitation.repository.ts
```

### Criterios de aceptación

* No se usa Prisma desde controladores.
* Manejan unique constraints.
* Usan transacciones donde corresponde.
* Tienen integration tests.

---

## TASK-044 — Crear seeds base

**Estado:** `[ ] Pending`

### Seeds

```text id="in3m2z"
base permissions
global roles
global role-permission mapping
tenant roles para tenants demo
tenant role-permission mapping
usuarios demo
membresías demo
```

### Criterios de aceptación

* Son idempotentes.
* Usan `example.com`.
* No usan datos reales.
* No crean contraseñas reales.
* No crean tokens reales.

---

# 12. Fase 6 — Puertos y adaptadores

## TASK-045 — Crear puertos de repositorio

**Estado:** `[ ] Pending`

### Archivos

```text id="9ojrp5"
user-profile.repository.ts
role.repository.ts
permission.repository.ts
membership.repository.ts
invitation.repository.ts
```

### Criterios de aceptación

* Contratos definidos en `plan.md`.
* No dependen de Prisma.
* Son testeables.

---

## TASK-046 — Crear `UsersRolesAuditPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="4m42et"
application/ports/users-roles-audit.port.ts
```

### Criterios de aceptación

* Registra actor.
* Registra tenant cuando aplica.
* Registra acción.
* Registra recurso.
* Registra `traceId`.
* No depende de implementación final de auditoría.

---

## TASK-047 — Crear adaptador temporal de auditoría

**Estado:** `[ ] Pending`

### Archivo

```text id="f235yr"
infrastructure/audit/users-roles-audit.adapter.ts
```

### Criterios de aceptación

* Implementa `UsersRolesAuditPort`.
* Puede escribir en logger o puerto genérico.
* No bloquea futura spec `007-audit`.
* Es testeable.

---

## TASK-048 — Crear `UsersRolesEventsPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="wzjgs8"
application/ports/users-roles-events.port.ts
```

### Criterios de aceptación

* Define `publish(event)`.
* No depende de broker externo.
* Compatible con outbox futuro.

---

## TASK-049 — Crear adaptador temporal de eventos

**Estado:** `[ ] Pending`

### Archivo

```text id="mlhmmh"
infrastructure/events/users-roles-events.adapter.ts
```

### Criterios de aceptación

* Implementa `UsersRolesEventsPort`.
* Publica internamente o registra eventos.
* No invoca n8n directamente.
* Es reemplazable.

---

## TASK-050 — Crear `KeycloakUserPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="hzgv4u"
application/ports/keycloak-user.port.ts
```

### Criterios de aceptación

* Permite validar/vincular subject futuro.
* No contiene autorización de negocio.
* Puede tener implementación mock temporal.

---

## TASK-051 — Crear puerto de correo de invitaciones

**Estado:** `[ ] Pending`

### Archivo

```text id="0a3x6e"
application/ports/passwordless-invitation-mail.port.ts
```

### Criterios de aceptación

* Define envío de invitación.
* No acopla proveedor de email.
* Puede tener implementación no-op temporal.

---

# 13. Fase 7 — Servicios de aplicación

## TASK-052 — Implementar `EffectivePermissionsService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Calcula permisos globales.
* Calcula permisos tenant-scoped.
* Valida usuario activo.
* Valida tenant activo.
* Valida membership activa.
* No mezcla tenants.
* Deduplica permisos.
* Tiene tests.

---

## TASK-053 — Implementar `InvitationTokenService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Genera token seguro.
* Hashea token.
* Compara token.
* No loggea token.
* Tiene tests.

---

## TASK-054 — Implementar `InvitationPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida status pending.
* Valida expiración.
* Valida tenant activo.
* Valida rol del tenant.
* Rechaza reutilización.
* Tiene tests.

---

## TASK-055 — Implementar `RoleAssignmentPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Impide TenantAdmin asignando rol global.
* Impide role de otro tenant.
* Impide duplicados.
* Puede proteger último TenantAdmin.
* Tiene tests.

---

## TASK-056 — Implementar `MembershipPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida membership activa.
* Valida revocación.
* Valida operación tenant-scoped.
* Bloquea revoked/suspended/archived.
* Tiene tests.

---

## TASK-057 — Implementar `BaseRolesService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Crea permisos base.
* Crea roles globales.
* Crea roles tenant.
* Asigna permisos a roles.
* Es idempotente.
* Tiene tests.

---

## TASK-058 — Implementar `KeycloakUserLinkingService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Vincula `keycloakSubjectId`.
* Valida duplicidad.
* No autoriza operaciones de negocio.
* Tiene tests.

---

# 14. Fase 8 — Casos de uso

## TASK-059 — Implementar `CreateUserProfileUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida email.
* Normaliza email.
* Valida unicidad.
* Valida `keycloakSubjectId`.
* Registra auditoría.
* Emite evento.
* Tiene tests.

---

## TASK-060 — Implementar `UpdateUserProfileUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Actualiza campos permitidos.
* Rechaza cambios de status.
* Rechaza cambios de `keycloakSubjectId`.
* Registra auditoría.
* Tiene tests.

---

## TASK-061 — Implementar `DisableUserProfileUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cambia status a disabled.
* Requiere motivo.
* Registra `disabledAt`.
* Registra `disabledBy`.
* Audita.
* Emite evento.

---

## TASK-062 — Implementar `EnableUserProfileUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Reactiva usuario disabled.
* Rechaza archived.
* Audita.
* Emite evento.

---

## TASK-063 — Implementar `LinkUserToKeycloakUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida subject.
* Evita duplicado.
* Vincula usuario.
* Audita.
* Emite evento.

---

## TASK-064 — Implementar use cases base de permisos y roles

**Estado:** `[ ] Pending`

### Use cases

```text id="m9xz2k"
CreateBasePermissionsUseCase
CreateGlobalRolesUseCase
CreateTenantBaseRolesUseCase
```

### Criterios de aceptación

* Son idempotentes.
* Crean catálogo base.
* Crean roles globales.
* Crean roles por tenant.
* Asignan permisos.
* Implementan diferido de `001-tenants`.

---

## TASK-065 — Implementar `ListPlatformUsersUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Soporta paginación.
* Soporta filtros.
* Soporta ordenamiento permitido.
* Requiere permiso global.

---

## TASK-066 — Implementar `GetPlatformUserUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Devuelve usuario por ID.
* Incluye roles globales y memberships.
* No expone datos sensibles.
* Retorna 404 si no existe.

---

## TASK-067 — Implementar `ListTenantUsersUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lista solo usuarios del tenant activo.
* Soporta paginación.
* Soporta filtros.
* No mezcla tenants.
* Tiene tests multitenant.

---

## TASK-068 — Implementar `InviteUserToTenantUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida tenant activo.
* Valida email.
* Valida role tenant.
* Valida permiso del actor.
* Genera token seguro.
* Guarda `tokenHash`.
* Devuelve URL/token solo una vez.
* Audita.
* Emite evento.

---

## TASK-069 — Implementar `AcceptTenantInvitationUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida token.
* Compara hash.
* Valida expiración.
* Valida status pending.
* Crea o vincula UserProfile.
* Crea membership active.
* Asigna rol inicial.
* Marca invitación accepted.
* Audita.
* Emite eventos.

---

## TASK-070 — Implementar `RevokeTenantInvitationUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Revoca solo pending.
* Valida tenant activo.
* Valida permiso.
* Audita.
* Emite evento.

---

## TASK-071 — Implementar `AssignRoleToMembershipUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida membership del tenant activo.
* Valida role del mismo tenant.
* Rechaza role global.
* Rechaza duplicado.
* Audita.
* Emite evento.

---

## TASK-072 — Implementar `RemoveRoleFromMembershipUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida role asignado.
* Valida tenant.
* Marca `removedAt`.
* Protege último TenantAdmin si aplica.
* Audita.
* Emite evento.

---

## TASK-073 — Implementar `RevokeMembershipUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cambia membership a revoked.
* Requiere motivo.
* Valida tenant.
* Protege último TenantAdmin si aplica.
* Audita.
* Emite evento.

---

## TASK-074 — Implementar current user use cases

**Estado:** `[ ] Pending`

### Use cases

```text id="ll40zv"
GetCurrentUserUseCase
GetCurrentUserTenantsUseCase
GetEffectivePermissionsUseCase
SwitchCurrentTenantUseCase
```

### Criterios de aceptación

* Devuelve usuario actual.
* Devuelve tenants disponibles.
* Calcula permisos efectivos.
* Cambia tenant solo con membership activa.
* Bloquea disabled user.
* Bloquea tenant suspended/archived.

---

# 15. Fase 9 — Guards, decorators y autorización

## TASK-075 — Implementar o adaptar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida token o contexto temporal.
* Resuelve UserProfile local.
* Bloquea usuario disabled.
* Bloquea usuario archived.
* Compatible con Keycloak futuro.

---

## TASK-076 — Implementar `PlatformPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos globales.
* Usa UserGlobalRole.
* Rechaza TenantAdmin en endpoints platform.
* Tiene authorization tests.

---

## TASK-077 — Implementar `TenantGuard` con memberships reales

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida tenant active.
* Valida membership active.
* No confía solo en header.
* Reemplaza mock/placeholder de `001-tenants`.

---

## TASK-078 — Implementar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos tenant-scoped.
* Usa EffectivePermissionsService.
* No mezcla tenants.
* Rechaza membership revoked/suspended.
* Tiene multitenancy tests.

---

## TASK-079 — Crear decorators de usuario, tenant y permisos

**Estado:** `[ ] Pending`

### Decorators

```text id="vdn2qo"
@CurrentUser()
@CurrentTenant()
@RequirePermission()
@RequirePlatformPermission()
@RequireTenantPermission()
```

### Criterios de aceptación

* Exponen metadata.
* Funcionan con guards.
* No contienen lógica de negocio.
* Son compatibles con OpenAPI.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-080 — Implementar `PlatformUsersController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="7ps1zk"
GET    /api/v1/platform/users
POST   /api/v1/platform/users
GET    /api/v1/platform/users/:userId
PATCH  /api/v1/platform/users/:userId
POST   /api/v1/platform/users/:userId/disable
POST   /api/v1/platform/users/:userId/enable
```

### Criterios de aceptación

* Usa use cases.
* Tiene guards.
* Tiene DTO validation.
* Tiene OpenAPI.
* Tiene API tests.

---

## TASK-081 — Implementar `PlatformRolesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="97pqg5"
GET    /api/v1/platform/roles
GET    /api/v1/platform/permissions
POST   /api/v1/platform/users/:userId/global-roles
DELETE /api/v1/platform/users/:userId/global-roles/:roleId
```

### Criterios de aceptación

* Lista roles.
* Lista permisos.
* Asigna rol global.
* Remueve rol global.
* Rechaza role tenant como global.

---

## TASK-082 — Implementar `TenantUsersController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="frmy7h"
GET    /api/v1/tenant/users
POST   /api/v1/tenant/invitations
GET    /api/v1/tenant/invitations
POST   /api/v1/tenant/invitations/:invitationId/revoke
POST   /api/v1/tenant/memberships/:membershipId/roles
DELETE /api/v1/tenant/memberships/:membershipId/roles/:roleId
POST   /api/v1/tenant/memberships/:membershipId/revoke
```

### Criterios de aceptación

* Opera solo tenant activo.
* Valida membership.
* Valida permisos.
* No permite cross-tenant.
* Audita operaciones críticas.

---

## TASK-083 — Implementar `CurrentUserController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="1jezyr"
GET  /api/v1/me
GET  /api/v1/me/tenants
GET  /api/v1/me/permissions
POST /api/v1/me/switch-tenant
```

### Criterios de aceptación

* Requiere auth.
* Bloquea disabled.
* Devuelve permisos efectivos.
* Switch tenant valida membership.

---

## TASK-084 — Implementar `InvitationsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="o71j6p"
GET  /api/v1/invitations/:token
POST /api/v1/invitations/:token/accept
```

### Criterios de aceptación

* Valida token.
* No devuelve `tokenHash`.
* No devuelve token.
* Aplica rate limit o hook preparado.
* No revela información innecesaria.

---

# 17. Fase 11 — Errores y respuestas estándar

## TASK-085 — Mapear errores de dominio a HTTP

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `USER_PROFILE_NOT_FOUND` → 404.
* `USER_EMAIL_ALREADY_EXISTS` → 409.
* `KEYCLOAK_SUBJECT_ALREADY_LINKED` → 409.
* `USER_DISABLED` → 403.
* `ROLE_NOT_FOUND` → 404.
* `ROLE_ASSIGNMENT_NOT_ALLOWED` → 403.
* `ROLE_ALREADY_ASSIGNED` → 409.
* `MEMBERSHIP_NOT_FOUND` → 404.
* `MEMBERSHIP_NOT_ACTIVE` → 403.
* `INVITATION_EXPIRED` → 409.
* `INVITATION_ALREADY_USED` → 409.
* `INVITATION_REVOKED` → 409.

---

## TASK-086 — Implementar error estándar

**Estado:** `[ ] Pending`

### Formato

```json id="d63fzc"
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not allowed to perform this action.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

### Criterios de aceptación

* Todos los errores siguen formato.
* Incluyen `traceId`.
* No exponen stack trace en producción.

---

## TASK-087 — Implementar respuesta estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Respuestas usan `data`.
* Respuestas usan `meta.traceId`.
* Listas incluyen paginación.
* No retornan entidades internas directamente.

---

# 18. Fase 12 — OpenAPI

## TASK-088 — Documentar Platform Users API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Auth documentada.
* Permisos documentados.
* Errores documentados.
* Ejemplos incluidos.

---

## TASK-089 — Documentar Platform Roles API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Roles documentados.
* Permisos documentados.
* Asignación/remoción global documentada.
* Rechazo de roles tenant como global documentado.

---

## TASK-090 — Documentar Tenant Users API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints tenant documentados.
* Permisos tenant documentados.
* Auditoría documentada.
* Errores documentados.

---

## TASK-091 — Documentar Current User API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `/me` documentado.
* `/me/tenants` documentado.
* `/me/permissions` documentado.
* `/me/switch-tenant` documentado.

---

## TASK-092 — Documentar Invitations API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints token-based documentados.
* Rate limit documentado.
* Campos prohibidos no aparecen.
* Errores de invitación documentados.

---

## TASK-093 — Agregar extensiones OpenAPI

**Estado:** `[ ] Pending`

### Ejemplos

```yaml id="ln692i"
x-required-permission: users.invite
x-audit-event: invitation.created
x-tenant-scope: tenant
```

### Criterios de aceptación

* Endpoints privados tienen permiso.
* Endpoints auditables tienen evento.
* Endpoints con token público tienen `x-public-token-endpoint`.

---

# 19. Fase 13 — Pruebas unitarias

## TASK-094 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text id="xa5d48"
user-email.vo.spec.ts
user-status.vo.spec.ts
user-type.vo.spec.ts
auth-provider.vo.spec.ts
role-scope.vo.spec.ts
permission-code.vo.spec.ts
membership-status.vo.spec.ts
invitation-status.vo.spec.ts
invitation-token.vo.spec.ts
```

### Criterios de aceptación

* Cubren todos los casos `UT-*`.
* Pasan en CI.

---

## TASK-095 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Archivos

```text id="xnc3fd"
user-profile.entity.spec.ts
role.entity.spec.ts
user-tenant-membership.entity.spec.ts
invitation.entity.spec.ts
```

### Criterios de aceptación

* Cubren estados.
* Cubren transiciones.
* Cubren errores.
* Cubren reglas críticas.

---

# 20. Fase 14 — Pruebas de aplicación

## TASK-096 — Implementar tests de permisos efectivos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usuario activo con role obtiene permisos.
* Usuario disabled no opera.
* Membership revoked no opera.
* Tenant suspended bloquea.
* Permisos no mezclan tenants.

---

## TASK-097 — Implementar tests de invitaciones

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Token válido acepta.
* Token expirado rechaza.
* Token revocado rechaza.
* Token usado rechaza.
* Token no se almacena en claro.

---

## TASK-098 — Implementar tests de políticas de asignación de roles

**Estado:** `[ ] Pending`

### Criterios de aceptación

* PlatformAdmin asigna rol global.
* TenantAdmin no asigna rol global.
* Role de otro tenant se rechaza.
* Duplicado se rechaza.
* Último TenantAdmin protegido si aplica.

---

## TASK-099 — Implementar tests de casos de uso principales

**Estado:** `[ ] Pending`

### Use cases

```text id="k57x55"
CreateUserProfileUseCase
DisableUserProfileUseCase
CreateBasePermissionsUseCase
CreateGlobalRolesUseCase
CreateTenantBaseRolesUseCase
InviteUserToTenantUseCase
AcceptTenantInvitationUseCase
AssignRoleToMembershipUseCase
RevokeMembershipUseCase
```

### Criterios de aceptación

* Caminos válidos.
* Caminos inválidos.
* Auditoría.
* Eventos.

---

# 21. Fase 15 — Pruebas de integración

## TASK-100 — Implementar migration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Enums creados.
* Tablas creadas.
* Unique constraints creadas.
* `onDelete: Restrict`.
* No cascade delete peligroso.
* Prisma Client genera.

---

## TASK-101 — Implementar repository integration tests

**Estado:** `[ ] Pending`

### Repositorios

```text id="rjvv4e"
UserProfileRepository
RoleRepository
PermissionRepository
MembershipRepository
InvitationRepository
```

### Criterios de aceptación

* CRUD controlado.
* Búsquedas críticas.
* Constraints.
* Transacciones.
* Errores mapeados.

---

## TASK-102 — Implementar seed integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Permisos base idempotentes.
* Roles globales idempotentes.
* Roles tenant idempotentes.
* Seeds no usan datos reales.
* Seeds no crean tokens reales.

---

# 22. Fase 16 — Pruebas API

## TASK-103 — Implementar tests API de Platform Users

**Estado:** `[ ] Pending`

### Archivo

```text id="ywgd58"
platform-users.api.spec.ts
```

### Criterios de aceptación

* Lista.
* Crea.
* Consulta.
* Actualiza.
* Desactiva.
* Reactiva.
* Valida errores.

---

## TASK-104 — Implementar tests API de Platform Roles

**Estado:** `[ ] Pending`

### Archivo

```text id="kzlpfl"
platform-roles.api.spec.ts
```

### Criterios de aceptación

* Lista roles.
* Lista permisos.
* Asigna rol global.
* Remueve rol global.
* Rechaza role tenant como global.

---

## TASK-105 — Implementar tests API de Tenant Users

**Estado:** `[ ] Pending`

### Archivo

```text id="zy2wge"
tenant-users.api.spec.ts
```

### Criterios de aceptación

* Lista usuarios tenant.
* Crea invitación.
* Lista invitaciones.
* Revoca invitación.
* Asigna/remueve roles.
* Revoca membership.
* No permite cross-tenant.

---

## TASK-106 — Implementar tests API de Current User

**Estado:** `[ ] Pending`

### Archivo

```text id="r9jw0a"
current-user.api.spec.ts
```

### Criterios de aceptación

* `/me`.
* `/me/tenants`.
* `/me/permissions`.
* `/me/switch-tenant`.
* Bloquea disabled.
* Bloquea sin membership.

---

## TASK-107 — Implementar tests API de Invitations

**Estado:** `[ ] Pending`

### Archivo

```text id="ohfmw8"
invitations.api.spec.ts
```

### Criterios de aceptación

* Consulta token válido.
* Rechaza token inválido.
* Rechaza expirado.
* Rechaza revocado.
* Rechaza aceptado.
* Acepta invitación válida.
* No expone `tokenHash`.

---

# 23. Fase 17 — Pruebas de autorización y multitenancy

## TASK-108 — Implementar authorization tests platform

**Estado:** `[ ] Pending`

### Criterios de aceptación

* PlatformAdmin autorizado.
* PlatformSupport limitado.
* TenantAdmin rechazado en platform.
* Anonymous recibe 401.
* Sin permiso recibe 403.

---

## TASK-109 — Implementar authorization tests tenant

**Estado:** `[ ] Pending`

### Criterios de aceptación

* TenantAdmin A opera A.
* TenantAdmin A no opera B.
* Resident no administra usuarios.
* Sin membership recibe 403.
* Revoked membership recibe 403.
* Disabled user recibe 403.

---

## TASK-110 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Roles A no aplican en B.
* Permisos A no aplican en B.
* Usuarios A no aparecen en B.
* Invitaciones A no crean membership B.
* Auditoría registra tenant correcto.

---

# 24. Fase 18 — Pruebas de seguridad

## TASK-111 — Implementar security tests de invitaciones

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Token no se almacena en claro.
* Token no aparece en logs.
* `tokenHash` no se devuelve.
* Invitación expirada no se acepta.
* Invitación aceptada no se reutiliza.

---

## TASK-112 — Implementar security tests de escalamiento de privilegios

**Estado:** `[ ] Pending`

### Criterios de aceptación

* TenantAdmin no asigna PlatformAdmin.
* Role tenant no se asigna como global.
* Role global no se asigna a membership.
* Usuario sin permiso no asigna role.
* Disabled user no opera.

---

## TASK-113 — Implementar security tests de payload

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Emails inválidos rechazados.
* Strings largos rechazados.
* IDs malformados rechazados.
* SQL-like input no inyecta.
* Campos desconocidos se manejan según política.

---

## TASK-114 — Implementar security tests de logging

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Authorization header no aparece.
* Access token no aparece.
* Invitation token no aparece.
* tokenHash no aparece.
* Stack trace no aparece en producción.

---

# 25. Fase 19 — Auditoría, eventos y observabilidad

## TASK-115 — Validar auditoría del módulo

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `user.created`.
* `user.updated`.
* `user.disabled`.
* `user.enabled`.
* `globalRole.assigned`.
* `globalRole.removed`.
* `invitation.created`.
* `invitation.accepted`.
* `invitation.revoked`.
* `membership.created`.
* `membership.revoked`.
* `membership.roleAssigned`.
* `membership.roleRemoved`.

---

## TASK-116 — Validar eventos del módulo

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Eventos principales emitidos.
* Incluyen `traceId`.
* Incluyen `tenantId` cuando aplica.
* No incluyen tokens.

---

## TASK-117 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs incluyen traceId.
* Logs incluyen actor.
* Logs incluyen tenant cuando aplica.
* No registran tokens.
* No registran payloads sensibles completos.

---

## TASK-118 — Agregar métricas básicas

**Estado:** `[ ] Pending`

### Métricas

```text id="p64mqt"
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

### Criterios de aceptación

* Métricas incrementan.
* No usan labels de alta cardinalidad innecesaria.

---

# 26. Fase 20 — CI/CD y smoke tests

## TASK-119 — Agregar comandos de test del módulo

**Estado:** `[ ] Pending`

### Comandos sugeridos

```bash id="o19mnc"
npm run test:users-roles
npm run test:users-roles:unit
npm run test:users-roles:application
npm run test:users-roles:integration
npm run test:users-roles:api
npm run test:users-roles:authorization
npm run test:users-roles:multitenancy
npm run test:users-roles:security
```

### Criterios de aceptación

* Comandos existen o equivalentes.
* Corren localmente.
* Documentados en package scripts.

---

## TASK-120 — Agregar validaciones al pipeline CI

**Estado:** `[ ] Pending`

### Criterios de aceptación

CI ejecuta:

```text id="npoin2"
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

---

## TASK-121 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="r6nmmz"
GET /api/v1/health
GET /api/v1/me sin token
GET /api/v1/platform/users sin token
GET /api/v1/invitations/invalid-token
```

### Criterios de aceptación

* Smoke tests pasan en dev/staging.
* No ejecutan operaciones destructivas.
* Errores incluyen traceId.

---

# 27. Fase 21 — Revisión SDD

## TASK-122 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas asociadas.
* Cada endpoint tiene tests API.
* Cada endpoint privado tiene authorization tests.
* Cada operación tenant-scoped tiene multitenancy tests.
* Cada operación crítica tiene auditoría.

---

## TASK-123 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs a revisar

```text id="vn1lmy"
ADR-004 Multitenancy Strategy
ADR-005 Authentication Strategy
ADR-006 Identity Provider Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* No contradice Keycloak.
* No mezcla autenticación con autorización.
* No omite membership.
* No omite permisos.
* No permite cross-tenant.
* No omite auditoría.

---

## TASK-124 — Actualizar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Contrato coincide con `api-contract.md`.
* Endpoints privados tienen auth.
* Invitaciones token-based están documentadas.
* Permisos están documentados.
* Errores están documentados.

---

## TASK-125 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos esperados

```bash id="m8z3bg"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run openapi:validate
npm run build
```

### Criterios de aceptación

* Todo pasa.
* No hay tests omitidos sin justificación.
* No hay warnings críticos.

---

## TASK-126 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="9du97d"
- PR link o commit SHA.
- Migración aplicada.
- Seeds ejecutados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 28. Fase 22 — Pendientes diferidos controlados

## TASK-127 — Diferir MFA completo

**Estado:** `[-] Deferred`

### Razón

MFA corresponde principalmente a Keycloak y hardening de identidad.

### Implementación futura

```text id="sdpcn0"
Identity hardening / Keycloak production setup
```

---

## TASK-128 — Diferir service accounts completas

**Estado:** `[-] Deferred`

### Razón

Se requiere diseño específico de credenciales, scopes, rotación y n8n.

### Implementación futura

```text id="smikcj"
docs/specs/00X-service-accounts-integrations/
```

---

## TASK-129 — Diferir roles personalizados por tenant

**Estado:** `[-] Deferred`

### Razón

MVP usa roles base system.

### Implementación futura

```text id="f6vi46"
Custom Roles and Permissions spec
```

---

## TASK-130 — Diferir relación profunda usuario-persona-unidad

**Estado:** `[-] Deferred`

### Razón

Corresponde a residentes, propietarios, arrendatarios y unidades.

### Implementación futura

```text id="l7e2le"
docs/specs/003-residents-properties/
```

---

## TASK-131 — Diferir integración n8n completa

**Estado:** `[-] Deferred`

### Razón

Requiere service accounts y workflows formales.

### Implementación futura

```text id="oiy3z9"
docs/specs/00X-n8n-integrations/
```

---

# 29. Definition of Done del módulo

El módulo `002-users-roles` estará terminado cuando:

```text id="t7jkq8"
[ ] Documentación spec completa.
[ ] Modelo Prisma implementado.
[ ] Migración creada y validada.
[ ] Seeds base creados.
[ ] Módulo NestJS creado.
[ ] DTOs implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Repositorios implementados.
[ ] Servicios de aplicación implementados.
[ ] Use cases implementados.
[ ] Guards implementados.
[ ] Decorators implementados.
[ ] Controladores implementados.
[ ] Endpoints privados protegidos.
[ ] Invitaciones seguras implementadas.
[ ] Tokens de invitación hasheados.
[ ] Permisos efectivos implementados.
[ ] Roles globales separados de roles tenant.
[ ] TenantGuard usa memberships reales.
[ ] TenantBaseRolesPort de 001 implementado.
[ ] Auditoría implementada.
[ ] Eventos implementados.
[ ] Logs y traceId implementados.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Application tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Multitenancy tests pasan.
[ ] Security tests pasan.
[ ] CI pasa.
[ ] Smoke tests pasan.
[ ] Pendientes diferidos documentados.
```

---

## 30. Orden recomendado de ejecución

```text id="5xnj7p"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-011      Estructura base
3. TASK-012 a TASK-030      Dominio
4. TASK-031 a TASK-035      DTOs
5. TASK-036 a TASK-044      Prisma, migración y seeds
6. TASK-045 a TASK-051      Puertos y adaptadores
7. TASK-052 a TASK-058      Servicios
8. TASK-059 a TASK-074      Use cases
9. TASK-075 a TASK-079      Guards y decorators
10. TASK-080 a TASK-084     Controladores
11. TASK-085 a TASK-087     Errores/respuestas
12. TASK-088 a TASK-093     OpenAPI
13. TASK-094 a TASK-114     Pruebas
14. TASK-115 a TASK-118     Auditoría, eventos, observabilidad
15. TASK-119 a TASK-121     CI/CD y smoke tests
16. TASK-122 a TASK-126     Revisión SDD
```

---

## 31. Riesgos de ejecución

| Riesgo                           | Impacto | Mitigación                    |
| -------------------------------- | ------- | ----------------------------- |
| Mezclar roles globales y tenant  | Crítico | Tablas separadas + tests      |
| Confiar solo en Keycloak         | Crítico | EffectivePermissionsService   |
| Usuario disabled opera           | Crítico | AuthGuard + tests             |
| Cross-tenant access              | Crítico | TenantGuard + MT tests        |
| Invitación reutilizable          | Alto    | InvitationStatus + tests      |
| Token de invitación en logs      | Alto    | Sanitización + security tests |
| TenantAdmin asigna PlatformAdmin | Alto    | RoleAssignmentPolicyService   |
| Role de otro tenant asignado     | Alto    | Tenant validation             |
| Seeds con datos reales           | Medio   | Revisión + tests              |
| No auditar cambios               | Alto    | Audit tests                   |
| CI sin auth tests                | Alto    | Gates obligatorios            |

---

## 32. Checklist para revisión de PR

Antes de aprobar el PR de `002-users-roles`:

```text id="a32i2s"
[ ] La implementación sigue spec.md.
[ ] No se implementó funcionalidad fuera de alcance.
[ ] No se implementaron módulos financieros.
[ ] No se implementó relación completa persona/unidad.
[ ] Prisma schema coincide con data-model.md.
[ ] Migración revisada.
[ ] No hay cascade delete peligroso.
[ ] Endpoints coinciden con api-contract.md.
[ ] Endpoints privados tienen auth.
[ ] Endpoints privados tienen permisos.
[ ] Roles globales y tenant están separados.
[ ] TenantAdmin no puede asignar rol global.
[ ] Usuario disabled no opera.
[ ] Membership revoked no opera.
[ ] Permisos efectivos no mezclan tenants.
[ ] Tokens de invitación están hasheados.
[ ] Token original no se guarda.
[ ] Token/tokenHash no aparece en logs.
[ ] Operaciones críticas generan auditoría.
[ ] Eventos esperados se emiten.
[ ] OpenAPI actualizado.
[ ] Tests pasan.
[ ] CI pasa.
[ ] No hay secrets.
[ ] No hay datos reales en seeds.
[ ] Pendientes diferidos están documentados.
```

---

## 33. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá implementada la base real de autorización:

```text id="xb463y"
- usuarios locales;
- vínculo con Keycloak;
- roles globales;
- roles por tenant;
- permisos;
- asignación de permisos;
- membresías usuario-tenant;
- roles por membresía;
- invitaciones seguras;
- tokens hasheados;
- cálculo de permisos efectivos;
- guards reales;
- auditoría de acceso;
- eventos;
- pruebas de autorización;
- pruebas multitenant.
```

Este módulo habilita el siguiente módulo funcional:

```text id="cwa35s"
docs/specs/003-residents-properties/
```

Pero antes de pasar a `003-residents-properties`, debe completarse:

```text id="4ezm4h"
docs/specs/002-users-roles/security-notes.md
```
