# Security Notes — Spec 017 Bank Reconciliation

## 1. Información del documento

| Campo           | Valor                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                                            |
| Spec ID         | 017                                                                                                                                                                                      |
| Módulo          | Bank Reconciliation                                                                                                                                                                      |
| Documento       | Security Notes                                                                                                                                                                           |
| Ruta            | `docs/specs/017-bank-reconciliation/security-notes.md`                                                                                                                                   |
| Versión         | 0.1                                                                                                                                                                                      |
| Estado          | needs-review                                                                                                                                                                             |
| Fecha           | 2026-07-21                                                                                                                                                                               |
| Documento base  | `docs/specs/017-bank-reconciliation/spec.md`                                                                                                                                             |
| Plan técnico    | `docs/specs/017-bank-reconciliation/plan.md`                                                                                                                                             |
| Modelo de datos | `docs/specs/017-bank-reconciliation/data-model.md`                                                                                                                                       |
| Contrato API    | `docs/specs/017-bank-reconciliation/api-contract.md`                                                                                                                                     |
| Plan de pruebas | `docs/specs/017-bank-reconciliation/test-plan.md`                                                                                                                                        |
| Tareas          | `docs/specs/017-bank-reconciliation/tasks.md`                                                                                                                                            |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports`, `016-secure-document-storage` |
| Naturaleza      | Tenant-scoped / Financial-control / Import-driven / Match-aware / Exception-aware / Audit-heavy / Non-public                                                                             |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `017-bank-reconciliation`.

El módulo de conciliación bancaria es una capacidad financiera crítica de RESIDENT Core. Su función es comparar movimientos bancarios importados contra pagos registrados, sugerir coincidencias, confirmar conciliaciones, registrar excepciones, revertir matches y cerrar periodos de conciliación.

Regla central:

```text id="cnl7dd"
Toda cuenta bancaria, importación, archivo bancario, movimiento, sesión, candidato, match, item, excepción, reporte y evento de auditoría debe proteger tenant isolation, integridad financiera, datos bancarios sensibles, idempotencia, trazabilidad, reversibilidad, confidencialidad documental, ausencia de endpoints públicos y no exposición de números completos de cuenta, storageKey, referencias sensibles o archivos bancarios completos.
```

---

## 3. Resumen ejecutivo de seguridad

`Bank Reconciliation` opera sobre datos financieros sensibles. Un error de diseño puede producir:

```text id="m1ejsq"
- exposición de cuentas bancarias;
- exposición de movimientos bancarios;
- conciliación de pagos de otro tenant;
- duplicación de movimientos importados;
- conciliaciones fraudulentas;
- pagos marcados como conciliados incorrectamente;
- alteración de reportes financieros;
- exposición de archivos bancarios;
- filtración de storageKey;
- logs con datos bancarios reales;
- auditoría con información excesiva;
- acceso público accidental;
- uso indebido de IA con datos financieros reales.
```

Por lo tanto, la seguridad del módulo se basa en:

```text id="ubh5rw"
- tenant_id obligatorio;
- autorización por permiso;
- validación de cuenta bancaria;
- validación de pagos conciliables;
- validación de movimientos conciliables;
- control de estados;
- idempotencia de importación;
- fingerprint determinístico;
- Decimal para dinero;
- candidatos sin efecto financiero;
- confirmación humana en MVP;
- reversibilidad;
- auditoría financiera;
- storage seguro;
- DTOs minimizados;
- logs sanitizados;
- ausencia total de endpoints públicos.
```

---

## 4. Alcance de seguridad

### 4.1. Incluido

Estas notas cubren:

```text id="cnb3is"
1. Autenticación.
2. Autorización.
3. Tenant isolation.
4. Protección de cuentas bancarias.
5. Protección de números de cuenta.
6. Protección de archivos bancarios importados.
7. Integración segura con Secure Document Storage.
8. Validación segura de CSV/XLSX.
9. Normalización segura.
10. Fingerprint e idempotencia.
11. Detección de duplicados.
12. Integridad monetaria.
13. Seguridad de movimientos bancarios.
14. Seguridad de sesiones de conciliación.
15. Seguridad de candidatos.
16. Seguridad de matches.
17. Seguridad de reversos.
18. Seguridad de excepciones.
19. Seguridad de reportes.
20. Seguridad de exportaciones.
21. Integración segura con Payments.
22. Integración segura con Account Statements.
23. Auditoría financiera.
24. Logs seguros.
25. Métricas seguras.
26. OpenAPI.
27. CI/CD security gates.
28. No endpoints públicos.
29. No acceso directo desde WordPress.
30. No IA externa con datos reales.
```

---

### 4.2. Fuera de alcance del MVP

No se implementa ni se asegura como funcionalidad activa en esta spec:

```text id="crk6t7"
- Open Banking;
- conexión directa con APIs bancarias reales;
- scraping bancario;
- OCR de estados bancarios PDF;
- IA con datos financieros reales;
- conciliación automática irreversible;
- contabilidad completa;
- asientos contables;
- plan de cuentas;
- tesorería avanzada;
- pasarelas de pago;
- tarjetas de crédito;
- integración SRI;
- libros contables oficiales;
- firma electrónica;
- certificación legal de estados bancarios;
- conciliación multi-moneda avanzada;
- reglas automáticas por banco;
- plantillas específicas por banco ecuatoriano.
```

Todo elemento anterior debe permanecer desactivado, inexistente o protegido mediante feature flags.

---

## 5. Principio de seguridad dominante

El principio dominante del módulo es:

```text id="b8fy6f"
La conciliación bancaria no debe crear confianza financiera automática; debe aportar evidencia, sugerencias, control humano, reversibilidad y auditoría.
```

Implicaciones:

```text id="b2ej0f"
- un movimiento bancario no es un pago confirmado automáticamente;
- un candidato no modifica pagos;
- un score no confirma una conciliación;
- una importación no debe duplicar movimientos;
- un match requiere validación de tenant, estado, monto y permiso;
- un reverso no elimina historial;
- una sesión cerrada bloquea cambios ordinarios;
- todo cambio financiero-operativo se audita.
```

---

## 6. Activos protegidos

### 6.1. Cuentas bancarias

```text id="ko4f6o"
bank_accounts
```

Protegen:

* nombre del banco;
* nombre de cuenta;
* número enmascarado;
* hash del número;
* tipo de cuenta;
* moneda;
* estado;
* metadata administrativa.

---

### 6.2. Archivos bancarios importados

```text id="t86qcv"
secure_documents
secure_document_files
bank_statement_imports
```

Protegen:

* CSV/XLSX bancario;
* hash del archivo;
* nombre original;
* documento seguro;
* archivo seguro;
* conteos de procesamiento;
* errores;
* trazabilidad.

---

### 6.3. Movimientos bancarios

```text id="dpa5mn"
bank_transactions
```

Protegen:

* fechas;
* descripción;
* referencia;
* referencia bancaria;
* tipo;
* dirección;
* monto;
* moneda;
* saldo posterior;
* fingerprint;
* estado;
* duplicados.

---

### 6.4. Sesiones de conciliación

```text id="hte590"
reconciliation_sessions
```

Protegen:

* cuenta bancaria;
* periodo;
* saldos;
* totales;
* estado de cierre;
* reapertura;
* metadata de control.

---

### 6.5. Candidatos de conciliación

```text id="ydqq27"
reconciliation_candidates
```

Protegen:

* movimiento sugerido;
* pago sugerido;
* score;
* scoreReason;
* matchType;
* estado de revisión.

---

### 6.6. Matches confirmados

```text id="sekj4e"
reconciliation_matches
reconciliation_match_items
```

Protegen:

* conciliación confirmada;
* items vinculados;
* montos aplicados;
* diferencias;
* razón de diferencia;
* reversos;
* razón de reverso.

---

### 6.7. Excepciones

```text id="r4gog0"
reconciliation_exceptions
```

Protegen:

* movimientos sin pago;
* pagos sin movimiento;
* inconsistencias;
* severidad;
* estado;
* resolución;
* ignorado;
* historial.

---

### 6.8. Reportes y exportaciones

Protegen:

```text id="gciud7"
summary
unmatched bank transactions
unmatched payments
exceptions
bank account balances
exports CSV/XLSX/PDF
```

---

## 7. Clasificación de datos

### 7.1. Datos altamente sensibles

```text id="my19ob"
número completo de cuenta bancaria
archivo bancario completo
filas bancarias completas
referencia bancaria completa si identifica personas o cuentas
descripción bancaria completa si contiene datos personales
accountNumberHash
fileHash completo
fingerprint
storageKey
signedUrl
datos financieros reales
movimientos bancarios reales
comprobantes reales
tokens
cookies
secretos
Authorization header
```

---

### 7.2. Datos confidenciales

```text id="j0c4j4"
bankAccountId
statementImportId
bankTransactionId
reconciliationSessionId
candidateId
matchId
exceptionId
paymentId
paymentIds
amount
currency
direction
transactionType
status
score
scoreBand
exceptionType
severity
differenceAmount
hashPrefix
accountNumberMasked
```

---

### 7.3. Datos permitidos en DTO estándar

```text id="ojq3f2"
id
bankName
accountName
accountNumberMasked
accountType
currency
status
isDefault
importType
originalFileName
hashPrefix
hashAlgorithm
periodStart
periodEnd
totalRows
validRows
invalidRows
duplicateRows
createdTransactions
transactionDate
postedDate
description sanitizada
referencePreview
bankReferencePreview
direction
amount como string decimal
balanceAfter
score
scoreBand
scoreReason sanitizado
matchType
differenceAmount
differenceReason
exceptionType
severity
resolutionNotes
createdAt
updatedAt
processedAt
confirmedAt
reversedAt
closedAt
metadata segura
```

---

### 7.4. Datos prohibidos en DTO estándar

```text id="e22su4"
tenantId
número completo de cuenta
accountNumberHash
fileHash completo
fingerprint
storageKey
signedUrl
archivo bancario completo
fila bancaria completa
referencia bancaria sensible completa
descripción bancaria no sanitizada
tokens
cookies
secretos
SQL raw
stack trace
actor fields enviados por cliente
```

---

## 8. Fronteras de confianza

### 8.1. Cliente/API

Riesgos:

```text id="p7d0w0"
- cliente envía tenantId falso;
- cliente envía accountNumberHash;
- cliente envía fingerprint;
- cliente envía fileHash;
- cliente envía secureDocumentId manual;
- cliente envía storageKey;
- cliente intenta conciliar paymentId de otro tenant;
- cliente intenta conciliar bankTransactionId de otro tenant;
- cliente intenta modificar status directamente;
- cliente intenta enviar montos calculados como fuente de verdad;
- cliente intenta crear match con diferencia sin razón.
```

Controles:

```text id="qhwk54"
- DTO whitelist;
- forbidNonWhitelisted;
- TenantGuard;
- PermissionGuard;
- validación tenant-scoped de todos los IDs;
- montos calculados en servidor;
- actores derivados del token;
- status modificado solo por endpoints de transición;
- rechazo de tenantId en body;
- rechazo de storageKey, fingerprint, fileHash y accountNumberHash.
```

---

### 8.2. API/Base de datos

Riesgos:

```text id="f7us6v"
- consultas por id simple;
- cross-tenant en bank_accounts;
- cross-tenant en bank_transactions;
- cross-tenant en reconciliation_matches;
- constraints insuficientes;
- duplicados por concurrencia;
- estados financieros inconsistentes.
```

Controles:

```text id="jvcejz"
- tenant_id obligatorio;
- consultas findFirst con tenantId;
- prohibir findUnique por id simple;
- constraints raw;
- índices parciales;
- transacciones DB;
- tests multitenant;
- tests de concurrencia.
```

---

### 8.3. API/Secure Document Storage

Riesgos:

```text id="bfnzd8"
- archivo bancario expuesto;
- storageKey filtrado;
- secureDocumentId de otro tenant;
- archivo importado accesible desde /me;
- archivo importado accesible desde /public;
- signedUrl persistente.
```

Controles:

```text id="f20qfe"
- sourceModule=bankReconciliation;
- visibility=administrative;
- sensitivity=restricted;
- ownerType=tenant;
- validación tenant-scoped de secureDocumentId;
- no exponer storageKey;
- descarga solo con permiso financiero/documental;
- sin endpoints públicos;
- sin /me para archivos bancarios;
- auditoría documental.
```

---

### 8.4. API/Payments

Riesgos:

```text id="g4kkql"
- pago de otro tenant conciliado;
- pago rejected conciliado;
- pago reversed conciliado;
- pago ya conciliado duplicado;
- candidate modifica Payment;
- reverse deja Payment inconsistente.
```

Controles:

```text id="gacstx"
- PaymentReconciliationPort tenant-scoped;
- estados conciliables explícitos;
- transacciones o consistencia controlada;
- candidate sin side effect;
- match confirmado actualiza Payment;
- reverse actualiza Payment;
- audit en ambos lados si aplica.
```

---

### 8.5. API/Reports

Riesgos:

```text id="szb5re"
- reportes incluyen tenant B;
- reportes exponen número completo de cuenta;
- reportes exponen referencias sensibles completas;
- export expone storageKey;
- export queda público.
```

Controles:

```text id="ksq06m"
- filtros por tenant;
- DTO minimizado;
- accountNumberMasked únicamente;
- referencePreview;
- Secure Document Storage para exports persistidos;
- no storageKey;
- no public endpoints;
- tests de snapshots seguros.
```

---

## 9. Threat model resumido

### 9.1. Spoofing

Amenazas:

```text id="yjg4v1"
- usuario intenta operar como FinancialManager sin permiso;
- usuario intenta confirmar match como otro actor;
- usuario envía confirmedBy desde body;
- usuario envía importedBy desde body;
- usuario intenta actuar sobre tenant equivocado.
```

Controles:

```text id="zn7846"
- Keycloak/OIDC;
- membership activa;
- permisos en Core;
- actor derivado del token;
- campos actor rechazados desde body;
- auditoría con actor real.
```

---

### 9.2. Tampering

Amenazas:

```text id="c9mce9"
- modificar status directamente;
- alterar fingerprint;
- alterar fileHash;
- alterar accountNumberHash;
- modificar montos calculados;
- alterar differenceAmount;
- modificar items después de match;
- alterar sesión cerrada;
- alterar archivo importado.
```

Controles:

```text id="y6k7qr"
- status por state machine;
- fingerprint server-side;
- fileHash server-side;
- accountNumberHash server-side;
- totales calculados por servidor;
- match items inmutables tras confirmación;
- closed session bloquea cambios;
- archivo importado protegido por Secure Document Storage;
- auditoría financiera.
```

---

### 9.3. Repudiation

Amenazas:

```text id="k44k8y"
- usuario niega haber importado archivo;
- usuario niega haber confirmado match;
- usuario niega haber revertido conciliación;
- usuario niega haber cerrado sesión;
- usuario niega haber ignorado excepción.
```

Controles:

```text id="a6h2jk"
- audit events;
- actorUserId desde token;
- traceId;
- requestId;
- timestamps UTC;
- no eliminación física ordinaria;
- reversos conservan historial.
```

---

### 9.4. Information Disclosure

Amenazas:

```text id="pzl691"
- exposición de número completo de cuenta;
- exposición de accountNumberHash;
- exposición de movimientos de otro tenant;
- exposición de archivo bancario;
- exposición de storageKey;
- exposición de referencias bancarias completas;
- exposición de pagos no propios;
- exposición de reportes en WordPress;
- logs con datos bancarios.
```

Controles:

```text id="u8kp48"
- DTO minimization;
- accountNumberMasked;
- no accountNumberHash estándar;
- no fileHash completo;
- referencePreview;
- tenant isolation;
- Secure Document Storage restricted;
- no public endpoints;
- no WordPress access;
- log/audit sanitization.
```

---

### 9.5. Denial of Service

Amenazas:

```text id="xyrsqz"
- carga de archivos enormes;
- XLSX con muchas hojas;
- CSV con millones de filas;
- generación masiva de candidatos;
- reportes pesados;
- exportaciones excesivas;
- imports concurrentes.
```

Controles:

```text id="j0g1yr"
- límite de tamaño;
- límite de filas;
- rate limiting;
- pageSize máximo 100;
- procesamiento por lotes;
- timeouts;
- feature flags;
- futura cola BullMQ;
- métricas y alertas.
```

---

### 9.6. Elevation of Privilege

Amenazas:

```text id="tq2ygj"
- usuario sin permisos confirma match;
- usuario sin permisos reabre sesión;
- BoardMember accede a movimientos bancarios completos;
- PlatformAdmin accede a datos financieros tenant sin control;
- residente accede a conciliación interna.
```

Controles:

```text id="nt25m8"
- PermissionGuard granular;
- PlatformAdmin sin acceso automático;
- sin endpoints /me en MVP;
- sin endpoints public;
- roles financieros explícitos;
- auditoría reforzada para accesos excepcionales.
```

---

## 10. Autenticación

Todos los endpoints requieren:

```http id="mzu7bg"
Authorization: Bearer <access_token>
```

Reglas:

```text id="ri47dh"
- no endpoints anónimos;
- no endpoints públicos;
- token válido;
- usuario activo;
- membership activa;
- tenant activo;
- Keycloak autentica;
- RESIDENT Core autoriza;
- actor se deriva del token, no del body.
```

Errores esperados:

```text id="qb81is"
401 sin token
401 token inválido
403 usuario disabled
403 sin membership
403 tenant suspended
403 tenant archived
403 sin permiso
404 recurso no visible por tenant
```

---

## 11. Autorización

### 11.1. Cuentas bancarias

```text id="r2gkmb"
bankAccounts.create
bankAccounts.read
bankAccounts.update
bankAccounts.activate
bankAccounts.deactivate
bankAccounts.archive
```

---

### 11.2. Importaciones

```text id="eox8hs"
bankStatementImports.create
bankStatementImports.read
bankStatementImports.process
bankStatementImports.cancel
bankStatementImports.archive
```

---

### 11.3. Movimientos

```text id="cbupfp"
bankTransactions.read
bankTransactions.updateClassification
bankTransactions.ignore
bankTransactions.archive
```

---

### 11.4. Sesiones

```text id="g0sqi0"
reconciliationSessions.create
reconciliationSessions.read
reconciliationSessions.update
reconciliationSessions.close
reconciliationSessions.reopen
reconciliationSessions.archive
```

---

### 11.5. Candidatos

```text id="vq8baz"
reconciliationCandidates.generate
reconciliationCandidates.read
reconciliationCandidates.accept
reconciliationCandidates.reject
```

---

### 11.6. Matches

```text id="vzqv8o"
reconciliationMatches.create
reconciliationMatches.read
reconciliationMatches.confirm
reconciliationMatches.reverse
reconciliationMatches.archive
```

---

### 11.7. Excepciones

```text id="xgjpfu"
reconciliationExceptions.create
reconciliationExceptions.read
reconciliationExceptions.update
reconciliationExceptions.resolve
reconciliationExceptions.ignore
reconciliationExceptions.archive
```

---

### 11.8. Reportes y auditoría

```text id="d085kb"
reconciliationReports.read
reconciliationReports.export
reconciliation.audit.read
```

---

### 11.9. Regla PlatformAdmin

```text id="u3d9c2"
PlatformAdmin no accede automáticamente a cuentas bancarias, movimientos, archivos importados, sesiones, matches, excepciones ni reportes financieros de tenants.
```

Cualquier acceso excepcional requiere:

```text id="p5wid8"
- permiso explícito;
- contexto tenant;
- justificación;
- auditoría reforzada;
- minimización de datos.
```

---

## 12. Tenant isolation

### 12.1. Tablas tenant-scoped

Todas las tablas nuevas tienen `tenant_id`:

```text id="h26mz9"
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

