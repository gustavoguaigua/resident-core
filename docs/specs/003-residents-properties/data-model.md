# Data Model — Spec 003 Residents, Owners, Tenants and Property Units

## 1. Información del documento

| Campo                  | Valor                                               |
| ---------------------- | --------------------------------------------------- |
| Proyecto               | RESIDENT Core                                       |
| Spec ID                | 003                                                 |
| Módulo                 | Residents and Properties                            |
| Documento              | Data Model                                          |
| Ruta                   | `docs/specs/003-residents-properties/data-model.md` |
| Versión                | 0.1                                                 |
| Estado                 | Borrador inicial                                    |
| Fecha                  | 2026-07-13                                          |
| Documento base         | `docs/specs/003-residents-properties/spec.md`       |
| Plan técnico           | `docs/specs/003-residents-properties/plan.md`       |
| Depende de             | `001-tenants`, `002-users-roles`                    |
| Base de datos          | PostgreSQL                                          |
| ORM                    | Prisma                                              |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`       |
| Autorización           | Tenant-aware RBAC + `.own` policies                 |

---

## 2. Propósito

Este documento define el modelo de datos para la spec `003-residents-properties`.

El objetivo es establecer:

* tablas;
* columnas;
* enums;
* relaciones;
* constraints;
* índices;
* modelo Prisma preliminar;
* reglas de integridad;
* reglas multitenant;
* reglas de privacidad;
* reglas de trazabilidad histórica;
* seeds iniciales;
* compatibilidad con módulos financieros futuros.

Este modelo será la base del padrón residencial de RESIDENT Core.

---

## 3. Principios del modelo

### 3.1. Tenant como frontera de datos

Todo registro operativo del módulo debe incluir:

```text id="77knmd"
tenant_id
```

Aplica a:

```text id="mllhbm"
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

Regla:

```text id="dmb6qr"
Nunca se debe consultar, actualizar o relacionar un recurso sin validar tenant_id.
```

---

### 3.2. Separación entre usuario y persona

`UserProfile` representa identidad digital.

`Person` representa persona natural dentro de un tenant.

Relación:

```text id="djjv4q"
UserProfile 1 ── 0..N Person
```

En MVP se recomienda permitir que un `UserProfile` pueda vincularse a personas en distintos tenants, porque un mismo usuario podría ser propietario o residente en más de un conjunto.

Regla:

```text id="hz6duo"
El acceso .own se resuelve mediante UserProfile → Person → relación con unidad.
```

---

### 3.3. Persona puede existir sin usuario

No toda persona registrada debe tener cuenta digital.

Ejemplos:

```text id="9z50p7"
propietario sin acceso digital
ocupante familiar
contacto de emergencia
arrendatario aún no invitado
representante legal
```

---

### 3.4. Historial antes que sobrescritura

No se debe sobrescribir directamente:

* propietarios anteriores;
* residentes anteriores;
* arriendos anteriores.

Se debe usar:

```text id="nf3djb"
start_date
end_date
status
```

Regla:

```text id="b2lqn4"
La historia de propiedad y residencia debe ser consultable y auditable.
```

---

### 3.5. No eliminación física normal

No se debe eliminar físicamente información con relevancia histórica.

Usar:

* `status`;
* `archived_at`;
* `end_date`;
* auditoría.

---

### 3.6. Datos personales mínimos

Este módulo almacena datos personales. Por tanto:

* no recolectar datos innecesarios;
* no almacenar datos sensibles en MVP;
* no registrar datos completos en logs;
* no usar datos reales en seeds;
* no exponer datos de otro tenant;
* no exponer datos de otra persona sin permiso.

---

## 4. Entidades persistentes

El módulo define las siguientes entidades persistentes:

```text id="d2rv8k"
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

Relación conceptual:

```text id="25v419"
Tenant
├── PropertyUnit
│   ├── PropertyOwnership
│   ├── Residency
│   ├── Lease
│   ├── Vehicle
│   └── Pet
│
├── Person
│   ├── PropertyOwnership
│   ├── Residency
│   ├── Lease
│   ├── Vehicle
│   ├── Pet
│   └── EmergencyContact
│
└── LegalEntity
    ├── PropertyOwnership
    └── Lease
```

Relación con usuarios:

```text id="dn4t3v"
UserProfile
└── Person
    ├── PropertyOwnership
    ├── Residency
    ├── Vehicle
    ├── Pet
    └── EmergencyContact
