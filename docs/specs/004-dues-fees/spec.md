# Spec 004 — Dues, Fees, Charge Concepts and Charge Generation

## 1. Información del documento

| Campo           | Valor                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                       |
| Spec ID         | 004                                                                                                                                                 |
| Módulo          | Dues and Fees                                                                                                                                       |
| Documento       | Functional Specification                                                                                                                            |
| Ruta            | `docs/specs/004-dues-fees/spec.md`                                                                                                                  |
| Versión         | 0.1                                                                                                                                                 |
| Estado          | needs-review                                                                                                                                        |
| Fecha           | 2026-07-14                                                                                                                                          |
| Prioridad       | Alta                                                                                                                                                |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`                                                                                        |
| Relacionado con | `constitution.md`, `domain-map.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-003`, `ADR-004`, `ADR-007`, `ADR-011`, `ADR-012` |

---

## 2. Propósito

El módulo `004-dues-fees` define cómo RESIDENT Core administrará:

* conceptos de cobro;
* alícuotas ordinarias;
* cargos recurrentes;
* cargos extraordinarios;
* cargos manuales;
* cargos por unidad habitacional;
* reglas de generación mensual;
* ciclos de facturación interna;
* fechas de emisión;
* fechas de vencimiento;
* responsables de pago;
* cargos anulados;
* cargos reversados;
* ajustes;
* preparación para estados de cuenta;
* preparación para pagos;
* trazabilidad financiera.

Este es el primer módulo financiero formal del sistema.

Regla central:

```text id="z05iq6"
Todo cargo financiero debe estar asociado a un tenant, una unidad habitacional, un concepto de cobro, un periodo y una trazabilidad auditable.
```

---

## 3. Objetivo funcional

Permitir que cada conjunto residencial configure y genere cargos financieros básicos para sus unidades.

El módulo debe permitir:

* crear conceptos de cobro;
* clasificar conceptos ordinarios y extraordinarios;
* definir alícuotas por unidad;
* generar cargos mensuales;
* generar cargos extraordinarios;
* registrar cargos manuales;
* consultar cargos por unidad;
* consultar cargos por periodo;
* consultar cargos por estado;
* anular cargos bajo reglas controladas;
* reversar cargos cuando corresponda;
* registrar ajustes;
* auditar todo cambio financiero;
* impedir eliminación física de movimientos financieros;
* preparar datos para estados de cuenta;
* preparar datos para pagos y conciliación futura.

---

## 4. Alcance

### 4.1. Incluido en esta spec

Esta spec incluye:

* `ChargeConcept`;
* `FeeSchedule`;
* `UnitFeeAssignment`;
* `BillingPeriod`;
* `ChargeBatch`;
* `Charge`;
* `ChargeAdjustment`;
* `ChargeReversal`;
* reglas de generación mensual;
* cargos ordinarios;
* cargos extraordinarios;
* cargos manuales;
* cargos anulados;
* cargos reversados;
* validación de unidad;
* validación de tenant;
* permisos financieros básicos;
* auditoría financiera;
* eventos de dominio;
* endpoints REST;
* pruebas esperadas.

---

### 4.2. No incluido en esta spec

No incluye todavía:

* pagos;
* comprobantes;
* asignación de pagos;
* conciliación bancaria;
* estados de cuenta consolidados;
* cálculo de saldos finales;
* intereses de mora avanzados;
* facturación electrónica tributaria;
* integración bancaria;
* notas de crédito formales;
* contabilidad completa;
* asientos contables;
* reportes financieros avanzados;
* cobranza automatizada;
* recordatorios automáticos;
* integración con n8n;
* aprobación dual financiera avanzada.

Estos temas se tratarán en specs posteriores.

---

## 5. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="q4x9e2"
Financial Management
```

Depende de:

```text id="x6cq9s"
001-tenants
002-users-roles
003-residents-properties
```

porque:

* todo cargo pertenece a un tenant;
* todo cargo requiere autorización;
* todo cargo se genera contra una unidad habitacional;
* la unidad proviene de `003-residents-properties`;
* los permisos financieros provienen de `002-users-roles`.

---

## 6. Actores

### 6.1. TenantAdmin

Administrador del conjunto.

Puede:

* configurar conceptos de cobro;
* definir alícuotas;
* generar cargos;
* consultar cargos;
* anular cargos según permiso;
* revisar historial.

---

### 6.2. Treasurer

Tesorero.

Puede:

* configurar alícuotas si tiene permiso;
* generar cargos mensuales;
* registrar cargos extraordinarios;
* consultar cargos;
* preparar cobranza;
* generar datos para estados de cuenta futuros.

---

### 6.3. BoardMember

Miembro de directiva.

Puede consultar cargos y reportes financieros según permisos.

No necesariamente puede generar o anular cargos.

---

### 6.4. TenantAuditor

Auditor del tenant.

Puede consultar cargos, batches, ajustes y reversos.

No debe modificar información financiera.

---

### 6.5. PropertyOwner

Propietario.

Puede consultar cargos propios asociados a sus unidades.

---

### 6.6. Resident

Residente.

Puede consultar cargos propios si la política del tenant lo permite.

---

### 6.7. PlatformAdmin

Puede operar soporte global bajo permisos estrictos.

