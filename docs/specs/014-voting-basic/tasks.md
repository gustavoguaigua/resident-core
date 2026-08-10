# Tasks — Spec 014 Voting Basic

## 1. Información del documento

| Campo           | Valor                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                            |
| Spec ID         | 014                                                                                                                                      |
| Módulo          | Voting Basic                                                                                                                             |
| Documento       | Tasks                                                                                                                                    |
| Ruta            | `docs/specs/014-voting-basic/tasks.md`                                                                                                   |
| Versión         | 0.1                                                                                                                                      |
| Estado          | needs-review                                                                                                                             |
| Fecha           | 2026-07-20                                                                                                                               |
| Documento base  | `docs/specs/014-voting-basic/spec.md`                                                                                                    |
| Plan técnico    | `docs/specs/014-voting-basic/plan.md`                                                                                                    |
| Modelo de datos | `docs/specs/014-voting-basic/data-model.md`                                                                                              |
| Contrato API    | `docs/specs/014-voting-basic/api-contract.md`                                                                                            |
| Plan de pruebas | `docs/specs/014-voting-basic/test-plan.md`                                                                                               |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications`, `013-meetings-attendance` |
| Relacionado con | futuras specs de voto ponderado, reglas legales, firmas electrónicas, actas certificadas, impugnaciones y auditoría verificable          |

---

## 2. Propósito

Este documento convierte la especificación `014-voting-basic` en una lista ejecutable de tareas técnicas.

El objetivo es guiar la implementación del módulo de votaciones internas básicas de RESIDENT Core, incluyendo sesiones de votación, preguntas, opciones, votantes elegibles, emisión de voto, prevención de duplicidad, privacidad, cálculo de resultados, publicación controlada, vínculo con resoluciones, auditoría y seguridad.

Regla central:

```text id="gwfr95"
Cada tarea debe preservar tenant isolation, autorización por permisos, autorización por recurso propio, elegibilidad, prevención de voto duplicado, privacidad del voto, cálculo determinístico, auditoría y ausencia de endpoints públicos.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text id="su1pyr"
[ ] Pendiente
[x] Completada
[-] Diferida
[!] Bloqueada
```

---

### 3.2. Criterios generales de completitud

Una tarea se considera completada solo si:

```text id="lmixod"
- el código compila;
- los tests asociados pasan;
- todas las consultas aplican tenant_id;
- la autorización por permiso se aplica;
- la autorización por recurso propio se aplica;
- la elegibilidad se valida;
- la duplicidad de voto se impide;
- privacyMode se respeta;
- no se introducen endpoints públicos;
- no se ejecutan acciones automáticas desde resultados;
- auditoría se registra cuando corresponde;
- logs y métricas no filtran datos sensibles;
- OpenAPI queda actualizado;
- CI pasa.
```

---

### 3.3. Reglas para agentes IA

Antes de ejecutar estas tareas, cualquier agente IA debe leer:

```text id="y4fbqp"
docs/sdd/constitution.md
docs/sdd/domain-map.md
docs/sdd/architecture.md
docs/sdd/security.md
docs/sdd/api-guidelines.md
docs/sdd/data-governance.md
docs/specs/001-tenants/
docs/specs/002-users-roles/
docs/specs/003-residents-properties/
docs/specs/007-audit/
docs/specs/012-communications-notifications/
docs/specs/013-meetings-attendance/
docs/specs/014-voting-basic/spec.md
docs/specs/014-voting-basic/plan.md
docs/specs/014-voting-basic/data-model.md
docs/specs/014-voting-basic/api-contract.md
docs/specs/014-voting-basic/test-plan.md
docs/specs/014-voting-basic/tasks.md
```

El agente no debe:

```text id="ee1x85"
- aceptar tenantId desde body;
- buscar recursos solo por id;
- permitir votaciones cross-tenant;
- permitir preguntas cross-tenant;
- permitir opciones cross-tenant;
- permitir elegibles cross-tenant;
- permitir votos cross-tenant;
- permitir voto duplicado;
- permitir voto fuera de ventana;
- permitir voto de usuario no elegible;
- permitir voto por unidad ajena;
- permitir voto por persona ajena;
- permitir voto por proxy no aprobado;
- exponer selectedOptionId en secretBasic;
- registrar selectedOptionId en logs secretBasic;
- registrar selectedOptionId en auditoría secretBasic;
- crear endpoints públicos de votación;
- documentar endpoints públicos en OpenAPI;
- ejecutar cargos, multas, resoluciones o procesos legales desde resultados;
- implementar firma electrónica;
- implementar voto criptográfico;
- implementar voto ponderado avanzado;
- implementar IA con datos reales.
```

---

# 4. Fase 0 — Preparación

## 4.1. Revisión documental

* [ ] T014-0001 — Revisar `docs/specs/014-voting-basic/spec.md`.
* [ ] T014-0002 — Revisar `docs/specs/014-voting-basic/plan.md`.
* [ ] T014-0003 — Revisar `docs/specs/014-voting-basic/data-model.md`.
* [ ] T014-0004 — Revisar `docs/specs/014-voting-basic/api-contract.md`.
* [ ] T014-0005 — Revisar `docs/specs/014-voting-basic/test-plan.md`.
* [ ] T014-0006 — Confirmar dependencias con `001-tenants`.
* [ ] T014-0007 — Confirmar dependencias con `002-users-roles`.
* [ ] T014-0008 — Confirmar dependencias con `003-residents-properties`.
* [ ] T014-0009 — Confirmar dependencias con `007-audit`.
* [ ] T014-0010 — Confirmar dependencias con `012-communications-notifications`.
* [ ] T014-0011 — Confirmar dependencias con `013-meetings-attendance`.

---

## 4.2. Validación de alcance MVP

* [ ] T014-0020 — Confirmar que el MVP incluye votaciones asociadas a reuniones.
* [ ] T014-0021 — Confirmar que votaciones independientes quedan detrás de feature flag.
* [ ] T014-0022 — Confirmar que se soportan preguntas simples.
* [ ] T014-0023 — Confirmar que se soportan opciones simples.
* [ ] T014-0024 — Confirmar que se soporta `yesNoAbstain`.
* [ ] T014-0025 — Confirmar que se soporta `singleChoice`.
* [ ] T014-0026 — Confirmar que se soporta `multipleChoice` limitado.
* [ ] T014-0027 — Confirmar que se soporta elegibilidad manual.
* [ ] T014-0028 — Confirmar que se soporta elegibilidad resuelta desde reunión, asistencia, propietarios, residentes, unidades y roles.
* [ ] T014-0029 — Confirmar que se soporta `privacyMode = identified`.
* [ ] T014-0030 — Confirmar que se soporta `privacyMode = secretBasic`.
* [ ] T014-0031 — Confirmar que `secretBasic` no se presenta como anonimato criptográfico.
* [ ] T014-0032 — Confirmar que voto ponderado avanzado queda fuera del MVP.
* [ ] T014-0033 — Confirmar que firma electrónica queda fuera del MVP.
* [ ] T014-0034 — Confirmar que actas certificadas quedan fuera del MVP.
* [ ] T014-0035 — Confirmar que reglas legales complejas quedan fuera del MVP.
* [ ] T014-0036 — Confirmar que no habrá endpoints públicos de votación.
* [ ] T014-0037 — Confirmar que resultados no ejecutan acciones automáticas.

---

# 5. Fase 1 — Estructura base del módulo

## 5.1. Crear estructura de carpetas

* [ ] T014-0101 — Crear carpeta `apps/api/src/modules/voting/`.
* [ ] T014-0102 — Crear `voting.module.ts`.
* [ ] T014-0103 — Crear carpeta `controllers/`.
* [ ] T014-0104 — Crear carpeta `application/use-cases/`.
* [ ] T014-0105 — Crear carpeta `application/services/`.
* [ ] T014-0106 — Crear carpeta `application/ports/`.
* [ ] T014-0107 — Crear carpeta `domain/entities/`.
* [ ] T014-0108 — Crear carpeta `domain/value-objects/`.
* [ ] T014-0109 — Crear carpeta `domain/events/`.
* [ ] T014-0110 — Crear carpeta `domain/errors/`.
* [ ] T014-0111 — Crear carpeta `infrastructure/persistence/`.
* [ ] T014-0112 — Crear carpeta `infrastructure/integrations/`.
* [ ] T014-0113 — Crear carpeta `infrastructure/audit/`.
* [ ] T014-0114 — Crear carpeta `dto/`.
* [ ] T014-0115 — Crear carpeta `guards/`.
* [ ] T014-0116 — Crear carpeta `policies/`.
* [ ] T014-0117 — Crear carpeta `mappers/`.
* [ ] T014-0118 — Crear carpeta `tests/`.

---

## 5.2. Registrar módulo

* [ ] T014-0120 — Registrar `VotingModule` en el módulo principal de la API.
* [ ] T014-0121 — Inyectar Prisma.
* [ ] T014-0122 — Inyectar AuditService o puerto de auditoría.
* [ ] T014-0123 — Inyectar puerto de notificaciones.
* [ ] T014-0124 — Inyectar puerto de reuniones.
* [ ] T014-0125 — Inyectar puerto de asistencia.
* [ ] T014-0126 — Inyectar puerto de proxies.
* [ ] T014-0127 — Inyectar puerto de usuarios y roles.
* [ ] T014-0128 — Inyectar puerto de personas y unidades.
* [ ] T014-0129 — Validar que el módulo compila vacío.
* [ ] T014-0130 — Crear smoke test de carga del módulo.

---

# 6. Fase 2 — Enums y Value Objects

## 6.1. Enums de dominio

* [ ] T014-0201 — Implementar `VotingSessionStatus`.
* [ ] T014-0202 — Implementar `VotingVisibility`.
* [ ] T014-0203 — Implementar `VotingMode`.
* [ ] T014-0204 — Implementar `VotingPrivacyMode`.
* [ ] T014-0205 — Implementar `EligibilityMode`.
* [ ] T014-0206 — Implementar `VotingRule`.
* [ ] T014-0207 — Implementar `BallotQuestionType`.
* [ ] T014-0208 — Implementar `BallotQuestionStatus`.
* [ ] T014-0209 — Implementar `BallotOptionType`.
* [ ] T014-0210 — Implementar `VoterType`.
* [ ] T014-0211 — Implementar `EligibilitySource`.
* [ ] T014-0212 — Implementar `EligibleVoterStatus`.
* [ ] T014-0213 — Implementar `VoteCastStatus`.
* [ ] T014-0214 — Implementar `VotingResultStatus`.

---

## 6.2. Value Objects

* [ ] T014-0220 — Implementar `VotingTitle`.
* [ ] T014-0221 — Implementar `VotingDescription`.
* [ ] T014-0222 — Implementar `BallotQuestionTitle`.
* [ ] T014-0223 — Implementar `BallotOptionLabel`.
* [ ] T014-0224 — Implementar `VotingWindow`.
* [ ] T014-0225 — Implementar `VotingWeight`.
* [ ] T014-0226 — Implementar `VotingSelection`.
* [ ] T014-0227 — Implementar `VotingThreshold`.
* [ ] T014-0228 — Implementar `VotingResultSummary`.
* [ ] T014-0229 — Implementar `VotingContent`.
* [ ] T014-0230 — Implementar sanitización de contenido.
* [ ] T014-0231 — Bloquear `<script>`.
* [ ] T014-0232 — Bloquear `<iframe>`.
* [ ] T014-0233 — Bloquear `<object>`.
* [ ] T014-0234 — Bloquear `<embed>`.
* [ ] T014-0235 — Bloquear event handlers inline.
* [ ] T014-0236 — Bloquear `javascript:`.
* [ ] T014-0237 — Bloquear `data:` peligrosos.

---

## 6.3. Tests de enums y value objects

* [ ] T014-0240 — Test `VotingSessionStatus`.
* [ ] T014-0241 — Test `VotingVisibility`.
* [ ] T014-0242 — Test `VotingMode`.
* [ ] T014-0243 — Test `VotingPrivacyMode`.
* [ ] T014-0244 — Test `EligibilityMode`.
* [ ] T014-0245 — Test `VotingRule`.
* [ ] T014-0246 — Test `BallotQuestionType`.
* [ ] T014-0247 — Test `VoterType`.
* [ ] T014-0248 — Test `VotingTitle`.
* [ ] T014-0249 — Test `VotingWindow`.
* [ ] T014-0250 — Test `VotingSelection`.
* [ ] T014-0251 — Test `VotingWeight`.
* [ ] T014-0252 — Test `VotingThreshold`.
* [ ] T014-0253 — Test `VotingContent`.
* [ ] T014-0254 — Ejecutar `npm run test:voting:unit`.

---

# 7. Fase 3 — Entidades de dominio

## 7.1. Entidad `VotingSession`

* [ ] T014-0301 — Crear `voting-session.entity.ts`.
* [ ] T014-0302 — Implementar creación en estado `draft`.
* [ ] T014-0303 — Validar título obligatorio.
* [ ] T014-0304 — Validar `meetingId` opcional.
* [ ] T014-0305 — Validar `visibility`.
* [ ] T014-0306 — Validar `votingMode`.
* [ ] T014-0307 — Validar `privacyMode`.
* [ ] T014-0308 — Validar `eligibilityMode`.
* [ ] T014-0309 — Validar `votingRule`.
* [ ] T014-0310 — Validar ventana `opensAt` / `closesAt`.
* [ ] T014-0311 — Implementar transición `draft -> scheduled`.
* [ ] T014-0312 — Implementar transición `scheduled -> open`.
* [ ] T014-0313 — Implementar transición `draft -> open`.
* [ ] T014-0314 — Implementar transición `open -> closed`.
* [ ] T014-0315 — Implementar transición `closed -> resultsCalculated`.
* [ ] T014-0316 — Implementar transición `resultsCalculated -> resultsPublished`.
* [ ] T014-0317 — Implementar transición `resultsPublished -> archived`.
* [ ] T014-0318 — Implementar cancelación con razón.
* [ ] T014-0319 — Implementar archivo lógico.
* [ ] T014-0320 — Crear tests de entidad `VotingSession`.

---

## 7.2. Entidad `BallotQuestion`

* [ ] T014-0330 — Crear `ballot-question.entity.ts`.
* [ ] T014-0331 — Implementar creación de pregunta.
* [ ] T014-0332 — Validar `order`.
* [ ] T014-0333 — Validar título.
* [ ] T014-0334 — Validar `questionType`.
* [ ] T014-0335 — Validar `minSelections`.
* [ ] T014-0336 — Validar `maxSelections`.
* [ ] T014-0337 — Validar `allowAbstention`.
* [ ] T014-0338 — Implementar transición `draft -> active`.
* [ ] T014-0339 — Implementar transición `active -> closed`.
* [ ] T014-0340 — Implementar archivo lógico.
* [ ] T014-0341 — Crear tests de entidad `BallotQuestion`.

---

## 7.3. Entidad `BallotOption`

* [ ] T014-0350 — Crear `ballot-option.entity.ts`.
* [ ] T014-0351 — Implementar creación de opción estándar.
* [ ] T014-0352 — Implementar creación de opción `yes`.
* [ ] T014-0353 — Implementar creación de opción `no`.
* [ ] T014-0354 — Implementar creación de opción `abstain`.
* [ ] T014-0355 — Validar `order`.
* [ ] T014-0356 — Validar `label`.
* [ ] T014-0357 — Validar `optionType`.
* [ ] T014-0358 — Validar `isAbstention`.
* [ ] T014-0359 — Implementar archivo lógico.
* [ ] T014-0360 — Crear tests de entidad `BallotOption`.

---

## 7.4. Entidad `EligibleVoter`

* [ ] T014-0370 — Crear `eligible-voter.entity.ts`.
* [ ] T014-0371 — Implementar elegible `user`.
* [ ] T014-0372 — Implementar elegible `person`.
* [ ] T014-0373 — Implementar elegible `propertyUnit`.
* [ ] T014-0374 — Implementar elegible `owner`.
* [ ] T014-0375 — Implementar elegible `resident`.
* [ ] T014-0376 — Implementar elegible `role`.
* [ ] T014-0377 — Implementar elegible `proxyRepresentative`.
* [ ] T014-0378 — Validar combinaciones inválidas.
* [ ] T014-0379 — Validar `eligibilitySource`.
* [ ] T014-0380 — Validar `weight`.
* [ ] T014-0381 — Estado inicial `eligible`.
* [ ] T014-0382 — Implementar `markVoted`.
* [ ] T014-0383 — Implementar `exclude`.
* [ ] T014-0384 — Implementar `archive`.
* [ ] T014-0385 — Crear tests de entidad `EligibleVoter`.

---

## 7.5. Entidad `VoteCast`

* [ ] T014-0390 — Crear `vote-cast.entity.ts`.
* [ ] T014-0391 — Implementar voto `singleChoice`.
* [ ] T014-0392 — Implementar voto `yesNoAbstain`.
* [ ] T014-0393 — Implementar voto `multipleChoice`.
* [ ] T014-0394 — Validar `eligibleVoterId`.
* [ ] T014-0395 — Validar `ballotQuestionId`.
* [ ] T014-0396 — Validar `selectedOptionId`.
* [ ] T014-0397 — Validar `selectedOptionIds`.
* [ ] T014-0398 — Rechazar `selectedOptionIds` duplicados.
* [ ] T014-0399 — Estado inicial `cast`.
* [ ] T014-0400 — Implementar cancelación con razón.
* [ ] T014-0401 — Implementar archivo lógico.
* [ ] T014-0402 — Crear tests de entidad `VoteCast`.

---

## 7.6. Entidad `VotingTally`

* [ ] T014-0410 — Crear `voting-tally.entity.ts`.
* [ ] T014-0411 — Implementar tally por opción.
* [ ] T014-0412 — Validar `totalVotes >= 0`.
* [ ] T014-0413 — Validar `weightedTotal >= 0`.
* [ ] T014-0414 — Validar `percentage` entre 0 y 100.
* [ ] T014-0415 — Usar decimal exacto.
* [ ] T014-0416 — Crear tests de entidad `VotingTally`.

---

## 7.7. Entidad `VotingResult`

* [ ] T014-0420 — Crear `voting-result.entity.ts`.
* [ ] T014-0421 — Implementar resultado `pending`.
* [ ] T014-0422 — Implementar resultado `passed`.
* [ ] T014-0423 — Implementar resultado `failed`.
* [ ] T014-0424 — Implementar resultado `tie`.
* [ ] T014-0425 — Implementar resultado `informational`.
* [ ] T014-0426 — Validar `totalEligible`.
* [ ] T014-0427 — Validar `totalVotes`.
* [ ] T014-0428 — Validar `totalAbstentions`.
* [ ] T014-0429 — Validar `participationPercentage`.
* [ ] T014-0430 — Validar `requiredThreshold`.
* [ ] T014-0431 — Implementar publicación.
* [ ] T014-0432 — Implementar archivo.
* [ ] T014-0433 — Crear tests de entidad `VotingResult`.

---

## 7.8. Entidad `VotingResolutionLink`

* [ ] T014-0440 — Crear `voting-resolution-link.entity.ts`.
* [ ] T014-0441 — Implementar creación de vínculo.
* [ ] T014-0442 — Validar `votingSessionId`.
* [ ] T014-0443 — Validar `ballotQuestionId`.
* [ ] T014-0444 — Validar `votingResultId`.
* [ ] T014-0445 — Validar `meetingResolutionId`.
* [ ] T014-0446 — Validar `linkedBy`.
* [ ] T014-0447 — Implementar archivo.
* [ ] T014-0448 — Garantizar que no ejecuta acciones automáticas.
* [ ] T014-0449 — Crear tests de entidad `VotingResolutionLink`.

---

# 8. Fase 4 — Modelo Prisma y migraciones

## 8.1. Enums Prisma

* [ ] T014-0501 — Agregar enum `VotingSessionStatus`.
* [ ] T014-0502 — Agregar enum `VotingVisibility`.
* [ ] T014-0503 — Agregar enum `VotingMode`.
* [ ] T014-0504 — Agregar enum `VotingPrivacyMode`.
* [ ] T014-0505 — Agregar enum `EligibilityMode`.
* [ ] T014-0506 — Agregar enum `VotingRule`.
* [ ] T014-0507 — Agregar enum `BallotQuestionType`.
* [ ] T014-0508 — Agregar enum `BallotQuestionStatus`.
* [ ] T014-0509 — Agregar enum `BallotOptionType`.
* [ ] T014-0510 — Agregar enum `VoterType`.
* [ ] T014-0511 — Agregar enum `EligibilitySource`.
* [ ] T014-0512 — Agregar enum `EligibleVoterStatus`.
* [ ] T014-0513 — Agregar enum `VoteCastStatus`.
* [ ] T014-0514 — Agregar enum `VotingResultStatus`.

---

## 8.2. Modelos Prisma

* [ ] T014-0520 — Crear modelo `VotingSession`.
* [ ] T014-0521 — Crear modelo `BallotQuestion`.
* [ ] T014-0522 — Crear modelo `BallotOption`.
* [ ] T014-0523 — Crear modelo `EligibleVoter`.
* [ ] T014-0524 — Crear modelo `VoteCast`.
* [ ] T014-0525 — Crear modelo `VotingTally`.
* [ ] T014-0526 — Crear modelo `VotingResult`.
* [ ] T014-0527 — Crear modelo `VotingResolutionLink`.
* [ ] T014-0528 — Agregar relaciones en `Tenant`.
* [ ] T014-0529 — Agregar relaciones en `UserProfile`.
* [ ] T014-0530 — Agregar relaciones en `Person`.
* [ ] T014-0531 — Agregar relaciones en `PropertyUnit`.
* [ ] T014-0532 — Agregar relaciones en `Meeting`.
* [ ] T014-0533 — Agregar relaciones en `MeetingProxy`.
* [ ] T014-0534 — Agregar relaciones en `MeetingResolution`.
* [ ] T014-0535 — Ajustar relación `roleId` al modelo real de roles de `002-users-roles`.

---

## 8.3. Índices y constraints

* [ ] T014-0540 — Crear índices de `voting_sessions`.
* [ ] T014-0541 — Crear índices de `ballot_questions`.
* [ ] T014-0542 — Crear índice único `(tenant_id, voting_session_id, order)`.
* [ ] T014-0543 — Crear índices de `ballot_options`.
* [ ] T014-0544 — Crear índice único `(tenant_id, ballot_question_id, order)`.
* [ ] T014-0545 — Crear índices de `eligible_voters`.
* [ ] T014-0546 — Crear índices de `vote_casts`.
* [ ] T014-0547 — Crear índices de `voting_tallies`.
* [ ] T014-0548 — Crear índices de `voting_results`.
* [ ] T014-0549 — Crear índices de `voting_resolution_links`.
* [ ] T014-0550 — Crear constraint `opens_at < closes_at`.
* [ ] T014-0551 — Crear constraint `weight >= 0`.
* [ ] T014-0552 — Crear constraint `total_votes >= 0`.
* [ ] T014-0553 — Crear constraint `weighted_total >= 0`.
* [ ] T014-0554 — Crear constraint `percentage BETWEEN 0 AND 100`.
* [ ] T014-0555 — Crear constraint `participation_percentage BETWEEN 0 AND 100`.
* [ ] T014-0556 — Crear constraint `required_threshold BETWEEN 0 AND 100`.
* [ ] T014-0557 — Crear índice parcial de elegible activo por usuario.
* [ ] T014-0558 — Crear índice parcial de elegible activo por persona.
* [ ] T014-0559 — Crear índice parcial de elegible activo por unidad.
* [ ] T014-0560 — Crear índice parcial de elegible activo por proxy.
* [ ] T014-0561 — Crear índice parcial de voto activo único por pregunta/elegible.
* [ ] T014-0562 — Crear índice parcial de abstención única por pregunta.
* [ ] T014-0563 — Crear índice funcional opcional para `lower(label)` por pregunta.

---

## 8.4. Migración

* [ ] T014-0570 — Crear migración `014_create_voting_basic`.
* [ ] T014-0571 — Ejecutar migración en base local.
* [ ] T014-0572 — Ejecutar migración en base de test.
* [ ] T014-0573 — Generar Prisma Client.
* [ ] T014-0574 — Validar constraints raw.
* [ ] T014-0575 — Validar rollback local si aplica.
* [ ] T014-0576 — Documentar decisiones de índices parciales.
* [ ] T014-0577 — Ejecutar tests iniciales de repositorio.

---

# 9. Fase 5 — Puertos y repositorios

## 9.1. Puertos de aplicación

* [ ] T014-0601 — Crear `VotingSessionRepositoryPort`.
* [ ] T014-0602 — Crear `BallotQuestionRepositoryPort`.
* [ ] T014-0603 — Crear `BallotOptionRepositoryPort`.
* [ ] T014-0604 — Crear `EligibleVoterRepositoryPort`.
* [ ] T014-0605 — Crear `VoteCastRepositoryPort`.
* [ ] T014-0606 — Crear `VotingTallyRepositoryPort`.
* [ ] T014-0607 — Crear `VotingResultRepositoryPort`.
* [ ] T014-0608 — Crear `VotingResolutionLinkRepositoryPort`.
* [ ] T014-0609 — Crear `VotingMeetingPort`.
* [ ] T014-0610 — Crear `VotingAttendancePort`.
* [ ] T014-0611 — Crear `VotingProxyPort`.
* [ ] T014-0612 — Crear `VotingUserDirectoryPort`.
* [ ] T014-0613 — Crear `VotingPersonDirectoryPort`.
* [ ] T014-0614 — Crear `VotingPropertyUnitPort`.
* [ ] T014-0615 — Crear `VotingRoleDirectoryPort`.
* [ ] T014-0616 — Crear `VotingNotificationPort`.
* [ ] T014-0617 — Crear `VotingAuditPort`.

---

## 9.2. Repositorios Prisma

* [ ] T014-0620 — Implementar `PrismaVotingSessionRepository`.
* [ ] T014-0621 — Implementar `PrismaBallotQuestionRepository`.
* [ ] T014-0622 — Implementar `PrismaBallotOptionRepository`.
* [ ] T014-0623 — Implementar `PrismaEligibleVoterRepository`.
* [ ] T014-0624 — Implementar `PrismaVoteCastRepository`.
* [ ] T014-0625 — Implementar `PrismaVotingTallyRepository`.
* [ ] T014-0626 — Implementar `PrismaVotingResultRepository`.
* [ ] T014-0627 — Implementar `PrismaVotingResolutionLinkRepository`.
* [ ] T014-0628 — Implementar mappers de persistencia.
* [ ] T014-0629 — Validar que ningún repositorio busque recursos solo por `id`.
* [ ] T014-0630 — Validar que toda consulta use `tenantId`.

---

## 9.3. Adapters de integración

* [ ] T014-0640 — Implementar `VotingMeetingAdapter`.
* [ ] T014-0641 — Implementar `VotingAttendanceAdapter`.
* [ ] T014-0642 — Implementar `VotingProxyAdapter`.
* [ ] T014-0643 — Implementar `VotingUserDirectoryAdapter`.
* [ ] T014-0644 — Implementar `VotingPersonDirectoryAdapter`.
* [ ] T014-0645 — Implementar `VotingPropertyUnitAdapter`.
* [ ] T014-0646 — Implementar `VotingRoleDirectoryAdapter`.
* [ ] T014-0647 — Implementar `VotingNotificationAdapter`.
* [ ] T014-0648 — Implementar `VotingAuditAdapter`.

---

## 9.4. Tests de repositorio

* [ ] T014-0660 — Test crear `VotingSession`.
* [ ] T014-0661 — Test buscar `VotingSession` por tenant.
* [ ] T014-0662 — Test tenant A no ve `VotingSession` tenant B.
* [ ] T014-0663 — Test listar sesiones con filtros.
* [ ] T014-0664 — Test actualizar estado.
* [ ] T014-0665 — Test archivar sesión.
* [ ] T014-0666 — Test crear `BallotQuestion`.
* [ ] T014-0667 — Test orden único de pregunta.
* [ ] T014-0668 — Test crear `BallotOption`.
* [ ] T014-0669 — Test orden único de opción.
* [ ] T014-0670 — Test segunda abstención rechazada.
* [ ] T014-0671 — Test crear `EligibleVoter`.
* [ ] T014-0672 — Test elegible duplicado rechazado.
* [ ] T014-0673 — Test crear `VoteCast`.
* [ ] T014-0674 — Test voto duplicado rechazado.
* [ ] T014-0675 — Test cancelar voto.
* [ ] T014-0676 — Test crear tallies.
* [ ] T014-0677 — Test crear resultados.
* [ ] T014-0678 — Test publicar resultados.
* [ ] T014-0679 — Test vincular resolución.
* [ ] T014-0680 — Ejecutar `npm run test:voting:repositories`.

---

# 10. Fase 6 — Servicios de aplicación

## 10.1. Servicios base

* [ ] T014-0701 — Implementar `VotingSessionService`.
* [ ] T014-0702 — Implementar `VotingSessionStateMachineService`.
* [ ] T014-0703 — Implementar `BallotQuestionService`.
* [ ] T014-0704 — Implementar `BallotOptionService`.
* [ ] T014-0705 — Implementar `EligibleVoterService`.
* [ ] T014-0706 — Implementar `EligibilityResolverService`.
* [ ] T014-0707 — Implementar `VoteCastingService`.
* [ ] T014-0708 — Implementar `VotingPrivacyService`.
* [ ] T014-0709 — Implementar `VotingTallyService`.
* [ ] T014-0710 — Implementar `VotingResultService`.
* [ ] T014-0711 — Implementar `VotingResolutionLinkService`.
* [ ] T014-0712 — Implementar `VotingNotificationService`.
* [ ] T014-0713 — Implementar `VotingAuditService`.
* [ ] T014-0714 — Implementar `VotingContentSanitizerService`.

---

## 10.2. Tests de servicios

* [ ] T014-0720 — Test `VotingSessionService`.
* [ ] T014-0721 — Test `VotingSessionStateMachineService`.
* [ ] T014-0722 — Test `BallotQuestionService`.
* [ ] T014-0723 — Test `BallotOptionService`.
* [ ] T014-0724 — Test `EligibleVoterService`.
* [ ] T014-0725 — Test `EligibilityResolverService`.
* [ ] T014-0726 — Test `VoteCastingService`.
* [ ] T014-0727 — Test `VotingPrivacyService`.
* [ ] T014-0728 — Test `VotingTallyService`.
* [ ] T014-0729 — Test `VotingResultService`.
* [ ] T014-0730 — Test `VotingResolutionLinkService`.
* [ ] T014-0731 — Test `VotingNotificationService`.
* [ ] T014-0732 — Test `VotingAuditService`.
* [ ] T014-0733 — Test `VotingContentSanitizerService`.
* [ ] T014-0734 — Ejecutar `npm run test:voting:application`.

---

# 11. Fase 7 — Casos de uso

## 11.1. Voting Sessions

* [ ] T014-0801 — Implementar `CreateVotingSessionUseCase`.
* [ ] T014-0802 — Implementar `ListVotingSessionsUseCase`.
* [ ] T014-0803 — Implementar `GetVotingSessionUseCase`.
* [ ] T014-0804 — Implementar `UpdateVotingSessionUseCase`.
* [ ] T014-0805 — Implementar `ScheduleVotingSessionUseCase`.
* [ ] T014-0806 — Implementar `OpenVotingSessionUseCase`.
* [ ] T014-0807 — Implementar `CloseVotingSessionUseCase`.
* [ ] T014-0808 — Implementar `CancelVotingSessionUseCase`.
* [ ] T014-0809 — Implementar `ArchiveVotingSessionUseCase`.

---

## 11.2. Ballot Questions

* [ ] T014-0820 — Implementar `CreateBallotQuestionUseCase`.
* [ ] T014-0821 — Implementar `ListBallotQuestionsUseCase`.
* [ ] T014-0822 — Implementar `GetBallotQuestionUseCase`.
* [ ] T014-0823 — Implementar `UpdateBallotQuestionUseCase`.
* [ ] T014-0824 — Implementar `ArchiveBallotQuestionUseCase`.

---

## 11.3. Ballot Options

* [ ] T014-0840 — Implementar `CreateBallotOptionUseCase`.
* [ ] T014-0841 — Implementar `ListBallotOptionsUseCase`.
* [ ] T014-0842 — Implementar `GetBallotOptionUseCase`.
* [ ] T014-0843 — Implementar `UpdateBallotOptionUseCase`.
* [ ] T014-0844 — Implementar `ArchiveBallotOptionUseCase`.

---

## 11.4. Eligible Voters

* [ ] T014-0860 — Implementar `CreateEligibleVoterUseCase`.
* [ ] T014-0861 — Implementar `ListEligibleVotersUseCase`.
* [ ] T014-0862 — Implementar `ResolveEligibleVotersUseCase`.
* [ ] T014-0863 — Implementar `GetEligibleVoterUseCase`.
* [ ] T014-0864 — Implementar `UpdateEligibleVoterUseCase`.
* [ ] T014-0865 — Implementar `ExcludeEligibleVoterUseCase`.
* [ ] T014-0866 — Implementar `ArchiveEligibleVoterUseCase`.

---

## 11.5. Votes

* [ ] T014-0880 — Implementar `ListVotesUseCase`.
* [ ] T014-0881 — Implementar `GetVoteCastUseCase`.
* [ ] T014-0882 — Implementar `CancelVoteCastUseCase`.
* [ ] T014-0883 — Implementar `CastOwnVoteUseCase`.

---

## 11.6. Results

* [ ] T014-0900 — Implementar `CalculateVotingResultsUseCase`.
* [ ] T014-0901 — Implementar `GetVotingResultsUseCase`.
* [ ] T014-0902 — Implementar `PublishVotingResultsUseCase`.
* [ ] T014-0903 — Implementar `LinkVotingResultToResolutionUseCase`.

---

## 11.7. Endpoints `/me`

* [ ] T014-0920 — Implementar `ListOwnVotingSessionsUseCase`.
* [ ] T014-0921 — Implementar `GetOwnVotingSessionUseCase`.
* [ ] T014-0922 — Implementar `ListOwnBallotQuestionsUseCase`.
* [ ] T014-0923 — Implementar `GetOwnVotingParticipationUseCase`.
* [ ] T014-0924 — Implementar `GetOwnVotingResultsUseCase`.

---

# 12. Fase 8 — DTOs

## 12.1. DTOs de Voting Sessions

* [ ] T014-1001 — Crear `CreateVotingSessionDto`.
* [ ] T014-1002 — Crear `UpdateVotingSessionDto`.
* [ ] T014-1003 — Crear `ScheduleVotingSessionDto`.
* [ ] T014-1004 — Crear `OpenVotingSessionDto`.
* [ ] T014-1005 — Crear `CloseVotingSessionDto`.
* [ ] T014-1006 — Crear `CancelVotingSessionDto`.
* [ ] T014-1007 — Crear `ArchiveVotingSessionDto`.
* [ ] T014-1008 — Crear `VotingSessionAdminDto`.
* [ ] T014-1009 — Crear `VotingSessionListItemDto`.

---

## 12.2. DTOs de Questions

* [ ] T014-1020 — Crear `CreateBallotQuestionDto`.
* [ ] T014-1021 — Crear `UpdateBallotQuestionDto`.
* [ ] T014-1022 — Crear `BallotQuestionDto`.
* [ ] T014-1023 — Crear `BallotQuestionListItemDto`.

---

## 12.3. DTOs de Options

* [ ] T014-1040 — Crear `CreateBallotOptionDto`.
* [ ] T014-1041 — Crear `UpdateBallotOptionDto`.
* [ ] T014-1042 — Crear `BallotOptionDto`.

---

## 12.4. DTOs de Eligible Voters

* [ ] T014-1060 — Crear `CreateEligibleVoterDto`.
* [ ] T014-1061 — Crear `ResolveEligibleVotersDto`.
* [ ] T014-1062 — Crear `UpdateEligibleVoterDto`.
* [ ] T014-1063 — Crear `ExcludeEligibleVoterDto`.
* [ ] T014-1064 — Crear `EligibleVoterDto`.
* [ ] T014-1065 — Crear `EligibleVoterListItemDto`.

---

## 12.5. DTOs de Votes

* [ ] T014-1080 — Crear `CastVoteDto`.
* [ ] T014-1081 — Crear `CancelVoteDto`.
* [ ] T014-1082 — Crear `VoteCastAdminIdentifiedDto`.
* [ ] T014-1083 — Crear `VoteCastAdminSecretBasicDto`.
* [ ] T014-1084 — Crear `VoteCastOwnIdentifiedDto`.
* [ ] T014-1085 — Crear `VoteCastOwnSecretBasicDto`.

---

## 12.6. DTOs de Results

* [ ] T014-1100 — Crear `CalculateVotingResultsDto`.
* [ ] T014-1101 — Crear `PublishVotingResultsDto`.
* [ ] T014-1102 — Crear `LinkVotingResultToResolutionDto`.
* [ ] T014-1103 — Crear `VotingTallyDto`.
* [ ] T014-1104 — Crear `VotingResultDto`.
* [ ] T014-1105 — Crear `VotingResultAdminDto`.

---

## 12.7. DTOs `/me`

* [ ] T014-1120 — Crear `OwnVotingSessionDto`.
* [ ] T014-1121 — Crear `OwnBallotQuestionDto`.
* [ ] T014-1122 — Crear `OwnBallotOptionDto`.
* [ ] T014-1123 — Crear `OwnVotingParticipationDto`.
* [ ] T014-1124 — Crear `OwnVotingResultDto`.

---

## 12.8. Tests de DTOs

* [ ] T014-1140 — Test `CreateVotingSessionDto`.
* [ ] T014-1141 — Test `UpdateVotingSessionDto`.
* [ ] T014-1142 — Test `OpenVotingSessionDto`.
* [ ] T014-1143 — Test `CancelVotingSessionDto`.
* [ ] T014-1144 — Test `CreateBallotQuestionDto`.
* [ ] T014-1145 — Test `CreateBallotOptionDto`.
* [ ] T014-1146 — Test `CreateEligibleVoterDto`.
* [ ] T014-1147 — Test `ResolveEligibleVotersDto`.
* [ ] T014-1148 — Test `CastVoteDto`.
* [ ] T014-1149 — Test `CancelVoteDto`.
* [ ] T014-1150 — Test `PublishVotingResultsDto`.
* [ ] T014-1151 — Test `LinkVotingResultToResolutionDto`.
* [ ] T014-1152 — Verificar rechazo de `tenantId` en todos los bodies.
* [ ] T014-1153 — Ejecutar `npm run test:voting:dto`.

---

# 13. Fase 9 — Guards, policies y autorización

## 13.1. Guards

* [ ] T014-1201 — Implementar `VotingPermissionGuard`.
* [ ] T014-1202 — Implementar `OwnVotingGuard`.
* [ ] T014-1203 — Implementar `EligibleVoterGuard`.
* [ ] T014-1204 — Implementar `VoteCastingGuard`.
* [ ] T014-1205 — Implementar `VotingPrivacyGuard`.
* [ ] T014-1206 — Implementar `VotingResultGuard`.
* [ ] T014-1207 — Implementar `VotingResolutionLinkGuard`.

---

## 13.2. Policies

* [ ] T014-1220 — Implementar `VotingTenantPolicy`.
* [ ] T014-1221 — Implementar `VotingSessionStatePolicy`.
* [ ] T014-1222 — Implementar `VotingEligibilityPolicy`.
* [ ] T014-1223 — Implementar `VotingOwnResourcePolicy`.
* [ ] T014-1224 — Implementar `VoteDuplicatePolicy`.
* [ ] T014-1225 — Implementar `VotingWindowPolicy`.
* [ ] T014-1226 — Implementar `VotingPrivacyPolicy`.
* [ ] T014-1227 — Implementar `VotingResultPublicationPolicy`.
* [ ] T014-1228 — Implementar `VotingResolutionLinkPolicy`.
* [ ] T014-1229 — Implementar `VotingNoAutomaticExecutionPolicy`.

---

## 13.3. Permisos

* [ ] T014-1240 — Registrar permisos `votingSessions.*`.
* [ ] T014-1241 — Registrar permisos `ballotQuestions.*`.
* [ ] T014-1242 — Registrar permisos `ballotOptions.*`.
* [ ] T014-1243 — Registrar permisos `eligibleVoters.*`.
* [ ] T014-1244 — Registrar permisos `votes.cast.own`.
* [ ] T014-1245 — Registrar permisos `votes.read`.
* [ ] T014-1246 — Registrar permisos `votes.read.own`.
* [ ] T014-1247 — Registrar permisos `votes.cancel`.
* [ ] T014-1248 — Registrar permisos `votes.audit.read`.
* [ ] T014-1249 — Registrar permisos `votingResults.*`.
* [ ] T014-1250 — Registrar permisos `voting.audit.read`.
* [ ] T014-1251 — Registrar permisos `voting.reports.read`.
* [ ] T014-1252 — Actualizar seeds de roles base.

---

## 13.4. Tests de autorización

* [ ] T014-1260 — Test 401 sin token.
* [ ] T014-1261 — Test 403 sin membership.
* [ ] T014-1262 — Test 403 usuario disabled.
* [ ] T014-1263 — Test sin `votingSessions.create`.
* [ ] T014-1264 — Test sin `votingSessions.open`.
* [ ] T014-1265 — Test sin `ballotQuestions.create`.
* [ ] T014-1266 — Test sin `ballotOptions.create`.
* [ ] T014-1267 — Test sin `eligibleVoters.create`.
* [ ] T014-1268 — Test sin `eligibleVoters.resolve`.
* [ ] T014-1269 — Test sin `votes.cast.own`.
* [ ] T014-1270 — Test sin `votes.read`.
* [ ] T014-1271 — Test sin `votes.cancel`.
* [ ] T014-1272 — Test sin `votingResults.calculate`.
* [ ] T014-1273 — Test sin `votingResults.publish`.
* [ ] T014-1274 — Test sin `votingResults.linkResolution`.
* [ ] T014-1275 — Test PlatformAdmin sin acceso automático.
* [ ] T014-1276 — Ejecutar `npm run test:voting:authorization`.

---

# 14. Fase 10 — Controladores REST

## 14.1. VotingSessionsController

* [ ] T014-1301 — Crear `voting-sessions.controller.ts`.
* [ ] T014-1302 — Implementar `GET /api/v1/tenant/voting-sessions`.
* [ ] T014-1303 — Implementar `POST /api/v1/tenant/voting-sessions`.
* [ ] T014-1304 — Implementar `GET /api/v1/tenant/voting-sessions/{votingSessionId}`.
* [ ] T014-1305 — Implementar `PATCH /api/v1/tenant/voting-sessions/{votingSessionId}`.
* [ ] T014-1306 — Implementar `POST /schedule`.
* [ ] T014-1307 — Implementar `POST /open`.
* [ ] T014-1308 — Implementar `POST /close`.
* [ ] T014-1309 — Implementar `POST /cancel`.
* [ ] T014-1310 — Implementar `POST /archive`.

---

## 14.2. BallotQuestionsController

* [ ] T014-1320 — Crear `ballot-questions.controller.ts`.
* [ ] T014-1321 — Implementar `GET /voting-sessions/{votingSessionId}/questions`.
* [ ] T014-1322 — Implementar `POST /voting-sessions/{votingSessionId}/questions`.
* [ ] T014-1323 — Implementar `GET /ballot-questions/{questionId}`.
* [ ] T014-1324 — Implementar `PATCH /ballot-questions/{questionId}`.
* [ ] T014-1325 — Implementar `POST /ballot-questions/{questionId}/archive`.

---

## 14.3. BallotOptionsController

* [ ] T014-1340 — Crear `ballot-options.controller.ts`.
* [ ] T014-1341 — Implementar `GET /ballot-questions/{questionId}/options`.
* [ ] T014-1342 — Implementar `POST /ballot-questions/{questionId}/options`.
* [ ] T014-1343 — Implementar `GET /ballot-options/{optionId}`.
* [ ] T014-1344 — Implementar `PATCH /ballot-options/{optionId}`.
* [ ] T014-1345 — Implementar `POST /ballot-options/{optionId}/archive`.

---

## 14.4. EligibleVotersController

* [ ] T014-1360 — Crear `eligible-voters.controller.ts`.
* [ ] T014-1361 — Implementar `GET /voting-sessions/{votingSessionId}/eligible-voters`.
* [ ] T014-1362 — Implementar `POST /voting-sessions/{votingSessionId}/eligible-voters`.
* [ ] T014-1363 — Implementar `POST /voting-sessions/{votingSessionId}/eligible-voters/resolve`.
* [ ] T014-1364 — Implementar `GET /eligible-voters/{eligibleVoterId}`.
* [ ] T014-1365 — Implementar `PATCH /eligible-voters/{eligibleVoterId}`.
* [ ] T014-1366 — Implementar `POST /eligible-voters/{eligibleVoterId}/exclude`.
* [ ] T014-1367 — Implementar `POST /eligible-voters/{eligibleVoterId}/archive`.

---

## 14.5. VotesController

* [ ] T014-1380 — Crear `votes.controller.ts`.
* [ ] T014-1381 — Implementar `GET /voting-sessions/{votingSessionId}/votes`.
* [ ] T014-1382 — Implementar `GET /votes/{voteCastId}`.
* [ ] T014-1383 — Implementar `POST /votes/{voteCastId}/cancel`.

---

## 14.6. VotingResultsController

* [ ] T014-1400 — Crear `voting-results.controller.ts`.
* [ ] T014-1401 — Implementar `POST /voting-sessions/{votingSessionId}/calculate-results`.
* [ ] T014-1402 — Implementar `GET /voting-sessions/{votingSessionId}/results`.
* [ ] T014-1403 — Implementar `POST /voting-sessions/{votingSessionId}/publish-results`.
* [ ] T014-1404 — Implementar `POST /voting-sessions/{votingSessionId}/results/{resultId}/link-resolution`.

---

## 14.7. MyVotingController

* [ ] T014-1420 — Crear `my-voting.controller.ts`.
* [ ] T014-1421 — Implementar `GET /api/v1/me/voting-sessions`.
* [ ] T014-1422 — Implementar `GET /api/v1/me/voting-sessions/{votingSessionId}`.
* [ ] T014-1423 — Implementar `GET /api/v1/me/voting-sessions/{votingSessionId}/questions`.
* [ ] T014-1424 — Implementar `GET /api/v1/me/voting-sessions/{votingSessionId}/participation`.
* [ ] T014-1425 — Implementar `POST /api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote`.
* [ ] T014-1426 — Implementar `GET /api/v1/me/voting-sessions/{votingSessionId}/results`.

---

# 15. Fase 11 — API tests

## 15.1. Voting Sessions

* [ ] T014-1501 — Test `GET /api/v1/tenant/voting-sessions`.
* [ ] T014-1502 — Test `POST /api/v1/tenant/voting-sessions`.
* [ ] T014-1503 — Test `GET /api/v1/tenant/voting-sessions/{votingSessionId}`.
* [ ] T014-1504 — Test `PATCH /api/v1/tenant/voting-sessions/{votingSessionId}`.
* [ ] T014-1505 — Test `POST /schedule`.
* [ ] T014-1506 — Test `POST /open`.
* [ ] T014-1507 — Test `POST /close`.
* [ ] T014-1508 — Test `POST /cancel`.
* [ ] T014-1509 — Test `POST /archive`.

---

## 15.2. Questions

* [ ] T014-1520 — Test `GET questions`.
* [ ] T014-1521 — Test `POST question`.
* [ ] T014-1522 — Test `GET question`.
* [ ] T014-1523 — Test `PATCH question`.
* [ ] T014-1524 — Test `POST question archive`.

---

## 15.3. Options

* [ ] T014-1540 — Test `GET options`.
* [ ] T014-1541 — Test `POST option`.
* [ ] T014-1542 — Test `GET option`.
* [ ] T014-1543 — Test `PATCH option`.
* [ ] T014-1544 — Test `POST option archive`.

---

## 15.4. Eligible Voters

* [ ] T014-1560 — Test `GET eligible-voters`.
* [ ] T014-1561 — Test `POST eligible-voter`.
* [ ] T014-1562 — Test `POST eligible-voters/resolve`.
* [ ] T014-1563 — Test `GET eligible-voter`.
* [ ] T014-1564 — Test `PATCH eligible-voter`.
* [ ] T014-1565 — Test `POST eligible-voter exclude`.
* [ ] T014-1566 — Test `POST eligible-voter archive`.

---

## 15.5. Votes

* [ ] T014-1580 — Test `GET votes`.
* [ ] T014-1581 — Test `GET vote`.
* [ ] T014-1582 — Test `POST vote cancel`.

---

## 15.6. Results

* [ ] T014-1600 — Test `POST calculate-results`.
* [ ] T014-1601 — Test `GET results`.
* [ ] T014-1602 — Test `POST publish-results`.
* [ ] T014-1603 — Test `POST link-resolution`.

---

## 15.7. `/me`

* [ ] T014-1620 — Test `GET /api/v1/me/voting-sessions`.
* [ ] T014-1621 — Test `GET /api/v1/me/voting-sessions/{votingSessionId}`.
* [ ] T014-1622 — Test `GET /api/v1/me/voting-sessions/{votingSessionId}/questions`.
* [ ] T014-1623 — Test `GET /api/v1/me/voting-sessions/{votingSessionId}/participation`.
* [ ] T014-1624 — Test `POST /api/v1/me/voting-sessions/{votingSessionId}/questions/{questionId}/vote`.
* [ ] T014-1625 — Test `GET /api/v1/me/voting-sessions/{votingSessionId}/results`.

---

# 16. Fase 12 — Multitenancy

## 16.1. Aislamiento de entidades

* [ ] T014-1701 — Tenant A no ve `voting_sessions` de Tenant B.
* [ ] T014-1702 — Tenant A no ve `ballot_questions` de Tenant B.
* [ ] T014-1703 — Tenant A no ve `ballot_options` de Tenant B.
* [ ] T014-1704 — Tenant A no ve `eligible_voters` de Tenant B.
* [ ] T014-1705 — Tenant A no ve `vote_casts` de Tenant B.
* [ ] T014-1706 — Tenant A no ve `voting_tallies` de Tenant B.
* [ ] T014-1707 — Tenant A no ve `voting_results` de Tenant B.
* [ ] T014-1708 — Tenant A no ve `voting_resolution_links` de Tenant B.
* [ ] T014-1709 — Tenant A no modifica votaciones de Tenant B.
* [ ] T014-1710 — Tenant A no abre votaciones de Tenant B.
* [ ] T014-1711 — Tenant A no cierra votaciones de Tenant B.
* [ ] T014-1712 — Tenant A no calcula resultados de Tenant B.
* [ ] T014-1713 — Tenant A no publica resultados de Tenant B.

---

## 16.2. Referencias cross-tenant

* [ ] T014-1720 — Rechazar `meetingId` de Tenant B.
* [ ] T014-1721 — Rechazar `questionId` de Tenant B.
* [ ] T014-1722 — Rechazar `optionId` de Tenant B.
* [ ] T014-1723 — Rechazar `eligibleVoterId` de Tenant B.
* [ ] T014-1724 — Rechazar `voteCastId` de Tenant B.
* [ ] T014-1725 — Rechazar `votingResultId` de Tenant B.
* [ ] T014-1726 — Rechazar `meetingResolutionId` de Tenant B.
* [ ] T014-1727 — Rechazar `userId` de Tenant B.
* [ ] T014-1728 — Rechazar `personId` de Tenant B.
* [ ] T014-1729 — Rechazar `propertyUnitId` de Tenant B.
* [ ] T014-1730 — Rechazar `roleId` de Tenant B.
* [ ] T014-1731 — Rechazar `proxyId` de Tenant B.
* [ ] T014-1732 — Ejecutar `npm run test:voting:multitenancy`.

---

# 17. Fase 13 — Elegibilidad

## 17.1. Elegibilidad manual

* [ ] T014-1801 — Crear elegible `user`.
* [ ] T014-1802 — Crear elegible `person`.
* [ ] T014-1803 — Crear elegible `propertyUnit`.
* [ ] T014-1804 — Crear elegible `owner`.
* [ ] T014-1805 — Crear elegible `resident` con feature flag habilitada.
* [ ] T014-1806 — Rechazar elegible `resident` con feature flag deshabilitada.
* [ ] T014-1807 — Crear elegible `role`.
* [ ] T014-1808 — Crear elegible `proxyRepresentative` con proxy aprobado.
* [ ] T014-1809 — Rechazar `proxyRepresentative` sin proxy aprobado.
* [ ] T014-1810 — Rechazar elegible duplicado.

---

## 17.2. Elegibilidad resuelta

* [ ] T014-1820 — Resolver elegibles desde `meetingParticipants`.
* [ ] T014-1821 — Resolver elegibles desde `meetingAttendance`.
* [ ] T014-1822 — Resolver asistentes `present`.
* [ ] T014-1823 — Resolver asistentes `late`.
* [ ] T014-1824 — Resolver asistentes `represented`.
* [ ] T014-1825 — No resolver `absent` salvo política explícita.
* [ ] T014-1826 — Resolver propietarios activos.
* [ ] T014-1827 — Resolver residentes activos con feature flag.
* [ ] T014-1828 — Resolver unidades activas.
* [ ] T014-1829 — Resolver roles.
* [ ] T014-1830 — Resolver `mixed`.
* [ ] T014-1831 — Implementar `dryRun`.
* [ ] T014-1832 — Implementar `deduplicate`.
* [ ] T014-1833 — Ejecutar `npm run test:voting:eligibility`.

---

# 18. Fase 14 — Voto propio y prevención de duplicidad

## 18.1. Emisión de voto

* [ ] T014-1901 — Votar `singleChoice`.
* [ ] T014-1902 — Votar `yesNoAbstain` con `yes`.
* [ ] T014-1903 — Votar `yesNoAbstain` con `no`.
* [ ] T014-1904 — Votar `yesNoAbstain` con `abstain`.
* [ ] T014-1905 — Votar `multipleChoice`.
* [ ] T014-1906 — Rechazar `multipleChoice` bajo mínimo.
* [ ] T014-1907 — Rechazar `multipleChoice` sobre máximo.
* [ ] T014-1908 — Rechazar opciones duplicadas en `selectedOptionIds`.
* [ ] T014-1909 — Rechazar opción de otra pregunta.
* [ ] T014-1910 — Rechazar opción de otro tenant.

---

## 18.2. Estados y ventana

* [ ] T014-1920 — Rechazar voto en `draft`.
* [ ] T014-1921 — Rechazar voto en `scheduled`.
* [ ] T014-1922 — Permitir voto en `open`.
* [ ] T014-1923 — Rechazar voto en `closed`.
* [ ] T014-1924 — Rechazar voto en `resultsCalculated`.
* [ ] T014-1925 — Rechazar voto en `resultsPublished`.
* [ ] T014-1926 — Rechazar voto en `cancelled`.
* [ ] T014-1927 — Rechazar voto en `archived`.
* [ ] T014-1928 — Rechazar voto antes de `opensAt`.
* [ ] T014-1929 — Permitir voto exactamente en `opensAt`.
* [ ] T014-1930 — Permitir voto dentro de ventana.
* [ ] T014-1931 — Permitir voto exactamente en `closesAt` si política usa `<=`.
* [ ] T014-1932 — Rechazar voto después de `closesAt`.

---

## 18.3. Duplicidad y concurrencia

* [ ] T014-1940 — Impedir voto duplicado mismo `eligibleVoterId` y `questionId`.
* [ ] T014-1941 — Permitir mismo elegible en preguntas distintas.
* [ ] T014-1942 — Permitir elegibles distintos en misma pregunta.
* [ ] T014-1943 — Crear índice único parcial de voto activo.
* [ ] T014-1944 — Manejar error de constraint como `VOTE_DUPLICATE`.
* [ ] T014-1945 — Probar dos requests simultáneos del mismo elegible.
* [ ] T014-1946 — Garantizar un voto creado y un 409.
* [ ] T014-1947 — Soportar `Idempotency-Key` si el patrón global existe.
* [ ] T014-1948 — Ejecutar `npm run test:voting:casting`.

---

# 19. Fase 15 — Recurso propio `/me`

## 19.1. Acceso propio

* [ ] T014-2001 — Owner ve votación por unidad propia.
* [ ] T014-2002 — Owner no ve votación por unidad ajena.
* [ ] T014-2003 — Resident ve votación `residents` si está habilitada.
* [ ] T014-2004 — Resident no ve votación `owners` si no es owner.
* [ ] T014-2005 — OwnerResident ve votaciones `owners` y `residents`.
* [ ] T014-2006 — Usuario ve votación por `eligibleUser`.
* [ ] T014-2007 — Usuario ve votación por `eligiblePerson` propia.
* [ ] T014-2008 — Usuario ve votación por rol si pertenece al rol.
* [ ] T014-2009 — Usuario no ve votación de Tenant B.
* [ ] T014-2010 — Usuario no usa `eligibleVoterId` ajeno.

---

## 19.2. Privacidad propia

* [ ] T014-2020 — `/me/voting-sessions` no devuelve elegibles completos.
* [ ] T014-2021 — `/me/voting-sessions` no devuelve votos de terceros.
* [ ] T014-2022 — `/me/voting-sessions/{id}/participation` solo devuelve participación propia.
* [ ] T014-2023 — `/me` no devuelve auditoría.
* [ ] T014-2024 — `/me` no devuelve metadata interna.
* [ ] T014-2025 — Usuario no vota por unidad ajena.
* [ ] T014-2026 — Usuario no vota por persona ajena.
* [ ] T014-2027 — Usuario no consulta resultados no publicados.
* [ ] T014-2028 — Usuario consulta resultados publicados si pertenece a audiencia.
* [ ] T014-2029 — Ejecutar `npm run test:voting:own-resource`.

---

# 20. Fase 16 — Privacidad

## 20.1. `identified`

* [ ] T014-2101 — Admin con `votes.read` consulta `selectedOptionId`.
* [ ] T014-2102 — Admin sin `votes.read` no consulta votos.
* [ ] T014-2103 — Usuario consulta voto propio si política lo permite.
* [ ] T014-2104 — Usuario no consulta votos de terceros.
* [ ] T014-2105 — Auditoría puede registrar `ballotOptionId` solo si política lo permite.
* [ ] T014-2106 — Logs no contienen payload completo.

---

## 20.2. `secretBasic`

* [ ] T014-2120 — Admin estándar no ve `selectedOptionId`.
* [ ] T014-2121 — Admin estándar no ve `selectedOptionIds`.
* [ ] T014-2122 — `GET votes` oculta opción individual.
* [ ] T014-2123 — `GET participation` oculta opción individual.
* [ ] T014-2124 — `POST vote` response oculta `selectedOptionId`.
* [ ] T014-2125 — Auditoría `voteCast.cast` no contiene `selectedOptionId`.
* [ ] T014-2126 — Auditoría `voteCast.cast` no contiene `selectedOptionIds`.
* [ ] T014-2127 — Logs no contienen `selectedOptionId`.
* [ ] T014-2128 — Métricas no contienen `selectedOptionId`.
* [ ] T014-2129 — Resultados son agregados.
* [ ] T014-2130 — UI/API no describen `secretBasic` como criptográfico.
* [ ] T014-2131 — Ejecutar `npm run test:voting:privacy`.

---

# 21. Fase 17 — Cálculo de resultados

## 21.1. Implementación de reglas MVP

* [ ] T014-2201 — Implementar `informational`.
* [ ] T014-2202 — Implementar `simpleMajority`.
* [ ] T014-2203 — Implementar `absoluteMajority`.
* [ ] T014-2204 — Implementar `plurality`.
* [ ] T014-2205 — Implementar `unanimity`.
* [ ] T014-2206 — Rechazar `qualifiedMajority` en MVP.
* [ ] T014-2207 — Rechazar `weightedMajority` avanzado en MVP.
* [ ] T014-2208 — Rechazar `legalCustomRule` en MVP.

---

## 21.2. Tallies

* [ ] T014-2220 — Contar votos por opción.
* [ ] T014-2221 — Contar abstenciones.
* [ ] T014-2222 — Excluir votos `cancelled`.
* [ ] T014-2223 — Excluir votos `archived`.
* [ ] T014-2224 — Excluir votos `superseded`.
* [ ] T014-2225 — Excluir votos de otro tenant.
* [ ] T014-2226 — Calcular porcentajes con Decimal.
* [ ] T014-2227 — Exponer porcentajes como string decimal.
* [ ] T014-2228 — Persistir `VotingTally`.
* [ ] T014-2229 — Persistir `VotingResult`.
* [ ] T014-2230 — Marcar `resultsCalculatedAt`.

---

## 21.3. Determinismo

* [ ] T014-2240 — Mismo set de votos produce mismo resultado.
* [ ] T014-2241 — Calcular dos veces produce resultado consistente.
* [ ] T014-2242 — `forceRecalculate` reemplaza tallies previos de forma controlada.
* [ ] T014-2243 — Calcular resultados no modifica `vote_casts`.
* [ ] T014-2244 — Calcular resultados no modifica elegibles salvo estado de sesión si aplica.
* [ ] T014-2245 — Calcular resultados no ejecuta acciones automáticas.
* [ ] T014-2246 — Ejecutar `npm run test:voting:results`.

---

# 22. Fase 18 — Publicación y vínculo con resoluciones

## 22.1. Publicación de resultados

* [ ] T014-2301 — Publicar resultados calculados.
* [ ] T014-2302 — Rechazar publicar sin cálculo.
* [ ] T014-2303 — Marcar `resultsPublishedAt`.
* [ ] T014-2304 — Cambiar estado a `resultsPublished`.
* [ ] T014-2305 — Enviar notificación si `notifyAudience = true`.
* [ ] T014-2306 — Garantizar que resultados no son públicos.
* [ ] T014-2307 — En `secretBasic`, publicar solo resultados agregados.

---

## 22.2. Vínculo con resolución

* [ ] T014-2320 — Vincular resultado con `meetingResolution`.
* [ ] T014-2321 — Validar que resultado pertenece al tenant.
* [ ] T014-2322 — Validar que resolución pertenece al tenant.
* [ ] T014-2323 — Validar misma reunión si `votingSession.meetingId` existe.
* [ ] T014-2324 — Rechazar resolución de otro tenant.
* [ ] T014-2325 — Rechazar resolución de otra reunión.
* [ ] T014-2326 — No crear resolución automáticamente.
* [ ] T014-2327 — No aprobar resolución automáticamente.
* [ ] T014-2328 — No ejecutar acción automática.
* [ ] T014-2329 — Auditar `votingResult.linkedToResolution`.

---

# 23. Fase 19 — Integración con notificaciones

## 23.1. Eventos

* [ ] T014-2401 — Emitir evento `votingSession.opened`.
* [ ] T014-2402 — Emitir evento `votingSession.closed`.
* [ ] T014-2403 — Emitir evento `votingSession.cancelled` si aplica.
* [ ] T014-2404 — Emitir evento `votingResults.published`.
* [ ] T014-2405 — Construir payload mínimo.
* [ ] T014-2406 — Incluir `sourceType = votingSession`.
* [ ] T014-2407 — Incluir `sourceId = votingSessionId`.
* [ ] T014-2408 — Incluir `actionUrl`.
* [ ] T014-2409 — No incluir lista completa de elegibles.
* [ ] T014-2410 — No incluir votos individuales.
* [ ] T014-2411 — No incluir `selectedOptionId`.
* [ ] T014-2412 — No incluir resultados no publicados.
* [ ] T014-2413 — No enviar email directamente desde Voting.
* [ ] T014-2414 — No enviar WhatsApp/SMS/push directamente desde Voting.

---

## 23.2. Tests de notificaciones

* [ ] T014-2420 — Test `open` con `notifyEligibleVoters = true`.
* [ ] T014-2421 — Test `open` con `notifyEligibleVoters = false`.
* [ ] T014-2422 — Test `cancel` con notificación.
* [ ] T014-2423 — Test `publish-results` con `notifyAudience = true`.
* [ ] T014-2424 — Test payload mínimo.
* [ ] T014-2425 — Test payload sin elegibles completos.
* [ ] T014-2426 — Test payload sin votos individuales.
* [ ] T014-2427 — Test payload sin `selectedOptionId`.
* [ ] T014-2428 — Test fallo del puerto no revierte operación salvo política explícita.
* [ ] T014-2429 — Ejecutar `npm run test:voting:notifications`.

---

# 24. Fase 20 — Auditoría

## 24.1. Eventos de auditoría

* [ ] T014-2501 — Auditar `votingSession.created`.
* [ ] T014-2502 — Auditar `votingSession.updated`.
* [ ] T014-2503 — Auditar `votingSession.scheduled`.
* [ ] T014-2504 — Auditar `votingSession.opened`.
* [ ] T014-2505 — Auditar `votingSession.closed`.
* [ ] T014-2506 — Auditar `votingSession.cancelled`.
* [ ] T014-2507 — Auditar `votingSession.archived`.
* [ ] T014-2508 — Auditar `ballotQuestion.created`.
* [ ] T014-2509 — Auditar `ballotQuestion.updated`.
* [ ] T014-2510 — Auditar `ballotQuestion.archived`.
* [ ] T014-2511 — Auditar `ballotOption.created`.
* [ ] T014-2512 — Auditar `ballotOption.updated`.
* [ ] T014-2513 — Auditar `ballotOption.archived`.
* [ ] T014-2514 — Auditar `eligibleVoter.added`.
* [ ] T014-2515 — Auditar `eligibleVoters.resolved`.
* [ ] T014-2516 — Auditar `eligibleVoter.updated`.
* [ ] T014-2517 — Auditar `eligibleVoter.excluded`.
* [ ] T014-2518 — Auditar `eligibleVoter.archived`.
* [ ] T014-2519 — Auditar `voteCast.cast`.
* [ ] T014-2520 — Auditar `voteCast.cancelled`.
* [ ] T014-2521 — Auditar `votingResults.calculated`.
* [ ] T014-2522 — Auditar `votingResults.published`.
* [ ] T014-2523 — Auditar `votingResult.linkedToResolution`.

---

## 24.2. Sanitización de auditoría

* [ ] T014-2530 — No registrar payload completo.
* [ ] T014-2531 — No registrar voto completo.
* [ ] T014-2532 — No registrar `selectedOptionId` en `secretBasic`.
* [ ] T014-2533 — No registrar `selectedOptionIds` en `secretBasic`.
* [ ] T014-2534 — No registrar tokens.
* [ ] T014-2535 — No registrar cookies.
* [ ] T014-2536 — No registrar `Authorization` header.
* [ ] T014-2537 — No registrar emails completos.
* [ ] T014-2538 — No registrar teléfonos completos.
* [ ] T014-2539 — No registrar cédulas.
* [ ] T014-2540 — No registrar stack trace.
* [ ] T014-2541 — No registrar SQL raw.
* [ ] T014-2542 — Ejecutar `npm run test:voting:audit`.

---

# 25. Fase 21 — Observabilidad

## 25.1. Logs

* [ ] T014-2601 — Agregar log `votingSession.created`.
* [ ] T014-2602 — Agregar log `votingSession.opened`.
* [ ] T014-2603 — Agregar log `votingSession.closed`.
* [ ] T014-2604 — Agregar log `votingSession.cancelled`.
* [ ] T014-2605 — Agregar log `voteCast.cast`.
* [ ] T014-2606 — Agregar log `voteCast.cancelled`.
* [ ] T014-2607 — Agregar log `votingResults.calculated`.
* [ ] T014-2608 — Agregar log `votingResults.published`.
* [ ] T014-2609 — Agregar log `votingResult.linkedToResolution`.
* [ ] T014-2610 — Validar `traceId`.
* [ ] T014-2611 — Validar `requestId`.
* [ ] T014-2612 — Validar `action`.
* [ ] T014-2613 — Validar `outcome`.

---

## 25.2. Métricas

* [ ] T014-2620 — Agregar métrica `voting_sessions_created_total`.
* [ ] T014-2621 — Agregar métrica `voting_sessions_opened_total`.
* [ ] T014-2622 — Agregar métrica `voting_sessions_closed_total`.
* [ ] T014-2623 — Agregar métrica `voting_sessions_cancelled_total`.
* [ ] T014-2624 — Agregar métrica `votes_cast_total`.
* [ ] T014-2625 — Agregar métrica `votes_cancelled_total`.
* [ ] T014-2626 — Agregar métrica `voting_results_calculated_total`.
* [ ] T014-2627 — Agregar métrica `voting_results_published_total`.
* [ ] T014-2628 — Validar labels permitidos.
* [ ] T014-2629 — Validar labels prohibidos.
* [ ] T014-2630 — Ejecutar `npm run test:voting:observability`.

---

# 26. Fase 22 — Seguridad

## 26.1. Seguridad obligatoria

* [ ] T014-2701 — Verificar que no existen endpoints públicos de votación.
* [ ] T014-2702 — Verificar que no existen endpoints públicos de resultados.
* [ ] T014-2703 — Verificar que no existen endpoints públicos de emisión de voto.
* [ ] T014-2704 — Verificar que ningún body acepta `tenantId`.
* [ ] T014-2705 — Verificar que ningún recurso se busca solo por `id`.
* [ ] T014-2706 — Verificar que no se permite voto duplicado.
* [ ] T014-2707 — Verificar que no se permite voto fuera de ventana.
* [ ] T014-2708 — Verificar que no se permite voto en sesión cerrada.
* [ ] T014-2709 — Verificar que no se permite voto de no elegible.
* [ ] T014-2710 — Verificar que no se permite voto por unidad ajena.
* [ ] T014-2711 — Verificar que no se permite voto con proxy no aprobado.
* [ ] T014-2712 — Verificar que `secretBasic` no expone opción individual.
* [ ] T014-2713 — Verificar que resultados no ejecutan acciones automáticas.
* [ ] T014-2714 — Verificar que errores son seguros.

---

## 26.2. Tests negativos públicos

* [ ] T014-2720 — Test `GET /api/v1/public/tenants/{slug}/voting-sessions` devuelve 404.
* [ ] T014-2721 — Test `GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}` devuelve 404.
* [ ] T014-2722 — Test `GET /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/results` devuelve 404.
* [ ] T014-2723 — Test `POST /api/v1/public/tenants/{slug}/voting-sessions/{votingSessionId}/vote` devuelve 404.
* [ ] T014-2724 — Test `GET /api/v1/public/tenants/{slug}/votes` devuelve 404.
* [ ] T014-2725 — Test `GET /api/v1/public/tenants/{slug}/results` devuelve 404.
* [ ] T014-2726 — Ejecutar `npm run test:voting:security`.

---

# 27. Fase 23 — OpenAPI

## 27.1. Documentación OpenAPI

* [ ] T014-2801 — Agregar tag `Voting Sessions`.
* [ ] T014-2802 — Agregar tag `Ballot Questions`.
* [ ] T014-2803 — Agregar tag `Ballot Options`.
* [ ] T014-2804 — Agregar tag `Eligible Voters`.
* [ ] T014-2805 — Agregar tag `Votes`.
* [ ] T014-2806 — Agregar tag `Voting Results`.
* [ ] T014-2807 — Agregar tag `My Voting`.
* [ ] T014-2808 — Documentar DTOs request.
* [ ] T014-2809 — Documentar DTOs response.
* [ ] T014-2810 — Documentar errores.
* [ ] T014-2811 — Documentar permisos.
* [ ] T014-2812 — Documentar paginación.
* [ ] T014-2813 — Documentar filtros.
* [ ] T014-2814 — Agregar `x-tenant-scope`.
* [ ] T014-2815 — Agregar `x-auth-required`.
* [ ] T014-2816 — Agregar `x-required-permission`.
* [ ] T014-2817 — Agregar `x-own-resource` en endpoints `/me`.
* [ ] T014-2818 — Agregar `x-vote-casting`.
* [ ] T014-2819 — Agregar `x-eligibility-required`.
* [ ] T014-2820 — Agregar `x-duplicate-protected`.
* [ ] T014-2821 — Agregar `x-privacy-mode-aware`.
* [ ] T014-2822 — Agregar `x-result-calculation`.
* [ ] T014-2823 — Agregar `x-public-exposure: false`.
* [ ] T014-2824 — Agregar `x-audit-event`.

---

## 27.2. Tests OpenAPI

* [ ] T014-2830 — Validar que OpenAPI compila.
* [ ] T014-2831 — Validar que todos los endpoints esperados están documentados.
* [ ] T014-2832 — Validar que todos los permisos están documentados.
* [ ] T014-2833 — Validar que endpoints `/me` tienen `x-own-resource`.
* [ ] T014-2834 — Validar que endpoint de voto tiene `x-vote-casting`.
* [ ] T014-2835 — Validar que endpoint de voto tiene `x-eligibility-required`.
* [ ] T014-2836 — Validar que endpoint de voto tiene `x-duplicate-protected`.
* [ ] T014-2837 — Validar que endpoints `secretBasic` tienen protección documentada.
* [ ] T014-2838 — Validar que endpoints de resultados tienen `x-result-calculation`.
* [ ] T014-2839 — Validar que OpenAPI no documenta endpoints públicos de votación.
* [ ] T014-2840 — Ejecutar `npm run test:voting:openapi`.
* [ ] T014-2841 — Ejecutar `npm run openapi:validate`.

---

# 28. Fase 24 — Seeds y datos demo

## 28.1. Seeds

* [ ] T014-2901 — Crear seed `votingSessionDraftA`.
* [ ] T014-2902 — Crear seed `votingSessionOpenA`.
* [ ] T014-2903 — Crear seed `votingSessionClosedA`.
* [ ] T014-2904 — Crear seed `votingSessionSecretBasicA`.
* [ ] T014-2905 — Crear seed `votingSessionIdentifiedA`.
* [ ] T014-2906 — Crear seed `votingSessionTenantB`.
* [ ] T014-2907 — Crear seed `questionYesNoBudgetA`.
* [ ] T014-2908 — Crear seed `questionSingleChoiceBoardA`.
* [ ] T014-2909 — Crear seed `questionMultipleChoiceMaintenanceA`.
* [ ] T014-2910 — Crear seed opciones `yes/no/abstain`.
* [ ] T014-2911 — Crear seed opciones de candidatos.
* [ ] T014-2912 — Crear seed elegibles owner/resident/unit/user/person/proxy.
* [ ] T014-2913 — Crear seed votos identificados.
* [ ] T014-2914 — Crear seed votos `secretBasic`.
* [ ] T014-2915 — Crear seed tallies.
* [ ] T014-2916 — Crear seed resultados.
* [ ] T014-2917 — Crear seed link con resolución.

---

## 28.2. Prohibiciones en seeds

* [ ] T014-2920 — Verificar que no hay nombres reales.
* [ ] T014-2921 — Verificar que no hay emails reales.
* [ ] T014-2922 — Verificar que no hay teléfonos reales.
* [ ] T014-2923 — Verificar que no hay cédulas reales.
* [ ] T014-2924 — Verificar que no hay votos reales.
* [ ] T014-2925 — Verificar que no hay actas reales.
* [ ] T014-2926 — Verificar que no hay documentos reales.
* [ ] T014-2927 — Verificar que no hay tokens.
* [ ] T014-2928 — Verificar que no hay secretos.
* [ ] T014-2929 — Verificar que no hay datos financieros reales.
* [ ] T014-2930 — Verificar que no hay datos sancionatorios reales.

---

# 29. Fase 25 — Performance

## 29.1. Escenarios

* [ ] T014-3001 — Medir `GET /tenant/voting-sessions` con 1.000 sesiones por tenant.
* [ ] T014-3002 — Medir `GET /eligible-voters` con 500 elegibles.
* [ ] T014-3003 — Medir `GET /votes` con 500 votos.
* [ ] T014-3004 — Medir `GET /me/voting-sessions` con 100 votaciones elegibles.
* [ ] T014-3005 — Medir `POST /calculate-results` con 500 elegibles y 10 preguntas.
* [ ] T014-3006 — Medir `POST /vote` con concurrencia controlada.

---

## 29.2. Validaciones

* [ ] T014-3010 — Verificar `p95 < 700 ms` para listados.
* [ ] T014-3011 — Verificar `p95 < 1500 ms` para cálculo de resultados.
* [ ] T014-3012 — Verificar paginación obligatoria.
* [ ] T014-3013 — Verificar `pageSize` máximo 100.
* [ ] T014-3014 — Verificar ausencia de N+1 evidente.
* [ ] T014-3015 — Verificar uso de índices.
* [ ] T014-3016 — Verificar que listados no cargan votos individuales innecesarios.
* [ ] T014-3017 — Verificar que listados no calculan resultados en caliente.
* [ ] T014-3018 — Ejecutar `npm run test:voting:performance` si existe.

---

# 30. Fase 26 — Smoke test

## 30.1. Flujo mínimo

* [ ] T014-3101 — Ejecutar `GET /api/v1/health`.
* [ ] T014-3102 — Crear sesión de votación.
* [ ] T014-3103 — Crear pregunta `yesNoAbstain`.
* [ ] T014-3104 — Crear opción `yes`.
* [ ] T014-3105 — Crear opción `no`.
* [ ] T014-3106 — Crear opción `abstain`.
* [ ] T014-3107 — Crear elegible.
* [ ] T014-3108 — Programar sesión.
* [ ] T014-3109 — Abrir sesión.
* [ ] T014-3110 — Consultar votación desde `/me`.
* [ ] T014-3111 — Consultar preguntas desde `/me`.
* [ ] T014-3112 — Emitir voto.
* [ ] T014-3113 — Cerrar sesión.
* [ ] T014-3114 — Calcular resultados.
* [ ] T014-3115 — Consultar resultados administrativos.
* [ ] T014-3116 — Publicar resultados.
* [ ] T014-3117 — Consultar resultados desde `/me`.
* [ ] T014-3118 — Vincular resultado con resolución.
* [ ] T014-3119 — Confirmar que endpoint público de votación no existe.
* [ ] T014-3120 — Ejecutar `npm run test:voting:smoke`.

---

# 31. Fase 27 — CI/CD

## 31.1. Scripts

* [ ] T014-3201 — Agregar script `test:voting`.
* [ ] T014-3202 — Agregar script `test:voting:unit`.
* [ ] T014-3203 — Agregar script `test:voting:domain`.
* [ ] T014-3204 — Agregar script `test:voting:dto`.
* [ ] T014-3205 — Agregar script `test:voting:application`.
* [ ] T014-3206 — Agregar script `test:voting:repositories`.
* [ ] T014-3207 — Agregar script `test:voting:api`.
* [ ] T014-3208 — Agregar script `test:voting:authorization`.
* [ ] T014-3209 — Agregar script `test:voting:own-resource`.
* [ ] T014-3210 — Agregar script `test:voting:eligibility`.
* [ ] T014-3211 — Agregar script `test:voting:casting`.
* [ ] T014-3212 — Agregar script `test:voting:privacy`.
* [ ] T014-3213 — Agregar script `test:voting:multitenancy`.
* [ ] T014-3214 — Agregar script `test:voting:results`.
* [ ] T014-3215 — Agregar script `test:voting:notifications`.
* [ ] T014-3216 — Agregar script `test:voting:audit`.
* [ ] T014-3217 — Agregar script `test:voting:observability`.
* [ ] T014-3218 — Agregar script `test:voting:security`.
* [ ] T014-3219 — Agregar script `test:voting:openapi`.
* [ ] T014-3220 — Agregar script `test:voting:performance`.
* [ ] T014-3221 — Agregar script `test:voting:smoke`.

---

## 31.2. Gates

* [ ] T014-3230 — Gate lint.
* [ ] T014-3231 — Gate typecheck.
* [ ] T014-3232 — Gate unit tests.
* [ ] T014-3233 — Gate domain tests.
* [ ] T014-3234 — Gate DTO validation tests.
* [ ] T014-3235 — Gate repository tests.
* [ ] T014-3236 — Gate API tests.
* [ ] T014-3237 — Gate authorization tests.
* [ ] T014-3238 — Gate own-resource tests.
* [ ] T014-3239 — Gate eligibility tests.
* [ ] T014-3240 — Gate vote casting tests.
* [ ] T014-3241 — Gate privacy tests.
* [ ] T014-3242 — Gate multitenancy tests.
* [ ] T014-3243 — Gate result calculation tests.
* [ ] T014-3244 — Gate notification integration tests.
* [ ] T014-3245 — Gate audit tests.
* [ ] T014-3246 — Gate observability tests.
* [ ] T014-3247 — Gate security tests.
* [ ] T014-3248 — Gate OpenAPI validation.
* [ ] T014-3249 — Gate public endpoint negative tests.
* [ ] T014-3250 — Gate concurrency duplicate vote test.
* [ ] T014-3251 — Gate build.

---

# 32. Fase 28 — Documentación final

## 32.1. Actualización documental

* [ ] T014-3301 — Actualizar `docs/specs/014-voting-basic/spec.md` si cambió el alcance.
* [ ] T014-3302 — Actualizar `docs/specs/014-voting-basic/plan.md` si cambió la arquitectura.
* [ ] T014-3303 — Actualizar `docs/specs/014-voting-basic/data-model.md` si cambió el modelo.
* [ ] T014-3304 — Actualizar `docs/specs/014-voting-basic/api-contract.md` si cambió el contrato.
* [ ] T014-3305 — Actualizar `docs/specs/014-voting-basic/test-plan.md` si cambiaron pruebas.
* [ ] T014-3306 — Actualizar `docs/specs/014-voting-basic/tasks.md`.
* [ ] T014-3307 — Crear o actualizar `docs/specs/014-voting-basic/security-notes.md`.
* [ ] T014-3308 — Actualizar OpenAPI.
* [ ] T014-3309 — Actualizar README técnico del módulo si existe.
* [ ] T014-3310 — Actualizar changelog interno si aplica.

---

# 33. Checklist de aceptación funcional

* [ ] T014-3401 — Se crean sesiones de votación.
* [ ] T014-3402 — Se asocian votaciones a reuniones del mismo tenant.
* [ ] T014-3403 — Se crean preguntas.
* [ ] T014-3404 — Se crean opciones.
* [ ] T014-3405 — Se impiden opciones duplicadas.
* [ ] T014-3406 — Se impide segunda abstención por pregunta.
* [ ] T014-3407 — Se crean elegibles manuales.
* [ ] T014-3408 — Se resuelven elegibles automáticamente.
* [ ] T014-3409 — Se abre votación.
* [ ] T014-3410 — Se cierra votación.
* [ ] T014-3411 — Se cancela votación con razón.
* [ ] T014-3412 — Se archiva votación.
* [ ] T014-3413 — Se emite voto propio.
* [ ] T014-3414 — Se impide voto de no elegible.
* [ ] T014-3415 — Se impide voto duplicado.
* [ ] T014-3416 — Se impide voto fuera de ventana.
* [ ] T014-3417 — Se impide voto por unidad ajena.
* [ ] T014-3418 — Se valida proxy aprobado.
* [ ] T014-3419 — Se calcula resultado `informational`.
* [ ] T014-3420 — Se calcula resultado `simpleMajority`.
* [ ] T014-3421 — Se calcula resultado `absoluteMajority`.
* [ ] T014-3422 — Se calcula resultado `plurality`.
* [ ] T014-3423 — Se calcula resultado `unanimity`.
* [ ] T014-3424 — Se publican resultados calculados.
* [ ] T014-3425 — Se consultan resultados publicados desde `/me`.
* [ ] T014-3426 — Se vincula resultado con resolución.
* [ ] T014-3427 — Se emiten eventos de notificación.
* [ ] T014-3428 — Se auditan operaciones críticas.

---

# 34. Checklist de aceptación técnica

* [ ] T014-3501 — Todas las tablas nuevas tienen `tenant_id`.
* [ ] T014-3502 — Todas las consultas filtran por `tenant_id`.
* [ ] T014-3503 — Ningún endpoint acepta `tenantId` desde body.
* [ ] T014-3504 — No se busca `votingSession` solo por `id`.
* [ ] T014-3505 — No se busca `ballotQuestion` solo por `id`.
* [ ] T014-3506 — No se busca `ballotOption` solo por `id`.
* [ ] T014-3507 — No se busca `eligibleVoter` solo por `id`.
* [ ] T014-3508 — No se busca `voteCast` solo por `id`.
* [ ] T014-3509 — No se busca `votingResult` solo por `id`.
* [ ] T014-3510 — No se busca `votingResolutionLink` solo por `id`.
* [ ] T014-3511 — No hay endpoints públicos de votación.
* [ ] T014-3512 — OpenAPI no documenta endpoints públicos de votación.
* [ ] T014-3513 — Voto duplicado se impide por servicio e índice.
* [ ] T014-3514 — Concurrencia de voto duplicado está controlada.
* [ ] T014-3515 — `secretBasic` oculta opción individual.
* [ ] T014-3516 — Logs no incluyen `selectedOptionId`.
* [ ] T014-3517 — Métricas no incluyen IDs sensibles.
* [ ] T014-3518 — Auditoría registra eventos críticos.
* [ ] T014-3519 — CI pasa.

---

# 35. Checklist de no regresión

* [ ] T014-3601 — No se rompe `001-tenants`.
* [ ] T014-3602 — No se rompe `002-users-roles`.
* [ ] T014-3603 — No se rompe `003-residents-properties`.
* [ ] T014-3604 — No se rompe `007-audit`.
* [ ] T014-3605 — No se rompe `012-communications-notifications`.
* [ ] T014-3606 — No se rompe `013-meetings-attendance`.
* [ ] T014-3607 — No se rompe OpenAPI general.
* [ ] T014-3608 — No se rompe autenticación Keycloak/OIDC.
* [ ] T014-3609 — No se rompe tenant active context.
* [ ] T014-3610 — No se rompe autorización por permisos.
* [ ] T014-3611 — No se rompe CI/CD.

---

# 36. Comandos sugeridos

## 36.1. Comandos específicos

```bash id="kfyq3c"
npm run test:voting
npm run test:voting:unit
npm run test:voting:domain
npm run test:voting:dto
npm run test:voting:application
npm run test:voting:repositories
npm run test:voting:api
npm run test:voting:authorization
npm run test:voting:own-resource
npm run test:voting:eligibility
npm run test:voting:casting
npm run test:voting:privacy
npm run test:voting:multitenancy
npm run test:voting:results
npm run test:voting:notifications
npm run test:voting:audit
npm run test:voting:observability
npm run test:voting:security
npm run test:voting:openapi
npm run test:voting:performance
npm run test:voting:smoke
```

---

## 36.2. Comandos generales

```bash id="lkk8s5"
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

