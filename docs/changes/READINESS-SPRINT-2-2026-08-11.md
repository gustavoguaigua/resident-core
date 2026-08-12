# READINESS-SPRINT-2 — Tenants, identidad y autorización

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Evaluación | `READINESS-SPRINT-2-2026-08-11` |
| Fecha | 2026-08-11 |
| Alcance | Preparación para Sprint 2 — Tenants, identidad y autorización |
| Commit base inspeccionado | `b7cbc84fd03aeb44714a32cd27d28b5405a9d30e` |
| Rama de evaluación | `codex/sprint-2-readiness` |
| Decisión | `NO_GO` |
| Plan autorizado | Ninguno |
| Naturaleza | Gate documental y técnico previo a funcionalidad |

## 2. Propósito y método

Determinar si el cierre de Sprint 1, las fuentes SDD, los ADR, los contratos y el estado
real del repositorio permiten iniciar funcionalidad de Sprint 2 sin inventar decisiones
de identidad, multitenancy, autorización, persistencia o auditoría.

La evaluación aplicó la precedencia de `AGENTS.md` y contrastó constitución, ADR
aceptados, Blueprint, specs 001, 002, 007 y 025, arquitectura, seguridad, API, gobierno
de datos, índice maestro, cierre de Sprint 1 y código existente. La compuerta no añade
modelos, migraciones, endpoints, realm de Keycloak ni lógica funcional.

## 3. Alcance candidato, todavía no autorizado

Las fuentes de roadmap sitúan en Sprint 2:

- `001-tenants`;
- `002-users-roles`;
- una base expresamente limitada de `007-audit`;
- una base expresamente limitada de `025-tenant-settings-policies`;
- integración Keycloak;
- adaptadores funcionales de `TenantGuard` y `PermissionGuard`.

“Base” no autoriza implementar las specs 007 y 025 completas. Sus planes incluyen
capacidades y dependencias de sprints posteriores, por lo que antes de un `GO` debe
existir un runbook de Sprint 2 con inclusiones, exclusiones, orden de migraciones,
contratos y gates verificables.

## 4. Evidencia inspeccionada

| Evidencia | Resultado |
| --- | --- |
| Cierre formal de Sprint 1 | `PASS`; PR y CI post-merge exitosos |
| Constitución y ADR 003–007, 010–012 | Vigentes y suficientes como dirección arquitectónica |
| Specs 001, 002, 007 y 025 | Los 28 documentos permanecen `needs-review` |
| Preguntas abiertas de las specs | Existen decisiones funcionales y técnicas sin cerrar |
| Índice y Blueprint | Definen componentes generales, no el significado implementable de “base” |
| Prisma | Sin modelos, enums, migraciones ni seeds de dominio, conforme al cierre de Sprint 1 |
| Keycloak local | Servicio fijado en Compose; `infra/keycloak/` no contiene realm o clients versionados |
| Identidad y acceso runtime | Puertos y guards fail-closed; no autentican ni conceden permisos |
| Auditoría runtime | Puerto técnico sin persistencia, conforme a Sprint 1 |
| OpenAPI | Contrato runtime de plataforma presente; no existen endpoints funcionales de Sprint 2 |
| CI | Gates de Sprint 1 activos; acciones `@v4` identificadas para migración a Node.js 24 |
| Secretos o datos reales requeridos | Ninguno |

## 5. Gaps abiertos

### GAP-S2-001 — Estado documental no aprobatorio

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | open |

Las specs 001, 002, 007 y 025 y todos sus documentos derivados siguen en
`needs-review`. El estándar documental define ese estado como “requiere revisión antes
de implementar” y ADR-003 exige expresamente specs aprobadas para introducir `Tenant`,
`UserProfile`, roles, permisos y memberships.

### GAP-S2-002 — Frontera de Sprint 2 no ejecutable

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | open |

No existe runbook de Sprint 2. El índice usa “007-audit base” y
“025-tenant-settings-policies base”, pero sus planes completos incluyen consultas,
exportaciones, módulos consumidores y dependencias de Sprint 3 o posteriores. Deben
definirse modelos, endpoints, eventos, tareas y exclusiones exactas del corte inicial.

### GAP-S2-003 — Bootstrap circular de tenant e identidad

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | open |

001 crea tenant, configuración, roles base e invitación de administrador; también exige
un `TenantAdmin` para activar. 002 es propietaria de usuarios, roles, permisos,
memberships e invitaciones y depende de 001. No está cerrado el flujo transaccional y
autorizado para crear el primer PlatformAdmin, tenant, perfil, membership y TenantAdmin
sin bypass, cuenta implícita ni dependencia circular.

### GAP-S2-004 — Contrato de tenant activo contradictorio

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | open |

Las guías API mencionan `/auth/switch-tenant`; la spec 002 define
`POST /api/v1/me/switch-tenant` y también consultas con `tenantId` opcional. No está
definido un único transporte autoritativo para seleccionar y resolver tenant activo con
tokens de Keycloak, ni su persistencia, expiración y validación contra membership. El
cliente no puede convertirse en autoridad de `tenantId`.

### GAP-S2-005 — Contrato operativo de Keycloak incompleto

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | open |

