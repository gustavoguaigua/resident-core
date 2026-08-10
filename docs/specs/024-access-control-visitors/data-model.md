# Data Model — 024 Access Control and Visitors

## 1. Información del documento

| Campo                  | Valor                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto               | RESIDENT Core                                                                                                                             |
| Spec ID                | 024                                                                                                                                       |
| Módulo                 | Access Control and Visitors                                                                                                               |
| Documento              | Data Model                                                                                                                                |
| Ruta                   | `docs/specs/024-access-control-visitors/data-model.md`                                                                                    |
| Versión                | 0.1                                                                                                                                       |
| Estado                 | needs-review                                                                                                                              |
| Fecha                  | 2026-07-24                                                                                                                                |
| Documento base         | `docs/specs/024-access-control-visitors/spec.md`                                                                                          |
| Plan técnico           | `docs/specs/024-access-control-visitors/plan.md`                                                                                          |
| Base de datos objetivo | PostgreSQL                                                                                                                                |
| ORM objetivo           | Prisma                                                                                                                                    |
| Estrategia multitenant | Shared database / shared schema / tenant_id                                                                                               |
| Naturaleza             | Tenant-scoped / Security-sensitive / Privacy-sensitive / Visitor-driven / Resident-authorized / Guard-operated / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define el modelo de datos del módulo `024-access-control-visitors`.

El modelo cubre visitantes, vehículos visitantes, puntos de acceso, autorizaciones, pases temporales, eventos de acceso, ingresos, salidas, entregas, visitas de proveedores, autorizaciones recurrentes básicas, incidentes, comentarios, documentos, exportaciones y trazabilidad operativa.

Regla central del modelo:

```text id="m01rbn"
Todo dato de Access Control and Visitors debe pertenecer a un tenant, proteger datos personales, mantener tenant isolation, enmascarar identificación, teléfono, placa y códigos sensibles, registrar trazabilidad completa de autorizaciones, check-ins, check-outs e incidentes, impedir acceso cross-tenant, impedir endpoints públicos, impedir acceso desde WordPress público, impedir biometría, impedir reconocimiento facial, impedir apertura automática de portones, impedir control físico de hardware en MVP, impedir IA externa con datos reales y almacenar documentos únicamente mediante Secure Document Storage sin exponer storageKey.
```

---

## 3. Principios de modelado

### 3.1. Tenant isolation obligatorio

Todas las tablas operativas incluyen:

```text id="ytl5rm"
tenant_id
```

Ninguna entidad tenant-scoped debe consultarse únicamente por `id`.

Patrón obligatorio:

```typescript id="h5xbnr"
await prisma.visitorProfile.findFirst({
  where: {
    id: visitorId,
    tenantId: currentTenant.id,
    archivedAt: null
  }
});
```

Patrón prohibido:

```typescript id="htyq23"
await prisma.visitorProfile.findUnique({
  where: { id: visitorId }
});
```

---

### 3.2. Separación entre visitante y evento

El visitante no es el acceso.

Separación conceptual:

```text id="dx0t81"
VisitorProfile = persona externa registrada
AccessAuthorization = permiso previo o administrativo
AccessPass = código/token temporal
AccessEvent = evento trazable de acceso
AccessCheckIn = ingreso registrado
AccessCheckOut = salida registrada
```

Regla:

```text id="nal2hx"
El historial de seguridad se reconstruye desde AccessEvent, AccessCheckIn y AccessCheckOut, no desde VisitorProfile.
```

---

### 3.3. Privacidad por diseño

Los datos personales deben minimizarse.

No se debe exponer por defecto:

```text id="rkztsu"
identificationNumber raw
phone raw
plate raw
accessPassCode raw
document images
storageKey
signedUrl persistente
```

Patrón recomendado:

```text id="slt1lv"
raw input temporal
-> normalización
-> HMAC/hash tenant-aware para búsqueda exacta
-> masked value para visualización
-> descartar raw value
```

---

### 3.4. Hash seguro para búsqueda exacta

Para identificación, teléfono, placa y códigos temporales se recomienda:

```text id="x3tmyc"
HMAC-SHA256(normalizedValue, tenantScopedPepper)
```

Reglas:

```text id="de6rd6"
- No almacenar valores raw por defecto.
- No exponer hashes por API.
- No usar hash simple sin pepper.
- No compartir pepper entre ambientes.
- No registrar pepper en logs.
```

---

### 3.5. Eventos críticos no se borran físicamente

Los eventos críticos deben ser corregidos, anulados o archivados, pero no eliminados físicamente.

Aplica a:

```text id="x7ohpt"
access_events
access_check_ins
access_check_outs
access_authorizations
access_passes
access_incidents
```

Regla:

```text id="g45vl9"
Un error de registro de acceso se corrige con estado, razón y auditoría, no con borrado destructivo.
```

---

### 3.6. Access Control no controla hardware en MVP

El modelo no debe incluir comandos operativos de hardware.

Prohibido en MVP:

```text id="e9x1fv"
gate_open_command
hardware_device_command
camera_stream_url
face_embedding
biometric_template
plate_ocr_payload
rfid_credential_secret
nfc_secret
```

---

### 3.7. Access Control no es pagos ni contabilidad

Registrar visitantes, proveedores o parqueos no crea:

```text id="xg6trc"
Payment
PaymentAllocation
SupplierPayable
SupplierPaymentOrder
JournalEntry
BankTransaction
ReconciliationMatch
```

---

## 4. Tablas del módulo

Tablas MVP:

```text id="lv4pd3"
visitor_profiles
visitor_vehicles
access_gates
access_authorizations
access_passes
access_events
access_check_ins
access_check_outs
visitor_deliveries
visitor_supplier_visits
visitor_recurring_authorizations
access_incidents
access_comments
access_documents
access_report_exports
```

---

## 5. Dependencias externas del modelo

| Módulo                             | Tabla / entidad referenciada                        | Uso                                                  |
| ---------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `001-tenants`                      | `tenants`                                           | Tenant owner de todos los registros                  |
| `002-users-roles`                  | `user_profiles`                                     | Actores, residentes, guardias, administradores       |
| `003-residents-properties`         | `persons`, `property_units`, residencies/ownerships | Unidad visitada, residente autorizador, destinatario |
| `010-reservations-common-areas`    | `common_areas`, reservations futuro                 | Accesos por reservas futuras                         |
| `012-communications-notifications` | notifications                                       | Notificaciones de visitante, incidente o entrega     |
| `016-secure-document-storage`      | `secure_documents`                                  | Documentos y exportaciones                           |
| `021-supplier-payments`            | `suppliers`                                         | Proveedor visitante                                  |
| `022-maintenance-work-orders`      | `maintenance_work_orders`                           | Visitas técnicas relacionadas                        |
| `007-audit`                        | `audit_logs`                                        | Auditoría                                            |
| `008-basic-reports`                | report registry                                     | Reportes y exportaciones                             |

---

## 6. Estrategia de referencias externas

Para preservar límites modulares y facilitar microservicios futuros, las referencias externas se almacenan como UUID y se validan mediante puertos.

Referencias externas típicas:

```text id="rcjovy"
property_unit_id
person_id
authorized_by_user_id
authorized_by_person_id
recorded_by_user_id
checked_in_by_user_id
checked_out_by_user_id
supplier_id
maintenance_work_order_id
secure_document_id
created_by
updated_by
cancelled_by
revoked_by
archived_by
voided_by
corrected_by
resolved_by
dismissed_by
```

Regla:

```text id="t18lpj"
La integridad con módulos externos se valida en servicios de aplicación, no mediante acceso cross-module no controlado.
```

---

# 7. Entidades

---

## 7.1. `visitor_profiles`

### Propósito

Representa una persona externa que puede visitar el conjunto residencial.

### Campos

| Campo                          |         Tipo | Obligatorio | Descripción                                     |
| ------------------------------ | -----------: | ----------: | ----------------------------------------------- |
| `id`                           |         UUID |          Sí | Identificador                                   |
| `tenant_id`                    |         UUID |          Sí | Tenant owner                                    |
| `full_name`                    | varchar(180) |          Sí | Nombre del visitante                            |
| `normalized_full_name`         | varchar(180) |          No | Nombre normalizado para búsqueda                |
| `identification_type`          |         enum |          No | Tipo de identificación                          |
| `identification_number_masked` |  varchar(80) |          No | Identificación enmascarada                      |
| `identification_number_hash`   | varchar(128) |          No | HMAC/hash tenant-aware                          |
| `phone_masked`                 |  varchar(50) |          No | Teléfono enmascarado                            |
| `phone_hash`                   | varchar(128) |          No | HMAC/hash tenant-aware                          |
| `email_masked`                 | varchar(120) |          No | Email enmascarado si se usa                     |
| `email_hash`                   | varchar(128) |          No | HMAC/hash tenant-aware                          |
| `visitor_type`                 |         enum |          Sí | guest/family/delivery/supplier/etc.             |
| `status`                       |         enum |          Sí | active/watchlistedTenant/blockedTenant/archived |
| `watchlist_reason`             |         text |          No | Razón de observación local                      |
| `block_reason`                 |         text |          No | Razón de bloqueo local                          |
| `notes`                        |         text |          No | Notas sanitizadas                               |
| `created_by`                   |         UUID |          Sí | Actor creador                                   |
| `updated_by`                   |         UUID |          No | Actor actualizador                              |
| `watchlisted_by`               |         UUID |          No | Actor que puso watchlist                        |
| `blocked_by`                   |         UUID |          No | Actor que bloqueó                               |
| `archived_by`                  |         UUID |          No | Actor que archivó                               |
| `created_at`                   |  timestamptz |          Sí | Fecha creación                                  |
| `updated_at`                   |  timestamptz |          Sí | Fecha actualización                             |
| `watchlisted_at`               |  timestamptz |          No | Fecha watchlist                                 |
| `blocked_at`                   |  timestamptz |          No | Fecha bloqueo                                   |
| `archived_at`                  |  timestamptz |          No | Archivo lógico                                  |
| `archive_reason`               |         text |          No | Razón archivo                                   |
| `metadata`                     |        jsonb |          No | Metadata sanitizada                             |

### Reglas

```text id="i8g3yu"
- VisitorProfile pertenece a un tenant.
- fullName es obligatorio.
- identificationNumber raw no se almacena por defecto.
- phone raw no se almacena por defecto.
- blockedTenant impide nuevas autorizaciones salvo override auditado.
- watchlistedTenant genera advertencia operativa.
- archived no puede usarse en nuevos accesos.
- Watchlist y blocked son locales al tenant.
- No existe lista global multi-tenant en MVP.
```

---

## 7.2. `visitor_vehicles`

### Propósito

Representa un vehículo visitante asociado a un visitante o a eventos de acceso.

### Campos

| Campo              |         Tipo | Obligatorio | Descripción                                     |
| ------------------ | -----------: | ----------: | ----------------------------------------------- |
| `id`               |         UUID |          Sí | Identificador                                   |
| `tenant_id`        |         UUID |          Sí | Tenant owner                                    |
| `visitor_id`       |         UUID |          No | Visitante asociado                              |
| `plate_masked`     |  varchar(40) |          Sí | Placa enmascarada                               |
| `plate_hash`       | varchar(128) |          Sí | HMAC/hash tenant-aware                          |
| `vehicle_type`     |         enum |          Sí | car/motorcycle/truck/bicycle/etc.               |
| `vehicle_color`    |  varchar(80) |          No | Color                                           |
| `vehicle_brand`    |  varchar(80) |          No | Marca                                           |
| `vehicle_model`    |  varchar(80) |          No | Modelo                                          |
| `status`           |         enum |          Sí | active/watchlistedTenant/blockedTenant/archived |
| `watchlist_reason` |         text |          No | Razón watchlist                                 |
| `block_reason`     |         text |          No | Razón bloqueo                                   |
| `created_by`       |         UUID |          Sí | Actor creador                                   |
| `updated_by`       |         UUID |          No | Actor actualizador                              |
| `watchlisted_by`   |         UUID |          No | Actor watchlist                                 |
| `blocked_by`       |         UUID |          No | Actor bloqueo                                   |
| `archived_by`      |         UUID |          No | Actor archivo                                   |
| `created_at`       |  timestamptz |          Sí | Fecha creación                                  |
| `updated_at`       |  timestamptz |          Sí | Fecha actualización                             |
| `watchlisted_at`   |  timestamptz |          No | Fecha watchlist                                 |
| `blocked_at`       |  timestamptz |          No | Fecha bloqueo                                   |
| `archived_at`      |  timestamptz |          No | Archivo lógico                                  |
| `archive_reason`   |         text |          No | Razón archivo                                   |
| `metadata`         |        jsonb |          No | Metadata sanitizada                             |

### Reglas

```text id="d59gmp"
- La placa raw no se almacena ni se expone por defecto.
- plateHash permite búsqueda exacta.
- visitorId debe pertenecer al mismo tenant si existe.
- blockedTenant impide ingreso vehicular salvo override auditado.
- archived no puede usarse en nuevos accesos.
```

---

## 7.3. `access_gates`

### Propósito

Representa un punto de acceso físico o lógico del conjunto.

Ejemplos:

```text id="m9cqko"
MAIN_GATE
VEHICLE_GATE
PEDESTRIAN_GATE
SUPPLIER_GATE
SECONDARY_GATE
```

### Campos

| Campo              |         Tipo | Obligatorio | Descripción                                      |
| ------------------ | -----------: | ----------: | ------------------------------------------------ |
| `id`               |         UUID |          Sí | Identificador                                    |
| `tenant_id`        |         UUID |          Sí | Tenant owner                                     |
| `gate_code`        |  varchar(80) |          Sí | Código único por tenant                          |
| `gate_name`        | varchar(180) |          Sí | Nombre visible                                   |
| `gate_type`        |         enum |          Sí | main/vehicle/pedestrian/supplier/secondary/other |
| `description`      |         text |          No | Descripción                                      |
| `is_entry_allowed` |      boolean |          Sí | Permite ingresos                                 |
| `is_exit_allowed`  |      boolean |          Sí | Permite salidas                                  |
| `status`           |         enum |          Sí | active/inactive/archived                         |
| `created_by`       |         UUID |          Sí | Actor creador                                    |
| `updated_by`       |         UUID |          No | Actor actualizador                               |
| `archived_by`      |         UUID |          No | Actor archivo                                    |
| `created_at`       |  timestamptz |          Sí | Fecha creación                                   |
| `updated_at`       |  timestamptz |          Sí | Fecha actualización                              |
| `archived_at`      |  timestamptz |          No | Archivo lógico                                   |
| `archive_reason`   |         text |          No | Razón archivo                                    |
| `metadata`         |        jsonb |          No | Metadata sanitizada                              |

### Reglas

```text id="gjht1x"
- gate_code es único por tenant entre gates no archivados.
- gate active puede recibir eventos.
- gate inactive no debe recibir nuevos eventos ordinarios salvo override.
- gate archived no puede usarse en nuevos eventos.
- No abre puertas automáticamente en MVP.
```

