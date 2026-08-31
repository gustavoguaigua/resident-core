# GAP-S3-003 — Semántica financiera cross-slice

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-003` |
| Severidad | Crítica |
| Estado | `CLOSED` |
| Fecha | 2026-08-29 |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Decisión de readiness | `NO_GO` |
| Fase | `0 — readiness` |

Este cierre no autoriza implementación ni cambia la fase. Los documentos de Specs
004, 005 y 006 permanecen en `needs-review` hasta cerrar sus demás blockers y ejecutar
GAP-S3-001.

## 2. Causa raíz

Specs 004–006 definían las entidades principales, pero conservaban alternativas para
cancelación y reverso, estados derivados, tratamiento de pagos no asignados,
regeneración de statements e idempotencia. Tampoco existía un único contrato para
serializar allocations y reversos concurrentes. Esto permitía calcular saldos distintos
a partir de los mismos datos.

## 3. Ownership y fuentes de verdad

| Slice | Owner | Fuente de verdad |
| --- | --- | --- |
| Obligaciones | Spec 004 | `Charge`, `ChargeAdjustment`, `ChargeReversal` |
| Ingresos y aplicación | Spec 005 | `Payment`, `PaymentAllocation`, `PaymentAllocationReversal`, `PaymentReversal` |
| Consulta financiera | Spec 006 | proyecciones reconstruibles, statements y snapshots |

`Charge.originalAmount` y `Payment.amount` son inmutables. Los ajustes y reversos son
registros append-only; no corrigen importes históricos en sitio. `UnitBalance`,
`AccountStatement`, sus líneas y snapshots son read models: nunca sustituyen a las
fuentes de Specs 004/005 ni se aceptan como entrada para recalcularlas.

La unidad financiera es `PropertyUnit` de Spec 003. Todos los movimientos y
proyecciones incluyen `tenantId`, `propertyUnitId` y una moneda compatible; cualquier
discrepancia de tenant, unidad o moneda falla cerrada. GAP-S3-004 determinará la
autoridad operativa de moneda y settings sin cambiar esta semántica.

## 4. Precisión monetaria

1. Los importes persistentes usan Prisma `Decimal` y PostgreSQL `DECIMAL(12,2)`.
2. No se admiten `float`, `double` ni `number` de JavaScript en cálculos monetarios.
3. Los requests monetarios admiten como máximo dos decimales y deben convertirse desde
   string decimal; no se redondea silenciosamente un importe introducido por el actor.
4. Cálculos de porcentajes pueden usar `DECIMAL(5,2)` para la tasa y precisión interna
   mayor, pero el importe emitido se cuantiza una vez a dos decimales mediante
   `ROUND_HALF_UP`. Ese importe queda inmutable.
5. Los importes fuente son mayores que cero. La dirección contable se expresa por el
   tipo de movimiento, nunca mediante importes negativos.
6. No se agregan movimientos de monedas distintas. La inconsistencia produce `DENY` o
   conflicto de dominio hasta cerrar GAP-S3-004.

## 5. Catálogo efectivo de movimientos

| Movimiento fuente | Efecto | Regla |
| --- | ---: | --- |
| `Charge` emitido | débito | `originalAmount` |
| `ChargeAdjustment` increase/surcharge | débito | importe positivo |
| `ChargeAdjustment` decrease/discount | crédito | importe positivo; no deja el cargo bajo cero |
| `ChargeReversal` | crédito | compensa exactamente el `effectiveAmount` vigente del cargo |
| `PaymentAllocation` activa | crédito | reduce exclusivamente el cargo destino |
| `PaymentAllocationReversal` | débito | compensa exactamente una allocation activa |

`PaymentReversal` es el encabezado causal del reverso y no añade un segundo efecto al
saldo: su efecto proviene de los `PaymentAllocationReversal` creados en la misma
transacción. Confirmar un pago no reduce una obligación hasta que exista una allocation
activa. Un pago confirmado no asignado se conserva separadamente como
`unallocatedPaymentBalance`; no se autoaplica ni se duplica como `creditBalance`.

No existen en Sprint 3 notas de crédito independientes, intereses de mora, descuentos
globales, opening balances manuales ni accounting ledger. Toda corrección autorizada
usa un movimiento del catálogo anterior. El tipo ambiguo `CORRECTION` queda fuera: el
actor debe escoger explícitamente `INCREASE` o `DECREASE`.

## 6. Cargos y periodos

### 6.1 Lifecycle

- `BillingPeriod`: `OPEN -> CLOSED -> LOCKED -> ARCHIVED`; no se reabre en Sprint 3.
- `ChargeBatch`: `DRAFT -> PROCESSING -> COMPLETED | COMPLETED_WITH_ERRORS`; `DRAFT ->
  CANCELLED`; un batch completado no se cancela ni reversa como conjunto.
- `Charge`: `DRAFT -> ISSUED | CANCELLED`; después de emitir, el settlement status se
  recalcula entre `ISSUED`, `PARTIALLY_PAID` y `PAID`; cualquiera de esos tres puede
  pasar a `REVERSED` mediante reverso formal.

`PARTIALLY_PAID` y `PAID` son estados derivados del total de allocations activas. Al
reversar una allocation se recalculan dentro de la transacción. `CANCELLED` sólo aplica
antes de emitir y no produce movimiento. Una vez emitido, un cargo se corrige mediante
ajuste o reverso, nunca mediante cancelación. Disputas y archivado operativo de cargos
quedan fuera del lifecycle financiero de Sprint 3 y no pueden alterar el saldo.

### 6.2 Importe efectivo

```text
effectiveAmount = originalAmount
  + adjustmentsDebit
  - adjustmentsCredit
