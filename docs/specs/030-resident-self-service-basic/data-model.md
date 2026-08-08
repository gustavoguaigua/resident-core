# Data Model — 030 Resident Self-Service Basic

## 1. Información del documento

| Campo          | Valor                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                         |
| Spec ID        | 030                                                                                                   |
| Módulo         | Resident Self-Service Basic                                                                           |
| Documento      | Data Model                                                                                            |
| Ruta           | `docs/specs/030-resident-self-service-basic/data-model.md`                                            |
| Versión        | 0.1                                                                                                   |
| Estado         | Borrador inicial                                                                                      |
| Fecha          | 2026-08-04                                                                                            |
| Naturaleza     | Frontend data model / Self-service view model / Tenant-scoped / Property-scoped / Non-source-of-truth |
| Stack sugerido | Next.js / React / TypeScript / TanStack Query / OpenAPI Client / Keycloak OIDC                        |

---

## 2. Propósito

Definir el modelo de datos utilizado por el portal privado de residentes, propietarios y ocupantes autorizados.

Este documento no crea nuevas tablas transaccionales principales en PostgreSQL. El módulo `030-resident-self-service-basic` es una aplicación frontend de autoservicio que consume datos oficiales desde RESIDENT Core API y mantiene únicamente estado de interfaz, sesión, tenant activo, unidad activa, permisos efectivos, filtros, formularios, cache y preferencias no sensibles.

Regla central:

```text id="rss-dm-rule"
Resident Self-Service Basic no debe crear una fuente de verdad propia para datos transaccionales, financieros, documentales, de visitantes, reservas, multas, reuniones o mantenimiento; debe consumir modelos oficiales del Core API, mantener solo estado de UI y cache invalidable, sin almacenar storageKey, signedUrl persistente, secretos, tokens inseguros, tenantId editable, propertyUnitId como autoridad final, actor fields, datos financieros raw, datos personales innecesarios, datos de otras unidades ni información cross-tenant.
```

---

## 3. Clasificación del modelo

```text id="rss-dm-classification"
Resident-facing frontend state model
Self-service view model
Tenant-scoped model
Property-scoped model
Person-scoped model
Permission-aware model
Cache-aware model
Non-transactional model
Non-source-of-truth model
No direct DB model
No Prisma model
No storageKey model
No WordPress session model
```

---

## 4. Principios

```text id="rss-dm-principles"
1. RESIDENT Core API es la fuente de verdad.
2. El frontend no persiste datos transaccionales.
3. El frontend no define entidades financieras propias.
4. El frontend no calcula saldos finales.
5. El frontend no valida pagos administrativamente.
6. El frontend no modifica cargos.
7. El frontend no modifica saldos.
8. El frontend no crea asientos contables.
9. El frontend no confirma conciliaciones.
10. El frontend no accede a datos de otras unidades.
11. El frontend no almacena storageKey.
12. El frontend no guarda signedUrl persistente.
13. El frontend no guarda secretos.
14. El frontend no usa sesión WordPress.
15. El cache debe separarse por tenant y unidad.
16. El cache debe invalidarse al cambiar tenant o unidad.
17. Los permisos efectivos vienen del Core.
18. Las relaciones UserProfile -> Person -> PropertyUnit se resuelven server-side.
19. Los documentos se manejan por secureDocumentId.
20. Los errores deben conservar traceId.
```

---

## 5. No se crean tablas transaccionales nuevas

Para el MVP:

```text id="rss-dm-no-new-tables"
Resident Self-Service Basic no requiere nuevas tablas transaccionales en PostgreSQL.
```

Motivo:

```text id="rss-dm-no-new-tables-reason"
La app residente es una capa de presentación y autoservicio sobre APIs existentes. Los datos principales pertenecen a módulos Core ya definidos: usuarios, residentes, unidades, cargos, pagos, estados de cuenta, reservas, multas, comunicaciones, reuniones, votaciones, documentos, mantenimiento y visitantes.
```

No crear:

```text id="rss-dm-forbidden-db"
resident_portal_users
resident_portal_accounts
resident_balances
resident_payments
resident_documents
resident_visitors_cache
resident_local_charges
resident_local_votes
resident_storage_keys
resident_audit_events
```

---

## 6. Modelos frontend principales

