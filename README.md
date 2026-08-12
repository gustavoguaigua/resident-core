# RESIDENT Core

## 1. Descripción general

**RESIDENT Core** es el sistema transaccional de la plataforma RESIDENT para la administración de conjuntos residenciales.

El proyecto forma parte de la **FASE 2** de RESIDENT y tiene como objetivo construir el núcleo informático que gestionará procesos como:

```text
- tenants / conjuntos residenciales;
- usuarios, roles y permisos;
- residentes, propietarios y unidades habitacionales;
- alícuotas, cargos y rubros;
- pagos y comprobantes;
- estados de cuenta;
- reservas de áreas comunales;
- multas y sanciones;
- comunicados y notificaciones;
- reuniones, asistencia, votaciones y actas;
- documentos seguros;
- mantenimiento;
- visitantes y control de accesos;
- reportes, dashboards e indicadores;
- importación de datos;
- automatizaciones;
- auditoría.
```

RESIDENT Core será la fuente de verdad transaccional del sistema. El portal WordPress multitenant existente funcionará como capa pública informativa y se integrará con Core mediante APIs controladas.

---

## 2. Estado actual del proyecto

```text
Estado: Sprint 0 cerrado; Sprint 1 Backend Platform Base autorizado
Fase actual: FASE 2 — RESIDENT Core
Metodología: Spec Driven Development — SDD
Arquitectura inicial: Monolito modular contenerizado
Evolución futura: Microservicios físicos cuando el dominio y la operación lo justifiquen
```

La fase documental SDD inicial ya cuenta con:

```text
- documentos SDD base;
- ADRs arquitectónicos;
- especificaciones funcionales 001-031;
- contratos API;
- modelos de datos;
- planes de prueba;
- tareas;
- notas de seguridad;
- blueprint consolidado;
- índice maestro de specs;
- runbook de Sprint 0;
- runbook y compuerta de readiness de Sprint 1.
```

---

## 3. Relación con la FASE 1

La **FASE 1** del proyecto RESIDENT corresponde al portal multitenant construido con WordPress.

Portal actual:

```text
https://www.resident.gustavoguaigua.com
```

El portal WordPress permite presentar información pública de cada conjunto residencial, pero no debe procesar información transaccional sensible.

Reglas clave:

```text
- WordPress no es backend transaccional.
- WordPress no almacena pagos, saldos, comprobantes ni documentos privados.
- WordPress no autentica usuarios de RESIDENT Core.
- WordPress no reemplaza Admin Web App ni Resident Self-Service.
- WordPress consume o enlaza información controlada desde RESIDENT Core mediante APIs seguras.
```

---

## 4. Arquitectura objetivo

La arquitectura inicial recomendada es:

```text
WordPress Multitenant Portal
        ↓
Public information / links
        ↓
Admin Web App / Resident Web App
        ↓
Keycloak
        ↓
RESIDENT Core API
        ↓
PostgreSQL / Redis / Secure Storage / Audit
```

Decisiones principales:

```text
- Backend con NestJS y TypeScript.
- Base de datos PostgreSQL.
- ORM Prisma.
- Redis y BullMQ para cache, colas y procesos asíncronos.
- Keycloak como proveedor de identidad.
- OpenAPI como contrato entre backend y frontends.
- Admin Web App independiente de WordPress.
- Resident Self-Service independiente de WordPress.
- Docker para entorno local y despliegue progresivo.
- Monolito modular como punto de partida.
- Preparación arquitectónica para microservicios futuros.
```

---

## 5. Stack tecnológico previsto

```text
Runtime: Node.js 24.18.0 LTS
Package manager: pnpm 11.21.0
Branch strategy: main como única rama permanente; ramas cortas mediante pull request
Backend: NestJS + TypeScript
Database: PostgreSQL
ORM: Prisma
Cache / Queues: Redis + BullMQ
Identity Provider: Keycloak
API Contract: OpenAPI
Admin Frontend: Next.js + React + TypeScript
Resident Frontend: Next.js + React + TypeScript
Containerization: Docker + Docker Compose
CI/CD: GitHub Actions
Testing: Jest / Vitest / Playwright
Documentation: Markdown + SDD
```

---

## 6. Estructura actual del repositorio

```text
resident-core/
├── AGENTS.md
├── README.md
├── apps/
├── packages/
├── docs/
├── infra/
├── prisma/
├── .github/workflows/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 7. Estructura objetivo después de Sprint 0

```text
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

