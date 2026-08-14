# READINESS-SPRINT-2 — Tenants, identidad y autorización

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Evaluación | `READINESS-SPRINT-2-2026-08-11` |
| Fecha | 2026-08-11 |
| Última actualización | 2026-08-13 — verificación formal de `GAP-S2-005` |
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
| CI | Gates de Sprint 1 activos; acciones `@v6` sobre runtime Node.js 24 |
| Runbook de Sprint 2 | Frontera, incrementos, exclusiones y gates definidos; implementación bloqueada por `NO_GO` |
| Bootstrap de plataforma y tenant | Contrato transaccional cerrado; sin endpoint anónimo, bypass ni placeholder |
| Contexto de tenant activo | Contrato request-scoped cerrado; selector único `X-Tenant-Id` validado por Core |
| Contrato Keycloak | Realm, clientes, OIDC/PKCE, validación, bootstrap y gates cerrados documentalmente |
| Secretos o datos reales requeridos | Ninguno |

## 5. Registro de gaps

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
| Estado | closed — 2026-08-11 |

`docs/implementation/sprint-2-tenants-identity-access.md` establece una frontera única:
delimita los modelos y superficies máximas de 001/002, define las porciones base de
007/025, excluye dominios posteriores y fija secuencia, gates y criterios de cierre. El
runbook declara expresamente que su definición de alcance no autoriza implementación y
reserva a sus gaps propietarios las decisiones todavía abiertas. Esta corrección cierra
únicamente `GAP-S2-002`.

### GAP-S2-003 — Bootstrap circular de tenant e identidad

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | closed — 2026-08-11 |

`docs/changes/GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md` separa el bootstrap
one-shot del primer PlatformAdmin y el onboarding autenticado de cada tenant. La
identidad se verifica primero en Keycloak; todas las escrituras Core de cada operación
se confirman en una transacción PostgreSQL. Specs 001 y 002 asignan propiedad explícita
sin placeholder, cuenta implícita, endpoint anónimo, bypass ni activación basada en una
invitación pendiente.

### GAP-S2-004 — Contrato de tenant activo contradictorio

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | closed — 2026-08-12 |

`docs/changes/GAP-S2-004-ACTIVE-TENANT-CONTRACT-2026-08-12.md` elimina
`/auth/switch-tenant`, `/api/v1/me/switch-tenant` y la selección mediante `tenantId` en
query/body. Los endpoints tenant-scoped exigen `X-Tenant-Id` como selector no
confiable y Core revalida identidad, tenant, membership, roles y permisos en cada
solicitud. No existe estado persistido, cookie ni tenant token; el contexto expira con
la solicitud.

### GAP-S2-005 — Contrato operativo de Keycloak incompleto

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | closed — 2026-08-12 |

`docs/changes/GAP-S2-005-KEYCLOAK-OPERATING-CONTRACT-2026-08-12.md` fija Keycloak
26.7.0, realm `resident`, clientes públicos con Authorization Code + PKCE S256,
resource server/audience, cliente técnico mínimo, redirects/origins locales exactos,
issuer y JWKS separados, claims, expiraciones, errores, bootstrap sintético y gates.
El realm y scripts permanecen sin implementar deliberadamente hasta `GO`.

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

El runbook ya define la secuencia de incrementos y los gates esperados para migraciones,
realm Keycloak, validación JWT, aislamiento multitenant, autorización negativa,
auditoría durable y drift OpenAPI funcional. El gap permanece abierto porque todavía no
existen scripts y workflows reproducibles que ejecuten esa frontera y generen evidencia
en CI.

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
| Alcance de 007/025 base es verificable | Cumple | `sprint-2-tenants-identity-access.md` |
| Bootstrap tenant-identidad está cerrado | Cumple | `GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md` |
| Tenant activo tiene contrato único | Cumple | `GAP-S2-004-ACTIVE-TENANT-CONTRACT-2026-08-12.md` |
| Keycloak tiene contrato reproducible y testeable | Cumple | `GAP-S2-005-KEYCLOAK-OPERATING-CONTRACT-2026-08-12.md` |
| Modelo Prisma inicial no tiene superposiciones | No cumple | 001/025 requieren decisión de propiedad |
| Gates de Sprint 2 están automatizados | No cumple | Definidos en runbook; scripts y workflow pendientes |
| No existen gaps críticos o altos abiertos | No cumple | 1 crítico y 3 altos abiertos |

## 8. Decisión vigente

```text id="sprint2-readiness-decision"
Decision: NO_GO
Scope evaluated: Sprint 2 — Tenants, identidad y autorización
Effective date: 2026-08-11
Critical gaps open: 1
High gaps open: 3
Authorized plan: none
Base commit: b7cbc84fd03aeb44714a32cd27d28b5405a9d30e
```

No se autoriza implementar funcionalidad de Sprint 2, modelos Prisma de dominio,
migraciones, endpoints funcionales, realm Keycloak, autenticación OIDC, persistencia de
auditoría ni adaptadores que concedan tenant o permisos. El `NO_GO` no revierte el cierre
de Sprint 1 ni impide correcciones documentales y de CI destinadas a cerrar estos gaps.

## 9. Orden recomendado para alcanzar GO

1. Unificar propiedad de configuración, modelos Prisma, audit base y secuencia de
   migraciones.
2. Normalizar los 28 documentos aplicables a `accepted` sólo después de resolver sus
   decisiones abiertas y comprobar consistencia cruzada.
3. Implementar los gates CI y la comprobación automática de frontera definidos por el
   runbook.
4. Reevaluar esta compuerta sobre `main`; sólo una nueva decisión `GO` puede autorizar
   funcionalidad.

## 10. Resultado

El baseline técnico de Sprint 1 está sano, la observación de Node.js 20 en GitHub
Actions está corregida y los gaps `GAP-S2-002` a `GAP-S2-005` están cerrados sin
aprobar implícitamente decisiones abiertas. Sprint 2 todavía no está listo para
comenzar: la decisión continúa siendo `NO_GO`, con un gap crítico y tres altos. El
siguiente paso permitido recomendado es cerrar `GAP-S2-006`.
