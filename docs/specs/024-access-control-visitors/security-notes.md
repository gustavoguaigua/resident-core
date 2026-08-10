# Security Notes — 024 Access Control and Visitors

## 1. Información del documento

| Campo           | Valor                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto        | RESIDENT Core                                                                                                                             |
| Spec ID         | 024                                                                                                                                       |
| Módulo          | Access Control and Visitors                                                                                                               |
| Documento       | Security Notes                                                                                                                            |
| Ruta            | `docs/specs/024-access-control-visitors/security-notes.md`                                                                                |
| Versión         | 0.1                                                                                                                                       |
| Estado          | needs-review                                                                                                                              |
| Fecha           | 2026-07-30                                                                                                                                |
| Documento base  | `docs/specs/024-access-control-visitors/spec.md`                                                                                          |
| Plan técnico    | `docs/specs/024-access-control-visitors/plan.md`                                                                                          |
| Modelo de datos | `docs/specs/024-access-control-visitors/data-model.md`                                                                                    |
| Contrato API    | `docs/specs/024-access-control-visitors/api-contract.md`                                                                                  |
| Plan de pruebas | `docs/specs/024-access-control-visitors/test-plan.md`                                                                                     |
| Backlog técnico | `docs/specs/024-access-control-visitors/tasks.md`                                                                                         |
| Stack objetivo  | NestJS / TypeScript / PostgreSQL / Prisma / OpenAPI / Keycloak                                                                            |
| Naturaleza      | Tenant-scoped / Security-sensitive / Privacy-sensitive / Visitor-driven / Resident-authorized / Guard-operated / Audit-heavy / Non-public |

---

## 2. Propósito

Este documento define las notas de seguridad del módulo `024-access-control-visitors`.

El módulo gestiona información sensible relacionada con visitantes, vehículos, autorizaciones, accesos, salidas, entregas, proveedores visitantes, incidentes, comentarios, documentos y reportes de seguridad de cada conjunto residencial.

Por su naturaleza, este módulo tiene un riesgo superior al de otros módulos operativos, porque registra datos personales de terceros externos al conjunto, hábitos de ingreso, relaciones con unidades habitacionales, horarios, incidentes de seguridad y movimientos físicos dentro del conjunto.

Regla central de seguridad:

```text id="acv-sec-rule"
Toda solicitud, visitante, vehículo, autorización, pase temporal, evento de acceso, check-in, check-out, entrega, visita de proveedor, autorización recurrente, incidente, comentario, documento, reporte, exportación, log y evento de auditoría de Access Control and Visitors debe proteger tenant isolation, privacidad de visitantes y residentes, autorización por permiso y recurso, acceso propio /me, operación restringida de guardia, trazabilidad completa, minimización de datos personales, enmascaramiento de datos sensibles, ausencia de endpoints públicos, ausencia de acceso desde WordPress público, ausencia de storageKey expuesto, ausencia de biometría, ausencia de reconocimiento facial, ausencia de apertura automática de portones, ausencia de control físico de hardware, ausencia de OCR automático de placas, ausencia de pagos, ausencia de contabilidad, ausencia de conciliación bancaria y ausencia de IA externa con datos reales.
```

---

## 3. Clasificación de seguridad

### 3.1. Clasificación del módulo

```text id="acv-sec-classification"
Security-sensitive
Privacy-sensitive
Tenant-scoped
Resident-facing limited
Guard-operated
Audit-heavy
Non-public
Operationally sensitive
Not public-information
Not WordPress-accessible
Not biometric
Not hardware-control
Not financial
```

---

### 3.2. Nivel de sensibilidad

| Componente                    | Sensibilidad | Justificación                                        |
| ----------------------------- | -----------: | ---------------------------------------------------- |
| VisitorProfile                |         Alta | Contiene datos personales de terceros                |
| VisitorVehicle                |         Alta | Placa vehicular puede identificar personas o hábitos |
| AccessAuthorization           |         Alta | Revela quién puede ingresar, cuándo y a qué unidad   |
| AccessPass                    |         Alta | Puede permitir o facilitar ingreso                   |
| AccessEvent                   |         Alta | Historial de movimientos físicos                     |
| AccessCheckIn                 |         Alta | Evidencia de ingreso                                 |
| AccessCheckOut                |         Alta | Evidencia de salida                                  |
| VisitorDelivery               |   Media/Alta | Puede revelar destinatarios y actividad de unidades  |
| VisitorSupplierVisit          |   Media/Alta | Revela proveedores, técnicos y actividades internas  |
| VisitorRecurringAuthorization |         Alta | Revela patrones recurrentes de acceso                |
| AccessIncident                |         Alta | Contiene novedades o riesgos de seguridad            |
| AccessComment                 |   Media/Alta | Puede contener observaciones internas                |
| AccessDocument                |         Alta | Evidencia documental o reportes                      |
| AccessReportExport            |         Alta | Puede consolidar datos personales y operativos       |

---

## 4. Principios de seguridad

```text id="acv-sec-principles"
1. Keycloak autentica; RESIDENT Core autoriza.
2. Tenant isolation es obligatorio en todas las operaciones.
3. Ningún dato de acceso se expone públicamente.
4. WordPress público no accede al módulo.
5. Resident solo accede a recursos propios.
6. Guard solo opera funciones de garita autorizadas.
7. PlatformAdmin no accede automáticamente a datos de visitantes.
8. Los datos personales se minimizan.
9. Identificación, teléfono, email, placa y códigos se enmascaran.
10. Las búsquedas sensibles usan hash/HMAC tenant-aware.
11. Los valores raw son temporales y no persistentes.
12. Los eventos críticos no se eliminan físicamente.
13. Toda operación crítica se audita.
14. Logs y métricas no contienen PII raw.
15. Documentos se delegan a Secure Document Storage.
16. No se expone storageKey.
17. No se acepta base64 ni archivos raw en JSON.
18. No se procesa biometría.
19. No se realiza reconocimiento facial.
20. No se abre portones desde el sistema en MVP.
21. No se controla hardware físico en MVP.
22. No se realiza OCR automático de placas en MVP.
23. No se crean pagos, asientos ni conciliaciones.
24. No se envían datos reales a IA externa.
```

---

## 5. Modelo de amenazas

### 5.1. Activos protegidos

```text id="acv-assets"
- Datos personales de visitantes.
- Identificaciones enmascaradas y hashes.
- Teléfonos enmascarados y hashes.
- Emails enmascarados y hashes.
- Placas vehiculares enmascaradas y hashes.
- Códigos de pases temporales.
- Autorizaciones de ingreso.
- Historial de check-ins y check-outs.
- Eventos de acceso.
- Incidentes de seguridad.
- Comentarios internos.
- Documentos de soporte.
- Exportaciones de reportes.
- Relación visitante-unidad.
- Relación proveedor-visita.
- Relación técnico-orden de mantenimiento.
- Metadatos de auditoría.
- Configuración de gates.
```

---

### 5.2. Actores potencialmente maliciosos

```text id="acv-threat-actors"
- Usuario anónimo.
- Residente autenticado intentando ver otra unidad.
- Guardia intentando operar otro tenant.
- Guardia intentando modificar historial.
- Administrador de tenant excediendo permisos.
- PlatformAdmin sin justificación operativa.
- Usuario autenticado de otro tenant.
- Script automatizado intentando enumerar pases.
- Actor intentando usar WordPress público como canal de acceso.
- Actor intentando enviar campos prohibidos por mass assignment.
- Actor intentando subir documentos o payloads maliciosos.
- Actor intentando exfiltrar reportes.
- Actor intentando inyectar comandos de hardware.
- Actor intentando introducir biometría o face embeddings.
- Actor intentando enviar datos a IA externa.
```

