# Tasks — Spec 005 Payments, Receipts and Payment Allocation

> Política de archivos Sprint 3: la implementación y sus gates deben seguir
> `docs/changes/GAP-S3-008-FILE-SECURITY-OPERATING-POLICY-2026-08-30.md`; las tareas de
> antivirus, categorías futuras o purga no pertenecen a este sprint.

> Frontera Payments/storage de Sprint 3: GAP-S3-005 está cerrado por
> `docs/changes/GAP-S3-005-PAYMENTS-DOCUMENT-STORAGE-BOUNDARY-2026-08-29.md`.
> Las tareas de Payments consumen el puerto de Spec 016 y no implementan adapters ni
> metadata física duplicada. Este documento queda `accepted`.

> Moneda/settings Sprint 3: GAP-S3-004 está cerrado por
> `docs/changes/GAP-S3-004-FINANCIAL-CURRENCY-SETTINGS-2026-08-29.md`;
> `Tenant.currency` es la única autoridad y los settings autorizados son los enumerados
> allí. Este documento queda `accepted`.

> Contrato Sprint 3: GAP-S3-003 está cerrado por
> `docs/changes/GAP-S3-003-FINANCIAL-CROSS-SLICE-SEMANTICS-2026-08-29.md`. Ese contrato
> prevalece para el alcance de implementación y validación; este documento permanece
> queda `accepted` tras el cierre de sus demás blockers.

## 1. Información del documento

| Campo           | Valor                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                 |
| Spec ID         | 005                                                                           |
| Módulo          | Payments                                                                      |
| Documento       | Implementation Tasks                                                          |
| Ruta            | `docs/specs/005-payments/tasks.md`                                            |
| Versión         | 0.1                                                                           |
| Estado          | accepted                                                                  |
| Fecha           | 2026-07-14                                                                    |
| Documento base  | `docs/specs/005-payments/spec.md`                                             |
| Plan técnico    | `docs/specs/005-payments/plan.md`                                             |
| Modelo de datos | `docs/specs/005-payments/data-model.md`                                       |
| Contrato API    | `docs/specs/005-payments/api-contract.md`                                     |
| Plan de pruebas | `docs/specs/005-payments/test-plan.md`                                        |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees` |

---

## 2. Propósito

Este documento convierte la spec `005-payments` en una lista ejecutable de tareas para implementar el módulo de pagos de RESIDENT Core.

El módulo debe permitir administrar:

* pagos administrativos;
* pagos reportados por propietarios o residentes;
* comprobantes de pago;
* carga privada de comprobantes;
* descarga controlada de comprobantes;
* confirmación de pagos;
* rechazo de pagos;
* asignación de pagos a cargos;
* autoasignación de pagos;
* pagos parciales;
* pagos excedentes;
* reversos de pagos;
* reversos de asignaciones;
* consulta administrativa de pagos;
* consulta propia de pagos;
* precisión monetaria;
* idempotencia;
* auditoría financiera;
* eventos financieros;
* pruebas financieras de regresión;
* preparación para estados de cuenta;
* preparación para conciliación bancaria futura.

Regla central:

```text id="y8f7ra"
No se debe implementar ninguna operación de pagos sin tenantId, unidad habitacional, autorización, precisión decimal, idempotencia cuando aplique, comprobantes protegidos, auditoría y pruebas.
```

---

## 3. Convenciones de estado

Usar los siguientes estados:

```text id="xj7mcz"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="ki8p0g"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas de ejecución

Antes de implementar código, se debe revisar:

```text id="ff2d4e"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-010-observability-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/decisions/ADR-012-ci-cd-strategy.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/004-dues-fees/
docs/specs/005-payments/
```

Reglas obligatorias:

```text id="axsn67"
1. Todo registro de pagos debe tener tenantId.
2. Todo Payment debe asociarse a PropertyUnit.
3. Todo PaymentAllocation debe asociarse a Charge.
4. Todo monto financiero debe usar Decimal.
5. No se permite float ni double para dinero.
6. No se permite acceso cross-tenant.
7. No se permite crear pago para unidad de otro tenant.
8. No se permite asignar pago a cargo de otro tenant.
9. En MVP no se permite asignar pago a cargo de otra unidad.
10. No se permite asignar más del monto disponible del pago.
11. No se permite asignar más del saldo pendiente del cargo.
12. No se permite confirmar, rechazar, asignar o reversar pagos sin permiso.
13. No se permite descargar comprobantes sin autorización.
14. No se permite exponer comprobantes en URLs públicas permanentes.
15. No se permite sobrescribir Payment.amount.
16. No se permite eliminar físicamente pagos, comprobantes, asignaciones ni reversos.
17. Todo rechazo requiere motivo.
18. Todo reverso requiere motivo.
19. Toda reversión de asignación requiere motivo.
20. Todo cambio financiero crítico debe auditarse.
21. Todo endpoint privado debe tener AuthGuard.
22. Todo endpoint tenant-scoped debe tener TenantGuard.
23. Todo endpoint financiero administrativo debe tener TenantPermissionGuard.
24. Todo endpoint .own debe validar OwnPaymentPolicyService.
25. No se debe implementar conciliación bancaria en esta spec.
26. No se debe implementar pasarela de pagos en esta spec.
27. No se debe implementar facturación electrónica en esta spec.
28. No se debe implementar estados de cuenta consolidados en esta spec.
29. No se deben usar datos reales en seeds.
```

---

## 5. Resumen de entregables

Al cerrar esta spec deben existir:

```text id="em8gt8"
docs/specs/005-payments/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Y en backend:

```text id="yz27h4"
apps/api/src/modules/payments/
├── payments.module.ts
├── payments.controller.ts
├── payment-receipts.controller.ts
├── payment-allocations.controller.ts
├── own-payments.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text id="nhz69v"
docs/specs/005-payments/
```

### Criterios de aceptación

* La carpeta existe.
* Contiene documentos de la spec.
* Sigue la estructura usada en specs anteriores.
* No reemplaza documentación de `004-dues-fees`.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="vyi24m"
docs/specs/005-payments/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define actores.
* Define reglas de negocio.
* Define flujos de pagos.
* Define historias de usuario.
* Define requisitos funcionales.
* Define requisitos no funcionales.
* Define API preliminar.
* Define riesgos financieros.
* Define criterios globales.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="fnwotz"
docs/specs/005-payments/plan.md
```

### Criterios de aceptación

* Define arquitectura del módulo.
* Define carpetas.
* Define entidades.
* Define value objects.
* Define repositorios.
* Define puertos hacia `003` y `004`.
* Define storage privado.
* Define servicios.
* Define casos de uso.
* Define controladores.
* Define auditoría.
* Define eventos.
* Define observabilidad.
* Define estrategia de entrega.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="ezxi8i"
docs/specs/005-payments/data-model.md
```

### Criterios de aceptación

* Define tablas.
* Define columnas.
* Define enums.
* Define relaciones.
* Define constraints.
* Define índices.
* Define modelo Prisma.
* Define idempotencia.
* Define precisión monetaria.
* Define comprobantes privados.
* Define seeds.
* Define compatibilidad con estados de cuenta y conciliación futura.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="js1vsh"
docs/specs/005-payments/api-contract.md
```

### Criterios de aceptación

* Define endpoints administrativos.
* Define endpoints `.own`.
* Define endpoints de comprobantes.
* Define endpoints de asignaciones.
* Define permisos.
* Define requests.
* Define responses.
* Define errores.
* Define idempotencia.
* Define file upload/download.
* Define OpenAPI.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="fuvt6a"
docs/specs/005-payments/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define application tests.
* Define integration tests.
* Define storage tests.
* Define API tests.
* Define authorization tests.
* Define own access tests.
* Define multitenancy tests.
* Define money precision tests.
* Define idempotency tests.
* Define allocation consistency tests.
* Define receipt security tests.
* Define financial regression tests.
* Define security tests.

---

## TASK-007 — Registrar tareas de implementación

**Estado:** `[ ] Pending`

### Archivo

```text id="igdbt1"
docs/specs/005-payments/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Tareas ejecutables.
* Criterios de aceptación claros.
* Pruebas asociadas.
* Pendientes diferidos documentados.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="keyc7x"
docs/specs/005-payments/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos financieros.
* Define controles de comprobantes.
* Define controles de idempotencia.
* Define controles de multitenancy.
* Define controles de acceso propio.
* Define controles de asignación.
* Define reglas de auditoría.
* Define reglas de logs.
* Define pruebas de seguridad.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `payments`

**Estado:** `[ ] Pending`

### Archivo

```text id="ftr2um"
apps/api/src/modules/payments/payments.module.ts
```

### Criterios de aceptación

* El módulo compila.
* Está registrado en `AppModule`.
* No depende de módulos futuros.
* Importa dependencias necesarias de tenants, users-roles, residents-properties y dues-fees.
* No contiene lógica de negocio.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="j42js9"
apps/api/src/modules/payments/
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   ├── storage/
│   ├── audit/
│   └── events/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Respeta `plan.md`.
* Controladores no usan Prisma directamente.
* Dominio no depende de infraestructura.
* Servicios de aplicación no dependen de controladores.
* Storage se encapsula en puerto/adaptador.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="v4n5fe"
payments.controller.ts
payment-receipts.controller.ts
payment-allocations.controller.ts
own-payments.controller.ts
```

