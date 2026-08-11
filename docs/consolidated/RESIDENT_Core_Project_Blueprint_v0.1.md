# RESIDENT Core — Project Blueprint v0.1

## 1. Información del documento

| Campo       | Valor                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Proyecto    | RESIDENT Core                                                                          |
| Documento   | Project Blueprint                                                                      |
| Ruta        | `docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md`                            |
| Versión     | 0.1                                                                                    |
| Estado      | Sprint 0 cerrado; Sprint 1 Backend Platform Base autorizado                            |
| Fecha       | 2026-08-06                                                                             |
| Fase actual | Inicio autorizado de Sprint 1 — Backend Platform Base                                 |
| Alcance     | Resumen estructural, arquitectónico, documental y operativo del proyecto RESIDENT Core |

---

## 2. Propósito del documento

Este documento consolida el estado actual del proyecto RESIDENT Core después de la fase inicial de especificación bajo enfoque **Spec-Driven Development — SDD**.

Su objetivo es servir como **foto oficial del proyecto** antes de iniciar implementación técnica.

Este documento permite responder rápidamente:

```text id="blueprint-purpose-questions"
¿Qué es RESIDENT?
¿Qué ya está construido?
Qué arquitectura se eligió?
Qué stack tecnológico se decidió?
Qué documentos existen?
Qué módulos funcionales han sido especificados?
Qué decisiones arquitectónicas están vigentes?
Qué reglas de seguridad son obligatorias?
Cuál es el orden recomendado de implementación?
Cuál es el siguiente paso técnico?
```

Regla central:

```text id="blueprint-rule"
Este Project Blueprint es el baseline consolidado del proyecto y ocupa el tercer nivel
de autoridad definido en AGENTS.md: está subordinado a constitution.md y a los ADRs
aprobados, y precede a las especificaciones de dominio y a los demás documentos
técnicos. No reemplaza el detalle de las fuentes individuales. Toda contradicción debe
resolverse siguiendo la jerarquía completa de AGENTS.md y registrarse explícitamente;
no debe resolverse informalmente en el código.
```

---

## 3. Resumen ejecutivo

RESIDENT es una plataforma multitenant para la gestión digital de conjuntos residenciales.

El proyecto está dividido en dos grandes fases:

```text id="blueprint-phases"
FASE 1 — Portal multitenant WordPress
FASE 2 — RESIDENT Core transaccional
```

La **FASE 1** ya fue completada mediante un portal multitenant construido con WordPress.

La **FASE 2** corresponde al sistema transaccional principal: RESIDENT Core. Este sistema gestionará tenants, usuarios, roles, residentes, propiedades, alícuotas, cargos, pagos, estados de cuenta, documentos, reservas, multas, reuniones, votaciones, mantenimiento, visitantes, reportes, auditoría, automatizaciones e integraciones.

El proyecto se ha especificado bajo una variante interna de SDD inspirada principalmente en:

```text id="blueprint-inspirations"
- GitHub Spec Kit / Spec-Driven Development;
- Architecture Decision Records — ADR;
- API-first con OpenAPI;
- Domain-Driven Design / bounded contexts;
- monorepo modular;
- seguridad por diseño;
- readiness gates previos a implementación.
```

---

## 4. Estado actual del proyecto

```text id="blueprint-current-state"
Estado general: Sprint 0 cerrado y Sprint 1 Backend Platform Base autorizado.
Fase actual: preparación del primer PR técnico de Sprint 1.
Tipo actual de repositorio: monorepo técnico versionado con CI y entorno local reproducible.
Siguiente paso recomendado: implementar configuración y bootstrap seguro en una rama corta.
```

Actualmente el proyecto cuenta con:

```text id="blueprint-current-assets"
- documentos SDD base;
- ADRs arquitectónicos;
- specs funcionales 001-031;
- cambio transversal Keycloak;
- documento consolidado Keycloak;
- runbooks de Sprint 0 y Sprint 1;
- compuertas formales de readiness y cierre;
- estándar documental recomendado;
- este Project Blueprint como baseline general.
```

