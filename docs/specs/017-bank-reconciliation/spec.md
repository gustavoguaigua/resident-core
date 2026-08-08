# Functional Specification — Spec 017 Bank Reconciliation

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                            |
| Spec ID         | 017                                                                                                                                                                                      |
| Módulo          | Bank Reconciliation                                                                                                                                                                      |
| Documento       | Functional Specification                                                                                                                                                                 |
| Ruta            | `docs/specs/017-bank-reconciliation/spec.md`                                                                                                                                             |
| Versión         | 0.1                                                                                                                                                                                      |
| Estado          | Borrador inicial                                                                                                                                                                         |
| Fecha           | 2026-07-21                                                                                                                                                                               |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage` |
| Relacionado con | cuentas bancarias, movimientos bancarios, pagos, comprobantes, asignaciones, estados de cuenta, reportes financieros, auditoría, archivos importados, conciliación manual/asistida       |
| API Style       | REST                                                                                                                                                                                     |
| Naturaleza      | Tenant-scoped / Financial-control / Import-driven / Match-aware / Exception-aware / Audit-heavy / Non-public                                                                             |

---

## 2. Propósito

El módulo `017-bank-reconciliation` define la funcionalidad para registrar cuentas bancarias del conjunto, importar movimientos bancarios, comparar dichos movimientos contra pagos registrados en RESIDENT Core, proponer coincidencias, confirmar conciliaciones, gestionar excepciones y cerrar periodos de conciliación.

Su objetivo es mejorar el control financiero del conjunto, reduciendo errores manuales y permitiendo trazabilidad entre:

```text id="x8psgj"
movimiento bancario real
  ↔ pago registrado
  ↔ comprobante de pago
  ↔ asignación a cargos
  ↔ estado de cuenta
  ↔ auditoría financiera
```

Regla central:

```text id="qxno79"
Todo movimiento bancario y conciliación debe pertenecer a un tenant, estar asociado a una cuenta bancaria registrada, conservar trazabilidad de importación, evitar duplicados, permitir coincidencias controladas con pagos, registrar excepciones, impedir confirmaciones automáticas no auditadas y mantener evidencia completa de auditoría.
```

---

## 3. Contexto dentro de RESIDENT Core

Hasta este punto, RESIDENT Core ya contempla:

```text id="bj0vna"
004-dues-fees
  └── cargos, alícuotas, ajustes, reversos

005-payments
  └── pagos, comprobantes, asignaciones, reversos

006-account-statements
  └── estados de cuenta reconstruidos desde cargos y pagos

016-secure-document-storage
  └── almacenamiento seguro de documentos y archivos
```

El módulo `017-bank-reconciliation` complementa estos módulos mediante el control de movimientos reales en cuentas bancarias.

```text id="et9m8w"
Tenant
  ├── Bank Accounts
  │     └── Bank Statement Imports
  │           └── Bank Transactions
  │
  ├── Payments
  │     ├── Payment Receipts
  │     └── Payment Allocations
  │
  └── Reconciliation Sessions
        ├── Candidate Matches
        ├── Confirmed Matches
        ├── Exceptions
        ├── Notes
        └── Audit Trail
