# Tasks — Spec 013 Meetings and Attendance

## 1. Información del documento

| Campo           | Valor                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                 |
| Spec ID         | 013                                                                                                           |
| Módulo          | Meetings and Attendance                                                                                       |
| Documento       | Tasks                                                                                                         |
| Ruta            | `docs/specs/013-meetings-attendance/tasks.md`                                                                 |
| Versión         | 0.1                                                                                                           |
| Estado          | Borrador inicial                                                                                              |
| Fecha           | 2026-07-19                                                                                                    |
| Documento base  | `docs/specs/013-meetings-attendance/spec.md`                                                                  |
| Plan técnico    | `docs/specs/013-meetings-attendance/plan.md`                                                                  |
| Modelo de datos | `docs/specs/013-meetings-attendance/data-model.md`                                                            |
| Contrato API    | `docs/specs/013-meetings-attendance/api-contract.md`                                                          |
| Plan de pruebas | `docs/specs/013-meetings-attendance/test-plan.md`                                                             |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `007-audit`, `012-communications-notifications` |
| Relacionado con | `008-basic-reports`, `011-fines-sanctions`, futuras specs de votación, firmas, actas PDF, QR e IA             |

---

## 2. Propósito

Este documento convierte la especificación `013-meetings-attendance` en una lista ejecutable de tareas técnicas.

El objetivo es guiar la implementación del módulo de reuniones, agenda, participantes, asistencia, representaciones básicas, quórum, actas preliminares y resoluciones básicas dentro de RESIDENT Core.

Regla central:

```text id="z2dbag"
Cada tarea debe preservar tenant isolation, autorización por permisos, autorización por recurso propio, control de estados, privacidad de asistencia, trazabilidad auditable y ausencia de endpoints públicos.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text id="q64xjk"
[ ] Pendiente
[x] Completada
[-] Diferida
[!] Bloqueada
```

---

### 3.2. Criterios generales de completitud

Una tarea se considera completada solo si:

```text id="skxzph"
- el código compila;
- los tests asociados pasan;
- la regla multitenant se cumple;
- la autorización se aplica;
- la auditoría se registra cuando corresponde;
- no se introducen endpoints públicos no permitidos;
- no se exponen datos personales innecesarios;
- OpenAPI queda actualizado si aplica;
- la documentación afectada queda sincronizada.
```

---

### 3.3. Reglas para agentes IA

Antes de ejecutar estas tareas, cualquier agente IA debe leer:

```text id="nd6lps"
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
docs/specs/013-meetings-attendance/spec.md
docs/specs/013-meetings-attendance/plan.md
docs/specs/013-meetings-attendance/data-model.md
docs/specs/013-meetings-attendance/api-contract.md
docs/specs/013-meetings-attendance/test-plan.md
docs/specs/013-meetings-attendance/tasks.md
```

El agente no debe:

```text id="b1ywlm"
- aceptar tenantId desde body;
- buscar recursos solo por id sin tenantId;
- crear endpoints públicos de reuniones;
- exponer asistencia de terceros;
- permitir participantes de otro tenant;
- permitir asistencia duplicada;
- permitir representaciones cross-tenant;
- modificar asistencia cerrada sin override;
- calcular quórum modificando asistencia;
- tratar resoluciones como votación formal;
- generar multas automáticas por inasistencia;
- implementar firma electrónica;
- implementar QR real;
- implementar IA con datos reales;
- omitir auditoría;
- guardar body completo de actas en logs.
```

---

# 4. Fase 0 — Preparación

## 4.1. Revisión documental

* [ ] T013-0001 — Revisar `spec.md`.
* [ ] T013-0002 — Revisar `plan.md`.
* [ ] T013-0003 — Revisar `data-model.md`.
* [ ] T013-0004 — Revisar `api-contract.md`.
* [ ] T013-0005 — Revisar `test-plan.md`.
* [ ] T013-0006 — Confirmar dependencias con `001-tenants`.
* [ ] T013-0007 — Confirmar dependencias con `002-users-roles`.
* [ ] T013-0008 — Confirmar dependencias con `003-residents-properties`.
* [ ] T013-0009 — Confirmar dependencias con `007-audit`.
* [ ] T013-0010 — Confirmar dependencias con `012-communications-notifications`.

---

## 4.2. Validación de alcance MVP

* [ ] T013-0011 — Confirmar que el MVP incluye reuniones, agenda, participantes, asistencia, proxies, quórum, actas preliminares y resoluciones básicas.
* [ ] T013-0012 — Confirmar que votación electrónica queda fuera de alcance.
* [ ] T013-0013 — Confirmar que firma electrónica queda fuera de alcance.
* [ ] T013-0014 — Confirmar que actas PDF formales quedan fuera de alcance.
* [ ] T013-0015 — Confirmar que QR real queda fuera de alcance.
* [ ] T013-0016 — Confirmar que IA con datos reales queda fuera de alcance.
* [ ] T013-0017 — Confirmar que multas automáticas por inasistencia quedan fuera de alcance.
* [ ] T013-0018 — Confirmar que no habrá endpoints públicos de reuniones.

---

# 5. Fase 1 — Estructura base del módulo

## 5.1. Crear estructura de carpetas

* [ ] T013-0101 — Crear carpeta `apps/api/src/modules/meetings/`.
* [ ] T013-0102 — Crear `meetings.module.ts`.
* [ ] T013-0103 — Crear carpeta `application/use-cases/`.
* [ ] T013-0104 — Crear carpeta `application/services/`.
* [ ] T013-0105 — Crear carpeta `application/ports/`.
* [ ] T013-0106 — Crear carpeta `domain/entities/`.
* [ ] T013-0107 — Crear carpeta `domain/value-objects/`.
* [ ] T013-0108 — Crear carpeta `domain/events/`.
* [ ] T013-0109 — Crear carpeta `domain/errors/`.
* [ ] T013-0110 — Crear carpeta `infrastructure/persistence/`.
* [ ] T013-0111 — Crear carpeta `infrastructure/integrations/`.
* [ ] T013-0112 — Crear carpeta `infrastructure/audit/`.
* [ ] T013-0113 — Crear carpeta `policies/`.
* [ ] T013-0114 — Crear carpeta `dto/`.
* [ ] T013-0115 — Crear carpeta `tests/`.

---

## 5.2. Registrar módulo

* [ ] T013-0120 — Registrar `MeetingsModule` en el módulo principal de la API.
* [ ] T013-0121 — Inyectar dependencias base de Prisma.
* [ ] T013-0122 — Inyectar dependencias de auditoría.
* [ ] T013-0123 — Inyectar puerto de notificaciones.
* [ ] T013-0124 — Inyectar puertos de personas, unidades y roles.
* [ ] T013-0125 — Validar que el módulo compila vacío.
* [ ] T013-0126 — Agregar smoke test de carga del módulo.

---

# 6. Fase 2 — Enums y Value Objects

## 6.1. Enums de dominio

* [ ] T013-0201 — Implementar `MeetingType`.
* [ ] T013-0202 — Implementar `MeetingModality`.
* [ ] T013-0203 — Implementar `MeetingStatus`.
* [ ] T013-0204 — Implementar `MeetingVisibility`.
* [ ] T013-0205 — Implementar `AgendaItemStatus`.
* [ ] T013-0206 — Implementar `ParticipantType`.
* [ ] T013-0207 — Implementar `ParticipantStatus`.
* [ ] T013-0208 — Implementar `ParticipantResponse`.
* [ ] T013-0209 — Implementar `AttendanceStatus`.
* [ ] T013-0210 — Implementar `AttendanceRegistrationMethod`.
* [ ] T013-0211 — Implementar `ProxyStatus`.
* [ ] T013-0212 — Implementar `QuorumRuleType`.
* [ ] T013-0213 — Implementar `MinutesStatus`.
* [ ] T013-0214 — Implementar `ResolutionType`.
* [ ] T013-0215 — Implementar `ResolutionStatus`.

---

## 6.2. Value Objects

* [ ] T013-0220 — Implementar `MeetingTitle`.
* [ ] T013-0221 — Implementar `MeetingContent`.
* [ ] T013-0222 — Implementar `AgendaTitle`.
* [ ] T013-0223 — Implementar `QuorumResult`.
* [ ] T013-0224 — Implementar validación de string decimal para quórum.
* [ ] T013-0225 — Implementar validación de URL segura para `virtualMeetingUrl`.
* [ ] T013-0226 — Implementar validación de `documentReference`.
* [ ] T013-0227 — Implementar sanitización básica de contenido.
* [ ] T013-0228 — Bloquear `<script>`, `<iframe>`, `<object>`, `<embed>`.
* [ ] T013-0229 — Bloquear `javascript:` y handlers inline.

---

## 6.3. Tests de Value Objects

* [ ] T013-0230 — Crear tests de `MeetingType`.
* [ ] T013-0231 — Crear tests de `MeetingModality`.
* [ ] T013-0232 — Crear tests de `MeetingStatus`.
* [ ] T013-0233 — Crear tests de `MeetingVisibility`.
* [ ] T013-0234 — Crear tests de `ParticipantType`.
* [ ] T013-0235 — Crear tests de `AttendanceStatus`.
* [ ] T013-0236 — Crear tests de `ProxyStatus`.
* [ ] T013-0237 — Crear tests de `QuorumRuleType`.
* [ ] T013-0238 — Crear tests de `MinutesStatus`.
* [ ] T013-0239 — Crear tests de `ResolutionStatus`.
* [ ] T013-0240 — Crear tests de `MeetingTitle`.
* [ ] T013-0241 — Crear tests de `MeetingContent`.
* [ ] T013-0242 — Crear tests de `QuorumResult`.
* [ ] T013-0243 — Ejecutar `npm run test:meetings:unit`.

---

# 7. Fase 3 — Entidades de dominio

## 7.1. Entidad `Meeting`

* [ ] T013-0301 — Crear `meeting.entity.ts`.
* [ ] T013-0302 — Implementar creación en estado `draft`.
* [ ] T013-0303 — Implementar validación de título.
* [ ] T013-0304 — Implementar validación de fechas.
* [ ] T013-0305 — Implementar validación de modalidad.
* [ ] T013-0306 — Implementar transición `draft -> scheduled`.
* [ ] T013-0307 — Implementar transición `scheduled -> called`.
* [ ] T013-0308 — Implementar transición `called -> inProgress`.
* [ ] T013-0309 — Implementar transición `inProgress -> attendanceClosed`.
* [ ] T013-0310 — Implementar transición `attendanceClosed -> completed`.
* [ ] T013-0311 — Implementar transición `completed -> archived`.
* [ ] T013-0312 — Implementar cancelación con razón.
* [ ] T013-0313 — Implementar archivo lógico.
* [ ] T013-0314 — Implementar actualización de resultado de quórum.
* [ ] T013-0315 — Crear tests de entidad `Meeting`.

---

## 7.2. Entidad `MeetingAgendaItem`

* [ ] T013-0320 — Crear `meeting-agenda-item.entity.ts`.
* [ ] T013-0321 — Implementar creación de punto de agenda.
* [ ] T013-0322 — Validar `order`.
* [ ] T013-0323 — Validar `title`.
* [ ] T013-0324 — Validar `estimatedMinutes`.
* [ ] T013-0325 — Implementar completar punto.
* [ ] T013-0326 — Implementar saltar punto.
* [ ] T013-0327 — Implementar archivo lógico.
* [ ] T013-0328 — Crear tests de entidad `MeetingAgendaItem`.

---

## 7.3. Entidad `MeetingParticipant`