---

## 7.4. `access_authorizations`

### Propósito

Representa una autorización previa, recurrente o administrativa para ingreso.

### Campos

| Campo                     |        Tipo | Obligatorio | Descripción                                          |
| ------------------------- | ----------: | ----------: | ---------------------------------------------------- |
| `id`                      |        UUID |          Sí | Identificador                                        |
| `tenant_id`               |        UUID |          Sí | Tenant owner                                         |
| `authorization_number`    | varchar(60) |          Sí | Número único por tenant                              |
| `visitor_id`              |        UUID |          Sí | Visitante autorizado                                 |
| `vehicle_id`              |        UUID |          No | Vehículo autorizado                                  |
| `property_unit_id`        |        UUID |          No | Unidad visitada                                      |
| `authorized_by_user_id`   |        UUID |          Sí | UserProfile autorizador                              |
| `authorized_by_person_id` |        UUID |          No | Person autorizador                                   |
| `authorization_type`      |        enum |          Sí | oneTime/dateRange/recurringBasic/etc.                |
| `authorization_scope`     |        enum |          Sí | unit/supplier/commonArea/administrative              |
| `valid_from`              | timestamptz |          Sí | Inicio vigencia                                      |
| `valid_until`             | timestamptz |          Sí | Fin vigencia                                         |
| `max_entries`             |         int |          No | Máximo de ingresos                                   |
| `entries_used`            |         int |          Sí | Ingresos usados                                      |
| `reason`                  |        text |          No | Motivo                                               |
| `status`                  |        enum |          Sí | draft/active/used/expired/cancelled/revoked/archived |
| `cancel_reason`           |        text |          No | Razón cancelación                                    |
| `revoke_reason`           |        text |          No | Razón revocación                                     |
| `created_by`              |        UUID |          Sí | Actor creador                                        |
| `updated_by`              |        UUID |          No | Actor actualizador                                   |
| `activated_by`            |        UUID |          No | Actor activación                                     |
| `cancelled_by`            |        UUID |          No | Actor cancelación                                    |
| `revoked_by`              |        UUID |          No | Actor revocación                                     |
| `archived_by`             |        UUID |          No | Actor archivo                                        |
| `created_at`              | timestamptz |          Sí | Creación                                             |
| `updated_at`              | timestamptz |          Sí | Actualización                                        |
| `activated_at`            | timestamptz |          No | Activación                                           |
| `used_at`                 | timestamptz |          No | Primer/último uso según política                     |
| `expired_at`              | timestamptz |          No | Expiración                                           |
| `cancelled_at`            | timestamptz |          No | Cancelación                                          |
| `revoked_at`              | timestamptz |          No | Revocación                                           |
| `archived_at`             | timestamptz |          No | Archivo                                              |
| `archive_reason`          |        text |          No | Razón archivo                                        |
| `metadata`                |       jsonb |          No | Metadata sanitizada                                  |

### Reglas

```text id="huklc8"
- authorization_number es único por tenant.
- visitor_id debe pertenecer al tenant.
- vehicle_id debe pertenecer al tenant si existe.
- property_unit_id debe pertenecer al tenant si existe.
- valid_from < valid_until.
- active requiere vigencia válida.
- expired/cancelled/revoked no permite ingreso.
- oneTime puede pasar a used después del primer check-in exitoso.
- entries_used <= max_entries si max_entries existe.
- Resident solo puede crear autorización para unidad propia.
- Cancelación y revocación requieren razón.
```

---

## 7.5. `access_passes`

### Propósito

Representa un código o token temporal asociado a una autorización.

### Campos

| Campo              |         Tipo | Obligatorio | Descripción                          |
| ------------------ | -----------: | ----------: | ------------------------------------ |
| `id`               |         UUID |          Sí | Identificador                        |
| `tenant_id`        |         UUID |          Sí | Tenant owner                         |
| `authorization_id` |         UUID |          Sí | Autorización                         |
| `pass_code_hash`   | varchar(128) |          Sí | HMAC/hash del código                 |
| `pass_code_masked` |  varchar(40) |          Sí | Código enmascarado                   |
| `pass_type`        |         enum |          Sí | shortCode/qrLogical/token            |
| `expires_at`       |  timestamptz |          Sí | Expiración                           |
| `used_at`          |  timestamptz |          No | Uso                                  |
| `used_by_user_id`  |         UUID |          No | Actor que validó                     |
| `status`           |         enum |          Sí | active/used/expired/revoked/archived |
| `revoked_by`       |         UUID |          No | Actor revocación                     |
| `revoked_at`       |  timestamptz |          No | Fecha revocación                     |
| `revoke_reason`    |         text |          No | Razón revocación                     |
| `created_by`       |         UUID |          Sí | Actor creador                        |
| `archived_by`      |         UUID |          No | Actor archivo                        |
| `created_at`       |  timestamptz |          Sí | Fecha creación                       |
| `archived_at`      |  timestamptz |          No | Archivo lógico                       |
| `archive_reason`   |         text |          No | Razón archivo                        |
| `metadata`         |        jsonb |          No | Metadata sanitizada                  |

### Reglas

```text id="fus1a6"
- pass_code raw no se almacena.
- pass_code_hash no se expone por API.
- pass_code_masked puede exponerse solo según permiso.
- active expira automáticamente por expires_at.
- used no puede reutilizarse en autorización oneTime.
- revoked no permite ingreso.
- No abre puertas automáticamente en MVP.
```

---

## 7.6. `access_events`

### Propósito

Fuente de trazabilidad para eventos de acceso.

Eventos posibles:

```text id="rj0byi"
checkIn
checkOut
deniedAccess
manualReview
incident
systemNote
```

### Campos

| Campo                 |        Tipo | Obligatorio | Descripción                        |
| --------------------- | ----------: | ----------: | ---------------------------------- |
| `id`                  |        UUID |          Sí | Identificador                      |
| `tenant_id`           |        UUID |          Sí | Tenant owner                       |
| `event_number`        | varchar(60) |          Sí | Número único por tenant            |
| `visitor_id`          |        UUID |          No | Visitante                          |
| `vehicle_id`          |        UUID |          No | Vehículo                           |
| `authorization_id`    |        UUID |          No | Autorización                       |
| `access_pass_id`      |        UUID |          No | Pase usado                         |
| `property_unit_id`    |        UUID |          No | Unidad visitada                    |
| `gate_id`             |        UUID |          Sí | Punto de acceso                    |
| `event_type`          |        enum |          Sí | checkIn/checkOut/etc.              |
| `event_status`        |        enum |          Sí | recorded/corrected/voided/archived |
| `occurred_at`         | timestamptz |          Sí | Fecha/hora server-side             |
| `recorded_by_user_id` |        UUID |          Sí | Guardia o actor                    |
| `guard_shift_id`      |        UUID |          No | Turno básico opcional              |
| `reason`              |        text |          No | Motivo                             |
| `notes`               |        text |          No | Notas sanitizadas                  |
| `corrected_by`        |        UUID |          No | Actor corrección                   |
| `corrected_at`        | timestamptz |          No | Fecha corrección                   |
| `correction_reason`   |        text |          No | Razón corrección                   |
| `voided_by`           |        UUID |          No | Actor anulación                    |
| `voided_at`           | timestamptz |          No | Fecha anulación                    |
| `void_reason`         |        text |          No | Razón anulación                    |
| `created_at`          | timestamptz |          Sí | Creación                           |
| `updated_at`          | timestamptz |          Sí | Actualización                      |
| `archived_at`         | timestamptz |          No | Archivo                            |
| `archive_reason`      |        text |          No | Razón archivo                      |
| `metadata`            |       jsonb |          No | Metadata sanitizada                |

### Reglas

```text id="zlmduz"
- event_number es único por tenant.
- gate_id debe pertenecer al tenant.
- visitor_id debe pertenecer al tenant si existe.
- vehicle_id debe pertenecer al tenant si existe.
- authorization_id debe pertenecer al tenant si existe.
- AccessEvent no se elimina físicamente.
- correct y void requieren razón.
- Cross-tenant debe retornar 404.
```

---

## 7.7. `access_check_ins`

### Propósito

Registro específico de ingreso.

### Campos

| Campo                   |        Tipo | Obligatorio | Descripción                             |
| ----------------------- | ----------: | ----------: | --------------------------------------- |
| `id`                    |        UUID |          Sí | Identificador                           |
| `tenant_id`             |        UUID |          Sí | Tenant owner                            |
| `access_event_id`       |        UUID |          Sí | Evento checkIn                          |
| `visitor_id`            |        UUID |          Sí | Visitante                               |
| `vehicle_id`            |        UUID |          No | Vehículo                                |
| `authorization_id`      |        UUID |          No | Autorización                            |
| `access_pass_id`        |        UUID |          No | Pase                                    |
| `property_unit_id`      |        UUID |          No | Unidad visitada                         |
| `gate_id`               |        UUID |          Sí | Punto de acceso                         |
| `entry_method`          |        enum |          Sí | authorization/pass/manual/override/etc. |
| `checked_in_at`         | timestamptz |          Sí | Fecha/hora ingreso                      |
| `checked_in_by_user_id` |        UUID |          Sí | Guardia o actor                         |
| `status`                |        enum |          Sí | open/closed/voided/archived             |
| `manual_reason`         |        text |          No | Razón ingreso manual                    |
| `voided_by`             |        UUID |          No | Actor anulación                         |
| `voided_at`             | timestamptz |          No | Fecha anulación                         |
| `void_reason`           |        text |          No | Razón anulación                         |
| `closed_at`             | timestamptz |          No | Fecha cierre por check-out              |
| `created_at`            | timestamptz |          Sí | Creación                                |
| `updated_at`            | timestamptz |          Sí | Actualización                           |
| `archived_at`           | timestamptz |          No | Archivo                                 |
| `archive_reason`        |        text |          No | Razón archivo                           |
| `metadata`              |       jsonb |          No | Metadata sanitizada                     |

### Reglas

```text id="xv0iyu"
- access_event_id debe ser checkIn.
- checked_in_at es server-side.
- checked_in_by_user_id es server-side.
- check-in con autorización valida status/vigencia.
- check-in manual requiere razón y permiso.
- open representa visitante dentro o salida no registrada.
- voided requiere razón.
```

---

## 7.8. `access_check_outs`

### Propósito

Registro específico de salida.

### Campos

| Campo                    |        Tipo | Obligatorio | Descripción               |
| ------------------------ | ----------: | ----------: | ------------------------- |
| `id`                     |        UUID |          Sí | Identificador             |
| `tenant_id`              |        UUID |          Sí | Tenant owner              |
| `access_event_id`        |        UUID |          Sí | Evento checkOut           |
| `check_in_id`            |        UUID |          No | Check-in abierto asociado |
| `visitor_id`             |        UUID |          Sí | Visitante                 |
| `vehicle_id`             |        UUID |          No | Vehículo                  |
| `gate_id`                |        UUID |          Sí | Punto de salida           |
| `exit_method`            |        enum |          Sí | normal/manual/override    |
| `checked_out_at`         | timestamptz |          Sí | Fecha/hora salida         |
| `checked_out_by_user_id` |        UUID |          Sí | Guardia o actor           |
| `status`                 |        enum |          Sí | recorded/voided/archived  |
| `manual_reason`          |        text |          No | Razón salida manual       |
| `voided_by`              |        UUID |          No | Actor anulación           |
| `voided_at`              | timestamptz |          No | Fecha anulación           |
| `void_reason`            |        text |          No | Razón anulación           |
| `created_at`             | timestamptz |          Sí | Creación                  |
| `updated_at`             | timestamptz |          Sí | Actualización             |
| `archived_at`            | timestamptz |          No | Archivo                   |
| `archive_reason`         |        text |          No | Razón archivo             |
| `metadata`               |       jsonb |          No | Metadata sanitizada       |

### Reglas

```text id="n7wq59"
- access_event_id debe ser checkOut.
- check_in_id debe pertenecer al tenant si existe.
- No debe existir doble check-out activo para el mismo check-in.
- checked_out_at es server-side.
- Salida sin check-in requiere manual_reason y permiso.
- voided requiere razón.
```

---

## 7.9. `visitor_deliveries`

### Propósito

Registra entregas, deliveries o mensajería.

### Campos

| Campo                     |         Tipo | Obligatorio | Descripción                                                           |
| ------------------------- | -----------: | ----------: | --------------------------------------------------------------------- |
| `id`                      |         UUID |          Sí | Identificador                                                         |
| `tenant_id`               |         UUID |          Sí | Tenant owner                                                          |
| `delivery_number`         |  varchar(60) |          Sí | Número único por tenant                                               |
| `visitor_id`              |         UUID |          No | Visitante/repartidor                                                  |
| `access_event_id`         |         UUID |          No | Evento asociado                                                       |
| `check_in_id`             |         UUID |          No | Ingreso asociado                                                      |
| `property_unit_id`        |         UUID |          Sí | Unidad destino                                                        |
| `recipient_person_id`     |         UUID |          No | Destinatario                                                          |
| `delivery_company_masked` | varchar(120) |          No | Empresa enmascarada o normal                                          |
| `package_description`     |         text |          No | Descripción mínima                                                    |
| `status`                  |         enum |          Sí | registered/receivedAtGate/deliveredToUnit/returned/cancelled/archived |
| `received_at`             |  timestamptz |          No | Fecha recepción                                                       |
| `delivered_at`            |  timestamptz |          No | Fecha entrega                                                         |
| `returned_at`             |  timestamptz |          No | Fecha devolución                                                      |
| `cancelled_at`            |  timestamptz |          No | Fecha cancelación                                                     |
| `return_reason`           |         text |          No | Razón devolución                                                      |
| `cancel_reason`           |         text |          No | Razón cancelación                                                     |
| `created_by`              |         UUID |          Sí | Actor creador                                                         |
| `updated_by`              |         UUID |          No | Actor actualizador                                                    |
| `received_by`             |         UUID |          No | Actor recepción                                                       |
| `delivered_by`            |         UUID |          No | Actor entrega                                                         |
| `returned_by`             |         UUID |          No | Actor devolución                                                      |
| `cancelled_by`            |         UUID |          No | Actor cancelación                                                     |
| `archived_by`             |         UUID |          No | Actor archivo                                                         |
| `created_at`              |  timestamptz |          Sí | Creación                                                              |
| `updated_at`              |  timestamptz |          Sí | Actualización                                                         |
| `archived_at`             |  timestamptz |          No | Archivo                                                               |
| `archive_reason`          |         text |          No | Razón archivo                                                         |
| `metadata`                |        jsonb |          No | Metadata sanitizada                                                   |

### Reglas

```text id="dr9xq5"
- delivery_number es único por tenant.
- property_unit_id debe pertenecer al tenant.
- No registrar contenido sensible innecesario del paquete.
- returned requiere return_reason.
- cancelled requiere cancel_reason.
```

---

## 7.10. `visitor_supplier_visits`

### Propósito

Registra visitas de proveedores, técnicos o representantes externos.

