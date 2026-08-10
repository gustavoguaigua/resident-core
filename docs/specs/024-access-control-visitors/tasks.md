# Tasks — 024 Access Control and Visitors

## 1. Información del documento

| Campo           | Valor                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                             |
| Spec ID         | 024                                                                                                                                       |
| Módulo          | Access Control and Visitors                                                                                                               |
| Documento       | Tasks                                                                                                                                     |
| Ruta            | `docs/specs/024-access-control-visitors/tasks.md`                                                                                         |
| Versión         | 0.1                                                                                                                                       |
| Estado          | needs-review                                                                                                                              |
| Fecha           | 2026-07-30                                                                                                                                |
| Documento base  | `docs/specs/024-access-control-visitors/spec.md`                                                                                          |
| Plan técnico    | `docs/specs/024-access-control-visitors/plan.md`                                                                                          |
| Modelo de datos | `docs/specs/024-access-control-visitors/data-model.md`                                                                                    |
| Contrato API    | `docs/specs/024-access-control-visitors/api-contract.md`                                                                                  |
| Plan de pruebas | `docs/specs/024-access-control-visitors/test-plan.md`                                                                                     |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                            |
| Naturaleza      | Tenant-scoped / Security-sensitive / Privacy-sensitive / Visitor-driven / Resident-authorized / Guard-operated / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el backlog técnico ejecutable para implementar el módulo `024-access-control-visitors`.

El objetivo es transformar la especificación funcional, el plan técnico, el modelo de datos, el contrato API y el plan de pruebas en tareas implementables por épicas, fases y pull requests.

Regla central de implementación:

```text
Access Control and Visitors debe implementarse como un módulo operativo tenant-scoped, security-sensitive, privacy-sensitive, resident-authorized, guard-operated y audit-heavy, con API tenant administrativa, API /me limitada, Guard API autenticada, enmascaramiento de datos personales, hash tenant-aware para búsquedas sensibles, documentos vía Secure Document Storage, auditoría obligatoria, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de biometría, ausencia de reconocimiento facial, ausencia de apertura automática de portones, ausencia de control físico de hardware, ausencia de OCR automático de placas, ausencia de pagos, ausencia de contabilidad, ausencia de conciliación bancaria y ausencia de IA externa con datos reales.
```

---

## 3. Convenciones de estado

```text
[ ] Pendiente
[x] Completado
[-] No aplica
[~] En progreso
[!] Bloqueado
```

---

## 4. Dependencias previas

Antes de iniciar implementación debe existir:

```text
[ ] docs/specs/024-access-control-visitors/spec.md aprobado.
[ ] docs/specs/024-access-control-visitors/plan.md aprobado.
[ ] docs/specs/024-access-control-visitors/data-model.md aprobado.
[ ] docs/specs/024-access-control-visitors/api-contract.md aprobado.
[ ] docs/specs/024-access-control-visitors/test-plan.md aprobado.
[ ] Módulo 001-tenants disponible o mockeable.
[ ] Módulo 002-users-roles disponible o mockeable.
[ ] Módulo 003-residents-properties disponible o mockeable.
[ ] Módulo 007-audit disponible o mockeable.
[ ] Módulo 008-basic-reports disponible o mockeable.
[ ] Módulo 012-communications-notifications disponible o mockeable.
[ ] Módulo 016-secure-document-storage disponible o mockeable.
[ ] Módulo 021-supplier-payments disponible o mockeable.
[ ] Módulo 022-maintenance-work-orders disponible o mockeable.
[ ] Estrategia Keycloak/Core authz vigente.
[ ] Prisma configurado.
[ ] PostgreSQL configurado.
[ ] OpenAPI pipeline disponible.
[ ] CI ejecutando tests unitarios, integración, API, security, privacy y OpenAPI gates.
```

---

# 5. EPIC-024-01 — Module foundation

## Objetivo

Crear la base técnica del módulo `access-control-visitors`.

## Tasks

```text
[ ] Crear directorio apps/api/src/modules/access-control-visitors/.
[ ] Crear AccessControlVisitorsModule.
[ ] Registrar AccessControlVisitorsModule en el módulo raíz correspondiente.
[ ] Crear estructura controllers/.
[ ] Crear estructura application/services/.
[ ] Crear estructura application/use-cases/.
[ ] Crear estructura application/ports/.
[ ] Crear estructura domain/entities/.
[ ] Crear estructura domain/value-objects/.
[ ] Crear estructura domain/events/.
[ ] Crear estructura domain/policies/.
[ ] Crear estructura domain/errors/.
[ ] Crear estructura infrastructure/persistence/.
[ ] Crear estructura infrastructure/residents-properties/.
[ ] Crear estructura infrastructure/notifications/.
[ ] Crear estructura infrastructure/documents/.
[ ] Crear estructura infrastructure/supplier-payments/.
[ ] Crear estructura infrastructure/maintenance/.
[ ] Crear estructura infrastructure/reports/.
[ ] Crear estructura infrastructure/exports/.
[ ] Crear estructura infrastructure/audit/.
[ ] Crear estructura infrastructure/observability/.
[ ] Crear estructura dto/.
[ ] Crear estructura guards/.
[ ] Crear estructura mappers/.
[ ] Crear estructura masking/.
[ ] Crear estructura hashing/.
[ ] Crear estructura tests/.
```

## Acceptance criteria

```text
[ ] El módulo compila.
[ ] El módulo está registrado.
[ ] No existen endpoints públicos.
[ ] No existe acceso desde WordPress público.
[ ] No existe dependencia directa a hardware físico.
[ ] No existe dependencia directa a biometría.
[ ] No existe dependencia directa a pagos, ledger o conciliación.
```

---

# 6. EPIC-024-02 — Configuration and feature flags

## Objetivo

Definir configuración operativa, privacy flags y flags de seguridad.

## Tasks

```text
[ ] Crear access-control-visitors.config.ts.
[ ] Crear access-control-visitors.constants.ts.
[ ] Crear access-control-visitors-feature-flags.ts.
[ ] Registrar ACCESS_CONTROL_VISITORS_ENABLED=true.
[ ] Registrar ACCESS_CONTROL_ME_AUTHORIZATIONS_ENABLED=true.
[ ] Registrar ACCESS_CONTROL_GUARD_API_ENABLED=true.
[ ] Registrar ACCESS_CONTROL_PUBLIC_ENDPOINTS_ENABLED=false.
[ ] Registrar ACCESS_CONTROL_WORDPRESS_ACCESS_ENABLED=false.
[ ] Registrar ACCESS_CONTROL_GATE_OPENING_ENABLED=false.
[ ] Registrar ACCESS_CONTROL_HARDWARE_CONTROL_ENABLED=false.
[ ] Registrar ACCESS_CONTROL_FACE_RECOGNITION_ENABLED=false.
[ ] Registrar ACCESS_CONTROL_BIOMETRIC_PROCESSING_ENABLED=false.
[ ] Registrar ACCESS_CONTROL_PLATE_OCR_ENABLED=false.
[ ] Registrar ACCESS_CONTROL_EXTERNAL_AI_ENABLED=false.
[ ] Registrar ACCESS_CONTROL_REPORT_EXPORT_ENABLED=true.
[ ] Registrar ACCESS_CONTROL_NOTIFICATIONS_ENABLED=true.
[ ] Registrar ACCESS_CONTROL_SUPPLIER_VISITS_ENABLED=true.
[ ] Registrar ACCESS_CONTROL_MAINTENANCE_LINK_ENABLED=true.
[ ] Registrar ACCESS_CONTROL_MAX_REPORT_PAGE_SIZE=100.
[ ] Registrar ACCESS_CONTROL_GUARD_RECENT_EVENTS_PAGE_SIZE=50.
[ ] Registrar ACCESS_CONTROL_PASS_TTL_MINUTES=1440.
[ ] Registrar ACCESS_CONTROL_HASH_PEPPER_SECRET.
[ ] Agregar validación de boot para secrets obligatorios.
[ ] Agregar validación de boot para flags prohibidos.
[ ] Agregar tests de configuración.
```

## Acceptance criteria

```text
[ ] El boot falla si ACCESS_CONTROL_PUBLIC_ENDPOINTS_ENABLED=true.
[ ] El boot falla si ACCESS_CONTROL_WORDPRESS_ACCESS_ENABLED=true.
[ ] El boot falla si ACCESS_CONTROL_GATE_OPENING_ENABLED=true.
[ ] El boot falla si ACCESS_CONTROL_HARDWARE_CONTROL_ENABLED=true.
[ ] El boot falla si ACCESS_CONTROL_FACE_RECOGNITION_ENABLED=true.
[ ] El boot falla si ACCESS_CONTROL_BIOMETRIC_PROCESSING_ENABLED=true.
[ ] El boot falla si ACCESS_CONTROL_PLATE_OCR_ENABLED=true.
[ ] El boot falla si ACCESS_CONTROL_EXTERNAL_AI_ENABLED=true.
[ ] El boot falla si ACCESS_CONTROL_HASH_PEPPER_SECRET está vacío.
```

---

# 7. EPIC-024-03 — Enums and domain errors

## Objetivo

Implementar enums y catálogo de errores de dominio.

## Tasks

```text
[ ] Crear VisitorIdentificationType.
[ ] Crear VisitorType.
[ ] Crear VisitorProfileStatus.
[ ] Crear VisitorVehicleType.
[ ] Crear VisitorVehicleStatus.
[ ] Crear AccessGateType.
[ ] Crear AccessGateStatus.
[ ] Crear AccessAuthorizationType.
[ ] Crear AccessAuthorizationScope.
[ ] Crear AccessAuthorizationStatus.
[ ] Crear AccessPassType.
[ ] Crear AccessPassStatus.
[ ] Crear AccessEventType.
[ ] Crear AccessEventStatus.
[ ] Crear AccessEntryMethod.
[ ] Crear AccessExitMethod.
[ ] Crear AccessCheckInStatus.
[ ] Crear AccessCheckOutStatus.
[ ] Crear VisitorDeliveryStatus.
[ ] Crear VisitorSupplierVisitStatus.
[ ] Crear AccessIncidentType.
[ ] Crear AccessIncidentSeverity.
[ ] Crear AccessIncidentStatus.
[ ] Crear AccessCommentEntityType.
[ ] Crear AccessCommentVisibility.
[ ] Crear AccessDocumentEntityType.
[ ] Crear AccessDocumentType.
[ ] Crear AccessDocumentVisibility.
[ ] Crear AccessDocumentStatus.
[ ] Crear AccessReportType.
[ ] Crear AccessExportFormat.
[ ] Crear AccessReportExportStatus.
[ ] Crear catálogo de errores ACCESS_*.
[ ] Mapear errores de dominio a HTTP status.
[ ] Agregar tests de errores.
```

## Acceptance criteria

```text
[ ] Todos los enums coinciden con api-contract.md.
[ ] Todos los errores críticos están definidos.
[ ] Los errores cross-tenant se mapean a 404.
[ ] Los estados inválidos se mapean a 409.
[ ] Los campos prohibidos se mapean a 422.
```

---

# 8. EPIC-024-04 — Masking helpers

## Objetivo

Implementar helpers de enmascaramiento para datos personales y códigos sensibles.

## Tasks

```text
[ ] Crear maskIdentificationNumber().
[ ] Crear maskPhoneNumber().
[ ] Crear maskEmail().
[ ] Crear maskVehiclePlate().
[ ] Crear maskAccessPassCode().
[ ] Crear normalizeIdentificationNumber().
[ ] Crear normalizePhoneNumber().
[ ] Crear normalizeEmail().
[ ] Crear normalizeVehiclePlate().
[ ] Crear normalizeAccessPassCode().
[ ] Crear sanitizeVisitorText().
[ ] Crear sanitizeAccessReason().
[ ] Crear sanitizeAccessComment().
[ ] Crear sanitizeIncidentDescription().
[ ] Agregar tests de masking.
[ ] Agregar tests de sanitización.
```

## Acceptance criteria

```text
[ ] identificationNumber raw no aparece en responses.
[ ] phone raw no aparece en responses.
[ ] email raw no aparece en responses.
[ ] plate raw no aparece en responses.
[ ] passCode raw no aparece en responses persistentes.
[ ] Inputs peligrosos HTML/script se rechazan o sanitizan.
```

---

# 9. EPIC-024-05 — Hashing helpers

## Objetivo

Implementar hashing tenant-aware para búsqueda exacta segura.

## Tasks

