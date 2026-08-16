# Sprint 2 — Fase 2 Tenant/Identity persistence

## 1. Resultado

| Campo | Valor |
| --- | --- |
| Fecha | 2026-08-15 |
| Estado | `PASS` |
| Decisión Sprint 2 | `GO` |
| Fase anterior | `1` |
| Fase resultante | `2` |
| Siguiente fase permitida | `3` — Audit base |

## 2. Alcance implementado

La fase incorpora exclusivamente la persistencia mínima aprobada de Specs 001 y 002:

- tenant core: `Tenant`, `TenantProfile`, `TenantBranding` y
  `TenantWordPressMapping`;
- identity/access: `UserProfile`, `Role`, `Permission`, `RolePermission`,
  `UserGlobalRole`, `UserTenantMembership`, `MembershipRole` e `Invitation`;
- dos migraciones aditivas y ordenadas, aplicables desde PostgreSQL vacío;
- gate reproducible `prisma:migrate:check` sobre PostgreSQL efímero y aislado.

Se excluyen `TenantConfiguration`, settings, Audit base, seeds, endpoints, repositorios,
bootstrap y autenticación runtime. Keycloak conserva credenciales y autenticación;
`keycloakSubjectId` es únicamente el vínculo estable de identidad.

## 3. Evidencia reproducible

```text
pnpm run prisma:migrate:check
PASS — 2 migraciones aplicadas desde vacío
PASS — migrate status sin pendientes
PASS — migrate diff sin drift
PASS — Prisma Client generado
PASS — unicidad de slug, subject y membership
PASS — onDelete Restrict
PASS — segunda aplicación idempotente

pnpm run sprint2:gates
PASS — frontera automática en fase 2
PASS — keycloak:verify
PASS — test:keycloak
PASS — prisma:migrate:check
```

Los contenedores usan secretos sintéticos, PostgreSQL `17.10-bookworm`, filesystem
temporal y limpieza automática. No se usan datos ni volúmenes locales persistentes.

## 4. Decisión

Fase `2` queda completada con `PASS`. Sprint 2 conserva `GO`; la frontera progresiva
autoriza a continuación únicamente la Fase `3` y no autoriza adelantar funcionalidad.
