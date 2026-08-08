# Test Plan — Spec 006 Account Statements, Balances and Financial Position by Property Unit

## 1. Información del documento

| Campo                    | Valor                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| Proyecto                 | RESIDENT Core                                                                                 |
| Spec ID                  | 006                                                                                           |
| Módulo                   | Account Statements                                                                            |
| Documento                | Test Plan                                                                                     |
| Ruta                     | `docs/specs/006-account-statements/test-plan.md`                                              |
| Versión                  | 0.1                                                                                           |
| Estado                   | Borrador inicial                                                                              |
| Fecha                    | 2026-07-14                                                                                    |
| Documento base           | `docs/specs/006-account-statements/spec.md`                                                   |
| Plan técnico             | `docs/specs/006-account-statements/plan.md`                                                   |
| Modelo de datos          | `docs/specs/006-account-statements/data-model.md`                                             |
| Contrato API             | `docs/specs/006-account-statements/api-contract.md`                                           |
| Depende de               | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments` |
| Framework sugerido       | Jest + Supertest                                                                              |
| Base de datos de pruebas | PostgreSQL test database                                                                      |
| Prioridad                | Alta                                                                                          |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `006-account-statements`.

El objetivo es validar que RESIDENT Core calcule, genere, publique, cierre, bloquee, regenere, consulte y exporte estados de cuenta de forma:

* precisa;
* reconstruible;
* auditable;
* tenant-scoped;
* segura;
* consistente con cargos;
* consistente con pagos;
* compatible con acceso propio;
* compatible con futuras reglas de mora, cobranza, reportes y conciliación.

Regla central:

```text id="fwxwox"
Ningún estado de cuenta, balance o movimiento financiero debe aceptarse si no puede reconstruirse desde cargos, pagos, ajustes, reversos y asignaciones auditables.
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
* balance calculation tests;
* statement generation tests;
* batch generation tests;
* statement line reconstruction tests;
* snapshot consistency tests;
* regeneration tests;
* export tests;
* financial regression tests;
* audit tests;
* event tests;
* observability tests;
* OpenAPI tests;
* smoke tests.

---

### 3.2. No incluido

No cubre todavía:

* mora avanzada;
* intereses compuestos;
* cobranza automatizada;
* notificaciones automáticas;
* envío por correo;
* envío por WhatsApp;
* PDF avanzado;
* firma electrónica;
* conciliación bancaria;
* pasarela de pagos;
* facturación electrónica;
* asientos contables;
* dashboards ejecutivos;
* reportes financieros avanzados;
* aprobación dual avanzada;
* integración n8n completa.

Estos temas serán cubiertos por specs futuras.

---

## 4. Estrategia general

El módulo se probará por capas:

```text id="kxyk1k"
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
Balance calculation tests
Statement generation tests
Statement reconstruction tests
Snapshot consistency tests
Export tests
Concurrency tests
Financial regression tests
Audit tests
Event tests
Observability tests
OpenAPI tests
Smoke tests
```

Reglas obligatorias:

```text id="zrugak"
1. Todo endpoint privado debe tener prueba 401 sin token.
2. Todo endpoint financiero debe tener prueba 403 sin permiso.
3. Todo endpoint tenant-scoped debe tener prueba cross-tenant negativa.
4. Todo endpoint .own debe probar recurso propio y recurso ajeno.
5. Todo cálculo monetario debe probar precisión Decimal.
6. Todo statement debe probar reconstrucción desde movimientos fuente.
7. Toda línea financiera debe probar sourceType y sourceId.
8. Todo snapshot debe probar consistencia con movimientos fuente.
9. Todo cierre, bloqueo o regeneración debe requerir motivo.
10. Toda generación duplicada debe probar idempotencia o conflicto controlado.
11. Toda exportación debe probar autorización y aislamiento tenant.
12. Ninguna prueba debe usar datos reales.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* calcula balance actual por unidad;
* calcula balance por periodo;
* genera estado de cuenta individual;
* genera estados de cuenta en lote;
* crea líneas de estado de cuenta;
* referencia movimientos fuente en líneas;
* excluye cargos cancelados;
* excluye cargos reversados;
* excluye pagos reversados;
* excluye asignaciones reversadas;
* resta pagos asignados activos;
* separa pagos no asignados;
* calcula saldo vencido;
* calcula saldo no vencido;
* calcula saldo a favor;
* crea snapshots;
* publica statements válidos;
* cierra statements con motivo;
* bloquea statements con motivo;
* regenera statements con motivo;
* marca statement anterior como `superseded`;
* mantiene vínculo entre statement anterior y nuevo;
* no elimina físicamente statements publicados/cerrados/bloqueados;
* permite consulta administrativa;
* permite consulta propia solo de unidades propias;
* exporta JSON/CSV básico;
* impide acceso cross-tenant;
* impide consulta `.own` de recursos ajenos;
* usa Decimal;
* expone montos como string;
* registra auditoría;
* emite eventos;
* actualiza OpenAPI;
* pasa CI.

---

## 6. Datos de prueba base

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="hgw8b1"
tenantActiveA: villa-club-demo
tenantActiveB: altos-del-norte-demo
tenantSuspended: tenant-suspendido-demo
tenantArchived: tenant-archivado-demo
```

---

### 6.2. Usuarios y membresías

Reusar fixtures de `002-users-roles`:

```text id="k0s0g0"
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

```text id="kjo7zy"
unitA1: Casa 01, tenantActiveA, active
unitA2: Casa 02, tenantActiveA, active
unitA3: Casa 03, tenantActiveA, active
unitB1: A-101, tenantActiveB, active
archivedUnitA
inactiveUnitA
blockedUnitA
```

Relaciones:

```text id="oecor9"
propertyOwnerUserA linked to personOwnerA
personOwnerA owns unitA1
residentUserA linked to personResidentA
personResidentA resides in unitA1
residentUserB linked to personResidentB
personResidentB resides in unitB1
```

---

### 6.4. Periodos de facturación

Reusar fixtures de `004-dues-fees`:

```text id="ryb7gb"
billingPeriod202607A
billingPeriod202608A
closedBillingPeriodA
lockedBillingPeriodA
billingPeriod202607B
```

---

### 6.5. Cargos de prueba

Reusar fixtures de `004-dues-fees`:

```text id="w0hsdl"
chargeA1MonthlyDues: unitA1, issued, effectiveAmount 50.00, dueDate 2026-07-10
chargeA1ReserveFund: unitA1, issued, effectiveAmount 10.00, dueDate 2026-07-10
chargeA2MonthlyDues: unitA2, issued, effectiveAmount 50.00
chargeB1MonthlyDues: unitB1, issued, effectiveAmount 50.00
chargeA1Paid: unitA1, paid, effectiveAmount 50.00
chargeA1Cancelled: unitA1, cancelled, effectiveAmount 0.00
chargeA1Reversed: unitA1, reversed, effectiveAmount 0.00
chargeA1ManualAdjustment: unitA1, issued, effectiveAmount 5.00
```

---

### 6.6. Pagos y asignaciones de prueba

Reusar fixtures de `005-payments`:

```text id="e90ib2"
paymentConfirmedA1
paymentPendingValidationA1
paymentRejectedA1
paymentAllocatedA1
paymentPartiallyAllocatedA1
paymentReversedA1
paymentConfirmedA2
paymentConfirmedB1

allocationActiveA1
allocationPartialA1
allocationReversedA1
allocationB1
```

---

### 6.7. Statements y balances de prueba

Fixtures requeridos:

```text id="m8hll0"
statementGeneratedA1_202607
statementPublishedA1_202607
statementClosedA1_202607
statementLockedA1_202607
statementSupersededA1_202607
statementGeneratedB1_202607

unitBalanceA1
unitBalanceA2
unitBalanceB1

