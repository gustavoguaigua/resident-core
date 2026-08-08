# Spec — 029 Admin Web App Basic

## 1. Información del documento

| Campo                 | Valor                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                             |
| Spec ID               | 029                                                                                                       |
| Módulo                | Admin Web App Basic                                                                                       |
| Documento             | Functional Specification                                                                                  |
| Ruta                  | `docs/specs/029-admin-web-app-basic/spec.md`                                                              |
| Versión               | 0.1                                                                                                       |
| Estado                | Borrador inicial                                                                                          |
| Fecha                 | 2026-08-03                                                                                                |
| Fase                  | FASE 2 — RESIDENT Core                                                                                    |
| Arquitectura objetivo | Frontend administrativo desacoplado del Core API                                                          |
| Stack sugerido        | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC |
| Naturaleza            | Tenant-scoped / Role-aware / API-first / Non-public / Admin-facing                                        |

---

## 2. Propósito

El módulo `029-admin-web-app-basic` define la aplicación web administrativa básica de RESIDENT Core.

Esta aplicación permitirá a administradores, comité, responsables financieros, seguridad, mantenimiento y usuarios autorizados operar los principales módulos del sistema desde una interfaz privada, autenticada y tenant-scoped.

Regla central:

```text id="awa-rule"
Admin Web App Basic debe ser una aplicación privada, autenticada, tenant-aware y permission-aware que consuma exclusivamente APIs oficiales de RESIDENT Core, sin acceso directo a base de datos, sin lógica transaccional crítica en frontend, sin endpoints públicos, sin depender de sesión WordPress, sin exponer storageKey, sin ejecutar pagos fuera del Core, sin crear asientos contables directos, sin confirmar conciliaciones bancarias por fuera del módulo autorizado, sin controlar hardware y sin enviar datos reales a IA externa.
```

---

## 3. Contexto dentro de RESIDENT

```text id="awa-context"
RESIDENT Platform
├── WordPress Multitenant Portal
│   └── capa pública informativa por conjunto
├── RESIDENT Core API
│   └── backend transaccional, seguridad, reglas de negocio y auditoría
├── Keycloak
│   └── autenticación OIDC/OAuth2
└── Admin Web App Basic
    └── interfaz privada para operar RESIDENT Core
```

Regla:

```text id="awa-context-rule"
WordPress sigue siendo portal público/informativo. Admin Web App Basic es la consola privada de administración y no debe vivir como plugin WordPress ni depender de login WordPress.
```

---

## 4. Problema que resuelve

Sin una aplicación administrativa, RESIDENT Core tendría APIs y documentación, pero no una interfaz operativa mínima para uso real.

Problemas a resolver:

```text id="awa-problems"
- falta de consola administrativa central;
- operación dispersa por APIs manuales;
- ausencia de navegación por módulos;
- dificultad para gestionar tenants, usuarios, residentes, unidades, cargos y pagos;
- falta de panel para dashboards y KPIs;
- dificultad para validar pagos y revisar comprobantes;
- dificultad para operar importaciones iniciales;
- falta de visibilidad de errores, auditoría y estados críticos;
- riesgo de operar directamente por base de datos o herramientas técnicas;
- necesidad de interfaz compatible con roles y permisos.
```

---

## 5. Objetivos funcionales

```text id="awa-objectives"
1. Proveer una aplicación web privada para administración de tenants.
2. Autenticar usuarios mediante Keycloak.
3. Resolver tenant actual desde membresías del usuario.
4. Permitir cambio seguro de tenant cuando el usuario pertenezca a varios.
5. Mostrar navegación por módulos según permisos.
6. Permitir operación básica de los módulos MVP.
7. Integrarse con RESIDENT Core mediante APIs oficiales.
8. Mostrar dashboards y KPIs administrativos.
9. Gestionar carga inicial de datos mediante Data Import and Migration.
10. Mostrar estados, errores y mensajes de forma segura.
11. Evitar lógica de negocio crítica en frontend.
12. Evitar acceso directo a base de datos.
13. Evitar dependencia de WordPress público.
14. Mantener seguridad, privacidad, auditoría y trazabilidad.
```

---

## 6. Alcance MVP

### 6.1. Incluido

