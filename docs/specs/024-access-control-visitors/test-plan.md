# Test Plan — 024 Access Control and Visitors

## 1. Información del documento

| Campo           | Valor                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                             |
| Spec ID         | 024                                                                                                                                       |
| Módulo          | Access Control and Visitors                                                                                                               |
| Documento       | Test Plan                                                                                                                                 |
| Ruta            | `docs/specs/024-access-control-visitors/test-plan.md`                                                                                     |
| Versión         | 0.1                                                                                                                                       |
| Estado          | Borrador inicial                                                                                                                          |
| Fecha           | 2026-07-30                                                                                                                                |
| Documento base  | `docs/specs/024-access-control-visitors/spec.md`                                                                                          |
| Plan técnico    | `docs/specs/024-access-control-visitors/plan.md`                                                                                          |
| Modelo de datos | `docs/specs/024-access-control-visitors/data-model.md`                                                                                    |
| Contrato API    | `docs/specs/024-access-control-visitors/api-contract.md`                                                                                  |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                            |
| Naturaleza      | Tenant-scoped / Security-sensitive / Privacy-sensitive / Visitor-driven / Resident-authorized / Guard-operated / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `024-access-control-visitors`.

El objetivo es validar que Access Control and Visitors funcione como un módulo seguro, multitenant, privado, auditable y operativo para gestionar visitantes, vehículos, gates, autorizaciones, pases, ingresos, salidas, entregas, proveedores visitantes, incidentes, comentarios, documentos, reportes y exportaciones.

Regla central del plan de pruebas:

```text id="acv-test-rule"
Access Control and Visitors solo puede aceptarse si todas sus pruebas demuestran tenant isolation, privacidad de visitantes, acceso /me limitado a recursos propios, operación de guardia autenticada, trazabilidad completa de check-in/check-out, enmascaramiento de identificación/placa/códigos, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de biometría, ausencia de reconocimiento facial, ausencia de apertura automática de portones, ausencia de control físico de hardware y ausencia de IA externa con datos reales.
```

---

## 3. Objetivos de prueba

```text id="acv-test-objectives"
1. Verificar tenant isolation en todas las entidades.
2. Verificar autorización por rol, permiso y recurso.
3. Verificar acceso /me limitado a unidades propias.
4. Verificar operación de Guard API sin exposición pública.
5. Verificar creación y gestión de visitantes.
6. Verificar enmascaramiento de identificación, teléfono, email, placa y códigos.
7. Verificar búsqueda segura por hash tenant-aware.
8. Verificar gestión de vehículos visitantes.
9. Verificar gestión de puntos de acceso.
10. Verificar autorizaciones de ingreso.
11. Verificar pases temporales.
12. Verificar validación de pases.
13. Verificar check-in.
14. Verificar check-out.
15. Verificar check-out duplicado.
16. Verificar denied access.
17. Verificar entregas.
18. Verificar visitas de proveedores.
19. Verificar autorizaciones recurrentes básicas.
20. Verificar incidentes.
21. Verificar comentarios internos y visibles.
22. Verificar documentos vía Secure Document Storage.
23. Verificar reportes y exportaciones.
24. Verificar auditoría obligatoria.
25. Verificar logs sanitizados.
26. Verificar métricas sin labels sensibles.
27. Verificar OpenAPI contract.
28. Verificar límites explícitos: no biometría, no facial recognition, no gate opening, no hardware control, no WordPress, no public, no external AI.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="acv-scope-in"
- Value objects.
- Masking helpers.
- Hashing helpers.
- Entities.
- State machines.
- Domain policies.
- DTO validation.
- Repository ports.
- Prisma repositories.
- Application services.
- Use cases.
- Tenant Admin API.
- Guard API.
- /me API.
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- OwnResourceGuard.
- GuardOperationGuard.
- Multitenancy.
- Privacy.
- Forbidden fields.
- Secure Document Storage boundary.
- Supplier Payments boundary.
- Maintenance Work Orders boundary.
- Notifications sanitization.
- Audit.
- Observability.
- Reports.
- Exports.
- OpenAPI.
- Performance básica.
- Concurrency básica.
- Regression tests.
- Smoke tests.
- CI security gates.
```

---

### 4.2. Fuera de alcance

No se probarán como funcionalidades propias del MVP:

```text id="acv-scope-out"
- apertura automática de portones;
- comandos a hardware físico;
- integración con torniquetes;
- integración con cerraduras inteligentes;
- cámaras CCTV;
- streaming de cámaras;
- reconocimiento facial;
- face embeddings;
- biometría;
- huellas digitales;
- iris;
- voice print;
- OCR automático de placas;
- RFID/NFC;
- app móvil offline;
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
- publicación en WordPress.
```

Estas capacidades sí deben probarse como **prohibiciones** mediante tests negativos.

---

## 5. Estrategia de pruebas

### 5.1. Pirámide de pruebas

```text id="acv-pyramid"
1. Unit tests:
   - value objects;
   - masking helpers;
   - hashing helpers;
   - entities;
   - state machines;
   - policies.

2. Integration tests:
   - repositories;
   - Prisma;
   - DB constraints;
   - application services;
   - SDS adapter;
   - Notifications adapter;
   - Supplier Payments adapter;
   - Maintenance Work Orders adapter;
   - Audit adapter.

3. API tests:
   - Tenant Admin API;
   - Guard API;
   - /me API;
   - DTO validation;
   - authz;
   - error mapping;
   - response masking.

4. Security and privacy tests:
   - tenant isolation;
   - own-resource;
   - forbidden fields;
   - no public;
   - no WordPress;
   - no biometrics;
   - no face recognition;
   - no gate opening;
   - no hardware control;
   - no storageKey;
   - no raw sensitive data.

5. E2E / smoke tests:
   - resident creates visitor;
   - resident creates authorization;
   - guard validates pass;
   - guard records check-in;
   - guard records check-out;
   - admin reviews report;
   - admin exports report via SDS.
```

---

### 5.2. Criterio general de aceptación

```text id="acv-acceptance-general"
El módulo solo pasa si todos los tests unitarios, integración, API, multitenancy, privacy, security, audit, OpenAPI y smoke flows pasan en CI.
```

---

## 6. Ambientes de prueba

### 6.1. Local

```text id="acv-local-env"
- Docker Compose.
- PostgreSQL local.
- Redis local si aplica.
- Keycloak local o mock OIDC.
- Prisma migrate dev/test.
- Seeds ficticios.
- Secure Document Storage mock/local.
```

---

### 6.2. CI

```text id="acv-ci-env"
- PostgreSQL efímero.
- Migración limpia.
- Seeds sintéticos.
- Tests unitarios.
- Tests integración.
- Tests API.
- Tests security.
- Tests privacy.
- OpenAPI validation.
- Coverage report.
```

---

### 6.3. Staging futuro

```text id="acv-staging-env"
- Keycloak staging.
- SDS staging.
- Audit activo.
- Metrics activo.
- Datos sintéticos.
- Sin visitantes reales.
- Sin identificaciones reales.
- Sin placas reales.
```

---

## 7. Datos de prueba

### 7.1. Tenants

```text id="acv-test-tenants"
tenantA = "Conjunto Demo Norte"
tenantB = "Conjunto Demo Sur"
```

Regla:

```text id="acv-test-tenant-rule"
tenantA nunca puede leer, crear, modificar, autorizar, registrar, corregir, anular, reportar, exportar o relacionar recursos de tenantB.
```

---

### 7.2. Usuarios

```text id="acv-test-users"
platformAdmin

tenantAdminA
securityManagerA
guardA1
guardA2
residentA1
residentA2
propertyOwnerA1
maintenanceManagerA
financialManagerA

tenantAdminB
securityManagerB
guardB1
residentB1

anonymousUser
```

---

### 7.3. Personas y unidades

```text id="acv-test-units"
tenantA:
- personResidentA1 -> unitA101
- personResidentA2 -> unitA102
- personOwnerA1 -> unitA103

tenantB:
- personResidentB1 -> unitB201
```

---

### 7.4. Visitantes

```text id="acv-test-visitors"
visitorGuestA
visitorFamilyA
visitorDeliveryA
visitorSupplierRepA
visitorTechnicianA
visitorBlockedA
visitorWatchlistedA
visitorArchivedA

visitorGuestB
visitorBlockedB
```

---

### 7.5. Vehículos

```text id="acv-test-vehicles"
vehicleActiveA
vehicleWatchlistedA
vehicleBlockedA
vehicleArchivedA

vehicleActiveB
```

---

### 7.6. Gates

```text id="acv-test-gates"
MAIN_GATE_A
VEHICLE_GATE_A
PEDESTRIAN_GATE_A
SUPPLIER_GATE_A
INACTIVE_GATE_A
ARCHIVED_GATE_A

MAIN_GATE_B
```

---

### 7.7. Autorizaciones y pases

```text id="acv-test-authz-passes"
authorizationOneTimeActiveA
authorizationExpiredA
authorizationCancelledA
authorizationRevokedA
authorizationUsedA
authorizationDateRangeA
authorizationRecurringA

passActiveA
passExpiredA
passUsedA
passRevokedA

authorizationActiveB
passActiveB
```

---

### 7.8. Referencias externas mock

```text id="acv-test-external"
secureDocumentA
secureDocumentB

supplierActiveA
supplierBlockedA
supplierInactiveA
supplierB

maintenanceWorkOrderOpenA
maintenanceWorkOrderArchivedA
maintenanceWorkOrderB

notificationMock
auditMock
```

---

## 8. Unit tests — Masking helpers

