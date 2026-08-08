# Test Plan — Spec 017 Bank Reconciliation

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                            |
| Spec ID         | 017                                                                                                                                                                                      |
| Módulo          | Bank Reconciliation                                                                                                                                                                      |
| Documento       | Test Plan                                                                                                                                                                                |
| Ruta            | `docs/specs/017-bank-reconciliation/test-plan.md`                                                                                                                                        |
| Versión         | 0.1                                                                                                                                                                                      |
| Estado          | Borrador inicial                                                                                                                                                                         |
| Fecha           | 2026-07-21                                                                                                                                                                               |
| Documento base  | `docs/specs/017-bank-reconciliation/spec.md`                                                                                                                                             |
| Plan técnico    | `docs/specs/017-bank-reconciliation/plan.md`                                                                                                                                             |
| Modelo de datos | `docs/specs/017-bank-reconciliation/data-model.md`                                                                                                                                       |
| Contrato API    | `docs/specs/017-bank-reconciliation/api-contract.md`                                                                                                                                     |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage` |
| Naturaleza      | Tenant-scoped / Financial-control / Import-driven / Match-aware / Exception-aware / Audit-heavy / Non-public                                                                             |

---

## 2. Propósito

Este documento define la estrategia de pruebas para el módulo `017-bank-reconciliation`.

El objetivo es validar que la conciliación bancaria funcione correctamente desde el punto de vista funcional, financiero, técnico, multitenant, de seguridad, auditoría, integración y regresión.

Regla central:

```text id="amr6mx"
Bank Reconciliation debe probarse como un módulo financiero crítico: ningún test debe permitir cross-tenant, duplicación de movimientos, conciliación de pagos inválidos, exposición de datos bancarios completos, uso de float para dinero, candidatos con efectos financieros, matches sin auditoría, sesiones cerradas modificables o endpoints públicos.
```

---

## 3. Objetivos de prueba

Las pruebas deben verificar:

```text id="l1whfs"
- gestión segura de cuentas bancarias;
- protección de número de cuenta;
- importación CSV/XLSX;
- integración con Secure Document Storage;
- validación de archivos;
- normalización de movimientos;
- fingerprint determinístico;
- detección de duplicados;
- creación de sesiones de conciliación;
- generación determinística de candidatos;
- scoring explicable;
- aceptación y rechazo de candidatos;
- confirmación manual de matches;
- match 1:1;
- match 1:N;
- match N:1;
- diferencias con razón obligatoria;
- reverso de matches;
- excepciones;
- cierre y reapertura de sesiones;
- integración con Payments;
- integración con Account Statements;
- reportes básicos;
- auditoría financiera;
- observabilidad segura;
- multitenancy;
- autorización por permisos;
- ausencia de endpoints públicos;
- ausencia de datos bancarios sensibles en logs/auditoría.
```

---

## 4. Alcance de pruebas

### 4.1. Incluido

```text id="d3sonj"
1. Unit tests.
2. Domain tests.
3. Value object tests.
4. State machine tests.
5. Parser tests.
6. Fingerprint tests.
7. Duplicate detection tests.
8. Scoring tests.
9. Service tests.
10. Repository tests.
11. Integration tests.
12. API tests.
13. Authorization tests.
14. Multitenancy tests.
15. Financial integrity tests.
16. Import tests.
17. Matching tests.
18. Exception tests.
19. Session lifecycle tests.
20. Secure Document Storage integration tests.
21. Payments integration tests.
22. Account Statements integration tests.
23. Reports tests.
24. Audit tests.
25. Observability tests.
26. OpenAPI tests.
27. Security tests.
28. Performance tests.
29. Concurrency tests.
30. Smoke tests.
31. CI/CD gates.
```

---

### 4.2. Fuera de alcance

No probar en este módulo como funcionalidad implementada:

```text id="vxqfjs"
- Open Banking real;
- APIs bancarias reales;
- scraping bancario;
- OCR de PDFs bancarios;
- IA con datos financieros reales;
- conciliación automática irreversible;
- contabilidad completa;
- asientos contables;
- plan de cuentas;
- pasarelas de pago;
- multi-moneda avanzada;
- reglas contables avanzadas;
- integración SRI;
- libros contables oficiales;
- firma electrónica;
- certificación legal de estados bancarios.
```

Estos elementos deben probarse únicamente como feature flags desactivados o rutas inexistentes.

---

## 5. Estrategia general

### 5.1. Capas de prueba

```text id="is8922"
Unit tests
  ↓
Domain tests
  ↓
Repository tests
  ↓
Service tests
  ↓
Integration tests
  ↓
API tests
  ↓
Security tests
  ↓
Smoke tests
  ↓