---

### 5.3. Amenazas principales

| Amenaza                                |  Riesgo | Control                                                |
| -------------------------------------- | ------: | ------------------------------------------------------ |
| Acceso cross-tenant                    | Crítico | tenantId obligatorio, filtros por tenant, tests 404    |
| Residente ve visitantes de otra unidad | Crítico | OwnResourceGuard, relación UserProfile → Person → Unit |
| Guardia opera otro tenant              | Crítico | TenantGuard, GuardOperationGuard, permisos             |
| Exposición pública de visitantes       | Crítico | No public endpoints, 404 en `/public/access-*`         |
| Acceso desde WordPress público         | Crítico | CORS restrictivo, no API pública, no WordPress access  |
| Enumeración de pases                   |    Alto | Rate limit, hash, respuestas genéricas                 |
| Reutilización de pase oneTime          |    Alto | transacción, status used, constraints                  |
| Check-out duplicado                    |    Alto | constraint + transacción                               |
| Datos personales en logs               |    Alto | log sanitizer, tests                                   |
| Datos personales en auditoría          |    Alto | audit sanitizer, metadata allowlist                    |
| storageKey expuesto                    |    Alto | SDS boundary, DTO denylist, response sanitizer         |
| Comandos de portón inyectados          |    Alto | DTO denylist, feature flags false                      |
| Biometría accidental                   |    Alto | campos prohibidos, CI gates, feature flags false       |
| Reportes masivos sensibles             |    Alto | permisos, paginación, export vía SDS                   |
| Borrado destructivo de eventos         |    Alto | archivo/anulación/corrección auditada                  |
| IA externa con datos reales            |    Alto | policy, flags, tests, no adapters                      |

---

## 6. Superficies de ataque

### 6.1. Tenant Admin API

```text id="acv-attack-admin-api"
/api/v1/tenant/access-*
```

Riesgos:

```text id="acv-admin-risks"
- Exposición de datos de visitantes.
- Consulta masiva de eventos.
- Exportación indebida.
- Cambios no autorizados de estados.
- Envío de campos prohibidos.
- Uso de referencias cross-tenant.
```

Controles:

```text id="acv-admin-controls"
- AuthGuard.
- TenantGuard.
- PermissionGuard.
- DTO denylist.
- Validación de referencias tenant-scoped.
- Paginación.
- Rate limit en acciones sensibles.
- Audit obligatorio.
- Response masking.
```

---

### 6.2. Guard API

```text id="acv-attack-guard-api"
/api/v1/tenant/guard/access-*
```

Riesgos:

```text id="acv-guard-risks"
- Ingreso fraudulento.
- Validación abusiva de pases.
- Registro falso de check-in.
- Registro falso de check-out.
- Consulta operativa excesiva.
- Exposición de visitantes o placas.
```

Controles:

```text id="acv-guard-controls"
- AuthGuard.
- TenantGuard.
- GuardOperationGuard.
- Permisos guardAccess.*.
- Rate limit reforzado.
- Respuestas minimizadas.
- Recent events limitado.
- Auditoría de cada operación.
- No exportación masiva por defecto.
```

---

### 6.3. `/me` API

```text id="acv-attack-me-api"
/api/v1/me/access-*
```

Riesgos:

```text id="acv-me-risks"
- Residente consulta visitantes de otra unidad.
- Residente cancela autorización ajena.
- Residente crea autorización para unidad ajena.
- Residente obtiene información interna de guardia.
- Residente obtiene incidentes o comentarios internos.
```

Controles:

```text id="acv-me-controls"
- AuthGuard.
- TenantGuard.
- OwnResourceGuard.
- Resolución UserProfile -> Person -> Unit.
- DTOs específicos para /me.
- No exposición de notas internas.
- No exposición de audit metadata.
- No check-in/check-out desde /me.
- No exportación masiva desde /me.
```

---

### 6.4. Reportes y exportaciones

Riesgos:

```text id="acv-reports-risks"
- Exfiltración masiva de datos personales.
- Reportes cross-tenant.
- Exportación con identificaciones completas.
- Exportación con placas completas.
- storageKey expuesto.
- signedUrl persistente expuesto.
```

Controles:

```text id="acv-reports-controls"
- Permisos accessReports.*.
- Filtros tenant-scoped.
- Paginación.
- pageSize máximo 100.
- Enmascaramiento.
- Exports vía Secure Document Storage.
- No storageKey.
- Audit accessReport.exported.
```

---

## 7. Autenticación

Todos los endpoints permitidos requieren:

```http id="acv-auth-header"
Authorization: Bearer <access_token>
```

Reglas:

```text id="acv-auth-rules"
- Keycloak valida identidad.
- RESIDENT Core resuelve UserProfile.
- RESIDENT Core resuelve TenantMembership.
- RESIDENT Core resuelve currentTenant.
- RESIDENT Core autoriza por permiso, recurso y relación propia.
```

Prohibido:

```text id="acv-auth-forbidden"
- Acceso anónimo.
- API keys públicas.
- Tokens por query string.
- Sesión WordPress como autenticación Core.
- userId enviado por cliente como actor.
- tenantId enviado por cliente como autoridad.
```

No aceptación:

```text id="acv-auth-no-acceptance"
No se acepta ningún endpoint de Access Control and Visitors que opere sin autenticación explícita.
```

---

## 8. Autorización

### 8.1. Capas obligatorias

```text id="acv-authz-layers"
1. AuthGuard.
2. TenantGuard.
3. PermissionGuard.
4. Resource tenant validation.
5. OwnResourceGuard cuando aplique /me.
6. GuardOperationGuard cuando aplique garita.
7. Domain policy.
8. DTO denylist.
```

---

### 8.2. Matriz de acceso resumida

| Actor           | Tenant Admin API |              Guard API |            `/me` API |       Reportes |     Exportaciones |
| --------------- | ---------------: | ---------------------: | -------------------: | -------------: | ----------------: |
| TenantAdmin     | Sí, con permisos | Opcional, con permisos |         No principal |             Sí |                Sí |
| SecurityManager | Sí, con permisos |       Sí, con permisos |         No principal |             Sí | Sí, si autorizado |
| Guard           |         Limitado |                     Sí |                   No | No por defecto |    No por defecto |
| Resident        |   No por defecto |                     No |           Sí, propio |             No |                No |
| PropertyOwner   |   No por defecto |                     No | Sí, si policy tenant |             No |                No |
| PlatformAdmin   | Solo excepcional |         No por defecto |                   No |    Excepcional |       Excepcional |

---

### 8.3. Permisos críticos

```text id="acv-critical-permissions"
accessVisitors.read
accessVisitors.create
accessVisitors.update
accessVisitors.block
accessVisitorVehicles.block
accessAuthorizations.create
accessAuthorizations.cancel
accessAuthorizations.revoke
accessAuthorizations.own.create
accessAuthorizations.own.cancel
accessPasses.validate
accessCheckIns.create
accessCheckOuts.create
guardAccess.checkIns.create
guardAccess.checkOuts.create
accessEvents.correct
accessEvents.void
accessIncidents.resolve
accessReports.exports
accessDocuments.download
```

Regla:

```text id="acv-permission-rule"
Los permisos críticos deben asignarse explícitamente por rol de tenant y no deben heredarse accidentalmente desde roles globales.
```

---

## 9. Tenant isolation

### 9.1. Regla obligatoria

Toda consulta por recurso debe usar:

```typescript id="acv-tenant-query-pattern"
where: {
  id: resourceId,
  tenantId: currentTenant.id,
  archivedAt: null
}
```

Prohibido:

```typescript id="acv-tenant-query-forbidden"
where: {
  id: resourceId
}
```

---

### 9.2. Respuesta cross-tenant

Si un recurso existe pero pertenece a otro tenant:

```http id="acv-cross-tenant-response"
404 Not Found
```

No usar `403` para cross-tenant cuando pueda revelar existencia del recurso.

---

### 9.3. Referencias que deben validarse por tenant

```text id="acv-tenant-reference-validation"
visitorId
vehicleId
gateId
authorizationId
accessPassId
accessEventId
checkInId
checkOutId
deliveryId
supplierVisitId
recurringAuthorizationId
incidentId
commentId
documentId
reportExportId
propertyUnitId
personId
supplierId
maintenanceWorkOrderId
secureDocumentId
```

---

## 10. Acceso propio `/me`

### 10.1. Resolución obligatoria

```text id="acv-own-resolution"
UserProfile
  -> Person
  -> active Residency / Ownership
  -> PropertyUnit
  -> Access resource
```

---

### 10.2. `/me` puede acceder a

```text id="acv-me-allowed"
- visitantes creados por el usuario o asociados a sus autorizaciones propias;
- autorizaciones de sus unidades;
- cancelación de autorizaciones propias futuras;
- eventos de acceso propios con información limitada;
- datos enmascarados de visitante;
- estado de autorización.
```

---

### 10.3. `/me` no puede acceder a

```text id="acv-me-forbidden"
- visitantes de otras unidades;
- eventos de otras unidades;
- notas internas;
- incidentes internos no visibles;
- comentarios internal;
- metadata de auditoría;
- nombres completos de guardias si la política no lo permite;
- identificaciones completas;
- teléfonos completos;
- placas completas;
- passCode raw persistente;
- reportes masivos;
- exportaciones;
- check-in;
- check-out;
- corrección o anulación de eventos.
```

---

## 11. Guard API

### 11.1. Reglas de operación

```text id="acv-guard-rules"
- Guard API es privada.
- Guard API requiere AuthGuard.
- Guard API requiere TenantGuard.
- Guard API requiere GuardOperationGuard.
- Guard API requiere permisos guardAccess.*.
- Guard API no permite cambio de tenant.
- Guard API no permite exportación masiva por defecto.
- Guard API no permite borrar eventos.
- Guard API no permite modificar auditoría.
```

---

### 11.2. Datos visibles para guardia

Permitido:

```text id="acv-guard-visible"
- autorización vigente;
- visitante con nombre mínimo;
- identificación enmascarada si policy lo permite;
- placa enmascarada;
- unidad destino;
- gate;
- estado de autorización;
- advertencia watchlistedTenant;
- razón operativa mínima de bloqueo si policy lo permite.
```

No permitido:

```text id="acv-guard-not-visible"
- identificación completa;
- teléfono completo;
- hash de identificación;
- hash de placa;
- passCodeHash;
- notas administrativas sensibles no necesarias;
- audit logs;
- reportes masivos;
- storageKey;
- documentos completos sin permiso.
```

---

## 12. Privacidad y minimización de datos

### 12.1. Datos personales tratados

```text id="acv-personal-data"
fullName
identificationType
identificationNumberMasked
identificationNumberHash
phoneMasked
phoneHash
emailMasked
emailHash
plateMasked
plateHash
visitorType
propertyUnitId visitada
access timestamps
incident descriptions
delivery metadata
supplier visit metadata
```

---

### 12.2. Datos que no deben almacenarse por defecto

```text id="acv-do-not-store"
identificationNumberRaw
phoneRaw
emailRaw
plateRaw
accessPassCodeRaw
document image raw
camera frame
face image for recognition
biometricTemplate
faceEmbedding
fingerprintTemplate
irisTemplate
voicePrint
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
plateOcrPayload
```

---

### 12.3. Enmascaramiento obligatorio

```text id="acv-masking-required"
identificationNumber -> identificationNumberMasked
phone -> phoneMasked
email -> emailMasked si aplica
plate -> plateMasked
accessPassCode -> passCodeMasked
```

Ejemplos:

```text id="acv-masking-examples"
identificationNumberMasked = 17******90
phoneMasked = 09*****321
emailMasked = ju***@do***.com
plateMasked = PB*-***4
passCodeMasked = AB**91
```

---

### 12.4. Hash/HMAC para búsqueda exacta

```text id="acv-hmac-rule"
HMAC-SHA256(normalizedValue, tenantScopedPepper)
```

Reglas:

```text id="acv-hmac-rules"
- No usar hash simple sin pepper.
- No compartir pepper entre ambientes.
- No hardcodear pepper.
- No exponer pepper.
- No exponer hashes por API.
- No loggear valores raw.
- No loggear hashes sensibles.
```

---

## 13. Campos prohibidos

### 13.1. Prohibidos en DTOs externos

```text id="acv-forbidden-dto-fields"
tenantId
createdBy
updatedBy
authorizedBy
authorizedByUserId arbitrario
checkedInBy
checkedInByUserId
checkedOutBy
checkedOutByUserId
recordedBy
recordedByUserId
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
fullDocumentImage
biometricTemplate
faceEmbedding
fingerprintTemplate
irisTemplate
voicePrint
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
plateOcrPayload
cameraFrame
ocrConfidence
paymentId
paymentOrderId
supplierPaymentOrderId
journalEntryId
bankTransactionId
reconciliationMatchId
externalAiEnabled
```

Respuesta esperada:

```http id="acv-forbidden-dto-response"
422 Unprocessable Entity
```

---

### 13.2. Prohibidos en responses

```text id="acv-forbidden-response-fields"
identificationNumberRaw
phoneRaw
emailRaw
plateRaw
accessPassCodeRaw
identificationNumberHash
phoneHash
emailHash
plateHash
passCodeHash
storageKey
signedUrl persistente
base64
rawFilePayload
biometricTemplate
faceEmbedding
fingerprintTemplate
irisTemplate
voicePrint
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
plateOcrPayload
tokens
secrets
passwords
SQL raw
stack trace productivo
datos cross-tenant
```

---

### 13.3. Prohibidos en logs

```text id="acv-forbidden-log-fields"
identificationNumberRaw
phoneRaw
emailRaw
plateRaw
accessPassCodeRaw
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
tokens
secrets
passwords
authorization header
cookie
raw request body
```

---

### 13.4. Prohibidos en auditoría

```text id="acv-forbidden-audit-fields"
identificationNumberRaw
phoneRaw
emailRaw
plateRaw
accessPassCodeRaw
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
tokens
secrets
passwords
datos cross-tenant
```

---

## 14. Mass assignment protection

Todo DTO debe aplicar whitelist estricta.

Reglas:

```text id="acv-mass-assignment-rules"
- `tenantId` se resuelve server-side.
- `actor` se resuelve server-side.
- `status` se cambia solo por endpoints de transición.
- Números operativos se generan server-side.
- Hashes se generan server-side.
- Campos masked se generan server-side.
- Campos de auditoría se generan server-side.
- Campos documentales internos se resuelven mediante SDS.
```