No debe modificar cargos financieros ordinarios sin justificación y auditoría reforzada.

---

## 7. Definiciones

### 7.1. ChargeConcept

Concepto de cobro.

Ejemplos:

```text id="m8wmwe"
Alícuota mensual
Fondo de reserva
Mantenimiento extraordinario
Multa por convivencia
Arriendo de área comunal
Consumo de agua
Cuota extraordinaria de seguridad
```

---

### 7.2. FeeSchedule

Configuración de alícuota o cargo recurrente.

Define cuánto se debe cobrar y bajo qué frecuencia.

---

### 7.3. UnitFeeAssignment

Asignación de una alícuota o cargo recurrente a una unidad habitacional.

---

### 7.4. BillingPeriod

Periodo financiero interno.

Ejemplos:

```text id="dzpqcb"
2026-07
2026-08
2026-09
```

---

### 7.5. ChargeBatch

Lote de generación de cargos.

Ejemplo:

```text id="92ek1b"
Generación de alícuotas julio 2026
```

Un batch permite saber qué cargos fueron generados juntos.

---

### 7.6. Charge

Cargo financiero individual generado contra una unidad.

Ejemplo:

```text id="phhhdn"
Unidad Casa 01
Concepto Alícuota mensual
Periodo 2026-07
Monto 50.00 USD
```

---

### 7.7. ChargeAdjustment

Ajuste financiero sobre un cargo.

Puede aumentar o disminuir el monto pendiente según reglas futuras.

---

### 7.8. ChargeReversal

Reverso formal de un cargo.

No elimina el cargo original; registra una operación que lo revierte.

---

### 7.9. Ordinary Fee

Cargo ordinario, usualmente mensual.

Ejemplo:

```text id="8d3y2p"
Alícuota mensual
```

---

### 7.10. Extraordinary Fee

Cargo extraordinario aprobado por administración o asamblea.

Ejemplo:

```text id="njy0ux"
Cuota extraordinaria para arreglo de portón vehicular.
```

---

## 8. Supuestos

1. `Tenant` ya existe.
2. `UserProfile`, roles y permisos ya existen.
3. `PropertyUnit` ya existe.
4. Una unidad puede tener propietarios y residentes.
5. Los cargos se generan por unidad.
6. El responsable de pago puede derivarse de la unidad y propiedad activa.
7. En MVP el sistema registra cargos en USD.
8. No se permite float para dinero.
9. Todos los montos se manejan con decimal.
10. Los cargos no se eliminan físicamente.
11. Un cargo emitido se corrige mediante anulación, reverso o ajuste.
12. Los pagos se implementarán en spec posterior.
13. El saldo consolidado se implementará en `006-account-statements`.
14. La generación mensual debe ser idempotente por tenant, periodo, concepto y unidad.
15. Tenant suspendido no genera cargos ordinarios.
16. Unidades archivadas no generan cargos ordinarios.
17. Toda operación financiera debe ser auditable.

---

## 9. Reglas de negocio

### BR-001 — Todo cargo pertenece a un tenant

Todo concepto, configuración, periodo, lote, cargo, ajuste y reverso debe tener `tenantId`.

---

### BR-002 — Todo cargo pertenece a una unidad

Todo `Charge` debe asociarse a una `PropertyUnit`.

---

### BR-003 — Unidad debe pertenecer al tenant

No se puede generar cargo a una unidad de otro tenant.

---

### BR-004 — Concepto debe pertenecer al tenant

No se puede usar un concepto de cobro de otro tenant.

---

### BR-005 — No usar float para dinero

Todos los montos deben ser `Decimal`.

Prohibido:

```text id="16rb2k"
float
double
number sin control decimal para dinero
```

---

### BR-006 — Moneda inicial USD

En MVP la moneda inicial es:

```text id="o49e3r"
USD
```

La moneda debe ser compatible con configuración del tenant.

---

### BR-007 — Cargos no se eliminan físicamente

Un cargo emitido no se elimina.

Se puede:

* anular;
* reversar;
* ajustar;
* marcar como cancelado según política.

---

### BR-008 — Generación mensual idempotente

Generar alícuotas de un periodo dos veces no debe duplicar cargos.

Debe existir unicidad o idempotencia por:

```text id="tz3jf2"
tenantId
billingPeriodId
chargeConceptId
propertyUnitId
chargeType
```

---

### BR-009 — Unidad archivada no genera cargo ordinario

Una unidad `archived` no debe recibir cargos ordinarios nuevos.

---

### BR-010 — Unidad bloqueada o inactiva

La política de generación para unidades `inactive`, `blocked` o `underMaintenance` debe ser explícita.

MVP recomendado:

```text id="i7qen9"
Solo propertyUnit.status = active genera cargos ordinarios.
```

---

### BR-011 — Tenant activo requerido

Solo tenants `active` pueden generar cargos ordinarios.

---

### BR-012 — Concepto activo requerido

Solo conceptos activos pueden generar cargos nuevos.

---

### BR-013 — FeeSchedule activo requerido

Solo configuraciones activas generan cargos recurrentes.

---

### BR-014 — Periodo abierto requerido

Solo se generan cargos en periodos abiertos.

---

### BR-015 — Periodo cerrado no permite nuevos cargos ordinarios

Un periodo cerrado no permite generación ordinaria.

