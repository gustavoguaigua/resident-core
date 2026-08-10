# Spec — 030 Resident Self-Service Basic

## 1. Información del documento

| Campo          | Valor                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                               |
| Spec ID        | 030                                                                                                         |
| Módulo         | Resident Self-Service Basic                                                                                 |
| Documento      | Functional Specification                                                                                    |
| Ruta           | `docs/specs/030-resident-self-service-basic/spec.md`                                                        |
| Versión        | 0.1                                                                                                         |
| Estado         | needs-review                                                                                                |
| Fecha          | 2026-08-03                                                                                                  |
| Fase           | FASE 2 — RESIDENT Core                                                                                      |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC   |
| Naturaleza     | Resident-facing / Tenant-scoped / Property-scoped / Permission-aware / API-first / Non-public transactional |

---

## 2. Propósito

El módulo `030-resident-self-service-basic` define la aplicación o portal privado para residentes, propietarios y ocupantes autorizados.

Permitirá a cada usuario consultar y gestionar información relacionada únicamente con sus unidades, pagos, estados de cuenta, reservas, multas, comunicados, documentos, reuniones, visitas y solicitudes de mantenimiento.

Regla central:

```text id="rss-rule"
Resident Self-Service Basic debe ser una experiencia privada, autenticada, tenant-scoped, property-scoped y permission-aware para residentes, propietarios y ocupantes autorizados, consumiendo exclusivamente APIs oficiales de RESIDENT Core, sin acceso administrativo, sin datos cross-tenant, sin datos de otras unidades no autorizadas, sin sesión WordPress como autenticación transaccional, sin acceso directo a base de datos, sin storageKey, sin validación administrativa de pagos, sin creación de asientos contables, sin conciliación bancaria, sin control de hardware, sin biometría y sin IA externa con datos reales.
```

---

## 3. Contexto dentro de RESIDENT

```text id="rss-context"
RESIDENT Platform
├── WordPress Multitenant Portal
│   └── capa pública informativa del conjunto
├── RESIDENT Core API
│   └── backend transaccional y fuente de verdad
├── Keycloak
│   └── autenticación OIDC/OAuth2
├── Admin Web App Basic
│   └── consola privada administrativa
└── Resident Self-Service Basic
    └── portal privado del residente/propietario
```

Regla:

```text id="rss-context-rule"
WordPress puede enlazar hacia el portal privado del residente, pero no debe autenticar operaciones transaccionales ni exponer datos privados del Core.
```

---

## 4. Problema que resuelve

Sin un portal privado para residentes, la administración tendría que responder manualmente consultas repetitivas de pagos, saldos, reservas, multas, comunicados, documentos y solicitudes.

Problemas a resolver:

```text id="rss-problems"
- residentes sin acceso directo a su estado de cuenta;
- pagos y comprobantes enviados por canales informales;
- reservas de áreas comunales gestionadas manualmente;
- multas y sanciones comunicadas sin trazabilidad;
- comunicados dispersos por WhatsApp u otros canales;
- documentos internos difíciles de consultar;
- solicitudes de mantenimiento sin seguimiento;
- registro manual de visitantes;
- poca transparencia sobre saldos, cargos y pagos;
- exceso de carga operativa para la administración.
```

---

## 5. Objetivos funcionales

```text id="rss-objectives"
1. Permitir login seguro del residente mediante Keycloak.
2. Mostrar únicamente tenants donde el usuario tenga membresía vigente.
3. Mostrar únicamente unidades vinculadas al usuario.
4. Permitir consulta de estado de cuenta propio.
5. Permitir consulta de cargos, pagos y saldos propios.
6. Permitir carga o registro de comprobantes de pago según flujo permitido.
7. Permitir reservas de áreas comunales según políticas del tenant.
8. Permitir consulta de multas y apelación básica si aplica.
9. Permitir consulta de comunicados dirigidos al usuario.
10. Permitir consulta de reuniones, asistencia y votaciones autorizadas.
11. Permitir consulta de actas certificadas publicadas para residentes.
12. Permitir consulta y descarga segura de documentos autorizados.
13. Permitir creación y seguimiento de solicitudes de mantenimiento.
14. Permitir gestión básica de visitantes/autorizaciones según políticas.
15. Permitir actualización limitada de perfil propio.
16. Reducir carga operativa administrativa.
17. Mantener privacidad, tenant isolation y property-level authorization.
```

