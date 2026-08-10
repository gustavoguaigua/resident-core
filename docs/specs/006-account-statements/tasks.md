# Tasks — Spec 006 Account Statements, Balances and Financial Position by Property Unit

## 1. Información del documento

| Campo           | Valor                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                 |
| Spec ID         | 006                                                                                           |
| Módulo          | Account Statements                                                                            |
| Documento       | Implementation Tasks                                                                          |
| Ruta            | `docs/specs/006-account-statements/tasks.md`                                                  |
| Versión         | 0.1                                                                                           |
| Estado          | needs-review                                                                                  |
| Fecha           | 2026-07-14                                                                                    |
| Documento base  | `docs/specs/006-account-statements/spec.md`                                                   |
| Plan técnico    | `docs/specs/006-account-statements/plan.md`                                                   |
| Modelo de datos | `docs/specs/006-account-statements/data-model.md`                                             |
| Contrato API    | `docs/specs/006-account-statements/api-contract.md`                                           |
| Plan de pruebas | `docs/specs/006-account-statements/test-plan.md`                                              |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments` |

---

## 2. Propósito

Este documento convierte la spec `006-account-statements` en una lista ejecutable de tareas para implementar el módulo de estados de cuenta, balances y posición financiera por unidad habitacional.

El módulo debe permitir administrar:

* balances por unidad;
* estados de cuenta por periodo;
* líneas de estado de cuenta;
* saldos iniciales;
* cargos del periodo;
* pagos aplicados;
* ajustes;
* reversos;
* saldos vencidos;
* saldos no vencidos;
* saldos a favor;
* pagos no asignados;
* snapshots de balance;
* generación individual;
* generación en lote;
* publicación;
* cierre;
* bloqueo;
* regeneración controlada;
* consulta administrativa;
* consulta propia;
* exportación básica;
* auditoría financiera;
* eventos financieros;
* pruebas de reconstrucción;
* pruebas de precisión monetaria;
* preparación para mora, cobranza, reportes financieros, notificaciones y conciliación bancaria futura.

Regla central:

```text id="pk6q0v"
No se debe implementar ningún estado de cuenta, balance o snapshot que no pueda reconstruirse desde cargos, pagos, ajustes, reversos y asignaciones auditables.
```

---

## 3. Convenciones de estado

Usar los siguientes estados:

```text id="m2uau0"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="lvk1z4"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas de ejecución

Antes de implementar código, se debe revisar:

```text id="k8kosa"
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
docs/specs/006-account-statements/
```

Reglas obligatorias:

```text id="pj134e"
1. Todo AccountStatement debe tener tenantId.
2. Todo AccountStatement debe tener propertyUnitId.
3. Todo AccountStatement de periodo debe tener billingPeriodId.
4. Todo AccountStatementLine debe tener tenantId.
5. Todo UnitBalance debe tener tenantId y propertyUnitId.
6. Todo BalanceSnapshot debe tener tenantId y propertyUnitId.
7. Todo cálculo financiero debe usar Decimal.
8. No se permite float ni double para dinero.
9. Todo statement debe poder reconstruirse desde movimientos base.
10. Toda línea financiera debe tener sourceType y sourceId.
11. No se deben duplicar fuentes financieras dentro del mismo statement.
12. No se deben incluir cargos cancelados como deuda activa.
13. No se deben incluir cargos reversados como deuda activa.
14. No se deben incluir pagos reversados como abonos activos.
15. No se deben incluir allocations reversadas como abonos activos.
16. Los pagos no asignados deben tratarse separadamente como unallocatedPaymentBalance.
17. Los snapshots no reemplazan movimientos base.
18. No se debe publicar un statement inconsistente.
19. No se debe regenerar un statement sin motivo.
20. No se debe cerrar ni bloquear un statement sin motivo.
21. No se debe eliminar físicamente un statement publicado, cerrado, bloqueado o superseded.
22. No se debe permitir acceso cross-tenant.
23. No se debe permitir acceso .own a unidades ajenas.
24. No se debe exponer auditoría interna en endpoints .own.
25. No se debe implementar mora avanzada en esta spec.
26. No se debe implementar cobranza automatizada en esta spec.
27. No se debe implementar conciliación bancaria en esta spec.
28. No se debe implementar facturación electrónica en esta spec.
29. No se debe implementar PDF avanzado en esta spec.
30. No se deben usar datos reales en seeds.
```

---

## 5. Resumen de entregables

Al cerrar esta spec deben existir:

```text id="r4csq4"
docs/specs/006-account-statements/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Y en backend:

```text id="vqr7yt"
apps/api/src/modules/account-statements/
├── account-statements.module.ts
├── account-statements.controller.ts
├── balances.controller.ts
├── own-account-statements.controller.ts
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

```text id="nngdxx"
docs/specs/006-account-statements/
```

### Criterios de aceptación

* La carpeta existe.
* Contiene documentos de la spec.
* Sigue la estructura usada en specs anteriores.
* No reemplaza documentación de `004-dues-fees` ni `005-payments`.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="ifmmoj"
docs/specs/006-account-statements/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define actores.
* Define reglas de negocio.
* Define flujos funcionales.
* Define historias de usuario.
* Define requisitos funcionales.
* Define requisitos no funcionales.
* Define API preliminar.
* Define criterios de aceptación.
* Define riesgos financieros.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="m5vm1w"
docs/specs/006-account-statements/plan.md
```

### Criterios de aceptación

* Define arquitectura del módulo.
* Define estructura de carpetas.
* Define entidades.
* Define value objects.
* Define servicios.
* Define repositorios.
* Define puertos hacia `003`, `004` y `005`.
* Define controladores.
* Define auditoría.
* Define eventos.
* Define observabilidad.
* Define estrategia de entrega.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="u17q69"
docs/specs/006-account-statements/data-model.md
```

### Criterios de aceptación

* Define tablas.
* Define columnas.
* Define enums.
* Define relaciones.
* Define constraints.
* Define índices.
* Define modelo Prisma.
* Define source references.
* Define sourceHash.
* Define snapshots.
* Define reglas de cálculo.
* Define seeds.
* Define compatibilidad futura.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="iidqq2"
docs/specs/006-account-statements/api-contract.md
```

### Criterios de aceptación

* Define endpoints administrativos.
* Define endpoints propios.
* Define endpoints de balances.
* Define endpoints de movimientos financieros.
* Define permisos.
* Define requests.
* Define responses.
* Define errores.
* Define filtros.
* Define paginación.
* Define exportación.
* Define OpenAPI.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="f5py9u"
docs/specs/006-account-statements/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define application tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define own access tests.
* Define multitenancy tests.
* Define money precision tests.
* Define reconstruction tests.
* Define snapshot tests.
* Define financial regression tests.
* Define export tests.
* Define security tests.

---

## TASK-007 — Registrar tareas de implementación

**Estado:** `[ ] Pending`

### Archivo

```text id="cl5kzt"
docs/specs/006-account-statements/tasks.md
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

```text id="m64yd6"
docs/specs/006-account-statements/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos de saldos incorrectos.
* Define controles de reconstrucción.
* Define controles de snapshots.
* Define controles de acceso propio.
* Define controles de exportación.
* Define reglas de auditoría.
* Define reglas de logs.
* Define pruebas de seguridad.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `account-statements`

**Estado:** `[ ] Pending`

### Archivo

```text id="svkzi7"
apps/api/src/modules/account-statements/account-statements.module.ts
```

### Criterios de aceptación

* El módulo compila.
* Está registrado en `AppModule`.
* No depende de módulos futuros.
* Importa dependencias necesarias de tenants, users-roles, residents-properties, dues-fees y payments.
* No contiene lógica de negocio.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="vqx177"
apps/api/src/modules/account-statements/
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
│   ├── export/
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
* Exportación se encapsula en servicio/adaptador.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="apmyqx"
account-statements.controller.ts
balances.controller.ts
own-account-statements.controller.ts
```

### Criterios de aceptación

* Compilan.
* Están registrados en `AccountStatementsModule`.
* Tienen rutas base correctas.
* No contienen lógica de negocio.
* Solo orquestan DTOs, guards, policies y use cases.

---

# 8. Fase 2 — Value objects

## TASK-012 — Implementar `Money`

**Estado:** `[ ] Pending`

### Archivo

```text id="d6ogg5"
domain/value-objects/money.vo.ts
```

### Criterios de aceptación

* Usa Decimal.
* Valida amount.
* Valida currency.
* Serializa como string.
* Prohíbe float inseguro.
* Soporta suma, resta y comparación.
* Soporta separación de saldo deudor y saldo a favor.
* Tiene unit tests.

### Pruebas

```text id="a0fqja"
UT-AS-MONEY-001 a UT-AS-MONEY-008
MONEY-AS-001 a MONEY-AS-009
```

---

