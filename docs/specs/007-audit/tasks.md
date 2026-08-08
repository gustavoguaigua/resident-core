# Tasks — Spec 007 Audit, Traceability and Compliance Events

## 1. Información del documento

| Campo           | Valor                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                           |
| Spec ID         | 007                                                                                                                     |
| Módulo          | Audit                                                                                                                   |
| Documento       | Implementation Tasks                                                                                                    |
| Ruta            | `docs/specs/007-audit/tasks.md`                                                                                         |
| Versión         | 0.1                                                                                                                     |
| Estado          | Borrador inicial                                                                                                        |
| Fecha           | 2026-07-14                                                                                                              |
| Documento base  | `docs/specs/007-audit/spec.md`                                                                                          |
| Plan técnico    | `docs/specs/007-audit/plan.md`                                                                                          |
| Modelo de datos | `docs/specs/007-audit/data-model.md`                                                                                    |
| Contrato API    | `docs/specs/007-audit/api-contract.md`                                                                                  |
| Plan de pruebas | `docs/specs/007-audit/test-plan.md`                                                                                     |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements` |

---

## 2. Propósito

Este documento convierte la spec `007-audit` en una lista ejecutable de tareas para implementar el módulo transversal de auditoría, trazabilidad y eventos de cumplimiento de RESIDENT Core.

El módulo debe permitir:

* registrar eventos auditables;
* registrar eventos tenant-scoped;
* registrar eventos platform-level;
* registrar actor;
* registrar acción;
* registrar recurso;
* registrar resultado;
* registrar contexto técnico;
* registrar `traceId`;
* registrar `requestId`;
* registrar `correlationId`;
* registrar valores anteriores y nuevos sanitizados;
* registrar metadata sanitizada;
* consultar auditoría del tenant;
* consultar auditoría platform;
* consultar auditoría por recurso;
* exportar auditoría en JSON/CSV;
* auditar exportaciones;
* evitar modificación ordinaria de registros;
* impedir acceso cross-tenant;
* impedir consulta platform sin permiso;
* impedir exposición de secretos;
* registrar eventos financieros críticos;
* registrar cambios de acceso;
* registrar accesos denegados críticos;
* preparar cumplimiento, reportes, investigación de incidentes e integraciones futuras.

Regla central:

```text id="t4o7i1"
Toda operación crítica de RESIDENT Core debe dejar evidencia auditable, tenant-scoped cuando aplique, trazable, sanitizada, protegida contra modificación ordinaria y consultable únicamente bajo permisos estrictos.
```

---

## 3. Convenciones de estado

Usar:

```text id="e4r8na"
[ ] Pending
[/] In Progress
[x] Done
[!] Blocked
[-] Deferred
```

Regla:

```text id="j4smfl"
No marcar una tarea como [x] hasta que exista evidencia real de implementación, prueba, revisión o commit.
```

---

## 4. Reglas obligatorias de ejecución

Antes de implementar código, revisar:

```text id="xfjcgo"
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
```

Reglas:

```text id="hwib0t"
1. Todo AuditLog debe tener action.
2. Todo AuditLog debe tener category.
3. Todo AuditLog debe tener severity.
4. Todo AuditLog debe tener outcome.
5. Todo evento tenant-scoped debe tener tenantId.
6. Solo eventos platform/pre-tenant pueden tener tenantId null.
7. Todo evento debe registrar actor cuando sea posible.
8. Todo evento debe registrar resourceType/resourceId cuando aplique.
9. Todo evento HTTP debe registrar traceId cuando esté disponible.
10. oldValue debe estar sanitizado.
11. newValue debe estar sanitizado.
12. metadata debe estar sanitizada.
13. No se deben almacenar passwords.
14. No se deben almacenar passwordHash.
15. No se deben almacenar accessToken.
16. No se deben almacenar refreshToken.
17. No se deben almacenar Authorization headers.
18. No se deben almacenar cookies completas.
19. No se deben almacenar secrets.
20. No se deben almacenar API keys completas.
21. No se deben almacenar comprobantes completos.
22. No se deben almacenar archivos completos.
23. No se deben almacenar payloads completos.
24. No se deben almacenar datos bancarios completos.
25. AuditLog debe ser append-only en operación ordinaria.
26. No deben existir endpoints ordinarios update/delete de audit logs.
27. Toda consulta tenant debe filtrar por tenantId.
28. Toda consulta platform debe requerir permiso platform.
29. Toda consulta por recurso debe validar pertenencia al tenant.
30. Toda exportación debe requerir permiso.
31. Toda exportación debe auditarse.
32. CSV export debe proteger contra formula injection.
33. Los logs técnicos no reemplazan auditoría funcional.
34. La auditoría funcional no reemplaza observabilidad técnica.
35. No implementar SIEM, WORM, hash encadenado o legal hold avanzado en esta spec.
```

---

## 5. Entregables esperados

Documentación:

```text id="p43on8"
docs/specs/007-audit/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Backend:

```text id="eu7adp"
apps/api/src/modules/audit/
├── audit.module.ts
├── audit-logs.controller.ts
├── platform-audit-logs.controller.ts
├── resource-audit-logs.controller.ts
├── application/
├── domain/
├── infrastructure/
├── policies/
├── dto/
└── tests/
```

---

# 6. Fase 0 — Preparación documental

## TASK-001 — Crear carpeta de spec

**Estado:** `[ ] Pending`

### Ruta

```text id="f9wzse"
docs/specs/007-audit/
```

### Criterios de aceptación

* Carpeta creada.
* Sigue estructura usada en specs anteriores.
* No reemplaza documentos de specs `001` a `006`.

---

## TASK-002 — Registrar spec funcional

**Estado:** `[ ] Pending`

### Archivo

```text id="r87zys"
docs/specs/007-audit/spec.md
```

### Criterios de aceptación

* Define propósito.
* Define alcance.
* Define actores.
* Define principios.
* Define reglas de negocio.
* Define categorías.
* Define permisos.
* Define API preliminar.
* Define criterios de aceptación.
* Define riesgos.

---

## TASK-003 — Registrar plan técnico

**Estado:** `[ ] Pending`

### Archivo

```text id="rk4psi"
docs/specs/007-audit/plan.md
```

### Criterios de aceptación

* Define arquitectura del módulo.
* Define estructura de carpetas.
* Define entidades.
* Define value objects.
* Define servicios.
* Define puertos.
* Define controladores.
* Define estrategia de implementación.
* Define estrategia de pruebas.
* Define diferidos.

---

## TASK-004 — Registrar modelo de datos

**Estado:** `[ ] Pending`

### Archivo

```text id="aj1d6u"
docs/specs/007-audit/data-model.md
```

### Criterios de aceptación

* Define `audit_logs`.
* Define `audit_exports` como opcional.
* Define columnas.
* Define enums.
* Define índices.
* Define constraints.
* Define Prisma.
* Define sanitización.
* Define seeds.
* Define reglas append-only.

---

## TASK-005 — Registrar contrato API

**Estado:** `[ ] Pending`

### Archivo

```text id="jgxtbm"
docs/specs/007-audit/api-contract.md
```

### Criterios de aceptación

* Define endpoints tenant.
* Define endpoints resource.
* Define endpoints platform.
* Define exportación.
* Define permisos.
* Define filtros.
* Define paginación.
* Define errores.
* Define DTOs.
* Define OpenAPI esperado.

---

## TASK-006 — Registrar plan de pruebas

**Estado:** `[ ] Pending`

### Archivo

```text id="ydljc1"
docs/specs/007-audit/test-plan.md
```

### Criterios de aceptación

* Define unit tests.
* Define integration tests.
* Define API tests.
* Define authorization tests.
* Define multitenancy tests.
* Define sanitizer tests.
* Define export tests.
* Define append-only tests.
* Define integration tests con módulos `001` a `006`.

---

## TASK-007 — Registrar tareas

**Estado:** `[ ] Pending`

### Archivo

```text id="nhkuwg"
docs/specs/007-audit/tasks.md
```

### Criterios de aceptación

* Tareas ordenadas por fases.
* Criterios claros.
* Diferidos documentados.
* Definition of Done incluida.

