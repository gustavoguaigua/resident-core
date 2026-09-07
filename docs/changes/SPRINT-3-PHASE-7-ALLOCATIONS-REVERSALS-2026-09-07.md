# Sprint 3 — Fase 7: allocations-reversals

## Estado

- Resultado: `PASS`
- Fecha: 2026-09-07
- Rama: `codex/sprint-3-phase-7-allocations-reversals`
- Gate: `test:allocations`
- Fase siguiente permitida: `8 — balances-statements`

## Alcance implementado

- Persistencia tenant-scoped append-only para `PaymentAllocation`,
  `PaymentAllocationReversal` y `PaymentReversal`.
- Asignación manual y automática de pagos confirmados a cargos de la misma unidad.
- Consulta administrativa de asignaciones con `payments.read`.
- Reverso único de una asignación y reverso total de pago con reverso de sus
  asignaciones activas.
- Derivación transaccional de importes y estados de `Payment` y `Charge`.
- Ledger `IdempotencyOperation`, locks deterministas y transacciones serializables.
- Permisos `payments.allocate`, `payments.reverse` y
  `payments.allocations.reverse` para `TenantAdmin` y `Treasurer`.
- Audit `paymentAllocation.created`, `paymentAllocation.reversed` y
  `payment.reversed` con metadata financiera allowlisted.

## Garantías verificadas

- `Tenant.currency` es la única autoridad y Sprint 3 acepta exclusivamente USD.
- Los importes usan `Decimal(12,2)` y las constraints rechazan valores no positivos.
- Las claves foráneas compuestas impiden relaciones cross-tenant y entre unidades.
- Los estados y saldos se calculan sólo desde asignaciones activas.
- Replay equivalente no duplica asignaciones, reversos ni Audit.
- Un fallo de dominio o Audit revierte mutación y ledger.
- La autoasignación usa `dueDate`, `issuedDate` e identificador canónico en orden
  ascendente.
- Los controladores permanecen excluidos de Swagger y el artefacto OpenAPI no cambia.
- No se incorporan balances, movimientos materializados ni estados de cuenta.

## Evidencia

- Las 11 migraciones se aplican desde una base PostgreSQL vacía.
- `prisma migrate status`: sin pendientes.
- Drift y reaplicación: sin diferencias.
- Integración de asignaciones y reversos: 9/9 pruebas.
- `test:allocations`: `PASS`.

```text
Decision: GO
Current Phase: 7
Phase 7: PASS
Next permitted phase: 8 — balances-statements
```
