# Test Plan — 029 Admin Web App Basic

## 1. Información del documento

| Campo          | Valor                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                             |
| Spec ID        | 029                                                                                                       |
| Módulo         | Admin Web App Basic                                                                                       |
| Documento      | Test Plan                                                                                                 |
| Ruta           | `docs/specs/029-admin-web-app-basic/test-plan.md`                                                         |
| Versión        | 0.1                                                                                                       |
| Estado         | Borrador inicial                                                                                          |
| Fecha          | 2026-08-03                                                                                                |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC |
| Naturaleza     | Tenant-scoped / Permission-aware / API-first / Non-public / Admin-facing                                  |

---

## 2. Propósito

Definir las pruebas necesarias para validar que `029-admin-web-app-basic` funcione como una consola administrativa privada, segura, tenant-aware, permission-aware y desacoplada del portal WordPress.

Regla central de pruebas:

```text id="awa-test-rule"
Admin Web App Basic solo puede aceptarse si las pruebas demuestran autenticación segura con Keycloak, selección controlada de tenant, navegación por permisos, consumo exclusivo de APIs oficiales, cache aislada por tenant, ausencia de storageKey, ausencia de sesión WordPress, ausencia de rutas públicas administrativas, ausencia de acceso directo a base de datos, ausencia de Prisma en frontend, ausencia de lógica financiera crítica en UI, ausencia de control de hardware y ausencia de IA externa con datos reales.
```

---

## 3. Alcance de pruebas

Incluido:

```text id="awa-test-scope-in"
- Login OIDC.
- Logout.
- Callback OIDC.
- Session handling.
- Tenant selector.
- PermissionProvider.
- Route guards.
- PermissionGate.
- Layout administrativo.
- Sidebar permission-aware.
- API client generado desde OpenAPI.
- TanStack Query cache.
- Manejo de errores API.
- Formularios administrativos.
- SecureDocumentLink.
- Dashboard básico.
- Data import UI.
- Payments UI básica.
- Residents/properties UI básica.
- Users/roles UI básica.
- Tests de seguridad frontend.
- Tests E2E críticos.
- Tests de accesibilidad básica.
- Tests de performance baseline.
- CI gates.
```

Fuera de alcance:

```text id="awa-test-scope-out"
- Pruebas internas de reglas de negocio backend.
- Pruebas directas de PostgreSQL.
- Pruebas directas de Prisma.
- Pruebas de Keycloak Admin API.
- Pruebas de WordPress como backend transaccional.
- Pruebas de app residente final.
- Pruebas de app móvil nativa.
```

---

## 4. Tipos de pruebas

```text id="awa-test-types"
1. Unit tests.
2. Component tests.
3. Hook tests.
4. API client tests.
5. Permission tests.
6. Tenant context tests.
7. Form schema tests.
8. Security tests.
9. E2E tests.
10. Accessibility tests.
11. Performance baseline tests.
12. OpenAPI contract tests.
13. CI gate tests.
```

---

## 5. Datos de prueba mínimos

### 5.1. Tenants

```text id="awa-test-tenants"
tenantA = San José La Salle 2
tenantB = Altos del Norte
```

Regla:

```text id="awa-test-tenant-rule"
La UI nunca debe mostrar datos cacheados de tenantA cuando el usuario cambia a tenantB, ni viceversa.
```

---

### 5.2. Usuarios

```text id="awa-test-users"
platformAdmin
tenantAdminA
financialManagerA
securityManagerA
maintenanceManagerA
boardMemberA
residentA
tenantAdminB
anonymousUser
```

---

### 5.3. Permisos representativos

```text id="awa-test-permissions"
tenantDashboards.read
tenantDashboardMetrics.read
residents.read
residents.create
properties.read
tenantUsers.read
tenantUsers.assignRoles
dues.read
dues.create
payments.read
payments.validate
accountStatements.read
tenantImports.read
tenantImports.create
tenantImports.uploadFile
tenantImports.validate
tenantImports.runDryRun
tenantImports.approve
tenantImports.execute
tenantImports.exportReport
audit.read
reports.read
```

---

## 6. Unit tests

### 6.1. Auth helpers

