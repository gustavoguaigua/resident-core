# Data Model — 029 Admin Web App Basic

## 1. Información del documento

| Campo          | Valor                                                                            |
| -------------- | -------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                    |
| Spec ID        | 029                                                                              |
| Módulo         | Admin Web App Basic                                                              |
| Documento      | Data Model                                                                       |
| Ruta           | `docs/specs/029-admin-web-app-basic/data-model.md`                               |
| Versión        | 0.1                                                                              |
| Estado         | Borrador inicial                                                                 |
| Fecha          | 2026-08-03                                                                       |
| Naturaleza     | Frontend data model / Client state / API DTO mapping / Non-persistent by default |
| Stack sugerido | Next.js / React / TypeScript / TanStack Query / OpenAPI Client / Keycloak OIDC   |

---

## 2. Propósito

Definir el modelo de datos usado por la aplicación administrativa básica de RESIDENT.

Este documento no define nuevas tablas transaccionales principales en PostgreSQL. El módulo `029-admin-web-app-basic` es una aplicación frontend que consume modelos expuestos por RESIDENT Core API y mantiene únicamente estado de interfaz, sesión, tenant activo, permisos efectivos, filtros, paginación, formularios, cache y preferencias no sensibles.

Regla central:

```text id="awa-dm-rule"
Admin Web App Basic no debe crear una fuente de verdad propia para datos transaccionales; debe consumir modelos oficiales del Core API, mantener solo estado de UI, cache invalidable y preferencias no sensibles, sin almacenar storageKey, secretos, tokens inseguros, tenantId editable, actor fields, datos financieros raw, datos personales innecesarios ni información cross-tenant.
```

---

## 3. Clasificación del modelo

```text id="awa-dm-classification"
Frontend state model
API DTO projection model
Permission-aware model
Tenant-aware model
Cache-aware model
Non-transactional model
Non-source-of-truth model
No direct DB model
No Prisma model
No storageKey model
```

---

## 4. Principios

```text id="awa-dm-principles"
1. RESIDENT Core API es la fuente de verdad.
2. El frontend no persiste datos transaccionales.
3. El frontend no define entidades financieras propias.
4. El frontend no calcula saldos finales.
5. El frontend no almacena storageKey.
6. El frontend no almacena secretos.
7. El frontend no debe guardar tokens en localStorage si se usa BFF.
8. El cache debe separarse por tenant.
9. El cache debe invalidarse al cambiar tenant.
10. Los permisos efectivos vienen del Core.
11. La UI puede ocultar acciones, pero el backend autoriza.
12. Los formularios no deben incluir tenantId editable.
13. Los formularios no deben incluir actor fields.
14. Los errores deben conservar traceId.
15. Los documentos se manejan por secureDocumentId.
```

---

## 5. No se crean tablas transaccionales nuevas

Para el MVP:

```text id="awa-dm-no-new-tables"
Admin Web App Basic no requiere nuevas tablas transaccionales en PostgreSQL.
```

Motivo:

```text id="awa-dm-no-new-tables-reason"
La app administrativa es una capa de presentación y operación sobre APIs existentes. Los datos principales pertenecen a los módulos 001 a 028 y futuros módulos del Core.
```

No crear:

```text id="awa-dm-forbidden-db"
admin_users
admin_roles
admin_permissions
admin_payments
admin_balances
admin_cache
admin_documents
admin_storage_keys
admin_audit_events
```

---

## 6. Modelos frontend principales

```text id="awa-dm-client-models"
AuthSession
AuthenticatedUser
UserTenantMembership
TenantOption
ActiveTenantContext
EffectivePermissionSet
NavigationItem
RouteAccessRule
ApiErrorModel
PaginatedResult
DataTableState
FilterState
FormState
MutationState
SecureDocumentReference
DashboardViewModel
ImportBatchViewModel
FrontendFeatureFlags
UiPreferences
```

---

## 7. `AuthSession`

Representa el estado autenticado de la app.

```typescript id="awa-dm-auth-session"
type AuthSession = {
  isAuthenticated: boolean;
  status: "loading" | "authenticated" | "unauthenticated" | "expired";
  accessTokenAvailable: boolean;
  expiresAt?: string;
  user?: AuthenticatedUser;
};
```

Reglas:

```text id="awa-dm-auth-session-rules"
- No exponer token en componentes visuales.
- No registrar token en console.
- No incluir token en URL.
- No persistir token en localStorage si se usa BFF.
- Logout limpia sesión, tenant activo y cache.
```