```

---

## 5. Tabla `persons`

### 5.1. Propósito

Representa una persona natural dentro de un tenant.

Puede actuar como:

* propietario;
* residente;
* arrendatario;
* ocupante;
* contacto operativo;
* representante;
* usuario vinculado.

---

### 5.2. Nombre físico

```text id="3jzu3b"
persons
```

---

### 5.3. Columnas

| Columna                 | Tipo lógico | Requerido | Default | Descripción               |
| ----------------------- | ----------: | --------: | ------: | ------------------------- |
| `id`                    | UUID/string |        Sí |    uuid | Identificador interno     |
| `tenant_id`             | UUID/string |        Sí |       — | Tenant propietario        |
| `user_profile_id`       | UUID/string |        No |    null | Usuario digital vinculado |
| `first_name`            |      string |        No |    null | Nombres                   |
| `last_name`             |      string |        No |    null | Apellidos                 |
| `display_name`          |      string |        Sí |       — | Nombre visible            |
| `identification_type`   |        enum |        No |    null | Tipo de identificación    |
| `identification_number` |      string |        No |    null | Número de identificación  |
| `email`                 |      string |        No |    null | Email de contacto         |
| `phone`                 |      string |        No |    null | Teléfono                  |
| `whatsapp`              |      string |        No |    null | WhatsApp                  |
| `status`                |        enum |        Sí |  active | Estado de persona         |
| `created_at`            |   timestamp |        Sí |     now | Fecha de creación         |
| `updated_at`            |   timestamp |        Sí |    auto | Fecha de actualización    |
| `archived_at`           |   timestamp |        No |    null | Fecha de archivado        |

---

### 5.4. Reglas

* `tenant_id` es obligatorio.
* `display_name` es obligatorio.
* `user_profile_id` es opcional.
* Una persona puede existir sin usuario.
* Una persona puede vincularse a un `UserProfile`.
* Si `identification_number` existe, debe ser único dentro del tenant para el mismo tipo.
* No registrar datos sensibles innecesarios.
* No eliminar físicamente si tiene historial.

---

### 5.5. Índices

```text id="e8j4vq"
index persons_tenant_id_idx on persons(tenant_id)
index persons_user_profile_id_idx on persons(user_profile_id)
index persons_status_idx on persons(status)
index persons_display_name_idx on persons(display_name)
index persons_identification_idx on persons(tenant_id, identification_type, identification_number)
```

---

### 5.6. Unicidad

Regla deseada:

```text id="36vfxq"
unique(tenant_id, identification_type, identification_number)
where identification_number is not null
```

Si Prisma no permite expresarlo directamente, usar:

* validación en aplicación;
* índice parcial SQL manual en migración.

---

## 6. Tabla `legal_entities`

### 6.1. Propósito

Representa entidad jurídica vinculada a un tenant.

Puede actuar como propietaria o responsable de una unidad.

---

### 6.2. Nombre físico

```text id="v69kox"
legal_entities
```

---

### 6.3. Columnas

| Columna                     | Tipo lógico | Requerido | Default | Descripción                       |
| --------------------------- | ----------: | --------: | ------: | --------------------------------- |
| `id`                        | UUID/string |        Sí |    uuid | Identificador interno             |
| `tenant_id`                 | UUID/string |        Sí |       — | Tenant propietario                |
| `name`                      |      string |        Sí |       — | Nombre legal o comercial          |
| `tax_identification_type`   |        enum |        No |    null | Tipo de identificación tributaria |
| `tax_identification_number` |      string |        No |    null | Número tributario                 |
| `email`                     |      string |        No |    null | Email                             |
| `phone`                     |      string |        No |    null | Teléfono                          |
| `address`                   |      string |        No |    null | Dirección                         |
| `status`                    |        enum |        Sí |  active | Estado                            |
| `created_at`                |   timestamp |        Sí |     now | Fecha de creación                 |
| `updated_at`                |   timestamp |        Sí |    auto | Fecha de actualización            |
| `archived_at`               |   timestamp |        No |    null | Fecha de archivado                |

---

### 6.4. Reglas

* Pertenece a un tenant.
* `name` es obligatorio.
* Identificación tributaria única por tenant si existe.
* No eliminar físicamente si tiene propiedad histórica.

---

### 6.5. Índices

```text id="w5l9vq"
index legal_entities_tenant_id_idx on legal_entities(tenant_id)
index legal_entities_status_idx on legal_entities(status)
index legal_entities_name_idx on legal_entities(name)
index legal_entities_tax_identification_idx on legal_entities(tenant_id, tax_identification_type, tax_identification_number)
```

---

## 7. Tabla `property_units`

### 7.1. Propósito

Representa una unidad habitacional o registrable dentro del tenant.

Puede ser:

* casa;
* departamento;
* suite;
* lote;
* parqueadero;
* bodega;
* local;
* unidad mixta.

---

### 7.2. Nombre físico

```text id="ij6rx8"
property_units
```

---

### 7.3. Columnas

| Columna             | Tipo lógico | Requerido | Default | Descripción                    |
| ------------------- | ----------: | --------: | ------: | ------------------------------ |
| `id`                | UUID/string |        Sí |    uuid | Identificador interno          |
| `tenant_id`         | UUID/string |        Sí |       — | Tenant propietario             |
| `code`              |      string |        Sí |       — | Código único dentro del tenant |
| `name`              |      string |        No |    null | Nombre descriptivo             |
| `type`              |        enum |        Sí |   house | Tipo de unidad                 |
| `block`             |      string |        No |    null | Bloque, manzana, torre         |
| `floor`             |      string |        No |    null | Piso                           |
| `address_reference` |      string |        No |    null | Referencia interna             |
| `area_m2`           |     decimal |        No |    null | Área en metros cuadrados       |
| `status`            |        enum |        Sí |  active | Estado                         |
| `created_at`        |   timestamp |        Sí |     now | Fecha de creación              |
| `updated_at`        |   timestamp |        Sí |    auto | Fecha de actualización         |
| `archived_at`       |   timestamp |        No |    null | Fecha de archivado             |

---

### 7.4. Reglas

* `tenant_id` obligatorio.
* `code` único por tenant.
* `area_m2` debe ser positivo si existe.
* No eliminar físicamente si tiene historial.
* Será base para cargos, alícuotas, pagos y estados de cuenta.

---

### 7.5. Índices

```text id="1eux47"
unique index property_units_tenant_code_unique on property_units(tenant_id, code)
index property_units_tenant_id_idx on property_units(tenant_id)
index property_units_status_idx on property_units(status)
index property_units_type_idx on property_units(type)
index property_units_block_idx on property_units(tenant_id, block)
```

---

## 8. Tabla `property_ownerships`

### 8.1. Propósito

Representa relación de propiedad entre una unidad y una persona o entidad jurídica.

Soporta:

* propiedad individual;
* copropiedad;
* propietario principal;
* historial de propiedad;
* propietarios activos e históricos.

---

### 8.2. Nombre físico

```text id="sqo9is"
property_ownerships
```

---

### 8.3. Columnas

| Columna                | Tipo lógico | Requerido | Default | Descripción            |
| ---------------------- | ----------: | --------: | ------: | ---------------------- |
| `id`                   | UUID/string |        Sí |    uuid | Identificador interno  |
| `tenant_id`            | UUID/string |        Sí |       — | Tenant                 |
| `property_unit_id`     | UUID/string |        Sí |       — | Unidad                 |
| `person_id`            | UUID/string |        No |    null | Propietario persona    |
| `legal_entity_id`      | UUID/string |        No |    null | Propietario entidad    |
| `ownership_type`       |        enum |        Sí |   owner | Tipo de propiedad      |
| `ownership_percentage` |     decimal |        No |    null | Porcentaje             |
| `is_primary`           |     boolean |        Sí |   false | Propietario principal  |
| `status`               |        enum |        Sí |  active | Estado                 |
| `start_date`           |        date |        Sí |       — | Inicio de vigencia     |
| `end_date`             |        date |        No |    null | Fin de vigencia        |
| `created_at`           |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`           |   timestamp |        Sí |    auto | Fecha de actualización |

---

### 8.4. Reglas

* Pertenece a un tenant.
* `property_unit_id` debe pertenecer al mismo tenant.
* Debe existir exactamente uno entre `person_id` y `legal_entity_id`.
* Si `person_id` existe, la persona debe pertenecer al mismo tenant.
* Si `legal_entity_id` existe, la entidad debe pertenecer al mismo tenant.
* `start_date` obligatorio.
* `end_date` debe ser mayor o igual a `start_date`.
* No sobrescribir historia.
* Finalizar propiedad usando `status = ended` y `end_date`.
* No eliminar físicamente.
* Si se usa porcentaje, debe estar entre 0 y 100.
* Si la validación estricta está activa, la suma de ownerships activos no debe exceder 100%.

---

### 8.5. Índices

```text id="mqmju2"
index property_ownerships_tenant_id_idx on property_ownerships(tenant_id)
index property_ownerships_property_unit_id_idx on property_ownerships(property_unit_id)
index property_ownerships_person_id_idx on property_ownerships(person_id)
index property_ownerships_legal_entity_id_idx on property_ownerships(legal_entity_id)
index property_ownerships_status_idx on property_ownerships(status)
index property_ownerships_active_unit_idx on property_ownerships(tenant_id, property_unit_id, status)
```

---

### 8.6. Constraints lógicas

Regla XOR:

```text id="5nekt3"
(person_id is not null and legal_entity_id is null)
or
(person_id is null and legal_entity_id is not null)
```

Prisma puede requerir validación en aplicación o SQL manual.

---

## 9. Tabla `residencies`

### 9.1. Propósito

Representa relación de residencia u ocupación entre persona y unidad.

Soporta:

* residente propietario;
* arrendatario;
* ocupante familiar;
* ocupante autorizado;
* residente principal;
* historial de ocupación.