### Campos

| Campo                       |        Tipo | Obligatorio | Descripción                                              |
| --------------------------- | ----------: | ----------: | -------------------------------------------------------- |
| `id`                        |        UUID |          Sí | Identificador                                            |
| `tenant_id`                 |        UUID |          Sí | Tenant owner                                             |
| `supplier_visit_number`     | varchar(60) |          Sí | Número único por tenant                                  |
| `supplier_id`               |        UUID |          No | Proveedor                                                |
| `visitor_id`                |        UUID |          Sí | Visitante representante                                  |
| `vehicle_id`                |        UUID |          No | Vehículo                                                 |
| `access_event_id`           |        UUID |          No | Evento asociado                                          |
| `check_in_id`               |        UUID |          No | Check-in asociado                                        |
| `check_out_id`              |        UUID |          No | Check-out asociado                                       |
| `property_unit_id`          |        UUID |          No | Unidad relacionada                                       |
| `common_area_id`            |        UUID |          No | Área común relacionada                                   |
| `maintenance_work_order_id` |        UUID |          No | Orden de mantenimiento                                   |
| `reason`                    |        text |          Sí | Motivo                                                   |
| `status`                    |        enum |          Sí | scheduled/checkedIn/checkedOut/cancelled/denied/archived |
| `scheduled_from`            | timestamptz |          No | Inicio planificado                                       |
| `scheduled_until`           | timestamptz |          No | Fin planificado                                          |
| `checked_in_at`             | timestamptz |          No | Ingreso                                                  |
| `checked_out_at`            | timestamptz |          No | Salida                                                   |
| `cancelled_at`              | timestamptz |          No | Cancelación                                              |
| `denied_at`                 | timestamptz |          No | Denegación                                               |
| `cancel_reason`             |        text |          No | Razón cancelación                                        |
| `denial_reason`             |        text |          No | Razón denegación                                         |
| `created_by`                |        UUID |          Sí | Actor creador                                            |
| `updated_by`                |        UUID |          No | Actor actualizador                                       |
| `cancelled_by`              |        UUID |          No | Actor cancelación                                        |
| `denied_by`                 |        UUID |          No | Actor denegación                                         |
| `archived_by`               |        UUID |          No | Actor archivo                                            |
| `created_at`                | timestamptz |          Sí | Creación                                                 |
| `updated_at`                | timestamptz |          Sí | Actualización                                            |
| `archived_at`               | timestamptz |          No | Archivo                                                  |
| `archive_reason`            |        text |          No | Razón archivo                                            |
| `metadata`                  |       jsonb |          No | Metadata sanitizada                                      |

### Reglas

```text id="oryqav"
- supplier_visit_number es único por tenant.
- supplier_id debe pertenecer al tenant si existe.
- supplier blocked se rechaza salvo override auditado.
- visitor_id debe pertenecer al tenant.
- maintenance_work_order_id debe pertenecer al tenant si existe.
- No crea SupplierPayable.
- No crea SupplierPaymentOrder.
- No crea Payment.
- No modifica Maintenance Work Orders.
```

---

## 7.11. `visitor_recurring_authorizations`

### Propósito

Define autorizaciones recurrentes básicas para visitantes frecuentes.

### Campos

| Campo                            |        Tipo | Obligatorio | Descripción                               |
| -------------------------------- | ----------: | ----------: | ----------------------------------------- |
| `id`                             |        UUID |          Sí | Identificador                             |
| `tenant_id`                      |        UUID |          Sí | Tenant owner                              |
| `recurring_authorization_number` | varchar(60) |          Sí | Número único por tenant                   |
| `visitor_id`                     |        UUID |          Sí | Visitante                                 |
| `vehicle_id`                     |        UUID |          No | Vehículo                                  |
| `property_unit_id`               |        UUID |          No | Unidad                                    |
| `authorized_by_user_id`          |        UUID |          Sí | Usuario autorizador                       |
| `authorization_type`             |        enum |          Sí | recurringBasic                            |
| `valid_from`                     |        date |          Sí | Fecha inicio                              |
| `valid_until`                    |        date |          Sí | Fecha fin                                 |
| `days_of_week`                   |       jsonb |          Sí | Días permitidos                           |
| `time_from`                      |        time |          No | Hora inicio                               |
| `time_until`                     |        time |          No | Hora fin                                  |
| `max_entries_per_day`            |         int |          No | Límite diario                             |
| `status`                         |        enum |          Sí | active/cancelled/revoked/expired/archived |
| `reason`                         |        text |          No | Motivo                                    |
| `cancel_reason`                  |        text |          No | Razón cancelación                         |
| `revoke_reason`                  |        text |          No | Razón revocación                          |
| `created_by`                     |        UUID |          Sí | Actor creador                             |
| `updated_by`                     |        UUID |          No | Actor actualizador                        |
| `cancelled_by`                   |        UUID |          No | Actor cancelación                         |
| `revoked_by`                     |        UUID |          No | Actor revocación                          |
| `archived_by`                    |        UUID |          No | Actor archivo                             |
| `created_at`                     | timestamptz |          Sí | Creación                                  |
| `updated_at`                     | timestamptz |          Sí | Actualización                             |
| `cancelled_at`                   | timestamptz |          No | Cancelación                               |
| `revoked_at`                     | timestamptz |          No | Revocación                                |
| `expired_at`                     | timestamptz |          No | Expiración                                |
| `archived_at`                    | timestamptz |          No | Archivo                                   |
| `archive_reason`                 |        text |          No | Razón archivo                             |
| `metadata`                       |       jsonb |          No | Metadata sanitizada                       |

### Reglas

```text id="yw0c7q"
- valid_from <= valid_until.
- days_of_week debe tener patrón válido.
- time_from < time_until si ambos existen.
- Resident solo puede crear recurrente para unidad propia si tenant policy lo permite.
- No equivale a pase permanente sin control.
```

---

## 7.12. `access_incidents`

### Propósito

Registra novedades o incidentes relacionados con accesos.

### Campos

| Campo               |        Tipo | Obligatorio | Descripción                                  |
| ------------------- | ----------: | ----------: | -------------------------------------------- |
| `id`                |        UUID |          Sí | Identificador                                |
| `tenant_id`         |        UUID |          Sí | Tenant owner                                 |
| `incident_number`   | varchar(60) |          Sí | Número único por tenant                      |
| `visitor_id`        |        UUID |          No | Visitante                                    |
| `vehicle_id`        |        UUID |          No | Vehículo                                     |
| `access_event_id`   |        UUID |          No | Evento                                       |
| `check_in_id`       |        UUID |          No | Ingreso                                      |
| `check_out_id`      |        UUID |          No | Salida                                       |
| `property_unit_id`  |        UUID |          No | Unidad                                       |
| `gate_id`           |        UUID |          No | Gate                                         |
| `incident_type`     |        enum |          Sí | Tipo                                         |
| `severity`          |        enum |          Sí | Severidad                                    |
| `status`            |        enum |          Sí | open/underReview/resolved/dismissed/archived |
| `description`       |        text |          Sí | Descripción sanitizada                       |
| `resolution_reason` |        text |          No | Razón resolución                             |
| `dismiss_reason`    |        text |          No | Razón descarte                               |
| `created_by`        |        UUID |          Sí | Actor creador                                |
| `updated_by`        |        UUID |          No | Actor actualizador                           |
| `resolved_by`       |        UUID |          No | Actor resolución                             |
| `dismissed_by`      |        UUID |          No | Actor descarte                               |
| `archived_by`       |        UUID |          No | Actor archivo                                |
| `created_at`        | timestamptz |          Sí | Creación                                     |
| `updated_at`        | timestamptz |          Sí | Actualización                                |
| `resolved_at`       | timestamptz |          No | Resolución                                   |
| `dismissed_at`      | timestamptz |          No | Descarte                                     |
| `archived_at`       | timestamptz |          No | Archivo                                      |
| `archive_reason`    |        text |          No | Razón archivo                                |
| `metadata`          |       jsonb |          No | Metadata sanitizada                          |

### Reglas

```text id="hwahqi"
- incident_number es único por tenant.
- description es obligatoria y sanitizada.
- resolved requiere resolution_reason.
- dismissed requiere dismiss_reason.
- critical puede disparar notificación.
```

---

## 7.13. `access_comments`

### Propósito

Comentarios internos o limitados relacionados con visitantes, autorizaciones o eventos.

### Campos

| Campo            |        Tipo | Obligatorio | Descripción                                       |
| ---------------- | ----------: | ----------: | ------------------------------------------------- |
| `id`             |        UUID |          Sí | Identificador                                     |
| `tenant_id`      |        UUID |          Sí | Tenant owner                                      |
| `entity_type`    |        enum |          Sí | visitor/authorization/event/checkIn/incident/etc. |
| `entity_id`      |        UUID |          Sí | Recurso relacionado                               |
| `comment_body`   |        text |          Sí | Comentario sanitizado                             |
| `visibility`     |        enum |          Sí | internal/visibleToResident/system                 |
| `created_by`     |        UUID |          Sí | Actor creador                                     |
| `archived_by`    |        UUID |          No | Actor archivo                                     |
| `created_at`     | timestamptz |          Sí | Creación                                          |
| `archived_at`    | timestamptz |          No | Archivo                                           |
| `archive_reason` |        text |          No | Razón archivo                                     |
| `metadata`       |       jsonb |          No | Metadata sanitizada                               |

### Reglas

```text id="mh6xab"
- entity_id debe pertenecer al tenant según entity_type.
- internal no se expone en /me.
- visibleToResident se expone solo si relación propia.
- system solo se crea server-side.
```

---

## 7.14. `access_documents`

### Propósito

Vincula documentos seguros a entidades del módulo.

### Campos

| Campo                |        Tipo | Obligatorio | Descripción                                    |
| -------------------- | ----------: | ----------: | ---------------------------------------------- |
| `id`                 |        UUID |          Sí | Identificador                                  |
| `tenant_id`          |        UUID |          Sí | Tenant owner                                   |
| `entity_type`        |        enum |          Sí | visitor/event/incident/reportExport/etc.       |
| `entity_id`          |        UUID |          Sí | Recurso vinculado                              |
| `secure_document_id` |        UUID |          Sí | Documento SDS                                  |
| `document_type`      |        enum |          Sí | incidentSupport/reportExport/adminSupport/etc. |
| `visibility`         |        enum |          Sí | administrative/ownLimited                      |
| `status`             |        enum |          Sí | active/archived                                |
| `description`        |        text |          No | Descripción                                    |
| `created_by`         |        UUID |          Sí | Actor creador                                  |
| `archived_by`        |        UUID |          No | Actor archivo                                  |
| `created_at`         | timestamptz |          Sí | Creación                                       |
| `archived_at`        | timestamptz |          No | Archivo                                        |
| `archive_reason`     |        text |          No | Razón archivo                                  |
| `metadata`           |       jsonb |          No | Metadata sanitizada                            |

### Reglas

```text id="hrfezw"
- secure_document_id debe pertenecer al tenant.
- entity_id debe pertenecer al tenant según entity_type.
- No se almacena storageKey.
- No se almacena signedUrl persistente.
- No se almacena base64.
```

---

## 7.15. `access_report_exports`

### Propósito

Registra exportaciones de reportes de acceso.

### Campos

| Campo                |        Tipo | Obligatorio | Descripción                                           |
| -------------------- | ----------: | ----------: | ----------------------------------------------------- |
| `id`                 |        UUID |          Sí | Identificador                                         |
| `tenant_id`          |        UUID |          Sí | Tenant owner                                          |
| `report_type`        |        enum |          Sí | events/visitors/authorizations/incidents/openCheckIns |
| `format`             |        enum |          Sí | csv/xlsx/pdf                                          |
| `filters`            |       jsonb |          Sí | Filtros sanitizados                                   |
| `secure_document_id` |        UUID |          No | Documento generado                                    |
| `status`             |        enum |          Sí | requested/processing/completed/failed/archived        |
| `requested_by`       |        UUID |          Sí | Actor solicitante                                     |
| `created_at`         | timestamptz |          Sí | Solicitud                                             |
| `completed_at`       | timestamptz |          No | Finalización                                          |
| `failed_at`          | timestamptz |          No | Fallo                                                 |
| `archived_at`        | timestamptz |          No | Archivo                                               |
| `failure_reason`     |        text |          No | Razón fallo sanitizada                                |
| `metadata`           |       jsonb |          No | Metadata sanitizada                                   |

### Reglas

```text id="zevk6f"
- completed requiere secure_document_id.
- secure_document_id debe pertenecer al tenant.
- filters no debe guardar identificación completa, placa completa ni códigos raw.
- No se devuelve storageKey.
```

---

# 8. Enums

## 8.1. Visitantes y vehículos

```text id="gjtvv3"
VisitorIdentificationType:
- cedula
- passport
- driverLicense
- ruc
- other
- unknown

VisitorType:
- guest
- family
- delivery
- supplier
- technician
- serviceWorker
- administrative
- emergency
- other

VisitorProfileStatus:
- active
- watchlistedTenant
- blockedTenant
- archived

VisitorVehicleType:
- car
- motorcycle
- truck
- bicycle
- van
- taxi
- deliveryVehicle
- emergencyVehicle
- other

VisitorVehicleStatus:
- active
- watchlistedTenant
- blockedTenant
- archived
```

---

## 8.2. Gates

```text id="o3d036"
AccessGateType:
- main
- vehicle
- pedestrian
- supplier
- secondary
- emergency
- other

AccessGateStatus:
- active
- inactive
- archived
```

---

## 8.3. Autorizaciones y pases

```text id="y98ugy"
AccessAuthorizationType:
- oneTime
- dateRange
- recurringBasic
- delivery
- supplierVisit
- administrative

AccessAuthorizationScope:
- unit
- supplier
- commonArea
- administrative

AccessAuthorizationStatus:
- draft
- active
- used
- expired
- cancelled
- revoked
- archived

AccessPassType:
- shortCode
- qrLogical
- token

AccessPassStatus:
- active
- used
- expired
- revoked
- archived
```

---

## 8.4. Eventos, ingresos y salidas

```text id="ok2086"
AccessEventType:
- checkIn
- checkOut
- deniedAccess
- manualReview
- incident
- systemNote

AccessEventStatus:
- recorded
- corrected
- voided
- archived

AccessEntryMethod:
- authorization
- accessPass
- manual
- override
- supplierVisit
- delivery

AccessExitMethod:
- normal
- manual
- override

AccessCheckInStatus:
- open
- closed
- voided
- archived

AccessCheckOutStatus:
- recorded
- voided
- archived
```

---

## 8.5. Entregas y proveedores

```text id="pokfey"
VisitorDeliveryStatus:
- registered
- receivedAtGate
- deliveredToUnit
- returned
- cancelled
- archived

VisitorSupplierVisitStatus:
- scheduled
- checkedIn
- checkedOut
- cancelled
- denied
- archived
```

---

## 8.6. Incidentes