```text id="rss-dm-client-models"
ResidentAuthSession
ResidentAuthenticatedUser
ResidentTenantMembership
ResidentTenantOption
ResidentPropertyUnitOption
ActiveResidentContext
ResidentPermissionSet
ResidentNavigationItem
ResidentRouteAccessRule
ResidentApiErrorModel
ResidentPaginatedResult
ResidentScreenState
ResidentDashboardViewModel
ResidentAccountStatementViewModel
ResidentChargeViewModel
ResidentPaymentViewModel
ResidentPaymentReceiptViewModel
ResidentReservationViewModel
ResidentFineViewModel
ResidentCommunicationViewModel
ResidentMeetingViewModel
ResidentVoteViewModel
ResidentMinuteViewModel
ResidentSecureDocumentReference
ResidentMaintenanceRequestViewModel
ResidentVisitorAuthorizationViewModel
ResidentProfileViewModel
ResidentFeatureFlags
ResidentUiPreferences
```

---

## 7. `ResidentAuthSession`

Representa el estado autenticado de la app residente.

```typescript id="rss-dm-auth-session"
type ResidentAuthSession = {
  isAuthenticated: boolean;
  status: "loading" | "authenticated" | "unauthenticated" | "expired";
  accessTokenAvailable: boolean;
  expiresAt?: string;
  user?: ResidentAuthenticatedUser;
};
```

Reglas:

```text id="rss-dm-auth-session-rules"
- No exponer token en componentes visuales.
- No registrar token en console.
- No incluir token en URL.
- No persistir refreshToken en localStorage.
- Logout limpia sesión, tenant activo, unidad activa, permisos y cache.
- No usar sesión WordPress.
```

---

## 8. `ResidentAuthenticatedUser`

```typescript id="rss-dm-auth-user"
type ResidentAuthenticatedUser = {
  userProfileId: string;
  keycloakSubjectId: string;
  email: string;
  displayName: string;
  status: "active" | "inactive" | "blocked";
};
```

Reglas:

```text id="rss-dm-auth-user-rules"
- keycloakSubjectId no debe usarse como permiso.
- El perfil se obtiene desde RESIDENT Core API.
- El frontend no modifica roles ni membresías.
```

---

## 9. `ResidentTenantMembership`

```typescript id="rss-dm-membership"
type ResidentTenantMembership = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  membershipStatus: "active" | "inactive" | "suspended";
  residentPortalEnabled: boolean;
  roles: string[];
  permissions: string[];
};
```

Reglas:

```text id="rss-dm-membership-rules"
- Solo memberships activas son seleccionables.
- residentPortalEnabled debe ser true para ingresar al portal.
- Las permissions son efectivas y entregadas por Core.
- El frontend no calcula permisos definitivos desde roles.
```

---

## 10. `ResidentTenantOption`

Modelo para selector de tenant.

```typescript id="rss-dm-tenant-option"
type ResidentTenantOption = {
  tenantId: string;
  slug: string;
  name: string;
  status: "active" | "inactive" | "suspended";
  residentPortalEnabled: boolean;
  logoUrl?: string;
  primaryColor?: string;
};
```

Reglas:

```text id="rss-dm-tenant-option-rules"
- tenantId no se edita en formularios.
- El selector solo muestra tenants autorizados.
- Cambiar tenant limpia unidad activa.
- Cambiar tenant invalida cache.
```

---

## 11. `ResidentPropertyUnitOption`

Modelo para selector de unidad vinculada.

```typescript id="rss-dm-property-unit-option"
type ResidentPropertyUnitOption = {
  propertyUnitId: string;
  code: string;
  label: string;
  type: "house" | "apartment" | "lot" | "parking" | "storage" | "other";
  relationshipType: "owner" | "resident" | "occupant" | "familyMember" | "authorizedUser";
  relationshipStatus: "active" | "inactive" | "ended" | "suspended";
  financialAccessLevel: "full" | "limited" | "none";
  canCreateReservations: boolean;
  canCreateVisitors: boolean;
  canCreateMaintenanceRequests: boolean;
};
```

Reglas:

```text id="rss-dm-property-unit-rules"
- Solo unidades vinculadas activas son seleccionables.
- propertyUnitId no se usa como autoridad final.
- Backend valida que la unidad pertenece al usuario.
- financialAccessLevel controla UI, pero backend autoriza.
- Cambio de unidad invalida cache property-scoped.
```

---

## 12. `ActiveResidentContext`

```typescript id="rss-dm-active-context"
type ActiveResidentContext = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  propertyUnitId?: string;
  propertyUnitCode?: string;
  relationshipType?: "owner" | "resident" | "occupant" | "familyMember" | "authorizedUser";
  financialAccessLevel?: "full" | "limited" | "none";
  permissionHash: string;
  selectedAt: string;
};
```

Reglas:

```text id="rss-dm-active-context-rules"
- Debe limpiarse al logout.
- Debe limpiarse al cambiar tenant.
- Debe validarse contra memberships y unidades vigentes.
- No reemplaza autorización backend.
- Debe incluirse en query keys.
- No debe persistir datos financieros ni documentos.
```

