# Tasks — Spec 011 Fines and Sanctions

## 1. Información del documento

| Campo           | Valor                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                             |
| Spec ID         | 011                                                                                                                                                       |
| Módulo          | Fines and Sanctions                                                                                                                                       |
| Documento       | Implementation Tasks                                                                                                                                      |
| Ruta            | `docs/specs/011-fines-sanctions/tasks.md`                                                                                                                 |
| Versión         | 0.1                                                                                                                                                       |
| Estado          | needs-review                                                                                                                                              |
| Fecha           | 2026-07-19                                                                                                                                                |
| Documento base  | `docs/specs/011-fines-sanctions/spec.md`                                                                                                                  |
| Plan técnico    | `docs/specs/011-fines-sanctions/plan.md`                                                                                                                  |
| Modelo de datos | `docs/specs/011-fines-sanctions/data-model.md`                                                                                                            |
| Contrato API    | `docs/specs/011-fines-sanctions/api-contract.md`                                                                                                          |
| Plan de pruebas | `docs/specs/011-fines-sanctions/test-plan.md`                                                                                                             |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports` |

---

## 2. Propósito

Este documento convierte la spec `011-fines-sanctions` en una lista ejecutable de tareas para implementar el módulo de multas y sanciones dentro de RESIDENT Core.

El módulo debe permitir:

* crear conceptos de multa;
* configurar montos base;
* asociar conceptos financieros;
* registrar multas;
* asociar multas a unidades habitacionales;
* asociar responsable opcional;
* adjuntar evidencias;
* revisar, aprobar, rechazar y emitir multas;
* generar cargos financieros asociados de forma idempotente;
* cancelar multas;
* condonar multas;
* reversar multas;
* presentar reclamos propios;
* resolver reclamos;
* consultar multas administrativas;
* consultar multas propias;
* proteger evidencias;
* auditar operaciones críticas;
* mantener historial funcional de estados;
* impedir exposición pública en WordPress.

Regla central:

```text id="q4vbbt"
Toda multa debe ser tenant-scoped, permissioned, evidence-aware, state-controlled, own-resource protected, auditable y financieramente integrable sin procesar pagos directamente.
```

---

## 3. Convenciones de estado

Usar:

```text id="d3uo6m"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="t9c8ts"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas obligatorias de ejecución

Antes de implementar código, revisar:

```text id="vwurv2"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/decisions/ADR-003-database-strategy.md
docs/decisions/ADR-004-multitenancy-strategy.md
docs/decisions/ADR-007-authorization-strategy.md
docs/decisions/ADR-010-observability-strategy.md
docs/decisions/ADR-011-testing-strategy.md
docs/decisions/ADR-012-ci-cd-strategy.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/004-dues-fees/
docs/specs/005-payments/
docs/specs/006-account-statements/
docs/specs/007-audit/
docs/specs/008-basic-reports/
docs/specs/011-fines-sanctions/
```

Reglas de implementación:

```text id="j7jqdc"
1. Toda tabla nueva debe incluir tenant_id.
2. Toda consulta debe filtrar por tenant_id.
3. No se permite consultar una multa solo por fineId.
4. No se permite consultar evidencia solo por evidenceId.
5. No se permite consultar reclamo solo por appealId.
6. No se permite crear conceptos de multa sin tenant_id.
7. No se permite crear multas sin fineConceptId.
8. No se permite crear multas monetarias sin propertyUnitId.
9. No se permite usar propertyUnitId de otro tenant.
10. No se permite usar responsiblePersonId de otro tenant.
11. No se permite usar chargeConceptId de otro tenant.
12. No se permite usar chargeId de otro tenant.
13. No se permite usar conceptos inactivos o archivados para nuevas multas.
14. No se permite aprobar multa sin evidencia cuando el concepto la exige.
15. No se permite emitir multa no aprobada.
16. No se permite emitir multa rechazada, cancelada, condonada, reversada o archivada.
17. No se permite rechazar, cancelar, condonar o reversar sin razón.
18. No se permite reclamo sobre multa no emitida.
19. No se permite reclamo fuera de plazo cuando aplica.
20. No se permite más de un reclamo abierto por multa en MVP.
21. No se permite reclamo sobre multa ajena.
22. No se permite que un residente consulte multas de unidades ajenas.
23. No se permite que un residente consulte evidencias no autorizadas.
24. No se permite exponer evidencias mediante URLs públicas permanentes.
25. No se permite exponer fileUrl privada en listados ordinarios.
26. No se permite usar float/double para dinero.
27. Todo monto debe usar Decimal y salir por API como string.
28. No se permite generar más de un cargo por multa.
29. No se permite procesar pagos desde multas.
30. No se permite confirmar pagos desde multas.
31. No se permite asignar pagos desde multas.
32. No se permite modificar comprobantes desde multas.
33. No se permite modificar estados de cuenta desde multas.
34. No se permite modificar unit_balances directamente desde multas.
35. No se permite borrar historial.
36. No se permite eliminar físicamente multas emitidas.
37. No se permite modificar silenciosamente multas emitidas.
38. Toda transición relevante debe crear FineStatusHistory.
39. Toda operación crítica debe auditarse.
40. WordPress público no debe consultar multas.
41. WordPress público no debe consultar evidencias.
42. WordPress público no debe consultar reclamos.
43. No deben existir endpoints públicos de multas.
44. No implementar notificaciones automáticas en esta spec.
45. No implementar OCR/IA en esta spec.
46. No implementar pagos online en esta spec.
47. No implementar flujo legal avanzado en esta spec.
```

---

## 5. Entregables esperados

Documentación:

```text id="e8ykpo"
docs/specs/011-fines-sanctions/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Backend:

```text id="op1aii"
apps/api/src/modules/fines/
├── fines.module.ts
├── fine-concepts.controller.ts
├── fines.controller.ts
├── fine-evidence.controller.ts
├── fine-appeals.controller.ts
├── my-fines.controller.ts
├── my-fine-appeals.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

Base de datos:

```text id="hzszap"
fine_concepts
fines
fine_evidence
fine_appeals
fine_status_history
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text id="ri79ok"
docs/specs/011-fines-sanctions/
```

### Criterios de aceptación

* Carpeta creada.
* Sigue estructura de specs anteriores.
* No reemplaza documentos de specs `001` a `010`.

---

## TASK-002 — Registrar especificación funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="rxgc9b"
docs/specs/011-fines-sanctions/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define actores.
* Define entidades.
* Define estados.
* Define reglas de negocio.
* Define permisos.
* Define API preliminar.
* Define riesgos.
* Define criterios de aceptación.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="t6q85q"
docs/specs/011-fines-sanctions/plan.md
```

### Criterios de aceptación

* Define estructura técnica.
* Define carpetas.
* Define servicios.
* Define casos de uso.
* Define puertos.
* Define repositorios.
* Define integración financiera.
* Define evidencias.
* Define reclamos.
* Define seguridad.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="okoe2k"
docs/specs/011-fines-sanctions/data-model.md
```

### Criterios de aceptación

* Define tablas.
* Define enums.
* Define Prisma preliminar.
* Define relaciones.
* Define constraints.
* Define índices.
* Define reglas de dinero.
* Define reglas de evidencia.
* Define reglas de reclamos.
* Define idempotencia financiera.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="c2vjvk"
docs/specs/011-fines-sanctions/api-contract.md
```

### Criterios de aceptación

* Define endpoints.
* Define permisos.
* Define headers.
* Define DTOs.
* Define responses.
* Define errores.
* Define endpoints `/me`.
* Define evidencias.
* Define reclamos.
* Define OpenAPI esperado.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="ewohcj"
docs/specs/011-fines-sanctions/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define DTO tests.
* Define state machine tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define own-resource tests.
* Define multitenancy tests.
* Define financial regression tests.
* Define evidence security tests.
* Define appeal workflow tests.
* Define audit tests.
* Define OpenAPI tests.

---

## TASK-007 — Registrar tareas

**Estado:** `[ ] Pending`

### Archivo

```text id="y9exgt"
docs/specs/011-fines-sanctions/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Estados definidos.
* Criterios claros.
* Diferidos documentados.
* Definition of Done incluida.
* Checklist PR incluido.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="uihriq"
docs/specs/011-fines-sanctions/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos cross-tenant.
* Identifica riesgos de unidad ajena.
* Identifica riesgos de evidencia.
* Identifica riesgos financieros.
* Identifica riesgos de reclamos.
* Identifica riesgos de WordPress.
* Define controles de auditoría.
* Define controles de privacidad.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `fines`

**Estado:** `[ ] Pending`

### Archivo

```text id="p6sbpe"
apps/api/src/modules/fines/fines.module.ts
```

### Criterios de aceptación