---

## 5. FASE 1 — Portal WordPress multitenant

La primera fase del proyecto consistió en crear el portal público multitenant usando WordPress.

Estado:

```text id="blueprint-phase1-status"
FASE 1: completada.
Portal: funcional.
URL: https://www.resident.gustavoguaigua.com
```

Stack usado:

```text id="blueprint-phase1-stack"
WordPress
Astra Free
Astra Child
Spectra / Gutenberg
CPT UI
ACF Free
LiteSpeed Cache
KnownHost
```

Objeto principal:

```text id="blueprint-phase1-cpt"
Custom Post Type: conjunto
Slug plural: conjuntos
Plantilla individual: single-conjunto.php
```

Campos ACF principales:

```text id="blueprint-phase1-acf"
logo
banner_principal
color_primario
color_secundario
slogan
url_residentes
whatsapp
telefono
email
direccion
facebook
instagram
youtube
historia
mision
vision
foto_1
foto_2
foto_3
foto_4
foto_5
foto_6
```

Decisión vigente:

```text id="blueprint-wordpress-decision"
WordPress es la capa pública, visual e informativa del ecosistema RESIDENT. No será backend transaccional, no almacenará información financiera sensible, no administrará autenticación Core y no será fuente de verdad de pagos, cargos, estados de cuenta, documentos privados, visitantes ni usuarios transaccionales.
```

---

## 6. FASE 2 — RESIDENT Core

RESIDENT Core será el sistema transaccional de administración de conjuntos residenciales.

Objetivo general:

```text id="blueprint-core-objective"
Construir un sistema multitenant, seguro, auditable y API-first que gestione los procesos operativos, financieros, documentales, administrativos y comunitarios de conjuntos residenciales, integrándose con los portales WordPress y preparando una futura evolución a microservicios.
```

Procesos principales:

```text id="blueprint-core-processes"
- tenants;
- usuarios, roles y permisos;
- residentes, propietarios, ocupantes y unidades;
- alícuotas;
- cargos;
- pagos;
- comprobantes;
- estados de cuenta;
- documentos seguros;
- reservas de áreas comunales;
- multas y sanciones;
- comunicados;
- reuniones;
- asistencia;
- votaciones;
- actas certificadas;
- conciliación bancaria;
- pasarelas de pago;
- open banking;
- contabilidad;
- proveedores;
- mantenimiento;
- inventario;
- visitantes y accesos;
- configuraciones por tenant;
- automatizaciones;
- dashboards;
- importación/migración de datos;
- frontend administrativo;
- portal privado del residente.
```

---

## 7. Arquitectura objetivo

Decisión arquitectónica principal:

```text id="blueprint-architecture-decision"
RESIDENT Core iniciará como monolito modular contenerizado, diseñado desde el inicio con límites internos claros, API-first, multitenancy, seguridad y auditoría, preparado para una futura extracción progresiva a microservicios físicos cuando exista justificación técnica, operativa y económica.
```

Vista lógica:

```text id="blueprint-logical-architecture"
WordPress Multitenant Portal
    ↓
Public informational access

Admin Web App / Resident Self-Service
    ↓
Keycloak OIDC/OAuth2
    ↓
RESIDENT Core API
    ↓
PostgreSQL / Redis / Secure Document Storage / Audit
```

Componentes principales:

```text id="blueprint-components"
- WordPress Portal: capa pública informativa.
- Admin Web App: consola privada administrativa.
- Resident Self-Service: portal privado del residente/propietario.
- Keycloak: proveedor de identidad.
- RESIDENT Core API: backend transaccional.
- PostgreSQL: base de datos principal.
- Redis/BullMQ: cache y procesos asíncronos.
- Secure Document Storage: documentos, comprobantes y archivos protegidos.
- OpenAPI: contrato entre backend y frontends.
- GitHub Actions: CI/CD inicial.
```

---

## 8. Stack tecnológico decidido

Backend:

```text id="blueprint-backend-stack"
NestJS
TypeScript
Node.js 24.18.0 LTS
pnpm 11.21.0
main como única rama permanente
Prisma
PostgreSQL
Redis
BullMQ
OpenAPI / Swagger
Jest
Docker
```

Frontend administrativo:

```text id="blueprint-admin-stack"
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
OpenAPI Client
Keycloak OIDC
Vitest
Playwright
```

Frontend residente:

```text id="blueprint-resident-stack"
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
OpenAPI Client
Keycloak OIDC
Vitest
Playwright
```

Identidad y seguridad:

```text id="blueprint-security-stack"
Keycloak
OIDC/OAuth2
Authorization Code Flow with PKCE
RBAC + permissions
Tenant-aware authorization
Resource-level authorization
Property-level authorization
Audit logs
```

Infraestructura inicial:

```text id="blueprint-infra-stack"
Docker
Docker Compose
GitHub Actions
PostgreSQL local
Redis local
Keycloak local
PostgreSQL dedicado de Keycloak
MailHog local
MinIO local
Futura nube: AWS o proveedor equivalente
```

El baseline reproducible de Compose usa las imágenes y tags exactos de ADR-009 §7.1.
No admite `latest`, aliases LTS ni versiones flotantes. MailHog y MinIO son únicamente
locales, con datos sintéticos, y requieren reevaluación antes de ambientes no locales.

---

## 9. Estructura documental actual

Estructura documental principal:

```text id="blueprint-docs-structure"
resident-core/
├── AGENTS.md
├── README.md
└── docs/
    ├── sdd/
    ├── decisions/
    ├── specs/
    ├── changes/
    ├── implementation/
    └── consolidated/
```

Significado de cada carpeta:

```text id="blueprint-doc-folders"
docs/sdd            Principios, arquitectura y reglas globales SDD.
docs/decisions      ADRs — Architecture Decision Records.
docs/specs          Paquetes funcionales SDD numerados.
docs/changes        Cambios transversales relevantes.
docs/implementation Runbooks operativos de implementación.
docs/consolidated   Documentos de lectura consolidada.
```

---

## 10. Estándar documental SDD interno

RESIDENT adopta una convención interna SDD por paquete.

Cada módulo funcional se documenta con:

```text id="blueprint-package-standard"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

Propósito de cada archivo:

| Archivo             | Propósito                                                             |
| ------------------- | --------------------------------------------------------------------- |
| `spec.md`           | Requerimientos funcionales, alcance, reglas y criterios de aceptación |
| `plan.md`           | Diseño técnico y estrategia de implementación                         |
| `data-model.md`     | Entidades, tablas, campos, relaciones y restricciones de datos        |
| `api-contract.md`   | Endpoints, DTOs, permisos, errores y reglas API                       |
| `test-plan.md`      | Estrategia de pruebas del módulo                                      |
| `tasks.md`          | Backlog técnico ejecutable                                            |
| `security-notes.md` | Amenazas, controles, restricciones y gates de seguridad               |

Esta convención no es un estándar universal SDD. Es el estándar interno adoptado para RESIDENT.

---

## 11. Documentos SDD base

Documentos base actuales:

```text id="blueprint-sdd-docs"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
```

Documento recomendado adicional:

```text id="blueprint-doc-standard-recommended"
docs/sdd/documentation-standard.md
```

Propósito de los documentos base:

| Documento                   | Propósito                                             |
| --------------------------- | ----------------------------------------------------- |
| `constitution.md`           | Principios rectores del proyecto                      |
| `domain-map.md`             | Mapa de dominios y bounded contexts                   |
| `architecture.md`           | Arquitectura técnica objetivo                         |
| `security.md`               | Reglas globales de seguridad                          |
| `api-guidelines.md`         | Convenciones API REST/OpenAPI                         |
| `data-governance.md`        | Gobierno de datos, privacidad y manejo de información |
| `documentation-standard.md` | Convención interna documental SDD                     |

---

## 12. ADRs vigentes

ADRs definidos:

```text id="blueprint-adrs"
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

