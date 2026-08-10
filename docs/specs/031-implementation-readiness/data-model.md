# Data Model — 031 Implementation Readiness

## 1. Información del documento

| Campo      | Valor                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------- |
| Proyecto   | RESIDENT Core                                                                                 |
| Spec ID    | 031                                                                                           |
| Módulo     | Implementation Readiness                                                                      |
| Documento  | Data Model                                                                                    |
| Ruta       | `docs/specs/031-implementation-readiness/data-model.md`                                       |
| Versión    | 0.1                                                                                           |
| Estado     | complete                                                                                      |
| Fecha      | 2026-08-05                                                                                    |
| Naturaleza | Readiness model / Documentation state model / Gap tracking model / Non-business transactional |
| Alcance    | Platform-only / Internal / Non-public / Pre-implementation validation                         |
| Estado runtime | `deferred` — sin persistencia en Sprint 0                                                |

---

## 2. Propósito

Definir el modelo de datos conceptual para la compuerta `031-implementation-readiness`.

Las entidades de este documento son conceptuales y reservadas para una capacidad
interna futura. No autorizan modelos Prisma, tablas, migraciones, seeds, repositorios ni
servicios de persistencia durante Sprint 0.

Este modelo permite representar el estado de preparación del proyecto antes de iniciar implementación: documentos revisados, paquetes SDD, ADRs, gaps, decisiones, métricas de readiness, matriz de prioridad, condiciones mínimas y resultado Go / Conditional Go / No-Go.

Regla central:

```text id="ir-dm-rule"
Implementation Readiness no debe modelar ni almacenar información transaccional de conjuntos, residentes, pagos, cargos, estados de cuenta, documentos privados, visitantes, comprobantes, hardware ni datos personales; su modelo debe limitarse a información interna de preparación del proyecto, inventario documental, gaps, matrices de revisión, decisiones técnicas, evidencias no sensibles y trazabilidad de readiness.
```

---

## 3. Clasificación del modelo

```text id="ir-dm-classification"
Platform-scoped
Internal-only
Non-tenant transactional
Non-resident-facing
Non-financial
Non-operational
Documentation-oriented
Gap-oriented
Decision-oriented
Audit-aware
No storageKey
No secrets
No WordPress transactional dependency
```

---

## 4. Principios

```text id="ir-dm-principles"
1. El modelo representa preparación, no negocio residencial.
2. No almacena datos de residentes.
3. No almacena pagos.
4. No almacena cargos.
5. No almacena estados de cuenta.
6. No almacena comprobantes reales.
7. No almacena documentos privados.
8. No almacena storageKey.
9. No almacena secretos.
10. No almacena tokens.
11. No ejecuta SQL.
12. No ejecuta scripts.
13. No reemplaza auditoría del Core.
14. No reemplaza ADRs.
15. No reemplaza specs.
16. Registra estado, evidencia y decisiones de readiness.
17. Puede implementarse primero como Markdown.
18. Puede implementarse después como tablas platform-scoped si se requiere.
```

---

## 5. Persistencia requerida

Para el MVP de documentación SDD:

```text id="ir-dm-persistence-mvp"
No se requieren tablas productivas obligatorias en PostgreSQL.
```

Motivo:

```text id="ir-dm-persistence-reason"
Implementation Readiness puede ejecutarse inicialmente como revisión documental basada en archivos Markdown dentro de docs/specs/031-implementation-readiness/. La persistencia en base de datos solo sería necesaria si se decide construir una consola interna de readiness o automatizar el seguimiento de gaps.
```

La persistencia tampoco se incorpora automáticamente a Sprint 1. Requiere asignación
explícita a un sprint posterior y un plan aprobado que active conjuntamente el contrato
API y los controles platform-scoped. Mientras esté diferida, la evidencia autoritativa
se conserva en Markdown versionado bajo `docs/changes/` y
`docs/specs/031-implementation-readiness/`.

Persistencia opcional futura:

```text id="ir-dm-optional-persistence"
Si se implementa como módulo interno de plataforma, las tablas deben ser platform-scoped, no tenant-scoped, sin datos de negocio y con auditoría.
```

---

## 6. Entidades conceptuales

```text id="ir-dm-entities"
ReadinessRun
ReadinessScope
ReadinessDocumentStatus
ReadinessPackageStatus
ReadinessAdrStatus
ReadinessChecklistItem
ReadinessGap
ReadinessGapDecision
ReadinessMatrix
ReadinessScore
ReadinessDecision
ReadinessEvidence
ReadinessExport
ReadinessReviewer
ReadinessAuditEvent
```

