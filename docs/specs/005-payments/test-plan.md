# Test Plan — Spec 005 Payments, Receipts and Payment Allocation

## 1. Información del documento

| Campo                    | Valor                                                                         |
| ------------------------ | ----------------------------------------------------------------------------- |
| Proyecto                 | RESIDENT Core                                                                 |
| Spec ID                  | 005                                                                           |
| Módulo                   | Payments                                                                      |
| Documento                | Test Plan                                                                     |
| Ruta                     | `docs/specs/005-payments/test-plan.md`                                        |
| Versión                  | 0.1                                                                           |
| Estado                   | needs-review                                                                  |
| Fecha                    | 2026-07-14                                                                    |
| Documento base           | `docs/specs/005-payments/spec.md`                                             |
| Plan técnico             | `docs/specs/005-payments/plan.md`                                             |
| Modelo de datos          | `docs/specs/005-payments/data-model.md`                                       |
| Contrato API             | `docs/specs/005-payments/api-contract.md`                                     |
| Depende de               | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees` |
| Framework sugerido       | Jest + Supertest                                                              |
| Base de datos de pruebas | PostgreSQL test database                                                      |
| Storage de pruebas       | Fake private storage / MinIO local                                            |
| Prioridad                | Alta                                                                          |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `005-payments`.

El objetivo es validar que RESIDENT Core gestione correctamente:

* pagos administrativos;
* pagos reportados por propietarios o residentes;
* comprobantes;
* carga y descarga de comprobantes;
* confirmación de pagos;
* rechazo de pagos;
* asignación de pagos a cargos;
* autoasignación de pagos;
* pagos parciales;
* pagos excedentes;
* reversos de pagos;
* reversos de asignaciones;
* precisión monetaria;
* idempotencia;
* seguridad de archivos;
* acceso propio;
* autorización financiera;
* aislamiento multitenant;
* auditoría financiera;
* eventos de dominio;
* observabilidad;
* compatibilidad futura con estados de cuenta y conciliación bancaria.

Regla central:

```text id="nz26ug"
Ningún pago debe aceptarse, confirmarse, asignarse, reversarse o exponerse si rompe multitenancy, autorización, precisión monetaria, idempotencia, trazabilidad, seguridad de comprobantes o acceso propio.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este plan cubre:

* unit tests;
* domain tests;
* application tests;
* repository integration tests;
* migration tests;
* seed tests;
* API tests;
* authorization tests;
* own access tests;
* multitenancy tests;
* money precision tests;
* idempotency tests;
* allocation consistency tests;
* file receipt security tests;
* storage adapter tests;
* concurrency tests;
* financial regression tests;
* audit tests;
* event tests;
* observability tests;
* OpenAPI tests;
* smoke tests.

---

### 3.2. No incluido

No cubre todavía:

* conciliación bancaria automática;
* importación de movimientos bancarios;
* pasarela de pagos en línea;
* pagos con tarjeta;
* tokenización;
* facturación electrónica;
* asientos contables;
* cierre contable;
* OCR de comprobantes;
* validación automática de comprobantes con IA;
* aprobación dual avanzada;
* notificaciones automáticas;
* cobranza automatizada;
* carga masiva de pagos;
* integración bancaria directa.

Estos temas serán cubiertos en specs posteriores.

---

## 4. Estrategia general

El módulo se probará por capas:

```text id="qw8bd9"
Unit tests
Domain tests
Application tests
Repository integration tests
Migration tests
API tests
Authorization tests
Own access tests
Multitenancy tests
Money precision tests
Idempotency tests
Allocation consistency tests
Receipt file security tests
Storage tests
Concurrency tests
Financial regression tests
Audit tests
Event tests
Observability tests
OpenAPI tests
Smoke tests
```

Reglas obligatorias:

```text id="iorjlu"
1. Todo endpoint privado debe tener prueba 401 sin token.
2. Todo endpoint financiero debe tener prueba 403 sin permiso.
3. Todo endpoint tenant-scoped debe tener prueba cross-tenant negativa.
4. Todo endpoint .own debe probar recurso propio y recurso ajeno.
5. Todo pago debe probar precisión Decimal.
6. Todo pago debe probar no eliminación física.
7. Todo pago debe probar que amount no se sobrescribe.
8. Toda asignación debe probar que no excede el pago.
9. Toda asignación debe probar que no excede el cargo.
10. Todo comprobante debe probar acceso privado.
11. Toda operación crítica debe generar auditoría.
12. Ninguna prueba debe usar datos reales.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* se crean pagos administrativos;
* se reportan pagos propios;
* se impide reportar pagos de unidades ajenas;
* se impide crear pagos para unidades de otro tenant;
* se confirman pagos válidos;
* se rechazan pagos con motivo;
* se impide rechazar pagos sin motivo;
* se asignan pagos confirmados a cargos;
* se impide asignar pagos pendientes, rechazados, cancelados o reversados;
* se impide asignar más del monto disponible;
* se impide asignar más del saldo pendiente del cargo;
* se impide asignar pagos a cargos de otro tenant;
* se impide asignar pagos a cargos de otra unidad en MVP;
* se permite pago parcial;
* se permite un pago a múltiples cargos;
* se permite múltiples pagos sobre un cargo;
* se conserva `unallocatedAmount`;
* se reversa un pago sin eliminarlo;
* se reversan asignaciones activas al reversar pago;
* se reversa una asignación individual;
* se recalcula el estado del pago;
* se recalcula el estado del cargo mediante puerto hacia `004-dues-fees`;
* se protegen comprobantes;
* se bloquean archivos inválidos;
* se bloquea descarga de comprobantes ajenos;
* no hay acceso cross-tenant;
* no se usa float;
* los montos se serializan como string decimal;
* los eventos se emiten;
* la auditoría se registra;
* OpenAPI coincide con `api-contract.md`;
* CI ejecuta pruebas críticas.

---

## 6. Datos de prueba base

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="mzmz4c"
tenantActiveA: villa-club-demo
tenantActiveB: altos-del-norte-demo
tenantSuspended: tenant-suspendido-demo
tenantArchived: tenant-archivado-demo
```

---

### 6.2. Usuarios y membresías

Reusar fixtures de `002-users-roles`:

```text id="cqhjvp"
platformAdmin
tenantAdminA
tenantAdminB
treasurerA
treasurerB
boardMemberA
tenantAuditorA
propertyOwnerUserA
residentUserA
residentUserB
userWithoutMembership
userWithoutPermission
disabledUser
anonymousUser
```

---

### 6.3. Unidades y relaciones propias

Reusar fixtures de `003-residents-properties`:

```text id="r66kga"
unitA1: Casa 01, tenantActiveA, active
unitA2: Casa 02, tenantActiveA, active
unitA3: Casa 03, tenantActiveA, active
unitB1: A-101, tenantActiveB, active
archivedUnitA
inactiveUnitA
blockedUnitA
```

Relaciones:

```text id="rwbigb"
propertyOwnerUserA linked to personOwnerA
personOwnerA owns unitA1
residentUserA linked to personResidentA
personResidentA resides in unitA1
residentUserB linked to personResidentB
personResidentB resides in unitB1
```

---

### 6.4. Cargos de prueba

Reusar fixtures de `004-dues-fees`:

```text id="ioex9d"
chargeA1MonthlyDues: unitA1, issued, effectiveAmount 50.00
chargeA1ReserveFund: unitA1, issued, effectiveAmount 10.00
chargeA2MonthlyDues: unitA2, issued, effectiveAmount 50.00
chargeB1MonthlyDues: unitB1, issued, effectiveAmount 50.00
chargeA1Paid: unitA1, paid, effectiveAmount 50.00
chargeA1Cancelled: unitA1, cancelled, effectiveAmount 0.00
chargeA1Reversed: unitA1, reversed, effectiveAmount 0.00
```

---

### 6.5. Pagos de prueba

Fixtures requeridos:

```text id="krzv2z"
paymentConfirmedA1
paymentPendingValidationA1
paymentRejectedA1
paymentAllocatedA1
paymentPartiallyAllocatedA1
paymentReversedA1
paymentConfirmedA2
paymentConfirmedB1
```

---

### 6.6. Comprobantes de prueba

Fixtures requeridos:

```text id="n3xusv"
receiptUploadedA1
receiptAcceptedA1
receiptRejectedA1
receiptWithoutFileButWithReferenceA1
receiptWithPrivateFileA1
receiptB1
```

---

### 6.7. Asignaciones de prueba

Fixtures requeridos:

```text id="qxvmqi"
allocationActiveA1
allocationPartialA1
allocationReversedA1
allocationB1
```

---

### 6.8. Datos prohibidos

No usar:

```text id="g9uo2b"
pagos reales
comprobantes reales
referencias bancarias reales
números de cuenta bancaria
capturas de transferencias reales
nombres reales de propietarios
nombres reales de residentes
datos tributarios reales
archivos personales
```

Usar:

```text id="yvt9ct"
USD
50.00
100.00
DEMO-TRANSFER-001
demo-receipt-001.pdf
example.com
tenants demo
unidades demo
cargos demo
```

---

## 7. Factories recomendadas

Crear factories:

```text id="d896l5"
createPayment()
createConfirmedPayment()
createPendingValidationPayment()
createRejectedPayment()
createAllocatedPayment()
createPartiallyAllocatedPayment()
createReversedPayment()
createPaymentReceipt()
createAcceptedPaymentReceipt()
createRejectedPaymentReceipt()
createPaymentAllocation()
createReversedPaymentAllocation()
createPaymentReversal()
createPaymentActorContext()
createOwnPaymentContext()
createReceiptFileMetadata()
createStorageFake()
```

Ejemplos:

```text id="s4brp8"
createPayment({
  tenantId: tenantActiveA.id,
  propertyUnitId: unitA1.id,
  method: "bankTransfer",
  amount: "100.00",
  currency: "USD",
  transactionReference: "DEMO-TRANSFER-001",
  status: "confirmed"
})
```

```text id="ax80sb"
createPaymentAllocation({
  tenantId: tenantActiveA.id,
  paymentId: paymentConfirmedA1.id,
  chargeId: chargeA1MonthlyDues.id,
  propertyUnitId: unitA1.id,
  amount: "50.00",
  currency: "USD"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. Money

Archivo sugerido:

```text id="js2gag"
money.vo.spec.ts
```

| ID               | Caso                         | Resultado esperado       |
| ---------------- | ---------------------------- | ------------------------ |
| UT-PAY-MONEY-001 | Crear Money con `100.00 USD` | válido                   |
| UT-PAY-MONEY-002 | Monto `0.00` para pago       | inválido                 |
| UT-PAY-MONEY-003 | Monto negativo               | inválido                 |
| UT-PAY-MONEY-004 | Más de dos decimales         | error                    |
| UT-PAY-MONEY-005 | Moneda distinta de USD       | `CURRENCY_NOT_SUPPORTED` |
| UT-PAY-MONEY-006 | Suma `0.10 + 0.20`           | `0.30`                   |
| UT-PAY-MONEY-007 | Resta `100.00 - 50.00`       | `50.00`                  |
| UT-PAY-MONEY-008 | Serialización API            | string decimal           |

---

## 8.2. PaymentStatus

Archivo sugerido:

```text id="jmv9gi"
payment-status.vo.spec.ts
```

| ID             | Caso                                | Resultado esperado  |
| -------------- | ----------------------------------- | ------------------- |
| UT-PSTATUS-001 | `pendingValidation` es confirmable  | true                |
| UT-PSTATUS-002 | `pendingValidation` es rechazable   | true                |
| UT-PSTATUS-003 | `confirmed` es allocatable          | true                |
| UT-PSTATUS-004 | `partiallyAllocated` es allocatable | true                |
| UT-PSTATUS-005 | `rejected` no es allocatable        | false               |
| UT-PSTATUS-006 | `reversed` no es allocatable        | false               |
| UT-PSTATUS-007 | `allocated` puede reversarse        | true según política |
| UT-PSTATUS-008 | estado inválido                     | error               |

---

## 8.3. PaymentMethodType

Archivo sugerido:

```text id="ndbuq5"
payment-method-type.vo.spec.ts
```

| ID             | Caso                                           | Resultado esperado  |
| -------------- | ---------------------------------------------- | ------------------- |
| UT-PMETHOD-001 | `cash`                                         | válido              |
| UT-PMETHOD-002 | `bankTransfer`                                 | válido              |
| UT-PMETHOD-003 | `deposit`                                      | válido              |
| UT-PMETHOD-004 | `other`                                        | válido              |
| UT-PMETHOD-005 | `online` reservado                             | no operativo en MVP |
| UT-PMETHOD-006 | valor inválido                                 | error               |
| UT-PMETHOD-007 | bankTransfer requiere referencia o comprobante | true                |

---

## 8.4. PaymentReference

Archivo sugerido:

```text id="kq5azi"
payment-reference.vo.spec.ts
```

| ID          | Caso                                 | Resultado esperado   |
| ----------- | ------------------------------------ | -------------------- |
| UT-PREF-001 | Referencia válida                    | válido               |
| UT-PREF-002 | Referencia con espacios              | trim                 |
| UT-PREF-003 | Referencia vacía                     | error si requerida   |
| UT-PREF-004 | Referencia demasiado larga           | error                |
| UT-PREF-005 | Referencia con caracteres peligrosos | sanitización/rechazo |

---

## 8.5. PaymentIdempotencyKey

Archivo sugerido:

```text id="d8kh2y"
payment-idempotency-key.vo.spec.ts
```

| ID            | Caso                                      | Resultado esperado |
| ------------- | ----------------------------------------- | ------------------ |
| UT-PIDEMP-001 | Header key válida                         | válido             |
| UT-PIDEMP-002 | Misma entrada genera misma key            | determinístico     |
| UT-PIDEMP-003 | Payload distinto con misma key            | conflicto          |
| UT-PIDEMP-004 | Key vacía                                 | error              |
| UT-PIDEMP-005 | Key derivada por referencia               | válida             |
| UT-PIDEMP-006 | Tenant distinto permite misma key externa | válido             |

---

## 8.6. PaymentReceiptFile

Archivo sugerido:

```text id="ezxy43"
payment-receipt-file.vo.spec.ts
```

| ID           | Caso                      | Resultado esperado   |
| ------------ | ------------------------- | -------------------- |
| UT-RFILE-001 | PDF válido                | válido               |
| UT-RFILE-002 | JPG válido                | válido               |
| UT-RFILE-003 | PNG válido                | válido               |
| UT-RFILE-004 | archivo `.exe`            | rechazado            |
| UT-RFILE-005 | MIME no permitido         | rechazado            |
| UT-RFILE-006 | archivo mayor a 5 MB      | `FILE_TOO_LARGE`     |
| UT-RFILE-007 | nombre con path traversal | sanitizado/rechazado |
| UT-RFILE-008 | fileName vacío            | error si hay archivo |

---

## 8.7. AllocationAmount

Archivo sugerido:

```text id="p0pcg3"
allocation-amount.vo.spec.ts
```

| ID               | Caso                   | Resultado esperado |
| ---------------- | ---------------------- | ------------------ |
| UT-ALLOC-AMT-001 | `50.00` válido         | válido             |
| UT-ALLOC-AMT-002 | `0.00` inválido        | error              |
| UT-ALLOC-AMT-003 | negativo inválido      | error              |
| UT-ALLOC-AMT-004 | excede pago disponible | error              |
| UT-ALLOC-AMT-005 | excede saldo de cargo  | error              |

---

## 8.8. PaymentReversalReason

Archivo sugerido:

```text id="goj7kl"
payment-reversal-reason.vo.spec.ts
```

| ID                 | Caso                   | Resultado esperado   |
| ------------------ | ---------------------- | -------------------- |
| UT-PREV-REASON-001 | Motivo válido          | válido               |
| UT-PREV-REASON-002 | Motivo vacío           | error                |
| UT-PREV-REASON-003 | Motivo demasiado largo | error                |
| UT-PREV-REASON-004 | Payload sospechoso     | sanitización/rechazo |

---

# 9. Pruebas unitarias de entidades

## 9.1. Payment entity

Archivo sugerido:

```text id="w55j86"
payment.entity.spec.ts
```

| ID         | Caso                                  | Resultado esperado |
| ---------- | ------------------------------------- | ------------------ |
| UT-PAY-001 | Crear pago confirmado válido          | válido             |
| UT-PAY-002 | Crear pago pendingValidation válido   | válido             |
| UT-PAY-003 | Crear con amount negativo             | error              |
| UT-PAY-004 | Inicializa allocatedAmount 0          | pasa               |
| UT-PAY-005 | Inicializa unallocatedAmount = amount | pasa               |
| UT-PAY-006 | Confirmar pago pendingValidation      | status confirmed   |
| UT-PAY-007 | Rechazar pago con motivo              | status rejected    |
| UT-PAY-008 | Rechazar sin motivo                   | error              |
| UT-PAY-009 | Marcar partiallyAllocated             | status correcto    |
| UT-PAY-010 | Marcar allocated                      | status correcto    |
| UT-PAY-011 | Reversar pago                         | status reversed    |
| UT-PAY-012 | amount original no cambia             | pasa               |

---

## 9.2. PaymentReceipt entity

Archivo sugerido:

```text id="xqzs6a"
payment-receipt.entity.spec.ts
```

| ID         | Caso                                   | Resultado esperado |
| ---------- | -------------------------------------- | ------------------ |
| UT-REC-001 | Crear receipt con fileId               | válido             |
| UT-REC-002 | Crear receipt con transactionReference | válido             |
| UT-REC-003 | Crear receipt sin evidencia            | error              |
| UT-REC-004 | Aceptar receipt                        | status accepted    |
| UT-REC-005 | Rechazar con motivo                    | status rejected    |
| UT-REC-006 | Rechazar sin motivo                    | error              |
| UT-REC-007 | Archivar receipt                       | status archived    |
| UT-REC-008 | No contiene URL pública permanente     | pasa               |

---

## 9.3. PaymentAllocation entity

Archivo sugerido:

```text id="as0bjg"
payment-allocation.entity.spec.ts
```

| ID            | Caso                            | Resultado esperado |
| ------------- | ------------------------------- | ------------------ |
| UT-PALLOC-001 | Crear allocation válida         | válido             |
| UT-PALLOC-002 | Amount negativo                 | error              |
| UT-PALLOC-003 | Amount cero                     | error              |
| UT-PALLOC-004 | Reversar allocation activa      | status reversed    |
| UT-PALLOC-005 | Reversar allocation ya reversed | error              |
| UT-PALLOC-006 | Reversar sin motivo             | error              |
| UT-PALLOC-007 | No elimina allocation           | pasa               |

---

## 9.4. PaymentReversal entity

Archivo sugerido:

```text id="r1xfy5"
payment-reversal.entity.spec.ts
```

| ID          | Caso                       | Resultado esperado             |
| ----------- | -------------------------- | ------------------------------ |
| UT-PREV-001 | Crear reverso válido       | válido                         |
| UT-PREV-002 | reason vacío               | error                          |
| UT-PREV-003 | reversedBy requerido       | error                          |
| UT-PREV-004 | traceId opcional           | válido                         |
| UT-PREV-005 | Un reverso por pago en MVP | enforced por policy/repository |

---

# 10. Pruebas de servicios y policies

## 10.1. PaymentPolicyService

| ID          | Caso                                                | Resultado esperado       |
| ----------- | --------------------------------------------------- | ------------------------ |
| SRV-POL-001 | pendingValidation puede confirmarse                 | permitido                |
| SRV-POL-002 | confirmed no puede rechazarse sin política especial | rechazado                |
| SRV-POL-003 | rejected no puede asignarse                         | rechazado                |
| SRV-POL-004 | reversed no puede asignarse                         | rechazado                |
| SRV-POL-005 | confirmed puede asignarse                           | permitido                |
| SRV-POL-006 | partiallyAllocated puede asignarse                  | permitido                |
| SRV-POL-007 | allocated puede reversarse                          | permitido según política |
| SRV-POL-008 | payment reversed no puede reversarse otra vez       | rechazado                |

---

## 10.2. PaymentValidationService

| ID          | Caso                                                 | Resultado esperado |
| ----------- | ---------------------------------------------------- | ------------------ |
| SRV-VAL-001 | Confirmar pago con referencia válida                 | éxito              |
| SRV-VAL-002 | Confirmar bankTransfer sin comprobante ni referencia | error              |
| SRV-VAL-003 | Rechazar pago pendingValidation con motivo           | éxito              |
| SRV-VAL-004 | Rechazar sin motivo                                  | error              |
| SRV-VAL-005 | Confirmar pago rejected                              | error              |

---

## 10.3. PaymentAllocationService

| ID            | Caso                                      | Resultado esperado          |
| ------------- | ----------------------------------------- | --------------------------- |
| SRV-ALLOC-001 | Asignar pago confirmado a cargo pendiente | éxito                       |
| SRV-ALLOC-002 | Asignar pago pendingValidation            | error                       |
| SRV-ALLOC-003 | Asignar a cargo de otro tenant            | error                       |
| SRV-ALLOC-004 | Asignar a cargo de otra unidad            | error                       |
| SRV-ALLOC-005 | Asignar más del pago disponible           | error                       |
| SRV-ALLOC-006 | Asignar más del saldo del cargo           | error                       |
| SRV-ALLOC-007 | Pago parcial actualiza estado             | partiallyAllocated          |
| SRV-ALLOC-008 | Pago total actualiza estado               | allocated                   |
| SRV-ALLOC-009 | Actualiza estado de cargo                 | vía ChargePaymentWriterPort |

---

## 10.4. PaymentAutoAllocationService

| ID           | Caso                               | Resultado esperado     |
| ------------ | ---------------------------------- | ---------------------- |
| SRV-AUTO-001 | Autoasigna por dueDate ascendente  | éxito                  |
| SRV-AUTO-002 | Omite cargos pagados               | pasa                   |
| SRV-AUTO-003 | Omite cargos cancelados/reversados | pasa                   |
| SRV-AUTO-004 | Pago menor que deuda total         | parcialmente asignado  |
| SRV-AUTO-005 | Pago mayor que deuda total         | deja unallocatedAmount |
| SRV-AUTO-006 | Sin cargos pendientes              | no crea allocations    |
| SRV-AUTO-007 | No toma cargos de otra unidad      | pasa                   |

---

## 10.5. PaymentReversalService

| ID          | Caso                                    | Resultado esperado  |
| ----------- | --------------------------------------- | ------------------- |
| SRV-REV-001 | Reversar pago confirmed sin allocations | éxito               |
| SRV-REV-002 | Reversar pago allocated                 | reversa allocations |
| SRV-REV-003 | Reversar pago ya reversed               | error               |
| SRV-REV-004 | Reversar sin motivo                     | error               |
| SRV-REV-005 | Recalcula cargos afectados              | pasa                |
| SRV-REV-006 | Crea PaymentReversal                    | pasa                |
| SRV-REV-007 | No elimina Payment                      | pasa                |

---

## 10.6. PaymentIdempotencyService

| ID             | Caso                                         | Resultado esperado     |
| -------------- | -------------------------------------------- | ---------------------- |
| SRV-PIDEMP-001 | Header Idempotency-Key genera key por tenant | éxito                  |
| SRV-PIDEMP-002 | Misma key y mismo payload                    | devuelve existente     |
| SRV-PIDEMP-003 | Misma key y payload distinto                 | `IDEMPOTENCY_CONFLICT` |
| SRV-PIDEMP-004 | Key derivada por referencia                  | éxito                  |
| SRV-PIDEMP-005 | Tenant distinto permite misma key externa    | éxito                  |

---

## 10.7. PaymentEffectiveAmountService

| ID           | Caso                      | Resultado esperado               |
| ------------ | ------------------------- | -------------------------------- |
| SRV-PEFF-001 | Pago nuevo                | allocated 0 / unallocated amount |
| SRV-PEFF-002 | Asignar 50 de 100         | allocated 50 / unallocated 50    |
| SRV-PEFF-003 | Asignar 100 de 100        | allocated 100 / unallocated 0    |
| SRV-PEFF-004 | Reversar allocation       | recalcula                        |
| SRV-PEFF-005 | Reversar pago             | allocated 0 / unallocated 0      |
| SRV-PEFF-006 | No cambia amount original | pasa                             |

---

## 10.8. PaymentReceiptPolicyService

| ID              | Caso                                                | Resultado esperado |
| --------------- | --------------------------------------------------- | ------------------ |
| SRV-REC-POL-001 | bankTransfer requiere receipt o reference           | true               |
| SRV-REC-POL-002 | cash no requiere receipt por defecto                | true               |
| SRV-REC-POL-003 | Usuario autorizado sube receipt admin               | permitido          |
| SRV-REC-POL-004 | Usuario own sube receipt propio                     | permitido          |
| SRV-REC-POL-005 | Usuario own sube receipt ajeno                      | rechazado          |
| SRV-REC-POL-006 | Receipt rejected no permite aceptación sin política | rechazado          |

---

## 10.9. PaymentReceiptSecurityService

| ID              | Caso                      | Resultado esperado      |
| --------------- | ------------------------- | ----------------------- |
| SRV-REC-SEC-001 | PDF permitido             | pasa                    |
| SRV-REC-SEC-002 | JPG permitido             | pasa                    |
| SRV-REC-SEC-003 | EXE bloqueado             | error                   |
| SRV-REC-SEC-004 | archivo grande bloqueado  | error                   |
| SRV-REC-SEC-005 | nombre con path traversal | sanitizado/rechazado    |
| SRV-REC-SEC-006 | MIME spoof básico         | rechazado si detectable |
| SRV-REC-SEC-007 | metadata segura           | pasa                    |

---

## 10.10. OwnPaymentPolicyService

| ID              | Caso                                          | Resultado esperado      |
| --------------- | --------------------------------------------- | ----------------------- |
| SRV-OWN-PAY-001 | Propietario reporta pago de unidad propia     | permitido               |
| SRV-OWN-PAY-002 | Residente reporta pago si política lo permite | permitido               |
| SRV-OWN-PAY-003 | Usuario reporta pago de unidad ajena          | rechazado               |
| SRV-OWN-PAY-004 | Usuario consulta pago ajeno                   | rechazado               |
| SRV-OWN-PAY-005 | Usuario descarga receipt ajeno                | rechazado               |
| SRV-OWN-PAY-006 | Usuario sin Person                            | `OWN_PERSON_NOT_LINKED` |
| SRV-OWN-PAY-007 | Relación ended no otorga acceso               | rechazado               |

---

# 11. Pruebas de casos de uso

## 11.1. Pagos administrativos

| ID                 | Caso                                      | Resultado esperado             |
| ------------------ | ----------------------------------------- | ------------------------------ |
| APP-PAY-CREATE-001 | Crear pago administrativo válido          | éxito                          |
| APP-PAY-CREATE-002 | Unidad de otro tenant                     | `CROSS_TENANT_REFERENCE`       |
| APP-PAY-CREATE-003 | Monto negativo                            | `MONEY_AMOUNT_INVALID`         |
| APP-PAY-CREATE-004 | Currency no USD                           | `CURRENCY_NOT_SUPPORTED`       |
| APP-PAY-CREATE-005 | Método no soportado                       | `PAYMENT_METHOD_NOT_SUPPORTED` |
| APP-PAY-CREATE-006 | Transferencia sin referencia ni receipt   | `PAYMENT_RECEIPT_REQUIRED`     |
| APP-PAY-CREATE-007 | Idempotency key repetida mismo payload    | devuelve existente             |
| APP-PAY-CREATE-008 | Idempotency key repetida payload distinto | `IDEMPOTENCY_CONFLICT`         |
| APP-PAY-CREATE-009 | Auditoría generada                        | pasa                           |
| APP-PAY-CREATE-010 | Evento emitido                            | pasa                           |

---

## 11.2. Pagos propios

| ID              | Caso                                | Resultado esperado      |
| --------------- | ----------------------------------- | ----------------------- |
| APP-OWN-PAY-001 | Reportar pago de unidad propia      | éxito                   |
| APP-OWN-PAY-002 | Reportar pago de unidad ajena       | 403/404                 |
| APP-OWN-PAY-003 | Usuario sin Person                  | `OWN_PERSON_NOT_LINKED` |
| APP-OWN-PAY-004 | Pago propio queda pendingValidation | pasa                    |
| APP-OWN-PAY-005 | Auditoría `payment.reported`        | pasa                    |
| APP-OWN-PAY-006 | Evento `PaymentReported`            | pasa                    |

---

## 11.3. Confirmación y rechazo

| ID              | Caso                                  | Resultado esperado |
| --------------- | ------------------------------------- | ------------------ |
| APP-CONFIRM-001 | Confirmar pago pendingValidation      | éxito              |
| APP-CONFIRM-002 | Confirmar pago rejected               | error              |
| APP-CONFIRM-003 | Confirmar bankTransfer sin evidencia  | error              |
| APP-CONFIRM-004 | Confirmar ya confirmed                | 409                |
| APP-REJECT-001  | Rechazar pendingValidation con motivo | éxito              |
| APP-REJECT-002  | Rechazar sin motivo                   | 422                |
| APP-REJECT-003  | Rechazar pago confirmed               | 409                |
| APP-REJECT-004  | Rechazar pago con allocations activas | 409                |

---

## 11.4. Comprobantes

| ID          | Caso                              | Resultado esperado |
| ----------- | --------------------------------- | ------------------ |
| APP-REC-001 | Subir receipt con archivo válido  | éxito              |
| APP-REC-002 | Crear receipt solo con referencia | éxito              |
| APP-REC-003 | Crear receipt sin evidencia       | error              |
| APP-REC-004 | Archivo tipo no permitido         | error              |
| APP-REC-005 | Archivo demasiado grande          | error              |
| APP-REC-006 | Descargar receipt autorizado      | éxito              |
| APP-REC-007 | Descargar receipt ajeno           | error              |
| APP-REC-008 | Aceptar receipt                   | éxito              |
| APP-REC-009 | Rechazar receipt con motivo       | éxito              |
| APP-REC-010 | Rechazar receipt sin motivo       | error              |

---

## 11.5. Asignación de pagos

| ID            | Caso                            | Resultado esperado        |
| ------------- | ------------------------------- | ------------------------- |
| APP-ALLOC-001 | Asignar pago confirmado a cargo | éxito                     |
| APP-ALLOC-002 | Asignar pago pendingValidation  | error                     |
| APP-ALLOC-003 | Asignar pago rejected           | error                     |
| APP-ALLOC-004 | Asignar a cargo de otro tenant  | error                     |
| APP-ALLOC-005 | Asignar a cargo de otra unidad  | error                     |
| APP-ALLOC-006 | Asignar más del pago            | error                     |
| APP-ALLOC-007 | Asignar más del cargo           | error                     |
| APP-ALLOC-008 | Pago parcial                    | estado partiallyAllocated |
| APP-ALLOC-009 | Pago completo                   | estado allocated          |
| APP-ALLOC-010 | Cargo parcialmente pagado       | estado actualizado        |
| APP-ALLOC-011 | Cargo pagado                    | estado actualizado        |
| APP-ALLOC-012 | Auditoría generada              | pasa                      |

---

## 11.6. Autoasignación

| ID           | Caso                         | Resultado esperado           |
| ------------ | ---------------------------- | ---------------------------- |
| APP-AUTO-001 | Autoasignar por vencimiento  | éxito                        |
| APP-AUTO-002 | Pago menor que deuda         | partiallyAllocated           |
| APP-AUTO-003 | Pago mayor que deuda         | unallocatedAmount conservado |
| APP-AUTO-004 | Sin cargos pendientes        | no crea allocations          |
| APP-AUTO-005 | No usa cargos de otra unidad | pasa                         |
| APP-AUTO-006 | No usa cargos de otro tenant | pasa                         |

---

## 11.7. Reversos

| ID                | Caso                            | Resultado esperado  |
| ----------------- | ------------------------------- | ------------------- |
| APP-PAY-REV-001   | Reversar pago confirmed         | éxito               |
| APP-PAY-REV-002   | Reversar pago allocated         | reversa allocations |
| APP-PAY-REV-003   | Reversar pago ya reversed       | error               |
| APP-PAY-REV-004   | Reversar sin motivo             | error               |
| APP-PAY-REV-005   | Reversal único por pago         | pasa                |
| APP-ALLOC-REV-001 | Reversar allocation activa      | éxito               |
| APP-ALLOC-REV-002 | Reversar allocation ya reversed | error               |
| APP-ALLOC-REV-003 | Recalcula payment               | pasa                |
| APP-ALLOC-REV-004 | Recalcula charge                | pasa                |

---

# 12. Pruebas de integración

## 12.1. Migración y persistencia

Archivo sugerido:

```text id="j2p6kw"
005-create-payments.migration.spec.ts
```

| ID              | Caso                                     | Resultado esperado |
| --------------- | ---------------------------------------- | ------------------ |
| INT-MIG-PAY-001 | Migración aplica en DB limpia            | éxito              |
| INT-MIG-PAY-002 | Enums creados                            | éxito              |
| INT-MIG-PAY-003 | Tablas creadas                           | éxito              |
| INT-MIG-PAY-004 | tenant_id obligatorio                    | éxito              |
| INT-MIG-PAY-005 | property_unit_id obligatorio en payments | éxito              |
| INT-MIG-PAY-006 | Montos Decimal                           | éxito              |
| INT-MIG-PAY-007 | unique tenant+idempotencyKey             | éxito              |
| INT-MIG-PAY-008 | unique tenant+payment reversal           | éxito              |
| INT-MIG-PAY-009 | onDelete Restrict                        | éxito              |
| INT-MIG-PAY-010 | no cascade delete peligroso              | éxito              |
| INT-MIG-PAY-011 | constraints de monto                     | éxito              |
| INT-MIG-PAY-012 | constraints de receipt evidence          | éxito              |
| INT-MIG-PAY-013 | Prisma Client genera                     | éxito              |

---

## 12.2. Repositorios

Archivos sugeridos:

```text id="g97vms"
payment.repository.integration.spec.ts
payment-receipt.repository.integration.spec.ts
payment-allocation.repository.integration.spec.ts
payment-reversal.repository.integration.spec.ts
```

Casos mínimos:

| ID                 | Caso                                | Resultado esperado |
| ------------------ | ----------------------------------- | ------------------ |
| INT-REPO-PAY-001   | Crear y buscar Payment              | éxito              |
| INT-REPO-PAY-002   | Buscar por idempotencyKey           | éxito              |
| INT-REPO-PAY-003   | Listar por tenant                   | no mezcla tenants  |
| INT-REPO-PAY-004   | Listar por unidad                   | éxito              |
| INT-REPO-REC-001   | Crear PaymentReceipt                | éxito              |
| INT-REPO-REC-002   | Listar receipts por pago            | éxito              |
| INT-REPO-ALLOC-001 | Crear PaymentAllocation             | éxito              |
| INT-REPO-ALLOC-002 | Sumar allocations activas por pago  | correcto           |
| INT-REPO-ALLOC-003 | Sumar allocations activas por cargo | correcto           |
| INT-REPO-REV-001   | Crear PaymentReversal               | éxito              |
| INT-REPO-REV-002   | Reversal único por pago             | enforced           |

---

## 12.3. Storage fake / MinIO local

| ID              | Caso                             | Resultado esperado |
| --------------- | -------------------------------- | ------------------ |
| INT-STORAGE-001 | Subir archivo privado fake       | éxito              |
| INT-STORAGE-002 | Generar URL temporal             | éxito              |
| INT-STORAGE-003 | Archivo inexistente              | `FILE_NOT_FOUND`   |
| INT-STORAGE-004 | No genera URL pública permanente | pasa               |
| INT-STORAGE-005 | Metadata se conserva             | pasa               |

---

## 12.4. Seeds

| ID               | Caso                             | Resultado esperado |
| ---------------- | -------------------------------- | ------------------ |
| INT-SEED-PAY-001 | Crear payments demo              | éxito              |
| INT-SEED-PAY-002 | Crear receipts demo metadata     | éxito              |
| INT-SEED-PAY-003 | Crear allocations demo           | éxito              |
| INT-SEED-PAY-004 | Reejecutar seeds                 | idempotente        |
| INT-SEED-PAY-005 | Seeds no contienen datos reales  | pasa               |
| INT-SEED-PAY-006 | Seeds no crean conciliación      | pasa               |
| INT-SEED-PAY-007 | Seeds no crean estados de cuenta | pasa               |

---

# 13. Pruebas API — Payments

## 13.1. Listar pagos

Endpoint:

```text id="cjfhlz"
GET /api/v1/tenant/payments
```

| ID               | Caso                      | Resultado esperado |
| ---------------- | ------------------------- | ------------------ |
| API-PAY-LIST-001 | Treasurer lista pagos     | 200                |
| API-PAY-LIST-002 | Sin token                 | 401                |
| API-PAY-LIST-003 | Sin membership            | 403                |
| API-PAY-LIST-004 | Sin permiso               | 403                |
| API-PAY-LIST-005 | No incluye pagos Tenant B | pasa               |
| API-PAY-LIST-006 | Filtro por status         | correcto           |
| API-PAY-LIST-007 | Filtro por unidad         | correcto           |
| API-PAY-LIST-008 | Paginación                | meta correcto      |

---

## 13.2. Crear pago administrativo

Endpoint:

```text id="mkc0nk"
POST /api/v1/tenant/payments
```

| ID                 | Caso                                | Resultado esperado |
| ------------------ | ----------------------------------- | ------------------ |
| API-PAY-CREATE-001 | Crear pago válido                   | 201                |
| API-PAY-CREATE-002 | Sin token                           | 401                |
| API-PAY-CREATE-003 | Sin permiso                         | 403                |
| API-PAY-CREATE-004 | Unidad de otro tenant               | 403/422            |
| API-PAY-CREATE-005 | Monto negativo                      | 422                |
| API-PAY-CREATE-006 | Moneda no USD                       | 422                |
| API-PAY-CREATE-007 | Método no soportado                 | 422                |
| API-PAY-CREATE-008 | bankTransfer sin referencia/receipt | 422                |
| API-PAY-CREATE-009 | tenantId en body                    | 422                |
| API-PAY-CREATE-010 | Idempotency-Key mismo payload       | retorna existente  |
| API-PAY-CREATE-011 | Idempotency-Key payload distinto    | 409                |
| API-PAY-CREATE-012 | Auditoría generada                  | pasa               |

---

## 13.3. Consultar, confirmar y rechazar

| ID               | Endpoint             | Caso                        | Resultado esperado |
| ---------------- | -------------------- | --------------------------- | ------------------ |
| API-PAY-GET-001  | GET `/{id}`          | Pago del tenant             | 200                |
| API-PAY-GET-002  | GET `/{id}`          | Pago de otro tenant         | 403/404            |
| API-PAY-CONF-001 | POST `/{id}/confirm` | Confirmar pendingValidation | 200                |
| API-PAY-CONF-002 | POST `/{id}/confirm` | Ya confirmed                | 409                |
| API-PAY-CONF-003 | POST `/{id}/confirm` | Sin permiso                 | 403                |
| API-PAY-REJ-001  | POST `/{id}/reject`  | Rechazar con motivo         | 200                |
| API-PAY-REJ-002  | POST `/{id}/reject`  | Sin motivo                  | 422                |
| API-PAY-REJ-003  | POST `/{id}/reject`  | Pago allocated              | 409                |

---

## 13.4. Asignar, autoasignar y reversar

| ID                | Endpoint                   | Caso                      | Resultado esperado  |
| ----------------- | -------------------------- | ------------------------- | ------------------- |
| API-PAY-ALLOC-001 | POST `/{id}/allocate`      | Asignación válida         | 200                 |
| API-PAY-ALLOC-002 | POST `/{id}/allocate`      | Payment pendingValidation | 409                 |
| API-PAY-ALLOC-003 | POST `/{id}/allocate`      | Charge otro tenant        | 403/422             |
| API-PAY-ALLOC-004 | POST `/{id}/allocate`      | Charge otra unidad        | 422                 |
| API-PAY-ALLOC-005 | POST `/{id}/allocate`      | Excede payment            | 422                 |
| API-PAY-ALLOC-006 | POST `/{id}/allocate`      | Excede charge             | 422                 |
| API-PAY-AUTO-001  | POST `/{id}/auto-allocate` | Autoasignación válida     | 200                 |
| API-PAY-AUTO-002  | POST `/{id}/auto-allocate` | Sin cargos pendientes     | 200/409 documentado |
| API-PAY-REV-001   | POST `/{id}/reverse`       | Reverso válido            | 200                 |
| API-PAY-REV-002   | POST `/{id}/reverse`       | Ya reversed               | 409                 |
| API-PAY-REV-003   | POST `/{id}/reverse`       | Sin motivo                | 422                 |
| API-PAY-REV-004   | POST `/{id}/reverse`       | Sin permiso               | 403                 |

---

# 14. Pruebas API — Payment Receipts

## 14.1. Listar y crear comprobantes

| ID                 | Caso                         | Resultado esperado |
| ------------------ | ---------------------------- | ------------------ |
| API-REC-LIST-001   | Listar receipts de pago      | 200                |
| API-REC-LIST-002   | Pago de otro tenant          | 403/404            |
| API-REC-UPLOAD-001 | Subir PDF válido             | 201                |
| API-REC-UPLOAD-002 | Crear receipt con referencia | 201                |
| API-REC-UPLOAD-003 | Sin archivo ni referencia    | 422                |
| API-REC-UPLOAD-004 | Archivo no permitido         | 422                |
| API-REC-UPLOAD-005 | Archivo demasiado grande     | 422                |
| API-REC-UPLOAD-006 | Sin permiso                  | 403                |
| API-REC-UPLOAD-007 | Storage privado invocado     | pasa               |

---

## 14.2. Consultar, descargar y revisar comprobantes

| ID               | Caso                         | Resultado esperado |
| ---------------- | ---------------------------- | ------------------ |
| API-REC-GET-001  | Consultar receipt            | 200                |
| API-REC-GET-002  | Receipt de otro tenant       | 403/404            |
| API-REC-DOWN-001 | Descargar receipt autorizado | 200                |
| API-REC-DOWN-002 | Descargar sin permiso        | 403                |
| API-REC-DOWN-003 | Receipt sin fileId           | 409                |
| API-REC-DOWN-004 | File no existe               | 404                |
| API-REC-ACC-001  | Aceptar receipt              | 200                |
| API-REC-ACC-002  | Aceptar sin permiso          | 403                |
| API-REC-REJ-001  | Rechazar receipt con motivo  | 200                |
| API-REC-REJ-002  | Rechazar sin motivo          | 422                |

---

# 15. Pruebas API — Payment Allocations

| ID                 | Caso                       | Resultado esperado |
| ------------------ | -------------------------- | ------------------ |
| API-ALLOC-LIST-001 | Listar allocations de pago | 200                |
| API-ALLOC-LIST-002 | Pago de otro tenant        | 403/404            |
| API-ALLOC-GET-001  | Consultar allocation       | 200                |
| API-ALLOC-GET-002  | Allocation de otro tenant  | 403/404            |
| API-ALLOC-REV-001  | Reversar allocation activa | 200                |
| API-ALLOC-REV-002  | Reversar sin motivo        | 422                |
| API-ALLOC-REV-003  | Reversar ya reversed       | 409                |
| API-ALLOC-REV-004  | Sin permiso                | 403                |
| API-ALLOC-REV-005  | Recalcula payment          | pasa               |
| API-ALLOC-REV-006  | Recalcula charge           | pasa               |

---

# 16. Pruebas API — Own Payments

## 16.1. `/me/payments`

| ID                     | Caso                                       | Resultado esperado |
| ---------------------- | ------------------------------------------ | ------------------ |
| API-OWN-PAY-LIST-001   | Propietario lista pagos propios            | 200                |
| API-OWN-PAY-LIST-002   | Residente lista pagos propios si permitido | 200                |
| API-OWN-PAY-LIST-003   | Usuario sin Person                         | 403                |
| API-OWN-PAY-LIST-004   | Sin permiso `.own`                         | 403                |
| API-OWN-PAY-LIST-005   | No devuelve pagos de unidad ajena          | pasa               |
| API-OWN-PAY-LIST-006   | No devuelve pagos Tenant B                 | pasa               |
| API-OWN-PAY-CREATE-001 | Reportar pago propio                       | 201                |
| API-OWN-PAY-CREATE-002 | Reportar pago de unidad ajena              | 403/404            |
| API-OWN-PAY-CREATE-003 | Monto inválido                             | 422                |
| API-OWN-PAY-CREATE-004 | Estado inicial pendingValidation           | pasa               |

---

## 16.2. `/me/payments/{paymentId}` y receipts propios

| ID                     | Caso                        | Resultado esperado |
| ---------------------- | --------------------------- | ------------------ |
| API-OWN-PAY-GET-001    | Consultar pago propio       | 200                |
| API-OWN-PAY-GET-002    | Consultar pago ajeno        | 404 recomendado    |
| API-OWN-REC-UPLOAD-001 | Subir receipt a pago propio | 201                |
| API-OWN-REC-UPLOAD-002 | Subir receipt a pago ajeno  | 404/403            |
| API-OWN-REC-DOWN-001   | Descargar receipt propio    | 200                |
| API-OWN-REC-DOWN-002   | Descargar receipt ajeno     | 404/403            |
| API-OWN-REC-DOWN-003   | Sin permiso download.own    | 403                |

---

# 17. Pruebas de autorización

## 17.1. Matriz administrativa

| ID           | Usuario                  | Endpoint                              | Resultado |
| ------------ | ------------------------ | ------------------------------------- | --------- |
| AUTH-PAY-001 | TenantAdminA             | POST `/tenant/payments`               | 201       |
| AUTH-PAY-002 | TreasurerA               | POST `/tenant/payments/{id}/confirm`  | 200       |
| AUTH-PAY-003 | TreasurerA               | POST `/tenant/payments/{id}/allocate` | 200       |
| AUTH-PAY-004 | TenantAuditorA           | GET `/tenant/payments`                | 200       |
| AUTH-PAY-005 | TenantAuditorA           | POST `/tenant/payments/{id}/reverse`  | 403       |
| AUTH-PAY-006 | BoardMemberA sin permiso | POST `/tenant/payments`               | 403       |
| AUTH-PAY-007 | UserWithoutMembership    | GET `/tenant/payments`                | 403       |
| AUTH-PAY-008 | UserWithoutPermission    | GET `/tenant/payments`                | 403       |
| AUTH-PAY-009 | DisabledUser             | GET `/tenant/payments`                | 403       |
| AUTH-PAY-010 | Anonymous                | GET `/tenant/payments`                | 401       |

---

## 17.2. Tenant suspendido o archivado

| ID                  | Caso                                                         | Resultado esperado                   |
| ------------------- | ------------------------------------------------------------ | ------------------------------------ |
| AUTH-PAY-TENANT-001 | Crear pago en tenant suspended                               | 403                                  |
| AUTH-PAY-TENANT-002 | Confirmar pago en tenant suspended                           | 403                                  |
| AUTH-PAY-TENANT-003 | Asignar pago en tenant archived                              | 403                                  |
| AUTH-PAY-TENANT-004 | Consultar histórico en tenant suspended con permiso especial | permitido o bloqueado según política |

---

## 17.3. Separación de funciones

| ID               | Caso                                                   | Resultado esperado |
| ---------------- | ------------------------------------------------------ | ------------------ |
| AUTH-PAY-SOD-001 | Usuario con `payments.read` no puede confirmar         | 403                |
| AUTH-PAY-SOD-002 | Usuario con `payments.confirm` no puede reversar       | 403                |
| AUTH-PAY-SOD-003 | Usuario con `payments.create.own` no puede confirmar   | 403                |
| AUTH-PAY-SOD-004 | Usuario con `paymentReceipts.download` no puede review | 403                |
| AUTH-PAY-SOD-005 | TenantAuditor no modifica pagos                        | 403                |

---

# 18. Pruebas multitenant

| ID         | Caso                                | Resultado esperado |
| ---------- | ----------------------------------- | ------------------ |
| MT-PAY-001 | Tenant A no lista pagos B           | pasa               |
| MT-PAY-002 | Tenant A no consulta pago B         | 403/404            |
| MT-PAY-003 | Tenant A no crea pago para unidad B | rechazado          |
| MT-PAY-004 | Tenant A no confirma pago B         | rechazado          |
| MT-PAY-005 | Tenant A no rechaza pago B          | rechazado          |
| MT-PAY-006 | Tenant A no asigna pago B           | rechazado          |
| MT-PAY-007 | Tenant A no asigna pago A a cargo B | rechazado          |
| MT-PAY-008 | Tenant A no sube receipt a pago B   | rechazado          |
| MT-PAY-009 | Tenant A no descarga receipt B      | rechazado          |
| MT-PAY-010 | Tenant A no consulta allocation B   | rechazado          |
| MT-PAY-011 | Tenant A no reversa allocation B    | rechazado          |
| MT-PAY-012 | Own payments no mezcla tenants      | pasa               |

---

# 19. Pruebas de precisión monetaria

| ID            | Caso                             | Resultado esperado |
| ------------- | -------------------------------- | ------------------ |
| MONEY-PAY-001 | Pago `100.00` se persiste exacto | pasa               |
| MONEY-PAY-002 | Monto sale como string           | pasa               |
| MONEY-PAY-003 | No se usa float                  | pasa               |
| MONEY-PAY-004 | Asignar `0.10 + 0.20`            | `0.30`             |
| MONEY-PAY-005 | Pago 100 asigna 50               | unallocated 50     |
| MONEY-PAY-006 | Pago 100 asigna 100              | unallocated 0      |
| MONEY-PAY-007 | Reverso allocation recalcula     | exacto             |
| MONEY-PAY-008 | Asignación no deja negativos     | pasa               |
| MONEY-PAY-009 | Currency no USD                  | rechazado          |

---

# 20. Pruebas de idempotencia

| ID            | Caso                                         | Resultado esperado               |
| ------------- | -------------------------------------------- | -------------------------------- |
| IDEMP-PAY-001 | Crear pago con Idempotency-Key               | crea pago                        |
| IDEMP-PAY-002 | Repetir misma key y mismo payload            | devuelve existente               |
| IDEMP-PAY-003 | Repetir misma key y payload distinto         | 409                              |
| IDEMP-PAY-004 | Tenant distinto con misma key externa        | permitido                        |
| IDEMP-PAY-005 | Key derivada por transactionReference        | no duplica                       |
| IDEMP-PAY-006 | Reintento después de timeout                 | no duplica                       |
| IDEMP-PAY-007 | Creación concurrente con misma key           | solo un pago                     |
| IDEMP-PAY-008 | Sin key pero referencia duplicada sospechosa | warning/conflicto según política |

---

# 21. Pruebas de asignación financiera

| ID            | Caso                                       | Resultado esperado                   |
| ------------- | ------------------------------------------ | ------------------------------------ |
| FIN-ALLOC-001 | Pago parcial a un cargo                    | cargo partiallyPaid                  |
| FIN-ALLOC-002 | Pago completo a un cargo                   | cargo paid                           |
| FIN-ALLOC-003 | Un pago a dos cargos                       | allocations correctas                |
| FIN-ALLOC-004 | Dos pagos a un cargo                       | cargo paid al completar              |
| FIN-ALLOC-005 | Excedente de pago                          | unallocatedAmount conserva excedente |
| FIN-ALLOC-006 | Allocation excede payment                  | rechazado                            |
| FIN-ALLOC-007 | Allocation excede charge                   | rechazado                            |
| FIN-ALLOC-008 | Allocation a cargo cancelado               | rechazado                            |
| FIN-ALLOC-009 | Allocation a cargo reversed                | rechazado                            |
| FIN-ALLOC-010 | Reverso allocation resta del cargo         | recalculado                          |
| FIN-ALLOC-011 | Reverso payment revierte todas allocations | pasa                                 |
| FIN-ALLOC-012 | amount original del payment no cambia      | pasa                                 |

---

# 22. Pruebas de seguridad de comprobantes

| ID          | Caso                               | Resultado esperado      |
| ----------- | ---------------------------------- | ----------------------- |
| REC-SEC-001 | Subir PDF válido                   | permitido               |
| REC-SEC-002 | Subir JPG/PNG válido               | permitido               |
| REC-SEC-003 | Subir EXE                          | bloqueado               |
| REC-SEC-004 | Subir HTML/SVG si no permitido     | bloqueado               |
| REC-SEC-005 | Archivo mayor a 5 MB               | bloqueado               |
| REC-SEC-006 | Filename con `../`                 | sanitizado/rechazado    |
| REC-SEC-007 | Filename excesivamente largo       | rechazado               |
| REC-SEC-008 | MIME spoof básico                  | rechazado si detectable |
| REC-SEC-009 | Storage devuelve URL temporal      | pasa                    |
| REC-SEC-010 | No existe URL pública permanente   | pasa                    |
| REC-SEC-011 | Receipt ajeno no descarga          | bloqueado               |
| REC-SEC-012 | Receipt de otro tenant no descarga | bloqueado               |

---

# 23. Pruebas de concurrencia

| ID           | Caso                                          | Resultado esperado           |
| ------------ | --------------------------------------------- | ---------------------------- |
| CONC-PAY-001 | Dos pagos con misma idempotency key           | uno solo                     |
| CONC-PAY-002 | Dos confirmaciones simultáneas                | una confirma, otra 409/no-op |
| CONC-PAY-003 | Dos rechazos simultáneos                      | uno rechaza, otro 409        |
| CONC-PAY-004 | Dos asignaciones simultáneas al mismo payment | no excede monto              |
| CONC-PAY-005 | Dos asignaciones simultáneas al mismo charge  | no excede saldo              |
| CONC-PAY-006 | Reverso y asignación simultánea               | consistencia transaccional   |
| CONC-PAY-007 | Dos reversos simultáneos del mismo pago       | uno reversa, otro 409        |
| CONC-PAY-008 | Dos reversos simultáneos de allocation        | uno reversa, otro 409        |

---

# 24. Pruebas de regresión financiera

| ID              | Caso                                      | Resultado esperado               |
| --------------- | ----------------------------------------- | -------------------------------- |
| FIN-REG-PAY-001 | Pago confirmado sin allocations           | unallocated = amount             |
| FIN-REG-PAY-002 | Pago partiallyAllocated                   | allocated + unallocated = amount |
| FIN-REG-PAY-003 | Pago allocated                            | unallocated = 0                  |
| FIN-REG-PAY-004 | Pago rejected                             | no allocations activas           |
| FIN-REG-PAY-005 | Pago reversed                             | no afecta saldos                 |
| FIN-REG-PAY-006 | Reverso de allocation recupera saldo      | pasa                             |
| FIN-REG-PAY-007 | Reverso de pago recupera cargos           | pasa                             |
| FIN-REG-PAY-008 | Estados de cargos actualizados vía puerto | pasa                             |
| FIN-REG-PAY-009 | Estado de cuenta futuro reconstruible     | datos suficientes                |
| FIN-REG-PAY-010 | No hay eliminación física                 | pasa                             |

---

# 25. Pruebas de seguridad

## 25.1. Payload validation

| ID                  | Caso                     | Resultado esperado   |
| ------------------- | ------------------------ | -------------------- |
| SEC-PAY-PAYLOAD-001 | Strings demasiado largos | 422                  |
| SEC-PAY-PAYLOAD-002 | Script en notes/reason   | sanitización/rechazo |
| SEC-PAY-PAYLOAD-003 | SQL-like search          | seguro               |
| SEC-PAY-PAYLOAD-004 | IDs malformados          | 422                  |
| SEC-PAY-PAYLOAD-005 | tenantId en body         | 422                  |
| SEC-PAY-PAYLOAD-006 | amount inválido          | 422                  |
| SEC-PAY-PAYLOAD-007 | currency no soportada    | 422                  |
| SEC-PAY-PAYLOAD-008 | method no soportado      | 422                  |

---

## 25.2. Seguridad financiera

| ID              | Caso                            | Resultado esperado |
| --------------- | ------------------------------- | ------------------ |
| SEC-PAY-FIN-001 | No existe DELETE de pagos       | pasa               |
| SEC-PAY-FIN-002 | Rechazar no elimina pago        | pasa               |
| SEC-PAY-FIN-003 | Reversar no elimina pago        | pasa               |
| SEC-PAY-FIN-004 | Reversar allocation no elimina  | pasa               |
| SEC-PAY-FIN-005 | amount original no cambia       | pasa               |
| SEC-PAY-FIN-006 | Usuario sin permiso no confirma | 403                |
| SEC-PAY-FIN-007 | Usuario sin permiso no reversa  | 403                |
| SEC-PAY-FIN-008 | Error no expone stack trace     | pasa               |

---

## 25.3. Logs y privacidad

| ID              | Caso                                             | Resultado esperado |
| --------------- | ------------------------------------------------ | ------------------ |
| SEC-PAY-LOG-001 | Logs no contienen Authorization header           | pasa               |
| SEC-PAY-LOG-002 | Logs no contienen token                          | pasa               |
| SEC-PAY-LOG-003 | Logs no contienen payload completo               | pasa               |
| SEC-PAY-LOG-004 | Logs no contienen contenido de comprobante       | pasa               |
| SEC-PAY-LOG-005 | Logs no contienen datos bancarios completos      | pasa               |
| SEC-PAY-LOG-006 | Logs no contienen datos personales innecesarios  | pasa               |
| SEC-PAY-LOG-007 | Métricas no usan transactionReference como label | pasa               |
| SEC-PAY-LOG-008 | Métricas no usan fileId como label               | pasa               |

---

# 26. Pruebas de auditoría

| ID          | Operación             | Evento auditable esperado    |
| ----------- | --------------------- | ---------------------------- |
| AUD-PAY-001 | Crear pago admin      | `payment.created`            |
| AUD-PAY-002 | Reportar pago propio  | `payment.reported`           |
| AUD-PAY-003 | Confirmar pago        | `payment.confirmed`          |
| AUD-PAY-004 | Rechazar pago         | `payment.rejected`           |
| AUD-PAY-005 | Asignar pago          | `payment.allocated`          |
| AUD-PAY-006 | Autoasignar pago      | `payment.autoAllocated`      |
| AUD-PAY-007 | Reversar pago         | `payment.reversed`           |
| AUD-PAY-008 | Subir comprobante     | `paymentReceipt.uploaded`    |
| AUD-PAY-009 | Descargar comprobante | `paymentReceipt.downloaded`  |
| AUD-PAY-010 | Aceptar comprobante   | `paymentReceipt.accepted`    |
| AUD-PAY-011 | Rechazar comprobante  | `paymentReceipt.rejected`    |
| AUD-PAY-012 | Crear allocation      | `paymentAllocation.created`  |
| AUD-PAY-013 | Reversar allocation   | `paymentAllocation.reversed` |

Campos mínimos:

```text id="gmgtur"
tenantId
actorUserId
action
resourceType
resourceId
result
traceId
occurredAt
```

Campos financieros recomendados:

```text id="dslker"
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

