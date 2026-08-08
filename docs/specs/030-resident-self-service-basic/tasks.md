# Tasks — 030 Resident Self-Service Basic

## 1. Información del documento

| Campo          | Valor                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                               |
| Spec ID        | 030                                                                                                         |
| Módulo         | Resident Self-Service Basic                                                                                 |
| Documento      | Tasks                                                                                                       |
| Ruta           | `docs/specs/030-resident-self-service-basic/tasks.md`                                                       |
| Versión        | 0.1                                                                                                         |
| Estado         | Borrador inicial                                                                                            |
| Fecha          | 2026-08-04                                                                                                  |
| Stack sugerido | Next.js / React / TypeScript / Tailwind CSS / shadcn/ui / TanStack Query / OpenAPI Client / Keycloak OIDC   |
| Naturaleza     | Resident-facing / Tenant-scoped / Property-scoped / Permission-aware / API-first / Non-public transactional |

---

## 2. Propósito

Definir el backlog técnico para implementar el portal privado de autoservicio para residentes, propietarios, ocupantes y usuarios vinculados autorizados.

Regla central:

```text id="rss-task-rule"
Ninguna tarea se considera completa si permite sesión WordPress, rutas públicas transaccionales, tenant no autorizado, unidad no vinculada, cache cross-tenant, cache cross-property, datos de otra unidad, storageKey visible, signedUrl persistente, tokens en URL o console, Prisma en frontend, acceso directo a PostgreSQL, contratos API no documentados, tenantId editable, propertyUnitId como autoridad final sin validación backend, actor fields, validación administrativa de pagos, creación de cargos desde self-service, acciones contables, conciliación bancaria, control de hardware, biometría, reconocimiento facial o IA externa con datos reales.
```

---

## 3. Convenciones

```text id="rss-task-status"
[ ] Pendiente
[x] Completado
[~] En progreso
[!] Bloqueado
[-] No aplica
```

---

## 4. Dependencias previas

```text id="rss-task-dependencies"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] OpenAPI de RESIDENT Core disponible.
[ ] Keycloak disponible o mockeable.
[ ] Endpoint /api/v1/me disponible o gap registrado.
[ ] Endpoint /api/v1/me/tenants disponible o gap registrado.
[ ] Endpoint de unidades vinculadas disponible o gap registrado.
[ ] Endpoints .own self-service disponibles o gaps registrados.
[ ] APIs de documentos seguros disponibles.
[ ] APIs de pagos propios disponibles.
[ ] APIs de estados de cuenta propios disponibles.
[ ] Node LTS disponible.
[ ] Pipeline CI disponible.
```

---

# 5. EPIC-030-01 — App foundation

```text id="rss-epic-01"
[ ] Crear apps/resident-web/.
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
[ ] Crear página /resident/login.
[ ] Crear página /resident/auth/callback.
[ ] Crear página /resident/select-context.
[ ] Crear página /resident/forbidden.
[ ] Crear layout /resident/app.
```

Acceptance:

```text id="rss-epic-01-ac"
[ ] La app compila.
[ ] TypeScript strict pasa.
[ ] No existen rutas públicas transaccionales.
[ ] No existe dependencia Prisma.
[ ] No existe conexión directa a PostgreSQL.
[ ] No existe dependencia de WordPress auth.
```

---

# 6. EPIC-030-02 — Environment config and feature flags

