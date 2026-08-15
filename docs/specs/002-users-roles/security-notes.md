# Security Notes — Spec 002 Users, Roles, Permissions and Tenant Memberships

## 1. Información del documento

| Campo           | Valor                                          |
| --------------- | ---------------------------------------------- |
| Proyecto        | RESIDENT Core                                  |
| Spec ID         | 002                                            |
| Módulo          | Users, Roles and Access Management             |
| Documento       | Security Notes                                 |
| Ruta            | `docs/specs/002-users-roles/security-notes.md` |
| Versión         | 0.1                                            |
| Estado          | accepted                                   |
| Fecha           | 2026-07-13                                     |
| Documento base  | `docs/specs/002-users-roles/spec.md`           |
| Plan técnico    | `docs/specs/002-users-roles/plan.md`           |
| Modelo de datos | `docs/specs/002-users-roles/data-model.md`     |
| Contrato API    | `docs/specs/002-users-roles/api-contract.md`   |
| Plan de pruebas | `docs/specs/002-users-roles/test-plan.md`      |
| Tareas          | `docs/specs/002-users-roles/tasks.md`          |
| Depende de      | `docs/specs/001-tenants/security-notes.md`     |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `002-users-roles`.

El módulo es crítico porque controla:

* quién puede acceder;
* a qué tenant puede acceder;
* qué roles tiene;
* qué permisos efectivos posee;
* qué invitaciones puede aceptar;
* qué operaciones puede ejecutar;
* qué actor queda registrado en auditoría.

Regla principal:

```text id="z5aypl"
Un error en usuarios, roles o permisos puede comprometer todos los tenants del sistema.
```

Este módulo debe tratarse como componente central de seguridad y autorización.

---

## 3. Principio de seguridad central

```text id="hxuequ"
Keycloak autentica.
RESIDENT Core autoriza.
```

Esto significa:

* Keycloak valida identidad.
* RESIDENT Core valida permiso.
* RESIDENT Core valida tenant.
* RESIDENT Core valida membership.
* RESIDENT Core valida estado del usuario.
* RESIDENT Core valida estado del tenant.
* RESIDENT Core valida ownership del recurso.
* RESIDENT Core registra auditoría.

Un token válido nunca debe equivaler automáticamente a autorización funcional.

---

## 4. Activos protegidos

El módulo protege los siguientes activos:

```text id="9l468x"
user_profiles
roles
permissions
role_permissions
user_global_roles
user_tenant_memberships
membership_roles
invitations
effective_permissions
invitation_tokens
authorization_decisions
audit_events
```

También protege indirectamente módulos futuros:

* residentes;
* propietarios;
* unidades;
* alícuotas;
* cargos;
* pagos;
* comprobantes;
* reportes;
* reservas;
* multas;
* auditoría;
* documentos.

---

## 5. Datos sensibles del módulo

### 5.1. Datos personales básicos

Este módulo puede almacenar:

```text id="tdgm7v"
email
displayName
firstName
lastName
membership
roles
invitation email
keycloakSubjectId
```

### 5.2. Datos de seguridad

Este módulo puede manejar:

```text id="g2odj4"
access token recibido en headers
keycloak subject id
invitation token original
invitation token hash
authorization decisions
effective permissions
audit traceId
```

### 5.3. Datos que no deben almacenarse

El módulo no debe almacenar:

```text id="rt9ajz"
passwords si Keycloak está activo
passwords en texto plano
refresh tokens
access tokens
invitation token original
client secrets
API keys
datos bancarios
cédulas
comprobantes
saldos
datos médicos
biométricos
```

---

## 6. Superficies de ataque

## 6.1. Platform Users API

Ruta:

```text id="j4jlw7"
/api/v1/platform/users
```

Riesgos:

* creación no autorizada de usuarios;
* desactivación maliciosa de usuarios;
* reactivación indebida;
* consulta global excesiva;
* exposición de usuarios de múltiples tenants;
* modificación de usuarios sin permiso.

---

## 6.2. Platform Roles API

Ruta:

```text id="rza1fn"
/api/v1/platform/roles
/api/v1/platform/permissions
/api/v1/platform/users/{userId}/global-roles
```

Riesgos:

* asignación indebida de roles globales;
* TenantAdmin asignándose PlatformAdmin;
* exposición de matriz de permisos;
* modificación indirecta de privilegios;
* eliminación o remoción indebida de roles críticos.

---

## 6.3. Tenant Users API

Ruta:

```text id="8iw46f"
/api/v1/tenant/users
/api/v1/tenant/invitations
/api/v1/tenant/memberships
```

Riesgos:

* TenantAdmin de Tenant A opera Tenant B;
* usuario sin permiso invita usuarios;
* usuario asigna rol no permitido;
* usuario revoca membresía crítica;
* usuario remueve último TenantAdmin;
* consulta usuarios de otro tenant;
* mezcla de roles entre tenants.

