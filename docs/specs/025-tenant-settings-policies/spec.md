# Spec — 025 Tenant Settings and Policies

## 1. Información del documento

| Campo                 | Valor                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Proyecto              | RESIDENT Core                                                                                 |
| Spec ID               | 025                                                                                           |
| Módulo                | Tenant Settings and Policies                                                                  |
| Documento             | Functional Specification                                                                      |
| Ruta                  | `docs/specs/025-tenant-settings-policies/spec.md`                                             |
| Versión               | 0.1                                                                                           |
| Estado                | needs-review                                                                                  |
| Fecha                 | 2026-07-31                                                                                    |
| Fase                  | FASE 2 — RESIDENT Core                                                                        |
| Arquitectura objetivo | Monolito modular preparado para microservicios                                                |
| Stack objetivo        | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                |
| Naturaleza            | Tenant-scoped / Configuration-governed / Policy-driven / Versioned / Audit-heavy / Non-public |

---

## 2. Propósito

El módulo `025-tenant-settings-policies` centraliza la configuración operativa, parámetros funcionales y políticas internas aplicables a cada tenant dentro de RESIDENT Core.

Este módulo permite que cada conjunto residencial configure reglas como zonas horarias, moneda, períodos operativos, vencimientos, recargos, políticas de reservas, multas, comunicaciones, documentos, privacidad, acceso de residentes, control de visitantes, mantenimiento, inventario, proveedores, reportes, retención documental y activación de módulos.

Regla central del módulo:

```text id="tsp-rule"
Toda configuración, política, excepción, plantilla, versión, activación, lectura, modificación, exportación y evento de Tenant Settings and Policies debe pertenecer a un tenant, aplicarse únicamente dentro de su tenant, tener autorización explícita, conservar trazabilidad auditable, controlar vigencia temporal, evitar cambios retroactivos no autorizados, impedir exposición pública de configuraciones sensibles, impedir acceso desde WordPress público, no reemplazar reglas de autorización del Core, no almacenar secretos, no modificar datos transaccionales directamente, no crear pagos, no crear asientos contables, no ejecutar automatizaciones destructivas y no enviar datos reales a IA externa.
```

---

## 3. Contexto dentro de RESIDENT Core

`Tenant Settings and Policies` funciona como capa transversal de configuración gobernada.

```text id="tsp-context-map"
Tenant Management
  └── crea y administra tenants

Tenant Settings and Policies
  ├── define configuración general del tenant
  ├── define políticas operativas
  ├── versiona cambios de política
  ├── activa configuraciones con vigencia
  ├── controla excepciones autorizadas
  ├── expone lectura interna a módulos
  └── audita cambios

Financial Management
  └── consume políticas de cargos, pagos, vencimientos y recargos

Reservations
  └── consume reglas de horarios, anticipación, cancelación y límites

Fines and Sanctions
  └── consume reglas sancionatorias configurables

Meetings and Voting
  └── consume reglas de quórum, convocatoria, votación y publicación

Communications
  └── consume preferencias de canales, plantillas y horarios

Secure Document Storage
  └── consume reglas de retención, clasificación y descarga

Access Control and Visitors
  └── consume políticas de visitantes, pases, check-in, check-out y datos visibles

Maintenance Work Orders
  └── consume reglas de solicitud, aprobación, evidencias y proveedores

Inventory Basic
  └── consume políticas de stock, consumos, ajustes y alertas

Audit
  └── registra toda modificación crítica

Basic Reports
  └── consulta configuración para reportes y exportaciones
```

---

## 4. Problema que resuelve

Sin un módulo centralizado de settings y policies, cada módulo tendría reglas configurables dispersas, duplicadas o hardcodeadas.

Problemas a evitar:

```text id="tsp-problems"
- reglas de negocio duplicadas en varios módulos;
- políticas hardcodeadas en código;
- cambios manuales sin auditoría;
- configuración sin vigencia;
- imposibilidad de saber qué política aplicaba en una fecha pasada;
- cambios retroactivos que alteren resultados históricos;
- exposición accidental de configuraciones sensibles;
- módulos aplicando reglas distintas para el mismo tenant;
- dificultad para migrar a microservicios;
- falta de trazabilidad sobre quién cambió una política;
- falta de control de excepciones;
- uso de WordPress como fuente de configuración transaccional;
- uso de IA externa con datos reales de configuración sensible.
```

---

## 5. Objetivos funcionales

```text id="tsp-objectives"
1. Centralizar settings operativos por tenant.
2. Centralizar políticas configurables por tenant.
3. Definir valores por defecto seguros.
4. Permitir overrides tenant-scoped.
5. Versionar políticas críticas.
6. Controlar vigencia temporal de políticas.
7. Registrar quién cambió cada configuración.
8. Evitar cambios retroactivos sin permiso reforzado.
9. Permitir lectura interna eficiente por otros módulos.
10. Permitir validación de configuración antes de activar.
11. Permitir exportar configuración administrativa mediante Secure Document Storage.
12. Impedir exposición pública de configuraciones sensibles.
13. Impedir acceso desde WordPress público.
14. Impedir almacenamiento de secretos.
15. Impedir efectos transaccionales directos.
16. Impedir uso de IA externa con datos reales.
```

---

## 6. Principios de diseño

### 6.1. Tenant-scoped by default

Toda configuración pertenece a un tenant.

```text id="tsp-principle-tenant"
No existe setting operativo global aplicable a tenants sin resolución explícita de tenant, salvo defaults platform-level no sensibles definidos como plantilla.
```

---

### 6.2. Configuración no es dato transaccional

El módulo configura reglas, pero no ejecuta transacciones de dominio.

```text id="tsp-principle-no-transaction"
Tenant Settings and Policies no genera cargos, no valida pagos, no registra asistencias, no aprueba reservas, no crea multas, no modifica órdenes de mantenimiento, no registra inventario y no abre accesos físicos.
```

---

### 6.3. Políticas versionadas

Las políticas críticas deben versionarse.

```text id="tsp-principle-versioning"
Toda política que afecte cálculo financiero, permisos operativos, privacidad, retención documental, acceso de visitantes o procesos auditables debe mantener versión, vigencia y actor responsable.
```

---

### 6.4. Vigencia explícita

Las políticas activas deben tener vigencia.

```text id="tsp-principle-effective"
Una operación histórica debe poder saber qué configuración o política estaba vigente en el momento de ejecución.
```

---

### 6.5. No retroactividad silenciosa

Los cambios no deben alterar resultados históricos sin autorización.

```text id="tsp-principle-no-silent-retroactivity"
Una política nueva aplica hacia adelante; cualquier recalculo histórico o retroactividad requiere permiso reforzado, razón, auditoría y módulo dueño.
```

---

### 6.6. Módulo fuente de configuración, no de autorización final

Keycloak autentica y Core autoriza. Este módulo puede proveer parámetros, pero no reemplaza los guards ni las policies de dominio.

```text id="tsp-principle-no-authz-replacement"
Tenant Settings and Policies no decide por sí solo si un usuario puede operar un recurso; entrega configuración que los módulos aplican dentro de su autorización propia.
```

---

### 6.7. Seguridad por defecto

Todo default debe favorecer menor exposición y mayor control.

```text id="tsp-principle-secure-defaults"
Si una política no está configurada, el sistema debe aplicar un default seguro, conservador y documentado.
```

---

## 7. Alcance MVP

### 7.1. Incluido

```text id="tsp-scope-in"
- Catálogo de settings definitions.
- Catálogo de policy definitions.
- Valores de configuración por tenant.
- Políticas operativas por tenant.
- Versionamiento de políticas.
- Activación de versiones.
- Vigencia desde/hasta.
- Validación de schema por categoría.
- Overrides tenant-scoped.
- Excepciones autorizadas básicas.
- Lectura interna por otros módulos.
- Consulta administrativa.
- Actualización administrativa.
- Historial de cambios.
- Comparación entre versiones.
- Exportación administrativa.
- Auditoría obligatoria.
- OpenAPI privado.
- Tests de multitenancy, seguridad, versionamiento y auditoría.
```

---

### 7.2. Fuera de alcance MVP

