# Security Notes — Spec 005 Payments, Receipts and Payment Allocation

## 1. Información del documento

| Campo           | Valor                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                 |
| Spec ID         | 005                                                                           |
| Módulo          | Payments                                                                      |
| Documento       | Security Notes                                                                |
| Ruta            | `docs/specs/005-payments/security-notes.md`                                   |
| Versión         | 0.1                                                                           |
| Estado          | Borrador inicial                                                              |
| Fecha           | 2026-07-14                                                                    |
| Documento base  | `docs/specs/005-payments/spec.md`                                             |
| Plan técnico    | `docs/specs/005-payments/plan.md`                                             |
| Modelo de datos | `docs/specs/005-payments/data-model.md`                                       |
| Contrato API    | `docs/specs/005-payments/api-contract.md`                                     |
| Plan de pruebas | `docs/specs/005-payments/test-plan.md`                                        |
| Tareas          | `docs/specs/005-payments/tasks.md`                                            |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `005-payments`.

El módulo administra información financiera altamente sensible:

* pagos administrativos;
* pagos reportados por propietarios o residentes;
* comprobantes;
* referencias de transacción;
* métodos de pago;
* confirmaciones;
* rechazos;
* asignaciones de pagos a cargos;
* pagos parciales;
* pagos excedentes;
* reversos de pagos;
* reversos de asignaciones;
* descargas de comprobantes;
* auditoría financiera.

Regla principal:

```text id="kgc594"
Un pago mal registrado, mal asignado, duplicado, expuesto, reversado indebidamente o visible por un usuario no autorizado puede alterar estados de cuenta, saldos, reportes, conciliaciones y confianza financiera del conjunto residencial.
```

---

## 3. Principios de seguridad financiera

### 3.1. Tenant como frontera obligatoria

Todo recurso de pagos debe pertenecer a un tenant.

Aplica a:

```text id="lb0cmz"
Payment
PaymentReceipt
PaymentAllocation
PaymentReversal
```

Regla:

```text id="fh4hqa"
Ninguna operación de pagos puede ejecutarse sin validar tenantId.
```

---

### 3.2. Unidad habitacional como base del pago

Todo pago debe estar asociado a una unidad habitacional.

Regla:

```text id="q8g5o2"
Payment.propertyUnitId es obligatorio.
```

La unidad debe pertenecer al mismo tenant que el pago.

---

### 3.3. Cargo como destino de asignación

Toda asignación debe relacionar un pago con un cargo válido.

Regla:

```text id="bi1n2w"
PaymentAllocation.paymentId y PaymentAllocation.chargeId deben pertenecer al mismo tenant.
```

En MVP:

```text id="cz0pec"
Payment.propertyUnitId == Charge.propertyUnitId
```

---

### 3.4. Precisión monetaria obligatoria

Todos los montos deben manejarse con Decimal.

Prohibido:

```text id="yir9og"
float
double
number sin control decimal para dinero
```

Regla:

```text id="g7g2pu"
El dinero se representa con Decimal y se expone por API como string decimal.
```

Ejemplo:

```json id="wzuj8p"
{
  "amount": "100.00",
  "allocatedAmount": "50.00",
  "unallocatedAmount": "50.00",
  "currency": "USD"
}
```

---

### 3.5. Idempotencia obligatoria en creación de pagos

La creación de pagos debe soportar idempotencia para evitar duplicados.

Regla:

```text id="p85er6"
Reintentar el mismo registro de pago no debe crear pagos duplicados.
```

---

### 3.6. No eliminación física

No se debe eliminar físicamente:

```text id="lfqn1b"
payments
payment_receipts
payment_allocations
payment_reversals
```

Usar estados y acciones controladas:

```text id="wcg9zd"
reject
cancel
reverse
archive
reverse allocation
```

---

### 3.7. Monto original inmutable

El monto original del pago debe conservarse.

Regla:

```text id="p56xfm"
Payment.amount no se sobrescribe.
```

Cambios operativos deben reflejarse mediante:

```text id="ifqg1b"
allocatedAmount
unallocatedAmount
PaymentAllocation
PaymentReversal
status
audit logs
```

---

### 3.8. Comprobantes privados

Los comprobantes no deben exponerse públicamente.

Regla:

```text id="lbnzc9"
Un PaymentReceipt nunca debe contener ni exponer una URL pública permanente.
```

La descarga debe hacerse mediante:

```text id="kvi6gk"
stream controlado
URL firmada temporal
validación previa de permisos
auditoría según política
```

---

### 3.9. Auditoría financiera obligatoria

Toda operación crítica debe auditarse.

Ejemplos:

```text id="skn4a8"
crear pago
reportar pago propio
confirmar pago
rechazar pago
asignar pago
autoasignar pago
reversar pago
reversar asignación
subir comprobante
descargar comprobante
aceptar comprobante
rechazar comprobante
```

---

### 3.10. Separación de funciones

Un permiso financiero no implica otro.

Ejemplos:

```text id="bzfejj"
payments.read ≠ payments.confirm
payments.confirm ≠ payments.reverse
payments.create.own ≠ payments.confirm
paymentReceipts.download ≠ paymentReceipts.review
payments.allocate ≠ payments.reverse
```

---

## 4. Activos protegidos

Activos directos:

```text id="lh31s4"
payments
payment_receipts
payment_allocations
payment_reversals
idempotency_keys
transaction_references
private_file_ids
payment_audit_events
payment_domain_events
```

Activos indirectos:

```text id="ed78q8"
charges
account_statements
balances
late_fees
financial_reports
bank_movements
reconciliations
notifications
audit_logs
```

Activos de storage:

```text id="hlpv25"
receipt files
signed download URLs
storage object keys
storage credentials
file metadata
```

---

## 5. Datos sensibles del módulo

### 5.1. Datos financieros

El módulo puede almacenar:

```text id="p3ehhn"
amount
allocatedAmount
unallocatedAmount
payment method
paidAt
transactionReference
externalReference
payment status
allocation amount
reversal reason
rejection reason
receipt status
```

---

### 5.2. Datos indirectamente personales

Aunque el pago no duplique datos personales, revela información por relación:

```text id="x12f3p"
Payment → PropertyUnit
PropertyUnit → Owner
PropertyUnit → Resident
Payment → Charge
Payment → Receipt
```

Esto puede revelar:

* comportamiento de pago;
* obligaciones económicas;
* deudas;
* historial financiero;
* comprobantes;
* unidad habitacional asociada;
* relaciones entre residentes, propietarios y pagos.

---

### 5.3. Datos que no deben almacenarse en esta spec