### 8.1. Identificación

```text id="acv-mask-identification-tests"
[ ] Enmascara cédula ecuatoriana con patrón 17******90.
[ ] Enmascara pasaporte conservando mínimo visible.
[ ] Enmascara RUC conservando mínimo visible.
[ ] Rechaza identificación vacía si el caso de uso la requiere.
[ ] No devuelve valor raw.
[ ] No loggea valor raw.
```

---

### 8.2. Teléfono

```text id="acv-mask-phone-tests"
[ ] Enmascara teléfono como 09*****321.
[ ] Normaliza espacios y guiones antes de enmascarar.
[ ] Rechaza caracteres peligrosos.
[ ] No devuelve valor raw.
```

---

### 8.3. Email

```text id="acv-mask-email-tests"
[ ] Enmascara email preservando dominio parcialmente si se usa.
[ ] Normaliza email antes de hash.
[ ] No devuelve email raw por defecto.
```

---

### 8.4. Placa

```text id="acv-mask-plate-tests"
[ ] Normaliza placa uppercase.
[ ] Enmascara placa como PB*-***4.
[ ] Rechaza caracteres peligrosos.
[ ] No devuelve plate raw.
```

---

### 8.5. Access pass

```text id="acv-mask-pass-tests"
[ ] Enmascara código AB8291 como AB**91.
[ ] No devuelve passCode raw.
[ ] No devuelve passCodeHash.
[ ] No loggea passCode raw.
```

---

## 9. Unit tests — Hashing helpers

```text id="acv-hashing-tests"
[ ] HMAC de identificación es determinístico para mismo tenantPepper.
[ ] HMAC de identificación difiere con tenantPepper distinto.
[ ] HMAC de placa es determinístico para mismo tenantPepper.
[ ] HMAC de placa difiere con tenantPepper distinto.
[ ] HMAC de teléfono es determinístico para mismo tenantPepper.
[ ] HMAC de passCode es determinístico para mismo tenantPepper.
[ ] Hash helper rechaza pepper vacío.
[ ] Hash helper no loggea raw input.
[ ] Hash helper no expone pepper.
[ ] Hash result no se devuelve en DTO público.
```

---

## 10. Unit tests — Value objects

### 10.1. VisitorFullName

```text id="acv-vo-fullname-tests"
[ ] Acepta nombre válido.
[ ] Aplica trim.
[ ] Rechaza vacío.
[ ] Rechaza longitud excesiva.
[ ] Rechaza payload HTML/script.
```

---

### 10.2. Identification value objects

```text id="acv-vo-identification-tests"
[ ] VisitorIdentificationType acepta cedula/passport/driverLicense/ruc/other/unknown.
[ ] VisitorIdentificationMasked acepta valor enmascarado.
[ ] VisitorIdentificationHash acepta hash válido.
[ ] Rechaza hash con formato inválido.
[ ] Rechaza valores raw en objetos masked/hash.
```

---

### 10.3. Vehicle plate value objects

```text id="acv-vo-plate-tests"
[ ] VisitorVehiclePlateMasked acepta placa enmascarada.
[ ] VisitorVehiclePlateHash acepta hash válido.
[ ] Rechaza placa raw en DTO response general.
[ ] Normaliza placa raw solo temporalmente.
```

---

### 10.4. Access numbers

```text id="acv-vo-number-tests"
[ ] AccessAuthorizationNumber valida AA-YYYYMM-000001.
[ ] AccessEventNumber valida AE-YYYYMM-000001.
[ ] AccessDeliveryNumber valida AD-YYYYMM-000001.
[ ] AccessSupplierVisitNumber valida ASV-YYYYMM-000001.
[ ] AccessIncidentNumber valida AI-YYYYMM-000001.
[ ] Rechaza números enviados desde cliente.
```

---

### 10.5. Access validity

```text id="acv-vo-validity-tests"
[ ] AccessValidityWindow acepta validFrom < validUntil.
[ ] Rechaza validFrom >= validUntil.
[ ] Rechaza fechas inválidas.
[ ] Rechaza timezone no normalizado si aplica.
```

---

### 10.6. Reasons and comments

```text id="acv-vo-text-tests"
[ ] AccessReason acepta texto válido.
[ ] AccessReason rechaza vacío cuando es requerido.
[ ] AccessReason sanitiza HTML/script.
[ ] AccessIncidentDescription requiere texto.
[ ] AccessCommentBody sanitiza contenido peligroso.
```

---

## 11. Unit tests — Entities

### 11.1. VisitorProfile

```text id="acv-entity-visitor-tests"
[ ] Crea visitor active.
[ ] Rechaza fullName vacío.
[ ] Actualiza datos mínimos.
[ ] Cambia active -> watchlistedTenant.
[ ] Cambia watchlistedTenant -> active.
[ ] Cambia active -> blockedTenant.
[ ] Cambia blockedTenant -> active con permiso/policy.
[ ] Archiva visitor.
[ ] Rechaza usar archived en nuevas autorizaciones.
[ ] Rechaza usar blockedTenant en autorización ordinaria.
```

---

### 11.2. VisitorVehicle

```text id="acv-entity-vehicle-tests"
[ ] Crea vehicle active.
[ ] Asocia vehicle a visitor.
[ ] Cambia active -> watchlistedTenant.
[ ] Cambia active -> blockedTenant.
[ ] Archiva vehicle.
[ ] Rechaza archived en nuevos accesos.
[ ] Rechaza blockedTenant en ingreso ordinario.
```

---

### 11.3. AccessGate

```text id="acv-entity-gate-tests"
[ ] Crea gate active.
[ ] Inactiva gate.
[ ] Archiva gate.
[ ] Rechaza gate archived en nuevo check-in.
[ ] Rechaza gate inactive salvo override.
[ ] No contiene comandos de apertura.
```

---

### 11.4. AccessAuthorization

```text id="acv-entity-authorization-tests"
[ ] Crea authorization draft.
[ ] Activa authorization válida.
[ ] Rechaza validFrom >= validUntil.
[ ] Marca oneTime como used.
[ ] Expira authorization.
[ ] Cancela authorization con razón.
[ ] Revoca authorization con razón.
[ ] Rechaza uso de expired.
[ ] Rechaza uso de cancelled.
[ ] Rechaza uso de revoked.
[ ] Rechaza entriesUsed > maxEntries.
```

---

### 11.5. AccessPass

```text id="acv-entity-pass-tests"
[ ] Crea pass active.
[ ] Requiere expiresAt futuro.
[ ] Marca pass used.
[ ] Expira pass.
[ ] Revoca pass con razón.
[ ] Rechaza uso de pass expired.
[ ] Rechaza uso de pass used.
[ ] Rechaza uso de pass revoked.
[ ] No guarda passCode raw.
```

---

### 11.6. AccessEvent

```text id="acv-entity-event-tests"
[ ] Crea event recorded.
[ ] Corrige event con razón.
[ ] Anula event con razón.
[ ] Archiva event.
[ ] Rechaza void sin reason.
[ ] Rechaza correction sin reason.
[ ] No borra historial original.
```

---

### 11.7. AccessCheckIn

```text id="acv-entity-checkin-tests"
[ ] Crea check-in open.
[ ] Cierra check-in con check-out.
[ ] Anula check-in con razón.
[ ] Rechaza manual sin manualReason.
[ ] Rechaza check-in con gate archived.
[ ] Rechaza check-in con authorization expired.
```

---

### 11.8. AccessCheckOut

```text id="acv-entity-checkout-tests"
[ ] Crea check-out recorded.
[ ] Requiere checkInId o manualReason.
[ ] Rechaza doble check-out.
[ ] Anula check-out con razón.
[ ] Rechaza salida manual sin reason.
```

---

### 11.9. VisitorDelivery

```text id="acv-entity-delivery-tests"
[ ] Crea delivery registered.
[ ] Cambia receivedAtGate.
[ ] Cambia deliveredToUnit.
[ ] Cambia returned con reason.
[ ] Cancela con reason.
[ ] Rechaza packageDescription peligrosa.
```

---

### 11.10. VisitorSupplierVisit

```text id="acv-entity-supplier-visit-tests"
[ ] Crea supplier visit scheduled.
[ ] Check-in cambia a checkedIn.
[ ] Check-out cambia a checkedOut.
[ ] Cancela con reason.
[ ] Deniega con denialReason.
[ ] Rechaza supplier blocked salvo override.
[ ] No crea SupplierPayable.
[ ] No crea Payment.
```

---

### 11.11. VisitorRecurringAuthorization

```text id="acv-entity-recurring-tests"
[ ] Crea recurrente active.
[ ] Valida daysOfWeek.
[ ] Valida timeFrom < timeUntil.
[ ] Cancela con reason.
[ ] Revoca con reason.
[ ] Expira por fecha.
[ ] Rechaza autorización permanente sin validUntil.
```

---

### 11.12. AccessIncident

```text id="acv-entity-incident-tests"
[ ] Crea incident open.
[ ] Cambia underReview.
[ ] Resuelve con resolutionReason.
[ ] Descarta con dismissReason.
[ ] Archiva.
[ ] Critical puede emitir evento notificable.
[ ] Rechaza description vacía.
```

---

## 12. Unit tests — State machines

### 12.1. VisitorProfileStatus

```text id="acv-sm-visitor"
[ ] active -> watchlistedTenant permitido.
[ ] watchlistedTenant -> active permitido.
[ ] active -> blockedTenant permitido.
[ ] watchlistedTenant -> blockedTenant permitido.
[ ] blockedTenant -> active permitido con permiso reforzado.
[ ] active -> archived permitido.
[ ] blockedTenant -> archived permitido.
[ ] archived -> active prohibido.
```