```text id="tsp-scope-out"
- motor complejo de reglas tipo Drools;
- lenguaje DSL avanzado;
- reglas arbitrarias ejecutables por tenant;
- scripting configurable;
- webhooks configurables por tenant;
- automatizaciones destructivas;
- AB testing;
- feature flags comerciales complejos;
- secrets manager;
- almacenamiento de credenciales;
- edición pública desde WordPress;
- publicación pública de políticas completas;
- simulador avanzado de impacto financiero;
- workflow avanzado de aprobación multi-firma;
- firma electrónica legal;
- rollback automático de datos transaccionales;
- migración automática de políticas entre tenants;
- IA externa analizando configuración real.
```

---

## 8. Tipos de configuración

### 8.1. General settings

Configuración general del tenant.

```text id="tsp-general-settings"
- timezone;
- locale;
- currency;
- dateFormat;
- timeFormat;
- fiscalYearStartMonth;
- defaultPageSize;
- defaultExportFormat;
- tenantOperationalStatus;
- enabledModules;
```

Reglas:

```text id="tsp-general-rules"
- timezone default = America/Guayaquil.
- currency default = USD.
- locale default = es-EC.
- enabledModules no habilita endpoints públicos por sí solo.
```

---

### 8.2. Financial policies

Configuración financiera transversal.

```text id="tsp-financial-settings"
- billingCycleDay;
- paymentDueDays;
- lateFeeEnabled;
- lateFeeGraceDays;
- lateFeeCalculationMode;
- lateFeeFixedAmount;
- lateFeePercentage;
- partialPaymentsAllowed;
- overpaymentsAllowed;
- autoAllocationEnabled;
- paymentValidationRequired;
- receiptRequired;
- statementGenerationDay;
```

Reglas:

```text id="tsp-financial-rules"
- Los montos usan Decimal string.
- Las políticas financieras no crean cargos directamente.
- Los cambios no recalculan cargos ya emitidos salvo proceso explícito del módulo financiero.
- No crea Payment.
- No crea JournalEntry.
- No confirma conciliación bancaria.
```

---

### 8.3. Reservation policies

Configuración para reservas de áreas comunales.

```text id="tsp-reservation-settings"
- maxReservationsPerUnitPerMonth;
- minAdvanceHours;
- maxAdvanceDays;
- cancellationDeadlineHours;
- approvalRequired;
- paymentRequiredBeforeConfirmation;
- blackoutPolicyEnabled;
- allowRecurringReservations;
- allowedReservationHours;
- maxReservationDurationHours;
```

Reglas:

```text id="tsp-reservation-rules"
- La política configura límites.
- El módulo Reservations valida overlaps y estados.
- Este módulo no crea ni cancela reservas directamente.
```

---

### 8.4. Fines and sanctions policies

Configuración para multas y sanciones.

```text id="tsp-fines-settings"
- fineAppealAllowed;
- appealDeadlineDays;
- evidenceRequired;
- fineApprovalRequired;
- autoChargeFineEnabled;
- repeatOffensePolicyEnabled;
- maxFineAmount;
- notificationBeforeCharge;
```

Reglas:

```text id="tsp-fines-rules"
- AutoChargeFineEnabled no crea cargos desde este módulo.
- Fines and Sanctions decide cuándo generar cargos.
- Las reglas sancionatorias deben auditarse.
```

---

### 8.5. Meetings and voting policies

Configuración para reuniones, asambleas y votaciones.

```text id="tsp-meetings-settings"
- meetingNoticeDays;
- quorumCalculationMode;
- proxyVotingAllowed;
- attendanceLateToleranceMinutes;
- votingModeDefault;
- secretVotingAllowed;
- publishResultsToResidents;
- certifiedMinutesRequired;
```

Reglas:

```text id="tsp-meetings-rules"
- El módulo no calcula quórum directamente.
- El módulo no emite votos.
- El módulo no certifica actas.
- Solo entrega parámetros de política a Meetings, Voting y Certified Minutes.
```

---

### 8.6. Communications policies

Configuración para comunicaciones y notificaciones.

```text id="tsp-communications-settings"
- defaultNotificationChannels;
- quietHoursEnabled;
- quietHoursFrom;
- quietHoursTo;
- emergencyBypassQuietHours;
- residentOptOutAllowed;
- templatesRequireApproval;
- announcementApprovalRequired;
- readReceiptRequiredForCriticalNotices;
```

Reglas:

```text id="tsp-communications-rules"
- No se envían comunicaciones desde este módulo.
- Communications and Notifications ejecuta el envío.
- Quiet hours no bloquea emergencias si emergencyBypassQuietHours=true.
```

---

### 8.7. Document policies

Configuración para documentos seguros.

```text id="tsp-document-settings"
- defaultDocumentSensitivity;
- retentionYears;
- downloadAuditRequired;
- versioningRequired;
- publicDocumentPublishingAllowed;
- allowedMimeTypes;
- maxFileSizeMb;
- residentDownloadAllowed;
```

Reglas:

```text id="tsp-document-rules"
- Este módulo no almacena archivos.
- Secure Document Storage conserva documentos.
- No se expone storageKey.
- No se aceptan binarios.
```

---

### 8.8. Access control and visitors policies

Configuración para visitantes y control de acceso.

```text id="tsp-access-settings"
- visitorPreAuthorizationAllowed;
- residentCanCreateVisitor;
- maxActiveVisitorAuthorizationsPerUnit;
- defaultAccessPassTtlMinutes;
- oneTimePassDefault;
- guardManualCheckInAllowed;
- guardManualCheckOutAllowed;
- visitorIdentificationRequired;
- vehiclePlateRequired;
- deliveryAtGateAllowed;
- supplierVisitRequiresApproval;
- residentCanSeeAccessEvents;
- residentAccessEventsRetentionDays;
- openCheckInAlertMinutes;
```

Reglas:

```text id="tsp-access-rules"
- No se abren portones desde este módulo.
- No se controla hardware.
- No se habilita biometría.
- No se habilita reconocimiento facial.
- No se habilita OCR automático de placas.
- Access Control and Visitors aplica estas políticas.
```

---

### 8.9. Maintenance policies

Configuración para mantenimiento.

```text id="tsp-maintenance-settings"
- residentCanCreateMaintenanceRequest;
- evidenceRequiredForRequest;
- approvalRequiredForWorkOrder;
- supplierVisitRequiredForExternalWork;
- costApprovalThresholdAmount;
- residentVisibleStatusHistory;
- residentCanComment;
- internalCommentsEnabled;
```

Reglas:

```text id="tsp-maintenance-rules"
- Este módulo no crea WorkOrders.
- Este módulo no aprueba costos.
- Este módulo no crea SupplierPayable.
- Maintenance Work Orders aplica la política.
```

---

### 8.10. Inventory policies

Configuración para inventario.

```text id="tsp-inventory-settings"
- negativeStockAllowed;
- stockAdjustmentApprovalRequired;
- inventoryConsumptionRequiresWorkOrder;
- lowStockAlertsEnabled;
- defaultReorderPolicy;
- inventoryCostVisibility;
- transferApprovalRequired;
```

Reglas:

```text id="tsp-inventory-rules"
- Este módulo no modifica stock.
- Este módulo no postea movimientos.
- Inventory Basic aplica la política.
```

---

### 8.11. Supplier policies

Configuración para proveedores.

```text id="tsp-supplier-settings"
- supplierApprovalRequired;
- supplierDocumentsRequired;
- supplierBankInfoVisibility;
- supplierPaymentApprovalRequired;
- supplierPaymentMinApprovers;
- supplierVisitRequiresActiveSupplier;
```

Reglas:

```text id="tsp-supplier-rules"
- Este módulo no crea proveedores.
- Este módulo no crea cuentas por pagar.
- Este módulo no crea órdenes de pago.
- Supplier Payments aplica la política.
```

---

### 8.12. Privacy and data governance policies

Configuración de privacidad y gobierno de datos.

```text id="tsp-privacy-settings"
- residentDirectoryVisible;
- residentPhoneVisibleToAdmins;
- residentEmailVisibleToAdmins;
- visitorDataRetentionDays;
- auditRetentionYears;
- exportRequiresReason;
- sensitiveExportsRequireApproval;
- externalAiAllowedForAnonymizedData;
- externalAiRealDataAllowed;
```

Reglas:

```text id="tsp-privacy-rules"
- externalAiRealDataAllowed debe ser false en MVP.
- Cualquier cambio futuro requiere ADR y aprobación explícita.
- Este módulo no anonimiza datos transaccionales por sí solo.
```

---

## 9. Entidades funcionales

### 9.1. TenantSettingDefinition

Define un setting configurable conocido por la plataforma.

Campos conceptuales:

```text id="tsp-entity-setting-definition"
- id;
- key;
- category;
- valueType;
- defaultValue;
- allowedValues;
- schema;
- description;
- sensitivity;
- isTenantOverridable;
- isRuntimeCritical;
- requiresRestart;
- status;
```

Reglas:

```text id="tsp-setting-definition-rules"
- Solo PlatformAdmin autorizado puede crear o modificar definitions.
- La definición no pertenece a un tenant específico.
- La definición no almacena secretos.
- Toda definición debe tener default seguro.
```

---

### 9.2. TenantSettingValue

Representa el valor activo o configurado de un setting para un tenant.

Campos conceptuales:

```text id="tsp-entity-setting-value"
- id;
- tenantId;
- settingDefinitionId;
- key;
- value;
- valueType;
- effectiveFrom;
- effectiveUntil;
- status;
- source;
- reason;
- createdBy;
- updatedBy;
- activatedBy;
- archivedBy;
- createdAt;
- updatedAt;
- activatedAt;
- archivedAt;
```

Reglas:

```text id="tsp-setting-value-rules"
- tenantId obligatorio.
- key debe existir en SettingDefinition.
- value debe validar contra valueType/schema.
- No se aceptan secretos.
- No se aceptan valores ejecutables.
- No se aceptan scripts.
- effectiveFrom controla vigencia.
- Cambios críticos requieren reason.
```

---

### 9.3. TenantPolicyDefinition

Define una política configurable.

Campos conceptuales:

```text id="tsp-entity-policy-definition"
- id;
- policyKey;
- category;
- schema;
- defaultPolicy;
- description;
- criticality;
- ownerModule;
- isTenantOverridable;
- versioningRequired;
- approvalRequired;
- status;
```

Reglas:

```text id="tsp-policy-definition-rules"
- policyKey debe ser único.
- ownerModule identifica el módulo que consume la política.
- versioningRequired=true para políticas críticas.
- approvalRequired=true para políticas sensibles.
```

---

### 9.4. TenantPolicyVersion

Representa una versión concreta de una política de tenant.

Campos conceptuales:

```text id="tsp-entity-policy-version"
- id;
- tenantId;
- policyDefinitionId;
- policyKey;
- versionNumber;
- policyPayload;
- status;
- effectiveFrom;
- effectiveUntil;
- changeReason;
- createdBy;
- reviewedBy;
- approvedBy;
- activatedBy;
- archivedBy;
- createdAt;
- reviewedAt;
- approvedAt;
- activatedAt;
- archivedAt;
```

Reglas:

```text id="tsp-policy-version-rules"
- Cada versión pertenece a un tenant.
- versionNumber se genera server-side.
- policyPayload debe validar contra schema.
- Una sola versión active por tenant + policyKey + fecha.
- Las versiones activas no se editan destructivamente.
- Cambios se hacen creando nueva versión.
```

---

### 9.5. TenantPolicyActivation

Registra activaciones de políticas.

Campos conceptuales:

```text id="tsp-entity-policy-activation"
- id;
- tenantId;
- policyVersionId;
- policyKey;
- activatedAt;
- effectiveFrom;
- activatedBy;
- activationReason;
- previousPolicyVersionId;
- rollbackOfActivationId;
```

Reglas:

```text id="tsp-policy-activation-rules"
- Toda activación se audita.
- Activar una versión no modifica datos transaccionales históricos.
- Rollback crea nueva activación, no borra activaciones previas.
```

---

### 9.6. TenantPolicyException

Representa una excepción autorizada a una política.

Campos conceptuales:

```text id="tsp-entity-policy-exception"
- id;
- tenantId;
- policyKey;
- policyVersionId;
- exceptionType;
- targetResourceType;
- targetResourceId;
- exceptionPayload;
- reason;
- status;
- validFrom;
- validUntil;
- requestedBy;
- approvedBy;
- revokedBy;
- createdAt;
- approvedAt;
- revokedAt;
```

Reglas:

```text id="tsp-policy-exception-rules"
- Excepciones requieren razón.
- Excepciones críticas requieren aprobación.
- Excepciones tienen vigencia.
- Excepciones son tenant-scoped.
- No se permite excepción global multi-tenant en MVP.
```

---

### 9.7. TenantSettingsChangeLog

Historial de cambios funcional.

Campos conceptuales:

```text id="tsp-entity-change-log"
- id;
- tenantId;
- entityType;
- entityId;
- action;
- key;
- oldValueSanitized;
- newValueSanitized;
- reason;
- actorUserProfileId;
- traceId;
- createdAt;
```

Reglas:

```text id="tsp-change-log-rules"
- No guarda secretos.
- No guarda tokens.
- No guarda datos personales masivos.
- Complementa Audit, no lo reemplaza.
```

---

### 9.8. TenantSettingsExport

Exportación administrativa de settings/policies.

Campos conceptuales:

```text id="tsp-entity-export"
- id;
- tenantId;
- exportType;
- format;
- filters;
- status;
- secureDocumentId;
- requestedBy;
- completedAt;
- failedAt;
- failureReason;
- createdAt;
```

Reglas:

```text id="tsp-export-rules"
- Toda exportación usa Secure Document Storage.
- No se devuelve storageKey.
- Export requiere permiso.
- Export requiere reason si incluye políticas sensibles.
```

---

## 10. Categorías de políticas

Categorías MVP:

```text id="tsp-policy-categories"
general
financial
billing
payments
accountStatements
reservations
fines
meetings
voting
communications
documents
accessControl
maintenance
inventory
suppliers
accounting
bankReconciliation
reports
privacy
security
modules
```

Regla:

```text id="tsp-category-rule"
Cada política debe declarar ownerModule, category, sensitivity, versioningRequired y defaultPolicy.
```

---

## 11. Actores

### 11.1. PlatformAdmin

Puede:

```text id="tsp-actor-platform-admin-can"
- definir catálogo global de settings;
- definir catálogo global de policies;
- crear templates base;
- consultar configuración de tenant solo con permiso explícito;
- asistir en soporte con trazabilidad reforzada.
```

No puede automáticamente:

```text id="tsp-actor-platform-admin-cannot"
- modificar políticas de tenant sin permiso y razón;
- acceder a datos transaccionales por este módulo;
- activar políticas retroactivas sin auditoría;
- exponer configuración públicamente.
```

---

### 11.2. TenantAdmin

Puede:

```text id="tsp-actor-tenant-admin-can"
- consultar settings del tenant;
- modificar settings permitidos;
- crear versiones de políticas;
- solicitar activación de políticas;
- activar políticas si tiene permiso;
- consultar historial;
- exportar configuración administrativa.
```

---

### 11.3. BoardMember / Comité

Puede, según permisos:

```text id="tsp-actor-board-can"
- consultar políticas vigentes;
- revisar cambios propuestos;
- aprobar políticas sensibles;
- consultar historial de cambios;
- descargar exportaciones autorizadas.
```

---

### 11.4. FinancialManager

Puede, según permisos:

```text id="tsp-actor-financial-can"
- consultar políticas financieras;
- proponer cambios financieros;
- consultar historial de políticas financieras;
- simular lectura de parámetros sin ejecutar recálculos.
```

---

### 11.5. SecurityManager

Puede, según permisos:

```text id="tsp-actor-security-can"
- consultar políticas de privacidad, acceso y seguridad;
- modificar políticas de visitantes;
- revisar excepciones de seguridad;
- aprobar cambios sensibles de acceso.
```

---

### 11.6. Resident / PropertyOwner

Puede, de forma limitada:

```text id="tsp-actor-resident-can"
- consultar resúmenes visibles de políticas propias si se habilita;
- consultar reglas publicables de reservas, visitantes o comunicaciones;
- no modificar settings ni policies.
```

---

### 11.7. System

Puede:

```text id="tsp-actor-system-can"
- resolver políticas activas para otros módulos;
- invalidar cache;
- aplicar defaults;
- expirar versiones;
- registrar cambios programados.
```