No almacenar en `005-payments`:

```text id="ywa2uc"
números completos de cuentas bancarias
números de tarjeta
CVV
tokens de tarjeta
credenciales bancarias
claves de banca en línea
datos biométricos
facturas electrónicas autorizadas
asientos contables
movimientos bancarios importados
datos de conciliación bancaria
OCR completo de comprobantes
resultado IA de validación automática
```

Estos pertenecen a specs posteriores o no deben almacenarse en absoluto.

---

## 6. Superficies de ataque

### 6.1. Payments API administrativa

Ruta:

```text id="gef34f"
/api/v1/tenant/payments
```

Riesgos:

* crear pagos falsos;
* crear pagos duplicados;
* crear pagos para unidad de otro tenant;
* crear pagos con moneda inválida;
* registrar pagos con monto incorrecto;
* manipular referencias;
* confirmar pagos sin comprobante;
* rechazar pagos sin motivo;
* reversar pagos sin permiso;
* consultar pagos de otro tenant.

---

### 6.2. Own Payments API

Ruta:

```text id="zte6b3"
/api/v1/me/payments
```

Riesgos:

* propietario ve pagos de unidad ajena;
* residente reporta pago de unidad ajena;
* usuario sin persona vinculada reporta pagos;
* usuario de Tenant A consulta pagos de Tenant B;
* enumeración de payment IDs;
* exposición de estados financieros personales;
* abuso de carga de comprobantes.

---

### 6.3. Payment Receipts API

Rutas:

```text id="c4itx3"
/api/v1/tenant/payments/{paymentId}/receipts
/api/v1/tenant/payment-receipts/{receiptId}
/api/v1/me/payment-receipts/{receiptId}/download
```

Riesgos:

* subir archivo malicioso;
* subir archivo demasiado grande;
* path traversal en nombres de archivo;
* MIME spoofing;
* exponer comprobantes privados;
* descargar comprobante ajeno;
* descargar comprobante de otro tenant;
* registrar URLs permanentes;
* registrar contenido del archivo en logs.

---

### 6.4. Payment Allocations API

Rutas:

```text id="ahyhj2"
/api/v1/tenant/payments/{paymentId}/allocate
/api/v1/tenant/payments/{paymentId}/auto-allocate
/api/v1/tenant/payment-allocations/{allocationId}/reverse
```

Riesgos:

* asignar pago a cargo de otro tenant;
* asignar pago a cargo de otra unidad;
* asignar más del monto disponible;
* asignar más del saldo del cargo;
* asignar pago pendiente o rechazado;
* generar saldos inconsistentes;
* reversar asignaciones sin permiso;
* carrera concurrente que sobreasigna pagos o cargos.

---

### 6.5. Payment Reversal API

Ruta:

```text id="d4cxpu"
/api/v1/tenant/payments/{paymentId}/reverse
```

Riesgos:

* reversar pago sin permiso;
* reversar pago dos veces;
* no revertir allocations activas;
* no recalcular cargos afectados;
* reversar pago de otro tenant;
* omitir auditoría;
* destruir historia.

---

## 7. Amenazas principales

## 7.1. Cross-tenant payment access

### Descripción

Un usuario de Tenant A accede, crea, confirma, asigna, reversa o descarga pagos de Tenant B.

### Impacto

Crítico.

### Controles

* `tenantId` obligatorio;
* `AuthGuard`;
* `TenantGuard`;
* `TenantPermissionGuard`;
* validación de tenant en use cases;
* validación de tenant en repositorios;
* validación de tenant en `PropertyUnitReaderPort`;
* validación de tenant en `ChargeReaderPort`;
* validación de tenant en `PrivateFileStoragePort`;
* filtros por `tenantId`;
* pruebas multitenant.

### Pruebas asociadas

```text id="izvtp9"
MT-PAY-001 a MT-PAY-012
APP-PAY-CREATE-002
APP-ALLOC-004
API-PAY-GET-002
API-REC-GET-002
```

---

## 7.2. Payment duplication

### Descripción

El mismo pago se registra más de una vez.

### Impacto

Alto.

### Controles

* `Idempotency-Key`;
* `PaymentIdempotencyService`;
* unique constraint por tenant;
* referencia transaccional;
* validación de duplicidad sospechosa;
* pruebas de idempotencia y concurrencia.

### Pruebas asociadas

```text id="gykg4g"
IDEMP-PAY-001 a IDEMP-PAY-008
CONC-PAY-001
APP-PAY-CREATE-007
APP-PAY-CREATE-008
```

---

## 7.3. Payment allocated to wrong charge

### Descripción

Un pago se asigna a un cargo incorrecto.

### Impacto

Crítico.

### Ejemplos

```text id="bflhu2"
Pago de Casa 01 aplicado a cargo de Casa 02.
Pago de Tenant A aplicado a cargo de Tenant B.
```

### Controles

* `ChargeReaderPort`;
* validación de tenant;
* validación de unidad;
* política MVP de misma unidad;
* transacción de base de datos;
* pruebas financieras.

### Pruebas asociadas

```text id="z010f2"
APP-ALLOC-004
APP-ALLOC-005
FIN-ALLOC-006
FIN-ALLOC-007
MT-PAY-007
```

---

## 7.4. Over-allocation of payment

### Descripción

La suma de asignaciones activas excede el monto del pago.

### Impacto

Crítico.

### Controles

* `PaymentAllocationService`;
* `PaymentEffectiveAmountService`;
* transacciones;
* locks o control de concurrencia;
* sumatoria de allocations activas;
* pruebas de concurrencia.

### Pruebas asociadas

```text id="q6u7k4"
APP-ALLOC-006
FIN-ALLOC-006
CONC-PAY-004
```

---

## 7.5. Over-payment of charge

### Descripción

La suma de pagos asignados a un cargo excede su saldo pendiente.

### Impacto

Crítico.

### Controles

* `ChargeReaderPort.getChargeOutstandingAmount`;
* `ChargePaymentWriterPort`;
* transacciones;
* control de concurrencia;
* pruebas de regresión financiera.

### Pruebas asociadas

```text id="ur4zvf"
APP-ALLOC-007
FIN-ALLOC-007
CONC-PAY-005
```

---

## 7.6. Unauthorized payment confirmation

### Descripción

Un usuario sin permiso confirma pagos.

### Impacto

Crítico.

### Controles

* `payments.confirm`;
* `TenantPermissionGuard`;
* separación de funciones;
* auditoría;
* pruebas de autorización.

### Pruebas asociadas

```text id="nr87x3"
AUTH-PAY-002
AUTH-PAY-006
AUTH-PAY-SOD-001
SEC-PAY-FIN-006
```

