# Spec 011 — Fines and Sanctions

## 1. Información del documento

| Campo           | Valor                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                             |
| Spec ID         | 011                                                                                                                                                       |
| Módulo          | Fines and Sanctions                                                                                                                                       |
| Documento       | Functional Specification                                                                                                                                  |
| Ruta            | `docs/specs/011-fines-sanctions/spec.md`                                                                                                                  |
| Versión         | 0.1                                                                                                                                                       |
| Estado          | Borrador inicial                                                                                                                                          |
| Fecha           | 2026-07-19                                                                                                                                                |
| Prioridad       | Alta                                                                                                                                                      |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit`, `008-basic-reports` |
| Relacionado con | Multas, sanciones, reglamento interno, cargos, pagos, estados de cuenta, auditoría, residentes, propietarios, unidades, evidencias, reclamos              |

---

## 2. Nombre de la funcionalidad

```text id="y39rfv"
Fines and Sanctions
```

---

## 3. Propósito

El módulo `011-fines-sanctions` define la gestión de multas y sanciones dentro de RESIDENT Core.

El objetivo es permitir que cada conjunto residencial pueda registrar infracciones, configurar conceptos de multa, iniciar procesos sancionatorios, adjuntar evidencias, aprobar o rechazar multas, generar cargos financieros asociados, gestionar reclamos básicos y mantener trazabilidad completa de cada decisión.

Regla central:

```text id="aor8fo"
Toda multa o sanción debe pertenecer a un tenant, estar asociada a una unidad habitacional o persona responsable, tener un motivo documentado, un estado controlado, una trazabilidad auditable y una relación financiera explícita cuando genere cobro.
```

---

## 4. Objetivo funcional

Permitir la administración básica de multas y sanciones en RESIDENT Core, incluyendo:

* definición de tipos o conceptos de multa;
* configuración de montos base;
* registro de infracciones;
* asociación de infracciones a unidad habitacional;
* asociación opcional a persona responsable;
* adjunto de evidencias;
* revisión administrativa;
* aprobación de multa;
* rechazo de multa;
* emisión de multa;
* generación opcional de cargo financiero;
* cancelación o anulación controlada;
* reverso administrativo controlado;
* condonación o exoneración;
* reclamo básico por parte del residente/propietario;
* resolución de reclamo;
* consulta administrativa;
* consulta propia;
* auditoría de eventos relevantes;
* preparación para reportes de morosidad, estados de cuenta y notificaciones futuras.

---

## 5. Alcance

### 5.1. Incluido en esta spec

Esta spec incluye:

```text id="gsd95j"
1. Gestión de conceptos de multa.
2. Configuración de montos base de multas.
3. Registro de infracciones.
4. Asociación de infracciones a unidades habitacionales.
5. Asociación opcional a persona responsable.
6. Adjuntos o referencias de evidencia.
7. Flujo de revisión administrativa.
8. Aprobación de multas.
9. Rechazo de multas.
10. Emisión de multas.
11. Generación opcional de cargo financiero.
12. Consulta administrativa de multas.
13. Consulta propia de multas.
14. Reclamo básico de multa.
15. Resolución administrativa de reclamo.
16. Cancelación de multa antes de emisión.
17. Reverso o anulación controlada de multa emitida.
18. Condonación o exoneración controlada.
19. Historial de estados.
20. Auditoría de decisiones.
21. API REST.
22. Pruebas funcionales, financieras, multitenant, autorización y seguridad.
```

---

### 5.2. No incluido en esta spec

Queda fuera del MVP:

```text id="pczmsy"
- Gestión legal avanzada de procesos sancionatorios.
- Firma electrónica de actas.
- Generación automática de documentos PDF formales.
- Notificaciones automáticas por WhatsApp.
- Notificaciones automáticas por email.
- Integración con cámaras de seguridad.
- Reconocimiento automático por IA.
- OCR de evidencias.
- Automatización de multas por sensores.
- Multas automáticas por mora financiera.
- Cálculo avanzado de reincidencia.
- Escalamiento automático a comité.
- Flujos complejos de apelación.
- Audiencias o comparecencias.
- Votación de sanciones en asamblea.
- Integración con módulos legales externos.
- Publicación pública de infractores.
- Exposición de multas en WordPress público.
- Pagos directos desde el módulo de multas.
- Conciliación bancaria.
- Intereses automáticos por multa vencida.
- Sanciones no monetarias avanzadas.
- Restricción automática de reservas por multas pendientes.
```

Estos temas podrán abordarse en specs futuras.

---

## 6. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="jshww7"
Fines and Sanctions
```

Se relaciona con:

```text id="a67z6r"
Tenant Management
Identity and Access
Residents and Properties
Financial Management
Payments and Reconciliation
Account Statements
Reservations and Rentals
Audit and Compliance
Reporting and Analytics
Communications and Notifications
```

Relación conceptual:

```text id="qgjqp6"
Tenant
  └── Fine Concepts
        └── Sanction Cases
              ├── Property Unit
              ├── Responsible Person optional
              ├── Evidence
              ├── Review Workflow
              ├── Appeal/Dispute optional
              ├── Optional Charge
              └── Audit Trail
```

---

## 7. Principios

### 7.1. Tenant isolation obligatorio

Toda multa, concepto de multa, evidencia, reclamo e historial pertenece a un único tenant.

Regla:

```text id="jdvfzy"
fine.tenantId == fineConcept.tenantId == currentTenant.id
```

---

### 7.2. Unidad habitacional como eje financiero

Toda multa que genere cobro debe estar asociada a una unidad habitacional.

Regla:

```text id="tjfrns"
Toda multa monetaria debe asociarse a propertyUnitId para que pueda reflejarse en cargos, pagos y estado de cuenta.
```

---

### 7.3. Persona responsable opcional

Una multa puede asociarse opcionalmente a una persona responsable, pero el cobro financiero se imputa a la unidad.

Ejemplos:

```text id="ehzvbi"
propietario
residente
arrendatario
invitado identificado
ocupante registrado
```

---

### 7.4. Evidencia mínima

Una multa no debe aprobarse ni emitirse sin motivo documentado.

La evidencia puede ser:

```text id="ohw0f3"
texto descriptivo
fotografía
documento
referencia administrativa
acta
testimonio resumido
```

En MVP, puede aceptarse descripción obligatoria y evidencia adjunta opcional según configuración del tenant.

---

### 7.5. Estado controlado

Toda multa debe tener estado explícito y transiciones permitidas.

---

### 7.6. Finanzas desacopladas pero integrables

El módulo puede generar cargos asociados a multas, pero no procesa pagos.

Regla:

```text id="qfi4se"
Fines and Sanctions solicita generación de cargo; Payments gestiona pagos y comprobantes.
```

---

### 7.7. Trazabilidad obligatoria

Toda decisión relevante debe auditarse.

Incluye:

```text id="xc9p2q"
creación
actualización
revisión
aprobación
rechazo
emisión
generación de cargo
reclamo
resolución de reclamo
cancelación
reverso
condonación
archivo
```

---

### 7.8. No exposición pública

Las multas no deben exponerse en WordPress público.

Regla:

```text id="u1ypf5"
WordPress público no consulta multas, infracciones, sanciones, responsables, cargos ni evidencias.
```

---

### 7.9. Correcciones mediante reversos

Una multa emitida no debe eliminarse ni editarse silenciosamente si ya generó cargo.

Correcciones posteriores deben realizarse mediante:

```text id="hunqqu"
cancelación controlada
reverso
ajuste financiero
condonación
nota administrativa auditada
```

---

## 8. Actores

### 8.1. TenantAdmin

Administrador del conjunto.

Puede:

* crear conceptos de multa;
* actualizar conceptos;
* archivar conceptos;
* registrar multas;
* aprobar multas;
* rechazar multas;
* emitir multas;
* cancelar multas;
* resolver reclamos;
* consultar reportes;
* consultar auditoría.

---

### 8.2. SanctionManager

Rol operativo encargado de gestionar multas y sanciones.

Puede:

* registrar infracciones;
* revisar casos;
* adjuntar evidencias;
* aprobar o recomendar aprobación según permisos;
* rechazar casos;
* emitir multas;
* resolver reclamos si tiene permiso;
* consultar historial.

---

### 8.3. Treasurer

Responsable financiero.

Puede:

* consultar multas emitidas;
* consultar cargos generados por multas;
* verificar impacto financiero;
* no necesariamente aprobar sanciones salvo permiso explícito.

---

### 8.4. PropertyOwner

Propietario asociado a una unidad.

Puede:

* consultar multas asociadas a sus unidades;
* consultar estado de multas;
* presentar reclamo básico;
* consultar resolución de reclamo;
* consultar cargo asociado si tiene permiso financiero propio.

---

### 8.5. Resident

Residente asociado a una unidad.

Puede:

* consultar multas visibles para su unidad si la política del tenant lo permite;
* presentar reclamo si está autorizado;
* consultar resolución del reclamo.

---

### 8.6. PlatformAdmin

Administrador de plataforma.

Puede:

* apoyar soporte técnico;
* consultar datos estrictamente necesarios bajo permisos platform;
* no debe intervenir en decisiones sancionatorias ordinarias salvo soporte excepcional y auditado.

---

### 8.7. Visitante público

Usuario no autenticado desde WordPress.

No puede:

* ver multas;
* ver sanciones;
* ver infracciones;
* ver responsables;
* ver evidencias;
* ver cargos;
* ver reclamos.

---

## 9. Definiciones

### 9.1. Fine Concept

Concepto o tipo de multa definido por el tenant.

Ejemplos:

```text id="sjow4a"
ruido excesivo
mal uso de área comunal
mascota sin control
parqueo indebido
daño a bien común
incumplimiento de reglamento
basura fuera de horario
alteración de convivencia
```

---

### 9.2. Sanction Case

Caso sancionatorio o registro de infracción que puede terminar en multa emitida, rechazo, cancelación o condonación.

---

### 9.3. Fine

En esta spec, se usa `Fine` como entidad principal de multa/sanción. Puede representar tanto el caso sancionatorio como la multa monetaria resultante.

---

### 9.4. Evidence

Evidencia asociada a una multa o infracción.

Puede ser archivo, imagen, descripción, referencia o documento.

---

### 9.5. Appeal / Dispute

Reclamo o impugnación básica presentada por un propietario o residente autorizado.

---

### 9.6. Waiver

Condonación o exoneración administrativa de una multa.

---

### 9.7. Reversal

Anulación o reverso controlado de una multa emitida, usualmente con impacto financiero posterior.

---

## 10. Supuestos

1. El tenant ya existe.
2. Usuarios, roles y permisos existen.
3. Unidades habitacionales existen.
4. Personas, propietarios y residentes existen.
5. El vínculo usuario-persona-unidad está disponible desde `003-residents-properties`.
6. Los conceptos financieros existen desde `004-dues-fees`.
7. Los cargos financieros existen desde `004-dues-fees`.
8. Los pagos existen desde `005-payments`.
9. Los estados de cuenta existen desde `006-account-statements`.
10. La auditoría existe desde `007-audit`.
11. Los reportes básicos existen desde `008-basic-reports`.
12. Toda multa pertenece a un tenant.
13. Toda multa monetaria debe asociarse a una unidad.
14. Una multa puede asociarse opcionalmente a una persona.
15. El MVP no procesa pagos desde multas.
16. El MVP no publica multas en WordPress.
17. El MVP no implementa flujo legal avanzado.
18. El MVP no implementa notificaciones automáticas.
19. La moneda por defecto es `USD`.
20. Las fechas se almacenan en UTC.
21. La zona horaria por defecto del tenant es `America/Guayaquil`.

---