```

Este módulo no reemplaza al módulo de pagos. Su función es contrastar lo que el sistema cree que ocurrió contra lo que aparece en el banco.

---

## 4. Objetivo funcional

El sistema debe permitir:

```text id="llpw3j"
- registrar cuentas bancarias del tenant;
- configurar datos básicos de banco y cuenta;
- importar movimientos bancarios desde archivo;
- almacenar archivo importado usando Secure Document Storage;
- normalizar movimientos importados;
- detectar movimientos duplicados;
- clasificar ingresos y egresos;
- listar movimientos pendientes de conciliación;
- comparar movimientos bancarios contra pagos registrados;
- sugerir coincidencias por monto, fecha, referencia y texto;
- permitir conciliación manual;
- permitir conciliación asistida con confirmación humana;
- impedir conciliación automática irreversible sin auditoría;
- registrar excepciones;
- marcar movimientos como no conciliables bajo razón;
- cerrar sesiones de conciliación;
- bloquear sesiones cerradas;
- emitir eventos de auditoría;
- alimentar reportes financieros básicos.
```

---

## 5. Alcance incluido en MVP

El MVP incluye:

```text id="yuqef7"
1. Registro de cuentas bancarias por tenant.
2. Activación, desactivación y archivo lógico de cuentas bancarias.
3. Importación de estados o movimientos bancarios desde CSV/XLSX.
4. Registro del archivo importado mediante Secure Document Storage.
5. Normalización de movimientos importados.
6. Validación de formato.
7. Validación de moneda.
8. Validación de rango de fechas.
9. Detección de duplicados por hash/fingerprint.
10. Registro de movimientos bancarios.
11. Clasificación básica: crédito, débito, ajuste, reverso, comisión, interés, otro.
12. Creación de sesiones de conciliación.
13. Listado de movimientos pendientes.
14. Listado de pagos pendientes de conciliación.
15. Generación de candidatos de conciliación.
16. Conciliación 1:1 movimiento ↔ pago.
17. Conciliación 1:N movimiento ↔ varios pagos.
18. Conciliación N:1 varios movimientos ↔ un pago.
19. Confirmación manual de coincidencias.
20. Rechazo manual de candidatos.
21. Registro de excepciones.
22. Marcado como no conciliable.
23. Desconciliación controlada.
24. Cierre de sesión de conciliación.
25. Reapertura administrativa limitada.
26. Auditoría financiera completa.
27. Endpoints administrativos REST.
28. Endpoints de consulta propia limitados si aplica a pagos propios.
29. Integración con Payments.
30. Integración con Account Statements.
31. Integración con Basic Reports.
32. Integración con Secure Document Storage.
```

---

## 6. Fuera de alcance del MVP

No implementar en esta spec:

```text id="cppst3"
- conexión directa con APIs bancarias reales;
- scraping bancario;
- Open Banking;
- sincronización automática con bancos;
- conciliación automática irreversible;
- creación automática de pagos confirmados sin revisión humana;
- generación automática de cargos;
- reversos financieros automáticos;
- reglas contables avanzadas;
- contabilidad completa;
- plan de cuentas contable;
- asientos contables;
- conciliación de cheques compleja;
- conciliación multi-moneda avanzada;
- conciliación con tarjetas de crédito;
- conciliación con pasarelas de pago;
- procesamiento de transferencias salientes;
- pagos masivos a proveedores;
- tesorería avanzada;
- predicción con IA usando datos reales;
- lectura OCR de PDFs bancarios;
- firma electrónica;
- certificación legal de estados bancarios;
- integración con SRI;
- generación de libros contables oficiales.
```

Estos elementos quedan diferidos para futuras specs.

---

## 7. Principios de diseño

### 7.1. Tenant isolation financiero

Toda cuenta, importación, movimiento, candidato, match, excepción y sesión debe tener `tenantId`.

Regla:

```text id="bh5xcd"
Nunca consultar bankAccount, bankTransaction, reconciliationSession o reconciliationMatch solo por id.
```

---

### 7.2. El banco no reemplaza la validación administrativa

Un movimiento bancario puede sugerir que un pago ocurrió, pero la conciliación no debe alterar pagos críticos sin control.

```text id="jbib42"
Movimiento bancario detectado ≠ pago confirmado automáticamente.
```

---

### 7.3. Conciliación asistida, no automática irreversible

El sistema puede sugerir matches, pero la confirmación final debe ser explícita en MVP.

```text id="k7wiel"
candidateMatch -> manual confirmation -> confirmedMatch
```

---

### 7.4. Trazabilidad completa

Toda importación debe conservar:

```text id="o1id6k"
archivo origen
hash del archivo
usuario importador
fecha de importación
cuenta bancaria
rango de fechas
cantidad de movimientos
movimientos creados
duplicados detectados
errores de validación
auditoría
```

---

### 7.5. Idempotencia

La importación debe ser idempotente.

Regla:

```text id="ya526x"
Reimportar el mismo archivo o los mismos movimientos no debe duplicar movimientos bancarios.
```

---

### 7.6. Dinero con Decimal

Todos los montos deben almacenarse como decimal exacto.

Prohibido:

```text id="mhhikn"
float
double
number de JavaScript para cálculos monetarios
```

---

### 7.7. Auditoría financiera estricta

Toda acción crítica debe auditarse:

```text id="wwvzo1"
bankAccount.created
bankStatementImport.created
bankStatementImport.processed
bankTransaction.created
reconciliationSession.created
reconciliationCandidate.generated
reconciliationMatch.confirmed
reconciliationMatch.reversed
reconciliationException.created
reconciliationSession.closed
```

---

### 7.8. No exposición pública

No existen endpoints públicos en MVP.

```text id="g46qsu"
Ningún movimiento bancario debe exponerse en /api/v1/public.
```

---

## 8. Actores

### 8.1. TenantAdmin

Puede configurar cuentas bancarias y revisar conciliaciones según permisos.

---

### 8.2. FinancialManager

Actor principal del módulo.

Puede:

* importar movimientos;
* revisar candidatos;
* confirmar conciliaciones;
* registrar excepciones;
* cerrar sesiones;
* consultar reportes;
* revisar inconsistencias.

---

### 8.3. Accountant

Rol futuro o equivalente funcional.

Puede revisar información de conciliación y exportar reportes según permisos.

---

### 8.4. BoardMember

Puede consultar reportes resumidos o sesiones cerradas si tiene permiso.

---

### 8.5. PropertyOwner

No accede directamente a movimientos bancarios completos.

Puede ver el estado de sus pagos ya conciliados si el módulo Payments o Account Statements lo exponen.

---

### 8.6. Resident

No accede directamente a movimientos bancarios completos.

Puede ver el estado de sus pagos ya conciliados si corresponde.

---

### 8.7. PlatformAdmin

No accede automáticamente a movimientos bancarios ni cuentas de tenants.

Solo puede gestionar aspectos técnicos globales si existe permiso explícito y auditoría reforzada.

---

### 8.8. System

Puede ejecutar normalización, generación de candidatos, fingerprinting y cálculos determinísticos.

No debe confirmar conciliaciones automáticamente en MVP.

---

## 9. Definiciones funcionales

### 9.1. Bank Account

Cuenta bancaria registrada para un tenant.

Ejemplo:

```text id="d5zi39"
Banco Pichincha - Cuenta Corriente - Administración Conjunto A
```

---

### 9.2. Bank Statement Import

Proceso de carga de un archivo de movimientos bancarios.

Incluye:

* archivo;
* banco;
* cuenta;
* rango de fechas;
* usuario importador;
* estado de procesamiento;
* conteo de filas;
* errores;
* duplicados.

---

### 9.3. Bank Transaction

Movimiento bancario individual normalizado.

Puede ser:

* crédito;
* débito;
* comisión;
* interés;
* reverso;
* ajuste;
* otro.

---

### 9.4. Reconciliation Session

Agrupación operativa de conciliación para una cuenta y rango de fechas.

Permite revisar movimientos, matches, excepciones y cierre.

---

### 9.5. Reconciliation Candidate

Coincidencia sugerida por el sistema entre movimiento bancario y pago.

No tiene efecto financiero hasta confirmarse.

---

### 9.6. Reconciliation Match

Conciliación confirmada entre movimientos bancarios y pagos.

Puede ser:

```text id="wr6d9h"
1 movimiento ↔ 1 pago
1 movimiento ↔ varios pagos
varios movimientos ↔ 1 pago
varios movimientos ↔ varios pagos
```

En MVP se recomienda soportar 1:1, 1:N y N:1.

---

### 9.7. Reconciliation Exception

Caso no conciliado o inconsistente que requiere revisión.

Ejemplos:

```text id="a6lpfb"
movimiento sin pago registrado
pago sin movimiento bancario
monto no coincide
fecha fuera de tolerancia
referencia ambigua
movimiento duplicado
comisión bancaria
transferencia interna
depósito no identificado
reverso bancario
```

---

### 9.8. Match Score

Puntaje de coincidencia calculado por reglas determinísticas.

Factores:

```text id="cfd5ii"
monto
fecha
referencia
número de comprobante
texto descriptivo
unidad habitacional
identificación parcial
banco
cuenta
```

---

## 10. Entidades conceptuales

### 10.1. BankAccount

Representa una cuenta bancaria del tenant.

Campos conceptuales:

```text id="a8h1n3"
id
tenantId
bankName
accountName
accountNumberMasked
accountNumberHash
accountType
currency
status
isDefault
description
createdBy
updatedBy
archivedBy
createdAt
updatedAt
archivedAt
metadata
```

---

### 10.2. BankStatementImport

Representa una importación de archivo bancario.

Campos conceptuales:

```text id="r1uj1b"
id
tenantId
bankAccountId
secureDocumentId
secureDocumentFileId
importType
fileName
fileHash
hashAlgorithm
status
periodStart
periodEnd
importedBy
processedBy
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

---

### 10.3. BankTransaction

Representa un movimiento bancario normalizado.

Campos conceptuales:

```text id="u9cx4x"
id
tenantId
bankAccountId
statementImportId
transactionDate
postedDate
description
reference
bankReference
transactionType
direction
amount
currency
balanceAfter
fingerprint
status
isDuplicate
duplicateOfTransactionId
createdBy
createdAt
updatedAt
archivedAt
metadata
```

---

### 10.4. ReconciliationSession

Representa una sesión de conciliación.

Campos conceptuales:

```text id="jy0s87"
id
tenantId
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
createdBy
closedBy
reopenedBy
createdAt
closedAt
reopenedAt
metadata
```

---

### 10.5. ReconciliationCandidate

Representa una coincidencia sugerida.

Campos conceptuales:

```text id="d6ll1r"
id
tenantId
reconciliationSessionId
bankTransactionId
paymentId
score
scoreReason
matchType
status
generatedBy
reviewedBy
createdAt
reviewedAt
metadata
```

---

### 10.6. ReconciliationMatch

Representa una conciliación confirmada.

Campos conceptuales:

```text id="tzqc0t"
id
tenantId
reconciliationSessionId
matchType
status
confirmedBy
reversedBy
confirmedAt
reversedAt
reverseReason
totalBankAmount
totalPaymentAmount
differenceAmount
differenceReason
metadata
```

---

### 10.7. ReconciliationMatchItem

Representa cada elemento asociado a un match.

Campos conceptuales:

```text id="zke8vi"
id
tenantId
reconciliationMatchId
bankTransactionId
paymentId
amountApplied
itemType
createdAt
metadata
```

---

### 10.8. ReconciliationException

Representa una excepción de conciliación.

Campos conceptuales:

```text id="yhzfw5"
id
tenantId
reconciliationSessionId
bankTransactionId
paymentId
exceptionType
status
severity
description
resolutionNotes
createdBy
resolvedBy
createdAt
resolvedAt
archivedAt
metadata
```

---

## 11. Enums iniciales

### 11.1. BankAccountStatus

```text id="xe8tiw"
draft
active
inactive
archived
```

---

### 11.2. BankAccountType

```text id="epk03g"
checking
savings
virtual
cash
other
```

Nota:

```text id="sfqfdi"
cash se incluye para conciliaciones internas futuras, pero en MVP debe usarse con cautela.
```

---

### 11.3. Currency

MVP recomendado:

```text id="cp4h74"
USD
```

Diferidos:

```text id="kpv8sq"
EUR
COP
PEN
multiCurrency
```

---

### 11.4. BankStatementImportType

```text id="mzenns"
csv
xlsx
manual
apiFuture
```

---

### 11.5. BankStatementImportStatus

```text id="rlx6cu"
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

### 11.6. BankTransactionType

```text id="uyw2k9"
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

### 11.7. BankTransactionDirection

```text id="fc8syl"
credit
debit
neutral
```

---

### 11.8. BankTransactionStatus

```text id="f4o71m"
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

### 11.9. ReconciliationSessionStatus

```text id="yqlj8l"
draft
open
reviewing
closed
reopened
archived
```

---

### 11.10. ReconciliationCandidateStatus

```text id="ly30dc"
suggested
accepted
rejected
expired
superseded
archived
```

---

### 11.11. ReconciliationMatchType

```text id="cva5js"
oneBankTransactionToOnePayment
oneBankTransactionToManyPayments
manyBankTransactionsToOnePayment
manyToMany
manual
```

MVP recomendado:

```text id="jolffs"
oneBankTransactionToOnePayment
oneBankTransactionToManyPayments
manyBankTransactionsToOnePayment
manual
```

`manyToMany` queda permitido conceptualmente pero puede diferirse si complica el MVP.

---

### 11.12. ReconciliationMatchStatus

```text id="wsh006"
confirmed
reversed
archived
```

---

### 11.13. ReconciliationExceptionType

```text id="k2z3tt"
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

### 11.14. ReconciliationExceptionStatus

```text id="g1nca0"
open
inReview
resolved
ignored
archived
```

---

### 11.15. ReconciliationExceptionSeverity

```text id="kvpac5"
low
medium
high
critical
```

---

## 12. Reglas de negocio

### BR-001 — Tenant obligatorio

Toda cuenta bancaria, importación, movimiento, sesión, candidato, match, item y excepción debe tener `tenantId`.

---

### BR-002 — No `tenantId` desde body

El cliente nunca debe enviar `tenantId` para crear o modificar recursos del módulo.

---

### BR-003 — Cuenta bancaria por tenant

Una cuenta bancaria pertenece a un único tenant.

---

### BR-004 — Cuenta bancaria activa para importación

Solo se pueden importar movimientos sobre cuentas bancarias `active`.

---

### BR-005 — Número de cuenta protegido

El número completo de cuenta bancaria no debe exponerse.

El sistema debe almacenar:

```text id="r39vty"
accountNumberMasked
accountNumberHash
```

El número completo, si se requiere, debe estar cifrado o diferido fuera del MVP.

---

### BR-006 — Moneda controlada

MVP opera en USD.

Si se importa otra moneda, debe rechazarse o marcarse como no soportada.

---

### BR-007 — Archivo importado seguro

Todo archivo de estado bancario debe registrarse en Secure Document Storage.

---

### BR-008 — Archivo importado no público

Los archivos de movimientos bancarios nunca son públicos.

---

### BR-009 — Formatos permitidos MVP

MVP permite:

```text id="g3zzfx"
CSV
XLSX
```

PDF/OCR queda diferido.

---

### BR-010 — Importación idempotente

Reimportar el mismo archivo no debe duplicar movimientos.

---

### BR-011 — Movimiento bancario fingerprint

Cada movimiento debe tener fingerprint determinístico.

Ejemplo de campos:

```text id="w1t4rh"
tenantId
bankAccountId
transactionDate
postedDate
amount
direction
reference
bankReference
description normalizada
```

---

### BR-012 — Duplicados

Si un movimiento ya existe por fingerprint, debe marcarse como duplicado o ignorarse según política.

---

### BR-013 — Movimiento bancario no es pago

Un movimiento de crédito no crea automáticamente un pago confirmado.

---

### BR-014 — Conciliación con pagos existentes

La conciliación debe vincular movimientos bancarios con pagos ya registrados.

---

### BR-015 — Pago confirmado puede conciliarse

Solo pagos en estado conciliable pueden formar parte de un match.

Estados conciliables recomendados desde Payments:

```text id="nizrr9"
confirmed
partiallyAllocated
allocated
```

---

### BR-016 — Pago rechazado no conciliable

Pagos `rejected`, `cancelled`, `reversed` o `archived` no deben conciliarse.

---

### BR-017 — Movimiento duplicado no conciliable

Movimientos marcados como `duplicate` no deben conciliarse salvo override administrativo auditado.

---

### BR-018 — Match requiere monto aplicado

Todo match item debe indicar `amountApplied`.

---

### BR-019 — Diferencias controladas

Si el monto bancario y el monto de pagos no coinciden, debe registrarse `differenceAmount` y `differenceReason`.

---

### BR-020 — Tolerancia configurable

MVP puede permitir tolerancia exacta `0.00`.

Tolerancia futura puede configurarse por tenant.

---

### BR-021 — Conciliación parcial permitida

Un movimiento puede quedar `partiallyMatched` si solo una parte se asocia a pagos.

---

### BR-022 — Reconciliación 1:N permitida

Un depósito puede corresponder a varios pagos.

---

### BR-023 — Reconciliación N:1 permitida

Varios depósitos pueden corresponder a un pago.

---

### BR-024 — Reconciliación many-to-many diferida

`manyToMany` puede quedar diferido salvo necesidad explícita.

---

### BR-025 — Confirmación explícita

Todo match debe ser confirmado por un usuario autorizado o proceso interno explícitamente permitido.

En MVP, se recomienda confirmación humana.

---

### BR-026 — Candidato no tiene efecto financiero

Un candidato sugerido no cambia pagos, estados de cuenta ni movimientos.

---

### BR-027 — Confirmed match actualiza estado conciliado

Al confirmar match, debe actualizarse estado de los movimientos y pagos relacionados según contrato con Payments.

---

### BR-028 — Desconciliación controlada

Un match confirmado puede revertirse mediante acción auditada.

---

### BR-029 — Desconciliación no elimina historial

Revertir match no elimina registros; cambia estado a `reversed`.

---

### BR-030 — Sesión cerrada bloqueada

Una sesión `closed` no permite nuevos matches, excepciones ni cambios ordinarios.

---

### BR-031 — Reapertura limitada

Una sesión cerrada solo puede reabrirse con permiso explícito, razón y auditoría reforzada.

---

### BR-032 — Excepciones obligatorias para inconsistencias

Movimientos no conciliados relevantes deben generar excepción o quedar marcados explícitamente como ignorados con razón.

---

### BR-033 — No delete físico

No se eliminan físicamente movimientos, sesiones, matches, excepciones ni imports.

---

### BR-034 — Auditoría obligatoria

Toda acción crítica debe auditarse.

---

