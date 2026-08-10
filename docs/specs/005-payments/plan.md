# Plan — Spec 005 Payments, Receipts and Payment Allocation

## 1. Información del documento

| Campo          | Valor                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                 |
| Spec ID        | 005                                                                           |
| Módulo         | Payments                                                                      |
| Documento      | Implementation Plan                                                           |
| Ruta           | `docs/specs/005-payments/plan.md`                                             |
| Versión        | 0.1                                                                           |
| Estado         | needs-review                                                                  |
| Fecha          | 2026-07-14                                                                    |
| Documento base | `docs/specs/005-payments/spec.md`                                             |
| Depende de     | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees` |
| Arquitectura   | Monolito modular NestJS                                                       |
| Base de datos  | PostgreSQL + Prisma                                                           |
| Autorización   | Tenant-aware RBAC + permisos financieros + `.own` policies                    |
| Prioridad      | Alta                                                                          |

---

## 2. Propósito

Este documento transforma la especificación funcional `005-payments/spec.md` en un plan técnico de implementación.

El módulo `005-payments` permitirá administrar:

* pagos administrativos;
* pagos reportados por propietarios o residentes;
* comprobantes de pago;
* validación administrativa;
* rechazo de pagos;
* confirmación de pagos;
* asignación de pagos a cargos;
* pagos parciales;
* pagos excedentes;
* reversos de pagos;
* consulta administrativa;
* consulta propia;
* protección de comprobantes;
* auditoría financiera;
* eventos de dominio;
* preparación para estados de cuenta;
* preparación para conciliación bancaria futura.

Regla central:

```text id="87xf0z"
Todo pago debe ser tenant-scoped, unit-scoped, auditable, no destructivo, preciso en dinero, asignable a cargos y protegido por permisos financieros.
```

---

## 3. Resumen de implementación

El módulo se implementará como módulo interno de NestJS dentro del monolito modular de RESIDENT Core.

Entidades principales:

```text id="6l985n"
Payment
PaymentReceipt
PaymentAllocation
PaymentReversal
PaymentValidation
PaymentMethod
```

En MVP, `PaymentMethod` puede implementarse como enum. La tabla `payment_methods` queda diferida salvo que se requiera configuración por tenant desde el inicio.

Relación conceptual:

```text id="v8u35q"
Tenant
├── PropertyUnit
│   └── Payment
│       ├── PaymentReceipt
│       ├── PaymentAllocation
│       │   └── Charge
│       └── PaymentReversal
```

Relación con módulos previos:

```text id="o4mtsg"
Tenant                  ← 001-tenants
UserProfile/permissions ← 002-users-roles
Person/PropertyUnit     ← 003-residents-properties
Charge                  ← 004-dues-fees
Payment                 ← 005-payments
AccountStatement        ← 006-account-statements futuro
BankReconciliation      ← spec futura
```

---

## 4. Decisiones técnicas aplicables

Este módulo debe respetar:

```text id="exr84b"
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

* Todo pago lleva `tenantId`.
* Todo pago se asocia a `PropertyUnit`.
* Todo monto usa `Decimal`.
* No se usan `float` ni `double`.
* No se elimina físicamente ningún pago.
* El monto original del pago no se sobrescribe.
* Los pagos reportados por usuarios quedan `pendingValidation`.
* Solo pagos confirmados pueden asignarse a cargos.
* Toda asignación debe validar saldo disponible del pago.
* Toda asignación debe validar saldo pendiente del cargo.
* Un pago de una unidad solo se asigna a cargos de la misma unidad en MVP.
* Todo comprobante se almacena de forma privada.
* Todo cambio financiero se audita.
* Los propietarios/residentes solo consultan pagos de unidades propias.

---

## 5. Alcance técnico

### 5.1. Incluido

La implementación inicial cubre:

* modelos Prisma;
* migraciones;
* seeds demo;
* entidades de dominio;
* value objects;
* DTOs;
* repositorios;
* puertos hacia `003-residents-properties`;
* puertos hacia `004-dues-fees`;
* puertos de storage privado para comprobantes;
* servicios de aplicación;
* casos de uso;
* validación de pagos;
* asignación manual;
* autoasignación;
* reverso de pago;
* reverso de asignación;
* endpoints administrativos;
* endpoints `.own`;
* auditoría;
* eventos;
* OpenAPI;
* pruebas unitarias;
* pruebas de integración;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas financieras de regresión;
* pruebas de idempotencia;
* pruebas de seguridad.

---

### 5.2. Diferido

No se implementará todavía:

* conciliación bancaria automática;
* importación masiva de movimientos bancarios;
* pasarela de pagos en línea;
* pagos con tarjeta;
* tokenización de tarjetas;
* facturación electrónica;
* asientos contables;
* contabilidad completa;
* cierre contable;
* OCR de comprobantes;
* validación automática de comprobantes con IA;
* aprobación dual avanzada;
* notificaciones automáticas;
* cobranza automatizada;
* carga masiva desde archivo;
* reglas avanzadas de mora;
* integración bancaria directa.

---

## 6. Estructura de carpetas recomendada