* Módulo compila.
* Está registrado en `AppModule` o módulo funcional equivalente.
* Exporta providers necesarios.
* No contiene lógica de negocio.
* Respeta arquitectura modular.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="ewejby"
apps/api/src/modules/fines/
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   ├── financial/
│   ├── files/
│   └── audit/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Dominio no depende de Prisma.
* Controladores no acceden directamente a Prisma.
* Servicios no exponen detalles de infraestructura.
* Repositorios viven en infraestructura.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="f0o93x"
fine-concepts.controller.ts
fines.controller.ts
fine-evidence.controller.ts
fine-appeals.controller.ts
my-fines.controller.ts
my-fine-appeals.controller.ts
```

### Criterios de aceptación

* Controladores compilan.
* Rutas base correctas.
* No contienen lógica de negocio.
* Invocan casos de uso.
* Aplican guards/decorators según corresponda.

---

## TASK-012 — Registrar módulo en bounded context

**Estado:** `[ ] Pending`

### Contexto

```text id="t1870f"
Fines and Sanctions
```

### Criterios de aceptación

* El módulo queda alineado con `docs/sdd/domain-map.md`.
* No se mezcla con `Payments`.
* No se mezcla con `Account Statements`.
* No se mezcla con `Reservations`.

---

# 8. Fase 2 — Value Objects

## TASK-013 — Implementar `FineConceptCode`

**Estado:** `[ ] Pending`

### Archivo

```text id="vmuvjo"
domain/value-objects/fine-concept-code.vo.ts
```

### Criterios de aceptación

* Valida código no vacío.
* Permite formato `NOISE`, `PARKING-VIOLATION`.
* Rechaza slash.
* Rechaza script.
* Rechaza longitud excesiva.
* Tiene unit tests.

---

## TASK-014 — Implementar `FineConceptStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="t80urp"
domain/value-objects/fine-concept-status.vo.ts
```

### Criterios de aceptación

* Soporta `active`.
* Soporta `inactive`.
* Soporta `archived`.
* Define si permite nueva multa.
* Tiene unit tests.

---

## TASK-015 — Implementar `FineCategory`

**Estado:** `[ ] Pending`

### Archivo

```text id="ogqlti"
domain/value-objects/fine-category.vo.ts
```

### Criterios de aceptación

* Soporta `noise`.
* Soporta `parking`.
* Soporta `pets`.
* Soporta `commonArea`.
* Soporta `cleanliness`.
* Soporta `security`.
* Soporta `damage`.
* Soporta `coexistence`.
* Soporta `other`.
* Tiene unit tests.

---

## TASK-016 — Implementar `FineStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="bq88ap"
domain/value-objects/fine-status.vo.ts
```

### Criterios de aceptación

* Soporta todos los estados de `data-model.md`.
* Identifica estados terminales.
* Identifica estados editables.
* Identifica estados reclamables.
* Identifica estados financieros.
* Tiene unit tests.

---

## TASK-017 — Implementar `FineSeverity`

**Estado:** `[ ] Pending`

### Archivo

```text id="zhxu2k"
domain/value-objects/fine-severity.vo.ts
```

### Criterios de aceptación

* Soporta `low`.
* Soporta `medium`.
* Soporta `high`.
* Soporta `critical`.
* Tiene unit tests.

---

## TASK-018 — Implementar `FineMoney`

**Estado:** `[ ] Pending`

### Archivo

```text id="h2ppzd"
domain/value-objects/fine-money.vo.ts
```

### Criterios de aceptación

* Usa Decimal.
* Acepta string decimal.
* Rechaza float.
* Rechaza `NaN`.
* Rechaza montos negativos.
* Expone string.
* Valida moneda.
* Tiene unit tests.

---

## TASK-019 — Implementar `FineTitle`

**Estado:** `[ ] Pending`

### Archivo

```text id="kb6n3d"
domain/value-objects/fine-title.vo.ts
```

### Criterios de aceptación

* Valida título obligatorio.
* Rechaza texto vacío.
* Limita longitud.
* Evita payloads peligrosos.
* Tiene unit tests.

---

## TASK-020 — Implementar `FineDescription`

**Estado:** `[ ] Pending`

### Archivo

```text id="eiarbw"
domain/value-objects/fine-description.vo.ts
```

### Criterios de aceptación

* Valida descripción obligatoria.
* Rechaza texto vacío.
* Limita longitud.
* Evita payloads peligrosos.
* Tiene unit tests.

---

## TASK-021 — Implementar `FineReason`

**Estado:** `[ ] Pending`

### Archivo

```text id="zhtztx"
domain/value-objects/fine-reason.vo.ts
```

### Criterios de aceptación

* Valida razón obligatoria para rechazo.
* Valida razón obligatoria para cancelación.
* Valida razón obligatoria para condonación.
* Valida razón obligatoria para reverso.
* Valida razón obligatoria para resolución de reclamo.
* Limita longitud.
* Tiene unit tests.

---

## TASK-022 — Implementar `FineEvidenceType`

**Estado:** `[ ] Pending`

### Archivo

```text id="pqmw1i"
domain/value-objects/fine-evidence-type.vo.ts
```

### Criterios de aceptación

* Soporta `text`.
* Soporta `image`.
* Soporta `document`.
* Soporta `video`.
* Soporta `reference`.
* Soporta `other`.
* Tiene unit tests.

---

## TASK-023 — Implementar `FineEvidenceStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="i94nai"
domain/value-objects/fine-evidence-status.vo.ts
```

### Criterios de aceptación

* Soporta `active`.
* Soporta `rejected`.
* Soporta `archived`.
* Define si cuenta como evidencia activa.
* Tiene unit tests.

---

## TASK-024 — Implementar `FineAppealStatus`

**Estado:** `[ ] Pending`

### Archivo

```text id="h8m81e"
domain/value-objects/fine-appeal-status.vo.ts
```

### Criterios de aceptación

* Soporta `submitted`.
* Soporta `underReview`.
* Soporta `accepted`.
* Soporta `rejected`.
* Soporta `cancelled`.
* Soporta `archived`.
* Identifica reclamos abiertos.
* Tiene unit tests.

---

## TASK-025 — Implementar `FinePaymentStatusSnapshot`

**Estado:** `[ ] Pending`

### Archivo

```text id="dxk1fb"
domain/value-objects/fine-payment-status-snapshot.vo.ts
```

### Criterios de aceptación

* Soporta valores definidos en `data-model.md`.
* Documenta que es informativo.
* No reemplaza módulos financieros.
* Tiene unit tests.

---

# 9. Fase 3 — Entidades, eventos y errores de dominio

## TASK-026 — Implementar `FineConcept`

**Estado:** `[ ] Pending`

### Archivo

```text id="wkl3m1"
domain/entities/fine-concept.entity.ts
```

### Criterios de aceptación

* Representa concepto de multa.
* Valida tenant.
* Valida code.
* Valida name.
* Valida monto base.
* Valida configuración de reclamos.
* Determina si permite nueva multa.
* Tiene unit tests.

---

## TASK-027 — Implementar `Fine`

**Estado:** `[ ] Pending`

### Archivo

```text id="kop0mt"
domain/entities/fine.entity.ts
```

### Criterios de aceptación

* Representa multa.
* Valida tenant.
* Valida concepto.
* Valida unidad si monto > 0.
* Valida responsable opcional.
* Valida título y descripción.
* Valida estado.
* Soporta amount Decimal.
* Soporta chargeId.
* No permite modificación silenciosa de emitidas.
* Tiene unit tests.

---

## TASK-028 — Implementar `FineEvidence`

**Estado:** `[ ] Pending`

### Archivo

```text id="lb0ihg"
domain/entities/fine-evidence.entity.ts
```

### Criterios de aceptación

* Representa evidencia.
* Valida tenant.
* Valida fineId.
* Valida tipo.
* Valida archivo o referencia si aplica.
* Valida estado.
* No expone URL privada en DTO ordinario.
* Tiene unit tests.

---

## TASK-029 — Implementar `FineAppeal`

**Estado:** `[ ] Pending`

### Archivo

```text id="bs2j6t"
domain/entities/fine-appeal.entity.ts
```

### Criterios de aceptación

* Representa reclamo.
* Valida tenant.
* Valida fineId.
* Valida submittedBy.
* Valida reason.
* Valida estado.
* Valida resolución.
* Tiene unit tests.

---

## TASK-030 — Implementar `FineStatusHistory`

**Estado:** `[ ] Pending`

### Archivo

```text id="x4ii27"
domain/entities/fine-status-history.entity.ts
```

### Criterios de aceptación

* Registra `fromStatus`.
* Registra `toStatus`.
* Registra actor.
* Registra razón.
* Registra fecha.
* Sanitiza metadata.
* No contiene secretos.
* Tiene unit tests.

---

## TASK-031 — Implementar eventos de conceptos de multa

**Estado:** `[ ] Pending`

### Archivos

```text id="y967ik"
fine-concept-created.event.ts
fine-concept-updated.event.ts
fine-concept-activated.event.ts
fine-concept-deactivated.event.ts
fine-concept-archived.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen fineConceptId.
* Incluyen actorUserId.
* Incluyen traceId.
* No incluyen payload completo.
* Metadata sanitizada.

---

## TASK-032 — Implementar eventos de multas

**Estado:** `[ ] Pending`

### Archivos

```text id="r2tltl"
fine-created.event.ts
fine-updated.event.ts
fine-reported.event.ts
fine-under-review.event.ts
fine-approved.event.ts
fine-rejected.event.ts
fine-issued.event.ts
fine-disputed.event.ts
fine-appeal-accepted.event.ts
fine-appeal-rejected.event.ts
fine-waived.event.ts
fine-cancelled.event.ts
fine-reversed.event.ts
fine-archived.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen fineId.
* Incluyen propertyUnitId si aplica.
* Incluyen fromStatus/toStatus si aplica.
* Incluyen actorUserId.
* Incluyen traceId.
* Metadata sanitizada.

---

## TASK-033 — Implementar eventos financieros de multas

**Estado:** `[ ] Pending`

### Archivos

```text id="xlpy6p"
fine-charge-generated.event.ts
fine-charge-generation-failed.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen fineId.
* Incluyen chargeId si existe.
* Incluyen amount/currency como string.
* No incluyen detalles financieros excesivos.
* Metadata sanitizada.

---

## TASK-034 — Implementar eventos de evidencias

**Estado:** `[ ] Pending`

### Archivos

```text id="z44vuc"
fine-evidence-added.event.ts
fine-evidence-archived.event.ts
fine-evidence-downloaded.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen fineId.
* Incluyen evidenceId.
* Incluyen actorUserId.
* No incluyen contenido de archivo.
* No incluyen URL firmada completa en metadata.
* Metadata sanitizada.

---

## TASK-035 — Implementar eventos de reclamos

**Estado:** `[ ] Pending`

### Archivos

```text id="bjpa53"
fine-appeal-submitted.event.ts
fine-appeal-accepted.event.ts
fine-appeal-rejected.event.ts
fine-appeal-cancelled.event.ts
```

### Criterios de aceptación

* Incluyen tenantId.
* Incluyen fineId.
* Incluyen appealId.
* Incluyen actorUserId.
* Incluyen traceId.
* Metadata sanitizada.

---

## TASK-036 — Implementar errores de conceptos

**Estado:** `[ ] Pending`

### Archivos

```text id="p6yevu"
fine-concept-not-found.error.ts
fine-concept-duplicate-code.error.ts
fine-concept-inactive.error.ts
fine-concept-invalid-amount.error.ts
fine-concept-charge-concept-required.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone SQL.
* No expone stack trace.
* Tiene tests.

---

## TASK-037 — Implementar errores de multas

**Estado:** `[ ] Pending`

### Archivos

```text id="tn30hy"
fine-not-found.error.ts
fine-forbidden.error.ts
fine-invalid-transition.error.ts
fine-evidence-required.error.ts
fine-invalid-amount.error.ts
fine-unit-required.error.ts
fine-unit-forbidden.error.ts
fine-person-forbidden.error.ts
fine-cross-tenant-reference.error.ts
fine-reason-required.error.ts
```

### Criterios de aceptación

* Códigos alineados con `api-contract.md`.
* Mapeo HTTP correcto.
* Mensajes seguros.
* Tiene tests.

---

## TASK-038 — Implementar errores financieros de multas

**Estado:** `[ ] Pending`

### Archivos

```text id="wrheph"
fine-charge-concept-required.error.ts
fine-charge-already-generated.error.ts
fine-charge-generation-failed.error.ts
```

### Criterios de aceptación

* Códigos estables.
* No exponen detalles internos del módulo financiero.
* Manejan idempotencia.
* Tienen tests.

