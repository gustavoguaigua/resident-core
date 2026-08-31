# Test Plan — Spec 003 Residents, Owners, Tenants and Property Units

> Permisos/Audit Sprint 3: los casos obligatorios y el catálogo canónico están en
> `docs/changes/GAP-S3-007-PERMISSIONS-AUDIT-CATALOG-2026-08-30.md`; prevalecen sobre
> expectativas preliminares de este documento.

> Contrato Sprint 3: GAP-S3-002 está cerrado por
> `docs/changes/GAP-S3-002-RESIDENTS-PROPERTIES-OWNERSHIP-2026-08-29.md`. Ese contrato
> prevalece para invariantes, lifecycle y casos `.own`; este documento permanece
> queda `accepted` tras el cierre de todos sus blockers.

## 1. Información del documento

| Campo                    | Valor                                                 |
| ------------------------ | ----------------------------------------------------- |
| Proyecto                 | RESIDENT Core                                         |
| Spec ID                  | 003                                                   |
| Módulo                   | Residents and Properties                              |
| Documento                | Test Plan                                             |
| Ruta                     | `docs/specs/003-residents-properties/test-plan.md`    |
| Versión                  | 0.1                                                   |
| Estado                   | accepted                                          |
| Fecha                    | 2026-07-13                                            |
| Documento base           | `docs/specs/003-residents-properties/spec.md`         |
| Plan técnico             | `docs/specs/003-residents-properties/plan.md`         |
| Modelo de datos          | `docs/specs/003-residents-properties/data-model.md`   |
| Contrato API             | `docs/specs/003-residents-properties/api-contract.md` |
| Depende de               | `001-tenants`, `002-users-roles`                      |
| Framework sugerido       | Jest + Supertest                                      |
| Base de datos de pruebas | PostgreSQL test database                              |
| Prioridad                | Alta                                                  |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `003-residents-properties`.

El objetivo es validar que RESIDENT Core gestione correctamente:

* personas;
* entidades jurídicas;
* unidades habitacionales;
* propietarios;
* residentes;
* arrendatarios;
* relaciones de propiedad;
* relaciones de residencia;
* arriendos básicos;
* vehículos;
* mascotas;
* contactos de emergencia;
* vínculo `UserProfile` ↔ `Person`;
* acceso propio mediante permisos `.own`;
* integridad multitenant;
* privacidad de datos personales;
* trazabilidad histórica;
* auditoría;
* eventos;
* compatibilidad con módulos financieros futuros.

Regla central:

```text id="lfwmfu"
Ningún recurso de Residents and Properties puede consultarse, crearse, actualizarse o relacionarse sin validar tenant, membership, permisos y ownership del recurso.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este plan cubre:

* pruebas unitarias;
* pruebas de value objects;
* pruebas de entidades de dominio;
* pruebas de políticas `.own`;
* pruebas de servicios de aplicación;
* pruebas de casos de uso;
* pruebas de repositorios;
* pruebas de migración;
* pruebas de seeds;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas de seguridad;
* pruebas de privacidad;
* pruebas de auditoría;
* pruebas de eventos;
* pruebas OpenAPI;
* smoke tests.

---

### 3.2. No incluido

No cubre todavía:

* pruebas financieras;
* alícuotas;
* cargos;
* estados de cuenta;
* pagos;
* conciliación bancaria;
* multas;
* reservas;
* visitas;
* control físico de acceso;
* documentos legales adjuntos;
* firma electrónica;
* validación oficial de cédula/RUC;
* integración con Registro Civil;
* pruebas UI del frontend;
* flujos de aprobación de cambios solicitados por residentes.

Estos temas pertenecen a specs posteriores.

---

## 4. Estrategia general

El módulo se probará en capas:

```text id="kzddx1"
Unit tests
Domain tests
Application tests
Repository integration tests
Migration tests
API tests
Authorization tests
Own access tests
Multitenancy tests
Security tests
Privacy tests
Audit tests
Event tests
OpenAPI tests
Smoke tests
```

Reglas obligatorias:

```text id="n73hca"
1. Todo endpoint privado debe tener prueba 401 sin token.
2. Todo endpoint privado debe tener prueba 403 sin permiso.
3. Todo endpoint tenant-scoped debe tener prueba cross-tenant negativa.
4. Todo endpoint .own debe tener prueba de recurso propio y recurso ajeno.
5. Toda relación histórica debe probar que no se sobrescribe ni se elimina físicamente.
6. Todo cambio sensible debe generar auditoría.
7. Ninguna prueba debe usar datos reales.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* se crean unidades por tenant;
* se impide duplicar código de unidad dentro del mismo tenant;
* se permite el mismo código en tenants distintos si corresponde;
* se crean personas por tenant;
* se impide duplicar identificación dentro del mismo tenant cuando existe;
* se permite la misma identificación en tenants distintos en MVP;
* se vincula `UserProfile` con `Person`;
* se crean entidades jurídicas;
* se crean relaciones de propiedad con persona o entidad jurídica;
* se rechaza ownership con persona y entidad simultáneamente;
* se rechaza ownership sin propietario;
* se crean residencias;
* se finalizan relaciones sin eliminar historial;
* se crean leases básicos;
* se registran vehículos y mascotas;
* se registran contactos de emergencia;
* endpoints `.own` devuelven solo recursos propios;
* no existe acceso cross-tenant;
* no se registran datos personales completos en logs;
* cambios críticos se auditan;
* eventos críticos se emiten;
* OpenAPI coincide con `api-contract.md`;
* CI ejecuta pruebas críticas.

---

## 6. Datos de prueba base

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="w12i79"
tenantActiveA: villa-club-demo
tenantActiveB: altos-del-norte-demo
tenantSuspended: tenant-suspendido-demo
tenantArchived: tenant-archivado-demo
```

---

### 6.2. Usuarios y membresías

Reusar fixtures de `002-users-roles`:

```text id="m45b6o"
platformAdmin
tenantAdminA
tenantAdminB
tenantStaffA
treasurerA
boardMemberA
residentUserA
propertyOwnerUserA
residentUserB
userWithoutMembership
userWithoutPermission
disabledUser
anonymousUser
```

---

### 6.3. Personas

Fixtures sugeridos:

```text id="jz9iup"
personOwnerA
personResidentA
personTenantA
personOccupantA
personOwnerB
personResidentB
personWithoutUser
personLinkedToResidentUserA
personLinkedToOwnerUserA
archivedPersonA
```

---

### 6.4. Unidades

Fixtures sugeridos:

```text id="h77nw2"
unitA1: Casa 01, tenantActiveA
unitA2: Casa 02, tenantActiveA
unitA3: Casa 03, tenantActiveA
unitB1: A-101, tenantActiveB
unitSuspendedTenant1
archivedUnitA
```

---

### 6.5. Relaciones

Fixtures sugeridos:

```text id="ao648w"
ownershipA1OwnerActive
ownershipA1CoOwnerActive
ownershipA1Ended
residencyA1OwnerResidentActive
residencyA1TenantActive
residencyA1Ended
leaseA1Draft
leaseA1Active
vehicleA1
petA1
emergencyContactA1
```

---

### 6.6. Datos prohibidos

No usar:

```text id="v6pzks"
cédulas reales
RUC reales
pasaportes reales
nombres completos de personas reales
teléfonos reales
emails personales reales
placas reales
direcciones exactas reales
datos de menores reales
datos médicos
datos bancarios
comprobantes
```

Usar dominios y valores ficticios:

```text id="hxgn5i"
example.com
DEMO-001
TEST-001
0000000000
```

---

## 7. Factories recomendadas

Crear factories:

```text id="uf40ij"
createPerson()
createPersonLinkedToUser()
createArchivedPerson()
createLegalEntity()
createPropertyUnit()
createArchivedPropertyUnit()
createPropertyOwnership()
createEndedPropertyOwnership()
createResidency()
createEndedResidency()
createLease()
createVehicle()
createPet()
createEmergencyContact()
createOwnAccessContext()
createTenantContext()
```

Ejemplos:

```text id="2xbwoy"
createPropertyUnit({
  tenantId: tenantActiveA.id,
  code: "Casa 01",
  type: "house",
  status: "active"
})