```text id="rss-epic-02"
[ ] Crear configuración NEXT_PUBLIC_RESIDENT_API_BASE_URL.
[ ] Crear configuración NEXT_PUBLIC_KEYCLOAK_URL.
[ ] Crear configuración NEXT_PUBLIC_KEYCLOAK_REALM.
[ ] Crear configuración NEXT_PUBLIC_KEYCLOAK_CLIENT_ID.
[ ] Crear RESIDENT_SELF_SERVICE_ENABLED=true.
[ ] Crear RESIDENT_SELF_SERVICE_PUBLIC_MODE_ENABLED=false.
[ ] Crear RESIDENT_SELF_SERVICE_WORDPRESS_AUTH_ENABLED=false.
[ ] Crear RESIDENT_SELF_SERVICE_STORAGE_KEY_DISPLAY_ENABLED=false.
[ ] Crear RESIDENT_SELF_SERVICE_EXTERNAL_AI_ENABLED=false.
[ ] Crear RESIDENT_SELF_SERVICE_HARDWARE_CONTROL_ENABLED=false.
[ ] Crear RESIDENT_SELF_SERVICE_PAYMENT_ADMIN_ACTIONS_ENABLED=false.
[ ] Crear RESIDENT_SELF_SERVICE_ACCOUNTING_ACTIONS_ENABLED=false.
[ ] Crear RESIDENT_SELF_SERVICE_BANK_RECONCILIATION_ENABLED=false.
[ ] Implementar validación de config en boot/build.
```

Acceptance:

```text id="rss-epic-02-ac"
[ ] Build falla si public mode está true.
[ ] Build falla si WordPress auth está true.
[ ] Build falla si storageKey display está true.
[ ] Build falla si external AI está true.
[ ] Build falla si hardware control está true.
[ ] Build falla si payment admin actions está true.
[ ] Build falla si accounting actions está true.
[ ] Build falla si bank reconciliation está true.
```

---

# 7. EPIC-030-03 — Keycloak OIDC auth

```text id="rss-epic-03"
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
[ ] Limpiar tenant activo en logout.
[ ] Limpiar unidad activa en logout.
[ ] Limpiar permisos en logout.
[ ] Limpiar cache en logout.
```

Prohibido:

```text id="rss-epic-03-forbidden"
[ ] No implicit flow.
[ ] No tokens en query params.
[ ] No tokens en console.
[ ] No refreshToken en localStorage.
[ ] No WordPress session.
[ ] No Keycloak Admin API desde frontend.
```

Acceptance:

```text id="rss-epic-03-ac"
[ ] Usuario anónimo va a login.
[ ] Usuario autenticado puede continuar si tiene residentPortal.access.
[ ] Sesión expirada redirige a login.
[ ] Logout limpia estado sensible.
```

---

# 8. EPIC-030-04 — User, tenant, unit and resident context

```text id="rss-epic-04"
[ ] Crear hook/useCurrentResidentUser.
[ ] Consumir GET /api/v1/me.
[ ] Crear hook/useResidentTenants.
[ ] Consumir GET /api/v1/me/tenants.
[ ] Crear hook/useResidentPropertyUnits.
[ ] Consumir endpoint de unidades vinculadas.
[ ] Crear ResidentContextProvider.
[ ] Crear TenantProvider.
[ ] Crear PropertyUnitProvider.
[ ] Crear TenantSwitcher.
[ ] Crear PropertyUnitSwitcher.
[ ] Bloquear tenant inactive/suspended.
[ ] Bloquear tenant con residentPortalEnabled=false.
[ ] Bloquear unidad inactive/ended/suspended.
[ ] Bloquear unidad no vinculada.
[ ] Limpiar unidad activa al cambiar tenant.
[ ] Invalidar cache al cambiar tenant.
[ ] Invalidar cache property-scoped al cambiar unidad.
```

Acceptance:

```text id="rss-epic-04-ac"
[ ] Solo tenants autorizados aparecen.
[ ] Solo unidades vinculadas aparecen.
[ ] Usuario sin unidades ve estado específico.
[ ] Cambio de tenant limpia unidad y cache.
[ ] Cambio de unidad limpia cache property-scoped.
```

---

# 9. EPIC-030-05 — Permissions and property-scope guards

```text id="rss-epic-05"
[ ] Crear ResidentPermissionProvider.
[ ] Consumir endpoint de permisos efectivos.
[ ] Crear permissionHash.
[ ] Crear hasResidentPermission.
[ ] Crear hasAnyResidentPermission.
[ ] Crear hasAllResidentPermissions.
[ ] Crear ResidentPermissionGate.
[ ] Crear ResidentRouteGuard.
[ ] Crear PropertyScopeGuard.
[ ] Crear SensitiveActionGuard.
[ ] Requerir residentPortal.access para entrar.
[ ] Bloquear rutas sin permiso.
[ ] Bloquear rutas que requieren unidad activa.
```

