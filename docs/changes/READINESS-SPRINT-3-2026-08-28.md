# READINESS-SPRINT-3 — Residentes, propiedades y finanzas base

## 1. Información

| Campo | Valor |
| --- | --- |
| Proyecto | RESIDENT Core |
| Sprint | 3 — Residentes, propiedades y finanzas base |
| Fecha de evaluación | 2026-08-28 |
| Fecha de actualización | 2026-08-31 |
| Rama evaluada | `codex/sprint-3-formal-readiness` |
| Baseline integrado | `216bd04` — PR #29 |
| Decisión | `GO` |
| Fase actual | `0 — readiness` |
| Gaps abiertos | 0 críticos, 0 altos, 0 medios |

```text
Decision: GO
Current Phase: 0
Implementation authorized: yes; begin with Phase 1 only
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

## 8. Matriz de decisión

| Criterio | Resultado |
| --- | --- |
| Sprint 2 cerrado e integrado | Cumple |
| Siguiente incremento y frontera identificados | Cumple |
| Runbook, manifest y boundary verifier disponibles | Cumple |
| 35 documentos aplicables aprobados | Cumple |
| Ownership residents/property cerrado | Cumple |
| Contrato financiero cross-slice cerrado | Cumple |
| API, permisos, auditoría y storage cerrados | Cumple |
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

Todos los criterios de entrada están satisfechos y la evidencia reproducible autoriza
Sprint 3. La decisión `GO` conserva `currentPhase = 0`: permite iniciar posteriormente
la Fase 1, pero no implementa ni activa esa fase en esta reevaluación.

## 10. Siguiente paso recomendado

Iniciar Sprint 3 Fase 1 — `residents-properties-persistence` en una rama corta,
elevando `currentPhase` de 0 a 1 únicamente junto con sus artefactos y gate específico.
