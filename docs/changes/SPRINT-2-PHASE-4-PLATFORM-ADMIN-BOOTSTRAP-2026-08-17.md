# Sprint 2 — Fase 4 PlatformAdmin bootstrap

## Estado

- Fecha: 2026-08-17
- Fase: `4` — `platform-admin-bootstrap`
- Resultado: `PASS`
- Readiness: `GO`
- Gate: `test:bootstrap`

## Alcance implementado

- comando operativo `pnpm bootstrap:platform-admin -- --email <email>` sin endpoint
  HTTP, subject ni rol impuestos por el operador;
- resolución server-side mediante el cliente técnico `resident-identity-admin` de
  Keycloak;
- catálogo mínimo idempotente de permisos y roles globales de Spec 002;
- creación o enlace de un único `UserProfile` activo y asignación global exclusiva de
  `PlatformAdmin`;
- transacción PostgreSQL serializable con exclusión mutua y retry acotado ante
  conflictos de serialización;
- auditoría durable `platformAdmin.bootstrap.completed` con actor `SYSTEM` en la misma
  transacción.

No se crearon tenants, memberships, endpoints, UI ni capacidades de Fase 5.

## Evidencia reproducible

- Keycloak `26.7.0` y PostgreSQL `17.10-bookworm` efímeros aislados;
- tres migraciones canónicas aplicadas desde bases vacías, status actualizado y drift
  inexistente;
- primera ejecución `created` y segunda ejecución `existing`, sin duplicados;
- dos intentos concurrentes serializados con un único perfil, rol asignado y evento;
- subject diferente, identidad inválida, argumentos de subject/rol, scope de rol
  inválido y fallo de auditoría rechazados fail-closed;
- rollback completo cuando la auditoría durable falla;
- `test:bootstrap`: `PASS` — 11 tests;
- `sprint2:gates`: `PASS` acumulativo para Fases `0` a `4`.

## Frontera resultante

El manifest queda en `currentPhase = 4`. El siguiente incremento permitido es
únicamente la Fase `5` — `identity-membership-authorization`.