# 27. Pruebas de eventos

| ID          | Operación            | Evento esperado             |
| ----------- | -------------------- | --------------------------- |
| EVT-PAY-001 | Crear pago admin     | `PaymentCreated`            |
| EVT-PAY-002 | Reportar pago propio | `PaymentReported`           |
| EVT-PAY-003 | Subir comprobante    | `PaymentReceiptUploaded`    |
| EVT-PAY-004 | Confirmar pago       | `PaymentConfirmed`          |
| EVT-PAY-005 | Rechazar pago        | `PaymentRejected`           |
| EVT-PAY-006 | Asignar pago         | `PaymentAllocated`          |
| EVT-PAY-007 | Autoasignar pago     | `PaymentAutoAllocated`      |
| EVT-PAY-008 | Reversar pago        | `PaymentReversed`           |
| EVT-PAY-009 | Aceptar comprobante  | `PaymentReceiptAccepted`    |
| EVT-PAY-010 | Rechazar comprobante | `PaymentReceiptRejected`    |
| EVT-PAY-011 | Crear allocation     | `PaymentAllocationCreated`  |
| EVT-PAY-012 | Reversar allocation  | `PaymentAllocationReversed` |

Eventos no deben incluir:

```text id="dkn9x9"
tokens
payload completo
contenido de comprobantes
datos bancarios completos
datos personales innecesarios
```

