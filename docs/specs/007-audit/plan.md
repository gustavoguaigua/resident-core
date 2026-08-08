# Plan — Spec 007 Audit, Traceability and Compliance Events

## 1. Información del documento

| Campo          | Valor                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Proyecto       | RESIDENT Core                                                                                                           |
| Spec ID        | 007                                                                                                                     |
| Módulo         | Audit                                                                                                                   |
| Documento      | Implementation Plan                                                                                                     |
| Ruta           | `docs/specs/007-audit/plan.md`                                                                                          |
| Versión        | 0.1                                                                                                                     |
| Estado         | Borrador inicial                                                                                                        |
| Fecha          | 2026-07-14                                                                                                              |
| Documento base | `docs/specs/007-audit/spec.md`                                                                                          |
| Depende de     | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements` |
| Arquitectura   | Monolito modular NestJS                                                                                                 |
| Base de datos  | PostgreSQL + Prisma                                                                                                     |
| Autorización   | Tenant-aware RBAC + permisos de auditoría                                                                               |
| Prioridad      | Alta                                                                                                                    |

---

## 2. Propósito

Este documento transforma la especificación funcional `007-audit/spec.md` en un plan técnico de implementación.

El módulo `007-audit` será responsable de registrar, consultar, proteger y exportar eventos de auditoría generados por RESIDENT Core.

El módulo debe cubrir eventos relacionados con:

* tenants;
* usuarios;
* roles;
* permisos;
* membresías;
* residentes;
* propietarios;
* unidades habitacionales;
* cargos;
* alícuotas;
* periodos;
* pagos;
* comprobantes;
* asignaciones de pagos;
* reversos;
* estados de cuenta;
* balances;
* exportaciones;
* accesos denegados;
* intentos cross-tenant;
* integraciones futuras;
* jobs del sistema;
* acciones de soporte platform.

Regla central:

```text id="laglcp"
Toda operación crítica de RESIDENT Core debe dejar evidencia auditable, tenant-scoped, trazable, sanitizada, consultable bajo permisos estrictos y protegida contra modificación ordinaria.
```

---

## 3. Resumen de implementación

El módulo se implementará como módulo interno de NestJS dentro del monolito modular.

Componentes principales:

```text id="cyomzw"
AuditModule
AuditService
AuditWriterPort
AuditQueryService
AuditSanitizerService
AuditExportService
AuditPolicyService
AuditRepository
AuditLogsController
PlatformAuditLogsController
ResourceAuditLogsController
```

Entidades principales:

```text id="sh3bam"
AuditLog
AuditEvent
AuditActor
AuditResource
AuditContext
AuditMetadata
AuditExport opcional
```

Relación conceptual:

```text id="d1a22e"
RESIDENT Core Modules
    ↓
AuditWriterPort
    ↓
AuditService
    ↓
AuditSanitizerService
    ↓
AuditRepository
    ↓