No puede:

```text id="tsp-actor-system-cannot"
- crear políticas arbitrarias sin evento de configuración;
- modificar datos transaccionales desde este módulo.
```

---

## 12. Permisos

Permisos mínimos:

```text id="tsp-permissions"
tenantSettings.read
tenantSettings.update
tenantSettings.archive
tenantSettings.export

tenantPolicyDefinitions.read
tenantPolicyDefinitions.create
tenantPolicyDefinitions.update
tenantPolicyDefinitions.archive

tenantPolicies.read
tenantPolicies.createVersion
tenantPolicies.review
tenantPolicies.approve
tenantPolicies.activate
tenantPolicies.scheduleActivation
tenantPolicies.rollback
tenantPolicies.archive

tenantPolicyExceptions.read
tenantPolicyExceptions.create
tenantPolicyExceptions.approve
tenantPolicyExceptions.revoke
tenantPolicyExceptions.archive

tenantPolicyHistory.read
tenantPolicyEffective.read

tenantPolicySummaries.own.read
```

Permisos reforzados:

```text id="tsp-sensitive-permissions"
tenantPolicies.activateSensitive
tenantPolicies.activateRetroactive
tenantPolicies.approveSensitive
tenantPolicyExceptions.approveSensitive
tenantSettings.updateSecurity
tenantSettings.updatePrivacy
tenantSettings.updateFinancial
tenantSettings.exportSensitive
```

Reglas:

```text id="tsp-permission-rules"
- Los permisos sensibles no se asignan por defecto.
- PlatformAdmin no hereda automáticamente permisos de tenant.
- Resident no modifica settings ni policies.
- Los permisos de lectura efectiva para módulos internos se gestionan por service-to-service boundary interno.
```

---

## 13. User stories

### US-001 — Consultar configuración del tenant

Como TenantAdmin, quiero consultar la configuración vigente del tenant para revisar sus parámetros operativos.

Acceptance criteria:

```text id="tsp-us001-ac"
[ ] La consulta requiere autenticación.
[ ] La consulta requiere tenantSettings.read.
[ ] Solo devuelve settings del tenant actual.
[ ] No devuelve secretos.
[ ] No devuelve datos cross-tenant.
```

---

### US-002 — Actualizar un setting permitido

Como TenantAdmin, quiero actualizar un setting permitido para adaptar el sistema a las reglas del conjunto.

Acceptance criteria:

```text id="tsp-us002-ac"
[ ] Requiere tenantSettings.update.
[ ] Valida key contra definition.
[ ] Valida value contra schema.
[ ] Requiere reason si el setting es crítico.
[ ] Crea historial.
[ ] Audita tenantSetting.updated.
```

---

### US-003 — Crear versión de política

Como TenantAdmin, quiero crear una nueva versión de política para modificar reglas operativas sin alterar la versión actual.

Acceptance criteria:

```text id="tsp-us003-ac"
[ ] Requiere tenantPolicies.createVersion.
[ ] Crea versión draft.
[ ] Valida policyPayload contra schema.
[ ] Genera versionNumber server-side.
[ ] No altera versión activa.
[ ] Audita tenantPolicyVersion.created.
```

---

### US-004 — Aprobar política sensible

Como BoardMember autorizado, quiero aprobar una política sensible antes de que entre en vigencia.

Acceptance criteria:

```text id="tsp-us004-ac"
[ ] Requiere tenantPolicies.approveSensitive.
[ ] Solo aprueba versiones reviewReady.
[ ] Registra approvedBy.
[ ] Registra approvedAt.
[ ] No activa automáticamente salvo policy explícita.
[ ] Audita tenantPolicyVersion.approved.
```

---

### US-005 — Activar política

Como TenantAdmin autorizado, quiero activar una versión de política para que otros módulos la consuman.

Acceptance criteria:

```text id="tsp-us005-ac"
[ ] Requiere tenantPolicies.activate.
[ ] Valida estado approved o activable.
[ ] Registra effectiveFrom.
[ ] Desactiva vigencia futura superpuesta.
[ ] Crea TenantPolicyActivation.
[ ] Audita tenantPolicyVersion.activated.
```

---

### US-006 — Programar activación futura

Como administrador, quiero programar una política para que entre en vigencia en una fecha futura.

Acceptance criteria:

```text id="tsp-us006-ac"
[ ] Requiere tenantPolicies.scheduleActivation.
[ ] effectiveFrom debe ser futuro.
[ ] No debe superponer vigencias incompatibles.
[ ] Permite cancelar programación si no entró en vigencia.
[ ] Audita tenantPolicyActivation.scheduled.
```

---

### US-007 — Consultar política efectiva

Como módulo interno, quiero consultar la política vigente de un tenant para aplicar reglas de negocio.

Acceptance criteria:

```text id="tsp-us007-ac"
[ ] Consulta por tenantId y policyKey.
[ ] Devuelve versión vigente.
[ ] Respeta effectiveAt si se consulta fecha histórica.
[ ] Usa cache segura.
[ ] No devuelve configuraciones de otro tenant.
```

---

### US-008 — Crear excepción de política

Como SecurityManager, quiero crear una excepción temporal a una política para resolver un caso operativo controlado.

Acceptance criteria:

```text id="tsp-us008-ac"
[ ] Requiere tenantPolicyExceptions.create.
[ ] Requiere reason.
[ ] Requiere validFrom y validUntil.
[ ] Requiere targetResourceType y targetResourceId si aplica.
[ ] Excepción sensible requiere aprobación.
[ ] Audita tenantPolicyException.created.
```

---

### US-009 — Revocar excepción

Como TenantAdmin autorizado, quiero revocar una excepción para restaurar la política estándar.

Acceptance criteria:

```text id="tsp-us009-ac"
[ ] Requiere tenantPolicyExceptions.revoke.
[ ] Requiere revokeReason.
[ ] Registra revokedBy.
[ ] Registra revokedAt.
[ ] Audita tenantPolicyException.revoked.
```

---

### US-010 — Exportar settings y políticas

Como TenantAdmin, quiero exportar la configuración del tenant para revisión administrativa.

Acceptance criteria:

```text id="tsp-us010-ac"
[ ] Requiere tenantSettings.export.
[ ] Export sensible requiere tenantSettings.exportSensitive.
[ ] Usa Secure Document Storage.
[ ] Devuelve secureDocumentId.
[ ] No devuelve storageKey.
[ ] Audita tenantSettings.exported.
```

---

### US-011 — Ver resumen propio de políticas

Como residente, quiero ver reglas visibles de mi conjunto para conocer límites de reservas, visitantes o comunicaciones.

Acceptance criteria:

```text id="tsp-us011-ac"
[ ] Requiere autenticación.
[ ] Requiere tenantPolicySummaries.own.read.
[ ] Solo muestra policies marcadas como residentVisible.
[ ] No muestra configuración sensible.
[ ] No muestra configuración de seguridad interna.
```

---

## 14. Reglas de negocio

### 14.1. Reglas generales

```text id="tsp-br-general"
BR-001 Todo setting tenant-scoped debe tener tenantId.
BR-002 Todo policy version tenant-scoped debe tener tenantId.
BR-003 Todo cambio crítico requiere reason.
BR-004 Todo cambio crítico debe auditarse.
BR-005 Todo valor debe validar contra su definition/schema.
BR-006 Todo policyPayload debe validar contra policy schema.
BR-007 Los defaults deben ser seguros.
BR-008 Las políticas activas no se editan destructivamente.
BR-009 Los cambios se representan con nuevas versiones.
BR-010 Una versión draft no se consume como política efectiva.
BR-011 Una versión scheduled no se consume antes de effectiveFrom.
BR-012 Una versión archived no se consume.
BR-013 Una versión active debe tener vigencia consistente.
BR-014 Las activaciones no borran historial anterior.
BR-015 Cross-tenant debe responder 404.
```

---

### 14.2. Reglas de settings