---

# 28. Pruebas de observabilidad

| ID          | Caso                       | Resultado esperado |
| ----------- | -------------------------- | ------------------ |
| OBS-PAY-001 | Request exitoso            | log con traceId    |
| OBS-PAY-002 | Cross-tenant denegado      | log con errorCode  |
| OBS-PAY-003 | Own access denied          | métrica incrementa |
| OBS-PAY-004 | Pago duplicado intentado   | métrica incrementa |
| OBS-PAY-005 | Receipt descargado         | log auditado       |
| OBS-PAY-006 | Error devuelve traceId     | pasa               |
| OBS-PAY-007 | Auditoría contiene traceId | pasa               |
| OBS-PAY-008 | Logs sanitizados           | pasa               |

Métricas esperadas:

```text id="zg5izf"
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
payment_receipt_downloads_total
```

---

# 29. Pruebas OpenAPI

Validar que OpenAPI incluya:

* Payments API;
* Payment Receipts API;
* Payment Allocations API;
* Own Payments API;
* permisos requeridos;
* errores estándar;
* ejemplos;
* security schemes;
* extensiones `x-required-permission`;
* extensiones `x-financial-operation`;
* extensiones `x-idempotent-operation`;
* extensiones `x-private-file-access`;
* extensiones `x-own-resource-policy`.