```text id="awa-scope-in"
- Login OIDC con Keycloak.
- Logout.
- Manejo de sesión.
- Selección de tenant.
- Layout administrativo.
- Sidebar por permisos.
- Header con tenant actual y usuario.
- Dashboard ejecutivo básico.
- Gestión básica de residentes y unidades.
- Gestión básica de usuarios, roles y permisos visibles.
- Consulta y operación básica de alícuotas/cargos.
- Consulta y validación administrativa de pagos según permisos.
- Consulta de estados de cuenta.
- Reservas de áreas comunales.
- Multas y sanciones.
- Comunicaciones internas.
- Reuniones/asistencia/votaciones básicas en modo administración.
- Documentos seguros por referencia.
- Mantenimiento.
- Inventario básico.
- Accesos y visitantes en modo administración.
- Automatizaciones básicas.
- Importación/migración de datos.
- Auditoría consultable.
- Reportes básicos.
- Manejo global de errores.
- Empty states.
- Loading states.
- Forbidden states.
- Not found states.
- Responsive básico para escritorio/tablet.
```

---

### 6.2. Fuera de alcance MVP

```text id="awa-scope-out"
- Aplicación móvil nativa.
- App residente final.
- Portal público WordPress.
- Constructor visual avanzado.
- Modo offline.
- PWA avanzada.
- Chat interno avanzado.
- BI avanzado.
- IA generativa con datos reales.
- Control de hardware.
- Apertura de portones.
- OCR.
- Biometría.
- Reconocimiento facial.
- Procesamiento directo de tarjetas.
- Escritura directa en base de datos.
- Administración directa de Keycloak desde frontend.
- Gestión de infraestructura AWS desde frontend.
```

---

## 7. Decisión funcional MVP

```text id="awa-mvp-decision"
Admin Web App Basic será una consola administrativa desacoplada, desarrollada como aplicación frontend independiente, que consume APIs REST versionadas de RESIDENT Core, usa Keycloak para autenticación, aplica autorización de interfaz basada en permisos del Core y delega toda regla transaccional al backend.
```

---

## 8. Actores

### 8.1. PlatformAdmin

Puede:

```text id="awa-actor-platform-admin"
- acceder a vista platform si está autorizado;
- listar tenants;
- revisar estado general de plataforma;
- administrar catálogos globales permitidos;
- acceder a datos tenant solo con contexto, permiso y auditoría.
```

---

### 8.2. TenantAdmin

Puede:

```text id="awa-actor-tenant-admin"
- acceder al panel administrativo del tenant;
- gestionar usuarios permitidos;
- gestionar residentes y unidades;
- revisar dashboards;
- operar cargos, pagos, reservas, multas, comunicaciones y reportes según permisos;
- ejecutar importaciones autorizadas;
- revisar auditoría permitida.
```

---

### 8.3. BoardMember / Comité

Puede:

```text id="awa-actor-board"
- consultar dashboards ejecutivos;
- revisar reportes;
- consultar estados financieros agregados;
- revisar reuniones, votaciones y actas;
- aprobar acciones si tiene permisos.
```

---

### 8.4. FinancialManager

Puede:

```text id="awa-actor-financial"
- revisar alícuotas/cargos;
- validar pagos según flujo del Core;
- consultar estados de cuenta;
- revisar mora;
- generar reportes financieros;
- importar saldos iniciales si tiene permiso sensible.
```

No puede desde frontend:

```text id="awa-actor-financial-cannot"
- saltarse validaciones del backend;
- ejecutar pagos fuera del Core;
- crear asientos contables directos;
- confirmar conciliaciones fuera del módulo autorizado.
```

---

### 8.5. SecurityManager / Guardia autorizado

Puede:

```text id="awa-actor-security"
- revisar visitantes;
- revisar accesos;
- revisar incidentes;
- registrar operaciones permitidas mediante Core API.
```

No puede desde frontend:

```text id="awa-actor-security-cannot"
- abrir portones en MVP;
- controlar hardware;
- usar biometría;
- exponer placas o identificaciones completas sin permiso.
```

---

### 8.6. MaintenanceManager

Puede:

```text id="awa-actor-maintenance"
- revisar solicitudes;
- gestionar órdenes de trabajo;
- consultar proveedores o costos permitidos;
- actualizar estados según permisos.
```

