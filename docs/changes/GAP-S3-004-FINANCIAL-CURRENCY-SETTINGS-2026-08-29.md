# GAP-S3-004 — Autoridad de moneda y settings financieros

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-004` |
| Severidad | Alta |
| Estado | `CLOSED` |
| Fecha | 2026-08-29 |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Decisión de readiness | `NO_GO` |
| Fase | `0 — readiness` |

Cerrar este gap no autoriza implementación ni cambia la fase. Los documentos de Specs
004–006 permanecen en `needs-review`; Spec 025 conserva su estado `accepted` y sólo
amplía su catálogo cuando la fase correspondiente de Sprint 3 sea autorizada.

## 2. Causa raíz

Specs 004–006 fijaban `USD` como dato local mientras Spec 001 ya asignaba la moneda
operativa a `Tenant.currency`. A la vez, Spec 025 proponía un catálogo financiero amplio
sin distinguir definitions necesarias para Sprint 3, defaults seguros, consumidores o
vigencia. Eso permitía duplicar moneda y aplicar reglas financieras diferentes al mismo
tenant.

## 3. Ownership canónico

| Dato o capacidad | Owner | Regla |
| --- | --- | --- |
| Moneda operativa | Spec 001 / `Tenant.currency` | única autoridad por tenant |
| Definitions y overrides tipados | Spec 025 | `SettingDefinition` y `TenantSettingValue` existentes |
| Comportamiento de cargos | Spec 004 | consume moneda/settings; no los persiste como configuración |
| Comportamiento de pagos | Spec 005 | consume moneda/settings; no acepta autoridad del request |
| Statements y balances | Spec 006 | proyecta la moneda de fuentes canónicas |

No se crean `general.currency`, `financial.currency`, `CurrencySetting`,
`TenantConfiguration` ni otra tabla o ruta de configuración. Cada fila financiera
conserva su `currency` como snapshot de `Tenant.currency` al crear el movimiento; ese
campo demuestra consistencia histórica, pero no se convierte en una segunda autoridad.

## 4. Contrato de moneda de Sprint 3

1. `Tenant.currency` es requerido, se normaliza a ISO 4217 uppercase y nunca se toma de
   claims, body, query o headers financieros.
2. La única moneda soportada por el runtime financiero de Sprint 3 es `USD`. El default
   de creación de tenant continúa siendo `USD`.
3. Si `Tenant.currency != USD`, toda creación o mutación de cargos, pagos, allocations
   o statements falla cerrada con `UNSUPPORTED_TENANT_CURRENCY`. Las lecturas
   históricas existentes no se convierten ni reescriben.
4. Conceptos, schedules, cargos, pagos, allocations, reversos, balances y statements de
   una misma operación deben coincidir con `Tenant.currency`. Cualquier discrepancia
   produce `FINANCIAL_CURRENCY_MISMATCH` y rollback.
5. No se convierte moneda, no se consulta tipo de cambio y no se agregan valores de
   monedas diferentes.
6. `PATCH /api/v1/platform/tenants/{tenantId}` sigue siendo la única superficie que
   puede actualizar el campo. Antes del primer movimiento financiero sólo puede fijar
   un código soportado. Después de existir cualquier fuente financiera de Specs 004/005,
   el cambio se rechaza con `TENANT_CURRENCY_LOCKED`.
7. Ampliar la allowlist, convertir historia o habilitar multi-currency requiere una
   decisión posterior explícita y migración; no forma parte de Sprint 3.

## 5. Catálogo exacto de settings financieros

Sprint 3 añade exactamente cinco definitions al seed existente de Spec 025. Todas son
`BOOLEAN`, categoría `FINANCIAL`, sensibilidad `FINANCIAL_SENSITIVE`,
`isTenantOverridable = true`, `isRuntimeCritical = true`, `requiresRestart = false`,
`residentVisible = false`, estado `ACTIVE` y schema `{ "type": "boolean" }`.

| Key | Default | Consumer owner | Semántica |
| --- | ---: | --- | --- |
| `financial.paymentValidationRequired` | `true` | Spec 005 | pagos propios reportados permanecen pendientes hasta validación Core |
| `financial.receiptRequired` | `true` | Spec 005/016 | transferencia o depósito reportado exige comprobante aceptable antes de confirmar |
| `financial.partialPaymentsAllowed` | `true` | Spec 005 | permite allocations menores al pendiente del cargo |
| `financial.overpaymentsAllowed` | `false` | Spec 005/006 | permite que el pago exceda lo actualmente asignable y conserve saldo no asignado |
| `financial.autoAllocationEnabled` | `false` | Spec 005 | permite la estrategia determinista de autoallocation definida por GAP-S3-003 |

No se activa `financial.lateFeeEnabled`, policies financieras, reglas de mora,
aprobación dual, calendarios configurables, tasas, descuentos ni rounding configurable.
Los intereses/mora y `financial.billingPolicy`/`financial.paymentPolicy` permanecen
fuera porque sus modelos de policy están diferidos y el sprint no implementa esos
dominios.

## 6. Invariantes entre settings

1. Un pago propio nunca se confirma automáticamente cuando
   `financial.paymentValidationRequired = true`.
2. `financial.receiptRequired = true` se evalúa para métodos `BANK_TRANSFER` y
   `DEPOSIT`; el contrato técnico del archivo se cerrará en GAP-S3-005/008. `CASH` no
   requiere binario, pero sí referencia y auditoría conforme al contrato API posterior.
3. Si `financial.partialPaymentsAllowed = false`, una allocation debe liquidar
   totalmente el cargo destino; una operación insuficiente falla sin cambios.
4. Si `financial.overpaymentsAllowed = false`, el importe del pago no puede exceder la
   suma asignable elegible en la operación. Si es `true`, el excedente permanece como
   `unallocatedPaymentBalance` y no reduce cargos sin allocation.
5. `financial.autoAllocationEnabled = true` sólo habilita autoallocation para pagos ya
   confirmados. Nunca confirma un pago ni amplía tenant, unidad, moneda o permiso.
6. La combinación `paymentValidationRequired = false` y
   `autoAllocationEnabled = true` está prohibida en Sprint 3 para pagos creados mediante
   `.own`; el update del segundo setting que produzca esa combinación falla cerrado.
7. Ausencia, definition inactiva, valor inválido, error de resolución o tipo distinto
   al declarado usa el default seguro sólo cuando la definition activa existe. Un error
   de persistencia o catálogo ausente en producción bloquea la mutación financiera; no
   se adivina un valor.

## 7. Seed y resolución efectiva

1. El seed es versionado, determinista e idempotente mediante `upsert` por `key`.
2. Actualiza metadata/default/schema de las cinco definitions, pero nunca crea ni
   sobrescribe `TenantSettingValue` de un tenant.
3. No se seed-ean overrides. Sin override activo, el consumidor recibe el default de la
   definition.
4. En Sprint 3 sólo existe override efectivo inmediato: `status = ACTIVE`,
   `effectiveFrom = committedAt`, `effectiveUntil = null`. Scheduling, múltiples
   versiones e historial propio de settings permanecen fuera.
5. Un cambio aplica únicamente a comandos iniciados después del commit. No recalcula,
   convierte ni altera cargos, pagos, allocations, balances o statements históricos.
6. Cada comando financiero resuelve una sola vez `Tenant.currency` y los settings que
   consume dentro de su transacción. La decisión usada queda demostrable por el estado
   fuente y Audit; no se vuelve a consultar a mitad del comando.
7. Los cambios de override usan la API y autorización existentes de Spec 025, son
   tenant-scoped y se auditan atómicamente. Permisos y metadata Audit exactos se
   cerrarán en GAP-S3-007.

## 8. Validaciones de aceptación

- no existe definition duplicada para moneda;
- tenant USD y defaults resuelven de forma determinista;
- tenant con moneda no soportada falla antes de escribir;
- cambio de moneda con historia financiera falla y no convierte datos;
- seed repetido conserva un único registro por key y no toca overrides;
- override de otro tenant no afecta al consumidor;
- setting inválido o catálogo ausente falla cerrado;
- cambios sólo afectan operaciones posteriores;
- combinaciones inseguras de validación/autoallocation son rechazadas;
- todos los movimientos conservan la moneda del tenant sin aceptar input alternativo.

## 9. Dependencias aún abiertas

Este contrato no define lifecycle del comprobante (GAP-S3-005), superficie API
financiera (GAP-S3-006), permisos/Audit (GAP-S3-007) ni límites y seguridad de archivos
(GAP-S3-008). No modifica seed, Prisma, OpenAPI ni runtime mientras Sprint 3 continúe
`NO_GO`.

## 10. Criterio de cierre demostrado

- `Tenant.currency` queda como autoridad única;
- moneda soportada, snapshot y bloqueo de cambio quedan definidos;
- catálogo exacto, defaults, tipos, ownership y consumidores quedan fijados;
- seed y vigencia inmediata quedan definidos sin policies ni scheduling;
- discrepancias y fallos de resolución quedan fail-closed;
- readiness permanece `NO_GO`, fase 0.