```text id="dp08me"
AccessIncidentType:
- unauthorizedAttempt
- expiredAuthorization
- cancelledAuthorization
- revokedAuthorization
- visitorBlocked
- vehicleBlocked
- documentIssue
- plateMismatch
- behaviorIssue
- missingCheckOut
- guardNote
- deliveryIssue
- supplierIssue
- emergency
- other

AccessIncidentSeverity:
- info
- low
- medium
- high
- critical

AccessIncidentStatus:
- open
- underReview
- resolved
- dismissed
- archived
```

---

## 8.7. Comentarios, documentos y reportes

```text id="a0hj3t"
AccessCommentEntityType:
- visitor
- vehicle
- authorization
- accessPass
- event
- checkIn
- checkOut
- delivery
- supplierVisit
- incident

AccessCommentVisibility:
- internal
- visibleToResident
- system

AccessDocumentEntityType:
- visitor
- vehicle
- authorization
- event
- checkIn
- checkOut
- delivery
- supplierVisit
- incident
- reportExport

AccessDocumentType:
- adminSupport
- incidentSupport
- deliverySupport
- supplierSupport
- reportExport
- other

AccessDocumentVisibility:
- administrative
- ownLimited

AccessDocumentStatus:
- active
- archived

AccessReportType:
- events
- visitors
- authorizations
- incidents
- openCheckIns
- deliveries
- supplierVisits

AccessExportFormat:
- csv
- xlsx
- pdf

AccessReportExportStatus:
- requested
- processing
- completed
- failed
- archived
```

---

# 9. Prisma schema preliminar — Enums

> Este bloque es una guía inicial. El schema final puede ajustarse durante `api-contract.md`, `test-plan.md`, `tasks.md` y la implementación real.

```prisma id="r1y1tp"
enum VisitorIdentificationType {
  CEDULA         @map("cedula")
  PASSPORT       @map("passport")
  DRIVER_LICENSE @map("driverLicense")
  RUC            @map("ruc")
  OTHER          @map("other")
  UNKNOWN        @map("unknown")
}

enum VisitorType {
  GUEST             @map("guest")
  FAMILY            @map("family")
  DELIVERY          @map("delivery")
  SUPPLIER          @map("supplier")
  TECHNICIAN        @map("technician")
  SERVICE_WORKER    @map("serviceWorker")
  ADMINISTRATIVE    @map("administrative")
  EMERGENCY         @map("emergency")
  OTHER             @map("other")
}

enum VisitorProfileStatus {
  ACTIVE             @map("active")
  WATCHLISTED_TENANT @map("watchlistedTenant")
  BLOCKED_TENANT     @map("blockedTenant")
  ARCHIVED           @map("archived")
}

enum VisitorVehicleType {
  CAR               @map("car")
  MOTORCYCLE        @map("motorcycle")
  TRUCK             @map("truck")
  BICYCLE           @map("bicycle")
  VAN               @map("van")
  TAXI              @map("taxi")
  DELIVERY_VEHICLE  @map("deliveryVehicle")
  EMERGENCY_VEHICLE @map("emergencyVehicle")
  OTHER             @map("other")
}

enum VisitorVehicleStatus {
  ACTIVE             @map("active")
  WATCHLISTED_TENANT @map("watchlistedTenant")
  BLOCKED_TENANT     @map("blockedTenant")
  ARCHIVED           @map("archived")
}

enum AccessGateType {
  MAIN       @map("main")
  VEHICLE    @map("vehicle")
  PEDESTRIAN @map("pedestrian")
  SUPPLIER   @map("supplier")
  SECONDARY  @map("secondary")
  EMERGENCY  @map("emergency")
  OTHER      @map("other")
}

enum AccessGateStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")
  ARCHIVED @map("archived")
}

enum AccessAuthorizationType {
  ONE_TIME        @map("oneTime")
  DATE_RANGE      @map("dateRange")
  RECURRING_BASIC @map("recurringBasic")
  DELIVERY        @map("delivery")
  SUPPLIER_VISIT  @map("supplierVisit")
  ADMINISTRATIVE  @map("administrative")
}

enum AccessAuthorizationScope {
  UNIT           @map("unit")
  SUPPLIER       @map("supplier")
  COMMON_AREA    @map("commonArea")
  ADMINISTRATIVE @map("administrative")
}

enum AccessAuthorizationStatus {
  DRAFT     @map("draft")
  ACTIVE    @map("active")
  USED      @map("used")
  EXPIRED   @map("expired")
  CANCELLED @map("cancelled")
  REVOKED   @map("revoked")
  ARCHIVED  @map("archived")
}

enum AccessPassType {
  SHORT_CODE @map("shortCode")
  QR_LOGICAL @map("qrLogical")
  TOKEN      @map("token")
}

enum AccessPassStatus {
  ACTIVE   @map("active")
  USED     @map("used")
  EXPIRED  @map("expired")
  REVOKED  @map("revoked")
  ARCHIVED @map("archived")
}

enum AccessEventType {
  CHECK_IN      @map("checkIn")
  CHECK_OUT     @map("checkOut")
  DENIED_ACCESS @map("deniedAccess")
  MANUAL_REVIEW @map("manualReview")
  INCIDENT      @map("incident")
  SYSTEM_NOTE   @map("systemNote")
}

enum AccessEventStatus {
  RECORDED  @map("recorded")
  CORRECTED @map("corrected")
  VOIDED    @map("voided")
  ARCHIVED  @map("archived")
}

enum AccessEntryMethod {
  AUTHORIZATION  @map("authorization")
  ACCESS_PASS    @map("accessPass")
  MANUAL         @map("manual")
  OVERRIDE       @map("override")
  SUPPLIER_VISIT @map("supplierVisit")
  DELIVERY       @map("delivery")
}

enum AccessExitMethod {
  NORMAL   @map("normal")
  MANUAL   @map("manual")
  OVERRIDE @map("override")
}

enum AccessCheckInStatus {
  OPEN     @map("open")
  CLOSED   @map("closed")
  VOIDED   @map("voided")
  ARCHIVED @map("archived")
}

enum AccessCheckOutStatus {
  RECORDED @map("recorded")
  VOIDED   @map("voided")
  ARCHIVED @map("archived")
}

enum VisitorDeliveryStatus {
  REGISTERED       @map("registered")
  RECEIVED_AT_GATE @map("receivedAtGate")
  DELIVERED_TO_UNIT @map("deliveredToUnit")
  RETURNED         @map("returned")
  CANCELLED        @map("cancelled")
  ARCHIVED         @map("archived")
}

enum VisitorSupplierVisitStatus {
  SCHEDULED   @map("scheduled")
  CHECKED_IN  @map("checkedIn")
  CHECKED_OUT @map("checkedOut")
  CANCELLED   @map("cancelled")
  DENIED      @map("denied")
  ARCHIVED    @map("archived")
}

enum AccessIncidentType {
  UNAUTHORIZED_ATTEMPT   @map("unauthorizedAttempt")
  EXPIRED_AUTHORIZATION  @map("expiredAuthorization")
  CANCELLED_AUTHORIZATION @map("cancelledAuthorization")
  REVOKED_AUTHORIZATION  @map("revokedAuthorization")
  VISITOR_BLOCKED        @map("visitorBlocked")
  VEHICLE_BLOCKED        @map("vehicleBlocked")
  DOCUMENT_ISSUE         @map("documentIssue")
  PLATE_MISMATCH         @map("plateMismatch")
  BEHAVIOR_ISSUE         @map("behaviorIssue")
  MISSING_CHECK_OUT      @map("missingCheckOut")
  GUARD_NOTE             @map("guardNote")
  DELIVERY_ISSUE         @map("deliveryIssue")
  SUPPLIER_ISSUE         @map("supplierIssue")
  EMERGENCY              @map("emergency")
  OTHER                  @map("other")
}

enum AccessIncidentSeverity {
  INFO     @map("info")
  LOW      @map("low")
  MEDIUM   @map("medium")
  HIGH     @map("high")
  CRITICAL @map("critical")
}

enum AccessIncidentStatus {
  OPEN         @map("open")
  UNDER_REVIEW @map("underReview")
  RESOLVED     @map("resolved")
  DISMISSED    @map("dismissed")
  ARCHIVED     @map("archived")
}
```

---

# 10. Prisma schema preliminar — Models base

```prisma id="ub03it"
model VisitorProfile {
  id                         String               @id @default(uuid()) @db.Uuid
  tenantId                   String               @map("tenant_id") @db.Uuid
  fullName                   String               @map("full_name") @db.VarChar(180)
  normalizedFullName         String?              @map("normalized_full_name") @db.VarChar(180)
  identificationType         VisitorIdentificationType? @map("identification_type")
  identificationNumberMasked String?              @map("identification_number_masked") @db.VarChar(80)
  identificationNumberHash   String?              @map("identification_number_hash") @db.VarChar(128)
  phoneMasked                String?              @map("phone_masked") @db.VarChar(50)
  phoneHash                  String?              @map("phone_hash") @db.VarChar(128)
  emailMasked                String?              @map("email_masked") @db.VarChar(120)
  emailHash                  String?              @map("email_hash") @db.VarChar(128)
  visitorType                VisitorType          @default(GUEST) @map("visitor_type")
  status                     VisitorProfileStatus @default(ACTIVE)
  watchlistReason            String?              @map("watchlist_reason")
  blockReason                String?              @map("block_reason")
  notes                      String?
  createdBy                  String               @map("created_by") @db.Uuid
  updatedBy                  String?              @map("updated_by") @db.Uuid
  watchlistedBy              String?              @map("watchlisted_by") @db.Uuid
  blockedBy                  String?              @map("blocked_by") @db.Uuid
  archivedBy                 String?              @map("archived_by") @db.Uuid
  createdAt                  DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                  DateTime             @updatedAt @map("updated_at") @db.Timestamptz
  watchlistedAt              DateTime?            @map("watchlisted_at") @db.Timestamptz
  blockedAt                  DateTime?            @map("blocked_at") @db.Timestamptz
  archivedAt                 DateTime?            @map("archived_at") @db.Timestamptz
  archiveReason              String?              @map("archive_reason")
  metadata                   Json?

  tenant                     Tenant               @relation(fields: [tenantId], references: [id])
  vehicles                   VisitorVehicle[]
  authorizations             AccessAuthorization[]
  events                     AccessEvent[]
  checkIns                   AccessCheckIn[]
  checkOuts                  AccessCheckOut[]
  deliveries                 VisitorDelivery[]
  supplierVisits             VisitorSupplierVisit[]
  recurringAuthorizations    VisitorRecurringAuthorization[]
  incidents                  AccessIncident[]

  @@index([tenantId, status])
  @@index([tenantId, visitorType])
  @@index([tenantId, normalizedFullName])
  @@index([tenantId, identificationNumberHash])
  @@index([tenantId, phoneHash])
  @@index([tenantId, createdAt])
  @@map("visitor_profiles")
}

model VisitorVehicle {
  id               String               @id @default(uuid()) @db.Uuid
  tenantId         String               @map("tenant_id") @db.Uuid
  visitorId        String?              @map("visitor_id") @db.Uuid
  plateMasked      String               @map("plate_masked") @db.VarChar(40)
  plateHash        String               @map("plate_hash") @db.VarChar(128)
  vehicleType      VisitorVehicleType   @map("vehicle_type")
  vehicleColor     String?              @map("vehicle_color") @db.VarChar(80)
  vehicleBrand     String?              @map("vehicle_brand") @db.VarChar(80)
  vehicleModel     String?              @map("vehicle_model") @db.VarChar(80)
  status           VisitorVehicleStatus @default(ACTIVE)
  watchlistReason  String?              @map("watchlist_reason")
  blockReason      String?              @map("block_reason")
  createdBy        String               @map("created_by") @db.Uuid
  updatedBy        String?              @map("updated_by") @db.Uuid
  watchlistedBy    String?              @map("watchlisted_by") @db.Uuid
  blockedBy        String?              @map("blocked_by") @db.Uuid
  archivedBy       String?              @map("archived_by") @db.Uuid
  createdAt        DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime             @updatedAt @map("updated_at") @db.Timestamptz
  watchlistedAt    DateTime?            @map("watchlisted_at") @db.Timestamptz
  blockedAt        DateTime?            @map("blocked_at") @db.Timestamptz
  archivedAt       DateTime?            @map("archived_at") @db.Timestamptz
  archiveReason    String?              @map("archive_reason")
  metadata         Json?

  tenant           Tenant               @relation(fields: [tenantId], references: [id])
  visitor          VisitorProfile?      @relation(fields: [visitorId], references: [id])
  authorizations   AccessAuthorization[]
  events           AccessEvent[]
  checkIns         AccessCheckIn[]
  checkOuts        AccessCheckOut[]
  supplierVisits   VisitorSupplierVisit[]
  incidents        AccessIncident[]

  @@index([tenantId, visitorId])
  @@index([tenantId, plateHash])
  @@index([tenantId, status])
  @@index([tenantId, vehicleType])
  @@map("visitor_vehicles")
}

model AccessGate {
  id              String           @id @default(uuid()) @db.Uuid
  tenantId        String           @map("tenant_id") @db.Uuid
  gateCode        String           @map("gate_code") @db.VarChar(80)
  gateName        String           @map("gate_name") @db.VarChar(180)
  gateType        AccessGateType   @map("gate_type")
  description     String?
  isEntryAllowed  Boolean          @default(true) @map("is_entry_allowed")
  isExitAllowed   Boolean          @default(true) @map("is_exit_allowed")
  status          AccessGateStatus @default(ACTIVE)
  createdBy       String           @map("created_by") @db.Uuid
  updatedBy       String?          @map("updated_by") @db.Uuid
  archivedBy      String?          @map("archived_by") @db.Uuid
  createdAt       DateTime         @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime         @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt      DateTime?        @map("archived_at") @db.Timestamptz
  archiveReason   String?          @map("archive_reason")
  metadata        Json?

  tenant          Tenant           @relation(fields: [tenantId], references: [id])
  events          AccessEvent[]
  checkIns        AccessCheckIn[]
  checkOuts       AccessCheckOut[]
  incidents       AccessIncident[]

  @@index([tenantId, gateCode])
  @@index([tenantId, status])
  @@index([tenantId, gateType])
  @@map("access_gates")
}
```

---

# 11. Prisma schema preliminar — Autorizaciones, pases y eventos