---

## 6.4. Current User API

Ruta:

```text id="5vyfxr"
/api/v1/me
/api/v1/me/tenants
/api/v1/me/permissions
```

Riesgos:

* usuario cambia a tenant donde no tiene membership;
* usuario disabled obtiene permisos;
* tenant suspended sigue operativo;
* permisos efectivos mezclan tenants;
* cache de permisos obsoleta;
* exposición de roles o permisos no correspondientes.

---

## 6.5. Invitations API

Ruta:

```text id="co4ca5"
/api/v1/invitations/{token}
```

Riesgos:

* token guessing;
* token reutilizado;
* token expirado aceptado;
* token revocado aceptado;
* token almacenado en logs;
* token original almacenado en base de datos;
* email enumeration;
* aceptación de invitación en tenant equivocado;
* asignación de rol global vía invitación.

---

## 6.6. Integración con Keycloak

Riesgos:

* confiar solo en claims;
* aceptar issuer incorrecto;
* aceptar audience incorrecta;
* no validar expiración;
* no validar `sub`;
* token válido sin `UserProfile`;
* usuario disabled en Core pero activo en Keycloak;
* roles de Keycloak usados como permisos finales;
* desincronización de email o subject.

---

## 6.7. Integración futura con n8n

Riesgos:

* uso de credenciales humanas;
* service account con permisos excesivos;
* workflows modificando usuarios o roles;
* secretos en workflows;
* acceso directo a PostgreSQL;
* historial de ejecución con datos sensibles;
* webhooks sin firma;
* acciones repetidas sin idempotencia.

---

## 7. Amenazas principales

## 7.1. Cross-tenant access

### Descripción

Un usuario con acceso a Tenant A intenta acceder o modificar recursos de Tenant B.

### Impacto

Crítico.

### Ejemplo

```text id="z4bb1o"
TenantAdmin de Villa Club lista usuarios de Altos del Norte.
```

### Controles

* `TenantGuard`;
* `TenantPermissionGuard`;
* membership activa;
* tenant activo;
* validación de resource ownership;
* queries siempre filtradas por `tenantId`;
* pruebas multitenant obligatorias.

### Pruebas asociadas

```text id="3w0wpe"
MT-001 a MT-010
AUTH-TEN-004
API-TUSER-LIST-005
```

---

## 7.2. Privilege escalation

### Descripción

Un usuario obtiene permisos superiores a los que le corresponden.

### Impacto

Crítico.

### Ejemplos

```text id="5r0yv2"
TenantAdmin asigna PlatformAdmin.
Resident se asigna Treasurer.
Usuario asigna role de otro tenant.
```

### Controles

* roles globales separados;
* roles tenant separados;
* `RoleAssignmentPolicyService`;
* permisos específicos;
* auditoría;
* tests de escalamiento.

### Pruebas asociadas

```text id="pn836a"
SEC-PRIV-001 a SEC-PRIV-005
APP-ROLE-ASSIGN-002
APP-ROLE-ASSIGN-003
```

---

## 7.3. Confusing authentication with authorization

### Descripción

El sistema permite operar solo porque el token de Keycloak es válido.

### Impacto

Crítico.

### Control

Toda operación privada debe validar:

```text id="2eprfx"
1. Token válido.
2. UserProfile local.
3. UserProfile active.
4. Tenant active, si aplica.
5. Membership active, si aplica.
6. Role.
7. Permission.
8. Resource ownership.
```

### Pruebas asociadas

```text id="dbz7c6"
AUTH-PLAT
AUTH-TEN
API-MEPERM
SRV-PERM
```

---

## 7.4. Disabled user still operating

### Descripción

Usuario desactivado conserva token válido y sigue usando endpoints.

### Impacto

Crítico.

### Controles

* `AuthGuard` valida `UserProfile.status`;
* `EffectivePermissionsService` bloquea disabled;
* invalidación futura de sesión/token si aplica;
* auditoría;
* tests.

### Pruebas asociadas

```text id="ftpfpx"
API-PUSER-DIS-004
AUTH-TEN-007
API-ME-004
SEC-PRIV-005
```

---

## 7.5. Invitation token compromise

### Descripción

Un token de invitación es interceptado, reutilizado o filtrado.

### Impacto

Alto.

### Controles

* token aleatorio seguro;
* token original no se almacena;
* token hash en DB;
* expiración obligatoria;
* un solo uso;
* rate limiting;
* no logs;
* auditoría.

### Pruebas asociadas

```text id="wcz9pa"
SEC-TOKEN-001 a SEC-TOKEN-006
APP-ACCEPT-002 a APP-ACCEPT-005
API-PINV-ACC
```

---

## 7.6. Role scope confusion

### Descripción

