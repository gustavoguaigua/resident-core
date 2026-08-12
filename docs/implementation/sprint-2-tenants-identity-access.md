# Sprint 2 — Tenants, identidad y acceso

## 1. Estado del documento

- Estado de definición de alcance: `complete`
- Estado de autorización de implementación: `blocked`
- Compuerta aplicable: `docs/changes/READINESS-SPRINT-2-2026-08-11.md`
- Gaps resueltos por este documento y sus contratos: `GAP-S2-002`, `GAP-S2-003`

Este documento es el runbook autoritativo de Sprint 2. Define su frontera, sus
incrementos y sus criterios de salida. No concede por sí mismo autorización para
implementar. Mientras la compuerta de readiness mantenga la decisión `NO_GO`, no
debe iniciarse ningún incremento funcional descrito aquí.

## 2. Objetivo

Entregar la base multi-tenant de RESIDENT Core: administración de tenants,
identidades vinculadas a Keycloak, membresías, autorización, invitaciones,
auditoría durable y configuración tipada mínima.

El Sprint 2 no entrega flujos de residentes, finanzas, documentos, reservas,
comunicaciones ni otros dominios de negocio.

## 3. Fuentes normativas

La implementación debe respetar el orden de precedencia de `AGENTS.md` y, en
particular:

- `docs/sdd/constitution.md`
- los ADR aprobados aplicables;
- `docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md`
- Spec 001 — Tenant Management;
- Spec 002 — Identity and Access;
- Spec 007 — Audit Log;
- Spec 025 — Configurable Settings;
- `docs/sdd/architecture.md`;
- `docs/sdd/security.md`;
- `docs/sdd/api-guidelines.md`;
- `docs/sdd/data-governance.md`.

Si una fuente de mayor precedencia contradice este runbook, debe detenerse la
implementación afectada, registrar el gap y corregir la definición antes de
continuar.

## 4. Condiciones previas obligatorias

Sprint 2 solo puede comenzar después de que una nueva evaluación formal emita
`GO`. Como mínimo deben estar cerrados los gaps críticos restantes de la
compuerta y aprobados los contratos que afectan a implementación:

1. aprobar un único contrato de tenant activo;
2. aprobar el contrato operativo de Keycloak;
3. resolver la propiedad de configuración entre Specs 001 y 025;
4. fijar semántica mínima de auditoría;
5. convertir los gates descritos aquí en validaciones reproducibles;
6. aprobar las Specs y anexos contractuales necesarios;
7. reevaluar formalmente la compuerta de readiness.

## 5. Frontera funcional exacta

### 5.1 Spec 001 — Tenant Management

Incluido:

- modelos `Tenant`, `TenantProfile`, `TenantBranding` y
  `TenantWordPressMapping`, con los enums requeridos por esos modelos;
- creación, consulta, actualización y cambio de estado de tenants desde la
  superficie de plataforma;
- consulta y actualización del perfil y branding del tenant;
- administración del mapeo WordPress definido por la Spec 001;
- resolución pública de un tenant por `slug`, limitada a información pública;
- estados y transiciones explícitamente autorizados por la especificación;
- aislamiento de datos y auditoría de todas las mutaciones.

Superficie API máxima de este incremento:

- `GET /api/v1/platform/tenants`;
- `POST /api/v1/platform/tenants`;
- `GET /api/v1/platform/tenants/{tenantId}`;
- `PATCH /api/v1/platform/tenants/{tenantId}`;
- `POST /api/v1/platform/tenants/{tenantId}/activate`;
- `POST /api/v1/platform/tenants/{tenantId}/suspend`;
- `POST /api/v1/platform/tenants/{tenantId}/reactivate`;
- `POST /api/v1/platform/tenants/{tenantId}/archive`;
- `GET /api/v1/tenant/profile`;
- `PATCH /api/v1/tenant/profile`;
- `GET /api/v1/tenant/branding`;
- `PATCH /api/v1/tenant/branding`;
- `PATCH /api/v1/tenant/wordpress-mapping`;
- `GET /api/v1/public/tenants/{slug}`.

Excluido hasta cerrar `GAP-S2-006`:

- `TenantConfiguration`;
- `GET /tenant/configuration`;
- `PATCH /tenant/configuration`;
- cualquier duplicación entre configuración del tenant y Spec 025.

### 5.2 Spec 002 — Identity and Access

Incluido:

- modelos `UserProfile`, `Role`, `Permission`, `RolePermission`,
  `UserGlobalRole`, `UserTenantMembership`, `MembershipRole` e `Invitation`,
  con sus enums indispensables;
- enlace unívoco entre la identidad externa de Keycloak y `UserProfile`;
- administración de usuarios, roles, permisos y roles globales desde la
  superficie de plataforma definida por la Spec 002;
- administración de membresías, roles de membresía e invitaciones desde la
  superficie del tenant;
- revocación explícita de membresías y roles;
- endpoints de autoservicio `/me`, tenants disponibles y permisos efectivos;
- lectura y aceptación de invitaciones mediante token opaco;
- almacenamiento exclusivo del hash del token de invitación;
- expiración, revocación y uso único de invitaciones;
- autorización por permisos efectivos y tenant activo.

La operación para seleccionar o cambiar el tenant activo queda reservada hasta
cerrar `GAP-S2-004`. No se implementarán simultáneamente contratos alternativos
como `/auth/switch-tenant` y `/me/switch-tenant`.

Superficie API máxima, salvo la ruta reservada de cambio de tenant activo:

- `GET /api/v1/platform/users`;
- `POST /api/v1/platform/users`;
- `GET /api/v1/platform/users/{userId}`;
- `PATCH /api/v1/platform/users/{userId}`;
- `POST /api/v1/platform/users/{userId}/disable`;
- `POST /api/v1/platform/users/{userId}/enable`;
- `GET /api/v1/platform/roles`;
- `GET /api/v1/platform/permissions`;
- `POST /api/v1/platform/users/{userId}/global-roles`;
- `DELETE /api/v1/platform/users/{userId}/global-roles/{roleId}`;
- `GET /api/v1/tenant/users`;
- `POST /api/v1/tenant/invitations`;
- `GET /api/v1/tenant/invitations`;
- `POST /api/v1/tenant/invitations/{invitationId}/revoke`;
- `POST /api/v1/tenant/memberships/{membershipId}/roles`;
- `DELETE /api/v1/tenant/memberships/{membershipId}/roles/{roleId}`;
- `POST /api/v1/tenant/memberships/{membershipId}/revoke`;
- `GET /api/v1/me`;
- `GET /api/v1/me/tenants`;
- `GET /api/v1/me/permissions`;
- `GET /api/v1/invitations/{token}`;
- `POST /api/v1/invitations/{token}/accept`.

Excluido:

- almacenamiento de contraseñas o refresh tokens en RESIDENT Core;
- autenticación propietaria paralela a Keycloak;
- envío real de correo de invitación, salvo que otro sprint lo autorice;
- UI de login, selección de tenant o administración de acceso;
- reglas de negocio embebidas en roles de Keycloak.

### 5.3 Integración base con Keycloak

Incluido, una vez cerrado `GAP-S2-005`:

- realm versionado y reproducible `resident` para desarrollo y pruebas;
- clientes, audiences, scopes y claims con identificadores canónicos;
- configuración local sintética, sin secretos reales;
- validación Bearer de firma, issuer, audience, expiración y `sub`;
- resolución de `sub` hacia un `UserProfile` activo;
- rechazo de identidades desconocidas, deshabilitadas o inválidas;
- implementación del puerto de resolución de identidad previsto por la
  arquitectura;
- health check de Keycloak cuando la dependencia quede activada;
- pruebas positivas y negativas del contrato OIDC.

Keycloak autentica. RESIDENT Core conserva la autoridad sobre tenants,
membresías, roles de negocio, permisos y estados de acceso.

### 5.3.1 Bootstrap de plataforma y tenant

El contrato autoritativo es
`docs/changes/GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md`.

- El primer PlatformAdmin se crea mediante comando operativo one-shot, nunca HTTP.
- Su identidad debe existir, estar habilitada y verificada en Keycloak.
- Roles globales, UserProfile y PlatformAdmin se confirman en una transacción
  serializable, con auditoría durable.