### 12.2. Patrón requerido

```typescript id="islu5f"
await prisma.bankTransaction.findFirst({
  where: {
    id: bankTransactionId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

---

### 12.3. Patrón prohibido

```typescript id="qjfe61"
await prisma.bankTransaction.findUnique({
  where: { id: bankTransactionId }
});
```

También prohibido:

```typescript id="rabave"
await prisma.bankAccount.findUnique({ where: { id: bankAccountId } });
await prisma.bankStatementImport.findUnique({ where: { id: importId } });
await prisma.reconciliationSession.findUnique({ where: { id: sessionId } });
await prisma.reconciliationCandidate.findUnique({ where: { id: candidateId } });
await prisma.reconciliationMatch.findUnique({ where: { id: matchId } });
await prisma.reconciliationException.findUnique({ where: { id: exceptionId } });
```

---

### 12.4. Referencias que deben validarse contra tenant

```text id="rcs224"
bankAccountId
statementImportId
bankTransactionId
reconciliationSessionId
candidateId
matchId
exceptionId
paymentId
paymentIds
secureDocumentId
secureDocumentFileId
duplicateOfTransactionId
```

---

### 12.5. Respuesta ante cross-tenant

Recomendación:

```text id="z1tbvn"
Responder 404 para recursos pertenecientes a otro tenant, evitando revelar su existencia.
```

---

## 13. Protección de número de cuenta

### 13.1. Datos persistidos

Permitido:

```text id="cc6tb8"
accountNumberMasked
accountNumberHash
```

Prohibido en MVP:

```text id="fez786"
accountNumber completo persistido
```

---

### 13.2. DTOs

Permitido exponer:

```text id="pfc05i"
accountNumberMasked
```

Prohibido exponer:

```text id="g1nb1w"
accountNumber completo
accountNumberHash
normalization input
tenantScopedPepper
```

---

### 13.3. Logs y auditoría

Prohibido registrar:

```text id="imneor"
accountNumber completo
accountNumberHash
payload original con accountNumber
metadata con accountNumber
```

---

### 13.4. Hash de cuenta

Regla:

```text id="sa3qca"
accountNumberHash se usa para control interno y deduplicación, no como dato público ni como identificador externo.
```

---

## 14. Seguridad de archivos importados

### 14.1. Formatos permitidos MVP

```text id="ok1udp"
CSV
XLSX
```

---

### 14.2. Validaciones obligatorias

```text id="yu4ddv"
- archivo obligatorio;
- archivo no vacío;
- tamaño máximo configurado;
- MIME permitido;
- extensión permitida;
- fileHash calculado en servidor;
- hashAlgorithm=SHA-256;
- storage mediante Secure Document Storage;
- no storageKey desde cliente;
- no secureDocumentId manual;
- no secureDocumentFileId manual.
```

---

### 14.3. Archivos prohibidos

```text id="ep379l"
PDF en MVP
HTML
JavaScript
Shell scripts
EXE
JAR
APK
ZIP no controlado
archivos cifrados no parseables
archivos con macros
archivos con MIME spoofing evidente
```

---

### 14.4. Secure Document Storage

Clasificación obligatoria:

```json id="unrbbg"
{
  "category": "administrativeDocument",
  "sourceModule": "bankReconciliation",
  "sourceResourceType": "bankStatementImport",
  "sensitivity": "restricted",
  "visibility": "administrative",
  "ownerType": "tenant"
}
```

---

### 14.5. Reglas de descarga

```text id="w62hj6"
- no descargar desde /me;
- no descargar desde /public;
- descargar solo con permiso financiero/documental;
- auditar descarga;
- no exponer storageKey;
- no persistir signedUrl.
```

---

## 15. Seguridad de importación

### 15.1. Reglas

```text id="o8uz0a"
- bankAccount debe estar active;
- bankAccount debe pertenecer al tenant;
- import debe tener periodo válido;
- import debe registrar fileHash;
- import debe ser idempotente;
- import processed no debe reprocesarse sin flujo explícito futuro;
- import cancelled no debe procesarse;
- import archived no debe procesarse.
```

---

### 15.2. Errores por fila

`BankStatementImportError` debe almacenar solo previews sanitizados.

Permitido:

```text id="mtct98"
rowNumber
errorCode
errorMessage
severity
rawRowPreview truncado
normalizedPreview truncado
```

Prohibido:

```text id="oa1rqj"
fila completa sensible
archivo completo
accountNumber completo
referencias sensibles completas
datos personales completos
storageKey
signedUrl
```

---

### 15.3. Procesamiento parcial

Si `allowPartialProcessing=true`:

```text id="r5sdax"
- filas válidas crean movimientos;
- filas inválidas crean errores;
- duplicados no crean movimientos conciliables;
- import puede quedar processedWithWarnings;
- conteos deben ser consistentes;
- auditoría debe registrar resumen.
```

---

## 16. Seguridad de fingerprint e idempotencia

### 16.1. Fingerprint

Regla:

```text id="jvgii6"
fingerprint se calcula en servidor con SHA-256 sobre un input canónico; nunca se acepta desde cliente.
```

Campos recomendados:

```text id="gct93j"
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

