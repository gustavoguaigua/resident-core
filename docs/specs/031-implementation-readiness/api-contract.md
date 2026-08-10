# API Contract — 031 Implementation Readiness

## 1. Información del documento

| Campo             | Valor                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------- |
| Proyecto          | RESIDENT Core                                                                          |
| Spec ID           | 031                                                                                    |
| Módulo            | Implementation Readiness                                                               |
| Documento         | API Contract                                                                           |
| Ruta              | `docs/specs/031-implementation-readiness/api-contract.md`                              |
| Versión           | 0.1                                                                                    |
| Estado            | complete                                                                               |
| Fecha             | 2026-08-05                                                                             |
| Naturaleza        | Internal readiness contract / Non-transactional / Documentation and validation support |
| Estado runtime    | `deferred` — no autorizado en Sprint 0                                                |
| Base API reservada| `/api/v1/platform/readiness`                                                           |
| Auth              | Keycloak OIDC / Bearer token                                                           |
| Alcance           | Platform-only / Non-public / No tenant transactional data                              |

---

## 2. Propósito

Definir los contratos API opcionales para soportar la revisión de preparación de implementación de RESIDENT Core.

Este documento reserva un posible contrato futuro; no constituye autorización de
implementación para Sprint 0. Durante Sprint 0 no se crearán rutas, controllers,
services, DTOs, permisos, entradas OpenAPI ni pruebas runtime bajo
`/api/v1/platform/readiness`.

El paquete `031-implementation-readiness` no define una funcionalidad transaccional del negocio residencial. Sus APIs son internas, de plataforma y de soporte documental. Sirven para registrar, consultar y evaluar el estado de preparación del proyecto antes de iniciar implementación técnica.

Regla central:

```text id="ir-api-rule"
Implementation Readiness API debe ser una superficie interna, autenticada, platform-scoped, no pública y no transaccional, orientada a registrar inventario documental, matriz de readiness, gaps, decisiones Go/Conditional Go/No-Go y evidencias de preparación; no debe exponer datos de residentes, pagos, estados de cuenta, comprobantes, documentos privados, storageKey, secretos, tokens, datos cross-tenant, operaciones financieras, acciones administrativas de negocio ni integraciones WordPress públicas.
```

---

## 3. Naturaleza de la API

```text id="ir-api-nature"
Internal platform readiness API
Documentation inventory API
Gap register API
Readiness matrix API
Go/No-Go decision API
Non-business transactional
Non-resident-facing
Non-WordPress-facing
Non-public
PlatformAdmin-only
```

---

## 4. Principios

```text id="ir-api-principles"
1. La API es opcional para el MVP inicial.
2. La revisión puede ejecutarse manualmente con documentos Markdown.
3. Si se implementa API, debe ser interna y protegida.
4. No debe exponer información transaccional de tenants.
5. No debe exponer datos personales de residentes.
6. No debe exponer datos financieros.
7. No debe exponer documentos privados.
8. No debe exponer storageKey.
9. No debe depender de WordPress.
10. No debe crear, modificar ni eliminar datos de negocio.
11. Debe registrar decisiones de readiness.
12. Debe conservar trazabilidad de gaps.
13. Debe ser auditable.
14. Debe soportar exportación documental segura.
```

### 4.1. Condición de activación futura

La API permanece diferida y tampoco se incorpora automáticamente a Sprint 1. Solo podrá
implementarse si un sprint posterior la incluye explícitamente mediante un plan
aprobado, después de disponer de la plataforma runtime, autenticación, autorización
platform-scoped, auditoría y persistencia requeridas. Hasta entonces, todos los
endpoints de este documento son reservados y no ejecutables.

---

## 5. Autorización

### 5.1. Roles permitidos

```text id="ir-api-roles"
platformAdmin
projectOwner
technicalLead
securityReviewer
qaLead
```

### 5.2. Permisos sugeridos