---

## 13. `ResidentPermissionSet`

```typescript id="rss-dm-permission-set"
type ResidentPermissionSet = {
  permissions: string[];
  permissionHash: string;
  loadedAt: string;
};
```

Funciones derivadas:

```typescript id="rss-dm-permission-functions"
type HasResidentPermission = (permission: string) => boolean;
type HasAnyResidentPermission = (permissions: string[]) => boolean;
type HasAllResidentPermissions = (permissions: string[]) => boolean;
```

Permisos representativos:

```text id="rss-dm-permissions"
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

Reglas:

```text id="rss-dm-permission-rules"
- PermissionSet solo controla visibilidad UI.
- Backend autoriza cada recurso .own.
- PermissionHash puede usarse para cache keys.
- Permisos no deben persistirse indefinidamente.
```

---

## 14. `ResidentNavigationItem`

```typescript id="rss-dm-navigation-item"
type ResidentNavigationItem = {
  key: string;
  label: string;
  href: string;
  icon?: string;
  moduleKey: string;
  requiredPermissions: string[];
  requiresPropertyUnit: boolean;
  enabled: boolean;
};
```

Reglas:

```text id="rss-dm-navigation-rules"
- Si no hay permiso, ocultar o deshabilitar.
- Si requiere unidad y no existe unidad activa, redirigir a select-context.
- Ocultar navegación no reemplaza autorización backend.
- No mostrar rutas transaccionales públicas.
```

---

## 15. `ResidentRouteAccessRule`

```typescript id="rss-dm-route-access-rule"
type ResidentRouteAccessRule = {
  routePattern: string;
  requiredPermissions: string[];
  requiresTenant: boolean;
  requiresPropertyUnit: boolean;
  requiresAuth: boolean;
  forbiddenRedirect: "/resident/forbidden";
};
```

Rutas protegidas:

```text id="rss-dm-protected-routes"
/resident/app/dashboard
/resident/app/account-statement
/resident/app/charges
/resident/app/payments
/resident/app/reservations
/resident/app/fines
/resident/app/communications
/resident/app/meetings
/resident/app/voting
/resident/app/minutes
/resident/app/documents
/resident/app/maintenance
/resident/app/visitors
/resident/app/profile
```

---

## 16. `ResidentApiErrorModel`

```typescript id="rss-dm-api-error"
type ResidentApiErrorModel = {
  httpStatus: 400 | 401 | 403 | 404 | 409 | 413 | 415 | 422 | 429 | 500;
  code: string;
  message: string;
  traceId?: string;
  fieldErrors?: Record<string, string[]>;
  details?: unknown;
};
```

Mapeo UI:

```text id="rss-dm-api-error-mapping"
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

```text id="rss-dm-api-error-rules"
- Mostrar traceId si existe.
- No mostrar stack trace crudo.
- No mostrar payload sensible.
- No revelar si 404 corresponde a recurso de otra unidad.
- No revelar existencia de recursos cross-tenant.
```

---

## 17. `ResidentPaginatedResult`

```typescript id="rss-dm-paginated-result"
type ResidentPaginatedResult<T> = {
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

```text id="rss-dm-pagination-rules"
- pageSize máximo debe respetar API.
- No cargar historiales completos masivos.
- Listados de pagos, cargos, reservas y comunicados usan paginación server-side.
```

---

## 18. `ResidentScreenState`

```typescript id="rss-dm-screen-state"
type ResidentScreenState<T> =
  | { type: "loading" }
  | { type: "empty"; message: string }
  | { type: "loaded"; data: T }
  | { type: "partial"; data: T; warning: string }
  | { type: "forbidden"; traceId?: string }
  | { type: "notFound"; traceId?: string }
  | { type: "conflict"; message: string; traceId?: string }
  | { type: "validationError"; fieldErrors: Record<string, string[]>; traceId?: string }
  | { type: "rateLimited"; retryAfter?: number; traceId?: string }
  | { type: "error"; message: string; traceId?: string };
```

Reglas:

```text id="rss-dm-screen-state-rules"
- 403 nunca se muestra como error genérico.
- 404 no revela cross-tenant ni cross-property.
- 422 debe vincularse a formularios.
- 500 debe mostrar traceId si existe.
```

---

## 19. `ResidentDashboardViewModel`

```typescript id="rss-dm-dashboard-view-model"
type ResidentDashboardViewModel = {
  tenantSlug: string;
  propertyUnitCode?: string;
  periodFrom: string;
  periodTo: string;
  balanceSummary?: ResidentBalanceSummaryViewModel;
  upcomingDueDates: ResidentDueDateViewModel[];
  recentPayments: ResidentPaymentViewModel[];
  upcomingReservations: ResidentReservationViewModel[];
  pendingFines: ResidentFineViewModel[];
  unreadCommunicationsCount: number;
  openMaintenanceRequestsCount: number;
  activeVisitorAuthorizationsCount?: number;
};