---

## TASK-039 — Implementar errores de evidencias y reclamos

**Estado:** `[ ] Pending`

### Archivos

```text id="qejjzu"
fine-evidence-not-found.error.ts
fine-evidence-forbidden.error.ts
fine-evidence-invalid-file.error.ts
fine-appeal-not-found.error.ts
fine-appeal-not-allowed.error.ts
fine-appeal-deadline-expired.error.ts
fine-appeal-already-open.error.ts
fine-appeal-invalid-status.error.ts
```

### Criterios de aceptación

* Códigos alineados con `api-contract.md`.
* Mapeo HTTP correcto.
* Mensajes seguros.
* Tienen tests.

---

# 10. Fase 4 — Base de datos y Prisma

## TASK-040 — Crear migración `011_create_fines_sanctions`

**Estado:** `[ ] Pending`

### Nombre sugerido

```text id="kaq9qv"
011_create_fines_sanctions
```

### Criterios de aceptación

* Crea enums.
* Crea `fine_concepts`.
* Crea `fines`.
* Crea `fine_evidence`.
* Crea `fine_appeals`.
* Crea `fine_status_history`.
* Crea índices.
* Crea constraints básicos.
* Ejecuta en DB test.
* No rompe specs anteriores.

---

## TASK-041 — Agregar enums Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="j1sc6a"
FineConceptStatus
FineCategory
FineStatus
FineSeverity
FineEvidenceType
FineEvidenceStatus
FineAppealStatus
FinePaymentStatusSnapshot
```

### Criterios de aceptación

* Enums definidos.
* Mapeados correctamente a valores persistidos.
* Prisma Client genera.
* Tests compilan.

---

## TASK-042 — Agregar modelo `FineConcept`

**Estado:** `[ ] Pending`

### Archivo

```text id="mx4y37"
prisma/schema.prisma
```

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con ChargeConcept.
* Unique `(tenantId, code)`.
* Índices creados.
* Campos monetarios Decimal.
* Soft archive con `archivedAt`.

---

## TASK-043 — Agregar modelo `Fine`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con FineConcept.
* Relación con PropertyUnit.
* Relación opcional con Person.
* Relaciones con UserProfile para acciones.
* Relación opcional con Charge.
* `chargeId` único.
* Campos monetarios Decimal.
* Índices creados.
* Soft archive con `archivedAt`.

---

## TASK-044 — Agregar modelo `FineEvidence`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con Fine.
* Relación opcional con UserProfile.
* Índices por tenant/fine/status/type.
* Soft archive con `archivedAt`.

---

## TASK-045 — Agregar modelo `FineAppeal`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con Fine.
* Relación con UserProfile submittedBy.
* Relación opcional con UserProfile resolvedBy.
* Índices por tenant/fine/status/submittedBy.
* Soft archive con `archivedAt`.

---

## TASK-046 — Agregar modelo `FineStatusHistory`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Modelo coincide con `data-model.md`.
* Relación con Tenant.
* Relación con Fine.
* Relación opcional con UserProfile actor.
* Índices por tenant/fine/occurredAt.
* Metadata JSON permitida.
* No requiere eliminación ordinaria.

---

## TASK-047 — Agregar relaciones en modelos existentes

**Estado:** `[ ] Pending`

### Modelos

```text id="hzt8p1"
Tenant
UserProfile
Person
PropertyUnit
ChargeConcept
Charge
```

### Criterios de aceptación

* Relaciones agregadas sin romper specs anteriores.
* Prisma Client genera.
* Tests existentes siguen pasando.

---

## TASK-048 — Agregar constraints SQL básicas

**Estado:** `[ ] Pending`

### Constraints

```text id="mdnxjk"
fine_concepts.default_amount >= 0
fine_concepts.appeal_deadline_days >= 0 si no es null
fines.amount >= 0
fine_evidence.file_size_bytes >= 0 si no es null
```

### Criterios de aceptación

* Constraints aplicadas por migración raw o Prisma si es posible.
* DB test valida constraints.
* Errores se traducen a errores de dominio/API.

---

## TASK-049 — Evaluar unique parcial para reclamo abierto

**Estado:** `[-] Deferred`

### Índice futuro recomendado

```sql id="ndslcr"
CREATE UNIQUE INDEX fine_appeals_one_open_per_fine
ON fine_appeals(fine_id)
WHERE status IN ('submitted', 'underReview')
  AND archived_at IS NULL;
