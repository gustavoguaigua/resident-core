# Sprint 3 — Residentes, propiedades y finanzas base

## 1. Estado del documento

- Estado: `authoritative`
- Readiness vigente: `GO`
- Fase activa: `4 — dues-fees-foundation; PASS`
- Fecha: 2026-09-04

Este documento es el runbook canónico de Sprint 3. Define la única frontera funcional,
el ownership entre módulos, la secuencia incremental y los gates necesarios para
autorizar implementación. La compuerta emitió `GO` en fase 0 y las Fases 1 a 4
quedaron completadas con `PASS`; la siguiente implementación permitida es
exclusivamente la Fase 5, elevando el manifest junto con sus artefactos y gate.

## 2. Objetivo

Construir el registro tenant-scoped de personas, residentes, propietarios y unidades y,
sobre esa base, el flujo financiero mínimo y auditable:

```text
PropertyUnit -> Charge -> PaymentAllocation -> UnitBalance -> AccountStatement
                       \-> Payment -> PaymentReceipt -> SecureDocumentStorage
```

Los movimientos financieros son la fuente de verdad. Los saldos y estados de cuenta
son reconstruibles. Toda operación crítica preserva tenant isolation, autorización Core,
precisión decimal, idempotencia, historial no destructivo y auditoría durable.

## 3. Fuentes normativas

1. `AGENTS.md`.
2. ADR aceptados, especialmente ADR-001, ADR-003, ADR-004, ADR-007, ADR-009,
   ADR-010, ADR-011 y ADR-012.
3. Specs 003, 004, 005, 006 y 016 una vez normalizadas a `accepted`.
4. Slice Audit base de Spec 007 y
   `docs/changes/GAP-S2-007-AUDIT-BASE-SEMANTICS-2026-08-13.md`.
5. Ownership de Tenant Settings definido por Spec 025 y
   `docs/changes/GAP-S2-006-CONFIGURATION-PRISMA-OWNERSHIP-2026-08-13.md`.
6. Este runbook y la decisión vigente en
   `docs/changes/READINESS-SPRINT-3-2026-08-28.md`.
7. Ledger transversal de idempotencia definido por
   `docs/changes/GAP-S3-010-IDEMPOTENCY-LEDGER-CONTRACT-2026-09-02.md`.

## 4. Condiciones previas para `GO`

Antes de implementar la Fase 1 deben cumplirse simultáneamente:

1. cero gaps críticos o altos abiertos;
2. los 35 documentos aplicables de Specs 003, 004, 005, 006 y 016 están `accepted`;
3. ownership Prisma, API, permisos, settings y auditoría tiene un único contrato;
4. los estados, transiciones, idempotencia y atomicidad financiera están cerrados;
5. el límite DB/object storage y sus compensaciones están definidos;
6. el manifest conserva `currentPhase = 0` hasta la reevaluación formal;
7. `pnpm sprint3:boundary` pasa desde un checkout limpio;
8. una reevaluación separada cambia formalmente `NO_GO` a `GO`.

## 5. Frontera funcional única

### 5.1 Residents and Properties — Spec 003

Incluye exactamente `Person`, `LegalEntity`, `PropertyUnit`, `PropertyOwnership`,
`Residency` y `Lease`, con vínculo opcional y único por tenant
`UserProfile -> Person`. Spec 003 es owner de esos seis modelos; Specs 001/002 conservan
el ownership de `Tenant`, `UserProfile`, memberships y autorización. Expone a los
módulos financieros únicamente puertos tenant-aware de lectura de unidad, ownership y
residencia.

El contrato de modelos, relaciones, estados, invariantes tenant y resolución `.own`
está cerrado por
`docs/changes/GAP-S3-002-RESIDENTS-PROPERTIES-OWNERSHIP-2026-08-29.md`. Vehículos,
mascotas, contactos de emergencia y modelos especiales para menores quedan fuera de
Sprint 3. La identificación es opcional y tenant-scoped; `.own` es sólo lectura y
falla cerrada. La superficie API y los permisos exactos están cerrados por GAP-S3-006
y GAP-S3-007.

### 5.2 Dues and Fees — Spec 004

Es owner de conceptos, calendarios, asignaciones por unidad, periodos, lotes, cargos,
ajustes y reversos de cargos. La generación mensual es explícita e idempotente. No
registra pagos, asignaciones de pago, saldos independientes ni estados de cuenta.

El contrato financiero cross-slice está cerrado en
`docs/changes/GAP-S3-003-FINANCIAL-CROSS-SLICE-SEMANTICS-2026-08-29.md`. Un cargo
emitido es inmutable; cancelación sólo aplica antes de emitir y toda corrección
posterior usa adjustment o reversal append-only.

### 5.3 Payments — Spec 005

Es owner de pagos, validación, asignaciones y reversos de pago. Un pago y sus
asignaciones pertenecen a un solo tenant y una sola unidad. No crea ni modifica cargos
fuera de los puertos autorizados y no usa Keycloak como fuente de permisos.

