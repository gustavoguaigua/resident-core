# Plan — 024 Access Control and Visitors

## 1. Información del documento

| Campo                 | Valor                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                                                             |
| Spec ID               | 024                                                                                                                                       |
| Módulo                | Access Control and Visitors                                                                                                               |
| Documento             | Technical Plan                                                                                                                            |
| Ruta                  | `docs/specs/024-access-control-visitors/plan.md`                                                                                          |
| Versión               | 0.1                                                                                                                                       |
| Estado                | Borrador inicial                                                                                                                          |
| Fecha                 | 2026-07-24                                                                                                                                |
| Documento base        | `docs/specs/024-access-control-visitors/spec.md`                                                                                          |
| Fase                  | FASE 2 — RESIDENT Core                                                                                                                    |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                                                            |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                            |
| Naturaleza            | Tenant-scoped / Security-sensitive / Visitor-driven / Resident-authorized / Guard-operated / Audit-heavy / Privacy-sensitive / Non-public |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `024-access-control-visitors`.

El módulo permitirá gestionar visitantes, vehículos visitantes, puntos de acceso, autorizaciones, pases temporales, check-ins, check-outs, entregas, visitas de proveedores, autorizaciones recurrentes básicas, incidentes, comentarios, documentos, reportes, exportaciones y auditoría para cada conjunto residencial.

Regla central del plan:

```text id="oymh07"
Access Control and Visitors debe implementarse como un módulo operativo tenant-scoped, security-sensitive, privacy-sensitive, resident-authorized, guard-operated y audit-heavy, con API tenant privada, API /me limitada, API de guardia autenticada, datos personales minimizados, identificación y placas enmascaradas, documentos mediante Secure Document Storage, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de biometría, ausencia de reconocimiento facial, ausencia de apertura automática de portones, ausencia de control físico de hardware en MVP y ausencia de IA externa con datos reales.
```

---

## 3. Decisión técnica principal

El módulo se implementará dentro del monolito modular de RESIDENT Core.

Decisión:

```text id="wm4i6s"
Implementar Access Control and Visitors como módulo NestJS independiente dentro del monolito modular, con límites de dominio propios, repositorios tenant-scoped, políticas de autorización por recurso, API REST privada, API /me limitada, API de guardia autenticada, auditoría obligatoria, enmascaramiento de datos personales, integración con Secure Document Storage y puertos desacoplados hacia Residents/Properties, Notifications, Supplier Payments y Maintenance Work Orders.
```

Justificación:

```text id="yf5gj2"
- El control de visitantes es altamente sensible por privacidad y seguridad.
- Depende de Residents and Properties para validar unidad, persona y relación propia.
- Depende de Users/Roles para distinguir residentes, guardias, administradores y responsables de seguridad.
- Depende de Audit para trazabilidad completa.
- Depende de Secure Document Storage para documentos y exportaciones.
- No requiere microservicio físico inicial, pero sí límites modulares fuertes por su naturaleza security-sensitive.
- Puede evolucionar posteriormente hacia integración con hardware físico, lectores QR, cámaras u OCR, pero esas integraciones quedan fuera del MVP.
```

---

## 4. Nombre técnico del módulo

Nombre técnico:

```text id="gb35sy"
access-control-visitors
```

Ruta base recomendada:

```text id="znn1fn"
apps/api/src/modules/access-control-visitors/
```

Nombre de clase NestJS:

```typescript id="jpunoh"
AccessControlVisitorsModule
```

---

## 5. Tipo de módulo

Clasificación:

```text id="d8daos"
Operational module
Tenant-scoped module
Security-sensitive module
Privacy-sensitive module
Resident-facing limited /me module
Guard-operated module
Audit-heavy module
Non-public module
Hardware-ready future module
```

No es:

```text id="sijdh8"
- sistema de apertura automática de puertas;
- controlador de portones;
- sistema biométrico;
- sistema de reconocimiento facial;
- sistema CCTV;
- sistema OCR de placas;
- sistema policial;
- sistema de vigilancia masiva;
- lista negra global multi-tenant;
- portal público de visitantes;
- módulo WordPress;
- módulo de pagos;
- módulo contable;
- módulo de IA.
```

---

## 6. Alcance técnico MVP

### 6.1. Incluido

```text id="v4o28a"
- VisitorProfile.
- VisitorVehicle.
- AccessGate.
- AccessAuthorization.
- AccessPass.
- AccessEvent.
- AccessCheckIn.
- AccessCheckOut.
- VisitorDelivery.
- VisitorSupplierVisit.
- VisitorRecurringAuthorization.
- AccessIncident.
- AccessComment.
- AccessDocument.
- AccessReportExport.
- API tenant administrativa.
- API /me limitada para residentes autorizados.
- Guard API autenticada bajo /tenant/guard.
- Enmascaramiento de identificación, teléfono, placa y códigos.
- Hash de búsqueda para identificación y placa.
- Integración con Residents and Properties.
- Integración con Communications/Notifications.
- Integración con Secure Document Storage.
- Integración referencial con Supplier Payments.
- Integración referencial con Maintenance Work Orders.
- Auditoría.
- Observabilidad.
- Reportes básicos.
- Exportaciones vía Secure Document Storage.
- OpenAPI.
- Tests de dominio, API, seguridad, privacidad, multitenancy y auditoría.
```

---

### 6.2. Fuera de alcance técnico MVP

```text id="ncjvch"
- apertura automática de puertas;
- comandos a portones;
- integración con hardware físico;
- control de torniquetes;
- cerraduras inteligentes;
- cámaras CCTV;
- streaming de cámaras;
- reconocimiento facial;
- biometría;
- face embeddings;
- huellas digitales;
- OCR automático de placas;
- RFID/NFC;
- QR escaneado por hardware externo;
- app móvil offline de guardias;
- tracking GPS;
- verificación gubernamental de identidad;
- antecedentes penales;
- listas negras globales;
- portal externo de proveedores;
- pagos por parqueadero;
- facturación;
- contabilidad;
- conciliación bancaria;
- IA externa con datos reales;
- acceso desde WordPress público.
```

---

## 7. Dependencias internas

### 7.1. `001-tenants`

Uso:

```text id="ikkqag"
- tenant isolation;
- currentTenant;
- validación de tenant activo;
- configuración por tenant;
- respuesta 404 ante referencias cross-tenant.
```

Regla:

```text id="dlxrtq"
Todo visitante, vehículo, autorización, pase, evento, ingreso, salida, entrega, proveedor visitante, incidente, documento y reporte debe pertenecer a un tenant.
```

---

### 7.2. `002-users-roles`

Uso:

```text id="nasqlf"
- autenticación mediante Keycloak;
- UserProfile;
- TenantMembership;
- roles;
- permisos;
- actor server-side;
- validación de residentes;
- validación de guardias;
- validación de administradores;
- validación de responsables de seguridad.
```

Regla:

```text id="wic23d"
Keycloak autentica; RESIDENT Core autoriza según tenant, rol, permiso, recurso y relación propia.
```

---

### 7.3. `003-residents-properties`

Uso:

```text id="jyr91z"
- propertyUnitId;
- Person;
- residencies;
- ownerships;
- relación UserProfile -> Person -> PropertyUnit;
- validación de /me;
- validación de autorización de visitantes para unidad propia;
- validación de destinatario de entrega.
```

Regla:

```text id="j8zi3a"
Resident solo puede crear, consultar o cancelar autorizaciones relacionadas con unidades propias o expresamente vinculadas por el tenant.
```

---

### 7.4. `010-reservations-common-areas`

Uso futuro/opcional:

```text id="lb7fo2"
- visitantes vinculados a reservas de áreas comunales;
- proveedores para eventos;
- acceso a salón comunal o áreas reservadas.
```

Regla MVP:

```text id="ir3a42"
Access Control puede referenciar reservas en fase futura, pero no crea reservas, no genera cargos y no modifica estados de reserva en MVP.
```

---

### 7.5. `012-communications-notifications`

Uso:

```text id="mdepm5"
- notificar visitante en garita;
- enviar código temporal si la política lo permite;
- notificar autorización creada, cancelada o revocada;
- notificar incidente crítico;
- notificar entrega recibida o retornada.
```

Regla:

```text id="wwzdbx"
Las notificaciones no deben incluir identificación completa, placa completa, código completo persistente ni datos sensibles innecesarios.
```

---

### 7.6. `016-secure-document-storage`

Uso:

```text id="auf8gi"
- documentos de incidentes;
- soportes administrativos;
- evidencias de acceso si se habilitan;
- documentos de entrega;
- reportes exportados.
```

Regla:

```text id="jzj75f"
Access Control no almacena storageKey, signedUrl persistente, base64 ni binarios; solo referencia secureDocumentId.
```

---

### 7.7. `021-supplier-payments`

Uso referencial:

```text id="vk1sdw"
- validar supplierId para visitas de proveedor;
- consultar resumen mínimo del proveedor;
- impedir proveedor bloqueado si aplica.
```

Regla:

```text id="pt7jzt"
Registrar una visita de proveedor no crea SupplierPayable, no crea SupplierPaymentOrder, no crea Payment y no modifica estado financiero del proveedor.
```

---

### 7.8. `022-maintenance-work-orders`

Uso referencial:

```text id="j10z7i"
- visitas de técnicos vinculadas a órdenes de mantenimiento;
- ingreso de proveedor o técnico para reparación;
- trazabilidad operacional de visita.
```

Regla:

```text id="c94p9v"
Access Control puede referenciar Maintenance Work Orders, pero no cierra órdenes, no cambia estados, no crea costos y no crea cuentas por pagar.
```

---

### 7.9. `007-audit`

Uso:

```text id="st0x37"
- auditoría de visitantes;
- auditoría de vehículos;
- auditoría de gates;
- auditoría de autorizaciones;
- auditoría de pases;
- auditoría de check-in;
- auditoría de check-out;
- auditoría de incidentes;
- auditoría de reportes;
- auditoría de exportaciones.
```

---

### 7.10. `008-basic-reports`

Uso:

```text id="p165c6"
- reportes de accesos;
- reportes de visitantes;
- reportes de autorizaciones;
- reportes de incidentes;
- exportaciones administrativas.
```

---

## 8. Estructura técnica del módulo

```text id="q5lhfw"
apps/api/src/modules/access-control-visitors/
├── access-control-visitors.module.ts
│
├── controllers/
│   ├── access-visitors.controller.ts
│   ├── access-visitor-vehicles.controller.ts
│   ├── access-gates.controller.ts
│   ├── access-authorizations.controller.ts
│   ├── access-passes.controller.ts
│   ├── access-events.controller.ts
│   ├── access-check-ins.controller.ts
│   ├── access-check-outs.controller.ts
│   ├── access-deliveries.controller.ts
│   ├── access-supplier-visits.controller.ts
│   ├── access-incidents.controller.ts
│   ├── access-comments.controller.ts
│   ├── access-documents.controller.ts
│   ├── access-reports.controller.ts
│   ├── guard-access.controller.ts
│   └── me-access.controller.ts
│
├── application/
│   ├── services/
│   │   ├── visitor-profile.service.ts
│   │   ├── visitor-vehicle.service.ts
│   │   ├── access-gate.service.ts
│   │   ├── access-authorization.service.ts
│   │   ├── access-pass.service.ts
│   │   ├── access-event.service.ts
│   │   ├── access-check-in.service.ts
│   │   ├── access-check-out.service.ts
│   │   ├── visitor-delivery.service.ts
│   │   ├── visitor-supplier-visit.service.ts
│   │   ├── recurring-authorization.service.ts
│   │   ├── access-incident.service.ts
│   │   ├── access-comment.service.ts
│   │   ├── access-document.service.ts
│   │   ├── access-report.service.ts
│   │   ├── access-export.service.ts
│   │   ├── access-audit.service.ts
│   │   └── access-observability.service.ts
│   │
│   ├── use-cases/
│   │   ├── create-visitor-profile.use-case.ts
│   │   ├── create-own-access-authorization.use-case.ts
│   │   ├── cancel-own-access-authorization.use-case.ts
│   │   ├── create-admin-access-authorization.use-case.ts
│   │   ├── create-access-pass.use-case.ts
│   │   ├── validate-access-pass.use-case.ts
│   │   ├── record-access-check-in.use-case.ts
│   │   ├── record-access-check-out.use-case.ts
│   │   ├── record-denied-access.use-case.ts
│   │   ├── record-access-incident.use-case.ts
│   │   ├── register-visitor-delivery.use-case.ts
│   │   ├── register-supplier-visit.use-case.ts
│   │   └── export-access-report.use-case.ts
│   │
│   └── ports/
│       ├── visitor-profile.repository.port.ts
│       ├── visitor-vehicle.repository.port.ts
│       ├── access-gate.repository.port.ts
│       ├── access-authorization.repository.port.ts
│       ├── access-pass.repository.port.ts
│       ├── access-event.repository.port.ts
│       ├── access-check-in.repository.port.ts
│       ├── access-check-out.repository.port.ts
│       ├── visitor-delivery.repository.port.ts
│       ├── visitor-supplier-visit.repository.port.ts
│       ├── recurring-authorization.repository.port.ts
│       ├── access-incident.repository.port.ts
│       ├── access-comment.repository.port.ts
│       ├── access-document.repository.port.ts
│       ├── access-report-export.repository.port.ts
│       ├── access-residents-properties.port.ts
│       ├── access-notifications.port.ts
│       ├── access-document-storage.port.ts
│       ├── access-supplier-payments.port.ts
│       ├── access-maintenance-work-orders.port.ts
│       └── access-audit.port.ts
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── policies/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── residents-properties/
│   ├── notifications/
│   ├── documents/
│   ├── supplier-payments/
│   ├── maintenance/
│   ├── reports/
│   ├── exports/
│   ├── audit/
│   └── observability/
│
├── dto/
├── guards/
├── mappers/
├── masking/
├── hashing/
└── tests/
```

---

## 9. Componentes principales

### 9.1. Controllers

Controllers recomendados:

```text id="gr2egn"
AccessVisitorsController
AccessVisitorVehiclesController
AccessGatesController
AccessAuthorizationsController
AccessPassesController
AccessEventsController
AccessCheckInsController
AccessCheckOutsController
AccessDeliveriesController
AccessSupplierVisitsController
AccessIncidentsController
AccessCommentsController
AccessDocumentsController
AccessReportsController
GuardAccessController
MeAccessController
```

Responsabilidad:

```text id="mys611"
- recibir requests HTTP;
- aplicar AuthGuard;
- aplicar TenantGuard;
- aplicar PermissionGuard;
- aplicar OwnResourceGuard en /me;
- aplicar GuardOperationGuard en /tenant/guard;
- validar DTOs;
- rechazar campos prohibidos;
- delegar a application services;
- devolver responses enmascaradas;
- no contener lógica compleja de autorización o privacidad.
```

---

### 9.2. Application services

Responsabilidad:

```text id="rlc3zj"
- coordinar casos de uso;
- validar tenant scope;
- validar relación propia;
- validar permisos;
- aplicar políticas de privacidad;
- aplicar enmascaramiento;
- generar números operativos;
- crear eventos auditables;
- invocar puertos de integración;
- emitir notificaciones sanitizadas;
- manejar transacciones;
- mapear errores de dominio a HTTP.
```

---

### 9.3. Domain entities

Entidades principales:

```text id="hgc3px"
VisitorProfile
VisitorVehicle
AccessGate
AccessAuthorization
AccessPass
AccessEvent
AccessCheckIn
AccessCheckOut
VisitorDelivery
VisitorSupplierVisit
VisitorRecurringAuthorization
AccessIncident
AccessComment
AccessDocument
AccessReportExport
```

---

### 9.4. Value objects

Value objects recomendados:

```text id="jghwr4"
VisitorFullName
VisitorIdentificationType
VisitorIdentificationMasked
VisitorIdentificationHash
VisitorPhoneMasked
VisitorPhoneHash
VisitorVehiclePlateMasked
VisitorVehiclePlateHash
AccessAuthorizationNumber
AccessPassCodeHash
AccessPassDisplayCode
AccessEventNumber
AccessGateCode
AccessGateName
AccessReason
AccessIncidentDescription
AccessIncidentSeverity
AccessCommentBody
AccessValidityWindow
AccessDateRange
AccessReportPeriod
AccessDocumentReference
```

