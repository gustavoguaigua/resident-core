# Tasks — 029 Admin Web App Basic

## 1. Información del documento

| Campo          | Valor                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                             |
| Spec ID        | 029                                                                                                       |
| Módulo         | Admin Web App Basic                                                                                       |
| Documento      | Tasks                                                                                                     |
| Ruta           | `docs/specs/029-admin-web-app-basic/tasks.md`                                                             |
| Versión        | 0.1                                                                                                       |
| Estado         | needs-review                                                                                              |
| Fecha          | 2026-08-03                                                                                                |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC |
| Naturaleza     | Tenant-scoped / Permission-aware / API-first / Non-public / Admin-facing                                  |

---

## 2. Propósito

Definir el backlog técnico para implementar la aplicación web administrativa básica de RESIDENT.

Regla central:

```text id="awa-task-rule"
Ninguna tarea se considera completa si permite sesión WordPress, rutas públicas administrativas, tenant no autorizado, cache cross-tenant, storageKey visible, signedUrl persistente, tokens en URL o console, Prisma en frontend, acceso directo a PostgreSQL, contratos API no documentados, tenantId editable, actor fields, lógica financiera crítica en UI, control de hardware o IA externa con datos reales.
```

---

## 3. Convenciones

```text id="awa-task-status"
[ ] Pendiente
[x] Completado
[~] En progreso
[!] Bloqueado
[-] No aplica
```

---

## 4. Dependencias previas

```text id="awa-task-dependencies"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] OpenAPI de RESIDENT Core disponible.
[ ] Keycloak disponible o mockeable.
[ ] Endpoint /api/v1/me disponible o gap registrado.
[ ] Endpoint /api/v1/me/tenants disponible o gap registrado.
[ ] Endpoint de permisos efectivos disponible o gap registrado.
[ ] APIs MVP de módulos Core disponibles o mockeables.
[ ] Node LTS disponible.
[ ] Pipeline CI disponible.
```

---

# 5. EPIC-029-01 — App foundation

```text id="awa-epic-01"
[ ] Crear apps/admin-web/.
[ ] Crear aplicación Next.js.
[ ] Configurar TypeScript strict.
[ ] Configurar Tailwind CSS.
[ ] Configurar shadcn/ui.
[ ] Configurar ESLint.
[ ] Configurar Prettier.
[ ] Configurar estructura app/.
[ ] Configurar estructura components/.
[ ] Configurar estructura features/.
[ ] Configurar estructura lib/.
[ ] Configurar estructura generated/.
[ ] Configurar estructura tests/.
[ ] Crear layout raíz.
[ ] Crear página /login.
[ ] Crear página /auth/callback.
[ ] Crear página /select-tenant.
[ ] Crear página /forbidden.
[ ] Crear layout /app.
```

Acceptance:

```text id="awa-epic-01-ac"
[ ] La app compila.
[ ] TypeScript strict pasa.
[ ] No existen rutas administrativas públicas.
[ ] No existe dependencia Prisma.
[ ] No existe conexión directa a PostgreSQL.
[ ] No existe dependencia de WordPress auth.
```

---

# 6. EPIC-029-02 — Environment config and feature flags

```text id="awa-epic-02"
[ ] Crear configuración NEXT_PUBLIC_RESIDENT_API_BASE_URL.
[ ] Crear configuración NEXT_PUBLIC_KEYCLOAK_URL.
[ ] Crear configuración NEXT_PUBLIC_KEYCLOAK_REALM.
[ ] Crear configuración NEXT_PUBLIC_KEYCLOAK_CLIENT_ID.
[ ] Crear ADMIN_WEB_APP_ENABLED=true.
[ ] Crear ADMIN_WEB_APP_PUBLIC_MODE_ENABLED=false.
[ ] Crear ADMIN_WEB_APP_WORDPRESS_AUTH_ENABLED=false.
[ ] Crear ADMIN_WEB_APP_STORAGE_KEY_DISPLAY_ENABLED=false.
[ ] Crear ADMIN_WEB_APP_EXTERNAL_AI_ENABLED=false.
[ ] Crear ADMIN_WEB_APP_HARDWARE_CONTROL_ENABLED=false.
[ ] Crear ADMIN_WEB_APP_DIRECT_DB_ACCESS_ENABLED=false.
[ ] Crear ADMIN_WEB_APP_PAYMENT_CAPTURE_ENABLED=false.
[ ] Crear ADMIN_WEB_APP_ACCOUNTING_DIRECT_ENTRY_ENABLED=false.
[ ] Implementar validación de config en boot/build.
```

