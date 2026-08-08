# Data Model — Spec 007 Audit, Traceability and Compliance Events

## 1. Información del documento

| Campo                  | Valor                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                           |
| Spec ID                | 007                                                                                                                     |
| Módulo                 | Audit                                                                                                                   |
| Documento              | Data Model                                                                                                              |
| Ruta                   | `docs/specs/007-audit/data-model.md`                                                                                    |
| Versión                | 0.1                                                                                                                     |
| Estado                 | Borrador inicial                                                                                                        |
| Fecha                  | 2026-07-14                                                                                                              |
| Documento base         | `docs/specs/007-audit/spec.md`                                                                                          |
| Plan técnico           | `docs/specs/007-audit/plan.md`                                                                                          |
| Depende de             | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements` |
| Base de datos          | PostgreSQL                                                                                                              |
| ORM                    | Prisma                                                                                                                  |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                                           |
| Retención MVP          | Sin purga automática                                                                                                    |
| Política de escritura  | Append-only en operación ordinaria                                                                                      |

---

## 2. Propósito

Este documento define el modelo de datos para el módulo `007-audit`.

El modelo debe permitir registrar eventos de auditoría de RESIDENT Core de manera:

* trazable;
* consultable;
* tenant-scoped;
* sanitizada;
* protegida contra modificación ordinaria;
* preparada para exportación;
* preparada para cumplimiento futuro;
* compatible con módulos financieros;
* compatible con módulos de acceso;
* compatible con observabilidad;
* compatible con soporte platform.

Regla central:

```text id="zrhduz"
AuditLog debe capturar evidencia funcional y de seguridad de acciones críticas, sin convertirse en repositorio de secretos, payloads completos o datos sensibles innecesarios.
```

---

## 3. Principios del modelo

### 3.1. Auditoría append-only

`audit_logs` debe comportarse como una tabla append-only en operación normal.

Reglas:

```text id="agqids"
- Se permite INSERT.
- No se permite UPDATE ordinario.
- No se permite DELETE ordinario.
- No se exponen endpoints update/delete.
- Correcciones futuras deben realizarse mediante nuevos eventos.
```

---

### 3.2. Tenant-scoped por defecto

Todo evento operativo debe tener `tenant_id`.

Excepciones permitidas:

```text id="gvtw5k"
- eventos platform-level;
- eventos de autenticación antes de seleccionar tenant;
- eventos globales del sistema;
- eventos de soporte platform sin tenant específico;
- fallos previos a resolución de tenant.
```

---

### 3.3. Actor identificable

Todo evento debe registrar actor cuando sea posible.

Tipos de actor:

```text id="bipk5x"
user
system
integration
job
webhook
platformSupport
unknown
```

---

### 3.4. Recurso identificado

Si una acción afecta un recurso, debe registrarse:

```text id="rh1b7c"
resource_type
resource_id
```

Ejemplos:

```text id="cyoe66"
payment / payment_uuid
charge / charge_uuid
accountStatement / statement_uuid
propertyUnit / unit_uuid
userProfile / user_uuid
```

---

### 3.5. Sanitización obligatoria

Antes de persistir `old_value`, `new_value` o `metadata`, se debe aplicar sanitización.

No almacenar:

```text id="n3cf69"
password
passwordHash
accessToken
refreshToken
authorization header
cookie completa
secret
apiKey completa
privateKey
comprobante completo
archivo completo
payload completo
datos bancarios completos
stack trace completo
```

---

### 3.6. JSONB controlado

Se permite JSONB en auditoría porque los eventos tienen estructuras variables.

Pero JSONB debe estar limitado a:

```text id="i6ku7f"
old_value sanitizado
new_value sanitizado
metadata sanitizada
filters sanitizados para exportación opcional
```

No se debe usar JSONB para almacenar archivos, comprobantes ni payloads completos.

---

### 3.7. Correlación obligatoria

Eventos generados por HTTP deben registrar:

```text id="swxtpe"
trace_id
request_id
correlation_id
```

cuando estén disponibles.

---

### 3.8. No reemplazar logs técnicos

`audit_logs` no reemplaza logs técnicos.

Diferencia:

```text id="cy72mt"
AuditLog = evidencia funcional y de seguridad.
Technical Log = diagnóstico operacional.
```

---

## 4. Entidades persistentes

MVP obligatorio:

```text id="a6m3uv"
AuditLog
```

MVP opcional:

```text id="hrdxnw"
AuditExport
```

Decisión recomendada:

```text id="qwnp5j"
Implementar audit_logs en MVP.
Diferir audit_exports salvo que se requiera historial específico de exportaciones como recurso consultable.
Toda exportación debe auditarse igualmente como audit.exported.
```

---

# 5. Tabla `audit_logs`

## 5.1. Propósito

Registra eventos auditables de acciones críticas, seguridad, acceso, finanzas, datos personales, integración y soporte platform.

---

## 5.2. Nombre físico

```text id="h1x6mx"
audit_logs
```

---

## 5.3. Columnas

| Columna               | Tipo lógico | Requerido |   Default | Descripción                               |
| --------------------- | ----------: | --------: | --------: | ----------------------------------------- |
| `id`                  | UUID/string |        Sí |      uuid | Identificador del evento                  |
| `tenant_id`           | UUID/string |        No |      null | Tenant asociado, null solo platform-level |
| `actor_type`          |        enum |        Sí | `unknown` | Tipo de actor                             |
| `actor_user_id`       | UUID/string |        No |      null | Usuario actor si aplica                   |
| `actor_display_name`  |      string |        No |      null | Snapshot sanitizado del actor             |
| `actor_membership_id` | UUID/string |        No |      null | Membership activa usada si aplica         |
| `action`              |      string |        Sí |         — | Acción auditable                          |
| `category`            |        enum |        Sí |         — | Categoría                                 |
| `severity`            |        enum |        Sí |    `info` | Severidad                                 |
| `outcome`             |        enum |        Sí |         — | Resultado                                 |
| `resource_type`       | string/enum |        No |      null | Tipo de recurso                           |
| `resource_id`         | UUID/string |        No |      null | ID del recurso                            |
| `resource_display`    |      string |        No |      null | Snapshot sanitizado del recurso           |
| `old_value`           |       JSONB |        No |      null | Valor anterior sanitizado                 |
| `new_value`           |       JSONB |        No |      null | Valor nuevo sanitizado                    |
| `metadata`            |       JSONB |        No |      null | Metadata sanitizada                       |
| `reason`              |      string |        No |      null | Motivo cuando aplica                      |
| `ip_address`          |      string |        No |      null | IP del request si aplica                  |
| `user_agent`          |      string |        No |      null | User agent sanitizado                     |
| `request_id`          |      string |        No |      null | ID de request                             |
| `correlation_id`      |      string |        No |      null | ID de correlación                         |
| `causation_id`        |      string |        No |      null | ID de evento causante                     |
| `trace_id`            |      string |        No |      null | Trace ID                                  |
| `source_module`       |      string |        No |      null | Módulo origen                             |
| `source_version`      |      string |        No |      null | Versión lógica del evento                 |
| `occurred_at`         |   timestamp |        Sí |       now | Momento real del evento                   |
| `created_at`          |   timestamp |        Sí |       now | Momento de persistencia                   |
| `archived_at`         |   timestamp |        No |      null | Archivado lógico futuro                   |

---

## 5.4. Reglas

* `action` obligatorio.
* `category` obligatorio.
* `severity` obligatorio.
* `outcome` obligatorio.
* `occurred_at` obligatorio.
* `tenant_id` requerido para eventos tenant-scoped.
* `tenant_id = null` permitido solo para platform-level o eventos pre-tenant.
* `actor_type` obligatorio.
* `actor_user_id` requerido cuando `actor_type = user` o `platformSupport`, salvo caso especial documentado.
* `resource_type` y `resource_id` requeridos cuando la acción afecta un recurso específico.
* `old_value`, `new_value` y `metadata` deben estar sanitizados.
* `ip_address` y `user_agent` deben provenir del contexto HTTP cuando aplique.
* No se permite update/delete ordinario.
* `archived_at` no se usa en MVP salvo política futura.
* No se debe almacenar payload completo.

---

## 5.5. Índices recomendados

```text id="p0m0mi"
index audit_logs_tenant_id_idx on audit_logs(tenant_id)
index audit_logs_actor_user_id_idx on audit_logs(actor_user_id)
index audit_logs_actor_type_idx on audit_logs(actor_type)
index audit_logs_action_idx on audit_logs(action)
index audit_logs_category_idx on audit_logs(category)
index audit_logs_severity_idx on audit_logs(severity)
index audit_logs_outcome_idx on audit_logs(outcome)
index audit_logs_resource_idx on audit_logs(resource_type, resource_id)
index audit_logs_occurred_at_idx on audit_logs(occurred_at)
index audit_logs_trace_id_idx on audit_logs(trace_id)
index audit_logs_request_id_idx on audit_logs(request_id)
index audit_logs_correlation_id_idx on audit_logs(correlation_id)
index audit_logs_tenant_occurred_idx on audit_logs(tenant_id, occurred_at)
index audit_logs_tenant_resource_idx on audit_logs(tenant_id, resource_type, resource_id)
index audit_logs_tenant_actor_idx on audit_logs(tenant_id, actor_user_id)
index audit_logs_tenant_category_idx on audit_logs(tenant_id, category)
index audit_logs_tenant_action_idx on audit_logs(tenant_id, action)
```

---

## 5.6. Índices JSONB opcionales

MVP recomendado:

```text id="wnsgw1"
No crear índices GIN sobre old_value/new_value/metadata en MVP salvo necesidad real.
```

Futuro:

```sql id="a7qfi4"
CREATE INDEX audit_logs_metadata_gin_idx
ON audit_logs USING GIN (metadata);
```

Riesgo:

```text id="sxyuph"
Indexar JSONB sin control puede aumentar almacenamiento y costo de escritura.
```

---

# 6. Tabla opcional `audit_exports`

## 6.1. Propósito

Registrar solicitudes de exportación de auditoría como recurso propio.

Esta tabla es opcional en MVP.

Si se difiere, cada exportación debe registrarse de todas formas en `audit_logs` como:

```text id="dcshvs"
audit.exported
```

---

## 6.2. Nombre físico

```text id="yel8ny"
audit_exports
```

---

## 6.3. Columnas

| Columna        | Tipo lógico | Requerido | Default | Descripción                         |
| -------------- | ----------: | --------: | ------: | ----------------------------------- |
| `id`           | UUID/string |        Sí |    uuid | Identificador                       |
| `tenant_id`    | UUID/string |        No |    null | Tenant asociado, null para platform |
| `requested_by` | UUID/string |        Sí |       — | Usuario solicitante                 |
| `scope`        |        enum |        Sí |       — | tenant/platform/resource            |
| `filters`      |       JSONB |        No |    null | Filtros sanitizados                 |
| `format`       |        enum |        Sí |    json | json/csv                            |
| `status`       |        enum |        Sí | pending | Estado                              |
| `file_id`      |      string |        No |    null | Archivo generado si se almacena     |
| `row_count`    |     integer |        Sí |       0 | Filas exportadas                    |
| `requested_at` |   timestamp |        Sí |     now | Fecha solicitud                     |
| `completed_at` |   timestamp |        No |    null | Fecha fin                           |
| `expires_at`   |   timestamp |        No |    null | Expiración descarga                 |
| `created_at`   |   timestamp |        Sí |     now | Creación                            |
| `archived_at`  |   timestamp |        No |    null | Archivado lógico                    |

---

## 6.4. Estados

```text id="vzw7u8"
pending
processing
completed
failed
expired
archived
```

---

## 6.5. Reglas

* `requested_by` obligatorio.
* `scope` obligatorio.
* `format` obligatorio.
* `row_count >= 0`.
* Filtros deben sanitizarse.
* No almacenar export completo en `audit_exports`.
* `file_id` solo si se decide persistir archivo exportado.
* Toda exportación debe generar `audit.exported`.
* La exportación de auditoría no debe causar recursión infinita.

---

## 6.6. Decisión MVP

Recomendación para MVP:

```text id="l2qie9"
Diferir audit_exports.
Registrar exportaciones mediante AuditLog con action audit.exported.
```

Motivo:

* reduce complejidad;
* evita gestión de archivos exportados;
* mantiene trazabilidad mínima;
* permite evolucionar después.

---

# 7. Enums

## 7.1. `AuditActorType`

Valores:

```text id="nnw6ya"
user
system
integration
job
webhook
platformSupport
unknown
```

Prisma:

```prisma id="kb2qer"
enum AuditActorType {
  USER             @map("user")
  SYSTEM           @map("system")
  INTEGRATION      @map("integration")
  JOB              @map("job")
  WEBHOOK          @map("webhook")
  PLATFORM_SUPPORT @map("platformSupport")
  UNKNOWN          @map("unknown")

