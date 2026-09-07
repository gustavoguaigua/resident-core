# Sprint 3 — Fase 5: charge-lifecycle

## Estado

| Campo | Valor |
| --- | --- |
| Resultado | `PASS` |
| Fecha | 2026-09-06 |
| Rama | `codex/sprint-3-phase-5-charge-lifecycle` |
| Fase | `5 — charge-lifecycle` |
| Gate | `pnpm test:charges` |

## Alcance implementado

Se incorporaron `ChargeBatch`, `Charge`, `ChargeAdjustment` y `ChargeReversal`, con
constraints e índices tenant-scoped. El runtime expone exclusivamente las trece
operaciones autorizadas para cerrar y bloquear periodos, generar y consultar batches,
administrar cargos, ajustes y reversos, y consultar cargos propios.

Los diez permisos Core y nueve eventos Audit de Fase 5 quedaron activos con los grants
canónicos. Los controladores usan `ApiExcludeController`, por lo que el artefacto
OpenAPI sigue diferido y sin operaciones financieras nuevas.

## Atomicidad e integridad

La generación mensual reutiliza `IdempotencyOperation` y confirma autorización,
ledger, batch, cargos y Audit dentro de una única transacción PostgreSQL
`SERIALIZABLE`. Las unidades se ordenan por identificadores canónicos y se aíslan con
un `SAVEPOINT` estático. Los fallos recuperables se agregan mediante códigos estables;
los fallos de seguridad, moneda, periodo, PostgreSQL, Audit o ledger revierten todo.

Los importes son `Decimal(12,2)`, positivos y USD derivado exclusivamente de
`Tenant.currency`. `originalAmount` es inmutable, ajustes y reversos son append-only,
el importe efectivo nunca es negativo y no existe eliminación física.

## Validación

- nueve migraciones desde PostgreSQL vacío, reaplicación, status y drift: `PASS`;
- `pnpm test:charges`: `PASS`;
- Prisma format, validate y generate: `PASS`;
- tenant isolation, `.own`, permisos, idempotencia, rollback y Audit: `PASS`;
- OpenAPI sin cambios: `PASS`.

```text
Current Phase: 5
Next permitted phase: 6 — payments-receipts
```
