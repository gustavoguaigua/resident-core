# Test Plan — Spec 011 Fines and Sanctions

## 1. Información del documento

| Campo                    | Valor                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto                 | RESIDENT Core                                                                                                                                             |
| Spec ID                  | 011                                                                                                                                                       |
| Módulo                   | Fines and Sanctions                                                                                                                                       |
| Documento                | Test Plan                                                                                                                                                 |
| Ruta                     | `docs/specs/011-fines-sanctions/test-plan.md`                                                                                                             |
| Versión                  | 0.1                                                                                                                                                       |
| Estado                   | needs-review                                                                                                                                              |
| Fecha                    | 2026-07-19                                                                                                                                                |
| Documento base           | `docs/specs/011-fines-sanctions/spec.md`                                                                                                                  |
| Plan técnico             | `docs/specs/011-fines-sanctions/plan.md`                                                                                                                  |
| Modelo de datos          | `docs/specs/011-fines-sanctions/data-model.md`                                                                                                            |
| Contrato API             | `docs/specs/011-fines-sanctions/api-contract.md`                                                                                                          |
| Depende de               | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports` |
| Framework sugerido       | Jest + Supertest                                                                                                                                          |
| Base de datos de pruebas | PostgreSQL test database                                                                                                                                  |
| Prioridad                | Alta                                                                                                                                                      |

---

## 2. Propósito

Este documento define el plan de pruebas para el módulo `011-fines-sanctions`.

El objetivo es validar que RESIDENT Core pueda gestionar conceptos de multa, multas, evidencias, reclamos, flujos de revisión, aprobación, rechazo, emisión, cancelación, condonación, reverso y generación de cargos, garantizando:

* aislamiento por tenant;
* autorización por permiso;
* autorización por recurso propio;
* validación de unidad habitacional;
* validación de responsable opcional;
* evidencia requerida cuando aplique;
* control estricto de estados;
* trazabilidad mediante historial funcional;
* auditoría de eventos críticos;
* generación idempotente de cargos;
* protección de evidencias;
* protección de datos personales;
* protección de datos financieros;
* no procesamiento directo de pagos;
* no modificación directa de estados de cuenta;
* no exposición pública hacia WordPress;
* consistencia con reportes y estados de cuenta.

Regla central:

```text id="pg74rc"
El módulo de multas debe impedir referencias cross-tenant, proteger evidencias, controlar estados, generar cargos de forma idempotente, permitir reclamos propios bajo reglas y conservar auditoría completa.
```

---

## 3. Alcance de pruebas

### 3.1. Incluido

Este plan cubre:

```text id="pn214j"
Unit tests
Domain tests
Value object tests
DTO validation tests
State machine tests
Application service tests
Use case tests
Repository integration tests
API tests
Authorization tests
Own-resource tests
Multitenancy tests
Financial regression tests
Evidence security tests
Appeal workflow tests
Audit integration tests
Observability tests
OpenAPI tests
Smoke tests
```

---

### 3.2. No incluido

No cubre todavía:

```text id="r2d4j1"
firma electrónica
documentos PDF formales
notificaciones automáticas por email
notificaciones automáticas por WhatsApp
integración con cámaras
reconocimiento por IA
OCR de evidencias
multas automáticas por sensores
multas automáticas por mora financiera
reincidencia automática
escalamiento a comité
audiencias
votaciones de sanciones
flujos legales avanzados
publicación pública de sanciones
pagos online de multas
conciliación bancaria
intereses automáticos
restricción automática de reservas por multas
```

Estos temas quedan diferidos para specs futuras.

---

## 4. Estrategia general

Las pruebas se organizan por capas:

```text id="qj0s7r"
1. Value objects.
2. Entidades de dominio.
3. Máquina de estados.
4. Políticas de multa.
5. Evidencia y acceso.
6. Reclamos.
7. DTOs y validaciones.
8. Puertos y repositorios.
9. Casos de uso.
10. Controladores REST.
11. Autorización y permisos.
12. Recursos propios.
13. Multitenancy.
14. Integración financiera.
15. Auditoría.
16. Observabilidad.
17. OpenAPI.
18. Smoke tests.
```

Reglas obligatorias:

```text id="jde38w"
1. Ninguna prueba debe usar datos reales.
2. Ninguna tabla nueva puede operar sin tenant_id.
3. Ninguna consulta debe buscar multa solo por fineId.
4. Ninguna evidencia debe buscarse solo por evidenceId sin tenant.
5. Ningún reclamo debe buscarse solo por appealId sin tenant.
6. Ninguna multa monetaria puede crearse sin propertyUnitId.
7. Ninguna multa puede usar propertyUnitId de otro tenant.
8. Ninguna multa puede usar responsiblePersonId de otro tenant.
9. Ningún concepto de multa puede usar chargeConceptId de otro tenant.
10. Ninguna multa puede usar chargeId de otro tenant.
11. Ningún monto debe manejarse como float/double.
12. Todo monto debe persistirse como Decimal y salir por API como string.
13. Ninguna multa debe generar más de un cargo.
14. Ninguna multa debe procesar pagos.
15. Ninguna multa debe modificar estados de cuenta directamente.
16. Ningún reclamo debe presentarse sobre multa ajena.
17. Ninguna evidencia debe exponerse sin permiso.
18. Ninguna evidencia debe exponerse públicamente.
19. WordPress no debe consultar multas, evidencias ni reclamos.
20. Toda transición crítica debe crear historial y auditoría.
```

---

## 5. Criterios globales de aceptación

La implementación cumple este plan si:

* permite crear conceptos de multa válidos;
* impide conceptos duplicados dentro del mismo tenant;
* permite crear multas asociadas a unidad;
* valida unidad del tenant;
* valida responsable opcional del tenant;
* impide multas monetarias sin unidad;
* impide montos negativos o float;
* permite adjuntar evidencia;
* protege evidencia por permisos;
* valida evidencia requerida antes de aprobar o emitir;
* permite pasar multas a revisión;
* permite aprobar multas;
* permite rechazar multas con razón;
* permite emitir multas aprobadas;
* genera cargos al emitir cuando aplica;
* genera cargos de forma idempotente;
* no procesa pagos desde multas;
* no modifica estados de cuenta desde multas;
* permite cancelar multas con razón;
* permite condonar multas con razón;
* permite reversar multas con razón;
* permite presentar reclamos propios;
* valida plazo de reclamo;
* impide reclamos duplicados abiertos;
* permite resolver reclamos;
* permite consultar multas administrativas;
* permite consultar multas propias;
* impide consultar multas ajenas;
* impide evidencia ajena;
* no expone multas a WordPress;
* mantiene historial funcional de estados;
* audita operaciones críticas;
* OpenAPI valida;
* CI pasa.

---

## 6. Datos base de prueba

### 6.1. Tenants

Reusar fixtures de `001-tenants`:

```text id="zdzgwp"
tenantActiveA
tenantActiveB
tenantSuspended
tenantInactive
tenantArchived
```

---

### 6.2. Usuarios y roles

Reusar fixtures de `002-users-roles`:

```text id="f2aymm"
platformAdmin
tenantAdminA
tenantAdminB
sanctionManagerA
sanctionManagerB
treasurerA
ownerUserA
residentUserA
ownerUserB
residentUserB
tenantUserWithoutFinePermissionA
tenantUserWithoutMembership
disabledUser
anonymousUser
```

---

### 6.3. Personas y unidades

Reusar fixtures de `003-residents-properties`:

```text id="ajuz96"
personOwnerA
personResidentA
personOwnerB
personResidentB
personExternalA
personInactiveA

