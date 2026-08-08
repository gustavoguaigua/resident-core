# Security Notes — Spec 004 Dues, Fees, Charge Concepts and Charge Generation

## 1. Información del documento

| Campo           | Valor                                                        |
| --------------- | ------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                |
| Spec ID         | 004                                                          |
| Módulo          | Dues and Fees                                                |
| Documento       | Security Notes                                               |
| Ruta            | `docs/specs/004-dues-fees/security-notes.md`                 |
| Versión         | 0.1                                                          |
| Estado          | Borrador inicial                                             |
| Fecha           | 2026-07-14                                                   |
| Documento base  | `docs/specs/004-dues-fees/spec.md`                           |
| Plan técnico    | `docs/specs/004-dues-fees/plan.md`                           |
| Modelo de datos | `docs/specs/004-dues-fees/data-model.md`                     |
| Contrato API    | `docs/specs/004-dues-fees/api-contract.md`                   |
| Plan de pruebas | `docs/specs/004-dues-fees/test-plan.md`                      |
| Tareas          | `docs/specs/004-dues-fees/tasks.md`                          |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `004-dues-fees`.

El módulo administra la primera base financiera de RESIDENT Core:

* conceptos de cobro;
* alícuotas;
* configuraciones recurrentes;
* asignaciones de alícuotas por unidad;
* periodos financieros;
* generación mensual;
* cargos ordinarios;
* cargos extraordinarios;
* cargos manuales;
* batches de generación;
* anulaciones;
* reversos;
* ajustes;
* consulta administrativa de cargos;
* consulta propia de cargos.

Este módulo es sensible porque sus datos serán usados posteriormente por:

* pagos;
* comprobantes;
* estados de cuenta;
* mora;
* conciliación bancaria;
* reportes financieros;
* notificaciones de cobro;
* auditoría;
* automatizaciones.

Regla principal:

```text id="klt026"
Un error de seguridad en cargos puede convertirse en un error financiero, contable, operativo, legal o reputacional para el conjunto residencial.
```

---

## 3. Principios de seguridad financiera

### 3.1. Tenant como frontera financiera obligatoria

Todo recurso financiero debe pertenecer a un tenant.

Aplica a:

```text id="edspzt"
ChargeConcept
FeeSchedule
UnitFeeAssignment
BillingPeriod
ChargeBatch
Charge
ChargeAdjustment
ChargeReversal
```

Regla:

```text id="94r0u1"
Ninguna operación financiera puede ejecutarse sin validar tenantId.
```

---

### 3.2. Unidad habitacional como base del cargo

Todo cargo debe estar asociado a una unidad habitacional.

Regla:

```text id="add5u4"
Charge.propertyUnitId es obligatorio.
```

La unidad debe pertenecer al mismo tenant que el cargo.

---

### 3.3. Precisión monetaria obligatoria

Todos los montos deben manejarse con Decimal.

Prohibido:

```text id="474bqn"
float
double
number sin control decimal para dinero
```

Regla:

```text id="wlr2ce"
El dinero se representa con Decimal y se expone en API como string decimal.
```

---

### 3.4. Idempotencia en generación

La generación mensual de cargos debe ser idempotente.

Regla:

```text id="4npt4g"
Repetir una generación mensual no debe duplicar cargos.
```

---

### 3.5. No eliminación física

No se debe eliminar físicamente ningún cargo emitido.

Se debe usar:

```text id="pg1582"
status
cancelledAt
reversedAt
adjustments
reversals
audit logs
```

---

### 3.6. Monto original inmutable

El monto original de un cargo emitido debe conservarse.

Regla:

```text id="it7bsg"
originalAmount no se sobrescribe.
```

Correcciones permitidas:

```text id="xfdegc"
cancelación
reverso
ajuste
```

---

### 3.7. Auditoría financiera obligatoria

Toda operación financiera crítica debe auditarse.

Ejemplos:

```text id="ncgd0r"
crear cargo
generar lote mensual
cancelar cargo
reversar cargo
ajustar cargo
cerrar periodo
bloquear periodo
```

---

### 3.8. Separación de funciones

Un permiso financiero no implica automáticamente otro.

Ejemplos:

```text id="94wp3z"
fees.generate ≠ charges.reverse
charges.read ≠ charges.cancel
charges.adjust ≠ billingPeriods.close
```

---

## 4. Activos protegidos

Activos directos:

```text id="nd69fw"
charge_concepts
fee_schedules
unit_fee_assignments
billing_periods
charge_batches
charges
charge_adjustments
charge_reversals
idempotency_keys
financial_audit_events
financial_domain_events
```

Activos indirectos futuros:

```text id="61ilw2"
payments
payment_allocations
payment_receipts
account_statements
late_fees
bank_movements
reconciliations
financial_reports
notifications
audit_logs
```

---

## 5. Datos sensibles del módulo

### 5.1. Datos financieros

El módulo puede almacenar:

```text id="hpl7ez"
originalAmount
effectiveAmount
adjustment amount
charge concept
billing period
due date
charge status
cancellation reason
reversal reason
adjustment reason
batch totals
```

---

### 5.2. Datos operativos sensibles

Aunque los cargos no almacenen directamente datos personales, revelan información sensible por relación:

```text id="8xk5ff"
Charge → PropertyUnit
PropertyUnit → Owner
PropertyUnit → Resident
Charge → BillingPeriod
Charge → DueDate
Charge → Amount
```

