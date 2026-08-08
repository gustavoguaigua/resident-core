# Security Notes — Spec 003 Residents, Owners, Tenants and Property Units

## 1. Información del documento

| Campo           | Valor                                                   |
| --------------- | ------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                           |
| Spec ID         | 003                                                     |
| Módulo          | Residents and Properties                                |
| Documento       | Security Notes                                          |
| Ruta            | `docs/specs/003-residents-properties/security-notes.md` |
| Versión         | 0.1                                                     |
| Estado          | Borrador inicial                                        |
| Fecha           | 2026-07-14                                              |
| Documento base  | `docs/specs/003-residents-properties/spec.md`           |
| Plan técnico    | `docs/specs/003-residents-properties/plan.md`           |
| Modelo de datos | `docs/specs/003-residents-properties/data-model.md`     |
| Contrato API    | `docs/specs/003-residents-properties/api-contract.md`   |
| Plan de pruebas | `docs/specs/003-residents-properties/test-plan.md`      |
| Tareas          | `docs/specs/003-residents-properties/tasks.md`          |
| Depende de      | `001-tenants`, `002-users-roles`                        |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `003-residents-properties`.

El módulo administra datos críticos del padrón residencial:

* personas;
* propietarios;
* residentes;
* arrendatarios;
* ocupantes;
* unidades habitacionales;
* relaciones de propiedad;
* relaciones de residencia;
* arriendos básicos;
* vehículos;
* mascotas;
* contactos de emergencia;
* relación entre `UserProfile` y `Person`;
* acceso propio mediante permisos `.own`.

Este módulo contiene datos personales y relaciones operativas que serán usadas por módulos financieros posteriores. Por tanto, un error de seguridad aquí puede provocar:

* exposición de datos personales;
* acceso a unidades de otro tenant;
* cargos financieros incorrectos;
* estados de cuenta asignados a propietarios equivocados;
* acceso indebido de residentes a información ajena;
* errores de auditoría;
* pérdida de trazabilidad histórica.

Regla principal:

```text id="i58kwr"
El padrón residencial es una fuente crítica para seguridad, privacidad y operación financiera futura.
```

---

## 3. Principios de seguridad

### 3.1. Tenant como frontera obligatoria

Todo recurso del módulo pertenece a un tenant.

```text id="f3l5wk"
tenantId es obligatorio en toda entidad operativa.
```

Aplica a:

```text id="hx7o2j"
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

---

### 3.2. Autorización backend obligatoria

El backend debe validar siempre:

```text id="wlvt6m"
1. Token válido.
2. UserProfile activo.
3. Tenant activo.
4. Membership activa.
5. Permiso requerido.
6. Recurso pertenece al tenant.
7. Relación .own cuando aplique.
```

El frontend no es control de seguridad suficiente.

---

### 3.3. Acceso `.own` no equivale a acceso general

Un usuario con permiso `.own` solo puede consultar recursos vinculados a su `Person`.

Ejemplo:

```text id="kdv6na"
propertyUnits.read.own
```

no permite listar todas las unidades del tenant.

Solo permite consultar unidades donde la persona vinculada al usuario sea:

* propietaria activa;
* residente activa;
* arrendataria activa;
* ocupante autorizado según política.

---

### 3.4. Historial protegido

No se debe eliminar ni sobrescribir historia de:

* propiedad;
* residencia;
* arriendos;
* vínculos usuario-persona;
* unidades con relaciones;
* personas con relaciones.

Regla:

```text id="bvv6od"
Los cambios históricos se cierran, no se borran.
```

---

### 3.5. Minimización de datos personales

Recolectar solo datos necesarios para operar el conjunto residencial.

No registrar datos sensibles si no son necesarios para el MVP.

---

## 4. Activos protegidos

Activos directos:

```text id="u5zggm"
persons
legal_entities
property_units
property_ownerships
residencies
leases
vehicles
pets
emergency_contacts
user_profile_person_links
own_resource_relationships
```

Activos indirectos futuros:

```text id="x0fn6c"
dues
charges
account_statements
payments
late_fees
reservations
fines
meetings
voting
audit_logs
reports
```

---

## 5. Datos sensibles del módulo

### 5.1. Datos personales

El módulo puede almacenar:

```text id="h0k7z9"
displayName
firstName
lastName
identificationType
identificationNumber
email
phone
whatsapp
emergencyContact name
emergencyContact phone
vehicle plate
pet name
residential relationships
ownership relationships
```

---

### 5.2. Datos relacionales sensibles

Aunque algunos datos no parezcan sensibles por separado, su combinación puede serlo:

```text id="jj102j"
Persona → Unidad
Persona → Propiedad
Persona → Residencia
Persona → Vehículo
Persona → Contacto de emergencia
Usuario → Persona
Usuario → Unidad
```

Estas relaciones revelan dónde vive una persona, qué posee, con quién se relaciona y cómo puede contactarse.

---

### 5.3. Datos que no deben almacenarse en MVP

No almacenar en esta spec:

```text id="s5c211"
datos médicos
datos biométricos
fotografías de identificación
copia de cédula
contratos adjuntos
firma electrónica
geolocalización precisa
información bancaria
datos de menores salvo política específica
antecedentes penales
documentos legales completos
observaciones sensibles de convivencia
```

---

## 6. Superficies de ataque

### 6.1. Property Units API

Ruta:

```text id="i8mm10"
/api/v1/tenant/property-units
```

Riesgos:

* listar unidades de otro tenant;
* crear unidades duplicadas;
* modificar unidades usadas en cargos futuros;
* archivar unidades con relaciones activas;
* usar unidad de otro tenant en ownership/residency;
* preparar datos financieros incorrectos.

---

### 6.2. Persons API

Ruta:

```text id="yr974w"
/api/v1/tenant/persons
```

Riesgos:

* exposición de datos personales;
* identificación visible sin permiso;
* duplicidad de personas;
* vincular UserProfile equivocado;
* usar persona de otro tenant;
* editar datos sensibles sin control;
* crear personas con payload malicioso.

---

### 6.3. Legal Entities API

Ruta:

```text id="zv6gi3"
/api/v1/tenant/legal-entities
```

Riesgos:

* duplicidad de identificación tributaria;
* exposición de RUC o datos tributarios;
* entidad de otro tenant usada como propietaria;
* modificación indebida de propietarios jurídicos.

---

### 6.4. Property Ownerships API

Ruta:

```text id="q4rxwx"
/api/v1/tenant/property-ownerships
```

Riesgos:

* asignar propietario incorrecto;
* mezclar persona/unidad de tenants distintos;
* sobrescribir historial de propiedad;
* exceder porcentaje de propiedad;
* finalizar propietario activo sin auditoría;
* afectar estados de cuenta futuros.

---

### 6.5. Residencies API

Ruta:

```text id="zs36o6"
/api/v1/tenant/residencies
```

Riesgos:

* asignar residente a unidad equivocada;
* mezclar tenants;
* exponer dónde vive una persona;
* mantener residente activo incorrectamente;
* sobrescribir historial;
* afectar permisos `.own`.

---

### 6.6. Leases API

Ruta:

```text id="mhat9s"
/api/v1/tenant/leases
```

Riesgos:

* asociar arrendatario equivocado;
* usar propietario de otro tenant;
* crear arriendo sin propietario;
* crear arriendo con persona y entidad simultáneamente;
* registrar valores monetarios fuera de alcance;
* impactar responsabilidad financiera futura.

---

### 6.7. Vehicles API

Ruta:

```text id="q87rry"
/api/v1/tenant/vehicles
```

Riesgos:

* placa expuesta;
* vehículo asociado a unidad ajena;
* vehículo asociado a persona de otro tenant;
* duplicidad de placas;
* uso para vigilancia no autorizada.

---

### 6.8. Pets API

Ruta:

```text id="jnamct"
/api/v1/tenant/pets
```

Riesgos:

* datos innecesarios;
* exposición de información personal indirecta;
* asociación con unidad ajena;
* uso de datos veterinarios sensibles no permitidos.

---

### 6.9. Emergency Contacts API

Ruta:

```text id="ptiw8h"
/api/v1/tenant/emergency-contacts
```

Riesgos:

* exposición de teléfono de terceros;
* contacto asociado a persona de otro tenant;
* registro de datos médicos o sensibles;
* acceso indebido por residentes no autorizados.

---

### 6.10. Own Resources API

Ruta:

```text id="8smss8"
/api/v1/me/*
```

Riesgos:

* usuario sin `Person` vinculada accede a información;
* usuario ve unidad ajena;
* usuario ve vehículo ajeno;
* usuario ve mascota ajena;
* usuario ve contacto de emergencia ajeno;
* permisos `.own` mal calculados;
* relaciones terminadas siguen otorgando acceso operativo.

---

## 7. Amenazas principales

## 7.1. Cross-tenant access

### Descripción

Un usuario de Tenant A consulta, crea, modifica o relaciona recursos de Tenant B.

### Impacto

Crítico.

### Ejemplo

```text id="9s2s0o"
TenantAdmin de Villa Club crea una residencia usando una persona de Altos del Norte.
```

### Controles

* `tenantId` obligatorio;
* `TenantGuard`;
* `TenantPermissionGuard`;
* queries filtradas por tenant;
* validación de tenant en use cases;
* validación de tenant en repositorios;
* pruebas multitenant.

### Pruebas asociadas

```text id="d0g7zc"
MT-RP-001 a MT-RP-012
API-OWN-005
APP-RES-002
APP-RES-003
APP-OWN-005
APP-OWN-006
```

---

## 7.2. Incorrect `.own` access

### Descripción

Un usuario con permisos propios accede a información de otra persona o unidad.

### Impacto

Crítico.

### Ejemplo

```text id="7ov6vb"
Resident A consulta vehículos de Resident B.
```

### Controles

* `OwnResourcePolicyService`;
* resolver `UserProfile → Person`;
* validar relación activa;
* no confiar en IDs enviados por cliente;
* no devolver recursos ajenos;
* pruebas own access.

### Pruebas asociadas

```text id="tilo12"
SRV-OWN-001 a SRV-OWN-010
API-OWN-PU
API-OWN-COMP
TASK-122
```

---

## 7.3. UserProfile linked to wrong Person

### Descripción

Un usuario se vincula a una persona incorrecta y obtiene acceso propio indebido.

### Impacto

Alto.

### Ejemplo

```text id="myaiet"
UserProfile de un residente se vincula al propietario principal de otra unidad.
```

### Controles

* vinculación solo con permiso `persons.update`;
* auditoría obligatoria `person.userLinked`;
* validación de tenant;
* no permitir vínculo duplicado en el mismo tenant;
* revisión administrativa;
* pruebas de link.

### Pruebas asociadas

```text id="6oqt72"
APP-PER-007
API-PER-LINK
AUD-RP-004
```

---

## 7.4. Historical data overwrite

### Descripción

Se reemplaza propietario o residente anterior en lugar de cerrar la relación histórica.

### Impacto

Alto.

### Ejemplo

```text id="k1ggkw"
Se cambia el propietario de una casa editando el ownership activo anterior en vez de finalizarlo y crear uno nuevo.
```

### Controles

* `PropertyOwnership` con `startDate`, `endDate`, `status`;
* `Residency` con `startDate`, `endDate`, `status`;
* endpoint específico `/end`;
* no DELETE físico;
* auditoría;
* pruebas de historial.

### Pruebas asociadas

```text id="zr50hu"
SEC-HIST-001 a SEC-HIST-005
APP-OWN-010
APP-RES-006
```

---

## 7.5. Duplicate critical records

### Descripción

Se crean unidades, personas, entidades o vehículos duplicados dentro del mismo tenant.

### Impacto

Alto.

### Ejemplos

```text id="olc9r6"
Dos unidades con código Casa 01.
Dos personas con la misma identificación.
Dos vehículos con la misma placa.
```

### Controles

* unique `tenantId + code`;
* unique parcial `tenantId + identificationType + identificationNumber`;
* unique parcial `tenantId + plate`;
* validación en policies;
* pruebas de concurrencia;
* constraints DB.

### Pruebas asociadas

```text id="gqk8f4"
APP-PU-002
APP-PER-003
APP-VEH-005
CONC-RP-001
CONC-RP-002
CONC-RP-005
```

---

## 7.6. Excessive personal data collection

### Descripción

Se almacenan datos personales no necesarios para el MVP.

### Impacto

Alto.

### Ejemplo

```text id="bdsoqb"
Registrar datos médicos, documentos escaneados o datos de menores sin política definida.
```

### Controles

* DTOs restrictivos;
* campos diferidos;
* validación de payload;
* revisión de privacidad;
* no aceptar campos desconocidos sensibles;
* tests de privacidad.

### Pruebas asociadas

```text id="8k60ab"
SEC-PAYLOAD-006
SEC-PRIV-005
TASK-125
```

---

## 7.7. Personal data leakage through logs

### Descripción

Logs contienen identificación, teléfonos, emails, payload completo o relaciones personales.

### Impacto

Alto.

### Controles

* sanitización de logs;
* no loggear payload completo;
* usar IDs internos, `traceId` y códigos de error;
* pruebas de logging;
* auditoría separada y controlada.

### Pruebas asociadas

```text id="20g7xw"
SEC-PRIV-002
SEC-PRIV-003
TASK-127
OBS-RP-008
```

---

## 7.8. Financial future impact

### Descripción

Datos erróneos de unidades, propietarios o residencias afectan módulos financieros futuros.

### Impacto

Crítico.

### Ejemplo

```text id="d77kl4"
Una unidad duplicada genera doble alícuota.
Un propietario incorrecto recibe estado de cuenta ajeno.
```

### Controles

* integridad de `PropertyUnit`;
* ownership histórico;
* constraints;
* no duplicidad;
* auditoría;
* preparación para `004-dues-fees`.

---

## 8. Controles obligatorios por endpoint

## 8.1. `GET /api/v1/tenant/property-units`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `propertyUnits.read`;
* filtro por tenant;
* paginación;
* no incluir datos personales innecesarios.

---

## 8.2. `POST /api/v1/tenant/property-units`

Controles:

* autenticación;
* permiso `propertyUnits.create`;
* `code` único por tenant;
* no recibir `tenantId` desde body;
* validar `areaM2`;
* auditoría `propertyUnit.created`.

---

## 8.3. `PATCH /api/v1/tenant/property-units/{id}`

Controles:

* autenticación;
* permiso `propertyUnits.update`;
* unidad pertenece al tenant activo;
* no modificar `tenantId`;
* no modificar `createdAt`;
* auditoría `propertyUnit.updated`.

---

## 8.4. `POST /api/v1/tenant/property-units/{id}/archive`

Controles:

* autenticación;
* permiso `propertyUnits.archive`;
* unidad pertenece al tenant;
* no eliminación física;
* validar relaciones activas si la política lo exige;
* auditoría `propertyUnit.archived`.

---

## 8.5. `GET /api/v1/tenant/persons`

Controles:

* autenticación;
* permiso `persons.read`;
* solo personas del tenant;
* paginación;
* identificación enmascarada o no expuesta;
* no logs con payload completo.

---

## 8.6. `POST /api/v1/tenant/persons`

Controles:

* autenticación;
* permiso `persons.create`;
* no recibir `tenantId` desde body;
* validar identificación básica;
* validar duplicado dentro del tenant;
* rechazar campos sensibles no permitidos;
* auditoría `person.created`.

---

## 8.7. `PATCH /api/v1/tenant/persons/{id}`

Controles:

* autenticación;
* permiso `persons.update`;
* persona pertenece al tenant;
* no modificar `tenantId`;
* no modificar relaciones históricas desde este endpoint;
* auditoría `person.updated`.

---

## 8.8. `POST /api/v1/tenant/persons/{id}/link-user`

Controles:

* autenticación;
* permiso `persons.update`;
* persona pertenece al tenant;
* `UserProfile` existe;
* usuario tiene o tendrá membership válida según flujo;
* evitar vínculo duplicado indebido;
* auditoría `person.userLinked`;
* evento `UserLinkedToPerson`.

---

## 8.9. `POST /api/v1/tenant/property-ownerships`

Controles:

* autenticación;
* permiso `propertyOwnerships.create`;
* unidad pertenece al tenant;
* propietario persona o entidad pertenece al tenant;
* exactamente uno entre `personId` y `legalEntityId`;
* porcentaje válido;
* no sobrescribir historial;
* auditoría `propertyOwnership.created`.

---

## 8.10. `POST /api/v1/tenant/property-ownerships/{id}/end`

Controles:

* autenticación;
* permiso `propertyOwnerships.end`;
* relación pertenece al tenant;
* relación está activa;
* `endDate >= startDate`;
* no eliminación física;
* auditoría `propertyOwnership.ended`.

---

## 8.11. `POST /api/v1/tenant/residencies`

Controles:

* autenticación;
* permiso `residencies.create`;
* unidad pertenece al tenant;
* persona pertenece al tenant;
* fechas válidas;
* no sobrescribir historial;
* auditoría `residency.created`.

---

## 8.12. `POST /api/v1/tenant/residencies/{id}/end`

Controles:

* autenticación;
* permiso `residencies.end`;
* relación pertenece al tenant;
* relación activa;
* `endDate >= startDate`;
* no eliminación física;
* auditoría `residency.ended`.

---

## 8.13. `POST /api/v1/tenant/leases`

Controles:

* autenticación;
* permiso `leases.create`;
* unidad pertenece al tenant;
* arrendatario pertenece al tenant;
* propietario persona o entidad pertenece al tenant;
* exactamente un propietario;
* no aceptar valores monetarios en MVP;
* auditoría `lease.created`.

---

## 8.14. `POST /api/v1/tenant/vehicles`

Controles:

* autenticación;
* permiso `vehicles.create`;
* al menos persona o unidad;
* referencias pertenecen al tenant;
* placa normalizada;
* placa única por tenant si existe;
* auditoría `vehicle.created`.

---

## 8.15. `POST /api/v1/tenant/pets`

Controles:

* autenticación;
* permiso `pets.create`;
* al menos persona o unidad;
* referencias pertenecen al tenant;
* no aceptar datos veterinarios sensibles;
* auditoría `pet.created`.

---

## 8.16. `POST /api/v1/tenant/emergency-contacts`

Controles:

* autenticación;
* permiso `emergencyContacts.create`;
* persona pertenece al tenant;
* teléfono requerido;
* no aceptar datos médicos;
* auditoría `emergencyContact.created`.

---

## 8.17. `GET /api/v1/me/person`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `persons.read.own`;
* `UserProfile` vinculado a `Person` en tenant activo;
* no devolver identificación completa salvo permiso explícito.

---

## 8.18. `GET /api/v1/me/property-units`

Controles:

* autenticación;
* permiso `propertyUnits.read.own`;
* resolver `Person`;
* devolver solo unidades con ownership o residency activa;
* no devolver unidades de otro tenant;
* no devolver unidades ajenas.

---

## 8.19. `GET /api/v1/me/vehicles`

Controles:

* autenticación;
* permiso `vehicles.read.own`;
* resolver `Person`;
* devolver vehículos por persona o unidades propias;
* no devolver vehículos ajenos.

---

## 8.20. `GET /api/v1/me/emergency-contacts`

Controles:

* autenticación;
* permiso `emergencyContacts.read.own`;
* resolver `Person`;
* devolver solo contactos asociados a esa persona;
* no devolver contactos de otra persona.

---

## 9. Reglas de multitenancy

### 9.1. Regla principal

Todo recurso consultado o modificado debe cumplir:

```text id="djuxqy"
resource.tenantId == currentTenant.id
```

---

### 9.2. Relaciones entre entidades

Al crear relaciones, todas las entidades deben pertenecer al mismo tenant:

```text id="jz2tp5"
propertyUnit.tenantId == currentTenant.id
person.tenantId == currentTenant.id
legalEntity.tenantId == currentTenant.id
```

---

### 9.3. Prohibición

Está prohibido:

```text id="19f0so"
crear ownership, residency, lease, vehicle, pet o emergencyContact usando recursos de tenants distintos.
```

---

### 9.4. Respuesta recomendada

Para referencias cross-tenant:

```text id="q275d1"
403 CROSS_TENANT_REFERENCE
```

o, cuando se busque ocultar existencia del recurso:

```text id="bj9w92"
404 NOT_FOUND
```

La política debe ser consistente por tipo de endpoint.

---

## 10. Reglas de acceso `.own`

### 10.1. Resolver persona vinculada

Para cualquier endpoint `.own`, el sistema debe ejecutar:

```text id="dq0ykl"
currentUser.userProfileId
  ↓
Person where userProfileId = currentUser.userProfileId
AND tenantId = currentTenant.id
AND status = active
```

Si no existe:

```text id="2nzkkt"
403 OWN_PERSON_NOT_LINKED
```

---

### 10.2. Acceso a unidades propias

Una unidad es propia si existe al menos una relación activa:

```text id="e3oaiz"
PropertyOwnership.personId = currentPerson.id
OR
Residency.personId = currentPerson.id
```

y:

```text id="25zdoq"
relationship.tenantId = currentTenant.id
relationship.status = active
```

---

### 10.3. Acceso a vehículos propios

Un vehículo es propio si:

```text id="0abqi1"
Vehicle.personId = currentPerson.id
OR
Vehicle.propertyUnitId IN currentPerson.activePropertyUnits
```

---

### 10.4. Acceso a mascotas propias

Una mascota es propia si:

```text id="1f1hc6"
Pet.personId = currentPerson.id
OR
Pet.propertyUnitId IN currentPerson.activePropertyUnits
```

---

### 10.5. Acceso a contactos propios

Un contacto es propio si:

```text id="hhpbox"
EmergencyContact.personId = currentPerson.id
```

---

### 10.6. Relaciones terminadas

Relaciones `ended` no deben otorgar acceso operativo propio.

Si se habilita consulta histórica propia, debe tener permiso separado:

```text id="9tz63v"
propertyUnits.read.own.history
residencies.read.own.history
```

No incluir en MVP salvo decisión explícita.

---

## 11. Reglas de privacidad

### 11.1. Identificación personal

`identificationNumber` debe:

* almacenarse solo si es necesario;
* no mostrarse en listados generales salvo permiso;
* mostrarse enmascarada por defecto;
* no registrarse completo en logs;
* no usarse como label de métricas.

---

### 11.2. Teléfonos y WhatsApp

Teléfonos deben:

* mostrarse solo a usuarios autorizados;
* no aparecer completos en logs;
* no usarse en métricas;
* no exponerse en endpoints `.own` ajenos.

---

### 11.3. Contactos de emergencia

Los contactos de emergencia son datos personales de terceros.

Reglas:

* acceso administrativo restringido;
* acceso propio solo al titular;
* no registrar datos médicos;
* no exponer contactos a otros residentes.

---

### 11.4. Vehículos

La placa puede identificar indirectamente a una persona.

Reglas:

* visible solo a roles autorizados o dueño;
* no loggear placas completas salvo justificación;
* no usar placas reales en seeds.

---

### 11.5. Mascotas

No registrar:

```text id="lkku8m"
historia clínica veterinaria
vacunas detalladas
diagnósticos
observaciones sensibles
```

en MVP.

---

## 12. Reglas de auditoría

### 12.1. Eventos auditables obligatorios

```text id="4benai"
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

### 12.2. Campos mínimos de auditoría

```text id="3g9hzc"
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

### 12.3. Datos a minimizar en auditoría

Evitar guardar:

```text id="yfwacr"
identificationNumber completo
phone completo
whatsapp completo
payload completo de persona
datos de contacto de emergencia completos
placa completa salvo necesidad justificada
```

Cuando se requiera comparar cambios, usar diffs controlados y sanitizados.

---

## 13. Seguridad de logs

### 13.1. Permitido en logs

```text id="kq6hyf"
traceId
tenantId
actorUserId
resourceType
resourceId
action
result
errorCode
latencyMs
```

---

### 13.2. Prohibido en logs

```text id="i2t3zg"
Authorization header
access token
refresh token
identificationNumber completo
phone completo
whatsapp completo
email completo si no es necesario
payload completo
datos médicos
datos de menores
stack trace en producción
```

---

### 13.3. Logs de denegación

Cuando exista acceso denegado, loggear:

```text id="csmhtf"
traceId
tenantId
actorUserId
resourceType
errorCode
```

No loggear el recurso completo ni los datos personales del objetivo.

---

## 14. Seguridad del modelo de datos

### 14.1. `tenant_id` obligatorio

Todas las tablas del módulo deben tener `tenant_id NOT NULL`.

---

### 14.2. `onDelete: Restrict`

Relaciones críticas deben usar:

```text id="sf9tvq"
onDelete: Restrict
```

No usar cascade delete en:

```text id="q7j4rh"
persons
property_units
property_ownerships
residencies
leases
vehicles
pets
emergency_contacts
```

---

### 14.3. Constraints obligatorias

Recomendadas:

```text id="x5p719"
unique tenant+propertyUnit.code
unique parcial tenant+person identification
unique parcial tenant+legalEntity tax identification
unique parcial tenant+vehicle plate
ownership owner XOR
lease owner XOR
vehicle person or unit required
pet person or unit required
date ranges válidos
ownership percentage válido
```

---

### 14.4. Validación en aplicación

La base de datos no reemplaza validación en use cases.

Siempre validar:

```text id="1469nr"
unidad pertenece al tenant
persona pertenece al tenant
entidad jurídica pertenece al tenant
vehículo pertenece al tenant
mascota pertenece al tenant
contacto pertenece al tenant
```

---

## 15. Seguridad de historial

### 15.1. Propiedad

No cambiar directamente propietario histórico para simular transferencia.

Flujo correcto:

```text id="h82jqo"
1. Finalizar PropertyOwnership activo.
2. Crear nuevo PropertyOwnership.
3. Auditar ambas operaciones.
```

---

### 15.2. Residencia

No cambiar directamente persona o unidad en una residencia histórica.

Flujo correcto:

```text id="lhh1hc"
1. Finalizar Residency activo.
2. Crear nuevo Residency.
3. Auditar ambas operaciones.
```

---

### 15.3. Lease

No eliminar lease finalizado.

Flujo correcto:

```text id="wb0qhu"
status = ended
endDate = fecha de fin
```

---

## 16. Seguridad de endpoints `.own`

### 16.1. No confiar en `personId` del cliente

Los endpoints `.own` no deben recibir `personId` como criterio principal.

Deben resolverlo desde:

```text id="jlqjzm"
currentUser.userProfileId
```

---

### 16.2. No confiar en `propertyUnitId` del cliente

Si un endpoint `.own` permite consultar recurso específico, debe validar que la unidad esté dentro de las unidades propias del usuario.

---

### 16.3. Respuesta ante recurso ajeno

Recomendación:

```text id="5ervdz"
404 NOT_FOUND
```

para no revelar existencia de recurso ajeno.

---

## 17. Validación de entrada

### 17.1. IDs

Validar formato de:

```text id="4i5dkv"
personId
propertyUnitId
legalEntityId
ownershipId
residencyId
leaseId
vehicleId
petId
emergencyContactId
```

---

### 17.2. Strings

Aplicar:

* trim;
* longitud máxima;
* rechazo de valores vacíos;
* rechazo o sanitización de scripts;
* normalización cuando aplique.

---

### 17.3. Fechas

Reglas:

```text id="tw44m2"
startDate requerido en relaciones
endDate >= startDate
```

---

### 17.4. Porcentaje

Reglas:

```text id="sfq42e"
ownershipPercentage > 0
ownershipPercentage <= 100
```

Si la política estricta está activa:

```text id="5x5v56"
sum(active ownershipPercentage) <= 100
```

---

### 17.5. Campo `tenantId` en body

Para endpoints tenant-scoped, si el cliente envía `tenantId` en body:

* rechazar con `VALIDATION_ERROR`; o
* ignorar explícitamente según política.

Recomendación:

```text id="k6drb9"
rechazar para evitar ambigüedad y ataques de confusión de tenant.
```

---

## 18. CORS

Endpoints autenticados no deben tener CORS abierto en producción.

Prohibido:

```text id="s4fpv2"
Access-Control-Allow-Origin: *
```

Permitir solo orígenes oficiales de RESIDENT Core.

---

## 19. Rate limiting

Aplicar rate limiting recomendado en:

```text id="rrnm8i"
POST /api/v1/tenant/persons
POST /api/v1/tenant/property-units
POST /api/v1/tenant/persons/{personId}/link-user
GET /api/v1/me/*
```

Objetivos:

* reducir scraping de datos personales;
* reducir enumeración;
* evitar creación masiva abusiva;
* proteger endpoints `.own`.

---

## 20. Seguridad de seeds

### 20.1. Permitido

```text id="9vxp2p"
example.com
personas demo
unidades demo
placas ficticias
contactos ficticios
relaciones demo
```

---

### 20.2. Prohibido

```text id="gozpd5"
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
datos financieros reales
```

---

## 21. Seguridad de errores

### 21.1. Error estándar

```json id="l96aq9"
{
  "error": {
    "code": "CROSS_TENANT_REFERENCE",
    "message": "The referenced resource does not belong to the active tenant.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 21.2. No exponer

No devolver:

```text id="67nem3"
SQL completo
stack trace
identificación completa
teléfono completo
datos personales ajenos
existencia de recurso ajeno si no corresponde
detalles internos de permisos
```

---

### 21.3. Recurso ajeno

Para evitar enumeración, puede responderse:

```text id="j4dekl"
404 NOT_FOUND
```

en lugar de:

```text id="t4o533"
403 FORBIDDEN
```

cuando un usuario intenta acceder a un recurso fuera de su tenant o fuera de su ownership propio.

La política debe ser consistente.

---

## 22. Controles por estado

### 22.1. PersonStatus

| Estado     | Operación ordinaria |
| ---------- | ------------------: |
| `active`   |           Permitida |
| `inactive` |            Limitada |
| `archived` |        No permitida |

---

### 22.2. PropertyUnitStatus

| Estado             |      Operación ordinaria |
| ------------------ | -----------------------: |
| `active`           |                Permitida |
| `inactive`         |                 Limitada |
| `underMaintenance` |                 Limitada |
| `blocked`          | Bloqueada según política |
| `archived`         |             No permitida |

---

### 22.3. OwnershipStatus

| Estado     | Otorga acceso propio operativo |
| ---------- | -----------------------------: |
| `active`   |                             Sí |
| `ended`    |                             No |
| `disputed` |                 Según política |
| `archived` |                             No |

---

### 22.4. ResidencyStatus

| Estado      | Otorga acceso propio operativo |
| ----------- | -----------------------------: |
| `active`    |                             Sí |
| `ended`     |                             No |
| `suspended` |              No ordinariamente |
| `archived`  |                             No |

---

### 22.5. LeaseStatus

| Estado      | Operación ordinaria |
| ----------- | ------------------: |
| `draft`     |            Limitada |
| `active`    |           Permitida |
| `ended`     |        No operativa |
| `cancelled` |        No operativa |
| `archived`  |        No operativa |

---

## 23. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="klrqpz"
- Tenant A no accede a unidades de Tenant B.
- Tenant A no accede a personas de Tenant B.
- Tenant A no crea ownership con unidad de Tenant B.
- Tenant A no crea ownership con persona de Tenant B.
- Tenant A no crea residency con unidad o persona de Tenant B.
- Usuario .own sin Person vinculada recibe 403.
- Usuario .own no ve unidad ajena.
- Usuario .own no ve vehículo ajeno.
- Usuario .own no ve mascota ajena.
- Usuario .own no ve contacto ajeno.
- identificationNumber no aparece completo en listados.
- logs no contienen identificationNumber completo.
- logs no contienen payload personal completo.
- no existen DELETE físicos ordinarios.
- end ownership conserva historial.
- end residency conserva historial.
- vehicle requiere persona o unidad.
- pet requiere persona o unidad.
- ownership exige person XOR legalEntity.
- lease exige ownerPerson XOR ownerLegalEntity.
```

---

## 24. Checklist de seguridad para PR

Antes de aprobar un PR de `003-residents-properties`:

```text id="8c830c"
[ ] Todo modelo tiene tenantId obligatorio.
[ ] No hay cascade delete peligroso.
[ ] No hay DELETE físico ordinario.
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints tenant tienen TenantGuard.
[ ] Endpoints administrativos tienen TenantPermissionGuard.
[ ] Endpoints .own validan OwnResourcePolicyService.
[ ] Queries filtran por tenantId.
[ ] Relaciones validan mismo tenant.
[ ] Personas de otro tenant no son utilizables.
[ ] Unidades de otro tenant no son utilizables.
[ ] LegalEntity de otro tenant no es utilizable.
[ ] UserProfile → Person está auditado.
[ ] Usuario sin Person no accede a .own.
[ ] Usuario no ve recursos ajenos.
[ ] IdentificationNumber se enmascara.
[ ] Teléfonos no aparecen innecesariamente en logs.
[ ] Payload personal completo no aparece en logs.
[ ] Seeds no contienen datos reales.
[ ] Ownership conserva historial.
[ ] Residency conserva historial.
[ ] Lease conserva historial.
[ ] Constraints XOR están implementadas o validadas.
[ ] Tests de autorización pasan.
[ ] Tests .own pasan.
[ ] Tests multitenant pasan.
[ ] Tests de privacidad pasan.
[ ] OpenAPI documenta permisos y policies.
```

---

## 25. Riesgos residuales aceptados en MVP

| Riesgo                                        | Estado                 | Justificación                               |
| --------------------------------------------- | ---------------------- | ------------------------------------------- |
| Validación oficial de cédula/RUC diferida     | Aceptado temporalmente | MVP usa validación básica                   |
| Documentos legales adjuntos diferidos         | Aceptado temporalmente | Requieren módulo de archivos                |
| Firma electrónica diferida                    | Aceptado temporalmente | Requiere spec propia                        |
| Datos de menores diferidos                    | Aceptado temporalmente | Requieren política de privacidad específica |
| Aprobación de cambios por residentes diferida | Aceptado temporalmente | Requiere workflow                           |
| Consulta histórica `.own` diferida            | Aceptado temporalmente | MVP prioriza acceso operativo actual        |
| Parqueaderos avanzados diferidos              | Aceptado temporalmente | Requiere diseño propio                      |
| Control de visitas diferido                   | Aceptado temporalmente | Requiere spec posterior                     |

---

## 26. Pendientes de seguridad para specs futuras

### 26.1. `004-dues-fees`

Debe asegurar que:

* cargos se generen contra unidades válidas;
* unidades archivadas no generen cargos ordinarios;
* propietarios activos estén correctamente resueltos;
* cambios de ownership no alteren cargos históricos.

---

### 26.2. `005-payments`

Debe asegurar que:

* pagos se apliquen a unidades correctas;
* residentes no vean pagos ajenos;
* propietarios vean solo pagos de unidades propias;
* conciliación use unidad y propietario correctos.

---

### 26.3. `006-account-statements`

Debe asegurar que:

* estados de cuenta se generen por unidad;
* acceso `.own` se derive de ownership/residency activa;
* históricos no se alteren por cambios posteriores de propietario.

---

### 26.4. `007-audit`

Debe asegurar:

* auditoría inmutable;
* consulta con permisos;
* retención;
* exportación controlada;
* trazabilidad de cambios de padrón.

---

### 26.5. `00X-documents-files`

Debe cubrir:

* contratos;
* escrituras;
* documentos adjuntos;
* storage privado;
* cifrado;
* permisos;
* expiración de URLs;
* retención documental.

---

## 27. Criterios de aceptación de seguridad

La spec `003-residents-properties` cumple seguridad si:

* todo recurso tiene `tenantId`;
* ningún endpoint privado opera sin autenticación;
* ningún endpoint administrativo opera sin permiso;
* ningún endpoint tenant-scoped opera sin membership activa;
* ningún usuario de Tenant A accede a recursos de Tenant B;
* ninguna relación mezcla persona/unidad/entidad de tenants distintos;
* los endpoints `.own` requieren `UserProfile → Person`;
* los endpoints `.own` no devuelven recursos ajenos;
* identificación personal está enmascarada o controlada;
* logs no contienen datos personales completos;
* ownership conserva historial;
* residency conserva historial;
* lease conserva historial;
* no hay eliminación física ordinaria;
* cambios críticos generan auditoría;
* eventos no contienen datos personales innecesarios;
* OpenAPI documenta permisos;
* tests de autorización pasan;
* tests `.own` pasan;
* tests multitenant pasan;
* tests de privacidad pasan.

---

## 28. Decisión final de seguridad

El módulo `003-residents-properties` será tratado como módulo sensible porque administra el padrón residencial y las relaciones operativas que habilitan la gestión financiera futura.

La seguridad del módulo se basa en:

```text id="uaf7ya"
tenant_id obligatorio
validación de membership
permisos tenant-scoped
políticas .own
relación UserProfile → Person
integridad Person → PropertyUnit
historial con startDate/endDate/status
no eliminación física normal
auditoría obligatoria
eventos sanitizados
logs sin datos personales completos
seeds ficticios
tests de autorización
tests multitenant
tests de privacidad
```

La implementación no será aceptada si permite acceso cross-tenant, acceso `.own` a recursos ajenos, mezcla de personas/unidades de tenants distintos, pérdida de historial, exposición innecesaria de datos personales o eliminación física ordinaria de relaciones históricas.
