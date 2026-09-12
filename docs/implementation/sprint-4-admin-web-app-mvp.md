# Sprint 4 — Admin Web App MVP

## 1. Estado y autoridad

| Campo                 | Valor                                         |
| --------------------- | --------------------------------------------- |
| Sprint                | 4 — Admin Web App MVP                         |
| Baseline              | `952474c` — Sprint 3 cerrado                  |
| Decisión de readiness | `NO_GO`                                       |
| `currentPhase`        | `0`                                           |
| Spec principal        | `docs/specs/029-admin-web-app-basic/`         |
| Manifest              | `packages/testing/config/sprint-4-gates.json` |

Este runbook recorta la visión amplia de Spec 029 al incremento autorizado por el
roadmap. Mientras GAP-S4-001 y GAP-S4-002 estén abiertos, ninguna fase posterior a
readiness puede iniciarse y los siete documentos permanecen `needs-review`.

## 2. Objetivo

Entregar una consola administrativa privada, tenant-aware y permission-aware para los
flujos básicos ya soportados por Core al cierre de Sprint 3. El frontend consume
exclusivamente contratos OpenAPI tipados, no contiene reglas transaccionales finales y
no sustituye la autorización del backend.

## 3. Alcance definitivo

- foundation de `apps/admin-web` sobre el scaffold existente;
- login/logout/callback con el cliente público `resident-admin-web` y PKCE S256;
- perfil administrativo, tenant selector y permisos efectivos después de cerrar
  GAP-S4-001;
- shell, navegación, loading/error/empty/forbidden y cache aislada por tenant;
- residents/properties: personas, entidades legales, unidades, ownerships,
  residencias y leases;
- dues: conceptos, schedules, cuotas por unidad, periodos, batches y cargos;
- payments: consulta, confirmación/rechazo y revisión/descarga de
  receipts/comprobantes;
- consulta de balances, movimientos financieros y account statements;
- formularios y acciones únicamente para la allowlist de la sección 7;
- accesibilidad, seguridad, pruebas unitarias, integración y E2E de los flujos
  autorizados.

## 4. Fuera de alcance

- dashboard/KPI: se difiere a Sprint 7 con Spec 027; no se inventan endpoints ni
  agregaciones financieras en frontend;
- Users/Roles UI: el roadmap de Sprint 4 no la exige y no existe superficie de lectura
  administrativa completa; tampoco se administra Keycloak;
- pantalla documental general: no existe API SDS general; sólo se autorizan
  receipts/comprobantes de Payments y su descarga segura;
- importación/migración, audit/reporting general, Resident Self-Service y módulos de
  Sprints 5–7;
- generación mensual de cargos, cierre/bloqueo de periodos, ajustes y reversos de
  cargos;
- creación de pagos, allocations, auto-allocation y reversos de pagos/allocations;
- generación, publicación, regeneración, cierre o bloqueo de account statements y
  recálculo manual de balances;
- BFF nuevo, sesión WordPress, Prisma/DB desde frontend, infraestructura o cambios de
  Core no definidos por los dos GAPs.

## 5. Dependencias

Satisfechas:

- Sprint 3 `CLOSED / COMPLETED` y OpenAPI cross-slice integrado;
- Keycloak `resident-admin-web` público con Authorization Code y PKCE S256;
- Core valida bearer token, identidad, tenant, membership y permiso exacto;
- `X-Tenant-Id` es el contexto tenant validado;
- APIs de residents/properties y finanzas base integradas;
- acceso seguro a receipts disponible;
- scaffold Next.js/React/TypeScript strict existente.

Pendientes y bloqueantes:

- GAP-S4-001: perfil administrativo, memberships/tenants accesibles y permisos Core
  efectivos;
- GAP-S4-002: success schemas completos y cliente TypeScript determinista.

## 6. Auth, tenant y permisos

- El navegador usa el cliente público existente, Authorization Code Flow y PKCE S256.
- No hay BFF ni sesión WordPress.
- Tokens en memoria; nunca en URL, logs, `localStorage` o `sessionStorage`.
- Claims Keycloak no conceden permisos. Core es autoridad final.
- El cambio de tenant limpia cache y estado derivado antes de usar el nuevo
  `X-Tenant-Id`.
- Rutas y acciones se ocultan por permisos efectivos para UX; cada request sigue
  sujeto al permiso Core exacto.
- Roles canónicos: `TenantAdmin`, `Treasurer`, `BoardMember`, `TenantAuditor`,
  `TenantStaff`, `Guard`, `ExternalAccountant`, `PropertyOwner` y `Resident`.
- `FinancialManager` es un nombre preliminar obsoleto y se normaliza a `Treasurer`.
- `PlatformAdmin` no obtiene acceso tenant-scoped implícito.

## 7. Allowlist funcional del MVP