---

## TASK-008 — Registrar notas de seguridad

**Estado:** `[ ] Pending`

### Archivo

```text id="johgoz"
docs/specs/007-audit/security-notes.md
```

### Criterios de aceptación

* Identifica riesgos de auditoría incompleta.
* Identifica riesgos de secretos.
* Identifica riesgos de exportación.
* Define controles append-only.
* Define controles de sanitización.
* Define controles multitenant.
* Define controles platform.
* Define pruebas de seguridad.

---

# 7. Fase 1 — Estructura base del módulo

## TASK-009 — Crear módulo NestJS `audit`

**Estado:** `[ ] Pending`

### Archivo

```text id="o3vqsl"
apps/api/src/modules/audit/audit.module.ts
```

### Criterios de aceptación

* Módulo compila.
* Está registrado en `AppModule`.
* No contiene lógica de negocio.
* Expone providers necesarios.
* Puede ser importado por otros módulos.

---

## TASK-010 — Crear estructura de carpetas

**Estado:** `[ ] Pending`

### Estructura

```text id="vhpd3g"
apps/api/src/modules/audit/
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
│   ├── export/
│   ├── events/
│   └── interceptors/
├── policies/
├── dto/
└── tests/
```

### Criterios de aceptación

* Estructura creada.
* Dominio no depende de infraestructura.
* Controladores no usan Prisma directamente.
* Otros módulos pueden depender de `AuditWriterPort`.

---

## TASK-011 — Crear controladores base

**Estado:** `[ ] Pending`

### Archivos

```text id="rss8fr"
audit-logs.controller.ts
platform-audit-logs.controller.ts
resource-audit-logs.controller.ts
```

### Criterios de aceptación

* Compilan.
* Están registrados en `AuditModule`.
* Tienen rutas base correctas.
* No contienen lógica de negocio.
* Invocan use cases.

---

# 8. Fase 2 — Value Objects

## TASK-012 — Implementar `AuditAction`

**Estado:** `[ ] Pending`

### Archivo

```text id="ml1uol"
domain/value-objects/audit-action.vo.ts
```

### Criterios de aceptación

* Valida action requerida.
* Valida dot notation.
* Rechaza espacios.
* Rechaza caracteres peligrosos.
* Valida longitud máxima.
* Tiene unit tests.

---

## TASK-013 — Implementar `AuditCategory`

**Estado:** `[ ] Pending`

### Archivo

```text id="rskp84"
domain/value-objects/audit-category.vo.ts
```

### Criterios de aceptación

* Valida categorías permitidas.
* Incluye platform, security, access, personalData, financial, payments, accountStatements, integration, file, export, system.
* Tiene unit tests.

---

## TASK-014 — Implementar `AuditSeverity`

**Estado:** `[ ] Pending`

### Archivo

```text id="lu95rk"
domain/value-objects/audit-severity.vo.ts
```

### Criterios de aceptación

* Valida debug, info, notice, warning, error, critical.
* Define default.
* Tiene unit tests.

---

## TASK-015 — Implementar `AuditOutcome`

**Estado:** `[ ] Pending`

### Archivo

```text id="lxj879"
domain/value-objects/audit-outcome.vo.ts
```

### Criterios de aceptación

* Valida success, failure, denied, partial, skipped.
* Tiene unit tests.

---

## TASK-016 — Implementar `AuditActorType`

**Estado:** `[ ] Pending`

### Archivo

```text id="fomrvg"
domain/value-objects/audit-actor-type.vo.ts
```

### Criterios de aceptación

* Valida user, system, integration, job, webhook, platformSupport, unknown.
* Tiene unit tests.

---

## TASK-017 — Implementar `AuditResourceType`

**Estado:** `[ ] Pending`

### Archivo

```text id="dtqlx7"
domain/value-objects/audit-resource-type.vo.ts
```

### Criterios de aceptación

* Valida catálogo inicial.
* Permite extensión controlada.
* No requiere migración por cada recurso futuro.
* Tiene unit tests.

---

## TASK-018 — Implementar `AuditMetadata`

**Estado:** `[ ] Pending`

### Archivo

```text id="mvg146"
domain/value-objects/audit-metadata.vo.ts
```

### Criterios de aceptación

* Valida JSON.
* Controla tamaño.
* Controla profundidad.
* Rechaza o marca truncamiento.
* Tiene unit tests.

---

## TASK-019 — Implementar `AuditScope`

**Estado:** `[ ] Pending`

### Archivo

```text id="ciho1m"
domain/value-objects/audit-scope.vo.ts
```

### Criterios de aceptación

* Valida tenant, platform, resource, currentUser.
* Tiene unit tests.

---

## TASK-020 — Implementar `AuditExportFormat`

**Estado:** `[ ] Pending`

### Archivo

```text id="ltlylv"
domain/value-objects/audit-export-format.vo.ts
```

### Criterios de aceptación

* Valida json y csv.
* Rechaza pdf en MVP.
* Tiene unit tests.

---

# 9. Fase 3 — Entidades de dominio

## TASK-021 — Implementar entidad `AuditLog`

**Estado:** `[ ] Pending`

### Archivo

```text id="p4kpwy"
domain/entities/audit-log.entity.ts
```

### Criterios de aceptación

* Requiere action.
* Requiere category.
* Requiere severity.
* Requiere outcome.
* Requiere occurredAt.
* Valida tenantId según scope.
* Valida actor.
* Valida resource si aplica.
* Protege contra mutación ordinaria.
* Tiene unit tests.

---

## TASK-022 — Implementar entidad `AuditEvent`

**Estado:** `[ ] Pending`

### Archivo

```text id="co4q3i"
domain/entities/audit-event.entity.ts
```

### Criterios de aceptación

* Representa entrada al AuditWriterPort.
* Soporta tenant-scoped.
* Soporta platform-level.
* Soporta actor system/job.
* Soporta metadata.
* Tiene unit tests.

---

## TASK-023 — Implementar entidad `AuditActor`

**Estado:** `[ ] Pending`

### Archivo

```text id="aah3qz"
domain/entities/audit-actor.entity.ts
```

### Criterios de aceptación

* Valida actorType.
* Valida actorUserId cuando aplique.
* Sanitiza actorDisplayName.
* Soporta user, system, job, integration, platformSupport.
* Tiene unit tests.

---

## TASK-024 — Implementar entidad `AuditResource`

**Estado:** `[ ] Pending`

### Archivo

```text id="kqsvbo"
domain/entities/audit-resource.entity.ts
```

### Criterios de aceptación

* Valida resourceType.
* Valida resourceId cuando aplique.
* Sanitiza resourceDisplay.
* Soporta recurso nulo cuando acción no afecta recurso.
* Tiene unit tests.

---

## TASK-025 — Implementar entidad `AuditContext`

**Estado:** `[ ] Pending`

### Archivo

```text id="j8ppw3"
domain/entities/audit-context.entity.ts
```

### Criterios de aceptación

* Soporta traceId.
* Soporta requestId.
* Soporta correlationId.
* Soporta causationId.
* Soporta ipAddress y userAgent sanitizados.
* No almacena payload.
* Tiene unit tests.

---

## TASK-026 — Implementar errores de dominio

**Estado:** `[ ] Pending`

### Archivos

```text id="hvep6x"
audit-log-not-found.error.ts
audit-write-failed.error.ts
audit-query-forbidden.error.ts
audit-export-forbidden.error.ts
audit-category-forbidden.error.ts
audit-platform-forbidden.error.ts
audit-sensitive-forbidden.error.ts
audit-sensitive-field-detected.error.ts
audit-export-format-not-supported.error.ts
audit-export-too-large.error.ts
audit-date-range-too-large.error.ts
audit-invalid-date-range.error.ts
audit-invalid-action.error.ts
audit-invalid-resource-type.error.ts
resource-type-not-supported.error.ts
resource-not-found.error.ts
cross-tenant-reference.error.ts
```

### Criterios de aceptación

* Cada error tiene código estable.
* Cada error mapea a HTTP status.
* No expone SQL.
* No expone stack trace.
* No expone payload.

---

## TASK-027 — Implementar eventos internos

