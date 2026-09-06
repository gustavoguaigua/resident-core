# GAP-S3-011 — Atomicidad de generación de cargos e idempotencia

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-011` |
| Severidad | Alta |
| Estado | `CLOSED` |
| Fecha | 2026-09-06 |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Decisión de readiness | `GO` |
| Fase | `4 — dues-fees-foundation; PASS` |

Este cierre es exclusivamente contractual. No implementa Prisma, migraciones,
aplicación ni pruebas runtime; tampoco modifica el manifest ni eleva `currentPhase`.
La Fase 5 permanece sin iniciar hasta que este contrato sea integrado.

## 2. Contradicción resuelta

GAP-S3-003 exigía procesar cada unidad en su propia transacción para permitir un batch
`COMPLETED_WITH_ERRORS`. GAP-S3-010 exige que ledger, mutación, efectos derivados y
Audit de cada POST se confirmen en un único commit. Con PostgreSQL y Prisma, commits
independientes por unidad no pueden revertirse atómicamente si falla el POST exterior.

La expresión «cada unidad en su propia transacción» queda normalizada como una
subtransacción PostgreSQL mediante `SAVEPOINT` dentro de una única transacción
exterior. No autoriza commits independientes.

## 3. Transacción canónica

`POST /api/v1/tenant/charges/generate-monthly` ejecuta una única transacción PostgreSQL
`SERIALIZABLE`. Dentro de ella se realizan, en este orden lógico:

1. revalidación de autenticación, autorización, tenant, identidad y membership;
2. adquisición del lock y resolución de `IdempotencyOperation`;
3. creación de `ChargeBatch` y formación del conjunto candidato;
4. procesamiento secuencial de las unidades mediante savepoints;
5. persistencia de cargos y eventos Audit `SUCCESS` de las unidades exitosas;
6. cálculo de conteos, estado final y resumen sanitizado del batch;
7. persistencia de los eventos Audit del batch;
8. transición del ledger a `COMPLETED` con el resultado final del batch;
9. confirmación de todo en un único commit.

Ningún batch, cargo, Audit o estado del ledger es visible o durable antes del commit
exterior. Un crash o rollback exterior elimina todos esos cambios, incluidos los
savepoints exitosos, y no deja un `IN_PROGRESS` persistente.

## 4. Procesamiento por unidad

Las unidades se ordenan por sus IDs canónicos y se procesan secuencialmente. Cada
iteración usa un nombre de savepoint estático y controlado por servidor:

- éxito: libera el savepoint y conserva los cambios pendientes para el commit exterior;
- fallo recuperable: revierte al savepoint, lo libera, agrega sólo un código sanitizado
  al resumen y continúa;
- fallo fatal: propaga el error y revierte la transacción exterior completa.

La implementación puede ejecutar comandos SQL estáticos `SAVEPOINT`,
`ROLLBACK TO SAVEPOINT` y `RELEASE SAVEPOINT` dentro del
`Prisma.TransactionClient`. No se permiten nombres derivados de input ni SQL dinámico.

## 5. Clasificación de resultados por unidad

Son recuperables y no abortan el POST:

- asignación o schedule que dejó de estar activo después de formar el conjunto;
- unidad que dejó de estar activa;
- cargo equivalente ya existente para la clave natural;
- conflicto de clave natural con datos financieros incompatibles;
- constraint local de la unidad que no indique corrupción estructural.

Los códigos estables autorizados para resumir estos resultados son, respectivamente:

- `ASSIGNMENT_OR_SCHEDULE_INACTIVE`;
- `PROPERTY_UNIT_INACTIVE`;
- `EQUIVALENT_CHARGE_EXISTS`;
- `CHARGE_FINANCIAL_CONFLICT`;
- `CHARGE_ITEM_CONSTRAINT_REJECTED`.

El cargo equivalente se contabiliza como `skippedItems`, no como `failedItems`. Los
otros fallos recuperables se contabilizan como `failedItems`. Sólo se captura una
violación de constraint cuya identidad y SQLSTATE estén explícitamente allowlisted;
cualquier error de base de datos no reconocido es fatal.

Son fatales para el POST completo:

- autenticación, autorización, tenant, identidad o membership inválidos;
- tenant o referencia cross-tenant;
- moneda no soportada o inconsistente;
- periodo inexistente, cerrado o bloqueado;
- ledger o lock inválido;
- fallo de cualquier escritura Audit;
- pérdida de conexión o error PostgreSQL no clasificado;
- violación estructural que impida confiar en el batch;
- fallo al finalizar el batch o el ledger.

Un fallo fatal revierte incluso las unidades procesadas con éxito antes del fallo. Un
fallo Audit nunca se degrada a error parcial.

## 6. Conteos y estado final

- `totalItems`: número de unidades candidatas.
- `successItems`: cargos nuevos creados.
- `skippedItems`: cargos equivalentes ya existentes.
- `failedItems`: unidades con fallo recuperable distinto de duplicado equivalente.
- `COMPLETED`: exige `failedItems = 0`.
- `COMPLETED_WITH_ERRORS`: exige `failedItems > 0`.
- Siempre se cumple
  `totalItems = successItems + skippedItems + failedItems`.

`COMPLETED_WITH_ERRORS` representa únicamente fallos recuperables por unidad
confirmados junto con los éxitos en el commit exterior. No representa un commit parcial
ni un fallo estructural del POST.

## 7. Unicidad, idempotencia y concurrencia

La constraint natural permanece como última defensa:

```text
(tenantId, billingPeriodId, chargeConceptId, propertyUnitId, chargeType)
```

Un cargo existente equivalente se contabiliza como `skippedItems`. Un cargo con esa
clave y datos financieros incompatibles produce `CHARGE_FINANCIAL_CONFLICT`, incrementa
`failedItems` y conduce a `COMPLETED_WITH_ERRORS`.

El ledger guarda exclusivamente el resultado final del batch y nunca persiste estado
`FAILED`. Un replay equivalente devuelve ese resultado sin reprocesar unidades ni
duplicar cargos o Audit. Un payload o actor diferente produce
`409 IDEMPOTENCY_KEY_CONFLICT`; una operación concurrente devuelve
`409 IDEMPOTENCY_OPERATION_IN_PROGRESS`.

El lock transaccional, el orden determinista, el nivel `SERIALIZABLE`, la constraint
natural y el ledger forman una única estrategia. No se permiten transacciones
independientes, commits parciales, workers, outbox, scheduler, Redis ni coordinación
externa.

## 8. Audit y privacidad

Los eventos `charge.created` de las unidades exitosas y los eventos de batch se
escriben dentro de la transacción exterior. Cualquier fallo de Audit aborta el POST
completo. Audit no registra `errorSummary`.

`errorSummary` contiene exclusivamente códigos estables agregados y sus conteos. No
contiene IDs de unidad, nombres, PII, importes, payloads, SQL, nombres de constraints,
stack traces ni detalles internos. Los logs tampoco registran claves de idempotencia,
payloads ni información financiera sensible.

## 9. Pruebas obligatorias de Fase 5

El gate `test:charges` debe demostrar:

1. batch completamente exitoso;
2. batch con fallos recuperables;
3. rollback aislado al savepoint;
4. fallo fatal que revierte todos los savepoints exitosos;
5. fallo de Audit que revierte batch, cargos y ledger;
6. crash o rollback sin `IN_PROGRESS` persistente;
7. replay equivalente sin reprocesamiento;
8. concurrencia con un único resultado;
9. duplicado equivalente contabilizado como `skippedItems`;
10. payload financiero incompatible contabilizado como fallo recuperable;
11. conteos y estado final coherentes;
12. ausencia de visibilidad parcial antes del commit;
13. `errorSummary` y logs sanitizados.

## 10. Frontera y cierre

Este GAP no crea modelos, migraciones, endpoints, permisos, eventos ni ADR; no modifica
OpenAPI, specs aceptadas, manifest o gates y no implementa Fase 5. GAP-S3-009 y
GAP-S3-010 conservan su identidad y estado.

El contrato queda cerrado porque reconcilia el aislamiento por unidad con el commit
único, define la clasificación de fallos, los conteos, la privacidad, el replay y las
pruebas reproducibles. Sprint 3 permanece `GO`, `currentPhase = 4` y no quedan gaps
críticos, altos o medios abiertos.