Acceptance:

```text id="awa-epic-02-ac"
[ ] Build falla si public mode está true.
[ ] Build falla si WordPress auth está true.
[ ] Build falla si storageKey display está true.
[ ] Build falla si direct DB access está true.
[ ] Build falla si hardware control está true.
[ ] Build falla si external AI con datos reales está true.
```

---

# 7. EPIC-029-03 — Keycloak OIDC auth

```text id="awa-epic-03"
[ ] Integrar Keycloak OIDC.
[ ] Usar Authorization Code Flow with PKCE.
[ ] Implementar login.
[ ] Implementar callback.
[ ] Implementar logout.
[ ] Implementar SessionProvider.
[ ] Detectar sesión loading.
[ ] Detectar sesión authenticated.
[ ] Detectar sesión unauthenticated.
[ ] Detectar sesión expired.
[ ] Manejar 401 global.
[ ] Limpiar sesión en logout.
[ ] Limpiar cache en logout.
[ ] Limpiar tenant activo en logout.
```

Prohibido:

```text id="awa-epic-03-forbidden"
[ ] No implicit flow.
[ ] No tokens en query params.
[ ] No tokens en console.
[ ] No WordPress session.
[ ] No Keycloak Admin API desde frontend.
```

Acceptance:

```text id="awa-epic-03-ac"
[ ] Usuario anónimo va a login.
[ ] Usuario autenticado puede continuar.
[ ] Sesión expirada redirige a login.
[ ] Logout limpia estado sensible.
```

---

# 8. EPIC-029-04 — User context, tenants and permissions

```text id="awa-epic-04"
[ ] Crear hook/useCurrentUser.
[ ] Consumir GET /api/v1/me.
[ ] Crear hook/useMyTenants.
[ ] Consumir GET /api/v1/me/tenants.
[ ] Crear TenantProvider.
[ ] Crear TenantSwitcher.
[ ] Crear ActiveTenantContext.
[ ] Crear PermissionProvider.
[ ] Consumir endpoint de permisos efectivos.
[ ] Crear permissionHash.
[ ] Crear hasPermission.
[ ] Crear hasAnyPermission.
[ ] Crear hasAllPermissions.
[ ] Bloquear tenant inactive/suspended.
[ ] Bloquear tenant no autorizado.
[ ] Invalidar cache al cambiar tenant.
```

Acceptance:

```text id="awa-epic-04-ac"
[ ] Solo tenants autorizados aparecen.
[ ] Cambio de tenant limpia cache.
[ ] Permisos efectivos vienen del Core.
[ ] Backend sigue siendo autoridad final.
```

---

# 9. EPIC-029-05 — API client and OpenAPI

```text id="awa-epic-05"
[ ] Configurar generación de cliente OpenAPI.
[ ] Crear lib/api/client.ts.
[ ] Centralizar baseURL.
[ ] Centralizar Authorization header.
[ ] Centralizar tenant context.
[ ] Centralizar error normalizer.
[ ] Centralizar response envelope parser.
[ ] Agregar tests de cliente API.
[ ] Agregar CI para generación OpenAPI.
[ ] Bloquear consumo de endpoints no documentados.
```

Acceptance:

```text id="awa-epic-05-ac"
[ ] Cliente API se genera sin errores.
[ ] No hay fetch manual disperso.
[ ] traceId se conserva.
[ ] 401/403/404/409/422/429/500 se mapean correctamente.
```

---

# 10. EPIC-029-06 — Query client and cache isolation

```text id="awa-epic-06"
[ ] Configurar TanStack Query.
[ ] Crear query key factory.
[ ] Incluir tenant en query keys.
[ ] Incluir permissionHash donde aplique.
[ ] Limpiar cache al cambiar tenant.
[ ] Limpiar cache al logout.
[ ] Invalidar cache después de mutaciones.
[ ] Configurar staleTime bajo para datos críticos.
[ ] Impedir cache de storageKey.
[ ] Impedir cache de signedUrl persistente.
```

Acceptance:

```text id="awa-epic-06-ac"
[ ] tenantA no muestra datos de tenantB.
[ ] Cambio de tenant no conserva tablas anteriores.
[ ] Mutaciones actualizan vistas relacionadas.
```

---

# 11. EPIC-029-07 — Layout and base components

