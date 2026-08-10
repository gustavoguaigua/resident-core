# ADR-003 — Database Strategy: PostgreSQL as Primary Transactional Database v0.2

## Estado

`accepted`

## Contexto

RESIDENT Core necesita una base de datos transaccional para un sistema multitenant con
integridad relacional, operaciones financieras auditables, migraciones versionadas y
una transición controlada desde autenticación propia temporal hacia Keycloak.

## 1. Decisión
PostgreSQL como base relacional transaccional principal, Prisma ORM, migraciones versionadas, shared schema con tenant_id y UserProfile con externalSubjectId/keycloakSubjectId.

## 2. Justificación
PostgreSQL es relacional, ACID, maduro, soporta integridad, constraints, índices, transacciones, Decimal, JSONB controlado, Docker, cloud y NestJS/Prisma.

## 3. Multitenancy
Toda tabla operativa incluye tenant_id. Constraints e índices consideran tenant. Repositorios exigen tenant.

## 4. Identidad en DB
Auth propia temporal puede tener auth_sessions, refresh_tokens y password_reset_tokens. No son dependencia permanente.

Objetivo Keycloak:
```text
user_profiles(id,email,display_name,auth_provider,external_subject_id,keycloak_subject_id,status,timestamps)
```

## 5. Membership
```text
user_tenant_memberships(id,user_profile_id,tenant_id,role_id,status,invited_by,joined_at,timestamps)
```

## 6. Tablas objetivo iniciales del producto
tenants, user_profiles, roles, permissions, role_permissions, user_tenant_memberships, persons, property_units, charges, payments, payment_allocations, receipts, account_statements, bank_accounts, bank_movements, reconciliations, reservations, fines, meetings, notifications, audit_logs.

Esta lista describe el modelo objetivo incremental del producto; no autoriza crear todas
las tablas en Sprint 0 ni sustituye los `data-model.md` de cada paquete SDD.

## 7. Finanzas
Nunca float/double. Usar Decimal. Transacciones para alícuotas, pagos, reversos, multas con cargo, reservas con cargo, conciliación, ajustes y recálculo.

## 8. Auditoría
audit_logs registra tenant, userProfileId, keycloakSubjectId si aplica, acción, recurso, estado anterior/posterior, motivo, traceId y resultado.

## 9. Eliminación y migraciones
No eliminar físicamente datos financieros ni auditoría. Migraciones con revisión, pruebas, backup y preservación de UserProfile/keycloakSubjectId/memberships.

## 10. Backups e índices
Backup diario DB, documentos y Keycloak DB cuando exista. Índices: tenants(slug), user_profiles(email), user_profiles(keycloak_subject_id), memberships(tenant_id,user_profile_id), charges/payments/audit por tenant.

## 11. Idempotencia
idempotency_keys, external_event_id y constraints por tenant para pagos, webhooks, alícuotas, importaciones y jobs.

## 11.1. Alcance del bootstrap Prisma

Sprint 0 crea únicamente un `prisma/schema.prisma` de configuración con los bloques
`generator client` y `datasource db`. No crea modelos, enums, migraciones ni seeds y no
genera una base de datos de dominio anticipada.

`Tenant` y sus entidades relacionadas se incorporan al implementar la spec
`001-tenants`. `UserProfile`, roles, permisos y memberships se incorporan al implementar
la spec `002-users-roles`. Ambas incorporaciones requieren que la spec correspondiente
esté aprobada y que su sprint funcional esté autorizado. Sprint 1 puede introducir
`PrismaService` y validar la conexión técnica sin adelantar esos modelos.

## Consecuencias

- El esquema y las consultas deben preservar aislamiento por tenant e integridad ACID.
- Las migraciones y operaciones financieras requieren revisión y pruebas específicas.
- Prisma será la vía de acceso principal, con SQL nativo controlado cuando sea necesario.
- PostgreSQL y la base de identidad de Keycloak deberán respaldarse y operarse de forma separada cuando corresponda.

## Alternativas consideradas

- Base de datos o esquema dedicado por tenant: diferido por costo y complejidad inicial; cualquier migración futura requiere ADR.
- Base no relacional como fuente transaccional principal: descartada por las necesidades de integridad, relaciones y transacciones financieras.
- Acceso exclusivamente mediante SQL u otro ORM: no adoptado para el MVP; una sustitución de Prisma requiere una decisión posterior explícita.

## Relación con documentos

- `docs/sdd/constitution.md`
- `docs/sdd/architecture.md`
- `docs/sdd/data-governance.md`
- `docs/decisions/ADR-002-backend-framework.md`
- `docs/decisions/ADR-004-multitenancy-strategy.md`
- `docs/decisions/ADR-006-identity-provider-strategy.md`
- `docs/implementation/sprint-0-foundation.md`
- `docs/specs/001-tenants/data-model.md`
- `docs/specs/002-users-roles/data-model.md`

## 12. Decisión final
PostgreSQL + Prisma soportan multitenancy, finanzas auditables y transición limpia a Keycloak, manteniendo autorización en Core.
