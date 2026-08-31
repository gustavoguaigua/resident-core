# Spec 007 — Audit, Traceability and Compliance Events

> Extensión Sprint 3: GAP-S3-007 está cerrado por
> `docs/changes/GAP-S3-007-PERMISSIONS-AUDIT-CATALOG-2026-08-30.md`. Conserva el único
> `AuditLog` append-only y no habilita consulta, exportación o reporting.

> **Slice canónico de Sprint 2:**
> `docs/changes/GAP-S2-007-AUDIT-BASE-SEMANTICS-2026-08-13.md` autoriza únicamente
> escritura durable, sanitizada, transaccional y append-only para el catálogo de Specs
> 001/002. El modelo, enums, eventos y causalidad de ese contrato superseden para este
> sprint las alternativas del documento completo; consultas, exportaciones y dominios
> posteriores permanecen diferidos.

## 1. Información del documento

| Campo           | Valor                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                  |
| Spec ID         | 007                                                                                                                                                            |
| Módulo          | Audit                                                                                                                                                          |
| Documento       | Functional Specification                                                                                                                                       |
| Ruta            | `docs/specs/007-audit/spec.md`                                                                                                                                 |
| Versión         | 0.1                                                                                                                                                            |
| Estado          | accepted                                                                                                                                                   |
| Fecha           | 2026-07-14                                                                                                                                                     |
| Prioridad       | Alta                                                                                                                                                           |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`                                        |
| Relacionado con | `constitution.md`, `domain-map.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-003`, `ADR-004`, `ADR-007`, `ADR-010`, `ADR-011`, `ADR-012` |

---

## 2. Propósito

El módulo `007-audit` define cómo RESIDENT Core registrará, consultará, protegerá y gobernará la trazabilidad de acciones críticas dentro del sistema.

Este módulo debe permitir responder preguntas como:

* ¿Quién creó un tenant?
* ¿Quién cambió un rol?
* ¿Quién modificó una unidad?
* ¿Quién generó cargos?
* ¿Quién confirmó un pago?
* ¿Quién rechazó un comprobante?
* ¿Quién asignó un pago a un cargo?
* ¿Quién reversó una asignación?
* ¿Quién generó un estado de cuenta?
* ¿Quién publicó un estado de cuenta?
* ¿Quién exportó información financiera?
* ¿Desde qué tenant ocurrió la acción?
* ¿Cuándo ocurrió?
* ¿Cuál fue el resultado?
* ¿Qué recurso fue afectado?
* ¿Cuál era el valor anterior y el nuevo valor cuando aplique?
* ¿Cuál fue el `traceId` de la operación?

Regla central:

```text id="peio8e"
Toda operación crítica de RESIDENT Core debe dejar una evidencia auditable, tenant-scoped, trazable, protegida contra manipulación y consultable bajo permisos estrictos.
```

---

## 3. Objetivo funcional

Permitir que RESIDENT Core registre eventos de auditoría para operaciones críticas de negocio, seguridad, acceso, configuración, datos personales y finanzas.

El módulo debe permitir:

* registrar eventos auditables;
* asociar eventos a tenant;
* asociar eventos a actor;
* asociar eventos a recurso;
* registrar resultado de la operación;
* registrar fecha/hora;
* registrar `traceId`;
* registrar `correlationId`;
* registrar `requestId`;
* registrar metadata mínima;
* registrar cambios de valores cuando aplique;
* consultar auditoría administrativa;
* consultar auditoría por tenant;
* consultar auditoría por recurso;
* consultar auditoría por actor;
* consultar auditoría por acción;
* consultar auditoría por rango de fechas;
* exportar auditoría bajo permisos estrictos;
* proteger auditoría contra modificación ordinaria;
* evitar datos sensibles innecesarios;
* preparar soporte para cumplimiento, investigaciones y reportes futuros.

---

## 4. Alcance

### 4.1. Incluido en esta spec

Esta spec incluye:

* `AuditLog`;
* `AuditEvent`;
* `AuditEventType`;
* `AuditResourceType`;
* `AuditSeverity`;
* `AuditOutcome`;
* `AuditActor`;
* `AuditContext`;
* `AuditMetadata`;
* registro de auditoría desde módulos existentes;
* consulta administrativa por tenant;
* consulta platform-level para soporte autorizado;
* filtros;
* paginación;
* exportación básica;
* retención inicial;
* integridad básica;
* sanitización;
* eventos internos;
* API REST;
* pruebas esperadas.

---

### 4.2. No incluido en esta spec

No incluye todavía:

* SIEM externo;
* WORM storage;
* firma criptográfica avanzada;
* blockchain;
* retención legal avanzada;
* legal hold;
* machine learning para anomalías;
* detección automática de fraude;
* alertas automáticas;
* dashboards avanzados de compliance;
* integración con herramientas GRC;
* exportación masiva regulatoria avanzada;
* anonimización irreversible automatizada;
* gestión completa de incidentes;
* correlación avanzada multi-servicio;
* outbox transaccional completo si se decide dejarlo para specs posteriores.

Estos temas podrán tratarse en specs futuras.

---

## 5. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="x8umci"
Audit and Compliance
```

Es transversal a:

```text id="o6r4eb"
Platform Management
Tenant Management
Identity and Access
Residents and Properties
Financial Management
Payments and Reconciliation
Account Statements
External Integrations
Reporting and Analytics
```

Depende de:

```text id="w9sknl"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
```

porque debe registrar eventos originados en esos módulos.

---

## 6. Principios de auditoría

### 6.1. Auditoría como evidencia

La auditoría no es un log técnico ordinario.

Regla:

```text id="h9qjpl"
AuditLog representa evidencia funcional y de seguridad sobre una acción relevante del sistema.
```

---

### 6.2. Tenant-scoped por defecto

Todo evento de auditoría operativo debe estar asociado a un tenant.

Excepción:

```text id="zpny0c"
Eventos platform-level pueden tener tenantId null solo cuando la acción realmente no pertenece a un tenant específico.
```

Ejemplos platform-level:

* creación inicial de tenant;
* suspensión global de tenant;
* acción de soporte platform;
* configuración global;
* fallo de autenticación antes de seleccionar tenant.

---

### 6.3. Actor identificable

Todo evento debe registrar actor cuando sea posible.

Actores posibles:

```text id="el8k1t"
user
system
integration
job
webhook
platformSupport
unknown
```

---

### 6.4. Recurso identificado

Todo evento debe indicar qué recurso fue afectado.

Ejemplos:

```text id="x003nr"
tenant
userProfile
role
permission
propertyUnit
person
charge
payment
paymentReceipt
paymentAllocation
accountStatement
unitBalance
file
apiToken
integration
```

---

### 6.5. Resultado explícito

Todo evento debe registrar resultado:

```text id="kvqltj"
success
failure
denied
partial
skipped
```

---

### 6.6. Sanitización obligatoria

La auditoría debe registrar información suficiente, pero no debe convertirse en un repositorio de datos sensibles.

Prohibido almacenar en auditoría:

```text id="xvnfu0"
access tokens
refresh tokens
passwords
authorization headers
cookies completas
comprobantes completos
archivos completos
payload financiero completo
datos bancarios completos
secretos
stack traces completos
```

---

### 6.7. No modificación ordinaria

Los registros de auditoría no deben modificarse ni eliminarse ordinariamente.

Regla:

```text id="i846cp"
AuditLog es append-only en operación normal.
```

---

### 6.8. Trazabilidad técnica y funcional

Todo evento debe incluir identificadores técnicos de trazabilidad:

```text id="v0rnqm"
traceId
requestId
correlationId
causationId
```

cuando estén disponibles.

---

## 7. Actores

### 7.1. PlatformAdmin

Puede:

* consultar auditoría platform-level;
* consultar auditoría de tenants bajo permisos estrictos;
* investigar incidentes;
* exportar auditoría si tiene permiso;
* revisar acciones críticas globales.

No debe consultar auditoría financiera de tenants sin justificación operacional.

---

### 7.2. TenantAdmin

Puede:

* consultar auditoría de su tenant;
* filtrar por usuario, recurso, acción y fecha;
* revisar cambios administrativos;
* revisar cambios financieros si tiene permiso;
* exportar auditoría del tenant si tiene permiso.

---

### 7.3. Treasurer

Puede consultar auditoría financiera relacionada con:

* cargos;
* pagos;
* comprobantes;
* asignaciones;
* reversos;
* estados de cuenta;
* balances;

según permisos.

---

### 7.4. TenantAuditor

Puede consultar auditoría del tenant bajo permisos de solo lectura.

No debe modificar ni generar eventos manuales.

---

### 7.5. BoardMember

Puede consultar auditoría limitada si el tenant lo permite.

---

### 7.6. PropertyOwner / Resident

No tiene acceso ordinario a auditoría interna.

Puede recibir información derivada de auditoría en funcionalidades futuras, por ejemplo:

* historial propio de pagos reportados;
* historial de descargas propias;
* estado de solicitudes.

Pero no consulta `AuditLog` directamente en MVP.

---

### 7.7. System Job

Actor automático para tareas programadas.

Ejemplos:

* generación mensual de cargos;
* recálculo de balances;
* jobs de mantenimiento;
* expiración de invitaciones.

---

### 7.8. Integration / Webhook

Actor externo autorizado.

Ejemplos futuros:

* n8n;
* pasarela de pagos;
* conciliación bancaria;
* servicios de notificación.

---

## 8. Definiciones

### 8.1. AuditLog

Registro persistente de un evento auditable.

Representa:

```text id="n88z5r"
actor + action + resource + outcome + context + timestamp
```

---

### 8.2. Audit Event

Acción relevante que debe registrarse.

Ejemplo:

```text id="agjlqk"
payment.confirmed
```

---

### 8.3. Actor

Entidad que ejecuta o dispara una acción.

Puede ser:

* usuario autenticado;
* sistema;
* job;
* integración;
* webhook;
* soporte platform.

---

### 8.4. Resource

Entidad sobre la cual se ejecuta la acción.

Ejemplo:

```text id="svk8fi"
resourceType = payment
resourceId = payment_uuid
```

---

### 8.5. Outcome

Resultado de la acción.

Valores:

```text id="zxckjm"
success
failure
denied
partial
skipped
```

---

### 8.6. TraceId