## TASK-013 — Implementar `AccountStatementStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="t2h6co"
domain/value-objects/account-statement-status.vo.ts
```

### Criterios de aceptación

* Valida estados permitidos.
* Define si un statement es publicable.
* Define si un statement es cerrable.
* Define si un statement es bloqueable.
* Define si un statement es regenerable.
* Bloquea estados inválidos.
* Tiene unit tests.

---

## TASK-014 — Implementar `AccountStatementLineType`

**Estado:** `[ ] Pending`

### Archivo

```text id="ty4wxp"
domain/value-objects/account-statement-line-type.vo.ts
```

### Criterios de aceptación

* Valida tipos permitidos.
* Define qué tipos requieren source reference.
* Define si una línea puede ser visible para residente.
* Tiene unit tests.

---

## TASK-015 — Implementar `StatementNumber`

**Estado:** `[ ] Pending`

### Archivo

```text id="x7puo7"
domain/value-objects/statement-number.vo.ts
```

### Criterios de aceptación

* Genera número base.
* Genera número para regeneración.
* Normaliza tenant slug.
* Normaliza period code.
* Normaliza unit code.
* Evita caracteres peligrosos.
* Tiene unit tests.

---

## TASK-016 — Implementar `SourceReference`

**Estado:** `[ ] Pending`

### Archivo

```text id="ei91hi"
domain/value-objects/source-reference.vo.ts
```

### Criterios de aceptación

* Valida sourceType.
* Valida sourceId.
* Exige source para líneas financieras.
* Permite source nulo solo en líneas no financieras explícitas.
* Tiene unit tests.

---

## TASK-017 — Implementar `BillingPeriodCode`

**Estado:** `[ ] Pending`

### Archivo

```text id="tki02j"
domain/value-objects/billing-period-code.vo.ts
```

### Criterios de aceptación

* Valida formato `YYYY-MM`.
* Rechaza meses inválidos.
* Rechaza formato incorrecto.
* Reutiliza lógica de `004-dues-fees` si ya existe.
* Tiene unit tests.

---

## TASK-018 — Implementar `BalanceSnapshotStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="x8uuy4"
domain/value-objects/balance-snapshot-status.vo.ts
```

### Criterios de aceptación

* Valida estados permitidos.
* Permite `current`, `superseded`, `closed`, `archived`.
* Bloquea estados inválidos.
* Tiene unit tests.

---

## TASK-019 — Implementar `BalanceSide`

**Estado:** `[ ] Pending`

### Archivo

```text id="q6j4xs"
domain/value-objects/balance-side.vo.ts
```

### Criterios de aceptación

* Valida `debit`, `credit`, `neutral`.
* Permite clasificar líneas.
* Tiene unit tests.

---

## TASK-020 — Implementar `SourceHash`

**Estado:** `[ ] Pending`

### Archivo

```text id="kc71a1"
domain/value-objects/source-hash.vo.ts
```

### Criterios de aceptación

* Construye hash determinístico.
* Usa movimientos fuente ordenados.
* Cambia si cambia monto, estado o updatedAt de movimientos.
* No incluye datos personales innecesarios.
* Tiene unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-021 — Implementar entidad `AccountStatement`

**Estado:** `[ ] Pending`

### Archivo

```text id="ah4eat"
domain/entities/account-statement.entity.ts
```

### Métodos esperados

```text id="f6xudv"
publish(actorId, notes)
close(actorId, reason)
lock(actorId, reason)
markSuperseded(newStatementId, reason)
canPublish()
canClose()
canLock()
canRegenerate()
assertTotalsConsistent()
```

### Criterios de aceptación

* Valida tenant.
* Valida propertyUnit.
* Valida billingPeriod.
* Valida statementNumber.
* Usa Decimal.
* Publica solo estados válidos.
* Cierra con motivo.
* Bloquea con motivo.
* Regenera con motivo.
* No elimina físicamente.
* Tiene unit tests.

---

## TASK-022 — Implementar entidad `AccountStatementLine`

**Estado:** `[ ] Pending`

### Archivo

```text id="vtx09t"
domain/entities/account-statement-line.entity.ts
```

### Métodos esperados

```text id="a2w0im"
assertSourceReference()
assertDebitCreditExclusive()
calculateBalanceAfterLine(previousBalance)
isFinancialLine()
isVisibleForOwn()
```

### Criterios de aceptación

* Requiere tenant.
* Requiere accountStatementId.
* Requiere propertyUnitId.
* Requiere billingPeriodId.
* Valida lineType.
* Valida source si aplica.
* No permite débito y crédito positivos al mismo tiempo.
* Calcula `balanceAfterLine`.
* Tiene unit tests.

---

## TASK-023 — Implementar entidad `UnitBalance`

**Estado:** `[ ] Pending`

### Archivo

```text id="vobb6d"
domain/entities/unit-balance.entity.ts
```

### Métodos esperados

```text id="dgjq68"
recalculate(input)
markStale()
markFresh()
assertNonNegative()
```

### Criterios de aceptación

* Requiere tenant.
* Requiere propertyUnit.
* Usa Decimal.
* Mantiene outstandingBalance.
* Mantiene overdueBalance.
* Mantiene notDueBalance.
* Mantiene creditBalance.
* Mantiene unallocatedPaymentBalance.
* Puede marcarse stale.
* Tiene unit tests.

---

## TASK-024 — Implementar entidad `BalanceSnapshot`

**Estado:** `[ ] Pending`

### Archivo

```text id="dn9h86"
domain/entities/balance-snapshot.entity.ts
```

### Métodos esperados

```text id="oc0l29"
markSuperseded()
markClosed()
assertConsistentWithBalance()
```

### Criterios de aceptación

* Requiere tenant.
* Requiere propertyUnit.
* Puede asociarse a billingPeriod.
* Puede asociarse a accountStatement.
* Usa Decimal.
* Puede almacenar sourceHash.
* No reemplaza movimientos fuente.
* Tiene unit tests.

---

## TASK-025 — Implementar DTO interno `FinancialMovement`

**Estado:** `[ ] Pending`

### Archivo

```text id="vgu53f"
domain/entities/financial-movement.entity.ts
```

### Criterios de aceptación

* Representa cargos, pagos, ajustes y reversos como movimientos homogéneos.
* Usa sourceType/sourceId.
* Usa debitAmount y creditAmount.
* Usa Decimal.
* Tiene tenantId, propertyUnitId y billingPeriodId.
* Permite ordenamiento.
* Tiene unit tests.

---

## TASK-026 — Implementar errores de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="ypxphz"
account-statement-not-found.error.ts
account-statement-already-exists.error.ts
account-statement-not-generatable.error.ts
account-statement-not-publishable.error.ts
account-statement-not-closable.error.ts
account-statement-not-lockable.error.ts
account-statement-not-regenerable.error.ts
account-statement-already-published.error.ts
account-statement-already-closed.error.ts
account-statement-already-locked.error.ts
account-statement-superseded.error.ts
account-statement-archived.error.ts
account-statement-lines-inconsistent.error.ts
account-statement-source-changed.error.ts
balance-not-found.error.ts
balance-recalculation-required.error.ts
balance-calculation-failed.error.ts
financial-movements-not-found.error.ts
property-unit-not-found.error.ts
billing-period-not-found.error.ts
reason-required.error.ts
export-format-not-supported.error.ts
own-account-statement-not-found.error.ts
own-balance-not-found.error.ts
own-person-not-linked.error.ts
cross-tenant-reference.error.ts
money-amount-invalid.error.ts
currency-not-supported.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone SQL.
* No expone stack trace.
* No expone datos personales.
* No expone payload financiero completo.

---

## TASK-027 — Implementar eventos de dominio

**Estado:** `[ ] Pending`

### Archivos esperados

```text id="v2e4p8"
account-statement-generated.event.ts
account-statement-batch-generated.event.ts
account-statement-published.event.ts
account-statement-closed.event.ts
account-statement-locked.event.ts
account-statement-regenerated.event.ts
account-statement-superseded.event.ts
account-statement-exported.event.ts
unit-balance-calculated.event.ts
unit-balance-recalculated.event.ts
balance-snapshot-created.event.ts
financial-movements-viewed.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen actorUserId cuando aplique.
* Incluyen traceId.
* Incluyen propertyUnitId si aplica.
* Incluyen billingPeriodId si aplica.
* No incluyen payload financiero completo.
* No incluyen datos personales innecesarios.
* No incluyen export completo.

---

# 10. Fase 4 — DTOs y validación

## TASK-028 — Crear DTOs de Account Statements

**Estado:** `[ ] Pending`

### Archivos

```text id="vikxwl"
generate-account-statement.dto.ts
generate-account-statements-batch.dto.ts
account-statement-response.dto.ts
account-statement-detail-response.dto.ts
list-account-statements-query.dto.ts
publish-account-statement.dto.ts
close-account-statement.dto.ts
lock-account-statement.dto.ts
regenerate-account-statement.dto.ts
export-account-statement-query.dto.ts
```

### Criterios de aceptación

* Valida propertyUnitId.
* Valida billingPeriodId.
* Valida mode.
* Valida reason cuando aplica.
* No permite tenantId.
* No permite status arbitrario.
* No permite totales arbitrarios enviados por cliente.
* Valida format de exportación.

---

## TASK-029 — Crear DTOs de líneas

**Estado:** `[ ] Pending`

### Archivos

```text id="g8swc0"
account-statement-line-response.dto.ts
financial-movement-response.dto.ts
```

### Criterios de aceptación

* Serializa montos como string.
* Incluye sourceType/sourceId en admin.
* Oculta source fields si política own lo requiere.
* Respeta `isVisibleToResident`.
* No expone auditoría interna.

---

## TASK-030 — Crear DTOs de Balances

**Estado:** `[ ] Pending`

### Archivos

```text id="g453iw"
unit-balance-response.dto.ts
list-balances-query.dto.ts
recalculate-unit-balance.dto.ts
financial-movements-query.dto.ts
```

### Criterios de aceptación

* Valida filtros.
* Valida minOutstandingBalance como decimal string.
* Valida `asOfDate`.
* Valida reason si aplica.
* No acepta tenantId.
* Serializa montos como string.

---

## TASK-031 — Crear DTOs propios

**Estado:** `[ ] Pending`