---

## 8. `AuthenticatedUser`

```typescript id="awa-dm-auth-user"
type AuthenticatedUser = {
  userProfileId: string;
  keycloakSubjectId: string;
  email: string;
  displayName: string;
  status: "active" | "inactive" | "blocked";
};
```

Reglas:

```text id="awa-dm-auth-user-rules"
- keycloakSubjectId no debe usarse como permiso.
- El usuario no decide sus roles desde frontend.
- El perfil se obtiene desde Core API.
```

---

## 9. `UserTenantMembership`

```typescript id="awa-dm-membership"
type UserTenantMembership = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  membershipStatus: "active" | "inactive" | "suspended";
  roles: string[];
  permissions: string[];
};
```

Reglas:

```text id="awa-dm-membership-rules"
- Solo memberships activas pueden seleccionarse.
- Las permissions son efectivas, entregadas por Core.
- El frontend no calcula permisos desde roles si Core ya devuelve permisos efectivos.
```

---

## 10. `TenantOption`

Modelo para selector de tenant.

```typescript id="awa-dm-tenant-option"
type TenantOption = {
  tenantId: string;
  slug: string;
  name: string;
  status: "active" | "inactive" | "suspended";
  logoUrl?: string;
  primaryColor?: string;
};
```

Reglas:

```text id="awa-dm-tenant-option-rules"
- tenantId no se edita en formularios.
- El selector solo muestra tenants autorizados.
- Cambiar tenant invalida cache y formularios abiertos.
```

---

## 11. `ActiveTenantContext`

```typescript id="awa-dm-active-tenant"
type ActiveTenantContext = {
  tenantId: string;
  slug: string;
  name: string;
  selectedAt: string;
  permissionHash: string;
};
```

Reglas:

```text id="awa-dm-active-tenant-rules"
- Debe limpiarse al logout.
- Debe validarse contra memberships vigentes.
- No reemplaza validación backend.
- Debe incluirse en query keys, no como campo editable de formularios.
```

---

## 12. `EffectivePermissionSet`

```typescript id="awa-dm-permission-set"
type EffectivePermissionSet = {
  permissions: string[];
  permissionHash: string;
  loadedAt: string;
};
```

Funciones derivadas:

```typescript id="awa-dm-permission-functions"
type HasPermission = (permission: string) => boolean;
type HasAnyPermission = (permissions: string[]) => boolean;
type HasAllPermissions = (permissions: string[]) => boolean;
```

Reglas:

```text id="awa-dm-permission-rules"
- PermissionSet solo controla UI.
- Backend sigue autorizando cada endpoint.
- PermissionHash puede usarse para cache keys.
- No guardar permisos indefinidamente sin refresh.
```

---

## 13. `NavigationItem`

```typescript id="awa-dm-navigation-item"
type NavigationItem = {
  key: string;
  label: string;
  href: string;
  icon?: string;
  requiredPermissions: string[];
  children?: NavigationItem[];
  moduleKey: string;
  enabled: boolean;
};
```

Reglas:

```text id="awa-dm-navigation-rules"
- Si no tiene permiso, ocultar o deshabilitar.
- Ocultar navegación no reemplaza autorización backend.
- No mostrar rutas públicas administrativas.
```

---

## 14. `RouteAccessRule`

```typescript id="awa-dm-route-access-rule"
type RouteAccessRule = {
  routePattern: string;
  requiredPermissions: string[];
  requiresTenant: boolean;
  requiresAuth: boolean;
  forbiddenRedirect: "/forbidden";
};
```

Rutas que siempre requieren auth:

```text id="awa-dm-auth-routes"
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

---

## 15. `ApiErrorModel`

```typescript id="awa-dm-api-error"
type ApiErrorModel = {
  httpStatus: 400 | 401 | 403 | 404 | 409 | 413 | 415 | 422 | 429 | 500;
  code: string;
  message: string;
  traceId?: string;
  fieldErrors?: Record<string, string[]>;
  details?: unknown;
};
```

Mapeo UI:

```text id="awa-dm-api-error-mapping"
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

```text id="awa-dm-api-error-rules"
- Mostrar traceId si existe.
- No mostrar stack trace crudo.
- No mostrar payload sensible.
- No revelar que un 404 fue cross-tenant.
```

---

## 16. `PaginatedResult`

```typescript id="awa-dm-paginated-result"
type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    traceId?: string;
  };
};
```