Identificador técnico que permite correlacionar logs, errores, métricas y auditoría.

---

### 8.7. CorrelationId

Identificador para agrupar varias operaciones relacionadas.

Ejemplo:

```text id="y6o4yc"
generate monthly charges batch
```

---

### 8.8. CausationId

Identificador del evento o acción que causó otro evento.

Ejemplo:

```text id="y0v7od"
payment.confirmed causa payment.allocated
```

---

### 8.9. Old Value / New Value

Representación sanitizada de cambio de estado o valores relevantes.

Ejemplo:

```json id="zfxirx"
{
  "oldValue": {
    "status": "pendingValidation"
  },
  "newValue": {
    "status": "confirmed"
  }
}
```

---

## 9. Supuestos

1. Los módulos `001` a `006` ya definen eventos auditables mínimos.
2. Todo usuario autenticado tiene `UserProfile`.
3. Todo tenant operativo tiene `tenantId`.
4. La auditoría será almacenada inicialmente en PostgreSQL.
5. La auditoría será append-only en operación normal.
6. Los eventos deben ser sanitizados antes de persistirse.
7. La auditoría no reemplaza logs técnicos.
8. Los logs técnicos no reemplazan auditoría funcional.
9. La auditoría no almacena archivos ni comprobantes completos.
10. La auditoría puede almacenar referencias a recursos.
11. La auditoría debe soportar consultas paginadas.
12. La auditoría debe soportar exportación básica.
13. La auditoría debe ser protegida con permisos estrictos.
14. La auditoría debe registrar operaciones exitosas y denegadas cuando sean relevantes.
15. La auditoría debe registrar fallas críticas cuando sea seguro hacerlo.
16. La auditoría debe integrarse progresivamente con todos los módulos.

---

## 10. Reglas de negocio

### BR-001 — Todo evento auditable debe tener acción

Todo `AuditLog` debe tener `action`.

Ejemplo:

```text id="h5hjv9"
payment.confirmed
```

---

### BR-002 — Todo evento debe tener resultado

Todo `AuditLog` debe registrar `outcome`.

---

### BR-003 — Todo evento operativo debe tener tenant

Si la acción ocurre dentro de un tenant, `tenantId` es obligatorio.

---

### BR-004 — Eventos platform-level pueden no tener tenant

Solo se permite `tenantId = null` si la acción no pertenece a un tenant.

---

### BR-005 — Todo evento debe tener actor cuando sea posible

Si no hay usuario autenticado, registrar actor system/integration/unknown según corresponda.

---

### BR-006 — Todo evento debe tener recurso cuando aplique

Si la acción afecta un recurso, debe registrar `resourceType` y `resourceId`.

---

### BR-007 — Auditoría append-only

No se permite actualización ordinaria de eventos.

---

### BR-008 — No eliminación física ordinaria

No se permite borrar eventos de auditoría desde API ordinaria.

---

### BR-009 — Datos sensibles deben sanitizarse

No guardar tokens, passwords, secretos, archivos ni payloads completos.

---

### BR-010 — Cambios financieros deben auditarse siempre

Debe auditarse toda operación financiera crítica.

---

### BR-011 — Cambios de permisos deben auditarse siempre

Debe auditarse todo cambio de roles, permisos y membresías.

---

### BR-012 — Accesos denegados críticos deben auditarse

Deben auditarse intentos denegados relevantes, especialmente:

* cross-tenant;
* exportación sin permiso;
* reverso financiero sin permiso;
* acceso own a recurso ajeno;
* modificación de permisos sin autorización.

---

### BR-013 — Exportaciones deben auditarse

Toda exportación de auditoría, estados financieros o información sensible debe auditarse.

---

### BR-014 — Auditoría consultable solo con permiso

La consulta de auditoría requiere permisos explícitos.

---

### BR-015 — Auditoría financiera puede requerir permiso adicional

No todo lector de auditoría puede consultar eventos financieros sensibles.

---

### BR-016 — Auditoría no debe exponer datos de otros tenants

TenantAdmin solo consulta auditoría de su tenant.

---

### BR-017 — Eventos deben tener timestamps confiables

Usar fecha/hora del servidor en UTC.

---

### BR-018 — `traceId` obligatorio cuando exista request HTTP

Todo evento originado en request HTTP debe tener `traceId`.

---

### BR-019 — Batch operations deben registrar resumen

Las operaciones batch deben registrar conteos:

```text id="bkw0mc"
total
successCount
failureCount
skippedCount
partialCount
```

cuando aplique.

---

### BR-020 — Auditoría no reemplaza event bus

El `AuditLog` registra evidencia. No debe usarse como cola de eventos operativa principal.

---

## 11. Categorías de auditoría

### 11.1. Platform Audit

Eventos de plataforma:

```text id="ymyedl"
tenant.created
tenant.activated
tenant.suspended
tenant.reactivated
tenant.archived
platform.user.created
platform.user.disabled
platform.support.accessedTenant
```

---

### 11.2. Security Audit

Eventos de seguridad:

```text id="zubip8"
auth.login.success
auth.login.failure
auth.logout
auth.password.changed
auth.mfa.enabled
auth.mfa.disabled
access.denied
crossTenant.accessDenied
permission.denied
```

---

### 11.3. Identity and Access Audit

