# Security Notes — 029 Admin Web App Basic

## 1. Información del documento

| Campo          | Valor                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                             |
| Spec ID        | 029                                                                                                       |
| Módulo         | Admin Web App Basic                                                                                       |
| Documento      | Security Notes                                                                                            |
| Ruta           | `docs/specs/029-admin-web-app-basic/security-notes.md`                                                    |
| Versión        | 0.1                                                                                                       |
| Estado         | needs-review                                                                                              |
| Fecha          | 2026-08-03                                                                                                |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC |
| Naturaleza     | Tenant-scoped / Permission-aware / API-first / Non-public / Admin-facing                                  |

---

## 2. Propósito

Definir los controles de seguridad para la aplicación web administrativa básica de RESIDENT.

La app administrativa será la principal superficie visual para operar RESIDENT Core. Por tanto, debe proteger autenticación, autorización, tenant isolation, datos personales, datos financieros, documentos seguros, navegación por permisos, cache frontend y consumo de APIs.

Regla central de seguridad:

```text id="awa-sec-rule"
Admin Web App Basic debe operar únicamente como frontend privado, autenticado, tenant-aware, permission-aware y API-first, sin sesión WordPress, sin rutas públicas administrativas, sin acceso directo a base de datos, sin Prisma en frontend, sin storageKey, sin signedUrl persistente, sin tokens en URL o console, sin tenantId editable, sin actor fields, sin lógica financiera crítica en UI, sin control de hardware y sin IA externa con datos reales.
```

---

## 3. Clasificación de seguridad

```text id="awa-sec-classification"
Private admin frontend
Security-sensitive
Privacy-sensitive
Financial-sensitive
Tenant-aware
Permission-aware
OIDC-authenticated
API-only
No direct DB access
No WordPress auth
No public admin routes
No storageKey exposure
No hardware control
No external AI with real data
```

---

## 4. Activos protegidos

```text id="awa-sec-assets"
- sesión autenticada;
- access token;
- refresh token si aplica;
- tenant activo;
- permisos efectivos;
- navegación administrativa;
- datos personales;
- datos financieros;
- comprobantes de pago;
- documentos seguros;
- reportes;
- auditoría;
- importaciones;
- datos de residentes;
- datos de unidades;
- datos de accesos/visitantes;
- datos de mantenimiento;
- datos de inventario;
- cache frontend;
- errores con traceId;
- configuración de ambiente.
```

---

## 5. Principios de seguridad

```text id="awa-sec-principles"
1. Keycloak autentica.
2. RESIDENT Core autoriza.
3. El frontend nunca es fuente final de autorización.
4. Toda ruta administrativa requiere sesión.
5. Toda ruta tenant-scoped requiere tenant activo.
6. Toda acción visible depende de permisos efectivos.
7. Toda acción crítica depende de autorización backend.
8. El frontend no accede a PostgreSQL.
9. El frontend no usa Prisma.
10. El frontend no usa Redis directamente.
11. El frontend no usa Keycloak Admin API.
12. El frontend no usa sesión WordPress.
13. El frontend no expone storageKey.
14. El frontend no guarda signedUrl persistente.
15. El frontend no registra tokens en console.
16. El frontend no incluye tokens en URLs.
17. El frontend no envía tenantId editable.
18. El frontend no envía actor fields.
19. El frontend no calcula saldos finales.
20. El frontend no valida pagos por sí solo.
21. El frontend no controla hardware.
22. El frontend no usa IA externa con datos reales.
```

---

## 6. Superficies de ataque

### 6.1. Autenticación

Riesgos:

```text id="awa-sec-auth-risks"
- robo de token;
- token en URL;
- token en console;
- sesión no expirada correctamente;
- logout incompleto;
- uso de implicit flow;
- uso de sesión WordPress como bypass;
- almacenamiento inseguro en localStorage.
```

Controles:

```text id="awa-sec-auth-controls"
- Authorization Code Flow with PKCE.
- No implicit flow.
- Logout limpia sesión.
- Logout limpia tenant activo.
- Logout limpia TanStack Query cache.
- 401 global invalida sesión.
- No tokens en query params.
- No tokens en console.
- No refreshToken en localStorage.
- Preferir BFF con cookies httpOnly si la arquitectura lo permite.
```

---

### 6.2. Tenant context

Riesgos:

```text id="awa-sec-tenant-risks"
- usuario selecciona tenant no autorizado;
- cache muestra datos de tenant anterior;
- query key sin tenant;
- formulario abierto conserva datos de otro tenant;
- selected rows cruzan tenant;
- error 404 revela existencia cross-tenant.
```

Controles:

```text id="awa-sec-tenant-controls"
- TenantSwitcher muestra solo tenants autorizados.
- Tenant activo se valida contra memberships.
- Query keys incluyen tenant.
- Cache se limpia al cambiar tenant.
- Formularios se invalidan al cambiar tenant.
- selectedRowIds se limpian al cambiar tenant.
- 404 se muestra como NotFoundState sin revelar cross-tenant.
```

---

### 6.3. Permisos

Riesgos:

```text id="awa-sec-permission-risks"
- menú muestra acciones no autorizadas;
- ruta manual permite acceso;
- botón visible ejecuta acción no autorizada;
- permisos obsoletos en cache;
- usuario resident accede a consola admin.
```

Controles:

```text id="awa-sec-permission-controls"
- PermissionProvider basado en Core API.
- RoutePermissionGuard.
- PermissionGate por componente.
- SensitiveActionGuard para acciones críticas.
- permissionHash para cache sensible.
- Refresh de permisos al cambiar tenant.
- Backend autoriza cada endpoint.
- Resident bloqueado en MVP.
```

---

## 7. Reglas de sesión

```text id="awa-sec-session-rules"
- Toda pantalla /app requiere sesión válida.
- Usuario sin sesión se redirige a /login.
- Sesión expirada muestra SessionExpiredState.
- Logout limpia sesión, tenant, permisos, formularios y cache.
- No se debe guardar accessToken en URL.
- No se debe imprimir accessToken.
- No se debe guardar refreshToken en localStorage.
- No se debe usar sesión WordPress.
```

---

## 8. Reglas de tenant isolation frontend

```text id="awa-sec-tenant-rules"
- El usuario solo puede seleccionar tenants activos donde tenga membresía.
- Toda query tenant-scoped debe incluir tenant en query key.
- Toda query sensible debe considerar permissionHash.
- El cambio de tenant debe invalidar cache global.
- El cambio de tenant debe cerrar o resetear formularios abiertos.
- El cambio de tenant debe limpiar selección de tablas.
- El frontend no debe enviar tenantId como campo editable.
- El backend sigue validando tenant isolation.
```

Patrón de query key:

```typescript id="awa-sec-query-key"
["tenant", activeTenant.slug, "module", moduleKey, "resource", resourceKey, filtersHash]
```

---

## 9. Campos prohibidos

### 9.1. Prohibidos en formularios y requests

