# Security Notes — Spec 006 Account Statements, Balances and Financial Position by Property Unit

## 1. Información del documento

| Campo           | Valor                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                 |
| Spec ID         | 006                                                                                           |
| Módulo          | Account Statements                                                                            |
| Documento       | Security Notes                                                                                |
| Ruta            | `docs/specs/006-account-statements/security-notes.md`                                         |
| Versión         | 0.1                                                                                           |
| Estado          | Borrador inicial                                                                              |
| Fecha           | 2026-07-14                                                                                    |
| Documento base  | `docs/specs/006-account-statements/spec.md`                                                   |
| Plan técnico    | `docs/specs/006-account-statements/plan.md`                                                   |
| Modelo de datos | `docs/specs/006-account-statements/data-model.md`                                             |
| Contrato API    | `docs/specs/006-account-statements/api-contract.md`                                           |
| Plan de pruebas | `docs/specs/006-account-statements/test-plan.md`                                              |
| Tareas          | `docs/specs/006-account-statements/tasks.md`                                                  |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `006-account-statements`.

El módulo administra información financiera consolidada por unidad habitacional:

* estados de cuenta;
* balances por unidad;
* líneas de estado de cuenta;
* movimientos financieros;
* saldos iniciales;
* saldos finales;
* saldos vencidos;
* saldos no vencidos;
* saldos a favor;
* pagos no asignados;
* snapshots de balance;
* exportaciones financieras;
* publicación de estados;
* cierre de estados;
* bloqueo de estados;
* regeneración de estados;
* acceso propio de propietarios y residentes.

Regla principal:

```text id="m4q8sr"
Un estado de cuenta incorrecto, no reconstruible, visible por un usuario no autorizado o generado con movimientos inválidos puede afectar saldos, cobranza, reportes financieros, confianza administrativa y trazabilidad legal del conjunto residencial.
```

---

## 3. Principios de seguridad financiera

### 3.1. Tenant como frontera obligatoria

Todo recurso del módulo debe pertenecer a un tenant.

Aplica a:

```text id="u8agr2"
AccountStatement
AccountStatementLine
UnitBalance
BalanceSnapshot
FinancialMovement DTO
ExportedStatement DTO
```

Regla:

```text id="isgmfm"
Ninguna operación de estados de cuenta puede ejecutarse sin validar tenantId.
```

---

### 3.2. Unidad habitacional como frontera financiera secundaria

Todo estado de cuenta, balance, snapshot y movimiento financiero debe asociarse a una unidad habitacional.

Regla:

```text id="kzjqch"
AccountStatement.propertyUnitId, UnitBalance.propertyUnitId y BalanceSnapshot.propertyUnitId son obligatorios.
```

La unidad debe pertenecer al mismo tenant.

---

### 3.3. Periodo financiero como contexto de statement

Todo `AccountStatement` de periodo debe estar asociado a un `BillingPeriod`.

Regla:

```text id="j9ox31"
AccountStatement.billingPeriodId es obligatorio.
```

El periodo debe pertenecer al mismo tenant.

---

### 3.4. Fuente de verdad financiera

El estado de cuenta no es la fuente primaria de verdad.

Fuentes primarias:

```text id="wqnyqn"
charges
charge_adjustments
charge_reversals
payments
payment_allocations
payment_reversals
```

Regla:

```text id="vq15yv"
AccountStatement y BalanceSnapshot son representaciones reconstruibles, no una segunda contabilidad.
```

---

### 3.5. Reconstruibilidad obligatoria

Todo statement debe poder reconstruirse desde sus líneas y movimientos fuente.

Regla:

```text id="lgtw40"
openingBalance + debitAmounts - creditAmounts = closingBalance o creditBalance según política de sobrepago.
```

---

### 3.6. Precisión monetaria obligatoria

Todos los cálculos deben usar Decimal.

Prohibido:

```text id="pqg5oc"
float
double
number para dinero sin Decimal
redondeo silencioso
```

Regla:

```text id="g97czl"
Los montos se almacenan como Decimal y se exponen por API como string decimal.
```

---

### 3.7. Source references obligatorias

Toda línea financiera debe tener:

```text id="zzesyi"
sourceType
sourceId
```

Ejemplos:

```text id="i0y9xl"
charge → charge_uuid
paymentAllocation → payment_allocation_uuid
chargeAdjustment → charge_adjustment_uuid
paymentReversal → payment_reversal_uuid
```

Regla:

```text id="sn2ne5"
Una línea financiera sin fuente no debe publicarse.
```

---

### 3.8. No eliminación física

No se debe eliminar físicamente:

```text id="u6ygco"
account_statements
account_statement_lines
unit_balances históricos auditados
balance_snapshots
```

Correcciones se hacen mediante:

```text id="jpwmjk"
regeneration
superseded
archive lógico
nuevo snapshot
auditoría
```

---

### 3.9. Snapshots controlados

Un snapshot conserva una vista del cálculo, pero no reemplaza movimientos base.

Regla:

```text id="uklypi"
Si el snapshot contradice los movimientos fuente, debe marcarse como stale, superseded o requerir regeneración controlada.
```

---

### 3.10. Acceso propio mínimo

Los endpoints `.own` solo pueden exponer estados, balances y movimientos de unidades propias.

Regla:

```text id="naxez2"
UserProfile → Person → PropertyUnit vigente.
```

---

## 4. Activos protegidos

Activos directos:

```text id="gye52o"
account_statements
account_statement_lines
unit_balances
balance_snapshots
statement_numbers
source_hashes
financial_movement_views
statement_exports
```

Activos indirectos:

```text id="oymmnv"
charges
charge_adjustments
charge_reversals
payments
payment_allocations
payment_reversals
property_units
owners
residents
billing_periods
audit_logs
financial_reports
collections
late_fees
notifications
```

Activos derivados:

```text id="ahze90"
closingBalance
overdueBalance
notDueBalance
creditBalance
unallocatedPaymentBalance
export files
CSV output
JSON output
```

---

## 5. Datos sensibles del módulo

### 5.1. Datos financieros

