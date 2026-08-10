# Tasks — 031 Implementation Readiness

## 1. Información del documento

| Campo          | Valor                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                                       |
| Spec ID        | 031                                                                                                                 |
| Módulo         | Implementation Readiness                                                                                            |
| Documento      | Tasks                                                                                                               |
| Ruta           | `docs/specs/031-implementation-readiness/tasks.md`                                                                  |
| Versión        | 0.1                                                                                                                 |
| Estado         | complete                                                                                                            |
| Fecha          | 2026-08-05                                                                                                          |
| Naturaleza     | Readiness gate / SDD closure checkpoint / Pre-implementation validation                                             |
| Stack objetivo | NestJS / TypeScript / PostgreSQL / Prisma / Redis / BullMQ / Docker / Keycloak / OpenAPI / Next.js / GitHub Actions |

---

## 2. Propósito

Definir las tareas necesarias para ejecutar la compuerta `031-implementation-readiness` y confirmar si RESIDENT Core está listo para iniciar implementación técnica.

Este backlog no implementa lógica de negocio residencial. Sus tareas se enfocan en inventario documental, revisión de consistencia, validación de arquitectura, identificación de gaps, preparación técnica del repositorio y decisión Go / Conditional Go / No-Go.

Regla central:

```text id="ir-task-rule"
Ninguna tarea de Implementation Readiness se considera completa si permite iniciar implementación con gaps críticos abiertos en multitenancy, autenticación, autorización, seguridad, OpenAPI, base de datos, auditoría, CI/CD, límites WordPress/Core, exposición de storageKey, rutas públicas transaccionales o contratos API inexistentes en módulos MVP.
```

---

## 3. Convenciones

```text id="ir-task-status"
[ ] Pendiente
[x] Completado
[~] En progreso
[!] Bloqueado
[-] No aplica
```

---

## 4. Dependencias previas

```text id="ir-task-dependencies"
[ ] spec.md creado y revisado.
[ ] plan.md creado y revisado.
[ ] data-model.md creado y revisado.
[ ] api-contract.md creado y revisado.
[ ] test-plan.md creado y revisado.
[ ] Documentos SDD base disponibles.
[ ] ADRs 001-012 disponibles.
[ ] Paquetes 001-030 disponibles.
[ ] Decisión de arquitectura vigente.
[ ] Decisión Keycloak vigente.
[ ] Estrategia multitenant vigente.
[ ] Estrategia API-first vigente.
[ ] Estrategia WordPress/Core vigente.
```

---

# 5. EPIC-031-01 — Inventario documental SDD

```text id="ir-epic-01"
[ ] Inventariar docs/sdd/constitution.md.
[ ] Inventariar docs/sdd/domain-map.md.
[ ] Inventariar docs/sdd/architecture.md.
[ ] Inventariar docs/sdd/security.md.
[ ] Inventariar docs/sdd/api-guidelines.md.
[ ] Inventariar docs/sdd/data-governance.md.
[ ] Registrar versión de cada documento base.
[ ] Registrar estado de cada documento base.
[ ] Validar que todos los documentos base reflejan Keycloak.
[ ] Validar que todos los documentos base reflejan monolito modular.
[ ] Validar que todos los documentos base reflejan multitenancy.
[ ] Validar que todos los documentos base reflejan API-first.
[ ] Validar que WordPress queda como portal público no transaccional.
```

Acceptance:

```text id="ir-epic-01-ac"
[ ] Matriz de documentos base creada.
[ ] Todos los documentos base tienen estado definido.
[ ] No hay contradicciones críticas entre documentos base.
```

---

# 6. EPIC-031-02 — Inventario de ADRs