---

### 9.2. Nombre físico

```text id="55vj43"
residencies
```

---

### 9.3. Columnas

| Columna               | Tipo lógico | Requerido |  Default | Descripción            |
| --------------------- | ----------: | --------: | -------: | ---------------------- |
| `id`                  | UUID/string |        Sí |     uuid | Identificador interno  |
| `tenant_id`           | UUID/string |        Sí |        — | Tenant                 |
| `property_unit_id`    | UUID/string |        Sí |        — | Unidad                 |
| `person_id`           | UUID/string |        Sí |        — | Persona residente      |
| `residency_type`      |        enum |        Sí | occupant | Tipo de residencia     |
| `is_primary_resident` |     boolean |        Sí |    false | Residente principal    |
| `status`              |        enum |        Sí |   active | Estado                 |
| `start_date`          |        date |        Sí |        — | Inicio de residencia   |
| `end_date`            |        date |        No |     null | Fin de residencia      |
| `created_at`          |   timestamp |        Sí |      now | Fecha de creación      |
| `updated_at`          |   timestamp |        Sí |     auto | Fecha de actualización |

---

### 9.4. Reglas

* Pertenece a un tenant.
* Persona y unidad deben pertenecer al mismo tenant.
* Puede haber varios residentes activos por unidad.
* Puede haber un residente principal por unidad si la regla se activa.
* No sobrescribir historial.
* Finalizar usando `status = ended` y `end_date`.
* No eliminar físicamente.

---

### 9.5. Índices

```text id="zd2cfo"
index residencies_tenant_id_idx on residencies(tenant_id)
index residencies_property_unit_id_idx on residencies(property_unit_id)
index residencies_person_id_idx on residencies(person_id)
index residencies_status_idx on residencies(status)
index residencies_active_unit_idx on residencies(tenant_id, property_unit_id, status)
index residencies_active_person_idx on residencies(tenant_id, person_id, status)
```

---

## 10. Tabla `leases`

### 10.1. Propósito

Representa relación básica de arriendo.

No gestiona documentos legales completos en MVP, pero permite registrar:

* unidad arrendada;
* propietario;
* arrendatario;
* fechas;
* estado.

---

### 10.2. Nombre físico

```text id="crd87s"
leases
```

---

### 10.3. Columnas

| Columna                 | Tipo lógico | Requerido | Default | Descripción            |
| ----------------------- | ----------: | --------: | ------: | ---------------------- |
| `id`                    | UUID/string |        Sí |    uuid | Identificador interno  |
| `tenant_id`             | UUID/string |        Sí |       — | Tenant                 |
| `property_unit_id`      | UUID/string |        Sí |       — | Unidad                 |
| `owner_person_id`       | UUID/string |        No |    null | Propietario persona    |
| `owner_legal_entity_id` | UUID/string |        No |    null | Propietario entidad    |
| `tenant_person_id`      | UUID/string |        Sí |       — | Arrendatario persona   |
| `status`                |        enum |        Sí |   draft | Estado                 |
| `start_date`            |        date |        Sí |       — | Fecha de inicio        |
| `end_date`              |        date |        No |    null | Fecha de fin           |
| `created_at`            |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`            |   timestamp |        Sí |    auto | Fecha de actualización |

---

### 10.4. Reglas

* Pertenece a un tenant.
* Unidad pertenece al mismo tenant.
* Arrendatario pertenece al mismo tenant.
* Debe existir exactamente uno entre `owner_person_id` y `owner_legal_entity_id`.
* Fechas deben ser válidas.
* No gestiona valores monetarios en MVP.
* No gestiona documentos adjuntos en MVP.

---

### 10.5. Índices

```text id="4vgbpt"
index leases_tenant_id_idx on leases(tenant_id)
index leases_property_unit_id_idx on leases(property_unit_id)
index leases_tenant_person_id_idx on leases(tenant_person_id)
index leases_owner_person_id_idx on leases(owner_person_id)
index leases_owner_legal_entity_id_idx on leases(owner_legal_entity_id)
index leases_status_idx on leases(status)
```

---

## 11. Tabla `vehicles`

### 11.1. Propósito

Representa vehículos asociados a una persona y/o unidad.

---

### 11.2. Nombre físico

```text id="uw9e80"
vehicles
```

---

### 11.3. Columnas

| Columna            | Tipo lógico | Requerido | Default | Descripción            |
| ------------------ | ----------: | --------: | ------: | ---------------------- |
| `id`               | UUID/string |        Sí |    uuid | Identificador interno  |
| `tenant_id`        | UUID/string |        Sí |       — | Tenant                 |
| `property_unit_id` | UUID/string |        No |    null | Unidad asociada        |
| `person_id`        | UUID/string |        No |    null | Persona asociada       |
| `plate`            |      string |        No |    null | Placa                  |
| `type`             |        enum |        No |    null | Tipo de vehículo       |
| `brand`            |      string |        No |    null | Marca                  |
| `model`            |      string |        No |    null | Modelo                 |
| `color`            |      string |        No |    null | Color                  |
| `status`           |        enum |        Sí |  active | Estado                 |
| `created_at`       |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`       |   timestamp |        Sí |    auto | Fecha de actualización |
| `archived_at`      |   timestamp |        No |    null | Fecha de archivado     |

---

### 11.4. Reglas

* Pertenece a un tenant.
* Debe asociarse al menos a persona o unidad.
* Si se asocia a persona, debe ser del mismo tenant.
* Si se asocia a unidad, debe ser del mismo tenant.
* Placa única por tenant si existe.
* Placa normalizada a uppercase.
* No almacenar información sensible innecesaria.

---

### 11.5. Índices

```text id="7lndpj"
index vehicles_tenant_id_idx on vehicles(tenant_id)
index vehicles_property_unit_id_idx on vehicles(property_unit_id)
index vehicles_person_id_idx on vehicles(person_id)
index vehicles_status_idx on vehicles(status)
index vehicles_plate_idx on vehicles(tenant_id, plate)
```

Regla deseada:

```text id="kw92iz"
unique(tenant_id, plate) where plate is not null
```

---

## 12. Tabla `pets`

### 12.1. Propósito

Representa mascotas asociadas a persona y/o unidad.

---

### 12.2. Nombre físico

```text id="9p66iu"
pets
```

---

### 12.3. Columnas