### 16.2. Idempotencia

La importación debe evitar duplicados por:

```text id="epwl5c"
fileHash
transactionFingerprint
Idempotency-Key
unique constraints
```

---

### 16.3. Duplicados

Reglas:

```text id="zycgof"
- duplicado no conciliable por defecto;
- duplicado debe quedar trazado;
- duplicado no debe inflar createdTransactions;
- duplicado debe incrementar duplicateRows;
- duplicado debe auditarse.
```

---

## 17. Integridad monetaria

### 17.1. Tipo obligatorio

```text id="eeb8zf"
Decimal
```

---

### 17.2. Prohibido

```text id="gi06xa"
float
double
JavaScript number para cálculos monetarios
redondeo implícito
comparaciones aproximadas no documentadas
```

---

### 17.3. Reglas

```text id="bwlfqz"
- montos externos como string decimal;
- amount > 0;
- currency=USD en MVP;
- totalBankAmount calculado en servidor;
- totalPaymentAmount calculado en servidor;
- differenceAmount calculado en servidor;
- differenceReason obligatorio si differenceAmount != 0.00;
- amountTolerance MVP = 0.00.
```

---

## 18. Seguridad de movimientos bancarios

### 18.1. Estados conciliables

Conciliables por defecto:

```text id="bk3dnt"
pending
candidateFound
unmatched
exception si la política lo permite
partiallyMatched si la operación corresponde
```