Un role global se trata como role tenant o viceversa.

### Impacto

Crítico.

### Ejemplos

```text id="03juhh"
PlatformAdmin asignado como membership role.
TenantAdmin asignado como global role.
```

### Controles

* `RoleScope`;
* `UserGlobalRole`;
* `MembershipRole`;
* constraints;
* policy service;
* tests.

### Pruebas asociadas

```text id="bb2pr1"
UT-RSCOPE
API-GROLE-ASSIGN-002
API-MROLE-002
SEC-PRIV-001
SEC-PRIV-002
```

---

## 7.7. Effective permissions mixing tenants

### Descripción

El cálculo de permisos incluye roles de otro tenant.

### Impacto

Crítico.

### Controles

* cálculo por `userProfileId + tenantId`;
* membership activa;
* role.tenantId coincide;
* no cache global sin tenant;
* tests multitenant.

### Pruebas asociadas

```text id="v56ad0"
SRV-PERM-006
API-MEPERM-005
MT-001
MT-002
MT-010
```

---

## 7.8. Email enumeration

### Descripción

Los endpoints de invitación o aceptación revelan si un email ya existe.

### Impacto

Medio.

### Controles

* mensajes genéricos;
* no indicar innecesariamente si el usuario existe;
* rate limiting;
* logs internos controlados;
* no exponer detalles en endpoints públicos de invitación.

### Pruebas asociadas

```text id="asxvog"
API-PINV-GET
SEC-PAYLOAD
SEC-TOKEN
```

---

## 7.9. Audit bypass

### Descripción

Cambios de roles, membresías o usuarios ocurren sin registro auditable.

### Impacto

Alto.

### Controles

* `UsersRolesAuditPort`;
* tests de auditoría;
* eventos;
* traceId obligatorio;
* PR checklist.

### Pruebas asociadas

```text id="mkg5ud"
AUD-001 a AUD-013
OBS-007
```

---

## 7.10. Unsafe logs

### Descripción

Logs contienen tokens, tokenHash, Authorization header o datos sensibles.

### Impacto

Alto.

### Controles

* sanitización;
* no loggear headers sensibles;
* no loggear token de invitación;
* no loggear tokenHash;
* no loggear payload completo;
* tests de logging.

### Pruebas asociadas

```text id="tgvvpl"
SEC-LOG-001 a SEC-LOG-005
OBS-008
```

---

## 8. Controles obligatorios por endpoint

## 8.1. `GET /api/v1/platform/users`

Controles:

* autenticación;
* permiso `platform.users.read`;
* paginación;
* filtros permitidos;
* no exposición de datos sensibles;
* logs con traceId.

---

## 8.2. `POST /api/v1/platform/users`

Controles:

* autenticación;
* permiso `platform.users.create`;
* validación de email;
* unicidad de email;
* unicidad de `keycloakSubjectId`;
* auditoría `user.created`;
* evento `UserProfileCreated`.

---

## 8.3. `PATCH /api/v1/platform/users/{userId}`

Controles:

* autenticación;
* permiso `platform.users.update`;
* no permitir cambio de status;
* no permitir cambio de `keycloakSubjectId`;
* auditoría `user.updated`.

---

## 8.4. `POST /api/v1/platform/users/{userId}/disable`

Controles:

* autenticación;
* permiso `platform.users.disable`;
* motivo recomendado;
* registrar `disabledAt`;
* registrar `disabledBy`;
* bloquear operación futura;
* auditoría `user.disabled`.

---

## 8.5. `POST /api/v1/platform/users/{userId}/enable`

Controles:

* autenticación;
* permiso `platform.users.enable`;
* no permitir reactivar usuario archived sin proceso especial;
* auditoría `user.enabled`.

---

## 8.6. `POST /api/v1/platform/users/{userId}/global-roles`

Controles:

* autenticación;
* permiso `platform.roles.assign`;
* role debe existir;
* role debe ser global;
* no duplicar;
* auditoría `globalRole.assigned`;
* rechazo si role es tenant.

---

## 8.7. `DELETE /api/v1/platform/users/{userId}/global-roles/{roleId}`

Controles:

* autenticación;
* permiso `platform.roles.assign`;
* role debe ser global;
* remoción lógica preferida;
* auditoría `globalRole.removed`.

---

## 8.8. `GET /api/v1/tenant/users`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `users.read`;
* listar solo tenant activo;
* no exponer usuarios de otros tenants.

---

## 8.9. `POST /api/v1/tenant/invitations`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `users.invite`;
* email válido;
* role pertenece al tenant;
* role no es global;
* actor puede asignar role;
* token seguro;
* token hash;
* expiración;
* auditoría.

---

## 8.10. `GET /api/v1/tenant/invitations`

Controles:

* autenticación;
* permiso `users.read`;
* solo tenant activo;
* no devolver token;
* no devolver tokenHash;
* paginación.