---

## 6. Alcance MVP

### 6.1. Incluido

```text id="rss-scope-in"
- Login OIDC con Keycloak.
- Logout.
- Manejo de sesión.
- Selección de tenant si el usuario pertenece a más de uno.
- Selección de unidad si el usuario está vinculado a más de una.
- Dashboard del residente.
- Consulta de estado de cuenta propio.
- Consulta de cargos propios.
- Consulta de pagos propios.
- Registro/carga de comprobante de pago si el flujo lo permite.
- Consulta de reservas propias.
- Creación/cancelación de reservas según política.
- Consulta de multas propias.
- Apelación básica de multa si la política lo permite.
- Consulta de comunicados dirigidos.
- Marcar comunicados como leídos si el backend lo permite.
- Consulta de reuniones y asistencia propia.
- Participación en votaciones permitidas.
- Consulta de actas publicadas.
- Consulta de documentos permitidos.
- Solicitudes de mantenimiento propias.
- Seguimiento de solicitudes propias.
- Registro básico de visitantes/autorizaciones propias.
- Perfil básico propio.
- Manejo de errores 401/403/404/409/422.
- Estados loading/empty/forbidden/not found.
- Responsive básico para escritorio, tablet y móvil.
```

---

### 6.2. Fuera de alcance MVP

```text id="rss-scope-out"
- App móvil nativa.
- Modo offline.
- PWA avanzada.
- Chat en tiempo real.
- Pasarela de pago completa si no está definida por 018.
- Procesamiento directo de tarjetas.
- Validación administrativa de pagos.
- Conciliación bancaria.
- Contabilidad.
- Administración de usuarios/roles.
- Administración de tenants.
- Gestión administrativa de cargos.
- BI avanzado.
- IA generativa con datos reales.
- OCR automático de comprobantes.
- Apertura de portones.
- Control de hardware.
- Biometría.
- Reconocimiento facial.
- Acceso a datos de otros residentes sin autorización.
```

---

## 7. Decisión funcional MVP

```text id="rss-mvp-decision"
Resident Self-Service Basic será una aplicación frontend privada, separada de WordPress, orientada a residentes y propietarios, que consume APIs REST versionadas de RESIDENT Core, usa Keycloak para autenticación y delega toda autorización, regla financiera, validación de pagos, reserva, multa, documento, visita y mantenimiento al backend.
```

---

## 8. Actores

### 8.1. Resident

Puede:

```text id="rss-actor-resident"
- consultar sus unidades vinculadas;
- consultar su estado de cuenta;
- consultar cargos y pagos propios;
- registrar comprobantes si el flujo lo permite;
- solicitar reservas;
- consultar multas propias;
- leer comunicados;
- crear solicitudes de mantenimiento;
- registrar visitantes según políticas;
- consultar documentos autorizados.
```

No puede:

```text id="rss-actor-resident-cannot"
- ver datos financieros de otros residentes;
- validar pagos;
- crear cargos;
- editar saldos;
- administrar usuarios;
- administrar roles;
- confirmar conciliaciones;
- abrir portones;
- controlar hardware.
```

---

### 8.2. Owner / Propietario

Puede:

```text id="rss-actor-owner"
- consultar unidades de su propiedad;
- consultar estados de cuenta de sus unidades;
- revisar cargos, pagos y multas asociadas;
- descargar documentos permitidos;
- participar en votaciones si es elegible;
- solicitar o aprobar acciones permitidas por política del tenant.
```

---

### 8.3. Occupant / Ocupante autorizado

Puede:

```text id="rss-actor-occupant"
- consultar información limitada de la unidad donde reside;
- crear solicitudes de mantenimiento si está autorizado;
- registrar visitantes si la política lo permite;
- leer comunicados dirigidos;
- reservar áreas si la política lo permite.
```

Limitación:

```text id="rss-actor-occupant-limit"
El ocupante no necesariamente puede ver información financiera completa si el tenant o propietario restringe ese acceso.
```

---

### 8.4. FamilyMember / Usuario vinculado

Puede:

```text id="rss-actor-family-member"
- acceder solo a funcionalidades expresamente autorizadas;
- consultar comunicados o visitas si la política lo permite;
- no acceder a datos financieros salvo permiso explícito.
```

---

## 9. Modelo de autorización funcional

La autorización debe ser:

```text id="rss-authz-model"
tenant-scoped
property-scoped
person-scoped
role-aware
permission-aware
resource-aware
```

Regla:

```text id="rss-authz-rule"
Toda consulta .own debe resolverse server-side mediante UserProfile -> Person -> PropertyUnit -> TenantMembership. El frontend no decide qué unidades pertenecen al usuario.
```

Permisos representativos:

```text id="rss-permissions"
residentPortal.access
residentDashboard.readOwn
residentProperties.readOwn
residentAccountStatements.readOwn
residentCharges.readOwn
residentPayments.readOwn
residentPayments.submitOwn
residentPaymentReceipts.uploadOwn
residentReservations.readOwn
residentReservations.createOwn
residentReservations.cancelOwn
residentFines.readOwn
residentFines.appealOwn
residentCommunications.readOwn
residentCommunications.markReadOwn
residentMeetings.readOwn
residentAttendance.readOwn
residentVoting.participateOwn
residentMinutes.readPublishedOwn
residentDocuments.readOwn
residentMaintenanceRequests.readOwn
residentMaintenanceRequests.createOwn
residentVisitors.readOwn
residentVisitors.createOwn
residentProfile.readOwn
residentProfile.updateOwnLimited
```

---

## 10. Módulos funcionales de UI MVP

### 10.1. Auth and Session

```text id="rss-ui-auth"
- login;
- logout;
- callback OIDC;
- sesión expirada;
- usuario sin tenants;
- usuario sin unidades;
- usuario sin permisos de portal residente.
```

---

### 10.2. Tenant and Unit Selector

```text id="rss-ui-selector"
- listar tenants autorizados;
- seleccionar tenant activo;
- listar unidades vinculadas al usuario;
- seleccionar unidad activa;
- limpiar cache al cambiar tenant o unidad;
- impedir selección manual no autorizada.
```

---

### 10.3. Resident Dashboard

```text id="rss-ui-dashboard"
- resumen de saldo propio;
- próximos vencimientos;
- pagos recientes;
- reservas próximas;
- multas pendientes;
- comunicados no leídos;
- solicitudes de mantenimiento abiertas;
- accesos/visitantes activos si aplica.
```

Regla:

```text id="rss-ui-dashboard-rule"
El dashboard muestra datos derivados del Core. No calcula saldos finales ni estados financieros por cuenta propia.
```

---

### 10.4. Account Statements

```text id="rss-ui-account-statements"
- consultar estado de cuenta de unidad propia;
- filtrar por periodo;
- ver cargos;
- ver pagos aplicados;
- ver saldo;
- descargar estado si el API lo permite;
- no modificar cargos ni pagos.
```

---

### 10.5. Payments

```text id="rss-ui-payments"
- listar pagos propios;
- ver estado del pago;
- registrar intención o comprobante de pago según flujo;
- subir comprobante mediante Secure Document Storage;
- consultar historial de validación;
- recibir rechazo o aprobación administrativa.
```

Prohibido:

```text id="rss-ui-payments-forbidden"
- validar pago propio como administrador;
- procesar tarjetas directamente;
- reversar pagos;
- modificar saldo;
- crear asiento contable.
```

---

### 10.6. Reservations

```text id="rss-ui-reservations"
- listar áreas comunales disponibles;
- consultar disponibilidad;
- crear reserva propia;
- cancelar reserva propia según política;
- consultar estado de aprobación;
- ver cargos asociados si existen.
```

---

### 10.7. Fines and Sanctions

```text id="rss-ui-fines"
- consultar multas propias;
- ver estado;
- ver evidencia permitida;
- apelar multa si política lo permite;
- consultar resolución.
```

---

### 10.8. Communications

```text id="rss-ui-communications"
- listar comunicados dirigidos al usuario/unidad;
- ver comunicado;
- marcar como leído si aplica;
- filtrar por fecha/categoría/prioridad;
- no ver comunicados de audiencias no autorizadas.
```

---

### 10.9. Meetings, Voting and Minutes