No conciliables:

```text id="p90jkr"
matched
duplicate
ignored
archived
```

---

### 18.2. Reglas

```text id="yr32s8"
- movimiento debe pertenecer al tenant;
- movimiento debe pertenecer a cuenta del tenant;
- movimiento debe pertenecer a import del tenant;
- movimiento duplicate no se concilia;
- movimiento ignored no se concilia;
- movimiento archived no se concilia;
- movimiento matched no se concilia nuevamente salvo flujo futuro explícito;
- classification update requiere permiso;
- ignore requiere razón;
- archive requiere razón.
```

---

## 19. Seguridad de Payments integration

### 19.1. Estados conciliables

```text id="qq4u6v"
confirmed
partiallyAllocated
allocated
```

---

### 19.2. Estados no conciliables

```text id="wd0pmd"
draft
reported
pendingValidation
rejected
cancelled
reversed
archived
alreadyReconciled salvo flujo controlado
```

---

### 19.3. Reglas

```text id="pakhp5"
- paymentId debe pertenecer al tenant;
- payment debe estar en estado conciliable;
- payment no debe estar ya conciliado;
- candidate no modifica payment;
- match confirmado actualiza reconciliationStatus;
- reverse actualiza reconciliationStatus;
- no modificar cargos;
- no modificar payment_allocations salvo contrato explícito;
- no reconstruir Account Statements desde movimientos bancarios.
```