---

## 7. `ReadinessRun`

Representa una ejecución formal de revisión de preparación.

```typescript id="ir-dm-readiness-run"
type ReadinessRun = {
  readinessRunId: string;
  code: string;
  title: string;
  description?: string;
  scope: ReadinessScopeType;
  status: ReadinessRunStatus;
  startedAt: string;
  evaluatedAt?: string;
  completedAt?: string;
  decision?: ReadinessDecisionValue;
  notes?: string;
};
```

Estados:

```text id="ir-dm-readiness-run-status"
draft
inReview
evaluated
conditionalGo
go
noGo
archived
```

Reglas:

```text id="ir-dm-readiness-run-rules"
- Un readiness run no contiene datos de tenants.
- Un readiness run no contiene datos de residentes.
- La decisión final no se infiere únicamente por score.
- GO requiere cero gaps críticos abiertos.
- Conditional GO requiere justificación.
- No-Go requiere blockers explícitos.
```

---

## 8. `ReadinessScope`

Define el alcance revisado.

```typescript id="ir-dm-readiness-scope"
type ReadinessScope = {
  scopeId: string;
  type: ReadinessScopeType;
  includedPackages: string[];
  excludedPackages: string[];
  includeBaseDocs: boolean;
  includeAdrs: boolean;
  includeCiCd: boolean;
  includeDocker: boolean;
  includeFrontends: boolean;
};
```

Tipos:

```text id="ir-dm-readiness-scope-types"
all
mvpCore
mvpExtended
backendOnly
frontendOnly
securityOnly
preSprint0
preMvp
preProduction
```

Reglas:

```text id="ir-dm-readiness-scope-rules"
- mvpCore incluye paquetes críticos para iniciar implementación base.
- preSprint0 valida repositorio, tooling, Docker, CI y estructura.
- preProduction requiere revisión más estricta que preMvp.
```

---

## 9. `ReadinessDocumentStatus`

Representa el estado de un documento específico.

```typescript id="ir-dm-document-status"
type ReadinessDocumentStatus = {
  documentStatusId: string;
  readinessRunId: string;
  documentPath: string;
  documentType: ReadinessDocumentType;
  packageId?: string;
  exists: boolean;
  status: ReadinessDocumentCompletenessStatus;
  severityIfMissing: ReadinessSeverity;
  version?: string;
  lastReviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
};
```

Tipos de documento:

```text id="ir-dm-document-types"
constitution
domainMap
architecture
security
apiGuidelines
dataGovernance
adr
spec
plan
dataModel
apiContract
testPlan
tasks
securityNotes
changeImpact
consolidated
readinessChecklist
gapRegister
implementationSequence
```

Estados:

```text id="ir-dm-document-completeness-status"
complete
partial
missing
deferred
blocked
needsReview
obsolete
```

Reglas:

```text id="ir-dm-document-status-rules"
- Paquetes MVP core no pueden tener documentos críticos missing.
- api-contract.md y security-notes.md son críticos para paquetes implementables.
- Documentos obsolete deben bloquear implementación si afectan arquitectura, seguridad o datos.
```

---

## 10. `ReadinessPackageStatus`

Representa el estado de un paquete SDD.

```typescript id="ir-dm-package-status"
type ReadinessPackageStatus = {
  packageId: string;
  packageName: string;
  priority: ReadinessPackagePriority;
  implementationPhase: string;
  status: ReadinessPackageCompletenessStatus;
  requiredForMvp: boolean;
  requiredBeforeSprint?: string;
  documentStatuses: ReadinessDocumentStatus[];
  criticalGapsCount: number;
  highGapsCount: number;
  notes?: string;
};
```

Prioridades:

```text id="ir-dm-package-priority"
mvpCore
mvpExtended
advanced
deferred
technicalClosure
```

Estados:

```text id="ir-dm-package-completeness-status"
ready
conditional
notReady
deferred
blocked
needsReview
```

Reglas:

```text id="ir-dm-package-status-rules"
- mvpCore debe estar ready para iniciar implementación funcional.
- deferred no se implementa hasta nueva decisión.
- blocked impide implementación del paquete y de dependientes.
- conditional requiere gaps no críticos registrados.
```

---