Puede permitir ajustes/reversos con permiso especial.

---

### BR-016 — Cargos extraordinarios requieren motivo

Todo cargo extraordinario debe tener descripción o razón.

---

### BR-017 — Anulación requiere motivo

Toda anulación de cargo requiere motivo.

---

### BR-018 — Reverso requiere motivo

Todo reverso de cargo requiere motivo.

---

### BR-019 — Ajuste requiere motivo

Todo ajuste financiero requiere motivo.

---

### BR-020 — Auditoría financiera obligatoria

Toda creación, actualización, generación, anulación, reverso o ajuste de cargo debe auditarse.

---

### BR-021 — No sobrescribir monto original

El monto original del cargo debe conservarse.

Correcciones se registran como ajustes o reversos.

---

### BR-022 — Responsable de pago derivado

En MVP, el cargo se asocia a la unidad.

El responsable de pago visible puede derivarse de propietarios activos o residentes según política.

---

### BR-023 — Estado de cuenta reconstruible

Los estados de cuenta futuros deben poder reconstruirse desde:

```text id="7q5qf6"
charges
adjustments
reversals
payments futuros
allocations futuras
```

---

### BR-024 — Separación de funciones

Roles con permiso de generar cargos no necesariamente pueden anularlos.

Ejemplo:

```text id="15a68y"
fees.generate ≠ charges.reverse
```

---

### BR-025 — WordPress no participa en generación financiera

WordPress no genera ni modifica cargos.

Solo puede mostrar información pública o redirigir al Core.

---

## 10. Estados

## 10.1. ChargeConceptStatus

```text id="g7ym7v"
active
inactive
archived
```

| Estado     | Descripción                     |
| ---------- | ------------------------------- |
| `active`   | Puede usarse para nuevos cargos |
| `inactive` | No se usa para nuevos cargos    |
| `archived` | Conservado históricamente       |

---

## 10.2. FeeScheduleStatus

```text id="mkpwu0"
active
inactive
archived
```

---

## 10.3. BillingPeriodStatus

```text id="hdk0ft"
open
closed
locked
archived
```

| Estado     | Descripción                                   |
| ---------- | --------------------------------------------- |
| `open`     | Permite generación y operación ordinaria      |
| `closed`   | No permite nuevos cargos ordinarios           |
| `locked`   | Bloqueado para cambios salvo proceso especial |
| `archived` | Histórico                                     |

---

## 10.4. ChargeBatchStatus

```text id="19uiq5"
draft
processing
completed
completedWithErrors
cancelled
reversed
```

---

## 10.5. ChargeStatus

```text id="uotfg1"
draft
issued
partiallyPaid
paid
cancelled
reversed
disputed
archived
```

Para esta spec no se implementan pagos, pero se reservan estados `partiallyPaid` y `paid` para compatibilidad futura.

---

## 10.6. ChargeType

```text id="4fl9i0"
ordinary
extraordinary
manual
fine
reservation
adjustment
openingBalance
other
```

En esta spec se implementan:

```text id="jefbki"
ordinary
extraordinary
manual
adjustment
other
```

Se reservan:

```text id="ah80lo"
fine
reservation
openingBalance
```

para módulos posteriores.

---

## 10.7. AdjustmentType

```text id="6sd2xv"
increase
decrease
correction
discount
surcharge
```

---

## 11. Flujos funcionales

## 11.1. Crear concepto de cobro

### Actor

TenantAdmin o Treasurer con permiso `chargeConcepts.create`.

### Flujo

```text id="zo6t98"
1. Actor crea concepto.
2. Sistema valida tenant activo.
3. Sistema valida permiso.
4. Sistema valida nombre y código único por tenant.
5. Sistema crea ChargeConcept.
6. Sistema audita.
7. Sistema emite ChargeConceptCreated.
```

---

## 11.2. Crear configuración de alícuota

### Actor

TenantAdmin o Treasurer con permiso `feeSchedules.create`.

### Flujo

```text id="857wd0"
1. Actor selecciona concepto.
2. Actor define monto, frecuencia y vigencia.
3. Sistema valida tenant.
4. Sistema valida concepto activo.
5. Sistema valida monto decimal.
6. Sistema crea FeeSchedule.
7. Sistema audita.
8. Sistema emite FeeScheduleCreated.
```

---

## 11.3. Asignar alícuota a unidad

### Actor

TenantAdmin o Treasurer con permiso `unitFees.assign`.

### Flujo

```text id="vnqqwh"
1. Actor selecciona unidad.
2. Actor selecciona FeeSchedule.
3. Sistema valida tenant.
4. Sistema valida unidad activa.
5. Sistema valida FeeSchedule activo.
6. Sistema crea UnitFeeAssignment.
7. Sistema audita.
8. Sistema emite UnitFeeAssigned.
```

---

## 11.4. Crear periodo de facturación interna

### Actor

Treasurer o TenantAdmin con permiso `billingPeriods.create`.

### Flujo

```text id="f5oqs1"
1. Actor crea periodo YYYY-MM.
2. Sistema valida tenant activo.
3. Sistema valida que no exista periodo duplicado.
4. Sistema crea BillingPeriod en estado open.
5. Sistema audita.
6. Sistema emite BillingPeriodCreated.
```

---

## 11.5. Generar cargos mensuales