Estas relaciones pueden revelar deudas, obligaciones económicas, unidad habitacional y comportamiento de pago futuro.

---

### 5.3. Datos que no deben almacenarse en esta spec

No almacenar todavía:

```text id="1vmew8"
pagos
comprobantes
números de cuenta bancaria
movimientos bancarios
referencias bancarias
datos de tarjetas
documentos tributarios
facturas electrónicas
asientos contables
datos de conciliación
intereses de mora avanzados
datos personales de propietarios/residentes duplicados en cargos
```

---

## 6. Superficies de ataque

### 6.1. Charge Concepts API

Ruta:

```text id="kp10s8"
/api/v1/tenant/charge-concepts
```

Riesgos:

* crear conceptos duplicados;
* usar conceptos de otro tenant;
* modificar conceptos usados históricamente;
* archivar conceptos activos sin control;
* alterar clasificación financiera;
* crear conceptos que simulen cargos no autorizados.

---

### 6.2. Fee Schedules API

Ruta:

```text id="u6haf8"
/api/v1/tenant/fee-schedules
```

Riesgos:

* crear alícuotas con montos incorrectos;
* usar conceptos inactivos;
* usar conceptos de otro tenant;
* cambiar montos que afecten generación futura;
* confundir vigencias;
* usar moneda no permitida;
* introducir valores con precisión incorrecta.

---

### 6.3. Unit Fee Assignments API

Ruta:

```text id="l2rx4u"
/api/v1/tenant/unit-fees
```

Riesgos:

* asignar alícuota a unidad de otro tenant;
* asignar alícuota a unidad archivada;
* duplicar asignación activa;
* finalizar asignación sin motivo;
* perder historial;
* generar cargos incorrectos por unidad.

---

### 6.4. Billing Periods API

Ruta:

```text id="4l19ui"
/api/v1/tenant/billing-periods
```

Riesgos:

* crear periodos duplicados;
* cerrar periodo prematuramente;
* bloquear periodo sin autorización;
* generar cargos en periodo cerrado;
* alterar fechas de vencimiento;
* crear periodos con formato inválido.

---

### 6.5. Charge Generation API

Ruta:

```text id="1e3c52"
/api/v1/tenant/charges/generate-monthly
```

Riesgos:

* duplicar cargos mensuales;
* generar cargos para unidades archivadas;
* generar cargos en tenant suspendido;
* generar cargos en periodo cerrado;
* generar cargos con FeeSchedule incorrecto;
* generar cargos para unidades de otro tenant;
* fallos parciales sin trazabilidad;
* batch sin conteos confiables.

---

### 6.6. Charge Batches API

Ruta:

```text id="bg37rc"
/api/v1/tenant/charge-batches
```

Riesgos:

* exponer batches de otro tenant;
* exponer errores con datos sensibles;
* manipular conteos;
* ocultar fallos parciales;
* permitir diagnóstico financiero incompleto.

---

### 6.7. Charges API

Ruta:

```text id="duwihz"
/api/v1/tenant/charges
```

Riesgos:

* crear cargos sin autorización;
* crear cargos en unidad ajena;
* crear cargos con monto negativo;
* crear cargos con concepto de otro tenant;
* cancelar cargos indebidamente;
* reversar cargos indebidamente;
* ajustar cargos indebidamente;
* modificar `originalAmount`;
* eliminar cargo emitido;
* exponer cargos de otro tenant.

---

### 6.8. Own Charges API

Ruta:

```text id="yzfqhv"
/api/v1/me/charges
```

Riesgos:

* propietario ve cargos de unidad ajena;
* residente ve cargos de otro residente;
* usuario sin persona vinculada ve cargos;
* usuario de Tenant A ve cargos de Tenant B;
* relaciones finalizadas siguen otorgando acceso;
* enumeración de cargos por IDs.

---

## 7. Amenazas principales

## 7.1. Cross-tenant financial access

### Descripción

Un usuario de Tenant A accede, crea, cancela, reversa o ajusta cargos de Tenant B.

### Impacto

Crítico.

### Ejemplo

```text id="etjz09"
Treasurer de Villa Club intenta generar cargos para una unidad de Altos del Norte.
```

### Controles

* `tenantId` obligatorio;
* `TenantGuard`;
* `TenantPermissionGuard`;
* validación de tenant en use cases;
* validación de tenant en repositorios;
* validación de tenant en `PropertyUnitReaderPort`;
* filtros por `tenantId`;
* tests multitenant.

### Pruebas asociadas

```text id="kdlh68"
MT-DUES-001 a MT-DUES-012
APP-CH-003
APP-FS-003
APP-UFA-002
API-GEN-010
```

---

## 7.2. Duplicate monthly charges

### Descripción

La generación mensual se ejecuta dos veces y duplica cargos ordinarios.

### Impacto

Crítico.

### Ejemplo

```text id="m0g2tz"
Se generan dos cargos de alícuota mensual para Casa 01 en 2026-07.
```

### Controles

* `idempotencyKey`;
* unique constraint `tenantId + idempotencyKey`;
* `ChargeIdempotencyService`;
* batch stats;
* pruebas de concurrencia;
* pruebas de idempotencia.

### Pruebas asociadas

```text id="86q1ua"
IDEMP-DUES-001 a IDEMP-DUES-009
CONC-DUES-003
API-GEN-004
API-GEN-005
```

---

## 7.3. Monetary precision error

### Descripción

El sistema calcula montos usando tipos imprecisos.

