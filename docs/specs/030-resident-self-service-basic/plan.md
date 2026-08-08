# Plan — 030 Resident Self-Service Basic

## 1. Información del documento

| Campo          | Valor                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                               |
| Spec ID        | 030                                                                                                         |
| Módulo         | Resident Self-Service Basic                                                                                 |
| Documento      | Implementation Plan                                                                                         |
| Ruta           | `docs/specs/030-resident-self-service-basic/plan.md`                                                        |
| Versión        | 0.1                                                                                                         |
| Estado         | Borrador inicial                                                                                            |
| Fecha          | 2026-08-03                                                                                                  |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC   |
| Naturaleza     | Resident-facing / Tenant-scoped / Property-scoped / Permission-aware / API-first / Non-public transactional |

---

## 2. Propósito

Definir el plan técnico para implementar el portal privado de autoservicio para residentes, propietarios y ocupantes autorizados.

El módulo permitirá consultar información propia, cargar comprobantes, gestionar reservas, revisar comunicados, consultar documentos, crear solicitudes de mantenimiento y registrar visitantes, siempre mediante APIs oficiales de RESIDENT Core.

Regla central:

```text id="rss-plan-rule"
Resident Self-Service Basic debe implementarse como frontend privado, autenticado con Keycloak, tenant-scoped, property-scoped, permission-aware y API-first, consumiendo únicamente APIs oficiales de RESIDENT Core, sin sesión WordPress, sin rutas públicas transaccionales, sin acceso directo a base de datos, sin Prisma en frontend, sin storageKey, sin validación administrativa de pagos, sin creación de cargos administrativos, sin asientos contables, sin conciliación bancaria, sin control de hardware, sin biometría y sin IA externa con datos reales.
```

---

## 3. Decisión técnica principal

```text id="rss-plan-decision"
Implementar Resident Self-Service Basic como aplicación Next.js independiente o como frontend separado dentro del monorepo, escrita en TypeScript, con UI responsive, autenticación OIDC mediante Keycloak, estado remoto con TanStack Query, formularios con React Hook Form + Zod y cliente API generado desde OpenAPI.
```

Implicación:

```text id="rss-plan-implication"
El portal residente no será una página pública de WordPress ni dependerá de sesión WordPress. WordPress podrá enlazar al portal privado, pero no ejecutará operaciones transaccionales.
```

---

## 4. Clasificación

```text id="rss-plan-classification"
Resident-facing web app
Private self-service portal
Tenant-aware
Property-aware
Permission-aware
API-first
OpenAPI-driven
OIDC-authenticated
Responsive-first
Non-public transactional
No direct DB access
No WordPress session
No storageKey exposure
```

---

## 5. Nombre técnico

```text id="rss-plan-name"
resident-self-service-basic
```

Ruta sugerida:

```text id="rss-plan-path"
apps/resident-web/
```

---

## 6. Stack objetivo

```text id="rss-plan-stack"
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
Deploy inicial: Docker container o hosting privado
```

---

## 7. Responsabilidades

La app debe responsabilizarse de:

```text id="rss-plan-responsibilities"
- login/logout;
- callback OIDC;
- manejo de sesión;
- selección de tenant;
- selección de unidad vinculada;
- navegación por permisos;
- dashboard del residente;
- consulta de estado de cuenta propio;
- consulta de cargos y pagos propios;
- carga de comprobantes mediante flujo seguro;
- reservas propias;
- multas propias;
- comunicados dirigidos;
- reuniones, votaciones y actas publicadas;
- documentos autorizados;
- solicitudes de mantenimiento propias;
- visitantes/autorizaciones propias;
- perfil propio limitado;
- manejo de errores y estados UI.
```

No debe responsabilizarse de:

```text id="rss-plan-non-responsibilities"
- administrar tenants;
- administrar usuarios o roles;
- crear cargos administrativos;
- validar pagos como administrador;
- modificar saldos;
- crear asientos contables;
- confirmar conciliaciones bancarias;
- abrir portones;
- controlar hardware;
- procesar biometría;
- usar reconocimiento facial;
- acceder a PostgreSQL;
- usar Prisma;
- almacenar storageKey;
- usar sesión WordPress;
- enviar datos reales a IA externa.
```

---

## 8. Arquitectura frontend

```text id="rss-plan-architecture"
Browser / Mobile Browser
  ↓
Resident Self-Service Web App
  ↓
OIDC / Keycloak
  ↓
RESIDENT Core API /api/v1
  ↓
PostgreSQL / Redis / Storage / Audit
```

Regla:

```text id="rss-plan-architecture-rule"
Toda autorización tenant-scoped, property-scoped y resource-scoped debe resolverse en RESIDENT Core. El frontend no decide qué unidades, pagos, documentos, multas, visitantes o solicitudes pertenecen al usuario.
```

---

## 9. Estructura sugerida

```text id="rss-plan-folder-structure"
apps/resident-web/
├── app/
│   ├── login/
│   ├── auth/callback/
│   ├── select-context/
│   ├── forbidden/
│   └── app/
│       ├── dashboard/
│       ├── account-statement/
│       ├── charges/
│       ├── payments/
│       ├── reservations/
│       ├── fines/
│       ├── communications/
│       ├── meetings/
│       ├── voting/
│       ├── minutes/
│       ├── documents/
│       ├── maintenance/
│       ├── visitors/
│       └── profile/
├── components/
│   ├── layout/
│   ├── auth/
│   ├── context/
│   ├── permissions/
│   ├── data-display/
│   ├── forms/
│   ├── feedback/
│   └── secure-documents/
├── features/
│   ├── dashboard/
│   ├── account-statements/
│   ├── charges/
│   ├── payments/
│   ├── reservations/
│   ├── fines/
│   ├── communications/
│   ├── governance/
│   ├── documents/
│   ├── maintenance/
│   ├── visitors/
│   └── profile/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── tenant/
│   ├── property/
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

```text id="rss-plan-ui-layer"
- páginas;
- layouts;
- navegación responsive;
- cards;
- listas;
- tablas simples;
- formularios;
- estados de carga;
- estados vacíos;
- modales de confirmación.
```

---

### 10.2. Feature Layer

```text id="rss-plan-feature-layer"
- hooks por módulo;
- schemas Zod;
- view models;
- adaptadores de DTO;
- componentes de dominio;
- mutaciones;
- query keys tenant/property-scoped.
```

---

### 10.3. API Layer

```text id="rss-plan-api-layer"
- cliente generado desde OpenAPI;
- interceptor de auth;
- interceptor de tenant context;
- interceptor de unit/property context si aplica;
- normalización de responses;
- normalización de errores;
- preservación de traceId.
```

---

### 10.4. Auth/Tenant/Property Layer

```text id="rss-plan-context-layer"
- SessionProvider.
- TenantProvider.
- PropertyUnitProvider.
- PermissionProvider.
- ResidentContextProvider.
- RouteGuard.
- PermissionGate.
- PropertyScopeGuard.
```

---

## 11. Integración Keycloak

Flujo obligatorio:

```text id="rss-plan-keycloak-flow"
Authorization Code Flow with PKCE
```

Reglas:

```text id="rss-plan-keycloak-rules"
- No usar implicit flow.
- No usar sesión WordPress.
- No poner tokens en query params.
- No registrar tokens en console.
- Logout debe limpiar sesión, tenant, unidad y cache.
- Core resuelve perfil, tenants, unidades y permisos efectivos.
```

Decisión de tokens:

```text id="rss-plan-token-storage"
Preferir BFF con cookies httpOnly si se busca mayor protección de tokens. Si se usa SPA pura, documentar riesgo residual y evitar localStorage cuando sea viable.
```

---

## 12. Contexto tenant y unidad

Flujo:

```text id="rss-plan-context-flow"
1. Usuario inicia sesión.
2. App consulta perfil actual.
3. App consulta tenants autorizados.
4. App consulta unidades vinculadas al usuario dentro del tenant.
5. Usuario selecciona tenant si tiene más de uno.
6. Usuario selecciona unidad si tiene más de una.
7. App carga datos self-service para ese contexto.
```

Reglas:

```text id="rss-plan-context-rules"
- Solo tenants con membresía activa son seleccionables.
- Solo unidades vinculadas al usuario son seleccionables.
- Cambio de tenant limpia unidad activa.
- Cambio de tenant limpia cache.
- Cambio de unidad limpia cache property-scoped.
- propertyUnitId no se usa como autoridad final.
- Backend valida toda relación UserProfile -> Person -> PropertyUnit.
```

---

## 13. Modelo de permisos frontend

Principio:

```text id="rss-plan-permission-rule"
La UI puede ocultar rutas o acciones por permisos, pero RESIDENT Core siempre autoriza finalmente cada recurso .own.
```

Componentes:

```text id="rss-plan-permission-components"
- ResidentPermissionProvider.
- ResidentPermissionGate.
- ResidentRouteGuard.
- PropertyScopeGuard.
- SensitiveActionGuard.
```

Permisos principales:

```text id="rss-plan-permissions"
residentPortal.access
residentDashboard.readOwn
residentProperties.readOwn
residentAccountStatements.readOwn
residentCharges.readOwn
residentPayments.readOwn
residentPayments.submitOwn
residentReservations.readOwn
residentReservations.createOwn
residentReservations.cancelOwn
residentFines.readOwn
residentFines.appealOwn
residentCommunications.readOwn
residentMeetings.readOwn
residentVoting.participateOwn
residentMinutes.readPublishedOwn
residentDocuments.readOwn
residentMaintenanceRequests.createOwn
residentVisitors.createOwn
residentProfile.updateOwnLimited
```

---

## 14. Cliente API

Reglas:

```text id="rss-plan-api-client-rules"
- Generar cliente desde OpenAPI.
- Centralizar baseURL.
- Centralizar token handling.
- Centralizar tenant context.
- Centralizar property context.
- Centralizar errores.
- No inventar endpoints no documentados.
- No consumir WordPress como backend transaccional.
- No consumir endpoints administrativos para acciones resident-facing.
```

Manejo de errores:

```text id="rss-plan-error-handling"
401 -> SessionExpiredState
403 -> ForbiddenState
404 -> NotFoundState
409 -> ConflictState
413 -> PayloadTooLargeState
415 -> UnsupportedMediaTypeState
422 -> FormErrorSummary
429 -> RateLimitState
500 -> ApiErrorState con traceId
```

---

## 15. Estado remoto y cache

Usar TanStack Query.

Reglas:

```text id="rss-plan-cache-rules"
- Query keys incluyen tenant.
- Query keys incluyen unidad activa cuando aplique.
- Query keys sensibles consideran permissionHash.
- Cambio de tenant invalida todo.
- Cambio de unidad invalida property-scoped queries.
- Logout limpia todo.
- No cachear storageKey.
- No cachear signedUrl persistente.
- No cachear estados de cuenta completos en almacenamiento persistente.
```

Ejemplo:

```typescript id="rss-plan-query-key-example"
["resident", tenantSlug, propertyUnitCode, "payments", filtersHash]
```

---

## 16. Formularios

Stack:

```text id="rss-plan-forms-stack"
React Hook Form + Zod
```

Reglas:

```text id="rss-plan-form-rules"
- Validación frontend solo para usabilidad.
- Backend es autoridad final.
- No enviar tenantId editable.
- No enviar propertyUnitId como autoridad final sin validación backend.
- No enviar actor fields.
- No enviar status directo indebido.
- No enviar storageKey.
- No enviar rawSql/script/formulaCode.
- Bloquear doble submit.
- Confirmar acciones críticas.
- Mapear errores 422 por campo.
```

Formularios MVP:

```text id="rss-plan-forms"
- submit payment receipt;
- create reservation;
- cancel reservation;
- appeal fine;
- mark communication read;
- confirm meeting attendance;
- submit vote;
- create maintenance request;
- create visitor authorization;
- update own profile limited.
```

---

## 17. Componentes base

```text id="rss-plan-components"
ResidentAppShell
ResidentHeader
BottomNavigation
ResponsiveSidebar
TenantSwitcher
PropertyUnitSwitcher
ResidentPermissionGate
PropertyScopeGuard
DashboardSummaryCard
AccountBalanceCard
MoneyDisplay
StatusBadge
SecureDocumentLink
ConfirmDialog
DangerActionDialog
FormErrorSummary
LoadingState
EmptyState
ForbiddenState
NotFoundState
ConflictState
RateLimitState
ApiErrorState
TraceIdDisplay
```

---

## 18. Módulos UI por prioridad

### Prioridad 1 — Autoservicio financiero y contexto

```text id="rss-plan-priority-1"
[ ] Auth/session.
[ ] Tenant selector.
[ ] Unit selector.
[ ] Layout responsive.
[ ] Dashboard residente.
[ ] Estado de cuenta propio.
[ ] Cargos propios.
[ ] Pagos propios.
[ ] Carga de comprobantes.
[ ] Comunicados dirigidos.
```

---

### Prioridad 2 — Operación diaria

```text id="rss-plan-priority-2"
[ ] Reservas propias.
[ ] Multas propias.
[ ] Apelación de multa.
[ ] Documentos autorizados.
[ ] Solicitudes de mantenimiento.
[ ] Visitantes propios.
[ ] Perfil propio.
```

---

### Prioridad 3 — Gobernanza

```text id="rss-plan-priority-3"
[ ] Reuniones.
[ ] Confirmación de asistencia.
[ ] Votaciones autorizadas.
[ ] Actas publicadas.
[ ] Preferencias de notificación.
```

---

## 19. Rutas MVP

```text id="rss-plan-routes"
/resident/login
/resident/auth/callback
/resident/select-context
/resident/forbidden
/resident/app/dashboard
/resident/app/account-statement
/resident/app/charges
/resident/app/payments
/resident/app/reservations
/resident/app/fines
/resident/app/communications
/resident/app/meetings
/resident/app/voting
/resident/app/minutes
/resident/app/documents
/resident/app/maintenance
/resident/app/visitors
/resident/app/profile
```

Rutas prohibidas:

```text id="rss-plan-routes-forbidden"
/public/resident/account-statement
/public/resident/payments
/public/resident/documents
/public/resident/visitors
/wp/resident-private
/wp-admin/resident-self-service
/embed/resident-dashboard
```

---

## 20. Integración por módulos Core

```text id="rss-plan-module-integration"
002-users-roles -> auth context, profile, permissions
003-residents-properties -> units linked to user
004-dues-fees -> own charges
005-payments -> own payments and receipt submission
006-account-statements -> own account statement
010-reservations-common-areas -> own reservations
011-fines-sanctions -> own fines and appeals
012-communications-notifications -> targeted communications
013-meetings-attendance -> own attendance
014-voting-basic -> eligible voting
015-certified-minutes -> published minutes
016-secure-document-storage -> secure document access
022-maintenance-work-orders -> own maintenance requests
024-access-control-visitors -> own visitor authorizations
025-tenant-settings-policies -> tenant policy checks
```

Regla:

```text id="rss-plan-module-rule"
Si una vista resident-facing requiere un endpoint .own que aún no existe, se debe registrar gap técnico y definirlo en api-contract.md antes de implementarlo.
```

---

## 21. Seguridad frontend

Controles:

```text id="rss-plan-security-controls"
- OIDC con PKCE.
- Route guards.
- Tenant selector seguro.
- Unit selector seguro.
- Permission gates.
- Property scope guards.
- Query keys tenant/property-scoped.
- Cache clear por tenant/unidad.
- No storageKey.
- No signedUrl persistente.
- No datos sensibles en console.
- No datos sensibles en URL.
- No sesión WordPress.
- No rutas públicas transaccionales.
- CSP restrictiva.
- Escaping/sanitización de comunicados.
```

---

## 22. Feature flags

```text id="rss-plan-feature-flags"
RESIDENT_SELF_SERVICE_ENABLED=true
RESIDENT_SELF_SERVICE_PUBLIC_MODE_ENABLED=false
RESIDENT_SELF_SERVICE_WORDPRESS_AUTH_ENABLED=false
RESIDENT_SELF_SERVICE_STORAGE_KEY_DISPLAY_ENABLED=false
RESIDENT_SELF_SERVICE_EXTERNAL_AI_ENABLED=false
RESIDENT_SELF_SERVICE_HARDWARE_CONTROL_ENABLED=false
RESIDENT_SELF_SERVICE_PAYMENT_ADMIN_ACTIONS_ENABLED=false
RESIDENT_SELF_SERVICE_ACCOUNTING_ACTIONS_ENABLED=false
RESIDENT_SELF_SERVICE_BANK_RECONCILIATION_ENABLED=false
```

Regla:

```text id="rss-plan-feature-rule"
Build o runtime deben fallar si se habilita modo público transaccional, auth WordPress, display de storageKey, IA externa con datos reales, control de hardware, acciones administrativas de pago, contabilidad o conciliación bancaria.
```

---

## 23. Testing strategy

```text id="rss-plan-testing"
Unit tests:
- auth helpers;
- tenant/unit helpers;
- permission helpers;
- property scope helpers;
- error normalizer;
- form schemas.