### Criterios de aceptación

* Compilan.
* Están registrados en `PaymentsModule`.
* Tienen rutas base correctas.
* No contienen lógica de negocio.
* Solo orquestan DTOs, guards y use cases.

---

# 8. Fase 2 — Value objects

## TASK-012 — Implementar `Money`

**Estado:** `[ ] Pending`

### Archivo

```text id="mx478u"
domain/value-objects/money.vo.ts
```

### Criterios de aceptación

* Usa Decimal.
* Valida amount.
* Valida currency.
* Serializa como string.
* Prohíbe float inseguro.
* Soporta suma, resta y comparación.
* Tiene unit tests.

### Pruebas

```text id="g4slv7"
UT-PAY-MONEY-001 a UT-PAY-MONEY-008
MONEY-PAY-001 a MONEY-PAY-009
```

---

## TASK-013 — Implementar `PaymentStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="fnbqv9"
domain/value-objects/payment-status.vo.ts
```

### Criterios de aceptación

* Valida estados permitidos.
* Define si un pago es confirmable.
* Define si un pago es rechazable.
* Define si un pago es asignable.
* Define si un pago es reversible.
* Bloquea estados inválidos.
* Tiene unit tests.

---

## TASK-014 — Implementar `PaymentMethodType`

**Estado:** `[ ] Pending`

### Archivo

```text id="wj8vdt"
domain/value-objects/payment-method-type.vo.ts
```

### Criterios de aceptación

* Valida `cash`.
* Valida `bankTransfer`.
* Valida `deposit`.
* Valida `other`.
* Reserva `check` y `online`.
* Define si requiere comprobante o referencia.
* Tiene unit tests.

---

## TASK-015 — Implementar `PaymentReference`

**Estado:** `[ ] Pending`

### Archivo

```text id="fx4fkl"
domain/value-objects/payment-reference.vo.ts
```

### Criterios de aceptación

* Aplica trim.
* Valida longitud.
* Rechaza valor vacío cuando es requerido.
* Evita caracteres peligrosos.
* No permite datos bancarios sensibles completos.
* Tiene unit tests.

---

## TASK-016 — Implementar `PaymentIdempotencyKey`

**Estado:** `[ ] Pending`

### Archivo

```text id="mcgv7w"
domain/value-objects/payment-idempotency-key.vo.ts
```

### Criterios de aceptación

* Soporta header `Idempotency-Key`.
* Construye key scoped por tenant.
* Soporta key derivada por referencia.
* Misma entrada produce misma clave.
* Payload distinto con misma key produce conflicto.
* Rechaza key vacía.
* Tiene unit tests.

---

## TASK-017 — Implementar `PaymentReceiptFile`

**Estado:** `[ ] Pending`

### Archivo

```text id="g8xbnm"
domain/value-objects/payment-receipt-file.vo.ts
```

### Criterios de aceptación

* Valida MIME type.
* Valida extensión.
* Valida tamaño máximo.
* Sanitiza fileName.
* Bloquea path traversal.
* Bloquea archivos peligrosos.
* Tiene unit tests.

---

## TASK-018 — Implementar `AllocationAmount`

**Estado:** `[ ] Pending`

### Archivo

```text id="tzkin8"
domain/value-objects/allocation-amount.vo.ts
```

### Criterios de aceptación

* Valida monto positivo.
* Valida Decimal.
* Valida que no excede monto disponible.
* Valida que no excede saldo de cargo.
* Tiene unit tests.

---

## TASK-019 — Implementar `PaymentReversalReason`

**Estado:** `[ ] Pending`

### Archivo

```text id="fal9bo"
domain/value-objects/payment-reversal-reason.vo.ts
```

### Criterios de aceptación

* Requiere motivo.
* Aplica trim.
* Valida longitud máxima.
* Rechaza payload excesivo.
* Tiene unit tests.

---

## TASK-020 — Implementar value objects de estados secundarios

**Estado:** `[ ] Pending`

### Archivos

```text id="g1zrx7"
payment-receipt-status.vo.ts
payment-allocation-status.vo.ts
currency-code.vo.ts
```

### Criterios de aceptación

* Cada estado valida valores permitidos.
* `rejected`, `reversed`, `cancelled` bloquean operaciones ordinarias.
* `accepted` y `uploaded` se comportan según política.
* Tienen unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-021 — Implementar entidad `Payment`

**Estado:** `[ ] Pending`

### Archivo

```text id="z3n6gt"
domain/entities/payment.entity.ts
```

### Métodos esperados

```text id="fv8zii"
confirm(actorId, notes)
reject(actorId, reason)
cancel(actorId, reason)
reverse(actorId, reason)
markPartiallyAllocated()
markAllocated()
recalculateAllocationAmounts(activeAllocations)
isConfirmable()
isRejectable()
isAllocatable()
isReversible()
assertAmountImmutable()
```

### Criterios de aceptación

* Valida tenant.
* Valida propertyUnit.
* Valida amount.
* Inicializa allocatedAmount en 0.
* Inicializa unallocatedAmount igual a amount.
* No modifica amount original.
* Transiciona estados correctamente.
* No elimina físicamente.
* Tiene unit tests.

---

## TASK-022 — Implementar entidad `PaymentReceipt`

**Estado:** `[ ] Pending`

### Archivo

```text id="vps389"
domain/entities/payment-receipt.entity.ts
```

### Métodos esperados

```text id="d6v6bf"
accept(actorId, notes)
reject(actorId, reason)
archive(actorId, reason)
isDownloadable()
isReviewable()
hasEvidence()
```

### Criterios de aceptación

* Requiere paymentId.
* Requiere evidencia: fileId, receiptNumber o transactionReference.
* Valida status.
* Acepta o rechaza con actor.
* Rechazo requiere motivo.
* No contiene URL pública permanente.
* Tiene unit tests.

---

## TASK-023 — Implementar entidad `PaymentAllocation`

**Estado:** `[ ] Pending`

### Archivo

```text id="avrt55"
domain/entities/payment-allocation.entity.ts
```

### Métodos esperados

```text id="wd9xhe"
reverse(actorId, reason)
isActive()
isReversed()
assertSameTenant()
assertSamePropertyUnit()
```

### Criterios de aceptación

* Requiere paymentId.
* Requiere chargeId.
* Requiere propertyUnitId.
* Requiere amount positivo.
* Reverso requiere motivo.
* No se elimina físicamente.
* Tiene unit tests.

---

## TASK-024 — Implementar entidad `PaymentReversal`

**Estado:** `[ ] Pending`

### Archivo

```text id="sj4fuu"
domain/entities/payment-reversal.entity.ts
```

### Criterios de aceptación

* Requiere paymentId.
* Requiere reason.
* Requiere reversedBy.
* Soporta traceId.
* Solo un reverso por pago en MVP.
* Tiene unit tests.

---

## TASK-025 — Implementar errores de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="dy3xp3"
payment-not-found.error.ts
payment-already-confirmed.error.ts
payment-already-rejected.error.ts
payment-already-reversed.error.ts
payment-not-confirmable.error.ts
payment-not-rejectable.error.ts
payment-not-allocatable.error.ts
payment-not-reversible.error.ts
payment-receipt-required.error.ts
payment-receipt-not-found.error.ts
payment-receipt-not-downloadable.error.ts
payment-receipt-not-reviewable.error.ts
payment-allocation-not-found.error.ts
payment-allocation-already-reversed.error.ts
payment-allocation-amount-exceeds-payment.error.ts
payment-allocation-amount-exceeds-charge.error.ts
payment-and-charge-unit-mismatch.error.ts
payment-reversal-already-exists.error.ts
money-amount-invalid.error.ts
currency-not-supported.error.ts
payment-method-not-supported.error.ts
idempotency-conflict.error.ts
file-type-not-allowed.error.ts
file-too-large.error.ts
file-not-found.error.ts
own-payment-not-found.error.ts
own-person-not-linked.error.ts
cross-tenant-reference.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone detalles internos.
* No expone datos bancarios.
* No expone contenido de comprobantes.

---

## TASK-026 — Implementar eventos de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="qktpck"
payment-created.event.ts
payment-reported.event.ts
payment-receipt-uploaded.event.ts
payment-confirmed.event.ts
payment-rejected.event.ts
payment-allocated.event.ts
payment-auto-allocated.event.ts
payment-reversed.event.ts
payment-receipt-accepted.event.ts
payment-receipt-rejected.event.ts
payment-allocation-created.event.ts
payment-allocation-reversed.event.ts
```

### Criterios de aceptación

* Incluyen `tenantId`.
* Incluyen `actorUserId` cuando aplique.
* Incluyen `traceId`.
* Incluyen referencias financieras necesarias.
* No incluyen payload completo.
* No incluyen contenido de comprobantes.
* No incluyen datos bancarios sensibles.

---

# 10. Fase 4 — DTOs y validación

## TASK-027 — Crear DTOs de Payments

**Estado:** `[ ] Pending`

### Archivos

```text id="tds4yz"
create-payment.dto.ts
payment-response.dto.ts
payment-detail-response.dto.ts
list-payments-query.dto.ts
confirm-payment.dto.ts
reject-payment.dto.ts
reverse-payment.dto.ts
```

### Criterios de aceptación

