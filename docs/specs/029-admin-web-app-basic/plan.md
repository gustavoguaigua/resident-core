# Plan — 029 Admin Web App Basic

## 1. Información del documento

| Campo          | Valor                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                             |
| Spec ID        | 029                                                                                                       |
| Módulo         | Admin Web App Basic                                                                                       |
| Documento      | Implementation Plan                                                                                       |
| Ruta           | `docs/specs/029-admin-web-app-basic/plan.md`                                                              |
| Versión        | 0.1                                                                                                       |
| Estado         | needs-review                                                                                              |
| Fecha          | 2026-08-03                                                                                                |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC |
| Naturaleza     | Tenant-scoped / Role-aware / API-first / Non-public / Admin-facing                                        |

---

## 2. Propósito

Definir el plan técnico para implementar la aplicación web administrativa básica de RESIDENT.

La app será una consola privada para operar RESIDENT Core mediante APIs oficiales, sin acceso directo a base de datos, sin lógica transaccional crítica en frontend, sin dependencia de WordPress y sin exposición pública.

Regla central:

```text id="awa-plan-rule"
Admin Web App Basic debe implementarse como frontend administrativo desacoplado, autenticado con Keycloak, tenant-aware, permission-aware, API-first y no público, consumiendo únicamente APIs oficiales de RESIDENT Core, sin acceso directo a PostgreSQL, sin Prisma en frontend, sin storageKey, sin sesión WordPress, sin rutas públicas administrativas, sin lógica financiera final en UI, sin control de hardware y sin IA externa con datos reales.
```

---

## 3. Decisión técnica principal

```text id="awa-plan-decision"
Implementar Admin Web App Basic como aplicación Next.js independiente, escrita en TypeScript, con UI basada en Tailwind CSS y shadcn/ui, estado remoto con TanStack Query, formularios con React Hook Form + Zod, cliente API generado desde OpenAPI y autenticación OIDC mediante Keycloak.
```

Implicación:

```text id="awa-plan-implication"
La aplicación administrativa no será un plugin WordPress ni vivirá dentro del portal público. WordPress seguirá siendo capa pública informativa; Admin Web App será la consola privada del sistema transaccional.
```

---

## 4. Clasificación

```text id="awa-plan-classification"
Frontend administrativo
Private web application
Tenant-aware
Role-aware
Permission-aware
API-first
OpenAPI-driven
OIDC-authenticated
Non-public
No direct DB access
No WordPress session
No storageKey exposure
```

---

## 5. Nombre técnico

```text id="awa-plan-name"
admin-web-app-basic
```

Ruta sugerida dentro del repositorio:

```text id="awa-plan-path"
apps/admin-web/
```

---

## 6. Stack objetivo

```text id="awa-plan-stack"
Framework: Next.js
UI: React
Lenguaje: TypeScript
Estilos: Tailwind CSS
Componentes: shadcn/ui
Data fetching: TanStack Query
Formularios: React Hook Form
Validación frontend: Zod
Cliente API: OpenAPI generated client
Auth: Keycloak OIDC Authorization Code Flow with PKCE
Testing: Vitest / React Testing Library / Playwright
Lint/Format: ESLint / Prettier
Build: Node LTS
Deploy inicial: Docker container o hosting estático con runtime seguro
```

---

## 7. Responsabilidades

La app debe encargarse de:

```text id="awa-plan-responsibilities"
- login y logout;
- callback OIDC;
- selección de tenant;
- navegación por permisos;
- renderizado de vistas administrativas;
- formularios de operación;
- manejo de errores API;
- estados loading/empty/forbidden/not found;
- consumo de APIs oficiales;
- invalidación de cache por tenant;
- confirmación de acciones críticas;
- visualización de traceId en errores;
- descarga segura de documentos mediante flujos del Core.
```

No debe encargarse de:

```text id="awa-plan-non-responsibilities"
- autenticar por cuenta propia;
- reemplazar Keycloak;
- administrar Keycloak directamente;
- resolver reglas finales de negocio;
- calcular saldos finales;
- validar pagos sin backend;
- crear asientos contables;
- confirmar conciliaciones fuera del API autorizado;
- abrir portones;
- controlar hardware;
- acceder a PostgreSQL;
- usar Prisma;
- almacenar storageKey;
- usar sesión WordPress.
```

