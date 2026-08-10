# Spec 005 — Payments, Receipts and Payment Allocation

## 1. Información del documento

| Campo           | Valor                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                       |
| Spec ID         | 005                                                                                                                                                 |
| Módulo          | Payments                                                                                                                                            |
| Documento       | Functional Specification                                                                                                                            |
| Ruta            | `docs/specs/005-payments/spec.md`                                                                                                                   |
| Versión         | 0.1                                                                                                                                                 |
| Estado          | needs-review                                                                                                                                        |
| Fecha           | 2026-07-14                                                                                                                                          |
| Prioridad       | Alta                                                                                                                                                |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`                                                                       |
| Relacionado con | `constitution.md`, `domain-map.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-003`, `ADR-004`, `ADR-007`, `ADR-011`, `ADR-012` |

---

## 2. Propósito

El módulo `005-payments` define cómo RESIDENT Core registrará, validará, consultará, aprobará, rechazará, reversará y asignará pagos realizados por propietarios, residentes o responsables de unidades habitacionales.

Este módulo administra:

* pagos recibidos;
* métodos de pago;
* comprobantes de pago;
* carga de evidencias;
* validación administrativa de pagos;
* asignación de pagos a cargos;
* pagos parciales;
* pagos excedentes;
* pagos rechazados;
* reversos de pagos;
* trazabilidad de comprobantes;
* preparación para estados de cuenta;
* preparación para conciliación bancaria;
* consulta propia de pagos;
* auditoría financiera.

Regla central:

```text id="ztz259"
Todo pago debe pertenecer a un tenant, estar asociado a una unidad habitacional, conservar su comprobante o referencia, tener estado controlado y dejar trazabilidad auditable de su validación y asignación.
```

---

## 3. Objetivo funcional

Permitir que cada conjunto residencial registre y controle pagos relacionados con cargos generados en `004-dues-fees`.

El módulo debe permitir:

* registrar pagos administrativos;
* registrar pagos reportados por residentes o propietarios;
* asociar pagos a unidad habitacional;
* subir o registrar comprobante de pago;
* validar pagos pendientes;
* rechazar pagos con motivo;
* confirmar pagos;
* asignar pagos a uno o varios cargos;
* permitir pagos parciales;
* permitir pagos excedentes como saldo a favor futuro;
* reversar pagos bajo reglas controladas;
* consultar pagos por unidad;
* consultar pagos por periodo;
* consultar pagos por estado;
* consultar mis pagos;
* auditar toda operación financiera;
* evitar duplicidad de pagos;
* preparar información para estados de cuenta y conciliación bancaria.

---

## 4. Alcance

### 4.1. Incluido en esta spec

Esta spec incluye:

* `Payment`;
* `PaymentReceipt`;
* `PaymentAllocation`;
* `PaymentMethod`;
* `PaymentReversal`;
* `PaymentValidation`;
* registro manual de pagos;
* reporte de pago por residente/propietario;
* carga de comprobante;
* validación administrativa;
* rechazo de pago;
* confirmación de pago;
* asignación de pago a cargos;
* pagos parciales;
* pagos excedentes;
* reversos de pago;
* consulta administrativa;
* consulta propia;
* idempotencia;
* auditoría;
* eventos de dominio;
* endpoints REST;
* pruebas esperadas.

---

### 4.2. No incluido en esta spec

No incluye todavía:

* conciliación bancaria automática;
* importación masiva de movimientos bancarios;
* integración bancaria directa;
* pasarela de pagos en línea;
* pagos con tarjeta;
* tokenización de tarjetas;
* facturación electrónica;
* asientos contables;
* cierre contable;
* cálculo avanzado de mora;
* notificaciones automáticas;
* cobranza automatizada;
* workflows de aprobación dual avanzada;
* OCR de comprobantes;
* validación automática de comprobantes con IA;
* firma electrónica;
* cuentas bancarias avanzadas;
* contabilidad completa.

Estos temas se tratarán en specs posteriores.

---

## 5. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="pgd1jy"
Payments and Reconciliation
```

Depende de:

```text id="ysx523"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
```

porque:

* todo pago pertenece a un tenant;
* todo pago requiere autorización;
* todo pago se asocia a una unidad habitacional;
* todo pago se puede asignar a cargos existentes;
* los cargos provienen de `004-dues-fees`;
* propietarios y residentes provienen de `003-residents-properties`.

---

## 6. Actores

### 6.1. TenantAdmin

Administrador del conjunto.

Puede:

* consultar pagos;
* registrar pagos;
* validar pagos;
* rechazar pagos;
* reversar pagos si tiene permiso;
* consultar comprobantes;
* revisar auditoría financiera.

---

### 6.2. Treasurer

Tesorero.

Puede:

* registrar pagos;
* validar pagos;
* asignar pagos a cargos;
* rechazar pagos;
* reversar pagos según permiso;
* revisar comprobantes;
* preparar información para estados de cuenta y conciliación.

---

### 6.3. TenantAuditor

Auditor del tenant.

Puede:

* consultar pagos;
* consultar comprobantes;
* consultar asignaciones;
* consultar reversos;
* consultar auditoría.

No debe modificar pagos.

---

### 6.4. PropertyOwner

Propietario.

Puede:

* reportar pagos de sus unidades;
* subir comprobantes;
* consultar sus pagos;
* consultar estado de validación;
* consultar asignaciones visibles.

---

### 6.5. Resident

Residente.

Puede:

* reportar pagos si la política del tenant lo permite;
* subir comprobantes;
* consultar pagos propios;
* consultar estado de validación.

---

### 6.6. BoardMember

Miembro de directiva.

Puede consultar información financiera según permisos.

No necesariamente valida ni reversa pagos.

---

### 6.7. PlatformAdmin

Puede operar soporte global bajo permisos estrictos.

No debe modificar pagos de tenants sin justificación y auditoría reforzada.

---

## 7. Definiciones

### 7.1. Payment

Registro principal de un pago recibido o reportado.

Ejemplo:

```text id="4duyvk"
Unidad Casa 01
Monto 100.00 USD
Método transferencia bancaria
Estado pendingValidation
```

---

### 7.2. PaymentReceipt

Comprobante o evidencia asociada a un pago.

Puede ser:

* archivo;
* imagen;
* PDF;
* referencia textual;
* número de transacción;
* nota administrativa.

---

### 7.3. PaymentAllocation

Asignación de un pago a uno o varios cargos.

Ejemplo:

```text id="l61ork"
Pago 100.00
- Cargo alícuota julio: 50.00
- Cargo alícuota agosto: 50.00
```

---

### 7.4. PaymentMethod

Método usado para registrar el pago.

Ejemplos:

```text id="gob1he"
cash
bankTransfer
deposit
check
online
other
```

---

### 7.5. PaymentValidation

Proceso administrativo mediante el cual un pago reportado se confirma o rechaza.

---

### 7.6. PaymentReversal

Reverso formal de un pago confirmado.

No elimina el pago original.

---

### 7.7. Unallocated Amount

Parte del pago que aún no se asigna a cargos.

---

### 7.8. Overpayment

Monto excedente luego de cubrir cargos seleccionados.

Puede quedar como saldo a favor en spec futura.

---

## 8. Supuestos

1. `Tenant` ya existe.
2. `UserProfile`, roles y permisos ya existen.
3. `PropertyUnit` ya existe.
4. `Charge` ya existe desde `004-dues-fees`.
5. Todo pago se registra en USD en MVP.
6. Todo pago se asocia a una unidad.
7. Un pago puede aplicarse a uno o varios cargos.
8. Un cargo puede recibir múltiples pagos parciales.
9. No se permite float para dinero.
10. Todos los montos usan Decimal.
11. Un pago reportado puede requerir validación administrativa.
12. Un pago rechazado no se asigna a cargos.
13. Un pago confirmado puede asignarse a cargos.
14. Un pago reversado no debe seguir afectando saldos.
15. Los comprobantes deben almacenarse de forma privada.
16. En MVP se puede registrar referencia de comprobante aunque el módulo de archivos sea mínimo.
17. Los estados de cuenta consolidados se implementarán en `006-account-statements`.
18. La conciliación bancaria automática se implementará después.
19. Toda operación financiera debe auditarse.
20. WordPress no registra ni valida pagos.

---

## 9. Reglas de negocio

### BR-001 — Todo pago pertenece a un tenant

Todo `Payment`, `PaymentReceipt`, `PaymentAllocation` y `PaymentReversal` debe tener `tenantId`.

---

### BR-002 — Todo pago pertenece a una unidad

Todo pago debe estar asociado a una `PropertyUnit`.

---

### BR-003 — Unidad debe pertenecer al tenant

No se puede registrar pago para una unidad de otro tenant.

---

### BR-004 — Pago debe tener monto decimal

Todo pago debe tener `amount` Decimal mayor que 0.

Prohibido:

```text id="95iupm"
float
double
number inseguro para dinero
```

---

### BR-005 — Moneda inicial USD

La moneda inicial del MVP es:

```text id="w37q4i"
USD
```

---

### BR-006 — Pago puede estar pendiente de validación

Un pago reportado por residente o propietario puede iniciar en estado:

```text id="gqvnz7"
pendingValidation
```

---

### BR-007 — Pago confirmado puede asignarse

Solo pagos confirmados pueden aplicarse a cargos, salvo política administrativa explícita.

---

### BR-008 — Pago rechazado no se asigna

Un pago rechazado no puede asignarse a cargos.

---

### BR-009 — Pago reversado no afecta saldos

Un pago reversado debe excluirse del cálculo de saldos futuros.

---

### BR-010 — No eliminar pagos físicamente

Un pago registrado no debe eliminarse físicamente.

Se puede:

* rechazar;
* cancelar;
* reversar;
* archivar según política;
* corregir mediante registro nuevo.

---

### BR-011 — No sobrescribir monto original del pago

El monto original del pago debe conservarse.

Correcciones se registran mediante reversos o ajustes futuros.