Eventos de roles y usuarios:

```text id="kmduwm"
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

---

### 11.4. Residents and Properties Audit

Eventos de residentes y unidades:

```text id="vy23gk"
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
vehicle.created
vehicle.updated
pet.created
emergencyContact.created
```

---

### 11.5. Dues and Fees Audit

Eventos de cargos:

```text id="sgw2hj"
chargeConcept.created
chargeConcept.updated
feeSchedule.created
unitFee.assigned
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

### 11.6. Payments Audit

Eventos de pagos:

```text id="qr8xnk"
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

### 11.7. Account Statements Audit

Eventos de estados de cuenta:

```text id="it8dr6"
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

### 11.8. Integration Audit

Eventos de integración:

```text id="fkm7d9"
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

### 11.9. File Audit

Eventos de archivos:

```text id="e4hc6y"
file.uploaded
file.downloaded
file.deletedLogically
file.accessDenied
file.scan.failed
```

---

### 11.10. Export Audit

Eventos de exportación:

```text id="r7nxh9"
audit.exported
payments.exported
accountStatements.exported
residents.exported
financialReport.exported
```

---

## 12. Severidad

### 12.1. AuditSeverity

Valores:

```text id="li664j"
debug
info
notice
warning
error
critical
```

Uso recomendado:

| Severidad  | Uso                                                   |
| ---------- | ----------------------------------------------------- |
| `debug`    | Diagnóstico no productivo, normalmente no persistente |
| `info`     | Operación normal                                      |
| `notice`   | Operación relevante                                   |
| `warning`  | Situación anómala o denegada                          |
| `error`    | Fallo operativo                                       |
| `critical` | Riesgo de seguridad, financiero o cumplimiento        |

---

### 12.2. Ejemplos

| Evento                      | Severidad |
| --------------------------- | --------- |
| `tenant.created`            | notice    |
| `payment.confirmed`         | notice    |
| `payment.reversed`          | warning   |
| `crossTenant.accessDenied`  | critical  |
| `accountStatement.exported` | notice    |
| `audit.exported`            | warning   |
| `permission.granted`        | warning   |
| `auth.login.failure`        | warning   |

---

## 13. Resultado del evento

### 13.1. AuditOutcome

Valores:

```text id="lrpy0z"
success
failure
denied
partial
skipped
```

---

### 13.2. Ejemplos

| Caso                                   | Outcome |
| -------------------------------------- | ------- |
| Pago confirmado                        | success |
| Acceso cross-tenant bloqueado          | denied  |
| Generación batch con errores parciales | partial |
| Statement ya existente omitido         | skipped |
| Error de validación crítica            | failure |

---

## 14. Modelo de datos preliminar

### 14.1. AuditLog

```text id="koej9l"
AuditLog
├── id
├── tenantId nullable
├── actorType
├── actorUserId nullable
├── actorDisplayName nullable snapshot sanitizado
├── action
├── category
├── severity
├── outcome
├── resourceType nullable
├── resourceId nullable
├── resourceDisplay nullable snapshot sanitizado
├── oldValue nullable JSON sanitizado
├── newValue nullable JSON sanitizado
├── metadata nullable JSON sanitizado
├── reason nullable
├── ipAddress nullable
├── userAgent nullable
├── requestId nullable
├── correlationId nullable
├── causationId nullable
├── traceId nullable
├── occurredAt
├── createdAt
└── archivedAt nullable
```

---

### 14.2. AuditExport

Opcional para MVP, pero recomendado si se exporta auditoría.

```text id="eslu5s"
AuditExport
├── id
├── tenantId nullable
├── requestedBy
├── scope
├── filters
├── format
├── status
├── fileId nullable
├── rowCount
├── requestedAt
├── completedAt nullable
├── expiresAt nullable
└── createdAt
```

MVP puede diferir `AuditExport` y auditar exportación como `audit.exported`.

---

## 15. Permisos iniciales

### 15.1. Permisos platform

```text id="h8l8w2"
audit.platform.read
audit.platform.export
audit.platform.readSensitive
```

---

### 15.2. Permisos tenant

```text id="v9nw0n"
audit.read
audit.export
audit.readFinancial
audit.readSecurity
audit.readAccess
audit.readPersonalData
```

---

### 15.3. Permisos por categoría

Opcional en MVP, recomendado para crecimiento:

```text id="z4fgv0"
audit.categories.security.read
audit.categories.financial.read
audit.categories.access.read
audit.categories.personalData.read
audit.categories.integration.read
```

---

### 15.4. Regla de mínimo privilegio

```text id="ybmw04"
audit.read no necesariamente permite audit.export.
audit.read no necesariamente permite audit.readSensitive.
audit.read no necesariamente permite ver oldValue/newValue completos.
```

---

## 16. API preliminar

### 16.1. Tenant Audit API

```text id="ltm6ww"
GET    /api/v1/tenant/audit-logs
GET    /api/v1/tenant/audit-logs/{auditLogId}
GET    /api/v1/tenant/audit-logs/export
```

---

### 16.2. Platform Audit API

```text id="ugq1f6"
GET    /api/v1/platform/audit-logs
GET    /api/v1/platform/audit-logs/{auditLogId}
GET    /api/v1/platform/audit-logs/export
```

---

### 16.3. Resource Audit API

```text id="rm9x8m"
GET    /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
```

---

### 16.4. Current User Audit API

Diferido para MVP salvo necesidad explícita:

```text id="slkaao"
GET    /api/v1/me/audit-activity
```

---

## 17. Filtros API preliminares

Los endpoints de auditoría deben soportar filtros:

```text id="iaykjq"
tenantId platform only
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

