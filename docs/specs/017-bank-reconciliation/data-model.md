# Data Model — Spec 017 Bank Reconciliation

## 1. Información del documento

| Campo                  | Valor                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Proyecto               | RESIDENT Core                                                                                                |
| Spec ID                | 017                                                                                                          |
| Módulo                 | Bank Reconciliation                                                                                          |
| Documento              | Data Model                                                                                                   |
| Ruta                   | `docs/specs/017-bank-reconciliation/data-model.md`                                                           |
| Versión                | 0.1                                                                                                          |
| Estado                 | needs-review                                                                                                 |
| Fecha                  | 2026-07-21                                                                                                   |
| Documento base         | `docs/specs/017-bank-reconciliation/spec.md`                                                                 |
| Plan técnico           | `docs/specs/017-bank-reconciliation/plan.md`                                                                 |
| Base de datos          | PostgreSQL                                                                                                   |
| ORM                    | Prisma                                                                                                       |
| Estrategia multitenant | Shared database + shared schema + `tenant_id`                                                                |
| Naturaleza             | Tenant-scoped / Financial-control / Import-driven / Match-aware / Exception-aware / Audit-heavy / Non-public |
| API Style              | REST                                                                                                         |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `017-bank-reconciliation`.

El módulo permite registrar cuentas bancarias del tenant, importar archivos bancarios, normalizar movimientos, detectar duplicados, crear sesiones de conciliación, generar candidatos, confirmar matches, gestionar excepciones, revertir conciliaciones y alimentar reportes financieros.

Regla central:

```text id="j3fkj2"
Toda cuenta bancaria, importación, movimiento, sesión, candidato, match, item y excepción debe ser tenant-scoped, financial-control-aware, duplicate-safe, payment-aware, reversible, auditable y no public.
```

---

## 3. Decisión principal del modelo

Para MVP se crearán nueve tablas principales:

```text id="c6k3sy"
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

Estas tablas permiten cubrir:

* cuentas bancarias por tenant;
* importaciones CSV/XLSX;
* errores de importación por fila;
* movimientos bancarios normalizados;
* fingerprint de duplicados;
* sesiones por cuenta y periodo;
* candidatos sugeridos por reglas determinísticas;
* matches confirmados;
* items de match para soportar 1:1, 1:N y N:1;
* excepciones de conciliación;
* reversibilidad;
* auditoría;
* reportabilidad;
* integración con Payments;
* integración con Secure Document Storage.

---

## 4. Tablas nuevas MVP

```text id="q0y98u"
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

## 5. Tablas externas relacionadas

```text id="v0h7on"
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

| Tabla externa           | Spec origen                   | Uso                                                                      |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| `tenants`               | `001-tenants`                 | Tenant propietario de todo recurso                                       |
| `user_profiles`         | `002-users-roles`             | Usuario creador, importador, procesador, confirmador, reversor, cerrador |
| `property_units`        | `003-residents-properties`    | Relación indirecta desde pagos y reportes                                |
| `payments`              | `005-payments`                | Pagos conciliables                                                       |
| `payment_receipts`      | `005-payments`                | Comprobantes usados para matching                                        |
| `payment_allocations`   | `005-payments`                | Contexto financiero de pagos                                             |
| `payment_reversals`     | `005-payments`                | Exclusión de pagos reversados                                            |
| `account_statements`    | `006-account-statements`      | Enriquecimiento del estado de cuenta con estado conciliado               |
| `secure_documents`      | `016-secure-document-storage` | Registro seguro del archivo bancario importado                           |
| `secure_document_files` | `016-secure-document-storage` | Archivo CSV/XLSX importado                                               |
| `audit_logs`            | `007-audit`                   | Auditoría transversal                                                    |

---

# 6. Entidad `BankAccount`

## 6.1. Propósito

Representa una cuenta bancaria registrada para un tenant.

Ejemplos:

```text id="are5sa"
Banco Pichincha - Cuenta Corriente - Administración
Banco Guayaquil - Cuenta Ahorros - Fondo de reserva
Caja Interna - Uso administrativo limitado
```

---

## 6.2. Tabla

```text id="wpau6t"
bank_accounts
```

---

## 6.3. Campos

```text id="w4v1u2"
BankAccount
├── id
├── tenantId
├── bankName
├── accountName
├── accountNumberMasked
├── accountNumberHash
├── accountType
├── currency
├── status
├── isDefault
├── description
├── createdBy
├── updatedBy
├── activatedBy
├── deactivatedBy
├── archivedBy
├── createdAt
├── updatedAt
├── activatedAt
├── deactivatedAt
├── archivedAt
├── archiveReason
└── metadata
```

---

## 6.4. Reglas

* `tenantId` obligatorio.
* `bankName` obligatorio.
* `accountName` obligatorio.
* `accountNumberMasked` obligatorio.
* `accountNumberHash` obligatorio.
* No almacenar ni exponer número completo de cuenta en MVP.
* `accountType` obligatorio.
* `currency` obligatoria.
* MVP: `currency = USD`.
* `status` obligatorio.
* Solo cuentas `active` permiten importaciones.
* `isDefault` debe ser único por tenant entre cuentas activas, si se habilita.
* No eliminar físicamente.
* No exponer datos bancarios completos en logs/auditoría.

---

# 7. Entidad `BankStatementImport`

## 7.1. Propósito

Representa una importación de archivo bancario.

El archivo importado debe registrarse en `016-secure-document-storage`.

---

## 7.2. Tabla

```text id="vtb4fk"
bank_statement_imports
```

---

## 7.3. Campos

```text id="fn037d"
BankStatementImport
├── id
├── tenantId
├── bankAccountId
├── secureDocumentId
├── secureDocumentFileId
├── importType
├── originalFileName
├── fileHash
├── hashAlgorithm
├── status
├── periodStart
├── periodEnd
├── importedBy
├── processedBy
├── cancelledBy
├── archivedBy
├── importedAt
├── processedAt
├── cancelledAt
├── archivedAt
├── totalRows
├── validRows
├── invalidRows
├── duplicateRows
├── createdTransactions
├── errorSummary
├── cancelReason
├── archiveReason
└── metadata
```

---

## 7.4. Reglas

* `tenantId` obligatorio.
* `bankAccountId` obligatorio y del mismo tenant.
* `secureDocumentId` obligatorio después del upload.
* `secureDocumentFileId` obligatorio después del upload.
* `importType` obligatorio.
* MVP: `csv`, `xlsx`.
* `fileHash` obligatorio.
* `hashAlgorithm = SHA-256`.
* `periodStart <= periodEnd`.
* Cuenta bancaria debe estar `active` para crear importación.
* Reimportar el mismo archivo no debe duplicar movimientos.
* `totalRows`, `validRows`, `invalidRows`, `duplicateRows`, `createdTransactions` deben ser consistentes.
* No eliminar físicamente.
* Metadata no debe contener archivo completo, filas completas, storageKey ni referencias sensibles completas.

---

# 8. Entidad `BankStatementImportError`

## 8.1. Propósito

Registra errores de validación o procesamiento por fila de importación.

Permite procesar parcialmente un archivo y conservar trazabilidad de filas inválidas.

---

## 8.2. Tabla

```text id="a5zu22"
bank_statement_import_errors
```

---

## 8.3. Campos

```text id="cj2avw"
BankStatementImportError
├── id
├── tenantId
├── statementImportId
├── rowNumber
├── errorCode
├── errorMessage
├── severity
├── rawRowPreview
├── normalizedPreview
├── createdAt
└── metadata
```

---

## 8.4. Reglas

* `tenantId` obligatorio.
* `statementImportId` obligatorio y del mismo tenant.
* `rowNumber` obligatorio y mayor que cero.
* `errorCode` obligatorio.
* `severity` obligatoria.
* `rawRowPreview` debe estar sanitizado y truncado.
* No registrar fila completa si contiene datos sensibles.
* No registrar número completo de cuenta.
* No registrar archivo completo.
* No registrar storageKey.
* No eliminar físicamente.

---

# 9. Entidad `BankTransaction`

## 9.1. Propósito

Representa un movimiento bancario normalizado.

Un movimiento bancario no es un pago por sí mismo. Debe conciliarse con uno o más pagos para adquirir valor operativo dentro del sistema financiero de RESIDENT.

---

## 9.2. Tabla

```text id="vq812e"
bank_transactions
```

---

## 9.3. Campos

```text id="wmsj58"
BankTransaction
├── id
├── tenantId
├── bankAccountId
├── statementImportId
├── transactionDate
├── postedDate
├── description
├── descriptionNormalized
├── reference
├── referenceNormalized
├── bankReference
├── bankReferenceNormalized
├── transactionType
├── direction
├── amount
├── currency
├── balanceAfter
├── fingerprint
├── status
├── isDuplicate
├── duplicateOfTransactionId
├── classificationUpdatedBy
├── ignoredBy
├── archivedBy
├── createdAt
├── updatedAt
├── classificationUpdatedAt
├── ignoredAt
├── archivedAt
├── ignoreReason
├── archiveReason
└── metadata
```

---

## 9.4. Reglas

* `tenantId` obligatorio.
* `bankAccountId` obligatorio y del mismo tenant.
* `statementImportId` obligatorio y del mismo tenant.
* `transactionDate` obligatoria.
* `postedDate` opcional.
* `direction` obligatoria.
* `amount` obligatorio, Decimal.
* `amount > 0`.
* `currency` obligatoria.
* MVP: `USD`.
* `fingerprint` obligatorio.
* `fingerprint` debe ser determinístico.
* Movimiento duplicado no conciliable por defecto.
* Movimiento `archived`, `ignored`, `duplicate` no conciliable por defecto.
* No eliminar físicamente.
* No usar float/double para dinero.

---

# 10. Entidad `ReconciliationSession`

## 10.1. Propósito

Representa una sesión de conciliación para una cuenta bancaria y un periodo.

Agrupa movimientos, candidatos, matches y excepciones.

---

## 10.2. Tabla

```text id="r17zxb"
reconciliation_sessions
```

---

## 10.3. Campos

```text id="i5901e"
ReconciliationSession
├── id
├── tenantId
├── bankAccountId
├── periodStart
├── periodEnd
├── status
├── openingBalance
├── closingBalance
├── totalBankCredits
├── totalBankDebits
├── totalMatchedAmount
├── totalUnmatchedAmount
├── totalExceptions
├── createdBy
├── openedBy
├── closedBy
├── reopenedBy
├── archivedBy
├── createdAt
├── openedAt
├── closedAt
├── reopenedAt
├── archivedAt
├── closeReason
├── reopenReason
├── archiveReason
└── metadata
```

---

## 10.4. Reglas

* `tenantId` obligatorio.
* `bankAccountId` obligatorio y del mismo tenant.
* `periodStart <= periodEnd`.
* Una cuenta no debe tener más de una sesión activa para el mismo periodo.
* Estados activos: `draft`, `open`, `reviewing`, `reopened`.
* `closed` bloquea cambios ordinarios.
* `reopened` requiere razón y permiso.
* Cierre puede bloquearse por excepciones `high` o `critical` abiertas.
* Montos deben usar Decimal.
* No eliminar físicamente.

---

# 11. Entidad `ReconciliationCandidate`

## 11.1. Propósito

Representa una coincidencia sugerida entre un movimiento bancario y un pago.

No tiene efectos financieros hasta aceptación/confirmación.

---

## 11.2. Tabla

```text id="ed64k0"
reconciliation_candidates
```

---

## 11.3. Campos

```text id="tex0lx"
ReconciliationCandidate
├── id
├── tenantId
├── reconciliationSessionId
├── bankTransactionId
├── paymentId
├── score
├── scoreBand
├── scoreReason
├── matchType
├── status
├── generatedBy
├── reviewedBy
├── createdAt
├── reviewedAt
├── expiresAt
├── rejectReason
└── metadata
```

---

## 11.4. Reglas

* `tenantId` obligatorio.
* `reconciliationSessionId` obligatorio y del mismo tenant.
* `bankTransactionId` obligatorio y del mismo tenant.
* `paymentId` obligatorio y del mismo tenant.
* `score` entre 0 y 100.
* `scoreReason` debe ser explicable.
* Candidato no modifica pagos.
* Candidato no modifica movimientos.
* Candidato no crea match confirmado por sí solo.
* `status=suggested` por defecto.
* No eliminar físicamente.

---

# 12. Entidad `ReconciliationMatch`

## 12.1. Propósito

Representa una conciliación confirmada.

Un match puede vincular:

```text id="g8vxv2"
1 movimiento ↔ 1 pago
1 movimiento ↔ varios pagos
varios movimientos ↔ 1 pago
```

---

## 12.2. Tabla

```text id="n1zmc0"
reconciliation_matches
```

---

## 12.3. Campos

```text id="wku74m"
ReconciliationMatch
├── id
├── tenantId
├── reconciliationSessionId
├── matchType
├── status
├── confirmedBy
├── reversedBy
├── archivedBy
├── confirmedAt
├── reversedAt
├── archivedAt
├── reverseReason
├── archiveReason
├── totalBankAmount
├── totalPaymentAmount
├── differenceAmount
├── differenceReason
├── idempotencyKey
└── metadata
```

---

## 12.4. Reglas

* `tenantId` obligatorio.
* `reconciliationSessionId` obligatorio y del mismo tenant.
* `matchType` obligatorio.
* `status=confirmed` al confirmar.
* `totalBankAmount` Decimal.
* `totalPaymentAmount` Decimal.
* `differenceAmount = totalBankAmount - totalPaymentAmount`.
* Si `differenceAmount != 0`, `differenceReason` obligatorio.
* Reverso requiere `reverseReason`.
* No eliminar físicamente.
* No usar float/double.
* No confirmar en sesión `closed` o `archived`.
* Match confirmado debe actualizar estados relacionados mediante puerto de Payments.

---

# 13. Entidad `ReconciliationMatchItem`

## 13.1. Propósito

Representa cada vínculo individual dentro de un match.

Permite soportar 1:1, 1:N y N:1 sin duplicar estructura.

---

## 13.2. Tabla

```text id="thjma8"
reconciliation_match_items
```

---

## 13.3. Campos

```text id="kxy69u"
ReconciliationMatchItem
├── id
├── tenantId
├── reconciliationMatchId
├── bankTransactionId
├── paymentId
├── itemType
├── amountApplied
├── currency
├── createdAt
└── metadata
```

---

## 13.4. Reglas

* `tenantId` obligatorio.
* `reconciliationMatchId` obligatorio y del mismo tenant.
* Al menos uno entre `bankTransactionId` y `paymentId` debe existir según `itemType`.
* `bankTransactionId`, si existe, debe pertenecer al mismo tenant.
* `paymentId`, si existe, debe pertenecer al mismo tenant.
* `amountApplied` obligatorio, Decimal.
* `amountApplied > 0`.
* No eliminar físicamente.
* No modificar después de match confirmado, salvo reverso controlado.

---

# 14. Entidad `ReconciliationException`

## 14.1. Propósito

Representa una inconsistencia o caso pendiente de revisión.

Ejemplos:

```text id="w7b5qt"
movimiento bancario sin pago
pago sin movimiento bancario
monto diferente
fecha fuera de tolerancia
referencia ambigua
depósito desconocido
comisión bancaria
interés bancario
transferencia interna
```

---

## 14.2. Tabla

```text id="g7ra1w"
reconciliation_exceptions
```

---

## 14.3. Campos

```text id="t0pwai"
ReconciliationException
├── id
├── tenantId
├── reconciliationSessionId
├── bankTransactionId
├── paymentId
├── exceptionType
├── status
├── severity
├── description
├── resolutionNotes
├── ignoreReason
├── createdBy
├── updatedBy
├── resolvedBy
├── ignoredBy
├── archivedBy
├── createdAt
├── updatedAt
├── resolvedAt
├── ignoredAt
├── archivedAt
├── archiveReason
└── metadata
```

---

## 14.4. Reglas

* `tenantId` obligatorio.
* `reconciliationSessionId` obligatorio y del mismo tenant.
* `bankTransactionId` opcional, pero si existe debe ser del mismo tenant.
* `paymentId` opcional, pero si existe debe ser del mismo tenant.
* Debe existir al menos `bankTransactionId` o `paymentId`, salvo excepción de sesión general.
* `exceptionType` obligatorio.
* `severity` obligatoria.
* `status=open` por defecto.
* Resolver requiere `resolutionNotes`.
* Ignorar requiere `ignoreReason`.
* Excepciones `high` o `critical` abiertas pueden bloquear cierre.
* No eliminar físicamente.

---

# 15. Enums

## 15.1. BankAccountStatus

```text id="eh0533"
draft
active
inactive
archived
```

---

## 15.2. BankAccountType

```text id="q1q2hr"
checking
savings
virtual
cash
other
```

---

## 15.3. Currency

```text id="xdei51"
USD
```

Diferidos:

```text id="vbnuls"
EUR
COP
PEN
multiCurrency
```

---

## 15.4. BankStatementImportType

```text id="x9v12q"
csv
xlsx
manual
apiFuture
```

---

## 15.5. BankStatementImportStatus

```text id="falreb"
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

