# Security Notes — Spec 007 Audit, Traceability and Compliance Events

## 1. Información del documento

| Campo           | Valor                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                           |
| Spec ID         | 007                                                                                                                     |
| Módulo          | Audit                                                                                                                   |
| Documento       | Security Notes                                                                                                          |
| Ruta            | `docs/specs/007-audit/security-notes.md`                                                                                |
| Versión         | 0.1                                                                                                                     |
| Estado          | Borrador inicial                                                                                                        |
| Fecha           | 2026-07-14                                                                                                              |
| Documento base  | `docs/specs/007-audit/spec.md`                                                                                          |
| Plan técnico    | `docs/specs/007-audit/plan.md`                                                                                          |
| Modelo de datos | `docs/specs/007-audit/data-model.md`                                                                                    |
| Contrato API    | `docs/specs/007-audit/api-contract.md`                                                                                  |
| Plan de pruebas | `docs/specs/007-audit/test-plan.md`                                                                                     |
| Tareas          | `docs/specs/007-audit/tasks.md`                                                                                         |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `007-audit`.

El módulo Audit es transversal a todo RESIDENT Core y debe registrar evidencia de acciones críticas relacionadas con:

* tenants;
* usuarios;
* roles;
* permisos;
* membresías;
* residentes;
* propietarios;
* unidades habitacionales;
* cargos;
* pagos;
* comprobantes;
* asignaciones;
* reversos;
* estados de cuenta;
* balances;
* exportaciones;
* accesos denegados;
* intentos cross-tenant;
* acciones platform;
* jobs internos;
* integraciones futuras.

Regla central:

```text id="ez68sp"
La auditoría debe registrar evidencia suficiente para reconstruir acciones críticas sin convertirse en un repositorio de secretos, payloads completos, comprobantes, datos personales innecesarios o información de otros tenants.
```

---

## 3. Naturaleza crítica del módulo

El módulo `007-audit` es crítico porque sirve como evidencia funcional, financiera, operativa y de seguridad.

Una falla en este módulo puede provocar:

* pérdida de trazabilidad;
* imposibilidad de investigar incidentes;
* imposibilidad de reconstruir decisiones administrativas;
* falta de evidencia sobre pagos, cargos o reversos;
* falta de evidencia sobre cambios de permisos;
* exposición de información sensible;
* fuga cross-tenant;
* manipulación o eliminación de eventos;
* incumplimiento futuro de políticas internas o regulatorias;
* debilitamiento del no repudio operativo.

Por lo tanto:

```text id="b9t41e"
AuditLog no es un log técnico ordinario; es evidencia funcional protegida.
```

---

## 4. Principios de seguridad

### 4.1. Append-only por defecto

La auditoría debe comportarse como append-only en operación normal.

Permitido:

```text id="vyc893"
INSERT
consulta autorizada
exportación autorizada
archivado lógico futuro bajo política formal
```

No permitido en API ordinaria:

```text id="alceol"
UPDATE audit log
DELETE audit log
PATCH audit log
truncate audit logs
edición manual de oldValue/newValue
edición manual de metadata
```

Regla:

```text id="eyn85g"
Las correcciones de auditoría deben realizarse mediante nuevos eventos, no modificando eventos anteriores.
```

---

### 4.2. Tenant isolation obligatorio

Todo evento tenant-scoped debe tener `tenantId`.

Regla:

```text id="nj6tnq"
Un usuario de Tenant A nunca debe consultar, exportar ni inferir eventos de Tenant B.
```

Excepción:

```text id="ljb7zv"
Los eventos platform-level pueden tener tenantId null únicamente si la acción realmente no pertenece a un tenant específico.
```

---

### 4.3. Platform scope separado

La auditoría platform debe estar separada de la auditoría tenant.

Regla:

```text id="en34r6"
Los endpoints platform requieren permisos platform explícitos y no deben estar disponibles para usuarios tenant ordinarios.
```

---

### 4.4. Sanitización antes de persistir

Todo `oldValue`, `newValue` y `metadata` debe pasar por sanitización antes de guardarse.

Regla:

```text id="dqs8gt"
La sanitización no es una mejora opcional; es una condición previa para persistir AuditLog.
```

---

### 4.5. Mínimo dato suficiente

La auditoría debe registrar lo necesario para investigar, pero no más.

Ejemplo válido:

```json id="kbj0jm"
{
  "oldValue": {
    "status": "pendingValidation"
  },
  "newValue": {
    "status": "confirmed"
  },
  "metadata": {
    "amount": "100.00",
    "currency": "USD"
  }
}
```

Ejemplo prohibido:

```json id="jny4nx"
{
  "rawBody": "{ payload completo del request }",
  "authorization": "Bearer eyJ...",
  "receiptContent": "archivo completo en base64"
}
```

