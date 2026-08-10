# Test Plan — 031 Implementation Readiness

## 1. Información del documento

| Campo          | Valor                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                                       |
| Spec ID        | 031                                                                                                                 |
| Módulo         | Implementation Readiness                                                                                            |
| Documento      | Test Plan                                                                                                           |
| Ruta           | `docs/specs/031-implementation-readiness/test-plan.md`                                                              |
| Versión        | 0.1                                                                                                                 |
| Estado         | complete                                                                                                            |
| Fecha          | 2026-08-05                                                                                                          |
| Naturaleza     | Readiness validation / SDD closure checkpoint / Pre-implementation gate                                             |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / BullMQ / Docker / Keycloak / OpenAPI / Next.js / GitHub Actions |

---

## 2. Propósito

Definir las pruebas, verificaciones y validaciones necesarias para confirmar si RESIDENT Core está listo para iniciar implementación técnica.

Este plan no prueba una funcionalidad transaccional de negocio. Prueba la preparación documental, arquitectónica, contractual, de seguridad, testing, CI/CD y entorno local antes de iniciar código productivo.

Regla central de pruebas:

```text id="ir-test-rule"
Implementation Readiness solo puede aceptarse si las pruebas demuestran que RESIDENT Core tiene documentación SDD suficiente, ADRs consistentes, paquetes MVP completos, estrategia multitenant definida, Keycloak definido, OpenAPI definido, seguridad mínima documentada, testing mínimo planificado, CI/CD inicial definido, Docker/local development preparado, gaps críticos identificados y decisión Go/Conditional Go/No-Go trazable antes de iniciar implementación productiva.
```

---

## 3. Alcance de pruebas

Incluido:

```text id="ir-test-scope-in"
- Validación de documentos SDD base.
- Validación de ADRs.
- Validación de paquetes 001-030.
- Validación de completitud documental por paquete.
- Validación de consistencia arquitectónica.
- Validación de multitenancy.
- Validación de autorización.
- Validación de Keycloak.
- Validación de OpenAPI.
- Validación de seguridad.
- Validación de estrategia de datos.
- Validación de testing.
- Validación de CI/CD.
- Validación de Docker/local development.
- Validación de registro de gaps.
- Validación de decisión Go/Conditional Go/No-Go.
```

Fuera de alcance:

```text id="ir-test-scope-out"
- Tests funcionales completos de módulos de negocio.
- Tests productivos de pagos reales.
- Tests de open banking real.
- Tests de AWS productivo.
- Tests de hardware físico.
- Tests de biometría.
- Tests de reconocimiento facial.
- Tests de IA con datos reales.
- Tests de rendimiento productivo final.
```

---

## 4. Tipos de pruebas

```text id="ir-test-types"
1. Documentation completeness tests.
2. ADR consistency tests.
3. Package readiness tests.
4. Architecture consistency tests.
5. Multitenancy readiness tests.
6. Authorization readiness tests.
7. Security readiness tests.
8. OpenAPI readiness tests.
9. Data strategy readiness tests.
10. Testing strategy readiness tests.
11. CI/CD readiness tests.
12. Docker/local environment readiness tests.
13. Gap register tests.
14. Go/No-Go decision tests.
```

---

## 5. Datos de prueba

### 5.1. Paquetes bajo revisión

```text id="ir-test-packages"
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
031-implementation-readiness
```

---

### 5.2. Documentos requeridos por paquete