---

### 9.5. Policies

Policies recomendadas:

```text id="hexva5"
AccessTenantPolicy
AccessVisitorPolicy
AccessVehiclePolicy
AccessGatePolicy
AccessAuthorizationPolicy
OwnAccessAuthorizationPolicy
AccessPassPolicy
AccessCheckInPolicy
AccessCheckOutPolicy
GuardAccessPolicy
AccessDeliveryPolicy
SupplierVisitPolicy
RecurringAuthorizationPolicy
AccessIncidentPolicy
AccessCommentPolicy
AccessDocumentPolicy
AccessReportPolicy
AccessPrivacyMaskingPolicy
AccessPersonalDataMinimizationPolicy
NoPublicAccessEndpointPolicy
NoWordPressAccessPolicy
NoBiometricProcessingPolicy
NoFaceRecognitionPolicy
NoGateOpeningPolicy
NoExternalAiAccessDataPolicy
NoGlobalWatchlistPolicy
```

---

## 10. Modelo de datos propuesto

Tablas MVP:

```text id="vicukq"
visitor_profiles
visitor_vehicles
access_gates
access_authorizations
access_passes
access_events
access_check_ins
access_check_outs
visitor_deliveries
visitor_supplier_visits
visitor_recurring_authorizations
access_incidents
access_comments
access_documents
access_report_exports
```

Todas las tablas deben incluir:

```text id="s44208"
id
tenant_id
created_at
updated_at
```

Las entidades archivables deben incluir:

```text id="qrexmo"
archived_at
archived_by
archive_reason
```

Las entidades sensibles deben evitar almacenar valores completos innecesarios.

Patrón recomendado:

```text id="tnsx07"
valor completo temporal en request
-> normalización
-> hash para búsqueda exacta
-> masked value para visualización
-> nunca devolver raw value por defecto
```

---

## 11. Relaciones principales

```text id="br0u0t"
Tenant 1 -> N VisitorProfile
Tenant 1 -> N VisitorVehicle
Tenant 1 -> N AccessGate
Tenant 1 -> N AccessAuthorization
Tenant 1 -> N AccessPass
Tenant 1 -> N AccessEvent
Tenant 1 -> N AccessCheckIn
Tenant 1 -> N AccessCheckOut
Tenant 1 -> N VisitorDelivery
Tenant 1 -> N VisitorSupplierVisit
Tenant 1 -> N AccessIncident

VisitorProfile 1 -> N VisitorVehicle
VisitorProfile 1 -> N AccessAuthorization
VisitorProfile 1 -> N AccessEvent
VisitorProfile 1 -> N AccessCheckIn
VisitorProfile 1 -> N AccessCheckOut
VisitorProfile 1 -> N VisitorDelivery
VisitorProfile 1 -> N VisitorSupplierVisit

AccessAuthorization 1 -> N AccessPass
AccessAuthorization 1 -> N AccessEvent
AccessAuthorization 1 -> N AccessCheckIn

AccessCheckIn 1 -> 0..1 AccessCheckOut

AccessGate 1 -> N AccessEvent
AccessGate 1 -> N AccessCheckIn
AccessGate 1 -> N AccessCheckOut

AccessEvent 1 -> 0..1 AccessCheckIn
AccessEvent 1 -> 0..1 AccessCheckOut
AccessEvent 1 -> N AccessComment
AccessEvent 1 -> N AccessDocument
AccessEvent 1 -> N AccessIncident
```

Referencias externas:

```text id="sxgvel"
propertyUnitId -> 003-residents-properties
personId -> 003-residents-properties
authorizedByUserId -> 002-users-roles/UserProfile
recordedByUserId -> 002-users-roles/UserProfile
supplierId -> 021-supplier-payments
maintenanceWorkOrderId -> 022-maintenance-work-orders
secureDocumentId -> 016-secure-document-storage
```

---

## 12. Estrategia de multitenancy

### 12.1. Patrón obligatorio

Toda consulta por recurso debe usar:

```typescript id="g52at2"
where: {
  id: resourceId,
  tenantId: currentTenant.id,
  archivedAt: null
}
```

Prohibido:

```typescript id="s136nr"
where: {
  id: resourceId
}
```

---

### 12.2. Validación de referencias externas

Toda referencia externa debe validarse contra el mismo tenant:

```text id="hbi6ok"
visitorId
vehicleId
gateId
authorizationId
accessPassId
accessEventId
checkInId
checkOutId
propertyUnitId
personId
supplierId
maintenanceWorkOrderId
secureDocumentId
```

---

### 12.3. Respuesta cross-tenant

Si el recurso pertenece a otro tenant:

```http id="a6r2ui"
404 Not Found
```

No se debe responder `403` si eso revela existencia de datos cross-tenant.

---

## 13. Estrategia de privacidad

### 13.1. Minimización

El módulo debe almacenar lo mínimo necesario.

Permitido:

```text id="f7o3rr"
- fullName;
- identificationType opcional;
- identificationNumberMasked;
- identificationNumberHash;
- phoneMasked;
- phoneHash opcional;
- plateMasked;
- plateHash;
- visitorType;
- motivo de visita;
- unidad visitada;
- timestamp de ingreso/salida;
- guardia registrador;
- gate;
- notas sanitizadas.
```

Evitar:

```text id="d7we2g"
- identificación completa persistente sin necesidad;
- fotos de documentos como requisito general;
- datos biométricos;
- face embeddings;
- copia masiva de documentos;
- información sensible del paquete;
- datos de salud;
- antecedentes externos.
```

---

### 13.2. Enmascaramiento

Datos enmascarados por defecto:

```text id="hxdi1p"
identificationNumber
phone
vehiclePlate
accessPassCode
email si se usa
```

Ejemplos:

```text id="li3t6v"
identificationNumberMasked = 17******90
phoneMasked = 09*****321
plateMasked = PB*-***4
accessPassDisplayCode = AB**91
```

---

### 13.3. Hash de búsqueda

Para búsquedas exactas seguras:

```text id="gel8xu"
identificationNumberHash = HMAC-SHA256(normalizedIdentificationNumber, tenantScopedPepper)
plateHash = HMAC-SHA256(normalizedPlate, tenantScopedPepper)
phoneHash = HMAC-SHA256(normalizedPhone, tenantScopedPepper)
accessPassCodeHash = HMAC-SHA256(passCode, tenantScopedPepper)
```

Reglas:

```text id="zav3tq"
- No usar hash simple sin pepper.
- No compartir pepper entre ambientes.
- No exponer hashes por API.
- No loggear valores raw.
- No loggear hashes.
```

---

## 14. State machines

### 14.1. VisitorProfileStatus

Estados:

```text id="xj42bi"
active
watchlistedTenant
blockedTenant
archived
```

Transiciones:

```text id="b4m68v"
active -> watchlistedTenant
watchlistedTenant -> active
active -> blockedTenant
watchlistedTenant -> blockedTenant
blockedTenant -> active con permiso reforzado
active -> archived
watchlistedTenant -> archived
blockedTenant -> archived
```

Reglas:

```text id="mo2pa7"
- blockedTenant impide nuevas autorizaciones salvo override administrativo auditado.
- watchlistedTenant requiere advertencia operativa.
- archived no se usa en nuevos accesos.
```

---

### 14.2. VisitorVehicleStatus

Estados:

```text id="jkchvt"
active
watchlistedTenant
blockedTenant
archived
```

Reglas:

```text id="q1h8jh"
- blockedTenant impide ingreso vehicular salvo override.
- La lista es local al tenant.
- No existe lista global.
```

---

### 14.3. AccessAuthorizationStatus

Estados:

```text id="o6vigt"
draft
active
used
expired
cancelled
revoked
archived
```

Transiciones:

```text id="m1bv2l"
draft -> active
active -> used
active -> expired
active -> cancelled
active -> revoked
cancelled -> archived
revoked -> archived
expired -> archived
used -> archived
```

Reglas:

```text id="l7z6dj"
- active requiere validFrom y validUntil.
- expired no permite ingreso.
- cancelled no permite ingreso.
- revoked no permite ingreso.
- oneTime pasa a used cuando se registra check-in exitoso si la política lo indica.
```

