# Security Notes — 030 Resident Self-Service Basic

## 1. Información del documento

| Campo          | Valor                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                               |
| Spec ID        | 030                                                                                                         |
| Módulo         | Resident Self-Service Basic                                                                                 |
| Documento      | Security Notes                                                                                              |
| Ruta           | `docs/specs/030-resident-self-service-basic/security-notes.md`                                              |
| Versión        | 0.1                                                                                                         |
| Estado         | needs-review                                                                                                |
| Fecha          | 2026-08-04                                                                                                  |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC   |
| Naturaleza     | Resident-facing / Tenant-scoped / Property-scoped / Permission-aware / API-first / Non-public transactional |

---

## 2. Propósito

Definir los controles de seguridad para el portal privado de autoservicio de residentes, propietarios, ocupantes y usuarios vinculados autorizados.

Este módulo expone información sensible directamente al usuario final: estados de cuenta, cargos, pagos, comprobantes, reservas, multas, documentos, visitantes, solicitudes de mantenimiento, reuniones, votaciones y datos de perfil. Por tanto, la seguridad debe reforzar tenant isolation, property-level authorization, minimización de datos, control de sesión y separación estricta entre portal público WordPress y operaciones transaccionales privadas.

Regla central de seguridad:

```text id="rss-sec-rule"
Resident Self-Service Basic debe operar únicamente como frontend privado, autenticado, tenant-scoped, property-scoped, person-scoped, permission-aware y API-first, sin sesión WordPress, sin rutas públicas transaccionales, sin datos cross-tenant, sin datos de unidades no autorizadas, sin storageKey, sin signedUrl persistente, sin tokens en URL o console, sin tenantId editable, sin propertyUnitId como autoridad final, sin actor fields, sin validación administrativa de pagos, sin creación de cargos desde self-service, sin acciones contables, sin conciliación bancaria, sin control de hardware, sin biometría, sin reconocimiento facial y sin IA externa con datos reales.
```

---

## 3. Clasificación de seguridad

```text id="rss-sec-classification"
Private resident frontend
Resident-facing
Security-sensitive
Privacy-sensitive
Financial-sensitive
Tenant-scoped
Property-scoped
Person-scoped
Permission-aware
OIDC-authenticated
API-only
No direct DB access
No WordPress auth
No public transactional routes
No storageKey exposure
No payment administration
No accounting actions
No hardware control
No biometric processing
No external AI with real data
```

---

## 4. Activos protegidos

```text id="rss-sec-assets"
- sesión autenticada;
- access token;
- refresh token si aplica;
- tenant activo;
- unidad activa;
- relación usuario-persona-unidad;
- permisos efectivos;
- estado de cuenta propio;
- cargos propios;
- pagos propios;
- comprobantes de pago;
- documentos seguros;
- reservas propias;
- multas propias;
- evidencias de multas;
- comunicados dirigidos;
- reuniones visibles;
- votaciones autorizadas;
- actas publicadas;
- solicitudes de mantenimiento propias;
- autorizaciones de visitantes propias;
- perfil del residente;
- preferencias de notificación;
- cache frontend;
- errores con traceId;
- configuración de ambiente.
```

---

## 5. Principios de seguridad

```text id="rss-sec-principles"
1. Keycloak autentica.
2. RESIDENT Core autoriza.
3. El frontend nunca es fuente final de autorización.
4. Toda ruta privada requiere sesión válida.
5. Toda ruta tenant-scoped requiere tenant activo.
6. Toda ruta property-scoped requiere unidad activa autorizada.
7. Toda consulta .own se resuelve server-side.
8. El frontend no decide qué unidades pertenecen al usuario.
9. El frontend no accede a datos de otras unidades.
10. El frontend no accede a datos de otros tenants.
11. El frontend no usa sesión WordPress.
12. El frontend no expone rutas transaccionales públicas.
13. El frontend no accede a PostgreSQL.
14. El frontend no usa Prisma.
15. El frontend no accede a Redis.
16. El frontend no usa Keycloak Admin API.
17. El frontend no muestra storageKey.
18. El frontend no guarda signedUrl persistente.
19. El frontend no registra tokens en console.
20. El frontend no incluye tokens en URLs.
21. El frontend no calcula saldos finales.
22. El frontend no valida pagos administrativamente.
23. El frontend no crea cargos.
24. El frontend no modifica saldos.
25. El frontend no crea asientos contables.
26. El frontend no confirma conciliaciones bancarias.
27. El frontend no abre portones.
28. El frontend no controla hardware.
29. El frontend no procesa biometría.
30. El frontend no usa reconocimiento facial.
31. El frontend no envía datos reales a IA externa.
```