audit_logs
```

Relación con módulos previos:

```text id="x2az1n"
001-tenants               → tenant lifecycle audit
002-users-roles           → identity, access, roles, permissions audit
003-residents-properties  → personal/property data audit
004-dues-fees             → charge and billing audit
005-payments              → payment and receipt audit
006-account-statements    → account statement and balance audit
007-audit                 → central audit persistence and query
```

---

## 4. Decisiones técnicas aplicables

Este módulo debe cumplir:

```text id="kq83mh"
ADR-001 — Architecture Style
ADR-002 — Backend Framework
ADR-003 — Database Strategy
ADR-004 — Multitenancy Strategy
ADR-007 — Authorization Strategy
ADR-010 — Observability Strategy
ADR-011 — Testing Strategy
ADR-012 — CI/CD Strategy
```

Reglas clave:

* Auditoría append-only en operación ordinaria.
* No endpoints ordinarios de update/delete para `AuditLog`.
* Todo evento tenant-scoped debe incluir `tenantId`.
* Eventos platform-level pueden tener `tenantId = null` solo si no pertenecen a un tenant.
* Todo evento debe incluir `action`.
* Todo evento debe incluir `outcome`.
* Todo evento debe incluir actor cuando sea posible.
* Todo evento debe incluir recurso cuando aplique.
* Todo evento originado en request HTTP debe incluir `traceId`.
* No guardar secretos ni payloads completos.
* Old/new values deben sanitizarse.
* Exportar auditoría requiere permiso explícito.
* Consultas deben ser paginadas.
* Logs técnicos no reemplazan auditoría funcional.
* Auditoría funcional no reemplaza observabilidad técnica.

---

## 5. Alcance técnico

### 5.1. Incluido

La implementación inicial cubre:

* módulo NestJS `audit`;
* modelos Prisma;
* migración;
* seeds demo;
* enums de auditoría;
* value objects;
* entidades de dominio;
* repositorio;
* servicios de escritura;
* servicios de consulta;
* sanitización;
* exportación JSON/CSV;
* controladores REST;
* permisos de auditoría;
* autorización tenant/platform;
* consulta por tenant;
* consulta por plataforma;
* consulta por recurso;
* filtros;
* paginación;
* auditoría de exportaciones;
* eventos internos;
* logs y métricas;
* OpenAPI;
* pruebas unitarias;
* pruebas de integración;
* pruebas API;
* pruebas de autorización;
* pruebas multitenant;
* pruebas de sanitización;
* pruebas de exportación;
* pruebas de integración con módulos `001` a `006`.

---

### 5.2. Diferido

No se implementará todavía:

* SIEM externo;
* WORM storage;
* hash encadenado avanzado;
* firma digital de audit logs;
* blockchain;
* legal hold avanzado;
* retención legal avanzada;
* detección automática de anomalías;
* machine learning antifraude;
* alertas automáticas;
* dashboards avanzados de compliance;
* integración GRC;
* gestión completa de incidentes;
* outbox transaccional completo si se decide diferir;
* almacenamiento frío;
* archivado regulatorio avanzado.

---

## 6. Estructura de carpetas recomendada

```text id="adxgmd"
apps/api/src/modules/audit/
├── audit.module.ts
│
├── audit-logs.controller.ts
├── platform-audit-logs.controller.ts
├── resource-audit-logs.controller.ts
│
├── application/
│   ├── use-cases/
│   │   ├── write-audit-log.use-case.ts
│   │   ├── list-tenant-audit-logs.use-case.ts
│   │   ├── get-tenant-audit-log.use-case.ts
│   │   ├── list-platform-audit-logs.use-case.ts
│   │   ├── get-platform-audit-log.use-case.ts
│   │   ├── list-resource-audit-logs.use-case.ts
│   │   ├── export-tenant-audit-logs.use-case.ts
│   │   └── export-platform-audit-logs.use-case.ts
│   │
│   ├── services/
│   │   ├── audit.service.ts
│   │   ├── audit-sanitizer.service.ts
│   │   ├── audit-query.service.ts
│   │   ├── audit-export.service.ts
│   │   ├── audit-permission-policy.service.ts
│   │   ├── audit-category-policy.service.ts
│   │   ├── audit-retention-policy.service.ts
│   │   ├── audit-event-builder.service.ts
│   │   └── audit-metadata-validator.service.ts
│   │
│   └── ports/
│       ├── audit-writer.port.ts
│       ├── audit-reader.port.ts
│       ├── audit-export.port.ts
│       ├── audit-events.port.ts
│       └── tenant-resource-resolver.port.ts
│
├── domain/
│   ├── entities/
│   │   ├── audit-log.entity.ts
│   │   ├── audit-event.entity.ts
│   │   ├── audit-actor.entity.ts
│   │   ├── audit-resource.entity.ts
│   │   └── audit-context.entity.ts
│   │
│   ├── value-objects/
│   │   ├── audit-action.vo.ts
│   │   ├── audit-category.vo.ts
│   │   ├── audit-severity.vo.ts
│   │   ├── audit-outcome.vo.ts
│   │   ├── audit-actor-type.vo.ts
│   │   ├── audit-resource-type.vo.ts
│   │   ├── audit-metadata.vo.ts
│   │   ├── audit-scope.vo.ts
│   │   └── audit-export-format.vo.ts
│   │
│   ├── events/
│   │   ├── audit-log-created.event.ts
│   │   ├── audit-log-write-failed.event.ts
│   │   ├── audit-logs-exported.event.ts
│   │   └── audit-access-denied.event.ts
│   │
│   └── errors/
│       ├── audit-log-not-found.error.ts
│       ├── audit-write-failed.error.ts
│       ├── audit-query-forbidden.error.ts
│       ├── audit-export-forbidden.error.ts
│       ├── audit-sensitive-field-detected.error.ts
│       └── audit-export-format-not-supported.error.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma-audit.repository.ts
│   │   └── audit.mapper.ts
│   │
│   ├── export/
│   │   └── audit-export.adapter.ts
│   │
│   ├── events/
│   │   └── audit-events.adapter.ts
│   │
│   └── interceptors/
│       └── audit-context.interceptor.ts
│
├── policies/
│   ├── audit-permission.guard.ts
│   ├── platform-audit-permission.guard.ts
│   └── audit-category.guard.ts
│
├── dto/
└── tests/
```

---

## 7. Documentación esperada

```text id="t8dkvf"
docs/specs/007-audit/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

Este documento corresponde a:

```text id="c4tcpr"
plan.md
```

---

# 8. Diseño de dominio

## 8.1. AuditLog

Representa un registro persistido de auditoría.

Campos conceptuales:

```text id="meipb9"
id
tenantId nullable
actorType
actorUserId nullable
actorDisplayName nullable
action
category
severity
outcome
resourceType nullable
resourceId nullable
resourceDisplay nullable
oldValue nullable
newValue nullable
metadata nullable
reason nullable
ipAddress nullable
userAgent nullable
requestId nullable
correlationId nullable
causationId nullable
traceId nullable
occurredAt
createdAt
archivedAt nullable
```

Responsabilidades:

* representar evidencia funcional;
* conservar actor, acción, recurso y resultado;
* conservar contexto técnico;
* conservar cambios sanitizados;
* soportar consulta filtrada;
* soportar exportación controlada.

Reglas:

* `action` obligatorio;
* `outcome` obligatorio;
* `occurredAt` obligatorio;
* si es tenant-scoped, `tenantId` obligatorio;
* `oldValue`, `newValue` y `metadata` deben estar sanitizados;
* no update/delete ordinario;
* no contener secretos.

---

## 8.2. AuditEvent

Representa el evento interno recibido por el módulo antes de persistir.

Campos conceptuales:

```text id="tnkz8f"
tenantId nullable
actor
action
category
severity
outcome
resource
oldValue
newValue
metadata
reason
context
occurredAt
```

Responsabilidad:

* ser la entrada estándar del `AuditWriterPort`;
* normalizar eventos de módulos internos;
* separar evento bruto de persistencia;
* permitir sanitización antes de persistir.

---

## 8.3. AuditActor

Representa quién ejecutó o causó la acción.

Campos:

```text id="wccqsc"
actorType
actorUserId nullable
actorDisplayName nullable
actorTenantMembershipId nullable
```

Tipos:

```text id="bjw6c1"
user
system
integration
job
webhook
platformSupport
unknown
```

---

## 8.4. AuditResource

Representa el recurso afectado.

Campos:

```text id="ervw5q"
resourceType
resourceId
resourceDisplay nullable
```

