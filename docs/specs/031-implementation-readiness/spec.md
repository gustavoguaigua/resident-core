# Spec — 031 Implementation Readiness

## 1. Información del documento

| Campo          | Valor                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                                       |
| Spec ID        | 031                                                                                                                 |
| Módulo         | Implementation Readiness                                                                                            |
| Documento      | Functional / Technical Readiness Specification                                                                      |
| Ruta           | `docs/specs/031-implementation-readiness/spec.md`                                                                   |
| Versión        | 0.1                                                                                                                 |
| Estado         | Borrador inicial                                                                                                    |
| Fecha          | 2026-08-04                                                                                                          |
| Fase           | FASE 2 — Preparación de implementación                                                                              |
| Naturaleza     | Readiness gate / Pre-implementation validation / SDD closure checkpoint                                             |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / BullMQ / Docker / Keycloak / OpenAPI / Next.js / GitHub Actions |

---

## 2. Propósito

El paquete `031-implementation-readiness` define los criterios, verificaciones y condiciones mínimas para determinar si RESIDENT Core está listo para iniciar implementación técnica de forma ordenada, trazable y alineada con la documentación SDD creada hasta el paquete `030-resident-self-service-basic`.

Este paquete no define una funcionalidad transaccional nueva. Define una compuerta de preparación antes de pasar de especificación a construcción.

Regla central:

```text id="ir-rule"
Implementation Readiness debe verificar que RESIDENT Core cuente con documentación SDD suficiente, decisiones arquitectónicas consistentes, contratos API definidos, estrategia multitenant clara, seguridad documentada, módulos priorizados, stack técnico acordado, estructura de repositorio definida, criterios de pruebas establecidos, riesgos identificados y condiciones mínimas de implementación listas antes de escribir código productivo, evitando iniciar desarrollo con ambigüedades críticas, contratos inexistentes, dependencias no decididas, autorización incompleta, gaps de seguridad o inconsistencias entre specs.
```

---

## 3. Contexto

Hasta este punto, RESIDENT cuenta con:

```text id="ir-context"
FASE 1 — Portal multitenant WordPress finalizado.
FASE 2 — RESIDENT Core especificado mediante SDD.
Paquetes funcionales 001 a 030 documentados.
ADRs principales definidos.
Keycloak identificado como estrategia objetivo de identidad.
Arquitectura objetivo basada en monolito modular contenerizado preparado para microservicios.
Frontend administrativo definido.
Frontend residente definido.
Integración WordPress definida como capa pública informativa.
```

La implementación debe iniciar solo después de validar que la documentación es suficiente para guiar desarrollo sin improvisación estructural.

---

## 4. Problema que resuelve

Sin una compuerta de preparación, el proyecto puede iniciar código con riesgos como:

```text id="ir-problems"
- implementar módulos sin contratos API consolidados;
- iniciar base de datos sin estrategia multitenant clara;
- mezclar lógica de WordPress con Core transaccional;
- duplicar responsabilidades entre módulos;
- codificar autenticación antes de cerrar integración Keycloak;
- crear endpoints administrativos inseguros;
- iniciar frontend sin OpenAPI estable;
- crear tablas sin correspondencia con specs;
- omitir auditoría financiera;
- generar código difícil de separar en microservicios futuros;
- implementar pagos, documentos o visitantes sin controles de seguridad;
- abrir rutas públicas transaccionales por error;
- avanzar sin CI/CD, pruebas mínimas o estándares de repositorio.
```

---

## 5. Objetivos

```text id="ir-objectives"
1. Validar que los documentos SDD base estén completos y vigentes.
2. Validar que los ADRs sean consistentes con los paquetes 001-030.
3. Validar que los paquetes funcionales prioritarios tengan spec, plan, data-model, api-contract, test-plan, tasks y security-notes.
4. Identificar gaps documentales antes de codificar.
5. Definir el orden recomendado de implementación.
6. Definir la estructura mínima del repositorio.
7. Definir las condiciones mínimas para backend.
8. Definir las condiciones mínimas para frontend administrativo.
9. Definir las condiciones mínimas para frontend residente.
10. Definir las condiciones mínimas de Keycloak.
11. Definir las condiciones mínimas de PostgreSQL/Prisma.
12. Definir las condiciones mínimas de Docker.
13. Definir las condiciones mínimas de OpenAPI.
14. Definir las condiciones mínimas de testing.
15. Definir las condiciones mínimas de CI/CD.
16. Establecer criterios de aceptación para iniciar implementación.
```