```text id="awa-unit-auth"
[ ] Detecta sesión loading.
[ ] Detecta sesión authenticated.
[ ] Detecta sesión unauthenticated.
[ ] Detecta sesión expired.
[ ] Logout limpia sesión.
[ ] Logout limpia tenant activo.
[ ] Logout limpia cache.
[ ] No imprime tokens en console.
[ ] No coloca tokens en URL.
```

---

### 6.2. Tenant helpers

```text id="awa-unit-tenant"
[ ] Lista solo tenants con membership active.
[ ] Rechaza tenant inactive.
[ ] Rechaza tenant suspended.
[ ] Rechaza tenant no perteneciente al usuario.
[ ] Cambio de tenant invalida query cache.
[ ] Cambio de tenant limpia formularios abiertos.
[ ] Query key incluye tenant.
```

---

### 6.3. Permission helpers

```text id="awa-unit-permissions"
[ ] hasPermission retorna true si existe permiso.
[ ] hasPermission retorna false si no existe permiso.
[ ] hasAnyPermission valida permisos alternativos.
[ ] hasAllPermissions valida permisos acumulados.
[ ] PermissionHash se usa en cache sensible.
[ ] Permisos vacíos bloquean rutas privadas.
```

---

### 6.4. Error normalizer

```text id="awa-unit-errors"
[ ] 401 se mapea a SessionExpiredState.
[ ] 403 se mapea a ForbiddenState.
[ ] 404 se mapea a NotFoundState.
[ ] 409 se mapea a ConflictState.
[ ] 413 se mapea a PayloadTooLargeState.
[ ] 415 se mapea a UnsupportedMediaTypeState.
[ ] 422 se mapea a FormErrorSummary.
[ ] 429 se mapea a RateLimitState.
[ ] 500 se mapea a ApiErrorState.
[ ] traceId se conserva.
[ ] stack trace crudo no se muestra.
```

---

## 7. Component tests

### 7.1. Layout

```text id="awa-component-layout"
[ ] AppShell renderiza sidebar.
[ ] AppShell renderiza header.
[ ] HeaderBar muestra usuario.
[ ] HeaderBar muestra tenant actual.
[ ] Breadcrumbs refleja ruta actual.
[ ] LoadingState se muestra durante carga.
[ ] EmptyState se muestra sin datos.
[ ] ForbiddenState se muestra en 403.
[ ] NotFoundState se muestra en 404.
[ ] ApiErrorState muestra traceId.
```

---

### 7.2. TenantSwitcher

```text id="awa-component-tenant-switcher"
[ ] Muestra tenants autorizados.
[ ] No muestra tenants inactivos.
[ ] Cambia tenant correctamente.
[ ] Dispara invalidación de cache.
[ ] Bloquea tenant no autorizado.
[ ] Limpia selección previa al logout.
```

---

### 7.3. PermissionGate

```text id="awa-component-permission-gate"
[ ] Renderiza contenido con permiso.
[ ] Oculta contenido sin permiso.
[ ] Soporta any permission.
[ ] Soporta all permissions.
[ ] No reemplaza validación backend.
```

---

### 7.4. DataTable

```text id="awa-component-data-table"
[ ] Renderiza datos paginados.
[ ] Cambia page.
[ ] Cambia pageSize.
[ ] Aplica sort.
[ ] Aplica filtros.
[ ] Limpia selección al cambiar tenant.
[ ] No carga datasets completos masivos.
```

---

### 7.5. SecureDocumentLink

```text id="awa-component-secure-document-link"
[ ] Renderiza secureDocumentId.
[ ] No renderiza storageKey.
[ ] No guarda signedUrl persistente.
[ ] Llama endpoint seguro de documentos.
[ ] Maneja 403.
[ ] Maneja 404.
```

---

### 7.6. ConfirmDialog

```text id="awa-component-confirm-dialog"
[ ] Se muestra antes de acción crítica.
[ ] Requiere confirmación explícita.
[ ] Permite ingresar reason si aplica.
[ ] Bloquea doble submit.
[ ] Muestra error con traceId si falla.
```

---

## 8. Form schema tests