```prisma id="mfboc1"
model AccessAuthorization {
  id                    String                    @id @default(uuid()) @db.Uuid
  tenantId              String                    @map("tenant_id") @db.Uuid
  authorizationNumber   String                    @map("authorization_number") @db.VarChar(60)
  visitorId             String                    @map("visitor_id") @db.Uuid
  vehicleId             String?                   @map("vehicle_id") @db.Uuid
  propertyUnitId        String?                   @map("property_unit_id") @db.Uuid
  authorizedByUserId    String                    @map("authorized_by_user_id") @db.Uuid
  authorizedByPersonId  String?                   @map("authorized_by_person_id") @db.Uuid
  authorizationType     AccessAuthorizationType   @map("authorization_type")
  authorizationScope    AccessAuthorizationScope  @map("authorization_scope")
  validFrom             DateTime                  @map("valid_from") @db.Timestamptz
  validUntil            DateTime                  @map("valid_until") @db.Timestamptz
  maxEntries            Int?                      @map("max_entries")
  entriesUsed           Int                       @default(0) @map("entries_used")
  reason                String?
  status                AccessAuthorizationStatus @default(DRAFT)
  cancelReason          String?                   @map("cancel_reason")
  revokeReason          String?                   @map("revoke_reason")
  createdBy             String                    @map("created_by") @db.Uuid
  updatedBy             String?                   @map("updated_by") @db.Uuid
  activatedBy           String?                   @map("activated_by") @db.Uuid
  cancelledBy           String?                   @map("cancelled_by") @db.Uuid
  revokedBy             String?                   @map("revoked_by") @db.Uuid
  archivedBy            String?                   @map("archived_by") @db.Uuid
  createdAt             DateTime                  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime                  @updatedAt @map("updated_at") @db.Timestamptz
  activatedAt           DateTime?                 @map("activated_at") @db.Timestamptz
  usedAt                DateTime?                 @map("used_at") @db.Timestamptz
  expiredAt             DateTime?                 @map("expired_at") @db.Timestamptz
  cancelledAt           DateTime?                 @map("cancelled_at") @db.Timestamptz
  revokedAt             DateTime?                 @map("revoked_at") @db.Timestamptz
  archivedAt            DateTime?                 @map("archived_at") @db.Timestamptz
  archiveReason         String?                   @map("archive_reason")
  metadata              Json?

  tenant                Tenant                    @relation(fields: [tenantId], references: [id])
  visitor               VisitorProfile            @relation(fields: [visitorId], references: [id])
  vehicle               VisitorVehicle?           @relation(fields: [vehicleId], references: [id])
  passes                AccessPass[]
  events                AccessEvent[]
  checkIns              AccessCheckIn[]

  @@index([tenantId, authorizationNumber])
  @@index([tenantId, visitorId])
  @@index([tenantId, vehicleId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, authorizedByUserId])
  @@index([tenantId, authorizationType])
  @@index([tenantId, authorizationScope])
  @@index([tenantId, status])
  @@index([tenantId, validFrom, validUntil])
  @@map("access_authorizations")
}

model AccessPass {
  id               String           @id @default(uuid()) @db.Uuid
  tenantId         String           @map("tenant_id") @db.Uuid
  authorizationId  String           @map("authorization_id") @db.Uuid
  passCodeHash     String           @map("pass_code_hash") @db.VarChar(128)
  passCodeMasked   String           @map("pass_code_masked") @db.VarChar(40)
  passType         AccessPassType   @map("pass_type")
  expiresAt        DateTime         @map("expires_at") @db.Timestamptz
  usedAt           DateTime?        @map("used_at") @db.Timestamptz
  usedByUserId     String?          @map("used_by_user_id") @db.Uuid
  status           AccessPassStatus @default(ACTIVE)
  revokedBy        String?          @map("revoked_by") @db.Uuid
  revokedAt        DateTime?        @map("revoked_at") @db.Timestamptz
  revokeReason     String?          @map("revoke_reason")
  createdBy        String           @map("created_by") @db.Uuid
  archivedBy       String?          @map("archived_by") @db.Uuid
  createdAt        DateTime         @default(now()) @map("created_at") @db.Timestamptz
  archivedAt       DateTime?        @map("archived_at") @db.Timestamptz
  archiveReason    String?          @map("archive_reason")
  metadata         Json?

  tenant           Tenant           @relation(fields: [tenantId], references: [id])
  authorization    AccessAuthorization @relation(fields: [authorizationId], references: [id])
  events           AccessEvent[]
  checkIns         AccessCheckIn[]

  @@index([tenantId, authorizationId])
  @@index([tenantId, passCodeHash])
  @@index([tenantId, status])
  @@index([tenantId, expiresAt])
  @@map("access_passes")
}

model AccessEvent {
  id                  String            @id @default(uuid()) @db.Uuid
  tenantId            String            @map("tenant_id") @db.Uuid
  eventNumber         String            @map("event_number") @db.VarChar(60)
  visitorId           String?           @map("visitor_id") @db.Uuid
  vehicleId           String?           @map("vehicle_id") @db.Uuid
  authorizationId     String?           @map("authorization_id") @db.Uuid
  accessPassId        String?           @map("access_pass_id") @db.Uuid
  propertyUnitId      String?           @map("property_unit_id") @db.Uuid
  gateId              String            @map("gate_id") @db.Uuid
  eventType           AccessEventType   @map("event_type")
  eventStatus         AccessEventStatus @default(RECORDED) @map("event_status")
  occurredAt          DateTime          @default(now()) @map("occurred_at") @db.Timestamptz
  recordedByUserId    String            @map("recorded_by_user_id") @db.Uuid
  guardShiftId        String?           @map("guard_shift_id") @db.Uuid
  reason              String?
  notes               String?
  correctedBy         String?           @map("corrected_by") @db.Uuid
  correctedAt         DateTime?         @map("corrected_at") @db.Timestamptz
  correctionReason    String?           @map("correction_reason")
  voidedBy            String?           @map("voided_by") @db.Uuid
  voidedAt            DateTime?         @map("voided_at") @db.Timestamptz
  voidReason          String?           @map("void_reason")
  createdAt           DateTime          @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime          @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt          DateTime?         @map("archived_at") @db.Timestamptz
  archiveReason       String?           @map("archive_reason")
  metadata            Json?

  tenant              Tenant            @relation(fields: [tenantId], references: [id])
  visitor             VisitorProfile?   @relation(fields: [visitorId], references: [id])
  vehicle             VisitorVehicle?   @relation(fields: [vehicleId], references: [id])
  authorization       AccessAuthorization? @relation(fields: [authorizationId], references: [id])
  accessPass          AccessPass?       @relation(fields: [accessPassId], references: [id])
  gate                AccessGate        @relation(fields: [gateId], references: [id])
  checkIn             AccessCheckIn?
  checkOut            AccessCheckOut?
  deliveries          VisitorDelivery[]
  supplierVisits      VisitorSupplierVisit[]
  incidents           AccessIncident[]
  comments            AccessComment[]
  documents           AccessDocument[]

  @@index([tenantId, eventNumber])
  @@index([tenantId, visitorId])
  @@index([tenantId, vehicleId])
  @@index([tenantId, authorizationId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, gateId])
  @@index([tenantId, eventType])
  @@index([tenantId, eventStatus])
  @@index([tenantId, occurredAt])
  @@index([tenantId, recordedByUserId])
  @@map("access_events")
}
```

---

# 12. Prisma schema preliminar — Check-in, check-out, entregas y proveedores

```prisma id="eqb0li"
model AccessCheckIn {
  id                 String              @id @default(uuid()) @db.Uuid
  tenantId           String              @map("tenant_id") @db.Uuid
  accessEventId      String              @unique @map("access_event_id") @db.Uuid
  visitorId          String              @map("visitor_id") @db.Uuid
  vehicleId          String?             @map("vehicle_id") @db.Uuid
  authorizationId    String?             @map("authorization_id") @db.Uuid
  accessPassId       String?             @map("access_pass_id") @db.Uuid
  propertyUnitId     String?             @map("property_unit_id") @db.Uuid
  gateId             String              @map("gate_id") @db.Uuid
  entryMethod        AccessEntryMethod   @map("entry_method")
  checkedInAt        DateTime            @default(now()) @map("checked_in_at") @db.Timestamptz
  checkedInByUserId  String              @map("checked_in_by_user_id") @db.Uuid
  status             AccessCheckInStatus @default(OPEN)
  manualReason       String?             @map("manual_reason")
  voidedBy           String?             @map("voided_by") @db.Uuid
  voidedAt           DateTime?           @map("voided_at") @db.Timestamptz
  voidReason         String?             @map("void_reason")
  closedAt           DateTime?           @map("closed_at") @db.Timestamptz
  createdAt          DateTime            @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime            @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt         DateTime?           @map("archived_at") @db.Timestamptz
  archiveReason      String?             @map("archive_reason")
  metadata           Json?

  tenant             Tenant              @relation(fields: [tenantId], references: [id])
  accessEvent        AccessEvent         @relation(fields: [accessEventId], references: [id])
  visitor            VisitorProfile      @relation(fields: [visitorId], references: [id])
  vehicle            VisitorVehicle?     @relation(fields: [vehicleId], references: [id])
  authorization      AccessAuthorization? @relation(fields: [authorizationId], references: [id])
  accessPass         AccessPass?         @relation(fields: [accessPassId], references: [id])
  gate               AccessGate          @relation(fields: [gateId], references: [id])
  checkOut           AccessCheckOut?
  deliveries         VisitorDelivery[]
  supplierVisits     VisitorSupplierVisit[]
  incidents          AccessIncident[]

  @@index([tenantId, visitorId])
  @@index([tenantId, vehicleId])
  @@index([tenantId, authorizationId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, gateId])
  @@index([tenantId, entryMethod])
  @@index([tenantId, status])
  @@index([tenantId, checkedInAt])
  @@index([tenantId, checkedInByUserId])
  @@map("access_check_ins")
}

model AccessCheckOut {
  id                  String               @id @default(uuid()) @db.Uuid
  tenantId            String               @map("tenant_id") @db.Uuid
  accessEventId       String               @unique @map("access_event_id") @db.Uuid
  checkInId           String?              @unique @map("check_in_id") @db.Uuid
  visitorId           String               @map("visitor_id") @db.Uuid
  vehicleId           String?              @map("vehicle_id") @db.Uuid
  gateId              String               @map("gate_id") @db.Uuid
  exitMethod          AccessExitMethod     @default(NORMAL) @map("exit_method")
  checkedOutAt        DateTime             @default(now()) @map("checked_out_at") @db.Timestamptz
  checkedOutByUserId  String               @map("checked_out_by_user_id") @db.Uuid
  status              AccessCheckOutStatus @default(RECORDED)
  manualReason        String?              @map("manual_reason")
  voidedBy            String?              @map("voided_by") @db.Uuid
  voidedAt            DateTime?            @map("voided_at") @db.Timestamptz
  voidReason          String?              @map("void_reason")
  createdAt           DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime             @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt          DateTime?            @map("archived_at") @db.Timestamptz
  archiveReason       String?              @map("archive_reason")
  metadata            Json?

  tenant              Tenant               @relation(fields: [tenantId], references: [id])
  accessEvent         AccessEvent          @relation(fields: [accessEventId], references: [id])
  checkIn             AccessCheckIn?       @relation(fields: [checkInId], references: [id])
  visitor             VisitorProfile       @relation(fields: [visitorId], references: [id])
  vehicle             VisitorVehicle?      @relation(fields: [vehicleId], references: [id])
  gate                AccessGate           @relation(fields: [gateId], references: [id])
  supplierVisits      VisitorSupplierVisit[]
  incidents           AccessIncident[]

  @@index([tenantId, checkInId])
  @@index([tenantId, visitorId])
  @@index([tenantId, vehicleId])
  @@index([tenantId, gateId])
  @@index([tenantId, exitMethod])
  @@index([tenantId, status])
  @@index([tenantId, checkedOutAt])
  @@index([tenantId, checkedOutByUserId])
  @@map("access_check_outs")
}

model VisitorDelivery {
  id                    String                @id @default(uuid()) @db.Uuid
  tenantId              String                @map("tenant_id") @db.Uuid
  deliveryNumber        String                @map("delivery_number") @db.VarChar(60)
  visitorId             String?               @map("visitor_id") @db.Uuid
  accessEventId         String?               @map("access_event_id") @db.Uuid
  checkInId             String?               @map("check_in_id") @db.Uuid
  propertyUnitId        String                @map("property_unit_id") @db.Uuid
  recipientPersonId     String?               @map("recipient_person_id") @db.Uuid
  deliveryCompanyMasked String?               @map("delivery_company_masked") @db.VarChar(120)
  packageDescription    String?               @map("package_description")
  status                VisitorDeliveryStatus @default(REGISTERED)
  receivedAt            DateTime?             @map("received_at") @db.Timestamptz
  deliveredAt           DateTime?             @map("delivered_at") @db.Timestamptz
  returnedAt            DateTime?             @map("returned_at") @db.Timestamptz
  cancelledAt           DateTime?             @map("cancelled_at") @db.Timestamptz
  returnReason          String?               @map("return_reason")
  cancelReason          String?               @map("cancel_reason")
  createdBy             String                @map("created_by") @db.Uuid
  updatedBy             String?               @map("updated_by") @db.Uuid
  receivedBy            String?               @map("received_by") @db.Uuid
  deliveredBy           String?               @map("delivered_by") @db.Uuid
  returnedBy            String?               @map("returned_by") @db.Uuid
  cancelledBy           String?               @map("cancelled_by") @db.Uuid
  archivedBy            String?               @map("archived_by") @db.Uuid
  createdAt             DateTime              @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime              @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt            DateTime?             @map("archived_at") @db.Timestamptz
  archiveReason         String?               @map("archive_reason")
  metadata              Json?

  tenant                Tenant                @relation(fields: [tenantId], references: [id])
  visitor               VisitorProfile?       @relation(fields: [visitorId], references: [id])
  accessEvent           AccessEvent?          @relation(fields: [accessEventId], references: [id])
  checkIn               AccessCheckIn?        @relation(fields: [checkInId], references: [id])

  @@index([tenantId, deliveryNumber])
  @@index([tenantId, visitorId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, recipientPersonId])
  @@index([tenantId, status])
  @@index([tenantId, receivedAt])
  @@map("visitor_deliveries")
}

model VisitorSupplierVisit {
  id                       String                     @id @default(uuid()) @db.Uuid
  tenantId                 String                     @map("tenant_id") @db.Uuid
  supplierVisitNumber      String                     @map("supplier_visit_number") @db.VarChar(60)
  supplierId               String?                    @map("supplier_id") @db.Uuid
  visitorId                String                     @map("visitor_id") @db.Uuid
  vehicleId                String?                    @map("vehicle_id") @db.Uuid
  accessEventId            String?                    @map("access_event_id") @db.Uuid
  checkInId                String?                    @map("check_in_id") @db.Uuid
  checkOutId               String?                    @map("check_out_id") @db.Uuid
  propertyUnitId           String?                    @map("property_unit_id") @db.Uuid
  commonAreaId             String?                    @map("common_area_id") @db.Uuid
  maintenanceWorkOrderId   String?                    @map("maintenance_work_order_id") @db.Uuid
  reason                   String
  status                   VisitorSupplierVisitStatus @default(SCHEDULED)
  scheduledFrom            DateTime?                  @map("scheduled_from") @db.Timestamptz
  scheduledUntil           DateTime?                  @map("scheduled_until") @db.Timestamptz
  checkedInAt              DateTime?                  @map("checked_in_at") @db.Timestamptz
  checkedOutAt             DateTime?                  @map("checked_out_at") @db.Timestamptz
  cancelledAt              DateTime?                  @map("cancelled_at") @db.Timestamptz
  deniedAt                 DateTime?                  @map("denied_at") @db.Timestamptz
  cancelReason             String?                    @map("cancel_reason")
  denialReason             String?                    @map("denial_reason")
  createdBy                String                     @map("created_by") @db.Uuid
  updatedBy                String?                    @map("updated_by") @db.Uuid
  cancelledBy              String?                    @map("cancelled_by") @db.Uuid
  deniedBy                 String?                    @map("denied_by") @db.Uuid
  archivedBy               String?                    @map("archived_by") @db.Uuid
  createdAt                DateTime                   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                DateTime                   @updatedAt @map("updated_at") @db.Timestamptz
  archivedAt               DateTime?                  @map("archived_at") @db.Timestamptz
  archiveReason            String?                    @map("archive_reason")
  metadata                 Json?

  tenant                   Tenant                     @relation(fields: [tenantId], references: [id])
  visitor                  VisitorProfile             @relation(fields: [visitorId], references: [id])
  vehicle                  VisitorVehicle?            @relation(fields: [vehicleId], references: [id])
  accessEvent              AccessEvent?               @relation(fields: [accessEventId], references: [id])
  checkIn                  AccessCheckIn?             @relation(fields: [checkInId], references: [id])
  checkOut                 AccessCheckOut?            @relation(fields: [checkOutId], references: [id])

  @@index([tenantId, supplierVisitNumber])
  @@index([tenantId, supplierId])
  @@index([tenantId, visitorId])
  @@index([tenantId, vehicleId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, commonAreaId])
  @@index([tenantId, maintenanceWorkOrderId])
  @@index([tenantId, status])
  @@index([tenantId, scheduledFrom, scheduledUntil])
  @@map("visitor_supplier_visits")
}
```