---

## 6. Superficies de ataque

### 6.1. Autenticación

Riesgos:

```text id="rss-sec-auth-risks"
- robo de token;
- token en URL;
- token en console;
- refresh token en localStorage;
- sesión no expirada correctamente;
- logout incompleto;
- uso de implicit flow;
- uso de sesión WordPress como bypass;
- usuario bloqueado accede al portal;
- usuario sin residentPortal.access accede al portal.
```

Controles:

```text id="rss-sec-auth-controls"
- Authorization Code Flow with PKCE.
- No implicit flow.
- No tokens en query params.
- No tokens en console.
- No refreshToken en localStorage.
- Logout limpia sesión.
- Logout limpia tenant activo.
- Logout limpia unidad activa.
- Logout limpia permisos.
- Logout limpia TanStack Query cache.
- 401 global invalida sesión.
- residentPortal.access requerido.
- Bloqueo de usuario inactive/blocked.
- Preferir BFF con cookies httpOnly si la arquitectura lo permite.
```

---

### 6.2. Tenant context

Riesgos:

```text id="rss-sec-tenant-risks"
- usuario selecciona tenant no autorizado;
- tenant inactivo disponible;
- tenant suspendido disponible;
- tenant sin portal residente habilitado disponible;
- cache muestra datos de tenant anterior;
- query key sin tenant;
- error 404 revela existencia cross-tenant.
```

Controles:

```text id="rss-sec-tenant-controls"
- TenantSwitcher muestra solo tenants autorizados.
- residentPortalEnabled debe ser true.
- Tenant activo se valida contra memberships vigentes.
- Query keys incluyen tenant.
- Cambio de tenant limpia unidad activa.
- Cambio de tenant limpia cache.
- Cambio de tenant limpia formularios abiertos.
- 404 cross-tenant se muestra como NotFoundState genérico.
- Backend valida tenant en cada request.
```

---

### 6.3. Property scope

Riesgos:

```text id="rss-sec-property-risks"
- usuario selecciona unidad no vinculada;
- usuario manipula propertyUnitId;
- owner ve datos de unidad no propia;
- occupant ve información financiera completa sin permiso;
- cache muestra datos de unidad anterior;
- query key sin unidad;
- 404 revela existencia de unidad ajena;
- visitante/documento/multa/pago de otra unidad visible.
```

Controles:

```text id="rss-sec-property-controls"
- PropertyUnitSwitcher muestra solo unidades vinculadas activas.
- Backend resuelve relación UserProfile -> Person -> PropertyUnit.
- propertyUnitId enviado por UI no es autoridad final.
- Query keys property-scoped incluyen unidad.
- Cambio de unidad limpia cache property-scoped.
- Cambio de unidad limpia formularios abiertos.
- financialAccessLevel controla visibilidad inicial.
- Backend aplica autorización definitiva.
- 403 se muestra como ForbiddenState.
- 404 cross-property se muestra como NotFoundState sin revelar existencia.
```

---

### 6.4. Permisos

Riesgos:

```text id="rss-sec-permission-risks"
- menú muestra rutas sin permiso;
- ruta manual permite acceso;
- acción sin permiso se ejecuta;
- permisos obsoletos en cache;
- usuario sin residentPortal.access accede;
- residente accede a acción administrativa.
```

Controles:

```text id="rss-sec-permission-controls"
- ResidentPermissionProvider basado en Core API.
- ResidentRouteGuard.
- ResidentPermissionGate.
- PropertyScopeGuard.
- SensitiveActionGuard.
- permissionHash para cache sensible.
- Refresh de permisos al cambiar tenant o unidad.
- Backend autoriza cada endpoint.
- No consumir endpoints administrativos desde self-service.
```

---

## 7. Reglas de sesión

```text id="rss-sec-session-rules"
- Toda pantalla /resident/app requiere sesión válida.
- Usuario sin sesión se redirige a /resident/login.
- Usuario sin residentPortal.access recibe ForbiddenState.
- Sesión expirada muestra SessionExpiredState.
- Logout limpia sesión, tenant, unidad, permisos, formularios y cache.
- No se debe guardar accessToken en URL.
- No se debe imprimir accessToken.
- No se debe guardar refreshToken en localStorage.
- No se debe usar sesión WordPress.
```

---

## 8. Reglas de tenant isolation