## 11. Entidades principales

### 11.1. FineConcept

Representa un concepto o tipo de multa configurable por tenant.

Campos conceptuales:

```text id="wllg4q"
FineConcept
├── id
├── tenantId
├── code
├── name
├── description
├── category
├── defaultAmount
├── currency
├── chargeConceptId
├── requiresEvidence
├── allowsAppeal
├── appealDeadlineDays
├── status
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.2. Fine

Representa una multa o caso sancionatorio.

Campos conceptuales:

```text id="zu6vxk"
Fine
├── id
├── tenantId
├── fineConceptId
├── propertyUnitId
├── responsiblePersonId nullable
├── reportedBy nullable
├── reviewedBy nullable
├── approvedBy nullable
├── rejectedBy nullable
├── cancelledBy nullable
├── waivedBy nullable
├── reversedBy nullable
├── title
├── description
├── occurredAt
├── reportedAt
├── status
├── severity
├── amount
├── currency
├── chargeId nullable
├── paymentStatusSnapshot
├── dueDate nullable
├── reviewNotes nullable
├── rejectionReason nullable
├── cancellationReason nullable
├── waiverReason nullable
├── reversalReason nullable
├── issuedAt nullable
├── approvedAt nullable
├── rejectedAt nullable
├── cancelledAt nullable
├── waivedAt nullable
├── reversedAt nullable
├── metadata nullable
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.3. FineEvidence

Representa evidencia asociada a una multa.

Campos conceptuales:

```text id="nyqt5n"
FineEvidence
├── id
├── tenantId
├── fineId
├── evidenceType
├── title
├── description
├── fileUrl nullable
├── fileName nullable
├── mimeType nullable
├── fileSizeBytes nullable
├── uploadedBy nullable
├── uploadedAt
├── status
├── metadata nullable
└── archivedAt nullable
```

---

### 11.4. FineAppeal

Representa un reclamo básico o impugnación de una multa.

Campos conceptuales:

```text id="qo4vn3"
FineAppeal
├── id
├── tenantId
├── fineId
├── submittedBy
├── submittedAt
├── reason
├── status
├── resolvedBy nullable
├── resolvedAt nullable
├── resolution nullable
├── resolutionNotes nullable
├── createdAt
├── updatedAt
└── archivedAt
```

---

### 11.5. FineStatusHistory

Historial funcional de cambios de estado de la multa.

Campos conceptuales:

```text id="fsg45n"
FineStatusHistory
├── id
├── tenantId
├── fineId
├── fromStatus nullable
├── toStatus
├── actorUserId nullable
├── reason nullable
├── occurredAt
└── metadata nullable
```

---

## 12. Estados

### 12.1. FineConceptStatus

```text id="agfae2"
active
inactive
archived
```

---

### 12.2. FineStatus

```text id="za2iov"
draft
reported
underReview
approved
rejected
issued
disputed
appealAccepted
appealRejected
waived
cancelled
reversed
archived
```

---

### 12.3. FineSeverity

```text id="zffv4h"
low
medium
high
critical
```

---

### 12.4. FineEvidenceType

```text id="jmx3l0"
text
image
document
video
reference
other
```

---

### 12.5. FineEvidenceStatus

```text id="immunx"
active
rejected
archived
```

---

### 12.6. FineAppealStatus

```text id="vcfou3"
submitted
underReview
accepted
rejected
cancelled
archived
```

---

### 12.7. FinePaymentStatusSnapshot

```text id="xzkhjz"
notRequired
pendingCharge
chargeGenerated
pendingPayment
paid
partiallyPaid
waived
cancelled
reversed
```

Este campo es informativo. La fuente financiera real sigue siendo:

```text id="addduo"
charges
payments
payment_allocations
account_statements
unit_balances
```

---

## 13. Transiciones de estado

### 13.1. Flujo básico

```text id="r1vcva"
draft -> reported -> underReview -> approved -> issued
```

---

### 13.2. Rechazo

```text id="e046x8"
reported -> rejected
underReview -> rejected
```

---

### 13.3. Cancelación antes de emisión

```text id="pl7upr"
draft -> cancelled
reported -> cancelled
underReview -> cancelled
approved -> cancelled
```

---

### 13.4. Emisión

```text id="v5cq97"
approved -> issued
```

---

### 13.5. Reclamo

```text id="mkyxso"
issued -> disputed
```

---

### 13.6. Resolución de reclamo aceptado

```text id="s0jgm4"
disputed -> appealAccepted -> waived
```

o, si corresponde:

```text id="wbeix9"
disputed -> appealAccepted -> reversed
```

---

### 13.7. Resolución de reclamo rechazado

```text id="ti7tqr"
disputed -> appealRejected -> issued
```

---

### 13.8. Condonación administrativa

```text id="gvmmkk"
issued -> waived
disputed -> waived
```

---

### 13.9. Reverso

```text id="ymc6r3"
issued -> reversed
disputed -> reversed
```

---

### 13.10. Archivo

```text id="m4j3pn"
rejected -> archived
cancelled -> archived
waived -> archived
reversed -> archived
issued -> archived
```

El archivo no elimina historial ni impacto financiero existente.

---

## 14. Reglas de negocio

### BR-001 — Toda multa pertenece a un tenant

```text id="fb9f8q"
fine.tenantId = currentTenant.id
```

---

### BR-002 — Todo concepto de multa pertenece a un tenant

```text id="dy6f45"
fineConcept.tenantId = currentTenant.id
```

---

### BR-003 — Código de concepto único por tenant

No puede existir más de un concepto activo con el mismo `code` dentro del mismo tenant.

---

### BR-004 — Toda multa monetaria debe tener unidad

Una multa con `amount > 0` debe tener `propertyUnitId`.

---

### BR-005 — La unidad debe pertenecer al tenant

No se puede registrar multa para una unidad de otro tenant.

---

### BR-006 — La persona responsable debe pertenecer al tenant