CI/CD gates
```

---

### 5.2. Prioridad de pruebas

| Prioridad | Tipo                  | Motivo                                    |
| --------- | --------------------- | ----------------------------------------- |
| P0        | Multitenancy          | Evitar exposición financiera cross-tenant |
| P0        | Integridad financiera | Evitar conciliaciones erróneas            |
| P0        | Seguridad             | Evitar exposición bancaria                |
| P0        | Payments integration  | Evitar estado financiero inconsistente    |
| P0        | Duplicate detection   | Evitar movimientos duplicados             |
| P1        | API contract          | Garantizar estabilidad                    |
| P1        | Importación           | Garantizar carga correcta                 |
| P1        | Matching              | Garantizar propuestas confiables          |
| P1        | Auditoría             | Garantizar trazabilidad                   |
| P2        | Performance           | Garantizar operación razonable            |
| P2        | Reportes              | Garantizar consulta administrativa        |

---

## 6. Datos de prueba

### 6.1. Tenants

```text id="piq2iv"
tenantA
tenantB
tenantSuspended
tenantArchived
```

---

### 6.2. Usuarios

```text id="geig0q"
platformAdmin
tenantAdminA
financialManagerA
accountantA
boardMemberA
residentA
ownerA
unauthorizedUserA
financialManagerB
disabledUserA
userWithoutMembership
```

---

### 6.3. Cuentas bancarias

```text id="dg7ibr"
bankAccountMainA
bankAccountSecondaryA
bankAccountInactiveA
bankAccountArchivedA
bankAccountCashA
bankAccountTenantB
```

---

### 6.4. Archivos de importación

```text id="hztfnl"
bankStatementCsvValidSmall
bankStatementCsvValidMedium
bankStatementCsvWithInvalidRows
bankStatementCsvWithDuplicates
bankStatementCsvUnsupportedCurrency
bankStatementCsvEmpty
bankStatementCsvMalformed
bankStatementXlsxValidSmall
bankStatementXlsxWithInvalidRows
bankStatementInvalidMime
bankStatementOversized
bankStatementDuplicateFile
```

---

### 6.5. Movimientos bancarios

```text id="w4a6kf"
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
bankTransactionArchivedA
bankTransactionTenantB
```

---

### 6.6. Pagos

```text id="h9lwyp"
paymentConfirmedA
paymentPartiallyAllocatedA
paymentAllocatedA
paymentRejectedA
paymentCancelledA
paymentReversedA
paymentArchivedA
paymentAlreadyReconciledA
paymentPendingValidationA
paymentTenantB
```

---

### 6.7. Sesiones

```text id="kcxap9"
reconciliationSessionDraftA
reconciliationSessionOpenA
reconciliationSessionReviewingA
reconciliationSessionClosedA
reconciliationSessionReopenedA
reconciliationSessionArchivedA
reconciliationSessionTenantB
```

---

### 6.8. Candidatos

```text id="fxgsov"
reconciliationCandidateHighA
reconciliationCandidateMediumA
reconciliationCandidateLowA
reconciliationCandidateRejectedA
reconciliationCandidateExpiredA
reconciliationCandidateSupersededA
reconciliationCandidateTenantB
```

---

### 6.9. Matches

```text id="wa9ioj"
reconciliationMatchOneToOneA
reconciliationMatchOneToManyA
reconciliationMatchManyToOneA
reconciliationMatchManualA
reconciliationMatchWithDifferenceA
reconciliationMatchReversedA
reconciliationMatchArchivedA
reconciliationMatchTenantB
```

---

### 6.10. Excepciones

```text id="nvofut"
reconciliationExceptionUnknownDepositA
reconciliationExceptionAmountMismatchA
reconciliationExceptionPaymentWithoutBankTransactionA
reconciliationExceptionBankFeeA
reconciliationExceptionCriticalOpenA
reconciliationExceptionResolvedA
reconciliationExceptionIgnoredA
reconciliationExceptionArchivedA
reconciliationExceptionTenantB
```

---

## 7. Reglas de datos ficticios

Los tests, fixtures y seeds no deben usar:

```text id="xv1ncl"
- números reales de cuenta;
- archivos bancarios reales;
- referencias bancarias reales;
- comprobantes reales;
- nombres reales;
- emails reales;
- teléfonos reales;
- cédulas reales;
- datos financieros reales;
- storageKeys reales;
- URLs firmadas reales;
- tokens;
- cookies;
- secretos;
- dumps productivos;
- exports reales de bancos.
```

Todos los datos deben ser sintéticos.

---

# 8. Unit tests — Value Objects

## 8.1. `BankAccountNumber`

Debe probar:

```text id="f40x3g"
- acepta número válido sintético;
- rechaza vacío;
- rechaza caracteres no permitidos;
- normaliza espacios y guiones;
- genera accountNumberMasked;
- genera accountNumberHash;
- no devuelve número completo en serialización;
- no permite guardar número completo en metadata;
- mismo número normalizado genera mismo hash con mismo pepper;
- mismo número con distinto tenantScopedPepper genera hash distinto.
```

---

## 8.2. `MoneyDecimal`

Debe probar:

```text id="iv8w6y"
- acepta string decimal "0.01";
- acepta string decimal "125.50";
- rechaza number;
- rechaza float;
- rechaza NaN;
- rechaza negativo;
- rechaza más de dos decimales si política lo exige;
- suma exacta;
- resta exacta;
- compara exacto;
- calcula differenceAmount exacto;
- no usa JavaScript number internamente para cálculos financieros.
```

---

## 8.3. `BankTransactionFingerprint`

Debe probar:

```text id="qgmoxd"
- mismo input canónico genera mismo fingerprint;
- cambios en amount generan fingerprint distinto;
- cambios en direction generan fingerprint distinto;
- cambios en bankAccountId generan fingerprint distinto;
- cambios en tenantId generan fingerprint distinto;
- espacios extra no cambian fingerprint después de normalización;
- mayúsculas/minúsculas no cambian fingerprint si la canonicalización lo define;
- referencia nula y referencia vacía se normalizan consistentemente;
- fingerprint no se acepta desde cliente.
```

---

## 8.4. `ReconciliationScore`

Debe probar:

```text id="dtusq1"
- score mínimo 0;
- score máximo 100;
- score alto asigna `high`;
- score medio asigna `medium`;
- score bajo asigna `low`;
- score inferior a umbral asigna `ignored`;
- scoreReason requerido;
- scoreReason no contiene datos sensibles completos.
```

---

## 8.5. `ReconciliationPeriod`

Debe probar:

```text id="wmzt1s"
- periodStart <= periodEnd;
- rechaza periodo inválido;
- acepta periodo mensual;
- acepta periodo personalizado;
- normaliza fechas;
- no acepta fechas vacías.
```

---

# 9. Unit tests — Entidades de dominio

## 9.1. `BankAccount`

Debe probar:

```text id="lj5ho7"
- creación en estado draft;
- activación draft -> active;
- desactivación active -> inactive;
- reactivación inactive -> active;
- archivo draft -> archived;
- archivo active -> archived;
- archivo inactive -> archived;
- rechaza archived -> active;
- requiere bankName;
- requiere accountName;
- requiere accountNumberMasked;
- requiere accountNumberHash;
- requiere accountType;
- requiere currency USD;
- no serializa accountNumberHash;
- no serializa número completo.
```

---

## 9.2. `BankStatementImport`

Debe probar:

```text id="mcgj8k"
- creación en estado uploaded;
- uploaded -> validating;
- validating -> validated;
- validating -> failed;
- validated -> processing;
- processing -> processed;
- processing -> processedWithWarnings;
- processing -> failed;
- validated -> cancelled;
- processed -> archived;
- cancelled -> archived;
- rechaza processed -> processing;
- rechaza archived -> processing;
- requiere bankAccountId;
- requiere secureDocumentId después de upload;
- requiere secureDocumentFileId después de upload;
- requiere fileHash;
- requiere hashAlgorithm SHA-256;
- requiere periodStart <= periodEnd;
- conteos no negativos.
```

---

## 9.3. `BankStatementImportError`

Debe probar:

```text id="ai7h8c"
- crea error con rowNumber válido;
- rechaza rowNumber <= 0;
- requiere errorCode;
- requiere errorMessage;
- requiere severity;
- trunca rawRowPreview;
- sanitiza rawRowPreview;
- no permite storageKey;
- no permite archivo completo;
- no permite accountNumber completo.
```

---

## 9.4. `BankTransaction`

Debe probar:

```text id="vwnbon"
- creación en estado pending;
- pending -> candidateFound;
- pending -> unmatched;
- pending -> matched;
- pending -> duplicate;
- pending -> ignored;
- pending -> exception;
- candidateFound -> matched;
- candidateFound -> unmatched;
- matched -> partiallyMatched;
- matched -> unmatched al revertir;
- duplicate no conciliable por defecto;
- ignored no conciliable por defecto;
- archived no conciliable;
- requiere amount > 0;
- requiere currency USD;
- requiere fingerprint;
- requiere direction;
- no permite fingerprint desde cliente.
```

---

## 9.5. `ReconciliationSession`

Debe probar:

```text id="j2wgrz"
- creación en estado draft;
- draft -> open;
- open -> reviewing;
- reviewing -> closed;
- closed -> reopened;
- reopened -> reviewing;
- closed -> archived;
- rechaza closed -> open sin reopen;
- rechaza archived -> reviewing;
- requiere bankAccountId;
- requiere periodStart <= periodEnd;
- closed bloquea cambios ordinarios;
- reopen requiere razón;
- close requiere razón;
- close puede bloquear excepciones high/critical abiertas.
```

---

## 9.6. `ReconciliationCandidate`

Debe probar:

```text id="k0m4av"
- creación en estado suggested;
- suggested -> accepted;
- suggested -> rejected;
- suggested -> expired;
- suggested -> superseded;
- accepted -> superseded;
- rejected -> archived;
- score entre 0 y 100;
- scoreReason requerido;
- candidate no modifica Payment;
- candidate no modifica BankTransaction;
- reject requiere razón.
```

---

## 9.7. `ReconciliationMatch`

Debe probar:

```text id="dj4r30"
- creación confirmed;
- confirmed -> reversed;
- confirmed -> archived;
- reversed -> archived;
- rechaza reversed -> confirmed;
- requiere matchType;
- requiere totalBankAmount;
- requiere totalPaymentAmount;
- calcula differenceAmount;
- requiere differenceReason si differenceAmount != 0.00;
- reverse requiere reverseReason;
- no elimina items al revertir;
- no permite modificación posterior de items salvo flujo controlado.
```

---

## 9.8. `ReconciliationMatchItem`

Debe probar:

```text id="vzfxki"
- itemType bankTransaction requiere bankTransactionId;
- itemType payment requiere paymentId;
- amountApplied > 0;
- currency USD;
- no acepta amountApplied number;
- no acepta amountApplied negativo;
- pertenece a reconciliationMatch;
- no se modifica después de confirmación.
```

---

## 9.9. `ReconciliationException`

Debe probar:

```text id="gkyq95"
- creación en estado open;
- open -> inReview;
- open -> resolved;
- inReview -> resolved;
- open -> ignored;
- resolved -> archived;
- ignored -> archived;
- requiere exceptionType;
- requiere severity;
- requiere description;
- resolved requiere resolutionNotes;
- ignored requiere ignoreReason;
- high/critical open puede bloquear cierre;
- debe vincular bankTransactionId o paymentId salvo excepción general documentada.
```

---

# 10. Parser tests

## 10.1. CSV parser

Debe probar:

```text id="xu2icb"
- parsea CSV válido;
- rechaza CSV vacío;
- rechaza CSV malformado;
- detecta columnas faltantes;
- parsea transactionDate;
- parsea postedDate opcional;
- parsea description;
- parsea reference;
- parsea bankReference;
- parsea direction credit;
- parsea direction debit;
- parsea amount como Decimal string;
- parsea currency USD;
- parsea balanceAfter opcional;
- rechaza amount inválido;
- rechaza currency no soportada;
- conserva rowNumber;
- genera errores por fila;
- no registra fila completa sensible.
```

---

## 10.2. XLSX parser

Debe probar:

```text id="v9967d"
- parsea XLSX válido;
- rechaza XLSX vacío;
- rechaza archivo corrupto;
- detecta hoja faltante;
- detecta columnas faltantes;
- parsea fechas desde celdas tipo fecha;
- parsea fechas desde strings;
- parsea montos;
- parsea currency;
- registra errores por fila;
- no carga hojas no esperadas si política lo bloquea;
- no expone contenido completo en errores.
```

---

## 10.3. Template tests

Debe probar:

```text id="x2bltd"
- genericCsv funciona;
- genericXlsx funciona;
- templateKey inválido rechaza;
- template mismatch rechaza;
- columnas alias se normalizan si se permite;
- plantilla bancaria futura no habilitada retorna error controlado.
```

---

# 11. Normalization tests

Debe probar:

```text id="ketjad"
- normaliza descripción con espacios extra;
- normaliza referencias;
- normaliza bankReference;
- normaliza direction;
- normaliza currency;
- normaliza amount a string decimal con 2 decimales;
- normaliza fechas;
- mantiene nulls consistentes;
- elimina caracteres invisibles;
- no destruye información necesaria para matching;
- produce input canónico estable.
```

---

# 12. Fingerprint y duplicados

## 12.1. Fingerprint

Debe probar:

```text id="g5tpkj"
- fingerprint se calcula en servidor;
- fingerprint no se acepta desde body;
- fingerprint no se acepta desde archivo como fuente de verdad;
- fingerprint cambia si cambia monto;
- fingerprint cambia si cambia cuenta;
- fingerprint cambia si cambia tenant;
- fingerprint cambia si cambia fecha;
- fingerprint cambia si cambia dirección;
- fingerprint estable con variaciones irrelevantes normalizadas.
```

---

## 12.2. Duplicados en mismo archivo

Debe probar:

```text id="uqv4eb"
- dos filas iguales generan un movimiento y un duplicado;
- duplicateRows se incrementa;
- movimiento duplicado queda status duplicate;
- movimiento duplicado no es conciliable;
- auditoría registra duplicateDetected;
- import queda processedWithWarnings si corresponde.
```

---

## 12.3. Duplicados entre archivos

Debe probar:

```text id="r33x9k"
- reimportar mismos movimientos no duplica;
- fingerprint existente bloquea duplicación;
- duplicateRows se incrementa;
- createdTransactions no se incrementa para duplicados;
- response idempotente o 409 según política;
- no falla todo el archivo si allowPartialProcessing=true.
```

---

## 12.4. Archivo duplicado

Debe probar:

```text id="vk263k"
- mismo fileHash en misma cuenta retorna 409 o respuesta idempotente;
- mismo fileHash en otra cuenta del mismo tenant se maneja según política;
- mismo fileHash en tenant B no afecta tenant A;
- storageKey no se expone.
```

---

# 13. Repository tests

## 13.1. `PrismaBankAccountRepository`

```text id="r6fgmz"
- create bankAccount;
- find by tenant;
- list paginated;
- update metadata;
- activate;
- deactivate;
- archive;
- one default active per tenant;
- tenant A no ve bankAccount tenant B;
- no findUnique by id simple.
```

---

## 13.2. `PrismaBankStatementImportRepository`

```text id="ke9bda"
- create import;
- find by tenant;
- list by bankAccount;
- update status;
- update counts;
- cancel;
- archive;
- duplicate fileHash constraint;
- tenant A no ve import tenant B;
- secureDocumentId cross-tenant rechazado por servicio.
```

---

## 13.3. `PrismaBankStatementImportErrorRepository`

```text id="hvmsri"
- create error;
- bulk create errors;
- list by import;
- filter by severity;
- filter by errorCode;
- tenant A no ve errors tenant B;
- rawRowPreview sanitizado.
```

---

## 13.4. `PrismaBankTransactionRepository`

```text id="upv2x6"
- create transaction;
- bulk create transactions;
- find by tenant;
- list pending;
- filter by status;
- filter by date;
- filter by amount;
- mark duplicate;
- mark matched;
- mark partiallyMatched;
- mark unmatched;
- ignore;
- archive;
- duplicate fingerprint constraint;
- tenant A no ve transaction tenant B.
```

---

## 13.5. `PrismaReconciliationSessionRepository`

```text id="zke6l5"
- create session;
- list sessions;
- get summary;
- open;
- close;
- reopen;
- archive;
- unique active session per account/period;
- closed blocks writes by service;
- tenant A no ve session tenant B.
```

---

## 13.6. `PrismaReconciliationCandidateRepository`

```text id="r9i1vz"
- create candidate;
- bulk create candidates;
- list by session;
- filter by scoreBand;
- filter by status;
- accept candidate;
- reject candidate;
- expire candidate;
- unique active pair;
- tenant A no ve candidate tenant B.
```

---

## 13.7. `PrismaReconciliationMatchRepository`

```text id="zv6bw4"
- create match;
- create match items;
- list by session;
- get match with items;
- reverse match;
- archive match;
- idempotencyKey unique;
- tenant A no ve match tenant B;
- tenant A no ve match items tenant B.
```

---

## 13.8. `PrismaReconciliationExceptionRepository`

```text id="uuegp1"
- create exception;
- list by session;
- filter by severity;
- filter by status;
- update exception;
- resolve;
- ignore;
- archive;
- list open high/critical;
- tenant A no ve exception tenant B.
```

---

# 14. Service tests

## 14.1. `BankAccountService`

```text id="m0t27c"
- crea cuenta;
- enmascara número;
- genera hash;
- no devuelve número completo;
- no devuelve hash;
- activa cuenta;
- desactiva cuenta;
- archiva cuenta;
- bloquea archivo con sesiones abiertas si política aplica;
- audita eventos;
- sanitiza metadata.
```

---

## 14.2. `BankStatementImportService`

```text id="e130pr"
- valida cuenta activa;
- carga archivo en Secure Document Storage;
- registra secureDocumentId;
- registra secureDocumentFileId;
- calcula hashPrefix;
- crea import uploaded;
- valida import;
- procesa import;
- actualiza conteos;
- registra errores;
- maneja processedWithWarnings;
- maneja failed;
- cancela import no procesada;
- archiva import;
- audita eventos.
```

---

## 14.3. `BankTransactionNormalizationService`

```text id="ffcw2n"
- normaliza filas válidas;
- rechaza filas inválidas;
- produce preview sanitizado;
- produce canonical input;
- no filtra datos sensibles a logs.
```

---

## 14.4. `BankTransactionFingerprintService`

```text id="x73wqe"
- calcula SHA-256;
- usa input canónico;
- no acepta fingerprint externo;
- genera hash determinístico;
- detecta duplicados.
```

---

## 14.5. `ReconciliationScoringService`

```text id="hgicet"
- score alto para monto exacto y fecha cercana;
- score medio con referencia parcial;
- score bajo con datos débiles;
- no sugiere bajo minScore;
- penaliza monto diferente;
- penaliza fecha fuera de tolerancia;
- rechaza pago no conciliable;
- rechaza movimiento no conciliable;
- scoreReason explicable;
- scoreReason sanitizado.
```

---

## 14.6. `ReconciliationCandidateService`

```text id="c57tmf"
- genera candidatos;
- no duplica candidatos activos;
- no modifica Payment;
- no confirma matches;
- marca candidateFound solo si política lo permite;
- acepta candidato;
- rechaza candidato;
- expira candidato;
- audita eventos.
```

---

## 14.7. `ReconciliationMatchService`

```text id="ojq9tr"
- crea match 1:1;
- crea match 1:N;
- crea match N:1;
- calcula totalBankAmount;
- calcula totalPaymentAmount;
- calcula differenceAmount;
- exige differenceReason cuando aplica;
- actualiza BankTransaction status;
- actualiza Payment reconciliationStatus;
- no permite pagos no conciliables;
- no permite movimientos no conciliables;
- no permite session closed;
- usa transacción DB;
- audita confirmación.
```

---

## 14.8. `ReconciliationMatchReversalService`

```text id="xb0hni"
- revierte match confirmed;
- exige reverseReason;
- no elimina match;
- no elimina items;
- restaura BankTransaction status;
- restaura Payment reconciliationStatus;
- no revierte match ya reversed;
- no revierte cross-tenant;
- audita reverso.
```

---

## 14.9. `ReconciliationExceptionService`

```text id="fc6khl"
- crea excepción;
- valida session abierta;
- valida bankTransaction tenant-scoped;
- valida payment tenant-scoped;
- actualiza excepción;
- resuelve con resolutionNotes;
- ignora con reason;
- archiva;
- bloquea cierre con high/critical abiertas.
```

---

## 14.10. `ReconciliationReportService`

```text id="vznazw"
- genera summary;
- lista unmatched bank transactions;
- lista unmatched payments;
- lista exceptions;
- lista bank account balances;
- exporta reporte si aplica;
- no expone número completo de cuenta;
- no expone storageKey;
- no expone referencias completas sensibles.
```

---

# 15. Integration tests

## 15.1. Integración con `016-secure-document-storage`

Debe probar:

```text id="td2n6y"
- upload de archivo importado crea secureDocument;
- upload de archivo importado crea secureDocumentFile;
- sourceModule = bankReconciliation;
- sourceResourceType = bankStatementImport;
- sensitivity = restricted;
- visibility = administrative;
- storageKey no se expone;
- descarga del archivo importado requiere permiso documental/financiero;
- archivo importado no es accesible desde /me;
- archivo importado no es accesible desde /public;
- audit documental se registra.
```

---

## 15.2. Integración con `005-payments`

Debe probar:

```text id="kdjyqa"
- encuentra pagos conciliables confirmed;
- encuentra pagos conciliables partiallyAllocated;
- encuentra pagos conciliables allocated;
- rechaza payment rejected;
- rechaza payment cancelled;
- rechaza payment reversed;
- rechaza payment archived;
- rechaza payment pendingValidation;
- rechaza payment tenant B;
- match confirmado actualiza reconciliationStatus;
- match parcial actualiza partiallyReconciled;
- reverso restaura estado;
- no modifica allocations;
- no modifica charges;
- audita integración.
```

---

## 15.3. Integración con `006-account-statements`

Debe probar:

```text id="yu1tib"
- estado de cuenta no se reconstruye desde bankTransactions;
- account statement puede mostrar estado conciliado de Payment;
- movimientos bancarios no modifican balance directamente;
- pagos no conciliados siguen apareciendo si corresponde;
- reversal actualiza estado visible del pago.
```

---

## 15.4. Integración con `008-basic-reports`

Debe probar:

```text id="thged0"
- reportes básicos reciben datos de conciliación;
- summary report funciona;
- unmatched bank transactions report funciona;
- unmatched payments report funciona;
- exceptions report funciona;
- export usa Secure Document Storage si persiste archivo;
- reportes no exponen datos bancarios completos.
```

---

## 15.5. Integración con `007-audit`

Debe probar:

```text id="ymapwh"
- bankAccount.created auditado;
- bankStatementImport.processed auditado;
- bankTransaction.markedDuplicate auditado;
- reconciliationCandidate.generated auditado;
- reconciliationMatch.confirmed auditado;
- reconciliationMatch.reversed auditado;
- reconciliationException.created auditado;
- reconciliationSession.closed auditado;
- audit metadata sanitizada;
- audit sin accountNumber completo;
- audit sin storageKey;
- audit sin archivo completo.
```

---

# 16. API tests

## 16.1. Cuentas bancarias

```text id="jvif2f"
GET /tenant/bank-accounts retorna lista paginada;
POST /tenant/bank-accounts crea cuenta;
POST rechaza tenantId;
POST rechaza accountNumberHash;
POST no retorna accountNumber completo;
GET /tenant/bank-accounts/{id} retorna cuenta;
PATCH actualiza metadata permitida;
PATCH rechaza status directo;
POST /activate activa cuenta;
POST /deactivate desactiva cuenta;
POST /archive archiva cuenta;
tenant A no accede cuenta tenant B.
```

---

## 16.2. Importaciones

```text id="zvz2lc"
GET /tenant/bank-statement-imports lista imports;
POST /tenant/bank-accounts/{id}/statement-imports sube CSV;
POST sube XLSX;
POST rechaza cuenta inactive;
POST rechaza cuenta archived;
POST rechaza archivo vacío;
POST rechaza MIME no permitido;
POST rechaza storageKey;
POST crea secureDocumentId;
POST crea secureDocumentFileId;
GET /tenant/bank-statement-imports/{id} obtiene import;
POST /validate valida import;
POST /process procesa import;
POST /process rechaza import processed;
POST /cancel cancela import no procesada;
POST /archive archiva import;
GET /errors lista errores;
tenant A no accede import tenant B.
```

---

## 16.3. Movimientos bancarios

```text id="m3164i"
GET /tenant/bank-transactions lista movimientos;
GET filtros por bankAccountId;
GET filtros por status;
GET filtros por date;
GET filtros por amount;
GET no expone fingerprint;
GET no expone referencia sensible completa si policy lo restringe;
GET /tenant/bank-transactions/{id} obtiene movimiento;
PATCH /classification actualiza tipo;
POST /ignore ignora movimiento;
POST /archive archiva movimiento;
tenant A no accede movimiento tenant B.
```

---

## 16.4. Sesiones

```text id="krc8bw"
GET /tenant/reconciliation-sessions lista sesiones;
POST crea sesión;
POST rechaza cuenta inactive;
POST rechaza periodo inválido;
POST rechaza sesión activa duplicada;
GET /tenant/reconciliation-sessions/{id} obtiene sesión;
PATCH actualiza balances permitidos;
PATCH rechaza sesión closed;
POST /open abre sesión;
POST /close cierra sesión;
POST /close bloquea high/critical abiertas;
POST /reopen reabre sesión cerrada;
POST /reopen exige reason;
POST /archive archiva sesión;
GET /summary retorna resumen;
tenant A no accede sesión tenant B.
```

---

## 16.5. Candidatos

```text id="vvmgr7"
GET /tenant/reconciliation-sessions/{id}/candidates lista candidatos;
POST /candidates/generate genera candidatos;
POST /generate rechaza sesión closed;
POST /generate no modifica Payment;
POST /generate no confirma match;
GET /tenant/reconciliation-candidates/{id} obtiene candidato;
POST /accept acepta candidato;
POST /accept crea match confirmado si decisión MVP aplica;
POST /reject rechaza candidato;
POST /reject exige reason;
tenant A no accede candidate tenant B.
```

---

## 16.6. Matches

```text id="hnbx8q"
GET /tenant/reconciliation-sessions/{id}/matches lista matches;
POST /matches crea match 1:1;
POST /matches crea match 1:N;
POST /matches crea match N:1;
POST /matches rechaza session closed;
POST /matches rechaza payment rejected;
POST /matches rechaza payment reversed;
POST /matches rechaza bankTransaction duplicate;
POST /matches rechaza diferencia sin reason;
POST /matches calcula totales en servidor;
GET /tenant/reconciliation-matches/{id} obtiene match;
POST /confirm confirma si flujo aplica;
POST /reverse revierte match;
POST /reverse exige reason;
POST /archive archiva match;
tenant A no accede match tenant B.
```

---

## 16.7. Excepciones

```text id="z0txz5"
GET /tenant/reconciliation-sessions/{id}/exceptions lista excepciones;
POST crea excepción;
POST rechaza session closed;
POST rechaza bankTransaction tenant B;
POST rechaza payment tenant B;
GET /tenant/reconciliation-exceptions/{id} obtiene excepción;
PATCH actualiza excepción abierta;
POST /resolve resuelve excepción;
POST /resolve exige resolutionNotes;
POST /ignore ignora excepción;
POST /ignore exige reason;
POST /archive archiva excepción;
tenant A no accede excepción tenant B.
```

---

## 16.8. Reportes

```text id="j2ye0q"
GET /reconciliation-reports/summary retorna resumen;
GET /unmatched-bank-transactions retorna movimientos no conciliados;
GET /unmatched-payments retorna pagos no conciliados;
GET /exceptions retorna excepciones;
GET /bank-account-balances retorna saldos importados;
GET /export genera export;
export persistido usa Secure Document Storage;
reportes no exponen accountNumber completo;
reportes no exponen storageKey;
reportes no exponen referencias sensibles completas.
```

---

# 17. Authorization tests

## 17.1. Autenticación

```text id="ccn9tj"
- sin token retorna 401;
- token inválido retorna 401;
- usuario disabled retorna 403;
- usuario sin membership retorna 403;
- tenant suspended retorna 403 o bloqueo operativo según política;
- tenant archived retorna 403 o bloqueo operativo según política.
```

---

## 17.2. Permisos de cuentas bancarias

```text id="imjqeo"
- sin bankAccounts.read no lista;
- sin bankAccounts.create no crea;
- sin bankAccounts.update no actualiza;
- sin bankAccounts.activate no activa;
- sin bankAccounts.deactivate no desactiva;
- sin bankAccounts.archive no archiva.
```

---

## 17.3. Permisos de importaciones

```text id="n60gm9"
- sin bankStatementImports.read no consulta;
- sin bankStatementImports.create no importa;
- sin bankStatementImports.process no valida;
- sin bankStatementImports.process no procesa;
- sin bankStatementImports.cancel no cancela;
- sin bankStatementImports.archive no archiva.
```

---

## 17.4. Permisos de movimientos

```text id="jdinn8"
- sin bankTransactions.read no lista;
- sin bankTransactions.updateClassification no reclasifica;
- sin bankTransactions.ignore no ignora;
- sin bankTransactions.archive no archiva.
```

---

## 17.5. Permisos de sesiones

```text id="wst2c6"
- sin reconciliationSessions.create no crea;
- sin reconciliationSessions.read no consulta;
- sin reconciliationSessions.update no actualiza/abre;
- sin reconciliationSessions.close no cierra;
- sin reconciliationSessions.reopen no reabre;
- sin reconciliationSessions.archive no archiva.
```

---

## 17.6. Permisos de candidatos

```text id="ky88ij"
- sin reconciliationCandidates.generate no genera;
- sin reconciliationCandidates.read no consulta;
- sin reconciliationCandidates.accept no acepta;
- sin reconciliationCandidates.reject no rechaza.
```

---

## 17.7. Permisos de matches

```text id="hplgq2"
- sin reconciliationMatches.create no crea match;
- sin reconciliationMatches.read no consulta;
- sin reconciliationMatches.confirm no confirma;
- sin reconciliationMatches.reverse no revierte;
- sin reconciliationMatches.archive no archiva.
```

---

## 17.8. Permisos de excepciones

```text id="nn5o7e"
- sin reconciliationExceptions.create no crea;
- sin reconciliationExceptions.read no consulta;
- sin reconciliationExceptions.update no actualiza;
- sin reconciliationExceptions.resolve no resuelve;
- sin reconciliationExceptions.ignore no ignora;
- sin reconciliationExceptions.archive no archiva.
```

---

## 17.9. Permisos de reportes

```text id="b1x17v"
- sin reconciliationReports.read no consulta reportes;
- sin reconciliationReports.export no exporta;
- sin reconciliation.audit.read no consulta auditoría relacionada.
```

---

## 17.10. PlatformAdmin

Debe probar:

```text id="l482mh"
- PlatformAdmin no accede automáticamente a cuentas bancarias tenant;
- PlatformAdmin no descarga archivos bancarios tenant sin permiso excepcional;
- PlatformAdmin no consulta movimientos bancarios tenant sin contexto/permiso;
- cualquier acceso excepcional queda auditado.
```

---

# 18. Multitenancy tests

## 18.1. Entidades principales

```text id="i41pqz"
tenant A no ve bankAccount tenant B;
tenant A no ve bankStatementImport tenant B;
tenant A no ve bankStatementImportError tenant B;
tenant A no ve bankTransaction tenant B;
tenant A no ve reconciliationSession tenant B;
tenant A no ve reconciliationCandidate tenant B;
tenant A no ve reconciliationMatch tenant B;
tenant A no ve reconciliationMatchItem tenant B;
tenant A no ve reconciliationException tenant B.
```

---

## 18.2. Referencias cruzadas

```text id="ltoz4o"
tenant A no usa bankAccountId tenant B;
tenant A no usa statementImportId tenant B;
tenant A no usa bankTransactionId tenant B;
tenant A no usa reconciliationSessionId tenant B;
tenant A no usa candidateId tenant B;
tenant A no usa matchId tenant B;
tenant A no usa exceptionId tenant B;
tenant A no usa paymentId tenant B;
tenant A no usa secureDocumentId tenant B;
tenant A no usa secureDocumentFileId tenant B;
tenant A no usa duplicateOfTransactionId tenant B.
```

---

## 18.3. Reports cross-tenant

```text id="l2n4q2"
- summary report solo cuenta datos tenant A;
- unmatched bank transactions no incluye tenant B;
- unmatched payments no incluye tenant B;
- exceptions report no incluye tenant B;
- bank account balances no incluye tenant B;
- export no incluye tenant B.
```

---

## 18.4. Respuesta esperada

Para referencias cross-tenant:

```text id="ozum2k"
404 recomendado
403 permitido si la política es consistente
nunca incluir detalles del recurso externo
```

---

# 19. Financial integrity tests

## 19.1. Decimal

```text id="i6bsg8"
- todos los montos se reciben como string;
- API rechaza number para money si validator lo permite;
- service usa Decimal;
- suma 0.10 + 0.20 = 0.30 exacto;
- differenceAmount exacto;
- amountTolerance MVP = 0.00;
- no uso de float/double en dominio financiero.
```

---

## 19.2. Match 1:1

```text id="rapvjl"
- bankTransaction 125.50 + payment 125.50 confirma;
- totalBankAmount = 125.50;
- totalPaymentAmount = 125.50;
- differenceAmount = 0.00;
- bankTransaction.status = matched;
- payment.reconciliationStatus = reconciled;
- audit emitido.
```

---

## 19.3. Match 1:N

```text id="w4tbad"
- bankTransaction 300.00 contra payments 100+100+100;
- totalBankAmount = 300.00;
- totalPaymentAmount = 300.00;
- differenceAmount = 0.00;
- bankTransaction.status = matched;
- todos los payments reconciliationStatus = reconciled;
- items correctos.
```

---

## 19.4. Match N:1

```text id="qzupax"
- bankTransactions 50+75 contra payment 125;
- totalBankAmount = 125.00;
- totalPaymentAmount = 125.00;
- differenceAmount = 0.00;
- movimientos status matched;
- payment reconciliationStatus = reconciled;
- items correctos.
```

---

## 19.5. Diferencia

```text id="cvcpiz"
- bankTransaction 125.50 contra payment 125.00 genera differenceAmount 0.50;
- sin differenceReason retorna 422;
- con differenceReason confirma si política lo permite;
- audit incluye differenceAmount;
- audit no incluye datos sensibles completos.
```

---

## 19.6. Reverso

```text id="c47yx3"
- reverse match confirmed requiere reason;
- match.status = reversed;
- reversedAt seteado;
- reversedBy derivado del token;
- items permanecen;
- bankTransaction vuelve a pending/unmatched según política;
- payment.reconciliationStatus vuelve a pending/reconciliationReversed según política;
- audit emitido.
```

---

## 19.7. Pagos no conciliables

```text id="axntbf"
- rejected no conciliable;
- cancelled no conciliable;
- reversed no conciliable;
- archived no conciliable;
- pendingValidation no conciliable;
- alreadyReconciled no conciliable salvo reverso/reconciliación explícita futura.
```

---

# 20. Import workflow tests

## 20.1. Importación válida

```text id="mqoxvb"
- cuenta active;
- CSV válido;
- archivo se guarda;
- import status uploaded;
- validate status validated;
- process status processed;
- createdTransactions = totalRows;
- invalidRows = 0;
- duplicateRows = 0;
- audit created/validated/processed.
```

---

## 20.2. Importación con advertencias

```text id="uwfjfr"
- CSV con filas inválidas;
- allowPartialProcessing=true;
- status processedWithWarnings;
- validRows correctas;
- invalidRows correctas;
- errors registrados;
- movimientos válidos creados;
- filas inválidas no crean movimientos.
```

---

## 20.3. Importación fallida

```text id="spdl0m"
- archivo corrupto;
- status failed;
- no crea movimientos;
- registra errorSummary;
- audita failed;
- response no expone archivo completo.
```

---

## 20.4. Importación cancelada

```text id="z3zfm8"
- import uploaded puede cancelarse;
- import validated puede cancelarse;
- import processed no puede cancelarse;
- cancel requiere reason;
- status cancelled;
- audita cancelled.
```

---

## 20.5. Cuenta no activa

```text id="nbmv7j"
- cuenta inactive rechaza upload;
- cuenta archived rechaza upload;
- cuenta tenant B rechaza upload;
- error controlado.
```

---

# 21. Candidate generation tests

## 21.1. Score alto

```text id="l5pf2k"
- monto exacto;
- fecha dentro de 1 día;
- referencia parcial coincide;
- score >= 90;
- scoreBand high;
- candidato sugerido.
```

---

## 21.2. Score medio

```text id="cdpbtz"
- monto exacto;
- fecha dentro de tolerancia;
- referencia ausente;
- score entre 70 y 89;
- scoreBand medium.
```

---

## 21.3. Score bajo

```text id="lpcqn4"
- monto exacto;
- fecha alejada;
- sin referencia;
- score entre 50 y 69;
- scoreBand low.
```

---

## 21.4. No sugerir

```text id="enjlwu"
- score < minScore no crea candidate;
- pago no conciliable no crea candidate;
- movimiento duplicate no crea candidate;
- movimiento ignored no crea candidate;
- movimiento matched no crea candidate.
```

---

## 21.5. No side effect

```text id="d5yklr"
- generación de candidatos no cambia Payment.reconciliationStatus;
- generación de candidatos no crea ReconciliationMatch;
- generación de candidatos no cambia AccountStatement;
- audit solo indica candidates generated.
```

---

# 22. Session lifecycle tests

## 22.1. Crear y abrir

```text id="m8fc30"
- crear sesión draft;
- abrir sesión;
- no duplicar sesión activa para misma cuenta/periodo;
- tenant B no afecta tenant A.
```

---

## 22.2. Reviewing

```text id="kf7owl"
- open -> reviewing;
- reviewing permite matches;
- reviewing permite excepciones;
- reviewing permite cierre.
```

---

## 22.3. Close

```text id="lwvkr6"
- close con reason;
- close con closingBalance;
- calcula summary;
- bloquea cambios;
- audita closed.
```

---

## 22.4. Close bloqueado

```text id="f0wq9o"
- excepción high open bloquea cierre;
- excepción critical open bloquea cierre;
- excepción medium open no bloquea si policy lo permite;
- excepción resolved no bloquea;
- excepción ignored no bloquea.
```

---

## 22.5. Reopen

```text id="r6xhhs"
- closed -> reopened;
- requiere permiso;
- requiere reason;
- mantiene historial;
- permite nuevas operaciones;
- audita reopened.
```

---

# 23. Exception workflow tests

```text id="flamxb"
- crear bankTransactionWithoutPayment;
- crear paymentWithoutBankTransaction;
- crear amountMismatch;
- crear dateMismatch;
- crear ambiguousReference;
- crear duplicateBankTransaction;
- crear duplicatePaymentCandidate;
- crear bankFee;
- crear interest;
- crear reversal;
- crear transferBetweenAccounts;
- crear unknownDeposit;
- crear manualReview;
- crear other;
- actualizar severity;
- resolver con notas;
- ignorar con razón;
- archivar;
- no crear sin description;
- no resolver sin notes;
- no ignorar sin reason;
- no crear en sesión closed.
```

---

# 24. Reports tests

## 24.1. Summary

```text id="ecpp01"
- calcula bankAccountsCount;
- calcula sessionsCount;
- calcula bankTransactionsCount;
- calcula matchedTransactionsCount;
- calcula unmatchedTransactionsCount;
- calcula paymentsMatchedCount;
- calcula paymentsUnmatchedCount;
- calcula exceptionsOpenCount;
- calcula totalBankCredits;
- calcula totalBankDebits;
- calcula totalMatchedAmount;
- calcula totalUnmatchedBankAmount;
- solo incluye tenant activo.
```

---

## 24.2. Unmatched bank transactions

```text id="p0vmnv"
- incluye pending;
- incluye unmatched;
- incluye exception si no matched;
- excluye matched;
- excluye archived;
- excluye duplicate por defecto si policy lo define;
- no expone referencias completas sensibles.
```

---

## 24.3. Unmatched payments

```text id="lkkgb9"
- incluye confirmed pending reconciliation;
- incluye partiallyAllocated pending reconciliation;
- incluye allocated pending reconciliation;
- excluye rejected;
- excluye cancelled;
- excluye reversed;
- excluye archived;
- excluye tenant B.
```

---

## 24.4. Exceptions report

```text id="efysaf"
- filtra por period;
- filtra por severity;
- filtra por status;
- filtra por exceptionType;
- no expone datos sensibles completos.
```

---

## 24.5. Bank account balances

```text id="fpl6c3"
- muestra accountNumberMasked;
- no muestra número completo;
- calcula openingBalance;
- calcula closingBalance;
- calcula credits/debits;
- respeta tenant.
```

---

## 24.6. Export

```text id="ohhynb"
- genera CSV;
- genera XLSX;
- genera PDF si está habilitado;
- persiste en Secure Document Storage si aplica;
- no expone storageKey;
- audita reconciliationReport.exported;
- export solo incluye tenant activo.
```

---

# 25. Security tests

## 25.1. Datos prohibidos

Debe verificar que responses, logs, audit y OpenAPI no contienen:

```text id="j1nn4i"
accountNumber completo
accountNumberHash en DTO estándar
storageKey
signedUrl persistente
archivo completo
fila bancaria completa
reference sensible completa si policy la restringe
bankReference sensible completa si policy la restringe
tokens
cookies
Authorization header
SQL raw
stack trace
datos reales de IA
```

---

## 25.2. Body prohibido

Debe rechazar en todos los endpoints externos:

```text id="wkvedt"
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
accountNumberHash
fingerprint
fileHash
secureDocumentId manual
secureDocumentFileId manual
storageKey
status directo salvo transición controlada
```

---

## 25.3. Endpoints públicos inexistentes

Debe devolver 404:

```text id="pxcmzb"
GET /api/v1/public/bank-accounts
GET /api/v1/public/bank-transactions
GET /api/v1/public/reconciliation-sessions
GET /api/v1/public/reconciliation-reports
GET /api/v1/public/tenants/{slug}/bank-accounts
GET /api/v1/public/tenants/{slug}/bank-transactions
GET /api/v1/public/tenants/{slug}/reconciliation-sessions
GET /api/v1/public/tenants/{slug}/reconciliation-reports
GET /api/v1/public/tenants/{slug}/reconciliation-reports/summary
```

---

## 25.4. IA externa

Debe probar:

```text id="sfk23s"
- feature flag aiAssistance desactivado;
- no se invoca proveedor externo con movimientos reales;
- no se envían archivos bancarios a IA;
- no se envían comprobantes reales a IA;
- no se envían referencias bancarias reales a IA;
- tests usan fixtures sintéticos.
```

---

# 26. Audit tests

## 26.1. Eventos obligatorios

Debe validar auditoría para:

```text id="s8kqs7"
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
reconciliationSession.updated
reconciliationSession.opened
reconciliationSession.closed
reconciliationSession.reopened
reconciliationSession.archived
reconciliationCandidate.generated
reconciliationCandidate.accepted
reconciliationCandidate.rejected
reconciliationMatch.confirmed
reconciliationMatch.reversed
reconciliationMatch.archived
reconciliationException.created
reconciliationException.updated
reconciliationException.resolved
reconciliationException.ignored
reconciliationException.archived
reconciliationReport.exported
```

---

## 26.2. Metadata permitida

Debe permitir:

```text id="d1jnuz"
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