* [ ] T013-0330 — Crear `meeting-participant.entity.ts`.
* [ ] T013-0331 — Implementar creación por usuario.
* [ ] T013-0332 — Implementar creación por persona.
* [ ] T013-0333 — Implementar creación por unidad.
* [ ] T013-0334 — Implementar creación por rol.
* [ ] T013-0335 — Implementar creación por grupo `owners`.
* [ ] T013-0336 — Implementar creación por grupo `residents`.
* [ ] T013-0337 — Implementar creación por grupo `allTenantUsers`.
* [ ] T013-0338 — Validar combinaciones inválidas.
* [ ] T013-0339 — Implementar estado inicial `invited`.
* [ ] T013-0340 — Implementar respuesta inicial `pending`.
* [ ] T013-0341 — Crear tests de entidad `MeetingParticipant`.

---

## 7.4. Entidad `MeetingAttendance`

* [ ] T013-0350 — Crear `meeting-attendance.entity.ts`.
* [ ] T013-0351 — Implementar creación `present`.
* [ ] T013-0352 — Implementar creación `absent`.
* [ ] T013-0353 — Implementar creación `late`.
* [ ] T013-0354 — Implementar creación `represented`.
* [ ] T013-0355 — Implementar creación `excused`.
* [ ] T013-0356 — Validar existencia de sujeto.
* [ ] T013-0357 — Validar `checkOutAt > checkInAt`.
* [ ] T013-0358 — Validar `represented` con `proxyId`.
* [ ] T013-0359 — Implementar `checkOut`.
* [ ] T013-0360 — Implementar `excuse`.
* [ ] T013-0361 — Implementar archivo lógico.
* [ ] T013-0362 — Crear tests de entidad `MeetingAttendance`.

---

## 7.5. Entidad `MeetingProxy`

* [ ] T013-0370 — Crear `meeting-proxy.entity.ts`.
* [ ] T013-0371 — Implementar creación `submitted`.
* [ ] T013-0372 — Validar sujeto representado.
* [ ] T013-0373 — Validar sujeto representante.
* [ ] T013-0374 — Implementar aprobación.
* [ ] T013-0375 — Implementar rechazo con razón.
* [ ] T013-0376 — Implementar cancelación con razón.
* [ ] T013-0377 — Implementar archivo lógico.
* [ ] T013-0378 — Crear tests de entidad `MeetingProxy`.

---

## 7.6. Entidad `MeetingMinutes`

* [ ] T013-0380 — Crear `meeting-minutes.entity.ts`.
* [ ] T013-0381 — Implementar creación `draft`.
* [ ] T013-0382 — Validar título.
* [ ] T013-0383 — Validar body.
* [ ] T013-0384 — Sanitizar contenido.
* [ ] T013-0385 — Implementar `submitReview`.
* [ ] T013-0386 — Implementar `approve`.
* [ ] T013-0387 — Implementar `publish`.
* [ ] T013-0388 — Implementar archivo lógico.
* [ ] T013-0389 — Crear tests de entidad `MeetingMinutes`.

---

## 7.7. Entidad `MeetingResolution`

* [ ] T013-0390 — Crear `meeting-resolution.entity.ts`.
* [ ] T013-0391 — Implementar creación `recorded`.
* [ ] T013-0392 — Validar título.
* [ ] T013-0393 — Validar descripción.
* [ ] T013-0394 — Validar tipo de resolución.
* [ ] T013-0395 — Implementar aprobación.
* [ ] T013-0396 — Implementar cancelación con razón.
* [ ] T013-0397 — Implementar archivo lógico.
* [ ] T013-0398 — Garantizar que no represente votación formal.
* [ ] T013-0399 — Crear tests de entidad `MeetingResolution`.

---

# 8. Fase 4 — Modelo Prisma y migraciones

## 8.1. Enums Prisma

* [ ] T013-0401 — Agregar enum `MeetingType` en Prisma.
* [ ] T013-0402 — Agregar enum `MeetingModality` en Prisma.
* [ ] T013-0403 — Agregar enum `MeetingStatus` en Prisma.
* [ ] T013-0404 — Agregar enum `MeetingVisibility` en Prisma.
* [ ] T013-0405 — Agregar enum `AgendaItemStatus` en Prisma.
* [ ] T013-0406 — Agregar enum `ParticipantType` en Prisma.
* [ ] T013-0407 — Agregar enum `ParticipantStatus` en Prisma.
* [ ] T013-0408 — Agregar enum `ParticipantResponse` en Prisma.
* [ ] T013-0409 — Agregar enum `AttendanceStatus` en Prisma.
* [ ] T013-0410 — Agregar enum `AttendanceRegistrationMethod` en Prisma.
* [ ] T013-0411 — Agregar enum `ProxyStatus` en Prisma.
* [ ] T013-0412 — Agregar enum `QuorumRuleType` en Prisma.
* [ ] T013-0413 — Agregar enum `MinutesStatus` en Prisma.
* [ ] T013-0414 — Agregar enum `ResolutionType` en Prisma.
* [ ] T013-0415 — Agregar enum `ResolutionStatus` en Prisma.

---

## 8.2. Modelos Prisma

* [ ] T013-0420 — Crear modelo `Meeting`.
* [ ] T013-0421 — Crear modelo `MeetingAgendaItem`.
* [ ] T013-0422 — Crear modelo `MeetingParticipant`.
* [ ] T013-0423 — Crear modelo `MeetingAttendance`.
* [ ] T013-0424 — Crear modelo `MeetingProxy`.
* [ ] T013-0425 — Crear modelo `MeetingMinutes`.
* [ ] T013-0426 — Crear modelo `MeetingResolution`.
* [ ] T013-0427 — Agregar relaciones en `Tenant`.
* [ ] T013-0428 — Agregar relaciones en `UserProfile`.
* [ ] T013-0429 — Agregar relaciones en `Person`.
* [ ] T013-0430 — Agregar relaciones en `PropertyUnit`.
* [ ] T013-0431 — Alinear relación de roles con `002-users-roles`.

---

## 8.3. Índices y constraints

* [ ] T013-0440 — Crear índices de `meetings`.
* [ ] T013-0441 — Crear índices de `meeting_agenda_items`.
* [ ] T013-0442 — Crear índice único `(tenant_id, meeting_id, order)`.
* [ ] T013-0443 — Crear índices de `meeting_participants`.
* [ ] T013-0444 — Crear índices de `meeting_attendance`.
* [ ] T013-0445 — Crear índices de `meeting_proxies`.
* [ ] T013-0446 — Crear índices de `meeting_minutes`.
* [ ] T013-0447 — Crear índices de `meeting_resolutions`.
* [ ] T013-0448 — Agregar constraint `ends_at > starts_at`.
* [ ] T013-0449 — Agregar constraint de quórum no negativo.
* [ ] T013-0450 — Agregar constraint de `estimated_minutes >= 0`.
* [ ] T013-0451 — Agregar constraint `check_out_at > check_in_at`.
* [ ] T013-0452 — Agregar constraint de asistencia con sujeto.
* [ ] T013-0453 — Agregar constraint de proxy con representado.
* [ ] T013-0454 — Agregar constraint de proxy con representante.
* [ ] T013-0455 — Crear índice parcial de asistencia única por participante.
* [ ] T013-0456 — Crear índice parcial de asistencia única por usuario.
* [ ] T013-0457 — Crear índice parcial de asistencia única por persona.
* [ ] T013-0458 — Crear índice parcial de asistencia única por unidad.
* [ ] T013-0459 — Crear índice parcial de asistencia única por proxy.
* [ ] T013-0460 — Crear índice parcial opcional de proxy aprobado único por unidad.

---

## 8.4. Migración

* [ ] T013-0470 — Crear migración `013_create_meetings_attendance`.
* [ ] T013-0471 — Ejecutar migración en base de datos local.
* [ ] T013-0472 — Ejecutar migración en base de datos test.
* [ ] T013-0473 — Validar Prisma Client generado.
* [ ] T013-0474 — Validar rollback en entorno local si aplica.
* [ ] T013-0475 — Documentar decisiones de constraints raw.
* [ ] T013-0476 — Ejecutar tests de repositorio iniciales.

---

# 9. Fase 5 — Puertos y repositorios

## 9.1. Puertos de aplicación

* [ ] T013-0501 — Crear `MeetingReaderPort`.
* [ ] T013-0502 — Crear `MeetingWriterPort`.
* [ ] T013-0503 — Crear `MeetingAgendaReaderPort`.
* [ ] T013-0504 — Crear `MeetingAgendaWriterPort`.
* [ ] T013-0505 — Crear `MeetingParticipantReaderPort`.
* [ ] T013-0506 — Crear `MeetingParticipantWriterPort`.
* [ ] T013-0507 — Crear `MeetingAttendanceReaderPort`.
* [ ] T013-0508 — Crear `MeetingAttendanceWriterPort`.
* [ ] T013-0509 — Crear `MeetingProxyReaderPort`.
* [ ] T013-0510 — Crear `MeetingProxyWriterPort`.
* [ ] T013-0511 — Crear `MeetingMinutesReaderPort`.
* [ ] T013-0512 — Crear `MeetingMinutesWriterPort`.
* [ ] T013-0513 — Crear `MeetingResolutionReaderPort`.
* [ ] T013-0514 — Crear `MeetingResolutionWriterPort`.
* [ ] T013-0515 — Crear `MeetingPersonDirectoryPort`.
* [ ] T013-0516 — Crear `MeetingPropertyUnitPort`.
* [ ] T013-0517 — Crear `MeetingRoleDirectoryPort`.
* [ ] T013-0518 — Crear `MeetingNotificationPort`.
* [ ] T013-0519 — Crear `MeetingAuditPort`.

---

## 9.2. Repositorios Prisma

* [ ] T013-0520 — Implementar `PrismaMeetingRepository`.
* [ ] T013-0521 — Implementar `PrismaMeetingAgendaRepository`.
* [ ] T013-0522 — Implementar `PrismaMeetingParticipantRepository`.
* [ ] T013-0523 — Implementar `PrismaMeetingAttendanceRepository`.
* [ ] T013-0524 — Implementar `PrismaMeetingProxyRepository`.
* [ ] T013-0525 — Implementar `PrismaMeetingMinutesRepository`.
* [ ] T013-0526 — Implementar `PrismaMeetingResolutionRepository`.
* [ ] T013-0527 — Implementar `meetings.mapper.ts`.
* [ ] T013-0528 — Validar que ningún repositorio busque recursos solo por `id`.
* [ ] T013-0529 — Validar que toda consulta use `tenantId`.

---

## 9.3. Adapters de integración

* [ ] T013-0530 — Implementar `MeetingPersonDirectoryAdapter`.
* [ ] T013-0531 — Implementar `MeetingPropertyUnitAdapter`.
* [ ] T013-0532 — Implementar `MeetingRoleDirectoryAdapter`.
* [ ] T013-0533 — Implementar `MeetingNotificationAdapter`.
* [ ] T013-0534 — Implementar `MeetingAuditAdapter`.

---

## 9.4. Tests de repositorio

* [ ] T013-0540 — Test `create meeting`.
* [ ] T013-0541 — Test `find meeting by tenant`.
* [ ] T013-0542 — Test `tenant A no ve meetings tenant B`.
* [ ] T013-0543 — Test filtros de reuniones.
* [ ] T013-0544 — Test archivo lógico de reuniones.
* [ ] T013-0545 — Test creación de agenda.
* [ ] T013-0546 — Test orden único de agenda.
* [ ] T013-0547 — Test creación de participantes.
* [ ] T013-0548 — Test reemplazo de participantes.
* [ ] T013-0549 — Test creación de asistencia.
* [ ] T013-0550 — Test duplicidad de asistencia.
* [ ] T013-0551 — Test creación/aprobación de proxy.
* [ ] T013-0552 — Test creación/publicación de acta.
* [ ] T013-0553 — Test creación/aprobación de resolución.
* [ ] T013-0554 — Ejecutar `npm run test:meetings:repositories`.