- `POST /api/v1/platform/tenants` exige `initialAdmin.email`.
- Core resuelve el subject; ningún DTO de bootstrap puede imponerlo.
- Tenant `pendingSetup`, entidades iniciales autorizadas, UserProfile, roles base,
  membership activa, TenantAdmin y auditoría comparten una transacción PostgreSQL.
- La activación es posterior y explícita; una invitación pendiente no basta.
- No existen placeholders, cuentas implícitas, bypass de guards ni finalización
  obligatoria por eventos post-commit.

### 5.4 Spec 007 — Audit Log, base de Sprint 2

Incluido:

- modelo `AuditLog` y enums mínimos requeridos;
- adaptador PostgreSQL durable para el puerto de auditoría existente;
- registro append-only de actor, tenant cuando aplique, acción, recurso,
  resultado, trace/correlation id y timestamp;
- sanitización de payloads para excluir secretos, credenciales, tokens y datos
  prohibidos;
- cobertura de los eventos generados por tenants, identidad, membresías,
  invitaciones, autenticación y autorización de este sprint;
- pruebas de durabilidad, aislamiento y sanitización.

Catálogo mínimo de eventos:

- ciclo de vida de tenant;
- ciclo de vida y enlace de `UserProfile`;
- ciclo de vida de invitación;
- ciclo de vida de membresía;
- asignación y retiro de roles de membresía y globales;
- `authentication.denied`;
- `authorization.denied`;
- `tenantAccess.denied`.

Esta lista fija las categorías que pertenecen al sprint. Los nombres canónicos,
payloads, causalidad y garantías transaccionales deben cerrarse en `GAP-S2-007`
antes de implementar el adaptador durable.

Excluido:

- API de modificación o eliminación de auditoría;
- consulta, exportación o UI de auditoría;
- auditoría de dominios que todavía no se implementan;
- WORM, hash encadenado, SIEM y políticas avanzadas de retención.

### 5.5 Spec 025 — Configurable Settings, base de Sprint 2

Incluido, sujeto al cierre de `GAP-S2-006`:

- modelos `SettingDefinition` y `TenantSettingValue`, con enums mínimos;
- catálogo determinista cargado mediante migración o seed versionado;
- validación por esquema y tipo;
- default de plataforma y override por tenant;
- resolución interna del valor efectivo actual;
- auditoría e aislamiento tenant de todas las mutaciones;
- endpoints de solo lectura para definiciones de plataforma;
- lectura de configuración del tenant y actualización del override permitido.

Superficie API máxima:

- `GET /api/v1/platform/setting-definitions`;
- `GET /api/v1/platform/setting-definitions/{definitionId}`;
- `GET /api/v1/tenant/settings`;
- `GET /api/v1/tenant/settings/{key}`;
- `PATCH /api/v1/tenant/settings/{key}`.

Excluido:

- creación, modificación o archivo de definiciones por API;
- scheduling, historial, exportación y políticas avanzadas;
- valores secretos;
- scripts, SQL o efectos laterales ejecutables como valores;
- duplicación de campos cuyo dueño contractual sea Spec 001.

## 6. Reglas transversales obligatorias

- La autorización deniega por defecto.
- El backend resuelve identidad, tenant activo y permisos; no confía en valores
  de autoridad enviados por el cliente.
- DTOs no pueden imponer `tenantId`, actor, estados privilegiados, hashes ni
  identidad externa.
- Toda consulta tenant-scoped filtra por `tenant_id` en persistencia.
- Los cambios de estado son explícitos y no se sustituyen por borrado físico.
- Las respuestas y errores siguen `docs/sdd/api-guidelines.md`, incluida la
  excepción ya aprobada para health.
- OpenAPI se actualiza junto con cada endpoint y pasa su validación contractual.
- Logs y auditoría no exponen tokens, secretos ni datos sensibles innecesarios.
- Fixtures y seeds contienen solo datos sintéticos.
- Ningún endpoint o modelo de un dominio futuro se incorpora por conveniencia.