```text id="tsp-br-settings"
BR-016 Un settingDefinition puede ser global, pero el value es tenant-scoped.
BR-017 Un setting no tenant-overridable no puede modificarse por TenantAdmin.
BR-018 Un setting runtimeCritical requiere validación reforzada.
BR-019 Un setting security/privacy/financial requiere permiso específico.
BR-020 Un setting no debe almacenar secretos.
BR-021 Un setting no debe almacenar tokens.
BR-022 Un setting no debe contener scripts ejecutables.
BR-023 Un setting no debe contener funciones dinámicas.
BR-024 Un setting no debe aceptar SQL raw.
BR-025 Un setting archivado no se usa como efectivo.
```

---

### 14.3. Reglas de políticas

```text id="tsp-br-policies"
BR-026 Una policyDefinition debe tener ownerModule.
BR-027 Una policyDefinition crítica requiere versioningRequired=true.
BR-028 Una policyVersion debe tener versionNumber server-side.
BR-029 Una policyVersion draft puede editarse.
BR-030 Una policyVersion active no puede editarse.
BR-031 Una policyVersion active se reemplaza con nueva versión.
BR-032 Una policyVersion sensitive requiere aprobación.
BR-033 Una policyVersion rejected no puede activarse.
BR-034 Una policyVersion archived no puede activarse.
BR-035 Una policyVersion con schema inválido no puede activarse.
```

---

### 14.4. Reglas de vigencia

```text id="tsp-br-effective"
BR-036 No puede existir más de una policyVersion activa para el mismo tenant, policyKey y effectiveAt.
BR-037 effectiveFrom debe ser explícito al activar.
BR-038 effectiveUntil debe ser posterior a effectiveFrom si existe.
BR-039 Activaciones futuras no deben superponerse de forma incompatible.
BR-040 Consultas históricas deben devolver la política vigente en effectiveAt.
BR-041 Cambios retroactivos requieren tenantPolicies.activateRetroactive.
BR-042 Cambios retroactivos requieren reason reforzado.
BR-043 Cambios retroactivos no recalculan datos por sí mismos.
```

---

### 14.5. Reglas de excepciones

```text id="tsp-br-exceptions"
BR-044 Toda excepción requiere tenantId.
BR-045 Toda excepción requiere policyKey.
BR-046 Toda excepción requiere reason.
BR-047 Toda excepción requiere validFrom.
BR-048 Toda excepción requiere validUntil.
BR-049 validUntil debe ser posterior a validFrom.
BR-050 Excepción sensitive requiere aprobación.
BR-051 Excepción revoked no se aplica.
BR-052 Excepción expired no se aplica.
BR-053 Excepción cross-tenant no se aplica.
BR-054 No se permiten excepciones globales multi-tenant en MVP.
```

---

### 14.6. Reglas de lectura efectiva

```text id="tsp-br-effective-read"
BR-055 Los módulos internos consultan configuración efectiva por tenant y key.
BR-056 La respuesta debe incluir policyVersionId o settingValueId.
BR-057 La respuesta debe incluir effectiveFrom.
BR-058 La respuesta debe incluir source default/tenantOverride.
BR-059 La respuesta no debe incluir datos sensibles no requeridos.
BR-060 Cache debe invalidarse tras activación o actualización.
```

---

### 14.7. Reglas de límites de dominio

```text id="tsp-br-boundaries"
BR-061 El módulo no crea cargos.
BR-062 El módulo no crea pagos.
BR-063 El módulo no crea SupplierPaymentOrder.
BR-064 El módulo no crea JournalEntry.
BR-065 El módulo no confirma Bank Reconciliation.
BR-066 El módulo no modifica AccessEvent.
BR-067 El módulo no abre portones.
BR-068 El módulo no controla hardware.
BR-069 El módulo no habilita biometría en MVP.
BR-070 El módulo no habilita IA externa con datos reales.
```

---

### 14.8. Reglas de exposición

```text id="tsp-br-exposure"
BR-071 No existen endpoints públicos para settings/policies sensibles.
BR-072 WordPress público no consulta este módulo.
BR-073 /me solo accede a summaries residentVisible.
BR-074 No se expone configuración interna de seguridad.
BR-075 No se exponen secretos.
BR-076 No se exponen tokens.
BR-077 No se expone storageKey.
```

---

## 15. Estados

### 15.1. TenantSettingValueStatus

```text id="tsp-setting-status"
draft
active
scheduled
expired
archived
```

---

### 15.2. TenantPolicyVersionStatus

```text id="tsp-policy-version-status"
draft
reviewReady
approved
rejected
scheduled
active
superseded
expired
archived
```

---

### 15.3. TenantPolicyExceptionStatus

```text id="tsp-exception-status"
draft
pendingApproval
approved
active
expired
revoked
rejected
archived
```

---

### 15.4. TenantSettingsExportStatus

```text id="tsp-export-status"
requested
processing
completed
failed
archived
```

---

## 16. Flujos funcionales

### 16.1. Crear o actualizar setting

```text id="tsp-flow-update-setting"
1. Usuario autenticado solicita actualizar setting.
2. Sistema valida TenantGuard.
3. Sistema valida PermissionGuard.
4. Sistema valida settingDefinition.
5. Sistema valida si el setting es tenant-overridable.
6. Sistema valida schema.
7. Sistema valida permisos sensibles si aplica.
8. Sistema guarda nuevo TenantSettingValue o actualiza draft permitido.
9. Sistema activa o programa vigencia según request.
10. Sistema invalida cache.
11. Sistema registra change log.
12. Sistema audita tenantSetting.updated.
```

---

### 16.2. Crear nueva versión de política

```text id="tsp-flow-policy-version"
1. Usuario crea policy version draft.
2. Sistema valida policyDefinition.
3. Sistema valida ownerModule.
4. Sistema valida schema.
5. Sistema genera versionNumber.
6. Sistema guarda policyPayload.
7. Sistema no altera versión active.
8. Sistema registra change log.
9. Sistema audita tenantPolicyVersion.created.
```

---

### 16.3. Revisar y aprobar política

```text id="tsp-flow-approve-policy"
1. Usuario envía versión a reviewReady.
2. Revisor consulta cambios.
3. Revisor aprueba o rechaza.
4. Sistema valida permisos.
5. Sistema registra reviewedBy/approvedBy o rejectedBy.
6. Sistema conserva reason.
7. Sistema audita tenantPolicyVersion.approved o rejected.
```

---

### 16.4. Activar política

```text id="tsp-flow-activate-policy"
1. Usuario solicita activar versión.
2. Sistema valida estado approved o activable.
3. Sistema valida effectiveFrom.
4. Sistema valida no superposición incompatible.
5. Sistema registra TenantPolicyActivation.
6. Sistema marca versión active/scheduled.
7. Sistema marca versión anterior superseded/expired según vigencia.
8. Sistema invalida cache.
9. Sistema audita tenantPolicyVersion.activated.
```

---

### 16.5. Consultar política efectiva

```text id="tsp-flow-effective-policy"
1. Módulo interno solicita policyKey para tenant.
2. Sistema valida contexto interno autorizado.
3. Sistema busca versión vigente para effectiveAt.
4. Si no existe override, usa defaultPolicy.
5. Sistema aplica excepción vigente si corresponde.
6. Sistema devuelve payload, versionId, source y effectiveFrom.
7. Sistema no devuelve datos de otro tenant.
```

---

### 16.6. Crear excepción

```text id="tsp-flow-exception"
1. Usuario solicita excepción.
2. Sistema valida policyKey.
3. Sistema valida targetResourceType/targetResourceId tenant-scoped si aplica.
4. Sistema valida reason.
5. Sistema valida validFrom/validUntil.
6. Si es sensible, estado pendingApproval.
7. Si no es sensible, puede activarse según permiso.
8. Sistema audita tenantPolicyException.created.
```

---

### 16.7. Exportar configuración

```text id="tsp-flow-export"
1. Usuario solicita export.
2. Sistema valida permisos.
3. Sistema valida filtros.
4. Sistema excluye secretos y campos prohibidos.
5. Sistema genera archivo.
6. Sistema guarda archivo vía Secure Document Storage.
7. Sistema crea TenantSettingsExport.
8. Sistema devuelve secureDocumentId.
9. Sistema audita tenantSettings.exported.
```

---

## 17. Requerimientos funcionales

### 17.1. Settings definitions