## 8. Documentación principal

### 8.1. Documentos SDD base

```text
docs/sdd/
├── constitution.md
├── domain-map.md
├── architecture.md
├── security.md
├── api-guidelines.md
├── data-governance.md
└── documentation-standard.md
```

Estos documentos contienen las reglas globales del proyecto.

---

### 8.2. ADRs

```text
docs/decisions/
├── ADR-001-architecture-style.md
├── ADR-002-backend-framework.md
├── ADR-003-database-strategy.md
├── ADR-004-multitenancy-strategy.md
├── ADR-005-authentication-strategy.md
├── ADR-006-identity-provider-strategy.md
├── ADR-007-authorization-strategy.md
├── ADR-008-api-gateway-strategy.md
├── ADR-009-deployment-strategy.md
├── ADR-010-observability-strategy.md
├── ADR-011-testing-strategy.md
└── ADR-012-ci-cd-strategy.md
```

Los ADRs documentan decisiones arquitectónicas relevantes, su contexto y consecuencias.

---

### 8.3. Especificaciones funcionales

```text
docs/specs/
├── SPECS_INDEX.md
├── 001-tenants/
├── 002-users-roles/
├── 003-residents-properties/
├── 004-dues-fees/
├── 005-payments/
├── 006-account-statements/
├── 007-audit/
├── 008-basic-reports/
├── 009-wordpress-integration-basic/
├── 010-reservations-common-areas/
├── 011-fines-sanctions/
├── 012-communications-notifications/
├── 013-meetings-attendance/
├── 014-voting-basic/
├── 015-certified-minutes/
├── 016-secure-document-storage/
├── 017-bank-reconciliation/
├── 018-payment-provider-integration/
├── 019-open-banking-integration/
├── 020-accounting-ledger/
├── 021-supplier-payments/
├── 022-maintenance-work-orders/
├── 023-inventory-basic/
├── 024-access-control-visitors/
├── 025-tenant-settings-policies/
├── 026-automation-workflows-basic/
├── 027-dashboard-kpis/
├── 028-data-import-migration/
├── 029-admin-web-app-basic/
├── 030-resident-self-service-basic/
└── 031-implementation-readiness/
```

Cada paquete SDD debe contener:

```text
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

---

### 8.4. Documentos consolidados

```text
docs/consolidated/
├── RESIDENT_Core_Keycloak_Docs_Consolidated.md
└── RESIDENT_Core_Project_Blueprint_v0.1.md
```

El documento más importante para entender el estado actual del proyecto es:

```text
docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md
```

---

### 8.5. Implementación

```text
docs/implementation/
├── sprint-0-foundation.md
└── sprint-1-backend-platform-base.md
```

Estos documentos guían la fundación técnica cerrada y la base backend autorizada.

---

## 9. Módulos principales

```text
001-tenants                         Gestión de tenants / conjuntos
002-users-roles                     Usuarios, roles y permisos
003-residents-properties            Residentes, propietarios y unidades
004-dues-fees                       Alícuotas, cargos y rubros
005-payments                        Pagos y comprobantes
006-account-statements              Estados de cuenta
007-audit                           Auditoría
008-basic-reports                   Reportes básicos
009-wordpress-integration-basic     Integración con WordPress
010-reservations-common-areas       Reservas de áreas comunales
011-fines-sanctions                 Multas y sanciones
012-communications-notifications    Comunicados y notificaciones
013-meetings-attendance             Reuniones y asistencia
014-voting-basic                    Votaciones básicas
015-certified-minutes               Actas certificadas
016-secure-document-storage         Almacenamiento documental seguro
017-bank-reconciliation             Conciliación bancaria
018-payment-provider-integration    Integración con pasarelas de pago
019-open-banking-integration        Integración open banking
020-accounting-ledger               Contabilidad / libro mayor
021-supplier-payments               Pagos a proveedores
022-maintenance-work-orders         Órdenes de mantenimiento
023-inventory-basic                 Inventario básico
024-access-control-visitors         Visitantes y accesos
025-tenant-settings-policies        Configuración y políticas por tenant
026-automation-workflows-basic      Automatizaciones
027-dashboard-kpis                  Dashboards e indicadores
028-data-import-migration           Importación y migración de datos
029-admin-web-app-basic             Aplicación web administrativa
030-resident-self-service-basic     Portal privado del residente
031-implementation-readiness        Preparación para implementación
```

---

## 10. Orden recomendado de implementación

```text
Sprint 0 — Fundación técnica
Sprint 1 — Backend Platform Base
Sprint 2 — Tenants, usuarios, roles, permisos y Keycloak
Sprint 3 — Residentes, propiedades y finanzas base
Sprint 4 — Admin Web App MVP
Sprint 5 — Resident Self-Service MVP
Sprint 6 — Operación comunitaria básica
Sprint 7 — Gobernanza, reportes, dashboard e importación
Post-MVP — Finanzas avanzadas, open banking, contabilidad, automatizaciones avanzadas
```

---

## 11. Reglas críticas del proyecto

```text
- No implementar código sin revisar la spec correspondiente.
- No crear endpoint sin api-contract.md.
- No crear tabla sin data-model.md.
- No implementar módulo crítico sin test-plan.md.
- No implementar módulo crítico sin security-notes.md.
- No usar WordPress como backend transaccional.
- No usar sesión WordPress para autenticar RESIDENT Core.
- No exponer storageKey.
- No exponer signedUrl persistentes.
- No aceptar tenantId como autoridad final desde cliente.
- No aceptar actor fields desde cliente.
- No calcular saldos finales en frontend.
- No validar pagos desde Resident Self-Service.
- No crear asientos contables fuera del módulo autorizado.
- No confirmar conciliaciones fuera del módulo autorizado.
- No controlar hardware físico en MVP.
- No usar biometría ni reconocimiento facial en MVP.
- No enviar datos reales a IA externa.
```

---

## 12. Seguridad

Principios de seguridad vigentes:

```text
- Keycloak autentica.
- RESIDENT Core autoriza.
- La autorización es tenant-aware, role-aware, permission-aware y resource-aware.
- El portal residente requiere property-level authorization.
- Todo movimiento financiero debe ser auditable.
- Los documentos privados deben manejarse mediante Secure Document Storage.
- Los errores no deben revelar datos de otros tenants o unidades.
- El frontend no es autoridad de negocio.
- Las APIs privadas no deben exponerse públicamente.
```

---

## 13. Multitenancy

La estrategia inicial es:

```text
Shared database
Shared schema
tenant_id obligatorio en entidades tenant-scoped
aislamiento lógico por tenant
TenantGuard obligatorio
pruebas multitenant obligatorias
```

Regla:

```text
Toda entidad, consulta, operación, evento, auditoría, archivo y respuesta asociada a un conjunto residencial debe estar correctamente delimitada por tenant.
```

---

## 14. Identidad y acceso

La estrategia objetivo de identidad es Keycloak.

```text
Keycloak = autenticación
RESIDENT Core = autorización de negocio
```

Flujo general:

```text
Usuario inicia sesión
        ↓
Keycloak emite token
        ↓
RESIDENT Core valida token
        ↓
Core resuelve UserProfile
        ↓
Core resuelve memberships, roles y permissions
        ↓
Core autoriza tenant, recurso y acción
```

---

## 15. Integración con WordPress

WordPress queda limitado a:

```text
- portal público multitenant;
- páginas informativas por conjunto;
- logos, banners, slogan, datos públicos;
- enlaces hacia aplicaciones privadas;
- consumo controlado de información pública autorizada.
```

WordPress no debe:

```text
- procesar pagos;
- autenticar usuarios Core;
- mostrar estados de cuenta privados;
- recibir comprobantes;
- administrar residentes;
- administrar usuarios Core;
- servir como consola administrativa;
- servir como portal privado del residente.
```

---

## 16. Uso con Codex, Claude Code o agentes de IA

Antes de pedir implementación a un agente de código, indicar:

```text
Lee primero:

1. docs/consolidated/RESIDENT_Core_Project_Blueprint_v0.1.md
2. docs/specs/SPECS_INDEX.md
3. docs/sdd/constitution.md
4. docs/sdd/architecture.md
5. docs/sdd/security.md
6. docs/sdd/api-guidelines.md
7. docs/sdd/data-governance.md
8. docs/sdd/documentation-standard.md
9. docs/implementation/sprint-0-foundation.md