El módulo puede manejar:

```text id="oq59yr"
openingBalance
chargesTotal
adjustmentsTotal
paymentsTotal
reversalsTotal
closingBalance
overdueBalance
notDueBalance
creditBalance
unallocatedPaymentBalance
statement lines
movement descriptions
source references
period codes
statement numbers
```

---

### 5.2. Datos indirectamente personales

Un estado de cuenta puede revelar:

* deuda de una unidad;
* historial de pagos;
* fechas de incumplimiento;
* saldos vencidos;
* comportamiento financiero;
* unidad habitacional asociada;
* cargos específicos;
* pagos aplicados;
* relación económica entre persona y propiedad.

Aunque no contenga nombres explícitos, la combinación `PropertyUnit + Balance + Period` puede ser información sensible.

---

### 5.3. Datos que no deben incluirse en endpoints `.own`

No exponer a propietarios/residentes:

```text id="d6zwg4"
actorUserId internos
generatedBy
publishedBy
closedBy
lockedBy
sourceHash si se considera interno
auditoría interna
notas administrativas internas
detalles internos de permisos
traceId internos fuera de meta estándar
datos de otras unidades
datos de otros propietarios
datos de otros residentes
```

---

### 5.4. Datos que no deben almacenarse en esta spec

No almacenar en `006-account-statements`:

```text id="g4c7yu"
comprobantes de pago
archivos PDF avanzados
facturas electrónicas
asientos contables
movimientos bancarios importados
datos de conciliación bancaria
mensajes de cobranza
historial de notificaciones
datos tributarios
información bancaria completa
```

---

## 6. Superficies de ataque

### 6.1. Account Statements API administrativa

Ruta:

```text id="ig37nf"
/api/v1/tenant/account-statements
```

Riesgos:

* generar statement para unidad de otro tenant;
* generar statement con periodo de otro tenant;
* duplicar statements activos;
* publicar statement inconsistente;
* cerrar o bloquear sin motivo;
* regenerar sin auditoría;
* consultar estados de otro tenant;
* exportar estados masivos sin permiso;
* exponer saldos ajenos.

---

### 6.2. Balances API administrativa

Rutas:

```text id="y7pdxz"
/api/v1/tenant/balances
/api/v1/tenant/property-units/{propertyUnitId}/balance
```

Riesgos:

* consultar balance de otro tenant;
* recalcular con movimientos inválidos;
* usar pagos reversados como abonos;
* usar cargos cancelados como deuda;
* generar saldos incorrectos;
* exponer saldos sensibles a roles no autorizados.

---

### 6.3. Financial Movements API

Ruta:

```text id="ib1tio"
/api/v1/tenant/property-units/{propertyUnitId}/financial-movements
```

Riesgos:

* enumerar movimientos financieros;
* consultar movimientos de otra unidad;
* consultar movimientos de otro tenant;
* mostrar movimientos internos no visibles;
* mostrar reversos de forma confusa;
* exponer información financiera sensible.

---

### 6.4. Own Account Statements API

Ruta:

```text id="v18188"
/api/v1/me/account-statements
```

Riesgos:

* propietario ve estado de unidad ajena;
* residente ve información de propietario sin política;
* usuario sin Person accede a balances;
* relación finalizada sigue otorgando acceso;
* se exponen statements no publicados;
* se exponen líneas internas.

---

### 6.5. Exportación

Rutas:

```text id="i1wr29"
/api/v1/tenant/account-statements/{statementId}/export
/api/v1/me/account-statements/{statementId}/export
```

Riesgos:

* exportar información de otro tenant;
* exportar statement ajeno;
* exportar campos internos;
* exportar datos masivos sin control;
* logs con contenido completo del export;
* CSV injection;
* descarga no auditada.

---

## 7. Amenazas principales

## 7.1. Cross-tenant statement access

### Descripción

Un usuario de Tenant A accede a statements, balances, snapshots o movimientos de Tenant B.

### Impacto

Crítico.

### Controles

* `tenantId` obligatorio;
* `AuthGuard`;
* `TenantGuard`;
* `TenantPermissionGuard`;
* validación tenant en use cases;
* filtros por tenant en repositorios;
* validación tenant en `PropertyUnitReaderPort`;
* validación tenant en `BillingPeriodReaderPort`;
* validación tenant en `ChargeMovementReaderPort`;
* validación tenant en `PaymentMovementReaderPort`;
* pruebas multitenant.

### Pruebas asociadas

```text id="zvxjxo"
MT-AS-001 a MT-AS-012
API-AS-GEN-004
API-AS-GEN-005
API-AS-GET-002
API-AS-EXPORT-004
```

---

## 7.2. Incorrect balance calculation

### Descripción

El sistema calcula saldos incorrectos por incluir o excluir movimientos incorrectamente.

### Impacto

Crítico.

### Ejemplos

```text id="rzj5y4"
Incluir cargo cancelado como deuda.
Incluir pago reversado como abono.
Ignorar allocation activa.
No separar pago no asignado.
Calcular con float.
```

### Controles

* `BalanceCalculatorService`;
* Decimal obligatorio;
* source references;
* financial regression tests;
* reconstruction tests;
* snapshot consistency tests.

### Pruebas asociadas

```text id="q80imq"
SRV-AS-BAL-001 a SRV-AS-BAL-012
FIN-AS-001 a FIN-AS-016
MONEY-AS-001 a MONEY-AS-009
```

---

## 7.3. Non-reconstructible statement

### Descripción

Un estado de cuenta no puede justificarse desde movimientos fuente.

### Impacto

Crítico.

### Controles

* líneas con `sourceType` y `sourceId`;
* `StatementLineBuilderService`;
* `StatementTotalsService`;
* `sourceHash`;
* constraints de source;
* reconstruction tests.

### Pruebas asociadas

```text id="rf0hrj"
RECON-AS-001 a RECON-AS-010
SRV-AS-LINE-001 a SRV-AS-LINE-009
```

---

## 7.4. Duplicate active statement

### Descripción

Existen dos estados activos para la misma unidad y periodo.