```text id="tsp-fr-setting-definitions"
FR-001 El sistema debe permitir listar setting definitions.
FR-002 El sistema debe permitir crear setting definitions a PlatformAdmin autorizado.
FR-003 El sistema debe permitir actualizar setting definitions a PlatformAdmin autorizado.
FR-004 El sistema debe impedir definitions sin defaultValue seguro.
FR-005 El sistema debe impedir definitions que almacenen secretos.
FR-006 El sistema debe clasificar definitions por category.
FR-007 El sistema debe validar valueType.
FR-008 El sistema debe validar allowedValues.
FR-009 El sistema debe validar schema.
FR-010 El sistema debe auditar cambios de definitions.
```

---

### 17.2. Tenant settings

```text id="tsp-fr-tenant-settings"
FR-011 El sistema debe permitir listar settings efectivos de un tenant.
FR-012 El sistema debe permitir consultar un setting por key.
FR-013 El sistema debe permitir actualizar settings tenant-overridable.
FR-014 El sistema debe validar settings contra schema.
FR-015 El sistema debe registrar reason en settings críticos.
FR-016 El sistema debe permitir programar vigencia futura.
FR-017 El sistema debe resolver default si no existe override.
FR-018 El sistema debe impedir settings cross-tenant.
FR-019 El sistema debe invalidar cache tras cambios.
FR-020 El sistema debe auditar cambios.
```

---

### 17.3. Policy definitions

```text id="tsp-fr-policy-definitions"
FR-021 El sistema debe permitir listar policy definitions.
FR-022 El sistema debe permitir crear policy definitions a PlatformAdmin autorizado.
FR-023 El sistema debe permitir actualizar policy definitions a PlatformAdmin autorizado.
FR-024 El sistema debe registrar ownerModule.
FR-025 El sistema debe registrar defaultPolicy.
FR-026 El sistema debe validar schema.
FR-027 El sistema debe indicar si requiere versionamiento.
FR-028 El sistema debe indicar si requiere aprobación.
FR-029 El sistema debe auditar cambios.
```

---

### 17.4. Tenant policy versions

```text id="tsp-fr-policy-versions"
FR-030 El sistema debe permitir crear policy version draft.
FR-031 El sistema debe generar versionNumber server-side.
FR-032 El sistema debe validar policyPayload contra schema.
FR-033 El sistema debe permitir enviar a revisión.
FR-034 El sistema debe permitir aprobar versiones.
FR-035 El sistema debe permitir rechazar versiones.
FR-036 El sistema debe permitir activar versiones.
FR-037 El sistema debe permitir programar activación futura.
FR-038 El sistema debe impedir edición destructiva de active.
FR-039 El sistema debe permitir consultar historial.
FR-040 El sistema debe auditar cambios.
```

---

### 17.5. Política efectiva

```text id="tsp-fr-effective-policy"
FR-041 El sistema debe resolver política efectiva por tenant y policyKey.
FR-042 El sistema debe resolver política efectiva para una fecha effectiveAt.
FR-043 El sistema debe retornar default si no existe override.
FR-044 El sistema debe retornar versionId si existe override.
FR-045 El sistema debe retornar source.
FR-046 El sistema debe retornar effectiveFrom.
FR-047 El sistema debe aplicar excepción vigente si corresponde.
FR-048 El sistema debe impedir lectura cross-tenant.
FR-049 El sistema debe soportar cache.
FR-050 El sistema debe invalidar cache por cambios.
```

---

### 17.6. Excepciones

```text id="tsp-fr-exceptions"
FR-051 El sistema debe permitir crear excepciones.
FR-052 El sistema debe requerir reason.
FR-053 El sistema debe requerir vigencia.
FR-054 El sistema debe validar targetResource tenant-scoped si existe.
FR-055 El sistema debe permitir aprobar excepciones sensibles.
FR-056 El sistema debe permitir revocar excepciones.
FR-057 El sistema debe impedir excepciones expiradas.
FR-058 El sistema debe auditar excepciones.
```

---

### 17.7. Historial y comparación

```text id="tsp-fr-history"
FR-059 El sistema debe permitir consultar historial de settings.
FR-060 El sistema debe permitir consultar historial de policy versions.
FR-061 El sistema debe permitir comparar dos versiones.
FR-062 El sistema debe mostrar diferencias sanitizadas.
FR-063 El sistema debe ocultar campos sensibles.
FR-064 El sistema debe auditar consultas sensibles si aplica.
```

---

### 17.8. Summaries para residentes

```text id="tsp-fr-resident-summary"
FR-065 El sistema debe permitir exponer resumen /me de políticas residentVisible.
FR-066 El resumen no debe incluir settings sensibles.
FR-067 El resumen no debe incluir configuración de seguridad interna.
FR-068 El resumen no debe incluir configuración financiera interna no publicable.
FR-069 El resumen debe ser tenant-scoped.
```

---

### 17.9. Exportaciones

```text id="tsp-fr-exports"
FR-070 El sistema debe permitir exportar settings/policies.
FR-071 Export sensible requiere permiso reforzado.
FR-072 Export debe usar Secure Document Storage.
FR-073 Export debe generar secureDocumentId.
FR-074 Export no debe devolver storageKey.
FR-075 Export debe auditarse.
```

---

## 18. Requerimientos no funcionales

### 18.1. Seguridad

```text id="tsp-nfr-security"
NFR-001 Todas las rutas privadas requieren autenticación.
NFR-002 Todas las rutas tenant requieren TenantGuard.
NFR-003 Todas las rutas requieren permisos.
NFR-004 Cross-tenant retorna 404.
NFR-005 DTOs rechazan tenantId.
NFR-006 DTOs rechazan actor fields.
NFR-007 DTOs rechazan secrets.
NFR-008 DTOs rechazan scripts ejecutables.
NFR-009 DTOs rechazan raw SQL.
NFR-010 Logs no contienen secretos ni payloads sensibles.
```

---

### 18.2. Privacidad

```text id="tsp-nfr-privacy"
NFR-011 El módulo no debe exponer configuraciones sensibles a residentes.
NFR-012 El módulo no debe exponer configuración interna a WordPress público.
NFR-013 El módulo no debe enviar configuración real a IA externa.
NFR-014 Exportaciones deben sanitizar datos sensibles.
NFR-015 Historial debe ocultar secretos y tokens.
```

---

### 18.3. Auditoría

```text id="tsp-nfr-audit"
NFR-016 Todo cambio crítico debe auditarse.
NFR-017 Toda activación de política debe auditarse.
NFR-018 Toda excepción debe auditarse.
NFR-019 Toda exportación debe auditarse.
NFR-020 Audit debe incluir tenantId, actor, action, resource y traceId.
```

---

### 18.4. Performance

```text id="tsp-nfr-performance"
NFR-021 Resolución de setting efectivo p95 < 100 ms con cache.
NFR-022 Resolución de policy efectiva p95 < 150 ms con cache.
NFR-023 Listado administrativo p95 < 800 ms.
NFR-024 Comparación de versiones p95 < 1000 ms.
NFR-025 Export pequeño p95 < 3000 ms.
```

---

### 18.5. Disponibilidad

```text id="tsp-nfr-availability"
NFR-026 Si el módulo de settings falla, los módulos deben poder usar cache/defaults seguros cuando aplique.
NFR-027 La falta de política tenant específica debe resolver default seguro.
NFR-028 Un schema inválido no debe activarse.
```

---

### 18.6. Compatibilidad microservicios

```text id="tsp-nfr-microservices"
NFR-029 Las políticas deben poder consultarse por API interna o puerto.
NFR-030 Las referencias deben usar UUID.
NFR-031 No debe existir acoplamiento directo a tablas internas de módulos consumidores.
NFR-032 ownerModule debe permitir extracción futura.
```

---

## 19. API preliminar

> El contrato formal se definirá en `api-contract.md`.

### 19.1. Tenant Admin API