```text id="ir-api-permissions"
implementationReadiness.read
implementationReadiness.create
implementationReadiness.update
implementationReadiness.evaluate
implementationReadiness.approve
implementationReadiness.export
implementationReadiness.manageGaps
implementationReadiness.resolveGaps
implementationReadiness.recordDecision
```

Regla:

```text id="ir-api-authz-rule"
Solo usuarios de plataforma autorizados pueden crear, actualizar, evaluar o aprobar readiness. Usuarios tenant, residentes, propietarios, guardias, administradores de conjunto y usuarios WordPress no deben acceder a esta API.
```

---

## 6. Convenciones generales

### 6.1. Base API

```text id="ir-api-base"
/api/v1/platform/readiness
```

### 6.2. Headers

```http id="ir-api-headers"
Authorization: Bearer <access_token>
Accept: application/json
Content-Type: application/json
X-Request-Source: admin-web
```

### 6.3. Response envelope

```json id="ir-api-response-envelope"
{
  "data": {},
  "meta": {
    "traceId": "trace-id"
  }
}
```

### 6.4. Error envelope

```json id="ir-api-error-envelope"
{
  "error": {
    "code": "READINESS_FORBIDDEN",
    "message": "You do not have permission to access implementation readiness.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 7. Superficie API propuesta

```text id="ir-api-surface"
GET    /api/v1/platform/readiness/runs
POST   /api/v1/platform/readiness/runs
GET    /api/v1/platform/readiness/runs/{runId}
PATCH  /api/v1/platform/readiness/runs/{runId}
POST   /api/v1/platform/readiness/runs/{runId}/evaluate
POST   /api/v1/platform/readiness/runs/{runId}/decision
GET    /api/v1/platform/readiness/runs/{runId}/summary

GET    /api/v1/platform/readiness/runs/{runId}/documents
POST   /api/v1/platform/readiness/runs/{runId}/documents/check

GET    /api/v1/platform/readiness/runs/{runId}/gaps
POST   /api/v1/platform/readiness/runs/{runId}/gaps
GET    /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}
PATCH  /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}
POST   /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}/resolve
POST   /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}/defer
POST   /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}/accept-risk

GET    /api/v1/platform/readiness/runs/{runId}/matrix
POST   /api/v1/platform/readiness/runs/{runId}/matrix/recalculate