---

## 15.6. BankStatementImportErrorSeverity

```text id="geziri"
info
warning
error
critical
```

---

## 15.7. BankTransactionType

```text id="z3r039"
deposit
transferIn
transferOut
withdrawal
bankFee
interest
reversal
adjustment
unknown
other
```

---

## 15.8. BankTransactionDirection

```text id="kgto1x"
credit
debit
neutral
```

---

## 15.9. BankTransactionStatus

```text id="s5n283"
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

---

## 15.10. ReconciliationSessionStatus

```text id="yq5yuq"
draft
open
reviewing
closed
reopened
archived
```

---

## 15.11. ReconciliationCandidateStatus

```text id="mxoh3k"
suggested
accepted
rejected
expired
superseded
archived
```

---

## 15.12. ReconciliationScoreBand

```text id="ve9p0o"
high
medium
low
ignored
```

---

## 15.13. ReconciliationMatchType

```text id="ozwk2b"
oneBankTransactionToOnePayment
oneBankTransactionToManyPayments
manyBankTransactionsToOnePayment
manyToMany
manual
```

MVP recomendado:

```text id="vvsmp3"
oneBankTransactionToOnePayment
oneBankTransactionToManyPayments
manyBankTransactionsToOnePayment
manual
```

---

## 15.14. ReconciliationMatchStatus

```text id="nqx4kz"
confirmed
reversed
archived
```

---

## 15.15. ReconciliationMatchItemType

```text id="m2e3ac"
bankTransaction
payment
```

---

## 15.16. ReconciliationExceptionType

```text id="x7c8nt"
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

## 15.17. ReconciliationExceptionStatus

```text id="mz3dat"
open
inReview
resolved
ignored
archived
```

---

## 15.18. ReconciliationExceptionSeverity

```text id="hu7j96"
low
medium
high
critical
```

---

## 15.19. HashAlgorithm

```text id="m4jwke"
SHA-256
```

---

# 16. Modelo Prisma preliminar

## 16.1. Enums Prisma