### Impacto

Alto.

### Ejemplo

```text id="3jxhg8"
0.10 + 0.20 produce 0.30000000000000004.
```

### Controles

* `Money` value object;
* Decimal;
* API serializa montos como string;
* no usar float;
* pruebas de precisión monetaria.

### Pruebas asociadas

```text id="m3vcvy"
UT-MONEY-001 a UT-MONEY-008
MONEY-001 a MONEY-009
```

---

## 7.4. Original amount overwrite

### Descripción

Un cargo emitido se modifica sobrescribiendo el monto original.

### Impacto

Alto.

### Ejemplo

```text id="131z8a"
Cargo de 50.00 se cambia directamente a 45.00 sin ajuste auditable.
```

### Controles

* `originalAmount` inmutable;
* ajustes en `ChargeAdjustment`;
* reversos en `ChargeReversal`;
* cancelación con motivo;
* auditoría;
* tests de regresión financiera.

### Pruebas asociadas

```text id="0njsau"
APP-ADJ-005
API-CH-ADJ-006
FIN-REG-005
SEC-DUES-FIN-004
```

---

## 7.5. Unauthorized cancellation, reversal or adjustment

### Descripción

Un usuario sin permiso ejecuta operaciones financieras críticas.

### Impacto

Crítico.

### Ejemplo

```text id="z3jw73"
BoardMember con permiso de lectura cancela un cargo.
```

### Controles

* permisos separados;
* `TenantPermissionGuard`;
* separación de funciones;
* auditoría;
* tests de autorización.

### Pruebas asociadas

```text id="cnlbvc"
AUTH-SOD-001 a AUTH-SOD-004
AUTH-FIN-003
AUTH-FIN-005
SEC-DUES-FIN-006
```

---

## 7.6. Generation in closed or locked period

### Descripción

El sistema genera cargos ordinarios en periodos cerrados o bloqueados.

### Impacto

Alto.

### Controles

* `BillingPeriodPolicyService`;
* estados `open`, `closed`, `locked`;
* validación en use case;
* tests de periodo.

### Pruebas asociadas

```text id="pe5kso"
APP-GEN-003
API-GEN-007
API-GEN-008
FIN-REG-004
```

---

## 7.7. Charge for inactive or archived property unit

### Descripción

Se generan cargos ordinarios para unidades archivadas o no operativas.

### Impacto

Alto.

### Controles

* `PropertyUnitReaderPort`;
* validación de estado de unidad;
* generación ordinaria solo para unidades activas;
* batch skippedItems;
* tests financieros.

### Pruebas asociadas

```text id="ni4pky"
APP-GEN-006
API-GEN-011
FIN-REG-002
```

---

## 7.8. Own charges data leak

### Descripción

Un usuario consulta cargos de unidades ajenas.

### Impacto

Alto.

### Controles

* `OwnChargePolicyService`;
* `OwnResourceReaderPort`;
* `UserProfile → Person → PropertyUnit`;
* filtro por unidades propias;
* no confiar en `propertyUnitId` enviado por cliente;
* tests `.own`.

### Pruebas asociadas

```text id="mmve0i"
SRV-OWN-CH-001 a SRV-OWN-CH-006
API-OWN-CH-001 a API-OWN-CH-008
TASK-123
```

---

## 7.9. Financial operation without audit

### Descripción

Una operación crítica no deja rastro auditable.

### Impacto

Crítico.

### Controles

* `DuesFeesAuditPort`;
* auditoría por endpoint;
* traceId;
* actorUserId;
* tenantId;
* pruebas de auditoría.

### Pruebas asociadas

```text id="qa96s3"
AUD-DUES-001 a AUD-DUES-016
TASK-132
```

---

## 7.10. Sensitive data in logs or batch error summary

### Descripción

Logs o `errorSummary` contienen payloads completos, tokens, datos personales o detalles financieros excesivos.

### Impacto

Alto.

### Controles

* sanitización de logs;
* no loggear payload completo;
* no usar datos personales en `errorSummary`;
* no usar labels de alta cardinalidad;
* tests de logging.

### Pruebas asociadas

```text id="ung6f2"
SEC-DUES-LOG-001 a SEC-DUES-LOG-006
OBS-DUES-009
TASK-131
```

---

## 8. Controles obligatorios por endpoint

## 8.1. `GET /api/v1/tenant/charge-concepts`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `chargeConcepts.read`;
* filtro por tenant;
* paginación;
* no exponer conceptos de otro tenant.

---

## 8.2. `POST /api/v1/tenant/charge-concepts`

Controles:

* autenticación;
* permiso `chargeConcepts.create`;
* `code` único por tenant;
* `defaultAmount` Decimal;
* `currency = USD`;
* no aceptar `tenantId` en body;
* auditoría `chargeConcept.created`.

---

## 8.3. `PATCH /api/v1/tenant/charge-concepts/{id}`

Controles:

* autenticación;
* permiso `chargeConcepts.update`;
* concepto pertenece al tenant;
* no modificar `tenantId`;
* no modificar `isSystem` sin permiso especial;
* auditoría `chargeConcept.updated`.

---

## 8.4. `POST /api/v1/tenant/charge-concepts/{id}/archive`

Controles:

* autenticación;
* permiso `chargeConcepts.archive`;
* concepto pertenece al tenant;
* no eliminación física;
* motivo recomendado;
* auditoría `chargeConcept.archived`.

---

## 8.5. `POST /api/v1/tenant/fee-schedules`