---

## 8.11. `POST /api/v1/tenant/invitations/{invitationId}/revoke`

Controles:

* autenticación;
* permiso `users.invite`;
* invitación pertenece al tenant activo;
* solo pending revocable;
* auditoría.

---

## 8.12. `POST /api/v1/tenant/memberships/{membershipId}/roles`

Controles:

* autenticación;
* permiso `users.roles.assign`;
* membership pertenece al tenant activo;
* role pertenece al tenant activo;
* role no es global;
* actor puede asignar role;
* no duplicar;
* auditoría.

---

## 8.13. `DELETE /api/v1/tenant/memberships/{membershipId}/roles/{roleId}`

Controles:

* autenticación;
* permiso `users.roles.remove`;
* membership pertenece al tenant activo;
* role pertenece al tenant activo;
* proteger último TenantAdmin si aplica;
* auditoría.

---

## 8.14. `POST /api/v1/tenant/memberships/{membershipId}/revoke`

Controles:

* autenticación;
* permiso `users.membership.revoke`;
* membership pertenece al tenant activo;
* motivo recomendado;
* proteger último TenantAdmin si aplica;
* auditoría.

---

## 8.15. `GET /api/v1/me`

Controles:

* autenticación;
* UserProfile activo;
* no exponer roles de otros tenants innecesariamente.

---

## 8.16. `GET /api/v1/me/tenants`

Controles:

* autenticación;
* no devolver memberships revocadas como operativas;
* indicar estado de tenant si se devuelve;
* no mezclar roles entre tenants.

---

## 8.17. `GET /api/v1/me/permissions`

Controles:

* autenticación;
* UserProfile activo;
* tenant activo;
* membership activa;
* cálculo tenant-scoped;
* no devolver permisos de otro tenant.

---

## 8.18. Resolución del contexto de tenant

Controles:

* autenticación;
* un único `X-Tenant-Id` UUID en endpoints tenant-scoped;
* header tratado únicamente como selector no confiable;
* tenant solicitado existe y está activo;
* membership activa;
* roles y permisos del mismo tenant;
* contexto inmutable durante el request;
* sin persistencia en sesión, cookie, Redis o base de datos;
* sin endpoint de cambio ni tenant token;
* denegación indistinguible para tenant inexistente, inactivo o sin membership.

---

## 8.19. `GET /api/v1/invitations/{token}`

Controles:

* token requerido;
* token no loggeado;
* comparar hash;
* validar status;
* validar expiración;
* no devolver tokenHash;
* no devolver IDs internos innecesarios;
* rate limiting.

---

## 8.20. `POST /api/v1/invitations/{token}/accept`

Controles:

* token requerido;
* comparar hash;
* status pending;
* no expirado;
* tenant activo;
* role tenant válido;
* crear/vincular UserProfile;
* crear membership active;
* asignar role inicial;
* marcar accepted;
* un solo uso;
* auditoría.

---

## 9. Separación entre autenticación y autorización

### 9.1. Keycloak

Keycloak puede afirmar:

```text id="kxmp6a"
quién es el usuario
cuál es su subject
si el token es válido
cuándo expira el token
qué client emitió el token
```

### 9.2. RESIDENT Core

RESIDENT Core debe decidir:

```text id="h7swcl"
si el usuario existe localmente
si está activo
si pertenece al tenant
si tiene membership activa
si tiene role válido
si tiene permiso
si el recurso pertenece al tenant
si la operación está permitida
```

### 9.3. Prohibición

Está prohibido:

```text id="ljfy6s"
permitir operación de negocio solo porque el token Keycloak es válido
```

---

## 10. Reglas de autorización

### 10.1. Endpoints platform

Requieren:

* token válido;
* UserProfile activo;
* rol global;
* permiso global.

Ejemplo:

```text id="mpmm2v"
platform.users.create
```

---

### 10.2. Endpoints tenant

Requieren:

* token válido;
* UserProfile activo;
* tenant activo;
* membership activa;
* role tenant;
* permiso tenant.

Ejemplo:

```text id="8ultsn"
users.invite
```

---

### 10.3. Endpoints invitation token-based

Requieren:

* token válido;
* invitación pending;
* no expirada;
* tenant activo;
* role válido;
* aceptación de un solo uso.

---

## 11. Reglas de multitenancy

### 11.1. Membership obligatoria

Para operar dentro de tenant:

```text id="kpop44"
UserTenantMembership.status = active
```

### 11.2. Tenant activo obligatorio

Para operación ordinaria:

```text id="m0b46g"
Tenant.status = active
```

El tenant se selecciona para cada solicitud mediante `X-Tenant-Id`; Core no confía en
el header y solo crea contexto después de validar identidad, tenant y membership. La
selección no se persiste y `tenantId` en query/body no puede reemplazarla.