Si se define `responsiblePersonId`, debe estar vinculada al tenant.

---

### BR-007 — El concepto de multa debe estar activo

No se puede crear multa nueva con concepto inactivo o archivado.

---

### BR-008 — El monto debe ser Decimal

```text id="ykypsv"
amount debe ser Decimal y exponerse por API como string.
```

---

### BR-009 — No usar float/double

Prohibido manejar montos de multas con `float` o `double`.

---

### BR-010 — La descripción es obligatoria

Toda multa debe tener una descripción clara del motivo.

---

### BR-011 — Evidencia obligatoria si el concepto lo exige

Si `FineConcept.requiresEvidence = true`, debe existir al menos una evidencia activa antes de aprobar o emitir.

---

### BR-012 — Aprobación requiere revisión

Una multa no debe pasar a `approved` si está incompleta o sin datos mínimos.

---

### BR-013 — Rechazo requiere razón

Toda multa rechazada debe tener `rejectionReason`.

---

### BR-014 — Cancelación administrativa requiere razón

Toda multa cancelada debe registrar `cancellationReason`.

---

### BR-015 — Condonación requiere razón

Toda multa condonada debe registrar `waiverReason`.

---

### BR-016 — Reverso requiere razón

Toda multa reversada debe registrar `reversalReason`.

---

### BR-017 — Reclamo requiere motivo

Toda apelación o reclamo debe tener `reason`.

---

### BR-018 — Reclamo solo sobre multa emitida

En MVP, solo se puede reclamar una multa en estado `issued`.

---

### BR-019 — Reclamo dentro de plazo

Si el concepto define `appealDeadlineDays`, el reclamo debe presentarse dentro de ese plazo desde `issuedAt`.

---

### BR-020 — Multa emitida puede generar cargo

Al emitir una multa monetaria, el sistema puede generar un cargo financiero asociado.

---

### BR-021 — Cargo debe usar concepto financiero válido

Si se genera cargo, debe existir `chargeConceptId` asociado al concepto de multa y pertenecer al tenant.

---

### BR-022 — Cargo generado debe pertenecer a la misma unidad

```text id="m9w06u"
charge.tenantId = fine.tenantId
charge.propertyUnitId = fine.propertyUnitId
```

---

### BR-023 — Generación de cargo idempotente

Una multa no debe generar más de un cargo activo por el mismo evento sancionatorio.

---

### BR-024 — El módulo no procesa pagos

Los pagos se gestionan en `005-payments`.

---

### BR-025 — El módulo no modifica estados de cuenta directamente

El estado de cuenta se reconstruye desde cargos, pagos y asignaciones.

---

### BR-026 — Cancelar multa emitida no elimina cargo automáticamente

Si una multa ya generó cargo, cualquier reverso financiero debe realizarse mediante flujo financiero controlado.

---

### BR-027 — No eliminación física

Multas, evidencias, reclamos e historial no deben eliminarse físicamente en operación ordinaria.

---

### BR-028 — Evidencias privadas

Las evidencias no deben exponerse públicamente ni a usuarios no autorizados.

---

### BR-029 — Consulta propia limitada

Un propietario o residente solo puede consultar multas asociadas a sus unidades autorizadas.

---

### BR-030 — WordPress no accede a multas

No debe existir endpoint público WordPress para multas o sanciones en esta spec.

---

### BR-031 — Auditoría obligatoria

Eventos mínimos:

```text id="wqysaa"
fineConcept.created
fineConcept.updated
fineConcept.archived
fine.created
fine.reported
fine.underReview
fine.approved
fine.rejected
fine.issued
fine.disputed
fine.appealAccepted
fine.appealRejected
fine.waived
fine.cancelled
fine.reversed
fine.archived
fine.chargeGenerated
fine.chargeGenerationFailed
fineEvidence.added
fineEvidence.archived
fineAppeal.submitted
fineAppeal.resolved
```

---

## 15. Historias de usuario

### US-001 — Crear concepto de multa

Como TenantAdmin, quiero crear conceptos de multa para estandarizar sanciones dentro del conjunto.

#### Criterios de aceptación

* Requiere permiso.
* Valida código único.
* Valida nombre.
* Valida monto.
* Valida concepto financiero si aplica.
* Registra auditoría.

---

### US-002 — Registrar infracción

Como SanctionManager, quiero registrar una infracción asociada a una unidad habitacional.

#### Criterios de aceptación

* Requiere permiso.
* Valida tenant.
* Valida unidad.
* Valida concepto.
* Registra descripción.
* Registra fecha del hecho.
* Estado inicial correcto.
* Registra auditoría.

---

### US-003 — Adjuntar evidencia

Como SanctionManager, quiero adjuntar evidencia a una multa para sustentar el caso.

#### Criterios de aceptación

* Requiere permiso.
* Evidencia pertenece al tenant.
* Evidencia pertenece a la multa.
* No expone archivo públicamente.
* Registra auditoría.

---

### US-004 — Revisar multa

Como SanctionManager, quiero pasar una multa a revisión para validar si procede.

#### Criterios de aceptación

* Requiere permiso.
* Multa en estado válido.
* Crea historial.
* Registra auditoría.

---

### US-005 — Aprobar multa

Como TenantAdmin o SanctionManager autorizado, quiero aprobar una multa para que pueda ser emitida.

#### Criterios de aceptación

* Requiere permiso.
* Multa tiene datos mínimos.
* Evidencia existe si es obligatoria.
* Transición válida.
* Crea historial.
* Registra auditoría.

---

### US-006 — Rechazar multa

Como administrador autorizado, quiero rechazar una multa con una razón.

#### Criterios de aceptación

* Requiere permiso.
* Razón obligatoria.
* Transición válida.
* Crea historial.
* Registra auditoría.

---

### US-007 — Emitir multa

Como administrador autorizado, quiero emitir una multa aprobada para que quede formalmente registrada y, si aplica, genere cargo.

#### Criterios de aceptación