---

## 7.7. Unauthorized reversal

### Descripción

Un usuario sin permiso reversa un pago o asignación.

### Impacto

Crítico.

### Controles

* `payments.reverse`;
* permiso específico futuro `payments.allocations.reverse`;
* `TenantPermissionGuard`;
* motivo obligatorio;
* auditoría;
* unique reversal;
* pruebas de autorización.

### Pruebas asociadas

```text id="rmtkfd"
AUTH-PAY-005
AUTH-PAY-SOD-002
API-PAY-REV-004
SEC-PAY-FIN-007
```

---

## 7.8. Receipt exposure

### Descripción

Comprobantes privados se exponen a usuarios no autorizados.

### Impacto

Alto.

### Controles

* storage privado;
* URL firmada temporal;
* `paymentReceipts.download`;
* `paymentReceipts.download.own`;
* `OwnPaymentPolicyService`;
* no URLs públicas permanentes;
* no fileId innecesario en response;
* auditoría de descarga;
* pruebas de seguridad de recibos.

### Pruebas asociadas

```text id="qnff7r"
REC-SEC-009
REC-SEC-010
REC-SEC-011
REC-SEC-012
API-OWN-REC-DOWN-002
```

---

## 7.9. Malicious receipt upload

### Descripción

Un usuario carga archivos peligrosos como comprobante.

### Impacto

Alto.

### Controles

* whitelist de MIME types;
* validación de extensión;
* validación de tamaño;
* sanitización de nombre;
* bloqueo de path traversal;
* almacenamiento privado;
* no ejecución de archivos;
* pruebas de file security.

### Pruebas asociadas

```text id="l8lq7q"
REC-SEC-001 a REC-SEC-012
SRV-REC-SEC-001 a SRV-REC-SEC-007
```

---

## 7.10. Missing audit trail

### Descripción

Una operación financiera crítica ocurre sin auditoría.

### Impacto

Crítico.

### Controles

* `PaymentsAuditPort`;
* eventos auditables obligatorios;
* traceId;
* actorUserId;
* tenantId;
* pruebas de auditoría.

### Pruebas asociadas

```text id="kul5zn"
AUD-PAY-001 a AUD-PAY-013
TASK-126
```

---

## 7.11. Sensitive data leakage in logs

### Descripción

Logs o métricas contienen datos sensibles.

### Impacto

Alto.

### Ejemplos prohibidos:

```text id="hn5waj"
Authorization header
access token
contenido del comprobante
transactionReference como label
fileId como label
payload completo
datos bancarios completos
```

### Controles

* logging estructurado sanitizado;
* métricas sin labels sensibles;
* no loggear payload completo;
* no loggear archivos;
* pruebas de logging.

### Pruebas asociadas

```text id="fkyu43"
SEC-PAY-LOG-001 a SEC-PAY-LOG-008
OBS-PAY-008
```

---

## 8. Controles obligatorios por endpoint

## 8.1. `GET /api/v1/tenant/payments`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `payments.read`;
* filtro obligatorio por tenant;
* paginación;
* filtros validados;
* no exponer pagos de otro tenant;
* no exponer contenido de comprobantes.

---

## 8.2. `POST /api/v1/tenant/payments`

Controles:

* autenticación;
* permiso `payments.create`;
* tenant activo;
* unidad del tenant;
* monto Decimal positivo;
* moneda USD;
* método permitido;
* comprobante o referencia si aplica;
* idempotencia;
* no aceptar `tenantId`;
* no aceptar `status`;
* no aceptar `allocatedAmount`;
* auditoría `payment.created`.

---

## 8.3. `GET /api/v1/tenant/payments/{paymentId}`

Controles:

* autenticación;
* permiso `payments.read`;
* pago pertenece al tenant;
* no exponer pago cross-tenant;
* incluir receipts y allocations solo según contrato;
* no exponer URL permanente de comprobantes.

---

## 8.4. `POST /api/v1/tenant/payments/{paymentId}/confirm`

Controles:

* autenticación;
* permiso `payments.confirm`;
* pago pertenece al tenant;
* pago confirmable;
* comprobante o referencia requerida si aplica;
* no confirmar pago rechazado, reversado o cancelado;
* auditoría `payment.confirmed`.

---

## 8.5. `POST /api/v1/tenant/payments/{paymentId}/reject`

Controles:

* autenticación;
* permiso `payments.reject`;
* pago pertenece al tenant;
* pago rechazable;
* motivo obligatorio;
* pago no debe tener asignaciones activas;
* auditoría `payment.rejected`.

---

## 8.6. `POST /api/v1/tenant/payments/{paymentId}/allocate`

Controles:

* autenticación;
* permiso `payments.allocate`;
* pago pertenece al tenant;
* pago en estado asignable;
* cargos pertenecen al tenant;
* cargos pertenecen a la misma unidad en MVP;
* monto asignado positivo;
* suma no excede `unallocatedAmount`;
* asignación no excede saldo del cargo;
* operación transaccional;
* auditoría `payment.allocated`;
* evento `PaymentAllocated`.

---

## 8.7. `POST /api/v1/tenant/payments/{paymentId}/auto-allocate`

Controles:

* autenticación;
* permiso `payments.allocate`;
* pago pertenece al tenant;
* pago asignable;
* obtener solo cargos pendientes de la misma unidad;
* ordenar por vencimiento;
* no usar cargos de otro tenant;
* no usar cargos de otra unidad;
* operación transaccional;
* auditoría `payment.autoAllocated`.

---

## 8.8. `POST /api/v1/tenant/payments/{paymentId}/reverse`

Controles:

* autenticación;
* permiso `payments.reverse`;
* pago pertenece al tenant;
* pago reversible;
* motivo obligatorio;
* reverso único en MVP;
* reversar allocations activas;
* recalcular cargos afectados;
* operación transaccional;
* auditoría `payment.reversed`.

---

## 8.9. `GET /api/v1/tenant/payments/{paymentId}/receipts`

Controles:

* autenticación;
* permiso `paymentReceipts.read`;
* pago pertenece al tenant;
* receipts pertenecen al tenant;
* no exponer URL permanente;
* no exponer contenido de archivos.

---

## 8.10. `POST /api/v1/tenant/payments/{paymentId}/receipts`

Controles:

* autenticación;
* permiso `paymentReceipts.create`;
* pago pertenece al tenant;
* al menos archivo, número o referencia;
* validar MIME;
* validar tamaño;
* sanitizar nombre;
* usar storage privado;
* no aceptar rutas;
* auditoría `paymentReceipt.uploaded`.