---

### 12.2. AccessAuthorizationStatus

```text id="acv-sm-authorization"
[ ] draft -> active permitido.
[ ] active -> used permitido.
[ ] active -> expired permitido.
[ ] active -> cancelled permitido.
[ ] active -> revoked permitido.
[ ] cancelled -> archived permitido.
[ ] revoked -> archived permitido.
[ ] expired -> archived permitido.
[ ] used -> archived permitido.
[ ] expired -> active prohibido.
[ ] cancelled -> active prohibido.
[ ] revoked -> active prohibido.
```

---

### 12.3. AccessPassStatus

```text id="acv-sm-pass"
[ ] active -> used permitido.
[ ] active -> expired permitido.
[ ] active -> revoked permitido.
[ ] used -> archived permitido.
[ ] expired -> archived permitido.
[ ] revoked -> archived permitido.
[ ] used -> active prohibido.
[ ] expired -> active prohibido.
[ ] revoked -> active prohibido.
```

---

### 12.4. CheckInStatus

```text id="acv-sm-checkin"
[ ] open -> closed permitido.
[ ] open -> voided permitido.
[ ] closed -> archived permitido.
[ ] voided -> archived permitido.
[ ] closed -> open prohibido.
[ ] voided -> closed prohibido.
```

---

### 12.5. AccessIncidentStatus

```text id="acv-sm-incident"
[ ] open -> underReview permitido.
[ ] open -> resolved permitido.
[ ] underReview -> resolved permitido.
[ ] open -> dismissed permitido.
[ ] underReview -> dismissed permitido.
[ ] resolved -> archived permitido.
[ ] dismissed -> archived permitido.
[ ] resolved -> open prohibido.
```

---

## 13. Unit tests — Policies

### 13.1. Tenant policy

```text id="acv-policy-tenant-tests"
[ ] Permite recurso del mismo tenant.
[ ] Rechaza recurso tenantB desde tenantA.
[ ] Cross-tenant se mapea a 404.
```

---

### 13.2. Own resource policy

```text id="acv-policy-own-tests"
[ ] ResidentA1 puede operar unitA101.
[ ] ResidentA1 no puede operar unitA102 si no está vinculado.
[ ] ResidentA1 no puede operar unitB201.
[ ] PropertyOwnerA1 opera solo si tenant policy lo permite.
[ ] /me no expone recursos de otra unidad.
```

---

### 13.3. Guard policy

```text id="acv-policy-guard-tests"
[ ] GuardA puede operar Guard API del tenantA.
[ ] GuardA no puede operar tenantB.
[ ] GuardA no puede exportar reportes masivos sin permiso explícito.
[ ] GuardA no puede borrar eventos.
[ ] GuardA no puede modificar auditoría.
```

---

### 13.4. Authorization policy

```text id="acv-policy-authorization-tests"
[ ] Authorization active y vigente permite check-in.
[ ] Authorization expired rechaza check-in.
[ ] Authorization cancelled rechaza check-in.
[ ] Authorization revoked rechaza check-in.
[ ] maxEntries alcanzado rechaza check-in.
[ ] oneTime usado no permite reutilización.
```

---

### 13.5. Visitor and vehicle policy

```text id="acv-policy-visitor-vehicle-tests"
[ ] visitor blockedTenant rechaza autorización ordinaria.
[ ] visitor archived rechaza autorización.
[ ] vehicle blockedTenant rechaza ingreso ordinario.
[ ] vehicle archived rechaza ingreso.
[ ] watchlistedTenant no bloquea automáticamente pero genera advertencia.
```

---

### 13.6. Boundary policies

```text id="acv-policy-boundary-tests"
[ ] NoPublicAccessEndpointPolicy bloquea /public.
[ ] NoWordPressAccessPolicy bloquea origen WordPress público.
[ ] NoBiometricProcessingPolicy bloquea biometricTemplate.
[ ] NoFaceRecognitionPolicy bloquea faceEmbedding.
[ ] NoGateOpeningPolicy bloquea gateOpenCommand.
[ ] NoHardwareControlPolicy bloquea hardwareDeviceCommand.
[ ] NoExternalAiAccessDataPolicy bloquea externalAiEnabled.
[ ] NoGlobalWatchlistPolicy impide watchlist global.
```

---

## 14. Integration tests — Repositories

### 14.1. VisitorProfileRepository

```text id="acv-repo-visitor-tests"
[ ] create guarda tenantId server-side.
[ ] list filtra por tenantId.
[ ] get usa id + tenantId.
[ ] update usa id + tenantId.
[ ] archive usa id + tenantId.
[ ] búsqueda por identificationHash filtra tenant.
[ ] búsqueda por phoneHash filtra tenant.
[ ] tenantA no lee visitor tenantB.
```

---

### 14.2. VisitorVehicleRepository

```text id="acv-repo-vehicle-tests"
[ ] create vehicle.
[ ] list vehicles filtra tenant.
[ ] get vehicle usa id + tenantId.
[ ] búsqueda por plateHash filtra tenant.
[ ] tenantA no lee vehicle tenantB.
```

---

### 14.3. AccessGateRepository

```text id="acv-repo-gate-tests"
[ ] create gate.
[ ] gateCode único por tenant.
[ ] mismo gateCode en tenant distinto permitido.
[ ] list gates filtra tenant.
[ ] archive no borra físicamente.
```

---

### 14.4. AccessAuthorizationRepository

```text id="acv-repo-authorization-tests"
[ ] create authorization.
[ ] authorizationNumber único por tenant.
[ ] list active authorizations filtra tenant.
[ ] list by propertyUnitId filtra tenant.
[ ] get authorization tenantB desde tenantA retorna null.
[ ] entriesUsed se actualiza transaccionalmente.
```

---

### 14.5. AccessPassRepository

```text id="acv-repo-pass-tests"
[ ] create pass.
[ ] search passCodeHash filtra tenant.
[ ] passCodeHash no se expone en mapper.
[ ] update used usa id + tenantId.
[ ] revoke usa id + tenantId.
[ ] tenantA no valida pass tenantB.
```

---

### 14.6. AccessEventRepository

```text id="acv-repo-event-tests"
[ ] create event.
[ ] eventNumber único por tenant.
[ ] list events filtra tenant.
[ ] list by gate filtra tenant.
[ ] list by unit filtra tenant.
[ ] correct usa id + tenantId.
[ ] void usa id + tenantId.
```

---

### 14.7. CheckIn / CheckOut repositories

```text id="acv-repo-checkinout-tests"
[ ] create check-in open.
[ ] list open check-ins filtra tenant.
[ ] close check-in usa id + tenantId.
[ ] create check-out.
[ ] check-out único por checkIn activo.
[ ] tenantA no cierra checkIn tenantB.
```

---

### 14.8. Delivery / SupplierVisit repositories

```text id="acv-repo-delivery-supplier-tests"
[ ] create delivery tenant-scoped.
[ ] deliveryNumber único por tenant.
[ ] create supplier visit tenant-scoped.
[ ] supplierVisitNumber único por tenant.
[ ] tenantA no lee supplier visit tenantB.
```

---

### 14.9. Incident / Comment / Document / Export repositories

```text id="acv-repo-other-tests"
[ ] create incident tenant-scoped.
[ ] incidentNumber único por tenant.
[ ] comments filtran por tenant.
[ ] documents filtran por tenant.
[ ] exports filtran por tenant.
[ ] secureDocumentId tenantB no se vincula en tenantA.
```

---

## 15. Integration tests — External adapters

### 15.1. Residents and Properties adapter

```text id="acv-adapter-residents-tests"
[ ] validatePropertyUnit acepta unitA101 en tenantA.
[ ] validatePropertyUnit rechaza unitB201 desde tenantA.
[ ] resolveOwnUnits devuelve unitA101 para residentA1.
[ ] validateUserCanOperateUnit permite residentA1 + unitA101.
[ ] validateUserCanOperateUnit rechaza residentA1 + unitA102.
[ ] validateUserCanOperateUnit rechaza residentA1 + unitB201.
```

---

### 15.2. Secure Document Storage adapter

```text id="acv-adapter-sds-tests"
[ ] validateDocumentBelongsToTenant acepta secureDocumentA.
[ ] validateDocumentBelongsToTenant rechaza secureDocumentB desde tenantA.
[ ] createReportExport devuelve secureDocumentId.
[ ] response no incluye storageKey.
[ ] response no incluye signedUrl persistente.
[ ] response no incluye base64.
```

---

### 15.3. Supplier Payments adapter

```text id="acv-adapter-supplier-tests"
[ ] validateSupplier acepta supplierActiveA.
[ ] validateSupplier rechaza supplierBlockedA salvo override.
[ ] validateSupplier rechaza supplierInactiveA.
[ ] validateSupplier rechaza supplierB desde tenantA.
[ ] Access Control no llama createSupplierPayable.
[ ] Access Control no llama createSupplierPaymentOrder.
[ ] Access Control no llama markPaid.
[ ] Access Control no llama createPayment.
```

---

### 15.4. Maintenance Work Orders adapter

```text id="acv-adapter-maintenance-tests"
[ ] validateWorkOrder acepta maintenanceWorkOrderOpenA.
[ ] validateWorkOrder rechaza maintenanceWorkOrderArchivedA.
[ ] validateWorkOrder rechaza maintenanceWorkOrderB desde tenantA.
[ ] Access Control no llama closeWorkOrder.
[ ] Access Control no llama updateWorkOrderStatus.
[ ] Access Control no llama createMaintenanceCost.
[ ] Access Control no llama createSupplierPayable.
```