Resumen de decisiones:

| ADR     | Decisión                                                      |
| ------- | ------------------------------------------------------------- |
| ADR-001 | Monolito modular contenerizado, preparado para microservicios |
| ADR-002 | NestJS + TypeScript como framework backend                    |
| ADR-003 | PostgreSQL + Prisma como estrategia de datos                  |
| ADR-004 | Multitenancy shared schema + `tenant_id`                      |
| ADR-005 | Autenticación propia temporal posible, objetivo Keycloak      |
| ADR-006 | Keycloak como proveedor de identidad objetivo                 |
| ADR-007 | Core autoriza; Keycloak autentica                             |
| ADR-008 | API Gateway progresivo                                        |
| ADR-009 | Docker/local primero, nube futura                             |
| ADR-010 | Observabilidad progresiva                                     |
| ADR-011 | Testing obligatorio por capas                                 |
| ADR-012 | CI/CD con gates de calidad, seguridad y contratos             |

---

## 13. Cambio transversal Keycloak

Documento de cambio:

```text id="blueprint-keycloak-change"
docs/changes/KEYCLOAK-001-docs-impact.md
```

Documento consolidado:

```text id="blueprint-keycloak-consolidated"
docs/consolidated/RESIDENT_Core_Keycloak_Docs_Consolidated.md
```

Decisión vigente:

```text id="blueprint-keycloak-decision"
Keycloak será el proveedor de identidad objetivo. Keycloak autentica usuarios mediante OIDC/OAuth2; RESIDENT Core conserva la autorización de negocio mediante tenant, rol, permiso, unidad, recurso y regla específica.
```

Reglas clave:

```text id="blueprint-keycloak-rules"
- Keycloak no reemplaza la autorización de negocio del Core.
- Core debe mapear keycloakSubjectId a UserProfile.
- Frontends deben usar Authorization Code Flow with PKCE.
- No usar implicit flow.
- No usar sesión WordPress para Core.
- No delegar permisos de negocio exclusivamente a roles Keycloak.
```

---

## 14. Paquetes SDD especificados

Inventario documental presente; el estado refleja revisión formal, no calendario de implementación:

| Spec ID | Paquete                        | Estado documental |
| ------: | ------------------------------ | ------------------ |
|     001 | `tenants`                      | needs-review |
|     002 | `users-roles`                  | needs-review |
|     003 | `residents-properties`         | needs-review |
|     004 | `dues-fees`                    | needs-review |
|     005 | `payments`                     | needs-review |
|     006 | `account-statements`           | needs-review |
|     007 | `audit`                        | needs-review |
|     008 | `basic-reports`                | needs-review |
|     009 | `wordpress-integration-basic`  | needs-review |
|     010 | `reservations-common-areas`    | needs-review |
|     011 | `fines-sanctions`              | needs-review |
|     012 | `communications-notifications` | needs-review |
|     013 | `meetings-attendance`          | needs-review |
|     014 | `voting-basic`                 | needs-review |
|     015 | `certified-minutes`            | needs-review |
|     016 | `secure-document-storage`      | needs-review |
|     017 | `bank-reconciliation`          | needs-review |
|     018 | `payment-provider-integration` | needs-review |
|     019 | `open-banking-integration`     | needs-review |
|     020 | `accounting-ledger`            | needs-review |
|     021 | `supplier-payments`            | needs-review |
|     022 | `maintenance-work-orders`      | needs-review |
|     023 | `inventory-basic`              | needs-review |
|     024 | `access-control-visitors`      | needs-review |
|     025 | `tenant-settings-policies`     | needs-review |
|     026 | `automation-workflows-basic`   | needs-review |
|     027 | `dashboard-kpis`               | needs-review |
|     028 | `data-import-migration`        | needs-review |
|     029 | `admin-web-app-basic`          | needs-review |
|     030 | `resident-self-service-basic`  | needs-review |
|     031 | `implementation-readiness`     | complete |

