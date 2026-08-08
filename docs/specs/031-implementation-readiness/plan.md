# Plan — 031 Implementation Readiness

## 1. Información del documento

| Campo          | Valor                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                                       |
| Spec ID        | 031                                                                                                                 |
| Módulo         | Implementation Readiness                                                                                            |
| Documento      | Implementation Plan                                                                                                 |
| Ruta           | `docs/specs/031-implementation-readiness/plan.md`                                                                   |
| Versión        | 0.1                                                                                                                 |
| Estado         | Borrador inicial                                                                                                    |
| Fecha          | 2026-08-05                                                                                                          |
| Fase           | FASE 2 — Preparación de implementación                                                                              |
| Naturaleza     | Readiness gate / SDD closure checkpoint / Pre-implementation validation                                             |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / BullMQ / Docker / Keycloak / OpenAPI / Next.js / GitHub Actions |

---

## 2. Propósito

Definir el plan operativo para ejecutar la compuerta `031-implementation-readiness`, cuyo objetivo es validar que RESIDENT Core puede pasar de documentación SDD a implementación técnica con un nivel aceptable de claridad, consistencia, seguridad y trazabilidad.

Este paquete no implementa lógica transaccional nueva. Define cómo revisar, clasificar, cerrar gaps, aprobar condiciones mínimas y preparar el repositorio para iniciar desarrollo.

Regla central:

```text id="ir-plan-rule"
Implementation Readiness debe ejecutarse como una compuerta formal antes del código productivo, validando documentación SDD, ADRs, contratos API, modelos de datos, seguridad, multitenancy, Keycloak, OpenAPI, testing, CI/CD, repositorio, Docker y orden de implementación; ningún módulo crítico debe implementarse si tiene gaps bloqueantes, contratos inconsistentes, ausencia de security-notes, ausencia de pruebas mínimas, autorización indefinida, exposición de storageKey, dependencia transaccional de WordPress o ambigüedad arquitectónica crítica.
```

---

## 3. Resultado esperado del plan

Al finalizar este plan debe existir una respuesta objetiva a la pregunta:

```text id="ir-plan-key-question"
¿RESIDENT Core está suficientemente preparado para iniciar implementación técnica del MVP sin improvisación arquitectónica crítica?
```

Resultado esperado:

```text id="ir-plan-expected-result"
readiness workflow definido
inventario documental definido
matriz de estado documental definida
gaps críticos definidos
gaps no bloqueantes definidos
orden de implementación definido
estructura de repositorio definida
backend readiness definido
database readiness definido
Keycloak readiness definido
OpenAPI readiness definido
frontend readiness definido
testing readiness definido
CI/CD readiness definido
Docker readiness definido
Definition of Ready ejecutable definida
go/no-go decision definida
```

---

## 4. Decisión técnica principal

```text id="ir-plan-decision"
Implementation Readiness se implementará como una revisión documental y técnica previa al desarrollo, ejecutada mediante checklists, matriz de gaps, matriz de dependencias, matriz de prioridad, Definition of Ready global y decisión Go / Conditional Go / No-Go.
```

Estados posibles:

```text id="ir-plan-decision-states"
GO — listo para iniciar implementación.
CONDITIONAL_GO — listo para iniciar solo fases no bloqueadas.
NO_GO — no iniciar implementación hasta resolver gaps críticos.
```

---

## 5. Alcance operativo

### 5.1. Incluido

```text id="ir-plan-scope-in"
- Inventario documental SDD.
- Revisión de documentos base.
- Revisión de ADRs.
- Revisión de paquetes 001-030.
- Validación de consistencia entre paquetes.
- Validación de arquitectura objetivo.
- Validación de límites WordPress/Core.
- Validación de multitenancy.
- Validación de Keycloak.
- Validación de PostgreSQL/Prisma.
- Validación de OpenAPI.
- Validación de seguridad.
- Validación de testing.
- Validación de CI/CD.
- Validación de Docker/local development.
- Priorización de implementación.
- Identificación de gaps.
- Definición de criterios Go/No-Go.
```

---

### 5.2. Fuera de alcance

```text id="ir-plan-scope-out"
- Codificar módulos productivos.
- Crear migraciones definitivas.
- Configurar AWS productivo.
- Configurar Keycloak productivo.
- Implementar pasarela de pagos real.
- Implementar open banking real.
- Implementar hardware de accesos.
- Implementar biometría.
- Implementar reconocimiento facial.
- Implementar microservicios físicos.
- Implementar IA con datos reales.
```

