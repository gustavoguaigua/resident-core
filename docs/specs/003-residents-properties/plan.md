# Plan — Spec 003 Residents, Owners, Tenants and Property Units

## 1. Información del documento

| Campo          | Valor                                             |
| -------------- | ------------------------------------------------- |
| Proyecto       | RESIDENT Core                                     |
| Spec ID        | 003                                               |
| Módulo         | Residents and Properties                          |
| Documento      | Implementation Plan                               |
| Ruta           | `docs/specs/003-residents-properties/plan.md`     |
| Versión        | 0.1                                               |
| Estado         | Borrador inicial                                  |
| Fecha          | 2026-07-13                                        |
| Documento base | `docs/specs/003-residents-properties/spec.md`     |
| Depende de     | `001-tenants`, `002-users-roles`                  |
| Arquitectura   | Monolito modular NestJS                           |
| Base de datos  | PostgreSQL + Prisma                               |
| Autorización   | Tenant-aware RBAC + permissions + `.own` policies |
| Prioridad      | Alta                                              |

---

## 2. Propósito

Este documento transforma la especificación funcional `003-residents-properties/spec.md` en un plan técnico de implementación.

El objetivo es definir cómo implementar el módulo responsable de:

* personas naturales;
* entidades jurídicas;
* unidades habitacionales;
* propietarios;
* residentes;
* arrendatarios;
* ocupantes;
* relaciones de propiedad;
* relaciones de residencia;
* contratos o relaciones de arriendo básicas;
* vehículos;
* mascotas;
* contactos de emergencia;
* vínculo entre `UserProfile` y `Person`;
* permisos administrativos;
* permisos `.own`;
* auditoría;
* eventos;
* pruebas.

Este módulo es la base operativa para los módulos financieros posteriores, porque alícuotas, cargos, pagos y estados de cuenta se relacionarán principalmente con `PropertyUnit`, propietarios y residentes.

---

## 3. Resumen de implementación

El módulo `003-residents-properties` se implementará como módulo interno de NestJS dentro de RESIDENT Core.

Implementará:

```text id="uzc68o"
Person
LegalEntity
PropertyUnit
PropertyOwnership
Residency
Lease
Vehicle
Pet
EmergencyContact
```

También implementará la relación funcional:

```text id="3damsx"
UserProfile → Person → PropertyUnit
```

Esto permitirá que los permisos `.own` funcionen correctamente.

Ejemplo:

```text id="abq2ey"
UserProfile Gustavo
    ↓
Person Gustavo
    ↓
PropertyOwnership / Residency
    ↓
PropertyUnit Casa 01
```

---

## 4. Decisiones técnicas aplicables

Este módulo debe respetar:

```text id="h8lhc1"
ADR-001 — Architecture Style
ADR-002 — Backend Framework
ADR-003 — Database Strategy
ADR-004 — Multitenancy Strategy
ADR-007 — Authorization Strategy
ADR-010 — Observability Strategy
ADR-011 — Testing Strategy
ADR-012 — CI/CD Strategy
```

Reglas clave:

* Todo registro operativo lleva `tenantId`.
* No se permite acceso cross-tenant.
* No se elimina físicamente historial de propiedad o residencia.
* Los endpoints administrativos requieren permisos tenant-scoped.
* Los endpoints `.own` requieren vínculo `UserProfile` ↔ `Person`.
* Los permisos `.own` no sustituyen validación de recurso.
* Una unidad de Tenant A no puede relacionarse con una persona de Tenant B.
* Los cambios sensibles deben auditarse.
* Los datos personales deben minimizarse.
* Los módulos financieros usarán este módulo como fuente de unidades, propietarios y residentes.

---

## 5. Alcance técnico

### 5.1. Incluido

La implementación inicial debe cubrir:

* modelos Prisma;
* migraciones;
* entidades de dominio;
* value objects;
* DTOs;
* repositorios;
* servicios de aplicación;
* casos de uso;
* controladores REST;
* policies de acceso propio;
* guards o policy guards;
* auditoría;
* eventos;
* OpenAPI;
* pruebas unitarias;
* pruebas de integración;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas de seguridad.

---

### 5.2. Diferido

No se implementará todavía:

* documentos legales adjuntos;
* firma electrónica;
* validación oficial de cédula o RUC;
* integración con Registro Civil;
* control de visitas;
* parqueaderos avanzados;
* datos biométricos;
* geolocalización precisa;
* gestión documental completa de contratos;
* aprobación de cambios solicitados por residentes;
* flujos financieros;
* generación de alícuotas;
* estados de cuenta;
* pagos;
* multas;
* votaciones o asambleas.

---

## 6. Estructura de carpetas recomendada