---

## 15. Clasificación de módulos

### 15.1. Núcleo obligatorio MVP

```text id="blueprint-mvp-core"
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

### 15.2. Operación comunitaria MVP extendido

```text id="blueprint-mvp-extended"
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

### 15.3. Finanzas avanzadas

```text id="blueprint-advanced-finance"
017-bank-reconciliation
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
```

### 15.4. Operación avanzada y automatización

```text id="blueprint-advanced-operations"
023-inventory-basic
026-automation-workflows-basic
```

---

## 16. Bounded contexts principales

Mapa funcional de alto nivel:

```text id="blueprint-domain-map"
RESIDENT Core
├── Platform Management
├── Tenant Management
├── Identity and Access
├── Residents and Properties
├── Financial Management
├── Payments and Reconciliation
├── Reservations and Rentals
├── Fines and Sanctions
├── Meetings and Attendance
├── Communications and Notifications
├── Reporting and Analytics
├── Audit and Compliance
└── External Integrations
```

---

## 17. Decisiones críticas vigentes

### 17.1. Arquitectura

```text id="blueprint-critical-architecture"
- Monolito modular primero.
- Microservicios físicos después, solo si se justifica.
- API-first.
- Docker desde el inicio.
- Separación clara entre Core, Admin Web, Resident Web y WordPress.
```

### 17.2. Datos

```text id="blueprint-critical-data"
- PostgreSQL como base principal.
- Prisma como ORM.
- UUID como identificador base.
- Decimal para dinero.
- tenant_id obligatorio en entidades tenant-scoped.
- Estados de cuenta derivados de cargos y pagos.
- Auditoría obligatoria en operaciones críticas.
```

### 17.3. Seguridad

```text id="blueprint-critical-security"
- Keycloak autentica.
- Core autoriza.
- Tenant isolation obligatorio.
- Resource-level authorization obligatorio.
- Property-level authorization para self-service.
- No storageKey en APIs o UI.
- No secretos en logs.
- No datos reales a IA externa.
```

### 17.4. WordPress

```text id="blueprint-critical-wordpress"
- WordPress es portal público informativo.
- WordPress no es backend transaccional.
- WordPress no autentica Core.
- WordPress no maneja estados de cuenta privados.
- WordPress no recibe comprobantes privados.
- WordPress no administra visitantes privados.
```

### 17.5. Frontends

```text id="blueprint-critical-frontends"
- Admin Web App es aplicación privada separada.
- Resident Self-Service es aplicación privada separada.
- Ambas consumen Core API por OpenAPI.
- Ninguna accede directo a DB.
- Ninguna usa Prisma.
- Ninguna calcula saldos finales.
- Ninguna expone storageKey.
```

---

## 18. Estructura objetivo de implementación

Estructura técnica esperada después de Sprint 0:

```text id="blueprint-target-repo"
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
│   ├── implementation/
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
├── .node-version
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── AGENTS.md
└── README.md
```

---

## 19. Sprint 0 — Fundación técnica

Documento operativo:

```text id="blueprint-sprint0-doc"
docs/implementation/sprint-0-foundation.md
```

Objetivo de Sprint 0:

```text id="blueprint-sprint0-objective"
Crear la fundación técnica del repositorio con main como única rama permanente, Node.js 24.18.0 y pnpm 11.21.0: monorepo, scaffolds compilables de apps, packages base, Docker Compose con resident-api, postgres, redis, keycloak, keycloak-postgres, mailhog y minio, schema Prisma con generator y datasource sin modelos de dominio ni PrismaService, tooling OpenAPI sin runtime, CI con los gates obligatorios de ADR-012 §10, README, .env.example y estructura de trabajo.
```

La frontera normativa está definida en
`docs/implementation/sprint-0-foundation.md`: ConfigModule, ValidationPipe,
ExceptionFilter, logger de aplicación, HealthModule, PrismaService y Swagger/OpenAPI
runtime pertenecen a Sprint 1. Ninguno de los dos sprints autoriza lógica de negocio sin
la spec y el sprint funcional correspondientes.