---

## 8. Arquitectura frontend

```text id="awa-plan-architecture"
Browser
  ↓
Admin Web App
  ↓
OIDC / Keycloak
  ↓
RESIDENT Core API /api/v1
  ↓
PostgreSQL / Redis / Storage / Audit
```

Regla:

```text id="awa-plan-architecture-rule"
Todo dato transaccional debe obtenerse desde RESIDENT Core API. Ningún componente frontend accede directamente a base de datos, colas, storage interno o servicios privados.
```

---

## 9. Estructura sugerida

```text id="awa-plan-folder-structure"
apps/admin-web/
├── app/
│   ├── login/
│   ├── auth/callback/
│   ├── select-tenant/
│   ├── forbidden/
│   └── app/
│       ├── dashboard/
│       ├── residents/
│       ├── properties/
│       ├── users/
│       ├── dues/
│       ├── payments/
│       ├── account-statements/
│       ├── reservations/
│       ├── fines/
│       ├── communications/
│       ├── meetings/
│       ├── voting/
│       ├── minutes/
│       ├── documents/
│       ├── maintenance/
│       ├── inventory/
│       ├── access/
│       ├── automation/
│       ├── imports/
│       ├── reports/
│       └── audit/
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── auth/
│   ├── tenant/
│   ├── permissions/
│   ├── data-table/
│   ├── forms/
│   ├── feedback/
│   └── secure-documents/
├── features/
│   ├── dashboard/
│   ├── residents-properties/
│   ├── users-roles/
│   ├── dues-fees/
│   ├── payments/
│   ├── account-statements/
│   ├── reservations/
│   ├── fines/
│   ├── communications/
│   ├── governance/
│   ├── documents/
│   ├── maintenance/
│   ├── inventory/
│   ├── access-control/
│   ├── automation/
│   ├── imports/
│   ├── reports/
│   └── audit/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── tenant/
│   ├── permissions/
│   ├── query-client/
│   ├── errors/
│   ├── config/
│   └── security/
├── generated/
│   └── resident-core-api/
├── tests/
│   ├── unit/
│   ├── component/
│   └── e2e/
└── Dockerfile
```

---

## 10. Capas técnicas

### 10.1. UI Layer

```text id="awa-plan-ui-layer"
- páginas;
- layouts;
- componentes visuales;
- tablas;
- formularios;
- estados de feedback;
- modales de confirmación.
```

---

### 10.2. Feature Layer

```text id="awa-plan-feature-layer"
- hooks por módulo;
- schemas Zod;
- adaptadores de DTO frontend;
- componentes específicos por dominio;
- mutaciones API;
- query keys por tenant.
```

---

### 10.3. API Layer

```text id="awa-plan-api-layer"
- cliente generado desde OpenAPI;
- interceptor de auth;
- interceptor de errores;
- manejo de traceId;
- normalización de responses;
- prohibición de endpoints no definidos.
```

---

### 10.4. Auth/Tenant Layer

```text id="awa-plan-auth-tenant-layer"
- OIDC client;
- session provider;
- tenant provider;
- permission provider;
- route guards;
- component guards;
- cache invalidation por tenant.
```

---

## 11. Integración Keycloak

Flujo obligatorio:

```text id="awa-plan-keycloak-flow"
Authorization Code Flow with PKCE
```

Reglas:

```text id="awa-plan-keycloak-rules"
- No usar implicit flow.
- No poner tokens en query params.
- No registrar tokens en console.
- No usar sesión WordPress.
- Resolver usuario real desde Core.
- Resolver tenants y permisos desde Core.
- Logout debe limpiar sesión, tenant activo y cache.
```

Decisión de almacenamiento de tokens:

```text id="awa-plan-token-storage"
Preferir patrón BFF con cookies httpOnly si la arquitectura lo permite. Si se usa SPA pura, minimizar exposición, evitar localStorage cuando sea viable y documentar riesgo residual.
```

---

## 12. Tenant context

Reglas:

```text id="awa-plan-tenant-rules"
- El usuario solo puede seleccionar tenants donde tenga membresía activa.
- Tenant activo se resuelve desde Core.
- Cambio de tenant invalida cache.
- Query keys deben incluir tenant context.
- UI no debe aceptar tenantId editable en formularios.
- Backend sigue siendo autoridad final del tenant.
```