---

## 6. Artefactos de salida

Este paquete debe producir o consolidar:

```text id="ir-plan-outputs"
- spec.md.
- plan.md.
- data-model.md.
- api-contract.md.
- test-plan.md.
- tasks.md.
- security-notes.md.
- readiness-checklist.md opcional.
- readiness-matrix.md opcional.
- gap-register.md opcional.
- implementation-sequence.md opcional.
```

Nota:

```text id="ir-plan-output-note"
Los archivos opcionales pueden integrarse dentro de los documentos principales si se decide mantener el expediente compacto.
```

---

## 7. Flujo de ejecución

```text id="ir-plan-workflow"
1. Inventariar documentos SDD.
2. Clasificar paquetes por prioridad.
3. Verificar completitud documental.
4. Revisar consistencia arquitectónica.
5. Revisar consistencia de seguridad.
6. Revisar consistencia de API.
7. Revisar consistencia de datos.
8. Revisar estrategia Keycloak.
9. Revisar estrategia multitenant.
10. Revisar estrategia de testing.
11. Revisar estrategia CI/CD.
12. Revisar preparación local con Docker.
13. Registrar gaps.
14. Clasificar gaps.
15. Resolver o diferir gaps.
16. Emitir decisión Go / Conditional Go / No-Go.
17. Definir primer backlog de implementación.
```

---

## 8. Fase 1 — Inventario documental

### 8.1. Documentos base

Verificar existencia de:

```text id="ir-plan-base-docs"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
```

Criterios:

```text id="ir-plan-base-docs-criteria"
[ ] Existe.
[ ] Tiene versión.
[ ] Está alineado con Keycloak.
[ ] Está alineado con monolito modular.
[ ] Está alineado con multitenancy.
[ ] Está alineado con API-first.
[ ] Está alineado con WordPress como capa pública no transaccional.
```

---

### 8.2. ADRs

Verificar existencia de:

```text id="ir-plan-adrs"
ADR-001-architecture-style.md
ADR-002-backend-framework.md
ADR-003-database-strategy.md
ADR-004-multitenancy-strategy.md
ADR-005-authentication-strategy.md
ADR-006-identity-provider-strategy.md
ADR-007-authorization-strategy.md
ADR-008-api-gateway-strategy.md
ADR-009-deployment-strategy.md
ADR-010-observability-strategy.md
ADR-011-testing-strategy.md
ADR-012-ci-cd-strategy.md
```

Criterios:

```text id="ir-plan-adrs-criteria"
[ ] Existe.
[ ] Tiene estado.
[ ] Tiene contexto.
[ ] Tiene decisión.
[ ] Tiene consecuencias.
[ ] No contradice architecture.md.
[ ] No contradice security.md.
[ ] No contradice api-guidelines.md.
[ ] No contradice paquetes 001-030.
```

---

### 8.3. Paquetes 001-030

Cada paquete debe revisarse con la siguiente matriz:

```text id="ir-plan-package-docs"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

Estados permitidos:

```text id="ir-plan-package-status"
complete
partial
missing
deferred
blocked
needs-review
```

---

## 9. Fase 2 — Clasificación por prioridad

### 9.1. MVP obligatorio

```text id="ir-plan-mvp-core"
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
```

Regla:

```text id="ir-plan-mvp-core-rule"
Ningún paquete MVP obligatorio puede iniciar implementación si carece de spec, data-model, api-contract, test-plan, tasks o security-notes.
```

---

### 9.2. MVP extendido

```text id="ir-plan-mvp-extended"
008-basic-reports
009-wordpress-integration-basic
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
022-maintenance-work-orders
024-access-control-visitors
027-dashboard-kpis
028-data-import-migration
```

Regla:

```text id="ir-plan-mvp-extended-rule"
Pueden implementarse después del núcleo obligatorio, siempre que no introduzcan cambios incompatibles en seguridad, API o datos.
```

---

### 9.3. Diferibles o avanzados

```text id="ir-plan-deferred"
017-bank-reconciliation
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
023-inventory-basic
026-automation-workflows-basic
```

Regla:

```text id="ir-plan-deferred-rule"
Pueden mantenerse documentados pero diferidos, salvo que el MVP financiero requiera explícitamente alguno de ellos.
```

---

## 10. Fase 3 — Revisión de consistencia arquitectónica

Validar:

```text id="ir-plan-architecture-checks"
[ ] Arquitectura monolito modular confirmada.
[ ] Microservicios físicos diferidos.
[ ] API-first confirmado.
[ ] Docker confirmado.
[ ] PostgreSQL confirmado.
[ ] Prisma confirmado.
[ ] Redis/BullMQ confirmado para procesos async.
[ ] Keycloak confirmado como IdP objetivo.
[ ] WordPress confirmado como capa pública informativa.
[ ] Admin Web App separada de WordPress.
[ ] Resident Web App separada de WordPress.
[ ] OpenAPI como contrato entre backend y frontends.
```

Bloqueante si:

```text id="ir-plan-architecture-blockers"
- Se intenta usar WordPress como backend transaccional.
- Se omite tenant isolation.
- Se mezclan reglas críticas en frontend.
- Se elimina auditoría financiera.
- Se implementan microservicios físicos sin base modular.
- Se exponen rutas públicas transaccionales.
```

---

## 11. Fase 4 — Revisión de multitenancy

Validar:

```text id="ir-plan-multitenancy-checks"
[ ] Estrategia shared schema + tenant_id documentada.
[ ] tenant_id obligatorio en entidades tenant-scoped.
[ ] TenantGuard definido.
[ ] Cross-tenant access responde 404 o 403 según política.
[ ] No se acepta tenantId editable en DTOs.
[ ] Índices tenant-scoped definidos.
[ ] Auditoría tenant-scoped definida.
[ ] APIs tenant-scoped definidas.
[ ] Frontends limpian cache al cambiar tenant.
```

Bloqueante si:

```text id="ir-plan-multitenancy-blockers"
- Entidades críticas no tienen tenant_id.
- APIs aceptan tenantId como autoridad final.
- Queries no filtran por tenant.
- Frontend cachea datos sin tenant boundary.
```

---

## 12. Fase 5 — Revisión de autorización

Validar:

```text id="ir-plan-authz-checks"
[ ] Keycloak autentica.
[ ] Core autoriza.
[ ] RBAC definido.
[ ] Permisos definidos por módulo.
[ ] Resource-level authorization definida.
[ ] Property-level authorization definida para portal residente.
[ ] PermissionGuard definido.
[ ] SensitivePermissionGuard definido donde aplica.
[ ] Frontend usa permisos solo para UI.
[ ] Backend valida cada acción.
```

Bloqueante si:

```text id="ir-plan-authz-blockers"
- Frontend decide autorización final.
- Roles Keycloak reemplazan reglas de negocio del Core.
- No existe autorización por tenant.
- No existe autorización por unidad para self-service.
- Acciones financieras no tienen permisos específicos.
```

---

## 13. Fase 6 — Revisión de seguridad

Validar:

```text id="ir-plan-security-checks"
[ ] security.md actualizado.
[ ] security-notes por paquete crítico.
[ ] No storageKey exposure.
[ ] No signedUrl persistente.
[ ] No secrets en logs.
[ ] No tokens en URL.
[ ] No sesión WordPress.
[ ] No public admin routes.
[ ] No public resident transactional routes.
[ ] No datos reales a IA externa.
[ ] Error handling seguro.
[ ] Rate limiting básico definido.
[ ] CORS restrictivo definido.
[ ] Headers browser security definidos para frontends.
```

Bloqueante si:

```text id="ir-plan-security-blockers"
- storageKey aparece en responses.
- WordPress autentica operaciones Core.
- Rutas privadas aparecen bajo /public.
- Datos financieros se exponen sin auth.
- Documentos privados pueden descargarse sin autorización.
- IA externa recibe datos reales.
```

---

## 14. Fase 7 — Revisión de API/OpenAPI

Validar:

```text id="ir-plan-openapi-checks"
[ ] REST /api/v1 definido.
[ ] Response envelope estándar.
[ ] Error envelope estándar.
[ ] Auth scheme Bearer definido.
[ ] Endpoints tenant-scoped documentados.
[ ] Endpoints .own documentados.
[ ] OpenAPI extensions definidas.
[ ] Cliente admin-web generable.
[ ] Cliente resident-web generable.
[ ] Contract tests definidos.
[ ] CI falla si OpenAPI rompe clientes.
```

Bloqueante si:

```text id="ir-plan-openapi-blockers"
- Frontend consume endpoints no documentados.
- api-contract.md falta en módulo MVP.
- OpenAPI no incluye seguridad.
- OpenAPI expone storageKey.
- OpenAPI acepta campos server-side desde cliente.
```

---

## 15. Fase 8 — Revisión de datos y Prisma

Validar:

```text id="ir-plan-data-checks"
[ ] PostgreSQL definido.
[ ] Prisma definido.
[ ] UUID definido.
[ ] Decimal para dinero.
[ ] snake_case en DB.
[ ] camelCase en JSON.
[ ] timestamps estándar.
[ ] tenant_id en tablas tenant-scoped.
[ ] índices críticos definidos.
[ ] no hard delete en entidades críticas.
[ ] auditoría en operaciones críticas.
[ ] migraciones versionadas.
```

Bloqueante si:

```text id="ir-plan-data-blockers"
- Dinero se modela con float.
- No hay tenant_id en entidad tenant-scoped.
- Entidades financieras no son auditables.
- Estados de cuenta son fuente primaria independiente.
- Comprobantes se almacenan fuera de SDS.
```

---

## 16. Fase 9 — Revisión de testing

Validar:

```text id="ir-plan-testing-checks"
[ ] ADR-011 testing existe.
[ ] test-plan.md existe en paquetes MVP.
[ ] Unit tests definidos.
[ ] Integration tests definidos.
[ ] API tests definidos.
[ ] E2E tests críticos definidos.
[ ] Multitenancy tests definidos.
[ ] Permission tests definidos.
[ ] Security tests definidos.
[ ] Financial tests definidos.
[ ] OpenAPI contract tests definidos.
[ ] Frontend tests definidos.
```

Bloqueante si:

```text id="ir-plan-testing-blockers"
- No hay tests multitenant.
- No hay tests de permisos.
- No hay tests financieros críticos.
- No hay tests para no storageKey.
- No hay tests de OpenAPI.
- No hay CI mínimo para ejecutar pruebas.
```

---

## 17. Fase 10 — Revisión CI/CD

Validar:

```text id="ir-plan-cicd-checks"
[ ] ADR-012 CI/CD existe.
[ ] GitHub Actions definido.
[ ] TypeScript check.
[ ] Lint check.
[ ] Format check.
[ ] Unit tests.
[ ] Integration tests.
[ ] Prisma migration check.
[ ] OpenAPI generation.
[ ] Docker build.
[ ] Backend build.
[ ] Frontend builds.
[ ] Secret scanning.
[ ] Security static checks.
```

Bloqueante si:

```text id="ir-plan-cicd-blockers"
- No existe pipeline mínimo.
- Código puede mergearse sin tests.
- OpenAPI puede romper frontends sin detección.
- Migraciones pueden romper DB sin validación.
- Secretos pueden subirse al repositorio.
```

---

## 18. Fase 11 — Revisión Docker/local development

Validar:

```text id="ir-plan-docker-checks"
[ ] docker-compose.yml definido.
[ ] api service definido.
[ ] postgres service definido.
[ ] redis service definido.
[ ] keycloak service definido.
[ ] admin-web service opcional.
[ ] resident-web service opcional.
[ ] .env.example definido.
[ ] health checks básicos.
[ ] README local definido.
[ ] seed local definido.
```

Bloqueante si:

```text id="ir-plan-docker-blockers"
- No se puede levantar entorno local.
- Keycloak local no es reproducible.
- PostgreSQL local no es reproducible.
- Variables mínimas no están documentadas.
```

---

## 19. Fase 12 — Registro de gaps

Cada gap debe registrarse con:

```text id="ir-plan-gap-fields"
gapId
title
description
affectedArea
affectedPackages
severity
status
owner
decision
requiredBefore
mitigation
createdAt
updatedAt
```

Severidad:

```text id="ir-plan-gap-severity"
critical
high
medium
low
```

Estado:

```text id="ir-plan-gap-status"
open
inReview
resolved
acceptedRisk
deferred
blocked
```

Decisión:

```text id="ir-plan-gap-decision"
resolve-before-implementation
resolve-before-MVP
resolve-before-production
defer
requires-ADR
accepted-risk
```

---

## 20. Gaps críticos iniciales a verificar

```text id="ir-plan-initial-critical-gaps"
[ ] ¿Todos los paquetes MVP tienen api-contract.md?
[ ] ¿Todos los paquetes MVP tienen security-notes.md?
[ ] ¿027-dashboard-kpis tiene todos sus documentos visibles/copiad os?
[ ] ¿030-resident-self-service-basic/api-contract.md quedó incorporado?
[ ] ¿Keycloak está reflejado en todos los documentos afectados?
[ ] ¿No existen contradicciones entre auth propia temporal y Keycloak objetivo?
[ ] ¿WordPress está limitado a portal público?
[ ] ¿No hay endpoints públicos transaccionales?
[ ] ¿SDS es obligatorio para comprobantes y documentos?
[ ] ¿Los pagos son auditables?
[ ] ¿Estados de cuenta derivan de cargos/pagos?
[ ] ¿Frontend no calcula saldos finales?
[ ] ¿No hay storageKey en modelos frontend/API?
[ ] ¿OpenAPI es fuente de clientes frontend?
```

---

## 21. Orden práctico de implementación recomendado

### 21.1. Sprint 0 — Fundación técnica

```text id="ir-plan-sprint-0"
[ ] Crear monorepo.
[ ] Configurar pnpm workspace.
[ ] Configurar TypeScript base.
[ ] Crear apps/api.
[ ] Crear apps/admin-web.
[ ] Crear apps/resident-web.
[ ] Crear packages/shared.
[ ] Crear docker-compose local.
[ ] Crear PostgreSQL local.
[ ] Crear Redis local.
[ ] Crear Keycloak local.
[ ] Configurar GitHub Actions inicial.
```

---

### 21.2. Sprint 1 — Backend platform base

```text id="ir-plan-sprint-1"
[ ] NestJS base.
[ ] ConfigModule.
[ ] Health checks.
[ ] Prisma base.
[ ] PostgreSQL connection.
[ ] ValidationPipe.
[ ] ExceptionFilter.
[ ] Logger sanitizado.
[ ] OpenAPI base.
[ ] AuthGuard inicial.
[ ] TenantGuard inicial.
```

---

### 21.3. Sprint 2 — Identity, tenants and authorization

```text id="ir-plan-sprint-2"
[ ] 001-tenants.
[ ] 002-users-roles.
[ ] Keycloak integration.
[ ] UserProfile mapping.
[ ] Memberships.
[ ] Roles.
[ ] Permissions.
[ ] PermissionGuard.
[ ] Tenant resolution.
[ ] Audit base.
```

---

### 21.4. Sprint 3 — Residents/properties and financial base

```text id="ir-plan-sprint-3"
[ ] 003-residents-properties.
[ ] 004-dues-fees.
[ ] 005-payments.
[ ] 006-account-statements.
[ ] 016-secure-document-storage.
[ ] 007-audit integration.
```

---

### 21.5. Sprint 4 — Admin Web MVP

```text id="ir-plan-sprint-4"
[ ] 029-admin-web-app-basic foundation.
[ ] Keycloak login.
[ ] Tenant selector.
[ ] Permission navigation.
[ ] Dashboard básico.
[ ] Residents/properties UI.
[ ] Dues/payments/account statements UI.
```

---

### 21.6. Sprint 5 — Resident Web MVP

```text id="ir-plan-sprint-5"
[ ] 030-resident-self-service-basic foundation.
[ ] Keycloak login.
[ ] Tenant selector.
[ ] Unit selector.
[ ] Dashboard residente.
[ ] Estado de cuenta propio.
[ ] Pagos propios.
[ ] Carga de comprobantes.
```

---

### 21.7. Sprint 6 — Operación comunitaria básica

```text id="ir-plan-sprint-6"
[ ] Reservas.
[ ] Multas.
[ ] Comunicados.
[ ] Mantenimiento.
[ ] Visitantes.
```

---

### 21.8. Sprint 7 — Gobernanza y reportes

```text id="ir-plan-sprint-7"
[ ] Reuniones.
[ ] Asistencia.
[ ] Votaciones.
[ ] Actas.
[ ] Reportes básicos.
[ ] Dashboard KPIs.
```

---

## 22. Estructura de repositorio objetivo

```text id="ir-plan-repository"
resident-core/
├── apps/
│   ├── api/
│   ├── admin-web/
│   └── resident-web/
├── packages/
│   ├── shared/
│   ├── config/
│   ├── auth/
│   ├── openapi-client/
│   └── testing/
├── docs/
│   ├── sdd/
│   ├── decisions/
│   ├── specs/
│   ├── changes/
│   └── consolidated/
├── infra/
│   ├── docker/
│   ├── keycloak/
│   ├── postgres/
│   └── local/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
├── tools/
│   ├── openapi/
│   ├── scripts/
│   └── ci/
├── .github/
│   └── workflows/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

