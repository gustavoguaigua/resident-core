# Security Notes — Spec 010 Reservations and Common Areas

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                           |
| Spec ID         | 010                                                                                                                                                                     |
| Módulo          | Reservations and Common Areas                                                                                                                                           |
| Documento       | Security Notes                                                                                                                                                          |
| Ruta            | `docs/specs/010-reservations-common-areas/security-notes.md`                                                                                                            |
| Versión         | 0.1                                                                                                                                                                     |
| Estado          | Borrador inicial                                                                                                                                                        |
| Fecha           | 2026-07-18                                                                                                                                                              |
| Documento base  | `docs/specs/010-reservations-common-areas/spec.md`                                                                                                                      |
| Plan técnico    | `docs/specs/010-reservations-common-areas/plan.md`                                                                                                                      |
| Modelo de datos | `docs/specs/010-reservations-common-areas/data-model.md`                                                                                                                |
| Contrato API    | `docs/specs/010-reservations-common-areas/api-contract.md`                                                                                                              |
| Plan de pruebas | `docs/specs/010-reservations-common-areas/test-plan.md`                                                                                                                 |
| Tareas          | `docs/specs/010-reservations-common-areas/tasks.md`                                                                                                                     |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `009-wordpress-integration-basic` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `010-reservations-common-areas`.

El módulo gestiona áreas comunales y reservas dentro de RESIDENT Core. Aunque su operación principal no es puramente financiera, tiene implicaciones importantes de seguridad porque vincula:

* tenants;
* usuarios;
* residentes;
* propietarios;
* unidades habitacionales;
* disponibilidad de áreas;
* calendario operativo;
* posibles cargos;
* auditoría;
* exposición pública limitada hacia WordPress.

Regla central:

```text id="gl4jcu"
Toda reserva debe proteger tenant isolation, autorización por recurso, privacidad de calendario, prevención de doble reserva, trazabilidad de estados e integración financiera controlada.
```

---

## 3. Naturaleza de seguridad del módulo

El módulo de reservas debe tratarse como un módulo transaccional sensible.

Aunque una reserva pueda parecer una operación operativa simple, puede afectar:

* disponibilidad de espacios comunes;
* convivencia residencial;
* cobros asociados;
* conflictos entre residentes;
* responsabilidades administrativas;
* evidencia de uso o no uso de áreas;
* datos personales del solicitante;
* información indirecta sobre presencia, eventos o hábitos de residentes.

Por tanto, el módulo debe proteger:

```text id="ic0bhl"
tenant isolation
own-resource authorization
calendar privacy
state integrity
financial integrity
auditability
availability consistency
public data minimization
```

---

## 4. Principios de seguridad

### 4.1. Tenant isolation obligatorio

Toda área comunal, ventana de disponibilidad, blackout, reserva e historial debe pertenecer a un tenant.

Regla:

```text id="nxb2n7"
commonArea.tenantId == reservation.tenantId == currentTenant.id
```

No se acepta:

```text id="q6zj7k"
consultar reserva solo por reservationId
consultar área solo por commonAreaId
crear reserva con commonAreaId de otro tenant
usar propertyUnitId de otro tenant
usar chargeConceptId de otro tenant
usar chargeId de otro tenant
mezclar calendario de tenants
```

---

### 4.2. Autorización por acción y recurso

La autenticación confirma identidad. La autorización decide qué puede hacer el usuario dentro del tenant.

Regla:

```text id="x5v9ig"
Keycloak autentica; RESIDENT Core autoriza.
```

El módulo debe validar:

* permiso funcional;
* tenant activo;
* membership activa;
* relación usuario-unidad;
* estado del recurso;
* transición permitida;
* visibilidad permitida;
* alcance del endpoint.

---

### 4.3. Protección de recursos propios

Los endpoints `/me` no deben basarse únicamente en que el usuario esté autenticado.

Deben validar:

```text id="ln2xct"
actorUserId -> personId -> propertyUnitId -> reservation
```

Regla:

```text id="i1lbms"
Un residente o propietario solo puede crear, consultar o cancelar reservas asociadas a unidades habitacionales sobre las que tenga relación activa y autorizada.
```

---

### 4.4. Prevención de doble reserva

No debe permitirse que dos reservas activas ocupen la misma área comunal en rangos superpuestos.

Regla de solapamiento:

```text id="gnnh23"
new.startAt < existing.endAt
AND new.endAt > existing.startAt
```

Estados que bloquean disponibilidad:

```text id="hlmr5r"
requested
pendingApproval
approved
```

Estados que no bloquean disponibilidad:

```text id="psrlow"
rejected
cancelled
completed
noShow
expired
archived
```

---

### 4.5. Consistencia transaccional

La creación y aprobación de reservas deben ejecutarse de forma transaccional.

Regla:

```text id="upevql"
No crear ni aprobar una reserva hasta validar dentro de la misma transacción área, disponibilidad, blackout, conflictos, tenant y permisos.
```

Mecanismo MVP recomendado:

```text id="gyof0s"
transaction + pg_advisory_xact_lock(commonAreaId) + conflict query
```

---

### 4.6. Integridad de estados

Las reservas no pueden cambiar de estado arbitrariamente.

Debe existir una máquina de estados que impida transiciones inválidas.

Ejemplos prohibidos:

```text id="g7tjxu"
cancelled -> approved
rejected -> approved
completed -> cancelled
archived -> approved
noShow -> completed
```

---

### 4.7. Auditoría obligatoria

Toda operación crítica debe generar evidencia auditable.

Incluye:

```text id="agcu1u"
creación de área
actualización de área
cambios de estado de área
configuración de disponibilidad
creación/cancelación de blackout
creación de reserva
aprobación
rechazo
cancelación
completado
no show
generación de cargo
conflictos relevantes
```

---

### 4.8. Historial funcional de estados

Además de auditoría global, cada cambio de estado de reserva debe registrar `ReservationStatusHistory`.

Regla:

```text id="jr12kd"
AuditLog explica quién hizo qué y cuándo; ReservationStatusHistory preserva la evolución funcional de la reserva.
```

---

### 4.9. Finanzas desacopladas

El módulo puede generar cargos, pero no debe procesar pagos.

Prohibido:

```text id="t9knnd"
confirmar pagos
asignar pagos
revertir pagos
subir comprobantes
aprobar comprobantes
modificar estados de cuenta
modificar saldos directamente
```

---

### 4.10. WordPress public-safe

WordPress solo puede consultar catálogo público de áreas comunales.

Prohibido para WordPress público:

```text id="qzqs8d"
crear reservas
ver calendario interno
ver reservas existentes
ver solicitantes
ver propertyUnitId
ver chargeId
ver paymentStatusSnapshot
ver internalRules
ver blackouts internos
ver availability completa
```

---

## 5. Activos protegidos

### 5.1. Activos operativos

```text id="xikjci"
common_areas
common_area_availability_windows
common_area_blackouts
reservations
reservation_status_history
```

---

### 5.2. Activos personales

```text id="ppkwcw"
requesterUserId
requesterPersonId
propertyUnitId
propertyUnitCode
purpose
notes
attendeeCount
reservation dates
calendar usage
```

Aunque algunos de estos campos no sean datos personales directos, pueden revelar patrones de comportamiento o información privada sobre residentes.

---

### 5.3. Activos financieros

```text id="i7plmo"
feeAmount
feeCurrency
feeChargeConceptId
chargeId
paymentStatusSnapshot
```

Estos campos deben tratarse con cuidado porque conectan reservas con cargos y estados financieros.

---

### 5.4. Activos de calendario

```text id="l0pyj5"
startAt
endAt
availability windows
blackouts
reservation status
calendar occupancy
```

El calendario puede revelar actividades, hábitos y disponibilidad de residentes o áreas.

---

### 5.5. Activos públicos

```text id="ydwif9"
public common area name
public description
public type
public capacity
public images
public rules summary
```

Estos activos pueden exponerse a WordPress solo si son explícitamente public-safe.

---

## 6. Clasificación de datos

### 6.1. Datos públicos permitidos para WordPress

```text id="qu9qoj"
publicId
slug
name
description
type
capacity opcional
coverImageUrl
galleryUrls
publicRulesSummary
```

---

### 6.2. Datos internos administrativos

```text id="uxpqd1"
commonAreaId
code
status
isReservable
isPublicVisible
requiresApproval
requiresPayment
feeAmount
feeCurrency
feeChargeConceptId
minimumDurationMinutes
maximumDurationMinutes
reservationAdvanceDays
cancellationLimitHours
internalRules
metadata
```

Estos datos requieren autenticación y permisos administrativos.

---

### 6.3. Datos propios del residente

```text id="pqhmxu"
reservationId
commonAreaId
commonAreaName
propertyUnitId propio
propertyUnitCode propio
startAt
endAt
status
purpose propio
attendeeCount propio
feeAmount propio
feeCurrency
paymentStatusSnapshot propio
```

Solo deben mostrarse al usuario asociado a la unidad.

---

### 6.4. Datos de terceros en calendario propio

En vista `/me`, los terceros solo deben aparecer como ocupación genérica.

Permitido:

```text id="dpt3gj"
startAt
endAt
status = busy
label = busy
isOwn = false
```

Prohibido:

```text id="cdddrv"
reservationId de tercero
propertyUnitId de tercero
propertyUnitCode de tercero
requesterUserId de tercero
requesterPersonId de tercero
purpose de tercero
notes de tercero
chargeId de tercero
paymentStatusSnapshot de tercero
```

---

### 6.5. Datos sensibles o restringidos

```text id="aadlux"
tokens
cookies
authorization headers
datos personales innecesarios
datos financieros detallados
comprobantes
audit metadata completa
payloads completos
stack traces
```

---

## 7. Superficies de ataque

### 7.1. Endpoints administrativos de áreas comunales

```text id="air554"
GET    /api/v1/tenant/common-areas
POST   /api/v1/tenant/common-areas
GET    /api/v1/tenant/common-areas/{commonAreaId}
PATCH  /api/v1/tenant/common-areas/{commonAreaId}
POST   /api/v1/tenant/common-areas/{commonAreaId}/activate
POST   /api/v1/tenant/common-areas/{commonAreaId}/deactivate
POST   /api/v1/tenant/common-areas/{commonAreaId}/mark-maintenance
POST   /api/v1/tenant/common-areas/{commonAreaId}/archive
```

Riesgos:

* creación de áreas con datos inseguros;
* cambio indebido de estado;
* publicación accidental;
* configuración financiera inválida;
* exposición de reglas internas;
* cross-tenant access.

Controles:

```text id="p8cxs2"
AuthGuard
TenantGuard
PermissionGuard
tenant_id filter
DTO validation
public-safe mapper
audit events
safe errors
```

---

### 7.2. Endpoints de disponibilidad

```text id="quhgu6"
GET    /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
POST   /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
PATCH  /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}
POST   /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}/archive
```

Riesgos:

* horarios inválidos;
* ventanas superpuestas ambiguas;
* modificación no autorizada;
* disponibilidad de otro tenant;
* configuración que permita reservas fuera de horario.