Reglas:

* `pageSize` máximo 100 en consulta ordinaria;
* exportación requiere permiso;
* filtros amplios pueden requerir permiso adicional;
* consulta platform puede filtrar tenant;
* consulta tenant no puede cambiar tenant.

---

## 18. Historias de usuario

### US-001 — Consultar auditoría del tenant

Como TenantAdmin, quiero consultar eventos de auditoría de mi tenant para revisar cambios administrativos y financieros.

#### Criterios de aceptación

* Solo veo eventos de mi tenant.
* Puedo filtrar por fecha, acción, recurso y actor.
* No veo eventos de otros tenants.
* Requiere permiso `audit.read`.

---

### US-002 — Consultar auditoría financiera

Como Treasurer o TenantAuditor, quiero revisar eventos financieros para verificar pagos, cargos, reversos y estados de cuenta.

#### Criterios de aceptación

* Requiere permiso `audit.readFinancial`.
* Se muestran eventos financieros.
* No se exponen comprobantes completos.
* Se incluyen actor, acción, recurso, resultado y fecha.

---

### US-003 — Consultar auditoría de acceso

Como TenantAdmin, quiero revisar cambios de roles y permisos para controlar quién tiene acceso a funciones sensibles.

#### Criterios de aceptación

* Requiere permiso `audit.readAccess`.
* Se muestran eventos de usuarios, roles, permisos y membresías.
* Se muestran oldValue/newValue sanitizados.
* Se audita la consulta si se considera sensible.

---

### US-004 — Investigar intento cross-tenant

Como PlatformAdmin, quiero consultar intentos de acceso cross-tenant para detectar incidentes de seguridad.

#### Criterios de aceptación

* Requiere permiso platform.
* Se muestran eventos `crossTenant.accessDenied`.
* Se filtra por tenant, actor y fecha.
* Se preserva traceId.

---

### US-005 — Exportar auditoría

Como TenantAuditor, quiero exportar auditoría filtrada para revisión externa o archivo administrativo.

#### Criterios de aceptación

* Requiere permiso `audit.export`.
* Debe usar filtros.
* Debe auditarse como `audit.exported`.
* No debe incluir secretos ni payloads completos.
* Formato inicial JSON/CSV.

---

### US-006 — Ver auditoría de un recurso

Como TenantAdmin, quiero consultar la auditoría de un pago, cargo o estado de cuenta específico.

#### Criterios de aceptación

* Requiere permiso de auditoría.
* El recurso debe pertenecer al tenant.
* Se listan eventos asociados al recurso.
* No se muestran eventos de otros tenants.

---

## 19. Requisitos funcionales

### FR-001 — Registrar evento de auditoría

El sistema debe registrar eventos auditables con actor, acción, recurso, resultado, tenant y contexto.

---

### FR-002 — Registrar eventos tenant-scoped

El sistema debe asociar eventos operativos a un tenant.

---

### FR-003 — Registrar eventos platform-level

El sistema debe permitir eventos sin tenant solo para acciones platform.

---

### FR-004 — Registrar actor

El sistema debe registrar actor cuando sea posible.

---

### FR-005 — Registrar recurso

El sistema debe registrar tipo e identificador de recurso cuando aplique.

---

### FR-006 — Registrar valores anteriores y nuevos

El sistema debe registrar oldValue/newValue sanitizados para cambios relevantes.

---

### FR-007 — Registrar resultado

El sistema debe registrar outcome de cada evento.

---

### FR-008 — Registrar trazabilidad

El sistema debe registrar traceId, requestId, correlationId y causationId cuando existan.

---

### FR-009 — Sanitizar datos sensibles

El sistema debe sanitizar datos antes de persistir auditoría.

---

### FR-010 — Consultar auditoría por tenant

El sistema debe permitir consultar auditoría del tenant activo.

---

### FR-011 — Consultar auditoría platform

El sistema debe permitir consulta platform bajo permisos estrictos.

---

### FR-012 — Consultar auditoría por recurso

El sistema debe permitir consultar eventos asociados a un recurso específico.

---

### FR-013 — Filtrar auditoría

El sistema debe permitir filtros por fecha, actor, acción, categoría, severidad, resultado y recurso.

---

### FR-014 — Exportar auditoría

El sistema debe permitir exportación básica JSON/CSV bajo permiso.

---

### FR-015 — Auditar exportaciones de auditoría

Toda exportación de auditoría debe generar un evento `audit.exported`.

---

### FR-016 — Proteger auditoría contra modificación ordinaria

El sistema no debe permitir update/delete ordinario de `AuditLog`.

---

### FR-017 — Registrar accesos denegados críticos

El sistema debe auditar accesos denegados críticos.

---

### FR-018 — Registrar eventos financieros críticos

El sistema debe auditar operaciones financieras críticas de `004`, `005` y `006`.