```text id="awa-sec-forbidden-requests"
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

### 9.2. Prohibidos en UI

```text id="awa-sec-forbidden-ui"
storageKey
signedUrl persistente
accessToken
refreshToken
authorization header
cookie
password
clientSecret
apiKey
databaseUrl
rawSql
script
functionBody
executableCode
payload financiero raw innecesario
datos personales completos sin permiso
datos cross-tenant
```

---

### 9.3. Prohibidos en logs frontend

```text id="awa-sec-forbidden-logs"
tokens
passwords
authorization headers
cookies
storageKey
signedUrl
identificaciones completas
placas completas
comprobantes
payloads financieros raw
payloads de importación
datos cross-tenant
```

---

## 10. Seguridad de documentos

Regla:

```text id="awa-sec-doc-rule"
La UI debe operar documentos únicamente mediante secureDocumentId y flujos autorizados del módulo 016-secure-document-storage.
```

Permitido:

```text id="awa-sec-doc-allowed"
- mostrar nombre de archivo permitido;
- mostrar clasificación permitida;
- usar secureDocumentId;
- solicitar descarga mediante endpoint autorizado;
- manejar 403/404.
```

Prohibido:

```text id="awa-sec-doc-forbidden"
- mostrar storageKey;
- copiar storageKey;
- construir URL manual al bucket;
- guardar signedUrl persistente;
- registrar documento sensible en console;
- descargar comprobantes fuera del flujo seguro.
```

---

## 11. Seguridad de formularios

```text id="awa-sec-form-rules"
- Validar con Zod para usabilidad.
- Backend sigue siendo autoridad final.
- No enviar tenantId editable.
- No enviar actor fields.
- No enviar status directo.
- No enviar storageKey.
- No enviar rawSql/script/formulaCode.
- Bloquear doble submit.
- Mostrar errores 422 por campo.
- Confirmar acciones críticas.
- Limpiar formularios al cambiar tenant.
```

Acciones críticas que requieren confirmación:

```text id="awa-sec-critical-actions"
- aprobar pago;
- rechazar pago;
- publicar comunicado crítico;
- publicar acta;
- aprobar importación;
- ejecutar importación;
- activar workflow;
- ejecutar workflow manual;
- asignar roles;
- remover roles;
- resolver apelación;
- archivar registro sensible.
```

---

## 12. Seguridad de módulos financieros

Reglas:

```text id="awa-sec-financial-rules"
- La UI no calcula saldos finales.
- La UI no modifica saldos manualmente.
- La UI no valida pagos por sí sola.
- La UI no procesa tarjetas.
- La UI no captura pagos.
- La UI no crea JournalEntry directo.
- La UI no confirma conciliación bancaria fuera del API autorizado.
- Montos se muestran como string decimal devuelto por Core.
```

Prohibido en frontend:

```text id="awa-sec-financial-forbidden"
payments.captureCard
payments.validateWithoutCore
payments.reverseWithoutCore
accounting.createJournalEntry
bankReconciliation.confirmMatchDirect
openBanking.initiatePayment
```

---

## 13. Seguridad de Data Import UI

```text id="awa-sec-import-rules"
- UI usa APIs del módulo 028.
- UI no cambia status directamente.
- UI no envía approvedBy.
- UI no envía executedBy.
- UI no envía storageKey.
- UI no procesa archivo fuera de SDS.
- UI respeta dry-run.
- UI respeta approval.
- UI muestra issues sanitizados.
- UI descarga reportes por secureDocumentId.
```

Prohibido:

```text id="awa-sec-import-forbidden"
- archivo base64 en JSON si no existe endpoint explícito;
- upload público;
- importación desde WordPress;
- ejecutar commit sin aprobación;
- ejecutar commit sin dry-run requerido;
- exponer filas completas sensibles en logs;
- usar IA externa para limpiar datos reales.
```

---

## 14. Seguridad de accesos y visitantes

```text id="awa-sec-access-rules"
- La UI puede registrar operaciones permitidas por Core API.
- La UI puede listar accesos autorizados.
- La UI debe enmascarar placas o identificaciones si API lo indica.
- La UI no debe abrir portones en MVP.
- La UI no debe controlar hardware.
- La UI no debe usar biometría.
- La UI no debe usar reconocimiento facial.
```

---

## 15. No WordPress Auth

WordPress no debe:

```text id="awa-sec-wordpress-forbidden"
- autenticar usuarios de Admin Web App;
- servir como consola transaccional;
- actuar como proxy administrativo;
- almacenar tokens Core;
- exponer shortcodes administrativos;
- habilitar imports, pagos o auditoría desde páginas públicas;
- reemplazar Keycloak.
```

Controles:

```text id="awa-sec-wordpress-controls"
- Admin Web App separada de WordPress.
- No rutas /wp-admin/resident-core.
- No sesión WordPress.
- No cookies WordPress para Core.
- CORS restrictivo.
```

---

## 16. No public admin routes

No implementar:

```text id="awa-sec-public-routes"
/public/admin
/public/dashboard
/public/imports
/public/payments
/public/users
/public/audit
/wp-admin/resident-core
/wordpress-admin/resident-core
/embed/admin
/embed/dashboard
```

Regla:

```text id="awa-sec-public-rule"
Toda ruta administrativa requiere sesión válida, tenant activo cuando aplique y permisos efectivos.
```

---

## 17. API client security

```text id="awa-sec-api-client"
- Base URL configurable.
- Cliente centralizado.
- Authorization centralizado.
- Tenant context centralizado.
- Error normalizer centralizado.
- No fetch manual disperso.
- No endpoints no documentados.
- No endpoints públicos administrativos.
- No WordPress como backend transaccional.
```

Build/CI debe fallar si:

```text id="awa-sec-api-client-ci"
- se consume endpoint no documentado;
- se detecta storageKey en DTO externo;
- se detecta tenantId editable;
- se detecta rawSql/script/formulaCode;
- falla generación del cliente OpenAPI.
```

---

## 18. BFF opcional

Si se implementa Backend-for-Frontend:

```text id="awa-sec-bff-rules"
- Usar cookies httpOnly.
- Usar Secure cookies en producción.
- Usar SameSite=Lax o Strict según flujo.
- No exponer accessToken al JavaScript del browser.
- No guardar clientSecret en bundle frontend.
- No convertir BFF en proxy público.
- No agregar endpoints administrativos no autorizados.
```

Endpoints BFF permitidos:

```text id="awa-sec-bff-allowed"
/api/auth/login
/api/auth/callback
/api/auth/logout
/api/auth/session
```

Endpoints BFF prohibidos:

```text id="awa-sec-bff-forbidden"
/api/public/admin-proxy
/api/proxy/raw-sql
/api/proxy/storage-key
/api/proxy/payment-capture
/api/proxy/hardware
/api/proxy/keycloak-admin
```

---

## 19. Headers y browser security

Headers recomendados:

```http id="awa-sec-headers"
Content-Security-Policy: default-src 'self'; frame-ancestors 'none';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cache-Control: no-store
```

Reglas:

```text id="awa-sec-browser-rules"
- No permitir iframe embedding de consola admin.
- No cargar scripts externos no aprobados.
- No usar dangerouslySetInnerHTML salvo excepción aprobada.
- Sanitizar contenido HTML si se renderiza.
- No permitir CORS wildcard.
```

---

## 20. Seguridad de dependencias

```text id="awa-sec-dependencies"
- Ejecutar npm audit o equivalente.
- Ejecutar dependency scanning en CI.
- Evitar paquetes no mantenidos.
- Bloquear paquetes que introduzcan eval innecesario.
- Revisar dependencias de rich text si se usan.
- Revisar dependencias de upload.
- Mantener Next.js y React actualizados.
```

CI debe bloquear:

```text id="awa-sec-dependency-ci"
- vulnerabilidades críticas explotables;
- paquetes con malware conocido;
- paquetes que exponen secretos en build;
- dependencias no justificadas para DB directa.
```

---

## 21. Observabilidad frontend segura

Eventos permitidos:

```text id="awa-sec-observability-events"
adminApp.loaded
adminApp.route.changed
adminApp.api.error
adminApp.auth.sessionExpired
adminApp.tenant.changed
adminApp.criticalAction.submitted
adminApp.criticalAction.failed
```

Datos prohibidos:

```text id="awa-sec-observability-forbidden"
tokens
passwords
authorization headers
cookies
storageKey
signedUrl
identificaciones
placas
comprobantes
payload financiero raw
payloads de importación
datos cross-tenant
```

Regla:

```text id="awa-sec-observability-rule"
Toda telemetría frontend debe ser agregada, mínima y sanitizada.
```

---

## 22. Feature flags de seguridad

```text id="awa-sec-feature-flags"
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