Ejemplos:

```text id="v8378y"
tenant
userProfile
role
propertyUnit
charge
payment
paymentReceipt
accountStatement
auditLog
file
integration
```

---

## 8.5. AuditContext

Representa el contexto técnico de la acción.

Campos:

```text id="nw8vd9"
ipAddress
userAgent
requestId
correlationId
causationId
traceId
method
path
```

Regla:

```text id="emvl1f"
AuditContext debe ser técnico, no debe almacenar payload completo.
```

---

## 8.6. AuditMetadata

Representa metadata adicional sanitizada.

Uso:

* conteos batch;
* errorCode;
* reason;
* source module;
* operation mode;
* export format;
* rowCount;
* category-specific details.

Prohibido:

* tokens;
* contraseñas;
* archivos;
* payload completo;
* comprobantes;
* secretos;
* datos bancarios completos.

---

# 9. Value Objects

## 9.1. AuditAction

Responsabilidad:

* validar formato de acción;
* normalizar acción;
* evitar acciones arbitrarias peligrosas;
* permitir taxonomía modular.

Formato recomendado:

```text id="c8yicb"
module.resource.action
```

o:

```text id="jz79k9"
resource.action
```

Ejemplos:

```text id="fbf09a"
tenant.created
payment.confirmed
accountStatement.generated
crossTenant.accessDenied
audit.exported
```

Reglas:

* string requerido;
* longitud máxima;
* lower camel / dot notation;
* no espacios;
* no caracteres peligrosos.

---

## 9.2. AuditCategory

Valores sugeridos:

```text id="hfgvxt"
platform
security
access
personalData
financial
payments
accountStatements
integration
file
export
system
```

---

## 9.3. AuditSeverity

Valores:

```text id="j35tfx"
debug
info
notice
warning
error
critical
```

---

## 9.4. AuditOutcome

Valores:

```text id="zn48ap"
success
failure
denied
partial
skipped
```

---

## 9.5. AuditActorType

Valores:

```text id="q9sg8x"
user
system
integration
job
webhook
platformSupport
unknown
```

---

## 9.6. AuditResourceType

Valores iniciales:

```text id="brt7cv"
tenant
userProfile
role
permission
membership
invitation
person
legalEntity
propertyUnit
ownership
residency
lease
vehicle
pet
emergencyContact
chargeConcept
feeSchedule
billingPeriod
charge
payment
paymentReceipt
paymentAllocation
accountStatement
unitBalance
balanceSnapshot
auditLog
file
integration
webhook
apiToken
systemJob
export
```

Regla:

```text id="wr7hqs"
El catálogo debe poder crecer sin romper eventos existentes.
```

---

## 9.7. AuditScope

Valores:

```text id="k3lcvb"
tenant
platform
resource
currentUser
```

---

## 9.8. AuditExportFormat

Valores MVP:

```text id="rkd4jw"
json
csv
```

PDF queda diferido.

---

# 10. Modelo Prisma preliminar

El modelo completo se detallará en:

```text id="c8c4lv"
docs/specs/007-audit/data-model.md
```

Tablas esperadas:

```text id="dw8hcz"
audit_logs
audit_exports opcional
```

Relaciones externas:

```text id="rci0ir"
tenants.id
user_profiles.id
```

Reglas de persistencia:

* `action` requerido;
* `category` requerido;
* `severity` requerido;
* `outcome` requerido;
* `occurredAt` requerido;
* `tenantId` nullable solo para platform-level;
* JSON sanitizado para oldValue/newValue/metadata;
* índices por tenant, actor, acción, categoría, outcome, resource, fecha, traceId;
* no cascade delete;
* no update/delete API ordinaria.

---

# 11. Repositorios

## 11.1. AuditRepository

Contrato sugerido:

```text id="jodmbw"
create(input)
findById(auditLogId)
findByIdForTenant(tenantId, auditLogId)
listByTenant(tenantId, query)
listPlatform(query)
listByResource(tenantId, resourceType, resourceId, query)
countByTenant(tenantId, query)
```

Reglas:

* `create` debe persistir evento sanitizado.
* `listByTenant` siempre filtra por tenant.
* `listPlatform` requiere autorización antes de llamarse.
* No exponer update/delete ordinario.

---

## 11.2. AuditExportRepository

Opcional MVP.

Si se implementa `AuditExport`:

```text id="bg95vq"
createExportRequest(input)
markExportCompleted(exportId, fileId, rowCount)
markExportFailed(exportId, reason)
findExportById(tenantId, exportId)
listExports(tenantId, query)
```

Si se difiere:

```text id="r1gkuf"
audit.exported se registra en audit_logs sin tabla audit_exports.
```

---

# 12. Puertos

## 12.1. AuditWriterPort

Puerto principal que usarán los demás módulos.

Contrato sugerido:

```text id="fu2zf2"
write(event: AuditEventInput): Promise<void>
writeMany(events: AuditEventInput[]): Promise<void>
```

Debe ser fácil de usar desde:

```text id="g2k8pe"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
```

Reglas:

* no aceptar payloads sin sanitización posterior;
* debe normalizar actor/contexto;
* debe registrar traceId cuando exista;
* debe tolerar actor system/job;
* debe ser testeable.

---

## 12.2. AuditReaderPort

Contrato sugerido:

```text id="u58rlz"
listTenantAuditLogs(tenantId, query)
getTenantAuditLog(tenantId, auditLogId)
listPlatformAuditLogs(query)
getPlatformAuditLog(auditLogId)
listResourceAuditLogs(tenantId, resourceType, resourceId, query)
```

---

## 12.3. AuditExportPort

Contrato sugerido:

```text id="m4xk8v"
exportToJson(auditLogs)
exportToCsv(auditLogs)
```