```text id="rss-ui-governance"
- consultar reuniones convocadas;
- confirmar asistencia si aplica;
- consultar quorum informativo si está publicado;
- participar en votaciones donde sea elegible;
- consultar actas publicadas;
- descargar actas permitidas por Secure Document Storage.
```

---

### 10.10. Secure Documents

```text id="rss-ui-documents"
- listar documentos autorizados;
- ver metadata permitida;
- descargar mediante flujo seguro;
- no exponer storageKey;
- no guardar signedUrl persistente.
```

---

### 10.11. Maintenance Requests

```text id="rss-ui-maintenance"
- crear solicitud de mantenimiento propia;
- adjuntar evidencia permitida;
- consultar estado;
- agregar comentario si el flujo lo permite;
- cerrar o confirmar atención si la política lo permite.
```

---

### 10.12. Visitors and Access

```text id="rss-ui-visitors"
- registrar visitante autorizado;
- consultar visitantes próximos;
- cancelar autorización si aplica;
- consultar historial propio limitado;
- registrar datos mínimos del visitante según política.
```

Prohibido:

```text id="rss-ui-visitors-forbidden"
- abrir portón;
- controlar dispositivo físico;
- usar biometría;
- reconocimiento facial;
- ver visitantes de otras unidades.
```

---

### 10.13. Profile

```text id="rss-ui-profile"
- ver perfil propio;
- actualizar datos permitidos;
- actualizar preferencias de notificación si aplica;
- no modificar roles;
- no modificar membresías;
- no modificar relación con unidades.
```

---

## 11. Navegación MVP

```text id="rss-navigation"
/resident
├── /login
├── /auth/callback
├── /select-context
├── /forbidden
└── /app
    ├── /dashboard
    ├── /account-statement
    ├── /charges
    ├── /payments
    ├── /reservations
    ├── /fines
    ├── /communications
    ├── /meetings
    ├── /voting
    ├── /minutes
    ├── /documents
    ├── /maintenance
    ├── /visitors
    └── /profile
```

Regla:

```text id="rss-navigation-rule"
Las rutas deben mostrarse según permisos efectivos, tenant activo y unidad activa. Ocultar ruta no reemplaza autorización backend.
```

---

## 12. Relación con WordPress

Permitido:

```text id="rss-wordpress-allowed"
- WordPress puede mostrar botón Entra al portal del residente.
- WordPress puede enlazar al portal privado.
- WordPress puede mostrar información pública del conjunto.
```

Prohibido:

```text id="rss-wordpress-forbidden"
- usar sesión WordPress para autenticar Core;
- mostrar estados de cuenta en páginas públicas;
- publicar comprobantes;
- publicar saldos;
- exponer documentos privados;
- registrar visitantes desde formularios públicos WordPress;
- cargar pagos desde WordPress público;
- usar WordPress como proxy transaccional sin autorización.
```

---

## 13. Integración con Keycloak

Requerimientos:

```text id="rss-keycloak"
- Authorization Code Flow with PKCE.
- No implicit flow.
- Login seguro.
- Logout global.
- Manejo de sesión expirada.
- No tokens en query params.
- No tokens en console.
- No sesión WordPress.
```

Regla:

```text id="rss-keycloak-rule"
Keycloak autentica identidad. RESIDENT Core resuelve tenants, unidades, roles, permisos y recursos .own.
```

---

## 14. Integración con RESIDENT Core API

Principios:

```text id="rss-api-principles"
- Consumir solo /api/v1.
- Usar OpenAPI Client cuando sea viable.
- Usar Bearer token o BFF seguro.
- No enviar tenantId editable.
- No enviar propertyUnitId editable como autoridad final.
- No enviar actor fields.
- No mostrar storageKey.
- Manejar 401, 403, 404, 409 y 422.
- Mostrar traceId en errores.
```

Regla:

```text id="rss-api-rule"
El frontend puede enviar filtros o selección de unidad autorizada, pero el backend debe validar que la unidad pertenece al usuario y al tenant actual.
```

---

## 15. Reglas de negocio de UI