## 26.3. Metadata prohibida

Debe bloquear:

```text id="i6q8nu"
accountNumber completo
accountNumberHash
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

# 27. Observability tests

## 27.1. Logs

Debe verificar:

```text id="wsuzpg"
- logs incluyen traceId;
- logs incluyen action;
- logs incluyen outcome;
- logs incluyen durationMs;
- logs incluyen errorCode cuando aplica;
- logs no incluyen accountNumber completo;
- logs no incluyen reference completa sensible;
- logs no incluyen bankReference completa sensible;
- logs no incluyen fileHash completo;
- logs no incluyen storageKey;
- logs no incluyen archivo completo;
- logs no incluyen stack trace en producción.
```

---

## 27.2. Métricas

Debe verificar:

```text id="yo60z4"
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

## 27.3. Labels permitidos

```text id="lyuazc"
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

## 27.4. Labels prohibidos

```text id="r81vtr"
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

# 28. OpenAPI tests

Debe validar:

```text id="o0ykyl"
- OpenAPI compila;
- tags correctos;
- todos los endpoints tenant documentados;
- no hay endpoints /public;
- no hay endpoints /me para bank reconciliation en MVP;
- todos los endpoints tienen x-auth-required;
- todos los endpoints tenant tienen x-tenant-scope;
- endpoints financieros tienen x-financial-control;
- endpoints de import tienen x-file-upload;
- endpoints de import tienen x-secure-document-storage;
- endpoints de import tienen x-storage-key-exposed: false;
- endpoints de matching tienen x-manual-confirmation-required;
- endpoints de candidatos tienen x-candidate-side-effect: false;
- reportes tienen x-public-exposure: false;
- permisos documentados;
- errores documentados;
- DTOs no contienen accountNumberHash en response estándar;
- DTOs no contienen storageKey.
```