---

# 37. Orden recomendado de ejecución

## 37.1. Implementación mínima segura

```text id="sa24ne"
1. Estructura base.
2. Enums y value objects.
3. Entidades.
4. Prisma schema y migraciones.
5. Repositorios.
6. Servicios de sesiones.
7. Preguntas y opciones.
8. Elegibilidad.
9. Emisión de voto.
10. Privacidad identified/secretBasic.
11. Cálculo de resultados.
12. Publicación de resultados.
13. Vínculo con resoluciones.
14. Controladores administrativos.
15. Controladores /me.
16. Auditoría.
17. Notificaciones.
18. Observabilidad.
19. OpenAPI.
20. Security tests.
21. Smoke tests.
22. CI.
```

---

## 37.2. Orden de PRs sugerido

```text id="bse6rv"
PR-014-01 — Module skeleton, enums and value objects.
PR-014-02 — Prisma schema, migration and repositories.
PR-014-03 — Voting session state machine.
PR-014-04 — Ballot questions and options.
PR-014-05 — Eligible voters and eligibility resolution.
PR-014-06 — Vote casting and duplicate prevention.
PR-014-07 — Privacy modes identified and secretBasic.
PR-014-08 — Result calculation and publication.
PR-014-09 — Resolution link and meeting integration.
PR-014-10 — My Voting endpoints.
PR-014-11 — Audit, notifications and observability.
PR-014-12 — OpenAPI, tests and security hardening.
```