---

### 8.7. Resident

En MVP:

```text id="awa-actor-resident"
Resident no usa Admin Web App Basic. Su experiencia se definirá en 030-resident-self-service-basic.
```

---

## 9. Módulos funcionales de UI MVP

### 9.1. Auth and Session

```text id="awa-ui-auth"
- login;
- logout;
- callback OIDC;
- refresh token controlado;
- sesión expirada;
- usuario sin tenants;
- usuario sin permisos;
```

---

### 9.2. Tenant Selector

```text id="awa-ui-tenant-selector"
- listar tenants disponibles del usuario;
- seleccionar tenant activo;
- mostrar tenant actual;
- impedir tenant manual no autorizado;
- persistir tenant seleccionado de forma segura;
- limpiar cache al cambiar tenant.
```

---

### 9.3. Dashboard

```text id="awa-ui-dashboard"
- dashboard ejecutivo;
- dashboard financiero si tiene permiso;
- dashboard operativo;
- widgets por permiso;
- KPIs con loading/error/partial;
- links hacia módulos relacionados.
```

---

### 9.4. Residents and Properties

```text id="awa-ui-residents-properties"
- listar unidades;
- filtrar unidades;
- ver detalle de unidad;
- listar residentes/personas;
- crear/editar persona permitida;
- asociar propietario/residente/unidad;
- ver relaciones vigentes;
```

---

### 9.5. Users, Roles and Permissions

```text id="awa-ui-users-roles"
- listar usuarios del tenant;
- ver membresías;
- asignar roles permitidos;
- remover roles permitidos;
- consultar permisos efectivos;
- no administrar Keycloak directamente desde frontend.
```

---

### 9.6. Dues, Fees and Account Statements

```text id="awa-ui-dues-fees"
- listar cargos;
- crear cargos permitidos;
- consultar cargos por unidad;
- consultar saldos;
- consultar estados de cuenta;
- generar estado de cuenta si API lo permite;
- no modificar saldos manualmente fuera del Core.
```

---

### 9.7. Payments

```text id="awa-ui-payments"
- listar pagos;
- revisar comprobantes por referencia segura;
- aprobar/rechazar pagos según permisos;
- ver historial de validación;
- no procesar tarjetas;
- no ejecutar cobros bancarios directos.
```

---

### 9.8. Reservations and Common Areas

```text id="awa-ui-reservations"
- listar áreas comunales;
- listar reservas;
- aprobar/rechazar reservas según permisos;
- ver calendario básico;
- consultar cargos asociados si existen.
```

---

### 9.9. Fines and Sanctions

```text id="awa-ui-fines"
- listar multas;
- crear multa permitida;
- revisar apelaciones;
- resolver apelaciones según permisos;
- consultar cargo asociado si existe.
```

---

### 9.10. Communications

```text id="awa-ui-communications"
- listar comunicados;
- crear comunicado;
- seleccionar audiencia permitida;
- enviar comunicado mediante Core API;
- ver estado de entrega;
- no enviar mensajes por canal no autorizado.
```

---

### 9.11. Meetings, Voting and Certified Minutes

```text id="awa-ui-governance"
- listar reuniones;
- crear reunión;
- registrar asistencia;
- consultar quorum;
- gestionar votaciones básicas;
- consultar actas certificadas internas;
- publicar acta según permisos.
```

---

### 9.12. Secure Documents

```text id="awa-ui-documents"
- listar documentos permitidos;
- subir documentos mediante API autorizada;
- descargar mediante flujo seguro del módulo 016;
- no mostrar storageKey;
- no guardar signedUrl persistente.
```

---

### 9.13. Maintenance

```text id="awa-ui-maintenance"
- listar solicitudes;
- crear orden de trabajo;
- asignar responsable/proveedor si tiene permiso;
- cambiar estado;
- registrar evidencia permitida;
```

---

### 9.14. Inventory

```text id="awa-ui-inventory"
- listar ítems;
- consultar stock;
- registrar movimientos permitidos;
- ver alertas de stock bajo;
- no modificar stock saltándose API.
```

---

### 9.15. Access Control and Visitors

