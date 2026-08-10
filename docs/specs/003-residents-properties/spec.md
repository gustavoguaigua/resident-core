# Spec 003 — Residents, Owners, Tenants and Property Units

## 1. Información del documento

| Campo           | Valor                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                       |
| Spec ID         | 003                                                                                                                                                 |
| Módulo          | Residents and Properties                                                                                                                            |
| Documento       | Functional Specification                                                                                                                            |
| Ruta            | `docs/specs/003-residents-properties/spec.md`                                                                                                       |
| Versión         | 0.1                                                                                                                                                 |
| Estado          | needs-review                                                                                                                                        |
| Fecha           | 2026-07-13                                                                                                                                          |
| Prioridad       | Alta                                                                                                                                                |
| Depende de      | `001-tenants`, `002-users-roles`                                                                                                                    |
| Relacionado con | `constitution.md`, `domain-map.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-003`, `ADR-004`, `ADR-007`, `ADR-011`, `ADR-012` |

---

## 2. Propósito

El módulo `003-residents-properties` define cómo RESIDENT Core administrará la información base de:

* personas;
* propietarios;
* residentes;
* arrendatarios;
* ocupantes;
* unidades habitacionales;
* relaciones de propiedad;
* relaciones de residencia;
* contratos o relaciones de arriendo;
* vehículos;
* mascotas;
* contactos de emergencia;
* vínculo entre `UserProfile` y persona;
* acceso `.own` a datos propios.

Este módulo es fundamental porque conecta la identidad y autorización del sistema con la realidad operativa de cada conjunto residencial.

Mientras `001-tenants` define el conjunto residencial y `002-users-roles` define usuarios, roles y permisos, `003-residents-properties` define:

```text id="uiui6l"
quién vive en el conjunto,
quién es propietario,
qué unidad posee,
qué unidad ocupa,
quién puede consultar información propia,
y cómo se relacionan personas, usuarios y unidades.
```

---

## 3. Objetivo funcional

Permitir que cada tenant administre su padrón residencial de forma segura, trazable y aislada.

El módulo debe permitir:

* crear unidades habitacionales;
* clasificar unidades por tipo;
* registrar personas naturales;
* registrar entidades jurídicas si aplica;
* registrar propietarios;
* registrar residentes;
* registrar arrendatarios;
* registrar ocupantes autorizados;
* asociar personas con unidades;
* asociar usuarios del sistema con personas;
* consultar unidades;
* consultar residentes;
* consultar propietarios;
* consultar ocupación actual;
* mantener historial de propiedad;
* mantener historial de residencia;
* registrar vehículos;
* registrar mascotas;
* registrar contactos de emergencia;
* auditar cambios sensibles;
* impedir acceso cross-tenant;
* habilitar permisos `.own` para módulos futuros.

---

## 4. Alcance

### 4.1. Incluido en esta spec

Esta spec incluye:

* `Person`.
* `LegalEntity`.
* `PropertyUnit`.
* `PropertyOwnership`.
* `Residency`.
* `Lease`.
* `Vehicle`.
* `Pet`.
* `EmergencyContact`.
* Relación `UserProfile` ↔ `Person`.
* Estados de unidad.
* Estados de residencia.
* Estados de propiedad.
* Historial de propietarios.
* Historial de residentes.
* Ocupantes actuales.
* Propietarios actuales.
* Endpoints REST.
* Validaciones multitenant.
* Autorización tenant-scoped.
* Acceso a información propia.
* Auditoría.
* Eventos.
* Pruebas esperadas.

---

### 4.2. No incluido en esta spec

No incluye todavía:

* alícuotas;
* generación de cargos;
* estados de cuenta;
* pagos;
* multas;
* reservas;
* votaciones;
* asistencia a asambleas;
* documentos legales adjuntos;
* firma electrónica;
* validación oficial de cédulas;
* integración con Registro Civil;
* scoring financiero;
* gestión avanzada de contratos;
* expedientes documentales completos;
* control de acceso físico;
* visitas;
* parqueaderos avanzados;
* administración catastral compleja.

Estos temas se tratarán en specs posteriores.

---