---

## 6. Alcance

### 6.1. Incluido

```text id="ir-scope-in"
- Revisión documental SDD.
- Revisión de ADRs.
- Revisión de specs 001-030.
- Validación de consistencia arquitectónica.
- Validación de límites WordPress/Core.
- Validación de estrategia multitenant.
- Validación de estrategia Keycloak.
- Validación de estrategia API.
- Validación de estrategia de datos.
- Validación de estrategia de auditoría.
- Validación de seguridad mínima.
- Validación de pruebas mínimas.
- Validación de estructura de repositorio.
- Validación de tooling.
- Validación de ambientes.
- Definición de orden de implementación.
- Identificación de gaps.
- Definition of Ready global.
```

---

### 6.2. Fuera de alcance

```text id="ir-scope-out"
- Implementar código productivo.
- Crear tablas definitivas.
- Crear migraciones reales.
- Configurar AWS productivo.
- Configurar Keycloak productivo.
- Implementar frontend real.
- Implementar microservicios físicos.
- Implementar pasarelas de pago reales.
- Implementar open banking real.
- Implementar hardware de accesos.
- Implementar biometría.
- Implementar IA con datos reales.
```

---

## 7. Decisión funcional

```text id="ir-decision"
Implementation Readiness será una compuerta formal SDD previa al desarrollo, usada para validar si RESIDENT Core puede iniciar implementación con suficiente claridad técnica, documental, arquitectónica, contractual, de seguridad y de pruebas.
```

---

## 8. Paquetes sujetos a revisión

### 8.1. Documentos SDD base

```text id="ir-base-docs"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
```

---

### 8.2. ADRs

```text id="ir-adrs"
docs/decisions/ADR-001-architecture-style.md
docs/decisions/ADR-002-backend-framework.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-005-authentication-strategy.md
docs/decisions/ADR-006-identity-provider-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-008-api-gateway-strategy.md
docs/decisions/ADR-009-deployment-strategy.md
docs/decisions/ADR-010-observability-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/decisions/ADR-012-ci-cd-strategy.md
```

---

### 8.3. Paquetes funcionales

```text id="ir-spec-packages"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-basic-reports
009-wordpress-integration-basic
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
016-secure-document-storage
017-bank-reconciliation
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
022-maintenance-work-orders
023-inventory-basic
024-access-control-visitors
025-tenant-settings-policies
026-automation-workflows-basic
027-dashboard-kpis
028-data-import-migration
029-admin-web-app-basic
030-resident-self-service-basic
```

---

## 9. Criterios documentales mínimos

Cada paquete funcional prioritario debe tener:

```text id="ir-package-docs-required"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

Excepción permitida:

```text id="ir-doc-exception"
Los paquetes que se definan explícitamente como exploratorios o diferidos pueden tener documentación parcial, siempre que se registre su estado como deferred y no se implementen en el MVP inicial.
```

---

## 10. Clasificación de paquetes por prioridad de implementación

### 10.1. Núcleo obligatorio MVP

```text id="ir-core-mvp"
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

---

### 10.2. Operación comunitaria MVP extendido