---

# 13. Prisma schema preliminar — Recurrentes, incidentes, comentarios, documentos y exports

```prisma id="v1k63m"
model VisitorRecurringAuthorization {
  id                            String                    @id @default(uuid()) @db.Uuid
  tenantId                      String                    @map("tenant_id") @db.Uuid
  recurringAuthorizationNumber  String                    @map("recurring_authorization_number") @db.VarChar(60)
  visitorId                     String                    @map("visitor_id") @db.Uuid
  vehicleId                     String?                   @map("vehicle_id") @db.Uuid
  propertyUnitId                String?                   @map("property_unit_id") @db.Uuid
  authorizedByUserId            String                    @map("authorized_by_user_id") @db.Uuid
  authorizationType             AccessAuthorizationType   @default(RECURRING_BASIC) @map("authorization_type")
  validFrom                     DateTime                  @map("valid_from") @db.Date
  validUntil                    DateTime                  @map("valid_until") @db.Date
  daysOfWeek                    Json                      @map("days_of_week")
  timeFrom                      DateTime?                 @map("time_from") @db.Time
  timeUntil                     DateTime?                 @map("time_until") @db.Time
  maxEntriesPerDay              Int?                      @map("max_entries_per_day")
  status                        AccessAuthorizationStatus @default(ACTIVE)
  reason                        String?
  cancelReason                  String?                   @map("cancel_reason")
  revokeReason                  String?                   @map("revoke_reason")
  createdBy                     String                    @map("created_by") @db.Uuid
  updatedBy                     String?                   @map("updated_by") @db.Uuid
  cancelledBy                   String?                   @map("cancelled_by") @db.Uuid
  revokedBy                     String?                   @map("revoked_by") @db.Uuid
  archivedBy                    String?                   @map("archived_by") @db.Uuid
  createdAt                     DateTime                  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                     DateTime                  @updatedAt @map("updated_at") @db.Timestamptz
  cancelledAt                   DateTime?                 @map("cancelled_at") @db.Timestamptz
  revokedAt                     DateTime?                 @map("revoked_at") @db.Timestamptz
  expiredAt                     DateTime?                 @map("expired_at") @db.Timestamptz
  archivedAt                    DateTime?                 @map("archived_at") @db.Timestamptz
  archiveReason                 String?                   @map("archive_reason")
  metadata                      Json?

  tenant                        Tenant                    @relation(fields: [tenantId], references: [id])
  visitor                       VisitorProfile            @relation(fields: [visitorId], references: [id])

  @@index([tenantId, recurringAuthorizationNumber])
  @@index([tenantId, visitorId])
  @@index([tenantId, vehicleId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, authorizedByUserId])
  @@index([tenantId, status])
  @@index([tenantId, validFrom, validUntil])
  @@map("visitor_recurring_authorizations")
}

model AccessIncident {
  id                String                 @id @default(uuid()) @db.Uuid
  tenantId          String                 @map("tenant_id") @db.Uuid
  incidentNumber    String                 @map("incident_number") @db.VarChar(60)
  visitorId         String?                @map("visitor_id") @db.Uuid
  vehicleId         String?                @map("vehicle_id") @db.Uuid
  accessEventId     String?                @map("access_event_id") @db.Uuid
  checkInId         String?                @map("check_in_id") @db.Uuid
  checkOutId        String?                @map("check_out_id") @db.Uuid
  propertyUnitId    String?                @map("property_unit_id") @db.Uuid
  gateId            String?                @map("gate_id") @db.Uuid
  incidentType      AccessIncidentType     @map("incident_type")
  severity          AccessIncidentSeverity @default(MEDIUM)
  status            AccessIncidentStatus   @default(OPEN)
  description       String
  resolutionReason  String?                @map("resolution_reason")
  dismissReason     String?                @map("dismiss_reason")
  createdBy         String                 @map("created_by") @db.Uuid
  updatedBy         String?                @map("updated_by") @db.Uuid
  resolvedBy        String?                @map("resolved_by") @db.Uuid
  dismissedBy       String?                @map("dismissed_by") @db.Uuid
  archivedBy        String?                @map("archived_by") @db.Uuid
  createdAt         DateTime               @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime               @updatedAt @map("updated_at") @db.Timestamptz
  resolvedAt        DateTime?              @map("resolved_at") @db.Timestamptz
  dismissedAt       DateTime?              @map("dismissed_at") @db.Timestamptz
  archivedAt        DateTime?              @map("archived_at") @db.Timestamptz
  archiveReason     String?                @map("archive_reason")
  metadata          Json?

  tenant            Tenant                 @relation(fields: [tenantId], references: [id])
  visitor           VisitorProfile?        @relation(fields: [visitorId], references: [id])
  vehicle           VisitorVehicle?        @relation(fields: [vehicleId], references: [id])
  accessEvent       AccessEvent?           @relation(fields: [accessEventId], references: [id])
  checkIn           AccessCheckIn?         @relation(fields: [checkInId], references: [id])
  checkOut          AccessCheckOut?        @relation(fields: [checkOutId], references: [id])
  gate              AccessGate?            @relation(fields: [gateId], references: [id])

  @@index([tenantId, incidentNumber])
  @@index([tenantId, visitorId])
  @@index([tenantId, vehicleId])
  @@index([tenantId, accessEventId])
  @@index([tenantId, checkInId])
  @@index([tenantId, propertyUnitId])
  @@index([tenantId, gateId])
  @@index([tenantId, incidentType])
  @@index([tenantId, severity])
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
  @@map("access_incidents")
}

model AccessComment {
  id             String                  @id @default(uuid()) @db.Uuid
  tenantId       String                  @map("tenant_id") @db.Uuid
  entityType     AccessCommentEntityType @map("entity_type")
  entityId       String                  @map("entity_id") @db.Uuid
  commentBody    String                  @map("comment_body")
  visibility     AccessCommentVisibility @default(INTERNAL)
  createdBy      String                  @map("created_by") @db.Uuid
  archivedBy     String?                 @map("archived_by") @db.Uuid
  createdAt      DateTime                @default(now()) @map("created_at") @db.Timestamptz
  archivedAt     DateTime?               @map("archived_at") @db.Timestamptz
  archiveReason  String?                 @map("archive_reason")
  metadata       Json?

  tenant         Tenant                  @relation(fields: [tenantId], references: [id])

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, visibility])
  @@index([tenantId, createdAt])
  @@map("access_comments")
}

model AccessDocument {
  id               String                   @id @default(uuid()) @db.Uuid
  tenantId         String                   @map("tenant_id") @db.Uuid
  entityType       AccessDocumentEntityType @map("entity_type")
  entityId         String                   @map("entity_id") @db.Uuid
  secureDocumentId String                   @map("secure_document_id") @db.Uuid
  documentType     AccessDocumentType       @map("document_type")
  visibility       AccessDocumentVisibility @default(ADMINISTRATIVE)
  status           AccessDocumentStatus     @default(ACTIVE)
  description      String?
  createdBy        String                   @map("created_by") @db.Uuid
  archivedBy       String?                  @map("archived_by") @db.Uuid
  createdAt        DateTime                 @default(now()) @map("created_at") @db.Timestamptz
  archivedAt       DateTime?                @map("archived_at") @db.Timestamptz
  archiveReason    String?                  @map("archive_reason")
  metadata         Json?

  tenant           Tenant                   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, secureDocumentId])
  @@index([tenantId, documentType])
  @@index([tenantId, status])
  @@map("access_documents")
}

model AccessReportExport {
  id               String                   @id @default(uuid()) @db.Uuid
  tenantId         String                   @map("tenant_id") @db.Uuid
  reportType       AccessReportType         @map("report_type")
  format           AccessExportFormat
  filters          Json
  secureDocumentId String?                  @map("secure_document_id") @db.Uuid
  status           AccessReportExportStatus @default(REQUESTED)
  requestedBy      String                   @map("requested_by") @db.Uuid
  createdAt        DateTime                 @default(now()) @map("created_at") @db.Timestamptz
  completedAt      DateTime?                @map("completed_at") @db.Timestamptz
  failedAt         DateTime?                @map("failed_at") @db.Timestamptz
  archivedAt       DateTime?                @map("archived_at") @db.Timestamptz
  failureReason    String?                  @map("failure_reason")
  metadata         Json?

  tenant           Tenant                   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, reportType])
  @@index([tenantId, format])
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
  @@index([tenantId, secureDocumentId])
  @@map("access_report_exports")
}
```

---

# 14. Enums Prisma adicionales para comments/documents/reports

```prisma id="nkzyjq"
enum AccessCommentEntityType {
  VISITOR        @map("visitor")
  VEHICLE        @map("vehicle")
  AUTHORIZATION  @map("authorization")
  ACCESS_PASS    @map("accessPass")
  EVENT          @map("event")
  CHECK_IN       @map("checkIn")
  CHECK_OUT      @map("checkOut")
  DELIVERY       @map("delivery")
  SUPPLIER_VISIT @map("supplierVisit")
  INCIDENT       @map("incident")
}

enum AccessCommentVisibility {
  INTERNAL            @map("internal")
  VISIBLE_TO_RESIDENT @map("visibleToResident")
  SYSTEM              @map("system")
}

enum AccessDocumentEntityType {
  VISITOR        @map("visitor")
  VEHICLE        @map("vehicle")
  AUTHORIZATION  @map("authorization")
  EVENT          @map("event")
  CHECK_IN       @map("checkIn")
  CHECK_OUT      @map("checkOut")
  DELIVERY       @map("delivery")
  SUPPLIER_VISIT @map("supplierVisit")
  INCIDENT       @map("incident")
  REPORT_EXPORT  @map("reportExport")
}

enum AccessDocumentType {
  ADMIN_SUPPORT    @map("adminSupport")
  INCIDENT_SUPPORT @map("incidentSupport")
  DELIVERY_SUPPORT @map("deliverySupport")
  SUPPLIER_SUPPORT @map("supplierSupport")
  REPORT_EXPORT    @map("reportExport")
  OTHER            @map("other")
}

enum AccessDocumentVisibility {
  ADMINISTRATIVE @map("administrative")
  OWN_LIMITED    @map("ownLimited")
}

enum AccessDocumentStatus {
  ACTIVE   @map("active")
  ARCHIVED @map("archived")
}

enum AccessReportType {
  EVENTS         @map("events")
  VISITORS       @map("visitors")
  AUTHORIZATIONS @map("authorizations")
  INCIDENTS      @map("incidents")
  OPEN_CHECK_INS @map("openCheckIns")
  DELIVERIES     @map("deliveries")
  SUPPLIER_VISITS @map("supplierVisits")
}

enum AccessExportFormat {
  CSV  @map("csv")
  XLSX @map("xlsx")
  PDF  @map("pdf")
}

enum AccessReportExportStatus {
  REQUESTED  @map("requested")
  PROCESSING @map("processing")
  COMPLETED  @map("completed")
  FAILED     @map("failed")
  ARCHIVED   @map("archived")
}
```

---

# 15. Relaciones a agregar en `Tenant`

Agregar al modelo `Tenant`:

```prisma id="jdz6tk"
model Tenant {
  // existing fields...

  visitorProfiles                 VisitorProfile[]
  visitorVehicles                 VisitorVehicle[]
  accessGates                     AccessGate[]
  accessAuthorizations            AccessAuthorization[]
  accessPasses                    AccessPass[]
  accessEvents                    AccessEvent[]
  accessCheckIns                  AccessCheckIn[]
  accessCheckOuts                 AccessCheckOut[]
  visitorDeliveries               VisitorDelivery[]
  visitorSupplierVisits           VisitorSupplierVisit[]
  visitorRecurringAuthorizations  VisitorRecurringAuthorization[]
  accessIncidents                 AccessIncident[]
  accessComments                  AccessComment[]
  accessDocuments                 AccessDocument[]
  accessReportExports             AccessReportExport[]
}
```

---

# 16. Índices recomendados

## 16.1. Visitantes

```sql id="cmrziq"
CREATE INDEX idx_visitor_profiles_tenant_status
ON visitor_profiles (tenant_id, status);

CREATE INDEX idx_visitor_profiles_tenant_type
ON visitor_profiles (tenant_id, visitor_type);

CREATE INDEX idx_visitor_profiles_tenant_name
ON visitor_profiles (tenant_id, normalized_full_name);

CREATE INDEX idx_visitor_profiles_tenant_identification_hash
ON visitor_profiles (tenant_id, identification_number_hash);

CREATE INDEX idx_visitor_profiles_tenant_phone_hash
ON visitor_profiles (tenant_id, phone_hash);

CREATE INDEX idx_visitor_profiles_tenant_created
ON visitor_profiles (tenant_id, created_at);
```

---

## 16.2. Vehículos

```sql id="vyya14"
CREATE INDEX idx_visitor_vehicles_tenant_visitor
ON visitor_vehicles (tenant_id, visitor_id);

CREATE INDEX idx_visitor_vehicles_tenant_plate_hash
ON visitor_vehicles (tenant_id, plate_hash);

CREATE INDEX idx_visitor_vehicles_tenant_status
ON visitor_vehicles (tenant_id, status);

CREATE INDEX idx_visitor_vehicles_tenant_type
ON visitor_vehicles (tenant_id, vehicle_type);
```