---

### FR-019 — Registrar cambios de acceso

El sistema debe auditar cambios de usuarios, roles, permisos, invitaciones y membresías.

---

### FR-020 — Proveer contrato para módulos internos

El sistema debe ofrecer un puerto/servicio interno para que otros módulos registren eventos sin acoplarse a la persistencia.

---

## 20. Requisitos no funcionales

### NFR-001 — Seguridad

Solo usuarios autorizados pueden consultar o exportar auditoría.

---

### NFR-002 — Multitenancy

Los eventos tenant-scoped deben aislarse por tenant.

---

### NFR-003 — Integridad

Los eventos de auditoría deben ser append-only en operación normal.

---

### NFR-004 — Sanitización

La auditoría no debe almacenar secretos ni payloads sensibles completos.

---

### NFR-005 — Disponibilidad

El registro de auditoría no debe bloquear innecesariamente operaciones no críticas, pero las operaciones financieras críticas deben fallar si no puede registrarse auditoría obligatoria, según política definida.

---

### NFR-006 — Performance

La consulta de auditoría debe paginarse e indexarse.

MVP recomendado:

```text id="c049r0"
hasta 1 millón de eventos por despliegue inicial antes de optimizaciones avanzadas.
```

---

### NFR-007 — Observabilidad

El propio módulo de auditoría debe emitir logs y métricas sanitizadas.

---

### NFR-008 — Retención

La política inicial debe conservar auditoría de forma indefinida en MVP, salvo decisión posterior de retención.

---

### NFR-009 — Trazabilidad

Eventos deben relacionarse con `traceId` y `correlationId`.

---

### NFR-010 — Testabilidad

Debe existir cobertura de pruebas para registro, consulta, permisos, multitenancy, sanitización y exportación.

---

## 21. Eventos mínimos obligatorios por módulo

### 21.1. `001-tenants`

```text id="zb4rmv"
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

### 21.2. `002-users-roles`

```text id="pumee6"
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

### 21.3. `003-residents-properties`

```text id="rvjs01"
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

### 21.4. `004-dues-fees`

```text id="rv73ys"
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

### 21.5. `005-payments`

```text id="yvid0m"
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

### 21.6. `006-account-statements`

```text id="wzz2sd"
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

## 22. Modelo de permisos

### 22.1. Permisos mínimos

```text id="jsv0t1"
audit.read
audit.export
audit.readFinancial
audit.readSecurity
audit.readAccess
audit.readPersonalData
audit.platform.read
audit.platform.export
audit.platform.readSensitive
```

---

### 22.2. TenantAdmin

Permisos sugeridos:

```text id="m1u2q2"
audit.read
audit.readAccess
audit.readSecurity
```

Puede requerir permisos adicionales para auditoría financiera y datos personales.

---

### 22.3. Treasurer

Permisos sugeridos:

```text id="hdkzj0"
audit.readFinancial
```

---

### 22.4. TenantAuditor

Permisos sugeridos:

```text id="w0f31h"
audit.read
audit.readFinancial
audit.readAccess
audit.export
```

---

### 22.5. PlatformAdmin

Permisos sugeridos:

```text id="uw6z4a"
audit.platform.read
audit.platform.export
audit.platform.readSensitive
```

---

## 23. API de consulta

### 23.1. Consulta tenant

```text id="cq7w27"
GET /api/v1/tenant/audit-logs
```

Permiso:

```text id="bqfocu"
audit.read
```

Filtros:

```text id="rqs70v"
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
page
pageSize
sortBy
sortOrder
```

---

### 23.2. Consulta detalle tenant

```text id="bymwi5"
GET /api/v1/tenant/audit-logs/{auditLogId}
```

Permiso:

```text id="wvttc4"
audit.read
```

Regla:

```text id="ryezcb"
auditLog.tenantId == currentTenant.id
```

---

### 23.3. Consulta por recurso

```text id="zh5zjv"
GET /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
```

Permiso:

```text id="zcx9ap"
audit.read
```

Regla:

```text id="ixkxku"
resource debe pertenecer al currentTenant
```

---

### 23.4. Export tenant

```text id="n8jr7m"
GET /api/v1/tenant/audit-logs/export
```

Permiso:

```text id="pfxjqs"
audit.export
```

Formatos MVP:

```text id="fyvhml"
json
csv
```

---

### 23.5. Consulta platform

```text id="z067c8"
GET /api/v1/platform/audit-logs
```

Permiso:

```text id="a6ghag"
audit.platform.read
```

---

### 23.6. Export platform

```text id="iitfji"
GET /api/v1/platform/audit-logs/export
```

Permiso:

```text id="tk9nox"
audit.platform.export
```

---

## 24. Criterios de acceso y visibilidad

### 24.1. Tenant audit

Un usuario tenant puede ver un audit log si:

```text id="p973xe"
auditLog.tenantId == currentTenant.id
AND user has required audit permission
AND event category is allowed by permission
```

---

### 24.2. Platform audit

Un PlatformAdmin puede ver audit logs platform si:

```text id="mx5s1k"
user has audit.platform.read
```

Para consultar eventos de tenants desde platform:

```text id="t2natl"
user must have audit.platform.readSensitive or equivalent support permission
```

