# Tasks — Spec 003 Residents, Owners, Tenants and Property Units

## 1. Información del documento

| Campo           | Valor                                                 |
| --------------- | ----------------------------------------------------- |
| Proyecto        | RESIDENT Core                                         |
| Spec ID         | 003                                                   |
| Módulo          | Residents and Properties                              |
| Documento       | Implementation Tasks                                  |
| Ruta            | `docs/specs/003-residents-properties/tasks.md`        |
| Versión         | 0.1                                                   |
| Estado          | needs-review                                          |
| Fecha           | 2026-07-14                                            |
| Documento base  | `docs/specs/003-residents-properties/spec.md`         |
| Plan técnico    | `docs/specs/003-residents-properties/plan.md`         |
| Modelo de datos | `docs/specs/003-residents-properties/data-model.md`   |
| Contrato API    | `docs/specs/003-residents-properties/api-contract.md` |
| Plan de pruebas | `docs/specs/003-residents-properties/test-plan.md`    |
| Depende de      | `001-tenants`, `002-users-roles`                      |

---

## 2. Propósito

Este documento convierte la spec `003-residents-properties` en una lista ejecutable de tareas para implementar el módulo `Residents and Properties` siguiendo Spec Driven Development.

El módulo debe permitir administrar:

* personas;
* entidades jurídicas;
* unidades habitacionales;
* propietarios;
* residentes;
* arriendos básicos;
* vehículos;
* mascotas;
* contactos de emergencia;
* vínculo `UserProfile` ↔ `Person`;
* acceso `.own`;
* auditoría;
* eventos;
* pruebas de autorización;
* pruebas multitenant;
* pruebas de privacidad.

---

## 3. Convenciones de estado

Usar los siguientes estados:

```text id="m7dv9a"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="y60k2b"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas de ejecución

Antes de implementar código, se debe revisar:

```text id="cv5vrt"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
```

Reglas obligatorias:

```text id="yiz6fk"
1. Todo dato operativo debe tener tenantId.
2. No se permite acceso cross-tenant.
3. No se permite relación entre persona/unidad de tenants distintos.
4. No se permite acceso .own sin vínculo UserProfile → Person.
5. No se debe eliminar físicamente historial de propiedad o residencia.
6. No se deben registrar datos personales completos en logs.
7. No se deben usar datos reales en seeds.
8. No se deben implementar pagos, alícuotas, multas ni reservas en esta spec.
9. No se debe validar oficialmente cédula/RUC en MVP.
10. No se deben crear documentos legales adjuntos en esta spec.
11. Todo endpoint privado debe tener AuthGuard.
12. Todo endpoint tenant-scoped debe tener TenantGuard.
13. Todo endpoint administrativo debe tener TenantPermissionGuard.
14. Todo endpoint .own debe validar OwnResourcePolicyService.
15. Todo cambio sensible debe auditarse.
16. Todo endpoint debe estar documentado en OpenAPI.
17. Toda operación crítica debe tener pruebas unitarias, integración, API, autorización y multitenant.
```

---

## 5. Resumen de entregables

Al cerrar esta spec deben existir:

```text id="lty0k4"
docs/specs/003-residents-properties/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Y en backend:

```text id="wwjx5n"
apps/api/src/modules/residents-properties/
├── residents-properties.module.ts
├── property-units.controller.ts
├── persons.controller.ts
├── legal-entities.controller.ts
├── property-ownerships.controller.ts
├── residencies.controller.ts
├── leases.controller.ts
├── vehicles.controller.ts
├── pets.controller.ts
├── emergency-contacts.controller.ts
├── own-resources.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text id="tv0214"
docs/specs/003-residents-properties/
```

### Criterios de aceptación

* La carpeta existe.
* Contiene documentos de la spec.
* Sigue estructura usada en `001-tenants` y `002-users-roles`.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="d4dddk"
docs/specs/003-residents-properties/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define actores.
* Define entidades principales.
* Define reglas de negocio.
* Define historias.
* Define requisitos funcionales y no funcionales.
* Define API preliminar.
* Define riesgos y criterios globales.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="vo075x"
docs/specs/003-residents-properties/plan.md
```

### Criterios de aceptación

* Define arquitectura del módulo.
* Define carpetas.
* Define entidades.
* Define value objects.
* Define repositorios.
* Define servicios.
* Define casos de uso.
* Define controladores.
* Define policies `.own`.
* Define auditoría, eventos y observabilidad.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="vwf6vb"
docs/specs/003-residents-properties/data-model.md
```

### Criterios de aceptación

* Define tablas.
* Define columnas.
* Define enums.
* Define relaciones.
* Define constraints.
* Define índices.
* Define modelo Prisma.
* Define reglas SQL manuales.
* Define seeds.
* Define reglas `.own`.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="r5j10i"
docs/specs/003-residents-properties/api-contract.md
```

### Criterios de aceptación

* Define endpoints administrativos.
* Define endpoints `.own`.
* Define permisos.
* Define requests.
* Define responses.
* Define errores.
* Define auditoría.
* Define eventos.
* Define OpenAPI.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="gek1vf"
docs/specs/003-residents-properties/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define application tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define own access tests.
* Define multitenancy tests.
* Define security/privacy tests.
* Define OpenAPI tests.

---

## TASK-007 — Registrar tareas de implementación

**Estado:** `[ ] Pending`

### Archivo

```text id="odx0i3"
docs/specs/003-residents-properties/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Tareas ejecutables.
* Criterios de aceptación claros.
* Pruebas asociadas.
* Pendientes diferidos documentados.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="z8evu8"
docs/specs/003-residents-properties/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos de privacidad.
* Identifica riesgos cross-tenant.
* Define controles `.own`.
* Define reglas de logs.
* Define reglas de datos personales.
* Define pruebas de seguridad.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `residents-properties`

**Estado:** `[ ] Pending`

### Archivo

```text id="vji8x7"
apps/api/src/modules/residents-properties/residents-properties.module.ts
```

### Criterios de aceptación