```prisma id="kitg8q"
enum BankAccountStatus {
  DRAFT    @map("draft")
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")

  @@map("bank_account_status")
}

enum BankAccountType {
  CHECKING @map("checking")
  SAVINGS  @map("savings")
  VIRTUAL  @map("virtual")
  CASH     @map("cash")
  OTHER    @map("other")

  @@map("bank_account_type")
}

enum Currency {
  USD @map("USD")

  @@map("currency")
}

enum BankStatementImportType {
  CSV        @map("csv")
  XLSX       @map("xlsx")
  MANUAL     @map("manual")
  API_FUTURE @map("apiFuture")

  @@map("bank_statement_import_type")
}

enum BankStatementImportStatus {
  UPLOADED                @map("uploaded")
  VALIDATING              @map("validating")
  VALIDATED               @map("validated")
  PROCESSING              @map("processing")
  PROCESSED               @map("processed")
  PROCESSED_WITH_WARNINGS @map("processedWithWarnings")
  FAILED                  @map("failed")
  CANCELLED               @map("cancelled")
  ARCHIVED                @map("archived")

  @@map("bank_statement_import_status")
}

enum BankStatementImportErrorSeverity {
  INFO     @map("info")
  WARNING  @map("warning")
  ERROR    @map("error")
  CRITICAL @map("critical")

  @@map("bank_statement_import_error_severity")
}

enum BankTransactionType {
  DEPOSIT      @map("deposit")
  TRANSFER_IN  @map("transferIn")
  TRANSFER_OUT @map("transferOut")
  WITHDRAWAL   @map("withdrawal")
  BANK_FEE     @map("bankFee")
  INTEREST     @map("interest")
  REVERSAL     @map("reversal")
  ADJUSTMENT   @map("adjustment")
  UNKNOWN      @map("unknown")
  OTHER        @map("other")

  @@map("bank_transaction_type")
}

enum BankTransactionDirection {
  CREDIT  @map("credit")
  DEBIT   @map("debit")
  NEUTRAL @map("neutral")

  @@map("bank_transaction_direction")
}

enum BankTransactionStatus {
  PENDING           @map("pending")
  CANDIDATE_FOUND   @map("candidateFound")
  MATCHED           @map("matched")
  PARTIALLY_MATCHED @map("partiallyMatched")
  UNMATCHED         @map("unmatched")
  DUPLICATE         @map("duplicate")
  IGNORED           @map("ignored")
  EXCEPTION         @map("exception")
  ARCHIVED          @map("archived")

  @@map("bank_transaction_status")
}

enum ReconciliationSessionStatus {
  DRAFT     @map("draft")
  OPEN      @map("open")
  REVIEWING @map("reviewing")
  CLOSED    @map("closed")
  REOPENED  @map("reopened")
  ARCHIVED  @map("archived")

  @@map("reconciliation_session_status")
}

enum ReconciliationCandidateStatus {
  SUGGESTED  @map("suggested")
  ACCEPTED   @map("accepted")
  REJECTED   @map("rejected")
  EXPIRED    @map("expired")
  SUPERSEDED @map("superseded")
  ARCHIVED   @map("archived")

  @@map("reconciliation_candidate_status")
}

enum ReconciliationScoreBand {
  HIGH    @map("high")
  MEDIUM  @map("medium")
  LOW     @map("low")
  IGNORED @map("ignored")

  @@map("reconciliation_score_band")
}

enum ReconciliationMatchType {
  ONE_BANK_TRANSACTION_TO_ONE_PAYMENT  @map("oneBankTransactionToOnePayment")
  ONE_BANK_TRANSACTION_TO_MANY_PAYMENTS @map("oneBankTransactionToManyPayments")
  MANY_BANK_TRANSACTIONS_TO_ONE_PAYMENT @map("manyBankTransactionsToOnePayment")
  MANY_TO_MANY                         @map("manyToMany")
  MANUAL                               @map("manual")

  @@map("reconciliation_match_type")
}

enum ReconciliationMatchStatus {
  CONFIRMED @map("confirmed")
  REVERSED  @map("reversed")
  ARCHIVED  @map("archived")

  @@map("reconciliation_match_status")
}

enum ReconciliationMatchItemType {
  BANK_TRANSACTION @map("bankTransaction")
  PAYMENT          @map("payment")

  @@map("reconciliation_match_item_type")
}

enum ReconciliationExceptionType {
  BANK_TRANSACTION_WITHOUT_PAYMENT @map("bankTransactionWithoutPayment")
  PAYMENT_WITHOUT_BANK_TRANSACTION @map("paymentWithoutBankTransaction")
  AMOUNT_MISMATCH                  @map("amountMismatch")
  DATE_MISMATCH                    @map("dateMismatch")
  AMBIGUOUS_REFERENCE              @map("ambiguousReference")
  DUPLICATE_BANK_TRANSACTION       @map("duplicateBankTransaction")
  DUPLICATE_PAYMENT_CANDIDATE      @map("duplicatePaymentCandidate")
  BANK_FEE                         @map("bankFee")
  INTEREST                         @map("interest")
  REVERSAL                         @map("reversal")
  TRANSFER_BETWEEN_ACCOUNTS        @map("transferBetweenAccounts")
  UNKNOWN_DEPOSIT                  @map("unknownDeposit")
  MANUAL_REVIEW                    @map("manualReview")
  OTHER                            @map("other")

  @@map("reconciliation_exception_type")
}

enum ReconciliationExceptionStatus {
  OPEN      @map("open")
  IN_REVIEW @map("inReview")
  RESOLVED  @map("resolved")
  IGNORED   @map("ignored")
  ARCHIVED  @map("archived")

  @@map("reconciliation_exception_status")
}

enum ReconciliationExceptionSeverity {
  LOW      @map("low")
  MEDIUM   @map("medium")
  HIGH     @map("high")
  CRITICAL @map("critical")

  @@map("reconciliation_exception_severity")
}

enum ReconciliationHashAlgorithm {
  SHA_256 @map("SHA-256")

  @@map("reconciliation_hash_algorithm")
}
```

---

## 16.2. Modelo `BankAccount`

```prisma id="ph8pw4"
model BankAccount {
  id                  String            @id @default(uuid())
  tenantId            String            @map("tenant_id")

  bankName            String            @map("bank_name")
  accountName         String            @map("account_name")
  accountNumberMasked String            @map("account_number_masked")
  accountNumberHash   String            @map("account_number_hash")

  accountType         BankAccountType   @map("account_type")
  currency            Currency          @default(USD)
  status              BankAccountStatus @default(DRAFT)
  isDefault           Boolean           @default(false) @map("is_default")
  description         String?

  createdBy           String?           @map("created_by")
  updatedBy           String?           @map("updated_by")
  activatedBy         String?           @map("activated_by")
  deactivatedBy       String?           @map("deactivated_by")
  archivedBy          String?           @map("archived_by")

  createdAt           DateTime          @default(now()) @map("created_at")
  updatedAt           DateTime          @updatedAt @map("updated_at")
  activatedAt         DateTime?         @map("activated_at")
  deactivatedAt       DateTime?         @map("deactivated_at")
  archivedAt          DateTime?         @map("archived_at")
  archiveReason       String?           @map("archive_reason")

  metadata            Json?

  tenant              Tenant            @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  createdByUser       UserProfile?      @relation("BankAccountCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser       UserProfile?      @relation("BankAccountUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  activatedByUser     UserProfile?      @relation("BankAccountActivatedBy", fields: [activatedBy], references: [id], onDelete: Restrict)
  deactivatedByUser   UserProfile?      @relation("BankAccountDeactivatedBy", fields: [deactivatedBy], references: [id], onDelete: Restrict)
  archivedByUser      UserProfile?      @relation("BankAccountArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  statementImports    BankStatementImport[]
  transactions        BankTransaction[]
  sessions            ReconciliationSession[]

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, currency])
  @@index([tenantId, accountType])
  @@index([tenantId, isDefault])
  @@index([tenantId, accountNumberHash])
  @@index([tenantId, createdAt])
  @@index([tenantId, archivedAt])
  @@map("bank_accounts")
}
```

---

## 16.3. Modelo `BankStatementImport`

```prisma id="q9akjs"
model BankStatementImport {
  id                    String                      @id @default(uuid())
  tenantId              String                      @map("tenant_id")
  bankAccountId         String                      @map("bank_account_id")

  secureDocumentId      String?                     @map("secure_document_id")
  secureDocumentFileId  String?                     @map("secure_document_file_id")

  importType            BankStatementImportType     @map("import_type")
  originalFileName      String                      @map("original_file_name")
  fileHash              String                      @map("file_hash")
  hashAlgorithm         ReconciliationHashAlgorithm @default(SHA_256) @map("hash_algorithm")
  status                BankStatementImportStatus   @default(UPLOADED)

  periodStart           DateTime                    @map("period_start")
  periodEnd             DateTime                    @map("period_end")

  importedBy            String?                     @map("imported_by")
  processedBy           String?                     @map("processed_by")
  cancelledBy           String?                     @map("cancelled_by")
  archivedBy            String?                     @map("archived_by")

  importedAt            DateTime                    @default(now()) @map("imported_at")
  processedAt           DateTime?                   @map("processed_at")
  cancelledAt           DateTime?                   @map("cancelled_at")
  archivedAt            DateTime?                   @map("archived_at")

  totalRows             Int                         @default(0) @map("total_rows")
  validRows             Int                         @default(0) @map("valid_rows")
  invalidRows           Int                         @default(0) @map("invalid_rows")
  duplicateRows         Int                         @default(0) @map("duplicate_rows")
  createdTransactions   Int                         @default(0) @map("created_transactions")

  errorSummary          Json?                       @map("error_summary")
  cancelReason          String?                     @map("cancel_reason")
  archiveReason         String?                     @map("archive_reason")
  metadata              Json?

  tenant                Tenant                      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  bankAccount           BankAccount                 @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)

  secureDocument        SecureDocument?             @relation(fields: [secureDocumentId], references: [id], onDelete: Restrict)
  secureDocumentFile    SecureDocumentFile?         @relation(fields: [secureDocumentFileId], references: [id], onDelete: Restrict)

  importedByUser        UserProfile?                @relation("BankStatementImportImportedBy", fields: [importedBy], references: [id], onDelete: Restrict)
  processedByUser       UserProfile?                @relation("BankStatementImportProcessedBy", fields: [processedBy], references: [id], onDelete: Restrict)
  cancelledByUser       UserProfile?                @relation("BankStatementImportCancelledBy", fields: [cancelledBy], references: [id], onDelete: Restrict)
  archivedByUser        UserProfile?                @relation("BankStatementImportArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  errors                BankStatementImportError[]
  transactions          BankTransaction[]

  @@index([tenantId])
  @@index([tenantId, bankAccountId])
  @@index([tenantId, status])
  @@index([tenantId, importType])
  @@index([tenantId, fileHash])
  @@index([tenantId, periodStart, periodEnd])
  @@index([tenantId, importedAt])
  @@index([tenantId, processedAt])
  @@index([tenantId, archivedAt])
  @@map("bank_statement_imports")
}
```

---

## 16.4. Modelo `BankStatementImportError`

```prisma id="cf2vzw"
model BankStatementImportError {
  id                  String                            @id @default(uuid())
  tenantId            String                            @map("tenant_id")
  statementImportId   String                            @map("statement_import_id")

  rowNumber           Int                               @map("row_number")
  errorCode           String                            @map("error_code")
  errorMessage        String                            @map("error_message")
  severity            BankStatementImportErrorSeverity  @default(ERROR)

  rawRowPreview       Json?                             @map("raw_row_preview")
  normalizedPreview   Json?                             @map("normalized_preview")

  createdAt           DateTime                          @default(now()) @map("created_at")
  metadata            Json?

  tenant              Tenant                            @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  statementImport     BankStatementImport               @relation(fields: [statementImportId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, statementImportId])
  @@index([tenantId, rowNumber])
  @@index([tenantId, severity])
  @@index([tenantId, errorCode])
  @@index([tenantId, createdAt])
  @@map("bank_statement_import_errors")
}
```

---

## 16.5. Modelo `BankTransaction`