**Estado:** `[ ] Pending`

### Archivos

```text id="gvvtyu"
audit-log-created.event.ts
audit-log-write-failed.event.ts
audit-logs-exported.event.ts
audit-access-denied.event.ts
```

### Criterios de aceptación

* Incluyen tenantId si aplica.
* Incluyen traceId si aplica.
* Incluyen auditLogId cuando exista.
* No incluyen payload completo.
* No incluyen secretos.

---

# 10. Fase 4 — DTOs y validación

## TASK-028 — Crear DTOs de consulta tenant

**Estado:** `[ ] Pending`

### Archivos

```text id="cwk9bz"
list-audit-logs-query.dto.ts
audit-log-list-item.dto.ts
audit-log-detail.dto.ts
```

### Criterios de aceptación

* Valida filtros.
* Valida page/pageSize.
* Valida sortBy.
* Valida sortOrder.
* Valida enums.
* No permite tenantId en tenant query.

---

## TASK-029 — Crear DTOs de consulta platform

**Estado:** `[ ] Pending`

### Archivos

```text id="hmshc9"
platform-list-audit-logs-query.dto.ts
platform-audit-log-detail.dto.ts
```

### Criterios de aceptación

* Permite tenantId solo en platform.
* Valida includePlatformEvents.
* Valida filtros.
* Valida permisos en use case, no solo DTO.

---

## TASK-030 — Crear DTOs de resource audit

**Estado:** `[ ] Pending`

### Archivos

```text id="u1v7qu"
resource-audit-logs-query.dto.ts
resource-audit-log-list-item.dto.ts
```

### Criterios de aceptación

* Valida resourceType.
* Valida resourceId.
* Valida filtros.
* Valida paginación.

---

## TASK-031 — Crear DTOs de exportación

**Estado:** `[ ] Pending`

### Archivos

```text id="phyb3e"
export-audit-logs-query.dto.ts
audit-export-response.dto.ts
```

### Criterios de aceptación

* Valida format json/csv.
* Rechaza pdf.
* Valida filtros.
* Valida date range.
* Permite export con filtros seguros.

---

# 11. Fase 5 — Prisma, migración y seeds

## TASK-032 — Agregar enums Prisma

**Estado:** `[ ] Pending`

### Enums

```text id="mm9i73"
AuditActorType
AuditCategory
AuditSeverity
AuditOutcome
```

Opcionales:

```text id="jbn6td"
AuditExportFormat
AuditExportStatus
AuditScope
```

### Criterios de aceptación

* Enums creados.
* `resourceType` queda string en MVP.
* `action` queda string.
* Prisma Client genera.

---

## TASK-033 — Crear modelo Prisma `AuditLog`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* `id` UUID.
* `tenantId` nullable.
* `actorType` obligatorio.
* `action` obligatorio.
* `category` obligatorio.
* `severity` obligatorio.
* `outcome` obligatorio.
* `oldValue`, `newValue`, `metadata` JSON.
* `occurredAt` obligatorio.
* `createdAt` obligatorio.
* Relación opcional con Tenant.
* Relación opcional con UserProfile.
* `onDelete: Restrict`.

---

## TASK-034 — Crear modelo Prisma opcional `AuditExport`

**Estado:** `[-] Deferred`

### Decisión MVP

```text id="k3zdc9"
Diferir AuditExport salvo necesidad explícita de historial materializado de exportaciones.
```

### Criterios si se implementa

* Tabla `audit_exports`.
* Filtros sanitizados.
* Formato.
* Estado.
* rowCount.
* fileId opcional.
* Auditoría `audit.exported`.

---

## TASK-035 — Agregar relaciones en `Tenant`

**Estado:** `[ ] Pending`

### Relación

