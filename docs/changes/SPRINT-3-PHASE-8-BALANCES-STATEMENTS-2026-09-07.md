# Sprint 3 — Fase 8 balances-statements

## Estado

```text
Phase: 8 — balances-statements
Status: PASS
Readiness: GO
Current Phase: 8
Next permitted phase: 9 — openapi-cross-slice-closure
```

## Alcance implementado

- Persistencia tenant-scoped de `AccountStatement`, `AccountStatementLine`,
  `UnitBalance` y `BalanceSnapshot`.
- Proyección `FinancialMovement` reconstruible desde cargos, ajustes, reversos,
  pagos y allocations, sin tabla o ledger financiero paralelo.
- Dieciséis operaciones runtime autorizadas, excluidas de Swagger.
- Lifecycle `GENERATED -> PUBLISHED -> CLOSED -> LOCKED` y regeneración append-only
  mediante `SUPERSEDED`, predecessor y successor.
- Balances y fingerprints reconstruibles con `Decimal(12,2)` y autoridad USD del
  tenant.
- Lectura `.own` limitada a relaciones activas y statements publicados o posteriores.
- Todos los POST usan `IdempotencyOperation` y Audit transaccional.

## Atomicidad batch

`generate-batch` aplica GAP-S3-012: una transacción PostgreSQL exterior
`SERIALIZABLE`, unidades ordenadas por ID y un savepoint estático por unidad. Los
fallos recuperables se aíslan y agregan mediante códigos sanitizados; errores de
seguridad, tenant, moneda, ledger, estructura o Audit abortan el POST completo. No hay
commit ni visibilidad parcial, y el replay devuelve el resultado final del ledger sin
reprocesar.

## Validación

- `pnpm test:statements`: PASS (5/5; migraciones, status, drift y reaplicación).
- `pnpm test:financial`: PASS (4/4; reconstrucción, Decimal, snapshots y privacidad).
- Prisma format/validate/generate: PASS.
- API lint/typecheck: PASS.
- El boundary, gates acumulativos y OpenAPI se registran en la validación final de la
  fase.

## Frontera preservada

No se añadió exportación, documentos, notificaciones, conciliación bancaria,
accounting ledger, scheduler, worker, outbox, Redis, dependencias, servicios Docker ni
funcionalidad de Fase 9.