```text id="rss-sec-tenant-rules"
- El usuario solo puede seleccionar tenants activos donde tenga membresía vigente.
- El tenant debe tener residentPortalEnabled=true.
- Toda query tenant-scoped debe incluir tenant en query key.
- Toda query sensible debe considerar permissionHash.
- El cambio de tenant debe invalidar cache global.
- El cambio de tenant debe limpiar unidad activa.
- El cambio de tenant debe cerrar o resetear formularios abiertos.
- El frontend no debe enviar tenantId como campo editable.
- El backend sigue validando tenant isolation.
```

Patrón de query key:

```typescript id="rss-sec-tenant-query-key"
["resident", tenantSlug, propertyUnitCode, "module", moduleKey, "resource", resourceKey, filtersHash]
```

---

## 9. Reglas de property-level authorization

```text id="rss-sec-property-rules"
- El usuario solo puede seleccionar unidades vinculadas activas.
- La unidad activa debe pertenecer al tenant activo.
- La unidad activa debe estar vinculada al usuario.
- propertyUnitId no debe usarse como autoridad final.
- Backend debe validar toda relación .own.
- Cambio de unidad invalida cache property-scoped.
- Cambio de unidad limpia selected rows y formularios.
- Datos financieros dependen de financialAccessLevel y autorización backend.
- Recursos de otra unidad deben responder 403 o 404 según política del Core.
```

---

## 10. Campos prohibidos

### 10.1. Prohibidos en formularios y requests

```text id="rss-sec-forbidden-requests"
tenantId
propertyUnitId como autoridad final no validada
createdBy
updatedBy
approvedBy
executedBy
cancelledBy
archivedBy
uploadedBy
requestedBy
status directo indebido
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
hardwareCommand
gateOpenCommand
biometricData
faceImage
faceEmbedding
```

---

### 10.2. Prohibidos en UI

```text id="rss-sec-forbidden-ui"
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
estado de cuenta completo en almacenamiento persistente
comprobante completo en cache persistente
datos personales completos sin permiso
datos de visitantes completos sin necesidad
datos cross-tenant
datos de otra unidad
```

---

### 10.3. Prohibidos en logs frontend

```text id="rss-sec-forbidden-logs"
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
payloads financieros raw
payloads de visitantes
payloads de votación secreta
payloads de mantenimiento sensibles
datos cross-tenant
datos de otra unidad
```

---

## 11. Seguridad de documentos

Regla:

```text id="rss-sec-doc-rule"
La UI debe operar documentos únicamente mediante secureDocumentId y flujos autorizados del módulo 016-secure-document-storage.
```

Permitido:

```text id="rss-sec-doc-allowed"
- mostrar nombre de archivo permitido;
- mostrar clasificación permitida;
- usar secureDocumentId;
- solicitar descarga mediante endpoint autorizado;
- manejar 403/404;
- mostrar actas, comprobantes o evidencias solo si Core autoriza.
```

Prohibido:

```text id="rss-sec-doc-forbidden"
- mostrar storageKey;
- copiar storageKey;
- construir URL manual al bucket;
- guardar signedUrl persistente;
- registrar documento sensible en console;
- descargar comprobantes fuera del flujo seguro;
- enviar documentos reales a IA externa;
- mostrar documentos de otra unidad.
```

---

## 12. Seguridad de formularios

```text id="rss-sec-form-rules"
- Validar con Zod para usabilidad.
- Backend sigue siendo autoridad final.
- No enviar tenantId editable.
- No usar propertyUnitId como autoridad final.
- No enviar actor fields.
- No enviar status directo indebido.
- No enviar storageKey.
- No enviar signedUrl.
- No enviar rawSql/script/formulaCode.
- No enviar secrets.
- No enviar hardwareCommand.
- No enviar biometricData.
- Bloquear doble submit.
- Mostrar errores 422 por campo.
- Confirmar acciones críticas.
- Limpiar formularios al cambiar tenant o unidad.
```

Acciones críticas que requieren confirmación:

```text id="rss-sec-critical-actions"
- enviar comprobante de pago;
- cancelar reserva;
- apelar multa;
- confirmar asistencia;
- emitir voto;
- crear solicitud de mantenimiento con evidencia;
- crear autorización de visitante;
- cancelar autorización de visitante;
- actualizar datos personales propios;
- cambiar preferencias de notificación sensibles.
```

---

## 13. Seguridad financiera

Reglas:

```text id="rss-sec-financial-rules"
- La UI no calcula saldos finales.
- La UI no modifica saldos.
- La UI no crea cargos.
- La UI no modifica cargos.
- La UI no valida pagos administrativamente.
- La UI no aprueba pagos.
- La UI no rechaza pagos.
- La UI no reversa pagos.
- La UI no procesa tarjetas directamente.
- La UI no captura pagos.
- La UI no crea JournalEntry.
- La UI no confirma conciliación bancaria.
- Montos se muestran como string decimal devuelto por Core.
```