---

### 4.6. Separación entre logs técnicos y auditoría

Los logs técnicos ayudan a diagnosticar.

La auditoría ayuda a reconstruir acciones.

Regla:

```text id="z1yo2z"
Los logs técnicos no sustituyen AuditLog, y AuditLog no debe usarse como log técnico verboso.
```

---

### 4.7. Auditoría de exportaciones

Toda exportación de auditoría debe auditarse.

Eventos:

```text id="ngstrm"
audit.exported
audit.platformExported
```

Regla:

```text id="o74bv1"
La acción de exportar auditoría también es una acción auditable.
```

---

### 4.8. Protección anti-recursión

Auditar la auditoría puede generar recursión.

Regla:

```text id="lvras8"
audit.exported debe registrarse una sola vez por operación de exportación y no debe disparar recursión infinita.
```

---

## 5. Activos protegidos

Activos principales:

```text id="rw5smn"
audit_logs
audit export responses
oldValue sanitizado
newValue sanitizado
metadata sanitizada
traceId
requestId
correlationId
actorUserId
resourceType
resourceId
tenantId
```

Activos derivados:

```text id="mwgpjy"
evidencia financiera
evidencia de cambios de acceso
evidencia de cambios administrativos
evidencia de intentos denegados
evidencia de exportaciones
evidencia de acciones platform
```

Activos relacionados:

```text id="fsdr3n"
tenants
user_profiles
memberships
roles
permissions
persons
property_units
charges
payments
payment_receipts
payment_allocations
account_statements
unit_balances
```

---

## 6. Datos sensibles

### 6.1. Datos sensibles directos

Nunca deben almacenarse en auditoría:

```text id="vzi491"
password
passwordHash
accessToken
refreshToken
idToken
authorization header
cookie completa
secret
clientSecret
apiKey completa
privateKey
cardNumber
cvv
cvc
bankAccountNumber completo
fileContent
receiptContent
documentContent
rawBody
payload completo
response completo
stack trace completo
SQL completo
```

---

### 6.2. Datos sensibles indirectos

Deben tratarse con cuidado:

```text id="hp7mpn"
actorUserId
actorDisplayName
resourceDisplay
propertyUnitId
paymentId
chargeId
statementId
amount
currency
reason
ipAddress
userAgent
oldValue
newValue
metadata
```

Estos campos son permitidos solo si están justificados, minimizados y sanitizados.

---

### 6.3. Datos personales

Eventos `personalData` pueden incluir referencias a:

* personas;
* propietarios;
* residentes;
* arrendatarios;
* contactos de emergencia;
* vehículos;
* mascotas;
* relaciones con unidades.

Regla:

```text id="kl60bn"
Los eventos personalData deben registrar cambios relevantes sin copiar datos personales completos innecesarios.
```

---

### 6.4. Datos financieros

Eventos financieros pueden incluir:

* monto;
* moneda;
* estado anterior;
* estado nuevo;
* cargo;
* pago;
* asignación;
* reverso;
* estado de cuenta;
* unidad;
* periodo.

Regla:

```text id="zaw7xk"
Los montos financieros deben registrarse como string decimal y nunca como float.
```

---

## 7. Superficies de ataque

### 7.1. Tenant Audit API

Rutas:

```text id="k81708"
/api/v1/tenant/audit-logs
/api/v1/tenant/audit-logs/{auditLogId}
```

Riesgos:

* consultar auditoría de otro tenant;
* consultar categorías sensibles sin permiso;
* inferir existencia de recursos ajenos;
* exponer oldValue/newValue a usuarios no autorizados;
* filtrar por actor de otro tenant;
* abuso de consultas amplias.

Controles:

* `AuthGuard`;
* `TenantGuard`;
* `TenantPermissionGuard`;
* filtros por `tenantId`;
* `AuditCategoryPolicyService`;
* paginación;
* rate limiting;
* response sanitizado.

---

### 7.2. Resource Audit API

Ruta:

```text id="e3tmb3"
/api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
```

Riesgos:

* consultar recurso de otro tenant;
* enumerar recursos;
* usar `resourceType` arbitrario;
* saltar validación de pertenencia;
* exponer eventos sensibles de un recurso financiero.

Controles:

* `TenantResourceResolverPort`;
* catálogo de `resourceType`;
* validación de `resourceId`;
* validación de tenant;
* permisos por categoría;
* 403/404 controlado.

---

### 7.3. Platform Audit API

Rutas:

```text id="mxt1cn"
/api/v1/platform/audit-logs
/api/v1/platform/audit-logs/{auditLogId}
```

Riesgos:

* usuario tenant accede a auditoría platform;
* PlatformAdmin accede a datos sensibles sin permiso adicional;
* soporte platform ve auditoría financiera sin justificación;
* consulta masiva de todos los tenants;
* exportación excesiva.

Controles:

* `PlatformAuditPermissionGuard`;
* `audit.platform.read`;
* `audit.platform.readSensitive`;
* filtros obligatorios en consultas amplias;
* auditoría de consultas sensibles;
* rate limiting.

---

### 7.4. Audit Export API

Rutas:

```text id="k0gfoj"
/api/v1/tenant/audit-logs/export
/api/v1/platform/audit-logs/export
```

Riesgos:

* exportación sin permiso;
* exportación cross-tenant;
* exportación de secretos;
* exportación de categorías no autorizadas;
* CSV injection;
* logs con export completo;
* exportaciones demasiado grandes.

Controles:

* `audit.export`;
* `audit.platform.export`;
* permisos de categoría;
* límite de filas;
* sanitización;
* CSV escaping;
* auditoría `audit.exported`;
* no loggear contenido completo.

---

### 7.5. AuditWriterPort

Riesgos:

* módulos productores envían payloads completos;
* módulos productores omiten tenantId;
* módulos productores envían tokens accidentalmente;
* eventos críticos se registran como best-effort;
* eventos se duplican;
* eventos quedan sin `traceId`.

Controles:

* `AuditSanitizerService`;
* `AuditMetadataValidatorService`;
* `AuditEventBuilderService`;
* validación de evento;
* `writeCritical` para finanzas/acceso;
* tests de integración por módulo;
* contratos claros para productores.

---

## 8. Amenazas principales

## 8.1. Auditoría incompleta

### Descripción

Una operación crítica ocurre sin registrar evento auditable.

### Impacto

Alto o crítico.

### Ejemplos

```text id="hf1ivv"
payment.reversed sin audit log
permission.granted sin audit log
accountStatement.regenerated sin audit log
tenant.suspended sin audit log
```

### Controles

* matriz de eventos obligatorios;
* `AuditWriterPort`;
* tests de integración con módulos `001` a `006`;
* gates CI;
* revisión SDD.

### Pruebas asociadas

```text id="fmkt2e"
MOD-AUD-001
MOD-AUD-002
MOD-AUD-003
MOD-AUD-004
MOD-AUD-005
MOD-AUD-006
```

---

## 8.2. Auditoría con secretos

### Descripción

Un evento almacena tokens, contraseñas, cookies, API keys o secretos.

### Impacto

Crítico.

### Controles

* sanitización recursiva;
* redacción por nombre de campo;
* validación de metadata;
* tests de sanitización;
* revisión de logs;
* límites de payload.

### Pruebas asociadas

```text id="vzf87h"
SAN-AUD-001 a SAN-AUD-015
SRV-AUD-SAN-001 a SRV-AUD-SAN-015
```

---

## 8.3. Exposición cross-tenant

### Descripción

Un usuario de Tenant A consulta eventos de Tenant B.

### Impacto

Crítico.

### Controles

* filtro obligatorio por `tenantId`;
* `TenantGuard`;
* repositorios tenant-scoped;
* resource ownership validation;
* tests multitenant.

### Pruebas asociadas

```text id="e57kcs"
MT-AUD-001 a MT-AUD-010
API-AUD-TEN-LIST-005
API-AUD-TEN-GET-002
API-AUD-RES-003
```

---

## 8.4. Manipulación de auditoría

### Descripción

Un usuario o proceso modifica o elimina eventos.

### Impacto

Crítico.

### Controles

* append-only;
* no update/delete API;
* repositorio público sin update/delete;
* `onDelete: Restrict`;
* eventos correctivos como nuevos eventos;
* tests append-only.

### Pruebas asociadas

```text id="b9fyr1"
APPEND-AUD-001 a APPEND-AUD-007
```

---

## 8.5. Exportación no autorizada

### Descripción

Un usuario exporta auditoría sin permiso o con categorías no autorizadas.

### Impacto

Alto.

### Controles

* `audit.export`;
* `audit.platform.export`;
* permisos por categoría;
* límites de export;
* auditoría de exportación;
* tests de autorización.

### Pruebas asociadas

```text id="hun43e"
EXP-AUD-001 a EXP-AUD-015
AUTH-AUD-SOD-001 a AUTH-AUD-SOD-005
```

---

## 8.6. CSV injection

### Descripción

Una exportación CSV contiene valores que se interpretan como fórmulas en hojas de cálculo.

### Impacto

Alto.

### Ejemplos peligrosos

```text id="uvko19"
=cmd
+SUM(...)
-10+20
@HYPERLINK(...)
```

### Controles