createPersonLinkedToUser({
  tenantId: tenantActiveA.id,
  userProfileId: residentUserA.id,
  displayName: "Resident Demo A"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. PropertyUnitCode

Archivo sugerido:

```text id="cgzwz8"
property-unit-code.vo.spec.ts
```

| ID            | Caso                                     | Resultado esperado                  |
| ------------- | ---------------------------------------- | ----------------------------------- |
| UT-PUCODE-001 | Código válido `Casa 01`                  | válido                              |
| UT-PUCODE-002 | Código con espacios                      | trim                                |
| UT-PUCODE-003 | Código vacío                             | error                               |
| UT-PUCODE-004 | Código demasiado largo                   | error                               |
| UT-PUCODE-005 | Código con caracteres inválidos críticos | error o sanitización según política |

---

## 8.2. PropertyUnitType

Archivo sugerido:

```text id="0dpc3x"
property-unit-type.vo.spec.ts
```

| ID            | Caso           | Resultado esperado |
| ------------- | -------------- | ------------------ |
| UT-PUTYPE-001 | `house`        | válido             |
| UT-PUTYPE-002 | `apartment`    | válido             |
| UT-PUTYPE-003 | `parking`      | válido             |
| UT-PUTYPE-004 | valor inválido | error              |

---

## 8.3. IdentificationType

Archivo sugerido:

```text id="1nd7x0"
identification-type.vo.spec.ts
```

| ID            | Caso           | Resultado esperado |
| ------------- | -------------- | ------------------ |
| UT-IDTYPE-001 | `cedula`       | válido             |
| UT-IDTYPE-002 | `ruc`          | válido             |
| UT-IDTYPE-003 | `passport`     | válido             |
| UT-IDTYPE-004 | `none`         | válido             |
| UT-IDTYPE-005 | valor inválido | error              |

---

## 8.4. IdentificationNumber

Archivo sugerido:

```text id="fmbpwi"
identification-number.vo.spec.ts
```

| ID           | Caso                             | Resultado esperado          |
| ------------ | -------------------------------- | --------------------------- |
| UT-IDNUM-001 | Número básico válido             | válido                      |
| UT-IDNUM-002 | Valor con espacios               | trim                        |
| UT-IDNUM-003 | Valor vacío con type definido    | error o null según política |
| UT-IDNUM-004 | Valor demasiado largo            | error                       |
| UT-IDNUM-005 | Script/payload extraño           | error                       |
| UT-IDNUM-006 | No valida fuente oficial externa | pasa como validación básica |

---

## 8.5. OwnershipPercentage

Archivo sugerido:

```text id="0hk9jx"
ownership-percentage.vo.spec.ts
```

| ID          | Caso                                  | Resultado esperado |
| ----------- | ------------------------------------- | ------------------ |
| UT-OWNP-001 | 100.00                                | válido             |
| UT-OWNP-002 | 50.00                                 | válido             |
| UT-OWNP-003 | 0                                     | error              |
| UT-OWNP-004 | -1                                    | error              |
| UT-OWNP-005 | 100.01                                | error              |
| UT-OWNP-006 | null permitido si política lo permite | válido             |

---

## 8.6. DateRange

Archivo sugerido:

```text id="pecunr"
date-range.vo.spec.ts
```

| ID          | Caso                         | Resultado esperado |
| ----------- | ---------------------------- | ------------------ |
| UT-DATE-001 | startDate válido sin endDate | válido             |
| UT-DATE-002 | endDate igual a startDate    | válido             |
| UT-DATE-003 | endDate posterior            | válido             |
| UT-DATE-004 | endDate anterior             | error              |
| UT-DATE-005 | startDate ausente            | error              |

---

## 8.7. VehiclePlate

Archivo sugerido:

```text id="8et09x"
vehicle-plate.vo.spec.ts
```

| ID           | Caso             | Resultado esperado          |
| ------------ | ---------------- | --------------------------- |
| UT-PLATE-001 | `DEMO-001`       | válido                      |
| UT-PLATE-002 | minúsculas       | uppercase                   |
| UT-PLATE-003 | espacios         | trim                        |
| UT-PLATE-004 | vacío            | null o error según contexto |
| UT-PLATE-005 | string muy largo | error                       |

---

## 8.8. Estados

Archivos sugeridos:

```text id="czdc7x"
person-status.vo.spec.ts
property-unit-status.vo.spec.ts
ownership-status.vo.spec.ts
residency-status.vo.spec.ts
lease-status.vo.spec.ts
vehicle-status.vo.spec.ts
pet-status.vo.spec.ts
emergency-contact-status.vo.spec.ts
```

| ID            | Caso                                  | Resultado esperado |
| ------------- | ------------------------------------- | ------------------ |
| UT-STATUS-001 | active puede operar                   | true               |
| UT-STATUS-002 | archived no opera ordinariamente      | false              |
| UT-STATUS-003 | ended no puede finalizarse nuevamente | false              |
| UT-STATUS-004 | valor inválido                        | error              |

---

# 9. Pruebas unitarias de entidades

## 9.1. PropertyUnit entity

Archivo sugerido:

```text id="zceza6"
property-unit.entity.spec.ts
```

| ID        | Caso                         | Resultado esperado          |
| --------- | ---------------------------- | --------------------------- |
| UT-PU-001 | Crear unidad válida          | entidad válida              |
| UT-PU-002 | Archivar unidad activa       | status archived             |
| UT-PU-003 | Archivar unidad ya archivada | conflicto/no-op documentado |
| UT-PU-004 | Actualizar campos permitidos | éxito                       |
| UT-PU-005 | Área negativa                | error                       |

---

## 9.2. Person entity

Archivo sugerido:

```text id="k257h4"
person.entity.spec.ts
```

| ID         | Caso                                      | Resultado esperado     |
| ---------- | ----------------------------------------- | ---------------------- |
| UT-PER-001 | Crear persona válida                      | entidad válida         |
| UT-PER-002 | Crear persona sin usuario                 | válido                 |
| UT-PER-003 | Vincular UserProfile                      | userProfileId asignado |
| UT-PER-004 | Archivar persona                          | status archived        |
| UT-PER-005 | Persona archivada no opera ordinariamente | bloqueada              |

---

## 9.3. LegalEntity entity

Archivo sugerido:

```text id="6cddf0"
legal-entity.entity.spec.ts
```

| ID        | Caso                 | Resultado esperado |
| --------- | -------------------- | ------------------ |
| UT-LE-001 | Crear entidad válida | entidad válida     |
| UT-LE-002 | Nombre vacío         | error              |
| UT-LE-003 | Archivar entidad     | status archived    |

---

## 9.4. PropertyOwnership entity

Archivo sugerido:

```text id="41vyub"
property-ownership.entity.spec.ts
```

| ID         | Caso                         | Resultado esperado     |
| ---------- | ---------------------------- | ---------------------- |
| UT-OWN-001 | Ownership con personId       | válido                 |
| UT-OWN-002 | Ownership con legalEntityId  | válido                 |
| UT-OWN-003 | Ownership con ambos          | error                  |
| UT-OWN-004 | Ownership sin propietario    | error                  |
| UT-OWN-005 | Finalizar ownership activo   | status ended + endDate |
| UT-OWN-006 | Finalizar ownership ya ended | error                  |
| UT-OWN-007 | Porcentaje inválido          | error                  |

---

## 9.5. Residency entity

Archivo sugerido:

```text id="070g3h"
residency.entity.spec.ts
```

| ID         | Caso                          | Resultado esperado     |
| ---------- | ----------------------------- | ---------------------- |
| UT-RES-001 | Crear residencia válida       | entidad válida         |
| UT-RES-002 | Finalizar residencia activa   | status ended + endDate |
| UT-RES-003 | Finalizar residencia ya ended | error                  |
| UT-RES-004 | Fecha fin anterior a inicio   | error                  |

---

## 9.6. Lease entity

Archivo sugerido:

```text id="b9los7"
lease.entity.spec.ts
```

| ID           | Caso                               | Resultado esperado |
| ------------ | ---------------------------------- | ------------------ |
| UT-LEASE-001 | Crear lease con ownerPerson        | válido             |
| UT-LEASE-002 | Crear lease con ownerLegalEntity   | válido             |
| UT-LEASE-003 | Crear lease con ambos propietarios | error              |
| UT-LEASE-004 | Crear lease sin propietario        | error              |
| UT-LEASE-005 | Finalizar lease                    | status ended       |
| UT-LEASE-006 | Fechas inválidas                   | error              |

---

## 9.7. Vehicle entity

Archivo sugerido:

```text id="syqzl8"
vehicle.entity.spec.ts
```

| ID         | Caso                                 | Resultado esperado |
| ---------- | ------------------------------------ | ------------------ |
| UT-VEH-001 | Crear vehículo con persona           | válido             |
| UT-VEH-002 | Crear vehículo con unidad            | válido             |
| UT-VEH-003 | Crear vehículo sin persona ni unidad | error              |
| UT-VEH-004 | Normaliza placa                      | uppercase          |
| UT-VEH-005 | Archivar vehículo                    | status archived    |

---

## 9.8. Pet entity

Archivo sugerido:

```text id="mn9sn7"
pet.entity.spec.ts
```

| ID         | Caso                                | Resultado esperado |
| ---------- | ----------------------------------- | ------------------ |
| UT-PET-001 | Crear mascota con persona           | válido             |
| UT-PET-002 | Crear mascota con unidad            | válido             |
| UT-PET-003 | Crear mascota sin persona ni unidad | error              |
| UT-PET-004 | Nombre vacío                        | error              |
| UT-PET-005 | Archivar mascota                    | status archived    |

---

# 10. Pruebas de servicios y policies

## 10.1. OwnResourcePolicyService

Archivo sugerido:

```text id="6rprhl"
own-resource-policy.service.spec.ts
```

| ID          | Caso                                             | Resultado esperado             |
| ----------- | ------------------------------------------------ | ------------------------------ |
| SRV-OWN-001 | Usuario vinculado a Person consulta su persona   | permitido                      |
| SRV-OWN-002 | Usuario sin Person vinculada                     | `OWN_PERSON_NOT_LINKED`        |
| SRV-OWN-003 | Propietario consulta unidad propia               | permitido                      |
| SRV-OWN-004 | Residente consulta unidad donde reside           | permitido                      |
| SRV-OWN-005 | Usuario consulta unidad ajena                    | rechazado                      |
| SRV-OWN-006 | Usuario consulta vehículo propio por persona     | permitido                      |
| SRV-OWN-007 | Usuario consulta vehículo propio por unidad      | permitido                      |
| SRV-OWN-008 | Usuario consulta mascota ajena                   | rechazado                      |
| SRV-OWN-009 | Tenant B no ve recursos Tenant A                 | rechazado                      |
| SRV-OWN-010 | Relación ended no otorga acceso operativo propio | rechazado o histórico limitado |

---

## 10.2. PropertyUnitPolicyService

| ID             | Caso                                            | Resultado esperado |
| -------------- | ----------------------------------------------- | ------------------ |
| SRV-PU-POL-001 | Código único por tenant                         | permitido          |
| SRV-PU-POL-002 | Código duplicado mismo tenant                   | rechazado          |
| SRV-PU-POL-003 | Código duplicado otro tenant                    | permitido          |
| SRV-PU-POL-004 | Unidad archivada no actualizable ordinariamente | rechazado          |
| SRV-PU-POL-005 | Área inválida                                   | rechazado          |

---

## 10.3. PersonPolicyService

| ID              | Caso                                              | Resultado esperado                      |
| --------------- | ------------------------------------------------- | --------------------------------------- |
| SRV-PER-POL-001 | Identificación única por tenant                   | permitido                               |
| SRV-PER-POL-002 | Identificación duplicada mismo tenant             | rechazado                               |
| SRV-PER-POL-003 | Identificación duplicada otro tenant              | permitido                               |
| SRV-PER-POL-004 | Vincular UserProfile existente                    | permitido                               |
| SRV-PER-POL-005 | Vincular UserProfile ya vinculado en mismo tenant | conflicto                               |
| SRV-PER-POL-006 | Archivar persona con relaciones activas críticas  | rechazado o requiere política explícita |

---

## 10.4. OwnershipPolicyService

| ID             | Caso                             | Resultado esperado          |
| -------------- | -------------------------------- | --------------------------- |
| SRV-OWNPOL-001 | Propietario persona mismo tenant | permitido                   |
| SRV-OWNPOL-002 | Propietario entidad mismo tenant | permitido                   |
| SRV-OWNPOL-003 | Persona de otro tenant           | rechazado                   |
| SRV-OWNPOL-004 | Unidad de otro tenant            | rechazado                   |
| SRV-OWNPOL-005 | Porcentaje excede 100 total      | rechazado si regla estricta |
| SRV-OWNPOL-006 | End ownership activo             | permitido                   |
| SRV-OWNPOL-007 | End ownership ended              | rechazado                   |

---

## 10.5. ResidencyPolicyService

| ID             | Caso                          | Resultado esperado |
| -------------- | ----------------------------- | ------------------ |
| SRV-RESPOL-001 | Persona y unidad mismo tenant | permitido          |
| SRV-RESPOL-002 | Persona de otro tenant        | rechazado          |
| SRV-RESPOL-003 | Unidad de otro tenant         | rechazado          |
| SRV-RESPOL-004 | End residency activa          | permitido          |
| SRV-RESPOL-005 | End residency ended           | rechazado          |

---

# 11. Pruebas de casos de uso

## 11.1. Property Units

| ID         | Caso                          | Resultado esperado                      |
| ---------- | ----------------------------- | --------------------------------------- |
| APP-PU-001 | Crear unidad válida           | éxito                                   |
| APP-PU-002 | Código duplicado mismo tenant | `PROPERTY_UNIT_CODE_ALREADY_EXISTS`     |
| APP-PU-003 | Código duplicado otro tenant  | éxito                                   |
| APP-PU-004 | Actualizar unidad             | éxito                                   |
| APP-PU-005 | Archivar unidad               | status archived                         |
| APP-PU-006 | Actor sin permiso             | 403 en API                              |
| APP-PU-007 | Auditoría generada            | `propertyUnit.created/updated/archived` |
| APP-PU-008 | Evento emitido                | `PropertyUnitCreated/Updated/Archived`  |

---

## 11.2. Persons

| ID          | Caso                                  | Resultado esperado                     |
| ----------- | ------------------------------------- | -------------------------------------- |
| APP-PER-001 | Crear persona válida                  | éxito                                  |
| APP-PER-002 | Crear persona sin UserProfile         | éxito                                  |
| APP-PER-003 | Identificación duplicada mismo tenant | `PERSON_IDENTIFICATION_ALREADY_EXISTS` |
| APP-PER-004 | Identificación duplicada otro tenant  | éxito                                  |
| APP-PER-005 | Actualizar persona                    | éxito                                  |
| APP-PER-006 | Archivar persona                      | status archived                        |
| APP-PER-007 | Vincular UserProfile con Person       | éxito                                  |
| APP-PER-008 | UserProfile inexistente               | `USER_PROFILE_NOT_FOUND`               |
| APP-PER-009 | Auditoría generada                    | pasa                                   |
| APP-PER-010 | Evento emitido                        | pasa                                   |

---

## 11.3. Legal Entities

| ID         | Caso                                             | Resultado esperado |
| ---------- | ------------------------------------------------ | ------------------ |
| APP-LE-001 | Crear entidad jurídica                           | éxito              |
| APP-LE-002 | Identificación tributaria duplicada mismo tenant | conflicto          |
| APP-LE-003 | Identificación tributaria duplicada otro tenant  | éxito              |
| APP-LE-004 | Actualizar entidad                               | éxito              |
| APP-LE-005 | Archivar entidad                                 | status archived    |

---

## 11.4. Property Ownerships

| ID          | Caso                             | Resultado esperado              |
| ----------- | -------------------------------- | ------------------------------- |
| APP-OWN-001 | Crear ownership con persona      | éxito                           |
| APP-OWN-002 | Crear ownership con legal entity | éxito                           |
| APP-OWN-003 | Crear ownership con ambos        | `OWNERSHIP_OWNER_XOR_VIOLATION` |
| APP-OWN-004 | Crear ownership sin propietario  | `OWNERSHIP_OWNER_REQUIRED`      |
| APP-OWN-005 | Persona de otro tenant           | `CROSS_TENANT_REFERENCE`        |
| APP-OWN-006 | Unidad de otro tenant            | `CROSS_TENANT_REFERENCE`        |
| APP-OWN-007 | Porcentaje inválido              | `OWNERSHIP_PERCENTAGE_INVALID`  |
| APP-OWN-008 | Finalizar ownership activo       | éxito                           |
| APP-OWN-009 | Finalizar ownership ya ended     | `OWNERSHIP_ALREADY_ENDED`       |
| APP-OWN-010 | Historial se conserva            | pasa                            |
| APP-OWN-011 | Auditoría generada               | pasa                            |

---

## 11.5. Residencies

| ID          | Caso                          | Resultado esperado        |
| ----------- | ----------------------------- | ------------------------- |
| APP-RES-001 | Crear residencia válida       | éxito                     |
| APP-RES-002 | Persona de otro tenant        | `CROSS_TENANT_REFERENCE`  |
| APP-RES-003 | Unidad de otro tenant         | `CROSS_TENANT_REFERENCE`  |
| APP-RES-004 | Finalizar residencia activa   | éxito                     |
| APP-RES-005 | Finalizar residencia ya ended | `RESIDENCY_ALREADY_ENDED` |
| APP-RES-006 | Historial se conserva         | pasa                      |
| APP-RES-007 | Auditoría generada            | pasa                      |

---

## 11.6. Leases

| ID            | Caso                             | Resultado esperado       |
| ------------- | -------------------------------- | ------------------------ |
| APP-LEASE-001 | Crear lease con ownerPerson      | éxito                    |
| APP-LEASE-002 | Crear lease con ownerLegalEntity | éxito                    |
| APP-LEASE-003 | Lease con ambos propietarios     | error XOR                |
| APP-LEASE-004 | Lease sin propietario            | error                    |
| APP-LEASE-005 | TenantPerson de otro tenant      | `CROSS_TENANT_REFERENCE` |
| APP-LEASE-006 | Fechas inválidas                 | validation error         |
| APP-LEASE-007 | Finalizar lease                  | éxito                    |
| APP-LEASE-008 | No gestiona valores monetarios   | pasa                     |

---

## 11.7. Vehicles

| ID          | Caso                                 | Resultado esperado       |
| ----------- | ------------------------------------ | ------------------------ |
| APP-VEH-001 | Crear vehículo con persona           | éxito                    |
| APP-VEH-002 | Crear vehículo con unidad            | éxito                    |
| APP-VEH-003 | Crear vehículo con persona y unidad  | éxito                    |
| APP-VEH-004 | Crear vehículo sin persona ni unidad | validation error         |
| APP-VEH-005 | Placa duplicada mismo tenant         | conflicto                |
| APP-VEH-006 | Placa duplicada otro tenant          | éxito                    |
| APP-VEH-007 | Persona/unidad de otro tenant        | `CROSS_TENANT_REFERENCE` |
| APP-VEH-008 | Archivar vehículo                    | éxito                    |

---

## 11.8. Pets

| ID          | Caso                                | Resultado esperado       |
| ----------- | ----------------------------------- | ------------------------ |
| APP-PET-001 | Crear mascota con persona           | éxito                    |
| APP-PET-002 | Crear mascota con unidad            | éxito                    |
| APP-PET-003 | Crear mascota sin persona ni unidad | validation error         |
| APP-PET-004 | Persona/unidad de otro tenant       | `CROSS_TENANT_REFERENCE` |
| APP-PET-005 | Archivar mascota                    | éxito                    |

---

## 11.9. Emergency Contacts

| ID         | Caso                   | Resultado esperado       |
| ---------- | ---------------------- | ------------------------ |
| APP-EC-001 | Crear contacto válido  | éxito                    |
| APP-EC-002 | Persona de otro tenant | `CROSS_TENANT_REFERENCE` |
| APP-EC-003 | Teléfono requerido     | validation error         |
| APP-EC-004 | Actualizar contacto    | éxito                    |
| APP-EC-005 | Archivar contacto      | éxito                    |

---

# 12. Pruebas de integración

## 12.1. Migración y persistencia

Archivo sugerido:

```text id="0k0jlx"
003-create-residents-properties.migration.spec.ts
```

| ID          | Caso                           | Resultado esperado         |
| ----------- | ------------------------------ | -------------------------- |
| INT-MIG-001 | Migración aplica en DB limpia  | éxito                      |
| INT-MIG-002 | Enums creados                  | éxito                      |
| INT-MIG-003 | Tablas creadas                 | éxito                      |
| INT-MIG-004 | tenant_id obligatorio en todas | éxito                      |
| INT-MIG-005 | unique tenant+code en units    | éxito                      |
| INT-MIG-006 | onDelete Restrict              | éxito                      |
| INT-MIG-007 | No cascade delete peligroso    | éxito                      |
| INT-MIG-008 | XOR ownership                  | éxito si SQL manual aplica |
| INT-MIG-009 | XOR lease                      | éxito si SQL manual aplica |
| INT-MIG-010 | Date range constraints         | éxito                      |
| INT-MIG-011 | Prisma Client genera           | éxito                      |

---

## 12.2. Repositorios

Archivos sugeridos:

```text id="ni4stl"
property-unit.repository.integration.spec.ts
person.repository.integration.spec.ts
legal-entity.repository.integration.spec.ts
property-ownership.repository.integration.spec.ts
residency.repository.integration.spec.ts
lease.repository.integration.spec.ts
vehicle.repository.integration.spec.ts
pet.repository.integration.spec.ts
emergency-contact.repository.integration.spec.ts
```

Casos mínimos:

| ID           | Caso                                   | Resultado esperado |
| ------------ | -------------------------------------- | ------------------ |
| INT-REPO-001 | Crear y buscar unidad                  | éxito              |
| INT-REPO-002 | Buscar unidad por código               | éxito              |
| INT-REPO-003 | Crear y buscar persona                 | éxito              |
| INT-REPO-004 | Buscar persona por userProfileId       | éxito              |
| INT-REPO-005 | Crear entidad jurídica                 | éxito              |
| INT-REPO-006 | Crear ownership                        | éxito              |
| INT-REPO-007 | Obtener propietarios activos de unidad | éxito              |
| INT-REPO-008 | Crear residencia                       | éxito              |
| INT-REPO-009 | Obtener residentes activos de unidad   | éxito              |
| INT-REPO-010 | Crear lease                            | éxito              |
| INT-REPO-011 | Crear vehículo                         | éxito              |
| INT-REPO-012 | Crear mascota                          | éxito              |
| INT-REPO-013 | Crear contacto                         | éxito              |

---

## 12.3. Seeds

| ID           | Caso                     | Resultado esperado |
| ------------ | ------------------------ | ------------------ |
| INT-SEED-001 | Crear unidades demo      | éxito              |
| INT-SEED-002 | Reejecutar seeds         | idempotente        |
| INT-SEED-003 | Crear personas demo      | éxito              |
| INT-SEED-004 | Crear ownerships demo    | éxito              |
| INT-SEED-005 | Crear residencies demo   | éxito              |
| INT-SEED-006 | Crear vehicles/pets demo | éxito              |
| INT-SEED-007 | No usar datos reales     | pasa               |

---

# 13. Pruebas API — Property Units

## 13.1. Listar unidades

Endpoint:

```text id="8u9uta"
GET /api/v1/tenant/property-units
```

| ID              | Caso                            | Resultado esperado |
| --------------- | ------------------------------- | ------------------ |
| API-PU-LIST-001 | TenantAdmin lista unidades      | 200                |
| API-PU-LIST-002 | Sin token                       | 401                |
| API-PU-LIST-003 | Sin membership                  | 403                |
| API-PU-LIST-004 | Sin permiso                     | 403                |
| API-PU-LIST-005 | No incluye unidades de Tenant B | pasa               |
| API-PU-LIST-006 | Filtro por status               | correcto           |
| API-PU-LIST-007 | Paginación                      | meta correcto      |

---

## 13.2. Crear unidad

Endpoint:

```text id="5jlgtg"
POST /api/v1/tenant/property-units
```

| ID                | Caso                          | Resultado esperado |
| ----------------- | ----------------------------- | ------------------ |
| API-PU-CREATE-001 | Crear unidad válida           | 201                |
| API-PU-CREATE-002 | Código duplicado mismo tenant | 409                |
| API-PU-CREATE-003 | Código duplicado otro tenant  | 201                |
| API-PU-CREATE-004 | Área negativa                 | 422                |
| API-PU-CREATE-005 | Sin permiso                   | 403                |
| API-PU-CREATE-006 | Tenant suspended              | 403                |
| API-PU-CREATE-007 | Auditoría generada            | pasa               |

---

## 13.3. Consultar, actualizar y archivar unidad

| ID             | Endpoint             | Caso                      | Resultado esperado    |
| -------------- | -------------------- | ------------------------- | --------------------- |
| API-PU-GET-001 | GET `/{id}`          | Unidad del tenant         | 200                   |
| API-PU-GET-002 | GET `/{id}`          | Unidad de otro tenant     | 403/404               |
| API-PU-UPD-001 | PATCH `/{id}`        | Actualización válida      | 200                   |
| API-PU-UPD-002 | PATCH `/{id}`        | Intentar cambiar tenantId | rechazado             |
| API-PU-ARC-001 | POST `/{id}/archive` | Archivar válida           | 200                   |
| API-PU-ARC-002 | POST `/{id}/archive` | Ya archivada              | 409/no-op documentado |

---

# 14. Pruebas API — Persons

## 14.1. Listar personas

| ID               | Caso                       | Resultado esperado |
| ---------------- | -------------------------- | ------------------ |
| API-PER-LIST-001 | TenantAdmin lista personas | 200                |
| API-PER-LIST-002 | Sin permiso                | 403                |
| API-PER-LIST-003 | No incluye Tenant B        | pasa               |
| API-PER-LIST-004 | Identificación enmascarada | pasa               |
| API-PER-LIST-005 | Filtro search              | correcto           |

---

## 14.2. Crear persona

| ID                 | Caso                                  | Resultado esperado         |
| ------------------ | ------------------------------------- | -------------------------- |
| API-PER-CREATE-001 | Crear persona válida                  | 201                        |
| API-PER-CREATE-002 | Identificación duplicada mismo tenant | 409                        |
| API-PER-CREATE-003 | Identificación duplicada otro tenant  | 201                        |
| API-PER-CREATE-004 | Payload inválido                      | 422                        |
| API-PER-CREATE-005 | Sin permiso                           | 403                        |
| API-PER-CREATE-006 | Datos sensibles no aceptados          | 422 o ignorado documentado |

---

## 14.3. Vincular usuario a persona

Endpoint:

```text id="em5m9w"
POST /api/v1/tenant/persons/{personId}/link-user
```

| ID               | Caso                                     | Resultado esperado |
| ---------------- | ---------------------------------------- | ------------------ |
| API-PER-LINK-001 | Vincular UserProfile válido              | 200                |
| API-PER-LINK-002 | Persona de otro tenant                   | 403/404            |
| API-PER-LINK-003 | UserProfile inexistente                  | 404                |
| API-PER-LINK-004 | UserProfile ya vinculado en mismo tenant | 409                |
| API-PER-LINK-005 | Sin permiso                              | 403                |
| API-PER-LINK-006 | Auditoría generada                       | pasa               |
| API-PER-LINK-007 | `.own` funciona luego de vincular        | pasa               |

---

# 15. Pruebas API — Legal Entities

| ID         | Caso                                  | Resultado esperado |
| ---------- | ------------------------------------- | ------------------ |
| API-LE-001 | Crear entidad válida                  | 201                |
| API-LE-002 | Identificación duplicada mismo tenant | 409                |
| API-LE-003 | Identificación duplicada otro tenant  | 201                |
| API-LE-004 | Listar entidades                      | 200                |
| API-LE-005 | Consultar entidad otro tenant         | 403/404            |
| API-LE-006 | Archivar entidad                      | 200                |

---

# 16. Pruebas API — Property Ownerships

| ID          | Caso                              | Resultado esperado |
| ----------- | --------------------------------- | ------------------ |
| API-OWN-001 | Crear ownership con persona       | 201                |
| API-OWN-002 | Crear ownership con legal entity  | 201                |
| API-OWN-003 | Enviar personId y legalEntityId   | 422                |
| API-OWN-004 | No enviar owner                   | 422                |
| API-OWN-005 | Unidad de otro tenant             | 403/422            |
| API-OWN-006 | Persona de otro tenant            | 403/422            |
| API-OWN-007 | Porcentaje inválido               | 422                |
| API-OWN-008 | Listar ownerships por unidad      | 200                |
| API-OWN-009 | Finalizar ownership activo        | 200                |
| API-OWN-010 | Finalizar ownership ya finalizado | 409                |
| API-OWN-011 | Historial conserva registro       | pasa               |

---

# 17. Pruebas API — Residencies

| ID          | Caso                           | Resultado esperado |
| ----------- | ------------------------------ | ------------------ |
| API-RES-001 | Crear residencia válida        | 201                |
| API-RES-002 | Persona de otro tenant         | 403/422            |
| API-RES-003 | Unidad de otro tenant          | 403/422            |
| API-RES-004 | Listar residencias por unidad  | 200                |
| API-RES-005 | Listar residencias por persona | 200                |
| API-RES-006 | Finalizar residencia activa    | 200                |
| API-RES-007 | Finalizar residencia ya ended  | 409                |
| API-RES-008 | Historial conserva registro    | pasa               |

---

# 18. Pruebas API — Leases

| ID            | Caso                                    | Resultado esperado                   |
| ------------- | --------------------------------------- | ------------------------------------ |
| API-LEASE-001 | Crear lease válido con ownerPerson      | 201                                  |
| API-LEASE-002 | Crear lease válido con ownerLegalEntity | 201                                  |
| API-LEASE-003 | Enviar ambos owners                     | 422                                  |
| API-LEASE-004 | Enviar sin owner                        | 422                                  |
| API-LEASE-005 | TenantPerson de otro tenant             | 403/422                              |
| API-LEASE-006 | Fechas inválidas                        | 422                                  |
| API-LEASE-007 | Finalizar lease                         | 200                                  |
| API-LEASE-008 | No admite valores monetarios            | campo rechazado/ignorado documentado |

---

# 19. Pruebas API — Vehicles, Pets and Emergency Contacts

## 19.1. Vehicles

| ID          | Caso                         | Resultado esperado |
| ----------- | ---------------------------- | ------------------ |
| API-VEH-001 | Crear vehículo válido        | 201                |
| API-VEH-002 | Sin persona ni unidad        | 422                |
| API-VEH-003 | Placa duplicada mismo tenant | 409                |
| API-VEH-004 | Placa duplicada otro tenant  | 201                |
| API-VEH-005 | Persona de otro tenant       | 403/422            |
| API-VEH-006 | Unidad de otro tenant        | 403/422            |
| API-VEH-007 | Archivar vehículo            | 200                |

---

## 19.2. Pets

| ID          | Caso                   | Resultado esperado |
| ----------- | ---------------------- | ------------------ |
| API-PET-001 | Crear mascota válida   | 201                |
| API-PET-002 | Sin persona ni unidad  | 422                |
| API-PET-003 | Persona de otro tenant | 403/422            |
| API-PET-004 | Unidad de otro tenant  | 403/422            |
| API-PET-005 | Archivar mascota       | 200                |

---

## 19.3. Emergency Contacts

| ID         | Caso                        | Resultado esperado |
| ---------- | --------------------------- | ------------------ |
| API-EC-001 | Crear contacto válido       | 201                |
| API-EC-002 | Persona de otro tenant      | 403/422            |
| API-EC-003 | Teléfono ausente            | 422                |
| API-EC-004 | Listar contactos de persona | 200                |
| API-EC-005 | Archivar contacto           | 200                |

---

# 20. Pruebas API — Own Resources

## 20.1. `/me/person`

| ID              | Caso                           | Resultado esperado |
| --------------- | ------------------------------ | ------------------ |
| API-OWN-PER-001 | Usuario con Person vinculada   | 200                |
| API-OWN-PER-002 | Usuario sin Person vinculada   | 403                |
| API-OWN-PER-003 | Usuario disabled               | 403                |
| API-OWN-PER-004 | Sin permiso `persons.read.own` | 403                |

---

## 20.2. `/me/property-units`

| ID             | Caso                                 | Resultado esperado |
| -------------- | ------------------------------------ | ------------------ |
| API-OWN-PU-001 | Propietario consulta sus unidades    | 200                |
| API-OWN-PU-002 | Residente consulta unidad donde vive | 200                |
| API-OWN-PU-003 | No devuelve unidad ajena             | pasa               |
| API-OWN-PU-004 | No devuelve unidad de otro tenant    | pasa               |
| API-OWN-PU-005 | Sin permiso `.own`                   | 403                |

---

## 20.3. `/me/residencies`

| ID              | Caso                                         | Resultado esperado           |
| --------------- | -------------------------------------------- | ---------------------------- |
| API-OWN-RES-001 | Residente consulta residencia activa         | 200                          |
| API-OWN-RES-002 | No devuelve residencias de otra persona      | pasa                         |
| API-OWN-RES-003 | Relación ended no aparece en vista operativa | pasa o histórico documentado |

---

## 20.4. `/me/vehicles`, `/me/pets`, `/me/emergency-contacts`

| ID               | Caso                           | Resultado esperado |
| ---------------- | ------------------------------ | ------------------ |
| API-OWN-COMP-001 | Usuario consulta sus vehículos | 200                |
| API-OWN-COMP-002 | Usuario no ve vehículo ajeno   | pasa               |
| API-OWN-COMP-003 | Usuario consulta sus mascotas  | 200                |
| API-OWN-COMP-004 | Usuario no ve mascota ajena    | pasa               |
| API-OWN-COMP-005 | Usuario consulta sus contactos | 200                |
| API-OWN-COMP-006 | Usuario no ve contactos ajenos | pasa               |

---

# 21. Pruebas de autorización

## 21.1. Matriz administrativa

| ID           | Usuario                  | Endpoint                      | Resultado |
| ------------ | ------------------------ | ----------------------------- | --------- |
| AUTH-ADM-001 | TenantAdminA             | POST `/tenant/property-units` | 201       |
| AUTH-ADM-002 | ResidentA                | POST `/tenant/property-units` | 403       |
| AUTH-ADM-003 | TenantStaffA con permiso | GET `/tenant/persons`         | 200       |
| AUTH-ADM-004 | UserWithoutPermission    | GET `/tenant/persons`         | 403       |
| AUTH-ADM-005 | UserWithoutMembership    | GET `/tenant/property-units`  | 403       |
| AUTH-ADM-006 | Anonymous                | GET `/tenant/property-units`  | 401       |
| AUTH-ADM-007 | DisabledUser             | GET `/tenant/property-units`  | 403       |

---

## 21.2. Tenant suspendido o archivado

| ID              | Caso                                                         | Resultado esperado                   |
| --------------- | ------------------------------------------------------------ | ------------------------------------ |
| AUTH-TENANT-001 | Crear persona en tenant suspended                            | 403                                  |
| AUTH-TENANT-002 | Crear unidad en tenant suspended                             | 403                                  |
| AUTH-TENANT-003 | Consultar histórico en tenant suspended con permiso especial | permitido o bloqueado según política |
| AUTH-TENANT-004 | Operar tenant archived                                       | 403                                  |

---

# 22. Pruebas multitenant

| ID        | Caso                                          | Resultado esperado |
| --------- | --------------------------------------------- | ------------------ |
| MT-RP-001 | Tenant A no lista unidades B                  | pasa               |
| MT-RP-002 | Tenant A no lista personas B                  | pasa               |
| MT-RP-003 | Tenant A no consulta unidad B por ID          | 403/404            |
| MT-RP-004 | Tenant A no consulta persona B por ID         | 403/404            |
| MT-RP-005 | Tenant A no crea ownership con unidad B       | rechazado          |
| MT-RP-006 | Tenant A no crea ownership con persona B      | rechazado          |
| MT-RP-007 | Tenant A no crea residency con unidad B       | rechazado          |
| MT-RP-008 | Tenant A no crea residency con persona B      | rechazado          |
| MT-RP-009 | Vehicle no mezcla persona A con unidad B      | rechazado          |
| MT-RP-010 | Pet no mezcla persona A con unidad B          | rechazado          |
| MT-RP-011 | EmergencyContact no usa person de otro tenant | rechazado          |
| MT-RP-012 | Own resources no devuelven Tenant B           | pasa               |

---

# 23. Pruebas de seguridad

## 23.1. Payload validation

| ID              | Caso                                       | Resultado esperado             |
| --------------- | ------------------------------------------ | ------------------------------ |
| SEC-PAYLOAD-001 | Strings demasiado largos                   | 422                            |
| SEC-PAYLOAD-002 | Script en displayName                      | 422 o sanitización documentada |
| SEC-PAYLOAD-003 | SQL-like input en search                   | seguro                         |
| SEC-PAYLOAD-004 | IDs malformados                            | 422                            |
| SEC-PAYLOAD-005 | Campos no permitidos como tenantId en body | rechazado/ignorado documentado |
| SEC-PAYLOAD-006 | Campo monetario en Lease MVP               | rechazado/ignorado documentado |

---

## 23.2. Privacidad de datos personales

| ID           | Caso                                         | Resultado esperado        |
| ------------ | -------------------------------------------- | ------------------------- |
| SEC-PRIV-001 | identificationNumber en listado              | enmascarado o no expuesto |
| SEC-PRIV-002 | Logs no contienen identificación completa    | pasa                      |
| SEC-PRIV-003 | Logs no contienen payload completo           | pasa                      |
| SEC-PRIV-004 | Usuario `.own` no ve datos de otro residente | pasa                      |
| SEC-PRIV-005 | Seeds no usan datos reales                   | pasa                      |

---

## 23.3. Historial

| ID           | Caso                                  | Resultado esperado |
| ------------ | ------------------------------------- | ------------------ |
| SEC-HIST-001 | End ownership no elimina registro     | pasa               |
| SEC-HIST-002 | End residency no elimina registro     | pasa               |
| SEC-HIST-003 | Archive unit no elimina ownerships    | pasa               |
| SEC-HIST-004 | Archive person no elimina residencies | pasa               |
| SEC-HIST-005 | No existe DELETE físico ordinario     | pasa               |

---

# 24. Pruebas de auditoría

| ID         | Operación                | Evento auditable esperado   |
| ---------- | ------------------------ | --------------------------- |
| AUD-RP-001 | Crear persona            | `person.created`            |
| AUD-RP-002 | Actualizar persona       | `person.updated`            |
| AUD-RP-003 | Archivar persona         | `person.archived`           |
| AUD-RP-004 | Vincular usuario-persona | `person.userLinked`         |
| AUD-RP-005 | Crear unidad             | `propertyUnit.created`      |
| AUD-RP-006 | Actualizar unidad        | `propertyUnit.updated`      |
| AUD-RP-007 | Archivar unidad          | `propertyUnit.archived`     |
| AUD-RP-008 | Crear ownership          | `propertyOwnership.created` |
| AUD-RP-009 | Finalizar ownership      | `propertyOwnership.ended`   |
| AUD-RP-010 | Crear residency          | `residency.created`         |
| AUD-RP-011 | Finalizar residency      | `residency.ended`           |
| AUD-RP-012 | Crear lease              | `lease.created`             |
| AUD-RP-013 | Finalizar lease          | `lease.ended`               |
| AUD-RP-014 | Crear vehicle            | `vehicle.created`           |
| AUD-RP-015 | Crear pet                | `pet.created`               |
| AUD-RP-016 | Crear emergency contact  | `emergencyContact.created`  |

Campos mínimos:

```text id="wj7ppm"
tenantId
actorUserId
action
resourceType
resourceId
result
traceId
occurredAt
```

---

# 25. Pruebas de eventos

| ID         | Operación                | Evento esperado            |
| ---------- | ------------------------ | -------------------------- |
| EVT-RP-001 | Crear persona            | `PersonCreated`            |
| EVT-RP-002 | Vincular usuario-persona | `UserLinkedToPerson`       |
| EVT-RP-003 | Crear unidad             | `PropertyUnitCreated`      |
| EVT-RP-004 | Crear ownership          | `PropertyOwnershipCreated` |
| EVT-RP-005 | Finalizar ownership      | `PropertyOwnershipEnded`   |
| EVT-RP-006 | Crear residency          | `ResidencyCreated`         |
| EVT-RP-007 | Finalizar residency      | `ResidencyEnded`           |
| EVT-RP-008 | Crear lease              | `LeaseCreated`             |
| EVT-RP-009 | Crear vehicle            | `VehicleRegistered`        |
| EVT-RP-010 | Crear pet                | `PetRegistered`            |

Eventos no deben incluir:

```text id="vvmwoz"
identificationNumber completo
payload personal completo
tokens
datos sensibles innecesarios
```

---

# 26. Pruebas de observabilidad

| ID         | Caso                                         | Resultado esperado |
| ---------- | -------------------------------------------- | ------------------ |
| OBS-RP-001 | Request exitoso                              | log con traceId    |
| OBS-RP-002 | Cross-tenant denied                          | log con errorCode  |
| OBS-RP-003 | Own access denied                            | métrica incrementa |
| OBS-RP-004 | Crear unidad                                 | métrica incrementa |
| OBS-RP-005 | Crear persona                                | métrica incrementa |
| OBS-RP-006 | Error devuelve traceId                       | pasa               |
| OBS-RP-007 | Auditoría contiene traceId                   | pasa               |
| OBS-RP-008 | Logs no contienen datos personales completos | pasa               |

Métricas esperadas:

```text id="jg6lcj"
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

---

# 27. Pruebas OpenAPI

Validar que OpenAPI incluya:

* Property Units API;
* Persons API;
* Legal Entities API;
* Property Ownerships API;
* Residencies API;
* Leases API;
* Vehicles API;
* Pets API;
* Emergency Contacts API;
* Own Resources API;
* permisos requeridos;
* errores estándar;
* ejemplos;
* security schemes;
* extensiones `x-required-permission`;
* extensiones `x-own-resource-policy`.

| ID          | Caso                                        | Resultado esperado |
| ----------- | ------------------------------------------- | ------------------ |
| OAPI-RP-001 | Endpoints administrativos documentados      | pasa               |
| OAPI-RP-002 | Endpoints `.own` documentados               | pasa               |
| OAPI-RP-003 | Endpoints privados tienen security          | pasa               |
| OAPI-RP-004 | Permisos documentados                       | pasa               |
| OAPI-RP-005 | Errores documentados                        | pasa               |
| OAPI-RP-006 | DTOs coinciden con contrato                 | pasa               |
| OAPI-RP-007 | Campos sensibles no aparecen donde no deben | pasa               |

---

# 28. Smoke tests

Smoke tests post-deploy:

| ID           | Caso                                          | Resultado esperado |
| ------------ | --------------------------------------------- | ------------------ |
| SMOKE-RP-001 | `GET /api/v1/health`                          | 200                |
| SMOKE-RP-002 | `GET /api/v1/tenant/property-units` sin token | 401                |
| SMOKE-RP-003 | `GET /api/v1/me/person` sin token             | 401                |
| SMOKE-RP-004 | Usuario autorizado lista unidades             | 200                |
| SMOKE-RP-005 | Usuario sin permiso recibe 403                | 403                |
| SMOKE-RP-006 | Error contiene traceId                        | pasa               |

No ejecutar operaciones destructivas en producción.

---

# 29. Pruebas de concurrencia básica

| ID          | Caso                                                    | Resultado esperado     |
| ----------- | ------------------------------------------------------- | ---------------------- |
| CONC-RP-001 | Crear dos unidades mismo código simultáneamente         | una crea, otra 409     |
| CONC-RP-002 | Crear dos personas misma identificación simultáneamente | una crea, otra 409     |
| CONC-RP-003 | Finalizar mismo ownership dos veces                     | una finaliza, otra 409 |
| CONC-RP-004 | Finalizar misma residency dos veces                     | una finaliza, otra 409 |
| CONC-RP-005 | Crear vehicle misma placa simultáneamente               | una crea, otra 409     |

---

# 30. Pruebas de idempotencia

| ID           | Caso                              | Resultado esperado      |
| ------------ | --------------------------------- | ----------------------- |
| IDEMP-RP-001 | Ejecutar seeds dos veces          | no duplica              |
| IDEMP-RP-002 | Archivar unidad ya archivada      | 409 o no-op documentado |
| IDEMP-RP-003 | Finalizar ownership ya ended      | 409                     |
| IDEMP-RP-004 | Finalizar residency ya ended      | 409                     |
| IDEMP-RP-005 | Vincular UserProfile ya vinculado | 409 o no-op documentado |

---

# 31. Organización de archivos de prueba

```text id="gok0xr"
apps/api/src/modules/residents-properties/tests/
├── unit/
│   ├── property-unit-code.vo.spec.ts
│   ├── property-unit-type.vo.spec.ts
│   ├── identification-type.vo.spec.ts
│   ├── identification-number.vo.spec.ts
│   ├── ownership-percentage.vo.spec.ts
│   ├── date-range.vo.spec.ts
│   ├── vehicle-plate.vo.spec.ts
│   ├── property-unit.entity.spec.ts
│   ├── person.entity.spec.ts
│   ├── legal-entity.entity.spec.ts
│   ├── property-ownership.entity.spec.ts
│   ├── residency.entity.spec.ts
│   ├── lease.entity.spec.ts
│   ├── vehicle.entity.spec.ts
│   └── pet.entity.spec.ts
│
├── application/
│   ├── own-resource-policy.service.spec.ts
│   ├── property-unit-policy.service.spec.ts
│   ├── person-policy.service.spec.ts
│   ├── ownership-policy.service.spec.ts
│   ├── residency-policy.service.spec.ts
│   ├── create-property-unit.use-case.spec.ts
│   ├── create-person.use-case.spec.ts
│   ├── link-user-to-person.use-case.spec.ts
│   ├── create-property-ownership.use-case.spec.ts
│   ├── end-property-ownership.use-case.spec.ts
│   ├── create-residency.use-case.spec.ts
│   ├── end-residency.use-case.spec.ts
│   ├── create-vehicle.use-case.spec.ts
│   ├── create-pet.use-case.spec.ts
│   └── own-resources.use-case.spec.ts
│
├── integration/
│   ├── 003-create-residents-properties.migration.spec.ts
│   ├── property-unit.repository.integration.spec.ts
│   ├── person.repository.integration.spec.ts
│   ├── legal-entity.repository.integration.spec.ts
│   ├── property-ownership.repository.integration.spec.ts
│   ├── residency.repository.integration.spec.ts
│   ├── lease.repository.integration.spec.ts
│   ├── vehicle.repository.integration.spec.ts
│   ├── pet.repository.integration.spec.ts
│   ├── emergency-contact.repository.integration.spec.ts
│   └── residents-properties.seeds.integration.spec.ts
│
├── api/
│   ├── property-units.api.spec.ts
│   ├── persons.api.spec.ts
│   ├── legal-entities.api.spec.ts
│   ├── property-ownerships.api.spec.ts
│   ├── residencies.api.spec.ts
│   ├── leases.api.spec.ts
│   ├── vehicles.api.spec.ts
│   ├── pets.api.spec.ts
│   ├── emergency-contacts.api.spec.ts
│   └── own-resources.api.spec.ts
│
├── authorization/
│   ├── residents-properties.authorization.spec.ts
│   └── own-resources.authorization.spec.ts
│
├── multitenancy/
│   └── residents-properties.multitenancy.spec.ts
│
├── security/
│   ├── residents-properties-payload.security.spec.ts
│   ├── residents-properties-privacy.security.spec.ts
│   ├── residents-properties-history.security.spec.ts
│   └── residents-properties-logging.security.spec.ts
│
└── openapi/
    └── residents-properties.openapi.spec.ts
```

---

# 32. Comandos esperados

Comandos específicos sugeridos:

```bash id="fh03n7"
npm run test:residents-properties
npm run test:residents-properties:unit
npm run test:residents-properties:application
npm run test:residents-properties:integration
npm run test:residents-properties:api
npm run test:residents-properties:authorization
npm run test:residents-properties:multitenancy
npm run test:residents-properties:security
```

Comandos generales:

```bash id="xdidcr"
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

---

# 33. Requisitos para CI

En pull request deben correr como mínimo:

```text id="m0lg9x"
lint
typecheck
unit tests
application tests
integration tests críticos
API tests críticos
authorization tests
multitenancy tests
security tests críticos
OpenAPI validation
build
```

Antes de producción:

```text id="u15il1"
full test suite
migration tests
seed tests
authorization tests completos
multitenancy tests completos
privacy tests
smoke tests staging
```

---

# 34. Gates de calidad

No se permite merge si falla:

* unique tenant+code;
* tenant isolation;
* `.own` access;
* cross-tenant reference rejection;
* UserProfile ↔ Person linking;
* ownership XOR;
* lease owner XOR;
* no physical delete for history;
* payload validation;
* privacy/logging tests;
* authorization tests;
* OpenAPI validation.

---

# 35. Matriz de trazabilidad

| Requisito                              | Pruebas asociadas         |
| -------------------------------------- | ------------------------- |
| FR-001 Crear unidad                    | APP-PU, API-PU-CREATE     |
| FR-002 Actualizar unidad               | API-PU-UPD                |
| FR-003 Listar unidades                 | API-PU-LIST               |
| FR-004 Consultar unidad                | API-PU-GET                |
| FR-005 Crear persona                   | APP-PER, API-PER-CREATE   |
| FR-006 Actualizar persona              | API-PER                   |
| FR-007 Listar personas                 | API-PER-LIST              |
| FR-008 Vincular UserProfile con Person | APP-PER-007, API-PER-LINK |
| FR-009 Crear entidad jurídica          | APP-LE, API-LE            |
| FR-010 Registrar propiedad             | APP-OWN, API-OWN          |
| FR-011 Finalizar propiedad             | APP-OWN-008, API-OWN-009  |
| FR-012 Registrar residencia            | APP-RES, API-RES          |
| FR-013 Finalizar residencia            | APP-RES-004, API-RES-006  |
| FR-014 Registrar arriendo              | APP-LEASE, API-LEASE      |
| FR-015 Registrar vehículo              | APP-VEH, API-VEH          |
| FR-016 Registrar mascota               | APP-PET, API-PET          |
| FR-017 Registrar contacto emergencia   | APP-EC, API-EC            |
| FR-018 Consultar datos propios         | API-OWN, SRV-OWN          |
| FR-019 Auditar cambios                 | AUD-RP                    |
| FR-020 Validar aislamiento multitenant | MT-RP                     |

---

# 36. Riesgos cubiertos

| Riesgo                             | Pruebas                         |
| ---------------------------------- | ------------------------------- |
| Usuario ve datos de otro tenant    | MT-RP                           |
| Usuario ve datos de otro residente | API-OWN, SEC-PRIV               |
| Propietario ve unidad ajena        | SRV-OWN, API-OWN-PU             |
| Unidad duplicada                   | APP-PU-002, API-PU-CREATE-002   |
| Persona duplicada                  | APP-PER-003, API-PER-CREATE-002 |
| Ownership mezcla tenants           | APP-OWN-005/006, MT-RP          |
| Residency mezcla tenants           | APP-RES-002/003, MT-RP          |
| Historial sobrescrito              | SEC-HIST                        |
| Datos personales en logs           | SEC-PRIV, OBS                   |
| Usuario `.own` sin vínculo         | SRV-OWN-002, API-OWN-PER-002    |

---

# 37. Criterios de salida

El módulo `003-residents-properties` puede considerarse probado si:

* todas las pruebas unitarias pasan;
* pruebas de policies pasan;
* pruebas de casos de uso pasan;
* migración validada;
* seeds idempotentes;
* API tests pasan;
* authorization tests pasan;
* own access tests pasan;
* multitenancy tests pasan;
* security/privacy tests críticos pasan;
* audit tests pasan;
* event tests pasan;
* OpenAPI actualizado;
* smoke tests pasan;
* no hay acceso cross-tenant;
* no hay fuga de datos personales en logs;
* no hay eliminación física de historial.

---

# 38. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="0h3vbs"
- Validación oficial de cédula/RUC diferida.
- Documentos legales adjuntos diferidos.
- Firma electrónica diferida.
- Control de visitas diferido.
- Parqueaderos avanzados diferidos.
- Aprobación de cambios solicitados por residentes diferida.
- Datos de menores diferidos salvo política específica.
- Módulos financieros diferidos.
```

Estos pendientes no bloquean `003-residents-properties`.

---

## 39. Decisión final del test plan

El módulo `003-residents-properties` deberá probarse con unit tests, application tests, integration tests, migration tests, API tests, authorization tests, own access tests, multitenancy tests, security tests, privacy tests, audit tests, event tests, OpenAPI tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="x4l7m3"
- tenant_id obligatorio;
- no acceso cross-tenant;
- integridad unidad-persona-tenant;
- UserProfile vinculado a Person;
- acceso .own correcto;
- código único de unidad por tenant;
- identificación única por tenant;
- historial de propiedad;
- historial de residencia;
- no eliminación física;
- privacidad de datos personales;
- auditoría de cambios;
- preparación para módulos financieros.
```

Ninguna implementación de este módulo debe aceptarse si permite que un usuario acceda a personas, unidades, propietarios, residentes, vehículos, mascotas o contactos de otro tenant; si permite acceso `.own` sin vínculo válido; si sobrescribe historial de propiedad/residencia; o si expone datos personales innecesarios.