---

### 15.5. Notifications adapter

```text id="acv-adapter-notifications-tests"
[ ] notifyVisitorArrived se llama con datos minimizados.
[ ] notifyAuthorizationCreated no incluye identificación completa.
[ ] notifyAuthorizationCancelled no incluye datos internos.
[ ] notifyIncidentCreated no incluye evidencia completa.
[ ] notifyDeliveryReceived no incluye contenido sensible innecesario.
[ ] Falla de notificación no rompe check-in salvo policy estricta.
```

---

### 15.6. Audit adapter

```text id="acv-adapter-audit-tests"
[ ] audit incluye tenantId.
[ ] audit incluye actor server-side.
[ ] audit incluye action.
[ ] audit incluye resourceType.
[ ] audit incluye resourceId.
[ ] audit incluye outcome.
[ ] audit incluye traceId.
[ ] audit no incluye identificationNumberRaw.
[ ] audit no incluye plateRaw.
[ ] audit no incluye passCodeRaw.
[ ] audit no incluye storageKey.
```

---

## 16. API tests — Visitor Profiles

```text id="acv-api-visitors-tests"
[ ] GET /tenant/access-visitors requiere auth.
[ ] GET /tenant/access-visitors requiere accessVisitors.read.
[ ] POST /tenant/access-visitors crea visitor.
[ ] POST enmascara identificationNumber.
[ ] POST enmascara phone.
[ ] POST no devuelve raw.
[ ] POST no devuelve hashes.
[ ] POST rechaza tenantId.
[ ] POST rechaza actor fields.
[ ] PATCH actualiza datos permitidos.
[ ] PATCH rechaza status directo.
[ ] watchlist requiere reason.
[ ] block requiere reason.
[ ] archive requiere archiveReason.
[ ] tenantA no lee visitor tenantB.
```

---

## 17. API tests — Visitor Vehicles

```text id="acv-api-vehicles-tests"
[ ] GET /tenant/access-visitor-vehicles requiere auth.
[ ] POST crea vehicle.
[ ] POST enmascara plate.
[ ] POST no devuelve plateRaw.
[ ] POST no devuelve plateHash.
[ ] POST valida visitorId tenant-scoped.
[ ] POST rechaza visitorId tenantB.
[ ] PATCH actualiza campos permitidos.
[ ] PATCH rechaza status directo.
[ ] watchlist requiere reason.
[ ] block requiere reason.
[ ] archive requiere archiveReason.
[ ] tenantA no lee vehicle tenantB.
```

---

## 18. API tests — Access Gates

```text id="acv-api-gates-tests"
[ ] GET /tenant/access-gates requiere auth.
[ ] POST crea gate.
[ ] POST rechaza gateCode duplicado por tenant.
[ ] POST permite mismo gateCode en tenant distinto.
[ ] PATCH actualiza gateName.
[ ] PATCH rechaza gateOpenCommand.
[ ] PATCH rechaza hardwareDeviceCommand.
[ ] archive requiere archiveReason.
[ ] gate archived no se usa en check-in.
[ ] tenantA no lee gate tenantB.
```

---

## 19. API tests — Access Authorizations

```text id="acv-api-authorizations-tests"
[ ] GET /tenant/access-authorizations requiere accessAuthorizations.read.
[ ] POST crea authorization.
[ ] POST genera authorizationNumber server-side.
[ ] POST resuelve authorizedByUserId server-side.
[ ] POST valida visitorId tenant-scoped.
[ ] POST valida vehicleId tenant-scoped.
[ ] POST valida propertyUnitId tenant-scoped.
[ ] POST rechaza validFrom >= validUntil.
[ ] POST rechaza maxEntries <= 0.
[ ] POST genera AccessPass si generateAccessPass=true.
[ ] POST no devuelve passCodeRaw.
[ ] POST no devuelve passCodeHash.
[ ] POST rechaza visitor blockedTenant.
[ ] POST rechaza visitor archived.
[ ] cancel requiere cancelReason.
[ ] cancel revoca passes activos.
[ ] revoke requiere revokeReason.
[ ] revoke revoca passes activos.
[ ] expired/cancelled/revoked no permite check-in.
[ ] tenantA no lee authorization tenantB.
```

---

## 20. API tests — Access Passes

```text id="acv-api-passes-tests"
[ ] GET /tenant/access-passes requiere accessPasses.read.
[ ] POST /authorizations/{id}/passes crea pass.
[ ] POST pass requiere expiresAt futuro.
[ ] POST pass no devuelve raw.
[ ] POST pass no devuelve hash.
[ ] validate pass active devuelve valid=true.
[ ] validate pass expired devuelve valid=false.
[ ] validate pass used devuelve valid=false.
[ ] validate pass revoked devuelve valid=false.
[ ] validate pass tenantB desde tenantA devuelve valid=false o 404 según policy.
[ ] validate no loggea passCode raw.
[ ] revoke requiere revokeReason.
```

---

## 21. API tests — Access Events

```text id="acv-api-events-tests"
[ ] GET /tenant/access-events requiere accessEvents.read.
[ ] Lista eventos tenant-scoped.
[ ] Filtra por eventType.
[ ] Filtra por gateId.
[ ] Filtra por propertyUnitId.
[ ] Filtra por dateFrom/dateTo.
[ ] GET event tenantB desde tenantA retorna 404.
[ ] correct requiere correctionReason.
[ ] correct no cambia actor original.
[ ] void requiere voidReason.
[ ] void no borra físicamente.
```

---

## 22. API tests — Check-ins

```text id="acv-api-checkins-tests"
[ ] GET /tenant/access-check-ins requiere accessCheckIns.read.
[ ] POST check-in con authorization activa funciona.
[ ] POST check-in con pass active funciona.
[ ] POST check-in crea AccessEvent checkIn.
[ ] POST check-in crea AccessCheckIn open.
[ ] POST check-in marca pass used si aplica.
[ ] POST check-in incrementa entriesUsed.
[ ] POST check-in con authorization expired retorna 409.
[ ] POST check-in con authorization cancelled retorna 409.
[ ] POST check-in con authorization revoked retorna 409.
[ ] POST check-in con pass used retorna 409.
[ ] POST check-in con pass expired retorna 409.
[ ] POST check-in manual requiere manualReason.
[ ] POST check-in valida gate tenant-scoped.
[ ] POST check-in rechaza gate archived.
[ ] POST check-in rechaza visitor blocked salvo override.
[ ] POST check-in rechaza vehicle blocked salvo override.
[ ] void check-in requiere voidReason.
[ ] tenantA no crea check-in con authorization tenantB.
```

---

## 23. API tests — Check-outs

```text id="acv-api-checkouts-tests"
[ ] GET /tenant/access-check-outs requiere accessCheckOuts.read.
[ ] POST check-out con checkInId abierto funciona.
[ ] POST check-out crea AccessEvent checkOut.
[ ] POST check-out crea AccessCheckOut.
[ ] POST check-out cierra AccessCheckIn.
[ ] POST check-out duplicado retorna 409.
[ ] POST check-out manual sin checkInId requiere manualReason.
[ ] POST check-out valida gate tenant-scoped.
[ ] POST check-out rechaza checkIn tenantB.
[ ] void check-out requiere voidReason.
[ ] tenantA no crea check-out para checkIn tenantB.
```

---

## 24. API tests — Guard API

```text id="acv-api-guard-tests"
[ ] Guard API requiere auth.
[ ] Guard API requiere TenantGuard.
[ ] Guard API requiere permisos guardAccess.*.
[ ] GET /tenant/guard/access-authorizations/active lista solo active vigentes.
[ ] GET active no devuelve identificación raw.
[ ] GET active no devuelve placa raw.
[ ] POST /tenant/guard/access-passes/validate valida pass active.
[ ] POST guard check-in funciona.
[ ] POST guard check-in crea event y checkIn.
[ ] POST guard check-out funciona.
[ ] GET recent events limita pageSize a 50.
[ ] POST denied access crea AccessEvent deniedAccess.
[ ] POST denied access crea incident si createIncident=true.
[ ] POST guard incident crea incident.
[ ] POST guard delivery crea delivery.
[ ] GuardA no opera tenantB.
[ ] Resident no accede Guard API.
[ ] Anonymous no accede Guard API.
```

---

## 25. API tests — `/me`

```text id="acv-api-me-tests"
[ ] GET /me/access-visitors requiere auth.
[ ] ResidentA1 ve solo visitantes propios o asociados a unitA101.
[ ] ResidentA1 no ve visitantes de unitA102.
[ ] ResidentA1 no ve visitantes tenantB.
[ ] POST /me/access-visitors crea visitor own.
[ ] POST /me/access-visitors no devuelve raw.
[ ] GET /me/access-authorizations lista solo autorizaciones propias.
[ ] POST /me/access-authorizations crea autorización para unitA101.
[ ] POST /me/access-authorizations rechaza unitA102 si no propia.
[ ] POST /me/access-authorizations rechaza authorizationScope administrative.
[ ] POST /me/access-authorizations rechaza visitor blockedTenant.
[ ] GET /me/access-authorizations/{id} rechaza autorización de otra unidad.
[ ] POST /me/access-authorizations/{id}/cancel cancela futura propia.
[ ] POST /me cancel rechaza autorización con check-in ya registrado.
[ ] GET /me/access-events lista eventos propios limitados.
[ ] /me no expone notas internas.
[ ] /me no expone audit metadata.
[ ] /me no expone guard internal fields.
[ ] /me no expone identification raw.
[ ] /me no expone plate raw.
[ ] /me no permite check-in/check-out.
[ ] /me no permite export masivo.
```