| ID           | Caso                                    | Resultado esperado |
| ------------ | --------------------------------------- | ------------------ |
| OAPI-PAY-001 | Endpoints administrativos documentados  | pasa               |
| OAPI-PAY-002 | Endpoints propios documentados          | pasa               |
| OAPI-PAY-003 | Endpoints privados tienen security      | pasa               |
| OAPI-PAY-004 | Permisos documentados                   | pasa               |
| OAPI-PAY-005 | Operaciones financieras marcadas        | pasa               |
| OAPI-PAY-006 | Idempotencia documentada                | pasa               |
| OAPI-PAY-007 | File upload documentado                 | pasa               |
| OAPI-PAY-008 | Private file access documentado         | pasa               |
| OAPI-PAY-009 | Errores documentados                    | pasa               |
| OAPI-PAY-010 | Montos documentados como string decimal | pasa               |

---

# 30. Smoke tests

Smoke tests post-deploy:

| ID            | Caso                                    | Resultado esperado |
| ------------- | --------------------------------------- | ------------------ |
| SMOKE-PAY-001 | `GET /api/v1/health`                    | 200                |
| SMOKE-PAY-002 | `GET /api/v1/tenant/payments` sin token | 401                |
| SMOKE-PAY-003 | `GET /api/v1/me/payments` sin token     | 401                |
| SMOKE-PAY-004 | Usuario autorizado lista pagos          | 200                |
| SMOKE-PAY-005 | Usuario sin permiso recibe 403          | 403                |
| SMOKE-PAY-006 | Error contiene traceId                  | pasa               |