propertyUnitA101
propertyUnitA102
propertyUnitB201
propertyUnitInactiveA
```

Relaciones activas:

```text id="v4yhe2"
ownerUserA -> personOwnerA -> propertyUnitA101
residentUserA -> personResidentA -> propertyUnitA101
ownerUserB -> personOwnerB -> propertyUnitB201
tenantAdminA -> tenantActiveA
tenantAdminB -> tenantActiveB
```

---

### 6.4. Conceptos financieros

Reusar o crear fixtures compatibles con `004-dues-fees`:

```text id="yot806"
fineChargeConceptA
fineChargeConceptB
inactiveChargeConceptA
ordinaryDuesChargeConceptA
```

Regla:

```text id="kmf0ym"
fineChargeConceptA pertenece a tenantActiveA.
fineChargeConceptB pertenece a tenantActiveB.
```

---

### 6.5. Conceptos de multa

Fixtures requeridos:

```text id="urxxcd"
fineConceptNoiseA
fineConceptParkingA
fineConceptPetControlA
fineConceptCommonAreaMisuseA
fineConceptDamageA
fineConceptInactiveA
fineConceptArchivedA
fineConceptWithoutAppealA
fineConceptRequiresEvidenceA
fineConceptWithoutChargeConceptA
fineConceptNoiseB
```

Ejemplo:

```text id="wgbtw8"
fineConceptNoiseA:
tenantId = tenantActiveA.id
code = NOISE
name = Ruido excesivo
category = noise
defaultAmount = 25.00
currency = USD
chargeConceptId = fineChargeConceptA.id
requiresEvidence = true
allowsAppeal = true
appealDeadlineDays = 5
status = active
```

---

### 6.6. Multas

Fixtures requeridos:

```text id="xhugup"
fineDraftA
fineReportedA
fineUnderReviewA
fineApprovedA
fineRejectedA
fineIssuedA
fineDisputedA
fineAppealAcceptedA
fineAppealRejectedA
fineWaivedA
fineCancelledA
fineReversedA
fineArchivedA
fineWithChargeA
fineZeroAmountA
fineRequiresEvidenceWithoutEvidenceA
fineIssuedB
```

Ejemplo:

```text id="a5g49t"
fineIssuedA:
tenantId = tenantActiveA.id
fineConceptId = fineConceptNoiseA.id
propertyUnitId = propertyUnitA101.id
responsiblePersonId = personResidentA.id
title = Ruido excesivo en horario nocturno
description = Se reporta ruido excesivo después de las 23h00.
occurredAt = 2026-08-20T04:30:00Z
reportedAt = 2026-08-20T15:00:00Z
status = issued
severity = medium
amount = 25.00
currency = USD
chargeId = chargeForFineA.id
paymentStatusSnapshot = chargeGenerated
issuedAt = 2026-08-21T15:20:00Z
```

---

### 6.7. Evidencias

Fixtures requeridos:

```text id="o6qfxb"
fineEvidenceTextA
fineEvidenceImageReferenceA
fineEvidenceDocumentReferenceA
fineEvidenceArchivedA
fineEvidenceRejectedA
fineEvidenceB
```

Ejemplo:

```text id="ef7t9i"
fineEvidenceImageReferenceA:
tenantId = tenantActiveA.id
fineId = fineIssuedA.id
evidenceType = image
title = Fotografía del evento
description = Imagen referencial cargada por administración.
fileUrl = storage://tenant-a/fines/fine_uuid/evidence_uuid.jpg
fileName = evidence.jpg
mimeType = image/jpeg
fileSizeBytes = 245000
uploadedBy = sanctionManagerA.id
status = active
```

---

### 6.8. Reclamos

Fixtures requeridos:

```text id="gdwuji"
fineAppealSubmittedA
fineAppealUnderReviewA
fineAppealAcceptedA
fineAppealRejectedA
fineAppealCancelledA
fineAppealB
```

Ejemplo:

```text id="uwyqft"
fineAppealSubmittedA:
tenantId = tenantActiveA.id
fineId = fineIssuedA.id
submittedBy = ownerUserA.id
submittedAt = 2026-08-22T10:00:00Z
reason = La multa no corresponde porque no hubo ruido fuera del horario permitido.
status = submitted
```

---

### 6.9. Cargos

Reusar o crear fixtures compatibles con `004-dues-fees`:

```text id="iam33w"
chargeForFineA
chargeForFineB
chargeForOrdinaryDueA
```

Regla:

```text id="bys85c"
chargeForFineA.tenantId = tenantActiveA.id
chargeForFineA.propertyUnitId = propertyUnitA101.id
```

---

### 6.10. Datos prohibidos en fixtures

No usar:

```text id="bb891o"
nombres reales de residentes
cédulas reales
emails personales reales
teléfonos reales
placas reales
fotos reales
videos reales
evidencias reales
comprobantes reales
pagos reales
tokens
cookies
secretos
API keys
client secrets
URLs firmadas reales
connection strings reales
```

---

## 7. Factories recomendadas

Crear factories:

```text id="xn93iv"
createFineConcept()
createFine()
createFineEvidence()
createFineAppeal()
createFineStatusHistory()
createCreateFineConceptDto()
createCreateFineDto()
createUpdateFineDto()
createAddFineEvidenceDto()
createSubmitFineAppealDto()
createResolveFineAppealDto()
createFineActionReasonDto()
createFineActorContext()
createFineChargeRequest()
```

Ejemplo:

```text id="fy6kqf"
createFine({
  tenantId: tenantActiveA.id,
  fineConceptId: fineConceptNoiseA.id,
  propertyUnitId: propertyUnitA101.id,
  responsiblePersonId: personResidentA.id,
  title: "Ruido excesivo en horario nocturno",
  description: "Se reporta ruido excesivo después de las 23h00.",
  status: "reported",
  amount: "25.00"
})
```

---

# 8. Pruebas unitarias de value objects

## 8.1. FineConceptCode

Archivo sugerido:

```text id="svsm1w"
fine-concept-code.vo.spec.ts
```

| ID             | Caso                                 | Resultado esperado |
| -------------- | ------------------------------------ | ------------------ |
| UT-FC-CODE-001 | `NOISE` válido                       | válido             |
| UT-FC-CODE-002 | `PARKING-VIOLATION` válido           | válido             |
| UT-FC-CODE-003 | código vacío                         | error              |
| UT-FC-CODE-004 | código demasiado largo               | error              |
| UT-FC-CODE-005 | código con script                    | error              |
| UT-FC-CODE-006 | código con slash                     | error              |
| UT-FC-CODE-007 | normalización a mayúsculas si aplica | consistente        |

---

## 8.2. FineConceptStatus

Archivo sugerido:

```text id="m41uil"
fine-concept-status.vo.spec.ts
```

| ID               | Caso                            | Resultado esperado |
| ---------------- | ------------------------------- | ------------------ |
| UT-FC-STATUS-001 | `active`                        | válido             |
| UT-FC-STATUS-002 | `inactive`                      | válido             |
| UT-FC-STATUS-003 | `archived`                      | válido             |
| UT-FC-STATUS-004 | valor inválido                  | error              |
| UT-FC-STATUS-005 | active permite nueva multa      | true               |
| UT-FC-STATUS-006 | inactive no permite nueva multa | false              |
| UT-FC-STATUS-007 | archived no permite nueva multa | false              |

---

## 8.3. FineCategory

Archivo sugerido:

```text id="hlgys7"
fine-category.vo.spec.ts
```

| ID            | Caso                | Resultado esperado             |
| ------------- | ------------------- | ------------------------------ |
| UT-FC-CAT-001 | `noise` válido      | válido                         |
| UT-FC-CAT-002 | `parking` válido    | válido                         |
| UT-FC-CAT-003 | `commonArea` válido | válido                         |
| UT-FC-CAT-004 | `damage` válido     | válido                         |
| UT-FC-CAT-005 | valor desconocido   | error o `other` según política |

---

## 8.4. FineStatus

Archivo sugerido:

```text id="uy47kd"
fine-status.vo.spec.ts
```

| ID                 | Caso                        | Resultado esperado |
| ------------------ | --------------------------- | ------------------ |
| UT-FINE-STATUS-001 | `reported` válido           | válido             |
| UT-FINE-STATUS-002 | `underReview` válido        | válido             |
| UT-FINE-STATUS-003 | `approved` válido           | válido             |
| UT-FINE-STATUS-004 | `issued` válido             | válido             |
| UT-FINE-STATUS-005 | `disputed` válido           | válido             |
| UT-FINE-STATUS-006 | `waived` válido             | válido             |
| UT-FINE-STATUS-007 | valor inválido              | error              |
| UT-FINE-STATUS-008 | issued permite reclamo      | true               |
| UT-FINE-STATUS-009 | rejected no permite reclamo | false              |
| UT-FINE-STATUS-010 | archived es terminal        | true               |

---

## 8.5. FineSeverity

Archivo sugerido:

```text id="w7aob1"
fine-severity.vo.spec.ts
```

| ID              | Caso              | Resultado esperado |
| --------------- | ----------------- | ------------------ |
| UT-FINE-SEV-001 | `low` válido      | válido             |
| UT-FINE-SEV-002 | `medium` válido   | válido             |
| UT-FINE-SEV-003 | `high` válido     | válido             |
| UT-FINE-SEV-004 | `critical` válido | válido             |
| UT-FINE-SEV-005 | valor inválido    | error              |

---

## 8.6. FineMoney

Archivo sugerido:

```text id="l8dd5w"
fine-money.vo.spec.ts
```

| ID                | Caso                   | Resultado esperado |
| ----------------- | ---------------------- | ------------------ |
| UT-FINE-MONEY-001 | `"25.00"` válido       | válido             |
| UT-FINE-MONEY-002 | `"0.00"` válido        | válido             |
| UT-FINE-MONEY-003 | `"-10.00"`             | error              |
| UT-FINE-MONEY-004 | `"25.001"`             | error              |
| UT-FINE-MONEY-005 | número float           | error              |
| UT-FINE-MONEY-006 | `NaN`                  | error              |
| UT-FINE-MONEY-007 | salida API como string | válido             |
| UT-FINE-MONEY-008 | moneda `USD`           | válido             |
| UT-FINE-MONEY-009 | moneda inválida        | error              |

---

## 8.7. FineTitle

Archivo sugerido:

```text id="ifdqdn"
fine-title.vo.spec.ts
```

| ID                | Caso                     | Resultado esperado |
| ----------------- | ------------------------ | ------------------ |
| UT-FINE-TITLE-001 | título válido            | válido             |
| UT-FINE-TITLE-002 | título vacío             | error              |
| UT-FINE-TITLE-003 | título demasiado largo   | error              |
| UT-FINE-TITLE-004 | título con script        | sanitizado o error |
| UT-FINE-TITLE-005 | título con solo espacios | error              |

---

## 8.8. FineDescription

Archivo sugerido:

```text id="n3xmqz"
fine-description.vo.spec.ts
```

| ID               | Caso                        | Resultado esperado |
| ---------------- | --------------------------- | ------------------ |
| UT-FINE-DESC-001 | descripción válida          | válido             |
| UT-FINE-DESC-002 | descripción vacía           | error              |
| UT-FINE-DESC-003 | descripción demasiado larga | error              |
| UT-FINE-DESC-004 | payload peligroso           | sanitizado o error |
| UT-FINE-DESC-005 | solo espacios               | error              |

---

## 8.9. FineReason

Archivo sugerido:

```text id="uonkk5"
fine-reason.vo.spec.ts
```

| ID                 | Caso                             | Resultado esperado |
| ------------------ | -------------------------------- | ------------------ |
| UT-FINE-REASON-001 | razón válida                     | válido             |
| UT-FINE-REASON-002 | razón vacía                      | error              |
| UT-FINE-REASON-003 | razón demasiado larga            | error              |
| UT-FINE-REASON-004 | razón requerida para rechazo     | válido             |
| UT-FINE-REASON-005 | razón requerida para cancelación | válido             |
| UT-FINE-REASON-006 | razón requerida para condonación | válido             |
| UT-FINE-REASON-007 | razón requerida para reverso     | válido             |

---

## 8.10. FineEvidenceType y FineEvidenceStatus

Archivos sugeridos:

```text id="jajdyy"
fine-evidence-type.vo.spec.ts
fine-evidence-status.vo.spec.ts
```

| ID               | Caso                            | Resultado esperado |
| ---------------- | ------------------------------- | ------------------ |
| UT-EV-TYPE-001   | `text` válido                   | válido             |
| UT-EV-TYPE-002   | `image` válido                  | válido             |
| UT-EV-TYPE-003   | `document` válido               | válido             |
| UT-EV-TYPE-004   | `video` válido                  | válido             |
| UT-EV-TYPE-005   | tipo inválido                   | error              |
| UT-EV-STATUS-001 | `active` válido                 | válido             |
| UT-EV-STATUS-002 | `rejected` válido               | válido             |
| UT-EV-STATUS-003 | `archived` válido               | válido             |
| UT-EV-STATUS-004 | archived no visible por defecto | correcto           |

---

## 8.11. FineAppealStatus

Archivo sugerido:

```text id="rl90vj"
fine-appeal-status.vo.spec.ts
```

| ID                | Caso                           | Resultado esperado |
| ----------------- | ------------------------------ | ------------------ |
| UT-APP-STATUS-001 | `submitted` válido             | válido             |
| UT-APP-STATUS-002 | `underReview` válido           | válido             |
| UT-APP-STATUS-003 | `accepted` válido              | válido             |
| UT-APP-STATUS-004 | `rejected` válido              | válido             |
| UT-APP-STATUS-005 | `cancelled` válido             | válido             |
| UT-APP-STATUS-006 | `archived` válido              | válido             |
| UT-APP-STATUS-007 | valor inválido                 | error              |
| UT-APP-STATUS-008 | submitted es reclamo abierto   | true               |
| UT-APP-STATUS-009 | underReview es reclamo abierto | true               |
| UT-APP-STATUS-010 | accepted no es abierto         | false              |

---

## 8.12. FinePaymentStatusSnapshot

Archivo sugerido:

```text id="l22dn8"
fine-payment-status-snapshot.vo.spec.ts
```

| ID              | Caso                                    | Resultado esperado |
| --------------- | --------------------------------------- | ------------------ |
| UT-PAY-SNAP-001 | `notRequired` válido                    | válido             |
| UT-PAY-SNAP-002 | `pendingCharge` válido                  | válido             |
| UT-PAY-SNAP-003 | `chargeGenerated` válido                | válido             |
| UT-PAY-SNAP-004 | `pendingPayment` válido                 | válido             |
| UT-PAY-SNAP-005 | `paid` válido                           | válido             |
| UT-PAY-SNAP-006 | `waived` válido                         | válido             |
| UT-PAY-SNAP-007 | `reversed` válido                       | válido             |
| UT-PAY-SNAP-008 | snapshot no reemplaza fuente financiera | documentado        |

---

# 9. Pruebas unitarias de entidades

## 9.1. FineConcept entity

Archivo sugerido:

```text id="glq8qd"
fine-concept.entity.spec.ts
```

| ID            | Caso                        | Resultado esperado |
| ------------- | --------------------------- | ------------------ |
| UT-FC-ENT-001 | concepto válido             | válido             |
| UT-FC-ENT-002 | sin tenantId                | error              |
| UT-FC-ENT-003 | sin code                    | error              |
| UT-FC-ENT-004 | sin name                    | error              |
| UT-FC-ENT-005 | defaultAmount negativo      | error              |
| UT-FC-ENT-006 | defaultAmount float         | error              |
| UT-FC-ENT-007 | requiresEvidence true       | persiste regla     |
| UT-FC-ENT-008 | allowsAppeal false          | bloquea reclamo    |
| UT-FC-ENT-009 | appealDeadlineDays negativo | error              |
| UT-FC-ENT-010 | archived no permite uso     | correcto           |

---

## 9.2. Fine entity

Archivo sugerido:

```text id="vhzm9t"
fine.entity.spec.ts
```

| ID              | Caso                         | Resultado esperado             |
| --------------- | ---------------------------- | ------------------------------ |
| UT-FINE-ENT-001 | multa válida                 | válida                         |
| UT-FINE-ENT-002 | sin tenantId                 | error                          |
| UT-FINE-ENT-003 | sin fineConceptId            | error                          |
| UT-FINE-ENT-004 | monto > 0 sin propertyUnitId | error                          |
| UT-FINE-ENT-005 | monto 0 sin propertyUnitId   | válido si sanción no monetaria |
| UT-FINE-ENT-006 | sin título                   | error                          |
| UT-FINE-ENT-007 | sin descripción              | error                          |
| UT-FINE-ENT-008 | monto Decimal                | correcto                       |
| UT-FINE-ENT-009 | chargeId opcional            | correcto                       |
| UT-FINE-ENT-010 | rejected requiere razón      | correcto                       |
| UT-FINE-ENT-011 | cancelled requiere razón     | correcto                       |
| UT-FINE-ENT-012 | waived requiere razón        | correcto                       |
| UT-FINE-ENT-013 | reversed requiere razón      | correcto                       |
| UT-FINE-ENT-014 | no elimina historial         | correcto                       |

---

## 9.3. FineEvidence entity

Archivo sugerido:

```text id="kd72u9"
fine-evidence.entity.spec.ts
```

| ID            | Caso                                        | Resultado esperado |
| ------------- | ------------------------------------------- | ------------------ |
| UT-EV-ENT-001 | evidencia textual válida                    | válida             |
| UT-EV-ENT-002 | evidencia imagen válida                     | válida             |
| UT-EV-ENT-003 | sin tenantId                                | error              |
| UT-EV-ENT-004 | sin fineId                                  | error              |
| UT-EV-ENT-005 | sin title                                   | error              |
| UT-EV-ENT-006 | fileSizeBytes negativo                      | error              |
| UT-EV-ENT-007 | mimeType inválido                           | error              |
| UT-EV-ENT-008 | URL pública permanente prohibida si privada | error              |
| UT-EV-ENT-009 | archived no visible por defecto             | correcto           |

---

## 9.4. FineAppeal entity

Archivo sugerido:

```text id="l68h2f"
fine-appeal.entity.spec.ts
```

| ID             | Caso                          | Resultado esperado |
| -------------- | ----------------------------- | ------------------ |
| UT-APP-ENT-001 | reclamo válido                | válido             |
| UT-APP-ENT-002 | sin tenantId                  | error              |
| UT-APP-ENT-003 | sin fineId                    | error              |
| UT-APP-ENT-004 | sin submittedBy               | error              |
| UT-APP-ENT-005 | sin reason                    | error              |
| UT-APP-ENT-006 | resolución accepted con notes | válido             |
| UT-APP-ENT-007 | resolución sin notes          | error              |
| UT-APP-ENT-008 | cancelado conserva historial  | correcto           |

---

## 9.5. FineStatusHistory entity

Archivo sugerido:

```text id="oudsgr"
fine-status-history.entity.spec.ts
```

| ID          | Caso                | Resultado esperado |
| ----------- | ------------------- | ------------------ |
| UT-HIST-001 | transición válida   | historial creado   |
| UT-HIST-002 | sin tenantId        | error              |
| UT-HIST-003 | sin fineId          | error              |
| UT-HIST-004 | sin toStatus        | error              |
| UT-HIST-005 | metadata sanitizada | correcto           |
| UT-HIST-006 | no payload completo | correcto           |
| UT-HIST-007 | no tokens/secrets   | correcto           |

---

# 10. Pruebas de máquina de estados

Archivo sugerido:

```text id="rc5hxy"
fine-state-machine.service.spec.ts
```

## 10.1. Transiciones permitidas

| ID          | Transición                 | Resultado esperado |
| ----------- | -------------------------- | ------------------ |
| ST-FINE-001 | draft -> reported          | permitido          |
| ST-FINE-002 | reported -> underReview    | permitido          |
| ST-FINE-003 | underReview -> approved    | permitido          |
| ST-FINE-004 | reported -> rejected       | permitido          |
| ST-FINE-005 | underReview -> rejected    | permitido          |
| ST-FINE-006 | approved -> issued         | permitido          |
| ST-FINE-007 | draft -> cancelled         | permitido          |
| ST-FINE-008 | reported -> cancelled      | permitido          |
| ST-FINE-009 | underReview -> cancelled   | permitido          |
| ST-FINE-010 | approved -> cancelled      | permitido          |
| ST-FINE-011 | issued -> disputed         | permitido          |
| ST-FINE-012 | disputed -> appealAccepted | permitido          |
| ST-FINE-013 | disputed -> appealRejected | permitido          |
| ST-FINE-014 | appealAccepted -> waived   | permitido          |
| ST-FINE-015 | appealAccepted -> reversed | permitido          |
| ST-FINE-016 | appealRejected -> issued   | permitido          |
| ST-FINE-017 | issued -> waived           | permitido          |
| ST-FINE-018 | disputed -> waived         | permitido          |
| ST-FINE-019 | issued -> reversed         | permitido          |
| ST-FINE-020 | disputed -> reversed       | permitido          |
| ST-FINE-021 | rejected -> archived       | permitido          |
| ST-FINE-022 | cancelled -> archived      | permitido          |
| ST-FINE-023 | waived -> archived         | permitido          |
| ST-FINE-024 | reversed -> archived       | permitido          |
| ST-FINE-025 | issued -> archived         | permitido          |

---

## 10.2. Transiciones prohibidas

| ID              | Transición                                     | Resultado esperado   |
| --------------- | ---------------------------------------------- | -------------------- |
| ST-FINE-BLK-001 | rejected -> issued                             | error                |
| ST-FINE-BLK-002 | cancelled -> issued                            | error                |
| ST-FINE-BLK-003 | waived -> issued                               | error                |
| ST-FINE-BLK-004 | reversed -> issued                             | error                |
| ST-FINE-BLK-005 | archived -> approved                           | error                |
| ST-FINE-BLK-006 | issued -> approved                             | error                |
| ST-FINE-BLK-007 | draft -> issued                                | error                |
| ST-FINE-BLK-008 | appealRejected -> waived sin transición válida | error según política |
| ST-FINE-BLK-009 | approved -> disputed                           | error                |
| ST-FINE-BLK-010 | underReview -> issued                          | error                |

---

## 10.3. Razones obligatorias

| ID              | Acción                                  | Resultado esperado |
| --------------- | --------------------------------------- | ------------------ |
| ST-FINE-RSN-001 | reject sin reason                       | error              |
| ST-FINE-RSN-002 | cancel sin reason                       | error              |
| ST-FINE-RSN-003 | waive sin reason                        | error              |
| ST-FINE-RSN-004 | reverse sin reason                      | error              |
| ST-FINE-RSN-005 | archive sin reason si política lo exige | error              |
| ST-FINE-RSN-006 | accept appeal sin resolutionNotes       | error              |
| ST-FINE-RSN-007 | reject appeal sin resolutionNotes       | error              |

---

# 11. Pruebas de DTOs y validación

## 11.1. CreateFineConceptDto

Archivo sugerido:

```text id="m0pv49"
create-fine-concept.dto.spec.ts
```

| ID                | Caso                             | Resultado esperado    |
| ----------------- | -------------------------------- | --------------------- |
| DTO-FC-CREATE-001 | body válido                      | válido                |
| DTO-FC-CREATE-002 | sin code                         | 422                   |
| DTO-FC-CREATE-003 | sin name                         | 422                   |
| DTO-FC-CREATE-004 | category inválida                | 422                   |
| DTO-FC-CREATE-005 | defaultAmount negativo           | 422                   |
| DTO-FC-CREATE-006 | defaultAmount float              | 422                   |
| DTO-FC-CREATE-007 | currency inválida                | 422                   |
| DTO-FC-CREATE-008 | appealDeadlineDays negativo      | 422                   |
| DTO-FC-CREATE-009 | body con tenantId                | 422 o ignorado seguro |
| DTO-FC-CREATE-010 | chargeConceptId inválido formato | 422                   |

---

## 11.2. UpdateFineConceptDto

Archivo sugerido:

```text id="ndhezu"
update-fine-concept.dto.spec.ts
```

| ID             | Caso                        | Resultado esperado |
| -------------- | --------------------------- | ------------------ |
| DTO-FC-UPD-001 | actualización válida        | válido             |
| DTO-FC-UPD-002 | defaultAmount negativo      | 422                |
| DTO-FC-UPD-003 | appealDeadlineDays negativo | 422                |
| DTO-FC-UPD-004 | status manual en body       | 422                |
| DTO-FC-UPD-005 | archivedAt en body          | 422                |

---

## 11.3. CreateFineDto

Archivo sugerido:

```text id="a30j5a"
create-fine.dto.spec.ts
```

| ID                  | Caso                              | Resultado esperado    |
| ------------------- | --------------------------------- | --------------------- |
| DTO-FINE-CREATE-001 | body válido                       | válido                |
| DTO-FINE-CREATE-002 | sin fineConceptId                 | 422                   |
| DTO-FINE-CREATE-003 | sin propertyUnitId con amount > 0 | 422                   |
| DTO-FINE-CREATE-004 | sin title                         | 422                   |
| DTO-FINE-CREATE-005 | sin description                   | 422                   |
| DTO-FINE-CREATE-006 | occurredAt inválido               | 422                   |
| DTO-FINE-CREATE-007 | severity inválida                 | 422                   |
| DTO-FINE-CREATE-008 | amount negativo                   | 422                   |
| DTO-FINE-CREATE-009 | amount float                      | 422                   |
| DTO-FINE-CREATE-010 | status manual                     | 422                   |
| DTO-FINE-CREATE-011 | chargeId manual                   | 422                   |
| DTO-FINE-CREATE-012 | tenantId manual                   | 422 o ignorado seguro |

---

## 11.4. UpdateFineDto

Archivo sugerido:

```text id="foie3l"
update-fine.dto.spec.ts
```

| ID               | Caso                         | Resultado esperado |
| ---------------- | ---------------------------- | ------------------ |
| DTO-FINE-UPD-001 | body válido                  | válido             |
| DTO-FINE-UPD-002 | amount negativo              | 422                |
| DTO-FINE-UPD-003 | status manual                | 422                |
| DTO-FINE-UPD-004 | approvedBy manual            | 422                |
| DTO-FINE-UPD-005 | paymentStatusSnapshot manual | 422                |
| DTO-FINE-UPD-006 | description demasiado larga  | 422                |

---

## 11.5. Action reason DTOs

Archivos sugeridos:

```text id="lo9r4v"
reject-fine.dto.spec.ts
cancel-fine.dto.spec.ts
waive-fine.dto.spec.ts
reverse-fine.dto.spec.ts
```

| ID          | Caso                        | Resultado esperado |
| ----------- | --------------------------- | ------------------ |
| DTO-ACT-001 | razón válida                | válido             |
| DTO-ACT-002 | razón vacía                 | 422                |
| DTO-ACT-003 | razón demasiado larga       | 422                |
| DTO-ACT-004 | notes opcional para approve | válido             |
| DTO-ACT-005 | dueDate válido en issue     | válido             |
| DTO-ACT-006 | dueDate inválido            | 422                |

---

## 11.6. Evidence DTOs

Archivos sugeridos:

```text id="o7u0pe"
add-fine-evidence.dto.spec.ts
archive-fine-evidence.dto.spec.ts
```

| ID         | Caso                                    | Resultado esperado |
| ---------- | --------------------------------------- | ------------------ |
| DTO-EV-001 | evidencia textual válida                | válido             |
| DTO-EV-002 | imagen con metadata válida              | válido             |
| DTO-EV-003 | sin evidenceType                        | 422                |
| DTO-EV-004 | evidenceType inválido                   | 422                |
| DTO-EV-005 | sin title                               | 422                |
| DTO-EV-006 | fileSizeBytes negativo                  | 422                |
| DTO-EV-007 | mimeType no permitido                   | 422                |
| DTO-EV-008 | fileUrl con credenciales                | 422                |
| DTO-EV-009 | archive sin reason si política lo exige | 422                |

---

## 11.7. Appeal DTOs

Archivos sugeridos:

```text id="sxyb3v"
submit-fine-appeal.dto.spec.ts
resolve-fine-appeal.dto.spec.ts
```

| ID          | Caso                       | Resultado esperado |
| ----------- | -------------------------- | ------------------ |
| DTO-APP-001 | reclamo válido             | válido             |
| DTO-APP-002 | reason vacío               | 422                |
| DTO-APP-003 | reason demasiado largo     | 422                |
| DTO-APP-004 | accept con resolutionNotes | válido             |
| DTO-APP-005 | accept sin resolutionNotes | 422                |
| DTO-APP-006 | reject sin resolutionNotes | 422                |
| DTO-APP-007 | nextFineAction inválido    | 422                |

---

## 11.8. Query DTOs

Archivos sugeridos:

```text id="erppam"
fine-concept-list-query.dto.spec.ts
fine-list-query.dto.spec.ts
own-fine-list-query.dto.spec.ts
fine-evidence-list-query.dto.spec.ts
fine-appeal-list-query.dto.spec.ts
```

| ID          | Caso                     | Resultado esperado |
| ----------- | ------------------------ | ------------------ |
| DTO-QRY-001 | page/pageSize válidos    | válido             |
| DTO-QRY-002 | page menor a 1           | 422                |
| DTO-QRY-003 | pageSize > 100           | 422                |
| DTO-QRY-004 | sortBy permitido         | válido             |
| DTO-QRY-005 | sortBy inválido          | 422                |
| DTO-QRY-006 | status válido            | válido             |
| DTO-QRY-007 | status inválido          | 422                |
| DTO-QRY-008 | rango de fechas inválido | 422                |

---

# 12. Pruebas de servicios de aplicación

## 12.1. FineConceptService

Archivo sugerido:

```text id="gtuc61"
fine-concept.service.spec.ts
```

| ID         | Caso                           | Resultado esperado  |
| ---------- | ------------------------------ | ------------------- |
| SRV-FC-001 | crear concepto válido          | éxito               |
| SRV-FC-002 | duplicar code en tenant        | 409                 |
| SRV-FC-003 | mismo code en otro tenant      | permitido           |
| SRV-FC-004 | defaultAmount inválido         | 422                 |
| SRV-FC-005 | chargeConceptId de otro tenant | 403                 |
| SRV-FC-006 | actualizar concepto            | éxito               |
| SRV-FC-007 | activar concepto               | status active       |
| SRV-FC-008 | desactivar concepto            | status inactive     |
| SRV-FC-009 | archivar concepto              | archivedAt definido |
| SRV-FC-010 | auditar cambios                | audit event         |

---

## 12.2. FineService

Archivo sugerido:

```text id="dzk64j"
fine.service.spec.ts
```

| ID           | Caso                      | Resultado esperado |
| ------------ | ------------------------- | ------------------ |
| SRV-FINE-001 | crear multa válida        | éxito              |
| SRV-FINE-002 | concepto inactivo         | 422                |
| SRV-FINE-003 | unidad otro tenant        | 403                |
| SRV-FINE-004 | responsable otro tenant   | 403                |
| SRV-FINE-005 | monto > 0 sin unidad      | 422                |
| SRV-FINE-006 | actualizar multa editable | éxito              |
| SRV-FINE-007 | actualizar multa emitida  | 409                |
| SRV-FINE-008 | crear historial inicial   | correcto           |
| SRV-FINE-009 | auditar creación          | correcto           |

---

## 12.3. FineStateMachineService

Archivo sugerido:

```text id="rwdma8"
fine-state-machine.service.spec.ts
```

| ID         | Caso                  | Resultado esperado |
| ---------- | --------------------- | ------------------ |
| SRV-SM-001 | transición permitida  | éxito              |
| SRV-SM-002 | transición prohibida  | 409                |
| SRV-SM-003 | rechazo sin razón     | 422                |
| SRV-SM-004 | cancelación sin razón | 422                |
| SRV-SM-005 | condonación sin razón | 422                |
| SRV-SM-006 | reverso sin razón     | 422                |
| SRV-SM-007 | crea status history   | correcto           |

---

## 12.4. FinePolicyService

Archivo sugerido:

```text id="o9wq14"
fine-policy.service.spec.ts
```

| ID          | Caso                              | Resultado esperado |
| ----------- | --------------------------------- | ------------------ |
| SRV-POL-001 | evidencia no requerida            | aprueba            |
| SRV-POL-002 | evidencia requerida y existe      | aprueba            |
| SRV-POL-003 | evidencia requerida y no existe   | 422                |
| SRV-POL-004 | multa emitible                    | permitido          |
| SRV-POL-005 | multa no aprobada al emitir       | 409                |
| SRV-POL-006 | reclamo permitido                 | permitido          |
| SRV-POL-007 | reclamo no permitido por concepto | 409                |
| SRV-POL-008 | reclamo fuera de plazo            | 409                |
| SRV-POL-009 | reclamo duplicado abierto         | 409                |

---

## 12.5. FineChargeService

Archivo sugerido:

```text id="gmf3w7"
fine-charge.service.spec.ts
```

| ID          | Caso                           | Resultado esperado  |
| ----------- | ------------------------------ | ------------------- |
| SRV-CHG-001 | multa amount 0 no genera cargo | notRequired         |
| SRV-CHG-002 | multa amount > 0 genera cargo  | chargeGenerated     |
| SRV-CHG-003 | sin propertyUnitId             | 422                 |
| SRV-CHG-004 | sin chargeConceptId            | 422                 |
| SRV-CHG-005 | chargeConceptId de otro tenant | 403                 |
| SRV-CHG-006 | cargo ya existe                | no duplica          |
| SRV-CHG-007 | idempotency key repetida       | retorna mismo cargo |
| SRV-CHG-008 | fallo financiero               | error controlado    |
| SRV-CHG-009 | no crea pagos                  | correcto            |
| SRV-CHG-010 | no modifica estados de cuenta  | correcto            |

---

## 12.6. FineOwnershipService

Archivo sugerido:

```text id="nzqy07"
fine-ownership.service.spec.ts
```

| ID          | Caso                                          | Resultado esperado |
| ----------- | --------------------------------------------- | ------------------ |
| SRV-OWN-001 | propietario activo ve multa                   | permitido          |
| SRV-OWN-002 | residente activo ve multa si política permite | permitido          |
| SRV-OWN-003 | usuario sin relación con unidad               | 403                |
| SRV-OWN-004 | relación inactiva                             | 403                |
| SRV-OWN-005 | unidad de otro tenant                         | 403                |
| SRV-OWN-006 | usuario disabled                              | 403                |
| SRV-OWN-007 | usuario no reclama multa ajena                | 403                |

---

## 12.7. FineEvidenceService

Archivo sugerido:

```text id="z42m36"
fine-evidence.service.spec.ts
```

| ID         | Caso                                      | Resultado esperado |
| ---------- | ----------------------------------------- | ------------------ |
| SRV-EV-001 | crear evidencia textual                   | éxito              |
| SRV-EV-002 | crear evidencia archivo referencia        | éxito              |
| SRV-EV-003 | multa de otro tenant                      | 403/404            |
| SRV-EV-004 | archivo inválido                          | 422                |
| SRV-EV-005 | archivar evidencia                        | éxito              |
| SRV-EV-006 | evidencia archivada no cuenta como activa | correcto           |
| SRV-EV-007 | auditar creación                          | correcto           |
| SRV-EV-008 | auditar archivo                           | correcto           |

---

## 12.8. FineEvidenceAccessService

Archivo sugerido:

```text id="pc68b8"
fine-evidence-access.service.spec.ts
```

| ID             | Caso                                   | Resultado esperado |
| -------------- | -------------------------------------- | ------------------ |
| SRV-EV-ACC-001 | admin con permiso descarga             | permitido          |
| SRV-EV-ACC-002 | usuario sin permiso descarga           | 403                |
| SRV-EV-ACC-003 | owner ve evidencia permitida           | permitido          |
| SRV-EV-ACC-004 | owner no ve evidencia restringida      | 403/filtrada       |
| SRV-EV-ACC-005 | usuario de otra unidad no ve evidencia | 403                |
| SRV-EV-ACC-006 | tenant B no descarga evidencia A       | 403/404            |
| SRV-EV-ACC-007 | descarga genera URL temporal           | correcto           |
| SRV-EV-ACC-008 | descarga audita                        | correcto           |

---

## 12.9. FineAppealService

Archivo sugerido:

```text id="qzcjfe"
fine-appeal.service.spec.ts
```

| ID          | Caso                        | Resultado esperado |
| ----------- | --------------------------- | ------------------ |
| SRV-APP-001 | presentar reclamo válido    | éxito              |
| SRV-APP-002 | multa no issued             | 409                |
| SRV-APP-003 | concepto no permite reclamo | 409                |
| SRV-APP-004 | plazo vencido               | 409                |
| SRV-APP-005 | reclamo duplicado abierto   | 409                |
| SRV-APP-006 | reclamo de multa ajena      | 403                |
| SRV-APP-007 | aceptar reclamo             | accepted           |
| SRV-APP-008 | rechazar reclamo            | rejected           |
| SRV-APP-009 | cancelar reclamo            | cancelled          |
| SRV-APP-010 | auditar resolución          | correcto           |

---

## 12.10. FineMoneyService

Archivo sugerido:

```text id="xfpiup"
fine-money.service.spec.ts
```

| ID            | Caso                                  | Resultado esperado |
| ------------- | ------------------------------------- | ------------------ |
| SRV-MONEY-001 | convierte Decimal a string            | correcto           |
| SRV-MONEY-002 | rechaza float                         | error              |
| SRV-MONEY-003 | rechaza monto negativo                | error              |
| SRV-MONEY-004 | acepta USD                            | correcto           |
| SRV-MONEY-005 | redondeo no permitido silenciosamente | error              |

---

## 12.11. FineAuditService

Archivo sugerido:

```text id="buv0mk"
fine-audit.service.spec.ts
```

| ID          | Caso                          | Resultado esperado |
| ----------- | ----------------------------- | ------------------ |
| SRV-AUD-001 | audita concepto creado        | correcto           |
| SRV-AUD-002 | audita multa creada           | correcto           |
| SRV-AUD-003 | audita aprobación             | correcto           |
| SRV-AUD-004 | audita emisión                | correcto           |
| SRV-AUD-005 | audita cargo generado         | correcto           |
| SRV-AUD-006 | audita evidencia descargada   | correcto           |
| SRV-AUD-007 | metadata sin payload completo | correcto           |
| SRV-AUD-008 | metadata sin tokens/secrets   | correcto           |

---

# 13. Pruebas de casos de uso

## 13.1. Fine Concepts

| ID        | Use case                     | Casos mínimos                                                 |
| --------- | ---------------------------- | ------------------------------------------------------------- |
| UC-FC-001 | CreateFineConceptUseCase     | válido, duplicado, monto inválido, chargeConcept cross-tenant |
| UC-FC-002 | ListFineConceptsUseCase      | filtros, paginación, tenant isolation                         |
| UC-FC-003 | GetFineConceptUseCase        | válido, inexistente, otro tenant                              |
| UC-FC-004 | UpdateFineConceptUseCase     | válido, monto inválido, auditoría                             |
| UC-FC-005 | ActivateFineConceptUseCase   | cambio de estado, auditoría                                   |
| UC-FC-006 | DeactivateFineConceptUseCase | no permite nueva multa, auditoría                             |
| UC-FC-007 | ArchiveFineConceptUseCase    | soft archive, auditoría                                       |

---

## 13.2. Fines administrativas

| ID          | Use case                | Casos mínimos                                            |
| ----------- | ----------------------- | -------------------------------------------------------- |
| UC-FINE-001 | CreateFineUseCase       | válida, unidad otro tenant, responsable otro tenant      |
| UC-FINE-002 | ListFinesUseCase        | filtros, paginación, tenant isolation                    |
| UC-FINE-003 | GetFineUseCase          | válida, inexistente, otro tenant                         |
| UC-FINE-004 | UpdateFineUseCase       | editable, no editable, auditoría                         |
| UC-FINE-005 | SubmitFineReviewUseCase | válida, transición inválida                              |
| UC-FINE-006 | ApproveFineUseCase      | válida, evidencia requerida ausente, transición inválida |
| UC-FINE-007 | RejectFineUseCase       | válida, razón requerida, transición inválida             |
| UC-FINE-008 | IssueFineUseCase        | válida, genera cargo, idempotente                        |
| UC-FINE-009 | CancelFineUseCase       | válida, razón requerida, no revierte cargo               |
| UC-FINE-010 | WaiveFineUseCase        | válida, razón requerida, no borra cargo                  |
| UC-FINE-011 | ReverseFineUseCase      | válida, razón requerida, no modifica pagos               |
| UC-FINE-012 | ArchiveFineUseCase      | soft archive, no elimina historial                       |

---

## 13.3. Evidence

| ID        | Use case                    | Casos mínimos                               |
| --------- | --------------------------- | ------------------------------------------- |
| UC-EV-001 | AddFineEvidenceUseCase      | válida, archivo inválido, multa otro tenant |
| UC-EV-002 | ListFineEvidenceUseCase     | por multa, permisos, tenant isolation       |
| UC-EV-003 | GetFineEvidenceUseCase      | válida, otro tenant, sin permiso            |
| UC-EV-004 | DownloadFineEvidenceUseCase | URL temporal, auditoría, sin permiso        |
| UC-EV-005 | ArchiveFineEvidenceUseCase  | soft archive, auditoría                     |

---

## 13.4. Appeals administrativas

| ID         | Use case                | Casos mínimos                                 |
| ---------- | ----------------------- | --------------------------------------------- |
| UC-APP-001 | ListFineAppealsUseCase  | por multa, filtros, tenant isolation          |
| UC-APP-002 | GetFineAppealUseCase    | válido, otro tenant, sin permiso              |
| UC-APP-003 | AcceptFineAppealUseCase | válido, notes requerido, fine status correcto |
| UC-APP-004 | RejectFineAppealUseCase | válido, notes requerido, fine status correcto |
| UC-APP-005 | CancelFineAppealUseCase | válido, reason requerido, auditoría           |

---

## 13.5. Fines propias

| ID             | Use case                   | Casos mínimos                              |
| -------------- | -------------------------- | ------------------------------------------ |
| UC-ME-FINE-001 | ListOwnFinesUseCase        | solo propias, filtros, paginación          |
| UC-ME-FINE-002 | GetOwnFineUseCase          | propia válida, ajena 403/404               |
| UC-ME-FINE-003 | ListOwnFineEvidenceUseCase | evidencia permitida, evidencia restringida |
| UC-ME-FINE-004 | SubmitOwnFineAppealUseCase | válido, fuera plazo, duplicado, ajeno      |

---

## 13.6. My Fine Appeals

| ID            | Use case                  | Casos mínimos                |
| ------------- | ------------------------- | ---------------------------- |
| UC-ME-APP-001 | ListOwnFineAppealsUseCase | solo propios, filtros        |
| UC-ME-APP-002 | GetOwnFineAppealUseCase   | propio válido, ajeno 403/404 |

---

# 14. Pruebas de repositorios

## 14.1. FineConcept repository

Archivo sugerido:

```text id="h1iwqt"
prisma-fine-concept.repository.spec.ts
```

| ID         | Caso                           | Resultado esperado |
| ---------- | ------------------------------ | ------------------ |
| INT-FC-001 | create concept                 | persiste           |
| INT-FC-002 | list by tenant                 | solo tenant        |
| INT-FC-003 | find by id + tenant            | correcto           |
| INT-FC-004 | find by code + tenant          | correcto           |
| INT-FC-005 | duplicate code same tenant     | constraint/409     |
| INT-FC-006 | same code different tenant     | permitido          |
| INT-FC-007 | archived not listed by default | correcto           |
| INT-FC-008 | filter by category             | correcto           |
| INT-FC-009 | filter by status               | correcto           |

---

## 14.2. Fine repository

Archivo sugerido:

```text id="so4zk8"
prisma-fine.repository.spec.ts
```

| ID           | Caso                         | Resultado esperado |
| ------------ | ---------------------------- | ------------------ |
| INT-FINE-001 | create fine                  | persiste           |
| INT-FINE-002 | find by id + tenant          | correcto           |
| INT-FINE-003 | list by tenant               | correcto           |
| INT-FINE-004 | list by status               | correcto           |
| INT-FINE-005 | list by propertyUnit         | correcto           |
| INT-FINE-006 | list own by propertyUnits    | correcto           |
| INT-FINE-007 | tenant isolation             | correcto           |
| INT-FINE-008 | attach charge                | persiste chargeId  |
| INT-FINE-009 | chargeId unique              | constraint         |
| INT-FINE-010 | create status history        | persiste           |
| INT-FINE-011 | archived excluded by default | correcto           |
| INT-FINE-012 | amount Decimal               | correcto           |

---

## 14.3. FineEvidence repository

Archivo sugerido:

```text id="kazxh0"
prisma-fine-evidence.repository.spec.ts
```

| ID         | Caso                  | Resultado esperado |
| ---------- | --------------------- | ------------------ |
| INT-EV-001 | create evidence       | persiste           |
| INT-EV-002 | list by fine          | correcto           |
| INT-EV-003 | find by id + tenant   | correcto           |
| INT-EV-004 | active evidence count | correcto           |
| INT-EV-005 | archived not active   | correcto           |
| INT-EV-006 | tenant isolation      | correcto           |
| INT-EV-007 | filter by type        | correcto           |
| INT-EV-008 | filter by status      | correcto           |

---

## 14.4. FineAppeal repository

Archivo sugerido:

```text id="nkum77"
prisma-fine-appeal.repository.spec.ts
```

| ID          | Caso                          | Resultado esperado |
| ----------- | ----------------------------- | ------------------ |
| INT-APP-001 | create appeal                 | persiste           |
| INT-APP-002 | list by fine                  | correcto           |
| INT-APP-003 | find by id + tenant           | correcto           |
| INT-APP-004 | list own appeals              | correcto           |
| INT-APP-005 | find open appeal              | correcto           |
| INT-APP-006 | no open appeal after accepted | correcto           |
| INT-APP-007 | tenant isolation              | correcto           |
| INT-APP-008 | archived excluded by default  | correcto           |

---

## 14.5. FineStatusHistory repository

Archivo sugerido:

```text id="snx5wa"
prisma-fine-status-history.repository.spec.ts
```

| ID           | Caso                | Resultado esperado |
| ------------ | ------------------- | ------------------ |
| INT-HIST-001 | create history      | persiste           |
| INT-HIST-002 | list by fine        | orden correcto     |
| INT-HIST-003 | tenant isolation    | correcto           |
| INT-HIST-004 | metadata sanitizada | correcto           |

---

# 15. Pruebas API — Fine Concepts

## 15.1. `GET /api/v1/tenant/fine-concepts`

| ID              | Caso                | Resultado esperado |
| --------------- | ------------------- | ------------------ |
| API-FC-LIST-001 | usuario con permiso | 200                |
| API-FC-LIST-002 | sin token           | 401                |
| API-FC-LIST-003 | sin permiso         | 403                |
| API-FC-LIST-004 | filtra status       | correcto           |
| API-FC-LIST-005 | filtra category     | correcto           |
| API-FC-LIST-006 | busca por q         | correcto           |
| API-FC-LIST-007 | pagina              | correcto           |
| API-FC-LIST-008 | no muestra tenant B | correcto           |

---

## 15.2. `POST /api/v1/tenant/fine-concepts`

| ID                | Caso                        | Resultado esperado    |
| ----------------- | --------------------------- | --------------------- |
| API-FC-CREATE-001 | body válido                 | 201                   |
| API-FC-CREATE-002 | sin token                   | 401                   |
| API-FC-CREATE-003 | sin permiso                 | 403                   |
| API-FC-CREATE-004 | code duplicado              | 409                   |
| API-FC-CREATE-005 | defaultAmount negativo      | 422                   |
| API-FC-CREATE-006 | defaultAmount float         | 422                   |
| API-FC-CREATE-007 | chargeConceptId otro tenant | 403                   |
| API-FC-CREATE-008 | body con tenantId           | 422 o ignorado seguro |
| API-FC-CREATE-009 | audit event                 | generado              |

---

## 15.3. `GET/PATCH /api/v1/tenant/fine-concepts/{fineConceptId}`

| ID               | Caso              | Resultado esperado |
| ---------------- | ----------------- | ------------------ |
| API-FC-GET-001   | obtener existente | 200                |
| API-FC-GET-002   | inexistente       | 404                |
| API-FC-GET-003   | otro tenant       | 404/403            |
| API-FC-PATCH-001 | actualizar válido | 200                |
| API-FC-PATCH-002 | sin permiso       | 403                |
| API-FC-PATCH-003 | monto inválido    | 422                |
| API-FC-PATCH-004 | status manual     | 422                |
| API-FC-PATCH-005 | audit event       | generado           |

---

## 15.4. Acciones de estado de concepto

| ID               | Endpoint    | Resultado esperado       |
| ---------------- | ----------- | ------------------------ |
| API-FC-ACT-001   | activate    | 200, status active       |
| API-FC-DEACT-001 | deactivate  | 200, status inactive     |
| API-FC-ARCH-001  | archive     | 200, archivedAt definido |
| API-FC-STATE-001 | sin permiso | 403                      |
| API-FC-STATE-002 | otro tenant | 404/403                  |
| API-FC-STATE-003 | audit event | generado                 |

---

# 16. Pruebas API — Fines administrativas

## 16.1. Listar y obtener

| ID                | Endpoint  | Caso                  | Resultado esperado |
| ----------------- | --------- | --------------------- | ------------------ |
| API-FINE-LIST-001 | GET fines | con permiso           | 200                |
| API-FINE-LIST-002 | GET fines | sin permiso           | 403                |
| API-FINE-LIST-003 | GET fines | filtra status         | correcto           |
| API-FINE-LIST-004 | GET fines | filtra fineConceptId  | correcto           |
| API-FINE-LIST-005 | GET fines | filtra propertyUnitId | correcto           |
| API-FINE-LIST-006 | GET fines | filtra severity       | correcto           |
| API-FINE-LIST-007 | GET fines | no muestra tenant B   | correcto           |
| API-FINE-GET-001  | GET fine  | existente             | 200                |
| API-FINE-GET-002  | GET fine  | inexistente           | 404                |
| API-FINE-GET-003  | GET fine  | otro tenant           | 404/403            |

---

## 16.2. Crear multa

| ID                  | Caso                    | Resultado esperado    |
| ------------------- | ----------------------- | --------------------- |
| API-FINE-CREATE-001 | multa válida            | 201                   |
| API-FINE-CREATE-002 | sin token               | 401                   |
| API-FINE-CREATE-003 | sin permiso             | 403                   |
| API-FINE-CREATE-004 | concepto inactivo       | 422                   |
| API-FINE-CREATE-005 | concepto archivado      | 422                   |
| API-FINE-CREATE-006 | concepto otro tenant    | 403/404               |
| API-FINE-CREATE-007 | unidad otro tenant      | 403                   |
| API-FINE-CREATE-008 | responsable otro tenant | 403                   |
| API-FINE-CREATE-009 | amount > 0 sin unidad   | 422                   |
| API-FINE-CREATE-010 | amount negativo         | 422                   |
| API-FINE-CREATE-011 | amount float            | 422                   |
| API-FINE-CREATE-012 | body con tenantId       | 422 o ignorado seguro |
| API-FINE-CREATE-013 | audit event             | generado              |
| API-FINE-CREATE-014 | status history          | creado                |

---

## 16.3. Actualizar multa

| ID               | Caso                   | Resultado esperado |
| ---------------- | ---------------------- | ------------------ |
| API-FINE-UPD-001 | actualizar reported    | 200                |
| API-FINE-UPD-002 | actualizar underReview | 200                |
| API-FINE-UPD-003 | actualizar issued      | 409                |
| API-FINE-UPD-004 | actualizar waived      | 409                |
| API-FINE-UPD-005 | sin permiso            | 403                |
| API-FINE-UPD-006 | otro tenant            | 404/403            |
| API-FINE-UPD-007 | status manual          | 422                |
| API-FINE-UPD-008 | chargeId manual        | 422                |
| API-FINE-UPD-009 | audit event            | generado           |

---

## 16.4. Pasar a revisión

| ID               | Caso                    | Resultado esperado |
| ---------------- | ----------------------- | ------------------ |
| API-FINE-REV-001 | reported -> underReview | 200                |
| API-FINE-REV-002 | issued -> underReview   | 409                |
| API-FINE-REV-003 | rejected -> underReview | 409                |
| API-FINE-REV-004 | sin permiso             | 403                |
| API-FINE-REV-005 | status history          | creado             |
| API-FINE-REV-006 | audit event             | generado           |

---

## 16.5. Aprobar multa

| ID                   | Caso                                     | Resultado esperado         |
| -------------------- | ---------------------------------------- | -------------------------- |
| API-FINE-APPROVE-001 | underReview -> approved                  | 200                        |
| API-FINE-APPROVE-002 | reported -> approved si política permite | 200 o 409 según definición |
| API-FINE-APPROVE-003 | sin permiso                              | 403                        |
| API-FINE-APPROVE-004 | evidencia requerida ausente              | 422                        |
| API-FINE-APPROVE-005 | evidencia requerida presente             | 200                        |
| API-FINE-APPROVE-006 | rejected -> approved                     | 409                        |
| API-FINE-APPROVE-007 | no genera cargo                          | correcto                   |
| API-FINE-APPROVE-008 | status history                           | creado                     |
| API-FINE-APPROVE-009 | audit event                              | generado                   |

---

## 16.6. Rechazar multa

| ID                  | Caso                               | Resultado esperado |
| ------------------- | ---------------------------------- | ------------------ |
| API-FINE-REJECT-001 | underReview -> rejected con reason | 200                |
| API-FINE-REJECT-002 | reported -> rejected con reason    | 200                |
| API-FINE-REJECT-003 | sin reason                         | 422                |
| API-FINE-REJECT-004 | issued -> rejected                 | 409                |
| API-FINE-REJECT-005 | sin permiso                        | 403                |
| API-FINE-REJECT-006 | status history                     | creado             |
| API-FINE-REJECT-007 | audit event                        | generado           |

---

## 16.7. Emitir multa

| ID                 | Caso                     | Resultado esperado |
| ------------------ | ------------------------ | ------------------ |
| API-FINE-ISSUE-001 | approved -> issued       | 200                |
| API-FINE-ISSUE-002 | reported -> issued       | 409                |
| API-FINE-ISSUE-003 | rejected -> issued       | 409                |
| API-FINE-ISSUE-004 | amount > 0 genera cargo  | chargeGenerated    |
| API-FINE-ISSUE-005 | amount 0 no genera cargo | notRequired        |
| API-FINE-ISSUE-006 | sin chargeConcept        | 422                |
| API-FINE-ISSUE-007 | cargo ya existe          | no duplica         |
| API-FINE-ISSUE-008 | sin permiso              | 403                |
| API-FINE-ISSUE-009 | no crea pago             | correcto           |
| API-FINE-ISSUE-010 | status history           | creado             |
| API-FINE-ISSUE-011 | audit event              | generado           |

---

## 16.8. Cancelar, condonar, reversar y archivar

| ID                 | Endpoint | Caso                 | Resultado esperado                        |
| ------------------ | -------- | -------------------- | ----------------------------------------- |
| API-FINE-CAN-001   | cancel   | reported con reason  | 200                                       |
| API-FINE-CAN-002   | cancel   | approved con reason  | 200                                       |
| API-FINE-CAN-003   | cancel   | issued               | 409 o ruta a reverse/waive según política |
| API-FINE-CAN-004   | cancel   | sin reason           | 422                                       |
| API-FINE-WAIVE-001 | waive    | issued con reason    | 200                                       |
| API-FINE-WAIVE-002 | waive    | sin reason           | 422                                       |
| API-FINE-WAIVE-003 | waive    | no borra cargo       | correcto                                  |
| API-FINE-REVRS-001 | reverse  | issued con reason    | 200                                       |
| API-FINE-REVRS-002 | reverse  | sin reason           | 422                                       |
| API-FINE-REVRS-003 | reverse  | no modifica pagos    | correcto                                  |
| API-FINE-ARCH-001  | archive  | terminal             | 200                                       |
| API-FINE-ARCH-002  | archive  | no elimina historial | correcto                                  |
| API-FINE-ACT-001   | todas    | sin permiso          | 403                                       |
| API-FINE-ACT-002   | todas    | audit event          | generado                                  |

---

## 16.9. Generar cargo

| ID               | Caso                            | Resultado esperado               |
| ---------------- | ------------------------------- | -------------------------------- |
| API-FINE-CHG-001 | multa monetaria emitida         | 200                              |
| API-FINE-CHG-002 | multa amount 0                  | 422 o notRequired                |
| API-FINE-CHG-003 | sin propertyUnitId              | 422                              |
| API-FINE-CHG-004 | sin chargeConcept               | 422                              |
| API-FINE-CHG-005 | concepto financiero otro tenant | 403                              |
| API-FINE-CHG-006 | cargo ya generado               | 200 mismo cargo o 409 controlado |
| API-FINE-CHG-007 | sin permiso                     | 403                              |
| API-FINE-CHG-008 | no crea pago                    | correcto                         |
| API-FINE-CHG-009 | no modifica account statements  | correcto                         |
| API-FINE-CHG-010 | audit event                     | generado                         |

---

# 17. Pruebas API — Fine Evidence

## 17.1. Listar evidencias

| ID              | Caso                      | Resultado esperado |
| --------------- | ------------------------- | ------------------ |
| API-EV-LIST-001 | usuario con permiso       | 200                |
| API-EV-LIST-002 | sin token                 | 401                |
| API-EV-LIST-003 | sin permiso               | 403                |
| API-EV-LIST-004 | fineId otro tenant        | 404/403            |
| API-EV-LIST-005 | filtra evidenceType       | correcto           |
| API-EV-LIST-006 | filtra status             | correcto           |
| API-EV-LIST-007 | no expone fileUrl directa | correcto           |

---

## 17.2. Agregar evidencia

| ID             | Caso                               | Resultado esperado |
| -------------- | ---------------------------------- | ------------------ |
| API-EV-ADD-001 | evidencia textual válida           | 201                |
| API-EV-ADD-002 | evidencia imagen referencia válida | 201                |
| API-EV-ADD-003 | fineId otro tenant                 | 404/403            |
| API-EV-ADD-004 | sin permiso                        | 403                |
| API-EV-ADD-005 | mimeType inválido                  | 422                |
| API-EV-ADD-006 | fileSizeBytes negativo             | 422                |
| API-EV-ADD-007 | fileUrl insegura                   | 422                |
| API-EV-ADD-008 | audit event                        | generado           |

---

## 17.3. Obtener y descargar evidencia

| ID             | Endpoint     | Caso                   | Resultado esperado |
| -------------- | ------------ | ---------------------- | ------------------ |
| API-EV-GET-001 | GET evidence | existente              | 200                |
| API-EV-GET-002 | GET evidence | otro tenant            | 404/403            |
| API-EV-GET-003 | GET evidence | sin permiso            | 403                |
| API-EV-DL-001  | download     | con permiso            | 200                |
| API-EV-DL-002  | download     | sin permiso            | 403                |
| API-EV-DL-003  | download     | evidence otro tenant   | 404/403            |
| API-EV-DL-004  | download     | genera URL temporal    | correcto           |
| API-EV-DL-005  | download     | no expone ruta interna | correcto           |
| API-EV-DL-006  | download     | audit event            | generado           |

---

## 17.4. Archivar evidencia

| ID              | Caso                                                | Resultado esperado |
| --------------- | --------------------------------------------------- | ------------------ |
| API-EV-ARCH-001 | archivar válida                                     | 200                |
| API-EV-ARCH-002 | sin permiso                                         | 403                |
| API-EV-ARCH-003 | evidencia otro tenant                               | 404/403            |
| API-EV-ARCH-004 | evidencia archivada no cuenta como evidencia activa | correcto           |
| API-EV-ARCH-005 | audit event                                         | generado           |

---

# 18. Pruebas API — Fine Appeals administrativas

## 18.1. Listar y obtener reclamos

| ID               | Endpoint            | Caso             | Resultado esperado |
| ---------------- | ------------------- | ---------------- | ------------------ |
| API-APP-LIST-001 | GET appeals by fine | con permiso      | 200                |
| API-APP-LIST-002 | GET appeals by fine | sin permiso      | 403                |
| API-APP-LIST-003 | GET appeals by fine | fine otro tenant | 404/403            |
| API-APP-GET-001  | GET appeal          | existente        | 200                |
| API-APP-GET-002  | GET appeal          | otro tenant      | 404/403            |
| API-APP-GET-003  | GET appeal          | sin permiso      | 403                |

---

## 18.2. Resolver reclamos

| ID              | Endpoint   | Caso                         | Resultado esperado |
| --------------- | ---------- | ---------------------------- | ------------------ |
| API-APP-ACC-001 | accept     | con notes y waive            | 200                |
| API-APP-ACC-002 | accept     | con notes y reverse          | 200                |
| API-APP-ACC-003 | accept     | sin notes                    | 422                |
| API-APP-ACC-004 | accept     | appeal ya resuelto           | 409                |
| API-APP-REJ-001 | reject     | con notes                    | 200                |
| API-APP-REJ-002 | reject     | sin notes                    | 422                |
| API-APP-REJ-003 | reject     | fine vuelve a appealRejected | correcto           |
| API-APP-CAN-001 | cancel     | con reason                   | 200                |
| API-APP-CAN-002 | cancel     | sin reason                   | 422                |
| API-APP-SEC-001 | cualquiera | sin permiso                  | 403                |
| API-APP-AUD-001 | cualquiera | audit event                  | generado           |

---

# 19. Pruebas API — Fines propias `/me`

## 19.1. `GET /api/v1/me/fines`

| ID                   | Caso                                      | Resultado esperado |
| -------------------- | ----------------------------------------- | ------------------ |
| API-ME-FINE-LIST-001 | usuario con multas propias                | 200                |
| API-ME-FINE-LIST-002 | solo muestra unidades propias             | correcto           |
| API-ME-FINE-LIST-003 | no muestra tenant B                       | correcto           |
| API-ME-FINE-LIST-004 | filtra propertyUnitId propio              | correcto           |
| API-ME-FINE-LIST-005 | filtra propertyUnitId ajeno               | 403                |
| API-ME-FINE-LIST-006 | sin permiso                               | 403                |
| API-ME-FINE-LIST-007 | sin token                                 | 401                |
| API-ME-FINE-LIST-008 | no muestra audit metadata                 | correcto           |
| API-ME-FINE-LIST-009 | no muestra datos administrativos internos | correcto           |

---

## 19.2. `GET /api/v1/me/fines/{fineId}`

| ID                  | Caso                            | Resultado esperado |
| ------------------- | ------------------------------- | ------------------ |
| API-ME-FINE-GET-001 | multa propia                    | 200                |
| API-ME-FINE-GET-002 | multa ajena mismo tenant        | 403/404            |
| API-ME-FINE-GET-003 | multa otro tenant               | 403/404            |
| API-ME-FINE-GET-004 | no expone reportedBy/approvedBy | correcto           |
| API-ME-FINE-GET-005 | no expone reviewNotes internas  | correcto           |
| API-ME-FINE-GET-006 | sin permiso                     | 403                |

---

## 19.3. `GET /api/v1/me/fines/{fineId}/evidence`

| ID                 | Caso                        | Resultado esperado |
| ------------------ | --------------------------- | ------------------ |
| API-ME-EV-LIST-001 | evidencia propia permitida  | 200                |
| API-ME-EV-LIST-002 | multa ajena                 | 403/404            |
| API-ME-EV-LIST-003 | evidencia restringida       | filtrada o 403     |
| API-ME-EV-LIST-004 | no expone fileUrl privada   | correcto           |
| API-ME-EV-LIST-005 | no expone datos de terceros | correcto           |
| API-ME-EV-LIST-006 | sin permiso                 | 403                |

---

## 19.4. `POST /api/v1/me/fines/{fineId}/appeals`

| ID                 | Caso                          | Resultado esperado |
| ------------------ | ----------------------------- | ------------------ |
| API-ME-APP-SUB-001 | reclamo propio válido         | 201                |
| API-ME-APP-SUB-002 | multa ajena                   | 403/404            |
| API-ME-APP-SUB-003 | multa no issued               | 409                |
| API-ME-APP-SUB-004 | concepto no permite reclamo   | 409                |
| API-ME-APP-SUB-005 | fuera de plazo                | 409                |
| API-ME-APP-SUB-006 | reclamo abierto duplicado     | 409                |
| API-ME-APP-SUB-007 | sin reason                    | 422                |
| API-ME-APP-SUB-008 | sin permiso                   | 403                |
| API-ME-APP-SUB-009 | audit event                   | generado           |
| API-ME-APP-SUB-010 | fine status cambia a disputed | correcto           |

---

# 20. Pruebas API — My Fine Appeals

## 20.1. `GET /api/v1/me/fine-appeals`

| ID                  | Caso                          | Resultado esperado |
| ------------------- | ----------------------------- | ------------------ |
| API-ME-APP-LIST-001 | usuario con reclamos propios  | 200                |
| API-ME-APP-LIST-002 | solo muestra reclamos propios | correcto           |
| API-ME-APP-LIST-003 | no muestra tenant B           | correcto           |
| API-ME-APP-LIST-004 | filtra status                 | correcto           |
| API-ME-APP-LIST-005 | pagina                        | correcto           |
| API-ME-APP-LIST-006 | sin permiso                   | 403                |
| API-ME-APP-LIST-007 | sin token                     | 401                |

---

## 20.2. `GET /api/v1/me/fine-appeals/{appealId}`

| ID                 | Caso                                         | Resultado esperado |
| ------------------ | -------------------------------------------- | ------------------ |
| API-ME-APP-GET-001 | reclamo propio                               | 200                |
| API-ME-APP-GET-002 | reclamo ajeno mismo tenant                   | 403/404            |
| API-ME-APP-GET-003 | reclamo otro tenant                          | 403/404            |
| API-ME-APP-GET-004 | no expone datos administrativos innecesarios | correcto           |
| API-ME-APP-GET-005 | sin permiso                                  | 403                |

---

# 21. Pruebas de autorización

## 21.1. Fine Concepts

| ID          | Usuario                      | Acción          | Resultado |
| ----------- | ---------------------------- | --------------- | --------- |
| AUTH-FC-001 | tenantAdminA                 | create          | 201       |
| AUTH-FC-002 | sanctionManagerA con permiso | read            | 200       |
| AUTH-FC-003 | userWithoutPermission        | create          | 403       |
| AUTH-FC-004 | tenantAdminB                 | read concepto A | 403/404   |
| AUTH-FC-005 | anonymousUser                | read admin      | 401       |
| AUTH-FC-006 | disabledUser                 | read admin      | 403       |

---

## 21.2. Fines administrativas

| ID            | Usuario                      | Acción                          | Resultado |
| ------------- | ---------------------------- | ------------------------------- | --------- |
| AUTH-FINE-001 | sanctionManagerA             | create                          | 201       |
| AUTH-FINE-002 | sanctionManagerA             | approve si tiene permiso        | 200       |
| AUTH-FINE-003 | tenantAdminA                 | issue                           | 200       |
| AUTH-FINE-004 | treasurerA                   | generateCharge si tiene permiso | 200       |
| AUTH-FINE-005 | tenantUserWithoutPermissionA | approve                         | 403       |
| AUTH-FINE-006 | tenantAdminB                 | issue multa A                   | 403/404   |
| AUTH-FINE-007 | disabledUser                 | list fines                      | 403       |

---

## 21.3. Evidencias

| ID          | Usuario                      | Acción                   | Resultado               |
| ----------- | ---------------------------- | ------------------------ | ----------------------- |
| AUTH-EV-001 | sanctionManagerA             | add evidence             | 201                     |
| AUTH-EV-002 | sanctionManagerA             | download                 | 200 si tiene permiso    |
| AUTH-EV-003 | tenantUserWithoutPermissionA | download                 | 403                     |
| AUTH-EV-004 | ownerUserA                   | own evidence             | 200 si política permite |
| AUTH-EV-005 | ownerUserA                   | evidence de unidad ajena | 403/404                 |
| AUTH-EV-006 | anonymousUser                | download                 | 401                     |

---

## 21.4. Reclamos propios

| ID              | Usuario               | Acción                            | Resultado |
| --------------- | --------------------- | --------------------------------- | --------- |
| AUTH-ME-APP-001 | ownerUserA            | submit appeal own fine            | 201       |
| AUTH-ME-APP-002 | residentUserA         | submit appeal si política permite | 201       |
| AUTH-ME-APP-003 | ownerUserA            | submit appeal unit B              | 403       |
| AUTH-ME-APP-004 | ownerUserA            | read appeal ajeno                 | 403/404   |
| AUTH-ME-APP-005 | userWithoutPermission | submit appeal                     | 403       |

---

# 22. Pruebas multitenant

| ID          | Caso                                          | Resultado esperado |
| ----------- | --------------------------------------------- | ------------------ |
| MT-FINE-001 | Tenant A lista conceptos                      | no ve Tenant B     |
| MT-FINE-002 | Tenant A lista multas                         | no ve Tenant B     |
| MT-FINE-003 | Tenant A obtiene fineConceptId de B           | 404/403            |
| MT-FINE-004 | Tenant A obtiene fineId de B                  | 404/403            |
| MT-FINE-005 | Tenant A crea multa con conceptId B           | 403/404            |
| MT-FINE-006 | Tenant A crea multa con propertyUnitId B      | 403                |
| MT-FINE-007 | Tenant A crea multa con responsiblePersonId B | 403                |
| MT-FINE-008 | Tenant A usa chargeConceptId B                | 403                |
| MT-FINE-009 | Tenant A usa chargeId B                       | 403                |
| MT-FINE-010 | Tenant A no ve evidencias B                   | 404/403            |
| MT-FINE-011 | Tenant A no ve reclamos B                     | 404/403            |
| MT-FINE-012 | Status history A no se mezcla con B           | correcto           |
| MT-FINE-013 | Audit metadata mantiene tenant correcto       | correcto           |

---

# 23. Pruebas own-resource

| ID | Caso | Resultado esperado |
|---|---|
| OWN-FINE-001 | propietario consulta multa de su unidad | 200 |
| OWN-FINE-002 | propietario consulta multa de otra unidad | 403/404 |
| OWN-FINE-003 | residente consulta multa si política permite | 200 |
| OWN-FINE-004 | usuario con relación inactiva consulta multa | 403 |
| OWN-FINE-005 | usuario reclama multa propia | 201 |
| OWN-FINE-006 | usuario reclama multa ajena | 403/404 |
| OWN-FINE-007 | usuario lista multas filtrando unidad ajena | 403 |
| OWN-FINE-008 | usuario lista evidencias de multa ajena | 403/404 |
| OWN-FINE-009 | usuario lista reclamos de multa ajena | 403/404 |

---

# 24. Pruebas financieras de regresión

| ID           | Caso                                               | Resultado esperado |
| ------------ | -------------------------------------------------- | ------------------ |
| FIN-FINE-001 | defaultAmount se guarda Decimal                    | correcto           |
| FIN-FINE-002 | amount se guarda Decimal                           | correcto           |
| FIN-FINE-003 | amount sale como string                            | correcto           |
| FIN-FINE-004 | monto negativo falla                               | 422                |
| FIN-FINE-005 | monto float falla                                  | 422                |
| FIN-FINE-006 | amount > 0 exige propertyUnitId                    | 422                |
| FIN-FINE-007 | emitir multa genera cargo                          | correcto           |
| FIN-FINE-008 | cargo pertenece al tenant                          | correcto           |
| FIN-FINE-009 | cargo pertenece a propertyUnit                     | correcto           |
| FIN-FINE-010 | cargo usa concepto financiero correcto             | correcto           |
| FIN-FINE-011 | cargo se genera una sola vez                       | correcto           |
| FIN-FINE-012 | Idempotency-Key repetida retorna mismo cargo       | correcto           |
| FIN-FINE-013 | amount 0 no genera cargo                           | correcto           |
| FIN-FINE-014 | reclamo no revierte cargo automáticamente          | correcto           |
| FIN-FINE-015 | condonación no borra cargo                         | correcto           |
| FIN-FINE-016 | reverso no modifica pagos                          | correcto           |
| FIN-FINE-017 | multas no confirman pagos                          | correcto           |
| FIN-FINE-018 | multas no asignan pagos                            | correcto           |
| FIN-FINE-019 | multas no modifican comprobantes                   | correcto           |
| FIN-FINE-020 | multas no modifican estados de cuenta directamente | correcto           |

---

# 25. Pruebas de evidencias y privacidad

| ID         | Caso                                          | Resultado esperado |
| ---------- | --------------------------------------------- | ------------------ |
| EV-SEC-001 | evidencia no visible sin permiso              | 403                |
| EV-SEC-002 | evidencia no descargable sin permiso          | 403                |
| EV-SEC-003 | evidencia de otro tenant no visible           | 404/403            |
| EV-SEC-004 | evidencia de multa ajena no visible desde /me | 404/403            |
| EV-SEC-005 | fileUrl privada no se expone en listados      | correcto           |
| EV-SEC-006 | downloadUrl temporal                          | correcto           |
| EV-SEC-007 | downloadUrl tiene expiración                  | correcto           |
| EV-SEC-008 | descarga se audita                            | correcto           |
| EV-SEC-009 | evidencia archivada no cuenta como activa     | correcto           |
| EV-SEC-010 | evidencia con mimeType peligroso falla        | 422                |
| EV-SEC-011 | metadata no contiene tokens                   | correcto           |
| EV-SEC-012 | logs no contienen fileUrl con secretos        | correcto           |

---

# 26. Pruebas de reclamos

| ID           | Caso                                      | Resultado esperado |
| ------------ | ----------------------------------------- | ------------------ |
| APP-FINE-001 | reclamo sobre multa issued                | 201                |
| APP-FINE-002 | reclamo sobre multa reported              | 409                |
| APP-FINE-003 | reclamo sobre multa approved              | 409                |
| APP-FINE-004 | reclamo sobre multa waived                | 409                |
| APP-FINE-005 | reclamo cuando concept allowsAppeal false | 409                |
| APP-FINE-006 | reclamo dentro de plazo                   | 201                |
| APP-FINE-007 | reclamo fuera de plazo                    | 409                |
| APP-FINE-008 | reclamo duplicado abierto                 | 409                |
| APP-FINE-009 | reclamo de multa ajena                    | 403/404            |
| APP-FINE-010 | aceptar reclamo                           | accepted           |
| APP-FINE-011 | rechazar reclamo                          | rejected           |
| APP-FINE-012 | cancelar reclamo                          | cancelled          |
| APP-FINE-013 | aceptar reclamo con nextAction waive      | fine waived        |
| APP-FINE-014 | aceptar reclamo con nextAction reverse    | fine reversed      |
| APP-FINE-015 | rechazar reclamo deja fine appealRejected | correcto           |
| APP-FINE-016 | resolución sin notes falla                | 422                |
| APP-FINE-017 | resolución se audita                      | correcto           |

---

# 27. Pruebas de auditoría

| ID           | Caso                          | Evento esperado               |
| ------------ | ----------------------------- | ----------------------------- |
| AUD-FC-001   | crear concepto                | `fineConcept.created`         |
| AUD-FC-002   | actualizar concepto           | `fineConcept.updated`         |
| AUD-FC-003   | activar concepto              | `fineConcept.activated`       |
| AUD-FC-004   | desactivar concepto           | `fineConcept.deactivated`     |
| AUD-FC-005   | archivar concepto             | `fineConcept.archived`        |
| AUD-FINE-001 | crear multa                   | `fine.created`                |
| AUD-FINE-002 | actualizar multa              | `fine.updated`                |
| AUD-FINE-003 | pasar a revisión              | `fine.underReview`            |
| AUD-FINE-004 | aprobar multa                 | `fine.approved`               |
| AUD-FINE-005 | rechazar multa                | `fine.rejected`               |
| AUD-FINE-006 | emitir multa                  | `fine.issued`                 |
| AUD-FINE-007 | disputar multa                | `fine.disputed`               |
| AUD-FINE-008 | aceptar reclamo               | `fine.appealAccepted`         |
| AUD-FINE-009 | rechazar reclamo              | `fine.appealRejected`         |
| AUD-FINE-010 | condonar multa                | `fine.waived`                 |
| AUD-FINE-011 | cancelar multa                | `fine.cancelled`              |
| AUD-FINE-012 | reversar multa                | `fine.reversed`               |
| AUD-FINE-013 | archivar multa                | `fine.archived`               |
| AUD-CHG-001  | generar cargo                 | `fine.chargeGenerated`        |
| AUD-CHG-002  | fallo cargo                   | `fine.chargeGenerationFailed` |
| AUD-EV-001   | agregar evidencia             | `fineEvidence.added`          |
| AUD-EV-002   | archivar evidencia            | `fineEvidence.archived`       |
| AUD-EV-003   | descargar evidencia           | `fineEvidence.downloaded`     |
| AUD-APP-001  | presentar reclamo             | `fineAppeal.submitted`        |
| AUD-APP-002  | aceptar reclamo               | `fineAppeal.accepted`         |
| AUD-APP-003  | rechazar reclamo              | `fineAppeal.rejected`         |
| AUD-APP-004  | cancelar reclamo              | `fineAppeal.cancelled`        |
| AUD-SEC-001  | metadata sin payload completo | pasa                          |
| AUD-SEC-002  | metadata sin tokens/secrets   | pasa                          |

---

# 28. Pruebas de observabilidad

| ID           | Caso                                  | Resultado esperado |
| ------------ | ------------------------------------- | ------------------ |
| OBS-FINE-001 | fineConcept.created log               | generado           |
| OBS-FINE-002 | fine.created log                      | generado           |
| OBS-FINE-003 | fine.approved log                     | generado           |
| OBS-FINE-004 | fine.issued log                       | generado           |
| OBS-FINE-005 | fine.chargeGenerated log              | generado           |
| OBS-FINE-006 | fine.chargeGenerationFailed log       | generado           |
| OBS-FINE-007 | fineEvidence.downloaded log           | generado           |
| OBS-FINE-008 | logs sin tokens                       | correcto           |
| OBS-FINE-009 | logs sin evidencia completa           | correcto           |
| OBS-FINE-010 | logs sin datos personales extensos    | correcto           |
| OBS-FINE-011 | métricas fines_created_total          | incrementa         |
| OBS-FINE-012 | métricas fines_issued_total           | incrementa         |
| OBS-FINE-013 | métricas fines_charge_generated_total | incrementa         |
| OBS-FINE-014 | métricas fine_appeals_submitted_total | incrementa         |
| OBS-FINE-015 | métricas no usan tenantId             | correcto           |
| OBS-FINE-016 | métricas no usan fineId               | correcto           |
| OBS-FINE-017 | métricas no usan propertyUnitId       | correcto           |
| OBS-FINE-018 | métricas no usan userId/personId      | correcto           |

---

# 29. Pruebas OpenAPI

| ID            | Caso                                           | Resultado esperado |
| ------------- | ---------------------------------------------- | ------------------ |
| OAPI-FINE-001 | Fine Concepts documentado                      | pasa               |
| OAPI-FINE-002 | Fines admin documentado                        | pasa               |
| OAPI-FINE-003 | Fine Evidence documentado                      | pasa               |
| OAPI-FINE-004 | Fine Appeals admin documentado                 | pasa               |
| OAPI-FINE-005 | My Fines documentado                           | pasa               |
| OAPI-FINE-006 | My Fine Appeals documentado                    | pasa               |
| OAPI-FINE-007 | permisos documentados                          | pasa               |
| OAPI-FINE-008 | errores documentados                           | pasa               |
| OAPI-FINE-009 | money como string                              | pasa               |
| OAPI-FINE-010 | no endpoint público de multas                  | pasa               |
| OAPI-FINE-011 | no endpoint público de evidencia               | pasa               |
| OAPI-FINE-012 | no endpoint de pagos desde multas              | pasa               |
| OAPI-FINE-013 | no endpoint de estados de cuenta desde multas  | pasa               |
| OAPI-FINE-014 | extensiones x-tenant-scope                     | pasa               |
| OAPI-FINE-015 | extensiones x-own-resource                     | pasa               |
| OAPI-FINE-016 | extensiones x-evidence-protected               | pasa               |
| OAPI-FINE-017 | extensiones x-idempotency-required para charge | pasa               |

---

# 30. Pruebas de seguridad

## 30.1. No cross-tenant

```text id="u3bw51"
SEC-MT-001 a SEC-MT-013
```

Debe garantizar:

* no conceptos de otro tenant;
* no multas de otro tenant;
* no evidencias de otro tenant;
* no reclamos de otro tenant;
* no unidades de otro tenant;
* no responsables de otro tenant;
* no conceptos financieros de otro tenant;
* no cargos de otro tenant.

---

## 30.2. No acceso a multa ajena

```text id="ozqmo0"
SEC-OWN-001: propietario no ve multa de unidad ajena.
SEC-OWN-002: residente no ve multa de unidad ajena.
SEC-OWN-003: usuario sin relación activa no ve multa.
SEC-OWN-004: usuario no reclama multa ajena.
SEC-OWN-005: usuario no ve reclamo ajeno.
SEC-OWN-006: usuario no ve evidencia de multa ajena.
```

---

## 30.3. No exposición de evidencia

```text id="q48pun"
SEC-EV-001: no fileUrl privada en listados.
SEC-EV-002: no descarga sin permiso.
SEC-EV-003: no descarga cross-tenant.
SEC-EV-004: no evidencia ajena desde /me.
SEC-EV-005: no URLs permanentes públicas.
SEC-EV-006: no tokens en metadata.
SEC-EV-007: no evidencia completa en logs.
```

---

## 30.4. No exposición pública WordPress

```text id="gl0kyw"
SEC-PUB-001: no endpoint público de multas.
SEC-PUB-002: no endpoint público de sanciones.
SEC-PUB-003: no endpoint público de evidencia.
SEC-PUB-004: no endpoint público de reclamos.
SEC-PUB-005: no endpoint público de descarga.
SEC-PUB-006: no endpoint público de pagos de multas.
SEC-PUB-007: OpenAPI no documenta endpoints públicos.
```

---

## 30.5. No manipulación financiera

```text id="fbdrge"
SEC-FIN-001: multas no confirman pagos.
SEC-FIN-002: multas no asignan pagos.
SEC-FIN-003: multas no modifican comprobantes.
SEC-FIN-004: multas no modifican estados de cuenta.
SEC-FIN-005: condonación no borra cargo.
SEC-FIN-006: reverso no modifica pagos.
SEC-FIN-007: no float money.
SEC-FIN-008: cargo idempotente.
```

---

# 31. Smoke tests

Smoke tests post-deploy:

| ID             | Caso                                 | Resultado esperado |
| -------------- | ------------------------------------ | ------------------ |
| SMOKE-FINE-001 | `GET /api/v1/health`                 | 200                |
| SMOKE-FINE-002 | listar conceptos de multa            | 200                |
| SMOKE-FINE-003 | crear concepto demo                  | 201                |
| SMOKE-FINE-004 | crear multa demo                     | 201                |
| SMOKE-FINE-005 | adjuntar evidencia textual           | 201                |
| SMOKE-FINE-006 | pasar multa a revisión               | 200                |
| SMOKE-FINE-007 | aprobar multa                        | 200                |
| SMOKE-FINE-008 | emitir multa                         | 200                |
| SMOKE-FINE-009 | generar cargo repetido               | no duplica         |
| SMOKE-FINE-010 | listar mis multas                    | 200                |
| SMOKE-FINE-011 | presentar reclamo propio             | 201                |
| SMOKE-FINE-012 | resolver reclamo                     | 200                |
| SMOKE-FINE-013 | endpoint admin sin token             | 401                |
| SMOKE-FINE-014 | error incluye traceId                | pasa               |
| SMOKE-FINE-015 | endpoint público de multas no existe | 404                |

---

# 32. Organización de archivos de prueba

```text id="o812oh"
apps/api/src/modules/fines/tests/
├── unit/
│   ├── fine-concept-code.vo.spec.ts
│   ├── fine-concept-status.vo.spec.ts
│   ├── fine-category.vo.spec.ts
│   ├── fine-status.vo.spec.ts
│   ├── fine-severity.vo.spec.ts
│   ├── fine-money.vo.spec.ts
│   ├── fine-title.vo.spec.ts
│   ├── fine-description.vo.spec.ts
│   ├── fine-reason.vo.spec.ts
│   ├── fine-evidence-type.vo.spec.ts
│   ├── fine-evidence-status.vo.spec.ts
│   ├── fine-appeal-status.vo.spec.ts
│   ├── fine-payment-status-snapshot.vo.spec.ts
│   ├── fine-concept.entity.spec.ts
│   ├── fine.entity.spec.ts
│   ├── fine-evidence.entity.spec.ts
│   ├── fine-appeal.entity.spec.ts
│   └── fine-status-history.entity.spec.ts
│
├── application/
│   ├── fine-concept.service.spec.ts
│   ├── fine.service.spec.ts
│   ├── fine-state-machine.service.spec.ts
│   ├── fine-policy.service.spec.ts
│   ├── fine-charge.service.spec.ts
│   ├── fine-ownership.service.spec.ts
│   ├── fine-evidence.service.spec.ts
│   ├── fine-evidence-access.service.spec.ts
│   ├── fine-appeal.service.spec.ts
│   ├── fine-money.service.spec.ts
│   └── fine-audit.service.spec.ts
│
├── use-cases/
│   ├── create-fine-concept.use-case.spec.ts
│   ├── list-fine-concepts.use-case.spec.ts
│   ├── get-fine-concept.use-case.spec.ts
│   ├── update-fine-concept.use-case.spec.ts
│   ├── create-fine.use-case.spec.ts
│   ├── list-fines.use-case.spec.ts
│   ├── get-fine.use-case.spec.ts
│   ├── update-fine.use-case.spec.ts
│   ├── submit-fine-review.use-case.spec.ts
│   ├── approve-fine.use-case.spec.ts
│   ├── reject-fine.use-case.spec.ts
│   ├── issue-fine.use-case.spec.ts
│   ├── cancel-fine.use-case.spec.ts
│   ├── waive-fine.use-case.spec.ts
│   ├── reverse-fine.use-case.spec.ts
│   ├── generate-fine-charge.use-case.spec.ts
│   ├── add-fine-evidence.use-case.spec.ts
│   ├── download-fine-evidence.use-case.spec.ts
│   ├── submit-own-fine-appeal.use-case.spec.ts
│   ├── accept-fine-appeal.use-case.spec.ts
│   ├── reject-fine-appeal.use-case.spec.ts
│   ├── list-own-fines.use-case.spec.ts
│   └── get-own-fine.use-case.spec.ts
│
├── integration/
│   ├── prisma-fine-concept.repository.spec.ts
│   ├── prisma-fine.repository.spec.ts
│   ├── prisma-fine-evidence.repository.spec.ts
│   ├── prisma-fine-appeal.repository.spec.ts
│   └── prisma-fine-status-history.repository.spec.ts
│
├── api/
│   ├── fine-concepts.api.spec.ts
│   ├── fines-admin.api.spec.ts
│   ├── fine-evidence.api.spec.ts
│   ├── fine-appeals-admin.api.spec.ts
│   ├── my-fines.api.spec.ts
│   └── my-fine-appeals.api.spec.ts
│
├── authorization/
│   ├── fine-concepts.authorization.spec.ts
│   ├── fines-admin.authorization.spec.ts
│   ├── fine-evidence.authorization.spec.ts
│   ├── fine-appeals.authorization.spec.ts
│   └── fines-own.authorization.spec.ts
│
├── multitenancy/
│   └── fines.multitenancy.spec.ts
│
├── own-resource/
│   └── fines.own-resource.spec.ts
│
├── financial/
│   └── fines-financial-regression.spec.ts
│
├── evidence/
│   └── fine-evidence-security.spec.ts
│
├── appeals/
│   └── fine-appeals.workflow.spec.ts
│
├── security/
│   ├── fines-no-cross-tenant.security.spec.ts
│   ├── fines-no-public-wordpress.security.spec.ts
│   ├── fines-no-financial-mutation.security.spec.ts
│   └── fines-no-private-data-exposure.security.spec.ts
│
├── audit/
│   └── fines-audit.integration.spec.ts
│
├── observability/
│   └── fines-observability.spec.ts
│
└── openapi/
    └── fines.openapi.spec.ts
