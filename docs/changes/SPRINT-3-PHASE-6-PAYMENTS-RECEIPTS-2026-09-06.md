# Sprint 3 — Fase 6: payments-receipts

## Estado

| Campo | Valor |
| --- | --- |
| Resultado | `PASS` |
| Fecha | 2026-09-06 |
| Rama | `codex/sprint-3-phase-6-payments-receipts` |
| Fase | `6 — payments-receipts` |
| Gate | `pnpm test:payments` |

## Alcance implementado

Se incorporaron `Payment` y `PaymentReceipt` con relaciones, constraints e índices
tenant-scoped. El runtime expone exclusivamente las operaciones autorizadas para crear,
reportar, consultar, confirmar y rechazar pagos, además de cargar, recargar, revisar y
descargar comprobantes privados.

Los doce permisos Core y nueve eventos Audit de Fase 6 quedaron activos con los grants
canónicos. Los controladores están excluidos de Swagger, por lo que el artefacto OpenAPI
permanece intacto.

## Seguridad e integridad

`Tenant.currency` es la única autoridad monetaria y Sprint 3 admite exclusivamente USD.
Los importes son `Decimal(12,2)`, positivos y nunca se calculan con aritmética binaria.
La autorización exige tenant, identidad, membership y permiso Core activos; claims y
PlatformAdmin no conceden acceso implícito. Las consultas `.own` derivan las unidades
autorizadas desde las relaciones activas de la persona.

Los comprobantes reutilizan el puerto de almacenamiento seguro. Payment, PaymentReceipt,
SecureDocument, versión, archivo, Audit y finalización del ledger se confirman dentro de
la misma transacción. El replay equivalente no duplica filas, objetos ni eventos; una
recarga conserva el documento y crea una versión nueva.

## Validación

- diez migraciones desde PostgreSQL vacío, reaplicación, status y drift: `PASS`;
- PostgreSQL y MinIO efímeros, privados y con credenciales sintéticas: `PASS`;
- `pnpm test:payments`: `PASS` — 5/5;
- lifecycle, separación de funciones, `.own`, tenant isolation e idempotencia: `PASS`;
- privacidad de resultados y Audit: `PASS`;
- OpenAPI sin cambios: `PASS`.

```text
Current Phase: 6
Next permitted phase: 7 — allocations-reversals
```