---

## 16.3. Gates

```sql id="rrlk3f"
CREATE UNIQUE INDEX uq_access_gates_tenant_code_active
ON access_gates (tenant_id, gate_code)
WHERE archived_at IS NULL;

CREATE INDEX idx_access_gates_tenant_status
ON access_gates (tenant_id, status);

CREATE INDEX idx_access_gates_tenant_type
ON access_gates (tenant_id, gate_type);
```

---

## 16.4. Autorizaciones y pases

```sql id="cbhnop"
CREATE UNIQUE INDEX uq_access_authorizations_tenant_number
ON access_authorizations (tenant_id, authorization_number);

CREATE INDEX idx_access_authorizations_tenant_visitor
ON access_authorizations (tenant_id, visitor_id);

CREATE INDEX idx_access_authorizations_tenant_vehicle
ON access_authorizations (tenant_id, vehicle_id);

CREATE INDEX idx_access_authorizations_tenant_unit
ON access_authorizations (tenant_id, property_unit_id);

CREATE INDEX idx_access_authorizations_tenant_authorized_by
ON access_authorizations (tenant_id, authorized_by_user_id);

CREATE INDEX idx_access_authorizations_tenant_status
ON access_authorizations (tenant_id, status);

CREATE INDEX idx_access_authorizations_tenant_validity
ON access_authorizations (tenant_id, valid_from, valid_until);

CREATE INDEX idx_access_passes_tenant_code_hash
ON access_passes (tenant_id, pass_code_hash);

CREATE INDEX idx_access_passes_tenant_authorization
ON access_passes (tenant_id, authorization_id);

CREATE INDEX idx_access_passes_tenant_status
ON access_passes (tenant_id, status);

CREATE INDEX idx_access_passes_tenant_expires
ON access_passes (tenant_id, expires_at);
```

---

## 16.5. Eventos, check-ins y check-outs

```sql id="h7drji"
CREATE UNIQUE INDEX uq_access_events_tenant_number
ON access_events (tenant_id, event_number);

CREATE INDEX idx_access_events_tenant_type
ON access_events (tenant_id, event_type);

CREATE INDEX idx_access_events_tenant_status
ON access_events (tenant_id, event_status);

CREATE INDEX idx_access_events_tenant_occurred
ON access_events (tenant_id, occurred_at);

CREATE INDEX idx_access_events_tenant_visitor
ON access_events (tenant_id, visitor_id);

CREATE INDEX idx_access_events_tenant_vehicle
ON access_events (tenant_id, vehicle_id);

CREATE INDEX idx_access_events_tenant_unit
ON access_events (tenant_id, property_unit_id);

CREATE INDEX idx_access_events_tenant_gate
ON access_events (tenant_id, gate_id);

CREATE INDEX idx_access_check_ins_tenant_status
ON access_check_ins (tenant_id, status);

CREATE INDEX idx_access_check_ins_tenant_visitor
ON access_check_ins (tenant_id, visitor_id);

CREATE INDEX idx_access_check_ins_tenant_unit
ON access_check_ins (tenant_id, property_unit_id);

CREATE INDEX idx_access_check_ins_tenant_gate
ON access_check_ins (tenant_id, gate_id);

CREATE INDEX idx_access_check_ins_tenant_checked_in
ON access_check_ins (tenant_id, checked_in_at);

CREATE UNIQUE INDEX uq_access_check_outs_check_in_active
ON access_check_outs (tenant_id, check_in_id)
WHERE check_in_id IS NOT NULL AND status <> 'voided';

CREATE INDEX idx_access_check_outs_tenant_visitor
ON access_check_outs (tenant_id, visitor_id);

CREATE INDEX idx_access_check_outs_tenant_gate
ON access_check_outs (tenant_id, gate_id);

CREATE INDEX idx_access_check_outs_tenant_checked_out
ON access_check_outs (tenant_id, checked_out_at);
```

---

## 16.6. Entregas, proveedores e incidentes

```sql id="lgudug"
CREATE UNIQUE INDEX uq_visitor_deliveries_tenant_number
ON visitor_deliveries (tenant_id, delivery_number);

CREATE INDEX idx_visitor_deliveries_tenant_unit
ON visitor_deliveries (tenant_id, property_unit_id);

CREATE INDEX idx_visitor_deliveries_tenant_status
ON visitor_deliveries (tenant_id, status);

CREATE UNIQUE INDEX uq_visitor_supplier_visits_tenant_number
ON visitor_supplier_visits (tenant_id, supplier_visit_number);

CREATE INDEX idx_supplier_visits_tenant_supplier
ON visitor_supplier_visits (tenant_id, supplier_id);

CREATE INDEX idx_supplier_visits_tenant_work_order
ON visitor_supplier_visits (tenant_id, maintenance_work_order_id);

CREATE INDEX idx_supplier_visits_tenant_status
ON visitor_supplier_visits (tenant_id, status);

CREATE UNIQUE INDEX uq_access_incidents_tenant_number
ON access_incidents (tenant_id, incident_number);

CREATE INDEX idx_access_incidents_tenant_type
ON access_incidents (tenant_id, incident_type);

CREATE INDEX idx_access_incidents_tenant_severity
ON access_incidents (tenant_id, severity);

CREATE INDEX idx_access_incidents_tenant_status
ON access_incidents (tenant_id, status);

CREATE INDEX idx_access_incidents_tenant_created
ON access_incidents (tenant_id, created_at);
```

---

## 16.7. Comentarios, documentos y exports

```sql id="dz6abx"
CREATE INDEX idx_access_comments_tenant_entity
ON access_comments (tenant_id, entity_type, entity_id);

CREATE INDEX idx_access_comments_tenant_visibility
ON access_comments (tenant_id, visibility);

CREATE INDEX idx_access_documents_tenant_entity
ON access_documents (tenant_id, entity_type, entity_id);

CREATE INDEX idx_access_documents_tenant_document
ON access_documents (tenant_id, secure_document_id);

CREATE INDEX idx_access_report_exports_tenant_type
ON access_report_exports (tenant_id, report_type);

CREATE INDEX idx_access_report_exports_tenant_status
ON access_report_exports (tenant_id, status);

CREATE INDEX idx_access_report_exports_tenant_created
ON access_report_exports (tenant_id, created_at);
```

---

# 17. Constraints recomendados

## 17.1. Autorizaciones

```sql id="ubpq59"
ALTER TABLE access_authorizations
ADD CONSTRAINT chk_access_authorizations_validity
CHECK (valid_from < valid_until);

ALTER TABLE access_authorizations
ADD CONSTRAINT chk_access_authorizations_entries
CHECK (
  max_entries IS NULL
  OR (max_entries > 0 AND entries_used >= 0 AND entries_used <= max_entries)
);

ALTER TABLE access_authorizations
ADD CONSTRAINT chk_access_authorizations_cancel_fields
CHECK (
  status <> 'cancelled'
  OR (cancelled_by IS NOT NULL AND cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);

ALTER TABLE access_authorizations
ADD CONSTRAINT chk_access_authorizations_revoke_fields
CHECK (
  status <> 'revoked'
  OR (revoked_by IS NOT NULL AND revoked_at IS NOT NULL AND revoke_reason IS NOT NULL)
);
```

---

## 17.2. Access passes

```sql id="wo5sct"
ALTER TABLE access_passes
ADD CONSTRAINT chk_access_passes_expires
CHECK (expires_at > created_at);

ALTER TABLE access_passes
ADD CONSTRAINT chk_access_passes_used_fields
CHECK (
  status <> 'used'
  OR used_at IS NOT NULL
);

ALTER TABLE access_passes
ADD CONSTRAINT chk_access_passes_revoked_fields
CHECK (
  status <> 'revoked'
  OR (revoked_by IS NOT NULL AND revoked_at IS NOT NULL AND revoke_reason IS NOT NULL)
);
```

---

## 17.3. Eventos

```sql id="mbfl4t"
ALTER TABLE access_events
ADD CONSTRAINT chk_access_events_voided_fields
CHECK (
  event_status <> 'voided'
  OR (voided_by IS NOT NULL AND voided_at IS NOT NULL AND void_reason IS NOT NULL)
);

ALTER TABLE access_events
ADD CONSTRAINT chk_access_events_corrected_fields
CHECK (
  event_status <> 'corrected'
  OR (corrected_by IS NOT NULL AND corrected_at IS NOT NULL AND correction_reason IS NOT NULL)
);
```

---

## 17.4. Check-ins y check-outs

```sql id="t8p5nf"
ALTER TABLE access_check_ins
ADD CONSTRAINT chk_access_check_ins_voided_fields
CHECK (
  status <> 'voided'
  OR (voided_by IS NOT NULL AND voided_at IS NOT NULL AND void_reason IS NOT NULL)
);

ALTER TABLE access_check_ins
ADD CONSTRAINT chk_access_check_ins_closed_fields
CHECK (
  status <> 'closed'
  OR closed_at IS NOT NULL
);

ALTER TABLE access_check_outs
ADD CONSTRAINT chk_access_check_outs_voided_fields
CHECK (
  status <> 'voided'
  OR (voided_by IS NOT NULL AND voided_at IS NOT NULL AND void_reason IS NOT NULL)
);
```

---

## 17.5. Entregas y visitas de proveedores

```sql id="nur4l8"
ALTER TABLE visitor_deliveries
ADD CONSTRAINT chk_visitor_deliveries_return_fields
CHECK (
  status <> 'returned'
  OR (returned_at IS NOT NULL AND return_reason IS NOT NULL)
);

ALTER TABLE visitor_deliveries
ADD CONSTRAINT chk_visitor_deliveries_cancel_fields
CHECK (
  status <> 'cancelled'
  OR (cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);

ALTER TABLE visitor_supplier_visits
ADD CONSTRAINT chk_supplier_visits_schedule_window
CHECK (
  scheduled_from IS NULL
  OR scheduled_until IS NULL
  OR scheduled_from < scheduled_until
);

ALTER TABLE visitor_supplier_visits
ADD CONSTRAINT chk_supplier_visits_cancel_fields
CHECK (
  status <> 'cancelled'
  OR (cancelled_at IS NOT NULL AND cancel_reason IS NOT NULL)
);
```

---

## 17.6. Incidentes y exports

```sql id="ancjeb"
ALTER TABLE access_incidents
ADD CONSTRAINT chk_access_incidents_description_required
CHECK (description IS NOT NULL AND length(trim(description)) > 0);

ALTER TABLE access_incidents
ADD CONSTRAINT chk_access_incidents_resolved_fields
CHECK (
  status <> 'resolved'
  OR (resolved_by IS NOT NULL AND resolved_at IS NOT NULL AND resolution_reason IS NOT NULL)
);

ALTER TABLE access_incidents
ADD CONSTRAINT chk_access_incidents_dismissed_fields
CHECK (
  status <> 'dismissed'
  OR (dismissed_by IS NOT NULL AND dismissed_at IS NOT NULL AND dismiss_reason IS NOT NULL)
);

ALTER TABLE access_report_exports
ADD CONSTRAINT chk_access_report_exports_completed_document
CHECK (
  status <> 'completed'
  OR (secure_document_id IS NOT NULL AND completed_at IS NOT NULL)
);

ALTER TABLE access_report_exports
ADD CONSTRAINT chk_access_report_exports_failed_reason
CHECK (
  status <> 'failed'
  OR (failed_at IS NOT NULL AND failure_reason IS NOT NULL)
);
```

---

# 18. Validaciones de aplicación

Algunas reglas deben validarse en servicios de dominio o aplicación.

```text id="kqprc1"
- visitorId pertenece al tenant.
- vehicleId pertenece al tenant.
- gateId pertenece al tenant.
- authorizationId pertenece al tenant.
- accessPassId pertenece al tenant.
- checkInId pertenece al tenant.
- propertyUnitId pertenece al tenant.
- personId pertenece al tenant.
- supplierId pertenece al tenant.
- maintenanceWorkOrderId pertenece al tenant.
- secureDocumentId pertenece al tenant.
- Resident solo opera unidades propias.
- Guard solo opera con permisos de guardia.
- PlatformAdmin requiere tenant context explícito.
- authorization active está vigente.
- authorization expired/cancelled/revoked no permite ingreso.
- AccessPass oneTime no se reutiliza.
- visitor blockedTenant no puede autorizarse salvo override.
- vehicle blockedTenant no puede ingresar salvo override.
- check-out no se duplica.
- salida sin check-in requiere razón.
- comentario internal no se expone en /me.
- documentos no devuelven storageKey.
- reportes no devuelven identification raw ni plate raw.
```

---

# 19. Estrategia de números secuenciales

## 19.1. `authorization_number`

```text id="q9ssne"
AA-{YYYYMM}-{sequence}
```

Ejemplo:

```text id="k2zj0m"
AA-202607-000001
```

---

## 19.2. `event_number`

```text id="d9oijb"
AE-{YYYYMM}-{sequence}
```

Ejemplo:

```text id="mnlf8q"
AE-202607-000001
```

---

## 19.3. `delivery_number`

```text id="hdtjm3"
AD-{YYYYMM}-{sequence}
```

---

## 19.4. `supplier_visit_number`

```text id="u5symh"
ASV-{YYYYMM}-{sequence}
```

---

## 19.5. `incident_number`

```text id="t79z0u"
AI-{YYYYMM}-{sequence}
```

---

## 19.6. Reglas

```text id="g91ky1"
- Todos los números son únicos por tenant.
- La generación es server-side.
- Debe ser transaccional.
- No se aceptan desde DTO externo.
```

---

# 20. Estrategia de enmascaramiento

## 20.1. Identificación

Ejemplo:

```text id="y4hoev"
raw temporal: 1723456790
masked: 17******90
hash: HMAC-SHA256(normalized, tenantPepper)
```

---

## 20.2. Teléfono

Ejemplo:

```text id="td8x1s"
raw temporal: 0991234321
masked: 09*****321
hash: HMAC-SHA256(normalized, tenantPepper)
```

---

## 20.3. Placa

Ejemplo:

```text id="mxr2mw"
raw temporal: PBA1234
masked: PB*-***4
hash: HMAC-SHA256(normalized, tenantPepper)
```

---

## 20.4. Código de pase

Ejemplo:

```text id="e6qacw"
raw temporal: AB8291
masked: AB**91
hash: HMAC-SHA256(raw, tenantPepper)
```

---

# 21. Estrategia `/me`

## 21.1. Resolución de recursos propios

Patrón:

```text id="flob2c"
UserProfile
  -> Person
  -> active Residency / Ownership
  -> PropertyUnit
  -> AccessAuthorization / AccessEvent own scope
```

---

## 21.2. `/me` puede ver

```text id="wmnf97"
- visitantes creados por el usuario o asociados a sus autorizaciones;
- autorizaciones de sus unidades;
- eventos de acceso vinculados a sus unidades en forma limitada;
- estado de autorizaciones;
- datos enmascarados del visitante.
```