```text
[ ] Crear AccessHashingService.
[ ] Crear hashIdentificationNumber().
[ ] Crear hashPhone().
[ ] Crear hashEmail().
[ ] Crear hashVehiclePlate().
[ ] Crear hashAccessPassCode().
[ ] Implementar HMAC-SHA256.
[ ] Usar ACCESS_CONTROL_HASH_PEPPER_SECRET.
[ ] Agregar soporte para pepper tenant-aware.
[ ] Impedir pepper hardcodeado.
[ ] Impedir log de raw input.
[ ] Impedir log de hash sensible.
[ ] Agregar tests determinísticos.
[ ] Agregar tests con peppers diferentes.
```

## Acceptance criteria

```text
[ ] Mismo valor + mismo tenantPepper produce mismo hash.
[ ] Mismo valor + tenantPepper distinto produce hash distinto.
[ ] Hashes no se devuelven por API.
[ ] Raw values no se persisten.
[ ] Raw values no se loggean.
```

---

# 10. EPIC-024-06 — Value objects

## Objetivo

Implementar objetos de valor del dominio.

## Tasks

```text
[ ] Crear VisitorFullName.
[ ] Crear VisitorIdentificationTypeValue.
[ ] Crear VisitorIdentificationMasked.
[ ] Crear VisitorIdentificationHash.
[ ] Crear VisitorPhoneMasked.
[ ] Crear VisitorPhoneHash.
[ ] Crear VisitorEmailMasked.
[ ] Crear VisitorEmailHash.
[ ] Crear VisitorVehiclePlateMasked.
[ ] Crear VisitorVehiclePlateHash.
[ ] Crear AccessAuthorizationNumber.
[ ] Crear AccessPassCodeHash.
[ ] Crear AccessPassDisplayCode.
[ ] Crear AccessEventNumber.
[ ] Crear AccessGateCode.
[ ] Crear AccessGateName.
[ ] Crear AccessDeliveryNumber.
[ ] Crear AccessSupplierVisitNumber.
[ ] Crear AccessIncidentNumber.
[ ] Crear AccessReason.
[ ] Crear AccessIncidentDescription.
[ ] Crear AccessCommentBody.
[ ] Crear AccessValidityWindow.
[ ] Crear AccessDateRange.
[ ] Crear AccessReportPeriod.
[ ] Crear AccessDocumentReference.
```

## Tests

```text
[ ] Tests de nombres válidos.
[ ] Tests de nombres vacíos.
[ ] Tests de longitud máxima.
[ ] Tests de códigos operativos válidos.
[ ] Tests de códigos operativos inválidos.
[ ] Tests de hash válido.
[ ] Tests de hash inválido.
[ ] Tests de valores masked.
[ ] Tests de rechazo de raw donde aplica.
[ ] Tests de validFrom < validUntil.
[ ] Tests de razones obligatorias.
[ ] Tests de sanitización.
```

## Acceptance criteria

```text
[ ] Los value objects no aceptan datos peligrosos.
[ ] Los value objects no exponen raw PII.
[ ] Los value objects no aceptan comandos de hardware.
[ ] Los value objects no aceptan biometría.
```

---

# 11. EPIC-024-07 — Domain entities

## Objetivo

Implementar entidades de dominio.

## Tasks

```text
[ ] Crear VisitorProfile entity.
[ ] Crear VisitorVehicle entity.
[ ] Crear AccessGate entity.
[ ] Crear AccessAuthorization entity.
[ ] Crear AccessPass entity.
[ ] Crear AccessEvent entity.
[ ] Crear AccessCheckIn entity.
[ ] Crear AccessCheckOut entity.
[ ] Crear VisitorDelivery entity.
[ ] Crear VisitorSupplierVisit entity.
[ ] Crear VisitorRecurringAuthorization entity.
[ ] Crear AccessIncident entity.
[ ] Crear AccessComment entity.
[ ] Crear AccessDocument entity.
[ ] Crear AccessReportExport entity.
```

## Tests

```text
[ ] VisitorProfile create/update/watchlist/block/archive.
[ ] VisitorVehicle create/update/watchlist/block/archive.
[ ] AccessGate create/update/inactivate/archive.
[ ] AccessAuthorization lifecycle.
[ ] AccessPass lifecycle.
[ ] AccessEvent record/correct/void/archive.
[ ] AccessCheckIn open/closed/voided/archive.
[ ] AccessCheckOut recorded/voided/archive.
[ ] VisitorDelivery lifecycle.
[ ] VisitorSupplierVisit lifecycle.
[ ] VisitorRecurringAuthorization lifecycle.
[ ] AccessIncident lifecycle.
[ ] AccessComment create/archive.
[ ] AccessDocument create/archive.
[ ] AccessReportExport requested/processing/completed/failed/archive.
```

## Acceptance criteria

```text
[ ] Las entidades no aceptan tenantId desde cliente.
[ ] Las entidades no aceptan actor fields desde cliente.
[ ] Las entidades no exponen datos raw.
[ ] Los eventos críticos no se eliminan físicamente.
```

---

# 12. EPIC-024-08 — Domain policies

## Objetivo

Implementar políticas de dominio y límites de seguridad.

## Tasks

```text
[ ] Crear AccessTenantPolicy.
[ ] Crear AccessVisitorPolicy.
[ ] Crear AccessVehiclePolicy.
[ ] Crear AccessGatePolicy.
[ ] Crear AccessAuthorizationPolicy.
[ ] Crear OwnAccessAuthorizationPolicy.
[ ] Crear OwnAccessVisitorPolicy.
[ ] Crear OwnAccessEventPolicy.
[ ] Crear AccessPassPolicy.
[ ] Crear AccessCheckInPolicy.
[ ] Crear AccessCheckOutPolicy.
[ ] Crear GuardAccessPolicy.
[ ] Crear AccessDeliveryPolicy.
[ ] Crear SupplierVisitPolicy.
[ ] Crear RecurringAuthorizationPolicy.
[ ] Crear AccessIncidentPolicy.
[ ] Crear AccessCommentPolicy.
[ ] Crear AccessDocumentPolicy.
[ ] Crear AccessReportPolicy.
[ ] Crear AccessPrivacyMaskingPolicy.
[ ] Crear AccessPersonalDataMinimizationPolicy.
[ ] Crear NoPublicAccessEndpointPolicy.
[ ] Crear NoWordPressAccessPolicy.
[ ] Crear NoBiometricProcessingPolicy.
[ ] Crear NoFaceRecognitionPolicy.
[ ] Crear NoGateOpeningPolicy.
[ ] Crear NoHardwareControlPolicy.
[ ] Crear NoPlateOcrPolicy.
[ ] Crear NoExternalAiAccessDataPolicy.
[ ] Crear NoGlobalWatchlistPolicy.
[ ] Crear NoPaymentFromAccessPolicy.
[ ] Crear NoAccountingFromAccessPolicy.
```

## Tests

```text
[ ] Tenant policy permite mismo tenant.
[ ] Tenant policy rechaza tenant distinto.
[ ] Own policy permite unidad propia.
[ ] Own policy rechaza unidad ajena.
[ ] Guard policy permite operación de garita.
[ ] Guard policy rechaza operación cross-tenant.
[ ] Authorization policy rechaza expired/cancelled/revoked.
[ ] Pass policy rechaza used/expired/revoked.
[ ] Visitor policy rechaza blocked/archived según caso.
[ ] Vehicle policy rechaza blocked/archived según caso.
[ ] Boundary policies bloquean public, WordPress, biometría, facial recognition, gate opening, hardware, OCR, AI, pagos y contabilidad.
```

## Acceptance criteria

```text
[ ] Las policies bloquean violaciones críticas antes de persistir.
[ ] Las policies están cubiertas con tests de seguridad y privacidad.
```

---

# 13. EPIC-024-09 — Prisma schema and migration

## Objetivo

Implementar modelo de datos en Prisma y PostgreSQL.

## Tasks

```text
[ ] Crear Prisma enums de Access Control.
[ ] Crear model VisitorProfile.
[ ] Crear model VisitorVehicle.
[ ] Crear model AccessGate.
[ ] Crear model AccessAuthorization.
[ ] Crear model AccessPass.
[ ] Crear model AccessEvent.
[ ] Crear model AccessCheckIn.
[ ] Crear model AccessCheckOut.
[ ] Crear model VisitorDelivery.
[ ] Crear model VisitorSupplierVisit.
[ ] Crear model VisitorRecurringAuthorization.
[ ] Crear model AccessIncident.
[ ] Crear model AccessComment.
[ ] Crear model AccessDocument.
[ ] Crear model AccessReportExport.
[ ] Agregar relaciones en Tenant.
[ ] Crear migración 024_create_access_control_visitors.
[ ] Agregar índices tenant-scoped.
[ ] Agregar índices por hash.
[ ] Agregar índices únicos por tenant.
[ ] Agregar índices únicos parciales donde aplique.
[ ] Agregar constraints de vigencia.
[ ] Agregar constraints de maxEntries.
[ ] Agregar constraints de cancel/revoke reason.
[ ] Agregar constraints de check-out único.
[ ] Agregar constraints de export completed.
[ ] Agregar constraints de incident resolved/dismissed.
[ ] Ejecutar prisma format.
[ ] Ejecutar migración local.
[ ] Ejecutar migración test.
```

## Acceptance criteria

```text
[ ] Todas las tablas operativas tienen tenant_id.
[ ] No existen campos storageKey.
[ ] No existen campos signedUrl persistente.
[ ] No existen campos base64.
[ ] No existen campos biometricTemplate.
[ ] No existen campos faceEmbedding.
[ ] No existen campos gateOpenCommand.
[ ] No existen campos hardwareDeviceCommand.
[ ] No existen campos cameraStreamUrl.
[ ] No existen campos plateOcrPayload.
[ ] No existen FK directas obligatorias a pagos, ledger o conciliación.
[ ] La migración corre limpia.
```

---

# 14. EPIC-024-10 — Repository ports and Prisma repositories

## Objetivo

Implementar puertos y repositorios tenant-scoped.

## Tasks

```text
[ ] Crear VisitorProfileRepositoryPort.
[ ] Crear PrismaVisitorProfileRepository.
[ ] Crear VisitorVehicleRepositoryPort.
[ ] Crear PrismaVisitorVehicleRepository.
[ ] Crear AccessGateRepositoryPort.
[ ] Crear PrismaAccessGateRepository.
[ ] Crear AccessAuthorizationRepositoryPort.
[ ] Crear PrismaAccessAuthorizationRepository.
[ ] Crear AccessPassRepositoryPort.
[ ] Crear PrismaAccessPassRepository.
[ ] Crear AccessEventRepositoryPort.
[ ] Crear PrismaAccessEventRepository.
[ ] Crear AccessCheckInRepositoryPort.
[ ] Crear PrismaAccessCheckInRepository.
[ ] Crear AccessCheckOutRepositoryPort.
[ ] Crear PrismaAccessCheckOutRepository.
[ ] Crear VisitorDeliveryRepositoryPort.
[ ] Crear PrismaVisitorDeliveryRepository.
[ ] Crear VisitorSupplierVisitRepositoryPort.
[ ] Crear PrismaVisitorSupplierVisitRepository.
[ ] Crear VisitorRecurringAuthorizationRepositoryPort.
[ ] Crear PrismaVisitorRecurringAuthorizationRepository.
[ ] Crear AccessIncidentRepositoryPort.
[ ] Crear PrismaAccessIncidentRepository.
[ ] Crear AccessCommentRepositoryPort.
[ ] Crear PrismaAccessCommentRepository.
[ ] Crear AccessDocumentRepositoryPort.
[ ] Crear PrismaAccessDocumentRepository.
[ ] Crear AccessReportExportRepositoryPort.
[ ] Crear PrismaAccessReportExportRepository.
```

## Required query pattern

```text
[ ] Toda consulta por recurso usa id + tenantId.
[ ] Toda lista filtra por tenantId.
[ ] Todo update filtra por id + tenantId.
[ ] Todo archive filtra por id + tenantId.
[ ] Cross-tenant retorna null.
[ ] Búsqueda por hash siempre filtra tenantId.
```

## Tests

```text
[ ] tenantA no lee registros tenantB.
[ ] tenantA no actualiza registros tenantB.
[ ] tenantA no archiva registros tenantB.
[ ] Búsqueda por identificationHash no mezcla tenants.
[ ] Búsqueda por plateHash no mezcla tenants.
[ ] Búsqueda por passCodeHash no mezcla tenants.
[ ] Códigos únicos por tenant funcionan.
[ ] Mismo código en tenant distinto permitido cuando aplique.
```

---

# 15. EPIC-024-11 — DTOs and validation