Controles:

```text id="cjvsaq"
validación startTime < endTime
validación dayOfWeek
tenant filter
permission commonAreas.manageAvailability
audit
tests de disponibilidad
```

---

### 7.3. Endpoints de blackouts

```text id="ljse23"
GET    /api/v1/tenant/common-areas/{commonAreaId}/blackouts
POST   /api/v1/tenant/common-areas/{commonAreaId}/blackouts
POST   /api/v1/tenant/common-areas/{commonAreaId}/blackouts/{blackoutId}/cancel
```

Riesgos:

* bloqueo malicioso de áreas;
* cancelación no autorizada;
* rango inválido;
* reason con datos personales;
* bypass de blackouts al crear reservas.

Controles:

```text id="izp3c3"
permission commonAreas.manageBlackouts
reason requerido
range validation
audit
blackout conflict check
safe logging
```

---

### 7.4. Endpoints administrativos de reservas

```text id="j0he3g"
GET    /api/v1/tenant/reservations
POST   /api/v1/tenant/reservations
GET    /api/v1/tenant/reservations/{reservationId}
POST   /api/v1/tenant/reservations/{reservationId}/approve
POST   /api/v1/tenant/reservations/{reservationId}/reject
POST   /api/v1/tenant/reservations/{reservationId}/cancel
POST   /api/v1/tenant/reservations/{reservationId}/complete
POST   /api/v1/tenant/reservations/{reservationId}/mark-no-show
POST   /api/v1/tenant/reservations/{reservationId}/generate-charge
```

Riesgos:

* doble reserva;
* aprobación indebida;
* rechazo sin razón;
* cancelación sin justificación;
* cargo duplicado;
* transición inválida;
* manipulación de estado;
* acceso a reservas de otro tenant;
* exposición de datos de solicitantes.

Controles:

```text id="w4mnfw"
permissions por endpoint
state machine
transaction
advisory lock
conflict detection
blackout validation
availability validation
idempotency
audit
status history
```

---

### 7.5. Endpoints `/me`

```text id="kfyyzn"
GET    /api/v1/me/reservations
POST   /api/v1/me/reservations
GET    /api/v1/me/reservations/{reservationId}
POST   /api/v1/me/reservations/{reservationId}/cancel
GET    /api/v1/me/common-areas/{commonAreaId}/calendar
```

Riesgos:

* usuario reserva unidad ajena;
* usuario consulta reserva ajena;
* usuario cancela reserva ajena;
* usuario deduce información de terceros;
* filtrado por propertyUnitId ajeno;
* calendar privacy leak.

Controles:

```text id="cjzm59"
OwnReservationGuard
ReservationOwnershipService
property unit access validation
calendar DTO minimizado
terceros como busy
no purpose de terceros
no requester data de terceros
```

---

### 7.6. Endpoints públicos WordPress

