# Security Notes — Spec 008 Basic Reports and Operational Dashboards

## 1. Información del documento

| Campo           | Valor                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Proyecto        | RESIDENT Core                                                                                                                        |
| Spec ID         | 008                                                                                                                                  |
| Módulo          | Basic Reports                                                                                                                        |
| Documento       | Security Notes                                                                                                                       |
| Ruta            | `docs/specs/008-basic-reports/security-notes.md`                                                                                     |
| Versión         | 0.1                                                                                                                                  |
| Estado          | needs-review                                                                                                                         |
| Fecha           | 2026-07-14                                                                                                                           |
| Documento base  | `docs/specs/008-basic-reports/spec.md`                                                                                               |
| Plan técnico    | `docs/specs/008-basic-reports/plan.md`                                                                                               |
| Modelo de datos | `docs/specs/008-basic-reports/data-model.md`                                                                                         |
| Contrato API    | `docs/specs/008-basic-reports/api-contract.md`                                                                                       |
| Plan de pruebas | `docs/specs/008-basic-reports/test-plan.md`                                                                                          |
| Tareas          | `docs/specs/008-basic-reports/tasks.md`                                                                                              |
| Depende de      | `001-tenants`, `002-users-roles`, `003-residents-properties`, `004-dues-fees`, `005-payments`, `006-account-statements`, `007-audit` |

---

## 2. Propósito

Este documento define las notas de seguridad específicas del módulo `008-basic-reports`.

El módulo de reportes básicos permite consultar información operativa, financiera, administrativa y de actividad del tenant. Aunque es un módulo de solo lectura, maneja datos sensibles porque puede exponer:

* saldos;
* deuda;
* morosidad;
* pagos;
* cargos;
* recaudación;
* unidades habitacionales;
* propietarios;
* residentes;
* actividad administrativa;
* exportaciones CSV/JSON;
* información derivada de auditoría.

Regla central:

```text id="k9vxjr"
Un reporte básico debe exponer únicamente la información necesaria, al usuario autorizado, dentro del tenant correcto, sin modificar datos fuente, sin filtrar información sensible y sin crear una segunda fuente de verdad financiera.
```

---

## 3. Naturaleza de seguridad del módulo

Aunque `008-basic-reports` no registra pagos ni genera cargos, es un módulo de alto impacto porque transforma datos transaccionales en información consolidada.

Un reporte puede revelar más información que una consulta transaccional individual.

Ejemplo:

```text id="u8lna0"
Un pago individual es sensible.
Un reporte completo de morosidad por unidad es aún más sensible.
```

Por lo tanto, el módulo debe tratarse como una superficie crítica de lectura, agregación y exportación.

---

## 4. Principios de seguridad

### 4.1. Read-only estricto

El módulo debe ser estrictamente de consulta.

Prohibido:

```text id="ao4c8f"
crear cargos
modificar cargos
confirmar pagos
rechazar pagos
reversar pagos
asignar pagos
generar estados de cuenta
publicar estados de cuenta
cerrar estados de cuenta
recalcular balances
modificar auditoría
modificar datos personales
```

Permitido:

```text id="g3pfpn"
consultar reportes
filtrar reportes
paginar reportes
ordenar reportes
exportar reportes bajo permiso
auditar exportaciones
registrar logs técnicos sanitizados
emitir métricas
```

---

### 4.2. Tenant isolation obligatorio

Todo reporte debe ejecutarse dentro del tenant activo.

Regla:

```text id="y60dmv"
report.tenantId == currentTenant.id
```

Prohibido:

```text id="ug5h7k"
aceptar tenantId desde query
aceptar tenantId desde body
usar tenantId enviado por cliente como autoridad
mezclar datos de varios tenants
inferir existencia de datos de otro tenant
```

---

### 4.3. Mínimo dato suficiente

Un reporte debe mostrar solo lo necesario para su finalidad.

Ejemplo permitido en reporte de morosidad:

```json id="d6oe7x"
{
  "propertyUnitCode": "Casa 01",
  "overdueBalance": "100.00",
  "daysOverdue": 34
}
```

Ejemplo no permitido por defecto:

```json id="g50xgm"
{
  "propertyUnitCode": "Casa 01",
  "ownerFullName": "Nombre completo",
  "ownerEmail": "correo@example.com",
  "ownerPhone": "0999999999",
  "overdueBalance": "100.00"
}
```

---

### 4.4. Separación de permisos

Los permisos de lectura general no habilitan lectura financiera, personal ni exportación.

Reglas:

```text id="ef4dk6"
reports.read no implica reports.readFinancial
reports.read no implica reports.readPersonalData
reports.read no implica reports.readActivity
reports.read no implica reports.export
reports.readFinancial no implica reports.exportFinancial
reports.readPersonalData no implica reports.exportPersonalData
reports.readActivity no implica reports.exportActivity
```