| Columna            | Tipo lógico | Requerido | Default | Descripción            |
| ------------------ | ----------: | --------: | ------: | ---------------------- |
| `id`               | UUID/string |        Sí |    uuid | Identificador interno  |
| `tenant_id`        | UUID/string |        Sí |       — | Tenant                 |
| `property_unit_id` | UUID/string |        No |    null | Unidad asociada        |
| `person_id`        | UUID/string |        No |    null | Persona asociada       |
| `name`             |      string |        Sí |       — | Nombre de mascota      |
| `species`          |      string |        No |    null | Especie                |
| `breed`            |      string |        No |    null | Raza                   |
| `color`            |      string |        No |    null | Color                  |
| `status`           |        enum |        Sí |  active | Estado                 |
| `created_at`       |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`       |   timestamp |        Sí |    auto | Fecha de actualización |
| `archived_at`      |   timestamp |        No |    null | Fecha de archivado     |

---

### 12.4. Reglas

* Pertenece a un tenant.
* Debe asociarse al menos a persona o unidad.
* No registrar información veterinaria sensible en MVP.
* No eliminar físicamente en operación normal.

---

### 12.5. Índices

```text id="a4o5m2"
index pets_tenant_id_idx on pets(tenant_id)
index pets_property_unit_id_idx on pets(property_unit_id)
index pets_person_id_idx on pets(person_id)
index pets_status_idx on pets(status)
```

---

## 13. Tabla `emergency_contacts`

### 13.1. Propósito

Representa contactos de emergencia asociados a una persona.

---

### 13.2. Nombre físico

```text id="bncgio"
emergency_contacts
```

---

### 13.3. Columnas

| Columna        | Tipo lógico | Requerido | Default | Descripción            |
| -------------- | ----------: | --------: | ------: | ---------------------- |
| `id`           | UUID/string |        Sí |    uuid | Identificador interno  |
| `tenant_id`    | UUID/string |        Sí |       — | Tenant                 |
| `person_id`    | UUID/string |        Sí |       — | Persona asociada       |
| `name`         |      string |        Sí |       — | Nombre del contacto    |
| `relationship` |      string |        No |    null | Relación               |
| `phone`        |      string |        Sí |       — | Teléfono               |
| `email`        |      string |        No |    null | Email                  |
| `status`       |        enum |        Sí |  active | Estado                 |
| `created_at`   |   timestamp |        Sí |     now | Fecha de creación      |
| `updated_at`   |   timestamp |        Sí |    auto | Fecha de actualización |
| `archived_at`  |   timestamp |        No |    null | Fecha de archivado     |

---

### 13.4. Reglas

* Pertenece a un tenant.
* Persona asociada debe pertenecer al mismo tenant.
* Datos visibles solo para usuarios autorizados.
* No registrar información médica.

---

### 13.5. Índices

```text id="bvuc4t"
index emergency_contacts_tenant_id_idx on emergency_contacts(tenant_id)
index emergency_contacts_person_id_idx on emergency_contacts(person_id)
index emergency_contacts_status_idx on emergency_contacts(status)
```

---

## 14. Enums

## 14.1. `PersonStatus`

```text id="kpf9f6"
active
inactive
archived
```

Prisma:

```prisma id="pks9st"
enum PersonStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("person_status")
}
```

---

## 14.2. `LegalEntityStatus`

```text id="a4i987"
active
inactive
archived
```

Prisma:

```prisma id="x7mm3d"
enum LegalEntityStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("legal_entity_status")
}
```

---

## 14.3. `PropertyUnitStatus`

```text id="hgrcsq"
active
inactive
underMaintenance
blocked
archived
```

Prisma:

```prisma id="pzyfcb"
enum PropertyUnitStatus {
  ACTIVE            @map("active")
  INACTIVE          @map("inactive")
  UNDER_MAINTENANCE @map("underMaintenance")
  BLOCKED           @map("blocked")
  ARCHIVED          @map("archived")

  @@map("property_unit_status")
}
```

---

## 14.4. `PropertyUnitType`

```text id="q3hp3x"
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

Prisma:

```prisma id="d17l2d"
enum PropertyUnitType {
  HOUSE      @map("house")
  APARTMENT  @map("apartment")
  SUITE      @map("suite")
  LOT        @map("lot")
  PARKING    @map("parking")
  STORAGE    @map("storage")
  COMMERCIAL @map("commercial")
  MIXED      @map("mixed")
  OTHER      @map("other")

  @@map("property_unit_type")
}
```

---

## 14.5. `IdentificationType`

```text id="sy4pyc"
cedula
ruc
passport
other
none
```

Prisma:

```prisma id="6j8mc4"
enum IdentificationType {
  CEDULA   @map("cedula")
  RUC      @map("ruc")
  PASSPORT @map("passport")
  OTHER    @map("other")
  NONE     @map("none")

  @@map("identification_type")
}
```

---

## 14.6. `OwnershipStatus`

```text id="25ua7b"
active
ended
disputed
archived
```

Prisma:

```prisma id="valqi1"
enum OwnershipStatus {
  ACTIVE   @map("active")
  ENDED    @map("ended")
  DISPUTED @map("disputed")
  ARCHIVED @map("archived")

  @@map("ownership_status")
}
```

---

## 14.7. `OwnershipType`

```text id="3oskmk"
owner
coOwner
legalRepresentative
usufructuary
other
```

Prisma:

```prisma id="3upv31"
enum OwnershipType {
  OWNER                @map("owner")
  CO_OWNER             @map("coOwner")
  LEGAL_REPRESENTATIVE @map("legalRepresentative")
  USUFRUCTUARY         @map("usufructuary")
  OTHER                @map("other")

  @@map("ownership_type")
}
```

---

## 14.8. `ResidencyStatus`

```text id="31h6rd"
active
ended
suspended
archived
```

Prisma:

```prisma id="n3whv5"
enum ResidencyStatus {
  ACTIVE    @map("active")
  ENDED     @map("ended")
  SUSPENDED @map("suspended")
  ARCHIVED  @map("archived")

  @@map("residency_status")
}
```

---

## 14.9. `ResidencyType`

```text id="hpvv2x"
ownerResident
tenant
familyMember
authorizedOccupant
caretaker
other
```

Prisma:

```prisma id="q3mxq4"
enum ResidencyType {
  OWNER_RESIDENT      @map("ownerResident")
  TENANT              @map("tenant")
  FAMILY_MEMBER       @map("familyMember")
  AUTHORIZED_OCCUPANT @map("authorizedOccupant")
  CARETAKER           @map("caretaker")
  OTHER               @map("other")

  @@map("residency_type")
}
```

---

## 14.10. `LeaseStatus`

```text id="i16c3j"
draft
active
ended
cancelled
archived
```

Prisma:

```prisma id="pcxyay"
enum LeaseStatus {
  DRAFT     @map("draft")
  ACTIVE    @map("active")
  ENDED     @map("ended")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")

  @@map("lease_status")
}
```

---

## 14.11. `VehicleStatus`

```text id="a35ep3"
active
inactive
archived
```

Prisma:

```prisma id="n5zpi6"
enum VehicleStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("vehicle_status")
}
```

---

## 14.12. `VehicleType`

```text id="xk000z"
car
motorcycle
bicycle
truck
other
```

Prisma:

```prisma id="vqf3mh"
enum VehicleType {
  CAR        @map("car")
  MOTORCYCLE @map("motorcycle")
  BICYCLE    @map("bicycle")
  TRUCK      @map("truck")
  OTHER      @map("other")

  @@map("vehicle_type")
}
```

---

## 14.13. `PetStatus`

```text id="x6zzma"
active
inactive
archived
```

Prisma:

```prisma id="x7zrpv"
enum PetStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("pet_status")
}
```

---

## 14.14. `EmergencyContactStatus`

```text id="mj6ifs"
active
inactive
archived
```

Prisma:

```prisma id="2z9nu9"
enum EmergencyContactStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("emergency_contact_status")
}
```

---