---

# 29. Performance tests

## 29.1. Escenarios

```text id="rygeuu"
- listar 10.000 bankTransactions paginados;
- filtrar bankTransactions por fecha;
- filtrar bankTransactions por status;
- filtrar bankTransactions por amount;
- procesar CSV de 1.000 filas;
- procesar CSV de 5.000 filas;
- procesar XLSX de 1.000 filas;
- generar candidatos para periodo mensual típico;
- listar candidatos;
- confirmar match;
- generar summary report;
- exportar reporte.
```

---

## 29.2. Objetivos

```text id="l2sm6t"
p95 < 800 ms para listar movimientos paginados.
p95 < 1200 ms para listar candidatos.
p95 < 3000 ms para procesar importación pequeña/mediana.
p95 < 5000 ms para generar candidatos en periodo mensual típico.
```

---

## 29.3. Validaciones

```text id="in941j"
- paginación obligatoria;
- pageSize máximo 100;
- índices usados;
- no N+1 evidente;
- procesamiento por lotes;
- no cargar archivos grandes completos si puede evitarse;
- no base64 en JSON;
- no logs excesivos por fila en producción.
```

---

# 30. Concurrency tests

## 30.1. Importaciones

```text id="d3rnoz"
- dos requests importan mismo archivo simultáneamente;
- no se duplican imports activos;
- no se duplican movimientos;
- uno retorna éxito y otro 409 o respuesta idempotente;
- audit consistente.
```