```

---

# 33. Comandos esperados

Comandos específicos sugeridos:

```bash id="rk9pvr"
npm run test:fines
npm run test:fines:unit
npm run test:fines:application
npm run test:fines:integration
npm run test:fines:api
npm run test:fines:authorization
npm run test:fines:multitenancy
npm run test:fines:own-resource
npm run test:fines:financial
npm run test:fines:evidence
npm run test:fines:appeals
npm run test:fines:security
npm run test:fines:audit
npm run test:fines:openapi
```

Comandos generales:

```bash id="z8ja2u"
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

# 34. Requisitos para CI

En pull request deben correr como mínimo:

```text id="z43ubq"
lint
typecheck
unit tests
DTO validation tests
state machine tests
application tests
repository integration tests críticos
API tests críticos
authorization tests
own-resource tests
multitenancy tests
financial regression tests
evidence security tests
appeal workflow tests
audit integration tests
OpenAPI validation
build
```

Antes de producción:

```text id="olnuvg"
full fines test suite
full security tests
full financial regression tests
full evidence access tests
full own-resource tests
smoke tests staging
OpenAPI validation
```

---

# 35. Gates de calidad

No se permite merge si falla:

* tenant isolation;
* own-resource authorization;
* evidence access control;
* state machine validation;
* reason required validation;
* evidence required validation;
* appeal deadline validation;
* duplicate open appeal validation;
* money as Decimal/string;
* no float money;
* idempotent charge generation;
* no payment processing from fines;
* no account statement mutation from fines;
* no public WordPress exposure;
* audit events;
* OpenAPI validation;
* CI build.