type ResidentBalanceSummaryViewModel = {
  currency: string;
  currentBalance: string;
  overdueAmount: string;
  nextDueAmount?: string;
  nextDueDate?: string;
};
```

Reglas:

```text id="rss-dm-dashboard-rules"
- No calcular saldo final en frontend.
- Mostrar valores devueltos por Core.
- Si financialAccessLevel=none, ocultar balance/cargos/pagos.
- No mostrar datos de otra unidad.
```

---

## 20. `ResidentAccountStatementViewModel`

```typescript id="rss-dm-account-statement"
type ResidentAccountStatementViewModel = {
  accountStatementId: string;
  propertyUnitId: string;
  propertyUnitCode: string;
  periodFrom: string;
  periodTo: string;
  currency: string;
  openingBalance: string;
  totalCharges: string;
  totalPayments: string;
  endingBalance: string;
  generatedAt: string;
  lines: ResidentAccountStatementLineViewModel[];
  downloadableDocument?: ResidentSecureDocumentReference;
};

type ResidentAccountStatementLineViewModel = {
  lineId: string;
  date: string;
  type: "charge" | "payment" | "adjustment" | "fine" | "reservationFee";
  description: string;
  amount: string;
  balanceAfter?: string;
  referenceId?: string;
};
```

Reglas:

```text id="rss-dm-account-statement-rules"
- UI no calcula saldos.
- UI no modifica líneas.
- UI no permite editar cargos ni pagos.
- Descargar documento usa secureDocumentId.
- Si acceso financiero es limitado, Core debe devolver vista limitada.
```

---

## 21. `ResidentChargeViewModel`

```typescript id="rss-dm-charge"
type ResidentChargeViewModel = {
  chargeId: string;
  propertyUnitId: string;
  concept: string;
  period: string;
  dueDate: string;
  amount: string;
  currency: string;
  status: "pending" | "partiallyPaid" | "paid" | "overdue" | "cancelled";
  sourceType: "dues" | "fine" | "reservation" | "manual" | "other";
};
```

Reglas:

```text id="rss-dm-charge-rules"
- UI no crea cargos desde self-service.
- UI no modifica cargos.
- UI no cambia status.
- Monto se muestra como string decimal.
- Backend define estado real del cargo.
```

---

## 22. `ResidentPaymentViewModel`

```typescript id="rss-dm-payment"
type ResidentPaymentViewModel = {
  paymentId: string;
  propertyUnitId: string;
  amount: string;
  currency: string;
  paymentDate: string;
  method: "bankTransfer" | "deposit" | "cash" | "onlineProvider" | "other";
  status: "draft" | "submitted" | "pendingReview" | "approved" | "rejected" | "cancelled";
  receipt?: ResidentPaymentReceiptViewModel;
  rejectionReason?: string;
};
```

Reglas:

```text id="rss-dm-payment-rules"
- Resident puede registrar pago o comprobante solo si API lo permite.
- Resident no aprueba pagos.
- Resident no rechaza pagos.
- Resident no reversa pagos.
- Resident no procesa tarjeta directamente.
- Backend valida método, monto, unidad y estado.
```

---

## 23. `ResidentPaymentReceiptViewModel`

```typescript id="rss-dm-payment-receipt"
type ResidentPaymentReceiptViewModel = {
  receiptId: string;
  secureDocumentId: string;
  fileName?: string;
  uploadedAt: string;
  status: "uploaded" | "pendingReview" | "accepted" | "rejected";
};
```

Reglas:

```text id="rss-dm-payment-receipt-rules"
- UI solo usa secureDocumentId.
- UI no muestra storageKey.
- UI no guarda signedUrl persistente.
- UI no ejecuta OCR automático en MVP.
- UI no envía comprobantes a IA externa.
```

---

## 24. `ResidentReservationViewModel`

```typescript id="rss-dm-reservation"
type ResidentReservationViewModel = {
  reservationId: string;
  commonAreaId: string;
  commonAreaName: string;
  propertyUnitId: string;
  startsAt: string;
  endsAt: string;
  status: "draft" | "requested" | "approved" | "rejected" | "cancelled" | "completed";
  feeAmount?: string;
  currency?: string;
  canCancel: boolean;
};
```

Reglas:

```text id="rss-dm-reservation-rules"
- UI no aprueba reservas administrativamente.
- UI solo crea/cancela reservas propias.
- Backend valida disponibilidad, política y unidad.
- UI no calcula cargos finales de reserva.
```

---

## 25. `ResidentFineViewModel`

```typescript id="rss-dm-fine"
type ResidentFineViewModel = {
  fineId: string;
  propertyUnitId: string;
  title: string;
  description?: string;
  amount?: string;
  currency?: string;
  status: "issued" | "appealed" | "upheld" | "revoked" | "paid" | "cancelled";
  issuedAt: string;
  appealAllowed: boolean;
  appealDeadline?: string;
  evidenceDocuments?: ResidentSecureDocumentReference[];
};
```

Reglas:

```text id="rss-dm-fine-rules"
- UI no crea multas.
- UI no resuelve apelaciones.
- UI solo permite apelar multa propia si policy/API lo permite.
- Evidencia se muestra solo si Core la autoriza.
```

---

## 26. `ResidentCommunicationViewModel`

```typescript id="rss-dm-communication"
type ResidentCommunicationViewModel = {
  communicationId: string;
  title: string;
  category: "general" | "financial" | "maintenance" | "security" | "governance" | "emergency" | "other";
  priority: "low" | "normal" | "high" | "urgent";
  publishedAt: string;
  readAt?: string;
  excerpt?: string;
  body?: string;
  attachments?: ResidentSecureDocumentReference[];
};
```

Reglas:

```text id="rss-dm-communication-rules"
- UI solo muestra comunicados dirigidos al usuario/unidad.
- HTML debe sanitizarse o escaparse.
- Adjuntos usan secureDocumentId.
- No mostrar comunicaciones de audiencias no autorizadas.
```

---

## 27. `ResidentMeetingViewModel`

```typescript id="rss-dm-meeting"
type ResidentMeetingViewModel = {
  meetingId: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  modality: "inPerson" | "virtual" | "hybrid";
  attendanceStatus?: "notConfirmed" | "confirmed" | "attended" | "absent";
  canConfirmAttendance: boolean;
  relatedDocuments?: ResidentSecureDocumentReference[];
};
```

Reglas:

```text id="rss-dm-meeting-rules"
- UI solo muestra reuniones visibles para el usuario.
- Confirmación de asistencia requiere endpoint autorizado.
- Quorum publicado es informativo, no calculado en UI.
```

---

## 28. `ResidentVoteViewModel`

```typescript id="rss-dm-vote"
type ResidentVoteViewModel = {
  voteId: string;
  meetingId?: string;
  title: string;
  status: "upcoming" | "open" | "closed" | "cancelled";
  eligible: boolean;
  hasVoted: boolean;
  opensAt?: string;
  closesAt?: string;
  options?: ResidentVoteOptionViewModel[];
};

