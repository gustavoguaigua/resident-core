# Test Plan — Spec 004 Dues, Fees, Charge Concepts and Charge Generation

## 1. Información del documento

| Campo                    | Valor                                                        |
| ------------------------ | ------------------------------------------------------------ |
| Proyecto                 | RESIDENT Core                                                |
| Spec ID                  | 004                                                          |
| Módulo                   | Dues and Fees                                                |
| Documento                | Test Plan                                                    |
| Ruta                     | `docs/specs/004-dues-fees/test-plan.md`                      |
| Versión                  | 0.1                                                          |
| Estado                   | Borrador inicial                                             |
| Fecha                    | 2026-07-14                                                   |
| Documento base           | `docs/specs/004-dues-fees/spec.md`                           |
| Plan técnico             | `docs/specs/004-dues-fees/plan.md`                           |
| Modelo de datos          | `docs/specs/004-dues-fees/data-model.md`                     |
| Contrato API             | `docs/specs/004-dues-fees/api-contract.md`                   |
| Depende de               | `001-tenants`, `002-users-roles`, `003-residents-properties` |
| Framework sugerido       | Jest + Supertest                                             |
| Base de datos de pruebas | PostgreSQL test database                                     |
| Prioridad                | Alta                                                         |

---

## 2. Propósito

Este documento define el plan de pruebas del módulo `004-dues-fees`.

El objetivo es validar que RESIDENT Core gestione correctamente:

* conceptos de cobro;
* configuraciones de alícuotas;
* asignación de alícuotas a unidades;
* periodos financieros;
* generación mensual de cargos;
* cargos ordinarios;
* cargos extraordinarios;
* cargos manuales;
* batches de generación;
* cancelaciones;
* reversos;
* ajustes;
* precisión monetaria;
* idempotencia;
* acceso propio a cargos;
* aislamiento multitenant;
* autorización financiera;
* auditoría financiera;
* eventos financieros;
* observabilidad;
* compatibilidad futura con pagos y estados de cuenta.

Regla central:

```text id="hh85yc"
Ninguna operación financiera debe aceptarse si rompe precisión decimal, idempotencia, multitenancy, autorización, auditoría o trazabilidad histórica.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este plan cubre:

* pruebas unitarias;
* pruebas de value objects;
* pruebas de entidades financieras;
* pruebas de policies financieras;
* pruebas de servicios de generación;
* pruebas de casos de uso;
* pruebas de repositorios;
* pruebas de migración;
* pruebas de seeds;
* pruebas API;
* pruebas de autorización;
* pruebas de acceso propio;
* pruebas multitenant;
* pruebas de seguridad;
* pruebas de precisión monetaria;
* pruebas de idempotencia;
* pruebas de concurrencia;
* pruebas de regresión financiera;
* pruebas de auditoría;
* pruebas de eventos;
* pruebas de observabilidad;
* pruebas OpenAPI;
* smoke tests.

---

### 3.2. No incluido

No cubre todavía:

* pagos;
* comprobantes;
* asignación de pagos a cargos;
* conciliación bancaria;
* estados de cuenta consolidados;
* cálculo final de saldos;
* mora avanzada;
* intereses automáticos;
* facturación electrónica;
* contabilidad completa;
* asientos contables;
* reportes financieros avanzados;
* cobranza automática;
* notificaciones automáticas;
* integración n8n;
* aprobación dual avanzada;
* carga masiva desde archivo.

Estos temas pertenecen a specs posteriores.

---

## 4. Estrategia general

El módulo se probará en capas:

```text id="gqa7cq"
Unit tests
Domain tests
Application tests
Repository integration tests
Migration tests
API tests
Authorization tests
Own access tests
Multitenancy tests
Security tests
Money precision tests
Idempotency tests
Concurrency tests
Financial regression tests
Audit tests
Event tests
Observability tests
OpenAPI tests
Smoke tests
```

Reglas obligatorias:

```text id="kk6zki"
1. Todo endpoint financiero privado debe tener prueba 401 sin token.
2. Todo endpoint financiero debe tener prueba 403 sin permiso.
3. Todo endpoint tenant-scoped debe tener prueba cross-tenant negativa.
4. Todo endpoint .own debe probar recurso propio y recurso ajeno.
5. Toda generación mensual debe probar idempotencia.
6. Todo monto debe probar precisión Decimal.
7. Todo cargo emitido debe conservar originalAmount.
8. Toda corrección debe hacerse con cancelación, reverso o ajuste.
9. Ningún cargo debe eliminarse físicamente.
10. Toda operación financiera crítica debe generar auditoría.
11. Ninguna prueba debe usar datos reales.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* se crean conceptos de cobro por tenant;
* se impide duplicar código de concepto dentro del mismo tenant;
* se permite el mismo código en tenants distintos;
* se crean FeeSchedules con montos Decimal;
* se impide crear FeeSchedules con conceptos inactivos o de otro tenant;
* se asignan FeeSchedules a unidades activas;
* se impide asignar FeeSchedules a unidades de otro tenant;
* se crean periodos financieros únicos por tenant;
* se impide generar cargos en periodos cerrados o bloqueados;
* se generan cargos mensuales ordinarios;
* la generación mensual es idempotente;
* se registran ChargeBatches con totales correctos;
* se crean cargos extraordinarios y manuales;
* se impide crear cargos sin unidad, concepto, periodo o monto válido;
* se cancela un cargo sin eliminarlo;
* se reversa un cargo sin eliminarlo;
* se ajusta un cargo sin modificar `originalAmount`;
* `effectiveAmount` se actualiza correctamente;
* propietarios/residentes solo consultan cargos de unidades propias;
* no existe acceso cross-tenant;
* no se usa float para dinero;
* cambios críticos se auditan;
* eventos financieros se emiten;
* OpenAPI coincide con `api-contract.md`;
* CI ejecuta pruebas críticas.

---

## 6. Datos de prueba base

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="j1l8w3"
tenantActiveA: villa-club-demo
tenantActiveB: altos-del-norte-demo
tenantSuspended: tenant-suspendido-demo
tenantArchived: tenant-archivado-demo
```

---

### 6.2. Usuarios y membresías

Reusar fixtures de `002-users-roles`:

```text id="u04zid"
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

### 6.3. Unidades

Reusar fixtures de `003-residents-properties`:

```text id="i4d7ju"
unitA1: Casa 01, tenantActiveA, active
unitA2: Casa 02, tenantActiveA, active
unitA3: Casa 03, tenantActiveA, active
unitB1: A-101, tenantActiveB, active
archivedUnitA
inactiveUnitA
blockedUnitA
```

---

### 6.4. Relaciones propias

Fixtures requeridos:

```text id="gndlok"
ownerUserA linked to personOwnerA
personOwnerA owns unitA1
residentUserA linked to personResidentA
personResidentA resides in unitA1
residentUserB linked to personResidentB
personResidentB resides in unitB1
```

---

### 6.5. Datos financieros

Fixtures sugeridos:

```text id="0kbjhn"
chargeConceptMonthlyDuesA
chargeConceptReserveFundA
chargeConceptExtraordinaryA
chargeConceptMonthlyDuesB
inactiveChargeConceptA

feeScheduleMonthlyDuesA
feeScheduleReserveFundA
inactiveFeeScheduleA

unitFeeAssignmentA1
unitFeeAssignmentA2
endedUnitFeeAssignmentA3

billingPeriod202607A
billingPeriod202608A
closedBillingPeriodA
lockedBillingPeriodA

chargeBatchMonthlyA
ordinaryChargeA1
extraordinaryChargeA1
manualChargeA1
cancelledChargeA1
reversedChargeA1
adjustedChargeA1
```

---

### 6.6. Datos prohibidos

No usar:

```text id="e9hf3a"
montos reales de conjuntos reales
datos bancarios
pagos reales
comprobantes reales
nombres reales de clientes
datos personales reales
unidades reales fuera de fixtures demo
```

Usar:

```text id="s25ick"
USD
50.00
10.00
25.00
example.com
tenant demo
unidades demo
```

---

## 7. Factories recomendadas

Crear factories:

```text id="tnabvp"
createChargeConcept()
createInactiveChargeConcept()
createFeeSchedule()
createInactiveFeeSchedule()
createUnitFeeAssignment()
createEndedUnitFeeAssignment()
createBillingPeriod()
createClosedBillingPeriod()
createLockedBillingPeriod()
createChargeBatch()
createCharge()
createCancelledCharge()
createReversedCharge()
createChargeAdjustment()
createChargeReversal()
createFinancialActorContext()
createOwnChargesContext()
```

Ejemplos:

```text id="fb8ydv"
createChargeConcept({
  tenantId: tenantActiveA.id,
  code: "monthly-dues",
  name: "Alícuota mensual",
  category: "ordinary",
  defaultAmount: "50.00",
  currency: "USD"
})

createBillingPeriod({
  tenantId: tenantActiveA.id,
  periodCode: "2026-07",
  dueDate: "2026-07-10",
  status: "open"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. Money

Archivo sugerido:

```text id="dsxqq2"
money.vo.spec.ts
```

| ID           | Caso                                             | Resultado esperado              |
| ------------ | ------------------------------------------------ | ------------------------------- |
| UT-MONEY-001 | Crear Money con `50.00 USD`                      | válido                          |
| UT-MONEY-002 | Crear Money con `0.00 USD` en contexto permitido | válido                          |
| UT-MONEY-003 | Crear cargo con `0.00`                           | rechazado si cargo ordinario    |
| UT-MONEY-004 | Monto negativo                                   | error                           |
| UT-MONEY-005 | Monto con más de 2 decimales                     | redondeo prohibido o error      |
| UT-MONEY-006 | Moneda distinta de USD                           | `CURRENCY_NOT_SUPPORTED`        |
| UT-MONEY-007 | Suma decimal exacta `0.10 + 0.20`                | `0.30`                          |
| UT-MONEY-008 | No usar float                                    | pasa por implementación Decimal |

---

## 8.2. ChargeConceptCode

Archivo sugerido:

```text id="6n249b"
charge-concept-code.vo.spec.ts
```

| ID           | Caso                          | Resultado esperado |
| ------------ | ----------------------------- | ------------------ |
| UT-CCODE-001 | `monthly-dues`                | válido             |
| UT-CCODE-002 | código con espacios           | trim/normalización |
| UT-CCODE-003 | código vacío                  | error              |
| UT-CCODE-004 | código demasiado largo        | error              |
| UT-CCODE-005 | caracteres inválidos críticos | error              |

---

## 8.3. BillingPeriodCode

Archivo sugerido:

```text id="4k6246"
billing-period-code.vo.spec.ts
```

| ID            | Caso              | Resultado esperado |
| ------------- | ----------------- | ------------------ |
| UT-BPCODE-001 | `2026-07`         | válido             |
| UT-BPCODE-002 | `2026-7`          | error              |
| UT-BPCODE-003 | `2026-13`         | error              |
| UT-BPCODE-004 | `abcd-ef`         | error              |
| UT-BPCODE-005 | Deriva `startsAt` | `2026-07-01`       |
| UT-BPCODE-006 | Deriva `endsAt`   | `2026-07-31`       |

---

## 8.4. DueDate

Archivo sugerido:

```text id="1v7zie"
due-date.vo.spec.ts
```

| ID             | Caso                        | Resultado esperado                               |
| -------------- | --------------------------- | ------------------------------------------------ |
| UT-DUEDATE-001 | Fecha válida                | válido                                           |
| UT-DUEDATE-002 | Fecha inválida              | error                                            |
| UT-DUEDATE-003 | DueDate antes de startsAt   | permitido o rechazado según política documentada |
| UT-DUEDATE-004 | DueDate dentro del periodo  | válido                                           |
| UT-DUEDATE-005 | DueDate después del periodo | válido                                           |

---

## 8.5. IdempotencyKey

Archivo sugerido:

```text id="olhhxx"
idempotency-key.vo.spec.ts
```

| ID           | Caso                                 | Resultado esperado |
| ------------ | ------------------------------------ | ------------------ |
| UT-IDEMP-001 | Construir key ordinaria              | válido             |
| UT-IDEMP-002 | Componentes faltantes                | error              |
| UT-IDEMP-003 | Misma entrada genera misma key       | determinístico     |
| UT-IDEMP-004 | Unidad distinta genera key distinta  | válido             |
| UT-IDEMP-005 | Periodo distinto genera key distinta | válido             |
| UT-IDEMP-006 | Key vacía                            | error              |

---

## 8.6. ChargeStatus

Archivo sugerido:

```text id="bpm8wl"
charge-status.vo.spec.ts
```

| ID             | Caso                                   | Resultado esperado |
| -------------- | -------------------------------------- | ------------------ |
| UT-CSTATUS-001 | `issued` es cancelable                 | true               |
| UT-CSTATUS-002 | `cancelled` no es cancelable           | false              |
| UT-CSTATUS-003 | `reversed` no es reversible nuevamente | false              |
| UT-CSTATUS-004 | `paid` reservado para pagos            | no operar en MVP   |
| UT-CSTATUS-005 | estado inválido                        | error              |

---

## 8.7. ChargeType

Archivo sugerido:

```text id="ndjnvf"
charge-type.vo.spec.ts
```

| ID           | Caso             | Resultado esperado  |
| ------------ | ---------------- | ------------------- |
| UT-CTYPE-001 | `ordinary`       | válido              |
| UT-CTYPE-002 | `extraordinary`  | válido              |
| UT-CTYPE-003 | `manual`         | válido              |
| UT-CTYPE-004 | `fine` reservado | no operativo en MVP |
| UT-CTYPE-005 | valor inválido   | error               |

---

## 8.8. FeeFrequency

Archivo sugerido:

```text id="m89e5v"
fee-frequency.vo.spec.ts
```

| ID          | Caso                          | Resultado esperado |
| ----------- | ----------------------------- | ------------------ |
| UT-FREQ-001 | `monthly`                     | válido             |
| UT-FREQ-002 | `oneTime`                     | válido             |
| UT-FREQ-003 | `quarterly` reservado/parcial | válido si modelado |
| UT-FREQ-004 | valor inválido                | error              |

---

# 9. Pruebas unitarias de entidades

## 9.1. ChargeConcept entity

Archivo sugerido:

```text id="g3e35q"
charge-concept.entity.spec.ts
```

| ID        | Caso                               | Resultado esperado |
| --------- | ---------------------------------- | ------------------ |
| UT-CC-001 | Crear concepto válido              | entidad válida     |
| UT-CC-002 | Crear sin code                     | error              |
| UT-CC-003 | Crear sin name                     | error              |
| UT-CC-004 | Archivar concepto                  | status archived    |
| UT-CC-005 | Concepto archived no genera cargos | bloqueado          |
| UT-CC-006 | defaultAmount inválido             | error              |

---

## 9.2. FeeSchedule entity

Archivo sugerido:

```text id="sc16a1"
fee-schedule.entity.spec.ts
```

| ID        | Caso                                 | Resultado esperado |
| --------- | ------------------------------------ | ------------------ |
| UT-FS-001 | Crear schedule válido                | entidad válida     |
| UT-FS-002 | Monto negativo                       | error              |
| UT-FS-003 | Moneda no USD                        | error en MVP       |
| UT-FS-004 | effectiveTo anterior a effectiveFrom | error              |
| UT-FS-005 | Archivar schedule                    | status archived    |
| UT-FS-006 | Schedule archived no genera cargos   | bloqueado          |

---

## 9.3. UnitFeeAssignment entity

Archivo sugerido:

```text id="yl6vnp"
unit-fee-assignment.entity.spec.ts
```

| ID         | Caso                          | Resultado esperado |
| ---------- | ----------------------------- | ------------------ |
| UT-UFA-001 | Crear assignment válido       | entidad válida     |
| UT-UFA-002 | endDate anterior a startDate  | error              |
| UT-UFA-003 | Finalizar assignment activo   | status ended       |
| UT-UFA-004 | Finalizar assignment ya ended | error              |
| UT-UFA-005 | Conserva historial            | pasa               |

---

## 9.4. BillingPeriod entity

Archivo sugerido:

```text id="xxyjs8"
billing-period.entity.spec.ts
```

| ID        | Caso                          | Resultado esperado |
| --------- | ----------------------------- | ------------------ |
| UT-BP-001 | Crear periodo válido          | open               |
| UT-BP-002 | Cerrar periodo open           | closed             |
| UT-BP-003 | Cerrar periodo already closed | error              |
| UT-BP-004 | Bloquear periodo              | locked             |
| UT-BP-005 | Generación en closed          | bloqueada          |
| UT-BP-006 | Generación en locked          | bloqueada          |

---

## 9.5. ChargeBatch entity

Archivo sugerido:

```text id="u4cj0y"
charge-batch.entity.spec.ts
```

| ID           | Caso                               | Resultado esperado  |
| ------------ | ---------------------------------- | ------------------- |
| UT-BATCH-001 | Crear batch draft                  | válido              |
| UT-BATCH-002 | Marcar processing                  | status processing   |
| UT-BATCH-003 | Completar con éxito                | completed           |
| UT-BATCH-004 | Completar con errores              | completedWithErrors |
| UT-BATCH-005 | Conteos negativos                  | error               |
| UT-BATCH-006 | Error summary sin datos personales | pasa                |

---

## 9.6. Charge entity

Archivo sugerido:

```text id="pznt9j"
charge.entity.spec.ts
```

| ID        | Caso                                         | Resultado esperado                   |
| --------- | -------------------------------------------- | ------------------------------------ |
| UT-CH-001 | Crear cargo issued válido                    | válido                               |
| UT-CH-002 | originalAmount negativo                      | error                                |
| UT-CH-003 | effectiveAmount inicial igual originalAmount | pasa                                 |
| UT-CH-004 | Cancelar cargo issued                        | status cancelled + effectiveAmount 0 |
| UT-CH-005 | Reversar cargo issued                        | status reversed + effectiveAmount 0  |
| UT-CH-006 | Intentar modificar originalAmount            | prohibido                            |
| UT-CH-007 | Cancelar cargo cancelled                     | error                                |
| UT-CH-008 | Reversar cargo reversed                      | error                                |

---

## 9.7. ChargeAdjustment entity

Archivo sugerido:

```text id="go4fs0"
charge-adjustment.entity.spec.ts
```

| ID         | Caso                   | Resultado esperado  |
| ---------- | ---------------------- | ------------------- |
| UT-ADJ-001 | Crear discount válido  | válido              |
| UT-ADJ-002 | Crear increase válido  | válido              |
| UT-ADJ-003 | amount negativo        | error               |
| UT-ADJ-004 | reason vacío           | error               |
| UT-ADJ-005 | Reversar adjustment    | reversedAt definido |
| UT-ADJ-006 | No eliminar adjustment | pasa                |

---

## 9.8. ChargeReversal entity

Archivo sugerido:

```text id="jk9j3z"
charge-reversal.entity.spec.ts
```

| ID         | Caso                        | Resultado esperado |
| ---------- | --------------------------- | ------------------ |
| UT-REV-001 | Crear reverso válido        | válido             |
| UT-REV-002 | reason vacío                | error              |
| UT-REV-003 | Un reverso por cargo en MVP | enforced           |
| UT-REV-004 | Incluye traceId si existe   | pasa               |

---

# 10. Pruebas de servicios y policies

## 10.1. MoneyService

Archivo sugerido:

```text id="hbrlvg"
money.service.spec.ts
```

| ID            | Caso                       | Resultado esperado               |
| ------------- | -------------------------- | -------------------------------- |
| SRV-MONEY-001 | parse `50.00`              | Decimal válido                   |
| SRV-MONEY-002 | sumar `0.10 + 0.20`        | `0.30`                           |
| SRV-MONEY-003 | restar `50.00 - 5.00`      | `45.00`                          |
| SRV-MONEY-004 | serializar a API           | string decimal                   |
| SRV-MONEY-005 | rechazar float-like unsafe | error o normalización controlada |

---

## 10.2. BillingPeriodPolicyService

| ID             | Caso                              | Resultado esperado |
| -------------- | --------------------------------- | ------------------ |
| SRV-BP-POL-001 | Periodo open permite generación   | true               |
| SRV-BP-POL-002 | Periodo closed bloquea generación | error              |
| SRV-BP-POL-003 | Periodo locked bloquea generación | error              |
| SRV-BP-POL-004 | PeriodCode duplicado              | error              |
| SRV-BP-POL-005 | Formato inválido                  | error              |

---

## 10.3. FeeSchedulePolicyService

| ID             | Caso                    | Resultado esperado       |
| -------------- | ----------------------- | ------------------------ |
| SRV-FS-POL-001 | Concepto activo         | permitido                |
| SRV-FS-POL-002 | Concepto inactivo       | rechazado                |
| SRV-FS-POL-003 | Concepto de otro tenant | `CROSS_TENANT_REFERENCE` |
| SRV-FS-POL-004 | Monto inválido          | rechazado                |
| SRV-FS-POL-005 | Vigencia inválida       | rechazado                |

---

## 10.4. UnitFeePolicyService

| ID              | Caso                            | Resultado esperado |
| --------------- | ------------------------------- | ------------------ |
| SRV-UFA-POL-001 | Unidad active + schedule active | permitido          |
| SRV-UFA-POL-002 | Unidad archived                 | rechazado          |
| SRV-UFA-POL-003 | Unidad de otro tenant           | rechazado          |
| SRV-UFA-POL-004 | Schedule de otro tenant         | rechazado          |
| SRV-UFA-POL-005 | Assignment duplicado activo     | rechazado          |
| SRV-UFA-POL-006 | Finalizar assignment activo     | permitido          |

---

## 10.5. ChargeIdempotencyService

| ID            | Caso                           | Resultado esperado |
| ------------- | ------------------------------ | ------------------ |
| SRV-IDEMP-001 | Generar key para cargo mensual | key estable        |
| SRV-IDEMP-002 | Misma entrada genera misma key | true               |
| SRV-IDEMP-003 | Diferente unidad cambia key    | true               |
| SRV-IDEMP-004 | Diferente periodo cambia key   | true               |
| SRV-IDEMP-005 | Detecta key existente          | duplicate          |
| SRV-IDEMP-006 | No crea duplicado              | pasa               |

---

## 10.6. ChargeGenerationService

| ID          | Caso                                               | Resultado esperado |
| ----------- | -------------------------------------------------- | ------------------ |
| SRV-GEN-001 | Genera cargos para assignments activos             | éxito              |
| SRV-GEN-002 | Omite unidad archived                              | skipped            |
| SRV-GEN-003 | Omite assignment ended                             | skipped            |
| SRV-GEN-004 | Evita duplicados por idempotencyKey                | skipped            |
| SRV-GEN-005 | Batch completed con conteos correctos              | pasa               |
| SRV-GEN-006 | Batch completedWithErrors si hay errores parciales | pasa               |
| SRV-GEN-007 | dryRun no persiste cargos                          | pasa               |

---

## 10.7. ChargePolicyService

| ID             | Caso                                  | Resultado esperado |
| -------------- | ------------------------------------- | ------------------ |
| SRV-CH-POL-001 | Cargo issued cancelable               | permitido          |
| SRV-CH-POL-002 | Cargo cancelled no cancelable         | rechazado          |
| SRV-CH-POL-003 | Cargo issued reversible               | permitido          |
| SRV-CH-POL-004 | Cargo reversed no reversible          | rechazado          |
| SRV-CH-POL-005 | Cargo cancelled no ajustable          | rechazado          |
| SRV-CH-POL-006 | Cargo paid reservado bloqueado en MVP | rechazado          |

---

## 10.8. ChargeEffectiveAmountService

| ID          | Caso                             | Resultado esperado             |
| ----------- | -------------------------------- | ------------------------------ |
| SRV-EFF-001 | Sin ajustes                      | effective = original           |
| SRV-EFF-002 | Discount 5 sobre 50              | 45.00                          |
| SRV-EFF-003 | Increase 10 sobre 50             | 60.00                          |
| SRV-EFF-004 | Discount no puede dejar negativo | error o floor 0 según política |
| SRV-EFF-005 | Cancelación                      | 0.00                           |
| SRV-EFF-006 | Reverso                          | 0.00                           |
| SRV-EFF-007 | originalAmount no cambia         | pasa                           |

---

## 10.9. OwnChargePolicyService

| ID             | Caso                                                 | Resultado esperado      |
| -------------- | ---------------------------------------------------- | ----------------------- |
| SRV-OWN-CH-001 | Propietario consulta cargo de unidad propia          | permitido               |
| SRV-OWN-CH-002 | Residente autorizado consulta cargo de unidad propia | permitido               |
| SRV-OWN-CH-003 | Usuario consulta cargo de unidad ajena               | rechazado               |
| SRV-OWN-CH-004 | Usuario sin Person vinculada                         | `OWN_PERSON_NOT_LINKED` |
| SRV-OWN-CH-005 | Usuario no ve cargos de otro tenant                  | rechazado               |
| SRV-OWN-CH-006 | Relación ended no otorga acceso propio operativo     | rechazado               |

---

# 11. Pruebas de casos de uso

## 11.1. Charge Concepts

| ID         | Caso                          | Resultado esperado                   |
| ---------- | ----------------------------- | ------------------------------------ |
| APP-CC-001 | Crear concepto válido         | éxito                                |
| APP-CC-002 | Código duplicado mismo tenant | `CHARGE_CONCEPT_CODE_ALREADY_EXISTS` |
| APP-CC-003 | Código duplicado otro tenant  | éxito                                |
| APP-CC-004 | Actualizar concepto           | éxito                                |
| APP-CC-005 | Archivar concepto             | status archived                      |
| APP-CC-006 | Auditoría generada            | pasa                                 |
| APP-CC-007 | Evento emitido                | pasa                                 |

---

## 11.2. Fee Schedules

| ID         | Caso                    | Resultado esperado          |
| ---------- | ----------------------- | --------------------------- |
| APP-FS-001 | Crear schedule válido   | éxito                       |
| APP-FS-002 | Concepto inactivo       | `CHARGE_CONCEPT_NOT_ACTIVE` |
| APP-FS-003 | Concepto de otro tenant | `CROSS_TENANT_REFERENCE`    |
| APP-FS-004 | Monto inválido          | `MONEY_AMOUNT_INVALID`      |
| APP-FS-005 | Fechas inválidas        | `VALIDATION_ERROR`          |
| APP-FS-006 | Archivar schedule       | status archived             |
| APP-FS-007 | Auditoría generada      | pasa                        |

---

## 11.3. Unit Fee Assignments

| ID          | Caso                             | Resultado esperado                   |
| ----------- | -------------------------------- | ------------------------------------ |
| APP-UFA-001 | Asignar schedule a unidad activa | éxito                                |
| APP-UFA-002 | Unidad de otro tenant            | `CROSS_TENANT_REFERENCE`             |
| APP-UFA-003 | Schedule de otro tenant          | `CROSS_TENANT_REFERENCE`             |
| APP-UFA-004 | Unidad archived                  | `PROPERTY_UNIT_NOT_ACTIVE`           |
| APP-UFA-005 | Schedule inactive                | `FEE_SCHEDULE_NOT_ACTIVE`            |
| APP-UFA-006 | Assignment duplicado activo      | `UNIT_FEE_ASSIGNMENT_ALREADY_ACTIVE` |
| APP-UFA-007 | Finalizar assignment activo      | éxito                                |
| APP-UFA-008 | Finalizar assignment ended       | `UNIT_FEE_ASSIGNMENT_ALREADY_ENDED`  |

---

## 11.4. Billing Periods

| ID         | Caso                              | Resultado esperado              |
| ---------- | --------------------------------- | ------------------------------- |
| APP-BP-001 | Crear periodo válido              | éxito                           |
| APP-BP-002 | PeriodCode duplicado mismo tenant | `BILLING_PERIOD_ALREADY_EXISTS` |
| APP-BP-003 | PeriodCode duplicado otro tenant  | éxito                           |
| APP-BP-004 | Formato inválido                  | `VALIDATION_ERROR`              |
| APP-BP-005 | Cerrar periodo open               | éxito                           |
| APP-BP-006 | Cerrar periodo closed             | `BILLING_PERIOD_ALREADY_CLOSED` |
| APP-BP-007 | Bloquear periodo                  | éxito                           |

---

## 11.5. Generate Monthly Charges

| ID          | Caso                            | Resultado esperado        |
| ----------- | ------------------------------- | ------------------------- |
| APP-GEN-001 | Generar cargos de periodo open  | éxito                     |
| APP-GEN-002 | Generar dos veces mismo periodo | no duplica                |
| APP-GEN-003 | Periodo closed                  | `BILLING_PERIOD_NOT_OPEN` |
| APP-GEN-004 | Tenant suspended                | `TENANT_NOT_ACTIVE`       |
| APP-GEN-005 | Schedule inactive               | rechazado/omitido         |
| APP-GEN-006 | Unidad archived                 | omitida                   |
| APP-GEN-007 | dryRun                          | no persiste               |
| APP-GEN-008 | Batch completed                 | conteos correctos         |
| APP-GEN-009 | Errores parciales               | completedWithErrors       |
| APP-GEN-010 | Auditoría generada              | pasa                      |
| APP-GEN-011 | Evento MonthlyFeesGenerated     | pasa                      |

---

## 11.6. Charges

| ID         | Caso                              | Resultado esperado        |
| ---------- | --------------------------------- | ------------------------- |
| APP-CH-001 | Crear cargo extraordinario válido | éxito                     |
| APP-CH-002 | Crear cargo manual válido         | éxito                     |
| APP-CH-003 | Unidad de otro tenant             | `CROSS_TENANT_REFERENCE`  |
| APP-CH-004 | Concepto de otro tenant           | `CROSS_TENANT_REFERENCE`  |
| APP-CH-005 | Periodo cerrado                   | `BILLING_PERIOD_NOT_OPEN` |
| APP-CH-006 | Monto negativo                    | `MONEY_AMOUNT_INVALID`    |
| APP-CH-007 | Cargo sin unidad                  | `VALIDATION_ERROR`        |
| APP-CH-008 | Cargo sin concepto                | `VALIDATION_ERROR`        |
| APP-CH-009 | Cargo sin periodo                 | `VALIDATION_ERROR`        |
| APP-CH-010 | Auditoría generada                | pasa                      |

---

## 11.7. Cancel, Reverse and Adjust

| ID             | Caso                        | Resultado esperado         |
| -------------- | --------------------------- | -------------------------- |
| APP-CANCEL-001 | Cancelar cargo issued       | éxito                      |
| APP-CANCEL-002 | Cancelar cargo ya cancelled | `CHARGE_ALREADY_CANCELLED` |
| APP-CANCEL-003 | Cancelar sin motivo         | `VALIDATION_ERROR`         |
| APP-CANCEL-004 | effectiveAmount queda 0     | pasa                       |
| APP-CANCEL-005 | originalAmount se conserva  | pasa                       |
| APP-REV-001    | Reversar cargo issued       | éxito                      |
| APP-REV-002    | Reversar ya reversed        | `CHARGE_ALREADY_REVERSED`  |
| APP-REV-003    | Reversar sin motivo         | `VALIDATION_ERROR`         |
| APP-ADJ-001    | Aplicar discount            | effectiveAmount disminuye  |
| APP-ADJ-002    | Aplicar increase            | effectiveAmount aumenta    |
| APP-ADJ-003    | Ajustar cargo cancelled     | `CHARGE_NOT_ADJUSTABLE`    |
| APP-ADJ-004    | Ajuste sin motivo           | `VALIDATION_ERROR`         |
| APP-ADJ-005    | originalAmount no cambia    | pasa                       |

---

## 11.8. Own Charges

| ID             | Caso                                                        | Resultado esperado      |
| -------------- | ----------------------------------------------------------- | ----------------------- |
| APP-OWN-CH-001 | Propietario ve cargos de unidad propia                      | éxito                   |
| APP-OWN-CH-002 | Residente ve cargos de unidad propia si política lo permite | éxito                   |
| APP-OWN-CH-003 | Usuario no ve unidad ajena                                  | rechazado               |
| APP-OWN-CH-004 | Usuario sin Person                                          | `OWN_PERSON_NOT_LINKED` |
| APP-OWN-CH-005 | Tenant A no ve cargos Tenant B                              | pasa                    |

---

# 12. Pruebas de integración

## 12.1. Migración y persistencia

Archivo sugerido:

```text id="7m8rzi"
004-create-dues-fees.migration.spec.ts
```

| ID          | Caso                                  | Resultado esperado |
| ----------- | ------------------------------------- | ------------------ |
| INT-MIG-001 | Migración aplica en DB limpia         | éxito              |
| INT-MIG-002 | Enums creados                         | éxito              |
| INT-MIG-003 | Tablas creadas                        | éxito              |
| INT-MIG-004 | `tenant_id` obligatorio               | éxito              |
| INT-MIG-005 | Montos Decimal                        | éxito              |
| INT-MIG-006 | Unique tenant+concept code            | éxito              |
| INT-MIG-007 | Unique tenant+periodCode              | éxito              |
| INT-MIG-008 | Unique tenant+idempotencyKey          | éxito              |
| INT-MIG-009 | Unique tenant+chargeReversal chargeId | éxito              |
| INT-MIG-010 | onDelete Restrict                     | éxito              |
| INT-MIG-011 | No cascade delete peligroso           | éxito              |
| INT-MIG-012 | Constraints de fecha                  | éxito              |
| INT-MIG-013 | Constraints de monto                  | éxito              |
| INT-MIG-014 | Prisma Client genera                  | éxito              |

---

## 12.2. Repositorios

Archivos sugeridos:

```text id="ek0fps"
charge-concept.repository.integration.spec.ts
fee-schedule.repository.integration.spec.ts
unit-fee-assignment.repository.integration.spec.ts
billing-period.repository.integration.spec.ts
charge-batch.repository.integration.spec.ts
charge.repository.integration.spec.ts
charge-adjustment.repository.integration.spec.ts
charge-reversal.repository.integration.spec.ts
```

Casos mínimos:

| ID           | Caso                               | Resultado esperado |
| ------------ | ---------------------------------- | ------------------ |
| INT-REPO-001 | Crear y buscar ChargeConcept       | éxito              |
| INT-REPO-002 | Buscar concepto por code           | éxito              |
| INT-REPO-003 | Crear FeeSchedule                  | éxito              |
| INT-REPO-004 | Crear UnitFeeAssignment            | éxito              |
| INT-REPO-005 | Crear BillingPeriod                | éxito              |
| INT-REPO-006 | Crear ChargeBatch                  | éxito              |
| INT-REPO-007 | Crear Charge                       | éxito              |
| INT-REPO-008 | Buscar Charge por idempotencyKey   | éxito              |
| INT-REPO-009 | Crear Adjustment                   | éxito              |
| INT-REPO-010 | Crear Reversal                     | éxito              |
| INT-REPO-011 | Listar cargos por unidad           | éxito              |
| INT-REPO-012 | Listar cargos propios por unit IDs | éxito              |

---

## 12.3. Seeds

| ID           | Caso                            | Resultado esperado |
| ------------ | ------------------------------- | ------------------ |
| INT-SEED-001 | Crear conceptos demo            | éxito              |
| INT-SEED-002 | Crear FeeSchedules demo         | éxito              |
| INT-SEED-003 | Crear BillingPeriods demo       | éxito              |
| INT-SEED-004 | Crear UnitFeeAssignments demo   | éxito              |
| INT-SEED-005 | Reejecutar seeds                | idempotente        |
| INT-SEED-006 | Seeds no contienen datos reales | pasa               |
| INT-SEED-007 | Seeds no crean pagos ni saldos  | pasa               |

---

# 13. Pruebas API — Charge Concepts

## 13.1. Listar conceptos

Endpoint:

```text id="y0bkr3"
GET /api/v1/tenant/charge-concepts
```

| ID              | Caso                          | Resultado esperado |
| --------------- | ----------------------------- | ------------------ |
| API-CC-LIST-001 | TenantAdmin lista conceptos   | 200                |
| API-CC-LIST-002 | Sin token                     | 401                |
| API-CC-LIST-003 | Sin membership                | 403                |
| API-CC-LIST-004 | Sin permiso                   | 403                |
| API-CC-LIST-005 | No incluye conceptos Tenant B | pasa               |
| API-CC-LIST-006 | Filtro por status             | correcto           |
| API-CC-LIST-007 | Paginación                    | meta correcto      |

---

## 13.2. Crear concepto

Endpoint:

```text id="ef4egq"
POST /api/v1/tenant/charge-concepts
```

| ID                | Caso                          | Resultado esperado |
| ----------------- | ----------------------------- | ------------------ |
| API-CC-CREATE-001 | Crear concepto válido         | 201                |
| API-CC-CREATE-002 | Código duplicado mismo tenant | 409                |
| API-CC-CREATE-003 | Código duplicado otro tenant  | 201                |
| API-CC-CREATE-004 | defaultAmount negativo        | 422                |
| API-CC-CREATE-005 | currency no USD               | 422                |
| API-CC-CREATE-006 | tenantId en body              | 422 recomendado    |
| API-CC-CREATE-007 | Sin permiso                   | 403                |
| API-CC-CREATE-008 | Auditoría generada            | pasa               |

---

## 13.3. Consultar, actualizar y archivar concepto

| ID             | Endpoint             | Caso                      | Resultado esperado    |
| -------------- | -------------------- | ------------------------- | --------------------- |
| API-CC-GET-001 | GET `/{id}`          | Concepto del tenant       | 200                   |
| API-CC-GET-002 | GET `/{id}`          | Concepto de otro tenant   | 403/404               |
| API-CC-UPD-001 | PATCH `/{id}`        | Actualización válida      | 200                   |
| API-CC-UPD-002 | PATCH `/{id}`        | Intentar cambiar tenantId | rechazado             |
| API-CC-ARC-001 | POST `/{id}/archive` | Archivar válido           | 200                   |
| API-CC-ARC-002 | POST `/{id}/archive` | Ya archived               | 409/no-op documentado |

---

# 14. Pruebas API — Fee Schedules

| ID         | Caso                    | Resultado esperado |
| ---------- | ----------------------- | ------------------ |
| API-FS-001 | Listar schedules        | 200                |
| API-FS-002 | Crear schedule válido   | 201                |
| API-FS-003 | Concepto inactivo       | 409                |
| API-FS-004 | Concepto de otro tenant | 403/422            |
| API-FS-005 | Monto negativo          | 422                |
| API-FS-006 | effectiveTo anterior    | 422                |
| API-FS-007 | Currency no USD         | 422                |
| API-FS-008 | Actualizar schedule     | 200                |
| API-FS-009 | Archivar schedule       | 200                |
| API-FS-010 | Sin permiso             | 403                |

---

# 15. Pruebas API — Unit Fee Assignments

| ID          | Caso                        | Resultado esperado |
| ----------- | --------------------------- | ------------------ |
| API-UFA-001 | Listar assignments          | 200                |
| API-UFA-002 | Crear assignment válido     | 201                |
| API-UFA-003 | Unidad de otro tenant       | 403/422            |
| API-UFA-004 | Unidad archived             | 409                |
| API-UFA-005 | FeeSchedule de otro tenant  | 403/422            |
| API-UFA-006 | FeeSchedule inactive        | 409                |
| API-UFA-007 | Assignment duplicado activo | 409                |
| API-UFA-008 | Finalizar assignment        | 200                |
| API-UFA-009 | Finalizar ya ended          | 409                |
| API-UFA-010 | Historial se conserva       | pasa               |

---

# 16. Pruebas API — Billing Periods

| ID         | Caso                              | Resultado esperado |
| ---------- | --------------------------------- | ------------------ |
| API-BP-001 | Listar periodos                   | 200                |
| API-BP-002 | Crear periodo válido              | 201                |
| API-BP-003 | PeriodCode duplicado mismo tenant | 409                |
| API-BP-004 | PeriodCode duplicado otro tenant  | 201                |
| API-BP-005 | PeriodCode inválido               | 422                |
| API-BP-006 | Cerrar periodo open               | 200                |
| API-BP-007 | Cerrar periodo ya closed          | 409                |
| API-BP-008 | Bloquear periodo                  | 200                |
| API-BP-009 | Sin permiso de cierre             | 403                |

---

# 17. Pruebas API — Charge Generation

Endpoint:

```text id="6d87xa"
POST /api/v1/tenant/charges/generate-monthly
```

| ID          | Caso                             | Resultado esperado |
| ----------- | -------------------------------- | ------------------ |
| API-GEN-001 | Generación mensual válida        | 200                |
| API-GEN-002 | Generación crea batch            | pasa               |
| API-GEN-003 | Generación crea cargos           | pasa               |
| API-GEN-004 | Generación repetida no duplica   | pasa               |
| API-GEN-005 | Repetida incrementa skippedItems | pasa               |
| API-GEN-006 | dryRun no persiste cargos        | 200                |
| API-GEN-007 | Periodo closed                   | 409                |
| API-GEN-008 | Periodo locked                   | 409                |
| API-GEN-009 | Tenant suspended                 | 403                |
| API-GEN-010 | Schedule de otro tenant          | 403/422            |
| API-GEN-011 | Unidad archived omitida          | pasa               |
| API-GEN-012 | Sin permiso `fees.generate`      | 403                |
| API-GEN-013 | Auditoría generada               | pasa               |
| API-GEN-014 | Evento emitido                   | pasa               |

---

# 18. Pruebas API — Charge Batches

| ID            | Caso                                       | Resultado esperado |
| ------------- | ------------------------------------------ | ------------------ |
| API-BATCH-001 | Listar batches                             | 200                |
| API-BATCH-002 | Consultar batch                            | 200                |
| API-BATCH-003 | Batch de otro tenant                       | 403/404            |
| API-BATCH-004 | Sin permiso `fees.readBatches`             | 403                |
| API-BATCH-005 | Error summary no contiene datos personales | pasa               |
| API-BATCH-006 | Conteos correctos                          | pasa               |

---

# 19. Pruebas API — Charges

## 19.1. Listar y consultar

| ID              | Caso                       | Resultado esperado |
| --------------- | -------------------------- | ------------------ |
| API-CH-LIST-001 | Listar cargos              | 200                |
| API-CH-LIST-002 | Filtro por unidad          | correcto           |
| API-CH-LIST-003 | Filtro por periodo         | correcto           |
| API-CH-LIST-004 | Filtro por estado          | correcto           |
| API-CH-LIST-005 | No incluye cargos Tenant B | pasa               |
| API-CH-GET-001  | Consultar cargo            | 200                |
| API-CH-GET-002  | Cargo de otro tenant       | 403/404            |

---

## 19.2. Crear cargo manual o extraordinario

| ID                | Caso                              | Resultado esperado              |
| ----------------- | --------------------------------- | ------------------------------- |
| API-CH-CREATE-001 | Crear cargo extraordinario válido | 201                             |
| API-CH-CREATE-002 | Crear cargo manual válido         | 201                             |
| API-CH-CREATE-003 | Unidad de otro tenant             | 403/422                         |
| API-CH-CREATE-004 | Concepto de otro tenant           | 403/422                         |
| API-CH-CREATE-005 | Periodo closed                    | 409                             |
| API-CH-CREATE-006 | Monto negativo                    | 422                             |
| API-CH-CREATE-007 | Sin reason en extraordinario      | 422                             |
| API-CH-CREATE-008 | Idempotency-Key repetida          | no duplica o 409 según política |
| API-CH-CREATE-009 | tenantId en body                  | 422 recomendado                 |

---

## 19.3. Cancelar, reversar y ajustar

| ID                | Caso                      | Resultado esperado |
| ----------------- | ------------------------- | ------------------ |
| API-CH-CANCEL-001 | Cancelar cargo issued     | 200                |
| API-CH-CANCEL-002 | Cancelar sin reason       | 422                |
| API-CH-CANCEL-003 | Cancelar ya cancelled     | 409                |
| API-CH-CANCEL-004 | effectiveAmount 0         | pasa               |
| API-CH-CANCEL-005 | originalAmount conservado | pasa               |
| API-CH-REV-001    | Reversar cargo issued     | 200                |
| API-CH-REV-002    | Reversar sin reason       | 422                |
| API-CH-REV-003    | Reversar ya reversed      | 409                |
| API-CH-REV-004    | Crea ChargeReversal       | pasa               |
| API-CH-ADJ-001    | Crear ajuste discount     | 201                |
| API-CH-ADJ-002    | Crear ajuste increase     | 201                |
| API-CH-ADJ-003    | Ajuste sin reason         | 422                |
| API-CH-ADJ-004    | Ajuste negativo           | 422                |
| API-CH-ADJ-005    | Ajustar cargo cancelled   | 409                |
| API-CH-ADJ-006    | originalAmount conservado | pasa               |

---

# 20. Pruebas API — Own Charges

## 20.1. `/me/charges`

| ID             | Caso                                           | Resultado esperado |
| -------------- | ---------------------------------------------- | ------------------ |
| API-OWN-CH-001 | Propietario consulta cargos propios            | 200                |
| API-OWN-CH-002 | Residente consulta cargos propios si permitido | 200                |
| API-OWN-CH-003 | Usuario sin Person vinculada                   | 403                |
| API-OWN-CH-004 | Usuario sin permiso `charges.read.own`         | 403                |
| API-OWN-CH-005 | No devuelve cargos de unidad ajena             | pasa               |
| API-OWN-CH-006 | No devuelve cargos de Tenant B                 | pasa               |
| API-OWN-CH-007 | Filtro por propertyUnitId propia               | 200                |
| API-OWN-CH-008 | Filtro por propertyUnitId ajena                | 404/403            |

---

## 20.2. `/me/property-units/{propertyUnitId}/charges`

| ID                | Caso                  | Resultado esperado |
| ----------------- | --------------------- | ------------------ |
| API-OWN-PU-CH-001 | Unidad propia         | 200                |
| API-OWN-PU-CH-002 | Unidad ajena          | 404 recomendado    |
| API-OWN-PU-CH-003 | Unidad de otro tenant | 404/403            |
| API-OWN-PU-CH-004 | Sin token             | 401                |
| API-OWN-PU-CH-005 | Sin permiso `.own`    | 403                |

---

# 21. Pruebas de autorización

## 21.1. Matriz administrativa

| ID           | Usuario                         | Endpoint                                | Resultado |
| ------------ | ------------------------------- | --------------------------------------- | --------- |
| AUTH-FIN-001 | TenantAdminA                    | POST `/tenant/charge-concepts`          | 201       |
| AUTH-FIN-002 | TreasurerA                      | POST `/tenant/charges/generate-monthly` | 200       |
| AUTH-FIN-003 | BoardMemberA sin permiso create | POST `/tenant/charges`                  | 403       |
| AUTH-FIN-004 | TenantAuditorA                  | GET `/tenant/charges`                   | 200       |
| AUTH-FIN-005 | TenantAuditorA                  | POST `/tenant/charges/{id}/cancel`      | 403       |
| AUTH-FIN-006 | UserWithoutMembership           | GET `/tenant/charges`                   | 403       |
| AUTH-FIN-007 | UserWithoutPermission           | GET `/tenant/charges`                   | 403       |
| AUTH-FIN-008 | DisabledUser                    | GET `/tenant/charges`                   | 403       |
| AUTH-FIN-009 | Anonymous                       | GET `/tenant/charges`                   | 401       |

---

## 21.2. Tenant suspendido o archivado

| ID                  | Caso                                                         | Resultado esperado                   |
| ------------------- | ------------------------------------------------------------ | ------------------------------------ |
| AUTH-TENANT-FIN-001 | Crear concepto en tenant suspended                           | 403                                  |
| AUTH-TENANT-FIN-002 | Generar cargos en tenant suspended                           | 403                                  |
| AUTH-TENANT-FIN-003 | Crear cargo en tenant archived                               | 403                                  |
| AUTH-TENANT-FIN-004 | Consultar histórico en tenant suspended con permiso especial | permitido o bloqueado según política |

---

## 21.3. Separación de funciones

| ID           | Caso                                                   | Resultado esperado |
| ------------ | ------------------------------------------------------ | ------------------ |
| AUTH-SOD-001 | Usuario con `fees.generate` no puede `charges.reverse` | 403                |
| AUTH-SOD-002 | Usuario con `charges.read` no puede `charges.cancel`   | 403                |
| AUTH-SOD-003 | Usuario con `charges.adjust` no puede cerrar periodo   | 403                |
| AUTH-SOD-004 | TenantAuditor no modifica cargos                       | 403                |

---

# 22. Pruebas multitenant

| ID          | Caso                                      | Resultado esperado     |
| ----------- | ----------------------------------------- | ---------------------- |
| MT-DUES-001 | Tenant A no lista conceptos B             | pasa                   |
| MT-DUES-002 | Tenant A no consulta FeeSchedule B        | 403/404                |
| MT-DUES-003 | Tenant A no usa concepto B en FeeSchedule | rechazado              |
| MT-DUES-004 | Tenant A no asigna FeeSchedule a unidad B | rechazado              |
| MT-DUES-005 | Tenant A no crea periodo en Tenant B      | imposible por contexto |
| MT-DUES-006 | Tenant A no lista cargos B                | pasa                   |
| MT-DUES-007 | Tenant A no consulta cargo B por ID       | 403/404                |
| MT-DUES-008 | Tenant A no crea cargo para unidad B      | rechazado              |
| MT-DUES-009 | Tenant A no ajusta cargo B                | rechazado              |
| MT-DUES-010 | Tenant A no reversa cargo B               | rechazado              |
| MT-DUES-011 | Tenant A no consulta batch B              | 403/404                |
| MT-DUES-012 | Own charges no devuelve cargos B          | pasa                   |

---

# 23. Pruebas de precisión monetaria

| ID        | Caso                                     | Resultado esperado |
| --------- | ---------------------------------------- | ------------------ |
| MONEY-001 | Suma decimal exacta                      | exacta             |
| MONEY-002 | Resta decimal exacta                     | exacta             |
| MONEY-003 | Monto serializado como string            | pasa               |
| MONEY-004 | Monto persistido como Decimal            | pasa               |
| MONEY-005 | No se usa float en entidad               | pasa               |
| MONEY-006 | originalAmount `50.00`, discount `5.00`  | effective `45.00`  |
| MONEY-007 | originalAmount `50.00`, surcharge `2.50` | effective `52.50`  |
| MONEY-008 | Ajuste no deja negative effectiveAmount  | rechazado          |
| MONEY-009 | Currency no USD                          | rechazado          |

---

# 24. Pruebas de idempotencia

| ID             | Caso                                                     | Resultado esperado           |
| -------------- | -------------------------------------------------------- | ---------------------------- |
| IDEMP-DUES-001 | Generar cargos mensuales una vez                         | crea cargos                  |
| IDEMP-DUES-002 | Generar cargos mensuales dos veces                       | no duplica                   |
| IDEMP-DUES-003 | Mismo tenant+period+schedule+unit genera misma key       | pasa                         |
| IDEMP-DUES-004 | Diferente periodo genera nueva key                       | pasa                         |
| IDEMP-DUES-005 | Diferente unidad genera nueva key                        | pasa                         |
| IDEMP-DUES-006 | Unique tenant+idempotencyKey evita duplicado             | pasa                         |
| IDEMP-DUES-007 | Reintento después de fallo parcial no duplica existentes | pasa                         |
| IDEMP-DUES-008 | Idempotency-Key en cargo manual repetida                 | no duplica o 409 documentado |
| IDEMP-DUES-009 | DryRun no consume idempotencyKey persistida              | pasa                         |

---

# 25. Pruebas de concurrencia

| ID            | Caso                                                 | Resultado esperado                               |
| ------------- | ---------------------------------------------------- | ------------------------------------------------ |
| CONC-DUES-001 | Dos solicitudes crean mismo concepto simultáneamente | una crea, otra 409                               |
| CONC-DUES-002 | Dos solicitudes crean mismo periodo simultáneamente  | una crea, otra 409                               |
| CONC-DUES-003 | Dos generaciones mensuales simultáneas               | no duplican cargos                               |
| CONC-DUES-004 | Dos cancelaciones simultáneas del mismo cargo        | una cancela, otra 409                            |
| CONC-DUES-005 | Dos reversos simultáneos del mismo cargo             | una reversa, otra 409                            |
| CONC-DUES-006 | Dos ajustes simultáneos                              | ambos se registran y effectiveAmount consistente |
| CONC-DUES-007 | Assignment duplicado simultáneo                      | una crea, otra 409                               |

---

# 26. Pruebas de regresión financiera

| ID          | Caso                                                         | Resultado esperado             |
| ----------- | ------------------------------------------------------------ | ------------------------------ |
| FIN-REG-001 | Generación mensual 60 unidades                               | 60 o según assignments válidos |
| FIN-REG-002 | Unidad archived no recibe cargo ordinario                    | pasa                           |
| FIN-REG-003 | Assignment ended no genera cargo                             | pasa                           |
| FIN-REG-004 | Periodo closed bloquea generación                            | pasa                           |
| FIN-REG-005 | originalAmount nunca cambia tras ajuste                      | pasa                           |
| FIN-REG-006 | Cancelación mantiene cargo y originalAmount                  | pasa                           |
| FIN-REG-007 | Reverso mantiene cargo y crea reversal                       | pasa                           |
| FIN-REG-008 | Ajuste crea registro y actualiza effectiveAmount             | pasa                           |
| FIN-REG-009 | Batch registra total/success/skipped/failed                  | pasa                           |
| FIN-REG-010 | Estado de cuenta futuro reconstruible desde cargos y ajustes | datos suficientes              |

---

# 27. Pruebas de seguridad

## 27.1. Payload validation

| ID                   | Caso                        | Resultado esperado             |
| -------------------- | --------------------------- | ------------------------------ |
| SEC-DUES-PAYLOAD-001 | Strings demasiado largos    | 422                            |
| SEC-DUES-PAYLOAD-002 | Script en description       | 422 o sanitización documentada |
| SEC-DUES-PAYLOAD-003 | SQL-like input en search    | seguro                         |
| SEC-DUES-PAYLOAD-004 | IDs malformados             | 422                            |
| SEC-DUES-PAYLOAD-005 | tenantId en body            | 422 recomendado                |
| SEC-DUES-PAYLOAD-006 | amount con formato inválido | 422                            |
| SEC-DUES-PAYLOAD-007 | currency no soportada       | 422                            |

---

## 27.2. Seguridad financiera

| ID               | Caso                             | Resultado esperado |
| ---------------- | -------------------------------- | ------------------ |
| SEC-DUES-FIN-001 | No existe DELETE de cargos       | pasa               |
| SEC-DUES-FIN-002 | Cancelar no elimina cargo        | pasa               |
| SEC-DUES-FIN-003 | Reversar no elimina cargo        | pasa               |
| SEC-DUES-FIN-004 | Ajustar no cambia originalAmount | pasa               |
| SEC-DUES-FIN-005 | Generar en periodo locked        | 409                |
| SEC-DUES-FIN-006 | Usuario sin permiso no cancela   | 403                |
| SEC-DUES-FIN-007 | Error no expone stack trace      | pasa               |

---

## 27.3. Logs y privacidad

| ID               | Caso                                                            | Resultado esperado |
| ---------------- | --------------------------------------------------------------- | ------------------ |
| SEC-DUES-LOG-001 | Logs no contienen Authorization header                          | pasa               |
| SEC-DUES-LOG-002 | Logs no contienen token                                         | pasa               |
| SEC-DUES-LOG-003 | Logs no contienen payload completo                              | pasa               |
| SEC-DUES-LOG-004 | Logs no contienen datos personales de propietarios              | pasa               |
| SEC-DUES-LOG-005 | Batch errorSummary no contiene datos personales                 | pasa               |
| SEC-DUES-LOG-006 | Métricas no usan propertyUnitId como label de alta cardinalidad | pasa               |

---

# 28. Pruebas de auditoría

| ID           | Operación              | Evento auditable esperado |
| ------------ | ---------------------- | ------------------------- |
| AUD-DUES-001 | Crear concepto         | `chargeConcept.created`   |
| AUD-DUES-002 | Actualizar concepto    | `chargeConcept.updated`   |
| AUD-DUES-003 | Archivar concepto      | `chargeConcept.archived`  |
| AUD-DUES-004 | Crear FeeSchedule      | `feeSchedule.created`     |
| AUD-DUES-005 | Actualizar FeeSchedule | `feeSchedule.updated`     |
| AUD-DUES-006 | Archivar FeeSchedule   | `feeSchedule.archived`    |
| AUD-DUES-007 | Asignar unit fee       | `unitFee.assigned`        |
| AUD-DUES-008 | Finalizar unit fee     | `unitFee.ended`           |
| AUD-DUES-009 | Crear periodo          | `billingPeriod.created`   |
| AUD-DUES-010 | Cerrar periodo         | `billingPeriod.closed`    |
| AUD-DUES-011 | Bloquear periodo       | `billingPeriod.locked`    |
| AUD-DUES-012 | Generar mensualidad    | `chargeBatch.completed`   |
| AUD-DUES-013 | Crear cargo            | `charge.created`          |
| AUD-DUES-014 | Cancelar cargo         | `charge.cancelled`        |
| AUD-DUES-015 | Reversar cargo         | `charge.reversed`         |
| AUD-DUES-016 | Ajustar cargo          | `charge.adjusted`         |

Campos mínimos:

```text id="dj0zbh"
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