No ejecutar creación real de pagos, confirmaciones, asignaciones, descargas de comprobantes ni reversos en producción como smoke test ordinario.

---

# 31. Organización de archivos de prueba

```text id="vzon3s"
apps/api/src/modules/payments/tests/
├── unit/
│   ├── money.vo.spec.ts
│   ├── payment-status.vo.spec.ts
│   ├── payment-method-type.vo.spec.ts
│   ├── payment-reference.vo.spec.ts
│   ├── payment-idempotency-key.vo.spec.ts
│   ├── payment-receipt-file.vo.spec.ts
│   ├── allocation-amount.vo.spec.ts
│   ├── payment-reversal-reason.vo.spec.ts
│   ├── payment.entity.spec.ts
│   ├── payment-receipt.entity.spec.ts
│   ├── payment-allocation.entity.spec.ts
│   └── payment-reversal.entity.spec.ts
│
├── application/
│   ├── payment-policy.service.spec.ts
│   ├── payment-validation.service.spec.ts
│   ├── payment-allocation.service.spec.ts
│   ├── payment-auto-allocation.service.spec.ts
│   ├── payment-reversal.service.spec.ts
│   ├── payment-idempotency.service.spec.ts
│   ├── payment-effective-amount.service.spec.ts
│   ├── payment-receipt-policy.service.spec.ts
│   ├── payment-receipt-security.service.spec.ts
│   ├── own-payment-policy.service.spec.ts
│   ├── create-payment.use-case.spec.ts
│   ├── report-own-payment.use-case.spec.ts
│   ├── confirm-payment.use-case.spec.ts
│   ├── reject-payment.use-case.spec.ts
│   ├── allocate-payment.use-case.spec.ts
│   ├── auto-allocate-payment.use-case.spec.ts
│   ├── reverse-payment.use-case.spec.ts
│   ├── upload-payment-receipt.use-case.spec.ts
│   ├── download-payment-receipt.use-case.spec.ts
│   ├── reverse-payment-allocation.use-case.spec.ts
│   └── own-payments.use-case.spec.ts
│
├── integration/
│   ├── 005-create-payments.migration.spec.ts
│   ├── payment.repository.integration.spec.ts
│   ├── payment-receipt.repository.integration.spec.ts
│   ├── payment-allocation.repository.integration.spec.ts
│   ├── payment-reversal.repository.integration.spec.ts
│   ├── payment-storage.integration.spec.ts
│   └── payments.seeds.integration.spec.ts
│
├── api/
│   ├── payments.api.spec.ts
│   ├── payment-receipts.api.spec.ts
│   ├── payment-allocations.api.spec.ts
│   └── own-payments.api.spec.ts
│
├── authorization/
│   ├── payments.authorization.spec.ts
│   └── own-payments.authorization.spec.ts
│
├── multitenancy/
│   └── payments.multitenancy.spec.ts
│
├── financial/
│   ├── payment-money-precision.financial.spec.ts
│   ├── payment-idempotency.financial.spec.ts
│   ├── payment-allocation.financial.spec.ts
│   ├── payment-reversal.financial.spec.ts
│   └── payment-account-statement-readiness.financial.spec.ts
│
├── concurrency/
│   └── payments.concurrency.spec.ts
│
├── security/
│   ├── payments-payload.security.spec.ts
│   ├── payments-financial.security.spec.ts
│   ├── payment-receipts-file.security.spec.ts
│   └── payments-logging.security.spec.ts
│
└── openapi/
    └── payments.openapi.spec.ts
```