```text id="ir-epic-02"
[ ] Inventariar ADR-001-architecture-style.md.
[ ] Inventariar ADR-002-backend-framework.md.
[ ] Inventariar ADR-003-database-strategy.md.
[ ] Inventariar ADR-004-multitenancy-strategy.md.
[ ] Inventariar ADR-005-authentication-strategy.md.
[ ] Inventariar ADR-006-identity-provider-strategy.md.
[ ] Inventariar ADR-007-authorization-strategy.md.
[ ] Inventariar ADR-008-api-gateway-strategy.md.
[ ] Inventariar ADR-009-deployment-strategy.md.
[ ] Inventariar ADR-010-observability-strategy.md.
[ ] Inventariar ADR-011-testing-strategy.md.
[ ] Inventariar ADR-012-ci-cd-strategy.md.
[ ] Validar estado de cada ADR.
[ ] Validar consistencia entre ADRs.
[ ] Registrar ADRs faltantes si aparecen decisiones no cubiertas.
```

Acceptance:

```text id="ir-epic-02-ac"
[ ] ADRs 001-012 inventariados.
[ ] ADRs críticos no se contradicen.
[ ] Decisiones arquitectónicas clave están cubiertas.
```

---

# 7. EPIC-031-03 — Inventario de paquetes 001-030

```text id="ir-epic-03"
[ ] Inventariar paquete 001-tenants.
[ ] Inventariar paquete 002-users-roles.
[ ] Inventariar paquete 003-residents-properties.
[ ] Inventariar paquete 004-dues-fees.
[ ] Inventariar paquete 005-payments.
[ ] Inventariar paquete 006-account-statements.
[ ] Inventariar paquete 007-audit.
[ ] Inventariar paquete 008-basic-reports.
[ ] Inventariar paquete 009-wordpress-integration-basic.
[ ] Inventariar paquete 010-reservations-common-areas.
[ ] Inventariar paquete 011-fines-sanctions.
[ ] Inventariar paquete 012-communications-notifications.
[ ] Inventariar paquete 013-meetings-attendance.
[ ] Inventariar paquete 014-voting-basic.
[ ] Inventariar paquete 015-certified-minutes.
[ ] Inventariar paquete 016-secure-document-storage.
[ ] Inventariar paquete 017-bank-reconciliation.
[ ] Inventariar paquete 018-payment-provider-integration.
[ ] Inventariar paquete 019-open-banking-integration.
[ ] Inventariar paquete 020-accounting-ledger.
[ ] Inventariar paquete 021-supplier-payments.
[ ] Inventariar paquete 022-maintenance-work-orders.
[ ] Inventariar paquete 023-inventory-basic.
[ ] Inventariar paquete 024-access-control-visitors.
[ ] Inventariar paquete 025-tenant-settings-policies.
[ ] Inventariar paquete 026-automation-workflows-basic.
[ ] Inventariar paquete 027-dashboard-kpis.
[ ] Inventariar paquete 028-data-import-migration.
[ ] Inventariar paquete 029-admin-web-app-basic.
[ ] Inventariar paquete 030-resident-self-service-basic.
```

Por cada paquete revisar:

```text id="ir-epic-03-per-package"
[ ] spec.md.
[ ] plan.md.
[ ] data-model.md.
[ ] api-contract.md.
[ ] test-plan.md.
[ ] tasks.md.
[ ] security-notes.md.
[ ] Estado: complete / partial / missing / deferred / blocked / needs-review.
```

Acceptance:

```text id="ir-epic-03-ac"
[ ] Matriz de paquetes creada.
[ ] Paquetes MVP core identificados.
[ ] Paquetes incompletos registrados como gaps.
```

---

# 8. EPIC-031-04 — Clasificación de prioridad

```text id="ir-epic-04"
[ ] Clasificar paquetes MVP obligatorio.
[ ] Clasificar paquetes MVP extendido.
[ ] Clasificar paquetes financieros avanzados.
[ ] Clasificar paquetes operacionales/analíticos.
[ ] Clasificar integración WordPress.
[ ] Registrar paquetes diferibles.
[ ] Registrar paquetes bloqueantes para Sprint 0.
[ ] Registrar paquetes bloqueantes para Sprint 1.
[ ] Registrar paquetes bloqueantes para Sprint 2.
[ ] Registrar paquetes bloqueantes para MVP.
```

MVP obligatorio:

```text id="ir-epic-04-mvp-core"
[ ] 001-tenants.
[ ] 002-users-roles.
[ ] 003-residents-properties.
[ ] 004-dues-fees.
[ ] 005-payments.
[ ] 006-account-statements.
[ ] 007-audit.
[ ] 016-secure-document-storage.
[ ] 025-tenant-settings-policies.
[ ] 029-admin-web-app-basic.
[ ] 030-resident-self-service-basic.
```

Acceptance:

```text id="ir-epic-04-ac"
[ ] Todos los paquetes tienen prioridad.
[ ] El orden de implementación está definido.
[ ] Los módulos diferidos no bloquean Sprint 0 si no afectan arquitectura.
```

---

# 9. EPIC-031-05 — Revisión de consistencia arquitectónica

```text id="ir-epic-05"
[ ] Validar monolito modular como arquitectura inicial.
[ ] Validar microservicios físicos diferidos.
[ ] Validar Docker como estrategia inicial.
[ ] Validar PostgreSQL como base principal.
[ ] Validar Prisma como ORM.
[ ] Validar Redis/BullMQ para procesos asíncronos.
[ ] Validar Keycloak como IdP objetivo.
[ ] Validar OpenAPI como contrato.
[ ] Validar Admin Web App separada de WordPress.
[ ] Validar Resident Web App separada de WordPress.
[ ] Validar WordPress como portal público informativo.
[ ] Validar que WordPress no sea backend transaccional.
```

Bloqueantes:

```text id="ir-epic-05-blockers"
[ ] Cualquier documento que use WordPress como backend transaccional.
[ ] Cualquier documento que elimine tenant isolation.
[ ] Cualquier documento que asigne autorización final al frontend.
[ ] Cualquier documento que permita rutas públicas transaccionales.
[ ] Cualquier documento que exponga storageKey.
```

---

# 10. EPIC-031-06 — Revisión de multitenancy

```text id="ir-epic-06"
[ ] Validar estrategia shared schema + tenant_id.
[ ] Validar tenant_id obligatorio en entidades tenant-scoped.
[ ] Validar TenantGuard.
[ ] Validar tenant resolution.
[ ] Validar que tenantId no sea autoridad editable.
[ ] Validar índices tenant-scoped.
[ ] Validar auditoría tenant-scoped.
[ ] Validar APIs tenant-scoped.
[ ] Validar cache frontend tenant-scoped.
[ ] Validar errores 403/404 cross-tenant.
```

Acceptance:

```text id="ir-epic-06-ac"
[ ] No hay entidad crítica tenant-scoped sin tenant_id.
[ ] No hay endpoint crítico que acepte tenantId como autoridad final.
[ ] No hay frontend con cache sin tenant boundary.
```

---

# 11. EPIC-031-07 — Revisión de autenticación y autorización

```text id="ir-epic-07"
[ ] Validar Keycloak como autenticación objetivo.
[ ] Validar `resident-resident-web` como `client_id` único de `apps/resident-web`.
[ ] Validar Authorization Code Flow with PKCE.
[ ] Validar implicit flow deshabilitado.
[ ] Validar mapping keycloakSubjectId -> UserProfile.
[ ] Validar Core como autoridad de autorización.
[ ] Validar RBAC.
[ ] Validar permissions por módulo.
[ ] Validar resource-level authorization.
[ ] Validar property-level authorization para resident-web.
[ ] Validar PermissionGuard.
[ ] Validar SensitiveActionGuard.
[ ] Validar que frontend use permisos solo para UI.
```

Bloqueantes:

```text id="ir-epic-07-blockers"
[ ] Frontend decide autorización final.
[ ] Roles Keycloak reemplazan reglas Core.
[ ] No existe autorización tenant-aware.
[ ] No existe autorización property-scoped para resident-web.
[ ] Acciones financieras no tienen permisos.
```

---

# 12. EPIC-031-08 — Revisión de seguridad