---

## 26. API tests — Deliveries

```text id="acv-api-deliveries-tests"
[ ] GET deliveries requiere accessDeliveries.read.
[ ] POST delivery crea registro.
[ ] POST delivery valida propertyUnitId tenant-scoped.
[ ] POST delivery rechaza propertyUnitId tenantB.
[ ] POST delivery sanitiza packageDescription.
[ ] deliver cambia status a deliveredToUnit.
[ ] return requiere returnReason.
[ ] cancel requiere cancelReason.
[ ] tenantA no lee delivery tenantB.
```

---

## 27. API tests — Supplier Visits

```text id="acv-api-supplier-visits-tests"
[ ] GET supplier visits requiere accessSupplierVisits.read.
[ ] POST supplier visit crea scheduled.
[ ] POST valida supplierId tenant-scoped.
[ ] POST rechaza supplier tenantB.
[ ] POST rechaza supplier blocked salvo override.
[ ] POST valida maintenanceWorkOrderId tenant-scoped.
[ ] POST rechaza maintenanceWorkOrder tenantB.
[ ] check-in supplier visit crea/relaciona check-in si aplica.
[ ] check-out supplier visit crea/relaciona check-out si aplica.
[ ] cancel requiere cancelReason.
[ ] deny requiere denialReason.
[ ] No crea SupplierPayable.
[ ] No crea SupplierPaymentOrder.
[ ] No crea Payment.
[ ] No modifica Maintenance Work Orders.
```

---

## 28. API tests — Recurring Authorizations

```text id="acv-api-recurring-tests"
[ ] GET recurring requiere permiso.
[ ] POST recurring crea recurrente.
[ ] POST valida validFrom <= validUntil.
[ ] POST valida daysOfWeek.
[ ] POST valida timeFrom < timeUntil.
[ ] POST rechaza patrón vacío.
[ ] cancel requiere cancelReason.
[ ] revoke requiere revokeReason.
[ ] Resident no crea recurrente para unidad ajena.
[ ] Recurrente expired no permite ingreso.
```

---

## 29. API tests — Incidents

```text id="acv-api-incidents-tests"
[ ] GET incidents requiere accessIncidents.read.
[ ] POST incident crea open.
[ ] POST incident requiere description.
[ ] POST incident sanitiza description.
[ ] POST incident valida visitorId tenant-scoped si existe.
[ ] POST incident valida vehicleId tenant-scoped si existe.
[ ] POST incident valida eventId tenant-scoped si existe.
[ ] POST incident valida gateId tenant-scoped si existe.
[ ] PATCH actualiza severity/description permitido.
[ ] resolve requiere resolutionReason.
[ ] dismiss requiere dismissReason.
[ ] critical puede disparar notification.
[ ] tenantA no lee incident tenantB.
```

---

## 30. API tests — Comments

```text id="acv-api-comments-tests"
[ ] GET comments requiere accessComments.read.
[ ] POST comment crea comentario.
[ ] POST comment valida entityId tenant-scoped.
[ ] POST comment sanitiza commentBody.
[ ] POST comment rechaza visibility=system desde cliente.
[ ] internal no se expone en /me.
[ ] visibleToResident se expone solo a unidad propia.
[ ] archive requiere archiveReason.
```

---

## 31. API tests — Documents

```text id="acv-api-documents-tests"
[ ] GET documents requiere accessDocuments.read.
[ ] POST document crea vínculo.
[ ] POST document valida secureDocumentId tenant-scoped.
[ ] POST document rechaza secureDocumentId tenantB.
[ ] POST document valida entityId tenant-scoped.
[ ] POST document rechaza storageKey.
[ ] POST document rechaza signedUrl persistente.
[ ] POST document rechaza base64.
[ ] POST document rechaza rawFilePayload.
[ ] GET document no devuelve storageKey.
[ ] GET document no devuelve signedUrl persistente.
[ ] archive requiere archiveReason.
```

---

## 32. API tests — Reports and exports

### 32.1. Events report

```text id="acv-api-reports-events-tests"
[ ] GET /access-reports/events requiere permiso.
[ ] Aplica dateFrom/dateTo.
[ ] Filtra por gateId tenant-scoped.
[ ] Filtra por propertyUnitId tenant-scoped.
[ ] No mezcla tenantB.
[ ] Enmascara identificación.
[ ] Enmascara placa.
```

---

### 32.2. Visitors report

```text id="acv-api-reports-visitors-tests"
[ ] GET /access-reports/visitors requiere permiso.
[ ] Filtra por propertyUnitId.
[ ] Filtra por visitorType.
[ ] No devuelve identification raw.
[ ] No devuelve phone raw.
```

---

### 32.3. Authorizations report

```text id="acv-api-reports-authorizations-tests"
[ ] GET /access-reports/authorizations requiere permiso.
[ ] Filtra por status.
[ ] Filtra por authorizationType.
[ ] Filtra por authorizedByUserId.
[ ] No devuelve passCode raw.
[ ] No devuelve passCodeHash.
```

---

### 32.4. Incidents report

```text id="acv-api-reports-incidents-tests"
[ ] GET /access-reports/incidents requiere permiso.
[ ] Filtra por severity.
[ ] Filtra por status.
[ ] Filtra por incidentType.
[ ] No devuelve metadata sensible.
```

---

### 32.5. Open check-ins report

```text id="acv-api-reports-open-tests"
[ ] GET /access-reports/open-check-ins requiere permiso.
[ ] Lista check-ins open.
[ ] Filtra por olderThanMinutes.
[ ] No mezcla tenants.
```

---

### 32.6. Export report

```text id="acv-api-reports-export-tests"
[ ] GET /access-reports/export requiere accessReports.exports.
[ ] Valida reportType.
[ ] Valida format.
[ ] Valida filtros tenant-scoped.
[ ] Crea AccessReportExport.
[ ] Crea SecureDocument.
[ ] Devuelve secureDocumentId.
[ ] No devuelve storageKey.
[ ] No devuelve signedUrl persistente.
[ ] Sanitiza filters.
[ ] Audita accessReport.exported.
```

---

## 33. Security tests — Auth and permissions

```text id="acv-security-auth-tests"
[ ] Toda ruta permitida requiere Bearer token.
[ ] Usuario no autenticado recibe 401.
[ ] Usuario autenticado sin permiso recibe 403.
[ ] Usuario con permiso correcto accede.
[ ] Resident no accede Tenant Admin API salvo permisos explícitos.
[ ] Resident no accede Guard API.
[ ] Guard no accede reportes masivos sin permiso.
[ ] PlatformAdmin no accede automáticamente a tenant data.
[ ] PlatformAdmin requiere tenant context explícito y permiso.
```

---

## 34. Security tests — Forbidden fields

Todos los endpoints deben rechazar:

```text id="acv-security-forbidden-fields"
[ ] tenantId.
[ ] createdBy.
[ ] updatedBy.
[ ] authorizedBy.
[ ] authorizedByUserId arbitrario.
[ ] checkedInBy.
[ ] checkedInByUserId.
[ ] checkedOutBy.
[ ] checkedOutByUserId.
[ ] recordedBy.
[ ] recordedByUserId.
[ ] cancelledBy.
[ ] revokedBy.
[ ] archivedBy.
[ ] voidedBy.
[ ] correctedBy.
[ ] resolvedBy.
[ ] dismissedBy.
[ ] requestedBy.
[ ] status directo fuera de endpoint de transición.
[ ] authorizationNumber.
[ ] eventNumber.
[ ] deliveryNumber.
[ ] supplierVisitNumber.
[ ] incidentNumber.
[ ] identificationNumberHash.
[ ] phoneHash.
[ ] emailHash.
[ ] plateHash.
[ ] passCodeHash.
[ ] storageKey.
[ ] signedUrl.
[ ] base64.
[ ] rawFilePayload.
[ ] fullDocumentImage.
[ ] biometricTemplate.
[ ] faceEmbedding.
[ ] cameraStreamUrl.
[ ] gateOpenCommand.
[ ] hardwareDeviceCommand.
[ ] paymentId.
[ ] paymentOrderId.
[ ] supplierPaymentOrderId.
[ ] journalEntryId.
[ ] bankTransactionId.
[ ] reconciliationMatchId.
[ ] externalAiEnabled.
```

Respuesta esperada:

```http id="acv-security-forbidden-response"
422 Unprocessable Entity
```

---

## 35. Security tests — Multitenancy

```text id="acv-security-multitenancy-tests"
[ ] tenantA no lee visitor tenantB.
[ ] tenantA no actualiza visitor tenantB.
[ ] tenantA no bloquea visitor tenantB.
[ ] tenantA no lee vehicle tenantB.
[ ] tenantA no usa vehicle tenantB.
[ ] tenantA no lee gate tenantB.
[ ] tenantA no usa gate tenantB.
[ ] tenantA no lee authorization tenantB.
[ ] tenantA no cancela authorization tenantB.
[ ] tenantA no valida pass tenantB.
[ ] tenantA no lee event tenantB.
[ ] tenantA no corrige event tenantB.
[ ] tenantA no anula event tenantB.
[ ] tenantA no crea check-in con authorization tenantB.
[ ] tenantA no crea check-out con checkIn tenantB.
[ ] tenantA no lee delivery tenantB.
[ ] tenantA no lee supplierVisit tenantB.
[ ] tenantA no lee incident tenantB.
[ ] tenantA no lee comment tenantB.
[ ] tenantA no vincula secureDocument tenantB.
[ ] tenantA no usa supplier tenantB.
[ ] tenantA no usa maintenanceWorkOrder tenantB.
[ ] tenantA no exporta datos tenantB.
```