```prisma id="d7rl8k"
model BankTransaction {
  id                       String                    @id @default(uuid())
  tenantId                 String                    @map("tenant_id")
  bankAccountId            String                    @map("bank_account_id")
  statementImportId        String                    @map("statement_import_id")

  transactionDate          DateTime                  @map("transaction_date")
  postedDate               DateTime?                 @map("posted_date")

  description              String?
  descriptionNormalized    String?                   @map("description_normalized")
  reference                String?
  referenceNormalized      String?                   @map("reference_normalized")
  bankReference            String?                   @map("bank_reference")
  bankReferenceNormalized  String?                   @map("bank_reference_normalized")

  transactionType          BankTransactionType       @default(UNKNOWN) @map("transaction_type")
  direction                BankTransactionDirection
  amount                   Decimal                   @db.Decimal(12, 2)
  currency                 Currency                  @default(USD)
  balanceAfter             Decimal?                  @map("balance_after") @db.Decimal(12, 2)

  fingerprint              String
  status                   BankTransactionStatus     @default(PENDING)
  isDuplicate              Boolean                   @default(false) @map("is_duplicate")
  duplicateOfTransactionId String?                   @map("duplicate_of_transaction_id")

  classificationUpdatedBy  String?                   @map("classification_updated_by")
  ignoredBy                String?                   @map("ignored_by")
  archivedBy               String?                   @map("archived_by")

  createdAt                DateTime                  @default(now()) @map("created_at")
  updatedAt                DateTime                  @updatedAt @map("updated_at")
  classificationUpdatedAt  DateTime?                 @map("classification_updated_at")
  ignoredAt                DateTime?                 @map("ignored_at")
  archivedAt               DateTime?                 @map("archived_at")

  ignoreReason             String?                   @map("ignore_reason")
  archiveReason            String?                   @map("archive_reason")
  metadata                 Json?

  tenant                   Tenant                    @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  bankAccount              BankAccount               @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)
  statementImport          BankStatementImport       @relation(fields: [statementImportId], references: [id], onDelete: Restrict)

  duplicateOfTransaction   BankTransaction?          @relation("DuplicateBankTransaction", fields: [duplicateOfTransactionId], references: [id], onDelete: Restrict)
  duplicateTransactions    BankTransaction[]         @relation("DuplicateBankTransaction")

  classificationUpdatedByUser UserProfile?           @relation("BankTransactionClassificationUpdatedBy", fields: [classificationUpdatedBy], references: [id], onDelete: Restrict)
  ignoredByUser            UserProfile?              @relation("BankTransactionIgnoredBy", fields: [ignoredBy], references: [id], onDelete: Restrict)
  archivedByUser           UserProfile?              @relation("BankTransactionArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  candidates               ReconciliationCandidate[]
  matchItems               ReconciliationMatchItem[]
  exceptions               ReconciliationException[]

  @@index([tenantId])
  @@index([tenantId, bankAccountId])
  @@index([tenantId, statementImportId])
  @@index([tenantId, transactionDate])
  @@index([tenantId, postedDate])
  @@index([tenantId, direction])
  @@index([tenantId, transactionType])
  @@index([tenantId, status])
  @@index([tenantId, isDuplicate])
  @@index([tenantId, fingerprint])
  @@index([tenantId, amount])
  @@index([tenantId, currency])
  @@index([tenantId, archivedAt])
  @@map("bank_transactions")
}
```

---

## 16.6. Modelo `ReconciliationSession`

```prisma id="t3ypt8"
model ReconciliationSession {
  id                   String                      @id @default(uuid())
  tenantId             String                      @map("tenant_id")
  bankAccountId        String                      @map("bank_account_id")

  periodStart          DateTime                    @map("period_start")
  periodEnd            DateTime                    @map("period_end")
  status               ReconciliationSessionStatus @default(DRAFT)

  openingBalance       Decimal?                    @map("opening_balance") @db.Decimal(12, 2)
  closingBalance       Decimal?                    @map("closing_balance") @db.Decimal(12, 2)
  totalBankCredits     Decimal                     @default(0) @map("total_bank_credits") @db.Decimal(12, 2)
  totalBankDebits      Decimal                     @default(0) @map("total_bank_debits") @db.Decimal(12, 2)
  totalMatchedAmount   Decimal                     @default(0) @map("total_matched_amount") @db.Decimal(12, 2)
  totalUnmatchedAmount Decimal                     @default(0) @map("total_unmatched_amount") @db.Decimal(12, 2)
  totalExceptions      Int                         @default(0) @map("total_exceptions")

  createdBy            String?                     @map("created_by")
  openedBy             String?                     @map("opened_by")
  closedBy             String?                     @map("closed_by")
  reopenedBy           String?                     @map("reopened_by")
  archivedBy           String?                     @map("archived_by")

  createdAt            DateTime                    @default(now()) @map("created_at")
  openedAt             DateTime?                   @map("opened_at")
  closedAt             DateTime?                   @map("closed_at")
  reopenedAt           DateTime?                   @map("reopened_at")
  archivedAt           DateTime?                   @map("archived_at")

  closeReason          String?                     @map("close_reason")
  reopenReason         String?                     @map("reopen_reason")
  archiveReason        String?                     @map("archive_reason")
  metadata             Json?

  tenant               Tenant                      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  bankAccount          BankAccount                 @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)

  createdByUser        UserProfile?                @relation("ReconciliationSessionCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  openedByUser         UserProfile?                @relation("ReconciliationSessionOpenedBy", fields: [openedBy], references: [id], onDelete: Restrict)
  closedByUser         UserProfile?                @relation("ReconciliationSessionClosedBy", fields: [closedBy], references: [id], onDelete: Restrict)
  reopenedByUser       UserProfile?                @relation("ReconciliationSessionReopenedBy", fields: [reopenedBy], references: [id], onDelete: Restrict)
  archivedByUser       UserProfile?                @relation("ReconciliationSessionArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  candidates           ReconciliationCandidate[]
  matches              ReconciliationMatch[]
  exceptions           ReconciliationException[]

  @@index([tenantId])
  @@index([tenantId, bankAccountId])
  @@index([tenantId, status])
  @@index([tenantId, periodStart, periodEnd])
  @@index([tenantId, createdAt])
  @@index([tenantId, closedAt])
  @@index([tenantId, archivedAt])
  @@map("reconciliation_sessions")
}
```

---

## 16.7. Modelo `ReconciliationCandidate`

```prisma id="s2ot4k"
model ReconciliationCandidate {
  id                      String                         @id @default(uuid())
  tenantId                String                         @map("tenant_id")
  reconciliationSessionId String                         @map("reconciliation_session_id")
  bankTransactionId       String                         @map("bank_transaction_id")
  paymentId               String                         @map("payment_id")

  score                   Int
  scoreBand               ReconciliationScoreBand        @map("score_band")
  scoreReason             Json                           @map("score_reason")
  matchType               ReconciliationMatchType        @map("match_type")
  status                  ReconciliationCandidateStatus  @default(SUGGESTED)

  generatedBy             String?                        @map("generated_by")
  reviewedBy              String?                        @map("reviewed_by")

  createdAt               DateTime                       @default(now()) @map("created_at")
  reviewedAt              DateTime?                      @map("reviewed_at")
  expiresAt               DateTime?                      @map("expires_at")

  rejectReason            String?                        @map("reject_reason")
  metadata                Json?

  tenant                  Tenant                         @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  reconciliationSession   ReconciliationSession          @relation(fields: [reconciliationSessionId], references: [id], onDelete: Restrict)
  bankTransaction         BankTransaction                @relation(fields: [bankTransactionId], references: [id], onDelete: Restrict)
  payment                 Payment                        @relation(fields: [paymentId], references: [id], onDelete: Restrict)

  generatedByUser         UserProfile?                   @relation("ReconciliationCandidateGeneratedBy", fields: [generatedBy], references: [id], onDelete: Restrict)
  reviewedByUser          UserProfile?                   @relation("ReconciliationCandidateReviewedBy", fields: [reviewedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, reconciliationSessionId])
  @@index([tenantId, bankTransactionId])
  @@index([tenantId, paymentId])
  @@index([tenantId, status])
  @@index([tenantId, score])
  @@index([tenantId, scoreBand])
  @@index([tenantId, matchType])
  @@index([tenantId, createdAt])
  @@index([tenantId, expiresAt])
  @@map("reconciliation_candidates")
}
```

---

## 16.8. Modelo `ReconciliationMatch`

```prisma id="yr0p2w"
model ReconciliationMatch {
  id                      String                      @id @default(uuid())
  tenantId                String                      @map("tenant_id")
  reconciliationSessionId String                      @map("reconciliation_session_id")

  matchType               ReconciliationMatchType     @map("match_type")
  status                  ReconciliationMatchStatus   @default(CONFIRMED)

  confirmedBy             String?                     @map("confirmed_by")
  reversedBy              String?                     @map("reversed_by")
  archivedBy              String?                     @map("archived_by")

  confirmedAt             DateTime                    @default(now()) @map("confirmed_at")
  reversedAt              DateTime?                   @map("reversed_at")
  archivedAt              DateTime?                   @map("archived_at")

  reverseReason           String?                     @map("reverse_reason")
  archiveReason           String?                     @map("archive_reason")

  totalBankAmount         Decimal                     @map("total_bank_amount") @db.Decimal(12, 2)
  totalPaymentAmount      Decimal                     @map("total_payment_amount") @db.Decimal(12, 2)
  differenceAmount        Decimal                     @default(0) @map("difference_amount") @db.Decimal(12, 2)
  differenceReason        String?                     @map("difference_reason")

  idempotencyKey          String?                     @map("idempotency_key")
  metadata                Json?

  tenant                  Tenant                      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  reconciliationSession   ReconciliationSession       @relation(fields: [reconciliationSessionId], references: [id], onDelete: Restrict)

  confirmedByUser         UserProfile?                @relation("ReconciliationMatchConfirmedBy", fields: [confirmedBy], references: [id], onDelete: Restrict)
  reversedByUser          UserProfile?                @relation("ReconciliationMatchReversedBy", fields: [reversedBy], references: [id], onDelete: Restrict)
  archivedByUser          UserProfile?                @relation("ReconciliationMatchArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  items                   ReconciliationMatchItem[]

  @@index([tenantId])
  @@index([tenantId, reconciliationSessionId])
  @@index([tenantId, matchType])
  @@index([tenantId, status])
  @@index([tenantId, confirmedAt])
  @@index([tenantId, reversedAt])
  @@index([tenantId, archivedAt])
  @@index([tenantId, idempotencyKey])
  @@map("reconciliation_matches")
}
```

---

## 16.9. Modelo `ReconciliationMatchItem`

```prisma id="nfmb1z"
model ReconciliationMatchItem {
  id                    String                      @id @default(uuid())
  tenantId              String                      @map("tenant_id")
  reconciliationMatchId String                      @map("reconciliation_match_id")

  bankTransactionId     String?                     @map("bank_transaction_id")
  paymentId             String?                     @map("payment_id")

  itemType              ReconciliationMatchItemType @map("item_type")
  amountApplied         Decimal                     @map("amount_applied") @db.Decimal(12, 2)
  currency              Currency                    @default(USD)

  createdAt             DateTime                    @default(now()) @map("created_at")
  metadata              Json?

  tenant                Tenant                      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  reconciliationMatch   ReconciliationMatch         @relation(fields: [reconciliationMatchId], references: [id], onDelete: Restrict)
  bankTransaction       BankTransaction?            @relation(fields: [bankTransactionId], references: [id], onDelete: Restrict)
  payment               Payment?                    @relation(fields: [paymentId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, reconciliationMatchId])
  @@index([tenantId, bankTransactionId])
  @@index([tenantId, paymentId])
  @@index([tenantId, itemType])
  @@index([tenantId, createdAt])
  @@map("reconciliation_match_items")
}
```

---

## 16.10. Modelo `ReconciliationException`