## 15. Modelo Prisma completo propuesto

```prisma id="9z8y5x"
enum PersonStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("person_status")
}

enum LegalEntityStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("legal_entity_status")
}

enum PropertyUnitStatus {
  ACTIVE            @map("active")
  INACTIVE          @map("inactive")
  UNDER_MAINTENANCE @map("underMaintenance")
  BLOCKED           @map("blocked")
  ARCHIVED          @map("archived")

  @@map("property_unit_status")
}

enum PropertyUnitType {
  HOUSE      @map("house")
  APARTMENT  @map("apartment")
  SUITE      @map("suite")
  LOT        @map("lot")
  PARKING    @map("parking")
  STORAGE    @map("storage")
  COMMERCIAL @map("commercial")
  MIXED      @map("mixed")
  OTHER      @map("other")

  @@map("property_unit_type")
}

enum IdentificationType {
  CEDULA   @map("cedula")
  RUC      @map("ruc")
  PASSPORT @map("passport")
  OTHER    @map("other")
  NONE     @map("none")

  @@map("identification_type")
}

enum OwnershipStatus {
  ACTIVE   @map("active")
  ENDED    @map("ended")
  DISPUTED @map("disputed")
  ARCHIVED @map("archived")

  @@map("ownership_status")
}

enum OwnershipType {
  OWNER                @map("owner")
  CO_OWNER             @map("coOwner")
  LEGAL_REPRESENTATIVE @map("legalRepresentative")
  USUFRUCTUARY         @map("usufructuary")
  OTHER                @map("other")

  @@map("ownership_type")
}

enum ResidencyStatus {
  ACTIVE    @map("active")
  ENDED     @map("ended")
  SUSPENDED @map("suspended")
  ARCHIVED  @map("archived")

  @@map("residency_status")
}

enum ResidencyType {
  OWNER_RESIDENT      @map("ownerResident")
  TENANT              @map("tenant")
  FAMILY_MEMBER       @map("familyMember")
  AUTHORIZED_OCCUPANT @map("authorizedOccupant")
  CARETAKER           @map("caretaker")
  OTHER               @map("other")

  @@map("residency_type")
}

enum LeaseStatus {
  DRAFT     @map("draft")
  ACTIVE    @map("active")
  ENDED     @map("ended")
  CANCELLED @map("cancelled")
  ARCHIVED  @map("archived")

  @@map("lease_status")
}

enum VehicleStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("vehicle_status")
}

enum VehicleType {
  CAR        @map("car")
  MOTORCYCLE @map("motorcycle")
  BICYCLE    @map("bicycle")
  TRUCK      @map("truck")
  OTHER      @map("other")

  @@map("vehicle_type")
}

enum PetStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("pet_status")
}

enum EmergencyContactStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("emergency_contact_status")
}
```

```prisma id="2jux45"
model Person {
  id                   String              @id @default(uuid())
  tenantId             String              @map("tenant_id")
  userProfileId        String?             @map("user_profile_id")

  firstName            String?             @map("first_name")
  lastName             String?             @map("last_name")
  displayName          String              @map("display_name")

  identificationType   IdentificationType? @map("identification_type")
  identificationNumber String?             @map("identification_number")

  email                String?
  phone                String?
  whatsapp             String?
  status               PersonStatus        @default(ACTIVE)

  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")
  archivedAt           DateTime?           @map("archived_at")

  tenant               Tenant              @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  userProfile          UserProfile?        @relation(fields: [userProfileId], references: [id], onDelete: Restrict)

  ownerships           PropertyOwnership[]
  residencies          Residency[]
  tenantLeases         Lease[]             @relation("LeaseTenantPerson")
  ownerLeases          Lease[]             @relation("LeaseOwnerPerson")
  vehicles             Vehicle[]
  pets                 Pet[]
  emergencyContacts    EmergencyContact[]

  @@index([tenantId])
  @@index([userProfileId])
  @@index([status])
  @@index([displayName])
  @@index([tenantId, identificationType, identificationNumber])
  @@map("persons")
}
```

```prisma id="o4ou1i"
model LegalEntity {
  id                      String             @id @default(uuid())
  tenantId                String             @map("tenant_id")

  name                    String
  taxIdentificationType   IdentificationType? @map("tax_identification_type")
  taxIdentificationNumber String?             @map("tax_identification_number")

  email                   String?
  phone                   String?
  address                 String?
  status                  LegalEntityStatus  @default(ACTIVE)

  createdAt               DateTime           @default(now()) @map("created_at")
  updatedAt               DateTime           @updatedAt @map("updated_at")
  archivedAt              DateTime?          @map("archived_at")

  tenant                  Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  ownerships              PropertyOwnership[]
  ownerLeases             Lease[]            @relation("LeaseOwnerLegalEntity")

  @@index([tenantId])
  @@index([status])
  @@index([name])
  @@index([tenantId, taxIdentificationType, taxIdentificationNumber])
  @@map("legal_entities")
}
```

```prisma id="g9yoa2"
model PropertyUnit {
  id               String             @id @default(uuid())
  tenantId         String             @map("tenant_id")

  code             String
  name             String?
  type             PropertyUnitType   @default(HOUSE)
  block            String?
  floor            String?
  addressReference String?            @map("address_reference")
  areaM2           Decimal?           @map("area_m2") @db.Decimal(10, 2)
  status           PropertyUnitStatus @default(ACTIVE)

  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")
  archivedAt       DateTime?          @map("archived_at")

  tenant           Tenant             @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  ownerships       PropertyOwnership[]
  residencies      Residency[]
  leases           Lease[]
  vehicles         Vehicle[]
  pets             Pet[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([status])
  @@index([type])
  @@index([tenantId, block])
  @@map("property_units")
}
```

```prisma id="zig48m"
model PropertyOwnership {
  id                  String          @id @default(uuid())
  tenantId            String          @map("tenant_id")
  propertyUnitId      String          @map("property_unit_id")

  personId            String?         @map("person_id")
  legalEntityId       String?         @map("legal_entity_id")

  ownershipType       OwnershipType   @default(OWNER) @map("ownership_type")
  ownershipPercentage Decimal?        @map("ownership_percentage") @db.Decimal(5, 2)
  isPrimary           Boolean         @default(false) @map("is_primary")

  status              OwnershipStatus @default(ACTIVE)
  startDate           DateTime        @map("start_date") @db.Date
  endDate             DateTime?       @map("end_date") @db.Date

  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  tenant              Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit        PropertyUnit    @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  person              Person?         @relation(fields: [personId], references: [id], onDelete: Restrict)
  legalEntity         LegalEntity?    @relation(fields: [legalEntityId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([personId])
  @@index([legalEntityId])
  @@index([status])
  @@index([tenantId, propertyUnitId, status])
  @@map("property_ownerships")
}
```