---

## 30.2. Movimientos duplicados

```text id="zcl5ek"
- dos procesos crean mismo fingerprint simultáneamente;
- unique constraint evita duplicado;
- uno crea movimiento principal;
- otro marca duplicado o falla controladamente;
- no se crean dos movimientos conciliables iguales.
```

---

## 30.3. Sesiones

```text id="jgabey"
- dos requests crean sesión para misma cuenta/periodo;
- solo una sesión activa;
- segundo request retorna 409;
- tenant B no afecta tenant A.
```

---

## 30.4. Matches

```text id="s5s067"
- dos requests concilian mismo movimiento;
- solo un match confirmado;
- segundo retorna 409;
- payment no queda doblemente conciliado;
- bankTransaction no queda estado inconsistente.
```

---

## 30.5. Reversos

```text id="b6to8a"
- dos requests revierten mismo match;
- solo un reverso efectivo;
- segundo retorna 409;
- estados finales consistentes.
```

---

## 30.6. Close/reopen

```text id="qw8pa8"
- close y match simultáneos producen resultado consistente;
- sesión closed bloquea match posterior;
- reopen y close simultáneos no corrompen estado.
```

---

# 31. Regression tests

Debe ejecutarse regresión sobre:

```text id="khpg6t"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
006-account-statements
007-audit
008-basic-reports
016-secure-document-storage
```