```text id="ij00dp"
apps/api/src/modules/payments/
├── payments.module.ts
│
├── payments.controller.ts
├── payment-receipts.controller.ts
├── payment-allocations.controller.ts
├── own-payments.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── create-payment.use-case.ts
│   │   ├── report-own-payment.use-case.ts
│   │   ├── get-payment.use-case.ts
│   │   ├── list-payments.use-case.ts
│   │   ├── confirm-payment.use-case.ts
│   │   ├── reject-payment.use-case.ts
│   │   ├── allocate-payment.use-case.ts
│   │   ├── auto-allocate-payment.use-case.ts
│   │   ├── reverse-payment.use-case.ts
│   │   ├── upload-payment-receipt.use-case.ts
│   │   ├── list-payment-receipts.use-case.ts
│   │   ├── get-payment-receipt.use-case.ts
│   │   ├── download-payment-receipt.use-case.ts
│   │   ├── accept-payment-receipt.use-case.ts
│   │   ├── reject-payment-receipt.use-case.ts
│   │   ├── list-payment-allocations.use-case.ts
│   │   ├── get-payment-allocation.use-case.ts
│   │   ├── reverse-payment-allocation.use-case.ts
│   │   ├── get-my-payments.use-case.ts
│   │   ├── get-my-payment.use-case.ts
│   │   ├── report-my-payment.use-case.ts
│   │   ├── upload-my-payment-receipt.use-case.ts
│   │   └── download-my-payment-receipt.use-case.ts
│   │
│   ├── services/
│   │   ├── payment-policy.service.ts
│   │   ├── payment-validation.service.ts
│   │   ├── payment-allocation.service.ts
│   │   ├── payment-auto-allocation.service.ts
│   │   ├── payment-reversal.service.ts
│   │   ├── payment-idempotency.service.ts
│   │   ├── payment-effective-amount.service.ts
│   │   ├── payment-receipt-policy.service.ts
│   │   ├── payment-receipt-security.service.ts
│   │   ├── own-payment-policy.service.ts
│   │   └── money.service.ts
│   │
│   └── ports/
│       ├── payment.repository.ts
│       ├── payment-receipt.repository.ts
│       ├── payment-allocation.repository.ts
│       ├── payment-reversal.repository.ts
│       ├── property-unit-reader.port.ts
│       ├── own-resource-reader.port.ts
│       ├── charge-reader.port.ts
│       ├── charge-payment-writer.port.ts
│       ├── private-file-storage.port.ts
│       ├── payments-audit.port.ts
│       └── payments-events.port.ts
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── storage/
│   ├── audit/
│   └── events/
│
├── policies/
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="b6nb55"
docs/specs/005-payments/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="3h4zqf"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. Payment

Representa un pago recibido o reportado dentro de un tenant.

Campos conceptuales:

```text id="q0vymk"
id
tenantId
propertyUnitId
reportedBy
createdBy
method
amount
allocatedAmount
unallocatedAmount
currency
paidAt
reportedAt
confirmedAt
confirmedBy
rejectedAt
rejectedBy
rejectionReason
status
transactionReference
externalReference
idempotencyKey
notes
createdAt
updatedAt
```

Responsabilidades:

* registrar pago;
* conservar monto original;
* controlar estado;
* permitir validación;
* permitir asignación a cargos;
* conservar monto asignado y no asignado;
* soportar reverso;
* servir como fuente para estados de cuenta futuros.

Reglas:

* pertenece a tenant;
* pertenece a una unidad;
* monto Decimal positivo;
* moneda USD en MVP;
* no se elimina físicamente;
* no se sobrescribe monto original;
* pagos reportados por usuario inician `pendingValidation`;
* pagos administrativos pueden iniciar `confirmed` según política;
* pagos rechazados no se asignan;
* pagos reversados no afectan saldos.

---

## 8.2. PaymentReceipt

Representa comprobante o evidencia asociada a un pago.

Campos conceptuales:

```text id="ob31wf"
id
tenantId
paymentId
fileId
fileName
mimeType
fileSize
receiptNumber
transactionReference
status
uploadedBy
uploadedAt
reviewedBy
reviewedAt
rejectionReason
createdAt
```

Responsabilidades:

* asociar evidencia;
* permitir revisión;
* controlar descarga;
* proteger archivos;
* conservar trazabilidad.

Reglas:

* pertenece a tenant;
* pertenece a un pago del mismo tenant;
* no se almacena públicamente;
* acceso controlado por permisos;
* no guardar contenido binario en logs;
* no descargar sin autorización;
* puede haber más de un comprobante por pago si se permite.

---

## 8.3. PaymentAllocation

Representa asignación de un pago a un cargo.

Campos conceptuales:

```text id="4de7dm"
id
tenantId
paymentId
chargeId
propertyUnitId
amount
currency
status
allocatedBy
allocatedAt
reversedAt
reversedBy
reversalReason
createdAt
```

Responsabilidades:

* aplicar pagos a cargos;
* soportar pagos parciales;
* soportar un pago a varios cargos;
* soportar múltiples pagos sobre un cargo;
* permitir reverso de asignación;
* actualizar estado de cargo.

Reglas:

* pago y cargo deben pertenecer al mismo tenant;
* pago y cargo deben pertenecer a la misma unidad en MVP;
* monto asignado no excede monto disponible del pago;
* monto asignado no excede saldo pendiente del cargo;
* no se elimina físicamente;
* reverso conserva historial.

---

## 8.4. PaymentReversal

Representa reverso formal de un pago.

Campos conceptuales:

```text id="gl9ip0"
id
tenantId
paymentId
reason
reversedBy
reversedAt
createdAt
traceId
```

Responsabilidades:

* registrar reverso;
* revertir asignaciones activas;
* actualizar estado del pago;
* mantener auditoría.

Reglas:

* pago pertenece al tenant;
* pago debe estar en estado reversible;
* requiere motivo;
* solo un reverso por pago en MVP;
* reversa asignaciones activas;
* no elimina pago original.

---

## 8.5. PaymentValidation

Puede implementarse como campos en `Payment` en MVP, y como tabla futura si se requieren múltiples validaciones.

Campos en MVP:

```text id="r7dkxx"
confirmedAt
confirmedBy
rejectedAt
rejectedBy
rejectionReason
```

Tabla futura posible:

```text id="3vljlo"
payment_validations
```

Decisión MVP:

```text id="9h2o1q"
Usar campos directos en Payment y auditar cada transición.
```

---

## 8.6. PaymentMethod

En MVP se implementa como enum.

Valores:

```text id="52wyyd"
cash
bankTransfer
deposit
check
online
other
```

Operativos en MVP:

```text id="63ai0b"
cash
bankTransfer
deposit
other
```

Diferidos:

```text id="51uvk5"
check
online
```

Tabla futura opcional:

```text id="01wrfg"
payment_methods
```

para configurar por tenant:

* nombre;
* método activo;
* requiere comprobante;
* cuenta bancaria asociada;
* instrucciones;
* reglas de validación.

---

# 9. Value Objects

## 9.1. Money

Responsabilidad:

* representar montos con precisión decimal;
* validar moneda;
* evitar float;
* sumar y restar montos de pago/asignación.

Reglas:

```text id="rd9m7s"
amount decimal
currency USD en MVP
scale 2
amount > 0 para pagos y asignaciones
```

Implementación recomendada:

* usar `Decimal` de Prisma/decimal.js;
* serializar como string en API.

---

## 9.2. PaymentStatus

Valores:

```text id="9ov60p"
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

Responsabilidades:

* controlar transición;
* definir si el pago puede confirmarse;
* definir si puede rechazarse;
* definir si puede asignarse;
* definir si puede reversarse.