```text id="13qvsc"
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

# 29. Pruebas de eventos

| ID           | Operación                  | Evento esperado               |
| ------------ | -------------------------- | ----------------------------- |
| EVT-DUES-001 | Crear concepto             | `ChargeConceptCreated`        |
| EVT-DUES-002 | Crear FeeSchedule          | `FeeScheduleCreated`          |
| EVT-DUES-003 | Asignar unit fee           | `UnitFeeAssigned`             |
| EVT-DUES-004 | Crear periodo              | `BillingPeriodCreated`        |
| EVT-DUES-005 | Cerrar periodo             | `BillingPeriodClosed`         |
| EVT-DUES-006 | Generar cargos             | `MonthlyFeesGenerated`        |
| EVT-DUES-007 | Crear cargo manual         | `ManualChargeCreated`         |
| EVT-DUES-008 | Crear cargo extraordinario | `ExtraordinaryChargesCreated` |
| EVT-DUES-009 | Cancelar cargo             | `ChargeCancelled`             |
| EVT-DUES-010 | Reversar cargo             | `ChargeReversed`              |
| EVT-DUES-011 | Ajustar cargo              | `ChargeAdjusted`              |

Eventos no deben incluir:

```text id="yivgjd"
tokens
payload completo
datos personales de propietarios
datos personales de residentes
datos bancarios
comprobantes
```

---

# 30. Pruebas de observabilidad

| ID           | Caso                             | Resultado esperado      |
| ------------ | -------------------------------- | ----------------------- |
| OBS-DUES-001 | Request financiero exitoso       | log con traceId         |
| OBS-DUES-002 | Cross-tenant financiero denegado | log con errorCode       |
| OBS-DUES-003 | Own charge access denied         | métrica incrementa      |
| OBS-DUES-004 | Generación mensual inicia        | log started             |
| OBS-DUES-005 | Generación mensual completa      | log completed           |
| OBS-DUES-006 | Batch con errores                | log completedWithErrors |
| OBS-DUES-007 | Error devuelve traceId           | pasa                    |
| OBS-DUES-008 | Auditoría contiene traceId       | pasa                    |
| OBS-DUES-009 | Logs sanitizados                 | pasa                    |

Métricas esperadas:

```text id="o8s0fg"
charge_concepts_created_total
fee_schedules_created_total
unit_fee_assignments_created_total
billing_periods_created_total
charges_generated_total
charges_created_total
charges_cancelled_total
charges_reversed_total
charge_adjustments_created_total
charge_generation_batches_total
charge_generation_failures_total
financial_authorization_denied_total
own_charge_access_denied_total
```

---

# 31. Pruebas OpenAPI

Validar que OpenAPI incluya:

* Charge Concepts API;
* Fee Schedules API;
* Unit Fees API;
* Billing Periods API;
* Charge Generation API;
* Charge Batches API;
* Charges API;
* Own Charges API;
* permisos requeridos;
* errores estándar;
* ejemplos;
* security schemes;
* extensiones `x-required-permission`;
* extensiones `x-financial-operation`;
* extensiones `x-idempotent-operation`;
* extensiones `x-own-resource-policy`.

| ID            | Caso                                    | Resultado esperado |
| ------------- | --------------------------------------- | ------------------ |
| OAPI-DUES-001 | Endpoints administrativos documentados  | pasa               |
| OAPI-DUES-002 | Endpoints propios documentados          | pasa               |
| OAPI-DUES-003 | Endpoints privados tienen security      | pasa               |
| OAPI-DUES-004 | Permisos documentados                   | pasa               |
| OAPI-DUES-005 | Operaciones financieras marcadas        | pasa               |
| OAPI-DUES-006 | Idempotencia documentada                | pasa               |
| OAPI-DUES-007 | Errores documentados                    | pasa               |
| OAPI-DUES-008 | DTOs coinciden con contrato             | pasa               |
| OAPI-DUES-009 | Montos documentados como string decimal | pasa               |

---

# 32. Smoke tests

Smoke tests post-deploy:

| ID             | Caso                                   | Resultado esperado |
| -------------- | -------------------------------------- | ------------------ |
| SMOKE-DUES-001 | `GET /api/v1/health`                   | 200                |
| SMOKE-DUES-002 | `GET /api/v1/tenant/charges` sin token | 401                |
| SMOKE-DUES-003 | `GET /api/v1/me/charges` sin token     | 401                |
| SMOKE-DUES-004 | Usuario autorizado lista conceptos     | 200                |
| SMOKE-DUES-005 | Usuario sin permiso recibe 403         | 403                |
| SMOKE-DUES-006 | Error contiene traceId                 | pasa               |

No ejecutar generación mensual, cancelaciones, reversos ni ajustes destructivos en producción como smoke test ordinario.

---

# 33. Organización de archivos de prueba

```text id="x202ts"
apps/api/src/modules/dues-fees/tests/
├── unit/
│   ├── money.vo.spec.ts
│   ├── charge-concept-code.vo.spec.ts
│   ├── billing-period-code.vo.spec.ts
│   ├── due-date.vo.spec.ts
│   ├── idempotency-key.vo.spec.ts
│   ├── charge-status.vo.spec.ts
│   ├── charge-type.vo.spec.ts
│   ├── fee-frequency.vo.spec.ts
│   ├── charge-concept.entity.spec.ts
│   ├── fee-schedule.entity.spec.ts
│   ├── unit-fee-assignment.entity.spec.ts
│   ├── billing-period.entity.spec.ts
│   ├── charge-batch.entity.spec.ts
│   ├── charge.entity.spec.ts
│   ├── charge-adjustment.entity.spec.ts
│   └── charge-reversal.entity.spec.ts
│
├── application/
│   ├── money.service.spec.ts
│   ├── billing-period-policy.service.spec.ts
│   ├── fee-schedule-policy.service.spec.ts
│   ├── unit-fee-policy.service.spec.ts
│   ├── charge-idempotency.service.spec.ts
│   ├── charge-generation.service.spec.ts
│   ├── charge-policy.service.spec.ts
│   ├── charge-effective-amount.service.spec.ts
│   ├── own-charge-policy.service.spec.ts
│   ├── create-charge-concept.use-case.spec.ts
│   ├── create-fee-schedule.use-case.spec.ts
│   ├── assign-unit-fee.use-case.spec.ts
│   ├── create-billing-period.use-case.spec.ts
│   ├── generate-monthly-charges.use-case.spec.ts
│   ├── create-charge.use-case.spec.ts
│   ├── cancel-charge.use-case.spec.ts
│   ├── reverse-charge.use-case.spec.ts
│   ├── adjust-charge.use-case.spec.ts
│   └── own-charges.use-case.spec.ts
│
├── integration/
│   ├── 004-create-dues-fees.migration.spec.ts
│   ├── charge-concept.repository.integration.spec.ts
│   ├── fee-schedule.repository.integration.spec.ts
│   ├── unit-fee-assignment.repository.integration.spec.ts
│   ├── billing-period.repository.integration.spec.ts
│   ├── charge-batch.repository.integration.spec.ts
│   ├── charge.repository.integration.spec.ts
│   ├── charge-adjustment.repository.integration.spec.ts
│   ├── charge-reversal.repository.integration.spec.ts
│   └── dues-fees.seeds.integration.spec.ts
│
├── api/
│   ├── charge-concepts.api.spec.ts
│   ├── fee-schedules.api.spec.ts
│   ├── unit-fees.api.spec.ts
│   ├── billing-periods.api.spec.ts
│   ├── charge-generation.api.spec.ts
│   ├── charge-batches.api.spec.ts
│   ├── charges.api.spec.ts
│   └── own-charges.api.spec.ts
│
├── authorization/
│   ├── dues-fees.authorization.spec.ts
│   └── own-charges.authorization.spec.ts
│
├── multitenancy/
│   └── dues-fees.multitenancy.spec.ts
│
├── financial/
│   ├── money-precision.financial.spec.ts
│   ├── charge-generation-idempotency.financial.spec.ts
│   ├── charge-effective-amount.financial.spec.ts
│   ├── charge-cancel-reverse-adjust.financial.spec.ts
│   └── charge-batch.financial.spec.ts
│
├── concurrency/
│   └── dues-fees.concurrency.spec.ts
│
├── security/
│   ├── dues-fees-payload.security.spec.ts
│   ├── dues-fees-financial.security.spec.ts
│   └── dues-fees-logging.security.spec.ts
│
└── openapi/
    └── dues-fees.openapi.spec.ts
