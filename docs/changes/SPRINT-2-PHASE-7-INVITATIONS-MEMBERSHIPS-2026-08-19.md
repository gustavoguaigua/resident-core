# Sprint 2 — Fase 7 invitations-memberships

## Estado

- Fecha: 2026-08-19
- Rama: `codex/sprint-2-phase-7-invitations-memberships`
- Decisión de Sprint 2: `GO`
- Fase anterior integrada: `6`
- Fase resultante: `7`
- Gate específico: `test:invitations`
- Resultado: `PASS`

## Alcance implementado

- creación y listado de invitaciones tenant-scoped;
- token opaco de 256 bits, persistido exclusivamente como hash SHA-256;
- consulta segura y aceptación autenticada mediante identidad Core enlazada a
  Keycloak;
- expiración lazy, revocación y uso único conforme a los estados canónicos;
- creación atómica de membership activa y rol tenant-scoped inicial;
- asignación, remoción y revocación posterior de memberships;
- protección del último TenantAdmin activo;
- auditoría durable y sanitizada dentro de la misma transacción que cada mutación.

La Spec 002 no define estado ni endpoint `rejected`. El estado terminal canónico
`cancelled` se valida como no aceptable; esta fase no inventa una superficie adicional.
No se implementó entrega real de email, UI, gestión general de usuarios ni funcionalidad
de Fase 8.

## Evidencia reproducible

`pnpm test:invitations` ejecutó sobre PostgreSQL `17.10-bookworm` y Keycloak `26.7.0`
efímeros:

- las tres migraciones canónicas se aplicaron desde una base vacía;
- Prisma status y drift resultaron limpios;
- 14 de 14 pruebas pasaron;
- double-accept concurrente produjo una sola membership;
- invitaciones expiradas, revocadas, canceladas o consumidas no fueron reutilizables;
- roles globales y roles cross-tenant fueron rechazados;
- actor, identidad, email, tenant y membership inválidos fallaron cerrado;
- fallo de auditoría produjo rollback de creación y aceptación;
- tokens y hashes no aparecieron en auditoría ni listados.

La compuerta acumulativa `pnpm sprint2:gates` valida las Fases `0` a `7` después de
activar `currentPhase = 7`.