---

# 38. Tareas diferidas explícitas

Estas tareas quedan fuera del MVP y no deben implementarse dentro de esta spec:

```text id="r5k23f"
[-] Votación legalmente certificada.
[-] Firma electrónica.
[-] Sellado de tiempo certificado.
[-] Blockchain.
[-] Voto secreto criptográfico.
[-] Voto verificable extremo a extremo.
[-] Auditoría pública verificable.
[-] Voto ponderado avanzado.
[-] Coeficientes de copropiedad.
[-] Mayorías legales complejas.
[-] Impugnaciones legales.
[-] Segunda vuelta automática.
[-] Recuento formal.
[-] Observadores externos.
[-] Voto offline.
[-] Voto por WhatsApp.
[-] Voto por SMS.
[-] Voto por email.
[-] Biometría.
[-] Geolocalización.
[-] Actas certificadas.
[-] PDF formal de resultados.
[-] IA con datos reales de votación.
```

---

# 39. No aceptación

La implementación no debe aceptarse si:

```text id="ut53qu"
- permite voting sessions cross-tenant;
- permite questions cross-tenant;
- permite options cross-tenant;
- permite eligible voters cross-tenant;
- permite vote casts cross-tenant;
- permite resultados cross-tenant;
- permite voto duplicado;
- permite voto fuera de ventana;
- permite voto en sesión cerrada;
- permite voto de usuario no elegible;
- permite voto por unidad ajena;
- permite voto por persona ajena;
- permite voto con proxy no aprobado;
- expone selectedOptionId en secretBasic;
- registra selectedOptionId en logs secretBasic;
- registra selectedOptionId en auditoría secretBasic;
- permite ver votos de terceros en /me;
- publica resultados sin cálculo;
- expone resultados públicamente;
- crea endpoints públicos de votación;
- documenta endpoints públicos en OpenAPI;
- calcula resultados modificando votos;
- usa float/double para porcentajes persistidos;
- ejecuta acciones automáticas desde resultados;
- genera cargos desde resultados;
- genera multas desde resultados;
- presenta secretBasic como anonimato criptográfico;
- presenta MVP como votación legalmente certificada;
- omite auditoría de operaciones críticas.
```

---

# 40. Resultado esperado

Al completar estas tareas, el módulo `014-voting-basic` deberá permitir votaciones internas básicas de forma segura, auditable y preparada para evolución futura.

Debe quedar implementado:

```text id="a30m8h"
- Voting session management.
- Ballot questions.
- Ballot options.
- Eligible voters.
- Eligibility resolution.
- Own vote casting.
- Duplicate vote prevention.
- Voting window validation.
- identified privacy mode.
- secretBasic privacy mode.
- Deterministic tally.
- Result calculation.
- Controlled result publication.
- Resolution linking.
- My Voting API.
- Notification events.
- Audit events.
- OpenAPI.
- Security tests.
- CI gates.
```

El módulo debe quedar preparado para futuras specs de:

```text id="t7dvso"
015-certified-minutes
00X-electronic-signatures
00X-advanced-voting-rules
00X-weighted-voting
00X-property-coefficient-management
00X-voting-legal-workflow
00X-voting-appeals
00X-voting-public-verification
00X-blockchain-voting
00X-ai-assisted-minutes
00X-meeting-documents
```