POST   /api/v1/platform/readiness/runs/{runId}/export
GET    /api/v1/platform/readiness/runs/{runId}/exports
```

---

## 8. Entidades contractuales

### 8.1. ReadinessRun

```json id="ir-api-readiness-run"
{
  "readinessRunId": "uuid",
  "code": "IR-2026-08-05-001",
  "title": "Implementation Readiness Review - MVP",
  "status": "draft",
  "scope": "mvpCore",
  "startedAt": "2026-08-05T21:07:00Z",
  "completedAt": null,
  "decision": null,
  "createdBy": "server-side",
  "updatedBy": "server-side"
}
```

Estados:

```text id="ir-api-readiness-run-status"
draft
inReview
evaluated
conditionalGo
go
noGo
archived
```

---

### 8.2. ReadinessDocumentStatus

```json id="ir-api-document-status"
{
  "documentStatusId": "uuid",
  "readinessRunId": "uuid",
  "documentPath": "docs/specs/030-resident-self-service-basic/api-contract.md",
  "documentType": "apiContract",
  "packageId": "030-resident-self-service-basic",
  "exists": true,
  "status": "complete",
  "severityIfMissing": "critical",
  "notes": "Reconstructed and included.",
  "checkedAt": "2026-08-05T21:07:00Z"
}
```

Estados:

```text id="ir-api-document-status-values"
complete
partial
missing
deferred
blocked
needsReview
```

---

### 8.3. ReadinessGap

```json id="ir-api-gap"
{
  "gapId": "uuid",
  "readinessRunId": "uuid",
  "code": "GAP-IR-001",
  "title": "Missing API contract for package 030",
  "description": "api-contract.md was requested but not visible in the chat transcript.",
  "affectedArea": "api",
  "affectedPackages": ["030-resident-self-service-basic"],
  "severity": "critical",
  "status": "resolved",
  "decision": "resolve-before-implementation",
  "requiredBefore": "sprint-0",
  "mitigation": "Reconstruct api-contract.md and add it to package 030.",
  "resolvedAt": "2026-08-05T21:07:00Z"
}
```

Severidad:

```text id="ir-api-gap-severity"
critical
high
medium
low
```

Estados:

```text id="ir-api-gap-status"
open
inReview
resolved
acceptedRisk
deferred
blocked
```

Decisiones:

```text id="ir-api-gap-decision"
resolve-before-implementation
resolve-before-MVP
resolve-before-production
defer
requires-ADR
accepted-risk
```

---

### 8.4. ReadinessMatrix

```json id="ir-api-matrix"
{
  "readinessRunId": "uuid",
  "baseDocsScore": 100,
  "adrScore": 100,
  "mvpCoreScore": 95,
  "securityScore": 90,
  "openApiScore": 90,
  "testingScore": 85,
  "ciCdScore": 75,
  "criticalGapsOpen": 0,
  "highGapsOpen": 1,
  "recommendedDecision": "conditionalGo"
}
```

Regla:

```text id="ir-api-matrix-rule"
La matriz de readiness es soporte de decisión. La decisión final debe registrarse explícitamente por un usuario autorizado.
```

---

### 8.5. ReadinessDecision

```json id="ir-api-decision"
{
  "decisionId": "uuid",
  "readinessRunId": "uuid",
  "decision": "conditionalGo",
  "reason": "Sprint 0 and Sprint 1 can start. Some non-blocking UI gaps remain deferred.",
  "approvedBy": "server-side",
  "approvedAt": "2026-08-05T21:07:00Z"
}
```

Decisiones permitidas:

```text id="ir-api-decision-values"
go
conditionalGo
noGo
```

---

## 9. Endpoints

### 9.1. Listar readiness runs

```http id="ir-api-list-runs"
GET /api/v1/platform/readiness/runs
```

Permiso:

```text id="ir-api-list-runs-permission"
implementationReadiness.read
```

Query params:

```text id="ir-api-list-runs-query"
status
scope
page
pageSize
sort
```

Response:

```json id="ir-api-list-runs-response"
{
  "data": [
    {
      "readinessRunId": "uuid",
      "code": "IR-2026-08-05-001",
      "title": "Implementation Readiness Review - MVP",
      "status": "inReview",
      "scope": "mvpCore",
      "decision": null,
      "startedAt": "2026-08-05T21:07:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "traceId": "trace-id"
  }
}
```

---

### 9.2. Crear readiness run

```http id="ir-api-create-run"
POST /api/v1/platform/readiness/runs
```

Permiso:

```text id="ir-api-create-run-permission"
implementationReadiness.create
```

Request:

```json id="ir-api-create-run-request"
{
  "title": "Implementation Readiness Review - MVP",
  "scope": "mvpCore",
  "notes": "Review before starting Sprint 0."
}
```

Response:

```json id="ir-api-create-run-response"
{
  "data": {
    "readinessRunId": "uuid",
    "code": "IR-2026-08-05-001",
    "status": "draft"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="ir-api-create-run-rules"
- No aceptar createdBy.
- No aceptar status directo distinto al flujo permitido.
- No aceptar tenantId.
- No aceptar datos de negocio.
```

---

### 9.3. Obtener readiness run

```http id="ir-api-get-run"
GET /api/v1/platform/readiness/runs/{runId}
```

Permiso:

```text id="ir-api-get-run-permission"
implementationReadiness.read
```

---

### 9.4. Actualizar readiness run

```http id="ir-api-update-run"
PATCH /api/v1/platform/readiness/runs/{runId}
```

Permiso:

```text id="ir-api-update-run-permission"
implementationReadiness.update
```

Request:

```json id="ir-api-update-run-request"
{
  "title": "Implementation Readiness Review - MVP Core",
  "notes": "Updated scope notes."
}
```

Reglas:

```text id="ir-api-update-run-rules"
- No permitir actualizar decision por PATCH.
- No permitir actualizar status arbitrariamente.
- No permitir actor fields.
```

---

### 9.5. Ejecutar evaluación

```http id="ir-api-evaluate-run"
POST /api/v1/platform/readiness/runs/{runId}/evaluate
```

Permiso:

```text id="ir-api-evaluate-run-permission"
implementationReadiness.evaluate
```

Request:

```json id="ir-api-evaluate-run-request"
{
  "evaluationMode": "manualChecklist",
  "includeDeferredPackages": false
}
```

Response:

```json id="ir-api-evaluate-run-response"
{
  "data": {
    "readinessRunId": "uuid",
    "status": "evaluated",
    "criticalGapsOpen": 0,
    "highGapsOpen": 1,
    "recommendedDecision": "conditionalGo"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 9.6. Registrar decisión Go / Conditional Go / No-Go

```http id="ir-api-record-decision"
POST /api/v1/platform/readiness/runs/{runId}/decision
```

Permiso:

```text id="ir-api-record-decision-permission"
implementationReadiness.approve
```

Request:

```json id="ir-api-record-decision-request"
{
  "decision": "conditionalGo",
  "reason": "Sprint 0 can start. Advanced integrations remain deferred."
}
```

Response:

```json id="ir-api-record-decision-response"
{
  "data": {
    "decisionId": "uuid",
    "readinessRunId": "uuid",
    "decision": "conditionalGo",
    "approvedAt": "2026-08-05T21:07:00Z"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="ir-api-decision-rules"
- No permitir GO con gaps críticos abiertos.
- No permitir GO si MVP core carece de docs críticos.
- Conditional GO requiere justificación.
- No-Go requiere listar blockers.
- approvedBy se resuelve server-side.
```

---

## 10. Document inventory endpoints

### 10.1. Listar documentos evaluados

```http id="ir-api-list-documents"
GET /api/v1/platform/readiness/runs/{runId}/documents
```

Permiso:

```text id="ir-api-list-documents-permission"
implementationReadiness.read
```

Response:

```json id="ir-api-list-documents-response"
{
  "data": [
    {
      "documentPath": "docs/sdd/architecture.md",
      "documentType": "architecture",
      "packageId": null,
      "exists": true,
      "status": "complete",
      "severityIfMissing": "critical"
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 10.2. Revisar documentos

```http id="ir-api-check-documents"
POST /api/v1/platform/readiness/runs/{runId}/documents/check
```

Permiso:

```text id="ir-api-check-documents-permission"
implementationReadiness.evaluate
```

Request:

```json id="ir-api-check-documents-request"
{
  "scope": "mvpCore",
  "includeAdrs": true,
  "includeSddBase": true,
  "includeSpecs": true
}
```

Reglas:

```text id="ir-api-check-documents-rules"
- Esta operación no debe leer datos de tenants.
- Esta operación no debe leer documentos privados de residentes.
- Esta operación solo valida inventario documental permitido.
```

---

## 11. Gap register endpoints

### 11.1. Listar gaps

```http id="ir-api-list-gaps"
GET /api/v1/platform/readiness/runs/{runId}/gaps
```

Permiso:

```text id="ir-api-list-gaps-permission"
implementationReadiness.read
```

Query params:

```text id="ir-api-list-gaps-query"
severity
status
affectedArea
packageId
page
pageSize
```

---

### 11.2. Crear gap

```http id="ir-api-create-gap"
POST /api/v1/platform/readiness/runs/{runId}/gaps
```

Permiso:

```text id="ir-api-create-gap-permission"
implementationReadiness.manageGaps
```

Request:

```json id="ir-api-create-gap-request"
{
  "title": "Missing security-notes in MVP package",
  "description": "A critical package lacks security-notes.md.",
  "affectedArea": "security",
  "affectedPackages": ["005-payments"],
  "severity": "critical",
  "decision": "resolve-before-implementation",
  "requiredBefore": "sprint-0",
  "mitigation": "Create and approve security-notes.md before implementation."
}
```

Response:

```json id="ir-api-create-gap-response"
{
  "data": {
    "gapId": "uuid",
    "code": "GAP-IR-001",
    "status": "open"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 11.3. Actualizar gap

```http id="ir-api-update-gap"
PATCH /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}
```

Permiso:

```text id="ir-api-update-gap-permission"
implementationReadiness.manageGaps
```

---

### 11.4. Resolver gap

```http id="ir-api-resolve-gap"
POST /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}/resolve
```

Permiso:

```text id="ir-api-resolve-gap-permission"
implementationReadiness.resolveGaps
```

Request:

```json id="ir-api-resolve-gap-request"
{
  "resolutionSummary": "Document created and reviewed.",
  "evidenceDocumentPath": "docs/specs/005-payments/security-notes.md"
}
```

Reglas:

```text id="ir-api-gap-resolve-rules"
- resolvedBy se resuelve server-side.
- No aceptar actor fields.
- Debe conservar historial.
```

---

### 11.5. Diferir gap

```http id="ir-api-defer-gap"
POST /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}/defer
```

Permiso:

```text id="ir-api-defer-gap-permission"
implementationReadiness.manageGaps
```

Request:

```json id="ir-api-defer-gap-request"
{
  "deferReason": "Advanced payment provider integration is not required for MVP core.",
  "deferredUntil": "before-production"
}
```

Reglas:

```text id="ir-api-gap-defer-rules"
- No permitir defer de gap crítico de Sprint 0-2 sin aprobación.
- No permitir defer de multitenancy, authz, storageKey o WordPress transactional blockers.
```

---

### 11.6. Aceptar riesgo

```http id="ir-api-accept-risk-gap"
POST /api/v1/platform/readiness/runs/{runId}/gaps/{gapId}/accept-risk
```

Permiso:

```text id="ir-api-accept-risk-gap-permission"
implementationReadiness.approve
```

Request:

```json id="ir-api-accept-risk-gap-request"
{
  "riskAcceptanceReason": "Risk accepted temporarily for local prototype only.",
  "expiresAt": "2026-09-01T00:00:00Z"
}
```

Reglas:

```text id="ir-api-accept-risk-gap-rules"
- No aceptar riesgo crítico permanente.
- No aceptar riesgo sobre datos reales, storageKey, secretos o rutas públicas transaccionales.
- Todo riesgo aceptado debe tener expiración.
```

---

## 12. Matrix endpoints

### 12.1. Obtener matriz de readiness

```http id="ir-api-get-matrix"
GET /api/v1/platform/readiness/runs/{runId}/matrix
```

Permiso:

```text id="ir-api-get-matrix-permission"
implementationReadiness.read
```

Response:

```json id="ir-api-get-matrix-response"
{
  "data": {
    "readinessRunId": "uuid",
    "baseDocsScore": 100,
    "adrScore": 100,
    "mvpCoreScore": 95,
    "securityScore": 90,
    "openApiScore": 90,
    "testingScore": 85,
    "ciCdScore": 75,
    "criticalGapsOpen": 0,
    "highGapsOpen": 1,
    "recommendedDecision": "conditionalGo"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 12.2. Recalcular matriz

```http id="ir-api-recalculate-matrix"
POST /api/v1/platform/readiness/runs/{runId}/matrix/recalculate
```

Permiso:

```text id="ir-api-recalculate-matrix-permission"
implementationReadiness.evaluate
```

Reglas:

```text id="ir-api-recalculate-matrix-rules"
- No modifica documentos base.
- No resuelve gaps automáticamente.
- Solo recalcula score y recomendación.
```

---

## 13. Export endpoints

### 13.1. Solicitar exportación

```http id="ir-api-export"
POST /api/v1/platform/readiness/runs/{runId}/export
```

Permiso:

```text id="ir-api-export-permission"
implementationReadiness.export
```

Request:

```json id="ir-api-export-request"
{
  "format": "markdown",
  "includeGaps": true,
  "includeMatrix": true,
  "includeDecision": true
}
```

Response:

```json id="ir-api-export-response"
{
  "data": {
    "exportId": "uuid",
    "status": "queued"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

Reglas:

```text id="ir-api-export-rules"
- Exportación no debe incluir secretos.
- Exportación no debe incluir tokens.
- Exportación no debe incluir datos de tenants.
- Exportación puede generar secureDocumentId si se almacena en SDS.
- Nunca devolver storageKey.
```

---

### 13.2. Listar exportaciones

```http id="ir-api-list-exports"
GET /api/v1/platform/readiness/runs/{runId}/exports
```

Response:

```json id="ir-api-list-exports-response"
{
  "data": [
    {
      "exportId": "uuid",
      "format": "markdown",
      "status": "completed",
      "secureDocumentId": "uuid",
      "createdAt": "2026-08-05T21:07:00Z"
    }
  ],
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

## 14. Campos prohibidos en requests

```text id="ir-api-forbidden-request-fields"
tenantId
propertyUnitId
personId
residentId
paymentId
chargeId
accountStatementId
storageKey
signedUrl
createdBy
updatedBy
approvedBy
resolvedBy
archivedBy
status directo no permitido
rawSql
sql
script
javascript
functionBody
executableCode
formulaCode
eval
Function
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
externalAiEnabled
externalAiRealDataAllowed
```

---

## 15. Campos prohibidos en responses

```text id="ir-api-forbidden-response-fields"
storageKey
signedUrl persistente
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
rawSql
script
functionBody
executableCode
authorization header
cookie
datos personales de residentes
datos financieros transaccionales
datos de comprobantes reales
datos de documentos privados
datos cross-tenant
```

---

## 16. Endpoints prohibidos

```text id="ir-api-forbidden-endpoints"
/api/v1/public/readiness
/api/v1/public/implementation-readiness
/api/v1/tenant/readiness
/api/v1/resident/readiness
/api/v1/platform/readiness/raw-sql
/api/v1/platform/readiness/secrets
/api/v1/platform/readiness/storage-keys
/api/v1/platform/readiness/execute-script
/wp-admin/resident-readiness
/wp/implementation-readiness
```

Respuesta esperada:

```http id="ir-api-forbidden-endpoints-response"
404 Not Found
```

---

## 17. Idempotencia

Operaciones que deben soportar idempotencia:

```text id="ir-api-idempotency-actions"
POST /api/v1/platform/readiness/runs
POST /api/v1/platform/readiness/runs/{runId}/gaps
POST /api/v1/platform/readiness/runs/{runId}/decision
POST /api/v1/platform/readiness/runs/{runId}/export
```

Header:

```http id="ir-api-idempotency-header"
Idempotency-Key: <uuid>
```

Reglas:

```text id="ir-api-idempotency-rules"
- No duplicar readiness runs por doble submit.
- No duplicar gaps por retry.
- No duplicar decisiones finales.
- No duplicar exportaciones innecesarias.
```

---

## 18. Auditoría

Eventos auditables:

```text id="ir-api-audit-events"
implementationReadiness.runCreated
implementationReadiness.runUpdated
implementationReadiness.evaluated
implementationReadiness.decisionRecorded
implementationReadiness.documentChecked
implementationReadiness.gapCreated
implementationReadiness.gapUpdated
implementationReadiness.gapResolved
implementationReadiness.gapDeferred
implementationReadiness.riskAccepted
implementationReadiness.matrixRecalculated
implementationReadiness.exportRequested
implementationReadiness.exportCompleted
```

Reglas:

```text id="ir-api-audit-rules"
- Actor se resuelve server-side.
- No aceptar actor fields desde cliente.
- Registrar traceId.
- Registrar resultado.
- Registrar reason en decisiones.
- Registrar gap severity y decision.
- No registrar secretos.
- No registrar tokens.
```

---

## 19. OpenAPI extensions

Todo endpoint debe declarar:

```yaml id="ir-api-openapi-extensions"
x-auth-required: true
x-platform-scope: true
x-tenant-scope: false
x-resident-facing: false
x-public-exposure: false
x-wordpress-access: false
x-storage-key-exposed: false
x-raw-sql-allowed: false
x-scripting-allowed: false
x-business-transactional: false
x-financial-operation: false
x-external-ai-real-data: false
```

---

## 20. Contract tests obligatorios

```text id="ir-api-contract-tests"
[ ] Todos los endpoints requieren auth.
[ ] Todos los endpoints requieren permiso platform.
[ ] Ningún endpoint es público.
[ ] Ningún endpoint es tenant-facing.
[ ] Ningún endpoint es resident-facing.
[ ] Ningún endpoint depende de WordPress.
[ ] Ningún endpoint acepta tenantId.
[ ] Ningún endpoint acepta actor fields.
[ ] Ningún endpoint devuelve storageKey.
[ ] Ningún endpoint devuelve signedUrl persistente.
[ ] Ningún endpoint devuelve secretos.
[ ] Ningún endpoint devuelve tokens.
[ ] Ningún endpoint expone datos financieros.
[ ] Ningún endpoint expone datos de residentes.
[ ] Ningún endpoint ejecuta SQL.
[ ] Ningún endpoint ejecuta scripts.
[ ] GO no se permite con gaps críticos abiertos.
[ ] Conditional GO exige razón.
[ ] Accepted risk exige expiración.
```

---

## 21. Criterios de aceptación

```text id="ir-api-acceptance"
[x] API contract define readiness runs.
[x] API contract define document status.
[x] API contract define gap register.
[x] API contract define readiness matrix.
[x] API contract define Go/Conditional Go/No-Go decision.
[x] API contract define exportación.
[x] API contract define permisos.
[x] API contract define campos prohibidos.
[x] API contract define endpoints prohibidos.
[x] API contract define auditoría.
[x] API contract define OpenAPI extensions.
[x] API contract define contract tests.
[x] No expone datos transaccionales.
[x] No expone storageKey.
[x] No depende de WordPress.
[x] No permite acceso tenant/resident.
[x] No permite GO con gaps críticos.
```

---

## 22. No aceptación

No se acepta este contrato si:

```text id="ir-api-no-acceptance"
- define endpoints públicos.
- define endpoints tenant-facing.
- define endpoints resident-facing.
- permite acceso a usuarios de tenant.
- permite acceso a residentes.
- permite sesión WordPress.
- permite tenantId en request.
- expone datos de residentes.
- expone datos financieros.
- expone documentos privados.
- expone storageKey.
- expone secrets.
- ejecuta raw SQL.
- ejecuta scripts.
- permite GO con gaps críticos abiertos.
- permite aceptar riesgos críticos permanentes.
- omite auditoría de decisiones.
- omite traceId en errores.
```

---

## 23. Resultado esperado

```text id="ir-api-expected-result"
api contract definido
readiness runs definidos
document inventory definido
gap register definido
readiness matrix definida
readiness decision definida
export readiness definido
platform-only definido
non-public definido
non-transactional definido
no tenant-facing
no resident-facing
no WordPress
no storageKey
no secrets
no raw SQL
no scripts
audit events definidos
OpenAPI extensions definidas
contract tests definidos
```

---

## 24. Expediente actualizado

```text id="ir-api-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 031-implementation-readiness/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── api-contract.md
```