---

## 21.3. `/me` no puede ver

```text id="g7uudx"
- visitantes de otras unidades;
- notas internas;
- incidentes internos no visibles;
- guardia completo si la política no lo permite;
- reportes masivos;
- audit logs;
- documentos administrativos;
- identificaciones completas;
- placas completas;
- accessPassCode completo persistente.
```

---

# 22. Estrategia Guard API

## 22.1. Guard puede operar

```text id="k10slb"
- consultar autorizaciones activas;
- validar código/pase;
- registrar check-in;
- registrar check-out;
- registrar deniedAccess;
- registrar incidentes;
- registrar entregas;
- consultar eventos recientes.
```

---

## 22.2. Guard no puede operar

```text id="f4k0bn"
- cambiar tenant;
- exportar reportes masivos salvo permiso explícito;
- consultar visitantes de forma irrestricta sin motivo operativo;
- borrar eventos;
- modificar auditoría;
- habilitar biometría;
- abrir portones desde el sistema en MVP.
```

---

# 23. Documentos y Secure Document Storage

## 23.1. `sourceModule`

El módulo `016-secure-document-storage` debe reconocer:

```text id="d0h1be"
sourceModule = accessControlVisitors
```

---

## 23.2. `sourceResourceType`

Tipos recomendados:

```text id="r1hoaj"
accessDocument
accessIncidentDocument
accessDeliveryDocument
accessSupplierVisitDocument
accessReportExport
```

---

## 23.3. Clasificación recomendada

```text id="opxhuv"
visibility:
- administrative
- ownLimited

sensitivity:
- internal
- restricted
```

---

## 23.4. Reglas

```text id="n56yhh"
- Access Control guarda secureDocumentId.
- Access Control no guarda storageKey.
- Access Control no guarda signedUrl persistente.
- Access Control no guarda base64.
- Access Control no guarda binarios.
- Descargas se delegan a SDS.
- Descargas sensibles se auditan.
```

---

# 24. Integración con Supplier Payments

Campos relacionados:

```text id="tou8k9"
visitor_supplier_visits.supplier_id
```

Reglas:

```text id="p79fcf"
- supplierId debe pertenecer al tenant.
- supplier debe estar active.
- supplier blocked se rechaza salvo override auditado.
- Access Control no crea SupplierPayable.
- Access Control no crea SupplierPaymentOrder.
- Access Control no crea Payment.
- Access Control no modifica cuenta bancaria de proveedor.
```

---

# 25. Integración con Maintenance Work Orders

Campos relacionados:

```text id="byvb6u"
visitor_supplier_visits.maintenance_work_order_id
```

Reglas:

```text id="l0h2bg"
- maintenanceWorkOrderId debe pertenecer al tenant.
- workOrder no debe estar archived.
- supplier visit puede relacionarse con orden de mantenimiento.
- Access Control no cierra órdenes.
- Access Control no cambia estados.
- Access Control no crea costos.
- Access Control no crea payables.
```

---

# 26. Auditoría de datos

Campos actor server-side:

```text id="h9xz0o"
createdBy
updatedBy
authorizedByUserId
checkedInByUserId
checkedOutByUserId
recordedByUserId
cancelledBy
revokedBy
archivedBy
voidedBy
correctedBy
resolvedBy
dismissedBy
requestedBy
```

Prohibido desde cliente:

```text id="g5wo90"
createdBy
updatedBy
authorizedByUserId como actor arbitrario
checkedInByUserId
checkedOutByUserId
recordedByUserId
cancelledBy
revokedBy
archivedBy
voidedBy
correctedBy
resolvedBy
dismissedBy
requestedBy
```

Eventos críticos a auditar:

```text id="cd26so"
accessVisitor.created
accessVisitor.updated
accessVisitor.watchlisted
accessVisitor.blocked
accessVisitor.archived
accessVehicle.created
accessVehicle.updated
accessVehicle.blocked
accessVehicle.archived
accessGate.created
accessGate.updated
accessGate.archived
accessAuthorization.created
accessAuthorization.activated
accessAuthorization.cancelled
accessAuthorization.revoked
accessAuthorization.expired
accessAuthorization.used
accessPass.created
accessPass.used
accessPass.expired
accessPass.revoked
accessCheckIn.recorded
accessCheckIn.voided
accessCheckOut.recorded
accessCheckOut.voided
accessEvent.recorded
accessEvent.corrected
accessEvent.voided
accessDelivery.created
accessDelivery.received
accessDelivery.delivered
accessDelivery.returned
accessSupplierVisit.created
accessSupplierVisit.checkedIn
accessSupplierVisit.checkedOut
accessSupplierVisit.cancelled
accessSupplierVisit.denied
accessIncident.created
accessIncident.updated
accessIncident.resolved
accessIncident.dismissed
accessReport.generated
accessReport.exported
```

---

# 27. Datos prohibidos en `metadata`

No guardar en `metadata`:

```text id="l6b8ah"
identificationNumberRaw
plateRaw
phoneRaw
emailRaw
accessPassCodeRaw
storageKey
signedUrl
base64
raw file payload
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
tokens
secrets
passwords
SQL raw
stack trace productivo
datos cross-tenant
raw supplier payload
raw payment payload
datos bancarios
```

---

# 28. Campos prohibidos en DTOs externos

Todo DTO externo debe rechazar:

```text id="d5neyf"
tenantId
createdBy
updatedBy
authorizedBy
checkedInBy
checkedOutBy
recordedBy
cancelledBy
revokedBy
archivedBy
voidedBy
correctedBy
resolvedBy
dismissedBy
requestedBy
status directo fuera de endpoint de transición
authorizationNumber
eventNumber
deliveryNumber
supplierVisitNumber
incidentNumber
identificationNumberHash
phoneHash
emailHash
plateHash
passCodeHash
storageKey
signedUrl
base64
rawFilePayload
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
paymentId
paymentOrderId
supplierPaymentOrderId
journalEntryId
bankTransactionId
externalAiEnabled
```

---

# 29. Queries conceptuales

## 29.1. Autorizaciones activas para garita

```sql id="kh5lc2"
SELECT
  a.id,
  a.authorization_number,
  a.visitor_id,
  v.full_name,
  a.property_unit_id,
  a.authorization_type,
  a.valid_from,
  a.valid_until,
  a.status
FROM access_authorizations a
JOIN visitor_profiles v ON v.id = a.visitor_id
WHERE a.tenant_id = :tenantId
  AND a.status = 'active'
  AND a.valid_from <= now()
  AND a.valid_until >= now()
ORDER BY a.valid_until ASC
LIMIT :limit;
```

---

## 29.2. Check-ins abiertos

```sql id="lte45h"
SELECT
  ci.id,
  ci.visitor_id,
  v.full_name,
  ci.property_unit_id,
  ci.gate_id,
  ci.checked_in_at
FROM access_check_ins ci
JOIN visitor_profiles v ON v.id = ci.visitor_id
WHERE ci.tenant_id = :tenantId
  AND ci.status = 'open'
ORDER BY ci.checked_in_at DESC;
```

---

## 29.3. Eventos por periodo

```sql id="j0g5bw"
SELECT
  e.event_type,
  e.event_status,
  COUNT(*) AS event_count
FROM access_events e
WHERE e.tenant_id = :tenantId
  AND e.occurred_at >= :dateFrom
  AND e.occurred_at < :dateTo
GROUP BY e.event_type, e.event_status
ORDER BY e.event_type;
```

---

## 29.4. Visitantes por unidad

```sql id="nmoqtc"
SELECT
  e.property_unit_id,
  e.visitor_id,
  v.full_name,
  COUNT(*) AS access_count,
  MAX(e.occurred_at) AS last_access_at
FROM access_events e
JOIN visitor_profiles v ON v.id = e.visitor_id
WHERE e.tenant_id = :tenantId
  AND e.property_unit_id = :propertyUnitId
  AND e.event_type IN ('checkIn', 'checkOut')
GROUP BY e.property_unit_id, e.visitor_id, v.full_name
ORDER BY last_access_at DESC;
```

---

## 29.5. Incidentes por severidad

```sql id="eysy3f"
SELECT
  severity,
  status,
  COUNT(*) AS incident_count
FROM access_incidents
WHERE tenant_id = :tenantId
  AND created_at >= :dateFrom
  AND created_at < :dateTo
GROUP BY severity, status
ORDER BY severity, status;
```

---

# 30. Reportes soportados por el modelo

## 30.1. Ingresos y salidas

Fuente:

```text id="twcipy"
access_events
access_check_ins
access_check_outs
visitor_profiles
visitor_vehicles
access_gates
```

Filtros:

```text id="pa40pm"
dateFrom
dateTo
gateId
propertyUnitId
visitorType
eventType
eventStatus
```

---

## 30.2. Visitantes por unidad

Fuente:

```text id="x08nvl"
access_events
visitor_profiles
visitor_vehicles
```

Filtros:

```text id="ipkhtr"
dateFrom
dateTo
propertyUnitId
visitorType
```

---

## 30.3. Autorizaciones

Fuente:

```text id="m2bbcs"
access_authorizations
access_passes
visitor_profiles
visitor_vehicles
```

Filtros:

```text id="j2ji8h"
dateFrom
dateTo
authorizationType
status
propertyUnitId
authorizedByUserId
```

---

## 30.4. Incidentes

Fuente:

```text id="v2aif3"
access_incidents
access_events
visitor_profiles
visitor_vehicles
access_gates
```

Filtros:

```text id="yr3xgl"
dateFrom
dateTo
severity
status
gateId
propertyUnitId
incidentType
```

---

## 30.5. Check-ins abiertos

Fuente:

```text id="n69qfl"
access_check_ins
visitor_profiles
visitor_vehicles
access_gates
```

---

## 30.6. Entregas y proveedores

Fuente:

```text id="x3x19f"
visitor_deliveries
visitor_supplier_visits
visitor_profiles
access_events
```

---

# 31. Migración recomendada

Nombre:

```text id="gs8es7"
024_create_access_control_visitors
```

Contenido:

```text id="mxfket"
- Crear enums Access Control.
- Crear visitor_profiles.
- Crear visitor_vehicles.
- Crear access_gates.
- Crear access_authorizations.
- Crear access_passes.
- Crear access_events.
- Crear access_check_ins.
- Crear access_check_outs.
- Crear visitor_deliveries.
- Crear visitor_supplier_visits.
- Crear visitor_recurring_authorizations.
- Crear access_incidents.
- Crear access_comments.
- Crear access_documents.
- Crear access_report_exports.
- Agregar relaciones a Tenant.
- Agregar índices tenant-scoped.
- Agregar índices por hash.
- Agregar índices únicos por tenant.
- Agregar constraints de vigencia.
- Agregar constraints de estado.
- Agregar constraints de check-out único.
- Agregar constraints de export completed.
- Extender Secure Document Storage sourceModule = accessControlVisitors.
```

---

# 32. Seeds iniciales

## 32.1. Gates

```text id="uzf1tl"
MAIN_GATE — Garita principal
VEHICLE_GATE — Entrada vehicular
PEDESTRIAN_GATE — Entrada peatonal
SUPPLIER_GATE — Acceso proveedores
SECONDARY_GATE — Acceso secundario
```

---

## 32.2. Visitor types

```text id="cjl1w1"
guest
family
delivery
supplier
technician
serviceWorker
administrative
emergency
other
```

---

## 32.3. Reglas de seeds

```text id="ozyfh6"
- Los seeds deben ser tenant-scoped.
- No incluir visitantes reales.
- No incluir identificaciones reales.
- No incluir placas reales.
- No incluir teléfonos reales.
- No incluir documentos reales.
- No incluir proveedores reales salvo fixtures sintéticos.
```

---

# 33. Compatibilidad con microservicios futuros

El modelo permite separación futura porque:

```text id="k102bx"
- usa UUID globales;
- tenant_id explícito;
- referencias externas por UUID;
- validación externa mediante puertos;
- eventos de acceso como fuente de trazabilidad;
- no depende de WordPress;
- no depende de hardware físico;
- no almacena biometría;
- documentos vía SDS;
- auditoría desacoplada;
- reportes vía API.
```

Recomendación:

```text id="rnmape"
Mantener Access Control and Visitors como módulo dentro del monolito modular hasta que existan integraciones reales con hardware, volumen operativo alto, múltiples garitas concurrentes o requerimientos de baja latencia que justifiquen extracción física.
```

---

# 34. No aceptación del modelo

El modelo no debe aceptarse si:

```text id="avurws"
- alguna tabla operativa no tiene tenant_id;
- permite consultar entidades tenant-scoped por id simple;
- mezcla visitantes de distintos tenants;
- comparte watchlist entre tenants;
- almacena identificación raw sin justificación;
- expone identificación completa por defecto;
- almacena placa raw sin justificación;
- expone placa completa por defecto;
- almacena accessPassCode raw;
- expone passCodeHash por API;
- almacena storageKey;
- almacena signedUrl persistente;
- almacena base64;
- almacena binarios;
- incluye biometricTemplate;
- incluye faceEmbedding;
- incluye cameraStreamUrl;
- incluye gateOpenCommand;
- incluye hardwareDeviceCommand;
- permite apertura automática de portón en MVP;
- permite control físico de hardware en MVP;
- no modela AccessEvent como trazabilidad;
- permite borrar físicamente check-ins/check-outs;
- permite doble check-out activo;
- no soporta autorización /me propia;
- permite que residente vea otra unidad;
- permite que guardia cambie tenant;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- confirma Bank Reconciliation;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- permite IA externa con datos reales.
```

---

# 35. Resultado esperado

Al implementar este modelo de datos, `024-access-control-visitors` tendrá una base persistente segura, privada y auditable para controlar visitantes, autorizaciones, accesos, salidas, entregas, proveedores visitantes, incidentes y reportes de acceso por tenant.

Resultado esperado:

```text id="dnbvo8"
visitor_profiles modelado
visitor_vehicles modelado
access_gates modelado
access_authorizations modelado
access_passes modelado
access_events modelado
access_check_ins modelado
access_check_outs modelado
visitor_deliveries modelado
visitor_supplier_visits modelado
visitor_recurring_authorizations modelado
access_incidents modelado
access_comments modelado
access_documents modelado
access_report_exports modelado
tenant isolation modelado
visitor privacy modelada
identification masking modelado
phone masking modelado
plate masking modelado
access pass hashing modelado
resident own access modelado
guard operations modeladas
check-in tracking modelado
check-out tracking modelado
denied access modelado
incident tracking modelado
delivery tracking modelado
supplier visit tracking modelado
SDS documents modelados
reports soportados
exports soportados
audit soportado
no public endpoints
no WordPress access
no biometric processing
no face recognition
no gate opening
no hardware control
no external AI with real data
```

---

# 36. Expediente actualizado

```text id="zf1lbi"
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
│   │   └── 024-access-control-visitors/
│   │       ├── spec.md
│   │       ├── plan.md
│   │       └── data-model.md
```