---

# 36. Matriz de trazabilidad

| Requisito                               | Pruebas asociadas               |
| --------------------------------------- | ------------------------------- |
| FR-001 Gestionar conceptos de multa     | API-FC, UC-FC, INT-FC           |
| FR-002 Configurar monto base            | DTO-FC, SRV-FC, FIN-FINE        |
| FR-003 Asociar concepto financiero      | SRV-FC, API-FC, MT-FINE         |
| FR-004 Registrar multa                  | API-FINE-CREATE, UC-FINE-001    |
| FR-005 Asociar responsable              | SRV-FINE, MT-FINE               |
| FR-006 Adjuntar evidencia               | API-EV, UC-EV                   |
| FR-007 Revisar multa                    | API-FINE-REV, ST-FINE           |
| FR-008 Aprobar multa                    | API-FINE-APPROVE, SRV-POL       |
| FR-009 Rechazar multa                   | API-FINE-REJECT, DTO-ACT        |
| FR-010 Emitir multa                     | API-FINE-ISSUE, FIN-FINE        |
| FR-011 Generar cargo                    | SRV-CHG, API-FINE-CHG, FIN-FINE |
| FR-012 Cancelar multa                   | API-FINE-CAN                    |
| FR-013 Condonar multa                   | API-FINE-WAIVE                  |
| FR-014 Reversar multa                   | API-FINE-REVRS                  |
| FR-015 Presentar reclamo                | API-ME-APP-SUB, APP-FINE        |
| FR-016 Resolver reclamo                 | API-APP-ACC, API-APP-REJ        |
| FR-017 Consultar multas administrativas | API-FINE-LIST                   |
| FR-018 Consultar multas propias         | API-ME-FINE                     |
| FR-019 Consultar evidencias             | API-EV, EV-SEC                  |
| FR-020 Auditar operaciones              | AUD                             |
| FR-021 Mantener historial de estados    | ST-FINE, INT-HIST               |
| FR-022 Proteger datos personales        | SEC-OWN, API-ME-FINE            |
| FR-023 Proteger datos financieros       | FIN-FINE, SEC-FIN               |
| FR-024 Documentar API                   | OAPI-FINE                       |