* El módulo compila.
* Está registrado en `AppModule`.
* No depende de módulos futuros.
* Importa dependencias necesarias de tenants y users-roles.
* No contiene lógica de negocio.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="y1tvvq"
apps/api/src/modules/residents-properties/
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   ├── audit/
│   └── events/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Respeta `plan.md`.
* Controladores no usan Prisma directamente.
* Dominio no depende de infraestructura.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="u53yii"
property-units.controller.ts
persons.controller.ts
legal-entities.controller.ts
property-ownerships.controller.ts
residencies.controller.ts
leases.controller.ts
vehicles.controller.ts
pets.controller.ts
emergency-contacts.controller.ts
own-resources.controller.ts
```

### Criterios de aceptación

* Compilan.
* Están registrados en `ResidentsPropertiesModule`.
* Tienen rutas base correctas.
* No contienen lógica de negocio.

---

# 8. Fase 2 — Value objects

## TASK-012 — Implementar `PropertyUnitCode`

**Estado:** `[ ] Pending`

### Archivo

```text id="g5k55l"
domain/value-objects/property-unit-code.vo.ts
```

### Criterios de aceptación

* Requiere valor.
* Aplica trim.
* Valida longitud máxima.
* Rechaza vacío.
* Tiene unit tests.

### Pruebas

```text id="dpnvdu"
UT-PUCODE-001 a UT-PUCODE-005
```

---

## TASK-013 — Implementar `PropertyUnitType`

**Estado:** `[ ] Pending`

### Archivo

```text id="30zvbt"
domain/value-objects/property-unit-type.vo.ts
```

### Valores

```text id="6cbx7n"
house
apartment
suite
lot
parking
storage
commercial
mixed
other
```

### Criterios de aceptación

* Acepta valores definidos.
* Rechaza valores inválidos.
* Tiene unit tests.

---

## TASK-014 — Implementar `IdentificationType`

**Estado:** `[ ] Pending`

### Archivo

```text id="suqsiv"
domain/value-objects/identification-type.vo.ts
```

### Valores

```text id="utnhws"
cedula
ruc
passport
other
none
```

### Criterios de aceptación

* Acepta tipos definidos.
* No ejecuta validación oficial externa.
* Tiene unit tests.

---

## TASK-015 — Implementar `IdentificationNumber`

**Estado:** `[ ] Pending`

### Archivo

```text id="2z11fr"
domain/value-objects/identification-number.vo.ts
```

### Criterios de aceptación

* Aplica trim.
* Valida longitud.
* Rechaza payloads inválidos.
* Permite null cuando no aplique.
* Tiene unit tests.

---

## TASK-016 — Implementar `OwnershipPercentage`

**Estado:** `[ ] Pending`

### Archivo

```text id="xipig8"
domain/value-objects/ownership-percentage.vo.ts
```

### Criterios de aceptación

* Mayor que 0.
* Menor o igual a 100.
* Permite null si política lo permite.
* Usa decimal, no float.
* Tiene unit tests.

---

## TASK-017 — Implementar `DateRange`

**Estado:** `[ ] Pending`

### Archivo

```text id="5gz0vf"
domain/value-objects/date-range.vo.ts
```

### Criterios de aceptación

* `startDate` requerido.
* `endDate` opcional.
* `endDate >= startDate`.
* Tiene unit tests.

---

## TASK-018 — Implementar `VehiclePlate`

**Estado:** `[ ] Pending`

### Archivo

```text id="2s8c2v"
domain/value-objects/vehicle-plate.vo.ts
```

### Criterios de aceptación

* Aplica trim.
* Normaliza uppercase.
* Valida longitud.
* Permite null si no aplica.
* Tiene unit tests.

---

## TASK-019 — Implementar value objects de estados

**Estado:** `[ ] Pending`

### Archivos

```text id="8w1zke"
person-status.vo.ts
legal-entity-status.vo.ts
property-unit-status.vo.ts
ownership-status.vo.ts
residency-status.vo.ts
lease-status.vo.ts
vehicle-status.vo.ts
pet-status.vo.ts
emergency-contact-status.vo.ts
```

### Criterios de aceptación

* Cada estado valida valores permitidos.
* `archived` no opera ordinariamente.
* `ended` no puede finalizarse de nuevo.
* Tienen unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-020 — Implementar entidad `Person`

**Estado:** `[ ] Pending`

### Archivo

```text id="5lp64f"
domain/entities/person.entity.ts
```

### Métodos esperados

```text id="9kj6jw"
updateProfile(input)
linkUserProfile(userProfileId)
archive(actorId, reason)
isActive()
isArchived()
canOperate()
```

### Criterios de aceptación

* Permite persona sin usuario.
* Permite vincular `UserProfile`.
* Bloquea operaciones ordinarias si archived.
* Tiene unit tests.

---

## TASK-021 — Implementar entidad `LegalEntity`

**Estado:** `[ ] Pending`

### Archivo

```text id="qf1pei"
domain/entities/legal-entity.entity.ts
```

### Criterios de aceptación

* Requiere nombre.
* Soporta identificación tributaria opcional.
* Permite archive lógico.
* Tiene unit tests.

---

## TASK-022 — Implementar entidad `PropertyUnit`

**Estado:** `[ ] Pending`

### Archivo

```text id="7em6v7"
domain/entities/property-unit.entity.ts
```

### Métodos esperados

```text id="p3w89x"
update(input)
archive(actorId, reason)
isActive()
isArchived()
canOperate()
```

### Criterios de aceptación

* Valida código.
* Valida tipo.
* Valida área positiva.
* No permite operación ordinaria si archived.
* Tiene unit tests.

---

## TASK-023 — Implementar entidad `PropertyOwnership`

**Estado:** `[ ] Pending`

### Archivo

```text id="x4tk2l"
domain/entities/property-ownership.entity.ts
```

### Métodos esperados

```text id="ng6zg5"
end(endDate, actorId, reason)
isActive()
isEnded()
validateOwnerXor()
```

### Criterios de aceptación

* Permite propietario persona.
* Permite propietario entidad jurídica.
* Rechaza persona y entidad simultáneas.
* Rechaza ausencia de propietario.
* Conserva historial mediante `endDate`.
* Tiene unit tests.

---

## TASK-024 — Implementar entidad `Residency`

**Estado:** `[ ] Pending`

### Archivo

```text id="fjoaqy"
domain/entities/residency.entity.ts
```

### Métodos esperados

```text id="00c6kv"
end(endDate, actorId, reason)
suspend(actorId, reason)
isActive()
isEnded()
```

### Criterios de aceptación

* Valida persona y unidad conceptualmente.
* Finaliza con `endDate`.
* No elimina físicamente.
* Tiene unit tests.

---

## TASK-025 — Implementar entidad `Lease`

**Estado:** `[ ] Pending`

### Archivo

```text id="9x8im0"
domain/entities/lease.entity.ts
```

### Métodos esperados

```text id="a7v0yq"
activate()
end(endDate, actorId, reason)
cancel(actorId, reason)
validateOwnerXor()
```

### Criterios de aceptación

* Permite ownerPerson u ownerLegalEntity.
* Rechaza ambos owners.
* Rechaza ausencia de owner.
* No maneja valores monetarios en MVP.
* Tiene unit tests.

---

## TASK-026 — Implementar entidad `Vehicle`

**Estado:** `[ ] Pending`

### Archivo

```text id="06js2k"
domain/entities/vehicle.entity.ts
```

### Criterios de aceptación

* Requiere al menos persona o unidad.
* Normaliza placa.
* Permite archivado lógico.
* Tiene unit tests.

---

## TASK-027 — Implementar entidad `Pet`

**Estado:** `[ ] Pending`

### Archivo

```text id="2fwqen"
domain/entities/pet.entity.ts
```

### Criterios de aceptación

* Requiere nombre.
* Requiere al menos persona o unidad.
* No almacena datos veterinarios sensibles.
* Permite archivado lógico.
* Tiene unit tests.

---

## TASK-028 — Implementar entidad `EmergencyContact`

**Estado:** `[ ] Pending`

### Archivo

```text id="vawees"
domain/entities/emergency-contact.entity.ts
```

### Criterios de aceptación

* Requiere persona.
* Requiere nombre.
* Requiere teléfono.
* Permite archivado lógico.
* Tiene unit tests.

---

## TASK-029 — Implementar errores de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="6aq1ko"
property-unit-not-found.error.ts
property-unit-code-already-exists.error.ts
property-unit-archived.error.ts
person-not-found.error.ts
person-identification-already-exists.error.ts
person-archived.error.ts
user-already-linked-to-person.error.ts
own-person-not-linked.error.ts
legal-entity-not-found.error.ts
legal-entity-identification-already-exists.error.ts
ownership-not-found.error.ts
ownership-already-ended.error.ts
ownership-owner-required.error.ts
ownership-owner-xor-violation.error.ts
ownership-percentage-invalid.error.ts
residency-not-found.error.ts
residency-already-ended.error.ts
lease-not-found.error.ts
lease-already-ended.error.ts
vehicle-not-found.error.ts
vehicle-plate-already-exists.error.ts
pet-not-found.error.ts
emergency-contact-not-found.error.ts
cross-tenant-reference.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone detalles internos.

---

## TASK-030 — Implementar eventos de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="6hftes"
person-created.event.ts
person-updated.event.ts
person-archived.event.ts
user-linked-to-person.event.ts
legal-entity-created.event.ts
legal-entity-updated.event.ts
legal-entity-archived.event.ts
property-unit-created.event.ts
property-unit-updated.event.ts
property-unit-archived.event.ts
property-ownership-created.event.ts
property-ownership-ended.event.ts
residency-created.event.ts
residency-ended.event.ts
lease-created.event.ts
lease-ended.event.ts
vehicle-registered.event.ts
vehicle-updated.event.ts
vehicle-archived.event.ts
pet-registered.event.ts
pet-updated.event.ts
pet-archived.event.ts
emergency-contact-created.event.ts
emergency-contact-updated.event.ts
emergency-contact-archived.event.ts
```

### Criterios de aceptación

* Incluyen `tenantId`.
* Incluyen `actorUserId` cuando aplique.
* Incluyen `traceId`.
* No incluyen datos personales completos innecesarios.

---

# 10. Fase 4 — DTOs y validación

## TASK-031 — Crear DTOs de Property Units

**Estado:** `[ ] Pending`

### Archivos

```text id="vwwjvn"
create-property-unit.dto.ts
update-property-unit.dto.ts
archive-property-unit.dto.ts
property-unit-response.dto.ts
list-property-units-query.dto.ts
```