```

---

# 34. Comandos esperados

Comandos específicos sugeridos:

```bash id="bpwpvt"
npm run test:dues-fees
npm run test:dues-fees:unit
npm run test:dues-fees:application
npm run test:dues-fees:integration
npm run test:dues-fees:api
npm run test:dues-fees:authorization
npm run test:dues-fees:multitenancy
npm run test:dues-fees:financial
npm run test:dues-fees:security
```

Comandos generales:

```bash id="9422sl"
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

# 35. Requisitos para CI

En pull request deben correr como mínimo:

```text id="u8z6wo"
lint
typecheck
unit tests
application tests
integration tests críticos
API tests críticos
authorization tests
multitenancy tests
financial regression tests críticos
idempotency tests
OpenAPI validation
build
```

Antes de producción:

```text id="g9r8ov"
full test suite
migration tests
seed tests
authorization tests completos
multitenancy tests completos
financial regression completos
money precision tests
concurrency tests críticos
security/logging tests
smoke tests staging
```

---

# 36. Gates de calidad

No se permite merge si falla:

* precisión Decimal;
* unique tenant+charge concept code;
* unique tenant+periodCode;
* idempotencyKey;
* generación mensual idempotente;
* tenant isolation;
* own charges access;
* no physical delete;
* originalAmount inmutable;
* effectiveAmount correcto;
* periodo closed/locked bloquea generación;
* autorización financiera;
* auditoría financiera;
* OpenAPI validation.