### 11.3. Role del mismo tenant

Para membership roles:

```text id="2b5opn"
membership.tenantId == role.tenantId
```

### 11.4. Permisos efectivos por tenant

El cálculo debe ejecutarse siempre con:

```text id="0n2rpg"
userProfileId + tenantId
```

Nunca solo con:

```text id="82c0c7"
userProfileId
```

---

## 12. Seguridad de invitaciones

### 12.1. Generación de token

El token debe ser:

* aleatorio;
* suficientemente largo;
* no predecible;
* de un solo uso;
* no derivado del email;
* no derivado del tenant;
* no derivado del timestamp solamente.

---

### 12.2. Almacenamiento

Guardar:

```text id="okwmqz"
tokenHash
```

No guardar:

```text id="2cttd0"
token original
```

---

### 12.3. Exposición

El token original puede aparecer únicamente:

* al crear invitación si no hay envío de correo;
* en el enlace enviado por correo;
* en la URL recibida por el endpoint público.

Nunca debe aparecer en:

```text id="ye0py7"
logs
auditoría
métricas
listados
responses posteriores
errores
traces
```

---

### 12.4. Expiración

Default recomendado:

```text id="lcnif1"
72 horas
```

Una invitación expirada no puede aceptarse.

---

### 12.5. Reutilización

Estados no aceptables:

```text id="vy2468"
accepted
expired
revoked
cancelled
```

Solo `pending` puede aceptarse.

---

## 13. Seguridad de roles

### 13.1. Roles globales

Roles globales:

```text id="3btq06"
SuperAdmin
PlatformAdmin
PlatformOperator
PlatformSupport
PlatformAuditor
```

Reglas:

* solo usuarios con permiso global pueden asignarlos;
* no se asignan por invitación tenant;
* no se asignan como membership role;
* deben auditarse.

---

### 13.2. Roles tenant

Roles tenant:

```text id="xw00uc"
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

Reglas:

* pertenecen a un tenant;
* no son globales;
* no otorgan permisos en otros tenants;
* se asignan mediante membership;
* deben auditarse.

---

### 13.3. Protección del último TenantAdmin

Regla recomendada:

```text id="sy5gcd"
No permitir que un tenant activo quede sin al menos un TenantAdmin activo.
```

Si se implementa desde MVP, aplicar a:

* remoción de rol TenantAdmin;
* revocación de membership del último TenantAdmin;
* desactivación de usuario si es último TenantAdmin.

Si se difiere, debe documentarse como riesgo temporal controlado.

---

## 14. Seguridad de permisos efectivos

### 14.1. Reglas

El cálculo debe excluir:

```text id="9u2wml"
usuarios disabled
usuarios archived
tenants suspended
tenants archived
memberships revoked
memberships suspended
roles removed
roles de otro tenant
roles globales en contexto tenant
```

### 14.2. Deduplicación

Si un usuario tiene varios roles con el mismo permiso, el permiso debe aparecer una sola vez.

### 14.3. Cache futuro

Si se cachean permisos:

* key debe incluir `userProfileId`;
* key debe incluir `tenantId`;
* invalidar al cambiar roles;
* invalidar al cambiar permisos;
* invalidar al revocar membership;
* invalidar al desactivar usuario;
* invalidar al suspender tenant.

Ejemplo de key segura:

```text id="gv0ac8"
permissions:{tenantId}:{userProfileId}
```

---

## 15. Seguridad de usuarios desactivados

### 15.1. Usuario disabled

Un usuario `disabled`:

* no puede operar endpoints privados;
* no puede cambiar tenant;
* no puede consultar permisos efectivos;
* no puede aceptar invitaciones autenticadas si aplica;
* puede conservar registros históricos;
* no debe eliminarse físicamente.

### 15.2. Token válido de usuario disabled

Aunque el token sea válido, Core debe bloquear.

Resultado esperado:

```text id="sihtk5"
403 USER_DISABLED
```

---

## 16. Seguridad de datos personales

### 16.1. Principios

* minimización;
* acceso por necesidad;
* no exponer usuarios de otros tenants;
* no usar datos reales en seeds;
* no registrar emails innecesariamente;
* no enviar datos personales a IA externa.

### 16.2. Listados tenant

`GET /api/v1/tenant/users` solo debe devolver usuarios del tenant activo.

### 16.3. Listados platform

`GET /api/v1/platform/users` requiere permiso global.

---

## 17. Seguridad de logs

### 17.1. Permitido en logs

```text id="jsanli"
traceId
actorUserId
tenantId
action
result
errorCode
latencyMs
```

### 17.2. Prohibido en logs

```text id="klupme"
Authorization header
access token
refresh token
invitation token
tokenHash
cookies completas
client secrets
API keys
payload completo
stack trace en producción
```

### 17.3. Emails en logs

Los emails pueden ser datos personales.

Regla recomendada:

```text id="n6qnbb"
No registrar emails salvo que sea estrictamente necesario y con controles.
```

Preferir:

```text id="bt0r38"
targetUserId
invitationId
traceId
```

---

## 18. Seguridad de auditoría

### 18.1. Eventos obligatorios

```text id="gsazpq"
user.created
user.updated
user.disabled
user.enabled
user.keycloakLinked
globalRole.assigned
globalRole.removed
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
permissions.effectiveRead opcional
```

### 18.2. Campos mínimos

```text id="9zt8t5"
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