### BR-035 — Logs sin datos bancarios completos

Logs y auditoría no deben contener número completo de cuenta, archivo bancario completo, contenido completo de movimiento ni datos personales innecesarios.

---

### BR-036 — No endpoints públicos

No se crean endpoints públicos.

---

### BR-037 — WordPress no accede a movimientos bancarios

El portal WordPress no debe consumir información bancaria privada.

---

### BR-038 — IA externa prohibida con datos reales

No enviar movimientos bancarios, archivos importados, referencias, pagos o comprobantes reales a servicios externos de IA en MVP.

---

## 13. Historias de usuario

### US-001 — Registrar cuenta bancaria

Como FinancialManager, quiero registrar una cuenta bancaria del conjunto para importar y conciliar movimientos.

Criterios:

```text id="t2hokq"
- requiere tenant activo;
- requiere permiso;
- no acepta tenantId desde body;
- guarda accountNumberMasked;
- guarda accountNumberHash;
- no expone número completo;
- audita bankAccount.created.
```

---

### US-002 — Activar cuenta bancaria

Como TenantAdmin o FinancialManager, quiero activar una cuenta bancaria para permitir importaciones.

Criterios:

```text id="xwn4eb"
- cuenta pertenece al tenant;
- estado pasa a active;
- audita bankAccount.activated.
```

---

### US-003 — Importar archivo bancario

Como FinancialManager, quiero importar un CSV/XLSX de movimientos bancarios.

Criterios:

```text id="pz3lgg"
- requiere cuenta active;
- archivo se almacena en Secure Document Storage;
- valida formato;
- valida moneda;
- valida fechas;
- calcula hash;
- detecta duplicados;
- registra import;
- audita bankStatementImport.created.
```

---

### US-004 — Procesar importación

Como FinancialManager, quiero procesar una importación validada para crear movimientos bancarios.

Criterios:

```text id="nhngcb"
- crea movimientos válidos;
- marca duplicados;
- registra filas inválidas;
- no duplica movimientos existentes;
- audita bankStatementImport.processed.
```

---

### US-005 — Consultar movimientos bancarios

Como FinancialManager, quiero listar movimientos bancarios filtrados por cuenta, fecha, tipo y estado.

Criterios:

```text id="l7lzei"
- solo tenant activo;
- requiere permiso;
- paginado;
- no expone datos sensibles innecesarios;
- no expone archivo importado completo.
```

---

### US-006 — Crear sesión de conciliación

Como FinancialManager, quiero crear una sesión de conciliación para una cuenta y periodo.

Criterios:

```text id="db89ut"
- requiere cuenta active;
- periodo válido;
- no duplica sesión abierta para misma cuenta/periodo;
- audita reconciliationSession.created.
```

---

### US-007 — Generar candidatos

Como FinancialManager, quiero que el sistema sugiera coincidencias entre movimientos y pagos.

Criterios:

```text id="rkrhum"
- candidatos son sugerencias;
- no confirman pagos;
- calculan score;
- registran razón de score;
- no crean cambios financieros;
- audita reconciliationCandidate.generated.
```

---

### US-008 — Confirmar match 1:1

Como FinancialManager, quiero confirmar que un movimiento bancario corresponde a un pago.

Criterios:

```text id="qz04j2"
- valida movimiento tenant-scoped;
- valida pago tenant-scoped;
- valida estados conciliables;
- valida monto;
- registra match;
- actualiza estados;
- audita reconciliationMatch.confirmed.
```

---

### US-009 — Confirmar match 1:N

Como FinancialManager, quiero asociar un depósito con varios pagos.

Criterios:

```text id="b22irn"
- total de pagos debe coincidir o registrar diferencia;
- cada pago debe ser conciliable;
- registra items;
- actualiza estados;
- audita.
```

---

### US-010 — Confirmar match N:1

Como FinancialManager, quiero asociar varios movimientos bancarios con un pago.

Criterios:

```text id="izccup"
- movimientos deben ser conciliables;
- pago debe ser conciliable;
- suma de movimientos debe coincidir o registrar diferencia;
- registra items;
- actualiza estados;
- audita.
```

---

### US-011 — Registrar excepción

Como FinancialManager, quiero registrar una excepción para un movimiento no identificado o inconsistente.

Criterios:

```text id="fz5lwb"
- requiere tipo de excepción;
- requiere severidad;
- puede vincular movimiento o pago;
- registra estado open;
- audita reconciliationException.created.
```

---

### US-012 — Resolver excepción

Como FinancialManager, quiero resolver una excepción indicando la solución aplicada.

Criterios:

```text id="ez51sh"
- requiere notas de resolución;
- cambia estado a resolved;
- audita reconciliationException.resolved.
```

---

### US-013 — Desconciliar match

Como FinancialManager, quiero revertir una conciliación confirmada por error.

Criterios:

```text id="rd9dr4"
- requiere permiso;
- requiere razón;
- no elimina match;
- cambia estado a reversed;
- actualiza estados relacionados;
- audita reconciliationMatch.reversed.
```

---

### US-014 — Cerrar sesión

Como FinancialManager, quiero cerrar una sesión de conciliación cuando el periodo está revisado.

Criterios:

```text id="u3rkeh"
- requiere revisar movimientos pendientes;
- requiere revisar excepciones abiertas según política;
- bloquea cambios ordinarios;
- audita reconciliationSession.closed.
```

---

### US-015 — Reabrir sesión

Como TenantAdmin autorizado, quiero reabrir una sesión cerrada si se detecta error.

Criterios:

```text id="z4yjcy"
- requiere permiso explícito;
- requiere razón;
- auditoría reforzada;
- estado pasa a reopened/open;
- no pierde historial.
```

---

## 14. Requisitos funcionales

### FR-001 — Gestionar cuentas bancarias

El sistema debe permitir crear, consultar, actualizar, activar, desactivar y archivar cuentas bancarias por tenant.

---

### FR-002 — Proteger datos bancarios

El sistema no debe exponer números completos de cuenta bancaria.

---

### FR-003 — Importar archivos bancarios

El sistema debe permitir importar CSV/XLSX asociados a una cuenta bancaria activa.

---

### FR-004 — Almacenar archivo importado

El sistema debe almacenar el archivo bancario mediante Secure Document Storage.

---

### FR-005 — Validar formato de importación

El sistema debe validar columnas, tipos, fechas, montos, moneda y referencias.

---

### FR-006 — Procesar importación

El sistema debe transformar filas válidas en movimientos bancarios normalizados.

---

### FR-007 — Detectar duplicados

El sistema debe detectar movimientos duplicados por fingerprint.

---

### FR-008 — Consultar movimientos bancarios

El sistema debe listar y consultar movimientos bancarios bajo permisos.

---

### FR-009 — Crear sesiones de conciliación

El sistema debe permitir crear sesiones por cuenta y rango de fechas.

---

### FR-010 — Generar candidatos

El sistema debe generar candidatos de conciliación con score y explicación.

---

### FR-011 — Rechazar candidatos

El sistema debe permitir rechazar candidatos sugeridos.

---

### FR-012 — Confirmar matches

El sistema debe permitir confirmar matches 1:1, 1:N y N:1.

---

### FR-013 — Registrar diferencias

El sistema debe registrar diferencias de monto con razón.

---

### FR-014 — Actualizar estado conciliado

El sistema debe actualizar estados de movimientos y pagos vinculados.

---

### FR-015 — Registrar excepciones