## 5. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="oxqg3a"
Residents and Properties
```

Depende de:

```text id="n9au3p"
001-tenants
002-users-roles
```

porque:

* todo dato operativo pertenece a un tenant;
* todo acceso privado requiere usuario autenticado;
* toda operación requiere membresía y permisos;
* los permisos `.own` necesitan saber qué persona/unidad corresponde al usuario.

---

## 6. Actores

### 6.1. PlatformAdmin

Puede consultar o apoyar datos de tenants según permisos globales.

No debe operar datos internos del tenant sin justificación y auditoría.

---

### 6.2. TenantAdmin

Administrador del conjunto.

Puede:

* crear unidades;
* actualizar unidades;
* registrar personas;
* registrar propietarios;
* registrar residentes;
* asociar usuarios con personas;
* consultar padrón residencial;
* gestionar vehículos, mascotas y contactos;
* cerrar relaciones de residencia;
* actualizar información administrativa.

---

### 6.3. TenantStaff

Personal administrativo del conjunto.

Puede tener permisos limitados para consulta o actualización operativa.

---

### 6.4. BoardMember

Miembro de directiva.

Puede consultar información según permisos.

No necesariamente puede modificar datos personales.

---

### 6.5. Treasurer

Tesorero.

Puede consultar propietarios/unidades para procesos financieros futuros.

No necesariamente puede modificar datos personales.

---

### 6.6. TenantAuditor

Auditor del tenant.

Puede consultar histórico y trazabilidad según permisos.

---

### 6.7. PropertyOwner

Propietario.

Puede consultar información propia y de sus unidades.

---

### 6.8. Resident

Residente.

Puede consultar su información personal, su residencia actual, su unidad relacionada y datos propios permitidos.

---

### 6.9. Tenant User

Usuario autenticado perteneciente a un tenant.

Su acceso depende de roles y permisos.

---

## 7. Definiciones

### 7.1. Person

Persona natural registrada en un tenant.

Puede ser:

* propietario;
* residente;
* arrendatario;
* ocupante;
* contacto de emergencia;
* representante.

---

### 7.2. LegalEntity

Entidad jurídica que puede ser propietaria o responsable de una unidad.

Ejemplo:

```text id="do6qu7"
Empresa propietaria de una casa.
Fideicomiso.
Institución.
```

---

### 7.3. PropertyUnit

Unidad habitacional dentro del conjunto.

Puede representar:

* casa;
* departamento;
* local interno;
* bodega;
* parqueadero;
* lote;
* suite;
* unidad mixta.

Para el caso inicial de RESIDENT, una unidad puede ser una casa dentro de un conjunto residencial.

---

### 7.4. PropertyOwnership

Relación de propiedad entre una persona o entidad jurídica y una unidad habitacional.

Puede tener:

* porcentaje de propiedad;
* fecha de inicio;
* fecha de fin;
* estado;
* tipo de propietario.

---

### 7.5. Residency

Relación de ocupación o residencia entre una persona y una unidad.

Puede representar:

* residente propietario;
* residente arrendatario;
* ocupante familiar;
* ocupante autorizado;
* administrador de unidad.

---

### 7.6. Lease

Relación de arriendo asociada a una unidad.

Puede vincular:

* propietario;
* arrendatario;
* unidad;
* fechas;
* estado.

---

### 7.7. Vehicle

Vehículo asociado a una persona, unidad o residencia.

---

### 7.8. Pet

Mascota asociada a una persona, unidad o residencia.

---

### 7.9. EmergencyContact

Contacto de emergencia asociado a una persona o residencia.

---

### 7.10. Own Data

Datos propios que un usuario puede consultar o actualizar bajo permisos `.own`.

Ejemplo:

```text id="3rpxgm"
propertyUnits.read.own
residents.profile.read.own
vehicles.read.own
pets.read.own
```

---

## 8. Supuestos

1. Cada registro operativo pertenece a un tenant.
2. `Tenant` ya existe desde `001-tenants`.
3. `UserProfile` ya existe desde `002-users-roles`.
4. Un usuario puede vincularse a una persona.
5. Una persona puede existir sin usuario.
6. Un propietario puede no tener cuenta de usuario.
7. Un residente puede no tener cuenta de usuario inicialmente.
8. Una unidad puede tener uno o varios propietarios.
9. Una unidad puede tener una residencia actual.
10. Una persona puede estar asociada a varias unidades.
11. Una unidad puede cambiar de propietario en el tiempo.
12. Una unidad puede cambiar de residentes en el tiempo.
13. No se eliminarán físicamente registros históricos.
14. Datos sensibles deben minimizarse.
15. No se validará oficialmente cédula/RUC en MVP.
16. La moneda, pagos y saldos se tratarán en specs financieras.

---

## 9. Reglas de negocio

### BR-001 — Todo dato pertenece a un tenant

Toda persona, unidad, propiedad, residencia, vehículo, mascota y contacto debe estar asociado a un `tenantId`.

---

### BR-002 — No cross-tenant

Un usuario de Tenant A no puede consultar ni modificar datos de Tenant B.

---

### BR-003 — Unidad única por tenant

El código o identificador interno de una unidad debe ser único dentro del tenant.

Ejemplo:

```text id="2pvjiz"
Casa 01
Casa 02
Torre A - Departamento 301
```

---

### BR-004 — Persona única por tenant según identificación, si existe

Si se registra identificación, no debe duplicarse dentro del mismo tenant.

Sin embargo, una persona puede existir en varios tenants con registros separados en MVP.

---

### BR-005 — Persona puede existir sin usuario

No toda persona registrada debe tener acceso al sistema.

Ejemplo:

```text id="ivla88"
Propietario adulto mayor sin cuenta digital.
Ocupante menor de edad.
Contacto de emergencia.
```

---

### BR-006 — Usuario puede vincularse a persona

Un `UserProfile` puede vincularse a una `Person`.

Esto permite permisos `.own`.

---

### BR-007 — Propiedad histórica

La relación de propiedad debe conservar historial.

No se debe sobrescribir el propietario anterior sin cerrar la relación previa.

---

### BR-008 — Residencia histórica

La relación de residencia debe conservar historial.

No se debe eliminar una residencia anterior sin trazabilidad.

---

### BR-009 — Una unidad puede tener múltiples propietarios

Debe soportarse copropiedad.

Cada propietario puede tener un porcentaje.

---

### BR-010 — Porcentaje de propiedad

Si se usan porcentajes, la suma de propietarios activos de una unidad no debe exceder 100%.

Para MVP puede validarse como recomendación o regla estricta según configuración.

---

### BR-011 — Una unidad puede tener múltiples residentes

Una unidad puede tener más de un residente activo.

Ejemplo:

```text id="1dsy6t"
propietario residente
cónyuge
hijos
arrendatario
ocupantes autorizados
```

---

### BR-012 — Una unidad debe tener un responsable principal

Cada unidad activa debe poder identificar un responsable principal operativo.

Puede ser:

* propietario principal;
* arrendatario principal;
* representante;
* residente principal.

---

### BR-013 — No eliminación física normal

No se debe eliminar físicamente:

* personas con relaciones históricas;
* unidades;
* propiedades;
* residencias;
* arriendos;
* vehículos asociados;
* mascotas asociadas;
* contactos usados históricamente.

Se usará estado o cierre de vigencia.

---

### BR-014 — Estados controlados

Las unidades, personas, residencias y relaciones deben tener estados claros.

---

### BR-015 — Datos personales mínimos

No registrar datos personales innecesarios.

En MVP, evitar:

* datos médicos;
* información sensible;
* biométricos;
* geolocalización precisa;
* datos de menores salvo necesidad justificada.

---

### BR-016 — Acceso propio

Un usuario con rol `Resident` o `PropertyOwner` solo puede consultar información propia o de unidades asociadas, salvo permisos administrativos.

---

### BR-017 — Administración por tenant

Solo usuarios con permisos administrativos dentro del tenant pueden crear o modificar padrón.

---

### BR-018 — Auditoría obligatoria

Cambios en personas, unidades, propiedad, residencia y vínculos usuario-persona deben auditarse.

---

### BR-019 — Unidades suspendidas o inactivas

Una unidad inactiva no debe generar operación ordinaria futura, salvo consulta histórica.

---

### BR-020 — Tenant activo requerido

Operaciones ordinarias requieren tenant activo.

---

## 10. Estados

## 10.1. PersonStatus

```text id="8gaj2d"
active
inactive
archived
```

| Estado     | Descripción                       |
| ---------- | --------------------------------- |
| `active`   | Persona vigente en el tenant      |
| `inactive` | Persona no activa operativamente  |
| `archived` | Persona conservada históricamente |

---

## 10.2. PropertyUnitStatus

```text id="bxvfi7"
active
inactive
underMaintenance
blocked
archived
```

| Estado             | Descripción                          |
| ------------------ | ------------------------------------ |
| `active`           | Unidad operativa                     |
| `inactive`         | Unidad no operativa temporalmente    |
| `underMaintenance` | Unidad en mantenimiento              |
| `blocked`          | Unidad bloqueada administrativamente |
| `archived`         | Unidad histórica                     |

---

## 10.3. PropertyOwnershipStatus

```text id="c11t19"
active
ended
disputed
archived
```

| Estado     | Descripción          |
| ---------- | -------------------- |
| `active`   | Propiedad vigente    |
| `ended`    | Propiedad finalizada |
| `disputed` | Propiedad en disputa |
| `archived` | Registro histórico   |

---

## 10.4. ResidencyStatus

```text id="nw1cby"
active
ended
suspended
archived
```

| Estado      | Descripción           |
| ----------- | --------------------- |
| `active`    | Residencia vigente    |
| `ended`     | Residencia finalizada |
| `suspended` | Residencia suspendida |
| `archived`  | Registro histórico    |

---

## 10.5. LeaseStatus

```text id="ny1vjg"
draft
active
ended
cancelled
archived
```

---

## 10.6. VehicleStatus

```text id="k6sa61"
active
inactive
archived
```

---

## 10.7. PetStatus

```text id="09wa71"
active
inactive
archived
```

---

## 11. Flujos funcionales

## 11.1. Crear unidad habitacional

### Actor

TenantAdmin o usuario con permiso `propertyUnits.create`.

### Flujo

```text id="wgpv1a"
1. Actor solicita crear unidad.
2. Sistema valida tenant activo.
3. Sistema valida permiso.
4. Sistema valida código único por tenant.
5. Sistema crea PropertyUnit.
6. Sistema registra auditoría.
7. Sistema emite PropertyUnitCreated.
```

---

## 11.2. Registrar persona

### Actor

TenantAdmin o usuario con permiso `persons.create`.

### Flujo

```text id="m0qn6z"
1. Actor registra datos básicos.
2. Sistema valida tenant activo.
3. Sistema valida permiso.
4. Sistema valida identificación si existe.
5. Sistema crea Person.
6. Sistema registra auditoría.
7. Sistema emite PersonCreated.
```

---

## 11.3. Vincular usuario con persona

### Actor

TenantAdmin o usuario autorizado.

### Flujo

```text id="13f5ii"
1. Actor selecciona UserProfile.
2. Actor selecciona Person.
3. Sistema valida que ambos pertenecen o tienen relación válida con el tenant.
4. Sistema vincula UserProfile con Person.
5. Sistema registra auditoría.
6. Sistema emite UserLinkedToPerson.
```

---

## 11.4. Registrar propietario de unidad

### Actor

TenantAdmin o usuario con permiso `propertyOwnerships.create`.

### Flujo

```text id="06g2h1"
1. Actor selecciona unidad.
2. Actor selecciona persona o entidad jurídica.
3. Sistema valida tenant.
4. Sistema valida unidad activa.
5. Sistema valida porcentaje si aplica.
6. Sistema crea PropertyOwnership active.
7. Sistema registra auditoría.
8. Sistema emite PropertyOwnershipCreated.
```

---

## 11.5. Finalizar propiedad

### Actor

TenantAdmin o usuario autorizado.

### Flujo

```text id="4y3fhu"
1. Actor selecciona relación de propiedad.
2. Sistema valida tenant.
3. Sistema valida relación active.
4. Sistema registra fecha fin.
5. Sistema cambia estado a ended.
6. Sistema registra auditoría.
7. Sistema emite PropertyOwnershipEnded.
```

---

## 11.6. Registrar residencia

### Actor

TenantAdmin o usuario con permiso `residencies.create`.

### Flujo

```text id="rx3wkf"
1. Actor selecciona unidad.
2. Actor selecciona persona.
3. Sistema valida tenant.
4. Sistema valida unidad.
5. Sistema define tipo de residencia.
6. Sistema crea Residency active.
7. Sistema registra auditoría.
8. Sistema emite ResidencyCreated.
```

---

## 11.7. Finalizar residencia

### Actor

TenantAdmin o usuario autorizado.

### Flujo

```text id="1b47kc"
1. Actor selecciona residencia.
2. Sistema valida tenant.
3. Sistema valida relación active.
4. Sistema registra fecha de fin.
5. Sistema cambia estado a ended.
6. Sistema registra auditoría.
7. Sistema emite ResidencyEnded.
```

---

## 11.8. Registrar vehículo

### Actor

TenantAdmin, TenantStaff o usuario con permiso correspondiente.

### Flujo

```text id="79keyj"
1. Actor registra placa y datos básicos.
2. Sistema valida tenant.
3. Sistema valida persona/unidad asociada.
4. Sistema crea Vehicle.
5. Sistema audita.
6. Sistema emite VehicleRegistered.
```

---

## 11.9. Registrar mascota

### Actor

TenantAdmin, TenantStaff o usuario con permiso correspondiente.

### Flujo

```text id="n3spoh"
1. Actor registra mascota.
2. Sistema valida tenant.
3. Sistema valida persona/unidad asociada.
4. Sistema crea Pet.
5. Sistema audita.
6. Sistema emite PetRegistered.
```

---

## 12. Historias de usuario

### US-001 — Crear unidad habitacional

Como TenantAdmin, quiero registrar las unidades habitacionales del conjunto para administrar residentes, propietarios y procesos financieros futuros.

#### Criterios de aceptación

* Dado un código único, se crea la unidad.
* Dado un código duplicado en el mismo tenant, se rechaza.
* Dado un usuario sin permiso, se rechaza.
* La creación se audita.

---

### US-002 — Registrar persona

Como TenantAdmin, quiero registrar personas para asociarlas como propietarios, residentes o contactos.

#### Criterios de aceptación

* Dado un tenant activo, se registra la persona.
* Dado documento duplicado dentro del tenant, se rechaza si el documento existe.
* La persona puede crearse sin usuario.
* La creación se audita.

---

### US-003 — Asociar usuario con persona

Como TenantAdmin, quiero vincular un usuario del sistema con una persona para habilitar permisos de acceso propio.

#### Criterios de aceptación

* UserProfile debe existir.
* Person debe existir en el tenant.
* La vinculación se audita.
* El usuario puede consultar datos propios luego de la vinculación.

---

### US-004 — Registrar propietario de unidad

Como TenantAdmin, quiero asociar propietarios a unidades para mantener el padrón de propiedad.

#### Criterios de aceptación

* La unidad debe existir.
* La persona o entidad propietaria debe existir.
* La relación queda activa.
* El historial previo se conserva.
* La operación se audita.

---

### US-005 — Registrar residente de unidad

Como TenantAdmin, quiero asociar residentes a unidades para mantener el padrón de ocupación.

#### Criterios de aceptación

* La unidad debe existir.
* La persona debe existir.
* La residencia queda activa.
* Pueden existir varios residentes activos por unidad.
* La operación se audita.

---

### US-006 — Consultar unidades del tenant

Como TenantAdmin, quiero listar las unidades del conjunto para administrar el padrón.

#### Criterios de aceptación

* Solo devuelve unidades del tenant activo.
* Soporta filtros.
* Soporta paginación.
* Requiere permiso.

---

### US-007 — Consultar mis unidades

Como propietario, quiero consultar mis unidades para revisar mi información residencial.

#### Criterios de aceptación

* Solo devuelve unidades asociadas a mi persona.
* No devuelve unidades de otros propietarios.
* Requiere usuario vinculado a Person.
* Requiere permiso `.own`.

---

### US-008 — Registrar vehículo

Como administrador o residente autorizado, quiero registrar vehículos asociados a una unidad para control interno.

#### Criterios de aceptación

* La unidad o persona asociada debe existir.
* La placa debe validarse de forma básica.
* El vehículo queda activo.
* La operación se audita.

---

### US-009 — Registrar mascota

Como administrador o residente autorizado, quiero registrar mascotas asociadas a una unidad para control interno.

#### Criterios de aceptación

* La persona o unidad asociada debe existir.
* La mascota queda activa.
* La operación se audita.

---

## 13. Requisitos funcionales

### FR-001 — Crear unidad habitacional

El sistema debe permitir crear unidades dentro de un tenant.

---

### FR-002 — Actualizar unidad habitacional

El sistema debe permitir actualizar datos permitidos de una unidad.

---

### FR-003 — Listar unidades del tenant

El sistema debe permitir listar unidades del tenant activo.

---

### FR-004 — Consultar unidad por ID

El sistema debe permitir consultar una unidad del tenant activo.

---

### FR-005 — Crear persona natural

El sistema debe permitir crear personas dentro de un tenant.

---

### FR-006 — Actualizar persona

El sistema debe permitir actualizar datos permitidos de una persona.

---

### FR-007 — Listar personas

El sistema debe permitir listar personas del tenant activo.

---

### FR-008 — Vincular UserProfile con Person

El sistema debe permitir asociar un usuario local con una persona.

---

### FR-009 — Crear entidad jurídica

El sistema debe permitir registrar entidades jurídicas propietarias o relacionadas.

---

### FR-010 — Registrar propiedad de unidad

El sistema debe permitir asociar propietarios a unidades.

---

### FR-011 — Finalizar propiedad de unidad

El sistema debe permitir cerrar una relación de propiedad.

---

### FR-012 — Registrar residencia

El sistema debe permitir asociar residentes u ocupantes a unidades.

---

### FR-013 — Finalizar residencia

El sistema debe permitir cerrar una relación de residencia.

---

### FR-014 — Registrar arriendo

El sistema debe permitir registrar relación de arriendo básica.

---

### FR-015 — Registrar vehículo

El sistema debe permitir registrar vehículos.

---

### FR-016 — Registrar mascota

El sistema debe permitir registrar mascotas.

---

### FR-017 — Registrar contacto de emergencia

El sistema debe permitir registrar contactos de emergencia.

---

### FR-018 — Consultar datos propios

El sistema debe permitir que propietarios/residentes consulten datos propios mediante permisos `.own`.

---

### FR-019 — Auditar cambios

El sistema debe auditar cambios en personas, unidades, propiedad, residencia y vínculos usuario-persona.

---

### FR-020 — Validar aislamiento multitenant

Todas las operaciones deben validar tenant.

---

## 14. Requisitos no funcionales

### NFR-001 — Seguridad

El sistema debe validar autenticación, tenant, membership y permisos en endpoints privados.

---

### NFR-002 — Multitenancy

Todo registro debe incluir `tenantId`.

---

### NFR-003 — Privacidad

El sistema debe minimizar datos personales y controlar acceso a datos propios.

---

### NFR-004 — Auditoría

Cambios sensibles deben auditarse.

---

### NFR-005 — Trazabilidad histórica

Propiedad y residencia deben conservar historial.

---

### NFR-006 — Integridad

Las relaciones deben validar unidad, persona y tenant.

---

### NFR-007 — Performance

Listados deben ser paginados e indexados.

---

### NFR-008 — Observabilidad

Operaciones críticas deben tener logs, métricas y `traceId`.

---

### NFR-009 — Compatibilidad financiera futura

Unidades y propietarios deben poder ser usados por alícuotas, cargos y estados de cuenta.

---

## 15. Modelo de datos preliminar

### 15.1. Person

```text id="3idvfy"
Person
├── id
├── tenantId
├── userProfileId nullable
├── firstName
├── lastName
├── displayName
├── identificationType
├── identificationNumber
├── email
├── phone
├── whatsapp
├── status
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 15.2. LegalEntity