Prohibido en frontend:

```text id="rss-sec-financial-forbidden"
payments.approve
payments.reject
payments.reverse
payments.validateAdministratively
payments.captureCard
dues.createCharge
dues.updateCharge
accounting.createJournalEntry
bankReconciliation.confirmMatch
openBanking.initiatePayment
```

Permitido:

```text id="rss-sec-financial-allowed"
- consultar cargos propios;
- consultar pagos propios;
- consultar estado de cuenta propio;
- enviar comprobante de pago si el flujo lo permite;
- consultar estado de validación del pago;
- descargar estado de cuenta si Core lo autoriza.
```

---

## 14. Seguridad de pagos y comprobantes

```text id="rss-sec-payment-rules"
- El comprobante debe gestionarse por Secure Document Storage.
- UI solo referencia secureDocumentId.
- UI no muestra storageKey.
- UI no guarda signedUrl persistente.
- UI no ejecuta OCR automático en MVP.
- UI no envía comprobantes a IA externa.
- UI no puede aprobar su propio pago.
- UI no puede modificar estado del pago directamente.
- Core valida monto, unidad, tenant, método y estado.
```

---

## 15. Seguridad de reservas

```text id="rss-sec-reservation-rules"
- UI solo crea reservas propias.
- UI solo cancela reservas propias si canCancel=true.
- Backend valida disponibilidad.
- Backend valida políticas del tenant.
- Backend valida unidad.
- UI no aprueba reservas administrativamente.
- UI no calcula cargos finales.
- UI no modifica estados arbitrariamente.
```

---

## 16. Seguridad de multas y apelaciones

```text id="rss-sec-fines-rules"
- UI solo muestra multas propias.
- UI no crea multas.
- UI no edita multas.
- UI no resuelve apelaciones.
- UI solo permite apelar si appealAllowed=true.
- Backend valida appealDeadline.
- Evidencias se muestran solo mediante documentos autorizados.
- No se muestran multas de otra unidad.
```

---

## 17. Seguridad de comunicados

```text id="rss-sec-communications-rules"
- UI solo muestra comunicados dirigidos al usuario, unidad o audiencia autorizada.
- HTML debe escaparse o sanitizarse.
- Adjuntos usan SecureDocumentLink.
- No se muestran audiencias internas no autorizadas.
- No se muestran comunicados de otros tenants.
- No se muestran comunicados de otras unidades si la audiencia no corresponde.
```

Controles XSS:

```text id="rss-sec-communications-xss"
- Sanitizar contenido HTML si existe.
- Evitar dangerouslySetInnerHTML salvo excepción aprobada.
- Aplicar CSP restrictiva.
- No cargar scripts desde comunicados.
```

---

## 18. Seguridad de reuniones, votaciones y actas

```text id="rss-sec-governance-rules"
- UI solo muestra reuniones visibles para el usuario.
- UI solo permite confirmar asistencia propia.
- Elegibilidad de votación se define en backend.
- Backend impide doble voto.
- UI no calcula resultados finales.
- UI no calcula quorum final.
- UI no expone voto secreto.
- UI solo muestra actas publicadas para residentes.
- UI no edita ni certifica actas.
```

---

## 19. Seguridad de mantenimiento

```text id="rss-sec-maintenance-rules"
- UI solo muestra solicitudes propias.
- UI solo crea solicitudes propias.
- Adjuntos usan secureDocumentId.
- UI no asigna proveedor.
- UI no aprueba costos.
- UI no cierra administrativamente si no corresponde.
- Backend valida unidad, estado, permisos y política.
```

---

## 20. Seguridad de visitantes y accesos

```text id="rss-sec-visitors-rules"
- UI solo muestra visitantes propios.
- UI solo crea autorizaciones propias si la política lo permite.
- UI minimiza datos del visitante.
- accessCode debe mostrarse enmascarado si Core lo define.
- UI no abre portones.
- UI no envía hardwareCommand.
- UI no controla dispositivos físicos.
- UI no procesa biometría.
- UI no usa reconocimiento facial.
- UI no muestra visitantes de otra unidad.
```

Prohibido:

```text id="rss-sec-visitors-forbidden"
gate.open
access.openGate
hardware.sendCommand
biometrics.capture
faceRecognition.identify
visitorAuthorization.viewOtherUnit
```

---

## 21. Seguridad de perfil propio