Sprint 0 no debe implementar:

```text id="blueprint-sprint0-forbidden"
- lógica de negocio productiva;
- pagos reales;
- residentes reales;
- alícuotas reales;
- estados de cuenta reales;
- reservas reales;
- visitantes reales;
- documentos privados reales;
- pasarelas de pago reales;
- open banking real;
- hardware;
- biometría;
- rutas públicas transaccionales.
```

---

## 20. Orden recomendado de implementación

### Wave 0 — Fundación

```text id="blueprint-wave0"
- Monorepo.
- main como única rama permanente; master legacy se renombra antes de CI/remoto.
- Node.js 24.18.0 y pnpm 11.21.0.
- packages/shared, packages/config, packages/auth, packages/openapi-client y packages/testing como scaffolds/tooling.
- Docker Compose.
- PostgreSQL.
- Redis.
- Keycloak local.
- PostgreSQL dedicado de Keycloak.
- MailHog local.
- MinIO local.
- NestJS scaffold compilable.
- Next.js apps base.
- Schema Prisma de configuración sin modelos, enums, migraciones ni seeds de dominio.
- CI inicial con quality, tests, contracts-data, security y build.
- Compuerta 031 en Markdown/Git, sin API ni persistencia runtime de readiness.
```

### Wave 1 — Plataforma backend; después tenants e identidad

```text id="blueprint-wave1"
Sprint 1 — Backend Platform Base
ConfigModule
ValidationPipe
ExceptionFilter
Logger sanitizado
HealthModule: liveness pública y readiness protegida según ADR-010 §10
PrismaService y conexión de aplicación
Swagger/OpenAPI runtime y generación de contrato
Auth/Tenant/Permission/Audit skeletons

Sprint 2 — Tenants e identidad
001-tenants
002-users-roles
Keycloak integration
TenantGuard
PermissionGuard
Audit base
```

`Tenant` y sus entidades relacionadas nacen con 001; `UserProfile`, roles, permisos y
memberships nacen con 002. Sprint 0 no adelanta esos modelos.

### Wave 2 — Residentes, unidades y finanzas base

```text id="blueprint-wave2"
003-residents-properties
004-dues-fees
005-payments
006-account-statements
016-secure-document-storage
007-audit
```

### Wave 3 — Frontends MVP

```text id="blueprint-wave3"
029-admin-web-app-basic
030-resident-self-service-basic
OpenAPI client generation
Tenant selector
Property/unit selector
```

### Wave 4 — Operación comunitaria

```text id="blueprint-wave4"
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
022-maintenance-work-orders
024-access-control-visitors
```

### Wave 5 — Reportes, dashboards e importación

```text id="blueprint-wave5"
008-basic-reports
027-dashboard-kpis
028-data-import-migration
026-automation-workflows-basic
023-inventory-basic
```

### Wave 6 — Finanzas avanzadas

```text id="blueprint-wave6"
017-bank-reconciliation
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
```

---

## 21. Reglas de seguridad obligatorias

```text id="blueprint-security-rules"
- No usar datos reales en desarrollo local.
- No subir secretos al repositorio.
- No subir .env reales.
- No exponer storageKey.
- No exponer signedUrl persistente.
- No usar WordPress como backend transaccional.
- No crear rutas públicas administrativas.
- No crear rutas públicas resident-facing transaccionales.
- No permitir pagos sin auditoría.
- No permitir estados de cuenta como fuente primaria independiente.
- No permitir que el frontend calcule saldos finales.
- No permitir que el frontend valide pagos administrativamente.
- No permitir que Keycloak reemplace autorización de negocio.
- No enviar datos reales a IA externa.
- No conectar pasarelas reales sin ADR y security-notes.
- No conectar open banking real sin ADR y security-notes.
```

---

## 22. Readiness actual

El paquete `031-implementation-readiness` fue creado para validar que el proyecto esté listo para pasar de SDD a implementación.