```text id="ir-epic-08"
[ ] Validar docs/sdd/security.md.
[ ] Validar security-notes en paquetes MVP.
[ ] Validar no storageKey exposure.
[ ] Validar no signedUrl persistente.
[ ] Validar no secrets en logs.
[ ] Validar no tokens en URL.
[ ] Validar no sesión WordPress.
[ ] Validar no public admin routes.
[ ] Validar no public resident transactional routes.
[ ] Validar no datos reales a IA externa.
[ ] Validar rate limiting básico.
[ ] Validar CORS restrictivo.
[ ] Validar headers de seguridad frontend.
[ ] Validar error handling seguro.
```

Acceptance:

```text id="ir-epic-08-ac"
[ ] No hay security gaps críticos abiertos.
[ ] No se expone storageKey.
[ ] No hay dependencia transaccional WordPress.
[ ] No hay rutas públicas transaccionales.
```

---

# 13. EPIC-031-09 — Revisión OpenAPI/API

```text id="ir-epic-09"
[ ] Validar REST /api/v1.
[ ] Validar response envelope.
[ ] Validar error envelope.
[ ] Validar excepción plana de health conforme a ADR-010 §10.
[ ] Validar separación entre liveness pública y readiness protegida.
[ ] Validar Bearer auth scheme.
[ ] Validar endpoints tenant-scoped.
[ ] Validar endpoints .own.
[ ] Validar OpenAPI extensions.
[ ] Validar cliente admin-web generable.
[ ] Validar cliente resident-web generable.
[ ] Validar contract tests.
[ ] Validar que CI falla si OpenAPI rompe clientes.
[ ] Validar que no se consumen endpoints no documentados.
```

Bloqueantes:

```text id="ir-epic-09-blockers"
[ ] api-contract.md faltante en paquete MVP.
[ ] OpenAPI expone storageKey.
[ ] OpenAPI acepta actor fields.
[ ] OpenAPI acepta tenantId editable.
[ ] Frontend consume endpoint improvisado.
```

---

# 14. EPIC-031-10 — Revisión de datos y Prisma

```text id="ir-epic-10"
[ ] Validar PostgreSQL.
[ ] Validar Prisma.
[ ] Validar UUID.
[ ] Validar Decimal para dinero.
[ ] Validar snake_case en DB.
[ ] Validar camelCase en JSON.
[ ] Validar timestamps estándar.
[ ] Validar tenant_id.
[ ] Validar índices críticos.
[ ] Validar no hard delete en entidades críticas.
[ ] Validar auditoría en operaciones críticas.
[ ] Validar migraciones versionadas.
```

Bloqueantes:

```text id="ir-epic-10-blockers"
[ ] Dinero con float.
[ ] Tabla tenant-scoped sin tenant_id.
[ ] Entidad financiera sin auditoría.
[ ] Estado de cuenta como fuente primaria independiente.
[ ] Documentos/comprobantes fuera de SDS.
```

---

# 15. EPIC-031-11 — Revisión de testing

```text id="ir-epic-11"
[ ] Validar ADR-011.
[ ] Validar test-plan.md en paquetes MVP.
[ ] Validar unit tests definidos.
[ ] Validar integration tests definidos.
[ ] Validar API tests definidos.
[ ] Validar E2E tests críticos definidos.
[ ] Validar multitenancy tests definidos.
[ ] Validar permission tests definidos.
[ ] Validar security tests definidos.
[ ] Validar financial tests definidos.
[ ] Validar OpenAPI contract tests definidos.
[ ] Validar frontend tests definidos.
```

Bloqueantes:

```text id="ir-epic-11-blockers"
[ ] Sin tests multitenant.
[ ] Sin tests de permisos.
[ ] Sin tests financieros críticos.
[ ] Sin tests no-storageKey.
[ ] Sin tests OpenAPI.
[ ] Sin CI mínimo.
```

---

# 16. EPIC-031-12 — Revisión CI/CD

