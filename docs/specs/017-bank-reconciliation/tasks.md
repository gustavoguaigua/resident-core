# Tasks — Spec 017 Bank Reconciliation

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                            |
| Spec ID         | 017                                                                                                                                                                                      |
| Módulo          | Bank Reconciliation                                                                                                                                                                      |
| Documento       | Tasks                                                                                                                                                                                    |
| Ruta            | `docs/specs/017-bank-reconciliation/tasks.md`                                                                                                                                            |
| Versión         | 0.1                                                                                                                                                                                      |
| Estado          | needs-review                                                                                                                                                                             |
| Fecha           | 2026-07-21                                                                                                                                                                               |
| Documento base  | `docs/specs/017-bank-reconciliation/spec.md`                                                                                                                                             |
| Plan técnico    | `docs/specs/017-bank-reconciliation/plan.md`                                                                                                                                             |
| Modelo de datos | `docs/specs/017-bank-reconciliation/data-model.md`                                                                                                                                       |
| Contrato API    | `docs/specs/017-bank-reconciliation/api-contract.md`                                                                                                                                     |
| Plan de pruebas | `docs/specs/017-bank-reconciliation/test-plan.md`                                                                                                                                        |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage` |
| Naturaleza      | Tenant-scoped / Financial-control / Import-driven / Match-aware / Exception-aware / Audit-heavy / Non-public                                                                             |

---

## 2. Propósito

Este documento descompone la implementación del módulo `017-bank-reconciliation` en tareas técnicas verificables.

El objetivo es que cada tarea pueda ser usada como checklist de implementación, validación, revisión de código, pruebas y control de avance bajo Spec Driven Development.

Regla central:

```text id="qmdesn"
Cada tarea de Bank Reconciliation debe preservar tenant isolation, control financiero, idempotencia de importación, protección de datos bancarios, uso de Decimal, detección de duplicados, matching reversible, auditoría completa, ausencia de endpoints públicos y no exposición de storageKey ni números completos de cuenta.
```

---

## 3. Convenciones

### 3.1. Estados de tarea

```text id="xldxsc"
[ ] Pendiente
[x] Completada
[~] En progreso
[!] Bloqueada
```

---

### 3.2. Criterio de completitud por tarea

Una tarea solo puede marcarse como completada si:

```text id="bka8id"
- el código fue implementado;
- los tests mínimos pasan;
- no rompe contratos previos;
- respeta tenant isolation;
- no expone datos bancarios sensibles;
- no introduce endpoints públicos;
- no usa float/double para dinero;
- no omite auditoría crítica;
- no contradice spec.md, plan.md, data-model.md, api-contract.md ni test-plan.md.
```

---

### 3.3. Regla para uso de IA

La IA puede ayudar a generar código, pruebas y documentación, pero no debe recibir:

```text id="hi0zcs"
- archivos bancarios reales;
- movimientos bancarios reales;
- números reales de cuenta;
- comprobantes reales;
- referencias bancarias reales;
- datos personales reales;
- tokens;
- cookies;
- secretos;
- dumps productivos.
```

---

## 4. Fase 0 — Preparación documental

### 4.1. Revisión de especificaciones

```text id="xyfeg4"
[ ] Revisar docs/specs/017-bank-reconciliation/spec.md.
[ ] Revisar docs/specs/017-bank-reconciliation/plan.md.
[ ] Revisar docs/specs/017-bank-reconciliation/data-model.md.
[ ] Revisar docs/specs/017-bank-reconciliation/api-contract.md.
[ ] Revisar docs/specs/017-bank-reconciliation/test-plan.md.
[ ] Validar consistencia de enums entre documentos.
[ ] Validar consistencia de endpoints entre documentos.
[ ] Validar consistencia de permisos entre documentos.
[ ] Validar consistencia de eventos de auditoría entre documentos.
[ ] Registrar dudas o cambios en un archivo de cambios si aplica.
```

---

### 4.2. Revisión de dependencias

```text id="vuxqw5"
[ ] Confirmar que 001-tenants define tenant activo.
[ ] Confirmar que 002-users-roles define permisos/membership.
[ ] Confirmar que 005-payments permite consultar pagos conciliables.
[ ] Confirmar estrategia para Payment.reconciliationStatus.
[ ] Confirmar que 006-account-statements no se reconstruirá desde movimientos bancarios.
[ ] Confirmar que 007-audit soporta eventos financieros nuevos.
[ ] Confirmar que 008-basic-reports puede consumir datos de conciliación.
[ ] Confirmar que 016-secure-document-storage puede almacenar archivos bancarios.
[ ] Confirmar extensión SourceModule=bankReconciliation en Secure Document Storage.
```

---

## 5. Fase 1 — Estructura base del módulo

### 5.1. Crear estructura de carpetas

```text id="ua527q"
[ ] Crear apps/api/src/modules/bank-reconciliation/.
[ ] Crear bank-reconciliation.module.ts.
[ ] Crear carpeta controllers/.
[ ] Crear carpeta application/.
[ ] Crear carpeta application/use-cases/.
[ ] Crear carpeta application/services/.
[ ] Crear carpeta application/ports/.
[ ] Crear carpeta domain/.
[ ] Crear carpeta domain/entities/.
[ ] Crear carpeta domain/value-objects/.
[ ] Crear carpeta domain/events/.
[ ] Crear carpeta domain/errors/.
[ ] Crear carpeta infrastructure/.
[ ] Crear carpeta infrastructure/persistence/.
[ ] Crear carpeta infrastructure/parsers/.
[ ] Crear carpeta infrastructure/matching/.
[ ] Crear carpeta infrastructure/integrations/.
[ ] Crear carpeta infrastructure/audit/.
[ ] Crear carpeta infrastructure/reports/.
[ ] Crear carpeta dto/.
[ ] Crear carpeta guards/.
[ ] Crear carpeta policies/.
[ ] Crear carpeta mappers/.
[ ] Crear carpeta tests/.
```

---

### 5.2. Registrar módulo

```text id="wv08zd"
[ ] Registrar BankReconciliationModule en el módulo principal.
[ ] Registrar providers base.
[ ] Registrar exports necesarios para integración con Reports.
[ ] Verificar que el módulo no expone rutas públicas.
[ ] Verificar que el módulo compila vacío.
```

---

## 6. Fase 2 — Enums y constantes

### 6.1. Enums de cuentas bancarias

```text id="x63pyx"
[ ] Implementar BankAccountStatus.
[ ] Implementar BankAccountType.
[ ] Implementar Currency con USD para MVP.
[ ] Agregar tests de enums.
```

---

### 6.2. Enums de importación

```text id="aasmkh"
[ ] Implementar BankStatementImportType.
[ ] Implementar BankStatementImportStatus.
[ ] Implementar BankStatementImportErrorSeverity.
[ ] Bloquear apiFuture como uso externo en MVP.
[ ] Bloquear manual si feature flag está desactivado.
```

---

### 6.3. Enums de movimientos

```text id="rk53dd"
[ ] Implementar BankTransactionType.
[ ] Implementar BankTransactionDirection.
[ ] Implementar BankTransactionStatus.
```

---

### 6.4. Enums de conciliación

```text id="w8kfez"
[ ] Implementar ReconciliationSessionStatus.
[ ] Implementar ReconciliationCandidateStatus.
[ ] Implementar ReconciliationScoreBand.
[ ] Implementar ReconciliationMatchType.
[ ] Implementar ReconciliationMatchStatus.
[ ] Implementar ReconciliationMatchItemType.
[ ] Implementar ReconciliationExceptionType.
[ ] Implementar ReconciliationExceptionStatus.
[ ] Implementar ReconciliationExceptionSeverity.
[ ] Implementar ReconciliationHashAlgorithm.
```

---

### 6.5. Constantes MVP

```text id="j2rzut"
[ ] Definir DEFAULT_CURRENCY=USD.
[ ] Definir AMOUNT_TOLERANCE=0.00.
[ ] Definir DATE_TOLERANCE_DAYS=3.
[ ] Definir CANDIDATE_MIN_SCORE=50.
[ ] Definir HIGH_SCORE_THRESHOLD=90.
[ ] Definir MEDIUM_SCORE_THRESHOLD=70.
[ ] Definir MAX_IMPORT_FILE_SIZE_MB=20.
[ ] Definir MAX_IMPORT_ROWS=5000.
[ ] Definir REQUIRE_MANUAL_CONFIRMATION=true.
```

---

## 7. Fase 3 — Value Objects

### 7.1. `BankAccountNumber`

```text id="kgqpaj"
[ ] Crear BankAccountNumber value object.
[ ] Normalizar espacios.
[ ] Normalizar guiones.
[ ] Validar longitud mínima.
[ ] Validar caracteres permitidos.
[ ] Generar accountNumberMasked.
[ ] Generar accountNumberHash.
[ ] Usar tenant-scoped pepper o estrategia equivalente.
[ ] Impedir serialización de número completo.
[ ] Impedir persistencia en metadata.
[ ] Crear tests unitarios.
```

---

### 7.2. `MoneyDecimal`

```text id="rt9f2z"
[ ] Crear MoneyDecimal value object.
[ ] Aceptar valores como string decimal.
[ ] Rechazar number.
[ ] Rechazar float.
[ ] Rechazar NaN.
[ ] Rechazar negativos.
[ ] Soportar suma exacta.
[ ] Soportar resta exacta.
[ ] Soportar comparación exacta.
[ ] Soportar differenceAmount.
[ ] Verificar que no usa JavaScript number para cálculos financieros.
[ ] Crear tests unitarios.
```

---

### 7.3. `ReconciliationPeriod`

```text id="m76nlh"
[ ] Crear ReconciliationPeriod.
[ ] Validar periodStart obligatorio.
[ ] Validar periodEnd obligatorio.
[ ] Validar periodStart <= periodEnd.
[ ] Normalizar fechas.
[ ] Crear tests unitarios.
```

---

### 7.4. `BankTransactionFingerprint`

```text id="przcm4"
[ ] Crear canonical input.
[ ] Normalizar tenantId.
[ ] Normalizar bankAccountId.
[ ] Normalizar transactionDate.
[ ] Normalizar postedDate.
[ ] Normalizar direction.
[ ] Normalizar amount.
[ ] Normalizar currency.
[ ] Normalizar reference.
[ ] Normalizar bankReference.
[ ] Normalizar description.
[ ] Ordenar claves.
[ ] Calcular SHA-256.
[ ] Impedir fingerprint externo.
[ ] Crear tests unitarios.
```

---

### 7.5. `ReconciliationScore`

```text id="xys2cy"
[ ] Crear ReconciliationScore.
[ ] Validar rango 0-100.
[ ] Calcular scoreBand.
[ ] Validar scoreReason.
[ ] Sanitizar scoreReason.
[ ] Crear tests unitarios.
```

---

## 8. Fase 4 — Entidades de dominio

### 8.1. `BankAccount`

```text id="lr5hqh"
[ ] Implementar entidad BankAccount.
[ ] Crear factory createDraft.
[ ] Implementar activate.
[ ] Implementar deactivate.
[ ] Implementar archive.
[ ] Validar transiciones permitidas.
[ ] Bloquear archived -> active.
[ ] No exponer accountNumberHash por serialización estándar.
[ ] Crear tests de dominio.
```

---

### 8.2. `BankStatementImport`

```text id="m4nzyq"
[ ] Implementar entidad BankStatementImport.
[ ] Crear factory createUploaded.
[ ] Implementar startValidation.
[ ] Implementar markValidated.
[ ] Implementar markProcessing.
[ ] Implementar markProcessed.
[ ] Implementar markProcessedWithWarnings.
[ ] Implementar markFailed.
[ ] Implementar cancel.
[ ] Implementar archive.
[ ] Validar conteos no negativos.
[ ] Validar periodStart <= periodEnd.
[ ] Crear tests de dominio.
```

---

### 8.3. `BankStatementImportError`

```text id="t2vku1"
[ ] Implementar entidad BankStatementImportError.
[ ] Validar rowNumber > 0.
[ ] Validar errorCode.
[ ] Validar errorMessage.
[ ] Validar severity.
[ ] Sanitizar rawRowPreview.
[ ] Sanitizar normalizedPreview.
[ ] Crear tests de dominio.
```

---

### 8.4. `BankTransaction`

```text id="gt6mm3"
[ ] Implementar entidad BankTransaction.
[ ] Crear factory createPending.
[ ] Implementar markCandidateFound.
[ ] Implementar markMatched.
[ ] Implementar markPartiallyMatched.
[ ] Implementar markUnmatched.
[ ] Implementar markDuplicate.
[ ] Implementar ignore.
[ ] Implementar markException.
[ ] Implementar archive.
[ ] Validar amount > 0.
[ ] Validar currency USD.
[ ] Validar fingerprint requerido.
[ ] Crear tests de dominio.
```

---

### 8.5. `ReconciliationSession`

```text id="o6v3xy"
[ ] Implementar entidad ReconciliationSession.
[ ] Crear factory createDraft.
[ ] Implementar open.
[ ] Implementar markReviewing.
[ ] Implementar close.
[ ] Implementar reopen.
[ ] Implementar archive.
[ ] Bloquear cambios ordinarios si closed.
[ ] Validar closeReason.
[ ] Validar reopenReason.
[ ] Crear tests de dominio.
```

---

### 8.6. `ReconciliationCandidate`

```text id="tsolqm"
[ ] Implementar entidad ReconciliationCandidate.
[ ] Crear factory suggested.
[ ] Implementar accept.
[ ] Implementar reject.
[ ] Implementar expire.
[ ] Implementar supersede.
[ ] Implementar archive.
[ ] Validar score.
[ ] Validar scoreReason.
[ ] Validar rejectReason.
[ ] Crear tests de dominio.
```

---

### 8.7. `ReconciliationMatch`

```text id="tqf22x"
[ ] Implementar entidad ReconciliationMatch.
[ ] Crear factory confirmed.
[ ] Implementar reverse.
[ ] Implementar archive.
[ ] Calcular totalBankAmount.
[ ] Calcular totalPaymentAmount.
[ ] Calcular differenceAmount.
[ ] Exigir differenceReason si differenceAmount != 0.00.
[ ] Exigir reverseReason para reverso.
[ ] Bloquear reversed -> confirmed.
[ ] Crear tests de dominio.
```

---

### 8.8. `ReconciliationMatchItem`

```text id="nutpot"
[ ] Implementar entidad ReconciliationMatchItem.
[ ] Soportar itemType bankTransaction.
[ ] Soportar itemType payment.
[ ] Validar bankTransactionId requerido para itemType bankTransaction.
[ ] Validar paymentId requerido para itemType payment.
[ ] Validar amountApplied > 0.
[ ] Crear tests de dominio.
```

---

### 8.9. `ReconciliationException`

```text id="gk2m3o"
[ ] Implementar entidad ReconciliationException.
[ ] Crear factory open.
[ ] Implementar markInReview.
[ ] Implementar resolve.
[ ] Implementar ignore.
[ ] Implementar archive.
[ ] Exigir resolutionNotes al resolver.
[ ] Exigir ignoreReason al ignorar.
[ ] Validar severity.
[ ] Validar exceptionType.
[ ] Crear tests de dominio.
```

---

## 9. Fase 5 — Errores de dominio

```text id="o1fj7m"
[ ] Crear BANK_ACCOUNT_NOT_FOUND.
[ ] Crear BANK_ACCOUNT_INVALID_STATUS.
[ ] Crear BANK_ACCOUNT_INACTIVE.
[ ] Crear BANK_ACCOUNT_ARCHIVED.
[ ] Crear BANK_ACCOUNT_NUMBER_INVALID.
[ ] Crear BANK_STATEMENT_IMPORT_INVALID_STATUS.
[ ] Crear BANK_STATEMENT_IMPORT_FILE_INVALID.
[ ] Crear BANK_STATEMENT_IMPORT_DUPLICATE_FILE.
[ ] Crear BANK_TRANSACTION_DUPLICATE.
[ ] Crear BANK_TRANSACTION_NOT_RECONCILABLE.
[ ] Crear BANK_TRANSACTION_ALREADY_MATCHED.
[ ] Crear RECONCILIATION_SESSION_INVALID_STATUS.
[ ] Crear RECONCILIATION_SESSION_ALREADY_EXISTS.
[ ] Crear RECONCILIATION_SESSION_CLOSED.
[ ] Crear RECONCILIATION_SESSION_CLOSE_BLOCKED_BY_EXCEPTIONS.
[ ] Crear RECONCILIATION_MATCH_AMOUNT_MISMATCH.
[ ] Crear RECONCILIATION_MATCH_DIFFERENCE_REASON_REQUIRED.
[ ] Crear RECONCILIATION_MATCH_REVERSE_REASON_REQUIRED.
[ ] Crear RECONCILIATION_EXCEPTION_RESOLUTION_REQUIRED.
[ ] Crear RECONCILIATION_EXCEPTION_IGNORE_REASON_REQUIRED.
[ ] Mapear errores a códigos API estándar.
```

---

## 10. Fase 6 — Prisma schema y migración

### 10.1. Enums Prisma

```text id="razr1u"
[ ] Agregar BankAccountStatus.
[ ] Agregar BankAccountType.
[ ] Agregar Currency si no existe.
[ ] Agregar BankStatementImportType.
[ ] Agregar BankStatementImportStatus.
[ ] Agregar BankStatementImportErrorSeverity.
[ ] Agregar BankTransactionType.
[ ] Agregar BankTransactionDirection.
[ ] Agregar BankTransactionStatus.
[ ] Agregar ReconciliationSessionStatus.
[ ] Agregar ReconciliationCandidateStatus.
[ ] Agregar ReconciliationScoreBand.
[ ] Agregar ReconciliationMatchType.
[ ] Agregar ReconciliationMatchStatus.
[ ] Agregar ReconciliationMatchItemType.
[ ] Agregar ReconciliationExceptionType.
[ ] Agregar ReconciliationExceptionStatus.
[ ] Agregar ReconciliationExceptionSeverity.
[ ] Agregar ReconciliationHashAlgorithm.
```

---

### 10.2. Modelos Prisma

```text id="c20dug"
[ ] Crear modelo BankAccount.
[ ] Crear modelo BankStatementImport.
[ ] Crear modelo BankStatementImportError.
[ ] Crear modelo BankTransaction.
[ ] Crear modelo ReconciliationSession.
[ ] Crear modelo ReconciliationCandidate.
[ ] Crear modelo ReconciliationMatch.
[ ] Crear modelo ReconciliationMatchItem.
[ ] Crear modelo ReconciliationException.
```

---

### 10.3. Relaciones con modelos existentes

```text id="m3g654"
[ ] Agregar relaciones en Tenant.
[ ] Agregar relaciones en UserProfile.
[ ] Agregar relaciones en Payment.
[ ] Agregar PaymentReconciliationStatus si se modifica Payment.
[ ] Agregar campos reconciliationStatus en Payment si se decide.
[ ] Agregar campos reconciledAt, reconciledBy, reconciliationMatchId si se decide.
[ ] Agregar relación con SecureDocument.
[ ] Agregar relación con SecureDocumentFile.
[ ] Agregar SourceModule=bankReconciliation en Secure Document Storage.
```

---

### 10.4. Índices

```text id="rbfi8e"
[ ] Crear índices tenant_id en todas las tablas.
[ ] Crear índices tenant_id + status.
[ ] Crear índices tenant_id + bank_account_id.
[ ] Crear índices tenant_id + statement_import_id.
[ ] Crear índices tenant_id + transaction_date.
[ ] Crear índices tenant_id + fingerprint.
[ ] Crear índices tenant_id + reconciliation_session_id.
[ ] Crear índices tenant_id + payment_id.
[ ] Crear índices tenant_id + bank_transaction_id.
[ ] Crear índices tenant_id + exception_type.
[ ] Crear índices tenant_id + severity.
[ ] Crear índices tenant_id + created_at.
[ ] Crear índices tenant_id + archived_at.
```

---

### 10.5. Índices parciales raw

```text id="wfupdc"
[ ] Crear índice único de una cuenta default activa por tenant.
[ ] Crear índice único de fileHash por cuenta.
[ ] Crear índice único de fingerprint por cuenta.
[ ] Crear índice único de sesión activa por cuenta/periodo.
[ ] Crear índice único de candidato activo por movimiento/pago.
[ ] Crear índice único de idempotencyKey por tenant.
```

---

### 10.6. Constraints raw

```text id="lyl3wa"
[ ] Constraint amount > 0 en bank_transactions.
[ ] Constraint amount_applied > 0 en reconciliation_match_items.
[ ] Constraint score 0-100 en reconciliation_candidates.
[ ] Constraint period_start <= period_end en bank_statement_imports.
[ ] Constraint period_start <= period_end en reconciliation_sessions.
[ ] Constraint differenceReason si differenceAmount != 0.
[ ] Constraint reverseReason si status reversed.
[ ] Constraint item reference requerido según itemType.
[ ] Constraint resolutionNotes si status resolved.
[ ] Constraint ignoreReason si status ignored.
```

---

### 10.7. Migración

```text id="e8rw7y"
[ ] Crear migración 017_create_bank_reconciliation.
[ ] Ejecutar migración en entorno local.
[ ] Ejecutar migración en entorno test.
[ ] Ejecutar prisma generate.
[ ] Verificar Prisma Client.
[ ] Validar rollback si el flujo del proyecto lo contempla.
```

---

## 11. Fase 7 — Puertos de aplicación

### 11.1. Repositories ports

```text id="qucolg"
[ ] Crear BankAccountRepositoryPort.
[ ] Crear BankStatementImportRepositoryPort.
[ ] Crear BankStatementImportErrorRepositoryPort.
[ ] Crear BankTransactionRepositoryPort.
[ ] Crear ReconciliationSessionRepositoryPort.
[ ] Crear ReconciliationCandidateRepositoryPort.
[ ] Crear ReconciliationMatchRepositoryPort.
[ ] Crear ReconciliationMatchItemRepositoryPort.
[ ] Crear ReconciliationExceptionRepositoryPort.
```

---

### 11.2. Functional ports

```text id="k8ytfq"
[ ] Crear BankStatementParserPort.
[ ] Crear BankStatementTemplatePort.
[ ] Crear BankTransactionFingerprintPort.
[ ] Crear ReconciliationScoringPort.
[ ] Crear PaymentReconciliationPort.
[ ] Crear SecureDocumentStoragePort adapter específico.
[ ] Crear AuditPort.
[ ] Crear ClockPort.
[ ] Crear IdempotencyPort.
[ ] Crear ReportExportPort.
[ ] Crear ObservabilityPort.
```

---

## 12. Fase 8 — Repositorios Prisma

### 12.1. Bank accounts

```text id="edj356"
[ ] Implementar PrismaBankAccountRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar listByTenant.
[ ] Implementar update.
[ ] Implementar activate.
[ ] Implementar deactivate.
[ ] Implementar archive.
[ ] Prohibir findUnique por id simple.
[ ] Crear repository tests.
```

---

### 12.2. Imports

```text id="g5w92p"
[ ] Implementar PrismaBankStatementImportRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar listByTenant.
[ ] Implementar updateStatus.
[ ] Implementar updateCounts.
[ ] Implementar cancel.
[ ] Implementar archive.
[ ] Implementar findByFileHash.
[ ] Crear repository tests.
```

---

### 12.3. Import errors

```text id="n9jvtf"
[ ] Implementar PrismaBankStatementImportErrorRepository.
[ ] Implementar create.
[ ] Implementar bulkCreate.
[ ] Implementar listByImport.
[ ] Implementar filters by severity.
[ ] Implementar filters by errorCode.
[ ] Crear repository tests.
```

---

### 12.4. Bank transactions

```text id="gegz60"
[ ] Implementar PrismaBankTransactionRepository.
[ ] Implementar create.
[ ] Implementar bulkCreate.
[ ] Implementar findByIdAndTenant.
[ ] Implementar findByFingerprint.
[ ] Implementar listByTenant.
[ ] Implementar listPending.
[ ] Implementar markDuplicate.
[ ] Implementar markMatched.
[ ] Implementar markPartiallyMatched.
[ ] Implementar markUnmatched.
[ ] Implementar ignore.
[ ] Implementar archive.
[ ] Crear repository tests.
```

---

### 12.5. Sessions

```text id="fglgr3"
[ ] Implementar PrismaReconciliationSessionRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar listByTenant.
[ ] Implementar findActiveByAccountAndPeriod.
[ ] Implementar open.
[ ] Implementar close.
[ ] Implementar reopen.
[ ] Implementar archive.
[ ] Implementar summary.
[ ] Crear repository tests.
```

---

### 12.6. Candidates

```text id="qf2a22"
[ ] Implementar PrismaReconciliationCandidateRepository.
[ ] Implementar create.
[ ] Implementar bulkCreate.
[ ] Implementar findByIdAndTenant.
[ ] Implementar listBySession.
[ ] Implementar findActivePair.
[ ] Implementar accept.
[ ] Implementar reject.
[ ] Implementar expire.
[ ] Implementar supersede.
[ ] Crear repository tests.
```

---

### 12.7. Matches

```text id="k193yd"
[ ] Implementar PrismaReconciliationMatchRepository.
[ ] Implementar createWithItems en transacción.
[ ] Implementar findByIdAndTenant.
[ ] Implementar getWithItems.
[ ] Implementar listBySession.
[ ] Implementar reverse.
[ ] Implementar archive.
[ ] Implementar findByIdempotencyKey.
[ ] Crear repository tests.
```

---

### 12.8. Exceptions

```text id="shar0t"
[ ] Implementar PrismaReconciliationExceptionRepository.
[ ] Implementar create.
[ ] Implementar findByIdAndTenant.
[ ] Implementar listBySession.
[ ] Implementar update.
[ ] Implementar resolve.
[ ] Implementar ignore.
[ ] Implementar archive.
[ ] Implementar listOpenHighCritical.
[ ] Crear repository tests.
```

---

## 13. Fase 9 — DTOs y validadores

### 13.1. DTOs de cuentas bancarias

```text id="z5eg2h"
[ ] Crear CreateBankAccountDto.
[ ] Crear UpdateBankAccountDto.
[ ] Crear ActivateBankAccountDto.
[ ] Crear DeactivateBankAccountDto.
[ ] Crear ArchiveBankAccountDto.
[ ] Crear BankAccountDto.
[ ] Crear BankAccountListItemDto.
[ ] Crear BankAccountFilterDto.
[ ] Rechazar tenantId.
[ ] Rechazar accountNumberHash.
[ ] Rechazar status directo.
[ ] Crear DTO tests.
```

---

### 13.2. DTOs de importaciones

```text id="kdy2q4"
[ ] Crear CreateBankStatementImportDto.
[ ] Crear ValidateBankStatementImportDto.
[ ] Crear ProcessBankStatementImportDto.
[ ] Crear CancelBankStatementImportDto.
[ ] Crear ArchiveBankStatementImportDto.
[ ] Crear BankStatementImportDto.
[ ] Crear BankStatementImportListItemDto.
[ ] Crear BankStatementImportErrorDto.
[ ] Crear BankStatementImportFilterDto.
[ ] Rechazar fileHash externo.
[ ] Rechazar secureDocumentId manual.
[ ] Rechazar secureDocumentFileId manual.
[ ] Rechazar storageKey.
[ ] Crear DTO tests.
```

---

### 13.3. DTOs de movimientos

```text id="m4s5eg"
[ ] Crear BankTransactionDto.
[ ] Crear BankTransactionListItemDto.
[ ] Crear BankTransactionFilterDto.
[ ] Crear UpdateBankTransactionClassificationDto.
[ ] Crear IgnoreBankTransactionDto.
[ ] Crear ArchiveBankTransactionDto.
[ ] No exponer fingerprint.
[ ] Usar referencePreview.
[ ] Usar bankReferencePreview.
[ ] Crear DTO tests.
```

---

### 13.4. DTOs de sesiones

```text id="sps066"
[ ] Crear CreateReconciliationSessionDto.
[ ] Crear UpdateReconciliationSessionDto.
[ ] Crear OpenReconciliationSessionDto.
[ ] Crear CloseReconciliationSessionDto.
[ ] Crear ReopenReconciliationSessionDto.
[ ] Crear ArchiveReconciliationSessionDto.
[ ] Crear ReconciliationSessionDto.
[ ] Crear ReconciliationSessionListItemDto.
[ ] Crear ReconciliationSessionSummaryDto.
[ ] Crear ReconciliationSessionFilterDto.
[ ] Crear DTO tests.
```

---

### 13.5. DTOs de candidatos

```text id="vkuygr"
[ ] Crear GenerateReconciliationCandidatesDto.
[ ] Crear ReconciliationCandidateDto.
[ ] Crear ReconciliationCandidateListItemDto.
[ ] Crear AcceptReconciliationCandidateDto.
[ ] Crear RejectReconciliationCandidateDto.
[ ] Crear ReconciliationCandidateFilterDto.
[ ] Crear DTO tests.
```

---

### 13.6. DTOs de matches

```text id="c37w5o"
[ ] Crear CreateReconciliationMatchDto.
[ ] Crear ConfirmReconciliationMatchDto.
[ ] Crear ReverseReconciliationMatchDto.
[ ] Crear ArchiveReconciliationMatchDto.
[ ] Crear ReconciliationMatchDto.
[ ] Crear ReconciliationMatchListItemDto.
[ ] Crear ReconciliationMatchItemDto.
[ ] Rechazar totalBankAmount como fuente de verdad externa.
[ ] Rechazar totalPaymentAmount como fuente de verdad externa.
[ ] Crear DTO tests.
```

---

### 13.7. DTOs de excepciones

```text id="ns1acd"
[ ] Crear CreateReconciliationExceptionDto.
[ ] Crear UpdateReconciliationExceptionDto.
[ ] Crear ResolveReconciliationExceptionDto.
[ ] Crear IgnoreReconciliationExceptionDto.
[ ] Crear ArchiveReconciliationExceptionDto.
[ ] Crear ReconciliationExceptionDto.
[ ] Crear ReconciliationExceptionListItemDto.
[ ] Crear ReconciliationExceptionFilterDto.
[ ] Crear DTO tests.
```

---

### 13.8. DTOs de reportes

```text id="ktrrg0"
[ ] Crear ReconciliationSummaryReportDto.
[ ] Crear UnmatchedBankTransactionsReportDto.
[ ] Crear UnmatchedPaymentsReportDto.
[ ] Crear ReconciliationExceptionsReportDto.
[ ] Crear BankAccountBalancesReportDto.
[ ] Crear ReconciliationReportExportDto.
[ ] Crear DTO tests.
```

---

## 14. Fase 10 — Mappers

```text id="l91gm9"
[ ] Crear BankAccountMapper.
[ ] Crear BankStatementImportMapper.
[ ] Crear BankStatementImportErrorMapper.
[ ] Crear BankTransactionMapper.
[ ] Crear ReconciliationSessionMapper.
[ ] Crear ReconciliationCandidateMapper.
[ ] Crear ReconciliationMatchMapper.
[ ] Crear ReconciliationMatchItemMapper.
[ ] Crear ReconciliationExceptionMapper.
[ ] Asegurar que BankAccountMapper no expone accountNumberHash.
[ ] Asegurar que ImportMapper expone hashPrefix, no fileHash completo.
[ ] Asegurar que BankTransactionMapper no expone fingerprint.
[ ] Asegurar que ningún mapper expone storageKey.
[ ] Crear mapper tests.
```

---

## 15. Fase 11 — Seguridad, guards y policies

### 15.1. Guards

```text id="fqffmb"
[ ] Implementar BankReconciliationPermissionGuard.
[ ] Implementar BankAccountTenantGuard.
[ ] Implementar BankStatementImportTenantGuard.
[ ] Implementar BankTransactionTenantGuard.
[ ] Implementar ReconciliationSessionTenantGuard.
[ ] Implementar ReconciliationCandidateTenantGuard.
[ ] Implementar ReconciliationMatchTenantGuard.
[ ] Implementar ReconciliationExceptionTenantGuard.
[ ] Implementar PaymentReconciliationGuard.
[ ] Implementar ReconciliationStateGuard.
[ ] Implementar ReconciliationReportGuard.
```

---

### 15.2. Policies

```text id="m9vpmg"
[ ] Implementar BankAccountTenantPolicy.
[ ] Implementar BankAccountStatePolicy.
[ ] Implementar BankAccountNumberProtectionPolicy.
[ ] Implementar BankStatementImportPolicy.
[ ] Implementar BankStatementFileValidationPolicy.
[ ] Implementar BankTransactionTenantPolicy.
[ ] Implementar BankTransactionDuplicatePolicy.
[ ] Implementar BankTransactionStatePolicy.
[ ] Implementar PaymentReconciliationPolicy.
[ ] Implementar ReconciliationCandidatePolicy.
[ ] Implementar ReconciliationMatchPolicy.
[ ] Implementar ReconciliationMatchAmountPolicy.
[ ] Implementar ReconciliationMatchReversalPolicy.
[ ] Implementar ReconciliationSessionStatePolicy.
[ ] Implementar ReconciliationSessionClosePolicy.
[ ] Implementar ReconciliationExceptionPolicy.
[ ] Implementar ReconciliationAuditPolicy.
[ ] Implementar ReconciliationNoPublicExposurePolicy.
[ ] Implementar ReconciliationNoAutoConfirmationPolicy.
[ ] Implementar ReconciliationNoExternalAiPolicy.
```

---

### 15.3. Tests de seguridad

```text id="zv9071"
[ ] Crear tests no tenantId body.
[ ] Crear tests no accountNumber completo en response.
[ ] Crear tests no accountNumberHash en DTO estándar.
[ ] Crear tests no storageKey.
[ ] Crear tests no fingerprint expuesto.
[ ] Crear tests no full fileHash.
[ ] Crear tests no public endpoints.
[ ] Crear tests no candidate side effect.
[ ] Crear tests no automatic confirmation.
[ ] Crear tests no external AI con datos reales.
```

---

## 16. Fase 12 — Integración con Secure Document Storage

### 16.1. Extensión de SourceModule

```text id="mobkkq"
[ ] Agregar bankReconciliation a SourceModule de Secure Document Storage.
[ ] Actualizar validadores internos de SourceModule.
[ ] Actualizar OpenAPI si aplica.
[ ] Ejecutar regresión de Secure Document Storage.
```

---

### 16.2. Adapter documental

```text id="i3w6yq"
[ ] Crear BankReconciliationSecureDocumentAdapter.
[ ] Implementar registro de documento de importación.
[ ] Implementar registro de archivo importado.
[ ] Usar category=administrativeDocument.
[ ] Usar sourceModule=bankReconciliation.
[ ] Usar sourceResourceType=bankStatementImport.
[ ] Usar sensitivity=restricted.
[ ] Usar visibility=administrative.
[ ] Usar ownerType=tenant.
[ ] No exponer storageKey.
[ ] Crear integration tests.
```

---

### 16.3. Flujo de upload

```text id="i2nxiu"
[ ] Validar archivo CSV.
[ ] Validar archivo XLSX.
[ ] Rechazar MIME no permitido.
[ ] Rechazar archivo vacío.
[ ] Rechazar archivo mayor al límite.
[ ] Calcular hash.
[ ] Registrar secureDocumentId.
[ ] Registrar secureDocumentFileId.
[ ] Auditar upload documental.
```

---

## 17. Fase 13 — Parsers CSV/XLSX

### 17.1. Parser CSV

```text id="ywhpan"
[ ] Crear GenericCsvBankStatementParser.
[ ] Validar columnas mínimas.
[ ] Parsear transactionDate.
[ ] Parsear postedDate opcional.
[ ] Parsear description.
[ ] Parsear reference.
[ ] Parsear bankReference.
[ ] Parsear direction.
[ ] Parsear amount como string decimal.
[ ] Parsear currency.
[ ] Parsear balanceAfter opcional.
[ ] Registrar rowNumber.
[ ] Crear parser tests.
```

---

### 17.2. Parser XLSX

```text id="mm5i0p"
[ ] Crear GenericXlsxBankStatementParser.
[ ] Validar libro no vacío.
[ ] Validar hoja esperada.
[ ] Validar columnas mínimas.
[ ] Parsear fechas tipo celda.
[ ] Parsear fechas tipo string.
[ ] Parsear montos.
[ ] Parsear currency.
[ ] Registrar rowNumber.
[ ] Crear parser tests.
```

---

### 17.3. Templates

```text id="mhpy9v"
[ ] Crear GenericCsvBankStatementTemplate.
[ ] Crear GenericXlsxBankStatementTemplate.
[ ] Crear BankStatementTemplateResolver.
[ ] Rechazar templateKey inválido.
[ ] Rechazar template no habilitado.
[ ] Preparar extensibilidad para bancos ecuatorianos futuros.
```

---

## 18. Fase 14 — Normalización y validación de importación

### 18.1. Normalización

```text id="d6sf01"
[ ] Crear BankTransactionNormalizationService.
[ ] Normalizar descripción.
[ ] Normalizar reference.
[ ] Normalizar bankReference.
[ ] Normalizar direction.
[ ] Normalizar currency.
[ ] Normalizar amount.
[ ] Normalizar fechas.
[ ] Normalizar nulls.
[ ] Eliminar caracteres invisibles.
[ ] Producir canonical input.
[ ] Crear tests de normalización.
```

---

### 18.2. Validación por fila

```text id="y6vcjp"
[ ] Validar transactionDate requerida.
[ ] Validar amount requerido.
[ ] Validar amount > 0.
[ ] Validar direction requerida.
[ ] Validar currency USD.
[ ] Validar balanceAfter si existe.
[ ] Validar periodStart <= transactionDate <= periodEnd si policy aplica.
[ ] Crear BankStatementImportError para fila inválida.
[ ] Sanitizar rawRowPreview.
[ ] Sanitizar normalizedPreview.
```

---

### 18.3. Conteos

```text id="y167yr"
[ ] Calcular totalRows.
[ ] Calcular validRows.
[ ] Calcular invalidRows.
[ ] Calcular duplicateRows.
[ ] Calcular createdTransactions.
[ ] Actualizar BankStatementImport.
[ ] Validar consistencia de conteos.
```

---

## 19. Fase 15 — Fingerprint y duplicados

### 19.1. Fingerprint

```text id="deex1a"
[ ] Crear BankTransactionFingerprintService.
[ ] Usar SHA-256.
[ ] Usar input canónico.
[ ] No aceptar fingerprint externo.
[ ] Crear tests de estabilidad.
[ ] Crear tests de variación.
```

---

### 19.2. Duplicados en archivo

```text id="hvlepn"
[ ] Detectar duplicados dentro del mismo archivo.
[ ] Crear solo un movimiento principal si policy lo indica.
[ ] Marcar duplicados con isDuplicate=true.
[ ] Setear duplicateOfTransactionId.
[ ] Incrementar duplicateRows.
[ ] Auditar duplicateDetected.
```

---

### 19.3. Duplicados entre imports

```text id="sqig8s"
[ ] Consultar fingerprint existente.
[ ] Evitar duplicar movimiento conciliable.
[ ] Marcar fila como duplicada o saltarla según duplicatePolicy.
[ ] No incrementar createdTransactions para duplicados.
[ ] Crear tests de reimportación.
```

---

### 19.4. Idempotencia de archivo

```text id="z1btsh"
[ ] Detectar fileHash duplicado en misma cuenta.
[ ] Retornar 409 o respuesta idempotente según política.
[ ] Asegurar que fileHash tenant B no afecta tenant A.
[ ] Crear tests de concurrencia.
```

---

## 20. Fase 16 — Servicios de cuentas bancarias

```text id="dbz6wh"
[ ] Crear BankAccountService.
[ ] Implementar createBankAccount.
[ ] Implementar listBankAccounts.
[ ] Implementar getBankAccount.
[ ] Implementar updateBankAccount.
[ ] Implementar activateBankAccount.
[ ] Implementar deactivateBankAccount.
[ ] Implementar archiveBankAccount.
[ ] Enmascarar número de cuenta.
[ ] Generar accountNumberHash.
[ ] No devolver número completo.
[ ] No devolver accountNumberHash.
[ ] Validar isDefault único activo.
[ ] Auditar eventos.
[ ] Crear service tests.
```

---

## 21. Fase 17 — Servicios de importación bancaria

```text id="r0f6iy"
[ ] Crear BankStatementImportService.
[ ] Implementar createImport.
[ ] Validar bankAccount active.
[ ] Guardar archivo en Secure Document Storage.
[ ] Crear BankStatementImport uploaded.
[ ] Implementar validateImport.
[ ] Implementar processImport.
[ ] Implementar cancelImport.
[ ] Implementar archiveImport.
[ ] Implementar listImports.
[ ] Implementar getImport.
[ ] Implementar listImportErrors.
[ ] Manejar processed.
[ ] Manejar processedWithWarnings.
[ ] Manejar failed.
[ ] Auditar eventos.
[ ] Crear service tests.
```

---

## 22. Fase 18 — Servicios de movimientos bancarios

```text id="rq9pxt"
[ ] Crear BankTransactionService.
[ ] Implementar listBankTransactions.
[ ] Implementar getBankTransaction.
[ ] Implementar updateClassification.
[ ] Implementar ignoreBankTransaction.
[ ] Implementar archiveBankTransaction.
[ ] Bloquear duplicate para conciliación ordinaria.
[ ] Bloquear ignored para conciliación ordinaria.
[ ] Bloquear archived para conciliación.
[ ] No exponer fingerprint.
[ ] No exponer referencias sensibles completas por defecto.
[ ] Auditar eventos.
[ ] Crear service tests.
```

---

## 23. Fase 19 — Integración con Payments

### 23.1. PaymentReconciliationPort

```text id="iqr6q2"
[ ] Crear PaymentReconciliationPort.
[ ] Implementar findReconciliablePayments.
[ ] Implementar getPaymentForReconciliation.
[ ] Implementar markPaymentReconciled.
[ ] Implementar markPaymentPartiallyReconciled.
[ ] Implementar reversePaymentReconciliation.
[ ] Validar payment.tenantId.
[ ] Validar estados conciliables.
[ ] Crear integration tests.
```

---

### 23.2. Estados de Payments

```text id="x9vuv7"
[ ] Confirmar estados confirmed, partiallyAllocated, allocated como conciliables.
[ ] Bloquear draft.
[ ] Bloquear reported.
[ ] Bloquear pendingValidation.
[ ] Bloquear rejected.
[ ] Bloquear cancelled.
[ ] Bloquear reversed.
[ ] Bloquear archived.
[ ] Bloquear alreadyReconciled salvo flujo explícito.
```

---

### 23.3. Campos en Payments

```text id="sy5h6k"
[ ] Agregar PaymentReconciliationStatus si se decide.
[ ] Agregar reconciliationStatus en Payment si se decide.
[ ] Agregar reconciledAt si se decide.
[ ] Agregar reconciledBy si se decide.
[ ] Agregar reconciliationMatchId si se decide.
[ ] Ejecutar regresión de Payments.
```

---

## 24. Fase 20 — Sesiones de conciliación

```text id="k71zx1"
[ ] Crear ReconciliationSessionService.
[ ] Implementar createSession.
[ ] Implementar listSessions.
[ ] Implementar getSession.
[ ] Implementar updateSession.
[ ] Implementar openSession.
[ ] Implementar closeSession.
[ ] Implementar reopenSession.
[ ] Implementar archiveSession.
[ ] Implementar getSessionSummary.
[ ] Bloquear sesión activa duplicada.
[ ] Bloquear cambios ordinarios en closed.
[ ] Bloquear cierre con excepciones high/critical abiertas si policy activa.
[ ] Requerir reason para close.
[ ] Requerir reason para reopen.
[ ] Auditar eventos.
[ ] Crear service tests.
```

---

## 25. Fase 21 — Scoring y generación de candidatos

### 25.1. Scoring

```text id="yt8tyw"
[ ] Crear ReconciliationScoringService.
[ ] Implementar score por monto exacto.
[ ] Implementar score por fecha cercana.
[ ] Implementar score por referencia.
[ ] Implementar score por descripción.
[ ] Implementar score por unidad si existe pista.
[ ] Implementar penalización por monto diferente.
[ ] Implementar penalización por fecha fuera de tolerancia.
[ ] Implementar rechazo de pagos no conciliables.
[ ] Implementar rechazo de movimientos no conciliables.
[ ] Generar scoreReason explicable.
[ ] Sanitizar scoreReason.
[ ] Crear scoring tests.
```

---

### 25.2. Candidate generation

```text id="nk71ye"
[ ] Crear ReconciliationCandidateService.
[ ] Implementar generateCandidates.
[ ] Obtener movimientos conciliables.
[ ] Obtener pagos conciliables.
[ ] Calcular pares posibles.
[ ] Aplicar minScore.
[ ] Evitar candidatos duplicados activos.
[ ] Persistir candidatos suggested.
[ ] No modificar Payments.
[ ] No crear matches.
[ ] Auditar reconciliationCandidate.generated.
[ ] Crear candidate tests.
```

---

### 25.3. Accept/reject candidate

```text id="n0n1u4"
[ ] Implementar acceptCandidate.
[ ] Decidir si accept crea match confirmado en MVP.
[ ] Implementar accept como confirmación si se mantiene decisión MVP.
[ ] Implementar rejectCandidate.
[ ] Requerir reason para reject.
[ ] Actualizar reviewedBy/reviewedAt.
[ ] Auditar accepted/rejected.
[ ] Crear tests.
```

---

## 26. Fase 22 — Confirmación de matches

### 26.1. Match 1:1

```text id="pv884j"
[ ] Implementar confirmOneToOne.
[ ] Validar una transacción bancaria.
[ ] Validar un pago.
[ ] Calcular totalBankAmount.
[ ] Calcular totalPaymentAmount.
[ ] Calcular differenceAmount.
[ ] Crear ReconciliationMatch.
[ ] Crear ReconciliationMatchItems.
[ ] Actualizar BankTransaction.status=matched.
[ ] Actualizar Payment.reconciliationStatus=reconciled.
[ ] Auditar.
[ ] Crear financial integrity tests.
```

---

### 26.2. Match 1:N

```text id="yxw59n"
[ ] Implementar confirmOneToMany.
[ ] Validar una transacción bancaria.
[ ] Validar varios pagos.
[ ] Calcular suma de pagos.
[ ] Validar diferencia.
[ ] Crear items.
[ ] Actualizar estados.
[ ] Auditar.
[ ] Crear tests.
```

---

### 26.3. Match N:1

```text id="elty41"
[ ] Implementar confirmManyToOne.
[ ] Validar varios movimientos.
[ ] Validar un pago.
[ ] Calcular suma bancaria.
[ ] Validar diferencia.
[ ] Crear items.
[ ] Actualizar estados.
[ ] Auditar.
[ ] Crear tests.
```

---

### 26.4. Match manual

```text id="cqo1na"
[ ] Implementar matchType manual.
[ ] Exigir notas o razón si policy lo requiere.
[ ] Validar montos.
[ ] Auditar de forma reforzada si hay diferencia.
[ ] Crear tests.
```

---

### 26.5. Transacción DB

```text id="o4upzu"
[ ] Ejecutar creación de match e items en transacción.
[ ] Actualizar bankTransactions en la misma transacción o flujo consistente.
[ ] Actualizar Payments mediante puerto con consistencia controlada.
[ ] Manejar rollback.
[ ] Crear tests de error parcial.
```

---

## 27. Fase 23 — Reverso de matches

```text id="emddxa"
[ ] Crear ReconciliationMatchReversalService.
[ ] Implementar reverseMatch.
[ ] Validar match confirmed.
[ ] Requerir reverseReason.
[ ] Cambiar status a reversed.
[ ] Setear reversedAt.
[ ] Setear reversedBy desde token.
[ ] No eliminar items.
[ ] Restaurar BankTransaction.status.
[ ] Restaurar Payment.reconciliationStatus.
[ ] Bloquear double reverse.
[ ] Auditar reconciliationMatch.reversed.
[ ] Crear tests de reverso.
[ ] Crear concurrency tests de doble reverso.
```

---

## 28. Fase 24 — Excepciones de conciliación

```text id="es3h6e"
[ ] Crear ReconciliationExceptionService.
[ ] Implementar createException.
[ ] Implementar listExceptions.
[ ] Implementar getException.
[ ] Implementar updateException.
[ ] Implementar resolveException.
[ ] Implementar ignoreException.
[ ] Implementar archiveException.
[ ] Validar session no closed.
[ ] Validar bankTransaction tenant-scoped.
[ ] Validar payment tenant-scoped.
[ ] Exigir description.
[ ] Exigir resolutionNotes para resolve.
[ ] Exigir reason para ignore.
[ ] Auditar eventos.
[ ] Crear exception workflow tests.
```

---

## 29. Fase 25 — Reportes

### 29.1. Summary

```text id="y7wfod"
[ ] Implementar ReconciliationReportService.
[ ] Implementar summary report.
[ ] Calcular bankAccountsCount.
[ ] Calcular sessionsCount.
[ ] Calcular bankTransactionsCount.
[ ] Calcular matchedTransactionsCount.
[ ] Calcular unmatchedTransactionsCount.
[ ] Calcular paymentsMatchedCount.
[ ] Calcular paymentsUnmatchedCount.
[ ] Calcular exceptionsOpenCount.
[ ] Calcular totalBankCredits.
[ ] Calcular totalBankDebits.
[ ] Calcular totalMatchedAmount.
[ ] Calcular totalUnmatchedBankAmount.
[ ] Crear tests.
```

---

### 29.2. Unmatched bank transactions

```text id="iicco9"
[ ] Implementar unmatched bank transactions report.
[ ] Incluir pending.
[ ] Incluir unmatched.
[ ] Incluir exception no matched.
[ ] Excluir matched.
[ ] Excluir archived.
[ ] Excluir duplicate si policy lo define.
[ ] No exponer referencias sensibles completas.
[ ] Crear tests.
```

---

### 29.3. Unmatched payments

```text id="fntvns"
[ ] Implementar unmatched payments report.
[ ] Incluir pagos confirmed pendientes.
[ ] Incluir partiallyAllocated pendientes.
[ ] Incluir allocated pendientes.
[ ] Excluir rejected.
[ ] Excluir cancelled.
[ ] Excluir reversed.
[ ] Excluir archived.
[ ] Excluir tenant B.
[ ] Crear tests.
```

---

### 29.4. Exceptions report

```text id="ep3xhp"
[ ] Implementar exceptions report.
[ ] Filtrar por periodo.
[ ] Filtrar por severity.
[ ] Filtrar por status.
[ ] Filtrar por exceptionType.
[ ] No exponer datos sensibles completos.
[ ] Crear tests.
```

---

### 29.5. Bank account balances

```text id="ub2equ"
[ ] Implementar bank account balances report.
[ ] Mostrar accountNumberMasked.
[ ] No mostrar número completo.
[ ] Calcular openingBalance.
[ ] Calcular closingBalance.
[ ] Calcular credits.
[ ] Calcular debits.
[ ] Respetar tenant.
[ ] Crear tests.
```

---

### 29.6. Export

```text id="w7lyxh"
[ ] Implementar export CSV.
[ ] Implementar export XLSX.
[ ] Implementar export PDF si está habilitado.
[ ] Persistir export en Secure Document Storage si aplica.
[ ] No exponer storageKey.
[ ] Auditar reconciliationReport.exported.
[ ] Crear tests.
```

---

## 30. Fase 26 — Controladores REST

### 30.1. BankAccountsController

```text id="qi91re"
[ ] Implementar GET /api/v1/tenant/bank-accounts.
[ ] Implementar POST /api/v1/tenant/bank-accounts.
[ ] Implementar GET /api/v1/tenant/bank-accounts/{bankAccountId}.
[ ] Implementar PATCH /api/v1/tenant/bank-accounts/{bankAccountId}.
[ ] Implementar POST /api/v1/tenant/bank-accounts/{bankAccountId}/activate.
[ ] Implementar POST /api/v1/tenant/bank-accounts/{bankAccountId}/deactivate.
[ ] Implementar POST /api/v1/tenant/bank-accounts/{bankAccountId}/archive.
[ ] Crear API tests.
```

---

### 30.2. BankStatementImportsController

```text id="m5q2hx"
[ ] Implementar GET /api/v1/tenant/bank-statement-imports.
[ ] Implementar POST /api/v1/tenant/bank-accounts/{bankAccountId}/statement-imports.
[ ] Implementar GET /api/v1/tenant/bank-statement-imports/{importId}.
[ ] Implementar POST /api/v1/tenant/bank-statement-imports/{importId}/validate.
[ ] Implementar POST /api/v1/tenant/bank-statement-imports/{importId}/process.
[ ] Implementar POST /api/v1/tenant/bank-statement-imports/{importId}/cancel.
[ ] Implementar POST /api/v1/tenant/bank-statement-imports/{importId}/archive.
[ ] Implementar GET /api/v1/tenant/bank-statement-imports/{importId}/errors.
[ ] Crear API tests.
```

---

### 30.3. BankTransactionsController

```text id="rwxgnb"
[ ] Implementar GET /api/v1/tenant/bank-transactions.
[ ] Implementar GET /api/v1/tenant/bank-transactions/{bankTransactionId}.
[ ] Implementar PATCH /api/v1/tenant/bank-transactions/{bankTransactionId}/classification.
[ ] Implementar POST /api/v1/tenant/bank-transactions/{bankTransactionId}/ignore.
[ ] Implementar POST /api/v1/tenant/bank-transactions/{bankTransactionId}/archive.
[ ] Crear API tests.
```

---

### 30.4. ReconciliationSessionsController

```text id="fxz6l4"
[ ] Implementar GET /api/v1/tenant/reconciliation-sessions.
[ ] Implementar POST /api/v1/tenant/reconciliation-sessions.
[ ] Implementar GET /api/v1/tenant/reconciliation-sessions/{sessionId}.
[ ] Implementar PATCH /api/v1/tenant/reconciliation-sessions/{sessionId}.
[ ] Implementar POST /api/v1/tenant/reconciliation-sessions/{sessionId}/open.
[ ] Implementar POST /api/v1/tenant/reconciliation-sessions/{sessionId}/close.
[ ] Implementar POST /api/v1/tenant/reconciliation-sessions/{sessionId}/reopen.
[ ] Implementar POST /api/v1/tenant/reconciliation-sessions/{sessionId}/archive.
[ ] Implementar GET /api/v1/tenant/reconciliation-sessions/{sessionId}/summary.
[ ] Crear API tests.
```

---

### 30.5. ReconciliationCandidatesController

```text id="lvwu2r"
[ ] Implementar GET /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates.
[ ] Implementar POST /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates/generate.
[ ] Implementar GET /api/v1/tenant/reconciliation-candidates/{candidateId}.
[ ] Implementar POST /api/v1/tenant/reconciliation-candidates/{candidateId}/accept.
[ ] Implementar POST /api/v1/tenant/reconciliation-candidates/{candidateId}/reject.
[ ] Crear API tests.
```

---

### 30.6. ReconciliationMatchesController

```text id="slet1d"
[ ] Implementar GET /api/v1/tenant/reconciliation-sessions/{sessionId}/matches.
[ ] Implementar POST /api/v1/tenant/reconciliation-sessions/{sessionId}/matches.
[ ] Implementar GET /api/v1/tenant/reconciliation-matches/{matchId}.
[ ] Implementar POST /api/v1/tenant/reconciliation-matches/{matchId}/confirm.
[ ] Implementar POST /api/v1/tenant/reconciliation-matches/{matchId}/reverse.
[ ] Implementar POST /api/v1/tenant/reconciliation-matches/{matchId}/archive.
[ ] Crear API tests.
```

---

### 30.7. ReconciliationExceptionsController

```text id="ydfdi0"
[ ] Implementar GET /api/v1/tenant/reconciliation-sessions/{sessionId}/exceptions.
[ ] Implementar POST /api/v1/tenant/reconciliation-sessions/{sessionId}/exceptions.
[ ] Implementar GET /api/v1/tenant/reconciliation-exceptions/{exceptionId}.
[ ] Implementar PATCH /api/v1/tenant/reconciliation-exceptions/{exceptionId}.
[ ] Implementar POST /api/v1/tenant/reconciliation-exceptions/{exceptionId}/resolve.
[ ] Implementar POST /api/v1/tenant/reconciliation-exceptions/{exceptionId}/ignore.
[ ] Implementar POST /api/v1/tenant/reconciliation-exceptions/{exceptionId}/archive.
[ ] Crear API tests.
```

---

### 30.8. ReconciliationReportsController

```text id="phxq4q"
[ ] Implementar GET /api/v1/tenant/reconciliation-reports/summary.
[ ] Implementar GET /api/v1/tenant/reconciliation-reports/unmatched-bank-transactions.
[ ] Implementar GET /api/v1/tenant/reconciliation-reports/unmatched-payments.
[ ] Implementar GET /api/v1/tenant/reconciliation-reports/exceptions.
[ ] Implementar GET /api/v1/tenant/reconciliation-reports/bank-account-balances.
[ ] Implementar GET /api/v1/tenant/reconciliation-reports/export.
[ ] Crear API tests.
```

---

## 31. Fase 27 — Auditoría

### 31.1. Eventos de cuentas

```text id="vv4tgv"
[ ] Emitir bankAccount.created.
[ ] Emitir bankAccount.updated.
[ ] Emitir bankAccount.activated.
[ ] Emitir bankAccount.deactivated.
[ ] Emitir bankAccount.archived.
```

---

### 31.2. Eventos de importación

```text id="vh12w7"
[ ] Emitir bankStatementImport.created.
[ ] Emitir bankStatementImport.validated.
[ ] Emitir bankStatementImport.processed.
[ ] Emitir bankStatementImport.failed.
[ ] Emitir bankStatementImport.cancelled.
[ ] Emitir bankStatementImport.archived.
```

---

### 31.3. Eventos de movimientos

```text id="oyj3ya"
[ ] Emitir bankTransaction.created.
[ ] Emitir bankTransaction.markedDuplicate.
[ ] Emitir bankTransaction.classificationUpdated.
[ ] Emitir bankTransaction.ignored.
[ ] Emitir bankTransaction.archived.
```

---

### 31.4. Eventos de sesiones

```text id="uyvhzv"
[ ] Emitir reconciliationSession.created.
[ ] Emitir reconciliationSession.updated.
[ ] Emitir reconciliationSession.opened.
[ ] Emitir reconciliationSession.reviewing.
[ ] Emitir reconciliationSession.closed.
[ ] Emitir reconciliationSession.reopened.
[ ] Emitir reconciliationSession.archived.
```

---

### 31.5. Eventos de candidatos, matches y excepciones

```text id="t3ipgx"
[ ] Emitir reconciliationCandidate.generated.
[ ] Emitir reconciliationCandidate.accepted.
[ ] Emitir reconciliationCandidate.rejected.
[ ] Emitir reconciliationCandidate.expired.
[ ] Emitir reconciliationCandidate.superseded.
[ ] Emitir reconciliationMatch.created.
[ ] Emitir reconciliationMatch.confirmed.
[ ] Emitir reconciliationMatch.reversed.
[ ] Emitir reconciliationMatch.archived.
[ ] Emitir reconciliationException.created.
[ ] Emitir reconciliationException.updated.
[ ] Emitir reconciliationException.resolved.
[ ] Emitir reconciliationException.ignored.
[ ] Emitir reconciliationException.archived.
[ ] Emitir reconciliationReport.exported.
```

---

### 31.6. Sanitización de auditoría

```text id="yx39et"
[ ] No guardar accountNumber completo.
[ ] No guardar accountNumberHash.
[ ] No guardar storageKey.
[ ] No guardar signedUrl.
[ ] No guardar archivo completo.
[ ] No guardar fila bancaria completa.
[ ] No guardar referencias sensibles completas.
[ ] No guardar tokens.
[ ] No guardar cookies.
[ ] No guardar SQL raw.
[ ] No guardar stack trace.
[ ] Crear audit tests.
```

---

## 32. Fase 28 — Observabilidad

### 32.1. Logs

```text id="j698cv"
[ ] Registrar logs para bankAccount.created.
[ ] Registrar logs para bankStatementImport.created.
[ ] Registrar logs para bankStatementImport.processed.
[ ] Registrar logs para bankStatementImport.failed.
[ ] Registrar logs para bankTransaction.created.
[ ] Registrar logs para bankTransaction.duplicateDetected.
[ ] Registrar logs para reconciliationCandidate.generated.
[ ] Registrar logs para reconciliationMatch.confirmed.
[ ] Registrar logs para reconciliationMatch.reversed.
[ ] Registrar logs para reconciliationException.created.
[ ] Registrar logs para reconciliationSession.closed.
[ ] Incluir traceId.
[ ] Incluir action.
[ ] Incluir outcome.
[ ] Incluir durationMs.
[ ] No incluir datos sensibles.
```

---

### 32.2. Métricas

```text id="c9br6q"
[ ] Crear bank_accounts_total.
[ ] Crear bank_statement_imports_total.
[ ] Crear bank_statement_import_rows_total.
[ ] Crear bank_statement_import_failed_total.
[ ] Crear bank_transactions_imported_total.
[ ] Crear bank_transactions_duplicate_total.
[ ] Crear reconciliation_candidates_generated_total.
[ ] Crear reconciliation_matches_confirmed_total.
[ ] Crear reconciliation_matches_reversed_total.
[ ] Crear reconciliation_exceptions_open_total.
[ ] Crear reconciliation_sessions_closed_total.
[ ] Crear reconciliation_unmatched_bank_amount_total.
[ ] Crear reconciliation_unmatched_payment_amount_total.
```

---

### 32.3. Labels

```text id="eb56ge"
[ ] Permitir label status.
[ ] Permitir label importStatus.
[ ] Permitir label transactionType.
[ ] Permitir label direction.
[ ] Permitir label matchType.
[ ] Permitir label exceptionType.
[ ] Permitir label severity.
[ ] Permitir label currency.
[ ] Permitir label outcome.
[ ] Prohibir tenantId como label.
[ ] Prohibir bankAccountId como label.
[ ] Prohibir bankTransactionId como label.
[ ] Prohibir paymentId como label.
[ ] Prohibir accountNumber como label.
[ ] Prohibir reference como label.
[ ] Prohibir storageKey como label.
[ ] Crear observability tests.
```

---

## 33. Fase 29 — OpenAPI

```text id="w8u3ti"
[ ] Agregar tag Bank Accounts.
[ ] Agregar tag Bank Statement Imports.
[ ] Agregar tag Bank Transactions.
[ ] Agregar tag Reconciliation Sessions.
[ ] Agregar tag Reconciliation Candidates.
[ ] Agregar tag Reconciliation Matches.
[ ] Agregar tag Reconciliation Exceptions.
[ ] Agregar tag Reconciliation Reports.
[ ] Documentar DTOs.
[ ] Documentar errores.
[ ] Documentar permisos.
[ ] Agregar x-tenant-scope.
[ ] Agregar x-auth-required.
[ ] Agregar x-financial-control.
[ ] Agregar x-public-exposure=false.
[ ] Agregar x-file-upload en importaciones.
[ ] Agregar x-secure-document-storage en importaciones.
[ ] Agregar x-storage-key-exposed=false.
[ ] Agregar x-manual-confirmation-required en matching.
[ ] Agregar x-candidate-side-effect=false.
[ ] Verificar que no exista /public.
[ ] Verificar que no exista /me para conciliación en MVP.
[ ] Ejecutar openapi:validate.
```

---

## 34. Fase 30 — Tests automatizados

### 34.1. Unit/domain/value tests

```text id="ozxrpx"
[ ] Implementar value object tests.
[ ] Implementar entity tests.
[ ] Implementar state machine tests.
[ ] Implementar parser tests.
[ ] Implementar normalization tests.
[ ] Implementar fingerprint tests.
[ ] Implementar scoring tests.
```

---

### 34.2. Repository tests

```text id="ub4yai"
[ ] Implementar BankAccount repository tests.
[ ] Implementar BankStatementImport repository tests.
[ ] Implementar BankStatementImportError repository tests.
[ ] Implementar BankTransaction repository tests.
[ ] Implementar ReconciliationSession repository tests.
[ ] Implementar ReconciliationCandidate repository tests.
[ ] Implementar ReconciliationMatch repository tests.
[ ] Implementar ReconciliationMatchItem repository tests.
[ ] Implementar ReconciliationException repository tests.
```

---

### 34.3. Service tests

```text id="ex9pqf"
[ ] Implementar BankAccountService tests.
[ ] Implementar BankStatementImportService tests.
[ ] Implementar BankTransactionService tests.
[ ] Implementar ReconciliationSessionService tests.
[ ] Implementar ReconciliationScoringService tests.
[ ] Implementar ReconciliationCandidateService tests.
[ ] Implementar ReconciliationMatchService tests.
[ ] Implementar ReconciliationMatchReversalService tests.
[ ] Implementar ReconciliationExceptionService tests.
[ ] Implementar ReconciliationReportService tests.
```

---

### 34.4. Integration tests

```text id="qab719"
[ ] Implementar Secure Document Storage integration tests.
[ ] Implementar Payments integration tests.
[ ] Implementar Account Statements integration tests.
[ ] Implementar Basic Reports integration tests.
[ ] Implementar Audit integration tests.
```

---

### 34.5. API tests

```text id="kyfb32"
[ ] Implementar Bank Accounts API tests.
[ ] Implementar Bank Statement Imports API tests.
[ ] Implementar Bank Transactions API tests.
[ ] Implementar Reconciliation Sessions API tests.
[ ] Implementar Reconciliation Candidates API tests.
[ ] Implementar Reconciliation Matches API tests.
[ ] Implementar Reconciliation Exceptions API tests.
[ ] Implementar Reconciliation Reports API tests.
```

---

### 34.6. Security tests

```text id="b6ndg6"
[ ] Implementar authorization tests.
[ ] Implementar multitenancy tests.
[ ] Implementar financial integrity tests.
[ ] Implementar no-sensitive-data tests.
[ ] Implementar no-public-endpoints tests.
[ ] Implementar no-storageKey tests.
[ ] Implementar no-full-account-number tests.
[ ] Implementar no-candidate-side-effect tests.
[ ] Implementar no-external-ai tests.
```

---

### 34.7. Performance/concurrency/smoke

```text id="s4gv42"
[ ] Implementar performance tests de listados.
[ ] Implementar performance tests de import CSV.
[ ] Implementar performance tests de import XLSX.
[ ] Implementar performance tests de candidate generation.
[ ] Implementar concurrency tests de imports.
[ ] Implementar concurrency tests de fingerprint.
[ ] Implementar concurrency tests de sessions.
[ ] Implementar concurrency tests de matches.
[ ] Implementar concurrency tests de reversals.
[ ] Implementar smoke test completo.
```

---

## 35. Fase 31 — Regresión de módulos dependientes

### 35.1. Payments

```text id="qh0gfk"
[ ] Ejecutar regresión de payment creation.
[ ] Ejecutar regresión de payment confirmation.
[ ] Ejecutar regresión de payment allocation.
[ ] Ejecutar regresión de payment reversal.
[ ] Ejecutar regresión de receipts.
[ ] Verificar que reconciliationStatus no rompe endpoints existentes.
```

---

### 35.2. Account Statements

```text id="iswn8j"
[ ] Verificar que estados de cuenta siguen derivando de cargos/pagos.
[ ] Verificar que movimientos bancarios no alteran balances.
[ ] Verificar que pagos conciliados pueden mostrarse como metadata si aplica.
```

---

### 35.3. Secure Document Storage

```text id="jggnu4"
[ ] Verificar upload seguro.
[ ] Verificar download seguro.
[ ] Verificar storageKey oculto.
[ ] Verificar SourceModule bankReconciliation.
[ ] Verificar documentos restricted.
```

---

### 35.4. Audit

```text id="jitppr"
[ ] Verificar audit logs sanitizados.
[ ] Verificar eventos financieros existentes.
[ ] Verificar que no se guardan datos bancarios completos.
```

---

## 36. Fase 32 — CI/CD

```text id="mhnwl1"
[ ] Agregar npm run test:bank-reconciliation.
[ ] Agregar npm run test:bank-reconciliation:unit.
[ ] Agregar npm run test:bank-reconciliation:domain.
[ ] Agregar npm run test:bank-reconciliation:value-objects.
[ ] Agregar npm run test:bank-reconciliation:state-machines.
[ ] Agregar npm run test:bank-reconciliation:parsers.
[ ] Agregar npm run test:bank-reconciliation:fingerprint.
[ ] Agregar npm run test:bank-reconciliation:duplicates.
[ ] Agregar npm run test:bank-reconciliation:repositories.
[ ] Agregar npm run test:bank-reconciliation:services.
[ ] Agregar npm run test:bank-reconciliation:integration.
[ ] Agregar npm run test:bank-reconciliation:api.
[ ] Agregar npm run test:bank-reconciliation:authorization.
[ ] Agregar npm run test:bank-reconciliation:multitenancy.
[ ] Agregar npm run test:bank-reconciliation:financial-integrity.
[ ] Agregar npm run test:bank-reconciliation:imports.
[ ] Agregar npm run test:bank-reconciliation:matching.
[ ] Agregar npm run test:bank-reconciliation:exceptions.
[ ] Agregar npm run test:bank-reconciliation:reports.
[ ] Agregar npm run test:bank-reconciliation:audit.
[ ] Agregar npm run test:bank-reconciliation:observability.
[ ] Agregar npm run test:bank-reconciliation:openapi.
[ ] Agregar npm run test:bank-reconciliation:security.
[ ] Agregar npm run test:bank-reconciliation:performance.
[ ] Agregar npm run test:bank-reconciliation:concurrency.
[ ] Agregar npm run test:bank-reconciliation:smoke.
[ ] Integrar comandos en GitHub Actions.
[ ] Hacer fallar CI si OpenAPI documenta /public.
[ ] Hacer fallar CI si response snapshots contienen accountNumber completo.
[ ] Hacer fallar CI si response snapshots contienen accountNumberHash.
[ ] Hacer fallar CI si response snapshots contienen storageKey.
[ ] Hacer fallar CI si se detecta uso de float/double en dominio financiero.
```

---

## 37. Fase 33 — Seeds y fixtures

### 37.1. Seeds

```text id="ge1r5z"
[ ] Crear bankAccountMainA.
[ ] Crear bankAccountSecondaryA.
[ ] Crear bankAccountInactiveA.
[ ] Crear bankAccountArchivedA.
[ ] Crear bankAccountCashA.
[ ] Crear bankAccountTenantB.
[ ] Crear bankStatementImportCsvA.
[ ] Crear bankStatementImportXlsxA.
[ ] Crear bankStatementImportProcessedA.
[ ] Crear bankStatementImportWarningsA.
[ ] Crear bankStatementImportFailedA.
[ ] Crear bankStatementImportCancelledA.
[ ] Crear bankStatementImportTenantB.
[ ] Crear bankTransactions demo.
[ ] Crear reconciliationSessions demo.
[ ] Crear reconciliationCandidates demo.
[ ] Crear reconciliationMatches demo.
[ ] Crear reconciliationExceptions demo.
```

---

### 37.2. Fixtures de archivos

```text id="p4fwjw"
[ ] Crear CSV válido pequeño.
[ ] Crear CSV válido mediano.
[ ] Crear CSV con filas inválidas.
[ ] Crear CSV con duplicados.
[ ] Crear CSV con moneda no soportada.
[ ] Crear CSV vacío.
[ ] Crear CSV malformado.
[ ] Crear XLSX válido pequeño.
[ ] Crear XLSX con filas inválidas.
[ ] Crear archivo MIME inválido.
[ ] Crear archivo oversized sintético.
```

---

### 37.3. Datos prohibidos

```text id="mt0hts"
[ ] Verificar que seeds no contienen números reales de cuenta.
[ ] Verificar que fixtures no contienen movimientos reales.
[ ] Verificar que fixtures no contienen referencias bancarias reales.
[ ] Verificar que fixtures no contienen nombres reales.
[ ] Verificar que fixtures no contienen cédulas reales.
[ ] Verificar que fixtures no contienen emails reales.
[ ] Verificar que fixtures no contienen tokens.
[ ] Verificar que fixtures no contienen secretos.
```

---

## 38. Fase 34 — Hardening final

```text id="d5ruyk"
[ ] Ejecutar lint.
[ ] Ejecutar typecheck.
[ ] Ejecutar unit tests.
[ ] Ejecutar integration tests.
[ ] Ejecutar API tests.
[ ] Ejecutar authorization tests.
[ ] Ejecutar multitenancy tests.
[ ] Ejecutar financial integrity tests.
[ ] Ejecutar security tests.
[ ] Ejecutar performance tests.
[ ] Ejecutar concurrency tests.
[ ] Ejecutar smoke test.
[ ] Ejecutar regression tests.
[ ] Ejecutar openapi:validate.
[ ] Verificar que no hay endpoints /public.
[ ] Verificar que no hay endpoints /me para conciliación bancaria en MVP.
[ ] Verificar que no se expone accountNumber completo.
[ ] Verificar que no se expone accountNumberHash.
[ ] Verificar que no se expone storageKey.
[ ] Verificar que no hay float/double en dominio financiero.
[ ] Verificar que no hay IA externa con datos reales.
[ ] Verificar build.
[ ] Verificar CI.
```

---

## 39. Orden de PRs recomendado

```text id="oel8nr"
PR-017-01 — Module skeleton, enums and constants.
PR-017-02 — Value objects and domain entities.
PR-017-03 — Prisma schema, migration, constraints and indexes.
PR-017-04 — Repository ports and Prisma repositories.
PR-017-05 — DTOs, mappers, guards and policies.
PR-017-06 — Bank accounts service and controller.
PR-017-07 — Secure Document Storage integration for imports.
PR-017-08 — CSV/XLSX parsers, templates and validation.
PR-017-09 — Normalization, fingerprint and duplicate detection.
PR-017-10 — Bank statement import workflow.
PR-017-11 — Bank transactions service and controller.
PR-017-12 — Payments reconciliation adapter.
PR-017-13 — Reconciliation sessions.
PR-017-14 — Candidate generation and scoring.
PR-017-15 — Match confirmation 1:1, 1:N and N:1.
PR-017-16 — Match reversal.
PR-017-17 — Reconciliation exceptions.
PR-017-18 — Reconciliation reports and export.
PR-017-19 — Audit, observability and OpenAPI.
PR-017-20 — Tests, regression, performance, security hardening and CI gates.
```

---

## 40. Checklist por PR

Cada PR debe responder:

```text id="c1i40e"
[ ] ¿Respeta tenant isolation?
[ ] ¿Evita findUnique por id simple?
[ ] ¿Rechaza tenantId desde body?
[ ] ¿Protege número completo de cuenta?
[ ] ¿Oculta accountNumberHash en DTO estándar?
[ ] ¿Oculta storageKey?
[ ] ¿Usa Decimal para dinero?
[ ] ¿Evita float/double?
[ ] ¿Valida estados financieros?
[ ] ¿No confirma automáticamente sin permiso?
[ ] ¿Audita operaciones críticas?
[ ] ¿Sanitiza logs?
[ ] ¿Sanitiza auditoría?
[ ] ¿No crea endpoints públicos?
[ ] ¿No documenta endpoints públicos?
[ ] ¿No invoca IA externa con datos reales?
[ ] ¿Agrega tests?
[ ] ¿No rompe módulos previos?
```

---

## 41. Comandos sugeridos

```bash id="x0v8av"
npm run lint
npm run typecheck
npm run test:bank-reconciliation
npm run test:bank-reconciliation:unit
npm run test:bank-reconciliation:domain
npm run test:bank-reconciliation:repositories
npm run test:bank-reconciliation:services
npm run test:bank-reconciliation:integration
npm run test:bank-reconciliation:api
npm run test:bank-reconciliation:authorization
npm run test:bank-reconciliation:multitenancy
npm run test:bank-reconciliation:financial-integrity
npm run test:bank-reconciliation:imports
npm run test:bank-reconciliation:matching
npm run test:bank-reconciliation:exceptions
npm run test:bank-reconciliation:reports
npm run test:bank-reconciliation:audit
npm run test:bank-reconciliation:observability
npm run test:bank-reconciliation:openapi
npm run test:bank-reconciliation:security
npm run test:bank-reconciliation:performance
npm run test:bank-reconciliation:concurrency
npm run test:bank-reconciliation:smoke
npm run openapi:validate
npm run build
```

---

## 42. Definition of Done

El módulo se considera listo cuando:

```text id="uxgl21"
[ ] spec.md está aprobado.
[ ] plan.md está aprobado.
[ ] data-model.md está aprobado.
[ ] api-contract.md está aprobado.
[ ] test-plan.md está aprobado.
[ ] tasks.md está aprobado.
[ ] security-notes.md está creado y aprobado.
[ ] Prisma schema está implementado.
[ ] Migración está ejecutada en test.
[ ] Repositorios funcionan.
[ ] BankAccountService funciona.
[ ] BankStatementImportService funciona.
[ ] BankTransactionService funciona.
[ ] ReconciliationSessionService funciona.
[ ] ReconciliationScoringService funciona.
[ ] ReconciliationCandidateService funciona.
[ ] ReconciliationMatchService funciona.
[ ] ReconciliationMatchReversalService funciona.
[ ] ReconciliationExceptionService funciona.
[ ] ReconciliationReportService funciona.
[ ] Secure Document Storage integration funciona.
[ ] Payments integration funciona.
[ ] Account Statements integration no rompe saldos.
[ ] Audit funciona.
[ ] Observability funciona.
[ ] Controllers funcionan.
[ ] OpenAPI está actualizado.
[ ] No existen endpoints públicos.
[ ] No existen endpoints /me directos en MVP.
[ ] Tests unitarios pasan.
[ ] Tests de dominio pasan.
[ ] Tests de repositorio pasan.
[ ] Tests de servicios pasan.
[ ] Tests de integración pasan.
[ ] Tests API pasan.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests financieros pasan.
[ ] Tests de seguridad pasan.
[ ] Tests de performance cumplen objetivo.
[ ] Tests de concurrencia pasan.
[ ] Smoke test pasa.
[ ] Regression tests pasan.
[ ] Build pasa.
[ ] CI pasa.
```

---

## 43. No aceptación

La implementación no debe aceptarse si:

```text id="ysfc4u"
- permite cuentas bancarias cross-tenant;
- permite importaciones cross-tenant;
- permite movimientos bancarios cross-tenant;
- permite sesiones cross-tenant;
- permite candidatos cross-tenant;
- permite matches cross-tenant;
- permite excepciones cross-tenant;
- permite conciliar paymentId de otro tenant;
- permite usar secureDocumentId de otro tenant;
- acepta tenantId desde body;
- busca entidades solo por id;
- expone número completo de cuenta;
- expone accountNumberHash por DTO estándar;
- expone fingerprint por DTO estándar;
- expone storageKey;
- expone archivo bancario completo en JSON;
- expone filas completas no sanitizadas;
- duplica movimientos al reimportar;
- omite fingerprint;
- usa float/double para dinero;
- usa JavaScript number para cálculos monetarios;
- permite candidate con side effect financiero;
- confirma matches automáticamente sin permiso;
- permite match con payment no conciliable;
- permite match con bankTransaction no conciliable;
- permite match con diferencia sin razón;
- permite reverso sin razón;
- permite modificar sesión closed;
- permite cerrar sesión con excepciones críticas abiertas si policy lo bloquea;
- omite auditoría financiera crítica;
- registra datos bancarios completos en logs;
- registra archivo bancario completo en auditoría;
- crea endpoints públicos;
- documenta endpoints públicos en OpenAPI;
- expone conciliación bancaria a WordPress público;
- envía datos reales a IA externa.
```

---

## 44. Resultado esperado

Al completar estas tareas, el módulo `017-bank-reconciliation` quedará implementado como una capacidad financiera crítica de RESIDENT Core.

Resultado esperado:

```text id="fq2gna"
- cuentas bancarias tenant-scoped;
- números de cuenta protegidos;
- importación CSV/XLSX;
- archivos importados protegidos por Secure Document Storage;
- validación de archivos;
- normalización de movimientos;
- fingerprint determinístico;
- detección de duplicados;
- movimientos bancarios normalizados;
- sesiones de conciliación;
- candidatos determinísticos;
- scoring explicable;
- aceptación/rechazo de candidatos;
- match 1:1;
- match 1:N;
- match N:1;
- diferencias justificadas;
- reversos controlados;
- excepciones de conciliación;
- reportes básicos;
- exportación segura;
- integración con Payments;
- integración con Account Statements;
- integración con Basic Reports;
- auditoría financiera;
- observabilidad segura;
- OpenAPI consistente;
- tests automatizados;
- CI/CD gates;
- no exposición pública;
- no IA con datos reales.
```

---

## 45. Próximo documento

Después de este documento, el siguiente archivo del paquete es:

```text id="k5m6ka"
docs/specs/017-bank-reconciliation/security-notes.md
```