```prisma id="5k5zma"
model Residency {
  id                String          @id @default(uuid())
  tenantId          String          @map("tenant_id")
  propertyUnitId    String          @map("property_unit_id")
  personId          String          @map("person_id")

  residencyType     ResidencyType   @default(AUTHORIZED_OCCUPANT) @map("residency_type")
  isPrimaryResident Boolean         @default(false) @map("is_primary_resident")

  status            ResidencyStatus @default(ACTIVE)
  startDate         DateTime        @map("start_date") @db.Date
  endDate           DateTime?       @map("end_date") @db.Date

  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")

  tenant            Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit      PropertyUnit    @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  person            Person          @relation(fields: [personId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([personId])
  @@index([status])
  @@index([tenantId, propertyUnitId, status])
  @@index([tenantId, personId, status])
  @@map("residencies")
}
```

```prisma id="yp2prq"
model Lease {
  id                 String       @id @default(uuid())
  tenantId           String       @map("tenant_id")
  propertyUnitId     String       @map("property_unit_id")

  ownerPersonId      String?      @map("owner_person_id")
  ownerLegalEntityId String?      @map("owner_legal_entity_id")
  tenantPersonId     String       @map("tenant_person_id")

  status             LeaseStatus  @default(DRAFT)
  startDate          DateTime     @map("start_date") @db.Date
  endDate            DateTime?    @map("end_date") @db.Date

  createdAt          DateTime     @default(now()) @map("created_at")
  updatedAt          DateTime     @updatedAt @map("updated_at")

  tenant             Tenant       @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit       PropertyUnit @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)

  ownerPerson        Person?      @relation("LeaseOwnerPerson", fields: [ownerPersonId], references: [id], onDelete: Restrict)
  ownerLegalEntity   LegalEntity? @relation("LeaseOwnerLegalEntity", fields: [ownerLegalEntityId], references: [id], onDelete: Restrict)
  tenantPerson       Person       @relation("LeaseTenantPerson", fields: [tenantPersonId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([tenantPersonId])
  @@index([ownerPersonId])
  @@index([ownerLegalEntityId])
  @@index([status])
  @@map("leases")
}
```

```prisma id="cv3ci3"
model Vehicle {
  id             String        @id @default(uuid())
  tenantId       String        @map("tenant_id")
  propertyUnitId String?       @map("property_unit_id")
  personId       String?       @map("person_id")

  plate          String?
  type           VehicleType?
  brand          String?
  model          String?
  color          String?
  status         VehicleStatus @default(ACTIVE)

  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")
  archivedAt     DateTime?     @map("archived_at")

  tenant         Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit   PropertyUnit? @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  person         Person?       @relation(fields: [personId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([personId])
  @@index([status])
  @@index([tenantId, plate])
  @@map("vehicles")
}
```

```prisma id="ym71h6"
model Pet {
  id             String       @id @default(uuid())
  tenantId       String       @map("tenant_id")
  propertyUnitId String?      @map("property_unit_id")
  personId       String?      @map("person_id")

  name           String
  species        String?
  breed          String?
  color          String?
  status         PetStatus    @default(ACTIVE)

  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")
  archivedAt     DateTime?    @map("archived_at")

  tenant         Tenant       @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  propertyUnit   PropertyUnit? @relation(fields: [propertyUnitId], references: [id], onDelete: Restrict)
  person         Person?      @relation(fields: [personId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([propertyUnitId])
  @@index([personId])
  @@index([status])
  @@map("pets")
}
```

```prisma id="n3zl7f"
model EmergencyContact {
  id           String                 @id @default(uuid())
  tenantId     String                 @map("tenant_id")
  personId     String                 @map("person_id")

  name         String
  relationship String?
  phone        String
  email        String?
  status       EmergencyContactStatus @default(ACTIVE)

  createdAt    DateTime               @default(now()) @map("created_at")
  updatedAt    DateTime               @updatedAt @map("updated_at")
  archivedAt   DateTime?              @map("archived_at")

  tenant       Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  person       Person                 @relation(fields: [personId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([personId])
  @@index([status])
  @@map("emergency_contacts")
}
```

---

## 16. Cambios requeridos en modelos existentes

### 16.1. Modelo `Tenant`

Agregar relaciones inversas:

```prisma id="wz4bwd"
model Tenant {
  // campos existentes...

  persons             Person[]
  legalEntities       LegalEntity[]
  propertyUnits       PropertyUnit[]
  propertyOwnerships  PropertyOwnership[]
  residencies         Residency[]
  leases              Lease[]
  vehicles            Vehicle[]
  pets                Pet[]
  emergencyContacts   EmergencyContact[]
}
```

---

### 16.2. Modelo `UserProfile`

Agregar relación inversa:

```prisma id="cawua0"
model UserProfile {
  // campos existentes...

  persons Person[]
}
```

Esto permite que un usuario pueda tener una persona vinculada por tenant.

---

## 17. Constraints recomendadas mediante SQL manual

Algunas reglas importantes pueden requerir SQL manual en migraciones PostgreSQL.

### 17.1. Identificación única de persona cuando existe

```sql id="4u26wd"
CREATE UNIQUE INDEX persons_tenant_identification_unique
ON persons (tenant_id, identification_type, identification_number)
WHERE identification_number IS NOT NULL;
```

---

### 17.2. Identificación única de entidad jurídica cuando existe

```sql id="ippg2z"
CREATE UNIQUE INDEX legal_entities_tenant_tax_identification_unique
ON legal_entities (tenant_id, tax_identification_type, tax_identification_number)
WHERE tax_identification_number IS NOT NULL;
```

---

### 17.3. Placa única cuando existe

```sql id="2ggdn4"
CREATE UNIQUE INDEX vehicles_tenant_plate_unique
ON vehicles (tenant_id, plate)
WHERE plate IS NOT NULL;
```

---

### 17.4. XOR propietario persona o entidad

```sql id="bzw53f"
ALTER TABLE property_ownerships
ADD CONSTRAINT property_ownerships_owner_xor_check
CHECK (
  (person_id IS NOT NULL AND legal_entity_id IS NULL)
  OR
  (person_id IS NULL AND legal_entity_id IS NOT NULL)
);
```

---

### 17.5. XOR propietario de lease

```sql id="kqpxa0"
ALTER TABLE leases
ADD CONSTRAINT leases_owner_xor_check
CHECK (
  (owner_person_id IS NOT NULL AND owner_legal_entity_id IS NULL)
  OR
  (owner_person_id IS NULL AND owner_legal_entity_id IS NOT NULL)
);
```

---

### 17.6. Vehículo asociado al menos a persona o unidad

```sql id="0c9kif"
ALTER TABLE vehicles
ADD CONSTRAINT vehicles_person_or_unit_check
CHECK (
  person_id IS NOT NULL OR property_unit_id IS NOT NULL
);
```

---

### 17.7. Mascota asociada al menos a persona o unidad

```sql id="q7zjl3"
ALTER TABLE pets
ADD CONSTRAINT pets_person_or_unit_check
CHECK (
  person_id IS NOT NULL OR property_unit_id IS NOT NULL
);
```

---

### 17.8. Fechas de propiedad válidas

```sql id="6x6d1h"
ALTER TABLE property_ownerships
ADD CONSTRAINT property_ownerships_date_range_check
CHECK (
  end_date IS NULL OR end_date >= start_date
);
```

---

### 17.9. Fechas de residencia válidas

```sql id="t771zk"
ALTER TABLE residencies
ADD CONSTRAINT residencies_date_range_check
CHECK (
  end_date IS NULL OR end_date >= start_date
);
```