```

`effectiveAmount >= 0`. No se ajusta un cargo `CANCELLED` o `REVERSED`. El reverso es
único por cargo, exige motivo y compensa el importe efectivo completo. Un cargo pagado
puede reversarse sólo después de reversar atómicamente sus allocations activas o como
parte de la misma operación autorizada.

Cerrar un periodo impide nuevos cargos ordinarios y backdating a ese periodo. Bloquear
impide además ajustes ordinarios. Una corrección autorizada posterior se registra con
su fecha efectiva en el periodo abierto actual y no reescribe el periodo cerrado.

### 6.3 Generación e idempotencia

La clave natural de generación es:

```text
(tenantId, billingPeriodId, chargeConceptId, propertyUnitId, chargeType)
```

Existe como constraint única. Un retry equivalente devuelve el cargo existente; un
payload financiero distinto para la misma clave produce conflicto. Cada unidad se
procesa en su propia transacción: un batch puede terminar
`COMPLETED_WITH_ERRORS`, pero nunca deja un cargo parcial. Reintentar el batch procesa
sólo elementos ausentes o equivalentes.

## 7. Pagos, allocations y reversos

### 7.1 Lifecycle de pago

- Pago propio reportado: `REPORTED -> PENDING_VALIDATION -> CONFIRMED | REJECTED`.
- Pago administrativo: `DRAFT -> CONFIRMED | CANCELLED`, sin omitir autorización.
- Pago confirmado: el estado se recalcula entre `CONFIRMED`, `PARTIALLY_ALLOCATED` y
  `ALLOCATED` según la suma activa.
- `CONFIRMED | PARTIALLY_ALLOCATED | ALLOCATED -> REVERSED` mediante reverso formal.

`REJECTED`, `CANCELLED` y `REVERSED` son terminales. Cancelar sólo aplica antes de la
confirmación y sin allocations; después de confirmar se usa reverso. Rechazar sólo
aplica a un pago pendiente de validación. `CONFIRMED`, `PARTIALLY_ALLOCATED` y
`ALLOCATED` son derivados de allocations activas.

### 7.2 Allocation

Una allocation:

- pertenece al mismo tenant, unidad y moneda que pago y cargo;
- requiere pago confirmado y cargo no cancelado/reversado;
- tiene importe positivo;
- no puede exceder el importe no asignado del pago ni el pendiente efectivo del cargo;
- es inmutable después de creada;
- se revierte mediante un único `PaymentAllocationReversal` append-only.

La autoasignación, cuando sea autorizada por la superficie de GAP-S3-006, usa orden
determinista `dueDate ASC, issuedDate ASC, chargeId ASC` y sólo cargos de la misma
unidad. No existen allocations cross-unit ni roles/claims de Keycloak que sustituyan la
autorización Core.

### 7.3 Reverso de pago

Un pago sólo tiene un `PaymentReversal`. La operación bloquea el pago y sus allocations
activas, crea un `PaymentAllocationReversal` por cada una, recalcula los cargos y marca
el pago `REVERSED`, todo en una transacción. Repetir la misma operación devuelve el
resultado existente; cambiar motivo o payload con la misma clave produce conflicto.

Un statement publicado, cerrado o bloqueado nunca se reescribe. El reverso queda como
movimiento en el periodo abierto actual y puede marcar proyecciones actuales como
stale. No se exige doble aprobación en Sprint 3; el permiso exacto y cualquier control
reforzado pertenecen a GAP-S3-007.

### 7.4 Idempotencia

Crear pago, allocation o reverso requiere una clave tenant-scoped de operación. Para
una misma `(tenantId, operationType, idempotencyKey)`:

- mismo payload financiero normalizado: se devuelve el resultado original;
- payload distinto: conflicto;
- la clave nunca se comparte entre tenants ni tipos de operación.

Las referencias bancarias no sustituyen la clave de idempotencia. Su unicidad y reglas
API exactas se cerrarán en GAP-S3-006.

## 8. Concurrencia y atomicidad

Las mutaciones financieras usan transacciones PostgreSQL `SERIALIZABLE` o locks de fila
equivalentes con retry acotado ante conflicto de serialización.

1. Allocation/reverso bloquea primero `Payment` y luego los `Charge` afectados en orden
   estable por ID.
2. Los importes disponibles y pendientes se recalculan dentro del lock; nunca se confía
   en valores enviados por el cliente ni leídos antes de la transacción.
3. Constraints tenant-scoped e idempotency keys son la última defensa contra dobles
   cargos, pagos, allocations y reversos.
4. La transacción incluye movimiento fuente, estados derivados, marca `UnitBalance`
   como stale y Audit base obligatorio. Un fallo en cualquiera produce rollback.
5. La generación de statements toma un corte consistente de fuentes. Si el watermark o
   fingerprint cambia antes de persistir, aborta y reintenta; no publica un snapshot
   mixto.

No se requiere outbox ni procesamiento asíncrono en Sprint 3.

## 9. Saldos y statements reconstruibles

### 9.1 Cálculo canónico

Por cargo:

```text
chargeOutstanding = effectiveAmount - sum(active PaymentAllocation.amount)
```

Por unidad:

```text
outstandingBalance = sum(chargeOutstanding)
overdueBalance = sum(chargeOutstanding donde dueDate < asOfDate)
notDueBalance = outstandingBalance - overdueBalance
unallocatedPaymentBalance = sum(amount - active allocations de pagos confirmados)
```

Todos son no negativos. `creditBalance` no es una segunda fuente: en Sprint 3 se deriva
para presentación del mismo `unallocatedPaymentBalance` y nunca se suma con él ni
reduce cargos sin allocation. No existe saldo inicial manual; el primer periodo inicia
en cero y los siguientes derivan del corte anterior y de los movimientos fuente.

### 9.2 Statements

- `AccountStatement`: `GENERATED -> PUBLISHED -> CLOSED -> LOCKED`; `GENERATED |
  PUBLISHED -> SUPERSEDED` por regeneración controlada; `SUPERSEDED -> ARCHIVED`.
- `GENERATED` no es visible por `.own`; `PUBLISHED`, `CLOSED` y `LOCKED` sí lo son bajo
  autorización.
- Un statement es inmutable después de generarse. Regenerar crea otro, enlaza
  predecessor/successor y exige motivo.
- Sólo `GENERATED` o `PUBLISHED` se regeneran en Sprint 3. `CLOSED` y `LOCKED` no se
  regeneran; movimientos posteriores aparecen en el periodo abierto.
- Existe como máximo un statement activo por `(tenantId, propertyUnitId,
  billingPeriodId, currency)`.
- Cada línea referencia exactamente un movimiento fuente y es única por
  `(statementId, sourceType, sourceId)`. Opening/closing y notas son líneas sintéticas
  deterministas sin fingir un movimiento fuente.

`UnitBalance` es una caché reemplazable con `calculatedAt`, source watermark/fingerprint
y `isStale`. `BalanceSnapshot` es inmutable. Ambos deben reproducirse desde las fuentes
canónicas con el mismo `asOfDate`; drift produce fallo de gate, no ajuste silencioso.

## 10. Casos de aceptación obligatorios

- generación repetida y concurrente no duplica cargos;
- adjustment debit/credit y charge reversal producen el saldo exacto;
- cancelación pre-emisión no crea movimiento y post-emisión falla;
- dos allocations concurrentes no exceden pago ni cargo;
- double allocation/reversal es idempotente y no duplica efectos;
- reversar pago revierte todas sus allocations atómicamente sin doble contabilización;
- pagos no asignados permanecen separados y no reducen cargos;
- cálculo, regeneración y snapshot reproducen las fuentes con Decimal exacto;
- statements cerrados/bloqueados no se reescriben;
- fallo de Audit o constraint revierte toda la mutación;
- tenant, unidad o moneda incompatibles fallan cerrados.

## 11. Dependencias aún abiertas

Este contrato no resuelve moneda/settings (GAP-S3-004), comprobantes/storage
(GAP-S3-005/008), superficie API e idempotency headers (GAP-S3-006), ni permisos y
catálogo Audit (GAP-S3-007). No implementa Prisma, migraciones, endpoints o runtime.

## 12. Criterio de cierre demostrado

- fuente de verdad y ownership únicos;
- catálogo de movimientos sin doble contabilización;
- estados y transiciones exactos para cargos, pagos y statements;
- cancelación y reverso separados;
- precisión Decimal y cuantización fijadas;
- idempotencia, locks, concurrencia y atomicidad definidas;
- saldos, snapshots y regeneración completamente reconstruibles;
- readiness permanece `NO_GO`, fase 0.