Flujo:

```text id="awa-plan-tenant-flow"
1. Usuario inicia sesión.
2. App consulta /me o endpoint equivalente del Core.
3. Core devuelve perfil, memberships y permisos.
4. App muestra selector si hay más de un tenant.
5. Usuario selecciona tenant autorizado.
6. App carga navegación y permisos efectivos.
```

---

## 13. Permission model frontend

Principio:

```text id="awa-plan-permission-rule"
La UI puede ocultar o deshabilitar funciones por permiso, pero la autorización final siempre ocurre en RESIDENT Core API.
```

Componentes:

```text id="awa-plan-permission-components"
- PermissionProvider.
- PermissionGate.
- RoutePermissionGuard.
- ActionPermissionGuard.
- SensitiveActionGuard.
```

Uso:

```tsx id="awa-plan-permission-example"
<PermissionGate permission="tenantImports.execute">
  <ExecuteImportButton />
</PermissionGate>
```

---

## 14. Cliente API

Reglas:

```text id="awa-plan-api-client-rules"
- Generar cliente desde OpenAPI.
- No escribir fetch manual disperso salvo excepción justificada.
- Centralizar baseURL.
- Centralizar headers.
- Centralizar auth token handling.
- Centralizar manejo de errores.
- No inventar contratos no documentados.
- No consumir endpoints públicos inexistentes.
```

Manejo de errores:

```text id="awa-plan-error-handling"
401 -> session expired / login
403 -> ForbiddenState
404 -> NotFoundState
409 -> ConflictState
422 -> Field errors / FormErrorSummary
429 -> RateLimitState
500 -> ApiErrorState con traceId
```

---

## 15. Estado remoto y cache

Usar TanStack Query.

Reglas:

```text id="awa-plan-query-rules"
- Query keys incluyen tenant.
- Invalidate al cambiar tenant.
- Invalidate después de mutaciones.
- No cachear storageKey.
- No cachear payload sensible innecesario.
- No mostrar datos de tenant anterior.
- Stale time bajo para datos críticos.
```

Ejemplo conceptual:

```typescript id="awa-plan-query-key-example"
["tenant", currentTenantKey, "payments", filters]
```

---

## 16. Formularios

Stack:

```text id="awa-plan-forms-stack"
React Hook Form + Zod
```

Reglas:

```text id="awa-plan-form-rules"
- Validación frontend para usabilidad.
- Backend sigue siendo fuente final de validación.
- No enviar tenantId editable.
- No enviar actor fields.
- No enviar status directo.
- No enviar storageKey.
- No enviar rawSql/script/formulaCode.
- Deshabilitar submit durante mutación.
- Mostrar errores 422 por campo.
- Confirmar acciones críticas.
```

---

## 17. Componentes base

```text id="awa-plan-components"
AppShell
SidebarNavigation
HeaderBar
TenantSwitcher
UserMenu
Breadcrumbs
PermissionGate
RouteGuard
DataTable
FilterBar
DateRangeFilter
StatusBadge
MoneyDisplay
SecureDocumentLink
ConfirmDialog
DangerActionDialog
FormErrorSummary
LoadingState
EmptyState
ForbiddenState
NotFoundState
ConflictState
ApiErrorState
TraceIdDisplay
```

---

## 18. Módulos UI por prioridad

### Prioridad 1 — Operación mínima

```text id="awa-plan-priority-1"
[ ] Auth/session.
[ ] Tenant selector.
[ ] Layout.
[ ] Navigation permission-aware.
[ ] Dashboard básico.
[ ] Residents/properties básico.
[ ] Users/roles básico.
[ ] Dues/fees básico.
[ ] Payments básico.
[ ] Account statements básico.
[ ] Data import 028 básico.
```

---

### Prioridad 2 — Operación administrativa ampliada

```text id="awa-plan-priority-2"
[ ] Reservations.
[ ] Fines.
[ ] Communications.
[ ] Meetings.
[ ] Voting.
[ ] Certified minutes.
[ ] Secure documents.
[ ] Maintenance.
[ ] Inventory.
[ ] Access/visitors.
```

---