`PaymentReceipt` conserva la relación de negocio; el binario, hash y storage key
pertenecen exclusivamente a Secure Document Storage. GAP-S3-005 fija
`secureDocumentId` como referencia única, un receipt por pago y versionado documental
para una recarga rechazada; Payments no duplica metadata física ni conoce el provider.

Allocations y reversos se serializan con locks tenant-scoped, son idempotentes y se
confirman atómicamente con estados derivados, invalidación de proyecciones y Audit. Un
pago confirmado no reduce un cargo hasta tener una allocation activa.

### 5.4 Account Statements — Spec 006

Es owner de la proyección materializada de estados de cuenta, líneas, balances y
snapshots autorizados. No es fuente primaria de verdad financiera: debe poder
reconstruirse desde cargos, ajustes, reversos, pagos y asignaciones.

Statements y snapshots son inmutables. La regeneración crea una versión superseding;
no reescribe statements cerrados o bloqueados. Los pagos no asignados se muestran por
separado y nunca se cuentan dos veces ni reducen cargos sin allocation.

### 5.5 Secure Document Storage — Spec 016

Es owner de documento lógico, versiones, archivos físicos, metadata de storage, hash,
clasificación y acceso técnico. El storage es privado, tenant-scoped y no expone
`storageKey`. MinIO es únicamente el adaptador local; producción usa el puerto
S3-compatible conforme a ADR-009.

Sprint 3 sólo integra comprobantes de pago. Integraciones propuestas con multas,
comunicaciones, actas, reportes u otros dominios futuros quedan fuera.

Secure Document Storage se implementa primero y no depende de modelos de Payments.
Expone un puerto tenant-scoped para upload temporal, validación, promoción, lectura y
compensación. Payments aporta después la validación del recurso origen. PostgreSQL
gobierna el estado; fallos entre DB y object storage nunca devuelven éxito, ejecutan
compensación y dejan cualquier objeto residual identificado para reconciliación segura.
El contrato completo está en
`docs/changes/GAP-S3-005-PAYMENTS-DOCUMENT-STORAGE-BOUNDARY-2026-08-29.md`.

La política operativa exacta está cerrada por
`docs/changes/GAP-S3-008-FILE-SECURITY-OPERATING-POLICY-2026-08-30.md`: sólo admite
comprobantes PDF/JPEG/PNG de hasta 10 MiB, `scanStatus = NOT_REQUIRED`, descarga privada,
MinIO local, adapter S3-compatible cifrado no local y ausencia de purga documental.
Antivirus real y categorías de otros dominios permanecen fuera de Sprint 3.

### 5.6 Audit — Spec 007

Reutiliza el único `AuditLog` append-only de Sprint 2. Cada módulo productor declara el
hecho; Audit posee catálogo, sanitización y persistencia. Las mutaciones críticas DB
incluyen auditoría en la misma transacción PostgreSQL. No se crean tablas de auditoría
paralelas ni se habilitan consulta, exportación o reporting de Audit.

El catálogo exacto de permisos, asignaciones a los nueve roles tenant base, separación
de funciones, acciones, recursos, actores, metadata y atomicidad está cerrado por
`docs/changes/GAP-S3-007-PERMISSIONS-AUDIT-CATALOG-2026-08-30.md`. PlatformAdmin no
obtiene acceso tenant implícito y `FinancialManager` se normaliza a `Treasurer`.

### 5.7 Tenant Settings — Spec 025

`Tenant.currency` y `Tenant.timezone` siguen siendo invariantes de Spec 001. Spec 025
posee definitions y overrides financieros/documentales aprobados; no crea movimientos
ni cambia resultados históricos. Cada setting nuevo exige tipo, default, sensibilidad,
vigencia, seed idempotente y consumidor dueño.

GAP-S3-004 fija `Tenant.currency` como única autoridad y limita Sprint 3 a USD. El
catálogo financiero exacto contiene `financial.paymentValidationRequired`,
`financial.receiptRequired`, `financial.partialPaymentsAllowed`,
`financial.overpaymentsAllowed` y `financial.autoAllocationEnabled`, conforme a
`docs/changes/GAP-S3-004-FINANCIAL-CURRENCY-SETTINGS-2026-08-29.md`. No se activan
policies, scheduling, mora ni definitions duplicadas de moneda.

### 5.8 Idempotencia — Platform API

La plataforma API posee el único ledger PostgreSQL/Prisma de idempotencia. Todas las
mutaciones allowlisted lo consumen mediante un puerto compartido; ningún módulo de
dominio crea un ledger paralelo ni usa memoria, Redis o Audit como autoridad. El
modelo, hashing, autorización previa, lock, replay, atomicidad, recuperación y
retención se rigen por GAP-S3-010.

Fase 2 está autorizada a incorporar `IdempotencyOperation`,
`IdempotencyOperationStatus` y su migración transversal junto con la primera
integración runtime. Esto no amplía los seis modelos de dominio de Spec 003.

## 6. Dependencias y orden canónico