Reglas:

```text id="awa-dm-pagination-rules"
- pageSize máximo debe respetar API.
- No cargar datasets completos masivos.
- Tablas administrativas usan paginación server-side.
```

---

## 17. `DataTableState`

```typescript id="awa-dm-data-table-state"
type DataTableState = {
  page: number;
  pageSize: number;
  sort?: string;
  search?: string;
  selectedRowIds: string[];
  filters: FilterState;
};
```

Reglas:

```text id="awa-dm-table-rules"
- selectedRowIds se limpian al cambiar tenant.
- filtros no deben contener datos sensibles innecesarios.
- filtros no deben incluir tenantId editable.
```

---

## 18. `FilterState`

```typescript id="awa-dm-filter-state"
type FilterState = {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  moduleKey?: string;
  [key: string]: unknown;
};
```

Campos prohibidos en filtros:

```text id="awa-dm-filter-forbidden"
tenantId
createdBy
updatedBy
approvedBy
executedBy
archivedBy
storageKey
signedUrl
rawSql
script
formulaCode
token
secret
password
apiKey
```

---

## 19. `FormState`

```typescript id="awa-dm-form-state"
type FormState<T> = {
  values: T;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  fieldErrors: Record<string, string[]>;
  lastSubmittedAt?: string;
};
```

Reglas:

```text id="awa-dm-form-rules"
- No incluir tenantId editable.
- No incluir actor fields.
- No incluir status directo salvo transición permitida por endpoint.
- No incluir storageKey.
- No incluir rawSql/script/formulaCode.
- Submit doble debe bloquearse.
- Backend es autoridad final de validación.
```

---

## 20. `MutationState`

```typescript id="awa-dm-mutation-state"
type MutationState = {
  status: "idle" | "pending" | "success" | "error";
  submittedAt?: string;
  error?: ApiErrorModel;
  traceId?: string;
};
```

Reglas:

```text id="awa-dm-mutation-rules"
- Mutaciones críticas requieren ConfirmDialog.
- Mutaciones críticas no deben repetirse por doble click.
- La idempotencia final la maneja backend.
- Error 422 debe mapearse a campos.
```

---

## 21. `SecureDocumentReference`

```typescript id="awa-dm-secure-document"
type SecureDocumentReference = {
  secureDocumentId: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  classification?: "publicSummary" | "internal" | "restricted" | "financialSensitive" | "personalDataSensitive";
};
```

Reglas:

```text id="awa-dm-secure-document-rules"
- UI solo usa secureDocumentId.
- UI nunca muestra storageKey.
- UI nunca guarda signedUrl persistente.
- Descarga debe usar flujo autorizado del módulo 016.
```

---

## 22. `DashboardViewModel`

```typescript id="awa-dm-dashboard-view-model"
type DashboardViewModel = {
  dashboardKey: string;
  title: string;
  periodFrom: string;
  periodTo: string;
  availability: "available" | "partial" | "unavailable";
  widgets: DashboardWidgetViewModel[];
};

type DashboardWidgetViewModel = {
  widgetKey: string;
  title: string;
  type: "kpiCard" | "numberCard" | "currencyCard" | "percentageCard" | "trendCard" | "tableSummary" | "alertList";
  value?: string | number;
  status: "available" | "partial" | "unavailable";
  requiredPermissions: string[];
};
```

Reglas:

```text id="awa-dm-dashboard-rules"
- No calcular KPIs finales en frontend.
- Mostrar valores devueltos por API.
- Respetar widgets filtrados por permiso.
- No exponer datos financieros sensibles sin permiso.
```

---

## 23. `ImportBatchViewModel`

Modelo para UI de `028-data-import-migration`.

```typescript id="awa-dm-import-batch-view-model"
type ImportBatchViewModel = {
  id: string;
  batchCode: string;
  importType: string;
  title: string;
  status: string;
  rowCount?: number;
  validRowCount?: number;
  invalidRowCount?: number;
  warningCount?: number;
  errorCount?: number;
  dryRunRequired: boolean;
  approvalRequired: boolean;
  createdAt: string;
};
```

Acciones UI permitidas según estado:

```text id="awa-dm-import-actions"
draft -> uploadFile
fileUploaded -> configureMapping
mappingConfigured -> validate
validated -> preview
previewReady -> dryRun / submitApproval
pendingApproval -> approve
approved -> execute
any allowed pre-final state -> cancel
final state -> archive
```

