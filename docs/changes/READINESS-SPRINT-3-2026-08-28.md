# READINESS-SPRINT-3 — Residentes, propiedades y finanzas base

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Fecha de evaluación | 2026-08-28 |
| Fecha de actualización | 2026-09-08 |
| Rama evaluada | `codex/sprint-3-phase-9-api-contract-finalization` |
| Baseline integrado | `5aacda8` — PR #41 |
| Decisión | `GO` |
| Fase final | `9 — openapi-cross-slice-closure; PASS` |
| Gaps abiertos | 0 críticos, 0 altos, 0 medios |

```text
Decision: GO
Current/Final Phase: 9
Sprint 3: CLOSED / COMPLETED
Next phase within Sprint 3: none
```

## 2. Método

La compuerta contrastó la hoja de ruta, el cierre formal de Sprint 2, las siete piezas
documentales de cada Spec 003, 004, 005, 006 y 016, y únicamente las dependencias
aplicables de Specs 007/025, ADR y SDD. La evaluación inicial no ejecutó gates runtime
ni modificó los estados; GAP-S3-001 registra su aprobación posterior.

## 3. Estado heredado

- Sprint 2 está `CLOSED / COMPLETED — GO`, fase final 9.
- No existe Phase 10 de Sprint 2.
- Tenant, identidad, memberships, autorización, Audit base y Tenant Settings están
  disponibles como baseline integrado.
- La hoja de ruta identifica Sprint 3 como el siguiente incremento.

## 4. Evaluación de los 35 documentos

| Spec | Documentos evaluados | Estado | Resultado |
| --- | ---: | --- | --- |
| 003 Residents and Properties | 7/7 | `accepted` | aprobado por GAP-S3-001 |
| 004 Dues and Fees | 7/7 | `accepted` | aprobado por GAP-S3-001 |
| 005 Payments | 7/7 | `accepted` | aprobado por GAP-S3-001 |
| 006 Account Statements | 7/7 | `accepted` | aprobado por GAP-S3-001 |
| 016 Secure Document Storage | 7/7 | `accepted` | aprobado por GAP-S3-001 |

Para cada spec se comprobaron `spec.md`, `plan.md`, `tasks.md`, `api-contract.md`,
`data-model.md`, `security-notes.md` y `test-plan.md`. Total: 35/35 presentes,
0/35 `needs-review`, 35/35 `accepted`.

## 5. Registro de gaps

### GAP-S3-001 — Estado documental no aprobatorio

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | `closed` |
| Evidencia | `docs/changes/GAP-S3-001-DOCUMENT-APPROVAL-2026-08-30.md`; 35/35 documentos aplicables están `accepted` |
| Criterio de cierre | Cumplido: GAP-S3-002 a GAP-S3-008 cerrados, coherencia verificada y exactamente 35 documentos normalizados a `accepted` |

### GAP-S3-002 — Modelo canónico de residentes y propiedades

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | `closed` |
| Evidencia | Spec 003 mantiene preguntas sobre identificación, ownership, residencia, arrendamiento, menores y edición `.own`; su data model vuelve a declarar extensiones de `Tenant` y `UserProfile` |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-002-RESIDENTS-PROPERTIES-OWNERSHIP-2026-08-29.md`: slice exacto de seis modelos, ownership único, invariantes tenant, relaciones, estados y `.own` fail-closed |

### GAP-S3-003 — Semántica financiera cross-slice

| Campo | Valor |
| --- | --- |
| Severidad | Crítica |
| Estado | `closed` |
| Evidencia | Specs 004–006 dejan abiertas transiciones, cancelación versus reverso, asignación, créditos, cierre/regeneración y concurrencia |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-003-FINANCIAL-CROSS-SLICE-SEMANTICS-2026-08-29.md`: ownership, movimientos, estados, Decimal, locks, idempotencia, atomicidad y reconstrucción fijados |

### GAP-S3-004 — Moneda y settings financieros

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | `closed` |
| Evidencia | Specs 004–006 fijan USD mientras `Tenant.currency` es canónico y Spec 025 propone settings financieros todavía no activados |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-004-FINANCIAL-CURRENCY-SETTINGS-2026-08-29.md`: autoridad única, USD, catálogo exacto, defaults, seed, vigencia y fail-closed fijados |

### GAP-S3-005 — Frontera circular entre Payments y Secure Document Storage

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | `closed` |
| Evidencia | Spec 005 necesita comprobantes privados y Spec 016 declara dependencia de Payments; no existe contrato cerrado para metadata, binario y referencia |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-005-PAYMENTS-DOCUMENT-STORAGE-BOUNDARY-2026-08-29.md`: ownership, bootstrap, puertos, lifecycle, objetos huérfanos, compensación y consistencia DB/object storage fijados |