---

# 10. Fase 6 — Servicios de aplicación

## 10.1. Servicios base

* [ ] T013-0601 — Implementar `MeetingService`.
* [ ] T013-0602 — Implementar `MeetingStateMachineService`.
* [ ] T013-0603 — Implementar `MeetingAgendaService`.
* [ ] T013-0604 — Implementar `MeetingParticipantService`.
* [ ] T013-0605 — Implementar `MeetingAudienceService`.
* [ ] T013-0606 — Implementar `MeetingAttendanceService`.
* [ ] T013-0607 — Implementar `MeetingAttendancePolicyService`.
* [ ] T013-0608 — Implementar `MeetingProxyService`.
* [ ] T013-0609 — Implementar `MeetingQuorumService`.
* [ ] T013-0610 — Implementar `MeetingMinutesService`.
* [ ] T013-0611 — Implementar `MeetingResolutionService`.
* [ ] T013-0612 — Implementar `MeetingNotificationService`.
* [ ] T013-0613 — Implementar `MeetingContentSanitizerService`.
* [ ] T013-0614 — Implementar `MeetingAuditService`.

---

## 10.2. Tests de servicios

* [ ] T013-0620 — Test `MeetingService`.
* [ ] T013-0621 — Test `MeetingStateMachineService`.
* [ ] T013-0622 — Test `MeetingAgendaService`.
* [ ] T013-0623 — Test `MeetingParticipantService`.
* [ ] T013-0624 — Test `MeetingAudienceService`.
* [ ] T013-0625 — Test `MeetingAttendanceService`.
* [ ] T013-0626 — Test `MeetingAttendancePolicyService`.
* [ ] T013-0627 — Test `MeetingProxyService`.
* [ ] T013-0628 — Test `MeetingQuorumService`.
* [ ] T013-0629 — Test `MeetingMinutesService`.
* [ ] T013-0630 — Test `MeetingResolutionService`.
* [ ] T013-0631 — Test `MeetingNotificationService`.
* [ ] T013-0632 — Test `MeetingContentSanitizerService`.
* [ ] T013-0633 — Test `MeetingAuditService`.
* [ ] T013-0634 — Ejecutar `npm run test:meetings:application`.

---

# 11. Fase 7 — Casos de uso

## 11.1. Meetings

* [ ] T013-0701 — Implementar `CreateMeetingUseCase`.
* [ ] T013-0702 — Implementar `ListMeetingsUseCase`.
* [ ] T013-0703 — Implementar `GetMeetingUseCase`.
* [ ] T013-0704 — Implementar `UpdateMeetingUseCase`.
* [ ] T013-0705 — Implementar `ScheduleMeetingUseCase`.
* [ ] T013-0706 — Implementar `CallMeetingUseCase`.
* [ ] T013-0707 — Implementar `StartMeetingUseCase`.
* [ ] T013-0708 — Implementar `CancelMeetingUseCase`.
* [ ] T013-0709 — Implementar `CloseMeetingAttendanceUseCase`.
* [ ] T013-0710 — Implementar `CompleteMeetingUseCase`.
* [ ] T013-0711 — Implementar `ArchiveMeetingUseCase`.
* [ ] T013-0712 — Implementar `CalculateMeetingQuorumUseCase`.

---

## 11.2. Agenda

* [ ] T013-0720 — Implementar `CreateAgendaItemUseCase`.
* [ ] T013-0721 — Implementar `ListAgendaItemsUseCase`.
* [ ] T013-0722 — Implementar `GetAgendaItemUseCase`.
* [ ] T013-0723 — Implementar `UpdateAgendaItemUseCase`.
* [ ] T013-0724 — Implementar `ReorderAgendaItemsUseCase`.
* [ ] T013-0725 — Implementar `CompleteAgendaItemUseCase`.
* [ ] T013-0726 — Implementar `SkipAgendaItemUseCase`.
* [ ] T013-0727 — Implementar `ArchiveAgendaItemUseCase`.

---

## 11.3. Participantes

* [ ] T013-0730 — Implementar `ListMeetingParticipantsUseCase`.
* [ ] T013-0731 — Implementar `CreateMeetingParticipantUseCase`.
* [ ] T013-0732 — Implementar `ReplaceMeetingParticipantsUseCase`.
* [ ] T013-0733 — Implementar `GetMeetingParticipantUseCase`.
* [ ] T013-0734 — Implementar `UpdateMeetingParticipantUseCase`.
* [ ] T013-0735 — Implementar `ArchiveMeetingParticipantUseCase`.

---

## 11.4. Asistencia

* [ ] T013-0740 — Implementar `ListMeetingAttendanceUseCase`.
* [ ] T013-0741 — Implementar `RegisterMeetingAttendanceUseCase`.
* [ ] T013-0742 — Implementar `GetMeetingAttendanceUseCase`.
* [ ] T013-0743 — Implementar `UpdateMeetingAttendanceUseCase`.
* [ ] T013-0744 — Implementar `CheckOutMeetingAttendanceUseCase`.
* [ ] T013-0745 — Implementar `ExcuseMeetingAttendanceUseCase`.
* [ ] T013-0746 — Implementar `ArchiveMeetingAttendanceUseCase`.

---

## 11.5. Representaciones

* [ ] T013-0750 — Implementar `ListMeetingProxiesUseCase`.
* [ ] T013-0751 — Implementar `CreateMeetingProxyUseCase`.
* [ ] T013-0752 — Implementar `GetMeetingProxyUseCase`.
* [ ] T013-0753 — Implementar `ApproveMeetingProxyUseCase`.
* [ ] T013-0754 — Implementar `RejectMeetingProxyUseCase`.
* [ ] T013-0755 — Implementar `CancelMeetingProxyUseCase`.
* [ ] T013-0756 — Implementar `ArchiveMeetingProxyUseCase`.

---

## 11.6. Actas

* [ ] T013-0760 — Implementar `CreateMeetingMinutesUseCase`.
* [ ] T013-0761 — Implementar `GetMeetingMinutesUseCase`.
* [ ] T013-0762 — Implementar `GetMeetingMinutesByIdUseCase`.
* [ ] T013-0763 — Implementar `UpdateMeetingMinutesUseCase`.
* [ ] T013-0764 — Implementar `SubmitMeetingMinutesReviewUseCase`.
* [ ] T013-0765 — Implementar `ApproveMeetingMinutesUseCase`.
* [ ] T013-0766 — Implementar `PublishMeetingMinutesUseCase`.
* [ ] T013-0767 — Implementar `ArchiveMeetingMinutesUseCase`.

---

## 11.7. Resoluciones

* [ ] T013-0770 — Implementar `CreateMeetingResolutionUseCase`.
* [ ] T013-0771 — Implementar `ListMeetingResolutionsUseCase`.
* [ ] T013-0772 — Implementar `GetMeetingResolutionUseCase`.
* [ ] T013-0773 — Implementar `UpdateMeetingResolutionUseCase`.
* [ ] T013-0774 — Implementar `ApproveMeetingResolutionUseCase`.
* [ ] T013-0775 — Implementar `CancelMeetingResolutionUseCase`.
* [ ] T013-0776 — Implementar `ArchiveMeetingResolutionUseCase`.

---

## 11.8. Endpoints `/me`

* [ ] T013-0780 — Implementar `ListOwnMeetingsUseCase`.
* [ ] T013-0781 — Implementar `GetOwnMeetingUseCase`.
* [ ] T013-0782 — Implementar `ListOwnMeetingAgendaUseCase`.
* [ ] T013-0783 — Implementar `GetOwnMeetingAttendanceUseCase`.
* [ ] T013-0784 — Implementar `SelfCheckInMeetingAttendanceUseCase`.
* [ ] T013-0785 — Implementar `GetOwnMeetingMinutesUseCase`.
* [ ] T013-0786 — Implementar `ListOwnMeetingResolutionsUseCase`.
* [ ] T013-0787 — Implementar `ListOwnMeetingProxiesUseCase`.
* [ ] T013-0788 — Implementar `CreateOwnMeetingProxyUseCase`.

---

# 12. Fase 8 — DTOs

## 12.1. DTOs de Meetings

* [ ] T013-0801 — Crear `CreateMeetingDto`.
* [ ] T013-0802 — Crear `UpdateMeetingDto`.
* [ ] T013-0803 — Crear `ScheduleMeetingDto`.
* [ ] T013-0804 — Crear `CallMeetingDto`.
* [ ] T013-0805 — Crear `CancelMeetingDto`.
* [ ] T013-0806 — Crear `ArchiveMeetingDto`.
* [ ] T013-0807 — Crear `MeetingAdminDto`.
* [ ] T013-0808 — Crear `MeetingListItemDto`.

---

## 12.2. DTOs de Agenda

* [ ] T013-0810 — Crear `CreateAgendaItemDto`.
* [ ] T013-0811 — Crear `UpdateAgendaItemDto`.
* [ ] T013-0812 — Crear `ReorderAgendaItemsDto`.
* [ ] T013-0813 — Crear `SkipAgendaItemDto`.
* [ ] T013-0814 — Crear `MeetingAgendaItemDto`.

---

## 12.3. DTOs de Participantes

* [ ] T013-0820 — Crear `CreateMeetingParticipantDto`.
* [ ] T013-0821 — Crear `ReplaceMeetingParticipantsDto`.
* [ ] T013-0822 — Crear `UpdateMeetingParticipantDto`.
* [ ] T013-0823 — Crear `MeetingParticipantDto`.

---

## 12.4. DTOs de Asistencia

* [ ] T013-0830 — Crear `RegisterMeetingAttendanceDto`.
* [ ] T013-0831 — Crear `UpdateMeetingAttendanceDto`.
* [ ] T013-0832 — Crear `CheckOutMeetingAttendanceDto`.
* [ ] T013-0833 — Crear `ExcuseMeetingAttendanceDto`.
* [ ] T013-0834 — Crear `MeetingAttendanceDto`.

---

## 12.5. DTOs de Representaciones

* [ ] T013-0840 — Crear `CreateMeetingProxyDto`.
* [ ] T013-0841 — Crear `RejectMeetingProxyDto`.
* [ ] T013-0842 — Crear `CancelMeetingProxyDto`.
* [ ] T013-0843 — Crear `MeetingProxyDto`.

---

## 12.6. DTOs de Actas

* [ ] T013-0850 — Crear `CreateMeetingMinutesDto`.
* [ ] T013-0851 — Crear `UpdateMeetingMinutesDto`.
* [ ] T013-0852 — Crear `PublishMeetingMinutesDto`.
* [ ] T013-0853 — Crear `MeetingMinutesDto`.

---

## 12.7. DTOs de Resoluciones

* [ ] T013-0860 — Crear `CreateMeetingResolutionDto`.
* [ ] T013-0861 — Crear `UpdateMeetingResolutionDto`.
* [ ] T013-0862 — Crear `CancelMeetingResolutionDto`.
* [ ] T013-0863 — Crear `MeetingResolutionDto`.

---

## 12.8. DTOs `/me`