```

### Razón

Puede diferirse si el MVP controla esta regla en servicio.

### Criterios futuros

* Evaluar compatibilidad con Prisma.
* Agregar migración raw si aplica.
* Agregar tests DB.
* Documentar decisión.

---

## TASK-050 — Crear seeds demo

**Estado:** `[ ] Pending`

### Seeds

```text id="fxx5v4"
fineConceptNoise
fineConceptParkingViolation
fineConceptPetControl
fineConceptCommonAreaMisuse
fineConceptDamage
fineReportedNoise
fineUnderReviewParking
fineApprovedCommonAreaMisuse
fineIssuedPetControl
fineRejectedDamage
fineWithCharge
fineEvidenceText
fineEvidenceImageReference
fineAppealSubmitted
fineAppealRejected
```

### Criterios de aceptación

* No usan datos reales.
* No usan evidencias reales.
* No usan comprobantes reales.
* No usan tokens.
* Permiten probar API.
* Permiten probar flujo completo.

---

# 11. Fase 5 — DTOs y validación

## TASK-051 — Crear DTOs de conceptos de multa

**Estado:** `[ ] Pending`

### Archivos

```text id="mfgl1h"
create-fine-concept.dto.ts
update-fine-concept.dto.ts
fine-concept.dto.ts
fine-concept-list-query.dto.ts
```

### Criterios de aceptación

* Valida code.
* Valida name.
* Valida category.
* Valida defaultAmount.
* Valida currency.
* Valida chargeConceptId.
* Valida appealDeadlineDays.
* Rechaza `tenantId` en body o lo ignora de forma segura.
* Tiene DTO tests.

---

## TASK-052 — Crear DTOs de multas administrativas

**Estado:** `[ ] Pending`

### Archivos

```text id="ez63rz"
create-fine.dto.ts
update-fine.dto.ts
fine-admin.dto.ts
fine-admin-detail.dto.ts
fine-list-query.dto.ts
submit-fine-review.dto.ts
approve-fine.dto.ts
reject-fine.dto.ts
issue-fine.dto.ts
cancel-fine.dto.ts
waive-fine.dto.ts
reverse-fine.dto.ts
archive-fine.dto.ts
```

### Criterios de aceptación

* Valida fineConceptId.
* Valida propertyUnitId.
* Valida responsiblePersonId.
* Valida title.
* Valida description.
* Valida occurredAt.
* Valida severity.
* Valida amount.
* Valida currency.
* Rechaza status manual.
* Rechaza chargeId manual.
* Rechaza paymentStatusSnapshot manual.
* Tiene DTO tests.

---

## TASK-053 — Crear DTOs de evidencias

**Estado:** `[ ] Pending`

### Archivos

```text id="lhmbtr"
add-fine-evidence.dto.ts
fine-evidence.dto.ts
fine-evidence-list-query.dto.ts
fine-evidence-download.dto.ts
archive-fine-evidence.dto.ts
```

### Criterios de aceptación

* Valida evidenceType.
* Valida title.
* Valida description.
* Valida fileUrl si aplica.
* Valida fileName si aplica.
* Valida mimeType si aplica.
* Valida fileSizeBytes si aplica.
* No expone fileUrl directa en DTO ordinario.
* Tiene DTO tests.

---

## TASK-054 — Crear DTOs de reclamos

**Estado:** `[ ] Pending`

### Archivos

```text id="oa45f9"
submit-fine-appeal.dto.ts
resolve-fine-appeal.dto.ts
fine-appeal.dto.ts
fine-appeal-list-query.dto.ts
own-fine-appeal.dto.ts
own-fine-appeal-list-query.dto.ts
```

### Criterios de aceptación

* Valida reason.
* Valida resolutionNotes.
* Valida nextFineAction.
* Valida status filters.
* Tiene DTO tests.

---

## TASK-055 — Crear DTOs de multas propias

**Estado:** `[ ] Pending`

### Archivos

```text id="ngsw47"
own-fine.dto.ts
own-fine-detail.dto.ts
own-fine-list-query.dto.ts
own-fine-evidence.dto.ts
```

### Criterios de aceptación

* Solo incluye campos permitidos.
* No incluye reportedBy/reviewedBy/approvedBy.
* No incluye reviewNotes internas.
* No incluye audit metadata.
* No incluye fileUrl privada.
* Tiene tests.

---

## TASK-056 — Crear response wrappers

**Estado:** `[ ] Pending`

### Archivos

```text id="z4s1jc"
fine-response.dto.ts
fine-paginated-response.dto.ts
```

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Paginados incluyen page/pageSize/total/totalPages.
* No retorna entidades internas.
* No retorna tokens ni secretos.
* Tiene tests.

---

# 12. Fase 6 — Puertos y repositorios

## TASK-057 — Crear puertos de conceptos de multa

**Estado:** `[ ] Pending`

### Archivos

```text id="hsxdav"
fine-concept-reader.port.ts
fine-concept-writer.port.ts
```

### Criterios de aceptación

* Define lectura por tenant.
* Define lectura por id.
* Define lectura por code.
* Define listados.
* Define create/update/state/archive.
* No opera sin tenant.

---

## TASK-058 — Crear puertos de multas

**Estado:** `[ ] Pending`

### Archivos

```text id="kb4jgh"
fine-reader.port.ts
fine-writer.port.ts
```

### Criterios de aceptación

* Consulta por tenant.
* Lista multas.
* Lista multas propias.
* Consulta por chargeId.
* Crea multa.
* Actualiza borrador.
* Actualiza estado.
* Adjunta cargo.
* Crea historial.
* No opera sin tenant.

---

## TASK-059 — Crear puertos de evidencias

**Estado:** `[ ] Pending`

### Archivos

```text id="vqsz9n"
fine-evidence-reader.port.ts
fine-evidence-writer.port.ts
```

### Criterios de aceptación

* Lista evidencias por multa.
* Consulta evidencia por tenant.
* Verifica evidencia activa.
* Crea evidencia.
* Archiva evidencia.
* No expone archivo directamente.

---

## TASK-060 — Crear puertos de reclamos

**Estado:** `[ ] Pending`

### Archivos

```text id="l5x9yd"
fine-appeal-reader.port.ts
fine-appeal-writer.port.ts
```

### Criterios de aceptación

* Lista reclamos por multa.
* Consulta reclamo por tenant.
* Lista reclamos propios.
* Detecta reclamo abierto.
* Crea reclamo.
* Resuelve reclamo.
* Cancela reclamo.

---

## TASK-061 — Crear `FineChargePort`

**Estado:** `[ ] Pending`

### Archivo

```text id="mc2z9d"
fine-charge.port.ts
```

### Criterios de aceptación

* Define generación de cargo.
* Define consulta de cargo asociado.
* Soporta idempotency key.
* No procesa pagos.
* No confirma pagos.
* No asigna pagos.

---

## TASK-062 — Crear `FinePropertyUnitPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="l10skj"
fine-property-unit.port.ts
```

### Criterios de aceptación

* Valida unidad por tenant.
* Valida acceso usuario-unidad.
* Consulta unidades del usuario.
* Usa datos de `003-residents-properties`.

---

## TASK-063 — Crear `FinePersonPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="c5wcnm"
fine-person.port.ts
```

### Criterios de aceptación

* Valida persona por tenant.
* Valida relación persona-unidad si aplica.
* Bloquea responsiblePersonId de otro tenant.

---

## TASK-064 — Crear `FineFileStoragePort`

**Estado:** `[ ] Pending`

### Archivo

```text id="u4t5kx"
fine-file-storage.port.ts
```

### Criterios de aceptación

* Define almacenamiento de evidencia.
* Define validación de archivo.
* Define obtención de URL firmada.
* No expone credenciales.
* Puede quedar implementado como stub si solo se usan referencias.

---

## TASK-065 — Crear `FineAuditPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="iv2hlq"
fine-audit.port.ts
```

### Criterios de aceptación

* Define auditoría de conceptos.
* Define auditoría de multas.
* Define auditoría de evidencias.
* Define auditoría de reclamos.
* Define auditoría de cargos.
* Metadata sanitizada.

---

## TASK-066 — Implementar `PrismaFineConceptRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="gwl5re"
infrastructure/persistence/prisma-fine-concept.repository.ts
```

### Criterios de aceptación

* Crea conceptos.
* Lista conceptos.
* Consulta por id.
* Consulta por code.
* Actualiza conceptos.
* Cambia estados.
* Archiva.
* Aplica tenantId.
* Tiene integration tests.

---

## TASK-067 — Implementar `PrismaFineRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="s2jvjd"
infrastructure/persistence/prisma-fine.repository.ts
```

### Criterios de aceptación

* Crea multas.
* Lista multas.
* Lista multas propias.
* Consulta por id+tenant.
* Consulta por chargeId.
* Actualiza borrador.
* Actualiza estado.
* Adjunta cargo.
* Crea historial.
* Aplica tenantId.
* Tiene integration tests.

---

## TASK-068 — Implementar `PrismaFineEvidenceRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="vv55w2"
infrastructure/persistence/prisma-fine-evidence.repository.ts
```

### Criterios de aceptación

* Crea evidencia.
* Lista evidencia por multa.
* Consulta evidencia por id+tenant.
* Cuenta evidencia activa.
* Archiva evidencia.
* Aplica tenantId.
* Tiene integration tests.

---

## TASK-069 — Implementar `PrismaFineAppealRepository`

**Estado:** `[ ] Pending`

### Archivo

```text id="ebj1bj"
infrastructure/persistence/prisma-fine-appeal.repository.ts
```

### Criterios de aceptación

* Crea reclamo.
* Lista reclamos por multa.
* Lista reclamos propios.
* Consulta reclamo por id+tenant.
* Detecta reclamo abierto.
* Resuelve reclamo.
* Cancela reclamo.
* Aplica tenantId.
* Tiene integration tests.

---

## TASK-070 — Implementar `FinesMapper`

**Estado:** `[ ] Pending`

### Archivo

```text id="gmvj5e"
infrastructure/persistence/fines.mapper.ts
```

### Criterios de aceptación

* Convierte Prisma models a entidades.
* Convierte entidades a DTO admin.
* Convierte entidades a DTO own.
* Convierte Decimal a string.
* Elimina campos privados según vista.
* Tiene tests.

---

## TASK-071 — Implementar `FineChargeAdapter`

**Estado:** `[ ] Pending`

### Archivo

```text id="ognf3w"
infrastructure/financial/fine-charge.adapter.ts
```

### Criterios de aceptación

* Integra con `004-dues-fees`.
* Genera cargo asociado a multa.
* Usa idempotency key.
* No crea pagos.
* No asigna pagos.
* No modifica comprobantes.
* Tiene tests.

---

## TASK-072 — Implementar `FineFileStorageAdapter`

**Estado:** `[ ] Pending`

### Archivo

```text id="wzo36a"
infrastructure/files/fine-file-storage.adapter.ts
```

### Criterios de aceptación

* Valida metadata de archivo.
* Devuelve URL firmada temporal si aplica.
* No expone secretos.
* No persiste URL firmada como fuente.
* Puede implementarse inicialmente como referencia controlada.
* Tiene tests.

---

## TASK-073 — Implementar `FineAuditAdapter`

**Estado:** `[ ] Pending`

### Archivo

```text id="jvqemd"
infrastructure/audit/fine-audit.adapter.ts
```

### Criterios de aceptación

* Publica eventos hacia `007-audit`.
* Metadata sanitizada.
* Sin payload completo.
* Sin tokens/secrets.
* Tiene tests.

---

# 13. Fase 7 — Servicios de aplicación

## TASK-074 — Implementar `FineConceptService`

**Estado:** `[ ] Pending`

### Archivo

```text id="u5y0fh"
application/services/fine-concept.service.ts
```

### Criterios de aceptación

* Crea conceptos.
* Valida código único.
* Actualiza conceptos.
* Activa/desactiva.
* Archiva.
* Valida monto base.
* Valida chargeConceptId.
* Audita cambios.
* Tiene tests.

---

## TASK-075 — Implementar `FineService`

**Estado:** `[ ] Pending`

### Archivo

```text id="r2l5hh"
application/services/fine.service.ts
```

### Criterios de aceptación

* Crea multas.
* Actualiza multas editables.
* Consulta multas.
* Ejecuta transiciones coordinadas.
* Coordina validación de unidad.
* Coordina validación de responsable.
* Coordina evidencia requerida.
* Coordina generación de cargo.
* Audita.
* Tiene tests.

---

## TASK-076 — Implementar `FineStateMachineService`

**Estado:** `[ ] Pending`

### Archivo

```text id="zxyepg"
application/services/fine-state-machine.service.ts
```

### Criterios de aceptación

* Define transiciones permitidas.
* Bloquea transiciones inválidas.
* Exige razones donde aplica.
* Crea status history.
* Tiene tests.

---

## TASK-077 — Implementar `FinePolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="cet7ok"
application/services/fine-policy.service.ts
```

### Criterios de aceptación

* Valida evidencia requerida.
* Valida estado editable.
* Valida emisión.
* Valida reclamo permitido.
* Valida plazo de reclamo.
* Valida reclamo duplicado.
* Valida condonación/reverso.
* Tiene tests.

---

## TASK-078 — Implementar `FineChargeService`

**Estado:** `[ ] Pending`

### Archivo

```text id="k8o9s2"
application/services/fine-charge.service.ts
```

### Criterios de aceptación

* Determina si requiere cargo.
* Valida monto.
* Valida unidad.
* Valida concepto financiero.
* Genera cargo vía puerto.
* Usa idempotencia.
* Adjunta chargeId.
* No procesa pagos.
* Tiene tests.

---

## TASK-079 — Implementar `FineOwnershipService`

**Estado:** `[ ] Pending`

### Archivo

```text id="uwvqsy"
application/services/fine-ownership.service.ts
```

### Criterios de aceptación

* Valida usuario-unidad.
* Valida tenant.
* Bloquea unidad ajena.
* Bloquea relación inactiva.
* Soporta propietario/residente/arrendatario según política.
* Tiene tests.

---

## TASK-080 — Implementar `FineEvidenceService`

**Estado:** `[ ] Pending`

### Archivo

```text id="wp5ly9"
application/services/fine-evidence.service.ts
```

### Criterios de aceptación

* Crea evidencia.
* Valida tipo.
* Valida archivo o referencia.
* Archiva evidencia.
* Cuenta evidencia activa.
* Audita creación/archivo.
* Tiene tests.

---

## TASK-081 — Implementar `FineEvidenceAccessService`

**Estado:** `[ ] Pending`

### Archivo

```text id="t2il0k"
application/services/fine-evidence-access.service.ts
```

### Criterios de aceptación

* Controla acceso admin.
* Controla acceso own.
* Oculta evidencia restringida.
* Genera URL firmada si aplica.
* Audita descarga.
* Tiene tests.

---

## TASK-082 — Implementar `FineAppealService`

**Estado:** `[ ] Pending`

### Archivo

```text id="q5r7el"
application/services/fine-appeal.service.ts
```

### Criterios de aceptación

* Presenta reclamos.
* Valida multa emitida.
* Valida acceso a unidad.
* Valida plazo.
* Bloquea duplicado abierto.
* Acepta/rechaza/cancela reclamos.
* Actualiza estado de multa.
* Audita.
* Tiene tests.

---

## TASK-083 — Implementar `FineMoneyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="x8vdsz"
application/services/fine-money.service.ts
```

### Criterios de aceptación

* Usa Decimal.
* Devuelve string.
* Rechaza float.
* Valida moneda.
* No redondea silenciosamente.
* Tiene tests.

---

## TASK-084 — Implementar `FineAuditService`

**Estado:** `[ ] Pending`

### Archivo

```text id="s7yksb"
application/services/fine-audit.service.ts
```

### Criterios de aceptación

* Audita conceptos.
* Audita multas.
* Audita evidencias.
* Audita reclamos.
* Audita cargos.
* Sanitiza metadata.
* Tiene tests.

---

# 14. Fase 8 — Casos de uso

## TASK-085 — Implementar casos de uso de conceptos

**Estado:** `[ ] Pending`

### Use cases

```text id="nwcz63"
CreateFineConceptUseCase
ListFineConceptsUseCase
GetFineConceptUseCase
UpdateFineConceptUseCase
ActivateFineConceptUseCase
DeactivateFineConceptUseCase
ArchiveFineConceptUseCase
```

### Criterios de aceptación

* Requieren permisos correctos.
* Aplican tenantId.
* Validan DTO.
* Validan concepto financiero.
* Auditan operaciones.
* Tienen tests.

---

## TASK-086 — Implementar `CreateFineUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="l1wxgk"
POST /api/v1/tenant/fines
```

### Criterios de aceptación

* Requiere `fines.create`.
* Valida concepto activo.
* Valida unidad del tenant.
* Valida responsable si existe.
* Valida descripción.
* Valida monto.
* Crea historial inicial.
* Audita.
* Tiene tests.

---

## TASK-087 — Implementar casos de consulta administrativa

**Estado:** `[ ] Pending`

### Use cases

```text id="wqj580"
ListFinesUseCase
GetFineUseCase
```

### Criterios de aceptación

* Requieren `fines.read`.
* Soportan filtros.
* Soportan paginación.
* Aplica tenantId.
* No exponen otros tenants.
* Tienen tests.

---

## TASK-088 — Implementar `UpdateFineUseCase`

**Estado:** `[ ] Pending`

### Endpoint

```text id="y84uxu"
PATCH /api/v1/tenant/fines/{fineId}
```

### Criterios de aceptación

* Requiere `fines.update`.
* Permite solo estados editables.
* Bloquea emitidas.
* Bloquea status manual.
* Bloquea chargeId manual.
* Audita.
* Tiene tests.

---

## TASK-089 — Implementar flujo de revisión

**Estado:** `[ ] Pending`

### Use cases

```text id="njah33"
SubmitFineReviewUseCase
ApproveFineUseCase
RejectFineUseCase
```

### Criterios de aceptación

* Requieren permisos correctos.
* Validan transiciones.
* Rechazo exige razón.
* Aprobación valida evidencia requerida.
* Crean historial.
* Auditan.
* Tienen tests.

---

## TASK-090 — Implementar emisión de multa

**Estado:** `[ ] Pending`

### Use case

```text id="zykp3l"
IssueFineUseCase
```

### Criterios de aceptación

* Requiere `fines.issue`.
* Solo emite desde `approved`.
* Genera cargo si aplica.
* No genera cargo si amount = 0.
* Usa idempotencia.
* Crea historial.
* Audita.
* Tiene tests.

---

## TASK-091 — Implementar acciones posteriores de multa

**Estado:** `[ ] Pending`

### Use cases

```text id="wjsgh4"
CancelFineUseCase
WaiveFineUseCase
ReverseFineUseCase
ArchiveFineUseCase
```

### Criterios de aceptación

* Requieren permisos correctos.
* Exigen razón donde aplica.
* No eliminan historial.
* No revierten pagos automáticamente.
* No modifican estados de cuenta.
* Crean historial.
* Auditan.
* Tienen tests.

---

## TASK-092 — Implementar generación manual de cargo

**Estado:** `[ ] Pending`

### Use case

```text id="a4ul7l"
GenerateFineChargeUseCase
```

### Criterios de aceptación

* Requiere `fines.generateCharge`.
* Valida multa monetaria.
* Valida propertyUnitId.
* Valida chargeConceptId.
* Usa idempotencia.
* No duplica cargo.
* No procesa pagos.
* Audita.
* Tiene tests.

---

## TASK-093 — Implementar casos de uso de evidencias

**Estado:** `[ ] Pending`

### Use cases

```text id="yyabob"
AddFineEvidenceUseCase
ListFineEvidenceUseCase
GetFineEvidenceUseCase
DownloadFineEvidenceUseCase
ArchiveFineEvidenceUseCase
```

### Criterios de aceptación

* Requieren permisos correctos.
* Aplican tenantId.
* Valida acceso.
* No exponen fileUrl privada.
* Descarga genera URL temporal si aplica.
* Descarga audita.
* Tienen tests.

---

## TASK-094 — Implementar casos administrativos de reclamos

**Estado:** `[ ] Pending`

### Use cases

```text id="gzjzlq"
ListFineAppealsUseCase
GetFineAppealUseCase
AcceptFineAppealUseCase
RejectFineAppealUseCase
CancelFineAppealUseCase
```

### Criterios de aceptación

* Requieren permisos correctos.
* Aplican tenantId.
* Validan estado de reclamo.
* Exigen resolutionNotes.
* Actualizan estado de multa.
* Auditan.
* Tienen tests.

---

## TASK-095 — Implementar casos de multas propias

**Estado:** `[ ] Pending`

### Use cases

```text id="u141xz"
ListOwnFinesUseCase
GetOwnFineUseCase
ListOwnFineEvidenceUseCase
SubmitOwnFineAppealUseCase
```

### Criterios de aceptación

* Requieren permisos own.
* Validan unidad propia.
* No exponen multas ajenas.
* No exponen datos administrativos internos.
* No exponen evidencia restringida.
* Presentación de reclamo válida.
* Tienen tests.

---

## TASK-096 — Implementar casos de reclamos propios

**Estado:** `[ ] Pending`

### Use cases

```text id="k05fe5"
ListOwnFineAppealsUseCase
GetOwnFineAppealUseCase
```

### Criterios de aceptación

* Requieren `fineAppeals.read.own`.
* Listan solo reclamos propios.
* Bloquean reclamos ajenos.
* Minimizan datos.
* Tienen tests.

---

# 15. Fase 9 — Guards, policies y autorización

## TASK-097 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Protege endpoints tenant.
* Protege endpoints `/me`.
* Bloquea anonymous.
* Bloquea usuarios disabled.

---

## TASK-098 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida membership.
* No confía solo en header.
* Aplica a endpoints tenant y `/me`.

---

## TASK-099 — Crear `FineConceptPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="xusx21"
policies/fine-concept-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos fineConcepts.
* Compatible con decorators.
* Tiene tests.