Acceptance:

```text id="rss-epic-05-ac"
[ ] Menú respeta permisos.
[ ] Ruta manual sin permiso muestra ForbiddenState.
[ ] Ruta property-scoped sin unidad redirige a select-context.
[ ] Backend sigue siendo autoridad final.
```

---

# 10. EPIC-030-06 — API client and OpenAPI

```text id="rss-epic-06"
[ ] Configurar generación de cliente OpenAPI.
[ ] Crear lib/api/client.ts.
[ ] Centralizar baseURL.
[ ] Centralizar Authorization header.
[ ] Centralizar tenant context.
[ ] Centralizar property context.
[ ] Centralizar error normalizer.
[ ] Centralizar response envelope parser.
[ ] Agregar tests de cliente API.
[ ] Agregar CI para generación OpenAPI.
[ ] Bloquear consumo de endpoints no documentados.
[ ] Bloquear consumo de endpoints administrativos desde self-service.
```

Acceptance:

```text id="rss-epic-06-ac"
[ ] Cliente API se genera sin errores.
[ ] No hay fetch manual disperso.
[ ] traceId se conserva.
[ ] 401/403/404/409/422/429/500 se mapean correctamente.
[ ] No se consumen endpoints administrativos para acciones resident-facing.
```

---

# 11. EPIC-030-07 — Query client and cache isolation

```text id="rss-epic-07"
[ ] Configurar TanStack Query.
[ ] Crear query key factory.
[ ] Incluir tenant en query keys.
[ ] Incluir unidad en query keys property-scoped.
[ ] Incluir permissionHash donde aplique.
[ ] Limpiar cache al cambiar tenant.
[ ] Limpiar cache property-scoped al cambiar unidad.
[ ] Limpiar cache al logout.
[ ] Invalidar cache después de mutaciones.
[ ] Configurar staleTime bajo para datos financieros.
[ ] Impedir cache persistente de estados de cuenta completos.
[ ] Impedir cache de storageKey.
[ ] Impedir cache de signedUrl persistente.
```

Acceptance:

```text id="rss-epic-07-ac"
[ ] tenantA no muestra datos de tenantB.
[ ] unit101 no muestra datos de unit102.
[ ] Cambio de tenant no conserva datos anteriores.
[ ] Cambio de unidad no conserva datos anteriores.
```

---

# 12. EPIC-030-08 — Layout and base components

```text id="rss-epic-08"
[ ] Crear ResidentAppShell.
[ ] Crear ResidentHeader.
[ ] Crear ResponsiveSidebar.
[ ] Crear BottomNavigation.
[ ] Crear TenantSwitcher visual.
[ ] Crear PropertyUnitSwitcher visual.
[ ] Crear ResidentPermissionGate.
[ ] Crear PropertyScopeGuard.
[ ] Crear DashboardSummaryCard.
[ ] Crear AccountBalanceCard.
[ ] Crear MoneyDisplay.
[ ] Crear StatusBadge.
[ ] Crear SecureDocumentLink.
[ ] Crear ConfirmDialog.
[ ] Crear DangerActionDialog.
[ ] Crear FormErrorSummary.
[ ] Crear LoadingState.
[ ] Crear EmptyState.
[ ] Crear ForbiddenState.
[ ] Crear NotFoundState.
[ ] Crear ConflictState.
[ ] Crear RateLimitState.
[ ] Crear ApiErrorState.
[ ] Crear TraceIdDisplay.
```

Acceptance:

```text id="rss-epic-08-ac"
[ ] Layout funciona en móvil/tablet/escritorio.
[ ] Navegación respeta permisos.
[ ] Estados de error son diferenciados.
[ ] SecureDocumentLink no expone storageKey.
```

---

# 13. EPIC-030-09 — Route guards and navigation