```text id="ir-community-mvp"
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

### 10.3. Gestión financiera avanzada

```text id="ir-financial-advanced"
017-bank-reconciliation
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
```

---

### 10.4. Operación y analítica

```text id="ir-operations-analytics"
008-basic-reports
023-inventory-basic
026-automation-workflows-basic
027-dashboard-kpis
028-data-import-migration
```

---

### 10.5. Integración portal

```text id="ir-portal-integration"
009-wordpress-integration-basic
```

---

## 11. Orden recomendado de implementación

### 11.1. Fase técnica 0 — Repositorio y base técnica

```text id="ir-implementation-phase-0"
1. Crear monorepo.
2. Configurar TypeScript.
3. Configurar NestJS backend.
4. Configurar PostgreSQL local.
5. Configurar Prisma.
6. Configurar Docker Compose.
7. Configurar Redis.
8. Configurar Keycloak local.
9. Configurar OpenAPI.
10. Configurar CI inicial.
11. Configurar linting, formatting y testing.
```

---

### 11.2. Fase técnica 1 — Plataforma y seguridad

```text id="ir-implementation-phase-1"
1. 001-tenants.
2. 002-users-roles.
3. Keycloak integration.
4. TenantGuard.
5. PermissionGuard.
6. Audit base.
7. Secure error handling.
8. API guidelines enforcement.
```

---

### 11.3. Fase técnica 2 — Datos residenciales y finanzas base

```text id="ir-implementation-phase-2"
1. 003-residents-properties.
2. 004-dues-fees.
3. 005-payments.
4. 006-account-statements.
5. 016-secure-document-storage.
6. 007-audit.
```

---

### 11.4. Fase técnica 3 — Aplicaciones web

```text id="ir-implementation-phase-3"
1. 029-admin-web-app-basic.
2. 030-resident-self-service-basic.
3. OpenAPI client generation.
4. Auth/session frontend.
5. Tenant/property selectors.
6. Core financial views.
```

---

### 11.5. Fase técnica 4 — Operación comunitaria

```text id="ir-implementation-phase-4"
1. 010-reservations-common-areas.
2. 011-fines-sanctions.
3. 012-communications-notifications.
4. 013-meetings-attendance.
5. 014-voting-basic.
6. 015-certified-minutes.
7. 022-maintenance-work-orders.
8. 024-access-control-visitors.
```

---

### 11.6. Fase técnica 5 — Reportes, dashboards e importación

```text id="ir-implementation-phase-5"
1. 008-basic-reports.
2. 027-dashboard-kpis.
3. 028-data-import-migration.
4. 026-automation-workflows-basic.
5. 023-inventory-basic.
```

---

### 11.7. Fase técnica 6 — Finanzas avanzadas

```text id="ir-implementation-phase-6"
1. 017-bank-reconciliation.
2. 018-payment-provider-integration.
3. 019-open-banking-integration.
4. 020-accounting-ledger.
5. 021-supplier-payments.
```

---

## 12. Estructura mínima de repositorio

```text id="ir-repository-structure"
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

## 13. Condiciones mínimas de backend

```text id="ir-backend-readiness"
- NestJS inicializado.
- TypeScript strict activo.
- Arquitectura modular definida.
- ConfigModule centralizado.
- Validación global de DTOs.
- Pipes de validación activos.
- Exception filter estándar.
- Logger sanitizado.
- Health checks básicos.
- OpenAPI habilitado.
- AuthGuard definido.
- TenantGuard definido.
- PermissionGuard definido.
- Audit interceptor definido.
- Prisma configurado.
- PostgreSQL conectado.
- Redis conectado si se usan colas.
- BullMQ configurado para procesos async.
```

---

## 14. Condiciones mínimas de base de datos

```text id="ir-database-readiness"
- PostgreSQL definido como base principal.
- Prisma definido como ORM.
- Estrategia shared schema + tenant_id confirmada.
- UUID como identificador base.
- Decimal para dinero.
- Timestamps estándar.
- Soft delete o archived state donde aplique.
- Índices tenant-scoped definidos.
- Migraciones versionadas.
- Seeds iniciales definidos.
- Prohibición de cross-tenant queries sin filtro.
- Prohibición de hard delete en entidades críticas.
```

---

## 15. Condiciones mínimas de Keycloak

```text id="ir-keycloak-readiness"
- Realm definido.
- Client backend definido.
- Client admin-web definido.
- Client resident-web definido.
- Authorization Code Flow with PKCE habilitado.
- Implicit flow deshabilitado.
- Roles técnicos mínimos definidos si aplica.
- Claims mínimos definidos.
- Mapping keycloakSubjectId -> UserProfile definido.
- Logout probado.
- Token validation definida.
- No dependencia de sesión WordPress.
```

---

## 16. Condiciones mínimas de OpenAPI

```text id="ir-openapi-readiness"
- OpenAPI generado desde backend.
- Naming consistente con api-guidelines.
- Versionado /api/v1.
- Response envelope estándar.
- Error envelope estándar.
- Security scheme Bearer definido.
- x-auth-required en endpoints protegidos.
- x-tenant-scope en endpoints tenant.
- x-public-exposure definido.
- x-storage-key-exposed=false donde aplique.
- Cliente frontend generado desde OpenAPI.
- CI falla si OpenAPI no genera cliente.
```

---

## 17. Condiciones mínimas de frontend administrativo