---

### BR-012 — Asignación no puede exceder monto disponible

La suma de `PaymentAllocation.amount` activa no puede exceder el monto efectivo del pago.

---

### BR-013 — Asignación no puede exceder saldo del cargo

La asignación a un cargo no debe exceder el monto pendiente del cargo.

---

### BR-014 — Cargo debe pertenecer al mismo tenant

No se puede asignar pago a cargo de otro tenant.

---

### BR-015 — Cargo debe pertenecer a la misma unidad o política permitida

En MVP, un pago de una unidad solo se asigna a cargos de la misma unidad.

---

### BR-016 — Pagos parciales permitidos

Un pago puede cubrir parcialmente un cargo.

---

### BR-017 — Pago puede cubrir múltiples cargos

Un pago puede asignarse a varios cargos de la misma unidad.

---

### BR-018 — Excedente debe conservarse

Si el pago excede los cargos seleccionados, el excedente debe quedar como monto no asignado.

El saldo a favor se tratará formalmente en `006-account-statements`.

---

### BR-019 — Validación requiere actor

Confirmar o rechazar pago requiere usuario autenticado con permiso.

---

### BR-020 — Rechazo requiere motivo

Todo pago rechazado requiere motivo.

---

### BR-021 — Reverso requiere motivo

Todo reverso de pago requiere motivo.

---

### BR-022 — Comprobante requerido según método

Para `bankTransfer` o `deposit`, el comprobante o referencia debe ser requerido según política del tenant.

MVP recomendado:

```text id="dxem7b"
bankTransfer y deposit requieren receipt o transactionReference.
```

---

### BR-023 — Idempotencia de pagos

El sistema debe evitar pagos duplicados mediante:

* `Idempotency-Key`;
* referencia externa;
* comprobante;
* combinación tenant + propertyUnit + amount + paidAt + transactionReference.

La política exacta se cerrará en `data-model.md`.

---

### BR-024 — Auditoría obligatoria

Toda creación, confirmación, rechazo, asignación, reverso o cambio de estado de pago debe auditarse.

---

### BR-025 — WordPress no registra pagos

WordPress no debe registrar, validar ni modificar pagos.

Debe redirigir al Core o consumir endpoints públicos no financieros cuando corresponda.

---

## 10. Estados

## 10.1. PaymentStatus

```text id="h4ikuj"
draft
reported
pendingValidation
confirmed
partiallyAllocated
allocated
rejected
cancelled
reversed
archived
```

| Estado               | Descripción                                 |
| -------------------- | ------------------------------------------- |
| `draft`              | Pago creado pero no enviado o no confirmado |
| `reported`           | Pago reportado por usuario                  |
| `pendingValidation`  | En espera de validación                     |
| `confirmed`          | Pago confirmado pero no totalmente asignado |
| `partiallyAllocated` | Pago parcialmente aplicado a cargos         |
| `allocated`          | Pago totalmente aplicado                    |
| `rejected`           | Pago rechazado                              |
| `cancelled`          | Pago cancelado antes de confirmación final  |
| `reversed`           | Pago reversado                              |
| `archived`           | Histórico no operativo                      |

---

## 10.2. PaymentReceiptStatus

```text id="m4fui4"
pending
uploaded
accepted
rejected
archived
```

---

## 10.3. PaymentAllocationStatus

```text id="enc940"
active
reversed
cancelled
archived
```

---

## 10.4. PaymentReversalStatus

```text id="r5dzb3"
completed
cancelled
```

---

## 10.5. PaymentMethodType

```text id="jd2ca7"
cash
bankTransfer
deposit
check
online
other
```

En MVP se implementan:

```text id="gniz4m"
cash
bankTransfer
deposit
other
```

Se reservan:

```text id="n0v54g"
check
online
```

---

## 11. Flujos funcionales

## 11.1. Registrar pago administrativo

### Actor

Treasurer o TenantAdmin con permiso `payments.create`.

### Flujo

```text id="c1w26u"
1. Actor selecciona unidad.
2. Actor ingresa monto, método, fecha de pago y referencia.
3. Sistema valida tenant.
4. Sistema valida unidad.
5. Sistema valida monto Decimal.
6. Sistema crea Payment.
7. Sistema deja el pago en confirmed o pendingValidation según política.
8. Sistema audita.
9. Sistema emite PaymentCreated.
```

---

## 11.2. Reportar pago por propietario o residente

### Actor

PropertyOwner o Resident con permiso `payments.create.own`.

### Flujo

```text id="m40q8h"
1. Usuario selecciona unidad propia.
2. Usuario ingresa monto, método, fecha y referencia.
3. Usuario sube comprobante si aplica.
4. Sistema valida relación .own.
5. Sistema crea Payment en pendingValidation.
6. Sistema audita.
7. Sistema emite PaymentReported.
```

---

## 11.3. Subir comprobante de pago

### Actor

PropertyOwner, Resident, Treasurer o TenantAdmin.

### Flujo