### Archivos

```text id="qoxduv"
my-account-statement-response.dto.ts
my-account-statement-detail-response.dto.ts
my-unit-balance-response.dto.ts
my-financial-movement-response.dto.ts
list-my-account-statements-query.dto.ts
export-my-account-statement-query.dto.ts
```

### Criterios de aceptación

* No exponen tenantId si no es necesario.
* No exponen actorUserId.
* No exponen sourceHash.
* No exponen auditoría interna.
* Ocultan líneas no visibles.
* Montos salen como string.

---

# 11. Fase 5 — Prisma, migración y seeds

## TASK-032 — Agregar enums de Account Statements a Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="er8qph"
AccountStatementStatus
AccountStatementLineType
BalanceSnapshotStatus
BalanceSide
StatementSourceType
CurrencyCode reutilizado si ya existe
```

### Criterios de aceptación

* Enums creados.
* Mapeados según `data-model.md`.
* No se duplica `CurrencyCode` si ya existe.
* Prisma Client genera sin errores.

---

## TASK-033 — Agregar modelo Prisma `AccountStatement`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `propertyUnitId` obligatorio.
* `billingPeriodId` obligatorio.
* `statementNumber` requerido.
* Montos Decimal.
* `currency` requerido.
* `generatedBy` requerido.
* Relaciones con Tenant, PropertyUnit, BillingPeriod y UserProfile.
* Relaciones de supersession/regeneration.
* `onDelete: Restrict`.
* Índices requeridos.

---

## TASK-034 — Agregar modelo Prisma `AccountStatementLine`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `accountStatementId` obligatorio.
* `propertyUnitId` obligatorio.
* `billingPeriodId` obligatorio.
* `lineType` requerido.
* `sourceType` y `sourceId` opcionales según tipo.
* Débito y crédito Decimal.
* `balanceAfterLine` Decimal.
* `sortOrder` requerido.
* `isVisibleToResident` requerido.
* Relaciones con Tenant, AccountStatement, PropertyUnit y BillingPeriod.
* `onDelete: Restrict`.

---

## TASK-035 — Agregar modelo Prisma `UnitBalance`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `propertyUnitId` obligatorio.
* `currency` requerido.
* Montos Decimal.
* `isStale` boolean.
* Unique tenant + propertyUnit + currency.
* Relaciones con Tenant y PropertyUnit.
* `onDelete: Restrict`.

---

## TASK-036 — Agregar modelo Prisma `BalanceSnapshot`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `tenantId` obligatorio.
* `propertyUnitId` obligatorio.
* `billingPeriodId` opcional.
* `accountStatementId` opcional.
* Montos Decimal.
* `sourceHash` opcional.
* `calculatedBy` opcional.
* Relaciones con Tenant, PropertyUnit, BillingPeriod, AccountStatement y UserProfile.
* `onDelete: Restrict`.

---

## TASK-037 — Agregar relaciones inversas en `Tenant`

**Estado:** `[ ] Pending`

### Relaciones

```text id="vklfct"
accountStatements
accountStatementLines
unitBalances
balanceSnapshots
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `001-tenants`.

---

## TASK-038 — Agregar relaciones inversas en `PropertyUnit`

**Estado:** `[ ] Pending`

### Relaciones

```text id="ydj1xd"
accountStatements
accountStatementLines
unitBalances
balanceSnapshots
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `003-residents-properties`.

---

## TASK-039 — Agregar relaciones inversas en `BillingPeriod`

**Estado:** `[ ] Pending`

### Relaciones

```text id="ajb7mk"
accountStatements
accountStatementLines
balanceSnapshots
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `004-dues-fees`.

---

## TASK-040 — Agregar relaciones inversas en `UserProfile`

**Estado:** `[ ] Pending`

### Relaciones

```text id="tpax96"
generatedAccountStatements
publishedAccountStatements
closedAccountStatements
lockedAccountStatements
calculatedBalanceSnapshots
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe tests de `002-users-roles`.

---

## TASK-041 — Crear migración `006_create_account_statements`

**Estado:** `[ ] Pending`

### Comando sugerido

```bash id="mxafqw"
npm run prisma:migrate:dev -- --name 006_create_account_statements
```

### Criterios de aceptación

* Migración creada.
* Migración aplica localmente.
* `tenant_id` obligatorio.
* `property_unit_id` obligatorio.
* `billing_period_id` obligatorio en statements.
* Montos Decimal.
* Unique constraints creados.
* Índices creados.
* No hay cascade delete peligroso.
* Prisma Client genera.

---

## TASK-042 — Agregar índices únicos parciales SQL

**Estado:** `[ ] Pending`

### Índices

```sql id="mqbmyh"
CREATE UNIQUE INDEX account_statements_active_unit_period_unique
ON account_statements (tenant_id, property_unit_id, billing_period_id)
WHERE status IN ('generated', 'published', 'closed', 'locked');
```

```sql id="c80dya"
CREATE UNIQUE INDEX account_statement_lines_source_unique
ON account_statement_lines (account_statement_id, source_type, source_id, line_type)
WHERE source_type IS NOT NULL AND source_id IS NOT NULL;
```

### Criterios de aceptación

* Índices agregados.
* Cubiertos por migration tests.
* No contradicen Prisma schema.
* Documentados en migración.

---

## TASK-043 — Agregar constraints SQL manuales

**Estado:** `[ ] Pending`

### Constraints

```text id="fx578f"
account_statements_amounts_non_negative_check
account_statements_line_count_non_negative_check
account_statements_close_reason_required_check
account_statements_lock_reason_required_check
account_statements_regeneration_reason_required_check
account_statement_lines_amounts_non_negative_check
account_statement_lines_debit_credit_exclusive_check
account_statement_lines_source_required_check
unit_balances_non_negative_check
balance_snapshots_non_negative_check
```

### Criterios de aceptación

* SQL revisado.
* Migration tests cubren constraints.
* No contradice Prisma schema.
* Documentado en migración.

---

## TASK-044 — Crear mappers Prisma ↔ dominio

**Estado:** `[ ] Pending`

### Archivo

```text id="sc4s8m"
infrastructure/persistence/account-statements.mapper.ts
```

### Criterios de aceptación

* Convierte Prisma a entidades.
* Convierte entidades a DTOs.
* Serializa Decimal como string.
* No expone entidades internas.
* No expone datos personales innecesarios.
* No expone campos internos en `.own`.

---

## TASK-045 — Crear repositorios Prisma

**Estado:** `[ ] Pending`

### Archivos

```text id="jzt9od"
prisma-account-statement.repository.ts
prisma-account-statement-line.repository.ts
prisma-unit-balance.repository.ts
prisma-balance-snapshot.repository.ts
```

### Criterios de aceptación

* No se usa Prisma desde controladores.
* Todas las consultas filtran por `tenantId`.
* Mapean errores de unique constraints.
* Tienen integration tests.
* No permiten eliminación física ordinaria.

---

## TASK-046 — Crear seeds de account statements demo

**Estado:** `[ ] Pending`

### Seeds

```text id="csgrtq"
statement generated demo
statement published demo
statement closed demo
statement lines demo
unit balance demo
balance snapshot demo
```

### Criterios de aceptación

* Idempotentes.
* Usan tenants demo.
* Usan unidades demo.
* Usan periodos demo de `004`.
* Usan cargos demo de `004`.
* Usan pagos demo de `005`.
* Usan montos ficticios.
* Usan USD.
* No crean mora.
* No crean cobranza.
* No usan datos reales.

---

# 12. Fase 6 — Puertos y adaptadores

## TASK-047 — Crear puertos de repositorio

**Estado:** `[ ] Pending`

### Archivos

```text id="pb2t37"
account-statement.repository.ts
account-statement-line.repository.ts
unit-balance.repository.ts
balance-snapshot.repository.ts
```

### Criterios de aceptación

* Contratos definidos.
* No dependen de Prisma.
* Usan `tenantId` en métodos críticos.
* Son testeables.

---

## TASK-048 — Crear `PropertyUnitReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="e4g1uq"
application/ports/property-unit-reader.port.ts
```

### Criterios de aceptación

* Permite validar unidad por tenant.
* Permite validar unidad activa.
* Permite listar unidades activas.
* No expone implementación interna de `003-residents-properties`.

---

## TASK-049 — Crear `OwnResourceReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="db2559"
application/ports/own-resource-reader.port.ts
```

### Criterios de aceptación

* Resuelve unidades propias del usuario.
* Usa `tenantId` y `userProfileId`.
* Compatible con `003-residents-properties`.
* Soporta endpoints `.own`.

---

## TASK-050 — Crear `BillingPeriodReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="tyci9o"
application/ports/billing-period-reader.port.ts
```

### Criterios de aceptación

* Consulta periodo por id.
* Consulta periodo por código.
* Valida que el periodo pertenece al tenant.
* Permite obtener periodo anterior.
* Compatible con `004-dues-fees`.

---

## TASK-051 — Crear `ChargeMovementReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="qp8b1v"
application/ports/charge-movement-reader.port.ts
```

### Criterios de aceptación

* Lista cargos válidos por unidad/periodo.
* Lista ajustes válidos.
* Lista reversos válidos.
* Lista cargos pendientes.
* Lista cargos vencidos.
* Excluye cargos cancelados/reversados salvo consulta explícita.
* No modifica cargos.

---

## TASK-052 — Crear `PaymentMovementReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="lejr9r"
application/ports/payment-movement-reader.port.ts
```

### Criterios de aceptación

* Lista allocations activas por unidad/periodo.
* Lista payment reversals.
* Lista allocation reversals.
* Lista pagos confirmados no asignados.
* Excluye pagos reversados.
* Excluye allocations reversadas.
* No modifica pagos.

---

## TASK-053 — Crear `AccountStatementsAuditPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="sx92gv"
application/ports/account-statements-audit.port.ts
```

### Criterios de aceptación

* Registra tenant.
* Registra actor.
* Registra recurso.
* Registra acción.
* Registra statementId, propertyUnitId y billingPeriodId.
* Registra montos relevantes.
* Registra reason cuando aplica.
* Registra traceId.
* No incluye payload completo.
* Compatible con futura spec `007-audit`.

---

## TASK-054 — Crear adaptador temporal de auditoría

**Estado:** `[ ] Pending`

### Archivo

```text id="cs77de"
infrastructure/audit/account-statements-audit.adapter.ts
```

### Criterios de aceptación

* Implementa `AccountStatementsAuditPort`.
* Sanitiza datos.
* No registra datos personales innecesarios.
* No registra export completo.
* Tiene tests básicos.

---

## TASK-055 — Crear `AccountStatementsEventsPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="db1kgm"
application/ports/account-statements-events.port.ts
```

### Criterios de aceptación

* Define `publish(event)`.
* No depende de broker externo.
* Compatible con outbox futuro.

---

## TASK-056 — Crear adaptador temporal de eventos

**Estado:** `[ ] Pending`

### Archivo

```text id="hm036l"
infrastructure/events/account-statements-events.adapter.ts
```

### Criterios de aceptación

* Implementa puerto de eventos.
* No envía payload financiero completo.
* No invoca n8n directamente.
* Es reemplazable por outbox/event bus futuro.

---

## TASK-057 — Crear adaptador de exportación JSON/CSV

**Estado:** `[ ] Pending`

### Archivo

```text id="vpb2a9"
infrastructure/export/account-statement-export.adapter.ts
```

### Criterios de aceptación

* Exporta JSON.
* Exporta CSV.
* No exporta campos internos en `.own`.
* No exporta datos de otro tenant.
* No implementa PDF avanzado.
* Tiene tests.

---

# 13. Fase 7 — Servicios y policies

## TASK-058 — Implementar `MoneyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="hnkvra"
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