## 23. Tooling mínimo

```text id="ir-plan-tooling"
Node.js LTS
pnpm
TypeScript
NestJS
Next.js
PostgreSQL
Prisma
Redis
BullMQ
Docker
Docker Compose
Keycloak
OpenAPI
Jest
Vitest
React Testing Library
Playwright
ESLint
Prettier
GitHub Actions
```

---

## 24. Definition of Ready por área

### 24.1. Backend Ready

```text id="ir-plan-backend-dor"
[ ] apps/api creado.
[ ] NestJS configurado.
[ ] TypeScript strict activo.
[ ] Config centralizada.
[ ] Prisma conectado.
[ ] PostgreSQL local disponible.
[ ] ValidationPipe activo.
[ ] ExceptionFilter estándar.
[ ] Logger sanitizado.
[ ] OpenAPI activo.
[ ] Health endpoint activo.
```

---

### 24.2. Security Ready

```text id="ir-plan-security-dor"
[ ] Keycloak local disponible.
[ ] Bearer validation definida.
[ ] UserProfile mapping definido.
[ ] TenantGuard definido.
[ ] PermissionGuard definido.
[ ] No sesión WordPress.
[ ] No public admin routes.
[ ] No public resident transactional routes.
[ ] No storageKey exposure.
```

---