```text id="awa-epic-07"
[ ] Crear AppShell.
[ ] Crear SidebarNavigation.
[ ] Crear HeaderBar.
[ ] Crear Breadcrumbs.
[ ] Crear UserMenu.
[ ] Crear TenantSwitcher visual.
[ ] Crear PermissionGate.
[ ] Crear RouteGuard.
[ ] Crear DataTable.
[ ] Crear FilterBar.
[ ] Crear DateRangeFilter.
[ ] Crear StatusBadge.
[ ] Crear MoneyDisplay.
[ ] Crear SecureDocumentLink.
[ ] Crear ConfirmDialog.
[ ] Crear DangerActionDialog.
[ ] Crear FormErrorSummary.
[ ] Crear LoadingState.
[ ] Crear EmptyState.
[ ] Crear ForbiddenState.
[ ] Crear NotFoundState.
[ ] Crear ConflictState.
[ ] Crear ApiErrorState.
[ ] Crear TraceIdDisplay.
```

Acceptance:

```text id="awa-epic-07-ac"
[ ] Layout funciona en escritorio/tablet.
[ ] Sidebar respeta permisos.
[ ] Estados de error son diferenciados.
[ ] SecureDocumentLink no expone storageKey.
```

---

# 12. EPIC-029-08 — Route guards and navigation

```text id="awa-epic-08"
[ ] Definir route access rules.
[ ] Proteger /app/dashboard.
[ ] Proteger /app/residents.
[ ] Proteger /app/properties.
[ ] Proteger /app/users.
[ ] Proteger /app/dues.
[ ] Proteger /app/payments.
[ ] Proteger /app/account-statements.
[ ] Proteger /app/imports.
[ ] Proteger /app/reports.
[ ] Proteger /app/audit.
[ ] Ocultar menú sin permiso.
[ ] Mostrar ForbiddenState en acceso manual sin permiso.
[ ] No revelar recursos cross-tenant en 404.
```

Acceptance:

```text id="awa-epic-08-ac"
[ ] Rutas privadas requieren auth.
[ ] Rutas tenant requieren tenant activo.
[ ] Rutas sin permiso se bloquean.
[ ] Resident no accede a Admin Web App MVP.
```

---

# 13. EPIC-029-09 — Form schemas and mutation safety

```text id="awa-epic-09"
[ ] Configurar React Hook Form.
[ ] Configurar Zod.
[ ] Crear schemas por módulo.
[ ] Crear forbiddenFieldsValidator.
[ ] Bloquear tenantId editable.
[ ] Bloquear actor fields.
[ ] Bloquear status directo.
[ ] Bloquear storageKey.
[ ] Bloquear signedUrl.
[ ] Bloquear rawSql.
[ ] Bloquear script.
[ ] Bloquear formulaCode.
[ ] Bloquear secrets.
[ ] Bloquear doble submit.
[ ] Mapear 422 a campos.
[ ] Confirmar acciones críticas.
```

Acceptance:

```text id="awa-epic-09-ac"
[ ] Formularios no envían campos server-side.
[ ] Acciones críticas requieren confirmación.
[ ] Error 422 aparece por campo.
```

---

# 14. EPIC-029-10 — Dashboard UI

```text id="awa-epic-10"
[ ] Crear /app/dashboard.
[ ] Consumir GET /tenant/dashboards.
[ ] Consumir GET /tenant/dashboards/{dashboardKey}.
[ ] Consumir KPIs del módulo 027.
[ ] Crear DashboardPage.
[ ] Crear DashboardWidgetGrid.
[ ] Crear KpiCard.
[ ] Crear DashboardFilters.
[ ] Manejar available/partial/unavailable.
[ ] Mostrar ForbiddenState si 403.
[ ] Mostrar traceId si error.
```

Acceptance:

```text id="awa-epic-10-ac"
[ ] Frontend no calcula KPIs finales.
[ ] Widgets visibles dependen de API/permisos.
[ ] No se muestran métricas sensibles sin permiso.
```

---

# 15. EPIC-029-11 — Residents and properties UI

```text id="awa-epic-11"
[ ] Crear /app/residents.
[ ] Crear /app/properties.
[ ] Crear lista de personas/residentes.
[ ] Crear lista de unidades.
[ ] Crear filtros básicos.
[ ] Crear vista detalle.
[ ] Crear formularios permitidos.
[ ] Crear relaciones propietario/residente/unidad.
[ ] Manejar 403/404/422.
[ ] Enmascarar datos según API.
```

Acceptance:

```text id="awa-epic-11-ac"
[ ] No se envía tenantId editable.
[ ] No se envían actor fields.
[ ] No se muestran datos personales no autorizados.
```