```text id="tsp-api-tenant"
GET    /api/v1/tenant/settings
GET    /api/v1/tenant/settings/{key}
PATCH  /api/v1/tenant/settings/{key}
POST   /api/v1/tenant/settings/{key}/schedule
POST   /api/v1/tenant/settings/{key}/archive

GET    /api/v1/tenant/policies
GET    /api/v1/tenant/policies/{policyKey}
GET    /api/v1/tenant/policies/{policyKey}/versions
POST   /api/v1/tenant/policies/{policyKey}/versions
GET    /api/v1/tenant/policies/{policyKey}/versions/{versionId}
PATCH  /api/v1/tenant/policies/{policyKey}/versions/{versionId}
POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/submit-review
POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/approve
POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/reject
POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/activate
POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/schedule
POST   /api/v1/tenant/policies/{policyKey}/versions/{versionId}/archive

GET    /api/v1/tenant/policies/{policyKey}/effective
GET    /api/v1/tenant/policies/{policyKey}/compare

GET    /api/v1/tenant/policy-exceptions
POST   /api/v1/tenant/policy-exceptions
GET    /api/v1/tenant/policy-exceptions/{exceptionId}
POST   /api/v1/tenant/policy-exceptions/{exceptionId}/approve
POST   /api/v1/tenant/policy-exceptions/{exceptionId}/revoke
POST   /api/v1/tenant/policy-exceptions/{exceptionId}/archive

GET    /api/v1/tenant/settings-history
GET    /api/v1/tenant/policy-history
GET    /api/v1/tenant/settings-policies/export
```

---

### 19.2. Platform API

```text id="tsp-api-platform"
GET    /api/v1/platform/setting-definitions
POST   /api/v1/platform/setting-definitions
GET    /api/v1/platform/setting-definitions/{definitionId}
PATCH  /api/v1/platform/setting-definitions/{definitionId}
POST   /api/v1/platform/setting-definitions/{definitionId}/archive

GET    /api/v1/platform/policy-definitions
POST   /api/v1/platform/policy-definitions
GET    /api/v1/platform/policy-definitions/{definitionId}
PATCH  /api/v1/platform/policy-definitions/{definitionId}
POST   /api/v1/platform/policy-definitions/{definitionId}/archive
```

---

### 19.3. Internal API / service port

```text id="tsp-api-internal"
resolveEffectiveSetting(tenantId, key, effectiveAt?)
resolveEffectivePolicy(tenantId, policyKey, effectiveAt?, context?)
resolvePolicyException(tenantId, policyKey, targetResourceType?, targetResourceId?, effectiveAt?)
```

---

### 19.4. `/me` API limitada

```text id="tsp-api-me"
GET /api/v1/me/tenant-policy-summaries
GET /api/v1/me/tenant-policy-summaries/{category}
```

---

### 19.5. Public API prohibida

No implementar:

```text id="tsp-api-public-forbidden"
/api/v1/public/tenant-settings
/api/v1/public/tenant-policies
/api/v1/public/tenants/{slug}/settings
/api/v1/public/tenants/{slug}/policies
```

---

## 20. Integraciones

### 20.1. Tenants

Uso:

```text id="tsp-integration-tenants"
- validar tenant activo;
- tenant isolation;
- defaults por tenant;
- módulos habilitados por tenant;
- estado operativo.
```

---

### 20.2. Users, Roles and Permissions

Uso:

```text id="tsp-integration-users"
- actor server-side;
- permisos administrativos;
- permisos sensibles;
- roles de comité/aprobadores;
- relación /me.
```

---

### 20.3. Audit

Uso:

```text id="tsp-integration-audit"
- tenantSetting.created/updated/activated/archived;
- tenantPolicyVersion.created/submitted/approved/rejected/activated/scheduled/archived;
- tenantPolicyException.created/approved/revoked/archived;
- tenantSettings.exported;
```

---

### 20.4. Secure Document Storage

Uso:

```text id="tsp-integration-sds"
- exportaciones;
- backups administrativos de configuración;
- anexos documentales futuros de aprobación.
```

Regla:

```text id="tsp-integration-sds-rule"
El módulo solo guarda secureDocumentId; no guarda storageKey ni signedUrl persistente.
```

---

### 20.5. Módulos consumidores

Módulos consumidores iniciales:

```text id="tsp-consumer-modules"
004-dues-fees
005-payments
006-account-statements
010-reservations-common-areas
011-fines-sanctions
012-communications-notifications
013-meetings-attendance
014-voting-basic
015-certified-minutes
016-secure-document-storage
017-bank-reconciliation
020-accounting-ledger
021-supplier-payments
022-maintenance-work-orders
023-inventory-basic
024-access-control-visitors
```

Regla:

```text id="tsp-consumer-rule"
Los módulos consumidores aplican la política; Tenant Settings and Policies no ejecuta sus acciones transaccionales.
```

---

## 21. Seguridad

### 21.1. Controles mínimos

```text id="tsp-security-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- SensitivePermissionGuard.
- ValidationPipe whitelist.
- forbidNonWhitelisted.
- DTO denylist.
- Schema validation.
- Audit obligatorio.
- Change reason en cambios críticos.
- No public endpoints.
- No WordPress public access.
- No secrets.
- No executable policies.
- No scripts.
- No external AI real data.
```

---

### 21.2. Campos prohibidos en DTOs externos

```text id="tsp-forbidden-dto-fields"
tenantId
createdBy
updatedBy
activatedBy
approvedBy
reviewedBy
rejectedBy
archivedBy
status directo fuera de endpoint de transición
versionNumber
secureDocumentStorageKey
storageKey
signedUrl
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
rawSql
script
javascript
functionBody
executableCode
cronCommand
shellCommand
paymentId
journalEntryId
bankTransactionId
reconciliationMatchId
externalAiEnabled
externalAiRealDataAllowed
```

---

### 21.3. Campos prohibidos en responses

```text id="tsp-forbidden-response-fields"
storageKey
signedUrl persistente
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
rawSql
script
functionBody
executableCode
shellCommand
raw stack trace
datos cross-tenant
```

---

## 22. Auditoría

Eventos mínimos:

```text id="tsp-audit-events"
tenantSetting.created
tenantSetting.updated
tenantSetting.scheduled
tenantSetting.activated
tenantSetting.expired
tenantSetting.archived

tenantPolicyDefinition.created
tenantPolicyDefinition.updated
tenantPolicyDefinition.archived

tenantPolicyVersion.created
tenantPolicyVersion.updated
tenantPolicyVersion.submittedForReview
tenantPolicyVersion.approved
tenantPolicyVersion.rejected
tenantPolicyVersion.scheduled
tenantPolicyVersion.activated
tenantPolicyVersion.superseded
tenantPolicyVersion.expired
tenantPolicyVersion.archived

tenantPolicyActivation.created
tenantPolicyActivation.rollbackCreated

tenantPolicyException.created
tenantPolicyException.approved
tenantPolicyException.rejected
tenantPolicyException.activated
tenantPolicyException.expired
tenantPolicyException.revoked
tenantPolicyException.archived

tenantSettings.exported
tenantPolicyEffective.readSensitive
```

Metadata permitida:

```text id="tsp-audit-metadata-allowed"
settingKey
policyKey
category
ownerModule
versionNumber
settingValueId
policyVersionId
policyExceptionId
effectiveFrom
effectiveUntil
source
reason
exportType
format
traceId
```

Metadata prohibida:

```text id="tsp-audit-metadata-forbidden"
secret
token
password
apiKey
privateKey
clientSecret
webhookSecret
databaseUrl
storageKey
signedUrl
rawSql
script
functionBody
executableCode
raw payload sensible
datos cross-tenant
```

---

## 23. Observabilidad

### 23.1. Logs seguros

Eventos loggeables:

```text id="tsp-observability-logs"
tenantSetting.updated
tenantPolicyVersion.created
tenantPolicyVersion.approved
tenantPolicyVersion.activated
tenantPolicyException.created
tenantPolicyException.revoked
tenantSettings.exported
effectivePolicy.cacheMiss
effectivePolicy.cacheInvalidated
```

Campos permitidos:

```text id="tsp-observability-fields"
traceId
requestId
correlationId
action
outcome
category
ownerModule
policyKey
settingKey
status
durationMs
errorCode
```

Campos prohibidos:

```text id="tsp-observability-forbidden"
tenantId como label de alta cardinalidad
secret
token
password
apiKey
privateKey
clientSecret
storageKey
signedUrl
raw policy payload sensible
raw setting value sensible
raw request body
authorization header
cookie
```

---

### 23.2. Métricas

```text id="tsp-metrics"
tenant_settings_updates_total
tenant_policy_versions_created_total
tenant_policy_activations_total
tenant_policy_exceptions_total
tenant_settings_exports_total
tenant_policy_cache_hits_total
tenant_policy_cache_misses_total
tenant_policy_cache_invalidations_total
```