```text id="rss-business-rules"
BR-001 El residente solo accede a información propia.
BR-002 El propietario solo accede a unidades asociadas a su relación vigente.
BR-003 El ocupante puede tener acceso financiero limitado.
BR-004 La UI no calcula saldos finales.
BR-005 La UI no valida pagos.
BR-006 La UI no crea cargos.
BR-007 La UI no modifica multas administrativamente.
BR-008 La UI no aprueba reservas administrativamente.
BR-009 La UI no crea ni modifica roles.
BR-010 La UI no abre portones.
BR-011 La UI no accede a storageKey.
BR-012 La UI no usa WordPress auth.
BR-013 La UI limpia cache al cambiar tenant o unidad.
BR-014 Toda acción crítica requiere confirmación.
BR-015 Todo 404 tenant/property-scoped no revela existencia de recurso ajeno.
```

---

## 16. Requerimientos funcionales

### 16.1. Auth

```text id="rss-fr-auth"
FR-001 La app debe permitir login OIDC.
FR-002 La app debe manejar callback OIDC.
FR-003 La app debe permitir logout.
FR-004 La app debe detectar sesión expirada.
FR-005 La app debe redirigir usuario no autenticado a login.
```

---

### 16.2. Tenant y unidad

```text id="rss-fr-context"
FR-006 La app debe listar tenants autorizados.
FR-007 La app debe permitir seleccionar tenant.
FR-008 La app debe listar unidades vinculadas al usuario.
FR-009 La app debe permitir seleccionar unidad activa.
FR-010 La app debe limpiar cache al cambiar tenant o unidad.
FR-011 La app debe manejar usuario sin unidades.
```

---

### 16.3. Dashboard residente

```text id="rss-fr-dashboard"
FR-012 La app debe mostrar resumen del residente.
FR-013 La app debe mostrar saldo propio.
FR-014 La app debe mostrar próximos vencimientos.
FR-015 La app debe mostrar comunicados no leídos.
FR-016 La app debe mostrar reservas y solicitudes relevantes.
```

---

### 16.4. Finanzas propias

```text id="rss-fr-financial"
FR-017 La app debe mostrar cargos propios.
FR-018 La app debe mostrar pagos propios.
FR-019 La app debe mostrar estado de cuenta propio.
FR-020 La app debe permitir cargar comprobante si el flujo lo permite.
FR-021 La app debe mostrar estado de validación del pago.
```

---

### 16.5. Operaciones propias

```text id="rss-fr-operations"
FR-022 La app debe permitir crear reservas propias.
FR-023 La app debe permitir cancelar reservas propias según política.
FR-024 La app debe mostrar multas propias.
FR-025 La app debe permitir apelar multa propia si aplica.
FR-026 La app debe mostrar comunicados dirigidos.
FR-027 La app debe permitir crear solicitudes de mantenimiento.
FR-028 La app debe permitir consultar solicitudes propias.
FR-029 La app debe permitir registrar visitantes propios si aplica.
```

---

### 16.6. Gobernanza y documentos

```text id="rss-fr-governance-documents"
FR-030 La app debe mostrar reuniones convocadas.
FR-031 La app debe permitir confirmar asistencia si aplica.
FR-032 La app debe permitir votar si el usuario es elegible.
FR-033 La app debe mostrar actas publicadas.
FR-034 La app debe mostrar documentos autorizados.
FR-035 La app debe descargar documentos mediante flujo seguro.
```

---

### 16.7. Perfil

```text id="rss-fr-profile"
FR-036 La app debe mostrar perfil propio.
FR-037 La app debe permitir actualización limitada de datos propios.
FR-038 La app no debe permitir modificar roles.
FR-039 La app no debe permitir modificar relación con unidades.
```

---

## 17. Requerimientos no funcionales

### 17.1. Seguridad

```text id="rss-nfr-security"
NFR-001 No usar sesión WordPress.
NFR-002 No exponer storageKey.
NFR-003 No guardar signedUrl persistente.
NFR-004 No incluir tokens en URL.
NFR-005 No registrar datos sensibles en console.
NFR-006 No usar Prisma en frontend.
NFR-007 No acceder directo a base de datos.
NFR-008 No usar IA externa con datos reales.
```

---

### 17.2. Privacidad

```text id="rss-nfr-privacy"
NFR-009 Minimizar datos personales.
NFR-010 Enmascarar datos si el backend los devuelve enmascarados.
NFR-011 No mostrar datos de otras unidades.
NFR-012 No guardar payloads financieros en almacenamiento persistente.
NFR-013 No incluir datos sensibles en URLs.
```