## 11. `ReadinessAdrStatus`

Representa el estado de una decisión arquitectónica.

```typescript id="ir-dm-adr-status"
type ReadinessAdrStatus = {
  adrId: string;
  title: string;
  path: string;
  status: "accepted" | "proposed" | "deprecated" | "superseded" | "needsReview";
  affectsPackages: string[];
  conflictsWith?: string[];
  lastReviewedAt?: string;
  notes?: string;
};
```

Reglas:

```text id="ir-dm-adr-rules"
- ADR deprecated o superseded debe indicar reemplazo.
- ADR needsReview bloquea si afecta Sprint 0, Sprint 1 o seguridad crítica.
- Contradicciones entre ADRs se registran como gaps críticos.
```

---

## 12. `ReadinessChecklistItem`

Representa un punto verificable de preparación.

```typescript id="ir-dm-checklist-item"
type ReadinessChecklistItem = {
  checklistItemId: string;
  readinessRunId: string;
  category: ReadinessChecklistCategory;
  title: string;
  description?: string;
  status: ReadinessChecklistStatus;
  severityIfFailed: ReadinessSeverity;
  evidence?: string;
  affectedPackages?: string[];
  checkedAt?: string;
  checkedBy?: string;
};
```

Categorías:

```text id="ir-dm-checklist-category"
documentation
architecture
multitenancy
authentication
authorization
database
api
openapi
security
testing
cicd
docker
frontend
backend
wordpressBoundary
audit
observability
deployment
```

Estados:

```text id="ir-dm-checklist-status"
pass
fail
notApplicable
notChecked
needsReview
```

Reglas:

```text id="ir-dm-checklist-rules"
- fail con severity critical crea o referencia un gap crítico.
- notChecked en categoría crítica impide GO.
- notApplicable requiere justificación.
```

---

## 13. `ReadinessGap`

Representa una brecha identificada.

```typescript id="ir-dm-gap"
type ReadinessGap = {
  gapId: string;
  code: string;
  readinessRunId: string;
  title: string;
  description: string;
  affectedArea: ReadinessGapArea;
  affectedPackages: string[];
  severity: ReadinessSeverity;
  status: ReadinessGapStatus;
  decision: ReadinessGapDecisionValue;
  requiredBefore: string;
  mitigation?: string;
  owner?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
};
```

Áreas:

```text id="ir-dm-gap-area"
documentation
architecture
multitenancy
authentication
authorization
database
api
openapi
security
testing
cicd
docker
frontend
backend
wordpressBoundary
audit
observability
deployment
```

Severidades:

```text id="ir-dm-severity"
critical
high
medium
low
```

Estados:

```text id="ir-dm-gap-status"
open
inReview
resolved
acceptedRisk
deferred
blocked
```

Reglas:

```text id="ir-dm-gap-rules"
- critical open impide GO.
- high open sin decisión impide GO.
- acceptedRisk debe tener razón y expiración.
- deferred debe indicar antes de qué hito se resuelve.
- Gaps de storageKey, secretos, rutas públicas transaccionales o WordPress como backend no pueden aceptarse como riesgo permanente.
```

---

## 14. `ReadinessGapDecision`

Representa la decisión aplicada a un gap.

```typescript id="ir-dm-gap-decision"
type ReadinessGapDecision = {
  gapDecisionId: string;
  gapId: string;
  decision: ReadinessGapDecisionValue;
  reason: string;
  decidedBy: string;
  decidedAt: string;
  expiresAt?: string;
};
```

Valores:

```text id="ir-dm-gap-decision-values"
resolve-before-implementation
resolve-before-MVP
resolve-before-production
defer
requires-ADR
accepted-risk
```

Reglas:

```text id="ir-dm-gap-decision-rules"
- accepted-risk requiere expiresAt.
- requires-ADR debe crear o referenciar ADR.
- resolve-before-implementation bloquea Sprint 0 si no está resuelto.
```

---

## 15. `ReadinessMatrix`

Representa la matriz consolidada de preparación.

```typescript id="ir-dm-matrix"
type ReadinessMatrix = {
  readinessRunId: string;
  baseDocsScore: number;
  adrScore: number;
  mvpCoreScore: number;
  mvpExtendedScore: number;
  architectureScore: number;
  securityScore: number;
  openApiScore: number;
  testingScore: number;
  ciCdScore: number;
  dockerScore: number;
  frontendScore: number;
  backendScore: number;
  criticalGapsOpen: number;
  highGapsOpen: number;
  mediumGapsOpen: number;
  lowGapsOpen: number;
  recommendedDecision: ReadinessDecisionValue;
  calculatedAt: string;
};
```

