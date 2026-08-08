# Spec 010 — Reservations and Common Areas

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                           |
| Spec ID         | 010                                                                                                                                                                     |
| Módulo          | Reservations and Common Areas                                                                                                                                           |
| Documento       | Functional Specification                                                                                                                                                |
| Ruta            | `docs/specs/010-reservations-common-areas/spec.md`                                                                                                                      |
| Versión         | 0.1                                                                                                                                                                     |
| Estado          | Borrador inicial                                                                                                                                                        |
| Fecha           | 2026-07-18                                                                                                                                                              |
| Prioridad       | Alta                                                                                                                                                                    |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `009-wordpress-integration-basic` |
| Relacionado con | Áreas comunales, reservas, alquiler de espacios, calendario, cargos, pagos, auditoría, portal de residentes futuro                                                      |

---

## 2. Nombre de la funcionalidad

```text id="a55xiu"
Reservations and Common Areas
```

---

## 3. Propósito

El módulo `010-reservations-common-areas` define la gestión de áreas comunales y reservas dentro de RESIDENT Core.

El objetivo es permitir que cada conjunto residencial pueda configurar sus espacios comunales, definir reglas de uso, administrar solicitudes de reserva, aprobar o rechazar solicitudes, controlar disponibilidad, generar cargos asociados cuando corresponda y mantener trazabilidad completa de cada operación.

Regla central:

```text id="m2qsi4"
Toda reserva de área comunal debe pertenecer a un tenant, estar asociada a un área comunal, una unidad habitacional o solicitante autorizado, un rango de fecha/hora, un estado controlado y una trazabilidad auditable.
```

---

## 4. Objetivo funcional

Permitir la administración básica de áreas comunales y reservas en RESIDENT Core, incluyendo:

* registro de áreas comunales;
* configuración de disponibilidad;
* configuración de reglas de reserva;
* configuración de tarifas si aplica;
* solicitud de reserva por administrador o residente autorizado;
* aprobación, rechazo, cancelación y cierre de reservas;
* validación de conflictos de horario;
* control de aforo o capacidad;
* generación opcional de cargos por reserva;
* consulta de calendario;
* consulta de reservas propias;
* consulta administrativa de reservas;
* auditoría de eventos relevantes;
* exposición pública limitada hacia WordPress cuando aplique;
* preparación para portal de residentes y pagos futuros.

---

## 5. Alcance

### 5.1. Incluido en esta spec

Esta spec incluye:

```text id="knb7n5"
1. Gestión de áreas comunales.
2. Configuración básica de reglas de uso.
3. Configuración básica de disponibilidad.
4. Configuración de franjas horarias.
5. Solicitud de reservas.
6. Reservas administrativas.
7. Reservas solicitadas por residente/propietario autorizado.
8. Validación de conflictos de horario.
9. Estados de reserva.
10. Aprobación de reservas.
11. Rechazo de reservas.
12. Cancelación de reservas.
13. Cierre de reservas.
14. Bloqueo manual de disponibilidad.
15. Tarifa básica por reserva.
16. Generación opcional de cargo asociado.
17. Relación con unidad habitacional.
18. Consulta administrativa de reservas.
19. Consulta de reservas propias.
20. Consulta de calendario por área.
21. Consulta pública limitada de áreas visibles.
22. Auditoría de cambios y decisiones.
23. API REST.
24. Pruebas funcionales, financieras, multitenant y de seguridad.
```

---

### 5.2. No incluido en esta spec

Queda fuera del MVP:

```text id="b3fugo"
- Pago en línea de reservas.
- Pasarela de pagos.
- Depósitos en garantía avanzados.
- Penalizaciones automáticas complejas.
- Cálculo avanzado de tarifas por hora/día/temporada.
- Integración con cerraduras inteligentes.
- Control físico de acceso.
- QR de ingreso.
- Inventario detallado del área.
- Check-in/check-out digital.
- Inspección posterior de daños.
- Multas automáticas por daños.
- Contratos PDF avanzados.
- Firma electrónica.
- Envío automático por WhatsApp.
- Envío automático por email.
- Sincronización con Google Calendar.
- Reglas complejas por tipo de residente.
- Reservas recurrentes.
- Lista de espera.
- Subasta o prioridad por sorteo.
- Gestión avanzada de eventos.
- Gestión de invitados.
- Consumo de servicios adicionales.
- Reservas desde WordPress público.
- SSO completo desde WordPress.
```

Estos temas podrán abordarse en specs futuras.

---

## 6. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="jmz6io"
Reservations and Rentals
```

Se relaciona con:

```text id="wemcei"
Tenant Management
Identity and Access
Residents and Properties
Financial Management
Payments and Reconciliation
Account Statements
Audit and Compliance
External Integrations
```

Relación conceptual:

```text id="y2hzot"
Tenant
  └── Common Areas
        └── Reservation Rules
        └── Availability Windows
        └── Reservations
              ├── Requester
              ├── Property Unit
              ├── Approval Workflow
              ├── Optional Charge
              └── Audit Trail