### Actor

Treasurer o TenantAdmin con permiso `fees.generate`.

### Flujo

```text id="gwrpme"
1. Actor selecciona periodo.
2. Actor selecciona FeeSchedule o todos los activos.
3. Sistema valida tenant activo.
4. Sistema valida periodo open.
5. Sistema valida unidades activas.
6. Sistema valida assignments activos.
7. Sistema crea ChargeBatch.
8. Sistema genera un Charge por unidad.
9. Sistema evita duplicados.
10. Sistema marca batch completed o completedWithErrors.
11. Sistema audita.
12. Sistema emite MonthlyFeesGenerated.
```

---

## 11.6. Crear cargo extraordinario

### Actor

Treasurer o TenantAdmin con permiso `charges.create`.

### Flujo

```text id="ut9vx3"
1. Actor selecciona unidad o grupo de unidades.
2. Actor selecciona concepto extraordinario.
3. Actor define monto, periodo, dueDate y motivo.
4. Sistema valida tenant.
5. Sistema valida unidades.
6. Sistema crea cargos.
7. Sistema audita.
8. Sistema emite ExtraordinaryChargesCreated.
```

---

## 11.7. Crear cargo manual

### Actor

TenantAdmin o Treasurer con permiso `charges.create`.

### Flujo

```text id="vdkwso"
1. Actor selecciona unidad.
2. Actor selecciona concepto.
3. Actor define monto y descripción.
4. Sistema valida permisos.
5. Sistema crea cargo manual.
6. Sistema audita.
7. Sistema emite ManualChargeCreated.
```

---

## 11.8. Anular cargo

### Actor

Usuario con permiso `charges.cancel`.

### Flujo

```text id="nqgolr"
1. Actor selecciona cargo.
2. Sistema valida que cargo pertenece al tenant.
3. Sistema valida estado permitido.
4. Actor ingresa motivo.
5. Sistema cambia estado a cancelled.
6. Sistema conserva monto original.
7. Sistema audita.
8. Sistema emite ChargeCancelled.
```

---

## 11.9. Reversar cargo

### Actor

Usuario con permiso `charges.reverse`.

### Flujo

```text id="rcukwf"
1. Actor selecciona cargo emitido.
2. Sistema valida cargo.
3. Sistema exige motivo.
4. Sistema crea ChargeReversal.
5. Sistema marca cargo como reversed si aplica.
6. Sistema audita.
7. Sistema emite ChargeReversed.
```

---

## 11.10. Registrar ajuste

### Actor

Usuario con permiso `charges.adjust`.

### Flujo

```text id="q57d9h"
1. Actor selecciona cargo.
2. Actor define tipo de ajuste.
3. Actor define monto.
4. Actor ingresa motivo.
5. Sistema valida estado del cargo.
6. Sistema crea ChargeAdjustment.
7. Sistema recalcula monto efectivo futuro.
8. Sistema audita.
9. Sistema emite ChargeAdjusted.
```

---

## 12. Historias de usuario

### US-001 — Crear concepto de cobro

Como TenantAdmin, quiero crear conceptos de cobro para clasificar los cargos del conjunto.

#### Criterios de aceptación

* El concepto se crea dentro del tenant activo.
* El código del concepto es único por tenant.
* No puede crearse sin permiso.
* La creación se audita.

---

### US-002 — Definir alícuota mensual

Como Treasurer, quiero definir el monto mensual de alícuota para aplicarlo a unidades.

#### Criterios de aceptación

* El monto debe ser decimal válido.
* El concepto debe estar activo.
* La configuración queda activa.
* La operación se audita.

---

### US-003 — Asignar alícuota a unidad

Como TenantAdmin, quiero asignar una alícuota a una unidad para que pueda generarse mensualmente.

#### Criterios de aceptación

* La unidad debe pertenecer al tenant.
* La unidad debe estar activa.
* El FeeSchedule debe estar activo.
* La asignación no debe duplicarse.

---

### US-004 — Crear periodo financiero

Como Treasurer, quiero crear un periodo mensual para generar cargos.

#### Criterios de aceptación

* El periodo tiene formato `YYYY-MM`.
* No puede duplicarse dentro del tenant.
* El periodo inicia abierto.
* La creación se audita.

---

### US-005 — Generar alícuotas mensuales

Como Treasurer, quiero generar las alícuotas de un periodo para todas las unidades activas.

#### Criterios de aceptación

* Se genera un cargo por unidad con asignación activa.
* No se duplican cargos si se ejecuta dos veces.
* Se genera un lote.
* Se registra auditoría.
* Se emite evento de generación.

---

### US-006 — Crear cargo extraordinario

Como TenantAdmin, quiero crear un cargo extraordinario para una o varias unidades.

#### Criterios de aceptación

* Debe tener concepto, monto, motivo y periodo.
* Solo se crean cargos para unidades del tenant activo.
* La operación se audita.
* No se crean cargos para unidades archivadas.

---

### US-007 — Consultar cargos por unidad

Como Treasurer, quiero consultar cargos por unidad para revisar valores generados.

#### Criterios de aceptación

* Solo devuelve cargos del tenant activo.
* Soporta filtros por periodo, concepto y estado.
* Requiere permiso.

---

### US-008 — Consultar mis cargos