Respuesta esperada para recursos cross-tenant:

```http id="acv-cross-tenant-response"
404 Not Found
```

---

## 36. Security tests — Privacy

```text id="acv-security-privacy-tests"
[ ] Visitor response no incluye identificationNumber raw.
[ ] Visitor response no incluye phone raw.
[ ] Visitor response no incluye email raw.
[ ] Vehicle response no incluye plate raw.
[ ] Pass response no incluye passCode raw persistente.
[ ] Pass response no incluye passCodeHash.
[ ] Report no incluye identificationNumber raw.
[ ] Report no incluye plate raw.
[ ] Export no incluye hashes.
[ ] Logs no incluyen identificationNumber raw.
[ ] Logs no incluyen plate raw.
[ ] Logs no incluyen passCode raw.
[ ] Audit no incluye identificationNumber raw.
[ ] Audit no incluye plate raw.
[ ] Audit no incluye passCode raw.
[ ] /me no incluye notas internas.
[ ] /me no incluye audit metadata.
```

---

## 37. Security tests — No public, no WordPress

### 37.1. Public endpoints

```text id="acv-security-no-public-tests"
[ ] GET /api/v1/public/access-visitors devuelve 404.
[ ] GET /api/v1/public/access-visitor-vehicles devuelve 404.
[ ] GET /api/v1/public/access-authorizations devuelve 404.
[ ] GET /api/v1/public/access-events devuelve 404.
[ ] GET /api/v1/public/access-check-ins devuelve 404.
[ ] GET /api/v1/public/access-check-outs devuelve 404.
[ ] POST /api/v1/public/access-check-ins devuelve 404.
[ ] POST /api/v1/public/access-check-outs devuelve 404.
[ ] GET /api/v1/public/tenants/{slug}/access-visitors devuelve 404.
[ ] GET /api/v1/public/tenants/{slug}/access-events devuelve 404.
```

---

### 37.2. WordPress access

```text id="acv-security-no-wordpress-tests"
[ ] CORS no permite origen WordPress público para /tenant/access-*.
[ ] CORS no permite origen WordPress público para /tenant/guard/access-*.
[ ] CORS no permite origen WordPress público para /me/access-* salvo frontend autenticado separado.
[ ] CORS no usa wildcard.
[ ] WordPress público no consulta visitors.
[ ] WordPress público no consulta events.
[ ] WordPress público no crea check-in.
[ ] WordPress público no exporta reports.
```

---

## 38. Security tests — No hardware, no biometrics, no AI

### 38.1. Hardware

```text id="acv-security-no-hardware-tests"
[ ] DTO rechaza gateOpenCommand.
[ ] DTO rechaza hardwareDeviceCommand.
[ ] DTO rechaza cameraStreamUrl.
[ ] Ningún servicio llama openGate.
[ ] Ningún servicio llama hardware controller.
[ ] Ningún endpoint documenta apertura automática.
[ ] ACCESS_CONTROL_GATE_OPENING_ENABLED=false.
[ ] ACCESS_CONTROL_HARDWARE_CONTROL_ENABLED=false.
```

---

### 38.2. Biometrics and face recognition

```text id="acv-security-no-biometrics-tests"
[ ] DTO rechaza biometricTemplate.
[ ] DTO rechaza faceEmbedding.
[ ] DTO rechaza fingerprintTemplate.
[ ] DTO rechaza irisTemplate.
[ ] DTO rechaza voicePrint.
[ ] No existe face recognition service.
[ ] No existe biometric matching service.
[ ] ACCESS_CONTROL_FACE_RECOGNITION_ENABLED=false.
[ ] ACCESS_CONTROL_BIOMETRIC_PROCESSING_ENABLED=false.
```

---

### 38.3. Plate OCR

```text id="acv-security-no-ocr-tests"
[ ] DTO rechaza plateOcrPayload.
[ ] DTO rechaza cameraFrame.
[ ] DTO rechaza ocrConfidence.
[ ] No existe automaticPlateRecognition service.
[ ] ACCESS_CONTROL_PLATE_OCR_ENABLED=false.
```

---

### 38.4. External AI

```text id="acv-security-no-ai-tests"
[ ] ACCESS_CONTROL_EXTERNAL_AI_ENABLED=false.
[ ] Boot falla si ACCESS_CONTROL_EXTERNAL_AI_ENABLED=true en MVP.
[ ] Ningún endpoint acepta externalAiEnabled.
[ ] Ningún servicio envía visitantes reales a IA externa.
[ ] Ningún servicio envía identificaciones reales a IA externa.
[ ] Ningún servicio envía placas reales a IA externa.
[ ] Ningún servicio envía eventos reales a IA externa.
[ ] Ningún servicio envía reportes reales a IA externa.
[ ] Ningún servicio envía incidentes reales a IA externa.
[ ] Ningún servicio envía documentos reales a IA externa.
```

---

## 39. Boundary tests — Financial, accounting, reconciliation

```text id="acv-boundary-financial-tests"
[ ] Registrar delivery no crea Payment.
[ ] Registrar supplier visit no crea SupplierPayable.
[ ] Registrar supplier visit no crea SupplierPaymentOrder.
[ ] Check-in supplier visit no crea Payment.
[ ] Check-out supplier visit no marca paid.
[ ] Access Control no crea JournalEntry.
[ ] Access Control no modifica Accounting Ledger.
[ ] Access Control no crea BankTransaction.
[ ] Access Control no confirma ReconciliationMatch.
[ ] Access Control no cierra ReconciliationSession.
```

---

## 40. Audit tests

### 40.1. Eventos mínimos

```text id="acv-audit-event-tests"
[ ] accessVisitor.created.
[ ] accessVisitor.updated.
[ ] accessVisitor.watchlisted.
[ ] accessVisitor.blocked.
[ ] accessVisitor.archived.
[ ] accessVehicle.created.
[ ] accessVehicle.updated.
[ ] accessVehicle.watchlisted.
[ ] accessVehicle.blocked.
[ ] accessVehicle.archived.
[ ] accessGate.created.
[ ] accessGate.updated.
[ ] accessGate.archived.
[ ] accessAuthorization.created.
[ ] accessAuthorization.activated.
[ ] accessAuthorization.cancelled.
[ ] accessAuthorization.revoked.
[ ] accessAuthorization.expired.
[ ] accessAuthorization.used.
[ ] accessPass.created.
[ ] accessPass.validated.
[ ] accessPass.used.
[ ] accessPass.expired.
[ ] accessPass.revoked.
[ ] accessCheckIn.recorded.
[ ] accessCheckIn.voided.
[ ] accessCheckOut.recorded.
[ ] accessCheckOut.voided.
[ ] accessEvent.recorded.
[ ] accessEvent.corrected.
[ ] accessEvent.voided.
[ ] accessDelivery.created.
[ ] accessDelivery.received.
[ ] accessDelivery.delivered.
[ ] accessDelivery.returned.
[ ] accessDelivery.cancelled.
[ ] accessSupplierVisit.created.
[ ] accessSupplierVisit.checkedIn.
[ ] accessSupplierVisit.checkedOut.
[ ] accessSupplierVisit.cancelled.
[ ] accessSupplierVisit.denied.
[ ] accessIncident.created.
[ ] accessIncident.updated.
[ ] accessIncident.resolved.
[ ] accessIncident.dismissed.
[ ] accessComment.created.
[ ] accessComment.archived.
[ ] accessDocument.created.
[ ] accessDocument.downloaded.
[ ] accessDocument.archived.
[ ] accessReport.generated.
[ ] accessReport.exported.
```

---

### 40.2. Audit metadata

```text id="acv-audit-metadata-tests"
[ ] audit incluye tenantId.
[ ] audit incluye actorUserProfileId.
[ ] audit incluye action.
[ ] audit incluye category=accessControl.
[ ] audit incluye resourceType.
[ ] audit incluye resourceId.
[ ] audit incluye outcome.
[ ] audit incluye traceId.
[ ] audit no incluye identificationNumberRaw.
[ ] audit no incluye phoneRaw.
[ ] audit no incluye plateRaw.
[ ] audit no incluye passCodeRaw.
[ ] audit no incluye hashes sensibles.
[ ] audit no incluye storageKey.
[ ] audit no incluye signedUrl.
[ ] audit no incluye biometricTemplate.
[ ] audit no incluye faceEmbedding.
[ ] audit no incluye gateOpenCommand.
```

---

## 41. Observability tests

### 41.1. Logs

```text id="acv-observability-log-tests"
[ ] accessAuthorization.created loggea action.
[ ] accessPass.validated loggea outcome.
[ ] accessCheckIn.recorded loggea durationMs.
[ ] accessCheckOut.recorded loggea traceId.
[ ] accessDenied.recorded loggea errorCode si aplica.
[ ] accessIncident.created loggea incidentSeverity.
[ ] accessReport.exported loggea reportType.
[ ] logs no contienen identificationNumberRaw.
[ ] logs no contienen phoneRaw.
[ ] logs no contienen plateRaw.
[ ] logs no contienen passCodeRaw.
[ ] logs no contienen storageKey.
[ ] logs no contienen base64.
[ ] logs no contienen stack trace productivo.
```

---

### 41.2. Metrics