* prefijar o escapar celdas peligrosas;
* sanitizar actorDisplayName;
* sanitizar resourceDisplay;
* sanitizar reason;
* sanitizar metadata serializada;
* tests de CSV injection.

### Pruebas asociadas

```text id="c77btu"
EXP-AUD-010 a EXP-AUD-013
TASK-106
```

---

## 8.7. Platform access excesivo

### Descripción

Un usuario platform consulta auditoría sensible de tenants sin permiso ni justificación.

### Impacto

Alto.

### Controles

* `audit.platform.read`;
* `audit.platform.readSensitive`;
* auditoría de consultas platform sensibles;
* separación de permisos;
* filtros obligatorios;
* logs sanitizados.

### Pruebas asociadas

```text id="ki8ru1"
AUTH-AUD-PLAT-001 a AUTH-AUD-PLAT-005
API-AUD-PLAT-LIST-001 a API-AUD-PLAT-LIST-008
```

---

## 8.8. Auditoría como repositorio de payloads

### Descripción

El sistema almacena requests/responses completos en `metadata`.

### Impacto

Alto.

### Controles

* bloquear `rawBody`;
* bloquear `payload`;
* bloquear `response`;
* tamaño máximo;
* profundidad máxima;
* `AuditMetadataValidatorService`;
* tests.

### Pruebas asociadas

```text id="m6s25z"
SRV-AUD-META-001 a SRV-AUD-META-006
SAN-AUD-012
SAN-AUD-013
```

---

## 8.9. Recursión al auditar auditoría

### Descripción

Al auditar `audit.exported`, se genera otro evento `audit.exported`, creando recursión.

### Impacto

Medio/alto.

### Controles

* anti-recursion guard;
* marca interna `isAuditInternal`;
* registrar un solo evento por operación;
* tests específicos.

### Pruebas asociadas

```text id="cf7gp7"
SRV-AUD-SVC-007
```

---

## 8.10. Falsa sensación de cumplimiento

### Descripción

Se asume que tener `AuditLog` equivale a cumplimiento legal o integridad criptográfica completa.

### Impacto

Medio.

### Controles

* documentar límites MVP;
* diferir WORM/hash/firma/legal hold;
* no afirmar inmutabilidad criptográfica;
* preparar specs futuras.

---

## 9. Controles obligatorios por endpoint

## 9.1. `GET /api/v1/tenant/audit-logs`

Controles:

```text id="ujqzei"
AuthGuard
TenantGuard
TenantPermissionGuard
audit.read
tenantId = currentTenant.id
paginación
pageSize <= 100
sortBy permitido
filtros validados
category policy
response sanitizado
rate limiting
```

---

## 9.2. `GET /api/v1/tenant/audit-logs/{auditLogId}`

Controles:

```text id="b7zoov"
AuthGuard
TenantGuard
audit.read
auditLog.tenantId = currentTenant.id
category policy
sensitive fields policy
response sanitizado
```

---

## 9.3. `GET /api/v1/tenant/audit-logs/export`

Controles:

```text id="cs7eg8"
AuthGuard
TenantGuard
audit.export
category policy
maxExportRows
format json/csv
CSV injection protection
audit.exported
no export completo en logs
```

---

## 9.4. `GET /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs`

Controles:

```text id="vu7c8n"
AuthGuard
TenantGuard
audit.read
resourceType permitido
resourceId válido
TenantResourceResolverPort
resource.tenantId = currentTenant.id
category policy
paginación
response sanitizado
```

---

## 9.5. `GET /api/v1/platform/audit-logs`

Controles:

```text id="ez282i"
AuthGuard
PlatformAuditPermissionGuard
audit.platform.read
audit.platform.readSensitive si aplica
filtros validados
paginación
rate limiting
audit.platformQueried si sensible
```

---

## 9.6. `GET /api/v1/platform/audit-logs/{auditLogId}`

Controles:

```text id="ovgnto"
AuthGuard
audit.platform.read
audit.platform.readSensitive si sensible
response sanitizado
no secretos
```

---

## 9.7. `GET /api/v1/platform/audit-logs/export`

Controles:

```text id="aadbrv"
AuthGuard
audit.platform.export
audit.platform.readSensitive si aplica
maxExportRows
format json/csv
CSV injection protection
audit.platformExported
no export completo en logs
```

---

## 10. Reglas de permisos

### 10.1. Permisos tenant

```text id="ybp7a5"
audit.read
audit.export
audit.readFinancial
audit.readSecurity
audit.readAccess
audit.readPersonalData
```

---

### 10.2. Permisos platform

```text id="sd2qd0"
audit.platform.read
audit.platform.export
audit.platform.readSensitive
```

---

### 10.3. Categorías sensibles

