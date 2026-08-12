# GAP-S2-003 — Contrato de bootstrap de plataforma y tenant

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Gap | `GAP-S2-003` |
| Fecha | 2026-08-11 |
| Estado | `closed` |
| Alcance | Primer `PlatformAdmin` y onboarding inicial de tenant |
| Specs afectadas | 001 — Tenants; 002 — Users and Roles |
| Decisión de readiness | Continúa `NO_GO` |

## 2. Problema resuelto

Spec 001 atribuía al onboarding de tenant la creación de roles base y permitía
activar con un `TenantAdmin` o una invitación pendiente. Spec 002 era propietaria
de identidades, roles, permisos y membresías, pero asumía que el tenant ya
existía. Tampoco había una autoridad segura capaz de crear al primer
`PlatformAdmin` sin usar un endpoint anónimo o un bypass permanente.

## 3. Decisión

El bootstrap se divide en dos operaciones diferentes:

1. bootstrap único de plataforma para crear el primer `PlatformAdmin`;
2. onboarding transaccional de cada tenant, ejecutado por un `PlatformAdmin`
   autenticado y autorizado.

Keycloak es propietario de la identidad y las credenciales. RESIDENT Core es
propietario de `UserProfile`, roles, permisos, membresías, estados y auditoría.
No se intenta una transacción distribuida entre Keycloak y PostgreSQL.

## 4. Bootstrap único del primer PlatformAdmin

### 4.1. Autoridad y superficie

- Se ejecuta mediante un comando operativo interno y explícito, nunca mediante
  HTTP.
- La interfaz canónica prevista es
  `pnpm bootstrap:platform-admin -- --email <email>`; no acepta `sub`, password
  ni rol como argumentos.
- Solo puede invocarlo un operador con acceso al entorno de despliegue y a los
  secretos operativos correspondientes.
- No crea contraseñas, usuarios ni credenciales en RESIDENT Core.
- No existe endpoint anónimo, token maestro, rol implícito ni bypass de guards.
- Después de existir una asignación global activa de `PlatformAdmin`, el comando
  rechaza cualquier subject diferente con `BOOTSTRAP_ALREADY_COMPLETED`.
- Los administradores posteriores se crean mediante los casos de uso ordinarios
  autenticados de Spec 002.

### 4.2. Precondición externa

La identidad humana debe existir previamente en Keycloak, estar habilitada y
tener email verificado. El operador proporciona un email normalizado; el backend
resuelve en Keycloak el `sub` canónico. El cliente u operador no puede imponer el
`sub` directamente en una escritura de Core.

Si Keycloak no está disponible, la identidad no existe, está deshabilitada, no
tiene email verificado o la resolución no es unívoca, no se inicia ninguna
transacción de Core.

### 4.3. Transacción Core

Con la identidad ya verificada, una única transacción PostgreSQL con aislamiento
serializable:

1. adquiere exclusión mutua para el bootstrap de plataforma;
2. verifica nuevamente que no exista un `PlatformAdmin` global activo;
3. crea idempotentemente el catálogo mínimo de permisos y roles globales;
4. crea o enlaza un único `UserProfile` por email y `keycloakSubjectId`;
5. deja el `UserProfile` en estado activo;
6. asigna el rol global `PlatformAdmin`;
7. registra la auditoría durable del bootstrap;
8. confirma todos los cambios juntos.

Ante cualquier error, todos los cambios de Core se revierten. Una repetición con
el mismo subject devuelve el resultado existente sin crear duplicados; una
repetición con otro subject se rechaza. Las constraints únicas siguen siendo la
última barrera frente a concurrencia.

## 5. Onboarding transaccional del tenant

### 5.1. Autoridad y entrada

La operación canónica es `POST /api/v1/platform/tenants`. Requiere:

- autenticación Keycloak válida;
- `UserProfile` activo;
- rol global y permiso efectivo `platform.tenants.create`;
- datos mínimos del tenant;
- `initialAdmin.email` obligatorio y normalizado.

El body no acepta `keycloakSubjectId`, roles arbitrarios, estado `active`,
`tenantId`, `membershipId` ni identificadores de auditoría.

### 5.2. Preflight de identidad