---

# 16. EPIC-029-12 — Users, roles and permissions UI

```text id="awa-epic-12"
[ ] Crear /app/users.
[ ] Listar usuarios del tenant.
[ ] Ver membresías.
[ ] Ver roles.
[ ] Ver permisos efectivos.
[ ] Asignar roles permitidos.
[ ] Remover roles permitidos.
[ ] Mostrar confirmación en cambios críticos.
[ ] Manejar 403/404/422.
```

Prohibido:

```text id="awa-epic-12-forbidden"
[ ] No administrar Keycloak directamente.
[ ] No editar claims directamente.
[ ] No crear usuarios saltándose Core.
```

---

# 17. EPIC-029-13 — Dues, payments and account statements UI

```text id="awa-epic-13"
[ ] Crear /app/dues.
[ ] Crear /app/payments.
[ ] Crear /app/account-statements.
[ ] Listar cargos.
[ ] Crear cargo permitido.
[ ] Consultar saldos desde API.
[ ] Listar pagos.
[ ] Ver detalle de pago.
[ ] Revisar comprobante con SecureDocumentLink.
[ ] Aprobar/rechazar pago con ConfirmDialog.
[ ] Consultar estado de cuenta.
[ ] Manejar montos como string decimal.
```

Prohibido:

```text id="awa-epic-13-forbidden"
[ ] No calcular saldo final en UI.
[ ] No validar pagos sin Core API.
[ ] No procesar tarjetas.
[ ] No crear JournalEntry directo.
[ ] No mostrar storageKey de comprobantes.
```

---

# 18. EPIC-029-14 — Data import UI

```text id="awa-epic-14"
[ ] Crear /app/imports.
[ ] Listar import templates.
[ ] Crear import batch.
[ ] Ver detalle de batch.
[ ] Asociar archivo por secureDocumentId.
[ ] Configurar mapping.
[ ] Ejecutar validate.
[ ] Consultar issues.
[ ] Generar preview.
[ ] Ejecutar dry-run.
[ ] Enviar a aprobación.
[ ] Aprobar con permiso.
[ ] Ejecutar commit.
[ ] Consultar row results.
[ ] Generar reportes.
[ ] Mostrar secureDocumentId en reportes.
```

Acceptance:

```text id="awa-epic-14-ac"
[ ] UI no cambia status directo.
[ ] UI no envía approvedBy/executedBy.
[ ] UI no envía storageKey.
[ ] UI respeta dry-run y approval.
```

---

# 19. EPIC-029-15 — Secure documents UI

```text id="awa-epic-15"
[ ] Crear /app/documents.
[ ] Listar documentos permitidos.
[ ] Crear SecureDocumentLink reutilizable.
[ ] Integrar descarga autorizada.
[ ] Manejar 403.
[ ] Manejar 404.
[ ] Evitar signedUrl persistente.
[ ] Evitar storageKey.
```

Acceptance:

```text id="awa-epic-15-ac"
[ ] UI solo usa secureDocumentId.
[ ] No se construyen URLs manuales al bucket.
[ ] No se loggean referencias sensibles.
```

---

# 20. EPIC-029-16 — Secondary modules UI

```text id="awa-epic-16"
[ ] Crear /app/reservations.
[ ] Crear /app/fines.
[ ] Crear /app/communications.
[ ] Crear /app/meetings.
[ ] Crear /app/voting.
[ ] Crear /app/minutes.
[ ] Crear /app/maintenance.
[ ] Crear /app/inventory.
[ ] Crear /app/access.
[ ] Crear /app/automation.
[ ] Crear pantallas básicas de lista.
[ ] Crear acciones básicas permitidas.
[ ] Manejar permisos por módulo.
[ ] Manejar errores por módulo.
```

Prohibido:

```text id="awa-epic-16-forbidden"
[ ] No abrir portones.
[ ] No controlar hardware.
[ ] No usar biometría.
[ ] No enviar datos reales a IA externa.
[ ] No ejecutar workflows fuera de API autorizada.
```

---

# 21. EPIC-029-17 — Reports and audit UI

```text id="awa-epic-17"
[ ] Crear /app/reports.
[ ] Crear /app/audit.
[ ] Listar reportes permitidos.
[ ] Descargar reportes vía SecureDocumentLink.
[ ] Listar eventos de auditoría.
[ ] Filtrar por módulo/fecha/evento.
[ ] Mostrar traceId/correlationId si aplica.
[ ] Ocultar metadata sensible.
[ ] Manejar 403.
```