### GAP-S3-006 — Superficie API e idempotencia no acotadas al sprint

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | `closed` |
| Evidencia | Los contratos proponen superficies amplias y alternativas 409/idempotente sin una decisión única; no existe allowlist OpenAPI de Sprint 3 |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-006-API-IDEMPOTENCY-BOUNDARY-2026-08-29.md`: operaciones por fase, DTOs, errores, permisos, `X-Tenant-Id`, idempotencia y exclusiones fijados |

### GAP-S3-007 — Catálogo de permisos y auditoría de Sprint 3 ausente

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | `closed` |
| Evidencia | Audit base sólo contiene el catálogo de Sprint 2; las specs nuevas proponen nombres y payloads no normalizados |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-007-PERMISSIONS-AUDIT-CATALOG-2026-08-30.md`: permisos, asignaciones por rol, separación de funciones, recursos, acciones Audit, actores, metadata y atomicidad fijados sin habilitar consultas/exportaciones |

### GAP-S3-008 — Política operativa y de seguridad de archivos incompleta

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | `closed` |
| Evidencia | Spec 016 deja abiertos tamaño, MIME, categorías, scan status, retención, cifrado y proveedor no local; también referencia módulos futuros |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-008-FILE-SECURITY-OPERATING-POLICY-2026-08-30.md`: categoría única, límites/MIME, validación, scan status, cuarentena, provider/cifrado, acceso, retención y gates fijados sin añadir infraestructura |

### GAP-S3-009 — Estado de roadmap desalineado

| Campo | Valor |
| --- | --- |
| Severidad | Media |
| Estado | `closed` |
| Evidencia | README e índice cerraban Sprint 2 pero no registraban la compuerta de Sprint 3; metadata histórica del Blueprint conserva referencias antiguas |
| Criterio de cierre | Cumplido en esta compuerta: README, Blueprint e índice registran Sprint 3 `NO_GO`, fase 0 y sus fuentes canónicas |

### GAP-S3-010 — Ownership y persistencia del ledger de idempotencia

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | `closed` |
| Evidencia | GAP-S3-003/006 fijaban efectos externos, pero no existían ownership, modelo persistente, seguridad, replay, recuperación ni retención reproducibles |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-010-IDEMPOTENCY-LEDGER-CONTRACT-2026-09-02.md`: owner transversal, modelo, hashing, autorización, lock, atomicidad, replay, rollback, privacidad, retención y pruebas fijados |

### GAP-S3-011 — Atomicidad de generación de cargos e idempotencia