El sistema debe permitir crear, revisar, resolver, ignorar y archivar excepciones.

---

### FR-016 — Desconciliar matches

El sistema debe permitir revertir matches con razón y auditoría.

---

### FR-017 — Cerrar sesiones

El sistema debe permitir cerrar sesiones y bloquear cambios ordinarios.

---

### FR-018 — Reabrir sesiones

El sistema debe permitir reabrir sesiones cerradas bajo permiso reforzado.

---

### FR-019 — Auditar operaciones

El sistema debe auditar toda operación crítica.

---

### FR-020 — Integrar con Payments

El sistema debe vincular matches con pagos existentes y actualizar su estado de conciliación.

---

### FR-021 — Integrar con Account Statements

El sistema debe permitir que estados de cuenta reflejen pagos conciliados cuando aplique.

---

### FR-022 — Integrar con Reports

El sistema debe alimentar reportes de conciliación, saldos bancarios y excepciones.

---

### FR-023 — Integrar con Secure Document Storage

El sistema debe almacenar archivos importados como documentos seguros.

---

### FR-024 — No exposición pública

El sistema no debe crear endpoints públicos en MVP.

---

### FR-025 — Mantener trazabilidad

El sistema debe conservar importación, movimiento, match, excepción y auditoría.

---

## 15. Requisitos no funcionales

### NFR-001 — Seguridad

Debe cumplir `docs/sdd/security.md` y reglas financieras de módulos previos.

---

### NFR-002 — Multitenancy

Todas las consultas deben filtrar por `tenantId`.

---

### NFR-003 — Integridad financiera

No debe modificar pagos, cargos o estados de cuenta sin acción explícita y auditable.

---

### NFR-004 — Idempotencia

Importaciones y confirmaciones críticas deben soportar idempotencia.

---

### NFR-005 — Precisión monetaria

Montos deben manejarse con Decimal.

---

### NFR-006 — Auditoría

Toda acción crítica debe auditarse con metadata sanitizada.

---

### NFR-007 — Privacidad

No registrar números completos de cuenta, archivos completos, comprobantes o datos bancarios sensibles en logs/auditoría.

---

### NFR-008 — Performance

Objetivos iniciales:

```text id="yze2ho"
p95 < 800 ms para listar movimientos paginados.
p95 < 1200 ms para listar candidatos.
p95 < 3000 ms para procesar importación pequeña/mediana.
p95 < 5000 ms para generar candidatos en periodo mensual típico.
```

---

### NFR-009 — Escalabilidad

Procesamiento de importaciones grandes debe poder migrarse a job asíncrono.

---

### NFR-010 — Observabilidad segura

Métricas y logs no deben contener datos bancarios sensibles.

---

### NFR-011 — Trazabilidad

Cada movimiento debe poder rastrearse hacia importación, archivo origen y usuario importador.

---

### NFR-012 — API-first

Todas las funciones deben exponerse o integrarse mediante API o puertos internos.

---

## 16. Permisos iniciales

### 16.1. Cuentas bancarias

```text id="hyp7yc"
bankAccounts.create
bankAccounts.read
bankAccounts.update
bankAccounts.activate
bankAccounts.deactivate
bankAccounts.archive
```

---

### 16.2. Importaciones

```text id="rd692u"
bankStatementImports.create
bankStatementImports.read
bankStatementImports.process
bankStatementImports.cancel
bankStatementImports.archive
```

---

### 16.3. Movimientos bancarios

```text id="gopdou"
bankTransactions.read
bankTransactions.updateClassification
bankTransactions.ignore
bankTransactions.archive
```

---

### 16.4. Sesiones de conciliación

```text id="ln51r3"
reconciliationSessions.create
reconciliationSessions.read
reconciliationSessions.update
reconciliationSessions.close
reconciliationSessions.reopen
reconciliationSessions.archive
```

---

### 16.5. Candidatos

```text id="mhefvp"
reconciliationCandidates.generate
reconciliationCandidates.read
reconciliationCandidates.accept
reconciliationCandidates.reject
```

---

### 16.6. Matches

```text id="hkz1l4"
reconciliationMatches.create
reconciliationMatches.read
reconciliationMatches.confirm
reconciliationMatches.reverse
reconciliationMatches.archive
```

---

### 16.7. Excepciones

```text id="gkqen8"
reconciliationExceptions.create
reconciliationExceptions.read
reconciliationExceptions.update
reconciliationExceptions.resolve
reconciliationExceptions.ignore
reconciliationExceptions.archive
```

---

### 16.8. Reportes

```text id="tadlon"
reconciliationReports.read
reconciliationReports.export
```

---

### 16.9. Auditoría

```text id="ks8rhe"
reconciliation.audit.read
```

---

## 17. API preliminar

### 17.1. Cuentas bancarias

```text id="lnydc4"
GET    /api/v1/tenant/bank-accounts
POST   /api/v1/tenant/bank-accounts
GET    /api/v1/tenant/bank-accounts/{bankAccountId}
PATCH  /api/v1/tenant/bank-accounts/{bankAccountId}
POST   /api/v1/tenant/bank-accounts/{bankAccountId}/activate
POST   /api/v1/tenant/bank-accounts/{bankAccountId}/deactivate
POST   /api/v1/tenant/bank-accounts/{bankAccountId}/archive
```

---

### 17.2. Importaciones bancarias

```text id="rto353"
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

### 17.3. Movimientos bancarios

```text id="sqiz18"
GET    /api/v1/tenant/bank-transactions
GET    /api/v1/tenant/bank-transactions/{bankTransactionId}
PATCH  /api/v1/tenant/bank-transactions/{bankTransactionId}/classification
POST   /api/v1/tenant/bank-transactions/{bankTransactionId}/ignore
POST   /api/v1/tenant/bank-transactions/{bankTransactionId}/archive
```

---

### 17.4. Sesiones de conciliación

```text id="ohyvoz"
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

### 17.5. Candidatos de conciliación

```text id="gf71es"
GET    /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates/generate
GET    /api/v1/tenant/reconciliation-candidates/{candidateId}
POST   /api/v1/tenant/reconciliation-candidates/{candidateId}/accept
POST   /api/v1/tenant/reconciliation-candidates/{candidateId}/reject
```

---

### 17.6. Matches de conciliación

```text id="tx2zl3"
GET    /api/v1/tenant/reconciliation-sessions/{sessionId}/matches
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/matches
GET    /api/v1/tenant/reconciliation-matches/{matchId}
POST   /api/v1/tenant/reconciliation-matches/{matchId}/confirm
POST   /api/v1/tenant/reconciliation-matches/{matchId}/reverse
POST   /api/v1/tenant/reconciliation-matches/{matchId}/archive
```

---

### 17.7. Excepciones

```text id="u771ni"
GET    /api/v1/tenant/reconciliation-sessions/{sessionId}/exceptions
POST   /api/v1/tenant/reconciliation-sessions/{sessionId}/exceptions
GET    /api/v1/tenant/reconciliation-exceptions/{exceptionId}
PATCH  /api/v1/tenant/reconciliation-exceptions/{exceptionId}
POST   /api/v1/tenant/reconciliation-exceptions/{exceptionId}/resolve
POST   /api/v1/tenant/reconciliation-exceptions/{exceptionId}/ignore
POST   /api/v1/tenant/reconciliation-exceptions/{exceptionId}/archive
```

---

### 17.8. Reportes de conciliación