```text id="jquuqm"
LegalEntity
├── id
├── tenantId
├── name
├── taxIdentificationType
├── taxIdentificationNumber
├── email
├── phone
├── address
├── status
├── createdAt
└── updatedAt
```

---

### 15.3. PropertyUnit

```text id="ejt60b"
PropertyUnit
├── id
├── tenantId
├── code
├── name
├── type
├── block
├── floor
├── addressReference
├── areaM2
├── status
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 15.4. PropertyOwnership

```text id="w43g8z"
PropertyOwnership
├── id
├── tenantId
├── propertyUnitId
├── personId nullable
├── legalEntityId nullable
├── ownershipType
├── ownershipPercentage
├── isPrimary
├── status
├── startDate
├── endDate
├── createdAt
└── updatedAt
```

---

### 15.5. Residency

```text id="drh76a"
Residency
├── id
├── tenantId
├── propertyUnitId
├── personId
├── residencyType
├── isPrimaryResident
├── status
├── startDate
├── endDate
├── createdAt
└── updatedAt
```

---

### 15.6. Lease

```text id="h67n2v"
Lease
├── id
├── tenantId
├── propertyUnitId
├── ownerPersonId nullable
├── ownerLegalEntityId nullable
├── tenantPersonId
├── status
├── startDate
├── endDate
├── createdAt
└── updatedAt
```

---

### 15.7. Vehicle

```text id="0wj7ne"
Vehicle
├── id
├── tenantId
├── propertyUnitId nullable
├── personId nullable
├── plate
├── type
├── brand
├── model
├── color
├── status
├── createdAt
└── updatedAt
```

---

### 15.8. Pet

```text id="s92jyy"
Pet
├── id
├── tenantId
├── propertyUnitId nullable
├── personId nullable
├── name
├── species
├── breed
├── color
├── status
├── createdAt
└── updatedAt
```

---

### 15.9. EmergencyContact

```text id="gjyxcb"
EmergencyContact
├── id
├── tenantId
├── personId
├── name
├── relationship
├── phone
├── email
├── status
├── createdAt
└── updatedAt
```

---

## 16. Permisos iniciales

### 16.1. Personas

```text id="sn326y"
persons.create
persons.read
persons.update
persons.archive
persons.read.own
persons.update.own
```

---

### 16.2. Unidades

```text id="3eu71k"
propertyUnits.create
propertyUnits.read
propertyUnits.update
propertyUnits.archive
propertyUnits.read.own
```

---

### 16.3. Propiedad

```text id="6vzpef"
propertyOwnerships.create
propertyOwnerships.read
propertyOwnerships.update
propertyOwnerships.end
propertyOwnerships.read.own
```

---

### 16.4. Residencia

```text id="1avjml"
residencies.create
residencies.read
residencies.update
residencies.end
residencies.read.own
```

---

### 16.5. Arriendos

```text id="fdfy1h"
leases.create
leases.read
leases.update
leases.end
leases.read.own
```

---

### 16.6. Vehículos

```text id="5w34y6"
vehicles.create
vehicles.read
vehicles.update
vehicles.archive
vehicles.read.own
vehicles.create.own
vehicles.update.own
```

---

### 16.7. Mascotas

```text id="0wgvpl"
pets.create
pets.read
pets.update
pets.archive
pets.read.own
pets.create.own
pets.update.own
```

---

### 16.8. Contactos de emergencia

```text id="h4ztlh"
emergencyContacts.create
emergencyContacts.read
emergencyContacts.update
emergencyContacts.archive
emergencyContacts.read.own
emergencyContacts.create.own
emergencyContacts.update.own
```

---

## 17. API preliminar

### 17.1. Property Units API

```text id="im9bdm"
GET    /api/v1/tenant/property-units
POST   /api/v1/tenant/property-units
GET    /api/v1/tenant/property-units/{propertyUnitId}
PATCH  /api/v1/tenant/property-units/{propertyUnitId}
POST   /api/v1/tenant/property-units/{propertyUnitId}/archive
```

---

### 17.2. Persons API

```text id="j7nus2"
GET    /api/v1/tenant/persons
POST   /api/v1/tenant/persons
GET    /api/v1/tenant/persons/{personId}
PATCH  /api/v1/tenant/persons/{personId}
POST   /api/v1/tenant/persons/{personId}/archive
POST   /api/v1/tenant/persons/{personId}/link-user
```

---

### 17.3. Legal Entities API

```text id="o6u2va"
GET    /api/v1/tenant/legal-entities
POST   /api/v1/tenant/legal-entities
GET    /api/v1/tenant/legal-entities/{legalEntityId}
PATCH  /api/v1/tenant/legal-entities/{legalEntityId}
```

---

### 17.4. Property Ownership API

```text id="o4lxvr"
GET    /api/v1/tenant/property-ownerships
POST   /api/v1/tenant/property-ownerships
GET    /api/v1/tenant/property-ownerships/{ownershipId}
PATCH  /api/v1/tenant/property-ownerships/{ownershipId}
POST   /api/v1/tenant/property-ownerships/{ownershipId}/end
```

---

### 17.5. Residencies API

```text id="0p88z4"
GET    /api/v1/tenant/residencies
POST   /api/v1/tenant/residencies
GET    /api/v1/tenant/residencies/{residencyId}
PATCH  /api/v1/tenant/residencies/{residencyId}
POST   /api/v1/tenant/residencies/{residencyId}/end
```

---

### 17.6. Leases API

```text id="pixih0"
GET    /api/v1/tenant/leases
POST   /api/v1/tenant/leases
GET    /api/v1/tenant/leases/{leaseId}
PATCH  /api/v1/tenant/leases/{leaseId}
POST   /api/v1/tenant/leases/{leaseId}/end
```

---

### 17.7. Vehicles API

```text id="ify2eb"
GET    /api/v1/tenant/vehicles
POST   /api/v1/tenant/vehicles
GET    /api/v1/tenant/vehicles/{vehicleId}
PATCH  /api/v1/tenant/vehicles/{vehicleId}
POST   /api/v1/tenant/vehicles/{vehicleId}/archive
```

---

### 17.8. Pets API

```text id="tcdp9i"
GET    /api/v1/tenant/pets
POST   /api/v1/tenant/pets
GET    /api/v1/tenant/pets/{petId}
PATCH  /api/v1/tenant/pets/{petId}
POST   /api/v1/tenant/pets/{petId}/archive
```

---

### 17.9. Own Data API

```text id="hq72ze"
GET /api/v1/me/person
GET /api/v1/me/property-units
GET /api/v1/me/residencies
GET /api/v1/me/vehicles
GET /api/v1/me/pets
GET /api/v1/me/emergency-contacts
```

---

## 18. Autorización

### 18.1. Reglas generales

Cada endpoint privado requiere:

```text id="r42khq"
1. Token válido.
2. UserProfile activo.
3. Tenant activo.
4. Membership activa.
5. Permiso requerido.
6. Recurso dentro del tenant.
7. Regla de acceso propio, si aplica.
```

---

### 18.2. Acceso administrativo

Ejemplo:

```text id="7mzqgm"
propertyUnits.read
persons.update
residencies.create
```

Permite operar dentro del tenant según rol.

---

### 18.3. Acceso propio

Ejemplo:

```text id="8c6z9j"
propertyUnits.read.own
persons.read.own
vehicles.update.own
```

Requiere:

* `UserProfile` vinculado a `Person`;
* relación vigente entre Person y recurso;
* permiso `.own`.

---

## 19. Auditoría

### 19.1. Eventos auditables

```text id="6jxh9o"
person.created
person.updated
person.archived
person.userLinked
legalEntity.created
legalEntity.updated
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