type ResidentVoteOptionViewModel = {
  optionId: string;
  label: string;
};
```

Reglas:

```text id="rss-dm-vote-rules"
- Elegibilidad se define en backend.
- UI no permite votar si eligible=false.
- Backend impide doble voto.
- UI no calcula resultados finales.
- Votación secreta no debe exponer selección previa si la política lo prohíbe.
```

---

## 29. `ResidentMinuteViewModel`

```typescript id="rss-dm-minute"
type ResidentMinuteViewModel = {
  minuteId: string;
  meetingId?: string;
  title: string;
  publishedAt: string;
  status: "published" | "archived";
  document: ResidentSecureDocumentReference;
};
```

Reglas:

```text id="rss-dm-minute-rules"
- UI solo muestra actas publicadas para residentes.
- UI no certifica actas.
- UI no edita actas.
- Descarga mediante secureDocumentId.
```

---

## 30. `ResidentSecureDocumentReference`

```typescript id="rss-dm-secure-document"
type ResidentSecureDocumentReference = {
  secureDocumentId: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  classification?: "publicSummary" | "internal" | "restricted" | "financialSensitive" | "personalDataSensitive";
};
```

Reglas:

```text id="rss-dm-secure-document-rules"
- UI solo usa secureDocumentId.
- UI nunca muestra storageKey.
- UI nunca guarda signedUrl persistente.
- Descarga debe usar flujo autorizado del módulo 016.
- Documentos financieros o personales requieren permiso .own.
```

---

## 31. `ResidentMaintenanceRequestViewModel`

```typescript id="rss-dm-maintenance-request"
type ResidentMaintenanceRequestViewModel = {
  maintenanceRequestId: string;
  propertyUnitId: string;
  title: string;
  description?: string;
  category: "plumbing" | "electrical" | "commonArea" | "security" | "cleaning" | "other";
  status: "submitted" | "underReview" | "assigned" | "inProgress" | "resolved" | "closed" | "rejected" | "cancelled";
  priority?: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  updatedAt?: string;
  attachments?: ResidentSecureDocumentReference[];
};
```

Reglas:

```text id="rss-dm-maintenance-rules"
- UI solo muestra solicitudes propias.
- UI no asigna proveedor en self-service.
- UI no aprueba costos.
- Adjuntos usan secureDocumentId.
- Backend valida unidad, estado y permisos.
```

---

## 32. `ResidentVisitorAuthorizationViewModel`

```typescript id="rss-dm-visitor"
type ResidentVisitorAuthorizationViewModel = {
  visitorAuthorizationId: string;
  propertyUnitId: string;
  visitorDisplayName: string;
  visitDate: string;
  validFrom?: string;
  validTo?: string;
  status: "active" | "used" | "expired" | "cancelled";
  accessCodeMasked?: string;
};
```

Reglas:

```text id="rss-dm-visitor-rules"
- UI solo muestra visitantes propios.
- UI no abre portones.
- UI no controla hardware.
- UI no usa biometría.
- UI no usa reconocimiento facial.
- Datos del visitante deben minimizarse.
- accessCode debe mostrarse enmascarado si Core lo define.
```

---

## 33. `ResidentProfileViewModel`

```typescript id="rss-dm-profile"
type ResidentProfileViewModel = {
  userProfileId: string;
  displayName: string;
  email: string;
  phoneMasked?: string;
  notificationPreferences?: {
    emailEnabled: boolean;
    smsEnabled?: boolean;
    whatsappEnabled?: boolean;
    pushEnabled?: boolean;
  };
};
```

Reglas:

```text id="rss-dm-profile-rules"
- UI permite actualización limitada.
- UI no modifica roles.
- UI no modifica memberships.
- UI no modifica relaciones con unidades.
- Datos sensibles se muestran enmascarados según API.
```

---

## 34. `ResidentFeatureFlags`

```typescript id="rss-dm-feature-flags"
type ResidentFeatureFlags = {
  residentSelfServiceEnabled: boolean;
  publicModeEnabled: false;
  wordpressAuthEnabled: false;
  storageKeyDisplayEnabled: false;
  externalAiEnabled: false;
  hardwareControlEnabled: false;
  paymentAdminActionsEnabled: false;
  accountingActionsEnabled: false;
  bankReconciliationEnabled: false;
};
```

Regla:

```text id="rss-dm-feature-flag-rule"
El build o runtime debe fallar si cualquier flag prohibido se evalúa como true.
```

---

## 35. `ResidentUiPreferences`

Preferencias no sensibles.

```typescript id="rss-dm-ui-preferences"
type ResidentUiPreferences = {
  theme?: "system" | "light" | "dark";
  density?: "comfortable" | "compact";
  lastSelectedTenantSlug?: string;
  lastSelectedPropertyUnitCode?: string;
};
```

Reglas:

```text id="rss-dm-ui-preferences-rules"
- No guardar tokens.
- No guardar permisos indefinidamente.
- No guardar estados de cuenta.
- No guardar comprobantes.
- No guardar documentos.
- No guardar storageKey.
- No guardar signedUrl.
- No guardar datos personales completos.
```

---

## 36. Query keys

Patrón obligatorio:

```typescript id="rss-dm-query-key-pattern"
["resident", tenantSlug, propertyUnitCode, "module", moduleKey, "resource", resourceKey, filtersHash]
```

Ejemplos:

```typescript id="rss-dm-query-key-examples"
["resident", "san-jose-la-salle-2", "casa-12", "dashboard", "summary", filtersHash]
["resident", "san-jose-la-salle-2", "casa-12", "payments", "list", filtersHash]
["resident", "san-jose-la-salle-2", "casa-12", "account-statement", "current", filtersHash]
["resident", "san-jose-la-salle-2", "casa-12", "visitors", "active", filtersHash]
```

Reglas:

```text id="rss-dm-query-key-rules"
- Toda query tenant-scoped incluye tenant.
- Toda query property-scoped incluye unidad.
- Cambio de tenant invalida todo.
- Cambio de unidad invalida property-scoped queries.
- Logout limpia cache.
- No incluir tokens en query keys.
- No incluir identificaciones, placas o datos financieros raw en query keys.
```

---

## 37. DTO mapping

### 37.1. Regla general

```text id="rss-dm-dto-rule"
El frontend debe mapear formularios a DTOs oficiales del OpenAPI, eliminando campos prohibidos y evitando contratos improvisados.
```

---

### 37.2. Campos prohibidos en request models

```text id="rss-dm-request-forbidden"
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
```

---

### 37.3. Campos prohibidos en UI responses

```text id="rss-dm-response-forbidden"
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
datos de otra unidad
authorization header
cookie
```

---

## 38. Formularios MVP

### 38.1. `SubmitPaymentReceiptForm`

```typescript id="rss-dm-form-payment-receipt"
type SubmitPaymentReceiptForm = {
  amount: string;
  paymentDate: string;
  method: "bankTransfer" | "deposit" | "cash" | "other";
  reference?: string;
  secureDocumentId?: string;
  notes?: string;
};
```

Prohibido:

```text id="rss-dm-form-payment-forbidden"
- approvedBy;
- status;
- storageKey;
- accountingEntryId;
- bankReconciliationId;
```

---

### 38.2. `CreateReservationForm`

```typescript id="rss-dm-form-reservation"
type CreateReservationForm = {
  commonAreaId: string;
  startsAt: string;
  endsAt: string;
  purpose?: string;
  guestsCount?: number;
};
```

Regla:

```text id="rss-dm-form-reservation-rule"
Backend valida disponibilidad, política, unidad y cargos asociados.
```

---

### 38.3. `AppealFineForm`

```typescript id="rss-dm-form-appeal-fine"
type AppealFineForm = {
  reason: string;
  evidenceSecureDocumentIds?: string[];
};
```

Regla:

```text id="rss-dm-form-appeal-rule"
UI no resuelve apelaciones; solo envía apelación propia si API lo permite.
```

---

### 38.4. `CreateMaintenanceRequestForm`

```typescript id="rss-dm-form-maintenance"
type CreateMaintenanceRequestForm = {
  title: string;
  description: string;
  category: "plumbing" | "electrical" | "commonArea" | "security" | "cleaning" | "other";
  priority?: "low" | "normal" | "high" | "urgent";
  attachmentSecureDocumentIds?: string[];
};
```

---

### 38.5. `CreateVisitorAuthorizationForm`

```typescript id="rss-dm-form-visitor"
type CreateVisitorAuthorizationForm = {
  visitorDisplayName: string;
  visitDate: string;
  validFrom?: string;
  validTo?: string;
  notes?: string;
};
```

Prohibido:

```text id="rss-dm-form-visitor-forbidden"
- biometricData;
- faceImage;
- hardwareCommand;
- gateOpenCommand;
```

---

### 38.6. `UpdateResidentProfileForm`

```typescript id="rss-dm-form-profile"
type UpdateResidentProfileForm = {
  displayName?: string;
  phone?: string;
  notificationPreferences?: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    whatsappEnabled?: boolean;
    pushEnabled?: boolean;
  };
};
```

Prohibido:

```text id="rss-dm-form-profile-forbidden"
- roles;
- permissions;
- memberships;
- tenantId;
- propertyUnitId;
- keycloakSubjectId;
```

---

## 39. Cache model

```typescript id="rss-dm-cache-model"
type ResidentCacheBoundary = {
  tenantSlug: string;
  propertyUnitCode?: string;
  permissionHash: string;
  moduleKey: string;
  resourceKey: string;
};
```

Reglas:

```text id="rss-dm-cache-rules"
- Cache debe estar aislado por tenant.
- Cache debe estar aislado por unidad cuando aplique.
- Cache debe considerar permisos para datos sensibles.
- Cache se limpia al logout.
- Cache se limpia al cambiar tenant.
- Cache property-scoped se limpia al cambiar unidad.
- Cache se invalida después de mutaciones.
- Cache no persiste storageKey.
- Cache no persiste signedUrl.
- Cache no persiste estados de cuenta completos en storage local.
```

---

## 40. Modelo de documentos seguros

Flujo:

```text id="rss-dm-document-flow"
1. API devuelve secureDocumentId.
2. UI muestra SecureDocumentLink.
3. Usuario solicita ver/descargar.
4. UI llama endpoint autorizado del módulo 016.
5. Core valida tenant, usuario, unidad, permiso y clasificación.
6. Core genera acceso temporal si corresponde.
7. UI nunca persiste URL sensible.
```

Prohibido:

```text id="rss-dm-document-forbidden"
- mostrar storageKey;
- guardar signedUrl;
- copiar storageKey al clipboard;
- incluir storageKey en logs;
- construir URLs manuales hacia bucket;
- enviar documentos reales a IA externa.
```

---

## 41. Modelo de auditoría UI

La app no escribe auditoría directa en base.

Debe enviar:

```text id="rss-dm-audit-ui-send"
- reason cuando endpoint lo requiera;
- request válido;
- headers estándar;
- correlationId si Core lo define.
```

No debe enviar:

```text id="rss-dm-audit-ui-forbidden"
- actorId;
- createdBy;
- approvedBy;
- executedBy;
- timestamps falsificados;
- audit metadata manipulada;
- storageKey;
- payload sensible raw.
```

Eventos auditables esperados en Core:

```text id="rss-dm-audit-events"
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