```text id="bymfho"
1. Actor selecciona pago.
2. Actor sube archivo o registra referencia.
3. Sistema valida acceso.
4. Sistema valida tipo y tamaño de archivo si aplica.
5. Sistema crea PaymentReceipt.
6. Sistema audita.
7. Sistema emite PaymentReceiptUploaded.
```

---

## 11.4. Confirmar pago

### Actor

Treasurer o TenantAdmin con permiso `payments.confirm`.

### Flujo

```text id="oqhw69"
1. Actor revisa pago y comprobante.
2. Sistema valida permiso.
3. Sistema valida que el pago pertenece al tenant.
4. Sistema cambia estado a confirmed.
5. Sistema registra PaymentValidation.
6. Sistema audita.
7. Sistema emite PaymentConfirmed.
```

---

## 11.5. Rechazar pago

### Actor

Treasurer o TenantAdmin con permiso `payments.reject`.

### Flujo

```text id="k30ehr"
1. Actor revisa pago.
2. Actor ingresa motivo.
3. Sistema valida estado.
4. Sistema cambia estado a rejected.
5. Sistema registra motivo.
6. Sistema audita.
7. Sistema emite PaymentRejected.
```

---

## 11.6. Asignar pago a cargos

### Actor

Treasurer o TenantAdmin con permiso `payments.allocate`.

### Flujo

```text id="isjwir"
1. Actor selecciona pago confirmado.
2. Actor selecciona cargos pendientes de la misma unidad.
3. Actor define monto por cargo.
4. Sistema valida tenant.
5. Sistema valida unidad.
6. Sistema valida cargos.
7. Sistema valida monto disponible del pago.
8. Sistema valida saldo pendiente de cada cargo.
9. Sistema crea PaymentAllocations.
10. Sistema actualiza estado del pago.
11. Sistema actualiza estado de cargos si corresponde.
12. Sistema audita.
13. Sistema emite PaymentAllocated.
```

---

## 11.7. Autoasignar pago

### Actor

Treasurer o TenantAdmin con permiso `payments.allocate`.

### Flujo

```text id="md2wq0"
1. Actor selecciona pago confirmado.
2. Sistema obtiene cargos pendientes de la unidad.
3. Sistema ordena cargos por dueDate ascendente.
4. Sistema asigna el pago hasta agotar monto disponible.
5. Sistema registra allocations.
6. Sistema actualiza estados.
7. Sistema audita.
8. Sistema emite PaymentAutoAllocated.
```

---

## 11.8. Reversar pago

### Actor

Usuario con permiso `payments.reverse`.

### Flujo

```text id="ct3ojq"
1. Actor selecciona pago.
2. Actor ingresa motivo.
3. Sistema valida que el pago pertenece al tenant.
4. Sistema valida estado reversible.
5. Sistema reversa asignaciones activas.
6. Sistema crea PaymentReversal.
7. Sistema cambia estado del pago a reversed.
8. Sistema actualiza cargos afectados.
9. Sistema audita.
10. Sistema emite PaymentReversed.
```

---

## 12. Historias de usuario

### US-001 — Registrar pago administrativo

Como Treasurer, quiero registrar un pago recibido para una unidad, para que el sistema refleje el abono del propietario o residente.

#### Criterios de aceptación

* El pago pertenece al tenant activo.
* El pago se asocia a una unidad del tenant.
* El monto es Decimal.
* La creación se audita.
* No se crea pago para unidad de otro tenant.

---

### US-002 — Reportar pago propio

Como PropertyOwner, quiero reportar un pago de mi unidad y subir comprobante, para que administración lo valide.

#### Criterios de aceptación

* Solo puedo reportar pagos de unidades propias.
* El pago queda `pendingValidation`.
* El comprobante queda asociado.
* La operación se audita.

---

### US-003 — Confirmar pago reportado

Como Treasurer, quiero confirmar un pago reportado después de revisar el comprobante.

#### Criterios de aceptación

* Requiere permiso `payments.confirm`.
* El pago pasa a `confirmed`.
* Se registra actor y fecha.
* Se audita.

---

### US-004 — Rechazar pago reportado

Como Treasurer, quiero rechazar un pago inválido indicando motivo.

#### Criterios de aceptación

* Requiere permiso `payments.reject`.
* El motivo es obligatorio.
* El pago pasa a `rejected`.
* No se asigna a cargos.
* Se audita.

---

### US-005 — Asignar pago a cargos

Como Treasurer, quiero aplicar un pago confirmado a cargos pendientes de la unidad.

#### Criterios de aceptación

* El pago debe estar confirmado.
* Los cargos deben pertenecer a la misma unidad.
* La suma asignada no excede el monto disponible.
* La asignación se audita.
* Los estados se actualizan.

---

### US-006 — Registrar pago parcial

Como Treasurer, quiero asignar un pago menor al saldo de un cargo para registrar un abono parcial.

#### Criterios de aceptación

* El cargo queda parcialmente pagado.
* El pago queda asignado total o parcialmente.
* El saldo restante se conserva para estado de cuenta futuro.

---

### US-007 — Registrar pago excedente