### Prioridad 3 — Supervisión y control

```text id="awa-plan-priority-3"
[ ] Automation workflows.
[ ] Reports.
[ ] Audit.
[ ] Dashboard avanzado.
[ ] Error observability.
```

---

## 19. Rutas MVP

```text id="awa-plan-routes"
/
/login
/auth/callback
/select-tenant
/forbidden
/app/dashboard
/app/residents
/app/properties
/app/users
/app/dues
/app/payments
/app/account-statements
/app/reservations
/app/fines
/app/communications
/app/meetings
/app/voting
/app/minutes
/app/documents
/app/maintenance
/app/inventory
/app/access
/app/automation
/app/imports
/app/reports
/app/audit
```

Rutas prohibidas:

```text id="awa-plan-routes-forbidden"
/public/admin
/public/dashboard
/wp-admin/resident-core
/embed/admin
/embed/dashboard
```

---

## 20. Integración por módulos

```text id="awa-plan-module-integration"
027-dashboard-kpis -> /app/dashboard
003-residents-properties -> /app/residents, /app/properties
002-users-roles -> /app/users
004-dues-fees -> /app/dues
005-payments -> /app/payments
006-account-statements -> /app/account-statements
010-reservations-common-areas -> /app/reservations
011-fines-sanctions -> /app/fines
012-communications-notifications -> /app/communications
013-meetings-attendance -> /app/meetings
014-voting-basic -> /app/voting
015-certified-minutes -> /app/minutes
016-secure-document-storage -> /app/documents
022-maintenance-work-orders -> /app/maintenance
023-inventory-basic -> /app/inventory
024-access-control-visitors -> /app/access
026-automation-workflows-basic -> /app/automation
028-data-import-migration -> /app/imports
008-basic-reports -> /app/reports
007-audit -> /app/audit
```

Regla:

```text id="awa-plan-module-rule"
Si el endpoint requerido no existe en OpenAPI, registrar gap técnico y no inventar contrato frontend.
```

---

## 21. Seguridad frontend

Controles:

```text id="awa-plan-security-controls"
- OIDC seguro.
- Route guards.
- Permission gates.
- Tenant switch cache clear.
- No console logs sensibles.
- No storageKey display.
- No signedUrl persistente.
- No tokens en URL.
- No HTML no confiable sin sanitizar.
- No dangerouslySetInnerHTML salvo excepción aprobada.
- CSP restrictiva.
- Dependency scanning.
- Lint no-console en producción.
```

---

## 22. Feature flags

```text id="awa-plan-feature-flags"
ADMIN_WEB_APP_ENABLED=true
ADMIN_WEB_APP_PUBLIC_MODE_ENABLED=false
ADMIN_WEB_APP_WORDPRESS_AUTH_ENABLED=false
ADMIN_WEB_APP_STORAGE_KEY_DISPLAY_ENABLED=false
ADMIN_WEB_APP_EXTERNAL_AI_ENABLED=false
ADMIN_WEB_APP_HARDWARE_CONTROL_ENABLED=false
ADMIN_WEB_APP_DIRECT_DB_ACCESS_ENABLED=false
ADMIN_WEB_APP_PAYMENT_CAPTURE_ENABLED=false
ADMIN_WEB_APP_ACCOUNTING_DIRECT_ENTRY_ENABLED=false
```

Regla:

```text id="awa-plan-feature-rule"
Build o runtime deben fallar si se habilitan modo público, auth WordPress, storageKey display, IA externa con datos reales, control de hardware, acceso directo a base, captura de pagos o asientos contables directos.
```

---

## 23. Testing strategy

```text id="awa-plan-testing"
Unit tests:
- value helpers;
- permission helpers;
- route guards;
- API error normalizer;
- form schemas.

Component tests:
- PermissionGate;
- TenantSwitcher;
- DataTable;
- SecureDocumentLink;
- ConfirmDialog;
- FormErrorSummary.

E2E tests:
- login;
- select tenant;
- permission navigation;
- dashboard;
- data import flow;
- payment review flow;
- forbidden route;
- tenant switch cache invalidation.
```

---

## 24. Build and deployment

### 24.1. Build

```text id="awa-plan-build"
- TypeScript strict.
- ESLint.
- Prettier.
- Unit tests.
- Component tests.
- OpenAPI client generation.
- Bundle analysis opcional.
```

