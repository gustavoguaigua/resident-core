# GAP-S3-012 — Atomicidad de generación batch de estados de cuenta

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-012` |
| Severidad | Alta (`HIGH`) |
| Estado | `CLOSED` |
| Fecha | 2026-09-07 |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Decisión de readiness | `GO` |
| Fase | `7 — allocations-reversals; PASS` |

Este cierre es exclusivamente contractual. No implementa Prisma, migraciones,
aplicación, pruebas runtime ni Fase 8; tampoco modifica el manifest ni eleva
`currentPhase`. La Fase 8 permanece sin iniciar hasta integrar este contrato.

## 2. Contradicción resuelta

Spec 006 exige que `POST /api/v1/tenant/account-statements/generate-batch` maneje
errores parciales y transacciones por unidad. GAP-S3-010 exige que ledger, mutación,
efectos derivados y Audit de cada POST se confirmen en un único commit. GAP-S3-011
resuelve esa tensión sólo para `charges/generate-monthly` y no autoriza extender su
decisión por analogía.

La expresión «transacción por unidad» queda normalizada para este endpoint como una
subtransacción PostgreSQL mediante `SAVEPOINT` dentro de una única transacción
exterior. No autoriza commits independientes ni debilita GAP-S3-010.

## 3. Transacción canónica

`POST /api/v1/tenant/account-statements/generate-batch` ejecuta una única transacción
PostgreSQL `SERIALIZABLE`. Dentro de ella se realizan, en este orden lógico:

1. revalidación de autenticación, autorización, tenant, identidad y membership;
2. resolución única de `Tenant.currency` y validación tenant-scoped de
   `BillingPeriod`;
3. adquisición del lock y resolución de `IdempotencyOperation`;
4. formación y ordenamiento del conjunto candidato de unidades;
5. procesamiento secuencial de cada unidad mediante savepoint;
6. persistencia de `AccountStatement`, líneas, `BalanceSnapshot`, enlaces de
   supersession y eventos Audit `SUCCESS` aplicables;
7. cálculo de conteos y construcción del resultado final sanitizado;
8. persistencia de `accountStatement.batchGenerated`;
9. transición del ledger a `COMPLETED` con el resultado final reproducible;
10. confirmación de todo en un único commit.

Ningún statement, línea, snapshot, Audit o estado del ledger es visible o durable
antes del commit exterior. Un crash o rollback exterior elimina todos los cambios,
incluidos los savepoints exitosos, y no deja un `IN_PROGRESS` persistente. El ledger no
persiste estado `FAILED`.

## 4. Procesamiento por unidad y corte consistente

Las unidades se ordenan por sus IDs canónicos y se procesan secuencialmente. Cada
iteración usa un nombre de savepoint estático controlado por Core:

- éxito: libera el savepoint y conserva los cambios pendientes;
- statement activo equivalente: no crea mutación, se contabiliza como `skipped` y
  libera o revierte el savepoint de forma segura;
- fallo recuperable: revierte y libera el savepoint, agrega únicamente un código
  estable sanitizado y continúa;
- fallo fatal: propaga el error y revierte la transacción exterior completa.

La implementación puede ejecutar comandos SQL estáticos `SAVEPOINT`,
`ROLLBACK TO SAVEPOINT` y `RELEASE SAVEPOINT` dentro del mismo
`Prisma.TransactionClient`. No se permiten nombres derivados de input ni SQL dinámico.

Cada unidad se reconstruye exclusivamente desde las fuentes financieras canónicas de
Fases 5–7. Statement, líneas y snapshot comparten `asOfDate`, moneda, watermark y
fingerprint. Si las fuentes cambian durante el procesamiento, se aplica un retry local
acotado. Si el corte consistente sigue siendo imposible, el resultado es recuperable
sólo cuando el problema está aislado y las fuentes siguen siendo confiables. Una
inconsistencia tenant, monetaria o estructural es fatal. Nunca se persiste un snapshot
mixto ni se corrige silenciosamente un fingerprint incompatible.

## 5. Clasificación de resultados

Son recuperables por unidad:

- `PROPERTY_UNIT_INACTIVE`: la unidad candidata dejó de estar activa tras formar el
  conjunto;
- `EQUIVALENT_STATEMENT_EXISTS`: existe un statement activo equivalente y se cuenta
  como `skipped`;
- `STATEMENT_FINANCIAL_CONFLICT`: existe un statement activo con datos financieros
  incompatibles sin evidencia de corrupción estructural;
- `STATEMENT_SOURCE_CHANGED`: no se obtuvo un corte consistente después del retry
  local, pero las fuentes siguen siendo confiables;
- `STATEMENT_ITEM_CONSTRAINT_REJECTED`: constraint local explícitamente allowlisted
  que no revela corrupción estructural o tenant;
- `STATEMENT_ITEM_VALIDATION_FAILED`: validación financiera aislada a una unidad con
  fuentes confiables.

Sólo `EQUIVALENT_STATEMENT_EXISTS` incrementa `skippedCount`; los demás resultados
recuperables incrementan `failedCount`. Una regeneración autorizada crea un nuevo
statement, conserva el anterior como `SUPERSEDED`, incrementa `supersededCount` y no
reescribe historia. `CLOSED` y `LOCKED` no se regeneran.

Son fatales para el POST completo:

- autenticación, autorización, identidad, membership o tenant inválidos;
- PlatformAdmin sin membership y permiso Core explícitos;
- referencia cross-tenant en el request o en cualquier fuente;
- moneda no soportada o inconsistente;
- `BillingPeriod` inexistente, cross-tenant o en estado no permitido;
- ledger, lock, request hash u `operationType` inválidos;
- fallo al adquirir, revertir o liberar un savepoint;
- fallo de cualquier escritura Audit;
- pérdida de conexión o error PostgreSQL no clasificado;
- violación estructural que impida confiar en las fuentes o el batch;
- fallo del fingerprint global, del resultado final o de la finalización del ledger;
- imposibilidad de mantener la igualdad de conteos.

Un ID explícito de unidad de otro tenant es un fallo fatal de seguridad. Nunca se
degrada a error parcial ni revela si la unidad existe. Sólo se captura una constraint
local cuya identidad y SQLSTATE estén allowlisted; todo error desconocido es fatal.

## 6. Conteos y resultado durable

- `totalUnits`: unidades candidatas validadas para procesamiento.
- `generatedCount`: statements nuevos sin supersession.
- `skippedCount`: statements activos equivalentes ya existentes.
- `failedCount`: unidades con fallo recuperable distinto de equivalencia.
- `supersededCount`: statements nuevos creados por regeneración controlada.

Cada unidad pertenece exactamente a una categoría y siempre se cumple:

```text
totalUnits = generatedCount + skippedCount + failedCount + supersededCount
```

Un fallo fatal no devuelve conteos parciales como éxito. No se crea un modelo
persistente de batch: el ledger transversal conserva exclusivamente el resultado final
completo. Un replay equivalente lo devuelve sin reconstruir candidatos, reprocesar
unidades ni duplicar statements, líneas, snapshots, supersession o Audit. Payload o
actor diferente produce `409 IDEMPOTENCY_KEY_CONFLICT`; una operación concurrente
produce `409 IDEMPOTENCY_OPERATION_IN_PROGRESS`.

## 7. Audit y privacidad

Una unidad generada registra `accountStatement.generated`. Una regeneración registra
los eventos canónicos `accountStatement.regenerated` y
`accountStatement.superseded`. El POST registra exactamente un
`accountStatement.batchGenerated`. Un resultado `skipped` y un fallo recuperable no
crean eventos alternativos. Todos los eventos se escriben dentro de la transacción
exterior y cualquier fallo de Audit aborta el POST completo.

El resultado administrativo usa únicamente DTOs allowlisted. Los fallos recuperables
se resumen mediante códigos estables agregados y conteos. Resultados, Audit y logs no
incluyen IDs de unidades fallidas, nombres, propietarios, residentes, PII, importes,
payloads, información bancaria, SQL, constraints, fingerprints, stack traces ni claves
de idempotencia raw. Audit no registra el resumen de errores. Sólo puede registrar el
hash irreversible de la clave cuando GAP-S3-007 lo autoriza.

## 8. Pruebas obligatorias de Fase 8

Los gates `test:statements` y `test:financial` deben demostrar:

1. batch completamente exitoso y batch con fallos recuperables;
2. rollback aislado al savepoint;
3. equivalencia contabilizada como `skipped`;
4. conflicto financiero contabilizado como fallo recuperable;
5. regeneración contabilizada como `superseded`;
6. igualdad exacta de conteos y orden determinista;
7. statement, líneas y snapshot de una unidad en el mismo corte;
8. cambio de fuentes con retry local acotado;
9. imposibilidad aislada de corte consistente como fallo recuperable;
10. inconsistencia tenant o monetaria como fallo fatal;
11. ID cross-tenant explícito que aborta todo el POST sin filtración;
12. fallo fatal que revierte todos los savepoints exitosos;
13. fallo Audit que revierte statements, líneas, snapshots y ledger;
14. crash o rollback sin `IN_PROGRESS` persistente;
15. replay sin reprocesamiento ni Audit duplicado;
16. conflicto por payload o actor y concurrencia con un resultado durable;
17. ninguna visibilidad parcial antes del commit;
18. resultado, Audit y logs sanitizados;
19. ausencia de commits independientes y de modelo persistente de batch.

## 9. Frontera y cierre

Este GAP no crea modelos, migraciones, aplicación, tests runtime, endpoints, permisos,
eventos ni ADR. No modifica OpenAPI, specs aceptadas, manifest, dependencias o gates y
no implementa Fase 8. GAP-S3-009, GAP-S3-010 y GAP-S3-011 conservan identidad, estado y
alcance.

El contrato queda cerrado porque reconcilia los errores parciales con el commit único,
define corte consistente, clasificación de fallos, conteos, Audit, replay, privacidad
y pruebas reproducibles. Sprint 3 permanece `GO`, `currentPhase = 7`, Fase 8 no se ha
iniciado y no quedan gaps críticos, altos o medios abiertos.
