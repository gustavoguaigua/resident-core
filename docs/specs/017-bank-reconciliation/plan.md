# Plan — Spec 017 Bank Reconciliation

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                            |
| Spec ID         | 017                                                                                                                                                                                      |
| Módulo          | Bank Reconciliation                                                                                                                                                                      |
| Documento       | Plan técnico                                                                                                                                                                             |
| Ruta            | `docs/specs/017-bank-reconciliation/plan.md`                                                                                                                                             |
| Versión         | 0.1                                                                                                                                                                                      |
| Estado          | Borrador inicial                                                                                                                                                                         |
| Fecha           | 2026-07-21                                                                                                                                                                               |
| Documento base  | `docs/specs/017-bank-reconciliation/spec.md`                                                                                                                                             |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage` |
| Relacionado con | cuentas bancarias, movimientos bancarios, pagos, comprobantes, estados de cuenta, reportes financieros, importaciones, conciliación, excepciones, auditoría                              |
| API Style       | REST                                                                                                                                                                                     |
| Arquitectura    | Monolito modular preparado para microservicios                                                                                                                                           |
| Stack objetivo  | NestJS, TypeScript, PostgreSQL, Prisma, Decimal, OpenAPI, Secure Document Storage, Docker                                                                                                |

---

## 2. Propósito

Este documento define el plan técnico para implementar el módulo `017-bank-reconciliation`.

El módulo permitirá registrar cuentas bancarias, importar movimientos desde archivos bancarios, normalizar transacciones, detectar duplicados, comparar movimientos con pagos registrados, generar candidatos de conciliación, confirmar conciliaciones, gestionar excepciones, revertir conciliaciones y cerrar sesiones de conciliación.

Regla central:

```text id="l8kx4x"
Bank Reconciliation debe ser un módulo financiero tenant-scoped, import-driven, duplicate-safe, payment-aware, match-aware, exception-aware, audit-heavy, reversible y sin exposición pública.
```

---

## 3. Decisión técnica inicial

### 3.1. Nombre técnico del módulo

```text id="s20v4q"
bank-reconciliation
```

---

### 3.2. Ruta sugerida

```text id="fje3nb"
apps/api/src/modules/bank-reconciliation/
```

---

### 3.3. Tipo de módulo

```text id="m9sv0m"
Financial-control module
Tenant-scoped
Bank-account-aware
Import-driven
File-backed
Duplicate-safe
Payment-aware
Match-aware
Exception-aware
Session-based
Audit-heavy
Report-ready
Non-public
```

---

### 3.4. Estilo arquitectónico

El módulo seguirá el estilo general de RESIDENT Core:

```text id="zbnvb7"
monolito modular
API-first
NestJS
TypeScript
PostgreSQL
Prisma
REST
OpenAPI
Keycloak/OIDC para autenticación
autorización propia dentro de RESIDENT Core
Decimal para dinero
Secure Document Storage para archivos importados
auditoría financiera obligatoria
observabilidad segura
preparado para jobs asíncronos futuros
```

---

## 4. Decisión MVP

Para MVP se implementará:

```text id="pyj5x4"
- registro de cuentas bancarias por tenant;
- activación, desactivación y archivo lógico de cuentas bancarias;
- protección de número de cuenta mediante accountNumberMasked y accountNumberHash;
- importación CSV/XLSX;
- almacenamiento del archivo importado en Secure Document Storage;
- validación de formato;
- normalización de movimientos;
- fingerprint determinístico por movimiento;
- detección de duplicados;
- sesiones de conciliación por cuenta y periodo;
- listado de movimientos bancarios;
- listado de pagos conciliables;
- generación determinística de candidatos;
- match score explicable;
- aceptación y rechazo de candidatos;
- confirmación manual de matches;
- conciliación 1:1;
- conciliación 1:N;
- conciliación N:1;
- registro de differenceAmount y differenceReason;
- registro de excepciones;
- resolución e ignorado de excepciones;
- reverso de conciliaciones;
- cierre y reapertura controlada de sesiones;
- reportes básicos de conciliación;
- integración con Payments;
- integración con Account Statements;
- integración con Basic Reports;
- auditoría estricta;
- no endpoints públicos;
- no IA con datos reales;
- no conexión directa con bancos.
```

---

## 5. Fuera de alcance técnico MVP

No implementar en esta spec:

```text id="ra3glx"
- Open Banking;
- APIs bancarias reales;
- scraping bancario;
- sincronización automática con bancos;
- OCR de estados bancarios PDF;
- conciliación automática irreversible;
- creación automática de pagos confirmados;
- reversos financieros automáticos;
- asientos contables;
- plan de cuentas;
- contabilidad completa;
- tesorería avanzada;
- pagos a proveedores;
- multi-moneda avanzada;
- pasarelas de pago;
- tarjetas de crédito;
- reglas contables avanzadas;
- IA con datos financieros reales;
- predicción automática de matches con modelos externos;
- firma electrónica;
- certificación legal de estados bancarios;
- integración SRI;
- generación de libros contables oficiales.
```

---

## 6. Dependencias funcionales

### 6.1. `001-tenants`

Uso:

```text id="b50ide"
- validar tenant activo;
- aplicar tenant_id a todas las entidades;
- impedir cuentas bancarias cross-tenant;
- impedir movimientos cross-tenant;
- impedir conciliaciones cross-tenant;
- impedir reportes cross-tenant.
```

---

### 6.2. `002-users-roles`

Uso:

```text id="nyimlp"
- validar usuario autenticado;
- validar membership activa;
- validar permisos financieros;
- validar roles administrativos;
- impedir acceso automático de PlatformAdmin a datos bancarios tenant;
- auditar actor real.
```

---

### 6.3. `003-residents-properties`

Uso indirecto:

```text id="xq2ydi"
- resolver unidad habitacional asociada a pagos;
- vincular pagos conciliados con propietarios o residentes;
- apoyar reportes por unidad;
- evitar exposición bancaria directa en /me.
```

---

### 6.4. `004-dues-fees`

Uso indirecto:

```text id="nqmgr9"
- los cargos originan saldos a pagar;
- la conciliación no crea cargos;
- la conciliación puede apoyar trazabilidad financiera, pero no modifica conceptos de cobro.
```

---

### 6.5. `005-payments`

Dependencia crítica.

Uso:

```text id="uyfm9z"
- consultar pagos conciliables;
- validar pagos por tenant;
- impedir pagos cross-tenant;
- impedir conciliación de pagos rejected/cancelled/reversed/archived;
- actualizar reconciliationStatus del pago;
- asociar paymentId con reconciliationMatchId;
- consultar comprobantes para scoring;
- generar excepción paymentWithoutBankTransaction.
```

---

### 6.6. `006-account-statements`

Uso:

```text id="xf39un"
- permitir que estados de cuenta reflejen pagos conciliados;
- no reconstruir estado de cuenta desde movimientos bancarios;
- mantener cargos y pagos como fuente financiera primaria;
- enriquecer líneas o metadata con estado de conciliación cuando aplique.
```

---

### 6.7. `007-audit`

Uso:

```text id="adytit"
- auditar cuentas bancarias;
- auditar importaciones;
- auditar movimientos;
- auditar generación de candidatos;
- auditar confirmación de matches;
- auditar reversos;
- auditar excepciones;
- auditar cierres y reaperturas;
- auditar intentos cross-tenant;
- sanitizar datos bancarios.
```

---

### 6.8. `008-basic-reports`

Uso:

```text id="iefu3z"
- alimentar reportes de movimientos conciliados;
- alimentar reportes de movimientos pendientes;
- alimentar reportes de pagos no conciliados;
- alimentar reportes de excepciones;
- alimentar reportes de saldos bancarios importados.
```

---

### 6.9. `016-secure-document-storage`

Uso:

```text id="zs0ps8"
- almacenar CSV/XLSX importados;
- registrar secureDocumentId;
- registrar secureDocumentFileId;
- proteger storageKey;
- controlar descarga del archivo importado;
- clasificar archivo como restricted;
- auditar acceso documental.
```

Recomendación técnica:

```text id="yz969e"
Extender SourceModule de Secure Document Storage con bankReconciliation.
```

Alternativa temporal:

```text id="k1ll9d"
Usar sourceModule=other con policy estricta, solo si no se modifica 016 en esta iteración.
```

Decisión recomendada:

```text id="uzymad"
Agregar bankReconciliation como SourceModule explícito, porque el módulo bancario será fuente documental recurrente y crítica.
```

---

## 7. Estructura de carpetas propuesta

```text id="jrqhjj"
apps/api/src/modules/bank-reconciliation/
├── bank-reconciliation.module.ts
├── controllers/
│   ├── bank-accounts.controller.ts
│   ├── bank-statement-imports.controller.ts
│   ├── bank-transactions.controller.ts
│   ├── reconciliation-sessions.controller.ts
│   ├── reconciliation-candidates.controller.ts
│   ├── reconciliation-matches.controller.ts
│   ├── reconciliation-exceptions.controller.ts
│   └── reconciliation-reports.controller.ts
│
├── application/
│   ├── use-cases/
│   ├── services/
│   └── ports/
│
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
│
├── infrastructure/
│   ├── persistence/
│   ├── parsers/
│   ├── matching/
│   ├── integrations/
│   ├── audit/
│   └── reports/
│
├── dto/
├── guards/
├── policies/
├── mappers/
└── tests/
```

---

## 8. Componentes principales

### 8.1. Módulo NestJS

```text id="epy102"
BankReconciliationModule
```

Responsabilidades:

```text id="nvsvtr"
- registrar controladores;
- registrar servicios de aplicación;
- registrar repositorios;
- registrar parsers CSV/XLSX;
- registrar servicios de fingerprint;
- registrar motor de candidatos;
- registrar políticas de conciliación;
- registrar adapters con Payments;
- registrar adapters con Secure Document Storage;
- registrar auditoría financiera;
- registrar reportes básicos;
- exponer API REST;
- publicar OpenAPI seguro.
```

---

### 8.2. Controladores

```text id="qbok3a"
BankAccountsController
BankStatementImportsController
BankTransactionsController
ReconciliationSessionsController
ReconciliationCandidatesController
ReconciliationMatchesController
ReconciliationExceptionsController
ReconciliationReportsController
```

---

### 8.3. Servicios de aplicación

```text id="f9r7j1"
BankAccountService
BankStatementImportService
BankStatementParserService
BankStatementValidationService
BankTransactionNormalizationService
BankTransactionFingerprintService
BankTransactionService
ReconciliationSessionService
ReconciliationCandidateService
ReconciliationScoringService
ReconciliationMatchService
ReconciliationMatchConfirmationService
ReconciliationMatchReversalService
ReconciliationExceptionService
ReconciliationReportService
PaymentReconciliationService
BankReconciliationAuditService
BankReconciliationObservabilityService
```

---

### 8.4. Entidades de dominio

```text id="xjlsml"
BankAccount
BankStatementImport
BankStatementImportError
BankTransaction
ReconciliationSession
ReconciliationCandidate
ReconciliationMatch
ReconciliationMatchItem
ReconciliationException
```

---

### 8.5. Value Objects

```text id="z032su"
BankAccountName
BankName
BankAccountNumberMasked
BankAccountNumberHash
BankAccountType
CurrencyCode
BankStatementImportPeriod
BankStatementImportFingerprint
BankTransactionReference
BankTransactionDescription
BankTransactionFingerprint
BankTransactionAmount
BankTransactionDirection
BankTransactionType
ReconciliationPeriod
ReconciliationScore
ReconciliationScoreReason
ReconciliationDifferenceAmount
ReconciliationDifferenceReason
ReconciliationExceptionSeverity
ReconciliationCloseReason
ReconciliationReopenReason
```

---

### 8.6. Puertos de aplicación

```text id="k74q7p"
BankAccountRepositoryPort
BankStatementImportRepositoryPort
BankStatementImportErrorRepositoryPort
BankTransactionRepositoryPort
ReconciliationSessionRepositoryPort
ReconciliationCandidateRepositoryPort
ReconciliationMatchRepositoryPort
ReconciliationMatchItemRepositoryPort
ReconciliationExceptionRepositoryPort