## Objetivo

Implementar DTOs seguros y validaciones de entrada.

## Tasks

```text
[ ] Crear CreateVisitorProfileDto.
[ ] Crear UpdateVisitorProfileDto.
[ ] Crear WatchlistVisitorProfileDto.
[ ] Crear BlockVisitorProfileDto.
[ ] Crear ArchiveVisitorProfileDto.
[ ] Crear CreateVisitorVehicleDto.
[ ] Crear UpdateVisitorVehicleDto.
[ ] Crear WatchlistVisitorVehicleDto.
[ ] Crear BlockVisitorVehicleDto.
[ ] Crear ArchiveVisitorVehicleDto.
[ ] Crear CreateAccessGateDto.
[ ] Crear UpdateAccessGateDto.
[ ] Crear ArchiveAccessGateDto.
[ ] Crear CreateAccessAuthorizationDto.
[ ] Crear CancelAccessAuthorizationDto.
[ ] Crear RevokeAccessAuthorizationDto.
[ ] Crear CreateOwnVisitorProfileDto.
[ ] Crear CreateOwnAccessAuthorizationDto.
[ ] Crear CancelOwnAccessAuthorizationDto.
[ ] Crear CreateAccessPassDto.
[ ] Crear ValidateAccessPassDto.
[ ] Crear RevokeAccessPassDto.
[ ] Crear CreateAccessCheckInDto.
[ ] Crear VoidAccessCheckInDto.
[ ] Crear CreateAccessCheckOutDto.
[ ] Crear VoidAccessCheckOutDto.
[ ] Crear CorrectAccessEventDto.
[ ] Crear VoidAccessEventDto.
[ ] Crear CreateDeniedAccessDto.
[ ] Crear CreateVisitorDeliveryDto.
[ ] Crear DeliverVisitorDeliveryDto.
[ ] Crear ReturnVisitorDeliveryDto.
[ ] Crear CancelVisitorDeliveryDto.
[ ] Crear CreateVisitorSupplierVisitDto.
[ ] Crear CheckInSupplierVisitDto.
[ ] Crear CheckOutSupplierVisitDto.
[ ] Crear CancelSupplierVisitDto.
[ ] Crear DenySupplierVisitDto.
[ ] Crear CreateRecurringAuthorizationDto.
[ ] Crear CancelRecurringAuthorizationDto.
[ ] Crear RevokeRecurringAuthorizationDto.
[ ] Crear CreateAccessIncidentDto.
[ ] Crear UpdateAccessIncidentDto.
[ ] Crear ResolveAccessIncidentDto.
[ ] Crear DismissAccessIncidentDto.
[ ] Crear CreateAccessCommentDto.
[ ] Crear ArchiveAccessCommentDto.
[ ] Crear CreateAccessDocumentDto.
[ ] Crear ArchiveAccessDocumentDto.
[ ] Crear AccessReportFilterDto.
[ ] Crear AccessReportExportDto.
```

## Forbidden fields tests

```text
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo fuera de endpoints de transición.
[ ] DTOs rechazan authorizationNumber.
[ ] DTOs rechazan eventNumber.
[ ] DTOs rechazan deliveryNumber.
[ ] DTOs rechazan supplierVisitNumber.
[ ] DTOs rechazan incidentNumber.
[ ] DTOs rechazan identificationNumberHash.
[ ] DTOs rechazan phoneHash.
[ ] DTOs rechazan emailHash.
[ ] DTOs rechazan plateHash.
[ ] DTOs rechazan passCodeHash.
[ ] DTOs rechazan storageKey.
[ ] DTOs rechazan signedUrl.
[ ] DTOs rechazan base64.
[ ] DTOs rechazan rawFilePayload.
[ ] DTOs rechazan fullDocumentImage.
[ ] DTOs rechazan biometricTemplate.
[ ] DTOs rechazan faceEmbedding.
[ ] DTOs rechazan cameraStreamUrl.
[ ] DTOs rechazan gateOpenCommand.
[ ] DTOs rechazan hardwareDeviceCommand.
[ ] DTOs rechazan paymentId.
[ ] DTOs rechazan paymentOrderId.
[ ] DTOs rechazan supplierPaymentOrderId.
[ ] DTOs rechazan journalEntryId.
[ ] DTOs rechazan bankTransactionId.
[ ] DTOs rechazan reconciliationMatchId.
[ ] DTOs rechazan externalAiEnabled.
```

---

# 16. EPIC-024-12 — Guards and authorization

## Objetivo

Implementar autorización por permisos, tenant, relación propia y operación de guardia.

## Tasks

```text
[ ] Aplicar AuthGuard a todas las rutas permitidas.
[ ] Aplicar TenantGuard a todas las rutas tenant.
[ ] Aplicar PermissionGuard a todas las rutas.
[ ] Crear OwnAccessAuthorizationGuard.
[ ] Crear OwnAccessVisitorGuard.
[ ] Crear OwnAccessEventGuard.
[ ] Crear GuardOperationGuard.
[ ] Crear AccessVisitorTenantGuard si aplica.
[ ] Crear AccessVehicleTenantGuard si aplica.
[ ] Crear AccessGateTenantGuard si aplica.
[ ] Crear AccessAuthorizationTenantGuard si aplica.
[ ] Crear AccessPassTenantGuard si aplica.
[ ] Crear AccessEventTenantGuard si aplica.
[ ] Crear AccessCheckInTenantGuard si aplica.
[ ] Crear AccessCheckOutTenantGuard si aplica.
[ ] Crear AccessDeliveryTenantGuard si aplica.
[ ] Crear AccessSupplierVisitTenantGuard si aplica.
[ ] Crear AccessIncidentTenantGuard si aplica.
[ ] Crear AccessCommentTenantGuard si aplica.
[ ] Crear AccessDocumentTenantGuard si aplica.
[ ] Mapear permisos por endpoint Tenant Admin API.
[ ] Mapear permisos por endpoint Guard API.
[ ] Mapear permisos por endpoint /me API.
[ ] Verificar PlatformAdmin sin acceso automático.
[ ] Verificar Resident limitado a /me.
[ ] Verificar Guard limitado a Guard API y endpoints autorizados.
```

## Acceptance criteria

```text
[ ] Sin token retorna 401.
[ ] Sin permiso retorna 403.
[ ] Recurso cross-tenant retorna 404.
[ ] Resident no accede a datos de unidad ajena.
[ ] Guard no opera tenant ajeno.
[ ] PlatformAdmin requiere tenant context y permiso explícito.
```

---

# 17. EPIC-024-13 — Visitor profiles service and API

## Objetivo

Implementar visitantes.

## Tasks

```text
[ ] Crear VisitorProfileService.
[ ] Implementar list visitors.
[ ] Implementar create visitor.
[ ] Implementar get visitor.
[ ] Implementar update visitor.
[ ] Implementar watchlist visitor.
[ ] Implementar block visitor.
[ ] Implementar archive visitor.
[ ] Implementar búsqueda por nombre normalizado.
[ ] Implementar búsqueda por identificationNumber raw temporal -> hash.
[ ] Implementar búsqueda por phone raw temporal -> hash.
[ ] Implementar enmascaramiento de identificationNumber.
[ ] Implementar enmascaramiento de phone.
[ ] Implementar mappers visitor entity -> DTO.
[ ] Implementar AccessVisitorsController.
[ ] Agregar audit accessVisitor.created.
[ ] Agregar audit accessVisitor.updated.
[ ] Agregar audit accessVisitor.watchlisted.
[ ] Agregar audit accessVisitor.blocked.
[ ] Agregar audit accessVisitor.archived.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests privacy.
[ ] Agregar tests multitenancy.
```

## Acceptance criteria

```text
[ ] VisitorProfile es tenant-scoped.
[ ] identificationNumber raw no se persiste.
[ ] phone raw no se persiste.
[ ] Hashes no se exponen.
[ ] blockedTenant requiere razón.
[ ] archive requiere razón.
```

---

# 18. EPIC-024-14 — Visitor vehicles service and API

## Objetivo

Implementar vehículos visitantes.

## Tasks

```text
[ ] Crear VisitorVehicleService.
[ ] Implementar list vehicles.
[ ] Implementar create vehicle.
[ ] Implementar get vehicle.
[ ] Implementar update vehicle.
[ ] Implementar watchlist vehicle.
[ ] Implementar block vehicle.
[ ] Implementar archive vehicle.
[ ] Implementar búsqueda por plate raw temporal -> hash.
[ ] Implementar enmascaramiento de plate.
[ ] Validar visitorId tenant-scoped si existe.
[ ] Implementar mappers vehicle entity -> DTO.
[ ] Implementar AccessVisitorVehiclesController.
[ ] Agregar audit accessVehicle.created.
[ ] Agregar audit accessVehicle.updated.
[ ] Agregar audit accessVehicle.watchlisted.
[ ] Agregar audit accessVehicle.blocked.
[ ] Agregar audit accessVehicle.archived.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests privacy.
[ ] Agregar tests multitenancy.
```

## Acceptance criteria

```text
[ ] plate raw no se persiste.
[ ] plateHash no se expone.
[ ] vehicle blockedTenant requiere razón.
[ ] vehicle archived no se usa en nuevos accesos.
```

---

# 19. EPIC-024-15 — Access gates service and API

## Objetivo

Implementar puntos de acceso.

## Tasks

```text
[ ] Crear AccessGateService.
[ ] Implementar list gates.
[ ] Implementar create gate.
[ ] Implementar get gate.
[ ] Implementar update gate.
[ ] Implementar archive gate.
[ ] Implementar validación gateCode único por tenant.
[ ] Implementar validación isEntryAllowed.
[ ] Implementar validación isExitAllowed.
[ ] Implementar mappers gate entity -> DTO.
[ ] Implementar AccessGatesController.
[ ] Agregar audit accessGate.created.
[ ] Agregar audit accessGate.updated.
[ ] Agregar audit accessGate.archived.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests de no hardware commands.
```

## Acceptance criteria

```text
[ ] gateCode único por tenant.
[ ] Gate archived no recibe nuevos eventos.
[ ] API rechaza gateOpenCommand.
[ ] API rechaza hardwareDeviceCommand.
[ ] El módulo no abre portones.
```

---

# 20. EPIC-024-16 — Access authorizations service and API

## Objetivo

Implementar autorizaciones administrativas y tenant-scoped.

## Tasks

```text
[ ] Crear AccessAuthorizationService.
[ ] Crear CreateAccessAuthorizationUseCase.
[ ] Crear CancelAccessAuthorizationUseCase.
[ ] Crear RevokeAccessAuthorizationUseCase.
[ ] Crear ExpireAccessAuthorizationsUseCase.
[ ] Crear AccessAuthorizationNumberGenerator.
[ ] Implementar list authorizations.
[ ] Implementar create authorization.
[ ] Implementar get authorization.
[ ] Implementar cancel authorization.
[ ] Implementar revoke authorization.
[ ] Implementar expiration handling.
[ ] Validar visitorId tenant-scoped.
[ ] Validar vehicleId tenant-scoped si existe.
[ ] Validar propertyUnitId tenant-scoped si existe.
[ ] Validar validFrom < validUntil.
[ ] Validar maxEntries > 0 si existe.
[ ] Validar visitor no blockedTenant.
[ ] Validar visitor no archived.
[ ] Validar vehicle no blockedTenant salvo override.
[ ] Validar vehicle no archived.
[ ] Generar authorizationNumber server-side.
[ ] Resolver authorizedByUserId server-side.
[ ] Crear AccessPass si generateAccessPass=true.
[ ] Revocar passes activos al cancelar.
[ ] Revocar passes activos al revocar.
[ ] Implementar AccessAuthorizationsController.
[ ] Agregar audit accessAuthorization.created.
[ ] Agregar audit accessAuthorization.activated.
[ ] Agregar audit accessAuthorization.cancelled.
[ ] Agregar audit accessAuthorization.revoked.
[ ] Agregar audit accessAuthorization.expired.
[ ] Agregar audit accessAuthorization.used.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests multitenancy.
```

## Acceptance criteria

```text
[ ] Autorización active requiere vigencia válida.
[ ] Expired/cancelled/revoked no permite ingreso.
[ ] Cancel/revoke requieren razón.
[ ] authorizationNumber no se acepta desde cliente.
[ ] authorizedByUserId no se acepta desde cliente.
```

---

# 21. EPIC-024-17 — Access passes service and API

## Objetivo

Implementar pases temporales y validación segura.

## Tasks