```text id="x26bhr"
GET    /api/v1/tenant/reconciliation-reports/summary
GET    /api/v1/tenant/reconciliation-reports/unmatched-bank-transactions
GET    /api/v1/tenant/reconciliation-reports/unmatched-payments
GET    /api/v1/tenant/reconciliation-reports/exceptions
GET    /api/v1/tenant/reconciliation-reports/bank-account-balances
GET    /api/v1/tenant/reconciliation-reports/export
```

---

### 17.9. Endpoints propios

MVP no requiere endpoints propios directos para conciliación bancaria.

La información visible para residentes debe exponerse desde:

```text id="jv0vxl"
005-payments
006-account-statements
```

Posible endpoint futuro:

```text id="zcergr"
GET /api/v1/me/payments/{paymentId}/reconciliation-status
```

---

### 17.10. Endpoints públicos prohibidos

No crear:

```text id="s9vt88"
GET /api/v1/public/bank-accounts
GET /api/v1/public/bank-transactions
GET /api/v1/public/reconciliation-sessions
GET /api/v1/public/reconciliation-reports
GET /api/v1/public/tenants/{slug}/bank-transactions
GET /api/v1/public/tenants/{slug}/reconciliation-reports
```

---

## 18. Integraciones

### 18.1. `005-payments`

Uso:

```text id="oupn96"
- consultar pagos conciliables;
- vincular pago con match confirmado;
- actualizar reconciliationStatus del pago;
- evitar conciliar pagos rechazados, cancelados, reversados o archivados;
- registrar pagos sin movimiento bancario como excepción.
```

Campos esperados en Payment para integración futura:

```text id="fg4jjd"
reconciliationStatus
reconciledAt
reconciledBy
reconciliationMatchId
```

Si estos campos no existen en `005-payments`, deben agregarse vía migración o tabla auxiliar en `017`.

---

### 18.2. `006-account-statements`

Uso:

```text id="xljhjz"
- mostrar pagos conciliados;
- mostrar pagos pendientes de conciliación si se define;
- no recalcular saldos desde movimientos bancarios;
- conservar la fuente primaria financiera basada en cargos y pagos.
```

Regla:

```text id="brpr1m"
Los estados de cuenta no se reconstruyen directamente desde movimientos bancarios.
```

---

### 18.3. `008-basic-reports`

Uso:

```text id="wqucg9"
- reportes de movimientos conciliados;
- reportes de movimientos pendientes;
- reportes de excepciones;
- reportes de pagos sin movimiento bancario;
- reportes de depósitos no identificados.
```

---

### 18.4. `016-secure-document-storage`

Uso:

```text id="hytv9r"
- almacenar archivos bancarios importados;
- registrar secureDocumentId;
- registrar secureDocumentFileId;
- proteger storageKey;
- descargar archivo importado solo con permisos financieros.
```

Clasificación recomendada:

```text id="vp33q4"
category = administrativeDocument
sourceModule = reports o system/bankReconciliation según enum futuro
sensitivity = restricted
visibility = administrative
```

Nota:

```text id="mwlhbm"
Si SourceModule no incluye bankReconciliation en 016, debe agregarse en una migración posterior o usarse sourceModule=other con policy estricta. Recomendación: extender SourceModule con bankReconciliation.
```

---

### 18.5. `007-audit`

Uso:

```text id="m66eep"
- auditar acciones financieras críticas;
- registrar usuario, tenant, recurso, acción, outcome y metadata segura;
- impedir datos bancarios completos en metadata.
```

---

## 19. Estados principales

### 19.1. BankAccount

```text id="h3t4sn"
draft -> active
active -> inactive
inactive -> active
active -> archived
inactive -> archived
```

Prohibido:

```text id="zfjlnf"
archived -> active sin restauración explícita futura
```

---

### 19.2. BankStatementImport

```text id="obevyd"
uploaded -> validating -> validated -> processing -> processed
uploaded -> validating -> failed
validated -> cancelled
processed -> archived
processedWithWarnings -> archived
```

---

### 19.3. BankTransaction

```text id="jjmjtt"
pending -> candidateFound
pending -> unmatched
pending -> matched
candidateFound -> matched
candidateFound -> unmatched
matched -> partiallyMatched si match revertido parcialmente
matched -> unmatched si match revertido
pending -> duplicate
pending -> ignored
pending -> exception
unmatched -> exception
exception -> matched
matched -> archived
```

---

### 19.4. ReconciliationSession

```text id="mqsbgn"
draft -> open
open -> reviewing
reviewing -> closed
closed -> reopened
reopened -> reviewing
closed -> archived
```

---

### 19.5. ReconciliationCandidate

```text id="mj1jtl"
suggested -> accepted
suggested -> rejected
suggested -> expired
suggested -> superseded
accepted -> superseded si match revertido
```

---

### 19.6. ReconciliationMatch

```text id="cxkd5q"
confirmed -> reversed
confirmed -> archived
reversed -> archived
```

---

### 19.7. ReconciliationException

```text id="y2332k"
open -> inReview
open -> resolved
inReview -> resolved
open -> ignored
resolved -> archived
ignored -> archived
```

---

## 20. Matching y score

### 20.1. Factores de coincidencia

El sistema puede calcular score usando:

```text id="yqbxeo"
- coincidencia exacta de monto;
- fecha bancaria cercana a fecha de pago;
- referencia bancaria;
- número de comprobante;
- descripción del movimiento;
- nombre parcial del pagador si existe;
- unidad habitacional si aparece en referencia;
- identificación parcial si aparece en referencia;
- banco/cuenta;
- historial de pagos.
```

---

### 20.2. Score sugerido

Rango:

```text id="k3go0e"
0 - 100
```

Clasificación recomendada:

```text id="ttk6gs"
90-100: coincidencia alta
70-89: coincidencia media
50-69: coincidencia baja
0-49: no sugerir por defecto
```

---

### 20.3. Reglas de seguridad

```text id="bn0kgx"
- score no confirma match;
- score debe explicar razones;
- score debe ser determinístico en MVP;
- IA no debe usarse con datos reales;
- candidato puede ser rechazado;
- candidato puede expirar;
- candidato no modifica pagos.
```

---

## 21. Seguridad

### 21.1. Amenazas prioritarias

```text id="trhat5"
- acceso cross-tenant a movimientos bancarios;
- importación en cuenta bancaria de otro tenant;
- conciliación de pago de otro tenant;
- match fraudulento;
- duplicación de movimientos;
- confirmación automática indebida;
- alteración de archivo importado;
- exposición de número completo de cuenta;
- exposición de archivo bancario;
- logs con referencias bancarias sensibles;
- auditoría con datos financieros excesivos;
- reportes públicos accidentales;
- uso de IA externa con movimientos reales.
```

---

### 21.2. Controles obligatorios

```text id="ibqjj5"
- AuthGuard;
- TenantGuard;
- PermissionGuard;
- BankAccountTenantPolicy;
- BankTransactionTenantPolicy;
- PaymentReconciliationPolicy;
- ReconciliationSessionStatePolicy;
- ReconciliationMatchPolicy;
- ImportFileValidationPolicy;
- DuplicateDetectionPolicy;
- DecimalMoneyPolicy;
- AuditPolicy;
- DTO minimization;
- no public endpoints;
- no tenantId body;
- no automatic irreversible confirmation;
- no full account number exposure;
- no real bank data to external IA.
```