---

### 14.4. AccessPassStatus

Estados:

```text id="u7634e"
active
used
expired
revoked
archived
```

Reglas:

```text id="nvko1h"
- active permite validación mientras la autorización esté vigente.
- used no permite reutilización si es oneTime.
- expired no permite ingreso.
- revoked no permite ingreso.
```

---

### 14.5. AccessEventStatus

Estados:

```text id="ruxqtx"
recorded
corrected
voided
archived
```

Reglas:

```text id="dnkmqf"
- recorded es el estado normal.
- corrected preserva historial y razón.
- voided requiere razón y permiso reforzado.
- archived no borra trazabilidad.
```

---

### 14.6. CheckInStatus

Estados:

```text id="dxh6gb"
open
closed
voided
archived
```

Reglas:

```text id="m62g7y"
- open significa visitante dentro o salida no registrada.
- closed requiere check-out.
- voided requiere razón.
- archived conserva trazabilidad.
```

---

### 14.7. CheckOutStatus

Estados:

```text id="ekro2q"
recorded
voided
archived
```

---

### 14.8. DeliveryStatus

Estados:

```text id="citd6i"
registered
receivedAtGate
deliveredToUnit
returned
cancelled
archived
```

---

### 14.9. SupplierVisitStatus

Estados:

```text id="f80ic2"
scheduled
checkedIn
checkedOut
cancelled
denied
archived
```

---

### 14.10. AccessIncidentStatus

Estados:

```text id="dzseyl"
open
underReview
resolved
dismissed
archived
```

Reglas:

```text id="tc8sla"
- resolved requiere resolutionReason.
- dismissed requiere dismissReason.
- critical puede disparar notificación.
```

---

## 15. Estrategia de API

### 15.1. Base path

```text id="i8ophh"
/api/v1
```

---

### 15.2. Superficies API

```text id="lljshn"
Tenant Admin API:
  /api/v1/tenant/access-*

Guard API:
  /api/v1/tenant/guard/access-*

Own User API:
  /api/v1/me/access-*

Public API:
  no existe
```

---

### 15.3. Tenant Admin API

Responsabilidad:

```text id="h1dlm6"
- administración de visitantes;
- administración de vehículos;
- administración de gates;
- administración de autorizaciones;
- consulta histórica;
- incidentes;
- reportes;
- exportaciones;
- acciones correctivas auditadas.
```

---

### 15.4. Guard API

Responsabilidad:

```text id="oqzo4o"
- operación rápida de garita;
- consulta de autorizaciones activas;
- registro de ingreso;
- registro de salida;
- registro de deniedAccess;
- registro de incidentes;
- registro de entregas;
- consulta de eventos recientes del gate o turno.
```

Regla:

```text id="cr02wf"
Guard API no es pública; requiere autenticación, tenant context y permisos de guardia.
```

---

### 15.5. `/me` API

Responsabilidad:

```text id="tbpcfe"
- residente crea visitante propio;
- residente crea autorización para unidad propia;
- residente consulta autorizaciones propias;
- residente cancela autorizaciones propias futuras;
- residente consulta eventos propios limitados.
```

Reglas:

```text id="i36ju0"
- Solo recursos propios.
- Resolver propiedad por UserProfile -> Person -> PropertyUnit.
- No exponer visitantes de otras unidades.
- No exponer notas internas.
- No exponer guardia completo salvo política explícita.
- No permitir check-in/check-out desde /me.
- No permitir exportaciones masivas desde /me.
```

---

### 15.6. Public API prohibida

No implementar:

```text id="oabkhf"
/api/v1/public/access-*
/api/v1/public/tenants/{slug}/access-*
```

Respuesta:

```http id="aw79yf"
404 Not Found
```

---

## 16. Campos prohibidos en DTOs externos

Todo DTO externo debe rechazar:

```text id="hwzpju"
tenantId
createdBy
updatedBy
authorizedBy
checkedInBy
checkedOutBy
recordedBy
cancelledBy
revokedBy
archivedBy
status directo fuera de endpoint de transición
identificationNumberRaw en responses generales
plateRaw en responses generales
fullDocumentImage
storageKey
signedUrl
base64
rawFilePayload
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
paymentId
paymentOrderId
supplierPaymentOrderId
journalEntryId
bankTransactionId
externalAiEnabled
```

---

## 17. Estrategia de integración con Residents and Properties

### 17.1. Puerto

Crear puerto:

```typescript id="glaemj"
export interface AccessResidentsPropertiesPort {
  validatePropertyUnit(input: ValidateAccessPropertyUnitInput): Promise<ValidatedPropertyUnitResult>;
  validatePerson(input: ValidateAccessPersonInput): Promise<ValidatedPersonResult>;
  resolveOwnUnits(input: ResolveOwnAccessUnitsInput): Promise<OwnAccessUnitResult[]>;
  validateUserCanOperateUnit(input: ValidateUserCanOperateUnitInput): Promise<void>;
}
```

---

### 17.2. Validaciones

```text id="ga52j4"
- propertyUnitId pertenece al tenant.
- personId pertenece al tenant.
- UserProfile está vinculado a Person.
- Person está vinculado a PropertyUnit.
- Resident solo opera unidades propias.
- PropertyOwner opera solo si tenant policy lo permite.
```

---

## 18. Estrategia de integración con Notifications

### 18.1. Puerto

```typescript id="g8rc6h"
export interface AccessNotificationsPort {
  notifyVisitorArrived(input: NotifyVisitorArrivedInput): Promise<void>;
  notifyAuthorizationCreated(input: NotifyAuthorizationCreatedInput): Promise<void>;
  notifyAuthorizationCancelled(input: NotifyAuthorizationCancelledInput): Promise<void>;
  notifyIncidentCreated(input: NotifyAccessIncidentInput): Promise<void>;
  notifyDeliveryReceived(input: NotifyDeliveryReceivedInput): Promise<void>;
}
```

---

### 18.2. Reglas

```text id="mxncb3"
- Las notificaciones deben minimizar datos.
- No incluir identificación completa.
- No incluir placa completa.
- No incluir accessPassCode completo salvo canal seguro y configuración explícita.
- Si falla notificación, no debe romper necesariamente check-in salvo política estricta.
- Fallas se loggean de forma sanitizada.
```

---

## 19. Estrategia de integración con Secure Document Storage

### 19.1. Puerto

```typescript id="c7i89o"
export interface AccessDocumentStoragePort {
  validateDocumentBelongsToTenant(input: ValidateAccessDocumentInput): Promise<void>;
  getDownloadAvailability(input: AccessDocumentDownloadAvailabilityInput): Promise<AccessDocumentAvailabilityResult>;
  createReportExport(input: CreateAccessReportExportInput): Promise<AccessReportExportResult>;
}
```

---

### 19.2. Metadata recomendada

```text id="gwgkst"
sourceModule = accessControlVisitors
sourceResourceType = accessDocument | accessIncidentDocument | accessReportExport
visibility = administrative | ownLimited
sensitivity = internal | restricted
```

---

### 19.3. Reglas

```text id="q1ueu6"
- No storageKey en API.
- No signedUrl persistente en API.
- No base64 en JSON.
- No binarios en logs.
- No documentos reales enviados a IA externa.
- Descargas sensibles auditadas.
```

---

## 20. Estrategia de integración con Supplier Payments

### 20.1. Puerto

```typescript id="ll2t10"
export interface AccessSupplierPaymentsPort {
  validateSupplier(input: ValidateAccessSupplierInput): Promise<ValidatedAccessSupplierResult>;
  getSupplierSummary(input: GetAccessSupplierSummaryInput): Promise<AccessSupplierSummary>;
}
```

---

### 20.2. Reglas

```text id="g05iri"
- supplierId debe pertenecer al tenant.
- supplier debe estar active.
- supplier blocked se rechaza salvo override administrativo auditado.
- Access Control no crea SupplierPayable.
- Access Control no crea SupplierPaymentOrder.
- Access Control no crea Payment.
- Access Control no modifica cuenta bancaria de proveedor.
```

---

## 21. Estrategia de integración con Maintenance Work Orders

### 21.1. Puerto