| Campo | Valor |
| --- | --- |
| Severidad | Alta |
| Estado | `closed` |
| Evidencia | GAP-S3-003 exigía una transacción por unidad mientras GAP-S3-010 exigía que ledger, mutación, efectos derivados y Audit del POST se confirmaran en un único commit |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-011-CHARGE-GENERATION-ATOMICITY-2026-09-06.md`: una transacción exterior `SERIALIZABLE`, savepoint por unidad, clasificación de fallos, conteos, replay, privacidad y pruebas fijados sin commits parciales |

### GAP-S3-012 — Atomicidad de generación batch de estados de cuenta

| Campo | Valor |
| --- | --- |
| Severidad | Alta (`HIGH`) |
| Estado | `CLOSED` |
| Evidencia | Spec 006 exige errores parciales y transacción por unidad para `account-statements/generate-batch`, mientras GAP-S3-010 exige un único commit de ledger, dominio, derivados y Audit; GAP-S3-011 sólo especializa generación de cargos |
| Criterio de cierre | Cumplido en `docs/changes/GAP-S3-012-STATEMENT-BATCH-ATOMICITY-2026-09-07.md`: una transacción exterior `SERIALIZABLE`, savepoint estático por unidad, corte consistente, clasificación de fallos, conteos, replay, privacidad y pruebas fijados sin commits parciales |

## 6. Ownership canónico

| Capacidad | Owner |
| --- | --- |
| Tenant, timezone y currency | Spec 001 / `Tenant` |
| Identidad, memberships, roles y permisos persistidos | Spec 002 |
| Personas, unidades y relaciones residenciales | Spec 003 |
| Conceptos, periodos, cargos, ajustes y reversos de cargo | Spec 004 |
| Pagos, validación, asignaciones y reversos de pago | Spec 005 |
| Saldos materializados y estados de cuenta reconstruibles | Spec 006 |
| Auditoría durable y sanitización | Spec 007 / Audit base |
| Binarios, hashes, metadata y acceso técnico documental | Spec 016 |
| Definitions y overrides tipados | Spec 025 |
| Ledger de idempotencia | Platform API / GAP-S3-010 |

El ownership queda aprobado por los contratos cerrados, pero no autoriza definiciones
paralelas ni cambios al baseline de Sprint 2.

## 7. Frontera y fases

La frontera canónica está en
`docs/implementation/sprint-3-residents-properties-finance-base.md`. El manifest
`packages/testing/config/sprint-3-gates.json` define exactamente fases 0–9,
`readinessDecision = GO` y `currentPhase = 0`. No existe fase 10.

El verificador rechaza en fase 0 modelos Prisma, rutas OpenAPI y módulos runtime de
Sprint 3, inventaría los 35 documentos y exige correspondencia entre readiness y
manifest.

## 8. Matriz de decisión formal de readiness (snapshot de fase 0)

| Criterio | Resultado |
| --- | --- |
| Sprint 2 cerrado e integrado | Cumple |
| Siguiente incremento y frontera identificados | Cumple |
| Runbook, manifest y boundary verifier disponibles | Cumple |
| 35 documentos aplicables aprobados | Cumple |
| Ownership residents/property cerrado | Cumple |
| Contrato financiero cross-slice cerrado | Cumple |
| API, permisos, auditoría y storage cerrados | Cumple |
| Ledger persistente de idempotencia cerrado | Cumple |
| Cero gaps críticos/altos abiertos | Cumple |

## 9. Reevaluación formal

| Evidencia | Resultado |
| --- | --- |
| Baseline integrado | `216bd04`; PR #29 con Required CI gates `PASS` |
| Documentación aplicable | 35/35 `accepted`; 0 `needs-review` |
| Gaps de readiness | 0 críticos, 0 altos, 0 medios abiertos |
| Manifest | fase `0`; exactamente fases `0`–`9`; sin fase `10` |
| Frontera previa | `sprint3:boundary` `PASS` en fase 0 |
| Pruebas de frontera | 4/4 `PASS` |
| Prisma, OpenAPI y runtime | Sin artefactos prematuros de Sprint 3 |

```text
Decision: GO
Current Phase: 0
Critical gaps open: 0
High gaps open: 0
Medium gaps open: 0
Implementation authorized: yes; begin with Phase 1 only
```

Este bloque conserva la evidencia histórica de la reevaluación que autorizó Sprint 3.
La progresión posterior se registra en la sección siguiente y mantiene vigente la
decisión `GO`.

## 10. Progreso de implementación

La Fase 1 incorporó exclusivamente los seis modelos persistentes aprobados de Spec 003,
su migración tenant-safe y el gate `test:residents:persistence`. El gate aplicó las
cinco migraciones desde PostgreSQL vacío, confirmó ausencia de drift, constraints,
aislamiento tenant y segunda aplicación sin pendientes.

```text
Current Phase: 1
Phase 1: PASS
Next permitted phase: 2 — residents-properties-api
```

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-1-RESIDENTS-PROPERTIES-PERSISTENCE-2026-08-31.md`.

La implementación de Fase 2 detectó antes de editar que faltaba el contrato persistente
del ledger. GAP-S3-010 lo cerró sin runtime, mantuvo `currentPhase = 1` y autorizó que
Fase 2 incorpore el componente transversal en el mismo cambio que sus API y gates.

La Fase 2 incorporó la allowlist tenant-scoped de Spec 003, permisos Core, lecturas
`.own`, validación `link-user`, Audit sanitizado y el ledger transversal de GAP-S3-010.
Los gates focalizados y acumulativos aplicaron seis migraciones desde PostgreSQL vacío,
confirmaron status y drift limpios, y probaron funcionalidad, aislamiento, autorización,
idempotencia, atomicidad y rollback.