---

## 8.11. `GET /api/v1/tenant/payment-receipts/{receiptId}/download`

Controles:

* autenticación;
* permiso `paymentReceipts.download`;
* receipt pertenece al tenant;
* receipt tiene `fileId`;
* archivo existe;
* generar URL temporal o stream;
* no URL permanente;
* auditoría `paymentReceipt.downloaded`.

---

## 8.12. `POST /api/v1/tenant/payment-receipts/{receiptId}/accept`

Controles:

* autenticación;
* permiso `paymentReceipts.review`;
* receipt pertenece al tenant;
* receipt revisable;
* registrar actor;
* auditoría `paymentReceipt.accepted`.

---

## 8.13. `POST /api/v1/tenant/payment-receipts/{receiptId}/reject`

Controles:

* autenticación;
* permiso `paymentReceipts.reject`;
* receipt pertenece al tenant;
* motivo obligatorio;
* receipt revisable;
* auditoría `paymentReceipt.rejected`.

---

## 8.14. `GET /api/v1/tenant/payments/{paymentId}/allocations`

Controles:

* autenticación;
* permiso `payments.read`;
* pago pertenece al tenant;
* allocations pertenecen al tenant;
* no exponer allocations de otro tenant.

---

## 8.15. `POST /api/v1/tenant/payment-allocations/{allocationId}/reverse`

Controles:

* autenticación;
* permiso `payments.allocate` o futuro `payments.allocations.reverse`;
* allocation pertenece al tenant;
* allocation activa;
* motivo obligatorio;
* recalcular Payment;
* recalcular Charge;
* operación transaccional;
* auditoría `paymentAllocation.reversed`.

---

## 8.16. `GET /api/v1/me/payments`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `payments.read.own`;
* resolver unidades propias;
* filtrar por unidades propias;
* no devolver pagos de unidades ajenas;
* no devolver pagos de otro tenant.

---

## 8.17. `POST /api/v1/me/payments`

Controles:

* autenticación;
* permiso `payments.create.own`;
* usuario con Person vinculada;
* unidad propia;
* monto Decimal positivo;
* método permitido;
* referencia o comprobante si aplica;
* estado inicial `pendingValidation`;
* idempotencia;
* auditoría `payment.reported`.

---

## 8.18. `GET /api/v1/me/payments/{paymentId}`

Controles:

* autenticación;
* permiso `payments.read.own`;
* pago pertenece a unidad propia;
* no exponer notas internas;
* si no es propio, responder 404 recomendado.

---

## 8.19. `POST /api/v1/me/payments/{paymentId}/receipts`

Controles:

* autenticación;
* permiso `payments.receipts.upload.own`;
* pago pertenece a unidad propia;
* pago está en estado que permite comprobante;
* archivo válido;
* storage privado;
* auditoría `paymentReceipt.uploaded`.

---

## 8.20. `GET /api/v1/me/payment-receipts/{receiptId}/download`

Controles:

* autenticación;
* permiso `paymentReceipts.download.own`;
* receipt pertenece a pago propio;
* archivo existe;
* URL temporal o stream;
* no URL permanente;
* auditoría `paymentReceipt.downloaded`.

---

## 9. Reglas de multitenancy

### 9.1. Regla principal

Todo recurso debe cumplir:

```text id="klcdw2"
resource.tenantId == currentTenant.id
```

---

### 9.2. Relaciones obligatorias

```text id="xop92q"
payment.tenantId == currentTenant.id
payment.propertyUnit.tenantId == currentTenant.id
receipt.tenantId == currentTenant.id
receipt.payment.tenantId == currentTenant.id
allocation.tenantId == currentTenant.id
allocation.payment.tenantId == currentTenant.id
allocation.charge.tenantId == currentTenant.id
reversal.tenantId == currentTenant.id
reversal.payment.tenantId == currentTenant.id
```

---

### 9.3. Prohibición

Está prohibido:

```text id="exp5o6"
crear, consultar, confirmar, rechazar, asignar, reversar o descargar pagos, comprobantes, asignaciones o reversos usando recursos de tenants distintos.
```

---

### 9.4. Respuesta recomendada

Para referencias cross-tenant:

```text id="y6wje1"
403 CROSS_TENANT_REFERENCE
```

o, para ocultar existencia:

```text id="cit45q"
404 NOT_FOUND
```

En endpoints `.own`, se recomienda `404` para recursos ajenos.

---

## 10. Reglas de acceso `.own`

### 10.1. Resolver unidades propias

Para endpoints propios:

```text id="aiaw0f"
currentUser.userProfileId
  ↓
Person vinculada
  ↓
PropertyOwnership active o Residency active
  ↓
PropertyUnit propia
```

---

### 10.2. Filtro obligatorio

Toda consulta propia debe incluir:

```text id="ss331x"
tenantId = currentTenant.id
propertyUnitId IN ownPropertyUnitIds
```

---

### 10.3. Usuario sin persona vinculada

Si el usuario no tiene `Person` vinculada:

```text id="vgy4p2"
403 OWN_PERSON_NOT_LINKED
```

---

### 10.4. Unidad ajena

Si el usuario intenta operar una unidad ajena:

```text id="r6h3iw"
404 NOT_FOUND
```

recomendado para no revelar existencia.

---

### 10.5. Pago propio

Un pago es propio si:

```text id="bus7d8"
Payment.propertyUnitId IN ownPropertyUnitIds
AND Payment.tenantId = currentTenant.id
```

---

### 10.6. Comprobante propio

Un comprobante es propio si:

```text id="zcd5sy"
PaymentReceipt.paymentId → Payment.propertyUnitId IN ownPropertyUnitIds
AND PaymentReceipt.tenantId = currentTenant.id
```

---

### 10.7. Relaciones terminadas

Relaciones `ended`, `archived`, `suspended` o equivalentes no otorgan acceso operativo propio.

---

## 11. Reglas de precisión monetaria

### 11.1. Almacenamiento

Usar:

```text id="xpmue3"
DECIMAL(12,2)
```

para montos.

---

### 11.2. API

Montos en requests y responses:

```json id="xqba92"
{
  "amount": "100.00",
  "allocatedAmount": "50.00",
  "unallocatedAmount": "50.00",
  "currency": "USD"
}
```

---

### 11.3. Validaciones

* monto requerido;
* monto positivo para pagos;
* monto positivo para asignaciones;
* moneda `USD` en MVP;
* máximo dos decimales;
* no redondeo silencioso;
* no resultado negativo;
* no asignar más del monto disponible;
* no asignar más del saldo del cargo.