### Impacto

Alto.

### Controles

* unique parcial por tenant + unidad + periodo;
* política de generación;
* modo `failIfExists`;
* regeneración controlada;
* tests de concurrencia.

### Pruebas asociadas

```text id="jfmgnc"
INT-AS-MIG-009
GEN-AS-002
CONC-AS-001
CONC-AS-006
```

---

## 7.5. Source duplication inside statement

### Descripción

Un cargo, ajuste o pago aplicado aparece dos veces en el mismo estado.

### Impacto

Alto.

### Controles

* unique por `accountStatementId + sourceType + sourceId + lineType`;
* `StatementLineBuilderService`;
* tests de reconstrucción;
* tests de repositorio.

### Pruebas asociadas

```text id="vqkbvd"
INT-AS-MIG-010
INT-AS-LINE-003
RECON-AS-010
```

---

## 7.6. Unauthorized publication

### Descripción

Un usuario sin permiso publica un estado de cuenta.

### Impacto

Alto.

### Controles

* permiso `accountStatements.publish`;
* `TenantPermissionGuard`;
* política de publicación;
* auditoría;
* separation-of-duties tests.

### Pruebas asociadas

```text id="llphm7"
AUTH-AS-003
AUTH-AS-005
AUTH-AS-SOD-002
APP-AS-PUB-005
```

---

## 7.7. Unauthorized regeneration

### Descripción

Un usuario regenera un estado publicado/cerrado sin permiso, motivo o auditoría.

### Impacto

Alto.

### Controles

* permiso `accountStatements.regenerate`;
* motivo obligatorio;
* policy de regeneración;
* statement anterior `superseded`;
* vínculo `previousStatementId`;
* auditoría reforzada;
* tests de regeneración.

### Pruebas asociadas

```text id="ak3dmv"
APP-AS-REGEN-001 a APP-AS-REGEN-008
GEN-AS-003 a GEN-AS-010
AUTH-AS-SOD-003
```

---

## 7.8. Own access data leakage

### Descripción

Un propietario o residente consulta estados, balances o movimientos de unidades ajenas.

### Impacto

Alto.

### Controles

* `OwnAccountStatementPolicyService`;
* `OwnResourceReaderPort`;
* filtro `propertyUnitId IN ownPropertyUnitIds`;
* ocultar recursos ajenos con 404;
* no exponer statements no publicados;
* no exponer líneas internas.

### Pruebas asociadas

```text id="frcz2p"
API-AS-OWN-LIST-001 a API-AS-OWN-LIST-008
API-AS-OWN-GET-001 a API-AS-OWN-EXPORT-003
SRV-AS-OWN-001 a SRV-AS-OWN-007
```

---

## 7.9. Snapshot inconsistency

### Descripción

Un snapshot queda desalineado de los movimientos fuente.

### Impacto

Alto.

### Controles

* `sourceHash`;
* snapshot status;
* `BalanceSnapshotService`;
* regeneración controlada;
* no actualización silenciosa de published statements;
* snapshot tests.

### Pruebas asociadas

```text id="zpamlu"
SNAP-AS-001 a SNAP-AS-007
RECON-AS-007
RECON-AS-008
```

---

## 7.10. Sensitive export leakage

### Descripción

Una exportación incluye datos internos o datos de otra unidad/tenant.

### Impacto

Alto.

### Controles

* permiso `accountStatements.export`;
* permiso `accountStatements.export.own`;
* `StatementExportService`;
* sanitización de CSV;
* audit event;
* no logs de documento completo;
* own export sin campos internos.

### Pruebas asociadas

```text id="bp77a9"
EXPORT-AS-001 a EXPORT-AS-009
SEC-AS-LOG-004
API-AS-OWN-EXPORT-003
```

---

## 8. Controles obligatorios por endpoint

## 8.1. `GET /api/v1/tenant/account-statements`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `accountStatements.read`;
* filtro por tenant;
* paginación;
* filtros validados;
* no exponer otro tenant;
* no exponer payload financiero completo innecesario.

---

## 8.2. `POST /api/v1/tenant/account-statements/generate`

Controles:

* autenticación;
* permiso `accountStatements.generate`;
* tenant activo;
* unidad pertenece al tenant;
* periodo pertenece al tenant;
* mode validado;
* reason requerido si regenera;
* excluir movimientos inválidos;
* crear líneas con source;
* validar consistencia;
* crear snapshot;
* auditar;
* emitir evento.

---

## 8.3. `POST /api/v1/tenant/account-statements/generate-batch`

Controles:

* autenticación;
* permiso `accountStatements.generate`;
* periodo pertenece al tenant;
* unidades pertenecen al tenant;
* dryRun no persiste;
* errores parciales controlados;
* no duplicar statements activos;
* auditar batch;
* no mezclar tenants.

---

## 8.4. `GET /api/v1/tenant/account-statements/{statementId}`

Controles:

* autenticación;
* permiso `accountStatements.read`;
* statement pertenece al tenant;
* líneas pertenecen al tenant;
* no exponer otro tenant;
* incluir campos internos solo para admin autorizado.

---

## 8.5. `POST /api/v1/tenant/account-statements/{statementId}/publish`

Controles:

* autenticación;
* permiso `accountStatements.publish`;
* statement pertenece al tenant;
* estado publicable;
* líneas consistentes;
* sourceHash vigente según política;
* no publicar superseded/archived;
* auditar.

---

## 8.6. `POST /api/v1/tenant/account-statements/{statementId}/close`

Controles:

* autenticación;
* permiso `accountStatements.close`;
* statement pertenece al tenant;
* motivo obligatorio;
* estado cerrable;
* no cerrar superseded/archived;
* auditar.

---

## 8.7. `POST /api/v1/tenant/account-statements/{statementId}/lock`

Controles:

* autenticación;
* permiso `accountStatements.lock`;
* statement pertenece al tenant;
* motivo obligatorio;
* estado bloqueable;
* no bloquear superseded/archived;
* auditar.

---

## 8.8. `POST /api/v1/tenant/account-statements/{statementId}/regenerate`