---

### 4.5. Exportación como operación sensible

Toda exportación debe considerarse operación sensible porque saca información del sistema en formato reutilizable.

Regla:

```text id="b8r7bc"
Toda exportación debe requerir permiso explícito y generar auditoría.
```

---

### 4.6. Dinero con precisión segura

El dinero debe manejarse con Decimal y exponerse como string.

Prohibido:

```text id="dnqrg4"
float
double
number para dinero
redondeo implícito
suma con imprecisión binaria
```

---

### 4.7. No crear segunda fuente de verdad

Los reportes son derivados.

Regla:

```text id="gnj5if"
El módulo reports no debe persistir saldos, deuda, recaudación o morosidad como fuente oficial en MVP.
```

Las fuentes de verdad siguen siendo:

```text id="yb8rs2"
charges
payments
payment_allocations
unit_balances
account_statements
audit_logs
```

---

## 5. Activos protegidos

Activos operativos:

```text id="d3ntmh"
tenant data
property_units
persons
property_ownerships
residencies
leases
vehicles
pets
```

Activos financieros:

```text id="dlks7i"
charges
payments
payment_allocations
unit_balances
account_statements
delinquency information
collection summaries
pending validation payments
```

Activos administrativos:

```text id="izfh3t"
audit_logs
activity reports
user activity
permission changes
administrative actions
```

Activos de exportación:

```text id="mlx4fo"
CSV exports
JSON exports
export filters
export row counts
export audit metadata
```

---

## 6. Datos sensibles por categoría

### 6.1. Datos financieros

Considerar sensibles:

```text id="i5l6a7"
saldo pendiente
saldo vencido
saldo a favor
pagos confirmados
pagos pendientes
pagos rechazados
pagos reversados
cargos emitidos
cargos ajustados
cargos reversados
morosidad
recaudación
porcentaje de recaudación
unidades con deuda
unidades con saldo a favor
```

Permiso requerido:

```text id="sga66y"
reports.readFinancial
```

Exportación financiera:

```text id="txyukd"
reports.exportFinancial
```

---

### 6.2. Datos personales

Considerar sensibles:

```text id="z1odw2"
nombres
identificaciones
emails
teléfonos
direcciones
relaciones propietario-unidad
relaciones residente-unidad
contactos de emergencia
datos familiares
```

Permiso requerido:

```text id="xw0mam"
reports.readPersonalData
```

Exportación de datos personales:

```text id="kryol6"
reports.exportPersonalData
```

---

### 6.3. Datos de actividad administrativa

Considerar sensibles:

```text id="djgjhn"
actorUserId
acciones administrativas
acciones financieras
intentos denegados
cambios de roles
cambios de permisos
eventos de auditoría
resourceId
resourceType
```

Permiso requerido:

```text id="l7rlhc"
reports.readActivity
```

Alternativa permitida:

```text id="xko1ci"
audit.read
```

Exportación de actividad:

```text id="ydptkq"
reports.exportActivity
```

---

### 6.4. Datos no permitidos en reportes MVP

No deben exponerse en reportes básicos:

```text id="dp9ldl"
passwords
passwordHash
tokens
Authorization headers
cookies
secretos
API keys
comprobantes completos
archivos adjuntos
referencias bancarias completas
datos bancarios completos
cédulas completas
teléfonos completos
emails si no están contratados explícitamente
direcciones completas
oldValue/newValue completos de auditoría
metadata completa de auditoría
payloads completos
```

---

## 7. Superficies de ataque

### 7.1. Endpoints de reportes operativos

Ejemplos:

```text id="ib9m32"
GET /api/v1/tenant/reports/operational-overview
GET /api/v1/tenant/reports/property-units
```

Riesgos:

* enumeración de unidades;
* inferencia de ocupación;
* acceso sin membership;
* exposición de saldos si `includeBalances` no se valida;
* mezcla de tenants.

Controles:

* `AuthGuard`;
* `TenantGuard`;
* `TenantPermissionGuard`;
* `reports.read`;
* tenant filtering;
* ocultamiento de saldos sin `reports.readFinancial`;
* paginación.

---

### 7.2. Endpoints financieros

Ejemplos:

```text id="cmweyt"
GET /api/v1/tenant/reports/financial-overview
GET /api/v1/tenant/reports/delinquency
GET /api/v1/tenant/reports/collections/summary
```

Riesgos:

* exposición de deuda;
* exposición de recaudación;
* exposición de pagos pendientes;
* cálculos incorrectos;
* uso de datos reversados como activos;
* uso de cargos cancelados como deuda;
* acceso de board/residentes sin permiso.

Controles:

* `reports.readFinancial`;
* Decimal;
* reglas de exclusión financiera;
* financial regression tests;
* no datos personales por defecto;
* auditoría de exportación.

---