* Valida propertyUnitId.
* Valida method.
* Valida amount como decimal string.
* Valida currency USD.
* Valida paidAt.
* Valida transactionReference.
* Rechazo y reverso requieren reason.
* No permite `tenantId`.
* No permite `allocatedAmount`.
* No permite `unallocatedAmount`.
* No permite `status` arbitrario.

---

## TASK-028 — Crear DTOs de Own Payments

**Estado:** `[ ] Pending`

### Archivos

```text id="pd13sl"
report-own-payment.dto.ts
my-payment-response.dto.ts
my-payment-detail-response.dto.ts
list-my-payments-query.dto.ts
```

### Criterios de aceptación

* Valida propertyUnitId.
* Valida unidad propia mediante policy, no solo DTO.
* Valida amount.
* Valida method.
* Estado inicial no se recibe desde cliente.
* No expone notas internas.
* No permite `tenantId`.

---

## TASK-029 — Crear DTOs de Payment Receipts

**Estado:** `[ ] Pending`

### Archivos

```text id="m5fgwv"
upload-payment-receipt.dto.ts
payment-receipt-response.dto.ts
payment-receipt-detail-response.dto.ts
reject-payment-receipt.dto.ts
accept-payment-receipt.dto.ts
download-payment-receipt-response.dto.ts
list-payment-receipts-query.dto.ts
```

### Criterios de aceptación

* Soporta multipart/form-data.
* Valida metadata.
* Exige al menos file, receiptNumber o transactionReference.
* Valida reason para reject.
* No expone fileId públicamente si no es necesario.
* No expone URL permanente.

---

## TASK-030 — Crear DTOs de Payment Allocations

**Estado:** `[ ] Pending`

### Archivos

```text id="yinn0p"
allocate-payment.dto.ts
auto-allocate-payment.dto.ts
payment-allocation-response.dto.ts
payment-allocation-detail-response.dto.ts
reverse-payment-allocation.dto.ts
list-payment-allocations-query.dto.ts
```

### Criterios de aceptación

* Valida array de allocations.
* Valida chargeId.
* Valida amount decimal string.
* Reverso requiere reason.
* No permite `tenantId`.
* No permite `propertyUnitId` arbitrario si se deriva del pago/cargo.

---

# 11. Fase 5 — Prisma, migración y seeds

## TASK-031 — Agregar enums de pagos a Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="u72ksj"
PaymentStatus
PaymentMethodType
PaymentReceiptStatus
PaymentAllocationStatus
CurrencyCode reutilizado si ya existe
```

### Criterios de aceptación

* Enums creados.
* Mapeados según `data-model.md`.
* No se duplica `CurrencyCode` si ya existe.
* Prisma Client genera sin errores.

---

## TASK-032 — Agregar modelo Prisma `Payment`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `propertyUnitId` obligatorio.
* `createdBy` obligatorio.
* `amount` Decimal.
* `allocatedAmount` Decimal.
* `unallocatedAmount` Decimal.
* `currency` requerido.
* `idempotencyKey` opcional.
* `@@unique([tenantId, idempotencyKey])` o índice parcial SQL si aplica.
* Relaciones con Tenant, PropertyUnit y UserProfile.
* onDelete Restrict.

---

## TASK-033 — Agregar modelo Prisma `PaymentReceipt`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `paymentId` obligatorio.
* `uploadedBy` obligatorio.
* Metadata de archivo.
* No almacena contenido binario.
* Relaciones con Tenant, Payment y UserProfile.
* onDelete Restrict.
* Índices por tenant, payment y status.

---

## TASK-034 — Agregar modelo Prisma `PaymentAllocation`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `paymentId` obligatorio.
* `chargeId` obligatorio.
* `propertyUnitId` obligatorio.
* `amount` Decimal.
* `allocatedBy` obligatorio.
* `status` requerido.
* Relaciones con Tenant, Payment, Charge, PropertyUnit y UserProfile.
* onDelete Restrict.
* Índices por payment, charge y tenant.

---

## TASK-035 — Agregar modelo Prisma `PaymentReversal`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `paymentId` obligatorio.
* `reason` obligatorio.
* `reversedBy` obligatorio.
* `@@unique([tenantId, paymentId])`.
* Relación con Payment.
* onDelete Restrict.

---

## TASK-036 — Agregar relaciones inversas en `Tenant`

**Estado:** `[ ] Pending`

### Relaciones

```text id="a64yc5"
payments
paymentReceipts
paymentAllocations
paymentReversals
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `001-tenants`.

---

## TASK-037 — Agregar relaciones inversas en `PropertyUnit`

**Estado:** `[ ] Pending`

### Relaciones

```text id="do62y3"
payments
paymentAllocations
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `003-residents-properties`.

---

## TASK-038 — Agregar relación inversa en `Charge`

**Estado:** `[ ] Pending`

### Relación

```text id="plhpoz"
paymentAllocations
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `004-dues-fees`.

---

## TASK-039 — Agregar relaciones inversas en `UserProfile`

**Estado:** `[ ] Pending`

### Relaciones

```text id="fki5uh"
reportedPayments
createdPayments
confirmedPayments
rejectedPayments
cancelledPayments
uploadedPaymentReceipts
reviewedPaymentReceipts
allocatedPayments
reversedPaymentAllocations
paymentReversals
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `002-users-roles`.

---

## TASK-040 — Crear migración `005_create_payments`

**Estado:** `[ ] Pending`

### Comando sugerido

```bash id="hps6bg"
npm run prisma:migrate:dev -- --name 005_create_payments
```

### Criterios de aceptación

* Migración creada.
* Migración aplica localmente.
* `tenant_id` obligatorio.
* `property_unit_id` obligatorio en payments.
* Montos Decimal.
* Unique constraints creados.
* Índices creados.
* No hay cascade delete peligroso.
* Prisma Client genera.

---

## TASK-041 — Agregar constraints SQL manuales

**Estado:** `[ ] Pending`

### Constraints

```text id="gb50n9"
payments_amount_positive_check
payments_allocated_amount_non_negative_check
payments_unallocated_amount_non_negative_check
payments_amount_allocation_balance_check
payments_idempotency_key_not_empty_check
payment_receipts_has_evidence_check
payment_receipts_file_size_positive_check
payment_allocations_amount_positive_check
payment_reversals_reason_not_empty_check
```

### Criterios de aceptación

* SQL revisado.
* Migration tests cubren constraints.
* No contradice Prisma schema.
* Documentado en migración.

---

## TASK-042 — Crear mappers Prisma ↔ dominio

**Estado:** `[ ] Pending`

### Archivo

```text id="wl3ilb"
infrastructure/persistence/payments.mapper.ts
```

### Criterios de aceptación

* Convierte Prisma a entidades.
* Convierte entidades a DTOs.
* Serializa Decimal como string.
* No expone entidades internas.
* No expone datos bancarios.
* No expone contenido de comprobantes.

---

## TASK-043 — Crear repositorios Prisma

**Estado:** `[ ] Pending`

### Archivos

```text id="jyome7"
prisma-payment.repository.ts
prisma-payment-receipt.repository.ts
prisma-payment-allocation.repository.ts
prisma-payment-reversal.repository.ts
```

### Criterios de aceptación

* No se usa Prisma desde controladores.
* Todas las consultas filtran por `tenantId`.
* Mapean errores de unique constraints.
* Tienen integration tests.
* No permiten eliminación física ordinaria.

---

## TASK-044 — Crear seeds de pagos demo

**Estado:** `[ ] Pending`

### Seeds

```text id="q9yfd2"
payment confirmed demo
payment pendingValidation demo
payment rejected demo
payment partiallyAllocated demo
payment receipt metadata demo
payment allocation demo opcional
```

### Criterios de aceptación

* Idempotentes.
* Usan tenants demo.
* Usan unidades demo.
* Usan cargos demo de `004`.
* Usan montos ficticios.
* Usan USD.
* No crean conciliación.
* No crean estados de cuenta consolidados.
* No usan datos reales.
* No suben archivos reales si no hay storage preparado.

---

# 12. Fase 6 — Puertos y adaptadores

## TASK-045 — Crear puertos de repositorio

**Estado:** `[ ] Pending`

### Archivos

```text id="b1t63c"
payment.repository.ts
payment-receipt.repository.ts
payment-allocation.repository.ts
payment-reversal.repository.ts
```

### Criterios de aceptación

* Contratos definidos.
* No dependen de Prisma.
* Usan `tenantId` en métodos críticos.
* Son testeables.

---

## TASK-046 — Crear `PropertyUnitReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="rqs98f"
application/ports/property-unit-reader.port.ts
```

### Criterios de aceptación

* Permite validar unidad por tenant.
* Permite validar unidad activa.
* No expone implementación interna de `003-residents-properties`.
* Evita acceso directo no controlado a tablas de otro módulo.

---

## TASK-047 — Crear `OwnResourceReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="yyhd06"
application/ports/own-resource-reader.port.ts
```

### Criterios de aceptación

* Resuelve unidades propias del usuario.
* Usa `tenantId` y `userProfileId`.
* Compatible con `003-residents-properties`.
* Soporta endpoints `payments.read.own`, `payments.create.own` y `paymentReceipts.download.own`.

---

## TASK-048 — Crear `ChargeReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="mlcfgz"
application/ports/charge-reader.port.ts
```

### Criterios de aceptación

* Permite consultar cargo por tenant.
* Permite listar cargos pendientes por unidad.
* Permite obtener saldo pendiente del cargo.
* Valida que el cargo pertenece a la unidad.
* No modifica cargos.

---

## TASK-049 — Crear `ChargePaymentWriterPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="dw3r6t"
application/ports/charge-payment-writer.port.ts
```

### Criterios de aceptación

* Permite marcar cargo partiallyPaid.
* Permite marcar cargo paid.
* Permite recalcular estado del cargo al reversar pago.
* No modifica `originalAmount`.
* No elimina cargos.
* Compatible con `004-dues-fees`.

---

## TASK-050 — Crear `PrivateFileStoragePort`

**Estado:** `[ ] Pending`

### Archivo

```text id="cerngh"
application/ports/private-file-storage.port.ts
```

### Criterios de aceptación

* Define upload privado.
* Define descarga privada o URL temporal.
* Define validación de archivo.
* No expone URL pública permanente.
* Compatible con MinIO local/dev y S3-compatible producción.

---

## TASK-051 — Crear adaptador fake de storage para tests

**Estado:** `[ ] Pending`

### Archivo

```text id="rzhzvk"
infrastructure/storage/fake-private-file-storage.adapter.ts
```

### Criterios de aceptación

* Permite subir metadata fake.
* Permite simular URL temporal.
* Permite simular archivo inexistente.
* No requiere storage externo real.
* Tiene tests.

---

## TASK-052 — Crear adaptador MinIO/S3-compatible inicial

**Estado:** `[ ] Pending`

### Archivo

```text id="akdjdq"
infrastructure/storage/s3-private-file-storage.adapter.ts
```

### Criterios de aceptación

* Compatible con MinIO local/dev.
* Compatible con S3-compatible production.
* Usa credenciales por env vars.
* No imprime secrets.
* Genera URLs temporales.
* Maneja errores de storage.

---

## TASK-053 — Crear `PaymentsAuditPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="pv0fbx"
application/ports/payments-audit.port.ts
```

### Criterios de aceptación

* Registra tenant.
* Registra actor.
* Registra recurso.
* Registra acción.
* Registra monto y moneda cuando aplique.
* Registra paymentId, chargeId, receiptId o allocationId cuando aplique.
* Registra `traceId`.
* No incluye payload completo.
* Compatible con futura spec `007-audit`.

---

## TASK-054 — Crear adaptador temporal de auditoría

**Estado:** `[ ] Pending`

### Archivo

```text id="qrjb5w"
infrastructure/audit/payments-audit.adapter.ts
```

### Criterios de aceptación

* Implementa `PaymentsAuditPort`.
* Sanitiza datos.
* No registra datos bancarios completos.
* No registra contenido de comprobantes.
* Tiene tests básicos.

---

## TASK-055 — Crear `PaymentsEventsPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="wuoyld"
application/ports/payments-events.port.ts
```

### Criterios de aceptación

* Define `publish(event)`.
* No depende de broker externo.
* Compatible con outbox futuro.

---

## TASK-056 — Crear adaptador temporal de eventos

**Estado:** `[ ] Pending`

### Archivo

```text id="l241h1"
infrastructure/events/payments-events.adapter.ts
```

### Criterios de aceptación

* Implementa puerto de eventos.
* No envía contenido de comprobantes.
* No envía datos bancarios.
* No invoca n8n directamente.
* Es reemplazable por outbox/event bus futuro.

---

# 13. Fase 7 — Servicios y policies

## TASK-057 — Implementar `MoneyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="hqyqw5"
application/services/money.service.ts
```

### Criterios de aceptación

* Usa Decimal.
* Suma, resta y compara exactamente.
* Serializa a string.
* Rechaza moneda no USD.
* Rechaza montos inválidos.
* Tiene tests.

---

## TASK-058 — Implementar `PaymentPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida confirmación.
* Valida rechazo.
* Valida asignación.
* Valida reverso.
* Bloquea estados inválidos.
* Bloquea operaciones destructivas.
* Tiene tests.

