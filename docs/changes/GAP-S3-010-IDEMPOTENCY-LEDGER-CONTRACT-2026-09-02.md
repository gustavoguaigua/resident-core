# GAP-S3-010 — Contrato del ledger de idempotencia

## 1. Estado

| Campo | Valor |
| --- | --- |
| Gap | `GAP-S3-010` |
| Severidad | Alta |
| Estado | `CLOSED` |
| Fecha | 2026-09-02 |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Decisión de readiness | `GO` |
| Fase | `1 — residents-properties-persistence; PASS` |

Este cierre no implementa runtime ni eleva `currentPhase`. Autoriza a Fase 2 a
incorporar el ledger transversal junto con sus artefactos y gates; ninguna fase
posterior queda autorizada por este documento.

## 2. Causa raíz

GAP-S3-003 y GAP-S3-006 fijaron los efectos externos de `Idempotency-Key`, pero no
definieron ownership, persistencia, seguridad, canonicalización, concurrencia, replay,
recuperación ni retención. Una solución en memoria, Redis o Audit no podía demostrar
resultado único y durable desde múltiples instancias ni atomicidad con dominio y Audit.

## 3. Ownership y frontera

- El ledger es infraestructura transversal de la plataforma API; no pertenece a Spec
  003 ni a un dominio financiero.
- PostgreSQL mediante Prisma es la única autoridad. Memoria local, cache, Redis y
  `AuditLog` no sustituyen el ledger.
- Todos los `POST` y `PATCH` de la allowlist de Sprint 3 reutilizan el mismo puerto de
  aplicación y adaptador persistente. `GET` no usa ledger.
- El ledger no expone API pública, tenant, platform ni administrativa.
- Fase 2 puede añadir el modelo, enum y migración descritos aquí sin modificar los seis
  modelos de dominio de Spec 003 ni autorizar endpoints adicionales.

No se requiere ADR nuevo: este contrato aplica PostgreSQL, Prisma, transacciones ACID,
monolito modular y multitenancy ya aprobados.

## 4. Contrato persistente

El modelo canónico es `IdempotencyOperation`, con tabla tenant-scoped y enum
`IdempotencyOperationStatus = IN_PROGRESS | COMPLETED`.

| Campo | Contrato |
| --- | --- |
| `id` | UUID generado por Core, primary key |
| `tenantId` | UUID obligatorio; FK restrictiva a `Tenant` |
| `operationType` | código estable y allowlisted definido por el servidor |
| `keyHash` | SHA-256 hexadecimal de la clave validada |
| `requestHash` | SHA-256 hexadecimal del request canónico |
| `actorUserProfileId` | UUID obligatorio; FK restrictiva al actor Core |
| `status` | `IN_PROGRESS` o `COMPLETED` |
| `httpStatus` | null en progreso; status original al completar |
| `responseBody` | null en progreso; envelope allowlisted original al completar |
| `resourceType` / `resourceId` | referencia estable opcional al resultado |
| `createdAt` | timestamp de creación controlado por Core |
| `completedAt` | null en progreso; timestamp obligatorio al completar |
| `expiresAt` | expiración lógica, 24 horas después de `completedAt` |

La tabla exige unique `(tenantId, operationType, keyHash)` e índices para
`(tenantId, status)` y `expiresAt`. Constraints PostgreSQL preservan que
`IN_PROGRESS` no tenga resultado y que `COMPLETED` tenga `httpStatus`, `responseBody`,
`completedAt` y `expiresAt`. No existe estado `FAILED`.

La clave y el payload originales nunca se persisten. Los hashes son strings
hexadecimales lowercase de 64 caracteres. Las relaciones inversas que Prisma requiera
en `Tenant` y `UserProfile` no transfieren ownership de esos modelos.

## 5. Clave y canonicalización

`Idempotency-Key` debe cumplir
`^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$`: entre 16 y 128 caracteres ASCII seguros.
Ausencia, valor múltiple o formato inválido produce `400 IDEMPOTENCY_KEY_REQUIRED`.

`operationType` es una constante del handler asociada a una operación de GAP-S3-006;
nunca procede del cliente. El request hash se calcula después de validación y
normalización e incluye:

1. método y `operationType`;
2. parámetros de ruta canónicos;
3. body con claves ordenadas recursivamente;
4. UUID lowercase, fecha civil `YYYY-MM-DD`, timestamp UTC, enum canónico y Decimal
   normalizado como string.

Se excluyen trace/correlation IDs, Bearer token, `Idempotency-Key` y headers sin efecto
funcional. Campos desconocidos o prohibidos fallan antes de calcular el hash.

## 6. Seguridad fail-closed

Cada intento, incluido un replay, revalida antes de leer el ledger: token, perfil,
tenant, membership, permiso Core exacto, estado y ownership del recurso cuando aplique.
El servicio vuelve a validar el contexto dentro de la transacción crítica; el guard del
controlador no sustituye esa comprobación.

Claims, body, query y headers no aportan tenant, actor, permiso ni `operationType`.
Otro actor que reutilice la clave recibe `409 IDEMPOTENCY_KEY_CONFLICT` sin acceder al
resultado. El ledger y sus hashes, requests o responses no se incluyen en Audit ni en
logs. Una denegación permanece denegada aunque falle su Audit técnico.

## 7. Concurrencia, atomicidad y recuperación

La mutación usa una transacción PostgreSQL `SERIALIZABLE` y un
`pg_try_advisory_xact_lock` no bloqueante derivado establemente de
`(tenantId, operationType, keyHash)`. Una colisión de lock falla de forma segura como
`409 IDEMPOTENCY_OPERATION_IN_PROGRESS`; el unique de la tabla es la defensa durable.

Dentro del lock y la misma transacción:

1. se purgan registros `COMPLETED` expirados del tenant de forma oportunista;
2. se busca la clave por su unique tenant-scoped;
3. si no existe, se inserta `IN_PROGRESS`;
4. se ejecutan mutación, efectos derivados y Audit `SUCCESS`;
5. se guarda el resultado y se cambia a `COMPLETED`;
6. se confirma todo en un único commit.

Cualquier error revierte ledger, dominio, derivados y Audit. Un crash previo al commit
libera el lock transaccional y no deja un `IN_PROGRESS` válido o permanente. Los
reintentos por serialización son acotados y no cambian estas garantías.

## 8. Replay, conflicto y retención

- Mismo tenant, operación, actor y request hash con registro `COMPLETED` vigente:
  devuelve `httpStatus` y `responseBody` originales sin repetir dominio ni Audit.
- Request hash o actor diferente: `409 IDEMPOTENCY_KEY_CONFLICT`.
- Lock ocupado o registro `IN_PROGRESS`: `409 IDEMPOTENCY_OPERATION_IN_PROGRESS`.
- Otro tenant usa un namespace independiente y no observa la existencia del registro.
- Tras 24 horas desde `completedAt`, el resultado no puede reproducirse. Bajo el mismo
  lock se elimina el registro expirado y la clave puede iniciar una operación nueva.

`responseBody` conserva únicamente el envelope entregado y hereda su clasificación de
datos. Nunca contiene headers, tokens, secretos, SQL, stack traces ni campos fuera del
DTO. Sólo se lee después de reautorización completa. La purga es oportunista,
tenant-scoped y no introduce scheduler, outbox ni infraestructura adicional.

## 9. Pruebas obligatorias de Fase 2

Los gates de Fase 2 deben demostrar:

- clave ausente, múltiple o inválida;
- primer uso y replay equivalente;
- payload distinto y actor distinto;
- namespace independiente entre tenants;
- operación concurrente;
- rollback por fallo de dominio y por fallo de Audit;
- exactamente una mutación y un conjunto de eventos Audit;
- crash/rollback sin `IN_PROGRESS` persistente;
- expiración, purga oportunista y reutilización;
- ausencia de clave/payload originales en DB y de ledger/responses en logs.

## 10. Criterio de cierre demostrado

- ownership transversal único y consumidores fijados;
- modelo, enum, campos, constraints e índices autorizados;
- clave, canonicalización y hashing reproducibles;
- autorización previa a todo lookup/replay y aislamiento tenant/actor fail-closed;
- lock, transacción, replay, rollback y recuperación definidos;
- privacidad y retención de 24 horas cerradas sin infraestructura nueva;
- pruebas obligatorias y frontera de Fase 2 explícitas;
- Sprint 3 permanece `GO`, `currentPhase = 1` y cero gaps abiertos.