Estado actual:

```text id="blueprint-readiness-state"
Implementation Readiness: reevaluado formalmente el 2026-08-10.
Decisión vigente: GO para iniciar implementación técnica de Sprint 0.
Evidencia: docs/changes/READINESS-031-2026-08-10.md.
Motivo: todos los criterios obligatorios de GO están sustentados y no existen gaps
críticos o altos abiertos.
Definition of Done técnico de Sprint 0: PASS el 2026-08-11.
Cierre formal de Sprint 0: PASS el 2026-08-11.
Evidencia de cierre: docs/changes/SPRINT-0-CLOSURE-2026-08-11.md.
Readiness de Sprint 1: GO el 2026-08-11.
Plan autorizado: docs/implementation/sprint-1-backend-platform-base.md.
Evidencia: docs/changes/READINESS-SPRINT-1-2026-08-11.md.
```

Condición:

```text id="blueprint-readiness-condition"
Sprint 0 fue ejecutado dentro del alcance estricto de su runbook y queda formalmente
cerrado. Sprint 1 queda autorizado solo para Backend Platform Base. Sprint 2 y la lógica
de negocio permanecen fuera de alcance y requieren sus specs y compuertas correspondientes.
```

---

## 23. Riesgos pendientes

| Riesgo                                        |   Nivel | Mitigación                                    |
| --------------------------------------------- | ------: | --------------------------------------------- |
| Documentos fuente y consolidado se desalinean |   Medio | El consolidado no reemplaza documentos fuente |
| Codex/Claude Code implementa más de lo pedido |    Alto | Prompts restrictivos por Sprint               |
| Se empieza lógica de negocio en Sprint 0      |    Alto | Sprint 0 solo fundación                       |
| Se usa WordPress como backend transaccional   | Crítico | Gate de seguridad                             |
| Se expone `storageKey`                        | Crítico | Contract tests y security-notes               |
| Se modela dinero con `float`                  | Crítico | Usar Decimal en Prisma/PostgreSQL             |
| Se omite `tenant_id`                          | Crítico | TenantGuard + data-model reviews              |
| Frontend consume endpoints improvisados       |    Alto | OpenAPI obligatorio                           |
| No se ejecutan pruebas en CI                  |    Alto | GitHub Actions mínimo                         |
| Datos reales en desarrollo local              |    Alto | Usar datos ficticios o anonimizados           |

---

## 24. Checklist antes de codificar

Antes de implementar Sprint 0:

```text id="blueprint-pre-code-checklist"
[x] Corregir nombres de carpetas.
[x] Confirmar que docs/specs/031-implementation-readiness existe correctamente escrito.
[x] Confirmar que cada paquete 001-031 tiene 7 documentos.
[x] Crear o actualizar docs/sdd/documentation-standard.md.
[x] Crear o actualizar docs/specs/SPECS_INDEX.md.
[x] Crear este Project Blueprint.
[x] Completar README.md.
[x] Confirmar que no hay secretos en el repositorio.
[x] Confirmar que no hay datos reales.
[x] Confirmar que Sprint 0 no incluye lógica de negocio.
```

---

## 25. Prompt recomendado para Codex o Claude Code

Estado de uso:

```text
HABILITADO para Sprint 0 por READINESS-031-2026-08-10, con decisión GO.
```

Este prompt puede usarse como instrucción inicial para ejecutar exclusivamente la
fundación técnica autorizada de Sprint 0:

```text id="blueprint-agent-prompt"
Lee primero:

- docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md
- docs/implementation/sprint-0-foundation.md
- docs/sdd/constitution.md
- docs/sdd/architecture.md
- docs/sdd/security.md
- docs/sdd/api-guidelines.md
- docs/sdd/data-governance.md
- docs/decisions/ADR-001-architecture-style.md
- docs/decisions/ADR-004-multitenancy-strategy.md
- docs/decisions/ADR-006-identity-provider-strategy.md
- docs/decisions/ADR-007-authorization-strategy.md
- docs/decisions/ADR-011-testing-strategy.md
- docs/decisions/ADR-012-ci-cd-strategy.md

Implementa únicamente Sprint 0.

Limita apps/api a un scaffold compilable. Crea el schema Prisma solo con generator y
datasource, sin modelos, enums, migraciones ni seeds de dominio. Prepara tooling de
OpenAPI, pero no implementes ConfigModule, ValidationPipe, ExceptionFilter, logger de aplicación,
HealthModule, PrismaService, Swagger/OpenAPI runtime ni endpoints de documentación;
esos componentes pertenecen a Sprint 1.

Crea la estructura base del monorepo RESIDENT Core:

- apps/api
- apps/admin-web
- apps/resident-web
- packages/shared
- packages/config
- packages/auth
- packages/openapi-client
- packages/testing
- infra
- prisma
- tools
- .github/workflows

Crea también:

- package.json raíz
- pnpm-workspace.yaml
- .node-version con 24.18.0
- tsconfig.base.json
- .env.example
- .gitignore
- docker-compose.yml
- README.md base
- schema.prisma configuration-only, sin modelos de dominio
- CI con los gates obligatorios de ADR-012 §10

No implementes lógica de negocio todavía.
No implementes pagos.
No implementes residentes.
No implementes alícuotas.
No implementes estados de cuenta.
No implementes reservas.
No implementes visitantes.
No uses datos reales.
No expongas storageKey.
No uses WordPress como backend transaccional.
No crees rutas públicas administrativas.
No crees rutas públicas resident-facing transaccionales.

Al finalizar, ejecuta:

- pnpm install
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm build

Corrige únicamente errores mínimos de configuración.
Entrega resumen de archivos creados, comandos ejecutados, errores encontrados y próximos pasos.
```

---

## 26. Archivos recomendados adicionales

Aunque el expediente principal está estructurado, su revisión formal continúa. Se recomienda crear o mantener:

```text id="blueprint-recommended-files"
docs/sdd/documentation-standard.md
docs/specs/SPECS_INDEX.md
docs/implementation/sprint-1-backend-platform-base.md
```

Propósito:

| Archivo                             | Propósito                                 |
| ----------------------------------- | ----------------------------------------- |
| `documentation-standard.md`         | Formalizar el estándar documental interno |
| `SPECS_INDEX.md`                    | Índice navegable de todos los paquetes    |
| `sprint-1-backend-platform-base.md` | Runbook autorizado de Sprint 1            |

---

## 27. Próximo paso recomendado

El siguiente paso técnico autorizado es:

```text id="blueprint-next-step"
Implementar el PR 1 de Sprint 1: configuración y bootstrap seguro.
```

Archivo guía:

```text id="blueprint-next-doc"
docs/implementation/sprint-1-backend-platform-base.md
```

El runbook `docs/implementation/sprint-0-foundation.md` fue ejecutado conforme a la
decisión `GO` de `READINESS-031-2026-08-10`. El Definition of Done técnico y el cierre
formal cumplen; no existen gaps de cierre abiertos. Sprint 1 fue evaluado mediante
`READINESS-SPRINT-1-2026-08-11` y obtuvo `GO` para su alcance técnico estricto.

Acciones inmediatas:

```text id="blueprint-next-actions"
1. Crear una rama corta desde main para el PR 1.
2. Implementar configuración y bootstrap seguro sin lógica de negocio.
3. Ejecutar los gates correspondientes y abrir un PR protegido.
```

---

## 28. Cierre

RESIDENT Core queda actualmente delineado como un sistema:

```text id="blueprint-closing"
multitenant
API-first
modular
contenedorizado
seguro
auditable
preparado para microservicios futuros
integrado con WordPress solo como portal público
autenticado con Keycloak
autorizado por Core
documentado bajo SDD
con la fundación técnica de Sprint 0 implementada y cerrada formalmente
```

Este documento constituye el baseline consolidado de RESIDENT Core al cierre de la fase documental SDD inicial.

---