---

# 37. Matriz de trazabilidad

| Requisito                          | Pruebas asociadas         |
| ---------------------------------- | ------------------------- |
| FR-001 Crear concepto              | APP-CC, API-CC-CREATE     |
| FR-002 Actualizar concepto         | API-CC-UPD                |
| FR-003 Archivar concepto           | API-CC-ARC                |
| FR-004 Crear FeeSchedule           | APP-FS, API-FS            |
| FR-005 Actualizar FeeSchedule      | API-FS                    |
| FR-006 Archivar FeeSchedule        | API-FS                    |
| FR-007 Asignar alícuota            | APP-UFA, API-UFA          |
| FR-008 Finalizar asignación        | APP-UFA-007, API-UFA-008  |
| FR-009 Crear periodo               | APP-BP, API-BP            |
| FR-010 Cerrar periodo              | API-BP-006                |
| FR-011 Generar cargos mensuales    | APP-GEN, API-GEN          |
| FR-012 Crear cargo extraordinario  | APP-CH, API-CH-CREATE     |
| FR-013 Crear cargo manual          | APP-CH, API-CH-CREATE     |
| FR-014 Listar cargos               | API-CH-LIST               |
| FR-015 Consultar cargo             | API-CH-GET                |
| FR-016 Consultar cargos por unidad | API-CH-LIST               |
| FR-017 Consultar mis cargos        | API-OWN-CH                |
| FR-018 Anular cargo                | APP-CANCEL, API-CH-CANCEL |
| FR-019 Reversar cargo              | APP-REV, API-CH-REV       |
| FR-020 Registrar ajuste            | APP-ADJ, API-CH-ADJ       |
| FR-021 Auditar operaciones         | AUD-DUES                  |
| FR-022 Emitir eventos              | EVT-DUES                  |
| FR-023 Evitar duplicados           | IDEMP-DUES                |
| FR-024 Validar multitenancy        | MT-DUES                   |