```typescript id="rte4th"
export interface AccessMaintenanceWorkOrdersPort {
  validateWorkOrder(input: ValidateAccessWorkOrderInput): Promise<ValidatedAccessWorkOrderResult>;
  getWorkOrderSummary(input: GetAccessWorkOrderSummaryInput): Promise<AccessWorkOrderSummary>;
}
```

---

### 21.2. Reglas

```text id="y9jcey"
- maintenanceWorkOrderId debe pertenecer al tenant.
- workOrder no debe estar archived.
- supplier visit puede vincularse a workOrder.
- Access Control no modifica estados de workOrder.
- Access Control no crea costos de mantenimiento.
- Access Control no crea payables.
```

---

## 22. Seguridad técnica

### 22.1. Guards

```text id="pl28yw"
AuthGuard
TenantGuard
PermissionGuard
OwnAccessAuthorizationGuard
OwnAccessVisitorGuard
OwnAccessEventGuard
GuardOperationGuard
AccessVisitorTenantGuard
AccessVehicleTenantGuard
AccessGateTenantGuard
AccessAuthorizationTenantGuard
AccessPassTenantGuard
AccessEventTenantGuard
AccessCheckInTenantGuard
AccessCheckOutTenantGuard
AccessIncidentTenantGuard
AccessDocumentTenantGuard
```

---

### 22.2. Reglas

```text id="v4rg8r"
- tenantId no se recibe desde cliente.
- actor se resuelve server-side.
- status se modifica solo por endpoints de transición.
- datos raw se procesan y minimizan.
- identificación se enmascara.
- placa se enmascara.
- access pass se hashea.
- no endpoints públicos.
- no WordPress access.
- no biometría.
- no reconocimiento facial.
- no gate opening.
- no external AI real data.
```

---

## 23. Auditoría

Eventos mínimos:

```text id="v6fjqu"
accessVisitor.created
accessVisitor.updated
accessVisitor.watchlisted
accessVisitor.blocked
accessVisitor.archived

accessVehicle.created
accessVehicle.updated
accessVehicle.blocked
accessVehicle.archived

accessGate.created
accessGate.updated
accessGate.archived

accessAuthorization.created
accessAuthorization.activated
accessAuthorization.cancelled
accessAuthorization.revoked
accessAuthorization.expired
accessAuthorization.used

accessPass.created
accessPass.used
accessPass.expired
accessPass.revoked

accessCheckIn.recorded
accessCheckIn.voided
accessCheckOut.recorded
accessCheckOut.voided

accessEvent.recorded
accessEvent.corrected
accessEvent.voided

accessDelivery.created
accessDelivery.received
accessDelivery.delivered
accessDelivery.returned

accessSupplierVisit.created
accessSupplierVisit.checkedIn
accessSupplierVisit.checkedOut
accessSupplierVisit.cancelled
accessSupplierVisit.denied

accessIncident.created
accessIncident.updated
accessIncident.resolved
accessIncident.dismissed

accessReport.generated
accessReport.exported
```

Metadata permitida:

```text id="c5s2qq"
visitorId
vehicleId
authorizationId
accessPassId
eventId
checkInId
checkOutId
propertyUnitId
gateId
visitorType
authorizationType
eventType
eventStatus
incidentSeverity
incidentStatus
supplierId
maintenanceWorkOrderId
reportType
format
traceId
```

Metadata prohibida:

```text id="mqviem"
identificationNumberRaw
plateRaw
accessPassCodeRaw
storageKey
signedUrl
base64
biometricTemplate
faceEmbedding
cameraStreamUrl
tokens
secrets
passwords
raw file payload
datos cross-tenant
```

---

## 24. Observabilidad

### 24.1. Logs

Eventos loggeables:

```text id="wmwb1n"
accessAuthorization.created
accessAuthorization.cancelled
accessCheckIn.recorded
accessCheckOut.recorded
accessDenied.recorded
accessIncident.created
accessReport.exported
```

Campos permitidos:

```text id="rhvqs8"
traceId
requestId
correlationId
action
outcome
eventType
authorizationType
visitorType
gateType
incidentSeverity
reportType
durationMs
errorCode
```

Campos prohibidos:

```text id="z0lx8z"
tenantId como label de alta cardinalidad
visitorId como label
vehicleId como label
personId como label
propertyUnitId como label
identificationNumberRaw
plateRaw
accessPassCodeRaw
storageKey
signedUrl
base64
faceEmbedding
biometricTemplate
raw payload
```

---

### 24.2. Métricas

Métricas recomendadas:

```text id="qxqaab"
access_authorizations_total
access_authorizations_active_total
access_checkins_total
access_checkouts_total
access_denied_total
access_open_checkins_total
access_incidents_total
access_reports_exported_total
```

Labels permitidos:

```text id="j7fbrd"
eventType
authorizationType
visitorType
gateType
incidentSeverity
status
outcome
reportType
```

Labels prohibidos:

```text id="dm156k"
tenantId
visitorId
vehicleId
propertyUnitId
personId
identificationNumber
plate
traceId
```

---

## 25. Reportes técnicos MVP

### 25.1. Ingresos y salidas

```text id="h9s66c"
Muestra eventos de check-in y check-out por periodo, gate, unidad, visitante enmascarado, vehículo enmascarado y estado.
```

---

### 25.2. Visitantes por unidad

```text id="dzisne"
Muestra visitantes y accesos relacionados con una unidad, con datos personales minimizados.
```

---

### 25.3. Autorizaciones

```text id="kcn6zv"
Muestra autorizaciones por tipo, estado, unidad, autorizador y periodo.
```

---

### 25.4. Incidentes

```text id="arhcyt"
Muestra incidentes por severidad, estado, gate, unidad, periodo y responsable de resolución.
```

---

### 25.5. Check-ins abiertos

```text id="r2k6iv"
Muestra ingresos sin salida registrada para control operativo.
```

---

### 25.6. Exportaciones

```text id="x7c1yb"
Toda exportación debe crear AccessReportExport y secureDocumentId mediante Secure Document Storage.
```

---

## 26. OpenAPI

### 26.1. Tags

```text id="kf994d"
Access Visitors
Access Visitor Vehicles
Access Gates
Access Authorizations
Access Passes
Access Events
Access Check Ins
Access Check Outs
Access Deliveries
Access Supplier Visits
Access Incidents
Access Comments
Access Documents
Access Reports
Guard Access
Me Access
```

---

### 26.2. Extensions

Todas las rutas privadas:

```yaml id="bdvcqu"
x-tenant-scope: true
x-auth-required: true
x-access-control-visitors: true
x-public-exposure: false
x-wordpress-access: false
```

Rutas `/me`:

```yaml id="z986wc"
x-own-resource-scope: true
x-resident-visible: true
x-admin-only: false
```

Rutas de guardia:

```yaml id="we4hry"
x-guard-operated: true
x-public-exposure: false
```

Restricciones globales:

```yaml id="hs1vx7"
x-biometric-processing: false
x-face-recognition: false
x-gate-opening: false
x-hardware-control: false
x-external-ai-real-data: false
```

Rutas documentales:

```yaml id="jb34rc"
x-secure-document-storage: true
x-storage-key-exposed: false
```

---

## 27. Feature flags

```text id="be1iuj"
ACCESS_CONTROL_VISITORS_ENABLED=true
ACCESS_CONTROL_ME_AUTHORIZATIONS_ENABLED=true
ACCESS_CONTROL_GUARD_API_ENABLED=true
ACCESS_CONTROL_PUBLIC_ENDPOINTS_ENABLED=false
ACCESS_CONTROL_WORDPRESS_ACCESS_ENABLED=false
ACCESS_CONTROL_GATE_OPENING_ENABLED=false
ACCESS_CONTROL_HARDWARE_CONTROL_ENABLED=false
ACCESS_CONTROL_FACE_RECOGNITION_ENABLED=false
ACCESS_CONTROL_BIOMETRIC_PROCESSING_ENABLED=false
ACCESS_CONTROL_PLATE_OCR_ENABLED=false
ACCESS_CONTROL_EXTERNAL_AI_ENABLED=false
ACCESS_CONTROL_REPORT_EXPORT_ENABLED=true
ACCESS_CONTROL_NOTIFICATIONS_ENABLED=true
ACCESS_CONTROL_SUPPLIER_VISITS_ENABLED=true
ACCESS_CONTROL_MAINTENANCE_LINK_ENABLED=true
ACCESS_CONTROL_MAX_REPORT_PAGE_SIZE=100
```