* [ ] T013-0870 — Crear `OwnMeetingDto`.
* [ ] T013-0871 — Crear `OwnMeetingAgendaItemDto`.
* [ ] T013-0872 — Crear `OwnMeetingAttendanceDto`.
* [ ] T013-0873 — Crear `SelfCheckInMeetingAttendanceDto`.
* [ ] T013-0874 — Crear `OwnMeetingMinutesDto`.
* [ ] T013-0875 — Crear `OwnMeetingResolutionDto`.
* [ ] T013-0876 — Crear `OwnMeetingProxyDto`.
* [ ] T013-0877 — Crear `CreateOwnMeetingProxyDto`.

---

## 12.9. Tests de DTOs

* [ ] T013-0880 — Test de `CreateMeetingDto`.
* [ ] T013-0881 — Test de `UpdateMeetingDto`.
* [ ] T013-0882 — Test de DTOs de agenda.
* [ ] T013-0883 — Test de DTOs de participantes.
* [ ] T013-0884 — Test de DTOs de asistencia.
* [ ] T013-0885 — Test de DTOs de proxies.
* [ ] T013-0886 — Test de DTOs de actas.
* [ ] T013-0887 — Test de DTOs de resoluciones.
* [ ] T013-0888 — Test de DTOs `/me`.
* [ ] T013-0889 — Verificar rechazo de `tenantId` en todos los bodies.
* [ ] T013-0890 — Ejecutar `npm run test:meetings:dto`.

---

# 13. Fase 9 — Guards, policies y autorización

## 13.1. Guards

* [ ] T013-0901 — Implementar `MeetingPermissionGuard`.
* [ ] T013-0902 — Implementar `OwnMeetingGuard`.
* [ ] T013-0903 — Implementar `MeetingAttendanceGuard`.
* [ ] T013-0904 — Implementar `MeetingProxyGuard`.
* [ ] T013-0905 — Implementar `MeetingMinutesGuard`.
* [ ] T013-0906 — Implementar `MeetingResolutionGuard`.

---

## 13.2. Políticas

* [ ] T013-0910 — Implementar política de acceso administrativo.
* [ ] T013-0911 — Implementar política de acceso propio por usuario.
* [ ] T013-0912 — Implementar política de acceso propio por persona.
* [ ] T013-0913 — Implementar política de acceso propio por unidad.
* [ ] T013-0914 — Implementar política de acceso propio por rol.
* [ ] T013-0915 — Implementar política para `owners`.
* [ ] T013-0916 — Implementar política para `residents`.
* [ ] T013-0917 — Implementar política para `allTenantUsers`.
* [ ] T013-0918 — Implementar política para `boardMembers`.
* [ ] T013-0919 — Implementar política para `committeeMembers`.

---

## 13.3. Permisos

* [ ] T013-0920 — Registrar permisos `meetings.*`.
* [ ] T013-0921 — Registrar permisos `meetingAgenda.*`.
* [ ] T013-0922 — Registrar permisos `meetingParticipants.*`.
* [ ] T013-0923 — Registrar permisos `meetingAttendance.*`.
* [ ] T013-0924 — Registrar permisos `meetingProxies.*`.
* [ ] T013-0925 — Registrar permisos `meetingQuorum.*`.
* [ ] T013-0926 — Registrar permisos `meetingMinutes.*`.
* [ ] T013-0927 — Registrar permisos `meetingResolutions.*`.
* [ ] T013-0928 — Registrar permisos `meetings.audit.read`.
* [ ] T013-0929 — Registrar permisos `meetings.reports.read`.
* [ ] T013-0930 — Actualizar seeds de roles base del tenant.

---

## 13.4. Tests de autorización

* [ ] T013-0940 — Test 401 sin token en endpoints privados.
* [ ] T013-0941 — Test 403 sin membership.
* [ ] T013-0942 — Test 403 usuario disabled.
* [ ] T013-0943 — Test `meetings.create`.
* [ ] T013-0944 — Test `meetings.read`.
* [ ] T013-0945 — Test `meetings.update`.
* [ ] T013-0946 — Test `meetingAttendance.create`.
* [ ] T013-0947 — Test `meetingAttendance.override`.
* [ ] T013-0948 — Test `meetingMinutes.publish`.
* [ ] T013-0949 — Test `meetingQuorum.calculate`.
* [ ] T013-0950 — Test PlatformAdmin sin acceso automático.
* [ ] T013-0951 — Ejecutar `npm run test:meetings:authorization`.

---

# 14. Fase 10 — Controladores REST

## 14.1. MeetingsController

* [ ] T013-1001 — Crear `meetings.controller.ts`.
* [ ] T013-1002 — Implementar `GET /api/v1/tenant/meetings`.
* [ ] T013-1003 — Implementar `POST /api/v1/tenant/meetings`.
* [ ] T013-1004 — Implementar `GET /api/v1/tenant/meetings/{meetingId}`.
* [ ] T013-1005 — Implementar `PATCH /api/v1/tenant/meetings/{meetingId}`.
* [ ] T013-1006 — Implementar `POST /schedule`.
* [ ] T013-1007 — Implementar `POST /call`.
* [ ] T013-1008 — Implementar `POST /start`.
* [ ] T013-1009 — Implementar `POST /cancel`.
* [ ] T013-1010 — Implementar `POST /close-attendance`.
* [ ] T013-1011 — Implementar `POST /complete`.
* [ ] T013-1012 — Implementar `POST /archive`.
* [ ] T013-1013 — Implementar `POST /calculate-quorum`.

---

## 14.2. MeetingAgendaController

* [ ] T013-1020 — Crear `meeting-agenda.controller.ts`.
* [ ] T013-1021 — Implementar `GET /meetings/{meetingId}/agenda`.
* [ ] T013-1022 — Implementar `POST /meetings/{meetingId}/agenda`.
* [ ] T013-1023 — Implementar `GET /meeting-agenda-items/{agendaItemId}`.
* [ ] T013-1024 — Implementar `PATCH /meeting-agenda-items/{agendaItemId}`.
* [ ] T013-1025 — Implementar `POST /meetings/{meetingId}/agenda/reorder`.
* [ ] T013-1026 — Implementar `POST /meeting-agenda-items/{agendaItemId}/complete`.
* [ ] T013-1027 — Implementar `POST /meeting-agenda-items/{agendaItemId}/skip`.
* [ ] T013-1028 — Implementar `POST /meeting-agenda-items/{agendaItemId}/archive`.

---

## 14.3. MeetingParticipantsController

* [ ] T013-1030 — Crear `meeting-participants.controller.ts`.
* [ ] T013-1031 — Implementar `GET /meetings/{meetingId}/participants`.
* [ ] T013-1032 — Implementar `POST /meetings/{meetingId}/participants`.
* [ ] T013-1033 — Implementar `PUT /meetings/{meetingId}/participants`.
* [ ] T013-1034 — Implementar `GET /meeting-participants/{participantId}`.
* [ ] T013-1035 — Implementar `PATCH /meeting-participants/{participantId}`.
* [ ] T013-1036 — Implementar `POST /meeting-participants/{participantId}/archive`.

---

## 14.4. MeetingAttendanceController

* [ ] T013-1040 — Crear `meeting-attendance.controller.ts`.
* [ ] T013-1041 — Implementar `GET /meetings/{meetingId}/attendance`.
* [ ] T013-1042 — Implementar `POST /meetings/{meetingId}/attendance`.
* [ ] T013-1043 — Implementar `GET /meeting-attendance/{attendanceId}`.
* [ ] T013-1044 — Implementar `PATCH /meeting-attendance/{attendanceId}`.
* [ ] T013-1045 — Implementar `POST /meeting-attendance/{attendanceId}/check-out`.
* [ ] T013-1046 — Implementar `POST /meeting-attendance/{attendanceId}/excuse`.
* [ ] T013-1047 — Implementar `POST /meeting-attendance/{attendanceId}/archive`.

---

## 14.5. MeetingProxiesController

* [ ] T013-1050 — Crear `meeting-proxies.controller.ts`.
* [ ] T013-1051 — Implementar `GET /meetings/{meetingId}/proxies`.
* [ ] T013-1052 — Implementar `POST /meetings/{meetingId}/proxies`.
* [ ] T013-1053 — Implementar `GET /meeting-proxies/{proxyId}`.
* [ ] T013-1054 — Implementar `POST /meeting-proxies/{proxyId}/approve`.
* [ ] T013-1055 — Implementar `POST /meeting-proxies/{proxyId}/reject`.
* [ ] T013-1056 — Implementar `POST /meeting-proxies/{proxyId}/cancel`.
* [ ] T013-1057 — Implementar `POST /meeting-proxies/{proxyId}/archive`.

---

## 14.6. MeetingMinutesController

* [ ] T013-1060 — Crear `meeting-minutes.controller.ts`.
* [ ] T013-1061 — Implementar `GET /meetings/{meetingId}/minutes`.
* [ ] T013-1062 — Implementar `POST /meetings/{meetingId}/minutes`.
* [ ] T013-1063 — Implementar `GET /meeting-minutes/{minutesId}`.
* [ ] T013-1064 — Implementar `PATCH /meeting-minutes/{minutesId}`.
* [ ] T013-1065 — Implementar `POST /meeting-minutes/{minutesId}/submit-review`.
* [ ] T013-1066 — Implementar `POST /meeting-minutes/{minutesId}/approve`.
* [ ] T013-1067 — Implementar `POST /meeting-minutes/{minutesId}/publish`.
* [ ] T013-1068 — Implementar `POST /meeting-minutes/{minutesId}/archive`.

---

## 14.7. MeetingResolutionsController

* [ ] T013-1070 — Crear `meeting-resolutions.controller.ts`.
* [ ] T013-1071 — Implementar `GET /meetings/{meetingId}/resolutions`.
* [ ] T013-1072 — Implementar `POST /meetings/{meetingId}/resolutions`.
* [ ] T013-1073 — Implementar `GET /meeting-resolutions/{resolutionId}`.
* [ ] T013-1074 — Implementar `PATCH /meeting-resolutions/{resolutionId}`.
* [ ] T013-1075 — Implementar `POST /meeting-resolutions/{resolutionId}/approve`.
* [ ] T013-1076 — Implementar `POST /meeting-resolutions/{resolutionId}/cancel`.
* [ ] T013-1077 — Implementar `POST /meeting-resolutions/{resolutionId}/archive`.

---

## 14.8. MyMeetingsController

* [ ] T013-1080 — Crear `my-meetings.controller.ts`.
* [ ] T013-1081 — Implementar `GET /api/v1/me/meetings`.
* [ ] T013-1082 — Implementar `GET /api/v1/me/meetings/{meetingId}`.
* [ ] T013-1083 — Implementar `GET /api/v1/me/meetings/{meetingId}/agenda`.
* [ ] T013-1084 — Implementar `GET /api/v1/me/meetings/{meetingId}/attendance`.
* [ ] T013-1085 — Implementar `POST /api/v1/me/meetings/{meetingId}/attendance/check-in`.
* [ ] T013-1086 — Implementar `GET /api/v1/me/meetings/{meetingId}/minutes`.
* [ ] T013-1087 — Implementar `GET /api/v1/me/meetings/{meetingId}/resolutions`.
* [ ] T013-1088 — Implementar `GET /api/v1/me/meeting-proxies`.
* [ ] T013-1089 — Implementar `POST /api/v1/me/meetings/{meetingId}/proxies`.

---

# 15. Fase 11 — API tests

## 15.1. Meetings administrativas