---

### 11.4. Cálculos

Al crear pago:

```text id="q8yu22"
allocatedAmount = 0.00
unallocatedAmount = amount
```

Al asignar:

```text id="hvq8bt"
allocatedAmount = sum(active PaymentAllocation.amount)
unallocatedAmount = amount - allocatedAmount
```

Al reversar pago:

```text id="fdd50v"
status = reversed
allocatedAmount = 0.00
unallocatedAmount = 0.00
active allocations -> reversed
```

El `amount` se conserva siempre.

---

## 12. Reglas de idempotencia

### 12.1. Header recomendado

```text id="zscjk3"
Idempotency-Key
```

Persistir como:

```text id="i2bvfk"
tenantId:Idempotency-Key
```

---

### 12.2. Key derivada

Si no existe header y hay referencia suficiente:

```text id="khmkia"
tenantId:propertyUnitId:amount:paidAt:method:transactionReference
```

---

### 12.3. Constraint

```text id="y2y2wm"
unique(tenantId, idempotencyKey)
```

---

### 12.4. Política ante duplicado

MVP recomendado:

```text id="vz7vd9"
misma key + mismo payload financiero = devolver pago existente
misma key + payload distinto = 409 IDEMPOTENCY_CONFLICT
```

---

### 12.5. Concurrencia

Dos requests simultáneos con la misma key deben producir:

```text id="f3022w"
una sola instancia lógica de Payment
```

---

## 13. Reglas de asignación de pagos

### 13.1. Pago asignable

Estados asignables:

```text id="yt6joh"
confirmed
partiallyAllocated
```

Estados no asignables:

```text id="xj1c8m"
draft
reported
pendingValidation
rejected
cancelled
reversed
archived
```

---

### 13.2. Cargo pagable

El cargo debe:

* pertenecer al tenant;
* pertenecer a la misma unidad que el pago en MVP;
* tener saldo pendiente;
* no estar cancelado;
* no estar reversado;
* no estar archivado;
* no estar pagado completamente.

---

### 13.3. Monto asignable

Reglas:

```text id="zum09k"
allocation.amount > 0
sum(new allocations) <= Payment.unallocatedAmount
allocation.amount <= Charge.outstandingAmount
```

---

### 13.4. Operación transaccional

La asignación debe ejecutarse como una unidad transaccional:

```text id="mv6liv"
crear PaymentAllocation
actualizar Payment.allocatedAmount
actualizar Payment.unallocatedAmount
actualizar Payment.status
actualizar Charge payment status vía puerto
auditar
emitir eventos
```

Si algo falla, la operación debe revertirse.

---

### 13.5. Autoasignación

La autoasignación MVP debe:

```text id="kazxs3"
1. seleccionar cargos pendientes de la misma unidad;
2. ordenar por dueDate ASC;
3. asignar hasta agotar Payment.unallocatedAmount;
4. conservar excedente;
5. no usar cargos de otro tenant;
6. no usar cargos de otra unidad.
```

---

## 14. Reglas de reverso

### 14.1. Reverso de pago

Reglas:

```text id="s7s2ou"
requiere permiso payments.reverse
requiere motivo
requiere pago reversible
un reverso por pago en MVP
revierte allocations activas
marca Payment.status = reversed
recalcula cargos afectados
auditoría obligatoria
```

---

### 14.2. Reverso de asignación

Reglas:

```text id="zhlvhj"
requiere permiso payments.allocate o permiso futuro específico
requiere motivo
requiere allocation activa
marca PaymentAllocation.status = reversed
recalcula Payment
recalcula Charge
auditoría obligatoria
```

---

### 14.3. Pago reversado

Un pago reversado:

* no puede asignarse;
* no debe afectar saldos;
* conserva `amount`;
* conserva comprobantes;
* conserva auditoría;
* conserva reverso formal.

---

## 15. Reglas de comprobantes y archivos

### 15.1. Evidencia mínima

Un comprobante debe tener al menos uno:

```text id="kbmxkg"
fileId
receiptNumber
transactionReference
```

---

### 15.2. Tipos permitidos

MVP recomendado:

```text id="ue2wz8"
application/pdf
image/jpeg
image/png
image/webp opcional
```

---

### 15.3. Tipos no permitidos

Bloquear:

```text id="d5iqsf"
application/x-msdownload
application/x-sh
application/x-bat
text/html
image/svg+xml salvo revisión especial
application/javascript
text/javascript
```

---

### 15.4. Tamaño máximo

MVP recomendado:

```text id="hxq6w7"
5 MB
```

---

### 15.5. Nombre de archivo

Debe sanitizarse:

```text id="unpj0d"
sin paths
sin ../
sin caracteres de control
sin nombres excesivamente largos
sin extensión peligrosa
```

---

### 15.6. Storage privado

El archivo debe almacenarse en:

```text id="wv47ew"
MinIO local/dev
S3-compatible production
S3 futuro
```

Reglas:

* bucket privado;
* no ACL pública;
* credenciales fuera del repositorio;
* URL temporal si aplica;
* auditoría de descarga;
* no loggear file content.

---

### 15.7. Descarga

La descarga requiere:

```text id="ozmx9y"
token válido
tenant activo
membership activa
permiso
recurso dentro del tenant
relación .own si aplica
```

---

## 16. Reglas de no eliminación física

### 16.1. Recursos sin DELETE

No exponer `DELETE` para:

```text id="yuawzh"
payments
payment_receipts
payment_allocations
payment_reversals
```

---

### 16.2. Acciones permitidas

Usar:

```text id="jy4vpw"
reject
cancel
reverse
archive
reverse allocation
```

---

### 16.3. Pago registrado

Un pago registrado se conserva siempre.

Correcciones permitidas:

```text id="ovjmt8"
rejected
cancelled
reversed
nuevo pago correctivo
```

---

## 17. Reglas de auditoría

### 17.1. Eventos auditables obligatorios

```text id="icp0hs"
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

### 17.2. Campos mínimos

```text id="sdydn6"
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

### 17.3. Campos financieros recomendados