| Productor | Consumidor | Contrato permitido |
| --- | --- | --- |
| Sprint 2 Identity/Access | todos | identidad, tenant activo, membership, roles y permisos |
| Platform API idempotency | 003, 004, 005, 006, 016 | ledger tenant-scoped compartido para toda mutación allowlisted |
| Spec 003 | 004, 005, 006, 016 | unidad y relaciones `.own` tenant-aware |
| Spec 025 | 004, 005, 006, 016 | configuración tipada; nunca mutaciones de negocio |
| Spec 004 | 005, 006 | cargos y movimientos efectivos |
| Spec 016 | 005 | puerto privado de documento disponible antes de Payments; sin dependencia inversa |
| Spec 005 | 006 | pagos, asignaciones y reversos efectivos |
| Specs 003–006/016 | 007 | eventos auditables sanitizados |

No se permite acceso directo a tablas de otro módulo como sustituto de un puerto de
aplicación o repositorio autorizado.

## 7. Fuera de Sprint 3

- Admin Web App y Resident Self-Service Web App.
- Onboarding general de residentes por UI o autoservicio.
- Conciliación bancaria, payment providers, open banking y accounting ledger.
- Facturación electrónica, mora/interés avanzado y reglas tributarias.
- Reportes, dashboards, exportación masiva e importación/migración funcional.
- Reservas, multas, comunicaciones, reuniones, actas y otros dominios comunitarios.
- Firma electrónica, OCR, antivirus operativo, legal hold, WORM y publicación pública.
- Procesamiento asíncrono/outbox salvo una decisión posterior expresamente aprobada.
- Nuevas capacidades de Sprint 2 o una Phase 10 de Sprint 2.

La allowlist exacta por fase, DTOs, `X-Tenant-Id`, idempotencia, permisos y errores
están gobernados por
`docs/changes/GAP-S3-006-API-IDEMPOTENCY-BOUNDARY-2026-08-29.md`. Ninguna operación
propuesta por las specs fuera de esa allowlist puede entrar al OpenAPI o al runtime de
Sprint 3. La Fase 3 no expone API documental general y la Fase 9 no añade endpoints.

## 8. Secuencia progresiva

| Fase | Nombre | Resultado permitido |
| ---: | --- | --- |
| 0 | readiness | contratos, gaps, manifest y frontera; sin runtime |
| 1 | residents-properties-persistence | modelos/migraciones del slice aprobado de Spec 003 |
| 2 | residents-properties-api | casos de uso, autorización por recurso, API de Spec 003 y ledger transversal de idempotencia |
| 3 | secure-document-storage | storage privado base y comprobantes preparados |
| 4 | dues-fees-foundation | conceptos, calendarios, asignaciones y periodos |
| 5 | charge-lifecycle | generación, cargos, ajustes y reversos |
| 6 | payments-receipts | pagos, comprobantes y validación |
| 7 | allocations-reversals | asignación, concurrencia y reversos de pago |
| 8 | balances-statements | saldos reconstruibles y estados de cuenta |
| 9 | openapi-cross-slice-closure | contrato OpenAPI, integración y cierre acumulativo |

Cada fase se eleva en el mismo cambio que incorpora sus artefactos y gate. Ninguna fase
puede saltarse, y no existe una fase 10 dentro de este runbook.

## 9. Gates acumulativos

El contrato ejecutable está en `packages/testing/config/sprint-3-gates.json`.
`pnpm sprint3:boundary` valida decisión, fase, documentos y ausencia de artefactos
prematuros. `pnpm sprint3:gates` ejecuta la frontera y únicamente los comandos de las
fases activas, dejando evidencia en `artifacts/sprint-3-gates/evidence.json`.

| Fase | Gate | Garantía mínima |
| ---: | --- | --- |
| 0 | `sprint3:boundary` | `GO`, fase 0, 35 documentos aprobados y cero runtime nuevo |
| 1 | `test:residents:persistence` | migración limpia, constraints y aislamiento tenant |
| 2 | `test:residents`, `test:residents:authorization` | API, `.own`, permisos, idempotencia/rollback y negativos cross-tenant |
| 3 | `test:documents` | privacidad, hash, MIME/tamaño, storage key y compensación |
| 4 | `test:dues` | settings, moneda, periodos y unicidad |
| 5 | `test:charges` | generación idempotente, concurrencia, ajustes y audit |
| 6 | `test:payments` | pagos, validación, comprobantes y rollback |
| 7 | `test:allocations` | asignación exacta, double-allocation y reversos |
| 8 | `test:statements`, `test:financial` | reconstrucción, snapshots y regresión financiera |
| 9 | API/integration/stack/OpenAPI | cierre cross-slice desde checkout limpio |

Al activar fases, cada gate específico debe incluir Prisma migrate/status/drift,
seguridad, auditoría y concurrencia aplicables. CI conserva además lint, typecheck,
tests, build, dependency audit y secret scan conforme a ADR-012.

## 10. Criterio de cierre

Sprint 3 sólo puede cerrarse cuando:

1. fases 0–9 están completas sin ampliar esta frontera;
2. todos los gates acumulativos pasan en CI desde checkout limpio;
3. OpenAPI y Prisma reflejan únicamente los contratos aprobados;
4. se demuestran aislamiento, precisión, idempotencia, atomicidad y auditoría;
5. no existen gaps críticos o altos abiertos;
6. una reevaluación formal emite cierre `GO` y fase final 9.