```prisma id="x40sl0"
auditLogs AuditLog[]
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe specs anteriores.

---

## TASK-036 — Agregar relaciones en `UserProfile`

**Estado:** `[ ] Pending`

### Relación

```prisma id="yprq0j"
auditLogsAsActor AuditLog[] @relation("AuditLogActorUser")
```

### Criterios de aceptación

* Prisma Client genera.
* No rompe `002-users-roles`.

---

## TASK-037 — Crear migración `007_create_audit_logs`

**Estado:** `[ ] Pending`

### Comando sugerido

```bash id="skc83e"
npm run prisma:migrate:dev -- --name 007_create_audit_logs
```

### Criterios de aceptación

* Migración creada.
* Aplica en DB limpia.
* Crea enums.
* Crea `audit_logs`.
* Crea índices.
* Crea constraints.
* No cascade delete peligroso.
* Prisma Client genera.

---

## TASK-038 — Agregar índices

**Estado:** `[ ] Pending`

### Índices requeridos

```text id="uwot24"
tenant_id
actor_user_id
actor_type
action
category
severity
outcome
resource_type + resource_id
occurred_at
trace_id
request_id
correlation_id
tenant_id + occurred_at
tenant_id + resource_type + resource_id
tenant_id + actor_user_id
tenant_id + category
tenant_id + action
```

### Criterios de aceptación

* Índices incluidos en migración.
* Cubiertos por migration tests.

---

## TASK-039 — Agregar constraints SQL

**Estado:** `[ ] Pending`

### Constraints recomendadas

```text id="achuut"
audit_logs_action_not_empty_check
audit_logs_reason_not_empty_if_present_check
audit_logs_action_length_check
audit_logs_resource_type_length_check
```

### Criterios de aceptación

* Constraints agregadas.
* No bloquean eventos legítimos platform/pre-tenant.
* Cubiertas por tests.

---

## TASK-040 — Crear mapper Prisma ↔ dominio

**Estado:** `[ ] Pending`

### Archivo

```text id="iw4u71"
infrastructure/persistence/audit.mapper.ts
```

### Criterios de aceptación

* Convierte Prisma a entidad.
* Convierte entidad a DTO.
* Filtra campos según visibilidad.
* No expone secretos.
* No expone metadata no autorizada.

---

## TASK-041 — Crear repositorio Prisma de auditoría

**Estado:** `[ ] Pending`

### Archivo

```text id="bj2as9"
infrastructure/persistence/prisma-audit.repository.ts
```

### Criterios de aceptación

* Implementa create.
* Implementa listByTenant.
* Implementa findByIdForTenant.
* Implementa listPlatform.
* Implementa getPlatform.
* Implementa listByResource.
* No expone update ordinario.
* No expone delete ordinario.
* Filtra por tenant en consultas tenant.
* Tiene integration tests.

---

## TASK-042 — Crear seeds de auditoría demo

**Estado:** `[ ] Pending`

### Eventos demo

```text id="e7b2it"
tenant.created
user.created
role.assigned
propertyUnit.updated
charge.created
payment.confirmed
payment.reversed
accountStatement.generated
accountStatement.exported
crossTenant.accessDenied
audit.exported
```

### Criterios de aceptación

* Seeds idempotentes.
* No contienen passwords.
* No contienen tokens.
* No contienen datos reales.
* No contienen payload completo.
* Cubiertos por tests.

---

# 12. Fase 6 — Puertos y adaptadores

## TASK-043 — Crear `AuditWriterPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="zvis21"
application/ports/audit-writer.port.ts
```

### Criterios de aceptación

* Define `write(event)`.
* Define `writeMany(events)`.
* Define `writeCritical(event)`.
* Define `writeBestEffort(event)`.
* Puede ser usado por módulos `001` a `006`.
* No depende de Prisma.

---

## TASK-044 — Crear `AuditReaderPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="st36ve"
application/ports/audit-reader.port.ts
```

### Criterios de aceptación

* Define métodos de consulta.
* Soporta tenant.
* Soporta platform.
* Soporta resource.
* No depende de Prisma.

---

## TASK-045 — Crear `AuditExportPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="ee28cv"
application/ports/audit-export.port.ts
```

### Criterios de aceptación

* Define exportToJson.
* Define exportToCsv.
* Incluye protección CSV.
* No exporta secretos.

---

## TASK-046 — Crear `AuditEventsPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="wwgkt3"
application/ports/audit-events.port.ts
```

### Criterios de aceptación

* Define `publish(event)`.
* No depende de broker externo.
* Compatible con outbox futuro.

---

## TASK-047 — Crear `TenantResourceResolverPort`

**Estado:** `[ ] Pending`

### Archivo

```text id="f5amov"
application/ports/tenant-resource-resolver.port.ts
```

### Criterios de aceptación

* Resuelve tenant de un recurso.
* Valida pertenencia a tenant.
* Soporta resource audit API.
* Rechaza resourceType no soportado.
* No permite consulta sin validación.

---

## TASK-048 — Crear adaptador temporal de eventos

**Estado:** `[ ] Pending`

### Archivo

```text id="cn7uij"
infrastructure/events/audit-events.adapter.ts
```

### Criterios de aceptación

* Implementa AuditEventsPort.
* Publica eventos internos.
* No incluye payload completo.
* No incluye secretos.

---

## TASK-049 — Crear adaptador de exportación

**Estado:** `[ ] Pending`

### Archivo

```text id="en1h48"
infrastructure/export/audit-export.adapter.ts
```

### Criterios de aceptación

* Exporta JSON.
* Exporta CSV.
* Protege CSV contra fórmula injection.
* Respeta visibilidad.
* No exporta secretos.
* Tiene tests.

---

## TASK-050 — Crear `AuditContextInterceptor`

**Estado:** `[ ] Pending`

### Archivo

```text id="swhx9p"
infrastructure/interceptors/audit-context.interceptor.ts
```

### Criterios de aceptación

* Captura traceId.
* Captura requestId.
* Captura correlationId.
* Captura ipAddress.
* Captura userAgent sanitizado.
* No captura body completo.
* Expone contexto para AuditService.

---

# 13. Fase 7 — Servicios

## TASK-051 — Implementar `AuditSanitizerService`

**Estado:** `[ ] Pending`

### Archivo

```text id="yel4h9"
application/services/audit-sanitizer.service.ts
```

### Criterios de aceptación

* Redacta passwords.
* Redacta tokens.
* Redacta Authorization.
* Redacta cookies.
* Redacta secrets.
* Redacta API keys.
* Redacta comprobantes.
* Redacta archivos.
* Redacta payload completo.
* Controla tamaño.
* Controla profundidad.
* Tiene tests.

---

## TASK-052 — Implementar `AuditMetadataValidatorService`

**Estado:** `[ ] Pending`

### Archivo

```text id="kpjdoz"
application/services/audit-metadata-validator.service.ts
```

### Criterios de aceptación

* Valida tamaño.
* Valida profundidad.
* Rechaza arrays enormes.
* Rechaza export completo.
* Marca `_truncated` si aplica.
* Tiene tests.

---

## TASK-053 — Implementar `AuditEventBuilderService`

**Estado:** `[ ] Pending`

### Archivo

```text id="yzch5h"
application/services/audit-event-builder.service.ts
```

### Criterios de aceptación

* Construye eventos financieros.
* Construye eventos de acceso.
* Construye eventos de seguridad.
* Construye eventos de exportación.
* Aplica defaults.
* Mapea category.
* Mapea severity.
* No incluye payload completo.
* Tiene tests.

---

## TASK-054 — Implementar `AuditService`

**Estado:** `[ ] Pending`

### Archivo

```text id="scyuj6"
application/services/audit.service.ts
```

### Criterios de aceptación

* Implementa AuditWriterPort.
* Valida evento.
* Sanitiza evento.
* Persiste AuditLog.
* Emite AuditLogCreated.
* Implementa writeCritical.
* Implementa writeBestEffort.
* Evita recursión infinita.
* Tiene tests.

---

## TASK-055 — Implementar `AuditQueryService`

**Estado:** `[ ] Pending`

### Archivo

```text id="bb0dzm"
application/services/audit-query.service.ts
```

### Criterios de aceptación

* Aplica filtros.
* Aplica paginación.
* Aplica sort permitido.
* Rechaza sort arbitrario.
* Rechaza pageSize > 100.
* Rechaza date range inválido.
* Tiene tests.

---

## TASK-056 — Implementar `AuditPermissionPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="egix6y"
application/services/audit-permission-policy.service.ts
```

### Criterios de aceptación

* Valida audit.read.
* Valida audit.export.
* Valida audit.readFinancial.
* Valida audit.readAccess.
* Valida audit.readSecurity.
* Valida audit.readPersonalData.
* Valida platform permissions.
* Tiene tests.

---

## TASK-057 — Implementar `AuditCategoryPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="va7gfe"
application/services/audit-category-policy.service.ts
```

### Criterios de aceptación

* Mapea categorías a permisos.
* Filtra categorías no visibles.
* Enmascara campos sensibles según permiso.
* Tiene tests.

---

## TASK-058 — Implementar `AuditExportService`

**Estado:** `[ ] Pending`

### Archivo

```text id="a17rxo"
application/services/audit-export.service.ts
```

### Criterios de aceptación

* Exporta JSON.
* Exporta CSV.
* Aplica filtros.
* Aplica permisos.
* Respeta categorías.
* Limita volumen.
* Audita exportación.
* Tiene tests.

---

## TASK-059 — Implementar `AuditRetentionPolicyService`

**Estado:** `[ ] Pending`

### Archivo

```text id="jbn87m"
application/services/audit-retention-policy.service.ts
```

### Criterios de aceptación

* Define no purge en MVP.
* Centraliza política de retención.
* Prepara retención futura.
* Tiene tests básicos.

---

# 14. Fase 8 — Casos de uso

## TASK-060 — Implementar `WriteAuditLogUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida evento.
* Sanitiza.
* Persiste.
* Emite evento interno.
* Soporta tenant.
* Soporta platform.
* Soporta actor system/job.
* Tiene tests.

---

## TASK-061 — Implementar `ListTenantAuditLogsUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida `audit.read`.
* Valida tenant activo.
* Aplica categorías permitidas.
* Filtra por tenant.
* Pagina.
* Tiene tests.

---

## TASK-062 — Implementar `GetTenantAuditLogUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida `audit.read`.
* Consulta por tenant.
* Aplica permiso de categoría.
* Devuelve detalle sanitizado.
* Tiene tests.

---

## TASK-063 — Implementar `ListResourceAuditLogsUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida `audit.read`.
* Valida resourceType.
* Valida resourceId.
* Valida recurso pertenece al tenant.
* Lista eventos del recurso.
* Tiene tests.

---

## TASK-064 — Implementar `ExportTenantAuditLogsUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida `audit.export`.
* Aplica filtros.
* Aplica permisos por categoría.
* Limita volumen.
* Exporta JSON/CSV.
* Audita `audit.exported`.
* Tiene tests.

---

## TASK-065 — Implementar `ListPlatformAuditLogsUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida `audit.platform.read`.
* Aplica filtros platform.
* Aplica sensibilidad.
* Pagina.
* Tiene tests.

---

## TASK-066 — Implementar `GetPlatformAuditLogUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida `audit.platform.read`.
* Aplica `audit.platform.readSensitive` cuando aplique.
* Devuelve detalle sanitizado.
* Tiene tests.

---

## TASK-067 — Implementar `ExportPlatformAuditLogsUseCase`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida `audit.platform.export`.
* Aplica sensibilidad.
* Exporta JSON/CSV.
* Audita `audit.platformExported`.
* Tiene tests.

---

# 15. Fase 9 — Guards, policies y autorización

## TASK-068 — Reutilizar `AuthGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Bloquea no autenticados.
* Bloquea usuarios deshabilitados.
* Provee UserProfile.

---

## TASK-069 — Reutilizar `TenantGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Resuelve tenant activo.
* Valida membership activa.
* Bloquea tenant suspendido según política.
* No confía solo en header.

---

## TASK-070 — Reutilizar `TenantPermissionGuard`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida permisos audit tenant.
* Valida `audit.read`.
* Valida `audit.export`.
* Compatible con category policy.

---

