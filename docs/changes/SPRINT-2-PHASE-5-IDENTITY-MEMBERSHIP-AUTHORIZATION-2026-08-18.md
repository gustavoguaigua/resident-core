# Sprint 2 — Fase 5 Identity, Membership and Authorization

## Estado

- Fecha: 2026-08-18
- Decisión de readiness: `GO`
- Fase: `5` — `identity-membership-authorization`
- Resultado: `PASS`
- Siguiente fase permitida: `6` — `tenant-onboarding-lifecycle`

## Alcance implementado

- validación fail-closed del access token Keycloak mediante RS256, issuer, audience,
  `azp`, expiración, subject, email verificado y JWKS con cache acotado;
- resolución exacta de `sub` hacia un `UserProfile` activo;
- resolución request-scoped de `X-Tenant-Id` exclusivamente contra tenant y membership
  activos en Core;
- separación estricta entre autorización global y tenant-scoped;
- permisos efectivos derivados únicamente de roles y relaciones persistidas por Core;
- denegación de claims Keycloak como fuente de tenant, roles o permisos funcionales;
- auditoría durable y sanitizada de denegaciones de autenticación, tenant y permiso.

No se incorporaron endpoints, CRUD, invitaciones, onboarding de tenants, UI ni trabajo
de la Fase 6.

## Evidencia reproducible

- `pnpm test:authorization`: `PASS`;
- `pnpm test:multitenancy`: `PASS`;
- PostgreSQL `17.10-bookworm` efímero desde base vacía;
- tres migraciones canónicas aplicadas y `migrate status` actualizado;
- tokens JWT/JWKS sintéticos y datos de prueba exclusivamente sintéticos;
- `pnpm sprint2:boundary`: Fase `5` válida en `GO`.

Los gates cubren subject válido/desconocido, PlatformAdmin global, usuario sin
privilegio, membership activa/suspendida/revocada/invitada, tenant inactivo o
inexistente, rol cross-tenant, permiso ausente, selectores tenant inválidos y claims que
intentan elevar privilegios. La validación de Audit Base acepta trace IDs UUID generados
por el runtime sin relajar los códigos estables ni el payload allowlisted.

## Resultado

`currentPhase` queda en `5`. La implementación siguiente permitida por el manifest es
únicamente la Fase `6`; no se implementa en este cambio.