* Requiere permiso.
* Multa aprobada.
* Genera cargo si `amount > 0`.
* Cargo idempotente.
* Crea historial.
* Registra auditoría.

---

### US-008 — Consultar multas administrativas

Como administrador, quiero consultar multas del tenant con filtros.

#### Criterios de aceptación

* Requiere permiso.
* Filtra por estado, unidad, concepto, fechas.
* Pagina resultados.
* No mezcla tenants.

---

### US-009 — Consultar mis multas

Como propietario o residente autorizado, quiero consultar multas asociadas a mis unidades.

#### Criterios de aceptación

* Requiere autenticación.
* Requiere permiso own.
* Solo muestra unidades autorizadas.
* No muestra multas de terceros.
* No muestra evidencias restringidas salvo política.

---

### US-010 — Presentar reclamo

Como propietario o residente autorizado, quiero presentar un reclamo sobre una multa emitida.

#### Criterios de aceptación

* Multa pertenece a unidad autorizada.
* Multa está emitida.
* Reclamo dentro de plazo si aplica.
* Motivo obligatorio.
* Estado cambia a `disputed`.
* Registra auditoría.

---

### US-011 — Resolver reclamo

Como administrador autorizado, quiero aceptar o rechazar un reclamo.

#### Criterios de aceptación

* Requiere permiso.
* Reclamo en estado válido.
* Resolución obligatoria.
* Si se acepta, puede condonar o reversar.
* Si se rechaza, la multa continúa emitida.
* Registra auditoría.

---

### US-012 — Condonar multa

Como administrador autorizado, quiero condonar una multa con justificación.

#### Criterios de aceptación

* Requiere permiso.
* Razón obligatoria.
* No elimina historial.
* No borra cargo automáticamente.
* Registra auditoría.

---

### US-013 — Reversar multa

Como administrador autorizado, quiero reversar una multa emitida cuando fue creada por error o resolución posterior.

#### Criterios de aceptación

* Requiere permiso.
* Razón obligatoria.
* No elimina multa.
* Si existe cargo, deja trazabilidad para reverso financiero.
* Registra auditoría.

---

## 16. Requisitos funcionales

### FR-001 — Gestionar conceptos de multa

El sistema debe permitir crear, consultar, actualizar, activar, desactivar y archivar conceptos de multa.

---

### FR-002 — Configurar monto base

El sistema debe permitir definir monto base por concepto de multa.

---

### FR-003 — Asociar concepto financiero

El sistema debe permitir asociar un concepto financiero de cargo a un concepto de multa.

---

### FR-004 — Registrar multa

El sistema debe permitir registrar una multa asociada a una unidad habitacional.

---

### FR-005 — Asociar responsable

El sistema debe permitir asociar opcionalmente una persona responsable.

---

### FR-006 — Adjuntar evidencia

El sistema debe permitir registrar evidencias asociadas a una multa.

---

### FR-007 — Revisar multa

El sistema debe permitir mover una multa a revisión.

---

### FR-008 — Aprobar multa

El sistema debe permitir aprobar una multa.

---

### FR-009 — Rechazar multa

El sistema debe permitir rechazar una multa con razón.

---

### FR-010 — Emitir multa

El sistema debe permitir emitir una multa aprobada.

---

### FR-011 — Generar cargo

El sistema debe generar cargo financiero si la multa tiene monto positivo y configuración financiera válida.

---

### FR-012 — Cancelar multa

El sistema debe permitir cancelar una multa antes de emisión con razón.

---

### FR-013 — Condonar multa

El sistema debe permitir condonar multa con justificación.

---

### FR-014 — Reversar multa

El sistema debe permitir reversar una multa emitida con justificación.

---

### FR-015 — Presentar reclamo

El sistema debe permitir reclamos básicos sobre multas emitidas.

---

### FR-016 — Resolver reclamo

El sistema debe permitir aceptar o rechazar reclamos.

---

### FR-017 — Consultar multas administrativas

El sistema debe permitir listar y filtrar multas del tenant.

---

### FR-018 — Consultar multas propias

El sistema debe permitir que usuarios consulten multas de sus unidades autorizadas.

---

### FR-019 — Consultar evidencias

El sistema debe permitir consultar evidencias bajo permisos estrictos.

---

### FR-020 — Auditar operaciones

El sistema debe auditar todas las operaciones críticas.

---

### FR-021 — Mantener historial de estados

El sistema debe registrar historial funcional de cada transición de multa.

---

### FR-022 — Proteger datos personales

El sistema no debe exponer datos personales o evidencias a usuarios no autorizados.

---

### FR-023 — Proteger datos financieros

El sistema no debe exponer cargos asociados sin permisos adecuados.

---

### FR-024 — Documentar API

El sistema debe documentar endpoints, permisos, errores y estados en OpenAPI.

---

## 17. Requisitos no funcionales

### NFR-001 — Seguridad

Debe cumplir tenant isolation, autorización por permiso, autorización por recurso y minimización de datos.

---

### NFR-002 — Trazabilidad

Toda decisión sancionatoria debe tener historial y auditoría.

---

### NFR-003 — Consistencia financiera

La generación de cargos debe ser idempotente y no duplicar deudas.

---

### NFR-004 — Integridad histórica

No se permite eliminación física ordinaria de multas emitidas, evidencias, reclamos ni historial.

---

### NFR-005 — Privacidad

Los residentes solo pueden ver información asociada a sus unidades autorizadas.

---

### NFR-006 — API-first

Toda funcionalidad debe exponerse mediante REST API.

---

### NFR-007 — Performance

Las consultas administrativas deben soportar filtros y paginación.

Objetivo MVP:

```text id="b6g4gg"
p95 < 700 ms para listados paginados de multas con filtros comunes.
```

---

### NFR-008 — Extensibilidad

El diseño debe permitir notificaciones, flujos avanzados de apelación, documentos PDF y reportes futuros.

---