---

### 21.3. Datos prohibidos en logs/auditoría

```text id="j5pdce"
número completo de cuenta
archivo bancario completo
contenido completo de fila importada
referencias bancarias completas si contienen datos personales
identificación completa
datos bancarios completos del pagador
storageKey
signed URL
tokens
cookies
Authorization header
SQL raw
stack trace en producción
```

---

## 22. Auditoría

### 22.1. Eventos mínimos

```text id="ht4nbd"
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

### 22.2. Metadata permitida

```text id="b8tkd1"
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

### 22.3. Metadata prohibida

```text id="sgzcac"
accountNumber completo
storageKey
signedUrl
archivo completo
fila bancaria completa
contenido completo de descripción bancaria
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

## 23. Observabilidad

### 23.1. Logs sugeridos

```text id="hdqiw3"
bankAccount.created
bankStatementImport.created
bankStatementImport.processed
bankStatementImport.failed
bankTransaction.created
reconciliationCandidate.generated
reconciliationMatch.confirmed
reconciliationMatch.reversed
reconciliationException.created
reconciliationSession.closed
```

---

### 23.2. Métricas sugeridas

```text id="qmumjq"
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

### 23.3. Labels permitidos

```text id="rss8aa"
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

### 23.4. Labels prohibidos

```text id="l76d58"
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

## 24. API y DTOs

### 24.1. Formato estándar de respuesta

```json id="xkjr5m"
{
  "data": {},
  "meta": {
    "traceId": "req_123456"
  }
}
```

---

### 24.2. Error estándar

```json id="rykyui"
{
  "error": {
    "code": "BANK_TRANSACTION_NOT_FOUND",
    "message": "Bank transaction not found.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 24.3. DTOs principales esperados

```text id="v3yn00"
CreateBankAccountDto
UpdateBankAccountDto
BankAccountDto
BankAccountListItemDto

CreateBankStatementImportDto
ProcessBankStatementImportDto
BankStatementImportDto
BankStatementImportListItemDto
BankStatementImportErrorDto

BankTransactionDto
BankTransactionListItemDto
UpdateBankTransactionClassificationDto
IgnoreBankTransactionDto

CreateReconciliationSessionDto
UpdateReconciliationSessionDto
CloseReconciliationSessionDto
ReopenReconciliationSessionDto
ReconciliationSessionDto
ReconciliationSessionSummaryDto

GenerateReconciliationCandidatesDto
ReconciliationCandidateDto
AcceptReconciliationCandidateDto
RejectReconciliationCandidateDto

CreateReconciliationMatchDto
ConfirmReconciliationMatchDto
ReverseReconciliationMatchDto
ReconciliationMatchDto
ReconciliationMatchItemDto

CreateReconciliationExceptionDto
UpdateReconciliationExceptionDto
ResolveReconciliationExceptionDto
IgnoreReconciliationExceptionDto
ReconciliationExceptionDto
```

---

### 24.4. Campos prohibidos en body

```text id="gw87vs"
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
secureDocumentId generado por flujo interno
secureDocumentFileId generado por flujo interno
```

---

## 25. Reportes iniciales

### 25.1. Resumen de conciliación

Debe mostrar:

```text id="kl07aa"
cuenta bancaria
periodo
movimientos importados
movimientos conciliados
movimientos pendientes
pagos conciliados
pagos pendientes
excepciones abiertas
diferencias
estado de sesión
```

---

### 25.2. Movimientos bancarios no conciliados

Debe mostrar:

```text id="wm9vb4"
transactionDate
description sanitizada
direction
amount
currency
status
exceptionStatus
```

No debe mostrar:

```text id="ey8yl1"
accountNumber completo
storageKey
archivo completo
referencias sensibles completas
```

---

### 25.3. Pagos no conciliados

Debe mostrar pagos registrados que aún no tienen match bancario.

---

### 25.4. Excepciones

Debe mostrar excepciones abiertas, resueltas e ignoradas.

---

### 25.5. Exportación

La exportación debe usar Secure Document Storage si genera archivo persistente.

---

## 26. Pruebas requeridas

### 26.1. Unit tests

```text id="k5y4aw"
BankAccount entity
BankStatementImport entity
BankTransaction entity
ReconciliationSession entity
ReconciliationCandidate entity
ReconciliationMatch entity
ReconciliationMatchItem entity
ReconciliationException entity
Money Decimal value object
BankAccountNumber value object
BankTransactionFingerprint service
ImportParser service
CandidateScore service
```

---

### 26.2. Integration tests

```text id="jaf46h"
PrismaBankAccountRepository
PrismaBankStatementImportRepository
PrismaBankTransactionRepository
PrismaReconciliationSessionRepository
PrismaReconciliationCandidateRepository
PrismaReconciliationMatchRepository
PrismaReconciliationExceptionRepository
PaymentReconciliationAdapter
SecureDocumentStorageAdapter integration
Audit integration
```

---

### 26.3. API tests

```text id="orwjgu"
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

### 26.4. Security tests

```text id="zlaqzv"
no tenantId body
no cross-tenant bank account
no cross-tenant statement import
no cross-tenant bank transaction
no cross-tenant reconciliation session
no cross-tenant payment match
no duplicate movement import
no full account number exposure
no storageKey exposure
no public endpoints
no automatic confirmation without permission
no logs with full bank data
no audit with full bank data
```

---

### 26.5. Financial integrity tests

```text id="k0dk88"
Decimal exact amounts
no float arithmetic
match 1:1 exact amount
match 1:N total exact amount
match N:1 total exact amount
differenceAmount recorded
reversal restores reconciliation status
closed session blocks changes
reopened session requires permission
```

---

## 27. Criterios de aceptación

### 27.1. Funcionales

```text id="s6y6xh"
- permite registrar cuentas bancarias;
- protege número completo de cuenta;
- permite activar/desactivar/archivar cuentas;
- permite importar CSV/XLSX;
- registra archivo importado en Secure Document Storage;
- procesa movimientos válidos;
- detecta duplicados;
- lista movimientos;
- crea sesiones de conciliación;
- genera candidatos;
- permite aceptar/rechazar candidatos;
- permite confirmar matches;
- permite matches 1:1;
- permite matches 1:N;
- permite matches N:1;
- registra diferencias;
- permite excepciones;
- permite resolver excepciones;
- permite revertir matches;
- permite cerrar sesiones;
- permite reabrir sesiones bajo permiso;
- genera reportes básicos;
- audita operaciones críticas.
```

---

### 27.2. Seguridad

```text id="vf21rv"
- todas las tablas nuevas tienen tenant_id;
- toda consulta filtra por tenant_id;
- no acepta tenantId desde body;
- no permite cuenta bancaria cross-tenant;
- no permite movimiento cross-tenant;
- no permite pago cross-tenant;
- no permite conciliación cross-tenant;
- no expone accountNumber completo;
- no expone storageKey;
- no expone archivo bancario sin permiso;
- no crea endpoints públicos;
- no documenta endpoints públicos en OpenAPI;
- no confirma conciliaciones automáticamente sin permiso;
- no registra datos bancarios completos en logs;
- no registra datos bancarios completos en auditoría;
- no envía datos reales a IA externa.
```

---

### 27.3. Integridad financiera

```text id="hp6c0u"
- montos usan Decimal;
- no usa float/double para dinero;
- importación es idempotente;
- fingerprint evita duplicados;
- candidatos no modifican pagos;
- matches confirmados actualizan reconciliationStatus;
- reversos restauran estados;
- sesiones cerradas bloquean cambios;
- diferencias quedan registradas.
```