```text
[ ] Crear AccessPassService.
[ ] Crear CreateAccessPassUseCase.
[ ] Crear ValidateAccessPassUseCase.
[ ] Crear RevokeAccessPassUseCase.
[ ] Crear ExpireAccessPassesUseCase.
[ ] Implementar generación de passCode raw temporal.
[ ] Implementar passCodeHash HMAC.
[ ] Implementar passCodeMasked.
[ ] Implementar create pass.
[ ] Implementar list passes.
[ ] Implementar validate pass.
[ ] Implementar revoke pass.
[ ] Implementar expire pass.
[ ] Validar expiresAt > now.
[ ] Validar authorizationId tenant-scoped.
[ ] Validar autorización active y vigente.
[ ] Validar oneTime no reutilizable.
[ ] Impedir persistencia de passCode raw.
[ ] Impedir exposición de passCodeHash.
[ ] Implementar AccessPassesController.
[ ] Agregar audit accessPass.created.
[ ] Agregar audit accessPass.validated.
[ ] Agregar audit accessPass.used.
[ ] Agregar audit accessPass.expired.
[ ] Agregar audit accessPass.revoked.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests privacy.
[ ] Agregar tests concurrency.
```

## Acceptance criteria

```text
[ ] passCode raw no se persiste.
[ ] passCodeHash no se expone.
[ ] pass expired/used/revoked no valida.
[ ] oneTime pass no se reutiliza.
```

---

# 22. EPIC-024-18 — Access events service and API

## Objetivo

Implementar eventos de acceso como fuente de trazabilidad.

## Tasks

```text
[ ] Crear AccessEventService.
[ ] Crear RecordAccessEventUseCase.
[ ] Crear CorrectAccessEventUseCase.
[ ] Crear VoidAccessEventUseCase.
[ ] Crear AccessEventNumberGenerator.
[ ] Implementar list events.
[ ] Implementar get event.
[ ] Implementar record event.
[ ] Implementar correct event.
[ ] Implementar void event.
[ ] Validar gateId tenant-scoped.
[ ] Validar visitorId tenant-scoped si existe.
[ ] Validar vehicleId tenant-scoped si existe.
[ ] Validar authorizationId tenant-scoped si existe.
[ ] Validar propertyUnitId tenant-scoped si existe.
[ ] Generar eventNumber server-side.
[ ] Resolver recordedByUserId server-side.
[ ] Impedir physical delete.
[ ] Implementar AccessEventsController.
[ ] Agregar audit accessEvent.recorded.
[ ] Agregar audit accessEvent.corrected.
[ ] Agregar audit accessEvent.voided.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests multitenancy.
```

## Acceptance criteria

```text
[ ] AccessEvent no se elimina físicamente.
[ ] correct requiere razón.
[ ] void requiere razón.
[ ] eventNumber no se acepta desde cliente.
[ ] recordedByUserId no se acepta desde cliente.
```

---

# 23. EPIC-024-19 — Check-in engine

## Objetivo

Implementar registro transaccional de ingresos.

## Tasks

```text
[ ] Crear AccessCheckInService.
[ ] Crear RecordAccessCheckInUseCase.
[ ] Crear VoidAccessCheckInUseCase.
[ ] Implementar list check-ins.
[ ] Implementar get check-in.
[ ] Implementar create check-in con authorizationId.
[ ] Implementar create check-in con accessPassCode.
[ ] Implementar create check-in manual.
[ ] Implementar create check-in override si policy lo permite.
[ ] Validar authorization active y vigente.
[ ] Validar accessPass active y vigente.
[ ] Validar visitor active/watchlisted permitido.
[ ] Rechazar visitor blockedTenant salvo override.
[ ] Rechazar visitor archived.
[ ] Rechazar vehicle blockedTenant salvo override.
[ ] Rechazar vehicle archived.
[ ] Validar gate active.
[ ] Validar gate isEntryAllowed.
[ ] Crear AccessEvent checkIn.
[ ] Crear AccessCheckIn open.
[ ] Marcar AccessPass used si aplica.
[ ] Incrementar entriesUsed en AccessAuthorization.
[ ] Marcar authorization oneTime como used si aplica.
[ ] Ejecutar operación en transacción.
[ ] Implementar AccessCheckInsController.
[ ] Agregar audit accessCheckIn.recorded.
[ ] Agregar audit accessCheckIn.voided.
[ ] Agregar tests unitarios.
[ ] Agregar tests integración.
[ ] Agregar tests API.
[ ] Agregar tests concurrency.
```

## Acceptance criteria

```text
[ ] Check-in crea AccessEvent.
[ ] Check-in crea AccessCheckIn open.
[ ] Check-in con pass usado falla.
[ ] Check-in con autorización expirada falla.
[ ] Check-in manual requiere razón.
[ ] Check-in no cambia tenant.
```

---

# 24. EPIC-024-20 — Check-out engine

## Objetivo

Implementar registro transaccional de salidas.

## Tasks

```text
[ ] Crear AccessCheckOutService.
[ ] Crear RecordAccessCheckOutUseCase.
[ ] Crear VoidAccessCheckOutUseCase.
[ ] Implementar list check-outs.
[ ] Implementar get check-out.
[ ] Implementar create check-out con checkInId.
[ ] Implementar create check-out manual sin checkInId.
[ ] Validar checkInId tenant-scoped si existe.
[ ] Validar checkIn status open.
[ ] Validar gate active.
[ ] Validar gate isExitAllowed.
[ ] Impedir doble check-out activo.
[ ] Crear AccessEvent checkOut.
[ ] Crear AccessCheckOut recorded.
[ ] Cerrar AccessCheckIn.
[ ] Ejecutar operación en transacción.
[ ] Implementar AccessCheckOutsController.
[ ] Agregar audit accessCheckOut.recorded.
[ ] Agregar audit accessCheckOut.voided.
[ ] Agregar tests unitarios.
[ ] Agregar tests integración.
[ ] Agregar tests API.
[ ] Agregar tests concurrency.
```

## Acceptance criteria

```text
[ ] Check-out crea AccessEvent.
[ ] Check-out crea AccessCheckOut.
[ ] Check-out cierra AccessCheckIn.
[ ] Check-out duplicado falla.
[ ] Salida manual sin checkIn requiere razón.
```

---

# 25. EPIC-024-21 — Guard API

## Objetivo

Implementar API de operación rápida de garita.

## Tasks

```text
[ ] Crear GuardAccessController.
[ ] Crear GuardAccessService.
[ ] Implementar GET /tenant/guard/access-authorizations/active.
[ ] Implementar POST /tenant/guard/access-passes/validate.
[ ] Implementar POST /tenant/guard/access-check-ins.
[ ] Implementar POST /tenant/guard/access-check-outs.
[ ] Implementar GET /tenant/guard/access-events/recent.
[ ] Implementar POST /tenant/guard/access-denied.
[ ] Implementar POST /tenant/guard/access-incidents.
[ ] Implementar POST /tenant/guard/access-deliveries.
[ ] Aplicar GuardOperationGuard.
[ ] Aplicar permisos guardAccess.*.
[ ] Limitar recent events a pageSize 50.
[ ] Enmascarar identificación en Guard API.
[ ] Enmascarar placa en Guard API.
[ ] Impedir exportación masiva desde Guard API salvo permiso explícito.
[ ] Agregar audit para acciones de guardia.
[ ] Agregar tests API.
[ ] Agregar tests authz.
[ ] Agregar tests privacy.
```

## Acceptance criteria

```text
[ ] Guard API no es pública.
[ ] Guard API requiere AuthGuard.
[ ] Guard API requiere TenantGuard.
[ ] Guard API requiere permisos guardAccess.*.
[ ] Resident no accede Guard API.
[ ] Anonymous no accede Guard API.
[ ] GuardA no opera tenantB.
```

---

# 26. EPIC-024-22 — `/me` resident API

## Objetivo

Implementar API propia limitada para residentes.

## Tasks

```text
[ ] Crear MeAccessController.
[ ] Crear MeAccessService.
[ ] Implementar GET /me/access-visitors.
[ ] Implementar POST /me/access-visitors.
[ ] Implementar GET /me/access-authorizations.
[ ] Implementar POST /me/access-authorizations.
[ ] Implementar GET /me/access-authorizations/{authorizationId}.
[ ] Implementar POST /me/access-authorizations/{authorizationId}/cancel.
[ ] Implementar GET /me/access-events.
[ ] Crear OwnAccessResolver.
[ ] Resolver UserProfile -> Person -> PropertyUnit.
[ ] Validar propertyUnitId propia.
[ ] Impedir authorizationScope administrative desde /me.
[ ] Impedir check-in/check-out desde /me.
[ ] Impedir exportaciones masivas desde /me.
[ ] No exponer notas internas.
[ ] No exponer audit metadata.
[ ] No exponer guard internal fields.
[ ] No exponer identification raw.
[ ] No exponer plate raw.
[ ] Agregar tests /me.
[ ] Agregar tests own-resource.
[ ] Agregar tests privacy.
```

## Acceptance criteria

```text
[ ] Resident ve solo recursos propios.
[ ] Resident no ve unidad ajena.
[ ] Resident no ve tenant ajeno.
[ ] /me no expone datos internos.
[ ] /me no permite check-in/check-out.
[ ] /me no permite report export.
```

---

# 27. EPIC-024-23 — Visitor deliveries

## Objetivo

Implementar entregas, deliveries y mensajería.

## Tasks

```text
[ ] Crear VisitorDeliveryService.
[ ] Crear RegisterVisitorDeliveryUseCase.
[ ] Crear CloseVisitorDeliveryUseCase.
[ ] Crear VisitorDeliveryNumberGenerator.
[ ] Implementar list deliveries.
[ ] Implementar create delivery.
[ ] Implementar get delivery.
[ ] Implementar mark receivedAtGate.
[ ] Implementar mark deliveredToUnit.
[ ] Implementar return delivery.
[ ] Implementar cancel delivery.
[ ] Validar propertyUnitId tenant-scoped.
[ ] Validar recipientPersonId tenant-scoped si existe.
[ ] Validar visitorId tenant-scoped si existe.
[ ] Sanitizar packageDescription.
[ ] Minimizar packageDescription.
[ ] Generar deliveryNumber server-side.
[ ] Implementar AccessDeliveriesController.
[ ] Agregar audit accessDelivery.created.
[ ] Agregar audit accessDelivery.received.
[ ] Agregar audit accessDelivery.delivered.
[ ] Agregar audit accessDelivery.returned.
[ ] Agregar audit accessDelivery.cancelled.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests privacy.
```

## Acceptance criteria

```text
[ ] Entrega pertenece al tenant.
[ ] Entrega requiere unidad.
[ ] returned requiere returnReason.
[ ] cancelled requiere cancelReason.
[ ] No se guarda contenido sensible innecesario.
```

---

# 28. EPIC-024-24 — Supplier visits

## Objetivo

Implementar visitas de proveedores y técnicos sin efectos financieros.

## Tasks

```text
[ ] Crear VisitorSupplierVisitService.
[ ] Crear RegisterSupplierVisitUseCase.
[ ] Crear CheckInSupplierVisitUseCase.
[ ] Crear CheckOutSupplierVisitUseCase.
[ ] Crear CancelSupplierVisitUseCase.
[ ] Crear DenySupplierVisitUseCase.
[ ] Crear SupplierVisitNumberGenerator.
[ ] Implementar list supplier visits.
[ ] Implementar create supplier visit.
[ ] Implementar get supplier visit.
[ ] Implementar supplier visit check-in.
[ ] Implementar supplier visit check-out.
[ ] Implementar cancel supplier visit.
[ ] Implementar deny supplier visit.
[ ] Validar supplierId con Supplier Payments si existe.
[ ] Rechazar supplier blocked salvo override auditado.
[ ] Validar maintenanceWorkOrderId con Maintenance Work Orders si existe.
[ ] Validar visitorId tenant-scoped.
[ ] Validar vehicleId tenant-scoped si existe.
[ ] Generar supplierVisitNumber server-side.
[ ] Impedir creación de SupplierPayable.
[ ] Impedir creación de SupplierPaymentOrder.
[ ] Impedir creación de Payment.
[ ] Impedir modificación de Maintenance Work Orders.
[ ] Implementar AccessSupplierVisitsController.
[ ] Agregar audit accessSupplierVisit.created.
[ ] Agregar audit accessSupplierVisit.checkedIn.
[ ] Agregar audit accessSupplierVisit.checkedOut.
[ ] Agregar audit accessSupplierVisit.cancelled.
[ ] Agregar audit accessSupplierVisit.denied.
[ ] Agregar tests boundary.
[ ] Agregar tests API.
```