```text id="rss-epic-09"
[ ] Definir route access rules.
[ ] Proteger /resident/app/dashboard.
[ ] Proteger /resident/app/account-statement.
[ ] Proteger /resident/app/charges.
[ ] Proteger /resident/app/payments.
[ ] Proteger /resident/app/reservations.
[ ] Proteger /resident/app/fines.
[ ] Proteger /resident/app/communications.
[ ] Proteger /resident/app/meetings.
[ ] Proteger /resident/app/voting.
[ ] Proteger /resident/app/minutes.
[ ] Proteger /resident/app/documents.
[ ] Proteger /resident/app/maintenance.
[ ] Proteger /resident/app/visitors.
[ ] Proteger /resident/app/profile.
[ ] Ocultar menú sin permiso.
[ ] Mostrar ForbiddenState en acceso manual sin permiso.
[ ] No revelar recursos cross-tenant o cross-property en 404.
```

Acceptance:

```text id="rss-epic-09-ac"
[ ] Rutas privadas requieren auth.
[ ] Rutas tenant requieren tenant activo.
[ ] Rutas property-scoped requieren unidad activa.
[ ] Rutas sin permiso se bloquean.
```

---

# 14. EPIC-030-10 — Form schemas and mutation safety

```text id="rss-epic-10"
[ ] Configurar React Hook Form.
[ ] Configurar Zod.
[ ] Crear forbiddenFieldsValidator.
[ ] Crear SubmitPaymentReceiptForm schema.
[ ] Crear CreateReservationForm schema.
[ ] Crear CancelReservationForm schema.
[ ] Crear AppealFineForm schema.
[ ] Crear CreateMaintenanceRequestForm schema.
[ ] Crear CreateVisitorAuthorizationForm schema.
[ ] Crear UpdateResidentProfileForm schema.
[ ] Bloquear tenantId editable.
[ ] Bloquear actor fields.
[ ] Bloquear status directo indebido.
[ ] Bloquear storageKey.
[ ] Bloquear signedUrl.
[ ] Bloquear rawSql.
[ ] Bloquear script.
[ ] Bloquear formulaCode.
[ ] Bloquear secrets.
[ ] Bloquear hardwareCommand.
[ ] Bloquear biometricData.
[ ] Bloquear faceImage.
[ ] Bloquear doble submit.
[ ] Mapear 422 a campos.
[ ] Confirmar acciones críticas.
```

Acceptance:

```text id="rss-epic-10-ac"
[ ] Formularios no envían campos server-side.
[ ] Formularios no envían storageKey.
[ ] Formularios no envían comandos de hardware.
[ ] Acciones críticas requieren confirmación.
[ ] Error 422 aparece por campo.
```

---

# 15. EPIC-030-11 — Resident dashboard UI

```text id="rss-epic-11"
[ ] Crear /resident/app/dashboard.
[ ] Consumir endpoint resident dashboard.
[ ] Crear ResidentDashboardPage.
[ ] Crear BalanceSummaryCard.
[ ] Crear UpcomingDuesCard.
[ ] Crear RecentPaymentsCard.
[ ] Crear UpcomingReservationsCard.
[ ] Crear PendingFinesCard.
[ ] Crear UnreadCommunicationsCard.
[ ] Crear OpenMaintenanceRequestsCard.
[ ] Crear ActiveVisitorsCard si aplica.
[ ] Manejar financialAccessLevel=none.
[ ] Manejar financialAccessLevel=limited.
[ ] Manejar 403/404/422/500.
```

Acceptance:

```text id="rss-epic-11-ac"
[ ] Dashboard muestra solo datos propios.
[ ] Frontend no calcula saldos finales.
[ ] Datos financieros se ocultan si no hay acceso.
[ ] No se muestran datos de otra unidad.
```

---

# 16. EPIC-030-12 — Account statement and charges UI

```text id="rss-epic-12"
[ ] Crear /resident/app/account-statement.
[ ] Crear /resident/app/charges.
[ ] Consumir endpoint de estado de cuenta propio.
[ ] Consumir endpoint de cargos propios.
[ ] Crear filtros por periodo.
[ ] Mostrar openingBalance.
[ ] Mostrar totalCharges.
[ ] Mostrar totalPayments.
[ ] Mostrar endingBalance.
[ ] Mostrar líneas del estado.
[ ] Mostrar cargos por estado.
[ ] Descargar estado mediante SecureDocumentLink si aplica.
[ ] Manejar financialAccessLevel limitado.
```