### 7.3. Endpoints de datos personales

Ejemplo:

```text id="kj5hpa"
GET /api/v1/tenant/reports/residents-owners
```

Riesgos:

* exposición de nombres;
* exposición de relaciones familiares o de residencia;
* exposición de contactos;
* exportación masiva de personas;
* uso indebido de listas de residentes.

Controles:

* `reports.readPersonalData`;
* `reports.exportPersonalData`;
* minimización de columnas;
* paginación;
* rate limiting;
* auditoría de exportación;
* no incluir identificación/email/teléfono en MVP.

---

### 7.4. Endpoint de actividad administrativa

Ejemplo:

```text id="mb88xk"
GET /api/v1/tenant/reports/activity
```

Riesgos:

* exposición de actividad sensible;
* exposición de actores;
* inferencia de errores o accesos denegados;
* filtrado excesivo de auditoría;
* duplicación insegura de Audit API.

Controles:

* `reports.readActivity` o `audit.read`;
* no exponer `oldValue`;
* no exponer `newValue`;
* no exponer `metadata` completa;
* permisos de auditoría si se profundiza;
* paginación.

---

### 7.5. Endpoint de exportación

Ejemplo:

```text id="w6m9yi"
GET /api/v1/tenant/reports/{reportKey}/export
```

Riesgos:

* exportación sin permiso;
* exportación financiera por usuario no autorizado;
* exportación de datos personales;
* CSV injection;
* exfiltración masiva;
* logs con contenido exportado;
* exportación de Tenant B.

Controles:

* `reports.export`;
* permisos específicos por categoría;
* `REPORTS_MAX_EXPORT_ROWS`;
* CSV injection protection;
* auditoría;
* filtros validados;
* tenant isolation;
* no loggear export completo.

---

## 8. Amenazas principales

## 8.1. Reporte cross-tenant

### Descripción

Un usuario de Tenant A consulta o exporta datos de Tenant B.

### Impacto

Crítico.

### Controles

```text id="ig5gw5"
TenantGuard
tenantId desde contexto servidor
filtro obligatorio tenant_id
no aceptar tenantId desde cliente
multitenancy tests
repository tests
API tests
```

### Pruebas asociadas

```text id="iodqme"
MT-REP-001 a MT-REP-010
```

---

## 8.2. Exposición financiera no autorizada

### Descripción

Un usuario sin permiso financiero consulta saldos, deuda, pagos o recaudación.

### Impacto

Alto.

### Controles

```text id="p70sf3"
reports.readFinancial
FinancialReportGuard
ReportPermissionPolicyService
DTO filtering
authorization tests
```

### Pruebas asociadas

```text id="br43rp"
AUTH-REP-FIN
API-REP-FINSET
```

---

## 8.3. Exposición de datos personales

### Descripción

Un reporte revela nombres, identificaciones, emails, teléfonos o relaciones personales sin permiso.

### Impacto

Alto.

### Controles

```text id="mm5alt"
reports.readPersonalData
reports.exportPersonalData
PersonalDataReportGuard
minimización de columnas
personal data tests
```

### Pruebas asociadas

```text id="ipz49y"
PDATA-REP-001 a PDATA-REP-008
```

---

## 8.4. Exportación no autorizada

### Descripción

Un usuario con permiso de lectura exporta sin permiso de exportación.

### Impacto

Alto.

### Controles

```text id="stuwt6"
reports.export
reports.exportFinancial
reports.exportPersonalData
reports.exportActivity
ReportExportGuard
separation-of-duties tests
```

### Pruebas asociadas

```text id="x63jpt"
AUTH-REP-EXP
AUTH-REP-SOD
EXP-REP
```

---

## 8.5. CSV injection

### Descripción

Un valor exportado a CSV se interpreta como fórmula en una hoja de cálculo.

### Ejemplos

```text id="is1dj8"
=cmd
+SUM(1,1)
-10+20
@HYPERLINK(...)
=IMPORTXML(...)
```

### Impacto

Alto.

### Controles

```text id="tlccvm"
CSV sanitizer
neutralización de celdas
tests CSV-REP
revisión de export adapter
```

### Pruebas asociadas

```text id="yhbm7c"
CSV-REP-001 a CSV-REP-008
```

---

## 8.6. Cálculo financiero incorrecto

### Descripción

El reporte muestra deuda, recaudación o saldo incorrectos.

### Causas típicas

```text id="h1k40y"
incluir cargos cancelados como deuda activa
incluir cargos reversados como deuda activa
incluir pagos reversados como recaudación
incluir allocations reversadas como pagos aplicados
mezclar pagos no asignados con pagos aplicados
usar float
usar saldos stale sin advertencia
```

### Impacto

Alto.

### Controles

```text id="ff77ae"
ReportMoneyService
Decimal
financial regression tests
uso de unit_balances
uso de account_statements
warnings para stale balances
```