---

## TASK-100 — Crear `FinePermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="tnw9vk"
policies/fine-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos fines.
* Bloquea acciones sin permiso.
* Tiene tests.

---

## TASK-101 — Crear `FineEvidencePermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="oexjnm"
policies/fine-evidence-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos de evidencias.
* Controla lectura, creación, archivo y descarga.
* Tiene tests.

---

## TASK-102 — Crear `FineAppealPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="tnmqvn"
policies/fine-appeal-permission.guard.ts
```

### Criterios de aceptación

* Valida permisos de reclamos.
* Controla lectura y resolución.
* Tiene tests.

---

## TASK-103 — Crear `OwnFineGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="ly8i45"
policies/own-fine.guard.ts
```

### Criterios de aceptación

* Valida multa propia.
* Valida unidad propia.
* Bloquea multas ajenas.
* Bloquea otro tenant.
* Tiene tests.

---

## TASK-104 — Crear `FineFinancialGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="u21qyb"
policies/fine-financial.guard.ts
```

### Criterios de aceptación

* Valida permiso `fines.generateCharge`.
* Bloquea usuarios no autorizados.
* No permite procesar pagos.
* Tiene tests.

---

## TASK-105 — Crear decorators de permisos

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="efx4u4"
@RequireFineConceptPermission()
@RequireFinePermission()
@RequireFineEvidencePermission()
@RequireFineAppealPermission()
@RequireOwnFinePermission()
@FineAction()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Compatibles con OpenAPI.
* Tienen tests básicos.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-106 — Implementar `FineConceptsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="fmsd2u"
GET    /api/v1/tenant/fine-concepts
POST   /api/v1/tenant/fine-concepts
GET    /api/v1/tenant/fine-concepts/{fineConceptId}
PATCH  /api/v1/tenant/fine-concepts/{fineConceptId}
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/activate
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/deactivate
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/archive
```

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa use cases.
* Respuestas estándar.
* Tiene API tests.

---

## TASK-107 — Implementar `FinesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="g3if03"
GET    /api/v1/tenant/fines
POST   /api/v1/tenant/fines
GET    /api/v1/tenant/fines/{fineId}
PATCH  /api/v1/tenant/fines/{fineId}
POST   /api/v1/tenant/fines/{fineId}/submit-review
POST   /api/v1/tenant/fines/{fineId}/approve
POST   /api/v1/tenant/fines/{fineId}/reject
POST   /api/v1/tenant/fines/{fineId}/issue
POST   /api/v1/tenant/fines/{fineId}/cancel
POST   /api/v1/tenant/fines/{fineId}/waive
POST   /api/v1/tenant/fines/{fineId}/reverse
POST   /api/v1/tenant/fines/{fineId}/archive
POST   /api/v1/tenant/fines/{fineId}/generate-charge
```

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa use cases.
* Aplica permisos por endpoint.
* Tiene API tests.

---

## TASK-108 — Implementar `FineEvidenceController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="s2tu3w"
GET    /api/v1/tenant/fines/{fineId}/evidence
POST   /api/v1/tenant/fines/{fineId}/evidence
GET    /api/v1/tenant/fine-evidence/{evidenceId}
GET    /api/v1/tenant/fine-evidence/{evidenceId}/download
POST   /api/v1/tenant/fine-evidence/{evidenceId}/archive
```

### Criterios de aceptación

* Usa guards.
* Valida fineId/evidenceId.
* Usa use cases.
* No expone fileUrl privada.
* Descarga auditable.
* Tiene API tests.

---

## TASK-109 — Implementar `FineAppealsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="i2cr4j"
GET    /api/v1/tenant/fines/{fineId}/appeals
GET    /api/v1/tenant/fine-appeals/{appealId}
POST   /api/v1/tenant/fine-appeals/{appealId}/accept
POST   /api/v1/tenant/fine-appeals/{appealId}/reject
POST   /api/v1/tenant/fine-appeals/{appealId}/cancel
```

### Criterios de aceptación

* Usa guards.
* Valida fineId/appealId.
* Usa use cases.
* Audita resoluciones.
* Tiene API tests.

---

## TASK-110 — Implementar `MyFinesController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="bnl02d"
GET    /api/v1/me/fines
GET    /api/v1/me/fines/{fineId}
GET    /api/v1/me/fines/{fineId}/evidence
POST   /api/v1/me/fines/{fineId}/appeals
```

### Criterios de aceptación

* Usa AuthGuard.
* Usa TenantGuard.
* Usa permisos own.
* Usa OwnFineGuard donde aplique.
* No expone multas ajenas.
* No expone evidencias restringidas.
* Tiene API tests.

---

## TASK-111 — Implementar `MyFineAppealsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="r9x2uv"
GET /api/v1/me/fine-appeals
GET /api/v1/me/fine-appeals/{appealId}
```

### Criterios de aceptación

* Usa AuthGuard.
* Usa TenantGuard.
* Usa permisos own.
* No expone reclamos ajenos.
* Tiene API tests.

---

# 17. Fase 11 — Errores y responses

## TASK-112 — Mapear errores a HTTP

**Estado:** `[ ] Pending`

### Mapeos principales

```text id="gxvarw"
FINE_CONCEPT_NOT_FOUND -> 404
FINE_CONCEPT_DUPLICATE_CODE -> 409
FINE_CONCEPT_INACTIVE -> 422
FINE_CONCEPT_INVALID_AMOUNT -> 422
FINE_CONCEPT_CHARGE_CONCEPT_REQUIRED -> 422
FINE_NOT_FOUND -> 404
FINE_FORBIDDEN -> 403
FINE_INVALID_TRANSITION -> 409
FINE_EVIDENCE_REQUIRED -> 422
FINE_INVALID_AMOUNT -> 422
FINE_UNIT_REQUIRED -> 422
FINE_UNIT_FORBIDDEN -> 403
FINE_PERSON_FORBIDDEN -> 403
FINE_CROSS_TENANT_REFERENCE -> 403
FINE_REASON_REQUIRED -> 422
FINE_CHARGE_CONCEPT_REQUIRED -> 422
FINE_CHARGE_ALREADY_GENERATED -> 409
FINE_CHARGE_GENERATION_FAILED -> 500
FINE_EVIDENCE_NOT_FOUND -> 404
FINE_EVIDENCE_FORBIDDEN -> 403
FINE_EVIDENCE_INVALID_FILE -> 422
FINE_APPEAL_NOT_FOUND -> 404
FINE_APPEAL_NOT_ALLOWED -> 409
FINE_APPEAL_DEADLINE_EXPIRED -> 409
FINE_APPEAL_ALREADY_OPEN -> 409
FINE_APPEAL_INVALID_STATUS -> 409
```

### Criterios de aceptación

* Error estándar.
* Incluye traceId.
* No expone SQL.
* No expone stack trace.
* No expone datos sensibles.
* Tiene tests.

---

## TASK-113 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usa `data`.
* Usa `meta.traceId`.
* Paginados incluyen page/pageSize/total/totalPages.
* No retorna entidades internas.
* No retorna tokens ni secretos.
* Tiene tests.

---

# 18. Fase 12 — Estados, reclamos e idempotencia financiera

## TASK-114 — Implementar máquina de estados completa

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Transiciones permitidas funcionan.
* Transiciones prohibidas fallan.
* Razones obligatorias se validan.
* Historial funcional se registra.
* Tiene tests.

---

## TASK-115 — Implementar validación de evidencia requerida

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Si `requiresEvidence = true`, no aprueba sin evidencia activa.
* Evidencia archivada no cuenta.
* Evidencia rechazada no cuenta.
* Tiene tests.

---

## TASK-116 — Implementar validación de reclamos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Reclamo solo sobre `issued`.
* Reclamo solo si `allowsAppeal = true`.
* Reclamo dentro de plazo si aplica.
* No hay reclamo abierto duplicado.
* Usuario debe tener acceso a unidad.
* Tiene tests.

---

## TASK-117 — Implementar idempotencia de cargo

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `fine.chargeId` evita duplicado.
* `Idempotency-Key` soportado.
* Repetición devuelve mismo cargo o error controlado.
* Concurrency/financial tests pasan.

---

## TASK-118 — Asegurar que multas no procesen pagos

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No se llama a confirmación de pagos.
* No se llama a asignación de pagos.
* No se modifica payment_receipts.
* No se modifica payment_allocations.
* No se modifica account_statements.
* No se modifica unit_balances.
* Tests financieros pasan.

---

# 19. Fase 13 — Auditoría y observabilidad

## TASK-119 — Auditar conceptos de multa

**Estado:** `[ ] Pending`

### Eventos

```text id="vop18c"
fineConcept.created
fineConcept.updated
fineConcept.activated
fineConcept.deactivated
fineConcept.archived
```

### Criterios de aceptación

* Eventos generados.
* Metadata sanitizada.
* Sin payload completo.
* Tiene tests.

---

## TASK-120 — Auditar multas

**Estado:** `[ ] Pending`

### Eventos

```text id="kc3smy"
fine.created
fine.updated
fine.reported
fine.underReview
fine.approved
fine.rejected
fine.issued
fine.disputed
fine.appealAccepted
fine.appealRejected
fine.waived
fine.cancelled
fine.reversed
fine.archived
```

### Criterios de aceptación

* Eventos generados.
* fromStatus/toStatus incluidos.
* actorUserId incluido.
* reason incluida si aplica.
* Tiene tests.

---

## TASK-121 — Auditar cargos de multas

**Estado:** `[ ] Pending`

### Eventos

```text id="ncaaww"
fine.chargeGenerated
fine.chargeGenerationFailed
```

### Criterios de aceptación

* Cargo exitoso audita.
* Fallo de cargo audita.
* No incluye datos financieros excesivos.
* Tiene tests.

---

## TASK-122 — Auditar evidencias

**Estado:** `[ ] Pending`

### Eventos

```text id="ygrd6w"
fineEvidence.added
fineEvidence.archived
fineEvidence.downloaded
```

### Criterios de aceptación

* Eventos generados.
* Descarga auditada.
* No incluye contenido del archivo.
* No incluye URL firmada completa.
* Tiene tests.

---

## TASK-123 — Auditar reclamos

**Estado:** `[ ] Pending`

### Eventos

```text id="apyqjf"
fineAppeal.submitted
fineAppeal.accepted
fineAppeal.rejected
fineAppeal.cancelled
```

### Criterios de aceptación

* Eventos generados.
* Metadata sanitizada.
* Resolución incluida de forma segura.
* Tiene tests.

---

## TASK-124 — Agregar logs estructurados

**Estado:** `[ ] Pending`

### Logs

```text id="ohnchv"
fineConcept.created
fineConcept.updated
fine.created
fine.updated
fine.approved
fine.rejected
fine.issued
fine.cancelled
fine.waived
fine.reversed
fine.chargeGenerated
fine.chargeGenerationFailed
fineEvidence.added
fineEvidence.archived
fineEvidence.downloaded
fineAppeal.submitted
fineAppeal.accepted
fineAppeal.rejected
```

### Criterios de aceptación

* Incluyen traceId.
* No contienen tokens.
* No contienen evidencia completa.
* No contienen datos personales extensos.
* Tiene tests o verificación.

---

## TASK-125 — Agregar métricas

**Estado:** `[ ] Pending`

### Métricas

```text id="qvb62f"
fines_created_total
fines_approved_total
fines_rejected_total
fines_issued_total
fines_cancelled_total
fines_waived_total
fines_reversed_total
fines_disputed_total
fines_charge_generated_total
fines_charge_generation_failed_total
fine_appeals_submitted_total
fine_evidence_added_total
fine_evidence_downloaded_total
```

### Criterios de aceptación

* Métricas incrementan.
* Labels permitidos: status, action, outcome, severity, category.
* No usan tenantId.
* No usan fineId.
* No usan propertyUnitId.
* No usan personId/userId.
* Tiene tests o verificación.

---

# 20. Fase 14 — OpenAPI

## TASK-126 — Documentar Fine Concepts

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Permisos documentados.
* DTOs documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-127 — Documentar Fines administrativas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List/create/get/update/action endpoints documentados.
* Permisos documentados.
* Estados documentados.
* Errores documentados.
* Money como string.
* OpenAPI valida.

---

## TASK-128 — Documentar Fine Evidence

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Evidencias documentadas.
* Descarga documentada.
* Protección documentada.
* Audit event documentado.
* OpenAPI valida.

---

## TASK-129 — Documentar Fine Appeals

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Reclamos administrativos documentados.
* Resoluciones documentadas.
* Estados documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-130 — Documentar endpoints `/me`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* My Fines documentado.
* My Fine Appeals documentado.
* Own-resource documentado.
* DTOs propios documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-131 — Validar no exposición pública

**Estado:** `[ ] Pending`

### Criterios de aceptación

OpenAPI no documenta:

```text id="jfr34p"
GET /api/v1/public/tenants/{slug}/fines
GET /api/v1/public/tenants/{slug}/sanctions
GET /api/v1/public/tenants/{slug}/fine-evidence
POST /api/v1/public/tenants/{slug}/fines
POST /api/v1/public/tenants/{slug}/fine-appeals
```

---

# 21. Fase 15 — Pruebas unitarias

## TASK-132 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cubre FineConceptCode.
* Cubre FineConceptStatus.
* Cubre FineCategory.
* Cubre FineStatus.
* Cubre FineSeverity.
* Cubre FineMoney.
* Cubre FineTitle.
* Cubre FineDescription.
* Cubre FineReason.
* Cubre FineEvidenceType.
* Cubre FineEvidenceStatus.
* Cubre FineAppealStatus.
* Cubre FinePaymentStatusSnapshot.
* Pasa en CI.

---

## TASK-133 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Criterios de aceptación

* FineConcept entity.
* Fine entity.
* FineEvidence entity.
* FineAppeal entity.
* FineStatusHistory entity.
* No exposición de campos privados.
* Pasa en CI.

---

## TASK-134 — Implementar tests de máquina de estados

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Transiciones permitidas pasan.
* Transiciones prohibidas fallan.
* Razones obligatorias validadas.
* Historial generado.
* Pasa en CI.

---

## TASK-135 — Implementar DTO validation tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* FineConcept DTOs.
* Fine DTOs.
* Evidence DTOs.
* Appeal DTOs.
* Own DTOs.
* Query DTOs.
* Pasa en CI.

---

# 22. Fase 16 — Pruebas de aplicación e integración

## TASK-136 — Implementar tests de servicios

**Estado:** `[ ] Pending`

### Servicios

```text id="tggmn6"
FineConceptService
FineService
FineStateMachineService
FinePolicyService
FineChargeService
FineOwnershipService
FineEvidenceService
FineEvidenceAccessService
FineAppealService
FineMoneyService
FineAuditService
```

### Criterios de aceptación

* Caminos felices.
* Errores.
* Evidencia requerida.
* Reclamos.
* Ownership.
* Cargos.
* Auditoría.
* Pasa en CI.

---

## TASK-137 — Implementar tests de casos de uso

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Fine Concepts.
* Fines admin.
* Evidence.
* Appeals.
* Own Fines.
* Own Appeals.
* Generate charge.
* Pasa en CI.

---

## TASK-138 — Implementar repository tests

**Estado:** `[ ] Pending`

### Repositorios

```text id="bwob28"
PrismaFineConceptRepository
PrismaFineRepository
PrismaFineEvidenceRepository
PrismaFineAppealRepository
FineStatusHistoryRepository
```

### Criterios de aceptación

* Persistencia correcta.
* Filtros tenant.
* Índices/constraints validados.
* Own queries.
* Charge attach.
* Pasa en CI.

---

# 23. Fase 17 — Pruebas API

## TASK-139 — Implementar API tests de Fine Concepts

**Estado:** `[ ] Pending`

### Criterios de aceptación

* GET list.
* POST create.
* GET detail.
* PATCH update.
* State actions.
* 401/403/404/409/422.
* Audit event.
* Pasa en CI.

---

## TASK-140 — Implementar API tests de Fines administrativas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List.
* Create.
* Get.
* Update editable.
* Submit review.
* Approve.
* Reject.
* Issue.
* Cancel.
* Waive.
* Reverse.
* Archive.
* Generate charge.
* Pasa en CI.

---

## TASK-141 — Implementar API tests de Fine Evidence

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List.
* Add.
* Get.
* Download.
* Archive.
* Protección de fileUrl.
* Permisos.
* Tenant isolation.
* Pasa en CI.

---

## TASK-142 — Implementar API tests de Fine Appeals administrativas

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List by fine.
* Get appeal.
* Accept appeal.
* Reject appeal.
* Cancel appeal.
* Reason/notes validation.
* Tenant isolation.
* Pasa en CI.

---

## TASK-143 — Implementar API tests de My Fines

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List own.
* Get own.
* Get own evidence.
* Submit own appeal.
* Multa ajena falla.
* Unidad ajena falla.
* Evidencia restringida falla.
* Pasa en CI.

---

## TASK-144 — Implementar API tests de My Fine Appeals

**Estado:** `[ ] Pending`

### Criterios de aceptación

* List own appeals.
* Get own appeal.
* Reclamo ajeno falla.
* Tenant B falla.
* Paginación.
* Pasa en CI.

---

# 24. Fase 18 — Authorization, own-resource, multitenancy y seguridad

## TASK-145 — Implementar authorization tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token devuelve 401.
* Sin membership devuelve 403.
* Sin permiso devuelve 403.
* Admin autorizado pasa.
* SanctionManager autorizado pasa.
* Residente autorizado pasa en `/me`.
* Usuario disabled falla.
* Pasa en CI.

---

## TASK-146 — Implementar own-resource tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Usuario ve multa de su unidad.
* Usuario no ve multa de unidad ajena.
* Usuario no reclama multa ajena.
* Usuario no ve evidencia de multa ajena.
* Usuario no ve reclamo ajeno.
* Usuario no filtra por unidad ajena.
* Pasa en CI.

---

## TASK-147 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant A no ve conceptos B.
* Tenant A no ve multas B.
* Tenant A no ve evidencias B.
* Tenant A no ve reclamos B.
* Tenant A no usa fineConceptId B.
* Tenant A no usa propertyUnitId B.
* Tenant A no usa responsiblePersonId B.
* Tenant A no usa chargeConceptId B.
* Tenant A no usa chargeId B.
* Pasa en CI.

---

## TASK-148 — Implementar financial regression tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* defaultAmount Decimal.
* amount Decimal.
* amount string.
* amount > 0 exige propertyUnitId.
* Issue genera cargo si aplica.
* Cargo tenant correcto.
* Cargo unidad correcta.
* Cargo idempotente.
* Reclamo no revierte cargo automáticamente.
* Condonación no borra cargo.
* Reverso no modifica pagos.
* Multas no procesan pagos.
* Pasa en CI.

---

## TASK-149 — Implementar evidence security tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Evidencia no visible sin permiso.
* Evidencia no descargable sin permiso.
* Evidencia cross-tenant falla.
* Evidencia ajena desde `/me` falla.
* fileUrl privada no se expone.
* downloadUrl temporal.
* Descarga auditada.
* Logs sin evidencia completa.
* Pasa en CI.

---

## TASK-150 — Implementar appeal workflow tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Reclamo sobre issued.
* Bloquea reclamo sobre estados inválidos.
* Bloquea reclamo fuera de plazo.
* Bloquea reclamo duplicado abierto.
* Acepta reclamo.
* Rechaza reclamo.
* Cancela reclamo.
* Actualiza estado de multa.
* Audita.
* Pasa en CI.

---

## TASK-151 — Implementar public WordPress negative tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No endpoint público de multas.
* No endpoint público de sanciones.
* No endpoint público de evidencias.
* No endpoint público de reclamos.
* No endpoint público de descarga.
* OpenAPI no documenta rutas públicas.
* Pasa en CI.

---

# 25. Fase 19 — Auditoría, observabilidad y OpenAPI tests

## TASK-152 — Implementar audit integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Eventos de conceptos se auditan.
* Eventos de multas se auditan.
* Eventos de cargos se auditan.
* Eventos de evidencias se auditan.
* Eventos de reclamos se auditan.
* Metadata sin payload completo.
* Metadata sin tokens/secrets.
* Pasa en CI.

---

## TASK-153 — Implementar observability tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs generados.
* Logs sin tokens.
* Logs sin evidencia completa.
* Logs sin datos personales extensos.
* Métricas incrementan.
* Métricas no usan tenantId.
* Métricas no usan fineId.
* Métricas no usan propertyUnitId.
* Métricas no usan userId/personId.
* Pasa en CI.

---

## TASK-154 — Implementar OpenAPI tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Fine Concepts documentado.
* Fines admin documentado.
* Fine Evidence documentado.
* Fine Appeals documentado.
* My Fines documentado.
* My Fine Appeals documentado.
* Money string documentado.
* Permisos documentados.
* Errores documentados.
* No endpoints públicos.
* No endpoints de pagos desde multas.
* Pasa en CI.

---

# 26. Fase 20 — CI/CD y smoke tests

## TASK-155 — Agregar scripts de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="suwunh"
npm run test:fines
npm run test:fines:unit
npm run test:fines:application
npm run test:fines:integration
npm run test:fines:api
npm run test:fines:authorization
npm run test:fines:multitenancy
npm run test:fines:own-resource
npm run test:fines:financial
npm run test:fines:evidence
npm run test:fines:appeals
npm run test:fines:security
npm run test:fines:audit
npm run test:fines:openapi
```