Prohibido:

```text id="rss-epic-12-forbidden"
[ ] No calcular saldos finales.
[ ] No crear cargos.
[ ] No modificar cargos.
[ ] No cambiar status de cargos.
[ ] No mostrar storageKey.
```

---

# 17. EPIC-030-13 — Payments and receipts UI

```text id="rss-epic-13"
[ ] Crear /resident/app/payments.
[ ] Listar pagos propios.
[ ] Ver detalle de pago propio.
[ ] Crear formulario de registro/carga de comprobante.
[ ] Integrar upload seguro por secureDocumentId.
[ ] Enviar comprobante al endpoint autorizado.
[ ] Mostrar estado pendingReview/approved/rejected.
[ ] Mostrar rejectionReason si aplica.
[ ] Deshabilitar submit durante mutación.
[ ] Invalidar pagos y estado de cuenta tras submit.
```

Prohibido:

```text id="rss-epic-13-forbidden"
[ ] No aprobar pago.
[ ] No rechazar pago.
[ ] No reversar pago.
[ ] No procesar tarjetas directamente.
[ ] No crear JournalEntry.
[ ] No confirmar conciliación bancaria.
[ ] No enviar comprobante a IA externa.
```

---

# 18. EPIC-030-14 — Reservations UI

```text id="rss-epic-14"
[ ] Crear /resident/app/reservations.
[ ] Listar reservas propias.
[ ] Listar áreas comunales disponibles.
[ ] Consultar disponibilidad.
[ ] Crear reserva propia.
[ ] Cancelar reserva propia si canCancel=true.
[ ] Mostrar estado requested/approved/rejected/cancelled.
[ ] Mostrar cargos asociados si API los devuelve.
[ ] Manejar conflictos 409 por disponibilidad.
```

Acceptance:

```text id="rss-epic-14-ac"
[ ] UI no aprueba reservas.
[ ] UI no calcula cargos finales.
[ ] Backend valida disponibilidad y política.
[ ] No se muestran reservas de otra unidad.
```

---

# 19. EPIC-030-15 — Fines and appeals UI

```text id="rss-epic-15"
[ ] Crear /resident/app/fines.
[ ] Listar multas propias.
[ ] Ver detalle de multa.
[ ] Mostrar evidencia autorizada.
[ ] Crear AppealFineForm.
[ ] Enviar apelación si appealAllowed=true.
[ ] Adjuntar evidencia mediante secureDocumentId.
[ ] Mostrar estado appealed/upheld/revoked.
[ ] Manejar appealDeadline.
```

Prohibido:

```text id="rss-epic-15-forbidden"
[ ] No crear multas.
[ ] No editar multas.
[ ] No resolver apelaciones.
[ ] No ver multas de otra unidad.
[ ] No mostrar evidencia no autorizada.
```

---

# 20. EPIC-030-16 — Communications UI

```text id="rss-epic-16"
[ ] Crear /resident/app/communications.
[ ] Listar comunicados dirigidos.
[ ] Filtrar por categoría/prioridad/fecha.
[ ] Ver detalle de comunicado.
[ ] Sanitizar o escapar HTML.
[ ] Mostrar adjuntos mediante SecureDocumentLink.
[ ] Marcar como leído si API lo permite.
[ ] Mostrar unread count.
```

Acceptance:

```text id="rss-epic-16-ac"
[ ] No se muestran comunicados de audiencia no autorizada.
[ ] No se renderiza HTML peligroso.
[ ] Adjuntos no exponen storageKey.
```

---

# 21. EPIC-030-17 — Meetings, voting and minutes UI

```text id="rss-epic-17"
[ ] Crear /resident/app/meetings.
[ ] Crear /resident/app/voting.
[ ] Crear /resident/app/minutes.
[ ] Listar reuniones visibles.
[ ] Confirmar asistencia si API lo permite.
[ ] Mostrar votaciones autorizadas.
[ ] Bloquear voto si eligible=false.
[ ] Enviar voto si eligible=true y vote open.
[ ] Manejar hasVoted.
[ ] Consultar actas publicadas.
[ ] Descargar actas mediante SecureDocumentLink.
```