---

## TASK-059 — Implementar `PaymentValidationService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Confirma pagos.
* Rechaza pagos.
* Valida comprobante o referencia requerida.
* Registra actor y fecha.
* Tiene tests.

---

## TASK-060 — Implementar `PaymentAllocationService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida pago confirmado.
* Calcula monto disponible.
* Valida cargos.
* Valida mismo tenant.
* Valida misma unidad en MVP.
* Valida saldo pendiente del cargo.
* Crea asignaciones.
* Actualiza estado del pago.
* Actualiza estado del cargo por puerto.
* Usa transacción.
* Tiene tests.

---

## TASK-061 — Implementar `PaymentAutoAllocationService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Obtiene cargos pendientes de la unidad.
* Ordena por `dueDate ASC`.
* Asigna hasta agotar monto disponible.
* No usa cargos pagados, cancelados ni reversados.
* No usa cargos de otra unidad.
* Deja excedente en `unallocatedAmount`.
* Tiene tests.

---

## TASK-062 — Implementar `PaymentReversalService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida estado reversible.
* Exige motivo.
* Reversa asignaciones activas.
* Crea PaymentReversal.
* Marca pago como reversed.
* Recalcula cargos afectados.
* Usa transacción.
* Tiene tests.

---

## TASK-063 — Implementar `PaymentIdempotencyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Construye claves idempotentes.
* Valida header `Idempotency-Key`.
* Detecta key existente.
* Devuelve recurso existente si payload coincide.
* Devuelve conflicto si payload difiere.
* Tiene tests.

---

## TASK-064 — Implementar `PaymentEffectiveAmountService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Calcula allocatedAmount.
* Calcula unallocatedAmount.
* Valida que allocation no excede pago.
* Valida que payment.amount no cambia.
* Tiene tests.

---

## TASK-065 — Implementar `PaymentReceiptPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida si método requiere comprobante o referencia.
* Valida quién puede subir comprobante.
* Valida quién puede revisar comprobante.
* Valida quién puede descargar comprobante.
* Tiene tests.

---

## TASK-066 — Implementar `PaymentReceiptSecurityService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida mime type.
* Valida tamaño.
* Valida extensión.
* Sanitiza nombre.
* Bloquea archivos peligrosos.
* Tiene tests.

---

## TASK-067 — Implementar `OwnPaymentPolicyService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa OwnResourceReaderPort.
* Valida `payments.read.own`.
* Valida `payments.create.own`.
* Valida `paymentReceipts.download.own`.
* Devuelve solo pagos de unidades propias.
* Rechaza unidad ajena.
* Rechaza usuario sin Person.
* Tiene own access tests.

---

# 14. Fase 8 — Casos de uso

## TASK-068 — Implementar `CreatePaymentUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `payments.create`.
* Valida tenant activo.
* Valida unidad del tenant.
* Valida monto Decimal.
* Valida método.
* Valida referencia o comprobante si aplica.
* Aplica idempotencia.
* Crea Payment.
* Estado inicial según política administrativa.
* Audita.
* Emite `PaymentCreated`.
* Tiene tests.

---

## TASK-069 — Implementar `ReportOwnPaymentUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `payments.create.own`.
* Resuelve unidades propias.
* Valida unidad propia.
* Valida monto.
* Valida método.
* Crea Payment en `pendingValidation`.
* Asocia comprobante si se envía.
* Audita.
* Emite `PaymentReported`.
* Tiene tests.

---

## TASK-070 — Implementar use cases de consulta administrativa

**Estado:** `[ ] Pending`

### Use cases

```text id="mvkvri"
GetPaymentUseCase
ListPaymentsUseCase
```

### Criterios de aceptación

* Consultan por tenant.
* Soportan filtros y paginación.
* No exponen pagos de otro tenant.
* No exponen contenido de comprobantes.
* Tienen tests.

---

## TASK-071 — Implementar `ConfirmPaymentUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `payments.confirm`.
* Valida pago confirmable.
* Valida comprobante requerido.
* Cambia estado a confirmed.
* Registra confirmedBy y confirmedAt.
* Audita.
* Emite `PaymentConfirmed`.
* Tiene tests.

---

## TASK-072 — Implementar `RejectPaymentUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `payments.reject`.
* Valida estado rechazable.
* Requiere motivo.
* Rechaza pago.
* Deja allocatedAmount y unallocatedAmount según política.
* Audita.
* Emite `PaymentRejected`.
* Tiene tests.

---

## TASK-073 — Implementar `AllocatePaymentUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `payments.allocate`.
* Valida pago confirmado o parcialmente asignado.
* Valida cargos del tenant.
* Valida cargos de la misma unidad.
* Valida monto disponible.
* Valida saldo pendiente del cargo.
* Crea PaymentAllocations.
* Actualiza Payment.
* Actualiza Charges vía puerto.
* Audita.
* Emite `PaymentAllocated` y `PaymentAllocationCreated`.
* Tiene financial regression tests.

---

## TASK-074 — Implementar `AutoAllocatePaymentUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `payments.allocate`.
* Obtiene cargos pendientes por unidad.
* Ordena por vencimiento.
* Crea asignaciones hasta agotar monto disponible.
* Conserva excedente.
* Actualiza Payment.
* Actualiza Charges.
* Audita.
* Emite `PaymentAutoAllocated`.
* Tiene tests.

---