```text id="rss-sec-profile-rules"
- UI solo muestra perfil propio.
- UI permite actualización limitada si Core lo autoriza.
- UI no modifica roles.
- UI no modifica permisos.
- UI no modifica memberships.
- UI no modifica relaciones con unidades.
- UI no modifica keycloakSubjectId.
- UI no modifica estado administrativo del usuario.
```

---

## 22. No WordPress Auth

WordPress puede enlazar al portal privado, pero no puede autenticar ni ejecutar operaciones transaccionales.

WordPress no debe:

```text id="rss-sec-wordpress-forbidden"
- autenticar usuarios del portal residente;
- servir como consola transaccional;
- actuar como proxy de pagos;
- actuar como proxy de documentos;
- almacenar tokens Core;
- exponer estados de cuenta;
- exponer comprobantes;
- exponer documentos privados;
- registrar visitantes desde formularios públicos;
- cargar pagos desde páginas públicas;
- reemplazar Keycloak.
```

Controles:

```text id="rss-sec-wordpress-controls"
- Resident Self-Service separado de WordPress.
- No rutas /wp-admin/resident-self-service.
- No sesión WordPress.
- No cookies WordPress para Core.
- CORS restrictivo.
- Enlaces desde WordPress solo hacia login del portal privado.
```

---

## 23. No public transactional routes

No implementar:

```text id="rss-sec-public-routes"
/public/resident/account-statement
/public/resident/payments
/public/resident/documents
/public/resident/visitors
/public/resident/maintenance
/public/resident/fines
/wp/resident-private
/wp-admin/resident-self-service
/embed/resident-dashboard
/embed/resident-account-statement
```

Regla:

```text id="rss-sec-public-rule"
Toda ruta transaccional del portal residente requiere sesión válida, tenant autorizado, unidad autorizada cuando aplique y permisos efectivos.
```

---

## 24. API client security

```text id="rss-sec-api-client"
- Base URL configurable.
- Cliente centralizado.
- Authorization centralizado.
- Tenant context centralizado.
- Property context centralizado.
- Error normalizer centralizado.
- No fetch manual disperso.
- No endpoints no documentados.
- No endpoints administrativos desde self-service.
- No endpoints públicos transaccionales.
- No WordPress como backend transaccional.
```

Build/CI debe fallar si:

```text id="rss-sec-api-client-ci"
- se consume endpoint no documentado;
- se consume endpoint administrativo para self-service;
- se detecta storageKey en DTO externo;
- se detecta tenantId editable;
- se detecta actor field;
- se detecta rawSql/script/formulaCode;
- falla generación del cliente OpenAPI.
```

---

## 25. BFF opcional

Si se implementa Backend-for-Frontend:

```text id="rss-sec-bff-rules"
- Usar cookies httpOnly.
- Usar Secure cookies en producción.
- Usar SameSite=Lax o Strict según flujo.
- No exponer accessToken al JavaScript del browser.
- No guardar clientSecret en bundle frontend.
- No convertir BFF en proxy público.
- No agregar endpoints administrativos.
- No agregar proxy de storageKey.
- No agregar proxy de hardware.
```

Endpoints BFF permitidos:

```text id="rss-sec-bff-allowed"
/resident/api/auth/login
/resident/api/auth/callback
/resident/api/auth/logout
/resident/api/auth/session
```

Endpoints BFF prohibidos:

```text id="rss-sec-bff-forbidden"
/resident/api/public/account-statement
/resident/api/public/payments
/resident/api/proxy/raw-sql
/resident/api/proxy/storage-key
/resident/api/proxy/payment-admin
/resident/api/proxy/accounting
/resident/api/proxy/bank-reconciliation
/resident/api/proxy/hardware
/resident/api/proxy/biometrics
/resident/api/proxy/keycloak-admin
```

---

## 26. Headers y browser security

Headers recomendados:

```http id="rss-sec-headers"
Content-Security-Policy: default-src 'self'; frame-ancestors 'none';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cache-Control: no-store
```

Reglas:

```text id="rss-sec-browser-rules"
- No permitir iframe embedding del portal residente.
- No cargar scripts externos no aprobados.
- No usar dangerouslySetInnerHTML salvo excepción aprobada.
- Sanitizar contenido HTML si se renderiza.
- No permitir CORS wildcard.
- No incluir datos sensibles en URL.
```

---

## 27. Seguridad de dependencias

```text id="rss-sec-dependencies"
- Ejecutar npm audit o equivalente.
- Ejecutar dependency scanning en CI.
- Evitar paquetes no mantenidos.
- Bloquear paquetes que introduzcan eval innecesario.
- Revisar dependencias de rich text si se usan.
- Revisar dependencias de upload.
- Mantener Next.js y React actualizados.
- Revisar dependencias de OIDC.
```