### 19.2. Campos mínimos

```text id="0bn65h"
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

## 20. Eventos de dominio

Eventos sugeridos:

```text id="1xhz7c"
PersonCreated
PersonUpdated
PersonArchived
UserLinkedToPerson
LegalEntityCreated
LegalEntityUpdated
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

---

## 21. Seguridad

### 21.1. Riesgos principales

| Riesgo                                               | Impacto |
| ---------------------------------------------------- | ------- |
| Usuario ve unidades de otro tenant                   | Crítico |
| Usuario ve datos personales de otro residente        | Crítico |
| Propietario ve unidad ajena                          | Alto    |
| Persona duplicada genera errores financieros futuros | Alto    |
| Unidad duplicada genera cargos incorrectos futuros   | Alto    |
| Se sobrescribe historial de propiedad                | Alto    |
| Se sobrescribe historial de residencia               | Alto    |
| Se almacenan datos personales innecesarios           | Alto    |
| Usuario `.own` accede sin vínculo Person             | Alto    |
| Tenant suspendido sigue operando                     | Alto    |

---

### 21.2. Controles

* tenantId obligatorio;
* TenantGuard;
* TenantPermissionGuard;
* ResourceOwnershipGuard;
* permisos `.own`;
* DTOs específicos;
* auditoría;
* no eliminación física;
* validación de unidad/persona dentro del tenant;
* tests multitenant;
* tests de autorización.