---

# 37. Riesgos cubiertos

| Riesgo                              | Pruebas                 |
| ----------------------------------- | ----------------------- |
| Multa cross-tenant                  | MT-FINE, SEC-MT         |
| Multa sobre unidad ajena            | OWN-FINE, SRV-OWN       |
| Responsable de otro tenant          | SRV-FINE, MT-FINE       |
| Exposición de evidencias            | EV-SEC, API-EV          |
| Cargo duplicado                     | SRV-CHG, FIN-FINE       |
| Uso de float                        | UT-FINE-MONEY, FIN-FINE |
| Estado inválido                     | ST-FINE, API-FINE-ACT   |
| Rechazo/cancelación sin razón       | DTO-ACT, ST-FINE        |
| Reclamo fuera de plazo              | APP-FINE, SRV-POL       |
| Reclamo duplicado                   | APP-FINE                |
| Reverso no auditado                 | AUD-FINE                |
| Modificación silenciosa de emitidas | API-FINE-UPD            |
| WordPress expone multas             | SEC-PUB, OAPI-FINE      |
| Logs con datos sensibles            | OBS-FINE                |

---

# 38. Criterios de salida

El módulo `011-fines-sanctions` puede considerarse probado si:

* unit tests pasan;
* entity tests pasan;
* state machine tests pasan;
* DTO validation tests pasan;
* application service tests pasan;
* use case tests pasan;
* repository integration tests pasan;
* API tests pasan;
* authorization tests pasan;
* own-resource tests pasan;
* multitenancy tests pasan;
* financial regression tests pasan;
* evidence security tests pasan;
* appeal workflow tests pasan;
* audit integration tests pasan;
* observability tests pasan;
* OpenAPI tests pasan;
* smoke tests pasan;
* no hay datos reales en fixtures;
* no hay secretos en pruebas;
* no hay exposición pública de multas;
* no hay exposición indebida de evidencias;
* no hay cargos duplicados;
* no hay pagos procesados desde multas;
* no hay modificación directa de estados de cuenta;
* no hay eliminación física de historial;
* CI pasa.