```text id="awa-form-tests"
[ ] Formularios rechazan tenantId editable.
[ ] Formularios rechazan createdBy.
[ ] Formularios rechazan updatedBy.
[ ] Formularios rechazan approvedBy.
[ ] Formularios rechazan executedBy.
[ ] Formularios rechazan status directo.
[ ] Formularios rechazan storageKey.
[ ] Formularios rechazan signedUrl.
[ ] Formularios rechazan rawSql.
[ ] Formularios rechazan script.
[ ] Formularios rechazan formulaCode.
[ ] Formularios rechazan token.
[ ] Formularios rechazan secret.
[ ] Formularios rechazan apiKey.
[ ] Formularios validan campos requeridos.
[ ] Formularios muestran errores 422 por campo.
```

---

## 9. API client tests

```text id="awa-api-client-tests"
[ ] API client usa baseURL configurable.
[ ] API client inyecta Authorization cuando aplica.
[ ] API client inyecta tenant context solo según convención aprobada.
[ ] API client normaliza response envelope.
[ ] API client normaliza error envelope.
[ ] API client conserva traceId.
[ ] API client no llama endpoints no documentados.
[ ] API client no llama rutas públicas administrativas.
[ ] API client no llama WordPress como backend transaccional.
[ ] API client no expone tokens en logs.
```

---

## 10. OpenAPI contract tests

```text id="awa-openapi-tests"
[ ] OpenAPI está disponible en CI.
[ ] Cliente API se genera sin errores.
[ ] Build falla si cambia contrato incompatible.
[ ] Build falla si se consume endpoint no documentado.
[ ] OpenAPI no expone storageKey en DTOs externos.
[ ] OpenAPI no expone rawSql en DTOs externos.
[ ] OpenAPI no expone script en DTOs externos.
[ ] OpenAPI no expone tenantId editable en DTOs externos.
[ ] OpenAPI incluye x-auth-required en endpoints administrativos.
[ ] OpenAPI incluye x-tenant-scope en endpoints tenant.
[ ] OpenAPI incluye x-public-exposure=false donde aplique.
```

---

## 11. Security tests

### 11.1. Auth security

```text id="awa-security-auth"
[ ] Usuario anónimo se redirige a login.
[ ] Usuario autenticado accede a /app/dashboard si tiene tenant.
[ ] Sesión expirada redirige a login.
[ ] Logout borra sesión local.
[ ] Logout borra cache.
[ ] No se imprimen tokens.
[ ] No se guardan tokens en URL.
[ ] No se usa sesión WordPress.
```

---

### 11.2. Tenant isolation frontend

```text id="awa-security-tenant"
[ ] tenantA no muestra datos de tenantB.
[ ] Cambio tenantA -> tenantB limpia cache.
[ ] Query key incluye tenant.
[ ] Formularios abiertos se invalidan al cambiar tenant.
[ ] selectedRowIds se limpian al cambiar tenant.
[ ] 404 cross-tenant no revela existencia del recurso.
```

---

### 11.3. Permission security

```text id="awa-security-permission"
[ ] Menú oculta rutas sin permiso.
[ ] Ruta sin permiso muestra ForbiddenState.
[ ] Acción sin permiso no se renderiza.
[ ] Acción sensible requiere permiso sensible.
[ ] Error 403 backend se respeta aunque el botón haya sido visible.
[ ] Resident no accede a Admin Web App MVP.
```

---

### 11.4. Forbidden data exposure

```text id="awa-security-forbidden-data"
[ ] UI no muestra storageKey.
[ ] UI no muestra signedUrl persistente.
[ ] UI no muestra authorization header.
[ ] UI no muestra token.
[ ] UI no registra payload financiero raw.
[ ] UI no registra identificación completa sin permiso.
[ ] UI no registra placa completa sin permiso.
[ ] UI no guarda comprobantes en cache persistente.
```

---

### 11.5. No prohibited architecture

```text id="awa-security-architecture"
[ ] No existe Prisma en frontend.
[ ] No existe conexión PostgreSQL en frontend.
[ ] No existe conexión Redis en frontend.
[ ] No existe Keycloak Admin API en frontend.
[ ] No existe WordPress auth en Admin Web App.
[ ] No existe ruta pública administrativa.
[ ] No existe función de apertura de portones.
[ ] No existe control de hardware.
[ ] No existe integración IA externa con datos reales.
```