## Acceptance criteria

```text
[ ] Supplier visit no crea pagos.
[ ] Supplier visit no crea SupplierPayable.
[ ] Supplier visit no crea SupplierPaymentOrder.
[ ] Supplier visit no modifica WorkOrder.
[ ] Supplier visit es tenant-scoped.
```

---

# 29. EPIC-024-25 — Recurring authorizations

## Objetivo

Implementar autorizaciones recurrentes básicas.

## Tasks

```text
[ ] Crear VisitorRecurringAuthorizationService.
[ ] Crear CreateRecurringAuthorizationUseCase.
[ ] Crear CancelRecurringAuthorizationUseCase.
[ ] Crear RevokeRecurringAuthorizationUseCase.
[ ] Crear ExpireRecurringAuthorizationsUseCase.
[ ] Crear RecurringAuthorizationNumberGenerator.
[ ] Implementar list recurring authorizations.
[ ] Implementar create recurring authorization.
[ ] Implementar get recurring authorization.
[ ] Implementar cancel recurring authorization.
[ ] Implementar revoke recurring authorization.
[ ] Implementar expiration.
[ ] Validar visitorId tenant-scoped.
[ ] Validar vehicleId tenant-scoped si existe.
[ ] Validar propertyUnitId tenant-scoped si existe.
[ ] Validar validFrom <= validUntil.
[ ] Validar daysOfWeek.
[ ] Validar timeFrom < timeUntil si aplica.
[ ] Validar maxEntriesPerDay > 0 si aplica.
[ ] Impedir autorización permanente sin validUntil.
[ ] Implementar AccessRecurringAuthorizationsController.
[ ] Agregar audit accessRecurringAuthorization.created.
[ ] Agregar audit accessRecurringAuthorization.cancelled.
[ ] Agregar audit accessRecurringAuthorization.revoked.
[ ] Agregar audit accessRecurringAuthorization.expired.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
```

## Acceptance criteria

```text
[ ] Recurrente tiene vigencia.
[ ] Recurrente tiene patrón válido.
[ ] Recurrente no equivale a pase permanente sin control.
[ ] Resident no crea recurrente para unidad ajena.
```

---

# 30. EPIC-024-26 — Access incidents

## Objetivo

Implementar incidentes y novedades de acceso.

## Tasks

```text
[ ] Crear AccessIncidentService.
[ ] Crear CreateAccessIncidentUseCase.
[ ] Crear ResolveAccessIncidentUseCase.
[ ] Crear DismissAccessIncidentUseCase.
[ ] Crear AccessIncidentNumberGenerator.
[ ] Implementar list incidents.
[ ] Implementar create incident.
[ ] Implementar get incident.
[ ] Implementar update incident.
[ ] Implementar resolve incident.
[ ] Implementar dismiss incident.
[ ] Implementar archive incident.
[ ] Validar visitorId tenant-scoped si existe.
[ ] Validar vehicleId tenant-scoped si existe.
[ ] Validar accessEventId tenant-scoped si existe.
[ ] Validar checkInId tenant-scoped si existe.
[ ] Validar checkOutId tenant-scoped si existe.
[ ] Validar propertyUnitId tenant-scoped si existe.
[ ] Validar gateId tenant-scoped si existe.
[ ] Sanitizar description.
[ ] Generar incidentNumber server-side.
[ ] Notificar incident critical si Notifications está habilitado.
[ ] Implementar AccessIncidentsController.
[ ] Agregar audit accessIncident.created.
[ ] Agregar audit accessIncident.updated.
[ ] Agregar audit accessIncident.resolved.
[ ] Agregar audit accessIncident.dismissed.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests notifications.
```

## Acceptance criteria

```text
[ ] Incident description es obligatoria.
[ ] resolved requiere resolutionReason.
[ ] dismissed requiere dismissReason.
[ ] critical puede disparar notificación sanitizada.
[ ] Incident es tenant-scoped.
```

---

# 31. EPIC-024-27 — Access comments

## Objetivo

Implementar comentarios internos y visibles limitados.

## Tasks

```text
[ ] Crear AccessCommentService.
[ ] Implementar list comments.
[ ] Implementar create comment.
[ ] Implementar archive comment.
[ ] Validar entityType.
[ ] Validar entityId tenant-scoped según entityType.
[ ] Sanitizar commentBody.
[ ] Rechazar visibility=system desde cliente.
[ ] Impedir exposición de internal en /me.
[ ] Exponer visibleToResident solo con own scope.
[ ] Implementar AccessCommentsController.
[ ] Agregar audit accessComment.created.
[ ] Agregar audit accessComment.archived.
[ ] Agregar tests unitarios.
[ ] Agregar tests API.
[ ] Agregar tests privacy.
```

## Acceptance criteria

```text
[ ] Comentarios internal no aparecen en /me.
[ ] Comentarios visibleToResident solo aparecen para unidad propia.
[ ] Comentarios system solo se crean server-side.
```

---

# 32. EPIC-024-28 — Secure Document Storage integration

## Objetivo

Integrar documentos y exportaciones con Secure Document Storage.

## Tasks

```text
[ ] Crear AccessDocumentStoragePort.
[ ] Crear SecureDocumentStorageAccessAdapter.
[ ] Implementar validateDocumentBelongsToTenant.
[ ] Implementar getDownloadAvailability.
[ ] Implementar createReportExport.
[ ] Crear AccessDocumentService.
[ ] Implementar list documents.
[ ] Implementar create document link.
[ ] Implementar get document.
[ ] Implementar archive document.
[ ] Validar entityType.
[ ] Validar entityId tenant-scoped según entityType.
[ ] Validar secureDocumentId tenant-scoped.
[ ] Agregar metadata sourceModule=accessControlVisitors.
[ ] Validar visibility administrative | ownLimited.
[ ] Rechazar storageKey.
[ ] Rechazar signedUrl persistente.
[ ] Rechazar base64.
[ ] Rechazar rawFilePayload.
[ ] Implementar AccessDocumentsController.
[ ] Agregar audit accessDocument.created.
[ ] Agregar audit accessDocument.downloaded.
[ ] Agregar audit accessDocument.archived.
[ ] Agregar tests SDS.
[ ] Agregar tests API.
```

## Acceptance criteria

```text
[ ] Response devuelve secureDocumentId y downloadAvailable.
[ ] Nunca devuelve storageKey.
[ ] Nunca devuelve signedUrl persistente.
[ ] Nunca devuelve base64.
[ ] Documentos cross-tenant devuelven 404.
```

---

# 33. EPIC-024-29 — Residents and Properties integration

## Objetivo

Integrar validación de unidades, personas y relación propia.

## Tasks

```text
[ ] Crear AccessResidentsPropertiesPort.
[ ] Crear ResidentsPropertiesAccessAdapter.
[ ] Implementar validatePropertyUnit.
[ ] Implementar validatePerson.
[ ] Implementar resolveOwnUnits.
[ ] Implementar validateUserCanOperateUnit.
[ ] Validar propertyUnitId tenant-scoped.
[ ] Validar personId tenant-scoped.
[ ] Resolver UserProfile -> Person.
[ ] Resolver Person -> PropertyUnit.
[ ] Validar resident active.
[ ] Validar ownership/residency active.
[ ] Soportar PropertyOwner solo si tenant policy lo permite.
[ ] Agregar tests de adapter.
[ ] Agregar tests own-resource.
```

## Acceptance criteria

```text
[ ] Resident solo opera unidades propias.
[ ] Resident no opera unidad ajena.
[ ] Resident no opera tenant ajeno.
[ ] Cross-tenant unit se responde como 404.
```

---

# 34. EPIC-024-30 — Notifications integration

## Objetivo

Integrar notificaciones sanitizadas.

## Tasks

```text
[ ] Crear AccessNotificationsPort.
[ ] Crear NotificationsAccessAdapter.
[ ] Implementar notifyVisitorArrived.
[ ] Implementar notifyAuthorizationCreated.
[ ] Implementar notifyAuthorizationCancelled.
[ ] Implementar notifyAuthorizationRevoked.
[ ] Implementar notifyIncidentCreated.
[ ] Implementar notifyDeliveryReceived.
[ ] Implementar notifyDeliveryReturned.
[ ] Minimizar payloads de notificación.
[ ] Enmascarar identificación en notificaciones.
[ ] Enmascarar placa en notificaciones.
[ ] Evitar notas internas en notificaciones.
[ ] Definir policy de fallo de notificación.
[ ] Agregar tests notifications.
```

## Acceptance criteria

```text
[ ] Notificaciones no incluyen identificación completa.
[ ] Notificaciones no incluyen placa completa.
[ ] Notificaciones no incluyen passCode completo salvo canal seguro y política explícita.
[ ] Notificaciones no incluyen documentos completos.
[ ] Fallo de notificación no rompe check-in salvo policy estricta.
```

---

# 35. EPIC-024-31 — Supplier Payments boundary

## Objetivo

Integrar referencias a proveedores sin efectos financieros.

## Tasks

```text
[ ] Crear AccessSupplierPaymentsPort.
[ ] Crear SupplierPaymentsAccessAdapter.
[ ] Implementar validateSupplier.
[ ] Implementar getSupplierSummary.
[ ] Validar supplierId tenant-scoped.
[ ] Rechazar supplier inactive.
[ ] Rechazar supplier blocked salvo override auditado.
[ ] Rechazar supplier archived.
[ ] Impedir createSupplierPayable.
[ ] Impedir createSupplierPaymentOrder.
[ ] Impedir markPaid.
[ ] Impedir createPayment.
[ ] Impedir createPaymentAllocation.
[ ] Impedir modificación de cuenta bancaria de proveedor.
[ ] Agregar tests boundary.
```

## Acceptance criteria

```text
[ ] Access Control solo valida y referencia supplier.
[ ] Access Control no crea pagos.
[ ] Access Control no crea SupplierPaymentOrder.
[ ] Access Control no marca paid.
```

---

# 36. EPIC-024-32 — Maintenance Work Orders boundary

## Objetivo

Integrar referencias a órdenes de mantenimiento sin modificar mantenimiento.

## Tasks

```text
[ ] Crear AccessMaintenanceWorkOrdersPort.
[ ] Crear MaintenanceWorkOrdersAccessAdapter.
[ ] Implementar validateWorkOrder.
[ ] Implementar getWorkOrderSummary.
[ ] Validar maintenanceWorkOrderId tenant-scoped.
[ ] Rechazar WorkOrder archived.
[ ] Rechazar WorkOrder tenantB.
[ ] Impedir closeWorkOrder.
[ ] Impedir updateWorkOrderStatus.
[ ] Impedir createMaintenanceCost.
[ ] Impedir approveMaintenanceCost.
[ ] Impedir createSupplierPayable.
[ ] Agregar tests boundary.
```

## Acceptance criteria

```text
[ ] Access Control puede vincular visita técnica a WorkOrder.
[ ] Access Control no cierra WorkOrder.
[ ] Access Control no cambia estados de WorkOrder.
[ ] Access Control no crea costos.
[ ] Access Control no crea payables.
```

---

# 37. EPIC-024-33 — Reports

## Objetivo

Implementar reportes básicos de accesos.

## Tasks

```text
[ ] Crear AccessReportService.
[ ] Implementar events report.
[ ] Implementar visitors report.
[ ] Implementar authorizations report.
[ ] Implementar incidents report.
[ ] Implementar open check-ins report.
[ ] Implementar deliveries report.
[ ] Implementar supplier visits report.
[ ] Implementar filtros tenant-scoped.
[ ] Implementar validación dateFrom <= dateTo.
[ ] Implementar page/pageSize.
[ ] Implementar max pageSize 100.
[ ] Enmascarar identificación en reportes.
[ ] Enmascarar teléfono en reportes.
[ ] Enmascarar placa en reportes.
[ ] Ocultar passCode raw.
[ ] Ocultar hashes.
[ ] Implementar AccessReportsController.
[ ] Agregar audit accessReport.generated.
[ ] Agregar tests API.
[ ] Agregar tests privacy.
[ ] Agregar tests performance básicos.
```

## Acceptance criteria

```text
[ ] Reportes no mezclan tenants.
[ ] Reportes no devuelven raw PII.
[ ] Reportes no devuelven hashes.
[ ] Reportes son paginados.
```

---

# 38. EPIC-024-34 — Report exports

## Objetivo

Implementar exportaciones vía Secure Document Storage.

## Tasks