  @@map("audit_actor_type")
}
```

---

## 7.2. `AuditCategory`

Valores:

```text id="ge5oos"
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

Prisma:

```prisma id="evfgc2"
enum AuditCategory {
  PLATFORM           @map("platform")
  SECURITY           @map("security")
  ACCESS             @map("access")
  PERSONAL_DATA      @map("personalData")
  FINANCIAL          @map("financial")
  PAYMENTS           @map("payments")
  ACCOUNT_STATEMENTS @map("accountStatements")
  INTEGRATION        @map("integration")
  FILE               @map("file")
  EXPORT             @map("export")
  SYSTEM             @map("system")

  @@map("audit_category")
}
```

---

## 7.3. `AuditSeverity`

Valores:

```text id="r7vsil"
debug
info
notice
warning
error
critical
```

Prisma:

```prisma id="ov47w8"
enum AuditSeverity {
  DEBUG    @map("debug")
  INFO     @map("info")
  NOTICE   @map("notice")
  WARNING  @map("warning")
  ERROR    @map("error")
  CRITICAL @map("critical")

  @@map("audit_severity")
}
```

---

## 7.4. `AuditOutcome`

Valores:

```text id="vl0qb8"
success
failure
denied
partial
skipped
```

Prisma:

```prisma id="zrffpo"
enum AuditOutcome {
  SUCCESS @map("success")
  FAILURE @map("failure")
  DENIED  @map("denied")
  PARTIAL @map("partial")
  SKIPPED @map("skipped")

  @@map("audit_outcome")
}
```