---

### 24.3. Eventos financieros

Eventos financieros requieren:

```text id="z1y4ta"
audit.readFinancial
```

---

### 24.4. Eventos de acceso

Eventos de roles, permisos y membresías requieren:

```text id="r339wq"
audit.readAccess
```

---

### 24.5. Eventos de datos personales

Eventos relacionados con personas, residentes o propietarios pueden requerir:

```text id="o0bdk6"
audit.readPersonalData
```

---

## 25. Sanitización

### 25.1. Campos permitidos en oldValue/newValue

Permitido:

```text id="klk7te"
status
roleIds
permissionIds
amount como string
currency
propertyUnitId
billingPeriodId
paymentId
chargeId
statementId
method
reason sanitizado
configuration keys no sensibles
```

---

### 25.2. Campos prohibidos

Prohibido:

```text id="xw9k7s"
password
passwordHash
accessToken
refreshToken
authorization
cookie
secret
apiKey completa
privateKey
full bank account number
card number
CVV
file content
receipt content
full document export
raw request body
```

---

### 25.3. Redacción

Si un campo sensible aparece accidentalmente en payload de entrada, debe registrarse como:

```text id="akgg74"
[REDACTED]
```

---

## 26. Retención

### 26.1. Política MVP

MVP recomendado:

```text id="xomn14"
Conservar auditoría indefinidamente mientras el volumen sea manejable.
```

---

### 26.2. Política futura

Futuro:

* retención configurable por tenant;
* retención mínima legal;
* legal hold;
* archivado frío;
* exportación regulatoria;
* eliminación controlada bajo base legal.

---

## 27. Integridad

### 27.1. MVP

Controles MVP:

* append-only por aplicación;
* no endpoints update/delete;
* `onDelete: Restrict`;
* permisos estrictos;
* auditoría de exportaciones;
* hash opcional futuro.

---

### 27.2. Futuro

Controles futuros:

* hash encadenado;
* firma digital;
* WORM storage;
* replicación a almacenamiento externo;
* SIEM;
* detección de alteración.

---

## 28. Observabilidad del módulo

### 28.1. Logs técnicos

Registrar:

```text id="d46og6"
audit.log.created
audit.log.create.failed
audit.query.executed
audit.export.requested
audit.export.completed
audit.export.failed
audit.access.denied
```

No registrar:

```text id="s2eydn"
payload completo
oldValue completo si sensible
newValue completo si sensible
tokens
secretos
datos personales innecesarios
```

---

### 28.2. Métricas

Métricas sugeridas:

```text id="b91kr3"
audit_logs_created_total
audit_logs_failed_total
audit_logs_query_total
audit_logs_export_total
audit_logs_access_denied_total
audit_logs_by_category_total
audit_logs_by_outcome_total
audit_sanitization_redacted_fields_total
```

No usar labels de alta cardinalidad como:

```text id="v3ucp8"
resourceId
actorUserId
traceId
ipAddress
```

---

## 29. Seguridad

### 29.1. Riesgos principales

| Riesgo                                  | Impacto |
| --------------------------------------- | ------- |
| Auditoría incompleta                    | Alto    |
| Auditoría manipulable                   | Crítico |
| Auditoría cross-tenant                  | Crítico |
| Auditoría con secretos                  | Crítico |
| Auditoría con payloads sensibles        | Alto    |
| Exportación de auditoría sin permiso    | Alto    |
| No auditar reversos financieros         | Crítico |
| No auditar cambios de permisos          | Crítico |
| Consulta masiva sin control             | Alto    |
| Logs técnicos confundidos con auditoría | Medio   |

---

### 29.2. Controles

* servicio central de auditoría;
* puerto interno `AuditWriterPort`;
* sanitización obligatoria;
* permisos separados;
* tenant filtering;
* no update/delete API;
* export auditado;
* rate limiting;
* paginación;
* tests de multitenancy;
* tests de sanitización;
* tests financieros;
* tests de autorización.

---

## 30. Testing

### 30.1. Unit tests

Probar:

* sanitizador;
* value objects;
* categorización;
* severity mapping;
* outcome;
* audit event builder;
* metadata validator.

---

### 30.2. Integration tests

Probar:

* persistencia de audit logs;
* índices;
* tenant filtering;
* append-only por aplicación;
* no modificación ordinaria;
* registro desde módulos existentes;
* exportación.

---

### 30.3. API tests

Probar:

* listar audit logs tenant;
* consultar detalle;
* filtrar;
* exportar;
* platform query;
* resource audit query.

---

### 30.4. Authorization tests

Probar:

* sin token;
* sin permiso;
* tenant admin con permiso;
* tenant auditor;
* treasurer con audit financiero;
* platform admin;
* usuario de Tenant A intentando ver Tenant B.

---

### 30.5. Sanitization tests

Probar:

* password redacted;
* token redacted;
* authorization header redacted;
* raw payload rejected;
* file content not stored;
* oldValue/newValue sanitizados.

---

### 30.6. Financial audit tests

Probar que se auditan:

* cargo creado;
* cargo ajustado;
* cargo reversado;
* pago confirmado;
* pago rechazado;
* pago asignado;
* pago reversado;
* statement generado;
* statement publicado;
* statement exportado.

---