* [ ] T013-1101 — Test `GET /api/v1/tenant/meetings`.
* [ ] T013-1102 — Test `POST /api/v1/tenant/meetings`.
* [ ] T013-1103 — Test `GET /api/v1/tenant/meetings/{meetingId}`.
* [ ] T013-1104 — Test `PATCH /api/v1/tenant/meetings/{meetingId}`.
* [ ] T013-1105 — Test `POST /schedule`.
* [ ] T013-1106 — Test `POST /call`.
* [ ] T013-1107 — Test `POST /start`.
* [ ] T013-1108 — Test `POST /cancel`.
* [ ] T013-1109 — Test `POST /close-attendance`.
* [ ] T013-1110 — Test `POST /complete`.
* [ ] T013-1111 — Test `POST /archive`.
* [ ] T013-1112 — Test `POST /calculate-quorum`.

---

## 15.2. Agenda

* [ ] T013-1120 — Test `GET agenda`.
* [ ] T013-1121 — Test `POST agenda`.
* [ ] T013-1122 — Test `GET agenda item`.
* [ ] T013-1123 — Test `PATCH agenda item`.
* [ ] T013-1124 — Test `POST reorder`.
* [ ] T013-1125 — Test `POST complete`.
* [ ] T013-1126 — Test `POST skip`.
* [ ] T013-1127 — Test `POST archive`.

---

## 15.3. Participantes

* [ ] T013-1130 — Test `GET participants`.
* [ ] T013-1131 — Test `POST participants`.
* [ ] T013-1132 — Test `PUT participants`.
* [ ] T013-1133 — Test `GET participant`.
* [ ] T013-1134 — Test `PATCH participant`.
* [ ] T013-1135 — Test `POST participant archive`.

---

## 15.4. Asistencia

* [ ] T013-1140 — Test `GET attendance`.
* [ ] T013-1141 — Test `POST attendance`.
* [ ] T013-1142 — Test `GET attendance record`.
* [ ] T013-1143 — Test `PATCH attendance`.
* [ ] T013-1144 — Test `POST check-out`.
* [ ] T013-1145 — Test `POST excuse`.
* [ ] T013-1146 — Test `POST attendance archive`.

---

## 15.5. Representaciones

* [ ] T013-1150 — Test `GET proxies`.
* [ ] T013-1151 — Test `POST proxy`.
* [ ] T013-1152 — Test `GET proxy`.
* [ ] T013-1153 — Test `POST approve proxy`.
* [ ] T013-1154 — Test `POST reject proxy`.
* [ ] T013-1155 — Test `POST cancel proxy`.
* [ ] T013-1156 — Test `POST archive proxy`.

---

## 15.6. Actas

* [ ] T013-1160 — Test `GET minutes by meeting`.
* [ ] T013-1161 — Test `POST minutes`.
* [ ] T013-1162 — Test `GET minutes by id`.
* [ ] T013-1163 — Test `PATCH minutes`.
* [ ] T013-1164 — Test `POST submit-review`.
* [ ] T013-1165 — Test `POST approve`.
* [ ] T013-1166 — Test `POST publish`.
* [ ] T013-1167 — Test `POST archive`.

---

## 15.7. Resoluciones

* [ ] T013-1170 — Test `GET resolutions`.
* [ ] T013-1171 — Test `POST resolution`.
* [ ] T013-1172 — Test `GET resolution`.
* [ ] T013-1173 — Test `PATCH resolution`.
* [ ] T013-1174 — Test `POST approve resolution`.
* [ ] T013-1175 — Test `POST cancel resolution`.
* [ ] T013-1176 — Test `POST archive resolution`.

---

## 15.8. Endpoints `/me`

* [ ] T013-1180 — Test `GET /api/v1/me/meetings`.
* [ ] T013-1181 — Test `GET /api/v1/me/meetings/{meetingId}`.
* [ ] T013-1182 — Test `GET /api/v1/me/meetings/{meetingId}/agenda`.
* [ ] T013-1183 — Test `GET /api/v1/me/meetings/{meetingId}/attendance`.
* [ ] T013-1184 — Test `POST /api/v1/me/meetings/{meetingId}/attendance/check-in`.
* [ ] T013-1185 — Test `GET /api/v1/me/meetings/{meetingId}/minutes`.
* [ ] T013-1186 — Test `GET /api/v1/me/meetings/{meetingId}/resolutions`.
* [ ] T013-1187 — Test `GET /api/v1/me/meeting-proxies`.
* [ ] T013-1188 — Test `POST /api/v1/me/meetings/{meetingId}/proxies`.

---

# 16. Fase 12 — Multitenancy

## 16.1. Tests de aislamiento

* [ ] T013-1201 — Tenant A no ve meetings de Tenant B.
* [ ] T013-1202 — Tenant A no ve agenda de Tenant B.
* [ ] T013-1203 — Tenant A no ve participantes de Tenant B.
* [ ] T013-1204 — Tenant A no ve asistencia de Tenant B.
* [ ] T013-1205 — Tenant A no ve proxies de Tenant B.
* [ ] T013-1206 — Tenant A no ve actas de Tenant B.
* [ ] T013-1207 — Tenant A no ve resoluciones de Tenant B.
* [ ] T013-1208 — Tenant A no modifica meetings de Tenant B.
* [ ] T013-1209 — Tenant A no cancela meetings de Tenant B.
* [ ] T013-1210 — Tenant A no calcula quórum de Tenant B.
* [ ] T013-1211 — Tenant A no archiva meetings de Tenant B.

---

## 16.2. Tests de referencias cross-tenant

* [ ] T013-1220 — Rechazar `userId` de otro tenant.
* [ ] T013-1221 — Rechazar `personId` de otro tenant.
* [ ] T013-1222 — Rechazar `propertyUnitId` de otro tenant.
* [ ] T013-1223 — Rechazar `roleId` de otro tenant.
* [ ] T013-1224 — Rechazar `participantId` de otro tenant.
* [ ] T013-1225 — Rechazar `proxyId` de otro tenant.
* [ ] T013-1226 — Rechazar `agendaItemId` de otro tenant.
* [ ] T013-1227 — Rechazar `minutesId` de otro tenant.
* [ ] T013-1228 — Rechazar `resolutionId` de otro tenant.
* [ ] T013-1229 — Ejecutar `npm run test:meetings:multitenancy`.

---

# 17. Fase 13 — Recurso propio `/me`

## 17.1. Acceso propio

* [ ] T013-1301 — Owner ve reuniones `owners`.
* [ ] T013-1302 — Resident ve reuniones `residents`.
* [ ] T013-1303 — OwnerResident ve reuniones `owners` y `residents`.
* [ ] T013-1304 — Usuario ve reuniones `allTenantUsers`.
* [ ] T013-1305 — BoardMember ve reuniones por rol.
* [ ] T013-1306 — CommitteeMember ve reuniones por rol.
* [ ] T013-1307 — Usuario ve reunión por unidad propia.
* [ ] T013-1308 — Usuario no ve reunión por unidad ajena.
* [ ] T013-1309 — Usuario no ve reunión `private` administrativa no dirigida.
* [ ] T013-1310 — Usuario no ve reuniones de Tenant B.

---

## 17.2. Privacidad propia

* [ ] T013-1320 — `/me/meetings` no devuelve participantes completos.
* [ ] T013-1321 — `/me/meetings` no devuelve asistencia de terceros.
* [ ] T013-1322 — `/me/meetings/{id}/attendance` solo devuelve asistencia propia.
* [ ] T013-1323 — `/me/meetings/{id}/attendance` no devuelve `registeredBy`.
* [ ] T013-1324 — `/me/meetings/{id}/attendance` no devuelve notas administrativas.
* [ ] T013-1325 — `/me/meetings/{id}/minutes` solo devuelve acta publicada autorizada.
* [ ] T013-1326 — `/me/meetings/{id}/resolutions` solo devuelve resoluciones autorizadas.
* [ ] T013-1327 — `/me/meeting-proxies` no devuelve proxies ajenos.
* [ ] T013-1328 — Usuario no crea proxy para unidad ajena.
* [ ] T013-1329 — Ejecutar `npm run test:meetings:own-resource`.

---

# 18. Fase 14 — Asistencia

## 18.1. Registro administrativo

* [ ] T013-1401 — Registrar asistencia `present`.
* [ ] T013-1402 — Registrar asistencia `absent`.
* [ ] T013-1403 — Registrar asistencia `late`.
* [ ] T013-1404 — Registrar asistencia `leftEarly`.
* [ ] T013-1405 — Registrar asistencia `excused`.
* [ ] T013-1406 — Registrar asistencia `represented` con proxy aprobado.
* [ ] T013-1407 — Rechazar `represented` sin proxy.
* [ ] T013-1408 — Rechazar `represented` con proxy no aprobado.

---

## 18.2. Estados permitidos

* [ ] T013-1410 — Rechazar asistencia en reunión `draft`.
* [ ] T013-1411 — Rechazar asistencia en reunión `scheduled` salvo política explícita.
* [ ] T013-1412 — Permitir asistencia en reunión `called`.
* [ ] T013-1413 — Permitir asistencia en reunión `inProgress`.
* [ ] T013-1414 — Rechazar asistencia ordinaria en `attendanceClosed`.
* [ ] T013-1415 — Permitir asistencia cerrada solo con override.
* [ ] T013-1416 — Rechazar asistencia en reunión `completed`.
* [ ] T013-1417 — Rechazar asistencia en reunión `cancelled`.
* [ ] T013-1418 — Rechazar asistencia en reunión `archived`.

---

## 18.3. Duplicidad

* [ ] T013-1420 — Evitar duplicidad por `participantId`.
* [ ] T013-1421 — Evitar duplicidad por `userId`.
* [ ] T013-1422 — Evitar duplicidad por `personId`.
* [ ] T013-1423 — Evitar duplicidad por `propertyUnitId`.
* [ ] T013-1424 — Evitar duplicidad por `proxyId`.
* [ ] T013-1425 — Confirmar error `MEETING_ATTENDANCE_DUPLICATE`.

---

## 18.4. Self check-in

* [ ] T013-1430 — Self check-in deshabilitado por defecto.
* [ ] T013-1431 — Self check-in habilitado por política.
* [ ] T013-1432 — Self check-in permitido en reunión `called`.
* [ ] T013-1433 — Self check-in permitido en reunión `inProgress`.
* [ ] T013-1434 — Self check-in rechazado en reunión `cancelled`.
* [ ] T013-1435 — Self check-in rechazado con asistencia cerrada.
* [ ] T013-1436 — Self check-in rechazado para unidad ajena.
* [ ] T013-1437 — Self check-in rechazado para persona ajena.
* [ ] T013-1438 — Self check-in evita duplicados.
* [ ] T013-1439 — Ejecutar `npm run test:meetings:attendance`.

---

# 19. Fase 15 — Representaciones

## 19.1. Flujo de proxy

* [ ] T013-1501 — Crear proxy `submitted`.
* [ ] T013-1502 — Aprobar proxy.
* [ ] T013-1503 — Rechazar proxy con razón.
* [ ] T013-1504 — Cancelar proxy con razón.
* [ ] T013-1505 — Archivar proxy.
* [ ] T013-1506 — Rechazar proxy sin representado.
* [ ] T013-1507 — Rechazar proxy sin representante.
* [ ] T013-1508 — Rechazar representado de otro tenant.
* [ ] T013-1509 — Rechazar representante de otro tenant.
* [ ] T013-1510 — Validar `documentReference` seguro.
* [ ] T013-1511 — Rechazar URL pública con token.
* [ ] T013-1512 — Rechazar credenciales en `documentReference`.

---

## 19.2. Proxy y asistencia

* [ ] T013-1520 — Proxy `submitted` no permite asistencia `represented`.
* [ ] T013-1521 — Proxy `approved` permite asistencia `represented`.
* [ ] T013-1522 — Proxy `rejected` no permite asistencia `represented`.
* [ ] T013-1523 — Proxy `cancelled` no permite asistencia `represented`.
* [ ] T013-1524 — Proxy `archived` no permite asistencia `represented`.
* [ ] T013-1525 — Ejecutar `npm run test:meetings:proxy`.