```text id="ir-epic-12"
[ ] Validar ADR-012.
[ ] Validar GitHub Actions.
[ ] Validar install frozen.
[ ] Validar lint check.
[ ] Validar format check.
[ ] Validar TypeScript check.
[ ] Validar unit/smoke tests.
[ ] Validar Prisma schema validation.
[ ] Validar OpenAPI tooling validation.
[ ] Validar Docker Compose config.
[ ] Validar Docker Compose build de resident-api.
[ ] Validar backend build.
[ ] Validar admin-web build.
[ ] Validar resident-web build.
[ ] Validar dependency audit.
[ ] Validar secret scanning.
[ ] Validar Required CI gates en branch protection.
[ ] Validar ausencia de continue-on-error y skips silenciosos.
[ ] Validar activación progresiva de gates conforme a ADR-012 §10.2.
```

Acceptance:

```text id="ir-epic-12-ac"
[ ] Existe pipeline mínimo para Sprint 0.
[ ] Código no puede mergearse sin checks básicos.
[ ] OpenAPI no puede romper frontends sin detección.
```

---

# 17. EPIC-031-13 — Revisión Docker/local development

```text id="ir-epic-13"
[ ] Validar docker-compose.yml.
[ ] Validar servicio resident-api.
[ ] Validar servicio postgres.
[ ] Validar servicio redis.
[ ] Validar servicio keycloak.
[ ] Validar servicio keycloak-postgres dedicado.
[ ] Validar servicio mailhog.
[ ] Validar servicio minio.
[ ] Validar imágenes y tags exactos conforme a ADR-009 §7.1.
[ ] Rechazar `latest`, aliases LTS y versiones flotantes.
[ ] Validar que MailHog y MinIO estén limitados a local con datos sintéticos.
[ ] Confirmar que servicios opcionales/diferidos no bloquean Sprint 0.
[ ] Validar admin-web opcional.
[ ] Validar resident-web opcional.
[ ] Validar .env.example.
[ ] Validar health checks de contenedores; no exigir HealthModule en Sprint 0.
[ ] Validar seed local.
[ ] Validar README local.
```

Bloqueantes:

```text id="ir-epic-13-blockers"
[ ] No se puede levantar entorno local.
[ ] Keycloak local no reproducible.
[ ] PostgreSQL local no reproducible.
[ ] Variables mínimas no documentadas.
```

---

# 18. EPIC-031-14 — Registro de gaps

```text id="ir-epic-14"
[x] Crear gap register.
[x] Registrar gaps documentales.
[x] Registrar gaps arquitectónicos.
[ ] Registrar gaps de seguridad.
[x] Registrar gaps API/OpenAPI.
[x] Registrar gaps de datos.
[ ] Registrar gaps de testing.
[x] Registrar gaps CI/CD.
[x] Registrar gaps Docker/local.
[x] Clasificar severidad.
[x] Asignar owner.
[x] Asignar requiredBefore.
[ ] Asignar decisión.
[x] Definir mitigación.
[x] Actualizar estado.
```

Campos mínimos:

```text id="ir-epic-14-fields"
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

---

# 19. EPIC-031-15 — Matriz de readiness

```text id="ir-epic-15"
[ ] Crear matriz de documentos base.
[ ] Crear matriz de ADRs.
[ ] Crear matriz de paquetes MVP.
[ ] Crear matriz de seguridad.
[ ] Crear matriz OpenAPI.
[ ] Crear matriz testing.
[ ] Crear matriz CI/CD.
[x] Calcular gaps críticos abiertos.
[x] Calcular gaps altos abiertos.
[ ] Calcular readiness score por área.
[x] Definir recomendación automática: GO / CONDITIONAL_GO / NO_GO.
```

Acceptance:

```text id="ir-epic-15-ac"
[x] Matriz permite decisión objetiva.
[x] Matriz distingue gaps críticos de no bloqueantes.
[x] Matriz identifica qué fases pueden iniciar.
```

---

# 20. EPIC-031-16 — Decisión Go / Conditional Go / No-Go

```text id="ir-epic-16"
[x] Evaluar condiciones GO.
[x] Evaluar condiciones CONDITIONAL_GO.
[x] Evaluar condiciones NO_GO.
[x] Documentar decisión.
[x] Documentar razón.
[x] Documentar gaps que bloquean.
[ ] Documentar gaps diferidos.
[x] Documentar fases autorizadas.
[x] Documentar fases no autorizadas.
[x] Registrar aprobación.
```

Reglas:

```text id="ir-epic-16-rules"
[x] GO requiere 0 gaps críticos abiertos.
[x] GO requiere MVP core completo.
[x] CONDITIONAL_GO requiere que Sprint 0-2 no tengan gaps críticos.
[x] NO_GO aplica si hay gaps críticos en arquitectura, seguridad, multitenancy, authz, OpenAPI, datos o CI mínimo.
```

---

# 21. EPIC-031-17 — Orden de implementación

```text id="ir-epic-17"
[ ] Definir Sprint 0 — Fundación técnica.
[ ] Definir Sprint 1 — Backend platform base.
[ ] Definir Sprint 2 — Identity, tenants and authorization.
[ ] Definir Sprint 3 — Residents/properties and financial base.
[ ] Definir Sprint 4 — Admin Web MVP.
[ ] Definir Sprint 5 — Resident Web MVP.
[ ] Definir Sprint 6 — Operación comunitaria básica.
[ ] Definir Sprint 7 — Gobernanza y reportes.
[ ] Marcar dependencias por sprint.
[ ] Marcar blockers por sprint.
```

Acceptance:

```text id="ir-epic-17-ac"
[ ] Existe secuencia implementable.
[ ] Sprint 0 no depende de módulos diferidos.
[ ] Seguridad y multitenancy empiezan antes que módulos financieros.
```

---

# 22. EPIC-031-18 — Repositorio objetivo

```text id="ir-epic-18"
[ ] Aprobar estructura resident-core/.
[ ] Aprobar apps/api.
[ ] Aprobar apps/admin-web.
[ ] Aprobar apps/resident-web.
[ ] Aprobar packages/shared.
[ ] Aprobar packages/config.
[ ] Aprobar packages/auth.
[ ] Aprobar packages/openapi-client.
[ ] Aprobar packages/testing.
[ ] Aprobar docs/.
[ ] Aprobar infra/.
[ ] Aprobar prisma/.
[ ] Aprobar tools/.
[ ] Aprobar .github/workflows/.
[x] Incorporar el AGENTS.md raíz al control de versiones.
```

Acceptance:

```text id="ir-epic-18-ac"
[ ] Estructura permite monolito modular.
[ ] Estructura permite frontends separados.
[ ] Estructura permite documentación SDD versionada.
[ ] Estructura permite evolución futura a microservicios.
```

---

# 23. EPIC-031-19 — Sprint 0 backlog

```text id="ir-epic-19"
[ ] Crear monorepo.
[ ] Normalizar master legacy a main antes de crear CI o remoto.
[ ] Mantener main como única rama permanente; no crear develop.
[ ] Configurar pnpm 11.21.0 workspace.
[ ] Fijar Node.js 24.18.0 en .node-version y package.json.
[ ] Configurar TypeScript base.
[ ] Crear apps/api.
[ ] Crear apps/admin-web.
[ ] Crear apps/resident-web.
[ ] Crear packages/shared.
[ ] Crear packages/config.
[ ] Crear packages/auth como scaffold, sin autenticación o autorización runtime.
[ ] Crear packages/openapi-client con tooling y comando real de validación.
[ ] Crear packages/testing con utilidades smoke y comando real security:secrets.
[ ] Crear schema.prisma solo con generator y datasource.
[ ] Confirmar ausencia de modelos, enums, migraciones y seeds Prisma de dominio.
[ ] Crear docker-compose local.
[ ] Crear servicio resident-api.
[ ] Crear servicio postgres.
[ ] Crear servicio redis.
[ ] Crear servicio keycloak.
[ ] Crear servicio keycloak-postgres dedicado.
[ ] Crear servicio mailhog.
[ ] Crear servicio minio.
[ ] Crear GitHub Actions inicial.
[ ] Crear README local.
[ ] Crear .env.example.
[ ] Mantener evidencia de readiness en Markdown/Git.
[ ] Confirmar ausencia de rutas, controllers, services, DTOs y permisos de readiness.
[ ] Confirmar ausencia de modelos Prisma, tablas, migraciones, seeds y repositorios de readiness.
```

Acceptance:

```text id="ir-epic-19-ac"
[ ] Entorno base puede inicializarse.
[ ] CI mínimo puede ejecutarse.
[ ] Docker local tiene servicios base definidos.
[ ] Los cinco packages base tienen manifest, TypeScript strict, exports y scripts aplicables.
[ ] auth, openapi-client y testing cumplen spec 031 §12.1 sin lógica futura anticipada.
[ ] No existen packages vacíos ni scripts placeholder.
[ ] API y persistencia de spec 031 permanecen diferidas y fuera de Sprint 0.
```

---

# 24. EPIC-031-20 — Definition of Ready global

```text id="ir-epic-20"
[ ] Validar documentos SDD base.
[ ] Validar ADRs críticos.
[ ] Validar paquetes MVP core.
[ ] Validar arquitectura.
[ ] Validar multitenancy.
[ ] Validar Keycloak.
[ ] Validar autorización.
[ ] Validar datos.
[ ] Validar OpenAPI.
[ ] Validar seguridad.
[ ] Validar testing.
[ ] Validar CI/CD.
[ ] Validar Docker/local.
[ ] Validar gaps críticos resueltos.
[ ] Validar gaps no bloqueantes registrados.
```

Definition of Ready:

```text id="ir-epic-20-dor"
[ ] 100% documentos base completos.
[ ] 100% ADRs críticos completos.
[ ] 100% paquetes MVP core completos.
[ ] 0 gaps críticos abiertos.
[ ] 0 gaps altos sin decisión.
[ ] CI mínimo definido.
[ ] OpenAPI strategy definida.
[ ] Orden de implementación aprobado.
```

---

# 25. EPIC-031-21 — Exportación / evidencia

```text id="ir-epic-21"
[ ] Preparar resumen de readiness.
[ ] Preparar matriz documental.
[ ] Preparar matriz de gaps.
[ ] Preparar decisión Go/Conditional Go/No-Go.
[ ] Preparar orden de implementación.
[ ] Preparar backlog Sprint 0.
[ ] Preparar evidencia de cierre.
[ ] Exportar a Markdown si aplica.
[ ] Guardar en docs/specs/031-implementation-readiness/.
```

Acceptance:

```text id="ir-epic-21-ac"
[ ] Existe evidencia documental de la decisión.
[ ] La decisión puede auditarse.
[ ] El equipo puede iniciar o bloquear implementación con base objetiva.
```

---

# 26. Plan de Pull Requests sugerido

```text id="ir-pr-plan"
PR-031-01 — SDD inventory and readiness matrix.
PR-031-02 — ADR consistency review and architectural readiness.
PR-031-03 — MVP package completeness review.
PR-031-04 — Security, multitenancy and authorization readiness.
PR-031-05 — OpenAPI, data and testing readiness.
PR-031-06 — CI/CD, Docker and local development readiness.
PR-031-07 — Gap register and Go/Conditional Go/No-Go decision.
PR-031-08 — Sprint 0 backlog and repository structure approval.
```

---

# 27. Checklist rápido de bloqueo

No iniciar implementación si:

```text id="ir-blocking-checklist"
[ ] Falta estrategia multitenant.
[ ] Falta estrategia Keycloak.
[ ] Falta autorización tenant-aware.
[ ] Falta autorización property-scoped.
[ ] Falta api-guidelines.md.
[ ] Falta data-governance.md.
[ ] Falta OpenAPI strategy.
[ ] Falta CI mínimo.
[ ] Faltan security-notes de paquetes MVP.
[ ] Faltan api-contracts de paquetes MVP.
[ ] WordPress aparece como backend transaccional.
[ ] Hay rutas públicas admin.
[ ] Hay rutas públicas resident-facing.
[ ] storageKey aparece en modelos/API/UI.
[ ] Pagos no tienen auditoría.
[ ] Dinero se modela como float.
[ ] Estados de cuenta son fuente primaria independiente.
[ ] Frontend calcula saldos finales.
```

---

# 28. No aceptación

No se acepta este paquete si:

```text id="ir-task-no-acceptance"
- permite iniciar implementación sin matriz documental;
- permite iniciar implementación sin revisar ADRs;
- permite iniciar implementación sin clasificar paquetes;
- permite iniciar implementación sin gap register;
- permite iniciar implementación con gaps críticos abiertos;
- permite iniciar implementación sin multitenancy definido;
- permite iniciar implementación sin Keycloak definido;
- permite iniciar implementación sin autorización tenant-aware;
- permite iniciar implementación sin OpenAPI strategy;
- permite iniciar implementación sin CI mínimo;
- permite usar WordPress como backend transaccional;
- permite rutas públicas administrativas;
- permite rutas públicas resident-facing transaccionales;
- permite storageKey en APIs o UI;
- permite pagos sin auditoría;
- permite frontends con contratos improvisados;
- permite base de datos sin tenant_id strategy;
- permite dinero con float;
- permite estados de cuenta como fuente primaria independiente.
```

---

# 29. Definition of Done

```text id="ir-task-dod"
[x] tasks.md creado.
[x] Inventario documental definido.
[x] Inventario ADR definido.
[x] Inventario paquetes 001-030 definido.
[x] Clasificación de prioridad definida.
[x] Revisión arquitectónica definida.
[x] Revisión multitenancy definida.
[x] Revisión auth/authz definida.
[x] Revisión seguridad definida.
[x] Revisión OpenAPI definida.
[x] Revisión datos/Prisma definida.
[x] Revisión testing definida.
[x] Revisión CI/CD definida.
[x] Revisión Docker/local definida.
[x] Gap register definido.
[x] Matriz de readiness definida.
[x] Criterios Go/Conditional Go/No-Go definidos.
[x] Orden de implementación definido.
[x] Repositorio objetivo definido.
[x] Sprint 0 backlog definido.
[x] API y persistencia runtime de readiness están explícitamente diferidas.
[x] Definition of Ready global definida.
[x] No aceptación definida.
```

---

# 30. Resultado esperado

```text id="ir-task-expected-result"
tasks definidas
readiness backlog definido
inventario documental accionable
inventario ADR accionable
inventario paquetes accionable
prioridad de implementación accionable
revisión arquitectura accionable
revisión multitenancy accionable
revisión authz accionable
revisión seguridad accionable
revisión OpenAPI accionable
revisión datos accionable
revisión testing accionable
revisión CI/CD accionable
revisión Docker accionable
gap register accionable
readiness matrix accionable
Go Conditional Go No-Go accionable
Sprint 0 definido
repositorio objetivo definido
Definition of Ready global definida
no implementation with critical gaps
```

---

# 31. Expediente actualizado

```text id="ir-task-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 031-implementation-readiness/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       └── tasks.md
```

---

# 32. Ejecución formal — 2026-08-09

```text id="ir-formal-execution-2026-08-09"
Evaluación: READINESS-031-2026-08-09
Evidencia: docs/changes/READINESS-031-2026-08-09.md
Decisión: NO_GO
Gaps críticos abiertos: 0
Gaps altos abiertos: 0
Alcance permitido: remediación documental
Alcance bloqueado: implementación técnica de Sprint 0
```

GAP-031-013 ya está resuelto y no quedan gaps registrados abiertos. La compuerta deberá
reevaluarse formalmente; esta ejecución histórica no cambia de estado ni marca como
completadas las tareas que dependen de una nueva decisión.

---

# 33. Reevaluación formal — 2026-08-10

```text id="ir-formal-execution-2026-08-10"
Evaluación: READINESS-031-2026-08-10
Evidencia: docs/changes/READINESS-031-2026-08-10.md
Decisión: GO
Gaps críticos abiertos: 0
Gaps altos abiertos: 0
Alcance autorizado: implementación técnica de Sprint 0
Alcance no autorizado: Sprint 1 y lógica de negocio
Sustituye: READINESS-031-2026-08-09 (NO_GO)
```