## TASK-075 — Implementar `ReversePaymentUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `payments.reverse`.
* Valida pago reversible.
* Requiere motivo.
* Reversa asignaciones activas.
* Crea PaymentReversal.
* Marca Payment como reversed.
* Recalcula cargos afectados.
* Audita.
* Emite `PaymentReversed`.
* Tiene tests.

---

## TASK-076 — Implementar use cases de comprobantes

**Estado:** `[ ] Pending`

### Use cases

```text id="h7rawz"
UploadPaymentReceiptUseCase
ListPaymentReceiptsUseCase
GetPaymentReceiptUseCase
DownloadPaymentReceiptUseCase
AcceptPaymentReceiptUseCase
RejectPaymentReceiptUseCase
```

### Criterios de aceptación

* Valida pago del tenant.
* Valida archivo o referencia.
* Usa storage privado.
* Genera URL temporal o stream.
* Acepta comprobante.
* Rechaza comprobante con motivo.
* Audita.
* Emite eventos.
* Tiene tests.

---

## TASK-077 — Implementar use cases de asignaciones

**Estado:** `[ ] Pending`

### Use cases

```text id="tpcnkq"
ListPaymentAllocationsUseCase
GetPaymentAllocationUseCase
ReversePaymentAllocationUseCase
```

### Criterios de aceptación

* Listan allocations por tenant.
* Consultan allocation por tenant.
* Reversan allocation activa.
* Requieren motivo.
* Recalculan Payment.
* Recalculan Charge.
* Auditan.
* Emiten `PaymentAllocationReversed`.
* Tienen tests.

---

## TASK-078 — Implementar use cases `.own`

**Estado:** `[ ] Pending`

### Use cases

```text id="loxef5"
GetMyPaymentsUseCase
GetMyPaymentUseCase
UploadMyPaymentReceiptUseCase
DownloadMyPaymentReceiptUseCase
```

### Criterios de aceptación

* Validan usuario autenticado.
* Validan tenant activo.
* Validan membership activa.
* Validan permisos `.own`.
* Validan unidades propias.
* No devuelven pagos ajenos.
* No descargan comprobantes ajenos.
* Tienen own access tests.

---

# 15. Fase 9 — Guards, policies y autorización

## TASK-079 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida token.
* Resuelve UserProfile.
* Bloquea disabled user.
* Bloquea archived user.

---

## TASK-080 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida tenant active.
* Valida membership active.
* No confía solo en header.
* Bloquea tenant suspended/archived para operaciones de pagos.

---

## TASK-081 — Reutilizar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos financieros.
* Usa EffectivePermissionsService.
* Rechaza sin permiso.
* Tiene authorization tests.

---

## TASK-082 — Implementar `OwnPaymentPolicyGuard` o policy layer

**Estado:** `[ ] Pending`

### Archivo sugerido

```text id="jzfii8"
policies/own-payment-policy.guard.ts
```

### Criterios de aceptación

* Valida permisos `.own`.
* Invoca `OwnPaymentPolicyService`.
* Rechaza unidades ajenas.
* Rechaza usuario sin Person.
* Tiene tests.

---

## TASK-083 — Crear decorators específicos del módulo

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="zmr9h4"
@RequirePaymentPermission()
@RequirePaymentOperation()
@RequireOwnPaymentAccess()
@RequirePrivateFileAccess()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Funcionan con guards/policies.
* Compatibles con OpenAPI.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-084 — Implementar `PaymentsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="htorid"
GET    /api/v1/tenant/payments
POST   /api/v1/tenant/payments
GET    /api/v1/tenant/payments/:paymentId
POST   /api/v1/tenant/payments/:paymentId/confirm
POST   /api/v1/tenant/payments/:paymentId/reject
POST   /api/v1/tenant/payments/:paymentId/allocate
POST   /api/v1/tenant/payments/:paymentId/auto-allocate
POST   /api/v1/tenant/payments/:paymentId/reverse
```

### Criterios de aceptación

* Usa use cases.
* Usa guards.
* Usa DTOs.
* Tiene OpenAPI.
* Tiene API tests.

---