```text id="ir-admin-web-readiness"
- apps/admin-web definido.
- Next.js configurado.
- Keycloak OIDC configurado.
- Tenant selector definido.
- PermissionProvider definido.
- OpenAPI client definido.
- TanStack Query configurado.
- Route guards definidos.
- No sesión WordPress.
- No rutas públicas administrativas.
- No storageKey.
- No Prisma frontend.
- No direct DB access.
```

---

## 18. Condiciones mínimas de frontend residente

```text id="ir-resident-web-readiness"
- apps/resident-web definido.
- Next.js configurado.
- Keycloak OIDC configurado.
- Tenant selector definido.
- Property unit selector definido.
- ResidentPermissionProvider definido.
- PropertyScopeGuard definido.
- OpenAPI client definido.
- TanStack Query configurado.
- No sesión WordPress.
- No rutas públicas transaccionales.
- No storageKey.
- No admin payment actions.
- No hardware control.
```

---

## 19. Condiciones mínimas de seguridad

```text id="ir-security-readiness"
- security.md actualizado.
- Keycloak como objetivo documentado.
- Tenant isolation documentado.
- Property-level authorization documentado.
- RBAC + permissions documentado.
- Resource-level authorization documentado.
- Audit obligatorio en operaciones críticas.
- No storageKey exposure.
- No secrets en logs.
- No datos reales a IA externa.
- No WordPress como backend transaccional.
- No public admin routes.
- No public resident transactional routes.
- Rate limiting básico definido.
- Error handling seguro definido.
- CORS restrictivo definido.
```

---

## 20. Condiciones mínimas de testing

```text id="ir-testing-readiness"
- Jest/Vitest definidos según capa.
- Tests unitarios requeridos.
- Tests de integración backend requeridos.
- Tests API requeridos.
- Tests E2E críticos requeridos.
- Tests multitenant requeridos.
- Tests de permisos requeridos.
- Tests financieros requeridos.
- Tests de auditoría requeridos.
- Tests OpenAPI requeridos.
- Tests frontend requeridos.
- CI ejecuta test suite mínima.
```

---

## 21. Condiciones mínimas de CI/CD

```text id="ir-cicd-readiness"
- GitHub Actions definido.
- Lint check.
- Format check.
- TypeScript check.
- Unit tests.
- Integration tests iniciales.
- OpenAPI generation.
- Prisma migration check.
- Security static checks.
- Build backend.
- Build admin-web.
- Build resident-web.
- Docker build.
- No secrets in repo scan.
```

---

## 22. Condiciones mínimas de Docker/local development

```text id="ir-docker-readiness"
- docker-compose.yml definido.
- Servicio api.
- Servicio postgres.
- Servicio redis.
- Servicio keycloak.
- Servicio admin-web opcional.
- Servicio resident-web opcional.
- Variables .env.example.
- Volúmenes locales controlados.
- Health checks básicos.
- README de arranque local.
```

---

## 23. Gaps críticos a bloquear

No se debe iniciar implementación productiva si existe cualquiera de estos gaps:

```text id="ir-critical-gaps"
- ADR de arquitectura inexistente o contradictorio.
- Estrategia multitenant no definida.
- Estrategia Keycloak no definida.
- Autorización tenant-aware no definida.
- api-guidelines ausente.
- data-governance ausente.
- Security notes ausentes en módulos críticos.
- Pagos sin auditoría.
- Estados de cuenta sin modelo derivado.
- Documentos sin SDS.
- Frontend sin OpenAPI.
- WordPress usado como backend transaccional.
- Rutas públicas administrativas.
- Rutas públicas resident-facing transaccionales.
- storageKey expuesto.
- Falta de tests multitenant.
- Falta de CI mínimo.
```

---

## 24. Gaps no bloqueantes pero obligatorios de registrar

```text id="ir-non-blocking-gaps"
- Pantallas frontend de baja prioridad no diseñadas a detalle.
- Reportes avanzados pendientes.
- Integraciones externas reales pendientes.
- Pasarela de pago real pendiente.
- Open banking real pendiente.
- Hardware de accesos pendiente.
- Observabilidad avanzada pendiente.
- Infraestructura AWS productiva pendiente.
- Microservicios físicos diferidos.
```

Regla:

```text id="ir-gap-rule"
Todo gap no bloqueante debe registrarse explícitamente con owner, impacto, prioridad y decisión: defer, resolve-before-MVP, resolve-before-production o requires-ADR.
```

---

## 25. Definition of Ready global

RESIDENT Core está listo para implementación inicial cuando:

```text id="ir-global-dor"
[ ] Documentos SDD base existen y están alineados.
[ ] ADRs 001-012 existen y no se contradicen.
[ ] Paquetes 001-030 están clasificados por prioridad.
[ ] Paquetes MVP críticos tienen spec completo.
[ ] Paquetes MVP críticos tienen api-contract.
[ ] Paquetes MVP críticos tienen data-model.
[ ] Paquetes MVP críticos tienen security-notes.
[ ] Arquitectura monolito modular está confirmada.
[ ] Estrategia multitenant está confirmada.
[ ] Estrategia Keycloak está confirmada.
[ ] Estrategia PostgreSQL/Prisma está confirmada.
[ ] Estrategia OpenAPI está confirmada.
[ ] Estrategia CI/CD está confirmada.
[ ] Orden de implementación está definido.
[ ] Estructura de repositorio está definida.
[ ] Gaps críticos están resueltos.
[ ] Gaps no bloqueantes están registrados.
```

---

## 26. Criterios de aceptación

```text id="ir-acceptance"
[ ] Se identifica el estado documental de docs/sdd.
[ ] Se identifica el estado documental de ADRs.
[ ] Se identifica el estado documental de specs 001-030.
[ ] Se clasifican paquetes por prioridad.
[ ] Se define orden recomendado de implementación.
[ ] Se define estructura mínima de repositorio.
[ ] Se definen condiciones mínimas de backend.
[ ] Se definen condiciones mínimas de base de datos.
[ ] Se definen condiciones mínimas de Keycloak.
[ ] Se definen condiciones mínimas de OpenAPI.
[ ] Se definen condiciones mínimas de admin-web.
[ ] Se definen condiciones mínimas de resident-web.
[ ] Se definen condiciones mínimas de seguridad.
[ ] Se definen condiciones mínimas de testing.
[ ] Se definen condiciones mínimas de CI/CD.
[ ] Se definen gaps críticos bloqueantes.
[ ] Se definen gaps no bloqueantes.
[ ] Se define Definition of Ready global.
```

---

## 27. No aceptación

No se acepta este paquete si:

```text id="ir-no-acceptance"
- permite iniciar implementación sin estrategia multitenant.
- permite iniciar implementación sin estrategia de autenticación.
- permite iniciar implementación sin autorización tenant-aware.
- permite iniciar implementación sin api-guidelines.
- permite iniciar implementación sin data-governance.
- permite iniciar implementación sin security-notes en módulos críticos.
- permite iniciar implementación sin OpenAPI.
- permite iniciar frontend sin contratos API.
- permite iniciar pagos sin auditoría.
- permite usar WordPress como backend transaccional.
- permite rutas públicas administrativas.
- permite rutas públicas resident-facing transaccionales.
- permite storageKey en respuestas.
- permite código sin CI mínimo.
- permite implementar módulos sin clasificación de prioridad.
- permite ignorar gaps críticos.
```

---

## 28. Resultado esperado

Al finalizar `031-implementation-readiness`, el proyecto debe contar con una compuerta formal que permita responder objetivamente:

```text id="ir-key-question"
¿Está RESIDENT Core suficientemente especificado para iniciar implementación técnica sin improvisación arquitectónica crítica?
```

Resultado esperado:

```text id="ir-expected-result"
implementation readiness definido
readiness gate definido
SDD base sujeto a revisión
ADRs sujetos a revisión
specs 001-030 sujetos a revisión
prioridad de implementación definida
orden de implementación definido
estructura de repositorio definida
backend readiness definido
database readiness definido
Keycloak readiness definido
OpenAPI readiness definido
admin-web readiness definido
resident-web readiness definido
security readiness definido
testing readiness definido
CI/CD readiness definido
Docker/local readiness definido
gaps críticos definidos
gaps no bloqueantes definidos
Definition of Ready global definida
no WordPress transactional backend
no public admin routes
no public resident transactional routes
no storageKey exposure
no implementation before readiness
```

---

## 29. Expediente actualizado

```text id="ir-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 030-resident-self-service-basic/
│   │   └── 031-implementation-readiness/
│   │       └── spec.md
```