---

# 20. Fase 16 — Quórum

## 20.1. Implementación

* [ ] T013-1601 — Implementar cálculo `none`.
* [ ] T013-1602 — Implementar cálculo `participantCount`.
* [ ] T013-1603 — Implementar cálculo `propertyUnitCount`.
* [ ] T013-1604 — Implementar cálculo `percentageOfExpectedParticipants`.
* [ ] T013-1605 — Implementar cálculo `percentageOfPropertyUnits`.
* [ ] T013-1606 — Rechazar `custom` en MVP.
* [ ] T013-1607 — Usar Decimal para persistencia.
* [ ] T013-1608 — Exponer porcentajes como string decimal.
* [ ] T013-1609 — Guardar `quorumCalculatedValue`.
* [ ] T013-1610 — Guardar `quorumMet`.
* [ ] T013-1611 — Guardar `quorumCalculatedAt`.
* [ ] T013-1612 — Auditar `meeting.quorumCalculated`.

---

## 20.2. Tests

* [ ] T013-1620 — Test `none`.
* [ ] T013-1621 — Test `participantCount` true.
* [ ] T013-1622 — Test `participantCount` false.
* [ ] T013-1623 — Test `propertyUnitCount` true.
* [ ] T013-1624 — Test `propertyUnitCount` false.
* [ ] T013-1625 — Test `percentageOfExpectedParticipants` true.
* [ ] T013-1626 — Test `percentageOfExpectedParticipants` false.
* [ ] T013-1627 — Test `percentageOfPropertyUnits` true.
* [ ] T013-1628 — Test `percentageOfPropertyUnits` false.
* [ ] T013-1629 — Test cero participantes esperados.
* [ ] T013-1630 — Test `custom` unsupported.
* [ ] T013-1631 — Test que `present`, `late`, `represented` cuentan.
* [ ] T013-1632 — Test que `absent`, `excused`, `cancelled`, `archived` no cuentan.
* [ ] T013-1633 — Test que calcular quórum no modifica asistencia.
* [ ] T013-1634 — Ejecutar `npm run test:meetings:quorum`.

---

# 21. Fase 17 — Actas

## 21.1. Implementación de actas

* [ ] T013-1701 — Crear acta `draft`.
* [ ] T013-1702 — Evitar segunda acta activa por reunión.
* [ ] T013-1703 — Actualizar acta `draft`.
* [ ] T013-1704 — Sanitizar `title`.
* [ ] T013-1705 — Sanitizar `summary`.
* [ ] T013-1706 — Sanitizar `body`.
* [ ] T013-1707 — Bloquear scripts.
* [ ] T013-1708 — Enviar acta a revisión.
* [ ] T013-1709 — Aprobar acta.
* [ ] T013-1710 — Publicar acta.
* [ ] T013-1711 — Archivar acta.
* [ ] T013-1712 — Emitir evento `meeting.minutesPublished`.
* [ ] T013-1713 — No crear endpoint público de actas.

---

## 21.2. Tests de actas

* [ ] T013-1720 — Test crear acta.
* [ ] T013-1721 — Test acta duplicada.
* [ ] T013-1722 — Test actualizar acta.
* [ ] T013-1723 — Test sanitización.
* [ ] T013-1724 — Test bloqueo de scripts.
* [ ] T013-1725 — Test submit-review.
* [ ] T013-1726 — Test approve.
* [ ] T013-1727 — Test publish.
* [ ] T013-1728 — Test publish emite notificación.
* [ ] T013-1729 — Test no endpoint público.
* [ ] T013-1730 — Test usuario own solo ve acta publicada autorizada.
* [ ] T013-1731 — Ejecutar `npm run test:meetings:minutes`.

---

# 22. Fase 18 — Resoluciones

## 22.1. Implementación de resoluciones

* [ ] T013-1801 — Crear resolución básica.
* [ ] T013-1802 — Asociar resolución a agenda opcional.
* [ ] T013-1803 — Validar que agenda pertenezca a la reunión.
* [ ] T013-1804 — Validar que agenda pertenezca al tenant.
* [ ] T013-1805 — Actualizar resolución editable.
* [ ] T013-1806 — Aprobar resolución.
* [ ] T013-1807 — Cancelar resolución con razón.
* [ ] T013-1808 — Archivar resolución.
* [ ] T013-1809 — Garantizar que resolución no crea voto.
* [ ] T013-1810 — Garantizar que resolución no ejecuta acciones automáticas.
* [ ] T013-1811 — Garantizar que resolución no genera cargos, pagos ni multas.

---

## 22.2. Tests de resoluciones

* [ ] T013-1820 — Test crear resolución.
* [ ] T013-1821 — Test crear resolución con agenda válida.
* [ ] T013-1822 — Test rechazar agenda de otra reunión.
* [ ] T013-1823 — Test rechazar agenda de otro tenant.
* [ ] T013-1824 — Test actualizar resolución.
* [ ] T013-1825 — Test aprobar resolución.
* [ ] T013-1826 — Test cancelar con razón.
* [ ] T013-1827 — Test cancelar sin razón.
* [ ] T013-1828 — Test archivar.
* [ ] T013-1829 — Test no votación formal.
* [ ] T013-1830 — Test no acción automática.
* [ ] T013-1831 — Ejecutar `npm run test:meetings:resolutions`.

---

# 23. Fase 19 — Integración con notificaciones

## 23.1. Eventos

* [ ] T013-1901 — Emitir evento `meeting.called`.
* [ ] T013-1902 — Emitir evento `meeting.updated` si aplica.
* [ ] T013-1903 — Emitir evento `meeting.cancelled`.
* [ ] T013-1904 — Emitir evento `meeting.minutesPublished`.
* [ ] T013-1905 — Preparar evento opcional `meeting.reminderRequested`.
* [ ] T013-1906 — Construir payload mínimo.
* [ ] T013-1907 — Incluir `sourceType = meeting`.
* [ ] T013-1908 — Incluir `sourceId = meetingId`.
* [ ] T013-1909 — Incluir `actionUrl`.
* [ ] T013-1910 — No incluir lista completa de participantes.
* [ ] T013-1911 — No incluir asistencia completa.
* [ ] T013-1912 — No incluir acta completa.
* [ ] T013-1913 — No enviar email directamente desde Meetings.
* [ ] T013-1914 — No enviar WhatsApp/SMS/push directamente desde Meetings.

---

## 23.2. Tests de notificaciones

* [ ] T013-1920 — Test `call meeting` con `notifyParticipants = true`.
* [ ] T013-1921 — Test `call meeting` con `notifyParticipants = false`.
* [ ] T013-1922 — Test `cancel meeting` con notificación.
* [ ] T013-1923 — Test `publish minutes` con `notifyAudience = true`.
* [ ] T013-1924 — Test payload mínimo.
* [ ] T013-1925 — Test ausencia de participantes completos.
* [ ] T013-1926 — Test ausencia de asistencia completa.
* [ ] T013-1927 — Test ausencia de acta completa.
* [ ] T013-1928 — Test fallo de puerto de notificaciones no revierte reunión salvo política explícita.
* [ ] T013-1929 — Ejecutar `npm run test:meetings:notifications`.

---

# 24. Fase 20 — Auditoría

## 24.1. Eventos de auditoría

* [ ] T013-2001 — Auditar `meeting.created`.
* [ ] T013-2002 — Auditar `meeting.updated`.
* [ ] T013-2003 — Auditar `meeting.scheduled`.
* [ ] T013-2004 — Auditar `meeting.called`.
* [ ] T013-2005 — Auditar `meeting.started`.
* [ ] T013-2006 — Auditar `meeting.cancelled`.
* [ ] T013-2007 — Auditar `meeting.attendanceClosed`.
* [ ] T013-2008 — Auditar `meeting.completed`.
* [ ] T013-2009 — Auditar `meeting.archived`.
* [ ] T013-2010 — Auditar `meeting.quorumCalculated`.
* [ ] T013-2011 — Auditar `meetingAgenda.created`.
* [ ] T013-2012 — Auditar `meetingAgenda.updated`.
* [ ] T013-2013 — Auditar `meetingAgenda.reordered`.
* [ ] T013-2014 — Auditar `meetingAgenda.completed`.
* [ ] T013-2015 — Auditar `meetingAgenda.skipped`.
* [ ] T013-2016 — Auditar `meetingAgenda.archived`.
* [ ] T013-2017 — Auditar `meetingParticipant.added`.
* [ ] T013-2018 — Auditar `meetingParticipant.updated`.
* [ ] T013-2019 — Auditar `meetingParticipant.archived`.
* [ ] T013-2020 — Auditar `meetingAttendance.registered`.
* [ ] T013-2021 — Auditar `meetingAttendance.updated`.
* [ ] T013-2022 — Auditar `meetingAttendance.checkedOut`.
* [ ] T013-2023 — Auditar `meetingAttendance.excused`.
* [ ] T013-2024 — Auditar `meetingAttendance.archived`.
* [ ] T013-2025 — Auditar `meetingProxy.created`.
* [ ] T013-2026 — Auditar `meetingProxy.approved`.
* [ ] T013-2027 — Auditar `meetingProxy.rejected`.
* [ ] T013-2028 — Auditar `meetingProxy.cancelled`.
* [ ] T013-2029 — Auditar `meetingProxy.archived`.
* [ ] T013-2030 — Auditar `meetingMinutes.created`.
* [ ] T013-2031 — Auditar `meetingMinutes.updated`.
* [ ] T013-2032 — Auditar `meetingMinutes.submittedReview`.
* [ ] T013-2033 — Auditar `meetingMinutes.approved`.
* [ ] T013-2034 — Auditar `meetingMinutes.published`.
* [ ] T013-2035 — Auditar `meetingMinutes.archived`.
* [ ] T013-2036 — Auditar `meetingResolution.recorded`.
* [ ] T013-2037 — Auditar `meetingResolution.updated`.
* [ ] T013-2038 — Auditar `meetingResolution.approved`.
* [ ] T013-2039 — Auditar `meetingResolution.cancelled`.
* [ ] T013-2040 — Auditar `meetingResolution.archived`.

---

## 24.2. Sanitización de auditoría

* [ ] T013-2050 — No registrar payload completo.
* [ ] T013-2051 — No registrar body completo de acta.
* [ ] T013-2052 — No registrar emails completos.
* [ ] T013-2053 — No registrar teléfonos completos.
* [ ] T013-2054 — No registrar tokens.
* [ ] T013-2055 — No registrar cookies.
* [ ] T013-2056 — No registrar `Authorization` header.
* [ ] T013-2057 — No registrar documentos completos.
* [ ] T013-2058 — No registrar poderes completos.
* [ ] T013-2059 — No registrar stack trace.
* [ ] T013-2060 — Ejecutar `npm run test:meetings:audit`.

---

# 25. Fase 21 — Observabilidad

## 25.1. Logs

* [ ] T013-2101 — Agregar log `meeting.created`.
* [ ] T013-2102 — Agregar log `meeting.updated`.
* [ ] T013-2103 — Agregar log `meeting.scheduled`.
* [ ] T013-2104 — Agregar log `meeting.called`.
* [ ] T013-2105 — Agregar log `meeting.started`.
* [ ] T013-2106 — Agregar log `meeting.cancelled`.
* [ ] T013-2107 — Agregar log `meeting.attendanceClosed`.
* [ ] T013-2108 — Agregar log `meeting.completed`.
* [ ] T013-2109 — Agregar log `meeting.quorumCalculated`.
* [ ] T013-2110 — Agregar log `meetingAttendance.registered`.
* [ ] T013-2111 — Agregar log `meetingAttendance.updated`.
* [ ] T013-2112 — Agregar log `meetingProxy.approved`.
* [ ] T013-2113 — Agregar log `meetingMinutes.published`.
* [ ] T013-2114 — Agregar log `meetingResolution.recorded`.