CI debe bloquear:

```text id="rss-sec-dependency-ci"
- vulnerabilidades críticas explotables;
- paquetes con malware conocido;
- paquetes que exponen secretos en build;
- dependencias no justificadas para DB directa;
- dependencias no justificadas para hardware;
- dependencias biométricas no aprobadas.
```

---

## 28. Observabilidad frontend segura

Eventos permitidos:

```text id="rss-sec-observability-events"
residentApp.loaded
residentApp.route.changed
residentApp.api.error
residentApp.auth.sessionExpired
residentApp.tenant.changed
residentApp.unit.changed
residentApp.criticalAction.submitted
residentApp.criticalAction.failed
```

Datos prohibidos:

```text id="rss-sec-observability-forbidden"
tokens
passwords
authorization headers
cookies
storageKey
signedUrl
identificaciones
placas
comprobantes
estados de cuenta completos
payload financiero raw
payloads de visitantes
payloads de mantenimiento sensibles
payloads de votación secreta
datos cross-tenant
datos de otra unidad
```

Regla:

```text id="rss-sec-observability-rule"
Toda telemetría frontend debe ser agregada, mínima, sanitizada y sin payload sensible.
```

---

## 29. Feature flags de seguridad

```text id="rss-sec-feature-flags"
RESIDENT_SELF_SERVICE_ENABLED=true
RESIDENT_SELF_SERVICE_PUBLIC_MODE_ENABLED=false
RESIDENT_SELF_SERVICE_WORDPRESS_AUTH_ENABLED=false
RESIDENT_SELF_SERVICE_STORAGE_KEY_DISPLAY_ENABLED=false
RESIDENT_SELF_SERVICE_EXTERNAL_AI_ENABLED=false
RESIDENT_SELF_SERVICE_HARDWARE_CONTROL_ENABLED=false
RESIDENT_SELF_SERVICE_PAYMENT_ADMIN_ACTIONS_ENABLED=false
RESIDENT_SELF_SERVICE_ACCOUNTING_ACTIONS_ENABLED=false
RESIDENT_SELF_SERVICE_BANK_RECONCILIATION_ENABLED=false
RESIDENT_SELF_SERVICE_BIOMETRICS_ENABLED=false
RESIDENT_SELF_SERVICE_FACE_RECOGNITION_ENABLED=false
```

Regla:

```text id="rss-sec-feature-rule"
El build o runtime debe fallar si se habilita modo público transaccional, auth WordPress, display de storageKey, IA externa con datos reales, control de hardware, acciones administrativas de pago, contabilidad, conciliación bancaria, biometría o reconocimiento facial.
```

---

## 30. OpenAPI security

Extensiones esperadas en APIs self-service:

```yaml id="rss-sec-openapi-extensions"
x-auth-required: true
x-tenant-scope: true
x-property-scope: true
x-own-resource: true
x-public-exposure: false
x-wordpress-access: false
x-storage-key-exposed: false
x-raw-sql-allowed: false
x-scripting-allowed: false
x-payment-admin-action: false
x-accounting-action: false
x-bank-reconciliation-action: false
x-hardware-control: false
x-biometric-processing: false
x-face-recognition: false
x-external-ai-real-data: false
```

No aceptar contratos que expongan:

```text id="rss-sec-openapi-forbidden"
- storageKey;
- signedUrl persistente;
- tenantId editable;
- propertyUnitId como autoridad final no validada;
- actor fields;
- status directo indebido;
- rawSql;
- script;
- formulaCode;
- secrets;
- endpoints públicos transaccionales;
- endpoints administrativos para self-service;
- comandos de hardware;
- biometricData;
- faceImage;
- faceEmbedding.
```

---

## 31. CI security gates

El pipeline debe fallar si:

```text id="rss-sec-ci-gates"
[ ] Se importa Prisma en frontend.
[ ] Se configura PostgreSQL URL.
[ ] Se configura Redis URL.
[ ] Se usa Keycloak Admin API.
[ ] Se detecta sesión WordPress.
[ ] Se detecta ruta pública transaccional.
[ ] Se consume endpoint administrativo desde self-service.
[ ] Se detecta storageKey en UI.
[ ] Se detecta signedUrl persistente.
[ ] Se detecta token en console.
[ ] Se detecta authorization header en logs.
[ ] Se detecta tenantId editable en formularios.
[ ] Se detecta actor field en formularios.
[ ] Se detecta rawSql/script/formulaCode.
[ ] Se detecta hardwareCommand.
[ ] Se detecta biometricData.
[ ] Se detecta faceImage.
[ ] Se detecta faceEmbedding.
[ ] Se consume endpoint no documentado.
[ ] Se rompe generación OpenAPI.
[ ] Cache no incluye tenant boundary.
[ ] Cache property-scoped no incluye unidad.
[ ] Tests críticos de permisos fallan.
[ ] Tests críticos de tenant isolation fallan.
[ ] Tests críticos de property scope fallan.
[ ] Se detecta acción administrativa de pagos.
[ ] Se detecta acción contable.
[ ] Se detecta conciliación bancaria.
[ ] Se detecta hardware control.
[ ] Se detecta biometría.
[ ] Se detecta reconocimiento facial.
[ ] Se detecta IA externa con datos reales.
```