---

## 22. Privacidad

Este módulo contiene datos personales.

Reglas:

* recolectar solo datos necesarios;
* no almacenar datos sensibles innecesarios;
* no exponer personas de otros tenants;
* no exponer información de una unidad ajena;
* no enviar datos reales a IA externa;
* no usar datos reales en seeds;
* no registrar datos personales completos en logs.

---

## 23. Testing

### 23.1. Unit tests

Probar:

* estados de persona;
* estados de unidad;
* estados de propiedad;
* estados de residencia;
* validación de identificación;
* validación de código de unidad;
* validación de porcentaje de propiedad;
* reglas de acceso propio.

---

### 23.2. Integration tests

Probar:

* crear unidad;
* código único por tenant;
* crear persona;
* identificación única por tenant;
* vincular user-person;
* crear propiedad;
* crear residencia;
* cerrar propiedad;
* cerrar residencia;
* crear vehículo;
* crear mascota.

---

### 23.3. API tests

Probar:

* CRUD controlado de unidades;
* CRUD controlado de personas;
* propiedad;
* residencia;
* vehículos;
* mascotas;
* own endpoints.

---

### 23.4. Authorization tests

Probar:

* sin token;
* sin permiso;
* sin membership;
* tenant suspendido;
* usuario de otro tenant;
* `.own` sin vínculo Person;
* `.own` con vínculo válido.