## TASK-071 — Crear `PlatformAuditPermissionGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="k2qvln"
policies/platform-audit-permission.guard.ts
```

### Criterios de aceptación

* Valida `audit.platform.read`.
* Valida `audit.platform.export`.
* Valida `audit.platform.readSensitive`.
* Bloquea tenant users.
* Tiene tests.

---

## TASK-072 — Crear `AuditCategoryGuard`

**Estado:** `[ ] Pending`

### Archivo

```text id="d358dl"
policies/audit-category.guard.ts
```

### Criterios de aceptación

* Valida categoría solicitada.
* Aplica permisos específicos.
* Bloquea financial sin audit.readFinancial.
* Bloquea access sin audit.readAccess.
* Bloquea security sin audit.readSecurity.
* Bloquea personalData sin audit.readPersonalData.
* Tiene tests.

---

## TASK-073 — Crear decorators de permisos audit

**Estado:** `[ ] Pending`

### Decorators sugeridos

```text id="utolw1"
@RequireAuditPermission()
@RequireAuditCategoryPermission()
@RequirePlatformAuditPermission()
@RequireAuditExport()
```

### Criterios de aceptación

* Exponen metadata.
* No contienen lógica de negocio.
* Compatibles con OpenAPI.
* Tienen tests básicos.

---

# 16. Fase 10 — Controladores y endpoints

## TASK-074 — Implementar `AuditLogsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="d4i9ay"
GET /api/v1/tenant/audit-logs
GET /api/v1/tenant/audit-logs/:auditLogId
GET /api/v1/tenant/audit-logs/export
```

### Criterios de aceptación

* Usa guards.
* Usa DTOs.
* Usa use cases.
* No usa Prisma directo.
* Tiene API tests.

---

## TASK-075 — Implementar `ResourceAuditLogsController`

**Estado:** `[ ] Pending`

### Endpoint

```text id="ndptdv"
GET /api/v1/tenant/resources/:resourceType/:resourceId/audit-logs
```

### Criterios de aceptación

* Valida recurso.
* Valida tenant.
* Usa TenantResourceResolverPort.
* Tiene API tests.

---

## TASK-076 — Implementar `PlatformAuditLogsController`

**Estado:** `[ ] Pending`

### Endpoints

```text id="l52lyh"
GET /api/v1/platform/audit-logs
GET /api/v1/platform/audit-logs/:auditLogId
GET /api/v1/platform/audit-logs/export
```

### Criterios de aceptación

* Usa PlatformAuditPermissionGuard.
* Aplica permisos platform.
* Aplica readSensitive.
* Tiene API tests.

---

# 17. Fase 11 — Errores y responses

## TASK-077 — Mapear errores a HTTP

**Estado:** `[ ] Pending`

### Mapeos

```text id="b7h38g"
AUDIT_LOG_NOT_FOUND -> 404
AUDIT_QUERY_FORBIDDEN -> 403
AUDIT_EXPORT_FORBIDDEN -> 403
AUDIT_CATEGORY_FORBIDDEN -> 403
AUDIT_PLATFORM_FORBIDDEN -> 403
AUDIT_SENSITIVE_FORBIDDEN -> 403
AUDIT_EXPORT_FORMAT_NOT_SUPPORTED -> 422
AUDIT_EXPORT_TOO_LARGE -> 422
AUDIT_INVALID_DATE_RANGE -> 422
AUDIT_INVALID_ACTION -> 422
AUDIT_INVALID_RESOURCE_TYPE -> 422
RESOURCE_TYPE_NOT_SUPPORTED -> 422
RESOURCE_NOT_FOUND -> 404
CROSS_TENANT_REFERENCE -> 403/422
```

### Criterios de aceptación

* Errores estándar.
* Incluyen traceId.
* No exponen SQL.
* No exponen stack trace.
* No exponen payload.

---

## TASK-078 — Implementar response wrapper estándar

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Respuestas usan `data`.
* Metadatos usan `meta.traceId`.
* Listados incluyen paginación.
* Exports incluyen format y rowCount.
* No retornan entidades internas.

---

# 18. Fase 12 — OpenAPI

## TASK-079 — Documentar Tenant Audit API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints documentados.
* Query params documentados.
* Permisos documentados.
* Errores documentados.
* Ejemplos incluidos.

---

## TASK-080 — Documentar Resource Audit API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoint documentado.
* resourceType documentado.
* resourceId documentado.
* Resource ownership check documentado.
* Errores documentados.

---

## TASK-081 — Documentar Platform Audit API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Endpoints platform documentados.
* Permisos platform documentados.
* readSensitive documentado.
* Errores documentados.

---

## TASK-082 — Documentar Audit Export API

**Estado:** `[ ] Pending`

### Criterios de aceptación

* JSON export documentado.
* CSV export documentado.
* CSV injection protection documentado.
* audit.exported documentado.
* Límites documentados.

---

## TASK-083 — Agregar extensiones OpenAPI

**Estado:** `[ ] Pending`

### Extensiones

```yaml id="d099kf"
x-required-permission: audit.read
x-tenant-scope: tenant
x-audit-query: true
```

```yaml id="saa7a0"
x-required-permission: audit.export
x-audit-event: audit.exported
x-sensitive-export: true
```

```yaml id="z1mlto"
x-required-permission: audit.platform.read
x-platform-scope: true
```

### Criterios de aceptación

* Extensiones agregadas.
* Security schemes definidos.
* No documenta endpoints update/delete.

---

# 19. Fase 13 — Pruebas unitarias

## TASK-084 — Implementar unit tests de value objects

**Estado:** `[ ] Pending`

### Archivos

```text id="hkyeud"
audit-action.vo.spec.ts
audit-category.vo.spec.ts
audit-severity.vo.spec.ts
audit-outcome.vo.spec.ts
audit-actor-type.vo.spec.ts
audit-export-format.vo.spec.ts
```

### Criterios de aceptación

* Cubren casos UT-AUD.
* Pasan en CI.

---

## TASK-085 — Implementar unit tests de entidades

**Estado:** `[ ] Pending`

### Archivos

```text id="lgzcpx"
audit-log.entity.spec.ts
audit-event.entity.spec.ts
audit-actor.entity.spec.ts
audit-resource.entity.spec.ts
audit-context.entity.spec.ts
```

### Criterios de aceptación

* Cubren creación válida.
* Cubren errores.
* Cubren tenant/platform.
* Cubren resource.
* Cubren contexto.
* Pasan en CI.

---

# 20. Fase 14 — Pruebas de aplicación

## TASK-086 — Implementar tests de `AuditSanitizerService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Redacta secretos.
* Redacta tokens.
* Redacta payload.
* Redacta comprobantes.
* Trunca tamaño.
* Trunca profundidad.
* Conserva campos permitidos.

---

## TASK-087 — Implementar tests de `AuditMetadataValidatorService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Valida metadata válida.
* Rechaza metadata con token.
* Controla tamaño.
* Controla profundidad.
* Rechaza export completo.

---

## TASK-088 — Implementar tests de `AuditEventBuilderService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Construye eventos financieros.
* Construye eventos access.
* Construye eventos denied.
* Mapea severity.
* Incluye traceId.
* No incluye payload.

---

## TASK-089 — Implementar tests de `AuditService`

**Estado:** `[ ] Pending`

### Criterios de aceptación

* write persiste.
* writeMany persiste.
* writeCritical falla si repo falla.
* writeBestEffort no rompe.
* Sanitiza antes de persistir.
* Evita recursión.

---

## TASK-090 — Implementar tests de query, permisos y export

**Estado:** `[ ] Pending`

### Servicios

```text id="badctl"
AuditQueryService
AuditPermissionPolicyService
AuditCategoryPolicyService
AuditExportService
```

### Criterios de aceptación

* Filtros.
* Paginación.
* Sort permitido.
* Permisos por categoría.
* Export JSON/CSV.
* CSV injection protection.

---

## TASK-091 — Implementar tests de use cases

**Estado:** `[ ] Pending`

### Use cases

```text id="t0thrd"
WriteAuditLogUseCase
ListTenantAuditLogsUseCase
GetTenantAuditLogUseCase
ListResourceAuditLogsUseCase
ExportTenantAuditLogsUseCase
ListPlatformAuditLogsUseCase
GetPlatformAuditLogUseCase
ExportPlatformAuditLogsUseCase
```