Como propietario o residente autorizado, quiero consultar cargos de mis unidades.

#### Criterios de aceptación

* Solo devuelve cargos de unidades propias.
* Requiere `charges.read.own`.
* No devuelve cargos de unidades ajenas.
* Usa relación `UserProfile → Person → PropertyUnit`.

---

### US-009 — Anular cargo

Como Treasurer autorizado, quiero anular un cargo generado por error.

#### Criterios de aceptación

* Requiere permiso `charges.cancel`.
* Requiere motivo.
* No elimina el cargo.
* La anulación se audita.

---

### US-010 — Registrar ajuste

Como Treasurer autorizado, quiero registrar un ajuste sobre un cargo para corregir valores sin perder trazabilidad.

#### Criterios de aceptación

* Requiere permiso `charges.adjust`.
* Requiere motivo.
* Crea registro de ajuste.
* No sobrescribe el monto original.
* La operación se audita.

---

## 13. Requisitos funcionales

### FR-001 — Crear concepto de cobro

El sistema debe permitir crear conceptos de cobro por tenant.

---

### FR-002 — Actualizar concepto de cobro

El sistema debe permitir actualizar datos permitidos de un concepto.

---

### FR-003 — Archivar concepto de cobro

El sistema debe permitir archivar conceptos no usados para nuevos cargos.

---

### FR-004 — Crear configuración de alícuota

El sistema debe permitir crear `FeeSchedule`.

---

### FR-005 — Actualizar configuración de alícuota

El sistema debe permitir actualizar configuraciones futuras sin alterar cargos ya emitidos.

---

### FR-006 — Archivar configuración de alícuota

El sistema debe permitir archivar una configuración para que no genere nuevos cargos.

---

### FR-007 — Asignar alícuota a unidad

El sistema debe permitir asignar FeeSchedule a una unidad.

---

### FR-008 — Finalizar asignación de alícuota a unidad

El sistema debe permitir finalizar una asignación sin eliminar historial.

---

### FR-009 — Crear periodo financiero

El sistema debe permitir crear periodos por tenant.

---

### FR-010 — Cerrar periodo financiero

El sistema debe permitir cerrar un periodo para impedir nuevos cargos ordinarios.

---

### FR-011 — Generar cargos mensuales

El sistema debe permitir generar cargos ordinarios por periodo.

---

### FR-012 — Crear cargo extraordinario

El sistema debe permitir crear cargos extraordinarios.

---

### FR-013 — Crear cargo manual

El sistema debe permitir crear cargos manuales.

---

### FR-014 — Listar cargos

El sistema debe permitir listar cargos por tenant.

---

### FR-015 — Consultar cargo por ID

El sistema debe permitir consultar un cargo específico del tenant activo.

---

### FR-016 — Consultar cargos por unidad

El sistema debe permitir consultar cargos asociados a una unidad.

---

### FR-017 — Consultar mis cargos

El sistema debe permitir consultar cargos propios mediante permisos `.own`.

---

### FR-018 — Anular cargo

El sistema debe permitir anular cargos bajo permiso y motivo.

---

### FR-019 — Reversar cargo

El sistema debe permitir reversar cargos bajo permiso y motivo.

---

### FR-020 — Registrar ajuste

El sistema debe permitir registrar ajustes sobre cargos.

---

### FR-021 — Auditar operaciones financieras

El sistema debe auditar toda operación financiera.

---

### FR-022 — Emitir eventos financieros

El sistema debe emitir eventos de generación, anulación, reverso y ajuste.

---

### FR-023 — Evitar duplicados

El sistema debe evitar cargos duplicados por periodo, concepto y unidad.

---

### FR-024 — Validar integridad multitenant

El sistema debe impedir cargos con unidades o conceptos de otros tenants.

---

## 14. Requisitos no funcionales

### NFR-001 — Seguridad financiera

Todo endpoint financiero privado requiere autenticación, tenant activo, membership activa y permiso.

---

### NFR-002 — Multitenancy

Todo registro financiero debe incluir `tenantId`.

---

### NFR-003 — Auditoría

Toda operación financiera debe ser auditable.

---

### NFR-004 — Trazabilidad

No se debe perder la historia de cargos, ajustes, anulaciones o reversos.

---

### NFR-005 — Precisión monetaria

Todos los montos deben usar decimal.

---

### NFR-006 — Idempotencia

La generación masiva de cargos debe ser idempotente.

---

### NFR-007 — Performance

Listados financieros deben ser paginados e indexados.

---

### NFR-008 — Observabilidad

Generaciones masivas deben registrar logs, métricas, traceId y resultado del batch.

---

### NFR-009 — Preparación para pagos

El modelo debe permitir asignación futura de pagos.

---

### NFR-010 — Preparación para estados de cuenta

El modelo debe permitir reconstruir estados de cuenta por unidad y periodo.

---

## 15. Modelo de datos preliminar

### 15.1. ChargeConcept