### Criterios de aceptación

* Valida `code`.
* Valida `type`.
* Valida `areaM2`.
* No permite `tenantId` desde body.
* No expone datos internos innecesarios.

---

## TASK-032 — Crear DTOs de Persons

**Estado:** `[ ] Pending`

### Archivos

```text id="ee1dpz"
create-person.dto.ts
update-person.dto.ts
archive-person.dto.ts
link-user-to-person.dto.ts
person-response.dto.ts
list-persons-query.dto.ts
```

### Criterios de aceptación

* Valida nombre visible.
* Valida identificación básica.
* Valida email.
* Enmascara identificación en responses según permiso.
* No acepta datos sensibles no permitidos.

---

## TASK-033 — Crear DTOs de Legal Entities

**Estado:** `[ ] Pending`

### Archivos

```text id="nfctlu"
create-legal-entity.dto.ts
update-legal-entity.dto.ts
archive-legal-entity.dto.ts
legal-entity-response.dto.ts
list-legal-entities-query.dto.ts
```

### Criterios de aceptación

* Valida nombre.
* Valida identificación tributaria básica.
* Valida email.
* No permite `tenantId` desde body.

---

## TASK-034 — Crear DTOs de Property Ownerships

**Estado:** `[ ] Pending`

### Archivos

```text id="j51jdt"
create-property-ownership.dto.ts
update-property-ownership.dto.ts
end-property-ownership.dto.ts
property-ownership-response.dto.ts
list-property-ownerships-query.dto.ts
```

### Criterios de aceptación

* Valida `propertyUnitId`.
* Valida XOR `personId` / `legalEntityId`.
* Valida porcentaje.
* Valida fechas.
* No permite cambiar propietario por PATCH genérico.

---

## TASK-035 — Crear DTOs de Residencies

**Estado:** `[ ] Pending`

### Archivos

```text id="8zpohp"
create-residency.dto.ts
update-residency.dto.ts
end-residency.dto.ts
residency-response.dto.ts
list-residencies-query.dto.ts
```

### Criterios de aceptación

* Valida `propertyUnitId`.
* Valida `personId`.
* Valida `residencyType`.
* Valida fechas.
* No permite cambiar relaciones históricas indebidamente.

---

## TASK-036 — Crear DTOs de Leases

**Estado:** `[ ] Pending`

### Archivos

```text id="dtogm5"
create-lease.dto.ts
update-lease.dto.ts
end-lease.dto.ts
lease-response.dto.ts
list-leases-query.dto.ts
```

### Criterios de aceptación

* Valida `propertyUnitId`.
* Valida owner XOR.
* Valida `tenantPersonId`.
* Valida fechas.
* Rechaza campos monetarios en MVP.

---

## TASK-037 — Crear DTOs de Vehicles

**Estado:** `[ ] Pending`

### Archivos

```text id="dgh4dk"
create-vehicle.dto.ts
update-vehicle.dto.ts
archive-vehicle.dto.ts
vehicle-response.dto.ts
list-vehicles-query.dto.ts
```

### Criterios de aceptación

* Valida placa.
* Requiere persona o unidad.
* No permite `tenantId` desde body.
* No acepta payloads excesivos.

---

## TASK-038 — Crear DTOs de Pets

**Estado:** `[ ] Pending`

### Archivos

```text id="ucpi4k"
create-pet.dto.ts
update-pet.dto.ts
archive-pet.dto.ts
pet-response.dto.ts
list-pets-query.dto.ts
```

### Criterios de aceptación

* Requiere nombre.
* Requiere persona o unidad.
* No acepta datos veterinarios sensibles.
* No permite `tenantId` desde body.

---

## TASK-039 — Crear DTOs de Emergency Contacts

**Estado:** `[ ] Pending`

### Archivos

```text id="aqk0gs"
create-emergency-contact.dto.ts
update-emergency-contact.dto.ts
archive-emergency-contact.dto.ts
emergency-contact-response.dto.ts
list-emergency-contacts-query.dto.ts
```

### Criterios de aceptación

* Requiere `personId`.
* Requiere nombre.
* Requiere teléfono.
* Valida email si existe.
* No acepta datos médicos.

---

## TASK-040 — Crear DTOs de Own Resources

**Estado:** `[ ] Pending`

### Archivos

```text id="y2shte"
my-person-response.dto.ts
my-property-unit-response.dto.ts
my-residency-response.dto.ts
my-vehicle-response.dto.ts
my-pet-response.dto.ts
my-emergency-contact-response.dto.ts
```

### Criterios de aceptación

* Devuelve solo datos propios.
* No expone datos de terceros.
* No expone datos administrativos innecesarios.
* No devuelve identificaciones completas salvo permiso explícito.

---

# 11. Fase 5 — Prisma, migración y seeds

## TASK-041 — Agregar enums a Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="3ivspx"
PersonStatus
LegalEntityStatus
PropertyUnitStatus
PropertyUnitType
IdentificationType
OwnershipStatus
OwnershipType
ResidencyStatus
ResidencyType
LeaseStatus
VehicleStatus
VehicleType
PetStatus
EmergencyContactStatus
```

### Criterios de aceptación

* Enums creados.
* Mapeados según `data-model.md`.
* Prisma Client genera sin errores.

---

## TASK-042 — Agregar modelo Prisma `Person`

**Estado:** `[ ] Pending`

### Archivo

```text id="sugwo8"
apps/api/prisma/schema.prisma
```

### Criterios de aceptación

* `tenantId` obligatorio.
* `userProfileId` opcional.
* Índices definidos.
* Relación con `Tenant`.
* Relación con `UserProfile`.
* No contiene datos sensibles diferidos.

---

## TASK-043 — Agregar modelo Prisma `LegalEntity`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* Nombre requerido.
* Identificación tributaria opcional.
* Índices definidos.
* `onDelete: Restrict`.

---

## TASK-044 — Agregar modelo Prisma `PropertyUnit`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `code` requerido.
* `@@unique([tenantId, code])`.
* Índices definidos.
* Relación con `Tenant`.
* `onDelete: Restrict`.

---

## TASK-045 — Agregar modelo Prisma `PropertyOwnership`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* Relación con `PropertyUnit`.
* Relación opcional con `Person`.
* Relación opcional con `LegalEntity`.
* Índices definidos.
* `onDelete: Restrict`.
* Constraints XOR planificadas en SQL manual.

---

## TASK-046 — Agregar modelo Prisma `Residency`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* Relación con `PropertyUnit`.
* Relación con `Person`.
* Fechas de vigencia.
* Índices definidos.
* `onDelete: Restrict`.

---

## TASK-047 — Agregar modelo Prisma `Lease`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* Relación con unidad.
* Relación con arrendatario.
* Relación opcional con ownerPerson.
* Relación opcional con ownerLegalEntity.
* No incluye montos monetarios.
* Constraints XOR planificadas.

---

## TASK-048 — Agregar modelos Prisma `Vehicle`, `Pet`, `EmergencyContact`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* Relaciones definidas.
* Índices definidos.
* `Vehicle` y `Pet` requieren persona o unidad mediante constraint SQL o validación.
* `EmergencyContact` requiere persona.

---

## TASK-049 — Agregar relaciones inversas en `Tenant`

**Estado:** `[ ] Pending`

### Relaciones

```text id="e8r6gd"
persons
legalEntities
propertyUnits
propertyOwnerships
residencies
leases
vehicles
pets
emergencyContacts
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `001-tenants`.

---

## TASK-050 — Agregar relación inversa en `UserProfile`

**Estado:** `[ ] Pending`

### Relación

```text id="775xtr"
persons
```

### Criterios de aceptación

* Un UserProfile puede vincularse con Person en distintos tenants.
* No rompe tests de `002-users-roles`.

---

## TASK-051 — Crear migración `003_create_residents_properties`

**Estado:** `[ ] Pending`

### Comando sugerido

```bash id="a6edq8"
npm run prisma:migrate:dev -- --name 003_create_residents_properties
```

### Criterios de aceptación

* Migración creada.
* Migración aplica localmente.
* No hay cascade delete peligroso.
* `tenant_id` obligatorio.
* Índices creados.
* Unique `tenant_id + code` creado.
* Prisma Client genera.

---