Controles:

* autenticación;
* permiso `accountStatements.regenerate`;
* statement pertenece al tenant;
* motivo obligatorio;
* política de regeneración;
* si está locked, permiso especial o rechazo;
* anterior queda superseded;
* nuevo statement vinculado;
* operación transaccional;
* auditar.

---

## 8.9. `GET /api/v1/tenant/account-statements/{statementId}/export`

Controles:

* autenticación;
* permiso `accountStatements.export`;
* statement pertenece al tenant;
* formato permitido;
* CSV sanitizado;
* no exportar otro tenant;
* no loggear export completo;
* auditar.

---

## 8.10. `GET /api/v1/tenant/balances`

Controles:

* autenticación;
* permiso `balances.read`;
* filtro por tenant;
* paginación;
* filtros validados;
* no exponer balances de otro tenant.

---

## 8.11. `GET /api/v1/tenant/property-units/{propertyUnitId}/balance`

Controles:

* autenticación;
* permiso `balances.read`;
* unidad pertenece al tenant;
* balance calculado o materializado desde movimientos válidos;
* Decimal;
* no mezclar tenants.

---

## 8.12. `POST /api/v1/tenant/property-units/{propertyUnitId}/balance/recalculate`

Controles:

* autenticación;
* permiso `balances.recalculate`;
* unidad pertenece al tenant;
* motivo recomendado o requerido según política;
* recalcular desde movimientos fuente;
* crear snapshot si se solicita;
* no modificar movimientos fuente;
* auditar.

---

## 8.13. `GET /api/v1/tenant/property-units/{propertyUnitId}/financial-movements`

Controles:

* autenticación;
* permiso `balances.read`;
* unidad pertenece al tenant;
* filtros validados;
* excluir inválidos por defecto;
* `includeReversed` controlado;
* no exponer otro tenant;
* auditar si aplica.

---

## 8.14. `GET /api/v1/me/account-statements`

Controles:

* autenticación;
* tenant activo;
* membership activa;
* permiso `accountStatements.read.own`;
* resolver unidades propias;
* mostrar solo statements visibles;
* ocultar generated no publicado;
* ocultar superseded/archived;
* no exponer auditoría interna.

---

## 8.15. `GET /api/v1/me/account-statements/{statementId}`

Controles:

* autenticación;
* permiso `accountStatements.read.own`;
* statement pertenece a unidad propia;
* statement visible para `.own`;
* ocultar líneas no visibles;
* no exponer campos internos;
* recurso ajeno responde 404 recomendado.

---

## 8.16. `GET /api/v1/me/property-units/{propertyUnitId}/balance`

Controles:

* autenticación;
* permiso `balances.read.own`;
* unidad propia;
* política tenant permite ver balance actual;
* no exponer unidad ajena;
* recurso ajeno responde 404 recomendado.

---

## 8.17. `GET /api/v1/me/property-units/{propertyUnitId}/financial-movements`

Controles:

* autenticación;
* permiso `balances.read.own`;
* unidad propia;
* movimientos visibles;
* ocultar información interna;
* no exponer movimientos de otra unidad.

---

## 8.18. `GET /api/v1/me/account-statements/{statementId}/export`

Controles:

* autenticación;
* permiso `accountStatements.export.own`;
* statement propio;
* statement visible;
* formato permitido;
* export sin campos internos;
* CSV sanitizado;
* auditar.

---

## 9. Reglas de multitenancy

### 9.1. Regla principal

Todo recurso debe cumplir:

```text id="d5h3q5"
resource.tenantId == currentTenant.id
```

---

### 9.2. Relaciones obligatorias

```text id="v2wn4a"
statement.tenantId == currentTenant.id
statement.propertyUnit.tenantId == currentTenant.id
statement.billingPeriod.tenantId == currentTenant.id

line.tenantId == statement.tenantId
line.propertyUnitId == statement.propertyUnitId
line.billingPeriodId == statement.billingPeriodId

balance.tenantId == currentTenant.id
balance.propertyUnit.tenantId == currentTenant.id

snapshot.tenantId == currentTenant.id
snapshot.propertyUnit.tenantId == currentTenant.id
snapshot.accountStatement.tenantId == snapshot.tenantId si existe
```

---

### 9.3. Source references tenant-scoped

Toda fuente debe pertenecer al tenant:

```text id="wj1je5"
charge.tenantId == currentTenant.id
paymentAllocation.tenantId == currentTenant.id
paymentReversal.tenantId == currentTenant.id
chargeAdjustment.tenantId == currentTenant.id
chargeReversal.tenantId == currentTenant.id
```

---

### 9.4. Respuesta recomendada

Para referencias cross-tenant administrativas:

```text id="zgqgtm"
403 CROSS_TENANT_REFERENCE
```

o:

```text id="c57i9d"
404 NOT_FOUND
```

Para endpoints `.own`, se recomienda:

```text id="crhs6k"
404 NOT_FOUND
```

para no revelar existencia.

---

## 10. Reglas de acceso `.own`

### 10.1. Resolver unidades propias

Para endpoints propios:

```text id="ksx4ez"
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

```text id="bo427b"
tenantId = currentTenant.id
propertyUnitId IN ownPropertyUnitIds
```

---

### 10.3. Usuario sin persona vinculada

Si el usuario no tiene `Person` vinculada:

```text id="q09g2a"
403 OWN_PERSON_NOT_LINKED
```

---

### 10.4. Unidad ajena

Si el usuario intenta consultar una unidad ajena:

```text id="h7um6r"
404 NOT_FOUND
```

---

### 10.5. Statement propio

Un statement es propio si:

```text id="tep3eh"
AccountStatement.propertyUnitId IN ownPropertyUnitIds
AND AccountStatement.tenantId = currentTenant.id
```

---

### 10.6. Balance propio

Un balance es propio si:

```text id="y8q4ql"
UnitBalance.propertyUnitId IN ownPropertyUnitIds
AND UnitBalance.tenantId = currentTenant.id
```

---

### 10.7. Visibilidad de statements

MVP recomendado:

```text id="u3rlyb"
Usuarios .own solo ven statements published, closed o locked publicados previamente.
```

No ven:

```text id="pjuwjr"
draft
generated no publicado
superseded
archived
```

---

### 10.8. Visibilidad de líneas

Si una línea tiene:

```text id="bdpkb0"
isVisibleToResident = false
```

no debe aparecer en endpoints `.own`.

---

## 11. Reglas de precisión monetaria

### 11.1. Almacenamiento

Usar:

```text id="b1n8zm"
DECIMAL(12,2)
```

para montos.

---

### 11.2. API

Montos como string:

```json id="ynq4rf"
{
  "openingBalance": "0.00",
  "chargesTotal": "60.00",
  "paymentsTotal": "50.00",
  "closingBalance": "10.00",
  "currency": "USD"
}
```

---

### 11.3. Validaciones

* monto no negativo;
* máximo dos decimales;
* moneda `USD` en MVP;
* sin redondeo silencioso;
* no usar float;
* saldo a favor separado;
* saldo deudor no negativo;
* notDueBalance no negativo;
* overdueBalance no negativo.

---

## 12. Reglas de cálculo seguro

### 12.1. Débitos y créditos

Débito aumenta saldo deudor.

Crédito reduce saldo deudor o genera saldo a favor.

```text id="uy7stg"
balanceAfterLine = previousBalance + debitAmount - creditAmount
```

---

### 12.2. Sobrepago

Si el resultado es negativo:

```text id="iw1pt9"
closingBalance = 0.00
creditBalance = abs(rawClosingBalance)
```

---

### 12.3. Cargos válidos

Se incluyen cargos:

```text id="nq1urw"
issued
partiallyPaid
unpaid
paid si se muestra histórico con pago aplicado
```

Se excluyen como deuda activa:

```text id="fx7igm"
cancelled
reversed
archived
```

---

### 12.4. Pagos válidos

Solo reducen saldo:

```text id="azb48u"
PaymentAllocation.status = active
Payment.status confirmed, partiallyAllocated o allocated según política de pagos
```

No reducen saldo:

```text id="tv6usv"
Payment.status = reversed
Payment.status = rejected
Payment.status = cancelled
PaymentAllocation.status = reversed
PaymentAllocation.status = cancelled
```

---

### 12.5. Pagos no asignados

Los pagos confirmados no asignados se muestran como:

```text id="d5f7g9"
unallocatedPaymentBalance
```

No reducen cargos específicos hasta que exista `PaymentAllocation`.

---

## 13. Reglas de sourceHash

### 13.1. Propósito

`sourceHash` permite detectar si los movimientos fuente cambiaron desde la generación del statement.

---

### 13.2. Datos permitidos en hash

Puede incluir:

```text id="tngvpk"
tenantId
propertyUnitId
billingPeriodId
source ids
source updatedAt
source amount
source status
source effectiveAmount
```

No debe incluir:

```text id="p2j3ot"
nombres de personas
emails
teléfonos
direcciones
payloads completos
comprobantes
tokens
datos bancarios
```

---

### 13.3. Uso seguro

Si `sourceHash` actual difiere del almacenado:

```text id="vdbj3f"
no actualizar statement publicado silenciosamente
requerir regeneración controlada
auditar
marcar stale si aplica
```

---

## 14. Reglas de publicación, cierre, bloqueo y regeneración

### 14.1. Publicación

Requiere:

```text id="kzy52a"
accountStatements.publish
statement generated
líneas consistentes
source references válidas
totales correctos
auditoría
```

No publicar:

```text id="wdufry"
superseded
archived
inconsistent
stale crítico
```

---

### 14.2. Cierre

Requiere:

```text id="twe718"
accountStatements.close
motivo
statement cerrable
auditoría
```

---

### 14.3. Bloqueo

Requiere:

```text id="ldiz3k"
accountStatements.lock
motivo
statement bloqueable
auditoría
```

---

### 14.4. Regeneración

Requiere:

```text id="bwvku9"
accountStatements.regenerate
motivo
política de regeneración
transacción
statement anterior superseded
nuevo statement vinculado
nuevo snapshot
auditoría
```

---

## 15. Reglas de exportación segura

### 15.1. Formatos permitidos MVP

```text id="h0151d"
json
csv
```

PDF avanzado queda diferido.

---

### 15.2. Exportación administrativa

Requiere:

```text id="y9mv57"
accountStatements.export
```

Puede incluir source references si el usuario tiene permiso.

---

### 15.3. Exportación propia

Requiere:

```text id="wmzj9p"
accountStatements.export.own
```

Debe ocultar:

```text id="jv32as"
actorUserId
generatedBy
publishedBy
closedBy
lockedBy
sourceHash
auditoría interna
notas internas
líneas no visibles
```

---

### 15.4. CSV injection

Al exportar CSV, sanitizar celdas que empiecen con:

```text id="fla7uh"
=
+
-
@
```

Regla:

```text id="o0b009"
Los valores de texto exportados a CSV deben neutralizar fórmulas potencialmente ejecutables.
```

---

### 15.5. Logs de exportación

No registrar:

```text id="qjzg1h"
contenido completo del export
CSV completo
JSON completo
datos personales innecesarios
```

Registrar solo:

```text id="tx8b0h"
statementId
tenantId
actorUserId
format
result
traceId
```

---

## 16. Reglas de no eliminación física

### 16.1. Recursos sin DELETE

No exponer `DELETE` para:

```text id="vz0duf"
account-statements
account-statement-lines
unit-balances
balance-snapshots
```

---

### 16.2. Acciones permitidas

Usar:

```text id="r9qj4o"
publish
close
lock
regenerate
supersede
archive lógico futuro
```

---

### 16.3. Statements publicados/cerrados/bloqueados

Deben conservarse.

Correcciones:

```text id="g9y1op"
nuevo statement regenerado
statement anterior superseded
nuevo snapshot
auditoría
```

---

## 17. Reglas de auditoría

### 17.1. Eventos auditables obligatorios

```text id="ejyms7"
accountStatement.generated
accountStatement.batchGenerated
accountStatement.published
accountStatement.closed
accountStatement.locked
accountStatement.regenerated
accountStatement.superseded
accountStatement.exported
accountStatement.viewedSensitive
balance.calculated
balance.recalculated
balance.snapshotCreated
financialMovements.viewed
```

---

### 17.2. Campos mínimos

```text id="h9x6pk"
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