```text id="acv-observability-metrics-tests"
[ ] access_authorizations_total incrementa.
[ ] access_authorizations_active_total se calcula.
[ ] access_pass_validations_total incrementa.
[ ] access_checkins_total incrementa.
[ ] access_checkouts_total incrementa.
[ ] access_denied_total incrementa.
[ ] access_open_checkins_total se calcula.
[ ] access_incidents_total incrementa.
[ ] access_reports_exported_total incrementa.
[ ] labels permitidos funcionan.
[ ] labels prohibidos no existen.
```

Labels prohibidos:

```text id="acv-metrics-forbidden-labels"
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

## 42. OpenAPI contract tests

```text id="acv-openapi-tests"
[ ] OpenAPI documenta rutas /api/v1/tenant/access-*.
[ ] OpenAPI documenta rutas /api/v1/tenant/guard/access-*.
[ ] OpenAPI documenta rutas /api/v1/me/access-* permitidas.
[ ] OpenAPI no documenta /api/v1/public/access-*.
[ ] OpenAPI no documenta /api/v1/public/tenants/{slug}/access-*.
[ ] OpenAPI incluye x-tenant-scope=true.
[ ] OpenAPI incluye x-auth-required=true.
[ ] OpenAPI incluye x-access-control-visitors=true.
[ ] OpenAPI incluye x-public-exposure=false.
[ ] OpenAPI incluye x-wordpress-access=false.
[ ] Guard API incluye x-guard-operated=true.
[ ] /me API incluye x-own-resource-scope=true.
[ ] Document routes incluyen x-secure-document-storage=true.
[ ] Document routes incluyen x-storage-key-exposed=false.
[ ] OpenAPI incluye x-biometric-processing=false.
[ ] OpenAPI incluye x-face-recognition=false.
[ ] OpenAPI incluye x-gate-opening=false.
[ ] OpenAPI incluye x-hardware-control=false.
[ ] OpenAPI incluye x-plate-ocr=false.
[ ] OpenAPI incluye x-external-ai-real-data=false.
[ ] OpenAPI no documenta tenantId en DTOs externos.
[ ] OpenAPI no documenta actor fields.
[ ] OpenAPI no documenta hashes sensibles.
[ ] OpenAPI no documenta storageKey.
[ ] OpenAPI no documenta signedUrl persistente.
[ ] OpenAPI no documenta base64.
[ ] OpenAPI no documenta biometricTemplate.
[ ] OpenAPI no documenta faceEmbedding.
[ ] OpenAPI no documenta gateOpenCommand.
[ ] OpenAPI no documenta hardwareDeviceCommand.
```

---

## 43. Performance tests

### 43.1. Dataset mínimo

```text id="acv-performance-dataset"
tenantA:
- 5 gates.
- 2,000 visitor profiles.
- 1,000 visitor vehicles.
- 5,000 access authorizations.
- 5,000 access passes.
- 20,000 access events.
- 10,000 check-ins.
- 9,000 check-outs.
- 2,000 deliveries.
- 1,000 supplier visits.
- 500 incidents.
- 100 report exports.

tenantB:
- dataset parcial para validar aislamiento.
```

---

### 43.2. Objetivos

```text id="acv-performance-objectives"
[ ] Consultar autorizaciones activas p95 < 800 ms.
[ ] Validar pass p95 < 800 ms.
[ ] Registrar check-in p95 < 1000 ms.
[ ] Registrar check-out p95 < 1000 ms.
[ ] Listar eventos paginados p95 < 1200 ms.
[ ] Consultar check-ins abiertos p95 < 1200 ms.
[ ] Reporte de eventos p95 < 1500 ms.
[ ] Reporte de incidentes p95 < 1500 ms.
[ ] Exportación pequeña p95 < 3000 ms.
[ ] pageSize máximo 100 en admin/reportes.
[ ] pageSize máximo 50 en recent guard events.
[ ] No existe N+1 evidente.
```

---

## 44. Concurrency tests

```text id="acv-concurrency-tests"
[ ] Dos guardias intentan validar y usar el mismo oneTime pass: solo uno exitoso.
[ ] Dos guardias intentan check-in con misma authorization oneTime: solo uno exitoso si maxEntries=1.
[ ] Dos guardias registran check-out para el mismo checkIn: solo uno exitoso.
[ ] Cancel authorization y check-in simultáneo preservan consistencia.
[ ] Revoke pass y validate pass simultáneo preservan consistencia.
[ ] Expire pass job y check-in simultáneo preservan consistencia.
[ ] Crear eventNumber concurrente no duplica secuencia.
[ ] Crear authorizationNumber concurrente no duplica secuencia.
[ ] Crear incidentNumber concurrente no duplica secuencia.
```

---

## 45. Regression tests

```text id="acv-regression-tests"
[ ] Cambios en 003-residents-properties no rompen own-resource resolution.
[ ] Cambios en 016-secure-document-storage no exponen storageKey.
[ ] Cambios en 012-notifications no envían datos sensibles completos.
[ ] Cambios en 021-supplier-payments no permiten crear pagos desde Access Control.
[ ] Cambios en 022-maintenance-work-orders no permiten modificar estados desde Access Control.
[ ] Cambios en CORS no habilitan WordPress público.
[ ] Cambios en DTO validation no permiten tenantId.
[ ] Cambios en DTO validation no permiten actor fields.
[ ] Cambios en OpenAPI no documentan campos prohibidos.
[ ] Cambios en logs no introducen raw PII.
```

---

## 46. Smoke flows

### 46.1. Smoke flow — configuración inicial

```text id="acv-smoke-config"
[ ] TenantAdmin crea MAIN_GATE.
[ ] TenantAdmin crea VEHICLE_GATE.
[ ] TenantAdmin lista gates.
[ ] Sistema audita accessGate.created.
[ ] Ninguna respuesta incluye hardware command.
```

---

### 46.2. Smoke flow — residente preautoriza visitante

```text id="acv-smoke-resident-authorization"
[ ] ResidentA1 inicia sesión.
[ ] Sistema resuelve unitA101.
[ ] ResidentA1 crea VisitorProfile desde /me.
[ ] Sistema enmascara identificación.
[ ] Sistema no devuelve raw.
[ ] ResidentA1 crea AccessAuthorization para unitA101.
[ ] Sistema genera authorizationNumber.
[ ] Sistema genera AccessPass.
[ ] Sistema devuelve passCodeMasked.
[ ] Sistema no devuelve passCodeHash.
[ ] Sistema audita accessAuthorization.created.
```

---

### 46.3. Smoke flow — guardia valida pase y registra ingreso

```text id="acv-smoke-guard-checkin"
[ ] GuardA inicia sesión.
[ ] GuardA valida passCode.
[ ] Sistema valida tenant.
[ ] Sistema valida vigencia.
[ ] Sistema valida status active.
[ ] GuardA registra check-in.
[ ] Sistema crea AccessEvent checkIn.
[ ] Sistema crea AccessCheckIn open.
[ ] Sistema marca pass used si oneTime.
[ ] Sistema incrementa entriesUsed.
[ ] Sistema audita accessCheckIn.recorded.
```

---

### 46.4. Smoke flow — guardia registra salida

```text id="acv-smoke-guard-checkout"
[ ] GuardA consulta check-ins abiertos.
[ ] GuardA registra check-out.
[ ] Sistema crea AccessEvent checkOut.
[ ] Sistema crea AccessCheckOut recorded.
[ ] Sistema cierra AccessCheckIn.
[ ] Sistema impide segundo check-out.
[ ] Sistema audita accessCheckOut.recorded.
```

---

### 46.5. Smoke flow — ingreso denegado

```text id="acv-smoke-denied"
[ ] Visitante llega sin autorización.
[ ] GuardA registra deniedAccess.
[ ] Sistema crea AccessEvent deniedAccess.
[ ] Sistema crea AccessIncident si createIncident=true.
[ ] Sistema notifica si aplica.
[ ] Sistema audita accessEvent.recorded.
```

---

### 46.6. Smoke flow — entrega

```text id="acv-smoke-delivery"
[ ] GuardA registra delivery para unitA101.
[ ] Sistema crea VisitorDelivery.
[ ] Sistema sanitiza packageDescription.
[ ] GuardA marca entrega como receivedAtGate.
[ ] TenantAdmin marca delivery deliveredToUnit.
[ ] Sistema audita eventos de delivery.
```

---

### 46.7. Smoke flow — visita de proveedor

```text id="acv-smoke-supplier"
[ ] TenantAdmin crea supplier visit.
[ ] Sistema valida supplier active.
[ ] Sistema valida maintenanceWorkOrder si existe.
[ ] GuardA registra check-in del proveedor.
[ ] GuardA registra check-out del proveedor.
[ ] Sistema no crea SupplierPayable.
[ ] Sistema no crea SupplierPaymentOrder.
[ ] Sistema no crea Payment.
[ ] Sistema no modifica WorkOrder.
```

---

### 46.8. Smoke flow — incidente y exportación

```text id="acv-smoke-incident-export"
[ ] GuardA crea AccessIncident.
[ ] SecurityManager resuelve incidente.
[ ] TenantAdmin consulta incidents report.
[ ] TenantAdmin exporta report.
[ ] Sistema crea AccessReportExport.
[ ] Sistema crea SecureDocument.
[ ] Response incluye secureDocumentId.
[ ] Response no incluye storageKey.
[ ] Sistema audita accessReport.exported.
```

---

## 47. CI gates

El pipeline debe ejecutar:

```text id="acv-ci-gates"
[ ] unit tests.
[ ] masking tests.
[ ] hashing tests.
[ ] entity tests.
[ ] state machine tests.
[ ] policy tests.
[ ] repository tests.
[ ] integration tests.
[ ] API tenant tests.
[ ] Guard API tests.
[ ] /me API tests.
[ ] authz tests.
[ ] multitenancy tests.
[ ] privacy tests.
[ ] forbidden fields tests.
[ ] no public tests.
[ ] no WordPress tests.
[ ] no hardware tests.
[ ] no biometrics tests.
[ ] no AI tests.
[ ] audit tests.
[ ] observability tests.
[ ] OpenAPI contract tests.
[ ] smoke tests.
```

---

## 48. CI security gates

El pipeline debe fallar si:

```text id="acv-ci-security-gates"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta status directo fuera de transición.
[ ] Algún DTO acepta identificationNumberHash.
[ ] Algún DTO acepta plateHash.
[ ] Algún DTO acepta passCodeHash.
[ ] Algún DTO acepta storageKey.
[ ] Algún DTO acepta signedUrl.
[ ] Algún DTO acepta base64.
[ ] Algún DTO acepta biometricTemplate.
[ ] Algún DTO acepta faceEmbedding.
[ ] Algún DTO acepta gateOpenCommand.
[ ] Algún DTO acepta hardwareDeviceCommand.
[ ] Algún DTO acepta externalAiEnabled.
[ ] API permite visitor cross-tenant.
[ ] API permite vehicle cross-tenant.
[ ] API permite authorization cross-tenant.
[ ] API permite pass cross-tenant.
[ ] API permite event cross-tenant.
[ ] API permite check-in cross-tenant.
[ ] API permite check-out cross-tenant.
[ ] API permite report cross-tenant.
[ ] Resident puede ver unidad ajena.
[ ] Guard puede operar tenant ajeno.
[ ] Response expone identification raw.
[ ] Response expone plate raw.
[ ] Response expone passCode raw persistente.
[ ] Response expone hashes sensibles.
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