## TASK-052 — Agregar constraints SQL manuales

**Estado:** `[ ] Pending`

### Constraints

```text id="hc3kmm"
persons_tenant_identification_unique
legal_entities_tenant_tax_identification_unique
vehicles_tenant_plate_unique
property_ownerships_owner_xor_check
leases_owner_xor_check
vehicles_person_or_unit_check
pets_person_or_unit_check
property_ownerships_date_range_check
residencies_date_range_check
leases_date_range_check
property_ownerships_percentage_check
```

### Criterios de aceptación

* SQL revisado.
* Migration tests cubren constraints.
* No contradice Prisma schema.
* Documentado en migración.

---

## TASK-053 — Crear mappers Prisma ↔ dominio

**Estado:** `[ ] Pending`

### Archivo

```text id="79j23a"
infrastructure/persistence/residents-properties.mapper.ts
```

### Criterios de aceptación

* Convierte Prisma a entidades.
* Convierte entidades a DTOs.
* Enmascara datos sensibles cuando aplique.
* No expone identificaciones completas por defecto.

---

## TASK-054 — Crear repositorios Prisma

**Estado:** `[ ] Pending`

### Archivos

```text id="1rtzso"
prisma-property-unit.repository.ts
prisma-person.repository.ts
prisma-legal-entity.repository.ts
prisma-property-ownership.repository.ts
prisma-residency.repository.ts
prisma-lease.repository.ts
prisma-vehicle.repository.ts
prisma-pet.repository.ts
prisma-emergency-contact.repository.ts
```

### Criterios de aceptación

* No se usa Prisma desde controladores.
* Todas las consultas filtran por `tenantId`.
* Mapean errores de unique constraints.
* Tienen integration tests.

---

## TASK-055 — Crear seeds demo

**Estado:** `[ ] Pending`

### Seeds

```text id="lr9ahx"
property units demo
persons demo
legal entities demo
ownerships demo
residencies demo
leases demo
vehicles demo
pets demo
emergency contacts demo
```

### Criterios de aceptación

* Idempotentes.
* Usan `example.com`.
* Usan datos ficticios.
* No usan cédulas reales.
* No usan placas reales.
* No usan teléfonos reales.
* No crean datos financieros.

---

# 12. Fase 6 — Puertos y adaptadores

## TASK-056 — Crear puertos de repositorio

**Estado:** `[ ] Pending`

### Archivos

```text id="471gxu"
property-unit.repository.ts
person.repository.ts
legal-entity.repository.ts
property-ownership.repository.ts
residency.repository.ts
lease.repository.ts
vehicle.repository.ts
pet.repository.ts
emergency-contact.repository.ts
```

### Criterios de aceptación

* Contratos definidos.
* No dependen de Prisma.
* Usan `tenantId` en métodos críticos.
* Son testeables.

---

## TASK-057 — Crear `ResidentsPropertiesAuditPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="06u2c4"
application/ports/residents-properties-audit.port.ts
```

### Criterios de aceptación

* Registra tenant.
* Registra actor.
* Registra recurso.
* Registra acción.
* Registra `traceId`.
* No incluye datos personales completos innecesarios.

---

## TASK-058 — Crear adaptador temporal de auditoría

**Estado:** `[ ] Pending`

### Archivo

```text id="26dt3n"
infrastructure/audit/residents-properties-audit.adapter.ts
```

### Criterios de aceptación

* Implementa `ResidentsPropertiesAuditPort`.
* Compatible con futura spec `007-audit`.
* Sanitiza datos personales.
* Tiene tests básicos.

---

## TASK-059 — Crear `ResidentsPropertiesEventsPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="fi3biw"
application/ports/residents-properties-events.port.ts
```

### Criterios de aceptación

* Define `publish(event)`.
* No depende de broker externo.
* Compatible con outbox futuro.

---

## TASK-060 — Crear adaptador temporal de eventos

**Estado:** `[ ] Pending`

### Archivo

```text id="f9qdn3"
infrastructure/events/residents-properties-events.adapter.ts
```

### Criterios de aceptación

* Implementa puerto de eventos.
* No envía datos personales completos.
* No invoca n8n directamente.
* Es reemplazable.

---

# 13. Fase 7 — Servicios y policies

## TASK-061 — Implementar `OwnResourcePolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="2s9dzu"
application/services/own-resource-policy.service.ts
```

### Criterios de aceptación

* Resuelve `UserProfile → Person`.
* Valida tenant actual.
* Valida relación activa con unidad.
* Valida vehículos propios.
* Valida mascotas propias.
* Valida contactos propios.
* No permite recurso ajeno.
* Tiene tests.

---

## TASK-062 — Implementar `PropertyUnitPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida código único por tenant.
* Valida estado de unidad.
* Bloquea actualización ordinaria si archived.
* Valida área positiva.
* Tiene tests.

---

## TASK-063 — Implementar `PersonPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida identificación única por tenant.
* Valida vínculo UserProfile-Person.
* Bloquea duplicado de vínculo en mismo tenant.
* Controla archivado con relaciones activas según política.
* Tiene tests.

---

## TASK-064 — Implementar `OwnershipPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida unidad del tenant.
* Valida owner persona o entidad del tenant.
* Valida XOR.
* Valida porcentaje.
* Valida finalización.
* Evita sobrescritura de historial.
* Tiene tests.

---

## TASK-065 — Implementar `ResidencyPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida unidad del tenant.
* Valida persona del tenant.
* Valida fechas.
* Valida finalización.
* Evita sobrescritura de historial.
* Tiene tests.

---

## TASK-066 — Implementar `LeasePolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida unidad del tenant.
* Valida propietario del tenant.
* Valida arrendatario del tenant.
* Valida owner XOR.
* Valida fechas.
* Rechaza montos en MVP.
* Tiene tests.

---

## TASK-067 — Implementar `ResidentProfileService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resume relación UserProfile-Person.
* Devuelve unidades propias.
* Devuelve residencias activas.
* Prepara información para módulos futuros.
* Tiene tests.

---

# 14. Fase 8 — Casos de uso

## TASK-068 — Implementar use cases de Property Units

**Estado:** `[ ] Pending`

### Use cases

```text id="i68blt"
CreatePropertyUnitUseCase
UpdatePropertyUnitUseCase
ArchivePropertyUnitUseCase
GetPropertyUnitUseCase
ListPropertyUnitsUseCase
```

### Criterios de aceptación

* Validan tenant activo.
* Validan permisos.
* Validan código único.
* Auditan cambios.
* Emiten eventos.
* Tienen tests.

---

## TASK-069 — Implementar use cases de Persons

**Estado:** `[ ] Pending`

### Use cases

```text id="hq6po4"
CreatePersonUseCase
UpdatePersonUseCase
ArchivePersonUseCase
GetPersonUseCase
ListPersonsUseCase
LinkUserToPersonUseCase
```

### Criterios de aceptación

* Validan tenant activo.
* Validan permisos.
* Validan identificación única.
* Vinculan UserProfile con Person.
* Auditan cambios.
* Emiten eventos.
* Tienen tests.

---

## TASK-070 — Implementar use cases de Legal Entities

**Estado:** `[ ] Pending`

### Use cases

```text id="86kcrj"
CreateLegalEntityUseCase
UpdateLegalEntityUseCase
ArchiveLegalEntityUseCase
GetLegalEntityUseCase
ListLegalEntitiesUseCase
```

### Criterios de aceptación

* Validan identificación tributaria.
* Validan tenant.
* No mezclan tenants.
* Auditan cambios.
* Tienen tests.

---

## TASK-071 — Implementar use cases de Property Ownerships

**Estado:** `[ ] Pending`

### Use cases

```text id="ewtiv2"
CreatePropertyOwnershipUseCase
UpdatePropertyOwnershipUseCase
EndPropertyOwnershipUseCase
GetPropertyOwnershipUseCase
ListPropertyOwnershipsUseCase
```

### Criterios de aceptación

* Validan unidad.
* Validan propietario.
* Validan XOR.
* Validan porcentaje.
* Finalizan con `endDate`.
* Conservan historial.
* Auditan.
* Tienen tests.

---

## TASK-072 — Implementar use cases de Residencies

**Estado:** `[ ] Pending`

### Use cases