```text id="oqyt7i"
ChargeConcept
├── id
├── tenantId
├── code
├── name
├── description
├── category
├── defaultAmount
├── currency
├── status
├── isSystem
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 15.2. FeeSchedule

```text id="kbyqte"
FeeSchedule
├── id
├── tenantId
├── chargeConceptId
├── name
├── amount
├── currency
├── frequency
├── effectiveFrom
├── effectiveTo
├── status
├── createdAt
└── updatedAt
```

---

### 15.3. UnitFeeAssignment

```text id="xow66s"
UnitFeeAssignment
├── id
├── tenantId
├── propertyUnitId
├── feeScheduleId
├── status
├── startDate
├── endDate
├── createdAt
└── updatedAt
```

---

### 15.4. BillingPeriod

```text id="zjhj2e"
BillingPeriod
├── id
├── tenantId
├── periodCode
├── startsAt
├── endsAt
├── dueDate
├── status
├── createdAt
├── closedAt
└── closedBy
```

---

### 15.5. ChargeBatch

```text id="30w630"
ChargeBatch
├── id
├── tenantId
├── billingPeriodId
├── feeScheduleId nullable
├── type
├── status
├── requestedBy
├── startedAt
├── completedAt
├── totalItems
├── successItems
├── failedItems
├── createdAt
└── updatedAt
```

---

### 15.6. Charge

```text id="b1i9os"
Charge
├── id
├── tenantId
├── billingPeriodId
├── propertyUnitId
├── chargeConceptId
├── chargeBatchId nullable
├── type
├── description
├── originalAmount
├── effectiveAmount
├── currency
├── issuedDate
├── dueDate
├── status
├── createdAt
├── updatedAt
├── cancelledAt nullable
├── cancelledBy nullable
├── cancellationReason nullable
└── idempotencyKey nullable
```

---

### 15.7. ChargeAdjustment

```text id="n53uhb"
ChargeAdjustment
├── id
├── tenantId
├── chargeId
├── type
├── amount
├── reason
├── createdBy
├── createdAt
└── reversedAt nullable
```

---

### 15.8. ChargeReversal

```text id="sqdtnj"
ChargeReversal
├── id
├── tenantId
├── chargeId
├── reason
├── reversedBy
├── reversedAt
├── createdAt
└── traceId
```

---

## 16. Permisos iniciales

### 16.1. Conceptos de cobro

```text id="x94ov7"
chargeConcepts.create
chargeConcepts.read
chargeConcepts.update
chargeConcepts.archive
```

---

### 16.2. Configuración de alícuotas

```text id="8bej28"
feeSchedules.create
feeSchedules.read
feeSchedules.update
feeSchedules.archive
```

---

### 16.3. Asignación de alícuotas

```text id="u4af7o"
unitFees.assign
unitFees.read
unitFees.end
```

---

### 16.4. Periodos

```text id="2dx1m7"
billingPeriods.create
billingPeriods.read
billingPeriods.close
billingPeriods.lock
```

---

### 16.5. Cargos

```text id="mo3bp1"
charges.create
charges.read
charges.read.own
charges.cancel
charges.reverse
charges.adjust
```

---

### 16.6. Generación de alícuotas

```text id="7u85n5"
fees.generate
fees.readBatches
```

---

## 17. API preliminar

### 17.1. Charge Concepts API

```text id="8z71ig"
GET    /api/v1/tenant/charge-concepts
POST   /api/v1/tenant/charge-concepts
GET    /api/v1/tenant/charge-concepts/{chargeConceptId}
PATCH  /api/v1/tenant/charge-concepts/{chargeConceptId}
POST   /api/v1/tenant/charge-concepts/{chargeConceptId}/archive
```

---

### 17.2. Fee Schedules API

```text id="dh81ei"
GET    /api/v1/tenant/fee-schedules
POST   /api/v1/tenant/fee-schedules
GET    /api/v1/tenant/fee-schedules/{feeScheduleId}
PATCH  /api/v1/tenant/fee-schedules/{feeScheduleId}
POST   /api/v1/tenant/fee-schedules/{feeScheduleId}/archive
```

---

### 17.3. Unit Fee Assignments API

```text id="6q1j6y"
GET    /api/v1/tenant/unit-fees
POST   /api/v1/tenant/unit-fees
GET    /api/v1/tenant/unit-fees/{unitFeeAssignmentId}
POST   /api/v1/tenant/unit-fees/{unitFeeAssignmentId}/end
```

---

### 17.4. Billing Periods API

```text id="sh0a1b"
GET    /api/v1/tenant/billing-periods
POST   /api/v1/tenant/billing-periods
GET    /api/v1/tenant/billing-periods/{billingPeriodId}
POST   /api/v1/tenant/billing-periods/{billingPeriodId}/close
POST   /api/v1/tenant/billing-periods/{billingPeriodId}/lock
```

---

### 17.5. Charge Generation API

```text id="7mjnn1"
POST /api/v1/tenant/charges/generate-monthly
GET  /api/v1/tenant/charge-batches
GET  /api/v1/tenant/charge-batches/{chargeBatchId}
```

---

### 17.6. Charges API

```text id="fyfc10"
GET    /api/v1/tenant/charges
POST   /api/v1/tenant/charges
GET    /api/v1/tenant/charges/{chargeId}
POST   /api/v1/tenant/charges/{chargeId}/cancel
POST   /api/v1/tenant/charges/{chargeId}/reverse
POST   /api/v1/tenant/charges/{chargeId}/adjustments
```

---

### 17.7. Own Charges API

```text id="zmq71r"
GET /api/v1/me/charges
GET /api/v1/me/property-units/{propertyUnitId}/charges
```

---

## 18. Autorización

### 18.1. Reglas generales

Cada endpoint privado requiere:

```text id="lkpu3p"
1. Token válido.
2. UserProfile activo.
3. Tenant activo.
4. Membership activa.
5. Permiso requerido.
6. Recurso dentro del tenant.
7. Si es .own, relación con unidad propia.
```

---

### 18.2. Acceso administrativo financiero

Ejemplos:

```text id="kjq92a"
charges.read
fees.generate
chargeConcepts.create
billingPeriods.close
```

---

### 18.3. Acceso propio

Ejemplo:

```text id="m34gf5"
charges.read.own
```

Requiere que el usuario esté vinculado a una `Person` y que esa persona esté asociada a la unidad mediante:

* propiedad activa; o
* residencia activa;
* política futura del tenant.

---

## 19. Auditoría

### 19.1. Eventos auditables

```text id="t1p05f"
chargeConcept.created
chargeConcept.updated
chargeConcept.archived
feeSchedule.created
feeSchedule.updated
feeSchedule.archived
unitFee.assigned
unitFee.ended
billingPeriod.created
billingPeriod.closed
billingPeriod.locked
chargeBatch.created
chargeBatch.completed
charge.created
charge.cancelled
charge.reversed
charge.adjusted
```

---

### 19.2. Campos mínimos

```text id="hj8myh"
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