```text id="awa-ui-access"
- listar visitantes;
- registrar autorización permitida;
- registrar check-in/check-out si API lo permite;
- listar incidentes;
- no abrir portones;
- no controlar hardware;
- no procesar biometría.
```

---

### 9.16. Automation Workflows

```text id="awa-ui-automation"
- listar workflows;
- crear draft permitido;
- revisar versiones;
- aprobar/activar según permisos;
- consultar executions;
- consultar dead letters;
- ejecutar manual run autorizado;
```

---

### 9.17. Data Import and Migration

```text id="awa-ui-import"
- listar templates;
- crear import batch;
- subir archivo vía SDS/API;
- configurar mapping;
- ejecutar validación;
- consultar issues;
- generar preview;
- ejecutar dry-run;
- enviar a aprobación;
- aprobar con permiso;
- ejecutar commit;
- consultar row results;
- descargar reportes seguros.
```

---

### 9.18. Audit and Reports

```text id="awa-ui-audit-reports"
- consultar auditoría según permiso;
- filtrar eventos;
- consultar reportes básicos;
- descargar exports mediante SDS;
- no exponer metadata sensible.
```

---

## 10. Navegación MVP

```text id="awa-navigation"
/
├── /login
├── /auth/callback
├── /select-tenant
├── /app
│   ├── /dashboard
│   ├── /residents
│   ├── /properties
│   ├── /users
│   ├── /dues
│   ├── /payments
│   ├── /account-statements
│   ├── /reservations
│   ├── /fines
│   ├── /communications
│   ├── /meetings
│   ├── /voting
│   ├── /minutes
│   ├── /documents
│   ├── /maintenance
│   ├── /inventory
│   ├── /access
│   ├── /automation
│   ├── /imports
│   ├── /reports
│   └── /audit
└── /forbidden
```

Regla:

```text id="awa-navigation-rule"
Las rutas deben ocultarse y bloquearse según permisos efectivos. Ocultar menú no reemplaza validación backend.
```

---

## 11. Integración con Keycloak

Requerimientos:

```text id="awa-keycloak"
- usar Authorization Code Flow con PKCE;
- no usar implicit flow;
- no almacenar tokens en localStorage si puede evitarse;
- preferir cookies httpOnly cuando arquitectura lo permita;
- refrescar sesión de forma segura;
- manejar logout global;
- resolver usuario mediante endpoint del Core;
- resolver memberships mediante Core.
```

Regla:

```text id="awa-keycloak-rule"
Keycloak autentica identidad. RESIDENT Core entrega el contexto de autorización, tenants, roles y permisos efectivos.
```

---

## 12. Integración con RESIDENT Core API

### 12.1. Principios

```text id="awa-api-principles"
- Consumir solo /api/v1.
- Usar cliente generado desde OpenAPI cuando sea posible.
- Enviar Authorization Bearer token.
- Enviar tenant context solo según convención aprobada del Core.
- No enviar tenantId como autoridad si Core lo prohíbe.
- Manejar traceId en errores.
- Tratar 401, 403, 404, 409 y 422 de forma diferenciada.
```

---

### 12.2. Estado de datos

```text id="awa-data-state"
- Loading.
- Empty.
- Loaded.
- Partial.
- Forbidden.
- Not found.
- Conflict.
- Validation error.
- Server error.
- Session expired.
```

---

## 13. Seguridad funcional

### 13.1. Controles mínimos

```text id="awa-security-controls"
- OIDC con Keycloak.
- Auth route guard.
- Tenant context guard en frontend.
- Permission-based route guard.
- Permission-based component guard.
- API error handling seguro.
- No datos sensibles en logs del browser.
- No storageKey en UI.
- No signedUrl persistente.
- No secrets en frontend.
- No feature flags que habiliten acciones prohibidas.
```

---

### 13.2. Prohibiciones

```text id="awa-security-forbidden"
- No acceso directo a PostgreSQL.
- No Prisma en frontend.
- No llamadas directas a Redis.
- No administración directa de Keycloak desde frontend.
- No storageKey.
- No raw SQL.
- No scripts configurables.
- No IA externa con datos reales.
- No endpoints públicos administrativos.
- No sesión WordPress.
- No control de hardware.
- No apertura de portones.
- No biometría.
- No reconocimiento facial.
```

---

## 14. Privacidad

Reglas:

```text id="awa-privacy-rules"
- Minimizar datos personales en tablas.
- Enmascarar identificación cuando no haya permiso.
- Enmascarar placas cuando no haya permiso.
- No renderizar payload sensible raw.
- No registrar datos personales en console.log.
- No incluir datos sensibles en URLs.
- No incluir tokens en query params.
- No exponer comprobantes fuera del flujo seguro.
```

---

## 15. Diseño UX mínimo

### 15.1. Layout base

```text id="awa-layout"
- sidebar;
- header;
- selector de tenant;
- avatar/menú usuario;
- breadcrumb;
- área principal;
- panel de filtros;
- tablas paginadas;
- formularios validados;
- modales de confirmación;
- toasts de resultado;
- estados de error.
```

---

### 15.2. Componentes base

```text id="awa-components"
- AppShell.
- SidebarNavigation.
- TenantSwitcher.
- UserMenu.
- PermissionGate.
- DataTable.
- FilterBar.
- SearchInput.
- DateRangeFilter.
- StatusBadge.
- MoneyDisplay.
- ConfirmDialog.
- FormErrorSummary.
- EmptyState.
- LoadingState.
- ForbiddenState.
- ApiErrorState.
- SecureDocumentLink.
```

---

## 16. Reglas de negocio de UI

```text id="awa-br"
BR-001 La aplicación no decide reglas financieras; delega al Core.
BR-002 La aplicación no calcula saldos finales; muestra lo que devuelve Core.
BR-003 La aplicación no valida pagos por sí sola; llama API de pagos.
BR-004 La aplicación no crea asientos contables.
BR-005 La aplicación no confirma conciliaciones por fuera del endpoint autorizado.
BR-006 La aplicación no abre portones ni controla hardware.
BR-007 La aplicación no usa WordPress como sesión.
BR-008 La aplicación no accede a datos cross-tenant.
BR-009 El tenant activo debe limpiarse al logout.
BR-010 El cache de frontend debe invalidarse al cambiar tenant.
BR-011 Formularios no deben incluir campos server-side como createdBy, approvedBy o tenantId.
BR-012 Toda acción crítica requiere confirmación UI si la API la clasifica como crítica.
BR-013 Toda respuesta 403 debe mostrar ForbiddenState.
BR-014 Toda respuesta 404 en recurso tenant-scoped debe tratarse como not found sin revelar cross-tenant.
BR-015 Todo error debe mostrar traceId si está disponible.
```

---

## 17. Requerimientos funcionales

### 17.1. Autenticación

```text id="awa-fr-auth"
FR-001 La app debe permitir login OIDC.
FR-002 La app debe manejar callback OIDC.
FR-003 La app debe permitir logout.
FR-004 La app debe detectar sesión expirada.
FR-005 La app debe redirigir usuario no autenticado a login.
```

---

### 17.2. Tenant context

```text id="awa-fr-tenant"
FR-006 La app debe listar tenants del usuario.
FR-007 La app debe permitir seleccionar tenant activo.
FR-008 La app debe impedir tenant no autorizado.
FR-009 La app debe limpiar cache al cambiar tenant.
FR-010 La app debe mostrar tenant actual.
```

---

### 17.3. Permisos

```text id="awa-fr-permissions"
FR-011 La app debe obtener permisos efectivos desde Core.
FR-012 La app debe ocultar rutas sin permiso.
FR-013 La app debe bloquear rutas sin permiso.
FR-014 La app debe ocultar acciones sin permiso.
FR-015 La app debe manejar 403 del backend.
```

---

### 17.4. Módulos administrativos

```text id="awa-fr-modules"
FR-016 La app debe mostrar dashboard administrativo.
FR-017 La app debe permitir operar residentes/unidades.
FR-018 La app debe permitir operar usuarios/roles según permisos.
FR-019 La app debe permitir consultar y operar cargos.
FR-020 La app debe permitir consultar y validar pagos según permisos.
FR-021 La app debe permitir consultar estados de cuenta.
FR-022 La app debe permitir operar reservas.
FR-023 La app debe permitir operar multas.
FR-024 La app debe permitir operar comunicaciones.
FR-025 La app debe permitir operar reuniones/votaciones/actas.
FR-026 La app debe permitir operar documentos seguros.
FR-027 La app debe permitir operar mantenimiento.
FR-028 La app debe permitir operar inventario.
FR-029 La app debe permitir operar accesos/visitantes.
FR-030 La app debe permitir operar automatizaciones.
FR-031 La app debe permitir operar importaciones.
FR-032 La app debe permitir consultar auditoría y reportes.
```