## 31. Criterios de aceptación globales

La spec se considera implementada si:

* existe servicio central de auditoría;
* existe modelo `AuditLog`;
* eventos críticos se registran;
* eventos tienen tenant cuando aplica;
* eventos tienen actor cuando aplica;
* eventos tienen action;
* eventos tienen outcome;
* eventos tienen resourceType/resourceId cuando aplica;
* eventos tienen traceId cuando provienen de request;
* oldValue/newValue están sanitizados;
* secretos son redactados;
* auditoría financiera crítica existe;
* cambios de roles/permisos se auditan;
* accesos denegados críticos se auditan;
* consultas tenant no mezclan tenants;
* consultas platform requieren permiso platform;
* exportaciones requieren permiso;
* exportaciones se auditan;
* no existe update/delete ordinario;
* logs técnicos no reemplazan auditoría;
* API tiene paginación y filtros;
* OpenAPI está actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas de autorización pasan;
* pruebas de multitenancy pasan;
* pruebas de sanitización pasan;
* pruebas financieras pasan;
* CI pasa.

---

## 32. Casos borde

| Caso                                                   | Resultado esperado                     |
| ------------------------------------------------------ | -------------------------------------- |
| Registrar evento sin action                            | 422/internal validation                |
| Registrar evento tenant-scoped sin tenantId            | error                                  |
| Registrar evento platform sin tenantId                 | permitido                              |
| Registrar evento sin actor en job system               | actorType system                       |
| Registrar access denied sin resourceId                 | permitido si no hay recurso            |
| Registrar oldValue con password                        | `[REDACTED]`                           |
| Registrar metadata con token                           | `[REDACTED]`                           |
| Consultar audit log de otro tenant                     | 403/404                                |
| Exportar auditoría sin permiso                         | 403                                    |
| Exportar sin filtros amplios                           | permitido o advertencia según política |
| pageSize > 100                                         | 422                                    |
| sortBy arbitrario                                      | 422                                    |
| PlatformAdmin sin permiso sensitive consulta tenant    | 403                                    |
| TenantAuditor consulta eventos financieros sin permiso | 403                                    |
| CSV export con fórmula                                 | celda neutralizada                     |
| Intentar modificar AuditLog por API                    | endpoint no existe                     |
| Intentar borrar AuditLog por API                       | endpoint no existe                     |

---

## 33. Dependencias hacia specs futuras

Este módulo habilita:

```text id="fj8fq2"
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

* monitoreo de seguridad;
* alertas;
* reportes de cumplimiento;
* investigación de incidentes;
* integración SIEM;
* trazabilidad de webhooks;
* legal hold;
* retención avanzada.

---

## 34. Archivos derivados esperados

Esta spec debe complementarse con:

```text id="gmry70"
docs/specs/007-audit/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 35. Cierre de preguntas para Sprint 2

El contrato `GAP-S2-007-AUDIT-BASE-SEMANTICS-2026-08-13.md` resuelve el alcance base: Sprint 2 implementa únicamente eventos durables del catálogo cerrado y denegaciones de autorización; no incluye consultas, exportaciones, `AuditExport`, eventos de Keycloak, lecturas sensibles, valores anteriores/nuevos, IP, user agent, jobs, hash encadenado, retención/purga ni rate limiting específico. `audit_logs` permanece en PostgreSQL Core, append-only y con sanitización obligatoria. Las capacidades diferidas requieren autorización de un sprint posterior y no bloquean el alcance base.

---

## 36. Decisión inicial para MVP

Para MVP se recomienda:

```text id="t8t3o3"
- Crear tabla audit_logs.
- Implementar AuditWriterPort.
- Implementar AuditService central.
- Implementar sanitización obligatoria.
- Registrar eventos críticos de 001 a 006.
- Registrar eventos financieros críticos.
- Registrar cambios de roles, permisos y membresías.
- Registrar accesos denegados críticos.
- Registrar exportaciones.
- Consultar auditoría por tenant.
- Consultar auditoría platform con permiso.
- Consultar auditoría por recurso.
- Exportar auditoría en JSON/CSV.
- Mantener auditoría append-only en aplicación.
- No exponer update/delete.
- Diferir hash encadenado avanzado.
- Diferir WORM storage.
- Diferir SIEM.
- Diferir detección automática de anomalías.
- Diferir legal hold avanzado.
```

---

## 37. Conclusión

El módulo `007-audit` es un módulo transversal y crítico para RESIDENT Core.

Debe garantizar:

```text id="sj67eu"
trazabilidad
responsabilidad
evidencia
seguridad
aislamiento por tenant
protección de datos
reconstrucción de acciones críticas
control de exportaciones
investigación de incidentes
cumplimiento futuro
```

La auditoría debe acompañar especialmente a los módulos financieros:

```text id="rlnjp5"
004-dues-fees
005-payments
006-account-statements
```

y a los módulos de acceso:

```text id="tenqyz"
001-tenants
002-users-roles
```

La implementación no debe aceptarse si permite auditoría manipulable por API ordinaria, mezcla eventos entre tenants, almacena secretos, omite eventos financieros críticos, omite cambios de permisos, permite exportación sin permiso o no registra trazabilidad suficiente para reconstruir una acción relevante.