```text id="ixs0tk"
statementId
propertyUnitId
billingPeriodId
openingBalance
closingBalance
outstandingBalance
overdueBalance
creditBalance
reason
```

---

### 17.4. Datos prohibidos en auditoría

Evitar:

```text id="cad405"
payload completo
export completo
tokens
headers de autenticación
datos personales innecesarios
stack traces
SQL completo
secrets
```

---

## 18. Seguridad de logs

### 18.1. Permitido en logs

```text id="byb7jn"
traceId
tenantId
actorUserId
resourceType
resourceId
action
result
errorCode
latencyMs
statementId
billingPeriodId
```

---

### 18.2. Prohibido en logs

```text id="wr9ojs"
Authorization header
access token
refresh token
cookies completas
payload completo
export completo
datos personales innecesarios
sourceHash si se considera sensible
SQL completo
stack trace en producción
secrets
```

---

### 18.3. Logs de cálculo

Los logs de cálculo no deben contener todas las líneas financieras.

Permitido:

```text id="dvgf6w"
statementId
lineCount
movementCount
result
traceId
```

Prohibido:

```text id="s2xn06"
lista completa de movimientos
datos personales
payload completo de cargos o pagos
```

---

## 19. Seguridad del modelo de datos

### 19.1. `tenant_id` obligatorio

Todas las tablas del módulo deben tener `tenant_id NOT NULL`.

---

### 19.2. `property_unit_id` obligatorio

Aplica a:

```text id="opybuw"
account_statements
account_statement_lines
unit_balances
balance_snapshots
```

---

### 19.3. `billing_period_id` obligatorio en AccountStatement

```text id="s50v3p"
account_statements.billing_period_id NOT NULL
```

---

### 19.4. `onDelete: Restrict`

Relaciones críticas deben usar:

```text id="f6h7yf"
onDelete: Restrict
```

No usar cascade delete en recursos financieros.

---

### 19.5. Constraints obligatorias

Recomendadas:

```text id="b2p4ow"
statement amounts non-negative
line_count non-negative
close_reason required when closed
lock_reason required when locked
regeneration_reason required when previousStatementId exists
line debit/credit non-negative
line debit and credit mutually exclusive
financial source required
unit balances non-negative
snapshots non-negative
```

---

### 19.6. Índices únicos críticos

Recomendados:

```text id="i881zd"
unique tenant + statementNumber
unique active tenant + propertyUnit + billingPeriod
unique accountStatement + sourceType + sourceId + lineType
unique accountStatement + sortOrder
unique tenant + propertyUnit + currency for UnitBalance
```

---

## 20. Seguridad de estados

### 20.1. AccountStatementStatus

| Estado       |       Publicar |            Cerrar |          Bloquear |         Regenerar |
| ------------ | -------------: | ----------------: | ----------------: | ----------------: |
| `draft`      |   No ordinario |                No |                No | Sí según política |
| `generated`  |             Sí | Sí según política | Sí según política |                Sí |
| `published`  | No/idempotente |                Sí |                Sí |     Sí con motivo |
| `closed`     |             No |                No |                Sí |     Sí con motivo |
| `locked`     |             No |      No ordinario |                No |      No ordinario |
| `superseded` |             No |                No |                No |                No |
| `archived`   |             No |                No |                No |                No |

---

### 20.2. BalanceSnapshotStatus

| Estado       |     Uso operativo |  Visible admin | Reemplazable |
| ------------ | ----------------: | -------------: | -----------: |
| `current`    |                Sí |             Sí |           Sí |
| `superseded` |      No operativo |   Sí histórico |           No |
| `closed`     | Histórico cerrado |             Sí | No ordinario |
| `archived`   |      No operativo | Sí restringido |           No |

---

## 21. Separación de funciones

### 21.1. Permisos separados

Permisos críticos:

```text id="kficd4"
accountStatements.generate
accountStatements.read
accountStatements.publish
accountStatements.close
accountStatements.lock
accountStatements.regenerate
accountStatements.export
balances.read
balances.recalculate
accountStatements.read.own
accountStatements.export.own
balances.read.own
```

---

### 21.2. Reglas

```text id="zekj1i"
accountStatements.read ≠ accountStatements.generate
accountStatements.generate ≠ accountStatements.publish
accountStatements.publish ≠ accountStatements.regenerate
balances.read ≠ balances.recalculate
accountStatements.read.own ≠ accountStatements.export.own
```

---

### 21.3. Operaciones críticas

Operaciones que podrían requerir aprobación futura:

```text id="iufjac"
regenerate locked statement
bulk export
batch generation for closed period
close billing period
publish all statements
recalculate all balances
```

En MVP se exige permiso explícito, motivo cuando aplique y auditoría.

---

## 22. Validación de entrada

### 22.1. IDs

Validar formato de:

```text id="hnuu34"
statementId
propertyUnitId
billingPeriodId
snapshotId
sourceId
```

---

### 22.2. Campos prohibidos en body

Rechazar si el cliente envía:

```text id="nn9g79"
tenantId
status arbitrario
generatedBy
publishedBy
closedBy
lockedBy
sourceHash
totales calculados
balances calculados
```

---

### 22.3. Sort y filtros

Validar:

```text id="q8jjan"
sortBy permitido
sortOrder asc/desc
pageSize máximo 100
periodCode YYYY-MM
format json/csv
```

---

### 22.4. Motivos

Motivo requerido para:

```text id="usf3qu"
close
lock
regenerate
```

Validar:

* no vacío;
* longitud máxima;
* sin payload excesivo;
* sin scripts.

---

## 23. Seguridad de errores

### 23.1. Error estándar