```text
[ ] Crear AccessExportService.
[ ] Implementar export events.
[ ] Implementar export visitors.
[ ] Implementar export authorizations.
[ ] Implementar export incidents.
[ ] Implementar export openCheckIns.
[ ] Implementar export deliveries.
[ ] Implementar export supplierVisits.
[ ] Crear AccessReportExport record.
[ ] Generar archivo CSV.
[ ] Soportar XLSX si export engine global existe.
[ ] Soportar PDF si export engine global existe.
[ ] Sanitizar filtros.
[ ] Enmascarar datos personales en export.
[ ] Excluir hashes del export.
[ ] Crear SecureDocument vía SDS.
[ ] Actualizar export status completed.
[ ] Manejar export status failed.
[ ] No devolver storageKey.
[ ] No devolver signedUrl persistente.
[ ] Auditar accessReport.exported.
[ ] Agregar tests de export.
```

## Acceptance criteria

```text
[ ] Export completed tiene secureDocumentId.
[ ] Export no contiene datos raw sensibles.
[ ] Response no contiene storageKey.
[ ] Response no contiene signedUrl persistente.
[ ] Export failed conserva failureReason sanitizado.
```

---

# 39. EPIC-024-35 — Audit implementation

## Objetivo

Registrar auditoría obligatoria de operaciones críticas.

## Tasks

```text
[ ] Crear AccessAuditPort.
[ ] Crear AccessAuditService.
[ ] Integrar con módulo 007-audit.
[ ] Definir audit category = accessControl.
[ ] Auditar visitor created/updated/watchlisted/blocked/archived.
[ ] Auditar vehicle created/updated/watchlisted/blocked/archived.
[ ] Auditar gate created/updated/archived.
[ ] Auditar authorization created/activated/cancelled/revoked/expired/used.
[ ] Auditar pass created/validated/used/expired/revoked.
[ ] Auditar checkIn recorded/voided.
[ ] Auditar checkOut recorded/voided.
[ ] Auditar event recorded/corrected/voided.
[ ] Auditar delivery created/received/delivered/returned/cancelled.
[ ] Auditar supplierVisit created/checkedIn/checkedOut/cancelled/denied.
[ ] Auditar incident created/updated/resolved/dismissed.
[ ] Auditar comment created/archived.
[ ] Auditar document created/downloaded/archived.
[ ] Auditar report generated/exported.
[ ] Sanitizar metadata.
[ ] Excluir identificationNumberRaw.
[ ] Excluir phoneRaw.
[ ] Excluir emailRaw.
[ ] Excluir plateRaw.
[ ] Excluir passCodeRaw.
[ ] Excluir hashes sensibles.
[ ] Excluir storageKey.
[ ] Excluir signedUrl.
[ ] Excluir base64.
[ ] Excluir biometricTemplate.
[ ] Excluir faceEmbedding.
[ ] Excluir gateOpenCommand.
[ ] Agregar audit tests.
```

## Acceptance criteria

```text
[ ] Toda operación crítica tiene audit.
[ ] Audit incluye tenantId, actor, action, resource y traceId.
[ ] Audit no contiene datos personales raw.
[ ] Audit no contiene storageKey.
[ ] Audit no contiene datos prohibidos.
```

---

# 40. EPIC-024-36 — Observability

## Objetivo

Implementar logs, métricas y trazabilidad segura.

## Tasks

```text
[ ] Crear AccessObservabilityService.
[ ] Definir logs seguros para accessAuthorization.created.
[ ] Definir logs seguros para accessAuthorization.cancelled.
[ ] Definir logs seguros para accessPass.validated.
[ ] Definir logs seguros para accessCheckIn.recorded.
[ ] Definir logs seguros para accessCheckOut.recorded.
[ ] Definir logs seguros para accessDenied.recorded.
[ ] Definir logs seguros para accessIncident.created.
[ ] Definir logs seguros para accessReport.exported.
[ ] Implementar metric access_authorizations_total.
[ ] Implementar metric access_authorizations_active_total.
[ ] Implementar metric access_pass_validations_total.
[ ] Implementar metric access_checkins_total.
[ ] Implementar metric access_checkouts_total.
[ ] Implementar metric access_denied_total.
[ ] Implementar metric access_open_checkins_total.
[ ] Implementar metric access_incidents_total.
[ ] Implementar metric access_reports_exported_total.
[ ] Bloquear labels prohibidos.
[ ] Agregar tests de logs.
[ ] Agregar tests de metrics.
```

## Acceptance criteria

```text
[ ] Logs no contienen PII raw.
[ ] Logs no contienen storageKey.
[ ] Logs no contienen raw payload.
[ ] Metrics no usan tenantId como label.
[ ] Metrics no usan visitorId, vehicleId, propertyUnitId, personId ni plate como label.
```

---

# 41. EPIC-024-37 — OpenAPI

## Objetivo

Documentar contrato API y extensiones de seguridad.

## Tasks

```text
[ ] Agregar tag Access Visitors.
[ ] Agregar tag Access Visitor Vehicles.
[ ] Agregar tag Access Gates.
[ ] Agregar tag Access Authorizations.
[ ] Agregar tag Access Passes.
[ ] Agregar tag Access Events.
[ ] Agregar tag Access Check Ins.
[ ] Agregar tag Access Check Outs.
[ ] Agregar tag Access Deliveries.
[ ] Agregar tag Access Supplier Visits.
[ ] Agregar tag Access Recurring Authorizations.
[ ] Agregar tag Access Incidents.
[ ] Agregar tag Access Comments.
[ ] Agregar tag Access Documents.
[ ] Agregar tag Access Reports.
[ ] Agregar tag Guard Access.
[ ] Agregar tag Me Access.
[ ] Documentar rutas /api/v1/tenant/access-*.
[ ] Documentar rutas /api/v1/tenant/guard/access-*.
[ ] Documentar rutas /api/v1/me/access-* permitidas.
[ ] Agregar x-tenant-scope=true.
[ ] Agregar x-auth-required=true.
[ ] Agregar x-access-control-visitors=true.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-wordpress-access=false.
[ ] Agregar x-own-resource-scope=true en /me.
[ ] Agregar x-resident-visible=true en /me.
[ ] Agregar x-guard-operated=true en Guard API.
[ ] Agregar x-secure-document-storage=true en rutas documentales.
[ ] Agregar x-storage-key-exposed=false.
[ ] Agregar x-biometric-processing=false.
[ ] Agregar x-face-recognition=false.
[ ] Agregar x-gate-opening=false.
[ ] Agregar x-hardware-control=false.
[ ] Agregar x-plate-ocr=false.
[ ] Agregar x-external-ai-real-data=false.
[ ] Agregar OpenAPI tests.
```

## No documentar

```text
[ ] No documentar /api/v1/public/access-*.
[ ] No documentar /api/v1/public/tenants/{slug}/access-*.
[ ] No documentar tenantId en DTOs externos.
[ ] No documentar actor fields.
[ ] No documentar identificationNumberHash.
[ ] No documentar phoneHash.
[ ] No documentar emailHash.
[ ] No documentar plateHash.
[ ] No documentar passCodeHash.
[ ] No documentar storageKey.
[ ] No documentar signedUrl persistente.
[ ] No documentar base64.
[ ] No documentar biometricTemplate.
[ ] No documentar faceEmbedding.
[ ] No documentar cameraStreamUrl.
[ ] No documentar gateOpenCommand.
[ ] No documentar hardwareDeviceCommand.
[ ] No documentar externalAiEnabled.
```

---

# 42. EPIC-024-38 — Security and privacy hardening

## Objetivo

Cerrar brechas de seguridad y privacidad antes de merge final.

## Tasks

```text
[ ] Ejecutar forbidden fields tests.
[ ] Ejecutar multitenancy tests.
[ ] Ejecutar own-resource tests.
[ ] Ejecutar guard authorization tests.
[ ] Ejecutar privacy tests.
[ ] Ejecutar no public tests.
[ ] Ejecutar no WordPress tests.
[ ] Ejecutar no hardware tests.
[ ] Ejecutar no biometrics tests.
[ ] Ejecutar no face recognition tests.
[ ] Ejecutar no plate OCR tests.
[ ] Ejecutar no external AI tests.
[ ] Ejecutar no payment tests.
[ ] Ejecutar no SupplierPaymentOrder tests.
[ ] Ejecutar no accounting tests.
[ ] Ejecutar no reconciliation tests.
[ ] Verificar CORS sin wildcard.
[ ] Verificar headers de seguridad.
[ ] Verificar error sanitizer.
[ ] Verificar audit sanitizer.
[ ] Verificar log sanitizer.
[ ] Verificar OpenAPI sin campos prohibidos.
[ ] Verificar feature flags prohibidos false.
```

## Acceptance criteria

```text
[ ] Security tests críticos pasan 100%.
[ ] Privacy tests críticos pasan 100%.
[ ] No hay rutas públicas.
[ ] No hay acceso WordPress público.
[ ] No hay storageKey en API/logs/audit.
[ ] No hay PII raw en responses generales.
[ ] No hay biometría.
[ ] No hay reconocimiento facial.
[ ] No hay apertura de portones.
[ ] No hay control de hardware.
```

---

# 43. EPIC-024-39 — Performance and concurrency

## Objetivo

Validar desempeño y consistencia bajo concurrencia.

## Tasks

```text
[ ] Preparar dataset performance tenantA.
[ ] Preparar dataset parcial tenantB.
[ ] Test consultar autorizaciones activas p95 < 800 ms.
[ ] Test validar pass p95 < 800 ms.
[ ] Test registrar check-in p95 < 1000 ms.
[ ] Test registrar check-out p95 < 1000 ms.
[ ] Test listar eventos paginados p95 < 1200 ms.
[ ] Test consultar check-ins abiertos p95 < 1200 ms.
[ ] Test reporte eventos p95 < 1500 ms.
[ ] Test reporte incidentes p95 < 1500 ms.
[ ] Test exportación pequeña p95 < 3000 ms.
[ ] Test pageSize max 100.
[ ] Test Guard recent events pageSize max 50.
[ ] Test sin N+1 evidente.
[ ] Test dos guardias validan mismo oneTime pass simultáneamente.
[ ] Test dos guardias crean check-in con maxEntries=1 simultáneamente.
[ ] Test dos guardias registran check-out simultáneo.
[ ] Test cancel authorization y check-in simultáneo.
[ ] Test revoke pass y validate pass simultáneo.
[ ] Test generación concurrente de authorizationNumber.
[ ] Test generación concurrente de eventNumber.
[ ] Test generación concurrente de incidentNumber.
```

## Acceptance criteria

```text
[ ] No se reutiliza pass oneTime bajo concurrencia.
[ ] No se supera maxEntries bajo concurrencia.
[ ] No existe doble check-out activo.
[ ] Secuencias operativas no se duplican.
```

---

# 44. EPIC-024-40 — CI gates

## Objetivo

Configurar validaciones obligatorias del pipeline.

## Tasks

```text
[ ] Agregar unit tests al pipeline.
[ ] Agregar masking tests al pipeline.
[ ] Agregar hashing tests al pipeline.
[ ] Agregar integration tests al pipeline.
[ ] Agregar API tenant tests al pipeline.
[ ] Agregar Guard API tests al pipeline.
[ ] Agregar /me API tests al pipeline.
[ ] Agregar authz tests al pipeline.
[ ] Agregar own-resource tests al pipeline.
[ ] Agregar multitenancy tests al pipeline.
[ ] Agregar privacy tests al pipeline.
[ ] Agregar forbidden fields tests al pipeline.
[ ] Agregar no public tests al pipeline.
[ ] Agregar no WordPress tests al pipeline.
[ ] Agregar no hardware tests al pipeline.
[ ] Agregar no biometrics tests al pipeline.
[ ] Agregar no face recognition tests al pipeline.
[ ] Agregar no plate OCR tests al pipeline.
[ ] Agregar no external AI tests al pipeline.
[ ] Agregar audit tests al pipeline.
[ ] Agregar observability tests al pipeline.
[ ] Agregar OpenAPI contract tests al pipeline.
[ ] Agregar smoke tests al pipeline.
```

## Pipeline must fail if

