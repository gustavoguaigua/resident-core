# ADR-003 — Database Strategy: PostgreSQL as Primary Transactional Database v0.2

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

## 6. Tablas iniciales
tenants, user_profiles, roles, permissions, role_permissions, user_tenant_memberships, persons, property_units, charges, payments, payment_allocations, receipts, account_statements, bank_accounts, bank_movements, reconciliations, reservations, fines, meetings, notifications, audit_logs.

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

## 12. Decisión final
PostgreSQL + Prisma soportan multitenancy, finanzas auditables y transición limpia a Keycloak, manteniendo autorización en Core.