---

### 27.4. Performance

```text id="ddwcuk"
- listados paginados;
- pageSize máximo 100;
- procesamiento de archivo pequeño/mediano dentro del objetivo;
- generación de candidatos dentro del objetivo;
- índices por tenant_id, bankAccountId, fechas, status y fingerprint.
```

---

## 28. Casos borde

| Caso                                            | Resultado esperado |
| ----------------------------------------------- | ------------------ |
| Crear cuenta con `tenantId` en body             | 422                |
| Crear cuenta sin banco                          | 422                |
| Crear cuenta sin moneda                         | 422                |
| Exponer número completo de cuenta               | Falla crítica      |
| Importar en cuenta inactive                     | 409                |
| Importar en cuenta de otro tenant               | 403/404            |
| Importar archivo vacío                          | 422                |
| Importar MIME no permitido                      | 415                |
| Importar moneda no soportada                    | 422                |
| Reimportar mismo archivo                        | No duplica         |
| Reimportar mismos movimientos                   | Marca duplicados   |
| Movimiento sin fingerprint                      | Falla              |
| Conciliar movimiento tenant B con pago tenant A | 403/404            |
| Conciliar pago rechazado                        | 409                |
| Conciliar movimiento duplicate                  | 409 salvo override |
| Confirmar candidato sin permiso                 | 403                |
| Candidato modifica pago antes de confirmarse    | Falla crítica      |
| Match con diferencia sin razón                  | 422                |
| Revertir match sin razón                        | 422                |
| Cerrar sesión con excepciones abiertas críticas | 409                |
| Modificar sesión closed                         | 409                |
| Reabrir sesión sin permiso                      | 403                |
| Endpoint público existe                         | Falla crítica      |
| Log contiene cuenta completa                    | Falla crítica      |
| Audit contiene archivo bancario completo        | Falla crítica      |

---

## 29. Riesgos

| Riesgo                           |    Impacto | Mitigación                                |
| -------------------------------- | ---------: | ----------------------------------------- |
| Movimiento cross-tenant          |    Crítico | `tenant_id`, guards, tests                |
| Pago cross-tenant conciliado     |    Crítico | Payment adapter tenant-scoped             |
| Duplicación de movimientos       |       Alto | fingerprint + idempotencia                |
| Conciliación fraudulenta         |    Crítico | permisos, auditoría, revisión manual      |
| Confirmación automática indebida |       Alto | candidates no-effect, manual confirmation |
| Monto impreciso                  |       Alto | Decimal                                   |
| Exposición número de cuenta      |       Alto | masked/hash only                          |
| Archivo bancario expuesto        |    Crítico | Secure Document Storage                   |
| Logs con datos bancarios         |       Alto | sanitización                              |
| Sesión cerrada modificable       | Medio/Alto | state machine                             |
| Duplicados por concurrencia      |      Medio | unique constraints                        |
| Candidatos ambiguos              |      Medio | score + revisión humana                   |
| Import parser incorrecto         |       Alto | validación y tests por formato            |
| IA externa con datos reales      |    Crítico | prohibición MVP                           |

---

## 30. Dependencias futuras

Quedan como futuras specs o extensiones:

```text id="a5o8ag"
018-payment-provider-integration
019-open-banking-integration
020-accounting-ledger
021-supplier-payments
022-bank-rules-automation
023-advanced-reconciliation
024-financial-closing
025-reconciliation-ai-assistance
026-bank-statement-ocr
027-cash-management
028-multi-currency
```

---

## 31. Preguntas abiertas

```text id="sun5h7"
1. ¿Qué bancos ecuatorianos se soportarán inicialmente en plantillas CSV/XLSX?
2. ¿El formato de importación será genérico o por banco?
3. ¿Se permitirá cargar estados bancarios manuales sin archivo?
4. ¿Se usará una cuenta bancaria por conjunto o múltiples cuentas?
5. ¿Se requiere conciliación de egresos o solo ingresos en MVP?
6. ¿Se permitirá tolerancia de centavos o debe ser exacta?
7. ¿Se permitirá conciliación parcial desde MVP?
8. ¿Qué estados de Payment serán conciliables exactamente?
9. ¿Se agregará reconciliationStatus en payments o tabla auxiliar?
10. ¿Quién puede reabrir sesiones cerradas?
11. ¿Qué excepciones impiden cerrar sesión?
12. ¿Se requiere exportación PDF/XLSX de conciliación?
13. ¿Se requiere soporte para depósitos agrupados?
14. ¿Se requiere soporte para comisiones bancarias?
15. ¿Se requiere soporte para transferencias internas entre cuentas del mismo tenant?
```

---

## 32. Decisión MVP recomendada

Para el MVP se recomienda:

```text id="zhpfcb"
- soportar una o varias cuentas bancarias por tenant;
- moneda USD;
- importación CSV/XLSX;
- archivos importados vía Secure Document Storage;
- normalización determinística;
- fingerprint para duplicados;
- movimientos de crédito y débito;
- conciliación principalmente de ingresos contra Payments;
- candidatos determinísticos;
- confirmación humana obligatoria;
- match 1:1, 1:N y N:1;
- differenceAmount con reason;
- excepciones manuales;
- cierre de sesión;
- reapertura con permiso reforzado;
- auditoría estricta;
- no API bancaria directa;
- no OCR;
- no IA con datos reales;
- no endpoints públicos.
```

---

## 33. Archivos derivados esperados

```text id="pb35um"
docs/specs/017-bank-reconciliation/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 34. Resultado esperado

Al finalizar el módulo `017-bank-reconciliation`, RESIDENT Core contará con un sistema de conciliación bancaria inicial que permitirá importar movimientos bancarios, detectar duplicados, compararlos contra pagos, sugerir coincidencias, confirmar matches, gestionar excepciones y cerrar conciliaciones con trazabilidad.

Resultado esperado:

```text id="av3lqa"
- cuentas bancarias tenant-scoped;
- importaciones bancarias auditadas;
- archivos bancarios protegidos;
- movimientos bancarios normalizados;
- duplicados detectados;
- sesiones de conciliación;
- candidatos de match;
- matches confirmados;
- soporte 1:1, 1:N y N:1;
- excepciones controladas;
- reversos de conciliación;
- cierre de sesiones;
- reportes básicos;
- integración con Payments;
- integración con Account Statements;
- integración con Basic Reports;
- integración con Secure Document Storage;
- auditoría financiera;
- no exposición pública;
- no confirmación automática irreversible;
- no IA con datos reales.
```

---

## 35. Conclusión

`017-bank-reconciliation` es un módulo financiero crítico. Su diseño debe priorizar integridad, trazabilidad, control humano y aislamiento por tenant.

La conciliación bancaria no debe convertirse en una automatización opaca. Debe actuar como una capa de verificación entre movimientos reales del banco y pagos registrados en RESIDENT Core, manteniendo evidencia, explicación, reversibilidad y auditoría.

El MVP debe concentrarse en:

```text id="x1ggle"
importar
normalizar
detectar duplicados
sugerir
confirmar
excepcionar
cerrar
auditar
```

No debe concentrarse todavía en:

```text id="eylc5h"
Open Banking
OCR
IA
contabilidad completa
asientos contables
automatización irreversible
publicación externa
```