Prohibido:

```text id="rss-epic-17-forbidden"
[ ] No calcular quorum final.
[ ] No calcular resultados finales.
[ ] No permitir doble voto desde UI.
[ ] No exponer voto secreto si política lo prohíbe.
[ ] No editar actas.
[ ] No certificar actas.
```

---

# 22. EPIC-030-18 — Secure documents UI

```text id="rss-epic-18"
[ ] Crear /resident/app/documents.
[ ] Listar documentos autorizados.
[ ] Filtrar por categoría si API lo permite.
[ ] Ver metadata permitida.
[ ] Crear SecureDocumentLink reutilizable.
[ ] Integrar descarga autorizada.
[ ] Manejar 403.
[ ] Manejar 404.
[ ] Evitar signedUrl persistente.
[ ] Evitar storageKey.
```

Acceptance:

```text id="rss-epic-18-ac"
[ ] UI solo usa secureDocumentId.
[ ] No se construyen URLs manuales al bucket.
[ ] No se loggean referencias sensibles.
[ ] No se muestran documentos de otra unidad.
```

---

# 23. EPIC-030-19 — Maintenance requests UI

```text id="rss-epic-19"
[ ] Crear /resident/app/maintenance.
[ ] Listar solicitudes propias.
[ ] Crear solicitud de mantenimiento propia.
[ ] Adjuntar evidencias por secureDocumentId.
[ ] Consultar estado.
[ ] Agregar comentario si API lo permite.
[ ] Cancelar solicitud si API lo permite.
[ ] Confirmar atención si API lo permite.
```

Prohibido:

```text id="rss-epic-19-forbidden"
[ ] No asignar proveedor.
[ ] No aprobar costos.
[ ] No cerrar administrativamente si no corresponde.
[ ] No ver solicitudes de otra unidad.
```

---

# 24. EPIC-030-20 — Visitors and access UI

```text id="rss-epic-20"
[ ] Crear /resident/app/visitors.
[ ] Listar visitantes propios.
[ ] Crear autorización de visitante.
[ ] Cancelar autorización propia si API lo permite.
[ ] Mostrar accessCode enmascarado si API lo devuelve.
[ ] Minimizar datos del visitante.
[ ] Manejar expiración de autorización.
```

Prohibido:

```text id="rss-epic-20-forbidden"
[ ] No abrir portón.
[ ] No enviar hardwareCommand.
[ ] No controlar dispositivos físicos.
[ ] No usar biometría.
[ ] No usar reconocimiento facial.
[ ] No ver visitantes de otra unidad.
```

---

# 25. EPIC-030-21 — Profile UI

```text id="rss-epic-21"
[ ] Crear /resident/app/profile.
[ ] Mostrar perfil propio.
[ ] Mostrar email.
[ ] Mostrar teléfono enmascarado si API lo devuelve.
[ ] Actualizar datos permitidos.
[ ] Actualizar preferencias de notificación si aplica.
[ ] Manejar errores 422 por campo.
```

Prohibido:

```text id="rss-epic-21-forbidden"
[ ] No modificar roles.
[ ] No modificar permisos.
[ ] No modificar memberships.
[ ] No modificar relaciones con unidades.
[ ] No modificar keycloakSubjectId.
```

---

# 26. EPIC-030-22 — Error handling and UI states

```text id="rss-epic-22"
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
[ ] No revelar cross-property.
```

Acceptance:

```text id="rss-epic-22-ac"
[ ] 401 no se muestra como error genérico.
[ ] 403 no se muestra como error genérico.
[ ] 404 no revela existencia de recurso ajeno.
[ ] 422 se muestra por campo.
[ ] 500 muestra traceId si existe.
```

---

# 27. EPIC-030-23 — Frontend observability