### 18.3. Prohibido en auditoría

```text id="ck5n6f"
invitation token
tokenHash
access token
refresh token
password
client secret
payload completo innecesario
```

---

## 19. Seguridad de Keycloak

### 19.1. Validaciones de token

Sprint 2 debe validar, antes de crear un principal:

```text id="x6m2xa"
JWT de tres segmentos y tamaño acotado
algoritmo RS256
firma contra JWKS configurado y kid conocido
issuer público exacto
audience contiene resident-api
azp es resident-admin-web o resident-resident-web
typ es Bearer
exp, iat y nbf con skew máximo de 30 segundos
subject no vacío
email_verified es true
```

Se rechazan ID tokens, `alg=none`, HMAC, introspection por request, keys embebidas,
Implicit Flow y Direct Access Grants. Ante `kid` desconocido se permite una sola
actualización JWKS controlada; sin key válida se falla cerrado.

### 19.2. Mapeo local

Luego debe buscar:

```text id="ded8wz"
UserProfile.keycloakSubjectId = token.sub
```

### 19.3. Estados locales

Aunque Keycloak indique usuario válido, Core debe validar:

```text id="oegiw7"
UserProfile.status
UserTenantMembership.status
Tenant.status
permissions
```

### 19.4. Claims no confiables para autorización final

No usar como fuente final:

```text id="wkvxw7"
tenant permissions en token
financial permissions en token
roles tenant en token
balances
membership completa
```

Estos datos pueden estar desactualizados o manipulados si la configuración es incorrecta.

### 19.5. Clientes y secretos

Los clientes web son públicos y usan Authorization Code + PKCE S256. `resident-api`
no tiene grants. El único cliente técnico de Sprint 2 es `resident-identity-admin`,
con secret fuera de Git y permisos exclusivos `query-users`/`view-users`. Las
credenciales bootstrap admin nunca se entregan a Core.

Realm JSON y fixtures no contienen users, passwords o secrets. Redirects y origins son
exactos, sin wildcard. Tokens permanecen en memoria del frontend y nunca se registran.

---

## 20. Seguridad de n8n futuro

### 20.1. Reglas

n8n no debe:

```text id="7npkm4"
usar credenciales humanas
acceder directo a PostgreSQL
guardar tokens sensibles innecesarios
modificar roles sin permiso
invitar usuarios sin auditoría
usar workflows sin trazabilidad
```

### 20.2. Service accounts futuras

Cuando se implementen:

* `userType = serviceAccount`;
* permisos mínimos;
* tenant explícito;
* scopes limitados;
* rotación de credenciales;
* auditoría;
* no acceso interactivo.

---

## 21. CORS

### 21.1. Endpoints privados

Prohibido en producción:

```text id="9ixlrg"
Access-Control-Allow-Origin: *
```

### 21.2. Endpoints invitation

Permitir solo frontend oficial de RESIDENT Core.

Ejemplo futuro:

```text id="f81lz4"
https://app.resident.example.com
```

### 21.3. Regla

CORS se configura por ambiente, no dentro de cada controlador de forma improvisada.

---

## 22. Rate limiting

Aplicar rate limiting recomendado en:

```text id="igrjpf"
POST /api/v1/tenant/invitations
GET /api/v1/invitations/{token}
POST /api/v1/invitations/{token}/accept
```

Objetivos:

* reducir token guessing;
* reducir abuso de invitaciones;
* evitar enumeración;
* proteger contexto de usuario;
* reducir ataques automatizados.

---

## 23. Validación de entrada

### 23.1. Email

Debe:

* ser requerido cuando aplique;
* tener formato válido;
* normalizarse a lowercase;
* aplicar trim;
* tener longitud máxima;
* no permitir scripts ni payloads extraños.

---

### 23.2. IDs

IDs como `userId`, `roleId`, `membershipId`, `invitationId`, `tenantId` deben validarse.

Rechazar:

```text id="gic6jw"
ids vacíos
ids malformados
payloads de inyección
objetos donde se espera string
arrays donde se espera string
```

---

### 23.3. Search

Campos `search` deben:

* limitar longitud;
* escaparse adecuadamente;
* no concatenarse en SQL;
* usarse con queries parametrizadas;
* no permitir ordenamiento por campos arbitrarios.