```

---

## 7. Principios

### 7.1. Tenant isolation obligatorio

Toda área comunal y toda reserva pertenece a un único tenant.

Regla:

```text id="ga6s97"
commonArea.tenantId == reservation.tenantId == currentTenant.id
```

---

### 7.2. No doble reserva

No debe permitirse que dos reservas activas usen la misma área comunal en horarios superpuestos.

Regla:

```text id="facfx0"
Una reserva aprobada o pendiente no debe solaparse con otra reserva activa de la misma área, salvo política explícita.
```

---

### 7.3. Estado controlado

Toda reserva debe tener un estado explícito y transiciones permitidas.

---

### 7.4. Trazabilidad obligatoria

Toda creación, aprobación, rechazo, cancelación, cierre o modificación relevante debe auditarse.

---

### 7.5. Finanzas desacopladas pero integrables

El módulo puede generar un cargo asociado a una reserva, pero no procesa pagos directamente.

Regla:

```text id="f5k91i"
Reservations puede solicitar generación de cargos; Payments gestiona pagos y comprobantes.
```

---

### 7.6. Residentes solo acceden a lo propio

Un usuario residente o propietario solo puede consultar y solicitar reservas asociadas a sus unidades autorizadas.

---

### 7.7. WordPress solo ve información pública

WordPress puede mostrar catálogo público de áreas comunales, pero no debe crear reservas en esta spec.

---

### 7.8. Configuración simple primero

El MVP debe priorizar reglas simples y auditables sobre reglas complejas difíciles de mantener.

---

## 8. Actores

### 8.1. TenantAdmin

Administrador del conjunto.

Puede:

* crear áreas comunales;
* editar áreas comunales;
* configurar reglas;
* aprobar reservas;
* rechazar reservas;
* cancelar reservas administrativas;
* bloquear disponibilidad;
* consultar calendario;
* consultar reportes básicos;
* auditar historial.

---

### 8.2. ReservationManager

Rol operativo encargado de gestionar reservas.

Puede:

* consultar áreas;
* consultar reservas;
* aprobar;
* rechazar;
* cancelar;
* cerrar reservas;
* bloquear horarios.

---

### 8.3. Treasurer

Responsable financiero.

Puede:

* consultar cargos generados por reservas;
* validar relación reserva-cargo;
* consultar reportes financieros relacionados;
* no necesariamente aprobar reservas, salvo permiso explícito.

---

### 8.4. PropertyOwner

Propietario asociado a una unidad.

Puede:

* consultar áreas disponibles;
* solicitar reservas para sus unidades;
* consultar sus reservas;
* cancelar sus reservas dentro de política;
* consultar cargos propios asociados a reservas.

---

### 8.5. Resident

Residente asociado a una unidad.

Puede:

* consultar áreas disponibles si el tenant lo permite;
* solicitar reservas si está autorizado por la administración;
* consultar sus reservas;
* cancelar sus reservas dentro de política.

---

### 8.6. PlatformAdmin

Administrador de plataforma.

Puede:

* consultar configuraciones globales;
* apoyar soporte;
* no debe intervenir reservas ordinarias salvo operación excepcional y auditada.

---

### 8.7. Visitante público

Usuario no autenticado desde WordPress.

Puede ver:

* áreas comunales marcadas como públicas;
* descripción general;
* reglas públicas resumidas;
* imágenes públicas.

No puede:

* crear reservas;
* ver disponibilidad interna;
* ver reservas existentes;
* ver nombres de usuarios;
* ver datos financieros.

---

## 9. Definiciones

### 9.1. Área comunal

Espacio compartido dentro del conjunto que puede ser usado o reservado.

Ejemplos:

```text id="x7te80"
salón comunal
cancha múltiple
BBQ
piscina
terraza
parque infantil
sala de reuniones
gimnasio
```

---

### 9.2. Reserva

Solicitud o asignación de uso de un área comunal en un rango de fecha y hora.

---

### 9.3. Bloqueo de disponibilidad

Registro administrativo que impide reservar un área por mantenimiento, evento institucional o restricción temporal.

---

### 9.4. Regla de reserva

Conjunto de condiciones que controla cuándo, quién y cómo puede reservar un área.

---

### 9.5. Tarifa de reserva

Valor económico asociado al uso de un área comunal.

Puede ser:

```text id="xum6dl"
gratuita
monto fijo
monto por hora
monto por franja
monto manual
```

En MVP se recomienda `gratuita` y `monto fijo`.

---

### 9.6. Cargo asociado

Cargo financiero generado desde una reserva aprobada o confirmada.

---

## 10. Supuestos

1. El tenant ya existe.
2. Usuarios, roles y permisos existen.
3. Unidades habitacionales existen.
4. Personas, residentes y propietarios existen.
5. El vínculo usuario-persona-unidad está disponible desde `003-residents-properties`.
6. El módulo de cargos existe desde `004-dues-fees`.
7. El módulo de pagos existe desde `005-payments`.
8. El módulo de estados de cuenta existe desde `006-account-statements`.
9. El módulo de auditoría existe desde `007-audit`.
10. La integración WordPress pública existe desde `009-wordpress-integration-basic`.
11. Toda reserva pertenece a un tenant.
12. Toda reserva debe asociarse a un área comunal.
13. Toda reserva debe tener solicitante.
14. Una reserva de residente debe asociarse a una unidad habitacional.
15. El MVP no implementa pago en línea.
16. El MVP no implementa reservas desde WordPress público.
17. El MVP no implementa reservas recurrentes.
18. El MVP usa zona horaria del tenant; por defecto `America/Guayaquil`.
19. Las fechas se almacenan en UTC.
20. La API devuelve fechas ISO 8601.

---

## 11. Entidades principales

### 11.1. CommonArea

Representa un área comunal reservable o visible.

Campos conceptuales:

```text id="sh3jsn"
CommonArea
├── id
├── tenantId
├── code
├── name
├── description
├── type
├── capacity
├── locationDescription
├── status
├── isReservable
├── isPublicVisible
├── requiresApproval
├── requiresPayment
├── feeAmount
├── feeCurrency
├── feeChargeConceptId
├── minimumDurationMinutes
├── maximumDurationMinutes
├── reservationAdvanceDays
├── cancellationLimitHours
├── publicRulesSummary
├── internalRules
├── coverImageUrl
├── galleryUrls
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.2. CommonAreaAvailabilityWindow