```text id="rss-epic-23"
[ ] Registrar residentApp.loaded.
[ ] Registrar residentApp.route.changed.
[ ] Registrar residentApp.api.error.
[ ] Registrar residentApp.auth.sessionExpired.
[ ] Registrar residentApp.tenant.changed.
[ ] Registrar residentApp.unit.changed.
[ ] Registrar residentApp.criticalAction.submitted.
[ ] Registrar residentApp.criticalAction.failed.
[ ] Sanitizar eventos.
[ ] Deshabilitar console.log sensible.
```

Prohibido registrar:

```text id="rss-epic-23-forbidden"
[ ] tokens.
[ ] passwords.
[ ] authorization headers.
[ ] cookies.
[ ] storageKey.
[ ] signedUrl.
[ ] identificaciones completas.
[ ] placas completas.
[ ] comprobantes.
[ ] estados de cuenta completos.
[ ] payload financiero raw.
[ ] datos cross-tenant.
[ ] datos de otra unidad.
```

---

# 28. EPIC-030-24 — Accessibility baseline

```text id="rss-epic-24"
[ ] Validar navegación por teclado.
[ ] Validar TenantSwitcher accesible.
[ ] Validar PropertyUnitSwitcher accesible.
[ ] Validar BottomNavigation accesible.
[ ] Validar labels en formularios.
[ ] Validar focus trap en modales.
[ ] Validar contraste básico.
[ ] Validar listas/tablas accesibles.
[ ] Validar estados de error anunciables.
[ ] Validar botones críticos con texto claro.
```

Acceptance:

```text id="rss-epic-24-ac"
[ ] Flujos críticos pueden operarse con teclado.
[ ] Formularios críticos son entendibles.
[ ] ConfirmDialog maneja focus correctamente.
```

---

# 29. EPIC-030-25 — Testing and CI

```text id="rss-epic-25"
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

```text id="rss-epic-25-ci-fail"
[ ] Se importa Prisma.
[ ] Se detecta PostgreSQL URL.
[ ] Se detecta Redis URL.
[ ] Se detecta Keycloak Admin API.
[ ] Se detecta WordPress auth.
[ ] Se detecta storageKey en UI.
[ ] Se detecta signedUrl persistente.
[ ] Se detecta endpoint público transaccional.
[ ] Se consume endpoint administrativo desde self-service.
[ ] Se consume endpoint no documentado.
[ ] Tests críticos de tenant/property/permisos fallan.
[ ] Se detecta acción administrativa de pagos.
[ ] Se detecta acción contable.
[ ] Se detecta hardware control.
[ ] Se detecta biometría.
[ ] Se detecta reconocimiento facial.
[ ] Se detecta IA externa con datos reales.
```

---

# 30. EPIC-030-26 — Build and deployment

```text id="rss-epic-26"
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

```text id="rss-epic-26-allowed"
[ ] Docker container.
[ ] Hosting privado detrás de gateway.
[ ] Subdominio privado residentes.resident.gustavoguaigua.com.
[ ] Ruta privada separada del WordPress público.
```

No permitido:

```text id="rss-epic-26-forbidden"
[ ] Plugin WordPress obligatorio.
[ ] Página pública con estados de cuenta.
[ ] Página pública con pagos.
[ ] Página pública con documentos privados.
[ ] Build con secretos.
```

---

# 31. Plan de Pull Requests sugerido

```text id="rss-pr-plan"
PR-030-01 — App foundation, tooling, Tailwind, shadcn/ui and environment config.
PR-030-02 — Keycloak auth, session, tenant selector, unit selector and resident context.
PR-030-03 — OpenAPI client, TanStack Query, error handling and layout.
PR-030-04 — Permissions, property guards, navigation and base components.
PR-030-05 — Resident dashboard, account statement, charges and payments.
PR-030-06 — Payment receipt upload and secure documents.
PR-030-07 — Reservations, fines, appeals and communications.
PR-030-08 — Meetings, voting and published minutes.
PR-030-09 — Maintenance requests, visitors and profile.
PR-030-10 — Tests, accessibility, security hardening, performance and CI/CD.
```

---

# 32. Checklist de rutas UI