```text
Current Phase: 2
Phase 2: PASS
Next permitted phase: 3 — secure-document-storage
```

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-2-RESIDENTS-PROPERTIES-API-2026-09-03.md`.

La Fase 3 incorporó la persistencia documental tenant-scoped, el puerto interno de
storage y el adapter S3-compatible para MinIO, limitados a comprobantes privados de
Payments. El gate aplicó siete migraciones desde PostgreSQL vacío y demostró validación
de archivos, privacidad, autorización delegada, idempotencia, compensación y
reconciliación tenant-aware con storage privado.

```text
Current Phase: 3
Phase 3: PASS
Next permitted phase: 4 — dues-fees-foundation
```

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-3-SECURE-DOCUMENT-STORAGE-2026-09-04.md`.

La Fase 4 incorporó conceptos, calendarios de cuotas, asignaciones por unidad y
periodos abiertos con moneda derivada de `Tenant.currency`, precisión Decimal,
permisos Core, idempotencia y Audit transaccional. El gate aplicó ocho migraciones
desde PostgreSQL vacío y confirmó constraints tenant-scoped, drift cero, operaciones
permitidas y negativos de seguridad.

```text
Current Phase: 4
Phase 4: PASS
Phase 5: blocked until GAP-S3-011 is integrated
Next permitted phase after integration: 5 — charge-lifecycle
```

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-4-DUES-FEES-FOUNDATION-2026-09-04.md`.

GAP-S3-011 cerró la contradicción entre el procesamiento aislado por unidad y el commit
único del POST. Su cierre documental no implementó runtime ni elevó `currentPhase`;
después de integrarlo quedó habilitada la implementación de Fase 5.

La Fase 5 incorporó el lifecycle de periodos, generación mensual, batches, cargos,
ajustes y reversos con moneda USD, precisión Decimal y aislamiento tenant. La
generación confirma ledger, batch, cargos y Audit en una transacción `SERIALIZABLE`,
con `SAVEPOINT` estático por unidad conforme a GAP-S3-011.

```text
Current Phase: 5
Phase 5: PASS
Next permitted phase: 6 — payments-receipts
```

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-5-CHARGE-LIFECYCLE-2026-09-06.md`.

La Fase 6 incorporó pagos tenant-scoped, reporte propio, validación administrativa y
comprobantes privados versionados mediante el puerto de almacenamiento seguro. Las
mutaciones reutilizan el ledger PostgreSQL y confirman Payment, PaymentReceipt,
SecureDocument y Audit de forma atómica.

```text
Current Phase: 6
Phase 6: PASS
Next permitted phase: 7 — allocations-reversals
```

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-6-PAYMENTS-RECEIPTS-2026-09-06.md`.

La Fase 7 incorporó asignaciones manuales y automáticas tenant-scoped, saldos derivados
de pagos y cargos, reversos append-only y autorización Core exacta. Todas las mutaciones
reutilizan el ledger PostgreSQL y confirman dominio y Audit en un único commit.

```text
Current Phase: 7
Phase 7: PASS
Next permitted phase: 8 — balances-statements
```

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-7-ALLOCATIONS-REVERSALS-2026-09-07.md`.

GAP-S3-012 cerró la contradicción entre los errores parciales por unidad de Spec 006 y
el commit único exigido por GAP-S3-010 para la generación batch de statements. Su
cierre documental no implementó runtime ni elevó `currentPhase`; después de integrarlo
queda habilitada la implementación de Fase 8.

```text
Current Phase: 7
Phase 8: blocked until GAP-S3-012 is integrated
Next permitted phase after integration: 8 — balances-statements
```

GAP-S3-012 quedó integrado y la Fase 8 incorporó la proyección reconstruible de
movimientos financieros, balances y snapshots tenant-scoped, además del lifecycle de
statements y generación batch con transacción exterior `SERIALIZABLE` y savepoints
estáticos. `test:statements` y `test:financial` validan migraciones, cálculos Decimal,
idempotencia, aislamiento y Audit sin publicar OpenAPI.

```text
Current Phase: 8
Phase 8: PASS
Next permitted phase: 9 — openapi-cross-slice-closure
```

La Fase 9 publicó y validó el contrato OpenAPI acumulado de las Fases 1–8 sin añadir
operaciones runtime. Los gates API, integración, stack y OpenAPI completaron el cierre
cross-slice, y el boundary exige exactamente la allowlist canónica de GAP-S3-006.

```text
Current/Final Phase: 9
Phase 9: PASS
Sprint 3: CLOSED / COMPLETED
Next phase within Sprint 3: none
```

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-9-OPENAPI-CROSS-SLICE-CLOSURE-2026-09-08.md`.

La evidencia detallada está en
`docs/changes/SPRINT-3-PHASE-8-BALANCES-STATEMENTS-2026-09-07.md`.