```text id="dfl7yx"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

Riesgos:

* exposición de reservas;
* exposición de calendario;
* exposición de reglas internas;
* exposición de información financiera;
* enumeración de áreas;
* scraping;
* CORS inseguro.

Controles heredados de `009`:

```text id="oi636h"
public-safe DTO
tenant by slug
CORS restricted
rate limiting
safe cache
no reservation data
no calendar data
no private personal data
```

---

## 8. Amenazas principales

## 8.1. Doble reserva

### Descripción

Dos usuarios o procesos crean o aprueban reservas para la misma área y horario superpuesto.

### Impacto

Alto.

### Controles

```text id="v4mxcz"
transaction
advisory lock por commonAreaId
conflict query
approval revalidation
concurrency tests
possible future exclusion constraint
```

### Criterio de seguridad

```text id="jgzigk"
Dos operaciones simultáneas sobre la misma área y rango solapado no deben terminar ambas en estado bloqueante.
```

---

## 8.2. Reserva cross-tenant

### Descripción

Un usuario de Tenant A crea, consulta o modifica reservas de Tenant B.

### Impacto

Crítico.

### Controles

```text id="tdreqj"
tenant_id obligatorio
TenantGuard
repository tenant filter
cross-tenant validation
multitenancy tests
safe 404/403
```

---

## 8.3. Reserva sobre unidad ajena

### Descripción

Un residente crea o cancela una reserva usando una unidad que no le pertenece ni ocupa.

### Impacto

Alto.

### Controles

```text id="b33bt8"
ReservationOwnershipService
OwnReservationGuard
user-person-property unit validation
active relationship validation
own-resource tests
```

---

## 8.4. Exposición de calendario privado

### Descripción

Un usuario ve detalles de reservas de otros residentes.

### Impacto

Alto.

### Controles

```text id="heudpu"
own calendar privacy mapper
third-party reservations as busy
no requester data
no propertyUnitId terceros
no purpose terceros
calendar privacy tests
```

---

## 8.5. Exposición pública desde WordPress

### Descripción

WordPress muestra reservas, calendario interno, reglas internas, cargos o datos de solicitantes.

### Impacto

Alto / Crítico según dato expuesto.

### Controles

```text id="r8ssx5"
PublicCommonAreaDto
009 public-safe enforcement
no public reservation endpoint
no public calendar endpoint
OpenAPI negative tests
public WordPress security tests
```

---

## 8.6. Cargo duplicado

### Descripción

Una reserva genera más de un cargo por error, concurrencia o reintento.

### Impacto

Alto.

### Controles

```text id="wmqsuc"
reservation.chargeId unique
Idempotency-Key
transaction
charge lookup before create
financial regression tests
concurrency charge tests
```

---

## 8.7. Manipulación de estados

### Descripción

Una reserva cambia a un estado no permitido o evita flujo de aprobación.

### Impacto

Alto.

### Controles

```text id="i5ajm4"
ReservationStateMachineService
action-specific endpoints
permission guards
status history
audit
state machine tests
```

---

## 8.8. Cancelación abusiva

### Descripción

Un usuario cancela reservas fuera de plazo, reservas ajenas o reservas con impacto financiero sin control.

### Impacto

Medio / Alto.

### Controles

```text id="zdowbz"
cancellationLimitHours
own-resource validation
admin reason required
no automatic charge reversal
audit
policy tests
```

---

## 8.9. Uso inseguro de dinero

### Descripción

El módulo usa `float` o `double` para tarifas.

### Impacto

Alto.

### Controles

```text id="je9e7o"
Decimal(12,2)
ReservationMoney
money as string
financial regression tests
no float tests
```

---

## 8.10. Logs con datos personales

### Descripción

Logs incluyen propósito, notas, solicitantes, unidades, tokens o payload completo.

### Impacto

Alto.

### Controles

```text id="igscvr"
structured logging
metadata minimization
no payload completo
no tokens
no extensive personal data
observability tests
```

---

## 9. Controles por entidad

## 9.1. CommonArea

Debe proteger:

```text id="kjmewk"
tenantId
internalRules
feeChargeConceptId
metadata
```

Controles:

* `tenantId` obligatorio;
* `code` único por tenant;
* `slug` único por tenant;
* `internalRules` solo visible con permisos administrativos;
* `feeChargeConceptId` debe pertenecer al tenant;
* `metadata` sanitizada;
* soft delete mediante `archivedAt`.

---

## 9.2. CommonAreaAvailabilityWindow

Debe proteger:

```text id="fko8ya"
tenantId
commonAreaId
dayOfWeek
startTime
endTime
validFrom
validTo
```

Controles:

* validar `startTime < endTime`;
* validar día;
* validar tenant;
* no usar ventanas archivadas;
* no usar ventanas inactivas;
* auditar cambios.

---

## 9.3. CommonAreaBlackout

Debe proteger:

```text id="u3rs5d"
tenantId
commonAreaId
startAt
endAt
reason
status
createdBy
cancelledBy
```

Controles:

* `reason` obligatorio;
* `startAt < endAt`;
* estado `active` bloquea reservas;
* cancelación conserva historial;
* logs no deben incluir detalles sensibles en `reason` si existieran.

---

## 9.4. Reservation

Debe proteger:

```text id="ov2j3h"
tenantId
commonAreaId
propertyUnitId
requesterUserId
requesterPersonId
purpose
notes
feeAmount
chargeId
status
```

Controles:

* no crear sin tenant;
* no crear sin área;
* validar unidad;
* validar rango;
* validar conflictos;
* validar disponibilidad;
* validar blackouts;
* validar estado;
* money Decimal;
* `chargeId` único;
* no delete físico.

---

## 9.5. ReservationStatusHistory

Debe proteger:

```text id="hez161"
tenantId
reservationId
fromStatus
toStatus
actorUserId
reason
metadata
```

Controles:

* metadata sanitizada;
* no payload completo;
* no tokens;
* no secretos;
* no datos personales innecesarios;
* append-only funcional.

---

## 10. Reglas de autorización

### 10.1. Áreas comunales

| Acción                   | Permiso                          |
| ------------------------ | -------------------------------- |
| Crear área               | `commonAreas.create`             |
| Consultar áreas          | `commonAreas.read`               |
| Actualizar área          | `commonAreas.update`             |
| Archivar área            | `commonAreas.archive`            |
| Gestionar disponibilidad | `commonAreas.manageAvailability` |
| Gestionar blackouts      | `commonAreas.manageBlackouts`    |

---

### 10.2. Reservas administrativas

| Acción                       | Permiso                       |
| ---------------------------- | ----------------------------- |
| Crear reserva administrativa | `reservations.create`         |
| Consultar reservas           | `reservations.read`           |
| Aprobar                      | `reservations.approve`        |
| Rechazar                     | `reservations.reject`         |
| Cancelar                     | `reservations.cancel`         |
| Completar                    | `reservations.complete`       |
| Marcar no show               | `reservations.markNoShow`     |
| Consultar calendario admin   | `reservations.readCalendar`   |
| Generar cargo                | `reservations.generateCharge` |

---

### 10.3. Reservas propias

| Acción                      | Permiso                         |
| --------------------------- | ------------------------------- |
| Crear reserva propia        | `reservations.create.own`       |
| Consultar reservas propias  | `reservations.read.own`         |
| Cancelar reserva propia     | `reservations.cancel.own`       |
| Consultar calendario propio | `reservations.readCalendar.own` |

---

### 10.4. Regla de mínimo privilegio

Un usuario con permiso de lectura no puede mutar.

Un usuario financiero no puede aprobar reservas salvo que tenga permiso explícito.

Un administrador WordPress no hereda permisos del Core.

---

## 11. Reglas de calendario

### 11.1. Calendario administrativo

Puede mostrar:

```text id="t1s6nh"
reservationId
commonAreaId
propertyUnitId
propertyUnitCode
startAt
endAt
status
purpose
attendeeCount
blackouts
availability windows
```

Solo con permisos administrativos.

---

### 11.2. Calendario propio

Puede mostrar reservas propias completas, pero terceros como ocupación genérica.

Ejemplo permitido:

```json id="jp3h4e"
{
  "type": "reservation",
  "startAt": "2026-08-20T14:00:00Z",
  "endAt": "2026-08-20T17:00:00Z",
  "status": "busy",
  "label": "busy",
  "isOwn": false
}
```

---

### 11.3. Calendario público

No existe en MVP.

Prohibido:

```text id="irnsq0"
GET /api/v1/public/tenants/{slug}/calendar
GET /api/v1/public/tenants/{slug}/reservations
GET /api/v1/public/tenants/{slug}/common-areas/{slug}/calendar
```

---

### 11.4. Rango máximo

MVP:

```text id="pq17qd"
31 días por consulta
```

Motivo:

* limitar scraping;
* mejorar performance;
* reducir exposición temporal;
* controlar carga.

---

## 12. Reglas de disponibilidad y conflictos

### 12.1. Validar área

Antes de crear reserva:

```text id="yvbzoy"
commonArea.status = active
AND commonArea.isReservable = true
AND commonArea.archivedAt IS NULL
```

---

### 12.2. Validar rango

```text id="w42jjk"
startAt < endAt
```

MVP rechaza:

```text id="sd0nhx"
reservas multi-día
reservas que cruzan medianoche local
```

---

### 12.3. Validar disponibilidad

La reserva debe estar dentro de una ventana activa.

```text id="rf6xs0"
availabilityWindow.isActive = true
AND availabilityWindow.archivedAt IS NULL
AND reservation local date dentro de validFrom/validTo si existen
```

---

### 12.4. Validar blackouts

Una reserva no puede solaparse con blackout activo.

```text id="c1lhfu"
blackout.status = active
AND blackout.archivedAt IS NULL
AND blackout.startAt < reservation.endAt
AND blackout.endAt > reservation.startAt
```

---

### 12.5. Validar reservas existentes

```text id="z0vxjr"
existing.status IN (requested, pendingApproval, approved)
AND existing.archivedAt IS NULL
AND existing.startAt < new.endAt
AND existing.endAt > new.startAt
```

---

## 13. Reglas financieras

### 13.1. Tarifa de área

Si `requiresPayment = true`:

```text id="qtxmd7"
feeAmount > 0
feeChargeConceptId requerido
feeCurrency requerido
```

---

### 13.2. Snapshot de tarifa

La reserva debe guardar la tarifa aplicada al momento de crear o aprobar la reserva.

Motivo:

```text id="e4q1lp"
Cambios futuros en la tarifa del área no deben alterar reservas históricas.
```

---

### 13.3. Generación de cargo

El cargo debe generarse mediante puerto financiero.

Regla:

```text id="xu4d2s"
Reservations solicita generación de cargo; Financial Management crea el cargo.
```

---

### 13.4. Idempotencia

No se permite más de un cargo activo por reserva.

Controles:

```text id="ptmxjx"
reservation.chargeId unique
Idempotency-Key
lookup before create
transaction
concurrency tests
```

---

### 13.5. Cancelación con cargo

MVP:

```text id="hn8ofz"
Cancelar una reserva no revierte automáticamente el cargo.
```

Cualquier reverso, ajuste o condonación debe ocurrir en módulos financieros.

---

### 13.6. PaymentStatusSnapshot

`paymentStatusSnapshot` es informativo.

No reemplaza:

```text id="y95hzj"
charges
payments
payment_allocations
account_statements
unit_balances
```

---

## 14. Reglas para WordPress

### 14.1. Permitido

WordPress puede consultar:

```text id="w4fumr"
nombre del área
slug
descripción pública
tipo
capacidad opcional
imagen pública
galería pública
resumen público de reglas
```

---

### 14.2. Prohibido

WordPress no puede consultar:

```text id="m48pk0"
reservas
calendario
blackouts internos
availability windows completas
solicitantes
unidades
cargos
estado de pago
reglas internas
historial
auditoría
```

---

### 14.3. Sin creación de reservas desde WordPress

No deben existir endpoints como:

```text id="jxc682"
POST /api/v1/public/tenants/{slug}/reservations
POST /api/v1/public/tenants/{slug}/common-areas/{slug}/reservations
```

---

### 14.4. Coordinación con Spec 009

La exposición pública debe heredar controles de `009-wordpress-integration-basic`:

```text id="d2qb6b"
CORS restringido
rate limiting
cache public-safe
tenant by slug
public visibility
safe DTOs
no datos privados
```

---

## 15. Auditoría

### 15.1. Eventos obligatorios

```text id="p82k2p"
commonArea.created
commonArea.updated
commonArea.activated
commonArea.deactivated
commonArea.markedMaintenance
commonArea.archived
commonAreaAvailability.created
commonAreaAvailability.updated
commonAreaAvailability.archived
commonAreaBlackout.created
commonAreaBlackout.cancelled
reservation.created
reservation.requested
reservation.approved
reservation.rejected
reservation.cancelled
reservation.completed
reservation.noShow
reservation.expired
reservation.chargeGenerated
reservation.chargeGenerationFailed
reservation.conflictDetected
```

---

### 15.2. Metadata permitida

```json id="bio1kh"
{
  "commonAreaId": "common_area_uuid",
  "reservationId": "reservation_uuid",
  "propertyUnitId": "property_unit_uuid",
  "fromStatus": "pendingApproval",
  "toStatus": "approved",
  "startAt": "2026-08-20T14:00:00Z",
  "endAt": "2026-08-20T17:00:00Z",
  "chargeId": "charge_uuid",
  "reason": "Aprobada según disponibilidad.",
  "traceId": "req_123456"
}
```

---

### 15.3. Metadata prohibida

```text id="x5e05h"
payload completo
headers completos
cookies
tokens
comprobantes
datos personales innecesarios
datos financieros detallados no necesarios
notas extensas sin sanitizar
```

---

### 15.4. Eventos de conflicto

No todo intento fallido debe convertirse en audit log de alto volumen.

Auditar conflicto cuando:

```text id="h3fh5x"
intento repetido
posible abuso
operación administrativa sensible
conflicto durante aprobación
conflicto durante concurrencia
```

Para fallos ordinarios, métricas y logs sanitizados pueden ser suficientes.

---

## 16. Logs y métricas

### 16.1. Logs permitidos

```text id="dzan63"
traceId
requestId
endpoint
action
outcome
status
durationMs
errorCode
areaType
```

---

### 16.2. Logs prohibidos

```text id="q6q86t"
payload completo
Authorization header
cookies
tokens
secretos
purpose completo si contiene información privada
notes completas
datos personales extensos
datos financieros detallados
stack trace en producción
```

---

### 16.3. Métricas permitidas

```text id="b6dw5g"
reservations_created_total
reservations_approved_total
reservations_rejected_total
reservations_cancelled_total
reservations_completed_total
reservations_no_show_total
reservations_conflict_total
reservations_charge_generated_total
reservations_charge_generation_failed_total
common_area_calendar_query_latency_ms
```

Labels permitidos:

```text id="z14u6q"
status
action
outcome
areaType
```

Labels prohibidos:

```text id="n7ofzk"
tenantId
reservationId
commonAreaId
propertyUnitId
personId
userId
traceId
ipAddress
```

---

## 17. Errores seguros

### 17.1. Error estándar

```json id="cj2gqq"
{
  "error": {
    "code": "RESERVATION_CONFLICT",
    "message": "The requested time range conflicts with an existing reservation.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 17.2. No revelar

Los errores no deben revelar:

```text id="kb2190"
si una reserva ajena existe
si una unidad ajena existe
si el tenant ajeno existe
SQL interno
stack trace
errores raw de Prisma
configuración interna
datos del solicitante
detalle de reservas de terceros
```

---

### 17.3. 404 vs 403

Para recursos de otro tenant o ajenos, se permite responder:

```text id="qrwpzh"
404 RESOURCE_NOT_FOUND
```

para reducir enumeración.

En endpoints administrativos, puede usarse `403` cuando sea importante comunicar falta de permiso sin revelar datos de otro tenant.

---

## 18. Reglas SQL / Prisma

### 18.1. Consultas obligatorias por tenant

Toda consulta debe incluir:

```text id="apacx6"
tenant_id = currentTenant.id
```

---

### 18.2. Consultas de reserva

Prohibido:

```text id="e7ikrt"
findUnique({ where: { id: reservationId } })
```

Permitido:

```text id="h73753"
findFirst({
  where: {
    id: reservationId,
    tenantId: currentTenant.id
  }
})
```

---

### 18.3. Consultas de conflicto

Deben usar condiciones de solapamiento:

```text id="vopaku"
existing.startAt < new.endAt
AND existing.endAt > new.startAt
```

---

### 18.4. `$queryRaw`

Permitido solo si:

```text id="dlbyca"
usa parámetros bind
no concatena input del usuario
está encapsulado en repositorio
tiene tests
se usa para lock o constraints específicas
```

---

### 18.5. Advisory lock

Si se usa:

```sql id="uknvei"
SELECT pg_advisory_xact_lock(hashtext($1));
```

Reglas:

* `$1` debe ser `commonAreaId`;
* debe ejecutarse dentro de transacción;
* no debe construirse concatenando SQL;
* debe tener tests de concurrencia.

---

## 19. Seguridad de DTOs

### 19.1. Body no debe aceptar `tenantId`

Prohibido en bodies:

```text id="jfzz4n"
tenantId
createdBy
updatedBy
approvedBy
rejectedBy
cancelledBy
closedBy
chargeId manual salvo flujo controlado
status manual salvo endpoint específico
paymentStatusSnapshot manual
```

---

### 19.2. DTO público

`PublicCommonAreaDto` no debe incluir:

```text id="y6e3v2"
internalRules
reservations
calendar
blackouts
availability windows completas
feeChargeConceptId
chargeId
paymentStatusSnapshot
requesterUserId
requesterPersonId
propertyUnitId
audit data
```

---

### 19.3. DTO calendario propio

Para terceros, no incluir:

```text id="s1z0ej"
id
propertyUnitId
propertyUnitCode
requesterUserId
requesterPersonId
purpose
notes
chargeId
paymentStatusSnapshot
```

---

## 20. Seguridad de estados

### 20.1. Transiciones permitidas

```text id="tl0e03"
draft -> requested
requested -> pendingApproval
requested -> approved
pendingApproval -> approved
requested -> rejected
pendingApproval -> rejected
requested -> cancelled
pendingApproval -> cancelled
approved -> cancelled
approved -> completed
approved -> noShow
requested -> expired
pendingApproval -> expired
completed -> archived
cancelled -> archived
rejected -> archived
expired -> archived
noShow -> archived
```

---

### 20.2. Transiciones prohibidas críticas

```text id="hrnlms"
cancelled -> approved
rejected -> approved
completed -> cancelled
archived -> approved
noShow -> completed
approved -> pendingApproval
expired -> approved
```

---

### 20.3. Razones obligatorias

Deben requerir razón:

```text id="jvmvuu"
reject
admin cancel
blackout cancel
mark maintenance
no show si política lo exige
```

---

## 21. Seguridad de concurrencia

### 21.1. Creación de reserva

Flujo seguro:

```text id="q70geo"
1. Abrir transacción.
2. Bloquear commonAreaId.
3. Validar área.
4. Validar disponibilidad.
5. Validar blackouts.
6. Validar conflictos.
7. Crear reserva.
8. Crear status history.
9. Auditar.
10. Confirmar transacción.
```

---

### 21.2. Aprobación de reserva

Flujo seguro:

```text id="h08vu5"
1. Abrir transacción.
2. Bloquear commonAreaId.
3. Cargar reserva por tenant.
4. Validar estado aprobable.
5. Revalidar blackouts.
6. Revalidar conflictos.
7. Generar cargo si aplica.
8. Cambiar estado.
9. Crear status history.
10. Auditar.
11. Confirmar transacción.
```

---

### 21.3. Generación de cargo

Flujo seguro:

```text id="x2w91z"
1. Abrir transacción.
2. Cargar reserva por tenant.
3. Verificar requiresPayment.
4. Verificar chargeId existente.
5. Validar chargeConceptId del tenant.
6. Usar Idempotency-Key.
7. Crear cargo vía módulo financiero.
8. Adjuntar chargeId.
9. Auditar.
10. Confirmar.
```

---

## 22. Seguridad de integración financiera

### 22.1. ReservationChargePort

Debe exponer solo lo necesario:

```text id="re98bd"
tenantId
reservationId
propertyUnitId
chargeConceptId
amount
currency
description
idempotencyKey
actorUserId
traceId
```

No debe recibir:

```text id="oud4gj"
payment data
receipt files
bank information
card data
payment allocation instructions
```

---

### 22.2. Cargo generado

Debe cumplir:

```text id="ieadab"
charge.tenantId = reservation.tenantId
charge.propertyUnitId = reservation.propertyUnitId
charge.sourceType = reservation
charge.sourceId = reservation.id
```

---

### 22.3. No mutación de pagos

El módulo no debe tocar:

```text id="r0d9e5"
payments
payment_receipts
payment_allocations
payment_reversals
```

---

## 23. Seguridad de WordPress

### 23.1. Catálogo público

El catálogo público es informativo. No representa disponibilidad real ni autorización de uso.

Debe indicarse internamente:

```text id="f9c5q1"
Ver un área en WordPress no implica derecho automático a reservarla.
```

---

### 23.2. Sin secretos

WordPress no debe recibir:

```text id="m2sb8l"
tokens del Core
API keys privadas
client secrets
cookies de sesión Core
URLs internas
```

---

### 23.3. Cache

Los endpoints públicos de áreas pueden usar cache solo si la respuesta es public-safe.

No cachear:

```text id="j9qifu"
calendario
reservas
respuestas personalizadas
datos financieros
datos privados
```

---

### 23.4. Futuro WordPress reservations

Las reservas desde WordPress requieren spec futura con:

```text id="f81prp"
SSO
CSRF protection
authorization by user/unit
rate limiting reforzado
abuse prevention
idempotency
audit
```

---

## 24. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="kynflw"
- usuario sin token recibe 401;
- usuario sin permiso recibe 403;
- tenant A no ve áreas tenant B;
- tenant A no ve reservas tenant B;
- tenant A no usa commonAreaId tenant B;
- tenant A no usa propertyUnitId tenant B;
- tenant A no usa chargeConceptId tenant B;
- usuario no reserva unidad ajena;
- usuario no lee reserva ajena;
- usuario no cancela reserva ajena;
- reserva con startAt >= endAt falla;
- reserva fuera de disponibilidad falla;
- reserva sobre blackout falla;
- reserva solapada falla;
- reservas contiguas se permiten;
- dos reservas simultáneas solapadas no pasan ambas;
- aprobación revalida conflicto;
- cargo se genera una sola vez;
- money no usa float;
- cancelación no revierte cargo;
- calendario propio muestra terceros como busy;
- calendario propio no expone datos personales de terceros;
- WordPress no ve reservas;
- WordPress no ve calendario;
- WordPress no ve internalRules;
- WordPress no ve chargeId;
- WordPress no puede crear reservas;
- audit metadata no contiene payload completo;
- logs no contienen tokens;
- OpenAPI no documenta endpoints públicos de reserva.
```

---

## 25. Checklist de seguridad para PR

Antes de aprobar un PR de `010-reservations-common-areas`:

```text id="i7g7d0"
[ ] Todas las tablas nuevas tienen tenant_id.
[ ] Toda consulta filtra por tenant_id.
[ ] No se usa findUnique por id sin tenant.
[ ] No se acepta tenantId desde body.
[ ] commonAreaId se valida contra tenant.
[ ] propertyUnitId se valida contra tenant.
[ ] chargeConceptId se valida contra tenant.
[ ] chargeId se valida contra tenant.
[ ] /me valida relación usuario-unidad.
[ ] /me no permite unidad ajena.
[ ] /me no muestra reservas ajenas.
[ ] Calendario propio muestra terceros como busy.
[ ] Calendario propio no muestra propertyUnitId de terceros.
[ ] Calendario propio no muestra requesterUserId de terceros.
[ ] Calendario propio no muestra purpose de terceros.
[ ] WordPress solo ve áreas públicas activas.
[ ] WordPress no ve reservas.
[ ] WordPress no ve calendario.
[ ] WordPress no ve blackouts internos.
[ ] WordPress no ve internalRules.
[ ] WordPress no ve datos financieros internos.
[ ] No existen endpoints públicos de creación de reservas.
[ ] Se valida startAt < endAt.
[ ] Se rechazan reservas que cruzan medianoche local.
[ ] Se valida disponibilidad.
[ ] Se valida blackout activo.
[ ] Se valida conflicto de reservas.
[ ] Se usa transacción en create/approve.
[ ] Se usa lock o mecanismo equivalente.
[ ] Approval revalida conflicto.
[ ] State machine bloquea transiciones inválidas.
[ ] Rechazo requiere razón.
[ ] Cancelación administrativa requiere razón.
[ ] Money usa Decimal.
[ ] Money sale como string.
[ ] No se usa float/double.
[ ] Cargo es idempotente.
[ ] Cargo no se duplica.
[ ] Reservas no procesan pagos.
[ ] Reservas no modifican comprobantes.
[ ] Cancelación no revierte cargo automáticamente.
[ ] Se crea ReservationStatusHistory.
[ ] Se auditan operaciones críticas.
[ ] Audit metadata está sanitizada.
[ ] Logs no contienen tokens.
[ ] Logs no contienen datos personales extensos.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan reservationId.
[ ] OpenAPI actualizado.
[ ] OpenAPI no documenta reservas públicas.
[ ] Tests de concurrencia pasan.
[ ] Tests financieros pasan.
[ ] Tests de privacidad de calendario pasan.
[ ] Tests public WordPress pasan.
[ ] CI pasa.
```

---

## 26. Riesgos residuales aceptados en MVP

| Riesgo                          | Estado   | Justificación                                      |
| ------------------------------- | -------- | -------------------------------------------------- |
| Sin pagos online                | Aceptado | Pagos se gestionan en módulo financiero/pagos      |
| Sin reverso automático de cargo | Aceptado | Evita efectos financieros automáticos no auditados |
| Sin reservas recurrentes        | Aceptado | Requiere reglas adicionales                        |
| Sin reservas multi-día          | Aceptado | MVP bloquea reservas que cruzan medianoche         |
| Sin calendario público          | Aceptado | Reduce exposición de disponibilidad                |
| Sin QR/check-in/check-out       | Aceptado | Requiere control operativo adicional               |
| Sin inspecciones post-reserva   | Aceptado | Requiere evidencias y flujo de daños               |
| Sin notificaciones automáticas  | Aceptado | Depende de comunicaciones                          |
| Sin reservas desde WordPress    | Aceptado | Requiere autenticación fuerte y SSO                |

---

## 27. Pendientes de seguridad para specs futuras

### 27.1. `00X-reservation-payments`

Debe cubrir:

```text id="iagiae"
pasarela de pagos
idempotencia financiera
CSRF si aplica
confirmación de pago
webhooks de pasarela
comprobantes
reversos
conciliación
```

---

### 27.2. `00X-recurring-reservations`

Debe cubrir:

```text id="fs7la8"
expansión de recurrencias
conflictos por instancia
cancelación de serie
actualización de serie
límites de recurrencia
performance de calendario
```

---

### 27.3. `00X-reservation-access-control`

Debe cubrir:

```text id="whq00n"
QR
validación de ingreso
ventanas de acceso
revocación
control físico
logs de acceso
protección contra reutilización
```

---

### 27.4. `00X-wordpress-reservations`

Debe cubrir:

```text id="aovntx"
SSO
OIDC
CSRF
autorización por unidad
validación de sesión
rate limiting reforzado
anti-abuse
auditoría
```

---

### 27.5. `00X-reservation-notifications`

Debe cubrir:

```text id="wa1jhi"
email
WhatsApp
plantillas
datos mínimos
consentimiento
opt-out
logs sanitizados
reintentos
```

---

## 28. Criterios de aceptación de seguridad

La spec `010-reservations-common-areas` cumple seguridad si:

* toda tabla nueva tiene `tenant_id`;
* toda consulta filtra por tenant;
* los endpoints administrativos requieren autenticación, membership y permisos;
* los endpoints `/me` validan relación usuario-unidad;
* un usuario no puede reservar unidades ajenas;
* un usuario no puede consultar reservas ajenas;
* un usuario no puede cancelar reservas ajenas;
* no se permite doble reserva;
* no se permite reserva sobre blackout activo;
* no se permite reserva fuera de disponibilidad;
* la creación/aprobación usa transacción y lock;
* la aprobación revalida conflictos;
* se bloquean transiciones inválidas;
* toda transición relevante crea historial;
* toda operación crítica se audita;
* los montos usan Decimal y salen como string;
* la generación de cargo es idempotente;
* reservas no procesan pagos;
* cancelaciones no revierten cargos automáticamente;
* calendario propio protege datos de terceros;
* WordPress solo ve catálogo público;
* WordPress no ve reservas ni calendario;
* OpenAPI no documenta endpoints públicos de reservas;
* logs y métricas están sanitizados;
* pruebas de seguridad pasan;
* CI pasa.

---

## 29. Decisión final de seguridad

El módulo `010-reservations-common-areas` será tratado como un módulo transaccional sensible, no como una simple funcionalidad de calendario.

Su seguridad se basa en:

```text id="bv7k0p"
tenant isolation
permissioned access
own-resource authorization
transactional conflict detection
blackout validation
availability validation
state machine enforcement
status history
audit trail
Decimal money
idempotent charge generation
no payment processing
calendar privacy
public-safe WordPress catalog
safe errors
safe logs
safe metrics
OpenAPI consistency
```

No se aceptará una implementación si permite doble reserva, mezcla tenants, permite reservar unidades ajenas, expone reservas privadas a residentes no autorizados, expone calendario interno públicamente, expone reservas a WordPress, genera cargos duplicados, usa float para dinero, procesa pagos directamente, revierte cargos automáticamente sin flujo financiero, elimina historial, omite auditoría o permite transiciones de estado no autorizadas.