---

### 23.5. Multitenancy tests

Probar:

* Tenant A no accede a personas de Tenant B;
* Tenant A no accede a unidades de Tenant B;
* Tenant A no crea propiedad usando persona de Tenant B;
* Tenant A no crea residencia usando unidad de Tenant B;
* propios de Tenant A no muestran recursos de Tenant B.

---

### 23.6. Security tests

Probar:

* no exponer datos personales innecesarios;
* no logs con identificación completa;
* no eliminar físicamente relaciones históricas;
* no sobrescribir historial;
* validación de payload;
* SQL-like search seguro.

---

## 24. Criterios de aceptación globales

La spec se considera implementada si:

* se crean unidades por tenant;
* se crean personas por tenant;
* se vincula UserProfile con Person;
* se crean propietarios de unidades;
* se crean residentes de unidades;
* se conserva historial de propiedad;
* se conserva historial de residencia;
* se registran vehículos;
* se registran mascotas;
* se registran contactos de emergencia;
* endpoints administrativos validan permisos;
* endpoints `.own` validan vínculo persona-recurso;
* no hay acceso cross-tenant;
* cambios críticos se auditan;
* pruebas unitarias pasan;
* pruebas integración pasan;
* pruebas API pasan;
* pruebas autorización pasan;
* pruebas multitenant pasan;
* pruebas seguridad pasan;
* OpenAPI está actualizado;
* CI pasa.