```text id="bir8az"
CreateResidencyUseCase
UpdateResidencyUseCase
EndResidencyUseCase
GetResidencyUseCase
ListResidenciesUseCase
```

### Criterios de aceptación

* Validan persona y unidad.
* Validan tenant.
* Validan fechas.
* Finalizan sin eliminar.
* Conservan historial.
* Auditan.
* Tienen tests.

---

## TASK-073 — Implementar use cases de Leases

**Estado:** `[ ] Pending`

### Use cases

```text id="k3asmc"
CreateLeaseUseCase
UpdateLeaseUseCase
EndLeaseUseCase
GetLeaseUseCase
ListLeasesUseCase
```

### Criterios de aceptación

* Validan unidad.
* Validan owner.
* Validan tenantPerson.
* Validan XOR.
* Validan fechas.
* No manejan valores monetarios.
* Auditan.
* Tienen tests.

---

## TASK-074 — Implementar use cases de Vehicles

**Estado:** `[ ] Pending`

### Use cases

```text id="040l79"
CreateVehicleUseCase
UpdateVehicleUseCase
ArchiveVehicleUseCase
GetVehicleUseCase
ListVehiclesUseCase
```

### Criterios de aceptación

* Validan persona o unidad.
* Validan tenant.
* Validan placa.
* Auditan.
* Emiten eventos.
* Tienen tests.

---

## TASK-075 — Implementar use cases de Pets

**Estado:** `[ ] Pending`

### Use cases

```text id="fqc9bs"
CreatePetUseCase
UpdatePetUseCase
ArchivePetUseCase
GetPetUseCase
ListPetsUseCase
```

### Criterios de aceptación

* Validan persona o unidad.
* Validan tenant.
* No aceptan datos sensibles.
* Auditan.
* Emiten eventos.
* Tienen tests.

---

## TASK-076 — Implementar use cases de Emergency Contacts

**Estado:** `[ ] Pending`

### Use cases

```text id="3y5hbb"
CreateEmergencyContactUseCase
UpdateEmergencyContactUseCase
ArchiveEmergencyContactUseCase
GetEmergencyContactUseCase
ListEmergencyContactsUseCase
```

### Criterios de aceptación

* Validan persona del tenant.
* Validan teléfono.
* No aceptan datos médicos.
* Auditan.
* Tienen tests.

---

## TASK-077 — Implementar use cases `.own`

**Estado:** `[ ] Pending`

### Use cases

```text id="1ga7fb"
GetMyPersonUseCase
GetMyPropertyUnitsUseCase
GetMyResidenciesUseCase
GetMyVehiclesUseCase
GetMyPetsUseCase
GetMyEmergencyContactsUseCase
```

### Criterios de aceptación

* Validan usuario autenticado.
* Validan tenant activo.
* Validan membership activa.
* Validan permiso `.own`.
* Validan `UserProfile → Person`.
* Devuelven solo recursos propios.
* No devuelven recursos ajenos.
* Tienen own access tests.

---

# 15. Fase 9 — Policies, guards y autorización

## TASK-078 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida token.
* Resuelve UserProfile.
* Bloquea disabled user.
* Bloquea archived user.

---

## TASK-079 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida tenant active.
* Valida membership active.
* No confía solo en header.
* Bloquea tenant suspended/archived.

---

## TASK-080 — Reutilizar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos administrativos.
* Usa EffectivePermissionsService.
* Rechaza sin permiso.
* Tiene authorization tests.

---

## TASK-081 — Implementar `OwnResourcePolicyGuard` o policy layer

**Estado:** `[ ] Pending`

### Archivo sugerido

```text id="5yxbh1"
policies/own-resource-policy.guard.ts
```

### Criterios de aceptación

* Valida permisos `.own`.
* Invoca `OwnResourcePolicyService`.
* Rechaza recursos ajenos.
* Rechaza usuario sin Person.
* Tiene tests.

---

## TASK-082 — Crear decorators específicos del módulo

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="0in5ry"
@RequireResidentsPermission()
@RequireOwnResource()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Funcionan con guards/policies.
* Compatibles con OpenAPI.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-083 — Implementar `PropertyUnitsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="9cadls"
GET    /api/v1/tenant/property-units
POST   /api/v1/tenant/property-units
GET    /api/v1/tenant/property-units/:propertyUnitId
PATCH  /api/v1/tenant/property-units/:propertyUnitId
POST   /api/v1/tenant/property-units/:propertyUnitId/archive
```

### Criterios de aceptación

* Usa use cases.
* Usa guards.
* Usa DTOs.
* Tiene OpenAPI.
* Tiene API tests.

---