```text id="sgjmdo"
apps/api/src/modules/residents-properties/
├── residents-properties.module.ts
│
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
│
├── application/
│   ├── use-cases/
│   │   ├── create-property-unit.use-case.ts
│   │   ├── update-property-unit.use-case.ts
│   │   ├── archive-property-unit.use-case.ts
│   │   ├── get-property-unit.use-case.ts
│   │   ├── list-property-units.use-case.ts
│   │   ├── create-person.use-case.ts
│   │   ├── update-person.use-case.ts
│   │   ├── archive-person.use-case.ts
│   │   ├── link-user-to-person.use-case.ts
│   │   ├── create-legal-entity.use-case.ts
│   │   ├── update-legal-entity.use-case.ts
│   │   ├── create-property-ownership.use-case.ts
│   │   ├── update-property-ownership.use-case.ts
│   │   ├── end-property-ownership.use-case.ts
│   │   ├── create-residency.use-case.ts
│   │   ├── update-residency.use-case.ts
│   │   ├── end-residency.use-case.ts
│   │   ├── create-lease.use-case.ts
│   │   ├── update-lease.use-case.ts
│   │   ├── end-lease.use-case.ts
│   │   ├── create-vehicle.use-case.ts
│   │   ├── update-vehicle.use-case.ts
│   │   ├── archive-vehicle.use-case.ts
│   │   ├── create-pet.use-case.ts
│   │   ├── update-pet.use-case.ts
│   │   ├── archive-pet.use-case.ts
│   │   ├── create-emergency-contact.use-case.ts
│   │   ├── update-emergency-contact.use-case.ts
│   │   ├── archive-emergency-contact.use-case.ts
│   │   ├── get-my-person.use-case.ts
│   │   ├── get-my-property-units.use-case.ts
│   │   ├── get-my-residencies.use-case.ts
│   │   ├── get-my-vehicles.use-case.ts
│   │   ├── get-my-pets.use-case.ts
│   │   └── get-my-emergency-contacts.use-case.ts
│   │
│   ├── services/
│   │   ├── own-resource-policy.service.ts
│   │   ├── property-unit-policy.service.ts
│   │   ├── person-policy.service.ts
│   │   ├── ownership-policy.service.ts
│   │   ├── residency-policy.service.ts
│   │   ├── lease-policy.service.ts
│   │   └── resident-profile.service.ts
│   │
│   └── ports/
│       ├── property-unit.repository.ts
│       ├── person.repository.ts
│       ├── legal-entity.repository.ts
│       ├── property-ownership.repository.ts
│       ├── residency.repository.ts
│       ├── lease.repository.ts
│       ├── vehicle.repository.ts
│       ├── pet.repository.ts
│       ├── emergency-contact.repository.ts
│       ├── residents-properties-audit.port.ts
│       └── residents-properties-events.port.ts
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── audit/
│   └── events/
│
├── policies/
│   ├── can-read-own-person.policy.ts
│   ├── can-read-own-property-unit.policy.ts
│   ├── can-update-own-vehicle.policy.ts
│   └── can-update-own-pet.policy.ts
│
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="q0f6os"
docs/specs/003-residents-properties/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="rguzil"
plan.md
```

---

## 8. Diseño de dominio

## 8.1. Person

Representa una persona natural dentro de un tenant.

Campos conceptuales:

```text id="zql8zt"
id
tenantId
userProfileId nullable
firstName
lastName
displayName
identificationType
identificationNumber
email
phone
whatsapp
status
createdAt
updatedAt
archivedAt
```

Responsabilidades:

* mantener datos básicos de persona;
* vincularse opcionalmente con `UserProfile`;
* servir como base para propietario, residente, arrendatario u ocupante;
* permitir acceso `.own`.

Reglas:

* pertenece a un tenant;
* identificación única por tenant si existe;
* puede existir sin usuario;
* no debe guardar datos sensibles innecesarios;
* no se elimina físicamente si tiene relaciones.

---

## 8.2. LegalEntity

Representa una entidad jurídica dentro de un tenant.

Campos conceptuales:

```text id="0w0n5k"
id
tenantId
name
taxIdentificationType
taxIdentificationNumber
email
phone
address
status
createdAt
updatedAt
```

Responsabilidades:

* representar empresas, fideicomisos u organizaciones propietarias;
* actuar como propietaria de unidades si aplica.

Reglas:

* pertenece a un tenant;
* identificación tributaria única por tenant si existe;
* no se elimina físicamente si tiene historial.

---

## 8.3. PropertyUnit

Representa una unidad habitacional.

Campos conceptuales:

```text id="rrv7o9"
id
tenantId
code
name
type
block
floor
addressReference
areaM2
status
createdAt
updatedAt
archivedAt
```

Responsabilidades:

* representar casas, departamentos, lotes, parqueaderos u otras unidades;
* servir como base para alícuotas, cargos y estados de cuenta futuros;
* relacionarse con propietarios, residentes, vehículos y mascotas.

Reglas:

* código único por tenant;
* no se elimina físicamente si tiene historial;
* puede estar activa, inactiva, bloqueada, en mantenimiento o archivada.

---

## 8.4. PropertyOwnership

Representa relación de propiedad entre persona o entidad jurídica y unidad.

Campos conceptuales:

```text id="juhr9u"
id
tenantId
propertyUnitId
personId nullable
legalEntityId nullable
ownershipType
ownershipPercentage
isPrimary
status
startDate
endDate
createdAt
updatedAt
```

Responsabilidades:

* mantener propietarios actuales;
* conservar historial de propietarios;
* soportar copropiedad;
* preparar procesos financieros futuros.

Reglas:

* pertenece a un tenant;
* unidad debe pertenecer al mismo tenant;
* propietario persona o entidad jurídica debe pertenecer al mismo tenant;
* debe existir exactamente un tipo de propietario: persona o entidad;
* no se sobrescribe historial;
* se finaliza mediante `endDate` y status `ended`.

---

## 8.5. Residency

Representa relación de residencia u ocupación entre persona y unidad.

Campos conceptuales:

```text id="5d0zrg"
id
tenantId
propertyUnitId
personId
residencyType
isPrimaryResident
status
startDate
endDate
createdAt
updatedAt
```

Responsabilidades:

* mantener residentes actuales;
* conservar historial de residencia;
* soportar ocupantes, arrendatarios y residentes propietarios;
* habilitar acceso `.own`.

Reglas:

* persona y unidad deben pertenecer al mismo tenant;
* una unidad puede tener varios residentes;
* puede existir un residente principal;
* no se sobrescribe historial;
* se finaliza mediante `endDate` y status `ended`.

---

## 8.6. Lease

Representa una relación básica de arriendo.

Campos conceptuales:

```text id="8en6uq"
id
tenantId
propertyUnitId
ownerPersonId nullable
ownerLegalEntityId nullable
tenantPersonId
status
startDate
endDate
createdAt
updatedAt
```

Responsabilidades:

* registrar relación entre propietario y arrendatario;
* preparar reglas futuras de arriendo y responsabilidad;
* vincular residencia arrendataria.

Reglas:

* unidad debe pertenecer al tenant;
* arrendatario debe pertenecer al tenant;
* propietario persona o entidad debe pertenecer al tenant;
* no se gestiona contrato documental avanzado en MVP.

---

## 8.7. Vehicle

Representa vehículo asociado a persona o unidad.

Campos conceptuales:

```text id="1eev6h"
id
tenantId
propertyUnitId nullable
personId nullable
plate
type
brand
model
color
status
createdAt
updatedAt
```

Reglas:

* pertenece a un tenant;
* debe asociarse al menos a persona o unidad;
* placa puede ser única por tenant si existe;
* no registrar datos innecesarios.

---

## 8.8. Pet

Representa mascota asociada a persona o unidad.

Campos conceptuales:

```text id="1fvnyo"
id
tenantId
propertyUnitId nullable
personId nullable
name
species
breed
color
status
createdAt
updatedAt
```

Reglas:

* pertenece a un tenant;
* debe asociarse al menos a persona o unidad;
* no registrar información veterinaria sensible en MVP.

---

## 8.9. EmergencyContact

Representa contacto de emergencia de una persona.

Campos conceptuales:

```text id="0bwdh5"
id
tenantId
personId
name
relationship
phone
email
status
createdAt
updatedAt
```

Reglas:

* pertenece a un tenant;
* se asocia a una persona del mismo tenant;
* datos visibles solo para usuarios autorizados.

---

## 9. Value Objects

## 9.1. PropertyUnitCode

Reglas:

* requerido;
* único por tenant;
* trim;
* longitud máxima;
* no vacío.

Ejemplos:

```text id="bvxaue"
Casa 01
A-301
Torre B - Departamento 502
```

---

## 9.2. PropertyUnitType

Valores sugeridos:

```text id="vz4wm9"
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

---

## 9.3. IdentificationType

Valores sugeridos para Ecuador y uso general:

```text id="vnk9hm"
cedula
ruc
passport
other
none
```

MVP:

* validar solo formato básico;
* no validar oficialmente contra fuente externa.

---

## 9.4. IdentificationNumber

Reglas:

* opcional;
* trim;
* longitud máxima;
* único por tenant si existe;
* no registrar si no es necesario.

---

## 9.5. OwnershipPercentage

Reglas:

* decimal;
* mayor que 0;
* menor o igual a 100;
* suma de propietarios activos no debe exceder 100 si la regla se activa estrictamente.

---

## 9.6. DateRange

Usado para:

* propiedad;
* residencia;
* arriendo.

Reglas:

```text id="o4fybh"
startDate requerido
endDate opcional
endDate >= startDate
```

---

## 9.7. VehiclePlate

Reglas:

* opcional según tipo de vehículo;
* trim;
* uppercase;
* validación básica;
* única por tenant si existe.

---

## 9.8. PersonStatus

Valores:

```text id="09uxng"
active
inactive
archived
```

---

## 9.9. PropertyUnitStatus

Valores:

```text id="h44cgw"
active
inactive
underMaintenance
blocked
archived
```

---

## 9.10. OwnershipStatus

Valores:

```text id="napktd"
active
ended
disputed
archived
```

---

## 9.11. ResidencyStatus

Valores:

```text id="3gxn6a"
active
ended
suspended
archived
```

---

## 9.12. LeaseStatus

Valores:

```text id="70dttg"
draft
active
ended
cancelled
archived
```

---

## 10. Modelo Prisma preliminar

El modelo final se documentará en `data-model.md`.

Tablas esperadas:

```text id="ujfwjh"
persons
legal_entities
property_units
property_ownerships
residencies
leases
vehicles
pets
emergency_contacts
```

Relaciones externas:

```text id="5nhj42"
tenants.id
user_profiles.id
```

Reglas de persistencia:

* `tenantId` obligatorio en todas las tablas;
* `onDelete: Restrict`;
* índices por `tenantId`;
* unique por tenant donde aplique;
* fechas de cierre para relaciones históricas;
* no cascade delete peligroso.

---

## 11. Constraints principales

### 11.1. Personas

```text id="u523we"
unique(tenant_id, identification_type, identification_number) where identification_number is not null
```

Si Prisma no soporta índice parcial directamente, validar en aplicación y/o migración SQL manual.

---

### 11.2. Unidades

```text id="i8jupq"
unique(tenant_id, code)
```

---

### 11.3. Entidades jurídicas

```text id="1ar2bb"
unique(tenant_id, tax_identification_type, tax_identification_number) where tax_identification_number is not null
```

---

### 11.4. Vehículos

```text id="iyurn0"
unique(tenant_id, plate) where plate is not null
```

---

### 11.5. Relaciones

Cada relación debe validar:

```text id="gw6wzp"
propertyUnit.tenantId == tenantId
person.tenantId == tenantId
legalEntity.tenantId == tenantId
```

Esta validación se hará en use cases y repositorios.

---

## 12. Repositorios

## 12.1. PropertyUnitRepository

Contrato sugerido:

```text id="5afmqq"
create(input)
findById(tenantId, propertyUnitId)
findByCode(tenantId, code)
list(tenantId, query)
update(tenantId, propertyUnitId, input)
archive(tenantId, propertyUnitId, actorId)
existsByCode(tenantId, code)
```

---

## 12.2. PersonRepository

Contrato sugerido:

```text id="u9rq29"
create(input)
findById(tenantId, personId)
findByUserProfileId(tenantId, userProfileId)
findByIdentification(tenantId, identificationType, identificationNumber)
list(tenantId, query)
update(tenantId, personId, input)
archive(tenantId, personId, actorId)
linkUserProfile(tenantId, personId, userProfileId)
```

---

## 12.3. LegalEntityRepository

Contrato sugerido:

```text id="rlx4wo"
create(input)
findById(tenantId, legalEntityId)
findByTaxIdentification(tenantId, type, number)
list(tenantId, query)
update(tenantId, legalEntityId, input)
archive(tenantId, legalEntityId, actorId)
```

---

## 12.4. PropertyOwnershipRepository

Contrato sugerido:

```text id="p6jqob"
create(input)
findById(tenantId, ownershipId)
listByUnit(tenantId, propertyUnitId)
listByPerson(tenantId, personId)
listByLegalEntity(tenantId, legalEntityId)
list(tenantId, query)
update(tenantId, ownershipId, input)
end(tenantId, ownershipId, endDate, actorId)
getActiveOwnersByUnit(tenantId, propertyUnitId)
```

---

## 12.5. ResidencyRepository

Contrato sugerido:

```text id="93sqet"
create(input)
findById(tenantId, residencyId)
listByUnit(tenantId, propertyUnitId)
listByPerson(tenantId, personId)
list(tenantId, query)
update(tenantId, residencyId, input)
end(tenantId, residencyId, endDate, actorId)
getActiveResidentsByUnit(tenantId, propertyUnitId)
```

---

## 12.6. LeaseRepository

Contrato sugerido:

```text id="ntqfy8"
create(input)
findById(tenantId, leaseId)
listByUnit(tenantId, propertyUnitId)
listByTenantPerson(tenantId, personId)
list(tenantId, query)
update(tenantId, leaseId, input)
end(tenantId, leaseId, endDate, actorId)
```

---

## 12.7. VehicleRepository

Contrato sugerido:

```text id="ugyzkl"
create(input)
findById(tenantId, vehicleId)
findByPlate(tenantId, plate)
list(tenantId, query)
listByPerson(tenantId, personId)
listByUnit(tenantId, propertyUnitId)
update(tenantId, vehicleId, input)
archive(tenantId, vehicleId, actorId)
```

---

## 12.8. PetRepository

Contrato sugerido:

```text id="3se6cy"
create(input)
findById(tenantId, petId)
list(tenantId, query)
listByPerson(tenantId, personId)
listByUnit(tenantId, propertyUnitId)
update(tenantId, petId, input)
archive(tenantId, petId, actorId)
```

---

## 12.9. EmergencyContactRepository

Contrato sugerido:

```text id="74d9rh"
create(input)
findById(tenantId, emergencyContactId)
listByPerson(tenantId, personId)
list(tenantId, query)
update(tenantId, emergencyContactId, input)
archive(tenantId, emergencyContactId, actorId)
```

---

## 13. Servicios de aplicación

## 13.1. OwnResourcePolicyService

Responsabilidad:

* validar si el usuario autenticado puede acceder a un recurso propio;
* resolver `UserProfile → Person`;
* verificar relación vigente con unidad, residencia, vehículo, mascota o contacto.

Métodos sugeridos:

```text id="1cunms"
canReadOwnPerson(userProfileId, tenantId, personId)
canReadOwnPropertyUnit(userProfileId, tenantId, propertyUnitId)
canReadOwnResidency(userProfileId, tenantId, residencyId)
canReadOwnVehicle(userProfileId, tenantId, vehicleId)
canReadOwnPet(userProfileId, tenantId, petId)
canReadOwnEmergencyContact(userProfileId, tenantId, contactId)
```

---

## 13.2. PropertyUnitPolicyService

Responsabilidad:

* validar código único;
* validar estado operativo;
* validar archivado;
* bloquear operaciones sobre unidades archivadas.

---

## 13.3. PersonPolicyService

Responsabilidad:

* validar identificación única;
* validar vínculo con UserProfile;
* bloquear archivado si hay relaciones activas críticas, según política;
* proteger datos personales.

---

## 13.4. OwnershipPolicyService

Responsabilidad:

* validar propietario persona o entidad;
* validar tenant;
* validar porcentaje;
* validar cierre de propiedad;
* validar propietario principal.

---

## 13.5. ResidencyPolicyService

Responsabilidad:

* validar persona y unidad;
* validar estado;
* validar cierre de residencia;
* validar residente principal.

---

## 13.6. LeasePolicyService

Responsabilidad:

* validar relación de arriendo;
* validar fechas;
* validar propietario y arrendatario;
* validar tenant.

---

## 14. Casos de uso principales

## 14.1. CreatePropertyUnitUseCase

Responsabilidad:

* validar tenant activo;
* validar permiso `propertyUnits.create`;
* validar código único por tenant;
* crear unidad;
* auditar;
* emitir evento.

---

## 14.2. UpdatePropertyUnitUseCase

Responsabilidad:

* validar tenant;
* validar permiso;
* validar unidad existente;
* actualizar campos permitidos;
* auditar;
* emitir evento.

---

## 14.3. ArchivePropertyUnitUseCase

Responsabilidad:

* validar tenant;
* validar permiso;
* bloquear eliminación física;
* cambiar estado a `archived`;
* registrar `archivedAt`;
* auditar.

---

## 14.4. CreatePersonUseCase

Responsabilidad:

* validar tenant activo;
* validar permiso `persons.create`;
* validar identificación única si existe;
* crear persona;
* auditar;
* emitir evento.

---

## 14.5. LinkUserToPersonUseCase

Responsabilidad:

* validar persona;
* validar UserProfile;
* validar tenant/membership;
* evitar vínculo duplicado indebido;
* vincular usuario con persona;
* habilitar acceso `.own`;
* auditar;
* emitir evento.

---

## 14.6. CreatePropertyOwnershipUseCase

Responsabilidad:

* validar unidad;
* validar propietario persona o legal entity;
* validar tenant;
* validar porcentaje;
* crear relación active;
* auditar;
* emitir evento.

---

## 14.7. EndPropertyOwnershipUseCase

Responsabilidad:

* validar relación active;
* establecer `endDate`;
* cambiar status a `ended`;
* conservar historial;
* auditar;
* emitir evento.

---

## 14.8. CreateResidencyUseCase

Responsabilidad:

* validar unidad;
* validar persona;
* validar tenant;
* validar tipo de residencia;
* crear residencia active;
* auditar;
* emitir evento.

---

## 14.9. EndResidencyUseCase

Responsabilidad:

* validar residencia active;
* establecer `endDate`;
* cambiar status a `ended`;
* conservar historial;
* auditar;
* emitir evento.

---

## 14.10. CreateLeaseUseCase

Responsabilidad:

* validar unidad;
* validar propietario;
* validar arrendatario;
* validar fechas;
* crear lease;
* auditar;
* emitir evento.

---

## 14.11. CreateVehicleUseCase

Responsabilidad:

* validar tenant;
* validar persona o unidad;
* validar placa si existe;
* crear vehículo;
* auditar;
* emitir evento.

---

## 14.12. CreatePetUseCase

Responsabilidad:

* validar tenant;
* validar persona o unidad;
* crear mascota;
* auditar;
* emitir evento.

---

## 14.13. Own resource use cases

Casos:

```text id="r8ac8d"
GetMyPersonUseCase
GetMyPropertyUnitsUseCase
GetMyResidenciesUseCase
GetMyVehiclesUseCase
GetMyPetsUseCase
GetMyEmergencyContactsUseCase
```

Responsabilidad:

* validar usuario autenticado;
* validar persona vinculada;
* validar permiso `.own`;
* devolver solo recursos propios;
* no exponer datos ajenos.

---

## 15. Controladores REST

## 15.1. PropertyUnitsController

Ruta base:

```text id="wyzq8o"
/api/v1/tenant/property-units
```

Endpoints:

```text id="90clh1"
GET    /
POST   /
GET    /:propertyUnitId
PATCH  /:propertyUnitId
POST   /:propertyUnitId/archive
```

---

## 15.2. PersonsController

Ruta base:

```text id="k2mguz"
/api/v1/tenant/persons
```

Endpoints:

```text id="e7idku"
GET    /
POST   /
GET    /:personId
PATCH  /:personId
POST   /:personId/archive
POST   /:personId/link-user
```

---

## 15.3. LegalEntitiesController

Ruta base:

```text id="92153p"
/api/v1/tenant/legal-entities
```

Endpoints:

```text id="cw9gr8"
GET    /
POST   /
GET    /:legalEntityId
PATCH  /:legalEntityId
POST   /:legalEntityId/archive
```

---

## 15.4. PropertyOwnershipsController

Ruta base:

```text id="1nq83d"
/api/v1/tenant/property-ownerships
```

Endpoints:

```text id="250ern"
GET    /
POST   /
GET    /:ownershipId
PATCH  /:ownershipId
POST   /:ownershipId/end
```

---

## 15.5. ResidenciesController

Ruta base:

```text id="69hj9t"
/api/v1/tenant/residencies
```

Endpoints:

```text id="x6s8kz"
GET    /
POST   /
GET    /:residencyId
PATCH  /:residencyId
POST   /:residencyId/end
```

---

## 15.6. LeasesController

Ruta base:

```text id="5icxh9"
/api/v1/tenant/leases
```

Endpoints:

```text id="o10ih4"
GET    /
POST   /
GET    /:leaseId
PATCH  /:leaseId
POST   /:leaseId/end
```

---

## 15.7. VehiclesController

Ruta base:

```text id="xhnmhg"
/api/v1/tenant/vehicles
```

Endpoints:

```text id="t4op0u"
GET    /
POST   /
GET    /:vehicleId
PATCH  /:vehicleId
POST   /:vehicleId/archive
```

---

## 15.8. PetsController

Ruta base:

```text id="p8fgbp"
/api/v1/tenant/pets
```

Endpoints:

```text id="mb0mky"
GET    /
POST   /
GET    /:petId
PATCH  /:petId
POST   /:petId/archive
```

---

## 15.9. EmergencyContactsController

Ruta base:

```text id="owhfex"
/api/v1/tenant/emergency-contacts
```

Endpoints:

```text id="21y4o5"
GET    /
POST   /
GET    /:emergencyContactId
PATCH  /:emergencyContactId
POST   /:emergencyContactId/archive
```

---

## 15.10. OwnResourcesController

Ruta base:

```text id="0ybyls"
/api/v1/me
```

Endpoints:

```text id="9g3k27"
GET /person
GET /property-units
GET /residencies
GET /vehicles
GET /pets
GET /emergency-contacts
```

---

## 16. DTOs principales

## 16.1. CreatePropertyUnitDto

Campos:

```text id="kk1j60"
code
name
type
block
floor
addressReference
areaM2
```

---

## 16.2. CreatePersonDto

Campos:

```text id="tv2cty"
firstName
lastName
displayName
identificationType
identificationNumber
email
phone
whatsapp
```

---

## 16.3. LinkUserToPersonDto

Campos:

```text id="4mm77y"
userProfileId
```

---

## 16.4. CreateLegalEntityDto

Campos:

```text id="e0mo09"
name
taxIdentificationType
taxIdentificationNumber
email
phone
address
```

---

## 16.5. CreatePropertyOwnershipDto

Campos:

```text id="n58wau"
propertyUnitId
personId nullable
legalEntityId nullable
ownershipType
ownershipPercentage
isPrimary
startDate
```

Regla:

```text id="lb4ykd"
exactamente uno entre personId y legalEntityId
```

---

## 16.6. CreateResidencyDto

Campos:

```text id="5ikkuc"
propertyUnitId
personId
residencyType
isPrimaryResident
startDate
```

---

## 16.7. CreateLeaseDto

Campos:

```text id="91w2z2"
propertyUnitId
ownerPersonId nullable
ownerLegalEntityId nullable
tenantPersonId
startDate
endDate
```

---

## 16.8. CreateVehicleDto

Campos:

```text id="bgjfz1"
propertyUnitId nullable
personId nullable
plate
type
brand
model
color
```

---

## 16.9. CreatePetDto

Campos:

```text id="h21yhe"
propertyUnitId nullable
personId nullable
name
species
breed
color
```

---

## 16.10. CreateEmergencyContactDto

Campos:

```text id="wi70e1"
personId
name
relationship
phone
email
```

---

## 17. Autenticación y autorización

### 17.1. Endpoints administrativos

Todos los endpoints `/api/v1/tenant/*` requieren:

```text id="pobnes"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

### 17.2. Endpoints `.own`

Los endpoints `/api/v1/me/*` requieren:

```text id="p6y8li"
AuthGuard
TenantGuard
TenantPermissionGuard o PolicyGuard
OwnResourcePolicyService
```

---

### 17.3. Permisos administrativos

Ejemplos:

```text id="m6csb4"
propertyUnits.create
propertyUnits.read
persons.create
persons.read
propertyOwnerships.create
residencies.create
vehicles.create
pets.create
```

---

### 17.4. Permisos propios

Ejemplos:

```text id="sl9ddc"
persons.read.own
propertyUnits.read.own
residencies.read.own
vehicles.read.own
pets.read.own
emergencyContacts.read.own
```

---

## 18. Auditoría

## 18.1. Puerto

Crear:

```text id="n3rayj"
ResidentsPropertiesAuditPort
```

Responsabilidad:

* registrar cambios de personas;
* registrar cambios de unidades;
* registrar vínculos UserProfile-Person;
* registrar cambios de propiedad;
* registrar cambios de residencia;
* registrar vehículos, mascotas y contactos.

---

## 18.2. Eventos auditables

```text id="tz5n3r"
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

---

## 18.3. Campos mínimos

```text id="ijqv9v"
tenantId
actorUserId
action
resourceType
resourceId
oldValue
newValue
result
traceId
occurredAt
```

---

## 19. Eventos de dominio

Eventos mínimos:

```text id="9tpx74"
PersonCreated
PersonUpdated
PersonArchived
UserLinkedToPerson
LegalEntityCreated
LegalEntityUpdated
LegalEntityArchived
PropertyUnitCreated
PropertyUnitUpdated
PropertyUnitArchived
PropertyOwnershipCreated
PropertyOwnershipEnded
ResidencyCreated
ResidencyEnded
LeaseCreated
LeaseEnded
VehicleRegistered
VehicleUpdated
VehicleArchived
PetRegistered
PetUpdated
PetArchived
EmergencyContactCreated
EmergencyContactUpdated
EmergencyContactArchived
```

Implementación inicial:

* eventos internos;
* sin broker externo obligatorio;
* compatible con outbox futuro.

---

## 20. Observabilidad

## 20.1. Logs

Registrar:

```text id="30e1n9"
property unit created
person created
user linked to person
ownership created
ownership ended
residency created
residency ended
vehicle registered
pet registered
own resource access denied
cross-tenant access attempt
```

No registrar:

```text id="d04jco"
identificationNumber completo
payload personal completo
Authorization header
access token
datos sensibles innecesarios
stack trace en producción
```

---

## 20.2. Métricas sugeridas

```text id="vrjsxy"
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
```

---

## 20.3. Trace

Todos los casos de uso críticos deben recibir o generar:

```text id="otj0op"
traceId
```

---

## 21. Seguridad

Controles obligatorios:

* `tenantId` obligatorio;
* validación de tenant activo;
* validación de membership activa;
* validación de permisos;
* validación de resource ownership;
* validación `.own`;
* auditoría;
* no eliminación física;
* logs sanitizados;
* tests multitenant;
* tests de autorización.

Riesgos críticos:

| Riesgo                          | Mitigación                       |
| ------------------------------- | -------------------------------- |
| Usuario ve datos de otro tenant | TenantGuard + queries por tenant |
| Propietario ve unidad ajena     | OwnResourcePolicyService         |
| Se duplica unidad               | unique tenant+code               |
| Se duplica persona              | unique tenant+identification     |
| Se sobrescribe propietario      | historial con start/end          |
| Se sobrescribe residencia       | historial con start/end          |
| Datos personales en logs        | sanitización                     |
| Usuario `.own` sin vínculo      | policy guard                     |

---

## 22. Migración

## 22.1. Nombre sugerido

```text id="kq87f6"
003_create_residents_properties
```

---

## 22.2. Tablas

```text id="4w3li8"
persons
legal_entities
property_units
property_ownerships
residencies
leases
vehicles
pets
emergency_contacts
```

---

## 22.3. Enums

```text id="61wn87"
PersonStatus
PropertyUnitStatus
PropertyUnitType
IdentificationType
OwnershipStatus
OwnershipType
ResidencyStatus
ResidencyType
LeaseStatus
VehicleStatus
PetStatus
EmergencyContactStatus
```

---

## 22.4. Reglas de migración

* `tenant_id` obligatorio;
* `onDelete: Restrict`;
* índices por tenant;
* unique por tenant donde aplique;
* no cascade delete peligroso;
* revisar SQL;
* migration tests.

---

## 23. Seeds

Seeds sugeridos:

```text id="p0yyg5"
property units demo para Villa Club
persons demo
ownerships demo
residencies demo
vehicles demo
pets demo
emergency contacts demo
```

No usar:

* datos reales;
* cédulas reales;
* teléfonos reales personales;
* placas reales;
* correos personales reales;
* datos de menores reales.

Usar:

```text id="2mmx8e"
example.com
datos ficticios
placas ficticias
```

---

## 24. Testing plan resumido

El documento completo será:

```text id="2z44sw"
docs/specs/003-residents-properties/test-plan.md
```

### 24.1. Unit tests

* value objects;
* estados;
* percentage;
* date range;
* own resource policy.

### 24.2. Integration tests

* crear unidad;
* unique tenant+code;
* crear persona;
* unique identification por tenant;
* vincular usuario-persona;
* crear propiedad;
* crear residencia;
* finalizar propiedad;
* finalizar residencia.

### 24.3. API tests

* property units;
* persons;
* legal entities;
* ownerships;
* residencies;
* leases;
* vehicles;
* pets;
* own endpoints.

### 24.4. Authorization tests

* sin token;
* sin permiso;
* sin membership;
* tenant suspendido;
* `.own` sin vínculo;
* `.own` recurso ajeno.

### 24.5. Multitenancy tests

* Tenant A no accede a Tenant B;
* persona de Tenant A no se usa en Tenant B;
* unidad de Tenant A no se usa en Tenant B;
* own resources no mezclan tenants.

### 24.6. Security tests

* no logs con identificación completa;
* no eliminación física;
* no sobrescribir historial;
* payload validation;
* search seguro.

---

## 25. Orden recomendado de desarrollo

### Fase 1 — Documentación

```text id="fd8d9j"
1. spec.md
2. plan.md
3. data-model.md
4. api-contract.md
5. test-plan.md
6. tasks.md
7. security-notes.md
```

---

### Fase 2 — Base técnica

```text id="2menvw"
1. Crear módulo residents-properties.
2. Crear controladores base.
3. Crear value objects.
4. Crear entidades.
5. Crear errores.
6. Crear eventos.
7. Crear DTOs.
```

---

### Fase 3 — Persistencia

```text id="ashqgz"
1. Crear modelos Prisma.
2. Crear migración.
3. Crear repositorios.
4. Crear mappers.
5. Crear seeds demo.
6. Crear migration tests.
```

---

### Fase 4 — Servicios y policies

```text id="d4xwot"
1. OwnResourcePolicyService.
2. PropertyUnitPolicyService.
3. PersonPolicyService.
4. OwnershipPolicyService.
5. ResidencyPolicyService.
6. LeasePolicyService.
```

---

### Fase 5 — Casos de uso

```text id="afcgv3"
1. Property units.
2. Persons.
3. Legal entities.
4. Ownerships.
5. Residencies.
6. Leases.
7. Vehicles.
8. Pets.
9. Emergency contacts.
10. Own resource use cases.
```

---

### Fase 6 — API y autorización

```text id="m6i2np"
1. Controladores administrativos.
2. OwnResourcesController.
3. Guards.
4. Policies.
5. OpenAPI.
```

---

### Fase 7 — Auditoría, eventos y pruebas

```text id="zyisgr"
1. AuditPort.
2. EventsPort.
3. Logs.
4. Métricas.
5. Unit tests.
6. Integration tests.
7. API tests.
8. Authorization tests.
9. Multitenancy tests.
10. Security tests.
```

---

## 26. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* módulo NestJS creado;
* modelos Prisma creados;
* migración aplicada;
* `tenantId` obligatorio;
* unidades creadas con código único por tenant;
* personas creadas con identificación única por tenant si existe;
* UserProfile se vincula con Person;
* propietarios se relacionan con unidades;
* residentes se relacionan con unidades;
* historial de propiedad se conserva;
* historial de residencia se conserva;
* vehículos y mascotas se registran;
* endpoints `.own` devuelven solo recursos propios;
* autorización tenant-scoped aplicada;
* auditoría aplicada;
* eventos emitidos;
* OpenAPI actualizado;
* tests unitarios pasan;
* tests integración pasan;
* tests API pasan;
* tests autorización pasan;
* tests multitenant pasan;
* tests seguridad pasan;
* CI pasa.

---

## 27. Comandos esperados

Comandos generales:

```bash id="gq4bct"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run prisma:migrate:dev
npm run build
```

Comandos específicos sugeridos:

```bash id="wdoyeg"
npm run test:residents-properties
npm run test:residents-properties:unit
npm run test:residents-properties:integration
npm run test:residents-properties:api
npm run test:residents-properties:authorization
npm run test:residents-properties:multitenancy
npm run test:residents-properties:security
```

---

## 28. Riesgos de implementación

| Riesgo                                     | Impacto | Mitigación                   |
| ------------------------------------------ | ------- | ---------------------------- |
| Acceso cross-tenant                        | Crítico | TenantGuard + tests          |
| `.own` mal implementado                    | Crítico | OwnResourcePolicyService     |
| Unidad duplicada                           | Alto    | unique tenant+code           |
| Persona duplicada                          | Alto    | unique tenant+identification |
| Historial sobrescrito                      | Alto    | startDate/endDate/status     |
| Datos personales excesivos                 | Alto    | minimización                 |
| Datos personales en logs                   | Alto    | sanitización                 |
| Relación con unidad/persona de otro tenant | Crítico | validations                  |
| Borrar físicamente historial               | Alto    | archive/end                  |
| Preparar mal datos financieros futuros     | Alto    | constraints e integridad     |

---

## 29. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="h7b8md"
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
docs/specs/001-tenants/spec.md
docs/specs/002-users-roles/spec.md
docs/specs/003-residents-properties/spec.md
docs/specs/003-residents-properties/plan.md
```

El agente no debe:

* crear endpoints sin autorización;
* permitir acceso cross-tenant;
* retornar datos personales excesivos;
* eliminar físicamente historial;
* sobrescribir propietarios anteriores;
* sobrescribir residentes anteriores;
* implementar pagos o alícuotas;
* registrar datos sensibles en logs;
* usar datos reales en seeds;
* ignorar permisos `.own`.

---

## 30. Estrategia de entrega

### Incremento 1 — Modelo base

* Personas.
* Unidades.
* Entidades jurídicas.
* Migración.
* Seeds básicos.

### Incremento 2 — Relaciones principales

* Propiedad.
* Residencia.
* Vínculo UserProfile-Person.
* Policies `.own`.

### Incremento 3 — Elementos complementarios

* Lease básico.
* Vehículos.
* Mascotas.
* Contactos de emergencia.

### Incremento 4 — API y autorización

* Controladores.
* Guards.
* Permisos.
* OpenAPI.

### Incremento 5 — Hardening

* Auditoría.
* Eventos.
* Observabilidad.
* Tests.
* CI gates.

---

## 31. Pendientes para documentos derivados

### 31.1. `data-model.md`

Debe detallar:

* tablas;
* columnas;
* enums;
* constraints;
* índices;
* modelo Prisma completo;
* relaciones;
* seeds;
* reglas de migración.

### 31.2. `api-contract.md`

Debe detallar:

* endpoints;
* permisos;
* requests;
* responses;
* errores;
* status codes;
* filtros;
* paginación;
* contrato `.own`.

### 31.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* multitenancy tests;
* security tests;
* own access tests.

### 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

### 31.5. `security-notes.md`

Debe detallar:

* privacidad;
* cross-tenant;
* own access;
* datos personales;
* logs;
* eliminación lógica;
* riesgos para módulos financieros futuros.

---

## 32. Decisión final de implementación

El módulo `003-residents-properties` se implementará como módulo interno de NestJS dentro del monolito modular de RESIDENT Core.

Usará PostgreSQL y Prisma.

Todo registro operativo tendrá `tenantId`.

La autorización usará roles, permisos, membresía y policies `.own`.

El módulo no eliminará físicamente información histórica de propiedad o residencia.

La prioridad será:

```text id="4o5ie1"
seguridad
multitenancy
privacidad
trazabilidad histórica
compatibilidad financiera futura
```

Este módulo debe completarse antes de iniciar `004-dues-fees`, porque la generación de alícuotas y cargos requiere unidades habitacionales, propietarios y relaciones de residencia correctamente modeladas.