```prisma id="ybf10r"
model ReconciliationException {
  id                      String                           @id @default(uuid())
  tenantId                String                           @map("tenant_id")
  reconciliationSessionId String                           @map("reconciliation_session_id")

  bankTransactionId       String?                          @map("bank_transaction_id")
  paymentId               String?                          @map("payment_id")

  exceptionType           ReconciliationExceptionType      @map("exception_type")
  status                  ReconciliationExceptionStatus    @default(OPEN)
  severity                ReconciliationExceptionSeverity  @default(MEDIUM)

  description             String
  resolutionNotes         String?                          @map("resolution_notes")
  ignoreReason            String?                          @map("ignore_reason")

  createdBy               String?                          @map("created_by")
  updatedBy               String?                          @map("updated_by")
  resolvedBy              String?                          @map("resolved_by")
  ignoredBy               String?                          @map("ignored_by")
  archivedBy              String?                          @map("archived_by")

  createdAt               DateTime                         @default(now()) @map("created_at")
  updatedAt               DateTime                         @updatedAt @map("updated_at")
  resolvedAt              DateTime?                        @map("resolved_at")
  ignoredAt               DateTime?                        @map("ignored_at")
  archivedAt              DateTime?                        @map("archived_at")

  archiveReason           String?                          @map("archive_reason")
  metadata                Json?

  tenant                  Tenant                           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  reconciliationSession   ReconciliationSession            @relation(fields: [reconciliationSessionId], references: [id], onDelete: Restrict)
  bankTransaction         BankTransaction?                 @relation(fields: [bankTransactionId], references: [id], onDelete: Restrict)
  payment                 Payment?                         @relation(fields: [paymentId], references: [id], onDelete: Restrict)

  createdByUser           UserProfile?                     @relation("ReconciliationExceptionCreatedBy", fields: [createdBy], references: [id], onDelete: Restrict)
  updatedByUser           UserProfile?                     @relation("ReconciliationExceptionUpdatedBy", fields: [updatedBy], references: [id], onDelete: Restrict)
  resolvedByUser          UserProfile?                     @relation("ReconciliationExceptionResolvedBy", fields: [resolvedBy], references: [id], onDelete: Restrict)
  ignoredByUser           UserProfile?                     @relation("ReconciliationExceptionIgnoredBy", fields: [ignoredBy], references: [id], onDelete: Restrict)
  archivedByUser          UserProfile?                     @relation("ReconciliationExceptionArchivedBy", fields: [archivedBy], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, reconciliationSessionId])
  @@index([tenantId, bankTransactionId])
  @@index([tenantId, paymentId])
  @@index([tenantId, exceptionType])
  @@index([tenantId, status])
  @@index([tenantId, severity])
  @@index([tenantId, createdAt])
  @@index([tenantId, resolvedAt])
  @@index([tenantId, archivedAt])
  @@map("reconciliation_exceptions")
}
```

---

# 17. Relaciones requeridas en modelos existentes

## 17.1. Tenant

```prisma id="xct7y0"
model Tenant {
  // campos existentes...

  bankAccounts                 BankAccount[]
  bankStatementImports          BankStatementImport[]
  bankStatementImportErrors     BankStatementImportError[]
  bankTransactions              BankTransaction[]
  reconciliationSessions        ReconciliationSession[]
  reconciliationCandidates      ReconciliationCandidate[]
  reconciliationMatches         ReconciliationMatch[]
  reconciliationMatchItems      ReconciliationMatchItem[]
  reconciliationExceptions      ReconciliationException[]
}
```

---

## 17.2. UserProfile

```prisma id="xic0ch"
model UserProfile {
  // campos existentes...

  bankAccountsCreated           BankAccount[] @relation("BankAccountCreatedBy")
  bankAccountsUpdated           BankAccount[] @relation("BankAccountUpdatedBy")
  bankAccountsActivated         BankAccount[] @relation("BankAccountActivatedBy")
  bankAccountsDeactivated       BankAccount[] @relation("BankAccountDeactivatedBy")
  bankAccountsArchived          BankAccount[] @relation("BankAccountArchivedBy")

  bankStatementImportsImported  BankStatementImport[] @relation("BankStatementImportImportedBy")
  bankStatementImportsProcessed BankStatementImport[] @relation("BankStatementImportProcessedBy")
  bankStatementImportsCancelled BankStatementImport[] @relation("BankStatementImportCancelledBy")
  bankStatementImportsArchived  BankStatementImport[] @relation("BankStatementImportArchivedBy")

  bankTransactionsClassified    BankTransaction[] @relation("BankTransactionClassificationUpdatedBy")
  bankTransactionsIgnored       BankTransaction[] @relation("BankTransactionIgnoredBy")
  bankTransactionsArchived      BankTransaction[] @relation("BankTransactionArchivedBy")

  reconciliationSessionsCreated  ReconciliationSession[] @relation("ReconciliationSessionCreatedBy")
  reconciliationSessionsOpened   ReconciliationSession[] @relation("ReconciliationSessionOpenedBy")
  reconciliationSessionsClosed   ReconciliationSession[] @relation("ReconciliationSessionClosedBy")
  reconciliationSessionsReopened ReconciliationSession[] @relation("ReconciliationSessionReopenedBy")
  reconciliationSessionsArchived ReconciliationSession[] @relation("ReconciliationSessionArchivedBy")

  reconciliationCandidatesGenerated ReconciliationCandidate[] @relation("ReconciliationCandidateGeneratedBy")
  reconciliationCandidatesReviewed  ReconciliationCandidate[] @relation("ReconciliationCandidateReviewedBy")

  reconciliationMatchesConfirmed ReconciliationMatch[] @relation("ReconciliationMatchConfirmedBy")
  reconciliationMatchesReversed  ReconciliationMatch[] @relation("ReconciliationMatchReversedBy")
  reconciliationMatchesArchived  ReconciliationMatch[] @relation("ReconciliationMatchArchivedBy")

  reconciliationExceptionsCreated  ReconciliationException[] @relation("ReconciliationExceptionCreatedBy")
  reconciliationExceptionsUpdated  ReconciliationException[] @relation("ReconciliationExceptionUpdatedBy")
  reconciliationExceptionsResolved ReconciliationException[] @relation("ReconciliationExceptionResolvedBy")
  reconciliationExceptionsIgnored  ReconciliationException[] @relation("ReconciliationExceptionIgnoredBy")
  reconciliationExceptionsArchived ReconciliationException[] @relation("ReconciliationExceptionArchivedBy")
}
```

---

## 17.3. Payment

Se recomienda agregar relaciones desde `Payment` hacia conciliación.

```prisma id="dhv06a"
model Payment {
  // campos existentes...

  reconciliationStatus  PaymentReconciliationStatus? @map("reconciliation_status")
  reconciledAt          DateTime?                    @map("reconciled_at")
  reconciledBy          String?                      @map("reconciled_by")
  reconciliationMatchId String?                      @map("reconciliation_match_id")

  reconciliationCandidates ReconciliationCandidate[]
  reconciliationMatchItems ReconciliationMatchItem[]
  reconciliationExceptions ReconciliationException[]
}
```

Enum sugerido:

```prisma id="tfszm4"
enum PaymentReconciliationStatus {
  NOT_REQUIRED              @map("notRequired")
  PENDING                   @map("pending")
  CANDIDATE_FOUND           @map("candidateFound")
  RECONCILED                @map("reconciled")
  PARTIALLY_RECONCILED      @map("partiallyReconciled")
  RECONCILIATION_EXCEPTION  @map("reconciliationException")
  RECONCILIATION_REVERSED   @map("reconciliationReversed")

  @@map("payment_reconciliation_status")
}
```

Nota:

```text id="b3j2uo"
Si se decide no modificar payments en MVP, crear una tabla auxiliar payment_reconciliation_statuses. La decisión recomendada es agregar campos mínimos a payments y usar reconciliation_match_items para el detalle.
```

---

## 17.4. SecureDocument y SecureDocumentFile

Si Prisma exige relaciones inversas:

```prisma id="v466az"
model SecureDocument {
  // campos existentes...

  bankStatementImports BankStatementImport[]
}

model SecureDocumentFile {
  // campos existentes...

  bankStatementImports BankStatementImport[]
}
```

Además, debe agregarse `bankReconciliation` al enum `SourceModule` de `016-secure-document-storage`:

```prisma id="okurvx"
enum SourceModule {
  // valores existentes...
  BANK_RECONCILIATION @map("bankReconciliation")
}
```

---

# 18. Constraints recomendadas

## 18.1. `bank_accounts`

```text id="f4lkzz"
tenant_id NOT NULL
bank_name NOT NULL
account_name NOT NULL
account_number_masked NOT NULL
account_number_hash NOT NULL
account_type NOT NULL
currency NOT NULL
status NOT NULL
archived_at requerido si status = archived
activated_at recomendado si status = active
account_number completo prohibido
metadata sanitizada
```

---

## 18.2. `bank_statement_imports`

```text id="t4p6mq"
tenant_id NOT NULL
bank_account_id NOT NULL
import_type NOT NULL
original_file_name NOT NULL
file_hash NOT NULL
hash_algorithm NOT NULL
status NOT NULL
period_start NOT NULL
period_end NOT NULL
period_start <= period_end
total_rows >= 0
valid_rows >= 0
invalid_rows >= 0
duplicate_rows >= 0
created_transactions >= 0
processed_at requerido si status IN processed, processedWithWarnings
cancelled_at requerido si status = cancelled
archived_at requerido si status = archived
metadata sanitizada
```

---

## 18.3. `bank_statement_import_errors`

```text id="l9z5ty"
tenant_id NOT NULL
statement_import_id NOT NULL
row_number > 0
error_code NOT NULL
error_message NOT NULL
severity NOT NULL
raw_row_preview truncado y sanitizado
normalized_preview sanitizado
metadata sanitizada
```

---

## 18.4. `bank_transactions`

```text id="i32pq4"
tenant_id NOT NULL
bank_account_id NOT NULL
statement_import_id NOT NULL
transaction_date NOT NULL
direction NOT NULL
amount NOT NULL
amount > 0
currency NOT NULL
fingerprint NOT NULL
status NOT NULL
duplicate_of_transaction_id requerido si is_duplicate = true
ignore_reason requerido si status = ignored
archived_at requerido si status = archived
metadata sanitizada
```

---

## 18.5. `reconciliation_sessions`

```text id="hzx44s"
tenant_id NOT NULL
bank_account_id NOT NULL
period_start NOT NULL
period_end NOT NULL
period_start <= period_end
status NOT NULL
totales Decimal >= 0 según campo
closed_at requerido si status = closed
reopen_reason requerido si status = reopened
archived_at requerido si status = archived
metadata sanitizada
```

---

## 18.6. `reconciliation_candidates`

```text id="lj0fwn"
tenant_id NOT NULL
reconciliation_session_id NOT NULL
bank_transaction_id NOT NULL
payment_id NOT NULL
score BETWEEN 0 AND 100
score_band NOT NULL
score_reason NOT NULL
match_type NOT NULL
status NOT NULL
reject_reason requerido si status = rejected
metadata sanitizada
```

---

## 18.7. `reconciliation_matches`