---

## 20. Seguridad de candidatos

### 20.1. Regla central

```text id="ddbs0z"
Un ReconciliationCandidate es solo una sugerencia; no debe modificar Payment, BankTransaction, AccountStatement ni balances.
```

---

### 20.2. Score

El score debe ser:

```text id="m3dpe8"
determinístico
explicable
sanitizado
sin datos sensibles completos
sin IA externa en MVP
```

---

### 20.3. Reglas

```text id="n5kac1"
- no generar candidatos para sesión closed;
- no generar candidatos para pagos no conciliables;
- no generar candidatos para movimientos no conciliables;
- no duplicar candidatos activos;
- reject requiere razón;
- accept requiere permiso;
- si accept crea match en MVP, debe aplicar todas las reglas de match.
```

---

## 21. Seguridad de matches

### 21.1. Tipos MVP

```text id="vlvzrh"
oneBankTransactionToOnePayment
oneBankTransactionToManyPayments
manyBankTransactionsToOnePayment
manual
```

---

### 21.2. Validaciones obligatorias

```text id="jn26nv"
- session tenant-scoped;
- session open/reviewing/reopened;
- bankTransactionIds tenant-scoped;
- paymentIds tenant-scoped;
- movimientos conciliables;
- pagos conciliables;
- montos calculados por servidor;
- differenceReason si hay diferencia;
- permiso requerido;
- auditoría obligatoria.
```

---

### 21.3. Prohibiciones

```text id="f9z9pl"
- confirmar en sesión closed;
- confirmar en sesión archived;
- confirmar payment rejected;
- confirmar payment reversed;
- confirmar payment tenant B;
- confirmar bankTransaction tenant B;
- confirmar duplicate sin override futuro;
- aceptar totalBankAmount desde cliente como fuente de verdad;
- aceptar totalPaymentAmount desde cliente como fuente de verdad;
- eliminar items después de confirmar.
```

---

## 22. Seguridad de reversos

### 22.1. Regla central

```text id="dhm8xp"
Revertir una conciliación debe anular el efecto operativo del match, pero nunca eliminar la evidencia histórica.
```

---

### 22.2. Reglas

```text id="v770va"
- solo match confirmed puede revertirse;
- reverse requiere permiso;
- reverse requiere reason;
- reverse setea reversedAt;
- reverse setea reversedBy desde token;
- items permanecen;
- bankTransaction status se restaura;
- Payment.reconciliationStatus se restaura;
- audit obligatorio;
- double reverse retorna 409.
```

---

## 23. Seguridad de sesiones

### 23.1. Estados

```text id="mmfkfv"
draft
open
reviewing
closed
reopened
archived
```

---

### 23.2. Reglas

```text id="izopab"
- sesión requiere bankAccount del tenant;
- periodo válido;
- no duplicar sesión activa para misma cuenta/periodo;
- closed bloquea cambios ordinarios;
- reopened requiere permiso y razón;
- archive requiere razón;
- close requiere razón;
- close puede bloquearse por excepciones high/critical abiertas.
```

---

### 23.3. Sesión cerrada

En sesión `closed` no permitir:

```text id="krwum4"
nuevos candidatos
nuevos matches
nuevas excepciones ordinarias
clasificaciones que afecten conciliación
ignorar movimientos relacionados
archivar elementos activos sin flujo especial
```

---

## 24. Seguridad de excepciones

### 24.1. Reglas

```text id="v8kwpg"
- exception requiere session tenant-scoped;
- exception requiere type;
- exception requiere severity;
- exception requiere description;
- bankTransactionId, si existe, debe ser tenant-scoped;
- paymentId, si existe, debe ser tenant-scoped;
- resolved requiere resolutionNotes;
- ignored requiere reason;
- high/critical open puede bloquear cierre;
- no eliminar físicamente.
```

---

### 24.2. Datos sensibles

`description`, `resolutionNotes`, `ignoreReason` y `metadata` deben sanitizarse.

Prohibido incluir:

```text id="j0bjvp"
número completo de cuenta
referencia bancaria sensible completa
datos personales completos
archivo bancario completo
storageKey
tokens
secretos
```

---

## 25. Seguridad de reportes

### 25.1. Reportes permitidos

```text id="y8q6wt"
summary
unmatched-bank-transactions
unmatched-payments
exceptions
bank-account-balances
export
```

---

### 25.2. Reglas

```text id="u5ldij"
- reportes siempre tenant-scoped;
- requieren permiso reconciliationReports.read o export;
- no exponen accountNumber completo;
- no exponen accountNumberHash;
- no exponen storageKey;
- no exponen referencias sensibles completas;
- no incluyen tenant B;
- export persistido usa Secure Document Storage;
- export no debe quedar público.
```

---

### 25.3. Reportes a WordPress

Prohibido en MVP:

```text id="rupzbg"
WordPress no debe consumir reportes bancarios privados ni movimientos bancarios.
```

---

## 26. Seguridad de endpoints `/me`

No existen endpoints `/me` directos en MVP para conciliación bancaria.

Regla:

```text id="ygst0z"
Propietarios y residentes no deben acceder directamente a cuentas bancarias, movimientos bancarios, sesiones de conciliación, matches, excepciones, archivos bancarios importados ni reportes internos.
```