---

### 24.2. Deployment inicial

Opciones permitidas:

```text id="awa-plan-deploy-options"
- Docker container con Node runtime.
- Hosting frontend privado detrás de auth-aware gateway.
- Subdominio privado ejemplo: admin.resident.gustavoguaigua.com.
```

No permitido:

```text id="awa-plan-deploy-forbidden"
- Publicar como página pública sin auth.
- Instalar como plugin WordPress obligatorio.
- Servir desde wp-admin.
- Exponer build con secretos.
```

---

## 25. Variables de entorno

```text id="awa-plan-env"
NEXT_PUBLIC_RESIDENT_API_BASE_URL
NEXT_PUBLIC_KEYCLOAK_URL
NEXT_PUBLIC_KEYCLOAK_REALM
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ADMIN_WEB_APP_PUBLIC_MODE_ENABLED=false
ADMIN_WEB_APP_WORDPRESS_AUTH_ENABLED=false
ADMIN_WEB_APP_STORAGE_KEY_DISPLAY_ENABLED=false
```

Reglas:

```text id="awa-plan-env-rules"
- Solo variables NEXT_PUBLIC que sean realmente públicas.
- Nunca exponer clientSecret.
- Nunca exponer tokens.
- Nunca exponer database URLs.
- Nunca exponer storage credentials.
```

---

## 26. Observabilidad frontend

Eventos permitidos:

```text id="awa-plan-observability-events"
adminApp.loaded
adminApp.route.changed
adminApp.api.error
adminApp.auth.sessionExpired
adminApp.tenant.changed
adminApp.criticalAction.submitted
adminApp.criticalAction.failed
```

No registrar:

```text id="awa-plan-observability-forbidden"
tokens
passwords
authorization headers
storageKey
datos personales completos
identificaciones
placas
comprobantes
payload financiero raw
datos cross-tenant
```

---

## 27. Estrategia de implementación

### Fase 1 — Fundación

```text id="awa-plan-phase-01"
[ ] Crear app Next.js.
[ ] Configurar TypeScript strict.
[ ] Configurar Tailwind.
[ ] Configurar shadcn/ui.
[ ] Configurar ESLint/Prettier.
[ ] Configurar estructura base.
[ ] Configurar variables de entorno.
```

---

### Fase 2 — Auth, tenant y permisos

```text id="awa-plan-phase-02"
[ ] Integrar Keycloak OIDC.
[ ] Implementar login/logout/callback.
[ ] Implementar SessionProvider.
[ ] Implementar TenantProvider.
[ ] Implementar PermissionProvider.
[ ] Implementar route guards.
[ ] Implementar tenant selector.
[ ] Implementar cache clear al cambiar tenant.
```

---

### Fase 3 — API client y layout

```text id="awa-plan-phase-03"
[ ] Generar cliente OpenAPI.
[ ] Configurar API client.
[ ] Configurar TanStack Query.
[ ] Crear AppShell.
[ ] Crear SidebarNavigation.
[ ] Crear HeaderBar.
[ ] Crear componentes base.
[ ] Crear error handling global.
```

---

### Fase 4 — Módulos prioridad 1

```text id="awa-plan-phase-04"
[ ] Dashboard básico.
[ ] Residents/properties básico.
[ ] Users/roles básico.
[ ] Dues/fees básico.
[ ] Payments básico.
[ ] Account statements básico.
[ ] Data import básico.
```

---

### Fase 5 — Módulos prioridad 2

```text id="awa-plan-phase-05"
[ ] Reservations.
[ ] Fines.
[ ] Communications.
[ ] Meetings.
[ ] Voting.
[ ] Minutes.
[ ] Documents.
[ ] Maintenance.
[ ] Inventory.
[ ] Access/visitors.
```

---

### Fase 6 — Supervisión

```text id="awa-plan-phase-06"
[ ] Automation workflows.
[ ] Reports.
[ ] Audit.
[ ] Dashboard ampliado.
```

---

### Fase 7 — Hardening

```text id="awa-plan-phase-07"
[ ] Tests unitarios.
[ ] Tests componentes.
[ ] Tests E2E.
[ ] Security review.
[ ] Accessibility review básico.
[ ] Performance baseline.
[ ] CI/CD.
```