### Criterios de aceptación

* Caminos felices.
* Errores.
* Permisos.
* Tenant isolation.
* Platform isolation.
* Export audit.

---

# 21. Fase 15 — Pruebas de integración

## TASK-092 — Implementar migration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Enums creados.
* Tabla audit_logs creada.
* Campos requeridos.
* JSONB.
* Índices.
* Constraints.
* onDelete Restrict.
* No cascade peligroso.

---

## TASK-093 — Implementar repository integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Crear audit log tenant.
* Crear audit log platform.
* Listar por tenant.
* Buscar por id y tenant.
* Buscar por resource.
* Buscar por actor.
* Buscar por traceId.
* Paginación.
* No update/delete.

---

## TASK-094 — Implementar seed integration tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Seeds idempotentes.
* Seeds crean eventos demo.
* Seeds no contienen secrets.
* Seeds no contienen datos reales.
* Seeds crean eventos financieros demo.

---

# 22. Fase 16 — Pruebas API

## TASK-095 — Implementar API tests de Tenant Audit

**Estado:** `[ ] Pending`

### Archivo

```text id="rc7b22"
tenant-audit-logs.api.spec.ts
```

### Criterios de aceptación

* Listar.
* Detalle.
* Export.
* Filtros.
* Paginación.
* Sort.
* Sin token.
* Sin permiso.
* Categoría sensible.
* Tenant isolation.

---

## TASK-096 — Implementar API tests de Resource Audit

**Estado:** `[ ] Pending`

### Archivo

```text id="hhskt2"
resource-audit-logs.api.spec.ts
```

### Criterios de aceptación

* Recurso válido.
* Recurso de otro tenant.
* resourceType inválido.
* resourceId inválido.
* Sin permiso.
* Categoría sensible.

---

## TASK-097 — Implementar API tests de Platform Audit

**Estado:** `[ ] Pending`

### Archivo

```text id="qt8fy1"
platform-audit-logs.api.spec.ts
```

### Criterios de aceptación

* List platform.
* Get platform.
* Export platform.
* Tenant user bloqueado.
* Sin platform permission.
* readSensitive.
* includePlatformEvents.

---

## TASK-098 — Implementar API tests de Audit Export

**Estado:** `[ ] Pending`

### Archivo

```text id="mzahxi"
audit-export.api.spec.ts
```

### Criterios de aceptación

* JSON.
* CSV.
* Formato inválido.
* Sin permiso.
* Export too large.
* CSV injection.
* audit.exported.

---

# 23. Fase 17 — Authorization, category permissions y multitenancy

## TASK-099 — Implementar authorization tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Sin token 401.
* Sin membership 403.
* Sin audit.read 403.
* Disabled user 403.
* TenantAuditor autorizado.
* Treasurer financiero autorizado según permisos.

---

## TASK-100 — Implementar category permission tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* financial requiere audit.readFinancial.
* payments requiere audit.readFinancial.
* accountStatements requiere audit.readFinancial.
* access requiere audit.readAccess.
* security requiere audit.readSecurity.
* personalData requiere audit.readPersonalData.

---

## TASK-101 — Implementar platform authorization tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* TenantAdmin no accede platform.
* PlatformAdmin con read accede.
* Platform export requiere export.
* Sensitive requiere readSensitive.
* Platform export audita.

---

## TASK-102 — Implementar separation-of-duties tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* audit.read no exporta.
* audit.export no implica financial.
* audit.readFinancial no implica export.
* audit.platform.read no implica export.
* audit.read no implica personalData.

---

## TASK-103 — Implementar multitenancy tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Tenant A no lista Tenant B.
* Tenant A no consulta detalle B.
* Tenant A no consulta recurso B.
* Tenant A export no incluye B.
* TenantId null no aparece en tenant query.
* Platform sí ve platform logs con permiso.

---

# 24. Fase 18 — Sanitización, exportación y seguridad

## TASK-104 — Implementar sanitization tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Passwords redactados.
* Tokens redactados.
* Authorization redactado.
* Cookies redactadas.
* API keys redactadas.
* File content redactado.
* Raw body redactado.
* Payload completo bloqueado.
* Metadata grande truncada.

---

## TASK-105 — Implementar export tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Export JSON tenant.
* Export CSV tenant.
* Export JSON platform.
* Export CSV platform.
* Sin permiso 403.
* Demasiado grande 422.
* Sin secrets.
* audit.exported.

---

## TASK-106 — Implementar CSV injection tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Neutraliza `=cmd`.
* Neutraliza `+SUM()`.
* Neutraliza `-10+20`.
* Neutraliza `@HYPERLINK`.
* Aplica a actorDisplayName.
* Aplica a resourceDisplay.
* Aplica a reason.
* Aplica a metadata serializada.

---

## TASK-107 — Implementar append-only tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* No PUT.
* No PATCH.
* No DELETE.
* Repositorio público no update.
* Repositorio público no delete.
* Correcciones se registran como nuevo evento.
* FK Restrict.

---

## TASK-108 — Implementar denied-events tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cross-tenant genera audit.
* Export sin permiso genera audit.
* Platform sin permiso genera audit.
* Permission denied genera audit.
* Own access denied genera audit si aplica.

---

## TASK-109 — Implementar logging security tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Logs no contienen tokens.
* Logs no contienen payload completo.
* Logs no contienen oldValue/newValue sensibles.
* Logs no contienen export completo.
* Logs tienen traceId.
* Métricas no usan actorUserId/resourceId como labels.

---

# 25. Fase 19 — Integración con módulos 001 a 006

## TASK-110 — Integrar auditoría en `001-tenants`

**Estado:** `[ ] Pending`

### Eventos

```text id="dhxzrj"
tenant.created
tenant.updated
tenant.activated
tenant.suspended
tenant.reactivated
tenant.archived
tenant.branding.updated
tenant.configuration.updated
tenant.wordpressMapping.updated
```

### Criterios de aceptación

* Eventos registrados.
* Platform/tenant scope correcto.
* old/new sanitizado.
* Tests MOD-AUD-001 pasan.

---

## TASK-111 — Integrar auditoría en `002-users-roles`

**Estado:** `[ ] Pending`

### Eventos

```text id="nn1tug"
user.created
user.updated
user.enabled
user.disabled
role.assigned
role.removed
permission.granted
permission.revoked
membership.created
membership.suspended
membership.revoked
invitation.created
invitation.accepted
invitation.revoked
invitation.expired
```

### Criterios de aceptación

* Cambios de acceso auditados.
* Categoría access.
* Severidad adecuada.
* Tests MOD-AUD-002 pasan.

---

## TASK-112 — Integrar auditoría en `003-residents-properties`

**Estado:** `[ ] Pending`

### Eventos

```text id="mimzum"
person.created
person.updated
person.archived
propertyUnit.created
propertyUnit.updated
propertyUnit.archived
ownership.created
ownership.ended
residency.created
residency.ended
lease.created
lease.ended
```

### Criterios de aceptación

* Eventos personalData sanitizados.
* No exponen datos personales innecesarios.
* Tests MOD-AUD-003 pasan.

---

## TASK-113 — Integrar auditoría en `004-dues-fees`

**Estado:** `[ ] Pending`

### Eventos

```text id="hi54pj"
chargeConcept.created
chargeConcept.updated
feeSchedule.created
unitFee.assigned
billingPeriod.closed
billingPeriod.locked
charges.generated
charge.created
charge.cancelled
charge.reversed
charge.adjusted
```

### Criterios de aceptación

* Eventos financieros registrados.
* Batch metadata controlada.
* Amounts como string.
* Tests MOD-AUD-004 pasan.

---

## TASK-114 — Integrar auditoría en `005-payments`

**Estado:** `[ ] Pending`

### Eventos

```text id="ieb9zd"
payment.created
payment.reported
payment.confirmed
payment.rejected
payment.allocated
payment.autoAllocated
payment.reversed
paymentReceipt.uploaded
paymentReceipt.accepted
paymentReceipt.rejected
paymentReceipt.downloaded
paymentAllocation.created
paymentAllocation.reversed
```

### Criterios de aceptación