```text id="awa-sec-feature-rule"
El build o runtime debe fallar si se habilita modo público, auth WordPress, display de storageKey, IA externa con datos reales, control de hardware, acceso directo a base, captura de pagos o asientos contables directos.
```

---

## 23. OpenAPI security

Extensiones esperadas en APIs administrativas consumidas:

```yaml id="awa-sec-openapi-extensions"
x-auth-required: true
x-tenant-scope: true
x-public-exposure: false
x-wordpress-access: false
x-storage-key-exposed: false
x-raw-sql-allowed: false
x-scripting-allowed: false
x-external-ai-real-data: false
```

No aceptar contratos que expongan:

```text id="awa-sec-openapi-forbidden"
- storageKey;
- signedUrl persistente;
- tenantId editable;
- actor fields;
- status directo indebido;
- rawSql;
- script;
- formulaCode;
- secrets;
- endpoints públicos administrativos.
```

---

## 24. CI security gates

El pipeline debe fallar si:

```text id="awa-sec-ci-gates"
[ ] Se importa Prisma en frontend.
[ ] Se configura PostgreSQL URL.
[ ] Se configura Redis URL.
[ ] Se usa Keycloak Admin API.
[ ] Se detecta sesión WordPress.
[ ] Se detecta ruta pública administrativa.
[ ] Se detecta storageKey en UI.
[ ] Se detecta signedUrl persistente.
[ ] Se detecta token en console.
[ ] Se detecta authorization header en logs.
[ ] Se detecta tenantId editable en formularios.
[ ] Se detectan actor fields en formularios.
[ ] Se detecta rawSql/script/formulaCode.
[ ] Se consume endpoint no documentado.
[ ] Se rompe generación OpenAPI.
[ ] Cache no incluye tenant boundary.
[ ] Tests críticos de permisos fallan.
[ ] Tests críticos de tenant isolation fallan.
[ ] Se detecta hardware control.
[ ] Se detecta IA externa con datos reales.
```

