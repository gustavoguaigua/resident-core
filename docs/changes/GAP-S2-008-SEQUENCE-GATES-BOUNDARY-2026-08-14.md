# GAP-S2-008 — Secuencia, gates y frontera automática de Sprint 2

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Gap | `GAP-S2-008` |
| Fecha | 2026-08-14 |
| Estado | `closed` |
| Alcance | Secuencia progresiva, gates de capacidad, frontera y evidencia CI |
| Decisión de readiness | Continúa `NO_GO` |

## 2. Causa raíz

El runbook enumeraba nueve incrementos y sus gates, pero el repositorio sólo ejecutaba
los gates base y una frontera histórica de Sprint 1. No existía una fase versionada que
activara los gates de capacidad, un verificador de Prisma/OpenAPI contra la frontera de
Sprint 2 ni evidencia específica del resultado en CI. Mantener `sprint1:boundary` como
gate obligatorio también habría bloqueado la primera migración legítima después de un
futuro `GO`.

## 3. Solución canónica

`packages/testing/config/sprint-2-gates.json` es la fuente ejecutable de la secuencia.
Contiene una decisión de readiness y una `currentPhase`. Mientras la decisión sea
`NO_GO`, la fase debe ser `0`; cualquier modelo, enum, migración, realm o endpoint
funcional de Sprint 2 hace fallar la frontera.

Después de un `GO`, cada incremento eleva `currentPhase` únicamente en el PR que aporta
todos sus artefactos, scripts y pruebas. El runner ejecuta acumulativamente los comandos
de todas las fases activas. Un script ausente es error; no se usa `--if-present`,
`continue-on-error` ni suites vacías.

## 4. Secuencia y comandos activados

| Fase | Incremento | Comandos específicos obligatorios |
| ---: | --- | --- |
| 0 | Readiness / frontera `NO_GO` | `sprint2:boundary` |
| 1 | Realm y contrato Keycloak | `keycloak:verify`, `test:keycloak` |
| 2 | Persistencia Tenant/Identity | `prisma:migrate:check` |
| 3 | Audit base | `test:audit` |
| 4 | Bootstrap PlatformAdmin | `test:bootstrap` |
| 5 | Identidad, memberships y autorización | `test:authorization`, `test:multitenancy` |
| 6 | Onboarding y lifecycle de tenants | `test:tenants` |
| 7 | Invitaciones y memberships posteriores | `test:invitations` |
| 8 | Settings mínimos | `test:settings` |
| 9 | Cierre cruzado y OpenAPI | `test:api`, `test:integration`, `test:stack:smoke`, `openapi:check`, `openapi:validate` |

Los gates base de ADR-012 continúan ejecutándose en `Required CI gates`: instalación
frozen, formato, lint, tipos, pruebas, OpenAPI, Prisma validate, Compose config,
dependency/secret scanning y builds. La tabla añade sólo gates de capacidad.

## 5. Frontera automática

`verify-sprint-2-boundary.mjs` valida:

- coincidencia entre la decisión del manifest y readiness;
- fase `0` obligatoria mientras exista `NO_GO`;
- orden, IDs y nombres inmutables de las diez fases;
- allowlist exacta de modelos y enums Prisma de Specs 001, 002, 007 base y 025 base;
- exclusión expresa de `TenantConfiguration` y dominios posteriores;
- allowlist método+ruta de la superficie API máxima del runbook;
- ausencia de APIs públicas de Audit;
- orden de migraciones tenant/identity, Audit y settings;
- presencia de los cuatro artefactos Keycloak al activar fase 1;
- artefactos mínimos de persistencia, Audit, bootstrap y settings en sus fases;
- rechazo de señales de una fase posterior antes de activarla.

El drift entre runtime y OpenAPI continúa cubierto por `openapi:check`; por tanto, una
ruta runtime no puede eludir la allowlist manteniendo un contrato generado distinto.

## 6. Runner y evidencia

El comando canónico local y de CI es `pnpm sprint2:gates`;
`pnpm sprint2:boundary` permite ejecutar únicamente la frontera durante diagnóstico.
`run-sprint-2-gates.mjs`:

1. ejecuta siempre `sprint2:boundary`;
2. exige y ejecuta en orden todos los comandos hasta `currentPhase`;
3. detiene el proceso ante el primer fallo;
4. genera `artifacts/sprint-2-gates/evidence.json` con decisión, fase, commit/run de
   GitHub y resultado de cada gate;
5. marca las fases futuras como `not-active`, no como aprobadas.

`.github/workflows/ci.yml` ejecuta el runner al final del status check obligatorio
`Required CI gates` y publica el JSON en `$GITHUB_STEP_SUMMARY`. La evidencia sólo se
publica si todos los gates previos y progresivos finalizaron correctamente.

## 7. Cobertura de los gates del runbook

- base limpia y drift: fase 2;
- realm, OIDC real, issuer/audience/JWKS y JWT negativos: fase 1;
- concurrencia, idempotencia y ausencia de bootstrap HTTP: fase 4;
- rollback de onboarding, activación y último TenantAdmin: fases 5–6;
- multitenancy, estados inválidos y permisos negativos: fase 5;
- expiración, revocación, reúso y hash-only de invitaciones: fase 7;
- durabilidad, aislamiento, sanitización y append-only de Audit: fase 3;
- resolución, validación y aislamiento de settings: fase 8;
- drift OpenAPI y pruebas cruzadas: fase 9;
- stack real con imágenes fijadas: `test:stack:smoke` en fase 9.

## 8. Criterios de cierre satisfechos

- secuencia versionada y ejecutable;
- activación acumulativa y fail-closed de gates;
- frontera Prisma/API comprobada automáticamente;
- `NO_GO` impide artefactos funcionales de Sprint 2;
- reemplazo en CI de la frontera histórica de Sprint 1;
- evidencia JSON publicada por el workflow;
- pruebas positivas y negativas del verificador;
- sin runtime funcional, migraciones, realm o dependencias nuevas.

## 9. Consecuencia para readiness

Al cerrar `GAP-S2-008`, Sprint 2 conservó `NO_GO` y fase `0` porque `GAP-S2-001`
permanecía abierto. `GAP-S2-001` cerró posteriormente la aprobación documental y la
reevaluación formal del 2026-08-14 emitió `GO`. La fase permanece en `0` hasta que el PR
de fase `1` aporte atómicamente sus artefactos y gates.