```text id="wsnlab"
tenant_id NOT NULL
reconciliation_session_id NOT NULL
match_type NOT NULL
status NOT NULL
total_bank_amount >= 0
total_payment_amount >= 0
difference_amount NOT NULL
difference_reason requerido si difference_amount != 0
reverse_reason requerido si status = reversed
reversed_at requerido si status = reversed
archived_at requerido si status = archived
metadata sanitizada
```

---

## 18.8. `reconciliation_match_items`

```text id="gp1o71"
tenant_id NOT NULL
reconciliation_match_id NOT NULL
item_type NOT NULL
amount_applied > 0
currency NOT NULL
bank_transaction_id requerido si item_type = bankTransaction
payment_id requerido si item_type = payment
metadata sanitizada
```

---

## 18.9. `reconciliation_exceptions`

```text id="iczh0e"
tenant_id NOT NULL
reconciliation_session_id NOT NULL
exception_type NOT NULL
status NOT NULL
severity NOT NULL
description NOT NULL
resolution_notes requerido si status = resolved
ignore_reason requerido si status = ignored
archived_at requerido si status = archived
bank_transaction_id o payment_id requerido salvo excepción general documentada
metadata sanitizada
```

---

# 19. Índices recomendados

## 19.1. `bank_accounts`

```text id="wli379"
tenant_id
tenant_id + status
tenant_id + currency
tenant_id + account_type
tenant_id + is_default
tenant_id + account_number_hash
tenant_id + created_at
tenant_id + archived_at
```

---

## 19.2. `bank_statement_imports`

```text id="kwwz2s"
tenant_id
tenant_id + bank_account_id
tenant_id + status
tenant_id + import_type
tenant_id + file_hash
tenant_id + period_start + period_end
tenant_id + imported_at
tenant_id + processed_at
tenant_id + archived_at
```

---

## 19.3. `bank_statement_import_errors`

```text id="p8epnk"
tenant_id
tenant_id + statement_import_id
tenant_id + row_number
tenant_id + severity
tenant_id + error_code
tenant_id + created_at
```

---

## 19.4. `bank_transactions`

```text id="k7y7cm"
tenant_id
tenant_id + bank_account_id
tenant_id + statement_import_id
tenant_id + transaction_date
tenant_id + posted_date
tenant_id + direction
tenant_id + transaction_type
tenant_id + status
tenant_id + is_duplicate
tenant_id + fingerprint
tenant_id + amount
tenant_id + currency
tenant_id + archived_at
```

---

## 19.5. `reconciliation_sessions`

```text id="vj22ri"
tenant_id
tenant_id + bank_account_id
tenant_id + status
tenant_id + period_start + period_end
tenant_id + created_at
tenant_id + closed_at
tenant_id + archived_at
```

---

## 19.6. `reconciliation_candidates`

```text id="r2yis5"
tenant_id
tenant_id + reconciliation_session_id
tenant_id + bank_transaction_id
tenant_id + payment_id
tenant_id + status
tenant_id + score
tenant_id + score_band
tenant_id + match_type
tenant_id + created_at
tenant_id + expires_at
```

---

## 19.7. `reconciliation_matches`

```text id="ujzq9d"
tenant_id
tenant_id + reconciliation_session_id
tenant_id + match_type
tenant_id + status
tenant_id + confirmed_at
tenant_id + reversed_at
tenant_id + archived_at
tenant_id + idempotency_key
```

---

## 19.8. `reconciliation_match_items`

```text id="u57may"
tenant_id
tenant_id + reconciliation_match_id
tenant_id + bank_transaction_id
tenant_id + payment_id
tenant_id + item_type
tenant_id + created_at
```

---

## 19.9. `reconciliation_exceptions`

```text id="abzejo"
tenant_id
tenant_id + reconciliation_session_id
tenant_id + bank_transaction_id
tenant_id + payment_id
tenant_id + exception_type
tenant_id + status
tenant_id + severity
tenant_id + created_at
tenant_id + resolved_at
tenant_id + archived_at
```

---

# 20. Índices parciales raw recomendados

## 20.1. Una cuenta default activa por tenant

```sql id="uhv33t"
CREATE UNIQUE INDEX bank_accounts_one_default_active_per_tenant
ON bank_accounts(tenant_id)
WHERE is_default = true
  AND status = 'active'
  AND archived_at IS NULL;
```

---

## 20.2. Importación única por archivo en cuenta

```sql id="c1nb6w"
CREATE UNIQUE INDEX bank_statement_imports_unique_file_hash_per_account
ON bank_statement_imports(tenant_id, bank_account_id, file_hash)
WHERE archived_at IS NULL
  AND status NOT IN ('cancelled', 'failed');
```

---

## 20.3. Fingerprint único por cuenta

```sql id="afo1oa"
CREATE UNIQUE INDEX bank_transactions_unique_fingerprint_per_account
ON bank_transactions(tenant_id, bank_account_id, fingerprint)
WHERE archived_at IS NULL
  AND is_duplicate = false;
```

---

## 20.4. Una sesión activa por cuenta y periodo

```sql id="t9ik0a"
CREATE UNIQUE INDEX reconciliation_sessions_one_active_per_period
ON reconciliation_sessions(tenant_id, bank_account_id, period_start, period_end)
WHERE archived_at IS NULL
  AND status IN ('draft', 'open', 'reviewing', 'reopened');
```

---

## 20.5. Candidato activo único por movimiento y pago

```sql id="ka0qa9"
CREATE UNIQUE INDEX reconciliation_candidates_unique_active_pair
ON reconciliation_candidates(tenant_id, reconciliation_session_id, bank_transaction_id, payment_id)
WHERE status = 'suggested';
```

---

## 20.6. Idempotency key único por tenant

```sql id="yx367u"
CREATE UNIQUE INDEX reconciliation_matches_unique_idempotency_key
ON reconciliation_matches(tenant_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;
```

---

# 21. Reglas de multitenancy

Todas las tablas nuevas tienen `tenant_id`.

Regla obligatoria:

```text id="cqe3q7"
Toda consulta, escritura, transición de estado, match, reverso, reporte y auditoría debe operar con currentTenant.id como tenant_id efectivo.
```

Patrón requerido:

```typescript id="e5h38w"
await prisma.reconciliationMatch.findFirst({
  where: {
    id: matchId,
    tenantId: currentTenant.id
  }
});
```

Patrón prohibido:

```typescript id="kb5fq1"
await prisma.reconciliationMatch.findUnique({
  where: { id: matchId }
});
```

También prohibido:

```typescript id="t57wng"
await prisma.bankAccount.findUnique({ where: { id: bankAccountId } });
await prisma.bankStatementImport.findUnique({ where: { id: importId } });
await prisma.bankTransaction.findUnique({ where: { id: bankTransactionId } });
await prisma.reconciliationSession.findUnique({ where: { id: sessionId } });
await prisma.reconciliationCandidate.findUnique({ where: { id: candidateId } });
await prisma.reconciliationException.findUnique({ where: { id: exceptionId } });
```

Referencias cross-tenant que deben bloquearse:

```text id="zm4nf8"
bankAccountId
statementImportId
bankTransactionId
reconciliationSessionId
candidateId
matchId
exceptionId
paymentId
secureDocumentId
secureDocumentFileId
duplicateOfTransactionId
```

---

# 22. Reglas monetarias

## 22.1. Tipo de dato

Usar siempre:

```text id="xm03f7"
Decimal(12,2)
```

Campos monetarios:

```text id="a0ckhc"
bank_transactions.amount
bank_transactions.balance_after
reconciliation_sessions.opening_balance
reconciliation_sessions.closing_balance
reconciliation_sessions.total_bank_credits
reconciliation_sessions.total_bank_debits
reconciliation_sessions.total_matched_amount
reconciliation_sessions.total_unmatched_amount
reconciliation_matches.total_bank_amount
reconciliation_matches.total_payment_amount
reconciliation_matches.difference_amount
reconciliation_match_items.amount_applied
```

---

## 22.2. Prohibido

```text id="fj3q8d"
float
double
JavaScript number para cálculos monetarios
redondeo implícito no controlado
comparaciones aproximadas no documentadas
```

---

## 22.3. Reglas

```text id="szx9jl"
- amount > 0;
- currency obligatoria;
- MVP solo USD;
- differenceAmount debe calcularse con Decimal;
- toleranceAmount MVP = 0.00;
- differenceReason obligatorio si differenceAmount != 0.00;
```

---

# 23. Reglas de número de cuenta

## 23.1. Datos persistidos

Persistir:

```text id="ax0l2f"
accountNumberMasked
accountNumberHash
```

No persistir en MVP:

```text id="d8zoxn"
accountNumber completo
```

---

## 23.2. Ejemplo

```text id="row9tr"
accountNumberMasked = "**** **** 1234"
accountNumberHash = SHA-256(normalizedAccountNumber + tenantScopedPepper)
```

---

## 23.3. Reglas

```text id="lwby4d"
- accountNumberHash no se expone por DTO estándar;
- accountNumberMasked sí puede exponerse;
- logs no deben contener número completo;
- audit no debe contener número completo;
- accountNumber completo no debe guardarse en metadata.
```

---

# 24. Reglas de fingerprint

## 24.1. Input canónico

```json id="fsq463"
{
  "tenantId": "tenant_uuid",
  "bankAccountId": "bank_account_uuid",
  "transactionDate": "2026-07-21",
  "postedDate": "2026-07-21",
  "direction": "credit",
  "amount": "125.50",
  "currency": "USD",
  "reference": "REF123",
  "bankReference": "BNK456",
  "description": "DEPOSITO TRANSFERENCIA ALICUOTA JULIO"
}
```

---

## 24.2. Reglas de canonicalización

```text id="qogk09"
- fechas en formato YYYY-MM-DD;
- monto como Decimal string con 2 decimales;
- moneda uppercase;
- direction normalizado;
- references trim;
- descriptions trim;
- colapsar espacios;
- normalizar a uppercase o lowercase de forma consistente;
- null explícito para campos ausentes;
- JSON keys ordenadas;
- UTF-8.
```

---

## 24.3. Algoritmo

```text id="z7c13a"
fingerprint = SHA-256(canonicalInput)
```

---

## 24.4. Reglas

```text id="jj8i3r"
- fingerprint obligatorio;
- fingerprint no se acepta desde cliente;
- fingerprint se calcula en servidor;
- fingerprint permite detectar duplicados;
- fingerprint no se usa como dato público.
```

---

# 25. Reglas de importación

## 25.1. Importación CSV/XLSX

Columnas mínimas genéricas:

```text id="ezdf50"
transactionDate
postedDate
description
reference
bankReference
direction
amount
currency
balanceAfter
```

---

## 25.2. Validaciones

```text id="vqswph"
transactionDate requerido
amount requerido
amount > 0
direction requerido
direction credit/debit/neutral
currency requerido
currency USD
description recomendado
periodStart <= transactionDate <= periodEnd recomendado
bankAccount active
archivo no vacío
MIME permitido
hash calculado
Secure Document Storage registrado
```