Reglas:

```text id="ir-dm-matrix-rules"
- Score no reemplaza revisión humana.
- recommendedDecision no es decisión final.
- GO requiere validaciones booleanas críticas además del score.
- Matrix no debe incluir datos de tenants ni residentes.
```

---

## 16. `ReadinessScore`

Representa puntajes por categoría.

```typescript id="ir-dm-score"
type ReadinessScore = {
  readinessScoreId: string;
  readinessRunId: string;
  category: ReadinessChecklistCategory;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  notCheckedItems: number;
  score: number;
  blocking: boolean;
};
```

Reglas:

```text id="ir-dm-score-rules"
- score se expresa 0 a 100.
- blocking=true si hay fallos críticos.
- score alto no permite GO si hay gap crítico abierto.
```

---

## 17. `ReadinessDecision`

Representa la decisión formal final.

```typescript id="ir-dm-decision"
type ReadinessDecision = {
  decisionId: string;
  readinessRunId: string;
  decision: ReadinessDecisionValue;
  reason: string;
  approvedBy: string;
  approvedAt: string;
  validUntil?: string;
  conditions?: string[];
};
```

Valores:

```text id="ir-dm-decision-values"
go
conditionalGo
noGo
```

Reglas:

```text id="ir-dm-decision-rules"
- GO no permite gaps críticos abiertos.
- Conditional GO debe listar condiciones.
- No-Go debe listar blockers.
- La decisión debe auditarse.
- approvedBy se resuelve server-side si se implementa API.
```

---

## 18. `ReadinessEvidence`

Representa evidencia de revisión.

```typescript id="ir-dm-evidence"
type ReadinessEvidence = {
  evidenceId: string;
  readinessRunId: string;
  relatedEntityType: "document" | "gap" | "checklistItem" | "decision" | "matrix";
  relatedEntityId: string;
  evidenceType: "documentPath" | "markdownNote" | "testOutput" | "ciRun" | "manualReview" | "screenshotReference";
  reference: string;
  description?: string;
  createdAt: string;
};
```

Reglas:

```text id="ir-dm-evidence-rules"
- No adjuntar secretos.
- No adjuntar tokens.
- No adjuntar datos reales de residentes.
- No adjuntar comprobantes reales.
- No adjuntar documentos privados.
- Para archivos, usar secureDocumentId si se almacena en SDS.
- Nunca almacenar storageKey.
```

---

## 19. `ReadinessExport`

Representa una exportación del resultado de readiness.

```typescript id="ir-dm-export"
type ReadinessExport = {
  exportId: string;
  readinessRunId: string;
  format: "markdown" | "pdf" | "json";
  status: "requested" | "processing" | "completed" | "failed";
  secureDocumentId?: string;
  generatedAt?: string;
  requestedBy: string;
};
```

Reglas:

```text id="ir-dm-export-rules"
- Export puede almacenarse por SDS.
- Export no devuelve storageKey.
- Export no debe incluir datos sensibles de negocio.
- Export puede incluir gaps, matriz, decisión y checklist.
```

---

## 20. `ReadinessReviewer`

Representa un revisor autorizado.

```typescript id="ir-dm-reviewer"
type ReadinessReviewer = {
  reviewerId: string;
  userProfileId: string;
  displayName: string;
  role: ReadinessReviewerRole;
  active: boolean;
};
```

Roles:

```text id="ir-dm-reviewer-role"
projectOwner
technicalLead
securityReviewer
qaLead
platformAdmin
```

Reglas:

```text id="ir-dm-reviewer-rules"
- Reviewer no reemplaza roles globales del Core.
- El acceso real se valida por permisos.
- No almacenar password ni credenciales.
```

---

## 21. `ReadinessAuditEvent`

Representa evento auditable de readiness.

```typescript id="ir-dm-audit-event"
type ReadinessAuditEvent = {
  eventId: string;
  readinessRunId: string;
  eventType: ReadinessAuditEventType;
  actorUserProfileId: string;
  occurredAt: string;
  result: "success" | "failure";
  traceId?: string;
  metadataSanitized?: Record<string, unknown>;
};
```

Eventos:

```text id="ir-dm-audit-events"
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

```text id="ir-dm-audit-rules"
- No registrar secretos.
- No registrar tokens.
- No registrar storageKey.
- No registrar datos de residentes.
- metadataSanitized debe aplicar allowlist.
```

---

## 22. Modelo Prisma opcional futuro

Este esquema solo aplica si se decide persistir readiness en PostgreSQL.

```prisma id="ir-dm-prisma"
model ImplementationReadinessRun {
  id            String   @id @default(uuid()) @db.Uuid
  code          String   @unique
  title         String
  description   String?
  scope         String
  status        String
  decision      String?
  startedAt     DateTime @default(now()) @map("started_at")
  evaluatedAt   DateTime? @map("evaluated_at")
  completedAt   DateTime? @map("completed_at")
  notes         String?

  documentStatuses ImplementationReadinessDocumentStatus[]
  packageStatuses  ImplementationReadinessPackageStatus[]
  gaps             ImplementationReadinessGap[]
  matrices         ImplementationReadinessMatrix[]
  decisions        ImplementationReadinessDecision[]
  exports          ImplementationReadinessExport[]

  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("implementation_readiness_runs")
}

model ImplementationReadinessDocumentStatus {
  id                String   @id @default(uuid()) @db.Uuid
  readinessRunId    String   @map("readiness_run_id") @db.Uuid
  documentPath      String   @map("document_path")
  documentType      String   @map("document_type")
  packageId         String?  @map("package_id")
  exists            Boolean
  status            String
  severityIfMissing String   @map("severity_if_missing")
  version           String?
  notes             String?
  lastReviewedAt    DateTime? @map("last_reviewed_at")

  readinessRun      ImplementationReadinessRun @relation(fields: [readinessRunId], references: [id])

  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@index([readinessRunId])
  @@index([packageId])
  @@index([documentType, status])
  @@map("implementation_readiness_document_statuses")
}

model ImplementationReadinessPackageStatus {
  id                 String   @id @default(uuid()) @db.Uuid
  readinessRunId     String   @map("readiness_run_id") @db.Uuid
  packageId          String   @map("package_id")
  packageName        String   @map("package_name")
  priority           String
  implementationPhase String? @map("implementation_phase")
  status             String
  requiredForMvp     Boolean  @map("required_for_mvp")
  requiredBeforeSprint String? @map("required_before_sprint")
  criticalGapsCount  Int      @default(0) @map("critical_gaps_count")
  highGapsCount      Int      @default(0) @map("high_gaps_count")
  notes              String?

  readinessRun       ImplementationReadinessRun @relation(fields: [readinessRunId], references: [id])

  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@unique([readinessRunId, packageId])
  @@index([priority, status])
  @@map("implementation_readiness_package_statuses")
}

model ImplementationReadinessGap {
  id               String   @id @default(uuid()) @db.Uuid
  readinessRunId   String   @map("readiness_run_id") @db.Uuid
  code             String
  title            String
  description      String
  affectedArea     String   @map("affected_area")
  affectedPackages Json     @map("affected_packages")
  severity         String
  status           String
  decision         String
  requiredBefore   String   @map("required_before")
  mitigation       String?
  owner            String?
  resolvedAt       DateTime? @map("resolved_at")

  readinessRun     ImplementationReadinessRun @relation(fields: [readinessRunId], references: [id])
  decisions        ImplementationReadinessGapDecision[]

  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@unique([readinessRunId, code])
  @@index([readinessRunId])
  @@index([severity, status])
  @@index([affectedArea])
  @@map("implementation_readiness_gaps")
}

model ImplementationReadinessGapDecision {
  id          String   @id @default(uuid()) @db.Uuid
  gapId       String   @map("gap_id") @db.Uuid
  decision    String
  reason      String
  decidedBy   String   @map("decided_by")
  decidedAt   DateTime @default(now()) @map("decided_at")
  expiresAt   DateTime? @map("expires_at")

  gap         ImplementationReadinessGap @relation(fields: [gapId], references: [id])

  @@index([gapId])
  @@map("implementation_readiness_gap_decisions")
}