---

## 31.1. Payments regression

```text id="pposnc"
- payment creation sigue funcionando;
- payment confirmation sigue funcionando;
- payment allocation sigue funcionando;
- payment reversal sigue funcionando;
- receipts download sigue funcionando;
- reconciliationStatus no rompe endpoints existentes;
- payment estado rejected no se vuelve conciliable por error.
```

---

## 31.2. Account Statements regression

```text id="oz8bu3"
- estado de cuenta se sigue reconstruyendo desde cargos/pagos;
- bankTransactions no alteran balances;
- payments reconciled se muestran si se integra metadata;
- balances no dependen de movimientos bancarios no conciliados.
```

---

## 31.3. Secure Document Storage regression

```text id="zvwfrm"
- upload seguro sigue funcionando;
- download seguro sigue funcionando;
- storageKey sigue oculto;
- sourceModule bankReconciliation no rompe módulos anteriores;
- documentos restricted no aparecen en /me.
```

---

## 31.4. Audit regression

```text id="p4ekpm"
- audit logs siguen sanitizados;
- eventos financieros existentes no se rompen;
- no se guardan datos bancarios completos.
```

---

# 32. Smoke tests

Flujo mínimo:

```text id="x343pf"
1. Crear bankAccount.
2. Activar bankAccount.
3. Importar CSV válido.
4. Procesar import.
5. Confirmar creación de bankTransactions.
6. Crear reconciliationSession.
7. Abrir session.
8. Generar candidates.
9. Aceptar candidate high.
10. Confirmar match.
11. Verificar Payment.reconciliationStatus.
12. Crear exception para movimiento no conciliado.
13. Resolver exception.
14. Cerrar session.
15. Consultar summary report.
16. Exportar report.
17. Verificar Secure Document Storage.
18. Verificar audit events.
19. Verificar ausencia de storageKey.
20. Verificar ausencia de endpoints públicos.
```