Define horarios disponibles para reservar un área.

```text id="drz03w"
CommonAreaAvailabilityWindow
├── id
├── tenantId
├── commonAreaId
├── dayOfWeek
├── startTime
├── endTime
├── isActive
├── validFrom
├── validTo
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.3. CommonAreaBlackout

Define bloqueos administrativos.

```text id="vybp3o"
CommonAreaBlackout
├── id
├── tenantId
├── commonAreaId
├── startAt
├── endAt
├── reason
├── status
├── createdBy
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.4. Reservation

Representa una reserva.

```text id="z7r1ab"
Reservation
├── id
├── tenantId
├── commonAreaId
├── propertyUnitId
├── requesterUserId
├── requesterPersonId
├── startAt
├── endAt
├── status
├── purpose
├── attendeeCount
├── requiresApproval
├── requiresPayment
├── feeAmount
├── feeCurrency
├── chargeId
├── paymentStatusSnapshot
├── approvedBy
├── approvedAt
├── rejectedBy
├── rejectedAt
├── rejectionReason
├── cancelledBy
├── cancelledAt
├── cancellationReason
├── closedBy
├── closedAt
├── notes
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.5. ReservationStatusHistory

Historial de cambios de estado.

```text id="yq7wnk"
ReservationStatusHistory
├── id
├── tenantId
├── reservationId
├── fromStatus
├── toStatus
├── actorUserId
├── reason
├── occurredAt
└── metadata
```

---

## 12. Estados

### 12.1. CommonAreaStatus

```text id="isfv9r"
active
inactive
maintenance
archived
```

---

### 12.2. ReservationStatus

```text id="ifmqgn"
draft
requested
pendingApproval
approved
rejected
cancelled
completed
noShow
expired
archived
```

---

### 12.3. CommonAreaBlackoutStatus

```text id="kcmm5s"
active
cancelled
expired
archived
```

---

### 12.4. ReservationPaymentStatusSnapshot

```text id="y34eka"
notRequired
pendingCharge
chargeGenerated
pendingPayment
paid
partiallyPaid
waived
cancelled
```

Este campo es un snapshot informativo, no reemplaza el módulo financiero.

---

## 13. Transiciones de estado

### 13.1. Flujo básico sin aprobación

```text id="rcy1m6"
draft -> requested -> approved -> completed
```

---

### 13.2. Flujo con aprobación

```text id="vescj9"
draft -> requested -> pendingApproval -> approved -> completed
```

---

### 13.3. Rechazo

```text id="dr9kiz"
requested -> rejected
pendingApproval -> rejected
```

---

### 13.4. Cancelación

```text id="yab9ye"
requested -> cancelled
pendingApproval -> cancelled
approved -> cancelled
```

---

### 13.5. Expiración

```text id="fcvza5"
requested -> expired
pendingApproval -> expired
```

---

### 13.6. No show

```text id="uoaieu"
approved -> noShow
```

---

### 13.7. Cierre administrativo

```text id="se7dmi"
approved -> completed
```

---

### 13.8. Archivo

```text id="u9nk8w"
completed -> archived
cancelled -> archived
rejected -> archived
expired -> archived
noShow -> archived
```

---

## 14. Reglas de negocio

### BR-001 — Toda área comunal pertenece a un tenant

```text id="gpgufg"
commonArea.tenantId = currentTenant.id
```

---

### BR-002 — Toda reserva pertenece a un tenant

```text id="kq8v2f"
reservation.tenantId = currentTenant.id
```

---

### BR-003 — Toda reserva debe pertenecer a un área comunal activa y reservable

No se puede crear reserva si:

```text id="eokxw1"
commonArea.status != active
commonArea.isReservable != true
```

---

### BR-004 — No se permite solapamiento de reservas activas

Dos reservas de la misma área no pueden solaparse si su estado es:

```text id="oc0zgl"
requested
pendingApproval
approved
```

Regla de solapamiento:

```text id="ybm9hz"
new.startAt < existing.endAt
AND new.endAt > existing.startAt
```

---

### BR-005 — No se permite reservar durante blackout activo

Una reserva no puede solaparse con un bloqueo activo.

---

### BR-006 — La reserva debe respetar ventanas de disponibilidad

La reserva debe estar dentro de una ventana activa para el día correspondiente.

---

### BR-007 — La fecha de inicio debe ser anterior a la fecha de fin

```text id="g3q25c"
startAt < endAt
```

---

### BR-008 — La duración debe respetar mínimos y máximos

Si el área define duración mínima o máxima, la reserva debe cumplirla.

---

### BR-009 — La reserva debe respetar anticipación máxima

Si `reservationAdvanceDays = 30`, no se puede reservar con más de 30 días de anticipación.

---

### BR-010 — La reserva debe respetar límite de cancelación

Si `cancellationLimitHours = 24`, el solicitante no puede cancelar faltando menos de 24 horas, salvo permiso administrativo.

---

### BR-011 — La capacidad no debe excederse

Si `capacity` existe, `attendeeCount` no debe ser mayor.

---

### BR-012 — Un residente solo puede reservar desde una unidad autorizada

La unidad debe estar asociada al usuario mediante `003-residents-properties`.

---

### BR-013 — Un usuario no debe ver reservas de otra unidad

Salvo permisos administrativos.

---

### BR-014 — Las reservas administrativas pueden crearse para cualquier unidad del tenant

Solo con permiso administrativo.

---

### BR-015 — Aprobación requerida según área

Si `commonArea.requiresApproval = true`, la reserva debe entrar en `pendingApproval`.

---

### BR-016 — Pago requerido según área

Si `commonArea.requiresPayment = true`, la reserva debe generar o asociar un cargo.

---

### BR-017 — Cargo generado debe usar concepto financiero válido

Si se genera cargo, debe usar `feeChargeConceptId` configurado y perteneciente al tenant.

---

### BR-018 — El módulo no procesa pagos

Los pagos se gestionan en `005-payments`.

---

### BR-019 — Cancelación no elimina reserva

Toda cancelación cambia estado y conserva historial.

---

### BR-020 — Rechazo debe tener razón

Toda reserva rechazada debe tener `rejectionReason`.

---

### BR-021 — Cancelación administrativa debe tener razón

Toda cancelación realizada por administración debe tener `cancellationReason`.

---

### BR-022 — Cierre debe ser auditado

Completar, cerrar o marcar no show debe registrarse en auditoría.

---

### BR-023 — Área archivada no puede recibir nuevas reservas

El historial permanece disponible.

---

### BR-024 — Área en mantenimiento no puede recibir nuevas reservas

Salvo permiso administrativo explícito y política futura.

---

### BR-025 — WordPress solo puede consultar áreas públicas

WordPress no puede crear reservas en esta spec.

---

### BR-026 — Las reglas internas no son públicas

`internalRules` no debe exponerse por endpoints públicos.

---

### BR-027 — Los montos deben manejarse como Decimal

`feeAmount` debe ser Decimal y salir por API como string.

---

### BR-028 — Toda operación crítica debe auditarse

Eventos mínimos:

```text id="gowi1f"
commonArea.created
commonArea.updated
commonArea.archived
commonAreaAvailability.created
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
```

---

## 15. Historias de usuario

### US-001 — Crear área comunal

Como TenantAdmin, quiero registrar un área comunal para que pueda ser usada o reservada dentro del conjunto.

#### Criterios de aceptación

* Requiere permiso.
* Valida nombre.
* Valida tipo.
* Valida capacidad si existe.
* Valida tarifa si existe.
* Asocia tenant.
* Registra auditoría.

---

### US-002 — Configurar disponibilidad

Como ReservationManager, quiero configurar horarios disponibles para cada área comunal.

#### Criterios de aceptación

* Define día de semana.
* Define hora inicio y fin.
* Valida que inicio < fin.
* No permite ventanas inválidas.
* Registra auditoría.

---

### US-003 — Bloquear disponibilidad

Como administrador, quiero bloquear un área por mantenimiento o evento interno.

#### Criterios de aceptación

* Define fecha/hora inicio y fin.
* Requiere razón.
* Impide nuevas reservas en ese rango.
* No elimina reservas existentes sin acción explícita.
* Registra auditoría.

---

### US-004 — Solicitar reserva propia

Como propietario o residente autorizado, quiero solicitar una reserva para una unidad asociada a mí.

#### Criterios de aceptación

* Usuario autenticado.
* Unidad asociada al usuario.
* Área activa y reservable.
* Horario disponible.
* Sin conflictos.
* Estado según política.
* Registra auditoría.

---

### US-005 — Crear reserva administrativa

Como administrador, quiero crear una reserva para una unidad del tenant.

#### Criterios de aceptación

* Requiere permiso administrativo.
* Puede seleccionar unidad.
* Valida disponibilidad.
* Puede aprobar directamente según permiso.
* Registra auditoría.

---

### US-006 — Aprobar reserva

Como ReservationManager, quiero aprobar una reserva pendiente.

#### Criterios de aceptación

* Requiere permiso.
* Reserva está en estado aprobable.
* Revalida conflictos antes de aprobar.
* Si requiere pago, genera cargo o marca pendiente de cargo.
* Registra aprobador y fecha.
* Registra auditoría.

---

### US-007 — Rechazar reserva

Como ReservationManager, quiero rechazar una reserva con una razón.

#### Criterios de aceptación

* Requiere permiso.
* Reserva está en estado rechazable.
* Razón obligatoria.
* Registra rechazador y fecha.
* Registra auditoría.

---

### US-008 — Cancelar reserva propia

Como residente o propietario, quiero cancelar una reserva propia dentro del plazo permitido.

#### Criterios de aceptación

* Reserva pertenece a unidad autorizada.
* Estado permite cancelación.
* Cumple límite de cancelación.
* Registra razón si aplica.
* Registra auditoría.

---

### US-009 — Cancelar reserva administrativa

Como administrador, quiero cancelar cualquier reserva del tenant por causa justificada.

#### Criterios de aceptación

* Requiere permiso.
* Razón obligatoria.
* Reserva pertenece al tenant.
* Registra actor.
* Registra auditoría.

---

### US-010 — Consultar calendario del área

Como administrador o residente autorizado, quiero consultar disponibilidad y reservas de un área.

#### Criterios de aceptación

* Requiere permiso según vista.
* Respeta tenant.
* Vista residente no expone datos personales de otros solicitantes.
* Permite rango de fechas.
* Devuelve bloqueos y ocupación de forma segura.

---

### US-011 — Consultar mis reservas

Como residente o propietario, quiero ver mis reservas.

#### Criterios de aceptación

* Solo muestra reservas asociadas a mis unidades.
* Permite filtros por estado y fecha.
* No muestra reservas de otras unidades.
* Pagina resultados.

---

### US-012 — Consultar catálogo público de áreas

Como visitante de WordPress, quiero ver áreas comunales visibles del conjunto.

#### Criterios de aceptación

* Solo áreas `isPublicVisible = true`.
* Solo áreas activas.
* No muestra reservas.
* No muestra disponibilidad interna.
* No permite crear reserva.

---

## 16. Requisitos funcionales

### FR-001 — Gestionar áreas comunales

El sistema debe permitir crear, consultar, actualizar, activar, desactivar, poner en mantenimiento y archivar áreas comunales.

---

### FR-002 — Configurar disponibilidad

El sistema debe permitir definir ventanas de disponibilidad por día de semana y rango de horas.

---

### FR-003 — Crear bloqueos

El sistema debe permitir crear bloqueos administrativos para un área comunal.

---

### FR-004 — Cancelar bloqueos

El sistema debe permitir cancelar bloqueos activos.

---

### FR-005 — Solicitar reserva

El sistema debe permitir crear solicitudes de reserva.

---

### FR-006 — Validar conflictos

El sistema debe impedir reservas solapadas con reservas activas o bloqueos activos.

---

### FR-007 — Aprobar reserva

El sistema debe permitir aprobar reservas pendientes.

---

### FR-008 — Rechazar reserva

El sistema debe permitir rechazar reservas con razón.

---

### FR-009 — Cancelar reserva

El sistema debe permitir cancelaciones según reglas y permisos.

---

### FR-010 — Completar reserva

El sistema debe permitir marcar una reserva como completada.

---

### FR-011 — Marcar no show

El sistema debe permitir marcar una reserva aprobada como no show.

---

### FR-012 — Generar cargo por reserva

El sistema debe generar un cargo si el área requiere pago y tiene concepto configurado.

---

### FR-013 — Consultar reservas administrativas

El sistema debe permitir listar reservas del tenant con filtros.

---

### FR-014 — Consultar reservas propias

El sistema debe permitir que residentes/propietarios consulten sus reservas.

---

### FR-015 — Consultar calendario de área

El sistema debe permitir consultar disponibilidad, reservas ocupadas y bloqueos por área.

---

### FR-016 — Consultar áreas públicas

El sistema debe permitir consultar áreas comunales visibles para integración WordPress.

---

### FR-017 — Auditar operaciones

El sistema debe auditar cambios de áreas, disponibilidad, bloqueos y reservas.

---

### FR-018 — Proteger datos personales

El sistema no debe exponer datos personales de solicitantes a usuarios no autorizados.

---

### FR-019 — Proteger datos financieros

El sistema no debe exponer cargos o pagos asociados sin permisos financieros.

---

### FR-020 — Documentar API

El sistema debe documentar endpoints, permisos, errores y estados en OpenAPI.

---

## 17. Requisitos no funcionales

### NFR-001 — Seguridad

Debe cumplir tenant isolation, autorización por permiso y minimización de datos.

---

### NFR-002 — Consistencia

La validación de disponibilidad y conflictos debe ser transaccional.

---

### NFR-003 — Concurrencia

Dos solicitudes simultáneas no deben aprobarse para el mismo espacio y horario.

---

### NFR-004 — Auditoría

Toda transición de estado relevante debe auditarse.

---

### NFR-005 — Performance

Consultas de calendario deben ser eficientes para rangos acotados.

Objetivo MVP:

```text id="uoarxc"
p95 < 700 ms para consultas de calendario de hasta 31 días por área.
```

---

### NFR-006 — Usabilidad

Estados y errores deben ser claros para administradores y residentes.

---

### NFR-007 — Integración financiera

La generación de cargos debe ser idempotente y trazable.

---

### NFR-008 — API-first

Todas las funcionalidades deben exponerse mediante REST API.

---

### NFR-009 — Extensibilidad

El diseño debe permitir reservas recurrentes, pagos en línea, depósitos y portal de residentes futuro.

---

## 18. Permisos iniciales

### 18.1. Gestión de áreas comunales

```text id="xknc0q"
commonAreas.create
commonAreas.read
commonAreas.update
commonAreas.archive
commonAreas.manageAvailability
commonAreas.manageBlackouts
```

---

### 18.2. Gestión administrativa de reservas

```text id="sxjt3p"
reservations.create
reservations.read
reservations.approve
reservations.reject
reservations.cancel
reservations.complete
reservations.markNoShow
reservations.readCalendar
reservations.generateCharge
```

---

### 18.3. Reservas propias

```text id="fmbx8o"
reservations.create.own
reservations.read.own
reservations.cancel.own
reservations.readCalendar.own
```

---

### 18.4. Reportes y auditoría

```text id="sbp8ly"
reservations.audit.read
reservations.reports.read
```

---

### 18.5. Integración pública

```text id="ee3p41"
commonAreas.readPublic
```

Este permiso no aplica necesariamente a endpoints públicos anónimos; representa capacidad interna de exponer áreas públicas bajo política.

---

## 19. Matriz de permisos

| Acción                              | Permiso requerido                |
| ----------------------------------- | -------------------------------- |
| Crear área comunal                  | `commonAreas.create`             |
| Consultar áreas                     | `commonAreas.read`               |
| Actualizar área                     | `commonAreas.update`             |
| Archivar área                       | `commonAreas.archive`            |
| Gestionar disponibilidad            | `commonAreas.manageAvailability` |
| Crear/cancelar blackout             | `commonAreas.manageBlackouts`    |
| Crear reserva administrativa        | `reservations.create`            |
| Crear reserva propia                | `reservations.create.own`        |
| Consultar reservas administrativas  | `reservations.read`              |
| Consultar reservas propias          | `reservations.read.own`          |
| Aprobar reserva                     | `reservations.approve`           |
| Rechazar reserva                    | `reservations.reject`            |
| Cancelar cualquier reserva          | `reservations.cancel`            |
| Cancelar reserva propia             | `reservations.cancel.own`        |
| Completar reserva                   | `reservations.complete`          |
| Marcar no show                      | `reservations.markNoShow`        |
| Consultar calendario administrativo | `reservations.readCalendar`      |
| Consultar calendario propio         | `reservations.readCalendar.own`  |
| Generar cargo                       | `reservations.generateCharge`    |
| Consultar auditoría                 | `reservations.audit.read`        |

---

## 20. API preliminar

### 20.1. Common Areas — administrativo

```text id="mlx0dj"
GET    /api/v1/tenant/common-areas
POST   /api/v1/tenant/common-areas
GET    /api/v1/tenant/common-areas/{commonAreaId}
PATCH  /api/v1/tenant/common-areas/{commonAreaId}
POST   /api/v1/tenant/common-areas/{commonAreaId}/activate
POST   /api/v1/tenant/common-areas/{commonAreaId}/deactivate
POST   /api/v1/tenant/common-areas/{commonAreaId}/mark-maintenance
POST   /api/v1/tenant/common-areas/{commonAreaId}/archive
```

---

### 20.2. Availability

```text id="i48ayu"
GET    /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
POST   /api/v1/tenant/common-areas/{commonAreaId}/availability-windows
PATCH  /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}
POST   /api/v1/tenant/common-areas/{commonAreaId}/availability-windows/{windowId}/archive
```

---

### 20.3. Blackouts

```text id="u56icq"
GET    /api/v1/tenant/common-areas/{commonAreaId}/blackouts
POST   /api/v1/tenant/common-areas/{commonAreaId}/blackouts
POST   /api/v1/tenant/common-areas/{commonAreaId}/blackouts/{blackoutId}/cancel
```

---

### 20.4. Reservations — administrativo

```text id="fbtszj"
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