---

### 17.5. Formularios y validación

```text id="awa-fr-forms"
FR-033 La app debe validar formularios client-side para usabilidad.
FR-034 La app debe mostrar errores 422 del backend por campo.
FR-035 La app no debe enviar campos prohibidos.
FR-036 La app debe confirmar acciones críticas.
FR-037 La app debe prevenir doble submit.
```

---

## 18. Requerimientos no funcionales

### 18.1. Seguridad

```text id="awa-nfr-security"
NFR-001 No almacenar secretos en frontend.
NFR-002 No exponer tokens en URL.
NFR-003 No usar localStorage para tokens si se implementa BFF.
NFR-004 No mostrar storageKey.
NFR-005 No registrar datos sensibles en console.
NFR-006 No renderizar HTML no confiable sin sanitización.
NFR-007 No incluir datos sensibles en analytics.
```

---

### 18.2. Performance

```text id="awa-nfr-performance"
NFR-008 First load admin app p95 < 3 s en ambiente objetivo.
NFR-009 Navegación entre pantallas p95 < 1 s con cache.
NFR-010 Tablas deben paginar server-side.
NFR-011 No cargar datasets completos masivos.
NFR-012 Usar lazy loading por módulo.
```

---

### 18.3. Usabilidad

```text id="awa-nfr-usability"
NFR-013 Interfaz debe ser usable en escritorio y tablet.
NFR-014 Formularios deben mostrar errores claros.
NFR-015 Tablas deben permitir búsqueda/filtros básicos.
NFR-016 Estados vacíos deben indicar siguiente acción.
NFR-017 Acciones críticas deben usar confirmación.
```

---

### 18.4. Mantenibilidad

```text id="awa-nfr-maintainability"
NFR-018 Código TypeScript strict.
NFR-019 Componentes reutilizables.
NFR-020 Cliente API generado desde OpenAPI cuando sea viable.
NFR-021 Rutas organizadas por módulo.
NFR-022 Separar UI, hooks, services y schemas.
NFR-023 Tests de componentes críticos.
```

---

## 19. Feature flags

```text id="awa-feature-flags"
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

```text id="awa-feature-rule"
El build o runtime debe fallar si se habilita modo público, auth WordPress, display de storageKey, IA externa con datos reales, control de hardware, acceso directo a base, captura de pagos o asientos contables directos.
```

---

## 20. Rutas prohibidas

No implementar:

```text id="awa-public-routes-forbidden"
/public/admin
/public/dashboard
/public/payments
/public/imports
/wp-admin/resident-core
/wordpress-admin/resident-core
/embed/admin
/embed/dashboard
```

---

## 21. Riesgos

| Riesgo                                 |      Nivel | Mitigación                                                    |
| -------------------------------------- | ---------: | ------------------------------------------------------------- |
| Exposición de datos cross-tenant       |    Crítico | tenant context, backend guard, cache invalidation             |
| Frontend muestra acción sin permiso    |       Alto | PermissionGate + backend authorization                        |
| Token filtrado                         |       Alto | OIDC seguro, no tokens en URL, evitar localStorage si hay BFF |
| storageKey visible                     |    Crítico | SecureDocumentLink solo usa secureDocumentId                  |
| Datos sensibles en console             |       Alto | lint rule, no-console production, sanitizers                  |
| Formularios envían campos prohibidos   |       Alto | DTO schemas frontend + backend 422                            |
| Cache muestra datos de tenant anterior |       Alto | clear cache on tenant switch                                  |
| Usuario usa WordPress como puente      |       Alto | no WordPress auth, no public routes                           |
| Acción crítica accidental              | Medio/Alto | confirm dialog, disabled while submitting                     |
| Doble submit                           | Medio/Alto | mutation lock, idempotency backend                            |
| XSS en comunicados/documentos          |       Alto | sanitización, escaping, CSP                                   |

---

## 22. Auditoría

La app no genera auditoría final por sí sola; las acciones auditables se registran en Core API.

La app debe:

```text id="awa-audit-ui"
- mostrar traceId en errores;
- enviar reason en acciones críticas cuando API lo exija;
- no enviar actor fields;
- no falsificar timestamps;
- no ocultar errores de auditoría del backend;
- mostrar estado de operación después de acciones críticas.
```

---

## 23. Observabilidad frontend

Métricas/eventos internos permitidos:

```text id="awa-observability"
adminApp.loaded
adminApp.route.changed
adminApp.api.error
adminApp.auth.sessionExpired
adminApp.tenant.changed
adminApp.criticalAction.submitted
adminApp.criticalAction.failed
```

No registrar:

```text id="awa-observability-forbidden"
- tokens;
- passwords;
- authorization headers;
- tenantId como label de alta cardinalidad en servicios externos;
- datos personales completos;
- identificaciones;
- placas;
- comprobantes;
- storageKey;
- payloads financieros raw.
```

---

## 24. API preliminar consumida

La app consumirá endpoints ya definidos en paquetes anteriores:

```text id="awa-api-consumed"
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