```text id="ir-test-required-docs"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

---

### 5.3. Estados documentales

```text id="ir-test-doc-status"
complete
partial
missing
deferred
blocked
needsReview
```

---

### 5.4. Gaps de prueba

```text id="ir-test-gap-examples"
GAP-IR-001 — Missing api-contract.md in MVP package.
GAP-IR-002 — Security notes missing in payment package.
GAP-IR-003 — OpenAPI strategy not defined.
GAP-IR-004 — WordPress incorrectly used as transactional backend.
GAP-IR-005 — storageKey exposed in API response.
GAP-IR-006 — Multitenancy strategy missing.
GAP-IR-007 — CI minimum pipeline missing.
```

---

## 6. Documentation completeness tests

### 6.1. SDD base documents

```text id="ir-test-sdd-base"
[ ] docs/sdd/constitution.md existe.
[ ] docs/sdd/domain-map.md existe.
[ ] docs/sdd/architecture.md existe.
[ ] docs/sdd/security.md existe.
[ ] docs/sdd/api-guidelines.md existe.
[ ] docs/sdd/data-governance.md existe.
[ ] constitution.md contiene principios de SDD.
[ ] architecture.md confirma monolito modular inicial.
[ ] security.md confirma Keycloak como objetivo.
[ ] api-guidelines.md confirma /api/v1.
[ ] data-governance.md confirma no IA externa con datos reales.
[ ] domain-map.md mantiene bounded contexts actualizados.
```

Acceptance:

```text id="ir-test-sdd-base-ac"
[ ] 100% documentos base existen.
[ ] 100% documentos base están alineados con Keycloak.
[ ] 100% documentos base separan WordPress público de Core transaccional.
```

---

### 6.2. ADRs

```text id="ir-test-adrs"
[ ] ADR-001 existe.
[ ] ADR-002 existe.
[ ] ADR-003 existe.
[ ] ADR-004 existe.
[ ] ADR-005 existe.
[ ] ADR-006 existe.
[ ] ADR-007 existe.
[ ] ADR-008 existe.
[ ] ADR-009 existe.
[ ] ADR-010 existe.
[ ] ADR-011 existe.
[ ] ADR-012 existe.
[ ] Cada ADR tiene contexto.
[ ] Cada ADR tiene decisión.
[ ] Cada ADR tiene consecuencias.
[ ] Ningún ADR contradice architecture.md.
[ ] Ningún ADR contradice security.md.
[ ] Ningún ADR contradice api-guidelines.md.
```

Acceptance:

```text id="ir-test-adrs-ac"
[ ] 100% ADRs críticos existen.
[ ] 0 contradicciones críticas entre ADRs y documentos base.
```

---

### 6.3. Paquetes MVP core

```text id="ir-test-mvp-core-docs"
[ ] 001-tenants tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 002-users-roles tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 003-residents-properties tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 004-dues-fees tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 005-payments tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 006-account-statements tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 007-audit tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 016-secure-document-storage tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 025-tenant-settings-policies tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 029-admin-web-app-basic tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
[ ] 030-resident-self-service-basic tiene spec/plan/data-model/api-contract/test-plan/tasks/security-notes.
```

Acceptance:

```text id="ir-test-mvp-core-docs-ac"
[ ] 100% paquetes MVP core están completos.
[ ] Ningún paquete MVP core queda missing o partial sin gap registrado.
```

---

## 7. Package readiness tests

```text id="ir-test-package-readiness"
[ ] Cada paquete tiene propósito claro.
[ ] Cada paquete define alcance incluido.
[ ] Cada paquete define fuera de alcance.
[ ] Cada paquete define regla central.
[ ] Cada paquete define actores si aplica.
[ ] Cada paquete define reglas de negocio.
[ ] Cada paquete define modelo de datos.
[ ] Cada paquete define contratos API.
[ ] Cada paquete define pruebas.
[ ] Cada paquete define tareas.
[ ] Cada paquete define seguridad.
[ ] Cada paquete define no aceptación.
```

Acceptance:

```text id="ir-test-package-readiness-ac"
[ ] Todos los paquetes críticos tienen completitud funcional.
[ ] Todos los paquetes críticos tienen security-notes.
[ ] Todos los paquetes críticos tienen api-contract.
```

### 7.1. Sprint 0 implementation-package tests

```text id="ir-test-sprint0-packages"
[ ] packages/shared existe y compila.
[ ] packages/config existe y compila.
[ ] packages/auth existe y compila sin auth runtime, guards, tokens o Keycloak integration.
[ ] packages/openapi-client ejecuta una validación real sin generar aún cliente de dominio.
[ ] packages/testing ejecuta smoke tests y security:secrets con scanner versionado.
[ ] Los cinco packages tienen manifest, TypeScript strict, entrada y exports explícitos.
[ ] Ningún package está vacío ni usa scripts placeholder.
```

Acceptance:

```text id="ir-test-sprint0-packages-ac"
[ ] El backlog de packages coincide con Sprint 0 y spec 031 §12.1.
[ ] No se anticipa comportamiento runtime de Sprint 1 ni lógica funcional posterior.
```

### 7.2. Readiness runtime deferral tests

```text id="ir-test-readiness-runtime-deferral"
[ ] La evidencia de la compuerta se conserva en Markdown/Git.
[ ] No existe ruta ni entrada OpenAPI bajo /api/v1/platform/readiness.
[ ] No existen controllers, services, DTOs o permisos de Implementation Readiness.
[ ] No existen modelos Prisma, tablas, migraciones, seeds o repositorios de readiness.
[ ] api-contract.md y data-model.md se identifican como diseños futuros reservados.
[ ] La implementación futura requiere plan y sprint explícitamente aprobados.
```

---

## 8. Architecture consistency tests

```text id="ir-test-architecture"
[ ] Monolito modular inicial está confirmado.
[ ] Microservicios físicos están diferidos.
[ ] API-first está confirmado.
[ ] PostgreSQL está confirmado.
[ ] Prisma está confirmado.
[ ] Redis/BullMQ está confirmado para procesos async.
[ ] Docker está confirmado.
[ ] Keycloak está confirmado como IdP objetivo.
[ ] WordPress está limitado a portal público informativo.
[ ] Admin Web App está separada de WordPress.
[ ] Resident Web App está separada de WordPress.
[ ] OpenAPI es contrato entre backend y frontends.
```

Blockers:

```text id="ir-test-architecture-blockers"
[ ] Detectar WordPress como backend transaccional debe fallar.
[ ] Detectar frontend calculando reglas críticas debe fallar.
[ ] Detectar microservicios físicos obligatorios desde Sprint 0 debe fallar.
[ ] Detectar ausencia de modularidad debe fallar.
```

Acceptance:

```text id="ir-test-architecture-ac"
[ ] 0 contradicciones arquitectónicas críticas.
[ ] WordPress no aparece como fuente transaccional.
```

---

## 9. Multitenancy readiness tests

```text id="ir-test-multitenancy"
[ ] Estrategia shared schema + tenant_id está documentada.
[ ] Entidades tenant-scoped requieren tenant_id.
[ ] APIs tenant-scoped requieren TenantGuard.
[ ] DTOs no aceptan tenantId editable como autoridad final.
[ ] Cross-tenant access responde 403 o 404 según política.
[ ] Índices tenant-scoped están previstos.
[ ] Auditoría tenant-scoped está prevista.
[ ] Frontend admin limpia cache al cambiar tenant.
[ ] Frontend residente limpia cache al cambiar tenant.
```

Blockers:

```text id="ir-test-multitenancy-blockers"
[ ] Falta de tenant_id en entidad crítica debe bloquear.
[ ] DTO con tenantId editable debe bloquear.
[ ] Ausencia de TenantGuard debe bloquear.
[ ] Cache frontend sin tenant boundary debe bloquear.
```

Acceptance:

```text id="ir-test-multitenancy-ac"
[ ] Multitenancy definido para backend, API, DB, audit y frontends.
```

---

## 10. Authorization readiness tests

```text id="ir-test-authorization"
[ ] Keycloak autentica.
[ ] Core autoriza.
[ ] El cliente OIDC de `apps/resident-web` usa `client_id=resident-resident-web`.
[ ] Roles y permisos están definidos.
[ ] PermissionGuard está previsto.
[ ] SensitivePermissionGuard está previsto.
[ ] Resource-level authorization está documentada.
[ ] Property-level authorization está documentada para portal residente.
[ ] Frontend usa permisos solo para UI.
[ ] Backend autoriza cada endpoint.
```

Blockers:

```text id="ir-test-authorization-blockers"
[ ] Frontend como autoridad final debe bloquear.
[ ] Roles Keycloak como único control de negocio debe bloquear.
[ ] Ausencia de property-scope para self-service debe bloquear.
[ ] Acciones financieras sin permisos específicos debe bloquear.
```

Acceptance:

```text id="ir-test-authorization-ac"
[ ] Autorización tenant-aware y resource-aware está definida.
[ ] Self-service tiene reglas .own definidas.
```

---

## 11. Security readiness tests

```text id="ir-test-security"
[ ] security.md existe y está vigente.
[ ] security-notes existen en paquetes críticos.
[ ] No storageKey exposure.
[ ] No signedUrl persistente.
[ ] No secrets en logs.
[ ] No tokens en URL.
[ ] No sesión WordPress.
[ ] No public admin routes.
[ ] No public resident transactional routes.
[ ] No datos reales a IA externa.
[ ] Error handling seguro definido.
[ ] Rate limiting básico definido.
[ ] CORS restrictivo definido.
[ ] Headers browser security definidos para frontends.
```

Blockers:

```text id="ir-test-security-blockers"
[ ] storageKey en API o UI debe bloquear.
[ ] WordPress auth para Core debe bloquear.
[ ] Rutas públicas transaccionales deben bloquear.
[ ] IA externa con datos reales debe bloquear.
[ ] Documentos privados sin SDS deben bloquear.
```

Acceptance:

```text id="ir-test-security-ac"
[ ] 0 gaps críticos de seguridad abiertos.
[ ] Security boundaries están definidos para backend, admin-web y resident-web.
```

---

## 12. OpenAPI readiness tests

```text id="ir-test-openapi"
[ ] REST /api/v1 está definido.
[ ] Response envelope está definido.
[ ] Error envelope está definido.
[ ] Health 200/503 usa payload plano conforme a ADR-010 §10.
[ ] OpenAPI marca health con x-response-envelope=false y x-health-endpoint=true.
[ ] OpenAPI declara exposición pública solo para /api/v1/health.
[ ] Health básico no revela dependencias y health detailed está protegido.
[ ] Bearer security scheme está definido.
[ ] Endpoints tenant-scoped tienen x-tenant-scope.
[ ] Endpoints resident .own tienen x-own-resource.
[ ] Endpoints no públicos tienen x-public-exposure=false.
[ ] Endpoints no exponen storageKey.
[ ] Cliente admin-web es generable.
[ ] Cliente resident-web es generable.
[ ] CI falla si rompe generación.
```

Blockers:

```text id="ir-test-openapi-blockers"
[ ] Frontend consumiendo endpoint no documentado debe bloquear.
[ ] OpenAPI exponiendo storageKey debe bloquear.
[ ] OpenAPI aceptando actor fields debe bloquear.
[ ] api-contract.md ausente en paquete MVP debe bloquear.
[ ] Health detailed público o con información interna sensible debe bloquear.
```

Acceptance:

```text id="ir-test-openapi-ac"
[ ] OpenAPI strategy está lista antes de implementar frontends.
```

---

## 13. Data strategy readiness tests

```text id="ir-test-data"
[ ] PostgreSQL confirmado.
[ ] Prisma confirmado.
[ ] UUID confirmado.
[ ] Decimal para dinero confirmado.
[ ] snake_case en DB confirmado.
[ ] camelCase en JSON confirmado.
[ ] timestamps estándar definidos.
[ ] tenant_id definido.
[ ] índices críticos previstos.
[ ] no hard delete en entidades críticas.
[ ] auditoría en operaciones críticas.
[ ] migraciones versionadas previstas.
```

Blockers:

```text id="ir-test-data-blockers"
[ ] Dinero como float debe bloquear.
[ ] Estados de cuenta como fuente primaria independiente debe bloquear.
[ ] Pagos sin auditoría debe bloquear.
[ ] Comprobantes fuera de SDS debe bloquear.
```

Acceptance:

```text id="ir-test-data-ac"
[ ] Estrategia de datos lista para Sprint 0 y Sprint 1.
```

---

## 14. Testing strategy readiness tests

```text id="ir-test-testing-strategy"
[ ] ADR-011 existe.
[ ] test-plan.md existe en paquetes MVP.
[ ] Unit tests están previstos.
[ ] Integration tests están previstos.
[ ] API tests están previstos.
[ ] E2E tests críticos están previstos.
[ ] Multitenancy tests están previstos.
[ ] Permission tests están previstos.
[ ] Security tests están previstos.
[ ] Financial tests están previstos.
[ ] OpenAPI contract tests están previstos.
[ ] Frontend tests están previstos.
```

Blockers:

```text id="ir-test-testing-blockers"
[ ] Sin tests multitenant debe bloquear.
[ ] Sin tests de permisos debe bloquear.
[ ] Sin tests de no storageKey debe bloquear.
[ ] Sin OpenAPI contract tests debe bloquear.
```

Acceptance:

```text id="ir-test-testing-ac"
[ ] Estrategia mínima de testing está definida antes de código productivo.
```

---

## 15. CI/CD readiness tests

```text id="ir-test-cicd"
[ ] ADR-012 existe.
[ ] GitHub Actions definido.
[ ] Install frozen definido.
[ ] TypeScript check definido.
[ ] Lint check definido.
[ ] Format check definido.
[ ] Unit/smoke tests definidos.
[ ] Prisma schema validation definida.
[ ] OpenAPI tooling validation definida.
[ ] Docker Compose config validation definida.
[ ] Docker Compose build de resident-api definido.
[ ] Backend build previsto.
[ ] Admin-web build previsto.
[ ] Resident-web build previsto.
[ ] Dependency audit definido.
[ ] Secret scanning previsto.
[ ] Required CI gates requerido en branch protection.
[ ] Gates de capacidad definidos conforme a ADR-012 §10.2.
```

Blockers:

```text id="ir-test-cicd-blockers"
[ ] Sin CI mínimo debe bloquear.
[ ] Merge sin tests debe bloquear.
[ ] OpenAPI roto sin detección debe bloquear.
[ ] Secretos en repositorio debe bloquear.
[ ] Script requerido ausente o continue-on-error debe bloquear.
```

Acceptance:

```text id="ir-test-cicd-ac"
[ ] CI mínimo definido para Sprint 0.
```

---

## 16. Docker/local development readiness tests

```text id="ir-test-docker"
[ ] docker-compose.yml definido.
[ ] Servicio api definido.
[ ] Servicio postgres definido.
[ ] Servicio redis definido.
[ ] Servicio keycloak definido.
[ ] Servicio keycloak-postgres dedicado definido.
[ ] Servicio mailhog definido.
[ ] Servicio minio definido.
[ ] Los siete servicios usan las imágenes y tags exactos de ADR-009 §7.1.
[ ] No existen `latest`, aliases LTS ni versiones flotantes.
[ ] MailHog y MinIO están limitados a local con datos sintéticos.
[ ] Servicio admin-web opcional definido.
[ ] Servicio resident-web opcional definido.
[ ] .env.example definido.
[ ] Health checks de contenedores definidos; HealthModule no requerido en Sprint 0.
[ ] Seed local definido.
[ ] README local definido.
```

Blockers:

```text id="ir-test-docker-blockers"
[ ] Entorno local no reproducible debe bloquear Sprint 0.
[ ] Variables mínimas no documentadas deben bloquear.
[ ] PostgreSQL local ausente debe bloquear backend Sprint 1.
[ ] Keycloak local ausente debe bloquear auth Sprint 2.
```

Acceptance:

```text id="ir-test-docker-ac"
[ ] Entorno local reproducible está especificado.
```

---

## 17. Gap register tests

```text id="ir-test-gap-register"
[ ] Gap tiene gapId.
[ ] Gap tiene title.
[ ] Gap tiene description.
[ ] Gap tiene affectedArea.
[ ] Gap tiene affectedPackages.
[ ] Gap tiene severity.
[ ] Gap tiene status.
[ ] Gap tiene owner.
[ ] Gap tiene decision.
[ ] Gap tiene requiredBefore.
[ ] Gap tiene mitigation.
[ ] Gap critical no puede quedar sin decisión.
[ ] Gap high no puede quedar sin owner.
[ ] Gap deferred debe tener justificación.
[ ] Accepted risk debe tener expiración.
```

Acceptance:

```text id="ir-test-gap-register-ac"
[ ] 100% gaps críticos tienen decisión.
[ ] 100% gaps altos tienen owner.
[ ] 0 gaps críticos abiertos para GO.
```

---

## 18. Go / Conditional Go / No-Go tests

### 18.1. GO

```text id="ir-test-go"
[ ] GO se permite si no hay gaps críticos abiertos.
[ ] GO se permite si MVP core tiene documentos completos.
[ ] GO se permite si multitenancy está definido.
[ ] GO se permite si Keycloak está definido.
[ ] GO se permite si OpenAPI está definido.
[ ] GO se permite si security boundaries están definidos.
[ ] GO se permite si CI mínimo está definido.
```

---

### 18.2. CONDITIONAL_GO

```text id="ir-test-conditional-go"
[ ] CONDITIONAL_GO se permite si gaps críticos de Sprint 0-2 están resueltos.
[ ] CONDITIONAL_GO se permite si gaps no bloqueantes están diferidos.
[ ] CONDITIONAL_GO requiere razón.
[ ] CONDITIONAL_GO requiere lista de restricciones.
[ ] CONDITIONAL_GO requiere requiredBefore para gaps pendientes.
```

---

### 18.3. NO_GO

```text id="ir-test-no-go"
[ ] NO_GO se emite si hay gaps críticos abiertos.
[ ] NO_GO se emite si falta multitenancy.
[ ] NO_GO se emite si falta autorización.
[ ] NO_GO se emite si falta OpenAPI.
[ ] NO_GO se emite si storageKey se expone.
[ ] NO_GO se emite si WordPress aparece como backend transaccional.
[ ] NO_GO se emite si pagos carecen de auditoría.
```

Acceptance:

```text id="ir-test-decision-ac"
[ ] La decisión final es trazable.
[ ] La decisión final tiene reason.
[ ] La decisión final conserva traceId/audit si hay API.
```

---

## 19. Security negative tests

```text id="ir-test-security-negative"
[ ] Intentar aprobar GO con gap crítico abierto falla.
[ ] Intentar diferir gap crítico de seguridad sin aprobación falla.
[ ] Intentar aceptar riesgo crítico permanente falla.
[ ] Intentar registrar storageKey en gap evidence falla.
[ ] Intentar registrar secret/token en notes falla.
[ ] Intentar crear readiness run público falla.
[ ] Intentar acceder como usuario tenant falla.
[ ] Intentar acceder como residente falla.
[ ] Intentar usar WordPress auth falla.
```

---

## 20. Performance expectations

Como este módulo es una compuerta documental, no tiene requisitos de performance transaccional altos.

Objetivos mínimos:

```text id="ir-test-performance"
[ ] Listar readiness runs p95 < 800 ms con dataset pequeño.
[ ] Listar gaps p95 < 800 ms con 500 gaps.
[ ] Obtener matriz p95 < 1000 ms.
[ ] Recalcular matriz p95 < 3000 ms con 31 paquetes.
[ ] Exportar reporte puede ser async.
```

---

## 21. CI gates para readiness

El pipeline debe fallar si:

```text id="ir-test-ci-gates"
[ ] Falta spec.md en paquete MVP core.
[ ] Falta api-contract.md en paquete MVP core.
[ ] Falta security-notes.md en paquete MVP core.
[ ] Se detecta storageKey en modelos/API frontend.
[ ] Se detecta WordPress auth en módulos Core.
[ ] Se detecta public admin route.
[ ] Se detecta public resident transactional route.
[ ] Se detecta DTO financiero con float.
[ ] Se detecta endpoint frontend no documentado.
[ ] Se detecta ausencia de tenant boundary en query key frontend.
[ ] Se detecta falta de test-plan en paquete MVP.
```

---

## 22. Smoke tests mínimos

```text id="ir-test-smoke"
[ ] Readiness checklist se puede ejecutar manualmente.
[ ] Matriz documental se puede completar.
[ ] Gaps se pueden registrar.
[ ] Gaps críticos se pueden identificar.
[ ] Decisión GO se bloquea con gaps críticos.
[ ] Decisión CONDITIONAL_GO exige razón.
[ ] Decisión NO_GO lista blockers.
[ ] Orden de implementación se puede derivar.
[ ] Sprint 0 queda definido.
[ ] Repositorio objetivo queda definido.
[x] AGENTS.md raíz está versionado y es la única guía aplicable encontrada.
```

---

## 23. Cobertura mínima esperada

```text id="ir-test-coverage"
- SDD base document checks: 100%.
- ADR critical checks: 100%.
- MVP core package checks: 100%.
- Security critical checks: 100%.
- Multitenancy checks: 100%.
- OpenAPI readiness checks: 100%.
- Gap critical checks: 100%.
- Go/No-Go decision checks: 100%.
- CI readiness checks: >= 90%.
- Docker/local readiness checks: >= 80% before Sprint 0.
```

---

## 24. No aceptación

No se acepta este test plan si permite:

```text id="ir-test-no-acceptance"
- iniciar implementación sin documentos base;
- iniciar implementación sin ADRs críticos;
- iniciar implementación sin paquetes MVP completos;
- iniciar implementación con gaps críticos abiertos;
- iniciar implementación sin multitenancy;
- iniciar implementación sin autorización tenant-aware;
- iniciar implementación sin property-level authorization para self-service;
- iniciar implementación sin OpenAPI;
- iniciar frontends con contratos improvisados;
- iniciar pagos sin auditoría;
- iniciar documentos sin SDS;
- usar WordPress como backend transaccional;
- exponer storageKey;
- exponer rutas públicas administrativas;
- exponer rutas públicas resident-facing transaccionales;
- omitir CI mínimo;
- omitir tests multitenant;
- omitir tests de permisos;
- omitir tests de seguridad.
```

---

## 25. Definition of Done de pruebas

```text id="ir-test-dod"
[x] test-plan.md creado.
[x] Pruebas documentales definidas.
[x] Pruebas de ADRs definidas.
[x] Pruebas de paquetes definidas.
[x] Pruebas de arquitectura definidas.
[x] Pruebas de multitenancy definidas.
[x] Pruebas de autorización definidas.
[x] Pruebas de seguridad definidas.
[x] Pruebas de OpenAPI definidas.
[x] Pruebas de datos definidas.
[x] Pruebas de testing strategy definidas.
[x] Pruebas de CI/CD definidas.
[x] Pruebas de Docker/local definidas.
[x] Pruebas de gap register definidas.
[x] Pruebas Go/Conditional Go/No-Go definidas.
[x] Negative tests definidos.
[x] Smoke tests definidos.
[x] No aceptación definida.
```

---

## 26. Resultado esperado

```text id="ir-test-expected-result"
test plan definido
documentation completeness tests definidos
ADR consistency tests definidos
package readiness tests definidos
architecture tests definidos
multitenancy tests definidos
authorization tests definidos
security readiness tests definidos
OpenAPI readiness tests definidos
data strategy tests definidos
testing strategy tests definidos
CI/CD readiness tests definidos
Docker readiness tests definidos
gap register tests definidos
Go/Conditional Go/No-Go tests definidos
negative security tests definidos
smoke tests definidos
coverage mínima definida
no implementation before readiness
no critical gaps for GO
```

---

## 27. Expediente actualizado

```text id="ir-test-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 031-implementation-readiness/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── api-contract.md
│   │       └── test-plan.md
```

---

## 28. Reevaluación formal — 2026-08-10

```text id="ir-test-formal-reevaluation-2026-08-10"
[x] 31 paquetes de especificación presentes.
[x] 217 de 217 documentos requeridos presentes.
[x] 12 de 12 ADRs con estado accepted.
[x] 0 gaps críticos abiertos.
[x] 0 gaps altos abiertos.
[x] Multitenancy, Keycloak, OpenAPI y security boundaries definidos.
[x] CI mínimo y orden de implementación definidos.
[x] La decisión GO es trazable a READINESS-031-2026-08-10.md.
```