Reglas:

* sanitizar CSV contra fórmula injection;
* no exportar secretos;
* respetar permisos/categorías;
* no exportar más campos de los permitidos por scope.

---

## 12.4. AuditEventsPort

Para eventos internos del propio módulo:

```text id="hnmlod"
publish(event)
```

Eventos:

```text id="zjfw12"
AuditLogCreated
AuditLogWriteFailed
AuditLogsExported
AuditAccessDenied
```

---

## 12.5. TenantResourceResolverPort

Puerto para validar que un recurso pertenece a un tenant antes de consultar auditoría por recurso.

Contrato sugerido:

```text id="uzngv2"
resolveResourceTenant(resourceType, resourceId): Promise<string | null>
assertResourceBelongsToTenant(tenantId, resourceType, resourceId): Promise<void>
```

Implementación MVP:

* resolver explícitamente recursos principales;
* para tipos aún no soportados, validar por audit logs filtrados;
* evitar permitir resource audit query sin validar tenant.

---

# 13. Servicios de aplicación

## 13.1. AuditService

Responsabilidad:

* recibir eventos;
* validar mínimos;
* completar contexto;
* invocar sanitizador;
* persistir;
* emitir evento interno;
* manejar fallos según criticidad.

Métodos sugeridos:

```text id="eos8s9"
write(event)
writeMany(events)
writeCritical(event)
writeBestEffort(event)
```

Política:

```text id="mtc34r"
Operaciones financieras críticas pueden requerir writeCritical.
Operaciones informativas pueden usar writeBestEffort.
```

---

## 13.2. AuditSanitizerService

Responsabilidad:

* remover secretos;
* redactar campos sensibles;
* limitar tamaño de JSON;
* normalizar oldValue/newValue;
* normalizar metadata;
* proteger contra payloads completos.

Campos sensibles a redactar:

```text id="xg5ndg"
password
passwordHash
accessToken
refreshToken
authorization
cookie
secret
apiKey
privateKey
cardNumber
cvv
bankAccountNumber
fileContent
receiptContent
rawBody
```

Salida esperada:

```text id="fqlwoe"
[REDACTED]
```

---

## 13.3. AuditEventBuilderService

Responsabilidad:

* facilitar construcción de eventos;
* evitar que cada módulo cree objetos inconsistentes;
* aplicar defaults;
* mapear severidad por evento;
* mapear categoría por evento.

Ejemplo:

```text id="wim8va"
buildFinancialEvent(...)
buildAccessEvent(...)
buildDeniedEvent(...)
buildExportEvent(...)
```

---

## 13.4. AuditQueryService

Responsabilidad:

* aplicar filtros;
* aplicar permisos de categoría;
* aplicar paginación;
* aplicar sort permitido;
* evitar consultas cross-tenant;
* evitar consultas muy amplias sin permiso.

---

## 13.5. AuditPermissionPolicyService

Responsabilidad:

* decidir si actor puede consultar auditoría;
* decidir si actor puede exportar;
* decidir si actor puede consultar auditoría platform;
* decidir si puede ver categorías sensibles;
* filtrar oldValue/newValue según permiso.

Reglas:

```text id="re72sd"
audit.read ≠ audit.export
audit.read ≠ audit.readFinancial
audit.read ≠ audit.readPersonalData
audit.platform.read ≠ audit.platform.readSensitive
```

---

## 13.6. AuditCategoryPolicyService

Responsabilidad:

* mapear categorías a permisos;
* filtrar categorías invisibles;
* enmascarar campos sensibles por categoría.

Ejemplo:

```text id="a2ajcr"
financial → audit.readFinancial
access → audit.readAccess
personalData → audit.readPersonalData
security → audit.readSecurity
```

---

## 13.7. AuditExportService

Responsabilidad:

* ejecutar exportaciones JSON/CSV;
* aplicar filtros;
* aplicar permisos;
* limitar tamaño;
* auditar exportación;
* sanitizar CSV;
* no incluir secretos.

---

## 13.8. AuditRetentionPolicyService

Responsabilidad MVP:

* centralizar política de retención;
* indicar que no se purga en MVP;
* preparar evolución futura.

---

## 13.9. AuditMetadataValidatorService

Responsabilidad:

* validar estructura de metadata;
* impedir objetos excesivos;
* impedir arrays enormes;
* impedir campos sensibles;
* limitar profundidad.

---

# 14. Casos de uso principales

## 14.1. WriteAuditLogUseCase

Responsabilidad:

* validar evento;
* sanitizar;
* persistir;
* emitir evento interno.

Uso:

```text id="vc1jj5"
AuditWriterPort.write(event)
```

Debe soportar:

* eventos tenant-scoped;
* eventos platform-level;
* actores user/system/job/integration;
* eventos success/failure/denied/partial/skipped;
* metadata opcional;
* old/new values opcionales.

---

## 14.2. ListTenantAuditLogsUseCase

Uso:

```text id="cffz4p"
GET /api/v1/tenant/audit-logs
```

Responsabilidad:

* validar permiso `audit.read`;
* filtrar por tenant activo;
* aplicar permisos por categoría;
* aplicar filtros;
* paginar;
* devolver response sanitizado.

---

## 14.3. GetTenantAuditLogUseCase

Uso:

```text id="g6xmk8"
GET /api/v1/tenant/audit-logs/{auditLogId}
```

Responsabilidad:

* validar permiso;
* obtener evento por tenant;
* aplicar visibilidad de categoría;
* devolver detalle sanitizado.

---

## 14.4. ListResourceAuditLogsUseCase

Uso:

```text id="nqunmp"
GET /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
```

Responsabilidad:

* validar permiso;
* validar que el recurso pertenece al tenant;
* listar eventos del recurso;
* aplicar filtros;
* paginar.