Labels permitidos:

```text id="tsp-metric-labels-allowed"
category
ownerModule
status
outcome
source
```

Labels prohibidos:

```text id="tsp-metric-labels-forbidden"
tenantId
userId
settingValueId
policyVersionId
policyExceptionId
traceId
secretKey
```

---

## 24. Reportes MVP

Reportes administrativos básicos:

```text id="tsp-reports"
- settings vigentes por categoría;
- políticas vigentes por categoría;
- historial de cambios por periodo;
- versiones pendientes de aprobación;
- activaciones futuras;
- excepciones activas;
- políticas sensibles modificadas;
- exportaciones realizadas.
```

Reglas:

```text id="tsp-report-rules"
- Reportes son tenant-scoped.
- Reportes requieren permisos.
- Exportaciones usan SDS.
- No se exportan secretos.
- No se exportan tokens.
```

---

## 25. Defaults iniciales recomendados

### 25.1. General

```text id="tsp-default-general"
timezone = America/Guayaquil
locale = es-EC
currency = USD
defaultPageSize = 25
defaultExportFormat = xlsx
```

---

### 25.2. Seguridad

```text id="tsp-default-security"
publicSettingsApiEnabled = false
wordpressSettingsAccessEnabled = false
externalAiRealDataAllowed = false
sensitiveExportsRequireApproval = true
exportRequiresReason = true
```

---

### 25.3. Access Control

```text id="tsp-default-access"
visitorPreAuthorizationAllowed = true
residentCanCreateVisitor = true
defaultAccessPassTtlMinutes = 1440
oneTimePassDefault = true
guardManualCheckInAllowed = true
guardManualCheckOutAllowed = true
residentCanSeeAccessEvents = true
openCheckInAlertMinutes = 720
```

---

### 25.4. Documents

```text id="tsp-default-documents"
defaultDocumentSensitivity = internal
downloadAuditRequired = true
versioningRequired = true
publicDocumentPublishingAllowed = false
residentDownloadAllowed = true
```

---

### 25.5. Financial

```text id="tsp-default-financial"
currency = USD
paymentValidationRequired = true
receiptRequired = true
partialPaymentsAllowed = true
overpaymentsAllowed = true
autoAllocationEnabled = false
lateFeeEnabled = false
```

---

## 26. Riesgos

| Riesgo                                         |   Nivel | Mitigación                                            |
| ---------------------------------------------- | ------: | ----------------------------------------------------- |
| Cambio de política rompe módulos consumidores  |    Alto | Schema validation, tests contract, defaults seguros   |
| Política financiera altera cálculos históricos |    Alto | No retroactividad silenciosa, versioning, effectiveAt |
| Exposición de configuración sensible           |    Alto | permisos, DTOs seguros, response sanitizer            |
| TenantAdmin cambia setting crítico sin control |    Alto | permisos sensibles, reason, aprobación                |
| PolicyPayload permite código ejecutable        | Crítico | prohibir scripts/DSL ejecutable/raw SQL               |
| WordPress accede settings privados             |    Alto | no public endpoints, CORS restrictivo                 |
| Cache devuelve política obsoleta               |   Medio | invalidación por evento, versionId, TTL               |
| Módulos aplican defaults distintos             |   Medio | catálogo central y tests                              |
| PlatformAdmin accede sin trazabilidad          |    Alto | permisos explícitos y audit                           |
| Export incluye secretos                        | Crítico | secrets prohibidos, sanitizer, tests                  |

---

## 27. Decisiones MVP

```text id="tsp-mvp-decisions"
1. Usar catálogo de definitions con schema validado.
2. Usar policy versions para políticas críticas.
3. Usar defaults seguros por plataforma.
4. Permitir overrides tenant-scoped.
5. No permitir políticas ejecutables.
6. No permitir scripts configurables.
7. No almacenar secretos.
8. No usar WordPress como fuente de configuración.
9. No exponer API pública.
10. No ejecutar efectos transaccionales desde este módulo.
11. Consultar políticas efectivas por puerto interno.
12. Versionar y auditar todo cambio sensible.
13. Soportar cache con invalidación.
14. Usar Secure Document Storage para exportaciones.
```

---

## 28. Criterios de aceptación

```text id="tsp-acceptance"
[ ] El módulo permite listar settings efectivos del tenant.
[ ] El módulo permite actualizar settings permitidos.
[ ] El módulo valida value contra schema.
[ ] El módulo impide settings cross-tenant.
[ ] El módulo permite crear policy versions.
[ ] El módulo valida policyPayload contra schema.
[ ] El módulo genera versionNumber server-side.
[ ] El módulo permite aprobar políticas sensibles.
[ ] El módulo permite activar políticas.
[ ] El módulo permite programar activación futura.
[ ] El módulo resuelve política efectiva por tenant y policyKey.
[ ] El módulo resuelve política efectiva histórica por effectiveAt.
[ ] El módulo aplica default seguro si no existe override.
[ ] El módulo permite crear excepciones con vigencia.
[ ] El módulo permite revocar excepciones.
[ ] El módulo audita cambios críticos.
[ ] El módulo registra historial de cambios.
[ ] El módulo exporta mediante Secure Document Storage.
[ ] El módulo no devuelve storageKey.
[ ] El módulo no almacena secretos.
[ ] El módulo no acepta scripts.
[ ] El módulo no acepta raw SQL.
[ ] El módulo no crea pagos.
[ ] El módulo no crea asientos contables.
[ ] El módulo no confirma conciliaciones bancarias.
[ ] El módulo no modifica datos transaccionales de otros módulos.
[ ] El módulo no expone endpoints públicos.
[ ] El módulo no permite acceso desde WordPress público.
[ ] El módulo no envía datos reales a IA externa.
```

---

## 29. No aceptación

No se acepta el módulo si:

```text id="tsp-no-acceptance"
- permite settings cross-tenant;
- permite policies cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta versionNumber desde cliente;
- acepta status directo fuera de transición;
- almacena secretos;
- almacena tokens;
- almacena passwords;
- almacena apiKeys;
- almacena clientSecrets;
- almacena privateKeys;
- almacena raw SQL;
- almacena scripts;
- almacena código ejecutable;
- permite policyPayload ejecutable;
- permite JavaScript configurable por tenant;
- modifica cargos desde este módulo;
- modifica pagos desde este módulo;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- modifica eventos de acceso;
- abre portones;
- controla hardware;
- habilita biometría;
- habilita reconocimiento facial;
- expone endpoints públicos;
- permite acceso desde WordPress público;
- expone configuración sensible en /me;
- exporta sin Secure Document Storage;
- devuelve storageKey;
- omite auditoría de cambios críticos;
- permite cambios retroactivos sin permiso reforzado;
- no conserva historial de versiones;
- usa IA externa con datos reales.
```

---

## 30. Resultado esperado

Al implementar `025-tenant-settings-policies`, RESIDENT Core contará con un módulo transversal para administrar configuración y políticas de cada conjunto residencial de manera segura, versionada, auditada y preparada para crecimiento modular o microservicios.

Resultado esperado:

```text id="tsp-expected-result"
tenant settings definidos
tenant policies definidas
setting definitions definidas
policy definitions definidas
policy versions definidas
policy activations definidas
policy exceptions definidas
effective settings definidos
effective policies definidas
tenant overrides definidos
secure defaults definidos
versioning definido
effective dating definido
change history definido
policy comparison definido
resident summaries definidos
exports definidos vía SDS
audit definido
observability definida
cache strategy definida
no public endpoints
no WordPress access
no secrets
no executable policies
no transaction side effects
no payment creation
no accounting creation
no reconciliation confirmation
no external AI with real data
```

---

## 31. Expediente actualizado

```text id="tsp-expediente"
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
│   │   ├── 017-bank-reconciliation/
│   │   ├── 018-payment-provider-integration/
│   │   ├── 019-open-banking-integration/
│   │   ├── 020-accounting-ledger/
│   │   ├── 021-supplier-payments/
│   │   ├── 022-maintenance-work-orders/
│   │   ├── 023-inventory-basic/
│   │   ├── 024-access-control-visitors/
│   │   └── 025-tenant-settings-policies/
│   │       └── spec.md
```