Controles:

* autenticación;
* permiso `feeSchedules.create`;
* concepto pertenece al tenant;
* concepto activo;
* monto Decimal positivo;
* moneda USD;
* vigencia válida;
* no aceptar `tenantId`;
* auditoría `feeSchedule.created`.

---

## 8.6. `POST /api/v1/tenant/unit-fees`

Controles:

* autenticación;
* permiso `unitFees.assign`;
* unidad pertenece al tenant;
* unidad activa;
* FeeSchedule pertenece al tenant;
* FeeSchedule activo;
* no duplicar asignación activa;
* fechas válidas;
* auditoría `unitFee.assigned`.

---

## 8.7. `POST /api/v1/tenant/unit-fees/{id}/end`

Controles:

* autenticación;
* permiso `unitFees.end`;
* asignación pertenece al tenant;
* asignación activa;
* `endDate >= startDate`;
* motivo requerido;
* no eliminación física;
* auditoría `unitFee.ended`.

---

## 8.8. `POST /api/v1/tenant/billing-periods`

Controles:

* autenticación;
* permiso `billingPeriods.create`;
* `periodCode` formato `YYYY-MM`;
* periodo único por tenant;
* `dueDate` válida;
* no aceptar `tenantId`;
* auditoría `billingPeriod.created`.

---

## 8.9. `POST /api/v1/tenant/billing-periods/{id}/close`

Controles:

* autenticación;
* permiso `billingPeriods.close`;
* periodo pertenece al tenant;
* periodo está `open`;
* motivo requerido;
* auditoría `billingPeriod.closed`.

---

## 8.10. `POST /api/v1/tenant/billing-periods/{id}/lock`

Controles:

* autenticación;
* permiso `billingPeriods.lock`;
* periodo pertenece al tenant;
* motivo requerido;
* auditoría `billingPeriod.locked`.

---

## 8.11. `POST /api/v1/tenant/charges/generate-monthly`

Controles:

* autenticación;
* permiso `fees.generate`;
* tenant activo;
* periodo pertenece al tenant;
* periodo `open`;
* FeeSchedule pertenece al tenant si se envía;
* FeeSchedule activo;
* assignments activos;
* unidades activas;
* idempotencia;
* batch stats;
* auditoría;
* evento `MonthlyFeesGenerated`.

---

## 8.12. `GET /api/v1/tenant/charge-batches`

Controles:

* autenticación;
* permiso `fees.readBatches`;
* filtro por tenant;
* paginación;
* `errorSummary` sanitizado.

---

## 8.13. `POST /api/v1/tenant/charges`

Controles:

* autenticación;
* permiso `charges.create`;
* unidad pertenece al tenant;
* concepto pertenece al tenant;
* periodo pertenece al tenant;
* periodo `open`;
* monto Decimal positivo;
* moneda USD;
* razón requerida para extraordinarios;
* header `Idempotency-Key` opcional;
* auditoría `charge.created`.

---

## 8.14. `POST /api/v1/tenant/charges/{id}/cancel`

Controles:

* autenticación;
* permiso `charges.cancel`;
* cargo pertenece al tenant;
* cargo cancelable;
* motivo requerido;
* no eliminación física;
* `effectiveAmount = 0.00`;
* `originalAmount` se conserva;
* auditoría `charge.cancelled`.

---

## 8.15. `POST /api/v1/tenant/charges/{id}/reverse`

Controles:

* autenticación;
* permiso `charges.reverse`;
* cargo pertenece al tenant;
* cargo reversible;
* no existe reverso previo;
* motivo requerido;
* `effectiveAmount = 0.00`;
* `originalAmount` se conserva;
* crear `ChargeReversal`;
* auditoría `charge.reversed`.

---

## 8.16. `POST /api/v1/tenant/charges/{id}/adjustments`

Controles:

* autenticación;
* permiso `charges.adjust`;
* cargo pertenece al tenant;
* cargo ajustable;
* monto Decimal positivo;
* motivo requerido;
* crear `ChargeAdjustment`;
* recalcular `effectiveAmount`;
* no modificar `originalAmount`;
* auditoría `charge.adjusted`.

---

## 8.17. `GET /api/v1/me/charges`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `charges.read.own`;
* resolver unidades propias;
* filtrar por unidades propias;
* no devolver cargos ajenos;
* no devolver cargos de otro tenant.

---

## 8.18. `GET /api/v1/me/property-units/{propertyUnitId}/charges`

Controles:

* autenticación;
* permiso `charges.read.own`;
* validar unidad propia;
* filtrar por tenant;
* responder 404 o 403 si la unidad no es propia;
* recomendado 404 para evitar enumeración.

---

## 9. Reglas de multitenancy

### 9.1. Regla principal

Todo recurso financiero debe cumplir:

```text id="sun5qx"
resource.tenantId == currentTenant.id
```

---

### 9.2. Relaciones financieras

Toda relación debe validar tenant:

```text id="0cnaea"
chargeConcept.tenantId == currentTenant.id
feeSchedule.tenantId == currentTenant.id
propertyUnit.tenantId == currentTenant.id
billingPeriod.tenantId == currentTenant.id
charge.tenantId == currentTenant.id
```

---

### 9.3. Prohibición

Está prohibido:

```text id="01j6b7"
crear, listar, consultar, cancelar, reversar, ajustar o generar cargos usando recursos de tenants distintos.
```

---

### 9.4. Respuesta recomendada