---

### 20.5. Reservations — propias

```text id="e5k4yo"
GET    /api/v1/me/reservations
POST   /api/v1/me/reservations
GET    /api/v1/me/reservations/{reservationId}
POST   /api/v1/me/reservations/{reservationId}/cancel
```

---

### 20.6. Calendar

```text id="o6kol0"
GET    /api/v1/tenant/common-areas/{commonAreaId}/calendar
GET    /api/v1/me/common-areas/{commonAreaId}/calendar
```

---

### 20.7. Public common areas

Estos endpoints se coordinan con `009-wordpress-integration-basic`:

```text id="a6cbn5"
GET /api/v1/public/tenants/{slug}/common-areas
GET /api/v1/public/tenants/{slug}/common-areas/{commonAreaSlug}
```

En esta spec se define la fuente funcional de áreas comunales; la exposición pública debe seguir las reglas de `009`.

---

## 21. Datos públicos de áreas comunales

Campos permitidos para WordPress:

```text id="ek0cs3"
id público
slug
name
description
type
capacity opcional
coverImageUrl
galleryUrls
publicRulesSummary
isPublicVisible
```

Campos no permitidos para WordPress:

```text id="f5synr"
internalRules
reservation calendar
existing reservations
requester data
propertyUnitId
feeChargeConceptId interno
chargeId
payment status
blackouts internos
audit data
```