---

## 9.3. PaymentMethodType

Valores:

```text id="7uohb4"
cash
bankTransfer
deposit
check
online
other
```

Reglas MVP:

* `cash`, `bankTransfer`, `deposit`, `other` operativos;
* `check` y `online` reservados;
* `bankTransfer` y `deposit` requieren comprobante o referencia según política.

---

## 9.4. PaymentReference

Responsabilidad:

* normalizar referencia de transacción;
* evitar duplicados básicos;
* evitar valores vacíos;
* permitir idempotencia.

Reglas:

* trim;
* longitud máxima;
* no guardar datos bancarios sensibles completos;
* no usar como label de métricas.

---

## 9.5. PaymentIdempotencyKey

Responsabilidad:

* evitar pagos duplicados;
* soportar reintentos seguros.

Formato recomendado:

```text id="1lj1g4"
tenantId:propertyUnitId:amount:paidAt:method:transactionReference
```

Cuando exista header `Idempotency-Key`, usar:

```text id="22h5wj"
tenantId:Idempotency-Key
```

---

## 9.6. PaymentReceiptFile

Responsabilidad:

* validar metadata de comprobante;
* validar mime type;
* validar tamaño;
* controlar extensiones permitidas.

Reglas MVP:

```text id="q3sk6s"
PDF
JPG
JPEG
PNG
WEBP opcional
```

Tamaño sugerido:

```text id="9zmrxq"
max 5 MB por archivo en MVP
```

---

## 9.7. AllocationAmount

Responsabilidad:

* validar monto asignado;
* asegurar que no excede pago disponible;
* asegurar que no excede cargo pendiente.

---

## 9.8. PaymentReversalReason

Responsabilidad:

* exigir motivo;
* controlar longitud;
* evitar payload extenso o datos sensibles.

---

# 10. Modelo Prisma preliminar

El modelo completo se detallará en:

```text id="i2by0y"
docs/specs/005-payments/data-model.md
```

Tablas esperadas:

```text id="nl9yx1"
payments
payment_receipts
payment_allocations
payment_reversals
```

Tabla diferida:

```text id="yf41h6"
payment_methods
```

Relaciones externas:

```text id="0jhkpm"
tenants.id
property_units.id
user_profiles.id
charges.id
files.id futuro o storage file id
```

Reglas de persistencia:

* `tenantId` obligatorio;
* dinero con `Decimal(12,2)`;
* `currency` default USD;
* `onDelete: Restrict`;
* no cascade delete peligroso;
* unique constraints para idempotencia;
* índices por tenant, unidad, estado, fecha, método y cargo;
* comprobantes no públicos;
* no eliminación física.

---

# 11. Constraints principales

## 11.1. Payment

Recomendado:

```text id="wfj9vh"
unique(tenant_id, idempotency_key) where idempotency_key is not null
```

Índices:

```text id="6xg084"
tenant_id
property_unit_id
status
method
paid_at
created_by
reported_by
```

---

## 11.2. PaymentReceipt

Índices:

```text id="td1dgf"
tenant_id
payment_id
uploaded_by
status
```

Regla:

```text id="vmljb5"
payment.tenantId == receipt.tenantId
```

---

## 11.3. PaymentAllocation

Índices:

```text id="pbvuzv"
tenant_id
payment_id
charge_id
property_unit_id
status
```

Regla:

```text id="1ystjo"
payment.tenantId == allocation.tenantId
charge.tenantId == allocation.tenantId
payment.propertyUnitId == allocation.propertyUnitId
charge.propertyUnitId == allocation.propertyUnitId
```

---

## 11.4. PaymentReversal

Recomendado en MVP:

```text id="ub9q8u"
unique(tenant_id, payment_id)
```

para evitar reversar un pago más de una vez.

---

# 12. Repositorios

## 12.1. PaymentRepository

Contrato sugerido:

```text id="iss7s0"
create(input)
findById(tenantId, paymentId)
findByIdempotencyKey(tenantId, idempotencyKey)
list(tenantId, query)
listByPropertyUnit(tenantId, propertyUnitId, query)
listOwnPayments(tenantId, propertyUnitIds, query)
updateStatus(tenantId, paymentId, statusPatch)
updateAllocationAmounts(tenantId, paymentId, allocatedAmount, unallocatedAmount)
markConfirmed(tenantId, paymentId, actorId)
markRejected(tenantId, paymentId, actorId, reason)
markReversed(tenantId, paymentId, actorId, reason)
```

---

## 12.2. PaymentReceiptRepository

Contrato sugerido:

```text id="93q0sm"
create(input)
findById(tenantId, receiptId)
listByPayment(tenantId, paymentId)
markAccepted(tenantId, receiptId, actorId)
markRejected(tenantId, receiptId, actorId, reason)
archive(tenantId, receiptId, actorId, reason)
```

---

## 12.3. PaymentAllocationRepository

Contrato sugerido:

```text id="1os7tu"
create(input)
createMany(input[])
findById(tenantId, allocationId)
listByPayment(tenantId, paymentId)
listByCharge(tenantId, chargeId)
sumActiveByPayment(tenantId, paymentId)
sumActiveByCharge(tenantId, chargeId)
reverse(tenantId, allocationId, actorId, reason)
reverseByPayment(tenantId, paymentId, actorId, reason)
```

---

## 12.4. PaymentReversalRepository

Contrato sugerido:

```text id="sn00ro"
create(input)
findByPaymentId(tenantId, paymentId)
existsForPayment(tenantId, paymentId)
```

---

## 12.5. PropertyUnitReaderPort

Puerto hacia `003-residents-properties`.

Responsabilidad:

```text id="iwrsxy"
findPropertyUnitById(tenantId, propertyUnitId)
validatePropertyUnitBelongsToTenant(tenantId, propertyUnitId)
validatePropertyUnitIsActive(tenantId, propertyUnitId)
```

Regla:

```text id="yosu5k"
005-payments no debe acceder directamente a tablas internas de 003 sin puerto controlado.
```

---

## 12.6. OwnResourceReaderPort

Puerto hacia `003-residents-properties`.

Responsabilidad:

```text id="mjyyag"
getOwnPropertyUnitIds(tenantId, userProfileId)
validateOwnPropertyUnit(tenantId, userProfileId, propertyUnitId)
```

Usado por:

```text id="y3gss0"
payments.create.own
payments.read.own
paymentReceipts.download.own
```

---

## 12.7. ChargeReaderPort

Puerto hacia `004-dues-fees`.

Responsabilidad:

```text id="67wn42"
findChargeById(tenantId, chargeId)
listPendingChargesByPropertyUnit(tenantId, propertyUnitId)
getChargeOutstandingAmount(tenantId, chargeId)
validateChargeBelongsToTenant(tenantId, chargeId)
validateChargeBelongsToPropertyUnit(tenantId, chargeId, propertyUnitId)
```

---

## 12.8. ChargePaymentWriterPort

Puerto hacia `004-dues-fees`.

Responsabilidad:

```text id="q0724j"
markChargePartiallyPaid(tenantId, chargeId)
markChargePaid(tenantId, chargeId)
markChargeIssuedIfPaymentReversed(tenantId, chargeId)
recalculateChargePaymentStatus(tenantId, chargeId)
```

Regla:

```text id="tav4eq"
005-payments no debe modificar cargos de forma destructiva.
```

---

## 12.9. PrivateFileStoragePort

Puerto de storage para comprobantes.

Responsabilidad:

```text id="9huw7y"
uploadPrivateFile(input)
getPrivateDownloadUrl(fileId, actorContext)
deleteTemporaryFile(fileId)
validateFileMetadata(input)
```

Regla:

```text id="4f5cu2"
Los comprobantes no deben almacenarse ni exponerse públicamente.
```

---

# 13. Servicios de aplicación

## 13.1. MoneyService

Responsabilidad:

* validar montos;
* sumar y restar pagos/asignaciones;
* serializar como string;
* evitar float.

Métodos sugeridos:

```text id="a635nl"
parse(amount, currency)
add(a, b)
subtract(a, b)
isPositive(amount)
isZero(amount)
compare(a, b)
toApiString(amount)
```

---

## 13.2. PaymentPolicyService

Responsabilidad:

* validar estados de pago;
* validar confirmación;
* validar rechazo;
* validar asignación;
* validar reverso;
* impedir operaciones destructivas.

Reglas:

```text id="6jwiyw"
pendingValidation puede confirmarse o rechazarse
confirmed puede asignarse
rejected no puede asignarse
reversed no puede asignarse
allocated puede reversarse si política lo permite
```

---

## 13.3. PaymentValidationService

Responsabilidad:

* confirmar pagos;
* rechazar pagos;
* validar comprobante requerido según método;
* registrar actor y fecha.

---

## 13.4. PaymentAllocationService

Responsabilidad:

* validar pago confirmado;
* calcular monto disponible;
* validar cargos;
* validar saldo pendiente del cargo;
* crear asignaciones;
* actualizar `allocatedAmount` y `unallocatedAmount`;
* actualizar estado de pago;
* actualizar estado de cargos.

---

## 13.5. PaymentAutoAllocationService

Responsabilidad:

* obtener cargos pendientes de la unidad;
* ordenar por `dueDate ASC`;
* aplicar pago hasta agotar monto disponible;
* crear asignaciones;
* actualizar estados.

Política MVP:

```text id="jcr834"
auto-allocate aplica primero a cargos más antiguos de la misma unidad.
```

---

## 13.6. PaymentReversalService

Responsabilidad:

* validar estado reversible;
* validar motivo;
* reversar asignaciones activas;
* crear PaymentReversal;
* marcar pago como reversed;
* recalcular cargos afectados.

---

## 13.7. PaymentIdempotencyService

Responsabilidad:

* construir claves idempotentes;
* validar header `Idempotency-Key`;
* evitar pagos duplicados;
* permitir reintentos seguros.

---

## 13.8. PaymentEffectiveAmountService

Responsabilidad:

* calcular monto asignado;
* calcular monto no asignado;
* validar que asignación no excede pago;
* validar que asignación no excede cargo.

---

## 13.9. PaymentReceiptPolicyService

Responsabilidad:

* validar si el método requiere comprobante;
* validar quién puede subir comprobante;
* validar quién puede revisar comprobante;
* validar quién puede descargar comprobante.

---

## 13.10. PaymentReceiptSecurityService

Responsabilidad:

* validar mime type;
* validar tamaño;
* validar extensión;
* sanitizar nombre de archivo;
* evitar archivos peligrosos;
* generar metadata segura.

---

## 13.11. OwnPaymentPolicyService

Responsabilidad:

* validar pagos propios;
* validar unidad propia;
* validar comprobantes propios;
* impedir acceso a pagos ajenos.

---

# 14. Casos de uso principales

## 14.1. CreatePaymentUseCase

Responsabilidad:

* validar permiso `payments.create`;
* validar tenant activo;
* validar unidad del tenant;
* validar monto Decimal;
* validar método;
* validar comprobante o referencia si aplica;
* aplicar idempotencia;
* crear Payment;
* auditar;
* emitir `PaymentCreated`.

Uso:

```text id="i8szod"
POST /api/v1/tenant/payments
```

---

## 14.2. ReportOwnPaymentUseCase

Responsabilidad:

* validar permiso `payments.create.own`;
* resolver unidades propias;
* validar unidad propia;
* validar monto;
* validar método;
* crear Payment en `pendingValidation`;
* asociar comprobante si se envía;
* auditar;
* emitir `PaymentReported`.

Uso:

```text id="zrfqe0"
POST /api/v1/me/payments
```

---

## 14.3. GetPaymentUseCase

Responsabilidad:

* consultar pago del tenant;
* incluir receipts y allocations según permisos;
* no exponer pagos de otro tenant.

---

## 14.4. ListPaymentsUseCase

Responsabilidad:

* listar pagos del tenant;
* soportar filtros;
* soportar paginación;
* filtrar por estado, unidad, método, fecha y referencia.

---

## 14.5. ConfirmPaymentUseCase

Responsabilidad:

* validar permiso `payments.confirm`;
* validar pago pendiente o reportado;
* validar comprobante requerido;
* marcar pago como `confirmed`;
* registrar actor y fecha;
* auditar;
* emitir `PaymentConfirmed`.

---

## 14.6. RejectPaymentUseCase

Responsabilidad:

* validar permiso `payments.reject`;
* validar estado rechazable;
* exigir motivo;
* marcar pago como `rejected`;
* registrar actor y fecha;
* auditar;
* emitir `PaymentRejected`.