---

# 39. Pendientes controlados

Pendientes aceptados para esta spec:

```text id="ypfy52"
firma electrónica diferida
PDF formal diferido
notificaciones automáticas diferidas
integración con cámaras diferida
IA/OCR de evidencias diferida
multas automáticas diferidas
reincidencia automática diferida
escalamiento a comité diferido
audiencias diferidas
votaciones de sanciones diferidas
publicación pública de sanciones diferida
pagos online de multas diferidos
conciliación bancaria diferida
intereses automáticos diferidos
restricción automática de reservas diferida
```

Estos pendientes no bloquean `011-fines-sanctions`.

---

## 40. Decisión final del test plan

El módulo `011-fines-sanctions` deberá probarse con pruebas unitarias, pruebas de dominio, validación de DTOs, pruebas de máquina de estados, pruebas de servicios, pruebas de casos de uso, pruebas de repositorio, pruebas API, pruebas de autorización, pruebas de recursos propios, pruebas multitenant, pruebas financieras, pruebas de evidencias, pruebas de reclamos, pruebas de auditoría, pruebas OpenAPI y smoke tests.

Las pruebas se enfocarán especialmente en:

```text id="q61f0v"
- impedir multas cross-tenant;
- impedir multas sobre unidades ajenas;
- impedir responsables de otro tenant;
- proteger evidencias;
- controlar transiciones de estado;
- exigir razones en acciones críticas;
- exigir evidencia cuando el concepto lo requiera;
- validar reclamos propios;
- validar plazo de reclamo;
- impedir reclamos duplicados abiertos;
- generar cargos de forma idempotente;
- no procesar pagos desde multas;
- no modificar estados de cuenta desde multas;
- garantizar dinero Decimal/string;
- impedir exposición pública hacia WordPress;
- auditar operaciones críticas;
- validar OpenAPI y CI.
```

Ninguna implementación debe aceptarse si permite multas cross-tenant, asigna multas a unidades ajenas, expone multas o evidencias a usuarios no autorizados, expone multas a WordPress, genera cargos duplicados, usa float para dinero, procesa pagos directamente, modifica estados de cuenta directamente, elimina historial, omite auditoría o permite transiciones de estado no autorizadas.