---

### 17.10. Fechas de lease válidas

```sql id="z0z8fc"
ALTER TABLE leases
ADD CONSTRAINT leases_date_range_check
CHECK (
  end_date IS NULL OR end_date >= start_date
);
```

---

### 17.11. Porcentaje de propiedad válido

```sql id="76s41k"
ALTER TABLE property_ownerships
ADD CONSTRAINT property_ownerships_percentage_check
CHECK (
  ownership_percentage IS NULL
  OR
  (ownership_percentage > 0 AND ownership_percentage <= 100)
);
```

---

## 18. Reglas que deben validarse en aplicación

Las siguientes reglas no deben depender solo de la base de datos:

```text id="8uzcrz"
- propertyUnit.tenantId == tenantId
- person.tenantId == tenantId
- legalEntity.tenantId == tenantId
- vehicle.personId pertenece al mismo tenant
- vehicle.propertyUnitId pertenece al mismo tenant
- pet.personId pertenece al mismo tenant
- pet.propertyUnitId pertenece al mismo tenant
- emergencyContact.personId pertenece al mismo tenant
- suma de ownershipPercentage activos no excede 100
- no remover último propietario principal si la regla está activa
- no sobrescribir ownership activo sin cierre
- no sobrescribir residency activa sin cierre
- acceso .own mediante UserProfile → Person
```

---

## 19. Reglas de acceso `.own`

### 19.1. Resolver persona del usuario

Para endpoints `/api/v1/me/*`:

```text id="tb27mt"
UserProfile.id
  ↓
Person.userProfileId
  ↓
Person.tenantId = currentTenantId
```

Si no existe `Person` vinculada:

```text id="8xc33t"
403 OWN_PERSON_NOT_LINKED
```

---

### 19.2. Mis unidades como propietario

Una unidad es propia si:

```text id="jj0n4g"
Person.id = PropertyOwnership.personId
AND PropertyOwnership.status = active
AND PropertyOwnership.tenantId = currentTenantId
```

---

### 19.3. Mis unidades como residente

Una unidad es propia si:

```text id="d1ph1k"
Person.id = Residency.personId
AND Residency.status = active
AND Residency.tenantId = currentTenantId
```

---

### 19.4. Mis vehículos

Un vehículo es propio si:

```text id="xx75rn"
Vehicle.personId = Person.id
OR
Vehicle.propertyUnitId IN myPropertyUnits
```

---

### 19.5. Mis mascotas

Una mascota es propia si:

```text id="g0wo59"
Pet.personId = Person.id
OR
Pet.propertyUnitId IN myPropertyUnits
```

---

### 19.6. Mis contactos de emergencia

Un contacto es propio si:

```text id="z83l79"
EmergencyContact.personId = Person.id
```

---

## 20. Seeds iniciales

### 20.1. Tenants demo requeridos

Reusar tenants de `001-tenants`:

```text id="lu1igd"
villa-club-demo
altos-del-norte-demo
jardines-del-valle-demo
portal-del-rio-demo
```

---

### 20.2. Unidades demo

Para `villa-club-demo`:

```text id="j9fr1y"
Casa 01
Casa 02
Casa 03
Casa 04
Casa 05
```

Para `altos-del-norte-demo`:

```text id="kghpvu"
A-101
A-102
B-201
B-202
```

---

### 20.3. Personas demo

Usar emails ficticios:

```text id="anb2zi"
owner.villa.01@example.com
resident.villa.01@example.com
tenant.villa.01@example.com
```

No usar:

* cédulas reales;
* teléfonos reales;
* correos reales;
* datos de menores reales.

---

### 20.4. Relaciones demo

Crear:

```text id="ubf5c7"
PropertyOwnership active para Casa 01
Residency active para Casa 01
Vehicle ficticio para Casa 01
Pet ficticio para Casa 01
EmergencyContact ficticio
```

---

### 20.5. Placas demo

Usar placas claramente ficticias:

```text id="qy6dcj"
DEMO-001
DEMO-002
TEST-001
```

---

## 21. Datos prohibidos en seeds

No usar:

```text id="22prvf"
cédulas reales
RUC reales
pasaportes reales
nombres completos de personas reales
teléfonos reales
emails personales reales
placas reales
direcciones exactas reales
datos de menores
datos médicos
datos bancarios
comprobantes
```

---

## 22. Consultas esperadas

### 22.1. Listar unidades del tenant

```text id="rvv1lx"
listPropertyUnits(tenantId, query)
```

Filtros:

```text id="xj3cjq"
status
type
block
search
```

---

### 22.2. Buscar unidad por código

```text id="xz4lrb"
findPropertyUnitByCode(tenantId, code)
```

---

### 22.3. Listar personas del tenant

```text id="clc1hp"
listPersons(tenantId, query)
```

Filtros:

```text id="9hlfoe"
status
search
identificationType
```

---

### 22.4. Buscar persona por usuario

```text id="npf5qj"
findPersonByUserProfileId(tenantId, userProfileId)
```

---

### 22.5. Obtener propietarios activos de unidad

```text id="dxp5l8"
getActiveOwnersByUnit(tenantId, propertyUnitId)
```

---

### 22.6. Obtener residentes activos de unidad

```text id="s3rjmi"
getActiveResidentsByUnit(tenantId, propertyUnitId)
```

---

### 22.7. Obtener unidades propias

```text id="sl0ptu"
getMyPropertyUnits(tenantId, userProfileId)
```

---

## 23. Paginación

Listados deben soportar:

```text id="s6q7bo"
page
pageSize
```

Valores:

```text id="xz8fd0"
page = 1
pageSize = 20
max pageSize = 100
```

Aplica a:

```text id="q0cjnx"
property_units
persons
legal_entities
property_ownerships
residencies
leases
vehicles
pets
emergency_contacts
```

---

## 24. Filtros mínimos

### 24.1. Property units

```text id="xef0gy"
status
type
block
search
```

`search` busca en:

```text id="jqij1c"
code
name
addressReference
```

---

### 24.2. Persons

```text id="54tckf"
status
search
identificationType
```

`search` busca en:

```text id="ky8j95"
displayName
firstName
lastName
email
identificationNumber
```

---

### 24.3. Ownerships

```text id="mwz304"
propertyUnitId
personId
legalEntityId
status
ownershipType
```

---

### 24.4. Residencies

```text id="a1t3ux"
propertyUnitId
personId
status
residencyType
```

---

### 24.5. Vehicles

```text id="hpwlrg"
propertyUnitId
personId
status
plate
```

---

### 24.6. Pets

```text id="ph3qvx"
propertyUnitId
personId
status
species
```

---

## 25. Ordenamiento

Campos permitidos:

```text id="t628ll"
createdAt
updatedAt
displayName
code
name
status
startDate
```

No permitir ordenar por campos arbitrarios.

---

## 26. Performance esperada

Índices críticos:

```text id="ohh0o1"
persons(tenant_id)
persons(user_profile_id)
persons(tenant_id, identification_type, identification_number)
property_units(tenant_id, code)
property_ownerships(tenant_id, property_unit_id, status)
property_ownerships(tenant_id, person_id, status)
residencies(tenant_id, property_unit_id, status)
residencies(tenant_id, person_id, status)
vehicles(tenant_id, plate)
pets(tenant_id)
emergency_contacts(tenant_id, person_id)
```