### 24.3. Database Ready

```text id="ir-plan-database-dor"
[ ] schema.prisma inicial.
[ ] Tenant base definido.
[ ] UserProfile base definido.
[ ] tenant_id convention definida.
[ ] Decimal definido para dinero.
[ ] UUID definido.
[ ] Migration workflow definido.
[ ] Seed workflow definido.
```

---

### 24.4. OpenAPI Ready

```text id="ir-plan-openapi-dor"
[ ] OpenAPI generado desde backend.
[ ] Security scheme Bearer definido.
[ ] Response envelope definido.
[ ] Error envelope definido.
[ ] Extensions mínimas definidas.
[ ] Cliente admin generable.
[ ] Cliente resident generable.
```

---

### 24.5. Frontend Ready

```text id="ir-plan-frontend-dor"
[ ] apps/admin-web creado.
[ ] apps/resident-web creado.
[ ] Next.js configurado.
[ ] TypeScript strict activo.
[ ] OpenAPI client disponible.
[ ] Keycloak/OIDC definido.
[ ] TanStack Query definido.
[ ] Route guards definidos.
```

---

### 24.6. CI Ready

```text id="ir-plan-ci-dor"
[ ] GitHub Actions creado.
[ ] Lint check.
[ ] Format check.
[ ] TypeScript check.
[ ] Unit tests.
[ ] Build API.
[ ] Build admin-web.
[ ] Build resident-web.
[ ] Docker build.
[ ] Secret scan básico.
```

