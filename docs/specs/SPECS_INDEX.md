# SPECS INDEX — RESIDENT Core

## 1. Información del documento

| Campo      | Valor                                  |
| ---------- | -------------------------------------- |
| Proyecto   | RESIDENT Core                          |
| Documento  | Specs Index                            |
| Ruta       | `docs/specs/SPECS_INDEX.md`            |
| Versión    | 0.1                                    |
| Estado     | Vigente hasta readiness inicial de Sprint 3 |
| Fecha      | 2026-08-28                             |
| Fase       | FASE 2 — RESIDENT Core                 |
| Naturaleza | Índice maestro de especificaciones SDD |

---

## 2. Propósito

Este documento resume el estado, alcance, prioridad, dependencias y orden sugerido de implementación de las especificaciones SDD creadas para RESIDENT Core.

Debe servir como mapa rápido para:

```text id="specs-index-purpose"
- ubicar cada paquete funcional;
- entender qué módulo representa;
- identificar su prioridad;
- conocer dependencias principales;
- orientar el orden de implementación;
- guiar a ChatGPT, Codex, Claude Code u otro agente de desarrollo;
- evitar implementar código sin revisar la spec correspondiente.
```

Regla central:

```text id="specs-index-rule"
Ningún módulo funcional de RESIDENT Core debe implementarse sin revisar su carpeta correspondiente en docs/specs, sus contratos API, modelo de datos, plan de pruebas, tareas y notas de seguridad.
```

---

## 3. Estructura estándar de cada paquete

Cada paquete SDD debe contener:

```text id="specs-index-package-standard"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

Estados documentales permitidos:

```text id="specs-index-package-state"
draft         documento en elaboración
in-review     documento bajo revisión formal activa
needs-review  documento existente y pendiente de revisión formal
accepted      documento funcional revisado y aprobado dentro de su alcance
complete      expediente documental o de gobernanza terminado
blocked       revisión documental detenida por un gap crítico
```

El estado documental no determina el momento de implementación. Las specs diferidas
se identifican mediante `Post-MVP` o la indicación correspondiente en la columna
`Implementación sugerida`, independientemente de que su documentación esté completa o
pendiente de revisión.

---

## 4. Índice maestro de specs

| Spec | Módulo                         | Dominio                      | Prioridad  | Estado documental | Implementación sugerida |
| ---: | ------------------------------ | ---------------------------- | ---------- | ------------------ | ----------------------- |
|  001 | `tenants`                      | Platform / Tenant Management | Crítica    | accepted           | Sprint 2                |
|  002 | `users-roles`                  | Identity and Access          | Crítica    | accepted           | Sprint 2                |
|  003 | `residents-properties`         | Residents and Properties     | Crítica    | accepted           | Sprint 3                |
|  004 | `dues-fees`                    | Financial Management         | Crítica    | accepted           | Sprint 3                |
|  005 | `payments`                     | Payments                     | Crítica    | accepted           | Sprint 3                |
|  006 | `account-statements`           | Financial Statements         | Crítica    | accepted           | Sprint 3                |
|  007 | `audit`                        | Audit and Compliance         | Crítica    | accepted           | Sprint 2-3              |
|  008 | `basic-reports`                | Reporting                    | Media      | needs-review       | Sprint 7                |
|  009 | `wordpress-integration-basic`  | External Integration         | Media      | needs-review       | Sprint 7                |
|  010 | `reservations-common-areas`    | Reservations                 | Alta       | needs-review       | Sprint 6                |
|  011 | `fines-sanctions`              | Fines and Sanctions          | Alta       | needs-review       | Sprint 6                |
|  012 | `communications-notifications` | Communications               | Alta       | needs-review       | Sprint 6                |
|  013 | `meetings-attendance`          | Meetings                     | Media-Alta | needs-review       | Sprint 7                |
|  014 | `voting-basic`                 | Voting                       | Media-Alta | needs-review       | Sprint 7                |
|  015 | `certified-minutes`            | Governance / Minutes         | Media-Alta | needs-review       | Sprint 7                |
|  016 | `secure-document-storage`      | Document Storage             | Crítica    | accepted           | Sprint 3                |
|  017 | `bank-reconciliation`          | Reconciliation               | Avanzada   | needs-review       | Post-MVP                |
|  018 | `payment-provider-integration` | Payment Providers            | Avanzada   | needs-review       | Post-MVP                |
|  019 | `open-banking-integration`     | Open Banking                 | Avanzada   | needs-review       | Post-MVP                |
|  020 | `accounting-ledger`            | Accounting                   | Avanzada   | needs-review       | Post-MVP                |
|  021 | `supplier-payments`            | Supplier Payments            | Avanzada   | needs-review       | Post-MVP                |
|  022 | `maintenance-work-orders`      | Maintenance                  | Alta       | needs-review       | Sprint 6                |
|  023 | `inventory-basic`              | Inventory                    | Media      | needs-review       | Sprint 7 / Post-MVP     |
|  024 | `access-control-visitors`      | Access / Visitors            | Alta       | needs-review       | Sprint 6                |
|  025 | `tenant-settings-policies`     | Tenant Configuration         | Crítica    | accepted           | Sprint 2-3              |
|  026 | `automation-workflows-basic`   | Automation                   | Media      | needs-review       | Post-MVP                |
|  027 | `dashboard-kpis`               | Dashboards / KPIs            | Media-Alta | needs-review       | Sprint 7                |
|  028 | `data-import-migration`        | Data Import / Migration      | Media-Alta | needs-review       | Sprint 7                |
|  029 | `admin-web-app-basic`          | Admin Frontend               | Crítica    | needs-review       | Sprint 4                |
|  030 | `resident-self-service-basic`  | Resident Frontend            | Crítica    | needs-review       | Sprint 5                |
|  031 | `implementation-readiness`     | Delivery Governance          | Crítica    | complete           | Sprint 0                |

---

## 5. Clasificación por prioridad

### 5.1. Núcleo obligatorio MVP

Estos módulos forman la base mínima para que RESIDENT Core exista como sistema transaccional seguro:

```text id="specs-index-core-mvp"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
016-secure-document-storage
025-tenant-settings-policies
029-admin-web-app-basic
030-resident-self-service-basic
031-implementation-readiness
```

---

### 5.2. Operación comunitaria MVP extendido

Estos módulos agregan operación diaria de conjunto residencial:

```text id="specs-index-community-mvp"
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
022-maintenance-work-orders
024-access-control-visitors
```

---

### 5.3. Reportes, dashboards, importación e integración portal

Estos módulos fortalecen operación, migración, visualización e integración:

```text id="specs-index-operations"
008-basic-reports
009-wordpress-integration-basic
027-dashboard-kpis
028-data-import-migration
023-inventory-basic
```

---

### 5.4. Finanzas e integraciones avanzadas

Estos módulos son importantes, pero se recomienda implementarlos después del MVP base:

```text id="specs-index-advanced-finance"
017-bank-reconciliation
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
026-automation-workflows-basic
```

---

## 6. Dependencias principales

| Módulo                             | Depende principalmente de                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `001-tenants`                      | Documentos SDD base, ADR-004                                                                           |
| `002-users-roles`                  | `001-tenants`, Keycloak, ADR-005, ADR-006, ADR-007                                                     |
| `003-residents-properties`         | `001-tenants`, `002-users-roles`                                                                       |
| `004-dues-fees`                    | `001-tenants`, `003-residents-properties`, `007-audit`                                                 |
| `005-payments`                     | `001-tenants`, `003-residents-properties`, `004-dues-fees`, `016-secure-document-storage`, `007-audit` |
| `006-account-statements`           | `004-dues-fees`, `005-payments`, `007-audit`                                                           |
| `007-audit`                        | `001-tenants`, `002-users-roles`                                                                       |
| `008-basic-reports`                | `004`, `005`, `006`, `007`                                                                             |
| `009-wordpress-integration-basic`  | `001-tenants`, API guidelines, WordPress portal                                                        |
| `010-reservations-common-areas`    | `001`, `002`, `003`, `004`, `007`                                                                      |
| `011-fines-sanctions`              | `001`, `002`, `003`, `004`, `007`, `016`                                                               |
| `012-communications-notifications` | `001`, `002`, `003`, `007`, `016`                                                                      |
| `013-meetings-attendance`          | `001`, `002`, `003`, `012`, `007`                                                                      |
| `014-voting-basic`                 | `001`, `002`, `003`, `013`, `007`                                                                      |
| `015-certified-minutes`            | `001`, `002`, `013`, `014`, `016`, `007`                                                               |
| `016-secure-document-storage`      | `001`, `002`, `007`                                                                                    |
| `017-bank-reconciliation`          | `005`, `007`, `020` opcional                                                                           |
| `018-payment-provider-integration` | `005`, `007`, `016`                                                                                    |
| `019-open-banking-integration`     | `017`, `007`, consentimiento                                                                           |
| `020-accounting-ledger`            | `004`, `005`, `017`, `007`                                                                             |
| `021-supplier-payments`            | `020`, `022`, `007`                                                                                    |
| `022-maintenance-work-orders`      | `001`, `002`, `003`, `016`, `007`                                                                      |
| `023-inventory-basic`              | `001`, `002`, `007`, `022` opcional                                                                    |
| `024-access-control-visitors`      | `001`, `002`, `003`, `007`                                                                             |
| `025-tenant-settings-policies`     | `001`, `002`, `007`                                                                                    |
| `026-automation-workflows-basic`   | Módulos fuente de eventos, `007`, `025`                                                                |
| `027-dashboard-kpis`               | `004`, `005`, `006`, `008`, `022`, `024`, `026`                                                        |
| `028-data-import-migration`        | Módulos destino, `016`, `007`                                                                          |
| `029-admin-web-app-basic`          | OpenAPI, Keycloak, `001`, `002`, módulos Core                                                          |
| `030-resident-self-service-basic`  | OpenAPI, Keycloak, `001`, `002`, `003`, `004`, `005`, `006`, `016`                                     |
| `031-implementation-readiness`     | Todos los documentos SDD, ADRs y specs 001-030                                                         |

---

## 7. Orden recomendado de implementación

### Sprint 0 — Fundación técnica

```text id="specs-index-sprint-0"
031-implementation-readiness
docs/implementation/sprint-0-foundation.md
monorepo
main como única rama permanente; master legacy se renombra antes de CI/remoto
Node.js 24.18.0 LTS
pnpm 11.21.0
packages/shared, packages/config, packages/auth, packages/openapi-client y packages/testing
Docker Compose: resident-api, postgres, redis, keycloak, keycloak-postgres, mailhog y minio
Imágenes exactas de Compose conforme a ADR-009 §7.1; sin latest ni versiones flotantes
CI inicial con quality, tests, contracts-data, security y build conforme a ADR-012 §10
NestJS scaffold compilable
Next.js base
PostgreSQL
Redis
Keycloak local
Prisma schema con generator y datasource, sin modelos, enums, migraciones, seeds ni PrismaService
OpenAPI tooling, sin runtime ni endpoints
Implementation Readiness en Markdown/Git, sin API ni persistencia runtime
```

---

### Sprint 1 — Backend Platform Base

```text id="specs-index-sprint-1"
NestJS runtime platform base
ConfigModule
ValidationPipe
ExceptionFilter
Logger sanitizado
HealthModule con liveness pública y readiness protegida según ADR-010 §10
PrismaService
OpenAPI runtime y generación de contrato
Auth skeleton
Tenant skeleton
Permission skeleton
Audit skeleton
```

---

### Sprint 2 — Tenants, identidad y autorización

```text id="specs-index-sprint-2"
001-tenants
002-users-roles
007-audit base
025-tenant-settings-policies base
Keycloak integration
TenantGuard
PermissionGuard
```

Los modelos `Tenant` y `UserProfile` se introducen en este sprint mediante sus specs
aprobadas; no forman parte del schema Prisma de Sprint 0.

---

### Sprint 3 — Residentes, propiedades y finanzas base

```text id="specs-index-sprint-3"
003-residents-properties
004-dues-fees
005-payments
006-account-statements
016-secure-document-storage
007-audit integration
```

---

### Sprint 4 — Admin Web App MVP

```text id="specs-index-sprint-4"
029-admin-web-app-basic
login Keycloak
tenant selector
permissions
residentes/unidades UI
alícuotas/cargos UI
pagos UI
estados de cuenta UI
documentos UI
```

---

### Sprint 5 — Resident Self-Service MVP

```text id="specs-index-sprint-5"
030-resident-self-service-basic
login Keycloak
tenant selector
property unit selector
dashboard residente
estado de cuenta propio
pagos propios
comprobantes
documentos propios
```

---

### Sprint 6 — Operación comunitaria básica

```text id="specs-index-sprint-6"
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
022-maintenance-work-orders
024-access-control-visitors
```

---

### Sprint 7 — Gobernanza, reportes y migración

```text id="specs-index-sprint-7"
008-basic-reports
013-meetings-attendance
014-voting-basic
015-certified-minutes
027-dashboard-kpis
028-data-import-migration
023-inventory-basic opcional
009-wordpress-integration-basic
```

---

### Post-MVP — Finanzas e integraciones avanzadas

```text id="specs-index-post-mvp"
017-bank-reconciliation
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
026-automation-workflows-basic
```

---

## 8. Reglas obligatorias de implementación

```text id="specs-index-implementation-rules"
- No implementar código sin revisar la spec correspondiente.
- No crear endpoint sin api-contract.md.
- No crear tabla sin data-model.md.
- No crear tarea sin tasks.md.
- No implementar módulo crítico sin test-plan.md.
- No implementar módulo crítico sin security-notes.md.
- No implementar pagos sin auditoría.
- No implementar documentos sin Secure Document Storage.
- No exponer storageKey.
- No usar WordPress como backend transaccional.
- No usar sesión WordPress para Core.
- No permitir rutas públicas administrativas.
- No permitir rutas públicas resident-facing transaccionales.
- No enviar datos reales a IA externa.
- No aceptar tenantId como autoridad final desde cliente.
- No aceptar actor fields desde cliente.
- No calcular saldos finales en frontend.
- No permitir que Keycloak reemplace autorización de negocio del Core.
```

---

## 9. Uso recomendado para agentes de código

Antes de usar Codex, Claude Code, Cursor u otro agente, indicar:

```text id="specs-index-agent-instruction"
Lee primero:
1. docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md
2. docs/specs/SPECS_INDEX.md
3. docs/sdd/constitution.md
4. docs/sdd/architecture.md
5. docs/sdd/security.md
6. docs/sdd/api-guidelines.md
7. docs/sdd/data-governance.md
8. docs/implementation/sprint-0-foundation.md