## 42. Validaciones frontend

Validaciones permitidas:

```text id="rss-dm-frontend-validation"
- requerido;
- longitud máxima;
- formato de correo;
- formato de teléfono;
- formato de fecha;
- número decimal;
- enums;
- tamaño de archivo antes de upload;
- extensión de archivo;
- confirmación de acción crítica;
- campos permitidos por schema.
```

Validaciones no finales:

```text id="rss-dm-frontend-validation-non-final"
- tenant isolation;
- property ownership;
- relación persona-unidad;
- elegibilidad de votación;
- disponibilidad real de área comunal;
- saldos finales;
- validación de pagos;
- conciliación;
- unicidad global;
- idempotencia final.
```

Regla:

```text id="rss-dm-validation-rule"
La validación frontend mejora usabilidad; la validación definitiva ocurre en RESIDENT Core API.
```

---

## 43. Persistencia local permitida

Permitido:

```text id="rss-dm-local-allowed"
- theme;
- density;
- último tenant seleccionado por slug;
- última unidad seleccionada por código;
- filtros no sensibles;
- preferencias visuales.
```

Prohibido:

```text id="rss-dm-local-forbidden"
- accessToken si hay BFF;
- refreshToken;
- password;
- clientSecret;
- storageKey;
- signedUrl;
- estados de cuenta completos;
- comprobantes;
- documentos;
- identificaciones;
- placas;
- datos de visitantes completos;
- datos financieros raw;
- roles/permisos indefinidamente;
- payloads de mantenimiento sensibles;
- payloads de votación secreta.
```