Controles técnicos:

```text id="acv-mass-assignment-controls"
- ValidationPipe whitelist=true.
- forbidNonWhitelisted=true.
- DTO denylist tests.
- Mapper explícito DTO -> command.
- No usar spread directo de body hacia ORM.
- No usar update(data: req.body).
```

Patrón prohibido:

```typescript id="acv-prohibited-spread"
await prisma.visitorProfile.update({
  where: { id },
  data: req.body
});
```

Patrón recomendado:

```typescript id="acv-safe-mapping"
const command = CreateVisitorProfileCommand.fromDto(dto, {
  tenantId: currentTenant.id,
  actorUserProfileId: currentUser.id
});
```

---

## 15. Seguridad de AccessPass

### 15.1. Reglas

```text id="acv-pass-security-rules"
- passCode raw solo existe temporalmente al generarse o validarse.
- passCode raw no se persiste.
- passCode raw no se loggea.
- passCodeHash no se devuelve.
- passCodeMasked puede mostrarse de forma limitada.
- passCode debe expirar.
- passCode oneTime no se reutiliza.
- passCode revocado no permite ingreso.
- passCode usado no permite ingreso.
```

---

### 15.2. Enumeración de códigos

Controles:

```text id="acv-pass-enumeration-controls"
- Rate limit en validate pass.
- Respuestas inválidas genéricas.
- No diferenciar innecesariamente entre pass inexistente y pass de otro tenant.
- Trace auditado.
- No loggear passCode raw.
- Alertas por múltiples intentos fallidos.
```

Respuesta inválida aceptable:

```json id="acv-pass-invalid-response"
{
  "data": {
    "valid": false,
    "reasonCode": "ACCESS_PASS_INVALID"
  },
  "meta": {
    "traceId": "trace-id"
  }
}
```

---

### 15.3. Concurrencia

Casos críticos:

```text id="acv-pass-concurrency"
- Dos guardias validan el mismo pase oneTime.
- Un guardia valida mientras otro revoca.
- Un check-in ocurre mientras expira el pase.
```

Controles:

```text id="acv-pass-concurrency-controls"
- Transacciones.
- Row-level locking donde aplique.
- Estado used/revoked/expired validado dentro de la transacción.
- Constraint o update condicional por status active.
```

---

## 16. Seguridad de check-in y check-out

### 16.1. Check-in

Reglas:

```text id="acv-checkin-rules"
- checkedInAt es server-side.
- checkedInByUserId es server-side.
- gateId debe ser tenant-scoped.
- gate debe estar active.
- gate debe permitir entrada.
- authorization active debe estar vigente.
- pass active debe estar vigente.
- visitor blockedTenant se rechaza salvo override auditado.
- vehicle blockedTenant se rechaza salvo override auditado.
- check-in manual requiere razón y permiso.
- check-in crea AccessEvent.
- check-in crea AccessCheckIn open.
- check-in se audita.
```

---

### 16.2. Check-out

Reglas:

```text id="acv-checkout-rules"
- checkedOutAt es server-side.
- checkedOutByUserId es server-side.
- checkInId debe ser tenant-scoped.
- checkIn debe estar open.
- gateId debe ser tenant-scoped.
- gate debe permitir salida.
- no debe existir doble check-out activo.
- salida manual sin checkIn requiere razón y permiso.
- check-out crea AccessEvent.
- check-out crea AccessCheckOut.
- check-out cierra AccessCheckIn.
- check-out se audita.
```

---

### 16.3. Eventos críticos

Prohibido:

```text id="acv-event-forbidden"
- borrar físicamente AccessEvent;
- borrar físicamente AccessCheckIn;
- borrar físicamente AccessCheckOut;
- sobrescribir actor original;
- sobrescribir timestamp original sin corrección auditada;
- corregir sin reason;
- anular sin reason.
```

Permitido:

```text id="acv-event-allowed"
- correct con razón;
- void con razón;
- archive lógico;
- metadata sanitizada;
- audit obligatorio.
```

---

## 17. Seguridad documental

### 17.1. Secure Document Storage

Regla:

```text id="acv-sds-rule"
Access Control and Visitors nunca almacena, acepta ni devuelve storageKey; solo referencia secureDocumentId validado contra el tenant.
```

---

### 17.2. Documentos permitidos

```text id="acv-docs-allowed"
- soporte administrativo;
- soporte de incidente;
- soporte de entrega;
- soporte de visita de proveedor;
- reporte exportado;
- evidencia operativa permitida por política.
```

---

### 17.3. Prohibido

```text id="acv-docs-forbidden"
- storageKey;
- signedUrl persistente;
- base64;
- rawFilePayload;
- binarios en JSON;
- fullDocumentImage como campo directo;
- documentos reales enviados a IA externa;
- documentos de identidad como requisito general sin justificación.
```

---

### 17.4. Descarga

Reglas:

```text id="acv-doc-download-rules"
- Descarga se delega a SDS.
- Descarga requiere permiso.
- Descarga requiere tenant validation.
- Descarga sensible se audita.
- signedUrl temporal solo si SDS lo gestiona.
- signedUrl temporal no debe persistirse.
```

---

## 18. Seguridad de reportes y exportaciones

### 18.1. Reportes

Reglas:

```text id="acv-report-security-rules"
- Todos los reportes son tenant-scoped.
- Todos los reportes requieren permisos accessReports.*.
- Todos los reportes tienen paginación.
- pageSize máximo = 100.
- dateFrom/dateTo deben validarse.
- Datos sensibles se enmascaran.
- Hashes no se devuelven.
- Notas internas se excluyen salvo permiso explícito.
```

---

### 18.2. Exportaciones

Reglas:

```text id="acv-export-security-rules"
- Export requiere accessReports.exports.
- Export genera AccessReportExport.
- Export genera SecureDocument.
- Export no contiene identification raw.
- Export no contiene phone raw.
- Export no contiene plate raw.
- Export no contiene passCode raw.
- Export no contiene hashes.
- Export no contiene storageKey.
- Export se audita.
```

---

### 18.3. Filtros sanitizados

Los filtros almacenados en `access_report_exports.filters` no deben contener:

```text id="acv-export-filter-forbidden"
identificationNumberRaw
phoneRaw
emailRaw
plateRaw
passCodeRaw
hashes sensibles
storageKey
signedUrl
tokens
secrets
raw payload
```

---

## 19. No public endpoints

No implementar:

```text id="acv-no-public-endpoints"
GET    /api/v1/public/access-visitors
GET    /api/v1/public/access-visitor-vehicles
GET    /api/v1/public/access-authorizations
GET    /api/v1/public/access-passes
GET    /api/v1/public/access-events
GET    /api/v1/public/access-check-ins
GET    /api/v1/public/access-check-outs
POST   /api/v1/public/access-check-ins
POST   /api/v1/public/access-check-outs
GET    /api/v1/public/tenants/{slug}/access-visitors
GET    /api/v1/public/tenants/{slug}/access-events
GET    /api/v1/public/tenants/{slug}/access-reports/*
```

Respuesta esperada:

```http id="acv-no-public-response"
404 Not Found
```

No usar:

```http id="acv-no-public-forbidden-response"
403 Forbidden
```

si eso revela que el endpoint o recurso existe.

---

## 20. No WordPress access

WordPress es capa pública informativa y no debe consultar información de accesos.

Prohibido para WordPress público:

```text id="acv-wordpress-forbidden"
- listar visitantes;
- listar vehículos;
- consultar autorizaciones;
- validar pases;
- registrar check-in;
- registrar check-out;
- consultar eventos;
- consultar incidentes;
- consultar reportes;
- descargar documentos de acceso;
- exportar reportes.
```

Controles:

```text id="acv-wordpress-controls"
- No exponer endpoints públicos.
- CORS sin wildcard.
- CORS no permite dominio público WordPress para rutas privadas.
- No usar cookies WordPress como sesión Core.
- No guardar tokens Core en WordPress público.
- No exponer access data por shortcode o template.
```

---

## 21. No biometrics, no facial recognition, no OCR

### 21.1. Biometría prohibida

Prohibido:

```text id="acv-biometric-forbidden"
biometricTemplate
fingerprintTemplate
irisTemplate
voicePrint
palmPrint
gaitSignature
```

---

### 21.2. Reconocimiento facial prohibido

Prohibido:

```text id="acv-face-forbidden"
faceEmbedding
faceRecognitionResult
faceMatchScore
faceTemplate
faceVector
cameraFrameForFaceRecognition
```

---

### 21.3. OCR automático de placas prohibido

Prohibido:

```text id="acv-ocr-forbidden"
plateOcrPayload
automaticPlateRecognition
cameraFrame
ocrConfidence
plateRecognitionResult
```

---

### 21.4. Controles

```text id="acv-biometric-controls"
- DTO denylist.
- DB schema sin campos biométricos.
- OpenAPI sin campos biométricos.
- Feature flags false.
- CI gates.
- Tests no biometrics.
- Tests no face recognition.
- Tests no plate OCR.
```

---

## 22. No gate opening / no hardware control

El módulo no debe abrir puertas ni controlar hardware físico en MVP.

Prohibido:

```text id="acv-hardware-forbidden"
gateOpenCommand
hardwareDeviceCommand
openGate
closeGate
unlockDoor
lockDoor
barrierCommand
turnstileCommand
cameraStreamUrl
deviceSecret
rfidCommand
nfcCommand
```

Controles:

```text id="acv-hardware-controls"
- DB schema sin campos de comando.
- DTO denylist.
- OpenAPI sin comandos.
- Services sin adapters de hardware.
- Feature flags false.
- Boot falla si flags prohibidos true.
- CI gate no hardware.
```

---

## 23. No financial side effects

Access Control no debe crear ni modificar información financiera.

Prohibido:

```text id="acv-financial-forbidden"
Payment
PaymentAllocation
PaymentReversal
SupplierPayable
SupplierPaymentOrder
SupplierPaymentEvidence
JournalEntry
JournalEntryLine
BankTransaction
ReconciliationMatch
ReconciliationSession confirmation
```

Aplicaciones:

```text id="acv-financial-applications"
- Una visita de proveedor no crea cuenta por pagar.
- Una entrega no crea pago.
- Un parqueo visitante no genera cargo automático en MVP.
- Un check-in no crea asiento contable.
- Un check-out no confirma conciliación.
```

Controles:

```text id="acv-financial-controls"
- Puertos de Supplier Payments solo validate/get summary.
- Puertos de Maintenance solo validate/get summary.
- No adapters de Payment creation.
- No adapters de Accounting write.
- No adapters de Bank Reconciliation write.
- Boundary tests obligatorios.
```

---

## 24. No external AI with real data

Prohibido enviar a IA externa:

```text id="acv-ai-forbidden"
- visitantes reales;
- identificaciones reales;
- teléfonos reales;
- emails reales;
- placas reales;
- eventos reales;
- autorizaciones reales;
- incidentes reales;
- comentarios reales;
- documentos reales;
- reportes reales;
- exports reales;
- patrones de ingreso/salida reales.
```

Permitido:

```text id="acv-ai-allowed"
- datos ficticios;
- datos sintéticos;
- documentación técnica;
- ejemplos sin PII;
- pruebas con fixtures no reales;
- reportes anonimizados irreversiblemente si existe aprobación explícita futura.
```

Controles:

```text id="acv-ai-controls"
- ACCESS_CONTROL_EXTERNAL_AI_ENABLED=false.
- NoExternalAiAccessDataPolicy.
- No adapters a IA externa.
- CI gate.
- Audit de cualquier futura excepción con ADR.
```

---

## 25. Seguridad de logs

### 25.1. Campos permitidos

```text id="acv-log-allowed"
traceId
requestId
correlationId
action
outcome
eventType
authorizationType
visitorType
gateType
incidentSeverity
reportType
durationMs
errorCode
```

---

### 25.2. Campos prohibidos

```text id="acv-log-forbidden"
tenantId como label de alta cardinalidad
visitorId como label de métrica
vehicleId como label de métrica
propertyUnitId como label de métrica
personId como label de métrica
identificationNumberRaw
phoneRaw
emailRaw
plateRaw
accessPassCodeRaw
hashes sensibles
storageKey
signedUrl
base64
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
raw payload
authorization header
cookie
```

---

### 25.3. Error handling

Reglas:

```text id="acv-error-handling"
- No devolver stack trace productivo.
- No devolver SQL raw.
- No devolver detalles de existencia cross-tenant.
- No devolver valores raw sensibles.
- Usar códigos de error controlados.
- Incluir traceId.
```

---

## 26. Auditoría

### 26.1. Eventos obligatorios

```text id="acv-audit-events"
accessVisitor.created
accessVisitor.updated
accessVisitor.watchlisted
accessVisitor.blocked
accessVisitor.archived

accessVehicle.created
accessVehicle.updated
accessVehicle.watchlisted
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
accessPass.validated
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
accessDelivery.cancelled

accessSupplierVisit.created
accessSupplierVisit.checkedIn
accessSupplierVisit.checkedOut
accessSupplierVisit.cancelled
accessSupplierVisit.denied

accessIncident.created
accessIncident.updated
accessIncident.resolved
accessIncident.dismissed

accessComment.created
accessComment.archived

accessDocument.created
accessDocument.downloaded
accessDocument.archived

accessReport.generated
accessReport.exported
```

---

### 26.2. Metadata permitida

```text id="acv-audit-metadata-allowed"
visitorId
vehicleId
authorizationId
accessPassId
eventId
checkInId
checkOutId
deliveryId
supplierVisitId
incidentId
commentId
documentId
reportExportId
propertyUnitId
gateId
visitorType
authorizationType
eventType
eventStatus
incidentSeverity
incidentStatus
supplierId
maintenanceWorkOrderId
reportType
format
traceId
```

---

### 26.3. Reglas de auditoría

```text id="acv-audit-rules"
- Audit debe registrar actor server-side.
- Audit debe registrar tenantId.
- Audit debe registrar resourceType.
- Audit debe registrar resourceId.
- Audit debe registrar outcome.
- Audit debe registrar traceId.
- Audit no debe registrar PII raw.
- Audit no debe registrar hashes sensibles.
- Audit no debe registrar storageKey.
- Audit no debe registrar base64.
- Audit no debe registrar comandos de hardware.
```

---

## 27. Observabilidad y métricas

### 27.1. Métricas permitidas

```text id="acv-metrics"
access_authorizations_total
access_authorizations_active_total
access_pass_validations_total
access_checkins_total
access_checkouts_total
access_denied_total
access_open_checkins_total
access_incidents_total
access_reports_exported_total
```

---

### 27.2. Labels permitidos