ADR-006 fija realm y `client_id`, pero no existe configuración versionada del realm ni
un contrato cerrado de tipo de cliente, Authorization Code + PKCE, redirect URIs, web
origins, issuer, audience, JWKS, mappers, bootstrap local sintético o manejo de subjects
sin `UserProfile`. La integración no puede implementarse de forma reproducible ni
probarse en CI con la evidencia actual.

### GAP-S2-006 — Propiedad de configuración y modelo Prisma superpuestos

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | open |

001 propone `TenantConfiguration`; 025 propone definitions, values y policies como
fuente transversal de configuración. Debe decidirse qué configuración mínima pertenece
al lifecycle de Tenant y qué datos pertenecen exclusivamente a 025, evitando tablas,
defaults y APIs duplicadas. También falta fijar el conjunto exacto de modelos y
migraciones del sprint.

### GAP-S2-007 — Semántica exacta de Audit base no definida

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | open |

007 completo cubre consultas, exportaciones y dominios aún inexistentes, mientras
Sprint 2 sólo solicita una base. Debe cerrarse si la porción inicial incluye únicamente
escritura durable y sanitizada para 001/002, qué eventos mínimos registra, qué garantías
append-only aplica y cuáles APIs, exportaciones y categorías se difieren.

### GAP-S2-008 — Secuencia, gates y frontera automática ausentes

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | open |

No existe descomposición de PRs ni gates de CI específicos para migraciones, realm
Keycloak, validación JWT, aislamiento multitenant, autorización negativa, auditoría
durable y drift OpenAPI funcional. La implementación simultánea de todas las specs sería
demasiado amplia para revisión y rollback seguros.

## 6. Corrección de CI incluida en esta compuerta

La observación histórica sobre acciones JavaScript basadas en Node.js 20 queda resuelta
mediante la migración coordinada de:

```text
actions/checkout@v4   -> actions/checkout@v6
actions/setup-node@v4 -> actions/setup-node@v6
pnpm/action-setup@v4  -> pnpm/action-setup@v6
```

Las tres acciones `@v6` declaran runtime Node.js 24. Se conservan Node.js `24.18.0`,
pnpm `11.21.0`, los permisos mínimos del workflow y todos los gates existentes. Los
ejemplos canónicos de ADR-012 y Sprint 0 se actualizan en el mismo cambio; el cierre de
Sprint 0 conserva el hecho histórico y registra su resolución.

## 7. Matriz de decisión

| Criterio | Resultado | Evidencia |
| --- | --- | --- |
| Sprint 1 está cerrado | Cumple | `SPRINT-1-CLOSURE-2026-08-11.md` |
| Arquitectura y ADR aplicables están aceptados | Cumple | ADR 003–007 y 010–012 |
| Baseline técnico falla cerrado | Cumple | guards y adaptadores de Sprint 1 |
| Specs funcionales aplicables están aprobadas | No cumple | 28 de 28 documentos `needs-review` |
| Alcance de 007/025 base es verificable | No cumple | No existe corte autoritativo |
| Bootstrap tenant-identidad está cerrado | No cumple | Responsabilidades circulares 001/002 |
| Tenant activo tiene contrato único | No cumple | Rutas y autoridad no unificadas |
| Keycloak es reproducible y testeable | No cumple | No existe realm/client config versionada |
| Modelo Prisma inicial no tiene superposiciones | No cumple | 001/025 requieren decisión de propiedad |
| Gates de Sprint 2 están definidos | No cumple | No existe runbook ni frontera automática |
| No existen gaps críticos o altos abiertos | No cumple | 5 críticos y 3 altos abiertos |

## 8. Decisión vigente

```text id="sprint2-readiness-decision"
Decision: NO_GO
Scope evaluated: Sprint 2 — Tenants, identidad y autorización
Effective date: 2026-08-11
Critical gaps open: 5
High gaps open: 3
Authorized plan: none
Base commit: b7cbc84fd03aeb44714a32cd27d28b5405a9d30e
```

No se autoriza implementar funcionalidad de Sprint 2, modelos Prisma de dominio,
migraciones, endpoints funcionales, realm Keycloak, autenticación OIDC, persistencia de
auditoría ni adaptadores que concedan tenant o permisos. El `NO_GO` no revierte el cierre
de Sprint 1 ni impide correcciones documentales y de CI destinadas a cerrar estos gaps.

## 9. Orden recomendado para alcanzar GO

1. Definir el runbook y la frontera exacta de Sprint 2, en especial las bases de 007 y
   025.
2. Cerrar el bootstrap inicial y el contrato único de tenant activo entre 001 y 002.
3. Fijar el contrato reproducible de Keycloak y sus pruebas negativas.
4. Unificar propiedad de configuración, modelos Prisma, audit base y secuencia de
   migraciones.
5. Normalizar los 28 documentos aplicables a `accepted` sólo después de resolver sus
   decisiones abiertas y comprobar consistencia cruzada.
6. Definir PRs pequeños, gates CI y frontera automática de Sprint 2.
7. Reevaluar esta compuerta sobre `main`; sólo una nueva decisión `GO` puede autorizar
   funcionalidad.

## 10. Resultado

El baseline técnico de Sprint 1 está sano y la observación de Node.js 20 en GitHub
Actions queda corregida, pero Sprint 2 no está documentalmente listo para comenzar. El
siguiente paso permitido es cerrar `GAP-S2-002` mediante un runbook de alcance que no
apruebe implícitamente decisiones todavía abiertas.