### Pruebas asociadas

```text id="tfr7o4"
FIN-REP-CHG
FIN-REP-PAY
FIN-REP-BAL
FIN-REP-COLL
FIN-REP-DELINQ
```

---

## 8.7. Reporte modifica datos fuente

### Descripción

Una consulta de reporte dispara una operación transaccional.

### Impacto

Crítico.

### Controles

```text id="w4ui68"
servicios read-only
puertos reader
no write repositories
read-only behavior tests
revisión de PR
```

### Pruebas asociadas

```text id="gocxe3"
RO-REP-001 a RO-REP-009
```

---

## 8.8. Logs con datos sensibles

### Descripción

El sistema registra en logs el resultado completo del reporte, export CSV, datos personales o información financiera detallada.

### Impacto

Alto.

### Controles

```text id="i8wh65"
logging policy
logs estructurados mínimos
no loggear response completa
no loggear export completo
observability tests
```

### Pruebas asociadas

```text id="qd5dxf"
OBS-REP-006 a OBS-REP-012
```

---

## 8.9. Sort/filter injection

### Descripción

Un usuario envía `sortBy` o filtros que terminan interpolados en SQL.

### Impacto

Alto.

### Controles

```text id="uh8rcb"
sort whitelist
query params validados
bind parameters
no string concatenation en raw SQL
repository tests
DTO tests
```

---

## 8.10. Reportes demasiado amplios

### Descripción

Un usuario ejecuta consultas sin filtros sobre grandes volúmenes de información.

### Impacto

Medio/alto.

### Controles

```text id="d5dpsr"
paginación
pageSize <= 100
maxExportRows
date range máximo
rate limiting
filtros requeridos para exportaciones grandes
```

---

## 9. Controles por endpoint

## 9.1. Operational Overview

Endpoint:

```text id="no96j5"
GET /api/v1/tenant/reports/operational-overview
```

Controles:

```text id="s3yx54"
AuthGuard
TenantGuard
reports.read
tenantId filter
no datos personales detallados
no saldos financieros
rate limiting básico
```

---

## 9.2. Financial Overview

Endpoint:

```text id="zmtdad"
GET /api/v1/tenant/reports/financial-overview
```

Controles:

```text id="xvzk3q"
AuthGuard
TenantGuard
reports.readFinancial
Decimal
money as string
excluir cancelados/reversados
excluir pagos reversados
warnings para stale balances
```

---

## 9.3. Property Units Report

Endpoint:

```text id="vco12h"
GET /api/v1/tenant/reports/property-units
```

Controles:

```text id="qkjsfm"
reports.read
reports.readFinancial si includeBalances=true
tenantId filter
paginación
sort whitelist
no datos personales detallados
```

---

## 9.4. Residents Owners Report

Endpoint:

```text id="pzpr2m"
GET /api/v1/tenant/reports/residents-owners
```

Controles:

```text id="rz7vgh"
reports.readPersonalData
tenantId filter
minimización de columnas
no identificación completa
no email/teléfono en MVP
paginación
rate limiting reforzado
```

---

## 9.5. Charges Summary

Endpoint:

```text id="mc3xkd"
GET /api/v1/tenant/reports/charges/summary
```

Controles:

```text id="ev9351"
reports.readFinancial
tenantId filter
Decimal
excluir cancelados/reversados de deuda activa
money as string
```

---

## 9.6. Payments Summary

Endpoint:

```text id="z9esfk"
GET /api/v1/tenant/reports/payments/summary
```

Controles:

```text id="ilcdba"
reports.readFinancial
tenantId filter
no comprobantes completos
excluir pagos reversados
separar unallocated
Decimal
```

---

## 9.7. Pending Payment Validation

Endpoint:

```text id="gcb5qk"
GET /api/v1/tenant/reports/payments/pending-validation
```

Controles:

```text id="gqn3y3"
reports.readFinancial
tenantId filter
no archivo de comprobante
no datos bancarios completos
paginación
sort whitelist
```

---

## 9.8. Balances Summary

Endpoint:

```text id="jlswc4"
GET /api/v1/tenant/reports/balances/summary
```

Controles:

```text id="ossp9h"
reports.readFinancial
tenantId filter
unit_balances como fuente
stale warning
money as string
```

---

## 9.9. Account Statements Summary

Endpoint:

```text id="nrlr8q"
GET /api/v1/tenant/reports/account-statements/summary
```

Controles:

```text id="p4l3ez"
reports.readFinancial
tenantId filter
distinguir estados
superseded separado
archived excluido por defecto
money as string
```

---

## 9.10. Delinquency Report

Endpoint:

```text id="fi50s1"
GET /api/v1/tenant/reports/delinquency
```

Controles:

```text id="f8p4b2"
reports.readFinancial
tenantId filter
no datos personales por defecto
no intereses en MVP
no cobranza automática
paginación
sort whitelist
```