### 19.3. Auditoría financiera reforzada

Para operaciones financieras críticas se debe registrar:

```text id="19qnf0"
billingPeriodId
propertyUnitId
chargeId
amount
currency
reason cuando aplique
```

No registrar datos personales innecesarios.

---

## 20. Eventos de dominio

Eventos sugeridos:

```text id="bh41u3"
ChargeConceptCreated
ChargeConceptUpdated
ChargeConceptArchived
FeeScheduleCreated
FeeScheduleUpdated
FeeScheduleArchived
UnitFeeAssigned
UnitFeeEnded
BillingPeriodCreated
BillingPeriodClosed
BillingPeriodLocked
ChargeBatchCreated
MonthlyFeesGenerated
ChargeCreated
ExtraordinaryChargesCreated
ManualChargeCreated
ChargeCancelled
ChargeReversed
ChargeAdjusted
```

---

## 21. Seguridad

### 21.1. Riesgos principales

| Riesgo                                      | Impacto |
| ------------------------------------------- | ------- |
| Generar cargos para unidad de otro tenant   | Crítico |
| Duplicar cargos mensuales                   | Crítico |
| Alterar monto original de cargo emitido     | Alto    |
| Eliminar físicamente cargos                 | Crítico |
| Generar cargos en periodo cerrado           | Alto    |
| Crear cargos con float                      | Alto    |
| Usuario sin permiso anula cargos            | Crítico |
| Propietario consulta cargos de unidad ajena | Alto    |
| Tenant suspendido genera cargos             | Alto    |
| Falta de auditoría financiera               | Crítico |

---

### 21.2. Controles

* tenantId obligatorio;
* `TenantGuard`;
* `TenantPermissionGuard`;
* `OwnResourcePolicyService`;
* validación de unidad;
* validación de concepto;
* periodo abierto;
* idempotencia;
* Decimal;
* no eliminación física;
* auditoría financiera;
* eventos;
* tests financieros;
* tests multitenant;
* tests de autorización.

---

## 22. Privacidad

Este módulo no debe exponer datos personales innecesarios.

Los cargos se asocian principalmente a unidades.

Para vista propia:

* usuario solo ve cargos de unidades propias;
* no ve cargos de otras unidades;
* no ve datos personales de otros propietarios o residentes.

---

## 23. Testing

### 23.1. Unit tests

Probar:

* Money/Decimal;
* ChargeStatus;
* BillingPeriodStatus;
* ChargeType;
* concepto activo/inactivo;
* periodo abierto/cerrado;
* idempotency key;
* reglas de generación.

---

### 23.2. Integration tests

Probar:

* crear concepto;
* crear FeeSchedule;
* asignar FeeSchedule a unidad;
* crear BillingPeriod;
* generar cargos;
* evitar duplicados;
* crear cargo extraordinario;
* anular cargo;
* reversar cargo;
* registrar ajuste;
* constraints por tenant.

---

### 23.3. API tests

Probar:

* Charge Concepts API;
* Fee Schedules API;
* Unit Fees API;
* Billing Periods API;
* Charge Generation API;
* Charges API;
* Own Charges API.

---

### 23.4. Authorization tests

Probar:

* sin token;
* sin permiso;
* sin membership;
* tenant suspendido;
* usuario disabled;
* propietario sin `.own`;
* usuario sin relación con unidad.

---

### 23.5. Multitenancy tests

Probar:

* Tenant A no ve cargos Tenant B;
* Tenant A no usa unidades Tenant B;
* Tenant A no usa conceptos Tenant B;
* Tenant A no genera cargos para Tenant B;
* `.own` no devuelve cargos de otro tenant.

---

### 23.6. Financial regression tests

Probar:

* generación idempotente;
* cargo original no cambia;
* ajuste no sobrescribe cargo;
* reverso no elimina cargo;
* periodo cerrado bloquea generación;
* decimal exacto;
* batch registra conteos correctos.