---

# 32. Comandos esperados

Comandos específicos sugeridos:

```bash id="njxvuj"
npm run test:payments
npm run test:payments:unit
npm run test:payments:application
npm run test:payments:integration
npm run test:payments:api
npm run test:payments:authorization
npm run test:payments:multitenancy
npm run test:payments:financial
npm run test:payments:security
```

Comandos generales:

```bash id="nkny4l"
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

```text id="syln1d"
lint
typecheck
unit tests
application tests
integration tests críticos
API tests críticos
authorization tests
own access tests
multitenancy tests
money precision tests
idempotency tests
allocation consistency tests
receipt file security tests
financial regression tests críticos
OpenAPI validation
build
```

Antes de producción:

```text id="kkz9yf"
full test suite
migration tests
seed tests
authorization tests completos
multitenancy tests completos
financial regression completos
concurrency tests críticos
receipt security tests
logging tests
storage tests
smoke tests staging
```

---

# 34. Gates de calidad

No se permite merge si falla:

* precisión Decimal;
* idempotencia de pagos;
* tenant isolation;
* own payment access;
* no physical delete;
* amount original inmutable;
* asignación no excede pago;
* asignación no excede cargo;
* asignación pago/cargo misma unidad;
* reverso de pago;
* reverso de allocation;
* comprobantes privados;
* descarga autorizada;
* autorización financiera;
* auditoría financiera;
* OpenAPI validation.

---

# 35. Matriz de trazabilidad

| Requisito                              | Pruebas asociadas              |
| -------------------------------------- | ------------------------------ |
| FR-001 Crear pago administrativo       | APP-PAY-CREATE, API-PAY-CREATE |
| FR-002 Reportar pago propio            | APP-OWN-PAY, API-OWN-PAY       |
| FR-003 Registrar comprobante           | APP-REC, API-REC               |
| FR-004 Listar pagos                    | API-PAY-LIST                   |
| FR-005 Consultar pago por ID           | API-PAY-GET                    |
| FR-006 Confirmar pago                  | APP-CONFIRM, API-PAY-CONF      |
| FR-007 Rechazar pago                   | APP-REJECT, API-PAY-REJ        |
| FR-008 Asignar pago a cargos           | APP-ALLOC, API-PAY-ALLOC       |
| FR-009 Autoasignar pago                | APP-AUTO, API-PAY-AUTO         |
| FR-010 Consultar asignaciones          | API-ALLOC                      |
| FR-011 Reversar pago                   | APP-PAY-REV, API-PAY-REV       |
| FR-012 Consultar mis pagos             | API-OWN-PAY-LIST               |
| FR-013 Consultar pagos por unidad      | API-PAY-LIST                   |
| FR-014 Controlar duplicados            | IDEMP-PAY                      |
| FR-015 Auditar operaciones             | AUD-PAY                        |
| FR-016 Emitir eventos                  | EVT-PAY                        |
| FR-017 Actualizar estado de cargo      | FIN-ALLOC, FIN-REG-PAY         |
| FR-018 Conservar excedentes            | FIN-ALLOC-005                  |
| FR-019 Proteger comprobantes           | REC-SEC                        |
| FR-020 Validar aislamiento multitenant | MT-PAY                         |

---

# 36. Riesgos cubiertos

| Riesgo                               | Pruebas                  |
| ------------------------------------ | ------------------------ |
| Pago a unidad de otro tenant         | MT-PAY, APP-PAY-CREATE   |
| Pago asignado a cargo de otro tenant | MT-PAY, APP-ALLOC        |
| Pago asignado a cargo de otra unidad | APP-ALLOC, API-PAY-ALLOC |
| Duplicar pagos                       | IDEMP-PAY, CONC-PAY      |
| Asignar más de lo pagado             | FIN-ALLOC, API-PAY-ALLOC |
| Asignar más del saldo del cargo      | FIN-ALLOC, API-PAY-ALLOC |
| Usar float                           | MONEY-PAY                |
| Exponer comprobantes                 | REC-SEC                  |
| Confirmar sin permiso                | AUTH-PAY                 |
| Reversar sin permiso                 | AUTH-PAY                 |
| Eliminar pago                        | SEC-PAY-FIN              |
| Falta de auditoría                   | AUD-PAY                  |
| Estado de cargo inconsistente        | FIN-REG-PAY              |

---

# 37. Criterios de salida

El módulo `005-payments` puede considerarse probado si:

* todas las pruebas unitarias pasan;
* pruebas de Money pasan;
* pruebas de policies pasan;
* pruebas de casos de uso pasan;
* migración validada;
* seeds idempotentes;
* storage fake o MinIO validado;
* API tests pasan;
* authorization tests pasan;
* own access tests pasan;
* multitenancy tests pasan;
* idempotency tests pasan;
* allocation consistency tests pasan;
* receipt security tests pasan;
* financial regression tests pasan;
* audit tests pasan;
* event tests pasan;
* observability tests pasan;
* OpenAPI actualizado;
* smoke tests pasan;
* no hay uso de float;
* no hay eliminación física;
* no hay sobrescritura de `Payment.amount`;
* no hay acceso cross-tenant;
* no hay fuga de comprobantes;
* no hay pagos duplicados;
* no hay asignaciones inválidas.

---

# 38. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="c0lvt5"
- Conciliación bancaria diferida.
- Importación de movimientos bancarios diferida.
- Pasarela de pagos diferida.
- Pagos con tarjeta diferidos.
- Tokenización diferida.
- Facturación electrónica diferida.
- Asientos contables diferidos.
- OCR de comprobantes diferido.
- IA para validación automática diferida.
- Aprobación dual avanzada diferida.
- Notificaciones automáticas diferidas.
- Cobranza automatizada diferida.
- Carga masiva desde archivo diferida.
```