Regla:

```text id="yh7ib1"
El boot o CI debe fallar si se habilitan public endpoints, WordPress access, gate opening, hardware control, face recognition, biometric processing, plate OCR o external AI en MVP sin ADR explícito.
```

---

## 28. Variables de entorno recomendadas

```text id="dip2vg"
ACCESS_CONTROL_VISITORS_ENABLED=true
ACCESS_CONTROL_ME_AUTHORIZATIONS_ENABLED=true
ACCESS_CONTROL_GUARD_API_ENABLED=true
ACCESS_CONTROL_PUBLIC_ENDPOINTS_ENABLED=false
ACCESS_CONTROL_WORDPRESS_ACCESS_ENABLED=false
ACCESS_CONTROL_GATE_OPENING_ENABLED=false
ACCESS_CONTROL_HARDWARE_CONTROL_ENABLED=false
ACCESS_CONTROL_FACE_RECOGNITION_ENABLED=false
ACCESS_CONTROL_BIOMETRIC_PROCESSING_ENABLED=false
ACCESS_CONTROL_PLATE_OCR_ENABLED=false
ACCESS_CONTROL_EXTERNAL_AI_ENABLED=false
ACCESS_CONTROL_REPORT_EXPORT_ENABLED=true
ACCESS_CONTROL_NOTIFICATIONS_ENABLED=true
ACCESS_CONTROL_SUPPLIER_VISITS_ENABLED=true
ACCESS_CONTROL_MAINTENANCE_LINK_ENABLED=true
ACCESS_CONTROL_MAX_REPORT_PAGE_SIZE=100
ACCESS_CONTROL_PASS_TTL_MINUTES=1440
ACCESS_CONTROL_HASH_PEPPER_SECRET=<secret-managed-outside-code>
```

Reglas:

```text id="z9q15o"
- HASH_PEPPER_SECRET no debe estar hardcodeado.
- No debe loggearse.
- Debe manejarse por secret manager o variable segura por ambiente.
```

---

## 29. Estrategia de implementación

### 29.1. Fase 1 — Foundation

```text id="ohcpq4"
1. Crear estructura del módulo.
2. Registrar AccessControlVisitorsModule.
3. Crear configuración.
4. Crear feature flags.
5. Crear enums.
6. Crear errores de dominio.
7. Crear helpers de masking.
8. Crear helpers de hashing.
9. Crear policies base.
```

---

### 29.2. Fase 2 — Modelo de datos

```text id="fhqgp7"
1. Crear Prisma enums.
2. Crear Prisma models.
3. Crear migración 024.
4. Crear índices tenant-scoped.
5. Crear constraints.
6. Crear relaciones con Tenant.
7. Crear seeds mínimos de gates.
```

---

### 29.3. Fase 3 — Visitantes, vehículos y gates

```text id="fl0u0u"
1. Implementar VisitorProfile.
2. Implementar VisitorVehicle.
3. Implementar AccessGate.
4. Implementar enmascaramiento.
5. Implementar hash de búsqueda.
6. Implementar watchlist/block local tenant.
7. Implementar auditoría.
```

---

### 29.4. Fase 4 — Autorizaciones y pases

```text id="znqsot"
1. Implementar AccessAuthorization.
2. Implementar AccessPass.
3. Implementar autorización administrativa.
4. Implementar autorización /me para unidad propia.
5. Implementar cancel/revoke.
6. Implementar expiración.
7. Implementar validación de pass.
```

---

### 29.5. Fase 5 — Check-in, check-out y eventos

```text id="qmtdir"
1. Implementar AccessEvent.
2. Implementar AccessCheckIn.
3. Implementar AccessCheckOut.
4. Implementar check-in con autorización.
5. Implementar check-in manual.
6. Implementar deniedAccess.
7. Implementar check-out.
8. Implementar void/correct con auditoría.
```

---

### 29.6. Fase 6 — Guard API

```text id="vti4q6"
1. Implementar consulta de autorizaciones activas.
2. Implementar check-in rápido.
3. Implementar check-out rápido.
4. Implementar eventos recientes.
5. Implementar incidentes desde garita.
6. Implementar entregas desde garita.
```

---

### 29.7. Fase 7 — `/me` API

```text id="so5fc6"
1. Implementar own visitors.
2. Implementar own authorizations.
3. Implementar own cancel authorization.
4. Implementar own access events limited.
5. Probar own scope.
6. Probar no leaks internos.
```

---

### 29.8. Fase 8 — Entregas, proveedores e incidentes

```text id="z2u8de"
1. Implementar VisitorDelivery.
2. Implementar VisitorSupplierVisit.
3. Integrar Supplier Payments por puerto.
4. Integrar Maintenance Work Orders por puerto.
5. Implementar AccessIncident.
6. Implementar notificaciones de incidentes críticos.
```

---

### 29.9. Fase 9 — Documentos, reportes y exportaciones

```text id="y9vbuc"
1. Implementar AccessDocument.
2. Integrar Secure Document Storage.
3. Implementar reportes.
4. Implementar exports.
5. Probar no storageKey.
6. Auditar exportaciones.
```

---

### 29.10. Fase 10 — Seguridad, observabilidad y OpenAPI

```text id="ntl5sk"
1. Implementar audit completo.
2. Implementar logs sanitizados.
3. Implementar métricas.
4. Implementar OpenAPI.
5. Ejecutar security tests.
6. Ejecutar multitenancy tests.
7. Ejecutar privacy tests.
8. Ejecutar CI gates.
```

---

## 30. Seeds iniciales

Access gates sugeridos:

```text id="ol4z7o"
MAIN_GATE — Garita principal
VEHICLE_GATE — Entrada vehicular
PEDESTRIAN_GATE — Entrada peatonal
SUPPLIER_GATE — Acceso proveedores
SECONDARY_GATE — Acceso secundario
```

Visitor types sugeridos:

```text id="ncu7b9"
guest
family
delivery
supplier
technician
serviceWorker
administrative
other
```

Regla:

```text id="ee936p"
Los seeds deben usar datos ficticios y no deben incluir visitantes reales, identificaciones reales, placas reales, teléfonos reales ni documentos reales.
```

---

## 31. Errores de dominio

Catálogo preliminar:

```text id="r2z07i"
ACCESS_VISITOR_NOT_FOUND
ACCESS_VISITOR_INVALID_STATUS
ACCESS_VISITOR_BLOCKED
ACCESS_VISITOR_ARCHIVED
ACCESS_VISITOR_CROSS_TENANT_REFERENCE

ACCESS_VEHICLE_NOT_FOUND
ACCESS_VEHICLE_INVALID_STATUS
ACCESS_VEHICLE_BLOCKED
ACCESS_VEHICLE_ARCHIVED
ACCESS_VEHICLE_CROSS_TENANT_REFERENCE

ACCESS_GATE_NOT_FOUND
ACCESS_GATE_INACTIVE
ACCESS_GATE_ARCHIVED
ACCESS_GATE_CROSS_TENANT_REFERENCE

ACCESS_AUTHORIZATION_NOT_FOUND
ACCESS_AUTHORIZATION_INVALID_STATUS
ACCESS_AUTHORIZATION_EXPIRED
ACCESS_AUTHORIZATION_CANCELLED
ACCESS_AUTHORIZATION_REVOKED
ACCESS_AUTHORIZATION_USED
ACCESS_AUTHORIZATION_INVALID_VALIDITY_WINDOW
ACCESS_AUTHORIZATION_OWN_UNIT_REQUIRED
ACCESS_AUTHORIZATION_MAX_ENTRIES_EXCEEDED

ACCESS_PASS_NOT_FOUND
ACCESS_PASS_INVALID
ACCESS_PASS_EXPIRED
ACCESS_PASS_USED
ACCESS_PASS_REVOKED

ACCESS_EVENT_NOT_FOUND
ACCESS_EVENT_INVALID_STATUS
ACCESS_EVENT_VOID_REASON_REQUIRED

ACCESS_CHECK_IN_NOT_FOUND
ACCESS_CHECK_IN_ALREADY_CLOSED
ACCESS_CHECK_IN_INVALID_STATUS
ACCESS_CHECK_IN_MANUAL_REASON_REQUIRED

ACCESS_CHECK_OUT_NOT_FOUND
ACCESS_CHECK_OUT_DUPLICATE
ACCESS_CHECK_OUT_MANUAL_REASON_REQUIRED

ACCESS_DELIVERY_NOT_FOUND
ACCESS_DELIVERY_INVALID_STATUS
ACCESS_DELIVERY_UNIT_REQUIRED

ACCESS_SUPPLIER_VISIT_NOT_FOUND
ACCESS_SUPPLIER_INVALID
ACCESS_SUPPLIER_BLOCKED
ACCESS_SUPPLIER_CROSS_TENANT_REFERENCE

ACCESS_INCIDENT_NOT_FOUND
ACCESS_INCIDENT_INVALID_STATUS
ACCESS_INCIDENT_RESOLUTION_REASON_REQUIRED
ACCESS_INCIDENT_DISMISS_REASON_REQUIRED

ACCESS_DOCUMENT_NOT_FOUND
ACCESS_DOCUMENT_STORAGE_KEY_FORBIDDEN
ACCESS_DOCUMENT_CROSS_TENANT_REFERENCE

ACCESS_PUBLIC_ENDPOINT_FORBIDDEN
ACCESS_WORDPRESS_ACCESS_FORBIDDEN
ACCESS_BIOMETRIC_PROCESSING_FORBIDDEN
ACCESS_FACE_RECOGNITION_FORBIDDEN
ACCESS_GATE_OPENING_FORBIDDEN
ACCESS_HARDWARE_CONTROL_FORBIDDEN
ACCESS_EXTERNAL_AI_FORBIDDEN
```

