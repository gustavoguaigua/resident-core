# SDD Project Kickoff Prompt Template

> **REFERENCE ONLY — DO NOT EXECUTE**
>
> Este archivo es una plantilla reutilizable para iniciar futuros proyectos con Spec Driven Development.
>
> No forma parte de los requerimientos activos de RESIDENT Core.
>
> Codex, Claude Code, Cursor u otros agentes de IA no deben usar este archivo como instrucción activa del proyecto, salvo que el usuario lo solicite explícitamente.
>
> Para implementar RESIDENT Core, usar como fuentes activas:
>
> - `docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md`
> - `docs/specs/SPECS_INDEX.md`
> - `docs/sdd/constitution.md`
> - `docs/sdd/architecture.md`
> - `docs/sdd/security.md`
> - `docs/sdd/api-guidelines.md`
> - `docs/sdd/data-governance.md`
> - `docs/implementation/sprint-0-foundation.md`

## ---------------------------------------
## INICIO DEL PROMPT INICIAL DEL PROYECTO
## ---------------------------------------

Actúa como un arquitecto senior de software, experto en desarrollo de aplicaciones empresariales, ingeniería de software, arquitectura cloud, sistemas multitenant, seguridad, APIs, inteligencia artificial aplicada al desarrollo y metodología Spec Driven Development — SDD.

Estoy desarrollando el proyecto **RESIDENT**, una plataforma digital para la administración de conjuntos residenciales.

## 1. Contexto general del proyecto

RESIDENT tiene dos fases principales:

### FASE 1 — Portal multitenant WordPress

La FASE 1 ya está implementada y funcional en:

```text
https://www.resident.gustavoguaigua.com
```

Esta fase consiste en un portal multitenant desarrollado con WordPress, donde cada conjunto residencial tiene su página pública con información general, logo, banner, slogan, datos de contacto, historia, misión, visión, redes sociales e imágenes.

El portal WordPress debe mantenerse como una **capa pública informativa**, no como backend transaccional.

Reglas obligatorias para WordPress:

```text
- WordPress no debe procesar pagos.
- WordPress no debe almacenar estados de cuenta.
- WordPress no debe almacenar comprobantes privados.
- WordPress no debe administrar residentes del Core.
- WordPress no debe autenticar usuarios del Core.
- WordPress no debe actuar como consola administrativa.
- WordPress no debe actuar como portal privado del residente.
- WordPress podrá enlazar o consumir información pública controlada desde RESIDENT Core mediante APIs seguras.
```

### FASE 2 — RESIDENT Core

Ahora quiero iniciar la FASE 2, que consiste en construir el sistema transaccional central para administrar cada conjunto residencial.

El sistema debe gestionar, como mínimo:

```text
- tenants / conjuntos residenciales;
- usuarios, roles y permisos;
- residentes, propietarios, ocupantes y unidades habitacionales;
- alícuotas, cargos, rubros y cuotas;
- pagos y comprobantes;
- estados de cuenta;
- reservas de áreas comunales;
- multas y sanciones;
- comunicados y notificaciones;
- reuniones, asistencia, votaciones y actas;
- documentos seguros;
- mantenimiento;
- visitantes y control de accesos;
- reportes básicos;
- dashboards e indicadores;
- importación y migración de datos;
- automatizaciones;
- auditoría;
- integración con WordPress;
- futura integración con pasarelas de pago, conciliación bancaria, open banking y contabilidad.
```

## 2. Objetivo del trabajo

Quiero construir RESIDENT Core usando **Spec Driven Development — SDD**.

Antes de escribir código, quiero que me ayudes a crear de forma ordenada todo el expediente documental SDD del proyecto, incluyendo arquitectura, decisiones técnicas, especificaciones funcionales, modelos de datos, contratos API, planes de prueba, tareas, notas de seguridad y preparación para implementación.

No quiero empezar generando código directamente. Primero quiero especificar correctamente.

## 3. Arquitectura objetivo

La arquitectura inicial recomendada debe ser:

```text
- Monolito modular contenerizado.
- Preparado para evolucionar a microservicios físicos en una fase posterior.
- API-first.
- Multitenant desde el diseño.
- Backend separado de WordPress.
- Frontend administrativo separado de WordPress.
- Portal privado del residente separado de WordPress.
- Integración futura con WordPress mediante REST o GraphQL.
```

Stack tecnológico sugerido inicialmente:

```text
Backend: NestJS + TypeScript
Base de datos: PostgreSQL
ORM: Prisma
Cache / colas: Redis + BullMQ
Autenticación: Keycloak como IdP objetivo
Autorización: tenant-aware RBAC + permissions + resource-level authorization en Core
API contract: OpenAPI
Admin Web App: Next.js + React + TypeScript
Resident Self-Service: Next.js + React + TypeScript
Contenedores: Docker + Docker Compose
CI/CD: GitHub Actions
Testing: Jest / Vitest / Playwright
Cloud futuro: AWS
```