Como Treasurer, quiero registrar un pago mayor a los cargos seleccionados y conservar el excedente.

#### Criterios de aceptación

* Se asigna solo hasta cubrir cargos.
* El excedente queda como monto no asignado.
* El excedente podrá usarse en estado de cuenta futuro.
* Se audita.

---

### US-008 — Consultar mis pagos

Como PropertyOwner o Resident autorizado, quiero consultar mis pagos y su estado.

#### Criterios de aceptación

* Solo veo pagos de mis unidades.
* No veo pagos de unidades ajenas.
* No veo pagos de otro tenant.
* Requiere `payments.read.own`.

---

### US-009 — Reversar pago

Como Treasurer autorizado, quiero reversar un pago confirmado por error.

#### Criterios de aceptación

* Requiere permiso `payments.reverse`.
* Requiere motivo.
* No elimina el pago.
* Reversa asignaciones activas.
* Actualiza cargos afectados.
* Se audita.

---

## 13. Requisitos funcionales

### FR-001 — Crear pago administrativo

El sistema debe permitir crear pagos desde administración.

---

### FR-002 — Reportar pago propio

El sistema debe permitir que propietarios o residentes reporten pagos de unidades propias.

---

### FR-003 — Registrar comprobante

El sistema debe permitir asociar comprobante o referencia a un pago.

---

### FR-004 — Listar pagos

El sistema debe permitir listar pagos por tenant.

---

### FR-005 — Consultar pago por ID

El sistema debe permitir consultar un pago específico del tenant activo.

---

### FR-006 — Confirmar pago

El sistema debe permitir confirmar pagos pendientes de validación.

---

### FR-007 — Rechazar pago

El sistema debe permitir rechazar pagos con motivo obligatorio.

---

### FR-008 — Asignar pago a cargos

El sistema debe permitir aplicar pagos a cargos del mismo tenant y unidad.

---

### FR-009 — Autoasignar pago

El sistema debe permitir asignar automáticamente pagos a cargos pendientes en orden de vencimiento.

---

### FR-010 — Consultar asignaciones

El sistema debe permitir consultar asignaciones de un pago.

---

### FR-011 — Reversar pago

El sistema debe permitir reversar pagos bajo permiso y motivo.

---

### FR-012 — Consultar mis pagos

El sistema debe permitir a propietarios o residentes consultar pagos propios.

---

### FR-013 — Consultar pagos por unidad

El sistema debe permitir consultar pagos asociados a una unidad.

---

### FR-014 — Controlar duplicados

El sistema debe evitar pagos duplicados mediante idempotencia y referencias.

---

### FR-015 — Auditar operaciones de pago

El sistema debe auditar creación, confirmación, rechazo, asignación y reverso de pagos.

---

### FR-016 — Emitir eventos de pago

El sistema debe emitir eventos de dominio por operaciones relevantes.

---

### FR-017 — Actualizar estado de cargo

El sistema debe actualizar estado de cargos afectados por asignaciones de pago.

---

### FR-018 — Conservar excedentes

El sistema debe conservar monto no asignado para uso futuro.

---

### FR-019 — Proteger comprobantes

El sistema debe proteger comprobantes y no exponerlos públicamente.

---

### FR-020 — Validar aislamiento multitenant

El sistema debe impedir pagos, comprobantes o asignaciones entre tenants distintos.

---

## 14. Requisitos no funcionales

### NFR-001 — Seguridad financiera

Todo endpoint de pagos requiere autenticación, tenant activo, membership activa y permiso.

---

### NFR-002 — Multitenancy

Todo registro de pago debe incluir `tenantId`.

---

### NFR-003 — Precisión monetaria

Todos los montos deben usar Decimal.

---

### NFR-004 — Idempotencia

El sistema debe evitar duplicidad de pagos y asignaciones.

---

### NFR-005 — Auditoría

Toda operación financiera debe ser auditable.

---

### NFR-006 — Trazabilidad

No se debe perder historia de pagos, comprobantes, asignaciones ni reversos.

---

### NFR-007 — Privacidad

Los pagos propios solo son visibles para usuarios relacionados con la unidad y roles autorizados.

---

### NFR-008 — Seguridad de archivos

Los comprobantes deben almacenarse de forma privada y accederse mediante permisos.

---

### NFR-009 — Observabilidad

Operaciones críticas deben registrar logs estructurados, métricas y `traceId`.

---

### NFR-010 — Preparación para conciliación

El modelo debe permitir conciliación bancaria futura.

---

### NFR-011 — Preparación para estados de cuenta

El modelo debe permitir reconstrucción de saldos en `006-account-statements`.

---

## 15. Modelo de datos preliminar

### 15.1. Payment

```text id="rdt67s"
Payment
├── id
├── tenantId
├── propertyUnitId
├── reportedBy nullable
├── createdBy
├── method
├── amount
├── allocatedAmount
├── unallocatedAmount
├── currency
├── paidAt
├── reportedAt
├── confirmedAt nullable
├── confirmedBy nullable
├── rejectedAt nullable
├── rejectedBy nullable
├── rejectionReason nullable
├── status
├── transactionReference nullable
├── externalReference nullable
├── idempotencyKey nullable
├── notes nullable
├── createdAt
└── updatedAt
```

