# Sprint 2 — Fase 6 Tenant Onboarding and Lifecycle

## Estado

- Fecha: 2026-08-18
- Decisión de readiness: `GO`
- Fase: `6` — `tenant-onboarding-lifecycle`
- Resultado: `PASS`
- Siguiente fase permitida: `7` — `invitations-memberships`

## Alcance implementado

- onboarding mediante la API autenticada de plataforma con autorización Core;
- resolución previa de `initialAdmin.email` contra Keycloak, sin aceptar subject,
  roles, actor ni estado privilegiado desde el body;
- creación transaccional de Tenant `pendingSetup`, perfil inicial, roles base,
  UserProfile, membership activa y asignación TenantAdmin;
- lifecycle explícito para activar, suspender, reactivar y archivar conforme a las
  transiciones canónicas;
- auditoría durable, sanitizada y atómica de la creación, acceso inicial y cambios de
  estado;
- contrato OpenAPI de las cinco operaciones autorizadas de esta fase.

No se implementaron invitaciones generales, administración posterior de memberships,
settings, UI, reporting ni dominios residenciales. La reactivación especial desde
`archived` permanece fuera de esta fase.

## Evidencia reproducible

- `pnpm test:tenants`: `PASS` — 13 pruebas;
- PostgreSQL `17.10-bookworm` efímero desde base vacía;
- tres migraciones canónicas aplicadas, `migrate status` actualizado y drift ausente;
- Keycloak `26.7.0` efímero con identidades sintéticas y PlatformAdmin bootstrappeado;
- creación, lifecycle, autorización negativa, conflictos, aislamiento y rollback por
  fallo de auditoría verificados;
- `pnpm sprint2:boundary`: Fase `6` válida en `GO`.

## Garantías demostradas

- Keycloak autentica y resuelve identidad; Core conserva toda autorización de dominio;
- un actor sin permiso global persistido no crea ni cambia tenants;
- slug duplicado y transición incompatible fallan cerrado sin duplicar estado;
- una invitación pendiente no sustituye una membership TenantAdmin activa;
- roles y memberships permanecen vinculados exclusivamente a su tenant;
- cualquier fallo de auditoría revierte el onboarding completo;
- las transiciones repetidas definidas como conflicto por Spec 001 no se transforman en
  éxito artificialmente idempotente.

## Resultado

`currentPhase` queda en `6`. La implementación siguiente permitida por el manifest es
únicamente la Fase `7`; no se implementa en este cambio.