---

### 23.4. RoleId

Debe validar:

* existe;
* scope correcto;
* tenant correcto;
* actor puede asignarlo;
* no está removido;
* no genera escalamiento indebido.

---

## 24. Seguridad de migración

### 24.1. Riesgos

* unique constraints ausentes;
* cascade delete peligroso;
* token original en DB;
* roles globales duplicados;
* roles tenant duplicados;
* memberships duplicadas;
* relations mal definidas;
* índices ausentes.

### 24.2. Controles

* revisar SQL;
* migration tests;
* `onDelete: Restrict`;
* constraints unique;
* índices;
* seeds idempotentes;
* no tokens reales.

---

## 25. Seguridad de seeds

### 25.1. Permitido

```text id="9jx5wp"
example.com
usuarios demo
roles demo
permisos base
tenants demo
```

### 25.2. Prohibido

```text id="77z06e"
emails reales personales
contraseñas reales
tokens reales
keycloak subjects reales de producción
cédulas
datos bancarios
datos financieros
datos de residentes reales
```

### 25.3. Regla

Los seeds deben ser seguros para compartirse en repositorio, salvo configuraciones secretas que nunca deben incluirse.

---

## 26. Seguridad de errores

### 26.1. Formato estándar

```json id="dcg3cp"
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not allowed to perform this action.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

### 26.2. Prohibido

No devolver:

```text id="1pdyf3"
stack trace
SQL error completo
token hash
token original
detalles internos de Keycloak
lista de roles disponibles para atacante
si un email existe, cuando no sea necesario
```

### 26.3. Invitaciones

Para tokens inválidos, se recomienda respuesta genérica:

```text id="pp8bxs"
INVITATION_NOT_FOUND
```

sin revelar si el token estuvo cerca, expiró por tiempo, pertenece a otro tenant o si el email existe.

---

## 27. Controles por estado

## 27.1. UserStatus

| Estado     |      Puede operar |
| ---------- | ----------------: |
| `active`   |                Sí |
| `pending`  | No ordinariamente |
| `inactive` | No ordinariamente |
| `disabled` |                No |
| `archived` |                No |

---

## 27.2. MembershipStatus

| Estado      | Puede operar en tenant |
| ----------- | ---------------------: |
| `active`    |                     Sí |
| `invited`   |                     No |
| `suspended` |                     No |
| `revoked`   |                     No |
| `left`      |                     No |
| `archived`  |                     No |

---

## 27.3. InvitationStatus

| Estado      |  Puede aceptarse |
| ----------- | ---------------: |
| `pending`   | Sí, si no expiró |
| `accepted`  |               No |
| `expired`   |               No |
| `revoked`   |               No |
| `cancelled` |               No |

---

## 28. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="4a7l8o"
- usuario disabled no opera;
- usuario sin membership no opera;
- membership revoked no opera;
- TenantAdmin A no opera Tenant B;
- TenantAdmin no asigna PlatformAdmin;
- role global no se asigna como membership role;
- role tenant no se asigna como global role;
- role de Tenant A no se asigna en Tenant B;
- permisos efectivos no mezclan tenants;
- invitación expirada no se acepta;
- invitación aceptada no se reutiliza;
- invitación revocada no se acepta;
- token original no se almacena;
- tokenHash no se devuelve;
- token no aparece en logs;
- Authorization header no aparece en logs;
- seeds no contienen datos reales;
- OpenAPI documenta permisos.
```

---

## 29. Checklist de seguridad para PR

Antes de aprobar un PR de `002-users-roles`:

```text id="6xjcza"
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints platform tienen PlatformPermissionGuard.
[ ] Endpoints tenant tienen TenantGuard.
[ ] Endpoints tenant tienen TenantPermissionGuard.
[ ] Usuario disabled queda bloqueado.
[ ] Membership revoked queda bloqueada.
[ ] Tenant suspended queda bloqueado para operación ordinaria.
[ ] Roles globales y tenant están separados.
[ ] TenantAdmin no puede asignar rol global.
[ ] Role de otro tenant no puede asignarse.
[ ] Permisos efectivos incluyen tenantId.
[ ] No se mezclan permisos entre tenants.
[ ] Tokens de invitación se guardan hasheados.
[ ] Token original no se persiste.
[ ] Token/tokenHash no aparece en logs.
[ ] Listados de invitaciones no devuelven token.
[ ] Listados tenant no devuelven usuarios de otro tenant.
[ ] Cambios de roles generan auditoría.
[ ] Cambios de membership generan auditoría.
[ ] Cambios de usuario generan auditoría.
[ ] Errores no exponen detalles internos.
[ ] CORS no está abierto en endpoints privados.
[ ] Rate limit está aplicado o planificado para invitaciones.
[ ] No hay secrets en código.
[ ] No hay datos reales en seeds.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests de seguridad pasan.
```