---

## 12. E2E tests

### 12.1. Login and tenant selection

```text id="awa-e2e-login-tenant"
[ ] Usuario abre /app/dashboard sin sesión.
[ ] App redirige a login.
[ ] Usuario completa login mock/OIDC test.
[ ] App obtiene perfil.
[ ] App obtiene tenants.
[ ] Usuario selecciona tenantA.
[ ] App muestra dashboard tenantA.
[ ] Usuario cambia a tenantB.
[ ] App limpia cache y muestra dashboard tenantB.
```

---

### 12.2. Permission navigation

```text id="awa-e2e-permission-navigation"
[ ] financialManagerA ve Payments.
[ ] financialManagerA ve Dues.
[ ] financialManagerA no ve Access si no tiene permiso.
[ ] securityManagerA ve Access.
[ ] securityManagerA no ve Dues sensibles si no tiene permiso.
[ ] Ruta manual sin permiso muestra ForbiddenState.
```

---

### 12.3. Data import flow

```text id="awa-e2e-import-flow"
[ ] Usuario autorizado abre /app/imports.
[ ] Lista import templates.
[ ] Crea import batch.
[ ] Asocia archivo mediante secureDocumentId.
[ ] Configura mapping.
[ ] Ejecuta validate.
[ ] Consulta issues.
[ ] Genera preview.
[ ] Ejecuta dry-run.
[ ] Envía a aprobación.
[ ] Aprueba con permiso.
[ ] Ejecuta commit.
[ ] Consulta row results.
[ ] Genera reporte.
[ ] Reporte muestra secureDocumentId.
[ ] UI nunca muestra storageKey.
```

---

### 12.4. Payments flow

```text id="awa-e2e-payments"
[ ] FinancialManager abre /app/payments.
[ ] Lista pagos.
[ ] Abre detalle.
[ ] Visualiza comprobante mediante SecureDocumentLink.
[ ] Aprueba pago con ConfirmDialog.
[ ] Botón queda disabled durante submit.
[ ] Mutación invalida lista.
[ ] Error 422 se muestra correctamente si backend rechaza.
```

---

### 12.5. Error handling

```text id="awa-e2e-errors"
[ ] 401 muestra sesión expirada.
[ ] 403 muestra forbidden.
[ ] 404 muestra not found.
[ ] 409 muestra conflicto.
[ ] 422 muestra errores por campo.
[ ] 429 muestra rate limit.
[ ] 500 muestra error con traceId.
```

---

## 13. Accessibility tests básicos

```text id="awa-accessibility-tests"
[ ] Login es navegable por teclado.
[ ] Sidebar es navegable por teclado.
[ ] TenantSwitcher es accesible por teclado.
[ ] Formularios tienen labels.
[ ] Errores de formulario son anunciables.
[ ] Botones críticos tienen texto claro.
[ ] Modales manejan focus trap.
[ ] Contraste mínimo aceptable.
[ ] Tablas tienen encabezados accesibles.
[ ] Estados loading no bloquean lector de pantalla indefinidamente.
```

---

## 14. Performance baseline tests

Objetivos iniciales:

```text id="awa-performance-objectives"
[ ] First load p95 < 3 s en ambiente objetivo.
[ ] Navegación interna p95 < 1 s con cache.
[ ] Dashboard básico p95 < 2 s con API mock.
[ ] Tabla paginada p95 < 1.5 s con API mock.
[ ] Cambio de tenant p95 < 2 s.
[ ] Bundle inicial revisado.
[ ] Lazy loading por módulos críticos.
[ ] No cargar datasets completos masivos.
```

---

## 15. CI gates

El pipeline debe ejecutar:

```text id="awa-ci-gates"
[ ] TypeScript check.
[ ] ESLint.
[ ] Prettier check.
[ ] Unit tests.
[ ] Component tests.
[ ] Hook tests.
[ ] Form schema tests.
[ ] API client tests.
[ ] OpenAPI client generation.
[ ] Security static checks.
[ ] No forbidden imports.
[ ] E2E smoke tests.
[ ] Accessibility smoke tests.
[ ] Build production.
```