---

## 25. Casos borde

| Caso                                                       | Resultado esperado |
| ---------------------------------------------------------- | ------------------ |
| Crear unidad con código duplicado en mismo tenant          | 409                |
| Crear unidad con código existente en otro tenant           | permitido          |
| Crear persona con identificación duplicada en mismo tenant | 409                |
| Crear persona con identificación existente en otro tenant  | permitido en MVP   |
| Crear propiedad con persona de otro tenant                 | 403/422            |
| Crear residencia con unidad de otro tenant                 | 403/422            |
| Finalizar propiedad ya finalizada                          | 409                |
| Finalizar residencia ya finalizada                         | 409                |
| Usuario `.own` sin Person vinculada                        | 403                |
| Usuario `.own` con Person vinculada pero sin unidad        | 404/403            |
| Usuario Tenant A consulta unidad Tenant B                  | 403/404            |
| Tenant suspendido intenta crear persona                    | 403                |
| Actualizar identificación sensible sin permiso             | 403                |
| Eliminar físicamente unidad con historial                  | prohibido          |

---

## 26. Dependencias hacia specs futuras

Este módulo habilita:

```text id="nk4jvg"
004-dues-fees
005-payments
006-account-statements
007-audit
008-wordpress-integration
010-reservations
011-fines
012-meetings
```