---

## 32. Checklist de revisión de seguridad

```text id="rss-sec-review-checklist"
[ ] Todas las rutas /resident/app requieren auth.
[ ] Toda ruta tenant requiere tenant activo.
[ ] Toda ruta property-scoped requiere unidad activa.
[ ] Navigation respeta permisos.
[ ] RouteGuard bloquea acceso manual.
[ ] PropertyScopeGuard bloquea unidad no autorizada.
[ ] PermissionGate oculta acciones no permitidas.
[ ] Backend sigue autorizando.
[ ] Login usa OIDC con PKCE.
[ ] No implicit flow.
[ ] No sesión WordPress.
[ ] Logout limpia sesión, tenant, unidad y cache.
[ ] Query keys incluyen tenant.
[ ] Query keys property-scoped incluyen unidad.
[ ] Cambio de tenant limpia unidad y cache.
[ ] Cambio de unidad limpia cache property-scoped.
[ ] Formularios no envían tenantId.
[ ] Formularios no usan propertyUnitId como autoridad final.
[ ] Formularios no envían actor fields.
[ ] Formularios no envían storageKey.
[ ] Formularios no envían hardwareCommand.
[ ] Formularios no envían biometricData.
[ ] SecureDocumentLink usa secureDocumentId.
[ ] No se muestra storageKey.
[ ] No se guarda signedUrl persistente.
[ ] No hay Prisma en frontend.
[ ] No hay DB direct access.
[ ] No hay Keycloak Admin API.
[ ] No hay rutas públicas transaccionales.
[ ] No hay endpoints administrativos consumidos.
[ ] No hay validación administrativa de pagos.
[ ] No hay acciones contables.
[ ] No hay conciliación bancaria.
[ ] No hay hardware control.
[ ] No hay biometría.
[ ] No hay reconocimiento facial.
[ ] No hay IA externa con datos reales.
[ ] 401/403/404/422 se manejan diferenciadamente.
[ ] traceId se muestra en errores.
[ ] No hay console.log sensible.
[ ] CI security gates pasan.
```

---

## 33. Riesgos residuales

| Riesgo residual                                      |      Nivel | Mitigación                                                  |
| ---------------------------------------------------- | ---------: | ----------------------------------------------------------- |
| Token expuesto por XSS                               |       Alto | CSP, sanitización, evitar scripts externos, BFF recomendado |
| Cache muestra datos de unidad previa por bug         |       Alto | query keys tenant/property-scoped, clear cache, tests       |
| Permiso frontend desactualizado                      |      Medio | refresh permisos, backend authorization                     |
| storageKey aparece por cambio backend                |    Crítico | OpenAPI gate, response sanitizer, tests                     |
| Usuario autorizado carga comprobante incorrecto      | Medio/Alto | confirmación, validación backend, auditoría                 |
| Usuario autorizado apela multa con información falsa |      Medio | auditoría, revisión administrativa                          |
| XSS en comunicados                                   |       Alto | escaping, sanitización, CSP                                 |
| Dependencia maliciosa                                |       Alto | dependency scanning, lockfile review                        |
| Error revela recurso de otra unidad                  |       Alto | error normalizer, 404 genérico                              |
| Configuración pública accidental                     |    Crítico | feature flags y build validation                            |

---

## 34. Recomendaciones futuras

Requieren ADR o revisión de seguridad:

```text id="rss-sec-future"
- patrón BFF formal;
- MFA obligatorio para residentes;
- step-up authentication para pagos o datos financieros;
- integración real con proveedor de pagos;
- notificaciones push;
- app móvil nativa;
- PWA offline;
- OCR de comprobantes;
- IA asistida para soporte;
- wallet de documentos;
- firma electrónica;
- control de hardware;
- acceso con QR conectado a dispositivos físicos;
- biometría;
- reconocimiento facial;
- chat residente-administración;
- soporte multi-idioma avanzado.
```

Regla:

```text id="rss-sec-future-rule"
Ninguna extensión futura que implique tokens, BFF, pagos, bancos, OCR, IA, hardware, biometría, reconocimiento facial, firma electrónica, chat sensible o documentos personales debe implementarse sin ADR, threat model, security-notes, test-plan y aprobación explícita.
```

---

## 35. Criterios de aceptación de seguridad

```text id="rss-sec-acceptance"
[ ] Login usa Keycloak OIDC.
[ ] No se usa implicit flow.
[ ] Logout limpia sesión, tenant, unidad y cache.
[ ] Todas las rutas resident requieren auth.
[ ] Todas las rutas tenant requieren tenant activo.
[ ] Todas las rutas property-scoped requieren unidad activa.
[ ] Navigation respeta permisos.
[ ] RouteGuard bloquea acceso sin permiso.
[ ] PropertyScopeGuard bloquea unidad no autorizada.
[ ] Cambio de tenant limpia unidad y cache.
[ ] Cambio de unidad limpia cache property-scoped.
[ ] Query keys incluyen tenant.
[ ] Query keys property-scoped incluyen unidad.
[ ] Formularios no envían tenantId.
[ ] Formularios no usan propertyUnitId como autoridad final.
[ ] Formularios no envían actor fields.
[ ] UI no muestra storageKey.
[ ] UI no guarda signedUrl persistente.
[ ] UI no registra tokens.
[ ] UI no usa sesión WordPress.
[ ] UI no expone rutas públicas transaccionales.
[ ] UI no consume endpoints administrativos.
[ ] UI no usa Prisma.
[ ] UI no accede directo a PostgreSQL.
[ ] UI no usa Keycloak Admin API.
[ ] UI no calcula saldos finales.
[ ] UI no valida pagos administrativamente.
[ ] UI no crea cargos.
[ ] UI no crea JournalEntry.
[ ] UI no confirma conciliación bancaria.
[ ] UI no controla hardware.
[ ] UI no usa biometría.
[ ] UI no usa reconocimiento facial.
[ ] UI no usa IA externa con datos reales.
[ ] CI security gates pasan.
```

---

## 36. No aceptación de seguridad

No se acepta el módulo si:

```text id="rss-sec-no-acceptance"
- usa sesión WordPress;
- permite rutas públicas transaccionales;
- permite tenant no autorizado;
- permite unidad no vinculada;
- muestra datos de tenant anterior por cache;
- muestra datos de unidad anterior por cache;
- muestra datos de otra unidad;
- muestra storageKey;
- guarda signedUrl persistente;
- registra tokens en console;
- incluye tokens en URL;
- incluye datos sensibles en URL;
- envía tenantId editable;
- usa propertyUnitId como autoridad final sin validación backend;
- envía actor fields;
- envía status directo indebido;
- usa Prisma en frontend;
- accede directo a PostgreSQL;
- accede directo a Redis;
- usa Keycloak Admin API desde frontend;
- consume endpoint administrativo desde self-service;
- consume endpoint no documentado sin gap;
- calcula saldos finales en UI;
- valida pagos administrativamente;
- aprueba pagos;
- rechaza pagos;
- reversa pagos;
- crea cargos desde self-service;
- modifica saldos;
- crea JournalEntry directo;
- confirma conciliación bancaria;
- abre portones;
- controla hardware;
- usa biometría;
- usa reconocimiento facial;
- usa IA externa con datos reales;
- oculta errores 403/404/422 como genéricos;
- omite traceId cuando el backend lo devuelve.
```

---

## 37. Resultado esperado

```text id="rss-sec-expected-result"
security notes definidas
auth OIDC protegida
tenant isolation protegido
property scope protegido
permission-aware UI protegida
cache tenant/property-scoped protegida
API client seguro definido
OpenAPI security gates definidos
formularios seguros definidos
documentos seguros definidos
pagos propios protegidos
estado de cuenta propio protegido
reservas propias protegidas
multas propias protegidas
comunicados dirigidos protegidos
votaciones protegidas
mantenimiento propio protegido
visitantes propios protegidos
perfil propio protegido
no storageKey
no signedUrl persistente
no WordPress auth
no public transactional routes
no direct DB access
no Prisma frontend
no Keycloak Admin API
no admin payment validation
no accounting actions
no bank reconciliation
no hardware control
no biometrics
no face recognition
no external AI with real data
CI security gates definidos
security review checklist definido
```

---

## 38. Expediente actualizado

```text id="rss-sec-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 030-resident-self-service-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 39. Cierre del paquete 030

Con este documento queda completo el paquete SDD:

```text id="rss-package-complete"
docs/specs/030-resident-self-service-basic/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