Para referencias cross-tenant:

```text id="w8wlf6"
403 CROSS_TENANT_REFERENCE
```

o, cuando se quiera ocultar existencia:

```text id="eutflv"
404 NOT_FOUND
```

La política debe ser consistente.

---

## 10. Reglas de acceso `.own`

### 10.1. Resolver unidades propias

Para consultar cargos propios:

```text id="cdwhxq"
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

```text id="5m252j"
tenantId = currentTenant.id
propertyUnitId IN ownPropertyUnitIds
```

---

### 10.3. Usuario sin persona vinculada

Si el usuario no tiene `Person` vinculada:

```text id="gyeknm"
403 OWN_PERSON_NOT_LINKED
```

---

### 10.4. Unidad ajena

Si el usuario solicita cargos de una unidad ajena:

```text id="aubjjj"
404 NOT_FOUND
```

recomendado para no revelar existencia.

---

### 10.5. Relaciones terminadas

Relaciones `ended`, `archived` o `suspended` no deben otorgar acceso operativo propio.

---

## 11. Reglas de precisión monetaria

### 11.1. Almacenamiento

Usar:

```text id="l52hiy"
DECIMAL(12,2)
```

para montos.

---

### 11.2. API

Montos en requests y responses:

```json id="stna0t"
{
  "amount": "50.00",
  "currency": "USD"
}
```

---

### 11.3. Validaciones

* monto requerido cuando aplique;
* monto positivo para cargos ordinarios, extraordinarios y manuales;
* ajustes con monto positivo y tipo que define dirección;
* moneda `USD` en MVP;
* máximo dos decimales;
* no redondeo silencioso.

---

### 11.4. Cálculo de effectiveAmount

Regla base:

```text id="o7myr0"
effectiveAmount = originalAmount
```

Cancelación:

```text id="qvbrm1"
effectiveAmount = 0.00
status = cancelled
```

Reverso:

```text id="u5tu9c"
effectiveAmount = 0.00
status = reversed
```

Ajuste:

```text id="vhla5u"
effectiveAmount = originalAmount + increases + surcharges - decreases - discounts
```

No permitir resultado negativo.

---

## 12. Reglas de idempotencia

### 12.1. Generación mensual

Clave recomendada:

```text id="fdhvos"
tenantId:billingPeriodId:feeScheduleId:propertyUnitId:ordinary
```

---

### 12.2. Constraint

```text id="r1z1ty"
unique(tenantId, idempotencyKey)
```

---

### 12.3. Reintentos

Ante reintento:

* no crear cargo duplicado;
* registrar como skipped o success idempotente;
* no fallar el batch completo si el duplicado es esperado;
* devolver conteos claros.

---

### 12.4. Concurrencia

Dos generaciones simultáneas deben producir:

```text id="7ft2zv"
una sola instancia lógica del cargo por unidad, periodo, schedule y tipo
```

---

### 12.5. Cargos manuales

Para cargos manuales o extraordinarios:

* `Idempotency-Key` recomendado;
* si se usa, debe aplicarse por tenant;
* key repetida debe devolver resultado consistente o conflicto documentado.

---

## 13. Reglas de no eliminación física

### 13.1. Recursos sin DELETE

No exponer `DELETE` para:

```text id="1z9qbs"
charge-concepts
fee-schedules
unit-fees
billing-periods
charge-batches
charges
charge-adjustments
charge-reversals
```

---

### 13.2. Acciones permitidas

Usar:

```text id="ipjve7"
archive
end
close
lock
cancel
reverse
adjust
```

---

### 13.3. Cargos emitidos

Un cargo emitido se conserva siempre.

Correcciones:

```text id="wp4qov"
cancelled
reversed
adjustment
```

---

## 14. Reglas de auditoría

### 14.1. Eventos auditables obligatorios

```text id="s4tk57"
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
chargeBatch.processing
chargeBatch.completed
chargeBatch.completedWithErrors
charge.created
charge.cancelled
charge.reversed
charge.adjusted
```

---

### 14.2. Campos mínimos

```text id="zhd3y4"
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

### 14.3. Campos financieros recomendados

```text id="4nc3j6"
billingPeriodId
propertyUnitId
chargeId
chargeConceptId
amount
currency
reason
batchId
```

---

### 14.4. Datos prohibidos en auditoría

Evitar:

```text id="6oybcs"
payload completo
tokens
headers de autenticación
datos personales de propietarios/residentes
datos bancarios
comprobantes
stack traces
```

---

## 15. Seguridad de logs

### 15.1. Permitido en logs

```text id="bdub9v"
traceId
tenantId
actorUserId
resourceType
resourceId
action
result
errorCode
latencyMs
billingPeriodId
chargeId
batchId
```

---

### 15.2. Prohibido en logs

```text id="zy0rzx"
Authorization header
access token
refresh token
cookies completas
payload completo
datos personales de propietarios
datos personales de residentes
datos bancarios
comprobantes
stack trace en producción
```

---

### 15.3. Logs de generación mensual

Deben registrar:

```text id="y2yu05"
batchId
billingPeriodId
totalItems
successItems
skippedItems
failedItems
status
traceId
```

No deben registrar:

```text id="93a4q0"
lista completa de propietarios
lista completa de residentes
payload completo de unidades
datos personales
```

---

## 16. Seguridad del modelo de datos

### 16.1. `tenant_id` obligatorio

Todas las tablas del módulo deben tener `tenant_id NOT NULL`.