Reglas clave:

```text
- Keycloak autentica.
- RESIDENT Core autoriza.
- El frontend no decide reglas de negocio.
- WordPress no es backend transaccional.
- Todo movimiento financiero debe ser auditable.
- Todo dato tenant-scoped debe respetar tenant isolation.
- No se debe exponer storageKey.
- No se deben enviar datos reales a IA externa.
- No se deben usar datos reales en ambiente local.
```

## 4. Metodología de trabajo

Trabajaremos con Spec Driven Development.

Quiero que el proceso siga este flujo:

```text
1. Definir documentos SDD base.
2. Definir ADRs.
3. Definir mapa de dominios y módulos.
4. Crear especificaciones funcionales por paquete.
5. Para cada paquete crear:
   - spec.md
   - plan.md
   - data-model.md
   - api-contract.md
   - test-plan.md
   - tasks.md
   - security-notes.md
6. Crear documentos de control:
   - SPECS_INDEX.md
   - Project Blueprint
   - Documentation Standard
   - Sprint 0 Foundation
7. Solo después iniciar implementación técnica.
```

Trabaja en español técnico, con Markdown claro, listo para copiar y pegar en archivos `.md`.

Cuando generes documentos, incluye siempre la ruta sugerida del archivo.

No generes archivos físicos salvo que te lo pida expresamente. Dame el contenido completo del archivo para copiarlo.

## 5. Estructura documental deseada

Quiero usar esta estructura documental:

```text
resident-core/
├── README.md
└── docs/
    ├── sdd/
    │   ├── constitution.md
    │   ├── domain-map.md
    │   ├── architecture.md
    │   ├── security.md
    │   ├── api-guidelines.md
    │   ├── data-governance.md
    │   └── documentation-standard.md
    │
    ├── decisions/
    │   ├── ADR-001-architecture-style.md
    │   ├── ADR-002-backend-framework.md
    │   ├── ADR-003-database-strategy.md
    │   ├── ADR-004-multitenancy-strategy.md
    │   ├── ADR-005-authentication-strategy.md
    │   ├── ADR-006-identity-provider-strategy.md
    │   ├── ADR-007-authorization-strategy.md
    │   ├── ADR-008-api-gateway-strategy.md
    │   ├── ADR-009-deployment-strategy.md
    │   ├── ADR-010-observability-strategy.md
    │   ├── ADR-011-testing-strategy.md
    │   └── ADR-012-ci-cd-strategy.md
    │
    ├── specs/
    │   ├── SPECS_INDEX.md
    │   ├── 001-tenants/
    │   ├── 002-users-roles/
    │   ├── 003-residents-properties/
    │   ├── 004-dues-fees/
    │   ├── 005-payments/
    │   ├── 006-account-statements/
    │   ├── 007-audit/
    │   ├── 008-basic-reports/
    │   ├── 009-wordpress-integration-basic/
    │   ├── 010-reservations-common-areas/
    │   ├── 011-fines-sanctions/
    │   ├── 012-communications-notifications/
    │   ├── 013-meetings-attendance/
    │   ├── 014-voting-basic/
    │   ├── 015-certified-minutes/
    │   ├── 016-secure-document-storage/
    │   ├── 017-bank-reconciliation/
    │   ├── 018-payment-provider-integration/
    │   ├── 019-open-banking-integration/
    │   ├── 020-accounting-ledger/
    │   ├── 021-supplier-payments/
    │   ├── 022-maintenance-work-orders/
    │   ├── 023-inventory-basic/
    │   ├── 024-access-control-visitors/
    │   ├── 025-tenant-settings-policies/
    │   ├── 026-automation-workflows-basic/
    │   ├── 027-dashboard-kpis/
    │   ├── 028-data-import-migration/
    │   ├── 029-admin-web-app-basic/
    │   ├── 030-resident-self-service-basic/
    │   └── 031-implementation-readiness/
    │
    ├── changes/
    │   └── KEYCLOAK-001-docs-impact.md
    │
    ├── implementation/
    │   └── sprint-0-foundation.md
    │
    └── consolidated/
        ├── RESIDENT_Core_Keycloak_Docs_Consolidated.md
        └── RESIDENT_Core_Project_Blueprint_v0.1.md
```

Cada paquete dentro de `docs/specs/` debe contener:

```text
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

## 6. Documentos iniciales a crear

Primero quiero que me ayudes a crear los documentos base:

```text
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/sdd/documentation-standard.md
```

Luego quiero crear los ADRs:

```text
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

Después quiero crear las specs funcionales del 001 al 031.