```text
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta status directo fuera de transición.
[ ] Algún DTO acepta identificationNumberHash.
[ ] Algún DTO acepta plateHash.
[ ] Algún DTO acepta passCodeHash.
[ ] Algún DTO acepta storageKey.
[ ] API permite visitor cross-tenant.
[ ] API permite vehicle cross-tenant.
[ ] API permite authorization cross-tenant.
[ ] API permite pass cross-tenant.
[ ] API permite event cross-tenant.
[ ] API permite check-in cross-tenant.
[ ] API permite check-out cross-tenant.
[ ] Resident puede ver unidad ajena.
[ ] Guard puede operar tenant ajeno.
[ ] Response expone identification raw.
[ ] Response expone plate raw.
[ ] Response expone passCode raw persistente.
[ ] Response expone storageKey.
[ ] Logs contienen raw PII.
[ ] Audit contiene raw PII.
[ ] API crea endpoint público.
[ ] API permite WordPress público.
[ ] API implementa gate opening.
[ ] API implementa biometric processing.
[ ] API implementa face recognition.
[ ] API implementa plate OCR.
[ ] API llama IA externa con datos reales.
[ ] API crea Payment.
[ ] API crea SupplierPaymentOrder.
[ ] API crea JournalEntry.
```

---

# 45. EPIC-024-41 — Seeds

## Objetivo

Crear datos iniciales ficticios y seguros.

## Tasks

```text
[ ] Crear seed de gate MAIN_GATE.
[ ] Crear seed de gate VEHICLE_GATE.
[ ] Crear seed de gate PEDESTRIAN_GATE.
[ ] Crear seed de gate SUPPLIER_GATE.
[ ] Crear seed de gate SECONDARY_GATE.
[ ] Crear fixtures de visitor types.
[ ] Crear fixtures de visitors ficticios para tests.
[ ] Crear fixtures de vehicles ficticios para tests.
[ ] Crear fixtures de authorizations ficticias.
[ ] Crear fixtures de passes ficticios.
[ ] Crear fixtures de events ficticios.
[ ] Crear fixtures de incidents ficticios.
[ ] Crear fixtures de deliveries ficticios.
[ ] Crear fixtures de supplier visits ficticios.
[ ] Crear fixtures tenantA.
[ ] Crear fixtures tenantB.
```

## Acceptance criteria

```text
[ ] Seeds son tenant-scoped.
[ ] Seeds son ficticios.
[ ] Seeds no contienen visitantes reales.
[ ] Seeds no contienen identificaciones reales.
[ ] Seeds no contienen placas reales.
[ ] Seeds no contienen teléfonos reales.
[ ] Seeds no contienen documentos reales.
[ ] Seeds no contienen proveedores reales salvo fixtures sintéticos.
```

---

# 46. EPIC-024-42 — Smoke tests

## Objetivo

Validar flujos completos.

## Tasks

```text
[ ] Implementar smoke configuración inicial de gates.
[ ] Implementar smoke residente crea visitante.
[ ] Implementar smoke residente crea autorización.
[ ] Implementar smoke residente cancela autorización.
[ ] Implementar smoke guardia valida pase.
[ ] Implementar smoke guardia registra check-in.
[ ] Implementar smoke guardia registra check-out.
[ ] Implementar smoke ingreso denegado.
[ ] Implementar smoke entrega.
[ ] Implementar smoke visita de proveedor.
[ ] Implementar smoke incidente.
[ ] Implementar smoke documento SDS.
[ ] Implementar smoke reporte.
[ ] Implementar smoke exportación.
[ ] Agregar smoke tests al CI.
```

## Smoke base

```text
[ ] TenantAdmin crea MAIN_GATE.
[ ] ResidentA1 crea VisitorProfile desde /me.
[ ] ResidentA1 crea AccessAuthorization para unitA101.
[ ] Sistema genera AccessPass.
[ ] GuardA valida AccessPass.
[ ] GuardA registra check-in.
[ ] Sistema crea AccessEvent checkIn.
[ ] Sistema crea AccessCheckIn open.
[ ] GuardA registra check-out.
[ ] Sistema crea AccessEvent checkOut.
[ ] Sistema crea AccessCheckOut.
[ ] Sistema cierra AccessCheckIn.
[ ] TenantAdmin consulta events report.
[ ] TenantAdmin exporta events report.
[ ] Sistema crea SecureDocument.
[ ] Response no contiene storageKey.
[ ] Audit contiene eventos críticos.
```

---

# 47. Plan de Pull Requests sugerido

## PR-024-01 — Module skeleton, config, flags and enums

Incluye:

```text
[ ] EPIC-024-01.
[ ] EPIC-024-02.
[ ] EPIC-024-03.
```

Acceptance:

```text
[ ] Módulo compila.
[ ] Flags prohibidos bloquean boot.
[ ] Enums y errores definidos.
```

---

## PR-024-02 — Masking, hashing, value objects, entities and policies

Incluye:

```text
[ ] EPIC-024-04.
[ ] EPIC-024-05.
[ ] EPIC-024-06.
[ ] EPIC-024-07.
[ ] EPIC-024-08.
```

Acceptance:

```text
[ ] Domain tests pasan.
[ ] Privacy helpers pasan.
[ ] Policies críticas pasan.
```

---

## PR-024-03 — Prisma schema, migration, constraints and indexes

Incluye:

```text
[ ] EPIC-024-09.
```

Acceptance:

```text
[ ] Migración limpia.
[ ] Índices creados.
[ ] Constraints creados.
[ ] Todas las tablas incluyen tenant_id.
[ ] No existen campos prohibidos.
```

---

## PR-024-04 — Repository ports and Prisma repositories

Incluye:

```text
[ ] EPIC-024-10.
```

Acceptance:

```text
[ ] Repositories tenant-scoped.
[ ] Cross-tenant retorna null.
[ ] Hash search filtra tenant.
[ ] Tests de repositorios pasan.
```

---

## PR-024-05 — DTOs, guards and authorization

Incluye:

```text
[ ] EPIC-024-11.
[ ] EPIC-024-12.
```

Acceptance:

```text
[ ] Forbidden fields rechazados.
[ ] Sin auth retorna 401.
[ ] Sin permiso retorna 403.
[ ] Cross-tenant retorna 404.
```

---

## PR-024-06 — Visitors, vehicles and gates

Incluye:

```text
[ ] EPIC-024-13.
[ ] EPIC-024-14.
[ ] EPIC-024-15.
```

Acceptance:

```text
[ ] Visitantes funcionan.
[ ] Vehículos funcionan.
[ ] Gates funcionan.
[ ] PII se enmascara.
[ ] No hardware commands.
```

---

## PR-024-07 — Authorizations and access passes

Incluye:

```text
[ ] EPIC-024-16.
[ ] EPIC-024-17.
```

Acceptance:

```text
[ ] Autorizaciones funcionan.
[ ] Passes temporales funcionan.
[ ] OneTime no se reutiliza.
[ ] No pass raw persistente.
```

---

## PR-024-08 — Check-in, check-out and access events

Incluye:

```text
[ ] EPIC-024-18.
[ ] EPIC-024-19.
[ ] EPIC-024-20.
```

Acceptance:

```text
[ ] Check-in crea event y checkIn.
[ ] Check-out crea event y checkOut.
[ ] Check-out cierra checkIn.
[ ] Check-out duplicado falla.
[ ] Eventos son auditables.
```

---

## PR-024-09 — Guard API

Incluye:

```text
[ ] EPIC-024-21.
```

Acceptance:

```text
[ ] Guard API autenticada.
[ ] Guard API tenant-scoped.
[ ] Resident no accede Guard API.
[ ] GuardA no opera tenantB.
```

---

## PR-024-10 — /me resident API

Incluye:

```text
[ ] EPIC-024-22.
```

Acceptance:

```text
[ ] Resident crea visitor propio.
[ ] Resident crea autorización para unidad propia.
[ ] Resident no ve unidad ajena.
[ ] /me no expone datos internos.
```

---

## PR-024-11 — Deliveries, supplier visits and recurring authorizations

Incluye:

```text
[ ] EPIC-024-23.
[ ] EPIC-024-24.
[ ] EPIC-024-25.
```

Acceptance:

```text
[ ] Deliveries funcionan.
[ ] Supplier visits funcionan sin pagos.
[ ] Recurring authorizations funcionan.
[ ] No efectos financieros.
```

---

## PR-024-12 — Incidents and comments

Incluye:

```text
[ ] EPIC-024-26.
[ ] EPIC-024-27.
```

Acceptance:

```text
[ ] Incidents funcionan.
[ ] Comments funcionan.
[ ] Internal comments no se exponen en /me.
[ ] Critical incident puede notificar.
```

---

## PR-024-13 — Documents via Secure Document Storage

Incluye:

```text
[ ] EPIC-024-28.
```

Acceptance:

```text
[ ] Documentos vía SDS.
[ ] No storageKey.
[ ] No signedUrl persistente.
[ ] No base64.
```

---

## PR-024-14 — Internal integrations

Incluye:

```text
[ ] EPIC-024-29.
[ ] EPIC-024-30.
[ ] EPIC-024-31.
[ ] EPIC-024-32.
```

Acceptance:

```text
[ ] Residents/Properties boundary funciona.
[ ] Notifications sanitizadas.
[ ] Supplier boundary no crea pagos.
[ ] Maintenance boundary no modifica WorkOrders.
```

---

## PR-024-15 — Reports and exports

Incluye:

```text
[ ] EPIC-024-33.
[ ] EPIC-024-34.
```

Acceptance:

```text
[ ] Reportes tenant-scoped.
[ ] Reportes privacy-safe.
[ ] Exports vía SDS.
[ ] No storageKey.
```

---

## PR-024-16 — Audit, observability and OpenAPI

Incluye:

```text
[ ] EPIC-024-35.
[ ] EPIC-024-36.
[ ] EPIC-024-37.
```

Acceptance:

```text
[ ] Audit completo.
[ ] Logs sanitizados.
[ ] Metrics seguras.
[ ] OpenAPI sin campos prohibidos.
```

---

## PR-024-17 — Security hardening and CI gates

Incluye:

```text
[ ] EPIC-024-38.
[ ] EPIC-024-40.
```

Acceptance:

```text
[ ] Security gates pasan.
[ ] Privacy gates pasan.
[ ] No public.
[ ] No WordPress.
[ ] No hardware.
[ ] No biometrics.
[ ] No external AI.
```

---

## PR-024-18 — Performance, concurrency, seeds and smoke tests

Incluye:

```text
[ ] EPIC-024-39.
[ ] EPIC-024-41.
[ ] EPIC-024-42.
```

Acceptance:

```text
[ ] Performance básica cumple.
[ ] Concurrency crítica cumple.
[ ] Seeds ficticios funcionan.
[ ] Smoke completo pasa.
```

---

# 48. Checklist de implementación por endpoint

## 48.1. Visitors

```text
[ ] GET /api/v1/tenant/access-visitors.
[ ] POST /api/v1/tenant/access-visitors.
[ ] GET /api/v1/tenant/access-visitors/{visitorId}.
[ ] PATCH /api/v1/tenant/access-visitors/{visitorId}.
[ ] POST /api/v1/tenant/access-visitors/{visitorId}/watchlist.
[ ] POST /api/v1/tenant/access-visitors/{visitorId}/block.
[ ] POST /api/v1/tenant/access-visitors/{visitorId}/archive.
```

---

## 48.2. Vehicles

```text
[ ] GET /api/v1/tenant/access-visitor-vehicles.
[ ] POST /api/v1/tenant/access-visitor-vehicles.
[ ] GET /api/v1/tenant/access-visitor-vehicles/{vehicleId}.
[ ] PATCH /api/v1/tenant/access-visitor-vehicles/{vehicleId}.
[ ] POST /api/v1/tenant/access-visitor-vehicles/{vehicleId}/watchlist.
[ ] POST /api/v1/tenant/access-visitor-vehicles/{vehicleId}/block.
[ ] POST /api/v1/tenant/access-visitor-vehicles/{vehicleId}/archive.
```

---

## 48.3. Gates

```text
[ ] GET /api/v1/tenant/access-gates.
[ ] POST /api/v1/tenant/access-gates.
[ ] GET /api/v1/tenant/access-gates/{gateId}.
[ ] PATCH /api/v1/tenant/access-gates/{gateId}.
[ ] POST /api/v1/tenant/access-gates/{gateId}/archive.
```

---

## 48.4. Authorizations and passes

```text
[ ] GET /api/v1/tenant/access-authorizations.
[ ] POST /api/v1/tenant/access-authorizations.
[ ] GET /api/v1/tenant/access-authorizations/{authorizationId}.
[ ] POST /api/v1/tenant/access-authorizations/{authorizationId}/cancel.
[ ] POST /api/v1/tenant/access-authorizations/{authorizationId}/revoke.

[ ] GET /api/v1/tenant/access-passes.
[ ] POST /api/v1/tenant/access-authorizations/{authorizationId}/passes.
[ ] POST /api/v1/tenant/access-passes/validate.
[ ] POST /api/v1/tenant/access-passes/{passId}/revoke.
```