---

# 38. Riesgos cubiertos

| Riesgo                          | Pruebas                 |
| ------------------------------- | ----------------------- |
| Generar cargos duplicados       | IDEMP-DUES, API-GEN     |
| Usar unidad de otro tenant      | MT-DUES, APP-CH         |
| Usar concepto de otro tenant    | MT-DUES, APP-FS, APP-CH |
| Crear cargos con float          | MONEY                   |
| Alterar originalAmount          | APP-ADJ, FIN-REG        |
| Borrar cargos emitidos          | SEC-DUES-FIN            |
| Generar en periodo cerrado      | APP-GEN, API-GEN        |
| Usuario sin permiso anula cargo | AUTH-FIN                |
| Propietario ve cargo ajeno      | API-OWN-CH              |
| Falta de auditoría              | AUD-DUES                |
| Batch opaco                     | API-BATCH, FIN-REG      |

---

# 39. Criterios de salida

El módulo `004-dues-fees` puede considerarse probado si:

* todas las pruebas unitarias pasan;
* pruebas de Money pasan;
* pruebas de policies pasan;
* pruebas de casos de uso pasan;
* migración validada;
* seeds idempotentes;
* API tests pasan;
* authorization tests pasan;
* own access tests pasan;
* multitenancy tests pasan;
* financial regression tests pasan;
* idempotency tests pasan;
* concurrency tests críticos pasan;
* audit tests pasan;
* event tests pasan;
* observability tests pasan;
* OpenAPI actualizado;
* smoke tests pasan;
* no hay duplicidad de cargos;
* no hay uso de float;
* no hay eliminación física;
* no hay sobrescritura de `originalAmount`;
* no hay acceso cross-tenant;
* no hay fuga de datos en logs.