---

## 24. Criterios de aceptación globales

La spec se considera implementada si:

* se crean conceptos de cobro;
* se crean configuraciones de alícuota;
* se asignan alícuotas a unidades;
* se crean periodos financieros;
* se generan cargos mensuales;
* la generación es idempotente;
* se crean cargos extraordinarios;
* se crean cargos manuales;
* se consultan cargos por tenant;
* se consultan cargos por unidad;
* propietarios/residentes autorizados consultan cargos propios;
* se anulan cargos sin eliminarlos;
* se reversan cargos sin eliminarlos;
* se registran ajustes sin sobrescribir monto original;
* se auditan operaciones financieras;
* no hay acceso cross-tenant;
* no se usa float para dinero;
* no hay eliminación física de cargos;
* pruebas unitarias pasan;
* pruebas integración pasan;
* pruebas API pasan;
* pruebas autorización pasan;
* pruebas multitenant pasan;
* pruebas financieras pasan;
* OpenAPI está actualizado;
* CI pasa.

---

## 25. Casos borde

| Caso                                                | Resultado esperado         |
| --------------------------------------------------- | -------------------------- |
| Crear concepto con código duplicado en mismo tenant | 409                        |
| Crear concepto con código existente en otro tenant  | permitido                  |
| Crear FeeSchedule con concepto inactivo             | 409/422                    |
| Asignar FeeSchedule a unidad de otro tenant         | 403/422                    |
| Generar cargos en periodo cerrado                   | 409                        |
| Generar cargos dos veces para mismo periodo         | no duplica                 |
| Generar cargos para unidad archivada                | omitida o error controlado |
| Crear cargo con monto negativo                      | 422 salvo ajuste válido    |
| Crear cargo sin concepto                            | 422                        |
| Crear cargo sin unidad                              | 422                        |
| Anular cargo ya cancelado                           | 409                        |
| Reversar cargo ya reversado                         | 409                        |
| Ajustar cargo cancelado                             | 409                        |
| Propietario consulta cargo de unidad ajena          | 403/404                    |
| Tenant suspendido intenta generar cargos            | 403                        |
| Usuario sin permiso financiero crea cargo           | 403                        |
| Intentar borrar físicamente cargo                   | prohibido                  |

---

## 26. Dependencias hacia specs futuras

Este módulo habilita:

```text id="6m30zo"
005-payments
006-account-statements
007-audit
008-wordpress-integration
009-notifications
011-fines
010-reservations
```

Especialmente habilita:

* pagos contra cargos;
* estados de cuenta por unidad;
* saldos por periodo;
* morosidad;
* recordatorios de cobro;
* reportes financieros;
* cargos por multas;
* cargos por reservas.

---

## 27. Archivos derivados esperados

Esta spec debe complementarse con:

```text id="5o2jmn"
docs/specs/004-dues-fees/
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

1. ¿La alícuota será igual para todas las unidades en MVP o variable por unidad?
2. ¿Se permitirá porcentaje según área m²?
3. ¿Se manejará responsable de pago explícito o solo unidad?
4. ¿Debe existir aprobación antes de generar cargos mensuales?
5. ¿Se generarán cargos automáticamente cada mes o manualmente en MVP?
6. ¿La fecha de vencimiento será fija por tenant?
7. ¿Qué ocurre con unidades inactivas pero no archivadas?
8. ¿Se permitirá generar cargos retroactivos?
9. ¿Se requiere cierre formal mensual?
10. ¿Los cargos extraordinarios requieren evidencia o acta?
11. ¿Quién puede anular cargos?
12. ¿Anulación y reverso serán conceptos separados desde MVP?
13. ¿Los ajustes afectarán monto efectivo o solo se sumarán en estado de cuenta?
14. ¿Se debe permitir carga masiva de cargos desde archivo?
15. ¿Se manejarán descuentos o exoneraciones en MVP?

---

## 29. Decisión inicial para MVP

Para MVP se recomienda:

```text id="klttcu"
- Crear conceptos de cobro por tenant.
- Crear concepto base "Alícuota mensual".
- Crear FeeSchedule mensual.
- Permitir asignación de alícuota por unidad.
- Permitir monto diferente por unidad mediante UnitFeeAssignment o schedule específico.
- Crear periodos mensuales.
- Generar cargos mensuales manualmente.
- Hacer generación idempotente.
- Crear cargos extraordinarios manuales.
- Crear cargos manuales simples.
- Permitir anulación con motivo.
- Permitir ajuste con motivo.
- Diferir pagos.
- Diferir conciliación.
- Diferir estados de cuenta completos.
- Diferir mora avanzada.
- Diferir facturación electrónica.
- Diferir aprobación dual.
```

---

## 30. Conclusión

El módulo `004-dues-fees` establece la base financiera de RESIDENT Core.

A partir de este módulo, el sistema podrá generar obligaciones económicas por unidad habitacional.

Este módulo debe priorizar:

```text id="b3cyjs"
precisión monetaria
idempotencia
auditoría financiera
no eliminación física
multitenancy
autorización estricta
preparación para pagos
preparación para estados de cuenta
```

No se debe implementar ningún flujo financiero posterior sin garantizar que los cargos sean correctos, auditables, no duplicados y asociados a la unidad correcta.