---

# 33. Comandos sugeridos

## 33.1. Comandos específicos

```bash id="vv217z"
npm run test:bank-reconciliation
npm run test:bank-reconciliation:unit
npm run test:bank-reconciliation:domain
npm run test:bank-reconciliation:value-objects
npm run test:bank-reconciliation:state-machines
npm run test:bank-reconciliation:parsers
npm run test:bank-reconciliation:fingerprint
npm run test:bank-reconciliation:duplicates
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
```

---

## 33.2. Comandos generales

```bash id="dr8s8b"
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

# 34. CI/CD gates

El pipeline debe fallar si:

```text id="c3uobl"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan domain tests;
- fallan repository tests;
- fallan service tests;
- fallan integration tests;
- fallan API tests;
- fallan authorization tests;
- fallan multitenancy tests;
- fallan financial integrity tests;
- fallan import tests;
- fallan matching tests;
- fallan exception tests;
- fallan report tests;
- fallan audit tests;
- fallan observability tests;
- fallan OpenAPI tests;
- fallan security tests;
- falla build;
- OpenAPI documenta endpoints públicos;
- response snapshots contienen accountNumber completo;
- response snapshots contienen accountNumberHash en DTO estándar;
- response snapshots contienen storageKey;
- logs contienen datos bancarios completos;
- audit contiene datos bancarios completos;
- se detecta uso de float/double para dinero;
- candidate modifica Payment;
- match permite payment cross-tenant;
- import duplica movimientos.
```

---

# 35. Cobertura mínima recomendada

| Área                              | Cobertura mínima |
| --------------------------------- | ---------------: |
| Value Objects financieros         |              95% |
| State machines                    |              95% |
| Fingerprint y duplicate detection |              95% |
| Matching y scoring                |              90% |
| Services financieros              |              90% |
| Authorization policies            |              90% |
| Multitenancy                      |              95% |
| API controllers                   |              85% |
| Reports                           |              80% |
| Observability                     |              75% |

Regla:

```text id="bzllq7"
La cobertura no reemplaza pruebas de integridad financiera, multitenancy y seguridad. Un módulo con alta cobertura pero sin pruebas cross-tenant o financieras no debe aceptarse.
```

---

# 36. Matriz de trazabilidad

| Requisito                 | Prueba mínima                     |
| ------------------------- | --------------------------------- |
| Registrar cuenta bancaria | API + service + repository        |
| Proteger número de cuenta | DTO + security + logs             |
| Importar CSV/XLSX         | parser + API + integration        |
| Guardar archivo en SDS    | integration + security            |
| Validar archivo           | parser + service + API            |
| Detectar duplicados       | fingerprint + repository + import |
| Crear movimientos         | service + repository              |
| Crear sesión              | API + repository                  |
| Generar candidatos        | scoring + candidate service       |
| Candidate sin side effect | service + integration             |
| Match 1:1                 | financial integrity               |
| Match 1:N                 | financial integrity               |
| Match N:1                 | financial integrity               |
| Difference reason         | domain + API                      |
| Reverse match             | service + integration             |
| Excepciones               | API + service                     |
| Close session             | state machine + service           |
| Reopen session            | auth + service                    |
| Reportes                  | report service + API              |
| Auditoría                 | audit tests                       |
| Multitenancy              | cross-tenant tests                |
| No public endpoints       | route + OpenAPI                   |
| No datos sensibles        | security snapshots                |

---

# 37. Checklist de aceptación de pruebas

```text id="wyrk9l"
[ ] Unit tests pasan.
[ ] Domain tests pasan.
[ ] Value object tests pasan.
[ ] State machine tests pasan.
[ ] Parser tests pasan.
[ ] Fingerprint tests pasan.
[ ] Duplicate detection tests pasan.
[ ] Repository tests pasan.
[ ] Service tests pasan.
[ ] Integration tests pasan.
[ ] API tests pasan.
[ ] Authorization tests pasan.
[ ] Multitenancy tests pasan.
[ ] Financial integrity tests pasan.
[ ] Import workflow tests pasan.
[ ] Matching tests pasan.
[ ] Exception workflow tests pasan.
[ ] Session lifecycle tests pasan.
[ ] Report tests pasan.
[ ] Audit tests pasan.
[ ] Observability tests pasan.
[ ] OpenAPI tests pasan.
[ ] Security tests pasan.
[ ] Performance tests dentro de objetivo.
[ ] Concurrency tests pasan.
[ ] Smoke test pasa.
[ ] Regression tests pasan.
[ ] CI/CD gates pasan.
```

---

# 38. No aceptación

El módulo no debe aceptarse si las pruebas permiten:

```text id="ny6bhg"
- cuenta bancaria cross-tenant;
- importación cross-tenant;
- movimiento bancario cross-tenant;
- sesión cross-tenant;
- candidato cross-tenant;
- match cross-tenant;
- excepción cross-tenant;
- conciliación con paymentId de otro tenant;
- uso de secureDocumentId de otro tenant;
- tenantId en body;
- búsqueda por id simple;
- exposición de número completo de cuenta;
- exposición de accountNumberHash por DTO estándar;
- exposición de storageKey;
- exposición de archivo bancario completo en JSON;
- exposición de filas completas no sanitizadas;
- duplicación de movimientos por reimportación;
- uso de float/double para dinero;
- candidate con side effect financiero;
- match con payment no conciliable;
- match con diferencia sin razón;
- reverso sin razón;
- modificación de sesión closed;
- cierre con excepciones críticas abiertas si policy lo bloquea;
- logs con datos bancarios completos;
- audit con datos bancarios completos;
- endpoints públicos;
- OpenAPI con endpoints públicos;
- WordPress público consumiendo conciliación bancaria;
- IA externa con datos reales.
```

---

# 39. Resultado esperado

Al completar este plan de pruebas, el módulo `017-bank-reconciliation` deberá demostrar que:

```text id="nahupp"
- gestiona cuentas bancarias de forma segura;
- protege números de cuenta;
- importa archivos bancarios de forma controlada;
- usa Secure Document Storage correctamente;
- valida CSV/XLSX;
- normaliza movimientos;
- calcula fingerprints determinísticos;
- detecta duplicados;
- no duplica movimientos al reimportar;
- usa Decimal para dinero;
- crea sesiones de conciliación;
- genera candidatos sin side effects;
- calcula score explicable;
- confirma matches 1:1, 1:N y N:1;
- registra diferencias con razón;
- revierte matches conservando historial;
- gestiona excepciones;
- cierra y reabre sesiones bajo control;
- integra Payments sin romper cargos, pagos ni estados de cuenta;
- produce reportes básicos seguros;
- audita operaciones críticas;
- mantiene logs y métricas seguras;
- mantiene aislamiento por tenant;
- no expone datos bancarios sensibles;
- no expone storageKey;
- no crea endpoints públicos;
- no usa IA con datos reales.
```

---

# 40. Próximo documento

Después de este test plan, el siguiente documento del paquete es:

```text id="azkftq"
docs/specs/017-bank-reconciliation/tasks.md
```