## TASK-059 — Implementar `BalanceCalculatorService`

**Estado:** `[ ] Pending`

### Archivo

```text id="rxavkr"
application/services/balance-calculator.service.ts
```

### Criterios de aceptación

* Calcula outstandingBalance.
* Calcula overdueBalance.
* Calcula notDueBalance.
* Calcula creditBalance.
* Calcula unallocatedPaymentBalance.
* Excluye cargos cancelados/reversados.
* Excluye pagos reversados.
* Excluye allocations reversadas.
* Usa Decimal.
* Tiene financial tests.

---

## TASK-060 — Implementar `StatementLineBuilderService`

**Estado:** `[ ] Pending`

### Archivo

```text id="qqkjq7"
application/services/statement-line-builder.service.ts
```

### Criterios de aceptación

* Construye openingBalance.
* Construye líneas de cargos.
* Construye líneas de ajustes.
* Construye líneas de reversos.
* Construye líneas de pagos aplicados.
* Construye creditBalance si aplica.
* Construye closingBalance.
* Calcula balanceAfterLine.
* Asigna sortOrder.
* Asigna sourceType/sourceId.
* Tiene tests.

---

## TASK-061 — Implementar `StatementTotalsService`

**Estado:** `[ ] Pending`

### Archivo

```text id="qzkklp"
application/services/statement-totals.service.ts
```

### Criterios de aceptación

* Calcula chargesTotal.
* Calcula adjustmentsTotal.
* Calcula paymentsTotal.
* Calcula reversalsTotal.
* Calcula creditBalance.
* Calcula closingBalance.
* Valida consistencia contra líneas.
* Lanza error si no cuadran.
* Tiene tests.

---

## TASK-062 — Implementar `StatementNumberService`

**Estado:** `[ ] Pending`

### Archivo

```text id="sojtvt"
application/services/statement-number.service.ts
```

### Criterios de aceptación

* Genera número base.
* Genera número para regeneración.
* Evita duplicidad.
* Normaliza valores.
* Tiene tests.

---

## TASK-063 — Implementar `SourceHashService`

**Estado:** `[ ] Pending`

### Archivo

```text id="msp4u2"
application/services/source-hash.service.ts
```

### Criterios de aceptación

* Genera hash determinístico.
* Usa movimientos fuente relevantes.
* Ordena inputs antes de hashear.
* Detecta cambios de source.
* No incluye datos personales innecesarios.
* Tiene tests.

---

## TASK-064 — Implementar `StatementGenerationService`

**Estado:** `[ ] Pending`

### Archivo

```text id="naryts"
application/services/statement-generation.service.ts
```

### Criterios de aceptación

* Orquesta generación individual.
* Valida unidad.
* Valida periodo.
* Obtiene movimientos.
* Construye líneas.
* Calcula totales.
* Crea statement.
* Crea lines.
* Crea snapshot.
* Audita.
* Emite evento.
* Usa transacción.
* Tiene tests.

---

## TASK-065 — Implementar `StatementBatchGenerationService`

**Estado:** `[ ] Pending`

### Archivo

```text id="k8ble2"
application/services/statement-batch-generation.service.ts
```

### Criterios de aceptación

* Genera para todas las unidades activas.
* Genera para subset si se envía.
* Soporta dryRun.
* Maneja errores parciales.
* Calcula conteos.
* No duplica statements activos.
* No mezcla tenants.
* Tiene tests.

---

## TASK-066 — Implementar `BalanceSnapshotService`

**Estado:** `[ ] Pending`

### Archivo

```text id="sjp7xe"
application/services/balance-snapshot.service.ts
```

### Criterios de aceptación

* Crea snapshots.
* Marca snapshots superseded.
* Marca snapshots closed.
* Asocia snapshot a statement cuando aplica.
* Incluye sourceHash.
* Tiene tests.

---

## TASK-067 — Implementar `StatementPublicationPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="ydexfw"
application/services/statement-publication-policy.service.ts
```

### Criterios de aceptación

* Valida si un statement puede publicarse.
* Impide publicar superseded.
* Impide publicar archived.
* Impide publicar líneas inconsistentes.
* Define comportamiento de already published.
* Tiene tests.

---

## TASK-068 — Implementar `StatementRegenerationPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="s590aw"
application/services/statement-regeneration-policy.service.ts
```

### Criterios de aceptación

* Valida regeneración.
* Exige motivo.
* Impide regenerar locked sin permiso especial.
* Marca anterior como superseded.
* Vincula nuevo statement.
* Tiene tests.

---

## TASK-069 — Implementar `StatementExportService`

**Estado:** `[ ] Pending`

### Archivo

```text id="ig1z8j"
application/services/statement-export.service.ts
```

### Criterios de aceptación

* Exporta JSON.
* Exporta CSV.
* Valida formato.
* Oculta campos internos en `.own`.
* Audita exportación.
* No implementa PDF avanzado.
* Tiene tests.

---

## TASK-070 — Implementar `OwnAccountStatementPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="csibp0"
application/services/own-account-statement-policy.service.ts
```

### Criterios de aceptación

* Usa OwnResourceReaderPort.
* Valida statement propio.
* Valida balance propio.
* Valida movimientos propios.
* Oculta líneas no visibles.
* Rechaza usuario sin Person.
* Tiene own access tests.

---

# 14. Fase 8 — Casos de uso

## TASK-071 — Implementar `CalculateUnitBalanceUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `balances.read`.
* Valida tenant activo.
* Valida unidad del tenant.
* Obtiene movimientos.
* Calcula balance.
* Devuelve montos como string.
* Tiene tests.

---

## TASK-072 — Implementar `RecalculateUnitBalanceUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `balances.recalculate`.
* Recalcula desde movimientos base.
* Actualiza UnitBalance.
* Crea snapshot si se solicita.
* Audita.
* Emite `UnitBalanceRecalculated`.
* Tiene tests.

---

## TASK-073 — Implementar `ListBalancesUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `balances.read`.
* Lista balances por tenant.
* Soporta filtros.
* Soporta paginación.
* No mezcla tenants.
* Tiene tests.

---

## TASK-074 — Implementar `ListFinancialMovementsUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `balances.read`.
* Valida unidad del tenant.
* Lista movimientos base.
* Excluye inválidos por defecto.
* Soporta `includeReversed`.
* Audita si aplica.
* Tiene tests.

---

## TASK-075 — Implementar `GenerateAccountStatementUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.generate`.
* Valida tenant.
* Valida unidad.
* Valida periodo.
* Maneja statement existente según mode.
* Genera statement.
* Genera líneas.
* Genera snapshot.
* Audita.
* Emite `AccountStatementGenerated`.
* Tiene tests.

---

## TASK-076 — Implementar `GenerateAccountStatementsBatchUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.generate`.
* Valida periodo.
* Lista unidades activas.
* Soporta subset.
* Soporta dryRun.
* Maneja errores parciales.
* Devuelve conteos.
* Audita batch.
* Emite `AccountStatementBatchGenerated`.
* Tiene tests.

---

## TASK-077 — Implementar `GetAccountStatementUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.read`.
* Consulta por tenant.
* Incluye líneas.
* No expone otro tenant.
* Tiene tests.

---

## TASK-078 — Implementar `ListAccountStatementsUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.read`.
* Filtra por unidad.
* Filtra por periodo.
* Filtra por estado.
* Pagina.
* Ordena por campos permitidos.
* No mezcla tenants.
* Tiene tests.