---

## 25.3. Errores por fila

Registrar en `bank_statement_import_errors`:

```text id="askwot"
rowNumber
errorCode
errorMessage
severity
rawRowPreview
normalizedPreview
```

Regla:

```text id="abjh4g"
rawRowPreview debe ser truncado, sanitizado y no debe contener datos bancarios sensibles completos.
```

---

# 26. Reglas de matching

## 26.1. Candidatos

`ReconciliationCandidate` debe guardar:

```text id="bxaok7"
bankTransactionId
paymentId
score
scoreBand
scoreReason
matchType
status
```

Regla:

```text id="q1hdhn"
Un candidate no cambia estado de Payment ni BankTransaction.
```

---

## 26.2. Matches

`ReconciliationMatch` debe guardar:

```text id="zapv0p"
matchType
totalBankAmount
totalPaymentAmount
differenceAmount
differenceReason
status
```

`ReconciliationMatchItem` debe guardar los vínculos individuales.

---

## 26.3. Match 1:1

Estructura:

```text id="lmxltr"
ReconciliationMatch
├── item bankTransaction: bankTransactionId=A, amountApplied=100.00
└── item payment: paymentId=P, amountApplied=100.00
```

---

## 26.4. Match 1:N

Estructura:

```text id="kycg8s"
ReconciliationMatch
├── item bankTransaction: bankTransactionId=A, amountApplied=300.00
├── item payment: paymentId=P1, amountApplied=100.00
├── item payment: paymentId=P2, amountApplied=100.00
└── item payment: paymentId=P3, amountApplied=100.00
```

---

## 26.5. Match N:1

Estructura:

```text id="w0i1yv"
ReconciliationMatch
├── item bankTransaction: bankTransactionId=A1, amountApplied=50.00
├── item bankTransaction: bankTransactionId=A2, amountApplied=50.00
└── item payment: paymentId=P1, amountApplied=100.00
```

---

## 26.6. Diferencias

```text id="j2nt6c"
differenceAmount = totalBankAmount - totalPaymentAmount
```

Si `differenceAmount != 0.00`:

```text id="tiu2gi"
differenceReason obligatorio
```

---

# 27. Reglas de sesiones

## 27.1. Sesión activa

Estados activos:

```text id="gzqx6x"
draft
open
reviewing
reopened
```

---

## 27.2. Sesión cerrada

Si `status = closed`:

```text id="huwotv"
- no nuevos candidatos;
- no nuevos matches;
- no nuevas excepciones ordinarias;
- no cambios ordinarios;
- solo reopen con permiso reforzado.
```

---

## 27.3. Cierre bloqueado

Si existen excepciones abiertas:

```text id="y53fiz"
severity = high
severity = critical
```

y la política está activa, el cierre debe fallar.

---

# 28. DTOs derivados del modelo

## 28.1. BankAccountDto

```text id="eb3d1w"
id
bankName
accountName
accountNumberMasked
accountType
currency
status
isDefault
description
createdAt
updatedAt
activatedAt
deactivatedAt
archivedAt
metadata
```

No incluye:

```text id="fvr2py"
accountNumber completo
accountNumberHash
```

---

## 28.2. BankStatementImportDto

```text id="aadwd8"
id
bankAccountId
secureDocumentId
secureDocumentFileId
importType
originalFileName
hashPrefix
hashAlgorithm
status
periodStart
periodEnd
importedAt
processedAt
totalRows
validRows
invalidRows
duplicateRows
createdTransactions
errorSummary
metadata
```

No incluye:

```text id="v4y1r8"
fileHash completo
storageKey
archivo completo
fila completa
```

---

## 28.3. BankStatementImportErrorDto

```text id="me6n03"
id
statementImportId
rowNumber
errorCode
errorMessage
severity
rawRowPreview
normalizedPreview
createdAt
metadata
```

Regla:

```text id="xfyvqc"
rawRowPreview y normalizedPreview deben estar minimizados y sanitizados.
```

---

## 28.4. BankTransactionDto

```text id="mxi6p1"
id
bankAccountId
statementImportId
transactionDate
postedDate
description
referencePreview
bankReferencePreview
transactionType
direction
amount
currency
balanceAfter
status
isDuplicate
duplicateOfTransactionId
createdAt
updatedAt
archivedAt
metadata
```

No incluye por defecto:

```text id="jdr3v2"
fingerprint
reference completa si contiene datos sensibles
bankReference completa si contiene datos sensibles
description completa no sanitizada
```

---

## 28.5. ReconciliationSessionDto

```text id="uqsrdj"
id
bankAccountId
periodStart
periodEnd
status
openingBalance
closingBalance
totalBankCredits
totalBankDebits
totalMatchedAmount
totalUnmatchedAmount
totalExceptions
createdAt
openedAt
closedAt
reopenedAt
archivedAt
metadata
```

---

## 28.6. ReconciliationCandidateDto

```text id="vt4z39"
id
reconciliationSessionId
bankTransactionId
paymentId
score
scoreBand
scoreReason
matchType
status
createdAt
reviewedAt
expiresAt
rejectReason
metadata
```

---

## 28.7. ReconciliationMatchDto

```text id="umlpms"
id
reconciliationSessionId
matchType
status
confirmedAt
reversedAt
archivedAt
reverseReason
totalBankAmount
totalPaymentAmount
differenceAmount
differenceReason
items
metadata
```

---

## 28.8. ReconciliationMatchItemDto

```text id="fngw3l"
id
reconciliationMatchId
bankTransactionId
paymentId
itemType
amountApplied
currency
createdAt
metadata
```

---

## 28.9. ReconciliationExceptionDto

```text id="pwq9mo"
id
reconciliationSessionId
bankTransactionId
paymentId
exceptionType
status
severity
description
resolutionNotes
ignoreReason
createdAt
updatedAt
resolvedAt
ignoredAt
archivedAt
metadata
```

---

# 29. Reglas de consulta

## 29.1. Filtros de cuentas bancarias

```text id="p8n4dn"
status
currency
accountType
isDefault
archived
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="vdc273"
createdAt
updatedAt
bankName
accountName
status
```

---

## 29.2. Filtros de importaciones

```text id="jtbfix"
bankAccountId
status
importType
periodStart
periodEnd
importedFrom
importedTo
processedFrom
processedTo
archived
page
pageSize
sortBy
sortOrder
```

---

## 29.3. Filtros de movimientos bancarios

```text id="qsj4g8"
bankAccountId
statementImportId
transactionDateFrom
transactionDateTo
postedDateFrom
postedDateTo
direction
transactionType
status
isDuplicate
amountMin
amountMax
currency
q
page
pageSize
sortBy
sortOrder
```

Sort permitido:

```text id="l41gm9"
transactionDate
postedDate
amount
status
createdAt
```

---

## 29.4. Filtros de sesiones

```text id="r161ay"
bankAccountId
status
periodStart
periodEnd
createdFrom
createdTo
closedFrom
closedTo
page
pageSize
sortBy
sortOrder
```

---

## 29.5. Filtros de candidatos

```text id="zoeqbo"
reconciliationSessionId
bankTransactionId
paymentId
status
scoreMin
scoreMax
scoreBand
matchType
page
pageSize
sortBy
sortOrder
```

---

## 29.6. Filtros de matches

```text id="afqzfi"
reconciliationSessionId
status
matchType
paymentId
bankTransactionId
confirmedFrom
confirmedTo
reversedFrom
reversedTo
page
pageSize
sortBy
sortOrder
```

---

## 29.7. Filtros de excepciones

```text id="mrx6yr"
reconciliationSessionId
bankTransactionId
paymentId
exceptionType
status
severity
createdFrom
createdTo
resolvedFrom
resolvedTo
page
pageSize
sortBy
sortOrder
```

---

# 30. Queries conceptuales

## 30.1. Listar movimientos pendientes

```sql id="b1ktdr"
SELECT
  id,
  transaction_date,
  posted_date,
  direction,
  amount,
  currency,
  transaction_type,
  status
FROM bank_transactions
WHERE tenant_id = $1
  AND bank_account_id = $2
  AND status IN ('pending', 'candidateFound', 'unmatched', 'exception')
  AND archived_at IS NULL
ORDER BY transaction_date DESC
LIMIT $3 OFFSET $4;
```

---

## 30.2. Detectar duplicado por fingerprint

```sql id="pr9n52"
SELECT id
FROM bank_transactions
WHERE tenant_id = $1
  AND bank_account_id = $2
  AND fingerprint = $3
  AND archived_at IS NULL
  AND is_duplicate = false
LIMIT 1;
```

---

## 30.3. Listar candidatos por sesión

```sql id="k71nse"
SELECT
  id,
  bank_transaction_id,
  payment_id,
  score,
  score_band,
  match_type,
  status,
  created_at
FROM reconciliation_candidates
WHERE tenant_id = $1
  AND reconciliation_session_id = $2
  AND status = 'suggested'
ORDER BY score DESC, created_at DESC
LIMIT $3 OFFSET $4;
```

---

## 30.4. Listar matches por sesión

```sql id="bczmbp"
SELECT
  id,
  match_type,
  status,
  total_bank_amount,
  total_payment_amount,
  difference_amount,
  confirmed_at,
  reversed_at
FROM reconciliation_matches
WHERE tenant_id = $1
  AND reconciliation_session_id = $2
ORDER BY confirmed_at DESC
LIMIT $3 OFFSET $4;
```

---

## 30.5. Listar excepciones abiertas críticas

```sql id="ao0jia"
SELECT id
FROM reconciliation_exceptions
WHERE tenant_id = $1
  AND reconciliation_session_id = $2
  AND status IN ('open', 'inReview')
  AND severity IN ('high', 'critical')
  AND archived_at IS NULL;
```

---

# 31. Soft delete, archivo y reversibilidad

## 31.1. Archivo lógico

No eliminar físicamente:

```text id="e4kj6y"
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

## 31.2. Reverso

La reversión de un match:

```text id="neyl1m"
- no elimina reconciliation_match;
- no elimina reconciliation_match_items;
- cambia status a reversed;
- registra reversedAt;
- registra reversedBy;
- requiere reverseReason;
- actualiza estados relacionados;
- audita reconciliationMatch.reversed.
```

---

## 31.3. Diferencia con archivo

Archivo lógico significa retirar de operación ordinaria.

Reverso significa anular efecto financiero-operativo del match conservando evidencia.

---

# 32. Reglas de metadata

## 32.1. Metadata permitida

```text id="b8nb5h"
safe parser hints
template name
safe import options
safe score details
safe matching details
traceId
correlationId
non-sensitive notes
safe bank name
safe currency
safe counts
safe status flags
```

---

## 32.2. Metadata prohibida

```text id="savglx"
accountNumber completo
storageKey
signedUrl
archivo bancario completo
fila bancaria completa
contenido completo de descripción bancaria
referencia bancaria sensible completa
identificación completa
email completo
teléfono completo
cédula
datos bancarios completos del pagador
tokens
cookies
Authorization header
secretos
SQL raw
stack trace
provider payload completo
datos reales enviados a IA
```

---

# 33. Auditoría desde modelo

## 33.1. Eventos mínimos

```text id="mu3mzh"
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