---

### 17.3. Performance

```text id="rss-nfr-performance"
NFR-014 First load p95 < 3 s en ambiente objetivo.
NFR-015 Navegación interna p95 < 1 s con cache.
NFR-016 Tablas/listas deben paginarse server-side.
NFR-017 No cargar historial completo masivo.
NFR-018 Lazy loading por módulo.
```

---

### 17.4. Usabilidad

```text id="rss-nfr-usability"
NFR-019 Interfaz usable en móvil, tablet y escritorio.
NFR-020 Estados vacíos deben ser claros.
NFR-021 Errores deben mostrar mensaje entendible.
NFR-022 Acciones críticas deben pedir confirmación.
NFR-023 Formularios deben mostrar errores por campo.
```

---

## 18. Feature flags

```text id="rss-feature-flags"
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

```text id="rss-feature-rule"
El build o runtime debe fallar si se habilita modo público, auth WordPress, display de storageKey, IA externa con datos reales, control de hardware, acciones administrativas de pago, contabilidad o conciliación bancaria.
```

---

## 19. Rutas prohibidas

No implementar:

```text id="rss-routes-forbidden"
/public/resident/account-statement
/public/resident/payments
/public/resident/documents
/public/resident/visitors
/wp/resident-private
/wp-admin/resident-self-service
/embed/resident-dashboard
```

---

## 20. Riesgos

| Riesgo                              |   Nivel | Mitigación                                      |
| ----------------------------------- | ------: | ----------------------------------------------- |
| Residente ve datos de otra unidad   | Crítico | property-scoped authorization backend           |
| Cache muestra unidad anterior       |    Alto | query keys con tenant + unit + clear cache      |
| storageKey visible                  | Crítico | SecureDocumentLink con secureDocumentId         |
| Pago propio se valida indebidamente | Crítico | no admin payment actions                        |
| WordPress expone datos privados     | Crítico | no WordPress auth/no public transactional pages |
| Datos sensibles en URL              |    Alto | usar body/filtros seguros                       |
| Usuario no propietario vota         |    Alto | eligibility backend                             |
| Visitante de otra unidad visible    |    Alto | .own access policies                            |
| XSS en comunicados                  |    Alto | sanitización/escaping/CSP                       |
| Tokens expuestos                    |    Alto | OIDC seguro/BFF recomendado                     |

---

## 21. Auditoría

La app no genera auditoría formal directamente. El Core audita las acciones.

La app debe:

```text id="rss-audit-ui"
- enviar reason cuando el endpoint lo exija;
- no enviar actor fields;
- no falsificar timestamps;
- mostrar traceId en errores;
- no ocultar errores críticos del backend;
- mostrar estado final de acciones críticas.
```

Eventos auditables esperados en Core:

```text id="rss-audit-events"
residentPayment.submitted
residentPaymentReceipt.uploaded
residentReservation.created
residentReservation.cancelled
residentFine.appealSubmitted
residentCommunication.read
residentMeeting.attendanceConfirmed
residentVote.submitted
residentDocument.accessed
residentMaintenanceRequest.created
residentVisitorAuthorization.created
residentProfile.updated
```

---

## 22. Observabilidad frontend

Eventos permitidos:

```text id="rss-observability-events"
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

```text id="rss-observability-forbidden"
- tokens;
- passwords;
- authorization headers;
- cookies;
- storageKey;
- signedUrl;
- identificaciones completas;
- placas completas;
- comprobantes;
- estados de cuenta completos;
- payloads financieros raw;
- datos cross-tenant;
- datos de otras unidades.
```

---

## 23. API preliminar consumida

La app consumirá APIs oficiales de:

```text id="rss-api-consumed"
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
016-secure-document-storage
022-maintenance-work-orders
024-access-control-visitors
025-tenant-settings-policies
```

También puede consumir vistas `.own` o endpoints self-service que el Core exponga de forma explícita:

```text id="rss-self-service-endpoints-conceptual"
GET /api/v1/me
GET /api/v1/me/tenants
GET /api/v1/me/tenants/{tenantSlug}/properties
GET /api/v1/resident/dashboard
GET /api/v1/resident/account-statement
GET /api/v1/resident/charges
GET /api/v1/resident/payments
POST /api/v1/resident/payments
GET /api/v1/resident/reservations
POST /api/v1/resident/reservations
GET /api/v1/resident/fines
POST /api/v1/resident/fines/{fineId}/appeals
GET /api/v1/resident/communications
GET /api/v1/resident/documents
GET /api/v1/resident/maintenance-requests
POST /api/v1/resident/maintenance-requests
GET /api/v1/resident/visitors
POST /api/v1/resident/visitors
```

Regla:

```text id="rss-api-consumed-rule"
Si un endpoint self-service no existe en OpenAPI, no debe inventarse en frontend. Debe registrarse gap técnico o definirse en el api-contract.md del paquete 030.
```

---

## 24. Criterios de aceptación

```text id="rss-acceptance"
[ ] La app permite login con Keycloak.
[ ] La app permite logout.
[ ] La app lista tenants autorizados.
[ ] La app lista unidades vinculadas al usuario.
[ ] La app permite seleccionar unidad activa.
[ ] La app limpia cache al cambiar tenant o unidad.
[ ] La app muestra dashboard residente.
[ ] La app muestra estado de cuenta propio.
[ ] La app muestra cargos y pagos propios.
[ ] La app permite cargar comprobante si el flujo lo permite.
[ ] La app muestra reservas propias.
[ ] La app permite crear/cancelar reservas propias según política.
[ ] La app muestra multas propias.
[ ] La app permite apelar multa propia si aplica.
[ ] La app muestra comunicados dirigidos.
[ ] La app permite ver reuniones/votaciones autorizadas.
[ ] La app muestra documentos autorizados.
[ ] La app permite solicitudes de mantenimiento propias.
[ ] La app permite visitantes propios si aplica.
[ ] La app no muestra datos de otras unidades.
[ ] La app no muestra storageKey.
[ ] La app no usa sesión WordPress.
[ ] La app no tiene rutas públicas transaccionales.
[ ] La app no valida pagos administrativamente.
[ ] La app no crea asientos contables.
[ ] La app no controla hardware.
[ ] La app no usa IA externa con datos reales.
```

---

## 25. No aceptación

No se acepta el módulo si:

```text id="rss-no-acceptance"
- usa sesión WordPress como autenticación;
- expone estados de cuenta en rutas públicas;
- permite acceder a datos de otro tenant;
- permite acceder a datos de otra unidad sin autorización;
- permite seleccionar tenant no autorizado;
- permite seleccionar unidad no vinculada;
- mantiene cache de tenant o unidad anterior;
- muestra storageKey;
- guarda signedUrl persistente;
- registra tokens en console;
- incluye tokens o datos sensibles en URL;
- llama directamente a PostgreSQL;
- usa Prisma en frontend;
- calcula saldos finales en UI;
- valida pagos como administrador;
- crea cargos desde self-service;
- modifica saldos;
- crea JournalEntry directo;
- confirma conciliación bancaria;
- abre portones;
- controla hardware;
- usa biometría;
- usa reconocimiento facial;
- usa IA externa con datos reales;
- permite ver visitantes, documentos, multas o pagos de otra unidad;
- ignora errores 403/404/422 del backend.
```

---

## 26. Resultado esperado

Al implementar `030-resident-self-service-basic`, RESIDENT contará con un portal privado para residentes y propietarios, reduciendo carga operativa administrativa y permitiendo autoservicio seguro sobre información propia.

Resultado esperado:

```text id="rss-expected-result"
resident self-service definido
login Keycloak definido
tenant selector definido
unit selector definido
dashboard residente definido
estado de cuenta propio definido
pagos propios definidos
reservas propias definidas
multas propias definidas
comunicados dirigidos definidos
reuniones/votaciones autorizadas definidas
documentos seguros definidos
mantenimiento propio definido
visitantes propios definidos
perfil propio definido
property-scoped authorization requerido
no WordPress auth
no public transactional routes
no storageKey exposure
no admin payment validation
no accounting actions
no hardware control
no external AI with real data
```

---

## 27. Expediente actualizado

```text id="rss-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 029-admin-web-app-basic/
│   │   └── 030-resident-self-service-basic/
│   │       └── spec.md
```