---

## 22. Reglas financieras

### 22.1. Reserva gratuita

Si `requiresPayment = false`:

```text id="l7jo8u"
feeAmount = 0
paymentStatusSnapshot = notRequired
```

---

### 22.2. Reserva con pago

Si `requiresPayment = true`:

* debe existir `feeAmount`;
* debe existir `feeChargeConceptId`;
* al aprobar o confirmar, debe generarse cargo si política lo define;
* el cargo debe asociarse a `reservationId`;
* el cargo debe asociarse a `propertyUnitId`.

---

### 22.3. Cargo asociado

El cargo generado debe pertenecer al mismo tenant y unidad.

Regla:

```text id="l2iew9"
charge.tenantId = reservation.tenantId
charge.propertyUnitId = reservation.propertyUnitId
```

---

### 22.4. Idempotencia

La generación de cargo debe ser idempotente.

Regla:

```text id="dnqraf"
Una reserva no debe generar más de un cargo activo por la misma tarifa.
```

---

### 22.5. Cancelación y cargo

En MVP, la cancelación de una reserva con cargo asociado no revierte automáticamente el cargo.

Debe quedar como decisión explícita futura o acción financiera manual.

---

### 22.6. Pagos

El módulo no confirma pagos.

Los pagos se gestionan con:

```text id="mbjwv1"
005-payments
```

---

## 23. Reglas de disponibilidad y conflicto

### 23.1. Solapamiento

Dos reservas se solapan si:

```text id="j9aaau"
A.startAt < B.endAt
AND A.endAt > B.startAt
```

Estados que bloquean disponibilidad:

```text id="dl9h3i"
requested
pendingApproval
approved
```

Estados que no bloquean disponibilidad:

```text id="gmf8wp"
rejected
cancelled
completed
noShow
expired
archived
```

---

### 23.2. Blackouts

Un blackout activo bloquea cualquier reserva superpuesta.

---

### 23.3. Ventanas de disponibilidad

La reserva debe estar contenida dentro de una ventana activa.

---

### 23.4. Concurrencia

La creación/aprobación debe usar una estrategia que evite doble reserva.

Opciones:

```text id="je54bs"
transaction
row locking
exclusion constraint en PostgreSQL
unique business guard
```

La decisión técnica se detallará en `data-model.md` y `plan.md`.

---

## 24. Auditoría

Eventos mínimos:

```text id="sy8ef6"
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

Metadata permitida:

```text id="z821bx"
commonAreaId
reservationId
propertyUnitId
fromStatus
toStatus
startAt
endAt
reason
chargeId
traceId
```

Metadata prohibida:

```text id="q64xfu"
payload completo
datos personales innecesarios
comprobantes
tokens
secretos
datos financieros detallados no necesarios
```

---

## 25. Seguridad

### 25.1. Riesgos principales

| Riesgo                                     | Impacto    |
| ------------------------------------------ | ---------- |
| Doble reserva                              | Alto       |
| Reserva cross-tenant                       | Crítico    |
| Residente reserva unidad ajena             | Alto       |
| Exposición de reservas de otros residentes | Alto       |
| Exposición pública de calendario interno   | Alto       |
| Generación duplicada de cargo              | Alto       |
| Uso de float en tarifas                    | Alto       |
| Cancelación sin política                   | Medio/alto |
| Falta de auditoría                         | Alto       |
| Manipulación de estados                    | Alto       |

---

### 25.2. Controles

```text id="su357z"
tenant isolation
permission guards
ownership/residency validation
availability validation
conflict detection
transactional approval
status transition validation
Decimal money
idempotent charge generation
audit events
public DTO minimization
rate limiting
safe errors
```

---

## 26. Observabilidad

Logs sugeridos:

```text id="ufq4q2"
commonArea.created
commonArea.updated
reservation.created
reservation.approved
reservation.rejected
reservation.cancelled
reservation.conflictDetected
reservation.chargeGenerated
reservation.chargeGenerationFailed
```

Métricas sugeridas:

```text id="p8gd7v"
reservations_created_total
reservations_approved_total
reservations_rejected_total
reservations_cancelled_total
reservations_conflict_total
reservations_charge_generated_total
reservations_charge_generation_failed_total
common_area_calendar_query_latency_ms
```

Labels permitidos:

```text id="n6jl5b"
status
action
outcome
areaType
```

Labels prohibidos:

```text id="vy6mz2"
tenantId
reservationId
propertyUnitId
personId
userId
traceId
```

---

## 27. Testing

### 27.1. Unit tests

Probar:

* validación de estados;
* transiciones permitidas;
* solapamiento;
* duración;
* avance máximo;
* cancelación;
* cálculo de tarifa;
* validación Decimal;
* permisos;
* ownership/residency validation.

---

### 27.2. Integration tests

Probar:

* creación de área;
* disponibilidad;
* bloqueo;
* creación de reserva;
* aprobación;
* rechazo;
* cancelación;
* generación de cargo;
* no doble reserva;
* tenant isolation.

---

### 27.3. API tests

Probar:

* endpoints administrativos;
* endpoints propios;
* calendario;
* errores;
* permisos;
* paginación;
* filtros.

---

### 27.4. Financial regression tests

Probar:

* cargo generado una sola vez;
* cargo pertenece al tenant;
* cargo pertenece a la unidad;
* monto como string;
* cancelación no revierte cargo automáticamente;
* pago no se procesa desde reservas.

---

### 27.5. Security tests

Probar:

* usuario sin permiso no aprueba;
* residente no reserva unidad ajena;
* residente no ve reservas ajenas;
* WordPress no ve calendario interno;
* no se exponen datos personales en calendario propio limitado;
* no hay cross-tenant.

---

## 28. Criterios de aceptación globales

La spec se considera implementada si:

* se pueden crear áreas comunales;
* se pueden configurar disponibilidades;
* se pueden crear bloqueos;
* se pueden crear reservas;
* se validan conflictos;
* se impide doble reserva;
* se pueden aprobar reservas;
* se pueden rechazar reservas;
* se pueden cancelar reservas;
* se pueden completar reservas;
* se puede marcar no show;
* se pueden consultar reservas administrativas;
* se pueden consultar reservas propias;
* se puede consultar calendario;
* se puede generar cargo asociado cuando aplica;
* la generación de cargo es idempotente;
* los montos usan Decimal y salen como string;
* los usuarios solo ven reservas permitidas;
* WordPress solo ve áreas públicas;
* todas las operaciones críticas se auditan;
* OpenAPI está actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas financieras pasan;
* pruebas multitenant pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

## 29. Casos borde

| Caso                                  | Resultado esperado                       |
| ------------------------------------- | ---------------------------------------- |
| Área inexistente                      | 404                                      |
| Área de otro tenant                   | 404/403                                  |
| Área inactiva                         | no reservable                            |
| Área en mantenimiento                 | no reservable                            |
| Área no reservable                    | no permite reserva                       |
| Reserva fuera de horario              | 422                                      |
| Reserva solapada                      | 409                                      |
| Reserva sobre blackout                | 409                                      |
| startAt >= endAt                      | 422                                      |
| Duración menor al mínimo              | 422                                      |
| Duración mayor al máximo              | 422                                      |
| Capacidad excedida                    | 422                                      |
| Reserva con unidad ajena              | 403                                      |
| Usuario sin permiso                   | 403                                      |
| Residente ve reserva ajena            | 403/404                                  |
| Aprobar reserva ya cancelada          | 409                                      |
| Rechazar reserva aprobada             | 409                                      |
| Cancelar reserva completada           | 409                                      |
| Cancelar fuera de plazo               | 409/403                                  |
| Generar cargo sin concepto            | 422                                      |
| Generar cargo duplicado               | retorna cargo existente o 409 controlado |
| WordPress solicita calendario interno | endpoint no existe o 403                 |
| WordPress intenta crear reserva       | endpoint no existe                       |
| Tenant suspendido                     | bloquea nuevas reservas según política   |

---

## 30. Dependencias hacia specs futuras

Este módulo habilita:

```text id="f66qvz"
00X-resident-portal
00X-reservation-payments
00X-reservation-deposits
00X-reservation-penalties
00X-reservation-calendar-sync
00X-reservation-notifications
00X-reservation-qr-access
00X-reservation-inspections
00X-wordpress-reservations
00X-common-area-public-catalog
```

---

## 31. Archivos derivados esperados

```text id="kygwm2"
docs/specs/010-reservations-common-areas/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 32. Preguntas abiertas