## 7. Fuera de Sprint 2

Quedan expresamente fuera:

- residentes y hogares;
- cuotas, ledger, pagos y estados de cuenta;
- documentos y almacenamiento documental;
- comunicaciones y notificaciones de negocio;
- reservas, incidencias, votaciones, proveedores o comunidad;
- frontend funcional de administración o residentes;
- integración transaccional con WordPress;
- reportes, analítica y exportaciones;
- API o persistencia propia para decisiones de readiness;
- cualquier capacidad de Specs distinta de 001, 002, la base delimitada de 007
  y la base delimitada de 025.

## 8. Secuencia de implementación después de `GO`

Los incrementos se ejecutarán en este orden y en ramas/PR cortos:

0. Cerrar prerrequisitos documentales y obtener `GO`.
1. Hacer reproducible Keycloak y cerrar el contrato OIDC.
2. Crear la persistencia mínima de Specs 001 y 002 mediante migraciones.
3. Persistir la auditoría base necesaria para mutaciones de acceso.
4. Implementar el comando one-shot del primer PlatformAdmin.
5. Implementar resolución de identidad, membresías y autorización.
6. Implementar onboarding transaccional, ciclo de vida y API de tenants.
7. Implementar invitaciones y administración posterior de membresías.
8. Implementar la configuración mínima de Spec 025.
9. Consolidar contrato OpenAPI, pruebas cruzadas y evidencia de cierre.

Un incremento no debe comenzar si depende de un contrato todavía abierto. Cada
PR debe ser desplegable, mantener los gates existentes y evitar mezclar más de
un incremento salvo que la dependencia sea inseparable y esté documentada.

## 9. Gates obligatorios

Además de formatting, lint, typecheck, tests, build, Prisma validate y Docker
Compose config ya vigentes, Sprint 2 requiere:

- migración desde una base vacía;
- verificación de estado y drift de migraciones;
- validación reproducible del realm y clientes de Keycloak;
- prueba OIDC real contra el stack local;
- concurrencia e idempotencia del primer PlatformAdmin;
- ausencia de endpoint de bootstrap y de subject en DTOs de bootstrap;
- rollback total del onboarding ante fallos en cada escritura;
- rechazo de activación sin TenantAdmin activo o con invitación pendiente;
- protección del último TenantAdmin activo;
- rechazo de firma, issuer, audience, expiración y sujeto inválidos;
- escenarios con al menos dos tenants y pruebas negativas cross-tenant;
- rechazo de tenant, usuario o membresía deshabilitados/revocados;
- pruebas negativas de permisos;
- pruebas de invitación expirada, revocada, reutilizada y hash-only;
- pruebas de durabilidad, aislamiento y sanitización de auditoría;
- pruebas de resolución, validación y aislamiento de settings;
- validación y diff del contrato OpenAPI;
- comprobación automatizada de la frontera de Sprint 2;
- smoke test del stack con las imágenes fijadas.

Este documento define los gates; `GAP-S2-008` permanece abierto hasta que sus
comandos y workflows sean reproducibles y produzcan evidencia verificable.

## 10. Criterio de cierre de Sprint 2

Sprint 2 se considera completo únicamente cuando:

1. todos los incrementos incluidos están implementados sin ampliar la frontera;
2. todos los gates obligatorios pasan en CI desde un checkout limpio;
3. las migraciones parten de una base vacía y no presentan drift;
4. el aislamiento tenant y la denegación por defecto tienen pruebas negativas;
5. Keycloak es reproducible y su contrato OIDC está verificado;
6. OpenAPI coincide con el runtime;
7. auditoría y settings cumplen el alcance mínimo aquí definido;
8. no quedan gaps críticos o altos atribuibles al alcance del sprint;
9. la evidencia de cierre queda registrada en `docs/changes/`.

## 11. Trazabilidad de la corrección

Este runbook cerró `GAP-S2-002` al fijar una frontera única. El contrato
`GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md` elimina además la circularidad de
bootstrap entre Specs 001 y 002. No cierra ni reduce por inferencia los demás
gaps. La decisión continúa siendo `NO_GO` hasta una reevaluación formal.