## 7. Reglas de seguridad obligatorias

Aplica estas reglas en todos los documentos:

```text
- Todo debe ser tenant-scoped cuando aplique.
- No se debe permitir cross-tenant access.
- No se debe aceptar tenantId desde cliente como autoridad final.
- No se deben aceptar actor fields desde cliente.
- No se debe exponer storageKey.
- No se deben exponer signedUrl persistentes.
- No se deben registrar secretos en logs.
- No se debe usar WordPress como backend transaccional.
- No se debe usar sesión WordPress para Core.
- No se deben crear rutas públicas administrativas.
- No se deben crear rutas públicas resident-facing transaccionales.
- No se deben validar pagos desde Resident Self-Service.
- No se deben crear asientos contables fuera del módulo autorizado.
- No se debe confirmar conciliación bancaria fuera del módulo autorizado.
- No se debe controlar hardware físico en MVP.
- No se debe usar biometría ni reconocimiento facial en MVP.
- No se deben enviar datos reales a IA externa.
```

## 8. Reglas de arquitectura

Aplica estas decisiones salvo que se indique lo contrario:

```text
- Iniciar con monolito modular, no microservicios físicos.
- Preparar límites de módulos para futura extracción a microservicios.
- Usar PostgreSQL con shared schema y tenant_id.
- Usar Prisma.
- Usar Decimal para dinero.
- Usar UUID como identificador base.
- Usar OpenAPI como contrato entre backend y frontends.
- Usar Keycloak como proveedor de identidad objetivo.
- Resolver autorización de negocio dentro de RESIDENT Core.
- Mantener auditoría obligatoria para operaciones críticas.
- Mantener WordPress como portal público informativo.
```

## 9. Módulos esperados

Crea el proyecto alrededor de estos módulos:

```text
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

## 10. Prioridad de implementación

Clasifica los módulos de esta forma:

### Núcleo obligatorio MVP

```text
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

### Operación comunitaria MVP extendido

```text
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
022-maintenance-work-orders
024-access-control-visitors
```

### Reportes, dashboards, importación e integración portal

```text
008-basic-reports
009-wordpress-integration-basic
023-inventory-basic
027-dashboard-kpis
028-data-import-migration
```

### Finanzas e integraciones avanzadas Post-MVP

```text
017-bank-reconciliation
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
026-automation-workflows-basic
```

## 11. Orden esperado de implementación

Propón y documenta este orden:

```text
Sprint 0 — Fundación técnica
Sprint 1 — Backend Platform Base
Sprint 2 — Tenants, usuarios, roles, permisos y Keycloak
Sprint 3 — Residentes, propiedades y finanzas base
Sprint 4 — Admin Web App MVP
Sprint 5 — Resident Self-Service MVP
Sprint 6 — Operación comunitaria básica
Sprint 7 — Gobernanza, reportes, dashboards e importación
Post-MVP — Finanzas avanzadas, open banking, contabilidad y automatizaciones avanzadas
```

## 12. Formato de respuesta esperado

Cuando genere un documento, responde así:

```text
Continuamos con:

ruta/del/documento.md

[contenido completo en Markdown]
```

Cada documento debe incluir:

```text
- título;
- información del documento;
- propósito;
- alcance;
- reglas centrales;
- decisiones;
- modelos o contratos si aplica;
- criterios de aceptación;
- no aceptación;
- resultado esperado;
- expediente actualizado.
```

No resumas documentos críticos. Entrega contenido completo, claro y listo para copiar.

## 13. Estilo de trabajo

Trabaja de forma incremental.

No intentes generar todo el proyecto en una sola respuesta. Guíame por pasos.

Cada vez que termines un documento, sugiere el siguiente documento lógico.

No preguntes por detalles menores si puedes asumirlos razonablemente.

Si hay una decisión importante, explícala y recomiéndame una opción.

Si detectas contradicciones, gaps o riesgos, indícalos explícitamente.

## 14. Resultado final esperado de esta fase

Al finalizar esta fase SDD quiero tener:

```text
- expediente SDD completo;
- documentos base completos;
- ADRs completos;
- specs 001-031 completas;
- SPECS_INDEX.md;
- documentation-standard.md;
- RESIDENT_Core_Project_Blueprint_v0.1.md;
- README.md;
- sprint-0-foundation.md;
- estructura clara para que Codex, Claude Code o un desarrollador humano puedan iniciar implementación sin improvisar.
```

## 15. Primer entregable que debes generar

Empieza creando:

```text
docs/sdd/constitution.md
```

Antes de generarlo, propón brevemente la estructura general del expediente SDD y confirma el orden de creación de documentos.


## ---------------------------------------
## FIN DEL PROMPT INICIAL DEL PROYECTO
## ---------------------------------------