1. ¿Todas las áreas comunales serán reservables o algunas serán solo informativas?
2. ¿El residente podrá reservar directamente desde el MVP o solo el administrador?
3. ¿Las reservas requerirán aprobación por defecto?
4. ¿Qué áreas tendrán costo de reserva?
5. ¿El cargo se generará al solicitar, al aprobar o al completar la reserva?
6. ¿La cancelación anula el cargo o requiere ajuste manual?
7. ¿Se permitirá que residentes con deuda puedan reservar?
8. ¿Se exigirá estar al día para reservar?
9. ¿Se permitirá reservar a arrendatarios o solo propietarios?
10. ¿Se permitirá más de una reserva por unidad en el mismo día?
11. ¿Habrá límite mensual de reservas por unidad?
12. ¿Se permitirá reserva de varias franjas consecutivas?
13. ¿Se mostrará disponibilidad real a residentes?
14. ¿Se expondrán áreas comunales públicas en WordPress desde el inicio?
15. ¿Qué rol operativo aprobará reservas?

---

## 33. Decisión inicial para MVP

Para MVP se recomienda:

```text id="bs0y3h"
- Crear catálogo de áreas comunales.
- Permitir configurar disponibilidad simple.
- Permitir bloqueos administrativos.
- Permitir solicitudes de reserva.
- Permitir aprobación/rechazo/cancelación.
- Impedir reservas solapadas.
- Asociar reservas a unidad habitacional.
- Permitir reservas propias desde API /me.
- Generar cargos opcionales cuando el área requiere pago.
- No procesar pagos desde reservas.
- No revertir cargos automáticamente al cancelar.
- No implementar reservas recurrentes.
- No implementar pagos en línea.
- No implementar QR ni control de acceso.
- No implementar reservas desde WordPress público.
- Exponer a WordPress únicamente catálogo público de áreas visibles.
```

---

## 34. Conclusión

El módulo `010-reservations-common-areas` incorpora la gestión básica de áreas comunales y reservas en RESIDENT Core.

Debe implementarse como un módulo:

```text id="abj48d"
tenant-scoped
permissioned
auditable
calendar-aware
conflict-safe
financially integrable
public-safe for WordPress
extensible for resident portal
```

No debe aceptarse una implementación que permita doble reserva, mezcle tenants, permita a residentes reservar unidades ajenas, exponga reservas privadas a WordPress, genere cargos duplicados, use float para dinero, modifique pagos directamente, elimine historial de reservas o permita transiciones de estado no autorizadas.