---

## 9.11. Collection Summary

Endpoint:

```text id="yzujs0"
GET /api/v1/tenant/reports/collections/summary
```

Controles:

```text id="kfi81n"
reports.readFinancial
tenantId filter
collectionRate documentado
chargesIssued = 0 => null
Decimal
money as string
```

---

## 9.12. Activity Report

Endpoint:

```text id="vxtfsq"
GET /api/v1/tenant/reports/activity
```

Controles:

```text id="wzz26x"
reports.readActivity o audit.read
tenantId filter
no oldValue completo
no newValue completo
no metadata completa
paginación
category filtering
```

---

## 9.13. Export Report

Endpoint:

```text id="ntcihv"
GET /api/v1/tenant/reports/{reportKey}/export
```

Controles:

```text id="c88kz0"
reports.export
permiso específico por categoría
maxExportRows
CSV sanitizer
tenantId filter
auditoría obligatoria
no loggear contenido completo
```

---

## 10. Reglas de permisos

### 10.1. Permisos generales

```text id="qq2mox"
reports.read
reports.export
```

---

### 10.2. Permisos financieros

```text id="bw0a2n"
reports.readFinancial
reports.exportFinancial
```

---

### 10.3. Permisos personales

```text id="or2yzr"
reports.readPersonalData
reports.exportPersonalData
```

---

### 10.4. Permisos de actividad

```text id="v7a0ca"
reports.readActivity
reports.exportActivity
```

Alternativa de lectura:

```text id="zd6zya"
audit.read
```

---

### 10.5. Matriz de acceso

| Reporte                    | Lectura                               | Exportación                  |
| -------------------------- | ------------------------------------- | ---------------------------- |
| Operational Overview       | `reports.read`                        | `reports.export`             |
| Property Units sin saldos  | `reports.read`                        | `reports.export`             |
| Property Units con saldos  | `reports.readFinancial`               | `reports.exportFinancial`    |
| Residents Owners           | `reports.readPersonalData`            | `reports.exportPersonalData` |
| Financial Overview         | `reports.readFinancial`               | `reports.exportFinancial`    |
| Charges Summary            | `reports.readFinancial`               | `reports.exportFinancial`    |
| Payments Summary           | `reports.readFinancial`               | `reports.exportFinancial`    |
| Pending Payment Validation | `reports.readFinancial`               | `reports.exportFinancial`    |
| Balances Summary           | `reports.readFinancial`               | `reports.exportFinancial`    |
| Account Statements Summary | `reports.readFinancial`               | `reports.exportFinancial`    |
| Delinquency                | `reports.readFinancial`               | `reports.exportFinancial`    |
| Collection Summary         | `reports.readFinancial`               | `reports.exportFinancial`    |
| Activity                   | `reports.readActivity` o `audit.read` | `reports.exportActivity`     |

---

## 11. Reglas de datos financieros

### 11.1. Dinero

Todos los cálculos financieros deben usar Decimal.

API:

```text id="mtbnrn"
string decimal
```

Ejemplo:

```json id="k8do25"
{
  "overdueBalance": "100.00"
}
```

---

### 11.2. Cargos cancelados

No deben contar como deuda activa.

---

### 11.3. Cargos reversados

No deben contar como deuda activa.

---

### 11.4. Pagos reversados

No deben contar como recaudación activa ni como reducción de deuda.

---

### 11.5. Allocations reversadas

No deben contar como pagos aplicados.

---

### 11.6. Pagos no asignados

Deben mostrarse separados.

Regla:

```text id="x6qgic"
unallocatedPayments no debe mezclarse con allocatedPayments.
```

---

### 11.7. Balances stale

Si existen saldos stale, el reporte debe incluir advertencia.

Código:

```text id="z11csd"
STALE_BALANCES_PRESENT
```

---

### 11.8. Collection rate

Fórmula MVP:

```text id="eq9frf"
collectionRate = totalAllocatedPayments / chargesIssued
```

Si `chargesIssued = 0`:

```text id="k8tx3p"
collectionRate = null
```

---

## 12. Reglas de datos personales

### 12.1. Reportes personales

Requieren:

```text id="n19fk7"
reports.readPersonalData
```

---

### 12.2. Exportación personal

Requiere:

```text id="l1xli9"
reports.exportPersonalData
```

---

### 12.3. Campos permitidos MVP

```text id="mlc4vu"
personId
displayName
relationshipType
propertyUnitId
propertyUnitCode
status
startDate
endDate
```

---

### 12.4. Campos no permitidos MVP

```text id="mf88aq"
identificación completa
email
teléfono
dirección
contactos de emergencia
datos familiares completos
datos bancarios
documentos personales
```

---

### 12.5. Reportes financieros con unidad

El reporte de morosidad puede mostrar:

```text id="vkgk53"
propertyUnitCode
overdueBalance
outstandingBalance
daysOverdue
```

No debe mostrar por defecto:

```text id="gl7915"
nombre del propietario
email del propietario
teléfono del propietario
identificación del propietario
```

---

## 13. Reglas de exportación segura

### 13.1. Formatos permitidos

```text id="ikwuox"
json
csv
```

Diferidos:

```text id="b7saft"
pdf
xlsx
html
xml
```

---

### 13.2. Permisos de exportación

Toda exportación requiere:

```text id="t8is36"
reports.export
```

y, según categoría:

```text id="go0h37"
reports.exportFinancial
reports.exportPersonalData
reports.exportActivity
```

---

### 13.3. Límite de filas

Variable recomendada:

```text id="zlgnuy"
REPORTS_MAX_EXPORT_ROWS
```

Valor inicial sugerido:

```text id="wdubzz"
10000
```

---

### 13.4. CSV injection

Neutralizar valores que comiencen con:

```text id="oy8m3n"
=
+
-
@
```

Aplica a:

```text id="bc7p7f"
unitCode
displayName
propertyUnitCode
chargeConceptName
method
receiptStatus
reportedBy
action
category
resourceType
outcome
metadata serializada
```

---

### 13.5. Auditoría de exportación

Toda exportación debe registrar:

```text id="v7g5q1"
tenantId
actorUserId
reportKey
format
filters sanitizados
rowCount
result
traceId
```

No registrar:

```text id="l223wv"
CSV completo
JSON completo
resultado completo
datos personales innecesarios
payload completo
```

---

## 14. Reglas de logs y métricas

### 14.1. Logs permitidos

```text id="k8pq0n"
traceId
requestId
reportKey
category
outcome
durationMs
rowCount
errorCode
```

---

### 14.2. Logs prohibidos

```text id="ejijmb"
CSV completo
JSON completo
resultado completo
datos personales completos
datos financieros detallados innecesarios
tokens
Authorization header
cookies
payload completo
SQL completo con parámetros sensibles
stack trace en producción
```

---

### 14.3. Métricas permitidas

```text id="w1zf2w"
reports_query_total
reports_query_failed_total
reports_export_total
reports_export_failed_total
reports_access_denied_total
reports_query_latency_ms
reports_export_latency_ms
```

Labels permitidos:

```text id="x9owfz"
reportKey
category
outcome
scope
```

Labels prohibidos:

```text id="dwcj0k"
tenantId
actorUserId
propertyUnitId
resourceId
traceId
requestId
ipAddress
userAgent
```

---

## 15. Reglas de errores seguros

### 15.1. Error estándar

```json id="luhiur"
{
  "error": {
    "code": "REPORT_FORBIDDEN",
    "message": "You are not allowed to access this report.",
    "details": {},
    "traceId": "req_123456"
  }
}
```

---

### 15.2. No exponer

```text id="r7y98t"
SQL
stack trace
Prisma raw error
detalles internos de autorización
existencia de recursos de otro tenant
payload completo
tokens
secretos
```

---

### 15.3. Cross-tenant

Si se referencia recurso de otro tenant, preferir:

```text id="d3a8cv"
404 NOT_FOUND
```

o:

```text id="l4wd7g"
403 REPORT_CROSS_TENANT_REFERENCE
```

según política de enumeración.

Para evitar enumeración, se recomienda `404` cuando el recurso sea consultado de forma directa.

---

## 16. Reglas de consultas SQL / Prisma

### 16.1. `$queryRaw` permitido con restricciones

Permitido si:

```text id="ujthlu"
usa parámetros bind
filtra tenantId
no concatena input de usuario
sortBy viene de whitelist
tiene tests
está encapsulado en repositorio
```

---

### 16.2. Prohibido

```text id="q5s05d"
concatenar SQL con query params
usar sortBy sin whitelist
usar tenantId del cliente
omitir tenant filter
usar SELECT * en reportes sensibles
retornar entidades completas cuando solo se necesitan columnas
```

---

## 17. Reglas de rate limiting

Aplicar rate limiting a todos los endpoints de reportes.

Rate limit reforzado para:

```text id="l6wja5"
reportes financieros
reportes de datos personales
activity report
exportaciones
```

Objetivos:

* evitar scraping;
* evitar exfiltración masiva;
* evitar abuso de exportaciones;
* proteger disponibilidad;
* reducir enumeración.

---

## 18. Reglas de CORS

No permitir CORS abierto en producción.

Prohibido:

```text id="g97jfo"
Access-Control-Allow-Origin: *
```

Permitir únicamente orígenes oficiales de RESIDENT.

---

## 19. Auditoría del módulo

### 19.1. Eventos obligatorios

Toda exportación debe auditarse.

Eventos:

```text id="xbqj82"
report.exported
financialReport.exported
personalDataReport.exported
activityReport.exported
```

---

### 19.2. Eventos recomendados

Consultas sensibles:

```text id="vz7pbf"
financialReport.viewed
personalDataReport.viewed
activityReport.viewed
report.viewedSensitive
```

Accesos denegados:

```text id="nkvkno"
report.accessDenied
financialReport.accessDenied
personalDataReport.accessDenied
activityReport.accessDenied
```

---

### 19.3. Metadata permitida

```json id="dy4ppw"
{
  "reportKey": "financialOverview",
  "format": "csv",
  "filters": {
    "periodCode": "2026-07"
  },
  "rowCount": 60,
  "result": "success"
}
```

---

### 19.4. Metadata prohibida

```text id="aa63gi"
resultado completo
filas completas
CSV completo
JSON completo exportado
datos personales innecesarios
comprobantes completos
payload completo
```

---

## 20. Reglas de OpenAPI seguro

OpenAPI debe documentar:

```text id="wj5e2m"
permisos requeridos
categoría del reporte
tenant scope
read-only
money as string
paginación
formatos de exportación
errores
CSV injection protection
auditoría de exportación
```

OpenAPI no debe documentar:

```text id="sc1weo"
POST /reports
PUT /reports
PATCH /reports
DELETE /reports
endpoints para crear snapshots en MVP
endpoints para programar reportes en MVP
endpoints PDF en MVP
```

---

## 21. Pruebas de seguridad obligatorias

Deben existir pruebas para:

```text id="wc5ryj"
- sin token devuelve 401;
- sin membership devuelve 403;
- sin reports.read devuelve 403;
- sin reports.readFinancial devuelve 403 en financieros;
- sin reports.readPersonalData devuelve 403 en personales;
- sin reports.readActivity/audit.read devuelve 403 en activity;
- sin reports.export devuelve 403 en export;
- sin reports.exportFinancial devuelve 403 en export financiero;
- sin reports.exportPersonalData devuelve 403 en export personal;
- Tenant A no ve Tenant B;
- Tenant A no exporta Tenant B;
- tenantId enviado por query es rechazado o ignorado de forma segura;
- billingPeriodId de otro tenant falla;
- propertyUnitId de otro tenant falla;
- dinero sale como string;
- no se usa float;
- cargos cancelados no cuentan como deuda activa;
- pagos reversados no cuentan como recaudación activa;
- CSV injection neutralizado;
- reportes no modifican datos fuente;
- exportación se audita;
- logs no contienen export completo;
- OpenAPI no documenta endpoints de escritura.
```

---

## 22. Checklist de seguridad para PR

Antes de aprobar un PR de `008-basic-reports`:

```text id="hu5ybq"
[ ] Módulo es read-only.
[ ] No crea cargos.
[ ] No modifica cargos.
[ ] No modifica pagos.
[ ] No recalcula balances.
[ ] No genera estados de cuenta.
[ ] No modifica audit_logs.
[ ] Todos los reportes filtran por tenantId.
[ ] tenantId no se acepta desde query/body.
[ ] Reports reader recibe tenantId desde contexto seguro.
[ ] Reportes financieros requieren reports.readFinancial.
[ ] Reportes personales requieren reports.readPersonalData.
[ ] Activity requiere reports.readActivity o audit.read.
[ ] Export requiere reports.export.
[ ] Export financiero requiere reports.exportFinancial.
[ ] Export personal requiere reports.exportPersonalData.
[ ] Export activity requiere reports.exportActivity.
[ ] Exportaciones se auditan.
[ ] Metadata de auditoría no contiene resultado completo.
[ ] Montos usan Decimal.
[ ] Montos salen como string.
[ ] No se usa float para dinero.
[ ] Cargos cancelados no suman deuda activa.
[ ] Cargos reversados no suman deuda activa.
[ ] Pagos reversados no suman recaudación activa.
[ ] Allocations reversadas no suman pagos aplicados.
[ ] Pagos no asignados se muestran separados.
[ ] Saldos stale generan warning.
[ ] Reportes personales no exponen cédula/email/teléfono en MVP.
[ ] Reportes de morosidad no muestran propietario por defecto.
[ ] Reportes detallados paginan.
[ ] pageSize máximo 100.
[ ] sortBy usa whitelist.
[ ] `$queryRaw` usa parámetros bind.
[ ] No hay SQL concatenado con input de usuario.
[ ] Export respeta columnas permitidas.
[ ] CSV injection neutralizado.
[ ] Logs no contienen CSV completo.
[ ] Logs no contienen JSON completo.
[ ] Logs no contienen datos personales innecesarios.
[ ] Métricas no usan tenantId/actorUserId/propertyUnitId.
[ ] Rate limiting aplicado.
[ ] CORS no está abierto.
[ ] OpenAPI actualizado.
[ ] OpenAPI no documenta POST/PUT/PATCH/DELETE.
[ ] Tests de autorización pasan.
[ ] Tests multitenant pasan.
[ ] Tests financieros pasan.
[ ] Tests de export pasan.
[ ] Tests CSV injection pasan.
[ ] Tests read-only pasan.
[ ] CI pasa.
```