```text id="acv-metric-labels-allowed"
eventType
authorizationType
visitorType
gateType
incidentSeverity
status
outcome
reportType
```

---

### 27.3. Labels prohibidos

```text id="acv-metric-labels-forbidden"
tenantId
visitorId
vehicleId
propertyUnitId
personId
identificationNumber
phone
email
plate
accessPassCode
traceId
requestId
```

---

## 28. Rate limiting

### 28.1. Rutas con rate limit reforzado

```text id="acv-rate-limited-routes"
POST /api/v1/tenant/access-passes/validate
POST /api/v1/tenant/guard/access-passes/validate
POST /api/v1/tenant/access-check-ins
POST /api/v1/tenant/access-check-outs
POST /api/v1/tenant/guard/access-check-ins
POST /api/v1/tenant/guard/access-check-outs
POST /api/v1/me/access-authorizations
GET  /api/v1/tenant/access-reports/export
```

---

### 28.2. Objetivos

```text id="acv-rate-limit-objectives"
- Evitar enumeración de pases.
- Evitar abuso de operaciones de garita.
- Evitar generación masiva de autorizaciones.
- Evitar exportación masiva de datos personales.
- Evitar presión sobre reportes.
```

---

### 28.3. Respuesta

```http id="acv-rate-limit-response"
429 Too Many Requests
```

Respuesta JSON:

```json id="acv-rate-limit-json"
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests.",
    "details": {},
    "traceId": "trace-id"
  }
}
```

---

## 29. CORS y headers

### 29.1. CORS

Reglas:

```text id="acv-cors-rules"
- No wildcard.
- No permitir WordPress público para rutas access-*.
- Permitir solo frontend autenticado de administración/residentes si aplica.
- Orígenes explícitos por ambiente.
- Credentials solo si está justificado.
- Métodos limitados por endpoint.
```

---

### 29.2. Headers obligatorios

```http id="acv-security-headers"
Cache-Control: no-store
Pragma: no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

Recomendados:

```http id="acv-security-headers-recommended"
Content-Security-Policy: default-src 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

---

## 30. Seguridad de OpenAPI

OpenAPI debe incluir:

```yaml id="acv-openapi-required"
x-tenant-scope: true
x-auth-required: true
x-access-control-visitors: true
x-public-exposure: false
x-wordpress-access: false
x-biometric-processing: false
x-face-recognition: false
x-gate-opening: false
x-hardware-control: false
x-plate-ocr: false
x-external-ai-real-data: false
```

Para `/me`:

```yaml id="acv-openapi-me"
x-own-resource-scope: true
x-resident-visible: true
x-admin-only: false
```

Para Guard API:

```yaml id="acv-openapi-guard"
x-guard-operated: true
x-public-exposure: false
```

Para documentos:

```yaml id="acv-openapi-docs"
x-secure-document-storage: true
x-storage-key-exposed: false
```

OpenAPI no debe documentar:

```text id="acv-openapi-forbidden"
tenantId en DTOs externos
actor fields
status directo fuera de transición
hashes sensibles
storageKey
signedUrl persistente
base64
rawFilePayload
biometricTemplate
faceEmbedding
cameraStreamUrl
gateOpenCommand
hardwareDeviceCommand
externalAiEnabled
/api/v1/public/access-*
```

---

## 31. Validaciones por caso de uso

### 31.1. Crear visitante

```text id="acv-sec-create-visitor"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] Rechazar tenantId.
[ ] Rechazar actor fields.
[ ] Sanitizar fullName.
[ ] Normalizar identificación si existe.
[ ] Enmascarar identificación.
[ ] Hashear identificación.
[ ] Normalizar teléfono si existe.
[ ] Enmascarar teléfono.
[ ] Hashear teléfono.
[ ] No persistir raw.
[ ] No devolver hash.
[ ] Auditar accessVisitor.created.
```

---

### 31.2. Crear autorización `/me`

```text id="acv-sec-create-own-authorization"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] OwnResourceGuard.
[ ] Validar unidad propia.
[ ] Rechazar unidad ajena con 404.
[ ] Validar visitorId tenant-scoped.
[ ] Validar vehicleId tenant-scoped.
[ ] Rechazar authorizationScope administrative.
[ ] Validar vigencia.
[ ] Rechazar visitor blockedTenant.
[ ] Generar authorizationNumber server-side.
[ ] Generar pass si aplica.
[ ] No devolver passCodeHash.
[ ] Auditar accessAuthorization.created.
```

---

### 31.3. Validar pase

```text id="acv-sec-validate-pass"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard o GuardOperationGuard.
[ ] Rate limit.
[ ] passCode raw solo temporal.
[ ] Normalizar passCode.
[ ] HMAC tenant-aware.
[ ] No loggear raw.
[ ] No loggear hash.
[ ] Respuesta inválida no revela cross-tenant.
[ ] Auditar accessPass.validated.
```

---

### 31.4. Registrar check-in

```text id="acv-sec-checkin"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] GuardOperationGuard si ruta guard.
[ ] Validar gate tenant-scoped.
[ ] Validar gate active.
[ ] Validar gate isEntryAllowed.
[ ] Validar authorization active/vigente si existe.
[ ] Validar pass active/vigente si existe.
[ ] Rechazar pass used.
[ ] Rechazar visitor blocked salvo override.
[ ] Crear AccessEvent.
[ ] Crear AccessCheckIn.
[ ] Marcar pass used si aplica.
[ ] Incrementar entriesUsed.
[ ] Transacción.
[ ] Auditar accessCheckIn.recorded.
```

---

### 31.5. Registrar check-out

```text id="acv-sec-checkout"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard.
[ ] GuardOperationGuard si ruta guard.
[ ] Validar checkIn tenant-scoped.
[ ] Validar checkIn open.
[ ] Validar gate tenant-scoped.
[ ] Validar gate active.
[ ] Validar gate isExitAllowed.
[ ] Rechazar check-out duplicado.
[ ] Crear AccessEvent.
[ ] Crear AccessCheckOut.
[ ] Cerrar AccessCheckIn.
[ ] Transacción.
[ ] Auditar accessCheckOut.recorded.
```

---

### 31.6. Exportar reporte

```text id="acv-sec-export-report"
[ ] AuthGuard.
[ ] TenantGuard.
[ ] PermissionGuard accessReports.exports.
[ ] Validar filtros.
[ ] Sanitizar filtros.
[ ] Aplicar tenantId en query.
[ ] Enmascarar datos.
[ ] Excluir hashes.
[ ] Crear AccessReportExport.
[ ] Crear SecureDocument.
[ ] No devolver storageKey.
[ ] Auditar accessReport.exported.
```

---

## 32. Reglas de retención y archivo lógico

### 32.1. Eventos críticos

```text id="acv-retention-critical"
AccessEvent
AccessCheckIn
AccessCheckOut
AccessAuthorization
AccessPass
AccessIncident
AccessReportExport
```

Reglas:

```text id="acv-retention-rules"
- No physical delete ordinario.
- Usar archive lógico.
- Usar void/correct para errores.
- Mantener audit.
- Aplicar política de retención definida por tenant/plataforma.
```

---

### 32.2. Visitantes y vehículos

Reglas:

```text id="acv-retention-visitors"
- VisitorProfile puede archivarse lógicamente.
- VisitorVehicle puede archivarse lógicamente.
- El archivo no debe romper historial de eventos.
- La minimización futura puede anonimizar datos según política legal/operativa.
```