---

## 14.5. ExportTenantAuditLogsUseCase

Uso:

```text id="htzsc2"
GET /api/v1/tenant/audit-logs/export
```

Responsabilidad:

* validar permiso `audit.export`;
* aplicar filtros;
* aplicar permisos por categoría;
* limitar volumen;
* exportar JSON/CSV;
* auditar `audit.exported`.

---

## 14.6. ListPlatformAuditLogsUseCase

Uso:

```text id="jwb9st"
GET /api/v1/platform/audit-logs
```

Responsabilidad:

* validar permiso `audit.platform.read`;
* aplicar filtros platform;
* permitir filtro por tenant si el actor tiene permiso;
* aplicar protección sobre eventos sensibles;
* paginar.

---

## 14.7. GetPlatformAuditLogUseCase

Uso:

```text id="jdd5fs"
GET /api/v1/platform/audit-logs/{auditLogId}
```

Responsabilidad:

* validar permiso platform;
* cargar evento;
* aplicar política de sensibilidad;
* devolver detalle.

---

## 14.8. ExportPlatformAuditLogsUseCase

Uso:

```text id="d0xe8k"
GET /api/v1/platform/audit-logs/export
```

Responsabilidad:

* validar permiso `audit.platform.export`;
* aplicar filtros;
* limitar volumen;
* exportar JSON/CSV;
* auditar `audit.exported`.

---

# 15. Controladores REST

## 15.1. AuditLogsController

Ruta base:

```text id="ia0fja"
/api/v1/tenant/audit-logs
```

Endpoints:

```text id="if3z33"
GET    /
GET    /:auditLogId
GET    /export
```

Guards:

```text id="ic6qka"
AuthGuard
TenantGuard
TenantPermissionGuard
AuditCategoryGuard opcional
```

---

## 15.2. ResourceAuditLogsController

Ruta:

```text id="u8lm84"
/api/v1/tenant/resources/:resourceType/:resourceId/audit-logs
```

Endpoint:

```text id="mpnefu"
GET /
```

Guards:

```text id="xyqj48"
AuthGuard
TenantGuard
TenantPermissionGuard
```

---

## 15.3. PlatformAuditLogsController

Ruta base:

```text id="qip5pm"
/api/v1/platform/audit-logs
```

Endpoints:

```text id="xj7iop"
GET    /
GET    /:auditLogId
GET    /export
```

Guards:

```text id="xcklgt"
AuthGuard
PlatformPermissionGuard
```

---

# 16. DTOs principales

## 16.1. ListAuditLogsQueryDto

Campos:

```text id="gduhgp"
actorUserId
actorType
action
category
severity
outcome
resourceType
resourceId
dateFrom
dateTo
traceId
correlationId
requestId
q
page
pageSize
sortBy
sortOrder
```

Validaciones:

* `page >= 1`;
* `pageSize <= 100`;
* `dateFrom <= dateTo`;
* `sortBy` permitido;
* `sortOrder` asc/desc;
* enums válidos;
* IDs válidos cuando aplique.

---

## 16.2. PlatformListAuditLogsQueryDto

Incluye lo anterior más:

```text id="ybm37t"
tenantId
tenantSlug
includePlatformEvents
```

Regla:

```text id="wnjwzr"
tenantId en query platform solo permitido con permiso platform.
```

---

## 16.3. AuditLogResponseDto

Campos:

```text id="k1pf65"
id
tenantId
actorType
actorUserId
actorDisplayName
action
category
severity
outcome
resourceType
resourceId
resourceDisplay
oldValue
newValue
metadata
reason
ipAddress
userAgent
requestId
correlationId
causationId
traceId
occurredAt
createdAt
```

Los campos se filtran según permiso.

---

## 16.4. AuditLogListItemDto

Versión reducida:

```text id="ekn0dn"
id
tenantId
actorType
actorUserId
action
category
severity
outcome
resourceType
resourceId
resourceDisplay
traceId
occurredAt
createdAt
```

---

## 16.5. ExportAuditLogsQueryDto

Campos:

```text id="i7ofix"
format
dateFrom
dateTo
category
action
resourceType
resourceId
actorUserId
outcome
severity
```

Formatos:

```text id="gsd3ks"
json
csv
```

---

# 17. Autenticación y autorización

## 17.1. Endpoints tenant

Todos los endpoints `/api/v1/tenant/audit-logs` requieren:

```text id="hd58y7"
AuthGuard
TenantGuard
TenantPermissionGuard
```

Permisos:

```text id="bcs86i"
audit.read
audit.export
audit.readFinancial
audit.readSecurity
audit.readAccess
audit.readPersonalData
```

---

## 17.2. Endpoints platform

Todos los endpoints `/api/v1/platform/audit-logs` requieren:

```text id="c2f3yt"
AuthGuard
PlatformPermissionGuard
```

Permisos:

```text id="sdtj7m"
audit.platform.read
audit.platform.export
audit.platform.readSensitive
```

---

## 17.3. Política por categoría

Mapeo sugerido:

| Categoría           | Permiso requerido                                  |
| ------------------- | -------------------------------------------------- |
| `platform`          | `audit.platform.read`                              |
| `security`          | `audit.readSecurity`                               |
| `access`            | `audit.readAccess`                                 |
| `personalData`      | `audit.readPersonalData`                           |
| `financial`         | `audit.readFinancial`                              |
| `payments`          | `audit.readFinancial`                              |
| `accountStatements` | `audit.readFinancial`                              |
| `integration`       | `audit.read`                                       |
| `file`              | `audit.read`                                       |
| `export`            | `audit.readSecurity` o `audit.read` según política |
| `system`            | `audit.read`                                       |

Regla MVP:

```text id="v1gsyi"
audit.read permite ver eventos generales, pero las categorías financial, access, security y personalData requieren permisos específicos si contienen información sensible.
```

---

## 17.4. Separación de funciones

No asumir que un permiso incluye otro.

Ejemplos:

```text id="ge0fii"
audit.read ≠ audit.export
audit.read ≠ audit.readFinancial
audit.read ≠ audit.readAccess
audit.read ≠ audit.readPersonalData
audit.platform.read ≠ audit.platform.export
audit.platform.read ≠ audit.platform.readSensitive
```

---

# 18. Auditoría del propio módulo Audit

El módulo Audit también debe auditar:

```text id="vxcqoe"
audit.queriedSensitive
audit.exported
audit.accessDenied
audit.platformQueried
audit.platformExported
```

Regla:

```text id="ga2cuy"
Toda exportación de auditoría debe generar otro AuditLog.
```

Cuidado:

```text id="drxiph"
Evitar recursión infinita al auditar audit.exported.
```

Solución:

```text id="fnx9nb"
AuditService debe tener protección anti-recursión para acciones internas de auditoría.
```

---

# 19. Eventos internos

Eventos mínimos del módulo:

```text id="zx6951"
AuditLogCreated
AuditLogWriteFailed
AuditLogsExported
AuditAccessDenied
```

Uso:

* métricas;
* observabilidad;
* notificaciones futuras;
* SIEM futuro;
* outbox futuro.

Reglas:

* no incluir payload completo;
* no incluir secretos;
* incluir tenantId si aplica;
* incluir traceId;
* incluir auditLogId si ya existe.

---

# 20. Observabilidad

## 20.1. Logs técnicos

Registrar:

```text id="m6pamf"
audit.log.created
audit.log.create.failed
audit.query.executed
audit.export.requested
audit.export.completed
audit.export.failed
audit.access.denied
audit.sanitization.redacted
```

No registrar:

```text id="apmg6y"
payload completo
oldValue/newValue completos si son sensibles
tokens
authorization headers
secretos
datos personales innecesarios
CSV completo
JSON exportado completo
```

---

## 20.2. Métricas sugeridas