BankStatementParserPort
BankStatementTemplatePort
BankTransactionFingerprintPort
ReconciliationScoringPort
PaymentReconciliationPort
SecureDocumentStoragePort
AuditPort
ClockPort
IdempotencyPort
ReportExportPort
ObservabilityPort
```

---

### 8.7. Repositorios Prisma

```text id="xiyjs5"
PrismaBankAccountRepository
PrismaBankStatementImportRepository
PrismaBankStatementImportErrorRepository
PrismaBankTransactionRepository
PrismaReconciliationSessionRepository
PrismaReconciliationCandidateRepository
PrismaReconciliationMatchRepository
PrismaReconciliationMatchItemRepository
PrismaReconciliationExceptionRepository
```

---

## 9. Modelo de datos previsto

### 9.1. Tablas nuevas MVP

```text id="aiyicx"
bank_accounts
bank_statement_imports
bank_statement_import_errors
bank_transactions
reconciliation_sessions
reconciliation_candidates
reconciliation_matches
reconciliation_match_items
reconciliation_exceptions
```

---

### 9.2. Tablas externas relacionadas

```text id="oz92wy"
tenants
user_profiles
property_units
payments
payment_receipts
payment_allocations
payment_reversals
account_statements
secure_documents
secure_document_files
audit_logs
```

---

### 9.3. Regla multitenant

Todas las tablas nuevas deben incluir:

```text id="ft6nsm"
tenant_id
```

Regla obligatoria:

```text id="ggticz"
Toda consulta debe filtrar por tenant_id.
```

Patrón requerido:

```typescript id="c1yk11"
await prisma.bankTransaction.findFirst({
  where: {
    id: bankTransactionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="wbpgq3"
await prisma.bankTransaction.findUnique({
  where: { id: bankTransactionId }
});
```

---

## 10. Diseño de estados

### 10.1. BankAccount

Estados:

```text id="mdrtwc"
draft
active
inactive
archived
```

Transiciones permitidas:

```text id="iyvtfo"
draft -> active
active -> inactive
inactive -> active
active -> archived
inactive -> archived
draft -> archived
```

Transiciones prohibidas:

```text id="ta05nb"
archived -> active sin restauración futura explícita
archived -> inactive
```

---

### 10.2. BankStatementImport

Estados:

```text id="ixnllz"
uploaded
validating
validated
processing
processed
processedWithWarnings
failed
cancelled
archived
```

Transiciones permitidas:

```text id="p2c72b"
uploaded -> validating
validating -> validated
validating -> failed
validated -> processing
processing -> processed
processing -> processedWithWarnings
processing -> failed
validated -> cancelled
failed -> archived
processed -> archived
processedWithWarnings -> archived
cancelled -> archived
```

Transiciones prohibidas:

```text id="akyxqs"
processed -> processing
archived -> processing
cancelled -> processing
failed -> processed sin reproceso explícito futuro
```

---

### 10.3. BankTransaction

Estados:

```text id="v095lq"
pending
candidateFound
matched
partiallyMatched
unmatched
duplicate
ignored
exception
archived
```

Transiciones permitidas:

```text id="xuwe0q"
pending -> candidateFound
pending -> unmatched
pending -> matched
pending -> duplicate
pending -> ignored
pending -> exception
candidateFound -> matched
candidateFound -> unmatched
candidateFound -> ignored
candidateFound -> exception
matched -> partiallyMatched
matched -> unmatched
partiallyMatched -> matched
unmatched -> candidateFound
unmatched -> exception
exception -> matched
exception -> ignored
matched -> archived
unmatched -> archived
ignored -> archived
duplicate -> archived
```

Transiciones prohibidas:

```text id="avhj86"
archived -> matched
duplicate -> matched sin override auditado
ignored -> matched sin reactivación auditada
```

---

### 10.4. ReconciliationSession

Estados:

```text id="km2twk"
draft
open
reviewing
closed
reopened
archived
```

Transiciones permitidas:

```text id="svixyr"
draft -> open
open -> reviewing
reviewing -> closed
closed -> reopened
reopened -> reviewing
closed -> archived
```

Transiciones prohibidas:

```text id="wxvba5"
closed -> open sin acción reopen
archived -> reviewing
archived -> closed
```

---

### 10.5. ReconciliationCandidate

Estados:

```text id="ni4fia"
suggested
accepted
rejected
expired
superseded
archived
```

Transiciones permitidas:

```text id="bd9rt3"
suggested -> accepted
suggested -> rejected
suggested -> expired
suggested -> superseded
accepted -> superseded
rejected -> archived
expired -> archived
superseded -> archived
```

---

### 10.6. ReconciliationMatch

Estados:

```text id="j2l9ji"
confirmed
reversed
archived
```

Transiciones permitidas:

```text id="llansz"
confirmed -> reversed
confirmed -> archived
reversed -> archived
```

Transiciones prohibidas:

```text id="w2j1fp"
reversed -> confirmed
archived -> confirmed
```

---

### 10.7. ReconciliationException

Estados:

```text id="i22dww"
open
inReview
resolved
ignored
archived
```

Transiciones permitidas:

```text id="i8mxob"
open -> inReview
open -> resolved
open -> ignored
inReview -> resolved
inReview -> ignored
resolved -> archived
ignored -> archived
```

---

## 11. Estrategia de importación

### 11.1. Formatos MVP

```text id="l6vm1t"
CSV
XLSX
```

---

### 11.2. Flujo de importación

```text id="l2y2ns"
1. Usuario selecciona bankAccount active.
2. Usuario sube archivo CSV/XLSX.
3. API valida permiso.
4. API valida tenant.
5. API valida cuenta bancaria.
6. Archivo se registra en Secure Document Storage.
7. Se crea BankStatementImport en estado uploaded.
8. Se calcula fileHash.
9. Se valida formato.
10. Se normalizan filas.
11. Se detectan errores.
12. Se detectan duplicados.
13. Se crean BankTransactions válidos.
14. Se registran errores por fila.
15. Import pasa a processed o processedWithWarnings.
16. Se audita todo el flujo.
```

---

### 11.3. Validaciones de archivo

```text id="ia7nrq"
- archivo no vacío;
- MIME type permitido;
- extensión permitida;
- tamaño dentro del límite;
- fileHash calculado;
- archivo registrado en Secure Document Storage;
- storageKey no expuesto;
- CSV/XLSX parseable;
- columnas mínimas presentes;
- fechas válidas;
- montos válidos;
- moneda soportada;
- dirección válida;
- filas inválidas registradas sin abortar todo el archivo si política lo permite.
```

---

### 11.4. Columnas mínimas recomendadas

Formato genérico inicial:

```text id="xjfu4o"
transactionDate
postedDate opcional
description
reference opcional
bankReference opcional
direction
amount
currency
balanceAfter opcional
```

---

### 11.5. Plantillas por banco

Para MVP se recomienda:

```text id="uwytyv"
GenericCsvBankStatementTemplate
GenericXlsxBankStatementTemplate
```

Quedan diferidas plantillas específicas:

```text id="ikklo6"
BancoPichinchaTemplate
BancoGuayaquilTemplate
BancoPacificoTemplate
ProdubancoTemplate
CooperativaTemplate
```

---

### 11.6. Procesamiento síncrono/asíncrono

MVP:

```text id="v8dqu6"
Procesamiento síncrono para archivos pequeños/medianos.
```

Preparación futura:

```text id="qad3lu"
Job asíncrono con BullMQ para importaciones grandes.
```

Criterio sugerido:

```text id="fp96pd"
Si totalRows > threshold, devolver 202 Accepted y procesar en background job futuro.
```

En MVP, si no existe job queue implementado, rechazar archivos demasiado grandes con error controlado.

---

## 12. Estrategia de fingerprint y duplicados

### 12.1. Fingerprint de movimiento

Cada movimiento debe tener fingerprint determinístico.

Campos sugeridos:

```text id="tfasdw"
tenantId
bankAccountId
transactionDate
postedDate
direction
amount
currency
reference normalizada
bankReference normalizada
description normalizada
```

---

### 12.2. Normalización para fingerprint

```text id="mgj6z1"
- trim;
- uppercase o lowercase consistente;
- colapsar espacios;
- normalizar saltos de línea;
- remover caracteres invisibles;
- normalizar fechas a ISO UTC/date;
- normalizar montos a Decimal string;
- normalizar moneda;
- normalizar referencias vacías a null;
```

---

### 12.3. Hash

Algoritmo:

```text id="ejwo10"
SHA-256
```

Uso:

```text id="niqoy3"
transactionFingerprint = SHA-256(canonicalBankTransactionInput)
```

---

### 12.4. Detección de duplicados

Reglas:

```text id="s73hg7"
- si fingerprint ya existe en misma cuenta y tenant, marcar duplicado;
- si fingerprint existe dentro del mismo import, marcar fila duplicada;
- duplicado no se concilia por defecto;
- duplicado puede tener override administrativo futuro;
- duplicado debe auditarse.
```

---

### 12.5. Índice recomendado

```text id="cgsalu"
UNIQUE parcial o índice por tenant_id + bank_account_id + fingerprint
```

La decisión exacta se detallará en `data-model.md`.

---

## 13. Estrategia de matching

### 13.1. Principio

El matching en MVP debe ser determinístico, explicable y reversible.

```text id="fjwxik"
El sistema sugiere; el usuario autorizado confirma.
```

---

### 13.2. Candidatos

Un candidato no modifica:

```text id="wz4mtu"
- payments;
- payment_allocations;
- account_statements;
- bank_transactions;
- balances;
- reports persistidos.
```

Solo representa una sugerencia.

---

### 13.3. Factores de score

```text id="g9v9ab"
amount exact match
date proximity
paymentDate proximity
reportedAt proximity
bank reference match
payment reference match
receipt number match
receipt filename/text metadata match
property unit hint
payer name partial hint
description normalized similarity
same currency
bank account consistency
```

---

### 13.4. Score sugerido

Rango:

```text id="wysuy7"
0 a 100
```

Bandas:

```text id="an80ga"
90-100 = alta confianza
70-89 = confianza media
50-69 = baja confianza
0-49 = no sugerir por defecto
```

---

### 13.5. Reglas base de scoring

MVP recomendado:

```text id="cs7vyb"
+50 monto exacto
+20 fecha dentro de 1 día
+15 referencia coincide total o parcialmente
+10 descripción contiene número de unidad o comprobante
+5 misma moneda y cuenta esperada
-30 monto diferente
-20 fecha fuera de tolerancia
-50 pago no conciliable
-50 movimiento no conciliable
```

Estas ponderaciones son iniciales y deben parametrizarse en código como constantes controladas.

---

### 13.6. Tolerancia

MVP recomendado:

```text id="l9avgz"
amountTolerance = 0.00
dateToleranceDays = 3
```

La tolerancia monetaria mayor a cero queda diferida.

---

### 13.7. Tipos de match MVP

```text id="gehn6p"
oneBankTransactionToOnePayment
oneBankTransactionToManyPayments
manyBankTransactionsToOnePayment
manual
```

Diferido:

```text id="f3jfjl"
manyToMany
```

---

### 13.8. Confirmación

Todo match confirmado debe:

```text id="dzxx8s"
- validar tenant;
- validar sesión abierta/reviewing/reopened;
- validar bankTransactions;
- validar payments;
- validar estados conciliables;
- validar montos;
- crear reconciliationMatch;
- crear reconciliationMatchItems;
- actualizar bankTransaction.status;
- actualizar payment.reconciliationStatus;
- registrar differenceAmount si existe;
- requerir differenceReason si existe diferencia;
- auditar reconciliationMatch.confirmed.
```

---

### 13.9. Reverso

Todo reverso debe:

```text id="i03zub"
- requerir razón;
- requerir permiso;
- validar tenant;
- validar match confirmed;
- cambiar match a reversed;
- restaurar estados de bankTransactions;
- restaurar reconciliationStatus de payments;
- no eliminar items;
- auditar reconciliationMatch.reversed.
```

---

## 14. Estrategia de sesiones de conciliación

### 14.1. Propósito

Una sesión agrupa conciliación por:

```text id="f5v2z2"
tenant
bankAccount
periodStart
periodEnd
```

---

### 14.2. Reglas

```text id="begghl"
- no debe existir más de una sesión open/reviewing/reopened para misma cuenta y periodo;
- closed bloquea cambios ordinarios;
- reopen requiere permiso explícito;
- cierre puede exigir resolución de excepciones críticas;
- archive no elimina historial.
```

---

### 14.3. Cierre de sesión

Antes de cerrar:

```text id="am8hpz"
- validar movimientos pendientes;
- validar excepciones abiertas;
- calcular resumen;
- registrar saldos;
- registrar totales;
- auditar cierre;
- bloquear cambios posteriores.
```

Política recomendada:

```text id="kbt270"
No permitir cierre si existen excepciones high o critical abiertas.
```

---

## 15. Estrategia de excepciones

### 15.1. Tipos MVP

```text id="rdwqpq"
bankTransactionWithoutPayment
paymentWithoutBankTransaction
amountMismatch
dateMismatch
ambiguousReference
duplicateBankTransaction
duplicatePaymentCandidate
bankFee
interest
reversal
transferBetweenAccounts
unknownDeposit
manualReview
other
```

---

### 15.2. Severidades

```text id="gh6oai"
low
medium
high
critical
```

---

### 15.3. Reglas

```text id="jbs8yk"
- excepción open debe tener tipo;
- excepción open debe tener severidad;
- excepción debe vincular bankTransactionId o paymentId cuando aplique;
- resolución requiere notas;
- ignored requiere razón;
- no se elimina físicamente;
- excepciones high/critical pueden impedir cierre.
```

---

## 16. Estrategia de integración con Payments

### 16.1. Adaptador

Crear puerto:

```typescript id="wevw1r"
interface PaymentReconciliationPort {
  findReconciliablePayments(input: FindReconciliablePaymentsInput): Promise<ReconciliablePayment[]>;
  getPaymentForReconciliation(input: GetPaymentForReconciliationInput): Promise<ReconciliablePayment | null>;
  markPaymentReconciled(input: MarkPaymentReconciledInput): Promise<void>;
  markPaymentPartiallyReconciled(input: MarkPaymentPartiallyReconciledInput): Promise<void>;
  reversePaymentReconciliation(input: ReversePaymentReconciliationInput): Promise<void>;
}
```

---

### 16.2. Estados conciliables

Estados recomendados:

```text id="x7nh6f"
confirmed
partiallyAllocated
allocated
```

Estados no conciliables:

```text id="ki0nbx"
draft
reported
pendingValidation
rejected
cancelled
reversed
archived
```

---

### 16.3. Estado de conciliación del pago

Opción recomendada:

Agregar campos a `payments`:

```text id="v1yb8q"
reconciliationStatus
reconciledAt
reconciledBy
reconciliationMatchId
```

Estados sugeridos:

```text id="e2i2x6"
notRequired
pending
candidateFound
reconciled
partiallyReconciled
reconciliationException
reconciliationReversed
```

Alternativa:

```text id="qq235c"
Crear tabla auxiliar payment_reconciliation_links si se desea evitar modificar payments.
```

Decisión recomendada MVP:

```text id="mfuufb"
Agregar campos mínimos de reconciliationStatus en payments y usar reconciliation_match_items para detalle.
```

---

## 17. Integración con Account Statements

El módulo no debe recalcular saldos desde movimientos bancarios.

Regla:

```text id="v421v0"
Account Statements sigue derivando saldos desde cargos, ajustes, reversos, pagos y asignaciones auditables.
```

Uso permitido:

```text id="mu63sr"
- mostrar estado conciliado del pago;
- filtrar pagos conciliados/no conciliados;
- enriquecer reportes administrativos;
- agregar metadata financiera segura.
```

Prohibido:

```text id="jth8h0"
- sustituir pagos por movimientos bancarios;
- generar cargos desde movimientos;
- modificar saldos por movimientos no conciliados;
- ocultar pagos no conciliados.
```

---

## 18. Integración con Secure Document Storage

### 18.1. Documento importado

Cada importación debe crear un documento seguro:

```text id="uwe1e9"
category = administrativeDocument
sourceModule = bankReconciliation
sourceResourceType = bankStatementImport
sourceResourceId = bankStatementImportId
sensitivity = restricted
visibility = administrative
ownerType = tenant
```

---

### 18.2. Archivo importado

El archivo CSV/XLSX queda asociado a:

```text id="qru39z"
secureDocumentId
secureDocumentFileId
```

---

### 18.3. Seguridad

Reglas:

```text id="c086ro"
- no exponer storageKey;
- no descargar archivo importado sin permiso financiero;
- no permitir /me;
- no permitir public endpoints;
- auditar descarga del archivo bancario;
- usar Secure Document Storage para validación MIME y hash.
```

---

## 19. API prevista

### 19.1. Cuentas bancarias

```text id="e4c1ol"
GET    /api/v1/tenant/bank-accounts
POST   /api/v1/tenant/bank-accounts
GET    /api/v1/tenant/bank-accounts/{bankAccountId}
PATCH  /api/v1/tenant/bank-accounts/{bankAccountId}
POST   /api/v1/tenant/bank-accounts/{bankAccountId}/activate
POST   /api/v1/tenant/bank-accounts/{bankAccountId}/deactivate
POST   /api/v1/tenant/bank-accounts/{bankAccountId}/archive
```

---

### 19.2. Importaciones bancarias

```text id="nkfr32"
GET    /api/v1/tenant/bank-statement-imports
POST   /api/v1/tenant/bank-accounts/{bankAccountId}/statement-imports
GET    /api/v1/tenant/bank-statement-imports/{importId}
POST   /api/v1/tenant/bank-statement-imports/{importId}/validate
POST   /api/v1/tenant/bank-statement-imports/{importId}/process
POST   /api/v1/tenant/bank-statement-imports/{importId}/cancel
POST   /api/v1/tenant/bank-statement-imports/{importId}/archive
GET    /api/v1/tenant/bank-statement-imports/{importId}/errors
```

---

### 19.3. Movimientos bancarios

```text id="sa27am"
GET    /api/v1/tenant/bank-transactions
GET    /api/v1/tenant/bank-transactions/{bankTransactionId}
PATCH  /api/v1/tenant/bank-transactions/{bankTransactionId}/classification
POST   /api/v1/tenant/bank-transactions/{bankTransactionId}/ignore
POST   /api/v1/tenant/bank-transactions/{bankTransactionId}/archive
```

---

### 19.4. Sesiones de conciliación

```text id="rwiq55"
GET    /api/v1/tenant/reconciliation-sessions
POST   /api/v1/tenant/reconciliation-sessions
GET    /api/v1/tenant/reconciliation-sessions/{sessionId}
PATCH  /api/v1/tenant/reconciliation-sessions/{sessionId}
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/open
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/close
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/reopen
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/archive
GET    /api/v1/tenant/reconciliation-sessions/{sessionId}/summary
```

---

### 19.5. Candidatos

```text id="fp0w1i"
GET    /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates/generate
GET    /api/v1/tenant/reconciliation-candidates/{candidateId}
POST   /api/v1/tenant/reconciliation-candidates/{candidateId}/accept
POST   /api/v1/tenant/reconciliation-candidates/{candidateId}/reject
```

---

### 19.6. Matches

```text id="vnloce"
GET    /api/v1/tenant/reconciliation-sessions/{sessionId}/matches
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/matches
GET    /api/v1/tenant/reconciliation-matches/{matchId}
POST   /api/v1/tenant/reconciliation-matches/{matchId}/confirm
POST   /api/v1/tenant/reconciliation-matches/{matchId}/reverse
POST   /api/v1/tenant/reconciliation-matches/{matchId}/archive
```

---

### 19.7. Excepciones

```text id="d3pv9s"
GET    /api/v1/tenant/reconciliation-sessions/{sessionId}/exceptions
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/exceptions
GET    /api/v1/tenant/reconciliation-exceptions/{exceptionId}
PATCH  /api/v1/tenant/reconciliation-exceptions/{exceptionId}
POST   /api/v1/tenant/reconciliation-exceptions/{exceptionId}/resolve
POST   /api/v1/tenant/reconciliation-exceptions/{exceptionId}/ignore
POST   /api/v1/tenant/reconciliation-exceptions/{exceptionId}/archive
```

---

### 19.8. Reportes

```text id="gc1cfa"
GET    /api/v1/tenant/reconciliation-reports/summary
GET    /api/v1/tenant/reconciliation-reports/unmatched-bank-transactions
GET    /api/v1/tenant/reconciliation-reports/unmatched-payments
GET    /api/v1/tenant/reconciliation-reports/exceptions
GET    /api/v1/tenant/reconciliation-reports/bank-account-balances
GET    /api/v1/tenant/reconciliation-reports/export
```

---

### 19.9. Endpoints `/me`

No se implementan endpoints `/me` directos en MVP.

La información propia debe exponerse desde:

```text id="yg0o3e"
005-payments
006-account-statements
```

Endpoint futuro opcional:

```text id="a32dwf"
GET /api/v1/me/payments/{paymentId}/reconciliation-status
```

---

### 19.10. Endpoints públicos prohibidos

```text id="i7w2hs"
GET /api/v1/public/bank-accounts
GET /api/v1/public/bank-transactions
GET /api/v1/public/reconciliation-sessions
GET /api/v1/public/reconciliation-reports
GET /api/v1/public/tenants/{slug}/bank-transactions
GET /api/v1/public/tenants/{slug}/reconciliation-reports
```

---

## 20. DTOs previstos

### 20.1. Bank Accounts

```text id="bl1io9"
CreateBankAccountDto
UpdateBankAccountDto
ActivateBankAccountDto
DeactivateBankAccountDto
ArchiveBankAccountDto
BankAccountDto
BankAccountListItemDto
BankAccountFilterDto
```

---

### 20.2. Bank Statement Imports

```text id="bus7bl"
CreateBankStatementImportDto
ValidateBankStatementImportDto
ProcessBankStatementImportDto
CancelBankStatementImportDto
ArchiveBankStatementImportDto
BankStatementImportDto
BankStatementImportListItemDto
BankStatementImportErrorDto
BankStatementImportFilterDto
```

---

### 20.3. Bank Transactions

```text id="igbzkm"
BankTransactionDto
BankTransactionListItemDto
BankTransactionFilterDto
UpdateBankTransactionClassificationDto
IgnoreBankTransactionDto
ArchiveBankTransactionDto
```

---

### 20.4. Reconciliation Sessions

```text id="cafm8x"
CreateReconciliationSessionDto
UpdateReconciliationSessionDto
OpenReconciliationSessionDto
CloseReconciliationSessionDto
ReopenReconciliationSessionDto
ArchiveReconciliationSessionDto
ReconciliationSessionDto
ReconciliationSessionListItemDto
ReconciliationSessionSummaryDto
ReconciliationSessionFilterDto
```

---

### 20.5. Candidates

```text id="qi3roe"
GenerateReconciliationCandidatesDto
ReconciliationCandidateDto
ReconciliationCandidateListItemDto
AcceptReconciliationCandidateDto
RejectReconciliationCandidateDto
ReconciliationCandidateFilterDto
```

---

### 20.6. Matches

```text id="azc2v2"
CreateReconciliationMatchDto
ConfirmReconciliationMatchDto
ReverseReconciliationMatchDto
ArchiveReconciliationMatchDto
ReconciliationMatchDto
ReconciliationMatchListItemDto
ReconciliationMatchItemDto
```

---

### 20.7. Exceptions

```text id="sfvycy"
CreateReconciliationExceptionDto
UpdateReconciliationExceptionDto
ResolveReconciliationExceptionDto
IgnoreReconciliationExceptionDto
ArchiveReconciliationExceptionDto
ReconciliationExceptionDto
ReconciliationExceptionListItemDto
ReconciliationExceptionFilterDto
```

---

### 20.8. Reports

```text id="i2fz1g"
ReconciliationSummaryReportDto
UnmatchedBankTransactionsReportDto
UnmatchedPaymentsReportDto
ReconciliationExceptionsReportDto
BankAccountBalancesReportDto
ReconciliationReportExportDto
```

---

## 21. Campos prohibidos en requests externos

Los DTOs externos deben rechazar:

```text id="ulua8i"
tenantId
createdBy
updatedBy
importedBy
processedBy
confirmedBy
reversedBy
closedBy
reopenedBy
archivedBy
createdAt
updatedAt
importedAt
processedAt
confirmedAt
reversedAt
closedAt
reopenedAt
archivedAt
status salvo endpoints de transición controlados
accountNumberHash
fingerprint
fileHash
secureDocumentId
secureDocumentFileId
reconciliationMatchId manual en Payment
storageKey
fullAccountNumber en response
```

---

## 22. Permisos

### 22.1. Cuentas bancarias

```text id="ve3w00"
bankAccounts.create
bankAccounts.read
bankAccounts.update
bankAccounts.activate
bankAccounts.deactivate
bankAccounts.archive
```

---

### 22.2. Importaciones

```text id="mhi6we"
bankStatementImports.create
bankStatementImports.read
bankStatementImports.process
bankStatementImports.cancel
bankStatementImports.archive
```

---

### 22.3. Movimientos bancarios

```text id="xfhqzw"
bankTransactions.read
bankTransactions.updateClassification
bankTransactions.ignore
bankTransactions.archive
```

---

### 22.4. Sesiones

```text id="sslv01"
reconciliationSessions.create
reconciliationSessions.read
reconciliationSessions.update
reconciliationSessions.close
reconciliationSessions.reopen
reconciliationSessions.archive
```

---

### 22.5. Candidatos

```text id="j5l6ta"
reconciliationCandidates.generate
reconciliationCandidates.read
reconciliationCandidates.accept
reconciliationCandidates.reject
```

---

### 22.6. Matches

```text id="h942ia"
reconciliationMatches.create
reconciliationMatches.read
reconciliationMatches.confirm
reconciliationMatches.reverse
reconciliationMatches.archive
```

---

### 22.7. Excepciones

```text id="dg2z5v"
reconciliationExceptions.create
reconciliationExceptions.read
reconciliationExceptions.update
reconciliationExceptions.resolve
reconciliationExceptions.ignore
reconciliationExceptions.archive
```

---

### 22.8. Reportes y auditoría

```text id="er68fc"
reconciliationReports.read
reconciliationReports.export
reconciliation.audit.read
```

---

## 23. Guards y policies

### 23.1. Guards

```text id="j6rhxg"
BankReconciliationPermissionGuard
BankAccountTenantGuard
BankStatementImportTenantGuard
BankTransactionTenantGuard
ReconciliationSessionTenantGuard
ReconciliationCandidateTenantGuard
ReconciliationMatchTenantGuard
ReconciliationExceptionTenantGuard
PaymentReconciliationGuard
ReconciliationStateGuard
ReconciliationReportGuard
```

---

### 23.2. Policies

```text id="h8ck2a"
BankAccountTenantPolicy
BankAccountStatePolicy
BankAccountNumberProtectionPolicy
BankStatementImportPolicy
BankStatementFileValidationPolicy
BankTransactionTenantPolicy
BankTransactionDuplicatePolicy
BankTransactionStatePolicy
PaymentReconciliationPolicy
ReconciliationCandidatePolicy
ReconciliationMatchPolicy
ReconciliationMatchAmountPolicy
ReconciliationMatchReversalPolicy
ReconciliationSessionStatePolicy
ReconciliationSessionClosePolicy
ReconciliationExceptionPolicy
ReconciliationAuditPolicy
ReconciliationNoPublicExposurePolicy
ReconciliationNoAutoConfirmationPolicy
ReconciliationNoExternalAiPolicy
```

---

## 24. Seguridad técnica

Reglas obligatorias:

```text id="vlbxyr"
- no aceptar tenantId desde body;
- no consultar entidades solo por id;
- no exponer número completo de cuenta bancaria;
- no exponer archivo bancario sin permiso;
- no exponer storageKey;
- no conciliar pagos de otro tenant;
- no conciliar movimientos de otro tenant;
- no confirmar candidatos automáticamente;
- no modificar pagos desde candidatos;
- no usar float/double para dinero;
- no registrar archivo bancario completo en logs;
- no registrar filas bancarias completas en auditoría;
- no crear endpoints públicos;
- no enviar datos reales a IA externa.
```

---

## 25. Auditoría

### 25.1. Eventos obligatorios

```text id="jc7j0r"
bankAccount.created
bankAccount.updated
bankAccount.activated
bankAccount.deactivated
bankAccount.archived

bankStatementImport.created
bankStatementImport.validated
bankStatementImport.processed
bankStatementImport.failed
bankStatementImport.cancelled
bankStatementImport.archived

bankTransaction.created
bankTransaction.markedDuplicate
bankTransaction.classificationUpdated
bankTransaction.ignored
bankTransaction.archived

reconciliationSession.created
reconciliationSession.opened
reconciliationSession.reviewing
reconciliationSession.closed
reconciliationSession.reopened
reconciliationSession.archived

reconciliationCandidate.generated
reconciliationCandidate.accepted
reconciliationCandidate.rejected
reconciliationCandidate.expired
reconciliationCandidate.superseded

reconciliationMatch.created
reconciliationMatch.confirmed
reconciliationMatch.reversed
reconciliationMatch.archived

reconciliationException.created
reconciliationException.updated
reconciliationException.resolved
reconciliationException.ignored
reconciliationException.archived
```

---

### 25.2. Metadata permitida

```text id="cmf82l"
bankAccountId
statementImportId
bankTransactionId
reconciliationSessionId
candidateId
matchId
exceptionId
paymentId
paymentIds
transactionCount
paymentCount
amount
currency
differenceAmount
status
outcome
importStatus
matchType
exceptionType
severity
hashPrefix
traceId
```

---

### 25.3. Metadata prohibida

```text id="sxqh7s"
accountNumber completo
storageKey
signedUrl
archivo completo
fila bancaria completa
contenido completo de descripción bancaria
referencias bancarias sensibles completas
identificación completa
email completo
teléfono completo
cédula
tokens
cookies
Authorization header
secretos
SQL raw
stack trace
payload completo del archivo
```

---

## 26. Observabilidad

### 26.1. Logs sugeridos

```text id="ink4r1"
bankAccount.created
bankStatementImport.created
bankStatementImport.processed
bankStatementImport.failed
bankTransaction.created
bankTransaction.duplicateDetected
reconciliationCandidate.generated
reconciliationMatch.confirmed
reconciliationMatch.reversed
reconciliationException.created
reconciliationSession.closed
```

---

### 26.2. Métricas sugeridas

```text id="rcl866"
bank_accounts_total
bank_statement_imports_total
bank_statement_import_rows_total
bank_statement_import_failed_total
bank_transactions_imported_total
bank_transactions_duplicate_total
reconciliation_candidates_generated_total
reconciliation_matches_confirmed_total
reconciliation_matches_reversed_total
reconciliation_exceptions_open_total
reconciliation_sessions_closed_total
reconciliation_unmatched_bank_amount_total
reconciliation_unmatched_payment_amount_total
```

---

### 26.3. Labels permitidos

```text id="xrh4m3"
status
importStatus
transactionType
direction
matchType
exceptionType
severity
currency
outcome
```

---

### 26.4. Labels prohibidos

```text id="zt442a"
tenantId
bankAccountId
bankTransactionId
paymentId
userId
personId
propertyUnitId
accountNumber
reference
bankReference
description
fileHash
storageKey
traceId
```

---

## 27. OpenAPI

### 27.1. Tags sugeridos

```text id="yw3kt2"
Bank Accounts
Bank Statement Imports
Bank Transactions
Reconciliation Sessions
Reconciliation Candidates
Reconciliation Matches
Reconciliation Exceptions
Reconciliation Reports
```

---

### 27.2. Extensiones OpenAPI requeridas

```yaml id="izh2w9"
x-tenant-scope: true
x-auth-required: true
x-required-permission: bankAccounts.read
x-financial-control: true
x-audit-event: bankAccount.created
x-public-exposure: false
```

Para endpoints de importación:

```yaml id="h4kqud"
x-file-upload: true
x-secure-document-storage: true
x-storage-key-exposed: false
x-financial-import: true
```

Para endpoints de matching:

```yaml id="c8d3vl"
x-reconciliation-match: true
x-manual-confirmation-required: true
x-audit-event: reconciliationMatch.confirmed
```

Para endpoints prohibidos:

```text id="lu3x6q"
OpenAPI no debe documentar endpoints públicos de conciliación bancaria.
```

---

## 28. Implementación por fases

### 28.1. Orden recomendado

```text id="wq64q2"
1. Crear estructura base del módulo.
2. Implementar enums y value objects.
3. Implementar entidades de dominio.
4. Implementar state machines.
5. Crear Prisma schema y migración.
6. Implementar repositorios tenant-scoped.
7. Implementar BankAccountService.
8. Implementar protección de número de cuenta.
9. Implementar integración con Secure Document Storage.
10. Implementar parsers CSV/XLSX genéricos.
11. Implementar import validation.
12. Implementar normalization.
13. Implementar fingerprint.
14. Implementar duplicate detection.
15. Implementar BankTransactionService.
16. Implementar ReconciliationSessionService.
17. Implementar PaymentReconciliationPort.
18. Implementar candidate scoring.
19. Implementar candidate generation.
20. Implementar match creation/confirmation.
21. Implementar match reversal.
22. Implementar exceptions.
23. Implementar reports.
24. Implementar controllers.
25. Implementar audit.
26. Implementar observability.
27. Implementar OpenAPI.
28. Implementar tests.
29. Ejecutar hardening.
```

---

### 28.2. PRs sugeridos

```text id="pdhk8f"
PR-017-01 — Module skeleton, enums and value objects.
PR-017-02 — Domain entities and state machines.
PR-017-03 — Prisma schema, migration and repositories.
PR-017-04 — Bank accounts and account number protection.
PR-017-05 — Secure document integration and import file workflow.
PR-017-06 — CSV/XLSX parsers, validation and normalization.
PR-017-07 — Bank transaction fingerprint and duplicate detection.
PR-017-08 — Reconciliation sessions.
PR-017-09 — Payment reconciliation adapter.
PR-017-10 — Candidate generation and deterministic scoring.
PR-017-11 — Match confirmation, 1:1, 1:N and N:1.
PR-017-12 — Match reversal and exception handling.
PR-017-13 — Reports, audit and observability.
PR-017-14 — REST controllers and OpenAPI.
PR-017-15 — Tests, security hardening and CI gates.
```

---

## 29. Testing plan resumido

### 29.1. Unit tests

```text id="vwitpl"
BankAccount entity
BankStatementImport entity
BankStatementImportError entity
BankTransaction entity
ReconciliationSession entity
ReconciliationCandidate entity
ReconciliationMatch entity
ReconciliationMatchItem entity
ReconciliationException entity
BankAccountNumber value object
Money Decimal value object
BankTransactionFingerprint service
BankStatementParser service
ReconciliationScoring service
```

---

### 29.2. Integration tests

```text id="ogfitw"
PrismaBankAccountRepository
PrismaBankStatementImportRepository
PrismaBankStatementImportErrorRepository
PrismaBankTransactionRepository
PrismaReconciliationSessionRepository
PrismaReconciliationCandidateRepository
PrismaReconciliationMatchRepository
PrismaReconciliationMatchItemRepository
PrismaReconciliationExceptionRepository
PaymentReconciliationAdapter
SecureDocumentStorage integration
Audit integration
```

---

### 29.3. API tests

```text id="wv3kwx"
bank accounts CRUD/state transitions
statement import upload/validate/process
bank transaction list/get/classification/ignore
reconciliation session create/open/close/reopen
candidate generation/accept/reject
match create/confirm/reverse
exception create/update/resolve/ignore
reports summary/unmatched/exceptions
```

---

### 29.4. Security tests

```text id="eokjxu"
no tenantId body
no cross-tenant bank account
no cross-tenant import
no cross-tenant bank transaction
no cross-tenant reconciliation session
no cross-tenant payment match
no duplicate movement import
no full account number exposure
no storageKey exposure
no public endpoints
no automatic confirmation
no logs with full bank data
no audit with full bank data
no external IA with real data
```

---

### 29.5. Financial integrity tests

```text id="ezy036"
Decimal exact amounts
no float arithmetic
match 1:1 exact amount
match 1:N total amount
match N:1 total amount
differenceAmount recorded
differenceReason required
candidate no side effect
confirmed match updates payment reconciliationStatus
reversal restores reconciliationStatus
closed session blocks changes
reopened session requires permission
```

---

## 30. Performance objetivo

### 30.1. Objetivos MVP

```text id="q7icrz"
p95 < 800 ms para listar movimientos paginados.
p95 < 1200 ms para listar candidatos.
p95 < 3000 ms para procesar importación pequeña/mediana.
p95 < 5000 ms para generar candidatos en periodo mensual típico.
```

---

### 30.2. Reglas técnicas

```text id="qb8b50"
- paginación obligatoria;
- pageSize máximo 100;
- índices por tenant_id;
- índices por bank_account_id;
- índices por transaction_date;
- índices por status;
- índices por fingerprint;
- no N+1;
- procesamiento por lotes;
- Decimal para dinero;
- no cargar archivos grandes completos si puede evitarse;
- streaming o parsing eficiente para XLSX/CSV si aplica.
```

---

## 31. Feature flags

```text id="yk7fb7"
bankReconciliation.enabled
bankReconciliation.bankAccounts.enabled
bankReconciliation.imports.enabled
bankReconciliation.csvImport.enabled
bankReconciliation.xlsxImport.enabled
bankReconciliation.manualImport.enabled
bankReconciliation.candidateGeneration.enabled
bankReconciliation.matchOneToOne.enabled
bankReconciliation.matchOneToMany.enabled
bankReconciliation.matchManyToOne.enabled
bankReconciliation.matchManyToMany.enabled
bankReconciliation.exceptions.enabled
bankReconciliation.reports.enabled
bankReconciliation.openBanking.enabled
bankReconciliation.ocr.enabled
bankReconciliation.aiAssistance.enabled
bankReconciliation.autoConfirmation.enabled
```

Defaults MVP:

```text id="wpq0c5"
bankReconciliation.enabled = true
bankReconciliation.bankAccounts.enabled = true
bankReconciliation.imports.enabled = true
bankReconciliation.csvImport.enabled = true
bankReconciliation.xlsxImport.enabled = true
bankReconciliation.manualImport.enabled = false
bankReconciliation.candidateGeneration.enabled = true
bankReconciliation.matchOneToOne.enabled = true
bankReconciliation.matchOneToMany.enabled = true
bankReconciliation.matchManyToOne.enabled = true
bankReconciliation.matchManyToMany.enabled = false
bankReconciliation.exceptions.enabled = true
bankReconciliation.reports.enabled = true
bankReconciliation.openBanking.enabled = false
bankReconciliation.ocr.enabled = false
bankReconciliation.aiAssistance.enabled = false
bankReconciliation.autoConfirmation.enabled = false
```

---

## 32. Variables de configuración sugeridas

```text id="ujuyce"
BANK_RECONCILIATION_IMPORT_MAX_FILE_SIZE_MB=20
BANK_RECONCILIATION_IMPORT_MAX_ROWS=5000
BANK_RECONCILIATION_DEFAULT_CURRENCY=USD
BANK_RECONCILIATION_AMOUNT_TOLERANCE=0.00
BANK_RECONCILIATION_DATE_TOLERANCE_DAYS=3
BANK_RECONCILIATION_CANDIDATE_MIN_SCORE=50
BANK_RECONCILIATION_HIGH_SCORE_THRESHOLD=90
BANK_RECONCILIATION_MEDIUM_SCORE_THRESHOLD=70
BANK_RECONCILIATION_REQUIRE_MANUAL_CONFIRMATION=true
BANK_RECONCILIATION_ALLOW_CLOSED_SESSION_REOPEN=true
BANK_RECONCILIATION_BLOCK_CLOSE_WITH_CRITICAL_EXCEPTIONS=true
```

---

## 33. Errores esperados

Catálogo inicial:

```text id="uam63l"
BANK_ACCOUNT_NOT_FOUND
BANK_ACCOUNT_FORBIDDEN
BANK_ACCOUNT_INVALID_STATUS
BANK_ACCOUNT_INACTIVE
BANK_ACCOUNT_ARCHIVED
BANK_ACCOUNT_CROSS_TENANT_REFERENCE
BANK_ACCOUNT_NUMBER_INVALID
BANK_ACCOUNT_NUMBER_EXPOSED_FORBIDDEN
BANK_ACCOUNT_CURRENCY_UNSUPPORTED

BANK_STATEMENT_IMPORT_NOT_FOUND
BANK_STATEMENT_IMPORT_FORBIDDEN
BANK_STATEMENT_IMPORT_INVALID_STATUS
BANK_STATEMENT_IMPORT_FILE_REQUIRED
BANK_STATEMENT_IMPORT_FILE_INVALID
BANK_STATEMENT_IMPORT_FILE_TOO_LARGE
BANK_STATEMENT_IMPORT_FORMAT_UNSUPPORTED
BANK_STATEMENT_IMPORT_TEMPLATE_UNSUPPORTED
BANK_STATEMENT_IMPORT_PARSE_FAILED
BANK_STATEMENT_IMPORT_VALIDATION_FAILED
BANK_STATEMENT_IMPORT_ALREADY_PROCESSED
BANK_STATEMENT_IMPORT_DUPLICATE_FILE
BANK_STATEMENT_IMPORT_ROW_INVALID

BANK_TRANSACTION_NOT_FOUND
BANK_TRANSACTION_FORBIDDEN
BANK_TRANSACTION_DUPLICATE
BANK_TRANSACTION_NOT_RECONCILABLE
BANK_TRANSACTION_ALREADY_MATCHED
BANK_TRANSACTION_INVALID_CLASSIFICATION
BANK_TRANSACTION_ARCHIVED

RECONCILIATION_SESSION_NOT_FOUND
RECONCILIATION_SESSION_FORBIDDEN
RECONCILIATION_SESSION_INVALID_STATUS
RECONCILIATION_SESSION_ALREADY_EXISTS
RECONCILIATION_SESSION_CLOSED
RECONCILIATION_SESSION_REOPEN_REASON_REQUIRED
RECONCILIATION_SESSION_CLOSE_BLOCKED_BY_EXCEPTIONS

RECONCILIATION_CANDIDATE_NOT_FOUND
RECONCILIATION_CANDIDATE_FORBIDDEN
RECONCILIATION_CANDIDATE_INVALID_STATUS
RECONCILIATION_CANDIDATE_EXPIRED
RECONCILIATION_CANDIDATE_NO_EFFECT

RECONCILIATION_MATCH_NOT_FOUND
RECONCILIATION_MATCH_FORBIDDEN
RECONCILIATION_MATCH_INVALID_STATUS
RECONCILIATION_MATCH_AMOUNT_MISMATCH
RECONCILIATION_MATCH_DIFFERENCE_REASON_REQUIRED
RECONCILIATION_MATCH_PAYMENT_NOT_RECONCILABLE
RECONCILIATION_MATCH_BANK_TRANSACTION_NOT_RECONCILABLE
RECONCILIATION_MATCH_CROSS_TENANT_REFERENCE
RECONCILIATION_MATCH_REVERSE_REASON_REQUIRED

RECONCILIATION_EXCEPTION_NOT_FOUND
RECONCILIATION_EXCEPTION_FORBIDDEN
RECONCILIATION_EXCEPTION_INVALID_STATUS
RECONCILIATION_EXCEPTION_RESOLUTION_REQUIRED

PAYMENT_RECONCILIATION_PAYMENT_NOT_FOUND
PAYMENT_RECONCILIATION_PAYMENT_NOT_RECONCILABLE
PAYMENT_RECONCILIATION_PAYMENT_ALREADY_RECONCILED
PAYMENT_RECONCILIATION_CROSS_TENANT_REFERENCE

VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
RATE_LIMITED
INTERNAL_ERROR
```

---

## 34. Seeds y datos demo

Crear seeds ficticios para:

```text id="oyl90y"
bankAccountMainA
bankAccountSecondaryA
bankAccountInactiveA
bankAccountArchivedA
bankAccountTenantB

bankStatementImportCsvA
bankStatementImportXlsxA
bankStatementImportProcessedA
bankStatementImportWarningsA
bankStatementImportFailedA
bankStatementImportTenantB

bankTransactionCreditA
bankTransactionDebitA
bankTransactionFeeA
bankTransactionInterestA
bankTransactionDuplicateA
bankTransactionMatchedA
bankTransactionUnmatchedA
bankTransactionExceptionA
bankTransactionTenantB

reconciliationSessionOpenA
reconciliationSessionReviewingA
reconciliationSessionClosedA
reconciliationSessionReopenedA
reconciliationSessionTenantB

reconciliationCandidateHighA
reconciliationCandidateMediumA
reconciliationCandidateRejectedA
reconciliationCandidateTenantB

reconciliationMatchOneToOneA
reconciliationMatchOneToManyA
reconciliationMatchManyToOneA
reconciliationMatchReversedA
reconciliationMatchTenantB

reconciliationExceptionUnknownDepositA
reconciliationExceptionAmountMismatchA
reconciliationExceptionPaymentWithoutBankTransactionA
reconciliationExceptionResolvedA
reconciliationExceptionTenantB
```

Prohibido en seeds:

```text id="e9n8a9"
números reales de cuenta
movimientos bancarios reales
referencias bancarias reales
comprobantes reales
nombres reales
emails reales
teléfonos reales
cédulas reales
archivos bancarios reales
storageKeys reales
URLs firmadas reales
tokens
secretos
datos financieros reales
```

---

## 35. Riesgos técnicos

| Riesgo                         | Impacto | Mitigación                              |
| ------------------------------ | ------: | --------------------------------------- |
| Cuenta bancaria cross-tenant   | Crítico | tenant_id, guards, repository policy    |
| Movimiento cross-tenant        | Crítico | tenant-scoped queries                   |
| Pago cross-tenant conciliado   | Crítico | PaymentReconciliationPort tenant-scoped |
| Duplicación de movimientos     |    Alto | fingerprint + idempotencia              |
| Conciliación fraudulenta       | Crítico | permisos, confirmación humana, audit    |
| Candidato con side effect      |    Alto | candidates no modifican pagos           |
| Error en Decimal               |    Alto | Decimal obligatorio, no float           |
| Exposición de número de cuenta |    Alto | masked/hash only                        |
| Exposición archivo bancario    | Crítico | Secure Document Storage                 |
| Exposición storageKey          | Crítico | DTO minimization                        |
| Logs con datos bancarios       |    Alto | sanitización                            |
| Sesión cerrada modificable     |    Alto | state policy                            |
| Parser incorrecto              |    Alto | validación y tests por formato          |
| OpenAPI público accidental     | Crítico | OpenAPI gate                            |
| IA externa con datos reales    | Crítico | policy + tests                          |

---

## 36. Criterios de aceptación técnica

La implementación deberá cumplir:

```text id="ku28uz"
- todas las tablas nuevas tienen tenant_id;
- toda consulta filtra por tenant_id;
- no se acepta tenantId en body;
- no se busca por id simple;
- no se expone número completo de cuenta;
- accountNumberMasked se expone de forma segura;
- accountNumberHash no se usa como dato público;
- cuenta inactive no permite importación;
- archivo importado se registra en Secure Document Storage;
- no se expone storageKey;
- CSV/XLSX se valida;
- movimientos inválidos se reportan;
- fingerprint se calcula;
- duplicados se detectan;
- dinero usa Decimal;
- candidatos no tienen side effect;
- match confirmado requiere permiso;
- match confirmado actualiza estados relacionados;
- reverso requiere razón;
- reverso no elimina historial;
- sesión closed bloquea cambios;
- reopen requiere permiso y razón;
- excepciones high/critical abiertas bloquean cierre si policy activa;
- auditoría se emite;
- logs son seguros;
- OpenAPI no documenta endpoints públicos;
- no existen endpoints públicos;
- CI pasa.
```

---

## 37. Definition of Done

El módulo se considera listo cuando:

```text id="xx9ebs"
1. `spec.md` está aprobado.
2. `plan.md` está aprobado.
3. `data-model.md` está creado.
4. `api-contract.md` está creado.
5. `test-plan.md` está creado.
6. `tasks.md` está creado.
7. `security-notes.md` está creado.
8. Prisma schema está implementado.
9. Migración está ejecutada en test.
10. Repositorios funcionan.
11. BankAccountService funciona.
12. BankStatementImportService funciona.
13. CSV parser funciona.
14. XLSX parser funciona.
15. Normalization funciona.
16. Fingerprint funciona.
17. Duplicate detection funciona.
18. BankTransactionService funciona.
19. ReconciliationSessionService funciona.
20. PaymentReconciliationPort funciona.
21. Candidate generation funciona.
22. Scoring determinístico funciona.
23. Match 1:1 funciona.
24. Match 1:N funciona.
25. Match N:1 funciona.
26. Match reversal funciona.
27. Exceptions funcionan.
28. Reports funcionan.
29. Secure Document Storage integration funciona.
30. Audit funciona.
31. Observability funciona.
32. Controllers funcionan.
33. OpenAPI está actualizado.
34. Tests unitarios pasan.
35. Tests de repositorio pasan.
36. Tests API pasan.
37. Tests de autorización pasan.
38. Tests multitenant pasan.
39. Tests financieros pasan.
40. Tests de seguridad pasan.
41. Build pasa.
42. CI pasa.
```

---

## 38. No aceptación

No se acepta implementación si:

```text id="w6knjt"
- permite cuentas bancarias cross-tenant;
- permite importaciones cross-tenant;
- permite movimientos cross-tenant;
- permite sesiones cross-tenant;
- permite candidates cross-tenant;
- permite matches cross-tenant;
- permite excepciones cross-tenant;
- permite conciliar pagos de otro tenant;
- acepta tenantId desde body;
- busca entidades solo por id;
- expone número completo de cuenta;
- expone storageKey;
- expone archivo bancario sin permiso;
- duplica movimientos al reimportar;
- usa float/double para dinero;
- candidato modifica pagos;
- confirma conciliaciones automáticamente sin permiso;
- permite match con diferencia sin razón;
- permite revertir match sin razón;
- permite modificar sesión closed;
- permite cerrar sesión con excepciones críticas abiertas si policy lo bloquea;
- registra datos bancarios completos en logs;
- registra archivo bancario completo en auditoría;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- envía datos reales a IA externa;
- omite auditoría financiera crítica.
```

---

## 39. Resultado esperado

Al finalizar la implementación de `017-bank-reconciliation`, RESIDENT Core tendrá un módulo de conciliación bancaria inicial que permitirá:

```text id="qmx7iy"
- registrar cuentas bancarias por tenant;
- proteger datos bancarios sensibles;
- importar movimientos CSV/XLSX;
- almacenar archivos importados de forma segura;
- validar y normalizar movimientos;
- detectar duplicados;
- crear sesiones de conciliación;
- sugerir candidatos determinísticos;
- confirmar matches 1:1;
- confirmar matches 1:N;
- confirmar matches N:1;
- registrar diferencias justificadas;
- gestionar excepciones;
- revertir conciliaciones;
- cerrar y reabrir sesiones;
- alimentar reportes básicos;
- sincronizar estado de conciliación con Payments;
- enriquecer Account Statements;
- auditar operaciones financieras;
- mantener aislamiento multitenant;
- evitar exposición pública;
- preservar integridad financiera.
```

El módulo quedará preparado para futuras specs de:

```text id="mtjvwu"
payment-provider-integration
open-banking-integration
accounting-ledger
advanced-reconciliation
bank-rules-automation
financial-closing
bank-statement-ocr
reconciliation-ai-assistance
cash-management
multi-currency
```