---

### 15.2. PaymentReceipt

```text id="c1dq66"
PaymentReceipt
├── id
├── tenantId
├── paymentId
├── fileId nullable
├── fileName nullable
├── mimeType nullable
├── fileSize nullable
├── receiptNumber nullable
├── transactionReference nullable
├── status
├── uploadedBy
├── uploadedAt
├── reviewedBy nullable
├── reviewedAt nullable
├── rejectionReason nullable
└── createdAt
```

---

### 15.3. PaymentAllocation

```text id="og7vvl"
PaymentAllocation
├── id
├── tenantId
├── paymentId
├── chargeId
├── propertyUnitId
├── amount
├── currency
├── status
├── allocatedBy
├── allocatedAt
├── reversedAt nullable
├── reversedBy nullable
├── reversalReason nullable
└── createdAt
```

---

### 15.4. PaymentReversal

```text id="wrtzh9"
PaymentReversal
├── id
├── tenantId
├── paymentId
├── reason
├── reversedBy
├── reversedAt
├── createdAt
└── traceId
```

---

### 15.5. PaymentMethod

En MVP se puede implementar como enum.

Futuro:

```text id="q4nhkr"
PaymentMethod
├── id
├── tenantId
├── type
├── name
├── isActive
├── requiresReceipt
├── createdAt
└── updatedAt
```

---

## 16. Permisos iniciales

### 16.1. Pagos administrativos

```text id="20tvxc"
payments.create
payments.read
payments.confirm
payments.reject
payments.allocate
payments.reverse
```

---

### 16.2. Pagos propios

```text id="3fcs9a"
payments.create.own
payments.read.own
payments.receipts.upload.own
```

---

### 16.3. Comprobantes

```text id="tkmb6i"
paymentReceipts.create
paymentReceipts.read
paymentReceipts.review
paymentReceipts.reject
paymentReceipts.download
paymentReceipts.download.own
```

---

### 16.4. Auditoría y reportes

```text id="bh916c"
payments.audit.read
payments.reports.read
```

---

## 17. API preliminar

### 17.1. Payments API administrativa

```text id="e7s9b2"
GET    /api/v1/tenant/payments
POST   /api/v1/tenant/payments
GET    /api/v1/tenant/payments/{paymentId}
POST   /api/v1/tenant/payments/{paymentId}/confirm
POST   /api/v1/tenant/payments/{paymentId}/reject
POST   /api/v1/tenant/payments/{paymentId}/allocate
POST   /api/v1/tenant/payments/{paymentId}/auto-allocate
POST   /api/v1/tenant/payments/{paymentId}/reverse
```

---

### 17.2. Payment Receipts API

```text id="6wmlk3"
GET    /api/v1/tenant/payments/{paymentId}/receipts
POST   /api/v1/tenant/payments/{paymentId}/receipts
GET    /api/v1/tenant/payment-receipts/{receiptId}
GET    /api/v1/tenant/payment-receipts/{receiptId}/download
POST   /api/v1/tenant/payment-receipts/{receiptId}/accept
POST   /api/v1/tenant/payment-receipts/{receiptId}/reject
```

---

### 17.3. Payment Allocations API

```text id="f7rz9x"
GET    /api/v1/tenant/payments/{paymentId}/allocations
GET    /api/v1/tenant/payment-allocations/{allocationId}
POST   /api/v1/tenant/payment-allocations/{allocationId}/reverse
```

---

### 17.4. Own Payments API

```text id="mg1edj"
GET    /api/v1/me/payments
POST   /api/v1/me/payments
GET    /api/v1/me/payments/{paymentId}
POST   /api/v1/me/payments/{paymentId}/receipts
GET    /api/v1/me/payment-receipts/{receiptId}/download
```

---

## 18. Autorización

### 18.1. Reglas generales

Cada endpoint privado requiere:

```text id="xpqc7k"
1. Token válido.
2. UserProfile activo.
3. Tenant activo.
4. Membership activa.
5. Permiso requerido.
6. Recurso dentro del tenant.
7. Si es .own, relación con unidad propia.
```

---

### 18.2. Acceso administrativo

Ejemplos:

```text id="v5448d"
payments.read
payments.create
payments.confirm
payments.reject
payments.allocate
payments.reverse
```

---

### 18.3. Acceso propio

Ejemplos:

```text id="kjp9th"
payments.create.own
payments.read.own
paymentReceipts.download.own
```

Requiere:

```text id="b19rcq"
UserProfile → Person → PropertyUnit
```

---

### 18.4. Reglas `.own`

Un usuario puede reportar o consultar pagos de una unidad si:

* es propietario activo;
* es residente activo autorizado;
* cumple política del tenant.

---

## 19. Auditoría

### 19.1. Eventos auditables