Implementa únicamente el sprint solicitado.
No inventes endpoints, tablas, permisos ni reglas fuera de las specs.
No implementes lógica de negocio no solicitada.
No uses datos reales.
No expongas storageKey.
No uses WordPress como backend transaccional.
```

---

## 17. Sprint 0

Sprint 0 fue implementado mediante:

```text
docs/implementation/sprint-0-foundation.md
```

Su ejecución fue autorizada por la decisión `GO` registrada en
`docs/changes/READINESS-031-2026-08-10.md`, que sustituye el `NO_GO` histórico de la
evaluación del 2026-08-09. El Definition of Done técnico y el cierre formal fueron
reevaluados el 2026-08-11 y cumplen según
`docs/changes/SPRINT-0-CLOSURE-2026-08-11.md`.

Sprint 0 debe crear:

```text
- monorepo;
- apps/api;
- apps/admin-web;
- apps/resident-web;
- packages/shared;
- packages/config;
- packages/auth;
- packages/openapi-client;
- packages/testing;
- Node.js 24.18.0 fijado en .node-version y package.json;
- pnpm 11.21.0 fijado mediante packageManager y engines;
- main como única rama permanente y target de CI;
- migración documentada de master legacy a main antes de crear CI o remoto;
- develop no adoptada inicialmente;
- Docker Compose con resident-api, postgres, redis, keycloak, keycloak-postgres,
  mailhog y minio;
- imágenes y tags exactos conforme a ADR-009 §7.1, sin `latest` ni versiones flotantes;
- schema Prisma con generator y datasource, sin modelos, enums, migraciones, seeds ni
  PrismaService;
- tooling de OpenAPI, sin runtime ni endpoints de documentación;
- compuerta 031 en Markdown/Git, sin API ni persistencia runtime de readiness;
- CI inicial con los gates obligatorios de ADR-012 §10;
- README técnico;
- .env.example;
- .gitignore.
```

Sprint 0 no debe implementar lógica funcional de negocio.

La frontera normativa está en
`docs/implementation/sprint-0-foundation.md`: el scaffold compilable y el tooling son
Sprint 0; ConfigModule, ValidationPipe, ExceptionFilter, logger de aplicación,
HealthModule con el contrato de ADR-010 §10, PrismaService y Swagger/OpenAPI runtime son Sprint 1. Sprint 1 tampoco
autoriza lógica de negocio sin la spec y el sprint correspondientes.

---

## 18. Arranque local

El baseline de Sprint 0 usa los siguientes comandos:

```bash
pnpm install
pnpm docker:up
pnpm build
pnpm test
```

La configuración runtime de plataforma y la lógica de negocio permanecen fuera de este
baseline.

---

## 19. Estado de readiness

```text
Implementation Readiness Sprint 0: GO (2026-08-10)
Specs 001-030: needs-review
Spec 031: complete
Blueprint: creado
Specs Index: creado
Documentation Standard: creado
Sprint 0 Foundation: creado
Decisión Sprint 0: GO; alcance implementado y cerrado
Definition of Done técnico de Sprint 0: PASS (2026-08-11)
Cierre formal de Sprint 0: PASS (2026-08-11)
Implementation Readiness Sprint 1: GO (2026-08-11)
Sprint 1: Backend Platform Base implementado y cerrado — PASS (2026-08-11)
Implementation Readiness Sprint 2: NO_GO (2026-08-11)
Sprint 2 y lógica de negocio: no autorizados; 5 gaps críticos y 3 altos abiertos
```

Evidencia:

```text
docs/changes/READINESS-031-2026-08-10.md
docs/changes/SPRINT-0-CLOSURE-2026-08-11.md
docs/implementation/sprint-1-backend-platform-base.md
docs/changes/READINESS-SPRINT-1-2026-08-11.md
docs/changes/SPRINT-1-CLOSURE-2026-08-11.md
docs/changes/READINESS-SPRINT-2-2026-08-11.md
```

Sprint 1 está cerrado. La compuerta de Sprint 2 emitió `NO_GO` porque las specs 001,
002, 007 y 025 permanecen `needs-review` y todavía no existe una frontera implementable
para tenant activo, bootstrap de identidad, Keycloak y las porciones base de auditoría y
configuración. No existe un plan funcional autorizado para Sprint 2.

---

## 20. Licencia

Pendiente de definir.

Opciones posibles:

```text
- privado / propietario;
- MIT;
- Apache 2.0;
- GPL;
- licencia comercial propia.
```

Para RESIDENT, se recomienda mantener inicialmente el repositorio como privado y propietario mientras el producto está en diseño e implementación inicial.

---

## 21. Autor / responsable

```text
Proyecto: RESIDENT
Responsable: Gustavo Guaigua Albarracín
Fase: RESIDENT Core — FASE 2
Metodología: Spec Driven Development
```