* Eventos de pagos auditados.
* No guarda comprobantes.
* No guarda datos bancarios completos.
* Tests MOD-AUD-005 pasan.

---

## TASK-115 — Integrar auditoría en `006-account-statements`

**Estado:** `[ ] Pending`

### Eventos

```text id="km3d96"
accountStatement.generated
accountStatement.batchGenerated
accountStatement.published
accountStatement.closed
accountStatement.locked
accountStatement.regenerated
accountStatement.superseded
accountStatement.exported
balance.recalculated
balance.snapshotCreated
financialMovements.viewed
```

### Criterios de aceptación

* Eventos de statements auditados.
* Exportaciones auditadas.
* Regeneración auditada.
* Tests MOD-AUD-006 pasan.

---

# 26. Fase 20 — Observabilidad

## TASK-116 — Agregar logs estructurados del módulo audit

**Estado:** `[ ] Pending`

### Logs

```text id="z34dp0"
audit.log.created
audit.log.create.failed
audit.query.executed
audit.export.requested
audit.export.completed
audit.export.failed
audit.access.denied
audit.sanitization.redacted
```

### Criterios de aceptación

* Incluyen traceId.
* No incluyen payload completo.
* No incluyen secretos.
* No incluyen export completo.

---

## TASK-117 — Agregar métricas del módulo audit

**Estado:** `[ ] Pending`

### Métricas

```text id="fffdo8"
audit_logs_created_total
audit_logs_failed_total
audit_logs_query_total
audit_logs_export_total
audit_logs_access_denied_total
audit_logs_by_category_total
audit_logs_by_outcome_total
audit_sanitization_redacted_fields_total
audit_query_latency_ms
audit_write_latency_ms
```

### Criterios de aceptación

* Métricas incrementan.
* No usan labels de alta cardinalidad.
* No usan actorUserId.
* No usan resourceId.
* No usan traceId.

---

# 27. Fase 21 — CI/CD y smoke tests

## TASK-118 — Agregar scripts de test del módulo

**Estado:** `[ ] Pending`

### Scripts sugeridos

```bash id="e0lwm3"
npm run test:audit
npm run test:audit:unit
npm run test:audit:application
npm run test:audit:integration
npm run test:audit:api
npm run test:audit:authorization
npm run test:audit:multitenancy
npm run test:audit:sanitization
npm run test:audit:export
npm run test:audit:security
```

### Criterios de aceptación

* Scripts disponibles.
* Corren localmente.
* Documentados.

---

## TASK-119 — Agregar validaciones CI

**Estado:** `[ ] Pending`

### CI mínimo

```text id="u3uhr2"
lint
typecheck
unit tests
application tests
sanitizer tests
metadata validator tests
repository integration tests
API tests críticos
authorization tests
category permission tests
multitenancy tests
export tests
append-only tests
OpenAPI validation
build
```

### Criterios de aceptación

* Pipeline falla si hay secretos en audit logs.
* Pipeline falla si hay cross-tenant.
* Pipeline falla si export sin permiso pasa.
* Pipeline falla si update/delete existe.
* Pipeline falla si OpenAPI no coincide.

---

## TASK-120 — Agregar smoke tests

**Estado:** `[ ] Pending`

### Smoke tests

```text id="iqddz4"
GET /api/v1/health
GET /api/v1/tenant/audit-logs sin token
GET /api/v1/platform/audit-logs sin token
GET /api/v1/tenant/audit-logs con usuario autorizado
GET /api/v1/tenant/audit-logs con usuario sin permiso
GET /api/v1/platform/audit-logs con tenant user
```

### Criterios de aceptación

* Smoke tests pasan.
* No ejecutan export masivo.
* Errores incluyen traceId.

---

# 28. Fase 22 — Revisión SDD

## TASK-121 — Validar trazabilidad spec → tests

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Cada FR tiene tests.
* Cada endpoint tiene API tests.
* Cada permiso tiene auth tests.
* Cada categoría sensible tiene tests.
* Cada regla de sanitización tiene tests.
* Cada regla multitenant tiene tests.
* Cada exportación tiene tests.

---

## TASK-122 — Validar cumplimiento de ADRs

**Estado:** `[ ] Pending`

### ADRs

```text id="b88ebt"
ADR-003 Database Strategy
ADR-004 Multitenancy Strategy
ADR-007 Authorization Strategy
ADR-010 Observability Strategy
ADR-011 Testing Strategy
ADR-012 CI/CD Strategy
```

### Criterios de aceptación

* PostgreSQL + Prisma.
* tenant isolation.
* RBAC.
* observability.
* testing.
* CI gates.

---

## TASK-123 — Validar OpenAPI final

**Estado:** `[ ] Pending`

### Criterios de aceptación

* Coincide con api-contract.
* No documenta update/delete.
* Permisos documentados.
* Categorías sensibles documentadas.
* Exportación documentada.
* Errores documentados.

---

## TASK-124 — Ejecutar suite completa

**Estado:** `[ ] Pending`

### Comandos