---

## 25.2. Métricas

* [ ] T013-2120 — Agregar métrica `meetings_created_total`.
* [ ] T013-2121 — Agregar métrica `meetings_called_total`.
* [ ] T013-2122 — Agregar métrica `meetings_started_total`.
* [ ] T013-2123 — Agregar métrica `meetings_completed_total`.
* [ ] T013-2124 — Agregar métrica `meetings_cancelled_total`.
* [ ] T013-2125 — Agregar métrica `meeting_attendance_registered_total`.
* [ ] T013-2126 — Agregar métrica `meeting_quorum_calculated_total`.
* [ ] T013-2127 — Agregar métrica `meeting_quorum_met_total`.
* [ ] T013-2128 — Agregar métrica `meeting_minutes_published_total`.
* [ ] T013-2129 — Agregar métrica `meeting_resolutions_recorded_total`.

---

## 25.3. Tests de observabilidad

* [ ] T013-2130 — Verificar logs con `traceId`.
* [ ] T013-2131 — Verificar logs con `requestId`.
* [ ] T013-2132 — Verificar logs con `action`.
* [ ] T013-2133 — Verificar logs con `outcome`.
* [ ] T013-2134 — Verificar que logs no contienen tokens.
* [ ] T013-2135 — Verificar que logs no contienen body completo de actas.
* [ ] T013-2136 — Verificar que logs no contienen emails/teléfonos completos.
* [ ] T013-2137 — Verificar labels permitidos de métricas.
* [ ] T013-2138 — Verificar labels prohibidos de métricas.
* [ ] T013-2139 — Ejecutar `npm run test:meetings:observability`.

---

# 26. Fase 22 — Seguridad

## 26.1. Seguridad obligatoria

* [ ] T013-2201 — Verificar que no existen endpoints públicos de reuniones.
* [ ] T013-2202 — Verificar que no existen endpoints públicos de asistencia.
* [ ] T013-2203 — Verificar que no existen endpoints públicos de actas.
* [ ] T013-2204 — Verificar que no existen endpoints públicos de resoluciones.
* [ ] T013-2205 — Verificar que no existen endpoints públicos de participantes.
* [ ] T013-2206 — Verificar que no se acepta `tenantId` en body.
* [ ] T013-2207 — Verificar que no se exponen participantes completos en `/me`.
* [ ] T013-2208 — Verificar que no se expone asistencia de terceros en `/me`.
* [ ] T013-2209 — Verificar que no se expone auditoría en `/me`.
* [ ] T013-2210 — Verificar que no se modifica asistencia cerrada sin override.
* [ ] T013-2211 — Verificar que no se usa proxy no aprobado.
* [ ] T013-2212 — Verificar sanitización de actas.
* [ ] T013-2213 — Verificar sanitización de agenda.
* [ ] T013-2214 — Verificar errores seguros.

---

## 26.2. Tests negativos públicos

* [ ] T013-2220 — Test `GET /api/v1/public/tenants/{slug}/meetings` devuelve 404.
* [ ] T013-2221 — Test `GET /api/v1/public/tenants/{slug}/meetings/{meetingId}` devuelve 404.
* [ ] T013-2222 — Test `GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance` devuelve 404.
* [ ] T013-2223 — Test `GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/minutes` devuelve 404.
* [ ] T013-2224 — Test `GET /api/v1/public/tenants/{slug}/meetings/{meetingId}/resolutions` devuelve 404.
* [ ] T013-2225 — Test `POST /api/v1/public/tenants/{slug}/meetings` devuelve 404.
* [ ] T013-2226 — Test `POST /api/v1/public/tenants/{slug}/meetings/{meetingId}/attendance` devuelve 404.
* [ ] T013-2227 — Ejecutar `npm run test:meetings:security`.

---

# 27. Fase 23 — OpenAPI

## 27.1. Documentación OpenAPI

* [ ] T013-2301 — Agregar tag `Meetings`.
* [ ] T013-2302 — Agregar tag `Meeting Agenda`.
* [ ] T013-2303 — Agregar tag `Meeting Participants`.
* [ ] T013-2304 — Agregar tag `Meeting Attendance`.
* [ ] T013-2305 — Agregar tag `Meeting Proxies`.
* [ ] T013-2306 — Agregar tag `Meeting Minutes`.
* [ ] T013-2307 — Agregar tag `Meeting Resolutions`.
* [ ] T013-2308 — Agregar tag `My Meetings`.
* [ ] T013-2309 — Documentar DTOs request.
* [ ] T013-2310 — Documentar DTOs response.
* [ ] T013-2311 — Documentar errores.
* [ ] T013-2312 — Documentar paginación.
* [ ] T013-2313 — Documentar filtros.
* [ ] T013-2314 — Documentar permisos.
* [ ] T013-2315 — Agregar `x-tenant-scope`.
* [ ] T013-2316 — Agregar `x-auth-required`.
* [ ] T013-2317 — Agregar `x-required-permission`.
* [ ] T013-2318 — Agregar `x-own-resource` en endpoints `/me`.
* [ ] T013-2319 — Agregar `x-attendance-controlled`.
* [ ] T013-2320 — Agregar `x-quorum-calculation`.
* [ ] T013-2321 — Agregar `x-private-document` en actas.
* [ ] T013-2322 — Agregar `x-audit-event`.

---

## 27.2. Tests OpenAPI

* [ ] T013-2330 — Validar que OpenAPI compila.
* [ ] T013-2331 — Validar que todos los endpoints esperados están documentados.
* [ ] T013-2332 — Validar que todos los permisos están documentados.
* [ ] T013-2333 — Validar que endpoints `/me` tienen `x-own-resource`.
* [ ] T013-2334 — Validar que endpoints de asistencia tienen `x-attendance-controlled`.
* [ ] T013-2335 — Validar que endpoint de quórum tiene `x-quorum-calculation`.
* [ ] T013-2336 — Validar que endpoints de actas tienen `x-private-document`.
* [ ] T013-2337 — Validar que OpenAPI no documenta endpoints públicos de reuniones.
* [ ] T013-2338 — Ejecutar `npm run test:meetings:openapi`.
* [ ] T013-2339 — Ejecutar `npm run openapi:validate`.

---

# 28. Fase 24 — Seeds y datos demo

## 28.1. Seeds

* [ ] T013-2401 — Crear seed de reuniones demo.
* [ ] T013-2402 — Crear seed de agenda demo.
* [ ] T013-2403 — Crear seed de participantes demo.
* [ ] T013-2404 — Crear seed de asistencia demo.
* [ ] T013-2405 — Crear seed de proxies demo.
* [ ] T013-2406 — Crear seed de actas demo.
* [ ] T013-2407 — Crear seed de resoluciones demo.
* [ ] T013-2408 — Crear datos de Tenant A.
* [ ] T013-2409 — Crear datos de Tenant B.
* [ ] T013-2410 — Crear datos para pruebas cross-tenant.
* [ ] T013-2411 — Crear datos para pruebas own-resource.

---

## 28.2. Prohibiciones en seeds

* [ ] T013-2420 — Verificar que no hay nombres reales.
* [ ] T013-2421 — Verificar que no hay emails reales.
* [ ] T013-2422 — Verificar que no hay teléfonos reales.
* [ ] T013-2423 — Verificar que no hay cédulas reales.
* [ ] T013-2424 — Verificar que no hay documentos reales.
* [ ] T013-2425 — Verificar que no hay actas reales.
* [ ] T013-2426 — Verificar que no hay poderes reales.
* [ ] T013-2427 — Verificar que no hay tokens.
* [ ] T013-2428 — Verificar que no hay secretos.
* [ ] T013-2429 — Verificar que no hay datos financieros reales.

---

# 29. Fase 25 — Performance

## 29.1. Escenarios

* [ ] T013-2501 — Medir `GET /tenant/meetings` con 1.000 reuniones por tenant.
* [ ] T013-2502 — Medir `GET /tenant/meetings/{meetingId}/attendance` con 500 registros.
* [ ] T013-2503 — Medir `GET /tenant/meetings/{meetingId}/participants` con 500 participantes.
* [ ] T013-2504 — Medir `GET /me/meetings` con audiencia mixta.
* [ ] T013-2505 — Medir `POST /calculate-quorum` con 500 asistencias.

---

## 29.2. Validaciones

* [ ] T013-2510 — Verificar `p95 < 700 ms`.
* [ ] T013-2511 — Verificar paginación obligatoria.
* [ ] T013-2512 — Verificar `pageSize` máximo 100.
* [ ] T013-2513 — Verificar ausencia de N+1 evidente.
* [ ] T013-2514 — Verificar uso de índices.
* [ ] T013-2515 — Verificar que listados no cargan acta completa.
* [ ] T013-2516 — Verificar que listados no cargan asistencia completa innecesaria.
* [ ] T013-2517 — Ejecutar `npm run test:meetings:performance` si existe.

---

# 30. Fase 26 — Smoke test

## 30.1. Flujo mínimo

* [ ] T013-2601 — Ejecutar `GET /api/v1/health`.
* [ ] T013-2602 — Crear reunión.
* [ ] T013-2603 — Crear agenda.
* [ ] T013-2604 — Definir participantes.
* [ ] T013-2605 — Programar reunión.
* [ ] T013-2606 — Convocar reunión.
* [ ] T013-2607 — Consultar reunión desde `/me`.
* [ ] T013-2608 — Iniciar reunión.
* [ ] T013-2609 — Registrar asistencia.
* [ ] T013-2610 — Calcular quórum.
* [ ] T013-2611 — Cerrar asistencia.
* [ ] T013-2612 — Completar reunión.
* [ ] T013-2613 — Crear acta.
* [ ] T013-2614 — Enviar acta a revisión.
* [ ] T013-2615 — Aprobar acta.
* [ ] T013-2616 — Publicar acta.
* [ ] T013-2617 — Consultar acta desde `/me`.
* [ ] T013-2618 — Crear resolución.
* [ ] T013-2619 — Consultar resoluciones desde `/me`.
* [ ] T013-2620 — Confirmar que endpoint público de reuniones no existe.
* [ ] T013-2621 — Ejecutar `npm run test:meetings:smoke`.

---

# 31. Fase 27 — CI/CD

## 31.1. Scripts

* [ ] T013-2701 — Agregar script `test:meetings`.
* [ ] T013-2702 — Agregar script `test:meetings:unit`.
* [ ] T013-2703 — Agregar script `test:meetings:domain`.
* [ ] T013-2704 — Agregar script `test:meetings:dto`.
* [ ] T013-2705 — Agregar script `test:meetings:application`.
* [ ] T013-2706 — Agregar script `test:meetings:repositories`.
* [ ] T013-2707 — Agregar script `test:meetings:api`.
* [ ] T013-2708 — Agregar script `test:meetings:authorization`.
* [ ] T013-2709 — Agregar script `test:meetings:own-resource`.
* [ ] T013-2710 — Agregar script `test:meetings:multitenancy`.
* [ ] T013-2711 — Agregar script `test:meetings:attendance`.
* [ ] T013-2712 — Agregar script `test:meetings:proxy`.
* [ ] T013-2713 — Agregar script `test:meetings:quorum`.
* [ ] T013-2714 — Agregar script `test:meetings:minutes`.
* [ ] T013-2715 — Agregar script `test:meetings:resolutions`.
* [ ] T013-2716 — Agregar script `test:meetings:notifications`.
* [ ] T013-2717 — Agregar script `test:meetings:audit`.
* [ ] T013-2718 — Agregar script `test:meetings:observability`.
* [ ] T013-2719 — Agregar script `test:meetings:security`.
* [ ] T013-2720 — Agregar script `test:meetings:openapi`.
* [ ] T013-2721 — Agregar script `test:meetings:smoke`.