---

## 25. Criterios Go / Conditional Go / No-Go

### 25.1. GO

```text id="ir-plan-go"
Estado GO si:
[ ] No hay gaps críticos abiertos.
[ ] MVP core tiene documentación completa.
[ ] Arquitectura está consistente.
[ ] Multitenancy está definido.
[ ] Keycloak está definido.
[ ] OpenAPI está definido.
[ ] Security boundaries están definidos.
[ ] CI mínimo está definido.
[ ] Orden de implementación está aprobado.
```

---

### 25.2. CONDITIONAL_GO

```text id="ir-plan-conditional-go"
Estado CONDITIONAL_GO si:
[ ] No hay gaps críticos en Sprint 0-2.
[ ] Existen gaps no bloqueantes en módulos diferidos.
[ ] Existen gaps de UI secundaria no crítica.
[ ] Existen integraciones avanzadas diferidas.
[ ] Se puede iniciar fundación técnica sin comprometer arquitectura.
```

---

### 25.3. NO_GO

```text id="ir-plan-no-go"
Estado NO_GO si:
[ ] Hay gaps críticos de multitenancy.
[ ] Hay gaps críticos de autenticación/autorización.
[ ] Hay gaps críticos de base de datos.
[ ] Hay gaps críticos de seguridad.
[ ] Hay contradicciones en ADRs.
[ ] No existe OpenAPI strategy.
[ ] No existe CI mínimo.
[ ] WordPress aparece como backend transaccional.
[ ] storageKey se expone.
[ ] Pagos carecen de auditoría.
```