```bash id="byecmq"
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
* No hay operaciones fuera de alcance.

---

## TASK-125 — Preparar evidencia de implementación

**Estado:** `[ ] Pending`

### Evidencia mínima

```text id="xuv4m6"
- PR link o commit SHA.
- Migración aplicada.
- Prisma Client generado.
- Seeds ejecutados.
- Tests ejecutados.
- OpenAPI actualizado.
- Smoke tests ejecutados.
- Riesgos pendientes.
- Diferidos documentados.
```

---

# 29. Fase 23 — Pendientes diferidos controlados

## TASK-126 — Diferir SIEM externo

**Estado:** `[-] Deferred`

### Razón

Requiere proveedor, formato, forwarding, seguridad y costos.

### Futuro

```text id="w4j1uy"
docs/specs/00X-security-monitoring/
```

---

## TASK-127 — Diferir WORM storage

**Estado:** `[-] Deferred`

### Razón

Requiere infraestructura específica y política legal.

### Futuro

```text id="fqqrk3"
docs/specs/00X-compliance-storage/
```

---

## TASK-128 — Diferir hash encadenado avanzado

**Estado:** `[-] Deferred`

### Razón

Requiere diseño criptográfico, rotación y verificación.

### Futuro

```text id="z4nt0x"
docs/specs/00X-audit-integrity/
```

---

## TASK-129 — Diferir firma digital de audit logs

**Estado:** `[-] Deferred`

### Razón

Requiere gestión de llaves y política de validación.

### Futuro

```text id="whw6b4"
docs/specs/00X-digital-signature/
```

---

## TASK-130 — Diferir legal hold avanzado

**Estado:** `[-] Deferred`

### Razón

Requiere reglas legales, casos, retención y roles especiales.

### Futuro

```text id="dlkpy2"
docs/specs/00X-legal-hold/
```

---

## TASK-131 — Diferir retención legal avanzada

**Estado:** `[-] Deferred`

### Razón

MVP conserva sin purga automática.

### Futuro

```text id="vbnaiw"
docs/specs/00X-data-retention/
```

---

## TASK-132 — Diferir detección automática de anomalías

**Estado:** `[-] Deferred`

### Razón

Requiere métricas históricas, umbrales, reglas o ML.

### Futuro

```text id="sdr4p6"
docs/specs/00X-anomaly-detection/
```

---

## TASK-133 — Diferir dashboards GRC/compliance

**Estado:** `[-] Deferred`

### Razón

Requiere reporting layer.

### Futuro

```text id="qzjbu2"
docs/specs/00X-compliance-reports/
```

---

## TASK-134 — Diferir gestión completa de incidentes

**Estado:** `[-] Deferred`

### Razón

Requiere workflow específico, asignación, severidad y cierre.

### Futuro

```text id="ix4i69"
docs/specs/00X-incident-management/
```

---

## TASK-135 — Diferir outbox transaccional completo

**Estado:** `[-] Deferred`

### Razón

Puede ser necesario para eventos externos, pero AuditLog MVP puede persistir directamente.

### Futuro

```text id="e65z9z"
docs/specs/00X-outbox-events/
```

---

# 30. Definition of Done

El módulo `007-audit` estará terminado cuando:

```text id="o4rdjs"
[ ] Documentación completa.
[ ] Módulo NestJS audit creado.
[ ] Modelo Prisma AuditLog creado.
[ ] Migración aplicada.
[ ] Índices creados.
[ ] Constraints creadas.
[ ] Seeds demo creados.
[ ] Value objects implementados.
[ ] Entidades implementadas.
[ ] Errores implementados.
[ ] Eventos internos implementados.
[ ] DTOs implementados.
[ ] AuditWriterPort implementado.
[ ] AuditReaderPort implementado.
[ ] AuditExportPort implementado.
[ ] TenantResourceResolverPort implementado.
[ ] AuditSanitizerService implementado.
[ ] AuditMetadataValidatorService implementado.
[ ] AuditEventBuilderService implementado.
[ ] AuditService implementado.
[ ] AuditQueryService implementado.
[ ] AuditPermissionPolicyService implementado.
[ ] AuditCategoryPolicyService implementado.
[ ] AuditExportService implementado.
[ ] Controladores tenant implementados.
[ ] Controlador resource implementado.
[ ] Controlador platform implementado.
[ ] Guards/policies implementados.
[ ] Endpoints tenant protegidos.
[ ] Endpoints platform protegidos.
[ ] Exportación JSON funciona.
[ ] Exportación CSV funciona.
[ ] CSV injection protection implementada.
[ ] Exportaciones auditadas.
[ ] Auditoría append-only en API.
[ ] No existen endpoints update/delete.
[ ] Consultas tenant filtran por tenant.
[ ] Consultas platform requieren permiso.
[ ] Categorías sensibles requieren permisos.
[ ] OldValue sanitizado.
[ ] NewValue sanitizado.
[ ] Metadata sanitizada.
[ ] Secrets redactados.
[ ] Payloads completos bloqueados.
[ ] Eventos de 001 auditados.
[ ] Eventos de 002 auditados.
[ ] Eventos de 003 auditados.
[ ] Eventos de 004 auditados.
[ ] Eventos de 005 auditados.
[ ] Eventos de 006 auditados.
[ ] Accesos denegados críticos auditados.
[ ] Logs sanitizados.
[ ] Métricas implementadas.
[ ] OpenAPI actualizado.
[ ] Unit tests pasan.
[ ] Application tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Category permission tests pasan.
[ ] Platform tests pasan.
[ ] Multitenancy tests pasan.
[ ] Sanitization tests pasan.
[ ] Export tests pasan.
[ ] Append-only tests pasan.
[ ] Financial audit tests pasan.
[ ] Access audit tests pasan.
[ ] Security tests pasan.
[ ] Smoke tests pasan.
[ ] CI pasa.
[ ] Pendientes diferidos documentados.
```

---

## 31. Orden recomendado de ejecución

```text id="ph6uy7"
1. TASK-001 a TASK-008      Documentación
2. TASK-009 a TASK-011      Estructura base
3. TASK-012 a TASK-020      Value objects
4. TASK-021 a TASK-027      Entidades, errores y eventos
5. TASK-028 a TASK-031      DTOs
6. TASK-032 a TASK-042      Prisma, migración y seeds
7. TASK-043 a TASK-050      Puertos y adaptadores
8. TASK-051 a TASK-059      Servicios
9. TASK-060 a TASK-067      Use cases
10. TASK-068 a TASK-073     Guards, policies y decorators
11. TASK-074 a TASK-076     Controladores
12. TASK-077 a TASK-078     Errores y responses
13. TASK-079 a TASK-083     OpenAPI
14. TASK-084 a TASK-109     Pruebas
15. TASK-110 a TASK-115     Integración módulos 001 a 006
16. TASK-116 a TASK-117     Observabilidad
17. TASK-118 a TASK-120     CI/CD y smoke
18. TASK-121 a TASK-125     Revisión SDD
```

---

## 32. Riesgos de ejecución

| Riesgo                               | Impacto | Mitigación                           |
| ------------------------------------ | ------- | ------------------------------------ |
| Auditoría incompleta                 | Alto    | Matriz de eventos obligatorios       |
| Secretos en audit logs               | Crítico | AuditSanitizerService + tests        |
| Consulta cross-tenant                | Crítico | tenant filter + MT tests             |
| Platform audit sin permiso           | Crítico | PlatformAuditPermissionGuard         |
| Export sin permiso                   | Alto    | audit.export + tests                 |
| CSV injection                        | Alto    | CSV sanitizer                        |
| Modificación ordinaria de audit logs | Crítico | no update/delete + append-only tests |
| Omisión de eventos financieros       | Crítico | integration tests 004/005/006        |
| Omisión de cambios de permisos       | Crítico | integration tests 002                |
| Metadata excesiva                    | Medio   | AuditMetadataValidator               |
| Recursión audit.exported             | Medio   | anti-recursion guard                 |
| Performance baja                     | Medio   | índices + paginación                 |
| Retención indefinida crece mucho     | Medio   | futura spec de retención             |

---

## 33. Checklist de revisión de PR

```text id="dg4kbr"
[ ] Sigue spec.md.
[ ] Sigue plan.md.
[ ] Sigue data-model.md.
[ ] Sigue api-contract.md.
[ ] No implementa SIEM fuera de alcance.
[ ] No implementa WORM fuera de alcance.
[ ] No implementa hash encadenado fuera de alcance.
[ ] No implementa legal hold fuera de alcance.
[ ] AuditLog tiene action.
[ ] AuditLog tiene category.
[ ] AuditLog tiene severity.
[ ] AuditLog tiene outcome.
[ ] AuditLog tenant-scoped tiene tenantId.
[ ] tenantId null solo en platform/pre-tenant.
[ ] Actor registrado cuando aplica.
[ ] Recurso registrado cuando aplica.
[ ] traceId registrado en HTTP.
[ ] oldValue sanitizado.
[ ] newValue sanitizado.
[ ] metadata sanitizada.
[ ] Passwords redactados.
[ ] Tokens redactados.
[ ] Authorization redactado.
[ ] Cookies redactadas.
[ ] API keys redactadas.
[ ] Payload completo bloqueado.
[ ] No se almacenan comprobantes completos.
[ ] No se almacenan archivos completos.
[ ] Repositorio público no expone update.
[ ] Repositorio público no expone delete.
[ ] API no expone PUT/PATCH/DELETE.
[ ] Tenant audit filtra por tenantId.
[ ] Resource audit valida pertenencia al tenant.
[ ] Platform audit requiere permisos platform.
[ ] Categorías sensibles requieren permisos.
[ ] Export requiere audit.export.
[ ] Platform export requiere audit.platform.export.
[ ] Export audita audit.exported.
[ ] CSV neutraliza fórmulas.
[ ] Logs no contienen secrets.
[ ] Logs no contienen payload completo.
[ ] Métricas no tienen labels de alta cardinalidad.
[ ] Eventos 001 integrados.
[ ] Eventos 002 integrados.
[ ] Eventos 003 integrados.
[ ] Eventos 004 integrados.
[ ] Eventos 005 integrados.
[ ] Eventos 006 integrados.
[ ] OpenAPI actualizado.
[ ] Tests pasan.
[ ] CI pasa.
[ ] No hay datos reales en seeds.
```

---

## 34. Resultado final esperado

Al completar estas tareas, RESIDENT Core tendrá un módulo transversal de auditoría capaz de registrar y consultar evidencia de operaciones críticas:

```text id="k9szlu"
- tenants;
- usuarios;
- roles;
- permisos;
- residentes;
- propiedades;
- cargos;
- pagos;
- comprobantes;
- estados de cuenta;
- balances;
- exportaciones;
- accesos denegados;
- intentos cross-tenant;
- eventos platform;
- eventos de integración futura.
```

Este módulo habilita futuras specs:

```text id="vvkwib"
00X-security-monitoring
00X-compliance-reports
00X-n8n-automations
00X-bank-reconciliation
00X-payment-gateway
00X-incident-management
00X-data-retention
00X-audit-integrity
```

Antes de cerrar el paquete documental de `007-audit`, debe completarse:

```text id="mu3db9"
docs/specs/007-audit/security-notes.md
```