---

## 7.5. `AuditExportFormat`

Opcional si se implementa `audit_exports`.

Valores:

```text id="yru3fh"
json
csv
```

Prisma:

```prisma id="vcygrk"
enum AuditExportFormat {
  JSON @map("json")
  CSV  @map("csv")

  @@map("audit_export_format")
}
```

---

## 7.6. `AuditExportStatus`

Opcional si se implementa `audit_exports`.

Valores:

```text id="c1wo1n"
pending
processing
completed
failed
expired
archived
```

Prisma:

```prisma id="g4wdqu"
enum AuditExportStatus {
  PENDING    @map("pending")
  PROCESSING @map("processing")
  COMPLETED  @map("completed")
  FAILED     @map("failed")
  EXPIRED    @map("expired")
  ARCHIVED   @map("archived")

  @@map("audit_export_status")
}
```

---

## 7.7. `AuditScope`

Opcional si se implementa `audit_exports`.

Valores:

```text id="a9pgqa"
tenant
platform
resource
currentUser
```

Prisma:

```prisma id="krlizd"
enum AuditScope {
  TENANT       @map("tenant")
  PLATFORM     @map("platform")
  RESOURCE     @map("resource")
  CURRENT_USER @map("currentUser")

  @@map("audit_scope")
}
```

---

## 7.8. `resource_type` como string

Decisión recomendada:

```text id="o8afud"
Usar string para resource_type en MVP.
```

Motivo:

* muchos módulos agregarán recursos;
* evita migraciones por cada nuevo tipo;
* permite compatibilidad con specs futuras;
* se valida en aplicación mediante catálogo.

---

## 7.9. `action` como string

Decisión recomendada:

```text id="rnxgjz"
Usar string para action.
```

Motivo:

* el catálogo de acciones crecerá;
* facilita eventos de nuevos módulos;
* evita migraciones por cada acción;
* se valida por formato y catálogo lógico en aplicación.

---

# 8. Modelo Prisma propuesto — MVP

```prisma id="ozawtq"
enum AuditActorType {
  USER             @map("user")
  SYSTEM           @map("system")
  INTEGRATION      @map("integration")
  JOB              @map("job")
  WEBHOOK          @map("webhook")
  PLATFORM_SUPPORT @map("platformSupport")
  UNKNOWN          @map("unknown")

  @@map("audit_actor_type")
}

enum AuditCategory {
  PLATFORM           @map("platform")
  SECURITY           @map("security")
  ACCESS             @map("access")
  PERSONAL_DATA      @map("personalData")
  FINANCIAL          @map("financial")
  PAYMENTS           @map("payments")
  ACCOUNT_STATEMENTS @map("accountStatements")
  INTEGRATION        @map("integration")
  FILE               @map("file")
  EXPORT             @map("export")
  SYSTEM             @map("system")

  @@map("audit_category")
}

enum AuditSeverity {
  DEBUG    @map("debug")
  INFO     @map("info")
  NOTICE   @map("notice")
  WARNING  @map("warning")
  ERROR    @map("error")
  CRITICAL @map("critical")

  @@map("audit_severity")
}

enum AuditOutcome {
  SUCCESS @map("success")
  FAILURE @map("failure")
  DENIED  @map("denied")
  PARTIAL @map("partial")
  SKIPPED @map("skipped")

  @@map("audit_outcome")
}
```