---

### 16.2. `onDelete: Restrict`

Relaciones críticas deben usar:

```text id="39x9tc"
onDelete: Restrict
```

No usar cascade delete en recursos financieros.

---

### 16.3. Constraints obligatorias

Recomendadas:

```text id="7a91lr"
unique tenant+chargeConcept.code
unique tenant+billingPeriod.periodCode
unique tenant+charge.idempotencyKey
unique tenant+chargeReversal.chargeId
money amounts >= 0
adjustment amount > 0
valid date ranges
batch counts >= 0
```

---

### 16.4. Validación en aplicación

La base de datos no reemplaza validación de negocio.

Siempre validar:

```text id="pr5m92"
concepto pertenece al tenant
schedule pertenece al tenant
unidad pertenece al tenant
periodo pertenece al tenant
cargo pertenece al tenant
ajuste pertenece al tenant
reverso pertenece al tenant
```

---

## 17. Seguridad de estados financieros

### 17.1. ChargeConceptStatus

| Estado     | Uso para nuevos cargos |
| ---------- | ---------------------: |
| `active`   |                     Sí |
| `inactive` |                     No |
| `archived` |                     No |

---

### 17.2. FeeScheduleStatus

| Estado     |   Generación |
| ---------- | -----------: |
| `active`   |    Permitida |
| `inactive` | No permitida |
| `archived` | No permitida |

---

### 17.3. BillingPeriodStatus

| Estado     | Generación ordinaria |
| ---------- | -------------------: |
| `open`     |            Permitida |
| `closed`   |         No permitida |
| `locked`   |         No permitida |
| `archived` |         No permitida |

---

### 17.4. ChargeStatus

| Estado          |       Cancelar |       Reversar |   Ajustar |
| --------------- | -------------: | -------------: | --------: |
| `draft`         | Según política |             No |        Sí |
| `issued`        |             Sí |             Sí |        Sí |
| `partiallyPaid` |         Futuro |         Futuro |    Futuro |
| `paid`          |      No en MVP |      No en MVP | No en MVP |
| `cancelled`     |             No |             No |        No |
| `reversed`      |             No |             No |        No |
| `disputed`      | Según política | Según política |  Limitado |
| `archived`      |             No |             No |        No |

---

## 18. Separación de funciones

### 18.1. Permisos separados

Permisos críticos:

```text id="df69r0"
fees.generate
charges.create
charges.cancel
charges.reverse
charges.adjust
billingPeriods.close
billingPeriods.lock
```

No deben concederse por inferencia.

---

### 18.2. Roles sugeridos

| Rol           | Permisos recomendados                       |
| ------------- | ------------------------------------------- |
| TenantAdmin   | configuración y supervisión                 |
| Treasurer     | generación, cargos y ajustes según política |
| TenantAuditor | lectura y auditoría                         |
| BoardMember   | lectura limitada                            |
| PropertyOwner | `charges.read.own`                          |
| Resident      | `charges.read.own` si política lo permite   |

---

### 18.3. Operaciones críticas

Operaciones que podrían requerir step-up/MFA o aprobación futura:

```text id="mka9bg"
charges.reverse
charges.adjust
billingPeriods.lock
mass charge generation
mass extraordinary charge creation
```

En MVP se exige al menos permiso explícito y auditoría reforzada.

---

## 19. Validación de entrada

### 19.1. IDs

Validar formato de:

```text id="6z17q5"
chargeConceptId
feeScheduleId
unitFeeAssignmentId
billingPeriodId
chargeBatchId
chargeId
propertyUnitId
adjustmentId
reversalId
```

---

### 19.2. Strings

Aplicar:

* trim;
* longitud máxima;
* rechazo de valores vacíos;
* rechazo o sanitización de scripts;
* no almacenar payloads extensos en motivos.

---

### 19.3. Montos

Reglas:

```text id="6758s0"
amount decimal string
máximo 2 decimales
amount > 0 cuando aplique
currency = USD
```

---

### 19.4. Fechas

Validar:

```text id="i3sb1b"
effectiveTo >= effectiveFrom
endDate >= startDate
endsAt >= startsAt
dueDate válida
issuedDate válida
```

---

### 19.5. Campo `tenantId` en body

Para endpoints tenant-scoped, si el cliente envía `tenantId`:

```text id="xee1uo"
rechazar con VALIDATION_ERROR
```

Recomendación:

```text id="8u5fne"
No ignorar silenciosamente tenantId en operaciones financieras.
```

---

## 20. Seguridad de error responses

### 20.1. Error estándar