### NFR-009 — Observabilidad

El módulo debe emitir logs estructurados, métricas y auditoría sin exponer datos sensibles.

---

## 18. Permisos iniciales

### 18.1. Conceptos de multa

```text id="k2xl62"
fineConcepts.create
fineConcepts.read
fineConcepts.update
fineConcepts.archive
```

---

### 18.2. Gestión administrativa de multas

```text id="kjduwk"
fines.create
fines.read
fines.update
fines.review
fines.approve
fines.reject
fines.issue
fines.cancel
fines.waive
fines.reverse
fines.archive
fines.generateCharge
```

---

### 18.3. Evidencias

```text id="yjso23"
fineEvidence.create
fineEvidence.read
fineEvidence.archive
fineEvidence.download
```

---

### 18.4. Reclamos

```text id="jio4n6"
fineAppeals.read
fineAppeals.resolve
fineAppeals.submit.own
fineAppeals.read.own
```

---

### 18.5. Multas propias

```text id="dds5vx"
fines.read.own
fineEvidence.read.own
```

---

### 18.6. Reportes y auditoría

```text id="u7xrju"
fines.audit.read
fines.reports.read
```

---

## 19. Matriz de permisos

| Acción                             | Permiso requerido        |
| ---------------------------------- | ------------------------ |
| Crear concepto de multa            | `fineConcepts.create`    |
| Consultar conceptos                | `fineConcepts.read`      |
| Actualizar concepto                | `fineConcepts.update`    |
| Archivar concepto                  | `fineConcepts.archive`   |
| Crear multa                        | `fines.create`           |
| Consultar multas administrativas   | `fines.read`             |
| Actualizar multa en borrador       | `fines.update`           |
| Pasar a revisión                   | `fines.review`           |
| Aprobar multa                      | `fines.approve`          |
| Rechazar multa                     | `fines.reject`           |
| Emitir multa                       | `fines.issue`            |
| Cancelar multa                     | `fines.cancel`           |
| Condonar multa                     | `fines.waive`            |
| Reversar multa                     | `fines.reverse`          |
| Archivar multa                     | `fines.archive`          |
| Generar cargo                      | `fines.generateCharge`   |
| Adjuntar evidencia                 | `fineEvidence.create`    |
| Consultar evidencia administrativa | `fineEvidence.read`      |
| Descargar evidencia                | `fineEvidence.download`  |
| Consultar mis multas               | `fines.read.own`         |
| Consultar mis reclamos             | `fineAppeals.read.own`   |
| Presentar reclamo propio           | `fineAppeals.submit.own` |
| Resolver reclamo                   | `fineAppeals.resolve`    |
| Consultar auditoría                | `fines.audit.read`       |
| Consultar reportes                 | `fines.reports.read`     |

---

## 20. API preliminar

### 20.1. Fine Concepts

```text id="r9b1jc"
GET    /api/v1/tenant/fine-concepts
POST   /api/v1/tenant/fine-concepts
GET    /api/v1/tenant/fine-concepts/{fineConceptId}
PATCH  /api/v1/tenant/fine-concepts/{fineConceptId}
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/activate
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/deactivate
POST   /api/v1/tenant/fine-concepts/{fineConceptId}/archive
```

---

### 20.2. Fines — administrativo

```text id="lam30i"
GET    /api/v1/tenant/fines
POST   /api/v1/tenant/fines
GET    /api/v1/tenant/fines/{fineId}
PATCH  /api/v1/tenant/fines/{fineId}
POST   /api/v1/tenant/fines/{fineId}/submit-review
POST   /api/v1/tenant/fines/{fineId}/approve
POST   /api/v1/tenant/fines/{fineId}/reject
POST   /api/v1/tenant/fines/{fineId}/issue
POST   /api/v1/tenant/fines/{fineId}/cancel
POST   /api/v1/tenant/fines/{fineId}/waive
POST   /api/v1/tenant/fines/{fineId}/reverse
POST   /api/v1/tenant/fines/{fineId}/archive
POST   /api/v1/tenant/fines/{fineId}/generate-charge
```

---

### 20.3. Fine Evidence

```text id="snbjg5"
GET    /api/v1/tenant/fines/{fineId}/evidence
POST   /api/v1/tenant/fines/{fineId}/evidence
GET    /api/v1/tenant/fine-evidence/{evidenceId}
GET    /api/v1/tenant/fine-evidence/{evidenceId}/download
POST   /api/v1/tenant/fine-evidence/{evidenceId}/archive
```

---

### 20.4. Fine Appeals — administrativo

```text id="xvfj45"
GET    /api/v1/tenant/fines/{fineId}/appeals
GET    /api/v1/tenant/fine-appeals/{appealId}
POST   /api/v1/tenant/fine-appeals/{appealId}/accept
POST   /api/v1/tenant/fine-appeals/{appealId}/reject
POST   /api/v1/tenant/fine-appeals/{appealId}/cancel
```

---

### 20.5. Fines — propias

```text id="z6ol1u"
GET    /api/v1/me/fines
GET    /api/v1/me/fines/{fineId}
GET    /api/v1/me/fines/{fineId}/evidence
POST   /api/v1/me/fines/{fineId}/appeals
GET    /api/v1/me/fine-appeals
GET    /api/v1/me/fine-appeals/{appealId}
```

---

## 21. Datos públicos

No existen datos públicos de multas en esta spec.

WordPress público no debe recibir:

```text id="hg5iyp"
fineId
fineConcept
propertyUnitId
responsiblePersonId
status
amount
chargeId
evidence
appeals
history
audit
```

---

## 22. Reglas financieras

### 22.1. Multa sin cobro

Si `amount = 0` o la sanción no es monetaria:

```text id="eh9w1x"
paymentStatusSnapshot = notRequired
chargeId = null
```

---

### 22.2. Multa con cobro

Si `amount > 0`:

* debe existir `propertyUnitId`;
* debe existir concepto financiero válido;
* puede generar cargo al emitir;
* el cargo debe asociarse a `fineId`;
* el cargo debe asociarse a `propertyUnitId`.

---

### 22.3. Momento recomendado para generar cargo

MVP recomendado:

```text id="nyo8br"
Generar cargo al emitir la multa.
```

Motivos:

* evita cargos por multas rechazadas;
* evita cargos por borradores;
* conserva control administrativo;
* alinea cargo con decisión formal.

---

### 22.4. Idempotencia

Regla:

```text id="k8jy4f"
Una multa no debe generar más de un cargo activo asociado.
```

Idempotency key sugerida:

```text id="ngfyms"
fine:{fineId}:charge
```

---

### 22.5. Reclamos y cargos

En MVP, presentar reclamo no revierte automáticamente el cargo.

Si el reclamo se acepta, la administración debe:

```text id="gtibnj"
waive
reverse
o iniciar ajuste/reverso financiero controlado
```

---

### 22.6. Pagos

El módulo no confirma pagos.

Los pagos se gestionan con:

```text id="m11qsd"
005-payments
```

---

## 23. Auditoría

Eventos mínimos:

```text id="q92v50"
fineConcept.created
fineConcept.updated
fineConcept.activated
fineConcept.deactivated
fineConcept.archived
fine.created
fine.updated
fine.reported
fine.underReview
fine.approved
fine.rejected
fine.issued
fine.disputed
fine.appealAccepted
fine.appealRejected
fine.waived
fine.cancelled
fine.reversed
fine.archived
fine.chargeGenerated
fine.chargeGenerationFailed
fineEvidence.added
fineEvidence.archived
fineEvidence.downloaded
fineAppeal.submitted
fineAppeal.accepted
fineAppeal.rejected
fineAppeal.cancelled
```

Metadata permitida:

```text id="xrmue1"
fineId
fineConceptId
propertyUnitId
responsiblePersonId
fromStatus
toStatus
amount
currency
chargeId
reason
traceId
```

Metadata prohibida:

```text id="mtjdyk"
payload completo
tokens
secretos
archivos completos
comprobantes
datos personales innecesarios
detalles sensibles extensos
headers completos
cookies
```

---

## 24. Seguridad

### 24.1. Riesgos principales

| Riesgo                                   | Impacto    |
| ---------------------------------------- | ---------- |
| Multa cross-tenant                       | Crítico    |
| Multa asignada a unidad ajena            | Alto       |
| Exposición de multas a terceros          | Alto       |
| Exposición de evidencias privadas        | Alto       |
| Cargo duplicado                          | Alto       |
| Uso de float en dinero                   | Alto       |
| Multa emitida sin evidencia requerida    | Medio/alto |
| Rechazo/cancelación sin razón            | Medio      |
| Reclamo fuera de plazo                   | Medio      |
| Reverso no auditado                      | Alto       |
| Modificación silenciosa de multa emitida | Alto       |
| WordPress expone multas                  | Crítico    |

---

### 24.2. Controles

```text id="qk13po"
tenant isolation
permission guards
own-resource authorization
property unit validation
responsible person validation
evidence access control
state machine
required reasons
Decimal money
idempotent charge generation
audit events
status history
safe errors
safe logging
no public WordPress exposure
```

---

## 25. Observabilidad

Logs sugeridos:

```text id="iv3kwo"
fineConcept.created
fineConcept.updated
fine.created
fine.approved
fine.rejected
fine.issued
fine.cancelled
fine.waived
fine.reversed
fine.chargeGenerated
fine.chargeGenerationFailed
fineAppeal.submitted
fineAppeal.resolved
fineEvidence.added
```

Métricas sugeridas:

```text id="ddmu2z"
fines_created_total
fines_approved_total
fines_rejected_total
fines_issued_total
fines_cancelled_total
fines_waived_total
fines_reversed_total
fines_disputed_total
fines_charge_generated_total
fines_charge_generation_failed_total
fine_appeals_submitted_total
```

Labels permitidos:

```text id="jarvjx"
status
action
outcome
severity
category
```

Labels prohibidos:

```text id="pq2n03"
tenantId
fineId
propertyUnitId
personId
userId
chargeId
traceId
```

---

## 26. Testing

### 26.1. Unit tests

Probar:

* concepto de multa;
* monto Decimal;
* estados;
* transiciones;
* evidencia requerida;
* reclamo dentro/fuera de plazo;
* razones obligatorias;
* reglas de emisión;
* reglas de cargo;
* mappers públicos/propios/admin.

---

### 26.2. Integration tests

Probar:

* creación de concepto;
* creación de multa;
* adjunto de evidencia;
* revisión;
* aprobación;
* rechazo;
* emisión;
* generación de cargo;
* cancelación;
* condonación;
* reverso;
* reclamo;
* resolución de reclamo;
* tenant isolation.

---

### 26.3. API tests

Probar:

* endpoints de conceptos;
* endpoints de multas administrativas;
* endpoints de evidencia;
* endpoints de reclamos;
* endpoints propios;
* errores;
* permisos;
* paginación;
* filtros.

---

### 26.4. Financial regression tests

Probar:

* monto Decimal;
* monto como string;
* cargo generado una sola vez;
* cargo pertenece al tenant;
* cargo pertenece a unidad;
* emisión genera cargo si aplica;
* reclamo no revierte cargo automáticamente;
* condonación no borra cargo silenciosamente;
* pagos no se procesan desde multas.

---

### 26.5. Security tests

Probar:

* usuario sin permiso no aprueba;
* residente no ve multas ajenas;
* residente no reclama multa ajena;
* tenant A no ve multas tenant B;
* evidencias no se exponen a terceros;
* WordPress no ve multas;
* no se aceptan cargos de otro tenant;
* no se aceptan unidades de otro tenant;
* no se exponen datos sensibles en logs.

---

## 27. Criterios de aceptación globales

La spec se considera implementada si:

* se pueden crear conceptos de multa;
* se pueden configurar montos base;
* se pueden asociar conceptos financieros;
* se pueden registrar multas;
* se pueden adjuntar evidencias;
* se pueden revisar multas;
* se pueden aprobar multas;
* se pueden rechazar multas;
* se pueden emitir multas;
* se pueden generar cargos asociados;
* la generación de cargo es idempotente;
* se pueden cancelar multas antes de emisión;
* se pueden condonar multas;
* se pueden reversar multas;
* se pueden presentar reclamos propios;
* se pueden resolver reclamos;
* se pueden consultar multas administrativas;
* se pueden consultar multas propias;
* se protegen evidencias;
* los montos usan Decimal y salen como string;
* no se procesan pagos desde multas;
* no se exponen multas en WordPress;
* todas las operaciones críticas se auditan;
* se mantiene historial de estados;
* OpenAPI está actualizado;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas financieras pasan;
* pruebas multitenant pasan;
* pruebas de seguridad pasan;
* CI pasa.

---

## 28. Casos borde

| Caso                                      | Resultado esperado                       |
| ----------------------------------------- | ---------------------------------------- |
| Concepto inexistente                      | 404                                      |
| Concepto de otro tenant                   | 404/403                                  |
| Concepto inactivo                         | no permite nueva multa                   |
| Código de concepto duplicado              | 409                                      |
| Monto negativo                            | 422                                      |
| Monto float                               | 422                                      |
| Multa sin unidad y con monto > 0          | 422                                      |
| Unidad de otro tenant                     | 403                                      |
| Persona responsable de otro tenant        | 403                                      |
| Aprobar multa sin evidencia requerida     | 422                                      |
| Aprobar multa rechazada                   | 409                                      |
| Emitir multa no aprobada                  | 409                                      |
| Emitir multa ya emitida                   | 409                                      |
| Generar cargo sin concepto financiero     | 422                                      |
| Generar cargo duplicado                   | retorna cargo existente o 409 controlado |
| Rechazar sin razón                        | 422                                      |
| Cancelar sin razón                        | 422                                      |
| Condonar sin razón                        | 422                                      |
| Reversar sin razón                        | 422                                      |
| Reclamo fuera de plazo                    | 409/422                                  |
| Reclamo sobre multa no emitida            | 409                                      |
| Reclamo de multa ajena                    | 403/404                                  |
| Residente consulta multa ajena            | 403/404                                  |
| Descargar evidencia sin permiso           | 403                                      |
| WordPress intenta ver multas              | endpoint no existe                       |
| WordPress intenta crear multa             | endpoint no existe                       |
| Tenant suspendido                         | bloquea nuevas multas según política     |
| Multa emitida con cargo y luego cancelada | no borra cargo automáticamente           |

---

## 29. Dependencias hacia specs futuras

Este módulo habilita:

```text id="g3a37k"
00X-fines-notifications
00X-fines-advanced-appeals
00X-fines-pdf-documents
00X-fines-committee-workflow
00X-fines-recurrence-and-repeat-offenders
00X-fines-reservation-restrictions
00X-fines-legal-case-management
00X-ai-assisted-evidence-review
00X-communications
00X-advanced-reports
```

---

## 30. Archivos derivados esperados

```text id="z0kj07"
docs/specs/011-fines-sanctions/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 31. Preguntas abiertas

1. ¿Qué tipos de multas serán comunes en los conjuntos iniciales?
2. ¿Todas las multas tendrán valor monetario o existirán sanciones no monetarias?
3. ¿La multa se genera al aprobar o al emitir?
4. ¿Quién puede aprobar multas: administrador, comité o directiva?
5. ¿Será obligatoria la evidencia para todas las multas?
6. ¿Qué tipos de evidencia se permitirán en MVP?
7. ¿Los residentes podrán ver evidencias?
8. ¿Los residentes podrán presentar reclamos desde el MVP?
9. ¿Cuál será el plazo estándar de reclamo?
10. ¿Un reclamo suspende el cobro o solo cambia el estado informativo?
11. ¿La condonación debe generar reverso financiero automático o manual?
12. ¿La reincidencia aumentará el monto?
13. ¿Se permitirá multa a arrendatarios o solo a propietarios/unidades?
14. ¿Una multa podrá afectar permisos de reserva de áreas comunales?
15. ¿Habrá flujo de aprobación por más de una persona?

---

## 32. Decisión inicial para MVP

Para MVP se recomienda:

```text id="fgq7kv"
- Crear conceptos de multa.
- Registrar multas asociadas a unidad habitacional.
- Asociar responsable opcional.
- Exigir descripción obligatoria.
- Permitir evidencia opcional o requerida por concepto.
- Implementar revisión, aprobación, rechazo y emisión.
- Generar cargo al emitir la multa.
- Usar idempotencia en generación de cargo.
- Permitir consulta administrativa.
- Permitir consulta propia limitada.
- Permitir reclamo básico.
- Permitir resolución simple de reclamo.
- Permitir condonación y reverso controlado.
- No procesar pagos desde multas.
- No revertir cargos automáticamente sin flujo financiero.
- No exponer multas a WordPress.
- No implementar notificaciones automáticas todavía.
- No implementar flujo legal avanzado todavía.
```

---

## 33. Conclusión

El módulo `011-fines-sanctions` incorpora la gestión básica de multas y sanciones en RESIDENT Core.

Debe implementarse como un módulo:

```text id="u83wx4"
tenant-scoped
permissioned
own-resource protected
financially integrable
evidence-aware
state-controlled
auditable
privacy-preserving
not public-facing
```

No debe aceptarse una implementación que permita multas cross-tenant, asigne multas a unidades ajenas, exponga multas o evidencias a usuarios no autorizados, genere cargos duplicados, use float para dinero, procese pagos directamente, elimine historial, modifique silenciosamente multas emitidas, omita auditoría o exponga información de multas en WordPress público.