Especialmente habilita:

* cargos por unidad;
* estados de cuenta por unidad;
* pagos por unidad;
* morosidad por propietario/unidad;
* reservas por residente;
* multas por residente/unidad;
* asistencia por persona;
* votaciones por propietario;
* reportes por tenant.

---

## 27. Archivos derivados esperados

Esta spec debe complementarse con:

```text id="j5dbfy"
docs/specs/003-residents-properties/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 28. Preguntas abiertas

1. ¿Se registrará identificación personal desde MVP o solo datos básicos?
2. ¿Se permitirá que una persona exista en varios tenants con el mismo documento?
3. ¿El porcentaje de propiedad será obligatorio desde MVP?
4. ¿Debe existir siempre un propietario activo por unidad?
5. ¿Debe existir siempre un residente principal activo por unidad?
6. ¿Se permitirán unidades sin propietario temporalmente?
7. ¿Se registrarán arrendamientos formalmente desde MVP o solo residencia tipo arrendatario?
8. ¿Los vehículos se asociarán a persona, unidad o ambos?
9. ¿Las mascotas se asociarán a persona, unidad o residencia?
10. ¿Qué datos podrán actualizar los residentes por sí mismos?
11. ¿Se requerirá aprobación administrativa para cambios `.own`?
12. ¿Se manejarán menores de edad en MVP?

---

## 29. Decisión inicial para MVP

Para MVP se recomienda:

```text id="g8zhj3"
- Crear unidades habitacionales.
- Crear personas naturales.
- Permitir LegalEntity de forma básica.
- Vincular UserProfile con Person.
- Registrar propietarios con PropertyOwnership.
- Registrar residentes con Residency.
- Registrar Lease básico, pero sin gestión documental avanzada.
- Registrar vehículos.
- Registrar mascotas.
- Registrar contactos de emergencia.
- Usar estados e historial.
- No eliminar físicamente.
- No validar oficialmente identificaciones.
- No registrar datos sensibles innecesarios.
- Habilitar permisos .own básicos.
- Diferir documentos legales adjuntos.
- Diferir control de visitas.
- Diferir parqueaderos avanzados.
```

---

## 30. Conclusión

El módulo `003-residents-properties` define el padrón residencial operativo de RESIDENT Core.

Este módulo conecta tenants, usuarios, personas, unidades, propietarios y residentes.

Es requisito previo para módulos financieros, porque alícuotas, cargos, pagos y estados de cuenta necesitan saber:

```text id="fz903e"
qué unidad existe,
quién es propietario,
quién reside,
quién puede consultar datos propios,
y qué actor ejecuta cada operación.
```

La implementación debe priorizar seguridad, multitenancy, privacidad, trazabilidad histórica y preparación para procesos financieros futuros.