| Categoría           | Permiso requerido        |
| ------------------- | ------------------------ |
| `financial`         | `audit.readFinancial`    |
| `payments`          | `audit.readFinancial`    |
| `accountStatements` | `audit.readFinancial`    |
| `access`            | `audit.readAccess`       |
| `security`          | `audit.readSecurity`     |
| `personalData`      | `audit.readPersonalData` |

---

### 10.4. Separación de funciones

Reglas:

```text id="qlxjzz"
audit.read no implica audit.export.
audit.read no implica audit.readFinancial.
audit.read no implica audit.readAccess.
audit.read no implica audit.readSecurity.
audit.read no implica audit.readPersonalData.
audit.platform.read no implica audit.platform.export.
audit.platform.read no implica audit.platform.readSensitive.
```

---

## 11. Reglas de sanitización

### 11.1. Redacción por nombre de campo

Redactar si el nombre de campo contiene:

```text id="cw6e14"
password
passwordHash
accessToken
refreshToken
idToken
authorization
cookie
secret
clientSecret
apiKey
privateKey
cardNumber
cvv
cvc
bankAccount
bankAccountNumber
routingNumber
fileContent
receiptContent
documentContent
rawBody
payload
responseBody
```

Valor resultante:

```text id="mt8ggm"
[REDACTED]
```

---

### 11.2. Truncamiento

Aplicar límites:

```text id="bwnrz9"
oldValue <= 16 KB serializado
newValue <= 16 KB serializado
metadata <= 16 KB serializado
maxDepth = 5
```

Si excede:

```text id="wnwcya"
_truncated = true
[TRUNCATED]
```

---

### 11.3. Campos permitidos

Permitidos si están justificados:

```text id="x8f6my"
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
errorCode
format
rowCount
```

---

### 11.4. Datos personales

Para eventos `personalData`, registrar preferentemente:

```text id="zicmol"
personId
propertyUnitId
changeType
fieldNamesChanged
status
relationshipType
```

Evitar:

```text id="r4f0ar"
nombre completo innecesario
cédula completa
dirección completa
teléfono
email
datos familiares completos
datos de emergencia completos
```

---

### 11.5. Datos financieros

Para eventos financieros, registrar:

```text id="v6vrzc"
amount como string
currency
status anterior/nuevo
chargeId
paymentId
statementId
propertyUnitId
billingPeriodId
reason sanitizado
```

No registrar:

```text id="x1hpyb"
comprobante completo
referencia bancaria completa si es sensible
captura de transferencia
archivo de recibo
datos bancarios completos
```

---

## 12. Reglas de multitenancy

### 12.1. Tenant query

Toda consulta tenant debe incluir:

```text id="vk77xp"
WHERE tenant_id = currentTenant.id
```

---

### 12.2. Platform query

Solo usuarios platform con permiso pueden consultar eventos platform.

Eventos `tenantId = null` no aparecen en consultas tenant ordinarias.

---

### 12.3. Resource query

Antes de consultar eventos por recurso:

```text id="i2r21m"
assertResourceBelongsToTenant(currentTenant.id, resourceType, resourceId)
```

---

### 12.4. Respuesta ante cross-tenant

Para endpoints tenant:

```text id="osivtf"
403 CROSS_TENANT_REFERENCE
```

o:

```text id="bboe1x"
404 NOT_FOUND
```

Para evitar enumeración, se recomienda `404` cuando el recurso sea consultado directamente.

---

## 13. Reglas de integridad

### 13.1. Sin modificación ordinaria

No implementar:

```text id="u67vy3"
PUT /audit-logs/{id}
PATCH /audit-logs/{id}
DELETE /audit-logs/{id}
```

---

### 13.2. Correcciones

Si se necesita corregir una auditoría:

```text id="kcc953"
crear nuevo AuditLog con action audit.correction.created
```

Esta acción queda diferida para una spec futura si se requiere.

---

### 13.3. Base de datos

Usar:

```text id="r3yo5p"
onDelete: Restrict
```

para relaciones con `Tenant` y `UserProfile`.

No usar cascade delete.

---

### 13.4. Hash encadenado

Diferido para MVP.

No afirmar integridad criptográfica hasta implementar:

```text id="vvuzl7"
eventHash
previousEventHash
firma digital
WORM storage
```

---

## 14. Reglas de exportación segura

### 14.1. Permisos

Tenant export:

```text id="hde8lt"
audit.export
```

Platform export:

```text id="nklmrn"
audit.platform.export
```

Categorías sensibles requieren sus permisos respectivos.

---

### 14.2. Límites

Recomendado:

```text id="qip8sb"
maxExportRows configurable
date range máximo configurable
filtros obligatorios para exports grandes
```

---

### 14.3. CSV injection

Neutralizar celdas que empiecen con:

```text id="y8v6th"
=
+
-
@
```

Aplica a:

```text id="nq3hbr"
actorDisplayName
resourceDisplay
reason
action
resourceType
oldValue serializado
newValue serializado
metadata serializada
```

---

### 14.4. No almacenar export completo en logs

Prohibido en logs técnicos y audit metadata:

```text id="gkqabg"
CSV completo
JSON completo exportado
archivo generado completo
lista completa de filas
```

Permitido:

```text id="kon3la"
format
rowCount
filters sanitizados
result
traceId
```

---

## 15. Reglas de observabilidad segura

### 15.1. Logs permitidos

```text id="cm699f"
traceId
requestId
tenantId
actorType
action
category
outcome
resourceType
result
errorCode
latencyMs
```

---

### 15.2. Logs prohibidos

```text id="z7emzg"
tokens
Authorization header
cookies
passwords
oldValue completo sensible
newValue completo sensible
metadata completa sensible
payload completo
export completo
SQL completo
stack trace en producción
```

---

### 15.3. Métricas

Permitido como labels:

```text id="f5jm29"
category
outcome
severity
actorType
scope
```

Prohibido como labels:

```text id="e7y8ne"
actorUserId
resourceId
traceId
requestId
ipAddress
userAgent
tenantId si genera alta cardinalidad en despliegues grandes
```

---

## 16. Reglas de auditoría de accesos denegados

Deben auditarse accesos denegados críticos:

```text id="gb67x8"
crossTenant.accessDenied
permission.denied
audit.accessDenied
audit.platformAccessDenied
ownAccess.denied si aplica
```

Incluir:

```text id="uk9avp"
tenantId si aplica
actorUserId si existe
action intentada
resourceType si aplica
resourceId si aplica
outcome = denied
severity = warning o critical
traceId
errorCode
```

No incluir:

```text id="tnanrk"
payload completo
token
datos del recurso ajeno
detalles internos de permisos
```

---

## 17. Reglas para eventos financieros

Eventos financieros críticos deben usar `writeCritical`.

Ejemplos:

```text id="ck6c9o"
charge.reversed
charge.adjusted
payment.confirmed
payment.rejected
payment.reversed
paymentAllocation.reversed
accountStatement.regenerated
accountStatement.locked
accountStatement.exported
```

Metadata permitida:

```text id="wk4lcs"
amount
currency
status
propertyUnitId
billingPeriodId
chargeId
paymentId
statementId
reason
```

No almacenar:

```text id="zzpk1c"
comprobante completo
archivo completo
datos bancarios completos
captura base64
```

---

## 18. Reglas para eventos de acceso

Eventos críticos de acceso deben usar `writeCritical`.

Ejemplos:

```text id="v3css0"
role.assigned
role.removed
permission.granted
permission.revoked
membership.revoked
user.disabled
tenant.suspended
```

oldValue/newValue permitidos:

```text id="unvt5f"
roleIds
permissionIds
membershipStatus
userStatus
```

No almacenar:

```text id="x5c5km"
password
passwordHash
token
session data
```

---

## 19. Reglas para eventos de datos personales

Eventos `personalData` deben minimizar datos.

Preferido:

```text id="r7mljm"
personId
fieldNamesChanged
status
relationshipType
propertyUnitId
```

Evitar:

```text id="pd1wkj"
valor completo de cédula
valor completo de teléfono
valor completo de email
dirección completa
datos familiares completos
contacto de emergencia completo
```

Cuando se requiere old/new:

```text id="tbz923"
registrar solo campo cambiado y estado general, no el valor sensible completo
```

---

## 20. Reglas para eventos platform

Eventos platform deben tener control reforzado.

Ejemplos:

```text id="kms1xd"
tenant.created
tenant.suspended
tenant.reactivated
platform.support.accessedTenant
audit.platformExported
```

Requisitos:

```text id="ij1335"
actor platform identificado
motivo si es soporte
traceId
outcome
resourceType/resourceId
audit.platform.readSensitive para consulta sensible
```

---

## 21. Reglas de rate limiting

Aplicar rate limiting en:

```text id="s16h5p"
GET /api/v1/tenant/audit-logs
GET /api/v1/tenant/audit-logs/{auditLogId}
GET /api/v1/tenant/audit-logs/export
GET /api/v1/tenant/resources/{resourceType}/{resourceId}/audit-logs
GET /api/v1/platform/audit-logs
GET /api/v1/platform/audit-logs/{auditLogId}
GET /api/v1/platform/audit-logs/export
```

Objetivos:

* evitar scraping;
* reducir enumeración;
* proteger exportaciones;
* proteger auditoría sensible;
* preservar disponibilidad.

---

## 22. Reglas de CORS