Component tests:
- TenantSwitcher;
- PropertyUnitSwitcher;
- ResidentPermissionGate;
- SecureDocumentLink;
- AccountBalanceCard;
- ConfirmDialog;
- FormErrorSummary.

E2E tests:
- login;
- select tenant;
- select unit;
- account statement;
- payment receipt submission;
- reservation creation;
- fine appeal;
- maintenance request;
- visitor authorization;
- forbidden route;
- cache invalidation on tenant/unit switch.
```

---

## 24. Build and deployment

### 24.1. Build

```text id="rss-plan-build"
- TypeScript strict.
- ESLint.
- Prettier.
- Unit tests.
- Component tests.
- OpenAPI client generation.
- Production build.
```

---

### 24.2. Deployment inicial

Opciones permitidas:

```text id="rss-plan-deploy-options"
- Docker container.
- Hosting privado detrás de gateway.
- Subdominio privado ejemplo: residentes.resident.gustavoguaigua.com.
- Ruta privada separada del WordPress público.
```

No permitido:

```text id="rss-plan-deploy-forbidden"
- Publicar estados de cuenta en páginas públicas.
- Instalar como plugin WordPress obligatorio.
- Servir operaciones privadas desde wp-admin.
- Exponer build con secretos.
```

---

## 25. Variables de entorno

```text id="rss-plan-env"
NEXT_PUBLIC_RESIDENT_API_BASE_URL
NEXT_PUBLIC_KEYCLOAK_URL
NEXT_PUBLIC_KEYCLOAK_REALM
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
RESIDENT_SELF_SERVICE_PUBLIC_MODE_ENABLED=false
RESIDENT_SELF_SERVICE_WORDPRESS_AUTH_ENABLED=false
RESIDENT_SELF_SERVICE_STORAGE_KEY_DISPLAY_ENABLED=false
```

Reglas:

```text id="rss-plan-env-rules"
- Nunca exponer clientSecret.
- Nunca exponer tokens.
- Nunca exponer database URLs.
- Nunca exponer storage credentials.
- Solo usar NEXT_PUBLIC para valores realmente públicos.
```

---

## 26. Observabilidad frontend

Eventos permitidos:

```text id="rss-plan-observability-events"
residentApp.loaded
residentApp.route.changed
residentApp.api.error
residentApp.auth.sessionExpired
residentApp.tenant.changed
residentApp.unit.changed
residentApp.criticalAction.submitted
residentApp.criticalAction.failed
```

No registrar:

```text id="rss-plan-observability-forbidden"
tokens
passwords
authorization headers
cookies
storageKey
signedUrl
identificaciones completas
placas completas
comprobantes
estados de cuenta completos
payload financiero raw
datos cross-tenant
datos de otras unidades
```

---

## 27. Estrategia de implementación

### Fase 1 — Fundación

```text id="rss-plan-phase-01"
[ ] Crear app Next.js.
[ ] Configurar TypeScript strict.
[ ] Configurar Tailwind.
[ ] Configurar shadcn/ui.
[ ] Configurar ESLint/Prettier.
[ ] Configurar estructura base.
[ ] Configurar variables de entorno.
```

---

### Fase 2 — Auth, tenant y unidad

```text id="rss-plan-phase-02"
[ ] Integrar Keycloak OIDC.
[ ] Implementar login/logout/callback.
[ ] Implementar SessionProvider.
[ ] Implementar TenantProvider.
[ ] Implementar PropertyUnitProvider.
[ ] Implementar PermissionProvider.
[ ] Implementar selector de tenant.
[ ] Implementar selector de unidad.
[ ] Implementar cache clear por tenant/unidad.
```

---

### Fase 3 — API client y layout

```text id="rss-plan-phase-03"
[ ] Generar cliente OpenAPI.
[ ] Configurar API client.
[ ] Configurar TanStack Query.
[ ] Crear ResidentAppShell.
[ ] Crear navegación responsive.
[ ] Crear componentes base.
[ ] Crear error handling global.
```

---

### Fase 4 — Módulos prioridad 1

```text id="rss-plan-phase-04"
[ ] Dashboard residente.
[ ] Estado de cuenta.
[ ] Cargos.
[ ] Pagos.
[ ] Carga de comprobantes.
[ ] Comunicados.
```

---

### Fase 5 — Módulos prioridad 2

```text id="rss-plan-phase-05"
[ ] Reservas.
[ ] Multas.
[ ] Apelaciones.
[ ] Documentos.
[ ] Mantenimiento.
[ ] Visitantes.
[ ] Perfil.
```

---

### Fase 6 — Gobernanza

```text id="rss-plan-phase-06"
[ ] Reuniones.
[ ] Asistencia.
[ ] Votaciones.
[ ] Actas publicadas.
```

---

### Fase 7 — Hardening

```text id="rss-plan-phase-07"
[ ] Tests unitarios.
[ ] Tests de componentes.
[ ] Tests E2E.
[ ] Security review.
[ ] Accessibility review básico.
[ ] Performance baseline.
[ ] CI/CD.
```

---

## 28. Plan de PRs sugerido

```text id="rss-plan-prs"
PR-030-01 — App foundation, tooling, Tailwind, shadcn/ui and environment config.
PR-030-02 — Keycloak auth, session, tenant selector, unit selector and permissions.
PR-030-03 — OpenAPI client, TanStack Query, error handling and layout.
PR-030-04 — Dashboard, account statement, charges and payments.
PR-030-05 — Payment receipt upload and secure documents.
PR-030-06 — Reservations, fines, appeals and communications.
PR-030-07 — Maintenance requests, visitors and profile.
PR-030-08 — Meetings, voting and published minutes.
PR-030-09 — Tests, accessibility, security hardening, performance and CI/CD.
```

---

## 29. Riesgos técnicos

| Riesgo                             |   Nivel | Mitigación                                         |
| ---------------------------------- | ------: | -------------------------------------------------- |
| Residente ve datos de otra unidad  | Crítico | backend .own authorization + property-scoped tests |
| Cache muestra unidad anterior      |    Alto | query keys con tenant + unidad + clear cache       |
| storageKey visible                 | Crítico | SecureDocumentLink solo con secureDocumentId       |
| WordPress expone datos privados    | Crítico | no WordPress auth/no public routes                 |
| Pago propio validado indebidamente | Crítico | no admin payment actions in resident app           |
| Datos sensibles en URL             |    Alto | filtros seguros y body en mutaciones               |
| XSS en comunicados                 |    Alto | escaping, sanitización, CSP                        |
| Token expuesto                     |    Alto | OIDC seguro, BFF recomendado                       |
| Usuario no elegible vota           |    Alto | eligibility backend + UI guard                     |
| Visitantes de otra unidad visibles |    Alto | property-scoped API + tests                        |

---

## 30. Definition of Done

```text id="rss-plan-dod"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md creado y aprobado.
[ ] api-contract.md creado y aprobado.
[ ] test-plan.md creado y aprobado.
[ ] tasks.md creado y aprobado.
[ ] security-notes.md creado y aprobado.
[ ] App Next.js creada.
[ ] TypeScript strict activo.
[ ] Tailwind/shadcn configurados.
[ ] Keycloak login/logout/callback implementado.
[ ] Tenant selector implementado.
[ ] Unit selector implementado.
[ ] PermissionProvider implementado.
[ ] PropertyScopeGuard implementado.
[ ] OpenAPI client generado.
[ ] TanStack Query configurado.
[ ] Layout responsive implementado.
[ ] Dashboard residente implementado.
[ ] Estado de cuenta propio implementado.
[ ] Pagos propios implementados.
[ ] Comprobantes por SDS implementados.
[ ] Reservas propias implementadas.
[ ] Multas/apelaciones propias implementadas.
[ ] Comunicados implementados.
[ ] Documentos seguros implementados.
[ ] Mantenimiento propio implementado.
[ ] Visitantes propios implementados.
[ ] Perfil propio implementado.
[ ] Tests críticos implementados.
[ ] No storageKey exposure verificado.
[ ] No WordPress auth verificado.
[ ] No public transactional routes verificado.
[ ] CI/CD implementado.
```

---

## 31. No aceptación

No se acepta implementación si:

```text id="rss-plan-no-acceptance"
- usa sesión WordPress;
- expone rutas públicas transaccionales;
- permite seleccionar tenant no autorizado;
- permite seleccionar unidad no vinculada;
- muestra datos de otra unidad;
- mantiene cache del tenant o unidad anterior;
- muestra storageKey;
- guarda signedUrl persistente;
- registra tokens en console;
- incluye tokens o datos sensibles en URL;
- llama directamente a PostgreSQL;
- usa Prisma en frontend;
- calcula saldos finales en UI;
- valida pagos administrativamente;
- crea cargos desde self-service;
- modifica saldos;
- crea JournalEntry directo;
- confirma conciliación bancaria;
- abre portones;
- controla hardware;
- usa biometría;
- usa reconocimiento facial;
- usa IA externa con datos reales;
- ignora errores 403/404/422 del backend.
```

---

## 32. Resultado esperado

```text id="rss-plan-expected-result"
plan técnico definido
resident web app desacoplada
stack frontend definido
Keycloak OIDC definido
tenant selector definido
unit selector definido
property-scoped UI definida
OpenAPI client definido
TanStack Query definido
dashboard residente definido
estado de cuenta propio definido
pagos propios definidos
reservas propias definidas
multas propias definidas
comunicados definidos
documentos seguros definidos
mantenimiento propio definido
visitantes propios definidos
perfil propio definido
security boundaries definidos
deployment inicial definido
PR plan definido
DoD definido
no acceptance definido
```

---

## 33. Expediente actualizado

```text id="rss-plan-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 030-resident-self-service-basic/
│   │       ├── spec.md
│   │       └── plan.md
```