---

## 48.5. Events, check-ins and check-outs

```text
[ ] GET /api/v1/tenant/access-events.
[ ] GET /api/v1/tenant/access-events/{eventId}.
[ ] POST /api/v1/tenant/access-events/{eventId}/correct.
[ ] POST /api/v1/tenant/access-events/{eventId}/void.

[ ] GET /api/v1/tenant/access-check-ins.
[ ] POST /api/v1/tenant/access-check-ins.
[ ] GET /api/v1/tenant/access-check-ins/{checkInId}.
[ ] POST /api/v1/tenant/access-check-ins/{checkInId}/void.

[ ] GET /api/v1/tenant/access-check-outs.
[ ] POST /api/v1/tenant/access-check-outs.
[ ] GET /api/v1/tenant/access-check-outs/{checkOutId}.
[ ] POST /api/v1/tenant/access-check-outs/{checkOutId}/void.
```

---

## 48.6. Guard API

```text
[ ] GET /api/v1/tenant/guard/access-authorizations/active.
[ ] POST /api/v1/tenant/guard/access-passes/validate.
[ ] POST /api/v1/tenant/guard/access-check-ins.
[ ] POST /api/v1/tenant/guard/access-check-outs.
[ ] GET /api/v1/tenant/guard/access-events/recent.
[ ] POST /api/v1/tenant/guard/access-denied.
[ ] POST /api/v1/tenant/guard/access-incidents.
[ ] POST /api/v1/tenant/guard/access-deliveries.
```

---

## 48.7. `/me` API

```text
[ ] GET /api/v1/me/access-visitors.
[ ] POST /api/v1/me/access-visitors.
[ ] GET /api/v1/me/access-authorizations.
[ ] POST /api/v1/me/access-authorizations.
[ ] GET /api/v1/me/access-authorizations/{authorizationId}.
[ ] POST /api/v1/me/access-authorizations/{authorizationId}/cancel.
[ ] GET /api/v1/me/access-events.
```

---

## 48.8. Deliveries, supplier visits and recurring

```text
[ ] GET /api/v1/tenant/access-deliveries.
[ ] POST /api/v1/tenant/access-deliveries.
[ ] GET /api/v1/tenant/access-deliveries/{deliveryId}.
[ ] POST /api/v1/tenant/access-deliveries/{deliveryId}/deliver.
[ ] POST /api/v1/tenant/access-deliveries/{deliveryId}/return.
[ ] POST /api/v1/tenant/access-deliveries/{deliveryId}/cancel.

[ ] GET /api/v1/tenant/access-supplier-visits.
[ ] POST /api/v1/tenant/access-supplier-visits.
[ ] GET /api/v1/tenant/access-supplier-visits/{supplierVisitId}.
[ ] POST /api/v1/tenant/access-supplier-visits/{supplierVisitId}/check-in.
[ ] POST /api/v1/tenant/access-supplier-visits/{supplierVisitId}/check-out.
[ ] POST /api/v1/tenant/access-supplier-visits/{supplierVisitId}/cancel.
[ ] POST /api/v1/tenant/access-supplier-visits/{supplierVisitId}/deny.

[ ] GET /api/v1/tenant/access-recurring-authorizations.
[ ] POST /api/v1/tenant/access-recurring-authorizations.
[ ] GET /api/v1/tenant/access-recurring-authorizations/{recurringAuthorizationId}.
[ ] POST /api/v1/tenant/access-recurring-authorizations/{recurringAuthorizationId}/cancel.
[ ] POST /api/v1/tenant/access-recurring-authorizations/{recurringAuthorizationId}/revoke.
```

---

## 48.9. Incidents, comments, documents and reports

```text
[ ] GET /api/v1/tenant/access-incidents.
[ ] POST /api/v1/tenant/access-incidents.
[ ] GET /api/v1/tenant/access-incidents/{incidentId}.
[ ] PATCH /api/v1/tenant/access-incidents/{incidentId}.
[ ] POST /api/v1/tenant/access-incidents/{incidentId}/resolve.
[ ] POST /api/v1/tenant/access-incidents/{incidentId}/dismiss.

[ ] GET /api/v1/tenant/access-comments.
[ ] POST /api/v1/tenant/access-comments.
[ ] POST /api/v1/tenant/access-comments/{commentId}/archive.

[ ] GET /api/v1/tenant/access-documents.
[ ] POST /api/v1/tenant/access-documents.
[ ] GET /api/v1/tenant/access-documents/{documentId}.
[ ] POST /api/v1/tenant/access-documents/{documentId}/archive.

[ ] GET /api/v1/tenant/access-reports/events.
[ ] GET /api/v1/tenant/access-reports/visitors.
[ ] GET /api/v1/tenant/access-reports/authorizations.
[ ] GET /api/v1/tenant/access-reports/incidents.
[ ] GET /api/v1/tenant/access-reports/open-check-ins.
[ ] GET /api/v1/tenant/access-reports/deliveries.
[ ] GET /api/v1/tenant/access-reports/supplier-visits.
[ ] GET /api/v1/tenant/access-reports/export.
```

---

# 49. Checklist de seguridad final

```text
[ ] Todas las rutas permitidas requieren AuthGuard.
[ ] Todas las rutas tenant requieren TenantGuard.
[ ] Todas las rutas requieren PermissionGuard.
[ ] Guard API requiere GuardOperationGuard.
[ ] /me API requiere OwnResourceGuard.
[ ] Ningún DTO acepta tenantId.
[ ] Ningún DTO acepta actor fields.
[ ] Ningún DTO acepta status directo fuera de transición.
[ ] Ningún DTO acepta identificationNumberHash.
[ ] Ningún DTO acepta phoneHash.
[ ] Ningún DTO acepta emailHash.
[ ] Ningún DTO acepta plateHash.
[ ] Ningún DTO acepta passCodeHash.
[ ] Ningún DTO acepta storageKey.
[ ] Ningún DTO acepta signedUrl.
[ ] Ningún DTO acepta base64.
[ ] Ningún DTO acepta biometricTemplate.
[ ] Ningún DTO acepta faceEmbedding.
[ ] Ningún DTO acepta cameraStreamUrl.
[ ] Ningún DTO acepta gateOpenCommand.
[ ] Ningún DTO acepta hardwareDeviceCommand.
[ ] Ningún DTO acepta externalAiEnabled.
[ ] Ninguna response expone identificationNumber raw.
[ ] Ninguna response expone phone raw.
[ ] Ninguna response expone email raw.
[ ] Ninguna response expone plate raw.
[ ] Ninguna response expone passCode raw persistente.
[ ] Ninguna response expone hashes sensibles.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] Resident solo ve recursos propios.
[ ] Guard no opera tenant ajeno.
[ ] Access Control no abre portones.
[ ] Access Control no controla hardware.
[ ] Access Control no procesa biometría.
[ ] Access Control no hace reconocimiento facial.
[ ] Access Control no hace OCR automático de placas.
[ ] Access Control no crea Payment.
[ ] Access Control no crea SupplierPaymentOrder.
[ ] Access Control no crea JournalEntry.
[ ] Access Control no confirma Bank Reconciliation.
[ ] Access Control no modifica Maintenance Work Orders.
[ ] Access Control no envía datos reales a IA externa.
[ ] Logs no contienen datos prohibidos.
[ ] Audit no contiene datos prohibidos.
[ ] OpenAPI no documenta campos prohibidos.
```

---

# 50. Definition of Done

```text
[ ] spec.md aprobado.
[ ] plan.md aprobado.
[ ] data-model.md aprobado.
[ ] api-contract.md aprobado.
[ ] test-plan.md aprobado.
[ ] tasks.md aprobado.
[ ] security-notes.md creado y aprobado.
[ ] Módulo NestJS implementado.
[ ] Configuración implementada.
[ ] Feature flags implementadas.
[ ] Enums implementados.
[ ] Errores implementados.
[ ] Masking helpers implementados.
[ ] Hashing helpers implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
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
[ ] Reportes implementados.
[ ] Exportaciones implementadas.
[ ] Auditoría implementada.
[ ] Observabilidad implementada.
[ ] OpenAPI implementado.
[ ] Seeds implementados.
[ ] Tests unitarios pasan.
[ ] Tests masking pasan.
[ ] Tests hashing pasan.
[ ] Tests integración pasan.
[ ] Tests API pasan.
[ ] Tests Guard API pasan.
[ ] Tests /me pasan.
[ ] Tests own-resource pasan.
[ ] Tests multitenancy pasan.
[ ] Tests privacy pasan.
[ ] Tests security pasan.
[ ] Tests OpenAPI pasan.
[ ] Tests performance básicos pasan.
[ ] Tests concurrency críticos pasan.
[ ] Smoke tests pasan.
[ ] CI completo pasa.
```

---

# 51. No aceptación

No se acepta implementación si:

```text
- permite visitor cross-tenant;
- permite vehicle cross-tenant;
- permite gate cross-tenant;
- permite authorization cross-tenant;
- permite pass cross-tenant;
- permite event cross-tenant;
- permite check-in cross-tenant;
- permite check-out cross-tenant;
- permite delivery cross-tenant;
- permite supplier visit cross-tenant;
- permite recurring authorization cross-tenant;
- permite incident cross-tenant;
- permite comment cross-tenant;
- permite document cross-tenant;
- permite report cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta status directo fuera de transición;
- acepta authorizationNumber desde cliente;
- acepta eventNumber desde cliente;
- acepta deliveryNumber desde cliente;
- acepta supplierVisitNumber desde cliente;
- acepta incidentNumber desde cliente;
- acepta identificationNumberHash desde cliente;
- acepta phoneHash desde cliente;
- acepta emailHash desde cliente;
- acepta plateHash desde cliente;
- acepta passCodeHash desde cliente;
- expone identificationNumber raw por defecto;
- expone phone raw por defecto;
- expone email raw por defecto;
- expone plate raw por defecto;
- expone passCode raw persistente;
- expone hashes sensibles;
- acepta storageKey;
- devuelve storageKey;
- acepta signedUrl persistente;
- acepta base64;
- acepta rawFilePayload;
- acepta biometricTemplate;
- acepta faceEmbedding;
- acepta cameraStreamUrl;
- acepta gateOpenCommand;
- acepta hardwareDeviceCommand;
- implementa reconocimiento facial;
- implementa biometría;
- implementa OCR automático de placas;
- implementa apertura automática de portones;
- implementa control físico de hardware;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- permite que residente vea unidad ajena;
- permite que guardia opere tenant ajeno;
- permite reutilizar AccessPass oneTime;
- permite check-out doble activo;
- permite borrar físicamente eventos críticos;
- omite audit de check-in;
- omite audit de check-out;
- omite audit de cancelación/revocación;
- exporta reportes sin SDS;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- modifica Accounting Ledger;
- confirma Bank Reconciliation;
- modifica estado de Maintenance Work Orders;
- crea costos de mantenimiento;
- envía datos reales a IA externa.
```

---

# 52. Resultado esperado

Al completar este backlog, el módulo `024-access-control-visitors` quedará listo para implementación controlada dentro de RESIDENT Core.

Resultado esperado:

```text
module foundation tasks definidas
configuration tasks definidas
feature flags tasks definidas
enums tasks definidas
errors tasks definidas
masking tasks definidas
hashing tasks definidas
value objects tasks definidas
entities tasks definidas
policies tasks definidas
Prisma migration tasks definidas
repository tasks definidas
DTO tasks definidas
guards tasks definidas
visitor tasks definidas
vehicle tasks definidas
gate tasks definidas
authorization tasks definidas
access pass tasks definidas
access event tasks definidas
check-in tasks definidas
check-out tasks definidas
Guard API tasks definidas
/me API tasks definidas
delivery tasks definidas
supplier visit tasks definidas
recurring authorization tasks definidas
incident tasks definidas
comment tasks definidas
SDS document tasks definidas
Residents/Properties boundary tasks definidas
Notifications boundary tasks definidas
Supplier Payments boundary tasks definidas
Maintenance Work Orders boundary tasks definidas
reports tasks definidas
exports tasks definidas
audit tasks definidas
observability tasks definidas
OpenAPI tasks definidas
security hardening tasks definidas
privacy hardening tasks definidas
performance tasks definidas
concurrency tasks definidas
CI gates tasks definidas
seeds tasks definidas
smoke tasks definidas
PR plan definido
DoD definido
no acceptance definido
```

---

# 53. Expediente actualizado

```text
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
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       └── tasks.md
```