```text id="awa-api-consumed-rule"
Si un endpoint no existe o no está definido en OpenAPI, la app no debe inventar contrato propio; debe abrir gap o task para el módulo correspondiente.
```

---

## 25. Criterios de aceptación

```text id="awa-acceptance"
[ ] La app permite login con Keycloak.
[ ] La app permite logout.
[ ] La app permite seleccionar tenant autorizado.
[ ] La app limpia cache al cambiar tenant.
[ ] La app muestra menú según permisos.
[ ] La app bloquea rutas sin permiso.
[ ] La app muestra dashboard ejecutivo.
[ ] La app integra módulos administrativos MVP.
[ ] La app opera importaciones 028.
[ ] La app muestra errores 401/403/404/409/422 de forma diferenciada.
[ ] La app no envía tenantId como campo editable.
[ ] La app no envía actor fields.
[ ] La app no muestra storageKey.
[ ] La app no usa sesión WordPress.
[ ] La app no tiene rutas públicas administrativas.
[ ] La app no accede directamente a base de datos.
[ ] La app no ejecuta pagos fuera del Core.
[ ] La app no crea asientos contables directos.
[ ] La app no controla hardware.
[ ] La app no envía datos reales a IA externa.
```

---

## 26. No aceptación

No se acepta el módulo si:

```text id="awa-no-acceptance"
- usa sesión WordPress como autenticación;
- vive como plugin WordPress obligatorio;
- expone rutas públicas administrativas;
- permite seleccionar tenant no autorizado;
- muestra datos de tenant anterior por cache;
- muestra menú sin respetar permisos;
- permite operar acción bloqueada por backend;
- envía tenantId editable;
- envía createdBy, approvedBy o actor fields;
- muestra storageKey;
- guarda signedUrl persistente;
- registra tokens en console;
- incluye datos sensibles en URL;
- llama directamente a PostgreSQL;
- usa Prisma en frontend;
- ejecuta SQL desde frontend;
- implementa reglas financieras finales en frontend;
- ejecuta pagos fuera del Core;
- crea JournalEntry directo;
- confirma conciliación bancaria fuera del flujo autorizado;
- abre portones;
- controla hardware;
- usa IA externa con datos reales;
- ignora errores 403/404/422 del backend.
```

---

## 27. Resultado esperado

Al implementar `029-admin-web-app-basic`, RESIDENT contará con una consola administrativa privada y operativa para gestionar el Core, sin comprometer seguridad, tenant isolation, privacidad ni separación entre portal público WordPress y sistema transaccional.

Resultado esperado:

```text id="awa-expected-result"
admin web app definida
login Keycloak definido
tenant selector definido
permission-aware navigation definida
layout administrativo definido
dashboard integrado
módulos administrativos MVP integrados
data import UI integrada
secure document links definidos
error handling definido
no WordPress auth
no public admin routes
no storageKey exposure
no direct DB access
no frontend business-critical logic
no external AI with real data
```

---

## 28. Expediente actualizado

```text id="awa-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 028-data-import-migration/
│   │   └── 029-admin-web-app-basic/
│   │       └── spec.md
```