Estos pendientes no bloquean `005-payments`.

---

## 39. Decisión final del test plan

El módulo `005-payments` deberá probarse con unit tests, application tests, integration tests, migration tests, storage tests, API tests, authorization tests, own access tests, multitenancy tests, money precision tests, idempotency tests, allocation consistency tests, receipt file security tests, concurrency tests, financial regression tests, audit tests, event tests, observability tests, OpenAPI tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="zl8724"
- tenant_id obligatorio;
- property_unit_id obligatorio;
- precisión Decimal;
- idempotencia de pagos;
- no duplicidad de pagos;
- amount inmutable;
- allocatedAmount correcto;
- unallocatedAmount correcto;
- asignación no excede pago;
- asignación no excede cargo;
- pago y cargo de la misma unidad en MVP;
- comprobantes privados;
- descarga autorizada;
- no eliminación física;
- autorización financiera estricta;
- acceso .own solo a pagos propios;
- auditoría financiera;
- eventos financieros;
- compatibilidad con estados de cuenta futuros;
- compatibilidad con conciliación bancaria futura.
```

Ninguna implementación de este módulo debe aceptarse si permite crear pagos duplicados, usar recursos de otro tenant, asignar pagos a cargos de otra unidad, usar float para dinero, sobrescribir el monto original, eliminar pagos, exponer comprobantes privados, omitir auditoría financiera o permitir que un propietario/residente vea pagos de unidades ajenas.