---

## 26. Riesgos y mitigaciones

| Riesgo                                 |   Nivel | Mitigación                               |
| -------------------------------------- | ------: | ---------------------------------------- |
| Iniciar código sin contratos completos |    Alto | Go gate y OpenAPI required               |
| Contradicciones entre specs            |    Alto | matriz de consistencia                   |
| Multitenancy mal implementado          | Crítico | TenantGuard, tests, tenant_id convention |
| Keycloak integrado tarde               |    Alto | Sprint 2 obligatorio                     |
| Frontend consume rutas improvisadas    |    Alto | OpenAPI client y CI gate                 |
| WordPress usado como backend           | Crítico | security gate                            |
| storageKey expuesto                    | Crítico | SDS contract tests                       |
| Pagos sin auditoría                    | Crítico | audit required desde Sprint 3            |
| CI insuficiente                        |    Alto | Sprint 0 CI mínimo                       |
| Demasiados módulos al mismo tiempo     |   Medio | implementación por fases                 |

---

## 27. Métricas de preparación

```text id="ir-plan-readiness-metrics"
- % documentos base completos.
- % ADRs completos.
- % paquetes MVP con documentación completa.
- número de gaps críticos abiertos.
- número de gaps altos abiertos.
- número de gaps diferidos.
- cobertura documental por módulo.
- cobertura de security-notes por módulo.
- cobertura de api-contract por módulo.
- cobertura de test-plan por módulo.
- estado de OpenAPI readiness.
- estado de CI readiness.
```

Umbral recomendado para GO:

```text id="ir-plan-go-threshold"
- 100% documentos base completos.
- 100% ADRs críticos completos.
- 100% paquetes MVP core completos.
- 0 gaps críticos abiertos.
- 0 gaps altos sin decisión.
- CI mínimo definido.
- OpenAPI strategy definida.
```

---

## 28. Entregables de cierre

```text id="ir-plan-deliverables"
[ ] Matriz de documentos revisada.
[ ] Matriz de paquetes priorizada.
[ ] Registro de gaps creado.
[ ] Gaps críticos resueltos o bloqueados.
[ ] Gaps no bloqueantes clasificados.
[ ] Decisión GO/CONDITIONAL_GO/NO_GO emitida.
[ ] Orden de implementación aprobado.
[ ] Repositorio objetivo aprobado.
[ ] Sprint 0 definido.
[ ] Definition of Ready global aprobada.
```

---

## 29. No aceptación

No se acepta este plan si:

```text id="ir-plan-no-acceptance"
- permite iniciar implementación sin revisar documentos base;
- permite iniciar implementación sin revisar ADRs;
- permite iniciar implementación sin revisar paquetes MVP;
- permite ignorar gaps críticos;
- permite implementar sin multitenancy definido;
- permite implementar sin Keycloak definido;
- permite implementar sin OpenAPI strategy;
- permite implementar sin CI mínimo;
- permite usar WordPress como backend transaccional;
- permite rutas públicas administrativas;
- permite rutas públicas resident-facing transaccionales;
- permite storageKey en APIs o UI;
- permite pagos sin auditoría;
- permite frontends con contratos improvisados;
- permite base de datos sin tenant_id strategy.
```

---

## 30. Definition of Done del plan

```text id="ir-plan-dod"
[ ] plan.md creado.
[ ] Flujo de readiness definido.
[ ] Fases de revisión definidas.
[ ] Inventario documental definido.
[ ] Clasificación por prioridad definida.
[ ] Matriz de gaps definida.
[ ] Criterios Go/Conditional Go/No-Go definidos.
[ ] Orden práctico de implementación definido.
[ ] Sprint 0 definido.
[ ] Sprint 1 definido.
[ ] Sprint 2 definido.
[ ] Repositorio objetivo definido.
[ ] Tooling mínimo definido.
[ ] Definition of Ready por área definida.
[ ] Riesgos y mitigaciones definidos.
[ ] Métricas de preparación definidas.
[ ] No aceptación definida.
```

---

## 31. Expediente actualizado

```text id="ir-plan-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 031-implementation-readiness/
│   │       ├── spec.md
│   │       └── plan.md
```
