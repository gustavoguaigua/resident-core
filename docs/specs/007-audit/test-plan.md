# Test Plan — Spec 007 Audit, Traceability and Compliance Events

> **Gates de Sprint 2:** se ejecutará únicamente la matriz mínima de atomicidad,
> durabilidad, aislamiento tenant, sanitización, correlación y append-only definida en
> `docs/changes/GAP-S2-007-AUDIT-BASE-SEMANTICS-2026-08-13.md`. Pruebas de consulta,
> exportación y dominios posteriores quedan diferidas.

## 1. Información del documento

| Campo                    | Valor                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Proyecto                 | RESIDENT Core                                                                                                           |
| Spec ID                  | 007                                                                                                                     |
| Módulo                   | Audit                                                                                                                   |
| Documento                | Test Plan                                                                                                               |
| Ruta                     | `docs/specs/007-audit/test-plan.md`                                                                                     |
| Versión                  | 0.1                                                                                                                     |
| Estado                   | needs-review                                                                                                            |
| Fecha                    | 2026-07-14                                                                                                              |
| Documento base           | `docs/specs/007-audit/spec.md`                                                                                          |
| Plan técnico             | `docs/specs/007-audit/plan.md`                                                                                          |
| Modelo de datos          | `docs/specs/007-audit/data-model.md`                                                                                    |
| Contrato API             | `docs/specs/007-audit/api-contract.md`                                                                                  |
| Depende de               | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements` |
| Framework sugerido       | Jest + Supertest                                                                                                        |
| Base de datos de pruebas | PostgreSQL test database                                                                                                |
| Prioridad                | Alta                                                                                                                    |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `007-audit`.

El objetivo es validar que RESIDENT Core registre, proteja, consulte y exporte eventos de auditoría de forma:

* tenant-scoped;
* trazable;
* sanitizada;
* segura;
* consultable bajo permisos estrictos;
* protegida contra modificación ordinaria;
* compatible con operaciones financieras;
* compatible con operaciones de acceso;
* compatible con investigación de incidentes;
* compatible con cumplimiento futuro.

Regla central:

```text
Ninguna operación crítica debe ejecutarse sin dejar evidencia auditable suficiente, y ningún registro de auditoría debe exponer secretos, payloads completos o información de otro tenant.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este plan cubre:

* unit tests;
* domain tests;
* application tests;
* sanitizer tests;
* metadata validator tests;
* repository integration tests;
* migration tests;
* seed tests;
* API tests;
* authorization tests;
* platform authorization tests;
* category permission tests;
* multitenancy tests;
* resource ownership tests;
* export tests;
* CSV injection tests;
* append-only behavior tests;
* integration tests con módulos `001` a `006`;
* financial audit tests;
* access audit tests;
* security audit tests;
* observability tests;
* OpenAPI tests;
* smoke tests.

---

### 3.2. No incluido

No cubre todavía:

* SIEM externo;
* WORM storage;
* hash encadenado avanzado;
* firma criptográfica de eventos;
* blockchain;
* legal hold avanzado;
* retención legal avanzada;
* detección automática de anomalías;
* machine learning antifraude;
* dashboards GRC;
* reportes regulatorios avanzados;
* almacenamiento frío;
* gestión completa de incidentes;
* outbox transaccional completo si se difiere;
* integración con herramientas externas de compliance.

Estos temas quedan para specs futuras.

---

## 4. Estrategia general

El módulo se probará por capas:

```text
Unit tests
Domain tests
Application tests
Sanitization tests
Repository integration tests
Migration tests
API tests
Authorization tests
Platform authorization tests
Category permission tests
Multitenancy tests
Resource ownership tests
Export tests
CSV security tests
Append-only tests
Financial audit tests
Access audit tests
Security audit tests
Observability tests
OpenAPI tests
Smoke tests
```

Reglas obligatorias:

```text
1. Todo endpoint privado debe tener prueba 401 sin token.
2. Todo endpoint de auditoría debe tener prueba 403 sin permiso.
3. Toda consulta tenant debe filtrar por tenantId.
4. Toda consulta platform debe requerir permiso platform.
5. Toda consulta por recurso debe validar pertenencia del recurso al tenant.
6. Toda categoría sensible debe requerir permiso específico.
7. Toda exportación debe requerir permiso específico.
8. Toda exportación debe generar audit.exported o audit.platformExported.
9. Todo evento persistido debe tener action.
10. Todo evento persistido debe tener category.
11. Todo evento persistido debe tener severity.
12. Todo evento persistido debe tener outcome.
13. Todo evento tenant-scoped debe tener tenantId.
14. Todo evento HTTP debe conservar traceId cuando esté disponible.
15. oldValue, newValue y metadata deben estar sanitizados.
16. Ningún AuditLog debe almacenar tokens, contraseñas, headers Authorization ni payloads completos.
17. No deben existir endpoints ordinarios para update/delete de AuditLog.
18. Ninguna prueba debe usar datos reales.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* registra eventos auditables;
* registra eventos tenant-scoped;
* registra eventos platform-level;
* registra actor;
* registra recurso cuando aplica;
* registra outcome;
* registra traceId cuando aplica;
* sanitiza oldValue;
* sanitiza newValue;
* sanitiza metadata;
* bloquea secretos;
* permite consulta tenant;
* permite consulta platform bajo permiso;
* permite consulta por recurso;
* permite filtros;
* permite paginación;
* permite export JSON;
* permite export CSV;
* neutraliza CSV injection;
* audita exportaciones;
* impide consulta cross-tenant;
* impide consulta platform sin permiso;
* aplica permisos por categoría;
* registra eventos financieros críticos;
* registra cambios de acceso;
* registra accesos denegados críticos;
* no expone update/delete ordinario;
* OpenAPI queda actualizado;
* CI pasa.

---

## 6. Datos base de prueba

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text
tenantActiveA: villa-club-demo
tenantActiveB: altos-del-norte-demo
tenantSuspended: tenant-suspendido-demo
tenantArchived: tenant-archivado-demo
```

---

### 6.2. Usuarios

Reusar fixtures de `002-users-roles`:

```text
platformAdmin
platformSupportUser
tenantAdminA
tenantAdminB
treasurerA
treasurerB
tenantAuditorA
tenantAuditorB
boardMemberA
propertyOwnerUserA
residentUserA
residentUserB
userWithoutMembership
userWithoutPermission
disabledUser
anonymousUser
```

---

### 6.3. Permisos de auditoría

Fixtures requeridos:

```text
auditReaderA
auditExporterA
auditFinancialReaderA
auditAccessReaderA
auditSecurityReaderA
auditPersonalDataReaderA
auditPlatformReader
auditPlatformExporter
auditPlatformSensitiveReader
auditNoPermissionUser
```

Permisos:

```text
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

### 6.4. Recursos demo

Reusar recursos de specs anteriores:

```text
tenantActiveA
tenantActiveB
userProfileA
membershipA
propertyUnitA1
propertyUnitB1
chargeA1MonthlyDues
paymentConfirmedA1
paymentConfirmedB1
paymentReceiptA1
paymentAllocationA1
accountStatementA1
unitBalanceA1
```

---

### 6.5. Audit logs demo

Fixtures requeridos:

```text
auditTenantCreatedPlatform
auditUserCreatedA
auditRoleAssignedA
auditPermissionGrantedA
auditPropertyUnitUpdatedA
auditChargeCreatedA
auditPaymentConfirmedA
auditPaymentReversedA
auditPaymentReceiptDownloadedA
auditAccountStatementGeneratedA
auditAccountStatementExportedA
auditCrossTenantAccessDeniedA
auditExportedA
auditSecurityDeniedA
auditPersonalDataUpdatedA
auditPaymentConfirmedB
auditPlatformTenantSuspended
```

---

### 6.6. Datos prohibidos

No usar:

```text
tokens reales
contraseñas reales
headers Authorization reales
cookies reales
datos reales de residentes
datos reales de propietarios
comprobantes reales
archivos reales
payloads completos reales
referencias bancarias reales
exports reales
```

Usar únicamente datos ficticios.

---

## 7. Factories recomendadas

Crear factories:

```text
createAuditLog()
createTenantAuditLog()
createPlatformAuditLog()
createFinancialAuditLog()
createAccessAuditLog()
createSecurityAuditLog()
createPersonalDataAuditLog()
createExportAuditLog()
createDeniedAuditLog()
createAuditEventInput()
createAuditActor()
createAuditResource()
createAuditContext()
createAuditMetadata()
createAuditQuery()
createAuditExportQuery()
```

Ejemplo:

```text
createAuditLog({
  tenantId: tenantActiveA.id,
  actorType: "user",
  actorUserId: treasurerA.id,
  action: "payment.confirmed",
  category: "payments",
  severity: "notice",
  outcome: "success",
  resourceType: "payment",
  resourceId: paymentConfirmedA1.id,
  oldValue: { status: "pendingValidation" },
  newValue: { status: "confirmed" },
  metadata: { amount: "100.00", currency: "USD" },
  traceId: "req_test_payment_confirmed"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. AuditAction

Archivo sugerido:

```text
audit-action.vo.spec.ts
```

| ID                | Caso                                | Resultado esperado |
| ----------------- | ----------------------------------- | ------------------ |
| UT-AUD-ACTION-001 | `payment.confirmed` válido          | válido             |
| UT-AUD-ACTION-002 | `accountStatement.generated` válido | válido             |
| UT-AUD-ACTION-003 | acción vacía                        | error              |
| UT-AUD-ACTION-004 | acción con espacios                 | error              |
| UT-AUD-ACTION-005 | acción con caracteres peligrosos    | error              |
| UT-AUD-ACTION-006 | acción demasiado larga              | error              |
| UT-AUD-ACTION-007 | normalización mantiene dot notation | válido             |

---

## 8.2. AuditCategory

Archivo sugerido:

```text
audit-category.vo.spec.ts
```

| ID             | Caso                       | Resultado esperado |
| -------------- | -------------------------- | ------------------ |
| UT-AUD-CAT-001 | `platform` válido          | válido             |
| UT-AUD-CAT-002 | `security` válido          | válido             |
| UT-AUD-CAT-003 | `access` válido            | válido             |
| UT-AUD-CAT-004 | `financial` válido         | válido             |
| UT-AUD-CAT-005 | `payments` válido          | válido             |
| UT-AUD-CAT-006 | `accountStatements` válido | válido             |
| UT-AUD-CAT-007 | categoría inválida         | error              |

---

## 8.3. AuditSeverity

Archivo sugerido:

```text
audit-severity.vo.spec.ts
```

| ID             | Caso                       | Resultado esperado |
| -------------- | -------------------------- | ------------------ |
| UT-AUD-SEV-001 | `info` válido              | válido             |
| UT-AUD-SEV-002 | `notice` válido            | válido             |
| UT-AUD-SEV-003 | `warning` válido           | válido             |
| UT-AUD-SEV-004 | `critical` válido          | válido             |
| UT-AUD-SEV-005 | severidad inválida         | error              |
| UT-AUD-SEV-006 | default para acción normal | `info` o `notice`  |

---

## 8.4. AuditOutcome

Archivo sugerido:

```text
audit-outcome.vo.spec.ts
```

| ID             | Caso             | Resultado esperado |
| -------------- | ---------------- | ------------------ |
| UT-AUD-OUT-001 | `success` válido | válido             |
| UT-AUD-OUT-002 | `failure` válido | válido             |
| UT-AUD-OUT-003 | `denied` válido  | válido             |
| UT-AUD-OUT-004 | `partial` válido | válido             |
| UT-AUD-OUT-005 | `skipped` válido | válido             |
| UT-AUD-OUT-006 | outcome inválido | error              |

---

## 8.5. AuditActorType

Archivo sugerido:

```text
audit-actor-type.vo.spec.ts
```

| ID               | Caso                     | Resultado esperado |
| ---------------- | ------------------------ | ------------------ |
| UT-AUD-ACTOR-001 | `user` válido            | válido             |
| UT-AUD-ACTOR-002 | `system` válido          | válido             |
| UT-AUD-ACTOR-003 | `job` válido             | válido             |
| UT-AUD-ACTOR-004 | `integration` válido     | válido             |
| UT-AUD-ACTOR-005 | `platformSupport` válido | válido             |
| UT-AUD-ACTOR-006 | `unknown` válido         | válido             |
| UT-AUD-ACTOR-007 | actor inválido           | error              |

---

## 8.6. AuditExportFormat

Archivo sugerido:

```text
audit-export-format.vo.spec.ts
```

| ID                | Caso                      | Resultado esperado |
| ----------------- | ------------------------- | ------------------ |
| UT-AUD-FORMAT-001 | `json` válido             | válido             |
| UT-AUD-FORMAT-002 | `csv` válido              | válido             |
| UT-AUD-FORMAT-003 | `pdf` no soportado en MVP | error              |
| UT-AUD-FORMAT-004 | formato vacío             | error              |

---

# 9. Pruebas unitarias de entidades

## 9.1. AuditLog entity

Archivo sugerido:

```text
audit-log.entity.spec.ts
```

| ID             | Caso                                  | Resultado esperado   |
| -------------- | ------------------------------------- | -------------------- |
| UT-AUD-LOG-001 | Crear AuditLog válido tenant-scoped   | válido               |
| UT-AUD-LOG-002 | Crear AuditLog platform sin tenant    | válido               |
| UT-AUD-LOG-003 | Crear tenant-scoped sin tenantId      | error                |
| UT-AUD-LOG-004 | Crear sin action                      | error                |
| UT-AUD-LOG-005 | Crear sin outcome                     | error                |
| UT-AUD-LOG-006 | Crear actor user sin actorUserId      | error según política |
| UT-AUD-LOG-007 | Crear con resourceType sin resourceId | error                |
| UT-AUD-LOG-008 | Crear con oldValue sanitizado         | válido               |
| UT-AUD-LOG-009 | Crear con metadata sanitizada         | válido               |
| UT-AUD-LOG-010 | No permite mutación ordinaria         | pasa                 |

---

## 9.2. AuditEvent entity

Archivo sugerido:

```text
audit-event.entity.spec.ts
```

| ID             | Caso                            | Resultado esperado            |
| -------------- | ------------------------------- | ----------------------------- |
| UT-AUD-EVT-001 | Crear evento de pago confirmado | válido                        |
| UT-AUD-EVT-002 | Crear evento access denied      | válido                        |
| UT-AUD-EVT-003 | Crear evento batch partial      | válido                        |
| UT-AUD-EVT-004 | Evento sin category             | error                         |
| UT-AUD-EVT-005 | Evento con metadata excesiva    | error/truncado según política |

---

## 9.3. AuditActor entity

Archivo sugerido:

```text
audit-actor.entity.spec.ts
```

| ID                   | Caso                             | Resultado esperado |
| -------------------- | -------------------------------- | ------------------ |
| UT-AUD-ACTOR-ENT-001 | Actor user válido                | válido             |
| UT-AUD-ACTOR-ENT-002 | Actor system válido sin userId   | válido             |
| UT-AUD-ACTOR-ENT-003 | Actor job válido                 | válido             |
| UT-AUD-ACTOR-ENT-004 | Actor platformSupport con userId | válido             |
| UT-AUD-ACTOR-ENT-005 | Actor displayName sanitizado     | válido             |

---

## 9.4. AuditResource entity

Archivo sugerido:

```text
audit-resource.entity.spec.ts
```

| ID             | Caso                            | Resultado esperado   |
| -------------- | ------------------------------- | -------------------- |
| UT-AUD-RES-001 | Recurso payment válido          | válido               |
| UT-AUD-RES-002 | Recurso accountStatement válido | válido               |
| UT-AUD-RES-003 | Recurso sin id cuando requerido | error                |
| UT-AUD-RES-004 | resourceDisplay sanitizado      | válido               |
| UT-AUD-RES-005 | resourceType inválido           | error según catálogo |

---

## 9.5. AuditContext entity

Archivo sugerido:

```text
audit-context.entity.spec.ts
```

| ID             | Caso                      | Resultado esperado |
| -------------- | ------------------------- | ------------------ |
| UT-AUD-CTX-001 | Contexto HTTP con traceId | válido             |
| UT-AUD-CTX-002 | Contexto job sin IP       | válido             |
| UT-AUD-CTX-003 | UserAgent largo           | truncado           |
| UT-AUD-CTX-004 | RequestId válido          | válido             |
| UT-AUD-CTX-005 | No contiene payload       | pasa               |

---

# 10. Pruebas de servicios

## 10.1. AuditSanitizerService

Archivo sugerido:

```text
audit-sanitizer.service.spec.ts
```

| ID              | Caso                        | Resultado esperado  |
| --------------- | --------------------------- | ------------------- |
| SRV-AUD-SAN-001 | Redacta password            | `[REDACTED]`        |
| SRV-AUD-SAN-002 | Redacta passwordHash        | `[REDACTED]`        |
| SRV-AUD-SAN-003 | Redacta accessToken         | `[REDACTED]`        |
| SRV-AUD-SAN-004 | Redacta refreshToken        | `[REDACTED]`        |
| SRV-AUD-SAN-005 | Redacta authorization       | `[REDACTED]`        |
| SRV-AUD-SAN-006 | Redacta cookie              | `[REDACTED]`        |
| SRV-AUD-SAN-007 | Redacta apiKey              | `[REDACTED]`        |
| SRV-AUD-SAN-008 | Redacta privateKey          | `[REDACTED]`        |
| SRV-AUD-SAN-009 | Redacta cardNumber/CVV      | `[REDACTED]`        |
| SRV-AUD-SAN-010 | Redacta bankAccountNumber   | `[REDACTED]`        |
| SRV-AUD-SAN-011 | Redacta fileContent         | `[REDACTED]`        |
| SRV-AUD-SAN-012 | Redacta rawBody/payload     | `[REDACTED]`        |
| SRV-AUD-SAN-013 | Trunca JSON excesivo        | `_truncated = true` |
| SRV-AUD-SAN-014 | Trunca profundidad excesiva | `[TRUNCATED]`       |
| SRV-AUD-SAN-015 | Conserva campos permitidos  | válido              |

---

## 10.2. AuditMetadataValidatorService

Archivo sugerido:

```text
audit-metadata-validator.service.spec.ts
```

| ID               | Caso                         | Resultado esperado |
| ---------------- | ---------------------------- | ------------------ |
| SRV-AUD-META-001 | Metadata válida de batch     | válido             |
| SRV-AUD-META-002 | Metadata con token           | error/redacted     |
| SRV-AUD-META-003 | Metadata demasiado grande    | error/truncado     |
| SRV-AUD-META-004 | Metadata con array enorme    | error/truncado     |
| SRV-AUD-META-005 | Metadata con profundidad > 5 | error/truncado     |
| SRV-AUD-META-006 | Metadata con export completo | rechazado          |

---

## 10.3. AuditEventBuilderService

Archivo sugerido:

```text
audit-event-builder.service.spec.ts
```

| ID                | Caso                             | Resultado esperado          |
| ----------------- | -------------------------------- | --------------------------- |
| SRV-AUD-BUILD-001 | Construye evento financiero      | category payments/financial |
| SRV-AUD-BUILD-002 | Construye evento access          | category access             |
| SRV-AUD-BUILD-003 | Construye evento security denied | outcome denied              |
| SRV-AUD-BUILD-004 | Mapea severity por action        | correcto                    |
| SRV-AUD-BUILD-005 | Incluye traceId del contexto     | correcto                    |
| SRV-AUD-BUILD-006 | No incluye payload completo      | pasa                        |

---

## 10.4. AuditService

Archivo sugerido:

```text
audit.service.spec.ts
```

| ID              | Caso                                   | Resultado esperado |
| --------------- | -------------------------------------- | ------------------ |
| SRV-AUD-SVC-001 | write evento válido                    | persiste           |
| SRV-AUD-SVC-002 | writeMany eventos válidos              | persiste todos     |
| SRV-AUD-SVC-003 | writeCritical falla repositorio        | lanza error        |
| SRV-AUD-SVC-004 | writeBestEffort falla repositorio      | no rompe operación |
| SRV-AUD-SVC-005 | Aplica sanitización antes de persistir | pasa               |
| SRV-AUD-SVC-006 | Emite AuditLogCreated                  | pasa               |
| SRV-AUD-SVC-007 | Evita recursión audit.exported         | pasa               |
| SRV-AUD-SVC-008 | Evento inválido falla validación       | error              |

---

## 10.5. AuditQueryService

Archivo sugerido:

```text
audit-query.service.spec.ts
```

| ID                | Caso                      | Resultado esperado |
| ----------------- | ------------------------- | ------------------ |
| SRV-AUD-QUERY-001 | Aplica filtros tenant     | correcto           |
| SRV-AUD-QUERY-002 | Aplica filtro actorUserId | correcto           |
| SRV-AUD-QUERY-003 | Aplica filtro action      | correcto           |
| SRV-AUD-QUERY-004 | Aplica filtro category    | correcto           |
| SRV-AUD-QUERY-005 | Aplica date range         | correcto           |
| SRV-AUD-QUERY-006 | pageSize > 100            | error              |
| SRV-AUD-QUERY-007 | sortBy arbitrario         | error              |
| SRV-AUD-QUERY-008 | dateFrom > dateTo         | error              |

---

## 10.6. AuditPermissionPolicyService

Archivo sugerido:

```text
audit-permission-policy.service.spec.ts
```

| ID               | Caso                                    | Resultado esperado |
| ---------------- | --------------------------------------- | ------------------ |
| SRV-AUD-PERM-001 | audit.read permite eventos generales    | permitido          |
| SRV-AUD-PERM-002 | financial sin audit.readFinancial       | denegado           |
| SRV-AUD-PERM-003 | payments con audit.readFinancial        | permitido          |
| SRV-AUD-PERM-004 | access sin audit.readAccess             | denegado           |
| SRV-AUD-PERM-005 | security sin audit.readSecurity         | denegado           |
| SRV-AUD-PERM-006 | personalData sin audit.readPersonalData | denegado           |
| SRV-AUD-PERM-007 | export sin audit.export                 | denegado           |
| SRV-AUD-PERM-008 | platform sin audit.platform.read        | denegado           |

---

## 10.7. AuditExportService

Archivo sugerido:

```text
audit-export.service.spec.ts
```

| ID              | Caso                             | Resultado esperado |
| --------------- | -------------------------------- | ------------------ |
| SRV-AUD-EXP-001 | Export JSON válido               | éxito              |
| SRV-AUD-EXP-002 | Export CSV válido                | éxito              |
| SRV-AUD-EXP-003 | Formato inválido                 | error              |
| SRV-AUD-EXP-004 | Export respeta categoría visible | pasa               |
| SRV-AUD-EXP-005 | Export sin permiso               | error              |
| SRV-AUD-EXP-006 | CSV neutraliza `=`               | pasa               |
| SRV-AUD-EXP-007 | CSV neutraliza `+`               | pasa               |
| SRV-AUD-EXP-008 | CSV neutraliza `-`               | pasa               |
| SRV-AUD-EXP-009 | CSV neutraliza `@`               | pasa               |
| SRV-AUD-EXP-010 | Export genera audit.exported     | pasa               |
| SRV-AUD-EXP-011 | Export demasiado grande          | error              |

---

# 11. Pruebas de casos de uso

## 11.1. WriteAuditLogUseCase

| ID                | Caso                            | Resultado esperado     |
| ----------------- | ------------------------------- | ---------------------- |
| APP-AUD-WRITE-001 | Escribir evento tenant válido   | éxito                  |
| APP-AUD-WRITE-002 | Escribir evento platform válido | éxito                  |
| APP-AUD-WRITE-003 | Evento sin action               | error                  |
| APP-AUD-WRITE-004 | Evento sin outcome              | error                  |
| APP-AUD-WRITE-005 | Tenant-scoped sin tenantId      | error                  |
| APP-AUD-WRITE-006 | Evento con token en metadata    | redactado              |
| APP-AUD-WRITE-007 | Evento con password en oldValue | redactado              |
| APP-AUD-WRITE-008 | Evento crítico con fallo DB     | error                  |
| APP-AUD-WRITE-009 | Evento best-effort con fallo DB | log técnico + no throw |

---

## 11.2. ListTenantAuditLogsUseCase

| ID                   | Caso                       | Resultado esperado |
| -------------------- | -------------------------- | ------------------ |
| APP-AUD-LIST-TEN-001 | Listar audit logs tenant A | solo tenant A      |
| APP-AUD-LIST-TEN-002 | Filtrar por category       | correcto           |
| APP-AUD-LIST-TEN-003 | Filtrar por actor          | correcto           |
| APP-AUD-LIST-TEN-004 | Filtrar por resource       | correcto           |
| APP-AUD-LIST-TEN-005 | Filtrar por date range     | correcto           |
| APP-AUD-LIST-TEN-006 | Financial sin permiso      | 403                |
| APP-AUD-LIST-TEN-007 | Access sin permiso         | 403                |
| APP-AUD-LIST-TEN-008 | Paginar                    | meta correcto      |

---

## 11.3. GetTenantAuditLogUseCase

| ID                  | Caso                                        | Resultado esperado |
| ------------------- | ------------------------------------------- | ------------------ |
| APP-AUD-GET-TEN-001 | Consultar audit log propio                  | éxito              |
| APP-AUD-GET-TEN-002 | Consultar audit log de otro tenant          | 404/403            |
| APP-AUD-GET-TEN-003 | Consultar categoría sin permiso             | 403                |
| APP-AUD-GET-TEN-004 | Detalle oculta campos sensibles sin permiso | pasa               |
| APP-AUD-GET-TEN-005 | Audit log inexistente                       | 404                |

---

## 11.4. ListResourceAuditLogsUseCase

| ID              | Caso                           | Resultado esperado |
| --------------- | ------------------------------ | ------------------ |
| APP-AUD-RES-001 | Recurso propio válido          | éxito              |
| APP-AUD-RES-002 | Recurso otro tenant            | 403/404            |
| APP-AUD-RES-003 | resourceType no soportado      | 422                |
| APP-AUD-RES-004 | resourceId inválido            | 422                |
| APP-AUD-RES-005 | Categoría sensible sin permiso | 403                |
| APP-AUD-RES-006 | Filtrado por action            | correcto           |

---

## 11.5. ExportTenantAuditLogsUseCase

| ID                  | Caso                                     | Resultado esperado         |
| ------------------- | ---------------------------------------- | -------------------------- |
| APP-AUD-EXP-TEN-001 | Export JSON tenant                       | éxito                      |
| APP-AUD-EXP-TEN-002 | Export CSV tenant                        | éxito                      |
| APP-AUD-EXP-TEN-003 | Export sin audit.export                  | 403                        |
| APP-AUD-EXP-TEN-004 | Export financial sin audit.readFinancial | excluye o 403 según filtro |
| APP-AUD-EXP-TEN-005 | Export demasiado grande                  | 422                        |
| APP-AUD-EXP-TEN-006 | Export audita audit.exported             | pasa                       |
| APP-AUD-EXP-TEN-007 | Export no incluye secretos               | pasa                       |

---

## 11.6. Platform use cases

| ID               | Caso                                          | Resultado esperado   |
| ---------------- | --------------------------------------------- | -------------------- |
| APP-AUD-PLAT-001 | Platform lista logs                           | éxito                |
| APP-AUD-PLAT-002 | Tenant user consulta platform                 | 403                  |
| APP-AUD-PLAT-003 | Platform sin readSensitive consulta sensible  | campos ocultos o 403 |
| APP-AUD-PLAT-004 | Platform export JSON                          | éxito                |
| APP-AUD-PLAT-005 | Platform export sin permiso                   | 403                  |
| APP-AUD-PLAT-006 | Platform export audita audit.platformExported | pasa                 |

---

# 12. Pruebas de integración

## 12.1. Migración

Archivo sugerido:

```text
007-create-audit-logs.migration.spec.ts
```

| ID              | Caso                             | Resultado esperado |
| --------------- | -------------------------------- | ------------------ |
| INT-AUD-MIG-001 | Migración aplica en DB limpia    | éxito              |
| INT-AUD-MIG-002 | Enums creados                    | éxito              |
| INT-AUD-MIG-003 | Tabla audit_logs creada          | éxito              |
| INT-AUD-MIG-004 | action obligatorio               | éxito              |
| INT-AUD-MIG-005 | category obligatorio             | éxito              |
| INT-AUD-MIG-006 | severity obligatorio             | éxito              |
| INT-AUD-MIG-007 | outcome obligatorio              | éxito              |
| INT-AUD-MIG-008 | occurredAt obligatorio           | éxito              |
| INT-AUD-MIG-009 | oldValue/newValue/metadata JSONB | éxito              |
| INT-AUD-MIG-010 | índices tenant creados           | éxito              |
| INT-AUD-MIG-011 | índice resource creado           | éxito              |
| INT-AUD-MIG-012 | índice traceId creado            | éxito              |
| INT-AUD-MIG-013 | onDelete Restrict                | éxito              |
| INT-AUD-MIG-014 | no cascade delete peligroso      | éxito              |

---

## 12.2. AuditRepository

Archivo sugerido:

```text
audit.repository.integration.spec.ts
```

| ID               | Caso                            | Resultado esperado |
| ---------------- | ------------------------------- | ------------------ |
| INT-AUD-REPO-001 | Crear audit log tenant          | éxito              |
| INT-AUD-REPO-002 | Crear audit log platform        | éxito              |
| INT-AUD-REPO-003 | Listar por tenant               | solo tenant        |
| INT-AUD-REPO-004 | Buscar por id y tenant          | éxito              |
| INT-AUD-REPO-005 | Buscar por resource             | éxito              |
| INT-AUD-REPO-006 | Buscar por actor                | éxito              |
| INT-AUD-REPO-007 | Buscar por traceId              | éxito              |
| INT-AUD-REPO-008 | Filtros combinados              | correcto           |
| INT-AUD-REPO-009 | Paginación                      | correcto           |
| INT-AUD-REPO-010 | No expone update/delete público | pasa               |

---

## 12.3. Seeds

Archivo sugerido:

```text
audit.seeds.integration.spec.ts
```

| ID               | Caso                                             | Resultado esperado |
| ---------------- | ------------------------------------------------ | ------------------ |
| INT-AUD-SEED-001 | Seeds crean eventos demo                         | éxito              |
| INT-AUD-SEED-002 | Seeds son idempotentes                           | pasa               |
| INT-AUD-SEED-003 | Seeds no contienen password                      | pasa               |
| INT-AUD-SEED-004 | Seeds no contienen token                         | pasa               |
| INT-AUD-SEED-005 | Seeds no contienen datos reales                  | pasa               |
| INT-AUD-SEED-006 | Seeds crean eventos financieros demo             | pasa               |
| INT-AUD-SEED-007 | Seeds crean evento crossTenant.accessDenied demo | pasa               |

---

# 13. Pruebas API — Tenant Audit

## 13.1. Listar audit logs tenant

Endpoint:

```text
GET /api/v1/tenant/audit-logs
```

| ID                   | Caso                       | Resultado esperado |
| -------------------- | -------------------------- | ------------------ |
| API-AUD-TEN-LIST-001 | auditReaderA lista eventos | 200                |
| API-AUD-TEN-LIST-002 | Sin token                  | 401                |
| API-AUD-TEN-LIST-003 | Sin membership             | 403                |
| API-AUD-TEN-LIST-004 | Sin audit.read             | 403                |
| API-AUD-TEN-LIST-005 | Tenant A no ve eventos B   | pasa               |
| API-AUD-TEN-LIST-006 | Filtro por action          | correcto           |
| API-AUD-TEN-LIST-007 | Filtro por category        | correcto           |
| API-AUD-TEN-LIST-008 | Filtro por actorUserId     | correcto           |
| API-AUD-TEN-LIST-009 | Filtro por resource        | correcto           |
| API-AUD-TEN-LIST-010 | Filtro por traceId         | correcto           |
| API-AUD-TEN-LIST-011 | Paginación                 | meta correcto      |
| API-AUD-TEN-LIST-012 | sortBy inválido            | 422                |
| API-AUD-TEN-LIST-013 | pageSize > 100             | 422                |

---

## 13.2. Detalle audit log tenant

Endpoint:

```text
GET /api/v1/tenant/audit-logs/{auditLogId}
```

| ID                  | Caso                           | Resultado esperado |
| ------------------- | ------------------------------ | ------------------ |
| API-AUD-TEN-GET-001 | Audit log propio               | 200                |
| API-AUD-TEN-GET-002 | Audit log otro tenant          | 404/403            |
| API-AUD-TEN-GET-003 | Audit log inexistente          | 404                |
| API-AUD-TEN-GET-004 | Categoría sensible sin permiso | 403                |
| API-AUD-TEN-GET-005 | Detalle no contiene secretos   | pasa               |
| API-AUD-TEN-GET-006 | UUID inválido                  | 422                |

---

## 13.3. Export tenant audit logs

Endpoint:

```text
GET /api/v1/tenant/audit-logs/export
```

| ID                  | Caso                               | Resultado esperado |
| ------------------- | ---------------------------------- | ------------------ |
| API-AUD-TEN-EXP-001 | Export JSON autorizado             | 200                |
| API-AUD-TEN-EXP-002 | Export CSV autorizado              | 200                |
| API-AUD-TEN-EXP-003 | Export sin permiso                 | 403                |
| API-AUD-TEN-EXP-004 | Formato inválido                   | 422                |
| API-AUD-TEN-EXP-005 | Export demasiado grande            | 422                |
| API-AUD-TEN-EXP-006 | Export genera audit.exported       | pasa               |
| API-AUD-TEN-EXP-007 | CSV neutraliza fórmulas            | pasa               |
| API-AUD-TEN-EXP-008 | Export no incluye eventos Tenant B | pasa               |

---

# 14. Pruebas API — Resource Audit

Endpoint:

```text
GET /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
```

| ID              | Caso                            | Resultado esperado |
| --------------- | ------------------------------- | ------------------ |
| API-AUD-RES-001 | Recurso payment propio          | 200                |
| API-AUD-RES-002 | Recurso accountStatement propio | 200                |
| API-AUD-RES-003 | Recurso de otro tenant          | 403/404            |
| API-AUD-RES-004 | resourceType no soportado       | 422                |
| API-AUD-RES-005 | resourceId malformado           | 422                |
| API-AUD-RES-006 | Sin permiso audit.read          | 403                |
| API-AUD-RES-007 | Categoría financial sin permiso | 403                |
| API-AUD-RES-008 | Paginación                      | correcto           |
| API-AUD-RES-009 | Filtro por action               | correcto           |

---

# 15. Pruebas API — Platform Audit

## 15.1. List platform audit logs

Endpoint:

```text
GET /api/v1/platform/audit-logs
```

| ID                    | Caso                            | Resultado esperado    |
| --------------------- | ------------------------------- | --------------------- |
| API-AUD-PLAT-LIST-001 | PlatformAdmin lista eventos     | 200                   |
| API-AUD-PLAT-LIST-002 | TenantAdmin intenta platform    | 403                   |
| API-AUD-PLAT-LIST-003 | Sin token                       | 401                   |
| API-AUD-PLAT-LIST-004 | Sin audit.platform.read         | 403                   |
| API-AUD-PLAT-LIST-005 | Filtro por tenantId con permiso | correcto              |
| API-AUD-PLAT-LIST-006 | includePlatformEvents true      | incluye tenantId null |
| API-AUD-PLAT-LIST-007 | Sensitive sin permiso           | oculto o 403          |
| API-AUD-PLAT-LIST-008 | Paginación                      | correcto              |

---

## 15.2. Get platform audit log

Endpoint:

```text
GET /api/v1/platform/audit-logs/{auditLogId}
```

| ID                   | Caso                        | Resultado esperado   |
| -------------------- | --------------------------- | -------------------- |
| API-AUD-PLAT-GET-001 | Platform log válido         | 200                  |
| API-AUD-PLAT-GET-002 | Sensitive sin readSensitive | 403 o campos ocultos |
| API-AUD-PLAT-GET-003 | Audit log inexistente       | 404                  |
| API-AUD-PLAT-GET-004 | Usuario tenant              | 403                  |

---

## 15.3. Export platform audit logs

Endpoint:

```text
GET /api/v1/platform/audit-logs/export
```

| ID                   | Caso                                 | Resultado esperado   |
| -------------------- | ------------------------------------ | -------------------- |
| API-AUD-PLAT-EXP-001 | Export JSON platform                 | 200                  |
| API-AUD-PLAT-EXP-002 | Export CSV platform                  | 200                  |
| API-AUD-PLAT-EXP-003 | Sin audit.platform.export            | 403                  |
| API-AUD-PLAT-EXP-004 | Sensitive sin permiso                | 403 o campos ocultos |
| API-AUD-PLAT-EXP-005 | Export genera audit.platformExported | pasa                 |
| API-AUD-PLAT-EXP-006 | CSV neutraliza fórmulas              | pasa                 |

---

# 16. Pruebas de autorización

## 16.1. Tenant authorization

| ID           | Usuario               | Permiso             | Endpoint          | Resultado |
| ------------ | --------------------- | ------------------- | ----------------- | --------- |
| AUTH-AUD-001 | tenantAdminA          | audit.read          | GET tenant audit  | 200       |
| AUTH-AUD-002 | tenantAuditorA        | audit.read          | GET tenant audit  | 200       |
| AUTH-AUD-003 | treasurerA            | audit.readFinancial | category payments | 200       |
| AUTH-AUD-004 | userWithoutPermission | ninguno             | GET tenant audit  | 403       |
| AUTH-AUD-005 | anonymous             | ninguno             | GET tenant audit  | 401       |
| AUTH-AUD-006 | disabledUser          | audit.read          | GET tenant audit  | 403       |
| AUTH-AUD-007 | userWithoutMembership | audit.read          | GET tenant audit  | 403       |

---

## 16.2. Category permissions

| ID               | Categoría         | Permiso requerido      | Sin permiso | Con permiso |
| ---------------- | ----------------- | ---------------------- | ----------- | ----------- |
| AUTH-AUD-CAT-001 | financial         | audit.readFinancial    | 403         | 200         |
| AUTH-AUD-CAT-002 | payments          | audit.readFinancial    | 403         | 200         |
| AUTH-AUD-CAT-003 | accountStatements | audit.readFinancial    | 403         | 200         |
| AUTH-AUD-CAT-004 | access            | audit.readAccess       | 403         | 200         |
| AUTH-AUD-CAT-005 | security          | audit.readSecurity     | 403         | 200         |
| AUTH-AUD-CAT-006 | personalData      | audit.readPersonalData | 403         | 200         |

---

## 16.3. Platform authorization

| ID                | Usuario                    | Permiso               | Endpoint           | Resultado          |
| ----------------- | -------------------------- | --------------------- | ------------------ | ------------------ |
| AUTH-AUD-PLAT-001 | platformAdmin              | audit.platform.read   | GET platform audit | 200                |
| AUTH-AUD-PLAT-002 | platformAdmin              | audit.platform.export | export platform    | 200                |
| AUTH-AUD-PLAT-003 | tenantAdminA               | ninguno platform      | GET platform audit | 403                |
| AUTH-AUD-PLAT-004 | platformUser sin sensitive | no readSensitive      | sensitive detail   | 403/campos ocultos |
| AUTH-AUD-PLAT-005 | platformUser sensitive     | readSensitive         | sensitive detail   | 200                |

---

## 16.4. Separation of duties

| ID               | Caso                                                      | Resultado esperado |
| ---------------- | --------------------------------------------------------- | ------------------ |
| AUTH-AUD-SOD-001 | audit.read no exporta                                     | 403                |
| AUTH-AUD-SOD-002 | audit.export sin audit.readFinancial no exporta financial | 403/excluye        |
| AUTH-AUD-SOD-003 | audit.readFinancial no implica audit.export               | 403                |
| AUTH-AUD-SOD-004 | audit.platform.read no implica audit.platform.export      | 403                |
| AUTH-AUD-SOD-005 | audit.read no implica audit.readPersonalData              | 403                |

---

# 17. Pruebas multitenant

| ID | Caso | Resultado esperado |
|---|---|
| MT-AUD-001 | Tenant A no lista eventos Tenant B | pasa |
| MT-AUD-002 | Tenant A no consulta detalle Tenant B | 403/404 |
| MT-AUD-003 | Tenant A no consulta recurso Tenant B | 403/404 |
| MT-AUD-004 | Tenant A export no incluye Tenant B | pasa |
| MT-AUD-005 | Tenant A filtro resourceId de B no devuelve datos | 403/404 |
| MT-AUD-006 | Tenant A filtro actorUserId de B no filtra fuera del tenant | vacío |
| MT-AUD-007 | Platform con permiso puede filtrar tenant A | 200 |
| MT-AUD-008 | Platform sin sensitive no ve tenant sensitive | 403/oculto |
| MT-AUD-009 | Audit log platform tenantId null no aparece en tenant query | pasa |
| MT-AUD-010 | Eventos con tenantId null solo aparecen en platform | pasa |

---

# 18. Pruebas de sanitización

| ID          | Caso                                       | Resultado esperado  |
| ----------- | ------------------------------------------ | ------------------- |
| SAN-AUD-001 | oldValue con password                      | `[REDACTED]`        |
| SAN-AUD-002 | newValue con passwordHash                  | `[REDACTED]`        |
| SAN-AUD-003 | metadata con accessToken                   | `[REDACTED]`        |
| SAN-AUD-004 | metadata con refreshToken                  | `[REDACTED]`        |
| SAN-AUD-005 | metadata con authorization                 | `[REDACTED]`        |
| SAN-AUD-006 | metadata con cookie                        | `[REDACTED]`        |
| SAN-AUD-007 | metadata con apiKey                        | `[REDACTED]`        |
| SAN-AUD-008 | metadata con privateKey                    | `[REDACTED]`        |
| SAN-AUD-009 | metadata con fileContent                   | `[REDACTED]`        |
| SAN-AUD-010 | metadata con receiptContent                | `[REDACTED]`        |
| SAN-AUD-011 | metadata con rawBody                       | `[REDACTED]`        |
| SAN-AUD-012 | metadata con payload completo              | rechazado/redactado |
| SAN-AUD-013 | metadata excesiva                          | truncada/rechazada  |
| SAN-AUD-014 | profundidad excesiva                       | truncada            |
| SAN-AUD-015 | campos permitidos financieros se conservan | válido              |

---

# 19. Pruebas de exportación

| ID          | Caso                                          | Resultado esperado |
| ----------- | --------------------------------------------- | ------------------ |
| EXP-AUD-001 | Export tenant JSON                            | válido             |
| EXP-AUD-002 | Export tenant CSV                             | válido             |
| EXP-AUD-003 | Export platform JSON                          | válido             |
| EXP-AUD-004 | Export platform CSV                           | válido             |
| EXP-AUD-005 | Formato inválido                              | 422                |
| EXP-AUD-006 | Export sin permiso                            | 403                |
| EXP-AUD-007 | Export excede límite                          | 422                |
| EXP-AUD-008 | Export audita audit.exported                  | pasa               |
| EXP-AUD-009 | Platform export audita audit.platformExported | pasa               |
| EXP-AUD-010 | CSV neutraliza fórmula `=cmd`                 | pasa               |
| EXP-AUD-011 | CSV neutraliza `+SUM()`                       | pasa               |
| EXP-AUD-012 | CSV neutraliza `-10+20`                       | pasa               |
| EXP-AUD-013 | CSV neutraliza `@HYPERLINK`                   | pasa               |
| EXP-AUD-014 | Export no contiene tokens                     | pasa               |
| EXP-AUD-015 | Export no contiene payload completo           | pasa               |

---

# 20. Pruebas append-only

| ID             | Caso                                                     | Resultado esperado |
| -------------- | -------------------------------------------------------- | ------------------ |
| APPEND-AUD-001 | No existe endpoint PUT audit log                         | pasa               |
| APPEND-AUD-002 | No existe endpoint PATCH audit log                       | pasa               |
| APPEND-AUD-003 | No existe endpoint DELETE audit log                      | pasa               |
| APPEND-AUD-004 | Repositorio público no expone update                     | pasa               |
| APPEND-AUD-005 | Repositorio público no expone delete                     | pasa               |
| APPEND-AUD-006 | Corrección se registra como nuevo evento                 | pasa               |
| APPEND-AUD-007 | FK onDelete Restrict evita borrado dependiente peligroso | pasa               |

---

# 21. Pruebas de integración con módulos 001 a 006

## 21.1. Tenants

| ID              | Evento                          | Resultado esperado |
| --------------- | ------------------------------- | ------------------ |
| MOD-AUD-001-001 | tenant.created                  | audit log creado   |
| MOD-AUD-001-002 | tenant.activated                | audit log creado   |
| MOD-AUD-001-003 | tenant.suspended                | audit log warning  |
| MOD-AUD-001-004 | tenant.configuration.updated    | old/new sanitizado |
| MOD-AUD-001-005 | tenant.wordpressMapping.updated | audit log creado   |

---

## 21.2. Users, roles and permissions

| ID              | Evento              | Resultado esperado |
| --------------- | ------------------- | ------------------ |
| MOD-AUD-002-001 | user.created        | audit log creado   |
| MOD-AUD-002-002 | user.disabled       | audit log warning  |
| MOD-AUD-002-003 | role.assigned       | audit log access   |
| MOD-AUD-002-004 | role.removed        | audit log access   |
| MOD-AUD-002-005 | permission.granted  | audit log warning  |
| MOD-AUD-002-006 | permission.revoked  | audit log warning  |
| MOD-AUD-002-007 | invitation.accepted | audit log creado   |
| MOD-AUD-002-008 | membership.revoked  | audit log warning  |

---

## 21.3. Residents and properties

| ID              | Evento               | Resultado esperado |
| --------------- | -------------------- | ------------------ |
| MOD-AUD-003-001 | person.created       | personalData audit |
| MOD-AUD-003-002 | person.updated       | old/new sanitizado |
| MOD-AUD-003-003 | propertyUnit.updated | audit log creado   |
| MOD-AUD-003-004 | ownership.created    | audit log creado   |
| MOD-AUD-003-005 | residency.ended      | audit log creado   |
| MOD-AUD-003-006 | lease.ended          | audit log creado   |

---

## 21.4. Dues and fees

| ID              | Evento               | Resultado esperado |
| --------------- | -------------------- | ------------------ |
| MOD-AUD-004-001 | charge.created       | financial audit    |
| MOD-AUD-004-002 | charges.generated    | batch metadata     |
| MOD-AUD-004-003 | charge.adjusted      | old/new amount     |
| MOD-AUD-004-004 | charge.reversed      | warning            |
| MOD-AUD-004-005 | billingPeriod.closed | audit log          |
| MOD-AUD-004-006 | billingPeriod.locked | warning            |

---

## 21.5. Payments

| ID              | Evento                     | Resultado esperado  |
| --------------- | -------------------------- | ------------------- |
| MOD-AUD-005-001 | payment.created            | payments audit      |
| MOD-AUD-005-002 | payment.reported           | payments audit      |
| MOD-AUD-005-003 | payment.confirmed          | old/new status      |
| MOD-AUD-005-004 | payment.rejected           | reason sanitizado   |
| MOD-AUD-005-005 | payment.allocated          | allocation metadata |
| MOD-AUD-005-006 | payment.reversed           | warning             |
| MOD-AUD-005-007 | paymentReceipt.downloaded  | audit log           |
| MOD-AUD-005-008 | paymentAllocation.reversed | warning             |

---

## 21.6. Account statements

| ID              | Evento                          | Resultado esperado      |
| --------------- | ------------------------------- | ----------------------- |
| MOD-AUD-006-001 | accountStatement.generated      | accountStatements audit |
| MOD-AUD-006-002 | accountStatement.batchGenerated | batch counts            |
| MOD-AUD-006-003 | accountStatement.published      | audit log               |
| MOD-AUD-006-004 | accountStatement.closed         | reason                  |
| MOD-AUD-006-005 | accountStatement.locked         | warning                 |
| MOD-AUD-006-006 | accountStatement.regenerated    | warning                 |
| MOD-AUD-006-007 | accountStatement.exported       | export audit            |
| MOD-AUD-006-008 | balance.recalculated            | audit log               |

---

# 22. Pruebas de accesos denegados críticos

| ID           | Caso                          | Evento esperado                  |
| ------------ | ----------------------------- | -------------------------------- |
| DENY-AUD-001 | Cross-tenant statement access | crossTenant.accessDenied         |
| DENY-AUD-002 | Payment reverse sin permiso   | permission.denied                |
| DENY-AUD-003 | Audit export sin permiso      | audit.accessDenied               |
| DENY-AUD-004 | Platform audit sin permiso    | audit.platformAccessDenied       |
| DENY-AUD-005 | Own resource ajeno            | access.denied o ownAccess.denied |
| DENY-AUD-006 | Role assignment sin permiso   | permission.denied                |
| DENY-AUD-007 | Tenant suspended operation    | access.denied                    |

---

# 23. Pruebas de observabilidad

| ID          | Caso                                    | Resultado esperado                                  |
| ----------- | --------------------------------------- | --------------------------------------------------- |
| OBS-AUD-001 | Audit log creado                        | métrica audit_logs_created_total incrementa         |
| OBS-AUD-002 | Falla escritura audit                   | audit_logs_failed_total incrementa                  |
| OBS-AUD-003 | Consulta audit                          | audit_logs_query_total incrementa                   |
| OBS-AUD-004 | Export audit                            | audit_logs_export_total incrementa                  |
| OBS-AUD-005 | Access denied                           | audit_logs_access_denied_total incrementa           |
| OBS-AUD-006 | Sanitización redacted                   | audit_sanitization_redacted_fields_total incrementa |
| OBS-AUD-007 | Logs contienen traceId                  | pasa                                                |
| OBS-AUD-008 | Logs no contienen payload completo      | pasa                                                |
| OBS-AUD-009 | Métricas no usan actorUserId como label | pasa                                                |
| OBS-AUD-010 | Métricas no usan resourceId como label  | pasa                                                |

---

# 24. Pruebas OpenAPI

| ID           | Caso                                       | Resultado esperado |
| ------------ | ------------------------------------------ | ------------------ |
| OAPI-AUD-001 | Tenant Audit API documentada               | pasa               |
| OAPI-AUD-002 | Resource Audit API documentada             | pasa               |
| OAPI-AUD-003 | Platform Audit API documentada             | pasa               |
| OAPI-AUD-004 | Export endpoints documentados              | pasa               |
| OAPI-AUD-005 | Security schemes incluidos                 | pasa               |
| OAPI-AUD-006 | Permisos `x-required-permission` incluidos | pasa               |
| OAPI-AUD-007 | Categorías sensibles documentadas          | pasa               |
| OAPI-AUD-008 | Errores documentados                       | pasa               |
| OAPI-AUD-009 | Paginación documentada                     | pasa               |
| OAPI-AUD-010 | CSV export documentado                     | pasa               |
| OAPI-AUD-011 | No documenta endpoints update/delete       | pasa               |

---

# 25. Smoke tests

Smoke tests post-deploy:

| ID            | Caso                                        | Resultado esperado |
| ------------- | ------------------------------------------- | ------------------ |
| SMOKE-AUD-001 | `GET /api/v1/health`                        | 200                |
| SMOKE-AUD-002 | `GET /api/v1/tenant/audit-logs` sin token   | 401                |
| SMOKE-AUD-003 | `GET /api/v1/platform/audit-logs` sin token | 401                |
| SMOKE-AUD-004 | Usuario autorizado lista audit logs tenant  | 200                |
| SMOKE-AUD-005 | Usuario sin permiso recibe 403              | 403                |
| SMOKE-AUD-006 | Usuario tenant no accede a platform audit   | 403                |
| SMOKE-AUD-007 | Error contiene traceId                      | pasa               |

No ejecutar exportaciones masivas ni generación de datos reales como smoke test ordinario.

---

# 26. Organización de archivos de prueba

```text
apps/api/src/modules/audit/tests/
├── unit/
│   ├── audit-action.vo.spec.ts
│   ├── audit-category.vo.spec.ts
│   ├── audit-severity.vo.spec.ts
│   ├── audit-outcome.vo.spec.ts
│   ├── audit-actor-type.vo.spec.ts
│   ├── audit-export-format.vo.spec.ts
│   ├── audit-log.entity.spec.ts
│   ├── audit-event.entity.spec.ts
│   ├── audit-actor.entity.spec.ts
│   ├── audit-resource.entity.spec.ts
│   └── audit-context.entity.spec.ts
│
├── application/
│   ├── audit-sanitizer.service.spec.ts
│   ├── audit-metadata-validator.service.spec.ts
│   ├── audit-event-builder.service.spec.ts
│   ├── audit.service.spec.ts
│   ├── audit-query.service.spec.ts
│   ├── audit-permission-policy.service.spec.ts
│   ├── audit-category-policy.service.spec.ts
│   ├── audit-export.service.spec.ts
│   ├── write-audit-log.use-case.spec.ts
│   ├── list-tenant-audit-logs.use-case.spec.ts
│   ├── get-tenant-audit-log.use-case.spec.ts
│   ├── list-resource-audit-logs.use-case.spec.ts
│   ├── export-tenant-audit-logs.use-case.spec.ts
│   ├── list-platform-audit-logs.use-case.spec.ts
│   └── export-platform-audit-logs.use-case.spec.ts
│
├── integration/
│   ├── 007-create-audit-logs.migration.spec.ts
│   ├── audit.repository.integration.spec.ts
│   ├── audit.seeds.integration.spec.ts
│   ├── audit-001-tenants.integration.spec.ts
│   ├── audit-002-users-roles.integration.spec.ts
│   ├── audit-003-residents-properties.integration.spec.ts
│   ├── audit-004-dues-fees.integration.spec.ts
│   ├── audit-005-payments.integration.spec.ts
│   └── audit-006-account-statements.integration.spec.ts
│
├── api/
│   ├── tenant-audit-logs.api.spec.ts
│   ├── resource-audit-logs.api.spec.ts
│   ├── platform-audit-logs.api.spec.ts
│   └── audit-export.api.spec.ts
│
├── authorization/
│   ├── audit.authorization.spec.ts
│   ├── audit-category.authorization.spec.ts
│   └── audit-platform.authorization.spec.ts
│
├── multitenancy/
│   └── audit.multitenancy.spec.ts
│
├── sanitization/
│   ├── audit-sanitization.spec.ts
│   └── audit-metadata-size.spec.ts
│
├── export/
│   ├── audit-export.spec.ts
│   └── audit-csv-injection.spec.ts
│
├── security/
│   ├── audit-append-only.security.spec.ts
│   ├── audit-denied-events.security.spec.ts
│   └── audit-logging.security.spec.ts
│
└── openapi/
    └── audit.openapi.spec.ts
```

---

# 27. Comandos esperados

Comandos específicos sugeridos:

```bash
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

Comandos generales:

```bash
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

# 28. Requisitos para CI

En pull request deben correr como mínimo:

```text
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

Antes de producción:

```text
full audit test suite
migration tests
seed tests
platform authorization tests
financial audit integration tests
access audit integration tests
security denied tests
CSV injection tests
observability tests
smoke tests staging
```

---

# 29. Gates de calidad

No se permite merge si falla:

* sanitización de secretos;
* tenant isolation;
* platform authorization;
* category permission;
* export authorization;
* append-only behavior;
* no update/delete endpoints;
* CSV injection protection;
* AuditLog action/category/outcome required;
* traceId propagation para HTTP;
* financial audit events;
* access audit events;
* OpenAPI validation.

---

# 30. Matriz de trazabilidad

| Requisito                           | Pruebas asociadas                |
| ----------------------------------- | -------------------------------- |
| FR-001 Registrar evento             | APP-AUD-WRITE, INT-AUD-REPO      |
| FR-002 Eventos tenant-scoped        | APP-AUD-WRITE, MT-AUD            |
| FR-003 Eventos platform-level       | APP-AUD-PLAT, API-AUD-PLAT       |
| FR-004 Registrar actor              | UT-AUD-ACTOR, APP-AUD-WRITE      |
| FR-005 Registrar recurso            | UT-AUD-RES, APP-AUD-RES          |
| FR-006 oldValue/newValue            | SAN-AUD, API-AUD-TEN-GET         |
| FR-007 Registrar outcome            | UT-AUD-OUT, INT-AUD-MIG          |
| FR-008 Trazabilidad                 | OBS-AUD, API-AUD                 |
| FR-009 Sanitizar datos              | SAN-AUD                          |
| FR-010 Consulta tenant              | API-AUD-TEN                      |
| FR-011 Consulta platform            | API-AUD-PLAT                     |
| FR-012 Auditoría por recurso        | API-AUD-RES                      |
| FR-013 Filtrar auditoría            | APP-AUD-LIST, API-AUD-TEN        |
| FR-014 Exportar auditoría           | EXP-AUD                          |
| FR-015 Auditar exportaciones        | EXP-AUD-008, EXP-AUD-009         |
| FR-016 Proteger contra modificación | APPEND-AUD                       |
| FR-017 Accesos denegados críticos   | DENY-AUD                         |
| FR-018 Eventos financieros          | MOD-AUD-004/005/006              |
| FR-019 Cambios de acceso            | MOD-AUD-002                      |
| FR-020 Puerto interno               | APP-AUD-WRITE, integration tests |

---

# 31. Riesgos cubiertos

| Riesgo                       | Pruebas                   |
| ---------------------------- | ------------------------- |
| Auditoría incompleta         | MOD-AUD, DENY-AUD         |
| Auditoría con secretos       | SAN-AUD                   |
| Auditoría cross-tenant       | MT-AUD                    |
| Auditoría manipulable        | APPEND-AUD                |
| Exportación sin permiso      | EXP-AUD, AUTH-AUD         |
| Eventos financieros omitidos | MOD-AUD-004/005/006       |
| Cambios de permisos omitidos | MOD-AUD-002               |
| Platform access indebido     | AUTH-AUD-PLAT             |
| CSV injection                | EXP-AUD-010 a EXP-AUD-013 |
| Payloads excesivos           | SRV-AUD-META              |
| Recursión audit.exported     | SRV-AUD-SVC-007           |

---

# 32. Criterios de salida

El módulo `007-audit` puede considerarse probado si:

* todas las pruebas unitarias pasan;
* pruebas de sanitizer pasan;
* pruebas de metadata validator pasan;
* pruebas de entidades pasan;
* pruebas de casos de uso pasan;
* migración validada;
* seeds idempotentes;
* repositorio validado;
* API tenant validada;
* API resource validada;
* API platform validada;
* exportación validada;
* autorización validada;
* permisos por categoría validados;
* multitenancy validado;
* append-only behavior validado;
* integración con `001` a `006` validada;
* eventos financieros críticos auditados;
* cambios de acceso auditados;
* accesos denegados críticos auditados;
* logs sanitizados;
* métricas básicas validadas;
* OpenAPI actualizado;
* smoke tests pasan;
* no hay secretos en audit logs;
* no hay payloads completos en audit logs;
* no hay endpoint update/delete de AuditLog;
* no hay consulta cross-tenant;
* no hay exportación sin permiso.

---

# 33. Pendientes controlados

Pendientes aceptados para esta spec:

```text
- SIEM externo diferido.
- WORM storage diferido.
- Hash encadenado avanzado diferido.
- Firma criptográfica diferida.
- Legal hold avanzado diferido.
- Retención legal avanzada diferida.
- Machine learning de anomalías diferido.
- Alertas automáticas diferidas.
- Dashboards GRC diferidos.
- Gestión completa de incidentes diferida.
- Outbox transaccional completo diferido si no entra al MVP.
```

Estos pendientes no bloquean `007-audit`.

---

## 34. Decisión final del test plan

El módulo `007-audit` deberá probarse con unit tests, application tests, sanitizer tests, metadata validator tests, integration tests, API tests, authorization tests, platform authorization tests, category permission tests, multitenancy tests, export tests, CSV injection tests, append-only tests, financial audit tests, access audit tests, security audit tests, observability tests, OpenAPI tests y smoke tests.

Las pruebas se enfocarán especialmente en:

```text
- registro obligatorio de eventos críticos;
- tenant isolation;
- platform isolation;
- permisos de auditoría;
- permisos por categoría sensible;
- sanitización de secretos;
- bloqueo de payloads completos;
- oldValue/newValue sanitizados;
- metadata sanitizada;
- traceId propagation;
- exportación controlada;
- auditoría de exportaciones;
- append-only behavior;
- ausencia de update/delete ordinario;
- eventos financieros de 004/005/006;
- eventos de acceso de 002;
- accesos denegados críticos;
- CSV injection protection;
- OpenAPI consistente.
```

Ninguna implementación debe aceptarse si permite consultar auditoría de otro tenant, consultar platform audit sin permiso, exportar auditoría sin permiso, almacenar tokens o contraseñas, guardar payloads completos, omitir eventos financieros críticos, omitir cambios de permisos, permitir modificación ordinaria de AuditLog o exponer datos sensibles en logs, exports o responses.