Antes de abrir la transacción, el backend resuelve `initialAdmin.email` en
Keycloak y exige una identidad única, habilitada y con email verificado. Obtiene
el `sub` desde el proveedor. La ausencia o indisponibilidad del IdP aborta sin
escrituras de Core.

### 5.3. Transacción Core

Una única transacción PostgreSQL crea:

1. el `Tenant` en estado `pendingSetup`;
2. las entidades iniciales de tenant autorizadas por el runbook de Sprint 2;
3. el `UserProfile` del administrador o reutiliza el perfil que coincida tanto
   por email normalizado como por `keycloakSubjectId`;
4. los roles tenant base y sus permisos, bajo propiedad de Spec 002;
5. una `UserTenantMembership` activa entre ese perfil y el nuevo tenant;
6. una `MembershipRole` activa para el rol tenant `TenantAdmin`;
7. la auditoría durable de tenant, perfil, roles, membresía y asignación.

El módulo de tenants orquesta la operación; el módulo de identidad y acceso es
propietario de las escrituras de usuario, roles, permisos y membresía. Ambos
participan en la misma unidad de trabajo PostgreSQL. No se usan eventos para
completar pasos obligatorios ni se conserva el antiguo placeholder de roles.

### 5.4. Resultado y activación

La respuesta `201` solo se emite después del commit e incluye el tenant
`pendingSetup` y una referencia segura al administrador inicial. La publicación
de eventos es posterior al commit y no modifica el resultado transaccional.

La activación nunca es automática.
`POST /api/v1/platform/tenants/{tenantId}/activate` es una operación posterior
de `PlatformAdmin` y exige:

- configuración mínima completa;
- roles base persistidos;
- al menos una membresía activa y un rol `TenantAdmin` activo;
- tenant todavía no archivado.

Una invitación pendiente no satisface la precondición de activación.

## 6. Conflictos y recuperación

- Email y subject apuntan al mismo perfil activo: se reutiliza el perfil.
- Email y subject apuntan a perfiles diferentes: se rechaza con
  `IDENTITY_LINK_CONFLICT`.
- Perfil deshabilitado o archivado: se rechaza; el onboarding no lo reactiva.
- Slug duplicado: se rechaza con `TENANT_SLUG_ALREADY_EXISTS`.
- Fallo en cualquier escritura Core: rollback total; no queda tenant parcial.
- Fallo de Keycloak antes de la transacción: cero escrituras Core.
- Fallo de publicación posterior: el estado Core permanece confirmado y la
  notificación se reintenta por el mecanismo aprobado posteriormente.

## 7. Invariantes

- No puede existir un tenant activo sin un `TenantAdmin` activo.
- La última membresía/asignación `TenantAdmin` activa de un tenant activo no se
  puede revocar, retirar ni deshabilitar sin reemplazo válido en la misma
  transacción.
- Un rol tenant nunca se asigna como rol global ni viceversa.
- La identidad inicial siempre procede de Keycloak y se enlaza por `sub` único.
- El actor de onboarding nunca se toma del body.
- No se almacena contraseña, token OIDC ni secreto de Keycloak.
- Datos y fixtures de desarrollo son exclusivamente sintéticos.

## 8. Gates requeridos

- concurrencia de dos intentos de primer `PlatformAdmin`;
- repetición idempotente con el mismo subject y rechazo con otro subject;
- Keycloak ausente, deshabilitado, no verificado y resolución ambigua;
- conflicto email/subject;
- rollback inyectado en cada paso del onboarding;
- ausencia de tenant, roles o membresía parciales tras rollback;
- tenant creado siempre como `pendingSetup`;
- activación rechazada con invitación pendiente o sin `TenantAdmin` activo;
- protección del último `TenantAdmin` activo;
- ausencia de endpoint de bootstrap y de `sub` en DTOs públicos;
- auditoría durable y sanitizada de ambas operaciones.

## 9. Límites de esta corrección

Este contrato no cierra el transporte de tenant activo (`GAP-S2-004`), el
contrato operativo completo de Keycloak (`GAP-S2-005`) ni la semántica general
de auditoría (`GAP-S2-007`). Esas decisiones deben respetar las precondiciones e
invariantes aquí fijadas.

La decisión formal de Sprint 2 continúa siendo `NO_GO`.
