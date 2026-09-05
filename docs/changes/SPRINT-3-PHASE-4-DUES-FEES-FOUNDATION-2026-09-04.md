# Sprint 3 — Fase 4: dues-fees-foundation

## Estado

| Campo | Valor |
| --- | --- |
| Fecha | 2026-09-04 |
| Rama | `codex/sprint-3-phase-4-dues-fees-foundation` |
| Baseline | `b5b22bb` — PR #34 |
| Resultado | `PASS` |
| Manifest | `currentPhase = 4` |
| Siguiente fase | `5 — charge-lifecycle` |

## Alcance integrado

La fase incorpora exclusivamente la fundación financiera de Spec 004:

- persistencia tenant-scoped para `ChargeConcept`, `FeeSchedule`,
  `UnitFeeAssignment` y `BillingPeriod`;
- trece permisos Core y nueve acciones Audit del catálogo aprobado;
- API runtime tenant-scoped para conceptos, calendarios, asignaciones y creación/lectura
  de periodos;
- moneda `USD` derivada únicamente de `Tenant.currency`, importes `Decimal(12,2)` e
  idempotencia transversal mediante `IdempotencyOperation`;
- archivado y finalización no destructivos;
- controladores excluidos de Swagger; el artefacto OpenAPI continúa diferido a Fase 9.

No se incorporaron batches, cargos, generación, ajustes, reversos, cierre o bloqueo de
periodos, pagos, allocations, balances ni statements.

## Evidencia ejecutable

`pnpm test:dues` aplica las ocho migraciones desde PostgreSQL vacío, valida status y
drift, y ejecuta pruebas de persistencia, API, permisos, tenant isolation, moneda,
precisión, estados, idempotencia, rollback y Audit.

```text
test:dues: PASS
sprint3:boundary: PASS — phase 4 / GO
Next permitted phase: 5 — charge-lifecycle
```