### Criterios de aceptación

* Scripts disponibles.
* Corren localmente.
* Documentados.
* Integrables con CI.

---

## TASK-156 — Agregar validaciones CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="gn564m"
lint
typecheck
unit tests
DTO validation tests
state machine tests
application tests
repository integration tests críticos
API tests críticos
authorization tests
own-resource tests
multitenancy tests
financial regression tests
evidence security tests
appeal workflow tests
audit integration tests
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay multa cross-tenant.
* Pipeline falla si hay unidad ajena.
* Pipeline falla si hay evidencia expuesta.
* Pipeline falla si hay cargo duplicado.
* Pipeline falla si hay float money.
* Pipeline falla si se procesa pago desde multas.
* Pipeline falla si hay endpoints públicos de multas.
* Pipeline falla si OpenAPI no coincide.
* Pipeline falla si build falla.

---

## TASK-157 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="a6bx7g"
GET /api/v1/health
GET /api/v1/tenant/fine-concepts
POST /api/v1/tenant/fine-concepts
POST /api/v1/tenant/fines
POST /api/v1/tenant/fines/{fineId}/evidence
POST /api/v1/tenant/fines/{fineId}/submit-review
POST /api/v1/tenant/fines/{fineId}/approve
POST /api/v1/tenant/fines/{fineId}/issue
POST /api/v1/tenant/fines/{fineId}/generate-charge repetido
GET /api/v1/me/fines
POST /api/v1/me/fines/{fineId}/appeals
POST /api/v1/tenant/fine-appeals/{appealId}/reject
GET admin endpoint sin token
GET /api/v1/public/tenants/{slug}/fines
```

### Criterios de aceptación

* Smoke tests pasan.
* Errores incluyen traceId.
* Endpoint público de multas no existe.
* No requieren datos reales.
* No ejecutan pagos reales.

---

# 27. Fase 21 — Revisión SDD

## TASK-158 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene pruebas.
* Cada endpoint tiene API tests.
* Cada permiso tiene authorization tests.
* Cada regla financiera tiene tests.
* Cada regla de evidencia tiene tests.
* Cada regla de reclamo tiene tests.
* Cada regla own-resource tiene tests.
* Cada regla public-negative tiene tests.

---

## TASK-159 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="g6msp3"
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* PostgreSQL + Prisma.
* tenant_id obligatorio.
* RBAC y permisos.
* Observabilidad.
* Testing.
* CI gates.
* No contradice ADRs.

---

## TASK-160 — Validar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Coincide con api-contract.
* No documenta multas públicas.
* No documenta evidencias públicas.
* No documenta reclamos públicos.
* No documenta pagos desde multas.
* Permisos documentados.
* Errores documentados.
* OpenAPI valida.

---

## TASK-161 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos

```bash id="vzl5w7"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run build
```

### Criterios de aceptación

* Todo pasa.
* No hay tests omitidos sin justificación.
* No hay datos reales.
* No hay secretos.
* No hay endpoints fuera de alcance.

---

## TASK-162 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="a6t9uq"
- PR link o commit SHA.
- Migración aplicada.
- Seeds demo.
- Endpoints implementados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 28. Fase 22 — Pendientes diferidos controlados

## TASK-163 — Diferir pagos online de multas

**Estado:** `[-] Deferred`

### Razón

Requiere pasarela, webhooks, idempotencia financiera reforzada, seguridad de pagos y conciliación.

### Futuro

```text id="k0rni3"
docs/specs/00X-fine-payments/
```

---

## TASK-164 — Diferir notificaciones automáticas

**Estado:** `[-] Deferred`

### Razón

Depende del módulo de comunicaciones y canales email/WhatsApp.

### Futuro

```text id="h5vsm0"
docs/specs/00X-fines-notifications/
```

---

## TASK-165 — Diferir documentos PDF formales

**Estado:** `[-] Deferred`

### Razón

Requiere plantillas, almacenamiento, versionamiento, firma y reglas documentales.

### Futuro

```text id="sqxixy"
docs/specs/00X-fines-pdf-documents/
```

---

## TASK-166 — Diferir firma electrónica

**Estado:** `[-] Deferred`

### Razón

Requiere proveedor externo, validez legal, certificados y evidencia adicional.

### Futuro

```text id="nywcwn"
docs/specs/00X-electronic-signature/
```

---

## TASK-167 — Diferir OCR e IA sobre evidencias

**Estado:** `[-] Deferred`

### Razón

Requiere gobierno de datos, anonimización, seguridad, revisión humana y cumplimiento.

### Futuro

```text id="rrfyiy"
docs/specs/00X-ai-assisted-evidence-review/
```

---

## TASK-168 — Diferir integración con cámaras o sensores

**Estado:** `[-] Deferred`

### Razón

Implica privacidad, videovigilancia, infraestructura física y reglas legales.

### Futuro

```text id="cs15af"
docs/specs/00X-security-camera-integrations/
```

---

## TASK-169 — Diferir reincidencia automática

**Estado:** `[-] Deferred`

### Razón

Requiere reglas adicionales, periodos, escalamiento y cálculos progresivos.

### Futuro

```text id="xu6y4m"
docs/specs/00X-repeat-offender-rules/
```

---

## TASK-170 — Diferir comité, audiencias y flujos legales avanzados

**Estado:** `[-] Deferred`

### Razón

Requiere workflow avanzado, roles adicionales, evidencias formales y resoluciones.

### Futuro

```text id="vy1lqu"
docs/specs/00X-fines-advanced-appeals/
```

---

## TASK-171 — Diferir multas automáticas por mora

**Estado:** `[-] Deferred`

### Razón

Pertenece a reglas financieras de mora y no al flujo sancionatorio operativo básico.

### Futuro

```text id="lq6yb8"
docs/specs/00X-late-payment-penalties/
```

---

## TASK-172 — Diferir restricción automática de reservas por multas

**Estado:** `[-] Deferred`

### Razón

Requiere integración con `010-reservations-common-areas` y políticas del tenant.

### Futuro

```text id="g0r9ks"
docs/specs/00X-fines-reservation-restrictions/
```

---

## TASK-173 — Diferir publicación pública de sanciones

**Estado:** `[-] Deferred`

### Razón

Alto riesgo de privacidad, reputación y cumplimiento. No pertenece al MVP.

### Futuro

```text id="v0ig4s"
docs/specs/00X-public-sanction-publication/
```

---

# 29. Definition of Done

El módulo `011-fines-sanctions` estará terminado cuando:

```text id="vo69ro"
[ ] Documentación completa.
[ ] Módulo fines creado.
[ ] Migración creada y ejecutada.
[ ] fine_concepts implementado.
[ ] fines implementado.
[ ] fine_evidence implementado.
[ ] fine_appeals implementado.
[ ] fine_status_history implementado.
[ ] Seeds demo creados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Eventos implementados.
[ ] Errores implementados.
[ ] DTOs implementados.
[ ] Puertos implementados.
[ ] Repositorios implementados.
[ ] Servicios implementados.
[ ] Casos de uso implementados.
[ ] Guards/policies implementados.
[ ] Controladores implementados.
[ ] CRUD administrativo de conceptos implementado.
[ ] Gestión administrativa de multas implementada.
[ ] Flujo de revisión implementado.
[ ] Aprobación implementada.
[ ] Rechazo implementado.
[ ] Emisión implementada.
[ ] Cancelación implementada.
[ ] Condonación implementada.
[ ] Reverso implementado.
[ ] Evidencias implementadas.
[ ] Descarga segura de evidencia implementada o diferida controladamente.
[ ] Reclamos propios implementados.
[ ] Resolución administrativa de reclamos implementada.
[ ] Consulta de multas propias implementada.
[ ] Consulta de reclamos propios implementada.
[ ] Generación de cargo idempotente implementada.
[ ] No se procesan pagos desde multas.
[ ] No se modifican estados de cuenta desde multas.
[ ] Historial de estados implementado.
[ ] Auditoría implementada.
[ ] Logs sanitizados implementados.
[ ] Métricas implementadas.
[ ] No hay endpoints públicos de multas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Entity tests pasan.
[ ] State machine tests pasan.
[ ] DTO tests pasan.
[ ] Application tests pasan.
[ ] Repository integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Own-resource tests pasan.
[ ] Multitenancy tests pasan.
[ ] Financial regression tests pasan.
[ ] Evidence security tests pasan.
[ ] Appeal workflow tests pasan.
[ ] Audit integration tests pasan.
[ ] Observability tests pasan.
[ ] OpenAPI tests pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
[ ] Diferidos documentados.
```

---

## 30. Orden recomendado de ejecución

```text id="ixzr5z"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-012      Estructura base
3. TASK-013 a TASK-025      Value objects
4. TASK-026 a TASK-039      Entidades, eventos y errores
5. TASK-040 a TASK-050      Base de datos, Prisma y seeds
6. TASK-051 a TASK-056      DTOs
7. TASK-057 a TASK-073      Puertos y repositorios
8. TASK-074 a TASK-084      Servicios
9. TASK-085 a TASK-096      Casos de uso
10. TASK-097 a TASK-105     Guards, policies y decorators
11. TASK-106 a TASK-111     Controladores
12. TASK-112 a TASK-113     Errores y responses
13. TASK-114 a TASK-118     Estados, reclamos e idempotencia
14. TASK-119 a TASK-125     Auditoría y observabilidad
15. TASK-126 a TASK-131     OpenAPI
16. TASK-132 a TASK-154     Pruebas
17. TASK-155 a TASK-157     CI/CD y smoke
18. TASK-158 a TASK-162     Revisión SDD
19. TASK-163 a TASK-173     Diferidos controlados
```

---

## 31. Riesgos de ejecución

| Riesgo                              | Impacto    | Mitigación                          |
| ----------------------------------- | ---------- | ----------------------------------- |
| Multa cross-tenant                  | Crítico    | tenant_id + guards + tests          |
| Multa sobre unidad ajena            | Alto       | FineOwnershipService                |
| Responsable de otro tenant          | Alto       | FinePersonPort                      |
| Evidencia expuesta                  | Alto       | FineEvidenceAccessService           |
| Cargo duplicado                     | Alto       | idempotencia + chargeId             |
| Uso de float                        | Alto       | Decimal + tests financieros         |
| Transición inválida                 | Alto       | State machine                       |
| Rechazo/cancelación sin razón       | Medio/alto | FineReason + DTO validation         |
| Reclamo fuera de plazo              | Medio      | FinePolicyService                   |
| Reclamo duplicado                   | Medio      | open appeal check                   |
| Condonación sin trazabilidad        | Alto       | status history + audit              |
| Reverso sin trazabilidad            | Alto       | status history + audit              |
| Modificación silenciosa de emitidas | Alto       | state guard                         |
| WordPress ve multas                 | Crítico    | no public endpoints + OpenAPI tests |
| Logs con evidencia sensible         | Alto       | logging policy + tests              |
| Pagos procesados desde multas       | Alto       | financial boundaries tests          |

---

## 32. Checklist de revisión de PR

```text id="ps1xef"
[ ] Sigue spec.md.
[ ] Sigue plan.md.
[ ] Sigue data-model.md.
[ ] Sigue api-contract.md.
[ ] Sigue test-plan.md.
[ ] No implementa pagos online fuera de scope.
[ ] No implementa notificaciones fuera de scope.
[ ] No implementa OCR/IA fuera de scope.
[ ] No implementa firma electrónica fuera de scope.
[ ] No implementa publicación pública fuera de scope.
[ ] Todas las tablas nuevas tienen tenant_id.
[ ] Todas las consultas filtran por tenant_id.
[ ] No se busca multa solo por fineId.
[ ] No se busca evidencia solo por evidenceId.
[ ] No se busca reclamo solo por appealId.
[ ] No se acepta tenantId desde body.
[ ] fineConceptId se valida contra tenant.
[ ] propertyUnitId se valida contra tenant.
[ ] responsiblePersonId se valida contra tenant.
[ ] chargeConceptId se valida contra tenant.
[ ] chargeId se valida contra tenant.
[ ] Conceptos inactivos no se usan para nuevas multas.
[ ] Multa monetaria exige propertyUnitId.
[ ] Se valida descripción obligatoria.
[ ] Se valida evidencia requerida.
[ ] Se valida estado antes de aprobar.
[ ] Se valida estado antes de emitir.
[ ] Se bloquean transiciones inválidas.
[ ] Rechazo requiere razón.
[ ] Cancelación requiere razón.
[ ] Condonación requiere razón.
[ ] Reverso requiere razón.
[ ] Reclamo solo sobre multa issued.
[ ] Reclamo valida plazo.
[ ] Reclamo valida unidad propia.
[ ] Reclamo duplicado abierto se bloquea.
[ ] /me valida relación usuario-unidad.
[ ] /me no permite multa ajena.
[ ] /me no muestra datos administrativos internos.
[ ] /me no expone evidencia restringida.
[ ] Evidence download requiere permiso.
[ ] Evidence download se audita.
[ ] No se expone fileUrl privada.
[ ] Money usa Decimal.
[ ] Money sale como string.
[ ] No se usa float/double.
[ ] Cargo se genera de forma idempotente.
[ ] Cargo no se duplica.
[ ] Multas no procesan pagos.
[ ] Multas no modifican comprobantes.
[ ] Multas no modifican payment_allocations.
[ ] Multas no modifican estados de cuenta.
[ ] Condonación no borra cargo automáticamente.
[ ] Reverso no modifica pagos automáticamente.
[ ] Se crea FineStatusHistory.
[ ] Se auditan operaciones críticas.
[ ] Audit metadata está sanitizada.
[ ] Logs no contienen tokens.
[ ] Logs no contienen evidencia completa.
[ ] Logs no contienen datos personales extensos.
[ ] Métricas no usan tenantId.
[ ] Métricas no usan fineId.
[ ] Métricas no usan propertyUnitId.
[ ] WordPress no ve multas.
[ ] No existen endpoints públicos de multas.
[ ] OpenAPI no documenta endpoints públicos de multas.
[ ] Tests unitarios pasan.
[ ] Tests API pasan.
[ ] Tests autorización pasan.
[ ] Tests own-resource pasan.
[ ] Tests multitenant pasan.
[ ] Tests financieros pasan.
[ ] Tests evidencia pasan.
[ ] Tests reclamos pasan.
[ ] Tests seguridad pasan.
[ ] CI pasa.
```

---

## 33. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá un módulo funcional para gestionar multas y sanciones de forma segura, auditable y financieramente integrable.

El resultado esperado incluye:

```text id="shxr1s"
- catálogo administrativo de conceptos de multa;
- configuración de montos base;
- asociación con conceptos financieros;
- registro de multas;
- asociación con unidades habitacionales;
- responsable opcional;
- evidencias controladas;
- revisión administrativa;
- aprobación;
- rechazo;
- emisión;
- generación opcional de cargos;
- idempotencia financiera;
- cancelación;
- condonación;
- reverso;
- reclamos propios;
- resolución administrativa de reclamos;
- consulta administrativa;
- consulta propia;
- protección de evidencias;
- historial de estados;
- auditoría completa;
- OpenAPI actualizado;
- pruebas completas;
- CI passing.
```

La implementación no debe aceptarse si:

```text id="is4ri0"
permite multas cross-tenant
permite multas sobre unidades ajenas
permite responsables de otro tenant
expone multas a usuarios no autorizados
expone evidencias a usuarios no autorizados
expone multas a WordPress
genera cargos duplicados
usa float para dinero
procesa pagos desde multas
modifica estados de cuenta desde multas
borra historial
modifica silenciosamente multas emitidas
omite auditoría
permite transiciones inválidas
permite reclamos ajenos
permite reclamos duplicados abiertos
crea endpoints públicos de multas
```

Antes de cerrar el paquete documental de `011-fines-sanctions`, debe completarse:

```text id="qf4m70"
docs/specs/011-fines-sanctions/security-notes.md
```