Acceptance:

```text id="awa-epic-17-ac"
[ ] No se muestra payload sensible raw.
[ ] No se muestran secretos.
[ ] No se revelan datos cross-tenant.
```

---

# 22. EPIC-029-18 — Error handling and UI states

```text id="awa-epic-18"
[ ] Implementar SessionExpiredState.
[ ] Implementar ForbiddenState.
[ ] Implementar NotFoundState.
[ ] Implementar ConflictState.
[ ] Implementar PayloadTooLargeState.
[ ] Implementar UnsupportedMediaTypeState.
[ ] Implementar RateLimitState.
[ ] Implementar FormErrorSummary.
[ ] Implementar ApiErrorState.
[ ] Mostrar traceId.
[ ] No mostrar stack trace.
[ ] No revelar cross-tenant.
```

Acceptance:

```text id="awa-epic-18-ac"
[ ] 401 no se muestra como error genérico.
[ ] 403 no se muestra como error genérico.
[ ] 422 se muestra por campo.
[ ] 500 muestra traceId si existe.
```

---

# 23. EPIC-029-19 — Frontend observability

```text id="awa-epic-19"
[ ] Registrar adminApp.loaded.
[ ] Registrar adminApp.route.changed.
[ ] Registrar adminApp.api.error.
[ ] Registrar adminApp.auth.sessionExpired.
[ ] Registrar adminApp.tenant.changed.
[ ] Registrar adminApp.criticalAction.submitted.
[ ] Registrar adminApp.criticalAction.failed.
[ ] Sanitizar eventos.
[ ] Deshabilitar console.log sensible.
```

Prohibido registrar:

```text id="awa-epic-19-forbidden"
[ ] tokens.
[ ] passwords.
[ ] authorization headers.
[ ] cookies.
[ ] storageKey.
[ ] signedUrl.
[ ] identificaciones completas.
[ ] placas completas.
[ ] comprobantes.
[ ] payload financiero raw.
```

---

# 24. EPIC-029-20 — Accessibility baseline

```text id="awa-epic-20"
[ ] Validar navegación por teclado.
[ ] Validar labels en formularios.
[ ] Validar focus trap en modales.
[ ] Validar contraste básico.
[ ] Validar tablas con encabezados.
[ ] Validar estados de error anunciables.
[ ] Validar botones críticos con texto claro.
```

Acceptance:

```text id="awa-epic-20-ac"
[ ] Flujos críticos pueden operarse con teclado.
[ ] Formularios críticos son entendibles.
[ ] ConfirmDialog maneja focus correctamente.
```

---

# 25. EPIC-029-21 — Testing and CI

```text id="awa-epic-21"
[ ] Configurar Vitest.
[ ] Configurar React Testing Library.
[ ] Configurar Playwright.
[ ] Configurar tests unitarios.
[ ] Configurar tests de componentes.
[ ] Configurar tests E2E.
[ ] Configurar tests de accesibilidad smoke.
[ ] Configurar OpenAPI client generation en CI.
[ ] Configurar TypeScript check.
[ ] Configurar ESLint.
[ ] Configurar Prettier check.
[ ] Configurar production build.
[ ] Agregar security static checks.
```

CI debe fallar si:

```text id="awa-epic-21-ci-fail"
[ ] Se importa Prisma.
[ ] Se detecta PostgreSQL URL.
[ ] Se detecta Redis URL.
[ ] Se detecta Keycloak Admin API.
[ ] Se detecta WordPress auth.
[ ] Se detecta storageKey en UI.
[ ] Se detecta endpoint administrativo público.
[ ] Se consume endpoint no documentado.
[ ] Tests críticos de tenant/permisos fallan.
```

---

# 26. EPIC-029-22 — Build and deployment

```text id="awa-epic-22"
[ ] Crear Dockerfile.
[ ] Crear docker-compose opcional para desarrollo.
[ ] Configurar build production.
[ ] Configurar variables por ambiente.
[ ] Validar que no se empaquetan secretos.
[ ] Validar que no se empaquetan database URLs.
[ ] Validar que no se empaquetan storage credentials.
[ ] Documentar despliegue inicial.
```

Deployment permitido:

```text id="awa-epic-22-allowed"
[ ] Docker container.
[ ] Hosting privado detrás de gateway.
[ ] Subdominio privado admin.resident.gustavoguaigua.com.
```

No permitido:

```text id="awa-epic-22-forbidden"
[ ] Plugin WordPress obligatorio.
[ ] wp-admin como consola transaccional.
[ ] Página pública sin auth.
[ ] Build con secretos.
```

