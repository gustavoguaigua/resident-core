# ADR-004 — Multitenancy Strategy: Shared Schema with Tenant Isolation v0.4

## Estado

`accepted`

## Contexto

RESIDENT Core debe servir a múltiples conjuntos residenciales con bajo costo inicial,
usuarios potencialmente vinculados a más de un tenant y aislamiento obligatorio en
datos, APIs, cache, trabajos, eventos, archivos y auditoría.

## 1. Decisión
```text
Single database + shared schema + tenant_id obligatorio + RBAC por tenant + validación backend.
```

Keycloak:
```text
Realm principal: resident.
No crear realm por conjunto en MVP.
Tenants de negocio se gestionan en Core.
```

## 2. Justificación
Shared schema reduce costo y complejidad. Realm único permite usuarios multi-tenant y evita duplicar configuración. La autorización financiera depende del dominio y queda en Core.

## 3. Resolución tenant activo

El tenant activo es contexto por solicitud, no estado de sesión. Todo endpoint
tenant-scoped exige `X-Tenant-Id: <tenant-uuid>`. El header es un selector no
confiable: Core valida el access token de Keycloak, identifica el subject, mapea un
`UserProfile` activo, carga un tenant y una membership activos, resuelve roles y
permisos y crea un `TenantContext` inmutable para ejecutar con `tenant_id`.

No existen `/auth/switch-tenant` ni `/api/v1/me/switch-tenant`, tenant token, cookie o
persistencia server-side del tenant seleccionado. La UI cambia su selección local y la
siguiente solicitud lleva el header. `tenantId` no puede seleccionar contexto desde
query o body; un `tenantId` de path en endpoints globales identifica el recurso, no
autoriza al actor. El contrato completo y sus errores están en
`docs/changes/GAP-S2-004-ACTIVE-TENANT-CONTRACT-2026-08-12.md`.

## 4. Membership y roles
UserTenantMembership contiene userProfileId, tenantId, status, invitedBy, joinedAt y timestamps; sus roles se asignan mediante MembershipRole. Globales: SuperAdmin, PlatformAdmin, PlatformOperator, PlatformSupport, PlatformAuditor. Tenant: TenantAdmin, Treasurer, BoardMember, Resident, PropertyOwner, Guard, TenantAuditor.

El bootstrap inicial crea el primer PlatformAdmin mediante un comando operativo
one-shot y el onboarding de un tenant crea membership activa y TenantAdmin en la
misma transacción PostgreSQL que el tenant. Una invitación pendiente no autoriza
activar el tenant.

## 5. DB/API/cache/jobs/eventos/archivos
Toda tabla operativa tiene tenant_id. Endpoints tenant-scoped no aceptan tenantId en
query o body. Cache usa `tenant:{tenantId}:...` y, si cachea autorización, incorpora
subject y versión de autorización. Jobs/eventos incluyen tenantId. Archivos se separan
por tenant.

## 6. Auditoría
Incluye tenantId, userProfileId, keycloakSubjectId, action, resourceType, resourceId, occurredAt, traceId y result.

## 7. WordPress
WordPress identifica tenant por slug/URL y pasa pista, pero no autoriza:
```text
WordPress tenant page → /login?tenant=villa-club → Keycloak/Core Login → Core valida membership → Dashboard
```

## 8. Testing
Usuario Tenant A intentando acceder a recurso Tenant B debe recibir denegación sin fuga de información.

## 9. Repositorios
Correcto: `findPaymentById(tenantId, paymentId)`. Evitar búsqueda solo por id salvo contexto global auditado.

## 10. Migración futura
Ruta posible: shared schema → dedicated schema → dedicated database. Requiere ADR.

## Consecuencias

- Toda operación tenant-scoped debe resolver y validar el tenant en Core.
- Índices, constraints, repositorios, cache, jobs, eventos y archivos deben incorporar el tenant.
- El aislamiento depende de controles consistentes de aplicación y de pruebas negativas cross-tenant.
- La estrategia reduce costo inicial, pero exige disciplina permanente para evitar consultas sin filtro.

## Alternativas consideradas

- Base de datos dedicada por tenant: diferida por costo y complejidad operativa inicial.
- Esquema dedicado por tenant: diferido; puede evaluarse como etapa intermedia mediante un nuevo ADR.
- Realm Keycloak por tenant: descartado para el MVP porque dificulta usuarios multi-tenant y duplica configuración de identidad.

## Relación con documentos

- `docs/sdd/constitution.md`
- `docs/sdd/architecture.md`
- `docs/sdd/security.md`
- `docs/sdd/data-governance.md`
- `docs/decisions/ADR-003-database-strategy.md`
- `docs/decisions/ADR-006-identity-provider-strategy.md`
- `docs/decisions/ADR-007-authorization-strategy.md`

## 11. Decisión final
Core adopta aislamiento lógico con tenant_id. Keycloak usará realm `resident`. La autorización por tenant sigue en Core.
