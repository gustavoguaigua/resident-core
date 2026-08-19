# READINESS-SPRINT-2 — Tenants, identidad y autorización

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Evaluación | `READINESS-SPRINT-2-2026-08-11` |
| Fecha | 2026-08-11 |
| Última actualización | 2026-08-18 — Fase 6 tenant onboarding/lifecycle completada con `PASS` |
| Alcance | Preparación para Sprint 2 — Tenants, identidad y autorización |
| Commit base inspeccionado | `6c1ee9402667881d6939769436fbf3d588416d6b` |
| Rama de evaluación | `codex/sprint-2-formal-readiness` |
| Decisión | `GO` |
| Plan autorizado | `docs/implementation/sprint-2-tenants-identity-access.md` |
| Naturaleza | Gate documental y técnico previo a funcionalidad |

## 2. Propósito y método

Determinar si el cierre de Sprint 1, las fuentes SDD, los ADR, los contratos y el estado
real del repositorio permiten iniciar funcionalidad de Sprint 2 sin inventar decisiones
de identidad, multitenancy, autorización, persistencia o auditoría.

La evaluación aplicó la precedencia de `AGENTS.md` y contrastó constitución, ADR
aceptados, Blueprint, specs 001, 002, 007 y 025, arquitectura, seguridad, API, gobierno
de datos, índice maestro, cierre de Sprint 1 y código existente. La compuerta no añade
modelos, migraciones, endpoints, realm de Keycloak ni lógica funcional.

## 3. Alcance autorizado

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
| Specs 001, 002, 007 y 025 | Los 28 documentos están `accepted` |
| Preguntas abiertas de las specs | Sin blockers contractuales dentro del alcance de Sprint 2 |
| Índice y Blueprint | Definen componentes generales, no el significado implementable de “base” |
| Prisma | Persistencia mínima de Specs 001/002 versionada; migración desde vacío, estado, drift y constraints en `PASS` |
| Keycloak local | Realm, clientes, fixtures, bootstrap y verificador versionados; gates reales en `PASS` |
| Identidad y acceso runtime | Puertos y guards fail-closed; no autentican ni conceden permisos |
| Auditoría runtime | `AuditLog`, writer transaccional, sanitización, aislamiento y append-only en `PASS` |
| OpenAPI | Contrato runtime de plataforma presente; no existen endpoints funcionales de Sprint 2 |
| CI | Gates de Sprint 1 activos; acciones `@v6` sobre runtime Node.js 24 |
| Runbook de Sprint 2 | Frontera, incrementos, exclusiones y gates definidos; autorizado por esta reevaluación |
| Bootstrap de plataforma y tenant | Contrato transaccional cerrado; sin endpoint anónimo, bypass ni placeholder |
| Contexto de tenant activo | Contrato request-scoped cerrado; selector único `X-Tenant-Id` validado por Core |
| Contrato Keycloak | Realm, clientes, OIDC/PKCE, validación, bootstrap y gates cerrados documentalmente |
| Secretos o datos reales requeridos | Ninguno |

## 5. Registro de gaps

### GAP-S2-001 — Estado documental no aprobatorio

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | closed — 2026-08-14 |

Los 28 documentos derivados de las specs 001, 002, 007 y 025 se normalizan a
`accepted` después de comprobar los contratos cerrados por `GAP-S2-002` a
`GAP-S2-008`. Las preguntas residuales quedan resueltas o diferidas explícitamente y
`GAP-S2-001-DOCUMENT-APPROVAL-2026-08-14.md` registra la evidencia de aprobación.

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
| Estado | closed — 2026-08-13 |

`docs/changes/GAP-S2-006-CONFIGURATION-PRISMA-OWNERSHIP-2026-08-13.md` retira
`TenantConfiguration`, conserva `timezone`/`currency` únicamente en `Tenant`, asigna
los settings configurables a Spec 025 y fija el Prisma exacto de los slices 001/025.
También delimita las unidades y el orden de migración sin ejecutar cambios runtime.