## TASK-085 — Implementar `PaymentReceiptsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="n6nnq6"
GET    /api/v1/tenant/payments/:paymentId/receipts
POST   /api/v1/tenant/payments/:paymentId/receipts
GET    /api/v1/tenant/payment-receipts/:receiptId
GET    /api/v1/tenant/payment-receipts/:receiptId/download
POST   /api/v1/tenant/payment-receipts/:receiptId/accept
POST   /api/v1/tenant/payment-receipts/:receiptId/reject
```

### Criterios de aceptación

* Usa storage privado.
* Valida permisos.
* Valida tenant.
* No expone URLs permanentes.
* Tiene API tests.

---

## TASK-086 — Implementar `PaymentAllocationsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="xb23d1"
GET    /api/v1/tenant/payments/:paymentId/allocations
GET    /api/v1/tenant/payment-allocations/:allocationId
POST   /api/v1/tenant/payment-allocations/:allocationId/reverse
```

### Criterios de aceptación

* Lista asignaciones.
* Consulta asignación.
* Reversa asignación.
* Recalcula Payment y Charge.
* Tiene API tests.

---

## TASK-087 — Implementar `OwnPaymentsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="bp0j3m"
GET    /api/v1/me/payments
POST   /api/v1/me/payments
GET    /api/v1/me/payments/:paymentId
POST   /api/v1/me/payments/:paymentId/receipts
GET    /api/v1/me/payment-receipts/:receiptId/download
```

### Criterios de aceptación

* Usa permisos `.own`.
* Valida unidades propias.
* No devuelve pagos ajenos.
* No descarga comprobantes ajenos.
* Tiene own API tests.

---

# 17. Fase 11 — Errores y respuestas estándar

## TASK-088 — Mapear errores de dominio a HTTP

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `PAYMENT_NOT_FOUND` → 404.
* `PAYMENT_ALREADY_CONFIRMED` → 409.
* `PAYMENT_ALREADY_REJECTED` → 409.
* `PAYMENT_ALREADY_REVERSED` → 409.
* `PAYMENT_NOT_CONFIRMABLE` → 409.
* `PAYMENT_NOT_ALLOCATABLE` → 409.
* `PAYMENT_RECEIPT_REQUIRED` → 422.
* `PAYMENT_ALLOCATION_AMOUNT_EXCEEDS_PAYMENT` → 422.
* `PAYMENT_ALLOCATION_AMOUNT_EXCEEDS_CHARGE` → 422.
* `PAYMENT_AND_CHARGE_UNIT_MISMATCH` → 422.
* `FILE_TYPE_NOT_ALLOWED` → 422.
* `FILE_TOO_LARGE` → 422.
* `IDEMPOTENCY_CONFLICT` → 409.
* `OWN_PERSON_NOT_LINKED` → 403.
* `CROSS_TENANT_REFERENCE` → 403/422.

---

## TASK-089 — Implementar error estándar

**Estado:** `[ ] Pending`

### Formato

```json id="fqz0l0"
{
  "error": {
    "code": "PAYMENT_NOT_ALLOCATABLE",
    "message": "Only confirmed or partially allocated payments can be allocated.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

### Criterios de aceptación

* Todos los errores siguen formato.
* Incluyen `traceId`.
* No exponen stack trace en producción.
* No exponen datos bancarios.
* No exponen contenido de archivos.
* No exponen SQL.

---

## TASK-090 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Listados incluyen paginación.
* Montos salen como string decimal.
* No retorna entidades internas directamente.
* No retorna fileId si no es necesario.

---

# 18. Fase 12 — OpenAPI

## TASK-091 — Documentar Payments API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Permisos documentados.
* Errores documentados.
* Idempotencia documentada.
* Ejemplos incluidos.

---

## TASK-092 — Documentar Payment Receipts API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* File upload documentado.
* Private file access documentado.
* Tipos permitidos documentados.
* Errores documentados.

---

## TASK-093 — Documentar Payment Allocations API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Reglas de asignación documentadas.
* Reverso de allocation documentado.
* Errores documentados.

---

## TASK-094 — Documentar Own Payments API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints `/api/v1/me/payments` documentados.
* Permisos `.own` documentados.
* `x-own-resource-policy` incluido.
* Errores `OWN_PERSON_NOT_LINKED` y `OWN_PAYMENT_NOT_FOUND` documentados.

---

## TASK-095 — Agregar extensiones OpenAPI financieras

**Estado:** `[ ] Pending`

### Ejemplos

```yaml id="ggxxex"
x-required-permission: payments.create
x-audit-event: payment.created
x-tenant-scope: tenant
x-financial-operation: true
```

```yaml id="kl69ey"
x-required-permission: paymentReceipts.download
x-audit-event: paymentReceipt.downloaded
x-tenant-scope: tenant
x-private-file-access: true
```

```yaml id="ojl2tz"
x-required-permission: payments.read.own
x-own-resource-policy: true
x-tenant-scope: tenant
```

```yaml id="zq0w5m"
x-idempotent-operation: true
x-idempotency-header: Idempotency-Key
```

### Criterios de aceptación

* Endpoints privados tienen `security`.
* Endpoints tienen permiso requerido.
* Endpoints auditables tienen evento.
* Endpoints financieros tienen flag.
* Endpoints idempotentes tienen flag.
* Endpoints de comprobantes tienen flag de archivo privado.
* Endpoints `.own` tienen policy.

---

# 19. Fase 13 — Pruebas unitarias

## TASK-096 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text id="zzpv3k"
money.vo.spec.ts
payment-status.vo.spec.ts
payment-method-type.vo.spec.ts
payment-reference.vo.spec.ts
payment-idempotency-key.vo.spec.ts
payment-receipt-file.vo.spec.ts
allocation-amount.vo.spec.ts
payment-reversal-reason.vo.spec.ts
```

### Criterios de aceptación

* Cubren casos `UT-*`.
* Cubren precisión decimal.
* Cubren comprobantes.
* Cubren idempotencia.
* Pasan en CI.

---

## TASK-097 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Archivos

```text id="p6mpun"
payment.entity.spec.ts
payment-receipt.entity.spec.ts
payment-allocation.entity.spec.ts
payment-reversal.entity.spec.ts
```

### Criterios de aceptación

* Cubren creación.
* Cubren confirmación.
* Cubren rechazo.
* Cubren asignación.
* Cubren reverso.
* Cubren comprobantes.
* Cubren errores de dominio.

---

# 20. Fase 14 — Pruebas de aplicación

## TASK-098 — Implementar tests de policies de pagos

**Estado:** `[ ] Pending`

### Policies

```text id="nqwidc"
PaymentPolicyService
PaymentValidationService
PaymentReceiptPolicyService
OwnPaymentPolicyService
```

### Criterios de aceptación

* Valida estados.
* Valida confirmación.
* Valida rechazo.
* Valida permisos.
* Valida acceso propio.
* Rechaza cross-tenant.
* Rechaza comprobantes ajenos.

---

## TASK-099 — Implementar tests de asignación

**Estado:** `[ ] Pending`

### Servicios

```text id="jp7usq"
PaymentAllocationService
PaymentAutoAllocationService
PaymentEffectiveAmountService
```

### Criterios de aceptación

* Valida monto disponible.
* Valida saldo de cargo.
* Valida misma unidad.
* Valida mismo tenant.
* Actualiza Payment.
* Actualiza Charge vía puerto.
* Conserva excedente.

---

## TASK-100 — Implementar tests de reversos

**Estado:** `[ ] Pending`

### Servicios

```text id="wqhgyg"
PaymentReversalService
ReversePaymentAllocationUseCase
```

### Criterios de aceptación

* Reversa pago.
* Reversa allocations activas.
* Reversa allocation individual.
* Recalcula Payment.
* Recalcula Charge.
* No elimina registros.
* Requiere motivo.

---

## TASK-101 — Implementar tests de idempotencia

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Misma key no duplica.
* Misma key y payload distinto produce conflicto.
* Tenant distinto permite misma key externa.
* Reintento seguro.
* Concurrencia no duplica.

---

## TASK-102 — Implementar tests de comprobantes y storage

**Estado:** `[ ] Pending`

### Servicios

```text id="inym1r"
PaymentReceiptSecurityService
PaymentReceiptPolicyService
PrivateFileStoragePort
```

### Criterios de aceptación

* Valida archivos permitidos.
* Bloquea archivos no permitidos.
* Bloquea archivos grandes.
* Usa storage privado.
* Genera URL temporal.
* No genera URL pública permanente.

---

## TASK-103 — Implementar tests de use cases principales

**Estado:** `[ ] Pending`

### Use cases

```text id="r62qj8"
CreatePaymentUseCase
ReportOwnPaymentUseCase
ConfirmPaymentUseCase
RejectPaymentUseCase
AllocatePaymentUseCase
AutoAllocatePaymentUseCase
ReversePaymentUseCase
UploadPaymentReceiptUseCase
DownloadPaymentReceiptUseCase
ReversePaymentAllocationUseCase
GetMyPaymentsUseCase
```

### Criterios de aceptación

* Caminos felices.
* Caminos inválidos.
* Auditoría.
* Eventos.
* Validaciones tenant.
* Validaciones financieras.
* Validaciones de comprobantes.

---

# 21. Fase 15 — Pruebas de integración

## TASK-104 — Implementar migration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tablas creadas.
* Enums creados.
* `tenant_id` obligatorio.
* `property_unit_id` obligatorio.
* Decimal en montos.
* Unique constraints.
* Idempotency unique.
* Reversal unique.
* onDelete Restrict.
* No cascade delete peligroso.
* Constraints de montos y receipt evidence.

---

## TASK-105 — Implementar repository integration tests

**Estado:** `[ ] Pending`

### Repositorios

```text id="ilp1j4"
PaymentRepository
PaymentReceiptRepository
PaymentAllocationRepository
PaymentReversalRepository
```

### Criterios de aceptación

* CRUD controlado.
* Queries por tenant.
* Búsquedas críticas.
* Constraints.
* Errores mapeados.
* No eliminación física.
* Sumas de allocations correctas.

---

## TASK-106 — Implementar storage integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Fake storage funciona.
* MinIO local funciona si está disponible.
* URL temporal funciona.
* Archivo inexistente produce error.
* No hay URL pública permanente.
* Metadata segura.

---

## TASK-107 — Implementar seed integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Seeds idempotentes.
* Seeds crean pagos demo.
* Seeds crean receipts demo metadata.
* Seeds crean allocations demo opcionales.
* Seeds no crean conciliación.
* Seeds no crean estados de cuenta.
* Seeds no usan datos reales.

---

# 22. Fase 16 — Pruebas API

## TASK-108 — Implementar API tests de Payments

**Estado:** `[ ] Pending`

### Archivo

```text id="a3l5t4"
payments.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Crear.
* Consultar.
* Confirmar.
* Rechazar.
* Asignar.
* Autoasignar.
* Reversar.
* Idempotencia.
* Cross-tenant.
* Sin permiso.
* Validaciones de monto y método.

---

## TASK-109 — Implementar API tests de Payment Receipts

**Estado:** `[ ] Pending`

### Archivo

```text id="fg5sla"
payment-receipts.api.spec.ts
```

### Criterios de aceptación

* Listar receipts.
* Subir comprobante.
* Consultar comprobante.
* Descargar comprobante.
* Aceptar comprobante.
* Rechazar comprobante.
* Archivo inválido.
* Archivo grande.
* Receipt cross-tenant.
* Sin permiso.

---

## TASK-110 — Implementar API tests de Payment Allocations

**Estado:** `[ ] Pending`

### Archivo

```text id="ygq95f"
payment-allocations.api.spec.ts
```

### Criterios de aceptación

* Listar allocations.
* Consultar allocation.
* Reversar allocation.
* Monto excede pago.
* Monto excede cargo.
* Cargo de otro tenant.
* Cargo de otra unidad.
* Allocation ya reversada.

---

## TASK-111 — Implementar API tests de Own Payments

**Estado:** `[ ] Pending`

### Archivo

```text id="uq4dzu"
own-payments.api.spec.ts
```

### Criterios de aceptación

* `/me/payments`.
* `/me/payments/:paymentId`.
* Reportar pago propio.
* Subir comprobante propio.
* Descargar comprobante propio.
* Usuario sin Person.
* Usuario no ve pago ajeno.
* Usuario no descarga receipt ajeno.
* Usuario no ve pagos de otro tenant.

---

# 23. Fase 17 — Authorization, own access y multitenancy

## TASK-112 — Implementar authorization tests de pagos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token → 401.
* Sin membership → 403.
* Sin permiso → 403.
* Tenant suspendido → 403.
* Disabled user → 403.
* TenantAdmin/Treasurer autorizado → 200/201.
* TenantAuditor solo lectura.
* Resident/Owner solo `.own`.

---

## TASK-113 — Implementar separation-of-duties tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usuario con `payments.read` no puede confirmar.
* Usuario con `payments.confirm` no puede reversar.
* Usuario con `payments.create.own` no puede confirmar.
* Usuario con `paymentReceipts.download` no puede review.
* TenantAuditor no modifica pagos.

---

## TASK-114 — Implementar own access tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Propietario ve pagos propios.
* Residente ve pagos propios si política lo permite.
* Usuario sin Person no accede.
* Usuario no ve unidad ajena.
* Usuario no ve pagos de otro tenant.
* Usuario no descarga comprobante ajeno.
* Relación ended no otorga acceso operativo.

---

## TASK-115 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant A no lista pagos B.
* Tenant A no consulta pago B.
* Tenant A no crea pago para unidad B.
* Tenant A no asigna pago a cargo B.
* Tenant A no descarga receipt B.
* Tenant A no consulta allocation B.
* Tenant A no reversa payment/allocation B.
* Own payments no mezclan tenants.

---

# 24. Fase 18 — Pruebas financieras especiales

## TASK-116 — Implementar money precision tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Decimal exacto.
* Montos como string.
* No float.
* allocatedAmount correcto.
* unallocatedAmount correcto.
* Currency USD obligatoria.

---

## TASK-117 — Implementar idempotency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Crear pago con key única.
* Repetir key con mismo payload no duplica.
* Repetir key con payload distinto falla.
* Reintento seguro.
* Concurrencia con misma key crea un solo pago.

---

## TASK-118 — Implementar allocation consistency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Asignación no excede pago.
* Asignación no excede cargo.
* Pago y cargo misma unidad.
* Pago parcial.
* Pago completo.
* Un pago a múltiples cargos.
* Múltiples pagos a un cargo.
* Excedente conservado.
* Estados de Payment correctos.
* Estados de Charge actualizados vía puerto.

---

## TASK-119 — Implementar payment reversal financial tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Reverso de pago conserva Payment.amount.
* Reverso marca Payment reversed.
* Reverso revierte allocations activas.
* Reverso recalcula cargos.
* Reverso único por pago.
* No elimina registros.

---

## TASK-120 — Implementar receipt security tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* PDF/JPG/PNG válidos.
* EXE/HTML/SVG no permitidos si no están en whitelist.
* Tamaño máximo.
* Filename sanitizado.
* Path traversal bloqueado.
* URL temporal.
* Receipt ajeno bloqueado.
* Receipt de otro tenant bloqueado.

---

## TASK-121 — Implementar concurrency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Dos pagos con misma idempotency key no duplican.
* Dos confirmaciones simultáneas son consistentes.
* Dos rechazos simultáneos son consistentes.
* Dos asignaciones simultáneas no exceden pago.
* Dos asignaciones simultáneas no exceden cargo.
* Reverso y asignación simultánea mantienen consistencia.
* Dos reversos simultáneos resuelven uno solo.

---

## TASK-122 — Implementar financial regression tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Pago confirmado sin allocations.
* Pago partiallyAllocated.
* Pago allocated.
* Pago rejected sin allocations activas.
* Pago reversed sin efecto en saldos.
* Reverso de allocation recupera saldo.
* Reverso de pago recupera cargos.
* Estado de cuenta futuro reconstruible.
* No hay eliminación física.

---

# 25. Fase 19 — Seguridad y privacidad

## TASK-123 — Implementar security tests de payload

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Strings largos rechazados.
* IDs malformados rechazados.
* Scripts tratados según política.
* SQL-like search seguro.
* `tenantId` en body rechazado.
* amount inválido rechazado.
* currency no soportada rechazada.
* method no soportado rechazado.

---

## TASK-124 — Implementar financial safety tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No existe DELETE de pagos.
* Rechazar no elimina pago.
* Reversar no elimina pago.
* Reversar allocation no elimina.
* Payment.amount no cambia.
* Usuario sin permiso no confirma.
* Usuario sin permiso no reversa.
* Error no expone stack trace.

---

## TASK-125 — Implementar logging security tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No Authorization header.
* No access token.
* No payload completo.
* No contenido de comprobantes.
* No datos bancarios completos.
* No datos personales innecesarios.
* Métricas sin transactionReference como label.
* Métricas sin fileId como label.

---

# 26. Fase 20 — Auditoría, eventos y observabilidad

## TASK-126 — Validar auditoría financiera

**Estado:** `[ ] Pending`

### Eventos auditables

```text id="ihfuf8"
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

### Criterios de aceptación

* Cada operación crítica genera auditoría.
* Auditoría incluye `tenantId`, `actorUserId`, `traceId`.
* Auditoría incluye referencias financieras.
* Auditoría no incluye payload completo.
* Auditoría no incluye contenido de comprobantes.

---

## TASK-127 — Validar eventos financieros

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Eventos principales emitidos.
* Incluyen `tenantId`.
* Incluyen `traceId`.
* Incluyen referencias financieras.
* No incluyen contenido de comprobantes.
* No incluyen datos bancarios.
* No incluyen tokens.

---

## TASK-128 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs incluyen `traceId`.
* Logs incluyen `tenantId`.
* Logs incluyen `actorUserId`.
* Logs incluyen errorCode si aplica.
* Logs están sanitizados.
* Logs de asignación incluyen paymentId y chargeId.
* Logs de comprobantes no incluyen contenido de archivo.

---

## TASK-129 — Agregar métricas financieras básicas

**Estado:** `[ ] Pending`

### Métricas

```text id="dpe3bd"
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

### Criterios de aceptación

* Métricas incrementan.
* No usan datos personales como labels.
* No usan transactionReference como label.
* No usan fileId como label.
* No usan propertyUnitId como label de alta cardinalidad.
* No exponen montos como labels.

---

# 27. Fase 21 — CI/CD y smoke tests

## TASK-130 — Agregar comandos de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="ybx8dx"
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

### Criterios de aceptación

* Scripts disponibles o equivalentes.
* Corren localmente.
* Documentados en package scripts.

---

## TASK-131 — Agregar validaciones al pipeline CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="mt7zd7"
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
receipt security tests
financial regression tests críticos
security tests críticos
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay pagos duplicados.
* Pipeline falla si se usa float.
* Pipeline falla si `.own` está mal implementado.
* Pipeline falla si cross-tenant pasa.
* Pipeline falla si se exponen comprobantes.
* Pipeline falla si OpenAPI no coincide.

---

## TASK-132 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="a4c2al"
GET /api/v1/health
GET /api/v1/tenant/payments sin token
GET /api/v1/me/payments sin token
GET /api/v1/tenant/payments con usuario autorizado
GET /api/v1/tenant/payments con usuario sin permiso
```

### Criterios de aceptación

* Smoke tests pasan en dev/staging.
* No crean pagos reales.
* No confirman pagos reales.
* No asignan pagos reales.
* No descargan comprobantes reales.
* No reversan pagos reales.
* Errores incluyen traceId.

---

# 28. Fase 22 — Revisión SDD

## TASK-133 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas asociadas.
* Cada endpoint tiene API tests.
* Cada endpoint privado tiene authorization tests.
* Cada endpoint `.own` tiene own access tests.
* Cada operación tenant-scoped tiene multitenancy tests.
* Cada operación financiera crítica tiene auditoría.
* Cada regla monetaria tiene tests.
* Cada regla de comprobantes tiene tests.

---

## TASK-134 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="fiw768"
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* No contradice multitenancy.
* No usa float.
* No elimina físicamente pagos.
* No omite autorización.
* No omite auditoría.
* No expone comprobantes.
* No omite pruebas financieras.
* No expone datos personales en logs.

---

## TASK-135 — Actualizar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Contrato coincide con `api-contract.md`.
* Endpoints privados tienen security.
* Permisos documentados.
* Errores documentados.
* Endpoints `.own` documentados.
* File upload documentado.
* Private file access documentado.
* Operaciones financieras marcadas.
* Idempotencia documentada.
* Montos como string decimal.

---

## TASK-136 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos esperados

```bash id="iz2bh9"
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

### Criterios de aceptación

* Todo pasa.
* No hay tests omitidos sin justificación.
* No hay warnings críticos.
* No hay datos reales en fixtures.
* No hay operaciones financieras fuera de alcance.

---

## TASK-137 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="v68b0m"
- PR link o commit SHA.
- Migración aplicada.
- Prisma Client generado.
- Seeds ejecutados.
- Storage fake o MinIO validado.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 29. Fase 23 — Pendientes diferidos controlados

## TASK-138 — Diferir conciliación bancaria

**Estado:** `[-] Deferred`

### Razón

Requiere movimientos bancarios, reglas de matching, cuentas bancarias y conciliaciones.

### Implementación futura

```text id="rswheu"
docs/specs/00X-bank-reconciliation/
```

---

## TASK-139 — Diferir importación de movimientos bancarios

**Estado:** `[-] Deferred`

### Razón

Requiere carga de archivos, parsing, reglas de validación y trazabilidad batch.

### Implementación futura

```text id="x57spr"
docs/specs/00X-bank-movements-import/
```

---

## TASK-140 — Diferir pasarela de pagos

**Estado:** `[-] Deferred`

### Razón

Requiere proveedor, callbacks, webhooks, seguridad, antifraude e idempotencia externa.

### Implementación futura

```text id="achczy"
docs/specs/00X-payment-gateway/
```

---

## TASK-141 — Diferir pagos con tarjeta y tokenización

**Estado:** `[-] Deferred`

### Razón

Requiere cumplimiento de seguridad más alto y proveedor especializado.

### Implementación futura

```text id="gxyb66"
docs/specs/00X-card-payments/
```

---

## TASK-142 — Diferir facturación electrónica

**Estado:** `[-] Deferred`

### Razón

Requiere integración tributaria, comprobantes autorizados y reglas legales específicas.

### Implementación futura

```text id="p4zhph"
docs/specs/00X-electronic-invoicing/
```

---

## TASK-143 — Diferir contabilidad completa

**Estado:** `[-] Deferred`

### Razón

Requiere plan de cuentas, asientos contables, periodos contables y cierre contable.

### Implementación futura

```text id="tckuum"
docs/specs/00X-accounting/
```

---

## TASK-144 — Diferir OCR de comprobantes

**Estado:** `[-] Deferred`

### Razón

Requiere procesamiento documental, validación, privacidad y control de errores.

### Implementación futura

```text id="rit9px"
docs/specs/00X-receipt-ocr/
```

---

## TASK-145 — Diferir IA para validación automática

**Estado:** `[-] Deferred`

### Razón

Requiere política de privacidad, anonimización, evaluación de riesgo y trazabilidad.

### Implementación futura

```text id="e6goyz"
docs/specs/00X-ai-payment-validation/
```

---

## TASK-146 — Diferir aprobación dual avanzada

**Estado:** `[-] Deferred`

### Razón

Requiere workflow de aprobación, estados intermedios, autorizadores y políticas por monto.

### Implementación futura

```text id="qp25l0"
docs/specs/00X-financial-approvals/
```

---

## TASK-147 — Diferir notificaciones automáticas

**Estado:** `[-] Deferred`

### Razón

Requiere módulo de comunicaciones, templates y canales.

### Implementación futura

```text id="d0t6ke"
docs/specs/009-notifications/
```

---

## TASK-148 — Diferir cobranza automatizada

**Estado:** `[-] Deferred`

### Razón

Requiere estados de cuenta, mora, reglas de comunicación y políticas de cobranza.

### Implementación futura

```text id="fl89jx"
docs/specs/00X-collections/
```

---

## TASK-149 — Diferir carga masiva de pagos

**Estado:** `[-] Deferred`

### Razón

Requiere módulo de archivos, validación batch, rollback parcial y seguridad documental.

### Implementación futura

```text id="ztc68j"
docs/specs/00X-bulk-payment-imports/
```

---

# 30. Definition of Done del módulo

El módulo `005-payments` estará terminado cuando:

```text id="m7l64k"
[ ] Documentación spec completa.
[ ] Modelo Prisma implementado.
[ ] Migración creada y validada.
[ ] SQL constraints revisadas.
[ ] Seeds demo creados.
[ ] Módulo NestJS creado.
[ ] DTOs implementados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Repositorios implementados.
[ ] Puertos hacia PropertyUnit implementados.
[ ] Puertos hacia Charges implementados.
[ ] Puerto de storage privado implementado.
[ ] Adaptador fake de storage implementado.
[ ] Adaptador MinIO/S3 implementado o diferido explícitamente.
[ ] Servicios/policies implementados.
[ ] Use cases implementados.
[ ] Controladores implementados.
[ ] Endpoints administrativos protegidos.
[ ] Endpoints .own protegidos.
[ ] Money usa Decimal.
[ ] No se usa float.
[ ] Payment implementado.
[ ] PaymentReceipt implementado.
[ ] PaymentAllocation implementado.
[ ] PaymentReversal implementado.
[ ] Creación de pagos administrativos implementada.
[ ] Reporte de pagos propios implementado.
[ ] Confirmación de pagos implementada.
[ ] Rechazo de pagos implementado.
[ ] Carga de comprobantes implementada.
[ ] Descarga controlada de comprobantes implementada.
[ ] Asignación manual implementada.
[ ] Autoasignación implementada.
[ ] Reverso de pago implementado.
[ ] Reverso de allocation implementado.
[ ] No hay pagos duplicados.
[ ] No hay acceso cross-tenant.
[ ] Own payments solo devuelve pagos propios.
[ ] Own receipts solo descarga comprobantes propios.
[ ] No se elimina físicamente ningún pago.
[ ] Payment.amount es inmutable.
[ ] allocatedAmount se recalcula correctamente.
[ ] unallocatedAmount se recalcula correctamente.
[ ] Asignación no excede pago.
[ ] Asignación no excede cargo.
[ ] Pago y cargo pertenecen a la misma unidad en MVP.
[ ] Comprobantes se almacenan de forma privada.
[ ] URLs de comprobantes son temporales o stream controlado.
[ ] Auditoría financiera implementada.
[ ] Eventos financieros implementados.
[ ] Logs sanitizados.
[ ] Métricas básicas implementadas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Application tests pasan.
[ ] Integration tests pasan.
[ ] Storage tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own access tests pasan.
[ ] Multitenancy tests pasan.
[ ] Money precision tests pasan.
[ ] Idempotency tests pasan.
[ ] Allocation consistency tests pasan.
[ ] Receipt security tests pasan.
[ ] Financial regression tests pasan.
[ ] Security tests pasan.
[ ] CI pasa.
[ ] Smoke tests pasan.
[ ] Pendientes diferidos documentados.
```

---

## 31. Orden recomendado de ejecución

```text id="jcat8n"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-011      Estructura base
3. TASK-012 a TASK-020      Value objects
4. TASK-021 a TASK-026      Entidades, errores y eventos
5. TASK-027 a TASK-030      DTOs
6. TASK-031 a TASK-044      Prisma, migración y seeds
7. TASK-045 a TASK-056      Puertos y adaptadores
8. TASK-057 a TASK-067      Servicios y policies
9. TASK-068 a TASK-078      Use cases
10. TASK-079 a TASK-083     Guards, policies y decorators
11. TASK-084 a TASK-087     Controladores
12. TASK-088 a TASK-090     Errores y respuestas
13. TASK-091 a TASK-095     OpenAPI
14. TASK-096 a TASK-125     Pruebas
15. TASK-126 a TASK-129     Auditoría, eventos y observabilidad
16. TASK-130 a TASK-132     CI/CD y smoke tests
17. TASK-133 a TASK-137     Revisión SDD
```

---

## 32. Riesgos de ejecución

| Riesgo                                    | Impacto | Mitigación                      |
| ----------------------------------------- | ------- | ------------------------------- |
| Crear pago para unidad de otro tenant     | Crítico | tenant validation + MT tests    |
| Asignar pago a cargo de otro tenant       | Crítico | ChargeReaderPort + MT tests     |
| Asignar pago a cargo de otra unidad       | Alto    | unit consistency policy         |
| Duplicar pagos                            | Alto    | idempotency key + tests         |
| Usar float                                | Alto    | Money VO + Decimal              |
| Exponer comprobantes                      | Alto    | private storage + URL temporal  |
| Confirmar sin permiso                     | Crítico | TenantPermissionGuard           |
| Reversar sin permiso                      | Crítico | permission + audit              |
| Asignar más de lo pagado                  | Crítico | PaymentAllocationService        |
| Asignar más del saldo del cargo           | Crítico | ChargeReaderPort                |
| Eliminar pago                             | Crítico | no DELETE + Restrict            |
| Falta de auditoría                        | Crítico | PaymentsAuditPort               |
| Estado de cargo inconsistente             | Alto    | ChargePaymentWriterPort + tests |
| Implementar conciliación fuera de alcance | Medio   | SDD review                      |

---

## 33. Checklist para revisión de PR

Antes de aprobar el PR de `005-payments`:

```text id="r5rius"
[ ] La implementación sigue spec.md.
[ ] No se implementó funcionalidad fuera de alcance.
[ ] No se implementó conciliación bancaria.
[ ] No se implementó pasarela de pagos.
[ ] No se implementó facturación electrónica.
[ ] No se implementaron estados de cuenta consolidados.
[ ] Prisma schema coincide con data-model.md.
[ ] Migración revisada.
[ ] SQL constraints revisadas.
[ ] No hay cascade delete peligroso.
[ ] tenantId es obligatorio en todas las tablas.
[ ] propertyUnitId es obligatorio en Payment.
[ ] Montos usan Decimal.
[ ] No hay float ni double para dinero.
[ ] Endpoints coinciden con api-contract.md.
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints tenant tienen TenantGuard.
[ ] Endpoints financieros tienen TenantPermissionGuard.
[ ] Endpoints .own validan OwnPaymentPolicyService.
[ ] Payments no se mezclan entre tenants.
[ ] PaymentReceipts no se mezclan entre tenants.
[ ] PaymentAllocations no se mezclan entre tenants.
[ ] PaymentReversals no se mezclan entre tenants.
[ ] Pagos no se duplican con idempotency key.
[ ] Payment.amount no se modifica.
[ ] allocatedAmount se recalcula correctamente.
[ ] unallocatedAmount se recalcula correctamente.
[ ] No se asigna más del pago.
[ ] No se asigna más del cargo.
[ ] No se asigna pago a cargo de otra unidad en MVP.
[ ] Payment rejected no se asigna.
[ ] Payment reversed no se asigna.
[ ] Reverso de pago revierte allocations.
[ ] Reverso de allocation recalcula Payment.
[ ] Reverso de allocation recalcula Charge.
[ ] Comprobantes usan storage privado.
[ ] No hay URL pública permanente.
[ ] File upload valida tipo y tamaño.
[ ] Usuario .own no ve pagos ajenos.
[ ] Usuario .own no descarga receipts ajenos.
[ ] Logs no contienen payload completo.
[ ] Logs no contienen contenido de comprobantes.
[ ] Logs no contienen datos bancarios completos.
[ ] Métricas no tienen labels de alta cardinalidad.
[ ] Cambios financieros generan auditoría.
[ ] Eventos financieros se emiten.
[ ] OpenAPI actualizado.
[ ] Tests pasan.
[ ] CI pasa.
[ ] No hay secrets.
[ ] No hay datos reales en seeds.
[ ] Pendientes diferidos documentados.
```

---

## 34. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá implementado el módulo de pagos:

```text id="fng1q6"
- pagos administrativos;
- pagos reportados por propietarios/residentes;
- comprobantes de pago privados;
- confirmación de pagos;
- rechazo de pagos;
- asignación de pagos a cargos;
- autoasignación de pagos;
- pagos parciales;
- pagos excedentes;
- reversos de pagos;
- reversos de asignaciones;
- consulta administrativa;
- consulta propia;
- auditoría financiera;
- eventos financieros;
- pruebas financieras.
```

Este módulo habilita el inicio de:

```text id="xmml9n"
docs/specs/006-account-statements/
```

pero antes debe completarse:

```text id="r7ynxr"
docs/specs/005-payments/security-notes.md
```