No se requiere particionamiento en MVP.

---

## 27. Seguridad de datos

### 27.1. Riesgo de cross-tenant

Mitigación:

* `tenant_id` obligatorio;
* queries por tenant;
* validación de relaciones;
* tests multitenant.

---

### 27.2. Riesgo de acceso `.own` incorrecto

Mitigación:

* resolver `Person` por `userProfileId + tenantId`;
* validar relación activa;
* no confiar en IDs enviados por cliente;
* tests de own access.

---

### 27.3. Riesgo de duplicidad crítica

Mitigación:

* unique tenant+code para unidades;
* índice/validación de identificación por tenant;
* índice/validación de placa por tenant.

---

### 27.4. Riesgo de pérdida histórica

Mitigación:

* no delete físico;
* usar `end_date`;
* usar `status`;
* auditoría.

---

### 27.5. Riesgo de datos personales en logs

Mitigación:

* no loggear identificación completa;
* no loggear payload completo;
* usar `personId`, `tenantId`, `traceId`.

---

## 28. Migración inicial

### 28.1. Nombre sugerido

```text id="ap6tei"
003_create_residents_properties
```

---

### 28.2. Orden de creación

```text id="xdks2b"
1. Enums
2. persons
3. legal_entities
4. property_units
5. property_ownerships
6. residencies
7. leases
8. vehicles
9. pets
10. emergency_contacts
11. indexes
12. constraints
13. SQL manual constraints si aplica
```

---

### 28.3. Revisión manual

Antes de aplicar en staging o producción:

```text id="elcxkw"
- verificar tenant_id obligatorio;
- verificar unique tenant+code;
- verificar onDelete Restrict;
- verificar ausencia de cascade delete peligroso;
- verificar constraints XOR;
- verificar constraints de fechas;
- verificar índices por tenant;
- verificar que no existan datos sensibles en seeds.
```

---

## 29. Tests de modelo requeridos

### 29.1. Unitarios

* PropertyUnitCode.
* IdentificationType.
* IdentificationNumber.
* OwnershipPercentage.
* DateRange.
* VehiclePlate.
* PersonStatus.
* PropertyUnitStatus.
* OwnershipStatus.
* ResidencyStatus.
* LeaseStatus.

---

### 29.2. Integración

* Crear unidad.
* Código único por tenant.
* Crear persona.
* Identificación única por tenant.
* Crear entidad jurídica.
* Crear propiedad persona.
* Crear propiedad entidad jurídica.
* Rechazar ownership con persona y entidad al mismo tiempo.
* Rechazar ownership sin propietario.
* Crear residencia.
* Finalizar residencia.
* Crear lease.
* Crear vehículo.
* Crear mascota.
* Crear contacto de emergencia.
* `onDelete: Restrict`.

---

### 29.3. Multitenant

* Unidad Tenant A no visible en Tenant B.
* Persona Tenant A no usable en Tenant B.
* Ownership no puede mezclar tenants.
* Residency no puede mezclar tenants.
* Vehicle no puede mezclar tenants.
* Pet no puede mezclar tenants.
* Own endpoints no mezclan tenants.

---

## 30. Compatibilidad con módulos futuros

Este modelo habilita:

```text id="n7b57b"
004-dues-fees
005-payments
006-account-statements
007-audit
008-wordpress-integration
010-reservations
011-fines
012-meetings
```

Uso futuro:

| Módulo futuro     | Entidades usadas                        |
| ----------------- | --------------------------------------- |
| Alícuotas         | `PropertyUnit`, `PropertyOwnership`     |
| Cargos            | `PropertyUnit`, `Person`, `LegalEntity` |
| Pagos             | `PropertyUnit`, propietarios            |
| Estados de cuenta | `PropertyUnit`, propietarios/residentes |
| Reservas          | `Person`, `Residency`, `PropertyUnit`   |
| Multas            | `Person`, `PropertyUnit`, `Residency`   |
| Asambleas         | `PropertyOwnership`, `Person`           |
| Comunicaciones    | `Person`, `Residency`, `PropertyUnit`   |

---

## 31. Campos diferidos

No incluir todavía:

```text id="tqac9h"
nationality
birthDate
gender
maritalStatus
photoUrl
documentFileId
contractFileId
medicalNotes
biometricData
preciseGeolocation
parkingSlotAdvanced
visitorAccessRules
accessCardNumber
financialResponsibilityRules
billingPreference
legalRepresentativeDocument
```

Razón:

* no son necesarios para MVP;
* algunos son sensibles;
* algunos pertenecen a specs futuras;
* algunos requieren controles adicionales de privacidad.

---

## 32. Uso de JSONB

No usar JSONB para relaciones principales.

No usar JSONB para:

```text id="m8xeih"
ownerships
residencies
permissions .own
property unit references
financial responsibility
```

JSONB podría evaluarse después para:

```text id="dlag3k"
metadata no crítica
preferencias visuales
campos personalizados por tenant
```

pero no para relaciones que afectan seguridad, propiedad, residencia o finanzas.

---

## 33. Reglas de retención

* Personas archivadas se conservan.
* Unidades archivadas se conservan.
* Propiedades terminadas se conservan.
* Residencias terminadas se conservan.
* Leases terminados se conservan.
* Vehículos archivados se conservan.
* Mascotas archivadas se conservan.
* Contactos archivados se conservan por política definida.
* Cambios críticos se auditan.

---

## 34. Checklist de migración

Antes de aceptar la migración:

```text id="hzm5wp"
[ ] Enums creados.
[ ] Tabla persons creada.
[ ] Tabla legal_entities creada.
[ ] Tabla property_units creada.
[ ] Tabla property_ownerships creada.
[ ] Tabla residencies creada.
[ ] Tabla leases creada.
[ ] Tabla vehicles creada.
[ ] Tabla pets creada.
[ ] Tabla emergency_contacts creada.
[ ] tenant_id obligatorio en todas las tablas.
[ ] unique tenant+code en property_units.
[ ] índices por tenant creados.
[ ] onDelete Restrict aplicado.
[ ] no cascade delete peligroso.
[ ] constraints XOR revisadas.
[ ] constraints de fecha revisadas.
[ ] constraints de porcentaje revisadas.
[ ] seeds no contienen datos reales.
[ ] migración aplicada en local.
[ ] Prisma Client generado.
```

---

## 35. Decisión final del modelo

El módulo `003-residents-properties` usará nueve tablas principales:

```text id="pqxh0d"
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

El modelo se basa en:

```text id="k8yygn"
tenant_id obligatorio
historial mediante start_date/end_date/status
no eliminación física normal
relación UserProfile → Person
validación de acceso .own
integridad entre unidad/persona/tenant
privacidad de datos personales
compatibilidad financiera futura
```

Este modelo habilita el padrón residencial operativo de RESIDENT Core y prepara el sistema para los módulos de alícuotas, cargos, pagos, estados de cuenta, reservas, multas, asambleas y reportes.