---

## 44. Compatibilidad con microservicios

```text id="rss-dm-microservices"
- La app depende de contratos OpenAPI versionados.
- No depende de tablas internas.
- No depende de joins internos.
- No depende de Prisma schema.
- Puede consumir gateway futuro.
- Puede soportar separación física de microservicios si se mantiene contrato API.
- Los endpoints .own deben ser estables aunque cambie la arquitectura interna.
```

---

## 45. No aceptación del modelo

No se acepta el modelo si:

```text id="rss-dm-no-acceptance"
- define tablas transaccionales propias para datos Core;
- usa Prisma en frontend;
- accede directo a PostgreSQL;
- persiste storageKey;
- persiste signedUrl;
- persiste tokens inseguros;
- guarda datos cross-tenant;
- guarda datos de otra unidad;
- permite tenantId editable;
- permite propertyUnitId como autoridad final sin backend;
- permite actor fields en formularios;
- calcula saldos finales en frontend;
- valida pagos administrativamente;
- crea cargos desde self-service;
- modifica saldos;
- crea JournalEntry directo;
- confirma conciliación;
- controla hardware;
- usa biometría;
- usa reconocimiento facial;
- usa sesión WordPress;
- usa IA externa con datos reales;
- cachea datos sensibles sin tenant/property boundary;
- no invalida cache al cambiar tenant o unidad.
```