---

## 33. Incidentes de seguridad

### 33.1. Eventos que deben generar alerta interna

```text id="acv-security-alert-events"
- múltiples pass validations fallidas;
- intento de usar pass de otro tenant;
- intento de check-in con autorización revocada;
- intento de acceso cross-tenant;
- intento de enviar biometricTemplate;
- intento de enviar faceEmbedding;
- intento de enviar gateOpenCommand;
- intento de enviar storageKey;
- exportaciones masivas frecuentes;
- guardia operando fuera de patrón esperado;
- múltiples deniedAccess críticos;
- incident critical.
```

---

### 33.2. Respuesta operativa

```text id="acv-incident-response"
[ ] Registrar audit event.
[ ] Registrar log sanitizado.
[ ] Incrementar métrica.
[ ] Notificar SecurityManager si aplica.
[ ] No exponer datos sensibles en alerta.
[ ] No bloquear servicio completo salvo ataque activo.
```

---

## 34. Feature flags de seguridad

```text id="acv-security-flags"
ACCESS_CONTROL_VISITORS_ENABLED=true
ACCESS_CONTROL_ME_AUTHORIZATIONS_ENABLED=true
ACCESS_CONTROL_GUARD_API_ENABLED=true
ACCESS_CONTROL_PUBLIC_ENDPOINTS_ENABLED=false
ACCESS_CONTROL_WORDPRESS_ACCESS_ENABLED=false
ACCESS_CONTROL_GATE_OPENING_ENABLED=false
ACCESS_CONTROL_HARDWARE_CONTROL_ENABLED=false
ACCESS_CONTROL_FACE_RECOGNITION_ENABLED=false
ACCESS_CONTROL_BIOMETRIC_PROCESSING_ENABLED=false
ACCESS_CONTROL_PLATE_OCR_ENABLED=false
ACCESS_CONTROL_EXTERNAL_AI_ENABLED=false
ACCESS_CONTROL_REPORT_EXPORT_ENABLED=true
ACCESS_CONTROL_NOTIFICATIONS_ENABLED=true
ACCESS_CONTROL_SUPPLIER_VISITS_ENABLED=true
ACCESS_CONTROL_MAINTENANCE_LINK_ENABLED=true
```

Regla:

```text id="acv-security-flags-rule"
El boot debe fallar en MVP si se habilita cualquier flag de endpoints públicos, WordPress access, gate opening, hardware control, face recognition, biometric processing, plate OCR o external AI sin ADR explícito y controles aprobados.
```

---

## 35. CI security gates

El pipeline debe fallar si:

```text id="acv-ci-sec-gates"
[ ] Algún DTO acepta tenantId.
[ ] Algún DTO acepta actor fields.
[ ] Algún DTO acepta status directo fuera de endpoint de transición.
[ ] Algún DTO acepta authorizationNumber.
[ ] Algún DTO acepta eventNumber.
[ ] Algún DTO acepta identificationNumberHash.
[ ] Algún DTO acepta plateHash.
[ ] Algún DTO acepta passCodeHash.
[ ] Algún DTO acepta storageKey.
[ ] Algún DTO acepta signedUrl.
[ ] Algún DTO acepta base64.
[ ] Algún DTO acepta rawFilePayload.
[ ] Algún DTO acepta biometricTemplate.
[ ] Algún DTO acepta faceEmbedding.
[ ] Algún DTO acepta cameraStreamUrl.
[ ] Algún DTO acepta gateOpenCommand.
[ ] Algún DTO acepta hardwareDeviceCommand.
[ ] Algún DTO acepta externalAiEnabled.
[ ] API permite visitor cross-tenant.
[ ] API permite vehicle cross-tenant.
[ ] API permite authorization cross-tenant.
[ ] API permite pass cross-tenant.
[ ] API permite event cross-tenant.
[ ] API permite check-in cross-tenant.
[ ] API permite check-out cross-tenant.
[ ] API permite report cross-tenant.
[ ] Resident puede ver unidad ajena.
[ ] Guard puede operar tenant ajeno.
[ ] Response expone identification raw.
[ ] Response expone phone raw.
[ ] Response expone plate raw.
[ ] Response expone passCode raw persistente.
[ ] Response expone hashes sensibles.
[ ] Response expone storageKey.
[ ] Logs contienen raw PII.
[ ] Audit contiene raw PII.
[ ] API crea endpoint público.
[ ] API permite WordPress público.
[ ] API implementa gate opening.
[ ] API implementa biometric processing.
[ ] API implementa face recognition.
[ ] API implementa plate OCR.
[ ] API llama IA externa con datos reales.
[ ] API crea Payment.
[ ] API crea SupplierPaymentOrder.
[ ] API crea JournalEntry.
```

---

## 36. Checklist de revisión de seguridad

```text id="acv-security-review-checklist"
[ ] Todas las tablas operativas tienen tenant_id.
[ ] Todas las consultas usan tenantId.
[ ] Cross-tenant responde 404.
[ ] AuthGuard está aplicado.
[ ] TenantGuard está aplicado.
[ ] PermissionGuard está aplicado.
[ ] OwnResourceGuard está aplicado en /me.
[ ] GuardOperationGuard está aplicado en Guard API.
[ ] DTOs usan whitelist y forbidNonWhitelisted.
[ ] No hay spread directo de req.body hacia Prisma.
[ ] No se acepta tenantId desde cliente.
[ ] No se acepta actor desde cliente.
[ ] No se acepta status directo fuera de transición.
[ ] No se acepta authorizationNumber/eventNumber desde cliente.
[ ] No se expone identification raw.
[ ] No se expone phone raw.
[ ] No se expone email raw.
[ ] No se expone plate raw.
[ ] No se expone passCode raw persistente.
[ ] No se exponen hashes sensibles.
[ ] No se expone storageKey.
[ ] No se expone signedUrl persistente.
[ ] No se acepta base64.
[ ] No se acepta rawFilePayload.
[ ] No hay endpoints públicos.
[ ] No hay acceso WordPress público.
[ ] No hay biometría.
[ ] No hay reconocimiento facial.
[ ] No hay OCR automático de placas.
[ ] No hay apertura de portones.
[ ] No hay control de hardware.
[ ] No hay pagos.
[ ] No hay contabilidad.
[ ] No hay conciliación bancaria.
[ ] No hay IA externa con datos reales.
[ ] Audit está completo.
[ ] Logs están sanitizados.
[ ] Metrics no tienen labels sensibles.
[ ] OpenAPI no documenta campos prohibidos.
[ ] Rate limit está aplicado en rutas críticas.
[ ] Headers de seguridad están presentes.
[ ] CORS no usa wildcard.
```

---

## 37. Riesgos residuales

| Riesgo residual                                       |      Nivel | Mitigación                                          |
| ----------------------------------------------------- | ---------: | --------------------------------------------------- |
| Guardia registra datos falsos                         |      Medio | Audit, actor server-side, reportes, supervisión     |
| Residente preautoriza visitante indebido              |      Medio | Políticas tenant, cancelación, historial            |
| Datos personales en comentarios manuales              | Medio/Alto | Sanitización, capacitación, audit, revisión         |
| Exportación legítima mal compartida fuera del sistema |       Alto | SDS, permisos, audit, marca de clasificación futura |
| Uso compartido de códigos por residentes              |      Medio | TTL, oneTime, revocación, audit                     |
| Omisión de check-out por operación real               |      Medio | Reporte openCheckIns, alertas futuras               |
| Error humano en gate                                  |      Medio | Guard API simple, validaciones, audit               |
| Robo de token de usuario                              |       Alto | Keycloak, expiración, MFA futuro, monitoreo         |
| Compromiso de cuenta guardia                          |       Alto | permisos mínimos, audit, detección de anomalías     |
| Configuración CORS incorrecta                         |       Alto | CI gate, revisión security, pruebas no WordPress    |