model ImplementationReadinessMatrix {
  id                 String   @id @default(uuid()) @db.Uuid
  readinessRunId     String   @map("readiness_run_id") @db.Uuid
  baseDocsScore      Int      @map("base_docs_score")
  adrScore           Int      @map("adr_score")
  mvpCoreScore       Int      @map("mvp_core_score")
  mvpExtendedScore   Int      @map("mvp_extended_score")
  architectureScore  Int      @map("architecture_score")
  securityScore      Int      @map("security_score")
  openApiScore       Int      @map("openapi_score")
  testingScore       Int      @map("testing_score")
  ciCdScore          Int      @map("ci_cd_score")
  dockerScore        Int      @map("docker_score")
  frontendScore      Int      @map("frontend_score")
  backendScore       Int      @map("backend_score")
  criticalGapsOpen   Int      @map("critical_gaps_open")
  highGapsOpen       Int      @map("high_gaps_open")
  mediumGapsOpen     Int      @map("medium_gaps_open")
  lowGapsOpen        Int      @map("low_gaps_open")
  recommendedDecision String  @map("recommended_decision")
  calculatedAt       DateTime @default(now()) @map("calculated_at")

  readinessRun       ImplementationReadinessRun @relation(fields: [readinessRunId], references: [id])

  @@index([readinessRunId])
  @@map("implementation_readiness_matrices")
}

model ImplementationReadinessDecision {
  id             String   @id @default(uuid()) @db.Uuid
  readinessRunId String   @map("readiness_run_id") @db.Uuid
  decision       String
  reason         String
  approvedBy     String   @map("approved_by")
  approvedAt     DateTime @default(now()) @map("approved_at")
  validUntil     DateTime? @map("valid_until")
  conditions     Json?

  readinessRun   ImplementationReadinessRun @relation(fields: [readinessRunId], references: [id])

  @@index([readinessRunId])
  @@map("implementation_readiness_decisions")
}

model ImplementationReadinessExport {
  id               String   @id @default(uuid()) @db.Uuid
  readinessRunId   String   @map("readiness_run_id") @db.Uuid
  format           String
  status           String
  secureDocumentId String?  @map("secure_document_id") @db.Uuid
  generatedAt      DateTime? @map("generated_at")
  requestedBy      String   @map("requested_by")

  readinessRun     ImplementationReadinessRun @relation(fields: [readinessRunId], references: [id])

  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@index([readinessRunId])
  @@map("implementation_readiness_exports")
}
```

Reglas Prisma:

```text id="ir-dm-prisma-rules"
- Estas tablas son opcionales.
- No usan tenant_id porque son platform-scoped, no tenant transactional.
- No contienen datos de negocio residencial.
- No contienen storageKey.
- No contienen secretos.
- No contienen tokens.
- secureDocumentId puede usarse solo para exports controlados.
```

---

## 23. JSONB permitido

Campos JSON opcionales permitidos:

```text id="ir-dm-json-allowed"
affectedPackages
conditions
metadataSanitized
checklist snapshots
matrix details
non-sensitive evidence metadata
```

Claves prohibidas dentro de JSON:

```text id="ir-dm-json-forbidden"
storageKey
signedUrl
token
secret
password
apiKey
clientSecret
privateKey
databaseUrl
authorization
cookie
residentId
personId
paymentId
chargeId
accountStatementId
receiptRawData
rawSql
script
functionBody
executableCode
```

---

## 24. Matriz de documentos mínima

```text id="ir-dm-min-document-matrix"
docs/sdd/constitution.md -> critical
docs/sdd/domain-map.md -> critical
docs/sdd/architecture.md -> critical
docs/sdd/security.md -> critical
docs/sdd/api-guidelines.md -> critical
docs/sdd/data-governance.md -> critical