```json id="2gguyh"
{
  "error": {
    "code": "BILLING_PERIOD_NOT_OPEN",
    "message": "Monthly charges can only be generated for an open billing period.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 20.2. No exponer

No devolver:

```text id="xs0w24"
SQL completo
stack trace
detalles internos de Prisma
payload completo
tokens
datos personales
datos bancarios
estructura interna de permisos
```

---

### 20.3. Recurso ajeno

Para evitar enumeración, puede responderse:

```text id="0j0sog"
404 NOT_FOUND
```

en lugar de `403` cuando un usuario intenta acceder a cargo o unidad ajena mediante endpoint `.own`.

---

## 21. CORS

Endpoints financieros autenticados no deben tener CORS abierto en producción.

Prohibido:

```text id="4pjo3f"
Access-Control-Allow-Origin: *
```

Permitir solo orígenes oficiales de RESIDENT Core.

---

## 22. Rate limiting

Aplicar rate limiting recomendado en:

```text id="u41px9"
POST /api/v1/tenant/charges/generate-monthly
POST /api/v1/tenant/charges
POST /api/v1/tenant/charges/{chargeId}/cancel
POST /api/v1/tenant/charges/{chargeId}/reverse
POST /api/v1/tenant/charges/{chargeId}/adjustments
GET /api/v1/me/charges
```

Objetivos:

* evitar generación masiva abusiva;
* evitar enumeración de cargos;
* proteger operaciones financieras críticas;
* limitar reintentos maliciosos;
* reducir scraping de cargos propios.

---

## 23. Seguridad de seeds

### 23.1. Permitido

```text id="8d7h1u"
tenants demo
unidades demo
conceptos demo
alícuotas demo
periodos demo
montos ficticios
USD
```

---

### 23.2. Prohibido

```text id="md2rml"
montos reales de clientes
cargos reales
datos bancarios
pagos reales
comprobantes reales
nombres reales de propietarios
nombres reales de residentes
unidades reales fuera de fixtures
datos tributarios reales
```

---

## 24. Seguridad de batch generation

### 24.1. Batch transparente

Todo batch debe registrar:

```text id="3jgqvg"
requestedBy
startedAt
completedAt
totalItems
successItems
skippedItems
failedItems
status
```

---

### 24.2. Errores parciales

Errores parciales no deben ocultarse.

Deben registrarse en forma controlada, sin datos personales:

```text id="ixq0oc"
unit skipped because inactive
assignment skipped because ended
charge skipped because already exists
```

---

### 24.3. Dry run

`dryRun` no debe persistir cargos ni consumir claves de idempotencia.

---

### 24.4. Fallo durante generación

Si ocurre fallo parcial:

* no duplicar cargos ya creados;
* permitir reintento seguro;
* mantener batch auditable;
* marcar `completedWithErrors` si aplica;
* registrar `failedItems`.

---

## 25. Seguridad de ajustes, reversos y cancelaciones

### 25.1. Cancelación

Reglas:

```text id="uwm2hh"
requiere permiso charges.cancel
requiere motivo
no elimina cargo
effectiveAmount = 0
originalAmount se conserva
auditoría obligatoria
```

---

### 25.2. Reverso

Reglas:

```text id="rp8jda"
requiere permiso charges.reverse
requiere motivo
un reverso por cargo en MVP
crea ChargeReversal
status = reversed
effectiveAmount = 0
originalAmount se conserva
auditoría obligatoria
```

---

### 25.3. Ajuste

Reglas:

```text id="e1f9uy"
requiere permiso charges.adjust
requiere motivo
requiere amount positivo
crea ChargeAdjustment
recalcula effectiveAmount
no modifica originalAmount
auditoría obligatoria
```

---

### 25.4. Cargos pagados futuros

Cuando exista `005-payments`, operaciones sobre cargos pagados deberán restringirse.

MVP:

```text id="c457v2"
status paid y partiallyPaid son reservados y no deben operar ordinariamente.
```

---

## 26. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="432kf3"
- Tenant A no accede a cargos de Tenant B.
- Tenant A no usa concepto de Tenant B.
- Tenant A no usa unidad de Tenant B.
- Generación mensual repetida no duplica cargos.
- Generación mensual concurrente no duplica cargos.
- Periodo closed bloquea generación.
- Periodo locked bloquea generación.
- Unidad archived no genera cargo ordinario.
- Money usa Decimal.
- Montos se serializan como string.
- originalAmount no cambia con ajustes.
- Cancelación no elimina cargo.
- Reverso no elimina cargo.
- Ajuste no elimina cargo.
- Reverso duplicado falla.
- Usuario sin permiso no cancela.
- Usuario sin permiso no reversa.
- Usuario sin permiso no ajusta.
- Propietario no ve cargos de unidad ajena.
- Usuario sin Person no consulta cargos propios.
- Logs no contienen tokens.
- Logs no contienen payload completo.
- Batch errorSummary no contiene datos personales.
- No existen endpoints DELETE financieros.
```

---

## 27. Checklist de seguridad para PR

Antes de aprobar un PR de `004-dues-fees`:

```text id="sfqxqb"
[ ] Todo modelo financiero tiene tenantId obligatorio.
[ ] No hay cascade delete peligroso.
[ ] No hay DELETE físico ordinario.
[ ] Montos usan Decimal.
[ ] No se usa float ni double para dinero.
[ ] Montos salen en API como string.
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints tenant tienen TenantGuard.
[ ] Endpoints financieros tienen TenantPermissionGuard.
[ ] Endpoints .own validan OwnChargePolicyService.
[ ] Queries filtran por tenantId.
[ ] Conceptos validan tenant.
[ ] FeeSchedules validan tenant.
[ ] PropertyUnits validan tenant.
[ ] BillingPeriods validan tenant.
[ ] Charges validan tenant.
[ ] Generación mensual es idempotente.
[ ] `idempotencyKey` tiene unique constraint.
[ ] Periodos closed/locked bloquean generación.
[ ] Unidades archived no generan ordinarios.
[ ] originalAmount es inmutable.
[ ] effectiveAmount se recalcula correctamente.
[ ] Cancelación requiere motivo.
[ ] Reverso requiere motivo.
[ ] Ajuste requiere motivo.
[ ] Reverso duplicado está bloqueado.
[ ] Auditoría financiera existe.
[ ] Eventos financieros se emiten.
[ ] Logs están sanitizados.
[ ] Batch errorSummary está sanitizado.
[ ] Métricas no usan labels de alta cardinalidad.
[ ] OpenAPI documenta permisos, idempotencia y operación financiera.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests de idempotencia pasan.
[ ] Tests de precisión monetaria pasan.
[ ] Tests de regresión financiera pasan.
[ ] Seeds no contienen datos reales.
[ ] No se implementaron pagos fuera de alcance.
[ ] No se implementaron estados de cuenta consolidados fuera de alcance.
```