---

## 38. Recomendaciones futuras

Estas capacidades requieren ADR, análisis legal, threat modeling y controles adicionales antes de implementarse:

```text id="acv-future-security"
- integración con hardware de portones;
- integración con lectores QR físicos;
- integración con cámaras CCTV;
- OCR automático de placas;
- reconocimiento facial;
- biometría;
- app móvil offline para guardias;
- portal externo para proveedores;
- credenciales NFC/RFID;
- verificación externa de identidad;
- listas de bloqueo compartidas;
- IA para detección de anomalías;
- analítica avanzada de patrones de acceso;
- retención/anonymization avanzada.
```

Regla:

```text id="acv-future-rule"
Ninguna capacidad futura de hardware, biometría, reconocimiento facial, OCR, IA o listas compartidas debe activarse como extensión menor del MVP; requiere ADR, especificación, modelo de amenazas, DPIA/PIA si aplica, pruebas y aprobación explícita.
```

---

## 39. Criterios de aceptación de seguridad

```text id="acv-security-acceptance"
[ ] Todas las rutas permitidas requieren autenticación.
[ ] Todas las rutas tenant requieren TenantGuard.
[ ] Todas las rutas aplican permisos.
[ ] Guard API no es pública.
[ ] Guard API requiere GuardOperationGuard.
[ ] /me API aplica OwnResourceGuard.
[ ] Resident solo ve recursos propios.
[ ] Resident no ve unidad ajena.
[ ] Guard no opera tenant ajeno.
[ ] PlatformAdmin no accede automáticamente.
[ ] Cross-tenant responde 404.
[ ] DTOs rechazan tenantId.
[ ] DTOs rechazan actor fields.
[ ] DTOs rechazan status directo fuera de transición.
[ ] DTOs rechazan hashes sensibles.
[ ] DTOs rechazan storageKey.
[ ] DTOs rechazan base64.
[ ] DTOs rechazan biometricTemplate.
[ ] DTOs rechazan faceEmbedding.
[ ] DTOs rechazan gateOpenCommand.
[ ] Responses no exponen identification raw.
[ ] Responses no exponen phone raw.
[ ] Responses no exponen plate raw.
[ ] Responses no exponen passCode raw persistente.
[ ] Responses no exponen hashes sensibles.
[ ] Responses no exponen storageKey.
[ ] Logs no contienen PII raw.
[ ] Audit no contiene PII raw.
[ ] OpenAPI no documenta campos prohibidos.
[ ] No existen endpoints públicos.
[ ] WordPress público no accede.
[ ] No hay biometría.
[ ] No hay reconocimiento facial.
[ ] No hay OCR automático de placas.
[ ] No hay apertura de portones.
[ ] No hay control de hardware.
[ ] No hay pagos.
[ ] No hay contabilidad.
[ ] No hay conciliación bancaria.
[ ] No hay IA externa con datos reales.
[ ] CI security gates pasan.
```

---

## 40. No aceptación de seguridad

No se acepta el módulo si:

```text id="acv-security-no-acceptance"
- permite visitor cross-tenant;
- permite vehicle cross-tenant;
- permite gate cross-tenant;
- permite authorization cross-tenant;
- permite pass cross-tenant;
- permite event cross-tenant;
- permite check-in cross-tenant;
- permite check-out cross-tenant;
- permite delivery cross-tenant;
- permite supplier visit cross-tenant;
- permite recurring authorization cross-tenant;
- permite incident cross-tenant;
- permite comment cross-tenant;
- permite document cross-tenant;
- permite report cross-tenant;
- acepta tenantId desde cliente;
- acepta actor fields desde cliente;
- acepta status directo fuera de transición;
- acepta números operativos desde cliente;
- acepta identificationNumberHash desde cliente;
- acepta phoneHash desde cliente;
- acepta emailHash desde cliente;
- acepta plateHash desde cliente;
- acepta passCodeHash desde cliente;
- expone identificationNumber raw por defecto;
- expone phone raw por defecto;
- expone email raw por defecto;
- expone plate raw por defecto;
- expone passCode raw persistente;
- expone hashes sensibles;
- acepta storageKey;
- devuelve storageKey;
- acepta signedUrl persistente;
- acepta base64;
- acepta rawFilePayload;
- acepta biometricTemplate;
- acepta faceEmbedding;
- acepta cameraStreamUrl;
- acepta gateOpenCommand;
- acepta hardwareDeviceCommand;
- implementa reconocimiento facial;
- implementa biometría;
- implementa OCR automático de placas;
- implementa apertura automática de portones;
- implementa control físico de hardware;
- crea endpoints públicos;
- permite acceso desde WordPress público;
- permite que residente vea unidad ajena;
- permite que guardia opere tenant ajeno;
- permite reutilizar AccessPass oneTime;
- permite check-out doble activo;
- permite borrar físicamente eventos críticos;
- omite audit de check-in;
- omite audit de check-out;
- omite audit de cancelación/revocación;
- exporta reportes sin SDS;
- crea Payment;
- crea SupplierPaymentOrder;
- crea JournalEntry;
- modifica Accounting Ledger;
- confirma Bank Reconciliation;
- modifica estado de Maintenance Work Orders;
- crea costos de mantenimiento;
- envía datos reales a IA externa.
```

---

## 41. Resultado esperado

Al aplicar estas notas de seguridad, el módulo `024-access-control-visitors` quedará protegido contra exposición pública, acceso cross-tenant, filtración de datos personales, abuso de pases temporales, manipulación de eventos de acceso, comandos indebidos de hardware, uso indebido de biometría, acceso desde WordPress público, efectos financieros no autorizados y uso de IA externa con datos reales.

Resultado esperado:

```text id="acv-security-expected-result"
tenant isolation protegido
auth obligatorio protegido
authorization por permisos protegida
/me own-resource protegido
Guard API protegida
visitor privacy protegida
vehicle privacy protegida
access pass protegido
check-in protegido
check-out protegido
events auditables protegidos
reports protegidos
exports protegidos vía SDS
documents protegidos vía SDS
storageKey no expuesto
PII raw no expuesta
hashes no expuestos
logs sanitizados
audit sanitizada
OpenAPI seguro
CORS seguro
headers seguros
no public endpoints
no WordPress access
no biometric processing
no face recognition
no plate OCR
no gate opening
no hardware control
no payment side effects
no accounting side effects
no bank reconciliation side effects
no external AI with real data
CI security gates definidos
security review checklist definido
```

---

## 42. Expediente actualizado

```text id="acv-security-expediente"
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
│   │       ├── data-model.md
│   │       ├── api-contract.md
│   │       ├── test-plan.md
│   │       ├── tasks.md
│   │       └── security-notes.md
```

---

## 43. Cierre del paquete 024

Con este documento queda completo el paquete SDD del módulo:

```text id="acv-package-complete"
docs/specs/024-access-control-visitors/
├── spec.md
├── plan.md
├── data-model.md
├── api-contract.md
├── test-plan.md
├── tasks.md
└── security-notes.md
```
