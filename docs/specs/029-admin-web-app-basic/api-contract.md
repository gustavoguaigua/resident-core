# API Contract — 029 Admin Web App Basic

## 1. Información del documento

| Campo      | Valor                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| Proyecto   | RESIDENT Core                                                            |
| Spec ID    | 029                                                                      |
| Módulo     | Admin Web App Basic                                                      |
| Documento  | API Contract                                                             |
| Ruta       | `docs/specs/029-admin-web-app-basic/api-contract.md`                     |
| Versión    | 0.1                                                                      |
| Estado     | Borrador inicial                                                         |
| Fecha      | 2026-08-03                                                               |
| Tipo       | Frontend API Consumption Contract                                        |
| Base API   | `/api/v1`                                                                |
| Auth       | Keycloak OIDC / Bearer token                                             |
| Naturaleza | Tenant-scoped / Permission-aware / API-first / Non-public / Admin-facing |

---

## 2. Propósito

Definir el contrato de consumo API de `029-admin-web-app-basic`.

Este documento no crea nuevos endpoints backend propios del frontend, salvo endpoints técnicos mínimos si se implementa patrón BFF. Su objetivo principal es definir cómo la aplicación administrativa consume los endpoints oficiales de RESIDENT Core de forma segura, tenant-aware, permission-aware y compatible con OpenAPI.

Regla central:

```text id="awa-api-rule"
Admin Web App Basic debe consumir exclusivamente APIs oficiales de RESIDENT Core, autenticadas, versionadas y documentadas en OpenAPI; no debe inventar contratos no definidos, no debe llamar directamente a base de datos, no debe usar Prisma, no debe enviar tenantId editable, no debe enviar actor fields, no debe mostrar storageKey, no debe usar sesión WordPress, no debe exponer rutas administrativas públicas y no debe ejecutar lógica transaccional crítica fuera del Core.
```

---

## 3. Principios de consumo API

```text id="awa-api-principles"
1. RESIDENT Core API es la fuente de verdad.
2. Admin Web App consume únicamente /api/v1.
3. Todo request administrativo requiere autenticación.
4. Todo request tenant-scoped requiere tenant activo.
5. La autorización final ocurre en Core API.
6. El frontend puede ocultar acciones, pero no autoriza definitivamente.
7. El cliente API debe generarse desde OpenAPI cuando sea viable.
8. No se deben usar contratos improvisados.
9. No se debe exponer storageKey.
10. No se deben enviar campos server-side.
11. No se deben guardar tokens, secretos o payloads sensibles en logs.
12. El cambio de tenant invalida cache.
13. Los errores deben preservar traceId.
```

---

## 4. Superficies API consumidas

La aplicación consumirá APIs existentes de módulos anteriores:

```text id="awa-api-surfaces"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-basic-reports
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
016-secure-document-storage
017-bank-reconciliation
020-accounting-ledger
021-supplier-payments
022-maintenance-work-orders
023-inventory-basic
024-access-control-visitors
025-tenant-settings-policies
026-automation-workflows-basic
027-dashboard-kpis
028-data-import-migration
```

Regla:

```text id="awa-api-surface-rule"
Si un endpoint requerido por la UI no existe en OpenAPI, se debe registrar un gap técnico. La app no debe crear un contrato informal ni depender de una ruta no documentada.
```

---

## 5. Convenciones generales

### 5.1. Base URL

```text id="awa-api-base-url"
NEXT_PUBLIC_RESIDENT_API_BASE_URL=https://api.resident.example.com/api/v1
```

Reglas:

```text id="awa-api-base-rules"
- No hardcodear URLs por ambiente.
- No apuntar directamente a servicios internos.
- No apuntar a PostgreSQL, Redis, storage interno ni Keycloak Admin API.
- Usar gateway/API oficial si existe.
```

---

### 5.2. Headers estándar

```http id="awa-api-headers"
Authorization: Bearer <access_token>
Accept: application/json
Content-Type: application/json
X-Request-Source: admin-web
```

Tenant context:

```text id="awa-api-tenant-header"
X-Tenant-Id: <tenant-id-or-approved-tenant-context>
```

Regla:

```text id="awa-api-tenant-header-rule"
El tenant context solo debe enviarse según la convención aprobada por RESIDENT Core. El backend sigue siendo autoridad final y debe validar membresía, permisos y tenant isolation.
```