---

# 27. Plan de Pull Requests sugerido

```text id="awa-pr-plan"
PR-029-01 — App foundation, tooling, Tailwind, shadcn/ui and environment config.
PR-029-02 — Keycloak auth, session, tenant selector and permissions.
PR-029-03 — OpenAPI client, TanStack Query, error handling and layout.
PR-029-04 — Base components, route guards and navigation.
PR-029-05 — Dashboard, residents/properties and users/roles.
PR-029-06 — Dues, payments and account statements.
PR-029-07 — Data import and secure documents.
PR-029-08 — Reservations, fines, communications and governance.
PR-029-09 — Maintenance, inventory, access, automation, reports and audit.
PR-029-10 — Tests, accessibility, security hardening, build and deployment.
```

---

# 28. Checklist de rutas UI

```text id="awa-route-checklist"
[ ] /login
[ ] /auth/callback
[ ] /select-tenant
[ ] /forbidden
[ ] /app/dashboard
[ ] /app/residents
[ ] /app/properties
[ ] /app/users
[ ] /app/dues
[ ] /app/payments
[ ] /app/account-statements
[ ] /app/reservations
[ ] /app/fines
[ ] /app/communications
[ ] /app/meetings
[ ] /app/voting
[ ] /app/minutes
[ ] /app/documents
[ ] /app/maintenance
[ ] /app/inventory
[ ] /app/access
[ ] /app/automation
[ ] /app/imports
[ ] /app/reports
[ ] /app/audit
```

Rutas prohibidas:

```text id="awa-route-forbidden"
[ ] /public/admin
[ ] /public/dashboard
[ ] /wp-admin/resident-core
[ ] /wordpress-admin/resident-core
[ ] /embed/admin
[ ] /embed/dashboard
```

---

# 29. Definition of Done

```text id="awa-dod"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado y aprobado.
[ ] App Next.js creada.
[ ] TypeScript strict activo.
[ ] Tailwind/shadcn configurados.
[ ] Keycloak OIDC implementado.
[ ] Login/logout/callback implementados.
[ ] Tenant selector implementado.
[ ] PermissionProvider implementado.
[ ] Route guards implementados.
[ ] OpenAPI client generado.
[ ] TanStack Query configurado.
[ ] Layout administrativo implementado.
[ ] Componentes base implementados.
[ ] Dashboard implementado.
[ ] Módulos prioridad 1 implementados.
[ ] Data import UI implementada.
[ ] SecureDocumentLink implementado.
[ ] Error handling global implementado.
[ ] Tests críticos implementados.
[ ] E2E smoke implementado.
[ ] Accessibility smoke implementado.
[ ] No storageKey exposure verificado.
[ ] No WordPress auth verificado.
[ ] No public admin routes verificado.
[ ] No direct DB access verificado.
[ ] CI/CD implementado.
```

---

# 30. No aceptación

No se acepta implementación si:

```text id="awa-no-acceptance"
- usa sesión WordPress;
- se implementa como plugin WordPress obligatorio;
- expone rutas públicas administrativas;
- permite seleccionar tenant no autorizado;
- muestra datos de tenant anterior por cache;
- muestra storageKey;
- guarda signedUrl persistente;
- registra tokens en console;
- incluye tokens o datos sensibles en URL;
- llama directamente a PostgreSQL;
- usa Prisma en frontend;
- usa Keycloak Admin API desde frontend;
- consume contratos API no documentados;
- envía tenantId editable;
- envía actor fields;
- envía status directo indebido;
- calcula saldos finales en UI;
- valida pagos sin Core API;
- ejecuta pagos fuera del Core;
- crea JournalEntry directo;
- confirma conciliación fuera del API autorizado;
- abre portones;
- controla hardware;
- usa IA externa con datos reales;
- ignora errores 403/404/422 del backend.
```

---

# 31. Resultado esperado

```text id="awa-expected-result"
tasks definidas
épicas implementables definidas
PR plan definido
rutas UI definidas
DoD definido
no acceptance definido
app admin privada definida
Keycloak auth definido
tenant selector definido
permission-aware navigation definido
OpenAPI client requerido
TanStack Query requerido
data import UI requerida
secure document UI requerida
security hardening requerido
CI gates requeridos
no WordPress auth
no public admin routes
no storageKey
no direct DB
no Prisma frontend
```

---

# 32. Expediente actualizado

```text id="awa-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 029-admin-web-app-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