---

## 23. Riesgos residuales aceptados en MVP

| Riesgo                 | Estado                 | Justificación                               |
| ---------------------- | ---------------------- | ------------------------------------------- |
| Sin report snapshots   | Aceptado temporalmente | MVP calcula bajo demanda                    |
| Sin materialized views | Aceptado temporalmente | Optimización futura según métricas          |
| Sin data warehouse     | Aceptado temporalmente | No requerido para tenants pequeños/medianos |
| Sin PDF avanzado       | Aceptado temporalmente | MVP soporta JSON/CSV                        |
| Sin envío automático   | Aceptado temporalmente | Requiere specs de comunicación/jobs         |
| Sin report templates   | Aceptado temporalmente | Constructor de reportes fuera de alcance    |
| Sin BI avanzado        | Aceptado temporalmente | MVP cubre reportes básicos                  |
| Sin IA para reportes   | Aceptado temporalmente | Requiere privacidad y anonimización         |

---

## 24. Pendientes de seguridad para specs futuras

### 24.1. `00X-report-snapshots`

Debe cubrir:

```text id="mpwz1a"
persistencia de resultados
hash de resultado
estado oficial del snapshot
auditoría de generación
control de acceso
retención
```

---

### 24.2. `00X-report-exports`

Debe cubrir:

```text id="dlraom"
almacenamiento de archivos exportados
expiración
descargas autorizadas
auditoría de descarga
eliminación segura
```

---

### 24.3. `00X-scheduled-reports`

Debe cubrir:

```text id="pyhjhb"
programación
destinatarios
permisos al momento de envío
logs de delivery
errores
revocación de suscripción
```

---

### 24.4. `00X-report-documents`

Debe cubrir:

```text id="zpbhxq"
PDF
plantillas
branding
firma
marcas de agua
control de descarga
```

---

### 24.5. `00X-ai-assisted-reports`

Debe cubrir:

```text id="q0mzuw"
anonimización
minimización
resúmenes IA
política de datos
no envío de datos sensibles a proveedores externos sin autorización
```

---

### 24.6. `00X-accounting-reports`

Debe cubrir:

```text id="fprohe"
modelo contable
cuentas
asientos
cierres
reportes formales
conciliación con módulo financiero
```

---

## 25. Criterios de aceptación de seguridad

La spec `008-basic-reports` cumple seguridad si:

* todos los reportes son read-only;
* ningún reporte modifica datos fuente;
* todos los reportes filtran por tenant activo;
* no se acepta `tenantId` desde cliente;
* los reportes financieros requieren permiso financiero;
* los reportes personales requieren permiso personal;
* los reportes de actividad requieren permiso de actividad o auditoría;
* las exportaciones requieren permiso separado;
* las exportaciones financieras requieren permiso financiero de exportación;
* las exportaciones personales requieren permiso personal de exportación;
* las exportaciones se auditan;
* los montos usan Decimal;
* los montos salen como string;
* no se usa float para dinero;
* cargos cancelados/reversados no cuentan como deuda activa;
* pagos reversados no cuentan como recaudación activa;
* allocations reversadas no cuentan como pagos aplicados;
* pagos no asignados se muestran separados;
* saldos stale generan warning;
* reportes personales minimizan datos;
* reportes de morosidad no exponen propietarios por defecto;
* exportaciones respetan columnas permitidas;
* CSV injection está neutralizado;
* logs no contienen resultado completo;
* métricas no usan alta cardinalidad;
* OpenAPI no expone operaciones de escritura;
* tests de seguridad pasan;
* CI pasa.

---

## 26. Decisión final de seguridad

El módulo `008-basic-reports` será tratado como una superficie crítica de lectura y exportación.

La seguridad del módulo se basa en:

```text id="yk20xj"
read-only behavior
tenant isolation
permissioned reports
financial permission separation
personal data permission separation
activity report permission separation
export permission separation
Decimal money
money as string
financial regression controls
safe filters
sort whitelisting
pagination
CSV injection protection
export auditing
minimal logging
safe metrics
OpenAPI consistency
```

La implementación no será aceptada si permite reportes cross-tenant, modifica datos fuente, usa float para dinero, expone datos personales sin permiso, exporta sin permiso, omite auditoría de exportación, incluye cargos cancelados como deuda activa, incluye pagos reversados como recaudación activa, mezcla pagos no asignados con pagos aplicados, expone `oldValue/newValue/metadata` completos de auditoría o permite CSV vulnerable a fórmula injection.