```json id="q4h4zn"
{
  "error": {
    "code": "ACCOUNT_STATEMENT_NOT_REGENERABLE",
    "message": "This account statement cannot be regenerated in its current state.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 23.2. No exponer

No devolver:

```text id="envhn4"
SQL
stack trace
detalles internos de Prisma
payload completo
sourceHash interno
datos personales
export completo
estructura interna de permisos
```

---

### 23.3. Recurso ajeno `.own`

Para evitar enumeración:

```text id="i7m8m8"
404 NOT_FOUND
```

---

## 24. CORS

Endpoints financieros autenticados no deben tener CORS abierto en producción.

Prohibido:

```text id="a8l6zc"
Access-Control-Allow-Origin: *
```

Permitir únicamente orígenes oficiales de RESIDENT Core.

---

## 25. Rate limiting

Aplicar rate limiting recomendado en:

```text id="zfoxu3"
POST /api/v1/tenant/account-statements/generate
POST /api/v1/tenant/account-statements/generate-batch
POST /api/v1/tenant/account-statements/{statementId}/publish
POST /api/v1/tenant/account-statements/{statementId}/close
POST /api/v1/tenant/account-statements/{statementId}/lock
POST /api/v1/tenant/account-statements/{statementId}/regenerate
GET /api/v1/tenant/account-statements/{statementId}/export
POST /api/v1/tenant/property-units/{propertyUnitId}/balance/recalculate
GET /api/v1/me/account-statements/{statementId}/export
```

Objetivos:

* evitar abuso de generación;
* evitar regeneraciones repetidas;
* proteger exportaciones;
* reducir enumeración;
* proteger operaciones financieras críticas.

---

## 26. Seguridad de seeds

### 26.1. Permitido

```text id="smgj6a"
tenants demo
unidades demo
periodos demo
cargos demo
pagos demo
statements demo
balances demo
snapshots demo
montos ficticios
USD
```

---

### 26.2. Prohibido

```text id="s8xajw"
estados reales
saldos reales
datos reales de propietarios
datos reales de residentes
comprobantes reales
referencias bancarias reales
documentos financieros reales
exports reales
```

---

## 27. Seguridad transaccional

Operaciones que deben ser transaccionales:

```text id="im9414"
generate statement
generate batch por unidad
publish si valida sourceHash y líneas
close statement
lock statement
regenerate statement
recalculate balance con snapshot
```

Regeneración transaccional:

```text id="b9wima"
1. validar statement anterior;
2. validar motivo;
3. obtener movimientos actuales;
4. generar nuevo statement;
5. crear nuevas líneas;
6. crear snapshot;
7. marcar anterior superseded;
8. vincular previousStatementId y supersededBy;
9. auditar;
10. emitir eventos.
```

Si falla cualquier paso, toda la operación debe revertirse.

---

## 28. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="i062wa"
- Tenant A no accede a statements de Tenant B.
- Tenant A no genera statement para unidad de Tenant B.
- Tenant A no genera statement para periodo de Tenant B.
- Tenant A no exporta statement de Tenant B.
- Propietario no consulta statement ajeno.
- Residente no consulta balance ajeno.
- Usuario sin Person no accede a endpoints own.
- Statement no publicado no aparece en own.
- Línea invisible no aparece en own.
- Cargos cancelados no suman.
- Cargos reversados no suman.
- Pagos reversados no reducen.
- Allocations reversadas no reducen.
- Pagos no asignados se separan.
- Cálculos usan Decimal.
- Statements reconstruyen closingBalance.
- Líneas financieras tienen sourceType/sourceId.
- Source pertenece al tenant.
- Source pertenece a la unidad.
- No hay statement activo duplicado.
- No hay source duplicado.
- SourceHash detecta cambios.
- Regeneración requiere motivo.
- Cierre requiere motivo.
- Bloqueo requiere motivo.
- No existen DELETE ordinarios.
- Export own no incluye campos internos.
- CSV export neutraliza fórmulas.
- Logs no contienen Authorization header.
- Logs no contienen export completo.
- Métricas no usan propertyUnitId ni statementId como labels.
```

---

## 29. Checklist de seguridad para PR

Antes de aprobar un PR de `006-account-statements`:

```text id="vkgl9f"
[ ] Todo modelo tiene tenantId obligatorio.
[ ] Todo statement tiene propertyUnitId.
[ ] Todo statement tiene billingPeriodId.
[ ] Todo balance tiene propertyUnitId.
[ ] Todo snapshot tiene propertyUnitId.
[ ] Montos usan Decimal.
[ ] No se usa float ni double.
[ ] API expone montos como string.
[ ] No hay DELETE ordinario.
[ ] No hay cascade delete peligroso.
[ ] Queries filtran por tenantId.
[ ] PropertyUnit valida tenant.
[ ] BillingPeriod valida tenant.
[ ] Source references validan tenant.
[ ] Source references validan unidad.
[ ] Líneas financieras tienen sourceType/sourceId.
[ ] No hay sources duplicados.
[ ] No hay statement activo duplicado.
[ ] Cargos cancelados no suman.
[ ] Cargos reversados no suman.
[ ] Pagos reversados no reducen.
[ ] Allocations reversadas no reducen.
[ ] Pagos no asignados se separan.
[ ] BalanceCalculator tiene tests.
[ ] StatementLineBuilder tiene tests.
[ ] StatementTotals tiene tests.
[ ] sourceHash implementado.
[ ] Snapshot se crea al generar.
[ ] Snapshot no reemplaza movimientos base.
[ ] Publicación valida consistencia.
[ ] Cierre requiere motivo.
[ ] Bloqueo requiere motivo.
[ ] Regeneración requiere motivo.
[ ] Regeneración marca anterior superseded.
[ ] Export admin requiere permiso.
[ ] Export own requiere permiso own.
[ ] Export own oculta campos internos.
[ ] CSV export neutraliza fórmulas.
[ ] Own endpoints validan unidades propias.
[ ] Own endpoints ocultan statements no publicados.
[ ] Own endpoints ocultan líneas internas.
[ ] Logs están sanitizados.
[ ] Auditoría financiera implementada.
[ ] Eventos financieros implementados.
[ ] OpenAPI documenta permisos.
[ ] OpenAPI documenta own policy.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests own pasan.
[ ] Tests de precisión monetaria pasan.
[ ] Tests de reconstrucción pasan.
[ ] Tests de snapshots pasan.
[ ] Tests de exportación pasan.
[ ] Tests de regresión financiera pasan.
[ ] Seeds no contienen datos reales.
[ ] No se implementó mora avanzada fuera de alcance.
[ ] No se implementó cobranza fuera de alcance.
[ ] No se implementó conciliación bancaria fuera de alcance.
[ ] No se implementó PDF avanzado fuera de alcance.
```