No permitir CORS abierto en producción.

Prohibido:

```text id="z5ms88"
Access-Control-Allow-Origin: *
```

Permitir solo orígenes oficiales de RESIDENT.

---

## 23. Reglas de errores seguros

### 23.1. Error estándar

```json id="w8mkc7"
{
  "error": {
    "code": "AUDIT_CATEGORY_FORBIDDEN",
    "message": "You are not allowed to view audit logs for this category.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 23.2. No exponer

```text id="v09ip0"
SQL
stack trace
Prisma raw error
policy internals
tenant existence
resource existence cuando sea sensible
payload completo
tokens
secretos
```

---

### 23.3. Cross-tenant

Para recurso ajeno directo, preferir:

```text id="sqkpl7"
404 NOT_FOUND
```

para reducir enumeración.

---

## 24. Reglas de seeds

Seeds permitidos:

```text id="f3op3x"
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

Seeds prohibidos:

```text id="jzrh04"
datos reales
tokens reales
passwords
headers reales
comprobantes reales
archivos reales
exports reales
referencias bancarias reales
payloads completos
```

---

## 25. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="ybs2kh"
- auditoría tenant no mezcla tenants;
- auditoría platform requiere permiso platform;
- categorías sensibles requieren permisos;
- audit.export requiere permiso;
- audit.platform.export requiere permiso;
- export genera audit.exported;
- platform export genera audit.platformExported;
- CSV injection neutralizado;
- passwords redactados;
- tokens redactados;
- Authorization header redactado;
- cookies redactadas;
- apiKey redactada;
- privateKey redactada;
- fileContent redactado;
- receiptContent redactado;
- rawBody/payload bloqueado;
- metadata excesiva truncada o rechazada;
- no existen endpoints PUT/PATCH/DELETE;
- repositorio público no expone update/delete;
- eventos financieros críticos auditados;
- cambios de permisos auditados;
- accesos denegados críticos auditados;
- logs técnicos no contienen secrets;
- métricas no usan labels de alta cardinalidad.
```

---

## 26. Checklist de seguridad para PR

Antes de aprobar un PR de `007-audit`:

```text id="z87pke"
[ ] AuditLog tiene action obligatorio.
[ ] AuditLog tiene category obligatorio.
[ ] AuditLog tiene severity obligatorio.
[ ] AuditLog tiene outcome obligatorio.
[ ] Tenant-scoped events tienen tenantId.
[ ] Platform/pre-tenant events justifican tenantId null.
[ ] Actor se registra cuando aplica.
[ ] Resource se registra cuando aplica.
[ ] traceId se registra en requests HTTP.
[ ] oldValue pasa por sanitización.
[ ] newValue pasa por sanitización.
[ ] metadata pasa por sanitización.
[ ] Passwords se redactan.
[ ] Tokens se redactan.
[ ] Authorization se redacta.
[ ] Cookies se redactan.
[ ] Secrets se redactan.
[ ] API keys se redactan.
[ ] Payload completo se bloquea.
[ ] Comprobantes completos no se almacenan.
[ ] Archivos completos no se almacenan.
[ ] Datos bancarios completos no se almacenan.
[ ] No hay endpoint POST público para crear AuditLog manual.
[ ] No hay endpoint PUT de AuditLog.
[ ] No hay endpoint PATCH de AuditLog.
[ ] No hay endpoint DELETE de AuditLog.
[ ] Repositorio público no expone update/delete.
[ ] Consultas tenant filtran por tenantId.
[ ] Consulta por recurso valida pertenencia tenant.
[ ] Platform audit requiere permiso platform.
[ ] Sensitive platform requiere readSensitive.
[ ] Categoría financial requiere audit.readFinancial.
[ ] Categoría payments requiere audit.readFinancial.
[ ] Categoría accountStatements requiere audit.readFinancial.
[ ] Categoría access requiere audit.readAccess.
[ ] Categoría security requiere audit.readSecurity.
[ ] Categoría personalData requiere audit.readPersonalData.
[ ] Export tenant requiere audit.export.
[ ] Export platform requiere audit.platform.export.
[ ] Export audita audit.exported.
[ ] Platform export audita audit.platformExported.
[ ] Export respeta categorías visibles.
[ ] CSV export neutraliza fórmulas.
[ ] Logs técnicos no contienen payload completo.
[ ] Logs técnicos no contienen secrets.
[ ] Métricas no usan actorUserId.
[ ] Métricas no usan resourceId.
[ ] Métricas no usan traceId.
[ ] Eventos 001 integrados.
[ ] Eventos 002 integrados.
[ ] Eventos 003 integrados.
[ ] Eventos 004 integrados.
[ ] Eventos 005 integrados.
[ ] Eventos 006 integrados.
[ ] OpenAPI no documenta update/delete.
[ ] Tests de sanitización pasan.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests de exportación pasan.
[ ] Tests append-only pasan.
[ ] Tests financieros pasan.
[ ] Seeds no contienen datos reales.
```

---

## 27. Riesgos residuales aceptados en MVP

| Riesgo                                                 | Estado                 | Justificación                                  |
| ------------------------------------------------------ | ---------------------- | ---------------------------------------------- |
| Sin WORM storage                                       | Aceptado temporalmente | Requiere infraestructura y política específica |
| Sin hash encadenado                                    | Aceptado temporalmente | Requiere diseño criptográfico                  |
| Sin firma digital                                      | Aceptado temporalmente | Requiere gestión de llaves                     |
| Sin legal hold                                         | Aceptado temporalmente | Requiere workflow legal                        |
| Sin SIEM                                               | Aceptado temporalmente | Requiere integración externa                   |
| Sin detección automática de anomalías                  | Aceptado temporalmente | Requiere reglas, métricas o ML                 |
| Retención indefinida simple                            | Aceptado temporalmente | MVP sin purga automática                       |
| Auditoría append-only por aplicación, no criptográfica | Aceptado temporalmente | Integridad avanzada queda diferida             |

---

## 28. Pendientes de seguridad para specs futuras

### 28.1. `00X-audit-integrity`

Debe cubrir:

```text id="e9jl2d"
eventHash
previousEventHash
hash chain
tamper detection
verificación periódica
```

---

### 28.2. `00X-compliance-storage`

Debe cubrir:

```text id="b5fj04"
WORM storage
almacenamiento frío
replicación externa
protección contra borrado
```

---

### 28.3. `00X-data-retention`

Debe cubrir:

```text id="ulxw9x"
retención mínima
retención por tenant
purga controlada
legal hold
anonimización
```

---

### 28.4. `00X-security-monitoring`

Debe cubrir:

```text id="y1tk05"
SIEM
alertas
correlación
detección de abuso
detección de anomalías
```

---

### 28.5. `00X-incident-management`

Debe cubrir:

```text id="r4tmb5"
creación de incidentes
asignación
severidad
evidencia
cierre
postmortem
```

---

## 29. Criterios de aceptación de seguridad

La spec `007-audit` cumple seguridad si:

* todo evento tiene `action`;
* todo evento tiene `category`;
* todo evento tiene `severity`;
* todo evento tiene `outcome`;
* eventos tenant-scoped tienen `tenantId`;
* eventos platform justifican `tenantId = null`;
* actor se registra cuando aplica;
* recurso se registra cuando aplica;
* `traceId` se registra en requests HTTP;
* `oldValue` está sanitizado;
* `newValue` está sanitizado;
* `metadata` está sanitizada;
* secretos son redactados;
* payloads completos son bloqueados;
* no se almacenan comprobantes completos;
* no se almacenan archivos completos;
* no se almacenan datos bancarios completos;
* tenant audit no mezcla tenants;
* platform audit requiere permiso platform;
* resource audit valida pertenencia del recurso al tenant;
* categorías sensibles requieren permisos específicos;
* exportación requiere permiso;
* exportación se audita;
* CSV export neutraliza fórmulas;
* no existen endpoints update/delete ordinarios;
* repositorio público no expone update/delete;
* eventos financieros críticos se auditan;
* cambios de acceso se auditan;
* accesos denegados críticos se auditan;
* logs técnicos no contienen secretos;
* métricas no usan labels de alta cardinalidad;
* OpenAPI documenta permisos;
* OpenAPI no documenta endpoints de modificación;
* tests de seguridad pasan.

---

## 30. Decisión final de seguridad

El módulo `007-audit` será tratado como módulo transversal crítico de evidencia.

La seguridad del módulo se basa en:

```text id="iiftf2"
append-only por aplicación
tenant isolation
platform scope separado
permisos de auditoría
permisos por categoría sensible
sanitización obligatoria
redacción de secretos
bloqueo de payloads completos
oldValue/newValue mínimos y sanitizados
metadata controlada
traceId propagation
resource ownership validation
exportación controlada
CSV injection protection
auditoría de exportaciones
anti-recursion guard
observabilidad sanitizada
tests de autorización
tests multitenant
tests de sanitización
tests de exportación
tests append-only
tests de integración financiera y de acceso
```

La implementación no será aceptada si permite auditoría cross-tenant, consulta platform sin permiso, exportación sin permiso, almacenamiento de tokens o contraseñas, almacenamiento de payloads completos, modificación ordinaria de AuditLog, omisión de eventos financieros críticos, omisión de cambios de permisos, logs con secretos o exportaciones CSV vulnerables a fórmula injection.