---

### 5.3. Response envelope esperado

```json id="awa-api-response-envelope"
{
  "data": {},
  "meta": {
    "traceId": "trace-id"
  }
}
```

Para listas:

```json id="awa-api-list-envelope"
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "traceId": "trace-id"
  }
}
```

---

### 5.4. Error envelope esperado

```json id="awa-api-error-envelope"
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 6. Cliente API

### 6.1. Requerimiento

```text id="awa-api-client-requirement"
La app debe usar cliente generado desde OpenAPI siempre que sea viable.
```

Herramientas posibles:

```text id="awa-api-client-tools"
- openapi-typescript
- openapi-fetch
- Orval
- Swagger Codegen
```

Reglas:

```text id="awa-api-client-rules"
- Centralizar API client en lib/api.
- Centralizar baseURL.
- Centralizar token injection.
- Centralizar tenant context.
- Centralizar manejo de errores.
- No dispersar fetch manual.
- No usar endpoints no documentados.
- No enviar campos prohibidos.
```

---

## 7. Autenticación

### 7.1. Flujo

```text id="awa-api-auth-flow"
1. Usuario ingresa a Admin Web App.
2. App redirige a Keycloak.
3. Keycloak autentica.
4. App recibe callback OIDC.
5. App obtiene sesión válida.
6. App consulta contexto del usuario en Core API.
7. Core devuelve usuario, tenants, roles y permisos efectivos.
```

Flujo requerido:

```text id="awa-api-auth-required-flow"
Authorization Code Flow with PKCE
```

Prohibido:

```text id="awa-api-auth-forbidden"
- Implicit flow.
- Tokens en query params.
- Tokens en console.log.
- Tokens en localStorage si se implementa BFF.
- Uso de sesión WordPress.
- Login propio no federado para la app administrativa.
```

---

## 8. Endpoints de contexto inicial

### 8.1. Obtener perfil administrativo actual

Endpoint esperado del Core:

```http id="awa-api-me"
GET /api/v1/me
```

Permiso:

```text id="awa-api-me-permission"
authenticated
```

Response:

```json id="awa-api-me-response"
{
  "data": {
    "userProfileId": "uuid",
    "keycloakSubjectId": "keycloak-sub",
    "email": "admin@example.com",
    "displayName": "Administrador",
    "status": "active"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="awa-api-me-rules"
- El frontend no deduce permisos desde claims sin validación del Core.
- El Core debe ser fuente de verdad del perfil aplicativo.
```

---

### 8.2. Obtener tenants disponibles del usuario

Endpoint esperado:

```http id="awa-api-my-tenants"
GET /api/v1/me/tenants
```

Response:

```json id="awa-api-my-tenants-response"
{
  "data": [
    {
      "tenantId": "uuid",
      "slug": "san-jose-la-salle-2",
      "name": "San José La Salle 2",
      "membershipStatus": "active",
      "roles": ["tenantAdmin"],
      "permissions": ["tenantDashboards.read", "tenantImports.read"]
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="awa-api-my-tenants-rules"
- Solo tenants con membresía activa son seleccionables.
- Cambio de tenant debe invalidar cache.
- Si no hay tenants, mostrar estado usuario sin tenants.
```

---

### 8.3. Obtener permisos efectivos del tenant activo

Endpoint esperado:

```http id="awa-api-effective-permissions"
GET /api/v1/me/tenants/{tenantSlug}/permissions
```

Response:

```json id="awa-api-effective-permissions-response"
{
  "data": {
    "tenantSlug": "san-jose-la-salle-2",
    "permissions": [
      "tenantDashboards.read",
      "tenantImports.read",
      "tenantImports.create"
    ],
    "permissionHash": "hash"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="awa-api-effective-permissions-rules"
- La UI usa permisos para navegación y acciones visibles.
- El backend sigue validando cada endpoint.
- permissionHash puede usarse para cache keys.
```

---

## 9. Mapeo de rutas UI hacia APIs Core

### 9.1. Dashboard

Ruta UI:

```text id="awa-api-route-dashboard"
/app/dashboard
```

APIs consumidas:

```http id="awa-api-dashboard-endpoints"
GET /api/v1/tenant/dashboards
GET /api/v1/tenant/dashboards/{dashboardKey}
GET /api/v1/tenant/dashboards/{dashboardKey}/widgets
GET /api/v1/tenant/dashboards/{dashboardKey}/kpis
```

Permisos mínimos:

```text id="awa-api-dashboard-permissions"
tenantDashboards.read
tenantDashboardMetrics.read
```

Reglas:

```text id="awa-api-dashboard-rules"
- Mostrar solo widgets retornados por API.
- No calcular KPIs finales en frontend.
- No mostrar métricas sensibles sin permiso.
```

---

### 9.2. Residents and Properties

Rutas UI:

```text id="awa-api-route-residents-properties"
/app/residents
/app/properties
```

APIs consumidas:

```text id="awa-api-residents-properties-endpoints"
APIs oficiales de 003-residents-properties
```

Operaciones UI:

```text id="awa-api-residents-properties-ops"
- listar unidades;
- listar personas;
- ver detalle;
- crear/editar datos permitidos;
- asociar propietario/residente/unidad;
- consultar relaciones.
```

Reglas:

```text id="awa-api-residents-properties-rules"
- No enviar tenantId editable.
- No enviar createdBy/updatedBy.
- Enmascarar datos personales si API los devuelve enmascarados.
```

---

### 9.3. Users, Roles and Permissions

Ruta UI:

```text id="awa-api-route-users"
/app/users
```

APIs consumidas:

```text id="awa-api-users-endpoints"
APIs oficiales de 002-users-roles
```

Reglas:

```text id="awa-api-users-rules"
- No administrar Keycloak directamente desde UI.
- No crear usuarios saltándose Core.
- No modificar claims directamente.
- Mostrar permisos efectivos desde Core.
```

---

### 9.4. Dues, Fees and Account Statements

Rutas UI:

```text id="awa-api-route-dues"
/app/dues
/app/account-statements
```

APIs consumidas:

```text id="awa-api-dues-endpoints"
APIs oficiales de 004-dues-fees
APIs oficiales de 006-account-statements
```

Reglas:

```text id="awa-api-dues-rules"
- No calcular saldo final en frontend.
- No modificar saldos manualmente.
- Montos se muestran como string decimal.
- Backend es fuente de verdad financiera.
```

---

### 9.5. Payments

Ruta UI:

```text id="awa-api-route-payments"
/app/payments
```

APIs consumidas:

```text id="awa-api-payments-endpoints"
APIs oficiales de 005-payments
APIs oficiales de 016-secure-document-storage para comprobantes
```

Reglas:

```text id="awa-api-payments-rules"
- No procesar tarjetas en frontend.
- No ejecutar cobros bancarios directos.
- No validar pagos sin endpoint autorizado.
- No mostrar storageKey de comprobantes.
- Toda aprobación/rechazo se realiza por Core API.
```

---

### 9.6. Data Import and Migration

Ruta UI:

```text id="awa-api-route-imports"
/app/imports
```

APIs consumidas:

```http id="awa-api-import-endpoints"
GET    /api/v1/tenant/import-templates
GET    /api/v1/tenant/import-templates/{templateKey}
GET    /api/v1/tenant/import-batches
POST   /api/v1/tenant/import-batches
GET    /api/v1/tenant/import-batches/{batchId}
PATCH  /api/v1/tenant/import-batches/{batchId}
POST   /api/v1/tenant/import-batches/{batchId}/upload-file
POST   /api/v1/tenant/import-batches/{batchId}/configure-mapping
POST   /api/v1/tenant/import-batches/{batchId}/validate
POST   /api/v1/tenant/import-batches/{batchId}/preview
POST   /api/v1/tenant/import-batches/{batchId}/dry-run
POST   /api/v1/tenant/import-batches/{batchId}/submit-approval
POST   /api/v1/tenant/import-batches/{batchId}/approve
POST   /api/v1/tenant/import-batches/{batchId}/execute
GET    /api/v1/tenant/import-batches/{batchId}/issues
GET    /api/v1/tenant/import-batches/{batchId}/row-results
GET    /api/v1/tenant/import-batches/{batchId}/reports
POST   /api/v1/tenant/import-batches/{batchId}/reports
```

Reglas:

```text id="awa-api-import-rules"
- UI no cambia status directamente.
- UI llama endpoints de transición.
- UI no envía approvedBy/executedBy.
- UI no envía storageKey.
- UI no procesa archivo fuera de SDS.
- UI respeta dry-run y approval.
```

---

### 9.7. Secure Documents

Ruta UI:

```text id="awa-api-route-documents"
/app/documents
```

APIs consumidas:

```text id="awa-api-documents-endpoints"
APIs oficiales de 016-secure-document-storage
```

Reglas:

```text id="awa-api-documents-rules"
- UI solo usa secureDocumentId.
- UI no muestra storageKey.
- UI no guarda signedUrl persistente.
- Descarga siempre pasa por flujo autorizado del Core.
```

---

### 9.8. Audit and Reports

Rutas UI:

```text id="awa-api-route-audit-reports"
/app/audit
/app/reports
```

APIs consumidas:

```text id="awa-api-audit-reports-endpoints"
APIs oficiales de 007-audit
APIs oficiales de 008-basic-reports
```

Reglas:

```text id="awa-api-audit-reports-rules"
- No mostrar metadata sensible prohibida.
- No exponer datos cross-tenant.
- Respetar permisos de auditoría.
```

---

## 10. Endpoints administrativos prohibidos

La app no debe consumir ni exponer:

```text id="awa-api-forbidden-endpoints"
/api/v1/public/admin
/api/v1/public/dashboard
/api/v1/public/imports
/api/v1/public/payments
/api/v1/public/users
/api/v1/public/audit
/wp-admin/resident-core
/wordpress-admin/resident-core
/embed/admin
/embed/dashboard
```

Respuesta esperada si existen intentos:

```http id="awa-api-forbidden-response"
404 Not Found
```

---

## 11. DTOs prohibidos desde frontend

Todos los formularios y request models deben eliminar o rechazar:

```text id="awa-api-forbidden-dto-fields"
tenantId
createdBy
updatedBy
approvedBy
executedBy
cancelledBy
archivedBy
uploadedBy
requestedBy
status
storageKey
signedUrl
rawSql
sql
script
javascript
functionBody
executableCode
formulaCode
eval
Function
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
externalAiEnabled
externalAiRealDataAllowed
```

Regla:

```text id="awa-api-dto-rule"
La UI no debe construir ni enviar DTOs con campos server-side o campos prohibidos, aunque el backend también debe rechazarlos.
```

---

## 12. Campos prohibidos en responses renderizadas

La app no debe renderizar, guardar ni loggear:

```text id="awa-api-forbidden-response-fields"
storageKey
signedUrl persistente
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
rawSql
script
functionBody
executableCode
raw file content
authorization header
cookie
datos cross-tenant
datos personales completos sin permiso
payload financiero raw innecesario
```

---

## 13. Manejo de errores

Mapeo obligatorio:

```text id="awa-api-error-mapping"
400 -> BadRequestState
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

Reglas:

```text id="awa-api-error-rules"
- Mostrar traceId si existe.
- No mostrar stack traces.
- No mostrar payload sensible.
- No revelar cross-tenant en 404.
- 422 debe mapear fieldErrors a formularios.
```

---

## 14. Query params permitidos

Permitidos de forma general:

```text id="awa-api-query-allowed"
page
pageSize
sort
search
status
dateFrom
dateTo
periodFrom
periodTo
moduleKey
resourceType
```

Prohibidos:

```text id="awa-api-query-forbidden"
tenantId editable
rawSql
sql
script
formulaCode
storageKey
signedUrl
token
secret
password
apiKey
```

---

## 15. Mutaciones críticas

Requieren confirmación UI antes de llamar API:

```text id="awa-api-critical-mutations"
- validar o rechazar pago;
- crear cargos masivos;
- publicar comunicado crítico;
- publicar acta;
- aprobar importación;
- ejecutar importación;
- cancelar batch en ejecución;
- archivar registros críticos;
- activar automatización;
- ejecutar workflow manual;
- resolver apelación de multa;
- cambiar roles/permisos;
```

Reglas:

```text id="awa-api-critical-rules"
- Deshabilitar botón durante submit.
- Mostrar resumen antes de confirmar.
- Enviar reason si API lo exige.
- No enviar actor fields.
- Mostrar resultado y traceId si falla.
```

---

## 16. Caching API

Patrón de query key:

```typescript id="awa-api-query-key"
["tenant", activeTenant.slug, "module", moduleKey, "resource", resourceKey, filtersHash]
```

Reglas:

```text id="awa-api-cache-rules"
- Toda query tenant-scoped incluye tenant.
- Toda query sensible considera permissionHash.
- Cambio de tenant invalida cache.
- Logout limpia cache.
- Mutación exitosa invalida queries relacionadas.
- No cachear storageKey.
- No cachear signedUrl.
- No cachear payload sensible innecesario.
```

---

## 17. Upload y documentos seguros

### 17.1. Patrón para upload

```text id="awa-api-upload-pattern"
1. UI solicita flujo de carga autorizado al Core/SDS.
2. Core valida permiso.
3. Archivo se registra en Secure Document Storage.
4. Core devuelve secureDocumentId.
5. UI envía secureDocumentId al módulo consumidor.
```

Prohibido:

```text id="awa-api-upload-forbidden"
- enviar archivo base64 en JSON salvo endpoint explícitamente diseñado para eso;
- guardar storageKey;
- construir URL manual al bucket;
- guardar signedUrl persistente;
- subir documentos mediante WordPress público;
```

---

## 18. OpenAPI requirements

La app debe fallar build o CI si:

```text id="awa-api-openapi-fail"
- OpenAPI no está disponible.
- Cliente generado tiene errores.
- Se consume endpoint no documentado.
- Se detecta tenantId editable en DTO externo.
- Se detecta storageKey en DTO externo.
- Se detecta rawSql/script/formulaCode en DTO externo.
```

Extensiones esperadas en APIs administrativas:

```yaml id="awa-api-openapi-extensions"
x-auth-required: true
x-tenant-scope: true
x-public-exposure: false
x-wordpress-access: false
x-storage-key-exposed: false
x-raw-sql-allowed: false
x-scripting-allowed: false
x-external-ai-real-data: false
```

---

## 19. Si se implementa BFF

El patrón BFF es opcional, pero recomendado si se quiere mayor seguridad de tokens.

Endpoints BFF permitidos:

```text id="awa-api-bff-allowed"
/api/auth/login
/api/auth/callback
/api/auth/logout
/api/auth/session
```

Reglas BFF:

```text id="awa-api-bff-rules"
- Cookies httpOnly.
- Secure cookies en producción.
- SameSite=Lax o Strict según flujo.
- No exponer accessToken al JavaScript del browser si se usa BFF.
- No guardar clientSecret en bundle frontend.
- No convertir BFF en proxy público sin autorización.
```

Endpoints BFF prohibidos:

```text id="awa-api-bff-forbidden"
/api/public/admin-proxy
/api/proxy/raw-sql
/api/proxy/storage-key
/api/proxy/payment-capture
/api/proxy/hardware
```

---

## 20. Rate limiting y reintentos

Reglas UI:

```text id="awa-api-retry-rules"
- No reintentar automáticamente mutaciones críticas.
- Reintentar lecturas seguras con backoff limitado.
- No repetir submit por doble click.
- Mostrar RateLimitState ante 429.
- Respetar Retry-After si API lo devuelve.
```

Mutaciones que no deben reintentarse automáticamente:

```text id="awa-api-no-auto-retry"
- approve payment;
- reject payment;
- execute import;
- approve import;
- activate workflow;
- manual workflow run;
- publish communication;
- assign role;
- archive critical resource.
```

---

## 21. Seguridad de sesión

Reglas:

```text id="awa-api-session-rules"
- Logout limpia sesión.
- Logout limpia tenant activo.
- Logout limpia TanStack Query cache.
- Sesión expirada redirige a login.
- 401 global invalida sesión.
- No guardar accessToken en URL.
- No imprimir tokens.
- No persistir refreshToken en localStorage.
```

---

## 22. Contrato de estados UI por response

```text id="awa-api-ui-states"
2xx con data vacía -> EmptyState si aplica.
200 listado -> DataTable.
201 -> SuccessState + invalidar cache.
202 -> Pending/QueuedState + polling controlado si aplica.
401 -> SessionExpiredState.
403 -> ForbiddenState.
404 -> NotFoundState.
409 -> ConflictState.
413 -> PayloadTooLargeState.
415 -> UnsupportedMediaTypeState.
422 -> FormErrorSummary.
429 -> RateLimitState.
5xx -> ApiErrorState.
```

Polling permitido:

```text id="awa-api-polling-allowed"
- import validation status;
- import execution status;
- report generation status;
- automation execution status;
```

Reglas de polling:

```text id="awa-api-polling-rules"
- backoff gradual;
- límite de tiempo;
- detener al salir de pantalla;
- detener al cambiar tenant;
- no usar polling para datos públicos inexistentes.
```

---

## 23. Auditoría

La app no escribe audit directamente.

Debe:

```text id="awa-api-audit-ui-rules"
- enviar reason cuando el endpoint lo requiere;
- mostrar estado posterior a operación crítica;
- mostrar traceId en errores;
- no enviar actorId;
- no enviar timestamps falsificados;
- no enviar metadata de auditoría manipulada.
```

La auditoría formal la registra RESIDENT Core.

---

## 24. Observabilidad frontend

Eventos permitidos:

```text id="awa-api-observability-events"
adminApp.loaded
adminApp.route.changed
adminApp.api.error
adminApp.auth.sessionExpired
adminApp.tenant.changed
adminApp.criticalAction.submitted
adminApp.criticalAction.failed
```

Datos prohibidos en observabilidad:

```text id="awa-api-observability-forbidden"
tokens
passwords
authorization headers
cookies
storageKey
signedUrl
identificaciones
placas
comprobantes
datos financieros raw
payloads de importación
datos cross-tenant
```

---

## 25. Criterios de aceptación

```text id="awa-api-acceptance"
[ ] La app usa baseURL configurable.
[ ] La app usa cliente API centralizado.
[ ] La app consume OpenAPI oficial.
[ ] La app obtiene usuario actual desde Core.
[ ] La app obtiene tenants desde Core.
[ ] La app obtiene permisos efectivos desde Core.
[ ] La app envía Bearer token o usa BFF seguro.
[ ] La app resuelve tenant activo de forma segura.
[ ] La app invalida cache al cambiar tenant.
[ ] La app maneja 401/403/404/409/422/429/500 correctamente.
[ ] La app no consume endpoints públicos administrativos.
[ ] La app no consume WordPress como backend transaccional.
[ ] La app no envía tenantId editable.
[ ] La app no envía actor fields.
[ ] La app no envía status directo.
[ ] La app no muestra storageKey.
[ ] La app no guarda signedUrl persistente.
[ ] La app no llama PostgreSQL.
[ ] La app no usa Prisma.
[ ] La app no ejecuta lógica financiera final.
[ ] La app no ejecuta pagos fuera del Core.
[ ] La app no crea JournalEntry directo.
[ ] La app no controla hardware.
[ ] La app no envía datos reales a IA externa.
```

---

## 26. No aceptación

No se acepta el contrato si:

```text id="awa-api-no-acceptance"
- define endpoints administrativos públicos;
- depende de sesión WordPress;
- usa wp-admin como consola transaccional;
- consume rutas no documentadas sin gap;
- envía tenantId editable;
- envía createdBy/approvedBy/executedBy;
- envía status directo fuera de endpoint de transición;
- muestra storageKey;
- guarda signedUrl persistente;
- guarda tokens inseguros;
- imprime tokens en console;
- llama directamente a PostgreSQL;
- usa Prisma en frontend;
- ejecuta SQL desde frontend;
- calcula saldos finales;
- valida pagos sin Core API;
- confirma conciliaciones fuera del API autorizado;
- crea asientos contables desde UI;
- abre portones;
- controla hardware;
- usa IA externa con datos reales;
- omite traceId en errores cuando existe;
- oculta 403/404/422 como error genérico.
```

---

## 27. Resultado esperado

```text id="awa-api-expected-result"
contrato API frontend definido
OpenAPI como fuente de contratos definido
contexto /me definido
tenants del usuario definidos
permisos efectivos definidos
mapeo rutas UI hacia APIs definido
error handling definido
cache tenant-scoped definida
upload seguro definido
BFF opcional definido
no public admin endpoints
no WordPress auth
no storageKey
no direct DB access
no Prisma frontend
no frontend critical business logic
no external AI with real data
```

---

## 28. Expediente actualizado

```text id="awa-api-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 029-admin-web-app-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