---

## TASK-079 — Implementar `PublishAccountStatementUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.publish`.
* Valida estado publicable.
* Valida líneas consistentes.
* Marca published.
* Registra publishedAt y publishedBy.
* Audita.
* Emite `AccountStatementPublished`.
* Tiene tests.

---

## TASK-080 — Implementar `CloseAccountStatementUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.close`.
* Exige motivo.
* Marca closed.
* Registra closedAt y closedBy.
* Audita.
* Emite `AccountStatementClosed`.
* Tiene tests.

---

## TASK-081 — Implementar `LockAccountStatementUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.lock`.
* Exige motivo.
* Marca locked.
* Registra lockedAt y lockedBy.
* Audita.
* Emite `AccountStatementLocked`.
* Tiene tests.

---

## TASK-082 — Implementar `RegenerateAccountStatementUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.regenerate`.
* Exige motivo.
* Valida política de regeneración.
* Marca statement anterior superseded.
* Genera nuevo statement.
* Vincula previousStatementId.
* Actualiza supersededBy.
* Crea snapshot.
* Audita.
* Emite eventos.
* Usa transacción.
* Tiene tests.

---

## TASK-083 — Implementar `ExportAccountStatementUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permiso `accountStatements.export`.
* Valida statement del tenant.
* Exporta JSON.
* Exporta CSV.
* Audita.
* No exporta otro tenant.
* Tiene tests.

---

## TASK-084 — Implementar use cases `.own`

**Estado:** `[ ] Pending`

### Use cases

```text id="tvml1s"
GetMyAccountStatementsUseCase
GetMyAccountStatementUseCase
GetMyPropertyUnitBalanceUseCase
GetMyFinancialMovementsUseCase
ExportMyAccountStatementUseCase
```

### Criterios de aceptación

* Validan usuario autenticado.
* Validan tenant activo.
* Validan membership activa.
* Validan permisos `.own`.
* Validan unidades propias.
* No devuelven statements ajenos.
* No devuelven balances ajenos.
* No devuelven movimientos ajenos.
* Ocultan líneas no visibles.
* No exponen auditoría interna.
* Tienen own access tests.

---

# 15. Fase 9 — Guards, policies y autorización

## TASK-085 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida token.
* Resuelve UserProfile.
* Bloquea disabled user.
* Bloquea archived user.

---

## TASK-086 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida tenant active.
* Valida membership active.
* No confía solo en header.
* Bloquea tenant suspended/archived para operaciones de statements.

---

## TASK-087 — Reutilizar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos financieros.
* Usa EffectivePermissionsService.
* Rechaza sin permiso.
* Tiene authorization tests.

---

## TASK-088 — Implementar `OwnAccountStatementPolicyGuard` o policy layer

**Estado:** `[ ] Pending`

### Archivo sugerido

```text id="bb8afx"
policies/own-account-statement-policy.guard.ts
```

### Criterios de aceptación

* Valida permisos `.own`.
* Invoca `OwnAccountStatementPolicyService`.
* Rechaza unidades ajenas.
* Rechaza usuario sin Person.
* Tiene tests.

---

## TASK-089 — Crear decorators específicos del módulo

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="mruue2"
@RequireAccountStatementPermission()
@RequireBalancePermission()
@RequireOwnAccountStatementAccess()
@RequireFinancialExport()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Funcionan con guards/policies.
* Compatibles con OpenAPI.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-090 — Implementar `AccountStatementsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="u6xuea"
GET    /api/v1/tenant/account-statements
POST   /api/v1/tenant/account-statements/generate
POST   /api/v1/tenant/account-statements/generate-batch
GET    /api/v1/tenant/account-statements/:statementId
POST   /api/v1/tenant/account-statements/:statementId/publish
POST   /api/v1/tenant/account-statements/:statementId/close
POST   /api/v1/tenant/account-statements/:statementId/lock
POST   /api/v1/tenant/account-statements/:statementId/regenerate
GET    /api/v1/tenant/account-statements/:statementId/export
```

### Criterios de aceptación

* Usa use cases.
* Usa guards.
* Usa DTOs.
* Tiene OpenAPI.
* Tiene API tests.

---