docs/decisions/ADR-001-architecture-style.md -> critical
docs/decisions/ADR-002-backend-framework.md -> critical
docs/decisions/ADR-003-database-strategy.md -> critical
docs/decisions/ADR-004-multitenancy-strategy.md -> critical
docs/decisions/ADR-005-authentication-strategy.md -> critical
docs/decisions/ADR-006-identity-provider-strategy.md -> critical
docs/decisions/ADR-007-authorization-strategy.md -> critical
docs/decisions/ADR-011-testing-strategy.md -> high
docs/decisions/ADR-012-ci-cd-strategy.md -> high
```

---

## 25. Matriz de paquetes MVP core

```text id="ir-dm-mvp-core-matrix"
001-tenants -> critical
002-users-roles -> critical
003-residents-properties -> critical
004-dues-fees -> critical
005-payments -> critical
006-account-statements -> critical
007-audit -> critical
016-secure-document-storage -> critical
025-tenant-settings-policies -> high
029-admin-web-app-basic -> high
030-resident-self-service-basic -> high
```

Regla:

```text id="ir-dm-mvp-core-rule"
Todo paquete critical o high requiere spec.md, plan.md, data-model.md, api-contract.md, test-plan.md, tasks.md y security-notes.md antes de implementación.
```

---

## 26. Matriz de decisión Go / Conditional Go / No-Go

```typescript id="ir-dm-decision-matrix"
type GoDecisionInput = {
  criticalGapsOpen: number;
  highGapsWithoutDecision: number;
  mvpCoreComplete: boolean;
  baseDocsComplete: boolean;
  adrsConsistent: boolean;
  multitenancyReady: boolean;
  keycloakReady: boolean;
  openApiReady: boolean;
  ciMinimumReady: boolean;
  securityReady: boolean;
};
```

Reglas:

```text id="ir-dm-go-rules"
GO:
- criticalGapsOpen = 0
- highGapsWithoutDecision = 0
- mvpCoreComplete = true
- baseDocsComplete = true
- adrsConsistent = true
- multitenancyReady = true
- keycloakReady = true
- openApiReady = true
- ciMinimumReady = true
- securityReady = true

CONDITIONAL_GO:
- criticalGapsOpen = 0
- gaps restantes tienen decisión
- Sprint 0-2 no están bloqueados
- condiciones explícitas registradas

NO_GO:
- criticalGapsOpen > 0
- multitenancyReady = false
- keycloakReady = false
- securityReady = false
- openApiReady = false
- ciMinimumReady = false
```

---

## 27. Índices recomendados si se persiste

```text id="ir-dm-indexes"
implementation_readiness_runs(code)
implementation_readiness_runs(status)
implementation_readiness_document_statuses(readiness_run_id)
implementation_readiness_document_statuses(package_id)
implementation_readiness_document_statuses(document_type, status)
implementation_readiness_package_statuses(readiness_run_id, package_id)
implementation_readiness_package_statuses(priority, status)
implementation_readiness_gaps(readiness_run_id)
implementation_readiness_gaps(severity, status)
implementation_readiness_gaps(affected_area)
implementation_readiness_matrices(readiness_run_id)
implementation_readiness_decisions(readiness_run_id)
implementation_readiness_exports(readiness_run_id)
```

---

## 28. Seguridad del modelo

```text id="ir-dm-security"
- Modelo interno de plataforma.
- No público.
- No tenant-facing.
- No resident-facing.
- No WordPress-facing.
- No datos de negocio.
- No storageKey.
- No secretos.
- No tokens.
- No SQL arbitrario.
- No scripts.
- No datos financieros.
- No datos personales.
- Auditoría obligatoria en decisiones.
```

---

## 29. No aceptación

No se acepta este modelo si:

```text id="ir-dm-no-acceptance"
- modela datos de residentes;
- modela datos financieros reales;
- modela estados de cuenta;
- modela pagos;
- modela comprobantes reales;
- almacena documentos privados;
- almacena storageKey;
- almacena secretos;
- almacena tokens;
- ejecuta raw SQL;
- ejecuta scripts;
- permite acceso tenant-facing;
- permite acceso resident-facing;
- depende de WordPress;
- permite GO con gaps críticos abiertos;
- permite acceptedRisk crítico permanente;
- no audita decisiones;
- no registra gaps;
- no diferencia gaps críticos de no bloqueantes.
```

---

## 30. Resultado esperado

```text id="ir-dm-expected-result"
modelo de readiness definido
ReadinessRun definido
ReadinessScope definido
ReadinessDocumentStatus definido
ReadinessPackageStatus definido
ReadinessAdrStatus definido
ReadinessChecklistItem definido
ReadinessGap definido
ReadinessGapDecision definido
ReadinessMatrix definida
ReadinessScore definido
ReadinessDecision definida
ReadinessEvidence definida
ReadinessExport definido
ReadinessReviewer definido
ReadinessAuditEvent definido
Prisma opcional definido
matriz documental definida
matriz MVP core definida
reglas Go/Conditional Go/No-Go definidas
seguridad del modelo definida
no datos de negocio
no storageKey
no secrets
no WordPress
no tenant-facing
no resident-facing
```

---

## 31. Expediente actualizado

```text id="ir-dm-expediente"
resident-core/
├── docs/
│   ├── specs/
│   │   └── 031-implementation-readiness/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       └── api-contract.md
```