### 7.1 Lectura

Se autoriza GET de las colecciones y detalles tenant-scoped existentes para:

- personas, entidades legales, unidades, ownerships, residencias y leases;
- conceptos, schedules, cuotas por unidad, periodos, batches y cargos;
- pagos, receipts/comprobantes y descarga segura;
- allocations sólo como detalle informativo asociado al pago;
- balances, movimientos financieros y account statements.

### 7.2 Create/update

Se autorizan las mutaciones Core existentes para:

- crear/actualizar/archivar personas, entidades legales y unidades;
- vincular una persona con una identidad;
- crear/actualizar/finalizar ownerships, residencias y leases;
- crear/actualizar/archivar conceptos y schedules;
- asignar/finalizar cuotas por unidad;
- crear billing periods;
- crear y cancelar cargos `DRAFT`.

### 7.3 Confirm/reject

Se autorizan confirmación y rechazo de pagos y aceptación/rechazo de
receipts/comprobantes, siempre condicionados al permiso Core exacto, idempotencia y
estado permitido por backend.

### 7.4 Allocate/reverse y generate/publish

No se habilitan en Sprint 4. Que Core exponga una operación no la incorpora
automáticamente al MVP. Allocations, reversos, generación mensual, recálculo de
balances y generación/publicación/lifecycle de statements quedan fuera de la
allowlist UI.

## 8. OpenAPI y cliente

El contrato runtime usa `x-auth-required`, `x-public`, `x-platform-only`,
`x-tenant-scope: tenant`, `x-tenant-context-required`, `x-own-resource`,
`x-required-permission` y `x-idempotency-required`. No se usan las extensiones
preliminares `x-public-exposure` ni `x-tenant-scope: true`.

No se escriben DTOs manuales para suplir schemas ausentes. Fase 2 debe transformar
`packages/openapi-client` de `contract-only` a cliente generado, reproducible y
type-safe antes de consumir Core desde pantallas.

## 9. Fases y artefactos autorizados

| Fase | Nombre                           | Artefactos autorizados                                                      |
| ---: | -------------------------------- | --------------------------------------------------------------------------- |
|    0 | readiness                        | Documentos, GAPs, manifest, boundary y pruebas documentales                 |
|    1 | authenticated-discovery-contract | Contrato/runtime/OpenAPI/tests exclusivamente para GAP-S4-001               |
|    2 | typed-openapi-client-contract    | Schemas, generador, cliente y gate de GAP-S4-002                            |
|    3 | admin-web-foundation             | Tooling frontend aprobado, providers base y test harness                    |
|    4 | auth-tenant-permissions          | OIDC, sesión en memoria, selector, PermissionProvider y guards              |
|    5 | api-client-layout                | Cliente integrado, query cache tenant-scoped, shell y estados transversales |
|    6 | residents-properties-ui          | Pantallas y acciones de residents/properties allowlisted                    |
|    7 | finance-ui                       | Pantallas y acciones financieras allowlisted, incluidos receipts            |
|    8 | hardening-closure                | E2E, accesibilidad, seguridad, build y cierre formal                        |

Cada incremento eleva `currentPhase` sólo cuando aporta sus artefactos y gates en el
mismo cambio. Pasar de `NO_GO` a `GO` requiere cerrar ambos gaps y aceptar formalmente
Spec 029; no existe aceptación condicionada.

## 10. Gates y boundary

El manifest contiene los nombres de gates requeridos por fase. Durante readiness sólo
son ejecutables:

- `node packages/testing/tools/verify-sprint-4-boundary.mjs`;
- `pnpm --filter @resident/testing exec vitest run test/sprint-4-boundary.spec.ts`;
- `pnpm sprint3:boundary`;
- Prettier focalizado y `git diff --check`.

Los comandos de Fases 1–8 son contratos de entrega futuros y no se incorporan a
`package.json` en readiness. El boundary impide avanzar `currentPhase`, aceptar Spec
029 o declarar `GO` mientras los dos GAPs permanezcan abiertos.

## 11. Criterios GO, cierre y parada

GO para comenzar frontend requiere GAP-S4-001 y GAP-S4-002 `CLOSED`, siete documentos
Spec 029 `accepted`, manifest consistente y gates contractuales en PASS.

El Sprint cierra sólo cuando Fases 1–8 están integradas, CI pasa, el contrato OpenAPI y
cliente no tienen drift, no hay filtración cross-tenant, los flujos críticos E2E y de
accesibilidad pasan y no existen gaps críticos/altos/medios abiertos.

Se debe parar ante ambigüedad de auth/tenant/permisos, endpoint o schema inexistente,
intento de ampliar la allowlist, autorización desde claims, persistencia insegura de
tokens, lógica financiera duplicada o necesidad de infraestructura no aprobada.