---

## 14.7. AllocatePaymentUseCase

Responsabilidad:

* validar permiso `payments.allocate`;
* validar pago confirmado;
* validar cargos seleccionados;
* validar mismo tenant;
* validar misma unidad en MVP;
* validar monto disponible;
* validar saldo pendiente por cargo;
* crear PaymentAllocations;
* actualizar estado del pago;
* actualizar estado de cargos;
* auditar;
* emitir `PaymentAllocated`.

---

## 14.8. AutoAllocatePaymentUseCase

Responsabilidad:

* validar permiso `payments.allocate`;
* validar pago confirmado;
* obtener cargos pendientes de la unidad;
* ordenar por vencimiento;
* asignar hasta agotar monto disponible;
* actualizar estados;
* auditar;
* emitir `PaymentAutoAllocated`.

---

## 14.9. ReversePaymentUseCase

Responsabilidad:

* validar permiso `payments.reverse`;
* validar estado reversible;
* exigir motivo;
* reversar allocations activas;
* crear PaymentReversal;
* marcar pago como `reversed`;
* recalcular cargos afectados;
* auditar;
* emitir `PaymentReversed`.

---

## 14.10. UploadPaymentReceiptUseCase

Responsabilidad:

* validar permiso `paymentReceipts.create`;
* validar pago del tenant;
* validar archivo o referencia;
* subir a storage privado;
* crear PaymentReceipt;
* auditar;
* emitir `PaymentReceiptUploaded`.

---

## 14.11. UploadOwnPaymentReceiptUseCase

Responsabilidad:

* validar permiso `payments.receipts.upload.own`;
* validar pago propio;
* validar archivo o referencia;
* subir a storage privado;
* crear PaymentReceipt;
* auditar;
* emitir `PaymentReceiptUploaded`.

---

## 14.12. DownloadPaymentReceiptUseCase

Responsabilidad:

* validar permiso `paymentReceipts.download`;
* validar receipt del tenant;
* generar URL privada temporal o stream controlado;
* auditar descarga si aplica.

---

## 14.13. DownloadOwnPaymentReceiptUseCase

Responsabilidad:

* validar permiso `paymentReceipts.download.own`;
* validar receipt propio;
* generar URL privada temporal o stream controlado;
* auditar descarga si aplica.

---

## 14.14. AcceptPaymentReceiptUseCase

Responsabilidad:

* validar permiso `paymentReceipts.review`;
* validar receipt del tenant;
* marcar como accepted;
* auditar;
* emitir `PaymentReceiptAccepted`.

---

## 14.15. RejectPaymentReceiptUseCase

Responsabilidad:

* validar permiso `paymentReceipts.reject`;
* exigir motivo;
* marcar receipt como rejected;
* auditar;
* emitir `PaymentReceiptRejected`.

---

## 14.16. ReversePaymentAllocationUseCase

Responsabilidad:

* validar permiso `payments.allocate` o permiso específico futuro;
* validar allocation activa;
* exigir motivo;
* marcar allocation reversed;
* recalcular payment;
* recalcular charge;
* auditar;
* emitir `PaymentAllocationReversed`.

---

## 14.17. GetMyPaymentsUseCase

Responsabilidad:

* validar permiso `payments.read.own`;
* resolver unidades propias;
* listar pagos de esas unidades;
* no devolver pagos ajenos.

---

## 14.18. GetMyPaymentUseCase

Responsabilidad:

* validar permiso `payments.read.own`;
* validar pago propio;
* devolver detalle propio;
* no exponer información administrativa sensible.

---

# 15. Controladores REST

## 15.1. PaymentsController

Ruta base:

```text id="apg7o9"
/api/v1/tenant/payments
```

Endpoints:

```text id="20a725"
GET    /
POST   /
GET    /:paymentId
POST   /:paymentId/confirm
POST   /:paymentId/reject
POST   /:paymentId/allocate
POST   /:paymentId/auto-allocate
POST   /:paymentId/reverse
```

---

## 15.2. PaymentReceiptsController

Rutas:

```text id="15fwlp"
/api/v1/tenant/payments/:paymentId/receipts
/api/v1/tenant/payment-receipts/:receiptId
```

Endpoints:

```text id="sryice"
GET    /api/v1/tenant/payments/:paymentId/receipts
POST   /api/v1/tenant/payments/:paymentId/receipts
GET    /api/v1/tenant/payment-receipts/:receiptId
GET    /api/v1/tenant/payment-receipts/:receiptId/download
POST   /api/v1/tenant/payment-receipts/:receiptId/accept
POST   /api/v1/tenant/payment-receipts/:receiptId/reject
```

---

## 15.3. PaymentAllocationsController

Rutas:

```text id="2ms37q"
/api/v1/tenant/payments/:paymentId/allocations
/api/v1/tenant/payment-allocations/:allocationId
```

Endpoints:

```text id="3rhgv1"
GET    /api/v1/tenant/payments/:paymentId/allocations
GET    /api/v1/tenant/payment-allocations/:allocationId
POST   /api/v1/tenant/payment-allocations/:allocationId/reverse
```

---

## 15.4. OwnPaymentsController

Ruta base:

```text id="5cqrri"
/api/v1/me
```

Endpoints:

```text id="1fcr7i"
GET    /payments
POST   /payments
GET    /payments/:paymentId
POST   /payments/:paymentId/receipts
GET    /payment-receipts/:receiptId/download
```

---

# 16. DTOs principales

## 16.1. CreatePaymentDto

Campos:

```text id="r44js0"
propertyUnitId
method
amount
currency
paidAt
transactionReference
externalReference
notes
```

Validaciones:

* unidad requerida;
* método requerido;
* monto Decimal positivo;
* currency USD;
* fecha válida;
* referencia requerida para transferencia/depósito según política;
* no aceptar `tenantId`.

---

## 16.2. ReportOwnPaymentDto

Campos:

```text id="r5e3h9"
propertyUnitId
method
amount
currency
paidAt
transactionReference
notes
receipt metadata opcional
```

Validaciones:

* unidad propia;
* monto Decimal positivo;
* comprobante o referencia si aplica;
* status inicial `pendingValidation`.

---

## 16.3. ConfirmPaymentDto

Campos:

```text id="2ypdo9"
notes
```

Validaciones:

* pago confirmable;
* comprobante requerido si método lo exige;
* actor con permiso.

---

