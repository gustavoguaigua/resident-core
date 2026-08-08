# Spec 006 — Account Statements, Balances and Financial Position by Property Unit

## 1. Información del documento

| Campo           | Valor                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                                                  |
| Spec ID         | 006                                                                                                                                                            |
| Módulo          | Account Statements                                                                                                                                             |
| Documento       | Functional Specification                                                                                                                                       |
| Ruta            | `docs/specs/006-account-statements/spec.md`                                                                                                                    |
| Versión         | 0.1                                                                                                                                                            |
| Estado          | Borrador inicial                                                                                                                                               |
| Fecha           | 2026-07-14                                                                                                                                                     |
| Prioridad       | Alta                                                                                                                                                           |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`                                                                  |
| Relacionado con | `constitution.md`, `domain-map.md`, `security.md`, `api-guidelines.md`, `data-governance.md`, `ADR-003`, `ADR-004`, `ADR-007`, `ADR-010`, `ADR-011`, `ADR-012` |

---

## 2. Propósito

El módulo `006-account-statements` define cómo RESIDENT Core calculará, consultará, generará, cerrará, publicará y expondrá estados de cuenta por unidad habitacional dentro de cada tenant.

Este módulo consolida información proveniente de:

* cargos ordinarios;
* cargos extraordinarios;
* cargos manuales;
* ajustes;
* reversos de cargos;
* pagos confirmados;
* asignaciones de pagos;
* reversos de pagos;
* reversos de asignaciones;
* saldos no asignados;
* saldos pendientes;
* saldos a favor;
* movimientos financieros auditables.

Regla central:

```text id="mj0brd"
El estado de cuenta no debe ser una fuente independiente de verdad financiera; debe poder reconstruirse desde cargos, ajustes, reversos, pagos y asignaciones auditables.
```

---

## 3. Objetivo funcional

Permitir que cada conjunto residencial consulte y gestione la posición financiera de cada unidad habitacional.

El módulo debe permitir:

* calcular saldo por unidad;
* generar estado de cuenta por periodo;
* consultar movimientos financieros por unidad;
* distinguir cargos, pagos, ajustes, reversos y saldos;
* mostrar saldo anterior;
* mostrar cargos del periodo;
* mostrar pagos del periodo;
* mostrar ajustes;
* mostrar saldo final;
* mostrar saldo vencido;
* mostrar saldo no vencido;
* mostrar saldo a favor;
* consultar estado de cuenta propio;
* exportar estado de cuenta en formato controlado;
* cerrar un estado de cuenta de periodo;
* publicar estados de cuenta para propietarios/residentes;
* conservar snapshot si se decide materializar;
* permitir reconstrucción desde movimientos;
* auditar generación, publicación y consulta sensible;
* preparar notificaciones y cobranza futura.

---

## 4. Alcance

### 4.1. Incluido en esta spec

Esta spec incluye:

* `AccountStatement`;
* `AccountStatementLine`;
* `UnitBalance`;
* `BalanceSnapshot`;
* cálculo de saldo por unidad;
* consulta de movimientos por unidad;
* generación de estados por periodo;
* regeneración controlada;
* publicación de estados;
* cierre o bloqueo de estados;
* consulta administrativa;
* consulta propia;
* exportación básica;
* auditoría;
* eventos de dominio;
* endpoints REST;
* pruebas esperadas.

---

### 4.2. No incluido en esta spec

No incluye todavía:

* cálculo avanzado de mora;
* intereses compuestos;
* reglas legales de cobranza;
* notificaciones automáticas;
* cobranza automatizada;
* conciliación bancaria;
* contabilidad completa;
* asientos contables;
* facturación electrónica;
* reportes financieros avanzados;
* dashboards ejecutivos;
* aprobación dual avanzada;
* envío automático por correo o WhatsApp;
* documentos firmados electrónicamente;
* integración con pasarela de pagos;
* generación tributaria.

Estos temas se tratarán en specs posteriores.

---

## 5. Contexto arquitectónico

Este módulo pertenece al bounded context:

```text id="o9l2va"
Financial Management
Payments and Reconciliation
Reporting and Analytics
```

Depende directamente de:

```text id="g8r4kw"
001-tenants
002-users-roles
003-residents-properties
004-dues-fees
005-payments
```

porque:

* todo estado de cuenta pertenece a un tenant;
* todo acceso requiere autorización;
* todo estado se calcula por unidad habitacional;
* los cargos vienen de `004-dues-fees`;
* los pagos y asignaciones vienen de `005-payments`.

---

## 6. Principio de fuente de verdad

### 6.1. Fuente primaria

La fuente primaria de verdad financiera son los movimientos base:

```text id="n7cpkl"
charges
charge_adjustments
charge_reversals
payments
payment_allocations
payment_reversals
```

---

### 6.2. Estado de cuenta como vista o snapshot

El estado de cuenta puede existir como:

```text id="sksmbq"
vista calculada en tiempo real
snapshot materializado
documento publicado
```

Pero no debe contradecir movimientos base.

---

### 6.3. Regla de reconstrucción

Para toda unidad y periodo, debe ser posible reconstruir:

```text id="it2n55"
saldo inicial
+ cargos emitidos
+ ajustes positivos
- ajustes negativos
- pagos aplicados
- reversos aplicables
= saldo final
```

---

## 7. Actores

### 7.1. TenantAdmin

Puede:

* consultar estados de cuenta;
* generar estados por periodo;
* publicar estados;
* cerrar estados;
* exportar información;
* revisar saldos por unidad;
* revisar auditoría.

---

### 7.2. Treasurer

Puede:

* generar estados de cuenta;
* consultar saldos;
* revisar movimientos;
* publicar estados;
* exportar estados;
* preparar cobranza.

---

### 7.3. TenantAuditor

Puede:

* consultar estados;
* consultar movimientos;
* revisar snapshots;
* revisar diferencias;
* exportar información si tiene permiso.

No debe modificar ni publicar estados salvo permiso explícito.

---

### 7.4. BoardMember

Puede consultar reportes o estados según permisos del tenant.

---

### 7.5. PropertyOwner

Puede:

* consultar estado de cuenta de sus unidades;
* descargar su estado;
* revisar cargos, pagos y saldos;
* ver saldo a favor o saldo pendiente.

---

### 7.6. Resident

Puede consultar estados de cuenta de su unidad si la política del tenant lo permite.

---

### 7.7. PlatformAdmin

Puede operar soporte global bajo permisos estrictos y auditoría reforzada.

No debe consultar estados financieros de tenants sin justificación operacional.

---

## 8. Definiciones

### 8.1. AccountStatement

Documento lógico o materializado que resume la posición financiera de una unidad en un periodo.

Ejemplo:

```text id="2xmxj8"
Unidad: Casa 01
Periodo: 2026-07
Saldo anterior: 25.00
Cargos: 60.00
Pagos aplicados: 50.00
Saldo final: 35.00
```

---

### 8.2. AccountStatementLine

Línea del estado de cuenta.

Puede representar:

* cargo;
* ajuste;
* reverso;
* pago aplicado;
* saldo inicial;
* saldo final;
* saldo a favor;
* nota financiera.

---

### 8.3. UnitBalance

Saldo actual calculado o materializado de una unidad.

Incluye:

* saldo pendiente;
* saldo vencido;
* saldo no vencido;
* saldo a favor;
* última fecha de cálculo.

---

### 8.4. BalanceSnapshot

Captura materializada de saldo en un momento.

Sirve para:

* rendimiento;
* cierre de periodo;
* publicación;
* auditoría;
* comparación posterior.

---

### 8.5. Opening Balance

Saldo inicial de un periodo.

Puede provenir de:

* saldo final del periodo anterior;
* migración inicial;
* cargo de apertura;
* ajuste inicial auditado.

---

### 8.6. Outstanding Balance

Monto pendiente de pago.

---

### 8.7. Credit Balance

Saldo a favor de la unidad.

---

### 8.8. Published Statement

Estado de cuenta visible para propietario o residente autorizado.

---

### 8.9. Closed Statement

Estado de cuenta cerrado para un periodo.

No debe cambiar sin regeneración controlada, reverso o nuevo snapshot auditado.

---

## 9. Supuestos

1. `Tenant` existe.
2. `UserProfile`, roles y permisos existen.
3. `PropertyUnit` existe.
4. `Charge` existe desde `004-dues-fees`.
5. `Payment` y `PaymentAllocation` existen desde `005-payments`.
6. Todo estado de cuenta se calcula por tenant y unidad.
7. La moneda MVP es USD.
8. Todo cálculo monetario usa Decimal.
9. No se usa float.
10. Los pagos no asignados no reducen cargos específicos hasta que exista asignación.
11. Los pagos reversados no reducen saldo.
12. Las asignaciones reversadas no reducen saldo.
13. Los cargos cancelados o reversados no aumentan saldo.
14. El estado de cuenta debe poder reconstruirse desde movimientos.
15. Puede existir snapshot materializado para publicación.
16. Los snapshots no reemplazan la fuente de verdad.
17. WordPress no calcula ni almacena estados de cuenta.
18. La consulta propia depende de la relación `UserProfile → Person → PropertyUnit`.
19. La mora avanzada será diferida.
20. La conciliación bancaria será diferida.

---

## 10. Reglas de negocio

### BR-001 — Todo estado de cuenta pertenece a un tenant

Todo `AccountStatement`, `AccountStatementLine`, `UnitBalance` y `BalanceSnapshot` debe tener `tenantId`.

---

### BR-002 — Todo estado de cuenta pertenece a una unidad

Todo estado de cuenta debe asociarse a una `PropertyUnit`.

---

### BR-003 — Unidad debe pertenecer al tenant

No se puede generar ni consultar estado de cuenta para una unidad de otro tenant.

---

### BR-004 — Periodo requerido

Todo estado de cuenta de periodo debe asociarse a un `BillingPeriod`.

---

### BR-005 — Cálculo basado en movimientos

El saldo debe calcularse desde movimientos financieros válidos.

---

### BR-006 — No usar float

Todos los cálculos usan Decimal.

---

### BR-007 — Moneda MVP USD

El módulo opera inicialmente en:

```text id="vw4dws"
USD
```

---

### BR-008 — Cargos válidos aumentan saldo

Aumentan saldo:

* cargos emitidos;
* cargos manuales válidos;
* cargos extraordinarios válidos;
* ajustes positivos válidos.

---

### BR-009 — Pagos asignados reducen saldo

Solo reducen saldo las asignaciones activas de pagos confirmados.

---

### BR-010 — Pagos no asignados no reducen cargos específicos

Un pago confirmado pero no asignado genera monto no asignado.

Su tratamiento como saldo a favor se define como:

```text id="ert9fx"
creditBalance provisional o unallocatedPaymentBalance
```

La política final se definirá en `data-model.md`.

---

### BR-011 — Cargos cancelados no aumentan saldo

Cargos cancelados deben excluirse del saldo exigible.

---

### BR-012 — Cargos reversados no aumentan saldo

Cargos reversados deben excluirse del saldo exigible.

---

### BR-013 — Pagos reversados no reducen saldo

Pagos reversados no deben reducir saldo ni aparecer como pago activo.

---

### BR-014 — Asignaciones reversadas no reducen saldo

Asignaciones reversadas no deben afectar saldo.

---

### BR-015 — Estado de cuenta debe ser reconstruible

Todo estado publicado debe poder reconciliarse con movimientos base.

---

### BR-016 — Snapshot no reemplaza movimientos

Un snapshot es una representación de consulta, no la fuente contable primaria.

---

### BR-017 — Publicación requiere permiso

Publicar estados de cuenta requiere permiso específico.

---

### BR-018 — Cierre requiere permiso

Cerrar o bloquear estados requiere permiso específico.

---

### BR-019 — Regeneración controlada

Regenerar un estado publicado o cerrado requiere auditoría y motivo.

---

### BR-020 — Consulta propia solo unidades propias

Propietarios o residentes solo pueden consultar estados de unidades propias.

---

### BR-021 — No eliminación física

No se elimina físicamente un estado publicado o snapshot.

---

### BR-022 — Exportación controlada

Exportar estados requiere permiso y auditoría, especialmente para datos masivos.

---

### BR-023 — WordPress no calcula estados

WordPress no debe calcular, almacenar ni exponer estados de cuenta financieros.

---

### BR-024 — Auditoría obligatoria

Generación, publicación, cierre, regeneración, exportación y consulta sensible deben auditarse.

---

## 11. Estados

## 11.1. AccountStatementStatus

```text id="5n40lg"
draft
generated
published
closed
locked
superseded
archived
```

| Estado       | Descripción                                      |
| ------------ | ------------------------------------------------ |
| `draft`      | Estado preliminar                                |
| `generated`  | Generado internamente                            |
| `published`  | Visible para propietarios/residentes autorizados |
| `closed`     | Cerrado para el periodo                          |
| `locked`     | Bloqueado contra cambios ordinarios              |
| `superseded` | Reemplazado por regeneración controlada          |
| `archived`   | Histórico no operativo                           |

---

## 11.2. AccountStatementLineType

```text id="c7ucch"
openingBalance
charge
chargeAdjustment
chargeReversal
paymentAllocation
paymentReversal
paymentAllocationReversal
creditBalance
closingBalance
note
```

---

## 11.3. BalanceSnapshotStatus

```text id="4bviyx"
current
superseded
closed
archived
```

---

## 11.4. BalanceSide

```text id="quq70q"
debit
credit
neutral
```

---

## 12. Flujos funcionales

## 12.1. Calcular saldo de una unidad

### Actor

TenantAdmin, Treasurer, TenantAuditor o usuario autorizado.

### Flujo

```text id="y6ruez"
1. Actor selecciona unidad.
2. Sistema valida tenant y permisos.
3. Sistema obtiene cargos válidos.
4. Sistema obtiene ajustes y reversos válidos.
5. Sistema obtiene pagos confirmados y allocations activas.
6. Sistema excluye pagos reversados y allocations reversadas.
7. Sistema calcula saldo pendiente.
8. Sistema calcula saldo a favor si aplica.
9. Sistema devuelve UnitBalance.
10. Sistema audita si corresponde.
```

---

## 12.2. Generar estado de cuenta de periodo

### Actor

Treasurer o TenantAdmin con permiso.

### Flujo

```text id="t3176m"
1. Actor selecciona periodo.
2. Actor selecciona una unidad o todas las unidades.
3. Sistema valida tenant activo.
4. Sistema valida periodo.
5. Sistema obtiene movimientos del periodo.
6. Sistema obtiene saldo anterior.
7. Sistema calcula líneas del estado.
8. Sistema calcula totales.
9. Sistema crea AccountStatement.
10. Sistema crea AccountStatementLines.
11. Sistema crea o actualiza BalanceSnapshot.
12. Sistema audita.
13. Sistema emite AccountStatementGenerated.
```

---

## 12.3. Publicar estado de cuenta

### Actor

Treasurer o TenantAdmin con permiso `accountStatements.publish`.

### Flujo

```text id="ywsw97"
1. Actor selecciona statement generado.
2. Sistema valida estado publicable.
3. Sistema marca statement como published.
4. Sistema registra publishedAt y publishedBy.
5. Sistema audita.
6. Sistema emite AccountStatementPublished.
```

---

## 12.4. Cerrar estado de cuenta

### Actor

Treasurer o TenantAdmin con permiso `accountStatements.close`.

### Flujo

```text id="mxk9l5"
1. Actor selecciona statement.
2. Actor ingresa motivo.
3. Sistema valida estado.
4. Sistema marca statement como closed.
5. Sistema registra closedAt y closedBy.
6. Sistema audita.
7. Sistema emite AccountStatementClosed.
```

---

## 12.5. Bloquear estado de cuenta

### Actor

TenantAdmin o rol autorizado.

### Flujo

```text id="h5hrg5"
1. Actor selecciona statement.
2. Actor ingresa motivo.
3. Sistema valida permiso.
4. Sistema marca statement como locked.
5. Sistema audita.
6. Sistema emite AccountStatementLocked.
```

---

## 12.6. Regenerar estado de cuenta

### Actor

Treasurer o TenantAdmin con permiso explícito.

### Flujo

```text id="fd45h9"
1. Actor solicita regeneración.
2. Actor ingresa motivo.
3. Sistema valida si el statement puede regenerarse.
4. Sistema marca statement anterior como superseded.
5. Sistema recalcula movimientos.
6. Sistema crea nuevo statement.
7. Sistema vincula previousStatementId.
8. Sistema audita.
9. Sistema emite AccountStatementRegenerated.
```

---

## 12.7. Consultar mi estado de cuenta

### Actor

PropertyOwner o Resident autorizado.

### Flujo

```text id="nqskm1"
1. Usuario solicita estado de cuenta propio.
2. Sistema valida token.
3. Sistema resuelve unidades propias.
4. Sistema valida que la unidad solicitada es propia.
5. Sistema devuelve statement publicado o balance actual según endpoint.
6. Sistema no expone datos de unidades ajenas.
```

---

## 13. Historias de usuario

### US-001 — Consultar saldo por unidad

Como Treasurer, quiero consultar el saldo de una unidad para conocer cuánto debe o tiene a favor.

#### Criterios de aceptación

* Solo consulta unidades del tenant.
* El saldo usa Decimal.
* El saldo considera cargos válidos y pagos asignados.
* No considera pagos reversados.
* No considera cargos cancelados o reversados.

---

### US-002 — Generar estados de cuenta mensuales

Como Treasurer, quiero generar estados de cuenta para todas las unidades de un periodo para publicarlos a los propietarios.

#### Criterios de aceptación

* Requiere periodo válido.
* Requiere permiso `accountStatements.generate`.
* Genera un statement por unidad.
* Cada statement contiene líneas y totales.
* La generación se audita.

---

### US-003 — Publicar estados de cuenta

Como TenantAdmin, quiero publicar estados generados para que los propietarios puedan consultarlos.

#### Criterios de aceptación

* Solo se publican statements generados.
* Requiere permiso.
* Registra actor y fecha.
* Se audita.

---

### US-004 — Consultar mi estado de cuenta

Como PropertyOwner, quiero consultar el estado de cuenta de mis unidades.

#### Criterios de aceptación

* Solo veo unidades propias.
* Solo veo statements publicados o información permitida.
* No veo saldos de otras unidades.
* Requiere `accountStatements.read.own`.

---

### US-005 — Ver detalle de movimientos

Como PropertyOwner, quiero ver los cargos y pagos que componen mi saldo.

#### Criterios de aceptación

* Las líneas están ordenadas por fecha.
* Se muestran cargos, pagos aplicados, ajustes y saldo.
* No se exponen datos internos de auditoría.
* Los montos se muestran como string decimal.

---

### US-006 — Regenerar statement

Como Treasurer, quiero regenerar un estado de cuenta cuando hubo una corrección financiera.

#### Criterios de aceptación

* Requiere motivo.
* Statement anterior queda `superseded`.
* Nuevo statement queda vinculado al anterior.
* La operación se audita.

---

### US-007 — Exportar estado de cuenta

Como Treasurer, quiero exportar un estado de cuenta para entregarlo al propietario o para archivo administrativo.

#### Criterios de aceptación

* Requiere permiso.
* Exporta datos del tenant activo.
* No exporta datos de otro tenant.
* La exportación se audita.

---

## 14. Requisitos funcionales

### FR-001 — Calcular balance actual por unidad

El sistema debe calcular saldo actual de una unidad habitacional.

---

### FR-002 — Calcular balance por periodo

El sistema debe calcular saldo inicial, movimientos del periodo y saldo final.

---

### FR-003 — Generar estado de cuenta por unidad

El sistema debe generar un estado de cuenta para una unidad y periodo.

---

### FR-004 — Generar estados de cuenta en lote

El sistema debe generar estados de cuenta para múltiples unidades de un tenant y periodo.

---

### FR-005 — Crear líneas de estado de cuenta

El sistema debe crear líneas basadas en cargos, pagos, ajustes y reversos.

---

### FR-006 — Publicar estado de cuenta

El sistema debe permitir publicar estados generados.

---

### FR-007 — Cerrar estado de cuenta

El sistema debe permitir cerrar estados con permiso y motivo.

---

### FR-008 — Bloquear estado de cuenta

El sistema debe permitir bloquear estados para evitar regeneración ordinaria.

---

### FR-009 — Regenerar estado de cuenta

El sistema debe permitir regenerar estados bajo control, motivo y auditoría.

---

### FR-010 — Consultar estado de cuenta administrativo

El sistema debe permitir consultar statements por tenant, unidad y periodo.

---

### FR-011 — Consultar estado de cuenta propio

El sistema debe permitir consultar statements propios por propietario/residente autorizado.

---

### FR-012 — Consultar movimientos financieros por unidad

El sistema debe permitir consultar movimientos base que componen el saldo.

---

### FR-013 — Calcular saldo vencido y no vencido

El sistema debe distinguir saldo vencido y no vencido según dueDate.

---

### FR-014 — Calcular saldo a favor

El sistema debe identificar pagos confirmados no asignados o excedentes.

---

### FR-015 — Exportar estado de cuenta

El sistema debe permitir exportación básica de statement.

---

### FR-016 — Auditar operaciones

El sistema debe auditar generación, publicación, cierre, bloqueo, regeneración, exportación y accesos sensibles.

---

### FR-017 — Emitir eventos de dominio

El sistema debe emitir eventos relevantes.

---

### FR-018 — Impedir acceso cross-tenant

El sistema debe bloquear acceso a statements, balances o movimientos de otro tenant.

---

### FR-019 — Garantizar precisión monetaria

El sistema debe usar Decimal y exponer montos como string.

---

### FR-020 — Preparar información para notificaciones y cobranza

El sistema debe dejar eventos y datos suficientes para futuras notificaciones y cobranza.

---

## 15. Requisitos no funcionales

### NFR-001 — Seguridad financiera

Todo endpoint de estados de cuenta requiere autenticación, tenant activo, membership activa y permiso.

---

### NFR-002 — Multitenancy

Todo statement, línea y snapshot debe incluir `tenantId`.

---

### NFR-003 — Precisión monetaria

Todos los cálculos deben usar Decimal.

---

### NFR-004 — Reconstruibilidad

Todo saldo debe poder reconstruirse desde movimientos base.

---

### NFR-005 — Auditoría

Toda operación crítica debe ser auditable.

---

### NFR-006 — Privacidad

Los usuarios `.own` solo pueden ver estados de unidades propias.

---

### NFR-007 — No eliminación física

No se eliminan físicamente statements publicados, cerrados o snapshots.

---

### NFR-008 — Observabilidad

Operaciones críticas deben registrar logs estructurados, métricas y `traceId`.

---

### NFR-009 — Performance

La generación en lote debe ser eficiente para tenants pequeños y medianos.

MVP recomendado:

```text id="4vbsgh"
hasta 500 unidades por tenant
```

---

### NFR-010 — Idempotencia

La generación de statements por periodo/unidad debe ser idempotente o manejar regeneración controlada.

---

## 16. Modelo de datos preliminar

### 16.1. AccountStatement

```text id="wm8mmc"
AccountStatement
├── id
├── tenantId
├── propertyUnitId
├── billingPeriodId
├── statementNumber
├── status
├── currency
├── openingBalance
├── chargesTotal
├── adjustmentsTotal
├── paymentsTotal
├── reversalsTotal
├── creditBalance
├── closingBalance
├── overdueBalance
├── notDueBalance
├── generatedAt
├── generatedBy
├── publishedAt nullable
├── publishedBy nullable
├── closedAt nullable
├── closedBy nullable
├── lockedAt nullable
├── lockedBy nullable
├── supersededBy nullable
├── previousStatementId nullable
├── regenerationReason nullable
├── createdAt
└── updatedAt
```

---

### 16.2. AccountStatementLine

```text id="yekmdc"
AccountStatementLine
├── id
├── tenantId
├── accountStatementId
├── propertyUnitId
├── billingPeriodId
├── lineType
├── sourceType
├── sourceId
├── description
├── lineDate
├── dueDate nullable
├── debitAmount
├── creditAmount
├── balanceAfterLine
├── currency
├── sortOrder
├── createdAt
└── archivedAt nullable
```

---

### 16.3. UnitBalance

Puede ser vista calculada o tabla materializada.

```text id="j5tmb0"
UnitBalance
├── id
├── tenantId
├── propertyUnitId
├── currency
├── outstandingBalance
├── overdueBalance
├── notDueBalance
├── creditBalance
├── lastCalculatedAt
├── lastMovementAt
└── updatedAt
```

---

### 16.4. BalanceSnapshot

```text id="dxe2y7"
BalanceSnapshot
├── id
├── tenantId
├── propertyUnitId
├── billingPeriodId nullable
├── currency
├── outstandingBalance
├── overdueBalance
├── notDueBalance
├── creditBalance
├── calculatedAt
├── calculatedBy nullable
├── status
├── sourceHash nullable
├── createdAt
└── archivedAt nullable
```

---

## 17. Permisos iniciales

### 17.1. Administración

```text id="i2r3vj"
accountStatements.generate
accountStatements.read
accountStatements.publish
accountStatements.close
accountStatements.lock
accountStatements.regenerate
accountStatements.export
```

---

### 17.2. Balances

```text id="uo03jy"
balances.read
balances.recalculate
```

---

### 17.3. Consulta propia

```text id="c7qz9r"
accountStatements.read.own
accountStatements.export.own
balances.read.own
```

---

### 17.4. Auditoría y reportes

```text id="wqkuox"
accountStatements.audit.read
accountStatements.reports.read
```

---

## 18. API preliminar

### 18.1. Account Statements API administrativa

```text id="pkqpfm"
GET    /api/v1/tenant/account-statements
POST   /api/v1/tenant/account-statements/generate
POST   /api/v1/tenant/account-statements/generate-batch
GET    /api/v1/tenant/account-statements/{statementId}
POST   /api/v1/tenant/account-statements/{statementId}/publish
POST   /api/v1/tenant/account-statements/{statementId}/close
POST   /api/v1/tenant/account-statements/{statementId}/lock
POST   /api/v1/tenant/account-statements/{statementId}/regenerate
GET    /api/v1/tenant/account-statements/{statementId}/export
```

---

### 18.2. Balances API administrativa

```text id="t7mztp"
GET    /api/v1/tenant/balances
GET    /api/v1/tenant/property-units/{propertyUnitId}/balance
POST   /api/v1/tenant/property-units/{propertyUnitId}/balance/recalculate
GET    /api/v1/tenant/property-units/{propertyUnitId}/financial-movements
```

---

### 18.3. Own Account Statements API

```text id="a49ai7"
GET    /api/v1/me/account-statements
GET    /api/v1/me/account-statements/{statementId}
GET    /api/v1/me/property-units/{propertyUnitId}/balance
GET    /api/v1/me/property-units/{propertyUnitId}/financial-movements
GET    /api/v1/me/account-statements/{statementId}/export
```

---

## 19. Autorización

### 19.1. Reglas generales

Cada endpoint privado requiere:

```text id="6xcf9p"
1. Token válido.
2. UserProfile activo.
3. Tenant activo.
4. Membership activa.
5. Permiso requerido.
6. Recurso dentro del tenant.
7. Si es .own, relación con unidad propia.
```

---

### 19.2. Acceso administrativo

Ejemplos:

```text id="62x04z"
accountStatements.generate
accountStatements.read
accountStatements.publish
accountStatements.close
accountStatements.regenerate
balances.read
balances.recalculate
```

---

### 19.3. Acceso propio

Ejemplos:

```text id="5qkrme"
accountStatements.read.own
balances.read.own
accountStatements.export.own
```

Requiere:

```text id="a3te3x"
UserProfile → Person → PropertyUnit
```

---

### 19.4. Reglas `.own`

Un usuario puede consultar estado o balance de una unidad si:

* es propietario activo;
* es residente activo autorizado;
* cumple la política del tenant.

---

## 20. Auditoría

### 20.1. Eventos auditables

```text id="h105pd"
accountStatement.generated
accountStatement.batchGenerated
accountStatement.published
accountStatement.closed
accountStatement.locked
accountStatement.regenerated
accountStatement.exported
accountStatement.viewedSensitive
balance.calculated
balance.recalculated
balance.snapshotCreated
financialMovements.viewed
```

---

### 20.2. Campos mínimos

```text id="i6ujxz"
tenantId
actorUserId
action
resourceType
resourceId
oldValue
newValue
result
traceId
occurredAt
```

---

### 20.3. Auditoría financiera reforzada

Para operaciones críticas registrar:

```text id="ob810q"
propertyUnitId
billingPeriodId
statementId
openingBalance
closingBalance
outstandingBalance
creditBalance
reason cuando aplique
```

No registrar datos personales innecesarios ni payloads completos.

---

## 21. Eventos de dominio

Eventos sugeridos:

```text id="l8ytvw"
AccountStatementGenerated
AccountStatementBatchGenerated
AccountStatementPublished
AccountStatementClosed
AccountStatementLocked
AccountStatementRegenerated
AccountStatementSuperseded
AccountStatementExported
UnitBalanceCalculated
UnitBalanceRecalculated
BalanceSnapshotCreated
FinancialMovementsViewed
```

---

## 22. Seguridad

### 22.1. Riesgos principales

| Riesgo                                       | Impacto |
| -------------------------------------------- | ------- |
| Estado de cuenta con saldo incorrecto        | Crítico |
| Consultar estado de otra unidad              | Alto    |
| Cross-tenant statement access                | Crítico |
| Usar float para cálculos                     | Alto    |
| Snapshot contradice movimientos base         | Crítico |
| Regenerar statement sin auditoría            | Alto    |
| Publicar estado incorrecto                   | Alto    |
| Exportar datos masivos sin permiso           | Alto    |
| Exponer saldos de otros propietarios         | Alto    |
| Recalcular con pagos reversados como activos | Crítico |
| Omitir cargos válidos                        | Crítico |
| Duplicar líneas de statement                 | Alto    |

---

### 22.2. Controles

* tenantId obligatorio;
* validación de unidad;
* `TenantGuard`;
* `TenantPermissionGuard`;
* `OwnAccountStatementPolicyService`;
* Decimal;
* cálculo reconstruible;
* source references por línea;
* sourceHash opcional;
* snapshots versionados;
* no eliminación física;
* regeneración con motivo;
* auditoría financiera;
* eventos;
* tests de reconstrucción;
* tests multitenant;
* tests de precisión monetaria.

---

## 23. Privacidad

Los estados de cuenta revelan información económica sensible.

Reglas:

* propietarios/residentes solo ven estados de unidades propias;
* no exponer saldos de otras unidades;
* no exponer estados de otro tenant;
* no exponer auditoría interna a usuarios `.own`;
* no registrar payload financiero completo en logs;
* no usar propertyUnitId, statementId o owner data como labels de métricas de alta cardinalidad;
* exportaciones requieren permisos.

---

## 24. Testing

### 24.1. Unit tests

Probar:

* Money;
* BalanceCalculator;
* StatementLineBuilder;
* AccountStatementStatus;
* AccountStatement entity;
* UnitBalance entity;
* BalanceSnapshot entity;
* reglas de suma y resta;
* reglas de reconstrucción.

---

### 24.2. Integration tests

Probar:

* generar statement;
* generar batch;
* crear líneas desde cargos;
* crear líneas desde pagos asignados;
* excluir pagos reversados;
* excluir cargos cancelados/reversados;
* crear snapshot;
* regenerar statement;
* superseded statement;
* constraints por tenant.

---

### 24.3. API tests

Probar:

* Account Statements API;
* Balances API;
* Own Account Statements API;
* exportación básica.

---

### 24.4. Authorization tests

Probar:

* sin token;
* sin permiso;
* sin membership;
* tenant suspendido;
* usuario disabled;
* auditor solo lectura;
* propietario sin `.own`;
* usuario sin relación con unidad.

---

### 24.5. Multitenancy tests

Probar:

* Tenant A no ve statements Tenant B;
* Tenant A no consulta balance Tenant B;
* Tenant A no genera statement de unidad Tenant B;
* Tenant A no exporta statement Tenant B;
* `.own` no devuelve statements de otro tenant.

---

### 24.6. Financial regression tests

Probar:

* saldo inicial correcto;
* cargos aumentan saldo;
* pagos asignados reducen saldo;
* pagos no asignados generan crédito o saldo no asignado según política;
* cargos cancelados no suman;
* cargos reversados no suman;
* pagos reversados no reducen;
* allocations reversadas no reducen;
* statement reconstruible;
* batch idempotente;
* Decimal exacto.

---

## 25. Criterios de aceptación globales

La spec se considera implementada si:

* se calcula balance actual por unidad;
* se calcula balance por periodo;
* se generan estados de cuenta por unidad;
* se generan estados en lote;
* se crean líneas basadas en movimientos reales;
* se publican estados;
* se cierran estados;
* se bloquean estados;
* se regeneran estados con motivo;
* se consulta statement administrativo;
* se consulta statement propio;
* se consultan movimientos financieros;
* se calcula saldo vencido;
* se calcula saldo no vencido;
* se calcula saldo a favor;
* se exporta statement;
* no hay acceso cross-tenant;
* no se usa float;
* montos se exponen como string;
* snapshots no contradicen movimientos base;
* estados publicados son auditables;
* usuarios `.own` solo ven unidades propias;
* operaciones críticas generan auditoría;
* eventos se emiten;
* pruebas unitarias pasan;
* pruebas de integración pasan;
* pruebas API pasan;
* pruebas de autorización pasan;
* pruebas multitenant pasan;
* pruebas financieras pasan;
* OpenAPI está actualizado;
* CI pasa.

---

## 26. Casos borde

| Caso                                         | Resultado esperado                 |
| -------------------------------------------- | ---------------------------------- |
| Generar statement sin periodo                | 422                                |
| Generar statement para unidad de otro tenant | 403/422                            |
| Generar statement sin cargos ni pagos        | statement en cero                  |
| Generar dos veces mismo periodo/unidad       | idempotente o supersede controlado |
| Publicar statement draft                     | 409                                |
| Publicar statement ya published              | 409 o idempotente documentado      |
| Cerrar sin motivo                            | 422                                |
| Bloquear sin permiso                         | 403                                |
| Regenerar locked sin permiso especial        | 403/409                            |
| Regenerar sin motivo                         | 422                                |
| Consultar statement ajeno `.own`             | 404 recomendado                    |
| Consultar balance de unidad ajena            | 404 recomendado                    |
| Exportar statement ajeno                     | 403/404                            |
| Cálculo con pago reversado                   | pago no reduce saldo               |
| Cálculo con allocation reversada             | allocation no reduce saldo         |
| Cálculo con cargo cancelado                  | cargo no suma                      |
| Cálculo con cargo reversado                  | cargo no suma                      |
| Monto con más de dos decimales               | 422                                |
| Tenant suspendido genera statements          | 403                                |
| Intentar borrar statement publicado          | prohibido                          |

---

## 27. Dependencias hacia specs futuras

Este módulo habilita:

```text id="ur63hn"
009-notifications
00X-late-fees
00X-collections
00X-financial-reports
00X-bank-reconciliation
00X-n8n-automations
00X-resident-self-service
```

Especialmente habilita:

* consulta de saldos por propietarios;
* notificación de saldos;
* cobranza;
* reportes de cartera;
* cálculo de mora;
* conciliación contra pagos;
* dashboards financieros;
* automatizaciones de recordatorios.

---

## 28. Archivos derivados esperados

Esta spec debe complementarse con:

```text id="tftcqu"
docs/specs/006-account-statements/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```

---

## 29. Preguntas abiertas

1. ¿El estado de cuenta se calculará siempre en tiempo real o se materializará por periodo?
2. ¿Se publicarán estados solo después de aprobación administrativa?
3. ¿Un usuario propietario podrá ver saldos no publicados o solo statements publicados?
4. ¿Los pagos no asignados se mostrarán como saldo a favor inmediatamente?
5. ¿Se permitirá saldo inicial manual por unidad para migración?
6. ¿Se generará PDF en esta spec o solo exportación JSON/CSV inicial?
7. ¿Los statements cerrados podrán regenerarse con permisos especiales?
8. ¿Qué formato tendrá el número de estado de cuenta?
9. ¿Se permitirá generar statements por bloque, torre o grupo de unidades?
10. ¿El saldo vencido considerará únicamente `dueDate < today` o requiere reglas por tenant?
11. ¿Se bloqueará generación si el periodo financiero está abierto?
12. ¿Se permitirá publicar statements aunque existan pagos pendingValidation?
13. ¿Qué nivel de detalle verá un residente no propietario?
14. ¿Se requiere exportación masiva por periodo en MVP?
15. ¿Se requiere snapshot por cada consulta o solo por generación/publicación?

---

## 30. Decisión inicial para MVP

Para MVP se recomienda:

```text id="p4eq82"
- Calcular balance actual por unidad.
- Generar statements por periodo y unidad.
- Generar batch por periodo para todas las unidades activas.
- Crear AccountStatement y AccountStatementLine materializados al generar.
- Mantener sourceType y sourceId en cada línea.
- Mantener snapshots de balance por generación.
- Permitir publicación manual.
- Permitir cierre manual con motivo.
- Permitir regeneración con motivo y superseded statement.
- Exponer consulta administrativa.
- Exponer consulta propia solo de statements publicados.
- Exponer balance propio actual solo si el tenant lo permite.
- Exportar inicialmente JSON o CSV.
- Diferir PDF avanzado.
- Diferir mora avanzada.
- Diferir notificaciones automáticas.
- Diferir cobranza.
- Diferir conciliación bancaria.
```

---

## 31. Conclusión

El módulo `006-account-statements` convierte cargos y pagos en información financiera entendible para administración, propietarios y residentes autorizados.

Debe priorizar:

```text id="f0yrx2"
precisión monetaria
reconstruibilidad
trazabilidad financiera
auditoría
multitenancy
acceso propio seguro
líneas referenciadas a movimientos fuente
snapshots controlados
publicación controlada
exportación segura
compatibilidad con mora
compatibilidad con cobranza
compatibilidad con reportes financieros
```

No se debe implementar ningún estado de cuenta que no pueda justificarse desde movimientos financieros auditables. Tampoco se debe permitir que un snapshot, exportación o documento publicado contradiga cargos, pagos, ajustes y reversos registrados en los módulos anteriores.