La información propia relacionada con pagos debe exponerse, si aplica, desde:

```text id="ergxpb"
005-payments
006-account-statements
```

---

## 27. Seguridad de endpoints públicos

### 27.1. Endpoints prohibidos

No crear:

```text id="dkvzgh"
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

### 27.2. Resultado esperado

```text id="r0u8qf"
404 route not found
```

Sin revelar:

```text id="q4cgy5"
si el tenant existe
si la cuenta existe
si el movimiento existe
si la sesión existe
si el usuario tendría acceso
```

---

## 28. Seguridad de OpenAPI

OpenAPI debe incluir:

```yaml id="z4798b"
x-tenant-scope: true
x-auth-required: true
x-financial-control: true
x-public-exposure: false
```

Para importaciones:

```yaml id="t81z6n"
x-file-upload: true
x-secure-document-storage: true
x-storage-key-exposed: false
x-financial-import: true
```

Para candidatos:

```yaml id="bh7r57"
x-candidate-side-effect: false
```

Para matches:

```yaml id="tmrord"
x-reconciliation-match: true
x-manual-confirmation-required: true
```

OpenAPI no debe documentar:

```text id="fq8bnd"
rutas /public
rutas /me de conciliación bancaria en MVP
campos accountNumberHash en response estándar
campos storageKey
campos fingerprint en DTO estándar
signedUrl persistente
```

---

## 29. Auditoría

### 29.1. Eventos obligatorios

```text id="tw2m16"
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

reconciliationReport.exported
```

---

### 29.2. Metadata permitida

```text id="pjsg5f"
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

### 29.3. Metadata prohibida

```text id="dau9v3"
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

### 29.4. Auditoría reforzada

Aplicar auditoría reforzada en:

```text id="uy74kq"
- creación de cuenta bancaria;
- cambio de cuenta default;
- archivo de cuenta bancaria;
- importación de archivo bancario;
- importación fallida;
- duplicados masivos;
- match con differenceAmount distinto de cero;
- match manual;
- reverso de match;
- reapertura de sesión cerrada;
- cierre con excepciones relevantes;
- exportación de reportes;
- acceso excepcional PlatformAdmin.
```

---

## 30. Logs seguros

### 30.1. Campos permitidos

```text id="faq144"
traceId
requestId
correlationId
action
outcome
status
durationMs
errorCode
importStatus
transactionType
direction
matchType
exceptionType
severity
currency
fileType
rowCount
```

---

### 30.2. Campos prohibidos

```text id="fdytcr"
accountNumber completo
accountNumberHash
reference completa sensible
bankReference completa sensible
description completa sensible
fileHash completo
fingerprint
storageKey
signedUrl
archivo completo
fila bancaria completa
tokens
cookies
Authorization header
secretos
SQL raw
stack trace en producción
```

---

### 30.3. Ejemplo de log seguro

```json id="caqpd2"
{
  "action": "reconciliationMatch.confirmed",
  "outcome": "allowed",
  "matchType": "oneBankTransactionToOnePayment",
  "currency": "USD",
  "differenceAmount": "0.00",
  "durationMs": 145,
  "traceId": "req_123456"
}
```

---

## 31. Métricas seguras

### 31.1. Métricas permitidas

```text id="udgr9y"
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

### 31.2. Labels permitidos

```text id="m9mljo"
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

### 31.3. Labels prohibidos

```text id="f1jir7"
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
fingerprint
storageKey
traceId
```

---

## 32. Seguridad de base de datos

### 32.1. Constraints críticos

```text id="q8d0n7"
tenant_id NOT NULL en todas las tablas;
amount > 0;
amount_applied > 0;
score BETWEEN 0 AND 100;
period_start <= period_end;
difference_reason requerido si difference_amount != 0;
reverse_reason requerido si status = reversed;
resolution_notes requerido si status = resolved;
ignore_reason requerido si status = ignored;
item reference requerido según itemType;
```

---

### 32.2. Índices parciales críticos

```text id="j8lg5r"
una cuenta default activa por tenant;
fileHash único por cuenta activa;
fingerprint único por cuenta para movimiento no duplicado;
sesión activa única por cuenta/periodo;
candidato activo único por movimiento/pago;
idempotencyKey único por tenant.
```

---

### 32.3. Soft archive

No eliminar físicamente:

```text id="h429uv"
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

## 33. Seguridad transaccional

### 33.1. Operaciones que deben ser transaccionales

```text id="m0wcft"
- process import con creación de movimientos y errores;
- create match con items;
- confirm match con actualización de movimientos y payments;
- reverse match con restauración de estados;
- close session con cálculo de resumen;
- reopen session con auditoría;
- export persistido con documento seguro.
```

---

### 33.2. Consistencia con Payments

Regla:

```text id="j33czt"
Si no se puede actualizar Payment.reconciliationStatus, el match no debe quedar confirmado como operación exitosa.
```

Alternativa permitida solo con diseño explícito futuro:

```text id="lcs0dc"
outbox pattern + estado pendingConfirmation
```

No aplica al MVP salvo decisión posterior.

---

## 34. Seguridad de concurrencia

### 34.1. Imports simultáneos

Riesgo:

```text id="ikr8m7"
Dos requests importan el mismo archivo o los mismos movimientos.
```

Controles:

```text id="kkvgpr"
fileHash unique
fingerprint unique
Idempotency-Key
transacciones
409 o respuesta idempotente
```

---

### 34.2. Matches simultáneos

Riesgo:

```text id="y8q636"
Dos usuarios concilian el mismo movimiento o pago.
```

Controles:

```text id="lssk74"
validación de estado previa
bloqueo optimista o transaccional
constraints
409 conflict
auditoría de intento fallido
```

---

### 34.3. Reverse simultáneo

Riesgo:

```text id="ykxrjw"
Dos usuarios revierten el mismo match.
```

Control:

```text id="r1ggo6"
solo status confirmed puede pasar a reversed
double reverse retorna 409
```

---

### 34.4. Close/match simultáneo

Riesgo:

```text id="s6w6vc"
Una sesión se cierra mientras se confirma un match.
```

Control:

```text id="qqskib"
validar estado dentro de transacción
bloquear match si sesión ya está closed
resultado consistente
```

---

## 35. Rate limiting y abuso

Aplicar rate limiting a:

```text id="zmrm5c"
POST /api/v1/tenant/bank-accounts/{bankAccountId}/statement-imports
POST /api/v1/tenant/bank-statement-imports/{importId}/process
POST /api/v1/tenant/reconciliation-sessions/{sessionId}/candidates/generate
POST /api/v1/tenant/reconciliation-sessions/{sessionId}/matches
POST /api/v1/tenant/reconciliation-candidates/{candidateId}/accept
POST /api/v1/tenant/reconciliation-matches/{matchId}/reverse
GET /api/v1/tenant/reconciliation-reports/export
```