---

## 32. Testing plan resumido

El test plan detallado se desarrollará en:

```text id="fy2ko0"
docs/specs/024-access-control-visitors/test-plan.md
```

Cobertura mínima:

```text id="y715oz"
- Value objects.
- Masking helpers.
- Hashing helpers.
- Entities.
- State machines.
- Policies.
- Repositories.
- Services.
- API tenant.
- Guard API.
- /me API.
- Authz.
- Own-resource.
- Multitenancy.
- Privacy.
- Forbidden fields.
- No public.
- No WordPress.
- No biometrics.
- No face recognition.
- No gate opening.
- SDS boundary.
- Supplier boundary.
- Maintenance boundary.
- Notifications sanitization.
- Audit.
- Observability.
- OpenAPI.
- Reports.
- Exports.
- Smoke flows.
```

Tests críticos:

```text id="o3vjzs"
- tenantA no accede visitantes tenantB.
- residentA no ve visitantes de unidad ajena.
- guardA no opera tenantB.
- DTO rechaza tenantId.
- DTO rechaza actor fields.
- DTO rechaza identificationNumberRaw en response general.
- DTO rechaza storageKey.
- check-in crea AccessEvent.
- check-out cierra check-in abierto.
- check-out duplicado falla.
- autorización expirada no permite ingreso.
- autorización cancelled/revoked no permite ingreso.
- AccessPass oneTime no se reutiliza.
- no endpoints públicos.
- no WordPress access.
- no biometricTemplate.
- no faceEmbedding.
- no gateOpenCommand.
- export usa SDS y no expone storageKey.
```

---

## 33. Performance

Objetivos iniciales:

```text id="l698vd"
p95 < 800 ms para consultar autorizaciones activas.
p95 < 1000 ms para registrar check-in.
p95 < 1000 ms para registrar check-out.
p95 < 1200 ms para listar eventos paginados.
p95 < 1500 ms para reportes paginados simples.
p95 < 3000 ms para exportación pequeña.
```

Controles:

```text id="xl9k5k"
- pageSize máximo 100.
- Índices por tenant/status/date/gate/unit/visitor.
- DTOs list-item livianos.
- No N+1.
- Búsqueda por hashes indexados.
- Exports pesados vía job futuro.
```

---

## 34. Índices recomendados

```text id="xj29pp"
visitor_profiles:
  tenant_id, status
  tenant_id, full_name
  tenant_id, identification_number_hash
  tenant_id, phone_hash

visitor_vehicles:
  tenant_id, status
  tenant_id, plate_hash
  tenant_id, visitor_id

access_gates:
  tenant_id, gate_code unique active
  tenant_id, status

access_authorizations:
  tenant_id, authorization_number unique
  tenant_id, visitor_id
  tenant_id, property_unit_id
  tenant_id, authorized_by_user_id
  tenant_id, status
  tenant_id, valid_from, valid_until
  tenant_id, authorization_type

access_passes:
  tenant_id, access_pass_code_hash
  tenant_id, authorization_id
  tenant_id, status
  tenant_id, expires_at

access_events:
  tenant_id, event_number unique
  tenant_id, event_type
  tenant_id, event_status
  tenant_id, occurred_at
  tenant_id, visitor_id
  tenant_id, vehicle_id
  tenant_id, property_unit_id
  tenant_id, gate_id
  tenant_id, recorded_by_user_id

access_check_ins:
  tenant_id, visitor_id
  tenant_id, property_unit_id
  tenant_id, gate_id
  tenant_id, status
  tenant_id, checked_in_at

access_check_outs:
  tenant_id, check_in_id unique active
  tenant_id, visitor_id
  tenant_id, gate_id
  tenant_id, checked_out_at

visitor_deliveries:
  tenant_id, property_unit_id
  tenant_id, visitor_id
  tenant_id, status
  tenant_id, received_at

visitor_supplier_visits:
  tenant_id, supplier_id
  tenant_id, maintenance_work_order_id
  tenant_id, visitor_id
  tenant_id, status

access_incidents:
  tenant_id, severity
  tenant_id, status
  tenant_id, gate_id
  tenant_id, property_unit_id
  tenant_id, created_at

access_documents:
  tenant_id, entity_type, entity_id
  tenant_id, secure_document_id

access_report_exports:
  tenant_id, report_type
  tenant_id, status
  tenant_id, created_at
```

---

## 35. Riesgos técnicos

| Riesgo                            | Mitigación                                             |
| --------------------------------- | ------------------------------------------------------ |
| Exposición de datos personales    | Enmascaramiento, minimización, permisos y DTOs seguros |
| Residente ve otra unidad          | OwnResourcePolicy y tests `/me`                        |
| Guardia opera otro tenant         | TenantGuard + permisos + tests cross-tenant            |
| Reutilización de pase temporal    | AccessPass status + hash + oneTime policy              |
| Check-out duplicado               | constraint único + state machine                       |
| Evento manipulado                 | eventos inmutables, correct/void auditados             |
| Placa o identificación en logs    | log sanitizer + tests                                  |
| Uso de biometría por accidente    | flags false + DTO denylist + CI gates                  |
| Apertura de portón accidental     | NoGateOpeningPolicy + feature flag false               |
| WordPress accede a datos privados | no public endpoints + CORS restrictivo                 |
| Reportes masivos sensibles        | pageSize max + permisos + SDS + audit                  |
| Lista negra global indebida       | watchlist/block local por tenant                       |

---

## 36. Plan de PRs sugerido

```text id="u4rrz1"
PR-024-01 — Module skeleton, config, feature flags and enums.
PR-024-02 — Masking, hashing, value objects, entities and policies.
PR-024-03 — Prisma schema, migration, constraints and indexes.
PR-024-04 — Repository ports and Prisma repositories.
PR-024-05 — DTOs, guards and authorization.
PR-024-06 — Visitors, vehicles and gates.
PR-024-07 — Authorizations and access passes.
PR-024-08 — Check-in, check-out and access events.
PR-024-09 — Guard API.
PR-024-10 — /me resident API.
PR-024-11 — Deliveries, supplier visits and maintenance links.
PR-024-12 — Incidents, comments and notifications.
PR-024-13 — Documents via Secure Document Storage.
PR-024-14 — Reports and exports.
PR-024-15 — Audit, observability and OpenAPI.
PR-024-16 — Security hardening, privacy tests and CI gates.
PR-024-17 — Seeds, performance, concurrency and smoke tests.
```

---

## 37. Smoke flow técnico