```text id="ev6i12"
payment.created
payment.reported
payment.confirmed
payment.rejected
payment.allocated
payment.autoAllocated
payment.reversed
paymentReceipt.uploaded
paymentReceipt.accepted
paymentReceipt.rejected
paymentReceipt.downloaded
paymentAllocation.created
paymentAllocation.reversed
```

---

### 19.2. Campos mínimos

```text id="hs2v27"
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

Para operaciones críticas registrar:

```text id="r727si"
paymentId
propertyUnitId
chargeId cuando aplique
amount
currency
method
reason cuando aplique
receiptId cuando aplique
```

No registrar datos bancarios sensibles ni contenido de archivos.

---

## 20. Eventos de dominio

Eventos sugeridos:

```text id="t02qqq"
PaymentCreated
PaymentReported
PaymentReceiptUploaded
PaymentConfirmed
PaymentRejected
PaymentAllocated
PaymentAutoAllocated
PaymentReversed
PaymentReceiptAccepted
PaymentReceiptRejected
PaymentAllocationCreated
PaymentAllocationReversed
```

---

## 21. Seguridad

### 21.1. Riesgos principales

| Riesgo                                    | Impacto |
| ----------------------------------------- | ------- |
| Registrar pago para unidad de otro tenant | Crítico |
| Asignar pago a cargo de otro tenant       | Crítico |
| Asignar pago a cargo de otra unidad       | Alto    |
| Duplicar pagos                            | Alto    |
| Confirmar pago sin permiso                | Crítico |
| Reversar pago sin permiso                 | Crítico |
| Eliminar pagos físicamente                | Crítico |
| Exponer comprobantes                      | Alto    |
| Usar float para dinero                    | Alto    |
| Asignar más de lo pagado                  | Crítico |
| Asignar más del saldo del cargo           | Crítico |
| Usuario ve pagos ajenos                   | Alto    |
| Falta de auditoría                        | Crítico |

---

### 21.2. Controles

* tenantId obligatorio;
* `TenantGuard`;
* `TenantPermissionGuard`;
* `OwnPaymentPolicyService`;
* validación de unidad;
* validación de cargo;
* validación de estado de pago;
* validación de monto disponible;
* validación de saldo de cargo;
* Decimal;
* idempotencia;
* no eliminación física;
* storage privado de comprobantes;
* URLs firmadas o controladas para descarga;
* auditoría financiera;
* eventos;
* tests de autorización;
* tests multitenant;
* tests financieros.

---

## 22. Privacidad

Los pagos revelan comportamiento económico.

Reglas:

* propietarios/residentes solo ven pagos de unidades propias;
* no exponer pagos de otras unidades;
* no exponer comprobantes sin permiso;
* no exponer datos personales de otros propietarios/residentes;
* no registrar contenido de comprobantes en logs;
* no usar referencias bancarias como labels de métricas.

---

## 23. Testing

### 23.1. Unit tests

Probar:

* Money;
* PaymentStatus;
* PaymentMethodType;
* Payment entity;
* PaymentReceipt entity;
* PaymentAllocation entity;
* PaymentReversal entity;
* reglas de monto disponible;
* reglas de asignación.

---

### 23.2. Integration tests

Probar:

* crear pago;
* reportar pago propio;
* subir comprobante;
* confirmar pago;
* rechazar pago;
* asignar pago;
* autoasignar pago;
* reversar pago;
* constraints por tenant;
* idempotencia;
* no eliminación física.

---

### 23.3. API tests

Probar:

* Payments API;
* Payment Receipts API;
* Payment Allocations API;
* Own Payments API.

---

### 23.4. Authorization tests

Probar:

* sin token;
* sin permiso;
* sin membership;
* tenant suspendido;
* usuario disabled;
* propietario sin `.own`;
* usuario sin relación con unidad;
* auditor solo lectura.

---

### 23.5. Multitenancy tests

Probar:

* Tenant A no ve pagos Tenant B;
* Tenant A no usa unidad Tenant B;
* Tenant A no asigna pago a cargo Tenant B;
* Tenant A no descarga comprobante Tenant B;
* `.own` no devuelve pagos de otro tenant.

---

### 23.6. Financial regression tests

Probar:

* monto de pago no cambia;
* asignación no excede pago;
* asignación no excede cargo;
* pago parcial;
* pago múltiple sobre cargo;
* pago a múltiples cargos;
* excedente conservado;
* reverso deshace asignaciones;
* cargos actualizan estado correctamente;
* Decimal exacto.

---

## 24. Criterios de aceptación globales

La spec se considera implementada si:

* se registran pagos administrativos;
* propietarios/residentes reportan pagos propios;
* se asocian comprobantes;
* se confirman pagos;
* se rechazan pagos con motivo;
* se asignan pagos a cargos;
* se permiten pagos parciales;
* se permiten pagos a múltiples cargos;
* se conserva monto no asignado;
* se reversan pagos;
* se reversan asignaciones;
* se consultan pagos por tenant;
* se consultan pagos por unidad;
* se consultan mis pagos;
* no hay acceso cross-tenant;
* no se usa float;
* no se elimina físicamente ningún pago;
* no se sobrescribe monto original;
* comprobantes están protegidos;
* se auditan operaciones;
* se emiten eventos;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas de autorización pasan;
* pruebas multitenant pasan;
* pruebas financieras pasan;
* OpenAPI está actualizado;
* CI pasa.

---

## 25. Casos borde

| Caso                                   | Resultado esperado           |
| -------------------------------------- | ---------------------------- |
| Crear pago con monto negativo          | 422                          |
| Crear pago sin unidad                  | 422                          |
| Crear pago para unidad de otro tenant  | 403/422                      |
| Confirmar pago ya confirmado           | 409                          |
| Rechazar pago ya confirmado            | 409                          |
| Rechazar sin motivo                    | 422                          |
| Asignar pago pendingValidation         | 409                          |
| Asignar pago rejected                  | 409                          |
| Asignar pago reversed                  | 409                          |
| Asignar más del monto disponible       | 422                          |
| Asignar más del saldo del cargo        | 422                          |
| Asignar a cargo de otro tenant         | 403/422                      |
| Asignar a cargo de otra unidad         | 422                          |
| Reversar pago ya reversado             | 409                          |
| Descargar comprobante ajeno            | 403/404                      |
| Usuario sin Person reporta pago propio | 403                          |
| Tenant suspendido registra pago        | 403                          |
| Intentar borrar pago físicamente       | prohibido                    |
| Comprobante con tipo no permitido      | 422                          |
| Comprobante demasiado grande           | 422                          |
| Idempotency-Key repetida               | no duplica o 409 documentado |

---

## 26. Dependencias hacia specs futuras

Este módulo habilita:

```text id="d61pgu"
006-account-statements
007-audit
00X-bank-reconciliation
009-notifications
00X-late-fees
00X-reports
00X-n8n-automations
```

Especialmente habilita:

* saldos por unidad;
* estados de cuenta;
* recibos visibles por propietario;
* conciliación bancaria;
* reportes de cartera;
* notificaciones de pago confirmado;
* alertas de pagos pendientes;
* cobranza.

---

## 27. Archivos derivados esperados

Esta spec debe complementarse con:

```text id="g97f8o"
docs/specs/005-payments/
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