Pipeline debe fallar si:

```text id="awa-ci-fail"
[ ] Se importa Prisma en frontend.
[ ] Se configura conexión PostgreSQL.
[ ] Se configura conexión Redis.
[ ] Se usa Keycloak Admin API desde frontend.
[ ] Se detecta storageKey en componentes.
[ ] Se detecta rawSql/script/formulaCode en DTOs frontend.
[ ] Se detecta ruta pública administrativa.
[ ] Se detecta auth WordPress.
[ ] Se detecta console.log sensible.
[ ] Se consume endpoint no documentado.
[ ] Se rompe generación OpenAPI.
[ ] Tests críticos de tenant isolation fallan.
[ ] Tests críticos de permisos fallan.
```

---

## 16. Cobertura mínima

```text id="awa-coverage"
- Auth helpers: >= 90%.
- Tenant helpers: >= 95%.
- Permission helpers: >= 95%.
- Error normalizer: >= 95%.
- Form schemas: >= 90%.
- API client wrapper: >= 90%.
- Componentes críticos: >= 85%.
- Route guards: >= 95%.
- Security critical tests: 100% passing.
- Tenant isolation tests: 100% passing.
- Permission tests: 100% passing.
- No storageKey tests: 100% passing.
- No WordPress auth tests: 100% passing.
```

---

## 17. Smoke tests mínimos

```text id="awa-smoke-tests"
[ ] App carga.
[ ] Login funciona.
[ ] Logout funciona.
[ ] Selector de tenant funciona.
[ ] Dashboard carga.
[ ] Sidebar respeta permisos.
[ ] Ruta sin permiso bloquea.
[ ] Data import flow básico inicia.
[ ] Payments list carga con permiso.
[ ] SecureDocumentLink no expone storageKey.
[ ] Cambio de tenant limpia cache.
[ ] Error 422 se muestra en formulario.
[ ] Build production pasa.
```

---

## 18. No aceptación

No se acepta el módulo si las pruebas permiten:

```text id="awa-test-no-acceptance"
- sesión WordPress como autenticación;
- rutas públicas administrativas;
- tenant no autorizado;
- datos de tenant anterior por cache;
- menú o acción sin respetar permisos;
- storageKey visible;
- signedUrl persistente;
- tokens en URL;
- tokens en console;
- datos sensibles en console;
- Prisma en frontend;
- conexión directa a PostgreSQL;
- conexión directa a Redis;
- Keycloak Admin API desde frontend;
- contratos API no documentados;
- tenantId editable en formularios;
- actor fields en formularios;
- status directo en formularios;
- cálculo final de saldos en UI;
- validación de pagos sin Core API;
- creación de JournalEntry desde UI;
- confirmación de conciliación fuera del API autorizado;
- apertura de portones;
- control de hardware;
- IA externa con datos reales;
- errores 403/404/422 tratados como genéricos.
```

---

## 19. Definition of Done de pruebas

```text id="awa-test-dod"
[ ] Unit tests implementados.
[ ] Component tests implementados.
[ ] Hook tests implementados.
[ ] API client tests implementados.
[ ] OpenAPI contract tests implementados.
[ ] Form schema tests implementados.
[ ] Tenant isolation tests implementados.
[ ] Permission tests implementados.
[ ] Security tests implementados.
[ ] E2E smoke tests implementados.
[ ] Accessibility smoke tests implementados.
[ ] Performance baseline ejecutado.
[ ] CI gates configurados.
[ ] Tests críticos 100% passing.
```

---

## 20. Resultado esperado

```text id="awa-test-expected-result"
test plan definido
unit tests definidos
component tests definidos
hook tests definidos
API client tests definidos
OpenAPI contract tests definidos
form schema tests definidos
security tests definidos
tenant isolation tests definidos
permission tests definidos
E2E tests definidos
accessibility tests definidos
performance baseline definido
CI gates definidos
no storageKey verificado
no WordPress auth verificado
no public admin routes verificado
no direct DB access verificado
no Prisma frontend verificado
```

---

## 21. Expediente actualizado

```text id="awa-test-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 029-admin-web-app-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       └── test-plan.md
```