## 49. Cobertura mínima

```text id="acv-coverage"
- Masking helpers: >= 95%.
- Hashing helpers: >= 95%.
- Value objects: >= 95%.
- Entities: >= 90%.
- State machines: >= 95%.
- Policies: >= 95%.
- Application services: >= 90%.
- Repository integration: >= 85%.
- API controllers: >= 85%.
- Security tests críticos: 100% passing.
- Privacy tests críticos: 100% passing.
- Multitenancy tests críticos: 100% passing.
- Own-resource tests críticos: 100% passing.
- OpenAPI contract tests críticos: 100% passing.
```

---

## 50. Matriz de trazabilidad

| Área                   | Spec | Plan | Data Model | API Contract | Tests                              |
| ---------------------- | ---- | ---- | ---------- | ------------ | ---------------------------------- |
| VisitorProfile         | Sí   | Sí   | Sí         | Sí           | Unit / API / Privacy / MT          |
| VisitorVehicle         | Sí   | Sí   | Sí         | Sí           | Unit / API / Privacy / MT          |
| AccessGate             | Sí   | Sí   | Sí         | Sí           | Unit / API / Security              |
| AccessAuthorization    | Sí   | Sí   | Sí         | Sí           | Unit / API / Own / MT              |
| AccessPass             | Sí   | Sí   | Sí         | Sí           | Unit / API / Privacy / Concurrency |
| AccessEvent            | Sí   | Sí   | Sí         | Sí           | Unit / API / Audit                 |
| AccessCheckIn          | Sí   | Sí   | Sí         | Sí           | API / Integration / Audit          |
| AccessCheckOut         | Sí   | Sí   | Sí         | Sí           | API / Integration / Concurrency    |
| Guard API              | Sí   | Sí   | Sí         | Sí           | API / Authz / Security             |
| /me API                | Sí   | Sí   | Sí         | Sí           | Own-resource / Privacy             |
| VisitorDelivery        | Sí   | Sí   | Sí         | Sí           | API / Integration                  |
| SupplierVisit          | Sí   | Sí   | Sí         | Sí           | Boundary / API                     |
| RecurringAuthorization | Sí   | Sí   | Sí         | Sí           | Unit / API                         |
| AccessIncident         | Sí   | Sí   | Sí         | Sí           | Unit / API / Audit                 |
| AccessComment          | Sí   | Sí   | Sí         | Sí           | API / Privacy                      |
| AccessDocument         | Sí   | Sí   | Sí         | Sí           | SDS / Security                     |
| Reports                | Sí   | Sí   | Sí         | Sí           | API / Performance                  |
| Exports                | Sí   | Sí   | Sí         | Sí           | SDS / Audit                        |
| No public              | Sí   | Sí   | Sí         | Sí           | Security                           |
| No WordPress           | Sí   | Sí   | Sí         | Sí           | Security                           |
| No biometrics          | Sí   | Sí   | Sí         | Sí           | Security                           |
| No gate opening        | Sí   | Sí   | Sí         | Sí           | Security                           |
| No external AI         | Sí   | Sí   | Sí         | Sí           | Security                           |

---

## 51. Definition of Done de pruebas

```text id="acv-test-dod"
[ ] Tests unitarios implementados.
[ ] Tests de masking implementados.
[ ] Tests de hashing implementados.
[ ] Tests de value objects implementados.
[ ] Tests de entities implementados.
[ ] Tests de state machines implementados.
[ ] Tests de policies implementados.
[ ] Tests de repositories implementados.
[ ] Tests de services implementados.
[ ] Tests Tenant Admin API implementados.
[ ] Tests Guard API implementados.
[ ] Tests /me API implementados.
[ ] Tests authz implementados.
[ ] Tests own-resource implementados.
[ ] Tests multitenancy implementados.
[ ] Tests privacy implementados.
[ ] Tests forbidden fields implementados.
[ ] Tests no public implementados.
[ ] Tests no WordPress implementados.
[ ] Tests no hardware implementados.
[ ] Tests no biometrics implementados.
[ ] Tests no face recognition implementados.
[ ] Tests no plate OCR implementados.
[ ] Tests no external AI implementados.
[ ] Tests SDS boundary implementados.
[ ] Tests Supplier Payments boundary implementados.
[ ] Tests Maintenance Work Orders boundary implementados.
[ ] Tests Notifications sanitization implementados.
[ ] Tests audit implementados.
[ ] Tests observability implementados.
[ ] Tests OpenAPI implementados.
[ ] Tests performance básicos implementados.
[ ] Tests concurrency críticos implementados.
[ ] Smoke flows implementados.
[ ] CI gates implementados.
[ ] CI completo pasa.
```

---

## 52. No aceptación del test plan

No se acepta el módulo si las pruebas permiten:

```text id="acv-test-no-acceptance"
- visitor cross-tenant;
- vehicle cross-tenant;
- gate cross-tenant;
- authorization cross-tenant;
- pass cross-tenant;
- event cross-tenant;
- check-in cross-tenant;
- check-out cross-tenant;
- delivery cross-tenant;
- supplier visit cross-tenant;
- incident cross-tenant;
- comment cross-tenant;
- document cross-tenant;
- report cross-tenant;
- tenantId desde cliente;
- actor fields desde cliente;
- status directo fuera de transición;
- identificationNumberHash desde cliente;
- plateHash desde cliente;
- passCodeHash desde cliente;
- identificationNumberRaw en response general;
- phoneRaw en response general;
- plateRaw en response general;
- passCodeRaw persistente;
- storageKey en request o response;
- signedUrl persistente;
- base64 en JSON;
- rawFilePayload;
- biometricTemplate;
- faceEmbedding;
- cameraStreamUrl;
- gateOpenCommand;
- hardwareDeviceCommand;
- endpoint público de accesos;
- acceso desde WordPress público;
- residente viendo unidad ajena;
- guardia operando otro tenant;
- pass oneTime reutilizable;
- check-out duplicado;
- borrado físico de eventos críticos;
- audit crítica ausente;
- logs con datos personales raw;
- IA externa con datos reales;
- Payment creado desde Access Control;
- SupplierPaymentOrder creado desde Access Control;
- JournalEntry creado desde Access Control;
- Maintenance Work Order modificado desde Access Control.
```

---

## 53. Resultado esperado

Al completar este plan de pruebas, el módulo `024-access-control-visitors` tendrá cobertura suficiente para validar operación, privacidad, seguridad, multitenancy, trazabilidad, límites de dominio, auditoría, observabilidad y contrato API.

Resultado esperado:

```text id="acv-test-expected-result"
unit tests definidos
masking tests definidos
hashing tests definidos
entity tests definidos
state machine tests definidos
policy tests definidos
repository tests definidos
service tests definidos
Tenant Admin API tests definidos
Guard API tests definidos
/me API tests definidos
authz tests definidos
own-resource tests definidos
multitenancy tests definidos
privacy tests definidos
forbidden fields tests definidos
no public tests definidos
no WordPress tests definidos
no hardware tests definidos
no biometrics tests definidos
no face recognition tests definidos
no plate OCR tests definidos
no external AI tests definidos
SDS boundary tests definidos
Supplier Payments boundary tests definidos
Maintenance Work Orders boundary tests definidos
Notifications sanitization tests definidos
audit tests definidos
observability tests definidos
OpenAPI contract tests definidos
performance tests definidos
concurrency tests definidos
smoke flows definidos
CI gates definidos
no public endpoints verificado
no WordPress access verificado
no biometric processing verificado
no face recognition verificado
no gate opening verificado
no hardware control verificado
no external AI with real data verificado
```

---

## 54. Expediente actualizado

```text id="acv-test-expediente"
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
│   │       └── test-plan.md
```
