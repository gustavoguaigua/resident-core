# Test Plan — 030 Resident Self-Service Basic

## 1. Información del documento

| Campo          | Valor                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                               |
| Spec ID        | 030                                                                                                         |
| Módulo         | Resident Self-Service Basic                                                                                 |
| Documento      | Test Plan                                                                                                   |
| Ruta           | `docs/specs/030-resident-self-service-basic/test-plan.md`                                                   |
| Versión        | 0.1                                                                                                         |
| Estado         | Borrador inicial                                                                                            |
| Fecha          | 2026-08-04                                                                                                  |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC   |
| Naturaleza     | Resident-facing / Tenant-scoped / Property-scoped / Permission-aware / API-first / Non-public transactional |

---

## 2. Propósito

Definir las pruebas necesarias para validar que `030-resident-self-service-basic` funcione como un portal privado, seguro y property-scoped para residentes, propietarios y ocupantes autorizados.

Regla central de pruebas:

```text id="rss-test-rule"
Resident Self-Service Basic solo puede aceptarse si las pruebas demuestran autenticación segura con Keycloak, selección controlada de tenant y unidad, autorización .own, cache aislada por tenant y unidad, consumo exclusivo de APIs oficiales, ausencia de datos cross-tenant, ausencia de datos de otras unidades, ausencia de storageKey, ausencia de sesión WordPress, ausencia de rutas públicas transaccionales, ausencia de acceso directo a base de datos, ausencia de Prisma en frontend, ausencia de validación administrativa de pagos, ausencia de acciones contables, ausencia de control de hardware y ausencia de IA externa con datos reales.
```

---

## 3. Alcance de pruebas

Incluido:

```text id="rss-test-scope-in"
- Login OIDC.
- Logout.
- Callback OIDC.
- Session handling.
- Tenant selector.
- Property unit selector.
- Resident context.
- PermissionProvider.
- PropertyScopeGuard.
- Route guards.
- Resident dashboard.
- Account statement own.
- Charges own.
- Payments own.
- Payment receipt upload.
- Reservations own.
- Fines own.
- Fine appeal.
- Communications targeted.
- Meetings and attendance own.
- Voting eligibility.
- Published minutes.
- Secure documents own.
- Maintenance requests own.
- Visitor authorizations own.
- Profile own limited.
- Error handling.
- Cache isolation.
- Security tests.
- E2E critical flows.
- Accessibility baseline.
- Performance baseline.
- CI gates.
```

Fuera de alcance:

```text id="rss-test-scope-out"
- Pruebas internas de reglas de negocio backend.
- Pruebas directas de PostgreSQL.
- Pruebas directas de Prisma.
- Pruebas de Keycloak Admin API.
- Pruebas de WordPress como backend transaccional.
- Pruebas de app móvil nativa.
- Pruebas de control físico de hardware.
- Pruebas de biometría.
- Pruebas de reconocimiento facial.
- Pruebas de IA externa con datos reales.
```

---

## 4. Tipos de pruebas

```text id="rss-test-types"
1. Unit tests.
2. Component tests.
3. Hook tests.
4. Form schema tests.
5. API client tests.
6. OpenAPI contract tests.
7. Tenant context tests.
8. Property scope tests.
9. Permission tests.
10. Security tests.
11. E2E tests.
12. Accessibility tests.
13. Performance baseline tests.
14. CI gate tests.
```

---

## 5. Datos mínimos de prueba

### 5.1. Tenants

```text id="rss-test-tenants"
tenantA = San José La Salle 2
tenantB = Altos del Norte
```

Regla:

```text id="rss-test-tenant-rule"
La app nunca debe mostrar datos de tenantA cuando el contexto activo sea tenantB, ni viceversa.
```

---

### 5.2. Unidades

```text id="rss-test-property-units"
tenantA.unit101 = Casa 101
tenantA.unit102 = Casa 102
tenantB.unit201 = Departamento 201
```

Relaciones:

```text id="rss-test-property-relations"
residentA -> tenantA.unit101 como resident
ownerA -> tenantA.unit101 y tenantA.unit102 como owner
occupantA -> tenantA.unit102 como occupant con financialAccessLevel=limited
residentB -> tenantB.unit201 como resident
unlinkedUser -> sin unidades vinculadas
```

---

### 5.3. Usuarios

```text id="rss-test-users"
residentA
ownerA
occupantA
familyMemberA
residentB
tenantAdminA
anonymousUser
unlinkedUser
blockedUser
```

Reglas:

```text id="rss-test-user-rules"
- residentA solo accede a unit101.
- ownerA accede a unit101 y unit102.
- occupantA tiene acceso financiero limitado.
- residentB solo accede a tenantB.unit201.
- tenantAdminA no usa este portal para acciones administrativas.
- anonymousUser debe ir a login.
- unlinkedUser debe ver estado sin unidades.
- blockedUser no debe acceder.
```

---

### 5.4. Permisos representativos

```text id="rss-test-permissions"
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

## 6. Unit tests

### 6.1. Auth helpers

```text id="rss-unit-auth"
[ ] Detecta sesión loading.
[ ] Detecta sesión authenticated.
[ ] Detecta sesión unauthenticated.
[ ] Detecta sesión expired.
[ ] Usuario anónimo se redirige a login.
[ ] Logout limpia sesión.
[ ] Logout limpia tenant activo.
[ ] Logout limpia unidad activa.
[ ] Logout limpia permisos.
[ ] Logout limpia cache.
[ ] No imprime tokens en console.
[ ] No coloca tokens en URL.
[ ] No usa sesión WordPress.
```

---

### 6.2. Tenant helpers

```text id="rss-unit-tenant"
[ ] Lista solo tenants con membership active.
[ ] Rechaza tenant inactive.
[ ] Rechaza tenant suspended.
[ ] Rechaza tenant no perteneciente al usuario.
[ ] Rechaza tenant con residentPortalEnabled=false.
[ ] Cambio de tenant limpia unidad activa.
[ ] Cambio de tenant invalida query cache.
[ ] Query key incluye tenant.
```

---

### 6.3. Property unit helpers

```text id="rss-unit-property"
[ ] Lista solo unidades vinculadas activas.
[ ] Rechaza unidad inactive.
[ ] Rechaza unidad ended.
[ ] Rechaza unidad suspended.
[ ] Rechaza unidad no vinculada.
[ ] Cambio de unidad invalida queries property-scoped.
[ ] selectedUnit se limpia al cambiar tenant.
[ ] Query key property-scoped incluye unidad.
[ ] financialAccessLevel=none oculta datos financieros.
[ ] financialAccessLevel=limited oculta detalles restringidos.
```

---

### 6.4. Permission helpers

```text id="rss-unit-permissions"
[ ] hasPermission retorna true si existe permiso.
[ ] hasPermission retorna false si no existe permiso.
[ ] hasAnyPermission valida permisos alternativos.
[ ] hasAllPermissions valida permisos acumulados.
[ ] Permisos vacíos bloquean rutas privadas.
[ ] residentPortal.access es obligatorio para entrar.
[ ] PermissionHash se usa en cache sensible.
```

---

### 6.5. Error normalizer

```text id="rss-unit-errors"
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
[ ] 404 cross-property no revela existencia del recurso.
```

---

## 7. Component tests

### 7.1. ResidentAppShell

```text id="rss-component-shell"
[ ] Renderiza header.
[ ] Renderiza navegación responsive.
[ ] Renderiza BottomNavigation en móvil si aplica.
[ ] Muestra tenant actual.
[ ] Muestra unidad activa.
[ ] Muestra usuario.
[ ] Muestra LoadingState.
[ ] Muestra EmptyState.
[ ] Muestra ForbiddenState.
[ ] Muestra NotFoundState.
[ ] Muestra ApiErrorState con traceId.
```

---

### 7.2. TenantSwitcher

```text id="rss-component-tenant-switcher"
[ ] Muestra tenants autorizados.
[ ] No muestra tenants inactivos.
[ ] No muestra tenants suspendidos.
[ ] No muestra tenants sin residentPortalEnabled.
[ ] Cambia tenant correctamente.
[ ] Limpia unidad activa al cambiar tenant.
[ ] Dispara invalidación de cache.
[ ] Bloquea tenant no autorizado.
```

---

### 7.3. PropertyUnitSwitcher

```text id="rss-component-property-switcher"
[ ] Muestra unidades vinculadas.
[ ] No muestra unidades inactivas.
[ ] No muestra unidades no vinculadas.
[ ] Cambia unidad correctamente.
[ ] Dispara invalidación de cache property-scoped.
[ ] Muestra relación owner/resident/occupant si aplica.
[ ] Muestra estado sin unidades.
```

---

### 7.4. ResidentPermissionGate

```text id="rss-component-permission-gate"
[ ] Renderiza contenido con permiso.
[ ] Oculta contenido sin permiso.
[ ] Soporta any permission.
[ ] Soporta all permissions.
[ ] Bloquea rutas sin residentPortal.access.
[ ] No reemplaza validación backend.
```

---

### 7.5. PropertyScopeGuard

```text id="rss-component-property-scope-guard"
[ ] Permite vista si hay unidad activa requerida.
[ ] Redirige a select-context si no hay unidad activa.
[ ] Bloquea recurso no vinculado.
[ ] No acepta propertyUnitId manual como autoridad final.
```

---

### 7.6. SecureDocumentLink

```text id="rss-component-secure-document-link"
[ ] Renderiza nombre permitido.
[ ] Usa secureDocumentId.
[ ] No renderiza storageKey.
[ ] No guarda signedUrl persistente.
[ ] Llama endpoint seguro de documentos.
[ ] Maneja 403.
[ ] Maneja 404.
```

---

### 7.7. MoneyDisplay

```text id="rss-component-money-display"
[ ] Muestra montos como string decimal.
[ ] Muestra moneda.
[ ] No recalcula saldos.
[ ] Respeta valores devueltos por API.
```

---

### 7.8. ConfirmDialog

```text id="rss-component-confirm-dialog"
[ ] Se muestra antes de acción crítica.
[ ] Requiere confirmación explícita.
[ ] Permite reason si endpoint lo exige.
[ ] Bloquea doble submit.
[ ] Muestra error con traceId si falla.
```

---

## 8. Form schema tests

### 8.1. Campos prohibidos comunes

```text id="rss-form-common-forbidden-tests"
[ ] Formularios rechazan tenantId editable.
[ ] Formularios rechazan createdBy.
[ ] Formularios rechazan updatedBy.
[ ] Formularios rechazan approvedBy.
[ ] Formularios rechazan executedBy.
[ ] Formularios rechazan status directo indebido.
[ ] Formularios rechazan storageKey.
[ ] Formularios rechazan signedUrl.
[ ] Formularios rechazan rawSql.
[ ] Formularios rechazan script.
[ ] Formularios rechazan formulaCode.
[ ] Formularios rechazan token.
[ ] Formularios rechazan secret.
[ ] Formularios rechazan apiKey.
```

---

### 8.2. SubmitPaymentReceiptForm

```text id="rss-form-payment-tests"
[ ] Valida amount requerido.
[ ] Valida amount como string decimal.
[ ] Valida paymentDate.
[ ] Valida method permitido.
[ ] Acepta secureDocumentId.
[ ] Rechaza storageKey.
[ ] Rechaza approvedBy.
[ ] Rechaza accountingEntryId.
[ ] Rechaza bankReconciliationId.
```

---

### 8.3. CreateReservationForm

```text id="rss-form-reservation-tests"
[ ] Valida commonAreaId requerido.
[ ] Valida startsAt.
[ ] Valida endsAt.
[ ] Rechaza rango inválido.
[ ] Rechaza guestsCount negativo.
[ ] No calcula cargos finales.
[ ] Backend valida disponibilidad real.
```

---

### 8.4. AppealFineForm

```text id="rss-form-fine-appeal-tests"
[ ] Valida reason requerido.
[ ] Valida longitud máxima.
[ ] Acepta evidenceSecureDocumentIds.
[ ] Rechaza storageKey.
[ ] No permite resolver apelación.
```

---

### 8.5. CreateMaintenanceRequestForm

```text id="rss-form-maintenance-tests"
[ ] Valida title requerido.
[ ] Valida description requerido.
[ ] Valida category permitida.
[ ] Valida priority permitida.
[ ] Acepta attachmentSecureDocumentIds.
[ ] Rechaza storageKey.
```

---

### 8.6. CreateVisitorAuthorizationForm

```text id="rss-form-visitor-tests"
[ ] Valida visitorDisplayName requerido.
[ ] Valida visitDate.
[ ] Valida validFrom/validTo si existen.
[ ] Rechaza biometricData.
[ ] Rechaza faceImage.
[ ] Rechaza hardwareCommand.
[ ] Rechaza gateOpenCommand.
```

---

### 8.7. UpdateResidentProfileForm

```text id="rss-form-profile-tests"
[ ] Permite displayName si API lo permite.
[ ] Permite phone si API lo permite.
[ ] Permite preferencias de notificación.
[ ] Rechaza roles.
[ ] Rechaza permissions.
[ ] Rechaza memberships.
[ ] Rechaza tenantId.
[ ] Rechaza propertyUnitId.
[ ] Rechaza keycloakSubjectId.
```

---

## 9. API client tests

```text id="rss-api-client-tests"
[ ] API client usa baseURL configurable.
[ ] API client inyecta Authorization cuando aplica.
[ ] API client inyecta tenant context según convención aprobada.
[ ] API client inyecta property context solo como selector, no como autoridad final.
[ ] API client normaliza response envelope.
[ ] API client normaliza error envelope.
[ ] API client conserva traceId.
[ ] API client no llama endpoints no documentados.
[ ] API client no llama endpoints administrativos para self-service.
[ ] API client no llama rutas públicas transaccionales.
[ ] API client no llama WordPress como backend transaccional.
[ ] API client no expone tokens en logs.
[ ] API client no expone storageKey.
```

---

## 10. OpenAPI contract tests

```text id="rss-openapi-tests"
[ ] OpenAPI está disponible en CI.
[ ] Cliente API se genera sin errores.
[ ] Build falla si cambia contrato incompatible.
[ ] Build falla si se consume endpoint no documentado.
[ ] Endpoints .own están documentados.
[ ] OpenAPI no expone storageKey en DTOs externos.
[ ] OpenAPI no expone signedUrl persistente.
[ ] OpenAPI no expone rawSql en DTOs externos.
[ ] OpenAPI no expone script en DTOs externos.
[ ] OpenAPI no expone tenantId editable en DTOs externos.
[ ] OpenAPI no expone actor fields en DTOs externos.
[ ] OpenAPI incluye x-auth-required en endpoints resident-facing.
[ ] OpenAPI incluye x-tenant-scope en endpoints tenant.
[ ] OpenAPI incluye x-property-scope en endpoints .own cuando aplique.
[ ] OpenAPI incluye x-public-exposure=false.
[ ] OpenAPI incluye x-wordpress-access=false.
```

---

## 11. Security tests

### 11.1. Auth security

```text id="rss-security-auth"
[ ] Usuario anónimo se redirige a login.
[ ] Usuario autenticado con residentPortal.access accede.
[ ] Usuario sin residentPortal.access ve ForbiddenState.
[ ] Sesión expirada redirige a login.
[ ] Logout borra sesión local.
[ ] Logout borra tenant activo.
[ ] Logout borra unidad activa.
[ ] Logout borra cache.
[ ] No se imprimen tokens.
[ ] No se guardan tokens en URL.
[ ] No se usa sesión WordPress.
```

---

### 11.2. Tenant isolation frontend

```text id="rss-security-tenant"
[ ] tenantA no muestra datos de tenantB.
[ ] Cambio tenantA -> tenantB limpia cache.
[ ] Cambio de tenant limpia unidad activa.
[ ] Query key incluye tenant.
[ ] Formularios abiertos se invalidan al cambiar tenant.
[ ] 404 cross-tenant no revela existencia del recurso.
```

---

### 11.3. Property scope security

```text id="rss-security-property"
[ ] residentA ve solo unit101.
[ ] residentA no ve unit102 si no está vinculado.
[ ] ownerA ve unit101 y unit102.
[ ] occupantA ve unit102 con acceso financiero limitado.
[ ] residentB no ve unidades de tenantA.
[ ] Cambio unit101 -> unit102 limpia cache property-scoped.
[ ] propertyUnitId manipulado no permite acceder a otra unidad.
[ ] 404 cross-property no revela existencia del recurso.
```

---

### 11.4. Permission security

```text id="rss-security-permission"
[ ] Menú oculta rutas sin permiso.
[ ] Ruta sin permiso muestra ForbiddenState.
[ ] Acción sin permiso no se renderiza.
[ ] Error 403 backend se respeta aunque el botón haya sido visible.
[ ] financialAccessLevel=none oculta account statement, charges y payments.
[ ] occupant con acceso limitado no ve información restringida.
```

---

### 11.5. Forbidden data exposure

```text id="rss-security-forbidden-data"
[ ] UI no muestra storageKey.
[ ] UI no muestra signedUrl persistente.
[ ] UI no muestra authorization header.
[ ] UI no muestra token.
[ ] UI no registra estado de cuenta completo.
[ ] UI no registra payload financiero raw.
[ ] UI no registra identificación completa.
[ ] UI no registra placa completa.
[ ] UI no guarda comprobantes en almacenamiento persistente.
[ ] UI no guarda documentos en almacenamiento persistente.
[ ] UI no muestra datos de otras unidades.
```

---

### 11.6. No prohibited architecture

```text id="rss-security-architecture"
[ ] No existe Prisma en frontend.
[ ] No existe conexión PostgreSQL en frontend.
[ ] No existe conexión Redis en frontend.
[ ] No existe Keycloak Admin API en frontend.
[ ] No existe WordPress auth en Resident Self-Service.
[ ] No existen rutas públicas transaccionales.
[ ] No existe validación administrativa de pagos.
[ ] No existe creación de cargos desde self-service.
[ ] No existe creación de JournalEntry.
[ ] No existe confirmación de conciliación.
[ ] No existe función de apertura de portones.
[ ] No existe control de hardware.
[ ] No existe biometría.
[ ] No existe reconocimiento facial.
[ ] No existe integración IA externa con datos reales.
```

---

## 12. E2E tests

### 12.1. Login, tenant and unit selection

```text id="rss-e2e-login-context"
[ ] Usuario abre /resident/app/dashboard sin sesión.
[ ] App redirige a /resident/login.
[ ] Usuario completa login mock/OIDC test.
[ ] App obtiene perfil.
[ ] App obtiene tenants autorizados.
[ ] Usuario selecciona tenantA.
[ ] App obtiene unidades vinculadas.
[ ] Usuario selecciona unit101.
[ ] App muestra dashboard de unit101.
[ ] Usuario cambia a unit102 si está autorizado.
[ ] App limpia cache y muestra contexto unit102.
```

---

### 12.2. Usuario sin unidades

```text id="rss-e2e-no-units"
[ ] unlinkedUser inicia sesión.
[ ] App obtiene tenants.
[ ] App no obtiene unidades activas.
[ ] App muestra estado sin unidades.
[ ] App no permite acceder a dashboard property-scoped.
```

---

### 12.3. Dashboard residente

```text id="rss-e2e-dashboard"
[ ] Resident abre dashboard.
[ ] Ve resumen de saldo si tiene permiso.
[ ] Ve próximos vencimientos.
[ ] Ve pagos recientes.
[ ] Ve comunicados no leídos.
[ ] Ve solicitudes de mantenimiento abiertas.
[ ] No ve datos de otra unidad.
[ ] No calcula saldo en frontend.
```

---

### 12.4. Account statement own

```text id="rss-e2e-account-statement"
[ ] Usuario abre /resident/app/account-statement.
[ ] App consulta estado de cuenta propio.
[ ] Muestra periodo, cargos, pagos y saldo devuelto por API.
[ ] Descarga documento mediante SecureDocumentLink si existe.
[ ] No muestra storageKey.
[ ] Usuario sin financialAccessLevel suficiente recibe ForbiddenState o vista limitada.
```

---

### 12.5. Charges own

```text id="rss-e2e-charges"
[ ] Usuario abre cargos.
[ ] Lista cargos propios.
[ ] Filtra por periodo.
[ ] Ve estado del cargo.
[ ] No puede crear cargo.
[ ] No puede modificar cargo.
[ ] No puede cambiar status.
```

---

### 12.6. Payments own

```text id="rss-e2e-payments"
[ ] Usuario abre pagos.
[ ] Lista pagos propios.
[ ] Ve estado del pago.
[ ] Abre detalle.
[ ] Sube comprobante por flujo seguro.
[ ] Envía pago/comprobante si API lo permite.
[ ] Botón queda disabled durante submit.
[ ] App muestra pendingReview.
[ ] No puede aprobar su propio pago.
[ ] No puede rechazar pago.
[ ] No puede reversar pago.
```

---

### 12.7. Reservations own

```text id="rss-e2e-reservations"
[ ] Usuario abre reservas.
[ ] Lista áreas permitidas.
[ ] Consulta disponibilidad.
[ ] Crea reserva propia.
[ ] Backend valida disponibilidad.
[ ] App muestra estado requested/approved según API.
[ ] Usuario cancela reserva propia si canCancel=true.
[ ] No aprueba reservas administrativamente.
```

---

### 12.8. Fines and appeals own

```text id="rss-e2e-fines"
[ ] Usuario abre multas.
[ ] Lista multas propias.
[ ] Abre detalle de multa.
[ ] Ve evidencia autorizada.
[ ] Apela multa si appealAllowed=true.
[ ] Adjunta evidencia por secureDocumentId.
[ ] No resuelve apelación.
[ ] No ve multas de otra unidad.
```

---

### 12.9. Communications targeted

```text id="rss-e2e-communications"
[ ] Usuario abre comunicados.
[ ] Lista comunicados dirigidos.
[ ] Abre comunicado.
[ ] HTML se renderiza sanitizado o escapado.
[ ] Adjuntos usan SecureDocumentLink.
[ ] Marca como leído si API lo permite.
[ ] No ve comunicados de audiencia no autorizada.
```

---

### 12.10. Meetings, voting and minutes

```text id="rss-e2e-governance"
[ ] Usuario abre reuniones.
[ ] Ve reuniones visibles.
[ ] Confirma asistencia si aplica.
[ ] Abre votación autorizada.
[ ] UI no permite votar si eligible=false.
[ ] Envía voto si eligible=true y voting open.
[ ] Backend impide doble voto.
[ ] Consulta actas publicadas.
[ ] Descarga acta por secureDocumentId.
```

---

### 12.11. Secure documents own

```text id="rss-e2e-documents"
[ ] Usuario abre documentos.
[ ] Lista documentos autorizados.
[ ] No lista documentos de otra unidad.
[ ] Abre SecureDocumentLink.
[ ] Core valida permiso.
[ ] UI no muestra storageKey.
[ ] UI no guarda signedUrl persistente.
```

---

### 12.12. Maintenance own

```text id="rss-e2e-maintenance"
[ ] Usuario abre mantenimiento.
[ ] Lista solicitudes propias.
[ ] Crea solicitud propia.
[ ] Adjunta evidencia por secureDocumentId.
[ ] Consulta estado.
[ ] No asigna proveedor.
[ ] No aprueba costos.
[ ] No ve solicitudes de otra unidad.
```

---

### 12.13. Visitors own

```text id="rss-e2e-visitors"
[ ] Usuario abre visitantes.
[ ] Lista visitantes propios.
[ ] Crea autorización de visitante.
[ ] App muestra accessCode enmascarado si API lo devuelve.
[ ] Cancela autorización si API lo permite.
[ ] No ve visitantes de otra unidad.
[ ] No abre portón.
[ ] No controla hardware.
[ ] No usa biometría.
```

---

### 12.14. Profile own

```text id="rss-e2e-profile"
[ ] Usuario abre perfil.
[ ] Ve datos propios permitidos.
[ ] Actualiza datos permitidos.
[ ] Actualiza preferencias de notificación si aplica.
[ ] No modifica roles.
[ ] No modifica permissions.
[ ] No modifica memberships.
[ ] No modifica relación con unidades.
```

---

### 12.15. Error handling

```text id="rss-e2e-errors"
[ ] 401 muestra sesión expirada.
[ ] 403 muestra ForbiddenState.
[ ] 404 muestra NotFoundState.
[ ] 409 muestra ConflictState.
[ ] 422 muestra errores por campo.
[ ] 429 muestra RateLimitState.
[ ] 500 muestra ApiErrorState con traceId.
[ ] No se muestran stack traces.
[ ] No se revela cross-tenant.
[ ] No se revela cross-property.
```

---

## 13. Accessibility tests básicos

```text id="rss-accessibility-tests"
[ ] Login es navegable por teclado.
[ ] TenantSwitcher es accesible por teclado.
[ ] PropertyUnitSwitcher es accesible por teclado.
[ ] BottomNavigation es accesible.
[ ] Formularios tienen labels.
[ ] Errores de formulario son anunciables.
[ ] Botones críticos tienen texto claro.
[ ] Modales manejan focus trap.
[ ] Contraste mínimo aceptable.
[ ] Estados loading no bloquean lector de pantalla indefinidamente.
[ ] Tablas/listas tienen encabezados o etiquetas accesibles.
```

---

## 14. Performance baseline tests

Objetivos iniciales:

```text id="rss-performance-objectives"
[ ] First load p95 < 3 s en ambiente objetivo.
[ ] Navegación interna p95 < 1 s con cache.
[ ] Dashboard residente p95 < 2 s con API mock.
[ ] Estado de cuenta p95 < 2 s con API mock.
[ ] Lista de pagos p95 < 1.5 s con API mock.
[ ] Cambio de tenant p95 < 2 s.
[ ] Cambio de unidad p95 < 2 s.
[ ] Bundle inicial revisado.
[ ] Lazy loading por módulos secundarios.
[ ] No cargar historiales completos masivos.
```

---

## 15. CI gates

El pipeline debe ejecutar:

```text id="rss-ci-gates"
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
[ ] Production build.
```

Pipeline debe fallar si:

```text id="rss-ci-fail"
[ ] Se importa Prisma en frontend.
[ ] Se configura conexión PostgreSQL.
[ ] Se configura conexión Redis.
[ ] Se usa Keycloak Admin API desde frontend.
[ ] Se detecta storageKey en componentes.
[ ] Se detecta signedUrl persistente.
[ ] Se detecta rawSql/script/formulaCode en DTOs frontend.
[ ] Se detecta ruta pública transaccional.
[ ] Se detecta auth WordPress.
[ ] Se detecta console.log sensible.
[ ] Se consume endpoint no documentado.
[ ] Se consume endpoint administrativo para self-service.
[ ] Se rompe generación OpenAPI.
[ ] Tests críticos de tenant isolation fallan.
[ ] Tests críticos de property scope fallan.
[ ] Tests críticos de permisos fallan.
[ ] Se detecta acción administrativa de pagos.
[ ] Se detecta acción contable.
[ ] Se detecta control de hardware.
[ ] Se detecta IA externa con datos reales.
```

---

## 16. Cobertura mínima

```text id="rss-coverage"
- Auth helpers: >= 90%.
- Tenant helpers: >= 95%.
- Property scope helpers: >= 95%.
- Permission helpers: >= 95%.
- Error normalizer: >= 95%.
- Form schemas: >= 90%.
- API client wrapper: >= 90%.
- Componentes críticos: >= 85%.
- Route guards: >= 95%.
- Security critical tests: 100% passing.
- Tenant isolation tests: 100% passing.
- Property scope tests: 100% passing.
- Permission tests: 100% passing.
- No storageKey tests: 100% passing.
- No WordPress auth tests: 100% passing.
- No public transactional routes tests: 100% passing.
```

---

## 17. Smoke tests mínimos

```text id="rss-smoke-tests"
[ ] App carga.
[ ] Login funciona.
[ ] Logout funciona.
[ ] Selector de tenant funciona.
[ ] Selector de unidad funciona.
[ ] Dashboard residente carga.
[ ] Estado de cuenta carga con permiso.
[ ] Pagos propios cargan con permiso.
[ ] Comprobante usa secureDocumentId.
[ ] Reserva propia inicia.
[ ] Multa propia se visualiza.
[ ] Comunicado dirigido se visualiza.
[ ] Solicitud de mantenimiento se crea.
[ ] Visitante propio se crea.
[ ] Ruta sin permiso bloquea.
[ ] Cambio de tenant limpia cache.
[ ] Cambio de unidad limpia cache.
[ ] Error 422 se muestra en formulario.
[ ] Build production pasa.
```

---

## 18. No aceptación

No se acepta el módulo si las pruebas permiten:

```text id="rss-test-no-acceptance"
- sesión WordPress como autenticación;
- rutas públicas transaccionales;
- tenant no autorizado;
- unidad no vinculada;
- datos de tenant anterior por cache;
- datos de unidad anterior por cache;
- datos de otra unidad;
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
- endpoint administrativo consumido desde self-service;
- tenantId editable en formularios;
- propertyUnitId como autoridad final sin validación backend;
- actor fields en formularios;
- status directo indebido en formularios;
- cálculo final de saldos en UI;
- validación administrativa de pagos;
- creación de cargos desde self-service;
- modificación de saldos;
- creación de JournalEntry desde UI;
- confirmación de conciliación bancaria;
- apertura de portones;
- control de hardware;
- biometría;
- reconocimiento facial;
- IA externa con datos reales;
- errores 403/404/422 tratados como genéricos.
```

---

## 19. Definition of Done de pruebas

```text id="rss-test-dod"
[ ] Unit tests implementados.
[ ] Component tests implementados.
[ ] Hook tests implementados.
[ ] API client tests implementados.
[ ] OpenAPI contract tests implementados.
[ ] Form schema tests implementados.
[ ] Tenant isolation tests implementados.
[ ] Property scope tests implementados.
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

```text id="rss-test-expected-result"
test plan definido
unit tests definidos
component tests definidos
hook tests definidos
API client tests definidos
OpenAPI contract tests definidos
form schema tests definidos
security tests definidos
tenant isolation tests definidos
property scope tests definidos
permission tests definidos
E2E tests definidos
accessibility tests definidos
performance baseline definido
CI gates definidos
no storageKey verificado
no WordPress auth verificado
no public transactional routes verificado
no direct DB access verificado
no Prisma frontend verificado
no admin payment validation verificado
no accounting actions verificado
no hardware control verificado
no external AI with real data verificado
```

---

## 21. Expediente actualizado

```text id="rss-test-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 030-resident-self-service-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       └── test-plan.md
```