Estrategia:

```text id="jprbfi"
- límites por usuario;
- límites por tenant;
- límites por endpoint;
- límites por tamaño de archivo;
- límites por cantidad de filas;
- alertas por intentos fallidos repetidos;
- alertas por duplicados masivos;
- alertas por reversos frecuentes;
- alertas por exportaciones masivas.
```

---

## 36. CORS, cache y WordPress

### 36.1. Cache

Todos los endpoints privados:

```http id="itqefz"
Cache-Control: no-store
```

---

### 36.2. CORS

Reglas:

```text id="je9fsu"
- no wildcard con credenciales;
- permitir solo orígenes configurados;
- no habilitar WordPress público para datos bancarios;
- descargas privadas requieren token;
- exports no deben publicarse.
```

---

### 36.3. WordPress

Prohibido:

```text id="pbcckn"
WordPress no consume cuentas bancarias.
WordPress no consume movimientos bancarios.
WordPress no consume sesiones de conciliación.
WordPress no consume reportes bancarios privados.
WordPress no descarga archivos bancarios importados.
```

---

## 37. IA y procesamiento externo

### 37.1. Prohibición MVP

No enviar a servicios externos de IA:

```text id="k8fli1"
archivos bancarios reales
movimientos bancarios reales
referencias bancarias reales
descripciones bancarias reales
números de cuenta reales
comprobantes reales
pagos reales
datos personales
datos financieros
exports reales
tokens
secretos
```

---

### 37.2. Permitido

```text id="e7tmsj"
fixtures sintéticos
datos ficticios
plantillas genéricas
documentación técnica
código sin secretos
tests sin datos reales
```

---

### 37.3. Feature flag

```text id="wmbqov"
bankReconciliation.aiAssistance.enabled = false
```

---

## 38. Backups y recuperación

Riesgos:

```text id="rxajof"
- DB contiene import pero archivo no existe;
- archivo existe en storage pero import no existe;
- movimientos creados parcialmente;
- match confirmado sin Payment actualizado;
- restore parcial rompe conciliación;
- hash no coincide.
```

Controles:

```text id="fk7l8p"
- backup PostgreSQL;
- backup storage;
- verificación de secureDocumentId;
- verificación de secureDocumentFileId;
- pruebas de restore;
- reconciliation job futuro;
- audit trail;
- estados failed/missing si aplica;
- no storage efímero para archivos reales.
```

---

## 39. Configuración segura

Variables sugeridas:

```text id="ti65io"
BANK_RECONCILIATION_IMPORT_MAX_FILE_SIZE_MB=20
BANK_RECONCILIATION_IMPORT_MAX_ROWS=5000
BANK_RECONCILIATION_DEFAULT_CURRENCY=USD
BANK_RECONCILIATION_AMOUNT_TOLERANCE=0.00
BANK_RECONCILIATION_DATE_TOLERANCE_DAYS=3
BANK_RECONCILIATION_CANDIDATE_MIN_SCORE=50
BANK_RECONCILIATION_HIGH_SCORE_THRESHOLD=90
BANK_RECONCILIATION_MEDIUM_SCORE_THRESHOLD=70
BANK_RECONCILIATION_REQUIRE_MANUAL_CONFIRMATION=true
BANK_RECONCILIATION_BLOCK_CLOSE_WITH_CRITICAL_EXCEPTIONS=true
BANK_RECONCILIATION_AI_ASSISTANCE_ENABLED=false
BANK_RECONCILIATION_AUTO_CONFIRMATION_ENABLED=false
```

Reglas:

```text id="wmm78l"
- no secretos en repositorio;
- no datos bancarios reales en variables;
- no activar IA por defecto;
- no activar auto-confirmation por defecto;
- separar ambientes;
- usar valores seguros por defecto.
```

---

## 40. Casos de abuso prioritarios

| Caso                                    |  Riesgo | Control                                 |
| --------------------------------------- | ------: | --------------------------------------- |
| Tenant A accede a cuenta de Tenant B    | Crítico | tenant_id + guards + tests              |
| Tenant A concilia paymentId de Tenant B | Crítico | PaymentReconciliationPort tenant-scoped |
| Cliente envía `tenantId`                |    Alto | DTO reject                              |
| Cliente envía `accountNumberHash`       |    Alto | DTO reject                              |
| Cliente envía `fingerprint`             |    Alto | DTO reject                              |
| Cliente envía `storageKey`              | Crítico | DTO reject                              |
| Archivo bancario queda público          | Crítico | SDS restricted + no public              |
| Candidate modifica Payment              | Crítico | no-side-effect tests                    |
| Match con pago rejected                 |    Alto | PaymentReconciliationPolicy             |
| Match con movimiento duplicate          |    Alto | BankTransactionDuplicatePolicy          |
| Match con diferencia sin razón          |    Alto | validation + DB constraint              |
| Reverse sin razón                       |    Alto | validation + DB constraint              |
| Sesión closed modificable               |    Alto | state policy                            |
| Reporte incluye tenant B                | Crítico | tenant-scoped queries                   |
| Log contiene cuenta completa            | Crítico | log sanitizer                           |
| Audit contiene archivo completo         | Crítico | audit sanitizer                         |
| IA recibe datos reales                  | Crítico | feature flag + policy                   |

---

## 41. Pruebas de seguridad obligatorias

### 41.1. Multitenancy