### 37.1. Resident preautoriza visitante

```text id="pub5ip"
1. Resident inicia sesión.
2. Sistema resuelve UserProfile.
3. Sistema resuelve Person.
4. Sistema resuelve unidades propias.
5. Resident crea VisitorProfile propio o reutiliza uno permitido.
6. Resident crea AccessAuthorization para unidad propia.
7. Sistema genera authorizationNumber.
8. Sistema crea AccessPass si aplica.
9. Sistema audita accessAuthorization.created.
10. Resident consulta autorización propia.
```

---

### 37.2. Guardia registra ingreso autorizado

```text id="k0vsku"
1. Guard inicia sesión.
2. Guard consulta autorizaciones activas.
3. Sistema valida tenant y permisos.
4. Guard registra check-in.
5. Sistema valida autorización vigente.
6. Sistema valida AccessPass si aplica.
7. Sistema crea AccessEvent checkIn.
8. Sistema crea AccessCheckIn open.
9. Sistema marca AccessPass used si oneTime.
10. Sistema audita accessCheckIn.recorded.
```

---

### 37.3. Guardia registra salida

```text id="hkz76k"
1. Guard busca check-in abierto.
2. Sistema valida tenant.
3. Guard registra check-out.
4. Sistema crea AccessEvent checkOut.
5. Sistema crea AccessCheckOut.
6. Sistema cierra AccessCheckIn.
7. Sistema audita accessCheckOut.recorded.
```

---

### 37.4. Ingreso no autorizado

```text id="mcc2pt"
1. Visitante llega sin autorización vigente.
2. Guard busca visitante o crea registro mínimo.
3. Sistema detecta ausencia de autorización.
4. Guard registra deniedAccess o manualReview.
5. Sistema crea AccessEvent deniedAccess.
6. Sistema registra incidente si aplica.
7. Sistema audita accessEvent.recorded.
```

---

### 37.5. Incidente y exportación

```text id="fgs4m1"
1. Guard registra AccessIncident.
2. SecurityManager revisa incidente.
3. SecurityManager resuelve incidente con razón.
4. TenantAdmin consulta reporte de incidentes.
5. TenantAdmin exporta reporte.
6. Sistema crea AccessReportExport.
7. Sistema crea secureDocumentId vía SDS.
8. Response no incluye storageKey.
9. Sistema audita accessReport.exported.
```

---

## 38. Definition of Done técnico

```text id="e8vtqy"
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md creado.
[ ] api-contract.md creado.
[ ] test-plan.md creado.
[ ] tasks.md creado.
[ ] security-notes.md creado.
[ ] Módulo NestJS registrado.
[ ] Configuración implementada.
[ ] Feature flags implementadas.
[ ] Enums implementados.
[ ] Errores implementados.
[ ] Masking helpers implementados.
[ ] Hashing helpers implementados.
[ ] Value objects implementados.
[ ] Entities implementadas.
[ ] Policies implementadas.
[ ] Prisma schema implementado.
[ ] Migración implementada.
[ ] Repositorios implementados.
[ ] DTOs implementados.
[ ] Guards implementados.
[ ] Tenant Admin API implementada.
[ ] Guard API implementada.
[ ] /me API implementada.
[ ] VisitorProfile implementado.
[ ] VisitorVehicle implementado.
[ ] AccessGate implementado.
[ ] AccessAuthorization implementado.
[ ] AccessPass implementado.
[ ] AccessEvent implementado.
[ ] AccessCheckIn implementado.
[ ] AccessCheckOut implementado.
[ ] VisitorDelivery implementado.
[ ] VisitorSupplierVisit implementado.
[ ] VisitorRecurringAuthorization implementado.
[ ] AccessIncident implementado.
[ ] AccessComment implementado.
[ ] AccessDocument implementado.
[ ] AccessReportExport implementado.
[ ] Integración Residents/Properties implementada.
[ ] Integración Notifications implementada.
[ ] Integración SDS implementada.
[ ] Integración Supplier Payments implementada como boundary.
[ ] Integración Maintenance Work Orders implementada como boundary.
[ ] Auditoría implementada.
[ ] Observabilidad implementada.
[ ] OpenAPI implementado.
[ ] Reportes implementados.
[ ] Exportaciones implementadas.
[ ] Tests unitarios pasan.
[ ] Tests integración pasan.
[ ] Tests API pasan.
[ ] Tests /me own pasan.
[ ] Tests guard pasan.
[ ] Tests multitenancy pasan.
[ ] Tests privacy pasan.
[ ] Tests security pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

## 39. No aceptación técnica

No se acepta implementación si:

```text id="uxp8qu"
- permite visitantes cross-tenant;
- permite vehículos cross-tenant;
- permite gates cross-tenant;
- permite autorizaciones cross-tenant;
- permite pases cross-tenant;
- permite eventos cross-tenant;
- permite check-ins cross-tenant;
- permite check-outs cross-tenant;
- permite entregas cross-tenant;
- permite supplier visits cross-tenant;
- permite incidentes cross-tenant;
- permite documentos cross-tenant;
- permite reportes cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta status directo fuera de transición;
- expone identificación completa por defecto;
- expone placa completa por defecto;
- expone accessPassCode completo de forma persistente;
- almacena storageKey;
- devuelve storageKey;
- acepta base64;
- acepta rawFilePayload;
- registra biometricTemplate;
- registra faceEmbedding;
- implementa reconocimiento facial;
- implementa biometría;
- implementa cameraStreamUrl;
- implementa gateOpenCommand;
- controla hardware físico;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- permite que residente vea otra unidad;
- permite que guardia exporte datos masivos sin permiso;
- permite reutilizar AccessPass oneTime;
- permite check-out doble activo;
- permite borrar físicamente eventos críticos;
- omite audit de check-in;
- omite audit de check-out;
- omite audit de cancelación/revocación;
- exporta reportes sin SDS;
- envía datos reales a IA externa.
```

---

## 40. Resultado esperado

Al implementar este plan, el módulo `024-access-control-visitors` quedará preparado para controlar visitantes, autorizaciones, accesos, salidas, entregas, proveedores visitantes, incidentes y reportes de seguridad de forma tenant-scoped, privada, auditable y extensible.

Resultado esperado:

```text id="n65prb"
module foundation definida
estructura NestJS definida
entidades definidas
value objects definidos
policies definidas
state machines definidas
modelo de datos planificado
Tenant Admin API planificada
Guard API planificada
/me API planificada
public API prohibida
privacy masking planificado
secure hashing planificado
visitor management planificado
vehicle management planificado
gate management planificado
authorization management planificado
access pass management planificado
check-in planificado
check-out planificado
event tracking planificado
delivery tracking planificado
supplier visit tracking planificado
incident tracking planificado
SDS integration planificada
Notifications integration planificada
Residents/Properties integration planificada
Supplier Payments boundary planificado
Maintenance Work Orders boundary planificado
audit planificado
observability planificada
reports planificados
exports planificados
no WordPress access
no biometric processing
no face recognition
no gate opening
no hardware control
no external AI with real data
DoD definido
PR plan definido
```

---

## 41. Expediente actualizado

```text id="xl2iag"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 001-tenants/
│   │   ├── 002-users-roles/
│   │   ├── 003-residents-properties/
│   │   ├── 004-dues-fees/
│   │   ├── 005-payments/
│   │   ├── 006-account-statements/
│   │   ├── 007-audit/
│   │   ├── 008-basic-reports/
│   │   ├── 009-wordpress-integration-basic/
│   │   ├── 010-reservations-common-areas/
│   │   ├── 011-fines-sanctions/
│   │   ├── 012-communications-notifications/
│   │   ├── 013-meetings-attendance/
│   │   ├── 014-voting-basic/
│   │   ├── 015-certified-minutes/
│   │   ├── 016-secure-document-storage/
│   │   ├── 017-bank-reconciliation/
│   │   ├── 018-payment-provider-integration/
│   │   ├── 019-open-banking-integration/
│   │   ├── 020-accounting-ledger/
│   │   ├── 021-supplier-payments/
│   │   ├── 022-maintenance-work-orders/
│   │   ├── 023-inventory-basic/
│   │   └── 024-access-control-visitors/
│   │       ├── spec.md
│   │       └── plan.md
```
