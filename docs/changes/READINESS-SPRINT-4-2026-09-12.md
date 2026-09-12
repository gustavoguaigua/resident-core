# READINESS-SPRINT-4 — Admin Web App MVP

## 1. Información

| Campo                     | Valor                                                |
| ------------------------- | ---------------------------------------------------- |
| Proyecto                  | RESIDENT Core                                        |
| Evaluación                | `READINESS-SPRINT-4-2026-09-12`                      |
| Fecha                     | 2026-09-12                                           |
| Alcance                   | Preparación formal para Sprint 4 — Admin Web App MVP |
| Commit base inspeccionado | `952474c`                                            |
| Rama de evaluación        | `codex/sprint-4-readiness`                           |
| Decision                  | `NO_GO`                                              |
| Plan propuesto            | `docs/implementation/sprint-4-admin-web-app-mvp.md`  |
| Manifest                  | `packages/testing/config/sprint-4-gates.json`        |
| `currentPhase`            | `0`                                                  |

## 2. Resultado

Sprint 3 está cerrado y ofrece una base funcional suficiente, pero Sprint 4 no puede
iniciar implementación frontend segura. Faltan el descubrimiento autenticado que
conecta la sesión con tenants/memberships/permisos Core y un contrato OpenAPI con
schemas de éxito capaz de producir un cliente TypeScript determinista.

La decisión es `NO_GO`, no un rechazo del Sprint: fija dos brechas `HIGH`, su orden de
cierre y una frontera verificable. Los siete artefactos de Spec 029 permanecen
`needs-review` y `currentPhase = 0`.

## 3. Evidencia

| Evidencia      | Resultado                                                                         |
| -------------- | --------------------------------------------------------------------------------- |
| Sprint 3       | `CLOSED / COMPLETED`; Fases 1–9 integradas                                        |
| Admin Web      | Scaffold de Sprint 0; sin auth, tenant selector, cliente ni módulos funcionales   |
| Keycloak       | Cliente público `resident-admin-web`, Authorization Code + PKCE S256              |
| Tenant/authz   | Core valida bearer, identidad, tenant, membership y permiso exacto                |
| Descubrimiento | No existen `/api/v1/me`, tenants accesibles ni permisos efectivos administrativos |
| OpenAPI        | Superficie runtime integrada; success responses insuficientemente tipadas         |
| Cliente        | `packages/openapi-client` permanece `contract-only`                               |
| Documentos     | No hay API SDS general; receipts seguros sí están disponibles                     |
| Dashboard      | No hay API KPI; Spec 027 está asignada a Sprint 7                                 |
| Users/Roles    | No hay lectura administrativa completa y el roadmap no la exige en Sprint 4       |
| Spec 029       | Siete documentos `needs-review`; alcance preliminar excede el roadmap             |

## 4. Alcance final

Sprint 4 incluye foundation, OIDC, descubrimiento y selección de tenant, permisos,
shell y estados transversales, residents/properties UI, dues/charges UI, payments con
revisión de receipts/comprobantes y consultas de balances/account statements.

No incluye dashboard, Users/Roles UI, documentos generales, importación, auditoría o
reportes generales, Resident Self-Service, módulos comunitarios/avanzados ni todas las
mutaciones financieras que Core expone. La allowlist detallada está en el runbook.

## 5. Decisiones cerradas

1. **Documentos:** sólo receipts/comprobantes de Payments y descarga segura. No existe
   pantalla documental general ni se inventa API SDS.
2. **Dashboard:** excluido; corresponde a Spec 027/Sprint 7. No se calculan KPIs en UI.
3. **Users/Roles:** fuera de Sprint 4; no se amplía Core ni se administra Keycloak.
4. **Descubrimiento:** es backend/OpenAPI requerido y queda formalizado en GAP-S4-001.
5. **Cliente:** schemas de éxito y generación TypeScript son precondición, GAP-S4-002.
6. **Auth:** cliente público existente, Authorization Code + PKCE S256, tokens en
   memoria, sin BFF ni WordPress.
7. **Roles/permisos:** Core es autoridad; `FinancialManager` se sustituye por
   `Treasurer`; claims no autorizan.
8. **OpenAPI metadata:** se usan extensiones runtime vigentes, incluida
   `x-tenant-scope: tenant` y `x-public`; no variantes preliminares.
9. **Finanzas:** lectura y administración básica allowlisted; allocations/reversos y
   generate/publish quedan fuera del MVP.

## 6. Registro de GAPs

### GAP-S4-001 — Descubrimiento autenticado

| Campo     | Valor                             |
| --------- | --------------------------------- |
| Severidad | Alta                              |
| Estado    | `OPEN`                            |
| Bloquea   | Fase 1 y toda sesión tenant-aware |

Debe definir e implementar perfil administrativo, tenants/memberships accesibles y
permisos Core efectivos con aislamiento tenant y DTOs OpenAPI.

### GAP-S4-002 — OpenAPI tipado y cliente TypeScript

| Campo     | Valor                              |
| --------- | ---------------------------------- |
| Severidad | Alta                               |
| Estado    | `OPEN`                             |
| Bloquea   | Fase 2 y consumo funcional de Core |

Debe completar success schemas, generación determinista, drift gate y cliente
type-safe. Se cierra después de GAP-S4-001 para incluir su superficie definitiva.

No se detectaron gaps críticos ni medios. Existen dos gaps altos abiertos, por lo que
la readiness no puede declarar `GO`.

## 7. Normalización de Spec 029

Los siete documentos reciben una sección normativa de readiness. Su visión amplia se
conserva como referencia post-MVP, pero no autoriza endpoints, pantallas, roles,
permisos o extensiones fuera del runbook. Todos permanecen `needs-review` hasta cerrar
ambos GAPs; no se permite aceptación condicionada.

## 8. Secuencia y frontera

Las Fases 0–8 son: readiness; discovery contract; typed client contract; frontend
foundation; auth/tenant/permissions; API client/layout; residents/properties UI;
finance UI; hardening/closure.

El manifest inicia en `readinessDecision = NO_GO` y `currentPhase = 0`. Los nombres de
gates futuros quedan declarados sin crear scripts ni funcionalidad. El verificador
comprueba manifest, gaps, estado de Spec 029, ausencia de discovery actual y estado
`contract-only` del cliente.

## 9. Criterios para reevaluar

La readiness puede cambiar a `GO` sólo después de integrar, en orden:

1. GAP-S4-001 con runtime, OpenAPI, seguridad y gate reproducible;
2. GAP-S4-002 con schemas, generación, cliente y gate reproducible;
3. normalización final y aceptación de los siete documentos de Spec 029;
4. manifest/boundary actualizado en el mismo incremento, sin adelantar frontend.

## 10. Frontera de esta evaluación

Esta evaluación no modifica Admin Web, API, Prisma, migraciones, OpenAPI, cliente,
Keycloak, Docker, dependencias, package manifests, lockfile ni CI. No inicia Sprint 4
funcional y no altera el cierre de Sprint 3.