---

## 30. Riesgos residuales aceptados en MVP

| Riesgo                               | Estado                 | Justificación                                 |
| ------------------------------------ | ---------------------- | --------------------------------------------- |
| Mora avanzada diferida               | Aceptado temporalmente | Requiere reglas por tenant y fechas de gracia |
| Cobranza automatizada diferida       | Aceptado temporalmente | Requiere comunicaciones y escalamiento        |
| Notificaciones automáticas diferidas | Aceptado temporalmente | Requiere módulo de comunicaciones             |
| PDF avanzado diferido                | Aceptado temporalmente | MVP usa JSON/CSV                              |
| Firma electrónica diferida           | Aceptado temporalmente | Requiere proveedor y validez legal            |
| Conciliación bancaria diferida       | Aceptado temporalmente | Requiere movimientos bancarios                |
| Facturación electrónica diferida     | Aceptado temporalmente | Requiere integración tributaria               |
| Contabilidad completa diferida       | Aceptado temporalmente | Requiere plan de cuentas                      |
| Dashboards avanzados diferidos       | Aceptado temporalmente | Requiere reporting layer                      |
| n8n automations diferidas            | Aceptado temporalmente | Requiere webhooks firmados                    |

---

## 31. Pendientes de seguridad para specs futuras

### 31.1. `00X-late-fees`

Debe asegurar:

* cálculo de mora auditado;
* exoneraciones controladas;
* reglas por tenant;
* no interés compuesto no autorizado;
* pruebas financieras.

---

### 31.2. `00X-collections`

Debe asegurar:

* comunicaciones auditadas;
* escalamiento controlado;
* historial de cobranza;
* privacidad de deudores;
* reglas legales.

---

### 31.3. `009-notifications`

Debe asegurar:

* templates seguros;
* no exponer saldos a destinatarios incorrectos;
* opt-in/opt-out si aplica;
* trazabilidad de delivery.

---

### 31.4. `00X-statement-documents`

Debe asegurar:

* PDF versionado;
* almacenamiento privado;
* descarga autorizada;
* hash documental;
* no documentos obsoletos como vigentes.

---

### 31.5. `00X-bank-reconciliation`

Debe asegurar:

* movimientos bancarios protegidos;
* matching auditable;
* control de duplicados;
* no exposición bancaria.

---

### 31.6. `007-audit`

Debe asegurar:

* auditoría inmutable;
* retención;
* exportación restringida;
* trazabilidad tenant/actor/recurso.

---

## 32. Criterios de aceptación de seguridad

La spec `006-account-statements` cumple seguridad si:

* todo statement tiene tenantId;
* todo statement tiene propertyUnitId;
* todo statement de periodo tiene billingPeriodId;
* toda línea tiene tenantId;
* toda línea financiera tiene sourceType/sourceId;
* todo balance tiene tenantId y propertyUnitId;
* todo snapshot tiene tenantId y propertyUnitId;
* no existe acceso cross-tenant;
* no existe acceso own a unidad ajena;
* no se exponen statements no publicados en own;
* no se exponen líneas internas en own;
* no se usa float;
* los montos se exponen como string;
* los cálculos son reconstruibles;
* los source references se validan;
* los sourceHash detectan cambios;
* no hay statement activo duplicado;
* no hay source duplicado;
* cargos cancelados no suman;
* cargos reversados no suman;
* pagos reversados no reducen;
* allocations reversadas no reducen;
* pagos no asignados se separan;
* publicación valida consistencia;
* cierre requiere motivo;
* bloqueo requiere motivo;
* regeneración requiere motivo;
* regeneración deja anterior superseded;
* snapshots no reemplazan movimientos base;
* export own oculta campos internos;
* export CSV neutraliza fórmulas;
* no existen DELETE ordinarios;
* auditoría financiera existe;
* eventos financieros existen;
* logs están sanitizados;
* OpenAPI documenta permisos y own policy;
* tests de autorización pasan;
* tests multitenant pasan;
* tests own pasan;
* tests de precisión monetaria pasan;
* tests de reconstrucción pasan;
* tests de snapshots pasan;
* tests financieros pasan.

---

## 33. Decisión final de seguridad

El módulo `006-account-statements` será tratado como módulo financiero crítico.

La seguridad del módulo se basa en:

```text id="gc9el8"
tenant_id obligatorio
property_unit_id obligatorio
billing_period_id obligatorio
Decimal para dinero
moneda USD en MVP
sourceType y sourceId en líneas financieras
sourceHash para detectar cambios
statements reconstruibles
snapshots versionados
no eliminación física
regeneración controlada
superseded statement
exportación segura
CSV sanitizado
permisos financieros separados
OwnAccountStatementPolicyService
auditoría financiera obligatoria
eventos financieros sanitizados
logs sin payload completo
tests de autorización
tests multitenant
tests own access
tests de precisión monetaria
tests de reconstrucción
tests de snapshots
tests de exportación
tests de regresión financiera
```

La implementación no será aceptada si permite statements no reconstruibles, cálculos con float, statements duplicados activos, líneas financieras sin fuente, sources duplicados, acceso cross-tenant, consulta own de unidades ajenas, publicación de statements inconsistentes, regeneración sin motivo, exportación sin permiso, snapshots que reemplacen movimientos base, logs con export completo o inclusión de cargos/pagos inválidos en el cálculo.