---

## 46. Resultado esperado

```text id="rss-dm-expected-result"
modelo frontend residente definido
sin nuevas tablas transaccionales
ResidentAuthSession definido
ResidentAuthenticatedUser definido
ResidentTenantOption definido
ResidentPropertyUnitOption definido
ActiveResidentContext definido
ResidentPermissionSet definido
ResidentNavigationItem definido
ResidentRouteAccessRule definido
ResidentApiErrorModel definido
ResidentDashboardViewModel definido
ResidentAccountStatementViewModel definido
ResidentChargeViewModel definido
ResidentPaymentViewModel definido
ResidentReservationViewModel definido
ResidentFineViewModel definido
ResidentCommunicationViewModel definido
ResidentMeetingViewModel definido
ResidentVoteViewModel definido
ResidentMinuteViewModel definido
ResidentSecureDocumentReference definido
ResidentMaintenanceRequestViewModel definido
ResidentVisitorAuthorizationViewModel definido
ResidentProfileViewModel definido
FeatureFlags definidos
UiPreferences definidas
query keys tenant/property-scoped definidas
cache boundary definido
formularios MVP definidos
campos prohibidos definidos
no storageKey
no signedUrl persistente
no direct DB
no Prisma frontend
no WordPress session
no admin payment validation
no accounting actions
no hardware control
```

---

## 47. Expediente actualizado

```text id="rss-dm-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 030-resident-self-service-basic/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── data-model.md
```