---

## 31.2. Gates

* [ ] T013-2730 — Gate lint.
* [ ] T013-2731 — Gate typecheck.
* [ ] T013-2732 — Gate unit tests.
* [ ] T013-2733 — Gate DTO validation tests.
* [ ] T013-2734 — Gate repository tests.
* [ ] T013-2735 — Gate API tests.
* [ ] T013-2736 — Gate authorization tests.
* [ ] T013-2737 — Gate own-resource tests.
* [ ] T013-2738 — Gate multitenancy tests.
* [ ] T013-2739 — Gate attendance tests.
* [ ] T013-2740 — Gate proxy tests.
* [ ] T013-2741 — Gate quorum tests.
* [ ] T013-2742 — Gate minutes privacy tests.
* [ ] T013-2743 — Gate resolution tests.
* [ ] T013-2744 — Gate notification integration tests.
* [ ] T013-2745 — Gate audit tests.
* [ ] T013-2746 — Gate observability tests.
* [ ] T013-2747 — Gate security tests.
* [ ] T013-2748 — Gate OpenAPI validation.
* [ ] T013-2749 — Gate build.

---

# 32. Fase 28 — Documentación final

## 32.1. Actualización documental

* [ ] T013-2801 — Actualizar `docs/specs/013-meetings-attendance/spec.md` si cambió el alcance.
* [ ] T013-2802 — Actualizar `docs/specs/013-meetings-attendance/plan.md` si cambió la arquitectura.
* [ ] T013-2803 — Actualizar `docs/specs/013-meetings-attendance/data-model.md` si cambió el modelo.
* [ ] T013-2804 — Actualizar `docs/specs/013-meetings-attendance/api-contract.md` si cambió el contrato.
* [ ] T013-2805 — Actualizar `docs/specs/013-meetings-attendance/test-plan.md` si cambiaron pruebas.
* [ ] T013-2806 — Actualizar `docs/specs/013-meetings-attendance/tasks.md`.
* [ ] T013-2807 — Crear o actualizar `docs/specs/013-meetings-attendance/security-notes.md`.
* [ ] T013-2808 — Actualizar OpenAPI.
* [ ] T013-2809 — Actualizar README técnico del módulo si existe.
* [ ] T013-2810 — Actualizar changelog interno si aplica.

---

# 33. Checklist de aceptación funcional

* [ ] T013-2901 — Se crean reuniones.
* [ ] T013-2902 — Se editan reuniones en estados permitidos.
* [ ] T013-2903 — Se programan reuniones.
* [ ] T013-2904 — Se convocan reuniones.
* [ ] T013-2905 — Se inician reuniones.
* [ ] T013-2906 — Se cancelan reuniones con razón.
* [ ] T013-2907 — Se cierra asistencia.
* [ ] T013-2908 — Se completan reuniones.
* [ ] T013-2909 — Se archivan reuniones.
* [ ] T013-2910 — Se gestiona agenda.
* [ ] T013-2911 — Se gestionan participantes.
* [ ] T013-2912 — Se registra asistencia administrativa.
* [ ] T013-2913 — Se registra ausencia.
* [ ] T013-2914 — Se registra tardanza.
* [ ] T013-2915 — Se registra salida anticipada.
* [ ] T013-2916 — Se registra excusa.
* [ ] T013-2917 — Se gestionan proxies.
* [ ] T013-2918 — Se calcula quórum.
* [ ] T013-2919 — Se consulta reuniones propias.
* [ ] T013-2920 — Se consulta agenda propia.
* [ ] T013-2921 — Se consulta asistencia propia.
* [ ] T013-2922 — Se crea acta preliminar.
* [ ] T013-2923 — Se aprueba acta.
* [ ] T013-2924 — Se publica acta.
* [ ] T013-2925 — Se consulta acta publicada desde `/me`.
* [ ] T013-2926 — Se registran resoluciones básicas.
* [ ] T013-2927 — Se consultan resoluciones propias.
* [ ] T013-2928 — Se emiten eventos hacia notificaciones.
* [ ] T013-2929 — Se auditan operaciones críticas.

---

# 34. Checklist de aceptación técnica

* [ ] T013-3001 — Todas las tablas nuevas tienen `tenant_id`.
* [ ] T013-3002 — Todas las consultas filtran por `tenant_id`.
* [ ] T013-3003 — Ningún endpoint acepta `tenantId` desde body.
* [ ] T013-3004 — No se busca `meeting` solo por `id`.
* [ ] T013-3005 — No se busca `attendance` solo por `id`.
* [ ] T013-3006 — No se busca `proxy` solo por `id`.
* [ ] T013-3007 — No se busca `minutes` solo por `id`.
* [ ] T013-3008 — No se busca `resolution` solo por `id`.
* [ ] T013-3009 — No hay endpoints públicos de reuniones.
* [ ] T013-3010 — No hay endpoints públicos de asistencia.
* [ ] T013-3011 — No hay endpoints públicos de actas.
* [ ] T013-3012 — No hay endpoints públicos de resoluciones.
* [ ] T013-3013 — No hay endpoints públicos de participantes.
* [ ] T013-3014 — OpenAPI no documenta endpoints públicos prohibidos.
* [ ] T013-3015 — Logs no incluyen datos sensibles.
* [ ] T013-3016 — Métricas no incluyen IDs sensibles.
* [ ] T013-3017 — Auditoría registra eventos críticos.
* [ ] T013-3018 — CI pasa.

---

# 35. Checklist de no regresión

* [ ] T013-3101 — No se rompe `001-tenants`.
* [ ] T013-3102 — No se rompe `002-users-roles`.
* [ ] T013-3103 — No se rompe `003-residents-properties`.
* [ ] T013-3104 — No se rompe `007-audit`.
* [ ] T013-3105 — No se rompe `012-communications-notifications`.
* [ ] T013-3106 — No se rompe OpenAPI general.
* [ ] T013-3107 — No se rompe autenticación Keycloak/OIDC.
* [ ] T013-3108 — No se rompe tenant active context.
* [ ] T013-3109 — No se rompe autorización por permisos.
* [ ] T013-3110 — No se rompe CI/CD.

---

# 36. Comandos sugeridos

## 36.1. Comandos generales

```bash id="c6l1yz"
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

## 36.2. Comandos específicos

```bash id="ctg9rw"
npm run test:meetings
npm run test:meetings:unit
npm run test:meetings:domain
npm run test:meetings:dto
npm run test:meetings:application
npm run test:meetings:repositories
npm run test:meetings:api
npm run test:meetings:authorization
npm run test:meetings:own-resource
npm run test:meetings:multitenancy
npm run test:meetings:attendance
npm run test:meetings:proxy
npm run test:meetings:quorum
npm run test:meetings:minutes
npm run test:meetings:resolutions
npm run test:meetings:notifications
npm run test:meetings:audit
npm run test:meetings:observability
npm run test:meetings:security
npm run test:meetings:openapi
npm run test:meetings:smoke
```

---

# 37. Orden recomendado de ejecución

## 37.1. Implementación mínima segura

```text id="i52pmj"
1. Estructura base.
2. Enums y value objects.
3. Entidades.
4. Prisma models y migraciones.
5. Puertos y repositorios.
6. Servicios de aplicación.
7. Casos de uso de Meetings.
8. DTOs.
9. Guards y permisos.
10. Controladores administrativos.
11. Agenda.
12. Participantes.
13. Asistencia.
14. Proxies.
15. Quórum.
16. Actas.
17. Resoluciones.
18. Endpoints /me.
19. Notificaciones.
20. Auditoría.
21. Observabilidad.
22. OpenAPI.
23. Security tests.
24. Smoke tests.
25. CI.
```

---

## 37.2. Orden de PRs sugerido

```text id="qk33mh"
PR-013-01 — Module skeleton, enums, value objects.
PR-013-02 — Prisma schema, migration and repositories.
PR-013-03 — Meeting core and state machine.
PR-013-04 — Agenda and participants.
PR-013-05 — Attendance and duplicate prevention.
PR-013-06 — Proxies.
PR-013-07 — Quorum calculation.
PR-013-08 — Minutes and resolutions.
PR-013-09 — Own endpoints.
PR-013-10 — Notifications, audit and observability.
PR-013-11 — OpenAPI, security tests and hardening.
```

---

# 38. Tareas diferidas explícitas

Estas tareas quedan fuera del MVP y no deben implementarse dentro de esta spec:

```text id="w9bpql"
[-] Electronic voting.
[-] Weighted voting.
[-] Legal majority calculation.
[-] Electronic signatures.
[-] Certified minutes.
[-] Formal PDF minutes.
[-] QR attendance.
[-] Biometric attendance.
[-] Geolocation attendance.
[-] Video conference integration.
[-] Meeting recording.
[-] Automatic transcription.
[-] AI-generated minutes with real data.
[-] Automatic absence fines.
[-] Legal proxy validation.
[-] Notary integration.
[-] Live chat.
[-] Live comments.
[-] Live questions.
[-] Advanced moderation.
```

---

# 39. No aceptación

La implementación no debe aceptarse si:

```text id="jhgopp"
- permite reuniones cross-tenant;
- permite participantes cross-tenant;
- permite asistencia cross-tenant;
- permite asistencia duplicada;
- permite proxy cross-tenant;
- permite attendance represented sin proxy approved;
- permite modificar asistencia cerrada sin override;
- permite usuario ver reunión ajena;
- permite usuario ver asistencia de terceros;
- permite usuario crear proxy de unidad ajena;
- expone reuniones en /api/v1/public;
- expone actas en /api/v1/public;
- expone asistencia en /api/v1/public;
- documenta endpoints públicos prohibidos;
- usa float/double para quórum persistido;
- calcula quórum modificando asistencia;
- omite auditoría de operaciones críticas;
- guarda body completo de acta en logs;
- omite sanitización de actas;
- trata resoluciones como votación formal;
- genera multas automáticas por inasistencia;
- implementa QR real sin spec;
- implementa IA con datos reales.
```

---

# 40. Resultado esperado

Al completar estas tareas, el módulo `013-meetings-attendance` deberá permitir administrar reuniones y asistencia de forma segura, auditable y preparada para evolución futura.

Debe quedar implementado:

```text id="l0trvy"
- Meeting management.
- Meeting agenda.
- Meeting participants.
- Administrative attendance.
- Optional own attendance check-in.
- Proxy/delegation basic workflow.
- Basic quorum calculation.
- Meeting minutes preliminary workflow.
- Basic resolutions.
- Own meetings API.
- Notification events.
- Audit events.
- OpenAPI.
- Tests.
- Security hardening.
- CI gates.
```

El módulo debe quedar preparado para futuras specs de:

```text id="gqjgwj"
014-voting-basic
00X-electronic-signatures
00X-certified-minutes
00X-meeting-documents
00X-meeting-qr-attendance
00X-meeting-video-integration
00X-ai-assisted-minutes
00X-advanced-quorum-rules
00X-meeting-absence-fines
00X-assembly-legal-workflow
```