## 33.2. Metadata permitida

```text id="g6u26d"
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

## 33.3. Metadata prohibida

```text id="xyp37g"
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

# 34. Observabilidad desde modelo

## 34.1. Logs sugeridos

```text id="d1vtmt"
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

## 34.2. Métricas sugeridas

```text id="z8v2wv"
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

## 34.3. Labels permitidos

```text id="mw6lgi"
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

## 34.4. Labels prohibidos

```text id="v1m5ma"
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

# 35. Migración

Nombre sugerido:

```text id="s9li76"
017_create_bank_reconciliation
```

Pasos:

```text id="q0h1x6"
1. Crear enums del módulo.
2. Crear bank_accounts.
3. Crear bank_statement_imports.
4. Crear bank_statement_import_errors.
5. Crear bank_transactions.
6. Crear reconciliation_sessions.
7. Crear reconciliation_candidates.
8. Crear reconciliation_matches.
9. Crear reconciliation_match_items.
10. Crear reconciliation_exceptions.
11. Crear índices básicos.
12. Crear constraints básicos.
13. Crear índices parciales raw.
14. Agregar relaciones Prisma en Tenant.
15. Agregar relaciones Prisma en UserProfile.
16. Agregar relaciones Prisma en Payment.
17. Agregar relación con SecureDocument.
18. Agregar relación con SecureDocumentFile.
19. Extender SourceModule con bankReconciliation si se decide.
20. Generar Prisma Client.
21. Ejecutar migración en DB test.
22. Ejecutar seeds demo.
23. Validar tests de repositorio.
```

---

# 36. Migraciones raw recomendadas

## 36.1. Validar montos positivos

```sql id="ebzixf"
ALTER TABLE bank_transactions
ADD CONSTRAINT bank_transactions_amount_positive
CHECK (amount > 0);

ALTER TABLE reconciliation_match_items
ADD CONSTRAINT reconciliation_match_items_amount_positive
CHECK (amount_applied > 0);
```

---

## 36.2. Validar score

```sql id="spsl90"
ALTER TABLE reconciliation_candidates
ADD CONSTRAINT reconciliation_candidates_score_range
CHECK (score >= 0 AND score <= 100);
```

---

## 36.3. Validar periodo de importación

```sql id="ot11ev"
ALTER TABLE bank_statement_imports
ADD CONSTRAINT bank_statement_imports_period_valid
CHECK (period_start <= period_end);
```

---

## 36.4. Validar periodo de sesión

```sql id="cxc9qn"
ALTER TABLE reconciliation_sessions
ADD CONSTRAINT reconciliation_sessions_period_valid
CHECK (period_start <= period_end);
```

---

## 36.5. Validar diferencia con razón

```sql id="kq13oc"
ALTER TABLE reconciliation_matches
ADD CONSTRAINT reconciliation_matches_difference_reason_required
CHECK (
  difference_amount = 0
  OR difference_reason IS NOT NULL
);
```

---

## 36.6. Validar reverso con razón

```sql id="d6igiz"
ALTER TABLE reconciliation_matches
ADD CONSTRAINT reconciliation_matches_reversal_reason_required
CHECK (
  status <> 'reversed'
  OR (reverse_reason IS NOT NULL AND reversed_at IS NOT NULL)
);
```

---

## 36.7. Validar item por tipo

```sql id="haos3r"
ALTER TABLE reconciliation_match_items
ADD CONSTRAINT reconciliation_match_items_required_reference
CHECK (
  (item_type = 'bankTransaction' AND bank_transaction_id IS NOT NULL)
  OR
  (item_type = 'payment' AND payment_id IS NOT NULL)
);
```

---

## 36.8. Validar excepción resolvida

```sql id="mbh1v2"
ALTER TABLE reconciliation_exceptions
ADD CONSTRAINT reconciliation_exceptions_resolution_required
CHECK (
  status <> 'resolved'
  OR (resolution_notes IS NOT NULL AND resolved_at IS NOT NULL)
);
```

---

## 36.9. Validar excepción ignorada

```sql id="o5brnc"
ALTER TABLE reconciliation_exceptions
ADD CONSTRAINT reconciliation_exceptions_ignore_reason_required
CHECK (
  status <> 'ignored'
  OR (ignore_reason IS NOT NULL AND ignored_at IS NOT NULL)
);
```

---

# 37. Seeds

## 37.1. Bank accounts demo

```text id="nsacpr"
bankAccountMainA
bankAccountSecondaryA
bankAccountInactiveA
bankAccountArchivedA
bankAccountCashA
bankAccountTenantB
```

---

## 37.2. Imports demo

```text id="ef250r"
bankStatementImportCsvA
bankStatementImportXlsxA
bankStatementImportProcessedA
bankStatementImportWarningsA
bankStatementImportFailedA
bankStatementImportCancelledA
bankStatementImportTenantB
```

---

## 37.3. Transactions demo

```text id="r2v10l"
bankTransactionCreditA
bankTransactionDebitA
bankTransactionFeeA
bankTransactionInterestA
bankTransactionDuplicateA
bankTransactionMatchedA
bankTransactionPartiallyMatchedA
bankTransactionUnmatchedA
bankTransactionIgnoredA
bankTransactionExceptionA
bankTransactionTenantB
```

---

## 37.4. Sessions demo

```text id="je9dsb"
reconciliationSessionDraftA
reconciliationSessionOpenA
reconciliationSessionReviewingA
reconciliationSessionClosedA
reconciliationSessionReopenedA
reconciliationSessionArchivedA
reconciliationSessionTenantB
```

---

## 37.5. Candidates demo

```text id="o7z7iy"
reconciliationCandidateHighA
reconciliationCandidateMediumA
reconciliationCandidateLowA
reconciliationCandidateRejectedA
reconciliationCandidateExpiredA
reconciliationCandidateTenantB
```

---

## 37.6. Matches demo

```text id="kzae0g"
reconciliationMatchOneToOneA
reconciliationMatchOneToManyA
reconciliationMatchManyToOneA
reconciliationMatchManualA
reconciliationMatchReversedA
reconciliationMatchTenantB
```

---

## 37.7. Exceptions demo

```text id="tg2jta"
reconciliationExceptionUnknownDepositA
reconciliationExceptionAmountMismatchA
reconciliationExceptionPaymentWithoutBankTransactionA
reconciliationExceptionBankFeeA
reconciliationExceptionCriticalOpenA
reconciliationExceptionResolvedA
reconciliationExceptionIgnoredA
reconciliationExceptionTenantB
```

---

## 37.8. Datos prohibidos en seeds

```text id="jfralb"
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
datos sancionatorios reales
```

---

# 38. Testing del modelo

## 38.1. Unit tests

```text id="b3togd"
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
BankTransactionFingerprint service
ReconciliationScore value object
Money Decimal value object
```

---

## 38.2. Repository tests

```text id="v53rcb"
create bankAccount
find bankAccount by tenant
tenant A does not see bankAccount tenant B
create statementImport
prevent duplicate fileHash per account
create import errors
create bankTransaction
prevent duplicate fingerprint
mark transaction duplicate
create reconciliationSession
prevent active duplicated session same period
create candidate
prevent duplicated active candidate pair
create match
create match items
create exception
tenant A does not see tenant B records
```

---

## 38.3. Financial integrity tests

```text id="od3495"
Decimal exact amounts
no float arithmetic
match 1:1 total exact
match 1:N total exact
match N:1 total exact
differenceAmount calculated
differenceReason required when difference != 0
reversal keeps history
closed session blocks changes
```

---

## 38.4. Multitenancy tests

```text id="yom42v"
tenant A no ve bankAccount tenant B
tenant A no ve statementImport tenant B
tenant A no ve importErrors tenant B
tenant A no ve bankTransaction tenant B
tenant A no ve reconciliationSession tenant B
tenant A no ve reconciliationCandidate tenant B
tenant A no ve reconciliationMatch tenant B
tenant A no ve reconciliationMatchItem tenant B
tenant A no ve reconciliationException tenant B
tenant A no usa paymentId tenant B
tenant A no usa secureDocumentId tenant B
tenant A no usa secureDocumentFileId tenant B
```

---

## 38.5. Security tests

```text id="xw1xlv"
no tenantId body
no full accountNumber exposure
no accountNumberHash in standard DTO
no storageKey exposure
no bank file content in logs
no full bank row in audit
no public endpoints
no AI external with real data
```

---

# 39. Decisión final del modelo

El módulo `017-bank-reconciliation` usará las siguientes tablas:

```text id="kjvhxw"
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

El modelo garantiza:

```text id="hd66fh"
tenant isolation
bank account registry
account number protection
bank statement import tracking
secure imported file linkage
row-level import error tracking
bank transaction normalization
transaction fingerprinting
duplicate detection
session-based reconciliation
deterministic candidates
explainable scoring
manual confirmation
1:1 matching
1:N matching
N:1 matching
difference tracking
match reversibility
exception management
financial auditability
report readiness
Payments integration
Secure Document Storage integration
no public exposure
```

La implementación no debe aceptarse si:

```text id="fwdfql"
permite cuentas bancarias cross-tenant
permite importaciones cross-tenant
permite movimientos cross-tenant
permite sesiones cross-tenant
permite candidatos cross-tenant
permite matches cross-tenant
permite excepciones cross-tenant
permite conciliar paymentId de otro tenant
permite usar secureDocumentId de otro tenant
acepta tenantId desde body
busca entidades solo por id
expone número completo de cuenta
expone accountNumberHash por DTO estándar
expone storageKey
expone archivo bancario sin permiso
duplica movimientos al reimportar
omite fingerprint
usa float/double para dinero
permite candidate con side effect
permite match con diferencia sin razón
permite reverso sin razón
permite modificar sesión closed
registra archivo completo en logs
registra filas completas en auditoría
crea endpoints públicos
documenta endpoints públicos en OpenAPI
envía datos reales a IA externa
omite auditoría financiera crítica
```

---

# 40. Pendientes para evolución

Quedan diferidos:

```text id="nr5gyp"
Open Banking
API bancaria directa
scraping bancario
OCR de estados bancarios PDF
plantillas específicas por banco ecuatoriano
multi-moneda avanzada
tolerancias configurables por tenant
reglas automáticas de matching
confirmación automática con aprobación
IA interna o externa para matching
contabilidad completa
asientos contables
plan de cuentas
tesorería avanzada
pasarelas de pago
conciliación de tarjetas de crédito
pagos a proveedores
caja chica avanzada
retención documental avanzada
legal hold
exportaciones oficiales contables
integración SRI
```

Estos diferidos no bloquean el MVP de `017-bank-reconciliation`.