Reglas:

```text id="awa-dm-import-rules"
- UI no cambia status directamente.
- UI invoca endpoints de transición.
- UI no envía approvedBy.
- UI no envía executedBy.
- UI no envía storageKey.
- UI no procesa archivo fuera del flujo autorizado.
```

---

## 24. `FrontendFeatureFlags`

```typescript id="awa-dm-feature-flags"
type FrontendFeatureFlags = {
  adminWebAppEnabled: boolean;
  publicModeEnabled: false;
  wordpressAuthEnabled: false;
  storageKeyDisplayEnabled: false;
  externalAiEnabled: false;
  hardwareControlEnabled: false;
  directDbAccessEnabled: false;
  paymentCaptureEnabled: false;
  accountingDirectEntryEnabled: false;
};
```

Regla:

```text id="awa-dm-feature-flag-rule"
El build o runtime debe fallar si cualquier flag prohibido se evalúa como true.
```

---

## 25. `UiPreferences`

Preferencias no sensibles.

```typescript id="awa-dm-ui-preferences"
type UiPreferences = {
  sidebarCollapsed?: boolean;
  density?: "comfortable" | "compact";
  theme?: "system" | "light" | "dark";
  lastSelectedTenantSlug?: string;
};
```

Reglas:

```text id="awa-dm-ui-preferences-rules"
- No guardar tokens.
- No guardar permisos completos indefinidamente.
- No guardar datos personales.
- No guardar tenantId si puede usarse slug o referencia no sensible.
- No guardar storageKey.
```

Persistencia permitida:

```text id="awa-dm-ui-persistence"
localStorage o cookie solo para preferencias no sensibles.
```

---

## 26. Query keys

Patrón obligatorio:

```typescript id="awa-dm-query-key-pattern"
["tenant", activeTenant.slug, "module", moduleKey, "resource", resourceKey, filtersHash]
```

Ejemplos:

```typescript id="awa-dm-query-key-examples"
["tenant", "san-jose-la-salle-2", "dashboard", "executive", filtersHash]
["tenant", "san-jose-la-salle-2", "payments", "list", filtersHash]
["tenant", "san-jose-la-salle-2", "imports", "batches", filtersHash]
```

Reglas:

```text id="awa-dm-query-key-rules"
- Toda query tenant-scoped incluye tenant.
- El cambio de tenant invalida todas las queries.
- Datos sensibles usan staleTime bajo.
- No incluir tokens en query keys.
- No incluir datos personales completos en query keys.
```

---

## 27. DTO mapping

### 27.1. Regla general

```text id="awa-dm-dto-rule"
El frontend debe mapear formularios a DTOs oficiales del OpenAPI, eliminando campos prohibidos y evitando modelos improvisados.
```

---

### 27.2. Campos prohibidos en request models

```text id="awa-dm-request-forbidden"
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

---

### 27.3. Campos prohibidos en UI responses

```text id="awa-dm-response-forbidden"
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
raw personal data innecesaria
datos cross-tenant
authorization header
cookie
```

---

## 28. Cache model

```typescript id="awa-dm-cache-model"
type AdminCacheBoundary = {
  tenantSlug: string;
  permissionHash: string;
  moduleKey: string;
  resourceKey: string;
};
```

Reglas:

```text id="awa-dm-cache-rules"
- Cache debe estar aislado por tenant.
- Cache debe considerar permisos cuando los datos dependan de permisos.
- Cache se limpia al logout.
- Cache se limpia al cambiar tenant.
- Cache se invalida después de mutaciones.
- Cache no persiste storageKey.
- Cache no persiste signedUrl.
```

---

## 29. Estado de pantallas

```typescript id="awa-dm-screen-state"
type ScreenState<T> =
  | { type: "loading" }
  | { type: "empty"; message: string }
  | { type: "loaded"; data: T }
  | { type: "partial"; data: T; warning: string }
  | { type: "forbidden"; traceId?: string }
  | { type: "notFound"; traceId?: string }
  | { type: "conflict"; message: string; traceId?: string }
  | { type: "validationError"; fieldErrors: Record<string, string[]>; traceId?: string }
  | { type: "error"; message: string; traceId?: string };