---

## 30. Riesgos residuales aceptados en MVP

| Riesgo                               | Estado                 | Justificación                              |
| ------------------------------------ | ---------------------- | ------------------------------------------ |
| MFA completo diferido                | Aceptado temporalmente | Será gestionado principalmente en Keycloak |
| Service accounts completas diferidas | Aceptado temporalmente | Requieren spec propia                      |
| Roles personalizados diferidos       | Aceptado temporalmente | MVP usa roles system                       |
| Aprobaciones duales diferidas        | Aceptado temporalmente | Se definirán para operaciones financieras  |
| Políticas ABAC complejas diferidas   | Aceptado temporalmente | RBAC + permissions suficiente para MVP     |
| Cache de permisos diferida           | Aceptado temporalmente | Cálculo directo reduce riesgo inicial      |
| Integración n8n completa diferida    | Aceptado temporalmente | Requiere service accounts y scopes         |

---

## 31. Pendientes de seguridad para specs futuras

### 31.1. Keycloak production hardening

Debe definir:

* MFA;
* password policy;
* session policy;
* refresh token policy;
* admin console protection;
* realm backup;
* almacenamiento y rotación de secrets operativos;
* redirect URIs/origins HTTPS exactos de dominios aprobados;
* brute force protection.

---

### 31.2. Service accounts

Debe definir:

* ciclo de vida;
* credenciales;
* scopes;
* rotación;
* expiración;
* tenant binding;
* auditoría;
* n8n integration.

---

### 31.3. Audit module

Debe definir:

* tabla audit_logs;
* inmutabilidad;
* retención;
* consulta;
* exportación;
* filtros;
* permisos de auditoría.

---

### 31.4. Financial permissions

Debe definir:

* permisos por operación financiera;
* step-up authentication;
* aprobación dual;
* límites por monto;
* separación de funciones;
* auditoría reforzada.

---

### 31.5. Residents and properties

Debe definir:

* relación UserProfile ↔ Person;
* relación Person ↔ PropertyUnit;
* owner/resident/tenant roles;
* permisos `.own`;
* acceso por unidad;
* privacidad de residentes.

---

## 32. Criterios de aceptación de seguridad

La spec `002-users-roles` cumple seguridad si:

* ningún endpoint privado funciona sin autenticación;
* ningún endpoint privado permite operación sin permiso;
* usuario disabled no puede operar;
* usuario sin membership activa no puede operar en tenant;
* TenantAdmin no puede operar otro tenant;
* TenantAdmin no puede asignar rol global;
* role global no se asigna como membership role;
* role tenant no se asigna como global role;
* role de un tenant no se asigna a otro tenant;
* permisos efectivos no mezclan tenants;
* invitaciones expiran;
* invitaciones son de un solo uso;
* token original no se almacena;
* token/tokenHash no aparece en respuestas no permitidas;
* logs no contienen tokens;
* cambios de usuarios, roles y memberships se auditan;
* errores no revelan detalles internos;
* OpenAPI documenta permisos;
* tests de autorización pasan;
* tests multitenant pasan;
* tests de seguridad pasan.

---

## 33. Decisión final de seguridad

El módulo `002-users-roles` será tratado como componente crítico de seguridad porque implementa la autorización funcional de RESIDENT Core.

La seguridad del módulo se basa en:

```text id="gfd2dd"
separación autenticación/autorización
UserProfile local
UserStatus
Tenant active
Membership active
roles globales separados
roles tenant aislados
permisos granulares
cálculo de permisos efectivos
tokens de invitación hasheados
invitaciones expirables
invitaciones de un solo uso
auditoría obligatoria
eventos de dominio
logs sanitizados
pruebas de autorización
pruebas multitenant
pruebas de seguridad
```

La implementación no será aceptada si permite acceso cross-tenant, escalamiento de privilegios, uso de invitaciones reutilizadas, operación con usuario disabled, mezcla de roles globales y tenant, o autorización basada únicamente en Keycloak.

---

## 34. Controles de bootstrap

- El primer PlatformAdmin se crea solo por comando operativo one-shot.
- No existe endpoint anónimo, token maestro, rol implícito ni bypass permanente.
- Email es la entrada; Core resuelve y verifica el subject en Keycloak.
- El comando falla cerrado si Keycloak no está disponible o la identidad no es
  unívoca, habilitada y verificada.
- Roles globales, UserProfile y asignación PlatformAdmin comparten una transacción
  serializable y auditoría durable.
- El acceso inicial del tenant comparte la transacción de Spec 001 y nunca se
  completa por evento o invitación.
- La última asignación TenantAdmin activa de un tenant activo está protegida.
- Subjects, tokens y credenciales no se registran en claro en logs o auditoría.

Contrato: `docs/changes/GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md`.