---

# 40. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="xzn05m"
- Pagos diferidos a 005-payments.
- Estados de cuenta consolidados diferidos a 006-account-statements.
- Mora avanzada diferida.
- Facturación electrónica diferida.
- Contabilidad completa diferida.
- Asientos contables diferidos.
- Reportes financieros avanzados diferidos.
- Conciliación bancaria diferida.
- Notificaciones automáticas diferidas.
- Automatización n8n diferida.
- Aprobación dual avanzada diferida.
- Carga masiva desde archivo diferida.
```

Estos pendientes no bloquean `004-dues-fees`.

---

## 41. Decisión final del test plan

El módulo `004-dues-fees` deberá probarse con unit tests, application tests, integration tests, migration tests, API tests, authorization tests, own access tests, multitenancy tests, money precision tests, idempotency tests, concurrency tests, financial regression tests, security tests, audit tests, event tests, observability tests, OpenAPI tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="qfuy7k"
- tenant_id obligatorio;
- precisión Decimal;
- generación mensual idempotente;
- no duplicidad de cargos;
- originalAmount inmutable;
- effectiveAmount correcto;
- no eliminación física;
- periodo open requerido;
- unidad activa requerida;
- concepto activo requerido;
- FeeSchedule activo requerido;
- autorización financiera estricta;
- acceso .own solo a cargos propios;
- auditoría financiera;
- eventos financieros;
- compatibilidad con pagos y estados de cuenta futuros.
```

Ninguna implementación de este módulo debe aceptarse si permite duplicar cargos mensuales, usar float para dinero, generar cargos en periodos cerrados, crear cargos para unidades de otro tenant, modificar `originalAmount`, eliminar cargos emitidos, omitir auditoría financiera o permitir que un propietario/residente vea cargos de unidades ajenas.