```text id="da4kzg"
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

No usar labels de alta cardinalidad:

```text id="f6f9zd"
resourceId
actorUserId
traceId
ipAddress
userAgent
requestId
```

Labels permitidos:

```text id="jvi1cs"
category
outcome
severity
actorType
scope
```

---

## 20.3. Trace

Debe propagarse:

```text id="u7y8o0"
traceId
requestId
correlationId
causationId
```

en:

* escritura de auditoría;
* consulta de auditoría;
* exportación;
* errores;
* eventos internos.

---

# 21. Seguridad

Controles obligatorios:

* sanitización;
* permisos separados;
* tenant isolation;
* platform isolation;
* no update/delete ordinario;
* exportación auditada;
* rate limiting;
* paginación;
* max pageSize;
* max export rows;
* CSV injection protection;
* no secretos;
* no payload completo;
* tests de redacción;
* tests de multitenancy;
* tests de permisos.

Riesgos críticos:

| Riesgo                         | Mitigación                         |
| ------------------------------ | ---------------------------------- |
| Auditoría con secretos         | Sanitizer + tests                  |
| Auditoría cross-tenant         | tenant filter + MT tests           |
| Auditoría manipulable          | append-only + no API update/delete |
| Exportación sin permiso        | audit.export + authorization tests |
| Omisión de eventos financieros | integration tests con 004/005/006  |
| Omisión de cambios de permisos | integration tests con 002          |
| Payloads grandes               | metadata validator                 |
| CSV injection                  | export sanitizer                   |
| Recursión auditando auditoría  | anti-recursion guard               |

---

# 22. Migración

## 22.1. Nombre sugerido

```text id="oza2xh"
007_create_audit_logs
```

---

## 22.2. Tablas

MVP:

```text id="wxazt4"
audit_logs
```

Opcional:

```text id="jvifsg"
audit_exports
```

---

## 22.3. Enums

```text id="j1c6ga"
AuditActorType
AuditCategory
AuditSeverity
AuditOutcome
AuditResourceType opcional
AuditExportFormat opcional
AuditExportStatus opcional
```

Decisión recomendada:

```text id="x23b1t"
Usar enums para campos estables como actorType, category, severity y outcome.
Usar string para action y posiblemente resourceType para permitir crecimiento flexible.
```

---

## 22.4. Índices críticos

```text id="czioo1"
tenant_id
actor_user_id
action
category
severity
outcome
resource_type + resource_id
occurred_at
trace_id
correlation_id
request_id
tenant_id + occurred_at
tenant_id + resource_type + resource_id
tenant_id + actor_user_id
tenant_id + category
```

---

## 22.5. Reglas de migración

* `action` not null.
* `category` not null.
* `severity` not null.
* `outcome` not null.
* `occurred_at` not null.
* `created_at` not null.
* `old_value`, `new_value`, `metadata` JSONB sanitizados.
* `tenant_id` nullable solo para platform-level.
* no cascade delete.
* no FK obligatoria a todos los recursos por diseño polimórfico.
* FK opcional a tenant y userProfile.

---

# 23. Seeds

Seeds sugeridos:

```text id="cc738k"
tenant.created demo
user.created demo
role.assigned demo
propertyUnit.updated demo
charge.created demo
payment.confirmed demo
payment.reversed demo
accountStatement.generated demo
accountStatement.exported demo
crossTenant.accessDenied demo
audit.exported demo
```

Reglas:

* datos ficticios;
* sin tokens;
* sin passwords;
* sin datos reales;
* metadata mínima;
* old/new values sanitizados.

---

# 24. Testing plan resumido

El documento completo será:

```text id="qv4l53"
docs/specs/007-audit/test-plan.md
```

## 24.1. Unit tests

* AuditAction.
* AuditCategory.
* AuditSeverity.
* AuditOutcome.
* AuditActorType.
* AuditEventBuilder.
* AuditSanitizerService.
* AuditMetadataValidator.
* AuditPermissionPolicy.
* AuditCategoryPolicy.
* AuditExportService.

---

## 24.2. Integration tests

* migración;
* repositorio;
* create audit log;
* list by tenant;
* list by resource;
* platform query;
* sanitización persistida;
* indexes básicos;
* seeds.

---

## 24.3. API tests

* tenant audit list;
* tenant audit detail;
* tenant resource audit;
* tenant audit export;
* platform audit list;
* platform audit detail;
* platform audit export;
* filters;
* pagination.

---

## 24.4. Authorization tests

* sin token;
* sin permiso;
* audit.read;
* audit.export;
* audit.readFinancial;
* audit.readAccess;
* audit.readPersonalData;
* audit.platform.read;
* audit.platform.export;
* Tenant A no ve Tenant B.

---

## 24.5. Sanitization tests

* password redacted;
* tokens redacted;
* authorization redacted;
* cookies redacted;
* API keys redacted;
* file content redacted;
* raw payload blocked;
* metadata too large rejected/truncated.

---

## 24.6. Financial audit tests

Verificar eventos desde:

```text id="zkpobc"
004-dues-fees
005-payments
006-account-statements
```

---

# 25. Orden recomendado de desarrollo

## Fase 1 — Documentación

```text id="z0wg96"
1. spec.md
2. plan.md
3. data-model.md
4. api-contract.md
5. test-plan.md
6. tasks.md
7. security-notes.md
```

---

## Fase 2 — Base técnica

```text id="bzybg7"
1. Crear módulo audit.
2. Crear estructura de carpetas.
3. Crear enums/value objects.
4. Crear entidades.
5. Crear errores.
6. Crear eventos internos.
7. Crear DTOs.
```

---

## Fase 3 — Persistencia

```text id="id4jrf"
1. Crear modelos Prisma.
2. Crear migración.
3. Crear índices.
4. Crear constraints.
5. Crear repositorio.
6. Crear mappers.
7. Crear seeds.
8. Crear migration tests.
```

---

## Fase 4 — Servicios

```text id="aus7ga"
1. AuditSanitizerService.
2. AuditMetadataValidatorService.
3. AuditEventBuilderService.
4. AuditService.
5. AuditQueryService.
6. AuditPermissionPolicyService.
7. AuditCategoryPolicyService.
8. AuditExportService.
9. AuditRetentionPolicyService.
```

---

## Fase 5 — API

```text id="gip0ei"
1. Tenant Audit API.
2. Resource Audit API.
3. Platform Audit API.
4. Export API.
5. Guards.
6. OpenAPI.
```

---

## Fase 6 — Integración con módulos existentes

```text id="yzb6v2"
1. Integrar 001-tenants.
2. Integrar 002-users-roles.
3. Integrar 003-residents-properties.
4. Integrar 004-dues-fees.
5. Integrar 005-payments.
6. Integrar 006-account-statements.
```

---

## Fase 7 — Hardening y pruebas

```text id="aqwva1"
1. Unit tests.
2. Integration tests.
3. API tests.
4. Authorization tests.
5. Multitenancy tests.
6. Sanitization tests.
7. Financial audit tests.
8. Export tests.
9. Security tests.
10. OpenAPI tests.
11. Smoke tests.
```

---

# 26. Criterios técnicos de aceptación

La implementación técnica se acepta si:

* módulo `audit` creado;
* modelo `AuditLog` creado;
* migración aplicada;
* servicio central de auditoría existe;
* `AuditWriterPort` disponible para módulos internos;
* eventos pueden registrarse desde módulos `001` a `006`;
* eventos se sanitizan antes de persistir;
* eventos tenant-scoped tienen tenantId;
* eventos platform-level permiten tenantId null solo cuando aplica;
* actor se registra cuando existe;
* action se registra siempre;
* outcome se registra siempre;
* resourceType/resourceId se registran cuando aplica;
* traceId se registra en eventos HTTP;
* oldValue/newValue se sanitizan;
* metadata se valida;
* no se almacenan secretos;
* consultas tenant filtran por tenant;
* consultas platform requieren permiso platform;
* consulta por recurso valida pertenencia al tenant;
* exportación requiere permiso;
* exportación se audita;
* CSV export está sanitizado;
* no hay update/delete ordinario;
* OpenAPI actualizado;
* tests unitarios pasan;
* tests de integración pasan;
* tests API pasan;
* tests de autorización pasan;
* tests multitenant pasan;
* tests de sanitización pasan;
* tests financieros pasan;
* CI pasa.

---

# 27. Comandos esperados

Comandos generales:

```bash id="xd1yt2"
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:api
npm run test:authorization
npm run test:multitenancy
npm run test:security
npm run openapi:validate
npm run prisma:migrate:dev
npm run build
```

Comandos específicos sugeridos:

```bash id="fhor6p"
npm run test:audit
npm run test:audit:unit
npm run test:audit:integration
npm run test:audit:api
npm run test:audit:authorization
npm run test:audit:multitenancy
npm run test:audit:sanitization
npm run test:audit:financial
npm run test:audit:security
```

---

# 28. Riesgos de implementación

| Riesgo                                 | Impacto | Mitigación                          |
| -------------------------------------- | ------- | ----------------------------------- |
| Auditoría incompleta                   | Alto    | matriz de eventos obligatorios      |
| Auditoría con secretos                 | Crítico | sanitizer + tests                   |
| Auditoría cross-tenant                 | Crítico | tenant filter + MT tests            |
| Auditoría manipulable                  | Crítico | append-only + no update/delete API  |
| Exportación sin permiso                | Alto    | audit.export + auth tests           |
| Eventos financieros omitidos           | Crítico | integration tests 004/005/006       |
| Eventos de acceso omitidos             | Crítico | integration tests 002               |
| Payloads demasiado grandes             | Medio   | metadata validator                  |
| Performance baja en consultas          | Medio   | índices + paginación                |
| Recursión al auditar auditoría         | Medio   | anti-recursion guard                |
| Confusión logs vs auditoría            | Medio   | separación AuditLog vs logger       |
| PlatformAdmin accede sin justificación | Alto    | permisos platform sensitive + audit |

---

# 29. Checklist para agentes IA

Antes de generar código para este módulo, el agente debe leer:

```text id="kgfx86"
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
docs/specs/007-audit/spec.md
docs/specs/007-audit/plan.md
```

El agente no debe:

* almacenar passwords;
* almacenar tokens;
* almacenar Authorization headers;
* almacenar payload completo;
* almacenar comprobantes;
* almacenar exports completos dentro de audit logs;
* crear endpoints update/delete ordinarios;
* permitir consulta cross-tenant;
* permitir exportación sin permiso;
* permitir consulta platform sin permiso;
* omitir sanitización;
* omitir traceId;
* confundir logger técnico con auditoría;
* usar auditoría como event bus operativo;
* implementar SIEM fuera de alcance;
* implementar WORM fuera de alcance;
* implementar hash encadenado si no está especificado para MVP.

---

# 30. Estrategia de entrega

## Incremento 1 — Persistencia y escritura básica

* `AuditLog`.
* Migración.
* `AuditWriterPort`.
* `AuditService`.
* `AuditSanitizerService`.
* Registro básico desde un módulo demo.
* Unit tests.

---

## Incremento 2 — Consulta tenant

* `GET /api/v1/tenant/audit-logs`.
* `GET /api/v1/tenant/audit-logs/{auditLogId}`.
* Filtros.
* Paginación.
* Permisos.
* Multitenancy tests.

---

## Incremento 3 — Consulta por recurso

* `GET /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs`.
* `TenantResourceResolverPort`.
* Validación de pertenencia tenant.
* Tests.

---

## Incremento 4 — Exportación tenant

* Export JSON.
* Export CSV.
* CSV injection protection.
* `audit.exported`.
* Authorization tests.

---

## Incremento 5 — Platform audit

* Platform query.
* Platform detail.
* Platform export.
* Permisos platform.
* Sensitive policy.
* Tests.

---

## Incremento 6 — Integración módulos 001 a 006

* Eventos tenants.
* Eventos access.
* Eventos residents/properties.
* Eventos dues/fees.
* Eventos payments.
* Eventos account statements.
* Financial audit tests.

---

## Incremento 7 — Hardening

* Sanitization completa.
* Metadata validator.
* Logs sanitizados.
* Métricas.
* OpenAPI.
* Security tests.
* CI gates.

---

# 31. Pendientes para documentos derivados

## 31.1. `data-model.md`

Debe detallar:

* tabla `audit_logs`;
* tabla `audit_exports` opcional;
* columnas;
* enums;
* índices;
* constraints;
* JSONB sanitizado;
* Prisma completo;
* seeds;
* reglas de retención;
* reglas append-only.

---

## 31.2. `api-contract.md`

Debe detallar:

* endpoints tenant;
* endpoints platform;
* endpoints resource audit;
* exportación;
* filtros;
* paginación;
* permisos;
* errores;
* DTOs;
* OpenAPI.

---

## 31.3. `test-plan.md`

Debe detallar:

* unit tests;
* sanitizer tests;
* repository tests;
* API tests;
* authorization tests;
* multitenancy tests;
* financial audit tests;
* export tests;
* security tests;
* OpenAPI tests.

---

## 31.4. `tasks.md`

Debe convertir este plan en tareas ejecutables.

---

## 31.5. `security-notes.md`

Debe detallar:

* riesgos de auditoría incompleta;
* riesgos de secretos;
* riesgos de exportación;
* append-only;
* sanitización;
* permisos;
* multitenancy;
* platform support access;
* pruebas de seguridad.

---

# 32. Decisión final de implementación

El módulo `007-audit` se implementará como módulo transversal interno de NestJS.

Usará PostgreSQL y Prisma.

Persistirá inicialmente auditoría en:

```text id="qjv1xc"
audit_logs
```

La tabla `audit_exports` queda como opcional para MVP, pero la exportación debe auditarse obligatoriamente mediante `audit.exported`.

Los módulos `001` a `006` deberán integrarse mediante:

```text id="wn3a1z"
AuditWriterPort
```

El módulo deberá garantizar:

```text id="job8nl"
tenant isolation
actor tracking
resource tracking
outcome tracking
traceId propagation
sanitization
append-only behavior
permissioned query
permissioned export
financial audit coverage
access audit coverage
cross-tenant denial audit
export audit
```

La implementación inicial no incluirá WORM storage, hash encadenado, SIEM, detección automática de anomalías ni retención legal avanzada.

La prioridad técnica será:

```text id="tfe2q3"
trazabilidad funcional
seguridad de datos
no repudio operativo básico
aislamiento multitenant
sanitización
cobertura financiera
cobertura de accesos
consulta controlada
exportación controlada
compatibilidad con cumplimiento futuro
```

El módulo no debe aceptarse si permite auditoría manipulable por API ordinaria, mezcla tenants, almacena secretos, omite eventos financieros críticos, omite cambios de permisos, permite exportación sin permiso o no conserva trazabilidad suficiente para reconstruir acciones relevantes.