```text id="rss-route-checklist"
[ ] /resident/login
[ ] /resident/auth/callback
[ ] /resident/select-context
[ ] /resident/forbidden
[ ] /resident/app/dashboard
[ ] /resident/app/account-statement
[ ] /resident/app/charges
[ ] /resident/app/payments
[ ] /resident/app/reservations
[ ] /resident/app/fines
[ ] /resident/app/communications
[ ] /resident/app/meetings
[ ] /resident/app/voting
[ ] /resident/app/minutes
[ ] /resident/app/documents
[ ] /resident/app/maintenance
[ ] /resident/app/visitors
[ ] /resident/app/profile
```

Rutas prohibidas:

```text id="rss-route-forbidden"
[ ] /public/resident/account-statement
[ ] /public/resident/payments
[ ] /public/resident/documents
[ ] /public/resident/visitors
[ ] /wp/resident-private
[ ] /wp-admin/resident-self-service
[ ] /embed/resident-dashboard
```

---

# 33. Definition of Done

```text id="rss-dod"
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
[ ] Unit selector implementado.
[ ] ResidentContextProvider implementado.
[ ] PermissionProvider implementado.
[ ] PropertyScopeGuard implementado.
[ ] OpenAPI client generado.
[ ] TanStack Query configurado.
[ ] Layout responsive implementado.
[ ] Dashboard residente implementado.
[ ] Estado de cuenta propio implementado.
[ ] Cargos propios implementados.
[ ] Pagos propios implementados.
[ ] Comprobantes por SDS implementados.
[ ] Reservas propias implementadas.
[ ] Multas/apelaciones propias implementadas.
[ ] Comunicados dirigidos implementados.
[ ] Reuniones/votaciones/actas publicadas implementadas.
[ ] Documentos seguros implementados.
[ ] Mantenimiento propio implementado.
[ ] Visitantes propios implementados.
[ ] Perfil propio implementado.
[ ] Tests críticos implementados.
[ ] E2E smoke implementado.
[ ] Accessibility smoke implementado.
[ ] No storageKey exposure verificado.
[ ] No WordPress auth verificado.
[ ] No public transactional routes verificado.
[ ] No direct DB access verificado.
[ ] No Prisma frontend verificado.
[ ] No admin payment validation verificado.
[ ] No accounting actions verificado.
[ ] No hardware control verificado.
[ ] CI/CD implementado.
```

---

# 34. No aceptación

No se acepta implementación si:

```text id="rss-no-acceptance"
- usa sesión WordPress;
- expone rutas públicas transaccionales;
- permite seleccionar tenant no autorizado;
- permite seleccionar unidad no vinculada;
- muestra datos de otra unidad;
- muestra datos de otro tenant;
- mantiene cache del tenant o unidad anterior;
- muestra storageKey;
- guarda signedUrl persistente;
- registra tokens en console;
- incluye tokens o datos sensibles en URL;
- llama directamente a PostgreSQL;
- usa Prisma en frontend;
- usa Keycloak Admin API desde frontend;
- consume contratos API no documentados;
- consume endpoints administrativos para self-service;
- envía tenantId editable;
- usa propertyUnitId como autoridad final sin validación backend;
- envía actor fields;
- envía status directo indebido;
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

# 35. Resultado esperado

```text id="rss-expected-result"
tasks definidas
épicas implementables definidas
PR plan definido
rutas UI definidas
DoD definido
no acceptance definido
resident self-service privado definido
Keycloak auth requerido
tenant selector requerido
unit selector requerido
property-scoped authorization requerido
OpenAPI client requerido
TanStack Query requerido
dashboard residente requerido
estado de cuenta propio requerido
pagos propios requeridos
comprobantes por SDS requeridos
reservas propias requeridas
multas y apelaciones propias requeridas
comunicados dirigidos requeridos
documentos seguros requeridos
mantenimiento propio requerido
visitantes propios requeridos
perfil propio requerido
security hardening requerido
CI gates requeridos
no WordPress auth
no public transactional routes
no storageKey
no direct DB
no Prisma frontend
no admin payment validation
no accounting actions
no hardware control
```

---

# 36. Expediente actualizado

```text id="rss-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 030-resident-self-service-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