---

## 25. Checklist de revisión de seguridad

```text id="awa-sec-review-checklist"
[ ] Todas las rutas /app requieren auth.
[ ] Toda ruta tenant requiere tenant activo.
[ ] Navigation respeta permisos.
[ ] RouteGuard bloquea acceso manual.
[ ] PermissionGate oculta acciones no permitidas.
[ ] Backend sigue autorizando.
[ ] Login usa OIDC con PKCE.
[ ] No implicit flow.
[ ] No sesión WordPress.
[ ] Logout limpia sesión, tenant y cache.
[ ] Query keys incluyen tenant.
[ ] Cambio de tenant limpia cache.
[ ] Formularios no envían tenantId.
[ ] Formularios no envían actor fields.
[ ] Formularios no envían storageKey.
[ ] SecureDocumentLink usa secureDocumentId.
[ ] No se muestra storageKey.
[ ] No se guarda signedUrl persistente.
[ ] No hay Prisma en frontend.
[ ] No hay DB direct access.
[ ] No hay Keycloak Admin API.
[ ] No hay rutas públicas admin.
[ ] No hay hardware control.
[ ] No hay IA externa con datos reales.
[ ] 401/403/404/422 se manejan diferenciadamente.
[ ] traceId se muestra en errores.
[ ] No hay console.log sensible.
[ ] CI security gates pasan.
```

---

## 26. Riesgos residuales

| Riesgo residual                           |      Nivel | Mitigación                                                  |
| ----------------------------------------- | ---------: | ----------------------------------------------------------- |
| Token expuesto por XSS                    |       Alto | CSP, sanitización, evitar scripts externos, BFF recomendado |
| Permiso frontend desactualizado           |      Medio | refresh permisos, backend authorization                     |
| Cache muestra datos previos por bug       |       Alto | query keys tenant-scoped, clear cache, tests                |
| storageKey aparece por cambio backend     |    Crítico | OpenAPI gate, response sanitizer, tests                     |
| Usuario autorizado ejecuta acción errónea | Medio/Alto | ConfirmDialog, reason, audit backend                        |
| XSS en comunicados                        |       Alto | escaping, sanitización, CSP                                 |
| Dependencia maliciosa                     |       Alto | dependency scanning, lockfile review                        |
| Error revela datos sensibles              |      Medio | error normalizer, sanitizers                                |
| Configuración pública accidental          |    Crítico | feature flags y build validation                            |