```

Reglas:

```text id="awa-dm-screen-state-rules"
- 403 nunca se muestra como error genérico.
- 404 no revela cross-tenant.
- 422 debe vincularse a formularios.
- 500 debe mostrar traceId si existe.
```

---

## 30. Modelo de documentos seguros en UI

Flujo:

```text id="awa-dm-document-flow"
1. API devuelve secureDocumentId.
2. UI muestra SecureDocumentLink.
3. Usuario solicita ver/descargar.
4. UI llama endpoint autorizado del módulo 016.
5. Core valida permisos.
6. Core genera acceso temporal si corresponde.
7. UI nunca persiste URL sensible.
```

Prohibido:

```text id="awa-dm-document-forbidden"
- mostrar storageKey;
- guardar signedUrl;
- copiar storageKey al clipboard;
- incluir storageKey en logs;
- construir URLs manualmente hacia bucket.
```

---

## 31. Modelo de auditoría UI

La app no escribe auditoría directa en base.

Debe enviar:

```text id="awa-dm-audit-ui-send"
- reason cuando endpoint lo requiera;
- request válido;
- headers estándar;
- correlationId si Core lo define.
```

No debe enviar:

```text id="awa-dm-audit-ui-forbidden"
- actorId;
- createdBy;
- approvedBy;
- executedBy;
- timestamps falsificados;
- audit metadata manipulada;
- storageKey;
- raw payload sensible.
```

---

## 32. Validaciones frontend

Validaciones permitidas:

```text id="awa-dm-frontend-validation"
- requerido;
- longitud máxima;
- formato de correo;
- formato de fecha;
- número decimal;
- enums;
- confirmación de acción crítica;
- tamaño de archivo antes de upload;
- extensión de archivo;
- campos permitidos por schema.
```

Validaciones no finales:

```text id="awa-dm-frontend-validation-non-final"
- permisos definitivos;
- reglas financieras;
- saldos;
- conciliación;
- validación final de pagos;
- unicidad global;
- tenant isolation;
- idempotencia final.
```

Regla:

```text id="awa-dm-validation-rule"
La validación frontend mejora usabilidad, pero la validación definitiva ocurre en Core API.
```

---

## 33. Persistencia local permitida

Permitido:

```text id="awa-dm-local-allowed"
- theme;
- sidebarCollapsed;
- table density;
- último tenant seleccionado por slug;
- filtros no sensibles.
```

Prohibido:

```text id="awa-dm-local-forbidden"
- accessToken si hay BFF;
- refreshToken;
- password;
- clientSecret;
- storageKey;
- signedUrl;
- datos personales completos;
- datos financieros raw;
- comprobantes;
- identificaciones;
- placas;
- roles/permisos indefinidamente;
- payloads de importación.
```

---

## 34. Compatibilidad con microservicios

```text id="awa-dm-microservices"
- La app depende de contratos OpenAPI versionados.
- No depende de tablas internas.
- No depende de joins internos.
- No depende de Prisma schema.
- Puede consumir gateway futuro.
- Puede soportar separación física de microservicios si el contrato API se mantiene.
```

---

## 35. No aceptación del modelo

No se acepta el modelo si:

```text id="awa-dm-no-acceptance"
- define tablas transaccionales propias para datos Core;
- usa Prisma en frontend;
- accede directo a PostgreSQL;
- persiste storageKey;
- persiste signedUrl;
- persiste tokens inseguros;
- guarda datos cross-tenant;
- permite tenantId editable;
- permite actor fields en formularios;
- calcula saldos finales en frontend;
- valida pagos sin backend;
- confirma conciliación desde frontend;
- crea asientos contables desde frontend;
- controla hardware;
- usa sesión WordPress;
- usa IA externa con datos reales;
- cachea datos sensibles sin tenant boundary;
- no invalida cache al cambiar tenant.
```

---

## 36. Resultado esperado

```text id="awa-dm-expected-result"
modelo frontend definido
sin nuevas tablas transaccionales
AuthSession definido
AuthenticatedUser definido
TenantOption definido
ActiveTenantContext definido
EffectivePermissionSet definido
NavigationItem definido
RouteAccessRule definido
ApiErrorModel definido
PaginatedResult definido
DataTableState definido
FormState definido
MutationState definido
SecureDocumentReference definido
DashboardViewModel definido
ImportBatchViewModel definido
FeatureFlags definidos
UiPreferences definidas
query keys tenant-scoped definidas
cache boundary definido
campos prohibidos definidos
no storageKey
no direct DB
no Prisma frontend
no WordPress session
```

---

## 37. Expediente actualizado

```text id="awa-dm-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 029-admin-web-app-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── data-model.md
```