```prisma id="ef4f3b"
model AuditLog {
  id                String         @id @default(uuid())

  tenantId          String?        @map("tenant_id")

  actorType         AuditActorType @default(UNKNOWN) @map("actor_type")
  actorUserId       String?        @map("actor_user_id")
  actorDisplayName  String?        @map("actor_display_name")
  actorMembershipId String?        @map("actor_membership_id")

  action            String
  category          AuditCategory
  severity          AuditSeverity  @default(INFO)
  outcome           AuditOutcome

  resourceType      String?        @map("resource_type")
  resourceId        String?        @map("resource_id")
  resourceDisplay   String?        @map("resource_display")

  oldValue          Json?          @map("old_value")
  newValue          Json?          @map("new_value")
  metadata          Json?

  reason            String?

  ipAddress         String?        @map("ip_address")
  userAgent         String?        @map("user_agent")

  requestId         String?        @map("request_id")
  correlationId     String?        @map("correlation_id")
  causationId       String?        @map("causation_id")
  traceId           String?        @map("trace_id")

  sourceModule      String?        @map("source_module")
  sourceVersion     String?        @map("source_version")

  occurredAt        DateTime       @default(now()) @map("occurred_at")
  createdAt         DateTime       @default(now()) @map("created_at")
  archivedAt        DateTime?      @map("archived_at")

  tenant            Tenant?        @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  actorUser         UserProfile?   @relation("AuditLogActorUser", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([actorUserId])
  @@index([actorType])
  @@index([action])
  @@index([category])
  @@index([severity])
  @@index([outcome])
  @@index([resourceType, resourceId])
  @@index([occurredAt])
  @@index([traceId])
  @@index([requestId])
  @@index([correlationId])
  @@index([tenantId, occurredAt])
  @@index([tenantId, resourceType, resourceId])
  @@index([tenantId, actorUserId])
  @@index([tenantId, category])
  @@index([tenantId, action])
  @@map("audit_logs")
}
```

---

# 9. Modelo Prisma opcional — `AuditExport`

Implementar solo si se decide materializar solicitudes de exportación.

```prisma id="je3hgj"
enum AuditExportFormat {
  JSON @map("json")
  CSV  @map("csv")

  @@map("audit_export_format")
}

enum AuditExportStatus {
  PENDING    @map("pending")
  PROCESSING @map("processing")
  COMPLETED  @map("completed")
  FAILED     @map("failed")
  EXPIRED    @map("expired")
  ARCHIVED   @map("archived")

  @@map("audit_export_status")
}

enum AuditScope {
  TENANT       @map("tenant")
  PLATFORM     @map("platform")
  RESOURCE     @map("resource")
  CURRENT_USER @map("currentUser")

  @@map("audit_scope")
}
```

```prisma id="kz8r2f"
model AuditExport {
  id           String            @id @default(uuid())
  tenantId     String?           @map("tenant_id")
  requestedBy  String            @map("requested_by")

  scope        AuditScope
  filters      Json?
  format       AuditExportFormat @default(JSON)
  status       AuditExportStatus @default(PENDING)

  fileId       String?           @map("file_id")
  rowCount     Int               @default(0) @map("row_count")

  requestedAt  DateTime          @default(now()) @map("requested_at")
  completedAt  DateTime?         @map("completed_at")
  expiresAt    DateTime?         @map("expires_at")

  createdAt    DateTime          @default(now()) @map("created_at")
  archivedAt   DateTime?         @map("archived_at")

  tenant       Tenant?           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  requestedByUser UserProfile    @relation("AuditExportRequestedBy", fields: [requestedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([requestedBy])
  @@index([scope])
  @@index([format])
  @@index([status])
  @@index([requestedAt])
  @@map("audit_exports")
}
```

---

# 10. Cambios requeridos en modelos existentes

## 10.1. Modelo `Tenant`

Agregar relaciones:

```prisma id="saav7x"
model Tenant {
  // campos existentes...

  auditLogs    AuditLog[]
  auditExports AuditExport[]
}
```

Si `AuditExport` se difiere:

```prisma id="hvxigs"
model Tenant {
  // campos existentes...

  auditLogs AuditLog[]
}
```

---

## 10.2. Modelo `UserProfile`

Agregar relaciones:

```prisma id="ah3vjd"
model UserProfile {
  // campos existentes...

  auditLogsAsActor AuditLog[] @relation("AuditLogActorUser")
  auditExportsRequested AuditExport[] @relation("AuditExportRequestedBy")
}
```

Si `AuditExport` se difiere:

```prisma id="a53mpc"
model UserProfile {
  // campos existentes...

  auditLogsAsActor AuditLog[] @relation("AuditLogActorUser")
}
```

---

# 11. Constraints SQL recomendadas

## 11.1. `action` no vacío

```sql id="dp3y58"
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_action_not_empty_check
CHECK (length(trim(action)) > 0);
```

---

## 11.2. `resource_type` y `resource_id` consistentes

```sql id="cx2j0w"
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_resource_pair_check
CHECK (
  (resource_type IS NULL AND resource_id IS NULL)
  OR (resource_type IS NOT NULL AND resource_id IS NOT NULL)
);
```

Nota:

```text id="up106i"
Si se permite resourceType sin resourceId para eventos agregados, esta constraint debe relajarse.
```

---

## 11.3. `actor_user_id` recomendado para actor user

```sql id="vx5n9s"
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_user_actor_has_user_id_check
CHECK (
  actor_type <> 'user'
  OR actor_user_id IS NOT NULL
);
```

Nota:

```text id="n2wnou"
Si existen eventos legacy o pre-auth con actor_type user sin actorUserId, esta constraint debe relajarse.
```

---

## 11.4. `tenant_id` requerido para categorías tenant-scoped

Constraint estricta recomendada solo si la taxonomía está cerrada:

```sql id="cltjkr"
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_tenant_required_for_tenant_categories_check
CHECK (
  category IN ('platform', 'security', 'system')
  OR tenant_id IS NOT NULL
);
```

Recomendación MVP:

```text id="s2xgax"
Validar esta regla en aplicación, no con SQL estricto, para evitar bloquear eventos legítimos pre-tenant.
```

---

## 11.5. `reason` no vacío si existe

```sql id="yugams"
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_reason_not_empty_if_present_check
CHECK (
  reason IS NULL OR length(trim(reason)) > 0
);
```

---

## 11.6. Longitud máxima de campos críticos

Aplicar en aplicación y, opcionalmente, en SQL:

```sql id="v0w2fk"
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_action_length_check
CHECK (length(action) <= 120);

ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_resource_type_length_check
CHECK (resource_type IS NULL OR length(resource_type) <= 80);
```

---

## 11.7. `row_count` no negativo en `audit_exports`

Si se implementa `audit_exports`:

```sql id="pzo3sn"
ALTER TABLE audit_exports
ADD CONSTRAINT audit_exports_row_count_non_negative_check
CHECK (row_count >= 0);
```

---

# 12. Reglas que deben validarse en aplicación

Las siguientes reglas no deben depender solo de base de datos:

```text id="kglv6w"
- tenantId obligatorio si scope = tenant.
- tenantId null permitido solo si scope = platform/pre-tenant.
- action debe pertenecer a formato válido.
- category debe ser coherente con action.
- severity debe ser coherente con action.
- outcome debe ser coherente con resultado real.
- oldValue/newValue deben estar sanitizados.
- metadata debe estar sanitizada.
- metadata debe respetar tamaño máximo.
- export filters deben estar sanitizados.
- actorDisplayName debe ser snapshot sanitizado.
- resourceDisplay debe ser snapshot sanitizado.
- ipAddress debe normalizarse.
- userAgent debe truncarse.
- no almacenar payload completo.
- no almacenar tokens.
- no almacenar secrets.
- no almacenar comprobantes.
- no almacenar export completo.
```

---

# 13. Reglas de sanitización

## 13.1. Campos sensibles por nombre

Redactar cualquier clave que coincida con:

```text id="d7zrb8"
password
passwordHash
hash
accessToken
refreshToken
idToken
authorization
cookie
secret
clientSecret
apiKey
privateKey
publicKey si se considera sensible en contexto
cardNumber
cvv
cvc
bankAccountNumber
bankAccount
iban
routingNumber
fileContent
receiptContent
documentContent
rawBody
payload
```

Valor persistido:

```text id="vtydkg"
[REDACTED]
```

---

## 13.2. Campos permitidos en oldValue/newValue

Permitidos:

```text id="wf3h74"
status
roleIds
permissionIds
amount
currency
propertyUnitId
billingPeriodId
paymentId
chargeId
statementId
method
reason
configurationKey
enabled
disabled
count
```

---

## 13.3. Sanitización de metadata

Metadata puede incluir:

```text id="ytkntc"
sourceModule
operationMode
batchId
totalCount
successCount
failureCount
skippedCount
errorCode
format
rowCount
resourceCount
```

Metadata no debe incluir:

```text id="z0wgkr"
request body completo
response body completo
archivo completo
CSV completo
JSON exportado completo
datos personales innecesarios
tokens
secrets
comprobantes
```

---

## 13.4. Límite de tamaño

Recomendación MVP:

```text id="dbvbes"
oldValue <= 16 KB serializado
newValue <= 16 KB serializado
metadata <= 16 KB serializado
```

Si excede:

```text id="s5cqis"
truncar de forma segura o rechazar según criticidad
registrar metadata._truncated = true
```

---

## 13.5. Profundidad máxima JSON

Recomendación MVP:

```text id="spg71v"
maxDepth = 5
```

Si excede:

```text id="xugl4n"
reemplazar subárbol profundo por [TRUNCATED]
```

---

# 14. Reglas de exportación

## 14.1. Exportación MVP

Formatos:

```text id="oz0alu"
json
csv
```

---

## 14.2. Datos permitidos en export tenant

Depende de permisos.

Base:

```text id="m2jbwl"
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
reason
traceId
occurredAt
createdAt
```

Con permiso sensible:

```text id="fyjwuz"
oldValue
newValue
metadata
ipAddress
userAgent
correlationId
causationId
requestId
```

---

## 14.3. CSV injection protection

Neutralizar valores que empiecen por:

```text id="z2jimn"
=
+
-
@
```

Estrategia:

```text id="lh9799"
Prefijar con apóstrofe o escapar según librería CSV aprobada.
```

---

## 14.4. Exportación no persistente

Si no se implementa `audit_exports`, la exportación se genera bajo demanda y se audita con:

```text id="xuu43x"
action = audit.exported
resourceType = export
```

---

# 15. Reglas de retención

## 15.1. MVP

```text id="o31fsy"
No purgar audit_logs automáticamente.
```

---

## 15.2. Futuro

La retención futura podrá incluir:

* política por tenant;
* retención legal mínima;
* legal hold;
* archivado frío;
* exportación regulatoria;
* eliminación controlada bajo base legal;
* anonimización parcial.

---

## 15.3. `archived_at`

`archived_at` se reserva para archivado lógico futuro.

MVP:

```text id="iprxk5"
archived_at debe permanecer null en operación normal.
```

---

# 16. Reglas de integridad

## 16.1. Append-only por aplicación

No implementar métodos ordinarios:

```text id="joa3hl"
updateAuditLog()
deleteAuditLog()
truncateAuditLogs()
```

---

## 16.2. No cascade delete

Todas las relaciones deben usar:

```text id="mtqlv1"
onDelete: Restrict
```

---

## 16.3. FK polimórfica

`resource_type + resource_id` es referencia polimórfica lógica.

Prisma/PostgreSQL no forzará FK hacia todos los recursos.

La integridad se valida mediante:

```text id="tpjc5e"
TenantResourceResolverPort
tests de integración
políticas de consulta
contratos de eventos
```

---

## 16.4. Hash encadenado

Diferido.

Campo futuro posible:

```text id="nqsf66"
event_hash
previous_event_hash
```

No incluir en MVP salvo decisión explícita.

---

# 17. Catálogo inicial de acciones

## 17.1. Tenants

```text id="uotdqq"
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

---

## 17.2. Access

```text id="h84tba"
user.created
user.updated
user.enabled
user.disabled
role.created
role.updated
role.archived
role.assigned
role.removed
permission.granted
permission.revoked
membership.created
membership.suspended
membership.reactivated
membership.revoked
invitation.created
invitation.accepted
invitation.revoked
invitation.expired
```

---

## 17.3. Residents and Properties

```text id="wa8g14"
person.created
person.updated
person.archived
legalEntity.created
legalEntity.updated
propertyUnit.created
propertyUnit.updated
propertyUnit.archived
ownership.created
ownership.ended
residency.created
residency.ended
lease.created
lease.ended
vehicle.created
vehicle.updated
vehicle.archived
pet.created
pet.updated
pet.archived
emergencyContact.created
emergencyContact.updated
```

---

## 17.4. Dues and Fees

```text id="uwi14j"
chargeConcept.created
chargeConcept.updated
chargeConcept.archived
feeSchedule.created
feeSchedule.updated
feeSchedule.archived
unitFee.assigned
unitFee.ended
billingPeriod.created
billingPeriod.closed
billingPeriod.locked
charges.generated
charge.created
charge.cancelled
charge.reversed
charge.adjusted
```

---

## 17.5. Payments

```text id="z04hkr"
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

---

## 17.6. Account Statements

```text id="ygvzj5"
accountStatement.generated
accountStatement.batchGenerated
accountStatement.published
accountStatement.closed
accountStatement.locked
accountStatement.regenerated
accountStatement.superseded
accountStatement.exported
accountStatement.viewedSensitive
balance.calculated
balance.recalculated
balance.snapshotCreated
financialMovements.viewed
```

---

## 17.7. Security

```text id="a1ygtx"
auth.login.success
auth.login.failure
auth.logout
auth.password.changed
auth.mfa.enabled
auth.mfa.disabled
access.denied
permission.denied
crossTenant.accessDenied
```

---

## 17.8. Audit

```text id="bp1cvy"
audit.queried
audit.queriedSensitive
audit.exported
audit.platformQueried
audit.platformExported
audit.accessDenied
```

---

## 17.9. Integrations

```text id="a384fb"
integration.webhook.received
integration.webhook.verified
integration.webhook.rejected
integration.apiToken.created
integration.apiToken.revoked
integration.n8n.workflowTriggered
integration.externalRequest.sent
integration.externalRequest.failed
```

---

# 18. Mapeo acción → categoría/severidad sugerida

| Acción                         | Categoría         | Severidad |
| ------------------------------ | ----------------- | --------- |
| `tenant.created`               | platform          | notice    |
| `tenant.suspended`             | platform          | warning   |
| `user.disabled`                | access            | warning   |
| `role.assigned`                | access            | warning   |
| `permission.granted`           | access            | warning   |
| `crossTenant.accessDenied`     | security          | critical  |
| `access.denied`                | security          | warning   |
| `charge.created`               | financial         | notice    |
| `charge.reversed`              | financial         | warning   |
| `payment.confirmed`            | payments          | notice    |
| `payment.rejected`             | payments          | warning   |
| `payment.reversed`             | payments          | warning   |
| `paymentReceipt.downloaded`    | payments          | notice    |
| `accountStatement.generated`   | accountStatements | notice    |
| `accountStatement.regenerated` | accountStatements | warning   |
| `accountStatement.exported`    | accountStatements | notice    |
| `audit.exported`               | export            | warning   |
| `audit.accessDenied`           | security          | warning   |

---

# 19. Queries esperadas

## 19.1. Listar auditoría tenant

```text id="l1izfy"
listTenantAuditLogs(tenantId, query)
```

Filtros:

```text id="bmhhg2"
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
```

---

## 19.2. Detalle tenant

```text id="qcwcq2"
findTenantAuditLogById(tenantId, auditLogId)
```

---

## 19.3. Auditoría por recurso

```text id="cup5mn"
listResourceAuditLogs(tenantId, resourceType, resourceId, query)
```

---

## 19.4. Auditoría platform

```text id="gsf65h"
listPlatformAuditLogs(query)
```

Filtros adicionales:

```text id="vyckg9"
tenantId
tenantSlug
includePlatformEvents
```

---

## 19.5. Exportación tenant

```text id="hr6qz7"
exportTenantAuditLogs(tenantId, query, format)
```

---

## 19.6. Exportación platform

```text id="ckn305"
exportPlatformAuditLogs(query, format)
```

---

# 20. Paginación y ordenamiento

## 20.1. Paginación

Valores:

```text id="v5oyz8"
page default 1
pageSize default 20
pageSize max 100
```

---

## 20.2. Ordenamiento

Campos permitidos:

```text id="oj0fdx"
occurredAt
createdAt
action
category
severity
outcome
actorType
resourceType
```

Default:

```text id="um5pge"
sortBy = occurredAt
sortOrder = desc
```

No permitir sort arbitrario.

---

# 21. Performance esperada

MVP recomendado:

```text id="po6yzy"
hasta 1 millón de eventos por despliegue inicial antes de optimizaciones avanzadas
```

Optimizaciones iniciales:

* índices por tenant;
* índices por fecha;
* índices por recurso;
* índices por actor;
* paginación obligatoria;
* pageSize máximo 100;
* exportación limitada.

No se implementa particionamiento en MVP.

Futuro:

* particionamiento por fecha;
* particionamiento por tenant;
* almacenamiento frío;
* replica de lectura;
* SIEM;
* índice GIN selectivo;
* retención avanzada.

---

# 22. Seguridad del modelo

## 22.1. Cross-tenant

Mitigación:

```text id="xe5egl"
tenant_id indexado
queries tenant-scoped
TenantGuard
TenantPermissionGuard
AuditPermissionPolicyService
tests multitenant
```

---

## 22.2. Secretos

Mitigación:

```text id="zn5t8m"
AuditSanitizerService
AuditMetadataValidatorService
redaction
tests de sanitización
```

---

## 22.3. Manipulación

Mitigación MVP:

```text id="do28yd"
no update API
no delete API
append-only application service
onDelete Restrict
authorization estricta
```

---

## 22.4. Exportación

Mitigación:

```text id="ahjgy6"
audit.export permission
CSV injection protection
export audit
rate limiting
max rows
sanitización
```

---

# 23. Migración inicial

## 23.1. Nombre sugerido

```text id="i2rcxg"
007_create_audit_logs
```

---

## 23.2. Orden de creación

```text id="d0jmbo"
1. Enums
2. audit_logs
3. indexes
4. constraints
5. audit_exports opcional
6. Prisma Client
```

---

## 23.3. Revisión manual

Antes de aplicar:

```text id="ykllx8"
[ ] Enums creados.
[ ] audit_logs creada.
[ ] action not null.
[ ] category not null.
[ ] severity not null.
[ ] outcome not null.
[ ] occurred_at not null.
[ ] JSONB para old_value/new_value/metadata.
[ ] tenant_id nullable con validación en aplicación.
[ ] FK tenant onDelete Restrict.
[ ] FK actorUser onDelete Restrict.
[ ] índices por tenant.
[ ] índices por resource.
[ ] índices por actor.
[ ] índices por fecha.
[ ] índices por traceId.
[ ] no cascade delete peligroso.
[ ] constraints de action no vacío.
[ ] constraints de reason si existe.
[ ] audit_exports diferida o creada conscientemente.
```

---

# 24. Seeds iniciales

## 24.1. Eventos demo

Crear eventos ficticios:

```text id="ppn5iy"
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

---

## 24.2. Reglas

* Seeds idempotentes.
* Usan tenants demo.
* Usan usuarios demo.
* Usan recursos demo.
* No usan datos reales.
* No contienen tokens.
* No contienen passwords.
* No contienen comprobantes.
* No contienen payloads completos.

---

## 24.3. Ejemplo seed

```json id="kqrl1r"
{
  "tenantId": "tenant_demo_uuid",
  "actorType": "user",
  "actorUserId": "user_demo_uuid",
  "action": "payment.confirmed",
  "category": "payments",
  "severity": "notice",
  "outcome": "success",
  "resourceType": "payment",
  "resourceId": "payment_demo_uuid",
  "oldValue": {
    "status": "pendingValidation"
  },
  "newValue": {
    "status": "confirmed"
  },
  "metadata": {
    "amount": "100.00",
    "currency": "USD"
  },
  "traceId": "seed_trace_payment_confirmed",
  "occurredAt": "2026-07-14T10:00:00Z"
}
```

---

# 25. Datos prohibidos en seeds

No usar:

```text id="yk1hiy"
datos reales de propietarios
datos reales de residentes
contraseñas
hashes reales
tokens
headers reales
cookies reales
comprobantes reales
documentos reales
referencias bancarias reales
payloads reales
exports reales
```

---

# 26. Reglas de consulta por permisos

## 26.1. `audit.read`

Permite ver eventos generales del tenant.

No necesariamente permite:

```text id="km60l0"
financial
payments
accountStatements
access
security
personalData
```

según política.

---

## 26.2. `audit.readFinancial`

Permite categorías:

```text id="n8e5tm"
financial
payments
accountStatements
```

---

## 26.3. `audit.readAccess`

Permite categoría:

```text id="nl7v7e"
access
```

---

## 26.4. `audit.readSecurity`

Permite categoría:

```text id="qpr8um"
security
```

---

## 26.5. `audit.readPersonalData`

Permite categoría:

```text id="jaugqa"
personalData
```

---

## 26.6. `audit.export`

Permite exportación tenant, respetando categorías visibles.

---

## 26.7. `audit.platform.read`

Permite eventos platform.

Para ver eventos tenant desde platform puede requerirse:

```text id="c9hoyq"
audit.platform.readSensitive
```

---

# 27. Reglas para módulos productores

Todo módulo que registre auditoría debe enviar:

```text id="vko3p0"
tenantId cuando aplique
actor
action
category
severity
outcome
resourceType/resourceId cuando aplique
oldValue/newValue si aplica
metadata mínima
reason si aplica
traceId si aplica
```

No debe enviar:

```text id="c5srwr"
payload completo
request completo
response completo
comprobantes
tokens
secrets
```

Si el módulo productor envía datos sensibles, `AuditSanitizerService` debe redactarlos.

---

# 28. Reglas para fallos de escritura

## 28.1. Operaciones críticas

Para operaciones críticas financieras o de acceso, se recomienda:

```text id="z5v3cm"
writeCritical()
```

Si falla la auditoría, la operación puede fallar según política.

Ejemplos:

```text id="z2nojy"
payment.reversed
charge.reversed
accountStatement.regenerated
permission.granted
role.assigned
tenant.suspended
```

---

## 28.2. Operaciones no críticas

Para eventos informativos, se permite:

```text id="ez6ndy"
writeBestEffort()
```

Si falla, registrar log técnico y métrica, pero no necesariamente fallar operación principal.

---

## 28.3. Política MVP recomendada

```text id="qg7sq3"
Operaciones financieras críticas y cambios de acceso deben usar writeCritical.
Operaciones de consulta sensible, descarga y exportación pueden usar writeCritical si son requisito de cumplimiento.
Eventos informativos pueden usar writeBestEffort.
```

---

# 29. Compatibilidad con módulos futuros

Este modelo habilita:

```text id="nss1ux"
00X-security-monitoring
00X-compliance-reports
00X-n8n-automations
00X-bank-reconciliation
00X-payment-gateway
00X-statement-documents
00X-incident-management
00X-data-retention
```

Uso futuro:

| Módulo futuro       | Uso de auditoría            |
| ------------------- | --------------------------- |
| Security Monitoring | eventos security/access     |
| Compliance Reports  | consultas/export            |
| n8n Automations     | eventos integración/webhook |
| Bank Reconciliation | matching/reversos           |
| Payment Gateway     | transacciones externas      |
| Statement Documents | generación/descarga de PDF  |
| Incident Management | investigación               |
| Data Retention      | retención/legal hold        |

---

# 30. Campos diferidos

No incluir todavía en MVP:

```text id="fivbch"
eventHash
previousEventHash
signature
signatureAlgorithm
wormStorageId
siemEventId
legalHoldId
retentionPolicyId
retentionExpiresAt
anomalyScore
riskScore
geoLocation
deviceFingerprint
sessionId avanzado
```

Razón:

* requieren especificaciones de seguridad avanzadas;
* requieren decisiones de infraestructura;
* pueden agregar costo y complejidad;
* deben implementarse con diseño específico.

---

# 31. Uso de JSONB

## 31.1. Permitido

```text id="vdyffu"
old_value sanitizado
new_value sanitizado
metadata sanitizada
filters sanitizados si audit_exports se implementa
```

---

## 31.2. Prohibido

```text id="h2w80d"
payload completo
request completo
response completo
archivo completo
comprobante completo
CSV completo
JSON exportado completo
tokens
secretos
contraseñas
datos bancarios completos
```

---

## 31.3. Reglas

* JSONB debe ser sanitizado.
* JSONB debe tener tamaño máximo.
* JSONB debe tener profundidad máxima.
* JSONB debe evitar datos personales innecesarios.
* JSONB no debe usarse como almacenamiento documental.

---

# 32. Checklist de migración

```text id="a3btcd"
[ ] Enums AuditActorType, AuditCategory, AuditSeverity, AuditOutcome creados.
[ ] Tabla audit_logs creada.
[ ] id UUID primary key.
[ ] tenant_id nullable.
[ ] actor_type obligatorio.
[ ] action obligatorio.
[ ] category obligatorio.
[ ] severity obligatorio.
[ ] outcome obligatorio.
[ ] occurred_at obligatorio.
[ ] created_at obligatorio.
[ ] old_value JSONB.
[ ] new_value JSONB.
[ ] metadata JSONB.
[ ] FK tenant onDelete Restrict.
[ ] FK actorUser onDelete Restrict.
[ ] Índice tenant_id.
[ ] Índice actor_user_id.
[ ] Índice action.
[ ] Índice category.
[ ] Índice severity.
[ ] Índice outcome.
[ ] Índice resource_type/resource_id.
[ ] Índice occurred_at.
[ ] Índice trace_id.
[ ] Índice request_id.
[ ] Índice correlation_id.
[ ] Índice tenant_id/occurred_at.
[ ] Índice tenant_id/resource_type/resource_id.
[ ] Índice tenant_id/actor_user_id.
[ ] Constraint action no vacío.
[ ] Constraint reason no vacío si existe.
[ ] No cascade delete peligroso.
[ ] audit_exports creada o diferida explícitamente.
[ ] Prisma Client generado.
[ ] Seeds ficticios creados.
```

---

# 33. Tests de modelo requeridos

## 33.1. Unitarios

* AuditAction.
* AuditCategory.
* AuditSeverity.
* AuditOutcome.
* AuditActorType.
* AuditMetadata.
* AuditEventBuilder.
* AuditSanitizer.
* AuditMetadataValidator.

---

## 33.2. Integración

* Crear AuditLog.
* Crear evento tenant-scoped.
* Crear evento platform-level.
* Buscar por tenant.
* Buscar por recurso.
* Buscar por actor.
* Buscar por traceId.
* Filtros.
* Paginación.
* Sanitización persistida.
* No update/delete por repositorio público.
* Seeds.

---

## 33.3. Seguridad

* Tokens redactados.
* Passwords redactados.
* Authorization header redactado.
* Payload completo bloqueado/truncado.
* Export CSV sanitizado.
* Tenant A no ve Tenant B.
* Platform requiere permiso.

---

# 34. Decisión final del modelo

El módulo `007-audit` usará como tabla principal:

```text id="ht2aae"
audit_logs
```

La tabla:

```text id="itt0cf"
audit_exports
```

queda opcional para MVP.

El modelo se basa en:

```text id="r0tva1"
append-only
tenant_id nullable solo para platform/pre-tenant
actor_type obligatorio
action obligatorio
category obligatoria
severity obligatoria
outcome obligatorio
resource_type/resource_id cuando aplique
old_value/new_value/metadata JSONB sanitizados
trace_id/request_id/correlation_id cuando existan
onDelete Restrict
sin update/delete ordinario
sin secretos
sin payloads completos
```

La implementación inicial debe priorizar:

```text id="xvvr9f"
trazabilidad funcional
seguridad de datos
aislamiento multitenant
sanitización
consulta controlada
exportación controlada
cobertura financiera
cobertura de acceso
compatibilidad con cumplimiento futuro
```

El modelo no debe aceptarse si permite mezclar eventos entre tenants, almacenar secretos, almacenar payloads completos, omitir actor/action/outcome, permitir exportaciones sin auditoría o modificar/eliminar eventos por API ordinaria.