---

## 27. Recomendaciones futuras

Requieren ADR o revisión de seguridad:

```text id="awa-sec-future"
- patrón BFF formal;
- multi-factor authentication policy;
- session management avanzado;
- step-up authentication para acciones críticas;
- administración delegada de Keycloak;
- consola platform avanzada;
- SSO con terceros;
- embedding seguro en portales privados;
- app móvil administrativa;
- push notifications;
- IA asistida para administración;
- control de hardware;
- integraciones biométricas.
```

Regla:

```text id="awa-sec-future-rule"
Ninguna extensión futura que implique tokens, BFF, SSO externo, IA, hardware, biometría, pagos, bancos, contabilidad directa o administración de identidad debe implementarse sin ADR, threat model, security-notes, test-plan y aprobación explícita.
```

---

## 28. Criterios de aceptación de seguridad

```text id="awa-sec-acceptance"
[ ] Login usa Keycloak OIDC.
[ ] No se usa implicit flow.
[ ] Logout limpia sesión, tenant y cache.
[ ] Todas las rutas admin requieren auth.
[ ] Todas las rutas tenant requieren tenant activo.
[ ] Navigation respeta permisos.
[ ] RouteGuard bloquea acceso sin permiso.
[ ] Cambio de tenant limpia cache.
[ ] Query keys incluyen tenant.
[ ] Formularios no envían tenantId.
[ ] Formularios no envían actor fields.
[ ] UI no muestra storageKey.
[ ] UI no guarda signedUrl persistente.
[ ] UI no registra tokens.
[ ] UI no usa sesión WordPress.
[ ] UI no expone rutas públicas administrativas.
[ ] UI no usa Prisma.
[ ] UI no accede directo a PostgreSQL.
[ ] UI no usa Keycloak Admin API.
[ ] UI no calcula saldos finales.
[ ] UI no valida pagos sin Core API.
[ ] UI no crea JournalEntry.
[ ] UI no controla hardware.
[ ] UI no usa IA externa con datos reales.
[ ] CI security gates pasan.
```

---

## 29. No aceptación de seguridad

No se acepta el módulo si:

```text id="awa-sec-no-acceptance"
- usa sesión WordPress;
- permite rutas públicas administrativas;
- permite tenant no autorizado;
- muestra datos de tenant anterior por cache;
- muestra storageKey;
- guarda signedUrl persistente;
- registra tokens en console;
- incluye tokens en URL;
- incluye datos sensibles en URL;
- envía tenantId editable;
- envía actor fields;
- envía status directo indebido;
- usa Prisma en frontend;
- accede directo a PostgreSQL;
- accede directo a Redis;
- usa Keycloak Admin API desde frontend;
- consume endpoint no documentado sin gap;
- calcula saldos finales en UI;
- valida pagos sin Core API;
- ejecuta pagos fuera del Core;
- crea JournalEntry directo;
- confirma conciliación fuera del API autorizado;
- abre portones;
- controla hardware;
- usa biometría;
- usa reconocimiento facial;
- usa IA externa con datos reales;
- oculta errores 403/404/422 como genéricos;
- omite traceId cuando el backend lo devuelve.
```

---

## 30. Resultado esperado

```text id="awa-sec-expected-result"
security notes definidas
auth OIDC protegida
tenant isolation frontend protegido
permission-aware UI protegida
cache tenant-scoped protegida
API client seguro definido
OpenAPI security gates definidos
formularios seguros definidos
documentos seguros definidos
no storageKey
no signedUrl persistente
no WordPress auth
no public admin routes
no direct DB access
no Prisma frontend
no Keycloak Admin API
no frontend financial authority
no hardware control
no external AI with real data
CI security gates definidos
security review checklist definido
```

---

## 31. Expediente actualizado

```text id="awa-sec-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 029-admin-web-app-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 32. Cierre del paquete 029

Con este documento queda completo el paquete SDD:

```text id="awa-package-complete"
docs/specs/029-admin-web-app-basic/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