### GAP-S2-007 — Semántica exacta de Audit base no definida

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | closed — 2026-08-13 |

`docs/changes/GAP-S2-007-AUDIT-BASE-SEMANTICS-2026-08-13.md` asigna a Spec 007 el
ownership de la persistencia, fija un único `AuditLog`, enums/campos mínimos, catálogo
exacto de 001/002, payload sanitizado, causalidad transaccional y garantías append-only.
Consultas, exportaciones, UI y categorías de dominios posteriores quedan diferidas.

### GAP-S2-008 — Secuencia, gates y frontera automática ausentes

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | closed — 2026-08-14 |

`docs/changes/GAP-S2-008-SEQUENCE-GATES-BOUNDARY-2026-08-14.md` fija una secuencia
versionada de fases, activa acumulativamente gates de capacidad, comprueba la frontera
Prisma/API y el orden de migraciones, y genera evidencia JSON publicada por
`Required CI gates`. Con `NO_GO`, la fase `0` rechaza realm, modelos, migraciones y
endpoints funcionales de Sprint 2.

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
| Specs funcionales aplicables están aprobadas | Cumple | 28 de 28 documentos `accepted` |
| Alcance de 007/025 base es verificable | Cumple | `sprint-2-tenants-identity-access.md` |
| Bootstrap tenant-identidad está cerrado | Cumple | `GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md` |
| Tenant activo tiene contrato único | Cumple | `GAP-S2-004-ACTIVE-TENANT-CONTRACT-2026-08-12.md` |
| Keycloak tiene contrato reproducible y testeable | Cumple | `GAP-S2-005-KEYCLOAK-OPERATING-CONTRACT-2026-08-12.md` |
| Modelo Prisma inicial no tiene superposiciones | Cumple | `GAP-S2-006-CONFIGURATION-PRISMA-OWNERSHIP-2026-08-13.md` |
| Audit base tiene semántica y ownership únicos | Cumple | `GAP-S2-007-AUDIT-BASE-SEMANTICS-2026-08-13.md` |
| Gates de Sprint 2 están automatizados | Cumple | `GAP-S2-008-SEQUENCE-GATES-BOUNDARY-2026-08-14.md` |
| No existen gaps críticos o altos abiertos | Cumple | 0 críticos y 0 altos abiertos |

## 8. Decisión vigente

```text id="sprint2-readiness-decision"
Decision: GO
Scope evaluated: Sprint 2 — Tenants, identidad y autorización
Effective date: 2026-08-14
Critical gaps open: 0
High gaps open: 0
Authorized plan: docs/implementation/sprint-2-tenants-identity-access.md
Gate phase: 6
Base commit: 6c1ee9402667881d6939769436fbf3d588416d6b
```

Sprint 2 continúa autorizado exclusivamente en el orden y dentro de la frontera del
runbook. Las Fases `1` a `6` aportan Keycloak, persistencia Tenant/Identity, Audit base,
el bootstrap one-shot del primer PlatformAdmin, autorización Core fail-closed y
onboarding/lifecycle transaccional de tenants; el manifest queda en `currentPhase = 6`.
Este `GO` no autoriza adelantar fases ni ampliar la superficie Prisma, OpenAPI o
funcional definida.

## 9. Orden autorizado después de GO

1. Integrar la Fase `6` únicamente después de que todos sus gates pasen en CI.
2. Implementar después exclusivamente la Fase `7`, invitaciones y administración
   posterior de memberships, en una rama y PR cortos y elevar su fase atómicamente con
   sus artefactos y gates.

## 10. Resultado

El baseline técnico de Sprint 1 está sano, los gaps `GAP-S2-001` a `GAP-S2-008` están
cerrados, los 28 documentos aplicables están `accepted` y no existen gaps críticos o
altos abiertos. La frontera automática y los gates reproducibles pasan sobre el commit
base inspeccionado. Sprint 2 conserva `GO`; las Fases `1` a `6` quedan implementadas
con `PASS` y el siguiente incremento permitido es únicamente la Fase `7` del runbook.