```text id="zt02n2"
tenant A no ve bankAccount tenant B
tenant A no ve bankStatementImport tenant B
tenant A no ve bankStatementImportError tenant B
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

### 41.2. Datos sensibles

```text id="kyem6f"
no accountNumber completo en responses
no accountNumberHash en DTO estándar
no fileHash completo en DTO estándar
no fingerprint en DTO estándar
no storageKey en responses
no signedUrl persistente
no archivo bancario en JSON
no fila completa en errores
no referencias sensibles completas en logs
```

---

### 41.3. Integridad financiera

```text id="h870tx"
no float/double
Decimal exacto
candidate sin side effect
match 1:1 exacto
match 1:N exacto
match N:1 exacto
differenceReason requerido
reverseReason requerido
payment no conciliable rechazado
movimiento no conciliable rechazado
```

---

### 41.4. Endpoints públicos

```text id="bk2l80"
rutas /public de conciliación retornan 404
OpenAPI no documenta /public
WordPress no consume conciliación bancaria
```

---

### 41.5. IA externa

```text id="sfq9m4"
aiAssistance flag false
no proveedor externo invocado
no archivos bancarios enviados
no movimientos reales enviados
fixtures solo sintéticos
```

---

## 42. CI/CD security gates

El pipeline debe fallar si:

```text id="b6znc9"
- falla lint;
- falla typecheck;
- fallan unit tests;
- fallan domain tests;
- fallan parser tests;
- fallan fingerprint tests;
- fallan duplicate tests;
- fallan repository tests;
- fallan service tests;
- fallan integration tests;
- fallan API tests;
- fallan authorization tests;
- fallan multitenancy tests;
- fallan financial integrity tests;
- fallan security tests;
- fallan OpenAPI tests;
- falla build;
- OpenAPI documenta endpoints públicos;
- responses contienen accountNumber completo;
- responses contienen accountNumberHash;
- responses contienen fingerprint;
- responses contienen storageKey;
- logs contienen datos bancarios completos;
- audit contiene datos bancarios completos;
- se detecta uso de float/double para dinero;
- candidate modifica Payment;
- match permite payment cross-tenant;
- import duplica movimientos;
- IA externa se activa por defecto.
```

---

## 43. Checklist de seguridad para PR

Cada PR debe responder:

```text id="lbqocr"
[ ] ¿Toda consulta filtra por tenant_id?
[ ] ¿Se evita findUnique por id simple?
[ ] ¿El body rechaza tenantId?
[ ] ¿El body rechaza accountNumberHash?
[ ] ¿El body rechaza fingerprint?
[ ] ¿El body rechaza fileHash?
[ ] ¿El body rechaza storageKey?
[ ] ¿Los IDs externos se validan contra tenant?
[ ] ¿paymentId se valida contra tenant?
[ ] ¿secureDocumentId se valida contra tenant?
[ ] ¿El número completo de cuenta no se expone?
[ ] ¿accountNumberHash no se expone?
[ ] ¿fingerprint no se expone?
[ ] ¿fileHash completo no se expone?
[ ] ¿storageKey no se expone?
[ ] ¿El archivo bancario no se serializa en JSON?
[ ] ¿Se usa Decimal para dinero?
[ ] ¿No se usa float/double?
[ ] ¿candidate no tiene side effect financiero?
[ ] ¿match requiere permiso?
[ ] ¿match valida estados conciliables?
[ ] ¿match valida diferencia con razón?
[ ] ¿reverse requiere razón?
[ ] ¿closed session bloquea cambios?
[ ] ¿logs están sanitizados?
[ ] ¿audit está sanitizado?
[ ] ¿no existen endpoints públicos?
[ ] ¿OpenAPI no documenta endpoints públicos?
[ ] ¿IA externa permanece desactivada?
[ ] ¿tests críticos pasan?
```

---

## 44. Definition of Done de seguridad

El módulo cumple seguridad cuando:

```text id="j0939h"
- todas las tablas nuevas tienen tenant_id;
- todas las consultas filtran por tenant_id;
- no se acepta tenantId desde body;
- no se acepta accountNumberHash desde body;
- no se acepta fingerprint desde body;
- no se acepta fileHash desde body;
- no se acepta storageKey desde body;
- no se busca por id simple;
- bankAccountId se valida contra tenant;
- bankTransactionId se valida contra tenant;
- paymentId se valida contra tenant;
- secureDocumentId se valida contra tenant;
- secureDocumentFileId se valida contra tenant;
- número completo de cuenta no se expone;
- accountNumberHash no se expone;
- fingerprint no se expone;
- storageKey no se expone;
- archivo bancario no se expone en JSON;
- importación es idempotente;
- duplicados se detectan;
- dinero usa Decimal;
- candidate no modifica Payment;
- match confirma solo con permiso;
- match valida estados conciliables;
- differenceReason es obligatorio cuando aplica;
- reverseReason es obligatorio;
- sesiones closed bloquean cambios;
- reportes son tenant-scoped;
- logs no contienen datos bancarios completos;
- audit no contiene datos bancarios completos;
- OpenAPI no documenta endpoints públicos;
- no existen endpoints públicos;
- WordPress no consume conciliación bancaria privada;
- IA externa no procesa datos reales;
- CI pasa.
```

---

## 45. No aceptación

La implementación no debe aceptarse si:

```text id="kh597y"
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
- acepta accountNumberHash desde body;
- acepta fingerprint desde body;
- acepta fileHash desde body;
- acepta storageKey desde body;
- busca entidades solo por id;
- expone número completo de cuenta;
- expone accountNumberHash por DTO estándar;
- expone fingerprint por DTO estándar;
- expone fileHash completo por DTO estándar;
- expone storageKey;
- expone signedUrl persistente;
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

## 46. Resultado esperado

Al aplicar estas notas, `017-bank-reconciliation` quedará protegido como módulo financiero crítico de RESIDENT Core.

Debe garantizar:

```text id="re8jju"
tenant isolation
financial integrity
bank account protection
account number masking
account number hash protection
secure import workflow
Secure Document Storage integration
CSV/XLSX validation
file hash safety
fingerprint server-side
duplicate detection
idempotent imports
Decimal money
candidate no side effect
deterministic scoring
manual confirmation
match validation
1:1 matching
1:N matching
N:1 matching
difference reason enforcement
match reversibility
closed session protection
exception governance
secure reports
secure exports
audit trail
safe logs
safe metrics
no public endpoints
no /me bank reconciliation endpoints in MVP
no WordPress exposure
no external AI with real financial data
```

---

## 47. Expediente actualizado

```text id="q6td4z"
resident-core/
├── docs/
│   ├── specs/
│   │   ├── 001-tenants/
│   │   ├── 002-users-roles/
│   │   ├── 003-residents-properties/
│   │   ├── 004-dues-fees/
│   │   ├── 005-payments/
│   │   ├── 006-account-statements/
│   │   ├── 007-audit/
│   │   ├── 008-basic-reports/
│   │   ├── 009-wordpress-integration-basic/
│   │   ├── 010-reservations-common-areas/
│   │   ├── 011-fines-sanctions/
│   │   ├── 012-communications-notifications/
│   │   ├── 013-meetings-attendance/
│   │   ├── 014-voting-basic/
│   │   ├── 015-certified-minutes/
│   │   ├── 016-secure-document-storage/
│   │   └── 017-bank-reconciliation/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 48. Cierre del paquete documental

Con este documento queda cerrado el paquete documental de:

```text id="v1fqyo"
docs/specs/017-bank-reconciliation/
```

Archivos completados:

```text id="qc9hr2"
spec.md
plan.md
data-model.md
api-contract.md
test-plan.md
tasks.md
security-notes.md
```

El módulo queda listo para pasar a implementación o para iniciar la siguiente especificación funcional del roadmap.