1. ¿Los pagos reportados por residentes siempre requieren validación administrativa?
2. ¿Los pagos administrativos se crean directamente como `confirmed`?
3. ¿Qué métodos de pago estarán habilitados en MVP?
4. ¿El comprobante será obligatorio para transferencias y depósitos?
5. ¿Dónde se almacenarán inicialmente los comprobantes: MinIO local, S3-compatible o base de datos?
6. ¿Se permitirá pago en efectivo sin comprobante?
7. ¿Se permitirá autoasignación por orden de vencimiento?
8. ¿Se permitirá asignar un pago a cargos de varias unidades del mismo propietario?
9. ¿Cómo se manejará saldo a favor formalmente?
10. ¿Se permitirá reversar pagos con cargos ya cerrados en estado de cuenta?
11. ¿Quién puede rechazar comprobantes?
12. ¿Se requiere doble aprobación para reversos?
13. ¿Se permitirá adjuntar más de un comprobante por pago?
14. ¿Se permitirá OCR de comprobantes en una fase futura?
15. ¿Qué tamaño máximo de archivo se aceptará para comprobantes?

---

## 29. Decisión inicial para MVP

Para MVP se recomienda:

```text id="cz68uj"
- Registrar pagos administrativos.
- Permitir reporte de pagos propios.
- Requerir unidad para todo pago.
- Mantener pagos en USD.
- Usar Decimal para dinero.
- Permitir comprobante básico mediante fileId o referencia.
- Usar storage privado para comprobantes.
- Dejar pagos reportados en pendingValidation.
- Permitir confirmar o rechazar pagos.
- Permitir asignar pagos confirmados a cargos.
- Permitir autoasignación por dueDate ascendente.
- Permitir pagos parciales.
- Permitir pagos a múltiples cargos de la misma unidad.
- Conservar unallocatedAmount.
- Permitir reverso de pago con motivo.
- Reversar asignaciones activas al reversar pago.
- Diferir conciliación bancaria.
- Diferir pasarela de pagos.
- Diferir facturación electrónica.
- Diferir OCR/IA.
- Diferir aprobación dual avanzada.
```

---

## 30. Conclusión

El módulo `005-payments` establece la base para registrar ingresos y aplicar pagos contra cargos generados por `004-dues-fees`.

Este módulo debe priorizar:

```text id="d42i5v"
precisión monetaria
trazabilidad financiera
validación administrativa
comprobantes protegidos
asignación correcta a cargos
no duplicidad
no eliminación física
auditoría
multitenancy
acceso propio seguro
preparación para estados de cuenta
preparación para conciliación bancaria
```

No se debe implementar ningún estado de cuenta, conciliación bancaria o reporte financiero avanzado sin garantizar que los pagos sean correctos, auditables, no duplicados, protegidos y asignados a los cargos correspondientes.