```text id="t3i6k9"
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

### 17.4. Datos prohibidos en auditoría

Evitar:

```text id="qfb44g"
contenido de archivos
tokens
headers de autenticación
payload completo
datos bancarios completos
comprobantes completos
stack traces
secrets
```

---

## 18. Seguridad de logs

### 18.1. Permitido en logs

```text id="n2kxu7"
traceId
tenantId
actorUserId
resourceType
resourceId
action
result
errorCode
latencyMs
paymentId
propertyUnitId
chargeId
allocationId
receiptId
```

---

### 18.2. Prohibido en logs

```text id="c0gjfq"
Authorization header
access token
refresh token
cookies completas
payload completo
contenido de comprobante
números completos de cuenta bancaria
referencias bancarias sensibles completas si aplican
datos personales innecesarios
stack trace en producción
storage credentials
signed download URL completa
```

---

### 18.3. Logs de descarga de comprobantes

Deben registrar:

```text id="uwv7js"
receiptId
paymentId
tenantId
actorUserId
result
traceId
```

No deben registrar:

```text id="qe7ro4"
downloadUrl completa
file content
storage key sensible si no es necesario
Authorization header
```

---

## 19. Seguridad del modelo de datos

### 19.1. `tenant_id` obligatorio

Todas las tablas del módulo deben tener `tenant_id NOT NULL`.

---

### 19.2. `property_unit_id` obligatorio en Payment

```text id="m2olmr"
payments.property_unit_id NOT NULL
```

---

### 19.3. `onDelete: Restrict`

Relaciones críticas deben usar:

```text id="xxjsc2"
onDelete: Restrict
```

No usar cascade delete en recursos financieros ni comprobantes.

---

### 19.4. Constraints obligatorias

Recomendadas:

```text id="gh6qal"
payment amount > 0
allocated_amount >= 0
unallocated_amount >= 0
allocated_amount + unallocated_amount = amount salvo estados finales
payment_receipts_has_evidence
payment_allocations_amount > 0
payment_reversals_reason not empty
unique tenant+idempotencyKey
unique tenant+paymentId en reversals
```

---

### 19.5. Validación en aplicación

La base de datos no reemplaza validaciones de negocio.

Siempre validar:

```text id="l7jy1s"
payment pertenece al tenant
propertyUnit pertenece al tenant
receipt pertenece al tenant
allocation pertenece al tenant
charge pertenece al tenant
payment y charge pertenecen a la misma unidad
usuario tiene permiso
usuario .own tiene relación vigente
```

---

## 20. Seguridad de estados

### 20.1. PaymentStatus

| Estado               |      Confirmar |     Rechazar | Asignar | Reversar |
| -------------------- | -------------: | -----------: | ------: | -------: |
| `draft`              | Según política |           Sí |      No |       No |
| `reported`           |             Sí |           Sí |      No |       No |
| `pendingValidation`  |             Sí |           Sí |      No |       No |
| `confirmed`          |             No | No ordinario |      Sí |       Sí |
| `partiallyAllocated` |             No |           No |      Sí |       Sí |
| `allocated`          |             No |           No |      No |       Sí |
| `rejected`           |             No |           No |      No |       No |
| `cancelled`          |             No |           No |      No |       No |
| `reversed`           |             No |           No |      No |       No |
| `archived`           |             No |           No |      No |       No |

---

### 20.2. PaymentReceiptStatus

| Estado     |         Descargar |      Aceptar |     Rechazar |
| ---------- | ----------------: | -----------: | -----------: |
| `pending`  |      Según fileId |           Sí |           Sí |
| `uploaded` |                Sí |           Sí |           Sí |
| `accepted` |                Sí | No ordinario | No ordinario |
| `rejected` | Sí según política |           No |           No |
| `archived` |      No ordinario |           No |           No |

---

### 20.3. PaymentAllocationStatus

| Estado      | Afecta saldo | Reversar |
| ----------- | -----------: | -------: |
| `active`    |           Sí |       Sí |
| `reversed`  |           No |       No |
| `cancelled` |           No |       No |
| `archived`  |           No |       No |

---

## 21. Separación de funciones

### 21.1. Permisos separados

Permisos críticos:

```text id="hjru0y"
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
payments.create.own
payments.read.own
payments.receipts.upload.own
paymentReceipts.download.own
```

---

### 21.2. Roles sugeridos

| Rol           | Permisos recomendados                           |
| ------------- | ----------------------------------------------- |
| TenantAdmin   | supervisión y configuración                     |
| Treasurer     | crear, confirmar, rechazar, asignar pagos       |
| TenantAuditor | lectura y auditoría                             |
| BoardMember   | lectura limitada                                |
| PropertyOwner | crear/leer pagos propios y comprobantes propios |
| Resident      | crear/leer pagos propios si política lo permite |

---

### 21.3. Operaciones críticas

Operaciones que podrían requerir step-up/MFA o aprobación futura:

```text id="n9xfbo"
payments.reverse
paymentAllocation.reverse
payments.confirm montos altos
payments.allocate montos altos
paymentReceipt.download masivo
```

En MVP se exige al menos permiso explícito y auditoría reforzada.

---

## 22. Validación de entrada

### 22.1. IDs

Validar formato de:

```text id="eql7tx"
paymentId
paymentReceiptId
paymentAllocationId
propertyUnitId
chargeId
receiptId
fileId si se expone internamente
```

---

### 22.2. Strings

Aplicar:

* trim;
* longitud máxima;
* rechazo de valores vacíos cuando son requeridos;
* rechazo o sanitización de scripts;
* no almacenar payloads extensos en motivos;
* no almacenar datos bancarios sensibles completos.

---

### 22.3. Montos

Reglas:

```text id="kykfbr"
amount decimal string
máximo 2 decimales
amount > 0
currency = USD
```

---

### 22.4. Fechas

Validar:

```text id="n0s8ia"
paidAt válida
paidAt no absurda
reportedAt generado por sistema
confirmedAt generado por sistema
rejectedAt generado por sistema
reversedAt generado por sistema
```

---

### 22.5. Campo `tenantId` en body

Para endpoints tenant-scoped, si el cliente envía `tenantId`:

```text id="z8erxe"
rechazar con VALIDATION_ERROR
```

Recomendación:

```text id="f66t0w"
No ignorar silenciosamente tenantId en operaciones financieras.
```

---

## 23. Seguridad de error responses

### 23.1. Error estándar

```json id="ut5a1f"
{
  "error": {
    "code": "PAYMENT_NOT_ALLOCATABLE",
    "message": "Only confirmed or partially allocated payments can be allocated.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 23.2. No exponer

No devolver:

```text id="mahx0p"
SQL completo
stack trace
detalles internos de Prisma
payload completo
tokens
datos bancarios
contenido de comprobantes
storage keys sensibles
signed URLs en errores
estructura interna de permisos
```

---

### 23.3. Recurso ajeno

Para evitar enumeración, en endpoints `.own` puede responderse:

```text id="l7f7hz"
404 NOT_FOUND
```

en lugar de `403`.

---

## 24. CORS

Endpoints financieros autenticados no deben tener CORS abierto en producción.

Prohibido:

```text id="gqf1kp"
Access-Control-Allow-Origin: *
```

Permitir solo orígenes oficiales de RESIDENT Core.

---

## 25. Rate limiting

Aplicar rate limiting recomendado en:

```text id="s44oir"
POST /api/v1/tenant/payments
POST /api/v1/tenant/payments/{paymentId}/confirm
POST /api/v1/tenant/payments/{paymentId}/reject
POST /api/v1/tenant/payments/{paymentId}/allocate
POST /api/v1/tenant/payments/{paymentId}/auto-allocate
POST /api/v1/tenant/payments/{paymentId}/reverse
POST /api/v1/tenant/payments/{paymentId}/receipts
GET /api/v1/tenant/payment-receipts/{receiptId}/download
POST /api/v1/me/payments
POST /api/v1/me/payments/{paymentId}/receipts
GET /api/v1/me/payment-receipts/{receiptId}/download
```

Objetivos:

* evitar pagos duplicados por abuso;
* reducir enumeración de recursos;
* proteger comprobantes;
* proteger operaciones financieras críticas;
* limitar carga abusiva de archivos.

---

## 26. Seguridad de seeds

### 26.1. Permitido

```text id="tlua7s"
tenants demo
unidades demo
cargos demo
pagos demo ficticios
referencias ficticias
metadata de comprobantes ficticia
montos ficticios
USD
```

---

### 26.2. Prohibido

```text id="mijhuq"
pagos reales
comprobantes reales
capturas reales de transferencia
números de cuenta reales
referencias bancarias reales
nombres reales de propietarios
nombres reales de residentes
archivos personales
datos tributarios reales
datos bancarios reales
```

---

## 27. Seguridad del storage

### 27.1. Credenciales

Credenciales de storage:

* no van en repositorio;
* no van en logs;
* no se exponen en API;
* se cargan por variables de entorno o secret manager.

---

### 27.2. Bucket privado

El bucket de comprobantes debe ser privado.

Prohibido:

```text id="u7f7lt"
public-read
public-write
ACL pública
listado público del bucket
```

---

### 27.3. URL firmada

Si se usan URLs firmadas:

* expiración corta;
* validación previa de permisos;
* no loggear URL completa;
* no compartir en eventos;
* no guardar como URL permanente.

---

### 27.4. Metadata

Metadata permitida:

```text id="bbhux6"
fileName sanitizado
mimeType
fileSize
fileId interno
uploadedBy
uploadedAt
```

Metadata prohibida:

```text id="tq50xz"
contenido del archivo
datos bancarios extraídos
OCR completo
tokens
secrets
URL permanente
```

---

## 28. Seguridad transaccional

Operaciones que deben ser transaccionales:

```text id="omirbv"
allocate payment
auto-allocate payment
reverse payment
reverse payment allocation
confirm payment si afecta estado dependiente
reject payment si valida ausencia de allocations
```

Al asignar pago:

```text id="op0vzl"
1. validar Payment;
2. validar Charge;
3. validar available amount;
4. validar outstanding amount;
5. crear PaymentAllocation;
6. actualizar Payment;
7. actualizar Charge;
8. auditar;
9. emitir eventos.
```

Si cualquier paso falla, todo debe revertirse.

---

## 29. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="xx6sds"
- Tenant A no accede a pagos de Tenant B.
- Tenant A no crea pago para unidad de Tenant B.
- Tenant A no asigna pago a cargo de Tenant B.
- Tenant A no descarga comprobante de Tenant B.
- Usuario .own no ve pagos ajenos.
- Usuario .own no descarga comprobantes ajenos.
- Usuario sin Person no accede a pagos propios.
- Idempotency-Key repetida no duplica pagos.
- Misma key con payload distinto produce conflicto.
- Payment.amount no se modifica.
- allocatedAmount se recalcula correctamente.
- unallocatedAmount se recalcula correctamente.
- Allocation no excede Payment.unallocatedAmount.
- Allocation no excede Charge.outstandingAmount.
- Pago y cargo de otra unidad se rechazan.
- Pago pendingValidation no se asigna.
- Pago rejected no se asigna.
- Pago reversed no se asigna.
- Reverso de pago revierte allocations.
- Reverso de allocation recalcula Payment.
- Reverso de allocation recalcula Charge.
- No existen DELETE ordinarios.
- Comprobante EXE se rechaza.
- Comprobante demasiado grande se rechaza.
- Path traversal en filename se rechaza o sanitiza.
- Receipt sin evidencia se rechaza.
- Descarga requiere permiso.
- Logs no contienen tokens.
- Logs no contienen contenido de comprobantes.
- Logs no contienen payload completo.
- Métricas no usan transactionReference ni fileId como labels.
```

---

## 30. Checklist de seguridad para PR

Antes de aprobar un PR de `005-payments`:

```text id="it3xd9"
[ ] Todo modelo de pagos tiene tenantId obligatorio.
[ ] Payment tiene propertyUnitId obligatorio.
[ ] PaymentAllocation tiene paymentId, chargeId y propertyUnitId.
[ ] No hay cascade delete peligroso.
[ ] No hay DELETE físico ordinario.
[ ] Montos usan Decimal.
[ ] No se usa float ni double para dinero.
[ ] Montos salen en API como string.
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints tenant tienen TenantGuard.
[ ] Endpoints financieros tienen TenantPermissionGuard.
[ ] Endpoints .own validan OwnPaymentPolicyService.
[ ] Queries filtran por tenantId.
[ ] Payments validan tenant.
[ ] PaymentReceipts validan tenant.
[ ] PaymentAllocations validan tenant.
[ ] PaymentReversals validan tenant.
[ ] PropertyUnit valida tenant.
[ ] Charge valida tenant.
[ ] Payment y Charge pertenecen a la misma unidad en MVP.
[ ] IdempotencyKey está implementada.
[ ] Payment.amount es inmutable.
[ ] allocatedAmount se recalcula.
[ ] unallocatedAmount se recalcula.
[ ] Payment rejected no se asigna.
[ ] Payment reversed no se asigna.
[ ] Allocation no excede payment.
[ ] Allocation no excede charge.
[ ] Reverso requiere motivo.
[ ] Reverso de pago revierte allocations.
[ ] Reverso de allocation recalcula payment y charge.
[ ] Comprobantes usan storage privado.
[ ] No hay URL pública permanente.
[ ] File upload valida tipo.
[ ] File upload valida tamaño.
[ ] File name está sanitizado.
[ ] Receipt sin evidencia se rechaza.
[ ] Usuario .own no ve pagos ajenos.
[ ] Usuario .own no descarga receipts ajenos.
[ ] Logs no contienen payload completo.
[ ] Logs no contienen contenido de comprobantes.
[ ] Logs no contienen datos bancarios completos.
[ ] Métricas no usan labels de alta cardinalidad.
[ ] Cambios financieros generan auditoría.
[ ] Eventos financieros se emiten.
[ ] OpenAPI documenta permisos, idempotencia y private file access.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests de idempotencia pasan.
[ ] Tests de precisión monetaria pasan.
[ ] Tests de asignación pasan.
[ ] Tests de receipt security pasan.
[ ] Tests de regresión financiera pasan.
[ ] Seeds no contienen datos reales.
[ ] No se implementó conciliación bancaria fuera de alcance.
[ ] No se implementó pasarela de pagos fuera de alcance.
[ ] No se implementó facturación electrónica fuera de alcance.
[ ] No se implementaron estados de cuenta consolidados fuera de alcance.
```

---

## 31. Riesgos residuales aceptados en MVP

| Riesgo                               | Estado                 | Justificación                                       |
| ------------------------------------ | ---------------------- | --------------------------------------------------- |
| Conciliación bancaria diferida       | Aceptado temporalmente | Requiere movimientos bancarios y matching           |
| Pasarela de pagos diferida           | Aceptado temporalmente | Requiere proveedor, callbacks y seguridad externa   |
| Pagos con tarjeta diferidos          | Aceptado temporalmente | Requiere tokenización y controles especializados    |
| Facturación electrónica diferida     | Aceptado temporalmente | Requiere integración tributaria                     |
| OCR de comprobantes diferido         | Aceptado temporalmente | Requiere privacidad, precisión y revisión humana    |
| Validación IA diferida               | Aceptado temporalmente | Requiere gobernanza de datos y evaluación de riesgo |
| Aprobación dual avanzada diferida    | Aceptado temporalmente | Requiere workflow                                   |
| Carga masiva diferida                | Aceptado temporalmente | Requiere validación batch y rollback controlado     |
| Notificaciones automáticas diferidas | Aceptado temporalmente | Requiere módulo de comunicaciones                   |
| Cobranza automatizada diferida       | Aceptado temporalmente | Requiere estados de cuenta y mora                   |

---

## 32. Pendientes de seguridad para specs futuras

### 32.1. `006-account-statements`

Debe asegurar:

* saldos reconstruibles;
* pagos confirmados;
* pagos reversados excluidos;
* allocations activas;
* cargos pagados/parciales;
* acceso propio por unidad;
* snapshots auditables si se usan.

---

### 32.2. `00X-bank-reconciliation`

Debe asegurar:

* movimientos bancarios protegidos;
* matching auditable;
* relación entre bankMovement y Payment;
* detección de duplicados;
* reversos controlados;
* no exposición de información bancaria.

---

### 32.3. `00X-payment-gateway`

Debe asegurar:

* webhooks firmados;
* idempotencia externa;
* validación de proveedor;
* protección contra replay;
* no almacenamiento de datos sensibles de tarjeta;
* manejo seguro de callbacks.

---

### 32.4. `00X-electronic-invoicing`

Debe asegurar:

* separación entre pago y documento tributario;
* claves de acceso protegidas;
* integración con proveedor autorizado si aplica;
* auditoría tributaria.

---

### 32.5. `007-audit`

Debe asegurar:

* auditoría inmutable;
* retención;
* búsqueda controlada;
* exportación restringida;
* trazabilidad tenant/actor/recurso.

---

## 33. Criterios de aceptación de seguridad

La spec `005-payments` cumple seguridad si:

* todo recurso de pago tiene `tenantId`;
* todo pago tiene `propertyUnitId`;
* toda asignación tiene `paymentId`, `chargeId` y `propertyUnitId`;
* ningún endpoint privado opera sin autenticación;
* ningún endpoint financiero opera sin permiso;
* ningún endpoint tenant-scoped opera sin membership activa;
* ningún usuario de Tenant A accede a pagos de Tenant B;
* ningún pago se crea para unidad de otro tenant;
* ningún pago se asigna a cargo de otro tenant;
* ningún pago se asigna a cargo de otra unidad en MVP;
* no se asigna más del pago;
* no se asigna más del cargo;
* no se usa float para dinero;
* montos se manejan con Decimal;
* API expone montos como string;
* idempotencia evita duplicados;
* `Payment.amount` no se sobrescribe;
* no se elimina físicamente ningún pago;
* no se elimina físicamente ninguna asignación;
* no se elimina físicamente ningún comprobante;
* comprobantes se almacenan en storage privado;
* descargas requieren autorización;
* URLs son temporales o stream controlado;
* usuarios `.own` solo ven pagos propios;
* usuarios `.own` solo descargan comprobantes propios;
* auditoría financiera existe;
* eventos financieros existen;
* logs están sanitizados;
* OpenAPI documenta permisos, idempotencia y private file access;
* tests de autorización pasan;
* tests multitenant pasan;
* tests de idempotencia pasan;
* tests de precisión monetaria pasan;
* tests de asignación pasan;
* tests de comprobantes pasan;
* tests financieros pasan.

---

## 34. Decisión final de seguridad

El módulo `005-payments` será tratado como módulo financiero crítico.

La seguridad del módulo se basa en:

```text id="zz2cf0"
tenant_id obligatorio
property_unit_id obligatorio
pagos asociados a cargos mediante allocations
Decimal para dinero
moneda USD en MVP
idempotencyKey para creación de pagos
Payment.amount inmutable
allocatedAmount controlado
unallocatedAmount controlado
no eliminación física
comprobantes privados
descargas autorizadas
URLs temporales o stream controlado
permisos financieros separados
OwnPaymentPolicyService
validación de Payment ↔ Charge ↔ PropertyUnit
reversos auditables
auditoría financiera obligatoria
eventos financieros sanitizados
logs sin payload completo
tests de autorización
tests multitenant
tests de precisión monetaria
tests de idempotencia
tests de asignación
tests de seguridad de comprobantes
tests de regresión financiera
```

La implementación no será aceptada si permite crear pagos duplicados, crear pagos para unidades de otro tenant, asignar pagos a cargos de otro tenant, asignar pagos a cargos de otra unidad en MVP, asignar más del monto pagado, asignar más del saldo del cargo, usar float para dinero, sobrescribir `Payment.amount`, eliminar pagos, exponer comprobantes privados, omitir auditoría financiera o permitir que un propietario/residente consulte pagos o comprobantes de unidades ajenas.