balanceSnapshotA1_202607
balanceSnapshotB1_202607
```

---

### 6.8. Datos prohibidos

No usar:

```text id="rifv76"
saldos reales
estados de cuenta reales
nombres reales de propietarios
nombres reales de residentes
comprobantes reales
referencias bancarias reales
documentos financieros reales
capturas reales
```

Usar:

```text id="jzt7ba"
USD
50.00
100.00
periodo 2026-07
tenant demo
unidad demo
cargo demo
pago demo
statement demo
```

---

## 7. Factories recomendadas

Crear factories:

```text id="xysp0s"
createAccountStatement()
createGeneratedAccountStatement()
createPublishedAccountStatement()
createClosedAccountStatement()
createLockedAccountStatement()
createSupersededAccountStatement()
createAccountStatementLine()
createOpeningBalanceLine()
createChargeLine()
createPaymentAllocationLine()
createClosingBalanceLine()
createUnitBalance()
createBalanceSnapshot()
createFinancialMovement()
createStatementGenerationContext()
createOwnStatementContext()
```

Ejemplo:

```text id="e0z24t"
createAccountStatement({
  tenantId: tenantActiveA.id,
  propertyUnitId: unitA1.id,
  billingPeriodId: billingPeriod202607A.id,
  statementNumber: "ST-villa-club-2026-07-CASA-01",
  status: "generated",
  openingBalance: "0.00",
  chargesTotal: "60.00",
  paymentsTotal: "50.00",
  closingBalance: "10.00"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. Money

Archivo sugerido:

```text id="xz591e"
money.vo.spec.ts
```

| ID              | Caso                                            | Resultado esperado             |
| --------------- | ----------------------------------------------- | ------------------------------ |
| UT-AS-MONEY-001 | Crear Money `100.00 USD`                        | válido                         |
| UT-AS-MONEY-002 | Monto negativo para balance                     | inválido salvo regla explícita |
| UT-AS-MONEY-003 | Más de dos decimales                            | error                          |
| UT-AS-MONEY-004 | Moneda distinta de USD                          | `CURRENCY_NOT_SUPPORTED`       |
| UT-AS-MONEY-005 | Suma `0.10 + 0.20`                              | `0.30`                         |
| UT-AS-MONEY-006 | Resta `100.00 - 50.00`                          | `50.00`                        |
| UT-AS-MONEY-007 | Resultado negativo se separa como creditBalance | válido                         |
| UT-AS-MONEY-008 | Serialización API                               | string decimal                 |

---

## 8.2. AccountStatementStatus

Archivo sugerido:

```text id="t6cmu0"
account-statement-status.vo.spec.ts
```

| ID               | Caso                                      | Resultado esperado              |
| ---------------- | ----------------------------------------- | ------------------------------- |
| UT-AS-STATUS-001 | `generated` es publicable                 | true                            |
| UT-AS-STATUS-002 | `published` no se publica de nuevo        | false o idempotente documentado |
| UT-AS-STATUS-003 | `published` es cerrable                   | true                            |
| UT-AS-STATUS-004 | `closed` es bloqueable                    | true                            |
| UT-AS-STATUS-005 | `locked` no es regenerable ordinariamente | false                           |
| UT-AS-STATUS-006 | `superseded` no es publicable             | false                           |
| UT-AS-STATUS-007 | `archived` no es operativo                | false                           |
| UT-AS-STATUS-008 | estado inválido                           | error                           |

---

## 8.3. AccountStatementLineType

Archivo sugerido:

```text id="hqodau"
account-statement-line-type.vo.spec.ts
```

| ID                  | Caso                                           | Resultado esperado |
| ------------------- | ---------------------------------------------- | ------------------ |
| UT-AS-LINE-TYPE-001 | `openingBalance` válido                        | válido             |
| UT-AS-LINE-TYPE-002 | `charge` requiere source                       | true               |
| UT-AS-LINE-TYPE-003 | `paymentAllocation` requiere source            | true               |
| UT-AS-LINE-TYPE-004 | `closingBalance` puede no tener source externo | válido             |
| UT-AS-LINE-TYPE-005 | valor inválido                                 | error              |

---

## 8.4. StatementNumber

Archivo sugerido:

```text id="uyxghc"
statement-number.vo.spec.ts
```

| ID            | Caso                             | Resultado esperado              |
| ------------- | -------------------------------- | ------------------------------- |
| UT-AS-NUM-001 | Generar número base              | `ST-villa-club-2026-07-CASA-01` |
| UT-AS-NUM-002 | Normalizar espacios              | válido                          |
| UT-AS-NUM-003 | Normalizar caracteres especiales | válido                          |
| UT-AS-NUM-004 | Regeneración R1                  | `...-R1`                        |
| UT-AS-NUM-005 | Empty tenant slug                | error                           |
| UT-AS-NUM-006 | Empty period code                | error                           |
| UT-AS-NUM-007 | Empty unit code                  | error                           |

---

## 8.5. SourceReference

Archivo sugerido:

```text id="th7r51"
source-reference.vo.spec.ts
```

| ID            | Caso                              | Resultado esperado |
| ------------- | --------------------------------- | ------------------ |
| UT-AS-SRC-001 | Source charge válido              | válido             |
| UT-AS-SRC-002 | Source paymentAllocation válido   | válido             |
| UT-AS-SRC-003 | Línea financiera sin sourceId     | error              |
| UT-AS-SRC-004 | sourceType inválido               | error              |
| UT-AS-SRC-005 | sourceId malformado               | error              |
| UT-AS-SRC-006 | openingBalance sin source externo | válido             |

---

## 8.6. BillingPeriodCode

Archivo sugerido:

```text id="j2e2ow"
billing-period-code.vo.spec.ts
```

| ID               | Caso              | Resultado esperado |
| ---------------- | ----------------- | ------------------ |
| UT-AS-PERIOD-001 | `2026-07` válido  | válido             |
| UT-AS-PERIOD-002 | mes 13            | error              |
| UT-AS-PERIOD-003 | formato `07-2026` | error              |
| UT-AS-PERIOD-004 | vacío             | error              |

---

# 9. Pruebas unitarias de entidades

## 9.1. AccountStatement entity

Archivo sugerido:

```text id="d8q45i"
account-statement.entity.spec.ts
```

| ID               | Caso                            | Resultado esperado       |
| ---------------- | ------------------------------- | ------------------------ |
| UT-AS-ENTITY-001 | Crear statement generado válido | válido                   |
| UT-AS-ENTITY-002 | Crear sin tenantId              | error                    |
| UT-AS-ENTITY-003 | Crear sin propertyUnitId        | error                    |
| UT-AS-ENTITY-004 | Crear sin billingPeriodId       | error                    |
| UT-AS-ENTITY-005 | Publicar generated              | status published         |
| UT-AS-ENTITY-006 | Publicar superseded             | error                    |
| UT-AS-ENTITY-007 | Cerrar con motivo               | status closed            |
| UT-AS-ENTITY-008 | Cerrar sin motivo               | error                    |
| UT-AS-ENTITY-009 | Bloquear con motivo             | status locked            |
| UT-AS-ENTITY-010 | Bloquear sin motivo             | error                    |
| UT-AS-ENTITY-011 | Regenerar con motivo            | crea relación superseded |
| UT-AS-ENTITY-012 | Regenerar sin motivo            | error                    |

---

## 9.2. AccountStatementLine entity

Archivo sugerido:

```text id="s8e3i3"
account-statement-line.entity.spec.ts
```

| ID             | Caso                                     | Resultado esperado |
| -------------- | ---------------------------------------- | ------------------ |
| UT-AS-LINE-001 | Crear línea charge con source            | válido             |
| UT-AS-LINE-002 | Crear línea paymentAllocation con source | válido             |
| UT-AS-LINE-003 | Línea financiera sin source              | error              |
| UT-AS-LINE-004 | Débito y crédito positivos a la vez      | error              |
| UT-AS-LINE-005 | Débito negativo                          | error              |
| UT-AS-LINE-006 | Crédito negativo                         | error              |
| UT-AS-LINE-007 | Calcula balanceAfterLine                 | correcto           |
| UT-AS-LINE-008 | Línea invisible para residente           | válida             |

---

## 9.3. UnitBalance entity

Archivo sugerido:

```text id="p102da"
unit-balance.entity.spec.ts
```

| ID            | Caso                   | Resultado esperado |
| ------------- | ---------------------- | ------------------ |
| UT-AS-BAL-001 | Crear balance válido   | válido             |
| UT-AS-BAL-002 | outstanding negativo   | error              |
| UT-AS-BAL-003 | creditBalance negativo | error              |
| UT-AS-BAL-004 | Marcar stale           | isStale true       |
| UT-AS-BAL-005 | Recalcular             | actualiza valores  |
| UT-AS-BAL-006 | Moneda no USD          | error              |

---

## 9.4. BalanceSnapshot entity

Archivo sugerido:

```text id="mk2405"
balance-snapshot.entity.spec.ts
```

| ID             | Caso                  | Resultado esperado |
| -------------- | --------------------- | ------------------ |
| UT-AS-SNAP-001 | Crear snapshot válido | válido             |
| UT-AS-SNAP-002 | Snapshot sin tenant   | error              |
| UT-AS-SNAP-003 | Snapshot sin unidad   | error              |
| UT-AS-SNAP-004 | Marcar superseded     | status superseded  |
| UT-AS-SNAP-005 | sourceHash opcional   | válido             |
| UT-AS-SNAP-006 | balances negativos    | error              |

---

# 10. Pruebas de servicios y policies

## 10.1. BalanceCalculatorService

| ID             | Caso                        | Resultado esperado        |
| -------------- | --------------------------- | ------------------------- |
| SRV-AS-BAL-001 | Sin cargos ni pagos         | balances en 0             |
| SRV-AS-BAL-002 | Cargo 50                    | outstanding 50            |
| SRV-AS-BAL-003 | Cargo 50 + pago asignado 50 | outstanding 0             |
| SRV-AS-BAL-004 | Cargo 60 + pago asignado 50 | outstanding 10            |
| SRV-AS-BAL-005 | Cargo 50 + pago asignado 75 | closing 0 / credit 25     |
| SRV-AS-BAL-006 | Cargo cancelado             | no suma                   |
| SRV-AS-BAL-007 | Cargo reversado             | no suma                   |
| SRV-AS-BAL-008 | Pago reversado              | no resta                  |
| SRV-AS-BAL-009 | Allocation reversada        | no resta                  |
| SRV-AS-BAL-010 | Pago confirmado no asignado | unallocatedPaymentBalance |
| SRV-AS-BAL-011 | DueDate vencida             | overdueBalance            |
| SRV-AS-BAL-012 | DueDate futura              | notDueBalance             |

---

## 10.2. StatementLineBuilderService

| ID              | Caso                                 | Resultado esperado |
| --------------- | ------------------------------------ | ------------------ |
| SRV-AS-LINE-001 | Construye openingBalance             | sortOrder 1        |
| SRV-AS-LINE-002 | Construye líneas de cargos           | debitAmount        |
| SRV-AS-LINE-003 | Construye líneas de pagos asignados  | creditAmount       |
| SRV-AS-LINE-004 | Excluye cargos cancelados            | no línea           |
| SRV-AS-LINE-005 | Excluye pagos reversados             | no línea activa    |
| SRV-AS-LINE-006 | Cada línea financiera tiene source   | pasa               |
| SRV-AS-LINE-007 | Calcula balanceAfterLine             | exacto             |
| SRV-AS-LINE-008 | Construye closingBalance             | última línea       |
| SRV-AS-LINE-009 | No duplica source en mismo statement | pasa               |

---

## 10.3. StatementTotalsService

| ID               | Caso                                    | Resultado esperado                     |
| ---------------- | --------------------------------------- | -------------------------------------- |
| SRV-AS-TOTAL-001 | Totales cuadran con líneas              | válido                                 |
| SRV-AS-TOTAL-002 | paymentsTotal suma créditos de payments | correcto                               |
| SRV-AS-TOTAL-003 | chargesTotal suma débitos de charges    | correcto                               |
| SRV-AS-TOTAL-004 | closingBalance coincide                 | válido                                 |
| SRV-AS-TOTAL-005 | líneas inconsistentes                   | `ACCOUNT_STATEMENT_LINES_INCONSISTENT` |
| SRV-AS-TOTAL-006 | creditBalance por sobrepago             | correcto                               |

---

## 10.4. StatementGenerationService

| ID             | Caso                       | Resultado esperado          |
| -------------- | -------------------------- | --------------------------- |
| SRV-AS-GEN-001 | Genera statement válido    | éxito                       |
| SRV-AS-GEN-002 | Unidad de otro tenant      | error                       |
| SRV-AS-GEN-003 | Periodo de otro tenant     | error                       |
| SRV-AS-GEN-004 | Ya existe statement activo | 409 o regenerate según mode |
| SRV-AS-GEN-005 | Sin movimientos            | statement en cero           |
| SRV-AS-GEN-006 | Crea lines                 | pasa                        |
| SRV-AS-GEN-007 | Crea snapshot              | pasa                        |
| SRV-AS-GEN-008 | Crea sourceHash            | pasa                        |
| SRV-AS-GEN-009 | Audita                     | pasa                        |
| SRV-AS-GEN-010 | Emite evento               | pasa                        |

---

## 10.5. StatementBatchGenerationService

| ID               | Caso                                        | Resultado esperado |
| ---------------- | ------------------------------------------- | ------------------ |
| SRV-AS-BATCH-001 | Genera para todas las unidades activas      | éxito              |
| SRV-AS-BATCH-002 | Omite unidades inactivas si política aplica | pasa               |
| SRV-AS-BATCH-003 | Maneja statement existente                  | skipped            |
| SRV-AS-BATCH-004 | Error en una unidad no rompe todo batch     | error parcial      |
| SRV-AS-BATCH-005 | dryRun no persiste                          | pasa               |
| SRV-AS-BATCH-006 | Conteos correctos                           | pasa               |
| SRV-AS-BATCH-007 | No mezcla tenants                           | pasa               |

---

## 10.6. BalanceSnapshotService

| ID              | Caso                                  | Resultado esperado |
| --------------- | ------------------------------------- | ------------------ |
| SRV-AS-SNAP-001 | Crea snapshot al generar statement    | éxito              |
| SRV-AS-SNAP-002 | Crea snapshot al recalcular balance   | éxito              |
| SRV-AS-SNAP-003 | SourceHash igual sin cambios          | válido             |
| SRV-AS-SNAP-004 | SourceHash distinto después de cambio | detecta stale      |
| SRV-AS-SNAP-005 | Supersede snapshot anterior           | válido             |

---

## 10.7. StatementPublicationPolicyService

| ID             | Caso                     | Resultado esperado                 |
| -------------- | ------------------------ | ---------------------------------- |
| SRV-AS-PUB-001 | generated es publicable  | permitido                          |
| SRV-AS-PUB-002 | published ya publicado   | 409 o idempotente documentado      |
| SRV-AS-PUB-003 | superseded no publicable | rechazado                          |
| SRV-AS-PUB-004 | archived no publicable   | rechazado                          |
| SRV-AS-PUB-005 | líneas inconsistentes    | rechazado                          |
| SRV-AS-PUB-006 | sourceHash stale         | rechazado o warning según política |

---

## 10.8. StatementRegenerationPolicyService

| ID               | Caso                                  | Resultado esperado       |
| ---------------- | ------------------------------------- | ------------------------ |
| SRV-AS-REGEN-001 | Regenerar generated con motivo        | permitido                |
| SRV-AS-REGEN-002 | Regenerar published con motivo        | permitido según política |
| SRV-AS-REGEN-003 | Regenerar locked sin permiso especial | rechazado                |
| SRV-AS-REGEN-004 | Regenerar sin motivo                  | rechazado                |
| SRV-AS-REGEN-005 | Statement anterior queda superseded   | pasa                     |
| SRV-AS-REGEN-006 | Nuevo statement referencia anterior   | pasa                     |

---

## 10.9. OwnAccountStatementPolicyService

| ID             | Caso                                           | Resultado esperado      |
| -------------- | ---------------------------------------------- | ----------------------- |
| SRV-AS-OWN-001 | Propietario ve statement propio                | permitido               |
| SRV-AS-OWN-002 | Residente ve statement si política lo permite  | permitido               |
| SRV-AS-OWN-003 | Usuario ve statement ajeno                     | rechazado               |
| SRV-AS-OWN-004 | Usuario sin Person                             | `OWN_PERSON_NOT_LINKED` |
| SRV-AS-OWN-005 | Relación ended no da acceso                    | rechazado               |
| SRV-AS-OWN-006 | Línea no visible no se devuelve                | pasa                    |
| SRV-AS-OWN-007 | Statement generated no publicado no se muestra | pasa                    |

---

# 11. Pruebas de casos de uso

## 11.1. CalculateUnitBalanceUseCase

| ID             | Caso                           | Resultado esperado |
| -------------- | ------------------------------ | ------------------ |
| APP-AS-BAL-001 | Calcular balance unidad válida | éxito              |
| APP-AS-BAL-002 | Unidad otro tenant             | error              |
| APP-AS-BAL-003 | Sin permiso                    | 403                |
| APP-AS-BAL-004 | Sin movimientos                | cero               |
| APP-AS-BAL-005 | Cargos y pagos válidos         | balance correcto   |
| APP-AS-BAL-006 | Excluye reversados/cancelados  | correcto           |
| APP-AS-BAL-007 | Decimal exacto                 | correcto           |

---

## 11.2. RecalculateUnitBalanceUseCase

| ID                | Caso                      | Resultado esperado |
| ----------------- | ------------------------- | ------------------ |
| APP-AS-RECALC-001 | Recalcular balance válido | éxito              |
| APP-AS-RECALC-002 | Crear snapshot            | éxito              |
| APP-AS-RECALC-003 | Sin permiso               | 403                |
| APP-AS-RECALC-004 | Unidad otro tenant        | error              |
| APP-AS-RECALC-005 | Audita recálculo          | pasa               |
| APP-AS-RECALC-006 | Emite evento              | pasa               |

---

## 11.3. GenerateAccountStatementUseCase

| ID             | Caso                                        | Resultado esperado |
| -------------- | ------------------------------------------- | ------------------ |
| APP-AS-GEN-001 | Generar statement válido                    | 201                |
| APP-AS-GEN-002 | Unidad de otro tenant                       | error              |
| APP-AS-GEN-003 | Periodo de otro tenant                      | error              |
| APP-AS-GEN-004 | Sin periodo                                 | 422                |
| APP-AS-GEN-005 | Sin unidad                                  | 422                |
| APP-AS-GEN-006 | Ya existe con failIfExists                  | 409                |
| APP-AS-GEN-007 | Ya existe con regenerateIfExists sin motivo | 422                |
| APP-AS-GEN-008 | Sin movimientos                             | statement en cero  |
| APP-AS-GEN-009 | Crea líneas con source                      | pasa               |
| APP-AS-GEN-010 | Crea snapshot                               | pasa               |
| APP-AS-GEN-011 | Audita                                      | pasa               |
| APP-AS-GEN-012 | Emite evento                                | pasa               |

---

## 11.4. GenerateAccountStatementsBatchUseCase

| ID               | Caso                                  | Resultado esperado  |
| ---------------- | ------------------------------------- | ------------------- |
| APP-AS-BATCH-001 | Generar batch para todas las unidades | éxito               |
| APP-AS-BATCH-002 | Generar batch para subset             | éxito               |
| APP-AS-BATCH-003 | Unidad inválida                       | error parcial o 422 |
| APP-AS-BATCH-004 | Statement existente                   | skipped             |
| APP-AS-BATCH-005 | dryRun                                | no persiste         |
| APP-AS-BATCH-006 | Conteos correctos                     | pasa                |
| APP-AS-BATCH-007 | Auditoría batch                       | pasa                |

---

## 11.5. PublishAccountStatementUseCase

| ID             | Caso                               | Resultado esperado |
| -------------- | ---------------------------------- | ------------------ |
| APP-AS-PUB-001 | Publicar generated                 | éxito              |
| APP-AS-PUB-002 | Publicar superseded                | 409                |
| APP-AS-PUB-003 | Publicar archived                  | 409                |
| APP-AS-PUB-004 | Publicar con líneas inconsistentes | 409                |
| APP-AS-PUB-005 | Sin permiso                        | 403                |
| APP-AS-PUB-006 | Auditoría                          | pasa               |

---

## 11.6. CloseAccountStatementUseCase

| ID               | Caso                        | Resultado esperado |
| ---------------- | --------------------------- | ------------------ |
| APP-AS-CLOSE-001 | Cerrar published con motivo | éxito              |
| APP-AS-CLOSE-002 | Cerrar sin motivo           | 422                |
| APP-AS-CLOSE-003 | Cerrar superseded           | 409                |
| APP-AS-CLOSE-004 | Sin permiso                 | 403                |
| APP-AS-CLOSE-005 | Auditoría                   | pasa               |

---

## 11.7. LockAccountStatementUseCase

| ID              | Caso                       | Resultado esperado |
| --------------- | -------------------------- | ------------------ |
| APP-AS-LOCK-001 | Bloquear closed con motivo | éxito              |
| APP-AS-LOCK-002 | Bloquear sin motivo        | 422                |
| APP-AS-LOCK-003 | Bloquear ya locked         | 409                |
| APP-AS-LOCK-004 | Sin permiso                | 403                |
| APP-AS-LOCK-005 | Auditoría                  | pasa               |

---

## 11.8. RegenerateAccountStatementUseCase

| ID               | Caso                        | Resultado esperado |
| ---------------- | --------------------------- | ------------------ |
| APP-AS-REGEN-001 | Regenerar con motivo        | éxito              |
| APP-AS-REGEN-002 | Regenerar sin motivo        | 422                |
| APP-AS-REGEN-003 | Locked sin permiso especial | 403/409            |
| APP-AS-REGEN-004 | Anterior queda superseded   | pasa               |
| APP-AS-REGEN-005 | Nuevo referencia anterior   | pasa               |
| APP-AS-REGEN-006 | SourceHash nuevo            | pasa               |
| APP-AS-REGEN-007 | Auditoría                   | pasa               |
| APP-AS-REGEN-008 | Eventos                     | pasa               |

---

## 11.9. ExportAccountStatementUseCase

| ID                | Caso                  | Resultado esperado |
| ----------------- | --------------------- | ------------------ |
| APP-AS-EXPORT-001 | Exportar JSON         | éxito              |
| APP-AS-EXPORT-002 | Exportar CSV          | éxito              |
| APP-AS-EXPORT-003 | Formato inválido      | 422                |
| APP-AS-EXPORT-004 | Statement otro tenant | error              |
| APP-AS-EXPORT-005 | Sin permiso           | 403                |
| APP-AS-EXPORT-006 | Auditoría exportación | pasa               |

---

## 11.10. Own use cases

| ID             | Caso                              | Resultado esperado |
| -------------- | --------------------------------- | ------------------ |
| APP-AS-OWN-001 | Listar mis statements             | solo propios       |
| APP-AS-OWN-002 | Consultar mi statement            | éxito              |
| APP-AS-OWN-003 | Consultar statement ajeno         | 404                |
| APP-AS-OWN-004 | Consultar mi balance              | éxito              |
| APP-AS-OWN-005 | Consultar balance de unidad ajena | 404                |
| APP-AS-OWN-006 | Consultar mis movimientos         | éxito              |
| APP-AS-OWN-007 | Líneas no visibles excluidas      | pasa               |
| APP-AS-OWN-008 | Usuario sin Person                | 403                |

---

# 12. Pruebas de integración

## 12.1. Migración y persistencia

Archivo sugerido:

```text id="r5b5bb"
006-create-account-statements.migration.spec.ts
```

| ID             | Caso                                        | Resultado esperado |
| -------------- | ------------------------------------------- | ------------------ |
| INT-AS-MIG-001 | Migración aplica en DB limpia               | éxito              |
| INT-AS-MIG-002 | Enums creados                               | éxito              |
| INT-AS-MIG-003 | Tablas creadas                              | éxito              |
| INT-AS-MIG-004 | tenant_id obligatorio                       | éxito              |
| INT-AS-MIG-005 | property_unit_id obligatorio                | éxito              |
| INT-AS-MIG-006 | billing_period_id obligatorio en statements | éxito              |
| INT-AS-MIG-007 | Montos Decimal                              | éxito              |
| INT-AS-MIG-008 | statementNumber único por tenant            | éxito              |
| INT-AS-MIG-009 | unique activo tenant+unit+period            | éxito              |
| INT-AS-MIG-010 | source uniqueness                           | éxito              |
| INT-AS-MIG-011 | sortOrder único por statement               | éxito              |
| INT-AS-MIG-012 | onDelete Restrict                           | éxito              |
| INT-AS-MIG-013 | no cascade delete peligroso                 | éxito              |
| INT-AS-MIG-014 | constraints de montos                       | éxito              |
| INT-AS-MIG-015 | constraints de motivo                       | éxito              |
| INT-AS-MIG-016 | Prisma Client genera                        | éxito              |

---

## 12.2. Repositorios

Archivos sugeridos:

```text id="mya1ew"
account-statement.repository.integration.spec.ts
account-statement-line.repository.integration.spec.ts
unit-balance.repository.integration.spec.ts
balance-snapshot.repository.integration.spec.ts
```

| ID              | Caso                             | Resultado esperado |
| --------------- | -------------------------------- | ------------------ |
| INT-AS-REPO-001 | Crear y buscar AccountStatement  | éxito              |
| INT-AS-REPO-002 | Listar por tenant                | no mezcla tenants  |
| INT-AS-REPO-003 | Buscar activo por unidad/periodo | éxito              |
| INT-AS-REPO-004 | Marcar published                 | éxito              |
| INT-AS-REPO-005 | Marcar closed con motivo         | éxito              |
| INT-AS-REPO-006 | Marcar locked con motivo         | éxito              |
| INT-AS-REPO-007 | Marcar superseded                | éxito              |
| INT-AS-LINE-001 | Crear líneas                     | éxito              |
| INT-AS-LINE-002 | Listar líneas por statement      | orden correcto     |
| INT-AS-LINE-003 | Source duplicado falla           | éxito              |
| INT-AS-BAL-001  | Upsert UnitBalance               | éxito              |
| INT-AS-BAL-002  | Buscar balance por unidad        | éxito              |
| INT-AS-SNAP-001 | Crear BalanceSnapshot            | éxito              |
| INT-AS-SNAP-002 | Marcar snapshot superseded       | éxito              |

---

## 12.3. Integración con `004-dues-fees`

| ID             | Caso                           | Resultado esperado |
| -------------- | ------------------------------ | ------------------ |
| INT-AS-004-001 | Leer cargos válidos            | éxito              |
| INT-AS-004-002 | Excluir cargo cancelado        | pasa               |
| INT-AS-004-003 | Excluir cargo reversado        | pasa               |
| INT-AS-004-004 | Leer ajustes válidos           | éxito              |
| INT-AS-004-005 | Leer reversos válidos          | éxito              |
| INT-AS-004-006 | Cargos otro tenant no aparecen | pasa               |

---

## 12.4. Integración con `005-payments`

| ID             | Caso                             | Resultado esperado        |
| -------------- | -------------------------------- | ------------------------- |
| INT-AS-005-001 | Leer allocations activas         | éxito                     |
| INT-AS-005-002 | Excluir allocations reversed     | pasa                      |
| INT-AS-005-003 | Excluir pagos reversed           | pasa                      |
| INT-AS-005-004 | Leer pagos no asignados          | unallocatedPaymentBalance |
| INT-AS-005-005 | Payments otro tenant no aparecen | pasa                      |

---

## 12.5. Seeds

| ID              | Caso                            | Resultado esperado |
| --------------- | ------------------------------- | ------------------ |
| INT-AS-SEED-001 | Crear statements demo           | éxito              |
| INT-AS-SEED-002 | Crear líneas demo               | éxito              |
| INT-AS-SEED-003 | Crear unit balances demo        | éxito              |
| INT-AS-SEED-004 | Crear snapshots demo            | éxito              |
| INT-AS-SEED-005 | Seeds idempotentes              | pasa               |
| INT-AS-SEED-006 | Seeds no contienen datos reales | pasa               |

---

# 13. Pruebas API — Account Statements

## 13.1. Listar statements

Endpoint:

```text id="dn3s8l"
GET /api/v1/tenant/account-statements
```

| ID              | Caso                       | Resultado esperado |
| --------------- | -------------------------- | ------------------ |
| API-AS-LIST-001 | Treasurer lista statements | 200                |
| API-AS-LIST-002 | Sin token                  | 401                |
| API-AS-LIST-003 | Sin membership             | 403                |
| API-AS-LIST-004 | Sin permiso                | 403                |
| API-AS-LIST-005 | No incluye Tenant B        | pasa               |
| API-AS-LIST-006 | Filtro por status          | correcto           |
| API-AS-LIST-007 | Filtro por unidad          | correcto           |
| API-AS-LIST-008 | Filtro por periodo         | correcto           |
| API-AS-LIST-009 | Paginación                 | meta correcto      |

---

## 13.2. Generar statement individual

Endpoint:

```text id="shd412"
POST /api/v1/tenant/account-statements/generate
```

| ID             | Caso                          | Resultado esperado |
| -------------- | ----------------------------- | ------------------ |
| API-AS-GEN-001 | Generar válido                | 201                |
| API-AS-GEN-002 | Sin token                     | 401                |
| API-AS-GEN-003 | Sin permiso                   | 403                |
| API-AS-GEN-004 | Unidad otro tenant            | 403/422            |
| API-AS-GEN-005 | Periodo otro tenant           | 403/422            |
| API-AS-GEN-006 | Sin unidad                    | 422                |
| API-AS-GEN-007 | Sin periodo                   | 422                |
| API-AS-GEN-008 | Ya existe con failIfExists    | 409                |
| API-AS-GEN-009 | regenerateIfExists sin motivo | 422                |
| API-AS-GEN-010 | tenantId en body              | 422                |
| API-AS-GEN-011 | Auditoría generada            | pasa               |

---

## 13.3. Generar batch

Endpoint:

```text id="oycmtm"
POST /api/v1/tenant/account-statements/generate-batch
```

| ID               | Caso                         | Resultado esperado      |
| ---------------- | ---------------------------- | ----------------------- |
| API-AS-BATCH-001 | Batch válido                 | 200                     |
| API-AS-BATCH-002 | dryRun                       | no persiste             |
| API-AS-BATCH-003 | Subset unidades              | correcto                |
| API-AS-BATCH-004 | Unidad otro tenant en subset | 403/422 o error parcial |
| API-AS-BATCH-005 | Statements existentes        | skipped                 |
| API-AS-BATCH-006 | Sin permiso                  | 403                     |
| API-AS-BATCH-007 | Métricas/conteos correctos   | pasa                    |

---

## 13.4. Consultar, publicar, cerrar, bloquear y regenerar

| ID               | Endpoint                | Caso                        | Resultado esperado |
| ---------------- | ----------------------- | --------------------------- | ------------------ |
| API-AS-GET-001   | GET `/{id}`             | Statement del tenant        | 200                |
| API-AS-GET-002   | GET `/{id}`             | Statement otro tenant       | 403/404            |
| API-AS-PUB-001   | POST `/{id}/publish`    | Publicar generated          | 200                |
| API-AS-PUB-002   | POST `/{id}/publish`    | Superseded                  | 409                |
| API-AS-CLOSE-001 | POST `/{id}/close`      | Con motivo                  | 200                |
| API-AS-CLOSE-002 | POST `/{id}/close`      | Sin motivo                  | 422                |
| API-AS-LOCK-001  | POST `/{id}/lock`       | Con motivo                  | 200                |
| API-AS-LOCK-002  | POST `/{id}/lock`       | Sin motivo                  | 422                |
| API-AS-REGEN-001 | POST `/{id}/regenerate` | Con motivo                  | 200                |
| API-AS-REGEN-002 | POST `/{id}/regenerate` | Sin motivo                  | 422                |
| API-AS-REGEN-003 | POST `/{id}/regenerate` | Locked sin permiso especial | 403/409            |

---

## 13.5. Exportar statement

Endpoint:

```text id="xu1mzw"
GET /api/v1/tenant/account-statements/{statementId}/export
```

| ID                | Caso                  | Resultado esperado |
| ----------------- | --------------------- | ------------------ |
| API-AS-EXPORT-001 | Export JSON           | 200                |
| API-AS-EXPORT-002 | Export CSV            | 200                |
| API-AS-EXPORT-003 | Formato inválido      | 422                |
| API-AS-EXPORT-004 | Statement otro tenant | 403/404            |
| API-AS-EXPORT-005 | Sin permiso           | 403                |
| API-AS-EXPORT-006 | Auditoría             | pasa               |

---

# 14. Pruebas API — Balances y movimientos

## 14.1. Balances

| ID                    | Endpoint                           | Caso               | Resultado esperado |
| --------------------- | ---------------------------------- | ------------------ | ------------------ |
| API-AS-BAL-LIST-001   | GET `/tenant/balances`             | Listado válido     | 200                |
| API-AS-BAL-LIST-002   | GET `/tenant/balances`             | Filtro hasDebt     | correcto           |
| API-AS-BAL-LIST-003   | GET `/tenant/balances`             | Filtro overdueOnly | correcto           |
| API-AS-BAL-GET-001    | GET `/property-units/{id}/balance` | Balance válido     | 200                |
| API-AS-BAL-GET-002    | GET `/property-units/{id}/balance` | Unidad otro tenant | 403/404            |
| API-AS-BAL-RECALC-001 | POST `/balance/recalculate`        | Recalcular válido  | 200                |
| API-AS-BAL-RECALC-002 | POST `/balance/recalculate`        | Sin permiso        | 403                |
| API-AS-BAL-RECALC-003 | POST `/balance/recalculate`        | Crea snapshot      | pasa               |

---

## 14.2. Movimientos financieros

| ID             | Caso                                     | Resultado esperado           |
| -------------- | ---------------------------------------- | ---------------------------- |
| API-AS-MOV-001 | Consultar movimientos válidos            | 200                          |
| API-AS-MOV-002 | Filtrar por periodo                      | correcto                     |
| API-AS-MOV-003 | Filtrar por sourceType                   | correcto                     |
| API-AS-MOV-004 | No incluye cargos cancelados por defecto | pasa                         |
| API-AS-MOV-005 | No incluye payments reversed por defecto | pasa                         |
| API-AS-MOV-006 | includeReversed true                     | incluye reversos controlados |
| API-AS-MOV-007 | Unidad otro tenant                       | 403/404                      |
| API-AS-MOV-008 | Sin permiso                              | 403                          |
| API-AS-MOV-009 | Auditoría financialMovements.viewed      | pasa                         |

---

# 15. Pruebas API — Own Account Statements

## 15.1. Mis statements

| ID                  | Caso                                 | Resultado esperado |
| ------------------- | ------------------------------------ | ------------------ |
| API-AS-OWN-LIST-001 | Propietario lista statements propios | 200                |
| API-AS-OWN-LIST-002 | Residente lista si permitido         | 200                |
| API-AS-OWN-LIST-003 | Usuario sin Person                   | 403                |
| API-AS-OWN-LIST-004 | Sin permiso `.own`                   | 403                |
| API-AS-OWN-LIST-005 | No devuelve unidad ajena             | pasa               |
| API-AS-OWN-LIST-006 | No devuelve Tenant B                 | pasa               |
| API-AS-OWN-LIST-007 | No devuelve generated no publicado   | pasa               |
| API-AS-OWN-LIST-008 | No devuelve superseded               | pasa               |

---

## 15.2. Mi statement, balance, movimientos y export

| ID                    | Caso                                 | Resultado esperado |
| --------------------- | ------------------------------------ | ------------------ |
| API-AS-OWN-GET-001    | Consultar statement propio publicado | 200                |
| API-AS-OWN-GET-002    | Consultar statement ajeno            | 404                |
| API-AS-OWN-GET-003    | Líneas no visibles se ocultan        | pasa               |
| API-AS-OWN-BAL-001    | Consultar balance propio             | 200                |
| API-AS-OWN-BAL-002    | Consultar balance unidad ajena       | 404                |
| API-AS-OWN-MOV-001    | Consultar movimientos propios        | 200                |
| API-AS-OWN-MOV-002    | Movimientos no visibles se ocultan   | pasa               |
| API-AS-OWN-EXPORT-001 | Exportar statement propio            | 200                |
| API-AS-OWN-EXPORT-002 | Exportar statement ajeno             | 404                |
| API-AS-OWN-EXPORT-003 | Export no incluye campos internos    | pasa               |

---

# 16. Pruebas de autorización

## 16.1. Matriz administrativa

| ID          | Usuario                  | Endpoint                                         | Resultado |
| ----------- | ------------------------ | ------------------------------------------------ | --------- |
| AUTH-AS-001 | TenantAdminA             | POST `/tenant/account-statements/generate`       | 201       |
| AUTH-AS-002 | TreasurerA               | POST `/tenant/account-statements/generate-batch` | 200       |
| AUTH-AS-003 | TreasurerA               | POST `/tenant/account-statements/{id}/publish`   | 200       |
| AUTH-AS-004 | TenantAuditorA           | GET `/tenant/account-statements`                 | 200       |
| AUTH-AS-005 | TenantAuditorA           | POST `/tenant/account-statements/{id}/publish`   | 403       |
| AUTH-AS-006 | BoardMemberA sin permiso | POST `/tenant/account-statements/generate`       | 403       |
| AUTH-AS-007 | UserWithoutMembership    | GET `/tenant/account-statements`                 | 403       |
| AUTH-AS-008 | UserWithoutPermission    | GET `/tenant/account-statements`                 | 403       |
| AUTH-AS-009 | DisabledUser             | GET `/tenant/account-statements`                 | 403       |
| AUTH-AS-010 | Anonymous                | GET `/tenant/account-statements`                 | 401       |

---

## 16.2. Tenant suspendido o archivado

| ID                 | Caso                                                         | Resultado esperado                   |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ |
| AUTH-AS-TENANT-001 | Generar statement en tenant suspended                        | 403                                  |
| AUTH-AS-TENANT-002 | Publicar statement en tenant suspended                       | 403                                  |
| AUTH-AS-TENANT-003 | Recalcular balance en tenant archived                        | 403                                  |
| AUTH-AS-TENANT-004 | Consultar histórico en tenant suspended con permiso especial | permitido o bloqueado según política |

---

## 16.3. Separación de funciones

| ID              | Caso                                                        | Resultado esperado |
| --------------- | ----------------------------------------------------------- | ------------------ |
| AUTH-AS-SOD-001 | `accountStatements.read` no genera                          | 403                |
| AUTH-AS-SOD-002 | `accountStatements.generate` no publica                     | 403                |
| AUTH-AS-SOD-003 | `accountStatements.publish` no regenera                     | 403                |
| AUTH-AS-SOD-004 | `balances.read` no recalcula                                | 403                |
| AUTH-AS-SOD-005 | `accountStatements.read.own` no exporta si falta export.own | 403                |

---

# 17. Pruebas multitenant

| ID | Caso | Resultado esperado |
|---|---|
| MT-AS-001 | Tenant A no lista statements B | pasa |
| MT-AS-002 | Tenant A no consulta statement B | 403/404 |
| MT-AS-003 | Tenant A no genera statement para unidad B | rechazado |
| MT-AS-004 | Tenant A no genera statement para periodo B | rechazado |
| MT-AS-005 | Tenant A no publica statement B | rechazado |
| MT-AS-006 | Tenant A no regenera statement B | rechazado |
| MT-AS-007 | Tenant A no exporta statement B | rechazado |
| MT-AS-008 | Tenant A no consulta balance B | rechazado |
| MT-AS-009 | Tenant A no consulta movimientos B | rechazado |
| MT-AS-010 | Tenant A no consulta snapshot B | rechazado |
| MT-AS-011 | Own statements no mezclan tenants | pasa |
| MT-AS-012 | Own balances no mezclan tenants | pasa |

---

# 18. Pruebas de precisión monetaria

| ID           | Caso                           | Resultado esperado          |
| ------------ | ------------------------------ | --------------------------- |
| MONEY-AS-001 | Cargos 50 + 10                 | chargesTotal 60.00          |
| MONEY-AS-002 | Pago 50 reduce cargo 60        | closing 10.00               |
| MONEY-AS-003 | Pago 75 sobre deuda 60         | closing 0.00 / credit 15.00 |
| MONEY-AS-004 | `0.10 + 0.20`                  | `0.30`                      |
| MONEY-AS-005 | Montos salen como string       | pasa                        |
| MONEY-AS-006 | No se usa float                | pasa                        |
| MONEY-AS-007 | notDue = outstanding - overdue | exacto                      |
| MONEY-AS-008 | No hay balances negativos      | pasa                        |
| MONEY-AS-009 | Currency no USD                | rechazado                   |

---

# 19. Pruebas de reconstrucción financiera

| ID           | Caso                                   | Resultado esperado |
| ------------ | -------------------------------------- | ------------------ |
| RECON-AS-001 | Lines reconstruyen closingBalance      | pasa               |
| RECON-AS-002 | opening + debits - credits = closing   | pasa               |
| RECON-AS-003 | Cada línea financiera tiene source     | pasa               |
| RECON-AS-004 | Source existe                          | pasa               |
| RECON-AS-005 | Source pertenece al tenant             | pasa               |
| RECON-AS-006 | Source pertenece a la unidad           | pasa               |
| RECON-AS-007 | Statement sourceHash coincide          | pasa               |
| RECON-AS-008 | Cambio en source detecta hash distinto | pasa               |
| RECON-AS-009 | Regeneración actualiza sourceHash      | pasa               |
| RECON-AS-010 | No hay líneas duplicadas por source    | pasa               |

---

# 20. Pruebas de snapshots

| ID          | Caso                                            | Resultado esperado |
| ----------- | ----------------------------------------------- | ------------------ |
| SNAP-AS-001 | Generar statement crea snapshot                 | pasa               |
| SNAP-AS-002 | Recalcular balance crea snapshot si se solicita | pasa               |
| SNAP-AS-003 | Snapshot tiene sourceHash                       | pasa               |
| SNAP-AS-004 | Snapshot tenant-scoped                          | pasa               |
| SNAP-AS-005 | Snapshot de otro tenant no visible              | pasa               |
| SNAP-AS-006 | Snapshot superseded conserva histórico          | pasa               |
| SNAP-AS-007 | Snapshot no reemplaza movimientos base          | pasa               |

---

# 21. Pruebas de generación y regeneración

| ID         | Caso                                            | Resultado esperado |
| ---------- | ----------------------------------------------- | ------------------ |
| GEN-AS-001 | Generar statement nuevo                         | éxito              |
| GEN-AS-002 | Generar con statement existente failIfExists    | 409                |
| GEN-AS-003 | generate regenerateIfExists con motivo          | éxito              |
| GEN-AS-004 | Regeneración sin motivo                         | 422                |
| GEN-AS-005 | Statement anterior superseded                   | pasa               |
| GEN-AS-006 | Nuevo statement tiene previousStatementId       | pasa               |
| GEN-AS-007 | Anterior tiene supersededBy                     | pasa               |
| GEN-AS-008 | Locked no regenera ordinariamente               | 403/409            |
| GEN-AS-009 | Regeneración no elimina líneas anteriores       | pasa               |
| GEN-AS-010 | Regeneración recalcula con movimientos actuales | pasa               |

---

# 22. Pruebas de exportación

| ID            | Caso                                   | Resultado esperado |
| ------------- | -------------------------------------- | ------------------ |
| EXPORT-AS-001 | Export JSON admin                      | válido             |
| EXPORT-AS-002 | Export CSV admin                       | válido             |
| EXPORT-AS-003 | Export JSON own                        | válido             |
| EXPORT-AS-004 | Export CSV own                         | válido             |
| EXPORT-AS-005 | Export formato inválido                | 422                |
| EXPORT-AS-006 | Export cross-tenant                    | rechazado          |
| EXPORT-AS-007 | Export own ajeno                       | 404                |
| EXPORT-AS-008 | Export own no contiene campos internos | pasa               |
| EXPORT-AS-009 | Export auditado                        | pasa               |

---

# 23. Pruebas de concurrencia

| ID          | Caso                                              | Resultado esperado              |
| ----------- | ------------------------------------------------- | ------------------------------- |
| CONC-AS-001 | Dos generaciones simultáneas misma unidad/periodo | solo un statement activo        |
| CONC-AS-002 | Publicación simultánea                            | consistente                     |
| CONC-AS-003 | Cierre simultáneo                                 | uno cierra, otro 409/no-op      |
| CONC-AS-004 | Regeneración simultánea                           | un supersede controlado         |
| CONC-AS-005 | Recalcular balance mientras se genera statement   | consistencia transaccional      |
| CONC-AS-006 | Batch concurrente mismo periodo                   | no duplica statements activos   |
| CONC-AS-007 | Cambio de pago durante generación                 | sourceHash detecta consistencia |

---

# 24. Pruebas de regresión financiera

| ID         | Caso                                            | Resultado esperado |
| ---------- | ----------------------------------------------- | ------------------ |
| FIN-AS-001 | Saldo inicial cero                              | correcto           |
| FIN-AS-002 | Saldo inicial de periodo anterior               | correcto           |
| FIN-AS-003 | Cargos aumentan saldo                           | correcto           |
| FIN-AS-004 | Ajuste positivo aumenta saldo                   | correcto           |
| FIN-AS-005 | Ajuste negativo reduce saldo                    | correcto           |
| FIN-AS-006 | Pago asignado reduce saldo                      | correcto           |
| FIN-AS-007 | Pago no asignado va a unallocatedPaymentBalance | correcto           |
| FIN-AS-008 | Cargo cancelado no suma                         | correcto           |
| FIN-AS-009 | Cargo reversado no suma                         | correcto           |
| FIN-AS-010 | Pago reversado no reduce                        | correcto           |
| FIN-AS-011 | Allocation reversada no reduce                  | correcto           |
| FIN-AS-012 | Sobrepago genera creditBalance                  | correcto           |
| FIN-AS-013 | overdueBalance por dueDate                      | correcto           |
| FIN-AS-014 | notDueBalance correcto                          | correcto           |
| FIN-AS-015 | Statement reconstruible                         | correcto           |
| FIN-AS-016 | Batch idempotente                               | correcto           |

---

# 25. Pruebas de seguridad

## 25.1. Payload validation

| ID                 | Caso                          | Resultado esperado   |
| ------------------ | ----------------------------- | -------------------- |
| SEC-AS-PAYLOAD-001 | IDs malformados               | 422                  |
| SEC-AS-PAYLOAD-002 | tenantId en body              | 422                  |
| SEC-AS-PAYLOAD-003 | periodCode inválido           | 422                  |
| SEC-AS-PAYLOAD-004 | reason vacío cuando requerido | 422                  |
| SEC-AS-PAYLOAD-005 | reason demasiado largo        | 422                  |
| SEC-AS-PAYLOAD-006 | sortBy arbitrario             | 422                  |
| SEC-AS-PAYLOAD-007 | export format inválido        | 422                  |
| SEC-AS-PAYLOAD-008 | strings con script            | sanitización/rechazo |

---

## 25.2. Seguridad financiera

| ID             | Caso                                               | Resultado esperado |
| -------------- | -------------------------------------------------- | ------------------ |
| SEC-AS-FIN-001 | No existe DELETE de statements                     | pasa               |
| SEC-AS-FIN-002 | No existe DELETE de lines                          | pasa               |
| SEC-AS-FIN-003 | Publicar requiere permiso                          | 403 sin permiso    |
| SEC-AS-FIN-004 | Regenerar requiere motivo                          | 422                |
| SEC-AS-FIN-005 | Statement published no se modifica silenciosamente | pasa               |
| SEC-AS-FIN-006 | Snapshot no reemplaza movimientos base             | pasa               |
| SEC-AS-FIN-007 | Error no expone SQL/stack                          | pasa               |

---

## 25.3. Logs y privacidad

| ID             | Caso                                            | Resultado esperado |
| -------------- | ----------------------------------------------- | ------------------ |
| SEC-AS-LOG-001 | Logs no contienen Authorization header          | pasa               |
| SEC-AS-LOG-002 | Logs no contienen token                         | pasa               |
| SEC-AS-LOG-003 | Logs no contienen payload completo              | pasa               |
| SEC-AS-LOG-004 | Logs no contienen export completo               | pasa               |
| SEC-AS-LOG-005 | Logs no contienen datos personales innecesarios | pasa               |
| SEC-AS-LOG-006 | Métricas no usan propertyUnitId como label      | pasa               |
| SEC-AS-LOG-007 | Métricas no usan statementId como label         | pasa               |
| SEC-AS-LOG-008 | Errores contienen traceId                       | pasa               |

---

# 26. Pruebas de auditoría

| ID         | Operación                   | Evento auditable esperado                    |
| ---------- | --------------------------- | -------------------------------------------- |
| AUD-AS-001 | Generar statement           | `accountStatement.generated`                 |
| AUD-AS-002 | Generar batch               | `accountStatement.batchGenerated`            |
| AUD-AS-003 | Publicar statement          | `accountStatement.published`                 |
| AUD-AS-004 | Cerrar statement            | `accountStatement.closed`                    |
| AUD-AS-005 | Bloquear statement          | `accountStatement.locked`                    |
| AUD-AS-006 | Regenerar statement         | `accountStatement.regenerated`               |
| AUD-AS-007 | Supersede statement         | `accountStatement.superseded`                |
| AUD-AS-008 | Exportar statement          | `accountStatement.exported`                  |
| AUD-AS-009 | Recalcular balance          | `balance.recalculated`                       |
| AUD-AS-010 | Crear snapshot              | `balance.snapshotCreated`                    |
| AUD-AS-011 | Ver movimientos financieros | `financialMovements.viewed`                  |
| AUD-AS-012 | Ver statement sensible      | `accountStatement.viewedSensitive` si aplica |

Campos mínimos:

```text id="gec85t"
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

```text id="v4wx9j"
propertyUnitId
billingPeriodId
statementId
openingBalance
closingBalance
outstandingBalance
creditBalance
reason
```

---

# 27. Pruebas de eventos

| ID         | Operación           | Evento esperado                  |
| ---------- | ------------------- | -------------------------------- |
| EVT-AS-001 | Generar statement   | `AccountStatementGenerated`      |
| EVT-AS-002 | Generar batch       | `AccountStatementBatchGenerated` |
| EVT-AS-003 | Publicar statement  | `AccountStatementPublished`      |
| EVT-AS-004 | Cerrar statement    | `AccountStatementClosed`         |
| EVT-AS-005 | Bloquear statement  | `AccountStatementLocked`         |
| EVT-AS-006 | Regenerar statement | `AccountStatementRegenerated`    |
| EVT-AS-007 | Supersede statement | `AccountStatementSuperseded`     |
| EVT-AS-008 | Exportar statement  | `AccountStatementExported`       |
| EVT-AS-009 | Recalcular balance  | `UnitBalanceRecalculated`        |
| EVT-AS-010 | Crear snapshot      | `BalanceSnapshotCreated`         |
| EVT-AS-011 | Ver movimientos     | `FinancialMovementsViewed`       |

Eventos no deben incluir:

```text id="qjxmfd"
tokens
payload completo
datos personales innecesarios
export completo
sourceHash si se considera interno
```

---

# 28. Pruebas de observabilidad

| ID         | Caso                       | Resultado esperado |
| ---------- | -------------------------- | ------------------ |
| OBS-AS-001 | Request exitoso            | log con traceId    |
| OBS-AS-002 | Cross-tenant denegado      | log con errorCode  |
| OBS-AS-003 | Own access denied          | métrica incrementa |
| OBS-AS-004 | Generation failed          | métrica incrementa |
| OBS-AS-005 | Export ejecutado           | log auditado       |
| OBS-AS-006 | Error devuelve traceId     | pasa               |
| OBS-AS-007 | Auditoría contiene traceId | pasa               |
| OBS-AS-008 | Logs sanitizados           | pasa               |

Métricas esperadas:

```text id="jzgvwv"
account_statements_generated_total
account_statements_batch_generated_total
account_statements_published_total
account_statements_closed_total
account_statements_locked_total
account_statements_regenerated_total
account_statements_exported_total
unit_balances_calculated_total
unit_balances_recalculated_total
balance_snapshots_created_total
financial_movements_viewed_total
account_statement_authorization_denied_total
own_account_statement_access_denied_total
account_statement_generation_failures_total
```

---

# 29. Pruebas OpenAPI

Validar que OpenAPI incluya:

* Account Statements API;
* Balances API;
* Financial Movements API;
* Own Account Statements API;
* permisos requeridos;
* errores estándar;
* ejemplos;
* security schemes;
* extensiones `x-required-permission`;
* extensiones `x-financial-operation`;
* extensiones `x-own-resource-policy`;
* extensiones `x-financial-export`;
* montos como string decimal.

| ID          | Caso                                   | Resultado esperado |
| ----------- | -------------------------------------- | ------------------ |
| OAPI-AS-001 | Endpoints administrativos documentados | pasa               |
| OAPI-AS-002 | Endpoints propios documentados         | pasa               |
| OAPI-AS-003 | Endpoints privados tienen security     | pasa               |
| OAPI-AS-004 | Permisos documentados                  | pasa               |
| OAPI-AS-005 | Operaciones financieras marcadas       | pasa               |
| OAPI-AS-006 | Exportación documentada                | pasa               |
| OAPI-AS-007 | Errores documentados                   | pasa               |
| OAPI-AS-008 | Montos como string decimal             | pasa               |
| OAPI-AS-009 | Own policy documentada                 | pasa               |
| OAPI-AS-010 | Ejemplos coherentes con api-contract   | pasa               |

---

# 30. Smoke tests

Smoke tests post-deploy:

| ID           | Caso                                              | Resultado esperado |
| ------------ | ------------------------------------------------- | ------------------ |
| SMOKE-AS-001 | `GET /api/v1/health`                              | 200                |
| SMOKE-AS-002 | `GET /api/v1/tenant/account-statements` sin token | 401                |
| SMOKE-AS-003 | `GET /api/v1/me/account-statements` sin token     | 401                |
| SMOKE-AS-004 | Usuario autorizado lista statements               | 200                |
| SMOKE-AS-005 | Usuario sin permiso recibe 403                    | 403                |
| SMOKE-AS-006 | Error contiene traceId                            | pasa               |

No ejecutar generación, publicación, cierre, bloqueo, regeneración, recálculo o exportaciones reales en producción como smoke test ordinario.

---

# 31. Organización de archivos de prueba

```text id="e6ub3z"
apps/api/src/modules/account-statements/tests/
├── unit/
│   ├── money.vo.spec.ts
│   ├── account-statement-status.vo.spec.ts
│   ├── account-statement-line-type.vo.spec.ts
│   ├── statement-number.vo.spec.ts
│   ├── source-reference.vo.spec.ts
│   ├── billing-period-code.vo.spec.ts
│   ├── account-statement.entity.spec.ts
│   ├── account-statement-line.entity.spec.ts
│   ├── unit-balance.entity.spec.ts
│   └── balance-snapshot.entity.spec.ts
│
├── application/
│   ├── balance-calculator.service.spec.ts
│   ├── statement-line-builder.service.spec.ts
│   ├── statement-totals.service.spec.ts
│   ├── statement-generation.service.spec.ts
│   ├── statement-batch-generation.service.spec.ts
│   ├── balance-snapshot.service.spec.ts
│   ├── statement-publication-policy.service.spec.ts
│   ├── statement-regeneration-policy.service.spec.ts
│   ├── own-account-statement-policy.service.spec.ts
│   ├── calculate-unit-balance.use-case.spec.ts
│   ├── recalculate-unit-balance.use-case.spec.ts
│   ├── generate-account-statement.use-case.spec.ts
│   ├── generate-account-statements-batch.use-case.spec.ts
│   ├── publish-account-statement.use-case.spec.ts
│   ├── close-account-statement.use-case.spec.ts
│   ├── lock-account-statement.use-case.spec.ts
│   ├── regenerate-account-statement.use-case.spec.ts
│   ├── export-account-statement.use-case.spec.ts
│   └── own-account-statements.use-case.spec.ts
│
├── integration/
│   ├── 006-create-account-statements.migration.spec.ts
│   ├── account-statement.repository.integration.spec.ts
│   ├── account-statement-line.repository.integration.spec.ts
│   ├── unit-balance.repository.integration.spec.ts
│   ├── balance-snapshot.repository.integration.spec.ts
│   ├── account-statements-004.integration.spec.ts
│   ├── account-statements-005.integration.spec.ts
│   └── account-statements.seeds.integration.spec.ts
│
├── api/
│   ├── account-statements.api.spec.ts
│   ├── balances.api.spec.ts
│   ├── financial-movements.api.spec.ts
│   └── own-account-statements.api.spec.ts
│
├── authorization/
│   └── account-statements.authorization.spec.ts
│
├── multitenancy/
│   └── account-statements.multitenancy.spec.ts
│
├── financial/
│   ├── account-statements-money.financial.spec.ts
│   ├── account-statements-reconstruction.financial.spec.ts
│   ├── account-statements-snapshots.financial.spec.ts
│   ├── account-statements-generation.financial.spec.ts
│   ├── account-statements-export.financial.spec.ts
│   └── account-statements-regression.financial.spec.ts
│
├── concurrency/
│   └── account-statements.concurrency.spec.ts
│
├── security/
│   ├── account-statements-payload.security.spec.ts
│   ├── account-statements-financial.security.spec.ts
│   └── account-statements-logging.security.spec.ts
│
└── openapi/
    └── account-statements.openapi.spec.ts
```

---

# 32. Comandos esperados

Comandos específicos sugeridos:

```bash id="z69l7e"
npm run test:account-statements
npm run test:account-statements:unit
npm run test:account-statements:application
npm run test:account-statements:integration
npm run test:account-statements:api
npm run test:account-statements:authorization
npm run test:account-statements:multitenancy
npm run test:account-statements:financial
npm run test:account-statements:security
```

Comandos generales:

```bash id="h8n8fm"
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

```text id="k1o55z"
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
balance calculation tests
statement reconstruction tests
snapshot consistency tests
financial regression tests críticos
OpenAPI validation
build
```

Antes de producción:

```text id="f13e07"
full test suite
migration tests
seed tests
authorization tests completos
multitenancy tests completos
financial regression completos
concurrency tests críticos
logging tests
export tests
smoke tests staging
```

---

# 34. Gates de calidad

No se permite merge si falla:

* precisión Decimal;
* tenant isolation;
* own statement access;
* balance calculation;
* statement reconstruction;
* source references;
* sourceHash consistency;
* statement active uniqueness;
* statement line uniqueness;
* no physical delete;
* regeneration audit;
* export authorization;
* financial regression;
* OpenAPI validation.

---

# 35. Matriz de trazabilidad

| Requisito                               | Pruebas asociadas              |
| --------------------------------------- | ------------------------------ |
| FR-001 Calcular balance actual          | APP-AS-BAL, API-AS-BAL, FIN-AS |
| FR-002 Calcular balance por periodo     | SRV-AS-BAL, FIN-AS             |
| FR-003 Generar statement por unidad     | APP-AS-GEN, API-AS-GEN         |
| FR-004 Generar statements en lote       | APP-AS-BATCH, API-AS-BATCH     |
| FR-005 Crear líneas                     | SRV-AS-LINE, RECON-AS          |
| FR-006 Publicar statement               | APP-AS-PUB, API-AS-PUB         |
| FR-007 Cerrar statement                 | APP-AS-CLOSE, API-AS-CLOSE     |
| FR-008 Bloquear statement               | APP-AS-LOCK, API-AS-LOCK       |
| FR-009 Regenerar statement              | APP-AS-REGEN, GEN-AS           |
| FR-010 Consultar statement admin        | API-AS-GET                     |
| FR-011 Consultar statement propio       | API-AS-OWN                     |
| FR-012 Consultar movimientos            | API-AS-MOV                     |
| FR-013 Saldo vencido/no vencido         | SRV-AS-BAL, FIN-AS             |
| FR-014 Saldo a favor                    | MONEY-AS, FIN-AS               |
| FR-015 Exportar statement               | EXPORT-AS                      |
| FR-016 Auditar operaciones              | AUD-AS                         |
| FR-017 Emitir eventos                   | EVT-AS                         |
| FR-018 Impedir cross-tenant             | MT-AS                          |
| FR-019 Precisión monetaria              | MONEY-AS                       |
| FR-020 Preparar notificaciones/cobranza | EVT-AS, OBS-AS                 |

---

# 36. Riesgos cubiertos

| Riesgo                       | Pruebas                |
| ---------------------------- | ---------------------- |
| Saldo incorrecto             | SRV-AS-BAL, FIN-AS     |
| Statement no reconstruible   | RECON-AS               |
| Source duplicado             | RECON-AS, INT-AS-LINE  |
| Snapshot inconsistente       | SNAP-AS                |
| Statement cross-tenant       | MT-AS                  |
| Usuario ve statement ajeno   | API-AS-OWN, SRV-AS-OWN |
| Usar float                   | MONEY-AS               |
| Publicar statement inválido  | APP-AS-PUB             |
| Regenerar sin motivo         | APP-AS-REGEN           |
| Exportar sin permiso         | EXPORT-AS              |
| Incluir cargo cancelado      | INT-AS-004, FIN-AS     |
| Incluir pago reversado       | INT-AS-005, FIN-AS     |
| Duplicar statements en batch | CONC-AS, API-AS-BATCH  |

---

# 37. Criterios de salida

El módulo `006-account-statements` puede considerarse probado si:

* todas las pruebas unitarias pasan;
* pruebas de Money pasan;
* pruebas de BalanceCalculator pasan;
* pruebas de StatementLineBuilder pasan;
* pruebas de StatementTotals pasan;
* pruebas de casos de uso pasan;
* migración validada;
* seeds idempotentes;
* repositorios validados;
* integración con `004-dues-fees` validada;
* integración con `005-payments` validada;
* API tests pasan;
* authorization tests pasan;
* own access tests pasan;
* multitenancy tests pasan;
* reconstruction tests pasan;
* snapshot tests pasan;
* generation/regeneration tests pasan;
* export tests pasan;
* financial regression tests pasan;
* audit tests pasan;
* event tests pasan;
* observability tests pasan;
* OpenAPI actualizado;
* smoke tests pasan;
* no hay uso de float;
* no hay eliminación física de statements publicados/cerrados;
* no hay acceso cross-tenant;
* no hay fuga de statements propios;
* no hay statements no reconstruibles;
* no hay snapshots contradictorios sin detección.

---

# 38. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="pqjpog"
- Mora avanzada diferida.
- Intereses compuestos diferidos.
- Cobranza automatizada diferida.
- Notificaciones automáticas diferidas.
- Envío por correo diferido.
- Envío por WhatsApp diferido.
- PDF avanzado diferido.
- Firma electrónica diferida.
- Conciliación bancaria diferida.
- Pasarela de pagos diferida.
- Facturación electrónica diferida.
- Contabilidad completa diferida.
- Reportes financieros avanzados diferidos.
- Dashboards ejecutivos diferidos.
- n8n automations diferidas.
```

Estos pendientes no bloquean `006-account-statements`.

---

## 39. Decisión final del test plan

El módulo `006-account-statements` deberá probarse con unit tests, application tests, integration tests, migration tests, API tests, authorization tests, own access tests, multitenancy tests, money precision tests, balance calculation tests, statement reconstruction tests, snapshot consistency tests, generation/regeneration tests, export tests, concurrency tests, financial regression tests, audit tests, event tests, observability tests, OpenAPI tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="v3qbib"
- tenant_id obligatorio;
- property_unit_id obligatorio;
- billing_period_id obligatorio;
- precisión Decimal;
- saldos reconstruibles;
- líneas con sourceType y sourceId;
- no duplicidad de fuentes;
- no duplicidad de statement activo;
- exclusión de cargos cancelados;
- exclusión de cargos reversados;
- exclusión de pagos reversados;
- exclusión de allocations reversadas;
- cálculo correcto de overdueBalance;
- cálculo correcto de notDueBalance;
- cálculo correcto de creditBalance;
- sourceHash consistente;
- snapshots versionados;
- regeneración con motivo;
- superseded statement;
- publicación controlada;
- cierre y bloqueo controlados;
- exportación segura;
- acceso .own solo a unidades propias;
- auditoría financiera;
- eventos financieros;
- compatibilidad con mora, cobranza y reportes futuros.
```

Ninguna implementación de este módulo debe aceptarse si permite estados de cuenta no reconstruibles, cálculos con float, acceso cross-tenant, consulta propia de unidades ajenas, publicación de statements inconsistentes, regeneración sin auditoría, snapshots contradictorios sin detección, exportación sin permiso o inclusión de movimientos financieros inválidos.