## 16.4. RejectPaymentDto

Campos:

```text id="3v30kr"
reason
```

Validaciones:

* motivo requerido;
* longitud máxima;
* pago rechazable.

---

## 16.5. AllocatePaymentDto

Campos:

```text id="x6547x"
allocations: [
  {
    chargeId
    amount
  }
]
```

Validaciones:

* pago confirmado;
* cargos del mismo tenant;
* cargos de la misma unidad;
* monto asignado positivo;
* suma no excede monto disponible;
* asignación no excede saldo del cargo.

---

## 16.6. AutoAllocatePaymentDto

Campos:

```text id="h0868d"
strategy
```

MVP:

```text id="aedzrj"
strategy = oldestDueDateFirst
```

---

## 16.7. ReversePaymentDto

Campos:

```text id="53cmbd"
reason
```

Validaciones:

* motivo requerido;
* pago reversible;
* no reversado previamente.

---

## 16.8. UploadPaymentReceiptDto

Campos:

```text id="pdbnql"
file
receiptNumber
transactionReference
notes
```

Validaciones:

* pago del tenant;
* archivo permitido;
* tamaño permitido;
* metadata sanitizada.

---

## 16.9. RejectPaymentReceiptDto

Campos:

```text id="88zdxh"
reason
```

Validaciones:

* motivo requerido;
* receipt revisable.

---

## 16.10. ReversePaymentAllocationDto

Campos:

```text id="wl73ms"
reason
```

Validaciones:

* motivo requerido;
* allocation activa;
* actor autorizado.

---

# 17. Autenticación y autorización

## 17.1. Endpoints administrativos

Todos los endpoints `/api/v1/tenant/*` requieren:

```text id="xg8b6v"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 17.2. Endpoints propios

Todos los endpoints `/api/v1/me/*` requieren:

```text id="erp55z"
AuthGuard
TenantGuard
TenantPermissionGuard o PolicyGuard
OwnPaymentPolicyService
```

---

## 17.3. Permisos administrativos

```text id="1p9bqd"
payments.create
payments.read
payments.confirm
payments.reject
payments.allocate
payments.reverse
paymentReceipts.create
paymentReceipts.read
paymentReceipts.review
paymentReceipts.reject
paymentReceipts.download
payments.audit.read
```

---

## 17.4. Permisos propios

```text id="z9etwf"
payments.create.own
payments.read.own
payments.receipts.upload.own
paymentReceipts.download.own
```

---

## 17.5. Separación de funciones

No asumir que un permiso incluye otro.

Ejemplos:

```text id="7oywmo"
payments.read ≠ payments.confirm
payments.confirm ≠ payments.reverse
payments.create.own ≠ payments.confirm
paymentReceipts.download ≠ paymentReceipts.review
```

---

# 18. Auditoría

## 18.1. Puerto

Crear:

```text id="0wud88"
PaymentsAuditPort
```

Responsabilidad:

* registrar creación de pagos;
* registrar reportes propios;
* registrar confirmaciones;
* registrar rechazos;
* registrar asignaciones;
* registrar autoasignaciones;
* registrar reversos;
* registrar carga y revisión de comprobantes;
* registrar descargas de comprobantes si política lo requiere.

---

## 18.2. Eventos auditables

```text id="o0e3fi"
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

## 18.3. Campos mínimos

```text id="j7c8rv"
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

## 18.4. Campos financieros recomendados

```text id="c31dzk"
paymentId
propertyUnitId
chargeId
allocationId
receiptId
amount
currency
method
reason
```

---

## 18.5. Datos prohibidos en auditoría

No registrar:

```text id="aaeybh"
contenido de archivos
tokens
headers de autenticación
payload completo
datos bancarios completos
datos personales innecesarios
stack traces
```

---

# 19. Eventos de dominio

Eventos mínimos:

```text id="97a2u7"
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

Implementación inicial:

* eventos internos;
* sin broker externo obligatorio;
* compatible con outbox futuro.

Reglas:

* incluir tenantId;
* incluir actorUserId si aplica;
* incluir traceId;
* no incluir comprobantes ni payload completo;
* no incluir datos personales innecesarios.

---

# 20. Observabilidad

## 20.1. Logs

Registrar:

```text id="yu5yj9"
payment created
payment reported
payment confirmed
payment rejected
payment allocated
payment auto allocated
payment reversed
payment receipt uploaded
payment receipt accepted
payment receipt rejected
own payment access denied
cross-tenant payment access attempt
```

No registrar:

```text id="h4tkvb"
Authorization header
access token
payload completo
contenido de comprobante
datos bancarios completos
datos personales de propietarios/residentes
stack trace en producción
```

---

## 20.2. Métricas sugeridas

```text id="w9x6ft"
payments_created_total
payments_reported_total
payments_confirmed_total
payments_rejected_total
payments_reversed_total
payment_allocations_created_total
payment_allocations_reversed_total
payment_receipts_uploaded_total
payment_receipts_rejected_total
payment_authorization_denied_total
own_payment_access_denied_total
payment_duplicate_attempts_total
```

---

## 20.3. Trace

Todo flujo financiero crítico debe incluir:

```text id="udxm29"
traceId
```

Especialmente:

* creación de pago;
* confirmación;
* rechazo;
* asignación;
* autoasignación;
* reverso;
* descarga de comprobante.

---

# 21. Seguridad

Controles obligatorios:

* `tenantId` obligatorio;
* tenant activo;
* membership activa;
* permiso financiero específico;
* validación de unidad del tenant;
* validación de cargo del tenant;
* validación de unidad propia para `.own`;
* Decimal;
* idempotencia;
* no eliminación física;
* comprobantes privados;
* descarga autorizada;
* auditoría financiera;
* logs sanitizados;
* tests financieros;
* tests multitenant;
* tests de autorización.

Riesgos críticos:

| Riesgo                               | Mitigación                         |
| ------------------------------------ | ---------------------------------- |
| Pago a unidad de otro tenant         | tenant validation                  |
| Pago asignado a cargo de otro tenant | charge validation                  |
| Pago asignado a cargo de otra unidad | unit consistency rule              |
| Pago duplicado                       | idempotency key + reference checks |
| Asignar más de lo pagado             | allocation service                 |
| Asignar más del saldo del cargo      | charge reader + outstanding amount |
| Confirmar sin permiso                | permissions                        |
| Reversar sin permiso                 | permissions + audit                |
| Exponer comprobante                  | private storage + signed URL       |
| Usuario ve pago ajeno                | OwnPaymentPolicyService            |
| Borrar pago                          | no DELETE + Restrict               |

---

# 22. Migración

## 22.1. Nombre sugerido

```text id="chf4dg"
005_create_payments
```

---

## 22.2. Tablas

```text id="uagh87"
payments
payment_receipts
payment_allocations
payment_reversals
```

Tabla diferida:

```text id="xo5giw"
payment_methods
```

---

## 22.3. Enums

```text id="znyvrm"
PaymentStatus
PaymentMethodType
PaymentReceiptStatus
PaymentAllocationStatus
PaymentReversalStatus
CurrencyCode reutilizado de 004 si aplica
```

---

## 22.4. Reglas de migración

* `tenant_id` obligatorio;
* `property_unit_id` obligatorio en `payments`;
* montos `Decimal`;
* `currency` requerido;
* idempotency key unique por tenant si existe;
* payment reversal unique por payment;
* `onDelete: Restrict`;
* no cascade delete peligroso;
* índices financieros;
* revisión manual de SQL;
* no crear pagos reales en seeds.

---

# 23. Seeds

Seeds sugeridos:

```text id="6ey0u2"
payment method enum fixtures
payment confirmed demo
payment pendingValidation demo
payment rejected demo
payment allocation demo opcional
payment receipt metadata demo opcional
```

Reusar:

```text id="jaxz4j"
tenant demo
property units demo
charges demo de 004
users demo de 002
own relationships de 003
```

No usar:

```text id="67xw72"
pagos reales
comprobantes reales
referencias bancarias reales
datos bancarios
nombres reales
archivos personales
```

Usar:

```text id="j5mvo4"
USD
50.00
100.00
DEMO-TRANSFER-001
example files simulados
```

---

# 24. Testing plan resumido

El documento completo será:

```text id="042qx7"
docs/specs/005-payments/test-plan.md
```

## 24.1. Unit tests

* Money;
* PaymentStatus;
* PaymentMethodType;
* Payment entity;
* PaymentReceipt entity;
* PaymentAllocation entity;
* PaymentReversal entity;
* allocation amount;
* idempotency key.

---

## 24.2. Integration tests

* crear pago;
* reportar pago propio;
* subir comprobante;
* confirmar pago;
* rechazar pago;
* asignar pago;
* autoasignar pago;
* reversar pago;
* reversar allocation;
* constraints;
* idempotencia;
* storage port fake.

---

## 24.3. API tests

* Payments API;
* Payment Receipts API;
* Payment Allocations API;
* Own Payments API.

---

## 24.4. Authorization tests

* sin token;
* sin permiso;
* sin membership;
* tenant suspendido;
* usuario disabled;
* auditor solo lectura;
* propietario sin `.own`;
* usuario sin relación con unidad.

---

## 24.5. Multitenancy tests

* Tenant A no ve pagos B;
* Tenant A no usa unidad B;
* Tenant A no asigna pago a cargo B;
* Tenant A no descarga comprobante B;
* `.own` no devuelve pagos ajenos.

---

## 24.6. Financial regression tests

* pago parcial;
* múltiples pagos a un cargo;
* un pago a múltiples cargos;
* excedente conservado;
* asignación no excede pago;
* asignación no excede cargo;
* reverso deshace asignaciones;
* cargos afectados recalculan estado;
* Decimal exacto.

---

# 25. Orden recomendado de desarrollo

## Fase 1 — Documentación

```text id="rckb6s"
1. spec.md
2. plan.md
3. data-model.md
4. api-contract.md
5. test-plan.md
6. tasks.md
7. security-notes.md
```

---

## Fase 2 — Base técnica

```text id="sid89i"
1. Crear módulo payments.
2. Crear controladores base.
3. Crear value objects.
4. Crear entidades.
5. Crear errores.
6. Crear eventos.
7. Crear DTOs.
```

---

## Fase 3 — Persistencia

```text id="54lgux"
1. Crear modelos Prisma.
2. Crear migración.
3. Crear constraints.
4. Crear repositorios.
5. Crear mappers.
6. Crear seeds demo.
7. Crear migration tests.
```

---

## Fase 4 — Puertos e integración interna

```text id="pq6q4r"
1. PropertyUnitReaderPort.
2. OwnResourceReaderPort.
3. ChargeReaderPort.
4. ChargePaymentWriterPort.
5. PrivateFileStoragePort.
6. PaymentsAuditPort.
7. PaymentsEventsPort.
```

---

## Fase 5 — Servicios y policies

```text id="qfjzcp"
1. MoneyService.
2. PaymentPolicyService.
3. PaymentValidationService.
4. PaymentAllocationService.
5. PaymentAutoAllocationService.
6. PaymentReversalService.
7. PaymentIdempotencyService.
8. PaymentEffectiveAmountService.
9. PaymentReceiptPolicyService.
10. PaymentReceiptSecurityService.
11. OwnPaymentPolicyService.
```

---

## Fase 6 — Casos de uso

```text id="g3k5dh"
1. Creación de pagos administrativos.
2. Reporte de pagos propios.
3. Comprobantes.
4. Confirmación/rechazo.
5. Asignación manual.
6. Autoasignación.
7. Reverso de pago.
8. Reverso de allocation.
9. Consulta administrativa.
10. Consulta propia.
```

---

## Fase 7 — API y autorización

```text id="la07td"
1. PaymentsController.
2. PaymentReceiptsController.
3. PaymentAllocationsController.
4. OwnPaymentsController.
5. Guards.
6. OpenAPI.
```

---

## Fase 8 — Auditoría, eventos y pruebas

```text id="owqg6u"
1. AuditPort.
2. EventsPort.
3. Logs.
4. Métricas.
5. Unit tests.
6. Integration tests.
7. API tests.
8. Authorization tests.
9. Multitenancy tests.
10. Financial regression tests.
11. Security tests.
```

---

# 26. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* módulo NestJS creado;
* modelos Prisma creados;
* migración aplicada;
* `tenantId` obligatorio;
* dinero modelado con Decimal;
* pagos administrativos funcionan;
* pagos propios funcionan;
* comprobantes se registran;
* comprobantes se almacenan de forma privada;
* confirmación funciona;
* rechazo con motivo funciona;
* asignación a cargos funciona;
* autoasignación funciona;
* pagos parciales funcionan;
* pagos excedentes conservan `unallocatedAmount`;
* reversos de pago funcionan;
* reversos de allocations funcionan;
* cargos afectados se recalculan;
* no existe acceso cross-tenant;
* no se elimina ningún pago;
* monto original del pago no se sobrescribe;
* auditoría financiera funciona;
* eventos se emiten;
* OpenAPI actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas de autorización pasan;
* pruebas multitenant pasan;
* pruebas financieras pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

# 27. Comandos esperados

Comandos generales:

```bash id="b32nrm"
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

```bash id="5lk0vg"
npm run test:payments
npm run test:payments:unit
npm run test:payments:integration
npm run test:payments:api
npm run test:payments:authorization
npm run test:payments:multitenancy
npm run test:payments:financial
npm run test:payments:security
```

---

# 28. Riesgos de implementación

| Riesgo                                    | Impacto | Mitigación                         |
| ----------------------------------------- | ------- | ---------------------------------- |
| Pago a unidad de otro tenant              | Crítico | tenant validation + MT tests       |
| Pago asignado a cargo de otro tenant      | Crítico | ChargeReaderPort + MT tests        |
| Pago asignado a cargo de otra unidad      | Alto    | unit consistency policy            |
| Duplicar pagos                            | Alto    | idempotency key + reference checks |
| Asignar más de lo pagado                  | Crítico | PaymentAllocationService           |
| Asignar más del saldo de cargo            | Crítico | ChargeReaderPort                   |
| Usar float                                | Alto    | Money VO + Decimal                 |
| Exponer comprobantes                      | Alto    | private storage + authorization    |
| Confirmar sin permiso                     | Crítico | TenantPermissionGuard              |
| Reversar sin permiso                      | Crítico | permissions + audit                |
| Eliminar pago                             | Crítico | no DELETE + Restrict               |
| Falta de auditoría                        | Crítico | PaymentsAuditPort                  |
| Estado de cargo inconsistente             | Alto    | ChargePaymentWriterPort + tests    |
| Implementar conciliación fuera de alcance | Medio   | SDD review                         |

---

# 29. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="jr32zo"
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
docs/specs/004-dues-fees/spec.md
docs/specs/005-payments/spec.md
docs/specs/005-payments/plan.md
```

El agente no debe:

* crear pagos sin tenant;
* crear pagos sin unidad;
* crear pagos con float;
* asignar pagos a cargos de otro tenant;
* asignar pagos a cargos de otra unidad en MVP;
* asignar más de lo pagado;
* asignar más del saldo pendiente;
* eliminar pagos físicamente;
* sobrescribir monto original del pago;
* exponer comprobantes públicamente;
* omitir auditoría financiera;
* implementar conciliación bancaria;
* implementar pasarela de pagos;
* implementar facturación electrónica;
* implementar estados de cuenta consolidados;
* omitir pruebas financieras.

---

# 30. Estrategia de entrega

## Incremento 1 — Base de pagos

* Payment.
* PaymentStatus.
* PaymentMethodType.
* CreatePaymentUseCase.
* List/Get payments.
* Prisma migration.

---

## Incremento 2 — Pagos propios y comprobantes

* ReportOwnPaymentUseCase.
* PaymentReceipt.
* PrivateFileStoragePort.
* Upload/download controlado.
* OwnPaymentPolicyService.

---

## Incremento 3 — Validación administrativa

* ConfirmPaymentUseCase.
* RejectPaymentUseCase.
* Receipt review.
* Auditoría y eventos.

---

## Incremento 4 — Asignación de pagos

* PaymentAllocation.
* AllocatePaymentUseCase.
* AutoAllocatePaymentUseCase.
* Actualización de estados de cargos.

---

## Incremento 5 — Reversos y hardening

* PaymentReversal.
* ReversePaymentUseCase.
* ReversePaymentAllocationUseCase.
* Tests financieros.
* Tests de seguridad.
* OpenAPI final.

---

# 31. Pendientes para documentos derivados

## 31.1. `data-model.md`

Debe detallar:

* tablas;
* columnas;
* enums;
* constraints;
* índices;
* Prisma completo;
* idempotency keys;
* money precision;
* storage metadata;
* seeds;
* reglas de migración.

---

## 31.2. `api-contract.md`

Debe detallar:

* endpoints;
* permisos;
* requests;
* responses;
* errores;
* comprobantes;
* asignaciones;
* reversos;
* endpoints propios;
* filtros;
* paginación.

---

## 31.3. `test-plan.md`

Debe detallar:

* unit tests;
* integration tests;
* API tests;
* authorization tests;
* multitenancy tests;
* financial regression tests;
* idempotency tests;
* receipt security tests;
* storage tests.

---

## 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 31.5. `security-notes.md`

Debe detallar:

* riesgos financieros;
* protección de comprobantes;
* idempotencia;
* no eliminación física;
* precisión monetaria;
* cross-tenant;
* auditoría reforzada;
* acceso propio;
* logs;
* storage privado.

---

# 32. Decisión final de implementación

El módulo `005-payments` se implementará como módulo interno de NestJS dentro del monolito modular.

Usará PostgreSQL y Prisma.

Todo pago tendrá `tenantId`.

Todo pago estará asociado a `PropertyUnit`.

Todo monto se almacenará como Decimal.

Los pagos reportados por propietarios o residentes iniciarán en `pendingValidation`.

Los pagos administrativos podrán crearse como `confirmed` según permiso y política.

La asignación de pagos se hará contra cargos de `004-dues-fees`.

En MVP, un pago solo podrá asignarse a cargos de la misma unidad.

Los comprobantes se almacenarán de forma privada.

Los pagos no se eliminarán físicamente.

El monto original del pago no se sobrescribirá.

La corrección de pagos se hará mediante:

```text id="ed5n92"
rechazo
reverso
reverso de asignación
nuevo pago correctivo si aplica
```

La prioridad técnica será:

```text id="zn1u41"
precisión monetaria
trazabilidad financiera
protección de comprobantes
asignación correcta a cargos
auditoría
multitenancy
seguridad
compatibilidad con estados de cuenta
compatibilidad con conciliación bancaria futura
```

Este módulo debe completarse antes de implementar `006-account-statements`, porque los estados de cuenta dependen de pagos correctos, confirmados, asignados, no duplicados y auditables.