## TASK-084 — Implementar `PersonsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="zi1c49"
GET    /api/v1/tenant/persons
POST   /api/v1/tenant/persons
GET    /api/v1/tenant/persons/:personId
PATCH  /api/v1/tenant/persons/:personId
POST   /api/v1/tenant/persons/:personId/archive
POST   /api/v1/tenant/persons/:personId/link-user
```

### Criterios de aceptación

* Usa use cases.
* Enmascara identificación.
* Valida permisos.
* Audita cambios.
* Tiene tests.

---

## TASK-085 — Implementar `LegalEntitiesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="aad3ns"
GET    /api/v1/tenant/legal-entities
POST   /api/v1/tenant/legal-entities
GET    /api/v1/tenant/legal-entities/:legalEntityId
PATCH  /api/v1/tenant/legal-entities/:legalEntityId
POST   /api/v1/tenant/legal-entities/:legalEntityId/archive
```

### Criterios de aceptación

* No mezcla tenants.
* Valida identificación tributaria.
* Tiene API tests.

---

## TASK-086 — Implementar `PropertyOwnershipsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="qna9kt"
GET    /api/v1/tenant/property-ownerships
POST   /api/v1/tenant/property-ownerships
GET    /api/v1/tenant/property-ownerships/:ownershipId
PATCH  /api/v1/tenant/property-ownerships/:ownershipId
POST   /api/v1/tenant/property-ownerships/:ownershipId/end
```

### Criterios de aceptación

* Valida owner XOR.
* Valida tenant de unidad y propietario.
* Conserva historial.
* Audita.
* Tiene tests.

---

## TASK-087 — Implementar `ResidenciesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="x7hv3m"
GET    /api/v1/tenant/residencies
POST   /api/v1/tenant/residencies
GET    /api/v1/tenant/residencies/:residencyId
PATCH  /api/v1/tenant/residencies/:residencyId
POST   /api/v1/tenant/residencies/:residencyId/end
```

### Criterios de aceptación

* Valida persona y unidad.
* Conserva historial.
* Audita.
* Tiene tests.

---

## TASK-088 — Implementar `LeasesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="af3y1a"
GET    /api/v1/tenant/leases
POST   /api/v1/tenant/leases
GET    /api/v1/tenant/leases/:leaseId
PATCH  /api/v1/tenant/leases/:leaseId
POST   /api/v1/tenant/leases/:leaseId/end
```

### Criterios de aceptación

* Valida owner XOR.
* Valida arrendatario.
* Rechaza montos en MVP.
* Tiene tests.

---

## TASK-089 — Implementar `VehiclesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="cmxgqi"
GET    /api/v1/tenant/vehicles
POST   /api/v1/tenant/vehicles
GET    /api/v1/tenant/vehicles/:vehicleId
PATCH  /api/v1/tenant/vehicles/:vehicleId
POST   /api/v1/tenant/vehicles/:vehicleId/archive
```

### Criterios de aceptación

* Requiere persona o unidad.
* Valida placa.
* Valida tenant.
* Tiene tests.

---

## TASK-090 — Implementar `PetsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="0znhb0"
GET    /api/v1/tenant/pets
POST   /api/v1/tenant/pets
GET    /api/v1/tenant/pets/:petId
PATCH  /api/v1/tenant/pets/:petId
POST   /api/v1/tenant/pets/:petId/archive
```

### Criterios de aceptación

* Requiere persona o unidad.
* No acepta datos veterinarios sensibles.
* Valida tenant.
* Tiene tests.

---

## TASK-091 — Implementar `EmergencyContactsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="q9cgb4"
GET    /api/v1/tenant/emergency-contacts
POST   /api/v1/tenant/emergency-contacts
GET    /api/v1/tenant/emergency-contacts/:emergencyContactId
PATCH  /api/v1/tenant/emergency-contacts/:emergencyContactId
POST   /api/v1/tenant/emergency-contacts/:emergencyContactId/archive
```

### Criterios de aceptación

* Requiere persona.
* Valida teléfono.
* No acepta datos médicos.
* Tiene tests.

---

## TASK-092 — Implementar `OwnResourcesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="4c14ew"
GET /api/v1/me/person
GET /api/v1/me/property-units
GET /api/v1/me/residencies
GET /api/v1/me/vehicles
GET /api/v1/me/pets
GET /api/v1/me/emergency-contacts
```

### Criterios de aceptación

* Usa permisos `.own`.
* Valida vínculo UserProfile-Person.
* Devuelve solo recursos propios.
* No devuelve recursos ajenos.
* Tiene own access tests.

---

# 17. Fase 11 — Errores y respuestas estándar

## TASK-093 — Mapear errores de dominio a HTTP

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `PROPERTY_UNIT_NOT_FOUND` → 404.
* `PROPERTY_UNIT_CODE_ALREADY_EXISTS` → 409.
* `PERSON_NOT_FOUND` → 404.
* `PERSON_IDENTIFICATION_ALREADY_EXISTS` → 409.
* `USER_ALREADY_LINKED_TO_PERSON` → 409.
* `OWN_PERSON_NOT_LINKED` → 403.
* `CROSS_TENANT_REFERENCE` → 403/422.
* `OWNERSHIP_OWNER_XOR_VIOLATION` → 422.
* `OWNERSHIP_ALREADY_ENDED` → 409.
* `RESIDENCY_ALREADY_ENDED` → 409.
* `VEHICLE_PLATE_ALREADY_EXISTS` → 409.

---

## TASK-094 — Implementar error estándar

**Estado:** `[ ] Pending`

### Formato

```json id="lnvvtb"
{
  "error": {
    "code": "CROSS_TENANT_REFERENCE",
    "message": "The referenced resource does not belong to the active tenant.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

### Criterios de aceptación

* Todos los errores siguen formato.
* Incluyen `traceId`.
* No exponen stack trace en producción.
* No exponen datos personales completos.

---

## TASK-095 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Listados incluyen paginación.
* No retorna entidades internas directamente.
* No expone `tenantId` cuando no sea necesario.

---

# 18. Fase 12 — OpenAPI

## TASK-096 — Documentar Property Units API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Permisos documentados.
* Errores documentados.
* Ejemplos incluidos.

---

## TASK-097 — Documentar Persons API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Identificación enmascarada documentada.
* Link user documentado.
* Errores documentados.

---

## TASK-098 — Documentar Legal Entities API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Campos tributarios documentados.
* Errores documentados.

---

## TASK-099 — Documentar Ownerships, Residencies and Leases API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* XOR owner documentado.
* Reglas de fechas documentadas.
* Errores documentados.

---

## TASK-100 — Documentar Vehicles, Pets and Emergency Contacts API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Reglas de asociación persona/unidad documentadas.
* Datos sensibles prohibidos documentados.

---

## TASK-101 — Documentar Own Resources API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints `/api/v1/me/*` documentados.
* Permisos `.own` documentados.
* `x-own-resource-policy` incluido.
* Errores `OWN_PERSON_NOT_LINKED` documentados.

---

## TASK-102 — Agregar extensiones OpenAPI

**Estado:** `[ ] Pending`

### Ejemplos

```yaml id="ea4p76"
x-required-permission: propertyUnits.create
x-audit-event: propertyUnit.created
x-tenant-scope: tenant
```

```yaml id="39z3eq"
x-required-permission: propertyUnits.read.own
x-own-resource-policy: true
x-tenant-scope: tenant
```

### Criterios de aceptación

* Endpoints privados tienen `security`.
* Endpoints tienen permiso requerido.
* Endpoints auditables tienen evento.
* Endpoints `.own` tienen policy.

---

# 19. Fase 13 — Pruebas unitarias

## TASK-103 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text id="erjv2r"
property-unit-code.vo.spec.ts
property-unit-type.vo.spec.ts
identification-type.vo.spec.ts
identification-number.vo.spec.ts
ownership-percentage.vo.spec.ts
date-range.vo.spec.ts
vehicle-plate.vo.spec.ts
```

### Criterios de aceptación

* Cubren casos `UT-*`.
* Pasan en CI.

---

## TASK-104 — Implementar unit tests de estados

**Estado:** `[ ] Pending`

### Archivos

```text id="qeywvd"
person-status.vo.spec.ts
property-unit-status.vo.spec.ts
ownership-status.vo.spec.ts
residency-status.vo.spec.ts
lease-status.vo.spec.ts
vehicle-status.vo.spec.ts
pet-status.vo.spec.ts
emergency-contact-status.vo.spec.ts
```

### Criterios de aceptación

* Validan estados permitidos.
* Bloquean estados inválidos.
* Verifican comportamiento operativo.

---

## TASK-105 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Archivos

```text id="t1u7kr"
property-unit.entity.spec.ts
person.entity.spec.ts
legal-entity.entity.spec.ts
property-ownership.entity.spec.ts
residency.entity.spec.ts
lease.entity.spec.ts
vehicle.entity.spec.ts
pet.entity.spec.ts
emergency-contact.entity.spec.ts
```

### Criterios de aceptación

* Cubren creación.
* Cubren actualización.
* Cubren archivado.
* Cubren finalización.
* Cubren errores de dominio.

---

# 20. Fase 14 — Pruebas de aplicación

## TASK-106 — Implementar tests de `OwnResourcePolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usuario vinculado consulta su persona.
* Usuario sin Person recibe error.
* Propietario ve sus unidades.
* Residente ve unidad donde vive.
* Usuario no ve unidad ajena.
* No mezcla tenants.

---

## TASK-107 — Implementar tests de policies de unidad y persona

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Código único por tenant.
* Identificación única por tenant.
* Duplicados entre tenants permitidos.
* Archivado controlado.
* UserProfile link controlado.

---

## TASK-108 — Implementar tests de policies de ownership, residency y lease

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida tenant.
* Valida XOR.
* Valida fechas.
* Valida porcentaje.
* Rechaza relaciones cross-tenant.
* No sobrescribe historial.

---

## TASK-109 — Implementar tests de use cases principales

**Estado:** `[ ] Pending`

### Use cases

```text id="673c2p"
CreatePropertyUnitUseCase
CreatePersonUseCase
LinkUserToPersonUseCase
CreatePropertyOwnershipUseCase
EndPropertyOwnershipUseCase
CreateResidencyUseCase
EndResidencyUseCase
CreateLeaseUseCase
CreateVehicleUseCase
CreatePetUseCase
CreateEmergencyContactUseCase
```

### Criterios de aceptación

* Caminos felices.
* Caminos inválidos.
* Auditoría.
* Eventos.
* Validaciones tenant.

---

# 21. Fase 15 — Pruebas de integración

## TASK-110 — Implementar migration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tablas creadas.
* Enums creados.
* `tenant_id` obligatorio.
* Unique tenant+code.
* Constraints XOR.
* Date range constraints.
* `onDelete: Restrict`.
* Prisma Client genera.

---

## TASK-111 — Implementar repository integration tests

**Estado:** `[ ] Pending`

### Repositorios

```text id="u3h6lk"
PropertyUnitRepository
PersonRepository
LegalEntityRepository
PropertyOwnershipRepository
ResidencyRepository
LeaseRepository
VehicleRepository
PetRepository
EmergencyContactRepository
```

### Criterios de aceptación

* CRUD controlado.
* Queries por tenant.
* Búsquedas críticas.
* Constraints.
* Errores mapeados.

---

## TASK-112 — Implementar seed integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Seeds idempotentes.
* Seeds crean datos demo.
* Seeds no contienen datos reales.
* Seeds no rompen constraints.

---

# 22. Fase 16 — Pruebas API

## TASK-113 — Implementar API tests de Property Units

**Estado:** `[ ] Pending`

### Archivo

```text id="gsl5yp"
property-units.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Crear.
* Consultar.
* Actualizar.
* Archivar.
* Duplicado.
* Sin permiso.
* Cross-tenant.

---

## TASK-114 — Implementar API tests de Persons

**Estado:** `[ ] Pending`

### Archivo

```text id="jh4zlb"
persons.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Crear.
* Consultar.
* Actualizar.
* Archivar.
* Vincular usuario.
* Enmascarar identificación.
* No mezclar tenants.

---

## TASK-115 — Implementar API tests de Legal Entities

**Estado:** `[ ] Pending`

### Archivo

```text id="jo6bea"
legal-entities.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Crear.
* Consultar.
* Actualizar.
* Archivar.
* Validar duplicados.

---

## TASK-116 — Implementar API tests de Property Ownerships

**Estado:** `[ ] Pending`

### Archivo

```text id="n26kap"
property-ownerships.api.spec.ts
```

### Criterios de aceptación

* Crear ownership persona.
* Crear ownership entidad.
* Rechazar XOR inválido.
* Rechazar cross-tenant.
* Finalizar.
* Conservar historial.

---

## TASK-117 — Implementar API tests de Residencies

**Estado:** `[ ] Pending`

### Archivo

```text id="zbf31y"
residencies.api.spec.ts
```

### Criterios de aceptación

* Crear residencia.
* Listar.
* Consultar.
* Finalizar.
* Rechazar cross-tenant.
* Conservar historial.

---

## TASK-118 — Implementar API tests de Leases

**Estado:** `[ ] Pending`

### Archivo

```text id="bfgsy5"
leases.api.spec.ts
```

### Criterios de aceptación

* Crear lease.
* Rechazar owner XOR inválido.
* Rechazar montos monetarios.
* Finalizar lease.
* Rechazar cross-tenant.

---

## TASK-119 — Implementar API tests de Vehicles, Pets y Emergency Contacts

**Estado:** `[ ] Pending`

### Archivos

```text id="n4l26j"
vehicles.api.spec.ts
pets.api.spec.ts
emergency-contacts.api.spec.ts
```

### Criterios de aceptación

* Crear.
* Listar.
* Consultar.
* Actualizar.
* Archivar.
* Validar persona/unidad.
* Rechazar cross-tenant.

---

## TASK-120 — Implementar API tests de Own Resources

**Estado:** `[ ] Pending`

### Archivo

```text id="iu52sp"
own-resources.api.spec.ts
```

### Criterios de aceptación

* `/me/person`.
* `/me/property-units`.
* `/me/residencies`.
* `/me/vehicles`.
* `/me/pets`.
* `/me/emergency-contacts`.
* Rechaza sin Person.
* No devuelve recursos ajenos.
* No mezcla tenants.

---

# 23. Fase 17 — Authorization, own access y multitenancy

## TASK-121 — Implementar authorization tests administrativos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token → 401.
* Sin membership → 403.
* Sin permiso → 403.
* Tenant suspendido → 403.
* Disabled user → 403.
* TenantAdmin autorizado → 200/201.

---

## TASK-122 — Implementar own access tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usuario con Person vinculada accede a propios.
* Usuario sin Person no accede.
* Propietario ve su unidad.
* Residente ve su unidad.
* Usuario no ve unidad ajena.
* Usuario no ve vehículo/mascota/contacto ajeno.

---

## TASK-123 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant A no lista recursos B.
* Tenant A no consulta recurso B por ID.
* Tenant A no crea ownership con persona/unidad B.
* Tenant A no crea residency con persona/unidad B.
* Tenant A no crea vehicle/pet mezclando tenants.
* Own resources no mezclan tenants.

---

# 24. Fase 18 — Seguridad y privacidad

## TASK-124 — Implementar security tests de payload

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Strings largos rechazados.
* IDs malformados rechazados.
* Scripts tratados según política.
* SQL-like search seguro.
* `tenantId` en body rechazado o ignorado documentadamente.

---

## TASK-125 — Implementar privacy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Identificación enmascarada.
* Logs no contienen identificación completa.
* Logs no contienen payload completo.
* Usuario no ve datos personales ajenos.
* Seeds no usan datos reales.

---

## TASK-126 — Implementar history safety tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* End ownership no elimina registro.
* End residency no elimina registro.
* Archive unit no elimina ownerships.
* Archive person no elimina residencies.
* No existen DELETE físicos ordinarios.

---

## TASK-127 — Implementar logging security tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No Authorization header.
* No access token.
* No identificación completa.
* No teléfonos completos innecesarios.
* No payload completo.
* No stack trace en producción.

---

# 25. Fase 19 — Auditoría, eventos y observabilidad

## TASK-128 — Validar auditoría del módulo

**Estado:** `[ ] Pending`

### Eventos auditables

```text id="6g220o"
person.created
person.updated
person.archived
person.userLinked
legalEntity.created
legalEntity.updated
legalEntity.archived
propertyUnit.created
propertyUnit.updated
propertyUnit.archived
propertyOwnership.created
propertyOwnership.updated
propertyOwnership.ended
residency.created
residency.updated
residency.ended
lease.created
lease.updated
lease.ended
vehicle.created
vehicle.updated
vehicle.archived
pet.created
pet.updated
pet.archived
emergencyContact.created
emergencyContact.updated
emergencyContact.archived
```

### Criterios de aceptación

* Cada operación crítica genera auditoría.
* Auditoría incluye `tenantId`, `actorUserId`, `traceId`.
* No contiene datos personales completos innecesarios.

---

## TASK-129 — Validar eventos de dominio

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Eventos principales emitidos.
* Incluyen `tenantId`.
* Incluyen `traceId`.
* No incluyen identificación completa.
* No incluyen payload personal completo.

---

## TASK-130 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs incluyen `traceId`.
* Logs incluyen `tenantId`.
* Logs incluyen `actorUserId`.
* Logs incluyen errorCode si aplica.
* Logs están sanitizados.

---

## TASK-131 — Agregar métricas básicas

**Estado:** `[ ] Pending`

### Métricas

```text id="cqbhkj"
property_units_created_total
persons_created_total
user_person_links_created_total
property_ownerships_created_total
property_ownerships_ended_total
residencies_created_total
residencies_ended_total
vehicles_registered_total
pets_registered_total
own_resource_access_denied_total
cross_tenant_reference_denied_total
```

### Criterios de aceptación

* Métricas incrementan.
* No usan datos personales como labels.
* No usan labels de alta cardinalidad innecesaria.

---

# 26. Fase 20 — CI/CD y smoke tests

## TASK-132 — Agregar comandos de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="ygqgpd"
npm run test:residents-properties
npm run test:residents-properties:unit
npm run test:residents-properties:application
npm run test:residents-properties:integration
npm run test:residents-properties:api
npm run test:residents-properties:authorization
npm run test:residents-properties:multitenancy
npm run test:residents-properties:security
```

### Criterios de aceptación

* Scripts disponibles o equivalentes.
* Corren localmente.
* Documentados en package scripts.

---

## TASK-133 — Agregar validaciones al pipeline CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="s1tyu3"
lint
typecheck
unit tests
application tests
integration tests críticos
API tests críticos
authorization tests
own access tests
multitenancy tests
security/privacy tests críticos
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay acceso cross-tenant.
* Pipeline falla si `.own` está mal implementado.
* Pipeline falla si OpenAPI no coincide.

---

## TASK-134 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="3ie0l2"
GET /api/v1/health
GET /api/v1/tenant/property-units sin token
GET /api/v1/me/person sin token
GET /api/v1/tenant/property-units con usuario autorizado
GET /api/v1/tenant/persons con usuario sin permiso
```

### Criterios de aceptación

* Smoke tests pasan en dev/staging.
* No ejecutan operaciones destructivas.
* Errores incluyen traceId.

---

# 27. Fase 21 — Revisión SDD

## TASK-135 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas asociadas.
* Cada endpoint tiene API tests.
* Cada endpoint privado tiene authorization tests.
* Cada endpoint `.own` tiene own access tests.
* Cada operación tenant-scoped tiene multitenancy tests.
* Cada cambio sensible tiene auditoría.

---

## TASK-136 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="8m652q"
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* No contradice multitenancy.
* No elimina físicamente historial.
* No omite autorización.
* No omite pruebas.
* No omite auditoría.
* No expone datos personales.

---

## TASK-137 — Actualizar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Contrato coincide con `api-contract.md`.
* Endpoints privados tienen security.
* Permisos documentados.
* Errores documentados.
* Endpoints `.own` documentados.
* Campos sensibles controlados.

---

## TASK-138 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos esperados

```bash id="il4p1f"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run build
```

### Criterios de aceptación

* Todo pasa.
* No hay tests omitidos sin justificación.
* No hay warnings críticos.
* No hay datos reales en fixtures.

---

## TASK-139 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="809vi1"
- PR link o commit SHA.
- Migración aplicada.
- Prisma Client generado.
- Seeds ejecutados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 28. Fase 22 — Pendientes diferidos controlados

## TASK-140 — Diferir validación oficial de cédula/RUC

**Estado:** `[-] Deferred`

### Razón

Requiere integración externa o reglas oficiales adicionales.

### Implementación futura

```text id="709sdo"
Identity verification / Ecuador validation spec
```

---

## TASK-141 — Diferir documentos legales adjuntos

**Estado:** `[-] Deferred`

### Razón

Requiere módulo de archivos, storage privado, permisos y retención documental.

### Implementación futura

```text id="mrj7mf"
docs/specs/00X-documents-files/
```

---

## TASK-142 — Diferir firma electrónica

**Estado:** `[-] Deferred`

### Razón

Requiere proveedor, marco legal, trazabilidad, integridad y no repudio.

### Implementación futura

```text id="kn5b01"
docs/specs/00X-electronic-signature/
```

---

## TASK-143 — Diferir control de visitas

**Estado:** `[-] Deferred`

### Razón

Requiere diseño específico de visitantes, accesos, guardias y auditoría.

### Implementación futura

```text id="q391e8"
docs/specs/00X-visits-access-control/
```

---

## TASK-144 — Diferir parqueaderos avanzados

**Estado:** `[-] Deferred`

### Razón

Puede requerir reglas adicionales de asignación, cupos, visitantes y arriendo.

### Implementación futura

```text id="2n81tu"
Parking and access management spec
```

---

## TASK-145 — Diferir aprobación de cambios solicitados por residentes

**Estado:** `[-] Deferred`

### Razón

Requiere workflow de solicitudes, revisión administrativa y notificaciones.

### Implementación futura

```text id="iv02sa"
Resident self-service change requests spec
```

---

## TASK-146 — Diferir datos de menores de edad

**Estado:** `[-] Deferred`

### Razón

Implica tratamiento de datos personales con mayores controles de privacidad.

### Implementación futura

```text id="j8sqec"
Privacy-sensitive household members spec
```

---

## TASK-147 — Diferir módulos financieros

**Estado:** `[-] Deferred`

### Razón

Alícuotas, cargos, estados de cuenta y pagos se implementarán después de completar el padrón residencial.

### Implementación futura

```text id="xkiukw"
docs/specs/004-dues-fees/
docs/specs/005-payments/
docs/specs/006-account-statements/
```

---

# 29. Definition of Done del módulo

El módulo `003-residents-properties` estará terminado cuando:

```text id="1ktz7j"
[ ] Documentación spec completa.
[ ] Modelo Prisma implementado.
[ ] Migración creada y validada.
[ ] SQL constraints revisadas.
[ ] Seeds demo creados.
[ ] Módulo NestJS creado.
[ ] DTOs implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Repositorios implementados.
[ ] Servicios/policies implementados.
[ ] Use cases implementados.
[ ] Controladores implementados.
[ ] Endpoints administrativos protegidos.
[ ] Endpoints .own protegidos.
[ ] UserProfile → Person implementado.
[ ] OwnResourcePolicyService implementado.
[ ] No hay acceso cross-tenant.
[ ] No se elimina físicamente historial.
[ ] Auditoría implementada.
[ ] Eventos implementados.
[ ] Logs sanitizados.
[ ] Métricas básicas implementadas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Application tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own access tests pasan.
[ ] Multitenancy tests pasan.
[ ] Security/privacy tests pasan.
[ ] CI pasa.
[ ] Smoke tests pasan.
[ ] Pendientes diferidos documentados.
```

---

## 30. Orden recomendado de ejecución

```text id="f6j9a5"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-011      Estructura base
3. TASK-012 a TASK-019      Value objects
4. TASK-020 a TASK-030      Entidades, errores y eventos
5. TASK-031 a TASK-040      DTOs
6. TASK-041 a TASK-055      Prisma, migración y seeds
7. TASK-056 a TASK-060      Puertos y adaptadores
8. TASK-061 a TASK-067      Servicios y policies
9. TASK-068 a TASK-077      Use cases
10. TASK-078 a TASK-082     Guards, policies y decorators
11. TASK-083 a TASK-092     Controladores
12. TASK-093 a TASK-095     Errores y respuestas
13. TASK-096 a TASK-102     OpenAPI
14. TASK-103 a TASK-127     Pruebas
15. TASK-128 a TASK-131     Auditoría, eventos y observabilidad
16. TASK-132 a TASK-134     CI/CD y smoke tests
17. TASK-135 a TASK-139     Revisión SDD
```

---

## 31. Riesgos de ejecución

| Riesgo                                       | Impacto | Mitigación                                  |
| -------------------------------------------- | ------- | ------------------------------------------- |
| Acceso cross-tenant                          | Crítico | TenantGuard + queries por tenant + MT tests |
| `.own` mal implementado                      | Crítico | OwnResourcePolicyService + own tests        |
| Unidad duplicada                             | Alto    | unique tenant+code                          |
| Persona duplicada                            | Alto    | unique tenant+identification                |
| Historial sobrescrito                        | Alto    | status + startDate/endDate                  |
| Eliminación física accidental                | Alto    | no DELETE + onDelete Restrict               |
| Datos personales en logs                     | Alto    | sanitización + privacy tests                |
| Relación persona/unidad de tenants distintos | Crítico | validation + CROSS_TENANT_REFERENCE         |
| Seeds con datos reales                       | Alto    | revisión + tests                            |
| Preparación financiera insuficiente          | Alto    | integridad de PropertyUnit/Ownership        |
| OpenAPI desactualizado                       | Medio   | openapi validation                          |

---

## 32. Checklist para revisión de PR

Antes de aprobar el PR de `003-residents-properties`:

```text id="6n7xbd"
[ ] La implementación sigue spec.md.
[ ] No se implementó funcionalidad fuera de alcance.
[ ] No se implementaron pagos, alícuotas ni estados de cuenta.
[ ] Prisma schema coincide con data-model.md.
[ ] Migración revisada.
[ ] SQL constraints revisadas.
[ ] No hay cascade delete peligroso.
[ ] tenantId es obligatorio en todas las tablas.
[ ] Endpoints coinciden con api-contract.md.
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints tenant tienen TenantGuard.
[ ] Endpoints administrativos tienen TenantPermissionGuard.
[ ] Endpoints .own validan OwnResourcePolicyService.
[ ] Personas no se mezclan entre tenants.
[ ] Unidades no se mezclan entre tenants.
[ ] Ownership no mezcla tenants.
[ ] Residency no mezcla tenants.
[ ] Vehicle/Pet no mezcla tenants.
[ ] UserProfile → Person funciona.
[ ] Usuario sin Person no accede a .own.
[ ] Usuario no ve recursos ajenos.
[ ] Identificación se enmascara cuando corresponde.
[ ] Logs no contienen datos personales completos.
[ ] No hay DELETE físico ordinario.
[ ] Cambios sensibles generan auditoría.
[ ] Eventos esperados se emiten.
[ ] OpenAPI actualizado.
[ ] Tests pasan.
[ ] CI pasa.
[ ] No hay secrets.
[ ] No hay datos reales en seeds.
[ ] Pendientes diferidos documentados.
```

---

## 33. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá implementado el padrón residencial base:

```text id="9qg9no"
- personas;
- entidades jurídicas;
- unidades habitacionales;
- propietarios;
- residentes;
- arriendos básicos;
- vehículos;
- mascotas;
- contactos de emergencia;
- vínculo UserProfile → Person;
- acceso .own;
- historial de propiedad;
- historial de residencia;
- auditoría;
- eventos;
- pruebas de autorización;
- pruebas multitenant;
- pruebas de privacidad.
```

Este módulo habilita el inicio de:

```text id="gxwpvk"
docs/specs/004-dues-fees/
```

pero antes debe completarse:

```text id="jnjkgf"
docs/specs/003-residents-properties/security-notes.md
```