## TASK-091 — Implementar `BalancesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="waahsz"
GET    /api/v1/tenant/balances
GET    /api/v1/tenant/property-units/:propertyUnitId/balance
POST   /api/v1/tenant/property-units/:propertyUnitId/balance/recalculate
GET    /api/v1/tenant/property-units/:propertyUnitId/financial-movements
```

### Criterios de aceptación

* Usa use cases.
* Usa guards.
* Usa DTOs.
* Valida permisos.
* No mezcla tenants.
* Tiene API tests.

---

## TASK-092 — Implementar `OwnAccountStatementsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="ggj7h3"
GET    /api/v1/me/account-statements
GET    /api/v1/me/account-statements/:statementId
GET    /api/v1/me/property-units/:propertyUnitId/balance
GET    /api/v1/me/property-units/:propertyUnitId/financial-movements
GET    /api/v1/me/account-statements/:statementId/export
```

### Criterios de aceptación

* Usa permisos `.own`.
* Valida unidades propias.
* No devuelve statements ajenos.
* No devuelve balances ajenos.
* No devuelve movimientos ajenos.
* Oculta campos internos.
* Tiene own API tests.

---

# 17. Fase 11 — Errores y respuestas estándar

## TASK-093 — Mapear errores de dominio a HTTP

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `ACCOUNT_STATEMENT_NOT_FOUND` → 404.
* `ACCOUNT_STATEMENT_ALREADY_EXISTS` → 409.
* `ACCOUNT_STATEMENT_NOT_PUBLISHABLE` → 409.
* `ACCOUNT_STATEMENT_NOT_CLOSABLE` → 409.
* `ACCOUNT_STATEMENT_NOT_LOCKABLE` → 409.
* `ACCOUNT_STATEMENT_NOT_REGENERABLE` → 409.
* `ACCOUNT_STATEMENT_LINES_INCONSISTENT` → 409.
* `ACCOUNT_STATEMENT_SOURCE_CHANGED` → 409.
* `BALANCE_NOT_FOUND` → 404.
* `BALANCE_CALCULATION_FAILED` → 409.
* `PROPERTY_UNIT_NOT_FOUND` → 404.
* `BILLING_PERIOD_NOT_FOUND` → 404.
* `REASON_REQUIRED` → 422.
* `EXPORT_FORMAT_NOT_SUPPORTED` → 422.
* `OWN_PERSON_NOT_LINKED` → 403.
* `CROSS_TENANT_REFERENCE` → 403/422.

---

## TASK-094 — Implementar error estándar

**Estado:** `[ ] Pending`

### Formato

```json id="wwc0kh"
{
  "error": {
    "code": "ACCOUNT_STATEMENT_LINES_INCONSISTENT",
    "message": "The account statement lines do not match the calculated totals.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

### Criterios de aceptación

* Todos los errores siguen formato.
* Incluyen `traceId`.
* No exponen stack trace en producción.
* No exponen SQL.
* No exponen datos personales.
* No exponen export completo.

---

## TASK-095 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Listados incluyen paginación.
* Montos salen como string decimal.
* No retorna entidades internas directamente.
* Own endpoints no exponen campos internos.

---

# 18. Fase 12 — OpenAPI

## TASK-096 — Documentar Account Statements API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Permisos documentados.
* Errores documentados.
* Ejemplos incluidos.
* Operaciones financieras marcadas.

---

## TASK-097 — Documentar Balances API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Filtros documentados.
* Recalculation documentado.
* Errores documentados.
* Montos como string.

---

## TASK-098 — Documentar Financial Movements API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoint documentado.
* sourceType documentado.
* includeReversed documentado.
* Response documentado.
* Visibilidad own documentada.

---

## TASK-099 — Documentar Own Account Statements API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints `/api/v1/me/*` documentados.
* Permisos `.own` documentados.
* `x-own-resource-policy` incluido.
* Errores `OWN_PERSON_NOT_LINKED`, `OWN_ACCOUNT_STATEMENT_NOT_FOUND` y `OWN_BALANCE_NOT_FOUND` documentados.

---

## TASK-100 — Agregar extensiones OpenAPI financieras

**Estado:** `[ ] Pending`

### Ejemplos

```yaml id="m0gjcq"
x-required-permission: accountStatements.generate
x-audit-event: accountStatement.generated
x-tenant-scope: tenant
x-financial-operation: true
```

```yaml id="rqgp0w"
x-required-permission: accountStatements.regenerate
x-audit-event: accountStatement.regenerated
x-tenant-scope: tenant
x-financial-operation: true
x-requires-reason: true
```

```yaml id="gzm8pd"
x-required-permission: accountStatements.export
x-audit-event: accountStatement.exported
x-tenant-scope: tenant
x-financial-export: true
```

```yaml id="bwgy8u"
x-required-permission: accountStatements.read.own
x-own-resource-policy: true
x-tenant-scope: tenant
```

### Criterios de aceptación

* Endpoints privados tienen `security`.
* Endpoints tienen permiso requerido.
* Endpoints auditables tienen evento.
* Endpoints financieros tienen flag.
* Endpoints de exportación tienen flag.
* Endpoints `.own` tienen policy.

---

# 19. Fase 13 — Pruebas unitarias

## TASK-101 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text id="ndmy04"
money.vo.spec.ts
account-statement-status.vo.spec.ts
account-statement-line-type.vo.spec.ts
statement-number.vo.spec.ts
source-reference.vo.spec.ts
billing-period-code.vo.spec.ts
balance-snapshot-status.vo.spec.ts
balance-side.vo.spec.ts
source-hash.vo.spec.ts
```

### Criterios de aceptación

* Cubren casos `UT-*`.
* Cubren precisión Decimal.
* Cubren source references.
* Cubren estados.
* Pasan en CI.

---

## TASK-102 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Archivos

```text id="zn7bl4"
account-statement.entity.spec.ts
account-statement-line.entity.spec.ts
unit-balance.entity.spec.ts
balance-snapshot.entity.spec.ts
financial-movement.entity.spec.ts
```

### Criterios de aceptación

* Cubren creación.
* Cubren publicación.
* Cubren cierre.
* Cubren bloqueo.
* Cubren regeneración.
* Cubren líneas.
* Cubren balances.
* Cubren snapshots.
* Cubren errores de dominio.

---

# 20. Fase 14 — Pruebas de aplicación

## TASK-103 — Implementar tests de `BalanceCalculatorService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cargos aumentan saldo.
* Pagos asignados reducen saldo.
* Sobrepago genera creditBalance.
* Pago no asignado genera unallocatedPaymentBalance.
* Cargos cancelados no suman.
* Pagos reversados no restan.
* Decimal exacto.

---

## TASK-104 — Implementar tests de `StatementLineBuilderService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Construye openingBalance.
* Construye charge lines.
* Construye paymentAllocation lines.
* Construye closingBalance.
* Asigna source references.
* Calcula balanceAfterLine.
* No duplica sources.

---

## TASK-105 — Implementar tests de `StatementTotalsService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Totales cuadran.
* Totales inconsistentes fallan.
* creditBalance se calcula correctamente.
* closingBalance se calcula correctamente.

---

## TASK-106 — Implementar tests de generación

**Estado:** `[ ] Pending`

### Servicios

```text id="b9mnt4"
StatementGenerationService
StatementBatchGenerationService
StatementNumberService
SourceHashService
```

### Criterios de aceptación

* Generación individual.
* Generación batch.
* dryRun.
* statement existente.
* sourceHash.
* snapshot.
* auditoría.
* eventos.

---

## TASK-107 — Implementar tests de publicación, cierre, bloqueo y regeneración

**Estado:** `[ ] Pending`

### Servicios

```text id="f6o6qp"
StatementPublicationPolicyService
StatementRegenerationPolicyService
```

### Criterios de aceptación

* Publicar estado válido.
* Bloquear inválidos.
* Cerrar con motivo.
* Bloquear con motivo.
* Regenerar con motivo.
* Supersede correcto.
* Locked protegido.

---

## TASK-108 — Implementar tests de acceso propio

**Estado:** `[ ] Pending`

### Servicio

```text id="yzzs7v"
OwnAccountStatementPolicyService
```

### Criterios de aceptación

* Propietario ve lo propio.
* Residente ve lo propio si política lo permite.
* Usuario sin Person falla.
* Unidad ajena falla.
* Statement generado no publicado se oculta.
* Línea invisible se oculta.

---

## TASK-109 — Implementar tests de exportación

**Estado:** `[ ] Pending`

### Servicio

```text id="im071q"
StatementExportService
```

### Criterios de aceptación

* Export JSON admin.
* Export CSV admin.
* Export JSON own.
* Export CSV own.
* Formato inválido falla.
* Own export oculta campos internos.
* Export auditado.

---

## TASK-110 — Implementar tests de use cases principales

**Estado:** `[ ] Pending`

### Use cases

```text id="w0d9rs"
CalculateUnitBalanceUseCase
RecalculateUnitBalanceUseCase
ListBalancesUseCase
ListFinancialMovementsUseCase
GenerateAccountStatementUseCase
GenerateAccountStatementsBatchUseCase
PublishAccountStatementUseCase
CloseAccountStatementUseCase
LockAccountStatementUseCase
RegenerateAccountStatementUseCase
ExportAccountStatementUseCase
Own use cases
```

### Criterios de aceptación

* Caminos felices.
* Caminos inválidos.
* Auditoría.
* Eventos.
* Validaciones tenant.
* Validaciones financieras.
* Validaciones `.own`.

---

# 21. Fase 15 — Pruebas de integración

## TASK-111 — Implementar migration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tablas creadas.
* Enums creados.
* `tenant_id` obligatorio.
* `property_unit_id` obligatorio.
* `billing_period_id` obligatorio en statements.
* Decimal en montos.
* Unique statementNumber.
* Unique active statement.
* Unique source.
* sortOrder único.
* onDelete Restrict.
* No cascade delete peligroso.
* Constraints de montos y motivos.

---

## TASK-112 — Implementar repository integration tests

**Estado:** `[ ] Pending`

### Repositorios

```text id="lj6ivl"
AccountStatementRepository
AccountStatementLineRepository
UnitBalanceRepository
BalanceSnapshotRepository
```

### Criterios de aceptación

* CRUD controlado.
* Queries por tenant.
* Búsquedas críticas.
* Constraints.
* Errores mapeados.
* No eliminación física.
* Source uniqueness.
* Active statement uniqueness.

---

## TASK-113 — Implementar integración con `004-dues-fees`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lee cargos válidos.
* Lee ajustes.
* Lee reversos.
* Excluye cancelados.
* Excluye reversados.
* No lee cargos de otro tenant.
* Tiene tests.

---

## TASK-114 — Implementar integración con `005-payments`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lee allocations activas.
* Lee pagos no asignados.
* Excluye pagos reversados.
* Excluye allocations reversadas.
* No lee pagos de otro tenant.
* Tiene tests.

---

## TASK-115 — Implementar seed integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Seeds idempotentes.
* Seeds crean statements demo.
* Seeds crean líneas demo.
* Seeds crean balances demo.
* Seeds crean snapshots demo.
* Seeds no crean mora.
* Seeds no crean cobranza.
* Seeds no usan datos reales.

---

# 22. Fase 16 — Pruebas API

## TASK-116 — Implementar API tests de Account Statements

**Estado:** `[ ] Pending`

### Archivo

```text id="jgwvlw"
account-statements.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Generar.
* Generar batch.
* Consultar.
* Publicar.
* Cerrar.
* Bloquear.
* Regenerar.
* Exportar.
* Validar errores.
* Validar cross-tenant.
* Validar permisos.

---

## TASK-117 — Implementar API tests de Balances

**Estado:** `[ ] Pending`

### Archivo

```text id="fgehzk"
balances.api.spec.ts
```

### Criterios de aceptación

* Listar balances.
* Consultar balance por unidad.
* Recalcular balance.
* Filtros.
* Paginación.
* Cross-tenant.
* Sin permiso.

---

## TASK-118 — Implementar API tests de Financial Movements

**Estado:** `[ ] Pending`

### Archivo

```text id="yc2628"
financial-movements.api.spec.ts
```

### Criterios de aceptación

* Consultar movimientos.
* Filtrar por periodo.
* Filtrar por sourceType.
* Excluir inválidos por defecto.
* includeReversed.
* Cross-tenant.
* Sin permiso.
* Auditoría.

---

## TASK-119 — Implementar API tests de Own Account Statements

**Estado:** `[ ] Pending`

### Archivo

```text id="r2n8xb"
own-account-statements.api.spec.ts
```

### Criterios de aceptación

* `/me/account-statements`.
* `/me/account-statements/:statementId`.
* `/me/property-units/:propertyUnitId/balance`.
* `/me/property-units/:propertyUnitId/financial-movements`.
* `/me/account-statements/:statementId/export`.
* Usuario sin Person.
* Usuario no ve unidad ajena.
* Usuario no ve tenant ajeno.
* Líneas invisibles no aparecen.
* Campos internos no aparecen.

---

# 23. Fase 17 — Authorization, own access y multitenancy

## TASK-120 — Implementar authorization tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token → 401.
* Sin membership → 403.
* Sin permiso → 403.
* Tenant suspendido → 403.
* Disabled user → 403.
* TenantAdmin/Treasurer autorizado.
* TenantAuditor solo lectura.
* Resident/Owner solo `.own`.

---

## TASK-121 — Implementar separation-of-duties tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `accountStatements.read` no genera.
* `accountStatements.generate` no publica.
* `accountStatements.publish` no regenera.
* `balances.read` no recalcula.
* `accountStatements.read.own` no exporta sin `export.own`.

---

## TASK-122 — Implementar own access tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Propietario ve statements propios.
* Residente ve statements propios si política lo permite.
* Usuario sin Person no accede.
* Usuario no ve unidad ajena.
* Usuario no ve statements de otro tenant.
* Líneas no visibles no se muestran.
* Relación ended no otorga acceso operativo.

---

## TASK-123 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant A no lista statements B.
* Tenant A no consulta statement B.
* Tenant A no genera statement para unidad B.
* Tenant A no genera statement para periodo B.
* Tenant A no publica statement B.
* Tenant A no regenera statement B.
* Tenant A no exporta statement B.
* Tenant A no consulta balance B.
* Tenant A no consulta movimientos B.
* Own statements no mezclan tenants.

---

# 24. Fase 18 — Pruebas financieras especiales

## TASK-124 — Implementar money precision tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Decimal exacto.
* Montos como string.
* No float.
* overpayment genera creditBalance.
* overdue/notDue exactos.
* USD obligatorio.

---

## TASK-125 — Implementar reconstruction tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Lines reconstruyen closingBalance.
* Opening + debits - credits = closing.
* Cada línea financiera tiene source.
* Source existe.
* Source pertenece al tenant.
* Source pertenece a la unidad.
* SourceHash coincide.
* No hay líneas duplicadas.

---

## TASK-126 — Implementar snapshot consistency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Snapshot se crea al generar statement.
* Snapshot se crea al recalcular si se solicita.
* Snapshot incluye sourceHash.
* Snapshot de otro tenant no visible.
* Snapshot superseded conserva histórico.
* Snapshot no reemplaza movimientos base.

---

## TASK-127 — Implementar generation/regeneration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Generar nuevo.
* failIfExists da 409.
* regenerateIfExists con motivo funciona.
* Regenerar sin motivo falla.
* Statement anterior queda superseded.
* Nuevo statement referencia anterior.
* Lines anteriores no se eliminan.
* SourceHash cambia si movimientos cambian.

---

## TASK-128 — Implementar export tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Export JSON admin.
* Export CSV admin.
* Export JSON own.
* Export CSV own.
* Formato inválido falla.
* Export cross-tenant falla.
* Export own ajeno falla.
* Export own no contiene campos internos.
* Export auditado.

---

## TASK-129 — Implementar concurrency tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Dos generaciones simultáneas no duplican statement activo.
* Publicación simultánea consistente.
* Cierre simultáneo consistente.
* Regeneración simultánea controlada.
* Recalcular mientras genera mantiene consistencia.
* Batch concurrente no duplica.
* Cambio de pago durante generación detecta sourceHash.

---

## TASK-130 — Implementar financial regression tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Saldo inicial correcto.
* Cargos aumentan saldo.
* Ajuste positivo aumenta saldo.
* Ajuste negativo reduce saldo.
* Pago asignado reduce saldo.
* Pago no asignado va a unallocatedPaymentBalance.
* Cargo cancelado no suma.
* Cargo reversado no suma.
* Pago reversado no reduce.
* Allocation reversada no reduce.
* Sobrepago genera creditBalance.
* overdueBalance correcto.
* notDueBalance correcto.
* Statement reconstruible.
* Batch idempotente.

---

# 25. Fase 19 — Seguridad y privacidad

## TASK-131 — Implementar security tests de payload

**Estado:** `[ ] Pending`

### Criterios de aceptación

* IDs malformados rechazados.
* tenantId en body rechazado.
* periodCode inválido rechazado.
* reason vacío cuando requerido rechazado.
* reason demasiado largo rechazado.
* sortBy arbitrario rechazado.
* export format inválido rechazado.
* strings con script tratados según política.

---

## TASK-132 — Implementar financial safety tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No existe DELETE de statements.
* No existe DELETE de lines.
* Publicar requiere permiso.
* Regenerar requiere motivo.
* Published no se modifica silenciosamente.
* Snapshot no reemplaza movimientos.
* Error no expone SQL/stack.

---

## TASK-133 — Implementar logging security tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No Authorization header.
* No access token.
* No payload completo.
* No export completo.
* No datos personales innecesarios.
* Métricas sin propertyUnitId como label.
* Métricas sin statementId como label.
* Errores contienen traceId.

---

# 26. Fase 20 — Auditoría, eventos y observabilidad

## TASK-134 — Validar auditoría financiera

**Estado:** `[ ] Pending`

### Eventos auditables

```text id="uvcph9"
accountStatement.generated
accountStatement.batchGenerated
accountStatement.published
accountStatement.closed
accountStatement.locked
accountStatement.regenerated
accountStatement.superseded
accountStatement.exported
balance.recalculated
balance.snapshotCreated
financialMovements.viewed
accountStatement.viewedSensitive
```

### Criterios de aceptación

* Cada operación crítica genera auditoría.
* Auditoría incluye tenantId, actorUserId y traceId.
* Auditoría incluye statementId, propertyUnitId y billingPeriodId.
* Auditoría incluye reason cuando aplica.
* Auditoría no incluye payload completo.
* Auditoría no incluye export completo.

---

## TASK-135 — Validar eventos financieros

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Eventos principales emitidos.
* Incluyen tenantId.
* Incluyen traceId.
* Incluyen referencias financieras.
* No incluyen payload completo.
* No incluyen datos personales innecesarios.
* No incluyen export completo.

---

## TASK-136 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs incluyen traceId.
* Logs incluyen tenantId.
* Logs incluyen actorUserId.
* Logs incluyen errorCode si aplica.
* Logs sanitizados.
* Logs de export no incluyen documento completo.
* Logs no contienen datos personales innecesarios.

---

## TASK-137 — Agregar métricas financieras básicas

**Estado:** `[ ] Pending`

### Métricas

```text id="lkx9rm"
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

### Criterios de aceptación

* Métricas incrementan.
* No usan datos personales como labels.
* No usan propertyUnitId como label.
* No usan statementId como label.
* No usan saldos como labels.
* No exponen sourceHash.

---

# 27. Fase 21 — CI/CD y smoke tests

## TASK-138 — Agregar comandos de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="kfl5hw"
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

### Criterios de aceptación

* Scripts disponibles o equivalentes.
* Corren localmente.
* Documentados en package scripts.

---

## TASK-139 — Agregar validaciones al pipeline CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="zwgtja"
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
security tests críticos
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay cálculo con float.
* Pipeline falla si statement no reconstruye.
* Pipeline falla si source references faltan.
* Pipeline falla si `.own` está mal implementado.
* Pipeline falla si cross-tenant pasa.
* Pipeline falla si OpenAPI no coincide.

---

## TASK-140 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="url4vs"
GET /api/v1/health
GET /api/v1/tenant/account-statements sin token
GET /api/v1/me/account-statements sin token
GET /api/v1/tenant/account-statements con usuario autorizado
GET /api/v1/tenant/account-statements con usuario sin permiso
```

### Criterios de aceptación

* Smoke tests pasan en dev/staging.
* No generan statements reales.
* No publican statements reales.
* No cierran statements reales.
* No bloquean statements reales.
* No regeneran statements reales.
* No exportan statements reales.
* Errores incluyen traceId.

---

# 28. Fase 22 — Revisión SDD

## TASK-141 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas asociadas.
* Cada endpoint tiene API tests.
* Cada endpoint privado tiene authorization tests.
* Cada endpoint `.own` tiene own access tests.
* Cada operación tenant-scoped tiene multitenancy tests.
* Cada operación financiera crítica tiene auditoría.
* Cada regla monetaria tiene tests.
* Cada regla de reconstrucción tiene tests.
* Cada regla de snapshot tiene tests.

---

## TASK-142 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="nlyneq"
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
* No elimina físicamente statements.
* No omite autorización.
* No omite auditoría.
* No expone datos personales.
* No omite pruebas financieras.
* No expone saldos ajenos.

---

## TASK-143 — Actualizar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Contrato coincide con `api-contract.md`.
* Endpoints privados tienen security.
* Permisos documentados.
* Errores documentados.
* Endpoints `.own` documentados.
* Exportación documentada.
* Operaciones financieras marcadas.
* Montos como string decimal.

---

## TASK-144 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos esperados

```bash id="n0plra"
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

## TASK-145 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="gb5kso"
- PR link o commit SHA.
- Migración aplicada.
- Prisma Client generado.
- Seeds ejecutados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 29. Fase 23 — Pendientes diferidos controlados

## TASK-146 — Diferir mora avanzada

**Estado:** `[-] Deferred`

### Razón

Requiere reglas por tenant, fechas de gracia, intereses, exoneraciones y políticas legales.

### Implementación futura

```text id="ngmqgl"
docs/specs/00X-late-fees/
```

---

## TASK-147 — Diferir cobranza automatizada

**Estado:** `[-] Deferred`

### Razón

Requiere estados de cuenta publicados, reglas de mora, comunicaciones y escalamiento.

### Implementación futura

```text id="eps424"
docs/specs/00X-collections/
```

---

## TASK-148 — Diferir notificaciones automáticas

**Estado:** `[-] Deferred`

### Razón

Requiere módulo de comunicaciones, templates, canales y preferencias.

### Implementación futura

```text id="fbvum4"
docs/specs/009-notifications/
```

---

## TASK-149 — Diferir envío por correo y WhatsApp

**Estado:** `[-] Deferred`

### Razón

Requiere proveedores, consentimiento, plantillas, rate limits y trazabilidad de delivery.

### Implementación futura

```text id="rou77a"
docs/specs/00X-statement-delivery/
```

---

## TASK-150 — Diferir PDF avanzado

**Estado:** `[-] Deferred`

### Razón

MVP permite JSON/CSV. PDF requiere diseño, almacenamiento, versionado y control de descarga.

### Implementación futura

```text id="x32md2"
docs/specs/00X-statement-documents/
```

---

## TASK-151 — Diferir firma electrónica

**Estado:** `[-] Deferred`

### Razón

Requiere proveedor, flujo legal, documentos sellados y auditoría reforzada.

### Implementación futura

```text id="r3t5yx"
docs/specs/00X-electronic-signature/
```

---

## TASK-152 — Diferir conciliación bancaria

**Estado:** `[-] Deferred`

### Razón

Requiere movimientos bancarios, matching, estados de conciliación y reglas de duplicidad.

### Implementación futura

```text id="vvku91"
docs/specs/00X-bank-reconciliation/
```

---

## TASK-153 — Diferir facturación electrónica

**Estado:** `[-] Deferred`

### Razón

Requiere integración tributaria y separación entre estado de cuenta financiero y documento tributario.

### Implementación futura

```text id="mfjyh9"
docs/specs/00X-electronic-invoicing/
```

---

## TASK-154 — Diferir contabilidad completa

**Estado:** `[-] Deferred`

### Razón

Requiere plan de cuentas, asientos, periodos contables y cierres.

### Implementación futura

```text id="v0ayqb"
docs/specs/00X-accounting/
```

---

## TASK-155 — Diferir dashboards financieros avanzados

**Estado:** `[-] Deferred`

### Razón

Requiere agregaciones, métricas, seguridad de reportes y optimización.

### Implementación futura

```text id="yd31if"
docs/specs/00X-financial-reports/
```

---

## TASK-156 — Diferir automatizaciones n8n

**Estado:** `[-] Deferred`

### Razón

Requiere eventos estables, webhooks firmados y políticas de seguridad.

### Implementación futura

```text id="sffx9d"
docs/specs/00X-n8n-automations/
```

---

# 30. Definition of Done del módulo

El módulo `006-account-statements` estará terminado cuando:

```text id="j7e6m5"
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
[ ] Puertos hacia BillingPeriod implementados.
[ ] Puertos hacia Charges implementados.
[ ] Puertos hacia Payments implementados.
[ ] Servicio Money implementado.
[ ] BalanceCalculator implementado.
[ ] StatementLineBuilder implementado.
[ ] StatementTotals implementado.
[ ] SourceHash implementado.
[ ] StatementGeneration implementado.
[ ] BatchGeneration implementado.
[ ] SnapshotService implementado.
[ ] ExportService implementado.
[ ] OwnAccountStatementPolicy implementado.
[ ] Use cases implementados.
[ ] Controladores implementados.
[ ] Endpoints administrativos protegidos.
[ ] Endpoints .own protegidos.
[ ] Balance actual por unidad funciona.
[ ] Movimientos financieros por unidad funcionan.
[ ] Generación individual funciona.
[ ] Generación batch funciona.
[ ] Publicación funciona.
[ ] Cierre funciona.
[ ] Bloqueo funciona.
[ ] Regeneración funciona.
[ ] Export JSON funciona.
[ ] Export CSV funciona.
[ ] Money usa Decimal.
[ ] No se usa float.
[ ] Statements tienen tenantId.
[ ] Statements tienen propertyUnitId.
[ ] Statements tienen billingPeriodId.
[ ] Lines tienen sourceType/sourceId cuando aplica.
[ ] No se duplican sources.
[ ] No se duplica statement activo por unidad/periodo.
[ ] Cargos cancelados no suman.
[ ] Cargos reversados no suman.
[ ] Pagos reversados no reducen.
[ ] Allocations reversadas no reducen.
[ ] Pagos no asignados se separan.
[ ] overdueBalance correcto.
[ ] notDueBalance correcto.
[ ] creditBalance correcto.
[ ] sourceHash implementado.
[ ] Snapshots implementados.
[ ] Regeneración deja statement anterior superseded.
[ ] No hay acceso cross-tenant.
[ ] Own statements solo devuelve unidades propias.
[ ] Own balances solo devuelve unidades propias.
[ ] Own movements solo devuelve unidades propias.
[ ] No se eliminan statements publicados/cerrados/bloqueados.
[ ] Auditoría financiera implementada.
[ ] Eventos financieros implementados.
[ ] Logs sanitizados.
[ ] Métricas básicas implementadas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Application tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own access tests pasan.
[ ] Multitenancy tests pasan.
[ ] Money precision tests pasan.
[ ] Reconstruction tests pasan.
[ ] Snapshot tests pasan.
[ ] Financial regression tests pasan.
[ ] Security tests pasan.
[ ] CI pasa.
[ ] Smoke tests pasan.
[ ] Pendientes diferidos documentados.
```

---

## 31. Orden recomendado de ejecución

```text id="j9f296"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-011      Estructura base
3. TASK-012 a TASK-020      Value objects
4. TASK-021 a TASK-027      Entidades, errores y eventos
5. TASK-028 a TASK-031      DTOs
6. TASK-032 a TASK-046      Prisma, migración y seeds
7. TASK-047 a TASK-057      Puertos y adaptadores
8. TASK-058 a TASK-070      Servicios y policies
9. TASK-071 a TASK-084      Use cases
10. TASK-085 a TASK-089     Guards, policies y decorators
11. TASK-090 a TASK-092     Controladores
12. TASK-093 a TASK-095     Errores y respuestas
13. TASK-096 a TASK-100     OpenAPI
14. TASK-101 a TASK-133     Pruebas
15. TASK-134 a TASK-137     Auditoría, eventos y observabilidad
16. TASK-138 a TASK-140     CI/CD y smoke tests
17. TASK-141 a TASK-145     Revisión SDD
```

---

## 32. Riesgos de ejecución

| Riesgo                                    | Impacto | Mitigación                                     |
| ----------------------------------------- | ------- | ---------------------------------------------- |
| Saldo incorrecto                          | Crítico | BalanceCalculator + financial regression tests |
| Statement no reconstruible                | Crítico | source references + reconstruction tests       |
| Source duplicado                          | Alto    | unique source + tests                          |
| Statement duplicado                       | Alto    | unique activo tenant+unit+period               |
| Snapshot inconsistente                    | Alto    | sourceHash + snapshot tests                    |
| Incluir cargo cancelado                   | Alto    | ChargeMovementReaderPort                       |
| Incluir pago reversado                    | Alto    | PaymentMovementReaderPort                      |
| Usar float                                | Alto    | Money VO + Decimal tests                       |
| Publicar statement inconsistente          | Alto    | publication policy                             |
| Regenerar sin motivo                      | Alto    | regeneration policy + audit                    |
| Cross-tenant statement                    | Crítico | tenant validation + MT tests                   |
| Usuario ve statement ajeno                | Alto    | OwnAccountStatementPolicyService               |
| Exportar sin permiso                      | Alto    | export permission + audit                      |
| Implementar mora fuera de alcance         | Medio   | SDD review                                     |
| Implementar PDF avanzado fuera de alcance | Medio   | SDD review                                     |

---

## 33. Checklist para revisión de PR

Antes de aprobar el PR de `006-account-statements`:

```text id="s5r4r0"
[ ] La implementación sigue spec.md.
[ ] No se implementó funcionalidad fuera de alcance.
[ ] No se implementó mora avanzada.
[ ] No se implementó cobranza.
[ ] No se implementó conciliación bancaria.
[ ] No se implementó facturación electrónica.
[ ] No se implementó PDF avanzado.
[ ] Prisma schema coincide con data-model.md.
[ ] Migración revisada.
[ ] SQL constraints revisadas.
[ ] No hay cascade delete peligroso.
[ ] tenantId es obligatorio en todas las tablas.
[ ] propertyUnitId es obligatorio en statements, lines, balances y snapshots.
[ ] billingPeriodId es obligatorio en AccountStatement.
[ ] Montos usan Decimal.
[ ] No hay float ni double para dinero.
[ ] Endpoints coinciden con api-contract.md.
[ ] Endpoints privados tienen AuthGuard.
[ ] Endpoints tenant tienen TenantGuard.
[ ] Endpoints financieros tienen TenantPermissionGuard.
[ ] Endpoints .own validan OwnAccountStatementPolicyService.
[ ] Queries filtran por tenantId.
[ ] Statements validan tenant.
[ ] Balances validan tenant.
[ ] Snapshots validan tenant.
[ ] Lines validan tenant.
[ ] PropertyUnit valida tenant.
[ ] BillingPeriod valida tenant.
[ ] Source references validan tenant.
[ ] Cargos cancelados no suman.
[ ] Cargos reversados no suman.
[ ] Pagos reversados no reducen.
[ ] Allocations reversadas no reducen.
[ ] Pagos no asignados se separan.
[ ] Lines tienen sourceType/sourceId cuando aplica.
[ ] No hay sources duplicados.
[ ] No hay statement activo duplicado por unidad/periodo.
[ ] sourceHash implementado.
[ ] Snapshot creado en generación.
[ ] Snapshot creado en recálculo si se solicita.
[ ] Publicación valida consistencia.
[ ] Cierre requiere motivo.
[ ] Bloqueo requiere motivo.
[ ] Regeneración requiere motivo.
[ ] Regeneración marca anterior como superseded.
[ ] No se eliminan statements publicados/cerrados/bloqueados.
[ ] Export admin requiere permiso.
[ ] Export own requiere permiso .own.
[ ] Export own no expone campos internos.
[ ] Usuario .own no ve statements ajenos.
[ ] Usuario .own no ve balances ajenos.
[ ] Usuario .own no ve movimientos ajenos.
[ ] Logs no contienen payload completo.
[ ] Logs no contienen export completo.
[ ] Logs no contienen datos personales innecesarios.
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

Al completar estas tareas, RESIDENT Core tendrá implementado el módulo de estados de cuenta:

```text id="opb9l0"
- balances por unidad;
- movimientos financieros por unidad;
- estados de cuenta por periodo;
- líneas de estado de cuenta;
- generación individual;
- generación en lote;
- publicación;
- cierre;
- bloqueo;
- regeneración;
- snapshots;
- consulta administrativa;
- consulta propia;
- exportación JSON/CSV;
- auditoría financiera;
- eventos financieros;
- pruebas financieras.
```

Este módulo habilita el inicio de specs futuras como:

```text id="n9xc2a"
009-notifications
00X-late-fees
00X-collections
00X-financial-reports
00X-bank-reconciliation
00X-n8n-automations
```

pero antes debe completarse:

```text id="na7c40"
docs/specs/006-account-statements/security-notes.md
```