Luego implementa únicamente el sprint solicitado.
No inventes endpoints, tablas, permisos ni reglas fuera de las specs.
```

---

## 10. Estado actual del expediente SDD

```text id="specs-index-current-state"
docs/sdd/                         completo
docs/decisions/                   completo
docs/specs/{001-tenants,002-users-roles,003-residents-properties,004-dues-fees,005-payments,006-account-statements,007-audit,016-secure-document-storage,025-tenant-settings-policies}/ accepted
docs/specs/008-015,017-024,026-030/ needs-review
docs/specs/031-implementation-readiness/ complete
docs/changes/                     contiene cambios, readiness y cierres formales
docs/implementation/              contiene los runbooks cerrados de Sprint 0 y Sprint 1
docs/consolidated/                contiene documentos consolidados
docs/specs/SPECS_INDEX.md         creado
```

---

## 11. Próximo paso recomendado

La reevaluación previa que autorizó Sprint 0 se encuentra en:

```text id="specs-index-next"
docs/changes/READINESS-031-2026-08-10.md
```

La reevaluación de cierre del sprint se encuentra en:

```text id="specs-index-sprint0-closure"
docs/changes/SPRINT-0-CLOSURE-2026-08-11.md
```

La compuerta que autoriza Sprint 1 se encuentra en:

```text id="specs-index-sprint1-readiness"
docs/changes/READINESS-SPRINT-1-2026-08-11.md
docs/implementation/sprint-1-backend-platform-base.md
```

Estado vigente:

```text id="specs-index-next-implementation"
Definition of Done técnico de Sprint 0: PASS.
Cierre formal de Sprint 0: PASS; no existen gaps de cierre abiertos.
Sprint 1 Backend Platform Base: implementado y cerrado — PASS.
Implementation Readiness Sprint 2: GO desde 2026-08-14; 0 gaps críticos o altos
abiertos. Sprint 2 está formalmente cerrado con `GO`; manifest en fase final `9`, Fases
`0`–`9` completadas y ninguna fase siguiente dentro del sprint.
Implementation Readiness Sprint 3: GO desde 2026-08-31; manifest en fase `4`, 35/35
documentos aplicables `accepted` y 0 gaps abiertos; Fases 1 a 4 completadas.
La lógica de negocio requiere además la spec y el sprint funcional correspondientes.
```

La decisión vigente para Sprint 2 se encuentra en:

```text id="specs-index-sprint2-readiness"
docs/changes/READINESS-SPRINT-2-2026-08-11.md
docs/implementation/sprint-2-tenants-identity-access.md
docs/changes/GAP-S2-003-BOOTSTRAP-CONTRACT-2026-08-11.md
docs/changes/GAP-S2-004-ACTIVE-TENANT-CONTRACT-2026-08-12.md
docs/changes/GAP-S2-005-KEYCLOAK-OPERATING-CONTRACT-2026-08-12.md
docs/changes/GAP-S2-006-CONFIGURATION-PRISMA-OWNERSHIP-2026-08-13.md
docs/changes/GAP-S2-007-AUDIT-BASE-SEMANTICS-2026-08-13.md
docs/changes/GAP-S2-008-SEQUENCE-GATES-BOUNDARY-2026-08-14.md
docs/changes/GAP-S2-001-DOCUMENT-APPROVAL-2026-08-14.md
docs/changes/SPRINT-2-PHASE-1-KEYCLOAK-2026-08-14.md
docs/changes/SPRINT-2-PHASE-2-TENANT-IDENTITY-PERSISTENCE-2026-08-15.md
docs/changes/SPRINT-2-PHASE-3-AUDIT-BASE-2026-08-16.md
docs/changes/SPRINT-2-CLOSURE-2026-08-27.md
Decision: GO
Current/Final Phase: 9
Next phase within Sprint 2: none
```

La decisión vigente para Sprint 3 se encuentra en:

```text id="specs-index-sprint3-readiness"
docs/changes/READINESS-SPRINT-3-2026-08-28.md
docs/implementation/sprint-3-residents-properties-finance-base.md
docs/changes/GAP-S3-007-PERMISSIONS-AUDIT-CATALOG-2026-08-30.md
docs/changes/GAP-S3-008-FILE-SECURITY-OPERATING-POLICY-2026-08-30.md
docs/changes/GAP-S3-001-DOCUMENT-APPROVAL-2026-08-30.md
docs/changes/SPRINT-3-PHASE-1-RESIDENTS-PROPERTIES-PERSISTENCE-2026-08-31.md
docs/changes/SPRINT-3-PHASE-2-RESIDENTS-PROPERTIES-API-2026-09-03.md
docs/changes/SPRINT-3-PHASE-3-SECURE-DOCUMENT-STORAGE-2026-09-04.md
docs/changes/SPRINT-3-PHASE-4-DUES-FEES-FOUNDATION-2026-09-04.md
Decision: GO
Current Phase: 4
Next permitted phase: 5 — charge-lifecycle
```

---

## 12. Definition of Done de este índice

```text id="specs-index-dod"
[x] Lista todas las specs 001-031.
[x] Identifica módulo de cada spec.
[x] Clasifica prioridad.
[x] Indica estado documental.
[x] Indica sprint o fase sugerida.
[x] Resume dependencias principales.
[x] Define reglas obligatorias de implementación.
[x] Define uso recomendado para agentes de código.
[x] Apunta al siguiente documento consolidado.
```