---

## 28. Riesgos residuales aceptados en MVP

| Riesgo                                   | Estado                 | Justificación                                  |
| ---------------------------------------- | ---------------------- | ---------------------------------------------- |
| Pagos diferidos                          | Aceptado temporalmente | Se implementarán en `005-payments`             |
| Estados de cuenta consolidados diferidos | Aceptado temporalmente | Se implementarán en `006-account-statements`   |
| Mora avanzada diferida                   | Aceptado temporalmente | Requiere reglas propias                        |
| Facturación electrónica diferida         | Aceptado temporalmente | Requiere integración tributaria                |
| Contabilidad completa diferida           | Aceptado temporalmente | Requiere plan de cuentas                       |
| Aprobación dual avanzada diferida        | Aceptado temporalmente | Requiere workflow                              |
| Carga masiva diferida                    | Aceptado temporalmente | Requiere módulo de archivos y validación batch |
| Notificaciones automáticas diferidas     | Aceptado temporalmente | Requiere módulo de comunicaciones              |
| n8n diferido                             | Aceptado temporalmente | Requiere webhooks firmados y service accounts  |

---

## 29. Pendientes de seguridad para specs futuras

### 29.1. `005-payments`

Debe asegurar:

* pagos asociados a tenant;
* pagos asociados a unidad/cargos correctos;
* asignación de pagos auditable;
* comprobantes protegidos;
* idempotencia de pagos;
* no duplicidad de pagos;
* reversos de pagos;
* validación de comprobantes;
* acceso propio a pagos.

---

### 29.2. `006-account-statements`

Debe asegurar:

* estados reconstruibles;
* saldos por unidad;
* cargos, ajustes, reversos y pagos consistentes;
* acceso propio solo a unidades propias;
* snapshots auditables si se usan;
* no exposición de información ajena.

---

### 29.3. `00X-late-fees`

Debe asegurar:

* cálculo correcto de mora;
* reglas por tenant;
* fechas de vencimiento;
* exoneraciones auditables;
* no capitalización indebida;
* no duplicidad de mora.

---

### 29.4. `00X-bank-reconciliation`

Debe asegurar:

* movimientos bancarios protegidos;
* matching auditable;
* no acceso a datos bancarios por usuarios no autorizados;
* no duplicidad de conciliaciones;
* reversos controlados.

---

### 29.5. `007-audit`

Debe asegurar:

* auditoría inmutable;
* exportación controlada;
* retención;
* consulta con permisos;
* trazabilidad de actor, tenant y recurso.

---

## 30. Criterios de aceptación de seguridad

La spec `004-dues-fees` cumple seguridad si:

* todo recurso financiero tiene `tenantId`;
* todo cargo se asocia a unidad del mismo tenant;
* ningún endpoint privado opera sin autenticación;
* ningún endpoint financiero opera sin permiso;
* ningún endpoint tenant-scoped opera sin membership activa;
* ningún usuario de Tenant A accede a cargos de Tenant B;
* ningún cargo se genera con concepto de otro tenant;
* ningún cargo se genera con unidad de otro tenant;
* la generación mensual es idempotente;
* no se duplican cargos;
* no se usa float para dinero;
* montos se manejan con Decimal;
* API expone montos como string;
* periodos closed/locked bloquean generación;
* unidades archived no generan cargos ordinarios;
* `originalAmount` no se sobrescribe;
* cancelación no elimina cargo;
* reverso no elimina cargo;
* ajuste no elimina cargo;
* usuarios `.own` solo ven cargos de unidades propias;
* auditoría financiera existe;
* eventos financieros existen;
* logs están sanitizados;
* batch errorSummary está sanitizado;
* OpenAPI documenta permisos e idempotencia;
* tests de autorización pasan;
* tests multitenant pasan;
* tests de idempotencia pasan;
* tests de precisión monetaria pasan;
* tests financieros pasan.

---

## 31. Decisión final de seguridad

El módulo `004-dues-fees` será tratado como módulo financiero crítico.

La seguridad del módulo se basa en:

```text id="10g10n"
tenant_id obligatorio
PropertyUnit como base del cargo
Decimal para dinero
moneda USD en MVP
idempotencyKey para generación mensual
originalAmount inmutable
effectiveAmount controlado
no eliminación física
periodos financieros con estados
permisos financieros separados
OwnChargePolicyService
auditoría financiera obligatoria
eventos financieros sanitizados
logs sin payload completo
tests de autorización
tests multitenant
tests de precisión monetaria
tests de idempotencia
tests de regresión financiera
```

La implementación no será aceptada si permite duplicar cargos mensuales, usar recursos de otro tenant, generar cargos sin unidad, usar float para dinero, sobrescribir `originalAmount`, eliminar cargos emitidos, operar en periodos cerrados sin control, omitir auditoría financiera o permitir que un propietario/residente consulte cargos de unidades ajenas.