---

## 28. Plan de PRs sugerido

```text id="awa-plan-prs"
PR-029-01 — App foundation, tooling, Tailwind, shadcn/ui and environment config.
PR-029-02 — Keycloak auth, session, tenant selector and permission providers.
PR-029-03 — OpenAPI client, TanStack Query, layout and base components.
PR-029-04 — Dashboard, residents/properties, users/roles.
PR-029-05 — Dues, payments and account statements.
PR-029-06 — Data import and secure documents.
PR-029-07 — Reservations, fines, communications and governance.
PR-029-08 — Maintenance, inventory and access control.
PR-029-09 — Automation, reports, audit and observability.
PR-029-10 — Tests, security hardening, performance and CI/CD.
```

---

## 29. Riesgos técnicos

| Riesgo                               |      Nivel | Mitigación                                         |
| ------------------------------------ | ---------: | -------------------------------------------------- |
| Filtración de token                  |       Alto | OIDC seguro, no tokens en URL, BFF preferido       |
| Datos de tenant anterior por cache   |       Alto | query keys con tenant + clear cache                |
| storageKey visible                   |    Crítico | SecureDocumentLink con secureDocumentId únicamente |
| Menú muestra acciones indebidas      | Medio/Alto | PermissionGate + backend authorization             |
| Contratos API inventados             | Medio/Alto | OpenAPI generated client                           |
| Doble submit                         |      Medio | mutation lock + backend idempotency                |
| XSS en comunicados                   |       Alto | escaping, sanitización, CSP                        |
| Exceso de bundle                     |      Medio | lazy loading por módulo                            |
| Formularios envían campos prohibidos |       Alto | schemas Zod + backend validation                   |
| WordPress como bypass                |       Alto | no WordPress auth/no public admin routes           |

---

## 30. Definition of Done

```text id="awa-plan-dod"
[ ] App Next.js creada.
[ ] TypeScript strict activo.
[ ] Tailwind/shadcn configurados.
[ ] Keycloak login/logout/callback implementado.
[ ] Tenant selector implementado.
[ ] PermissionProvider implementado.
[ ] Route guards implementados.
[ ] OpenAPI client generado.
[ ] TanStack Query configurado.
[ ] Layout administrativo implementado.
[ ] Componentes base implementados.
[ ] Dashboard básico implementado.
[ ] Módulos prioridad 1 implementados.
[ ] Data import UI implementada.
[ ] SecureDocumentLink implementado.
[ ] Error handling global implementado.
[ ] Tests críticos implementados.
[ ] E2E smoke implementado.
[ ] No storageKey exposure verificado.
[ ] No WordPress auth verificado.
[ ] No public admin routes verificado.
[ ] CI/CD implementado.
```

---

## 31. No aceptación

No se acepta implementación si:

```text id="awa-plan-no-acceptance"
- usa sesión WordPress;
- se implementa como plugin WordPress obligatorio;
- expone rutas públicas administrativas;
- permite tenant no autorizado;
- mantiene cache del tenant anterior;
- muestra storageKey;
- guarda signedUrl persistente;
- registra tokens en console;
- incluye datos sensibles en URL;
- llama directamente a PostgreSQL;
- usa Prisma en frontend;
- implementa SQL en frontend;
- calcula reglas financieras finales en UI;
- ejecuta pagos fuera del Core;
- crea JournalEntry directo;
- confirma conciliación bancaria por fuera del API autorizado;
- abre portones;
- controla hardware;
- usa IA externa con datos reales;
- ignora errores 403/404/422 del backend.
```

---

## 32. Resultado esperado

```text id="awa-plan-expected-result"
plan técnico definido
admin web app desacoplada
stack frontend definido
estructura Next.js definida
Keycloak OIDC definido
tenant selector definido
permission-aware UI definida
OpenAPI client definido
TanStack Query definido
componentes base definidos
módulos UI priorizados
data import UI incluida
security boundaries definidos
deployment inicial definido
PR plan definido
DoD definido
no acceptance definido
```

---

## 33. Expediente actualizado

```text id="awa-plan-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 029-admin-web-app-basic/
│   │       ├── spec.md
│   │       └── plan.md
```
